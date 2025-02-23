///<reference path="GObjectPool.ts"/>

namespace fgui {
    export class GLoader extends GObject {
        private _url: string;
        private _align: string;
        private _valign: string;
        private _autoSize: boolean;
        private _fill: number;
        private _shrinkOnly: boolean;
        private _useResize: boolean;
        private _showErrorSign: boolean;
        private _contentItem: PackageItem;
        private _content: MovieClip;
        private _errorSign?: GObject;
        private _content2?: GComponent;

        private _updatingLayout: boolean;

        private static _errorSignPool: GObjectPool = new GObjectPool();

        constructor() {
            super();
            this._url = "";
            this._fill = LoaderFillType.None;
            this._align = "left";
            this._valign = "top";
            this._showErrorSign = true;
        }

        protected createDisplayObject(): void {
            super.createDisplayObject();

            this._content = new MovieClip();
            this._content.name = "<Image>";
            this._displayObject.addChild(this._content);
            this._displayObject.mouseEnabled = true;
        }

        public dispose(): void {
            if (!this._contentItem && this._content.texture) {
                this.freeExternal(this._content.texture);
            }

            if (this._content2)
                this._content2.dispose();

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

        public get align(): string {
            return this._align;
        }

        public set align(value: string) {
            if (this._align != value) {
                this._align = value;
                this.updateLayout();
            }
        }

        public get verticalAlign(): string {
            return this._valign;
        }

        public set verticalAlign(value: string) {
            if (this._valign != value) {
                this._valign = value;
                this.updateLayout();
            }
        }

        public get fill(): number {
            return this._fill;
        }

        public set fill(value: number) {
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

        public get useResize(): boolean {
            return this._useResize;
        }

        public set useResize(value: boolean) {
            if (this._useResize != value) {
                this._useResize = value;
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
            return this._content.playing;
        }

        public set playing(value: boolean) {
            if (this._content.playing != value) {
                this._content.playing = value;
                this.updateGear(5);
            }
        }

        public get frame(): number {
            return this._content.frame;
        }

        public set frame(value: number) {
            if (this._content.frame != value) {
                this._content.frame = value;
                this.updateGear(5);
            }
        }

        public get color(): string {
            return this._content.color;
        }

        public set color(value: string) {
            if (this._content.color != value) {
                this._content.color = value;
                this.updateGear(4);
            }
        }

        public get fillMethod(): number {
            return this._content.fillMethod;
        }

        public set fillMethod(value: number) {
            this._content.fillMethod = value;
        }

        public get fillOrigin(): number {
            return this._content.fillOrigin;
        }

        public set fillOrigin(value: number) {
            this._content.fillOrigin = value;
        }

        public get fillClockwise(): boolean {
            return this._content.fillClockwise;
        }

        public set fillClockwise(value: boolean) {
            this._content.fillClockwise = value;
        }

        public get fillAmount(): number {
            return this._content.fillAmount;
        }

        public set fillAmount(value: number) {
            this._content.fillAmount = value;
        }

        public get showErrorSign(): boolean {
            return this._showErrorSign;
        }

        public set showErrorSign(value: boolean) {
            this._showErrorSign = value;
        }

        public get content(): MovieClip {
            return this._content;
        }

        public get component(): GComponent {
            return this._content2;
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

        protected loadFromPackage(itemURL: string): void {
            this._contentItem = UIPackage.getItemByURL(itemURL);
            if (this._contentItem) {
                this._contentItem = this._contentItem.getBranch();
                this.sourceWidth = this._contentItem.width;
                this.sourceHeight = this._contentItem.height;
                this._contentItem = this._contentItem.getHighResolution();
                this._contentItem.load();

                if (this._autoSize)
                    this.setSize(this.sourceWidth, this.sourceHeight);

                if (this._contentItem.type == PackageItemType.Image) {
                    if (!this._contentItem.texture) {
                        this.setErrorState();
                    }
                    else {
                        this._content.texture = this._contentItem.texture;
                        this._content.scale9Grid = this._contentItem.scale9Grid;
                        this._content.scaleByTile = this._contentItem.scaleByTile;
                        this._content.tileGridIndice = this._contentItem.tileGridIndice;
                        this.sourceWidth = this._contentItem.width;
                        this.sourceHeight = this._contentItem.height;
                        this.updateLayout();
                    }
                }
                else if (this._contentItem.type == PackageItemType.MovieClip) {
                    this.sourceWidth = this._contentItem.width;
                    this.sourceHeight = this._contentItem.height;
                    this._content.interval = this._contentItem.interval;
                    this._content.swing = this._contentItem.swing;
                    this._content.repeatDelay = this._contentItem.repeatDelay;
                    this._content.frames = this._contentItem.frames;
                    this.updateLayout();
                }
                else if (this._contentItem.type == PackageItemType.Component) {
                    var obj: GObject = UIPackage.createObjectFromURL(itemURL);
                    if (!obj)
                        this.setErrorState();
                    else if (!(obj instanceof GComponent)) {
                        obj.dispose();
                        this.setErrorState();
                    }
                    else {
                        this._content2 = obj.asCom;
                        this._content2.name = obj.name || this._contentItem.name || "<Content>";
                        this._displayObject.addChild(this._content2.displayObject);
                        this.updateLayout();
                    }
                }
                else
                    this.setErrorState();
            }
            else
                this.setErrorState();
        }

        protected loadExternal(): void {
            AssetProxy.inst.load(this._url, Laya.Loader.IMAGE).then((tex: Laya.Texture) => {
                this.__getResCompleted(tex);
            });
        }

        protected freeExternal(texture: Laya.Texture): void {
        }

        protected onExternalLoadSuccess(texture: Laya.Texture): void {
            this._content.texture = texture;
            this._content.scale9Grid = null;
            this._content.scaleByTile = false;
            this.sourceWidth = texture.width;
            this.sourceHeight = texture.height;
            this.updateLayout();
        }

        protected onExternalLoadFailed(): void {
            this.setErrorState();
        }

        private __getResCompleted(tex: Laya.Texture): void {
            if (tex != null)
                this.onExternalLoadSuccess(tex);
            else
                this.onExternalLoadFailed();
        }

        private setErrorState(): void {
            if (!this._showErrorSign)
                return;

            if (!this._errorSign) {
                if (UIConfig.loaderErrorSign != null) {
                    this._errorSign = GLoader._errorSignPool.getObject(UIConfig.loaderErrorSign);
                }
            }

            if (this._errorSign) {
                this._errorSign.name = this._errorSign.name || "<ErrorSign>";
                this._errorSign.setSize(this.width, this.height);
                this._displayObject.addChild(this._errorSign.displayObject);
            }
        }

        private clearErrorState(): void {
            if (this._errorSign) {
                this._displayObject.removeChild(this._errorSign.displayObject);
                GLoader._errorSignPool.returnObject(this._errorSign);
                this._errorSign = null;
            }
        }

        updateLayout(): void {
            if (!this._content2 && !this._content.texture && !this._content.frames) {
                if (this._autoSize) {
                    this._updatingLayout = true;
                    this.setSize(50, 30);
                    this._updatingLayout = false;
                }
                return;
            }

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
                    if (this._content2) {
                        this._content2.setXY(0, 0);
                        if (this._useResize)
                            this._content2.setSize(cw, ch);
                        else
                            this._content2.setScale(1, 1);
                    }
                    else {
                        this._content.size(cw, ch);
                        this._content.pos(0, 0);
                    }
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

            if (this._content2) {
                if (this._useResize)
                    this._content2.setSize(cw, ch);
                else
                    this._content2.setScale(sx, sy);
            } else {
                this._content.size(cw, ch);
            }

            var nx: number, ny: number;
            if (this._align == "center")
                nx = Math.floor((this.width - cw) / 2);
            else if (this._align == "right")
                nx = this.width - cw;
            else
                nx = 0;
            if (this._valign == "middle")
                ny = Math.floor((this.height - ch) / 2);
            else if (this._valign == "bottom")
                ny = this.height - ch;
            else
                ny = 0;

            if (this._content2)
                this._content2.setXY(nx, ny);
            else
                this._content.pos(nx, ny);
        }

        private clearContent(): void {
            this.clearErrorState();

            if (!this._contentItem && this._content.texture) {
                this.freeExternal(this._content.texture);
            }
            this._content.texture = null;
            this._content.frames = null;

            if (this._content2) {
                this._content2.dispose();
                this._content2 = null;
            }

            this._contentItem = null;
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (!this._updatingLayout)
                this.updateLayout();
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
                    return this._content.timeScale;
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
                    this._content.timeScale = value;
                    break;
                case ObjectPropID.DeltaTime:
                    this._content.advance(value);
                    break;
                default:
                    super.setProp(index, value);
                    break;
            }
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            var iv: number;

            this._url = buffer.readS();
            iv = buffer.readByte();
            this._align = iv == 0 ? "left" : (iv == 1 ? "center" : "right");
            iv = buffer.readByte();
            this._valign = iv == 0 ? "top" : (iv == 1 ? "middle" : "bottom");
            this._fill = buffer.readByte();
            this._shrinkOnly = buffer.readBool();
            this._autoSize = buffer.readBool();
            this._showErrorSign = buffer.readBool();
            this._content.playing = buffer.readBool();
            this._content.frame = buffer.getInt32();

            if (buffer.readBool())
                this.color = buffer.readColorS();

            this._content.fillMethod = buffer.readByte();
            if (this._content.fillMethod != 0) {
                this._content.fillOrigin = buffer.readByte();
                this._content.fillClockwise = buffer.readBool();
                this._content.fillAmount = buffer.getFloat32();
            }

            if (buffer.version >= 7)
                this._useResize = buffer.readBool();

            if (this._url)
                this.loadContent();
        }
    }
}
