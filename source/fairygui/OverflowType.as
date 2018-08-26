package fairygui
{
	public class OverflowType
	{
		public static const Visible:int = 0;
		public static const Hidden:int = 1;
		public static const Scroll:int = 2;
		
		public function OverflowType()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "visible":
					return Visible;
				case "hidden":
					return Hidden;
				case "scroll":
					return Scroll;
				default:
					return Visible;
			}
		}
	}
}