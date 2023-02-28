import { DemoEntry } from "./demo/DemoEntry";

const { regClass, property } = Laya;

@regClass()
export class Main extends Laya.Script {

    onStart() {
        Laya.stage.addChild(fgui.GRoot.inst.displayObject);

        new DemoEntry();
    }
}