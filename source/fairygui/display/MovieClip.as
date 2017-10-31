
package fairygui.display {
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	import laya.utils.Handler;
	
	public class MovieClip extends Sprite {
		public var interval: Number = 0;
		public var swing: Boolean;
		public var repeatDelay: Number = 0;
		private var playState: PlayState;
		
		private var _texture: Texture;
		private var _needRebuild: Boolean;
		
		private var _playing: Boolean;
		private var _frameCount: Number = 0;
		private var _frames: Array;
		private var _currentFrame: Number = 0;
		private var _boundsRect: Rectangle;
		private var _start: Number = 0;
		private var _end: Number = 0;
		private var _times: Number = 0;
		private var _endAt: Number = 0;
		private var _status: Number = 0; //0-none, 1-next loop, 2-ending, 3-ended
		private var _endHandler: Handler;
		
		public function MovieClip() {
			super();
			
			this.playState = new PlayState();
			this._playing = true;
			this.mouseEnabled = false;
			
			this.setPlaySettings();
			
			this.on(Event.DISPLAY, this, this.__addToStage);
			this.on(Event.UNDISPLAY, this, this.__removeFromStage);
		}
		
		public function get frames(): Array {
			return this._frames;
		}
		
		public function set frames(value: Array):void {
			this._frames = value;
			if (this._frames != null)
				this._frameCount = this._frames.length;
			else
				this._frameCount = 0;
			
			if(this._end == -1 || this._end > this._frameCount - 1)
				this._end = this._frameCount - 1;
			if(this._endAt == -1 || this._endAt > this._frameCount - 1)
				this._endAt = this._frameCount - 1;
			
			if(this._currentFrame < 0 || this._currentFrame > this._frameCount - 1)
				this._currentFrame = this._frameCount - 1;
			
			if(this._frameCount > 0)
				this.setFrame(this._frames[this._currentFrame]);
			else
				this.setFrame(null);  
			this.playState.rewind();
		}
		
		public function get frameCount(): Number {
			return this._frameCount;
		}
		
		public function get boundsRect(): Rectangle {
			return this._boundsRect;
		}
		
		public function set boundsRect(value: Rectangle):void {
			this._boundsRect = value;
		}
		
		public function get currentFrame(): Number {
			return this._currentFrame;
		}
		
		public function set currentFrame(value: Number):void {
			if (this._currentFrame != value) {
				this._currentFrame = value;
				this.playState.currentFrame = value;
				this.setFrame(this._currentFrame < this._frameCount ? this._frames[this._currentFrame] : null);
			}
		}
		
		public function get playing(): Boolean {
			return this._playing;
		}
		
		public function set playing(value: Boolean):void {
			this._playing = value;
			
			if(value && this.stage!=null) {
				Laya.timer.frameLoop(1, this, this.update);
			} else {
				Laya.timer.clear(this, this.update);
			}
		}
		
		//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
		public function setPlaySettings(start: Number = 0, end: Number = -1,
										times: Number = 0, endAt: Number = -1,
										endHandler: Handler = null): void {
			this._start = start;
			this._end = end;
			if(this._end == -1 || this._end > this._frameCount - 1)
				this._end = this._frameCount - 1;
			this._times = times;
			this._endAt = endAt;
			if(this._endAt == -1)
				this._endAt = this._end;
			this._status = 0;
			this._endHandler = endHandler;
			
			this.currentFrame = start;
		}
		
		private function update(): void {
			if (this._playing && this._frameCount != 0 && this._status != 3) {
				this.playState.update(this);
				if (this._currentFrame != this.playState.currentFrame) {
					if (this._status == 1) {
						this._currentFrame = this._start;
						this.playState.currentFrame = this._currentFrame;
						this._status = 0;
					}
					else if (this._status == 2) {
						this._currentFrame = this._endAt;
						this.playState.currentFrame = this._currentFrame;
						this._status = 3;
						
						//play end
						if (this._endHandler != null) {
							this._endHandler.run();
						}
					}
					else {
						this._currentFrame = this.playState.currentFrame;
						if (this._currentFrame == this._end) {
							if (this._times > 0) {
								this._times--;
								if (this._times == 0)
									this._status = 2;
								else
									this._status = 1;
							}
							else if(_start!=0)
								this._status = 1;
						}
					}
					
					//draw
					this.setFrame(this._frames[this._currentFrame]);
				}
			}
		}
		
		private function setFrame(frame: Frame): void {
			this.graphics.clear();
			if (frame != null)
				this.graphics.drawTexture(frame.texture, frame.rect.x, frame.rect.y);
		}
		
		private function __addToStage(): void {
			if(this._playing)
				Laya.timer.frameLoop(1, this, this.update);
		}
		
		private function __removeFromStage(): void {
			if(this._playing)
				Laya.timer.clear(this, this.update);
		}
	}
}