package fairygui
{
	public class LoaderFillType
	{
		public static const None:int = 0;
		public static const Scale:int = 1;
		public static const ScaleMatchHeight:int = 2;
		public static const ScaleMatchWidth:int = 3;
		public static const ScaleFree:int = 4;
		public static const ScaleNoBorder:int = 5;
		
		public function LoaderFillType()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "none":
					return None;
				case "scale":
					return Scale;
				case "scaleMatchHeight":
					return ScaleMatchHeight;
				case "scaleMatchWidth":
					return ScaleMatchWidth;
				case "scaleFree":
					return ScaleFree;
				case "scaleNoBorder":
					return ScaleNoBorder;
				default:
					return None;
			}
		}
	}
}