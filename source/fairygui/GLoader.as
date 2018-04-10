package fairygui {
	import fairygui.display.Image;
	import fairygui.display.MovieClip;
	import fairygui.utils.ToolSet;
	
	import laya.display.Node;
	import laya.display.Sprite;
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	import laya.utils.Handler;
	
	public class GLoader extends GObject implements IAnimationGear,IColorGear {
		private var _url: String;
		private var _align: String;
		private var _valign: String;
		private var _autoSize: Boolean;
		private var _fill: int;
		private var _showErrorSign: Boolean;
		private var _playing: Boolean;
		private var _frame: Number = 0;
		private var _color: String;
		
		private var _contentItem: PackageItem;
		private var _contentSourceWidth: Number = 0;
		private var _contentSourceHeight: Number = 0;
		private var _contentWidth: Number = 0;
		private var _contentHeight: Number = 0;
		
		private var _content:Sprite;
		private var _errorSign: GObject;
		
		private var _updatingLayout: Boolean;
		
		private static var _errorSignPool: GObjectPool = new GObjectPool();
		
		public function GLoader () {
			super();
			this._playing = true;
			this._url = "";
			this._fill = LoaderFillType.None;
			this._align = "left";
			this._valign = "top";
			this._showErrorSign = true;
			this._color = "#FFFFFF";
		}
		
		override protected function createDisplayObject(): void {
			super.createDisplayObject();
			
			this._displayObject.mouseEnabled = true;
		}
		
		override public function dispose(): void {
			if(this._contentItem == null && (this._content is Image)) {
				var texture: Texture = Image(this._content).tex;
				if(texture != null)
					this.freeExternal(texture);
			}
			
			super.dispose();
		}
		
		public function get url(): String {
			return this._url;
		}
		
		public function set url(value: String):void {
			if (this._url == value)
				return;
			
			this._url = value;
			this.loadContent();
			updateGear(7);
		}
		
		override public function get icon():String
		{
			return _url;
		}
		
		override public function set icon(value:String):void
		{
			this.url = value;
		}
		
		public function get align(): String {
			return this._align;
		}
		
		public function set align(value: String):void {
			if (this._align != value) {
				this._align = value;
				this.updateLayout();
			}
		}
		
		public function get verticalAlign(): String {
			return this._valign;
		}
		
		public function set verticalAlign(value: String):void {
			if (this._valign != value) {
				this._valign = value;
				this.updateLayout();
			}
		}
		
		public function get fill(): int {
			return this._fill;
		}
		
		public function set fill(value: int):void {
			if (this._fill != value) {
				this._fill = value;
				this.updateLayout();
			}
		}
		
		public function get autoSize(): Boolean {
			return this._autoSize;
		}
		
		public function set autoSize(value: Boolean):void {
			if (this._autoSize != value) {
				this._autoSize = value;
				this.updateLayout();
			}
		}
		
		public function get playing(): Boolean {
			return this._playing;
		}
		
		public function set playing(value: Boolean):void {
			if (this._playing != value) {
				this._playing = value;
				if (this._content is MovieClip)
					MovieClip(this._content).playing = value;
				this.updateGear(5);
			}
		}
		
		public function get frame(): Number {
			return this._frame;
		}
		
		public function set frame(value: Number):void {
			if (this._frame != value) {
				this._frame = value;
				if (this._content is MovieClip)
					MovieClip(this._content).currentFrame = value;
				this.updateGear(5);
			}
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
		
		private function applyColor(): void {
			//todo:
		}
		
		public function get showErrorSign(): Boolean {
			return this._showErrorSign;
		}
		
		public function set showErrorSign(value: Boolean):void {
			this._showErrorSign = value;
		}
		
		public function get content(): Node {
			return this._content;
		}
		
		protected function loadContent(): void {
			this.clearContent();
			
			if (!this._url)
				return;
			
			if(ToolSet.startsWith(this._url,"ui://"))
				this.loadFromPackage(this._url);
			else
				this.loadExternal();
		}
		
		protected function loadFromPackage(itemURL: String):void {
			this._contentItem = UIPackage.getItemByURL(itemURL);
			if(this._contentItem != null) {
				this._contentItem.load();
				
				if(_autoSize)
					this.setSize(_contentItem.width, _contentItem.height);
				
				if(this._contentItem.type == PackageItemType.Image) {
					if(this._contentItem.texture == null) {
						this.setErrorState();
					}
					else {
						if(!(this._content is Image)) {
							this._content = new Image();
							this._displayObject.addChild(this._content);
						}
						else
							this._displayObject.addChild(this._content);
						Image(this._content).tex = this._contentItem.texture;
						Image(this._content).scale9Grid = this._contentItem.scale9Grid;
						Image(this._content).scaleByTile = this._contentItem.scaleByTile;
						Image(this._content).tileGridIndice =  this._contentItem.tileGridIndice;
						this._contentSourceWidth = this._contentItem.width;
						this._contentSourceHeight = this._contentItem.height;
						this.updateLayout();
					}
				}
				else if(this._contentItem.type == PackageItemType.MovieClip) {
					if(!(this._content is MovieClip)) {
						this._content = new MovieClip();
						this._displayObject.addChild(this._content);
					}
					else
						this._displayObject.addChild(this._content);
					this._contentSourceWidth = this._contentItem.width;
					this._contentSourceHeight = this._contentItem.height;
					MovieClip(this._content).interval = this._contentItem.interval;
					MovieClip(this._content).swing = this._contentItem.swing;
					MovieClip(this._content).repeatDelay = this._contentItem.repeatDelay;
					MovieClip(this._content).frames = this._contentItem.frames;
					MovieClip(this._content).boundsRect = new Rectangle(0,0,this._contentSourceWidth,this._contentSourceHeight);
					this.updateLayout();
				}
				else
					this.setErrorState();
			}
			else
				this.setErrorState();
		}
		
		protected function loadExternal(): void {
			AssetProxy.inst.load(this._url, Handler.create(this, this.__getResCompleted));
		}
		
		protected function freeExternal(texture: Texture): void {
		}        
		
		protected function onExternalLoadSuccess(texture: Texture): void {
			if(!(this._content is Image)) {
				this._content = new Image();
				this._displayObject.addChild(this._content);
			}
			else
				this._displayObject.addChild(this._content);
			Image(this._content).tex = texture;
			Image(this._content).scale9Grid = null;
			Image(this._content).scaleByTile = false;
			this._contentSourceWidth = texture.width;
			this._contentSourceHeight = texture.height;
			this.updateLayout();
		}
		
		protected function onExternalLoadFailed(): void {
			this.setErrorState();
		}
		
		private function __getResCompleted(tex:Texture): void {
			if(tex!=null)
				this.onExternalLoadSuccess(tex);
			else
				this.onExternalLoadFailed();
		}
		
		private function setErrorState(): void {
			if (!this._showErrorSign)
				return;
			
			if (this._errorSign == null) {
				if (fairygui.UIConfig.loaderErrorSign != null) {
					this._errorSign = GLoader._errorSignPool.getObject(fairygui.UIConfig.loaderErrorSign);
				}
			}
			
			if (this._errorSign != null) {
				this._errorSign.setSize(this.width, this.height);
				this._displayObject.addChild(this._errorSign.displayObject);
			}
		}
		
		private function clearErrorState(): void {
			if (this._errorSign != null) {
				this._displayObject.removeChild(this._errorSign.displayObject);
				GLoader._errorSignPool.returnObject(this._errorSign);
				this._errorSign = null;
			}
		}
		
		private function updateLayout(): void {
			if (this._content == null) {
				if (this._autoSize) {
					this._updatingLayout = true;
					this.setSize(50, 30);
					this._updatingLayout = false;
				}
				return;
			}
			
			this._content.x = 0;
			this._content.y = 0;
			this._content.scaleX = 1;
			this._content.scaleY = 1;
			this._contentWidth = this._contentSourceWidth;
			this._contentHeight = this._contentSourceHeight;
			
			if (this._autoSize) {
				this._updatingLayout = true;
				if (this._contentWidth == 0)
					this._contentWidth = 50;
				if (this._contentHeight == 0)
					this._contentHeight = 30;
				this.setSize(this._contentWidth, this._contentHeight);
				this._updatingLayout = false;
				
				if(_contentWidth==_width && _contentHeight==_height)
					return;
			}

			var sx: Number = 1, sy: Number = 1;
			if(_fill!=LoaderFillType.None)
			{
				sx = this.width/_contentSourceWidth;
				sy = this.height/_contentSourceHeight;
				
				if(sx!=1 || sy!=1)
				{
					if (_fill == LoaderFillType.ScaleMatchHeight)
						sx = sy;
					else if (_fill == LoaderFillType.ScaleMatchWidth)
						sy = sx;
					else if (_fill == LoaderFillType.Scale)
					{
						if (sx > sy)
							sx = sy;
						else
							sy = sx;
					}
					else if (_fill == LoaderFillType.ScaleNoBorder)
					{
						if (sx > sy)
							sy = sx;
						else
							sx = sy;
					}
					_contentWidth = _contentSourceWidth * sx;
					_contentHeight = _contentSourceHeight * sy;
				}
			}
			
			if (this._content is Image)
				Image(this._content).scaleTexture(sx, sy);
			else
				this._content.scale(sx, sy);
			
			if (this._align == "center")
				this._content.x = Math.floor((this.width - this._contentWidth) / 2);
			else if (this._align == "right")
				this._content.x = this.width - this._contentWidth;
			if (this._valign == "middle")
				this._content.y = Math.floor((this.height - this._contentHeight) / 2);
			else if (this._valign == "bottom")
				this._content.y = this.height - this._contentHeight;
		}
		
		private function clearContent(): void {
			this.clearErrorState();
			
			if (this._content != null && this._content.parent != null)
				this._displayObject.removeChild(this._content);
			
			if(this._contentItem == null && (this._content is Image)) {
				var texture: Texture = Image(this._content).tex;
				if(texture != null)
					this.freeExternal(texture);
			}
			
			this._contentItem = null;
		}
		
		override protected function handleSizeChanged(): void {
			super.handleSizeChanged();
			
			if(!this._updatingLayout)
				this.updateLayout();
		}
		
		override public function setup_beforeAdd(xml: Object): void {
			super.setup_beforeAdd(xml);
			
			var str: String;
			str = xml.getAttribute("url");
			if (str)
				this._url = str;
			
			str = xml.getAttribute("align");
			if (str)
				this._align = str;
			
			str = xml.getAttribute("vAlign");
			if (str)
				this._valign = str;
			
			str = xml.getAttribute("fill");
			if (str)
				this._fill = LoaderFillType.parse(str);
			
			this._autoSize = xml.getAttribute("autoSize") == "true";
			
			str = xml.getAttribute("errorSign");
			if (str)
				this._showErrorSign = str == "true";
			
			this._playing = xml.getAttribute("playing") != "false";
			
			str = xml.getAttribute("color");
			if(str)
				this.color = str;
			
			if (this._url)
				this.loadContent();
		}
	}
}