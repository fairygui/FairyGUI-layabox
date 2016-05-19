package fairygui
{
	public class ListLayoutType
	{
		public static const SingleColumn:int = 0;
		public static const SingleRow:int = 1;
		public static const FlowHorizontal:int = 2;
		public static const FlowVertical:int = 3;
		
		public function ListLayoutType()
		{
		}
		
		public static function parse(value:String):int
		{
			switch (value)
			{
				case "column":
					return SingleColumn;
				case "row":
					return SingleRow;
				case "flow_hz":
					return FlowHorizontal;
				case "flow_vt":
					return FlowVertical;
				default:
					return SingleColumn;
			}
		}
	}
}