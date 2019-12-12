namespace fgui {
    export class GRoot extends GComponent {
        public static contentScaleLevel: number = 0;

        private _modalLayer: GGraph;
        private _popupStack: GObject[];
        private _justClosedPopups: GObject[];
        private _modalWaitPane: GObject;
        private _focusedObject: GObject;
        private _tooltipWin: GObject;
        private _defaultTooltipWin: GObject;
        private _checkPopups: boolean;

        private static _inst: GRoot;

        public static get inst(): GRoot {
            if (GRoot._inst == null)
                new GRoot();
            return GRoot._inst;
        }

        constructor() {
            super();
            if (GRoot._inst == null)
                GRoot._inst = this;

            this.opaque = false;
            this._popupStack = [];
            this._justClosedPopups = [];
            this.displayObject.once(Laya.Event.DISPLAY, this, this.__addedToStage);
        }

        public showWindow(win: Window): void {
            this.addChild(win);
            win.requestFocus();

            if (win.x > this.width)
                win.x = this.width - win.width;
            else if (win.x + win.width < 0)
                win.x = 0;

            if (win.y > this.height)
                win.y = this.height - win.height;
            else if (win.y + win.height < 0)
                win.y = 0;

            this.adjustModalLayer();
        }

        public hideWindow(win: Window): void {
            win.hide();
        }

        public hideWindowImmediately(win: Window): void {
            if (win.parent == this)
                this.removeChild(win);

            this.adjustModalLayer();
        }

        public bringToFront(win: Window): void {
            var cnt: number = this.numChildren;
            var i: number;
            if (this._modalLayer.parent != null && !win.modal)
                i = this.getChildIndex(this._modalLayer) - 1;
            else
                i = cnt - 1;

            for (; i >= 0; i--) {
                var g: GObject = this.getChildAt(i);
                if (g == win)
                    return;
                if (g instanceof Window)
                    break;
            }

            if (i >= 0)
                this.setChildIndex(win, i);
        }

        public showModalWait(msg: string = null): void {
            if (fgui.UIConfig.globalModalWaiting != null) {
                if (this._modalWaitPane == null)
                    this._modalWaitPane = UIPackage.createObjectFromURL(fgui.UIConfig.globalModalWaiting);
                this._modalWaitPane.setSize(this.width, this.height);
                this._modalWaitPane.addRelation(this, RelationType.Size);

                this.addChild(this._modalWaitPane);
                this._modalWaitPane.text = msg;
            }
        }

        public closeModalWait(): void {
            if (this._modalWaitPane != null && this._modalWaitPane.parent != null)
                this.removeChild(this._modalWaitPane);
        }

        public closeAllExceptModals(): void {
            var arr: GObject[] = this._children.slice();
            var cnt: number = arr.length;
            for (var i: number = 0; i < cnt; i++) {
                var g: GObject = arr[i];
                if ((g instanceof Window) && !(<Window>g).modal)
                    (<Window>g).hide();
            }
        }

        public closeAllWindows(): void {
            var arr: GObject[] = this._children.slice();
            var cnt: number = arr.length;
            for (var i: number = 0; i < cnt; i++) {
                var g: GObject = arr[i];
                if (g instanceof Window)
                    (<Window>g).hide();
            }
        }

        public getTopWindow(): Window {
            var cnt: number = this.numChildren;
            for (var i: number = cnt - 1; i >= 0; i--) {
                var g: GObject = this.getChildAt(i);
                if (g instanceof Window) {
                    return (<Window>g);
                }
            }

            return null;
        }

        public get modalLayer(): GGraph {
            return this._modalLayer;
        }

        public get hasModalWindow(): boolean {
            return this._modalLayer.parent != null;
        }

        public get modalWaiting(): boolean {
            return this._modalWaitPane && this._modalWaitPane.inContainer;
        }

        public showPopup(popup: GObject, target: GObject = null, downward: any = null): void {
            if (this._popupStack.length > 0) {
                var k: number = this._popupStack.indexOf(popup);
                if (k != -1) {
                    for (var i: number = this._popupStack.length - 1; i >= k; i--)
                        this.removeChild(this._popupStack.pop());
                }
            }
            this._popupStack.push(popup);

            if (target != null) {
                var p: GObject = target;
                while (p != null) {
                    if (p.parent == this) {
                        if (popup.sortingOrder < p.sortingOrder) {
                            popup.sortingOrder = p.sortingOrder;
                        }
                        break;
                    }
                    p = p.parent;
                }
            }

            this.addChild(popup);
            this.adjustModalLayer();

            var pos: Laya.Point;
            var sizeW: number = 0, sizeH: number = 0;
            if (target) {
                pos = target.localToGlobal();
                sizeW = target.width;
                sizeH = target.height;
            }
            else {
                pos = this.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
            }
            var xx: number, yy: number;
            xx = pos.x;
            if (xx + popup.width > this.width)
                xx = xx + sizeW - popup.width;
            yy = pos.y + sizeH;
            if ((downward == null && yy + popup.height > this.height)
                || downward == false) {
                yy = pos.y - popup.height - 1;
                if (yy < 0) {
                    yy = 0;
                    xx += sizeW / 2;
                }
            }

            popup.x = xx;
            popup.y = yy;
        }

        public togglePopup(popup: GObject, target: GObject = null, downward: any = null): void {
            if (this._justClosedPopups.indexOf(popup) != -1)
                return;

            this.showPopup(popup, target, downward);
        }

        public hidePopup(popup: GObject = null): void {
            if (popup != null) {
                var k: number = this._popupStack.indexOf(popup);
                if (k != -1) {
                    for (var i: number = this._popupStack.length - 1; i >= k; i--)
                        this.closePopup(this._popupStack.pop());
                }
            }
            else {
                var cnt: number = this._popupStack.length;
                for (i = cnt - 1; i >= 0; i--)
                    this.closePopup(this._popupStack[i]);
                this._popupStack.length = 0;
            }
        }

        public get hasAnyPopup(): boolean {
            return this._popupStack.length != 0;
        }

        private closePopup(target: GObject): void {
            if (target.parent != null) {
                if (target instanceof Window)
                    (<Window>target).hide();
                else
                    this.removeChild(target);
            }
        }

        public showTooltips(msg: string): void {
            if (this._defaultTooltipWin == null) {
                var resourceURL: string = UIConfig.tooltipsWin;
                if (!resourceURL) {
                    Laya.Log.print("UIConfig.tooltipsWin not defined");
                    return;
                }

                this._defaultTooltipWin = UIPackage.createObjectFromURL(resourceURL);
            }

            this._defaultTooltipWin.text = msg;
            this.showTooltipsWin(this._defaultTooltipWin);
        }

        public showTooltipsWin(tooltipWin: GObject, position: Laya.Point = null): void {
            this.hideTooltips();

            this._tooltipWin = tooltipWin;

            var xx: number = 0;
            var yy: number = 0;
            if (position == null) {
                xx = Laya.stage.mouseX + 10;
                yy = Laya.stage.mouseY + 20;
            }
            else {
                xx = position.x;
                yy = position.y;
            }
            var pt: Laya.Point = this.globalToLocal(xx, yy);
            xx = pt.x;
            yy = pt.y;

            if (xx + this._tooltipWin.width > this.width) {
                xx = xx - this._tooltipWin.width - 1;
                if (xx < 0)
                    xx = 10;
            }
            if (yy + this._tooltipWin.height > this.height) {
                yy = yy - this._tooltipWin.height - 1;
                if (xx - this._tooltipWin.width - 1 > 0)
                    xx = xx - this._tooltipWin.width - 1;
                if (yy < 0)
                    yy = 10;
            }

            this._tooltipWin.x = xx;
            this._tooltipWin.y = yy;
            this.addChild(this._tooltipWin);
        }

        public hideTooltips(): void {
            if (this._tooltipWin != null) {
                if (this._tooltipWin.parent)
                    this.removeChild(this._tooltipWin);
                this._tooltipWin = null;
            }
        }

        public get focus(): GObject {
            if (this._focusedObject && !this._focusedObject.onStage)
                this._focusedObject = null;

            return this._focusedObject;
        }

        public set focus(value: GObject) {
            if (value && (!value.focusable || !value.onStage))
                throw "invalid this.focus target";

            this.setFocus(value);
        }

        private setFocus(value: GObject): void {
            if (this._focusedObject != value) {
                this._focusedObject = value;
                this.displayObject.event(Events.FOCUS_CHANGED);
            }
        }

        public get volumeScale(): number {
            return Laya.SoundManager.soundVolume;
        }

        public set volumeScale(value: number) {
            Laya.SoundManager.soundVolume = value;
        }

        public playOneShotSound(url: string, volumeScale: number = 1): void {
            if (ToolSet.startsWith(url, "ui://"))
                return;

            Laya.SoundManager.playSound(url);
        }

        private adjustModalLayer(): void {
            var cnt: number = this.numChildren;

            if (this._modalWaitPane != null && this._modalWaitPane.parent != null)
                this.setChildIndex(this._modalWaitPane, cnt - 1);

            for (var i: number = cnt - 1; i >= 0; i--) {
                var g: GObject = this.getChildAt(i);
                if ((g instanceof Window) && (<Window>g).modal) {
                    if (this._modalLayer.parent == null)
                        this.addChildAt(this._modalLayer, i);
                    else
                        this.setChildIndexBefore(this._modalLayer, i);
                    return;
                }
            }

            if (this._modalLayer.parent != null)
                this.removeChild(this._modalLayer);
        }

        private __addedToStage(): void {
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.__stageMouseDown);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.__stageMouseUp);

            this._modalLayer = new GGraph();
            this._modalLayer.setSize(this.width, this.height);
            this._modalLayer.drawRect(0, null, UIConfig.modalLayerColor);
            this._modalLayer.addRelation(this, RelationType.Size);

            this.displayObject.stage.on(Laya.Event.RESIZE, this, this.__winResize);

            this.__winResize();
        }

        public checkPopups(clickTarget: Laya.Sprite): void {
            if (this._checkPopups)
                return;

            this._checkPopups = true;
            this._justClosedPopups.length = 0;
            if (this._popupStack.length > 0) {
                var mc: Laya.Node = clickTarget;
                while (mc != this.displayObject.stage && mc != null) {
                    if (mc["$owner"]) {
                        var pindex: number = this._popupStack.indexOf(mc["$owner"]);
                        if (pindex != -1) {
                            for (var i: number = this._popupStack.length - 1; i > pindex; i--) {
                                var popup: GObject = this._popupStack.pop();
                                this.closePopup(popup);
                                this._justClosedPopups.push(popup);
                            }
                            return;
                        }
                    }
                    mc = mc.parent;
                }

                var cnt: number = this._popupStack.length;
                for (i = cnt - 1; i >= 0; i--) {
                    popup = this._popupStack[i];
                    this.closePopup(popup);
                    this._justClosedPopups.push(popup);
                }
                this._popupStack.length = 0;
            }
        }

        private __stageMouseDown(evt: Laya.Event): void {
            var mc: Laya.Node = evt.target;
            while (mc != this.displayObject.stage && mc != null) {
                if (mc["$owner"]) {
                    var gg: GObject = mc["$owner"];
                    if (gg.touchable && gg.focusable) {
                        this.setFocus(gg);
                        break;
                    }
                }
                mc = mc.parent;
            }

            if (this._tooltipWin != null)
                this.hideTooltips();

            this.checkPopups(evt.target);
        }

        private __stageMouseUp(): void {
            this._checkPopups = false;
        }

        private __winResize(): void {
            this.setSize(Laya.stage.width, Laya.stage.height);

            this.updateContentScaleLevel();
        }

        private updateContentScaleLevel(): void {
            var mat: Laya.Matrix = <Laya.Matrix>(<any>Laya.stage)._canvasTransform;
            var ss: number = Math.max(mat.getScaleX(), mat.getScaleY());
            if (ss >= 3.5)
                GRoot.contentScaleLevel = 3; //x4
            else if (ss >= 2.5)
                GRoot.contentScaleLevel = 2; //x3
            else if (ss >= 1.5)
                GRoot.contentScaleLevel = 1; //x2
            else
                GRoot.contentScaleLevel = 0;
        }
    }
}