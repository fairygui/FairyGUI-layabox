package fairygui {
	import fairygui.display.BMGlyph;
	import fairygui.display.BitmapFont;
	import fairygui.utils.ToolSet;
	
	import laya.display.Graphics;
	import laya.display.Text;
	
	public class GBasicTextField extends GTextField {
		public var textField: Text;
		
		private var _font:String;
		private var _color: String;           
		private var _text: String;
		private var _ubbEnabled: Boolean;
		private var _singleLine:Boolean;
		private var _letterSpacing:Number = 0;
		
		private var _autoSize: int;
		private var _widthAutoSize: Boolean;
		private var _heightAutoSize: Boolean;
		
		private var _updatingSize: Boolean;
		private var _textWidth: Number = 0;
		private var _textHeight: Number = 0;
		
		private var _bitmapFont: BitmapFont;
		private var _lines: Vector.<LineInfo>;
		
		private static const GUTTER_X: Number = 2;
		private static const GUTTER_Y: Number = 2;
		
		public function GBasicTextField() {
			super();
			
			this._text = "";
			this._color = "#000000";            
			this.textField.align = "left";
			this.textField.font = fairygui.UIConfig.defaultFont;
			this._autoSize = AutoSizeType.Both;
			this._widthAutoSize = this._heightAutoSize = true;
			this.textField["_sizeDirty"] = false;
		}
		
		override protected function createDisplayObject(): void {
			this._displayObject = this.textField = new TextExt(this);
			this._displayObject["$owner"] = this;
			this._displayObject.mouseEnabled = false;
		}
		
		override public function set text(value: String):void {
			this._text = value;
			if(this._text == null)
				this._text = "";
			
			if(this._bitmapFont == null) {
				if(this._widthAutoSize)
					this.textField.width = 10000;
				if(this._ubbEnabled) //laya还不支持同一个文本不同样式
					this.textField.text = ToolSet.removeUBB(ToolSet.encodeHTML(this._text));
				else
					this.textField.text = this._text;
			}
			else
			{
				this.textField.text = "";
				this.textField["setChanged"]();
			}
			
			if(this.parent && this.parent._underConstruct)
				this.textField.typeset();
		}
		
		override public function get text(): String {
			return this._text;
		}
		
		override public function get font(): String {
			return this.textField.font;
		}
		
		override public function set font(value: String):void {
			this._font = value;
			if(ToolSet.startsWith(this._font,"ui://")) {
				this._bitmapFont = UIPackage.getBitmapFontByURL(this._font);
				this.textField["setChanged"]();
			}
			else {
				this._bitmapFont = null;
				
				if(this._font)
					this.textField.font = this._font;
				else
					this.textField.font = fairygui.UIConfig.defaultFont;
			}
		}
		
		override public function get fontSize(): Number {
			return this.textField.fontSize;
		}
		
		override public function set fontSize(value: Number):void {
			this.textField.fontSize = value;
		}
		
		override public function get color(): String {
			return this._color;
		}
		
		override public function set color(value: String):void {
			if (this._color != value) {
				this._color = value;
				
				if (this._gearColor.controller)
					this._gearColor.updateState();
				
				if(this.grayed)
					this.textField.color = "#AAAAAA";
				else
					this.textField.color = this._color;
			}
		}
		
		override public function get align(): String {
			return this.textField.align;
		}
		
		override public function set align(value: String):void {
			this.textField.align = value;
		}
		
		override public function get valign(): String {
			return this.textField.valign;
		}
		
		override public function set valign(value: String):void {
			this.textField.valign = value;
		}
		
		override public function get leading(): Number {
			return this.textField.leading;
		}
		
		override public function set leading(value: Number):void {
			this.textField.leading = value;
		}
		
		override public function get letterSpacing(): Number {
			return this._letterSpacing;
		}
		
		override public function set letterSpacing(value: Number):void {
			this._letterSpacing = value;
		}
		
		override public function get bold(): Boolean {
			return this.textField.bold;
		}
		
		override public function set bold(value: Boolean):void {
			this.textField.bold = value;
		}
		
		override public function get italic(): Boolean {
			return this.textField.italic;
		}
		
		override public function set italic(value: Boolean):void {
			this.textField.italic = value;
		}
		
		override public function get underline(): Boolean {
			return this.textField.underline;
		}
		
		override public function set underline(value: Boolean):void {
			this.textField.underline = value;
		}
		
		override public function get singleLine(): Boolean {
			return this._singleLine;
		}
		
		override public function set singleLine(value: Boolean):void {
			this._singleLine = value;
			this.textField.wordWrap = !this._widthAutoSize && !this._singleLine;
		}
		
		override public function get stroke(): Number {
			return this.textField.stroke;
		}
		
		override public function set stroke(value: Number):void {
			this.textField.stroke = value;
		}
		
		override public function get strokeColor(): String {
			return this.textField.strokeColor;
		}
		
		override public function set strokeColor(value: String):void {
			this.textField.strokeColor = value;
			updateGear(4);
		}
		
		override public function set ubbEnabled(value: Boolean):void {
			this._ubbEnabled = value;
		}
		
		override public function get ubbEnabled(): Boolean {
			return this._ubbEnabled;
		}
		
		public function set autoSize(value: int):void {
			if (this._autoSize != value) {
				this.setAutoSize(value);
			}
		}
		
		private function setAutoSize(value: int):void {
			this._autoSize = value;
			this._widthAutoSize = value == AutoSizeType.Both;
			this._heightAutoSize = value == AutoSizeType.Both || value == AutoSizeType.Height;
			/*一般没有剪裁文字的需要，感觉HIDDEN有消耗，所以不用了
			if(this._heightAutoSize)
			this.textField.overflow = Text.VISIBLE;
			else
			this.textField.overflow = Text.HIDDEN;*/
			this.textField.wordWrap = !this._widthAutoSize && !this._singleLine;
			if(!this._underConstruct)
			{
				if(!this._heightAutoSize)
					this.textField.size(this.width, this.height);
				else if(!this._widthAutoSize)
					this.textField.width = this.width;
			}
		}
		
		public function get autoSize(): int {
			return this._autoSize;
		}
		
		override public function get textWidth(): Number {
			if (this.textField["_isChanged"])
				this.textField.typeset();
			return this._textWidth;
		}
		
		override public function ensureSizeCorrect(): void {
			if (!this._underConstruct && this.textField["_isChanged"])
				this.textField.typeset();
		}
		
		public function typeset():void {
			if(this._bitmapFont!=null)
				this.renderWithBitmapFont();
			else if(this._widthAutoSize || this._heightAutoSize)
				this.updateSize();
		}
		
		private function updateSize(): void {
			this._textWidth = Math.ceil(this.textField.textWidth);
			this._textHeight = Math.ceil(this.textField.textHeight);
			
			var w: Number, h: Number = 0;
			if(this._widthAutoSize)
			{
				w = this._textWidth;
				if(this.textField.width!=w)
				{
					this.textField.width = w;
					if(this.textField.align!="left")
						this.textField["baseTypeset"]();
				}
			}
			else
				w = this.width;
			
			if(this._heightAutoSize) {
				h = this._textHeight;
				if(!this._widthAutoSize) {
					if(this.textField.height!=this._textHeight)
						this.textField.height = this._textHeight;
				}
			}
			else {
				h = this.height;
				if(this._textHeight > h)
					this._textHeight = h;
				if(this.textField.height!=this._textHeight)
					this.textField.height = this._textHeight;
			}
			
			this._updatingSize = true;
			this.setSize(w,h);
			this._updatingSize = false;
		}
		
		private function renderWithBitmapFont(): void {
			var gr:Graphics = this._displayObject.graphics;
			gr.clear();
			
			if (!this._lines)
				this._lines = new Vector.<LineInfo>();
			else
				LineInfo.returnList(this._lines);
			
			var letterSpacing: Number = this.letterSpacing;
			var lineSpacing: Number = this.leading - 1;
			var rectWidth: Number = this.width - GBasicTextField.GUTTER_X * 2;
			var lineWidth: Number = 0, lineHeight: Number = 0, lineTextHeight: Number = 0;
			var glyphWidth: Number = 0, glyphHeight: Number = 0;
			var wordChars: Number = 0, wordStart: Number = 0, wordEnd: Number = 0;
			var lastLineHeight: Number = 0;
			var lineBuffer: String = "";
			var lineY: Number = GBasicTextField.GUTTER_Y;
			var line: LineInfo;
			var wordWrap: Boolean = !this._widthAutoSize && !this._singleLine;
			var fontSize:Number = this.fontSize;
			var fontScale: Number = this._bitmapFont.resizable?fontSize/this._bitmapFont.size:1;
			this._textWidth = 0;
			this._textHeight = 0;
			
			var textLength: Number = this._text.length;
			for (var offset: Number = 0; offset < textLength; ++offset) {
				var ch: String = this._text.charAt(offset);
				var cc: Number = ch.charCodeAt(0);
				
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
				
				if (cc>=65 && cc<=90 || cc>=97 && cc<=122) //a-z,A-Z
				{
					if (wordChars == 0)
						wordStart = lineWidth;
					wordChars++;
				}
				else
				{
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
						glyphWidth = Math.ceil(glyph.advance*fontScale); 
						glyphHeight = Math.ceil(glyph.lineHeight*fontScale);
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
					lineWidth += letterSpacing;
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
						var len: Number = lineBuffer.length - wordChars;
						line.text = ToolSet.trimRight(lineBuffer.substr(0, len));
						line.width = wordEnd;
						lineBuffer = lineBuffer.substr(len);
						lineWidth -= wordStart;
					}
					else {
						line.text = lineBuffer;
						line.width = lineWidth - (glyphWidth + letterSpacing);
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
			
			var count: Number = this._lines.length;
			if (count == 0) {
				this._textHeight = 0;
			}
			else {
				line = this._lines[this._lines.length - 1];
				this._textHeight = line.y + line.height + GBasicTextField.GUTTER_Y;
			}
			
			var w: Number, h: Number = 0;
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
			
			var charX: Number = GBasicTextField.GUTTER_X;
			var lineIndent: Number = 0;
			var charIndent: Number = 0;
			rectWidth = this.width - GBasicTextField.GUTTER_X * 2;
			var lineCount: Number = this._lines.length;
			for (var i: Number = 0; i < lineCount; i++) {
				line = this._lines[i];
				charX = GBasicTextField.GUTTER_X;
				
				if (this.align == "center")
					lineIndent = (rectWidth - line.width) / 2;
				else if (this.align == "right")
					lineIndent = rectWidth - line.width;
				else
					lineIndent = 0;
				textLength = line.text.length;
				for (var j: Number = 0; j < textLength; j++) {
					ch = line.text.charAt(j);
					cc = ch.charCodeAt(0);
					
					if(cc==10)
						continue;
					
					if(cc==32)
					{
						charX += _letterSpacing + Math.ceil(fontSize/2);
						continue;
					}
					
					glyph = this._bitmapFont.glyphs[ch];
					if (glyph != null) {
						charIndent = (line.height + line.textHeight) / 2 - Math.ceil(glyph.lineHeight*fontScale);
						gr.drawTexture(glyph.texture,
							charX + lineIndent + Math.ceil(glyph.offsetX*fontScale),
							line.y + charIndent + Math.ceil(glyph.offsetY*fontScale),
							glyph.texture.width * fontScale,
							glyph.texture.height * fontScale);
						charX += letterSpacing + Math.ceil(glyph.advance*fontScale);
					}
					else {
						charX += letterSpacing;
					}
				}//text loop
			}//line loop
		}
		
		override protected function handleSizeChanged(): void {
			if(this._updatingSize)
				return;
			
			if(this._underConstruct)
				this.textField.size(this.width, this.height);
			else
			{
				if(this._bitmapFont!=null) {
					if(!this._widthAutoSize)
						this.textField["setChanged"]();
					else
						this.doAlign();
				}
				else {
					if(!this._widthAutoSize) {
						if(!this._heightAutoSize)
							this.textField.size(this.width, this.height);
						else
							this.textField.width = this.width;
					}
				}
			}
		}
		
		override protected function handleGrayedChanged(): void {
			super.handleGrayedChanged();
			
			if(this.grayed)
				this.textField.color = "#AAAAAA";
			else
				this.textField.color = this._color;
		}
		
		private function doAlign(): void {
			if(this.valign == "top" || this._textHeight == 0)
				this._yOffset = GBasicTextField.GUTTER_Y;
			else {
				var dh: Number = this.height - this._textHeight;
				if(dh < 0)
					dh = 0;
				if(this.valign == "middle")
					this._yOffset = Math.floor(dh / 2);
				else
					this._yOffset = Math.floor(dh);
			}
			this.handleXYChanged();
		}
		
		override public function setup_beforeAdd(xml: Object): void {
			super.setup_beforeAdd(xml);
			
			var str: String;
			str = xml.getAttribute("autoSize");
			if (str)
				this.setAutoSize(AutoSizeType.parse(str));
		}
	}
}

import fairygui.AutoSizeType;
import fairygui.Events;
import fairygui.GBasicTextField;

import laya.display.Text;

class LineInfo {
	public var width: Number = 0;
	public var height: Number = 0;
	public var textHeight: Number = 0;
	public var text: String;
	public var y: Number = 0;
	
	private static var pool: Array = [];
	
	public static function borrow(): LineInfo {
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
	
	public static function returns(value: LineInfo): void {
		LineInfo.pool.push(value);
	}
	
	public static function returnList(value: Vector.<LineInfo>): void {
		var length: Number = value.length;
		for (var i: Number = 0; i < length; i++) {
			var li: LineInfo = value[i];
			LineInfo.pool.push(li);
		}
		value.length = 0;
	}
	
	public function LineInfo() {
	}
}

class TextExt extends Text
{
	private var _owner:GBasicTextField;
	
	public function TextExt(owner:GBasicTextField)
	{
		super();
		this._owner = owner;
	}
	
	private var _lock:Boolean;
	private var _sizeDirty:Boolean;
	public function baseTypeset():void
	{
		_lock = true;
		typeset();
		_lock = false;
	}
	
	override public function typeset():void
	{
		_sizeDirty = true; //阻止SIZE_DELAY_CHANGE的触发
		super.typeset();
		if(!_lock)
			this._owner.typeset();
		if(this._isChanged) {
			Laya.timer.clear(this, this.typeset);
			this._isChanged = false;
		}
		_sizeDirty = false;
	}
	
	public function setChanged():void
	{
		this.isChanged = true;
	}
	
	override protected function set isChanged(value:Boolean):void {
		if (value && !_sizeDirty) {
			if(this._owner.autoSize!=AutoSizeType.None && this._owner.parent)
			{
				_sizeDirty = true;
				this.event(Events.SIZE_DELAY_CHANGE);
			}
		}
		
		super.isChanged = value;
	}
}
