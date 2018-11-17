package fairygui {
	import fairygui.utils.ByteBuffer;
	import fairygui.utils.ToolSet;
	
	import laya.display.Graphics;
	import laya.display.Sprite;
	import laya.renders.Render;
	import laya.utils.HitArea;
	import laya.utils.Utils;
	import fairygui.gears.IColorGear;
	
	public class GGraph extends GObject implements IColorGear {
		private var _type: int;
		private var _lineSize: Number;
		private var _lineColor: String;
		private var _fillColor: String;
		private var _cornerRadius: Array;
		private var _hitArea:HitArea;
		
		public function GGraph () {
			super();
			
			this._type = 0;
			this._lineSize = 1;
			this._lineColor = "#000000"
			this._fillColor = "#FFFFFF";
			this._cornerRadius = null;
		}
		
		public function drawRect(lineSize: Number, lineColor: String, fillColor: String, cornerRadius:Array = null): void {
			this._type = 1;
			this._lineSize = lineSize;
			this._lineColor = lineColor;
			this._fillColor = fillColor;
			this._cornerRadius = cornerRadius;
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
			if (this._type == 1) 
			{
				if(_cornerRadius!=null)
				{
					var paths:Array =  [
						["moveTo", _cornerRadius[0], 0],
						["lineTo", w - _cornerRadius[1], 0],
						["arcTo", w, 0, w, _cornerRadius[1], _cornerRadius[1]],
						["lineTo", w, h-_cornerRadius[3]],
						["arcTo", w, h, w-_cornerRadius[3], h, _cornerRadius[3]], 
						["lineTo", _cornerRadius[2], h],
						["arcTo", 0, h, 0, h-_cornerRadius[2], _cornerRadius[2]],
						["lineTo", 0, _cornerRadius[0]],
						["arcTo", 0, 0, _cornerRadius[0], 0, _cornerRadius[0]],
						["closePath"]
					];
					gr.drawPath(0,0,paths, {fillStyle: fillColor}, _lineSize>0?{strokeStyle:lineColor, lineWidth:_lineSize}:null);
				}
				else
					gr.drawRect(0,0,w,h,fillColor,_lineSize>0?lineColor:null,_lineSize);
			} else
			{
				gr.drawCircle(w/2,h/2,w/2, fillColor, _lineSize>0?lineColor:null, _lineSize);
			}
			
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
			
			_hitArea = new HitArea();
			_hitArea.hit = this._displayObject.graphics;
			this._displayObject.hitArea = _hitArea;
		}
		
		override protected function handleSizeChanged(): void {
			super.handleSizeChanged();
			
			if(this._type != 0)
				this.drawCommon();
		}
		
		override public function setup_beforeAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_beforeAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 5);
			
			_type = buffer.readByte();
			if (_type!=0) {
				_lineSize = buffer.getInt32();
				_lineColor = buffer.readColorS(true);
				_fillColor = buffer.readColorS(true);
				if (buffer.readBool())
				{
					_cornerRadius = [];
					for (var i:int = 0; i < 4; i++)
						_cornerRadius[i] = buffer.getFloat32();
				}
				
				this.drawCommon();
			}
		}
	}
}