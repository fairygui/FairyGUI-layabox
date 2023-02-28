export class ScrollPaneDemo {
    private _view: fgui.GComponent;
    private _list: fgui.GList;

    constructor() {
        fgui.UIPackage.loadPackage("resources/ui/ScrollPane", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("ScrollPane", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);

        this._list = this._view.getChild("list").asList;
        this._list.itemRenderer = Laya.Handler.create(this, this.renderListItem, null, false);
        this._list.setVirtual();
        this._list.numItems = 1000;
        this._list.on(Laya.Event.MOUSE_DOWN, this, this.onClickList);
    }

    private renderListItem(index: number, item: fgui.GButton) {
        item.title = "Item " + index;
        item.scrollPane.posX = 0; //reset scroll pos

        item.getChild("b0").onClick(this, this.onClickStick);
        item.getChild("b1").onClick(this, this.onClickDelete);
    }

    private onClickList(evt: Laya.Event) {
        //点击列表时，查找是否有项目处于编辑状态， 如果有就归位
        let touchTarget = fgui.GObject.cast(evt.target);
        let cnt = this._list.numChildren;
        for (let i: number = 0; i < cnt; i++) {
            let item: fgui.GButton = this._list.getChildAt(i).asButton;
            if (item.scrollPane.posX != 0) {
                //Check if clicked on the button
                if (item.getChild("b0").asButton.isAncestorOf(touchTarget)
                    || item.getChild("b1").asButton.isAncestorOf(touchTarget)) {
                    return;
                }
                item.scrollPane.setPosX(0, true);

                //取消滚动面板可能发生的拉动。
                item.scrollPane.cancelDragging();
                this._list.scrollPane.cancelDragging();
                break;
            }
        }
    }

    private onClickStick(evt: Laya.Event) {
        this._view.getChild("txt").text = "Stick " + fgui.GObject.cast(evt.currentTarget).parent.text;
    }

    private onClickDelete(evt: Laya.Event) {
        this._view.getChild("txt").text = "Delete " + fgui.GObject.cast(evt.currentTarget).parent.text;
    }
}
