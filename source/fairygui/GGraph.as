package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.display.Graphics;
	import laya.display.Sprite;
	import laya.renders.Render;
	import laya.utils.Utils;
	
	public class GGraph extends GObject implements IColorGear {
		private var _type: Number;
		private var _lineSize: Number;
		private var _lineColor: String;
		private var _fillColor: String;
		private var _corner: int;
		
		public function GGraph () {
			super();
			
			this._type = 0;
			this._lineSize = 1;
			this._lineColor = "#000000"
			this._fillColor = "#FFFFFF";
			this._corner = 0;
		}
		
		public function drawRect(lineSize: Number, lineColor: String, fillColor: String): void {
			this._type = 1;
			this._lineSize = lineSize;
			this._lineColor = lineColor;
			this._fillColor = fillColor;
			this.drawCommon();
		}
		
		public function drawEllipse(lineSize: Number, lineColor: String, fillColor: String): void {
			this._type = 2;
			this._lineSize = lineSize;
			this._lineColor = lineColor;
			this._fillColor = fillColor;
			this.drawCommon();
		}
		
		public function get color():String
		{
			return this._fillColor;
		}
		
		public function set color(value:String):void 
		{
			this._fillColor = value;
			if(this._type!=0)
				this.drawCommon();
		}
		
		private function drawCommon(): void {
			this._displayObject.mouseEnabled = this.touchable;
			var gr:Graphics = this._displayObject.graphics;
			gr.clear();
			
			var w: Number = this.width;
			var h: Number = this.height;
			if(w == 0 || h == 0)
				return;
			
			var fillColor:String = this._fillColor;
			var lineColor:String = this._lineColor;
			if(Render.isWebGL && ToolSet.startsWith(fillColor, "rgba")) {
				//webgl下laya未支持rgba格式
				var arr:Array = fillColor.substring(5, fillColor.lastIndexOf(")")).split(",");
				var a:Number = parseFloat(arr[3]);
				if(a==0)
					fillColor = null;
				else {
					fillColor = Utils.toHexColor((parseInt(arr[0])<<16) + (parseInt(arr[1])<<8) + parseInt(arr[2]));
					this.alpha = a;
				}
			}
			if (this._type == 1) {
				if(_corner > 0) {
					var fixCorner:int = w<h?w:h;
					if(2*_corner > fixCorner)
						fixCorner = parseInt(fixCorner/2+"");
					
					var path:Array =  [
						["moveTo", fixCorner, 0], 
						["arcTo", w, 0,    w, h, fixCorner], 
						["arcTo", w, h,    0, h, fixCorner], 
						["arcTo", 0, h,    0, 0, fixCorner], 
						["arcTo", 0, 0,    w, 0, fixCorner],
						["closePath"]
					];
					
					gr.drawPath(0, 0, path, {fillStyle: fillColor}, this._lineSize>0?{strokeStyle:lineColor, lineWidth:this._lineSize}:null);
				} else
					gr.drawRect(0,0,w,h,fillColor,this._lineSize>0?lineColor:null,this._lineSize);
			} else
				gr.drawCircle(w/2,h/2,w/2, fillColor, this._lineSize>0?lineColor:null, this._lineSize);
			
			this._displayObject.repaint();
		}
		
		public function replaceMe(target: GObject): void {
			if (!this._parent)
				throw "parent not set";
			
			target.name = this.name;
			target.alpha = this.alpha;
			target.rotation = this.rotation;
			target.visible = this.visible;
			target.touchable = this.touchable;
			target.grayed = this.grayed;
			target.setXY(this.x, this.y);
			target.setSize(this.width, this.height);
			
			var index: Number = this._parent.getChildIndex(this);
			this._parent.addChildAt(target, index);
			target.relations.copyFrom(this.relations);
			
			this._parent.removeChild(this, true);
		}
		
		public function addBeforeMe(target: GObject): void {
			if (this._parent == null)
				throw "parent not set";
			
			var index: Number = this._parent.getChildIndex(this);
			this._parent.addChildAt(target, index);
		}
		
		public function addAfterMe(target: GObject): void {
			if (this._parent == null)
				throw "parent not set";
			
			var index: Number = this._parent.getChildIndex(this);
			index++;
			this._parent.addChildAt(target, index);
		}
		
		public function setNativeObject(obj: Sprite): void {
			this._type = 0;
			this._displayObject.mouseEnabled = this.touchable;
			this._displayObject.graphics.clear();
			this._displayObject.addChild(obj);
		}
		
		override protected function createDisplayObject():void {
			super.createDisplayObject();
			this._displayObject.mouseEnabled = false;
		}
		
		override protected function handleSizeChanged(): void {
			super.handleSizeChanged();
			
			if(this._type != 0)
				this.drawCommon();
		}
		
		override public function setup_beforeAdd(xml: Object): void {
			super.setup_beforeAdd(xml);
			
			var type: String = xml.getAttribute("type");
			
			if (type && type!="empty") {
				var str: String;
				
				str = xml.getAttribute("lineSize");
				if (str)
					this._lineSize = parseInt(str);
				
				str = xml.getAttribute("lineColor");
				if (str) {
					var c: Number = ToolSet.convertFromHtmlColor(str, true);
					var a:Number = ((c >> 24) & 0xFF) / 0xFF;
					if(a!=1)
						this._lineColor = "rgba(" + ((c>>16) & 0xFF) + "," + ((c>>8) & 0xFF) + "," + (c & 0xFF) + "," + a + ")";
					else
						this._lineColor = Utils.toHexColor(c & 0xFFFFFF);                    
				}
				
				str = xml.getAttribute("fillColor");
				if (str) {
					c = ToolSet.convertFromHtmlColor(str, true);
					a= ((c >> 24) & 0xFF) / 0xFF;
					if(a!=1)
						this._fillColor = "rgba(" + ((c>>16) & 0xFF) + "," + ((c>>8) & 0xFF) + "," + (c & 0xFF) + "," + a + ")";
					else
						this._fillColor = Utils.toHexColor(c & 0xFFFFFF);   
				}
				
				str = xml.getAttribute("corner");
				if (str) {
					this._corner = parseInt(str);
				}
				
				if (type == "rect")
					this._type = 1;
				else
					this._type = 2;
				
				this.drawCommon();
			}
		}
	}
}