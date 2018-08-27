package fairygui.gears {
	import fairygui.GObject;
	import fairygui.UIPackage;
	import fairygui.tween.GTween;
	import fairygui.tween.GTweener;
	import fairygui.utils.ByteBuffer;
	
	public class GearSize extends GearBase {
		private var _storage: Object;
		private var _default: GearSizeValue;

		public function GearSize(owner: GObject) {
			super(owner);
		}
		
		override protected function init(): void {
			this._default = new GearSizeValue(this._owner.width,this._owner.height,
				this._owner.scaleX,this._owner.scaleY);
			this._storage = {};
		}
		
		override protected function addStatus(pageId: String, buffer:ByteBuffer): void {
			var gv: GearSizeValue;
			if (pageId == null)
				gv = this._default;
			else {
				gv = new GearSizeValue();
				this._storage[pageId] = gv;
			}
			
			gv.width = buffer.getInt32();
			gv.height = buffer.getInt32();
			gv.scaleX = buffer.getFloat32();
			gv.scaleY = buffer.getFloat32();
		}
		
		override public function apply(): void {
			var gv: GearSizeValue = this._storage[this._controller.selectedPageId];
			if (!gv)
				gv = this._default;
			
			if(_tweenConfig!=null && _tweenConfig.tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect) {
				if (_tweenConfig._tweener != null)
				{
					if (_tweenConfig._tweener.endValue.x != gv.width || _tweenConfig._tweener.endValue.y != gv.height
						|| _tweenConfig._tweener.endValue.z != gv.scaleX || _tweenConfig._tweener.endValue.w != gv.scaleY)
					{
						_tweenConfig._tweener.kill(true);
						_tweenConfig._tweener = null;
					}
					else
						return;
				}
				
				var a:Boolean = gv.width != _owner.width || gv.height != _owner.height;
				var b:Boolean = gv.scaleX != _owner.scaleX || gv.scaleY != _owner.scaleY;
				if(a || b)
				{
					if(_owner.checkGearController(0, _controller))
						_tweenConfig._displayLockToken = _owner.addDisplayLock();
					
					_tweenConfig._tweener = GTween.to4(_owner.width,_owner.height,_owner.scaleX, _owner.scaleY, gv.width,gv.height,gv.scaleX, gv.scaleY, _tweenConfig.duration)
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
			if(_tweenConfig._displayLockToken!=0)
			{
				_owner.releaseDisplayLock(_tweenConfig._displayLockToken);
				_tweenConfig._displayLockToken = 0;
			}
			_tweenConfig._tweener = null;
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