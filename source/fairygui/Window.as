package fairygui {
	import laya.events.Event;
	import laya.maths.Point;
	
	public class Window extends GComponent {
		private var _contentPane: GComponent;
		private var _modalWaitPane: GObject;
		private var _closeButton: GObject;
		private var _dragArea: GObject;
		private var _contentArea: GObject;
		private var _frame: GComponent;
		private var _modal: Boolean;
		
		private var _uiSources: Vector.<IUISource>;
		private var _inited: Boolean;
		private var _loading: Boolean;
		
		protected var _requestingCmd: Number = 0;
		
		public var bringToFontOnClick: Boolean;
		
		public function Window() {
			super();
			this.focusable = true;
			this._uiSources = new Vector.<IUISource>();
			this.bringToFontOnClick = fairygui.UIConfig.bringWindowToFrontOnClick;
			
			this.displayObject.on(Event.DISPLAY,this,this.__onShown);
			this.displayObject.on(Event.UNDISPLAY,this, this.__onHidden);
			this.displayObject.on(Event.MOUSE_DOWN,this, this.__mouseDown);
		}
		
		public function addUISource(source: IUISource): void {
			this._uiSources.push(source);
		}
		
		public function set contentPane(val: GComponent):void {
			if(this._contentPane != val) {
				if(this._contentPane != null)
					this.removeChild(this._contentPane);
				this._contentPane = val;
				if(this._contentPane != null) {
					this.addChild(this._contentPane);
					this.setSize(this._contentPane.width,this._contentPane.height);
					this._contentPane.addRelation(this,RelationType.Size);
					this._frame = GComponent(this._contentPane.getChild("frame"));
					if(this._frame != null) {
						this.closeButton = this._frame.getChild("closeButton");
						this.dragArea = this._frame.getChild("dragArea");
						this.contentArea = this._frame.getChild("contentArea");
					}
				}
			}
		}
		
		public function get contentPane(): GComponent {
			return this._contentPane;
		}
		
		public function get frame(): GComponent {
			return this._frame;
		}
		
		public function get closeButton(): GObject {
			return this._closeButton;
		}
		
		public function set closeButton(value: GObject):void {
			if(this._closeButton != null)
				this._closeButton.offClick(this, this.closeEventHandler);
			this._closeButton = value;
			if(this._closeButton != null)
				this._closeButton.onClick(this, this.closeEventHandler);
		}
		
		public function get dragArea(): GObject {
			return this._dragArea;
		}
		
		public function set dragArea(value: GObject):void {
			if(this._dragArea != value) {
				if(this._dragArea != null) {
					this._dragArea.draggable = false;
					this._dragArea.off(Events.DRAG_START, this, this.__dragStart);
				}
				
				this._dragArea = value;
				if(this._dragArea != null) {
					if(this._dragArea is GGraph)
						this._dragArea.asGraph.drawRect(0,null,null);
					this._dragArea.draggable = true;
					this._dragArea.on(Events.DRAG_START,this,this.__dragStart);
				}
			}
		}
		
		public function get contentArea(): GObject {
			return this._contentArea;
		}
		
		public function set contentArea(value: GObject):void {
			this._contentArea = value;
		}
		
		public function show(): void {
			GRoot.inst.showWindow(this);
		}
		
		public function showOn(root: GRoot): void {
			root.showWindow(this);
		}
		
		public function hide(): void {
			if(this.isShowing)
				this.doHideAnimation();
		}
		
		public function hideImmediately(): void {
			var r: GRoot = (this.parent is GRoot) ? GRoot(this.parent) : null;
			if(!r)
				r = GRoot.inst;
			r.hideWindowImmediately(this);
		}
		
		public function centerOn(r: GRoot,restraint: Boolean = false):void {
			this.setXY(Math.round((r.width - this.width) / 2),Math.round((r.height - this.height) / 2));
			if(restraint) {
				this.addRelation(r,RelationType.Center_Center);
				this.addRelation(r,RelationType.Middle_Middle);
			}
		}
		
		public function toggleStatus(): void {
			if(this.isTop)
				this.hide();
			else
				this.show();
		}
		
		public function get isShowing(): Boolean {
			return this.parent != null;
		}
		
		public function get isTop(): Boolean {
			return this.parent != null && this.parent.getChildIndex(this) == this.parent.numChildren - 1;
		}
		
		public function get modal(): Boolean {
			return this._modal;
		}
		
		public function set modal(val: Boolean):void {
			this._modal = val;
		}
		
		public function bringToFront(): void {
			this.root.bringToFront(this);
		}
		
		public function showModalWait(requestingCmd: Number = 0): void {
			if(requestingCmd != 0)
				this._requestingCmd = requestingCmd;
			
			if(fairygui.UIConfig.windowModalWaiting) {
				if(!this._modalWaitPane)
					this._modalWaitPane = UIPackage.createObjectFromURL(fairygui.UIConfig.windowModalWaiting);
				
				this.layoutModalWaitPane();
				
				this.addChild(this._modalWaitPane);
			}
		}
		
		protected function layoutModalWaitPane(): void {
			if(this._contentArea != null) {
				var pt: Point = this._frame.localToGlobal();
				pt = this.globalToLocal(pt.x,pt.y,pt);
				this._modalWaitPane.setXY(pt.x + this._contentArea.x,pt.y + this._contentArea.y);
				this._modalWaitPane.setSize(this._contentArea.width,this._contentArea.height);
			}
			else
				this._modalWaitPane.setSize(this.width,this.height);
		}
		
		public function closeModalWait(requestingCmd: Number = 0): Boolean {
			if(requestingCmd != 0) {
				if(this._requestingCmd != requestingCmd)
					return false;
			}
			this._requestingCmd = 0;
			
			if(this._modalWaitPane && this._modalWaitPane.parent != null)
				this.removeChild(this._modalWaitPane);
			
			return true;
		}
		
		public function get modalWaiting(): Boolean {
			return this._modalWaitPane && this._modalWaitPane.parent != null;
		}
		
		
		public function init(): void {
			if(this._inited || this._loading)
				return;
			
			if(this._uiSources.length > 0) {
				this._loading = false;
				var cnt: Number = this._uiSources.length;
				for(var i: Number = 0;i < cnt;i++) {
					var lib: IUISource = this._uiSources[i];
					if(!lib.loaded) {
						lib.load(this.__uiLoadComplete, this);
						this._loading = true;
					}
				}
				
				if(!this._loading)
					this._init();
			}
			else
				this._init();
		}
		
		protected function onInit(): void {
		}
		
		protected function onShown(): void {
		}
		
		protected function onHide(): void {
		}
		
		protected function doShowAnimation(): void {
			this.onShown();
		}
		
		protected function doHideAnimation(): void {
			this.hideImmediately();
		}
		
		private function __uiLoadComplete(): void {
			var cnt: Number = this._uiSources.length;
			for(var i: Number = 0;i < cnt;i++) {
				var lib: IUISource = this._uiSources[i];
				if(!lib.loaded)
					return;
			}
			
			this._loading = false;
			this._init();
		}
		
		private function _init(): void {
			this._inited = true;
			this.onInit();
			
			if(this.isShowing)
				this.doShowAnimation();
		}
		
		override public function dispose(): void {
			if(this.parent != null)
				this.hideImmediately();
			
			super.dispose();
		}
		
		protected function closeEventHandler(): void {
			this.hide();
		}
		
		private function __onShown(): void {
			if(!this._inited)
				this.init();
			else
				this.doShowAnimation();
		}
		
		private function __onHidden(): void {
			this.closeModalWait();
			this.onHide();
		}
		
		private function __mouseDown(): void {
			if(this.isShowing && this.bringToFontOnClick)
				this.bringToFront();
		}
		
		private function __dragStart(evt: Event): void {
			GObject.cast(evt.currentTarget).stopDrag();
			
			this.startDrag();
		}
	}
}