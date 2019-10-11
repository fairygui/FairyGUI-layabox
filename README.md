FairyGUI-layabox
====

A flexible UI framework for LayaAir Engine, working with the FREE professional Game UI Editor: FairyGUI Editor.

Official website: [www.fairygui.com](http://www.fairygui.com)

#关于版本
目前有三个主要的分支:
master 是用于LayaAir2.2或更新的版本
layair2.0-2.1 是用于LayaAir2.0,2.1这两个版本
layair1.x 用于LayaAir1.x版本

#目录结构
* source fairygui的源码
* test 例子工程,可用Laya IDE直接打开
  * UIProject UI 工程,可以FairyGUI编辑器打开

#获取fairygui库
如果你只是想添加或者更新fairygui库到你的项目,那么下载以下文件即可:
* test/bin/libs/fairygui/fairygui.js
* test/bin/libs/fairygui/fairygui.min.js
* test/bin/libs/fairygui/rawinflate.min.js
* test/libs/fairygui.d.ts

#编译源码
使用VSC打开目录,执行gulp build任务后,将在test/bin/libs/fairygui/下生成新的fairygui.js,在test/libs/下生成新的fairygui.d.ts.

#License
MIT