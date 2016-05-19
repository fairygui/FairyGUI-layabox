
package fairygui {

	public class PageOptionSet {
        private var _controller: Controller;
        private var _items: Array;

        public function PageOptionSet() {
            this._items = [];
        }

        public function set controller(val: Controller):void {
            this._controller = val;
        }

        public function add(pageIndex: Number = 0): void {
            var id: String = this._controller.getPageId(pageIndex);
            var i: Number = this._items.indexOf(id);
            if (i == -1)
                this._items.push(id);
        }

        public function remove(pageIndex: Number = 0): void {
            var id: String = this._controller.getPageId(pageIndex);
            var i: Number = this._items.indexOf(id);
            if (i != -1)
                this._items.splice(i, 1);
        }

        public function addByName(pageName: String): void {
            var id: String = this._controller.getPageIdByName(pageName);
            var i: Number = this._items.indexOf(id);
            if (i != -1)
                this._items.push(id);
        }

        public function removeByName(pageName: String): void {
            var id: String = this._controller.getPageIdByName(pageName);
            var i: Number = this._items.indexOf(id);
            if (i != -1)
                this._items.splice(i, 1);
        }

        public function clear(): void {
            this._items.length = 0;
        }

        public function get empty(): Boolean {
            return this._items.length == 0;
        }

        public function addById(id: String): void {
            this._items.push(id);
        }

        public function containsId(id: String): Boolean {
            return this._items.indexOf(id) != -1;
        }
    }
}