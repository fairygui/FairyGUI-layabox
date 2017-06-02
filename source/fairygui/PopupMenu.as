package fairygui {
	import laya.events.Event;
	import laya.utils.Handler;
	
	public class PopupMenu {
		
		protected var _contentPane:GComponent;
		protected var _list:GList;
		
		public function PopupMenu(resourceURL:String = null)
		{
			if(!resourceURL)
			{
				resourceURL = fairygui.UIConfig.popupMenu;
				if(!resourceURL)
					throw "UIConfig.popupMenu not defined";
			}
			this._contentPane = UIPackage.createObjectFromURL(resourceURL).asCom;
			this._contentPane.on(Event.DISPLAY, this, this.__addedToStage);
			this._list = GList(this._contentPane.getChild("list"));
			this._list.removeChildrenToPool();
			this._list.addRelation(this._contentPane,RelationType.Width);
			this._list.removeRelation(this._contentPane,RelationType.Height);
			this._contentPane.addRelation(this._list,RelationType.Height);
			this._list.on(Events.CLICK_ITEM, this, this.__clickItem);
		}
		
		public function dispose():void
		{
			this._contentPane.dispose();
		}
		
		public function addItem(caption:String, handler:Handler=null):GButton
		{
			var item:GButton = this._list.addItemFromPool().asButton;
			item.title = caption;
			item.data = handler;
			item.grayed = false;
			var c:Controller = item.getController("checked");
			if(c != null)
				c.selectedIndex = 0;
			return item;
		}
		
		public function addItemAt(caption:String,index:Number,handler:Handler = null):GButton
		{
			var item:GButton = this._list.getFromPool().asButton;
			this._list.addChildAt(item,index);
			item.title = caption;
			item.data = handler;
			item.grayed = false;
			var c:Controller = item.getController("checked");
			if(c != null)
				c.selectedIndex = 0;
			return item;
		}
		
		public function addSeperator():void
		{
			if(fairygui.UIConfig.popupMenu_seperator == null)
				throw "UIConfig.popupMenu_seperator not defined";
			this.list.addItemFromPool(fairygui.UIConfig.popupMenu_seperator);
		}
		
		public function getItemName(index:Number):String
		{
			var item: GObject = this._list.getChildAt(index);
			return item.name;
		}
		
		public function setItemText(name:String,caption:String):void
		{
			var item:GButton = this._list.getChild(name).asButton;
			item.title = caption;
		}
		
		public function setItemVisible(name:String,visible:Boolean):void
		{
			var item:GButton = this._list.getChild(name).asButton;
			if(item.visible != visible)
			{
				item.visible = visible;
				this._list.setBoundsChangedFlag();
			}
		}
		
		public function setItemGrayed(name:String,grayed:Boolean):void
		{
			var item:GButton = this._list.getChild(name).asButton;
			item.grayed = grayed;
		}
		
		public function setItemCheckable(name:String,checkable:Boolean):void
		{
			var item:GButton = this._list.getChild(name).asButton;
			var c:Controller = item.getController("checked");
			if(c != null)
			{
				if(checkable)
				{
					if(c.selectedIndex == 0)
						c.selectedIndex = 1;
				}
				else
					c.selectedIndex = 0;
			}
		}
		
		public function setItemChecked(name:String,checked:Boolean):void
		{
			var item:GButton = this._list.getChild(name).asButton;
			var c:Controller = item.getController("checked");
			if(c != null)
				c.selectedIndex = checked?2:1;
		}
		
		public function isItemChecked(name:String):Boolean
		{
			var item:GButton = this._list.getChild(name).asButton;
			var c:Controller = item.getController("checked");
			if(c != null)
				return c.selectedIndex == 2;
			else
				return false;
		}
		
		public function removeItem(name:String):Boolean
		{
			var item:GButton = this._list.getChild(name) as GButton;
			if(item != null)
			{
				var index:Number = this._list.getChildIndex(item);
				this._list.removeChildToPoolAt(index);
				return true;
			}
			else
				return false;
		}
		
		public function clearItems():void
		{
			this._list.removeChildrenToPool();
		}
		
		public function get itemCount():Number
		{
			return this._list.numChildren;
		}
		
		public function get contentPane():GComponent
		{
			return this._contentPane;
		}
		
		public function get list():GList
		{
			return this._list;
		}
		
		public function show(target:GObject = null,downward:*=null):void
		{
			var r:GRoot = target != null?target.root:GRoot.inst;
			r.showPopup(this.contentPane,(target is GRoot)?null:target,downward);
		}
		
		private function __clickItem(itemObject:GObject): void {
			Laya.timer.once(100, this, this.__clickItem2, [itemObject]);
		}
		
		private function __clickItem2(itemObject:GObject): void {
			if(!(itemObject is GButton))
				return;
			if(itemObject.grayed) {
				this._list.selectedIndex = -1;
				return;
			}
			var c: Controller = itemObject.asCom.getController("checked");
			if(c != null && c.selectedIndex != 0) {
				if(c.selectedIndex == 1)
					c.selectedIndex = 2;
				else
					c.selectedIndex = 1;
			}
			var r: GRoot = GRoot(this._contentPane.parent);
			r.hidePopup(this.contentPane);
			if(itemObject.data != null) {
				Handler(itemObject.data).run();
			}
		}
		
		private function __addedToStage():void
		{
			this._list.selectedIndex = -1;
			this._list.resizeToFit(100000,10);
		}
		
	}
}

