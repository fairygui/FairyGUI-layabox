///<reference path="GObject.ts"/>
///<reference path="Margin.ts"/>

namespace fgui {
    export class GComponent extends GObject {
        private _sortingChildCount: number = 0;
        private _opaque: boolean;
        private _applyingController: Controller;
        private _mask: Laya.Sprite = null;

        protected _margin: Margin;
        protected _trackBounds: boolean;
        protected _boundsChanged: boolean;
        protected _childrenRenderOrder: number;
        protected _apexIndex: number;

        public _buildingDisplayList: boolean;
        public _children: GObject[];
        public _controllers: Controller[];
        public _transitions: Transition[];
        public _container: Laya.Sprite;
        public _scrollPane: ScrollPane;
        public _alignOffset: Laya.Point;

        constructor() {
            super();
            this._children = [];
            this._controllers = [];
            this._transitions = [];
            this._margin = new Margin();
            this._alignOffset = new Laya.Point();
            this._opaque = false;
            this._childrenRenderOrder = 0;
            this._apexIndex = 0;
        }

        protected createDisplayObject(): void {
            super.createDisplayObject();
            this._displayObject.mouseEnabled = true;
            this._displayObject.mouseThrough = true;
            this._container = this._displayObject;
        }

        public dispose(): void {
            var i: number;
            var cnt: number;

            cnt = this._transitions.length;
            for (i = 0; i < cnt; ++i) {
                var trans: Transition = this._transitions[i];
                trans.dispose();
            }

            cnt = this._controllers.length;
            for (i = 0; i < cnt; ++i) {
                var cc: Controller = this._controllers[i];
                cc.dispose();
            }

            if (this.scrollPane != null)
                this.scrollPane.dispose();

            cnt = this._children.length;
            for (i = cnt - 1; i >= 0; --i) {
                var obj: GObject = this._children[i];
                obj.parent = null;//avoid removeFromParent call
                obj.dispose();
            }

            this._boundsChanged = false;
            this._mask = null;
            super.dispose();
        }

        public get displayListContainer(): Laya.Sprite {
            return this._container;
        }

        public addChild(child: GObject): GObject {
            this.addChildAt(child, this._children.length);
            return child;
        }

        public addChildAt(child: GObject, index: number = 0): GObject {
            if (!child)
                throw "child is null";

            if (index >= 0 && index <= this._children.length) {
                if (child.parent == this) {
                    this.setChildIndex(child, index);
                }
                else {
                    child.removeFromParent();
                    child.parent = this;

                    var cnt: number = this._children.length;
                    if (child.sortingOrder != 0) {
                        this._sortingChildCount++;
                        index = this.getInsertPosForSortingChild(child);
                    }
                    else if (this._sortingChildCount > 0) {
                        if (index > (cnt - this._sortingChildCount))
                            index = cnt - this._sortingChildCount;
                    }

                    if (index == cnt)
                        this._children.push(child);
                    else
                        this._children.splice(index, 0, child);

                    this.childStateChanged(child);
                    this.setBoundsChangedFlag();
                }

                return child;
            }
            else {
                throw "Invalid child index";
            }
        }

        private getInsertPosForSortingChild(target: GObject): number {
            var cnt: number = this._children.length;
            var i: number = 0;
            for (i = 0; i < cnt; i++) {
                var child: GObject = this._children[i];
                if (child == target)
                    continue;

                if (target.sortingOrder < child.sortingOrder)
                    break;
            }
            return i;
        }

        public removeChild(child: GObject, dispose?: boolean): GObject {
            var childIndex: number = this._children.indexOf(child);
            if (childIndex != -1) {
                this.removeChildAt(childIndex, dispose);
            }
            return child;
        }

        public removeChildAt(index: number, dispose?: boolean): GObject {
            if (index >= 0 && index < this._children.length) {
                var child: GObject = this._children[index];
                child.parent = null;

                if (child.sortingOrder != 0)
                    this._sortingChildCount--;

                this._children.splice(index, 1);
                child.group = null;
                if (child.inContainer) {
                    this._container.removeChild(child.displayObject);

                    if (this._childrenRenderOrder == ChildrenRenderOrder.Arch)
                        Laya.timer.callLater(this, this.buildNativeDisplayList);
                }

                if (dispose)
                    child.dispose();

                this.setBoundsChangedFlag();

                return child;
            }
            else {
                throw "Invalid child index";
            }
        }

