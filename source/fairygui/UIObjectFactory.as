
package fairygui {
	
	public class UIObjectFactory {
		public static var packageItemExtensions: Object = {};
		private static var loaderType: Object;
		
		public function UIObjectFactory() {
		}
		
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
			switch (pi.type) {
				case PackageItemType.Image:
					return new GImage();
					
				case PackageItemType.MovieClip:
					return new GMovieClip();
					
				case PackageItemType.Component:
				{
					var cls:Object = pi.extensionType;
					if (cls)
						return new cls();                    
					
					var xml: Object = pi.owner.getItemAsset(pi);
					var extention: String = xml.getAttribute("extention");
					if(extention != null) {
						switch(extention) {
							case "Button":
								return new GButton();
								
							case "Label":
								return new GLabel();
								
							case "ProgressBar":
								return new GProgressBar();
								
							case "Slider":
								return new GSlider();
								
							case "ScrollBar":
								return new GScrollBar();
								
							case "ComboBox":
								return new GComboBox();
								
							default:
								return new GComponent();
						}
					}
					else
						return new GComponent();
				}
			}
			return null;
		}
		
		public static function newObject2(type: String): GObject {
			switch (type) {
				case "image":
					return new GImage();
					
				case "movieclip":
					return new GMovieClip();
					
				case "component":
					return new GComponent();
					
				case "text":
					return new GBasicTextField();
					
				case "richtext":
					return new GRichTextField();
					
				case "inputtext":
					return new GTextInput();
					
				case "group":
					return new GGroup();
					
				case "list":
					return new GList();
					
				case "graph":
					return new GGraph();
					
				case "loader":
					if (UIObjectFactory.loaderType != null)
						return new UIObjectFactory.loaderType();
					else
						return new GLoader();
			}
			return null;
		}
	}
}