package fairygui {
	import fairygui.display.Image;
	import fairygui.utils.ByteBuffer;
	import fairygui.gears.IColorGear;
	
	public class GImage extends GObject implements IColorGear {
		public var image: Image;
		
		private var _flip: int;
		
		public function GImage() {
			super();
		}
		
		public function get color(): String {
			return this.image.color;
		}
		
		public function set color(value: String):void {
			if(this.image.color != value) {
				this.image.color = value;
				this.updateGear(4);
			}
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
		
		public function get fillMethod():int
		{
			return image.fillMethod;
		}
		
		public function set fillMethod(value:int):void
		{
			image.fillMethod = value;
		}
		
		public function get fillOrigin():int
		{
			return image.fillOrigin;
		}
		
		public function set fillOrigin(value:int):void
		{
			image.fillOrigin = value;
		}
		
		public function get fillClockwise():Boolean
		{
			return image.fillClockwise;
		}
		
		public function set fillClockwise(value:Boolean):void
		{
			image.fillClockwise = value;
		}
		
		public function get fillAmount():Number
		{
			return image.fillAmount;
		}
		
		public function set fillAmount(value:Number):void
		{
			image.fillAmount = value;
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
			this.image.texture = this.packageItem.texture;
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
		

		override public function setup_beforeAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_beforeAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 5);
			
			if (buffer.readBool())
				this.color = buffer.readColorS();
			this.flip = buffer.readByte();
			this.image.fillMethod = buffer.readByte();
			if (this.image.fillMethod != 0)
			{
				this.image.fillOrigin = buffer.readByte();
				this.image.fillClockwise = buffer.readBool();
				this.image.fillAmount = buffer.getFloat32();
			}
		}
	}
}