export default class HitTestDemo {
    private _view: fgui.GComponent;

    constructor() {
        fgui.UIPackage.loadPackage("res/UI/HitTest", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("HitTest", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);
    }

    destroy() {

    }
}
