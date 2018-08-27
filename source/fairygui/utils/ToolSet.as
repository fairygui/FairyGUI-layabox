package fairygui.utils {
	import fairygui.GObject;
	
	import laya.display.Node;
	import laya.display.Stage;
	import laya.utils.Byte;
	
	public class ToolSet {
		public function ToolSet() {
		}
		
		public static function getFileName(source: String): String {
			var i: Number = source.lastIndexOf("/");
			if (i != -1)
				source = source.substr(i + 1);
			i = source.lastIndexOf("\\");
			if (i != -1)
				source = source.substr(i + 1);
			i = source.lastIndexOf(".");
			if (i != -1)
				return source.substring(0, i);
			else
				return source;
		}
		
		public static function startsWith(source: String, str: String, ignoreCase: Boolean= false): Boolean {
			if (!source)
				return false;
			else if (source.length < str.length)
				return false;
			else {
				source = source.substring(0, str.length);
				if (!ignoreCase)
					return source == str;
				else
					return source.toLowerCase() == str.toLowerCase();
			}
		}
		
		public static function endsWith(source: String, str: String, ignoreCase: Boolean= false): Boolean {
			if (!source)
				return false;
			else if (source.length < str.length)
				return false;
			else {
				source = source.substring(source.length - str.length);
				if (!ignoreCase)
					return source == str;
				else
					return source.toLowerCase() == str.toLowerCase();
			}
		}
		
		public static function trim(targetString: String): String {
			return ToolSet.trimLeft(ToolSet.trimRight(targetString));
		}
		
		public static function trimLeft(targetString: String): String {
			var tempChar: String = "";
			for (var i: Number = 0; i < targetString.length; i++) {
				tempChar = targetString.charAt(i);
				if (tempChar != " " && tempChar != "\n" && tempChar != "\r") {
					break;
				}
			}
			return targetString.substr(i);
		}
		
		public static function trimRight(targetString: String): String {
			var tempChar: String = "";
			for (var i: Number = targetString.length - 1; i >= 0; i--) {
				tempChar = targetString.charAt(i);
				if (tempChar != " " && tempChar != "\n" && tempChar != "\r") {
					break;
				}
			}
			return targetString.substring(0, i + 1);
		}
		
		
		public static function convertToHtmlColor(argb: Number, hasAlpha: Boolean= false): String {
			var alpha: String;
			if (hasAlpha)
				alpha = (argb >> 24 & 0xFF).toString(16);
			else
				alpha = "";
			var red: String = (argb >> 16 & 0xFF).toString(16);
			var green: String = (argb >> 8 & 0xFF).toString(16);
			var blue: String = (argb & 0xFF).toString(16);
			if (alpha.length == 1)
				alpha = "0" + alpha;
			if (red.length == 1)
				red = "0" + red;
			if (green.length == 1)
				green = "0" + green;
			if (blue.length == 1)
				blue = "0" + blue;
			return "#" + alpha + red + green + blue;
		}
		
		public static function convertFromHtmlColor(str: String, hasAlpha: Boolean= false): Number {
			if (str.length < 1)
				return 0;
			
			if (str.charAt(0) == "#")
				str = str.substr(1);
			
			if (str.length == 8)
				return (parseInt(str.substr(0, 2), 16) << 24) + parseInt(str.substr(2), 16);
			else if (hasAlpha)
				return 0xFF000000 + parseInt(str, 16);
			else
				return parseInt(str, 16);
		}
		
		public static function displayObjectToGObject(obj: Node): GObject {
			while (obj != null && !(obj is Stage)) {
				if (obj["$owner"])
					return obj["$owner"];
				
				obj = obj.parent;
			}
			return null;
		}
		
		public static function encodeHTML(str: String): String {
			if (!str)
				return "";
			else
				return str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&apos;");
		}
		
		public static var defaultUBBParser:UBBParser = new UBBParser();
		public static function parseUBB(text: String): String {
			return ToolSet.defaultUBBParser.parse(text);
		}
		
		public static function removeUBB(text: String) :String {
			return ToolSet.defaultUBBParser.parse(text, true);
		}
		
		public static function clamp(value:Number, min:Number, max:Number):Number
		{
			if(value<min)
				value = min;
			else if(value>max)
				value = max;
			return value;
		}
		
		public static function clamp01(value:Number):Number
		{
			if(value>1)
				value = 1;
			else if(value<0)
				value = 0;
			return value;
		}
		
		public static function lerp(start:Number, end:Number, percent:Number):Number
		{
			return (start + percent*(end - start));
		}
	}
}