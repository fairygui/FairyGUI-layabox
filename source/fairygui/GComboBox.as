package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.display.Input;
	import laya.events.Event;
	import laya.utils.Log;
	
	public class GComboBox extends GComponent {
		public var dropdown:GComponent;
		
		protected var _titleObject:GObject;
		protected var _iconObject:GObject;
		protected var _list:GList;
		
		protected var _items:Array;
		protected var _icons:Array;
		protected var _values:Array;
		protected var _popupDownward:Object;
		
		private var _visibleItemCount:int;
		private var _itemsUpdated:Boolean;
		private var _selectedIndex:int;
		private var _buttonController:Controller;
		private var _selectionController:Controller;
		
		private var _down:Boolean;
		private var _over:Boolean;
		
		public function GComboBox() {
			super();
			this._visibleItemCount = fairygui.UIConfig.defaultComboBoxVisibleItemCount;
			this._itemsUpdated = true;
			this._selectedIndex = -1;
			this._items = [];
			this._values = [];
		}
		
		override public function get text(): String {
			if (this._titleObject)
				return this._titleObject.text;
			else
				return null;
		}
		
		override public function set text(value: String):void {
			if (this._titleObject)
				this._titleObject.text = value;
			this.updateGear(6);
		}
		
		final public function get titleColor():String
		{
			if(_titleObject is GTextField)
				return GTextField(_titleObject).color;
			else if(_titleObject is GLabel)
				return GLabel(_titleObject).titleColor;
			else if(_titleObject is GButton)
				return GButton(_titleObject).titleColor;
			else
				return "#000000";
		}
		
		public function set titleColor(value:String):void
		{
			if(_titleObject is GTextField)
				GTextField(_titleObject).color = value;
			else if(_titleObject is GLabel)
				GLabel(_titleObject).titleColor = value;
			else if(_titleObject is GButton)
				GButton(_titleObject).titleColor = value;
		}
		
		final override public function get icon():String
		{
			if(_iconObject)
				return _iconObject.icon;
			else
				return null;
		}
		
		override public function set icon(value:String):void
		{
			if(_iconObject)
				_iconObject.icon = value;
			updateGear(7);
		}
		
		public function get visibleItemCount(): Number {
			return this._visibleItemCount;
		}
		
		public function set visibleItemCount(value: Number):void {
			this._visibleItemCount = value;
		}
		
		public function get popupDownward():*
		{
			return this._popupDownward;
		}
		
		public function set popupDownward(value:*):void
		{
			this._popupDownward = value;
		}
		
		public function get items(): Array {
			return this._items;
		}
		
		public function set items(value:Array):void
		{
			if(!value)
				_items.length = 0;
			else
				_items = value.concat();
			if(_items.length>0)
			{
				if(_selectedIndex>=_items.length)
					_selectedIndex = _items.length-1;
				else if(_selectedIndex==-1)
					_selectedIndex = 0;
				
				this.text = _items[_selectedIndex];
				if (_icons != null && _selectedIndex < _icons.length)
					this.icon = _icons[_selectedIndex];
			}
			else
			{
				this.text = "";
				if (_icons != null)
					this.icon = null;
				_selectedIndex = -1;
			}
			_itemsUpdated = true;
		}
		
		final public function get icons():Array
		{
			return _icons;
		}
		
		public function set icons(value:Array):void
		{
			_icons = value;
			if (_icons != null && _selectedIndex != -1 && _selectedIndex < _icons.length)
				this.icon = _icons[_selectedIndex];
		}
		
		public function get values(): Array {
			return this._values;
		}
		
		public function set values(value:Array):void {
			if (!value)
				this._values.length = 0;
			else
				this._values = value.concat();
		}
		
		public function get selectedIndex(): int {
			return this._selectedIndex;
		}
		
		public function set selectedIndex(val:int):void
		{
			if(_selectedIndex==val)
				return;
			
			_selectedIndex = val;
			if(_selectedIndex>=0 && _selectedIndex<_items.length)
			{
				this.text = _items[_selectedIndex];
				if (_icons != null && _selectedIndex < _icons.length)
					this.icon = _icons[_selectedIndex];
			}
			else
			{
				this.text = "";
				if (_icons != null)
					this.icon = null;
			}
			
			updateSelectionController();
		}
		
		public function get value(): String {
			return this._values[this._selectedIndex];
		}
		
		public function set value(val: String):void {
			this.selectedIndex = this._values.indexOf(val);
		}
		
		protected function setState(val: String): void {
			if (this._buttonController)
				this._buttonController.selectedPage = val;
		}
		
		public function get selectionController():Controller
		{
			return _selectionController;
		}
		
		public function set selectionController(value:Controller):void
		{
			_selectionController = value;
		}
		
		override public function handleControllerChanged(c:Controller):void
		{
			super.handleControllerChanged(c);
			
			if (_selectionController == c)
				this.selectedIndex = c.selectedIndex;
		}
		
		private function updateSelectionController():void
		{
			if (_selectionController != null && !_selectionController.changing
				&& _selectedIndex < _selectionController.pageCount)
			{
				var c:Controller = _selectionController;
				_selectionController = null;
				c.selectedIndex = _selectedIndex;
				_selectionController = c;
			}
		}
		
		override public function dispose():void
		{
			if(this.dropdown)
			{
				this.dropdown.dispose();
				this.dropdown = null;
			}
			
			_selectionController = null;
			
			super.dispose();
		}
		
		override protected function constructFromXML(xml: Object): void {
			super.constructFromXML(xml);
			
			xml = ToolSet.findChildNode(xml, "ComboBox");
			var str: String;
			
			this._buttonController = this.getController("button");
			this._titleObject = this.getChild("title");
			this._iconObject = this.getChild("icon");
			
			str = xml.getAttribute("dropdown");
			if (str) {
				this.dropdown = GComponent(UIPackage.createObjectFromURL(str));
				if (!this.dropdown) {
					Log.print("下拉框必须为元件");
					return;
				}
				this.dropdown.name = "this._dropdownObject";
				this._list = this.dropdown.getChild("list").asList;
				if (this._list == null) {
					Log.print(this.resourceURL + ": 下拉框的弹出元件里必须包含名为list的列表");
					return;
				}
				this._list.on(Events.CLICK_ITEM, this, this.__clickItem);
				
				this._list.addRelation(this.dropdown, RelationType.Width);
				this._list.removeRelation(this.dropdown, RelationType.Height);
				
				this.dropdown.addRelation(this._list, RelationType.Height);
				this.dropdown.removeRelation(this._list, RelationType.Width);
				
				this.dropdown.displayObject.on(Event.UNDISPLAY, this, this.__popupWinClosed);
			}
			
			this.on(Event.ROLL_OVER, this, this.__rollover);
			this.on(Event.ROLL_OUT, this, this.__rollout);
			this.on(Event.MOUSE_DOWN, this, this.__mousedown);
		}
		
		override public function setup_afterAdd(xml: Object): void {
			super.setup_afterAdd(xml);
			
			xml = ToolSet.findChildNode(xml, "ComboBox");
			if (xml) {
				var str: String;
				str = xml.getAttribute("titleColor");
				if (str)
					this.titleColor = str;
				str = xml.getAttribute("visibleItemCount");
				if (str)
					this._visibleItemCount = parseInt(str);
				
				var col: Array = xml.childNodes;
				var length: Number = col.length;
				for (var i: Number = 0; i < length; i++) {
					var cxml: Object = col[i];
					if(cxml.nodeName=="item") {
						this._items.push(cxml.getAttribute("title"));
						this._values.push(cxml.getAttribute("value"));
						str = cxml.getAttribute("icon");
						if (str)
						{
							if(!_icons)
								_icons = new Array(length);
							_icons[i] = str;
						}
					}
				}
				
				str = xml.getAttribute("title");
				if(str)
				{
					this.text = str;
					this._selectedIndex = this._items.indexOf(str);
				}
				else if(this._items.length>0)
				{
					this._selectedIndex = 0;
					this.text = this._items[0];
				}
				else
					this._selectedIndex = -1;
				
				str = xml.getAttribute("icon");
				if(str)
					this.icon = str;
				
				str = xml.getAttribute("direction");
				if(str)
				{
					if(str=="up")
						this._popupDownward = false;
					else if(str=="auto")
						this._popupDownward = null;
				}
				
				str = xml.getAttribute("selectionController");
				if (str)
					_selectionController = parent.getController(str);
			}
		}
		
		protected function showDropdown(): void {
			if (this._itemsUpdated) {
				this._itemsUpdated = false;
				
				this._list.removeChildrenToPool();
				var cnt: Number = this._items.length;
				for (var i: Number = 0; i < cnt; i++) {
					var item: GObject = this._list.addItemFromPool();
					item.name = i < this._values.length ? this._values[i] : "";
					item.text = this._items[i];
					item.icon = (_icons != null && i < _icons.length) ? _icons[i] : null;
				}
				this._list.resizeToFit(this._visibleItemCount);
			}
			this._list.selectedIndex = -1;
			this.dropdown.width = this.width;
			
			this.root.togglePopup(this.dropdown, this, this._popupDownward);
			if (this.dropdown.parent)
				this.setState(GButton.DOWN);
		}
		
		private function __popupWinClosed(): void {
			if(this._over)
				this.setState(GButton.OVER);
			else
				this.setState(GButton.UP);
		}
		
		private function __clickItem(itemObject:GObject, evt:Event): void {
			Laya.timer.callLater(this, this.__clickItem2, [this._list.getChildIndex(itemObject), evt])
		}
		
		private function __clickItem2(index:Number, evt:Event):void {
			if (this.dropdown.parent is GRoot)
				GRoot(this.dropdown.parent).hidePopup();
			
			this._selectedIndex = -1;
			this.selectedIndex = index;
			Events.dispatch(Events.STATE_CHANGED, this.displayObject, evt);
		}
		
		private function __rollover(): void {
			this._over = true;
			if (this._down || this.dropdown && this.dropdown.parent)
				return;
			
			this.setState(GButton.OVER);
		}
		
		private function __rollout(): void {
			this._over = false;
			if (this._down || this.dropdown && this.dropdown.parent)
				return;
			
			this.setState(GButton.UP);
		}
		
		private function __mousedown(evt:Event): void {
			if(evt.target is Input)
				return;
			
			this._down = true;
			GRoot.inst.checkPopups(evt.target);
			
			Laya.stage.on(Event.MOUSE_UP, this, this.__mouseup);
			
			if (this.dropdown)
				this.showDropdown();
		}
		
		private function __mouseup(): void {
			if(this._down) {
				this._down = false;
				Laya.stage.off(Event.MOUSE_UP, this, this.__mouseup);
				
				if(this.dropdown && !this.dropdown.parent) {
					if(this._over)
						this.setState(GButton.OVER);
					else
						this.setState(GButton.UP);
				}
			}
		}
	}
}