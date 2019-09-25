'use strict';
const gulp = require("gulp");
const concat = require("gulp-concat");
const minify = require('gulp-minify');
const replace = require('gulp-string-replace');

let files = [
    "action/ControllerAction",
    "action/PlayTransitionAction",
    "action/ChangePageAction",
    "display/BitmapFont",
    "display/Image",
    "display/MovieClip",
    "display/FillUtils",
    "utils/ByteBuffer",
    "utils/ChildHitArea",
    "utils/UBBParser",
    "utils/PixelHitTest",
    "utils/ToolSet",
    "utils/ColorMatrix",
    "tween/EaseManager",
    "tween/EaseType",
    "tween/GTween",
    "tween/GTweener",
    "tween/TweenManager",
    "tween/TweenValue",
    "gears/GearBase",
    "gears/GearSize",
    "gears/GearXY",
    "gears/GearText",
    "gears/GearIcon",
    "gears/GearAnimation",
    "gears/GearColor",
    "gears/GearDisplay",
    "gears/GearLook",
    "AssetProxy",
    "AsyncOperation",
    "Controller",
    "Events",
    "FieldTypes",
    "Transition",
    "GObject",
    "PackageItem",
    "GComponent",
    "GButton",
    "GComboBox",
    "GScrollBar",
    "GSlider",
    "GGraph",
    "GGroup",
    "GImage",
    "GLabel",
    "GList",
    "GObjectPool",
    "GLoader",
    "GMovieClip",
    "GProgressBar",
    "GTextField",
    "GBasicTextField",
    "GRichTextField",
    "GTextInput",
    "GRoot",
    "Margin",
    "IUISource",
    "PopupMenu",
    "RelationItem",
    "Relations",
    "ScrollPane",
    "UIConfig",
    "UIObjectFactory",
    "UIPackage",
    "Window",
    "DragDropManager",
    "AsyncOperation",
    "TranslationHelper"
];

let jsFiles = [];
let dtsFiles = [];
for (var i in files) {
    jsFiles.push("./bin/js/" + files[i] + ".js");
    dtsFiles.push("./bin/types/" + files[i] + ".d.ts");
}

gulp.task('types', function () {
    gulp.src(dtsFiles)
        .pipe(concat('fairygui.d.ts'))
        .pipe(gulp.dest('./test/libs/'));
});

let first = true
gulp.task('default', ["types"], function () {
    gulp.src(jsFiles)
        .pipe(replace('var fgui;', function () {
            if (first) {
                first = false;
                return "window.fgui = {};";
            }
            else
                return "";
        }, { logs: { enabled: false } }))
        .pipe(concat('fairygui.js'))
        .pipe(minify({ ext: { min: ".min.js" } }))
        .pipe(gulp.dest('./test/bin/libs/fairygui/'));
});

