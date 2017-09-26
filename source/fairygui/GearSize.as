package fairygui {
	import laya.utils.Handler;
	import laya.utils.Tween;
	
	public class GearSize extends GearBase {
		public var tweener: Tween;
		
		private var _storage: Object;
		private var _default: GearSizeValue;
		private var _tweenValue: GearSizeValue;
		private var _tweenTarget: GearSizeValue;
		
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
				if(this.tweener!=null) {
					if (this._tweenTarget.width != gv.width || this._tweenTarget.height != gv.height
						|| this._tweenTarget.scaleX != gv.scaleX || this._tweenTarget.scaleY != gv.scaleY) {
						this.tweener.complete();
						this.tweener = null;
					}
					else
						return;
				}
				
				var a: Boolean = gv.width != this._owner.width || gv.height != this._owner.height;
				var b: Boolean = gv.scaleX != this._owner.scaleX || gv.scaleY != this._owner.scaleY;
				if(a || b) {
					if(_owner.checkGearController(0, _controller))
						_displayLockToken = _owner.addDisplayLock();
					this._tweenTarget = gv;
					
					if(this._tweenValue == null)
						this._tweenValue = new GearSizeValue();
					this._tweenValue.width = this._owner.width;
					this._tweenValue.height = this._owner.height;
					this._tweenValue.scaleX = this._owner.scaleX;
					this._tweenValue.scaleY = this._owner.scaleY;
					this.tweener = Tween.to(this._tweenValue, 
						{ width: gv.width, height: gv.height, scaleX: gv.scaleX, scaleY: gv.scaleY }, 
						this._tweenTime*1000, 
						this._easeType,
						Handler.create(this, this.__tweenComplete),
						this._delay*1000);
					this.tweener.update = Handler.create(this, this.__tweenUpdate, [a,b], false);
				}
			}
			else {
				this._owner._gearLocked = true;
				this._owner.setSize(gv.width,gv.height,_owner.checkGearController(1, _controller));
				this._owner.setScale(gv.scaleX,gv.scaleY);
				this._owner._gearLocked = false;
			}
		}
		
		private function __tweenUpdate(a:Boolean, b:Boolean):void {
			this._owner._gearLocked = true;
			if(a)
				this._owner.setSize(this._tweenValue.width,this._tweenValue.height,_owner.checkGearController(1, _controller));
			if(b)
				this._owner.setScale(this._tweenValue.scaleX,this._tweenValue.scaleY);
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