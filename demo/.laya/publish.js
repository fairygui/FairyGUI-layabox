// v1.4.0
//是否使用IDE自带的node环境和插件，设置false后，则使用自己环境(使用命令行方式执行)
const useIDENode = process.argv[0].indexOf("LayaAir") > -1 ? true : false;
//获取Node插件和工作路径
let ideModuleDir = useIDENode ? process.argv[1].replace("gulp\\bin\\gulp.js", "").replace("gulp/bin/gulp.js", "") : "";
let workSpaceDir = useIDENode ? process.argv[2].replace("--gulpfile=", "").replace("\\.laya\\publish.js", "").replace("/.laya/publish.js", "") + "/" : "./../";

//引用插件模块
const gulp = require(ideModuleDir + "gulp");
const fs = require("fs");
const path = require("path");
const uglify = require(ideModuleDir + 'gulp-uglify-es').default;
const jsonminify = require(ideModuleDir + "gulp-jsonminify");
const image = require(ideModuleDir + "gulp-image");
const rev = require(ideModuleDir + "gulp-rev");
const revdel = require(ideModuleDir + "gulp-rev-delete-original");
const revCollector = require(ideModuleDir + 'gulp-rev-collector');
const del = require(ideModuleDir + "del");
const requireDir = require(ideModuleDir + 'require-dir');

global.ideModuleDir = ideModuleDir;
global.workSpaceDir = workSpaceDir;

// 结合compile.js使用
global.publish = true;
const fileList = ["compile.js", "publish_xmgame.js", "publish_oppogame.js", "publish_vivogame.js"];
requireDir('./', {
	filter: function (fullPath) {
		// 只用到了compile.js和publish.js
		if (fileList.includes(path.basename(fullPath))) {
			return true;
		} else {
			return false;
		}
	}
});

const QUICKGAMELIST = ["xmgame", "oppogame", "vivogame"];

// 清理临时文件夹，加载配置
let config,
	releaseDir,
	binPath,
	platform,
	isOpendataProj = false;
gulp.task("loadConfig", function () {
	platform = "web"
	if (!useIDENode && process.argv.length > 5 && process.argv[4] == "--config") {
		platform = process.argv[5].replace(".json", "");
	}
	if (useIDENode && process.argv.length >= 4 && process.argv[3].startsWith("--config") && process.argv[3].endsWith(".json")) {
		platform = process.argv[3].match(/(\w+).json/)[1];
	}
	let _path;
	if (!useIDENode) {
		_path = platform + ".json";
		releaseDir = "../release/" + platform;
		binPath = "../bin/";
	}
	if (useIDENode) {
		_path = path.join(workSpaceDir, ".laya", `${platform}.json`);
		releaseDir = path.join(workSpaceDir, "release", platform).replace(/\\/g, "/");
		binPath = path.join(workSpaceDir, "bin").replace(/\\/g, "/");
	}
	global.platform = platform;
	let file = fs.readFileSync(_path, "utf-8");
	if (file) {
		if (QUICKGAMELIST.includes(platform)) {
			file = file.replace(/\$basePath/g, releaseDir + "/temprelease");
		} else {
			file = file.replace(/\$basePath/g, releaseDir);
		}
		config = JSON.parse(file);
		global.config = config;
	}
	// 是否是开放域项目
	let projInfoPath = path.join(workSpaceDir, path.basename(workSpaceDir) + ".laya");
	let isExist = fs.existsSync(projInfoPath);
	if (isExist) {
		try {
			let projInfo = fs.readFileSync(projInfoPath, "utf8");
			projInfo = projInfo && JSON.parse(projInfo);
			isOpendataProj = projInfo.layaProType === 12;
		} catch (e) {}
	}
});

// 重新编译项目
// gulp.task("compile", ["loadConfig"], function () {
// 	if (config.compile) {
// 		console.log("compile");
// 	}
// });

