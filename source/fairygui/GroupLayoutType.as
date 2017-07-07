package fairygui
{
	public class GroupLayoutType
	{
		public static const None:int = 0;
		public static const Horizontal:int = 1;
		public static const Vertical:int = 2;
		
		public function GroupLayoutType()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "none":
					return None;
				case "hz":
					return Horizontal;
				case "vt":
					return Vertical;
				default:
					return None;
			}
		}
	}
}