package fairygui {
	import fairygui.display.Image;
	import fairygui.utils.ByteBuffer;
	import fairygui.gears.IColorGear;
	
	public class GImage extends GObject implements IColorGear {
		public var image: Image;
		
		private var _color: String;
		private var _flip: int;
		
		public function GImage() {
			super();
			this._color = "#FFFFFF";
		}
		
		public function get color(): String {
			return this._color;
		}
		
		public function set color(value: String):void {
			if(this._color != value) {
				this._color = value;
				this.updateGear(4);
				this.applyColor();
			}
		}
		
		private function applyColor():void {
			//not supported yet
		}
		
		/**
		 * @see FlipType
		 */
		public function get flip():int {
			return this._flip;
		}
		
		/**
		 * @see FlipType
		 */
		public function set flip(value:int):void {
			if(this._flip!=value) {
				this._flip = value;
				
				var sx:Number = 1, sy:Number = 1;
				if(this._flip == FlipType.Horizontal || this._flip == FlipType.Both)
					sx = -1;
				if(this._flip == FlipType.Vertical || this._flip == FlipType.Both)
					sy = -1;
				this.setScale(sx, sy);
				handleXYChanged();
			}
		}
		
		override protected function createDisplayObject(): void {
			this._displayObject = this.image = new Image();
			this.image.mouseEnabled = false;
			this._displayObject["$owner"] = this;
		}
		
		override public function constructFromResource(): void {
			this.packageItem.load();
			
			this.sourceWidth = this.packageItem.width;
			this.sourceHeight = this.packageItem.height;
			this.initWidth = this.sourceWidth;
			this.initHeight = this.sourceHeight;
			this.image.scale9Grid = this.packageItem.scale9Grid;
			this.image.scaleByTile = this.packageItem.scaleByTile;
			this.image.tileGridIndice = this.packageItem.tileGridIndice;
			this.image.tex = this.packageItem.texture;
			this.setSize(this.sourceWidth, this.sourceHeight);
		}
		
		override protected function handleXYChanged(): void {
			super.handleXYChanged();
			
			if(this._flip != FlipType.None)
			{
				if(this.scaleX==-1)
					this.image.x += this.width;
				if(this.scaleY==-1)
					this.image.y += this.height;
			}
		}
		
		override protected function handleSizeChanged(): void {
			if(this.image.tex!=null) {
				this.image.scaleTexture(this.width/this.sourceWidth, this.height/this.sourceHeight);
			}
		}
		
		override public function setup_beforeAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_beforeAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 5);
			
			if (buffer.readBool())
				this.color = buffer.readColorS();
			this.flip = buffer.readByte();

		}
	}
}