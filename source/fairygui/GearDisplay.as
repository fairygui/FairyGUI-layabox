package fairygui
{
	
	public class GearDisplay extends GearBase
	{
		public var pages:Array;
		
		private var _visible:int = 0;
		
		public function GearDisplay(owner:GObject)
		{
			super(owner);
			_displayLockToken = 1;
		}
		
		override protected function init():void
		{
			pages = null;
		}
		
		public function addLock():uint
		{
			_visible++;
			return _displayLockToken;
		}
		
		public function releaseLock(token:uint):void
		{
			if(token==_displayLockToken)
				_visible--;
		}
		
		public function get connected():Boolean
		{
			return _controller==null || _visible>0;
		}
		
		override public function apply():void
		{
			_displayLockToken++;
			if(_displayLockToken<=0)
				_displayLockToken = 1;
			
			if(pages==null || pages.length==0 
				|| pages.indexOf(_controller.selectedPageId)!=-1)
				_visible = 1;
			else
				_visible = 0;
		}
	}
}
