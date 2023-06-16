///<reference path="GObject.ts"/>

namespace fgui {
    export class GTextField extends GObject {
        protected _text: string;
        protected _templateVars: Record<string, string>;
        protected _autoSize: number;
        protected _widthAutoSize: boolean;
        protected _heightAutoSize: boolean;
        protected _color: string;
        protected _singleLine: boolean;
        protected _letterSpacing: number = 0;

        declare _displayObject: Laya.Text | Laya.Input;

        constructor() {
            super();

            this._text = "";
            this._color = "#000000";
        }

        protected createDisplayObject(): void {
            this._displayObject = new Laya.Text();
            this._displayObject["$owner"] = this;
            this._displayObject.padding = labelPadding;
            this._displayObject.mouseEnabled = false;
            this._autoSize = AutoSizeType.Both;
            this._widthAutoSize = this._heightAutoSize = true;
            (<Laya.Text>this._displayObject)._onPostLayout = () => this.updateSize();
        }

        public get displayObject(): Laya.Text {
            return this._displayObject;
        }

        public set text(value: string) {
            this._displayObject.text = value;
        }

        public get text(): string {
            return this._displayObject.text;
        }

        public get font(): string {
            return this._displayObject.font;
        }

        public set font(value: string) {
            if (ToolSet.startsWith(value, "ui://"))
                UIPackage.getItemAssetByURL(value);
            this._displayObject.font = value;
        }

        public get fontSize(): number {
            return this._displayObject.fontSize;
        }

        public set fontSize(value: number) {
            this._displayObject.fontSize = value;
        }

        public get color(): string {
            return this._color;
        }

        public set color(value: string) {
            if (this._color != value) {
                this._color = value;
                this.updateGear(4);

                if (this.grayed)
                    this._displayObject.color = "#AAAAAA";
                else
                    this._displayObject.color = this._color;
            }
        }

        public get align(): string {
            return this._displayObject.align;
        }

        public set align(value: string) {
            this._displayObject.align = value;
        }

        public get valign(): string {
            return this._displayObject.valign;
        }

        public set valign(value: string) {
            this._displayObject.valign = value;
        }

        public get leading(): number {
            return this._displayObject.leading;
        }

        public set leading(value: number) {
            this._displayObject.leading = value;
        }

        public get letterSpacing(): number {
            return this._letterSpacing;
        }

        public set letterSpacing(value: number) {
            this._letterSpacing = value;
        }

        public get bold(): boolean {
            return this._displayObject.bold;
        }

        public set bold(value: boolean) {
            this._displayObject.bold = value;
        }

        public get italic(): boolean {
            return this._displayObject.italic;
        }

        public set italic(value: boolean) {
            this._displayObject.italic = value;
        }

        public get underline(): boolean {
            return this._displayObject.underline;
        }

        public set underline(value: boolean) {
            this._displayObject.underline = value;
        }

        public get singleLine(): boolean {
            return this._singleLine;
        }

        public set singleLine(value: boolean) {
            this._singleLine = value;
            this._displayObject.wordWrap = !this._widthAutoSize && !this._singleLine;
        }

        public get stroke(): number {
            return this._displayObject.stroke;
        }

        public set stroke(value: number) {
            this._displayObject.stroke = value;
        }

        public get strokeColor(): string {
            return this._displayObject.strokeColor;
        }

        public set strokeColor(value: string) {
            if (this._displayObject.strokeColor != value) {
                this._displayObject.strokeColor = value;
                this.updateGear(4);
            }
        }

        public set ubbEnabled(value: boolean) {
            this._displayObject.ubb = value;
        }

        public get ubbEnabled(): boolean {
            return this._displayObject.ubb;
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
            this._displayObject.wordWrap = !this._widthAutoSize && !this._singleLine;
            this._displayObject.overflow = this._autoSize == AutoSizeType.Shrink ? "shrink" : (this._autoSize == AutoSizeType.Ellipsis ? "ellipsis" : "visible");
            if (!this._underConstruct) {
                if (!this._heightAutoSize)
                    this._displayObject.size(this.width, this.height);
                else if (!this._widthAutoSize)
                    this._displayObject.width = this.width;
            }
        }

        public get textWidth(): number {
            return this._displayObject.textWidth;
        }

        public get templateVars(): Record<string, any> {
            return this._displayObject.templateVars;
        }

        public set templateVars(value: Record<string, any>) {
            this._displayObject.templateVars = value;
        }

        public setVar(name: string, value: any): GTextField {
            this._displayObject.setVar(name, value);

            return this;
        }

        public flushVars(): void {
            //nothing here. auto flush
        }

        public ensureSizeCorrect(): void {
            if (!this._underConstruct)
                this._displayObject.typeset();
        }

        private updateSize(): void {
            if (this._widthAutoSize)
                this.setSize(this._displayObject.textWidth, this._displayObject.textHeight);
            else if (this._heightAutoSize)
                this.height = this._displayObject.textHeight;
        }

        protected handleSizeChanged(): void {
            this._displayObject.size(this._width, this._height);
        }

        protected handleGrayedChanged(): void {
            super.handleGrayedChanged();

            if (this.grayed)
                this._displayObject.color = "#AAAAAA";
            else
                this._displayObject.color = this._color;
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

const labelPadding = [2, 2, 2, 2];