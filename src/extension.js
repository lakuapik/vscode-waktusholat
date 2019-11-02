const fs = require('fs');
const _ = require('lodash');
const vscode = require('vscode');
const request = require('request-promise');
const base_url = 'https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/adzan/';

const today = new Date().toISOString().substr(0, 10);
const month = today.substr(5, 2);
const year = today.substr(0, 4);

let base_path;
let statusBar;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Selamat, ekstensi vscode "waktusholat" sudah aktif!');

	if (!fs.existsSync(context.globalStoragePath)) {
		fs.mkdirSync(context.globalStoragePath);
	}

	base_path = context.globalStoragePath + '/';

	statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
	statusBar.command = 'waktusholat.summary';

	context.subscriptions.push(
		statusBar,
		vscode.commands.registerCommand('waktusholat.update', cmdUpdate),
		vscode.commands.registerCommand('waktusholat.selectCity', cmdSelectCity)
	);

	vscode.workspace.onDidChangeConfiguration(cmdUpdate);

	setInterval(statusBarUpdate, 1000 * 60);

	cmdUpdate();
}

function deactivate() {
	// this method is called when your extension is deactivated
}

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

		progress.report({increment: 50});

		queryAndSave().then(function() {
			progress.report({increment: 70});
			statusBarUpdate();
		});

		return new Promise(function (resolve) {
			progress.report({increment: 90});
			resolve();
		});
	});
}

function cmdSelectCity() {
	const cities = ["ambarawa", "ambon", "amlapura", "amuntai", "argamakmur", "atambua", "babo", "bagansiapiapi", "bahaurkalteng", "bajawa", "balige", "balikpapan", "bandaaceh", "bandarlampung", "bandung", "bangkalan", "bangkinang", "bangko", "bangli", "banjar", "banjarbaru", "banjarmasin", "banjarnegara", "bantaeng", "banten", "bantul", "banyuwangi", "barabai", "barito", "barru", "batam", "batang", "batu", "baturaja", "batusangkar", "baubau", "bekasi", "bengkalis", "bengkulu", "benteng", "biak", "bima", "binjai", "bireuen", "bitung", "blitar", "blora", "bogor", "bojonegoro", "bondowoso", "bontang", "boyolali", "brebes", "bukittinggi", "bulasbtmaluku", "bulukumba", "buntok", "cepu", "ciamis", "cianjur", "cibinong", "cilacap", "cilegon", "cimahi", "cirebon", "curup", "demak", "denpasar", "depok", "dili", "dompu", "donggala", "dumai", "ende", "enggano", "enrekang", "fakfak", "garut", "gianyar", "gombong", "gorontalo", "gresik", "gunungsitoli", "indramayu", "jakartabarat", "jakartapusat", "jakartaselatan", "jakartatimur", "jakartautara", "jambi", "jayapura", "jember", "jeneponto", "jepara", "jombang", "kabanjahe", "kalabahi", "kalianda", "kandangan", "karanganyar", "karawang", "kasungan", "kayuagung", "kebumen", "kediri", "kefamenanu", "kendal", "kendari", "kertosono", "ketapang", "kisaran", "klaten", "kolaka", "kotabarupulaulaut", "kotabumi", "kotajantho", "kotamobagu", "kualakapuas", "kualakurun", "kualapembuang", "kualatungkal", "kudus", "kuningan", "kupang", "kutacane", "kutoarjo", "labuhan", "lahat", "lamongan", "langsa", "larantuka", "lawang", "lhoseumawe", "limboto", "lubukbasung", "lubuklinggau", "lubukpakam", "lubuksikaping", "lumajang", "luwuk", "madiun", "magelang", "magetan", "majalengka", "majene", "makale", "makassar", "malang", "mamuju", "manna", "manokwari", "marabahan", "maros", "martapurakalsel", "masambasulsel", "masohi", "mataram", "maumere", "medan", "mempawah", "menado", "mentok", "merauke", "metro", "meulaboh", "mojokerto", "muarabulian", "muarabungo", "muaraenim", "muarateweh", "muarosijunjung", "muntilan", "nabire", "negara", "nganjuk", "ngawi", "nunukan", "pacitan", "padang", "padangpanjang", "padangsidempuan", "pagaralam", "painan", "palangkaraya", "palembang", "palopo", "palu", "pamekasan", "pandeglang", "pangka_", "pangkajenesidenreng", "pangkalanbun", "pangkalpinang", "panyabungan", "par_", "parepare", "pariaman", "pasuruan", "pati", "payakumbuh", "pekalongan", "pekanbaru", "pemalang", "pematangsiantar", "pendopo", "pinrang", "pleihari", "polewali", "pondokgede", "ponorogo", "pontianak", "poso", "prabumulih", "praya", "probolinggo", "purbalingga", "purukcahu", "purwakarta", "purwodadigrobogan", "purwokerto", "purworejo", "putussibau", "raha", "rangkasbitung", "rantau", "rantauprapat", "rantepao", "rembang", "rengat", "ruteng", "sabang", "salatiga", "samarinda", "sambaskalbar", "sampang", "sampit", "sanggau", "sawahlunto", "sekayu", "selong", "semarang", "sengkang", "serang", "serui", "sibolga", "sidikalang", "sidoarjo", "sigli", "singaparna", "singaraja", "singkawang", "sinjai", "sintang", "situbondo", "slawi", "sleman", "soasiu", "soe", "solo", "solok", "soreang", "sorong", "sragen", "stabat", "subang", "sukabumi", "sukoharjo", "sumbawabesar", "sumedang", "sumenep", "sungailiat", "sungaipenuh", "sungguminasa", "surabaya", "surakarta", "tabanan", "tahuna", "takalar", "takengon", "tamianglayang", "tanahgrogot", "tangerang", "tanjungbalai", "tanjungenim", "tanjungpandan", "tanjungpinang", "tanjungredep", "tanjungselor", "tapaktuan", "tarakan", "tarutung", "tasikmalaya", "tebingtinggi", "tegal", "temanggung", "tembilahan", "tenggarong", "ternate", "tolitoli", "tondano", "trenggalek", "tual", "tuban", "tulungagung", "ujungberung", "ungaran", "waikabubak", "waingapu", "wamena", "watampone", "watansoppeng", "wates", "wonogiri", "wonosari", "wonosobo", "yogyakarta"];

	vscode.window.showQuickPick(cities, {
		placeHolder: "Waktu sholat mengikuti kota yang ditentukan.",
	}).then(function(value) {
		vscode.workspace.getConfiguration('waktusholat').update('kota', value, 1);
	});
}

function queryAndSave() {
	const city = vscode.workspace.getConfiguration('waktusholat').get('kota');
	console.log('queryAndSave', city);

	return request(base_url + city + '/' + year + '/' + month + '.json')
		.then(function (body) {
			let path = base_path + city + '-' + year + '-' + month + '.json';
			fs.writeFileSync(path, body);
		}).catch(function(err) {
			console.log(err);
			vscode.window.showErrorMessage('Waktu Sholat: Update gagal, silahkan cek koneksi internet Anda.');
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