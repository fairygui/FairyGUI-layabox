package fairygui
{

	public class GearText extends GearBase
	{
		private var _storage:Object;
		private var _default:String;
		
		public function GearText(owner:GObject)
		{
			super(owner);			
		}
		
		override protected function init():void
		{
			_default = _owner.text;
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
				_owner.text = String(data);
			else
				_owner.text = _default;
			
			_owner._gearLocked = false;
		}
		
		override public function updateState():void
		{
			_storage[_controller.selectedPageId] = _owner.text;
		}
	}
}