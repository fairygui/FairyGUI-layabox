// v1.1.1
// publish 2.x 也是用这个文件，需要做兼容
let isPublish2 = process.argv[2].includes("publish_xmgame.js") && process.argv[3].includes("--evn=publish2");
// 获取Node插件和工作路径
let ideModuleDir, workSpaceDir;
if (isPublish2) {
	//是否使用IDE自带的node环境和插件，设置false后，则使用自己环境(使用命令行方式执行)
	const useIDENode = process.argv[0].indexOf("LayaAir") > -1 ? true : false;
	ideModuleDir = useIDENode ? process.argv[1].replace("gulp\\bin\\gulp.js", "").replace("gulp/bin/gulp.js", "") : "";
	workSpaceDir = useIDENode ? process.argv[2].replace("--gulpfile=", "").replace("\\.laya\\publish_xmgame.js", "").replace("/.laya/publish_xmgame.js", "") + "/" : "./../";
} else {
	ideModuleDir = global.ideModuleDir;
	workSpaceDir = global.workSpaceDir;
}

//引用插件模块
const gulp = require(ideModuleDir + "gulp");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const del = require(ideModuleDir + "del");
const revCollector = require(ideModuleDir + 'gulp-rev-collector');
let commandSuffix = ".cmd";

let prevTasks = ["packfile"];
if (isPublish2) {
	prevTasks = "";
}

let 
    config,
	platform,
	releaseDir,
    tempReleaseDir, // 小米临时拷贝目录
	projDir; // 小米快游戏工程目录
let IDEXMProjPath,
	isUpdateIDEXMProj = false;
let versionCon; // 版本管理version.json
// 创建小米项目前，拷贝小米引擎库、修改index.js
// 应该在publish中的，但是为了方便发布2.0及IDE 1.x，放在这里修改
gulp.task("preCreate_XM", prevTasks, function() {
	if (isPublish2) {
		let pubsetPath = path.join(workSpaceDir, ".laya", "pubset.json");
		let content = fs.readFileSync(pubsetPath, "utf8");
		let pubsetJson = JSON.parse(content);
		platform = "xmgame";
		releaseDir = path.join(workSpaceDir, "release", platform).replace(/\\/g, "/");
		releaseDir = tempReleaseDir = path.join(releaseDir, "temprelease");
		config = pubsetJson[4]; // 只用到了 config.xmInfo|config.xmSign
	} else {
		platform = global.platform;
		releaseDir = global.releaseDir;
		tempReleaseDir = global.tempReleaseDir;
		config = global.config;
	}
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	if (process.platform === "darwin") {
		commandSuffix = "";
	}
	let copyLibsList = [`${workSpaceDir}/bin/libs/laya.xmmini.js`];
	var stream = gulp.src(copyLibsList, { base: `${workSpaceDir}/bin` });
	return stream.pipe(gulp.dest(tempReleaseDir));
});

gulp.task("copyPlatformFile_XM", ["preCreate_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	let xmAdapterPath = path.join(ideModuleDir, "../", "out", "layarepublic", "LayaAirProjectPack", "lib", "data", "xmfiles");
	let copyLibsList = [`${xmAdapterPath}/**/*.*`];
	var stream = gulp.src(copyLibsList);
	return stream.pipe(gulp.dest(tempReleaseDir));
});

