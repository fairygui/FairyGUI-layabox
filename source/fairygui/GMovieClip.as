package fairygui {
	import fairygui.display.MovieClip;
	
	import laya.maths.Rectangle;
	import laya.utils.Handler;

    public class GMovieClip extends GObject implements IAnimationGear, IColorGear {
        public var movieClip: MovieClip;
        
        private var _gearAnimation: GearAnimation;
        private var _gearColor:GearColor;

        public function GMovieClip() {
            super();
			this._sizeImplType = 1;
            this._gearAnimation = new GearAnimation(this);
            this._gearColor = new GearColor(this);
        }
        
        public function get color(): String {
            return "#FFFFFF";
        }
        
        public function set color(value: String):void {
        }

		override protected function createDisplayObject(): void {
            this._displayObject = this.movieClip = new MovieClip();
            this._displayObject["$owner"] = this;
        }

        public function get playing(): Boolean {
            return this.movieClip.playing;
        }

        public function set playing(value: Boolean):void {
            if (this.movieClip.playing != value) {
                this.movieClip.playing = value;
                if (this._gearAnimation.controller)
                    this._gearAnimation.updateState();
            }
        }

        public function get frame(): Number {
            return this.movieClip.currentFrame;
        }

        public function set frame(value: Number):void {
            if (this.movieClip.currentFrame != value) {
                this.movieClip.currentFrame = value;
                if (this._gearAnimation.controller)
                    this._gearAnimation.updateState();
            }
        }
        
        //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
        public function setPlaySettings(start: Number = 0,end: Number = -1,
            times: Number = 0,endAt: Number = -1,
            endHandler: Handler = null): void {
            this.movieClip.setPlaySettings(start, end, times, endAt, endHandler);
        }

        public function get gearAnimation(): GearAnimation {
            return this._gearAnimation;
        }
        
        public function get gearColor(): GearColor {
            return this._gearColor;
        }

		override public function handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);
            if(this._gearAnimation.controller == c)
                this._gearAnimation.apply();
            if(this._gearColor.controller == c)
                this._gearColor.apply();
        }

		override public function constructFromResource(pkgItem: PackageItem): void {
            this._packageItem = pkgItem;

            this._sourceWidth = this._packageItem.width;
            this._sourceHeight = this._packageItem.height;
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;

            this.setSize(this._sourceWidth, this._sourceHeight);

            pkgItem.load();

            this.movieClip.interval = this._packageItem.interval;
            this.movieClip.frames = this._packageItem.frames;
            this.movieClip.boundsRect = new Rectangle(0, 0, this.sourceWidth, this.sourceHeight);
        }

		override public function setup_beforeAdd(xml: Object): void {
            super.setup_beforeAdd(xml);

            var str: String;
            str = xml.getAttribute("frame");
            if (str)
                this.movieClip.currentFrame = parseInt(str);
            str = xml.getAttribute("playing");
            this.movieClip.playing = str != "false";
            
            str = xml.getAttribute("color");
            if(str)
                this.color = str;
        }

		override public function setup_afterAdd(xml: Object): void {
            super.setup_afterAdd(xml);

            var col: Array = xml.childNodes;
            var length1: Number = col.length;
            for (var i1: Number = 0; i1 < length1; i1++) {
                var cxml: Object = col[i1];
                if (cxml.nodeName == "gearAni") {
                    this._gearAnimation.setup(cxml);
                    break;
                }
                else if (cxml.nodeName == "gearColor") {
                    this._gearColor.setup(cxml);
                    break;
                }
            }
        }
    }
}