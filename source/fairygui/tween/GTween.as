package fairygui.tween
{
	public class GTween
	{
		public static var catchCallbackExceptions:Boolean = true;
		
		public static function to(start:Number, end:Number, duration:Number):GTweener
		{
			return TweenManager.createTween()._to(start, end, duration);
		}
		
		public static function to2(start:Number, start2:Number, end:Number, end2:Number, duration:Number):GTweener
		{
			return TweenManager.createTween()._to2(start, start2, end, end2, duration);
		}

		public static function to3(start:Number, start2:Number, start3:Number, 
								   end:Number, end2:Number, end3:Number, duration:Number):GTweener
		{
			return TweenManager.createTween()._to3(start, start2, start3, end, end2, end3, duration);
		}
		
		public static function to4(start:Number, start2:Number, start3:Number, start4:Number, 
								   end:Number, end2:Number, end3:Number, end4:Number, duration:Number):GTweener
		{
			return TweenManager.createTween()._to4(start, start2, start3, start4, end, end2, end3, end4, duration);
		}
		
		public static function toColor(start:uint, end:uint, duration:Number):GTweener
		{
			return TweenManager.createTween()._toColor(start, end, duration);
		}
		
		public static function delayedCall(delay:Number):GTweener
		{
			return TweenManager.createTween().setDelay(delay);
		}
		
		public static function shake(startX:Number, startY:Number, amplitude:Number, duration:Number):GTweener
		{
			return TweenManager.createTween()._shake(startX, startY, amplitude, duration);
		}
		
		public static function isTweening(target:Object, propType:Object):Boolean
		{
			return TweenManager.isTweening(target, propType);
		}
		
		public static function kill(target:Object, complete:Boolean=false, propType:Object=null):void
		{
			TweenManager.killTweens(target, false, null);
		}
		
		public static function getTween(target:Object, propType:Object=null):GTweener
		{
			return TweenManager.getTween(target, propType);
		}
		
		public function GTween()
		{
		}
	}
}