package fairygui.action
{
	import fairygui.Controller;
	import fairygui.Transition;

	public class PlayTransitionAction extends ControllerAction
	{
		public var transitionName:String;
		public var repeat:int = 1;
		public var delay:Number = 0;
		public var stopOnExit:Boolean = false;
		
		private var _currentTransition:Transition;
		
		public function PlayTransitionAction()
		{
		}
		
		override protected function enter(controller:Controller):void
		{	
			var trans:Transition = controller.parent.getTransition(transitionName);
			if(trans)
			{
				if(_currentTransition && _currentTransition.playing)
					trans.changeRepeat(repeat);
				else
					trans.play(null, repeat, delay);	
				_currentTransition = trans;
			}
		}
		
		override protected function leave(controller:Controller):void
		{
			if(stopOnExit && _currentTransition)
			{
				_currentTransition.stop();
				_currentTransition = null;
			}
		}
		
		override public function setup(xml:Object):void
		{
			super.setup(xml);
			
			transitionName = xml.getAttribute("transition");
			
			var str:String;
			
			str = xml.getAttribute("repeat");
			if(str)
				repeat = parseInt(str);
			
			str = xml.getAttribute("delay");
			if(str)
				delay = parseFloat(str);
			
			stopOnExit = xml.getAttribute("stopOnExit")=="true";
		}
	}
}