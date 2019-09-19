export default class LoopListDemo {
    private _view: fgui.GComponent;
    private _list: fgui.GList;

    constructor() {
        fgui.UIPackage.loadPackage("res/UI/LoopList", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("LoopList", "Main").asCom;
        this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        fgui.GRoot.inst.addChild(this._view);

        this._list = this._view.getChild("list").asList;
        this._list.setVirtualAndLoop();

        this._list.itemRenderer = Laya.Handler.create(this, this.renderListItem, null, false);
        this._list.numItems = 5;
        this._list.on(fgui.Events.SCROLL, this, this.doSpecialEffect);
        this.doSpecialEffect();
    }

    private doSpecialEffect(): void {
        //change the scale according to the distance to the middle
        var midX: number = this._list.scrollPane.posX + this._list.viewWidth / 2;
        var cnt: number = this._list.numChildren;
        for (var i: number = 0; i < cnt; i++) {
            var obj: fgui.GObject = this._list.getChildAt(i);
            var dist: number = Math.abs(midX - obj.x - obj.width / 2);
            if (dist > obj.width) //no intersection
                obj.setScale(1, 1);
            else {
                var ss: number = 1 + (1 - dist / obj.width) * 0.24;
                obj.setScale(ss, ss);
            }
        }

        this._view.getChild("n3").text = "" + ((this._list.getFirstChildInView() + 1) % this._list.numItems);
    }

    private renderListItem(index: number, obj: fgui.GObject): void {
        var item: fgui.GButton = <fgui.GButton>obj;
        item.setPivot(0.5, 0.5);
        item.icon = fgui.UIPackage.getItemURL("LoopList", "n" + (index + 1));
    }
}

