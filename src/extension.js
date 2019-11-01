const fs = require('fs');
const _ = require('lodash');
const vscode = require('vscode');
const request = require('request');

const base_path = '/tmp/waktusholat-';
const base_url = 'https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/adzan/';

const today = new Date().toISOString().substr(0, 10);
const month = today.substr(5, 2);
const year = today.substr(0, 4);

let statusBar;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Selamat, ekstensi vscode "waktusholat" sudah aktif!');

	statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
	statusBar.command = 'waktusholat.summary';

	context.subscriptions.push(
		statusBar,
		vscode.commands.registerCommand('waktusholat.update', cmdUpdate)
	);

	vscode.workspace.onDidChangeConfiguration(cmdUpdate);

	setInterval(statusBarUpdate, 1000 * 60);

	statusBarUpdate();
}

function deactivate() {
	// this method is called when your extension is deactivated
}

// TODO: make it promisable using async await or then
function cmdUpdate() {
	const city = vscode.workspace.getConfiguration('waktusholat').get('kota');
	console.log('cmdUpdate', city);

	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: "Waktu Sholat: Updating " + city + "...",
		cancellable: true
	},
	  function (progress, token) {
		token.onCancellationRequested(function () {
			// pass
		});

		queryAndSave();

		progress.report({increment: 50});

		return new Promise(function (resolve) {
			setTimeout(function() {
				statusBarUpdate();
				progress.report({increment: 100});
				resolve();
			}, 2000);
		});
	});
}

function queryAndSave() {
	const city = vscode.workspace.getConfiguration('waktusholat').get('kota');
	console.log('queryAndSave', city);

	request({
		uri: base_url + city + '/' + year + '/' + month + '.json',
		method: 'GET',
	},
	  function (err, res, body) {
		if (err) {
			vscode.window.showErrorMessage('Waktu Sholat: Update gagal, silahkan cek koneksi internet Anda.');
		}

		let path = base_path + city + '-' + year + '-' + month + '.json';

		fs.writeFileSync(path, body);
	});
}

function statusBarUpdate() {
	const city = vscode.workspace.getConfiguration('waktusholat').get('kota');
	console.log('statusBarUpdate', city);

	const path = base_path + city + '-' + year + '-' + month + '.json';

	fs.readFile(path, function(err, data) {
		if (err) {
			console.log(err);
			queryAndSave();
		};

		const schedules = _(JSON.parse(data.toString()));

		const todaySchedule = _(schedules.find(function(sch) {
			return sch.tanggal == today;
		}));

		const adzans = _(todaySchedule.omit(['tanggal'])).mapValues(function(time) {
			return new Date(today+' '+time).getTime();
		}).invert();

		const adzanKeys = adzans.keys().sort();

		const nextAdzanKeys = adzanKeys.remove(function(time) {
			return parseInt(time) >= _.now();
		}).sort();

		const nextAdzan = adzans.get(nextAdzanKeys.first()) || '';

		const nextTime = todaySchedule.get(nextAdzan);

		statusBar.text = _.isEmpty(nextAdzan)
					   ? '🕌'
					   : '🕌 ' + nextAdzan + ' ' + nextTime;

		statusBar.tooltip = _.isEmpty(nextAdzan)
						  ? 'Sudah waktu isya dan tidak ada selanjutnya.'
						  : 'Waktu ' + nextAdzan + ' ' +timeHuman(nextTime);

		statusBar.show();

		if (timeHuman(nextTime) == 'sekarang') {
			vscode.window.showInformationMessage('Waktu ' + nextAdzan + ' telah tiba!');
		}
	});
}

/**
 * @param {String} str eg: '14:05'
 */
function timeHuman(str) {
	const t1 = _.now();
	const t2 = new Date(today + ' ' + str).getTime();
	const diff = t2 - t1;
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = hours > 0 ? Math.ceil(diff / (1000 * 60)) - (60 * hours)
							  : Math.ceil(diff / (1000 * 60));

	let result = '';
	if (hours > 0) result += hours + ' jam ';
	if (minutes > 0) result += minutes + ' menit lagi';
	if (minutes <= 0) result = 'sekarang';

	return result;
}

module.exports = {
	activate,
	deactivate
}