// 清理release文件夹
gulp.task("clearReleaseDir", ["compile"], function (cb) {
	if (config.clearReleaseDir) {
		let delList = [releaseDir, releaseDir + "_pack", config.packfileTargetValue];
		// 小米快游戏，使用即存的项目，删掉Laya工程文件，保留小米环境项目文件
		if (platform === "xmgame") {
			let xmProjSrc = path.join(releaseDir, config.xmInfo.projName);
			// 不要删掉manifest.json/main.js文件
			// 这里不是node-glob语法，详见: https://github.com/sindresorhus/del
			delList = [`${xmProjSrc}/**`, `!${xmProjSrc}`, `!${xmProjSrc}/node_modules/**`, `!${xmProjSrc}/sign/**`, `!${xmProjSrc}/{babel.config.js,main.js,manifest.json,package.json,package-lock.json}`];
		} else if (platform === "oppogame") {
			let oppoProjSrc = path.join(releaseDir, config.oppoInfo.projName);
			delList = [`${oppoProjSrc}/**`, `!${oppoProjSrc}`, `!${oppoProjSrc}/dist/**`, `!${oppoProjSrc}/{manifest.json}`];
		} else if (platform === "vivogame") {
			let vvProj = path.join(releaseDir, config.vivoInfo.projName);
			let vvProjSrc = path.join(vvProj, "src");
			// 不要删掉manifest.json/main.js文件
			// 这里不是node-glob语法，详见: https://github.com/sindresorhus/del
			delList = [`${vvProjSrc}/**`, `!${vvProjSrc}`, `!${vvProjSrc}/sign/**`, `!${vvProjSrc}/{game.js,manifest.json}`];
			delList = delList.concat(`${vvProj}/engine/**`, `${vvProj}/config/**`);
		}
		del(delList, { force: true }).then(paths => {
			cb();
		});
	} else cb();
});

// copy bin文件到release文件夹
gulp.task("copyFile", ["clearReleaseDir"], function () {
	let baseCopyFilter = [`${workSpaceDir}/bin/**/*.*`, `!${workSpaceDir}/bin/indexmodule.html`, `!${workSpaceDir}/bin/import/*.*`];
	// 只拷贝index.js中引用的类库
	if (config.onlyIndexJS) {
		baseCopyFilter = baseCopyFilter.concat(`!${workSpaceDir}/bin/libs/*.*`);
	}
	if (platform === "wxgame" && isOpendataProj) { // 开放域项目微信发布，仅拷贝用到的文件
		config.copyFilesFilter = [`${workSpaceDir}/bin/js/bundle.js`, `${workSpaceDir}/bin/index.js`, `${workSpaceDir}/bin/game.js`];
		if (config.projectType !== "as") { // 开放域精简类库
			config.copyFilesFilter.push(`${workSpaceDir}/bin/libs/laya.opendata.min.js`);
		}
	} else if (platform === "wxgame") { // 微信项目，不拷贝index.html，不拷贝百度bin目录中的文件
		config.copyFilesFilter = baseCopyFilter.concat([`!${workSpaceDir}/bin/index.html`, `!${workSpaceDir}/bin/{project.swan.json,swan-game-adapter.js}`]);
	} else if (platform === "bdgame") { // 百度项目，不拷贝index.html，不拷贝微信bin目录中的文件
		config.copyFilesFilter = baseCopyFilter.concat([`!${workSpaceDir}/bin/index.html`, `!${workSpaceDir}/bin/{project.config.json,weapp-adapter.js}`]);
	} else { // web|QQ项目|bili|快游戏，不拷贝微信、百度在bin目录中的文件
		config.copyFilesFilter = baseCopyFilter.concat([`!${workSpaceDir}/bin/{game.js,game.json,project.config.json,weapp-adapter.js,project.swan.json,swan-game-adapter.js}`]);
	}
	// bili/alipay/qq，不拷贝index.html
	if (["biligame", "Alipaygame", "qqgame"].includes(platform)) {
		config.copyFilesFilter = config.copyFilesFilter.concat([`!${workSpaceDir}/bin/index.html`]);
	}
	// 快游戏，需要新建一个快游戏项目，拷贝的只是项目的一部分，将文件先拷贝到文件夹的临时目录中去
	if (QUICKGAMELIST.includes(platform)) {
		config.copyFilesFilter = config.copyFilesFilter.concat([`!${workSpaceDir}/bin/index.html`]);
		releaseDir = global.tempReleaseDir = path.join(releaseDir, "temprelease");
	}
	if (config.exclude) { // 排除文件
		config.excludeFilter.forEach(function(item, index, list) {
			releaseDir = releaseDir.replace(/\\/g, "/");
			config.excludeFilter[index] = item.replace(releaseDir, binPath);
		});
		config.copyFilesFilter = config.copyFilesFilter.concat(config.excludeFilter);
	}
	global.releaseDir = releaseDir;
	var stream = gulp.src(config.copyFilesFilter, { base: `${workSpaceDir}/bin` });
	return stream.pipe(gulp.dest(releaseDir));
});

