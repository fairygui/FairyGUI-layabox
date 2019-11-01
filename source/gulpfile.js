'use strict';
const gulp = require("gulp");
const minify = require('gulp-minify');
const replace = require('gulp-string-replace');
const inject = require("gulp-inject-string");
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

let first = true

gulp.task('buildJs', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(replace('var fgui;', function () {
            if (first) {
                first = false;
                return "window.fgui = {};\nwindow.fairygui = window.fgui;";
            }
            else
                return "";
        }, { logs: { enabled: false } }))
        .pipe(minify({ ext: { min: ".min.js" } }))
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
