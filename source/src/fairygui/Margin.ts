namespace fgui {
    export class Margin {
        public left: number = 0;
        public right: number = 0;
        public top: number = 0;
        public bottom: number = 0;

        public copy(source: Margin): void {
            this.top = source.top;
            this.bottom = source.bottom;
            this.left = source.left;
            this.right = source.right;
        }
    }
}