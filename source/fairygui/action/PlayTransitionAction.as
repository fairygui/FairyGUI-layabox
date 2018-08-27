package fairygui.action
{
	import fairygui.Controller;
	import fairygui.Transition;
	import fairygui.utils.ByteBuffer;

	public class PlayTransitionAction extends ControllerAction
	{
		public var transitionName:String;
		public var playTimes:int = 1;
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
					trans.changePlayTimes(playTimes);
				else
					trans.play(null, playTimes, delay);	
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
		
		override public function setup(buffer:ByteBuffer):void
		{
			super.setup(buffer);
			
			transitionName = buffer.readS();
			playTimes = buffer.getInt32();
			delay = buffer.getFloat32();
			stopOnExit = buffer.readBool();
		}
	}
}