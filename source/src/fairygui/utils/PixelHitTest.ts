namespace fgui {
    export class PixelHitTest extends Laya.HitArea {
        private _data: PixelHitTestData;

        public offsetX: number;
        public offsetY: number;
        public scaleX: number;
        public scaleY: number;

        constructor(data: PixelHitTestData, offsetX: number, offsetY: number) {
            super();

            this._data = data;
            this.offsetX = offsetX;
            this.offsetY = offsetY;

            this.scaleX = 1;
            this.scaleY = 1;
        }

        public contains(x: number, y: number): boolean {
            x = Math.floor((x / this.scaleX - this.offsetX) * this._data.scale);
            y = Math.floor((y / this.scaleY - this.offsetY) * this._data.scale);
            if (x < 0 || y < 0 || x >= this._data.pixelWidth)
                return false;

            var pos: number = y * this._data.pixelWidth + x;
            var pos2: number = Math.floor(pos / 8);
            var pos3: number = pos % 8;

            if (pos2 >= 0 && pos2 < this._data.pixels.length)
                return ((this._data.pixels[pos2] >> pos3) & 0x1) == 1;
            else
                return false;
        }
    }

    export class PixelHitTestData {
        public pixelWidth: number;
        public scale: number;
        public pixels: number[];

        constructor() {
        }

        public load(ba: Laya.Byte): void {
            ba.getInt32();
            this.pixelWidth = ba.getInt32();
            this.scale = 1 / ba.readByte();
            var len: number = ba.getInt32();
            this.pixels = [];
            for (var i: number = 0; i < len; i++) {
                var j: number = ba.readByte();
                if (j < 0)
                    j += 256;

                this.pixels[i] = j;
            }
        }
    }
}