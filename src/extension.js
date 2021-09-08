import cities from './cities';
import fetch from 'node-fetch';
import { chain, map } from 'underscore';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const vscode = require('vscode');
const player = require('play-sound')({})

/** MAIN FUNCTION */

const baseUrl = 'https://raw.githubusercontent.com'
  + '/lakuapik/jadwalsholatorg/master';

const audios = [
  'sheikh_abdul_karim_omar_fatani_al_makki_adzan.mp3',
  'sheikh_abdul_karim_omar_fatani_al_makki_adzan_fajr.mp3',
];

const today_UK = new Date().toLocaleDateString('UK');
const year = today_UK.substr(6, 4);
const month = today_UK.substr(3, 2);
const day = today_UK.substr(0, 2);
const today = `${year}-${month}-${day}`;

let globalState, storagePath, summaryStatusBar,
  audioPlayer, audioPlayerStatusBar;

const city = () => config('kota');

async function selectCity() {
  const placeHolder = `Kota terpilih: ${city()}.
    Jadwal waktu sholat mengikuti kota yang dipilih.`;
  return vscode.window.showQuickPick(cities, { placeHolder: placeHolder })
    .then((value) => {
      if (value === undefined) return;
      config('kota', value);
      updateSchedule();
    });
}

function getScheduleFilePath() {
  return `${storagePath}/schedules/${city()}-${year}-${month}.json`;
}

function getSchedule() {
  try {
    return JSON.parse(readFileSync(getScheduleFilePath()).toString());
  } catch (error) {
    vscode.window.showInformationMessage(
      `== Ekstensi Waktu Sholat ==
        \njadwal sholat bulan ini tidak ada, lakukan pembaruan?
        \n*pembaruan memerlukan koneksi internet.
        \nkota terpilih saat ini: ${city()}`,
      { modal: true },
      { title: 'Update', action: 1 },
    ).then(button => {
      if (button === undefined) return;
      if (button.action == 1) updateSchedule();
    });
  }
}

function getTodaySchedule() {
  return chain(getSchedule())
    .findWhere({ tanggal: today })
    .omit('tanggal')
    .map((time, adzan) => ({
      time: time,
      adzan: adzan,
      timestamp: new Date(`${today} ${time}`).getTime(),
    }))
    .sortBy('timestamp')
    .value();
}

function updateSchedule() {
  vscode.window.withProgress({
    cancellable: true,
    location: vscode.ProgressLocation.Notification,
    title: `Waktu Sholat: pembaruan jadwal kota ${city()}...`,
  }, async () => {
    const url = `${baseUrl}/adzan/${city()}/${year}/${month}.json`;
    return fetch(url).then(res => res.text()).then(content => {
      writeFileSync(getScheduleFilePath(), content);
      updateSummaryStatusBar();
    });
  });
}

function setSummaryStatusBar(text, tooltip) {
  summaryStatusBar.text = text;
  summaryStatusBar.tooltip = tooltip;
  summaryStatusBar.show();
}

function updateSummaryStatusBar() {
  const schedule = getTodaySchedule();

  // no schedule
  if (schedule === undefined) {
    setSummaryStatusBar('🕌', `Jadwal kosong, silahkan lakukan pembaruan.`);
    return;
  }

  currentAdzan = chain(schedule)
    .filter(sch => {
      const fiveMinute = (5 * 60 * 1000);
      return sch.timestamp > now() - fiveMinute && sch.timestamp <= now();
    }).first().value();

  nextAdzan = chain(schedule)
    .filter(sch => sch.timestamp >= now())
    .first().value();

  // its time for current adzan
  if (currentAdzan !== undefined) {
    setSummaryStatusBar(
      `🕌 WAKTUNYA ${(currentAdzan.adzan).toUpperCase()}`,
      `Selamat menunaikan ${capitalize(currentAdzan.adzan)}`
    );

    if (diffNowInMinutes(currentAdzan.timestamp) === 0) {
      vscode.window.showInformationMessage(`
        Waktu ${capitalize(currentAdzan.adzan)}
        pukul ${currentAdzan.time} telah tiba!
      `);
    }

    const playableAdzans = ['shubuh', 'dzuhur', 'ashr', 'magrib', 'isya'];
    if (playableAdzans.includes(currentAdzan.adzan)) {
      playAudio(currentAdzan.adzan);
    }

    return;
  }

  // no more next adzan
  if (nextAdzan === undefined) {
    setSummaryStatusBar('🕌 Isya', 'Sudah isya belum? lengkapi 5 waktumu');
    return;
  }

  // normal, there are next adzan
  setSummaryStatusBar(
    `🕌 ${capitalize(nextAdzan.adzan)} ${nextAdzan.time}`,
    `${capitalize(nextAdzan.adzan)} ${diffNowForHumans(nextAdzan.timestamp)}`
  );

  // next adzan in 5 minute
  if (diffNowInMinutes(nextAdzan.timestamp) === 5) {
    vscode.window.showInformationMessage(`
      PERHATIAN: ${capitalize(nextAdzan.adzan)}
      ${diffNowForHumans(nextAdzan.timestamp)}
    `);
  }
}

