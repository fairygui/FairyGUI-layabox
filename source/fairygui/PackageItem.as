package fairygui {
	import fairygui.display.BitmapFont;
	
	import laya.maths.Rectangle;
	import laya.media.Sound;
	import laya.resource.Texture;
	
	public class PackageItem {
		public var owner: UIPackage;
		
		public var type: int;
		public var id: String;
		public var name: String;
		public var width: Number = 0;
		public var height: Number = 0;
		public var file: String;
		public var decoded: Boolean;
		
		//image
		public var scale9Grid: Rectangle;
		public var scaleByTile: Boolean;
		public var tileGridIndice:int = 0;
		public var smoothing: Boolean;
		public var texture: Texture;
		
		//movieclip
		public var interval: Number = 0;
		public var repeatDelay: Number = 0;
		public var swing: Boolean;
		public var frames: Array;
		
		//componenet
		public var componentData: Object;
		public var displayList:Vector.<DisplayListItem>;
		public var extensionType: Object;
		
		//sound
		public var sound: Sound;
		
		//font 
		public var bitmapFont: BitmapFont;
		
		public function PackageItem() {
		}
		
		public function load(): Object {
			return this.owner.getItemAsset(this);
		}
		
		public function toString(): String {
			return this.name;
		}
	}
}