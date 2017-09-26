package fairygui {
	import laya.maths.Point;
	import laya.utils.Handler;
	import laya.utils.Tween;
	
	public class GearLook extends GearBase {
		public var tweener: Tween;
		
		private var _storage: Object;
		private var _default: GearLookValue;
		private var _tweenValue: Point;
		private var _tweenTarget: GearLookValue;
		
		public function GearLook(owner: GObject) {
			super(owner);
		}
		
		override protected function init(): void {
			this._default = new GearLookValue(this._owner.alpha,this._owner.rotation,this._owner.grayed,this._owner.touchable);
			this._storage = {};
		}
		
		override protected function addStatus(pageId: String,value: String): void {
			if(value=="-"|| value.length==0)
				return;
			
			var arr: Array = value.split(",");
			var gv: GearLookValue;
			if(pageId == null)
				gv = this._default;
			else {
				gv = new GearLookValue();
				this._storage[pageId] = gv;
			}
			gv.alpha = parseFloat(arr[0]);
			gv.rotation = parseInt(arr[1]);
			gv.grayed = arr[2] == "1" ? true : false;
			if(arr.length<4)
				gv.touchable = _owner.touchable;
			else
				gv.touchable = arr[3]=="1"?true:false;
		}
		
		override public function apply(): void {
			var gv: GearLookValue = this._storage[this._controller.selectedPageId];
			if(!gv)
				gv = this._default;
			
			if(this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
				this._owner._gearLocked = true;
				this._owner.grayed = gv.grayed;
				this._owner.touchable = gv.touchable;
				this._owner._gearLocked = false;
				
				if (this.tweener != null) {
					if (this._tweenTarget.alpha != gv.alpha || this._tweenTarget.rotation != gv.rotation) {
						this.tweener.complete();
						this.tweener = null;
					}
					else
						return;
				}
				
				var a: Boolean = gv.alpha != this._owner.alpha;
				var b: Boolean = gv.rotation != this._owner.rotation;
				if(a || b) {
					if(_owner.checkGearController(0, _controller))
						_displayLockToken = _owner.addDisplayLock();
					this._tweenTarget = gv;
					
					if(this._tweenValue == null)
						this._tweenValue = new Point();
					this._tweenValue.x = this._owner.alpha;
					this._tweenValue.y = this._owner.rotation;
					this.tweener = Tween.to(this._tweenValue, 
						{ x: gv.alpha, y: gv.rotation }, 
						this._tweenTime*1000, 
						this._easeType,
						Handler.create(this, this.__tweenComplete),
						this._delay*1000);
					this.tweener.update = Handler.create(this, this.__tweenUpdate, [a,b], false);
				}
			}
			else {
				this._owner._gearLocked = true;
				this._owner.grayed = gv.grayed;
				this._owner.alpha = gv.alpha;
				this._owner.rotation = gv.rotation;
				this._owner.touchable = gv.touchable;
				this._owner._gearLocked = false;
			}            
		}
		
		private function __tweenUpdate(a:Boolean, b:Boolean):void {
			this._owner._gearLocked = true;
			if(a)
				this._owner.alpha = this._tweenValue.x;
			if(b)
				this._owner.rotation = this._tweenValue.y;
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
			var gv: GearLookValue = this._storage[this._controller.selectedPageId];
			if(!gv) {
				gv = new GearLookValue();
				this._storage[this._controller.selectedPageId] = gv;
			}
			
			gv.alpha = this._owner.alpha;
			gv.rotation = this._owner.rotation;
			gv.grayed = this._owner.grayed;
			gv.touchable = this._owner.touchable;
		}
	}
}

class GearLookValue {
	public var alpha: Number;
	public var rotation: Number;
	public var grayed: Boolean;
	public var touchable:Boolean;
	
	public function GearLookValue(alpha: Number = 0,rotation: Number = 0,
								  grayed: Boolean = false, touchable:Boolean=true) {
		this.alpha = alpha;
		this.rotation = rotation;
		this.grayed = grayed;
		this.touchable = touchable;
	}
}
