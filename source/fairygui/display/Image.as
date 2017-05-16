
package fairygui.display {
	import laya.display.Graphics;
	import laya.display.Sprite;
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	import laya.utils.Utils;
	
	public class Image extends Sprite {
		private var _tex:Texture;
		private var _scaleByTile:Boolean;
		private var _scale9Grid:Rectangle;
		private var _tileGridIndice:int = 0;
		private var _textureScaleX:Number = 0;
		private var _textureScaleY:Number = 0;
		private var _needRebuild:Boolean;
		
		private static var _textureCache:Object = {};
		
		public function Image() {
			super();
			
			this.mouseEnabled = false;
			this._textureScaleX = 1;
			this._textureScaleY = 1;
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
			
			var g:Graphics  = this.graphics;
			g.clear();
			if(this._tex==null)
			{
				this.repaint();
				return;
			}
			
			var width:Number=this.width;
			var height:Number=this.height;
			var sw:Number=this._tex.width;
			var sh:Number=this._tex.height;
			
			if(width==0 || height==0)
			{
				this.repaint();
				return;
			}
			
			if(this._scaleByTile) {
				g.fillTexture(this._tex, 0, 0, width, height);
			}
			else if(this._scale9Grid!=null) {
				var left:Number = this._scale9Grid.x;
				var right:Number = Math.max(sw - this._scale9Grid.right, 0);
				var top:Number = this._scale9Grid.y;
				var bottom:Number = Math.max(sh - this._scale9Grid.bottom, 0);
				var tmp:Number;
				
				if (height >= (sh - this._scale9Grid.height))
				{
					top = this._scale9Grid.y;
					bottom = sh - this._scale9Grid.bottom;
				}
				else
				{
					tmp = this._scale9Grid.y / (sh - this._scale9Grid.bottom);
					tmp = height * tmp / (1 + tmp);
					top = Math.round(tmp);
					bottom = height - tmp;
				}
				
				if (width >= (sw - this._scale9Grid.width))
				{
					left = this._scale9Grid.x;
					right = sw - this._scale9Grid.right;
				}
				else
				{
					tmp = this._scale9Grid.x / (sw - this._scale9Grid.right);
					tmp = width * tmp / (1 + tmp);
					left = Math.round(tmp);
					right = width - tmp;
				}
				var centerWidth:Number = Math.max(width - left - right,0);
				var centerHeight:Number = Math.max(height - top - bottom,0);
				
				//绘制四个角
				left && top && g.drawTexture(Image.getTexture(this._tex, 0, 0, left, top), 0, 0, left, top);
				right && top && g.drawTexture(Image.getTexture(this._tex, sw - right, 0, right, top), width - right, 0, right, top);
				left && bottom && g.drawTexture(Image.getTexture(this._tex, 0, sh - bottom, left, bottom), 0, height - bottom, left, bottom);
				right && bottom && g.drawTexture(Image.getTexture(this._tex, sw - right, sh - bottom, right, bottom), width - right, height - bottom, right, bottom);
				//绘制上下两个边
				centerWidth && top && drawTexture(0,Image.getTexture(this._tex, left, 0, sw - left - right, top), left, 0, centerWidth, top);				
				centerWidth && bottom && drawTexture(1,Image.getTexture(this._tex, left, sh - bottom, sw - left - right, bottom), left, height - bottom, centerWidth, bottom);
				//绘制左右两边
				centerHeight && left && drawTexture(2,Image.getTexture(this._tex, 0, top, left, sh - top - bottom), 0, top, left, centerHeight);
				centerHeight && right && drawTexture(3,Image.getTexture(this._tex, sw - right, top, right, sh - top - bottom), width - right, top, right, centerHeight);
				//绘制中间
				centerWidth && centerHeight && drawTexture(4,Image.getTexture(this._tex, left, top, sw - left - right, sh - top - bottom), left, top, centerWidth, centerHeight);
			}
			else {
				g.drawTexture(this._tex, 0, 0, width, height);
			}
			
			this.repaint();
		}
		
		private function drawTexture(part:int, tex:Texture, x:Number, y:Number, width:Number = 0, height:Number = 0):void {
			if(part==-1 || (_tileGridIndice & (1<<part))==0)
				this.graphics.drawTexture(tex, x, y, width, height);		
			else
				this.graphics.fillTexture(tex, x, y, width, height);
			
		}
		
		private static function getTexture(source:Object,x:Number,y:Number,width:Number,height:Number):Texture {            
			source.$GID || (source.$GID=Utils.getGID());
			var key:String=source.$GID+"."+x+"."+y+"."+width+"."+height;
			var texture:Texture =Image._textureCache[key];
			if (!texture){
				texture=Image._textureCache[key]=Texture.create(source,x,y,width,height);
			}
			return texture;
		}
		
		public static function clearCache():void {
			Image._textureCache={};
		}
	}
}