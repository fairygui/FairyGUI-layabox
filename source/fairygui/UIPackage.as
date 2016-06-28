
package fairygui {
	import fairygui.display.BMGlyph;
	import fairygui.display.BitmapFont;
	import fairygui.display.Frame;
	import fairygui.utils.ToolSet;
	
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	import laya.utils.Byte;
	import laya.utils.Utils;

    public class UIPackage {
        private var _id: String;
        private var _name: String;
        private var _basePath: String;
        private var _items: Vector.<PackageItem>;
        private var _itemsById: Object;
        private var _itemsByName: Object;
        private var _resKey: String;
        private var _resData: Object;
        private var _customId: String;
        private var _sprites: Object;
        
        //internal
        public static var _constructing: Number = 0;

        private static var _packageInstById: Object = {};
        private static var _packageInstByName: Object = {};
        private static var _bitmapFonts: Object = {};

        private static const sep0: String = ",";
        private static const sep1: String = "\n";
        private static const sep2: String = " ";
        private static const sep3: String = "=";

        public function UIPackage() {
            this._items = new Vector.<PackageItem>();
            this._sprites = {};
        }

        public static function getById(id: String): UIPackage {
            return UIPackage._packageInstById[id];
        }

        public static function getByName(name: String): UIPackage {
            return UIPackage._packageInstByName[name];
        }

        public static function addPackage(resKey: String): UIPackage {
            var pkg: UIPackage = new UIPackage();
            pkg.create(resKey);
            UIPackage._packageInstById[pkg.id] = pkg;
            UIPackage._packageInstByName[pkg.name] = pkg;
            pkg.customId = resKey;
            return pkg;
        }

        public static function removePackage(packageId: String): void {
            var pkg: UIPackage = UIPackage._packageInstById[packageId];
            pkg.dispose();
            delete UIPackage._packageInstById[pkg.id];
            if(pkg._customId != null)
                delete UIPackage._packageInstById[pkg._customId];
            delete UIPackage._packageInstByName[pkg.name];
        }

        public static function createObject(pkgName: String,resName: String,userClass:Object = null): GObject {
            var pkg: UIPackage = UIPackage.getByName(pkgName);
            if(pkg)
                return pkg.createObject(resName,userClass);
            else
                return null;
        }

        public static function createObjectFromURL(url: String,userClass:Object = null): GObject {
            var pi: PackageItem = UIPackage.getItemByURL(url);
            if(pi)
                return pi.owner.createObject2(pi,userClass);
            else
                return null;
        }

        public static function getItemURL(pkgName: String,resName: String): String {
            var pkg: UIPackage = UIPackage.getByName(pkgName);
            if(!pkg)
                return null;

            var pi: PackageItem = pkg._itemsByName[resName];
            if(!pi)
                return null;

            return "ui://" + pkg.id + pi.id;
        }

        public static function getItemByURL(url: String): PackageItem {
            if(ToolSet.startsWith(url,"ui://")) {
                var pkgId: String = url.substr(5,8);
                var srcId: String = url.substr(13);
                var pkg: UIPackage = UIPackage.getById(pkgId);
                if(pkg)
                    return pkg.getItem(srcId);
            }
            return null;
        }

        public static function getBitmapFontByURL(url: String): BitmapFont {
            return UIPackage._bitmapFonts[url];
        }

        private function create(resKey: String): void {
            this._resKey = resKey;

            this.loadPackage();
        }

        private function loadPackage(): void {
            var str: String;
            var arr: Array;

            this.decompressPackage(Laya.loader.getRes(this._resKey+".fui"));

            str = this.getDesc("sprites.bytes");

            arr = str.split(UIPackage.sep1);
            var cnt: Number = arr.length;
            for(var i: Number = 1;i < cnt;i++) {
                str = arr[i];
                if(!str)
                    continue;

                var arr2: Array = str.split(UIPackage.sep2);

                var sprite: AtlasSprite = new AtlasSprite();
                var itemId: String = arr2[0];
                var binIndex: Number = parseInt(arr2[1]);
                if(binIndex >= 0)
                    sprite.atlas = "atlas" + binIndex;
                else {
                    var pos: Number = itemId.indexOf("_");
                    if(pos == -1)
                        sprite.atlas = "atlas_" + itemId;
                    else
                        sprite.atlas = "atlas_" + itemId.substr(0,pos);
                }

                sprite.rect.x = parseInt(arr2[2]);
                sprite.rect.y = parseInt(arr2[3]);
                sprite.rect.width = parseInt(arr2[4]);
                sprite.rect.height = parseInt(arr2[5]);
                sprite.rotated = arr2[6] == "1";
                this._sprites[itemId] = sprite;
            }

            str = this.getDesc("package.xml");
            var xml:Object = Utils.parseXMLFromString(str);

            var rootNode:Object = xml.firstChild;
            this._id = rootNode.getAttribute("id");
            this._name = rootNode.getAttribute("name");

            var resources: Array =  ToolSet.findChildNode(rootNode, "resources").childNodes;

            this._itemsById = {};
            this._itemsByName = {};
            var pi: PackageItem;
            var cxml: Object;

            var length1: Number = resources.length;
            for(var i1: Number = 0;i1 < length1;i1++) {
                cxml = resources[i1];
                if(cxml.nodeType!=1)
                    continue;

                pi = new PackageItem();
                pi.type = PackageItemType.parse(cxml.nodeName);
                pi.id = cxml.getAttribute("id");
                pi.name = cxml.getAttribute("name");
                pi.file = cxml.getAttribute("file");
                str = cxml.getAttribute("size");
                if(str) {
                    arr = str.split(UIPackage.sep0);
                    pi.width = parseInt(arr[0]);
                    pi.height = parseInt(arr[1]);
                }
                switch(pi.type) {
                    case PackageItemType.Image: {
                        str = cxml.getAttribute("scale");
                        if(str == "9grid") {
                            pi.scale9Grid = new laya.maths.Rectangle();
                            str = cxml.getAttribute("scale9grid");
                            if(str) {
                                arr = str.split(UIPackage.sep0);
                                pi.scale9Grid.x = parseInt(arr[0]);
                                pi.scale9Grid.y = parseInt(arr[1]);
                                pi.scale9Grid.width = parseInt(arr[2]);
                                pi.scale9Grid.height = parseInt(arr[3]);
                            }
                        }
                        else if(str == "tile") {
                            pi.scaleByTile = true;
                        }
                        str = cxml.getAttribute("smoothing");
                        pi.smoothing = str != "false";
                        break;
                    }
                }

                pi.owner = this;
                this._items.push(pi);
                this._itemsById[pi.id] = pi;
                if(pi.name != null)
                    this._itemsByName[pi.name] = pi;
            }

            cnt = this._items.length;
            for(i = 0;i < cnt;i++) {
                pi = this._items[i];
                if(pi.type == PackageItemType.Font) {
                    this.loadFont(pi);
                    UIPackage._bitmapFonts[pi.bitmapFont.id] = pi.bitmapFont;
                }
            }
        }

        private function decompressPackage(buf: ArrayBuffer): void {
            this._resData = {};
        
			var data: Uint8Array;
			__JS__("var inflater = new Zlib.RawInflate(buf);data = inflater.decompress();");
            var source: String = new Byte(data).readUTFBytes();
            var curr: Number = 0;            
            var fn: String;
            var size: Number;
            while(true)
            {
                var pos:Number = source.indexOf("|", curr);
                if(pos == -1)
                    break;
                fn = source.substring(curr,pos);
                curr = pos + 1;
                pos = source.indexOf("|",curr);
                size = parseInt(source.substring(curr,pos));
                curr = pos + 1;
                this._resData[fn] = source.substr(curr,size);
                curr += size;
            }            
        }

        public function dispose(): void {
            var cnt:Number=this._items.length;
            for(var i: Number = 0;i < cnt;i++) {
                var pi: PackageItem = this._items[i];
                var texture: Texture = pi.texture;
                /*if(texture != null)
                    texture.dispose();
                else if(pi.frames != null) {
                    var frameCount: Number = pi.frames.length;
                    for(var j: Number = 0;j < frameCount;j++) {
                        texture = pi.frames[j].texture;
                        if(texture != null)
                            texture.dispose();
                    }
                }*/
                if(pi.bitmapFont != null) {
                    delete UIPackage._bitmapFonts[pi.bitmapFont.id];
                }
            }
        }

        public function get id(): String {
            return this._id;
        }

        public function get name(): String {
            return this._name;
        }

        public function get customId(): String {
            return this._customId;
        }

        public function set customId(value: String):void {
            if (this._customId != null)
                delete UIPackage._packageInstById[this._customId];
            this._customId = value;
            if (this._customId != null)
                UIPackage._packageInstById[this._customId] = this;
        }

        public function createObject(resName: String, userClass: Object = null): GObject {
            var pi: PackageItem = this._itemsByName[resName];
            if (pi)
                return this.createObject2(pi, userClass);
            else
                return null;
        }

        public function createObject2(pi: PackageItem, userClass: Object = null): GObject {
            var g: GObject;
            if (pi.type == PackageItemType.Component) {
                if (userClass != null)
                    g = new userClass();
                else
                    g = UIObjectFactory.newObject(pi);
            }
            else
                g = UIObjectFactory.newObject(pi);

            if (g == null)
                return null;

            UIPackage._constructing++;
            g.constructFromResource(pi);
            UIPackage._constructing--;
            return g;
        }

        public function getItem(itemId: String): PackageItem {
            return this._itemsById[itemId];
        }

        public function getItemAssetByName(resName: String): Object {
            var pi: PackageItem = this._itemsByName[resName];
            if (pi == null) {
                throw "Resource not found -" + resName;
            }

            return this.getItemAsset(pi);
        }

        public function getItemAsset(item: PackageItem): Object {
            switch (item.type) {
                case PackageItemType.Image:
                    if (!item.decoded) {
                        item.decoded = true;
                        var sprite: AtlasSprite = this._sprites[item.id];
                        if (sprite != null)
                            item.texture = this.createSpriteTexture(sprite);
                    }
                    return item.texture;

                case PackageItemType.Atlas:
                    if (!item.decoded) {
                        item.decoded = true;
                        var fileName:String = (item.file != null && item.file.length > 0) ? item.file : (item.id + ".png");
                        item.texture = Laya.loader.getRes(this._resKey + "@" + fileName);
                    }
                    return item.texture;

                case PackageItemType.Sound:
                    if (!item.decoded) {
                        item.decoded = true;
                        item.sound = Laya.loader.getRes(this._resKey + "@" + item.id);
                    }
                    return item.sound;

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
                    if (!item.decoded) {
                        item.decoded = true;
                        var str: String = this.getDesc(item.id + ".xml");
                        item.componentData = Utils.parseXMLFromString(str).firstChild;
                    }
                    return item.componentData;

                default:
                    return Laya.loader.getRes(this._resKey + "@" + item.id);
            }
        }
        
        private function getDesc(fn:String):String {
            return this._resData[fn];
        }

        private function createSpriteTexture(sprite: AtlasSprite): Texture {
            var atlasItem: PackageItem = this._itemsById[sprite.atlas];
            if (atlasItem != null) {
                var atlasTexture:Texture = Texture(this.getItemAsset(atlasItem));
                if(atlasTexture == null)
                    return null;
                else
                    return this.createSubTexture(atlasTexture,sprite.rect);
            }
            else
                return null;
        }

        private function createSubTexture(atlasTexture: Texture, clipRect: Rectangle): Texture {
            var texture: Texture = Texture.createFromTexture(atlasTexture, 
                clipRect.x, clipRect.y, clipRect.width, clipRect.height);
            return texture;
        }

        private function loadMovieClip(item: PackageItem): void {
            var xml: Object = Utils.parseXMLFromString(this.getDesc(item.id + ".xml")).firstChild;
            var str: String;
			var arr:Array;

            str = xml.getAttribute("interval");
            if (str != null)
                item.interval = parseInt(str);
            str = xml.getAttribute("swing");
            if (str != null)
                item.swing = str == "true";
            str = xml.getAttribute("repeatDelay");
            if (str != null)
                item.repeatDelay = parseInt(str);

            var frameCount: Number = parseInt(xml.getAttribute("frameCount"));
            item.frames = new Array();
            var frameNodes: Array = ToolSet.findChildNode(xml, "frames").childNodes;
            var i:Number = 0;
            var len:Number = frameNodes.length;
            for(var k: Number = 0;k < len;k++) {
                var frameNode: Object = frameNodes[k];
                if(frameNode.nodeName!="frame")
                    continue;
                
                var frame: Frame = new Frame();
                str = frameNode.getAttribute("rect");
                arr = str.split(UIPackage.sep0);
                frame.rect = new Rectangle(parseInt(arr[0]),parseInt(arr[1]),parseInt(arr[2]),parseInt(arr[3]));
                str = frameNode.getAttribute("addDelay");
                if(str)
                    frame.addDelay = parseInt(str);
                item.frames[i] = frame;
                
                var sprite: AtlasSprite = this._sprites[item.id + "_" + i];
                if(sprite != null)
                    frame.texture = this.createSpriteTexture(sprite);
                
                i++;
            }
        }

        private function loadFont(item: PackageItem): void {
            var font: BitmapFont = new BitmapFont();
            font.id = "ui://" + this.id + item.id;
            var str: String = this.getDesc(item.id + ".fnt");

            var lines: Array = str.split(UIPackage.sep1);
            var lineCount: Number = lines.length;
            var i: Number = 0;
            var kv: Object = {};
            var ttf: Boolean = false;
            var size: Number = 0;
            var xadvance: Number = 0;
            var resizable: Boolean = false;
            var atlasOffsetX: Number = 0, atlasOffsetY: Number = 0;
            var charImg: PackageItem;
            var mainTexture: Texture;

            for (i = 0; i < lineCount; i++) {
                str = lines[i];
                if (str.length == 0)
                    continue;

                str = ToolSet.trim(str);
                var arr: Array = str.split(UIPackage.sep2);
                for (var j: Number = 1; j < arr.length; j++) {
                    var arr2: Array = arr[j].split(UIPackage.sep3);
                    kv[arr2[0]] = arr2[1];
                }

                str = arr[0];
                if (str == "char") {
                    var bg: BMGlyph = new BMGlyph();
                    bg.x = isNaN(kv.x) ? 0 : parseInt(kv.x);
                    bg.y = isNaN(kv.y) ? 0 : parseInt(kv.y);
                    bg.offsetX = isNaN(kv.xoffset) ? 0 : parseInt(kv.xoffset);
                    bg.offsetY = isNaN(kv.yoffset) ? 0 : parseInt(kv.yoffset);
                    bg.width = isNaN(kv.width) ? 0 : parseInt(kv.width);
                    bg.height = isNaN(kv.height) ? 0 : parseInt(kv.height);
                    bg.advance = isNaN(kv.xadvance) ? 0 : parseInt(kv.xadvance);
                    if (kv.chnl != undefined) {
                        bg.channel = parseInt(kv.chnl);
                        if (bg.channel == 15)
                            bg.channel = 4;
                        else if (bg.channel == 1)
                            bg.channel = 3;
                        else if (bg.channel == 2)
                            bg.channel = 2;
                        else
                            bg.channel = 1;
                    }

                    if (!ttf) {
                        if (kv.img) {
                            charImg = this._itemsById[kv.img];
                            if (charImg != null) {
                                charImg.load();
                                bg.width = charImg.width;
                                bg.height = charImg.height;
                                bg.texture = charImg.texture;
                            }
                        }
                    }
                    else if (mainTexture != null) {
                        bg.texture = this.createSubTexture(mainTexture, new Rectangle(bg.x + atlasOffsetX, bg.y + atlasOffsetY, bg.width, bg.height));
                    }

                    if (ttf)
                        bg.lineHeight = size;
                    else {
                        if(bg.advance == 0) {
                            if(xadvance == 0)
                                bg.advance = bg.offsetX + bg.width;
                            else
                                bg.advance = xadvance;
                        }

                        bg.lineHeight = bg.offsetY < 0 ? bg.height : (bg.offsetY + bg.height);
                        if (bg.lineHeight < size)
                            bg.lineHeight = size;
                    }
                    font.glyphs[String.fromCharCode(kv.id)] = bg;
                }
                else if (str == "info") {
                    ttf = kv.face != null;
                    if(!isNaN(kv.size))
                        size = parseInt(kv.size);
                    resizable = kv.resizable == "true";
                    if (ttf) {
                        var sprite: AtlasSprite = this._sprites[item.id];
                        if (sprite != null) {
                            atlasOffsetX = sprite.rect.x;
                            atlasOffsetY = sprite.rect.y;
                            var atlasItem: PackageItem = this._itemsById[sprite.atlas];
                            if(atlasItem != null)
                                mainTexture = Texture(this.getItemAsset(atlasItem));
                        }
                    }
                }
                else if (str == "common") {
                    if(size==0 && !isNaN(kv.lineHeight))
                        size = parseInt(kv.lineHeight);
                    if(!isNaN(kv.xadvance))
                        xadvance = parseInt(kv.xadvance);
                }
            }
            
            if (size == 0 && bg)
                size = bg.height;

            font.ttf = ttf;
            font.size = size;
            font.resizable = resizable;
            item.bitmapFont = font;
        }
    }
}
import laya.maths.Rectangle;

class AtlasSprite {
	public function AtlasSprite() {
		this.rect = new Rectangle();
	}
	
	public var atlas: String;
	public var rect: Rectangle;
	public var rotated: Boolean;
}