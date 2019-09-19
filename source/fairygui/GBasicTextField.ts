///<reference path="GTextField.ts"/>

namespace fgui {
    export class GBasicTextField extends GTextField {
        public textField: Laya.Text;

        private _font: string;
        private _color: string;
        private _ubbEnabled: boolean;
        private _singleLine: boolean;
        private _letterSpacing: number = 0;

        private _autoSize: number;
        private _widthAutoSize: boolean;
        private _heightAutoSize: boolean;

        private _updatingSize: boolean;
        private _textWidth: number = 0;
        private _textHeight: number = 0;

        private _bitmapFont: BitmapFont;
        private _lines: Array<LineInfo>;

        private static GUTTER_X: number = 2;
        private static GUTTER_Y: number = 2;

        constructor() {
            super();

            this._text = "";
            this._color = "#000000";
            this.textField.align = "left";
            this.textField.font = fgui.UIConfig.defaultFont;
            this._autoSize = AutoSizeType.Both;
            this._widthAutoSize = this._heightAutoSize = true;
            this.textField["_sizeDirty"] = false;
        }

        protected createDisplayObject(): void {
            this._displayObject = this.textField = new TextExt(this);
            this._displayObject["$owner"] = this;
            this._displayObject.mouseEnabled = false;
        }

        public set text(value: string) {
            this._text = value;
            if (this._text == null)
                this._text = "";

            if (this._bitmapFont == null) {
                if (this._widthAutoSize)
                    this.textField.width = 10000;
                var text2: string = this._text;
                if (this._templateVars != null)
                    text2 = this.parseTemplate(text2);
                if (this._ubbEnabled) //laya还不支持同一个文本不同样式
                    this.textField.text = ToolSet.removeUBB(ToolSet.encodeHTML(text2));
                else
                    this.textField.text = text2;
            }
            else {
                this.textField.text = "";
                this.textField["setChanged"]();
            }

            if (this.parent && this.parent._underConstruct)
                this.textField.typeset();
        }

        public get text(): string {
            return this._text;
        }

        public get font(): string {
            return this.textField.font;
        }

        public set font(value: string) {
            this._font = value;
            if (ToolSet.startsWith(this._font, "ui://"))
                this._bitmapFont = UIPackage.getItemAssetByURL(this._font) as BitmapFont;
            else
                this._bitmapFont = null;

            if (this._bitmapFont != null) {
                this.textField["setChanged"]();
            }
            else {
                if (this._font)
                    this.textField.font = this._font;
                else
                    this.textField.font = fgui.UIConfig.defaultFont;
            }
        }

        public get fontSize(): number {
            return this.textField.fontSize;
        }

        public set fontSize(value: number) {
            this.textField.fontSize = value;
        }

        public get color(): string {
            return this._color;
        }

        public set color(value: string) {
            if (this._color != value) {
                this._color = value;

                if (this._gearColor.controller)
                    this._gearColor.updateState();

                if (this.grayed)
                    this.textField.color = "#AAAAAA";
                else
                    this.textField.color = this._color;
            }
        }

        public get align(): string {
            return this.textField.align;
        }

        public set align(value: string) {
            this.textField.align = value;
        }

        public get valign(): string {
            return this.textField.valign;
        }

        public set valign(value: string) {
            this.textField.valign = value;
        }

        public get leading(): number {
            return this.textField.leading;
        }

        public set leading(value: number) {
            this.textField.leading = value;
        }

        public get letterSpacing(): number {
            return this._letterSpacing;
        }

        public set letterSpacing(value: number) {
            this._letterSpacing = value;
        }

        public get bold(): boolean {
            return this.textField.bold;
        }

        public set bold(value: boolean) {
            this.textField.bold = value;
        }

        public get italic(): boolean {
            return this.textField.italic;
        }

        public set italic(value: boolean) {
            this.textField.italic = value;
        }

        public get underline(): boolean {
            return this.textField.underline;
        }

        public set underline(value: boolean) {
            this.textField.underline = value;
        }

        public get singleLine(): boolean {
            return this._singleLine;
        }

        public set singleLine(value: boolean) {
            this._singleLine = value;
            this.textField.wordWrap = !this._widthAutoSize && !this._singleLine;
        }

        public get stroke(): number {
            return this.textField.stroke;
        }

        public set stroke(value: number) {
            this.textField.stroke = value;
        }

        public get strokeColor(): string {
            return this.textField.strokeColor;
        }

        public set strokeColor(value: string) {
            this.textField.strokeColor = value;
            this.updateGear(4);
        }

