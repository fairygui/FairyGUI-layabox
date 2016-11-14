package fairygui.display {
	
    public class PlayState {
        public var reachEnding: Boolean;
        public var reversed: Boolean;
        public var repeatedCount: Number = 0;

        private var _curFrame: Number = 0;
        private var _lastTime: Number = 0;
        private var _curFrameDelay: Number = 0;

        public function PlayState () {
        }

        public function update(mc: fairygui.display.MovieClip): void {
            var t: Number = Laya.timer.currTimer;
            var elapsed: Number = t - this._lastTime;
            this._lastTime = t;

            this.reachEnding = false;
            this._curFrameDelay += elapsed;
            var interval: Number = mc.interval + mc.frames[this._curFrame].addDelay + ((this._curFrame == 0 && this.repeatedCount > 0) ? mc.repeatDelay : 0);
            if (this._curFrameDelay < interval)
                return;

			this._curFrameDelay -= interval;
			if(this._curFrameDelay>mc.interval)
				this._curFrameDelay = mc.interval;
			
			if (mc.swing)
			{
				if(this.reversed)
				{
					this._curFrame--;
					if(this._curFrame<0)
					{
						this._curFrame = Math.min(1, mc.frameCount-1);
						this.repeatedCount++;
						this.reversed = !this.reversed;
					}
				}
				else
				{
					this._curFrame++;
					if (this._curFrame > mc.frameCount - 1)
					{
						this._curFrame = Math.max(0, mc.frameCount-2);
						this.repeatedCount++;
						this.reachEnding = true;
						this.reversed = !this.reversed;
					}
				}				
			}
			else
			{
				this._curFrame++;
				if (this._curFrame > mc.frameCount - 1)
				{
					this._curFrame = 0;
					this.repeatedCount++;
					this.reachEnding = true;
				}
			}
        }

        public function get currentFrame(): Number {
            return this._curFrame;
        }

        public function set currentFrame(value: Number):void {
            this._curFrame = value;
            this._curFrameDelay = 0;
        }

        public function rewind(): void {
            this._curFrame = 0;
            this._curFrameDelay = 0;
            this.reversed = false;
            this.reachEnding = false;
        }

        public function reset(): void {
            this._curFrame = 0;
            this._curFrameDelay = 0;
            this.repeatedCount = 0;
            this.reachEnding = false;
            this.reversed = false;
        }

        public function copy(src: PlayState): void {
            this._curFrame = src._curFrame;
            this._curFrameDelay = src._curFrameDelay;
            this.repeatedCount = src.repeatedCount;
            this.reachEnding = src.reachEnding;
            this.reversed = src.reversed;
        }
    }
}