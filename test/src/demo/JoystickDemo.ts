import JoystickModule from "./JoystickModule"

export default class JoystickDemo {
    private _view: fgui.GComponent;
    private _joystick: JoystickModule;
    private _text: fgui.GTextField;

    constructor() {
        fgui.UIPackage.loadPackage("res/UI/Joystick", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("Joystick", "Main").asCom;
        this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        fgui.GRoot.inst.addChild(this._view);

        this._text = this._view.getChild("n9").asTextField;

        this._joystick = new JoystickModule(this._view);
        this._joystick.on(JoystickModule.JoystickMoving, this, this.onJoystickMoving);
        this._joystick.on(JoystickModule.JoystickUp, this, this.onJoystickUp);
    }

    private onJoystickMoving(degree: number): void {
        this._text.text = "" + degree;
    }

    private onJoystickUp(): void {
        this._text.text = "";
    }
}