///<reference path="GTextField.ts"/>

namespace fgui {
    export class GBasicTextField extends GTextField {
        private _textField: Laya.Text;

        private _font: string;
        private _color: string;
        private _singleLine: boolean;
        private _letterSpacing: number = 0;
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
            this._textField.align = "left";
            this._textField.font = fgui.UIConfig.defaultFont;
            this._autoSize = AutoSizeType.Both;
            this._widthAutoSize = this._heightAutoSize = true;
            this._textField["_sizeDirty"] = false;
        }

        protected createDisplayObject(): void {
            this._displayObject = this._textField = new TextExt(this);
            this._displayObject["$owner"] = this;
            this._displayObject.mouseEnabled = false;
        }

        public get nativeText(): Laya.Text {
            return this._textField;
        }

        public set text(value: string) {
            this._text = value;
            if (this._text == null)
                this._text = "";

            if (this._bitmapFont == null) {
                if (this._widthAutoSize)
                    this._textField.width = 10000;
                var text2: string = this._text;
                if (this._templateVars != null)
                    text2 = this.parseTemplate(text2);
                if (this._ubbEnabled) //laya还不支持同一个文本不同样式
                    this._textField.text = ToolSet.removeUBB(ToolSet.encodeHTML(text2));
                else
                    this._textField.text = text2;
            }
            else {
                this._textField.text = "";
                this._textField["setChanged"]();
            }

            if (this.parent && this.parent._underConstruct)
                this._textField.typeset();
        }

        public get text(): string {
            return this._text;
        }

        public get font(): string {
            return this._textField.font;
        }

        public set font(value: string) {
            this._font = value;
            if (ToolSet.startsWith(this._font, "ui://"))
                this._bitmapFont = UIPackage.getItemAssetByURL(this._font) as BitmapFont;
            else
                this._bitmapFont = null;

            if (this._bitmapFont != null) {
                this._textField["setChanged"]();
            }
            else {
                if (this._font)
                    this._textField.font = this._font;
                else
                    this._textField.font = fgui.UIConfig.defaultFont;
            }
        }

        public get fontSize(): number {
            return this._textField.fontSize;
        }

        public set fontSize(value: number) {
            this._textField.fontSize = value;
        }

        public get color(): string {
            return this._color;
        }

        public set color(value: string) {
            if (this._color != value) {
                this._color = value;
                this.updateGear(4);

                if (this.grayed)
                    this._textField.color = "#AAAAAA";
                else
                    this._textField.color = this._color;
            }
        }

        public get align(): string {
            return this._textField.align;
        }

        public set align(value: string) {
            this._textField.align = value;
        }

        public get valign(): string {
            return this._textField.valign;
        }

        public set valign(value: string) {
            this._textField.valign = value;
        }

        public get leading(): number {
            return this._textField.leading;
        }

        public set leading(value: number) {
            this._textField.leading = value;
        }

        public get letterSpacing(): number {
            return this._letterSpacing;
        }

        public set letterSpacing(value: number) {
            this._letterSpacing = value;
        }

        public get bold(): boolean {
            return this._textField.bold;
        }

        public set bold(value: boolean) {
            this._textField.bold = value;
        }

        public get italic(): boolean {
            return this._textField.italic;
        }

        public set italic(value: boolean) {
            this._textField.italic = value;
        }

        public get underline(): boolean {
            return this._textField.underline;
        }

        public set underline(value: boolean) {
            this._textField.underline = value;
        }

        public get singleLine(): boolean {
            return this._singleLine;
        }

        public set singleLine(value: boolean) {
            this._singleLine = value;
            this._textField.wordWrap = !this._widthAutoSize && !this._singleLine;
        }

        public get stroke(): number {
            return this._textField.stroke;
        }

        public set stroke(value: number) {
            this._textField.stroke = value;
        }

        public get strokeColor(): string {
            return this._textField.strokeColor;
        }

        public set strokeColor(value: string) {
            if (this._textField.strokeColor != value) {
                this._textField.strokeColor = value;
                this.updateGear(4);
            }
        }