function showSummaryStatusBarInfo() {
  vscode.window.showInformationMessage(summaryStatusBar._tooltip);
}

async function downloadAudio() {
  const promises = map(audios, (path) => {
    const url = `${baseUrl}/adzan-mp3/${path}`;
    const storePath = `${storagePath}/audios/${path}`;

    if (existsSync(storePath)) return;

    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Waktu Sholat: mengunduh audio ${path}...`,
    }, async () => {
      return fetch(url).then(res => res.buffer()).then((buffer) => {
        writeFileSync(storePath, buffer);
      });
    });
  }).values();

  return Promise.all(promises);
}

async function playAudio(adzan, isFajr = false) {
  if (! config('suara-adzan-aktif')) return;

  const playKey = `waktusholat.${today}.${adzan}.play-audio`;

  if (globalState.get(playKey) === true) return;

  const path = isFajr ? audios[1] : audios[0];
  const file = `${storagePath}/audios/${path}`;

  if (!existsSync(file)) { await downloadAudio() };

  audioPlayer = player.play(file, (err, opts, next) => {
    next = stopAudioPlayer();
  });

  globalState.update(playKey, true);

  audioPlayerStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left, -9999
  );
  audioPlayerStatusBar.text = 'Adzan berkumandang...';
  audioPlayerStatusBar.tooltip = '[x] Hentikan suara adzan.';
  audioPlayerStatusBar.command = 'waktusholat.stopAudioPlayer';
  audioPlayerStatusBar.show();
}

const stopAudioPlayer = () => {
  audioPlayer && audioPlayer.kill();
  audioPlayerStatusBar && audioPlayerStatusBar.dispose();
}

/** /MAIN FUNCTION */

/** HELPER FUNCTION */

function config(key, val = null) {
  const config = vscode.workspace.getConfiguration('waktusholat');
  return val === null ? config.get(key) : config.update(key, val, 1);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function now() {
  return new Date().getTime();
}

function diffNowInMinutes(timestamp) {
  return Math.ceil((timestamp - now()) / (60 * 1000));
}

function diffNowInHours(timestamp) {
  return Math.floor((timestamp - now()) / (60 * 60 * 1000));
}

function diffNowForHumans(timestamp) {
  let result = '';
  const hours = diffNowInHours(timestamp);
  const minutes = diffNowInMinutes(timestamp) % 60;
  if (hours > 0) result += `${hours} jam `;
  if (minutes > 0) result += `${minutes} menit lagi`;
  if (minutes <= 0) result = 'sekarang!';

  return result;
}

/** /HELPER FUNCTION */


/** EXTENSION FUNCTION */

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

  // make context variable to be global
  globalState = context.globalState;
  storagePath = context.globalStorageUri.path;

  // create storage path if not exists
  [storagePath, `${storagePath}/schedules`, `${storagePath}/audios`]
    .forEach(path => {
      if (!existsSync(path)) mkdirSync(path);
    });

  // display welcome message for first open
  if (globalState.get('waktusholat.first-open') !== 'DONE') {
    const infoSelectCity = await vscode.window.showInformationMessage(
      `Terima kasih telah memasang ekstensi Waktu Sholat!
				\nKota saat ini: ${city()}`,
      { modal: true },
      { title: 'Pilih Kota', action: 1 }
    );

    if (infoSelectCity?.action === 1) { await selectCity() };

    const infoDownloadAudio = await vscode.window.showInformationMessage(
      `Apakah Anda ingin mengaktifkan suara adzan?
				\n*akan mengunduh berkas audio sebesar 1.5MB`,
      { modal: true },
      { title: 'Okay', action: 1 }
    );

    if (infoDownloadAudio?.action === 1) {
      config('suara-adzan-aktif', true);
      await downloadAudio();
    };

    context.globalState.update('waktusholat.first-open', 'DONE');
  }

  // download schedule if file not exists
  if (!existsSync(getScheduleFilePath())) {
    updateSchedule();
  }

  // summary status bar
  summaryStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right, 1
  );
  summaryStatusBar.command = 'waktusholat.showSummaryStatusBarInfo';
  updateSummaryStatusBar();

  // update summary status bar every 30 seconds
  setInterval(updateSummaryStatusBar, 1000 * 30);

  // register subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'waktusholat.updateSchedule', updateSchedule
    ),
    vscode.commands.registerCommand(
      'waktusholat.selectCity', selectCity
    ),
    vscode.commands.registerCommand(
      'waktusholat.showSummaryStatusBarInfo', showSummaryStatusBarInfo
    ),
    vscode.commands.registerCommand(
      'waktusholat.stopAudioPlayer', stopAudioPlayer
    ),
  );

  // listen configuration changes
  vscode.workspace.onDidChangeConfiguration(() => {
    if (! existsSync(getScheduleFilePath())) updateSchedule();
  });
}

function deactivate() {
  //
}

module.exports = {
  activate,
  deactivate
}

/** /EXTENSION FUNCTION */