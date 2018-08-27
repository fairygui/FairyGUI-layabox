
package fairygui {
	import fairygui.gears.GearColor;
	import fairygui.utils.ByteBuffer;
	import fairygui.gears.IColorGear;
	
	
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
		
		/**
		 * @see AutoSizeType
		 */
		public function get autoSize(): int {
			return AutoSizeType.None;	
		}
		
		/**
		 * @see AutoSizeType
		 */
		public function set autoSize(value: int):void {
			
		}
		
		public function get textWidth(): Number {
			return 0;
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
		
		override public function setup_beforeAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_beforeAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 5);
			
			var iv:int;
			
			this.font = buffer.readS();
			this.fontSize = buffer.getInt16();
			this.color = buffer.readColorS();
			iv = buffer.readByte();
			this.align = iv==0?"left":(iv==1?"center":"right");
			iv = buffer.readByte();
			this.valign = iv==0?"top":(iv==1?"middle":"bottom");
			this.leading = buffer.getInt16();
			this.letterSpacing = buffer.getInt16();
			this.ubbEnabled = buffer.readBool();
			this.autoSize = buffer.readByte();
			this.underline = buffer.readBool();
			this.italic = buffer.readBool();
			this.bold = buffer.readBool();
			this.singleLine = buffer.readBool();
			if (buffer.readBool())
			{
				this.strokeColor = buffer.readColorS();
				this.stroke = buffer.getFloat32()+1;
			}
			
			if (buffer.readBool()) //shadow
				buffer.skip(12);
			
			if (buffer.readBool())
				_templateVars = {};
		}
		
		override public function setup_afterAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_afterAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 6);
			
			var str:String = buffer.readS();
			if (str != null)
				this.text = str;
		}
	}
}