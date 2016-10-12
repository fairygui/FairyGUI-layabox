package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.events.Event;
	import laya.utils.Log;

    public class GComboBox extends GComponent {
		public var dropdown: GComponent;
		
        protected var _titleObject: GTextField;
        protected var _list: GList;

        private var _visibleItemCount: Number = 0;
        private var _items:Array;
        private var _values:Array;
        private var _itemsUpdated: Boolean;
        private var _selectedIndex: Number = 0;
        private var _buttonController: Controller;
		private var _popupDownward:* = true;
		
        private var _over: Boolean;
        private var _down: Boolean;

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
            if (this._titleObject)
                return this._titleObject.color;
            else
                return "#000000";
        }

        public function set titleColor(value: String):void {
            if (this._titleObject)
                this._titleObject.color = value;
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

        public function set items(value: Array):void {
            if (!value)
                this._items.length = 0;
            else
                this._items = value.concat();
            if(this._items.length > 0) {
                if(this._selectedIndex >= this._items.length)
                    this._selectedIndex = this._items.length - 1;
                else if(this._selectedIndex == -1)
                    this._selectedIndex = 0;

                this.text = this._items[this._selectedIndex];
            }
            else
                this.text = "";
            this._itemsUpdated = true;
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

        public function get selectedIndex(): Number {
            return this._selectedIndex;
        }

        public function set selectedIndex(val: Number):void {
            if (this._selectedIndex == val)
                return;

            this._selectedIndex = val;
            if (this.selectedIndex >= 0 && this.selectedIndex < this._items.length)
                this.text = this._items[this._selectedIndex];
            else
                this.text = "";
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
		
		override public function dispose():void
		{
			if(this.dropdown)
			{
				this.dropdown.dispose();
				this.dropdown = null;
			}
			
			super.dispose();
		}

		override protected function constructFromXML(xml: Object): void {
            super.constructFromXML(xml);

            xml = ToolSet.findChildNode(xml, "ComboBox");
            var str: String;

            this._buttonController = this.getController("button");
            this._titleObject = GTextField(this.getChild("title"));
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
				
				str = xml.getAttribute("direction");
				if(str)
				{
					if(str=="up")
						this._popupDownward = false;
					else if(str=="auto")
						this._popupDownward = null;
				}
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

            this._selectedIndex = index;
            if (this._selectedIndex >= 0)
                this.text = this._items[this._selectedIndex];
            else
                this.text = "";
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