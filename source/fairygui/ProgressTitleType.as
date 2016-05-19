package fairygui
{
	public class ProgressTitleType
	{
		public static const Percent:int = 0;
		public static const ValueAndMax:int = 1;
		public static const Value:int = 2;
		public static const Max:int = 3;
		
		public function ProgressTitleType()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "percent":
					return Percent;
				case "valueAndmax":
					return ValueAndMax;
				case "value":
					return Value;
				case "max":
					return Max;
				default:
					return Percent;
			}
		}
	}
}

