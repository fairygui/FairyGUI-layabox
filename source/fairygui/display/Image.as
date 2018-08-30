
package fairygui.display {
	import laya.display.Graphics;
	import laya.display.Sprite;
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	import laya.utils.Utils;
	import laya.utils.WeakObject;
	
	public class Image extends Sprite {
		private var _tex:Texture = null;
		private var _scaleByTile:Boolean = false;
		private var _scale9Grid:Rectangle = null;
		private var _tileGridIndice:int = 0;
		private var _textureScaleX:Number = 1;
		private var _textureScaleY:Number = 1;
		private var _needRebuild:Boolean = false;
		
		public function Image() {
			super();
			
			this.mouseEnabled = false;
		}
		
		public function get tex(): Texture {
			return this._tex;
		}
		
		public function set tex(value:Texture):void {
			if(this._tex!=value) {
				this._tex = value;
				if(this._tex)
					this.size(this._tex.width* this._textureScaleX, this._tex.height* this._textureScaleY);
				else
					this.size(0,0);
				this.markChanged();
			}
		}
		
		public function scaleTexture(sx:Number, sy:Number):void {
			if(this._textureScaleX!=sx || this._textureScaleY!=sy) {
				this._textureScaleX = sx;
				this._textureScaleY = sy;
				if(this._tex)
					this.size(this._tex.width*sx, this._tex.height*sy);
				this.markChanged();
			}
		}
		
		public function get scale9Grid(): Rectangle {
			return this._scale9Grid;
		}
		
		public function set scale9Grid(value:Rectangle):void {
			this._scale9Grid = value;
			this.markChanged();
		}
		
		public function get scaleByTile(): Boolean {
			return this._scaleByTile;
		}
		
		public function set scaleByTile(value:Boolean):void {
			if(this._scaleByTile!=value) {
				this._scaleByTile = value;
				this.markChanged();
			}
		}
		
		public function get tileGridIndice(): int {
			return this._tileGridIndice;
		}
		
		public function set tileGridIndice(value:int):void {
			if(this._tileGridIndice!=value) {
				this._tileGridIndice = value;
				this.markChanged();
			}
		}
		
		private function markChanged():void {
			if(!this._needRebuild) {
				this._needRebuild = true;
				
				Laya.timer.callLater(this, this.rebuild);
			}
		}
		
		private function rebuild():void {
			this._needRebuild = false;
			var w:Number=this.width;
			var h:Number=this.height;
			var tw:Number=this._tex.width;
			var th:Number=this._tex.height;
			var g:Graphics  = this.graphics;
			
			if(this._tex==null || w==0 || h==0)
			{
				g.clear();
				return;
			}

			if(this._scaleByTile) {
				g.clear();
				g.fillTexture(this._tex, 0, 0, w, h);
			}
			else if(this._scale9Grid!=null) {
				g.clear();
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
				left && top && g.drawTexture(Image.getTexture(this._tex, 0, 0, left, top), 0, 0, left, top);
				right && top && g.drawTexture(Image.getTexture(this._tex, tw - right, 0, right, top), w - right, 0, right, top);
				left && bottom && g.drawTexture(Image.getTexture(this._tex, 0, th - bottom, left, bottom), 0, h - bottom, left, bottom);
				right && bottom && g.drawTexture(Image.getTexture(this._tex, tw - right, th - bottom, right, bottom), w - right, h - bottom, right, bottom);
				//绘制上下两个边
				centerWidth && top && drawTexture(0,Image.getTexture(this._tex, left, 0, tw - left - right, top), left, 0, centerWidth, top);				
				centerWidth && bottom && drawTexture(1,Image.getTexture(this._tex, left, th - bottom, tw - left - right, bottom), left, h - bottom, centerWidth, bottom);
				//绘制左右两边
				centerHeight && left && drawTexture(2,Image.getTexture(this._tex, 0, top, left, th - top - bottom), 0, top, left, centerHeight);
				centerHeight && right && drawTexture(3,Image.getTexture(this._tex, tw - right, top, right, th - top - bottom), w - right, top, right, centerHeight);
				//绘制中间
				centerWidth && centerHeight && drawTexture(4,Image.getTexture(this._tex, left, top, tw - left - right, th - top - bottom), left, top, centerWidth, centerHeight);
			}
			else {
				g.cleanByTexture(_tex, 0, 0, w, h);
			}
		}
		
		private function drawTexture(part:int, tex:Texture, x:Number, y:Number, width:Number = 0, height:Number = 0):void {
			if(part==-1 || (_tileGridIndice & (1<<part))==0)
				this.graphics.drawTexture(tex, x, y, width, height);		
			else
				this.graphics.fillTexture(tex, x, y, width, height);
		}
		
		private static function getTexture(tex:Texture,x:Number,y:Number,width:Number,height:Number):Texture {            
			if (width <= 0) width = 1;
			if (height <= 0) height = 1;
			tex.$_GID || (tex.$_GID = Utils.getGID())
			var key:String = tex.$_GID + "." + x + "." + y + "." + width + "." + height;
			var texture:Texture = WeakObject.I.get(key);
			if (!texture||!texture.source) {
				texture = Texture.createFromTexture(tex, x, y, width, height);
				WeakObject.I.set(key, texture);
			}

			return texture;
		}
	}
}