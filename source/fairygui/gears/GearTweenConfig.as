package fairygui.gears
{
	import fairygui.tween.EaseType;
	import fairygui.tween.GTweener;

	public class GearTweenConfig
	{
		public var tween: Boolean;
		public var easeType: int;
		public var duration: Number;
		public var delay: Number;
		
		internal var _displayLockToken:Number;
		internal var _tweener:GTweener;
		
		public function GearTweenConfig()
		{
			tween = true;
			easeType = EaseType.QuadOut;
			duration = 0.3;
			delay = 0;
		}
	}
}