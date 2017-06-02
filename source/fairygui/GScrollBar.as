package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.events.Event;
	import laya.maths.Point;
	import laya.utils.Log;
	
	public class GScrollBar extends GComponent {
		private var _grip: GObject;
		private var _arrowButton1: GObject;
		private var _arrowButton2: GObject;
		private var _bar: GObject;
		private var _target: ScrollPane;
		
		private var _vertical: Boolean;
		private var _scrollPerc: Number = 0;
		private var _fixedGripSize: Boolean;
		
		private var _dragOffset: laya.maths.Point;
		
		public function GScrollBar() {
			super();
			this._dragOffset = new laya.maths.Point();
			this._scrollPerc = 0;
		}
		
		public function setScrollPane(target: ScrollPane, vertical: Boolean): void {
			this._target = target;
			this._vertical = vertical;
		}
		
		public function set displayPerc(val: Number):void {
			if (this._vertical) {
				if(!this._fixedGripSize)
					this._grip.height = val * this._bar.height;
				this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
			}
			else {
				if(!this._fixedGripSize)
					this._grip.width = val * this._bar.width;
				this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
			}
		}
		
		public function set scrollPerc(val: Number):void {
			this._scrollPerc = val;
			if (this._vertical)
				this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
			else
				this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
		}
		
		public function get minSize(): Number {
			if (this._vertical)
				return (this._arrowButton1 != null ? this._arrowButton1.height : 0) + (this._arrowButton2 != null ? this._arrowButton2.height : 0);
			else
				return (this._arrowButton1 != null ? this._arrowButton1.width : 0) + (this._arrowButton2 != null ? this._arrowButton2.width : 0);
		}
		
		override protected function constructFromXML(xml: Object): void {
			super.constructFromXML(xml);
			
			xml = ToolSet.findChildNode(xml, "ScrollBar");
			if (xml) {
				this._fixedGripSize = xml.getAttribute("fixedGripSize") == "true";
			}
			
			this._grip = this.getChild("grip");
			if(!this._grip) {
				Log.print("需要定义grip");
				return;
			}
			
			this._bar = this.getChild("bar");
			if(!this._bar) {
				Log.print("需要定义bar");
				return;
			}
			
			this._arrowButton1 = this.getChild("arrow1");
			this._arrowButton2 = this.getChild("arrow2");
			
			this._grip.on(Event.MOUSE_DOWN, this, this.__gripMouseDown);
			
			if(this._arrowButton1)
				this._arrowButton1.on(Event.MOUSE_DOWN,this,this.__arrowButton1Click);
			if(this._arrowButton2)
				this._arrowButton2.on(Event.MOUSE_DOWN,this,this.__arrowButton2Click);
			
			this.on(Event.MOUSE_DOWN,this,this.__barMouseDown);
		}
		
		private function __gripMouseDown(evt:Event): void {
			if (!this._bar)
				return;
			
			evt.stopPropagation();
			
			Laya.stage.on(Event.MOUSE_MOVE, this, this.__gripMouseMove);
			Laya.stage.on(Event.MOUSE_UP,this,this.__gripMouseUp);
			
			this.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,this._dragOffset);
			this._dragOffset.x -= this._grip.x;
			this._dragOffset.y -= this._grip.y;
		}
		
		private static var sScrollbarHelperPoint: Point = new Point();
		private function __gripMouseMove(): void {
			var pt: Point = this.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,GScrollBar.sScrollbarHelperPoint);
			if (this._vertical) {
				var curY: Number = pt.y- this._dragOffset.y;
				this._target.setPercY((curY - this._bar.y) / (this._bar.height - this._grip.height), false);
			}
			else {
				var curX: Number = pt.x - this._dragOffset.x;
				this._target.setPercX((curX - this._bar.x) / (this._bar.width - this._grip.width), false);
			}
		}
		
		private function __gripMouseUp(evt:Event): void {
			if (!this._bar)
				return;
			
			Laya.stage.off(Event.MOUSE_MOVE, this, this.__gripMouseMove);
			Laya.stage.off(Event.MOUSE_UP, this, this.__gripMouseUp);
		}
		
		private function __arrowButton1Click(evt:Event): void {
			evt.stopPropagation();
			
			if (this._vertical)
				this._target.scrollUp();
			else
				this._target.scrollLeft();
		}
		
		private function __arrowButton2Click(evt: Event): void {
			evt.stopPropagation();
			
			if (this._vertical)
				this._target.scrollDown();
			else
				this._target.scrollRight();
		}
		
		private function __barMouseDown(evt: Event): void {
			var pt: Point = this._grip.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,GScrollBar.sScrollbarHelperPoint);
			if (this._vertical) {
				if (pt.y < 0)
					this._target.scrollUp(4);
				else
					this._target.scrollDown(4);
			}
			else {
				if (pt.x < 0)
					this._target.scrollLeft(4);
				else
					this._target.scrollRight(4);
			}
		}
	}
}