namespace fgui {
    type PackageDependency = { id: string, name: string; };

    export class UIPackage {
        private _id: string;
        private _name: string;
        private _items: PackageItem[];
        private _itemsById: { [index: string]: PackageItem; };
        private _itemsByName: { [index: string]: PackageItem; };
        private _resKey: string;
        private _customId: string;
        private _sprites: Object;
        private _dependencies: Array<PackageDependency>;
        private _branches: Array<string>;
        public _branchIndex: number;

        public static _constructing: number = 0;

        private static _instById: { [index: string]: UIPackage; } = {};
        private static _instByName: { [index: string]: UIPackage; } = {};
        private static _branch: string = "";
        private static _vars: { [index: string]: string; } = {};
        private static preloadingList ={};
        constructor() {
            this._items = [];
            this._itemsById = {};
            this._itemsByName = {};
            this._sprites = {};
            this._dependencies = [];
            this._branches = [];
            this._branchIndex = -1;
        }

        public static get branch(): string {
            return UIPackage._branch;
        }

        public static set branch(value: string) {
            UIPackage._branch = value;
            for (var pkgId in UIPackage._instById) {
                var pkg: UIPackage = UIPackage._instById[pkgId];
                if (pkg._branches) {
                    pkg._branchIndex = pkg._branches.indexOf(value);
                }
            }
        }

        public static getVar(key: string): string {
            return UIPackage._vars[key];
        }

        public static setVar(key: string, value: string) {
            UIPackage._vars[key] = value;
        }

        public static getById(id: string): UIPackage {
            return UIPackage._instById[id];
        }

        public static getByName(name: string): UIPackage {
            return UIPackage._instByName[name];
        }

        public static addPackage(resKey: string, descData?: ArrayBuffer): UIPackage {
            if (!descData) {
                descData = AssetProxy.inst.getRes(resKey + "." + UIConfig.packageFileExtension);
                if (!descData || descData.byteLength == 0)
                    throw new Error("resource '" + resKey + "' not found");
            }

            var buffer: ByteBuffer = new ByteBuffer(descData);

            var pkg: UIPackage = new UIPackage();
            pkg._resKey = resKey;
            pkg.loadPackage(buffer);
            UIPackage._instById[pkg.id] = pkg;
            UIPackage._instByName[pkg.name] = pkg;
            UIPackage._instById[resKey] = pkg;
            return pkg;
        }
        /**
         * @param resKey resKey 或 [resKey1,resKey2,resKey3....]
         */
        public static loadPackage(resKey: string | Array<string>, completeHandler: Laya.Handler, progressHandler?: Laya.Handler): void {
            let loadKeyArr = [];
            let keys: Array<string> = [];
            let i: number;
            if (Array.isArray(resKey)) {
                for (i = 0; i < resKey.length; i++) {
                    loadKeyArr.push({ url: resKey[i] + "." + UIConfig.packageFileExtension, type: Laya.Loader.BUFFER });
                    keys.push(resKey[i]);
                }
            }
            else {
                loadKeyArr = [{ url: resKey + "." + UIConfig.packageFileExtension, type: Laya.Loader.BUFFER }];
                keys = [resKey];
            }

            let pkgArr: Array<UIPackage> = [];
            let pkg: UIPackage;
            for (i = 0; i < loadKeyArr.length; i++) {
                pkg = UIPackage._instById[keys[i]];
                if (pkg) {
                    pkgArr.push(pkg);
                    loadKeyArr.splice(i, 1);
                    keys.splice(i, 1);
                    i--;
                }
            }
            if (loadKeyArr.length == 0) {
                completeHandler.runWith([pkgArr]);
                return;
            }
            var preloadingList= UIPackage.preloadingList
            var descCompleteHandler: Laya.Handler = Laya.Handler.create(this, function () {
                let pkg: UIPackage;
                let urls = [];
                for (i = 0; i < loadKeyArr.length; i++) {
                    let asset = AssetProxy.inst.getRes(loadKeyArr[i].url);
                    if (asset) {
                        if(preloadingList[keys[i]]){
                            pkg =preloadingList[keys[i]];
                            // continue;
                        }else{
                            pkg =preloadingList[keys[i]] = new UIPackage();
                            pkg._resKey = keys[i];
                            pkg.loadPackage(new fgui.ByteBuffer(asset));
                        }
                        let cnt: number = pkg._items.length;
                        for (let j: number = 0; j < cnt; j++) {
                            let pi: PackageItem = pkg._items[j];
                            if (pi.type == PackageItemType.Atlas) {
                                urls.push({ url: pi.file, type: Laya.Loader.IMAGE });
                            }
                            else if (pi.type == PackageItemType.Sound) {
                                urls.push({ url: pi.file, type: Laya.Loader.SOUND });
                            }
                        }
                    }
                }
                if (urls.length > 0) {
                    AssetProxy.inst.load(urls, Laya.Handler.create(this, function (): void {
                        for (i = 0; i < pkgArr.length; i++) {
                            pkg = pkgArr[i];
                            if (!UIPackage._instById[pkg.id]) {
                                UIPackage._instById[pkg.id] = pkg;
                                UIPackage._instByName[pkg.name] = pkg;
                                UIPackage._instById[pkg._resKey] = pkg;
                                preloadingList[pkg._resKey] =null;
                            }
                        }
                        completeHandler.runWith([pkgArr]);
                    }, null, true), progressHandler);
                }
                else {
                    for (i = 0; i < pkgArr.length; i++) {
                        pkg = pkgArr[i];
                        if (!UIPackage._instById[pkg.id]) {
                            UIPackage._instById[pkg.id] = pkg;
                            UIPackage._instByName[pkg.name] = pkg;
                            UIPackage._instById[pkg._resKey] = pkg;
                            preloadingList[pkg._resKey] =null;
                        }
                    }
                    completeHandler.runWith([pkgArr]);
                }
            }, null, true);

            AssetProxy.inst.load(loadKeyArr, descCompleteHandler, null, Laya.Loader.BUFFER);
        }

