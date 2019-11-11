import { TestWin } from "./TestWin"

export default class ModalWaitingDemo {
    private _view: fgui.GComponent;
    private _testWin: TestWin;

    constructor() {
        fgui.UIConfig.globalModalWaiting = "ui://ModalWaiting/GlobalModalWaiting";
        fgui.UIConfig.windowModalWaiting = "ui://ModalWaiting/WindowModalWaiting";

        fgui.UIPackage.loadPackage("res/UI/ModalWaiting", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("ModalWaiting", "Main").asCom;
        this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        fgui.GRoot.inst.addChild(this._view);

        this._testWin = new TestWin();
        this._view.getChild("n0").onClick(this, function (): void { this._testWin.show(); });

        //这里模拟一个要锁住全屏的等待过程
        fgui.GRoot.inst.showModalWait();
        Laya.timer.once(3000,this, function(): void {
            fgui.GRoot.inst.closeModalWait();
        });
    }
}