        public set ubbEnabled(value: boolean) {
            this._ubbEnabled = value;
        }

        public get ubbEnabled(): boolean {
            return this._ubbEnabled;
        }

        public set autoSize(value: number) {
            if (this._autoSize != value) {
                this.setAutoSize(value);
            }
        }

        private setAutoSize(value: number): void {
            this._autoSize = value;
            this._widthAutoSize = value == AutoSizeType.Both;
            this._heightAutoSize = value == AutoSizeType.Both || value == AutoSizeType.Height;
            /*一般没有剪裁文字的需要，感觉HIDDEN有消耗，所以不用了
            if(this._heightAutoSize)
            this.textField.overflow = Text.VISIBLE;
            else
            this.textField.overflow = Text.HIDDEN;*/
            this.textField.wordWrap = !this._widthAutoSize && !this._singleLine;
            if (!this._underConstruct) {
                if (!this._heightAutoSize)
                    this.textField.size(this.width, this.height);
                else if (!this._widthAutoSize)
                    this.textField.width = this.width;
            }
        }

        public get autoSize(): number {
            return this._autoSize;
        }

        public get textWidth(): number {
            if (this.textField["_isChanged"])
                this.textField.typeset();
            return this._textWidth;
        }

        public ensureSizeCorrect(): void {
            if (!this._underConstruct && this.textField["_isChanged"])
                this.textField.typeset();
        }

        public typeset(): void {
            if (this._bitmapFont != null)
                this.renderWithBitmapFont();
            else if (this._widthAutoSize || this._heightAutoSize)
                this.updateSize();
        }

        private updateSize(): void {
            this._textWidth = Math.ceil(this.textField.textWidth);
            this._textHeight = Math.ceil(this.textField.textHeight);

            var w: number, h: number = 0;
            if (this._widthAutoSize) {
                w = this._textWidth;
                if (this.textField.width != w) {
                    this.textField.width = w;
                    if (this.textField.align != "left")
                        this.textField["baseTypeset"]();
                }
            }
            else
                w = this.width;

            if (this._heightAutoSize) {
                h = this._textHeight;
                if (!this._widthAutoSize) {
                    if (this.textField.height != this._textHeight)
                        this.textField.height = this._textHeight;
                }
            }
            else {
                h = this.height;
                if (this._textHeight > h)
                    this._textHeight = h;
                if (this.textField.height != this._textHeight)
                    this.textField.height = this._textHeight;
            }

            this._updatingSize = true;
            this.setSize(w, h);
            this._updatingSize = false;
        }

