namespace fgui {
    export class GearColor extends GearBase {
        private _storage: Object;
        private _default: GearColorValue;

        constructor(owner: GObject) {
            super(owner);
        }

        protected init(): void {
            this._default = new GearColorValue(this._owner.getProp(ObjectPropID.Color),
                this._owner.getProp(ObjectPropID.OutlineColor));
            this._storage = {};
        }

        protected addStatus(pageId: string, buffer: ByteBuffer): void {
            var gv: GearColorValue;
            if (pageId == null)
                gv = this._default;
            else {
                gv = new GearColorValue();
                this._storage[pageId] = gv;
            }

            gv.color = buffer.readColorS();
            gv.strokeColor = buffer.readColorS();
        }

        public apply(): void {
            this._owner._gearLocked = true;

            var gv: GearColorValue = this._storage[this._controller.selectedPageId];
            if (!gv)
                gv = this._default;

            this._owner.setProp(ObjectPropID.Color, gv.color);
            if (gv.strokeColor != null)
                this._owner.setProp(ObjectPropID.OutlineColor, gv.strokeColor);

            this._owner._gearLocked = false;
        }

        public updateState(): void {
            var gv: GearColorValue = this._storage[this._controller.selectedPageId];
            if (!gv) {
                gv = new GearColorValue(null, null);
                this._storage[this._controller.selectedPageId] = gv;
            }

            gv.color = this._owner.getProp(ObjectPropID.Color);
            gv.strokeColor = this._owner.getProp(ObjectPropID.OutlineColor);
        }
    }


    class GearColorValue {
        public color: string;
        public strokeColor: string;

        constructor(color: string = null, strokeColor: string = null) {
            this.color = color;
            this.strokeColor = strokeColor;
        }
    }
}