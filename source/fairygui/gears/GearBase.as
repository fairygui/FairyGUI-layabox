package fairygui.gears {
	import fairygui.Controller;
	import fairygui.GObject;
	import fairygui.utils.ByteBuffer;
	
	public class GearBase {
		public static var disableAllTweenEffect:Boolean = false;

		protected var _owner: GObject;
		protected var _controller: Controller;
		protected var _tweenConfig:GearTweenConfig;
		
		public function GearBase(owner: GObject) {
			_owner = owner;
		}
		
		public function dispose():void
		{
			if (_tweenConfig != null && _tweenConfig._tweener != null)
			{
				_tweenConfig._tweener.kill();
				_tweenConfig._tweener = null;
			}
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
		
		public function get tweenConfig():GearTweenConfig {
			if(_tweenConfig==null)
				_tweenConfig = new GearTweenConfig();
			return _tweenConfig;
		}
		
		public function setup(buffer:ByteBuffer): void {
			this._controller = this._owner.parent.getControllerAt(buffer.getInt16());
			this.init();
			
			var cnt:int;
			var i:int;
			var page:String;
			
			if (this is GearDisplay)
			{
				cnt = buffer.getInt16();
				var pages:Array = [];
				for (i = 0; i < cnt; i++)
					pages[i] = buffer.readS();
				GearDisplay(this).pages = pages;
			}
			else
			{
				cnt = buffer.getInt16();
				for (i = 0; i < cnt; i++)
				{
					page = buffer.readS();
					if (page == null)
						continue;
					
					addStatus(page, buffer);
				}
				
				if (buffer.readBool())
					addStatus(null, buffer);
			}
			
			if (buffer.readBool())
			{
				_tweenConfig = new GearTweenConfig();
				_tweenConfig.easeType = buffer.readByte();
				_tweenConfig.duration = buffer.getFloat32();
				_tweenConfig.delay = buffer.getFloat32();
			}
		}
		
		public function updateFromRelations(dx: Number, dy: Number): void {
			
		}
		
		protected function addStatus(pageId: String, buffer:ByteBuffer): void {
			
		}
		
		protected function init():void {
			
		}
		
		public function apply(): void {
		}
		
		public function updateState(): void {
		}
	}
}
