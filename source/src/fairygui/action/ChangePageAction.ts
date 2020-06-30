///<reference path="ControllerAction.ts"/>

namespace fgui {
    export class ChangePageAction extends ControllerAction {
        public objectId: string;
        public controllerName: string;
        public targetPage: string;

        constructor() {
            super();
        }

        protected enter(controller: Controller): void {
            if (!this.controllerName)
                return;

            var gcom: GComponent;
            if (this.objectId)
                gcom = <GComponent>controller.parent.getChildById(this.objectId);
            else
                gcom = controller.parent;
            if (gcom) {
                var cc: Controller = gcom.getController(this.controllerName);
                if (cc && cc != controller && !cc.changing) {
                    if (this.targetPage == "~1") {
                        if (controller.selectedIndex < cc.pageCount)
                            cc.selectedIndex = controller.selectedIndex;
                    }
                    else if (this.targetPage == "~2")
                        cc.selectedPage = controller.selectedPage;
                    else
                        cc.selectedPageId = this.targetPage;
                }
            }
        }

        public setup(buffer: ByteBuffer): void {
            super.setup(buffer);

            this.objectId = buffer.readS();
            this.controllerName = buffer.readS();
            this.targetPage = buffer.readS();
        }
    }

}