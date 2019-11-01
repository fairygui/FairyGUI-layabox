import ScrollPaneHeader from "./ScrollPaneHeader"

export default class PullToRefreshDemo {
    private _view: fgui.GComponent;
    private _list1: fgui.GList;
    private _list2: fgui.GList;

    constructor() {
        fgui.UIObjectFactory.setExtension("ui://PullToRefresh/Header", ScrollPaneHeader);
        
        fgui.UIPackage.loadPackage("res/UI/PullToRefresh", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("PullToRefresh", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);

        this._list1 = this._view.getChild("list1").asList;
        this._list1.itemRenderer = Laya.Handler.create(this, this.renderListItem1, null, false);
        this._list1.setVirtual();
        this._list1.numItems = 1;
        this._list1.on(fgui.Events.PULL_DOWN_RELEASE, this, this.onPullDownToRefresh);

        this._list2 = this._view.getChild("list2").asList;
        this._list2.itemRenderer = Laya.Handler.create(this, this.renderListItem2, null, false);
        this._list2.setVirtual();
        this._list2.numItems = 1;
        this._list2.on(fgui.Events.PULL_UP_RELEASE, this, this.onPullUpToRefresh);
    }

    private renderListItem1(index: number, item: fgui.GObject): void {
        item.text = "Item " + (this._list1.numItems - index - 1);
    }

    private renderListItem2(index: number, item: fgui.GObject): void {
        item.text = "Item " + index;
    }

    private onPullDownToRefresh(evt: laya.events.Event): void {
        var header: ScrollPaneHeader = <ScrollPaneHeader>(this._list1.scrollPane.header);
        if (header.readyToRefresh) {
            header.setRefreshStatus(2);
            this._list1.scrollPane.lockHeader(header.sourceHeight);

            //Simulate a async resquest
            Laya.timer.once(2000, this, function (): void {
                if(this._view.isDisposed)
                    return;
                this._list1.numItems += 5;

                //Refresh completed
                header.setRefreshStatus(3);
                this._list1.scrollPane.lockHeader(35);

                Laya.timer.once(2000, this, function (): void {
                    header.setRefreshStatus(0);
                    this._list1.scrollPane.lockHeader(0);
                });
            });
        }
    }

    private onPullUpToRefresh(evt: laya.events.Event): void {
        var footer: fgui.GComponent = this._list2.scrollPane.footer.asCom;

        footer.getController("c1").selectedIndex = 1;
        this._list2.scrollPane.lockFooter(footer.sourceHeight);

        //Simulate a async resquest
        Laya.timer.once(2000, this, function (): void {
            if(this._view.isDisposed)
                return;
            this._list2.numItems += 5;

            //Refresh completed
            footer.getController("c1").selectedIndex = 0;
            this._list2.scrollPane.lockFooter(0);
        });
    }
}

