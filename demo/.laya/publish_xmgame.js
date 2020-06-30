// v1.7.0
const ideModuleDir = global.ideModuleDir;
const workSpaceDir = global.workSpaceDir;

//引用插件模块
const gulp = require(ideModuleDir + "gulp");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const del = require(ideModuleDir + "del");
const revCollector = require(ideModuleDir + 'gulp-rev-collector');

let copyLibsTask = ["copyPlatformLibsJsFile"];
let packfiletask = ["packfile"];

let 
    config,
	releaseDir,
    tempReleaseDir, // 小米临时拷贝目录
	projDir; // 小米快游戏工程目录
let IDEXMProjPath,
	isUpdateIDEXMProj = false;
let versionCon; // 版本管理version.json
let commandSuffix,
	layarepublicPath;

// 创建小米项目前，拷贝小米引擎库、修改index.js
gulp.task("preCreate_XM", copyLibsTask, function() {
	releaseDir = global.releaseDir;
	config = global.config;
	commandSuffix = global.commandSuffix;
	layarepublicPath = global.layarepublicPath;
	tempReleaseDir = global.tempReleaseDir;
});

gulp.task("copyPlatformFile_XM", ["preCreate_XM"], function() {
	let xmAdapterPath = path.join(layarepublicPath, "LayaAirProjectPack", "lib", "data", "xmfiles");
	let copyLibsList = [`${xmAdapterPath}/**/*.*`];
	var stream = gulp.src(copyLibsList);
	return stream.pipe(gulp.dest(tempReleaseDir));
});

gulp.task("createProj_XM", packfiletask, function() {
	releaseDir = path.dirname(releaseDir);
	projDir = path.join(releaseDir, config.xmInfo.projName);
	// 如果有即存项目，不再新建
	let isProjExist = fs.existsSync(projDir + "/node_modules") && 
					  fs.existsSync(projDir + "/sign");
	if (isProjExist) {
		return;
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
			console.log(`子进程退出码：${code}`);
			resolve();
		});
	});
});

// 拷贝文件到小米快游戏
gulp.task("copyFileToProj_XM", ["createProj_XM"], function() {
	// 将临时文件夹中的文件，拷贝到项目中去
	let originalDir = `${tempReleaseDir}/**/*.*`;
	let stream = gulp.src(originalDir);
	return stream.pipe(gulp.dest(path.join(projDir)));
});

// 拷贝icon到小米快游戏
gulp.task("copyIconToProj_XM", ["copyFileToProj_XM"], function() {
	let originalDir = config.xmInfo.icon;
	let stream = gulp.src(originalDir);
	return stream.pipe(gulp.dest(path.join(projDir, "layaicon")));
});

// 清除小米快游戏临时目录
gulp.task("clearTempDir_XM", ["copyIconToProj_XM"], function() {
	// 删掉临时目录
	return del([tempReleaseDir], { force: true });
});

// 生成release签名(私钥文件 private.pem 和证书文件 certificate.pem )
gulp.task("generateSign_XM", ["clearTempDir_XM"], function() {
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
	if (config.xmSign.generateSign) { // 新生成的签名
		let 
            privatePem = path.join(projDir, "private.pem"),
            certificatePem = path.join(projDir, "certificate.pem");
		return del([privatePem, certificatePem], { force: true });
	}
});

gulp.task("modifyFile_XM", ["deleteSignFile_XM"], function() {
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
	manifestJson.config.logLevel = config.xmInfo.logLevel || "off";
	manifestJson.versionName = config.xmInfo.versionName;
	manifestJson.versionCode = config.xmInfo.versionCode;
	manifestJson.minPlatformVersion = config.xmInfo.minPlatformVersion;
	manifestJson.icon = `/layaicon/${path.basename(config.xmInfo.icon)}`;
	if (config.xmInfo.subpack) { // 分包
		manifestJson.subpackages = config.xmSubpack;
	} else {
		delete manifestJson.subpackages;
	}
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

gulp.task("modifyMinJs_XM", ["modifyFile_XM"], function() {
	if (!config.useMinJsLibs) {
		return;
	}
	let fileJsPath = path.join(projDir, "main.js");
	let content = fs.readFileSync(fileJsPath, "utf-8");
	content = content.replace("laya.xmmini.js", "min/laya.xmmini.min.js");
	fs.writeFileSync(fileJsPath, content, 'utf-8');
});

gulp.task("version_XM", ["modifyMinJs_XM"], function () {
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
			// reject();
		});

		cp.on('close', (code) => {
			console.log(`子进程退出码：${code}`);
			resolve();
		});
	});
});

gulp.task("showQRCode_XM", ["buildRPK_XM"], function() {
	// 在小米轻游戏项目目录中执行:
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