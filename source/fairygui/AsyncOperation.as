package fairygui
{
	
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
				for each(var obj:GObject in _objectPool)
				{
					obj.dispose();
				}
				_objectPool.length = 0;
			}
		}
		
		private function internalCreateObject(item:PackageItem):void
		{
			_itemList.length = 0;
			_objectPool.length = 0;
			
			collectComponentChildren(item);
			_itemList.push(new DisplayListItem(item, null));
			
			_index = 0;
			Laya.timer.frameLoop(1, this, this.run);
		}
		
		private function collectComponentChildren(item:PackageItem):void
		{
			item.owner.getItemAsset(item);
			
			var cnt:int = item.displayList.length;
			for (var i:int = 0; i < cnt; i++)
			{
				var di:DisplayListItem = item.displayList[i];
				if (di.packageItem != null && di.packageItem.type == PackageItemType.Component)
					collectComponentChildren(di.packageItem);
				else if (di.type == "list") //也要收集列表的item
				{
					var defaultItem:String = null;
					di.listItemCount = 0;
					
					var col: Array = di.desc.childNodes;
					var length: int = col.length;
					for (var j: int = 0; j < length; j++) {
						var cxml: Object = col[j];
						if(cxml.nodeName != "item")
							continue;
						
						var url:String = cxml.getAttribute("url");
						if (!url)
						{
							if (defaultItem == null)
								defaultItem = di.desc.getAttribute("defaultItem");
							url = defaultItem;
							if (!url)
								continue;
						}
						
						var pi:PackageItem = UIPackage.getItemByURL(url);
						if (pi)
						{
							if (pi.type == PackageItemType.Component)
								collectComponentChildren(pi);
							
							_itemList.push(new DisplayListItem(pi, null));
							di.listItemCount++;
						}
					}
				}
				_itemList.push(di);
			}
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
						poolStart = _objectPool.length - di.packageItem.displayList.length - 1;
						
						GComponent(obj).constructFromResource2(_objectPool, poolStart);
						
						_objectPool.splice(poolStart, di.packageItem.displayList.length);
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
					
					if (di.type == "list" && di.listItemCount > 0)
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
