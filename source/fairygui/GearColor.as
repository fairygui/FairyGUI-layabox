package fairygui {
	
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
		
		override protected function addStatus(pageId: String, value: String): void {
			if(value=="-"|| value.length==0)
				return;
			
			var pos:int = value.indexOf(",");
			var col1:String;
			var col2:String;
			if(pos==-1)
			{
				col1 = value;
				col2 = null;
			}
			else
			{
				col1 = value.substr(0,pos);
				col2 = value.substr(pos+1);
			}
			if(pageId==null)
			{
				_default.color = col1;
				_default.strokeColor = col2;
			}
			else
				_storage[pageId] = new GearColorValue(col1, col2);
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
	
	public function GearColorValue(color:String, strokeColor:String)
	{
		this.color = color;
		this.strokeColor = strokeColor;
	}
}