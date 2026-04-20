'use strict';
const gulp = require('gulp');
const inject = require('gulp-inject-string');
const ts = require('gulp-typescript');
const merge = require('merge2');
const tsProject = ts.createProject('tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

function writePackageJson(done) {
    const binDir = path.resolve(__dirname, 'bin');
    const targetFile = path.join(binDir, 'package.json');
    const manifest = {
        name: "fairygui",
        version: pkg.version,
        description: pkg.description,
        homepage: pkg.homepage,
        repository: pkg.repository,
        author: pkg.author,
        license: pkg.license
    };

    fs.mkdirSync(binDir, { recursive: true });
    fs.writeFileSync(targetFile, `${JSON.stringify(manifest, null, 2)}\n`);

    done();
}

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
    return gulp.src(['bin/*']).pipe(gulp.dest('../demo/packages/fairygui/'));
});

gulp.task('build', gulp.series('compile', writePackageJson, 'copy'));
