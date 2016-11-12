package fairygui
{
	public class DisplayListItem
	{
		public var packageItem:PackageItem;
		public var type:String;
		public var desc:Object;
		public var listItemCount:int;
		
		public function DisplayListItem(packageItem:PackageItem, type:String)
		{
			this.packageItem = packageItem;
			this.type = type;
		}
	}
}