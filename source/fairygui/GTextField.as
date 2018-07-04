
package fairygui {
	
	
	public class GTextField extends GObject implements IColorGear {
		protected var _gearColor:GearColor;
		protected var _templateVars:Object;
		protected var _text: String;
		
		public function GTextField() {
			super();
			
			this._gearColor = new GearColor(this);
		}
		
		public function get font(): String {
			return null;
		}
		
		public function set font(value: String):void {
		}
		
		public function get fontSize(): Number {
			return 0;
		}
		
		public function set fontSize(value: Number):void {
		}
		
		public function get color(): String {
			return null;
		}
		
		public function set color(value: String):void {
		}
		
		public function get align(): String {
			return null;
		}
		
		public function set align(value: String):void {
		}
		
		public function get valign(): String {
			return null;
		}
		
		public function set valign(value: String):void {
		}
		
		public function get leading(): Number {
			return 0;
		}
		
		public function set leading(value: Number):void {
		}
		
		public function get letterSpacing(): Number {
			return 0;
		}
		
		public function set letterSpacing(value: Number):void {
		}        
		
		public function get bold(): Boolean {
			return false;
		}
		
		public function set bold(value: Boolean):void {
		}
		
		public function get italic(): Boolean {
			return false;
		}
		
		public function set italic(value: Boolean):void {
		}
		
		public function get underline(): Boolean {
			return false;
		}
		
		public function set underline(value: Boolean):void {
		}
		
		public function get singleLine(): Boolean {
			return false;
		}
		
		public function set singleLine(value: Boolean):void {
		}
		
		public function get stroke(): Number {
			return 0;
		}
		
		public function set stroke(value: Number):void {
		}
		
		public function get strokeColor(): String {
			return null;
		}
		
		public function set strokeColor(value: String):void {
		}
		
		public function set ubbEnabled(value: Boolean):void {
		}
		
		public function get ubbEnabled(): Boolean {
			return false;
		}
		
		public function get textWidth(): Number {
			return 0;
		}
		
		public function get gearColor(): GearColor {
			return this._gearColor;
		}
		
		protected function parseTemplate(template:String):String
		{
			var pos1:int = 0, pos2:int, pos3:int;
			var tag:String;
			var value:String;
			var result:String = "";
			while((pos2=template.indexOf("{", pos1))!=-1) {
				if (pos2 > 0 && template.charCodeAt(pos2 - 1) == 92 )//\
				{
					result += template.substring(pos1, pos2 - 1);
					result += "{";
					pos1 = pos2 + 1;
					continue;
				}
				
				result += template.substring(pos1, pos2);				
				pos1 = pos2;
				pos2 = template.indexOf("}", pos1);
				if(pos2==-1)
					break;
				
				if(pos2==pos1+1)
				{
					result += template.substr(pos1, 2);
					pos1 = pos2+1;
					continue;
				}
				
				tag = template.substring(pos1+1, pos2);
				pos3 = tag.indexOf("=");
				if(pos3!=-1)
				{
					value = _templateVars[tag.substring(0, pos3)];
					if(value==null)
						result += tag.substring(pos3+1);
					else
						result += value;
				}
				else
				{
					value = _templateVars[tag];
					if(value!=null)
						result += value;
				}
				pos1 = pos2+1;
			}
			
			if (pos1 < template.length)
				result += template.substr(pos1);
			
			return result;
		}
		
		public function get templateVars():Object
		{
			return _templateVars;
		}
		
		public function set templateVars(value:Object):void
		{
			if(_templateVars==null && value==null)
				return;
			
			_templateVars = value;
			flushVars();			
		}
		
		public function setVar(name:String, value:String):GTextField
		{
			if(!_templateVars)
				_templateVars = {};
			_templateVars[name] = value;
			
			return this;
		}
		
		public function flushVars():void
		{
			this.text = _text;
		}
		
		override public function handleControllerChanged(c: Controller): void {
			super.handleControllerChanged(c);
			
			if(this._gearColor.controller == c)
				this._gearColor.apply();
		}
		
		override public function setup_beforeAdd(xml: Object): void {
			super.setup_beforeAdd(xml);
			
			var str: String;
			
			str = xml.getAttribute("font");
			if (str)
				this.font = str;
			
			str = xml.getAttribute("fontSize");
			if (str)
				this.fontSize = parseInt(str);
			
			str = xml.getAttribute("color");
			if (str)
				this.color = str;
			
			str = xml.getAttribute("align");
			if (str)
				this.align = str;
			
			str = xml.getAttribute("vAlign");
			if (str)
				this.valign = str;
			
			str = xml.getAttribute("leading");
			if (str)
				this.leading = parseInt(str);
			else
				this.leading = 3;
			
			str = xml.getAttribute("letterSpacing");
			if (str)
				this.letterSpacing = parseInt(str);
			
			this.ubbEnabled = xml.getAttribute("ubb") == "true";           
			this.italic = xml.getAttribute("italic") == "true";
			this.bold = xml.getAttribute("bold") == "true";
			this.underline = xml.getAttribute("underline") == "true";
			this.singleLine = xml.getAttribute("singleLine") == "true";
			str = xml.getAttribute("strokeColor");
			if (str) {
				this.strokeColor = str;
				str = xml.getAttribute("strokeSize");
				if(str)
					this.stroke = parseInt(str) + 1;
				else
					this.stroke = 2;
			}
			if(xml.getAttribute("vars")=="true")
				_templateVars = {};
		}
		
		override public function setup_afterAdd(xml: Object): void {
			super.setup_afterAdd(xml);
			
			var str:String = xml.getAttribute("text");
			if(str != null && str.length > 0)
				this.text = str;
		}
	}
}