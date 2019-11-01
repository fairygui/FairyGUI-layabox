namespace fgui {
    export class GMovieClip extends GObject {
        private _movieClip: MovieClip;

        constructor() {
            super();
        }

        public get color(): string {
            return this._movieClip.color;
        }

        public set color(value: string) {
            this._movieClip.color = value;
        }

        protected createDisplayObject(): void {
            this._displayObject = this._movieClip = new MovieClip();
            this._movieClip.mouseEnabled = false;
            this._displayObject["$owner"] = this;
        }

        public get playing(): boolean {
            return this._movieClip.playing;
        }

        public set playing(value: boolean) {
            if (this._movieClip.playing != value) {
                this._movieClip.playing = value;
                this.updateGear(5);
            }
        }

        public get frame(): number {
            return this._movieClip.frame;
        }

        public set frame(value: number) {
            if (this._movieClip.frame != value) {
                this._movieClip.frame = value;
                this.updateGear(5);
            }
        }

        public get timeScale(): number {
            return this._movieClip.timeScale;
        }

        public set timeScale(value: number) {
            this._movieClip.timeScale = value;
        }

        public rewind(): void {
            this._movieClip.rewind();
        }

        public syncStatus(anotherMc: GMovieClip): void {
            this._movieClip.syncStatus(anotherMc._movieClip);
        }

        public advance(timeInMiniseconds: number): void {
            this._movieClip.advance(timeInMiniseconds);
        }

        //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        public setPlaySettings(start: number = 0, end: number = -1,
            times: number = 0, endAt: number = -1,
            endHandler: Laya.Handler = null): void {
            this._movieClip.setPlaySettings(start, end, times, endAt, endHandler);
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
                    return this.timeScale;
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
                    this.timeScale = value;
                    break;
                case ObjectPropID.DeltaTime:
                    this.advance(value);
                    break;
                default:
                    super.setProp(index, value);
                    break;
            }
        }

        public constructFromResource(): void {
            var displayItem: PackageItem = this.packageItem.getBranch();

            this.sourceWidth = displayItem.width;
            this.sourceHeight = displayItem.height;
            this.initWidth = this.sourceWidth;
            this.initHeight = this.sourceHeight;

            this.setSize(this.sourceWidth, this.sourceHeight);

            displayItem = displayItem.getHighResolution();
            displayItem.load();

            this._movieClip.interval = displayItem.interval;
            this._movieClip.swing = displayItem.swing;
            this._movieClip.repeatDelay = displayItem.repeatDelay;
            this._movieClip.frames = displayItem.frames;
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            if (buffer.readBool())
                this.color = buffer.readColorS();
            buffer.readByte(); //flip
            this._movieClip.frame = buffer.getInt32();
            this._movieClip.playing = buffer.readBool();
        }
    }
}