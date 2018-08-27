package fairygui
{
	import fairygui.utils.ByteBuffer;
	
	import laya.utils.Browser;
	import laya.utils.Handler;
	
	public class AsyncOperation
	{
		/**
		 * callback(obj:GObject)
		 */
		public var callback:Handler;
		
		private var _itemList:Vector.<DisplayListItem>;
		private var _objectPool:Vector.<GObject>;
		private var _index:int;
		
		public function AsyncOperation()
		{
			_itemList = new Vector.<DisplayListItem>();
			_objectPool = new Vector.<GObject>();
		}
		
		public function createObject(pkgName:String, resName:String):void
		{
			var pkg:UIPackage = UIPackage.getByName(pkgName);
			if(pkg)
			{
				var pi:PackageItem = pkg.getItemByName(resName);
				if(!pi)
					throw new Error("resource not found: " + resName);
				
				internalCreateObject(pi);
			}
			else
				throw new Error("package not found: " + pkgName);
		}
		
		public function createObjectFromURL(url:String):void
		{
			var pi:PackageItem = UIPackage.getItemByURL(url);
			if(pi)
				internalCreateObject(pi);
			else
				throw new Error("resource not found: " + url);
		}
		
		public function cancel():void
		{
			Laya.timer.clear(this, run);
			_itemList.length = 0;
			if(_objectPool.length>0)
			{
				var cnt:int = _objectPool.length;
				for(var i:int=0;i<cnt;i++)
				{
					_objectPool[i].dispose();
				}
				_objectPool.length = 0;
			}
		}
		
		private function internalCreateObject(item:PackageItem):void
		{
			_itemList.length = 0;
			_objectPool.length = 0;
			
			var di:DisplayListItem = new DisplayListItem(item, ObjectType.Component);
			di.childCount = collectComponentChildren(item);
			_itemList.push(di);
			
			_index = 0;
			Laya.timer.frameLoop(1, this, this.run);
		}
		
		private function collectComponentChildren(item:PackageItem):int
		{
			var buffer:ByteBuffer = item.rawData;
			buffer.seek(0, 2);
			
			var di:DisplayListItem;
			var pi:PackageItem;
			var i:int;
			var dataLen:int;
			var curPos:int;
			var pkg:UIPackage;
			
			var dcnt:int = buffer.getInt16();
			for (i = 0; i < dcnt; i++)
			{
				dataLen = buffer.getInt16();
				curPos = buffer.pos;
				
				buffer.seek(curPos, 0);
				
				var type:int = buffer.readByte();
				var src:String = buffer.readS();
				var pkgId:String = buffer.readS();
				
				buffer.pos = curPos;
				
				if (src != null)
				{
					if (pkgId != null)
						pkg = UIPackage.getById(pkgId);
					else
						pkg = item.owner;
					
					pi = pkg != null ? pkg.getItemById(src) : null;
					di = new DisplayListItem(pi, type);
					
					if (pi != null && pi.type == PackageItemType.Component)
						di.childCount = collectComponentChildren(pi);
				}
				else
				{
					di = new DisplayListItem(null, type);
					if (type == ObjectType.List) //list
						di.listItemCount = collectListChildren(buffer);
				}
				
				_itemList.push(di);
				buffer.pos = curPos + dataLen;
			}
			
			return dcnt;	
		}
		
		private function collectListChildren(buffer:ByteBuffer):int
		{
			buffer.seek(buffer.pos, 8);
			
			var listItemCount:int = 0;
			var i:int;
			var nextPos:int;
			var url:String;
			var pi:PackageItem;
			var di:DisplayListItem;			
			var defaultItem:String = buffer.readS();
			var itemCount:int = buffer.getInt16();
			
			for (i = 0; i < itemCount; i++)
			{
				nextPos = buffer.getInt16();
				nextPos += buffer.pos;
				
				url = buffer.readS();
				if (url == null)
					url = defaultItem;
				if (url)
				{
					pi = UIPackage.getItemByURL(url);
					if (pi != null)
					{
						di = new DisplayListItem(pi, pi.objectType);
						if (pi.type == PackageItemType.Component)
							di.childCount = collectComponentChildren(pi);
						
						_itemList.push(di);
						listItemCount++;
					}
				}
				buffer.pos = nextPos;
			}
			
			return listItemCount;
		}
		
		private function run():void
		{
			var obj:GObject;
			var di:DisplayListItem;
			var poolStart:int;
			var k:int;
			var t:int = Browser.now();
			var frameTime:int = fairygui.UIConfig.frameTimeForAsyncUIConstruction;
			var totalItems:int = _itemList.length;
			
			while(_index<totalItems)
			{
				di = _itemList[_index];
				if (di.packageItem != null)
				{
					obj = UIObjectFactory.newObject(di.packageItem);
					obj.packageItem = di.packageItem;
					_objectPool.push(obj);
					
					UIPackage._constructing++;
					if (di.packageItem.type == PackageItemType.Component)
					{
						poolStart = _objectPool.length - di.childCount - 1;
						
						GComponent(obj).constructFromResource2(_objectPool, poolStart);
						
						_objectPool.splice(poolStart, di.childCount);
					}
					else
					{
						obj.constructFromResource();
					}
					UIPackage._constructing--;
				}
				else
				{
					obj = UIObjectFactory.newObject2(di.type);
					_objectPool.push(obj);
					
					if (di.type == ObjectType.List && di.listItemCount > 0)
					{
						poolStart = _objectPool.length - di.listItemCount - 1;
						
						for (k = 0; k < di.listItemCount; k++) //把他们都放到pool里，这样GList在创建时就不需要创建对象了
							GList(obj).itemPool.returnObject(_objectPool[k + poolStart]);
						
						_objectPool.splice(poolStart, di.listItemCount);
					}
				}
				
				_index++;
				if ((_index % 5 == 0) && Browser.now() - t >= frameTime)
					return;
			}
			
			Laya.timer.clear(this, this.run);
			var result:GObject = _objectPool[0];
			_itemList.length = 0;
			_objectPool.length = 0;
			
			if(callback!=null)
				callback.runWith(result);
		}
	}
}

import fairygui.PackageItem;

class DisplayListItem
{
	public var packageItem:PackageItem;
	public var type:int;
	public var childCount:int;
	public var listItemCount:int;
	
	public function DisplayListItem(packageItem:PackageItem, type:int)
	{
		this.packageItem = packageItem;
		this.type = type;
	}
}
