package fairygui {
	import laya.maths.Point;
	import laya.utils.Handler;
	import laya.utils.Tween;
	
	public class GearXY extends GearBase {
		public var tweener: Tween;
		
		private var _storage: Object;
		private var _default: Point;
		private var _tweenValue: Point;
		private var _tweenTarget: Point;
		
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
				if(this.tweener) {
					if(this._tweenTarget.x!=pt.x || this._tweenTarget.y!=pt.y) {
						this.tweener.complete();
						this.tweener = null;
					}
					else
						return;
				}
				
				if(this._owner.x != pt.x || this._owner.y != pt.y) {
					if(_owner.checkGearController(0, _controller))
						_displayLockToken = _owner.addDisplayLock();
					this._tweenTarget = pt;
					
					if(this._tweenValue == null)
						this._tweenValue = new Point();
					this._tweenValue.x = this._owner.x;
					this._tweenValue.y = this._owner.y;
					this.tweener = Tween.to(this._tweenValue, 
						{ x: pt.x,y: pt.y },
						this._tweenTime*1000, 
						this._easeType,
						Handler.create(this, this.__tweenComplete),
						this._delay*1000);
					this.tweener.update = Handler.create(this, this.__tweenUpdate, null, false);
				}
			}
			else {
				this._owner._gearLocked = true;
				this._owner.setXY(pt.x,pt.y);
				this._owner._gearLocked = false;
			}
		}
		
		private function __tweenUpdate():void {
			this._owner._gearLocked = true;
			this._owner.setXY(this._tweenValue.x,this._tweenValue.y);
			this._owner._gearLocked = false;
		}
		
		private function __tweenComplete():void {
			if(_displayLockToken!=0)
			{
				_owner.releaseDisplayLock(_displayLockToken);
				_displayLockToken = 0;
			}
			this.tweener = null;
			this._owner.displayObject.event(Events.GEAR_STOP);
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
