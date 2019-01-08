
package fairygui {
	import fairygui.display.BMGlyph;
	import fairygui.display.BitmapFont;
	import fairygui.display.Frame;
	import fairygui.utils.ByteBuffer;
	import fairygui.utils.PixelHitTestData;
	
	import laya.maths.Rectangle;
	import laya.media.SoundManager;
	import laya.resource.Texture;
	
	public class UIPackage {
		private var _id: String;
		private var _name: String;
		private var _items: Vector.<PackageItem>;
		private var _itemsById: Object;
		private var _itemsByName: Object;
		private var _customId: String;
		private var _sprites: Object;
		
		//internal
		public static var _constructing: Number = 0;
		
		private static var _packageInstById: Object = {};
		private static var _packageInstByName: Object = {};
		
		public function UIPackage() {
			this._items = new Vector.<PackageItem>();
			this._itemsById = {};
			this._itemsByName = {};
			this._sprites = {};
		}
		
		public static function getById(id: String): UIPackage {
			return UIPackage._packageInstById[id];
		}
		
		public static function getByName(name: String): UIPackage {
			return UIPackage._packageInstByName[name];
		}
		
		public static function addPackage(resKey:String, descData:ArrayBuffer = null): UIPackage {
			if(!descData)
			{
				descData = AssetProxy.inst.getRes(resKey+"."+fairygui.UIConfig.packageFileExtension);
				if(!descData || descData.byteLength==0)
					throw new Error("package resource not ready: " + resKey);
			}
			
			var buffer:ByteBuffer = new ByteBuffer(descData);
			
			var pkg:UIPackage = new UIPackage();
			pkg.loadPackage(buffer, resKey);
			UIPackage._packageInstById[pkg.id] = pkg;
			UIPackage._packageInstByName[pkg.name] = pkg;
			pkg.customId = resKey;
			return pkg;
		}
		
		public static function removePackage(packageIdOrName: String): void {
			var pkg: UIPackage = UIPackage._packageInstById[packageIdOrName];
			if(!pkg)
				pkg = UIPackage._packageInstByName[packageIdOrName];
			if(!pkg)
				throw new Error("unknown package: " + packageIdOrName);
			
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
				return pi.owner.internalCreateObject(pi,userClass);
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
			var pos1:int = url.indexOf("//");
			if (pos1 == -1)
				return null;
			
			var pos2:int = url.indexOf("/", pos1 + 2);
			if (pos2 == -1)
			{
				if (url.length > 13)
				{
					var pkgId:String = url.substr(5, 8);
					var pkg:UIPackage = getById(pkgId);
					if (pkg != null)
					{
						var srcId:String = url.substr(13);
						return pkg.getItemById(srcId);
					}
				}
			}
			else
			{
				var pkgName:String = url.substr(pos1 + 2, pos2 - pos1 - 2);
				pkg = getByName(pkgName);
				if (pkg != null)
				{
					var srcName:String = url.substr(pos2 + 1);
					return pkg.getItemByName(srcName);
				}
			}
			
			return null;
		}
		
		public static function getItemAssetByURL(url: String): Object {
			var item:PackageItem = getItemByURL(url);
			if (item == null)
				return null;
			
			return item.owner.getItemAsset(item);
		}
		
		public static function normalizeURL(url:String):String
		{
			if(url==null)
				return null;
			
			var pos1:int = url.indexOf("//");
			if (pos1 == -1)
				return null;
			
			var pos2:int = url.indexOf("/", pos1 + 2);
			if (pos2 == -1)
				return url;
			
			var pkgName:String = url.substr(pos1 + 2, pos2 - pos1 - 2);
			var srcName:String = url.substr(pos2 + 1);
			return getItemURL(pkgName, srcName);
		}
		
		public static function setStringsSource(source:String):void
		{
			TranslationHelper.loadFromXML(source);
		}
		
		private function loadPackage(buffer:ByteBuffer, resKey:String): void {
			if (buffer.getUint32() != 0x46475549)
				throw new Error("FairyGUI: old package format found in '" + resKey + "'");
			
			buffer.version = buffer.getInt32();
			var compressed:Boolean = buffer.readBool();
			this._id = buffer.readUTFString();
			this._name = buffer.readUTFString();
			buffer.skip(20);
			
			if(compressed)
			{
				var buf:Uint8Array = new Uint8Array(buffer.buffer, buffer.pos, buffer.length-buffer.pos);
				__JS__("var inflater = new Zlib.RawInflate(buf);buf = inflater.decompress();");
				
				buffer = new ByteBuffer(buf);
			}
			
			var indexTablePos:int = buffer.pos;
			var cnt:int;
			var i:int;
			var nextPos:int;
			
			buffer.seek(indexTablePos, 4);
			
			cnt = buffer.getInt32();
			var stringTable:Vector.<String> = new Vector.<String>(cnt);
			for (i = 0; i < cnt; i++)
				stringTable[i] = buffer.readUTFString();
			buffer.stringTable = stringTable;
			
			buffer.seek(indexTablePos, 1);
			
			var pi:PackageItem;
			resKey = resKey + "_";
			
			cnt = buffer.getUint16();
			for (i = 0; i < cnt; i++)
			{
				nextPos = buffer.getInt32();
				nextPos += buffer.pos;
				
				pi = new PackageItem();
				pi.owner = this;
				pi.type = buffer.readByte();
				pi.id = buffer.readS();
				pi.name = buffer.readS();
				buffer.readS(); //path
				pi.file = buffer.readS();
				buffer.readBool();//exported
				pi.width = buffer.getInt32();
				pi.height = buffer.getInt32();
				
				switch (pi.type)
				{
					case PackageItemType.Image:
					{
						pi.objectType = ObjectType.Image;
						var scaleOption:int = buffer.readByte();
						if (scaleOption == 1)
						{
							pi.scale9Grid = new laya.maths.Rectangle();
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
						var extension:int = buffer.readByte();
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
						pi.file = resKey + pi.file;
						break;
					}
				}
				_items.push(pi);
				_itemsById[pi.id] = pi;
				if (pi.name != null)
					_itemsByName[pi.name] = pi;
				
				buffer.pos = nextPos;
			}
			
			buffer.seek(indexTablePos, 2);
			
			cnt = buffer.getUint16();
			for (i = 0; i < cnt; i++)
			{
				nextPos = buffer.getUint16();
				nextPos += buffer.pos;
				
				var itemId:String = buffer.readS();
				pi = _itemsById[buffer.readS()];
				
				var sprite:AtlasSprite = new AtlasSprite();
				sprite.atlas = pi;
				sprite.rect.x = buffer.getInt32();
				sprite.rect.y = buffer.getInt32();
				sprite.rect.width = buffer.getInt32();
				sprite.rect.height = buffer.getInt32();
				sprite.rotated = buffer.readBool();
				_sprites[itemId] = sprite;
				
				buffer.pos = nextPos;
			}
			
			if (buffer.seek(indexTablePos, 3))
			{
				cnt = buffer.getUint16();
				for (i = 0; i < cnt; i++)
				{
					nextPos = buffer.getInt32();
					nextPos += buffer.pos;
					
					pi = _itemsById[buffer.readS()];
					if (pi && pi.type == PackageItemType.Image)
					{
						pi.pixelHitTestData = new PixelHitTestData();
						pi.pixelHitTestData.load(buffer);
					}
					
					buffer.pos = nextPos;
				}
			}
		}
		
		public function loadAllAssets():void
		{
			var cnt:int = this._items.length;
			for(var i: int = 0;i < cnt;i++) {
				var pi: PackageItem = this._items[i];
				this.getItemAsset(pi);
			}
		}
		
		public function unloadAssets():void
		{
			var cnt:int = this._items.length;
			for(var i: int = 0;i < cnt;i++) {
				var pi: PackageItem = this._items[i];
				if(pi.type==PackageItemType.Atlas)
				{
					if(pi.texture!= null)
						Laya.loader.clearTextureRes(pi.texture.url);
				}
			}
		}
		
		public function dispose(): void {
			var cnt:int = this._items.length;
			for(var i: int = 0;i < cnt;i++) {
				var pi: PackageItem = this._items[i];
				if(pi.type==PackageItemType.Atlas)
				{
					if(pi.texture!= null)
					{
						pi.texture.destroy();
						pi.texture = null;
					}
				}
				else if(pi.type==PackageItemType.Sound)
				{
					SoundManager.destroySound(pi.file);
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
				return this.internalCreateObject(pi, userClass);
			else
				return null;
		}
		
		public function internalCreateObject(item: PackageItem, userClass: Object = null): GObject {
			var g: GObject;
			if (item.type == PackageItemType.Component) {
				if (userClass != null)
					g = new userClass();
				else
					g = UIObjectFactory.newObject(item);
			}
			else
				g = UIObjectFactory.newObject(item);
			
			if (g == null)
				return null;
			
			UIPackage._constructing++;
			g.packageItem = item;
			g.constructFromResource();
			UIPackage._constructing--;
			return g;
		}
		
		public function getItemById(itemId: String): PackageItem {
			return this._itemsById[itemId];
		}
		
		public function getItemByName(resName: String): PackageItem {
			return this._itemsByName[resName];
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
						{
							var atlasTexture:Texture = Texture(this.getItemAsset(sprite.atlas));
							item.texture = Texture.create(atlasTexture,
								sprite.rect.x, sprite.rect.y, sprite.rect.width, sprite.rect.height);
						}
						else
							item.texture = null;
					}
					return item.texture;
					
				case PackageItemType.Atlas:
					if (!item.decoded) {
						item.decoded = true;
						item.texture = AssetProxy.inst.getRes(item.file);
						//if(!fairygui.UIConfig.textureLinearSampling)
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
					if(item.file)
						return AssetProxy.inst.getRes(item.file);
					else
						return null;
					
				default:
					return null;
			}
		}

		private function loadMovieClip(item: PackageItem): void {
			var buffer:ByteBuffer = item.rawData;
			
			buffer.seek(0, 0);
			
			item.interval = buffer.getInt32();
			item.swing = buffer.readBool();
			item.repeatDelay = buffer.getInt32();
			
			buffer.seek(0, 1);
			
			var frameCount:int = buffer.getInt16();
			item.frames = new Vector.<Frame>(frameCount);
			
			var spriteId:String;
			var frame:Frame;
			var sprite:AtlasSprite;
			var fx:Number;
			var fy:Number;
			
			for (var i:int = 0; i < frameCount; i++)
			{
				var nextPos:int = buffer.getInt16();
				nextPos += buffer.pos;
				
				frame = new Frame();
				fx = buffer.getInt32();
				fy = buffer.getInt32();
				buffer.getInt32(); //width
				buffer.getInt32(); //height
				frame.addDelay = buffer.getInt32();
				spriteId = buffer.readS();
				
				if (spriteId != null && (sprite=_sprites[spriteId])!=null)
				{
					var atlasTexture:Texture = Texture(this.getItemAsset(sprite.atlas));
					frame.texture = Texture.create(atlasTexture,
						sprite.rect.x, sprite.rect.y, sprite.rect.width, sprite.rect.height,
						fx, fy, item.width, item.height);
				}
				item.frames[i] = frame;
				
				buffer.pos = nextPos;
			}
		}
		
		private function loadFont(item: PackageItem): void {
			var font: BitmapFont = new BitmapFont();
			item.bitmapFont = font;			
			var buffer:ByteBuffer = item.rawData;
			
			buffer.seek(0, 0);
			
			font.ttf = buffer.readBool();
			buffer.readBool(); //tint
			font.resizable = buffer.readBool();
			buffer.readBool(); //has channel
			font.size = buffer.getInt32();
			var xadvance:int = buffer.getInt32();
			var lineHeight:int = buffer.getInt32();
			
			var mainTexture:Texture = null;
			var mainSprite:AtlasSprite = this._sprites[item.id];
			if (mainSprite!= null)
				mainTexture = Texture(this.getItemAsset(mainSprite.atlas));
			
			buffer.seek(0, 1);
			
			var bg:BMGlyph = null;
			var cnt:int = buffer.getInt32();
			for (var i:int = 0; i < cnt; i++)
			{
				var nextPos:int = buffer.getInt16();
				nextPos += buffer.pos;
				
				bg = new BMGlyph();
				var ch:String = buffer.readChar();
				font.glyphs[ch] = bg;
				
				var img:String = buffer.readS();
				var bx:int = buffer.getInt32();
				var by:int = buffer.getInt32();
				bg.offsetX = buffer.getInt32();
				bg.offsetY = buffer.getInt32();
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
				
				if (!font.ttf)
				{
					var charImg:PackageItem = _itemsById[img];
					if (charImg)
					{
						getItemAsset(charImg);
						bg.width = charImg.width;
						bg.height = charImg.height;
						bg.texture = charImg.texture;
					}
				}
				else
				{
					bg.texture = Texture.create(mainTexture, 
						bx + mainSprite.rect.x, by + mainSprite.rect.y, bg.width, bg.height);
				}
				
				if (font.ttf)
					bg.lineHeight = lineHeight;
				else
				{
					if (bg.advance == 0)
					{
						if (xadvance == 0)
							bg.advance = bg.offsetX + bg.width;
						else
							bg.advance = xadvance;
					}
					
					bg.lineHeight = bg.offsetY < 0 ? bg.height : (bg.offsetY + bg.height);
					if (bg.lineHeight < font.size)
						bg.lineHeight = font.size;
				}
				
				buffer.pos = nextPos;
			}
		}
	}
}

import fairygui.PackageItem;

import laya.maths.Rectangle;

class AtlasSprite {
	public var atlas:PackageItem;
	public var rect:Rectangle;
	public var rotated:Boolean;
	
	public function AtlasSprite() {
		this.rect = new Rectangle();
	}
}