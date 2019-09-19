namespace fgui {
    export class GScrollBar extends GComponent {
        private _grip: GObject;
        private _arrowButton1: GObject;
        private _arrowButton2: GObject;
        private _bar: GObject;
        private _target: ScrollPane;

        private _vertical: boolean;
        private _scrollPerc: number = 0;
        private _fixedGripSize: boolean;

        private _dragOffset: Laya.Point;

        constructor() {
            super();
            this._dragOffset = new Laya.Point();
            this._scrollPerc = 0;
        }

        public setScrollPane(target: ScrollPane, vertical: boolean): void {
            this._target = target;
            this._vertical = vertical;
        }

        public set displayPerc(val: number) {
            if (this._vertical) {
                if (!this._fixedGripSize)
                    this._grip.height = val * this._bar.height;
                this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
            }
            else {
                if (!this._fixedGripSize)
                    this._grip.width = val * this._bar.width;
                this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
            }
        }

        public set scrollPerc(val: number) {
            this._scrollPerc = val;
            if (this._vertical)
                this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
            else
                this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
        }

        public get minSize(): number {
            if (this._vertical)
                return (this._arrowButton1 != null ? this._arrowButton1.height : 0) + (this._arrowButton2 != null ? this._arrowButton2.height : 0);
            else
                return (this._arrowButton1 != null ? this._arrowButton1.width : 0) + (this._arrowButton2 != null ? this._arrowButton2.width : 0);
        }

        protected constructExtension(buffer: ByteBuffer): void {
            buffer.seek(0, 6);

            this._fixedGripSize = buffer.readBool();

            this._grip = this.getChild("grip");
            if (!this._grip) {
                Laya.Log.print("需要定义grip");
                return;
            }

            this._bar = this.getChild("bar");
            if (!this._bar) {
                Laya.Log.print("需要定义bar");
                return;
            }

            this._arrowButton1 = this.getChild("arrow1");
            this._arrowButton2 = this.getChild("arrow2");

            this._grip.on(Laya.Event.MOUSE_DOWN, this, this.__gripMouseDown);

            if (this._arrowButton1)
                this._arrowButton1.on(Laya.Event.MOUSE_DOWN, this, this.__arrowButton1Click);
            if (this._arrowButton2)
                this._arrowButton2.on(Laya.Event.MOUSE_DOWN, this, this.__arrowButton2Click);

            this.on(Laya.Event.MOUSE_DOWN, this, this.__barMouseDown);
        }

        private __gripMouseDown(evt: Laya.Event): void {
            if (!this._bar)
                return;

            evt.stopPropagation();

            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.__gripMouseMove);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.__gripMouseUp);

            this.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, this._dragOffset);
            this._dragOffset.x -= this._grip.x;
            this._dragOffset.y -= this._grip.y;
        }

        private static sScrollbarHelperPoint: Laya.Point = new Laya.Point();
        private __gripMouseMove(): void {
            var pt: Laya.Point = this.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, GScrollBar.sScrollbarHelperPoint);
            if (this._vertical) {
                var curY: number = pt.y - this._dragOffset.y;
                this._target.setPercY((curY - this._bar.y) / (this._bar.height - this._grip.height), false);
            }
            else {
                var curX: number = pt.x - this._dragOffset.x;
                this._target.setPercX((curX - this._bar.x) / (this._bar.width - this._grip.width), false);
            }
        }

        private __gripMouseUp(evt: Laya.Event): void {
            if (!this._bar)
                return;

            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.__gripMouseMove);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.__gripMouseUp);
        }

        private __arrowButton1Click(evt: Laya.Event): void {
            evt.stopPropagation();

            if (this._vertical)
                this._target.scrollUp();
            else
                this._target.scrollLeft();
        }

        private __arrowButton2Click(evt: Laya.Event): void {
            evt.stopPropagation();

            if (this._vertical)
                this._target.scrollDown();
            else
                this._target.scrollRight();
        }

        private __barMouseDown(evt: Laya.Event): void {
            var pt: Laya.Point = this._grip.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, GScrollBar.sScrollbarHelperPoint);
            if (this._vertical) {
                if (pt.y < 0)
                    this._target.scrollUp(4);
                else
                    this._target.scrollDown(4);
            }
            else {
                if (pt.x < 0)
                    this._target.scrollLeft(4);
                else
                    this._target.scrollRight(4);
            }
        }
    }
}