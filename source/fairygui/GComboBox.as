package fairygui {
	import fairygui.utils.ByteBuffer;
	
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
		protected var _popupDirection:int;
		
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
		
		public function get titleColor(): String {
			var tf:GTextField = getTextField();
			if(tf!=null)
				return tf.color;
			else
				return "#000000";
		}
		
		public function set titleColor(value: String):void {
			var tf:GTextField = getTextField();
			if(tf!=null)
				tf.color = value;
			this.updateGear(4);
		}
		
		public function get titleFontSize():int {
			var tf:GTextField = getTextField();
			if(tf!=null)
				return tf.fontSize;
			else
				return 0;
		}
		
		public function set titleFontSize(value:int):void
		{
			var tf:GTextField = getTextField();
			if(tf!=null)
				tf.fontSize = value;
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
		
		/**
		 * @see PopupDirection
		 */
		public function get popupDirection():int
		{
			return this._popupDirection;
		}
		
		/**
		 * @see PopupDirection
		 */
		public function set popupDirection(value:int):void
		{
			this._popupDirection = value;
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
		
		public function getTextField():GTextField
		{
			if (_titleObject is GTextField)
				return _titleObject as GTextField;
			else if (_titleObject is GLabel)
				return (_titleObject as GLabel).getTextField();
			else if (_titleObject is GButton)
				return (_titleObject as GButton).getTextField();
			else
				return null;
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
		
		override protected function constructExtension(buffer:ByteBuffer): void {
			
			var str: String;
			
			this._buttonController = this.getController("button");
			this._titleObject = this.getChild("title");
			this._iconObject = this.getChild("icon");
			
			str = buffer.readS();
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
		
		override public function setup_afterAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_afterAdd(buffer, beginPos);
			
			if (!buffer.seek(beginPos, 6))
				return;
			
			if (buffer.readByte() != packageItem.objectType)
				return;
			
			var i:int;
			var iv:int;
			var nextPos:int;
			var str:String;
			var itemCount:int = buffer.getInt16();
			for (i = 0; i < itemCount; i++)
			{
				nextPos = buffer.getInt16();
				nextPos += buffer.pos;
				
				_items[i] = buffer.readS();
				_values[i] = buffer.readS();
				str = buffer.readS();
				if (str != null)
				{
					if (_icons == null)
						_icons = [];
					_icons[i] = str;
				}
				
				buffer.pos = nextPos;
			}
			
			str = buffer.readS();
			if (str != null)
			{
				this.text = str;
				_selectedIndex = _items.indexOf(str);
			}
			else if (_items.length > 0)
			{
				_selectedIndex = 0;
				this.text = _items[0];
			}
			else
				_selectedIndex = -1;
			
			str = buffer.readS();
			if (str != null)
				this.icon = str;
			
			if (buffer.readBool())
				this.titleColor = buffer.readColorS();
			iv = buffer.getInt32();
			if (iv > 0)
				_visibleItemCount = iv;
			_popupDirection = buffer.readByte();
			
			iv = buffer.getInt16();
			if (iv >= 0)
				_selectionController = parent.getControllerAt(iv);
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
			
			var downward:* = null;
			if (_popupDirection == PopupDirection.Down)
				downward = true;
			else if (_popupDirection == PopupDirection.Up)
				downward = false;
			
			this.root.togglePopup(this.dropdown, this, downward);
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