        protected updateAutoSize(): void {
            /*一般没有剪裁文字的需要，感觉HIDDEN有消耗，所以不用了
            if(this._heightAutoSize)
            this._textField.overflow = Text.VISIBLE;
            else
            this._textField.overflow = Text.HIDDEN;*/
            this._textField.wordWrap = !this._widthAutoSize && !this._singleLine;
            if (!this._underConstruct) {
                if (!this._heightAutoSize)
                    this._textField.size(this.width, this.height);
                else if (!this._widthAutoSize)
                    this._textField.width = this.width;
            }
        }

        public get textWidth(): number {
            if (this._textField["_isChanged"])
                this._textField.typeset();
            return this._textWidth;
        }

        public ensureSizeCorrect(): void {
            if (!this._underConstruct && this._textField["_isChanged"])
                this._textField.typeset();
        }

        public typeset(): void {
            if (this._bitmapFont != null)
                this.renderWithBitmapFont();
            else if (this._widthAutoSize || this._heightAutoSize)
                this.updateSize();
        }

        private updateSize(): void {
            this._textWidth = Math.ceil(this._textField.textWidth);
            this._textHeight = Math.ceil(this._textField.textHeight);

            var w: number, h: number = 0;
            if (this._widthAutoSize) {
                w = this._textWidth;
                if (this._textField.width != w) {
                    this._textField.width = w;
                    if (this._textField.align != "left")
                        this._textField["baseTypeset"]();
                }
            }
            else
                w = this.width;

            if (this._heightAutoSize) {
                h = this._textHeight;
                if (!this._widthAutoSize) {
                    if (this._textField.height != this._textHeight)
                        this._textField.height = this._textHeight;
                }
            }
            else {
                h = this.height;
                if (this._textHeight > h)
                    this._textHeight = h;
                if (this._textField.height != this._textHeight)
                    this._textField.height = this._textHeight;
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
            var fontScale: number = this._bitmapFont.resizable ? fontSize / this._bitmapFont.size : 1;
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
                            lastLineHeight = fontSize;
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
                    glyphWidth = Math.ceil(fontSize / 2);
                    glyphHeight = fontSize;
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
                    lineWidth += this._letterSpacing;
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
                        line.width = lineWidth - (glyphWidth + this._letterSpacing);
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
            var color: string = this._bitmapFont.tint ? this._color : null;
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
                        charX += this._letterSpacing + Math.ceil(fontSize / 2);
                        continue;
                    }

                    glyph = this._bitmapFont.glyphs[ch];
                    if (glyph != null) {
                        charIndent = (line.height + line.textHeight) / 2 - Math.ceil(glyph.lineHeight * fontScale);
                        if (glyph.texture) {
                            gr.drawTexture(glyph.texture,
                                charX + lineIndent + Math.ceil(glyph.x * fontScale),
                                line.y + charIndent + Math.ceil(glyph.y * fontScale),
                                glyph.width * fontScale,
                                glyph.height * fontScale, null, 1, color);
                        }
                        charX += this._letterSpacing + Math.ceil(glyph.advance * fontScale);
                    }
                    else {
                        charX += this._letterSpacing;
                    }
                }//this.text loop
            }//line loop
        }

        protected handleSizeChanged(): void {
            if (this._updatingSize)
                return;

            if (this._underConstruct)
                this._textField.size(this._width, this._height);
            else {
                if (this._bitmapFont != null) {
                    if (!this._widthAutoSize)
                        this._textField["setChanged"]();
                    else
                        this.doAlign();
                }
                else {
                    if (!this._widthAutoSize) {
                        if (!this._heightAutoSize)
                            this._textField.size(this._width, this._height);
                        else
                            this._textField.width = this._width;
                    }
                }
            }
        }

        protected handleGrayedChanged(): void {
            super.handleGrayedChanged();

            if (this.grayed)
                this._textField.color = "#AAAAAA";
            else
                this._textField.color = this._color;
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