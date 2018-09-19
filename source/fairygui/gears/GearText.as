package fairygui.gears
{
	import fairygui.GObject;
	import fairygui.utils.ByteBuffer;
	
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
		
		override protected function addStatus(pageId: String, buffer:ByteBuffer):void
		{
			if(pageId==null)
				_default = buffer.readS();
			else
				_storage[pageId] = buffer.readS(); 
		}
		
		override public function apply():void
		{
			_owner._gearLocked = true;
			
			var data:* = _storage[_controller.selectedPageId];
			if(data!==undefined)
				_owner.text = data;
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