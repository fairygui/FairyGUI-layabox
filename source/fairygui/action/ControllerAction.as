package fairygui.action
{
	import fairygui.Controller;
	import fairygui.utils.ByteBuffer;

	public class ControllerAction
	{
		public var fromPage:Array;
		public var toPage:Array;
		
		public static function createAction(type:int):ControllerAction
		{
			switch(type)
			{
				case 0:
					return new PlayTransitionAction();
					
				case 1:
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
		
		public function setup(buffer:ByteBuffer):void
		{
			var cnt:int;
			var i:int;
			
			cnt = buffer.getInt16();
			fromPage = [];
			for (i = 0; i < cnt; i++)
				fromPage[i] = buffer.readS();
			
			cnt = buffer.getInt16();
			toPage = [];
			for (i = 0; i < cnt; i++)
				toPage[i] = buffer.readS();
		}
	}
}