namespace fgui {
    export class GGraph extends GObject {
        private _type: number;
        private _lineSize: number;
        private _lineColor: string;
        private _fillColor: string;
        private _cornerRadius: any[];
        private _hitArea: Laya.HitArea;

        constructor() {
            super();

            this._type = 0;
            this._lineSize = 1;
            this._lineColor = "#000000"
            this._fillColor = "#FFFFFF";
            this._cornerRadius = null;
        }

        public drawRect(lineSize: number, lineColor: string, fillColor: string, cornerRadius: any[] = null): void {
            this._type = 1;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._fillColor = fillColor;
            this._cornerRadius = cornerRadius;
            this.drawCommon();
        }

        public drawEllipse(lineSize: number, lineColor: string, fillColor: string): void {
            this._type = 2;
            this._lineSize = lineSize;
            this._lineColor = lineColor;
            this._fillColor = fillColor;
            this.drawCommon();
        }

        public get color(): string {
            return this._fillColor;
        }

        public set color(value: string) {
            this._fillColor = value;
            if (this._type != 0)
                this.drawCommon();
        }

        private drawCommon(): void {
            this._displayObject.mouseEnabled = this.touchable;
            var gr: Laya.Graphics = this._displayObject.graphics;
            gr.clear();

            var w: number = this.width;
            var h: number = this.height;
            if (w == 0 || h == 0)
                return;

            var fillColor: string = this._fillColor;
            var lineColor: string = this._lineColor;
            if (/*Render.isWebGL &&*/ ToolSet.startsWith(fillColor, "rgba")) {
                //webgl下laya未支持rgba格式
                var arr: any[] = fillColor.substring(5, fillColor.lastIndexOf(")")).split(",");
                var a: number = parseFloat(arr[3]);
                if (a == 0)
                    fillColor = null;
                else {
                    fillColor = Laya.Utils.toHexColor((parseInt(arr[0]) << 16) + (parseInt(arr[1]) << 8) + parseInt(arr[2]));
                    this.alpha = a;
                }
            }
            if (this._type == 1) {
                if (this._cornerRadius != null) {
                    var paths: any[] = [
                        ["moveTo", this._cornerRadius[0], 0],
                        ["lineTo", w - this._cornerRadius[1], 0],
                        ["arcTo", w, 0, w, this._cornerRadius[1], this._cornerRadius[1]],
                        ["lineTo", w, h - this._cornerRadius[3]],
                        ["arcTo", w, h, w - this._cornerRadius[3], h, this._cornerRadius[3]],
                        ["lineTo", this._cornerRadius[2], h],
                        ["arcTo", 0, h, 0, h - this._cornerRadius[2], this._cornerRadius[2]],
                        ["lineTo", 0, this._cornerRadius[0]],
                        ["arcTo", 0, 0, this._cornerRadius[0], 0, this._cornerRadius[0]],
                        ["closePath"]
                    ];
                    gr.drawPath(0, 0, paths, { fillStyle: fillColor }, this._lineSize > 0 ? { strokeStyle: lineColor, lineWidth: this._lineSize } : null);
                }
                else
                    gr.drawRect(0, 0, w, h, fillColor, this._lineSize > 0 ? lineColor : null, this._lineSize);
            } else {
                gr.drawCircle(w / 2, h / 2, w / 2, fillColor, this._lineSize > 0 ? lineColor : null, this._lineSize);
            }

            this._displayObject.repaint();
        }

        public replaceMe(target: GObject): void {
            if (!this._parent)
                throw "parent not set";

            target.name = this.name;
            target.alpha = this.alpha;
            target.rotation = this.rotation;
            target.visible = this.visible;
            target.touchable = this.touchable;
            target.grayed = this.grayed;
            target.setXY(this.x, this.y);
            target.setSize(this.width, this.height);

            var index: number = this._parent.getChildIndex(this);
            this._parent.addChildAt(target, index);
            target.relations.copyFrom(this.relations);

            this._parent.removeChild(this, true);
        }

        public addBeforeMe(target: GObject): void {
            if (this._parent == null)
                throw "parent not set";

            var index: number = this._parent.getChildIndex(this);
            this._parent.addChildAt(target, index);
        }

        public addAfterMe(target: GObject): void {
            if (this._parent == null)
                throw "parent not set";

            var index: number = this._parent.getChildIndex(this);
            index++;
            this._parent.addChildAt(target, index);
        }

        public setNativeObject(obj: Laya.Sprite): void {
            this._type = 0;
            this._displayObject.mouseEnabled = this.touchable;
            this._displayObject.graphics.clear();
            this._displayObject.addChild(obj);
        }

        protected createDisplayObject(): void {
            super.createDisplayObject();
            this._displayObject.mouseEnabled = false;

            this._hitArea = new Laya.HitArea();
            this._hitArea.hit = this._displayObject.graphics;
            this._displayObject.hitArea = this._hitArea;
        }

        public getProp(index: number): any {
            if (index == ObjectPropID.Color)
                return this.color;
            else
                return super.getProp(index);
        }

        public setProp(index: number, value: any): void {
            if (index == ObjectPropID.Color)
                this.color = value;
            else
                super.setProp(index, value);
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (this._type != 0)
                this.drawCommon();
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            this._type = buffer.readByte();
            if (this._type != 0) {
                this._lineSize = buffer.getInt32();
                this._lineColor = buffer.readColorS(true);
                this._fillColor = buffer.readColorS(true);
                if (buffer.readBool()) {
                    this._cornerRadius = [];
                    for (var i: number = 0; i < 4; i++)
                        this._cornerRadius[i] = buffer.getFloat32();
                }

                this.drawCommon();
            }
        }
    }
}