// 新建小米项目-小米项目与其他项目不同，需要新建小米快游戏项目，并打包成.rpk文件
gulp.task("checkIDEProj_XM", ["copyPlatformFile_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	if (!ideModuleDir) {
		return;
	}
	IDEXMProjPath = path.join(ideModuleDir, "../", "out", "layarepublic", "xm");
	if (process.platform === "darwin") {
		return;
	}
	let ideLastXMProjPath = path.join(IDEXMProjPath, config.xmInfo.projName);
	// 如果IDE中没有小米项目，跳过这一步
	let isProjExist = fs.existsSync(ideLastXMProjPath + "/node_modules") && 
					  fs.existsSync(ideLastXMProjPath + "/sign");
	if (!isProjExist) {
		console.log("IDE中没有小米项目，跳过检查小米项目版本号这一步");
		return;
	}
	// 如果IDE中项目已经存在了，检查版本号
	// npm view quickgame-cli version
	// npm ls quickgame-cli
	let remoteVersion, localVersion;
	let isGetRemote, isGetLocal;
	return new Promise((resolve, reject) => { // 远程版本号
		childProcess.exec("npm view quickgame-cli version", function(error, stdout, stderr) {
			if (!stdout) { // 获取 quickgame-cli 远程版本号失败
				reject();
				return;
			}
			remoteVersion = stdout;
			isGetRemote = true;
			if (isGetRemote && isGetLocal) {
				resolve();
			}
		});
		childProcess.exec("npm ls quickgame-cli", { cwd: ideLastXMProjPath }, function(error, stdout, stderr) {
			if (!stdout) { // 获取 quickgame-cli 本地版本号失败
				reject();
				return;
			}
			localVersion = stdout.match(/quickgame-cli@(.+)/);
			localVersion = localVersion && localVersion[1];
			isGetLocal = true;
			if (isGetRemote && isGetLocal) {
				resolve();
			}
		});
		setTimeout(() => {
			if (!isGetLocal || !isGetRemote) {
				console.log("获取远程版本号或本地版本号失败");
				reject();
				return;
			}
		}, 10000);
	}).then(() => { // 比较两个版本号
		if (!remoteVersion || !localVersion) {
			console.log("获取远程版本号或本地版本号失败!");
		}
		console.log("quickgame-cli -> ", localVersion, "|", remoteVersion);
		if (remoteVersion.trim() !== localVersion.trim()) { // 仅当两个版本号都获取到并且不相等，置为需要更新(true)
			isUpdateIDEXMProj = true;
		}
	}).catch((e) => {
		console.log("获取远程版本号或本地版本号失败 -> ", remoteVersion, "|", localVersion);
		console.log(e);
	});
});

gulp.task("createIDEProj_XM", ["checkIDEProj_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	if (!ideModuleDir) {
		return;
	}
	if (process.platform === "darwin") {
		return;
	}
	let ideLastXMProjPath = path.join(IDEXMProjPath, config.xmInfo.projName);
	// 如果有即存项目，不再新建
	let isProjExist = fs.existsSync(ideLastXMProjPath + "/node_modules") && 
					  fs.existsSync(ideLastXMProjPath + "/sign");
	if (isProjExist && !isUpdateIDEXMProj) { // 项目存在并且不需要更新IDE中的小米项目
		return;
	}
	return new Promise((resolve, reject) => {
		console.log("(IDE)开始创建小米快游戏项目，请耐心等待(预计需要10分钟)...");
		let cmd = `npx${commandSuffix}`;
		let args = ["create-quickgame", config.xmInfo.projName, `path=${IDEXMProjPath}`,
					`package=${config.xmInfo.package}`, `versionName=${config.xmInfo.versionName}`,
					`versionCode=${config.xmInfo.versionCode}`, `minPlatformVersion=${config.xmInfo.minPlatformVersion}`,
                    `icon=/layaicon/${path.basename(config.xmInfo.icon)}`, `name=${config.xmInfo.name}`, `rebuild=true`];
        console.log(JSON.stringify(args));
        
        let cp = childProcess.spawn(cmd, args);
        
		cp.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});
		
		cp.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			// reject();
		});
		
		cp.on('close', (code) => {
			console.log(`子进程退出码：${code}`);
			resolve();
		});
	});
});

