package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.utils.Ease;
	import laya.utils.Handler;
	import laya.utils.Tween;
	
	public class GProgressBar extends GComponent {
		private var _max: Number = 0;
		private var _value: Number = 0;
		private var _titleType: int;
		private var _reverse: Boolean;
		
		private var _titleObject: GTextField;
		private var _aniObject: GObject;
		private var _barObjectH: GObject;
		private var _barObjectV: GObject;
		private var _barMaxWidth: Number = 0;
		private var _barMaxHeight: Number = 0;
		private var _barMaxWidthDelta: Number = 0;
		private var _barMaxHeightDelta: Number = 0;
		private var _barStartX: Number = 0;
		private var _barStartY: Number = 0;
		
		private var _tweener: Tween;
		private var _tweenValue: Number = 0;
		
		private static var easeLinear: Function = Ease.linearNone;
		
		public function GProgressBar() {
			super();
			
			this._titleType = ProgressTitleType.Percent;
			this._value = 50;
			this._max = 100;
		}
		
		public function get titleType(): int {
			return this._titleType;
		}
		
		public function set titleType(value: int):void {
			if(this._titleType != value) {
				this._titleType = value;
				this.update(this._value);
			}
		}
		
		public function get max(): Number {
			return this._max;
		}
		
		public function set max(value: Number):void {
			if(this._max != value) {
				this._max = value;
				this.update(this._value);
			}
		}
		
		public function get value(): Number {
			return this._value;
		}
		
		public function set value(value: Number):void {
			if(this._tweener != null) {
				this._tweener.clear();
				this._tweener = null;
			}
			
			if(this._value != value) {
				this._value = value;
				this.update(this._value);
			}
		}
		
		public function tweenValue(value:Number, duration:Number):Tween
		{
			if(this._value != value) {
				if(this._tweener)
					this._tweener.clear();
				
				this._tweenValue = this._value;
				this._value = value;
				this._tweener = Tween.to(this, { _tweenValue: value }, duration * 1000, GProgressBar.easeLinear, 
					Handler.create(this, this.onTweenComplete, null, true)); 
				this._tweener.update = Handler.create(this, this.onUpdateTween, null, false);
				return this._tweener;
			}
			else
				return null;
		}
		
		private function onUpdateTween(): void {
			this.update(this._tweenValue);
		}
		
		private function onTweenComplete():void {
			this._tweener = null;
		}
		
		public function update(newValue:Number): void {
			var percent: Number = _max!=0?Math.min(newValue / this._max,1):0;
			if(this._titleObject) {
				switch(this._titleType) {
					case ProgressTitleType.Percent:
						this._titleObject.text = Math.round(percent * 100) + "%";
						break;
					
					case ProgressTitleType.ValueAndMax:
						this._titleObject.text = Math.round(newValue) + "/" + Math.round(this._max);
						break;
					
					case ProgressTitleType.Value:
						this._titleObject.text = "" + Math.round(newValue);
						break;
					
					case ProgressTitleType.Max:
						this._titleObject.text = "" + Math.round(this._max);
						break;
				}
			}
			
			var fullWidth: Number = this.width - this._barMaxWidthDelta;
			var fullHeight: Number = this.height - this._barMaxHeightDelta;
			if(!this._reverse) {
				if(this._barObjectH)
					this._barObjectH.width = Math.round(fullWidth * percent);
				if(this._barObjectV)
					this._barObjectV.height = Math.round(fullHeight * percent);
			}
			else {
				if(this._barObjectH) {
					this._barObjectH.width = Math.round(fullWidth * percent);
					this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
					
				}
				if(this._barObjectV) {
					this._barObjectV.height = Math.round(fullHeight * percent);
					this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
				}
			}
			if(this._aniObject is GMovieClip)
				GMovieClip(this._aniObject).frame = Math.round(percent * 100);
		}
		
		override protected function constructFromXML(xml: Object): void {
			super.constructFromXML(xml);
			
			xml = ToolSet.findChildNode(xml, "ProgressBar");
			
			var str: String;
			str = xml.getAttribute("titleType");
			if(str)
				this._titleType = ProgressTitleType.parse(str);
			
			this._reverse = xml.getAttribute("reverse") == "true";
			
			this._titleObject = GTextField(this.getChild("title"));
			this._barObjectH = this.getChild("bar");
			this._barObjectV = this.getChild("bar_v");
			this._aniObject = this.getChild("ani");
			
			if(this._barObjectH) {
				this._barMaxWidth = this._barObjectH.width;
				this._barMaxWidthDelta = this.width - this._barMaxWidth;
				this._barStartX = this._barObjectH.x;
			}
			if(this._barObjectV) {
				this._barMaxHeight = this._barObjectV.height;
				this._barMaxHeightDelta = this.height - this._barMaxHeight;
				this._barStartY = this._barObjectV.y;
			}
		}
		
		override protected function handleSizeChanged(): void {
			super.handleSizeChanged();
			
			if(this._barObjectH)
				this._barMaxWidth = this.width - this._barMaxWidthDelta;
			if(this._barObjectV)
				this._barMaxHeight = this.height - this._barMaxHeightDelta;
			if(!this._underConstruct)
				this.update(this._value);
		}
		
		override public function setup_afterAdd(xml: Object): void {
			super.setup_afterAdd(xml);
			
			xml = ToolSet.findChildNode(xml, "ProgressBar");
			if (xml) {
				this._value = parseInt(xml.getAttribute("value"));
				this._max = parseInt(xml.getAttribute("max"));
			}
			this.update(this._value);
		}
		
		override public function dispose(): void {
			if(this._tweener)
				this._tweener.clear();
			super.dispose();
		}
	}
}