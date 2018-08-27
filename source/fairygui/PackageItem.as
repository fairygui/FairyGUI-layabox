package fairygui {
	import fairygui.display.BitmapFont;
	import fairygui.display.Frame;
	import fairygui.utils.ByteBuffer;
	import fairygui.utils.PixelHitTestData;
	
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	
	public class PackageItem {
		public var owner: UIPackage;
		
		public var type: int;
		public var objectType: int;
		
		public var id: String;
		public var name: String;
		public var width: Number = 0;
		public var height: Number = 0;
		public var file: String;
		public var decoded: Boolean;
		public var rawData: ByteBuffer;
		
		//image
		public var scale9Grid: Rectangle;
		public var scaleByTile: Boolean;
		public var tileGridIndice:int = 0;
		public var smoothing: Boolean;
		public var texture: Texture;
		public var pixelHitTestData: PixelHitTestData;
		
		//movieclip
		public var interval: Number = 0;
		public var repeatDelay: Number = 0;
		public var swing:Boolean;
		public var frames:Vector.<Frame>;
		
		//componenet
		public var extensionType: Object;
		
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