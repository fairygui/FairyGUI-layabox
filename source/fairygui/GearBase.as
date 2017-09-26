package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.utils.Ease;
	
	public class GearBase {
		public static var disableAllTweenEffect:Boolean = false;
		
		protected var _tween: Boolean;
		protected var _easeType: Function;
		protected var _tweenTime: Number = 0.3;
		protected var _delay: Number = 0;
		protected var _displayLockToken:Number = 0;
		
		protected var _owner: GObject;
		protected var _controller: Controller;
		
		public function GearBase(owner: GObject) {
			this._owner = owner;
			this._easeType = Ease.quadOut;
		}
		
		public function get controller(): Controller {
			return this._controller;
		}
		
		public function set controller(val: Controller):void {
			if (val != this._controller) {
				this._controller = val;
				if(this._controller)
					this.init();
			}
		}
		
		public function get tween(): Boolean {
			return this._tween;
		}
		
		public function set tween(val: Boolean):void {
			this._tween = val;
		}
		
		public function get delay(): Number {
			return this._delay;
		}
		
		public function set delay(val: Number):void {
			this._delay = val;
		}
		
		public function get tweenTime(): Number {
			return this._tweenTime;
		}
		
		public function set tweenTime(value: Number):void {
			this._tweenTime = value;
		}
		
		public function get easeType(): Function {
			return this._easeType;
		}
		
		public function set easeType(value: Function):void {
			this._easeType = value;
		}
		
		public function setup(xml: Object): void {
			this._controller = this._owner.parent.getController(xml.getAttribute("controller"));
			if(this._controller == null)
				return;
			
			this.init();
			
			var str: String;
			
			str = xml.getAttribute("tween");
			if (str)
				this._tween = true;
			
			str = xml.getAttribute("ease");
			if (str)
				this._easeType = ToolSet.parseEaseType(str);
			
			str = xml.getAttribute("duration");
			if (str)
				this._tweenTime = parseFloat(str);
			
			str = xml.getAttribute("delay");
			if (str)
				this._delay = parseFloat(str);
			
			if(this is GearDisplay)
			{
				str = xml.getAttribute("pages");
				if(str)
				{
					var arr:Array = str.split(",");
					GearDisplay(this).pages = arr;
				}
			}
			else
			{
				var pages:Array;
				var values:Array;
				
				str = xml.getAttribute("pages");
				if(str)
					pages = str.split(",");
				
				if(pages)
				{
					str = xml.getAttribute("values");
					if(str!=null)
						values = str.split("|");
					else
						values = [];
					
					for(var i:Number=0;i<pages.length;i++)
					{
						str = values[i];
						if(str==null)
							str = "";
						addStatus(pages[i], str);
					}
				}
				
				str = xml.getAttribute("default");
				if(str)
					addStatus(null, str);
			}
		}
		
		public function updateFromRelations(dx: Number, dy: Number): void {
			
		}
		
		protected function addStatus(pageId: String, value: String): void {
			
		}
		
		protected function init():void {
			
		}
		
		public function apply(): void {
		}
		
		public function updateState(): void {
		}
	}
}
