import BasicDemo from "./BasicsDemo";
import TransitionDemo from "./TransitionDemo";
import VirtualListDemo from "./VirtualListDemo";
import LoopListDemo from "./LoopListDemo";
import PullToRefreshDemo from "./PullToRefreshDemo";
import ModalWaitingDemo from "./ModalWaitingDemo";
import JoystickDemo from "./JoystickDemo";
import BagDemo from "./BagDemo";
import ListEffectDemo from "./ListEffectDemo";
import GuideDemo from "./GuideDemo";
import CooldownDemo from "./CooldownDemo";
import HitTestDemo from "./HitTestDemo";
import ChatDemo from "./ChatDemo";
import ScrollPaneDemo from "./ScrollPaneDemo";
import TreeViewDemo from "./TreeViewDemo";

export default class MainMenu {
    private _view: fgui.GComponent;

    constructor() {
        fgui.UIPackage.loadPackage("res/UI/MainMenu", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("MainMenu", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);

        this._view.getChild("n1").onClick(this, function () {
            this.startDemo(BasicDemo);
        });
        this._view.getChild("n2").onClick(this, function () {
            this.startDemo(TransitionDemo);
        });
        this._view.getChild("n4").onClick(this, function () {
            this.startDemo(VirtualListDemo);
        });
        this._view.getChild("n5").onClick(this, function () {
            this.startDemo(LoopListDemo);
        });
        this._view.getChild("n6").onClick(this, function () {
            this.startDemo(HitTestDemo);
        });
        this._view.getChild("n7").onClick(this, function () {
            this.startDemo(PullToRefreshDemo);
        });
        this._view.getChild("n8").onClick(this, function () {
            this.startDemo(ModalWaitingDemo);
        });
        this._view.getChild("n9").onClick(this, function () {
            this.startDemo(JoystickDemo);
        });
        this._view.getChild("n10").onClick(this, function () {
            this.startDemo(BagDemo);
        });
        this._view.getChild("n11").onClick(this, function () {
            this.startDemo(ChatDemo);
        });
        this._view.getChild("n12").onClick(this, function () {
            this.startDemo(ListEffectDemo);
        });
        this._view.getChild("n13").onClick(this, function () {
            this.startDemo(ScrollPaneDemo);
        });
        this._view.getChild("n14").onClick(this, function () {
            this.startDemo(TreeViewDemo);
        });
        this._view.getChild("n15").onClick(this, function () {
            this.startDemo(GuideDemo);
        });
        this._view.getChild("n16").onClick(this, function () {
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