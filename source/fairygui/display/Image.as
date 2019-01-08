
package fairygui.display {
	import laya.display.Graphics;
	import laya.display.Sprite;
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	import laya.utils.Utils;
	
	public class Image extends Sprite {
		private var _source:Texture;
		protected var _scaleByTile:Boolean = false;
		protected var _scale9Grid:Rectangle = null;
		private var _tileGridIndice:int = 0;
		private var _needRebuild:int = 0;		
		protected var _fillMethod:int = 0;
		private var _fillOrigin:int = 0;
		private var _fillAmount:Number = 0;
		private var _fillClockwise:Boolean = false;
		private var _mask:Sprite = null;
		private var _color: String;
		
		public function Image() {
			super();
			
			this.mouseEnabled = false;
			this._color = "#FFFFFF";
		}
		
		override public function set width(value:Number):void {
			if (this._width !== value) {
				super.width = value;
				this.markChanged(1);
			}
		}
		
		override public function set height(value:Number):void {
			if (this._height !== value) {
				super.height = value;
				this.markChanged(1);
			}
		}
		
		override public function get texture():Texture {
			return _source;
		}
		
		override public function set texture(value:Texture):void {
			if(_source!=value)
			{
				_source = value;
				if(this.width==0)
				{
					if(_source)
						this.size(_source.width, _source.height);
					else
						this.size(0,0);
				}
				this.repaint();			
				this.markChanged(1);
			}
		}
		
		public function get scale9Grid(): Rectangle {
			return this._scale9Grid;
		}
		
		public function set scale9Grid(value:Rectangle):void {
			this._scale9Grid = value;
			this.markChanged(1);
		}
		
		public function get scaleByTile(): Boolean {
			return this._scaleByTile;
		}
		
		public function set scaleByTile(value:Boolean):void {
			if(this._scaleByTile!=value) {
				this._scaleByTile = value;
				this.markChanged(1);
			}
		}
		
		public function get tileGridIndice(): int {
			return this._tileGridIndice;
		}
		
		public function set tileGridIndice(value:int):void {
			if(this._tileGridIndice!=value) {
				this._tileGridIndice = value;
				this.markChanged(1);
			}
		}
		
		public function get fillMethod():int
		{
			return _fillMethod;
		}
		
		public function set fillMethod(value:int):void
		{
			if(_fillMethod!=value)
			{
				_fillMethod = value;
				if(_fillMethod!=0)
				{
					if(!_mask)
					{
						_mask = new Sprite();
						_mask.mouseEnabled = false;
					}
					this.mask = _mask;
					markChanged(2);
				}
				else if(this.mask)
				{
					_mask.graphics.clear();
					this.mask = null;
				}
			}
		}
		
		public function get fillOrigin():int
		{
			return _fillOrigin;
		}
		
		public function set fillOrigin(value:int):void
		{
			if(_fillOrigin!=value)
			{
				_fillOrigin = value;
				if(_fillMethod!=0)
					markChanged(2);
			}
		}
		
		public function get fillClockwise():Boolean
		{
			return _fillClockwise;
		}
		
		public function set fillClockwise(value:Boolean):void
		{
			if(_fillClockwise!=value)
			{
				_fillClockwise = value;
				if(_fillMethod!=0)
					markChanged(2);
			}
		}
		
		public function get fillAmount():Number
		{
			return _fillAmount;
		}
		
		public function set fillAmount(value:Number):void
		{
			if(_fillAmount!=value)
			{
				_fillAmount = value;
				if(_fillMethod!=0)
					markChanged(2);
			}
		}
		
		public function get color(): String {
			return this._color;
		}
		
		public function set color(value: String):void {
			if(this._color != value) {
				this._color = value;
			}
		}
		
		private function markChanged(flag:int):void {
			if(!this._needRebuild) {
				this._needRebuild = flag;
				
				Laya.timer.callLater(this, this.rebuild);
			}
			else
				this._needRebuild |= flag;
		}
		
		protected function rebuild():void {
			if((this._needRebuild & 1)!=0)
				doDraw();
			if((this._needRebuild & 2)!=0 && _fillMethod!=0)
				doFill();
			this._needRebuild = 0;
		}
		
		private function doDraw():void {
			var w:Number=this.width;
			var h:Number=this.height;
			var g:Graphics = this.graphics;
			var tex:Texture = this._source;
			
			g.clear();
			
			if(tex==null || w==0 || h==0)
			{
				return;
			}
			
			if(this._scaleByTile) {
				g.fillTexture(tex, 0, 0, w, h);
			}
			else if(this._scale9Grid!=null) {
				var tw:Number=tex.width;
				var th:Number=tex.height;
				var left:Number = this._scale9Grid.x;
				var right:Number = Math.max(tw - this._scale9Grid.right, 0);
				var top:Number = this._scale9Grid.y;
				var bottom:Number = Math.max(th - this._scale9Grid.bottom, 0);
				var tmp:Number;
				
				if (h >= (th - this._scale9Grid.height))
				{
					top = this._scale9Grid.y;
					bottom = th - this._scale9Grid.bottom;
				}
				else
				{
					tmp = this._scale9Grid.y / (th - this._scale9Grid.bottom);
					tmp = h * tmp / (1 + tmp);
					top = Math.round(tmp);
					bottom = h - tmp;
				}
				
				if (w >= (tw - this._scale9Grid.width))
				{
					left = this._scale9Grid.x;
					right = tw - this._scale9Grid.right;
				}
				else
				{
					tmp = this._scale9Grid.x / (tw - this._scale9Grid.right);
					tmp = w * tmp / (1 + tmp);
					left = Math.round(tmp);
					right = w - tmp;
				}
				var centerWidth:Number = Math.max(w - left - right,0);
				var centerHeight:Number = Math.max(h - top - bottom,0);
				
				//绘制四个角
				left && top && g.drawImage(Image.getTexture(tex, 0, 0, left, top), 0, 0, left, top);
				right && top && g.drawImage(Image.getTexture(tex, tw - right, 0, right, top), w - right, 0, right, top);
				left && bottom && g.drawImage(Image.getTexture(tex, 0, th - bottom, left, bottom), 0, h - bottom, left, bottom);
				right && bottom && g.drawImage(Image.getTexture(tex, tw - right, th - bottom, right, bottom), w - right, h - bottom, right, bottom);
				//绘制上下两个边
				centerWidth && top && drawTexture(0,Image.getTexture(tex, left, 0, tw - left - right, top), left, 0, centerWidth, top);				
				centerWidth && bottom && drawTexture(1,Image.getTexture(tex, left, th - bottom, tw - left - right, bottom), left, h - bottom, centerWidth, bottom);
				//绘制左右两边
				centerHeight && left && drawTexture(2,Image.getTexture(tex, 0, top, left, th - top - bottom), 0, top, left, centerHeight);
				centerHeight && right && drawTexture(3,Image.getTexture(tex, tw - right, top, right, th - top - bottom), w - right, top, right, centerHeight);
				//绘制中间
				centerWidth && centerHeight && drawTexture(4,Image.getTexture(tex, left, top, tw - left - right, th - top - bottom), left, top, centerWidth, centerHeight);
			}
			else {
				g.drawImage(tex, 0, 0, w, h);
			}
		}
		
		private function drawTexture(part:int, tex:Texture, x:Number, y:Number, width:Number = 0, height:Number = 0):void {
			if(part==-1 || (_tileGridIndice & (1<<part))==0)
				this.graphics.drawImage(tex, x, y, width, height);		
			else
				this.graphics.fillTexture(tex, x, y, width, height);
		}
		
		private static function getTexture(tex:Texture,x:Number,y:Number,width:Number,height:Number):Texture {            
			if (width <= 0) width = 1;
			if (height <= 0) height = 1;
			tex.$_GID || (tex.$_GID = Utils.getGID())
			//var key:String = tex.$_GID + "." + x + "." + y + "." + width + "." + height;
			//var texture:Texture = WeakObject.I.get(key);
			var texture:Texture;
			if (!texture||!texture._getSource()) {
				texture = Texture.createFromTexture(tex, x, y, width, height);
				//WeakObject.I.set(key, texture);
			}

			return texture;
		}
		
		private function doFill():void
		{
			var w:Number=this.width;
			var h:Number=this.height;
			var g:Graphics = _mask.graphics;
			g.clear();

			if(w==0 || h==0)
				return;
			
			var points:Array = FillUtils.fill(w, h, _fillMethod, _fillOrigin, _fillClockwise, _fillAmount);
			if(points==null)
			{
				//不知道为什么，不这样操作一下空白的遮罩不能生效
				this.mask = null;
				this.mask = this._mask;
				return;
			}
			
			g.drawPoly(0,0,points,"#FFFFFF");
		}
	}
}