        public static removePackage(packageIdOrName: string): void {
            var pkg: UIPackage = UIPackage._instById[packageIdOrName];
            if (!pkg)
                pkg = UIPackage._instByName[packageIdOrName];
            if (!pkg)
                throw new Error("unknown package: " + packageIdOrName);

            pkg.dispose();
            delete UIPackage._instById[pkg.id];
            delete UIPackage._instByName[pkg.name];
            delete UIPackage._instById[pkg._resKey];
            if (pkg._customId)
                delete UIPackage._instById[pkg._customId];
        }

        public static createObject(pkgName: string, resName: string, userClass?: new () => GObject): GObject {
            var pkg: UIPackage = UIPackage.getByName(pkgName);
            if (pkg)
                return pkg.createObject(resName, userClass);
            else
                return null;
        }

        public static createObjectFromURL(url: string, userClass?: new () => GObject): GObject {
            var pi: PackageItem = UIPackage.getItemByURL(url);
            if (pi)
                return pi.owner.internalCreateObject(pi, userClass);
            else
                return null;
        }

        public static getItemURL(pkgName: string, resName: string): string {
            var pkg: UIPackage = UIPackage.getByName(pkgName);
            if (!pkg)
                return null;

            var pi: PackageItem = pkg._itemsByName[resName];
            if (!pi)
                return null;

            return "ui://" + pkg.id + pi.id;
        }

        public static getItemByURL(url: string): PackageItem {
            var pos1: number = url.indexOf("//");
            if (pos1 == -1)
                return null;

            var pos2: number = url.indexOf("/", pos1 + 2);
            if (pos2 == -1) {
                if (url.length > 13) {
                    var pkgId: string = url.substr(5, 8);
                    var pkg: UIPackage = UIPackage.getById(pkgId);
                    if (pkg) {
                        var srcId: string = url.substr(13);
                        return pkg.getItemById(srcId);
                    }
                }
            }
            else {
                var pkgName: string = url.substr(pos1 + 2, pos2 - pos1 - 2);
                pkg = UIPackage.getByName(pkgName);
                if (pkg) {
                    var srcName: string = url.substr(pos2 + 1);
                    return pkg.getItemByName(srcName);
                }
            }

            return null;
        }

        public static getItemAssetByURL(url: string): Object {
            var item: PackageItem = UIPackage.getItemByURL(url);
            if (item == null)
                return null;

            return item.owner.getItemAsset(item);
        }

