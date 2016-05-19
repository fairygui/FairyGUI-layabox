package fairygui
{
	public class FlipType
	{
		public static const None:int = 0;
		public static const Horizontal:int = 1;
		public static const Vertical:int = 2;
		public static const Both:int = 3;
		
		public function FlipType()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "hz":
					return FlipType.Horizontal;
				case "vt":
					return FlipType.Vertical;
				case "both":
					return FlipType.Both;
				default:
					return FlipType.None;
			}
		}
	}
}