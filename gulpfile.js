'use strict';
const gulp = require("gulp");
const minify = require('gulp-minify');
const replace = require('gulp-string-replace');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

let first = true

gulp.task('buildJs', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(replace('var fgui;', function () {
            if (first) {
                first = false;
                return "window.fgui = {};";
            }
            else
                return "";
        }, { logs: { enabled: false } }))
        .pipe(minify({ ext: { min: ".min.js" } }))
        .pipe(gulp.dest('./test/bin/libs/fairygui/'));
})

gulp.task("build", ["buildJs"], () => {
    return tsProject.src()
        .pipe(tsProject())
        .dts.pipe(gulp.dest('./test/libs/'));
});