gulp.task("createProj_XM", ["createIDEProj_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	releaseDir = path.dirname(releaseDir);
	projDir = path.join(releaseDir, config.xmInfo.projName);
	// 如果有即存项目，不再新建
	let isProjExist = fs.existsSync(projDir + "/node_modules") && 
					  fs.existsSync(projDir + "/sign");
	if (isProjExist) {
		return;
	}
	// 如果IDE中有即存项目，不再新建，从IDE中拷贝
	let ideLastXMProjPath = path.join(IDEXMProjPath, config.xmInfo.projName);
	let isIDEXMProjExist = fs.existsSync(ideLastXMProjPath + "/node_modules") && 
						fs.existsSync(ideLastXMProjPath + "/sign");
	if (isIDEXMProjExist) { // 如果用的IDE并且有IDEXM目录
		console.log("使用IDE中的小米游戏项目，拷贝...");
		// node-glob语法中，* 无法匹配 .开头的文件(夹)，必须手动匹配
		let IDEXMProjPathStr = [`${IDEXMProjPath}/**/*.*`, `${ideLastXMProjPath}/node_modules/.bin/*.*`];
		var stream = gulp.src(IDEXMProjPathStr, { base: IDEXMProjPath});
		return stream.pipe(gulp.dest(releaseDir));
	}
	// 在项目中创建小米项目
	return new Promise((resolve, reject) => {
		console.log("(proj)开始创建小米快游戏项目，请耐心等待(预计需要10分钟)...");
		let cmd = `npx${commandSuffix}`;
		let args = ["create-quickgame", config.xmInfo.projName, `path=${releaseDir}`,
					`package=${config.xmInfo.package}`, `versionName=${config.xmInfo.versionName}`,
					`versionCode=${config.xmInfo.versionCode}`, `minPlatformVersion=${config.xmInfo.minPlatformVersion}`,
                    `icon=/layaicon/${path.basename(config.xmInfo.icon)}`, `name=${config.xmInfo.name}`, `rebuild=true`];
        console.log(JSON.stringify(args));
        
        let cp = childProcess.spawn(cmd, args);
        
		cp.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});
		
		cp.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			// reject();
		});
		
		cp.on('close', (code) => {
			console.log(`子进程退出码：${code}`);
			resolve();
		});
	});
});

// 拷贝文件到小米快游戏
gulp.task("copyFileToProj_XM", ["createProj_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	// 将临时文件夹中的文件，拷贝到项目中去
	let originalDir = `${tempReleaseDir}/**/*.*`;
	let stream = gulp.src(originalDir);
	return stream.pipe(gulp.dest(path.join(projDir)));
});

// 拷贝icon到小米快游戏
gulp.task("copyIconToProj_XM", ["copyFileToProj_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	let originalDir = config.xmInfo.icon;
	let stream = gulp.src(originalDir);
	return stream.pipe(gulp.dest(path.join(projDir, "layaicon")));
});

// 清除小米快游戏临时目录
gulp.task("clearTempDir_XM", ["copyIconToProj_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	// 删掉临时目录
	return del([tempReleaseDir], { force: true });
});

