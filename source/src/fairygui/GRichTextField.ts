namespace fgui {
    export class GRichTextField extends GTextField {
        private _div: Laya.HTMLDivElement;

        constructor() {
            super();
            this._text = "";
        }

        protected createDisplayObject(): void {
            this._displayObject = this._div = new Laya.HTMLDivElement();
            this._displayObject.mouseEnabled = true;
            this._displayObject["$owner"] = this;
        }

        public get div(): Laya.HTMLDivElement {
            return this._div;
        }

        public set text(value: string) {
            this._text = value;
            var text2: string = this._text;
            if (this._templateVars != null)
                text2 = this.parseTemplate(text2);
            try {
                if (this._ubbEnabled)
                    this._div.innerHTML = ToolSet.parseUBB(text2);
                else
                    this._div.innerHTML = text2;

                if (this._widthAutoSize || this._heightAutoSize) {
                    var w: number, h: number = 0;
                    if (this._widthAutoSize) {
                        w = this._div.contextWidth;
                        if (w > 0)
                            w += 8;
                    }
                    else
                        w = this._width;

                    if (this._heightAutoSize)
                        h = this._div.contextHeight;
                    else
                        h = this._height;

                    this._updatingSize = true;
                    this.setSize(w, h);
                    this._updatingSize = false;
                }
            }
            catch (err) {
                console.log("laya reports html error:" + err);
            }
        }

        public get text(): string {
            return this._text;
        }

        public get font(): string {
            return this._div.style.font;
        }

        public set font(value: string) {
            if (value)
                this._div.style.font = value;
            else
                this._div.style.font = fgui.UIConfig.defaultFont;
        }

        public get fontSize(): number {
            return this._div.style.fontSize;
        }

        public set fontSize(value: number) {
            this._div.style.fontSize = value;
        }

        public get color(): string {
            return this._div.style.color;
        }

        public set color(value: string) {
            if (this._div.style.color != value) {
                this._div.style.color = value;
                this.refresh();
                this.updateGear(4);
            }
        }

        public get align(): string {
            return this._div.style.align;
        }

        public set align(value: string) {
            if (this._div.style.align != value) {
                this._div.style.align = value;
                this.refresh();
            }
        }

        public get valign(): string {
            return this._div.style.valign;
        }

        public set valign(value: string) {
            if (this._div.style.valign != value) {
                this._div.style.valign = value;
                this.refresh();
            }
        }

        public get leading(): number {
            return this._div.style.leading;
        }

        public set leading(value: number) {
            if (this._div.style.leading != value) {
                this._div.style.leading = value;
                this.refresh();
            }
        }

        public get bold(): boolean {
            return this._div.style.bold;
        }

        public set bold(value: boolean) {
            if (this._div.style.bold != value) {
                this._div.style.bold = value;
                this.refresh();
            }
        }

        public get italic(): boolean {
            return this._div.style.italic;
        }

        public set italic(value: boolean) {
            if (this._div.style.italic != value) {
                this._div.style.italic = value;
                this.refresh();
            }
        }

        public get stroke(): number {
            return this._div.style.stroke;
        }

        public set stroke(value: number) {
            if (this._div.style.stroke != value) {
                this._div.style.stroke = value;
                this.refresh();
            }
        }

        public get strokeColor(): string {
            return this._div.style.strokeColor;
        }

        public set strokeColor(value: string) {
            if (this._div.style.strokeColor != value) {
                this._div.style.strokeColor = value;
                this.refresh();
                this.updateGear(4);
            }
        }

        public set ubbEnabled(value: boolean) {
            this._ubbEnabled = value;
        }

        public get ubbEnabled(): boolean {
            return this._ubbEnabled;
        }

        public get textWidth(): number {
            var w: number = this._div.contextWidth;
            if (w > 0)
                w += 8;
            return w;
        }

        private refresh(): void {
            if (this._text.length > 0 && (<any>this._div)._refresh)
                (<any>this._div)._refresh();
        }

        protected updateAutoSize(): void {
            this._div.style.wordWrap = !this._widthAutoSize;
        }

        protected handleSizeChanged(): void {
            if (this._updatingSize)
                return;

            this._div.size(this._width, this._height);
            this._div.style.width = this._width;
            this._div.style.height = this._height;
        }
    }
}