namespace fgui {
    export class AssetProxy {

        private _asset: any;

        constructor() {
            this._asset = Laya.loader;
        }

        private static _inst: AssetProxy;

        public static get inst(): AssetProxy {
            if (!AssetProxy._inst)
                AssetProxy._inst = new AssetProxy();
            return AssetProxy._inst;
        }

        public getRes(url: string): any {
            return this._asset.getRes(url);
        }

        public load(url: any, complete?: Laya.Handler, progress?: Laya.Handler, type?: string, priority?: number, cache?: boolean): void {
            this._asset.load(url, complete, progress, type, priority, cache);
        }

        public setAsset(asset: any): void {
            this._asset = asset;
        }
    }
}