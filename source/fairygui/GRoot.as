package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.display.Node;
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Point;
	import laya.media.SoundManager;
	import laya.utils.Log;
	
	public class GRoot extends GComponent {
		private var _modalLayer: GGraph;
		private var _popupStack: Vector.<GObject>;
		private var _justClosedPopups: Vector.<GObject>;
		private var _modalWaitPane: GObject;
		private var _focusedObject: GObject;
		private var _tooltipWin: GObject;
		private var _defaultTooltipWin: GObject;
		private var _checkPopups:Boolean;
		
		private static var  _inst: GRoot;
		
		public static function get inst(): GRoot {
			if(GRoot._inst == null)
				new GRoot();
			return GRoot._inst;
		}
		
		public function GRoot() {
			super();
			if(GRoot._inst == null)
				GRoot._inst = this;
			
			this.opaque = false;
			this._popupStack = new Vector.<GObject>();
			this._justClosedPopups = new Vector.<GObject>();
			this.displayObject.once(Event.DISPLAY, this, this.__addedToStage);
		}
		
		public function showWindow(win: Window): void {
			this.addChild(win);
			win.requestFocus();
			
			if(win.x > this.width)
				win.x = this.width - win.width;
			else if(win.x + win.width < 0)
				win.x = 0;
			
			if(win.y > this.height)
				win.y = this.height - win.height;
			else if(win.y + win.height < 0)
				win.y = 0;
			
			this.adjustModalLayer();
		}
		
		public function hideWindow(win: Window): void {
			win.hide();
		}
		
		public function hideWindowImmediately(win: Window): void {
			if(win.parent == this)
				this.removeChild(win);
			
			this.adjustModalLayer();
		}
		
		public function bringToFront(win: Window):void {
			var cnt: Number = this.numChildren;
			var i:Number;
			if(this._modalLayer.parent!=null && !win.modal)
				i = this.getChildIndex(this._modalLayer) - 1;
			else
				i = cnt - 1;
			
			for(;i >= 0;i--) {
				var g: GObject = this.getChildAt(i);
				if(g==win)
					return;
				if(g is Window)
					break;
			}
			
			if(i>=0)
				this.setChildIndex(win, i);
		}
		
		public function showModalWait(msg: String = null): void {
			if(fairygui.UIConfig.globalModalWaiting != null) {
				if(this._modalWaitPane == null)
					this._modalWaitPane = UIPackage.createObjectFromURL(fairygui.UIConfig.globalModalWaiting);
				this._modalWaitPane.setSize(this.width,this.height);
				this._modalWaitPane.addRelation(this,RelationType.Size);
				
				this.addChild(this._modalWaitPane);
				this._modalWaitPane.text = msg;
			}
		}
		
		public function closeModalWait(): void {
			if(this._modalWaitPane != null && this._modalWaitPane.parent != null)
				this.removeChild(this._modalWaitPane);
		}
		
		public function closeAllExceptModals(): void {
			var arr: Vector.<GObject> = this._children.slice();
			var cnt: Number = arr.length;
			for(var i: Number = 0;i < cnt;i++) {
				var g: GObject = arr[i];
				if((g is Window) && !Window(g).modal)
					Window(g).hide();
			}
		}
		
		public function closeAllWindows(): void {
			var arr: Vector.<GObject> = this._children.slice();
			var cnt: Number = arr.length;
			for(var i: Number = 0;i < cnt;i++) {
				var g: GObject = arr[i];
				if(g is Window)
					Window(g).hide();
			}
		}
		
		public function getTopWindow(): Window {
			var cnt: Number = this.numChildren;
			for(var i: Number = cnt - 1;i >= 0;i--) {
				var g: GObject = this.getChildAt(i);
				if(g is Window) {
					return Window(g);
				}
			}
			
			return null;
		}
		
		public function get modalLayer():GGraph
		{
			return _modalLayer;
		}
		
		public function get hasModalWindow(): Boolean {
			return this._modalLayer.parent != null;
		}
		
		public function get modalWaiting(): Boolean {
			return this._modalWaitPane && this._modalWaitPane.inContainer;
		}
		
		public function showPopup(popup: GObject,target: GObject = null,downward:*= null): void {
			if(this._popupStack.length > 0) {
				var k: Number = this._popupStack.indexOf(popup);
				if(k != -1) {
					for(var i: Number = this._popupStack.length - 1;i >= k;i--)
						this.removeChild(this._popupStack.pop());
				}
			}
			this._popupStack.push(popup);
			
			if (target != null)
			{
				var p:GObject = target;
				while (p != null)
				{
					if (p.parent == this)
					{
						if (popup.sortingOrder < p.sortingOrder)
						{
							popup.sortingOrder = p.sortingOrder;
						}
						break;
					}
					p = p.parent;
				}
			}
			
			this.addChild(popup);
			this.adjustModalLayer();
			
			var pos: laya.maths.Point;
			var sizeW: Number = 0,sizeH: Number = 0;
			if(target) {
				pos = target.localToGlobal();
				sizeW = target.width;
				sizeH = target.height;
			}
			else {
				pos = this.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
			}
			var xx: Number,yy: Number;
			xx = pos.x;
			if(xx + popup.width > this.width)
				xx = xx + sizeW - popup.width;
			yy = pos.y + sizeH;
			if((downward == null && yy + popup.height > this.height)
				|| downward == false) {
				yy = pos.y - popup.height - 1;
				if(yy < 0) {
					yy = 0;
					xx += sizeW / 2;
				}
			}
			
			popup.x = xx;
			popup.y = yy;
		}
		
		public function togglePopup(popup: GObject,target: GObject = null,downward:*= null): void {
			if(this._justClosedPopups.indexOf(popup) != -1)
				return;
			
			this.showPopup(popup,target,downward);
		}
		
		public function hidePopup(popup: GObject = null): void {
			if(popup != null) {
				var k: Number = this._popupStack.indexOf(popup);
				if(k != -1) {
					for(var i: Number = this._popupStack.length - 1;i >= k;i--)
						this.closePopup(this._popupStack.pop());
				}
			}
			else {
				var cnt: Number = this._popupStack.length;
				for(i = cnt - 1;i >= 0;i--)
					this.closePopup(this._popupStack[i]);
				this._popupStack.length = 0;
			}
		}
		
		public function get hasAnyPopup(): Boolean {
			return this._popupStack.length != 0;
		}
		
		private function closePopup(target: GObject): void {
			if(target.parent != null) {
				if(target is Window)
					Window(target).hide();
				else
					this.removeChild(target);
			}
		}
		
		public function showTooltips(msg: String): void {
			if (this._defaultTooltipWin == null) {
				var resourceURL: String = fairygui.UIConfig.tooltipsWin;
				if (!resourceURL) {
					Log.print("UIConfig.tooltipsWin not defined");
					return;
				}
				
				this._defaultTooltipWin = UIPackage.createObjectFromURL(resourceURL);
			}
			
			this._defaultTooltipWin.text = msg;
			this.showTooltipsWin(this._defaultTooltipWin);
		}
		
		public function showTooltipsWin(tooltipWin: GObject, position: Point = null): void {
			this.hideTooltips();
			
			this._tooltipWin = tooltipWin;
			
			var xx: Number = 0;
			var yy: Number = 0;
			if (position == null) {
				xx = Laya.stage.mouseX + 10;
				yy = Laya.stage.mouseY + 20;
			}
			else {
				xx = position.x;
				yy = position.y;
			}
			var pt: laya.maths.Point = this.globalToLocal(xx,yy);
			xx = pt.x;
			yy = pt.y;
			
			if (xx + this._tooltipWin.width > this.width) {
				xx = xx - this._tooltipWin.width - 1;
				if (xx < 0)
					xx = 10;
			}
			if (yy + this._tooltipWin.height > this.height) {
				yy = yy - this._tooltipWin.height - 1;
				if (xx - this._tooltipWin.width - 1 > 0)
					xx = xx - this._tooltipWin.width - 1;
				if (yy < 0)
					yy = 10;
			}
			
			this._tooltipWin.x = xx;
			this._tooltipWin.y = yy;
			this.addChild(this._tooltipWin);
		}
		
		public function hideTooltips(): void {
			if (this._tooltipWin != null) {
				if (this._tooltipWin.parent)
					this.removeChild(this._tooltipWin);
				this._tooltipWin = null;
			}
		}
		
		public function getObjectUnderPoint(globalX:Number, globalY:Number):GObject
		{
			return null;
		}
		
		public function get focus(): GObject {
			if (this._focusedObject && !this._focusedObject.onStage)
				this._focusedObject = null;
			
			return this._focusedObject;
		}
		
		public function set focus(value: GObject):void {
			if (value && (!value.focusable || !value.onStage))
				throw "invalid focus target";
			
			this.setFocus(value);
		}
		
		private function setFocus(value: GObject):void {
			if(this._focusedObject!=value)
			{
				this._focusedObject = value;
				this.displayObject.event(Events.FOCUS_CHANGED);
			}
		}
		
		public function get volumeScale():Number
		{
			return SoundManager.soundVolume;
		}
		
		public function set volumeScale(value:Number):void
		{
			SoundManager.soundVolume = value;
		}
		
		public function playOneShotSound(url:String, volumeScale: Number = 1):void {
			if(ToolSet.startsWith(url,"ui://"))
				return;
			
			SoundManager.playSound(url);
		}
		
		private function adjustModalLayer(): void {
			var cnt: Number = this.numChildren;
			
			if (this._modalWaitPane != null && this._modalWaitPane.parent != null)
				this.setChildIndex(this._modalWaitPane, cnt - 1);
			
			for(var i: Number = cnt - 1;i >= 0;i--) {
				var g: GObject = this.getChildAt(i);
				if((g is Window) && Window(g).modal) {
					if(this._modalLayer.parent == null)
						this.addChildAt(this._modalLayer,i);
					else
						this.setChildIndexBefore(this._modalLayer, i);
					return;
				}
			}
			
			if (this._modalLayer.parent != null)
				this.removeChild(this._modalLayer);
		}
		
		private function __addedToStage(): void {
			Laya.stage.on(Event.MOUSE_DOWN, this, this.__stageMouseDown);
			Laya.stage.on(Event.MOUSE_UP, this, this.__stageMouseUp);
			
			this._modalLayer = new GGraph();
			this._modalLayer.setSize(this.width, this.height);
			this._modalLayer.drawRect(0, null, fairygui.UIConfig.modalLayerColor);
			this._modalLayer.addRelation(this, RelationType.Size);
			
			this.displayObject.stage.on(Event.RESIZE, this, this.__winResize);
			
			this.__winResize();
		}
		
		public function checkPopups(clickTarget:Sprite):void
		{
			if(this._checkPopups)
				return;
			
			this._checkPopups = true;
			this._justClosedPopups.length = 0;
			if (this._popupStack.length > 0) {
				var mc:laya.display.Node = clickTarget;
				while (mc != this.displayObject.stage && mc != null) {
					if (mc["$owner"]) {
						var pindex: Number = this._popupStack.indexOf(mc["$owner"]);
						if (pindex != -1) {
							for(var i: Number = this._popupStack.length - 1;i > pindex;i--) {
								var popup: GObject = this._popupStack.pop();
								this.closePopup(popup);
								this._justClosedPopups.push(popup);
							}
							return;
						}
					}
					mc = mc.parent;
				}
				
				var cnt: Number = this._popupStack.length;
				for(i = cnt - 1;i >= 0;i--) {
					popup = this._popupStack[i];
					this.closePopup(popup);
					this._justClosedPopups.push(popup);
				}
				this._popupStack.length = 0;
			}
		}
		
		private function __stageMouseDown(evt:Event): void {
			var mc: laya.display.Node = evt.target;
			while (mc != this.displayObject.stage && mc != null) {
				if (mc["$owner"]) {
					var gg: GObject = mc["$owner"];
					if (gg.touchable && gg.focusable) {
						this.setFocus(gg);
						break;
					}
				}
				mc = mc.parent;
			}
			
			if (this._tooltipWin != null)
				this.hideTooltips();
			
			this.checkPopups(evt.target);
		}
		
		private function __stageMouseUp():void {
			this._checkPopups = false;
		}
		
		private function __winResize(): void {
			this.setSize(Laya.stage.width, Laya.stage.height);
		}
		
	}
}