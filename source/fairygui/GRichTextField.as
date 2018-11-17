package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.html.dom.HTMLDivElement;
	
	public class GRichTextField extends GTextField {
		public var div:laya.html.dom.HTMLDivElement;
		
		private var _ubbEnabled: Boolean;
		private var _color:String;
		
		public function GRichTextField() {
			super();
			this._text = "";
		}
		
		override protected function createDisplayObject(): void {
			this._displayObject = this.div = new HTMLDivElement();
			this._displayObject.mouseEnabled = true;
			this._displayObject["$owner"] = this;
		}        
		
		override public function set text(value: String):void {
			this._text = value;
			var text2:String = _text;
			if (_templateVars != null)
				text2 = parseTemplate(text2);
			if(this._ubbEnabled)
				this.div.innerHTML = ToolSet.parseUBB(text2);
			else
				this.div.innerHTML = text2;
		}
		
		override public function get text():String {
			return this._text;
		}
		
		override public function get font(): String {
			return this.div.style.font;
		}
		
		override public function set font(value: String):void {
			if(value)
				this.div.style.font = value;
			else
				this.div.style.font = fairygui.UIConfig.defaultFont;
		}
		
		override public function get fontSize(): Number {
			return this.div.style.fontSize;
		}
		
		override public function set fontSize(value: Number):void {
			this.div.style.fontSize = value;
		}
		
		override public function get color(): String {
			return _color;
		}
		
		override public function set color(value: String):void {
			if (_color != value) {
				_color = value;
				this.div.style.color = value;
				if (this._gearColor.controller)
					this._gearColor.updateState();
			}
		}
		
		override public function get align(): String {
			return this.div.style.align;
		}
		
		override public function set align(value: String):void {
			this.div.style.align = value;
		}
		
		override public function get valign(): String {
			return this.div.style.valign;
		}
		
		override public function set valign(value: String):void {
			this.div.style.valign = value;
		}
		
		override public function get leading(): Number {
			return this.div.style.leading;
		}
		
		override public function set leading(value: Number):void {
			this.div.style.leading = value;
		}
		
		override public function get bold(): Boolean {
			return this.div.style.bold;
		}
		
		override public function set bold(value: Boolean):void {
			this.div.style.bold = value;
		}
		
		override public function get italic(): Boolean {
			return this.div.style.italic;
		}
		
		override public function set italic(value: Boolean):void {
			this.div.style.italic = value;
		}
		
		override public function get stroke(): Number {
			return this.div.style.stroke;
		}
		
		override public function set stroke(value: Number):void {
			this.div.style.stroke = value;
		}
		
		override public function get strokeColor(): String {
			return this.div.style.strokeColor;
		}
		
		override public function set strokeColor(value: String):void {
			this.div.style.strokeColor = value;
			updateGear(4);
		}
		
		override public function set ubbEnabled(value: Boolean):void {
			this._ubbEnabled = value;
		}
		
		override public function get ubbEnabled(): Boolean {
			return this._ubbEnabled;
		}
		
		override protected function handleSizeChanged(): void {
			this.div.size(this.width, this.height);
		}
	}
}