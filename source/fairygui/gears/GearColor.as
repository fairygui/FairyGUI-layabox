package fairygui.gears {
	import fairygui.GObject;
	import fairygui.utils.ByteBuffer;
	
	public class GearColor extends GearBase {
		private var _storage: Object;
		private var _default: GearColorValue;
		
		public function GearColor(owner: GObject) {
			super(owner);
		}
		
		override protected function init(): void {
			if(_owner["strokeColor"]!=undefined)
				this._default = new GearColorValue(_owner["color"], _owner["strokeColor"]);
			else
				this._default = new GearColorValue(_owner["color"], null);
			this._storage = {};
		}
		
		override protected function addStatus(pageId: String, buffer:ByteBuffer): void {
			var gv:GearColorValue;
			if (pageId == null)
				gv = this._default;
			else {
				gv = new GearColorValue();
				this._storage[pageId] = gv;
			}
			
			gv.color = buffer.readColorS();
			gv.strokeColor = buffer.readColorS();
		}
		
		override public function apply(): void {
			this._owner._gearLocked = true;
			
			var gv:GearColorValue = _storage[_controller.selectedPageId];
			if(!gv)
				gv = _default;
			
			IColorGear(_owner).color = gv.color;
			if(_owner["strokeColor"]!=undefined && gv.strokeColor!=null)
				_owner["strokeColor"] = gv.strokeColor;
			
			this._owner._gearLocked = false;
		}
		
		override public function updateState(): void {
			var gv:GearColorValue = _storage[_controller.selectedPageId];
			if(!gv)
			{
				gv = new GearColorValue(null, null);
				_storage[_controller.selectedPageId] = gv;
			}
			
			gv.color = IColorGear(_owner).color;
			if(_owner["strokeColor"]!=undefined)
				gv.strokeColor = _owner["strokeColor"];
		}
	}
}

class GearColorValue
{
	public var color:String;
	public var strokeColor:String;
	
	public function GearColorValue(color:String=null, strokeColor:String=null)
	{
		this.color = color;
		this.strokeColor = strokeColor;
	}
}