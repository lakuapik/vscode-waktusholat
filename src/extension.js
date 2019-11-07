const fs = require('fs');
const _ = require('lodash');
const vscode = require('vscode');
const request = require('request-promise');

const baseUrl = 'https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/adzan/';

const todayUk = new Date().toLocaleDateString('UK');
const month = todayUk.substr(3, 2);
const year = todayUk.substr(6, 4);
const day = todayUk.substr(0, 2);
const today = year + '-' + month + '-' + day;

let basePath;
let statusBar;

/**
 * Get current city from configuration.
 *
 * @returns {string}
 */
const getCity = () => vscode.workspace.getConfiguration('waktusholat').get('kota');

/**
 * Get path of waktusholat json file.
 *
 * @returns {string}
 */
const getJsonPath = () => basePath + getCity() + '-' + year + '-' + month + '.json';

/**
 * Get url of waktusholat json file.
 *
 * @returns {string}
 */
const getJsonUrl = () => baseUrl + getCity() + '/' + year + '/' + month + '.json';

/**
 * Get waktusholat json file.
 * If not exists, execute queryAndSave.
 *
 * @returns {Array<Object>}
 */
const getJsonFile = () => {
	let content = '[]';

	try {
		content = fs.readFileSync(getJsonPath()).toString();
	} catch (error) {
		queryAndSave();
	}

	return JSON.parse(content);
}

/**
 * Get schedule for today.
 *
 * @retuns {Object<lodash>}
 */
const todaySchedule = () => {
	const schedules = _(getJsonFile());

	return _(schedules.find((sch) => sch.tanggal == today));
}

/**
 * Get adzans for today.
 * Data time already mapped to unix timestamp.
 * Keys and values are inverted.
 *
 * @retuns {Object<lodash>}
 */
const todayAdzans = () => {
	const adzans = todaySchedule().omit(['tanggal']);

	return adzans.map(function(key, val) {
		return {
			'time': key,
			'adzan': val.toString(),
			'timestamp': new Date(today + ' ' + key).getTime(),
			'timehuman': timeHuman(new Date(today + ' ' + key).getTime()),
		}
	}).sortBy('timestamp');
}

/**
 * Get next adzan.
 *
 * @returns {Object}
 */
const nextAdzan = () => {
	let next = {adzan: ''};
	let today = todayAdzans();

	for (let i = 0; i < today.size(); i++) {
		if (today.get(i).timestamp >= _.now()) {
			next = today.get(i);
			break;
		}
	}

	return next;
}

/**
 * Get previous adzan.
 *
 * @returns {Object}
 */
const prevAdzan = () => {
	let prev = {adzan: ''};
	let today = todayAdzans();

	for (let i = 0; i < today.size(); i++) {
		let tgi = today.get(i);
		if (tgi.adzan != 'imsyak' && tgi.timestamp >= _.now()) {
			prev = today.get(i - 1);
			break;
		}
	}

	return prev;
}

/**
 * Get difference in minutes from now and time.
 *
 * @param {number} time unix timestamp
 */
const diffMinsFromNow = (time) => Math.ceil((time - _.now()) / (60 * 1000));

/**
 * Get difference in hours from now and time.
 *
 * @param {number} time unix timestamp
 */
const diffHoursFromNow = (time) => Math.floor((time - _.now()) / (60 * 60 * 1000));

/**
 * Convert time to human readable format.
 *
 * @param {number} time unix timestamp
 *
 * @returns {string}
 */
const timeHuman = (time) => {
	const hours = diffHoursFromNow(time);
	const minutes = diffMinsFromNow(time) % 60;

	let result = '';
	if (hours > 0) result += hours + ' jam ';
	if (minutes > 0) result += minutes + ' menit lagi';
	if (minutes <= 0) result = 'sekarang!';

	return result;
}

/**
 * Command: to update waktusholat data.
 *
 * @returns {void}
 */
const cmdUpdate = () => {
	console.log('cmdUpdate', getCity());

	// create message box with progress bar
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: 'Waktu Sholat: Updating ' + getCity() + '...',
	}, () => {
		return queryAndSave().then(() => {
			statusBarUpdate();
		});
	});
}

/**
 * Command: to select city and update its configuration data.
 *
 * @returns {void}
 */
