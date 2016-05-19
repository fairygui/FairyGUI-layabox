
package fairygui.display {
	import laya.display.Graphics;
	import laya.display.Sprite;
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	import laya.utils.Utils;

    public class Image extends Sprite {
        private var _texture:Texture;
        private var _scaleByTile:Boolean;
        private var _scale9Grid:Rectangle;
        private var _textureScaleX:Number;
        private var _textureScaleY:Number;
        private var _needRebuild:Boolean;
        
        private static var _textureCache:Object = {};

        public function Image() {
            super();
            
            this.mouseEnabled = false;
            this._textureScaleX = 1;
            this._textureScaleY = 1;
        }
    
        public function get texture(): Texture {
            return this._texture;
        }

        public function set texture(value:Texture):void {
            if(this._texture!=value) {
                this._texture = value;
                if(this._texture)
                    this.size(this._texture.width, this._texture.height);
                else
                    this.size(0,0);
                this.markChanged();
            }
        }
        
        public function scaleTexture(x:Number, y:Number):void {
            if(this._textureScaleX!=x || this._textureScaleY!=y) {
                this._textureScaleX = x;
                this._textureScaleY = y;
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
            if(this._texture==null)
                return;
                
            var width:Number=this.width*this._textureScaleX;
			var height:Number=this.height*this._textureScaleY;
			var sw:Number=this._texture.width;
			var sh:Number=this._texture.height;
            
            if(this._scaleByTile) {
                var hc:Number = Math.ceil(this._textureScaleX);
				var vc:Number = Math.ceil(this._textureScaleY);
				var remainWidth:Number = width - (hc - 1) * sw;
				var remainHeight:Number = height - (vc - 1) * sh;
				for (var i:Number = 0; i < hc; i++)
				{
					for (var j:Number = 0; j < vc; j++)
					{
						if(i==hc-1 || j==vc-1)
                            g.drawTexture(Image.getTexture(this._texture, 0, 0, i==hc-1?remainWidth:sw, j==vc-1?remainHeight:sh), i*sw, j*sh);
						else
							g.drawTexture(this._texture, i*sw, j*sh);
					}
				}
            }
            else if(this._scale9Grid!=null) {
                var left:Number = this._scale9Grid.x;
				var right:Number = Math.max(sw - this._scale9Grid.right, 0);
                var top:Number = this._scale9Grid.y;
				var bottom:Number = Math.max(sh - this._scale9Grid.bottom, 0);
				
				//绘制四个角
				left && top && g.drawTexture(Image.getTexture(this._texture, 0, 0, left, top), 0, 0, left, top);
				right && top && g.drawTexture(Image.getTexture(this._texture, sw - right, 0, right, top), width - right, 0, right, top);
				left && bottom && g.drawTexture(Image.getTexture(this._texture, 0, sh - bottom, left, bottom), 0, height - bottom, left, bottom);
				right && bottom && g.drawTexture(Image.getTexture(this._texture, sw - right, sh - bottom, right, bottom), width - right, height - bottom, right, bottom);
				//绘制上下两个边
				top && g.drawTexture(Image.getTexture(this._texture, left, 0, sw - left - right, top), left, 0, width - left - right, top);
				bottom && g.drawTexture(Image.getTexture(this._texture, left, sh - bottom, sw - left - right, bottom), left, height - bottom, width - left - right, bottom);
				//绘制左右两边
				left && g.drawTexture(Image.getTexture(this._texture, 0, top, left, sh - top - bottom), 0, top, left, height - top - bottom);
				right && g.drawTexture(Image.getTexture(this._texture, sw - right, top, right, sh - top - bottom), width - right, top, right, height - top - bottom);
				//绘制中间
				g.drawTexture(Image.getTexture(this._texture, left, top, sw - left - right, sh - top - bottom), left, top, width - left - right, height - top - bottom);
            }
            else {
                g.drawTexture(this._texture, 0, 0, width, height);
            }
            
            this.repaint();
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