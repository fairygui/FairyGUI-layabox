package fairygui
{

	public class GearIcon extends GearBase
	{
		private var _storage:Object;
		private var _default:String;
		
		public function GearIcon(owner:GObject)
		{
			super(owner);			
		}
		
		override protected function init():void
		{
			_default = _owner.icon;
			_storage = {};
		}
		
		override protected function addStatus(pageId:String, value:String):void
		{
			if(pageId==null)
				_default = value;
			else
				_storage[pageId] = value; 
		}
		
		override public function apply():void
		{
			_owner._gearLocked = true;

			var data:* = _storage[_controller.selectedPageId];
			if(data!=undefined)
				_owner.icon = String(data);
			else
				_owner.icon = _default;
			
			_owner._gearLocked = false;
		}
		
		override public function updateState():void
		{
			_storage[_controller.selectedPageId] = _owner.icon;
		}
	}
}