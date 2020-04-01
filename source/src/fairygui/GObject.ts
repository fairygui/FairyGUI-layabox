namespace fgui {
    export class GObject {
        public data: Object;
        public packageItem: PackageItem;
        public static draggingObject: GObject;

        private _x: number = 0;
        private _y: number = 0;
        private _alpha: number = 1;
        private _rotation: number = 0;
        private _visible: boolean = true;
        private _touchable: boolean = true;
        private _grayed: boolean = false;
        private _draggable: boolean = false;
        private _scaleX: number = 1;
        private _scaleY: number = 1;
        private _skewX: number = 0;
        private _skewY: number = 0;
        private _pivotX: number = 0;
        private _pivotY: number = 0;
        private _pivotAsAnchor: boolean = false;
        private _pivotOffsetX: number = 0;
        private _pivotOffsetY: number = 0;
        private _sortingOrder: number = 0;
        private _internalVisible: boolean = true;
        private _handlingController: boolean = false;
        private _focusable: boolean = false;
        private _tooltips: string;
        private _pixelSnapping: boolean = false;

        private _relations: Relations;
        private _group: GGroup;
        private _gears: GearBase[];
        private _dragBounds: Laya.Rectangle;

        protected _displayObject: Laya.Sprite;
        protected _yOffset: number = 0;

        public minWidth: number = 0;
        public minHeight: number = 0;
        public maxWidth: number = 0;
        public maxHeight: number = 0;
        public sourceWidth: number = 0;
        public sourceHeight: number = 0;
        public initWidth: number = 0;
        public initHeight: number = 0;

        public _parent: GComponent;
        public _width: number = 0;
        public _height: number = 0;
        public _rawWidth: number = 0;
        public _rawHeight: number = 0;
        public _id: string;
        public _name: string;
        public _underConstruct: boolean;
        public _gearLocked: boolean;
        public _sizePercentInGroup: number = 0;
        public _treeNode: GTreeNode;

        public static _gInstanceCounter: number = 0;

        constructor() {
            this._id = "" + GObject._gInstanceCounter++;
            this._name = "";

            this.createDisplayObject();

            this._relations = new Relations(this);
            this._gears = new Array<GearBase>(10);
        }

        public get id(): string {
            return this._id;
        }

        public get name(): string {
            return this._name;
        }

        public set name(value: string) {
            this._name = value;
        }

        public get x(): number {
            return this._x;
        }

        public set x(value: number) {
            this.setXY(value, this._y);
        }

        public get y(): number {
            return this._y;
        }

        public set y(value: number) {
            this.setXY(this._x, value);
        }

        public setXY(xv: number, yv: number): void {
            if (this._x != xv || this._y != yv) {
                var dx: number = xv - this._x;
                var dy: number = yv - this._y;
                this._x = xv;
                this._y = yv;

                this.handleXYChanged();
                if (this instanceof GGroup)
                    (<GGroup>(this)).moveChildren(dx, dy);

                this.updateGear(1);

                if (this._parent && !(this._parent instanceof GList)) {
                    this._parent.setBoundsChangedFlag();
                    if (this._group != null)
                        this._group.setBoundsChangedFlag(true);
                    this.displayObject.event(Events.XY_CHANGED);
                }

                if (GObject.draggingObject == this && !GObject.sUpdateInDragging)
                    this.localToGlobalRect(0, 0, this.width, this.height, GObject.sGlobalRect);
            }
        }

        public get xMin(): number {
            return this._pivotAsAnchor ? (this._x - this._width * this._pivotX) : this._x;
        }

        public set xMin(value: number) {
            if (this._pivotAsAnchor)
                this.setXY(value + this._width * this._pivotX, this._y);
            else
                this.setXY(value, this._y);
        }

        public get yMin(): number {
            return this._pivotAsAnchor ? (this._y - this._height * this._pivotY) : this._y;
        }

        public set yMin(value: number) {
            if (this._pivotAsAnchor)
                this.setXY(this._x, value + this._height * this._pivotY);
            else
                this.setXY(this._x, value);
        }

        public get pixelSnapping(): boolean {
            return this._pixelSnapping;
        }

        public set pixelSnapping(value: boolean) {
            if (this._pixelSnapping != value) {
                this._pixelSnapping = value;
                this.handleXYChanged();
            }
        }

        public center(restraint: boolean = false): void {
            var r: GComponent;
            if (this._parent != null)
                r = this.parent;
            else
                r = this.root;

            this.setXY((r.width - this.width) / 2, (r.height - this.height) / 2);
            if (restraint) {
                this.addRelation(r, RelationType.Center_Center);
                this.addRelation(r, RelationType.Middle_Middle);
            }
        }

        public get width(): number {
            this.ensureSizeCorrect();
            if (this._relations.sizeDirty)
                this._relations.ensureRelationsSizeCorrect();
            return this._width;
        }

        public set width(value: number) {
            this.setSize(value, this._rawHeight);
        }

        public get height(): number {
            this.ensureSizeCorrect();
            if (this._relations.sizeDirty)
                this._relations.ensureRelationsSizeCorrect();
            return this._height;
        }

        public set height(value: number) {
            this.setSize(this._rawWidth, value);
        }

        public setSize(wv: number, hv: number, ignorePivot: boolean = false): void {
            if (this._rawWidth != wv || this._rawHeight != hv) {
                this._rawWidth = wv;
                this._rawHeight = hv;
                if (wv < this.minWidth)
                    wv = this.minWidth;
                if (hv < this.minHeight)
                    hv = this.minHeight;
                if (this.maxWidth > 0 && wv > this.maxWidth)
                    wv = this.maxWidth;
                if (this.maxHeight > 0 && hv > this.maxHeight)
                    hv = this.maxHeight;
                var dWidth: number = wv - this._width;
                var dHeight: number = hv - this._height;
                this._width = wv;
                this._height = hv;

                this.handleSizeChanged();
                if (this._pivotX != 0 || this._pivotY != 0) {
                    if (!this._pivotAsAnchor) {
                        if (!ignorePivot)
                            this.setXY(this.x - this._pivotX * dWidth, this.y - this._pivotY * dHeight);
                        this.updatePivotOffset();
                    }
                    else
                        this.applyPivot();
                }

                if (this instanceof GGroup)
                    (<GGroup>(this)).resizeChildren(dWidth, dHeight);

                this.updateGear(2);

                if (this._parent) {
                    this._relations.onOwnerSizeChanged(dWidth, dHeight, this._pivotAsAnchor || !ignorePivot);
                    this._parent.setBoundsChangedFlag();
                    if (this._group != null)
                        this._group.setBoundsChangedFlag();
                }

                this.displayObject.event(Events.SIZE_CHANGED);
            }
        }

        public ensureSizeCorrect(): void {
        }

        public makeFullScreen(): void {
            this.setSize(GRoot.inst.width, GRoot.inst.height);
        }

        public get actualWidth(): number {
            return this.width * Math.abs(this._scaleX);
        }

        public get actualHeight(): number {
            return this.height * Math.abs(this._scaleY);
        }

        public get scaleX(): number {
            return this._scaleX;
        }

        public set scaleX(value: number) {
            this.setScale(value, this._scaleY);
        }

        public get scaleY(): number {
            return this._scaleY;
        }

        public set scaleY(value: number) {
            this.setScale(this._scaleX, value);
        }

        public setScale(sx: number, sy: number): void {
            if (this._scaleX != sx || this._scaleY != sy) {
                this._scaleX = sx;
                this._scaleY = sy;
                this.handleScaleChanged();
                this.applyPivot();

                this.updateGear(2);
            }
        }

        public get skewX(): number {
            return this._skewX;
        }

        public set skewX(value: number) {
            this.setSkew(value, this._skewY);
        }

        public get skewY(): number {
            return this._skewY;
        }

        public set skewY(value: number) {
            this.setSkew(this._skewX, value);
        }

        public setSkew(sx: number, sy: number): void {
            if (this._skewX != sx || this._skewY != sy) {
                this._skewX = sx;
                this._skewY = sy;
                if (this._displayObject != null) {
                    this._displayObject.skew(-sx, sy);
                    this.applyPivot();
                }
            }
        }

        public get pivotX(): number {
            return this._pivotX;
        }

        public set pivotX(value: number) {
            this.setPivot(value, this._pivotY);
        }

        public get pivotY(): number {
            return this._pivotY;
        }

        public set pivotY(value: number) {
            this.setPivot(this._pivotX, value);
        }

        public setPivot(xv: number, yv: number = 0, asAnchor: boolean = false): void {
            if (this._pivotX != xv || this._pivotY != yv || this._pivotAsAnchor != asAnchor) {
                this._pivotX = xv;
                this._pivotY = yv;
                this._pivotAsAnchor = asAnchor;

                this.updatePivotOffset();
                this.handleXYChanged();
            }
        }

        public get pivotAsAnchor(): boolean {
            return this._pivotAsAnchor;
        }

        protected internalSetPivot(xv: number, yv: number, asAnchor: boolean): void {
            this._pivotX = xv;
            this._pivotY = yv;
            this._pivotAsAnchor = asAnchor;
            if (this._pivotAsAnchor)
                this.handleXYChanged();
        }

        private updatePivotOffset(): void {
            if (this._displayObject != null) {
                if (this._displayObject.transform && (this._pivotX != 0 || this._pivotY != 0)) {
                    GObject.sHelperPoint.x = this._pivotX * this._width;
                    GObject.sHelperPoint.y = this._pivotY * this._height;
                    var pt: Laya.Point = this._displayObject.transform.transformPoint(GObject.sHelperPoint);
                    this._pivotOffsetX = this._pivotX * this._width - pt.x;
                    this._pivotOffsetY = this._pivotY * this._height - pt.y;
                }
                else {
                    this._pivotOffsetX = 0;
                    this._pivotOffsetY = 0;
                }
            }
        }

        private applyPivot(): void {
            if (this._pivotX != 0 || this._pivotY != 0) {
                this.updatePivotOffset();
                this.handleXYChanged();
            }
        }

        public get touchable(): boolean {
            return this._touchable;
        }

        public set touchable(value: boolean) {
            if (this._touchable != value) {
                this._touchable = value;
                this.updateGear(3);

                if ((this instanceof GImage) || (this instanceof GMovieClip)
                    || (this instanceof GTextField) && !(this instanceof GTextInput) && !(this instanceof GRichTextField))
                    //Touch is not supported by GImage/GMovieClip/GTextField
                    return;

                if (this._displayObject != null)
                    this._displayObject.mouseEnabled = this._touchable;
            }
        }

        public get grayed(): boolean {
            return this._grayed;
        }

        public set grayed(value: boolean) {
            if (this._grayed != value) {
                this._grayed = value;
                this.handleGrayedChanged();
                this.updateGear(3);
            }
        }

        public get enabled(): boolean {
            return !this._grayed && this._touchable;
        }

        public set enabled(value: boolean) {
            this.grayed = !value;
            this.touchable = value;
        }

        public get rotation(): number {
            return this._rotation;
        }

        public set rotation(value: number) {
            if (this._rotation != value) {
                this._rotation = value;
                if (this._displayObject != null) {
                    this._displayObject.rotation = this.normalizeRotation;
                    this.applyPivot();
                }
                this.updateGear(3);
            }
        }

        public get normalizeRotation(): number {
            var rot: number = this._rotation % 360;
            if (rot > 180)
                rot = rot - 360;
            else if (rot < -180)
                rot = 360 + rot;
            return rot;
        }

        public get alpha(): number {
            return this._alpha;
        }

        public set alpha(value: number) {
            if (this._alpha != value) {
                this._alpha = value;
                this.handleAlphaChanged();
                this.updateGear(3);
            }
        }

        public get visible(): boolean {
            return this._visible;
        }

        public set visible(value: boolean) {
            if (this._visible != value) {
                this._visible = value;
                this.handleVisibleChanged();
                if (this._parent)
                    this._parent.setBoundsChangedFlag();
                if (this._group && this._group.excludeInvisibles)
                    this._group.setBoundsChangedFlag();
            }
        }

        public get internalVisible(): boolean {
            return this._internalVisible && (!this._group || this._group.internalVisible)
                && !(<any>this._displayObject)._cacheStyle.maskParent;
        }

        public get internalVisible2(): boolean {
            return this._visible && (!this._group || this._group.internalVisible2);
        }

        public get internalVisible3(): boolean {
            return this._internalVisible && this._visible;
        }

        public get sortingOrder(): number {
            return this._sortingOrder;
        }

        public set sortingOrder(value: number) {
            if (value < 0)
                value = 0;
            if (this._sortingOrder != value) {
                var old: number = this._sortingOrder;
                this._sortingOrder = value;
                if (this._parent != null)
                    this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
            }
        }

        public get focusable(): boolean {
            return this._focusable;
        }

        public set focusable(value: boolean) {
            this._focusable = value;
        }

        public get focused(): boolean {
            return this.root.focus == this;
        }

        public requestFocus(): void {
            var p: GObject = this;
            while (p && !p._focusable)
                p = p.parent;
            if (p != null)
                this.root.focus = p;
        }

        public get tooltips(): string {
            return this._tooltips;
        }

        public set tooltips(value: string) {
            if (this._tooltips) {
                this.off(Laya.Event.ROLL_OVER, this, this.__rollOver);
                this.off(Laya.Event.ROLL_OUT, this, this.__rollOut);
            }

            this._tooltips = value;
            if (this._tooltips) {
                this.on(Laya.Event.ROLL_OVER, this, this.__rollOver);
                this.on(Laya.Event.ROLL_OUT, this, this.__rollOut);
            }
        }

        private __rollOver(evt: Laya.Event): void {
            Laya.timer.once(100, this, this.__doShowTooltips);
        }

        private __doShowTooltips(): void {
            var r: GRoot = this.root;
            if (r)
                this.root.showTooltips(this._tooltips);
        }

        private __rollOut(evt: Laya.Event): void {
            Laya.timer.clear(this, this.__doShowTooltips);
            this.root.hideTooltips();
        }

        public get blendMode(): string {
            return this._displayObject.blendMode;
        }

        public set blendMode(value: string) {
            this._displayObject.blendMode = value;
        }

        public get filters(): any[] {
            return this._displayObject.filters;
        }

        public set filters(value: any[]) {
            this._displayObject.filters = value;
        }

        public get inContainer(): boolean {
            return this._displayObject != null && this._displayObject.parent != null;
        }

        public get onStage(): boolean {
            return this._displayObject != null && this._displayObject.stage != null;
        }

        public get resourceURL(): string {
            if (this.packageItem != null)
                return "ui://" + this.packageItem.owner.id + this.packageItem.id;
            else
                return null;
        }

        public set group(value: GGroup) {
            if (this._group != value) {
                if (this._group != null)
                    this._group.setBoundsChangedFlag();
                this._group = value;
                if (this._group != null)
                    this._group.setBoundsChangedFlag();
            }
        }

        public get group(): GGroup {
            return this._group;
        }

        public getGear(index: number): GearBase {
            var gear: GearBase = this._gears[index];
            if (gear == null)
                this._gears[index] = gear = GearBase.create(this, index);
            return gear;
        }

        protected updateGear(index: number): void {
            if (this._underConstruct || this._gearLocked)
                return;

            var gear: GearBase = this._gears[index];
            if (gear != null && gear.controller != null)
                gear.updateState();
        }

        public checkGearController(index: number, c: Controller): boolean {
            return this._gears[index] != null && this._gears[index].controller == c;
        }

        public updateGearFromRelations(index: number, dx: number, dy: number): void {
            if (this._gears[index] != null)
                this._gears[index].updateFromRelations(dx, dy);
        }

        public addDisplayLock(): number {
            var gearDisplay: GearDisplay = <GearDisplay>(this._gears[0]);
            if (gearDisplay && gearDisplay.controller) {
                var ret: number = gearDisplay.addLock();
                this.checkGearDisplay();

                return ret;
            }
            else
                return 0;
        }

        public releaseDisplayLock(token: number): void {
            var gearDisplay: GearDisplay = <GearDisplay>(this._gears[0]);
            if (gearDisplay && gearDisplay.controller) {
                gearDisplay.releaseLock(token);
                this.checkGearDisplay();
            }
        }

        private checkGearDisplay(): void {
            if (this._handlingController)
                return;

            var connected: boolean = this._gears[0] == null || (<GearDisplay>(this._gears[0])).connected;
            if (this._gears[8])
                connected = (<GearDisplay2>this._gears[8]).evaluate(connected);

            if (connected != this._internalVisible) {
                this._internalVisible = connected;
                if (this._parent) {
                    this._parent.childStateChanged(this);
                    if (this._group && this._group.excludeInvisibles)
                        this._group.setBoundsChangedFlag();
                }
            }
        }

        public get relations(): Relations {
            return this._relations;
        }

        public addRelation(target: GObject, relationType: number, usePercent: boolean = false): void {
            this._relations.add(target, relationType, usePercent);
        }

        public removeRelation(target: GObject, relationType: number = 0): void {
            this._relations.remove(target, relationType);
        }

        public get displayObject(): Laya.Sprite {
            return this._displayObject;
        }

        public get parent(): GComponent {
            return this._parent;
        }

        public set parent(val: GComponent) {
            this._parent = val;
        }

        public removeFromParent(): void {
            if (this._parent)
                this._parent.removeChild(this);
        }

        public get root(): GRoot {
            if (this instanceof GRoot)
                return <GRoot>(this);

            var p: GObject = this._parent;
            while (p) {
                if (p instanceof GRoot)
                    return <GRoot>(p);
                p = p.parent;
            }
            return GRoot.inst;
        }

        public get asCom(): GComponent {
            return <GComponent><any>this;
        }

        public get asButton(): GButton {
            return <GButton><any>this;
        }

        public get asLabel(): GLabel {
            return <GLabel><any>this;
        }

        public get asProgress(): GProgressBar {
            return <GProgressBar><any>this;
        }

        public get asTextField(): GTextField {
            return <GTextField><any>this;
        }

        public get asRichTextField(): GRichTextField {
            return <GRichTextField><any>this;
        }

        public get asTextInput(): GTextInput {
            return <GTextInput><any>this;
        }

        public get asLoader(): GLoader {
            return <GLoader><any>this;
        }

        public get asList(): GList {
            return <GList><any>this;
        }

        public get asTree(): GTree {
            return <GTree><any>this;
        }

        public get asGraph(): GGraph {
            return <GGraph><any>this;
        }

        public get asGroup(): GGroup {
            return <GGroup><any>this;
        }

        public get asSlider(): GSlider {
            return <GSlider><any>this;
        }

        public get asComboBox(): GComboBox {
            return <GComboBox><any>this;
        }

        public get asImage(): GImage {
            return <GImage><any>this;
        }

        public get asMovieClip(): GMovieClip {
            return <GMovieClip><any>this;
        }

        public get text(): string {
            return null;
        }

        public set text(value: string) {
        }

        public get icon(): string {
            return null;
        }

        public set icon(value: string) {
        }

        public get treeNode(): GTreeNode {
            return this._treeNode;
        }

        public get isDisposed(): boolean {
            return this._displayObject == null;
        }

        public dispose(): void {
            this.removeFromParent();
            this._relations.dispose();
            this._displayObject.destroy();
            this._displayObject = null;
            for (var i: number = 0; i < 10; i++) {
                var gear: GearBase = this._gears[i];
                if (gear != null)
                    gear.dispose();
            }
        }

        public onClick(thisObj: any, listener: Function, args: any[] = null): void {
            this.on(Laya.Event.CLICK, thisObj, listener, args);
        }

        public offClick(thisObj: any, listener: Function): void {
            this.off(Laya.Event.CLICK, thisObj, listener);
        }

        public hasClickListener(): boolean {
            return this._displayObject.hasListener(Laya.Event.CLICK);
        }

        public on(type: string, thisObject: any, listener: Function, args: any[] = null): void {
            this._displayObject.on(type, thisObject, listener, args);
        }

        public off(type: string, thisObject: any, listener: Function): void {
            this._displayObject.off(type, thisObject, listener);
        }

        public get draggable(): boolean {
            return this._draggable;
        }

        public set draggable(value: boolean) {
            if (this._draggable != value) {
                this._draggable = value;
                this.initDrag();
            }
        }

        public get dragBounds(): Laya.Rectangle {
            return this._dragBounds;
        }

        public set dragBounds(value: Laya.Rectangle) {
            this._dragBounds = value;
        }

        public startDrag(touchPointID: number = -1): void {
            if (this._displayObject.stage == null)
                return;

            this.dragBegin();
        }

        public stopDrag(): void {
            this.dragEnd();
        }

        public get dragging(): boolean {
            return GObject.draggingObject == this;
        }

        public localToGlobal(ax: number = 0, ay: number = 0, resultPoint: Laya.Point = null): Laya.Point {
            if (this._pivotAsAnchor) {
                ax += this._pivotX * this._width;
                ay += this._pivotY * this._height;
            }

            if (!resultPoint) {
                resultPoint = GObject.sHelperPoint;
                resultPoint.x = ax;
                resultPoint.y = ay;
                return this._displayObject.localToGlobal(resultPoint, true);
            }
            else {
                resultPoint.x = ax;
                resultPoint.y = ay;
                return this._displayObject.localToGlobal(resultPoint, false);
            }
        }

        public globalToLocal(ax: number = 0, ay: number = 0, resultPoint: Laya.Point = null): Laya.Point {
            if (!resultPoint) {
                resultPoint = GObject.sHelperPoint;
                resultPoint.x = ax;
                resultPoint.y = ay;
                resultPoint = this._displayObject.globalToLocal(resultPoint, true);
            }
            else {
                resultPoint.x = ax;
                resultPoint.y = ay;
                this._displayObject.globalToLocal(resultPoint, false);
            }

            if (this._pivotAsAnchor) {
                resultPoint.x -= this._pivotX * this._width;
                resultPoint.y -= this._pivotY * this._height;
            }

            return resultPoint;
        }

        public localToGlobalRect(ax: number = 0, ay: number = 0,
            aWidth: number = 0, aHeight: number = 0,
            resultRect: Laya.Rectangle = null): Laya.Rectangle {
            if (resultRect == null)
                resultRect = new Laya.Rectangle();
            var pt: Laya.Point = this.localToGlobal(ax, ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.localToGlobal(ax + aWidth, ay + aHeight);
            resultRect.width = pt.x - resultRect.x;
            resultRect.height = pt.y - resultRect.y;
            return resultRect;
        }

        public globalToLocalRect(ax: number = 0, ay: number = 0,
            aWidth: number = 0, aHeight: number = 0,
            resultRect: Laya.Rectangle = null): Laya.Rectangle {
            if (resultRect == null)
                resultRect = new Laya.Rectangle();
            var pt: Laya.Point = this.globalToLocal(ax, ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.globalToLocal(ax + aWidth, ay + aHeight);
            resultRect.width = pt.x - resultRect.x;
            resultRect.height = pt.y - resultRect.y;
            return resultRect;
        }

        public handleControllerChanged(c: Controller): void {
            this._handlingController = true;
            for (var i: number = 0; i < 10; i++) {
                var gear: GearBase = this._gears[i];
                if (gear != null && gear.controller == c)
                    gear.apply();
            }
            this._handlingController = false;

            this.checkGearDisplay();
        }

        protected createDisplayObject(): void {
            this._displayObject = new Laya.Sprite();
            this._displayObject["$owner"] = this;
        }

        protected handleXYChanged(): void {
            var xv: number = this._x;
            var yv: number = this._y + this._yOffset;
            if (this._pivotAsAnchor) {
                xv -= this._pivotX * this._width;
                yv -= this._pivotY * this._height;
            }
            if (this._pixelSnapping) {
                xv = Math.round(xv);
                yv = Math.round(yv);
            }

            this._displayObject.pos(xv + this._pivotOffsetX, yv + this._pivotOffsetY);
        }

        protected handleSizeChanged(): void {
            this._displayObject.size(this._width, this._height);
        }

        protected handleScaleChanged(): void {
            this._displayObject.scale(this._scaleX, this._scaleY, true);
        }

        protected handleGrayedChanged(): void {
            ToolSet.setColorFilter(this._displayObject, this._grayed);
        }

        protected handleAlphaChanged(): void {
            this._displayObject.alpha = this._alpha;
        }

        public handleVisibleChanged(): void {
            this._displayObject.visible = this.internalVisible2;
        }

        public getProp(index: number): any {
            switch (index) {
                case ObjectPropID.Text:
                    return this.text;
                case ObjectPropID.Icon:
                    return this.icon;
                case ObjectPropID.Color:
                    return null;
                case ObjectPropID.OutlineColor:
                    return null;
                case ObjectPropID.Playing:
                    return false;
                case ObjectPropID.Frame:
                    return 0;
                case ObjectPropID.DeltaTime:
                    return 0;
                case ObjectPropID.TimeScale:
                    return 1;
                case ObjectPropID.FontSize:
                    return 0;
                case ObjectPropID.Selected:
                    return false;
                default:
                    return undefined;
            }
        }

        public setProp(index: number, value: any): void {
            switch (index) {
                case ObjectPropID.Text:
                    this.text = value;
                    break;

                case ObjectPropID.Icon:
                    this.icon = value;
                    break;
            }
        }

        public constructFromResource(): void {

        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            buffer.seek(beginPos, 0);
            buffer.skip(5);

            var f1: number;
            var f2: number;

            this._id = buffer.readS();
            this._name = buffer.readS();
            f1 = buffer.getInt32();
            f2 = buffer.getInt32();
            this.setXY(f1, f2);

            if (buffer.readBool()) {
                this.initWidth = buffer.getInt32();
                this.initHeight = buffer.getInt32();
                this.setSize(this.initWidth, this.initHeight, true);
            }

            if (buffer.readBool()) {
                this.minWidth = buffer.getInt32();
                this.maxWidth = buffer.getInt32();
                this.minHeight = buffer.getInt32();
                this.maxHeight = buffer.getInt32();
            }

            if (buffer.readBool()) {
                f1 = buffer.getFloat32();
                f2 = buffer.getFloat32();
                this.setScale(f1, f2);
            }

            if (buffer.readBool()) {
                f1 = buffer.getFloat32();
                f2 = buffer.getFloat32();
                this.setSkew(f1, f2);
            }

            if (buffer.readBool()) {
                f1 = buffer.getFloat32();
                f2 = buffer.getFloat32();
                this.setPivot(f1, f2, buffer.readBool());
            }

            f1 = buffer.getFloat32();
            if (f1 != 1)
                this.alpha = f1;

            f1 = buffer.getFloat32();
            if (f1 != 0)
                this.rotation = f1;

            if (!buffer.readBool())
                this.visible = false;
            if (!buffer.readBool())
                this.touchable = false;
            if (buffer.readBool())
                this.grayed = true;
            var bm: number = buffer.readByte();
            if (BlendMode[bm])
                this.blendMode = BlendMode[bm];

            var filter: number = buffer.readByte();
            if (filter == 1) {
                ToolSet.setColorFilter(this._displayObject,
                    [buffer.getFloat32(), buffer.getFloat32(), buffer.getFloat32(), buffer.getFloat32()]);
            }

            var str: string = buffer.readS();
            if (str != null)
                this.data = str;
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            buffer.seek(beginPos, 1);

            var str: string = buffer.readS();
            if (str != null)
                this.tooltips = str;

            var groupId: number = buffer.getInt16();
            if (groupId >= 0)
                this.group = <GGroup>this.parent.getChildAt(groupId);

            buffer.seek(beginPos, 2);

            var cnt: number = buffer.getInt16();
            for (var i: number = 0; i < cnt; i++) {
                var nextPos: number = buffer.getInt16();
                nextPos += buffer.pos;

                var gear: GearBase = this.getGear(buffer.readByte());
                gear.setup(buffer);

                buffer.pos = nextPos;
            }
        }

        //drag support
        //-------------------------------------------------------------------
        private static sGlobalDragStart: Laya.Point = new Laya.Point();
        private static sGlobalRect: Laya.Rectangle = new Laya.Rectangle();
        private static sHelperPoint: Laya.Point = new Laya.Point();
        private static sDragHelperRect: Laya.Rectangle = new Laya.Rectangle();
        private static sDraggingQuery: boolean;
        private static sUpdateInDragging: boolean;

        private _touchDownPoint: Laya.Point;

        private initDrag(): void {
            if (this._draggable)
                this.on(Laya.Event.MOUSE_DOWN, this, this.__begin);
            else
                this.off(Laya.Event.MOUSE_DOWN, this, this.__begin);
        }

        private dragBegin(): void {
            if (GObject.draggingObject != null)
                GObject.draggingObject.stopDrag();

            GObject.sGlobalDragStart.x = Laya.stage.mouseX;
            GObject.sGlobalDragStart.y = Laya.stage.mouseY;

            this.localToGlobalRect(0, 0, this.width, this.height, GObject.sGlobalRect);
            GObject.draggingObject = this;

            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.__moving2);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.__end2);
        }

        private dragEnd(): void {
            if (GObject.draggingObject == this) {
                Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.__moving2);
                Laya.stage.off(Laya.Event.MOUSE_UP, this, this.__end2);
                GObject.draggingObject = null;
            }
            GObject.sDraggingQuery = false;
        }

        private reset(): void {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.__moving);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.__end);
        }

        private __begin(): void {
            if (this._touchDownPoint == null)
                this._touchDownPoint = new Laya.Point();
            this._touchDownPoint.x = Laya.stage.mouseX;
            this._touchDownPoint.y = Laya.stage.mouseY;

            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.__moving);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.__end);
        }

        private __end(): void {
            this.reset();
        }

        private __moving(evt: Laya.Event): void {
            var sensitivity: number = UIConfig.touchDragSensitivity;
            if (this._touchDownPoint != null
                && Math.abs(this._touchDownPoint.x - Laya.stage.mouseX) < sensitivity
                && Math.abs(this._touchDownPoint.y - Laya.stage.mouseY) < sensitivity)
                return;

            this.reset();
            GObject.sDraggingQuery = true;
            Events.dispatch(Events.DRAG_START, this._displayObject, evt);

            if (GObject.sDraggingQuery)
                this.dragBegin();
        }

        private __moving2(evt: Laya.Event): void {
            var xx: number = Laya.stage.mouseX - GObject.sGlobalDragStart.x + GObject.sGlobalRect.x;
            var yy: number = Laya.stage.mouseY - GObject.sGlobalDragStart.y + GObject.sGlobalRect.y;

            if (this._dragBounds != null) {
                var rect: Laya.Rectangle = GRoot.inst.localToGlobalRect(this._dragBounds.x, this._dragBounds.y,
                    this._dragBounds.width, this._dragBounds.height, GObject.sDragHelperRect);
                if (xx < rect.x)
                    xx = rect.x;
                else if (xx + GObject.sGlobalRect.width > rect.right) {
                    xx = rect.right - GObject.sGlobalRect.width;
                    if (xx < rect.x)
                        xx = rect.x;
                }

                if (yy < rect.y)
                    yy = rect.y;
                else if (yy + GObject.sGlobalRect.height > rect.bottom) {
                    yy = rect.bottom - GObject.sGlobalRect.height;
                    if (yy < rect.y)
                        yy = rect.y;
                }
            }

            GObject.sUpdateInDragging = true;
            var pt: Laya.Point = this.parent.globalToLocal(xx, yy, GObject.sHelperPoint);
            this.setXY(Math.round(pt.x), Math.round(pt.y));
            GObject.sUpdateInDragging = false;

            Events.dispatch(Events.DRAG_MOVE, this._displayObject, evt);
        }

        private __end2(evt: Laya.Event): void {
            if (GObject.draggingObject == this) {
                this.stopDrag();
                Events.dispatch(Events.DRAG_END, this._displayObject, evt);
            }
        }
        //-------------------------------------------------------------------

        public static cast(sprite: Laya.Sprite): GObject {
            return <GObject>(sprite["$owner"]);
        }
    }
}