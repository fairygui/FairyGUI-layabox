package fairygui {
	import fairygui.action.ControllerAction;
	import fairygui.utils.ByteBuffer;
	
	import laya.events.EventDispatcher;
	
	public class Controller extends EventDispatcher {
		private var _selectedIndex: Number = 0;
		private var _previousIndex: Number = 0;
		private var _pageIds: Vector.<String>;
		private var _pageNames: Vector.<String>;
		private var _actions:Vector.<ControllerAction>;
		
		public var name: String;
		public var parent: GComponent;
		public var autoRadioGroupDepth: Boolean;
		
		public var changing:Boolean = false;
		
		private static var _nextPageId:Number = 0;
		
		public function Controller() {
			super();
			this._pageIds = new Vector.<String>();
			this._pageNames = new Vector.<String>();
			this._selectedIndex = -1;
			this._previousIndex = -1;
		}
		
		public function dispose():void {
			this.offAll();
		}

		public function get selectedIndex(): Number {
			return this._selectedIndex;
		}
		
		public function set selectedIndex(value: Number):void {
			if(this._selectedIndex != value) {
				if(value > this._pageIds.length - 1)
					throw "index out of bounds: " + value;
				
				this.changing = true; 
				this._previousIndex = this._selectedIndex;
				this._selectedIndex = value;
				this.parent.applyController(this);
				
				this.event(Events.STATE_CHANGED);
				
				this.changing = false; 
			}
		}
		
		//功能和设置selectedIndex一样，但不会触发事件
		public function setSelectedIndex(value: Number = 0): void {
			if (this._selectedIndex != value) {
				if(value > this._pageIds.length - 1)
					throw "index out of bounds: " + value;
				
				this.changing = true; 
				this._previousIndex = this._selectedIndex;
				this._selectedIndex = value;
				this.parent.applyController(this);
				this.changing = false;
			}
		}
		
		public function get previsousIndex(): Number {
			return this._previousIndex;
		}
		
		public function get selectedPage(): String {
			if (this._selectedIndex == -1)
				return null;
			else
				return this._pageNames[this._selectedIndex];
		}
		
		public function set selectedPage(val: String):void {
			var i: Number = this._pageNames.indexOf(val);
			if (i == -1)
				i = 0;
			this.selectedIndex = i;
		}
		
		//功能和设置selectedPage一样，但不会触发事件
		public function setSelectedPage(value: String): void {
			var i: Number = this._pageNames.indexOf(value);
			if (i == -1)
				i = 0;
			this.setSelectedIndex(i);
		}
		
		public function get previousPage(): String {
			if (this._previousIndex == -1)
				return null;
			else
				return this._pageNames[this._previousIndex];
		}
		
		public function get pageCount(): Number {
			return this._pageIds.length;
		}
		
		public function getPageName(index: Number = 0): String {
			return this._pageNames[index];
		}
		
		public function addPage(name: String= ""): void {
			this.addPageAt(name, this._pageIds.length);
		}
		
		public function addPageAt(name: String, index: Number = 0): void {
			var nid: String = "" + (Controller._nextPageId++);
			if (index == this._pageIds.length) {
				this._pageIds.push(nid);
				this._pageNames.push(name);
			}
			else {
				this._pageIds.splice(index, 0, nid);
				this._pageNames.splice(index, 0, name);
			}
		}
		
		public function removePage(name: String): void {
			var i: Number = this._pageNames.indexOf(name);
			if (i != -1) {
				this._pageIds.splice(i, 1);
				this._pageNames.splice(i, 1);
				if (this._selectedIndex >= this._pageIds.length)
					this.selectedIndex = this._selectedIndex - 1;
				else
					this.parent.applyController(this);
			}
		}
		
		public function removePageAt(index: Number = 0): void {
			this._pageIds.splice(index, 1);
			this._pageNames.splice(index, 1);
			if (this._selectedIndex >= this._pageIds.length)
				this.selectedIndex = this._selectedIndex - 1;
			else
				this.parent.applyController(this);
		}
		
		public function clearPages(): void {
			this._pageIds.length = 0;
			this._pageNames.length = 0;
			if (this._selectedIndex != -1)
				this.selectedIndex = -1;
			else
				this.parent.applyController(this);
		}
		
		public function hasPage(aName:String):Boolean {
			return this._pageNames.indexOf(aName) != -1;
		}
		
		public function getPageIndexById(aId: String): Number {
			return this._pageIds.indexOf(aId);
		}
		
		public function getPageIdByName(aName: String): String {
			var i: Number = this._pageNames.indexOf(aName);
			if(i != -1)
				return this._pageIds[i];
			else
				return null;
		}
		
		public function getPageNameById(aId: String): String {
			var i: Number = this._pageIds.indexOf(aId);
			if(i != -1)
				return this._pageNames[i];
			else
				return null;
		}
		
		public function getPageId(index: Number = 0): String {
			return this._pageIds[index];
		}
		
		public function get selectedPageId(): String {
			if (this._selectedIndex == -1)
				return null;
			else
				return this._pageIds[this._selectedIndex];
		}
		
		public function set selectedPageId(val: String):void {
			var i: Number = this._pageIds.indexOf(val);
			this.selectedIndex = i;
		}
		
		public function set oppositePageId(val: String):void {
			var i: Number = this._pageIds.indexOf(val);
			if(i > 0)
				this.selectedIndex = 0;
			else if(this._pageIds.length > 1)
				this.selectedIndex = 1;
		}
		
		public function get previousPageId(): String {
			if(this._previousIndex == -1)
				return null;
			else
				return this._pageIds[this._previousIndex];
		}
		
		public function runActions():void
		{
			if(_actions)
			{
				var cnt:int = _actions.length;
				for(var i:int=0;i<cnt;i++)
				{
					_actions[i].run(this, previousPageId, selectedPageId);
				}
			}
		}
		
		public function setup(buffer:ByteBuffer): void {
			var beginPos:int = buffer.pos;
			buffer.seek(beginPos, 0);
			
			name = buffer.readS();
			autoRadioGroupDepth = buffer.readBool();
			
			buffer.seek(beginPos, 1);
			
			var i:int;
			var nextPos:int;
			var cnt:int = buffer.getInt16();

			for (i = 0; i < cnt; i++)
			{
				_pageIds.push(buffer.readS());
				_pageNames.push(buffer.readS());
			}
			
			buffer.seek(beginPos, 2);
			
			cnt = buffer.getInt16();
			if (cnt > 0)
			{
				if (_actions == null)
					_actions = new Vector.<ControllerAction>();
				
				for (i = 0; i < cnt; i++)
				{
					nextPos = buffer.getInt16();
					nextPos += buffer.pos;
					
					var action:ControllerAction = ControllerAction.createAction(buffer.readByte());
					action.setup(buffer);
					_actions.push(action);
					
					buffer.pos = nextPos;
				}
			}
			
			if (parent != null && _pageIds.length > 0)
				_selectedIndex = 0;
			else
				_selectedIndex = -1;
		}
	}
}