        public removeChildren(beginIndex: number = 0, endIndex: number = -1, dispose?: boolean): void {
            if (endIndex < 0 || endIndex >= this._children.length)
                endIndex = this._children.length - 1;

            for (var i: number = beginIndex; i <= endIndex; ++i)
                this.removeChildAt(beginIndex, dispose);
        }

        public getChildAt(index: number): GObject {
            if (index >= 0 && index < this._children.length)
                return this._children[index];
            else
                throw "Invalid child index";
        }

        public getChild(name: string): GObject {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                if (this._children[i].name == name)
                    return this._children[i];
            }

            return null;
        }

        public getChildByPath(path: String): GObject {
            var arr: string[] = path.split(".");
            var cnt: number = arr.length;
            var gcom: GComponent = this;
            var obj: GObject;
            for (var i: number = 0; i < cnt; ++i) {
                obj = gcom.getChild(arr[i]);
                if (!obj)
                    break;

                if (i != cnt - 1) {
                    if (!(gcom instanceof GComponent)) {
                        obj = null;
                        break;
                    }
                    else
                        gcom = <GComponent>obj;
                }
            }

            return obj;
        }

        public getVisibleChild(name: string): GObject {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                var child: GObject = this._children[i];
                if (child.internalVisible && child.internalVisible2 && child.name == name)
                    return child;
            }