// 生成release签名(私钥文件 private.pem 和证书文件 certificate.pem )
gulp.task("generateSign_XM", ["clearTempDir_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
    }
    if (!config.xmSign.generateSign) {
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
				cp.stdin.write(`${config.xmSign.countryName}\n`);
				console.log(`Country Name: ${config.xmSign.countryName}`);
			} else if (data.includes("Province Name")) {
				cp.stdin.write(`${config.xmSign.provinceName}\n`);
				console.log(`Province Name: ${config.xmSign.provinceName}`);
			} else if (data.includes("Locality Name")) {
				cp.stdin.write(`${config.xmSign.localityName}\n`);
				console.log(`Locality Name: ${config.xmSign.localityName}`);
			} else if (data.includes("Organization Name")) {
				cp.stdin.write(`${config.xmSign.orgName}\n`);
				console.log(`Organization Name: ${config.xmSign.orgName}`);
			} else if (data.includes("Organizational Unit Name")) {
				cp.stdin.write(`${config.xmSign.orgUnitName}\n`);
				console.log(`Organizational Unit Name: ${config.xmSign.orgUnitName}`);
			} else if (data.includes("Common Name")) {
				cp.stdin.write(`${config.xmSign.commonName}\n`);
				console.log(`Common Name: ${config.xmSign.commonName}`);
			} else if (data.includes("Email Address")) {
				cp.stdin.write(`${config.xmSign.emailAddr}\n`);
				console.log(`Email Address: ${config.xmSign.emailAddr}`);
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
gulp.task("copySignFile_XM", ["generateSign_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
    }
    if (config.xmSign.generateSign) { // 新生成的签名
        // 移动签名文件到项目中（Laya & 小米快游戏项目中）
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
    } else if (config.xmInfo.useReleaseSign && !config.xmSign.generateSign) { // 使用release签名，并且没有重新生成
        // 从项目中将签名拷贝到小米快游戏项目中
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

gulp.task("deleteSignFile_XM", ["copySignFile_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	if (config.xmSign.generateSign) { // 新生成的签名
		let 
            privatePem = path.join(projDir, "private.pem"),
            certificatePem = path.join(projDir, "certificate.pem");
		return del([privatePem, certificatePem], { force: true });
	}
});

gulp.task("modifyFile_XM", ["deleteSignFile_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	// 修改manifest.json文件
	let manifestPath = path.join(projDir, "manifest.json");
	if (!fs.existsSync(manifestPath)) {
		return;
	}
	let manifestContent = fs.readFileSync(manifestPath, "utf8");
	let manifestJson = JSON.parse(manifestContent);
	manifestJson.package = config.xmInfo.package;
	manifestJson.name = config.xmInfo.name;
	manifestJson.orientation = config.xmInfo.orientation;
	manifestJson.versionName = config.xmInfo.versionName;
	manifestJson.versionCode = config.xmInfo.versionCode;
	manifestJson.minPlatformVersion = config.xmInfo.minPlatformVersion;
	manifestJson.icon = `/layaicon/${path.basename(config.xmInfo.icon)}`;
	fs.writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 4), "utf8");

	if (config.version) {
		let versionPath = projDir + "/version.json";
		versionCon = fs.readFileSync(versionPath, "utf8");
		versionCon = JSON.parse(versionCon);
	}
	let indexJsStr = (versionCon && versionCon["index.js"]) ? versionCon["index.js"] :  "index.js";
	// 修改main.js文件
	let content = 'require("./qg-adapter.js");\nrequire("./libs/laya.xmmini.js");\nrequire("./index.js");';
	let mainJsPath = path.join(projDir, "main.js");
	fs.writeFileSync(mainJsPath, content, "utf8");

	// 小米项目，修改index.js
	let filePath = path.join(projDir, indexJsStr);
	if (!fs.existsSync(filePath)) {
		return;
	}
	let fileContent = fs.readFileSync(filePath, "utf8");
	fileContent = fileContent.replace(/loadLib(\(['"])/gm, "require$1./");
	fs.writeFileSync(filePath, fileContent, "utf8");
})

gulp.task("version_XM", ["modifyFile_XM"], function () {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	if (config.version) {
		let versionPath = projDir + "/version.json";
		let mainJSPath = projDir + "/main.js";
		let srcList = [versionPath, mainJSPath];
		return gulp.src(srcList)
			.pipe(revCollector())
			.pipe(gulp.dest(projDir));
	}
});

// 打包rpk
gulp.task("buildRPK_XM", ["version_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	// 在小米轻游戏项目目录中执行:
    // npm run build || npm run release
    let cmdStr = "build";
    if (config.xmInfo.useReleaseSign) {
        cmdStr = "release";
    }
	return new Promise((resolve, reject) => {
		let cmd = `npm${commandSuffix}`;
		let args = ["run", cmdStr];
		let opts = {
			cwd: projDir
		};
		let cp = childProcess.spawn(cmd, args, opts);
		// let cp = childProcess.spawn(`npx${commandSuffix}`, ['-v']);
		cp.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		cp.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			// reject();
		});

		cp.on('close', (code) => {
			console.log(`子进程退出码：${code}`);
			resolve();
		});
	});
});

gulp.task("showQRCode_XM", ["buildRPK_XM"], function() {
	// 如果不是小米快游戏
	if (platform !== "xmgame") {
		return;
	}
	// 在小米轻游戏项目目录中执行:
	// npm run server
	return new Promise((resolve, reject) => {
		let cmd = `npm${commandSuffix}`;
		let args = ["run", "server"];
		let opts = {
			cwd: projDir
		};
		let cp = childProcess.spawn(cmd, args, opts);
		// let cp = childProcess.spawn(`npx${commandSuffix}`, ['-v']);
		cp.stdout.on('data', (data) => {
			console.log(`${data}`);
			// 输出pid，macos要用: macos无法kill进程树，也无法执行命令获取3000端口pid(没有查询权限)，导致无法kill这个进程
			console.log('xm_qrcode_pid:' + cp.pid);
		});

		cp.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			// reject();
		});

		cp.on('close', (code) => {
			console.log(`子进程退出码：${code}`);
			resolve();
		});
	});
});


gulp.task("buildXiaomiProj", ["showQRCode_XM"], function() {
	console.log("all tasks completed");
});