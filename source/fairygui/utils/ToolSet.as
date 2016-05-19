package fairygui.utils {
	import fairygui.GObject;
	
	import laya.display.Node;
	import laya.display.Stage;
	import laya.utils.Ease;

    public class ToolSet {
        public static var GRAY_FILTERS_MATRIX:Array = [0.3086,0.6094,0.082,0,0,0.3086,0.6094,0.082,0,0,0.3086,0.6094,0.082,0,0,0,0,0,1,0];
        
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
        
        public static function findChildNode(xml: Object, name: String): Object {
            var col: Array = xml.childNodes;
            var length1: Number = col.length;
            if (length1>0) {
                for (var i1: Number = 0; i1 < length1; i1++) {
                    var cxml: Object = col[i1];
                    if (cxml.nodeName == name) {
                        return cxml;
                    }
                }
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
		
		private static var EaseMap: Object =
			{
				"Linear": Ease.linearNone,
				"Elastic.In": Ease.elasticIn,
				"Elastic.Out": Ease.elasticOut,
				"Elastic.InOut": Ease.elasticInOut,
				"Quad.In": Ease.QuadIn,
				"Quad.Out": Ease.QuadOut,
				"Quad.InOut": Ease.QuadInOut,
				"Cube.In": Ease.cubicIn,
				"Cube.Out": Ease.cubicOut,
				"Cube.InOut": Ease.cubicInOut,
				"Quart.In": Ease.quartIn,
				"Quart.Out": Ease.quartOut,
				"Quart.InOut": Ease.quartInOut,
				"Quint.In": Ease.quintIn,
				"Quint.Out": Ease.quintOut,
				"Quint.InOut": Ease.quintInOut,
				"Sine.In": Ease.sineIn,
				"Sine.Out": Ease.sineOut,
				"Sine.InOut": Ease.sineInOut,
				"Bounce.In": Ease.bounceIn,
				"Bounce.Out": Ease.bounceOut,
				"Bounce.InOut": Ease.bounceInOut,
				"Circ.In": Ease.circIn,
				"Circ.Out": Ease.circOut,
				"Circ.InOut": Ease.circInOut,
				"Expo.In": Ease.quartIn,
				"Expo.Out": Ease.quartOut,
				"Expo.InOut": Ease.quartInOut,
				"Back.In": Ease.backIn,
				"Back.Out": Ease.backOut,
				"Back.InOut": Ease.backInOut
			};
		
		public static function parseEaseType(value: String): Function {
			var ret: Function = EaseMap[value];
			if (!ret)
				ret = Ease.quartOut;
			return ret;
		}
    }
}