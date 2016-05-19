package fairygui {

    public class Margin {
        public var left: Number = 0;
        public var right: Number = 0;
        public var top: Number = 0;
        public var bottom: Number = 0;

        public function Margin() {
        }

        public function parse(str: String): void {
            if (!str) {
                this.left = 0;
                this.right = 0;
                this.top = 0;
                this.bottom = 0;
                return;
            }
            var arr: Array = str.split(",");
            if (arr.length == 1) {
                var k: Number = parseInt(arr[0]);
                this.top = k;
                this.bottom = k;
                this.left = k;
                this.right = k;
            }
            else {
                this.top = parseInt(arr[0]);
                this.bottom = parseInt(arr[1]);
                this.left = parseInt(arr[2]);
                this.right = parseInt(arr[3]);
            }
        }

        public function copy(source: Margin): void {
            this.top = source.top;
            this.bottom = source.bottom;
            this.left = source.left;
            this.right = source.right;
        }
    }
}