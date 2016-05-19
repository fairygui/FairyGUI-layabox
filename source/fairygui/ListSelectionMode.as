package fairygui
{
	public class ListSelectionMode
	{
		public static const Single:int = 0;
		public static const Multiple:int = 1;
		public static const Multiple_SingleClick:int = 2;
		public static const None:int = 3;
		
		public function ListSelectionMode()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "single":
					return Single;
				case "multiple":
					return Multiple;
				case "multipleSingleClick":
					return Multiple_SingleClick;
				case "none":
					return None;
				default:
					return Single;
			}
		}
	}
}