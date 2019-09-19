namespace fgui {
    export class BitmapFont {
        public id: string;
        public size: number = 0;
        public ttf: boolean;
        public glyphs: Object;
        public resizable: boolean;

        constructor() {
            this.glyphs = {};
        }
    }

    export class BMGlyph {
        public offsetX: number = 0;
        public offsetY: number = 0;
        public width: number = 0;
        public height: number = 0;
        public advance: number = 0;
        public lineHeight: number = 0;
        public channel: number = 0;
        public texture: Laya.Texture;

        constructor() {
        }
    }
}
