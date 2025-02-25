namespace fgui {
    export class GLoader3D extends GObject {
        private _url: string;
        private _align: AlignType;
        private _verticalAlign: VertAlignType;
        private _autoSize: boolean;
        private _fill: LoaderFillType;
        private _shrinkOnly: boolean;
        private _playing: boolean;
        private _frame: number = 0;
        private _loop: boolean;
        private _animationName: string;
        private _skinName: string;
        private _color: string;
        private _contentItem: PackageItem;
        private _container: Laya.Sprite;
        private _content: Laya.Skeleton | Laya.SpineSkeleton;
        private _updatingLayout: boolean;

        public constructor() {
            super();

            this._playing = true;
            this._url = "";
            this._fill = LoaderFillType.None;
            this._align = AlignType.Left;
            this._verticalAlign = VertAlignType.Top;
            this._color = "#FFFFFF";
        }

        protected createDisplayObject(): void {
            super.createDisplayObject();

            this._container = new Laya.Sprite();
            this._container.name = '<Container>';
            this._displayObject.addChild(this._container);
        }

        public dispose(): void {
            this.clearContent();
            super.dispose();
        }

        public get url(): string {
            return this._url;
        }

        public set url(value: string) {
            if (this._url == value)
                return;

            this._url = value;
            this.loadContent();
            this.updateGear(7);
        }

        public get icon(): string {
            return this._url;
        }

        public set icon(value: string) {
            this.url = value;
        }

        public get align(): AlignType {
            return this._align;
        }

        public set align(value: AlignType) {
            if (this._align != value) {
                this._align = value;
                this.updateLayout();
            }
        }

        public get verticalAlign(): VertAlignType {
            return this._verticalAlign;
        }

        public set verticalAlign(value: VertAlignType) {
            if (this._verticalAlign != value) {
                this._verticalAlign = value;
                this.updateLayout();
            }
        }

        public get fill(): LoaderFillType {
            return this._fill;
        }

        public set fill(value: LoaderFillType) {
            if (this._fill != value) {
                this._fill = value;
                this.updateLayout();
            }
        }

        public get shrinkOnly(): boolean {
            return this._shrinkOnly;
        }

        public set shrinkOnly(value: boolean) {
            if (this._shrinkOnly != value) {
                this._shrinkOnly = value;
                this.updateLayout();
            }
        }

        public get autoSize(): boolean {
            return this._autoSize;
        }

        public set autoSize(value: boolean) {
            if (this._autoSize != value) {
                this._autoSize = value;
                this.updateLayout();
            }
        }

        public get playing(): boolean {
            return this._playing;
        }

        public set playing(value: boolean) {
            if (this._playing != value) {
                this._playing = value;
                this.updateGear(5);

                this.onChange();
            }
        }

        public get frame(): number {
            return this._frame;
        }

        public set frame(value: number) {
            if (this._frame != value) {
                this._frame = value;
                this.updateGear(5);

                this.onChange();
            }
        }

        public get animationName(): string {
            return this._animationName;
        }

        public set animationName(value: string) {
            if (this._animationName != value) {
                this._animationName = value;
                this.onChange();
            }
        }

        public get skinName(): string {
            return this._skinName;
        }

        public set skinName(value: string) {
            if (this._skinName != value) {
                this._skinName = value;
                this.onChange();
            }
        }

        public get loop(): boolean {
            return this._loop;
        }

        public set loop(value: boolean) {
            if (this._loop != value) {
                this._loop = value;
                this.onChange();
            }
        }

        public get color(): string {
            return this._color;
        }

        public set color(value: string) {
            if (this._color != value) {
                this._color = value;
                this.updateGear(4);

                if (this._content)
                    ToolSet.setColorFilter(this._content, this._color);
            }
        }

        public get content(): Laya.Sprite {
            return this._content;
        }

        protected loadContent(): void {
            this.clearContent();

            if (!this._url)
                return;

            if (ToolSet.startsWith(this._url, "ui://"))
                this.loadFromPackage(this._url);
            else
                this.loadExternal();
        }

        protected loadFromPackage(itemURL: string) {
            this._contentItem = UIPackage.getItemByURL(itemURL);
            if (this._contentItem) {
                this._contentItem = this._contentItem.getBranch();
                this.sourceWidth = this._contentItem.width;
                this.sourceHeight = this._contentItem.height;
                this._contentItem = this._contentItem.getHighResolution();

                if (this._autoSize)
                    this.setSize(this.sourceWidth, this.sourceHeight);

                if (this._contentItem.type == PackageItemType.Spine || this._contentItem.type == PackageItemType.DragonBones)
                    this._contentItem.owner.getItemAssetAsync(this._contentItem, this.onLoaded.bind(this));
            }
        }

        private onLoaded(err: Error, item: PackageItem): void {
            if (this._contentItem != item)
                return;

            if (err)
                console.warn(err);

            let templet = this._contentItem.templet;
            if (!templet)
                return;

            if (Laya.Templet && templet instanceof Laya.Templet)
                this.setSkeleton(templet.buildArmature(1), this._contentItem.skeletonAnchor);
            else if (Laya.SpineSkeleton && templet instanceof Laya.SpineTemplet) {
                let obj = new Laya.SpineSkeleton();
                obj.templet = templet as Laya.SpineTemplet;
                this.setSkeleton(obj, this._contentItem.skeletonAnchor);
            }
        }

        public setSkeleton(skeleton: Laya.Skeleton | Laya.SpineSkeleton, anchor?: Laya.Point): void {

            this._content = skeleton;
            this._container.addChild(this._content);
            this._content.pos(anchor.x, anchor.y);
            ToolSet.setColorFilter(this._content, this._color);

            this.onChange();

            this.updateLayout();
        }

        private onChange(): void {
            if (!this._content)
                return;

            if (this._animationName) {
                if (this._playing)
                    this._content.play(this._animationName, this._loop);
                else
                    this._content.play(this._animationName, false, true, this._frame, this._frame);
            }
            else
                this._content.stop();

            if (this._skinName)
                this._content.showSkinByName(this._skinName);
            else
                this._content.showSkinByIndex(0);
        }

        protected loadExternal(): void {
        }

        private updateLayout(): void {
            let cw = this.sourceWidth;
            let ch = this.sourceHeight;

            if (this._autoSize) {
                this._updatingLayout = true;
                if (cw == 0)
                    cw = 50;
                if (ch == 0)
                    ch = 30;

                this.setSize(cw, ch);
                this._updatingLayout = false;

                if (cw == this._width && ch == this._height) {
                    this._container.scale(1, 1);
                    this._container.pos(0, 0);

                    return;
                }
            }

            var sx: number = 1, sy: number = 1;
            if (this._fill != LoaderFillType.None) {
                sx = this.width / this.sourceWidth;
                sy = this.height / this.sourceHeight;

                if (sx != 1 || sy != 1) {
                    if (this._fill == LoaderFillType.ScaleMatchHeight)
                        sx = sy;
                    else if (this._fill == LoaderFillType.ScaleMatchWidth)
                        sy = sx;
                    else if (this._fill == LoaderFillType.Scale) {
                        if (sx > sy)
                            sx = sy;
                        else
                            sy = sx;
                    }
                    else if (this._fill == LoaderFillType.ScaleNoBorder) {
                        if (sx > sy)
                            sy = sx;
                        else
                            sx = sy;
                    }
                    if (this._shrinkOnly) {
                        if (sx > 1)
                            sx = 1;
                        if (sy > 1)
                            sy = 1;
                    }
                    cw = this.sourceWidth * sx;
                    ch = this.sourceHeight * sy;
                }
            }

            this._container.scale(sx, sy);

            var nx: number, ny: number;
            if (this._align == AlignType.Center)
                nx = Math.floor((this.width - cw) / 2);
            else if (this._align == AlignType.Right)
                nx = this.width - cw;
            else
                nx = 0;
            if (this._verticalAlign == VertAlignType.Middle)
                ny = Math.floor((this.height - ch) / 2);
            else if (this._verticalAlign == VertAlignType.Bottom)
                ny = this.height - ch;
            else
                ny = 0;

            this._container.pos(nx, ny);
        }

        private clearContent(): void {
            if (this._content) {
                this._container.removeChild(this._content);
                this._content.destroy();
                this._content = null;
            }
            if (this._contentItem && !this._contentItem.loading) {
                AssetProxy.inst.clearItemRes(this._contentItem);
                this._contentItem = null;
            }
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (!this._updatingLayout)
                this.updateLayout();
        }

        protected handleGrayedChanged(): void {
        }

        public getProp(index: number): any {
            switch (index) {
                case ObjectPropID.Color:
                    return this.color;
                case ObjectPropID.Playing:
                    return this.playing;
                case ObjectPropID.Frame:
                    return this.frame;
                case ObjectPropID.TimeScale:
                    return 1;
                default:
                    return super.getProp(index);
            }
        }

        public setProp(index: number, value: any): void {
            switch (index) {
                case ObjectPropID.Color:
                    this.color = value;
                    break;
                case ObjectPropID.Playing:
                    this.playing = value;
                    break;
                case ObjectPropID.Frame:
                    this.frame = value;
                    break;
                case ObjectPropID.TimeScale:
                    break;
                case ObjectPropID.DeltaTime:
                    break;
                default:
                    super.setProp(index, value);
                    break;
            }
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            this._url = buffer.readS();
            this._align = buffer.readByte();
            this._verticalAlign = buffer.readByte();
            this._fill = buffer.readByte();
            this._shrinkOnly = buffer.readBool();
            this._autoSize = buffer.readBool();
            this._animationName = buffer.readS();
            this._skinName = buffer.readS();
            this._playing = buffer.readBool();
            this._frame = buffer.getInt32();
            this._loop = buffer.readBool();

            if (buffer.readBool())
                this.color = buffer.readColorS();

            if (this._url)
                this.loadContent();
        }
    }
}
