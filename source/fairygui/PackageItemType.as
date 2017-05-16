package fairygui
{
	public class PackageItemType
	{
		public static const Image:int = 0;
		public static const Swf:int = 1;
		public static const MovieClip:int = 2;
		public static const Sound:int = 3;
		public static const Component:int = 4;
		public static const Misc:int = 5;
		public static const Font:int = 6;
		public static const Atlas:int = 7;
		
		public function PackageItemType()
		{
		}
		
		public static function parse(value:String):int
		{
			switch(value)
			{
				case "image":
					return Image;
				case "movieclip":
					return MovieClip;
				case "sound":
					return Sound;
				case "component":
					return Component;
				case "swf":
					return Swf;
				case "font":
					return Font;
				case "atlas":
					return Atlas;
			}
			return 0;
		}
	}
}
