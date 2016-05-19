package fairygui {

    public class GGroup extends GObject {
        public var _updating: Boolean;
        public var _empty: Boolean;

        public function GGroup() {
            super();
        }

        public function updateBounds(): void {
            if (this._updating || !this.parent)
                return;

            var cnt: Number = this._parent.numChildren;
            var i: Number = 0;
            var child: GObject;
            var ax: Number = Number.POSITIVE_INFINITY, ay: Number = Number.POSITIVE_INFINITY;
            var ar: Number = Number.NEGATIVE_INFINITY, ab: Number = Number.NEGATIVE_INFINITY;
            var tmp: Number = 0;
            this._empty = true;
            for (i = 0; i < cnt; i++) {
                child = this._parent.getChildAt(i);
                if (child.group == this) {
                    tmp = child.x;
                    if (tmp < ax)
                        ax = tmp;
                    tmp = child.y;
                    if (tmp < ay)
                        ay = tmp;
                    tmp = child.x + child.width;
                    if (tmp > ar)
                        ar = tmp;
                    tmp = child.y + child.height;
                    if (tmp > ab)
                        ab = tmp;
                    this._empty = false;
                }
            }

            this._updating = true;
            if (!this._empty) {
                this.setXY(ax, ay);
                this.setSize(ar - ax, ab - ay);
            }
            else
                this.setSize(0, 0);
            this._updating = false;
        }

        public function moveChildren(dx:Number, dy:Number): void {
            if (this._updating || !this.parent)
                return;

            this._updating = true;
            var cnt: Number = this._parent.numChildren;
            var i: Number = 0;
            var child: GObject;
            for (i = 0; i < cnt; i++) {
                child = this._parent.getChildAt(i);
                if (child.group == this) {
                    child.setXY(child.x + dx, child.y + dy);
                }
            }
            this._updating = false;
        }
        
		override protected function updateAlpha():void {
            super.updateAlpha();
            
            if(this._underConstruct)
                return;
                
            var cnt:Number = this._parent.numChildren;
            var i: Number;
            var child:GObject;
            for(i = 0;i<cnt;i++)
            {
                child = this._parent.getChildAt(i);
                if(child.group == this)
                    child.alpha = this.alpha;
            }
        }
    }
}