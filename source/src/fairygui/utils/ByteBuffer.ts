namespace fgui {
    export class ByteBuffer extends Laya.Byte {
        public stringTable: string[];
        public version: number;

        constructor(data: any, offset?: number, length?: number) {
            offset = offset || 0;
            if (length == null || length == -1)
                length = data.byteLength - offset;
            if (offset == 0 && length == data.byteLength)
                super(data);
            else {
                super();
                this._u8d_ = new Uint8Array(data, offset, length);
                this._d_ = new DataView(this._u8d_.buffer, offset, length);
                this._length = length;
            }
            this.endian = Laya.Byte.BIG_ENDIAN;
        }

        public skip(count: number): void {
            this.pos += count;
        }

        public readBool(): boolean {
            return this.getUint8() == 1;
        }

        public readS(): string {
            var index: number = this.getUint16();
            if (index == 65534) //null
                return null;
            else if (index == 65533)
                return ""
            else
                return this.stringTable[index];
        }

        public readSArray(cnt: number): Array<string> {
            var ret: Array<string> = new Array<string>(cnt);
            for (var i: number = 0; i < cnt; i++)
                ret[i] = this.readS();

            return ret;
        }

        public writeS(value: string): void {
            var index: number = this.getUint16();
            if (index != 65534 && index != 65533)
                this.stringTable[index] = value;
        }

        public readColor(hasAlpha?: boolean): number {
            var r: number = this.getUint8();
            var g: number = this.getUint8();
            var b: number = this.getUint8();
            var a: number = this.getUint8();

            return (hasAlpha ? (a << 24) : 0) + (r << 16) + (g << 8) + b;
        }

        public readColorS(hasAlpha?: boolean): string {
            var r: number = this.getUint8();
            var g: number = this.getUint8();
            var b: number = this.getUint8();
            var a: number = this.getUint8();

            if (hasAlpha && a != 255)
                return "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
            else {
                var sr: string = r.toString(16);
                var sg: string = g.toString(16);
                var sb: string = b.toString(16);
                if (sr.length == 1)
                    sr = "0" + sr;
                if (sg.length == 1)
                    sg = "0" + sg;
                if (sb.length == 1)
                    sb = "0" + sb;
                return "#" + sr + sg + sb;
            }
        }

        public readChar(): string {
            var i: number = this.getUint16();
            return String.fromCharCode(i);
        }

        public readBuffer(): ByteBuffer {
            var count: number = this.getUint32();
            var ba: ByteBuffer = new ByteBuffer(this.buffer, this._pos_, count);
            this.pos += count;
            ba.stringTable = this.stringTable;
            ba.version = this.version;
            return ba;
        }

        public seek(indexTablePos: number, blockIndex: number): boolean {
            var tmp: number = this._pos_;
            this.pos = indexTablePos;
            var segCount: number = this.getUint8();
            if (blockIndex < segCount) {
                var useShort: boolean = this.getUint8() == 1;
                var newPos: number;
                if (useShort) {
                    this.pos += 2 * blockIndex;
                    newPos = this.getUint16();
                }
                else {
                    this.pos += 4 * blockIndex;
                    newPos = this.getUint32();
                }

                if (newPos > 0) {
                    this.pos = indexTablePos + newPos;
                    return true;
                }
                else {
                    this.pos = tmp;
                    return false;
                }
            }
            else {
                this.pos = tmp;
                return false;
            }
        }
    }
}