// copy libs中的js文件到release文件夹
gulp.task("copyLibsJsFile", ["copyFile"], function () {
	if (!config.onlyIndexJS) {
		return;
	}
	if (platform === "wxgame" && isOpendataProj) { // 开放域项目微信发布，拷贝文件时已经拷贝类库文件了
		return;
	}
	// 开放域项目，as语言，没有libs目录，mac系统报错
	let libs = path.join(workSpaceDir, "bin", "libs");
	if (!fs.existsSync(libs)) {
		return;
	}
	// 分析index.js
	let indexJSPath = path.join(workSpaceDir, "bin", "index.js");
	let indexJsContent = fs.readFileSync(indexJSPath, "utf8");
	let libsList = indexJsContent.match(/loadLib\(['"]libs\/[\w-./]+\.(js|wasm)['"]\)/g);
	if (!libsList) {
		libsList = [];
	}
	let 
		item,
		libsName = "",
		libsStr = "";
	for (let i = 0, len = libsList.length; i < len; i++) {
		item = libsList[i];
		libsName = item.match(/loadLib\(['"]libs\/([\w-./]+\.(js|wasm))['"]\)/);
		libsStr += libsStr ? `,${libsName[1]}` : libsName[1];
	}
	let copyLibsList = [`${workSpaceDir}/bin/libs/{${libsStr}}`];
	if (!libsStr.includes(",")) {
		copyLibsList = [`${workSpaceDir}/bin/libs/${libsStr}`];
	}
	// 微信、百度，需要拷贝对应平台的类库
	if (platform === "wxgame") {
		copyLibsList.push(`${workSpaceDir}/bin/libs/laya.wxmini.js`);
	} else if (platform === "bdgame") {
		copyLibsList.push(`${workSpaceDir}/bin/libs/laya.bdmini.js`);
	} else if (platform === "qqgame") {
		copyLibsList.push(`${workSpaceDir}/bin/libs/laya.qqmini.js`);
	}
	var stream = gulp.src(copyLibsList, { base: `${workSpaceDir}/bin` });
	return stream.pipe(gulp.dest(releaseDir));
});

// 根据不同的项目类型拷贝平台文件
gulp.task("copyPlatformFile", ["copyLibsJsFile"], function () {
	let fileLibsPath;
	if (useIDENode) {
		fileLibsPath = path.join(ideModuleDir, "../", "out", "layarepublic", "LayaAirProjectPack", "lib", "data");
	} else if (process.argv.length >= 8 && process.argv[6] === "--libspath") {
		fileLibsPath = process.argv[7];
		console.log("平台文件包是否存在: " + fs.existsSync(fileLibsPath));
	} else {
		console.log("没有接收到可用文件包位置，不拷贝对应平台文件");
		return;
	}
	// 开放域项目，微信发布
	if (platform === "wxgame" && isOpendataProj) {
		let platformDir = path.join(fileLibsPath, "wxfiles", "weapp-adapter.js");
		let stream = gulp.src(platformDir);
		return stream.pipe(gulp.dest(releaseDir));
	}
	// 微信项目，非开放域项目
	if (platform === "wxgame") {
		// 如果新建项目时已经点击了"微信/百度小游戏bin目录快速调试"，不再拷贝
		let isHadWXFiles =
			fs.existsSync(path.join(workSpaceDir, "bin", "game.js")) &&
			fs.existsSync(path.join(workSpaceDir, "bin", "game.json")) &&
			fs.existsSync(path.join(workSpaceDir, "bin", "project.config.json")) &&
			fs.existsSync(path.join(workSpaceDir, "bin", "weapp-adapter.js"));
		if (isHadWXFiles) {
			return;
		}
		let platformDir = path.join(fileLibsPath, "wxfiles");
		let stream = gulp.src(platformDir + "/*.*");
		return stream.pipe(gulp.dest(releaseDir));
	}
	// 百度项目
	if (platform === "bdgame") {
		// 如果新建项目时已经点击了"微信/百度小游戏bin目录快速调试"，不再拷贝
		let isHadBdFiles =
			fs.existsSync(path.join(workSpaceDir, "bin", "game.js")) &&
			fs.existsSync(path.join(workSpaceDir, "bin", "game.json")) &&
			fs.existsSync(path.join(workSpaceDir, "bin", "project.swan.json")) &&
			fs.existsSync(path.join(workSpaceDir, "bin", "swan-game-adapter.js"));
		if (isHadBdFiles) {
			return;
		}
		let platformDir = path.join(fileLibsPath, "bdfiles");
		let stream = gulp.src(platformDir + "/*.*");
		return stream.pipe(gulp.dest(releaseDir));
	}
	// QQ小游戏
	if (platform === "qqgame") {
		let platformDir = path.join(fileLibsPath, "qqfiles");
		let stream = gulp.src(platformDir + "/*.*");
		return stream.pipe(gulp.dest(releaseDir));
	}
});

// 拷贝文件后，针对特定平台修改文件内容
gulp.task("modifyFile", ["copyPlatformFile"], function () {
	// QQ小游戏
	// if (platform === "qqgame") {
	// 	return;
	// }

	// 百度项目，修改index.js
	if (platform === "bdgame") {
		let filePath = path.join(releaseDir, "index.js");
		if (!fs.existsSync(filePath)) {
			return;
		}
		let fileContent = fs.readFileSync(filePath, "utf8");
		fileContent = fileContent.replace(/loadLib\(/g, "require(");
		fs.writeFileSync(filePath, fileContent, "utf8");
		return;
	}
});

// 压缩json
gulp.task("compressJson", ["modifyFile"], function () {
	if (config.compressJson) {
		return gulp.src(config.compressJsonFilter, { base: releaseDir })
			.pipe(jsonminify())
			.pipe(gulp.dest(releaseDir));
	}
});

// 压缩js
gulp.task("compressJs", ["compressJson"], function () {
	if (config.compressJs) {
		return gulp.src(config.compressJsFilter, { base: releaseDir })
			.pipe(uglify({
				mangle: false
			}))
			.on('error', function (err) {
				console.warn(err.toString());
			})
			.pipe(gulp.dest(releaseDir));
	}
});

// 压缩png，jpg
gulp.task("compressImage", ["compressJs"], function () {
	if (config.compressImage) {
		return gulp.src(config.compressImageFilter, { base: releaseDir })
			.pipe(image({
				pngquant: true,			//PNG优化工具
				optipng: false,			//PNG优化工具
				zopflipng: true,		//PNG优化工具
				jpegRecompress: false,	//jpg优化工具
				mozjpeg: true,			//jpg优化工具
				guetzli: false,			//jpg优化工具
				gifsicle: false,		//gif优化工具
				svgo: false,			//SVG优化工具
				concurrent: 10,			//并发线程数
				quiet: true 			//是否是静默方式
				// optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
				// pngquant: ['--speed=1', '--force', 256],
				// zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
				// jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
				// mozjpeg: ['-optimize', '-progressive'],
				// guetzli: ['--quality', 85]
			}))
			.pipe(gulp.dest(releaseDir));
	}
});

// 开放域的情况下，合并game.js和index.js，并删除game.js
gulp.task("openData", ["compressImage"], function (cb) {
	if (config.openDataZone) {
		let indexPath = releaseDir + "/index.js";
		let indexjs = readFile(indexPath);
		let gamejs = readFile(releaseDir + "/game.js");
		if (gamejs && indexjs) {
			gamejs = gamejs.replace('require("index.js")', indexjs);
			fs.writeFileSync(indexPath, gamejs, 'utf-8');
		}
		if (isOpendataProj) {
			// 开放域项目，将game.js删掉，发布最小包
			del(`${releaseDir}/game.js`, { force: true }).then(paths => {
				cb();
			}); 
		} else {
			cb();
		}
	} else {
		cb();
	}
});

function readFile(path) {
	if (fs.existsSync(path)) {
		return fs.readFileSync(path, "utf-8");
	}
	return null;
}

// 生成版本管理信息
gulp.task("version1", ["openData"], function () {
	if (config.version) {
		return gulp.src(config.versionFilter, { base: releaseDir })
			.pipe(rev())
			.pipe(gulp.dest(releaseDir))
			.pipe(revdel())
			.pipe(rev.manifest("version.json"))
			.pipe(gulp.dest(releaseDir));
	}
});

// 替换index.js里面的变化的文件名
gulp.task("version2", ["version1"], function () {
	if (config.version) {
		//替换index.html和index.js里面的文件名称

		let htmlPath = releaseDir + "/index.html";
		let versionPath = releaseDir + "/version.json";
		let gameJSPath = releaseDir + "/game.js";
		let mainJSPath = releaseDir + "/main.js";
		let indexJSPath;
		let versionCon = fs.readFileSync(versionPath, "utf8");
		versionCon = JSON.parse(versionCon);
		indexJSPath = releaseDir + "/" + versionCon["index.js"];
		// 替换config.packfileFullValue中的路径
		let packfileStr = JSON.stringify(config.packfileFullValue).replace(/\\\\/g, "/");
		let tempPackfile = `${workSpaceDir}/.laya/configTemp.json`;
		fs.writeFileSync(tempPackfile, packfileStr, "utf8");

		let srcList = [versionPath, indexJSPath, tempPackfile];
		if (fs.existsSync(htmlPath)) {
			srcList.push(htmlPath);
		}
		if (fs.existsSync(gameJSPath)) {
			srcList.push(gameJSPath);
		}
		if (fs.existsSync(mainJSPath)) {
			srcList.push(mainJSPath);
		}
		return gulp.src(srcList)
			.pipe(revCollector())
			.pipe(gulp.dest(releaseDir));
	}
});

// 筛选4M包
gulp.task("packfile", ["version2"], function() {
	if (config.version) {
		// 从release目录取得带有版本号的目录
		let tempPackfile = `${workSpaceDir}/.laya/configTemp.json`;
		let releasePackfile = `${releaseDir}/configTemp.json`;
		let packfileStr = fs.readFileSync(releasePackfile, "utf8");
		config.packfileFullValue = JSON.parse(packfileStr);
		// 删掉临时目录
		fs.unlinkSync(tempPackfile);
		fs.unlinkSync(releasePackfile);
	}
	if (config.packfile) { // 提取本地包(文件列表形式)
		return gulp.src(config.packfileFullValue, { base: releaseDir })
			.pipe(gulp.dest(config.packfileTargetValue || releaseDir + "_pack"));
	}
});

// 起始任务
gulp.task("publish", ["buildXiaomiProj", "buildOPPOProj", "buildVivoProj"], function () {
	console.log("All tasks completed!");
});