        public static normalizeURL(url: string): string {
            if (url == null)
                return null;

            var pos1: number = url.indexOf("//");
            if (pos1 == -1)
                return null;

            var pos2: number = url.indexOf("/", pos1 + 2);
            if (pos2 == -1)
                return url;

            var pkgName: string = url.substr(pos1 + 2, pos2 - pos1 - 2);
            var srcName: string = url.substr(pos2 + 1);
            return UIPackage.getItemURL(pkgName, srcName);
        }

        public static setStringsSource(source: string): void {
            TranslationHelper.loadFromXML(source);
        }

        private loadPackage(buffer: ByteBuffer): void {
            if (buffer.getUint32() != 0x46475549)
                throw new Error("FairyGUI: old package format found in '" + this._resKey + "'");

            buffer.version = buffer.getInt32();
            var compressed: boolean = buffer.readBool();
            this._id = buffer.readUTFString();
            this._name = buffer.readUTFString();
            buffer.skip(20);

            if (compressed) {
                var buf: Uint8Array = new Uint8Array(buffer.buffer, buffer.pos, buffer.length - buffer.pos);
                var inflater = new Zlib.RawInflate(buf);
                buf = inflater.decompress();

                let buffer2: ByteBuffer = new ByteBuffer(buf);
                buffer2.version = buffer.version;
                buffer = buffer2;
            }

            var ver2: boolean = buffer.version >= 2;
            var indexTablePos: number = buffer.pos;
            var cnt: number;
            var i: number;
            var j: number;
            var nextPos: number;
            var str: string;
            var branchIncluded: boolean;

            buffer.seek(indexTablePos, 4);

            cnt = buffer.getInt32();
            var stringTable: string[] = [];
            for (i = 0; i < cnt; i++)
                stringTable[i] = buffer.readUTFString();
            buffer.stringTable = stringTable;

            buffer.seek(indexTablePos, 0);
            cnt = buffer.getInt16();
            for (i = 0; i < cnt; i++)
                this._dependencies.push({ id: buffer.readS(), name: buffer.readS() });

            if (ver2) {
                cnt = buffer.getInt16();
                if (cnt > 0) {
                    this._branches = buffer.readSArray(cnt);
                    if (UIPackage._branch)
                        this._branchIndex = this._branches.indexOf(UIPackage._branch);
                }

                branchIncluded = cnt > 0;
            }

            buffer.seek(indexTablePos, 1);

            var pi: PackageItem;
            var path: string = this._resKey;
            let pos = path.lastIndexOf('/');
            let shortPath = pos == -1 ? "" : path.substr(0, pos + 1);
            path = path + "_";

            cnt = buffer.getUint16();
            for (i = 0; i < cnt; i++) {
                nextPos = buffer.getInt32();
                nextPos += buffer.pos;

                pi = new PackageItem();
                pi.owner = this;
                pi.type = buffer.readByte();
                pi.id = buffer.readS();
                pi.name = buffer.readS();
                buffer.readS(); //path
                str = buffer.readS();
                if (str)
                    pi.file = str;
                buffer.readBool();//exported
                pi.width = buffer.getInt32();
                pi.height = buffer.getInt32();

                switch (pi.type) {
                    case PackageItemType.Image:
                        {
                            pi.objectType = ObjectType.Image;
                            var scaleOption: number = buffer.readByte();
                            if (scaleOption == 1) {
                                pi.scale9Grid = new Laya.Rectangle();
                                pi.scale9Grid.x = buffer.getInt32();
                                pi.scale9Grid.y = buffer.getInt32();
                                pi.scale9Grid.width = buffer.getInt32();
                                pi.scale9Grid.height = buffer.getInt32();

                                pi.tileGridIndice = buffer.getInt32();
                            }
                            else if (scaleOption == 2)
                                pi.scaleByTile = true;

                            pi.smoothing = buffer.readBool();
                            break;
                        }

                    case PackageItemType.MovieClip:
                        {
                            pi.smoothing = buffer.readBool();
                            pi.objectType = ObjectType.MovieClip;
                            pi.rawData = buffer.readBuffer();
                            break;
                        }

                    case PackageItemType.Font:
                        {
                            pi.rawData = buffer.readBuffer();
                            break;
                        }

                    case PackageItemType.Component:
                        {
                            var extension: number = buffer.readByte();
                            if (extension > 0)
                                pi.objectType = extension;
                            else
                                pi.objectType = ObjectType.Component;
                            pi.rawData = buffer.readBuffer();

                            UIObjectFactory.resolvePackageItemExtension(pi);
                            break;
                        }

                    case PackageItemType.Atlas:
                    case PackageItemType.Sound:
                    case PackageItemType.Misc:
                        {
                            pi.file = path + pi.file;
                            break;
                        }

                    case PackageItemType.Spine:
                    case PackageItemType.DragonBones:
                        {
                            pi.file = shortPath + pi.file;
                            pi.skeletonAnchor = new Laya.Point();
                            pi.skeletonAnchor.x = buffer.getFloat32();
                            pi.skeletonAnchor.y = buffer.getFloat32();
                            break;
                        }
                }

                if (ver2) {
                    str = buffer.readS();//branch
                    if (str)
                        pi.name = str + "/" + pi.name;

                    var branchCnt: number = buffer.getUint8();
                    if (branchCnt > 0) {
                        if (branchIncluded)
                            pi.branches = buffer.readSArray(branchCnt);
                        else
                            this._itemsById[buffer.readS()] = pi;
                    }

                    var highResCnt: number = buffer.getUint8();
                    if (highResCnt > 0)
                        pi.highResolution = buffer.readSArray(highResCnt);
                }

                this._items.push(pi);
                this._itemsById[pi.id] = pi;
                if (pi.name != null)
                    this._itemsByName[pi.name] = pi;

                buffer.pos = nextPos;
            }

            buffer.seek(indexTablePos, 2);

            cnt = buffer.getUint16();
            for (i = 0; i < cnt; i++) {
                nextPos = buffer.getUint16();
                nextPos += buffer.pos;

                var itemId: string = buffer.readS();
                pi = this._itemsById[buffer.readS()];

                let sprite: AtlasSprite = { atlas: pi, rect: new Laya.Rectangle(), offset: new Laya.Point(), originalSize: new Laya.Point() };
                sprite.atlas = pi;
                sprite.rect.x = buffer.getInt32();
                sprite.rect.y = buffer.getInt32();
                sprite.rect.width = buffer.getInt32();
                sprite.rect.height = buffer.getInt32();
                sprite.rotated = buffer.readBool();
                if (ver2 && buffer.readBool()) {
                    sprite.offset.x = buffer.getInt32();
                    sprite.offset.y = buffer.getInt32();
                    sprite.originalSize.x = buffer.getInt32();
                    sprite.originalSize.y = buffer.getInt32();
                }
                else {
                    sprite.originalSize.x = sprite.rect.width;
                    sprite.originalSize.y = sprite.rect.height;
                }
                this._sprites[itemId] = sprite;

                buffer.pos = nextPos;
            }

            if (buffer.seek(indexTablePos, 3)) {
                cnt = buffer.getUint16();
                for (i = 0; i < cnt; i++) {
                    nextPos = buffer.getInt32();
                    nextPos += buffer.pos;

                    pi = this._itemsById[buffer.readS()];
                    if (pi && pi.type == PackageItemType.Image) {
                        pi.pixelHitTestData = new PixelHitTestData();
                        pi.pixelHitTestData.load(buffer);
                    }

                    buffer.pos = nextPos;
                }
            }
        }

