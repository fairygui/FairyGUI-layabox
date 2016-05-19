package fairygui {
	import fairygui.display.Image;
	import fairygui.utils.ToolSet;
	
    public class GImage extends GObject implements IColorGear {
        public var image: Image;
        
        private var _color: String;
        private var _flip: int;
        
        private var _gearColor: GearColor;

        public function GImage() {
            super();
            this._color = "#FFFFFF";
            this._gearColor = new GearColor(this);
        }
        
        public function get color(): String {
            return this._color;
        }
        
        public function set color(value: String):void {
            if(this._color != value) {
                this._color = value;
                if(this._gearColor.controller != null)
                    this._gearColor.updateState();

                this.applyColor();
            }
        }
        
        private function applyColor():void {
            //not supported yet
        }
        
        public function get flip():int {
            return this._flip;
        }
        
        public function set flip(value:int):void {
            if(this._flip!=value) {
                this._flip = value;
                this.image.scaleX = this.image.scaleY = 1;  
                if(this._flip == FlipType.Horizontal || this._flip == FlipType.Both)
                    this.image.scaleX = -1;
                if(this._flip == FlipType.Vertical || this._flip == FlipType.Both)
                    this.image.scaleY = -1;
                this.handleXYChanged();
            }
        }
        
        public function get gearColor(): GearColor {
            return this._gearColor;
        }

		override public function handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if(this._gearColor.controller == c)
                this._gearColor.apply();
        }
        
		override protected function createDisplayObject(): void {
            this._displayObject = this.image = new Image();
            this._displayObject["$owner"] = this;
        }

		override public function constructFromResource(pkgItem: PackageItem): void {
            this._packageItem = pkgItem;
            pkgItem.load();
            
            this._sourceWidth = this._packageItem.width;
            this._sourceHeight = this._packageItem.height;
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;
            this.image.scale9Grid = pkgItem.scale9Grid;
            this.image.scaleByTile = pkgItem.scaleByTile;
            this.image.texture = pkgItem.texture;
            this.setSize(this._sourceWidth, this._sourceHeight);
        }
        
		override protected function handleXYChanged(): void {
            super.handleXYChanged();
            if(this.image.scaleX==-1)
                this.image.x += this.width;
            if(this.image.scaleY==-1)
                this.image.y += this.height;
        }

		override protected function handleSizeChanged(): void {
            if(this.image.texture!=null) {
                this.image.scale(Math.abs(this.scaleX), Math.abs(this.scaleY));
                this.image.scaleTexture(this.width/this._sourceWidth, this.height/this._sourceHeight);
            }
        }
        
		override public function setup_beforeAdd(xml: Object): void {
            super.setup_beforeAdd(xml);

            var str: String;
            str = xml.getAttribute("color");
            if(str)
                this.color = str;
                
            str = xml.getAttribute("flip");
            if(str)
                this.flip = FlipType.parse(str);	
        }
        
		override public function setup_afterAdd(xml: Object): void {
            super.setup_afterAdd(xml);

            var cxml:Object = ToolSet.findChildNode(xml, "gearColor");
            if(cxml)
                this._gearColor.setup(cxml);
        }
    }
}