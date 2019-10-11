export default class TreeViewDemo {
    private _view: fgui.GComponent;

    constructor() {
        fgui.UIPackage.loadPackage("res/UI/TreeView", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("TreeView", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);
    }
}
