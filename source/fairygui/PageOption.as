package fairygui {

    public class PageOption {
        private var _controller: Controller;
        private var _id: String;

        public function PageOption() {
        }

        public function set controller(val: Controller):void {
            this._controller = val;
        }

        public function set index(pageIndex: Number):void {
            this._id = this._controller.getPageId(pageIndex);
        }

        public function set name(pageName: String):void {
            this._id = this._controller.getPageIdByName(pageName);
        }

        public function get index(): Number {
            if (this._id)
                return this._controller.getPageIndexById(this._id);
            else
                return -1;
        }

        public function get name(): String {
            if (this._id)
                return this._controller.getPageNameById(this._id);
            else
                return null;
        }

        public function clear(): void {
            this._id = null;
        }

        public function set id(id: String):void {
            this._id = id;
        }

        public function get id(): String {
            return this._id;
        }
    }
}