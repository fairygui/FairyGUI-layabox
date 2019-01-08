package fairygui {
	import fairygui.display.MovieClip;
	import fairygui.gears.IAnimationGear;
	import fairygui.gears.IColorGear;
	import fairygui.utils.ByteBuffer;
	import fairygui.utils.ToolSet;
	
	import laya.net.Loader;
	import laya.resource.Texture;
	import laya.utils.Handler;
	
	public class GLoader extends GObject implements IAnimationGear,IColorGear {
		private var _url: String;
		private var _align: String;
		private var _valign: String;
		private var _autoSize: Boolean;
		private var _fill: int;
		private var _shrinkOnly:Boolean;
		private var _showErrorSign: Boolean;

		private var _contentItem: PackageItem;
		private var _contentSourceWidth: Number = 0;
		private var _contentSourceHeight: Number = 0;
		private var _contentWidth: Number = 0;
		private var _contentHeight: Number = 0;
		
		private var _content:MovieClip;
		private var _errorSign: GObject;
		private var _content2:GComponent;
		
		private var _updatingLayout: Boolean;
		
		private static var _errorSignPool: GObjectPool = new GObjectPool();
		
		public function GLoader () {
			super();
			this._url = "";
			this._fill = LoaderFillType.None;
			this._align = "left";
			this._valign = "top";
			this._showErrorSign = true;
		}
		
		override protected function createDisplayObject(): void {
			super.createDisplayObject();
			
			this._content = new MovieClip();
			this._displayObject.addChild(this._content);	
			this._displayObject.mouseEnabled = true;
		}
		
		override public function dispose(): void {
			if(this._contentItem == null && this._content.texture!=null) {
				this.freeExternal(this._content.texture);
			}
			
			if(_content2!=null)
				_content2.dispose();
			
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
		
		/**
		 * @see LoaderFillType
		 */
		public function get fill(): int {
			return this._fill;
		}
		
		/**
		 * @see LoaderFillType
		 */
		public function set fill(value: int):void {
			if (this._fill != value) {
				this._fill = value;
				this.updateLayout();
			}
		}
		
		public function get shrinkOnly():Boolean
		{
			return _shrinkOnly;
		}
		
		public function set shrinkOnly(value:Boolean):void
		{
			if(_shrinkOnly!=value)
			{
				_shrinkOnly = value;
				updateLayout();
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
			return _content.playing;
		}
		
		public function set playing(value: Boolean):void {
			if (_content.playing != value) {
				_content.playing = value;
				this.updateGear(5);
			}
		}
		
		public function get frame(): Number {
			return _content.frame;
		}
		
		public function set frame(value: Number):void {
			if (_content.frame != value) {
				_content.frame = value;
				this.updateGear(5);
			}
		}
		
		final public function get timeScale():Number
		{
			return _content.timeScale;
		}
		
		public function set timeScale(value:Number):void
		{
			_content.timeScale = value;
		}
		
		public function advance(timeInMiniseconds:int):void
		{
			_content.advance(timeInMiniseconds);
		}
		
		public function get color(): String {
			return _content.color;
		}
		
		public function set color(value: String):void {
			if(_content.color != value) {
				_content.color = value;
				this.updateGear(4);
			}
		}
		
		public function get showErrorSign(): Boolean {
			return this._showErrorSign;
		}
		
		public function set showErrorSign(value: Boolean):void {
			this._showErrorSign = value;
		}
		
		public function get content(): MovieClip {
			return this._content;
		}
		
		public function get component():GComponent
		{
			return _content2;
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
						this._content.texture = this._contentItem.texture;
						this._content.scale9Grid = this._contentItem.scale9Grid;
						this._content.scaleByTile = this._contentItem.scaleByTile;
						this._content.tileGridIndice =  this._contentItem.tileGridIndice;
						this._contentSourceWidth = this._contentItem.width;
						this._contentSourceHeight = this._contentItem.height;
						this.updateLayout();
					}
				}
				else if(this._contentItem.type == PackageItemType.MovieClip) {
					this._contentSourceWidth = this._contentItem.width;
					this._contentSourceHeight = this._contentItem.height;
					this._content.interval = this._contentItem.interval;
					this._content.swing = this._contentItem.swing;
					this._content.repeatDelay = this._contentItem.repeatDelay;
					this._content.frames = this._contentItem.frames;
					this.updateLayout();
				}
				else if(_contentItem.type==PackageItemType.Component)
				{
					var obj:GObject = UIPackage.createObjectFromURL(itemURL);
					if(!obj)
						setErrorState();
					else if(!(obj is GComponent))
					{
						obj.dispose();
						setErrorState();
					}
					else
					{
						_content2 = obj.asCom;
						this._displayObject.addChild(_content2.displayObject);
						_contentSourceWidth = _contentItem.width;
						_contentSourceHeight = _contentItem.height;
						updateLayout();
					}
				}
				else
					this.setErrorState();
			}
			else
				this.setErrorState();
		}
		
		protected function loadExternal(): void {
			AssetProxy.inst.load(this._url, Handler.create(this, this.__getResCompleted), null, Loader.IMAGE);
		}
		
		protected function freeExternal(texture: Texture): void {
		}        
		
		protected function onExternalLoadSuccess(texture: Texture): void {
			this._content.texture = texture;
			this._content.scale9Grid = null;
			this._content.scaleByTile = false;
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
			if (_content2==null &&  _content.texture == null && _content.frames==null) {
				if (this._autoSize) {
					this._updatingLayout = true;
					this.setSize(50, 30);
					this._updatingLayout = false;
				}
				return;
			}
			
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
				{
					if(_content2!=null)
					{
						_content2.setXY(0, 0);
						_content2.setScale(1, 1);
					}
					else
						_content.pos(0, 0);
					return;
				}
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
					
					if(_shrinkOnly)
					{
						if(sx>1)
							sx = 1;
						if(sy>1)
							sy = 1;
					}
					
					_contentWidth = _contentSourceWidth * sx;
					_contentHeight = _contentSourceHeight * sy;
				}
			}
			
			if(_content2!=null)
				_content2.setScale(sx, sy);
			else
				_content.size(_contentWidth, _contentHeight);
			
			var nx:Number, ny:Number;
			if (this._align == "center")
				nx = Math.floor((this.width - this._contentWidth) / 2);
			else if (this._align == "right")
				nx = this.width - this._contentWidth;
			else
				nx = 0;
			if (this._valign == "middle")
				ny = Math.floor((this.height - this._contentHeight) / 2);
			else if (this._valign == "bottom")
				ny = this.height - this._contentHeight;
			else
				ny = 0;
			
			if(_content2!=null)
				_content2.setXY(nx, ny);
			else
				_content.pos(nx, ny);
		}
		
		private function clearContent(): void {
			this.clearErrorState();
			
			if(this._contentItem == null && this._content.texture!=null) {
				this.freeExternal(this._content.texture);
			}
			this._content.texture = null;
			this._content.frames = null;
			
			if(_content2!=null)
			{
				_content2.dispose();
				_content2 = null;
			}
			
			this._contentItem = null;
		}
		
		override protected function handleSizeChanged(): void {
			super.handleSizeChanged();
			
			if(!this._updatingLayout)
				this.updateLayout();
		}
		
		override public function setup_beforeAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_beforeAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 5);
			
			var iv:int;
			
			_url = buffer.readS();
			iv = buffer.readByte();
			_align = iv==0?"left":(iv==1?"center":"right");
			iv = buffer.readByte();
			_valign = iv==0?"top":(iv==1?"middle":"bottom");
			_fill = buffer.readByte();
			_shrinkOnly = buffer.readBool();
			_autoSize = buffer.readBool();
			_showErrorSign = buffer.readBool();
			_content.playing = buffer.readBool();
			_content.frame = buffer.getInt32();
			
			if (buffer.readBool())
				this.color = buffer.readColorS();
			var fillMethod:int = buffer.readByte();
			if (fillMethod != 0)
				buffer.skip(6);
			
			if (_url)
				loadContent();
		}
	}
}