        private renderWithBitmapFont(): void {
            var gr: Laya.Graphics = this._displayObject.graphics;
            gr.clear();

            if (!this._lines)
                this._lines = new Array<LineInfo>();
            else
                LineInfo.returnList(this._lines);

            var letterSpacing: number = this.letterSpacing;
            var lineSpacing: number = this.leading - 1;
            var rectWidth: number = this.width - GBasicTextField.GUTTER_X * 2;
            var lineWidth: number = 0, lineHeight: number = 0, lineTextHeight: number = 0;
            var glyphWidth: number = 0, glyphHeight: number = 0;
            var wordChars: number = 0, wordStart: number = 0, wordEnd: number = 0;
            var lastLineHeight: number = 0;
            var lineBuffer: string = "";
            var lineY: number = GBasicTextField.GUTTER_Y;
            var line: LineInfo;
            var wordWrap: boolean = !this._widthAutoSize && !this._singleLine;
            var fontSize: number = this.fontSize;
            var fontScale: number = this._bitmapFont.resizable ? this.fontSize / this._bitmapFont.size : 1;
            this._textWidth = 0;
            this._textHeight = 0;

            var text2: string = this._text;
            if (this._templateVars != null)
                text2 = this.parseTemplate(text2);
            var textLength: number = text2.length;
            for (var offset: number = 0; offset < textLength; ++offset) {
                var ch: string = text2.charAt(offset);
                var cc: number = ch.charCodeAt(0);

                if (cc == 10) {
                    lineBuffer += ch;
                    line = LineInfo.borrow();
                    line.width = lineWidth;
                    if (lineTextHeight == 0) {
                        if (lastLineHeight == 0)
                            lastLineHeight = this.fontSize;
                        if (lineHeight == 0)
                            lineHeight = lastLineHeight;
                        lineTextHeight = lineHeight;
                    }
                    line.height = lineHeight;
                    lastLineHeight = lineHeight;
                    line.textHeight = lineTextHeight;
                    line.text = lineBuffer;
                    line.y = lineY;
                    lineY += (line.height + lineSpacing);
                    if (line.width > this._textWidth)
                        this._textWidth = line.width;
                    this._lines.push(line);

                    lineBuffer = "";
                    lineWidth = 0;
                    lineHeight = 0;
                    lineTextHeight = 0;
                    wordChars = 0;
                    wordStart = 0;
                    wordEnd = 0;
                    continue;
                }

                if (cc >= 65 && cc <= 90 || cc >= 97 && cc <= 122) //a-z,A-Z
                {
                    if (wordChars == 0)
                        wordStart = lineWidth;
                    wordChars++;
                }
                else {
                    if (wordChars > 0)
                        wordEnd = lineWidth;
                    wordChars = 0;
                }

                if (cc == 32) {
                    glyphWidth = Math.ceil(this.fontSize / 2);
                    glyphHeight = this.fontSize;
                }
                else {
                    var glyph: BMGlyph = this._bitmapFont.glyphs[ch];
                    if (glyph) {
                        glyphWidth = Math.ceil(glyph.advance * fontScale);
                        glyphHeight = Math.ceil(glyph.lineHeight * fontScale);
                    }
                    else {
                        glyphWidth = 0;
                        glyphHeight = 0;
                    }
                }
                if (glyphHeight > lineTextHeight)
                    lineTextHeight = glyphHeight;

                if (glyphHeight > lineHeight)
                    lineHeight = glyphHeight;

                if (lineWidth != 0)
                    lineWidth += this.letterSpacing;
                lineWidth += glyphWidth;

                if (!wordWrap || lineWidth <= rectWidth) {
                    lineBuffer += ch;
                }
                else {
                    line = LineInfo.borrow();
                    line.height = lineHeight;
                    line.textHeight = lineTextHeight;

                    if (lineBuffer.length == 0) {//the line cannt fit even a char
                        line.text = ch;
                    }
                    else if (wordChars > 0 && wordEnd > 0) {//if word had broken, move it to new line
                        lineBuffer += ch;
                        var len: number = lineBuffer.length - wordChars;
                        line.text = ToolSet.trimRight(lineBuffer.substr(0, len));
                        line.width = wordEnd;
                        lineBuffer = lineBuffer.substr(len);
                        lineWidth -= wordStart;
                    }
                    else {
                        line.text = lineBuffer;
                        line.width = lineWidth - (glyphWidth + this.letterSpacing);
                        lineBuffer = ch;
                        lineWidth = glyphWidth;
                        lineHeight = glyphHeight;
                        lineTextHeight = glyphHeight;
                    }
                    line.y = lineY;
                    lineY += (line.height + lineSpacing);
                    if (line.width > this._textWidth)
                        this._textWidth = line.width;

                    wordChars = 0;
                    wordStart = 0;
                    wordEnd = 0;
                    this._lines.push(line);
                }
            }

            if (lineBuffer.length > 0) {
                line = LineInfo.borrow();
                line.width = lineWidth;
                if (lineHeight == 0)
                    lineHeight = lastLineHeight;
                if (lineTextHeight == 0)
                    lineTextHeight = lineHeight;
                line.height = lineHeight;
                line.textHeight = lineTextHeight;
                line.text = lineBuffer;
                line.y = lineY;
                if (line.width > this._textWidth)
                    this._textWidth = line.width;
                this._lines.push(line);
            }

            if (this._textWidth > 0)
                this._textWidth += GBasicTextField.GUTTER_X * 2;

            var count: number = this._lines.length;
            if (count == 0) {
                this._textHeight = 0;
            }
            else {
                line = this._lines[this._lines.length - 1];
                this._textHeight = line.y + line.height + GBasicTextField.GUTTER_Y;
            }

            var w: number, h: number = 0;
            if (this._widthAutoSize) {
                if (this._textWidth == 0)
                    w = 0;
                else
                    w = this._textWidth;
            }
            else
                w = this.width;

            if (this._heightAutoSize) {
                if (this._textHeight == 0)
                    h = 0;
                else
                    h = this._textHeight;
            }
            else
                h = this.height;

            this._updatingSize = true;
            this.setSize(w, h);
            this._updatingSize = false;

            this.doAlign();

            if (w == 0 || h == 0)
                return;

            var charX: number = GBasicTextField.GUTTER_X;
            var lineIndent: number = 0;
            var charIndent: number = 0;
            rectWidth = this.width - GBasicTextField.GUTTER_X * 2;
            var lineCount: number = this._lines.length;
            for (var i: number = 0; i < lineCount; i++) {
                line = this._lines[i];
                charX = GBasicTextField.GUTTER_X;

                if (this.align == "center")
                    lineIndent = (rectWidth - line.width) / 2;
                else if (this.align == "right")
                    lineIndent = rectWidth - line.width;
                else
                    lineIndent = 0;
                textLength = line.text.length;
                for (var j: number = 0; j < textLength; j++) {
                    ch = line.text.charAt(j);
                    cc = ch.charCodeAt(0);

                    if (cc == 10)
                        continue;

                    if (cc == 32) {
                        charX += this._letterSpacing + Math.ceil(this.fontSize / 2);
                        continue;
                    }

                    glyph = this._bitmapFont.glyphs[ch];
                    if (glyph != null) {
                        charIndent = (line.height + line.textHeight) / 2 - Math.ceil(glyph.lineHeight * fontScale);
                        if (glyph.texture) {
                            gr.drawTexture(glyph.texture,
                                charX + lineIndent + Math.ceil(glyph.offsetX * fontScale),
                                line.y + charIndent + Math.ceil(glyph.offsetY * fontScale),
                                glyph.texture.width * fontScale,
                                glyph.texture.height * fontScale);
                        }
                        charX += this.letterSpacing + Math.ceil(glyph.advance * fontScale);
                    }
                    else {
                        charX += this.letterSpacing;
                    }
                }//this.text loop
            }//line loop
        }

