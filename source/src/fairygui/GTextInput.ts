namespace fgui {
    export class GTextInput extends GTextField {
        private _input: Laya.Input;
        private _prompt: string;

        constructor() {
            super();
        }

        protected createDisplayObject(): void {
            this._displayObject = this._input = new Laya.Input();
            this._displayObject.mouseEnabled = true;
            this._displayObject["$owner"] = this;
        }

        public get nativeInput(): Laya.Input {
            return this._input;
        }

        public set text(value: string) {
            this._input.text = value;
        }

        public get text(): string {
            return this._input.text;
        }

        public get font(): string {
            return this._input.font;
        }

        public set font(value: string) {
            this._input.font = value;
        }

        public get fontSize(): number {
            return this._input.fontSize;
        }

        public set fontSize(value: number) {
            this._input.fontSize = value;
        }

        public get color(): string {
            return this._input.color;
        }

        public set color(value: string) {
            this._input.color = value;
        }

        public get align(): string {
            return this._input.align;
        }

        public set align(value: string) {
            this._input.align = value;
        }

        public get valign(): string {
            return this._input.valign;
        }

        public set valign(value: string) {
            this._input.valign = value;
        }

        public get leading(): number {
            return this._input.leading;
        }

        public set leading(value: number) {
            this._input.leading = value;
        }

        public get bold(): boolean {
            return this._input.bold;
        }

        public set bold(value: boolean) {
            this._input.bold = value;
        }

        public get italic(): boolean {
            return this._input.italic;
        }

        public set italic(value: boolean) {
            this._input.italic = value;
        }

        public get singleLine(): boolean {
            return !this._input.multiline;
        }

        public set singleLine(value: boolean) {
            this._input.multiline = !value;
        }

        public get stroke(): number {
            return this._input.stroke;
        }

        public set stroke(value: number) {
            this._input.stroke = value;
        }

        public get strokeColor(): string {
            return this._input.strokeColor;
        }

        public set strokeColor(value: string) {
            this._input.strokeColor = value;
            this.updateGear(4);
        }

        public get password(): boolean {
            return this._input.type == "password";
        }

        public set password(value: boolean) {
            if (value)
                this._input.type = "password";
            else
                this._input.type = "text";
        }

        public get keyboardType(): string {
            return this._input.type;
        }

        public set keyboardType(value: string) {
            this._input.type = value;
        }

        public set editable(value: boolean) {
            this._input.editable = value;
        }

        public get editable(): boolean {
            return this._input.editable;
        }

        public set maxLength(value: number) {
            this._input.maxChars = value;
        }

        public get maxLength(): number {
            return this._input.maxChars;
        }

        public set promptText(value: string) {
            this._prompt = value;
            var str:string = ToolSet.removeUBB(value);
            this._input.prompt = str;
            if(ToolSet.defaultUBBParser.lastColor)
                this._input.promptColor = ToolSet.defaultUBBParser.lastColor;
        }

        public get promptText(): string {
            return this._prompt;
        }

        public set restrict(value: string) {
            this._input.restrict = value;
        }

        public get restrict(): string {
            return this._input.restrict;
        }

        public get textWidth(): number {
            return this._input.textWidth;
        }

        public requestFocus(): void {
            this._input.focus = true;

            super.requestFocus();
        }

        protected handleSizeChanged(): void {
            this._input.size(this._width, this._height);
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 4);

            var str: string = buffer.readS();
            if (str != null)
                this.promptText = str;

            str = buffer.readS();
            if (str != null)
                this._input.restrict = str;

            var iv: number = buffer.getInt32();
            if (iv != 0)
                this._input.maxChars = iv;
            iv = buffer.getInt32();
            if (iv != 0) {
                if (iv == 4)
                    this.keyboardType = Laya.Input.TYPE_NUMBER;
                else if (iv == 3)
                    this.keyboardType = Laya.Input.TYPE_URL;
            }
            if (buffer.readBool())
                this.password = true;
        }
    }
}