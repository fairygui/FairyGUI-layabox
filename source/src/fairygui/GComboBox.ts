namespace fgui {
    export class GComboBox extends GComponent {
        public dropdown: GComponent;

        protected _titleObject: GObject;
        protected _iconObject: GObject;
        protected _list: GList;

        protected _items: any[];
        protected _icons: any[];
        protected _values: any[];
        protected _popupDirection: number;

        private _visibleItemCount: number;
        private _itemsUpdated: boolean;
        private _selectedIndex: number;
        private _buttonController: Controller;
        private _selectionController: Controller;

        private _down: boolean;
        private _over: boolean;

        constructor() {
            super();
            this._visibleItemCount = UIConfig.defaultComboBoxVisibleItemCount;
            this._itemsUpdated = true;
            this._selectedIndex = -1;
            this._popupDirection = 0;
            this._items = [];
            this._values = [];
        }

        public get text(): string {
            if (this._titleObject)
                return this._titleObject.text;
            else
                return null;
        }

        public set text(value: string) {
            if (this._titleObject)
                this._titleObject.text = value;
            this.updateGear(6);
        }

        public get titleColor(): string {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                return tf.color;
            else
                return "#000000";
        }

        public set titleColor(value: string) {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                tf.color = value;
            this.updateGear(4);
        }

        public get titleFontSize(): number {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                return tf.fontSize;
            else
                return 0;
        }

        public set titleFontSize(value: number) {
            var tf: GTextField = this.getTextField();
            if (tf != null)
                tf.fontSize = value;
        }

        public get icon(): string {
            if (this._iconObject)
                return this._iconObject.icon;
            else
                return null;
        }

        public set icon(value: string) {
            if (this._iconObject)
                this._iconObject.icon = value;
            this.updateGear(7);
        }

        public get visibleItemCount(): number {
            return this._visibleItemCount;
        }

        public set visibleItemCount(value: number) {
            this._visibleItemCount = value;
        }

        /**
         * @see PopupDirection
         */
        public get popupDirection(): number {
            return this._popupDirection;
        }

        /**
         * @see PopupDirection
         */
        public set popupDirection(value: number) {
            this._popupDirection = value;
        }

        public get items(): any[] {
            return this._items;
        }

        public set items(value: any[]) {
            if (!value)
                this._items.length = 0;
            else
                this._items = value.concat();
            if (this._items.length > 0) {
                if (this._selectedIndex >= this._items.length)
                    this._selectedIndex = this._items.length - 1;
                else if (this._selectedIndex == -1)
                    this._selectedIndex = 0;

                this.text = this._items[this._selectedIndex];
                if (this._icons != null && this._selectedIndex < this._icons.length)
                    this.icon = this._icons[this._selectedIndex];
            }
            else {
                this.text = "";
                if (this._icons != null)
                    this.icon = null;
                this._selectedIndex = -1;
            }
            this._itemsUpdated = true;
        }

        public get icons(): any[] {
            return this._icons;
        }

        public set icons(value: any[]) {
            this._icons = value;
            if (this._icons != null && this._selectedIndex != -1 && this._selectedIndex < this._icons.length)
                this.icon = this._icons[this._selectedIndex];
        }

        public get values(): any[] {
            return this._values;
        }

        public set values(value: any[]) {
            if (!value)
                this._values.length = 0;
            else
                this._values = value.concat();
        }

        public get selectedIndex(): number {
            return this._selectedIndex;
        }

        public set selectedIndex(val: number) {
            if (this._selectedIndex == val)
                return;

            this._selectedIndex = val;
            if (this._selectedIndex >= 0 && this._selectedIndex < this._items.length) {
                this.text = this._items[this._selectedIndex];
                if (this._icons != null && this._selectedIndex < this._icons.length)
                    this.icon = this._icons[this._selectedIndex];
            }
            else {
                this.text = "";
                if (this._icons != null)
                    this.icon = null;
            }

            this.updateSelectionController();
        }

        public get value(): string {
            return this._values[this._selectedIndex];
        }

        public set value(val: string) {
            var index: number = this._values.indexOf(val);
            if (index == -1 && val == null)
                index = this._values.indexOf("");
            this.selectedIndex = index;
        }

        public getTextField(): GTextField {
            if (this._titleObject instanceof GTextField)
                return <GTextField>this._titleObject;
            else if (this._titleObject instanceof GLabel)
                return (<GLabel>this._titleObject).getTextField();
            else if (this._titleObject instanceof GButton)
                return (<GButton>this._titleObject).getTextField();
            else
                return null;
        }

        protected setState(val: string): void {
            if (this._buttonController)
                this._buttonController.selectedPage = val;
        }

        public get selectionController(): Controller {
            return this._selectionController;
        }

        public set selectionController(value: Controller) {
            this._selectionController = value;
        }

        public handleControllerChanged(c: Controller): void {
            super.handleControllerChanged(c);

            if (this._selectionController == c)
                this.selectedIndex = c.selectedIndex;
        }

        private updateSelectionController(): void {
            if (this._selectionController != null && !this._selectionController.changing
                && this._selectedIndex < this._selectionController.pageCount) {
                var c: Controller = this._selectionController;
                this._selectionController = null;
                c.selectedIndex = this._selectedIndex;
                this._selectionController = c;
            }
        }

        public dispose(): void {
            if (this.dropdown) {
                this.dropdown.dispose();
                this.dropdown = null;
            }

            this._selectionController = null;

            super.dispose();
        }

        public getProp(index: number): any {
            switch (index) {
                case ObjectPropID.Color:
                    return this.titleColor;
                case ObjectPropID.OutlineColor:
                    {
                        var tf: GTextField = this.getTextField();
                        if (tf)
                            return tf.strokeColor;
                        else
                            return 0;
                    }
                case ObjectPropID.FontSize:
                    {
                        tf = this.getTextField();
                        if (tf)
                            return tf.fontSize;
                        else
                            return 0;
                    }
                default:
                    return super.getProp(index);
            }
        }

        public setProp(index: number, value: any): void {
            switch (index) {
                case ObjectPropID.Color:
                    this.titleColor = value;
                    break;
                case ObjectPropID.OutlineColor:
                    {
                        var tf: GTextField = this.getTextField();
                        if (tf)
                            tf.strokeColor = value;
                    }
                    break;
                case ObjectPropID.FontSize:
                    {
                        tf = this.getTextField();
                        if (tf)
                            tf.fontSize = value;
                    }
                    break;
                default:
                    super.setProp(index, value);
                    break;
            }
        }

        protected constructExtension(buffer: ByteBuffer): void {

            var str: string;

            this._buttonController = this.getController("button");
            this._titleObject = this.getChild("title");
            this._iconObject = this.getChild("icon");

            str = buffer.readS();
            if (str) {
                this.dropdown = <GComponent>(UIPackage.createObjectFromURL(str));
                if (!this.dropdown) {
                    Laya.Log.print("下拉框必须为元件");
                    return;
                }
                this.dropdown.name = "this._dropdownObject";
                this._list = this.dropdown.getChild("list").asList;
                if (this._list == null) {
                    Laya.Log.print(this.resourceURL + ": 下拉框的弹出元件里必须包含名为list的列表");
                    return;
                }
                this._list.on(Events.CLICK_ITEM, this, this.__clickItem);

                this._list.addRelation(this.dropdown, RelationType.Width);
                this._list.removeRelation(this.dropdown, RelationType.Height);

                this.dropdown.addRelation(this._list, RelationType.Height);
                this.dropdown.removeRelation(this._list, RelationType.Width);

                this.dropdown.displayObject.on(Laya.Event.UNDISPLAY, this, this.__popupWinClosed);
            }

            this.on(Laya.Event.ROLL_OVER, this, this.__rollover);
            this.on(Laya.Event.ROLL_OUT, this, this.__rollout);
            this.on(Laya.Event.MOUSE_DOWN, this, this.__mousedown);
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            if (!buffer.seek(beginPos, 6))
                return;

            if (buffer.readByte() != this.packageItem.objectType)
                return;

            var i: number;
            var iv: number;
            var nextPos: number;
            var str: string;
            var itemCount: number = buffer.getInt16();
            for (i = 0; i < itemCount; i++) {
                nextPos = buffer.getInt16();
                nextPos += buffer.pos;

                this._items[i] = buffer.readS();
                this._values[i] = buffer.readS();
                str = buffer.readS();
                if (str != null) {
                    if (this._icons == null)
                        this._icons = [];
                    this._icons[i] = str;
                }

                buffer.pos = nextPos;
            }

            str = buffer.readS();
            if (str != null) {
                this.text = str;
                this._selectedIndex = this._items.indexOf(str);
            }
            else if (this._items.length > 0) {
                this._selectedIndex = 0;
                this.text = this._items[0];
            }
            else
                this._selectedIndex = -1;

            str = buffer.readS();
            if (str != null)
                this.icon = str;

            if (buffer.readBool())
                this.titleColor = buffer.readColorS();
            iv = buffer.getInt32();
            if (iv > 0)
                this._visibleItemCount = iv;
            this._popupDirection = buffer.readByte();

            iv = buffer.getInt16();
            if (iv >= 0)
                this._selectionController = this.parent.getControllerAt(iv);
        }

        protected showDropdown(): void {
            if (this._itemsUpdated) {
                this._itemsUpdated = false;

                this._list.removeChildrenToPool();
                var cnt: number = this._items.length;
                for (var i: number = 0; i < cnt; i++) {
                    var item: GObject = this._list.addItemFromPool();
                    item.name = i < this._values.length ? this._values[i] : "";
                    item.text = this._items[i];
                    item.icon = (this._icons != null && i < this._icons.length) ? this._icons[i] : null;
                }
                this._list.resizeToFit(this._visibleItemCount);
            }
            this._list.selectedIndex = -1;
            this.dropdown.width = this.width;
            this._list.ensureBoundsCorrect();

            var downward: any = null;
            if (this._popupDirection == PopupDirection.Down)
                downward = true;
            else if (this._popupDirection == PopupDirection.Up)
                downward = false;

            this.root.togglePopup(this.dropdown, this, downward);
            if (this.dropdown.parent)
                this.setState(GButton.DOWN);
        }

        private __popupWinClosed(): void {
            if (this._over)
                this.setState(GButton.OVER);
            else
                this.setState(GButton.UP);
        }

        private __clickItem(itemObject: GObject, evt: Laya.Event): void {
            Laya.timer.callLater(this, this.__clickItem2, [this._list.getChildIndex(itemObject), evt])
        }

        private __clickItem2(index: number, evt: Laya.Event): void {
            if (this.dropdown.parent instanceof GRoot)
                (<GRoot>this.dropdown.parent).hidePopup();

            this._selectedIndex = -1;
            this.selectedIndex = index;
            Events.dispatch(Events.STATE_CHANGED, this.displayObject, evt);
        }

        private __rollover(): void {
            this._over = true;
            if (this._down || this.dropdown && this.dropdown.parent)
                return;

            this.setState(GButton.OVER);
        }

        private __rollout(): void {
            this._over = false;
            if (this._down || this.dropdown && this.dropdown.parent)
                return;

            this.setState(GButton.UP);
        }

        private __mousedown(evt: Laya.Event): void {
            if (evt.target instanceof Laya.Input)
                return;

            this._down = true;
            GRoot.inst.checkPopups(evt.target);

            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.__mouseup);

            if (this.dropdown)
                this.showDropdown();
        }

        private __mouseup(): void {
            if (this._down) {
                this._down = false;
                Laya.stage.off(Laya.Event.MOUSE_UP, this, this.__mouseup);

                if (this.dropdown && !this.dropdown.parent) {
                    if (this._over)
                        this.setState(GButton.OVER);
                    else
                        this.setState(GButton.UP);
                }
            }
        }
    }

}