        protected handleSizeChanged(): void {
            if (this._updatingSize)
                return;

            if (this._underConstruct)
                this.textField.size(this.width, this.height);
            else {
                if (this._bitmapFont != null) {
                    if (!this._widthAutoSize)
                        this.textField["setChanged"]();
                    else
                        this.doAlign();
                }
                else {
                    if (!this._widthAutoSize) {
                        if (!this._heightAutoSize)
                            this.textField.size(this.width, this.height);
                        else
                            this.textField.width = this.width;
                    }
                }
            }
        }

        protected handleGrayedChanged(): void {
            super.handleGrayedChanged();

            if (this.grayed)
                this.textField.color = "#AAAAAA";
            else
                this.textField.color = this._color;
        }

        private doAlign(): void {
            if (this.valign == "top" || this._textHeight == 0)
                this._yOffset = GBasicTextField.GUTTER_Y;
            else {
                var dh: number = this.height - this._textHeight;
                if (dh < 0)
                    dh = 0;
                if (this.valign == "middle")
                    this._yOffset = Math.floor(dh / 2);
                else
                    this._yOffset = Math.floor(dh);
            }
            this.handleXYChanged();
        }

        public flushVars(): void {
            this.text = this._text;
        }
    }

    class LineInfo {
        public width: number = 0;
        public height: number = 0;
        public textHeight: number = 0;
        public text: string;
        public y: number = 0;

        private static pool: any[] = [];

        public static borrow(): LineInfo {
            if (LineInfo.pool.length) {
                var ret: LineInfo = LineInfo.pool.pop();
                ret.width = 0;
                ret.height = 0;
                ret.textHeight = 0;
                ret.text = null;
                ret.y = 0;
                return ret;
            }
            else
                return new LineInfo();
        }

        public static returns(value: LineInfo): void {
            LineInfo.pool.push(value);
        }

        public static returnList(value: Array<LineInfo>): void {
            var length: number = value.length;
            for (var i: number = 0; i < length; i++) {
                var li: LineInfo = value[i];
                LineInfo.pool.push(li);
            }
            value.length = 0;
        }
    }

    class TextExt extends Laya.Text {
        private _owner: GBasicTextField;

        constructor(owner: GBasicTextField) {
            super();
            this._owner = owner;
        }

        private _lock: boolean;
        private _sizeDirty: boolean;
        public baseTypeset(): void {
            this._lock = true;
            this.typeset();
            this._lock = false;
        }

        public typeset(): void {
            this._sizeDirty = true; //阻止SIZE_DELAY_CHANGE的触发
            super.typeset();
            if (!this._lock)
                this._owner.typeset();
            if (this._isChanged) {
                Laya.timer.clear(this, this.typeset);
                this._isChanged = false;
            }
            this._sizeDirty = false;
        }

        public setChanged(): void {
            this.isChanged = true;
        }

        protected set isChanged(value: boolean) {
            if (value && !this._sizeDirty) {
                if (this._owner.autoSize != AutoSizeType.None && this._owner.parent) {
                    this._sizeDirty = true;
                    this.event(Events.SIZE_DELAY_CHANGE);
                }
            }

            super["isChanged"] = value;
        }
    }

}