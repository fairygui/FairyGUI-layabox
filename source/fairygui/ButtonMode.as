package fairygui
{
	public class ButtonMode
	{
		public static const Common:int = 0;
		public static const Check:int = 1;
		public static const Radio:int = 2;
		
		public function ButtonMode()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "Common":
					return Common;
				case "Check":
					return Check;
				case "Radio":
					return Radio;
				default:
					return Common;
			}
		}
	}
}