namespace fgui {
    export class PopupMenu {

        protected _contentPane: GComponent;
        protected _list: GList;

        constructor(resourceURL?: string) {
            if (!resourceURL) {
                resourceURL = UIConfig.popupMenu;
                if (!resourceURL)
                    throw "UIConfig.popupMenu not defined";
            }
            this._contentPane = UIPackage.createObjectFromURL(resourceURL).asCom;
            this._contentPane.on(Laya.Event.DISPLAY, this, this.__addedToStage);
            this._list = <GList>(this._contentPane.getChild("list"));
            this._list.removeChildrenToPool();
            this._list.addRelation(this._contentPane, RelationType.Width);
            this._list.removeRelation(this._contentPane, RelationType.Height);
            this._contentPane.addRelation(this._list, RelationType.Height);
            this._list.on(Events.CLICK_ITEM, this, this.__clickItem);
        }

        public dispose(): void {
            this._contentPane.dispose();
        }

        public addItem(caption: string, handler?: Laya.Handler): GButton {
            var item: GButton = this._list.addItemFromPool().asButton;
            item.title = caption;
            item.data = handler;
            item.grayed = false;
            var c: Controller = item.getController("checked");
            if (c)
                c.selectedIndex = 0;
            return item;
        }

        public addItemAt(caption: string, index: number, handler?: Laya.Handler): GButton {
            var item: GButton = this._list.getFromPool().asButton;
            this._list.addChildAt(item, index);
            item.title = caption;
            item.data = handler;
            item.grayed = false;
            var c: Controller = item.getController("checked");
            if (c)
                c.selectedIndex = 0;
            return item;
        }

        public addSeperator(): void {
            if (UIConfig.popupMenu_seperator == null)
                throw "UIConfig.popupMenu_seperator not defined";
            this.list.addItemFromPool(UIConfig.popupMenu_seperator);
        }

        public getItemName(index: number): string {
            var item: GObject = this._list.getChildAt(index);
            return item.name;
        }

        public setItemText(name: string, caption: string): void {
            var item: GButton = this._list.getChild(name).asButton;
            item.title = caption;
        }

        public setItemVisible(name: string, visible: boolean): void {
            var item: GButton = this._list.getChild(name).asButton;
            if (item.visible != visible) {
                item.visible = visible;
                this._list.setBoundsChangedFlag();
            }
        }

        public setItemGrayed(name: string, grayed: boolean): void {
            var item: GButton = this._list.getChild(name).asButton;
            item.grayed = grayed;
        }

        public setItemCheckable(name: string, checkable: boolean): void {
            var item: GButton = this._list.getChild(name).asButton;
            var c: Controller = item.getController("checked");
            if (c) {
                if (checkable) {
                    if (c.selectedIndex == 0)
                        c.selectedIndex = 1;
                }
                else
                    c.selectedIndex = 0;
            }
        }

        public setItemChecked(name: string, checked: boolean): void {
            var item: GButton = this._list.getChild(name).asButton;
            var c: Controller = item.getController("checked");
            if (c)
                c.selectedIndex = checked ? 2 : 1;
        }

        public isItemChecked(name: string): boolean {
            var item: GButton = this._list.getChild(name).asButton;
            var c: Controller = item.getController("checked");
            if (c)
                return c.selectedIndex == 2;
            else
                return false;
        }

        public removeItem(name: string): boolean {
            var item: GObject = this._list.getChild(name);
            if (item) {
                var index: number = this._list.getChildIndex(item);
                this._list.removeChildToPoolAt(index);
                return true;
            }
            else
                return false;
        }

        public clearItems(): void {
            this._list.removeChildrenToPool();
        }

        public get itemCount(): number {
            return this._list.numChildren;
        }

        public get contentPane(): GComponent {
            return this._contentPane;
        }

        public get list(): GList {
            return this._list;
        }

        public show(target: GObject = null, dir?: PopupDirection | boolean) {
            var r: GRoot = target != null ? target.root : GRoot.inst;
            r.showPopup(this.contentPane, (target instanceof GRoot) ? null : target, dir);
        }

        private __clickItem(itemObject: GObject): void {
            Laya.timer.once(100, this, this.__clickItem2, [itemObject]);
        }

        private __clickItem2(itemObject: GObject): void {
            if (!(itemObject instanceof GButton))
                return;
            if (itemObject.grayed) {
                this._list.selectedIndex = -1;
                return;
            }
            var c: Controller = itemObject.asCom.getController("checked");
            if (c && c.selectedIndex != 0) {
                if (c.selectedIndex == 1)
                    c.selectedIndex = 2;
                else
                    c.selectedIndex = 1;
            }
            var r: GRoot = <GRoot>(this._contentPane.parent);
            r.hidePopup(this.contentPane);
            if (itemObject.data != null) {
                (<Laya.Handler>itemObject.data).run();
            }
        }

        private __addedToStage(): void {
            this._list.selectedIndex = -1;
            this._list.resizeToFit(100000, 10);
        }

    }
}