namespace fgui {
    export class GRichTextField extends GTextField {
        public div: Laya.HTMLDivElement;

        private _ubbEnabled: boolean;
        private _color: string;

        constructor() {
            super();
            this._text = "";
        }

        protected createDisplayObject(): void {
            this._displayObject = this.div = new Laya.HTMLDivElement();
            this._displayObject.mouseEnabled = true;
            this._displayObject["$owner"] = this;
        }

        public set text(value: string) {
            this._text = value;
            var text2: string = this._text;
            if (this._templateVars != null)
                text2 = this.parseTemplate(text2);
            try
            {
                if (this._ubbEnabled)
                    this.div.innerHTML = ToolSet.parseUBB(text2);
                else
                    this.div.innerHTML = text2;
            }
            catch(err)
            {
                Laya.Log.print(err);
            }
        }

        public get text(): string {
            return this._text;
        }

        public get font(): string {
            return this.div.style.font;
        }

        public set font(value: string) {
            if (value)
                this.div.style.font = value;
            else
                this.div.style.font = fgui.UIConfig.defaultFont;
        }

        public get fontSize(): number {
            return this.div.style.fontSize;
        }

        public set fontSize(value: number) {
            this.div.style.fontSize = value;
        }

        public get color(): string {
            return this._color;
        }

        public set color(value: string) {
            if (this._color != value) {
                this._color = value;
                this.div.style.color = value;
                if (this._gearColor.controller)
                    this._gearColor.updateState();
            }
        }

        public get align(): string {
            return this.div.style.align;
        }

        public set align(value: string) {
            this.div.style.align = value;
        }

        public get valign(): string {
            return this.div.style.valign;
        }

        public set valign(value: string) {
            this.div.style.valign = value;
        }

        public get leading(): number {
            return this.div.style.leading;
        }

        public set leading(value: number) {
            this.div.style.leading = value;
        }

        public get bold(): boolean {
            return this.div.style.bold;
        }

        public set bold(value: boolean) {
            this.div.style.bold = value;
        }

        public get italic(): boolean {
            return this.div.style.italic;
        }

        public set italic(value: boolean) {
            this.div.style.italic = value;
        }

        public get stroke(): number {
            return this.div.style.stroke;
        }

        public set stroke(value: number) {
            this.div.style.stroke = value;
        }

        public get strokeColor(): string {
            return this.div.style.strokeColor;
        }

        public set strokeColor(value: string) {
            this.div.style.strokeColor = value;
            this.updateGear(4);
        }

        public set ubbEnabled(value: boolean) {
            this._ubbEnabled = value;
        }

        public get ubbEnabled(): boolean {
            return this._ubbEnabled;
        }

        protected handleSizeChanged(): void {
            this.div.size(this.width, this.height);

            this.div.style.width = this.width;
            this.div.style.height = this.height;
        }
    }
}