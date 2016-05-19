package fairygui
{
	public class FillType
	{
		public static const None:int = 0;
		public static const Scale:int = 3;
		public static const ScaleFree:int = 4;
		
		public function FillType()
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
				case "scaleFree":
					return ScaleFree;
				default:
					return None;
			}
		}
	}
}