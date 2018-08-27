package fairygui.gears {
	import fairygui.GObject;
	import fairygui.UIPackage;
	import fairygui.tween.GTween;
	import fairygui.tween.GTweener;
	import fairygui.utils.ByteBuffer;
	
	public class GearLook extends GearBase {
		private var _storage: Object;
		private var _default: GearLookValue;
		
		public function GearLook(owner: GObject) {
			super(owner);
		}
		
		override protected function init(): void {
			this._default = new GearLookValue(this._owner.alpha,this._owner.rotation,this._owner.grayed,this._owner.touchable);
			this._storage = {};
		}
		
		override protected function addStatus(pageId: String, buffer:ByteBuffer): void {
			var gv: GearLookValue;
			if (pageId == null)
				gv = this._default;
			else {
				gv = new GearLookValue();
				this._storage[pageId] = gv;
			}
			
			gv.alpha = buffer.getFloat32();
			gv.rotation = buffer.getFloat32();
			gv.grayed = buffer.readBool();
			gv.touchable = buffer.readBool();
		}
		
		override public function apply(): void {
			var gv: GearLookValue = this._storage[this._controller.selectedPageId];
			if(!gv)
				gv = this._default;
			
			if(_tweenConfig!=null && _tweenConfig.tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
				this._owner._gearLocked = true;
				this._owner.grayed = gv.grayed;
				this._owner.touchable = gv.touchable;
				this._owner._gearLocked = false;
				
				if (_tweenConfig._tweener != null)
				{
					if (_tweenConfig._tweener.endValue.x != gv.alpha || _tweenConfig._tweener.endValue.y != gv.rotation)
					{
						_tweenConfig._tweener.kill(true);
						_tweenConfig._tweener = null;
					}
					else
						return;
				}
				
				var a:Boolean = gv.alpha!=_owner.alpha;
				var b:Boolean = gv.rotation!=_owner.rotation;
				if(a || b)
				{
					if(_owner.checkGearController(0, _controller))
						_tweenConfig._displayLockToken = _owner.addDisplayLock();
					
					_tweenConfig._tweener = GTween.to2(_owner.alpha, _owner.rotation, gv.alpha, gv.rotation, _tweenConfig.duration)
						.setDelay(_tweenConfig.delay)
						.setEase(_tweenConfig.easeType)
						.setUserData((a ? 1 : 0) + (b ? 2 : 0))
						.setTarget(this)
						.onUpdate(__tweenUpdate, this)
						.onComplete(__tweenComplete, this);
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
		
		private function __tweenUpdate(tweener:GTweener):void
		{
			var flag:int = tweener.userData;
			_owner._gearLocked = true;
			if ((flag & 1) != 0)
				_owner.alpha = tweener.value.x;
			if ((flag & 2) != 0)
				_owner.rotation = tweener.value.y;
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
