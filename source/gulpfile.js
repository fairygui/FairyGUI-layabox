'use strict';
const gulp = require('gulp');
const inject = require('gulp-inject-string');
const ts = require('gulp-typescript');
const merge = require('merge2');
const tsProject = ts.createProject('tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('compile', () => {
    const tsResult = tsProject.src().pipe(sourcemaps.init()).pipe(tsProject());
    return merge([
        tsResult.js.pipe(inject.replace('var fgui;', ''))
            .pipe(inject.replace(/ \|\| \(fgui = \{\}\)/, ''))
            .pipe(inject.prepend(';window.fairygui = window.fgui = {};'))
            .pipe(sourcemaps.write(''))
            .pipe(gulp.dest('./bin')),
        tsResult.dts.pipe(inject.append('import fairygui = fgui;'))
            .pipe(gulp.dest('./bin'))
    ]);
});

gulp.task('start', () => {
    gulp.watch(['src/**/*.ts'], gulp.series('compile'));
});

gulp.task('copy', () => {
    return gulp.src(['bin/*.js', 'bin/*.d.ts', 'bin/*.js.map']).pipe(gulp.dest('../demo/assets/fairygui/'));
});

gulp.task('build', gulp.series('compile', 'copy'));
