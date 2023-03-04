namespace fgui {
    export class AssetProxy {

        loader = Laya.loader;

        private static _inst: AssetProxy;

        public static get inst(): AssetProxy {
            if (!AssetProxy._inst)
                AssetProxy._inst = new AssetProxy();
            return AssetProxy._inst;
        }

        public getRes(url: string, type?: string): any {
            return this.loader.getRes(url, type);
        }

        getItemRes(item: PackageItem) {
            return this.getRes(item.file);
        }

        public load(url: string | Laya.ILoadURL | (string | Readonly<Laya.ILoadURL>)[], type?: string, onProgress?: Laya.ProgressCallback): Promise<any> {
            return this.loader.load(url, type, onProgress);
        }
    }
}
