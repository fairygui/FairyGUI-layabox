package fairygui.action
{
	import fairygui.Controller;

	public class ControllerAction
	{
		public var fromPage:Array;
		public var toPage:Array;
		
		public static function createAction(type:String):ControllerAction
		{
			switch(type)
			{
				case "play_transition":
					return new PlayTransitionAction();
					
				case "change_page":
					return new ChangePageAction();
			}
			return null;
		}
		
		public function ControllerAction()
		{
		}
		
		public function run(controller:Controller, prevPage:String, curPage:String):void
		{
			if((fromPage==null || fromPage.length==0 || fromPage.indexOf(prevPage)!=-1) 
				&& (toPage==null || toPage.length==0 || toPage.indexOf(curPage)!=-1))
				enter(controller);
			else
				leave(controller);
		}
		
		protected function enter(controller:Controller):void
		{
			
		}
		
		protected function leave(controller:Controller):void
		{
			
		}
		
		public function setup(xml:Object):void
		{
			var str:String;
			
			str = xml.getAttribute("fromPage");
			if(str)
				fromPage = str.split(",");
			
			str = xml.getAttribute("toPage");
			if(str)
				toPage = str.split(",");
		}
	}
}