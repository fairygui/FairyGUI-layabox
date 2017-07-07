package fairygui {
	import fairygui.display.MovieClip;
	
	import laya.maths.Rectangle;
	import laya.utils.Handler;
	
	public class GMovieClip extends GObject implements IAnimationGear, IColorGear {
		public var movieClip: MovieClip;
		
		public function GMovieClip() {
			super();
			this._sizeImplType = 1;
		}
		
		public function get color(): String {
			return "#FFFFFF";
		}
		
		public function set color(value: String):void {
		}
		
		override protected function createDisplayObject(): void {
			this._displayObject = this.movieClip = new MovieClip();
			this.movieClip.mouseEnabled = false;
			this._displayObject["$owner"] = this;
		}
		
		public function get playing(): Boolean {
			return this.movieClip.playing;
		}
		
		public function set playing(value: Boolean):void {
			if (this.movieClip.playing != value) {
				this.movieClip.playing = value;
				this.updateGear(5);
			}
		}
		
		public function get frame(): Number {
			return this.movieClip.currentFrame;
		}
		
		public function set frame(value: Number):void {
			if (this.movieClip.currentFrame != value) {
				this.movieClip.currentFrame = value;
				this.updateGear(5);
			}
		}
		
		//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
		public function setPlaySettings(start: Number = 0,end: Number = -1,
										times: Number = 0,endAt: Number = -1,
										endHandler: Handler = null): void {
			this.movieClip.setPlaySettings(start, end, times, endAt, endHandler);
		}
		
		override public function constructFromResource(): void {
			this.sourceWidth = this.packageItem.width;
			this.sourceHeight = this.packageItem.height;
			this.initWidth = this.sourceWidth;
			this.initHeight = this.sourceHeight;
			
			this.setSize(this.sourceWidth, this.sourceHeight);
			
			this.packageItem.load();
			
			this.movieClip.interval = this.packageItem.interval;
			this.movieClip.swing = this.packageItem.swing;
			this.movieClip.repeatDelay = this.packageItem.repeatDelay;
			this.movieClip.frames = this.packageItem.frames;
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
	}
}