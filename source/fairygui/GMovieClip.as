package fairygui {
	import fairygui.display.MovieClip;
	import fairygui.utils.ByteBuffer;
	
	import laya.maths.Rectangle;
	import laya.utils.Handler;
	import fairygui.gears.IAnimationGear;
	import fairygui.gears.IColorGear;
	
	public class GMovieClip extends GObject implements IAnimationGear, IColorGear {
		private var _movieClip: MovieClip;
		
		public function GMovieClip() {
			super();
		}
		
		public function get color(): String {
			return "#FFFFFF";
		}
		
		public function set color(value: String):void {
		}
		
		override protected function createDisplayObject(): void {
			this._displayObject = _movieClip = new MovieClip();
			_movieClip.mouseEnabled = false;
			this._displayObject["$owner"] = this;
		}
		
		public function get playing(): Boolean {
			return _movieClip.playing;
		}
		
		public function set playing(value: Boolean):void {
			if (_movieClip.playing != value) {
				_movieClip.playing = value;
				this.updateGear(5);
			}
		}
		
		public function get frame(): Number {
			return _movieClip.frame;
		}
		
		public function set frame(value: Number):void {
			if (_movieClip.frame != value) {
				_movieClip.frame = value;
				this.updateGear(5);
			}
		}
		
		final public function get timeScale():Number
		{
			return _movieClip.timeScale;
		}
		
		public function set timeScale(value:Number):void
		{
			_movieClip.timeScale = value;
		}
		
		public function rewind():void
		{
			_movieClip.rewind();
		}
		
		public function syncStatus(anotherMc:GMovieClip):void
		{
			_movieClip.syncStatus(anotherMc._movieClip);
		}
		
		public function advance(timeInMiniseconds:int):void
		{
			_movieClip.advance(timeInMiniseconds);
		}
		
		//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
		public function setPlaySettings(start: Number = 0,end: Number = -1,
										times: Number = 0,endAt: Number = -1,
										endHandler: Handler = null): void {
			_movieClip.setPlaySettings(start, end, times, endAt, endHandler);
		}
		
		override public function constructFromResource(): void {
			this.sourceWidth = this.packageItem.width;
			this.sourceHeight = this.packageItem.height;
			this.initWidth = this.sourceWidth;
			this.initHeight = this.sourceHeight;
			
			this.setSize(this.sourceWidth, this.sourceHeight);
			
			this.packageItem.load();
			
			_movieClip.interval = this.packageItem.interval;
			_movieClip.swing = this.packageItem.swing;
			_movieClip.repeatDelay = this.packageItem.repeatDelay;
			_movieClip.frames = this.packageItem.frames;
		}
		
		override public function setup_beforeAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_beforeAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 5);
			
			if (buffer.readBool())
				this.color = buffer.readColorS();
			buffer.readByte(); //flip
			_movieClip.frame = buffer.getInt32();
			_movieClip.playing = buffer.readBool();
		}
	}
}