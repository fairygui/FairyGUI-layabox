// v1.7.0
const ideModuleDir = global.ideModuleDir;
const workSpaceDir = global.workSpaceDir;

//引用插件模块
const gulp = require(ideModuleDir + "gulp");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const del = require(ideModuleDir + "del");
const iconv =  require(ideModuleDir + "iconv-lite");
const revCollector = require(ideModuleDir + 'gulp-rev-collector');

let fullRemoteEngineList = ["laya.core.js", "laya.webgl.js", "laya.filter.js", "laya.ani.js", "laya.d3.js", "laya.html.js", "laya.particle.js", "laya.ui.js", "laya.d3Plugin.js", "bytebuffer.js", "laya.device.js", "laya.physics.js", "laya.physics3D.js", "laya.tiledmap.js", "worker.js", "workerloader.js"];

let copyLibsTask = ["copyPlatformLibsJsFile"];
let packfiletask = ["packfile"];

let 
    config,
	releaseDir,
    tempReleaseDir, // vivo临时拷贝目录
	projDir, // vivo快游戏工程目录
	isDealNoCompile = true,
	physicsLibsPathList = [],
	isExistEngineFolder = false; // bin目录下是否存在engine文件夹
let projSrc;
let versionCon; // 版本管理version.json
let commandSuffix,
	layarepublicPath;

// 创建vivo项目前，拷贝vivo引擎库、修改index.js
gulp.task("preCreate_VIVO", copyLibsTask, function() {
	releaseDir = global.releaseDir;
	config = global.config;
	commandSuffix = global.commandSuffix;
	layarepublicPath = global.layarepublicPath;
	tempReleaseDir = global.tempReleaseDir;

	if (config.useMinJsLibs) {
		fullRemoteEngineList = fullRemoteEngineList.map((item, index) => {
			return item.replace(".js", ".min.js");
		})
	}
});

gulp.task("copyPlatformFile_VIVO", ["preCreate_VIVO"], function() {
	return;
});

// 检查是否全局安装了qgame
gulp.task("createGlobalQGame_VIVO", packfiletask, function() {
	releaseDir = path.dirname(releaseDir);
	projDir = path.join(releaseDir, config.vivoInfo.projName);
	projSrc = path.join(projDir, "src");
	// npm view @vivo-minigame/cli version
	// npm install -g @vivo-minigame/cli
	let remoteVersion, localVersion;
	let isGetRemote, isGetLocal;
	let isUpdateGlobalQGame = true;
	return new Promise((resolve, reject) => { // 远程版本号
		childProcess.exec("npm view  @vivo-minigame/cli version", function(error, stdout, stderr) {
			if (!stdout) { // 获取 @vivo-minigame/cli 远程版本号失败
				console.log("Failed to get the remote version number");
				resolve();
				return;
			}
			remoteVersion = stdout;
			isGetRemote = true;
			if (isGetRemote && isGetLocal) {
				isUpdateGlobalQGame = remoteVersion != localVersion;
				console.log(`remoteVersion: ${remoteVersion}, localVersion: ${localVersion}`);
				resolve();
			}
		});
		childProcess.exec("mg -v", function(error, stdout, stderr) {
			if (!stdout) { // 获取  @vivo-minigame/cli 本地版本号失败
				console.log("Failed to get the local version number");
				resolve();
				return;
			}
			localVersion = stdout;
			isGetLocal = true;
			if (isGetRemote && isGetLocal) {
				isUpdateGlobalQGame = remoteVersion != localVersion;
				console.log(`remoteVersion: ${remoteVersion}, localVersion: ${localVersion}`);
				resolve();
			}
		});
		setTimeout(() => {
			// 如果获取到了本地版本号，但未获取到远程版本号，默认通过
			if (isGetLocal && !isGetRemote) {
				isUpdateGlobalQGame = false;
				console.log("Gets the version number timeout, does not get the remote version number, but the local version number exists, passes by default");
				resolve();
				return;
			}
		}, 10000);
	}).then(() => {
		return new Promise((resolve, reject) => {
			if (!isUpdateGlobalQGame) {
				resolve();
				return;
			}
			console.log("全局安装@vivo-minigame/cli");
			// npm install -g @vivo-minigame/cli
			let cmd = `npm${commandSuffix}`;
			let args = ["install", "@vivo-minigame/cli", "-g"];
			let opts = {
				shell: true
			};
			let cp = childProcess.spawn(cmd, args, opts);
			
			cp.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`);
			});
	
			cp.stderr.on('data', (data) => {
				console.log(`stderr: ${data}`);
				// reject();
			});
	
			cp.on('close', (code) => {
				console.log(`2 end) npm install -g @vivo-minigame/cli：${code}`);
				resolve();
			});
		});
	}).catch((e) => {
		console.log("catch e", e);
	});
});

gulp.task("createProj_VIVO", ["createGlobalQGame_VIVO"], function() {
	// 如果有即存项目，不再新建
	let isProjExist = fs.existsSync(projDir + "/node_modules") && 
					  fs.existsSync(projDir + "/sign");
	if (isProjExist) {
		// 检测是否需要升级
		let packageCon = fs.readFileSync(`${projDir}/package.json`, "utf8");
		let minigamePath = path.join(projDir, "minigame.config.js");
		if (packageCon.includes("@vivo-minigame/cli-service") && fs.existsSync(minigamePath)) {
			return;
		}
	}
	// 如果有即存项目，但是是旧的项目，删掉后重新创建
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(projDir)) {
			return resolve();
		}
		let delList = [projDir];
		del(delList, { force: true }).then(paths => {
			resolve();
		});
	}).then(function() {
		// 在项目中创建vivo项目
		return new Promise((resolve, reject) => {
			console.log("(proj)开始创建vivo快游戏项目");
			// mg init <project-name>
			let cmd = `mg${commandSuffix}`;
			let args = ["init", config.vivoInfo.projName];
			let opts = {
				cwd: releaseDir,
				shell: true
			};

			let cp = childProcess.spawn(cmd, args, opts);
			
			cp.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`);
			});
			
			cp.stderr.on('data', (data) => {
				console.log(`stderr: ${data}`);
				// reject();
			});
			
			cp.on('close', (code) => {
				cp = null;
				console.log(`子进程退出码：${code}`);
				resolve();
			});
		});
	});
});

