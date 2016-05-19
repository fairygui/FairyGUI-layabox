
package fairygui.display {

    public class BitmapFont {
        public var id: String;
        public var size: Number = 0;
        public var ttf: Boolean;
        public var glyphs: Object;
        public var resizable: Boolean;

        public function BitmapFont() {
            this.glyphs = {};
        }
    }
}