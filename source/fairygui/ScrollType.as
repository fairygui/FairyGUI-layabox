package fairygui
{
	public class ScrollType
	{
		public static const Horizontal:int = 0;
		public static const Vertical:int = 1;
		public static const Both:int = 2;
		
		public function ScrollType()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "horizontal":
					return Horizontal;
				case "vertical":
					return Vertical;
				case "both":
					return Both;
				default:
					return Vertical;
			}
		}
	}
}