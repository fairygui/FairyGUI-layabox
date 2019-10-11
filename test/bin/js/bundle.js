(function () {
    'use strict';

    var Scene = Laya.Scene;
    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var test;
        (function (test) {
            class TestSceneUI extends Scene {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("test/TestScene");
                }
            }
            test.TestSceneUI = TestSceneUI;
            REG("ui.test.TestSceneUI", TestSceneUI);
        })(test = ui.test || (ui.test = {}));
    })(ui || (ui = {}));

    class GameControl extends Laya.Script {
        constructor() {
            super();
            this.createBoxInterval = 1000;
            this._time = 0;
            this._started = false;
        }
        onEnable() {
            this._time = Date.now();
            this._gameBox = this.owner.getChildByName("gameBox");
        }
        onUpdate() {
            let now = Date.now();
            if (now - this._time > this.createBoxInterval && this._started) {
                this._time = now;
                this.createBox();
            }
        }
        createBox() {
            let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
            box.pos(Math.random() * (Laya.stage.width - 100), -100);
            this._gameBox.addChild(box);
        }
        onStageClick(e) {
            e.stopPropagation();
            let flyer = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet);
            flyer.pos(Laya.stage.mouseX, Laya.stage.mouseY);
            this._gameBox.addChild(flyer);
        }
        startGame() {
            if (!this._started) {
                this._started = true;
                this.enabled = true;
            }
        }
        stopGame() {
            this._started = false;
            this.enabled = false;
            this.createBoxInterval = 1000;
            this._gameBox.removeChildren();
        }
    }

    class GameUI extends ui.test.TestSceneUI {
        constructor() {
            super();
            GameUI.instance = this;
            Laya.MouseManager.multiTouchEnabled = false;
        }
        onEnable() {
            this._control = this.getComponent(GameControl);
            this.tipLbll.on(Laya.Event.CLICK, this, this.onTipClick);
        }
        onTipClick(e) {
            this.tipLbll.visible = false;
            this._score = 0;
            this.scoreLbl.text = "";
            this._control.startGame();
        }
        addScore(value = 1) {
            this._score += value;
            this.scoreLbl.changeText("分数：" + this._score);
            if (this._control.createBoxInterval > 600 && this._score % 20 == 0)
                this._control.createBoxInterval -= 20;
        }
        stopGame() {
            this.tipLbll.visible = true;
            this.tipLbll.text = "游戏结束了，点击屏幕重新开始";
            this._control.stopGame();
        }
    }

    class Bullet extends Laya.Script {
        constructor() { super(); }
        onEnable() {
            var rig = this.owner.getComponent(Laya.RigidBody);
            rig.setVelocity({ x: 0, y: -10 });
        }
        onTriggerEnter(other, self, contact) {
            this.owner.removeSelf();
        }
        onUpdate() {
            if (this.owner.y < -10) {
                this.owner.removeSelf();
            }
        }
        onDisable() {
            Laya.Pool.recover("bullet", this.owner);
        }
    }

    class DropBox extends Laya.Script {
        constructor() {
            super();
            this.level = 1;
        }
        onEnable() {
            this._rig = this.owner.getComponent(Laya.RigidBody);
            this.level = Math.round(Math.random() * 5) + 1;
            this._text = this.owner.getChildByName("levelTxt");
            this._text.text = this.level + "";
        }
        onUpdate() {
            this.owner.rotation++;
        }
        onTriggerEnter(other, self, contact) {
            var owner = this.owner;
            if (other.label === "buttle") {
                if (this.level > 1) {
                    this.level--;
                    this._text.changeText(this.level + "");
                    owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
                    Laya.SoundManager.playSound("sound/hit.wav");
                }
                else {
                    if (owner.parent) {
                        let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                        effect.pos(owner.x, owner.y);
                        owner.parent.addChild(effect);
                        effect.play(0, true);
                        owner.removeSelf();
                        Laya.SoundManager.playSound("sound/destroy.wav");
                    }
                }
                GameUI.instance.addScore(1);
            }
            else if (other.label === "ground") {
                owner.removeSelf();
                GameUI.instance.stopGame();
            }
        }
        createEffect() {
            let ani = new Laya.Animation();
            ani.loadAnimation("test/TestAni.ani");
            ani.on(Laya.Event.COMPLETE, null, recover);
            function recover() {
                ani.removeSelf();
                Laya.Pool.recover("effect", ani);
            }
            return ani;
        }
        onDisable() {
            Laya.Pool.recover("dropBox", this.owner);
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/GameUI.ts", GameUI);
            reg("script/GameControl.ts", GameControl);
            reg("script/Bullet.ts", Bullet);
            reg("script/DropBox.ts", DropBox);
        }
    }
    GameConfig.width = 1136;
    GameConfig.height = 640;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class TestWin extends fgui.Window {
        constructor() {
            super();
        }
        onInit() {
            this.contentPane = fgui.UIPackage.createObject("ModalWaiting", "TestWin").asCom;
            this.contentPane.getChild("n1").onClick(this, this.onClickStart);
            this.center();
        }
        onClickStart() {
            this.showModalWait();
            fgui.GTween.delayedCall(3).onComplete(function () { this.closeModalWait(); }, this);
        }
    }
    class WindowA extends fgui.Window {
        constructor() {
            super();
        }
        onInit() {
            this.contentPane = fgui.UIPackage.createObject("Basics", "WindowA").asCom;
            this.center();
        }
        onShown() {
            var list = this.contentPane.getChild("n6").asList;
            list.removeChildrenToPool();
            for (var i = 0; i < 6; i++) {
                var item = list.addItemFromPool().asButton;
                item.title = "" + i;
                item.icon = fgui.UIPackage.getItemURL("Basics", "r4");
            }
        }
    }
    class WindowB extends fgui.Window {
        constructor() {
            super();
        }
        onInit() {
            this.contentPane = fgui.UIPackage.createObject("Basics", "WindowB").asCom;
            this.center();
            this.setPivot(0.5, 0.5);
        }
        doShowAnimation() {
            this.setScale(0.1, 0.1);
            fgui.GTween.to2(0.1, 0.1, 1, 1, 0.3)
                .setTarget(this, this.setScale)
                .setEase(fgui.EaseType.QuadOut)
                .onComplete(this.onShown, this);
        }
        doHideAnimation() {
            fgui.GTween.to2(1, 1, 0.1, 0.1, 0.3)
                .setTarget(this, this.setScale)
                .setEase(fgui.EaseType.QuadOut)
                .onComplete(this.hideImmediately, this);
        }
        onShown() {
            this.contentPane.getTransition("t1").play();
        }
        onHide() {
            this.contentPane.getTransition("t1").stop();
        }
    }

    class BasicDemo {
        constructor() {
            this.startPos = new Laya.Point();
            fgui.UIConfig.verticalScrollBar = "ui://Basics/ScrollBar_VT";
            fgui.UIConfig.horizontalScrollBar = "ui://Basics/ScrollBar_HZ";
            fgui.UIConfig.popupMenu = "ui://Basics/PopupMenu";
            fgui.UIConfig.buttonSound = "ui://Basics/click";
            fgui.UIPackage.loadPackage("res/UI/Basics", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("Basics", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._backBtn = this._view.getChild("btn_Back");
            this._backBtn.visible = false;
            this._backBtn.onClick(this, this.onClickBack);
            this._demoContainer = this._view.getChild("container").asCom;
            this._cc = this._view.getController("c1");
            var cnt = this._view.numChildren;
            for (var i = 0; i < cnt; i++) {
                var obj = this._view.getChildAt(i);
                if (obj.group != null && obj.group.name == "btns")
                    obj.onClick(this, this.runDemo);
            }
            this._demoObjects = {};
        }
        destroy() {
            fgui.UIConfig.verticalScrollBar = "";
            fgui.UIConfig.horizontalScrollBar = "";
            fgui.UIConfig.popupMenu = "";
            fgui.UIConfig.buttonSound = "";
            fgui.UIPackage.removePackage("Basics");
        }
        runDemo(evt) {
            var type = fgui.GObject.cast(evt.currentTarget).name.substr(4);
            var obj = this._demoObjects[type];
            if (obj == null) {
                obj = fgui.UIPackage.createObject("Basics", "Demo_" + type).asCom;
                this._demoObjects[type] = obj;
            }
            this._demoContainer.removeChildren();
            this._demoContainer.addChild(obj);
            this._cc.selectedIndex = 1;
            this._backBtn.visible = true;
            switch (type) {
                case "Button":
                    this.playButton();
                    break;
                case "Text":
                    this.playText();
                    break;
                case "Window":
                    this.playWindow();
                    break;
                case "Popup":
                    this.playPopup();
                    break;
                case "Drag&Drop":
                    this.playDragDrop();
                    break;
                case "Depth":
                    this.playDepth();
                    break;
                case "Grid":
                    this.playGrid();
                    break;
                case "ProgressBar":
                    this.playProgressBar();
                    break;
            }
        }
        onClickBack(evt) {
            this._cc.selectedIndex = 0;
            this._backBtn.visible = false;
        }
        playButton() {
            var obj = this._demoObjects["Button"];
            obj.getChild("n34").onClick(this, this.__clickButton);
        }
        __clickButton() {
            console.log("click button");
        }
        playText() {
            var obj = this._demoObjects["Text"];
            obj.getChild("n12").on(Laya.Event.LINK, this, this.__clickLink);
            obj.getChild("n25").onClick(this, this.__clickGetInput);
        }
        __clickLink(link) {
            var obj = this._demoObjects["Text"];
            obj.getChild("n12").text = "[img]ui://9leh0eyft9fj5f[/img][color=#FF0000]你点击了链接[/color]：" + link;
        }
        __clickGetInput() {
            var obj = this._demoObjects["Text"];
            obj.getChild("n24").text = obj.getChild("n22").text;
        }
        playWindow() {
            var obj = this._demoObjects["Window"];
            obj.getChild("n0").onClick(this, this.__clickWindowA);
            obj.getChild("n1").onClick(this, this.__clickWindowB);
        }
        __clickWindowA() {
            if (this._winA == null)
                this._winA = new WindowA();
            this._winA.show();
        }
        __clickWindowB() {
            if (this._winB == null)
                this._winB = new WindowB();
            this._winB.show();
        }
        playPopup() {
            if (this._pm == null) {
                this._pm = new fgui.PopupMenu();
                this._pm.addItem("Item 1");
                this._pm.addItem("Item 2");
                this._pm.addItem("Item 3");
                this._pm.addItem("Item 4");
                if (this._popupCom == null) {
                    this._popupCom = fgui.UIPackage.createObject("Basics", "Component12").asCom;
                    this._popupCom.center();
                }
            }
            var obj = this._demoObjects["Popup"];
            var btn = obj.getChild("n0");
            btn.onClick(this, this.__clickPopup1);
            var btn2 = obj.getChild("n1");
            btn2.onClick(this, this.__clickPopup2);
        }
        __clickPopup1(evt) {
            var btn = fgui.GObject.cast(evt.currentTarget);
            this._pm.show(btn, true);
        }
        __clickPopup2() {
            fgui.GRoot.inst.showPopup(this._popupCom);
        }
        playDragDrop() {
            var obj = this._demoObjects["Drag&Drop"];
            var btnA = obj.getChild("a");
            btnA.draggable = true;
            var btnB = obj.getChild("b").asButton;
            btnB.draggable = true;
            btnB.on(fgui.Events.DRAG_START, this, this.__onDragStart);
            var btnC = obj.getChild("c").asButton;
            btnC.icon = null;
            btnC.on(fgui.Events.DROP, this, this.__onDrop);
            var btnD = obj.getChild("d");
            btnD.draggable = true;
            var bounds = obj.getChild("bounds");
            var rect = bounds.localToGlobalRect(0, 0, bounds.width, bounds.height);
            rect = fgui.GRoot.inst.globalToLocalRect(rect.x, rect.y, rect.width, rect.height, rect);
            rect.x -= obj.parent.x;
            btnD.dragBounds = rect;
        }
        __onDragStart(evt) {
            var btn = fgui.GObject.cast(evt.currentTarget);
            btn.stopDrag();
            fgui.DragDropManager.inst.startDrag(btn, btn.icon, btn.icon);
        }
        __onDrop(data, evt) {
            var btn = fgui.GObject.cast(evt.currentTarget);
            btn.icon = data;
        }
        playDepth() {
            var obj = this._demoObjects["Depth"];
            var testContainer = obj.getChild("n22").asCom;
            var fixedObj = testContainer.getChild("n0");
            fixedObj.sortingOrder = 100;
            fixedObj.draggable = true;
            var numChildren = testContainer.numChildren;
            var i = 0;
            while (i < numChildren) {
                var child = testContainer.getChildAt(i);
                if (child != fixedObj) {
                    testContainer.removeChildAt(i);
                    numChildren--;
                }
                else
                    i++;
            }
            this.startPos.x = fixedObj.x;
            this.startPos.y = fixedObj.y;
            obj.getChild("btn0").onClick(this, this.__click1);
            obj.getChild("btn1").onClick(this, this.__click2);
        }
        __click1() {
            var graph = new fgui.GGraph();
            this.startPos.x += 10;
            this.startPos.y += 10;
            graph.setXY(this.startPos.x, this.startPos.y);
            graph.setSize(150, 150);
            graph.drawRect(1, "#000000", "#FF0000");
            var obj = this._demoObjects["Depth"];
            obj.getChild("n22").asCom.addChild(graph);
        }
        __click2() {
            var graph = new fgui.GGraph();
            this.startPos.x += 10;
            this.startPos.y += 10;
            graph.setXY(this.startPos.x, this.startPos.y);
            graph.setSize(150, 150);
            graph.drawRect(1, "#000000", "#00FF00");
            graph.sortingOrder = 200;
            var obj = this._demoObjects["Depth"];
            obj.getChild("n22").asCom.addChild(graph);
        }
        playGrid() {
            var obj = this._demoObjects["Grid"];
            var list1 = obj.getChild("list1").asList;
            list1.removeChildrenToPool();
            var testNames = ["苹果手机操作系统", "安卓手机操作系统", "微软手机操作系统", "微软桌面操作系统", "苹果桌面操作系统", "未知操作系统"];
            var testColors = [0xFFFF00, 0xFF0000, 0xFFFFFF, 0x0000FF];
            var cnt = testNames.length;
            for (var i = 0; i < cnt; i++) {
                var item = list1.addItemFromPool().asButton;
                item.getChild("t0").text = "" + (i + 1);
                item.getChild("t1").text = testNames[i];
                item.getChild("t2").asTextField.color = Laya.Utils.toHexColor(testColors[Math.floor(Math.random() * 4)]);
                item.getChild("star").asProgress.value = (Math.floor(Math.random() * 3) + 1) / 3 * 100;
            }
            var list2 = obj.getChild("list2").asList;
            list2.removeChildrenToPool();
            for (var i = 0; i < cnt; i++) {
                var item = list2.addItemFromPool().asButton;
                item.getChild("cb").asButton.selected = false;
                item.getChild("t1").text = testNames[i];
                item.getChild("mc").asMovieClip.playing = i % 2 == 0;
                item.getChild("t3").text = "" + Math.floor(Math.random() * 10000);
            }
        }
        playProgressBar() {
            var obj = this._demoObjects["ProgressBar"];
            Laya.timer.frameLoop(2, this, this.__playProgress);
            obj.on(Laya.Event.UNDISPLAY, this, this.__removeTimer);
        }
        __removeTimer() {
            Laya.timer.clear(this, this.__playProgress);
        }
        __playProgress() {
            var obj = this._demoObjects["ProgressBar"];
            var cnt = obj.numChildren;
            for (var i = 0; i < cnt; i++) {
                var child = obj.getChildAt(i);
                if (child != null) {
                    child.value += 1;
                    if (child.value > child.max)
                        child.value = 0;
                }
            }
        }
    }

    class TransitionDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/Transition", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("Transition", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._btnGroup = this._view.getChild("g0").asGroup;
            this._g1 = fgui.UIPackage.createObject("Transition", "BOSS").asCom;
            this._g2 = fgui.UIPackage.createObject("Transition", "BOSS_SKILL").asCom;
            this._g3 = fgui.UIPackage.createObject("Transition", "TRAP").asCom;
            this._g4 = fgui.UIPackage.createObject("Transition", "GoodHit").asCom;
            this._g5 = fgui.UIPackage.createObject("Transition", "PowerUp").asCom;
            this._g5.getTransition("t0").setHook("play_num_now", Laya.Handler.create(this, this.__playNum, null, false));
            this._view.getChild("btn0").onClick(this, function () { this.__play(this._g1); });
            this._view.getChild("btn1").onClick(this, function () { this.__play(this._g2); });
            this._view.getChild("btn2").onClick(this, function () { this.__play(this._g3); });
            this._view.getChild("btn3").onClick(this, this.__play4);
            this._view.getChild("btn4").onClick(this, this.__play5);
        }
        __play(target) {
            this._btnGroup.visible = false;
            fgui.GRoot.inst.addChild(target);
            var t = target.getTransition("t0");
            t.play(Laya.Handler.create(this, () => {
                this._btnGroup.visible = true;
                fgui.GRoot.inst.removeChild(target);
            }));
        }
        __play4() {
            this._btnGroup.visible = false;
            this._g4.x = fgui.GRoot.inst.width - this._g4.width - 20;
            this._g4.y = 100;
            fgui.GRoot.inst.addChild(this._g4);
            var t = this._g4.getTransition("t0");
            t.play(Laya.Handler.create(this, () => {
                this._btnGroup.visible = true;
                fgui.GRoot.inst.removeChild(this._g4);
            }), 3);
        }
        __play5() {
            this._btnGroup.visible = false;
            this._g5.x = 20;
            this._g5.y = fgui.GRoot.inst.height - this._g5.height - 100;
            fgui.GRoot.inst.addChild(this._g5);
            var t = this._g5.getTransition("t0");
            this._startValue = 10000;
            var add = Math.ceil(Math.random() * 2000 + 1000);
            this._endValue = this._startValue + add;
            this._g5.getChild("value").text = "" + this._startValue;
            this._g5.getChild("add_value").text = "+" + add;
            t.play(Laya.Handler.create(this, () => {
                this._btnGroup.visible = true;
                fgui.GRoot.inst.removeChild(this._g5);
            }));
        }
        __playNum() {
            fgui.GTween.to(this._startValue, this._endValue, 0.3)
                .setEase(fgui.EaseType.Linear)
                .onUpdate(function (tweener) {
                this._g5.getChild("value").text = "" + Math.floor(tweener.value.x);
            }, this);
        }
    }

    class MailItem extends fgui.GButton {
        constructor() {
            super();
        }
        onConstruct() {
            this._timeText = this.getChild("timeText").asTextField;
            this._readController = this.getController("IsRead");
            this._fetchController = this.getController("c1");
            this._trans = this.getTransition("t0");
        }
        setTime(value) {
            this._timeText.text = value;
        }
        setRead(value) {
            this._readController.selectedIndex = value ? 1 : 0;
        }
        setFetched(value) {
            this._fetchController.selectedIndex = value ? 1 : 0;
        }
        playEffect(delay) {
            this.visible = false;
            this._trans.play(null, 1, delay);
        }
    }

    class VirtualListDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/VirtualList", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            fgui.UIObjectFactory.setExtension("ui://VirtualList/mailItem", MailItem);
            this._view = fgui.UIPackage.createObject("VirtualList", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._view.getChild("n6").onClick(this, function () { this._list.addSelection(500, true); });
            this._view.getChild("n7").onClick(this, function () { this._list.scrollPane.scrollTop(); });
            this._view.getChild("n8").onClick(this, function () { this._list.scrollPane.scrollBottom(); });
            this._list = this._view.getChild("mailList").asList;
            this._list.setVirtual();
            this._list.itemRenderer = Laya.Handler.create(this, this.renderListItem, null, false);
            this._list.numItems = 1000;
        }
        renderListItem(index, obj) {
            var item = obj;
            item.setFetched(index % 3 == 0);
            item.setRead(index % 2 == 0);
            item.setTime("5 Nov 2015 16:24:33");
            item.title = index + " Mail title here";
        }
    }

    class LoopListDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/LoopList", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("LoopList", "Main").asCom;
            this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            fgui.GRoot.inst.addChild(this._view);
            this._list = this._view.getChild("list").asList;
            this._list.setVirtualAndLoop();
            this._list.itemRenderer = Laya.Handler.create(this, this.renderListItem, null, false);
            this._list.numItems = 5;
            this._list.on(fgui.Events.SCROLL, this, this.doSpecialEffect);
            this.doSpecialEffect();
        }
        doSpecialEffect() {
            var midX = this._list.scrollPane.posX + this._list.viewWidth / 2;
            var cnt = this._list.numChildren;
            for (var i = 0; i < cnt; i++) {
                var obj = this._list.getChildAt(i);
                var dist = Math.abs(midX - obj.x - obj.width / 2);
                if (dist > obj.width)
                    obj.setScale(1, 1);
                else {
                    var ss = 1 + (1 - dist / obj.width) * 0.24;
                    obj.setScale(ss, ss);
                }
            }
            this._view.getChild("n3").text = "" + ((this._list.getFirstChildInView() + 1) % this._list.numItems);
        }
        renderListItem(index, obj) {
            var item = obj;
            item.setPivot(0.5, 0.5);
            item.icon = fgui.UIPackage.getItemURL("LoopList", "n" + (index + 1));
        }
    }

    class ScrollPaneHeader extends fgui.GComponent {
        constructor() {
            super();
        }
        onConstruct() {
            this._c1 = this.getController("c1");
            this.on(fgui.Events.SIZE_CHANGED, this, this.onSizeChanged);
        }
        onSizeChanged() {
            if (this._c1.selectedIndex == 2 || this._c1.selectedIndex == 3)
                return;
            if (this.height > this.sourceHeight)
                this._c1.selectedIndex = 1;
            else
                this._c1.selectedIndex = 0;
        }
        get readyToRefresh() {
            return this._c1.selectedIndex == 1;
        }
        setRefreshStatus(value) {
            this._c1.selectedIndex = value;
        }
    }

    class PullToRefreshDemo {
        constructor() {
            fgui.UIObjectFactory.setExtension("ui://PullToRefresh/Header", ScrollPaneHeader);
            fgui.UIPackage.loadPackage("res/UI/PullToRefresh", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("PullToRefresh", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._list1 = this._view.getChild("list1").asList;
            this._list1.itemRenderer = Laya.Handler.create(this, this.renderListItem1, null, false);
            this._list1.setVirtual();
            this._list1.numItems = 1;
            this._list1.on(fgui.Events.PULL_DOWN_RELEASE, this, this.onPullDownToRefresh);
            this._list2 = this._view.getChild("list2").asList;
            this._list2.itemRenderer = Laya.Handler.create(this, this.renderListItem2, null, false);
            this._list2.setVirtual();
            this._list2.numItems = 1;
            this._list2.on(fgui.Events.PULL_UP_RELEASE, this, this.onPullUpToRefresh);
        }
        renderListItem1(index, item) {
            item.text = "Item " + (this._list1.numItems - index - 1);
        }
        renderListItem2(index, item) {
            item.text = "Item " + index;
        }
        onPullDownToRefresh(evt) {
            var header = (this._list1.scrollPane.header);
            if (header.readyToRefresh) {
                header.setRefreshStatus(2);
                this._list1.scrollPane.lockHeader(header.sourceHeight);
                Laya.timer.once(2000, this, function () {
                    if (this._view.isDisposed)
                        return;
                    this._list1.numItems += 5;
                    header.setRefreshStatus(3);
                    this._list1.scrollPane.lockHeader(35);
                    Laya.timer.once(2000, this, function () {
                        header.setRefreshStatus(0);
                        this._list1.scrollPane.lockHeader(0);
                    });
                });
            }
        }
        onPullUpToRefresh(evt) {
            var footer = this._list2.scrollPane.footer.asCom;
            footer.getController("c1").selectedIndex = 1;
            this._list2.scrollPane.lockFooter(footer.sourceHeight);
            Laya.timer.once(2000, this, function () {
                if (this._view.isDisposed)
                    return;
                this._list2.numItems += 5;
                footer.getController("c1").selectedIndex = 0;
                this._list2.scrollPane.lockFooter(0);
            });
        }
    }

    class ModalWaitingDemo {
        constructor() {
            fgui.UIConfig.globalModalWaiting = "ui://ModalWaiting/GlobalModalWaiting";
            fgui.UIConfig.windowModalWaiting = "ui://ModalWaiting/WindowModalWaiting";
            fgui.UIObjectFactory.setExtension("ui://ModalWaiting/GlobalModalWaiting", GlobalWaiting);
            fgui.UIPackage.loadPackage("res/UI/ModalWaiting", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            fgui.UIObjectFactory.setExtension("ui://ModalWaiting/GlobalWaiting", GlobalWaiting);
            this._view = fgui.UIPackage.createObject("ModalWaiting", "Main").asCom;
            this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            fgui.GRoot.inst.addChild(this._view);
            this._testWin = new TestWin();
            this._view.getChild("n0").onClick(this, function () { this._testWin.show(); });
            fgui.GRoot.inst.showModalWait();
            Laya.timer.once(3000, this, function () {
                fgui.GRoot.inst.closeModalWait();
            });
        }
    }
    class GlobalWaiting extends fgui.GComponent {
        constructor() {
            super();
        }
        onConstruct() {
            this._obj = this.getChild("n1");
            this.on(Laya.Event.DISPLAY, this, this.onAddedToStage);
            this.on(Laya.Event.UNDISPLAY, this, this.onRemoveFromStage);
        }
        onAddedToStage() {
            Laya.timer.frameLoop(2, this, this.onTimer);
        }
        onRemoveFromStage() {
            Laya.timer.clear(this, this.onTimer);
        }
        onTimer() {
            var i = this._obj.rotation;
            i += 10;
            if (i > 360)
                i = i % 360;
            this._obj.rotation = i;
        }
    }

    class JoystickModule extends Laya.EventDispatcher {
        constructor(mainView) {
            super();
            this._button = mainView.getChild("joystick").asButton;
            this._button.changeStateOnClick = false;
            this._thumb = this._button.getChild("thumb");
            this._touchArea = mainView.getChild("joystick_touch");
            this._center = mainView.getChild("joystick_center");
            this._InitX = this._center.x + this._center.width / 2;
            this._InitY = this._center.y + this._center.height / 2;
            this.touchId = -1;
            this.radius = 150;
            this._curPos = new Laya.Point();
            this._touchArea.on(Laya.Event.MOUSE_DOWN, this, this.onTouchDown);
        }
        Trigger(evt) {
            this.onTouchDown(evt);
        }
        onTouchDown(evt) {
            if (this.touchId == -1) {
                this.touchId = evt.touchId;
                if (this._tweener != null) {
                    this._tweener.kill();
                    this._tweener = null;
                }
                fgui.GRoot.inst.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, this._curPos);
                var bx = this._curPos.x;
                var by = this._curPos.y;
                this._button.selected = true;
                if (bx < 0)
                    bx = 0;
                else if (bx > this._touchArea.width)
                    bx = this._touchArea.width;
                if (by > fgui.GRoot.inst.height)
                    by = fgui.GRoot.inst.height;
                else if (by < this._touchArea.y)
                    by = this._touchArea.y;
                this._lastStageX = bx;
                this._lastStageY = by;
                this._startStageX = bx;
                this._startStageY = by;
                this._center.visible = true;
                this._center.x = bx - this._center.width / 2;
                this._center.y = by - this._center.height / 2;
                this._button.x = bx - this._button.width / 2;
                this._button.y = by - this._button.height / 2;
                var deltaX = bx - this._InitX;
                var deltaY = by - this._InitY;
                var degrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                this._thumb.rotation = degrees + 90;
                Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.OnTouchMove);
                Laya.stage.on(Laya.Event.MOUSE_UP, this, this.OnTouchUp);
            }
        }
        OnTouchUp(evt) {
            if (this.touchId != -1 && evt.touchId == this.touchId) {
                this.touchId = -1;
                this._thumb.rotation = this._thumb.rotation + 180;
                this._center.visible = false;
                this._tweener = fgui.GTween.to2(this._button.x, this._button.y, this._InitX - this._button.width / 2, this._InitY - this._button.height / 2, 0.3)
                    .setTarget(this._button, this._button.setXY)
                    .setEase(fgui.EaseType.CircOut)
                    .onComplete(this.onTweenComplete, this);
                Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.OnTouchMove);
                Laya.stage.off(Laya.Event.MOUSE_UP, this, this.OnTouchUp);
                this.event(JoystickModule.JoystickUp);
            }
        }
        onTweenComplete() {
            this._tweener = null;
            this._button.selected = false;
            this._thumb.rotation = 0;
            this._center.visible = true;
            this._center.x = this._InitX - this._center.width / 2;
            this._center.y = this._InitY - this._center.height / 2;
        }
        OnTouchMove(evt) {
            if (this.touchId != -1 && evt.touchId == this.touchId) {
                var bx = Laya.stage.mouseX;
                var by = Laya.stage.mouseY;
                var moveX = bx - this._lastStageX;
                var moveY = by - this._lastStageY;
                this._lastStageX = bx;
                this._lastStageY = by;
                var buttonX = this._button.x + moveX;
                var buttonY = this._button.y + moveY;
                var offsetX = buttonX + this._button.width / 2 - this._startStageX;
                var offsetY = buttonY + this._button.height / 2 - this._startStageY;
                var rad = Math.atan2(offsetY, offsetX);
                var degree = rad * 180 / Math.PI;
                this._thumb.rotation = degree + 90;
                var maxX = this.radius * Math.cos(rad);
                var maxY = this.radius * Math.sin(rad);
                if (Math.abs(offsetX) > Math.abs(maxX))
                    offsetX = maxX;
                if (Math.abs(offsetY) > Math.abs(maxY))
                    offsetY = maxY;
                buttonX = this._startStageX + offsetX;
                buttonY = this._startStageY + offsetY;
                if (buttonX < 0)
                    buttonX = 0;
                if (buttonY > fgui.GRoot.inst.height)
                    buttonY = fgui.GRoot.inst.height;
                this._button.x = buttonX - this._button.width / 2;
                this._button.y = buttonY - this._button.height / 2;
                this.event(JoystickModule.JoystickMoving, degree);
            }
        }
    }
    JoystickModule.JoystickMoving = "JoystickMoving";
    JoystickModule.JoystickUp = "JoystickUp";

    class JoystickDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/Joystick", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("Joystick", "Main").asCom;
            this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            fgui.GRoot.inst.addChild(this._view);
            this._text = this._view.getChild("n9").asTextField;
            this._joystick = new JoystickModule(this._view);
            this._joystick.on(JoystickModule.JoystickMoving, this, this.onJoystickMoving);
            this._joystick.on(JoystickModule.JoystickUp, this, this.onJoystickUp);
        }
        onJoystickMoving(degree) {
            this._text.text = "" + degree;
        }
        onJoystickUp() {
            this._text.text = "";
        }
    }

    class BagDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/Bag", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("Bag", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._bagWindow = new BagWindow();
            this._view.getChild("bagBtn").onClick(this, () => { this._bagWindow.show(); });
        }
        destroy() {
            fgui.UIPackage.removePackage("Bag");
        }
    }
    class BagWindow extends fgui.Window {
        constructor() {
            super();
        }
        onInit() {
            this.contentPane = fgui.UIPackage.createObject("Bag", "BagWin").asCom;
            this.center();
        }
        onShown() {
            var list = this.contentPane.getChild("list").asList;
            list.on(fgui.Events.CLICK_ITEM, this, this.onClickItem);
            list.itemRenderer = Laya.Handler.create(this, this.renderListItem, null, false);
            list.setVirtual();
            list.numItems = 45;
        }
        renderListItem(index, obj) {
            obj.icon = "res/icons/i" + Math.floor(Math.random() * 10) + ".png";
            obj.text = "" + Math.floor(Math.random() * 100);
        }
        onClickItem(item) {
            this.contentPane.getChild("n11").asLoader.url = item.icon;
            this.contentPane.getChild("n13").text = item.icon;
        }
    }

    class ListEffectDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/ListEffect", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            fgui.UIObjectFactory.setExtension("ui://ListEffect/mailItem", MailItem);
            this._view = fgui.UIPackage.createObject("ListEffect", "Main").asCom;
            this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            fgui.GRoot.inst.addChild(this._view);
            this._list = this._view.getChild("mailList").asList;
            for (var i = 0; i < 10; i++) {
                var item = this._list.addItemFromPool();
                item.setFetched(i % 3 == 0);
                item.setRead(i % 2 == 0);
                item.setTime("5 Nov 2015 16:24:33");
                item.title = "Mail title here";
            }
            this._list.ensureBoundsCorrect();
            var delay = 0;
            for (var i = 0; i < 10; i++) {
                var item = this._list.getChildAt(i);
                if (this._list.isChildInView(item)) {
                    item.playEffect(delay);
                    delay += 0.2;
                }
                else
                    break;
            }
        }
    }

    class GuideDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/Guide", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("Guide", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._guideLayer = fgui.UIPackage.createObject("Guide", "GuideLayer").asCom;
            this._guideLayer.makeFullScreen();
            this._guideLayer.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
            let bagBtn = this._view.getChild("bagBtn");
            bagBtn.onClick(this, () => {
                this._guideLayer.removeFromParent();
            });
            this._view.getChild("n2").onClick(this, () => {
                fgui.GRoot.inst.addChild(this._guideLayer);
                let rect = bagBtn.localToGlobalRect(0, 0, bagBtn.width, bagBtn.height);
                rect = this._guideLayer.globalToLocalRect(rect.x, rect.y, rect.width, rect.height);
                let window = this._guideLayer.getChild("window");
                window.setSize(rect.width, rect.height);
                fgui.GTween.to2(window.x, window.y, rect.x, rect.y, 0.5).setTarget(window, window.setXY);
            });
        }
    }

    class CooldownDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/Cooldown", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("Cooldown", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._btn0 = this._view.getChild("b0").asProgress;
            this._btn1 = this._view.getChild("b1").asProgress;
            this._btn0.getChild("icon").icon = "res/icons/k0.png";
            this._btn1.getChild("icon").icon = "res/icons/k1.png";
            fgui.GTween.to(0, 100, 5).setTarget(this._btn0, "value").setRepeat(-1);
            fgui.GTween.to(10, 0, 10).setTarget(this._btn1, "value").setRepeat(-1);
        }
    }

    class HitTestDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/HitTest", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("HitTest", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
        }
        destroy() {
        }
    }

    class EmojiParser extends fgui.UBBParser {
        constructor() {
            super();
            EmojiParser.TAGS.forEach(element => {
                this._handlers[":" + element] = this.onTag_Emoji;
            });
        }
        onTag_Emoji(tagName, end, attr) {
            return "<img src='" + fgui.UIPackage.getItemURL("Chat", tagName.substring(1).toLowerCase()) + "'/>";
        }
    }
    EmojiParser.TAGS = ["88", "am", "bs", "bz", "ch", "cool", "dhq", "dn", "fd", "gz", "han", "hx", "hxiao", "hxiu"];

    class Message {
    }
    class ChatDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/Chat", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("Chat", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._messages = new Array();
            this._emojiParser = new EmojiParser();
            this._list = this._view.getChild("list").asList;
            this._list.setVirtual();
            this._list.itemProvider = Laya.Handler.create(this, this.getListItemResource, null, false);
            this._list.itemRenderer = Laya.Handler.create(this, this.renderListItem, null, false);
            this._input = this._view.getChild("input1").asTextInput;
            this._input.nativeInput.on(Laya.Event.ENTER, this, this.onSubmit);
            this._view.getChild("btnSend1").onClick(this, this.onClickSendBtn);
            this._view.getChild("btnEmoji1").onClick(this, this.onClickEmojiBtn);
            this._emojiSelectUI = fgui.UIPackage.createObject("Chat", "EmojiSelectUI").asCom;
            this._emojiSelectUI.getChild("list").on(fgui.Events.CLICK_ITEM, this, this.onClickEmoji);
        }
        addMsg(sender, senderIcon, msg, fromMe) {
            let isScrollBottom = this._list.scrollPane.isBottomMost;
            let newMessage = new Message();
            newMessage.sender = sender;
            newMessage.senderIcon = senderIcon;
            newMessage.msg = msg;
            newMessage.fromMe = fromMe;
            this._messages.push(newMessage);
            if (newMessage.fromMe) {
                if (this._messages.length == 1 || Math.random() < 0.5) {
                    let replyMessage = new Message();
                    replyMessage.sender = "FairyGUI";
                    replyMessage.senderIcon = "r1";
                    replyMessage.msg = "Today is a good day. ";
                    replyMessage.fromMe = false;
                    this._messages.push(replyMessage);
                }
            }
            if (this._messages.length > 100)
                this._messages.splice(0, this._messages.length - 100);
            this._list.numItems = this._messages.length;
            if (isScrollBottom)
                this._list.scrollPane.scrollBottom();
        }
        getListItemResource(index) {
            let msg = this._messages[index];
            if (msg.fromMe)
                return "ui://Chat/chatRight";
            else
                return "ui://Chat/chatLeft";
        }
        renderListItem(index, item) {
            let msg = this._messages[index];
            if (!msg.fromMe)
                item.getChild("name").text = msg.sender;
            item.icon = fgui.UIPackage.getItemURL("Chat", msg.senderIcon);
            var txtObj = item.getChild("msg").asRichTextField;
            txtObj.width = txtObj.initWidth;
            txtObj.text = this._emojiParser.parse(msg.msg);
            if (txtObj.textWidth < txtObj.width)
                txtObj.width = txtObj.textWidth;
        }
        onClickSendBtn() {
            let msg = this._input.text;
            if (!msg)
                return;
            this.addMsg("Creator", "r0", msg, true);
            this._input.text = "";
        }
        onClickEmojiBtn(evt) {
            fgui.GRoot.inst.showPopup(this._emojiSelectUI, fgui.GObject.cast(evt.currentTarget), false);
        }
        onClickEmoji(item) {
            this._input.text += "[:" + item.text + "]";
        }
        onSubmit() {
            this.onClickSendBtn();
        }
    }

    class ScrollPaneDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/ScrollPane", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("ScrollPane", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._list = this._view.getChild("list").asList;
            this._list.itemRenderer = Laya.Handler.create(this, this.renderListItem, null, false);
            this._list.setVirtual();
            this._list.numItems = 1000;
            this._list.on(Laya.Event.MOUSE_DOWN, this, this.onClickList);
        }
        renderListItem(index, item) {
            item.title = "Item " + index;
            item.scrollPane.posX = 0;
            item.getChild("b0").onClick(this, this.onClickStick);
            item.getChild("b1").onClick(this, this.onClickDelete);
        }
        onClickList(evt) {
            let cnt = this._list.numChildren;
            for (let i = 0; i < cnt; i++) {
                let item = this._list.getChildAt(i).asButton;
                if (item.scrollPane.posX != 0) {
                    if (item.getChild("b0").asButton.isAncestorOf(fgui.GRoot.inst.touchTarget)
                        || item.getChild("b1").asButton.isAncestorOf(fgui.GRoot.inst.touchTarget)) {
                        return;
                    }
                    item.scrollPane.setPosX(0, true);
                    item.scrollPane.cancelDragging();
                    this._list.scrollPane.cancelDragging();
                    break;
                }
            }
        }
        onClickStick(evt) {
            this._view.getChild("txt").text = "Stick " + fgui.GObject.cast(evt.currentTarget).parent.text;
        }
        onClickDelete(evt) {
            this._view.getChild("txt").text = "Delete " + fgui.GObject.cast(evt.currentTarget).parent.text;
        }
    }

    class TreeViewDemo {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/TreeView", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("TreeView", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
        }
    }

    class MainMenu {
        constructor() {
            fgui.UIPackage.loadPackage("res/UI/MainMenu", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("MainMenu", "Main").asCom;
            this._view.makeFullScreen();
            fgui.GRoot.inst.addChild(this._view);
            this._view.getChild("n1").onClick(this, function () {
                this.startDemo(BasicDemo);
            });
            this._view.getChild("n2").onClick(this, function () {
                this.startDemo(TransitionDemo);
            });
            this._view.getChild("n4").onClick(this, function () {
                this.startDemo(VirtualListDemo);
            });
            this._view.getChild("n5").onClick(this, function () {
                this.startDemo(LoopListDemo);
            });
            this._view.getChild("n6").onClick(this, function () {
                this.startDemo(HitTestDemo);
            });
            this._view.getChild("n7").onClick(this, function () {
                this.startDemo(PullToRefreshDemo);
            });
            this._view.getChild("n8").onClick(this, function () {
                this.startDemo(ModalWaitingDemo);
            });
            this._view.getChild("n9").onClick(this, function () {
                this.startDemo(JoystickDemo);
            });
            this._view.getChild("n10").onClick(this, function () {
                this.startDemo(BagDemo);
            });
            this._view.getChild("n11").onClick(this, function () {
                this.startDemo(ChatDemo);
            });
            this._view.getChild("n12").onClick(this, function () {
                this.startDemo(ListEffectDemo);
            });
            this._view.getChild("n13").onClick(this, function () {
                this.startDemo(ScrollPaneDemo);
            });
            this._view.getChild("n14").onClick(this, function () {
                this.startDemo(TreeViewDemo);
            });
            this._view.getChild("n15").onClick(this, function () {
                this.startDemo(GuideDemo);
            });
            this._view.getChild("n16").onClick(this, function () {
                this.startDemo(CooldownDemo);
            });
        }
        startDemo(demoClass) {
            this._view.dispose();
            let demo = new demoClass();
            Laya.stage.event("start_demo", demo);
        }
        destroy() {
            this._view.dispose();
        }
    }

    class DemoEntry {
        constructor() {
            Laya.stage.on("start_demo", this, this.onDemoStart);
            this._currentDemo = new MainMenu();
        }
        onDemoStart(demo) {
            this._currentDemo = demo;
            this._closeButton = fgui.UIPackage.createObject("MainMenu", "CloseButton");
            this._closeButton.setXY(fgui.GRoot.inst.width - this._closeButton.width - 10, fgui.GRoot.inst.height - this._closeButton.height - 10);
            this._closeButton.addRelation(fgui.GRoot.inst, fgui.RelationType.Right_Right);
            this._closeButton.addRelation(fgui.GRoot.inst, fgui.RelationType.Bottom_Bottom);
            this._closeButton.sortingOrder = 100000;
            this._closeButton.onClick(this, this.onDemoClosed);
            fgui.GRoot.inst.addChild(this._closeButton);
        }
        onDemoClosed() {
            if (this._currentDemo.destroy)
                this._currentDemo.destroy();
            fgui.GRoot.inst.removeChildren(0, -1, true);
            this._currentDemo = new MainMenu();
        }
    }

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.stage.bgColor = "#333333";
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            Laya.stage.addChild(fgui.GRoot.inst.displayObject);
            new DemoEntry();
        }
    }
    new Main();

}());
