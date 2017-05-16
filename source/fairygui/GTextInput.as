package fairygui {
	import laya.display.Input;
	
	public class GTextInput extends GTextField {
		public var input: Input;
		
		public function GTextInput() {
			super();
		}
		
		override protected function createDisplayObject(): void {
			this._displayObject = this.input = new Input();
			this._displayObject.mouseEnabled = true;
			this._displayObject["$owner"] = this;
		}
		
		override public function set text(value: String):void {
			this.input.text = value;
		}
		
		override public function get text(): String {
			return this.input.text;
		}
		
		override public function get font(): String {
			return this.input.font;
		}
		
		override public function set font(value: String):void {
			this.input.font = value;
		}
		
		override public function get fontSize(): Number {
			return this.input.fontSize;
		}
		
		override public function set fontSize(value: Number):void {
			this.input.fontSize = value;
		}
		
		override public function get color(): String {
			return this.input.color;
		}
		
		override public function set color(value: String):void {
			this.input.color = value;
		}
		
		override public function get align(): String {
			return this.input.align;
		}
		
		override public function set align(value: String):void {
			this.input.align = value;
		}
		
		override public function get valign(): String {
			return this.input.valign;
		}
		
		override public function set valign(value: String):void {
			this.input.valign = value;
		}
		
		override public function get leading(): Number {
			return this.input.leading;
		}
		
		override public function set leading(value: Number):void {
			this.input.leading = value;
		}
		
		override public function get bold(): Boolean {
			return this.input.bold;
		}
		
		override public function set bold(value: Boolean):void {
			this.input.bold = value;
		}
		
		override public function get italic(): Boolean {
			return this.input.italic;
		}
		
		override public function set italic(value: Boolean):void {
			this.input.italic = value;
		}
		
		override public function get singleLine(): Boolean {
			return !this.input.multiline;
		}
		
		override public function set singleLine(value: Boolean):void {
			this.input.multiline = !value;
		}
		
		override public function get stroke(): Number {
			return this.input.stroke;
		}
		
		override public function set stroke(value: Number):void {
			this.input.stroke = value;
		}
		
		override public function get strokeColor(): String {
			return this.input.strokeColor;
		}
		
		override public function set strokeColor(value: String):void {
			this.input.strokeColor = value;
			updateGear(4);
		}
		
		public function get password(): Boolean {
			return this.input.type=="password";
		}
		
		public function set password(value: Boolean):void {
			if (value)
				this.input.type = "password";
			else
				this.input.type = "text";
		}
		
		public function get keyboardType(): String {
			return this.input.type;
		}
		
		public function set keyboardType(value: String):void {
			this.input.type = value;
		}
		
		public function set editable(value:Boolean):void {
			this.input.editable = value;
		}
		
		public function get editable():Boolean {
			return this.input.editable;
		}
		
		public function set maxLength(value:Number):void {
			this.input.maxChars = value;
		}
		
		public function get maxLength():Number {
			return this.input.maxChars;
		}
		
		public function set promptText(value: String):void {
			this.input.prompt = value;
		}
		
		public function get promptText(): String {
			return this.input.prompt;
		}
		
		public function set restrict(value:String):void {
			this.input.restrict = value;
		}
		
		public function get restrict():String {
			return this.input.restrict;
		}
		
		override public function get textWidth(): Number {
			return this.input.textWidth;
		}
		
		override protected function handleSizeChanged(): void {
			this.input.size(this.width, this.height);
		}
		
		override public function setup_beforeAdd(xml:Object):void
		{
			super.setup_beforeAdd(xml);
			
			var str:String = xml.getAttribute("prompt");
			if(str)
				this.promptText = str;
			str = xml.getAttribute("maxLength");
			if(str)
				this.input.maxChars = parseInt(str);
			str = xml.getAttribute("restrict");
			if(str)
				this.input.restrict = str;
			if(xml.getAttribute("password")=="true")
				this.password = true;
			else
			{
				str = xml.getAttribute("keyboardType");
				if(str=="4")
					this.keyboardType = Input.TYPE_NUMBER;
				else if(str=="3")
					this.keyboardType = Input.TYPE_URL;
			}
		}
	}
}