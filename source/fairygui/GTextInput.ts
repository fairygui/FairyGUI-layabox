namespace fgui {
    export class GTextInput extends GTextField {
        public input: Laya.Input;

        constructor() {
            super();
        }

        protected createDisplayObject(): void {
            this._displayObject = this.input = new Laya.Input();
            this._displayObject.mouseEnabled = true;
            this._displayObject["$owner"] = this;
        }

        public set text(value: string) {
            this.input.text = value;
        }

        public get text(): string {
            return this.input.text;
        }

        public get font(): string {
            return this.input.font;
        }

        public set font(value: string) {
            this.input.font = value;
        }

        public get fontSize(): number {
            return this.input.fontSize;
        }

        public set fontSize(value: number) {
            this.input.fontSize = value;
        }

        public get color(): string {
            return this.input.color;
        }

        public set color(value: string) {
            this.input.color = value;
        }

        public get align(): string {
            return this.input.align;
        }

        public set align(value: string) {
            this.input.align = value;
        }

        public get valign(): string {
            return this.input.valign;
        }

        public set valign(value: string) {
            this.input.valign = value;
        }

        public get leading(): number {
            return this.input.leading;
        }

        public set leading(value: number) {
            this.input.leading = value;
        }

        public get bold(): boolean {
            return this.input.bold;
        }

        public set bold(value: boolean) {
            this.input.bold = value;
        }

        public get italic(): boolean {
            return this.input.italic;
        }

        public set italic(value: boolean) {
            this.input.italic = value;
        }

        public get singleLine(): boolean {
            return !this.input.multiline;
        }

        public set singleLine(value: boolean) {
            this.input.multiline = !value;
        }

        public get stroke(): number {
            return this.input.stroke;
        }

        public set stroke(value: number) {
            this.input.stroke = value;
        }

        public get strokeColor(): string {
            return this.input.strokeColor;
        }

        public set strokeColor(value: string) {
            this.input.strokeColor = value;
            this.updateGear(4);
        }

        public get password(): boolean {
            return this.input.type == "password";
        }

        public set password(value: boolean) {
            if (value)
                this.input.type = "password";
            else
                this.input.type = "text";
        }

        public get keyboardType(): string {
            return this.input.type;
        }

        public set keyboardType(value: string) {
            this.input.type = value;
        }

        public set editable(value: boolean) {
            this.input.editable = value;
        }

        public get editable(): boolean {
            return this.input.editable;
        }

        public set maxLength(value: number) {
            this.input.maxChars = value;
        }

        public get maxLength(): number {
            return this.input.maxChars;
        }

        public set promptText(value: string) {
            this.input.prompt = value;
        }

        public get promptText(): string {
            return this.input.prompt;
        }

        public set restrict(value: string) {
            this.input.restrict = value;
        }

        public get restrict(): string {
            return this.input.restrict;
        }

        public get textWidth(): number {
            return this.input.textWidth;
        }

        protected handleSizeChanged(): void {
            this.input.size(this.width, this.height);
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 4);

            var str: string = buffer.readS();
            if (str != null)
                this.promptText = str;

            str = buffer.readS();
            if (str != null)
                this.input.restrict = str;

            var iv: number = buffer.getInt32();
            if (iv != 0)
                this.input.maxChars = iv;
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