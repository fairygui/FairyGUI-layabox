package fairygui {
	import fairygui.tween.GTween;
	import fairygui.tween.GTweener;
	
	import laya.maths.Point;
	import laya.utils.Handler;
	import laya.utils.Tween;
	
	public class GearXY extends GearBase {
		private var _storage: Object;
		private var _default: Point;
		private var _tweener:GTweener;
		
		public function GearXY (owner: GObject) {
			super(owner);
		}
		
		override protected function init(): void {
			this._default = new Point(this._owner.x,this._owner.y);
			this._storage = {};
		}
		
		override protected function addStatus(pageId: String, value: String): void {
			if(value=="-"|| value.length==0)
				return;
			
			var arr: Array = value.split(",");
			var pt: Point;
			if (pageId == null)
				pt = this._default;
			else {
				pt = new Point();
				this._storage[pageId] = pt;
			}
			pt.x = parseInt(arr[0]);
			pt.y = parseInt(arr[1]);
		}
		
		override public function apply(): void {
			var pt: Point = this._storage[this._controller.selectedPageId];
			if (!pt)
				pt = this._default;
			
			if(this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
				if (_tweener != null)
				{
					if (_tweener.endValue.x != pt.x || _tweener.endValue.y != pt.y)
					{
						_tweener.kill(true);
						_tweener = null;
					}
					else
						return;
				}
				
				if (_owner.x != pt.x || _owner.y != pt.y)
				{
					if(_owner.checkGearController(0, _controller))
						_displayLockToken = _owner.addDisplayLock();
					
					_tweener = GTween.to2(_owner.x, _owner.y, pt.x, pt.y, _tweenTime)
						.setDelay(_delay)
						.setEase(_easeType)
						.setTarget(this)
						.onUpdate(__tweenUpdate, this)
						.onComplete(__tweenComplete, this);
				}
			}
			else {
				this._owner._gearLocked = true;
				this._owner.setXY(pt.x,pt.y);
				this._owner._gearLocked = false;
			}
		}
		
		private function __tweenUpdate(tweener:GTweener):void
		{
			_owner._gearLocked = true;
			_owner.setXY(tweener.value.x, tweener.value.y);
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
			var pt:Point = this._storage[this._controller.selectedPageId];
			if(!pt) {
				pt = new Point();
				this._storage[this._controller.selectedPageId] = pt;
			}
			
			pt.x = this._owner.x;
			pt.y = this._owner.y;
		}
		
		override public function updateFromRelations(dx: Number, dy: Number): void {
			if(this._controller==null || this._storage==null)
				return;
			
			for (var key:String in this._storage) {
				var pt: Point = this._storage[key];
				pt.x += dx;
				pt.y += dy;
			}
			this._default.x += dx;
			this._default.y += dy;
			
			this.updateState();
		}
	}
}
