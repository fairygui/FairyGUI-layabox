namespace fgui {
    export class BitmapFont {
        public id: string;
        public size: number = 0;
        public ttf: boolean;
        public glyphs: Object;
        public resizable: boolean;
        public tint: boolean;

        constructor() {
            this.glyphs = {};
        }
    }

    export class BMGlyph {
        public x: number = 0;
        public y: number = 0;
        public width: number = 0;
        public height: number = 0;
        public advance: number = 0;
        public lineHeight: number = 0;
        public channel: number = 0;
        public texture: Laya.Texture;
    }
}
