
package fairygui {
	
	public class UIObjectFactory {
		public static var packageItemExtensions: Object = {};
		private static var loaderType: Object;
		
		public static function setPackageItemExtension(url:String, type:Class):void
		{
			if (url == null)
				throw new Error("Invaild url: " + url);
			
			var pi:PackageItem = UIPackage.getItemByURL(url);
			if (pi != null)
				pi.extensionType = type;
			
			packageItemExtensions[url] = type;
		}
		
		public static function setLoaderExtension(type: *): void {
			UIObjectFactory.loaderType = type;
		}
		
		internal static function resolvePackageItemExtension(pi:PackageItem):void
		{
			pi.extensionType = packageItemExtensions["ui://" + pi.owner.id + pi.id];
			if(!pi.extensionType)
				pi.extensionType = packageItemExtensions["ui://" + pi.owner.name + "/" + pi.name];
		}
		
		public static function newObject(pi:PackageItem): GObject {
			if(pi.extensionType!=null)
				return new pi.extensionType(); 
			else
				return newObject2(pi.objectType);
		}
		
		/**
		 * @see ObjectType
		 */
		public static function newObject2(type: int): GObject {
			switch (type) {
				case ObjectType.Image:
					return new GImage();
					
				case ObjectType.MovieClip:
					return new GMovieClip();
					
				case ObjectType.Component:
					return new GComponent();
					
				case ObjectType.Text:
					return new GBasicTextField();
					
				case ObjectType.RichText:
					return new GRichTextField();
					
				case ObjectType.InputText:
					return new GTextInput();
					
				case ObjectType.Group:
					return new GGroup();
					
				case ObjectType.List:
					return new GList();
					
				case ObjectType.Graph:
					return new GGraph();
					
				case ObjectType.Loader:
					if (UIObjectFactory.loaderType != null)
						return new UIObjectFactory.loaderType();
					else
						return new GLoader();
					
				case ObjectType.Button:
					return new GButton();
					
				case ObjectType.Label:
					return new GLabel();
					
				case ObjectType.ProgressBar:
					return new GProgressBar();
					
				case ObjectType.Slider:
					return new GSlider();
					
				case ObjectType.ScrollBar:
					return new GScrollBar();
					
				case ObjectType.ComboBox:
					return new GComboBox();
					
				default:
					return null;
			}
		}
	}
}