namespace fgui {
    export class BitmapFont {
        public id: string;
        public size: number = 0;
        public ttf?: boolean;
        public glyphs: { [index: string]: BMGlyph };
        public resizable?: boolean;
        public tint?: boolean;

        constructor() {
            this.glyphs = {};
        }
    }

    export interface BMGlyph {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        advance?: number;
        lineHeight?: number;
        channel?: number;
        texture?: Laya.Texture;
    }
}
