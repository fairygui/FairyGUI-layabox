import MailItem from "./MailItem"

export default class VirtualListDemo {
    private _view: fgui.GComponent;
    private _list: fgui.GList;

    constructor() {
        fgui.UIPackage.loadPackage("res/UI/VirtualList", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        fgui.UIObjectFactory.setExtension("ui://VirtualList/mailItem", MailItem);
        
        this._view = fgui.UIPackage.createObject("VirtualList", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);

        this._view.getChild("n6").onClick(this, function (): void { this._list.addSelection(500, true); });
        this._view.getChild("n7").onClick(this, function (): void { this._list.scrollPane.scrollTop(); });
        this._view.getChild("n8").onClick(this, function (): void { this._list.scrollPane.scrollBottom(); });

        this._list = this._view.getChild("mailList").asList;
        this._list.setVirtual();

        this._list.itemRenderer = Laya.Handler.create(this, this.renderListItem, null, false);
        this._list.numItems = 1000;
    }

    private renderListItem(index: number, obj: fgui.GObject): void {
        var item: MailItem = <MailItem>obj;
        item.setFetched(index % 3 == 0);
        item.setRead(index % 2 == 0);
        item.setTime("5 Nov 2015 16:24:33");
        item.title = index + " Mail title here";
    }
}

