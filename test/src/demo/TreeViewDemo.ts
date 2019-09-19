export default class TreeViewDemo {
    private _view: fgui.GComponent;

    constructor() {
        fgui.UIPackage.loadPackage("res/UI/TreeView", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
       
    }
}
