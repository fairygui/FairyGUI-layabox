export class GuideDemo {
    private _view: fgui.GComponent;
    private _guideLayer: fgui.GComponent;

    constructor() {
        fgui.UIPackage.loadPackage("resources/ui/Guide", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("Guide", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);

        this._guideLayer = fgui.UIPackage.createObject("Guide", "GuideLayer").asCom;
        this._guideLayer.makeFullScreen();
        this._guideLayer.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);

        let bagBtn = this._view.getChild("bagBtn");
        bagBtn.onClick(this, () => {
            this._guideLayer.removeFromParent();
        });

        this._view.getChild("n2").onClick(this, () => {
            fgui.GRoot.inst.addChild(this._guideLayer);
            let rect = bagBtn.localToGlobalRect(0, 0, bagBtn.width, bagBtn.height);
            rect = this._guideLayer.globalToLocalRect(rect.x, rect.y, rect.width, rect.height);

            let window = this._guideLayer.getChild("window");
            window.setSize(rect.width, rect.height);
            fgui.GTween.to2(window.x, window.y, rect.x, rect.y, 0.5).setTarget(window, window.setXY);
        });
    }
}