const cmdSelectCity = () => {
	console.log('cmdSelectCity');

	// list of avaiable cities
	const cities = ["ambarawa", "ambon", "amlapura", "amuntai", "argamakmur", "atambua", "babo", "bagansiapiapi", "bahaurkalteng", "bajawa", "balige", "balikpapan", "bandaaceh", "bandarlampung", "bandung", "bangkalan", "bangkinang", "bangko", "bangli", "banjar", "banjarbaru", "banjarmasin", "banjarnegara", "bantaeng", "banten", "bantul", "banyuwangi", "barabai", "barito", "barru", "batam", "batang", "batu", "baturaja", "batusangkar", "baubau", "bekasi", "bengkalis", "bengkulu", "benteng", "biak", "bima", "binjai", "bireuen", "bitung", "blitar", "blora", "bogor", "bojonegoro", "bondowoso", "bontang", "boyolali", "brebes", "bukittinggi", "bulasbtmaluku", "bulukumba", "buntok", "cepu", "ciamis", "cianjur", "cibinong", "cilacap", "cilegon", "cimahi", "cirebon", "curup", "demak", "denpasar", "depok", "dili", "dompu", "donggala", "dumai", "ende", "enggano", "enrekang", "fakfak", "garut", "gianyar", "gombong", "gorontalo", "gresik", "gunungsitoli", "indramayu", "jakartabarat", "jakartapusat", "jakartaselatan", "jakartatimur", "jakartautara", "jambi", "jayapura", "jember", "jeneponto", "jepara", "jombang", "kabanjahe", "kalabahi", "kalianda", "kandangan", "karanganyar", "karawang", "kasungan", "kayuagung", "kebumen", "kediri", "kefamenanu", "kendal", "kendari", "kertosono", "ketapang", "kisaran", "klaten", "kolaka", "kotabarupulaulaut", "kotabumi", "kotajantho", "kotamobagu", "kualakapuas", "kualakurun", "kualapembuang", "kualatungkal", "kudus", "kuningan", "kupang", "kutacane", "kutoarjo", "labuhan", "lahat", "lamongan", "langsa", "larantuka", "lawang", "lhoseumawe", "limboto", "lubukbasung", "lubuklinggau", "lubukpakam", "lubuksikaping", "lumajang", "luwuk", "madiun", "magelang", "magetan", "majalengka", "majene", "makale", "makassar", "malang", "mamuju", "manna", "manokwari", "marabahan", "maros", "martapurakalsel", "masambasulsel", "masohi", "mataram", "maumere", "medan", "mempawah", "menado", "mentok", "merauke", "metro", "meulaboh", "mojokerto", "muarabulian", "muarabungo", "muaraenim", "muarateweh", "muarosijunjung", "muntilan", "nabire", "negara", "nganjuk", "ngawi", "nunukan", "pacitan", "padang", "padangpanjang", "padangsidempuan", "pagaralam", "painan", "palangkaraya", "palembang", "palopo", "palu", "pamekasan", "pandeglang", "pangka_", "pangkajenesidenreng", "pangkalanbun", "pangkalpinang", "panyabungan", "par_", "parepare", "pariaman", "pasuruan", "pati", "payakumbuh", "pekalongan", "pekanbaru", "pemalang", "pematangsiantar", "pendopo", "pinrang", "pleihari", "polewali", "pondokgede", "ponorogo", "pontianak", "poso", "prabumulih", "praya", "probolinggo", "purbalingga", "purukcahu", "purwakarta", "purwodadigrobogan", "purwokerto", "purworejo", "putussibau", "raha", "rangkasbitung", "rantau", "rantauprapat", "rantepao", "rembang", "rengat", "ruteng", "sabang", "salatiga", "samarinda", "sambaskalbar", "sampang", "sampit", "sanggau", "sawahlunto", "sekayu", "selong", "semarang", "sengkang", "serang", "serui", "sibolga", "sidikalang", "sidoarjo", "sigli", "singaparna", "singaraja", "singkawang", "sinjai", "sintang", "situbondo", "slawi", "sleman", "soasiu", "soe", "solo", "solok", "soreang", "sorong", "sragen", "stabat", "subang", "sukabumi", "sukoharjo", "sumbawabesar", "sumedang", "sumenep", "sungailiat", "sungaipenuh", "sungguminasa", "surabaya", "surakarta", "tabanan", "tahuna", "takalar", "takengon", "tamianglayang", "tanahgrogot", "tangerang", "tanjungbalai", "tanjungenim", "tanjungpandan", "tanjungpinang", "tanjungredep", "tanjungselor", "tapaktuan", "tarakan", "tarutung", "tasikmalaya", "tebingtinggi", "tegal", "temanggung", "tembilahan", "tenggarong", "ternate", "tolitoli", "tondano", "trenggalek", "tual", "tuban", "tulungagung", "ujungberung", "ungaran", "waikabubak", "waingapu", "wamena", "watampone", "watansoppeng", "wates", "wonogiri", "wonosari", "wonosobo", "yogyakarta"];

	// show the quick pick
	vscode.window.showQuickPick(cities, {
		placeHolder: 'Waktu sholat mengikuti kota yang ditentukan.',
	}).then((value) => {
		vscode.workspace.getConfiguration('waktusholat').update('kota', value, 1);
	});
}

