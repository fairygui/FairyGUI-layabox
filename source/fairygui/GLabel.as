package fairygui {
	import fairygui.gears.IColorGear;
	import fairygui.utils.ByteBuffer;
	
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
			var tf:GTextField = getTextField();
			if(tf!=null)
				return tf.color;
			else
				return "#000000";
		}
		
		public function set titleColor(value: String):void {
			var tf:GTextField = getTextField();
			if(tf!=null)
				tf.color = value;
			this.updateGear(4);
		}
		
		public function get titleFontSize():int {
			var tf:GTextField = getTextField();
			if(tf!=null)
				return tf.fontSize;
			else
				return 0;
		}
		
		public function set titleFontSize(value:int):void
		{
			var tf:GTextField = getTextField();
			if(tf!=null)
				tf.fontSize = value;
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
		
		public function getTextField():GTextField
		{
			if (_titleObject is GTextField)
				return _titleObject as GTextField;
			else if (_titleObject is GLabel)
				return (_titleObject as GLabel).getTextField();
			else if (_titleObject is GButton)
				return (_titleObject as GButton).getTextField();
			else
				return null;
		}
		
		override protected function constructExtension(buffer:ByteBuffer): void {
			this._titleObject = this.getChild("title");
			this._iconObject = this.getChild("icon");
		}
		
		override public function setup_afterAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_afterAdd(buffer, beginPos);
			
			if (!buffer.seek(beginPos, 6))
				return;
			
			if (buffer.readByte() != packageItem.objectType)
				return;
			
			var str:String;
			str = buffer.readS();
			if (str != null)
				this.title = str;
			str = buffer.readS();
			if (str != null)
				this.icon = str;
			if (buffer.readBool())
				this.titleColor = buffer.readColorS();
			var iv:int = buffer.getInt32();
			if (iv != 0)
				this.titleFontSize = iv;
			
			if (buffer.readBool())
			{
				var input:GTextInput = getTextField() as GTextInput;
				if (input != null)
				{
					str = buffer.readS();
					if (str != null)
						input.promptText = str;
					
					str = buffer.readS();
					if (str != null)
						input.restrict = str;
					
					iv = buffer.getInt32();
					if (iv != 0)
						input.maxLength = iv;
					iv = buffer.getInt32();
					if (iv != 0)
					{
						if(iv==4)
							input.keyboardType = Input.TYPE_NUMBER;
						else if(iv==3)
							input.keyboardType = Input.TYPE_URL;
					}
					if (buffer.readBool())
						input.password = true;
				}
				else
					buffer.skip(13);
			}
		}
	}
}