        public loadAllAssets(): void {
            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var pi: PackageItem = this._items[i];
                this.getItemAsset(pi);
            }
        }

        public unloadAssets(): void {
            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var pi: PackageItem = this._items[i];
                if (pi.type == PackageItemType.Atlas) {
                    if (pi.texture)
                        Laya.loader.clearTextureRes(pi.texture.url);
                }
            }
        }

        public dispose(): void {
            var cnt: number = this._items.length;
            for (var i: number = 0; i < cnt; i++) {
                var pi: PackageItem = this._items[i];
                if (pi.type == PackageItemType.Atlas) {
                    if (pi.texture) {
                        pi.texture.destroy();
                        pi.texture = null;
                    }
                }
                else if (pi.type == PackageItemType.Sound) {
                    Laya.SoundManager.destroySound(pi.file);
                }
                else if (pi.templet)
                    pi.templet.destroy();
            }
        }

        public get id(): string {
            return this._id;
        }

        public get name(): string {
            return this._name;
        }

        public get customId(): string {
            return this._customId;
        }

        public set customId(value: string) {
            if (this._customId)
                delete UIPackage._instById[this._customId];
            this._customId = value;
            if (this._customId)
                UIPackage._instById[this._customId] = this;
        }

        public createObject(resName: string, userClass?: new () => GObject): GObject {
            var pi: PackageItem = this._itemsByName[resName];
            if (pi)
                return this.internalCreateObject(pi, userClass);
            else
                return null;
        }

        public internalCreateObject(item: PackageItem, userClass?: new () => GObject): GObject {
            var g: GObject = UIObjectFactory.newObject(item, userClass);

            if (g == null)
                return null;

            UIPackage._constructing++;
            g.constructFromResource();
            UIPackage._constructing--;
            return g;
        }

        public getItems(): PackageItem[] {
            return this._items;
        }

        public getItemById(itemId: string): PackageItem {
            return this._itemsById[itemId];
        }

        public getItemByName(resName: string): PackageItem {
            return this._itemsByName[resName];
        }

        public getItemAssetByName(resName: string): Object {
            var pi: PackageItem = this._itemsByName[resName];
            if (pi == null) {
                throw "Resource not found -" + resName;
            }

            return this.getItemAsset(pi);
        }

        public getItemAsset(item: PackageItem): Object {
            switch (item.type) {
                case PackageItemType.Image:
                    if (!item.decoded) {
                        item.decoded = true;
                        var sprite: AtlasSprite = this._sprites[item.id];
                        if (sprite) {
                            var atlasTexture: Laya.Texture = <Laya.Texture>(this.getItemAsset(sprite.atlas));
                            if (atlasTexture) {
                                item.texture = Laya.Texture.create(atlasTexture,
                                    sprite.rect.x, sprite.rect.y, sprite.rect.width, sprite.rect.height,
                                    sprite.offset.x, sprite.offset.y,
                                    sprite.originalSize.x, sprite.originalSize.y);
                            } else {
                                item.texture = null;
                            }
                        }
                        else
                            item.texture = null;
                    }
                    return item.texture;

                case PackageItemType.Atlas:
                    if (!item.decoded) {
                        item.decoded = true;
                        item.texture = AssetProxy.inst.getItemRes(item);
                        //if(!fgui.UIConfig.textureLinearSampling)
                        //item.texture.isLinearSampling = false;
                    }
                    return item.texture;

                case PackageItemType.Font:
                    if (!item.decoded) {
                        item.decoded = true;
                        this.loadFont(item);
                    }
                    return item.bitmapFont;

                case PackageItemType.MovieClip:
                    if (!item.decoded) {
                        item.decoded = true;
                        this.loadMovieClip(item);
                    }
                    return item.frames;

                case PackageItemType.Component:
                    return item.rawData;

                case PackageItemType.Misc:
                    if (item.file)
                        return AssetProxy.inst.getItemRes(item);
                    else
                        return null;

                default:
                    return null;
            }
        }

        public getItemAssetAsync(item: PackageItem, onComplete?: (err: any, item: PackageItem) => void): void {
            if (item.decoded) {
                onComplete(null, item);
                return;
            }

            if (item.loading) {
                item.loading.push(onComplete);
                return;
            }

            switch (item.type) {
                case PackageItemType.Spine:
                case PackageItemType.DragonBones:
                    item.loading = [onComplete];
                    item.templet = new Laya.Templet();
                    item.templet.on(Laya.Event.COMPLETE, this, () => {
                        let arr = item.loading;
                        delete item.loading;
                        arr.forEach(e => e(null, item));
                    });
                    item.templet.on(Laya.Event.ERROR, this, () => {
                        let arr = item.loading;
                        delete item.loading;
                        delete item.templet;
                        arr.forEach(e => e('parse error', item));
                    });
                    let pos = item.file.lastIndexOf('.');
                    let str = item.file.substring(0, pos + 1).replace("_ske", "") + "sk";
                    item.templet.loadAni(str);
                    break;

                default:
                    this.getItemAsset(item);
                    onComplete(null, item);
                    break;
            }
        }

        private loadMovieClip(item: PackageItem): void {
            var buffer: ByteBuffer = item.rawData;

            buffer.seek(0, 0);

            item.interval = buffer.getInt32();
            item.swing = buffer.readBool();
            item.repeatDelay = buffer.getInt32();

            buffer.seek(0, 1);

            var frameCount: number = buffer.getInt16();
            item.frames = [];

            var spriteId: string;
            var sprite: AtlasSprite;
            var fx: number;
            var fy: number;

            for (var i: number = 0; i < frameCount; i++) {
                var nextPos: number = buffer.getInt16();
                nextPos += buffer.pos;

                fx = buffer.getInt32();
                fy = buffer.getInt32();
                buffer.getInt32(); //width
                buffer.getInt32(); //height
                let frame: Frame = { addDelay: buffer.getInt32() };
                spriteId = buffer.readS();

                if (spriteId != null && (sprite = this._sprites[spriteId]) != null) {
                    var atlasTexture: Laya.Texture = <Laya.Texture>(this.getItemAsset(sprite.atlas));
                    frame.texture = Laya.Texture.create(atlasTexture,
                        sprite.rect.x, sprite.rect.y, sprite.rect.width, sprite.rect.height,
                        fx, fy, item.width, item.height);
                }
                item.frames[i] = frame;

                buffer.pos = nextPos;
            }
        }

        private loadFont(item: PackageItem): void {
            item = item.getBranch();
            var font: BitmapFont = new BitmapFont();
            item.bitmapFont = font;
            var buffer: ByteBuffer = item.rawData;

            buffer.seek(0, 0);

            font.ttf = buffer.readBool();
            font.tint = buffer.readBool();
            font.resizable = buffer.readBool();
            buffer.readBool(); //has channel
            font.size = buffer.getInt32();
            var xadvance: number = buffer.getInt32();
            var lineHeight: number = buffer.getInt32();

            var mainTexture: Laya.Texture = null;
            var mainSprite: AtlasSprite = this._sprites[item.id];
            if (mainSprite)
                mainTexture = <Laya.Texture>(this.getItemAsset(mainSprite.atlas));

            buffer.seek(0, 1);

            var bg: BMGlyph = null;
            var cnt: number = buffer.getInt32();
            for (var i: number = 0; i < cnt; i++) {
                var nextPos: number = buffer.getInt16();
                nextPos += buffer.pos;

                bg = {};
                var ch: string = buffer.readChar();
                font.glyphs[ch] = bg;

                var img: string = buffer.readS();
                var bx: number = buffer.getInt32();
                var by: number = buffer.getInt32();
                bg.x = buffer.getInt32();
                bg.y = buffer.getInt32();
                bg.width = buffer.getInt32();
                bg.height = buffer.getInt32();
                bg.advance = buffer.getInt32();
                bg.channel = buffer.readByte();
                if (bg.channel == 1)
                    bg.channel = 3;
                else if (bg.channel == 2)
                    bg.channel = 2;
                else if (bg.channel == 3)
                    bg.channel = 1;

                if (font.ttf) {
                    bg.texture = Laya.Texture.create(mainTexture,
                        bx + mainSprite.rect.x, by + mainSprite.rect.y, bg.width, bg.height);

                    bg.lineHeight = lineHeight;
                }
                else {
                    var charImg: PackageItem = this._itemsById[img];
                    if (charImg) {
                        charImg = charImg.getBranch();
                        bg.width = charImg.width;
                        bg.height = charImg.height;
                        charImg = charImg.getHighResolution();
                        this.getItemAsset(charImg);
                        bg.texture = charImg.texture;
                    }

                    if (bg.advance == 0) {
                        if (xadvance == 0)
                            bg.advance = bg.x + bg.width;
                        else
                            bg.advance = xadvance;
                    }

                    bg.lineHeight = bg.y < 0 ? bg.height : (bg.y + bg.height);
                    if (bg.lineHeight < font.size)
                        bg.lineHeight = font.size;
                }

                buffer.pos = nextPos;
            }
        }
    }

    interface AtlasSprite {
        atlas: PackageItem;
        rect: Laya.Rectangle;
        offset: Laya.Point;
        originalSize: Laya.Point;
        rotated?: boolean;
    }
}