// 检查是否安装了adapter
gulp.task("createAdapter_VIVO", ["createProj_VIVO"], function() {
	// npm view @qgame/adapter version
	// npm i -S @qgame/adapter@latest
	let remoteVersion, localVersion;
	let isGetRemote, isGetLocal;
	let isUpdateAdapter = true;
	return new Promise((resolve, reject) => { // 远程版本号
		childProcess.exec("npm view @qgame/adapter version", function(error, stdout, stderr) {
			if (!stdout) { // 获取 @vivo-minigame/cli 远程版本号失败
				console.log("Failed to get the remote adapter version number");
				resolve();
				return;
			}
			remoteVersion = stdout.replace(/[\r\n]/g, "").trim();
			isGetRemote = true;
			if (isGetRemote && isGetLocal) {
				isUpdateAdapter = remoteVersion != localVersion;
				console.log(`remoteVersion: ${remoteVersion}, localVersion: ${localVersion}`);
				resolve();
			}
		});
		childProcess.exec("npm ls @qgame/adapter version", { cwd: projDir }, function(error, stdout, stderr) {
			if (!stdout) { // 获取  @vivo-minigame/cli 本地版本号失败
				console.log("Failed to get the local adapter version number");
				resolve();
				return;
			}
			let info = stdout.split("@qgame/adapter@"); //@qgame/adapter@1.0.3
			info = Array.isArray(info) && info[1] && info[1].replace(/[\r\n]/g, "").trim();
			localVersion = info;
			isGetLocal = true;
			if (isGetRemote && isGetLocal) {
				isUpdateAdapter = remoteVersion != localVersion;
				console.log(`remoteVersion: ${remoteVersion}, localVersion: ${localVersion}`);
				resolve();
			}
		});
		setTimeout(() => {
			// 如果获取到了本地版本号，但未获取到远程版本号，默认通过
			if (!isGetLocal || !isGetRemote) {
				console.log("Failed to get the local or remote version number");
				resolve();
				return;
			}
		}, 10000);
	}).then(() => {
		return new Promise((resolve, reject) => {
			if (!isUpdateAdapter) {
				resolve();
				return;
			}
			console.log("安装@qgame/adapter");
			// npm i -S @qgame/adapter@latest
			let cmd = `npm${commandSuffix}`;
			let args = ["install", "-S", "@qgame/adapter@latest"];
			let opts = {
				shell: true,
				cwd: projDir
			};
			let cp = childProcess.spawn(cmd, args, opts);
			
			cp.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`);
			});
	
			cp.stderr.on('data', (data) => {
				console.log(`stderr: ${data}`);
				// reject();
			});
	
			cp.on('close', (code) => {
				console.log(`2 end) npm i -S @qgame/adapter@latest：${code}`);
				resolve();
			});
		});
	}).catch((e) => {
		console.log("catch e", e);
	});
});

// 拷贝文件到vivo快游戏
gulp.task("copyFileToProj_VIVO", ["createAdapter_VIVO"], function() {
	// 如果有js/main.js，将其删除
	let vivoMainPath = path.join(projDir, "src", "js", "main.js");
	if (fs.existsSync(vivoMainPath)) {
		fs.unlinkSync(vivoMainPath);
	}
	// 将临时文件夹中的文件，拷贝到项目中去
	let originalDir = `${tempReleaseDir}/**/*.*`;
	let stream = gulp.src(originalDir);
	return stream.pipe(gulp.dest(path.join(projSrc)));
});

// 拷贝icon到vivo快游戏
gulp.task("copyIconToProj_VIVO", ["copyFileToProj_VIVO"], function() {
	let originalDir = config.vivoInfo.icon;
	let stream = gulp.src(originalDir);
	return stream.pipe(gulp.dest(projSrc));
});

// 清除vivo快游戏临时目录
gulp.task("clearTempDir_VIVO", ["copyIconToProj_VIVO"], function() {
	// 删掉临时目录
	return del([tempReleaseDir], { force: true });
});

// 生成release签名(私钥文件 private.pem 和证书文件 certificate.pem )
gulp.task("generateSign_VIVO", ["clearTempDir_VIVO"], function() {
    if (!config.vivoSign.generateSign) {
        return;
    }
	// https://doc.quickapp.cn/tools/compiling-tools.html
	return new Promise((resolve, reject) => {
		let cmd = "openssl";
		let args = ["req", "-newkey", "rsa:2048", "-nodes", "-keyout", "private.pem", 
					"-x509", "-days", "3650", "-out", "certificate.pem"];
		let opts = {
			cwd: projDir,
			shell: true
		};
		let cp = childProcess.spawn(cmd, args, opts);
		cp.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		cp.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			data += "";
			if (data.includes("Country Name")) {
				cp.stdin.write(`${config.vivoSign.countryName}\n`);
				console.log(`Country Name: ${config.vivoSign.countryName}`);
			} else if (data.includes("Province Name")) {
				cp.stdin.write(`${config.vivoSign.provinceName}\n`);
				console.log(`Province Name: ${config.vivoSign.provinceName}`);
			} else if (data.includes("Locality Name")) {
				cp.stdin.write(`${config.vivoSign.localityName}\n`);
				console.log(`Locality Name: ${config.vivoSign.localityName}`);
			} else if (data.includes("Organization Name")) {
				cp.stdin.write(`${config.vivoSign.orgName}\n`);
				console.log(`Organization Name: ${config.vivoSign.orgName}`);
			} else if (data.includes("Organizational Unit Name")) {
				cp.stdin.write(`${config.vivoSign.orgUnitName}\n`);
				console.log(`Organizational Unit Name: ${config.vivoSign.orgUnitName}`);
			} else if (data.includes("Common Name")) {
				cp.stdin.write(`${config.vivoSign.commonName}\n`);
				console.log(`Common Name: ${config.vivoSign.commonName}`);
			} else if (data.includes("Email Address")) {
				cp.stdin.write(`${config.vivoSign.emailAddr}\n`);
				console.log(`Email Address: ${config.vivoSign.emailAddr}`);
				// cp.stdin.end();
			}
			// reject();
		});

		cp.on('close', (code) => {
			console.log(`子进程退出码：${code}`);
			resolve();
		});
	});
});

// 拷贝sign文件到指定位置
gulp.task("copySignFile_VIVO", ["generateSign_VIVO"], function() {
    if (config.vivoSign.generateSign) { // 新生成的签名
        // 移动签名文件到项目中（Laya & vivo快游戏项目中）
        let 
            privatePem = path.join(projDir, "private.pem"),
            certificatePem = path.join(projDir, "certificate.pem");
        let isSignExits = fs.existsSync(privatePem) && fs.existsSync(certificatePem);
        if (!isSignExits) {
            return;
        }
        let 
            xiaomiDest = `${projDir}/sign/release`,
            layaDest = `${workSpaceDir}/sign/release`;
        let stream = gulp.src([privatePem, certificatePem]);
        return stream.pipe(gulp.dest(xiaomiDest))
                    .pipe(gulp.dest(layaDest));
    } else if (config.vivoInfo.useReleaseSign && !config.vivoSign.generateSign) { // 使用release签名，并且没有重新生成
        // 从项目中将签名拷贝到vivo快游戏项目中
        let 
            privatePem = path.join(workSpaceDir, "sign", "release", "private.pem"),
            certificatePem = path.join(workSpaceDir, "sign", "release", "certificate.pem");
        let isSignExits = fs.existsSync(privatePem) && fs.existsSync(certificatePem);
        if (!isSignExits) {
            return;
        }
        let 
            xiaomiDest = `${projDir}/sign/release`;
        let stream = gulp.src([privatePem, certificatePem]);
        return stream.pipe(gulp.dest(xiaomiDest));
    }
});

gulp.task("deleteSignFile_VIVO", ["copySignFile_VIVO"], function() {
	if (config.vivoSign.generateSign) { // 新生成的签名
		let 
            privatePem = path.join(projDir, "private.pem"),
            certificatePem = path.join(projDir, "certificate.pem");
		return del([privatePem, certificatePem], { force: true });
	}
});

gulp.task("modifyFile_VIVO", ["deleteSignFile_VIVO"], function() {
	// 修改manifest.json文件
	let manifestPath = path.join(projSrc, "manifest.json");
	if (!fs.existsSync(manifestPath)) {
		return;
	}
	let manifestContent = fs.readFileSync(manifestPath, "utf8");
	let manifestJson = JSON.parse(manifestContent);
	manifestJson.package = config.vivoInfo.package;
	manifestJson.name = config.vivoInfo.name;
	manifestJson.orientation = config.vivoInfo.orientation;
	manifestJson.config.logLevel = config.vivoInfo.logLevel || "off";
	manifestJson.deviceOrientation = config.vivoInfo.orientation;
	manifestJson.versionName = config.vivoInfo.versionName;
	manifestJson.versionCode = config.vivoInfo.versionCode;
	manifestJson.minPlatformVersion = config.vivoInfo.minPlatformVersion;
	manifestJson.icon = `/${path.basename(config.vivoInfo.icon)}`;
	if (config.vivoInfo.subpack) { // 分包
		manifestJson.subpackages = config.vivoSubpack;
	} else {
		delete manifestJson.subpackages;
	}
	// 增加thirdEngine字段
	let EngineVersion = getEngineVersion();
	if (EngineVersion) {
		manifestJson.thirdEngine = {
			"laya": EngineVersion
		};
	}
	fs.writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 4), "utf8");
	
	if (config.version) {
		let versionPath = projSrc + "/version.json";
		versionCon = fs.readFileSync(versionPath, "utf8");
		versionCon = JSON.parse(versionCon);
	}
	let indexJsStr = (versionCon && versionCon["index.js"]) ? versionCon["index.js"] :  "index.js";
	// 修改game.js文件
	let content = `require("@qgame/adapter");\nif(!window.navigator)\n\twindow.navigator = {};\nwindow.navigator.userAgent = 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile/14E8301 VVGame NetType/WIFI Language/zh_CN';
require("./libs/laya.vvmini.js");\nrequire("./index.js");`;
	let gameJsPath = path.join(projSrc, "game.js");
	fs.writeFileSync(gameJsPath, content, "utf8");

	// vivo项目，修改index.js
	let filePath = path.join(projSrc, indexJsStr);
	if (!fs.existsSync(filePath)) {
		return;
	}
	let fileContent = fs.readFileSync(filePath, "utf8");
	fileContent = fileContent.replace(/loadLib(\(['"])/gm, "require$1./");
	fs.writeFileSync(filePath, fileContent, "utf8");
})

function getEngineVersion() {
	let coreLibPath = path.join(workSpaceDir, "bin", "libs", "laya.core.js");
	let isHasCoreLib = fs.existsSync(coreLibPath);
	let isOldAsProj = fs.existsSync(`${workSpaceDir}/asconfig.json`) && !isHasCoreLib;
	let isNewTsProj = fs.existsSync(`${workSpaceDir}/src/tsconfig.json`) && !isHasCoreLib;
	let EngineVersion;
	if (isHasCoreLib) {
		let con = fs.readFileSync(coreLibPath, "utf8");
		let matchList = con.match(/Laya\.version\s*=\s*['"]([0-9\.]+(beta)?.*)['"]/);
		if (!Array.isArray(matchList)) {
			return null;
		}
		EngineVersion = matchList[1];
	} else { // newts项目和旧版本as项目
		if (isOldAsProj) {
			let coreLibFilePath = path.join(workSpaceDir, "libs", "laya", "src", "Laya.as");
			if (!fs.existsSync(coreLibFilePath)) {
				return null;
			}
			let con = fs.readFileSync(coreLibFilePath, "utf8");
			let matchList = con.match(/version:String\s*=\s*['"]([0-9\.]+(beta)?.*)['"]/);
			if (!Array.isArray(matchList)) {
				return null;
			}
			EngineVersion = matchList[1];
		} else if (isNewTsProj) {
			let coreLibFilePath = path.join(workSpaceDir, "libs", "Laya.ts");
			if (!fs.existsSync(coreLibFilePath)) {
				return null;
			}
			let con = fs.readFileSync(coreLibFilePath, "utf8");
			let matchList = con.match(/static\s*version:\s*string\s*=\s*['"]([0-9\.]+(beta)?.*)['"]/);
			if (!Array.isArray(matchList)) {
				return null;
			}
			EngineVersion = matchList[1];
		}
	}
	return EngineVersion;
}

gulp.task("modifyMinJs_VIVO", ["modifyFile_VIVO"], function() {
	if (!config.useMinJsLibs) {
		return;
	}
	let fileJsPath = path.join(projSrc, "game.js");
	let content = fs.readFileSync(fileJsPath, "utf-8");
	content = content.replace("laya.vvmini.js", "min/laya.vvmini.min.js");
	fs.writeFileSync(fileJsPath, content, 'utf-8');
});

gulp.task("version_VIVO", ["modifyMinJs_VIVO"], function () {
	if (config.version) {
		let versionPath = projSrc + "/version.json";
		let mainJSPath = projSrc + "/game.js";
		let srcList = [versionPath, mainJSPath];
		return gulp.src(srcList)
			.pipe(revCollector())
			.pipe(gulp.dest(projSrc));
	}
});

// 处理engine文件夹，允许开发者自己在bin下定义engine文件夹，以获得针对性的优化
gulp.task("dealEngineFolder1_VIVO", ["version_VIVO"], function() {
	// 如果项目中有engine文件夹，我们默认该开发者是熟悉VIVO发布流程的，已经处理好所有的逻辑
	// 值得注意的:
	// 1) 如果有engine文件夹而未处理2D物理库(box2d.js/physics.js)，项目将无法运行
	// 2) 如果未处理3D物理库(physics3D.js)，打包时间将会很长

	let engineFolder = path.join(projDir, "src", "engine");
	isExistEngineFolder = fs.existsSync(engineFolder);
	if (!isExistEngineFolder) {
		return;
	}

	// 不想写一堆task任务，500ms默认拷贝完成吧
	// 未来有了更好的解决方案再修改
	return new Promise(function(resolve, reject) {
		// 将engine文件夹拷贝到projRoot下
		setTimeout(resolve, 500);
		var stream = gulp.src([`${engineFolder}/**/*.*`], {base: `${projDir}/src`});
		return stream.pipe(gulp.dest(projDir));
	}).then(function() {
		return new Promise(function(resolve, reject) {
			// 删掉src下的engine和adapter
			setTimeout(resolve, 500);
			return del([engineFolder], { force: true });
		});
	}).catch(function(err) {
		console.log(err);
	});
});

gulp.task("dealEngineFolder2_VIVO", ["dealEngineFolder1_VIVO"], function() {
	if (!isExistEngineFolder) {
		return;
	}
	
	let engineFolder = path.join(projDir, "engine");
	let engineFileList = fs.readdirSync(engineFolder);
	// 修改配置文件
	configVivoConfigFile(engineFileList);
});

// 如果项目中用到了 box2d.js|laya.physics.js/laya.physics3D.js ，需要特殊处理
// 之前处理的是有项目中已经存在engine文件夹的情况，现在开始处理没有文件夹的情况
gulp.task("dealNoCompile1_VIVO", ["dealEngineFolder2_VIVO"], function() {
	if (!isDealNoCompile) {
		return;
	}

	// 将js/bundle.js | libs/*.* 全放到engine文件夹中
	let indexJsStr = (versionCon && versionCon["index.js"]) ? versionCon["index.js"] :  "index.js";
	let bundleJsStr = (versionCon && versionCon["js/bundle.js"]) ? versionCon["js/bundle.js"] :  "js/bundle.js";
	let layaJsStr = (versionCon && versionCon["laya.js"]) ? versionCon["laya.js"] :  "laya.js";

	// 修改index.js，去掉物理库前面的libs
	let filePath = path.join(projSrc, indexJsStr);
	let fileContent = fs.readFileSync(filePath, "utf8");
	let physicsNameList = [];

	if (fileContent.includes(bundleJsStr)) {
		let adapterJsPath = path.join(projSrc, bundleJsStr);
		physicsNameList.push(bundleJsStr);
		physicsLibsPathList.push(adapterJsPath);
	}
	if (fileContent.includes(layaJsStr)) {
		let layaJsPath = path.join(projSrc, layaJsStr);
		physicsNameList.push(layaJsStr);
		physicsLibsPathList.push(layaJsPath);
	}
	let libsList = fs.readdirSync(path.join(projSrc, "libs"));
	let libsFileName, libsFilePath;
	for (let i = 0, len = libsList.length; i < len; i++) {
		libsFileName = libsList[i];
		libsFilePath = path.join(projSrc, "libs", libsFileName);
		physicsNameList.push(`libs/${libsFileName}`);
		physicsLibsPathList.push(libsFilePath);
	}
	let minPath = path.join(projSrc, "libs", "min");
	if (fs.existsSync(minPath)) {
		let minLibsList = fs.readdirSync(minPath);
		let minLibsFileName, minLibsFilePath;
		for (let i = 0, len = minLibsList.length; i < len; i++) {
			minLibsFileName = minLibsList[i];
			minLibsFilePath = path.join(minPath, minLibsFileName);
			physicsNameList.push(`libs/min/${minLibsFileName}`);
			physicsLibsPathList.push(minLibsFilePath);
		}
	}

	// 修改配置文件
	configVivoConfigFile(physicsNameList);

	// 将物理库拷贝到engine中
	var stream = gulp.src(physicsLibsPathList, {base: projSrc});
	return stream.pipe(gulp.dest(path.join(projDir, "engine")));
});

function configVivoConfigFile(engineFileList) {
	let vvConfigPath = path.join(projDir, "minigame.config.js");
	let content = fs.readFileSync(vvConfigPath, "utf8");
	let externalsStr = 'const externals = [\n';
	let libName;
	// let engineStr = '';
	let inLayaLibs = false, dirName, newLibPath;
	for (let i = 0, len = engineFileList.length; i < len; i++) {
		libName = engineFileList[i];
		if (i !== 0) {
			externalsStr += ',\n';
		}
		newLibPath = libName.replace("libs/min/", "").replace("libs/", "");
		inLayaLibs = config.uesEnginePlugin && fullRemoteEngineList.includes(newLibPath);
		dirName = inLayaLibs ? "laya-library" : "engine";
		if (inLayaLibs) {
			// engineStr += `{\n\t\tmodule_name:'${dirName}/${newLibPath}',\n\t\tmodule_path:'${dirName}/${newLibPath}',\n\t\tmodule_from:'${dirName}/${newLibPath}'\n\t},`;
			externalsStr += `\t{\n\t\tmodule_name:'${dirName}/${newLibPath}',\n\t\tmodule_path:'${dirName}/${newLibPath}',\n\t\tmodule_from:'${dirName}/${newLibPath}'\n\t}`;
		} else {
			externalsStr += `\t{\n\t\tmodule_name:'./${libName}',\n\t\tmodule_path:'./${libName}',\n\t\tmodule_from:'${dirName}/${libName}'\n\t}`;
		}
	}
	externalsStr += '\t]';
	content = content.replace(/const externals = \[([^*].|\n|\r)*\]/gm, externalsStr);
	fs.writeFileSync(vvConfigPath, content, "utf8");
}

gulp.task("dealNoCompile2_VIVO", ["dealNoCompile1_VIVO"], function() {
	if (!isDealNoCompile || physicsLibsPathList.length === 0) {
		return;
	}
	return del(physicsLibsPathList, { force: true });
});

// 处理引擎插件
// 我们会将所有的libs下的文件放到engine里，但不能认定libs下全是我们的引擎，所以还是要加判断
gulp.task("pluginEngin_VIVO", ["dealNoCompile2_VIVO"], function(cb) {
	
	let manifestJsonPath = path.join(projSrc, "manifest.json");
	let manifestJsonContent = fs.readFileSync(manifestJsonPath, "utf8");
	let conJson = JSON.parse(manifestJsonContent);
	let copyBinPath;

	if (!config.uesEnginePlugin) { // 没有使用引擎插件，还是像以前一样发布
		delete conJson.plugins;
		manifestJsonContent = JSON.stringify(conJson, null, 4);
		fs.writeFileSync(manifestJsonPath, manifestJsonContent, "utf8");
		return cb();
	}
	// 引擎源码项目
	// TODO
	// 将所有的min拷贝进来
	if (config.useMinJsLibs) {
		copyBinPath = path.join(workSpaceDir, "bin", "libs", "min");
	} else { // 如果不是min
		copyBinPath = path.join(workSpaceDir, "bin", "libs");
	}
	// TODO 针对min引擎文件，很多配置文件也需要该，同时改
	if (config.version) {
		let versionPath = projSrc + "/version.json";
		versionCon = fs.readFileSync(versionPath, "utf8");
		versionCon = JSON.parse(versionCon);
	}
	let indexJsStr = (versionCon && versionCon["index.js"]) ? versionCon["index.js"] :  "index.js";
	
	// 获取version等信息
	let coreLibPath = path.join(workSpaceDir, "bin", "libs", "laya.core.js");
	let isHasCoreLib = fs.existsSync(coreLibPath);
	let isOldAsProj = fs.existsSync(`${workSpaceDir}/asconfig.json`) && !isHasCoreLib;
	let isNewTsProj = fs.existsSync(`${workSpaceDir}/src/tsconfig.json`) && !isHasCoreLib;
	let EngineVersion = getEngineVersion();
	if (isOldAsProj || isNewTsProj) {
		console.log("ts源码项目及as源码项目，无法使用引擎插件功能!");
		return cb();
	}
	// 使用引擎插件
	let localUseEngineList = [];
	let copyEnginePathList;
	new Promise(function(resolve, reject) {
		console.log(`修改game.js和game.json`);
		// 1) 修改game.js和game.json
		// 修改game.js
		let gameJsPath = path.join(projSrc, "game.js");
		let gameJscontent = fs.readFileSync(gameJsPath, "utf8");
		gameJscontent = gameJscontent.replace(`require("./${indexJsStr}");`, `requirePlugin('layaPlugin');\nrequire("./${indexJsStr}");`);
		fs.writeFileSync(gameJsPath, gameJscontent, "utf8");
		
		// 修改manifest.json，使其支持引擎插件
		conJson.plugins = {
			"laya-library": {
				"version": EngineVersion,
				"provider": "",
				"path": "laya-library"
			}
		}
		manifestJsonContent = JSON.stringify(conJson, null, 4);
		fs.writeFileSync(manifestJsonPath, manifestJsonContent, "utf8");
		resolve();
	}).then(function() {
		return new Promise(function(resolve, reject) {
			console.log(`确定用到的插件引擎`);
			// 2) 确定用到了那些插件引擎，并将插件引擎从index.js的引用中去掉
			let indexJsPath = path.join(projSrc, indexJsStr);
			let indexJsCon = fs.readFileSync(indexJsPath, "utf8");
			let item, fullRequireItem;
			for (let i = 0, len = fullRemoteEngineList.length; i < len; i++) {
				item = fullRemoteEngineList[i];
				fullRequireItem = config.useMinJsLibs ? `require("./libs/min/${item}")` : `require("./libs/${item}")`;
				if (indexJsCon.includes(fullRequireItem)) {
					localUseEngineList.push(item);
					indexJsCon = indexJsCon.replace(fullRequireItem + ";", "").replace(fullRequireItem + ",", "").replace(fullRequireItem, "");
				}
			}
			fs.writeFileSync(indexJsPath, indexJsCon, "utf8");
			// 再次修改game.js，仅引用使用到的类库
			let pluginCon = "", normalCon = "";
			localUseEngineList.forEach(function(item) {
				pluginCon += `\trequirePlugin("laya-library/${item}");\n`;
				normalCon += `\trequire("laya-library/${item}");\n`;
			});
			let finalyPluginCon = `if (window.requirePlugin) {\n${pluginCon}\n} else {\n${normalCon}\n}`;
			let gameJsPath = path.join(projSrc, "game.js");
			let gameJsCon = fs.readFileSync(gameJsPath, "utf8");
			gameJsCon = gameJsCon.replace(`requirePlugin('layaPlugin');`, finalyPluginCon);
			fs.writeFileSync(gameJsPath, gameJsCon, "utf8");
			resolve();
		});
	}).then(function() {
		return new Promise(function(resolve, reject) {
			console.log(`将本地的引擎插件移动到laya-libs中`);
			// 3) 将本地的引擎插件移动到laya-libs中
			copyEnginePathList = [`${copyBinPath}/{${fullRemoteEngineList.join(",")}}`];
			gulp.src(copyEnginePathList).pipe(gulp.dest(`${projDir}/laya-library`));
			setTimeout(resolve, 500);
		});
	}).then(function() {
		return new Promise(function(resolve, reject) {
			console.log(`将libs中的本地引擎插件删掉`);
			// 4) 将libs中的本地引擎插件删掉
			let deleteList = [`${projDir}/engine/libs/{${localUseEngineList.join(",")}}`, `${projDir}/engine/libs/min/{${localUseEngineList.join(",")}}`];
			del(deleteList, { force: true }).then(resolve);
		});
	}).then(function() {
		return new Promise(async function(resolve, reject) {
			console.log(`完善引擎插件目录`);
			// 5) 引擎插件目录laya-libs中还需要新建几个文件，使该目录能够使用
			let 
				layalibsPath = path.join(projDir, "laya-library"),
				engineIndex = path.join(layalibsPath, "index.js"),
				engineplugin = path.join(layalibsPath, "plugin.json");
				// enginesignature = path.join(layalibsPath, "signature.json");
			// index.js
			if (!fs.existsSync(layalibsPath)) {
				throw new Error("引擎插件目录创建失败，请与服务提供商联系!");
			}
			let layaLibraryList = fs.readdirSync(layalibsPath);
			let indexCon = "";
			layaLibraryList.forEach(function(item) {
				indexCon += `require("./${item}");\n`;
			});
			fs.writeFileSync(engineIndex, indexCon, "utf8");
			// plugin.json
			let pluginCon = {"main": "index.js"};
			fs.writeFileSync(engineplugin, JSON.stringify(pluginCon, null, 4), "utf8");
			// signature.json
			// let signatureCon = {
			// 	"provider": provider,
			// 	"signature": []
			// };
			// localUseEngineList.unshift("index.js");
			// let fileName, md5Str;
			// for (let i = 0, len = localUseEngineList.length; i < len; i++) {
			// 	fileName = localUseEngineList[i];
			// 	let md5Str = await getFileMd5(path.join(projDir, "laya-library", fileName));
			// 	signatureCon.signature.push({
			// 		"path": fileName,
			// 		"md5": md5Str
			// 	});
			// }
			// fs.writeFileSync(enginesignature, JSON.stringify(signatureCon, null, 4), "utf8");
			resolve();
		});
	})
	.then(function() {
		cb();
	}).catch(function(e) {
		throw e;
	})
});

// 打包rpk
gulp.task("buildRPK_VIVO", ["pluginEngin_VIVO"], function() {
	// 在vivo轻游戏项目目录中执行:
    // npm run build || npm run release
    let cmdStr = "build";
    if (config.vivoInfo.useReleaseSign) {
        cmdStr = "release";
    }
	return new Promise((resolve, reject) => {
		let cmd = `npm${commandSuffix}`;
		let args = ["run", cmdStr];
		let opts = {
			cwd: projDir,
			shell: true
		};
		let cp = childProcess.spawn(cmd, args, opts);
		// let cp = childProcess.spawn(`npx${commandSuffix}`, ['-v']);
		cp.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		cp.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			console.log(`stderr(iconv): ${iconv.decode(data, 'gbk')}`);
			
			// reject();
		});

		cp.on('close', (code) => {
			console.log(`子进程退出码：${code}`);
			resolve();
		});
	});
});

gulp.task("showQRCode_VIVO", ["buildRPK_VIVO"], function() {
	// 在vivo轻游戏项目目录中执行:
	// npm run server
	return new Promise((resolve, reject) => {
		let cmd = `npm${commandSuffix}`;
		let args = ["run", "server"];
		let opts = {
			cwd: projDir,
			shell: true
		};
		let cp = childProcess.spawn(cmd, args, opts);
		// let cp = childProcess.spawn(`npx${commandSuffix}`, ['-v']);
		cp.stdout.on('data', (data) => {
			console.log(`${data}`);
			// 输出pid，macos要用: macos无法kill进程树，也无法执行命令获取3000端口pid(没有查询权限)，导致无法kill这个进程
			console.log('vv_qrcode_pid:' + cp.pid);
		});

		cp.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			console.log(`stderr(iconv): ${iconv.decode(data, 'gbk')}`);
			// reject();
		});

		cp.on('close', (code) => {
			console.log(`子进程退出码：${code}`);
			resolve();
		});
	});
});


gulp.task("buildVivoProj", ["showQRCode_VIVO"], function() {
	console.log("all tasks completed");
});