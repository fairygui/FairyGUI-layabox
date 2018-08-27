package fairygui.gears {
	import fairygui.GObject;
	import fairygui.UIPackage;
	import fairygui.tween.GTween;
	import fairygui.tween.GTweener;
	import fairygui.utils.ByteBuffer;
	
	import laya.maths.Point;
	
	public class GearXY extends GearBase {
		private var _storage: Object;
		private var _default: Point;
		
		public function GearXY (owner: GObject) {
			super(owner);
		}
		
		override protected function init(): void {
			this._default = new Point(this._owner.x,this._owner.y);
			this._storage = {};
		}
		
		override protected function addStatus(pageId: String, buffer:ByteBuffer): void {
			var gv:Point;
			if (pageId == null)
				gv = this._default;
			else {
				gv = new Point();
				this._storage[pageId] = gv;
			}
			gv.x = buffer.getInt32();
			gv.y = buffer.getInt32();
		}
		
		override public function apply(): void {
			var pt: Point = this._storage[this._controller.selectedPageId];
			if (!pt)
				pt = this._default;
			
			if(_tweenConfig!=null && _tweenConfig.tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
				if (_tweenConfig._tweener != null)
				{
					if (_tweenConfig._tweener.endValue.x != pt.x || _tweenConfig._tweener.endValue.y != pt.y)
					{
						_tweenConfig._tweener.kill(true);
						_tweenConfig._tweener = null;
					}
					else
						return;
				}
				
				if (_owner.x != pt.x || _owner.y != pt.y)
				{
					if(_owner.checkGearController(0, _controller))
						_tweenConfig._displayLockToken = _owner.addDisplayLock();
					
					_tweenConfig._tweener = GTween.to2(_owner.x, _owner.y, pt.x, pt.y, _tweenConfig.duration)
						.setDelay(_tweenConfig.delay)
						.setEase(_tweenConfig.easeType)
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
			if(_tweenConfig._displayLockToken!=0)
			{
				_owner.releaseDisplayLock(_tweenConfig._displayLockToken);
				_tweenConfig._displayLockToken = 0;
			}
			_tweenConfig._tweener = null;
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
