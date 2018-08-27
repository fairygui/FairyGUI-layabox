package fairygui.action
{
	import fairygui.Controller;
	import fairygui.GComponent;
	import fairygui.utils.ByteBuffer;

	public class ChangePageAction extends ControllerAction
	{
		public var objectId:String;
		public var controllerName:String;
		public var targetPage:String;
		
		public function ChangePageAction()
		{
		}
		
		override protected function enter(controller:Controller):void
		{	
			if(!controllerName)
				return;
			
			var gcom:GComponent;
			if(objectId)
				gcom = controller.parent.getChildById(objectId) as GComponent;
			else
				gcom = controller.parent;
			if(gcom)
			{
				var cc:Controller = gcom.getController(controllerName);
				if(cc && cc!=controller && !cc.changing)
					cc.selectedPageId = targetPage;
			}
		}

		override public function setup(buffer:ByteBuffer):void
		{
			super.setup(buffer);
			
			objectId = buffer.readS();
			controllerName = buffer.readS();
			targetPage = buffer.readS();
		}
	}
}