/**
 * Query or get waktusholat json file from external url and save to storage path.
 *
 * @returns {Promise<void>}
 */
const queryAndSave = () => {
	console.log('queryAndSave', getCity());

	// return request-promise
	return request(getJsonUrl())
		.then((body) => {
			fs.writeFileSync(getJsonPath(), body);
		}).catch((err) => {
			console.log(err);
			// vscode.window.showErrorMessage('Waktu Sholat: Update gagal, silahkan cek koneksi internet Anda.');
		});
}

/**
 * Update content of waktusholat status bar.
 *
 * @returns {void}
 */
const statusBarUpdate = () => {
	console.log('statusBarUpdate', getCity());

	let next = nextAdzan();
	let prev = prevAdzan();

	let prevDiff = _.isEmpty(prev) ? -99 : diffMinsFromNow(prev.timestamp);
	let nextDiff = _.isEmpty(next) ? -99 : diffMinsFromNow(next.timestamp);

	let text = '', tooltip = '';

	// prev is still 10 mins from now
	if (
		(prevDiff <= 0 && prevDiff > -5 && prev.adzan == 'imsyak')
		|| (prevDiff <= 0 && prevDiff > -10 && prev.adzan != 'imsyak')
	){
		text = _.isEmpty(prev.adzan)
			 ? '🕌'
			 : '🕌 WAKTUNYA '+ _.toUpper(prev.adzan);
		tooltip = _.isEmpty(prev.adzan)
				? ''
				: 'Waktu ' + prev.adzan + ' ' + prev.time + ' telah tiba!';
	}
	// default
	else {
		text = _.isEmpty(next.adzan)
			 ? '🕌'
			 : '🕌 ' + next.adzan + ' ' + next.time;
		tooltip = _.isEmpty(next.adzan)
				? 'Alhamdulillah sudah 5 waktu.'
				: 'Waktu ' + next.adzan + ' ' + next.timehuman;
	}

	// updating status bar
	statusBar.text = text;
	statusBar.tooltip = tooltip;
	statusBar.show();

	// show message
	if (prevDiff == 0) {
		vscode.window.showInformationMessage(statusBar.tooltip);
		// TODO: play adzan with progress and cancelable
	}
	if (nextDiff == 5) {
		vscode.window.showInformationMessage(statusBar.tooltip);
	}
}

/**
 * Show status bar summary.
 *
 * @returns {void}
 */
const statusBarSummary = () => {
	vscode.window.showInformationMessage(statusBar.tooltip);
}

/**
 * Executed on activation event.
 *
 * @param {vscode.ExtensionContext} context
 *
 * @returns {void}
 */
const activate = (context) => {
	console.log('Selamat, ekstensi vscode "waktusholat" sudah aktif!');

	// set basePath
	basePath = context.globalStoragePath + '/';

	// check global storage path, create if not exists
	if (!fs.existsSync(context.globalStoragePath)) {
		fs.mkdirSync(context.globalStoragePath);
	}

	// check first open
	// context.globalState.update('waktusholat-first-open', undefined);
	if (context.globalState.get('waktusholat-first-open') === undefined) {
		vscode.window.showInformationMessage(
			`Terima kasih telah memasang ekstensi Waktu Sholat! \nKota saat ini: ` + getCity(),
			{modal: true},
			{title: 'Pilih Kota', 'action': 1}
		).then(button => {
			if (button === undefined) return;
			if (button.action == 1) cmdSelectCity();
			context.globalState.update('waktusholat-first-open', 'DONE');
		});
	}

	// set status bar
	statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
	statusBar.command = 'waktusholat.statusBarSummary';

	// register subscriptions
	context.subscriptions.push(
		statusBar,
		vscode.commands.registerCommand('waktusholat.update', cmdUpdate),
		vscode.commands.registerCommand('waktusholat.selectCity', cmdSelectCity),
		vscode.commands.registerCommand('waktusholat.statusBarSummary', statusBarSummary)
	);

	// register workspace event listeners
	vscode.workspace.onDidChangeConfiguration(cmdUpdate);

	// set to execute statusBarUpdate every minute
	setInterval(statusBarUpdate, 1000 * 60);

	// if there is no waktusholat json file, execute cmdUpdate
	if (!fs.existsSync(getJsonPath())) {
		cmdUpdate();
	}

	// execute statusBarUpdate
	statusBarUpdate();
}

/**
 * Executed on deactivation event.
 *
 * @returns {void}
 */
const deactivate = () => {
	// pass
};

/**
 * Module Exports
 */
module.exports = {
	activate,
	deactivate
}