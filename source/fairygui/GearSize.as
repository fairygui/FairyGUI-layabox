package fairygui {
	import fairygui.tween.GTween;
	import fairygui.tween.GTweener;
	
	import laya.utils.Handler;
	import laya.utils.Tween;
	
	public class GearSize extends GearBase {
		private var _storage: Object;
		private var _default: GearSizeValue;
		private var _tweener:GTweener;
		
		public function GearSize(owner: GObject) {
			super(owner);
		}
		
		override protected function init(): void {
			this._default = new GearSizeValue(this._owner.width,this._owner.height,
				this._owner.scaleX,this._owner.scaleY);
			this._storage = {};
		}
		
		override protected function addStatus(pageId: String, value: String): void {
			if(value=="-"|| value.length==0)
				return;
			
			var arr: Array = value.split(",");
			var gv: GearSizeValue;
			if (pageId == null)
				gv = this._default;
			else {
				gv = new GearSizeValue();
				this._storage[pageId] = gv;
			}
			gv.width = parseInt(arr[0]);
			gv.height = parseInt(arr[1]);
			if(arr.length>2)
			{
				gv.scaleX = parseFloat(arr[2]);
				gv.scaleY = parseFloat(arr[3]);
			}
		}
		
		override public function apply(): void {
			var gv: GearSizeValue = this._storage[this._controller.selectedPageId];
			if (!gv)
				gv = this._default;
			
			if(this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
				if (_tweener != null)
				{
					if (_tweener.endValue.x != gv.width || _tweener.endValue.y != gv.height
						|| _tweener.endValue.z != gv.scaleX || _tweener.endValue.w != gv.scaleY)
					{
						_tweener.kill(true);
						_tweener = null;
					}
					else
						return;
				}
				
				var a:Boolean = gv.width != _owner.width || gv.height != _owner.height;
				var b:Boolean = gv.scaleX != _owner.scaleX || gv.scaleY != _owner.scaleY;
				if(a || b)
				{
					if(_owner.checkGearController(0, _controller))
						_displayLockToken = _owner.addDisplayLock();
					
					_tweener = GTween.to4(_owner.width,_owner.height,_owner.scaleX, _owner.scaleY, gv.width,gv.height,gv.scaleX, gv.scaleY, _tweenTime)
						.setDelay(_delay)
						.setEase(_easeType)
						.setUserData((a ? 1 : 0) + (b ? 2 : 0))
						.setTarget(this)
						.onUpdate(__tweenUpdate, this)
						.onComplete(__tweenComplete, this);
				}
			}
			else {
				this._owner._gearLocked = true;
				this._owner.setSize(gv.width,gv.height,_owner.checkGearController(1, _controller));
				this._owner.setScale(gv.scaleX,gv.scaleY);
				this._owner._gearLocked = false;
			}
		}
		
		private function __tweenUpdate(tweener:GTweener):void
		{
			var flag:int = tweener.userData;
			_owner._gearLocked = true;
			if ((flag & 1) != 0)
				_owner.setSize(tweener.value.x, tweener.value.y, _owner.checkGearController(1, _controller));
			if ((flag & 2) != 0)
				_owner.setScale(tweener.value.z, tweener.value.w);
			_owner._gearLocked = false;							
		}
		
		private function __tweenComplete():void
		{
			if(_displayLockToken!=0)
			{
				_owner.releaseDisplayLock(_displayLockToken);
				_displayLockToken = 0;
			}
			_tweener = null;
		}
		
		override public function updateState(): void {
			var gv: GearSizeValue = this._storage[this._controller.selectedPageId];
			if(!gv) {
				gv = new GearSizeValue();
				this._storage[this._controller.selectedPageId] = gv;
			}
			
			gv.width = this._owner.width;
			gv.height = this._owner.height;
			gv.scaleX = this._owner.scaleX;
			gv.scaleY = this._owner.scaleY;
		}
		
		override public function updateFromRelations(dx: Number,dy: Number): void {
			if(this._controller==null || this._storage==null)
				return;
			
			for(var key:String in this._storage) {
				var gv: GearSizeValue = this._storage[key];
				gv.width += dx;
				gv.height += dy;
			}
			this._default.width += dx;
			this._default.height += dy;
			
			this.updateState();
		}
	}
}

class GearSizeValue
{
	public var width:Number;
	public var height:Number;
	public var scaleX:Number;
	public var scaleY:Number;
	
	public function GearSizeValue(width:Number=0, height:Number=0, scaleX:Number=0, scaleY:Number=0)
	{
		this.width = width;
		this.height = height;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
	}
}