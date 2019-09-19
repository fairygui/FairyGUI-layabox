// v1.1.0
//是否使用IDE自带的node环境和插件，设置false后，则使用自己环境(使用命令行方式执行)
let useIDENode = process.argv[0].indexOf("LayaAir") > -1 ? true : false;
//获取Node插件和工作路径
let ideModuleDir = useIDENode ? process.argv[1].replace("gulp\\bin\\gulp.js", "").replace("gulp/bin/gulp.js", "") : "";
let workSpaceDir = useIDENode ? process.argv[2].replace("--gulpfile=", "").replace("\\.laya\\compile.js", "").replace("/.laya/compile.js", "") : "./../";

//引用插件模块
const gulp = require(ideModuleDir + "gulp");
const rollup = require(ideModuleDir + "rollup");
const typescript = require(ideModuleDir + 'rollup-plugin-typescript2');//typescript2 plugin
const glsl = require(ideModuleDir + 'rollup-plugin-glsl');
let path = require('path');

let commandSuffix = ".cmd";

// 如果是发布时调用编译功能，增加prevTasks
let prevTasks = "";
if (global.publish) {
	prevTasks = ["loadConfig"];
}

//使用browserify，转换ts到js，并输出到bin/js目录
gulp.task("compile", prevTasks, function () {
	// 发布时调用编译功能，判断是否点击了编译选项
	if (global.publish && !global.config.compile && !global.config.forceCompile) {
		return;
	} else if (global.publish && (global.config.compile || global.config.forceCompile)) {
		// 发布时调用编译，workSpaceDir使用publish.js里的变量
		workSpaceDir = global.workSpaceDir;
	}
	return rollup.rollup({
		input: workSpaceDir + '/src/Main.ts',
		treeshake: true,//建议忽略
		plugins: [
			typescript({
				check: false, //Set to false to avoid doing any diagnostic checks on the code
				tsconfigOverride:{compilerOptions:{removeComments: true}}
			}),
			glsl({
				// By default, everything gets included
				include: /.*(.glsl|.vs|.fs)$/,
				sourceMap: false,
				compress:false
			}),
			/*terser({
				output: {
				},
				numWorkers:1,//Amount of workers to spawn. Defaults to the number of CPUs minus 1
				sourcemap: false
			})*/        
		]
	}).then(bundle => {
		return bundle.write({
			file: workSpaceDir + '/bin/js/bundle.js',
			format: 'iife',
			name: 'laya',
			sourcemap: false
		});
	});
});

// 在 shell 中执行一个命令
var exec = require('child_process').exec;
gulp.task('tsc', (cb) => {
	if (process.platform === "darwin") {
		commandSuffix = "";
	}
	let tscPath = path.join(ideModuleDir, ".bin", `tsc${commandSuffix}`);
	let tsconfitPath = path.join(workSpaceDir, "src", "tsconfig.json");
	return exec(`${tscPath} -b "${tsconfitPath}"`, {
		cwd: workSpaceDir,
		shell: true,
		encoding: "utf8"
	}, function(error, stdout, stderr) {
		if (error) console.log("error", error);
		if (stdout) console.log("stdout", stdout);
		if (stderr) console.log("stderr", stderr);
		cb();
	});
});

gulp.task('CopyNoneTSFile', () => {
	return gulp.src([
		`${workSpaceDir}/libs/**/*.vs`,
		`${workSpaceDir}/libs/**/*.fs`,
		`${workSpaceDir}/libs/**/*.glsl`])
		.pipe(gulp.dest(`${workSpaceDir}/build/libs`));
});

gulp.task('tsc:compile', ['tsc','CopyNoneTSFile'], function() {
	console.log("tsc compile completed!");
});