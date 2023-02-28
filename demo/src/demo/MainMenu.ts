import { BasicDemo } from "./BasicsDemo";
import { TransitionDemo } from "./TransitionDemo";
import { VirtualListDemo } from "./VirtualListDemo";
import { LoopListDemo } from "./LoopListDemo";
import { PullToRefreshDemo } from "./PullToRefreshDemo";
import { ModalWaitingDemo } from "./ModalWaitingDemo";
import { JoystickDemo } from "./JoystickDemo";
import { BagDemo } from "./BagDemo";
import { ListEffectDemo } from "./ListEffectDemo";
import { GuideDemo } from "./GuideDemo";
import { CooldownDemo } from "./CooldownDemo";
import { HitTestDemo } from "./HitTestDemo";
import { ChatDemo } from "./ChatDemo";
import { ScrollPaneDemo } from "./ScrollPaneDemo";
import { TreeViewDemo } from "./TreeViewDemo";

export class MainMenu {
    private _view: fgui.GComponent;

    constructor() {
        fgui.UIPackage.loadPackage("resources/ui/MainMenu", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("MainMenu", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);

        this._view.getChild("n1").onClick(this, () => {
            this.startDemo(BasicDemo);
        });
        this._view.getChild("n2").onClick(this, () => {
            this.startDemo(TransitionDemo);
        });
        this._view.getChild("n4").onClick(this, () => {
            this.startDemo(VirtualListDemo);
        });
        this._view.getChild("n5").onClick(this, () => {
            this.startDemo(LoopListDemo);
        });
        this._view.getChild("n6").onClick(this, () => {
            this.startDemo(HitTestDemo);
        });
        this._view.getChild("n7").onClick(this, () => {
            this.startDemo(PullToRefreshDemo);
        });
        this._view.getChild("n8").onClick(this, () => {
            this.startDemo(ModalWaitingDemo);
        });
        this._view.getChild("n9").onClick(this, () => {
            this.startDemo(JoystickDemo);
        });
        this._view.getChild("n10").onClick(this, () => {
            this.startDemo(BagDemo);
        });
        this._view.getChild("n11").onClick(this, () => {
            this.startDemo(ChatDemo);
        });
        this._view.getChild("n12").onClick(this, () => {
            this.startDemo(ListEffectDemo);
        });
        this._view.getChild("n13").onClick(this, () => {
            this.startDemo(ScrollPaneDemo);
        });
        this._view.getChild("n14").onClick(this, () => {
            this.startDemo(TreeViewDemo);
        });
        this._view.getChild("n15").onClick(this, () => {
            this.startDemo(GuideDemo);
        });
        this._view.getChild("n16").onClick(this, () => {
            this.startDemo(CooldownDemo);
        });
    }

    startDemo(demoClass: any): void {
        this._view.dispose();
        let demo: any = new demoClass();
        Laya.stage.event("start_demo", demo);
    }

    destroy() {
        this._view.dispose();
    }
}