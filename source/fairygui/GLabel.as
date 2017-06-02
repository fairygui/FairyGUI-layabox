package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.display.Input;
	
	public class GLabel extends GComponent implements IColorGear {
		protected var _titleObject: GObject;
		protected var _iconObject: GObject;
		
		public function GLabel() {
			super();
		}
		
		override public function get icon(): String {
			if(this._iconObject!=null)
				return this._iconObject.icon;
			else
				return null;
		}
		
		override public function set icon(value: String):void {
			if(this._iconObject!=null)
				this._iconObject.icon = value;
			this.updateGear(7);
		}
		
		public function get title(): String {
			if (this._titleObject)
				return this._titleObject.text;
			else
				return null;
		}
		
		public function set title(value: String):void {
			if (this._titleObject)
				this._titleObject.text = value;
			this.updateGear(6);
		}
		
		override public function get text(): String {
			return this.title;
		}
		
		override public function set text(value: String):void {
			this.title = value;
		}
		
		public function get titleColor(): String {
			if(this._titleObject is GTextField)
				return GTextField(this._titleObject).color;
			else if(this._titleObject is GLabel)
				return GLabel(this._titleObject).titleColor;
			else if(this._titleObject is GButton)
				return GButton(this._titleObject).titleColor;
			else
				return "#000000";
		}
		
		public function set titleColor(value: String):void {
			if(this._titleObject is GTextField)
				GTextField(this._titleObject).color = value;
			else if(this._titleObject is GLabel)
				GLabel(this._titleObject).titleColor = value;
			else if(this._titleObject is GButton)
				GButton(this._titleObject).titleColor = value;
			this.updateGear(4);
		}
		
		public function get titleFontSize():int
		{
			if(_titleObject is GTextField)
				return GTextField(_titleObject).fontSize;
			else if(_titleObject is GLabel)
				return GLabel(_titleObject).titleFontSize;
			else if(_titleObject is GButton)
				return GButton(_titleObject).titleFontSize;
			else
				return 0;
		}
		
		public function set titleFontSize(value:int):void
		{
			if(_titleObject is GTextField)
				GTextField(_titleObject).fontSize = value;
			else if(_titleObject is GLabel)
				GLabel(_titleObject).titleFontSize = value;
			else if(_titleObject is GButton)
				GButton(_titleObject).titleFontSize = value;
		}
		
		public function get color(): String {
			return this.titleColor;
		}
		
		public function set color(value: String):void {
			this.titleColor = value;
		}
		
		public function set editable(val: Boolean):void {
			if (this._titleObject)
				this._titleObject.asTextInput.editable = val;
		}
		
		public function get editable(): Boolean {
			if (this._titleObject && (this._titleObject is GTextInput))
				return this._titleObject.asTextInput.editable;
			else
				return false;
		}
		
		override protected function constructFromXML(xml: Object): void {
			super.constructFromXML(xml);
			
			this._titleObject = this.getChild("title");
			this._iconObject = this.getChild("icon");
		}
		
		override public function setup_afterAdd(xml: Object): void {
			super.setup_afterAdd(xml);
			
			xml = ToolSet.findChildNode(xml, "Label");
			if (xml) {
				var str: String;
				str = xml.getAttribute("title");
				if(str)
					this.text = str;
				str = xml.getAttribute("icon");
				if(str)
					this.icon = str;                
				str = xml.getAttribute("titleColor");
				if (str)
					this.titleColor = str;
				str = xml.getAttribute("titleFontSize");
				if(str)
					this.titleFontSize = parseInt(str);
				
				if(this._titleObject is GTextInput)
				{
					str = xml.getAttribute("prompt");
					if(str)
						GTextInput(this._titleObject).promptText = str;
					str = xml.getAttribute("maxLength");
					if(str)
						GTextInput(_titleObject).maxLength = parseInt(str);
					str = xml.getAttribute("restrict");
					if(str)
						GTextInput(_titleObject).restrict = str;
					str = xml.getAttribute("password");
					if(str)
						GTextInput(_titleObject).password = str=="true";
					str = xml.getAttribute("keyboardType");
					if(str=="4")
						GTextInput(_titleObject).keyboardType = Input.TYPE_NUMBER;
					else if(str=="3")
						GTextInput(_titleObject).keyboardType = Input.TYPE_URL;
				}
			}
		}
	}
}