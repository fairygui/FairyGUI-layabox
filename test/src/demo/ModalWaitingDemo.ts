import { TestWin } from "./TestWin"

export default class ModalWaitingDemo {
    private _view: fgui.GComponent;
    private _testWin: TestWin;

    constructor() {
        fgui.UIConfig.globalModalWaiting = "ui://ModalWaiting/GlobalModalWaiting";
        fgui.UIConfig.windowModalWaiting = "ui://ModalWaiting/WindowModalWaiting";

        fgui.UIObjectFactory.setExtension("ui://ModalWaiting/GlobalModalWaiting", GlobalWaiting);

        fgui.UIPackage.loadPackage("res/UI/ModalWaiting", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        fgui.UIObjectFactory.setExtension("ui://ModalWaiting/GlobalWaiting", GlobalWaiting);

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

class GlobalWaiting extends fgui.GComponent {
    private _obj: fgui.GObject;

    public constructor() {
        super();
    }

    protected onConstruct():void
    {        
        this._obj = this.getChild("n1");
        this.on(Laya.Event.DISPLAY,this,this.onAddedToStage);
        this.on(Laya.Event.UNDISPLAY,this,this.onRemoveFromStage);
    }
    
    private onAddedToStage():void {
        Laya.timer.frameLoop(2, this, this.onTimer);
    }
    
    private onRemoveFromStage():void {
        Laya.timer.clear(this, this.onTimer);
    }
    
    private onTimer():void {
        var i:number = this._obj.rotation;
        i += 10;
        if(i > 360)
            i = i % 360;
        this._obj.rotation = i;
    }
}