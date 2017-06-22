package fairygui
{
	public class ChildrenRenderOrder
	{
		public static const Ascent:int = 0;
		public static const Descent:int = 1;
		public static const Arch:int = 2;
		
		public function ChildrenRenderOrder()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "ascent":
					return Ascent;
				case "descent":
					return Descent;
				case "arch":
					return Arch;
				default:
					return Ascent;
			}
		}
	}
}