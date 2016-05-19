package fairygui.utils {

    public class UBBParser {
        private var _text: String;
        private var _readPos: Number = 0;

        protected var _handlers: Object;

        public var smallFontSize: Number = 12;
        public var normalFontSize: Number = 14;
        public var largeFontSize: Number = 16;

        public var defaultImgWidth: Number = 0;
        public var defaultImgHeight: Number = 0;

        public static var inst: UBBParser = new UBBParser();

        public function UBBParser() {
            this._handlers = {};
            this._handlers["url"] = this.onTag_URL;
            this._handlers["img"] = this.onTag_IMG;
            this._handlers["b"] = this.onTag_Simple;
            this._handlers["i"] = this.onTag_Simple;
            this._handlers["u"] = this.onTag_Simple;
            this._handlers["sup"] = this.onTag_Simple;
            this._handlers["sub"] = this.onTag_Simple;
            this._handlers["color"] = this.onTag_COLOR;
            this._handlers["font"] = this.onTag_FONT;
            this._handlers["size"] = this.onTag_SIZE;
        }

        protected function onTag_URL(tagName: String, end: Boolean, attr: String): String {
            if (!end) {
                if (attr != null)
                    return "<a href=\"" + attr + "\" target=\"_blank\">";
                else {
                    var href: String = this.getTagText();
                    return "<a href=\"" + href + "\" target=\"_blank\">";
                }
            }
            else
                return "</a>";
        }

        protected function onTag_IMG(tagName: String, end: Boolean, attr: String): String {
            if (!end) {
                var src: String = this.getTagText(true);
                if (!src)
                    return null;

                if (this.defaultImgWidth)
                    return "<img src=\"" + src + "\" width=\"" + this.defaultImgWidth + "\" height=\"" + this.defaultImgHeight + "\"/>";
                else
                    return "<img src=\"" + src + "\"/>";
            }
            else
                return null;
        }

        protected function onTag_Simple(tagName: String, end: Boolean, attr: String): String {
            return end ? ("</" + tagName + ">") : ("<" + tagName + ">");
        }

        protected function onTag_COLOR(tagName: String, end: Boolean, attr: String): String {
            if (!end)
                return "<font color=\"" + attr + "\">";
            else
                return "</font>";
        }

        protected function onTag_FONT(tagName: String, end: Boolean, attr: String): String {
            if (!end)
                return "<font face=\"" + attr + "\">";
            else
                return "</font>";
        }

        protected function onTag_SIZE(tagName: String, end: Boolean, attr: String): String {
            if (!end) {
                if (attr == "normal")
                    attr = "" + this.normalFontSize;
                else if (attr == "small")
                    attr = "" + this.smallFontSize;
                else if (attr == "large")
                    attr = "" + this.largeFontSize;
                else if (attr.length && attr.charAt(0) == "+")
                    attr = "" + (this.smallFontSize + parseInt(attr.substr(1)));
                else if (attr.length && attr.charAt(0) == "-")
                    attr = "" + (this.smallFontSize - parseInt(attr.substr(1)));
                return "<font size=\"" + attr + "\">";
            }
            else
                return "</font>";
        }

        protected function getTagText(remove: Boolean= false): String {
            var pos: Number = this._text.indexOf("[", this._readPos);
            if (pos == -1)
                return null;

            var ret: String = this._text.substring(this._readPos, pos);
            if (remove)
                this._readPos = pos;
            return ret;
        }

        public function parse(text: String, remove:Boolean=false): String {
            this._text = text;
            var pos1: Number = 0, pos2: Number, pos3: Number = 0;
            var end: Boolean;
            var tag: String, attr: String;
            var repl: String;
            var func: Function;
            while ((pos2 = this._text.indexOf("[", pos1)) != -1) {
                pos1 = pos2;
                pos2 = this._text.indexOf("]", pos1);
                if (pos2 == -1)
                    break;

                end = this._text.charAt(pos1 + 1) == '/';
                tag = this._text.substring(end ? pos1 + 2 : pos1 + 1, pos2);
                pos2++;
                this._readPos = pos2;
                attr = null;
                repl = null;
                pos3 = tag.indexOf("=");
                if (pos3 != -1) {
                    attr = tag.substring(pos3 + 1);
                    tag = tag.substring(0, pos3);
                }
                tag = tag.toLowerCase();
                func = this._handlers[tag];
                if (func != null) {
                    if(!remove) {
                        repl = func.call(this, tag, end, attr);
                        if (repl == null)
                            repl = "";
                    }
                    else
                        repl = "";
                }
                else {
                    pos1 = pos2;
                    continue;
                }
                this._text = this._text.substring(0, pos1) + repl + this._text.substring(this._readPos);
            }
            return this._text;
        }
    }
}