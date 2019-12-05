///<reference path="GObject.ts"/>

namespace fgui {
    export class GTextField extends GObject {
        protected _templateVars: Object;
        protected _text: string;
        protected _autoSize: number;
        protected _widthAutoSize: boolean;
        protected _heightAutoSize: boolean;
        protected _ubbEnabled: boolean;
        protected _updatingSize: boolean;

        constructor() {
            super();
        }

        public get font(): string {
            return null;
        }

        public set font(value: string) {
        }

        public get fontSize(): number {
            return 0;
        }

        public set fontSize(value: number) {
        }

        public get color(): string {
            return null;
        }

        public set color(value: string) {
        }

        public get align(): string {
            return null;
        }

        public set align(value: string) {
        }

        public get valign(): string {
            return null;
        }

        public set valign(value: string) {
        }

        public get leading(): number {
            return 0;
        }

        public set leading(value: number) {
        }

        public get letterSpacing(): number {
            return 0;
        }

        public set letterSpacing(value: number) {
        }

        public get bold(): boolean {
            return false;
        }

        public set bold(value: boolean) {
        }

        public get italic(): boolean {
            return false;
        }

        public set italic(value: boolean) {
        }

        public get underline(): boolean {
            return false;
        }

        public set underline(value: boolean) {
        }

        public get singleLine(): boolean {
            return false;
        }

        public set singleLine(value: boolean) {
        }

        public get stroke(): number {
            return 0;
        }

        public set stroke(value: number) {
        }

        public get strokeColor(): string {
            return null;
        }

        public set strokeColor(value: string) {
        }

        public set ubbEnabled(value: boolean) {
            this._ubbEnabled = value;
        }

        public get ubbEnabled(): boolean {
            return this._ubbEnabled;
        }

        public get autoSize(): number {
            return this._autoSize;
        }

        public set autoSize(value: number) {
            if (this._autoSize != value) {
                this._autoSize = value;
                this._widthAutoSize = this._autoSize == AutoSizeType.Both;
                this._heightAutoSize = this._autoSize == AutoSizeType.Both || this._autoSize == AutoSizeType.Height;

                this.updateAutoSize();
            }
        }

        protected updateAutoSize(): void {
        }

        public get textWidth(): number {
            return 0;
        }

        protected parseTemplate(template: string): string {
            var pos1: number = 0, pos2: number, pos3: number;
            var tag: string;
            var value: string;
            var result: string = "";
            while ((pos2 = template.indexOf("{", pos1)) != -1) {
                if (pos2 > 0 && template.charCodeAt(pos2 - 1) == 92)//\
                {
                    result += template.substring(pos1, pos2 - 1);
                    result += "{";
                    pos1 = pos2 + 1;
                    continue;
                }

                result += template.substring(pos1, pos2);
                pos1 = pos2;
                pos2 = template.indexOf("}", pos1);
                if (pos2 == -1)
                    break;

                if (pos2 == pos1 + 1) {
                    result += template.substr(pos1, 2);
                    pos1 = pos2 + 1;
                    continue;
                }

                tag = template.substring(pos1 + 1, pos2);
                pos3 = tag.indexOf("=");
                if (pos3 != -1) {
                    value = this._templateVars[tag.substring(0, pos3)];
                    if (value == null)
                        result += tag.substring(pos3 + 1);
                    else
                        result += value;
                }
                else {
                    value = this._templateVars[tag];
                    if (value != null)
                        result += value;
                }
                pos1 = pos2 + 1;
            }

            if (pos1 < template.length)
                result += template.substr(pos1);

            return result;
        }

        public get templateVars(): Object {
            return this._templateVars;
        }

        public set templateVars(value: Object) {
            if (this._templateVars == null && value == null)
                return;

            this._templateVars = value;
            this.flushVars();
        }

        public setVar(name: string, value: string): GTextField {
            if (!this._templateVars)
                this._templateVars = {};
            this._templateVars[name] = value;

            return this;
        }

        public flushVars(): void {
            this.text = this._text;
        }

        public getProp(index: number): any {
            switch (index) {
                case ObjectPropID.Color:
                    return this.color;
                case ObjectPropID.OutlineColor:
                    return this.strokeColor;
                case ObjectPropID.FontSize:
                    return this.fontSize;
                default:
                    return super.getProp(index);
            }
        }

        public setProp(index: number, value: any): void {
            switch (index) {
                case ObjectPropID.Color:
                    this.color = value;
                    break;
                case ObjectPropID.OutlineColor:
                    this.strokeColor = value;
                    break;
                case ObjectPropID.FontSize:
                    this.fontSize = value;
                    break;
                default:
                    super.setProp(index, value);
                    break;
            }
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 5);

            var iv: number;

            this.font = buffer.readS();
            this.fontSize = buffer.getInt16();
            this.color = buffer.readColorS();
            iv = buffer.readByte();
            this.align = iv == 0 ? "left" : (iv == 1 ? "center" : "right");
            iv = buffer.readByte();
            this.valign = iv == 0 ? "top" : (iv == 1 ? "middle" : "bottom");
            this.leading = buffer.getInt16();
            this.letterSpacing = buffer.getInt16();
            this.ubbEnabled = buffer.readBool();
            this.autoSize = buffer.readByte();
            this.underline = buffer.readBool();
            this.italic = buffer.readBool();
            this.bold = buffer.readBool();
            this.singleLine = buffer.readBool();
            if (buffer.readBool()) {
                this.strokeColor = buffer.readColorS();
                this.stroke = buffer.getFloat32() + 1;
            }

            if (buffer.readBool()) //shadow
                buffer.skip(12);

            if (buffer.readBool())
                this._templateVars = {};
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            buffer.seek(beginPos, 6);

            var str: string = buffer.readS();
            if (str != null)
                this.text = str;
        }
    }
}