
package fairygui.display {
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	import laya.utils.Handler;
	
	public class MovieClip extends Sprite {
		public var interval: Number = 0;
		public var swing: Boolean = false;
		public var repeatDelay: Number = 0;
		public var timeScale:Number = 1;
		
		private var _texture: Texture = null;
		private var _needRebuild: Boolean = false;
		
		private var _playing: Boolean = true;
		private var _frameCount: Number = 0;
		private var _frames:Vector.<Frame>;
		private var _frame: Number = 0;
		private var _boundsRect: Rectangle;
		private var _start: Number = 0;
		private var _end: Number = 0;
		private var _times: Number = 0;
		private var _endAt: Number = 0;
		private var _status: Number = 0; //0-none, 1-next loop, 2-ending, 3-ended
		private var _endHandler: Handler = null;
		
		private var _frameElapsed:Number = 0; //当前帧延迟
		private var _reversed:Boolean = false;
		private var _repeatedCount:int = 0;
		
		public function MovieClip() {
			super();
			
			this.mouseEnabled = false;
			
			this.setPlaySettings();
			
			this.on(Event.DISPLAY, this, this.__addToStage);
			this.on(Event.UNDISPLAY, this, this.__removeFromStage);
		}
		
		public function get frames(): Vector.<Frame> {
			return this._frames;
		}
		
		public function set frames(value:Vector.<Frame>):void {
			this._frames = value;
			if (this._frames != null)
				this._frameCount = this._frames.length;
			else
				this._frameCount = 0;
			
			if(this._end == -1 || this._end > this._frameCount - 1)
				this._end = this._frameCount - 1;
			if(this._endAt == -1 || this._endAt > this._frameCount - 1)
				this._endAt = this._frameCount - 1;
			
			if(this._frame < 0 || this._frame > this._frameCount - 1)
				this._frame = this._frameCount - 1;
			
			drawFrame();
			
			_frameElapsed = 0;
			_repeatedCount = 0;
			_reversed = false;
			
			checkTimer();
		}
		
		public function get frameCount(): Number {
			return _frameCount;
		}
		
		public function get boundsRect(): Rectangle {
			return _boundsRect;
		}
		
		public function set boundsRect(value: Rectangle):void {
			this._boundsRect = value;
		}
		
		public function get frame(): Number {
			return _frame;
		}
		
		public function set frame(value: Number):void {
			if (_frame != value) {
				if(_frames!=null && value>=_frameCount)
					value = _frameCount-1;
				
				_frame = value;
				_frameElapsed = 0;
				drawFrame();
			}
		}
		
		public function get playing(): Boolean {
			return this._playing;
		}
		
		public function set playing(value: Boolean):void {
			if(_playing!=value)
			{
				_playing = value;
				checkTimer();
			}
		}
		
		//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
		public function rewind():void
		{
			_frame = 0;
			_frameElapsed = 0;
			_reversed = false;
			_repeatedCount = 0;
			
			drawFrame();
		}
		
		public function syncStatus(anotherMc:MovieClip):void
		{
			_frame = anotherMc._frame;
			_frameElapsed = anotherMc._frameElapsed;
			_reversed = anotherMc._reversed;
			_repeatedCount = anotherMc._repeatedCount;
			
			drawFrame();
		}
		
		public function advance(timeInMiniseconds:Number):void
		{
			var beginFrame:int = _frame;
			var beginReversed:Boolean = _reversed;
			var backupTime:int = timeInMiniseconds;
			while (true)
			{
				var tt:int = interval + _frames[_frame].addDelay;
				if (_frame == 0 && _repeatedCount > 0)
					tt += repeatDelay;
				if (timeInMiniseconds < tt)
				{
					_frameElapsed = 0;
					break;
				}
				
				timeInMiniseconds -= tt;
				
				if (swing)
				{
					if (_reversed)
					{
						_frame--;
						if (_frame <= 0)
						{
							_frame = 0;
							_repeatedCount++;
							_reversed = !_reversed;
						}
					}
					else
					{
						_frame++;
						if (_frame > _frameCount - 1)
						{
							_frame = Math.max(0, _frameCount - 2);
							_repeatedCount++;
							_reversed = !_reversed;
						}
					}
				}
				else
				{
					_frame++;
					if (_frame > _frameCount - 1)
					{
						_frame = 0;
						_repeatedCount++;
					}
				}
				
				if (_frame == beginFrame && _reversed == beginReversed) //走了一轮了
				{
					var roundTime:int = backupTime - timeInMiniseconds; //这就是一轮需要的时间
					timeInMiniseconds -= Math.floor(timeInMiniseconds / roundTime) * roundTime; //跳过
				}
			}
			
			drawFrame();
		}
		
		//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
		public function setPlaySettings(start:int = 0, end:int = -1, times:int = 0, endAt:int = -1, endHandler:Handler = null):void
		{
			_start = start;
			_end = end;
			if(_end==-1 || _end>_frameCount - 1)
				_end = _frameCount - 1;
			_times = times;
			_endAt = endAt;
			if (_endAt == -1)
				_endAt = _end;
			_status = 0;
			_endHandler = endHandler;
			this.frame = start;
		}
		
		private function update():void
		{
			if (!_playing || _frameCount == 0 || _status == 3)
				return;
			
			var dt:int = Laya.timer.delta;
			if(dt>100)
				dt = 100;
			if(timeScale!=1)
				dt *= timeScale;
			
			_frameElapsed += dt;
			var tt:int = interval + _frames[_frame].addDelay;
			if (_frame == 0 && _repeatedCount > 0)
				tt += repeatDelay;
			if (_frameElapsed < tt)
				return;
			
			_frameElapsed -= tt;
			if (_frameElapsed > interval)
				_frameElapsed = interval;
			
			if (swing)
			{
				if (_reversed)
				{
					_frame--;
					if (_frame <= 0)
					{
						_frame = 0;
						_repeatedCount++;
						_reversed = !_reversed;
					}
				}
				else
				{
					_frame++;
					if (_frame > _frameCount - 1)
					{
						_frame = Math.max(0, _frameCount - 2);
						_repeatedCount++;
						_reversed = !_reversed;
					}
				}
			}
			else
			{
				_frame++;
				if (_frame > _frameCount - 1)
				{
					_frame = 0;
					_repeatedCount++;
				}
			}
			
			if (_status == 1) //new loop
			{
				_frame = _start;
				_frameElapsed = 0;
				_status = 0;
			}
			else if (_status == 2) //ending
			{
				_frame = _endAt;
				_frameElapsed = 0;
				_status = 3; //ended
				
				//play end
				if(_endHandler!=null)
				{
					var handler:Handler = _endHandler;
					_endHandler = null;
					handler.run();
				}
			}
			else
			{
				if (_frame == _end)
				{
					if (_times > 0)
					{
						_times--;
						if (_times == 0)
							_status = 2;  //ending
						else
							_status = 1; //new loop
					}
					else if (_start != 0)
						_status = 1; //new loop
				}
			}
			
			drawFrame();
		}
		
		private function drawFrame(): void {
			if (_frameCount>0 && _frame < _frames.length)
			{
				var frame:Frame = _frames[_frame];
				this.graphics.clear();
				this.graphics.drawImage(frame.texture, frame.rect.x, frame.rect.y);
			}
			else
				this.graphics.clear();
		}
		
		private function checkTimer():void
		{
			if (_playing && _frameCount>0 && this.stage!=null)
				Laya.timer.frameLoop(1, this, this.update);
			else
				Laya.timer.clear(this, this.update);			
		}
		
		private function __addToStage(): void {
			if(this._playing && _frameCount>0)
				Laya.timer.frameLoop(1, this, this.update);
		}
		
		private function __removeFromStage(): void {
			Laya.timer.clear(this, this.update);
		}
	}
}