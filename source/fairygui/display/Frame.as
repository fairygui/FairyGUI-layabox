package fairygui.display {
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	
	public class Frame {
		public var rect: Rectangle;
		public var addDelay: Number = 0;
		public var texture: Texture;
		
		public function Frame() {
			this.rect = new Rectangle();
		}
	}
}