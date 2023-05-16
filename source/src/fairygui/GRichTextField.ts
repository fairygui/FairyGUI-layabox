///<reference path="GTextField.ts"/>

namespace fgui {
    export class GRichTextField extends GTextField {

        constructor() {
            super();

            this._displayObject.html = true;
            this._displayObject.mouseEnabled = true;
        }
    }

    export class GHtmlImage extends Laya.HtmlImage {
        protected loadTexture(src: string): void {
            if (src.startsWith("ui://")) {
                let tex = UIPackage.getItemAssetByURL(src);
                if (tex instanceof Laya.Texture) {
                    this.obj.width = tex.sourceWidth;
                    this.obj.height = tex.sourceHeight;
                    this.obj.texture = tex;
                }
            }
            else
                super.loadTexture(src);
        }
    }

    Laya.HtmlParser.classMap[Laya.HtmlElementType.Image] = GHtmlImage;
}

