'use strict';
const gulp = require("gulp");
const minify = require('gulp-minify');
const inject = require("gulp-inject-string");
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('buildJs', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(inject.replace('var fgui;', ''))
        .pipe(inject.prepend('window.fgui = {};\nwindow.fairygui = window.fgui;\n'))
        .pipe(inject.replace('var __extends', 'window.__extends'))
        //.pipe(minify({ ext: { min: ".min.js" } }))
        .pipe(gulp.dest('./bin'));
})

gulp.task("buildDts", ["buildJs"], () => {
    return tsProject.src()
        .pipe(tsProject())
        .dts.pipe(inject.append('import fairygui = fgui;'))
        .pipe(gulp.dest('./bin'));
});

gulp.task("copyJs", ["buildDts"], () => {
    return gulp.src('bin/*.js')
        .pipe(gulp.dest('../demo/bin/libs/fairygui/'));
});

gulp.task("build", ["copyJs"], () => {
    return gulp.src('bin/*.ts')
        .pipe(gulp.dest('../demo/libs/'));
});
