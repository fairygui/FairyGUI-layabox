package fairygui
{
	public class ScrollBarDisplayType
	{
		public static const Default:int = 0;
		public static const Visible:int = 1;
		public static const Auto:int = 2;
		public static const Hidden:int = 3;
		
		public function ScrollBarDisplayType()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "default":
					return Default;
				case "visible":
					return Visible;
				case "auto":
					return Auto;
				case "hidden":
					return Hidden;
				default:
					return Default;
			}
		}
	}
}