            return null;
        }

        public getChildInGroup(name: string, group: GGroup): GObject {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                var child: GObject = this._children[i];
                if (child.group == group && child.name == name)
                    return child;
            }

            return null;
        }

        public getChildById(id: string): GObject {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                if (this._children[i]._id == id)
                    return this._children[i];
            }

            return null;
        }

        public getChildIndex(child: GObject): number {
            return this._children.indexOf(child);
        }

        public setChildIndex(child: GObject, index: number): void {
            var oldIndex: number = this._children.indexOf(child);
            if (oldIndex == -1)
                throw "Not a child of this container";

            if (child.sortingOrder != 0) //no effect
                return;

            var cnt: number = this._children.length;
            if (this._sortingChildCount > 0) {
                if (index > (cnt - this._sortingChildCount - 1))
                    index = cnt - this._sortingChildCount - 1;
            }

            this._setChildIndex(child, oldIndex, index);
        }

        public setChildIndexBefore(child: GObject, index: number): number {
            var oldIndex: number = this._children.indexOf(child);
            if (oldIndex == -1)
                throw "Not a child of this container";

            if (child.sortingOrder != 0) //no effect
                return oldIndex;

            var cnt: number = this._children.length;
            if (this._sortingChildCount > 0) {
                if (index > (cnt - this._sortingChildCount - 1))
                    index = cnt - this._sortingChildCount - 1;
            }

            if (oldIndex < index)
                return this._setChildIndex(child, oldIndex, index - 1);
            else
                return this._setChildIndex(child, oldIndex, index);
        }

        private _setChildIndex(child: GObject, oldIndex: number, index: number): number {
            var cnt: number = this._children.length;
            if (index > cnt)
                index = cnt;

            if (oldIndex == index)
                return oldIndex;

            this._children.splice(oldIndex, 1);
            this._children.splice(index, 0, child);

            if (child.inContainer) {

                var displayIndex: number = 0;
                var g: GObject;
                var i: number;

                if (this._childrenRenderOrder == ChildrenRenderOrder.Ascent) {
                    for (i = 0; i < index; i++) {
                        g = this._children[i];
                        if (g.inContainer)
                            displayIndex++;
                    }
                    if (displayIndex == this._container.numChildren)
                        displayIndex--;
                    this._container.setChildIndex(child.displayObject, displayIndex);
                }
                else if (this._childrenRenderOrder == ChildrenRenderOrder.Descent) {
                    for (i = cnt - 1; i > index; i--) {
                        g = this._children[i];
                        if (g.inContainer)
                            displayIndex++;
                    }
                    if (displayIndex == this._container.numChildren)
                        displayIndex--;
                    this._container.setChildIndex(child.displayObject, displayIndex);
                }
                else {
                    Laya.timer.callLater(this, this.buildNativeDisplayList);
                }

                this.setBoundsChangedFlag();
            }

            return index;
        }

        public swapChildren(child1: GObject, child2: GObject): void {
            var index1: number = this._children.indexOf(child1);
            var index2: number = this._children.indexOf(child2);
            if (index1 == -1 || index2 == -1)
                throw "Not a child of this container";
            this.swapChildrenAt(index1, index2);
        }

        public swapChildrenAt(index1: number, index2: number): void {
            var child1: GObject = this._children[index1];
            var child2: GObject = this._children[index2];

            this.setChildIndex(child1, index2);
            this.setChildIndex(child2, index1);
        }

        public get numChildren(): number {
            return this._children.length;
        }

        public isAncestorOf(child: GObject): boolean {
            if (child == null)
                return false;

            var p: GComponent = child.parent;
            while (p) {
                if (p == this)
                    return true;

                p = p.parent;
            }
            return false;
        }

        public addController(controller: Controller): void {
            this._controllers.push(controller);
            controller.parent = this;
            this.applyController(controller);
        }

        public getControllerAt(index: number): Controller {
            return this._controllers[index];
        }

        public getController(name: string): Controller {
            var cnt: number = this._controllers.length;
            for (var i: number = 0; i < cnt; ++i) {
                var c: Controller = this._controllers[i];
                if (c.name == name)
                    return c;
            }

            return null;
        }

        public removeController(c: Controller): void {
            var index: number = this._controllers.indexOf(c);
            if (index == -1)
                throw new Error("controller not exists");

            c.parent = null;
            this._controllers.splice(index, 1);

            var length: number = this._children.length;
            for (var i: number = 0; i < length; i++) {
                var child: GObject = this._children[i];
                child.handleControllerChanged(c);
            }
        }

        public get controllers(): Controller[] {
            return this._controllers;
        }

        public childStateChanged(child: GObject): void {
            if (this._buildingDisplayList)
                return;

            var cnt: number = this._children.length;
            if (child instanceof GGroup) {
                for (var i: number = 0; i < cnt; i++) {
                    var g: GObject = this._children[i];
                    if (g.group == child)
                        this.childStateChanged(g);
                }
                return;
            }

            if (!child.displayObject)
                return;

            if (child.internalVisible && child.displayObject != this._displayObject.mask) {
                if (!child.displayObject.parent) {
                    var index: number = 0
                    if (this._childrenRenderOrder == ChildrenRenderOrder.Ascent) {
                        for (i = 0; i < cnt; i++) {
                            g = this._children[i];
                            if (g == child)
                                break;

                            if (g.displayObject != null && g.displayObject.parent != null)
                                index++;
                        }
                        this._container.addChildAt(child.displayObject, index);
                    }
                    else if (this._childrenRenderOrder == ChildrenRenderOrder.Descent) {
                        for (i = cnt - 1; i >= 0; i--) {
                            g = this._children[i];
                            if (g == child)
                                break;

                            if (g.displayObject != null && g.displayObject.parent != null)
                                index++;
                        }
                        this._container.addChildAt(child.displayObject, index);
                    }
                    else {
                        this._container.addChild(child.displayObject);

                        Laya.timer.callLater(this, this.buildNativeDisplayList);
                    }
                }
            }
            else {
                if (child.displayObject.parent) {
                    this._container.removeChild(child.displayObject);

                    if (this._childrenRenderOrder == ChildrenRenderOrder.Arch)
                        Laya.timer.callLater(this, this.buildNativeDisplayList);
                }
            }
        }

        private buildNativeDisplayList(): void {
            if (!this._displayObject)
                return;
            var cnt: number = this._children.length;
            if (cnt == 0)
                return;

            var i: number;
            var child: GObject;
            switch (this._childrenRenderOrder) {
                case ChildrenRenderOrder.Ascent:
                    {
                        for (i = 0; i < cnt; i++) {
                            child = this._children[i];
                            if (child.displayObject != null && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                    }
                    break;
                case ChildrenRenderOrder.Descent:
                    {
                        for (i = cnt - 1; i >= 0; i--) {
                            child = this._children[i];
                            if (child.displayObject != null && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                    }
                    break;

                case ChildrenRenderOrder.Arch:
                    {
                        var apex: number = ToolSet.clamp(this._apexIndex, 0, cnt);
                        for (i = 0; i < apex; i++) {
                            child = this._children[i];
                            if (child.displayObject != null && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                        for (i = cnt - 1; i >= apex; i--) {
                            child = this._children[i];
                            if (child.displayObject != null && child.internalVisible)
                                this._container.addChild(child.displayObject);
                        }
                    }
                    break;
            }
        }

        public applyController(c: Controller): void {
            this._applyingController = c;
            var child: GObject;
            var length: number = this._children.length;
            for (var i: number = 0; i < length; i++) {
                child = this._children[i];
                child.handleControllerChanged(c);
            }
            this._applyingController = null;
            c.runActions();
        }

        public applyAllControllers(): void {
            var cnt: number = this._controllers.length;
            for (var i: number = 0; i < cnt; ++i) {
                this.applyController(this._controllers[i]);
            }
        }

        public adjustRadioGroupDepth(obj: GObject, c: Controller): void {
            var cnt: number = this._children.length;
            var i: number;
            var child: GObject;
            var myIndex: number = -1, maxIndex: number = -1;
            for (i = 0; i < cnt; i++) {
                child = this._children[i];
                if (child == obj) {
                    myIndex = i;
                }
                else if ((child instanceof GButton)
                    && (<GButton>(child)).relatedController == c) {
                    if (i > maxIndex)
                        maxIndex = i;
                }
            }
            if (myIndex < maxIndex) {
                //如果正在applyingController，此时修改显示列表是危险的，但真正排除危险只能用显示列表的副本去做，这样性能可能损耗较大，
                //这里取个巧，让可能漏过的child补一下handleControllerChanged，反正重复执行是无害的。
                if (this._applyingController != null)
                    this._children[maxIndex].handleControllerChanged(this._applyingController);
                this.swapChildrenAt(myIndex, maxIndex);
            }
        }

        public getTransitionAt(index: number): Transition {
            return this._transitions[index];
        }

        public getTransition(transName: string): Transition {
            var cnt: number = this._transitions.length;
            for (var i: number = 0; i < cnt; ++i) {
                var trans: Transition = this._transitions[i];
                if (trans.name == transName)
                    return trans;
            }

            return null;
        }

        public isChildInView(child: GObject): boolean {
            if (this._displayObject.scrollRect != null) {
                return child.x + child.width >= 0 && child.x <= this.width
                    && child.y + child.height >= 0 && child.y <= this.height;
            }
            else if (this._scrollPane != null) {
                return this._scrollPane.isChildInView(child);
            }
            else
                return true;
        }

        public getFirstChildInView(): number {
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                var child: GObject = this._children[i];
                if (this.isChildInView(child))
                    return i;
            }
            return -1;
        }

        public get scrollPane(): ScrollPane {
            return this._scrollPane;
        }

        public get opaque(): boolean {
            return this._opaque;
        }

        public set opaque(value: boolean) {
            if (this._opaque != value) {
                this._opaque = value;
                if (this._opaque) {
                    if (this._displayObject.hitArea == null)
                        this._displayObject.hitArea = new Laya.Rectangle();

                    if (this._displayObject.hitArea instanceof Laya.Rectangle)
                        this._displayObject.hitArea.setTo(0, 0, this._width, this._height);

                    this._displayObject.mouseThrough = false;
                }
                else {
                    if (this._displayObject.hitArea instanceof Laya.Rectangle)
                        this._displayObject.hitArea = null;

                    this._displayObject.mouseThrough = true;
                }
            }
        }

        public get margin(): Margin {
            return this._margin;
        }

        public set margin(value: Margin) {
            this._margin.copy(value);
            if (this._displayObject.scrollRect != null) {
                this._container.pos(this._margin.left + this._alignOffset.x, this._margin.top + this._alignOffset.y);
            }
            this.handleSizeChanged();
        }

        /**
         * @see ChildrenRenderOrder
         */
        public get childrenRenderOrder(): number {
            return this._childrenRenderOrder;
        }

        /**
         * @see ChildrenRenderOrder
         */
        public set childrenRenderOrder(value: number) {
            if (this._childrenRenderOrder != value) {
                this._childrenRenderOrder = value;
                this.buildNativeDisplayList();
            }
        }

        public get apexIndex(): number {
            return this._apexIndex;
        }

        public set apexIndex(value: number) {
            if (this._apexIndex != value) {
                this._apexIndex = value;

                if (this._childrenRenderOrder == ChildrenRenderOrder.Arch)
                    this.buildNativeDisplayList();
            }
        }

        public get mask(): Laya.Sprite {
            return this._mask;
        }

        public set mask(value: Laya.Sprite) {
            this.setMask(value, false);
        }

        public setMask(value: Laya.Sprite, reversed: boolean): void {
            if (this._mask && this._mask != value) {
                if (this._mask.blendMode == "destination-out")
                    this._mask.blendMode = null;
            }

            this._mask = value;
            if (!this._mask) {
                this._displayObject.mask = null;
                if (this._displayObject.hitArea instanceof ChildHitArea)
                    this._displayObject.hitArea = null;
                return;
            }

            if (this._mask.hitArea) {
                this._displayObject.hitArea = new ChildHitArea(this._mask, reversed);
                this._displayObject.mouseThrough = false;
                this._displayObject.hitTestPrior = true;
            }
            if (reversed) {
                this._displayObject.mask = null;
                this._displayObject.cacheAs = "bitmap";
                this._mask.blendMode = "destination-out";
            }
            else
                this._displayObject.mask = this._mask;
        }

        public get baseUserData(): string {
            var buffer: ByteBuffer = this.packageItem.rawData;
            buffer.seek(0, 4);
            return buffer.readS();
        }

        protected updateHitArea(): void {
            if (this._displayObject.hitArea instanceof PixelHitTest) {
                var hitTest: PixelHitTest = <PixelHitTest>(this._displayObject.hitArea);
                if (this.sourceWidth != 0)
                    hitTest.scaleX = this._width / this.sourceWidth;
                if (this.sourceHeight != 0)
                    hitTest.scaleY = this._height / this.sourceHeight;
            }
            else if (this._displayObject.hitArea instanceof Laya.Rectangle) {
                this._displayObject.hitArea.setTo(0, 0, this._width, this._height);
            }
        }

        protected updateMask(): void {
            var rect: Laya.Rectangle = this._displayObject.scrollRect;
            if (rect == null)
                rect = new Laya.Rectangle();

            rect.x = this._margin.left;
            rect.y = this._margin.top;
            rect.width = this._width - this._margin.right;
            rect.height = this._height - this._margin.bottom;

            this._displayObject.scrollRect = rect;
        }

        protected setupScroll(buffer: ByteBuffer): void {
            if (this._displayObject == this._container) {
                this._container = new Laya.Sprite();
                this._displayObject.addChild(this._container);
            }
            this._scrollPane = new ScrollPane(this);
            this._scrollPane.setup(buffer);
        }

        protected setupOverflow(overflow: number): void {
            if (overflow == OverflowType.Hidden) {
                if (this._displayObject == this._container) {
                    this._container = new Laya.Sprite();
                    this._displayObject.addChild(this._container);
                }
                this.updateMask();
                this._container.pos(this._margin.left, this._margin.top);
            }
            else if (this._margin.left != 0 || this._margin.top != 0) {
                if (this._displayObject == this._container) {
                    this._container = new Laya.Sprite();
                    this._displayObject.addChild(this._container);
                }
                this._container.pos(this._margin.left, this._margin.top);
            }
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (this._scrollPane)
                this._scrollPane.onOwnerSizeChanged();
            else if (this._displayObject.scrollRect != null)
                this.updateMask();

            if (this._displayObject.hitArea != null)
                this.updateHitArea();
        }

        protected handleGrayedChanged(): void {
            var c: Controller = this.getController("grayed");
            if (c != null) {
                c.selectedIndex = this.grayed ? 1 : 0;
                return;
            }

            var v: boolean = this.grayed;
            var cnt: number = this._children.length;
            for (var i: number = 0; i < cnt; ++i) {
                this._children[i].grayed = v;
            }
        }

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if (this._scrollPane != null)
                this._scrollPane.handleControllerChanged(c);
        }

        public setBoundsChangedFlag(): void {
            if (!this._scrollPane && !this._trackBounds)
                return;

            if (!this._boundsChanged) {
                this._boundsChanged = true;

                Laya.timer.callLater(this, this.__render);
            }
        }

        private __render(): void {
            if (this._boundsChanged) {
                var i1: number = 0;
                var len: number = this._children.length;
                var child: GObject
                for (i1 = 0; i1 < len; i1++) {
                    child = this._children[i1];
                    child.ensureSizeCorrect();
                }
                this.updateBounds();
            }
        }

        public ensureBoundsCorrect(): void {
            var i1: number = 0;
            var len: number = this._children.length;
            var child: GObject
            for (i1 = 0; i1 < len; i1++) {
                child = this._children[i1];
                child.ensureSizeCorrect();
            }

            if (this._boundsChanged)
                this.updateBounds();
        }

        protected updateBounds(): void {
            var ax: number = 0, ay: number = 0, aw: number = 0, ah: number = 0;
            var len: number = this._children.length;
            if (len > 0) {
                ax = Number.POSITIVE_INFINITY, ay = Number.POSITIVE_INFINITY;
                var ar: number = Number.NEGATIVE_INFINITY, ab: number = Number.NEGATIVE_INFINITY;
                var tmp: number = 0;
                var i1: number = 0;

                for (i1 = 0; i1 < len; i1++) {
                    var child: GObject = this._children[i1];
                    tmp = child.x;
                    if (tmp < ax)
                        ax = tmp;
                    tmp = child.y;
                    if (tmp < ay)
                        ay = tmp;
                    tmp = child.x + child.actualWidth;
                    if (tmp > ar)
                        ar = tmp;
                    tmp = child.y + child.actualHeight;
                    if (tmp > ab)
                        ab = tmp;
                }
                aw = ar - ax;
                ah = ab - ay;
            }
            this.setBounds(ax, ay, aw, ah);
        }

        public setBounds(ax: number, ay: number, aw: number, ah: number): void {
            this._boundsChanged = false;

            if (this._scrollPane)
                this._scrollPane.setContentSize(Math.round(ax + aw), Math.round(ay + ah));
        }

        public get viewWidth(): number {
            if (this._scrollPane != null)
                return this._scrollPane.viewWidth;
            else
                return this.width - this._margin.left - this._margin.right;
        }

        public set viewWidth(value: number) {
            if (this._scrollPane != null)
                this._scrollPane.viewWidth = value;
            else
                this.width = value + this._margin.left + this._margin.right;
        }

        public get viewHeight(): number {
            if (this._scrollPane != null)
                return this._scrollPane.viewHeight;
            else
                return this.height - this._margin.top - this._margin.bottom;
        }

        public set viewHeight(value: number) {
            if (this._scrollPane != null)
                this._scrollPane.viewHeight = value;
            else
                this.height = value + this._margin.top + this._margin.bottom;
        }

        public getSnappingPosition(xValue: number, yValue: number, resultPoint: Laya.Point = null): Laya.Point {
            return this.getSnappingPositionWithDir(xValue, yValue, 0, 0, resultPoint);
        }

        /**
         * dir正数表示右移或者下移，负数表示左移或者上移
         */
        public getSnappingPositionWithDir(xValue: number, yValue: number, xDir: number, yDir: number, resultPoint: Laya.Point = null): Laya.Point {
            if (!resultPoint)
                resultPoint = new Laya.Point();

            var cnt: number = this._children.length;
            if (cnt == 0) {
                resultPoint.x = 0;
                resultPoint.y = 0;
                return resultPoint;
            }

            this.ensureBoundsCorrect();

            var obj: GObject = null;
            var prev: GObject = null;
            var i: number = 0;
            if (yValue != 0) {
                for (; i < cnt; i++) {
                    obj = this._children[i];
                    if (yValue < obj.y) {
                        if (i == 0) {
                            yValue = 0;
                            break;
                        }
                        else {
                            prev = this._children[i - 1];
                            if (yValue < prev.y + prev.actualHeight / 2) //top half part
                                yValue = prev.y;
                            else //bottom half part
                                yValue = obj.y;
                            break;
                        }
                    }
                }

                if (i == cnt)
                    yValue = obj.y;
            }

            if (xValue != 0) {
                if (i > 0)
                    i--;
                for (; i < cnt; i++) {
                    obj = this._children[i];
                    if (xValue < obj.x) {
                        if (i == 0) {
                            xValue = 0;
                            break;
                        }
                        else {
                            prev = this._children[i - 1];
                            if (xValue < prev.x + prev.actualWidth / 2) //top half part
                                xValue = prev.x;
                            else //bottom half part
                                xValue = obj.x;
                            break;
                        }
                    }
                }

                if (i == cnt)
                    xValue = obj.x;
            }

            resultPoint.x = xValue;
            resultPoint.y = yValue;
            return resultPoint;
        }

        public childSortingOrderChanged(child: GObject, oldValue: number, newValue: number = 0): void {
            if (newValue == 0) {
                this._sortingChildCount--;
                this.setChildIndex(child, this._children.length);
            }
            else {
                if (oldValue == 0)
                    this._sortingChildCount++;

                var oldIndex: number = this._children.indexOf(child);
                var index: number = this.getInsertPosForSortingChild(child);
                if (oldIndex < index)
                    this._setChildIndex(child, oldIndex, index - 1);
                else
                    this._setChildIndex(child, oldIndex, index);
            }
        }

        public constructFromResource(): void {
            this.constructFromResource2(null, 0);
        }

        public constructFromResource2(objectPool: GObject[], poolIndex: number): void {
            var contentItem:PackageItem = this.packageItem.getBranch();

            if (!contentItem.decoded) {
                contentItem.decoded = true;
                TranslationHelper.translateComponent(contentItem);
            }

            var i: number;
            var dataLen: number;
            var curPos: number;
            var nextPos: number;
            var f1: number;
            var f2: number;
            var i1: number;
            var i2: number;

            var buffer: ByteBuffer = contentItem.rawData;
            buffer.seek(0, 0);

            this._underConstruct = true;

            this.sourceWidth = buffer.getInt32();
            this.sourceHeight = buffer.getInt32();
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;

            this.setSize(this.sourceWidth, this.sourceHeight);

            if (buffer.readBool()) {
                this.minWidth = buffer.getInt32();
                this.maxWidth = buffer.getInt32();
                this.minHeight = buffer.getInt32();
                this.maxHeight = buffer.getInt32();
            }

            if (buffer.readBool()) {
                f1 = buffer.getFloat32();
                f2 = buffer.getFloat32();
                this.internalSetPivot(f1, f2, buffer.readBool());
            }

            if (buffer.readBool()) {
                this._margin.top = buffer.getInt32();
                this._margin.bottom = buffer.getInt32();
                this._margin.left = buffer.getInt32();
                this._margin.right = buffer.getInt32();
            }

            var overflow: number = buffer.readByte();
            if (overflow == OverflowType.Scroll) {
                var savedPos: number = buffer.pos;
                buffer.seek(0, 7);
                this.setupScroll(buffer);
                buffer.pos = savedPos;
            }
            else
                this.setupOverflow(overflow);

            if (buffer.readBool())
                buffer.skip(8);

            this._buildingDisplayList = true;

            buffer.seek(0, 1);

            var controllerCount: number = buffer.getInt16();
            for (i = 0; i < controllerCount; i++) {
                nextPos = buffer.getInt16();
                nextPos += buffer.pos;

                var controller: Controller = new Controller();
                this._controllers.push(controller);
                controller.parent = this;
                controller.setup(buffer);

                buffer.pos = nextPos;
            }

            buffer.seek(0, 2);

            var child: GObject;
            var childCount: number = buffer.getInt16();
            for (i = 0; i < childCount; i++) {
                dataLen = buffer.getInt16();
                curPos = buffer.pos;

                if (objectPool != null)
                    child = objectPool[poolIndex + i];
                else {
                    buffer.seek(curPos, 0);

                    var type: number = buffer.readByte();
                    var src: string = buffer.readS();
                    var pkgId: string = buffer.readS();

                    var pi: PackageItem = null;
                    if (src != null) {
                        var pkg: UIPackage;
                        if (pkgId != null)
                            pkg = UIPackage.getById(pkgId);
                        else
                            pkg = contentItem.owner;

                        pi = pkg != null ? pkg.getItemById(src) : null;
                    }

                    if (pi != null) {
                        child = UIObjectFactory.newObject(pi);
                        child.constructFromResource();
                    }
                    else
                        child = UIObjectFactory.newObject2(type);
                }

                child._underConstruct = true;
                child.setup_beforeAdd(buffer, curPos);
                child.parent = this;
                this._children.push(child);

                buffer.pos = curPos + dataLen;
            }

            buffer.seek(0, 3);
            this.relations.setup(buffer, true);

            buffer.seek(0, 2);
            buffer.skip(2);

            for (i = 0; i < childCount; i++) {
                nextPos = buffer.getInt16();
                nextPos += buffer.pos;

                buffer.seek(buffer.pos, 3);
                this._children[i].relations.setup(buffer, false);

                buffer.pos = nextPos;
            }

            buffer.seek(0, 2);
            buffer.skip(2);

            for (i = 0; i < childCount; i++) {
                nextPos = buffer.getInt16();
                nextPos += buffer.pos;

                child = this._children[i];
                child.setup_afterAdd(buffer, buffer.pos);
                child._underConstruct = false;

                buffer.pos = nextPos;
            }

            buffer.seek(0, 4);

            buffer.skip(2); //customData
            this.opaque = buffer.readBool();
            var maskId: number = buffer.getInt16();
            if (maskId != -1) {
                this.setMask(this.getChildAt(maskId).displayObject, buffer.readBool());
            }

            var hitTestId: string = buffer.readS();
            i1 = buffer.getInt32();
            i2 = buffer.getInt32();
            var hitArea: Laya.HitArea;

            if (hitTestId) {
                pi = contentItem.owner.getItemById(hitTestId);
                if (pi && pi.pixelHitTestData)
                    hitArea = new PixelHitTest(pi.pixelHitTestData, i1, i2);
            }
            else if (i1 != 0 && i2 != -1) {
                hitArea = new ChildHitArea(this.getChildAt(i2).displayObject);
            }

            if (hitArea) {
                this._displayObject.hitArea = hitArea;
                this._displayObject.mouseThrough = false;
                this._displayObject.hitTestPrior = true;
            }

            buffer.seek(0, 5);

            var transitionCount: number = buffer.getInt16();
            for (i = 0; i < transitionCount; i++) {
                nextPos = buffer.getInt16();
                nextPos += buffer.pos;

                var trans: Transition = new Transition(this);
                trans.setup(buffer);
                this._transitions.push(trans);

                buffer.pos = nextPos;
            }

            if (this._transitions.length > 0) {
                this.displayObject.on(Laya.Event.DISPLAY, this, this.___added);
                this.displayObject.on(Laya.Event.UNDISPLAY, this, this.___removed);
            }

            this.applyAllControllers();

            this._buildingDisplayList = false;
            this._underConstruct = false;

            this.buildNativeDisplayList();
            this.setBoundsChangedFlag();

            if (contentItem.objectType != ObjectType.Component)
                this.constructExtension(buffer);

            this.onConstruct();
        }

        protected constructExtension(buffer: ByteBuffer): void {
        }

        protected onConstruct(): void {
            this.constructFromXML(null); //old version
        }

        protected constructFromXML(xml: Object): void {
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            buffer.seek(beginPos, 4);

            var pageController: number = buffer.getInt16();
            if (pageController != -1 && this._scrollPane != null)
                this._scrollPane.pageController = this._parent.getControllerAt(pageController);

            var cnt: number;
            var i: number;

            cnt = buffer.getInt16();
            for (i = 0; i < cnt; i++) {
                var cc: Controller = this.getController(buffer.readS());
                var pageId: string = buffer.readS();
                if (cc)
                    cc.selectedPageId = pageId;
            }

            if (buffer.version >= 2) {
                cnt = buffer.getInt16();
                for (i = 0; i < cnt; i++) {
                    var target: string = buffer.readS();
                    var propertyId: number = buffer.getInt16();
                    var value: String = buffer.readS();
                    var obj: GObject = this.getChildByPath(target);
                    if (obj)
                        obj.setProp(propertyId, value);
                }
            }
        }

        private ___added(): void {
            var cnt: number = this._transitions.length;
            for (var i: number = 0; i < cnt; ++i) {
                this._transitions[i].onOwnerAddedToStage();
            }
        }

        private ___removed(): void {
            var cnt: number = this._transitions.length;
            for (var i: number = 0; i < cnt; ++i) {
                this._transitions[i].onOwnerRemovedFromStage();
            }
        }
    }
}