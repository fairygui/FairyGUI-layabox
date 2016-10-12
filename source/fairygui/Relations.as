package fairygui {

    public class Relations {
        private var _owner: GObject;
        private var _items: Vector.<RelationItem>;

        public var handling: GObject;
        public var sizeDirty: Boolean;

        private static var RELATION_NAMES: Array =
        [
            "left-left",//0
            "left-center",
            "left-right",
            "center-center",
            "right-left",
            "right-center",
            "right-right",
            "top-top",//7
            "top-middle",
            "top-bottom",
            "middle-middle",
            "bottom-top",
            "bottom-middle",
            "bottom-bottom",
            "width-width",//14
            "height-height",//15
            "leftext-left",//16
            "leftext-right",
            "rightext-left",
            "rightext-right",
            "topext-top",//20
            "topext-bottom",
            "bottomext-top",
            "bottomext-bottom"//23
        ];

        public function Relations(owner: GObject) {
            this._owner = owner;
            this._items = new Vector.<RelationItem>();
        }

        public function add(target: GObject, relationType: Number, usePercent: Boolean= false): void {
            var length: Number = this._items.length;
            for (var i: Number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                if (item.target == target) {
                    item.add(relationType, usePercent);
                    return;
                }
            }
            var newItem: RelationItem = new RelationItem(this._owner);
            newItem.target = target;
            newItem.add(relationType, usePercent);
            this._items.push(newItem);
        }

        public function addItems(target: GObject, sidePairs: String): void {
            var arr: Array = sidePairs.split(",");
            var s: String;
            var usePercent: Boolean;
            var i: Number;
			
			var newItem:RelationItem = new RelationItem(_owner);
			newItem.target = target;

            for (i = 0; i < 2; i++) {
                s = arr[i];
                if (!s)
                    continue;

                if (s.charAt(s.length - 1) == "%") {
                    s = s.substr(0, s.length - 1);
                    usePercent = true;
                }
                else
                    usePercent = false;
                var j: Number = s.indexOf("-");
                if (j == -1)
                    s = s + "-" + s;

                var t: Number = Relations.RELATION_NAMES.indexOf(s);
                if (t == -1)
                    throw "invalid relation type";

				newItem.internalAdd(t, usePercent);
            }
			_items.push(newItem);
        }

        public function remove(target: GObject, relationType: Number = 0): void {
            var cnt: Number = this._items.length;
            var i: Number = 0;
            while (i < cnt) {
                var item: RelationItem = this._items[i];
                if (item.target == target) {
                    item.remove(relationType);
                    if (item.isEmpty) {
                        item.dispose();
                        this._items.splice(i, 1);
                        cnt--;
                    }
                    else
                        i++;
                }
                else
                    i++;
            }
        }

        public function contains(target: GObject): Boolean {
            var length: Number = this._items.length;
            for (var i: Number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                if (item.target == target)
                    return true;
            }
            return false;
        }

        public function clearFor(target: GObject): void {
            var cnt: Number = this._items.length;
            var i: Number = 0;
            while (i < cnt) {
                var item: RelationItem = this._items[i];
                if (item.target == target) {
                    item.dispose();
                    this._items.splice(i, 1);
                    cnt--;
                }
                else
                    i++;
            }
        }

        public function clearAll(): void {
            var length: Number = this._items.length;
            for (var i: Number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                item.dispose();
            }
            this._items.length = 0;
        }

        public function copyFrom(source: Relations): void {
            this.clearAll();

            var arr: Vector.<RelationItem> = source._items;
            var length: Number = arr.length;
            for (var i: Number = 0; i < length; i++) {
                var ri: RelationItem = arr[i];
                var item: RelationItem = new RelationItem(this._owner);
                item.copyFrom(ri);
                this._items.push(item);
            }
        }

        public function dispose(): void {
            this.clearAll();
        }

        public function onOwnerSizeChanged(dWidth:Number, dHeight:Number): void {
            if (this._items.length == 0)
                return;

            var length: Number = this._items.length;
            for (var i: Number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                item.applyOnSelfResized(dWidth, dHeight);
            }
        }

        public function ensureRelationsSizeCorrect(): void {
            if (this._items.length == 0)
                return;

            this.sizeDirty = false;
            var length: Number = this._items.length;
            for (var i: Number = 0; i < length; i++) {
                var item: RelationItem = this._items[i];
                item.target.ensureSizeCorrect();
            }
        }

        public function get empty(): Boolean {
            return this._items.length == 0;
        }

        public function setup(xml: Object): void {
            var col: Array = xml.childNodes;
            var length: Number = col.length;
            var targetId: String;
            var target: GObject;
            for (var i: Number = 0; i < length; i++) {
                var cxml: Object = col[i];
                if(cxml.nodeName!="relation")
                    continue;
                    
                targetId = cxml.getAttribute("target");
                if (this._owner.parent) {
                    if (targetId)
                        target = this._owner.parent.getChildById(targetId);
                    else
                        target = this._owner.parent;
                }
                else {
                    //call from component construction
                    target = GComponent(this._owner).getChildById(targetId);
                }
                if (target)
                    this.addItems(target, cxml.getAttribute("sidePair"));
            }
        }
    }
}