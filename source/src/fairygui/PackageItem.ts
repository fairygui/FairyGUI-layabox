namespace fgui {
    export class PackageItem {
        public owner: UIPackage;

        public type: number;
        public objectType: number;

        public id: string;
        public name: string;
        public width: number = 0;
        public height: number = 0;
        public file: string;
        public decoded: boolean;
        public rawData: ByteBuffer;

        public highResolution: Array<string>;
        public branches: Array<string>;

        //image
        public scale9Grid: Laya.Rectangle;
        public scaleByTile: boolean;
        public tileGridIndice: number = 0;
        public smoothing: boolean;
        public texture: Laya.Texture;
        public pixelHitTestData: PixelHitTestData;

        //movieclip
        public interval: number = 0;
        public repeatDelay: number = 0;
        public swing: boolean;
        public frames: Frame[];

        //componenet
        public extensionType: any;

        //font 
        public bitmapFont: BitmapFont;

        constructor() {
        }

        public load(): Object {
            return this.owner.getItemAsset(this);
        }

        public getBranch(): PackageItem {
            if (this.branches && this.owner._branchIndex != -1) {
                var itemId: string = this.branches[this.owner._branchIndex];
                if (itemId)
                    return this.owner.getItemById(itemId);
            }

            return this;
        }

        public getHighResolution(): PackageItem {
            if (this.highResolution && GRoot.contentScaleLevel > 0) {
                var itemId: string = this.highResolution[GRoot.contentScaleLevel - 1];
                if (itemId)
                    return this.owner.getItemById(itemId);
            }

            return this;
        }

        public toString(): string {
            return this.name;
        }
    }
}