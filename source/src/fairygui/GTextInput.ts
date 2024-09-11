///<reference path="GTextField.ts"/>

namespace fgui {
    export class GTextInput extends GTextField {
        declare _displayObject: Laya.Input;

        constructor() {
            super();
        }

        protected createDisplayObject(): void {
            this._displayObject = new Laya.Input();
            this._displayObject["$owner"] = this;
        }

        public get nativeInput(): Laya.Input {
            return this._displayObject;
        }

        public get password(): boolean {
            return this._displayObject.type == "password";
        }

        public set password(value: boolean) {
            if (value)
                this._displayObject.type = "password";
            else
                this._displayObject.type = "text";
        }

        public get keyboardType(): string {
            return this._displayObject.type;
        }

        public set keyboardType(value: string) {
            this._displayObject.type = value;
        }

        public set editable(value: boolean) {
            this._displayObject.editable = value;
        }

        public get editable(): boolean {
            return this._displayObject.editable;
        }

        public set maxLength(value: number) {
            this._displayObject.maxChars = value;
        }

        public get maxLength(): number {
            return this._displayObject.maxChars;
        }

        public set promptText(value: string) {
            var str: string = UBBParser.defaultParser.parse(value, true);
            this._displayObject.prompt = str;
            if (UBBParser.defaultParser.lastColor)
                this._displayObject.promptColor = UBBParser.defaultParser.lastColor;
        }

        public get promptText(): string {
            return this._displayObject.prompt;
        }

        public set restrict(value: string) {
            this._displayObject.restrict = value;
        }

        public get restrict(): string {
            return this._displayObject.restrict;
        }

        public requestFocus(): void {
            this._displayObject.focus = true;

            super.requestFocus();
        }

        public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_beforeAdd(buffer, beginPos);

            buffer.seek(beginPos, 4);

            var str: string = buffer.readS();
            if (str != null)
                this.promptText = str;

            str = buffer.readS();
            if (str != null)
                this._displayObject.restrict = str;

            var iv: number = buffer.getInt32();
            if (iv != 0)
                this._displayObject.maxChars = iv;
            iv = buffer.getInt32();
            if (iv != 0) {
                if (iv == 4)
                    this.keyboardType = Laya.Input.TYPE_NUMBER;
                else if (iv == 3)
                    this.keyboardType = Laya.Input.TYPE_URL;
            }
            if (buffer.readBool())
                this.password = true;

            this._displayObject.multiline = !this.singleLine;
        }
    }
}