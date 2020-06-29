/**
 * Copy files form bin to laya project after npm install
 */
'use strict';
const path = require('path');
const fs = require('fs');
const bin = path.join(__dirname, 'bin');
const name = 'fairygui';
const dts = name + '.d.ts';
const js = name + '.js';
const zlib = 'rawinflate.min.js';
const projectRoot = path.join(process.cwd(), '../../');
const dirs = fs.readdirSync(projectRoot);

let isLayaProject = false;
let libsDir = '';
let binDir = '';
dirs.forEach(dir => {
    if (dir === '.laya') isLayaProject = true;
    if (dir === 'libs') libsDir = path.join(projectRoot, dir);
    if (dir === 'bin') binDir = path.join(projectRoot, dir);
});

function copy(filename, dest) {
    fs.writeFileSync(path.join(dest, filename), fs.readFileSync(path.join(bin, filename)));
}

// Ensure laya project is normal
if (isLayaProject && libsDir && binDir) {
    const binLibsDir = path.join(binDir, 'libs');
    if (fs.existsSync(binLibsDir)) {
        // Copy files
        copy(dts, libsDir);
        const guiDir = path.join(binLibsDir, name);
        !fs.existsSync(guiDir) && fs.mkdirSync(guiDir);
        copy(zlib, guiDir);
        copy(js, guiDir);
        // Import js to index.js
        const indexJs = path.join(binDir, 'index.js');
        if (fs.existsSync(indexJs)) {
            let content = fs.readFileSync(indexJs, 'utf8');
            if (content.indexOf(js) === -1) {
                // 'rawinflate.min.js' is imported manually as needed
                content = content.replace(/\/\/-+libs-end-+/, $1 => {
                    return $1 + `\n//loadLib("libs/${name}/${zlib}");\nloadLib("libs/${name}/${js}");`;
                });
                fs.writeFileSync(indexJs, content);
            }
        }
    }
}