package fairygui {
	import fairygui.utils.ByteBuffer;
	
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	import laya.utils.Handler;
	
	public class GList extends GComponent {
		/**
		 * itemRenderer(int index, GObject item);
		 */
		public var itemRenderer:Handler;
		/**
		 * itemProvider(index:int):String;
		 */
		public var itemProvider:Handler;
		
		public var scrollItemToViewOnClick: Boolean;
		public var foldInvisibleItems:Boolean;
		
		private var _layout: int;
		private var _lineCount:int = 0;
		private var _columnCount:int = 0;
		private var _lineGap: int = 0;
		private var _columnGap: int = 0;
		private var _defaultItem: String;
		private var _autoResizeItem: Boolean;
		private var _selectionMode: int;
		private var _align:String;
		private var _verticalAlign:String;
		private var _selectionController:Controller;
		
		private var _lastSelectedIndex: Number = 0;
		private var _pool: GObjectPool;
		
		//Virtual List support
		private var _virtual:Boolean;
		private var _loop: Boolean;
		private var _numItems: int = 0;
		private var _realNumItems:int;
		private var _firstIndex: int = 0; //the top left index
		private var _curLineItemCount: int = 0; //item count in one line
		private var _curLineItemCount2:int; //只用在页面模式，表示垂直方向的项目数
		private var _itemSize:Point;
		private var _virtualListChanged: int = 0; //1-content changed, 2-size changed
		private var _virtualItems:Vector.<ItemInfo>;
		private var _eventLocked: Boolean;
		private var itemInfoVer:uint = 0; //用来标志item是否在本次处理中已经被重用了
		
		public function GList() {
			super();
			
			this._trackBounds = true;
			this._pool = new GObjectPool();
			this._layout = ListLayoutType.SingleColumn;
			this._autoResizeItem = true;
			this._lastSelectedIndex = -1;
			this._selectionMode = ListSelectionMode.Single;
			this.opaque = true;
			this.scrollItemToViewOnClick = true;
			this._align = "left";
			this._verticalAlign = "top";
			
			_container = new Sprite();
			_displayObject.addChild(_container);
		}
		
		override public function dispose(): void {
			this._pool.clear();
			super.dispose();
		}
		
		/**
		 * @see ListLayoutType
		 */
		public function get layout(): int {
			return this._layout;
		}
		
		/**
		 * @see ListLayoutType
		 */
		public function set layout(value: int):void {
			if (this._layout != value) {
				this._layout = value;
				this.setBoundsChangedFlag();
				if(this._virtual)
					this.setVirtualListChangedFlag(true);
			}
		}
		
		final public function get lineCount():int
		{
			return _lineCount;
		}
		
		final public function set lineCount(value:int):void
		{
			if (_lineCount != value)
			{
				_lineCount = value;
				if (_layout == ListLayoutType.FlowVertical || _layout == ListLayoutType.Pagination)
				{
					setBoundsChangedFlag();
					if (_virtual)
						setVirtualListChangedFlag(true);
				}
			}
		}
		
		final public function get columnCount():int
		{
			return _columnCount;
		}
		
		final public function set columnCount(value:int):void
		{
			if (_columnCount != value)
			{
				_columnCount = value;
				if (_layout == ListLayoutType.FlowHorizontal || _layout == ListLayoutType.Pagination)
				{
					setBoundsChangedFlag();
					if (_virtual)
						setVirtualListChangedFlag(true);
				}
			}
		}
		
		public function get lineGap(): int {
			return this._lineGap;
		}

		
		public function set lineGap(value: int):void {
			if (this._lineGap != value) {
				this._lineGap = value;
				this.setBoundsChangedFlag();
				if(this._virtual)
					this.setVirtualListChangedFlag(true);
			}
		}
		
		public function get columnGap(): int {
			return this._columnGap;
		}
		
		final public function set columnGap(value:int):void
		{
			if(_columnGap != value)
			{
				_columnGap = value;
				setBoundsChangedFlag();
				if (_virtual)
					setVirtualListChangedFlag(true);
			}
		}
		
		public function get align():String
		{
			return _align;
		}
		
		public function set align(value:String):void
		{
			if(_align!=value)
			{
				_align = value;
				setBoundsChangedFlag();
				if (_virtual)
					setVirtualListChangedFlag(true);
			}
		}
		
		final public function get verticalAlign():String
		{
			return _verticalAlign;
		}
		
		public function set verticalAlign(value:String):void
		{
			if(_verticalAlign!=value)
			{
				_verticalAlign = value;
				setBoundsChangedFlag();
				if (_virtual)
					setVirtualListChangedFlag(true);
			}
		}
		
		public function get virtualItemSize(): Point  {
			return this._itemSize;
		}
		
		public function set virtualItemSize(value: Point):void {
			if(this._virtual) {
				if(this._itemSize == null)
					this._itemSize = new Point();
				this._itemSize.setTo(value.x, value.y);
				this.setVirtualListChangedFlag(true);
			}
		}
		
		public function get defaultItem(): String {
			return this._defaultItem;
		}
		
		public function set defaultItem(val: String):void {
			this._defaultItem = val;
		}
		
		public function get autoResizeItem(): Boolean {
			return this._autoResizeItem;
		}
		
		public function set autoResizeItem(value: Boolean):void {
			if(_autoResizeItem != value)
			{
				_autoResizeItem = value;
				setBoundsChangedFlag();
				if (_virtual)
					setVirtualListChangedFlag(true);
			}
		}
		
		/**
		 * @see ListSelectionMode
		 */
		public function get selectionMode(): int {
			return this._selectionMode;
		}
		
		/**
		 * @see ListSelectionMode
		 */
		public function set selectionMode(value: int):void {
			this._selectionMode = value;
		}
		
		public function get selectionController():Controller
		{
			return _selectionController;
		}
		
		public function set selectionController(value:Controller):void
		{
			_selectionController = value;
		}
		
		public function get itemPool():GObjectPool
		{
			return this._pool;
		}
		
		public function getFromPool(url: String= null): GObject {
			if (!url)
				url = this._defaultItem;
			
			var obj:GObject = this._pool.getObject(url);
			if(obj!=null)
				obj.visible = true;
			return obj;
		}
		
		public function returnToPool(obj: GObject): void {
			obj.displayObject.cacheAs = "none";
			this._pool.returnObject(obj);
		}
		
		override public function addChildAt(child: GObject, index: Number = 0): GObject {
			super.addChildAt(child, index);
			
			if (child is GButton) {
				var button: GButton = GButton(child);
				button.selected = false;
				button.changeStateOnClick = false;
			}
			child.on(Event.CLICK, this, this.__clickItem);
			
			return child;
		}
		
		public function addItem(url: String= null): GObject {
			if (!url)
				url = this._defaultItem;
			
			return this.addChild(UIPackage.createObjectFromURL(url));
		}
		
		public function addItemFromPool(url: String= null): GObject {
			return this.addChild(this.getFromPool(url));
		}
		
		override public function removeChildAt(index: Number, dispose: Boolean= false): GObject {
			var child: GObject = super.removeChildAt(index);
			if(dispose)
				child.dispose();
			else
				child.off(Event.CLICK, this, this.__clickItem);
			
			return child;
		}
		
		public function removeChildToPoolAt(index: Number = 0): void {
			var child: GObject = super.removeChildAt(index);
			this.returnToPool(child);
		}
		
		public function removeChildToPool(child: GObject): void {
			super.removeChild(child);
			this.returnToPool(child);
		}
		
		public function removeChildrenToPool(beginIndex: Number= 0, endIndex: Number= -1): void {
			if (endIndex < 0 || endIndex >= this._children.length)
				endIndex = this._children.length - 1;
			
			for (var i: Number = beginIndex; i <= endIndex; ++i)
				this.removeChildToPoolAt(beginIndex);
		}
		
		public function get selectedIndex():int
		{			
			var i:int;
			if (_virtual)
			{
				for (i = 0; i < _realNumItems; i++)
				{
					var ii:ItemInfo = _virtualItems[i];
					if ((ii.obj is GButton) && GButton(ii.obj).selected
						|| ii.obj == null && ii.selected)
					{
						if (_loop)
							return i % _numItems;
						else
							return i;
					}
				}
			}
			else
			{
				var cnt:int = _children.length;
				for (i = 0; i < cnt; i++)
				{
					var obj:GButton = _children[i].asButton;
					if (obj != null && obj.selected)
						return i;
				}
			}
			
			return -1;
		}
		
		public function set selectedIndex(value: int):void
		{
			if (value >= 0 && value < this.numItems)
			{
				if(_selectionMode!=ListSelectionMode.Single)
					clearSelection();
				addSelection(value);
			}
			else
				clearSelection();
		}
		
		public function getSelection():Vector.<int>
		{
			var ret:Vector.<int> = new Vector.<int>();
			var i:int;
			if (_virtual)
			{
				for (i = 0; i < _realNumItems; i++)
				{
					var ii:ItemInfo = _virtualItems[i];
					if ((ii.obj is GButton) && GButton(ii.obj).selected
						|| ii.obj == null && ii.selected)
					{
						var j:int = i;
						if (_loop)
						{
							j = i % _numItems;
							if (ret.indexOf(j)!=-1)
								continue;
						}
						ret.push(j);
					}
				}
			}
			else
			{
				var cnt:int = _children.length;
				for (i = 0; i < cnt; i++)
				{
					var obj:GButton = _children[i].asButton;
					if (obj != null && obj.selected)
						ret.push(i);
				}
			}
			return ret;
		}
		
		public function addSelection(index:int, scrollItToView:Boolean=false):void
		{
			if(_selectionMode==ListSelectionMode.None)
				return;
			
			checkVirtualList();
			
			if(_selectionMode==ListSelectionMode.Single)
				clearSelection();
			
			if (scrollItToView)
				scrollToView(index);
			
			_lastSelectedIndex = index;
			var obj:GButton = null;
			if (_virtual)
			{
				var ii:ItemInfo = _virtualItems[index];
				if (ii.obj != null)
					obj = ii.obj.asButton;
				ii.selected = true;
			}
			else
				obj = getChildAt(index).asButton;
			
			if (obj != null && !obj.selected)
			{
				obj.selected = true;
				updateSelectionController(index);
			}
		}
		
		public function removeSelection(index:int):void
		{
			if(_selectionMode==ListSelectionMode.None)
				return;
			
			var obj:GButton = null;
			if (_virtual)
			{
				var ii:ItemInfo = _virtualItems[index];
				if (ii.obj != null)
					obj = ii.obj.asButton;
				ii.selected = false;
			}
			else
				obj = getChildAt(index).asButton;
			
			if (obj != null)
				obj.selected = false;
		}
		
		public function clearSelection():void
		{
			var i:int;
			if (_virtual)
			{
				for (i = 0; i < _realNumItems; i++)
				{
					var ii:ItemInfo = _virtualItems[i];
					if (ii.obj is GButton)
						GButton(ii.obj).selected = false;
					ii.selected = false;
				}
			}
			else
			{
				var cnt:int = _children.length;
				for (i = 0; i < cnt; i++)
				{
					var obj:GButton = _children[i].asButton;
					if (obj != null)
						obj.selected = false;
				}
			}
		}
		
		private function clearSelectionExcept(g:GObject):void
		{
			var i:int;
			if (_virtual)
			{
				for (i = 0; i < _realNumItems; i++)
				{
					var ii:ItemInfo = _virtualItems[i];
					if (ii.obj != g)
					{
						if ((ii.obj is GButton))
							GButton(ii.obj).selected = false;
						ii.selected = false;
					}
				}
			}
			else
			{
				var cnt:int = _children.length;
				for (i = 0; i < cnt; i++)
				{
					var obj:GButton = _children[i].asButton;
					if (obj != null && obj != g)
						obj.selected = false;
				}
			}
		}	
		
		public function selectAll():void
		{
			checkVirtualList();
			
			var last:int = -1;
			var i:int;
			if (_virtual)
			{
				for (i = 0; i < _realNumItems; i++)
				{
					var ii:ItemInfo = _virtualItems[i];
					if ((ii.obj is GButton) && !GButton(ii.obj).selected)
					{
						GButton(ii.obj).selected = true;
						last = i;
					}
					ii.selected = true;
				}
			}
			else
			{
				var cnt:int = _children.length;
				for (i = 0; i < cnt; i++)
				{
					var obj:GButton = _children[i].asButton;
					if (obj != null && !obj.selected)
					{
						obj.selected = true;
						last = i;
					}
				}
			}
			
			if(last!=-1)
				updateSelectionController(last);
		}
		
		public function selectNone():void
		{
			clearSelection();
		}
		
		public function selectReverse():void
		{
			checkVirtualList();
			
			var last:int = -1;
			var i:int;
			if (_virtual)
			{
				for (i = 0; i < _realNumItems; i++)
				{
					var ii:ItemInfo = _virtualItems[i];
					if (ii.obj is GButton)
					{
						GButton(ii.obj).selected = !GButton(ii.obj).selected;
						if (GButton(ii.obj).selected)
							last = i;
					}
					ii.selected = !ii.selected;
				}
			}
			else
			{
				var cnt:int = _children.length;
				for (i = 0; i < cnt; i++)
				{
					var obj:GButton = _children[i].asButton;
					if (obj != null)
					{
						obj.selected = !obj.selected;
						if (obj.selected)
							last = i;
					}
				}
			}
			
			if(last!=-1)
				updateSelectionController(last);
		}
		
		public function handleArrowKey(dir: Number = 0): void {
			var index: Number = this.selectedIndex;
			if (index == -1)
				return;
			
			switch (dir) {
				case 1://up
					if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowVertical) {
						index--;
						if (index >= 0) {
							this.clearSelection();
							this.addSelection(index, true);
						}
					}
					else if (_layout == ListLayoutType.FlowHorizontal || _layout == ListLayoutType.Pagination) {
						var current: GObject = this._children[index];
						var k: Number = 0;
						for (var i: Number = index - 1; i >= 0; i--) {
							var obj: GObject = this._children[i];
							if (obj.y != current.y) {
								current = obj;
								break;
							}
							k++;
						}
						for (; i >= 0; i--) {
							obj = this._children[i];
							if (obj.y != current.y) {
								this.clearSelection();
								this.addSelection(i + k + 1, true);
								break;
							}
						}
					}
					break;
				
				case 3://right
					if (_layout == ListLayoutType.SingleRow || _layout == ListLayoutType.FlowHorizontal || _layout == ListLayoutType.Pagination) {
						index++;
						if (index < this._children.length) {
							this.clearSelection();
							this.addSelection(index, true);
						}
					}
					else if (this._layout == ListLayoutType.FlowVertical) {
						current = this._children[index];
						k = 0;
						var cnt: Number = this._children.length;
						for (i = index + 1; i < cnt; i++) {
							obj = this._children[i];
							if (obj.x != current.x) {
								current = obj;
								break;
							}
							k++;
						}
						for (; i < cnt; i++) {
							obj = this._children[i];
							if (obj.x != current.x) {
								this.clearSelection();
								this.addSelection(i - k - 1, true);
								break;
							}
						}
					}
					break;
				
				case 5://down
					if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowVertical) {
						index++;
						if (index < this._children.length) {
							this.clearSelection();
							this.addSelection(index, true);
						}
					}
					else if (_layout == ListLayoutType.FlowHorizontal || _layout == ListLayoutType.Pagination) {
						current = this._children[index];
						k = 0;
						cnt = this._children.length;
						for (i = index + 1; i < cnt; i++) {
							obj = this._children[i];
							if (obj.y != current.y) {
								current = obj;
								break;
							}
							k++;
						}
						for (; i < cnt; i++) {
							obj = this._children[i];
							if (obj.y != current.y) {
								this.clearSelection();
								this.addSelection(i - k - 1, true);
								break;
							}
						}
					}
					break;
				
				case 7://left
					if (_layout == ListLayoutType.SingleRow || _layout == ListLayoutType.FlowHorizontal || _layout == ListLayoutType.Pagination) {
						index--;
						if (index >= 0) {
							this.clearSelection();
							this.addSelection(index, true);
						}
					}
					else if (this._layout == ListLayoutType.FlowVertical) {
						current = this._children[index];
						k = 0;
						for (i = index - 1; i >= 0; i--) {
							obj = this._children[i];
							if (obj.x != current.x) {
								current = obj;
								break;
							}
							k++;
						}
						for (; i >= 0; i--) {
							obj = this._children[i];
							if (obj.x != current.x) {
								this.clearSelection();
								this.addSelection(i + k + 1, true);
								break;
							}
						}
					}
					break;
			}
		}
		
		private function __clickItem(evt:Event): void {
			if (this._scrollPane != null && this._scrollPane.isDragged)
				return;
			
			var item: GObject = GObject.cast(evt.currentTarget);
			this.setSelectionOnEvent(item, evt);
			
			if(this._scrollPane && scrollItemToViewOnClick)
				this._scrollPane.scrollToView(item,true);
			
			this.displayObject.event(Events.CLICK_ITEM, [item, Events.createEvent(Events.CLICK_ITEM, this.displayObject,evt)]);
		}
		
		private function setSelectionOnEvent(item: GObject, evt:Event): void {
			if (!(item is GButton) || this._selectionMode == ListSelectionMode.None)
				return;
			
			var dontChangeLastIndex: Boolean = false;
			var button: GButton = GButton(item);
			var index: int = childIndexToItemIndex(this.getChildIndex(item));
			
			if (this._selectionMode == ListSelectionMode.Single) {
				if (!button.selected) {
					this.clearSelectionExcept(button);
					button.selected = true;
				}
			}
			else {
				if (evt.shiftKey) {
					if (!button.selected) {
						if (this._lastSelectedIndex != -1) {
							var min:int = Math.min(_lastSelectedIndex, index);
							var max:int = Math.max(_lastSelectedIndex, index);
							max = Math.min(max, this.numItems-1);
							var i:int;
							if (_virtual)
							{
								for (i = min; i <= max; i++)
								{
									var ii:ItemInfo = _virtualItems[i];
									if (ii.obj is GButton)
										GButton(ii.obj).selected = true;
									ii.selected = true;
								}
							}
							else
							{
								for(i=min;i<=max;i++)
								{
									var obj:GButton = getChildAt(i).asButton;
									if(obj!=null)
										obj.selected = true;
								}
							}
							
							dontChangeLastIndex = true;
						}
						else {
							button.selected = true;
						}
					}
				}
				else if (evt.ctrlKey || this._selectionMode == ListSelectionMode.Multiple_SingleClick) {
					button.selected = !button.selected;
				}
				else {
					if (!button.selected) {
						this.clearSelectionExcept(button);
						button.selected = true;
					}
					else
						this.clearSelectionExcept(button);
				}
			}
			
			if (!dontChangeLastIndex)
				this._lastSelectedIndex = index;
			
			if(button.selected)
				updateSelectionController(index);
		}
		
		public function resizeToFit(itemCount: Number = 1000000, minSize: Number = 0): void {
			this.ensureBoundsCorrect();
			
			var curCount: Number = this.numItems;
			if (itemCount > curCount)
				itemCount = curCount;
			
			if(this._virtual) {
				var lineCount: Number = Math.ceil(itemCount / this._curLineItemCount);
				if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
					this.viewHeight = lineCount * this._itemSize.y + Math.max(0,lineCount - 1) * this._lineGap;
				else
					this.viewWidth = lineCount * this._itemSize.x + Math.max(0,lineCount - 1) * this._columnGap;
			}
			else if(itemCount == 0) {
				if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
					this.viewHeight = minSize;
				else
					this.viewWidth = minSize;
			}
			else {
				var i: Number = itemCount - 1;
				var obj: GObject = null;
				while (i >= 0) {
					obj = this.getChildAt(i);
					if (!foldInvisibleItems || obj.visible)
						break;
					i--;
				}
				if (i < 0) {
					if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
						this.viewHeight = minSize;
					else
						this.viewWidth = minSize;
				}
				else {
					var size: Number = 0;
					if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
						size = obj.y + obj.height;
						if (size < minSize)
							size = minSize;
						this.viewHeight = size;
					}
					else {
						size = obj.x + obj.width;
						if (size < minSize)
							size = minSize;
						this.viewWidth = size;
					}
				}
			}
		}
		
		public function getMaxItemWidth(): Number {
			var cnt: Number = this._children.length;
			var max: Number = 0;
			for (var i: Number = 0; i < cnt; i++) {
				var child: GObject = this.getChildAt(i);
				if (child.width > max)
					max = child.width;
			}
			return max;
		}
		
		override protected function handleSizeChanged(): void {
			super.handleSizeChanged();

			this.setBoundsChangedFlag();
			if (this._virtual)
				this.setVirtualListChangedFlag(true);
		}
		
		override public function handleControllerChanged(c:Controller):void
		{
			super.handleControllerChanged(c);
			
			if (_selectionController == c)
				this.selectedIndex = c.selectedIndex;
		}
		
		private function updateSelectionController(index:int):void
		{
			if (_selectionController != null && !_selectionController.changing
				&& index < _selectionController.pageCount)
			{
				var c:Controller = _selectionController;
				_selectionController = null;
				c.selectedIndex = index;
				_selectionController = c;
			}
		}
		
		override public function getSnappingPosition(xValue:Number, yValue:Number, resultPoint:Point=null):Point
		{
			if (_virtual)
			{
				if(!resultPoint)
					resultPoint = new Point();
				
				var saved:Number;
				var index:int;
				if (_layout == ListLayoutType.SingleColumn || _layout == ListLayoutType.FlowHorizontal)
				{
					saved = yValue;
					GList.pos_param = yValue;
					index = getIndexOnPos1(false);
					yValue = GList.pos_param;
					if (index < _virtualItems.length && saved - yValue > _virtualItems[index].height / 2 && index < _realNumItems)
						yValue += _virtualItems[index].height + _lineGap;
				}
				else if (_layout == ListLayoutType.SingleRow || _layout == ListLayoutType.FlowVertical)
				{
					saved = xValue;
					GList.pos_param = xValue;
					index = getIndexOnPos2(false);
					xValue = GList.pos_param;
					if (index < _virtualItems.length && saved - xValue > _virtualItems[index].width / 2 && index < _realNumItems)
						xValue += _virtualItems[index].width + _columnGap;
				}
				else
				{
					saved = xValue;
					GList.pos_param = xValue;
					index = getIndexOnPos3(false);
					xValue = GList.pos_param;
					if (index < _virtualItems.length && saved - xValue > _virtualItems[index].width / 2 && index < _realNumItems)
						xValue += _virtualItems[index].width + _columnGap;
				}
				
				resultPoint.x = xValue;
				resultPoint.y = yValue;
				return resultPoint;
			}
			else
				return super.getSnappingPosition(xValue, yValue, resultPoint);
		}
		
		public function scrollToView(index:int, ani:Boolean=false, setFirst:Boolean=false):void
		{
			if (_virtual)
			{
				if(_numItems==0)
					return;
				
				checkVirtualList();
				
				if (index >= _virtualItems.length)
					throw new Error("Invalid child index: " + index + ">" + _virtualItems.length);
				
				if(_loop)
					index = Math.floor(_firstIndex/_numItems)*_numItems+index;
				
				var rect:Rectangle;
				var ii:ItemInfo = _virtualItems[index];
				var pos:Number = 0;
				var i:int;
				if (_layout == ListLayoutType.SingleColumn || _layout == ListLayoutType.FlowHorizontal)
				{
					for (i = _curLineItemCount-1; i < index; i += _curLineItemCount)
						pos += _virtualItems[i].height + _lineGap;
					rect = new Rectangle(0, pos, _itemSize.x, ii.height);
				}
				else if (_layout == ListLayoutType.SingleRow || _layout == ListLayoutType.FlowVertical)
				{
					for (i = _curLineItemCount-1; i < index; i += _curLineItemCount)
						pos += _virtualItems[i].width + _columnGap;
					rect = new Rectangle(pos, 0, ii.width, _itemSize.y);
				}
				else
				{
					var page:int = index / (_curLineItemCount * _curLineItemCount2);
					rect = new Rectangle(page * viewWidth + (index % _curLineItemCount) * (ii.width + _columnGap),
						(index / _curLineItemCount) % _curLineItemCount2 * (ii.height + _lineGap),
						ii.width, ii.height);
				}
				
				setFirst = true;//因为在可变item大小的情况下，只有设置在最顶端，位置才不会因为高度变化而改变，所以只能支持setFirst=true
				if (_scrollPane != null)
					_scrollPane.scrollToView(rect, ani, setFirst);
			}
			else
			{
				var obj:GObject = getChildAt(index);
				if (_scrollPane != null)
					_scrollPane.scrollToView(obj, ani, setFirst);
				else if (parent != null && parent.scrollPane != null)
					parent.scrollPane.scrollToView(obj, ani, setFirst);
			}
		}
		
		override public function getFirstChildInView():int
		{
			return childIndexToItemIndex(super.getFirstChildInView());
		}
		
		public function childIndexToItemIndex(index:int):int
		{
			if (!_virtual)
				return index;
			
			if (_layout == ListLayoutType.Pagination)
			{
				for (var i:int = _firstIndex; i < _realNumItems; i++)
				{
					if (_virtualItems[i].obj != null)
					{
						index--;
						if (index < 0)
							return i;
					}
				}
				
				return index;
			}
			else
			{
				index += _firstIndex;
				if (_loop && _numItems > 0)
					index = index % _numItems;
				
				return index;
			}
		}
		
		public function itemIndexToChildIndex(index:int):int
		{
			if (!_virtual)
				return index;
			
			if (_layout == ListLayoutType.Pagination)
			{
				return getChildIndex(_virtualItems[index].obj);
			}
			else
			{
				if (_loop && _numItems > 0)
				{
					var j:int = _firstIndex % _numItems;
					if (index >= j)
						index = index - j;
					else
						index = _numItems - j + index;
				}
				else
					index -= _firstIndex;
				
				return index;
			}
		}
		
		public function setVirtual(): void {
			this._setVirtual(false);
		}
		
		/**
		 * Set the list to be virtual list, and has loop behavior.
		 */
		public function setVirtualAndLoop(): void {
			this._setVirtual(true);
		}
		
		private function _setVirtual(loop: Boolean): void {
			if(!this._virtual) {
				if(this._scrollPane == null)
					throw new Error("Virtual list must be scrollable!");
				
				if(loop) {        
					if(this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.FlowVertical)
						throw new Error("Loop list is not supported for FlowHorizontal or FlowVertical layout!");
					
					this._scrollPane.bouncebackEffect = false;
				}
				
				this._virtual = true;
				this._loop = loop;
				this._virtualItems = new Vector.<ItemInfo>();
				this.removeChildrenToPool();
				
				if(this._itemSize==null) {
					this._itemSize = new Point();
					var obj: GObject = this.getFromPool(null);
					if (obj == null)
					{
						throw new Error("Virtual List must have a default list item resource.");
					}
					else
					{
						this._itemSize.x = obj.width;
						this._itemSize.y = obj.height;
					}
					this.returnToPool(obj);
				}
				
				if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
				{
					this._scrollPane.scrollStep = this._itemSize.y;
					if(_loop)
						this._scrollPane._loop = 2;
				}
				else
				{
					this._scrollPane.scrollStep = this._itemSize.x;
					if(_loop)
						this._scrollPane._loop = 1;
				}
				
				this.on(Events.SCROLL, this, this.__scrolled);
				this.setVirtualListChangedFlag(true);
			}
		}
		
		/**
		 * Set the list item count. 
		 * If the list is not virtual, specified Number of items will be created. 
		 * If the list is virtual, only items in view will be created.
		 */
		public function get numItems():int
		{
			if(this._virtual)
				return this._numItems;
			else
				return this._children.length;
		}
		
		public function set numItems(value:int):void
		{
			var i:int;
			
			if (_virtual)
			{
				if (itemRenderer == null)
					throw new Error("Set itemRenderer first!");
				
				_numItems = value;
				if (_loop)
					_realNumItems = _numItems * 6;//设置6倍数量，用于循环滚动
				else
					_realNumItems = _numItems;
				
				//_virtualItems的设计是只增不减的
				var oldCount:int = _virtualItems.length;
				if (_realNumItems > oldCount)
				{
					for (i = oldCount; i < _realNumItems; i++)
					{
						var ii:ItemInfo = new ItemInfo();
						ii.width = _itemSize.x;
						ii.height = _itemSize.y;
						
						_virtualItems.push(ii);
					}
				}
				else
				{
					for (i = _realNumItems; i < oldCount; i++)
						_virtualItems[i].selected = false;
				}
				
				if (this._virtualListChanged != 0)
					Laya.timer.clear(this, this._refreshVirtualList);
				
				//立即刷新
				_refreshVirtualList();
			}
			else
			{
				var cnt:int = _children.length;
				if (value > cnt)
				{
					for (i = cnt; i < value; i++)
					{
						if (itemProvider == null)
							addItemFromPool();
						else
							addItemFromPool(itemProvider.runWith(i));
					}
				}
				else
				{
					removeChildrenToPool(value, cnt);
				}
				
				if (itemRenderer != null)
				{
					for (i = 0; i < value; i++)
						itemRenderer.runWith([i, getChildAt(i)]);
				}
			}
		}
		
		public function refreshVirtualList():void
		{
			this.setVirtualListChangedFlag(false);
		}
		
		private function checkVirtualList():void
		{
			if(this._virtualListChanged!=0) { 
				this._refreshVirtualList();
				Laya.timer.clear(this, this._refreshVirtualList);
			}
		}
		
		private function setVirtualListChangedFlag(layoutChanged:Boolean = false):void {
			if(layoutChanged)
				this._virtualListChanged = 2;
			else if(this._virtualListChanged == 0)
				this._virtualListChanged = 1;
			
			Laya.timer.callLater(this, this._refreshVirtualList);
		}
		
		private function _refreshVirtualList():void
		{
			var layoutChanged:Boolean = _virtualListChanged == 2;
			_virtualListChanged = 0;
			_eventLocked = true;
			
			if (layoutChanged)
			{
				if (_layout == ListLayoutType.SingleColumn || _layout == ListLayoutType.SingleRow)
					_curLineItemCount = 1;
				else if (_layout == ListLayoutType.FlowHorizontal)
				{
					if (_columnCount > 0)
						_curLineItemCount = _columnCount;
					else
					{
						_curLineItemCount = Math.floor((_scrollPane.viewWidth + _columnGap) / (_itemSize.x + _columnGap));
						if (_curLineItemCount <= 0)
							_curLineItemCount = 1;
					}
				}
				else if (_layout == ListLayoutType.FlowVertical)
				{
					if (_lineCount > 0)
						_curLineItemCount = _lineCount;
					else
					{
						_curLineItemCount = Math.floor((_scrollPane.viewHeight + _lineGap) / (_itemSize.y + _lineGap));
						if (_curLineItemCount <= 0)
							_curLineItemCount = 1;
					}
				}
				else //pagination
				{
					if (_columnCount > 0)
						_curLineItemCount = _columnCount;
					else
					{
						_curLineItemCount = Math.floor((_scrollPane.viewWidth + _columnGap) / (_itemSize.x + _columnGap));
						if (_curLineItemCount <= 0)
							_curLineItemCount = 1;
					}
					
					if (_lineCount > 0)
						_curLineItemCount2 = _lineCount;
					else
					{
						_curLineItemCount2 = Math.floor((_scrollPane.viewHeight + _lineGap) / (_itemSize.y + _lineGap));
						if (_curLineItemCount2 <= 0)
							_curLineItemCount2 = 1;
					}
				}
			}
			
			var ch:Number = 0, cw:Number = 0;
			if (_realNumItems > 0)
			{
				var i:int;
				var len:int = Math.ceil(_realNumItems / _curLineItemCount) * _curLineItemCount;
				var len2:int = Math.min(_curLineItemCount, _realNumItems);
				if (_layout == ListLayoutType.SingleColumn || _layout == ListLayoutType.FlowHorizontal)
				{
					for (i = 0; i < len; i += _curLineItemCount)
						ch += _virtualItems[i].height + _lineGap;
					if (ch > 0)
						ch -= _lineGap;
					
					if (_autoResizeItem)
						cw = _scrollPane.viewWidth;
					else
					{
						for (i = 0; i < len2; i++)
							cw += _virtualItems[i].width + _columnGap;
						if (cw > 0)
							cw -= _columnGap;
					}
				}
				else if (_layout == ListLayoutType.SingleRow || _layout == ListLayoutType.FlowVertical)
				{
					for (i = 0; i < len; i += _curLineItemCount)
						cw += _virtualItems[i].width + _columnGap;
					if (cw > 0)
						cw -= _columnGap;
					
					if (_autoResizeItem)
						ch = _scrollPane.viewHeight;
					else
					{
						for (i = 0; i < len2; i++)
							ch += _virtualItems[i].height + _lineGap;
						if (ch > 0)
							ch -= _lineGap;
					}
				}
				else
				{
					var pageCount:int = Math.ceil(len / (_curLineItemCount * _curLineItemCount2));
					cw = pageCount * viewWidth;
					ch = viewHeight;
				}
			}
			
			handleAlign(cw, ch);
			_scrollPane.setContentSize(cw, ch);
			
			_eventLocked = false;
			
			handleScroll(true);
		}
		
		private function __scrolled(evt:Event):void
		{
			handleScroll(false);
		}
		
		private function getIndexOnPos1(forceUpdate:Boolean):int
		{
			if (_realNumItems < _curLineItemCount)
			{
				pos_param = 0;
				return 0;
			}
			
			var i:int;
			var pos2:Number;
			var pos3:Number;
			
			if (numChildren > 0 && !forceUpdate)
			{
				pos2 = this.getChildAt(0).y;
				if (pos2 > pos_param)
				{
					for (i = _firstIndex - _curLineItemCount; i >= 0; i -= _curLineItemCount)
					{
						pos2 -= (_virtualItems[i].height + _lineGap);
						if (pos2 <= pos_param)
						{
							pos_param = pos2;
							return i;
						}
					}
					
					pos_param = 0;
					return 0;
				}
				else
				{
					for (i = _firstIndex; i < _realNumItems; i += _curLineItemCount)
					{
						pos3 = pos2 + _virtualItems[i].height + _lineGap;
						if (pos3 > pos_param)
						{
							pos_param = pos2;
							return i;
						}
						pos2 = pos3;
					}
					
					pos_param = pos2;
					return _realNumItems - _curLineItemCount;
				}
			}
			else
			{
				pos2 = 0;
				for (i = 0; i < _realNumItems; i += _curLineItemCount)
				{
					pos3 = pos2 + _virtualItems[i].height + _lineGap;
					if (pos3 > pos_param)
					{
						pos_param = pos2;
						return i;
					}
					pos2 = pos3;
				}
				
				pos_param = pos2;
				return _realNumItems - _curLineItemCount;
			}
		}
		
		private function getIndexOnPos2(forceUpdate:Boolean):int
		{
			if (_realNumItems < _curLineItemCount)
			{
				pos_param = 0;
				return 0;
			}
			
			var i:int;
			var pos2:Number;
			var pos3:Number;
			
			if (numChildren > 0 && !forceUpdate)
			{
				pos2 = this.getChildAt(0).x;
				if (pos2 > pos_param)
				{
					for (i = _firstIndex - _curLineItemCount; i >= 0; i -= _curLineItemCount)
					{
						pos2 -= (_virtualItems[i].width + _columnGap);
						if (pos2 <= pos_param)
						{
							pos_param = pos2;
							return i;
						}
					}
					
					pos_param = 0;
					return 0;
				}
				else
				{
					for (i = _firstIndex; i < _realNumItems; i += _curLineItemCount)
					{
						pos3 = pos2 + _virtualItems[i].width + _columnGap;
						if (pos3 > pos_param)
						{
							pos_param = pos2;
							return i;
						}
						pos2 = pos3;
					}
					
					pos_param = pos2;
					return _realNumItems - _curLineItemCount;
				}
			}
			else
			{
				pos2 = 0;
				for (i = 0; i < _realNumItems; i += _curLineItemCount)
				{
					pos3 = pos2 + _virtualItems[i].width + _columnGap;
					if (pos3 > pos_param)
					{
						pos_param = pos2;
						return i;
					}
					pos2 = pos3;
				}
				
				pos_param = pos2;
				return _realNumItems - _curLineItemCount;
			}
		}
		
		private function getIndexOnPos3(forceUpdate:Boolean):int
		{
			if (_realNumItems < _curLineItemCount)
			{
				pos_param = 0;
				return 0;
			}
			
			var viewWidth:Number = this.viewWidth;
			var page:int = Math.floor(pos_param / viewWidth);
			var startIndex:int = page * (_curLineItemCount * _curLineItemCount2);
			var pos2:Number = page * viewWidth;
			var i:int;
			var pos3:Number;
			for (i = 0; i < _curLineItemCount; i++)
			{
				pos3 = pos2 + _virtualItems[startIndex + i].width + _columnGap;
				if (pos3 > pos_param)
				{
					pos_param = pos2;
					return startIndex + i;
				}
				pos2 = pos3;
			}
			
			pos_param = pos2;
			return startIndex + _curLineItemCount - 1;
		}
		
		private function handleScroll(forceUpdate:Boolean):void
		{
			if (_eventLocked)
				return;
			
			if (_layout == ListLayoutType.SingleColumn || _layout == ListLayoutType.FlowHorizontal)
			{
				var enterCounter:int = 0;
				while(handleScroll1(forceUpdate))
				{
					enterCounter++;
					forceUpdate = false;
					if(enterCounter>20)
					{
						trace("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
						break;
					}
				}
				handleArchOrder1();
			}
			else if (_layout == ListLayoutType.SingleRow || _layout == ListLayoutType.FlowVertical)
			{
				enterCounter = 0;
				while(handleScroll2(forceUpdate))
				{
					enterCounter++;
					forceUpdate = false;
					if(enterCounter>20)
					{
						trace("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
						break;
					}
				}
				handleArchOrder2();
			}
			else
			{
				handleScroll3(forceUpdate);
			}
			
			_boundsChanged = false;
		}

		private static var pos_param:Number;
		
		private function handleScroll1(forceUpdate:Boolean):Boolean
		{
			var pos:Number = _scrollPane.scrollingPosY;
			var max:Number = pos + _scrollPane.viewHeight;
			var end:Boolean = max == _scrollPane.contentHeight;//这个标志表示当前需要滚动到最末，无论内容变化大小
			
			//寻找当前位置的第一条项目
			GList.pos_param = pos;
			var newFirstIndex:int = getIndexOnPos1(forceUpdate);
			pos = GList.pos_param;
			if (newFirstIndex == _firstIndex && !forceUpdate)
				return false;
			
			var oldFirstIndex:int = _firstIndex;
			_firstIndex = newFirstIndex;
			var curIndex:int = newFirstIndex;
			var forward:Boolean = oldFirstIndex > newFirstIndex;
			var childCount:int = this.numChildren;
			var lastIndex:int = oldFirstIndex + childCount - 1;
			var reuseIndex:int = forward ? lastIndex : oldFirstIndex;
			var curX:Number = 0, curY:Number = pos;
			var needRender:Boolean;
			var deltaSize:Number = 0;
			var firstItemDeltaSize:Number = 0;
			var url:String = defaultItem;
			var ii:ItemInfo, ii2:ItemInfo;
			var i:int,j:int;
			var partSize:int = (_scrollPane.viewWidth - _columnGap * (_curLineItemCount - 1)) / _curLineItemCount;

			itemInfoVer++;
			
			while (curIndex < _realNumItems && (end || curY < max))
			{
				ii = _virtualItems[curIndex];
				
				if (ii.obj == null || forceUpdate)
				{
					if (itemProvider != null)
					{
						url = itemProvider.runWith(curIndex % _numItems);
						if (url == null)
							url = _defaultItem;
						url = UIPackage.normalizeURL(url);
					}
					
					if (ii.obj != null && ii.obj.resourceURL != url)
					{
						if (ii.obj is GButton)
							ii.selected = GButton(ii.obj).selected;
						removeChildToPool(ii.obj);
						ii.obj = null;
					}
				}
				
				if (ii.obj == null)
				{
					//搜索最适合的重用item，保证每次刷新需要新建或者重新render的item最少
					if (forward)
					{
						for (j = reuseIndex; j >= oldFirstIndex; j--)
						{
							ii2 = _virtualItems[j];
							if (ii2.obj != null && ii2.updateFlag != itemInfoVer && ii2.obj.resourceURL == url)
							{
								if (ii2.obj is GButton)
									ii2.selected = GButton(ii2.obj).selected;
								ii.obj = ii2.obj;
								ii2.obj = null;
								if (j == reuseIndex)
									reuseIndex--;
								break;
							}
						}
					}
					else
					{
						for (j = reuseIndex; j <= lastIndex; j++)
						{
							ii2 = _virtualItems[j];
							if (ii2.obj != null && ii2.updateFlag != itemInfoVer && ii2.obj.resourceURL == url)
							{
								if (ii2.obj is GButton)
									ii2.selected = GButton(ii2.obj).selected;
								ii.obj = ii2.obj;
								ii2.obj = null;
								if (j == reuseIndex)
									reuseIndex++;
								break;
							}
						}
					}
					
					if (ii.obj != null)
					{
						setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : numChildren);
					}
					else
					{
						ii.obj = _pool.getObject(url);
						if (forward)
							this.addChildAt(ii.obj, curIndex - newFirstIndex);
						else
							this.addChild(ii.obj);
					}
					if (ii.obj is GButton)
						GButton(ii.obj).selected = ii.selected;
					
					needRender = true;
				}
				else
					needRender = forceUpdate;
				
				if (needRender)
				{
					if (_autoResizeItem && (_layout == ListLayoutType.SingleColumn || _columnCount > 0))
						ii.obj.setSize(partSize, ii.obj.height, true);

					itemRenderer.runWith([curIndex % _numItems, ii.obj]);
					if (curIndex % _curLineItemCount == 0)
					{
						deltaSize += Math.ceil(ii.obj.height) - ii.height;
						if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex)
						{
							//当内容向下滚动时，如果新出现的项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
							firstItemDeltaSize = Math.ceil(ii.obj.height) - ii.height;
						}
					}
					ii.width = Math.ceil(ii.obj.width);
					ii.height = Math.ceil(ii.obj.height);
				}
				
				ii.updateFlag = itemInfoVer;
				ii.obj.setXY(curX, curY);
				if (curIndex == newFirstIndex) //要显示多一条才不会穿帮
					max += ii.height;
				
				curX += ii.width + _columnGap;
				
				if (curIndex % _curLineItemCount == _curLineItemCount - 1)
				{
					curX = 0;
					curY += ii.height + _lineGap;
				}
				curIndex++;
			}
			
			for (i = 0; i < childCount; i++)
			{
				ii = _virtualItems[oldFirstIndex + i];
				if (ii.updateFlag != itemInfoVer && ii.obj != null)
				{
					if (ii.obj is GButton)
						ii.selected = GButton(ii.obj).selected;
					removeChildToPool(ii.obj);
					ii.obj = null;
				}
			}
			
			childCount = _children.length;
			for (i = 0; i < childCount; i++)
			{
				var obj:GObject = _virtualItems[newFirstIndex + i].obj;
				if (_children[i] != obj)
					setChildIndex(obj, i);
			}
			
			if (deltaSize != 0 || firstItemDeltaSize != 0)
				_scrollPane.changeContentSizeOnScrolling(0, deltaSize, 0, firstItemDeltaSize);
			
			if (curIndex > 0 && this.numChildren > 0 && _container.y < 0 && getChildAt(0).y > -_container.y)//最后一页没填满！
				return true;
			else
				return false;
		}
		
		private function handleScroll2(forceUpdate:Boolean):Boolean
		{
			var pos:Number = _scrollPane.scrollingPosX;
			var max:Number = pos + _scrollPane.viewWidth;
			var end:Boolean = pos == _scrollPane.contentWidth;//这个标志表示当前需要滚动到最末，无论内容变化大小
			
			//寻找当前位置的第一条项目
			GList.pos_param = pos;
			var newFirstIndex:int = getIndexOnPos2(forceUpdate);
			pos = GList.pos_param;
			if (newFirstIndex == _firstIndex && !forceUpdate)
				return false;

			var oldFirstIndex:int = _firstIndex;
			_firstIndex = newFirstIndex;
			var curIndex:int = newFirstIndex;
			var forward:Boolean = oldFirstIndex > newFirstIndex;
			var childCount:int = this.numChildren;
			var lastIndex:int = oldFirstIndex + childCount - 1;
			var reuseIndex:int = forward ? lastIndex : oldFirstIndex;
			var curX:Number = pos, curY:Number = 0;
			var needRender:Boolean;
			var deltaSize:Number = 0;
			var firstItemDeltaSize:Number  = 0;
			var url:String = defaultItem;
			var ii:ItemInfo, ii2:ItemInfo;
			var i:int,j:int;
			var partSize:int = (_scrollPane.viewHeight - _lineGap * (_curLineItemCount - 1)) / _curLineItemCount;

			itemInfoVer++;
			
			while (curIndex < _realNumItems && (end || curX < max))
			{
				ii = _virtualItems[curIndex];
				
				if (ii.obj == null || forceUpdate)
				{
					if (itemProvider != null)
					{
						url = itemProvider.runWith(curIndex % _numItems);
						if (url == null)
							url = _defaultItem;
						url = UIPackage.normalizeURL(url);
					}
					
					if (ii.obj != null && ii.obj.resourceURL != url)
					{
						if (ii.obj is GButton)
							ii.selected = GButton(ii.obj).selected;
						removeChildToPool(ii.obj);
						ii.obj = null;
					}
				}
				
				if (ii.obj == null)
				{
					if (forward)
					{
						for (j = reuseIndex; j >= oldFirstIndex; j--)
						{
							ii2 = _virtualItems[j];
							if (ii2.obj != null && ii2.updateFlag != itemInfoVer && ii2.obj.resourceURL == url)
							{
								if (ii2.obj is GButton)
									ii2.selected = GButton(ii2.obj).selected;
								ii.obj = ii2.obj;
								ii2.obj = null;
								if (j == reuseIndex)
									reuseIndex--;
								break;
							}
						}
					}
					else
					{
						for (j = reuseIndex; j <= lastIndex; j++)
						{
							ii2 = _virtualItems[j];
							if (ii2.obj != null && ii2.updateFlag != itemInfoVer && ii2.obj.resourceURL == url)
							{
								if (ii2.obj is GButton)
									ii2.selected = GButton(ii2.obj).selected;
								ii.obj = ii2.obj;
								ii2.obj = null;
								if (j == reuseIndex)
									reuseIndex++;
								break;
							}
						}
					}
					
					if (ii.obj != null)
					{
						setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : numChildren);
					}
					else
					{
						ii.obj = _pool.getObject(url);
						if (forward)
							this.addChildAt(ii.obj, curIndex - newFirstIndex);
						else
							this.addChild(ii.obj);
					}
					if (ii.obj is GButton)
						GButton(ii.obj).selected = ii.selected;
					
					needRender = true;
				}
				else
					needRender = forceUpdate;
				
				if (needRender)
				{
					if (_autoResizeItem && (_layout == ListLayoutType.SingleRow || _lineCount > 0))
						ii.obj.setSize(ii.obj.width, partSize, true);
					
					itemRenderer.runWith([curIndex % _numItems, ii.obj]);
					if (curIndex % _curLineItemCount == 0)
					{
						deltaSize += Math.ceil(ii.obj.width) - ii.width;
						if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex)
						{
							//当内容向下滚动时，如果新出现的一个项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
							firstItemDeltaSize = Math.ceil(ii.obj.width) - ii.width;
						}
					}
					ii.width = Math.ceil(ii.obj.width);
					ii.height = Math.ceil(ii.obj.height);
				}
				
				ii.updateFlag = itemInfoVer;
				ii.obj.setXY(curX, curY);
				if (curIndex == newFirstIndex) //要显示多一条才不会穿帮
					max += ii.width;
				
				curY += ii.height + _lineGap;
				
				if (curIndex % _curLineItemCount == _curLineItemCount - 1)
				{
					curY = 0;
					curX += ii.width + _columnGap;
				}
				curIndex++;
			}
			
			for (i = 0; i < childCount; i++)
			{
				ii = _virtualItems[oldFirstIndex + i];
				if (ii.updateFlag != itemInfoVer && ii.obj != null)
				{
					if (ii.obj is GButton)
						ii.selected = GButton(ii.obj).selected;
					removeChildToPool(ii.obj);
					ii.obj = null;
				}
			}
			
			childCount = _children.length;
			for (i = 0; i < childCount; i++)
			{
				var obj:GObject = _virtualItems[newFirstIndex + i].obj;
				if (_children[i] != obj)
					setChildIndex(obj, i);
			}
			
			if (deltaSize != 0 || firstItemDeltaSize != 0)
				_scrollPane.changeContentSizeOnScrolling(deltaSize, 0, firstItemDeltaSize, 0);
			
			if (curIndex > 0 && this.numChildren > 0 && _container.x < 0 && getChildAt(0).x > - _container.x)//最后一页没填满！
				return true;
			else
				return false;
		}
		
		private function handleScroll3(forceUpdate:Boolean):void
		{
			var pos:Number = _scrollPane.scrollingPosX;
			
			//寻找当前位置的第一条项目
			GList.pos_param = pos;
			var newFirstIndex:int = getIndexOnPos3(forceUpdate);
			pos = GList.pos_param;
			if (newFirstIndex == _firstIndex && !forceUpdate)
				return;
			
			var oldFirstIndex:int = _firstIndex;
			_firstIndex = newFirstIndex;
			
			//分页模式不支持不等高，所以渲染满一页就好了
			
			var reuseIndex:int = oldFirstIndex;
			var virtualItemCount:int = _virtualItems.length;
			var pageSize:int = _curLineItemCount * _curLineItemCount2;
			var startCol:int = newFirstIndex % _curLineItemCount;
			var viewWidth:Number = this.viewWidth;
			var page:int = Math.floor(newFirstIndex / pageSize);
			var startIndex:int = page * pageSize;
			var lastIndex:int = startIndex + pageSize * 2; //测试两页
			var needRender:Boolean;
			var i:int;
			var ii:ItemInfo, ii2:ItemInfo;
			var col:int;
			var url:String = _defaultItem;
			var partWidth:int = (_scrollPane.viewWidth - _columnGap * (_curLineItemCount - 1)) / _curLineItemCount;
			var partHeight:int = (_scrollPane.viewHeight - _lineGap * (_curLineItemCount2 - 1)) / _curLineItemCount2;
			
			itemInfoVer++;
			
			//先标记这次要用到的项目
			for (i = startIndex; i < lastIndex; i++)
			{
				if (i >= _realNumItems)
					continue;
				
				col = i % _curLineItemCount;
				if (i - startIndex < pageSize)
				{
					if (col < startCol)
						continue;
				}
				else
				{
					if (col > startCol)
						continue;
				}
				
				ii = _virtualItems[i];
				ii.updateFlag = itemInfoVer;
			}
			
			var lastObj:GObject = null;
			var insertIndex:int = 0;
			for (i = startIndex; i < lastIndex; i++)
			{			
				if (i >= _realNumItems)
					continue;
				
				ii = _virtualItems[i];
				if (ii.updateFlag != itemInfoVer)
					continue;
				
				if (ii.obj == null)
				{
					//寻找看有没有可重用的
					while (reuseIndex < virtualItemCount)
					{
						ii2 = _virtualItems[reuseIndex];
						if (ii2.obj != null && ii2.updateFlag != itemInfoVer)
						{
							if (ii2.obj is GButton)
								ii2.selected = GButton(ii2.obj).selected;
							ii.obj = ii2.obj;
							ii2.obj = null;
							break;
						}
						reuseIndex++;
					}
					
					if (insertIndex == -1)
						insertIndex = getChildIndex(lastObj) + 1;
					
					if (ii.obj == null)
					{
						if (itemProvider != null)
						{
							url = itemProvider.runWith(i % _numItems);
							if (url == null)
								url = _defaultItem;
							url = UIPackage.normalizeURL(url);
						}
						
						ii.obj = _pool.getObject(url);
						this.addChildAt(ii.obj, insertIndex);
					}
					else
					{
						insertIndex = setChildIndexBefore(ii.obj, insertIndex);
					}
					insertIndex++;
					
					if (ii.obj is GButton)
						GButton(ii.obj).selected = ii.selected;
					
					needRender = true;
				}
				else
				{
					needRender = forceUpdate;
					insertIndex = -1;
					lastObj = ii.obj;
				}
				
				if (needRender)
				{
					if (_autoResizeItem)
					{
						if (_curLineItemCount == _columnCount && _curLineItemCount2 == _lineCount)
							ii.obj.setSize(partWidth, partHeight, true);
						else if (_curLineItemCount == _columnCount)
							ii.obj.setSize(partWidth, ii.obj.height, true);
						else if (_curLineItemCount2 == _lineCount)
							ii.obj.setSize(ii.obj.width, partHeight, true);
					}
					
					itemRenderer.runWith([i % _numItems, ii.obj]);
					ii.width = Math.ceil(ii.obj.width);
					ii.height = Math.ceil(ii.obj.height);
				}
			}
			
			//排列item
			var borderX:int = (startIndex / pageSize) * viewWidth;
			var xx:int = borderX;
			var yy:int = 0;
			var lineHeight:int = 0;
			for (i = startIndex; i < lastIndex; i++)
			{
				if (i >= _realNumItems)
					continue;
				
				ii = _virtualItems[i];
				if (ii.updateFlag == itemInfoVer)
					ii.obj.setXY(xx, yy);
				
				if (ii.height > lineHeight)
					lineHeight = ii.height;
				if (i % _curLineItemCount == _curLineItemCount - 1)
				{
					xx = borderX;
					yy += lineHeight + _lineGap;
					lineHeight = 0;
					
					if (i == startIndex + pageSize - 1)
					{
						borderX += viewWidth;
						xx = borderX;
						yy = 0;
					}
				}
				else
					xx += ii.width + _columnGap;
			}
			
			//释放未使用的
			for (i = reuseIndex; i < virtualItemCount; i++)
			{
				ii = _virtualItems[i];
				if (ii.updateFlag != itemInfoVer && ii.obj != null)
				{
					if (ii.obj is GButton)
						ii.selected = GButton(ii.obj).selected;
					removeChildToPool(ii.obj);
					ii.obj = null;
				}
			}
		}
		
		private function handleArchOrder1():void
		{
			if (this.childrenRenderOrder == ChildrenRenderOrder.Arch)
			{
				var mid:Number = _scrollPane.posY + this.viewHeight / 2;
				var minDist:Number = Number.POSITIVE_INFINITY;
				var dist:Number = 0;
				var apexIndex:int = 0;
				var cnt:int = this.numChildren;
				for (var i:int = 0; i < cnt; i++)
				{
					var obj:GObject = getChildAt(i);
					if (!foldInvisibleItems || obj.visible)
					{
						dist = Math.abs(mid - obj.y - obj.height / 2);
						if (dist < minDist)
						{
							minDist = dist;
							apexIndex = i;
						}
					}
				}
				this.apexIndex = apexIndex;
			}
		}
		
		private function handleArchOrder2():void
		{
			if (this.childrenRenderOrder == ChildrenRenderOrder.Arch)
			{
				var mid:Number = _scrollPane.posX + this.viewWidth / 2;
				var minDist:Number = Number.POSITIVE_INFINITY;
				var dist:Number = 0;
				var apexIndex:int = 0;
				var cnt:int = this.numChildren;
				for (var i:int = 0; i < cnt; i++)
				{
					var obj:GObject = getChildAt(i);
					if (!foldInvisibleItems || obj.visible)
					{
						dist = Math.abs(mid - obj.x - obj.width / 2);
						if (dist < minDist)
						{
							minDist = dist;
							apexIndex = i;
						}
					}
				}
				this.apexIndex = apexIndex;
			}
		}

		private function handleAlign(contentWidth:Number, contentHeight:Number):void
		{
			var newOffsetX:Number = 0;
			var newOffsetY:Number = 0;

			if (contentHeight < viewHeight)
			{
				if (_verticalAlign == "middle")
					newOffsetY = Math.floor((viewHeight - contentHeight) / 2);
				else if (_verticalAlign == "bottom")
					newOffsetY = viewHeight - contentHeight;
			}

			if (contentWidth < this.viewWidth)
			{
				if (_align == "center")
					newOffsetX = Math.floor((viewWidth - contentWidth) / 2);
				else if (_align == "right")
					newOffsetX = viewWidth - contentWidth;
			}

			if (newOffsetX!=_alignOffset.x || newOffsetY!=_alignOffset.y)
			{
				_alignOffset.setTo(newOffsetX, newOffsetY);
				if (_scrollPane != null)
					_scrollPane.adjustMaskContainer();
				else
					_container.pos(_margin.left + _alignOffset.x, _margin.top + _alignOffset.y);
			}
		}
		
		override protected function updateBounds():void
		{
			if(_virtual)
				return;
			
			var i:int;
			var child:GObject;
			var curX:int;
			var curY:int;
			var maxWidth:int;
			var maxHeight:int;
			var cw:int, ch:int;
			var j:int = 0;
			var page:int = 0;
			var k:int = 0;
			var cnt:int = _children.length;
			var viewWidth:Number = this.viewWidth;
			var viewHeight:Number = this.viewHeight;
			var lineSize:Number = 0;
			var lineStart:int = 0;
			var ratio:Number;
			
			if(_layout==ListLayoutType.SingleColumn)
			{
				for(i=0;i<cnt;i++)
				{
					child = getChildAt(i);
					if (foldInvisibleItems && !child.visible)
						continue;
					
					if (curY != 0)
						curY += _lineGap;
					child.y = curY;
					if (_autoResizeItem)
						child.setSize(viewWidth, child.height, true);
					curY += Math.ceil(child.height);
					if(child.width>maxWidth)
						maxWidth = child.width;
				}
				cw = Math.ceil(maxWidth);
				ch = curY;
			}
			else if(_layout==ListLayoutType.SingleRow)
			{
				for(i=0;i<cnt;i++)
				{
					child = getChildAt(i);
					if (foldInvisibleItems && !child.visible)
						continue;
					
					if(curX!=0)
						curX += _columnGap;
					child.x = curX;
					if (_autoResizeItem)
						child.setSize(child.width, viewHeight, true);
					curX += Math.ceil(child.width);
					if(child.height>maxHeight)
						maxHeight = child.height;
				}
				cw = curX;
				ch = Math.ceil(maxHeight);
			}
			else if(_layout==ListLayoutType.FlowHorizontal)
			{
				if (_autoResizeItem && _columnCount > 0)
				{
					for (i = 0; i < cnt; i++)
					{
						child = getChildAt(i);
						if (foldInvisibleItems && !child.visible)
							continue;
						
						lineSize += child.sourceWidth;
						j++;
						if (j == _columnCount || i == cnt - 1)
						{
							ratio = (viewWidth - lineSize - (j - 1) * _columnGap) / lineSize;
							curX = 0;
							for (j = lineStart; j <= i; j++)
							{
								child = getChildAt(j);
								if (foldInvisibleItems && !child.visible)
									continue;
								
								child.setXY(curX, curY);
								
								if (j < i)
								{
									child.setSize(child.sourceWidth + Math.round(child.sourceWidth * ratio), child.height, true);
									curX += Math.ceil(child.width) + _columnGap;
								}
								else
								{
									child.setSize(viewWidth - curX, child.height, true);
								}
								if (child.height > maxHeight)
									maxHeight = child.height;
							}
							//new line
							curY += Math.ceil(maxHeight) + _lineGap;
							maxHeight = 0;
							j = 0;
							lineStart = i + 1;
							lineSize = 0;
						}
					}
					ch = curY + Math.ceil(maxHeight);
					cw = viewWidth;
				}
				else
				{
					for(i=0;i<cnt;i++)
					{
						child = getChildAt(i);
						if (foldInvisibleItems && !child.visible)
							continue;
						
						if(curX!=0)
							curX += _columnGap;
						
						if (_columnCount != 0 && j >= _columnCount
							|| _columnCount == 0 && curX + child.width > viewWidth && maxHeight != 0)
						{
							//new line
							curX = 0;
							curY += Math.ceil(maxHeight) + _lineGap;
							maxHeight = 0;
							j = 0;
						}
						child.setXY(curX, curY);
						curX += Math.ceil(child.width);
						if (curX > maxWidth)
							maxWidth = curX;
						if (child.height > maxHeight)
							maxHeight = child.height;
						j++;
					}
					ch = curY + Math.ceil(maxHeight);
					cw = Math.ceil(maxWidth);
				}
			}
			else if (_layout == ListLayoutType.FlowVertical)
			{
				if (_autoResizeItem && _lineCount > 0)
				{
					for (i = 0; i < cnt; i++)
					{
						child = getChildAt(i);
						if (foldInvisibleItems && !child.visible)
							continue;
						
						lineSize += child.sourceHeight;
						j++;
						if (j == _lineCount || i == cnt - 1)
						{
							ratio = (viewHeight - lineSize - (j - 1) * _lineGap) / lineSize;
							curY = 0;
							for (j = lineStart; j <= i; j++)
							{
								child = getChildAt(j);
								if (foldInvisibleItems && !child.visible)
									continue;
								
								child.setXY(curX, curY);
								
								if (j < i)
								{
									child.setSize(child.width, child.sourceHeight + Math.round(child.sourceHeight * ratio), true);
									curY += Math.ceil(child.height) + _lineGap;
								}
								else
								{
									child.setSize(child.width, viewHeight - curY, true);
								}
								if (child.width > maxWidth)
									maxWidth = child.width;
							}
							//new line
							curX += Math.ceil(maxWidth) + _columnGap;
							maxWidth = 0;
							j = 0;
							lineStart = i + 1;
							lineSize = 0;
						}
					}
					cw = curX + Math.ceil(maxWidth);
					ch = viewHeight;
				}
				else
				{
					for(i=0;i<cnt;i++)
					{
						child = getChildAt(i);
						if (foldInvisibleItems && !child.visible)
							continue;
						
						if(curY!=0)
							curY += _lineGap;
						
						if (_lineCount != 0 && j >= _lineCount
							|| _lineCount == 0 && curY + child.height > viewHeight && maxWidth != 0)
						{
							curY = 0;
							curX += Math.ceil(maxWidth) + _columnGap;
							maxWidth = 0;
							j = 0;
						}
						child.setXY(curX, curY);
						curY += Math.ceil(child.height);
						if (curY > maxHeight)
							maxHeight = curY;
						if (child.width > maxWidth)
							maxWidth = child.width;
						j++;
					}
					cw = curX + Math.ceil(maxWidth);
					ch = Math.ceil(maxHeight);
				}
			}
			else //pagination
			{
				var eachHeight:int;
				if(_autoResizeItem && _lineCount>0)
					eachHeight = Math.floor((viewHeight-(_lineCount-1)*_lineGap)/_lineCount);
				
				if (_autoResizeItem && _columnCount > 0)
				{
					for (i = 0; i < cnt; i++)
					{
						child = getChildAt(i);
						if (foldInvisibleItems && !child.visible)
							continue;
						
						if (j==0 && (_lineCount != 0 && k >= _lineCount
							|| _lineCount == 0 && curY + child.height > viewHeight))
						{
							//new page
							page++;
							curY = 0;
							k = 0;
						}
						
						lineSize += child.sourceWidth;
						j++;
						if (j == _columnCount || i == cnt - 1)
						{
							ratio = (viewWidth - lineSize - (j - 1) * _columnGap) / lineSize;
							curX = 0;
							for (j = lineStart; j <= i; j++)
							{
								child = getChildAt(j);
								if (foldInvisibleItems && !child.visible)
									continue;
								
								child.setXY(page * viewWidth + curX, curY);
								
								if (j < i)
								{
									child.setSize(child.sourceWidth + Math.round(child.sourceWidth * ratio), 
										_lineCount>0?eachHeight:child.height, true);
									curX += Math.ceil(child.width) + _columnGap;
								}
								else
								{
									child.setSize(viewWidth - curX, _lineCount>0?eachHeight:child.height, true);
								}
								if (child.height > maxHeight)
									maxHeight = child.height;
							}
							//new line
							curY += Math.ceil(maxHeight) + _lineGap;
							maxHeight = 0;
							j = 0;
							lineStart = i + 1;
							lineSize = 0;
							
							k++;
						}
					}
				}
				else
				{
					for (i = 0; i < cnt; i++)
					{
						child = getChildAt(i);
						if (foldInvisibleItems && !child.visible)
							continue;
						
						if (curX != 0)
							curX += _columnGap;
						
						if (_autoResizeItem && _lineCount > 0)
							child.setSize(child.width, eachHeight, true);
						
						if (_columnCount != 0 && j >= _columnCount
							|| _columnCount == 0 && curX + child.width > viewWidth && maxHeight != 0)
						{
							//new line
							curX = 0;
							curY += Math.ceil(maxHeight) + _lineGap;
							maxHeight = 0;
							j = 0;
							k++;
							
							if (_lineCount != 0 && k >= _lineCount
								|| _lineCount == 0 && curY + child.height > viewHeight && maxWidth != 0)//new page
							{
								page++;
								curY = 0;
								k = 0;
							}
						}
						child.setXY(page * viewWidth + curX, curY);
						curX += Math.ceil(child.width);
						if (curX > maxWidth)
							maxWidth = curX;
						if (child.height > maxHeight)
							maxHeight = child.height;
						j++;
					}
				}
				ch = page > 0 ? viewHeight : curY + Math.ceil(maxHeight);
				cw = (page + 1) * viewWidth;
			}
			
			handleAlign(cw, ch);
			setBounds(0,0,cw,ch);
		}
		
		override public function setup_beforeAdd(buffer:ByteBuffer, beginPos:int): void {
			super.setup_beforeAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 5);
			
			var i:int;
			var j:int;
			var cnt:int;
			var i1:int;
			var i2:int;
			var nextPos:int;
			var str:String;
			
			_layout = buffer.readByte();
			_selectionMode = buffer.readByte();
			i1 = buffer.readByte();
			_align = i1==0?"left":(i1==1?"center":"right");
			i1 = buffer.readByte();
			_verticalAlign = i1==0?"top":(i1==1?"middle":"bottom");
			_lineGap = buffer.getInt16();
			_columnGap = buffer.getInt16();
			_lineCount = buffer.getInt16();
			_columnCount = buffer.getInt16();
			_autoResizeItem = buffer.readBool();
			_childrenRenderOrder = buffer.readByte();
			_apexIndex = buffer.getInt16();
			
			if (buffer.readBool())
			{
				_margin.top = buffer.getInt32();
				_margin.bottom = buffer.getInt32();
				_margin.left = buffer.getInt32();
				_margin.right = buffer.getInt32();
			}
			
			var overflow:int = buffer.readByte();
			if (overflow == OverflowType.Scroll)
			{
				var savedPos:int = buffer.pos;
				buffer.seek(beginPos, 7);
				setupScroll(buffer);
				buffer.pos = savedPos;
			}
			else
				setupOverflow(overflow);
			
			if (buffer.readBool())
				buffer.skip(8);
			
			buffer.seek(beginPos, 8);
			
			_defaultItem = buffer.readS();
			var itemCount:int = buffer.getInt16();
			for (i = 0; i < itemCount; i++)
			{
				nextPos = buffer.getInt16();
				nextPos += buffer.pos;
				
				str = buffer.readS();
				if (str == null)
				{
					str = defaultItem;
					if (!str)
					{
						buffer.pos = nextPos;
						continue;
					}
				}
				
				var obj:GObject = getFromPool(str);
				if (obj != null)
				{
					addChild(obj);
					str = buffer.readS();
					if (str != null)
						obj.text = str;
					str = buffer.readS();
					if (str != null && (obj is GButton))
						(obj as GButton).selectedTitle = str;
					str = buffer.readS();
					if (str != null)
						obj.icon = str;
					str = buffer.readS();
					if (str != null && (obj is GButton))
						(obj as GButton).selectedIcon = str;
					str = buffer.readS();
					if (str != null)
						obj.name = str;
					if (obj is GComponent)
					{
						cnt = buffer.getInt16();
						for (j = 0; j < cnt; j++)
						{
							var cc:Controller = (obj as GComponent).getController(buffer.readS());
							str = buffer.readS();
							if (cc != null)
								cc.selectedPageId = str;
						}
					}
				}
				
				buffer.pos = nextPos;
			}
		}
		
		override public function setup_afterAdd(buffer:ByteBuffer, beginPos:int):void
		{
			super.setup_afterAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 6);
			
			var i:int = buffer.getInt16();
			if (i != -1)
				_selectionController = parent.getControllerAt(i);
		}
	}
}

import fairygui.GObject;

class ItemInfo
{
	public var width:Number = 0;
	public var height:Number = 0;
	public var obj:GObject;
	public var updateFlag:uint = 0;
	public var selected:Boolean = false;
	
	public function ItemInfo():void
	{
	}
}