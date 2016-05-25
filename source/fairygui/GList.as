package fairygui {
	import laya.events.Event;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	import laya.utils.Handler;

    public class GList extends GComponent {
        /**
         * itemRenderer(int index, GObject item);
         */
        public var itemRenderer:Handler;
        
        private var _layout: int;
        private var _lineItemCount:Number = 0;
        private var _lineGap: Number = 0;
        private var _columnGap: Number = 0;
        private var _defaultItem: String;
        private var _autoResizeItem: Boolean;
        private var _selectionMode: int;
        private var _lastSelectedIndex: Number = 0;
        private var _pool: GObjectPool;
        
        //Virtual List support
        private var _virtual:Boolean;
        private var _loop: Boolean;
        private var _numItems: Number = 0;
        private var _firstIndex: Number = 0; //the top left index
        private var _viewCount: Number = 0; //item count in view
        private var _curLineItemCount: Number = 0; //item count in one line
        private var _itemSize:Point;
        private var _virtualListChanged: Number; //1-content changed, 2-size changed
        private var _eventLocked: Boolean;
        
        public function GList() {
            super();

            this._trackBounds = true;
            this._pool = new GObjectPool();
            this._layout = ListLayoutType.SingleColumn;
            this._autoResizeItem = true;
            this._lastSelectedIndex = -1;
            this._selectionMode = ListSelectionMode.Single;
            this.opaque = true;
        }

        override public function dispose(): void {
            this._pool.clear();
            super.dispose();
        }

        public function get layout(): int {
            return this._layout;
        }

        public function set layout(value: int):void {
            if (this._layout != value) {
                this._layout = value;
                this.setBoundsChangedFlag();
                if(this._virtual)
                    this.setVirtualListChangedFlag(true);
            }
        }

        public function get lineGap(): Number {
            return this._lineGap;
        }
        
        public function get lineItemCount(): Number {
            return this._lineItemCount;
        }

        public function set lineItemCount(value:Number):void {
            if(this._lineItemCount != value) {
                this._lineItemCount = value;
                this.setBoundsChangedFlag();
                if(this._virtual)
                    this.setVirtualListChangedFlag(true);
            }
        }

        public function set lineGap(value: Number):void {
            if (this._lineGap != value) {
                this._lineGap = value;
                this.setBoundsChangedFlag();
                if(this._virtual)
                    this.setVirtualListChangedFlag(true);
            }
        }

        public function get columnGap(): Number {
            return this._columnGap;
        }

        public function set columnGap(value: Number):void {
            if (this._columnGap != value) {
                this._columnGap = value;
                this.setBoundsChangedFlag();
                if(this._virtual)
                    this.setVirtualListChangedFlag(true);
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
            this._autoResizeItem = value;
        }

        public function get selectionMode(): int {
            return this._selectionMode;
        }

        public function set selectionMode(value: int):void {
            this._selectionMode = value;
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
            obj.displayObject.cacheAsBitmap = false;
            this._pool.returnObject(obj);
        }

        override public function addChildAt(child: GObject, index: Number = 0): GObject {
            if (this._autoResizeItem) {
                if (this._layout == ListLayoutType.SingleColumn)
                    child.width = this.viewWidth;
                else if (this._layout == ListLayoutType.SingleRow)
                    child.height = this.viewHeight;
            }

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
            var child: GObject = super.removeChildAt(index, dispose);
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

        public function get selectedIndex(): Number {
            var cnt: Number = this._children.length;
            for (var i: Number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null && obj.selected) {
                    var j: Number = this._firstIndex + i;
                    if(this._loop && this._numItems > 0)
                        j = j % this._numItems;
                    return j;
                }
            }
            return -1;
        }

        public function set selectedIndex(value: Number):void {
            this.clearSelection();
            if (value >= 0 && value < this.numItems)
                this.addSelection(value);
        }

        public function getSelection(): Vector.<Number> {
            var ret: Vector.<Number> = new Vector.<Number>();
            var cnt: Number = this._children.length;
            for (var i: Number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null && obj.selected) {
                    var j: Number = this._firstIndex + i;
                    if(this._loop && this._numItems > 0)
                        j = j % this._numItems;
                    ret.push(j);
                }
            }
            return ret;
        }

        public function addSelection(index: Number, scrollItToView: Boolean= false): void {
            if (this._selectionMode == ListSelectionMode.None)
                return;

            if (this._selectionMode == ListSelectionMode.Single)
                this.clearSelection();
                
            if(scrollItToView)
                this.scrollToView(index);

            if(this._loop && this._numItems>0) {
                var j: Number = this._firstIndex % this._numItems;
                if(index >= j)
                    index = this._firstIndex + (index - j);
                else
                    index = this._firstIndex + this._numItems + (j - index);
            }
            else
                index -= this._firstIndex;
            if(index<0 || index >= this._children.length)
                return;

            var obj: GButton = this.getChildAt(index).asButton;
            if(obj != null && !obj.selected)
                obj.selected = true;
        }

        public function removeSelection(index: Number = 0): void {
            if (this._selectionMode == ListSelectionMode.None)
                return;

            if(this._loop && this._numItems > 0) {
                var j: Number = this._firstIndex % this._numItems;
                if(index >= j)
                    index = this._firstIndex + (index - j);
                else
                    index = this._firstIndex + this._numItems + (j - index);
            }
            else
                index -= this._firstIndex;
            if(index >= this._children.length)
                return;

            var obj: GButton = this.getChildAt(index).asButton;
            if (obj != null && obj.selected)
                obj.selected = false;
        }

        public function clearSelection(): void {
            var cnt: Number = this._children.length;
            for (var i: Number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null)
                    obj.selected = false;
            }
        }

        public function selectAll(): void {
            var cnt: Number = this._children.length;
            for (var i: Number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null)
                    obj.selected = true;
            }
        }

        public function selectNone(): void {
            var cnt: Number = this._children.length;
            for (var i: Number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null)
                    obj.selected = false;
            }
        }

        public function selectReverse(): void {
            var cnt: Number = this._children.length;
            for (var i: Number = 0; i < cnt; i++) {
                var obj: GButton = this._children[i].asButton;
                if (obj != null)
                    obj.selected = !obj.selected;
            }
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
                    else if (this._layout == ListLayoutType.FlowHorizontal) {
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
                    if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowHorizontal) {
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
                    else if (this._layout == ListLayoutType.FlowHorizontal) {
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
                    if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowHorizontal) {
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
            if (this._scrollPane != null && this._scrollPane._isMouseMoved)
                return;

            var item: GObject = GObject.cast(evt.currentTarget);
           	this.setSelectionOnEvent(item, evt);

            if(this.scrollPane)
                this.scrollPane.scrollToView(item,true);

            this.displayObject.event(Events.CLICK_ITEM, [item, Events.createEvent(Events.CLICK_ITEM, this.displayObject,evt)]);
        }

        private function setSelectionOnEvent(item: GObject, evt:Event): void {
            if (!(item is GButton) || this._selectionMode == ListSelectionMode.None)
                return;

            var dontChangeLastIndex: Boolean = false;
            var button: GButton = GButton(item);
            var index: Number = this.getChildIndex(item);
            
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
                            var min: Number = Math.min(this._lastSelectedIndex, index);
                            var max: Number = Math.max(this._lastSelectedIndex, index);
                            max = Math.min(max,this._children.length - 1);
                            for (var i: Number = min; i <= max; i++) {
                                var obj: GButton = this.getChildAt(i).asButton;
                                if (obj != null && !obj.selected)
                                    obj.selected = true;
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

            return;
        }

        private function clearSelectionExcept(obj: GObject): void {
            var cnt: Number = this._children.length;
            for (var i: Number = 0; i < cnt; i++) {
                var button: GButton = this._children[i].asButton;
                if (button != null && button != obj && button.selected)
                    button.selected = false;
            }
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
                    if (obj.visible)
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

            if (this._autoResizeItem)
                this.adjustItemsSize();

            if (this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.FlowVertical) {
                this.setBoundsChangedFlag();
            	if (this._virtual)
                    this.setVirtualListChangedFlag(true);
		    }
        }

        public function adjustItemsSize(): void {
            if (this._layout == ListLayoutType.SingleColumn) {
                var cnt: Number = this._children.length;
                var cw: Number = this.viewWidth;
                for (var i: Number = 0; i < cnt; i++) {
                    var child: GObject = this.getChildAt(i);
                    child.width = cw;
                }
            }
            else if (this._layout == ListLayoutType.SingleRow) {
                cnt = this._children.length;
                var ch: Number = this.viewHeight;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    child.height = ch;
                }
            }
        }

		override public function getSnappingPosition(xValue: Number, yValue: Number, resultPoint:Point=null):Point {
            if (this._virtual) {
                if(!resultPoint)
                    resultPoint = new Point();
                    
				if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
					var i:Number = Math.floor(yValue / (this._itemSize.y + this._lineGap));
					if (yValue > i * (this._itemSize.y + this._lineGap) + this._itemSize.y / 2)
						i++;
					
					resultPoint.x = xValue;
                    resultPoint.y = i * (this._itemSize.y + this._lineGap);
				}
				else
				{
                    i = Math.floor(xValue / (this._itemSize.x + this._columnGap));
                    if(xValue > i * (this._itemSize.x + this._columnGap) + this._itemSize.x / 2)
						i++;
					
                    resultPoint.x = i * (this._itemSize.x + this._columnGap);
                    resultPoint.y = yValue;
				}
				
				return resultPoint;
			}
			else {
                return super.getSnappingPosition(xValue, yValue, resultPoint);
            }
        }
        
        public function scrollToView(index: Number, ani: Boolean = false, setFirst: Boolean = false):void  {				
            if(this._virtual) {
                if(this.scrollPane != null)
                    this.scrollPane.scrollToView(this.getItemRect(index),ani,setFirst);
                else if(this.parent != null && this.parent.scrollPane != null)
                    this.parent.scrollPane.scrollToView(this.getItemRect(index),ani,setFirst);
            }
            else {
                var obj: GButton = this.getChildAt(index).asButton;
                if(obj != null) {
                    if(this.scrollPane != null)
                        this.scrollPane.scrollToView(obj,ani,setFirst);
                    else if(this.parent != null && this.parent.scrollPane != null)
                        this.parent.scrollPane.scrollToView(obj,ani,setFirst);
                }
            }
        }

        override public function getFirstChildInView(): Number {
            var ret: Number = super.getFirstChildInView();
            if(ret != -1) {
                ret += this._firstIndex;
                if(this._loop && this._numItems>0)
                    ret = ret % this._numItems;
                return ret;
            }
            else
                return -1;
        }
    
        public function setVirtual(): void {
            this._setVirtual(false);
        }
		
        /// <summary>
        /// Set the list to be virtual list, and has loop behavior.
        /// </summary>
        public function setVirtualAndLoop(): void {
            this._setVirtual(true);
        }
		
        /// <summary>
        /// Set the list to be virtual list.
        /// </summary>
        private function _setVirtual(loop: Boolean): void {
            if(!this._virtual) {
                if(this.scrollPane == null)
                    throw new Error("Virtual list must be scrollable!");
                    
                if(loop) {        
                    if(this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.FlowVertical)
                        throw new Error("Only single row or single column layout type is supported for loop list!");
        
                    this.scrollPane.bouncebackEffect = false;
                }
        
                this._virtual = true;
                this._loop = loop;
                this.removeChildrenToPool();
        
                if(this._itemSize==null) {
                    this._itemSize = new Point();
                    var obj: GObject = this.getFromPool(null);
                    this._itemSize.x = obj.width;
                    this._itemSize.y = obj.height;
                    this.returnToPool(obj);
                }
        
                if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
                    this.scrollPane.scrollSpeed = this._itemSize.y;
                else
                    this.scrollPane.scrollSpeed = this._itemSize.x;
        
                this.on(Events.SCROLL, this, this.__scrolled);
                this.setVirtualListChangedFlag(true);
            }
        }
        		
        /// <summary>
        /// Set the list item count. 
        /// If the list is not virtual, specified Number of items will be created. 
        /// If the list is virtual, only items in view will be created.
        /// </summary>
        public function get numItems():Number
        {
            if(this._virtual)
                return this._numItems;
            else
                return this._children.length;
        }
        
        public function set numItems(value:Number):void
        {
            if(this._virtual) {
                this._numItems = value;
                this.setVirtualListChangedFlag();
            }
			else {
                var cnt: Number = this._children.length;
                if(value > cnt) {
                    for(var i: Number = cnt;i < value;i++)
                        this.addItemFromPool();
                }
    			else {
                     this.removeChildrenToPool(value,cnt);
                }
                if(this.itemRenderer != null) {
                    for(i = 0;i < value;i++)
						this.itemRenderer.runWith([i, this.getChildAt(i)]);
                }
            }
        }
        
        private function __parentSizeChanged():void {
            this.setVirtualListChangedFlag();
        }
        
        private function setVirtualListChangedFlag(layoutChanged:Boolean = false):void {
            if(layoutChanged)
                this._virtualListChanged = 2;
            else if(this._virtualListChanged == 0)
                this._virtualListChanged = 1;
    
            Laya.timer.callLater(this, this.refreshVirtualList);
        }
        
        private function refreshVirtualList(): void {
            if(this._virtualListChanged == 0)
                return;

            var layoutChanged: Boolean = this._virtualListChanged == 2;
            this._virtualListChanged = 0;
            this._eventLocked = true;
            
            if(layoutChanged) {
                if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
                    if(this._layout == ListLayoutType.SingleColumn)
                        this._curLineItemCount = 1;
                    else if(this._lineItemCount != 0)
                        this._curLineItemCount = this._lineItemCount;
                    else
                        this._curLineItemCount = Math.floor((this.scrollPane.viewWidth + this._columnGap) / (this._itemSize.x + this._columnGap));
                    this._viewCount = (Math.ceil((this.scrollPane.viewHeight + this._lineGap) / (this._itemSize.y + this._lineGap)) + 1) * this._curLineItemCount;
                    var numChildren: Number = this._children.length;
                    if(numChildren < this._viewCount) {
                        for(var i: Number = numChildren;i < this._viewCount;i++)
                            this.addItemFromPool();
                    }
                    else if(numChildren > this._viewCount)
                        this.removeChildrenToPool(this._viewCount,numChildren);
                }
                else {
                    if(this._layout == ListLayoutType.SingleRow)
                        this._curLineItemCount = 1;
                    else if(this._lineItemCount != 0)
                        this._curLineItemCount = this._lineItemCount;
                    else
                        this._curLineItemCount = Math.floor((this.scrollPane.viewHeight + this._lineGap) / (this._itemSize.y + this._lineGap));
                    this._viewCount = (Math.ceil((this.scrollPane.viewWidth + this._columnGap) / (this._itemSize.x + this._columnGap)) + 1) * this._curLineItemCount;
                    numChildren = this._children.length;
                    if(numChildren < this._viewCount) {
                        for(i = numChildren;i < this._viewCount;i++)
                            this.addItemFromPool();
                    }
                    else if(numChildren > this._viewCount)
                        this.removeChildrenToPool(this._viewCount,numChildren);
                }
            }
            
            this.ensureBoundsCorrect();
        
            if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
                if(this.scrollPane != null) {
                    var ch: Number;
                    if(this._layout == ListLayoutType.SingleColumn) {
                        ch = this._numItems * this._itemSize.y + Math.max(0,this._numItems - 1) * this._lineGap;
                        if(this._loop && ch > 0)
                            ch = ch * 5 + this._lineGap * 4;
                    }
                    else {
                        var lineCount: Number = Math.ceil(this._numItems / this._curLineItemCount);
                        ch = lineCount * this._itemSize.y + Math.max(0,lineCount - 1) * this._lineGap;
                    }
        
                    this.scrollPane.setContentSize(this.scrollPane.contentWidth,ch);
                }
            }
            else {
                if(this.scrollPane != null) {
                    var cw: Number;
                    if(this._layout == ListLayoutType.SingleRow) {
                        cw = this._numItems * this._itemSize.x + Math.max(0,this._numItems - 1) * this._columnGap;
                        if(this._loop && cw > 0)
                            cw = cw * 5 + this._columnGap * 4;
                    }
                    else {
                        lineCount = Math.ceil(this._numItems / this._curLineItemCount);
                        cw = lineCount * this._itemSize.x + Math.max(0,lineCount - 1) * this._columnGap;
                    }
        
                    this.scrollPane.setContentSize(cw,this.scrollPane.contentHeight);
                }
            }
            
            this._eventLocked = false;
            this.__scrolled(null);
        }
        
        private function renderItems(beginIndex: Number,endIndex: Number): void {
            for(var i: Number = 0;i < this._viewCount;i++) {
                var obj: GObject = this.getChildAt(i);
                var j: Number = this._firstIndex + i;
                if(this._loop && this._numItems>0)
                    j = j % this._numItems;
        
                if(j < this._numItems) {
                    obj.visible = true;
                    if(i >= beginIndex && i < endIndex)
						this.itemRenderer.runWith([j,obj]);
                }
                else
                    obj.visible = false;
            }
        }
        
        private function getItemRect(index: Number): Rectangle {
            var rect: Rectangle;
            var index1: Number = Math.floor(index / this._curLineItemCount);
            var index2: Number = index % this._curLineItemCount;
            switch(this._layout) {
                case ListLayoutType.SingleColumn:
                    rect = new Rectangle(0,index1 * this._itemSize.y + Math.max(0,index1 - 1) * this._lineGap,
                        this.viewWidth,this._itemSize.y);
                    break;
        
                case ListLayoutType.FlowHorizontal:
                    rect = new Rectangle(index2 * this._itemSize.x + Math.max(0,index2 - 1) * this._columnGap,
                        index1 * this._itemSize.y + Math.max(0,index1 - 1) * this._lineGap,
                        this._itemSize.x,this._itemSize.y);
                    break;
        
                case ListLayoutType.SingleRow:
                    rect = new Rectangle(index1 * this._itemSize.x + Math.max(0,index1 - 1) * this._columnGap,0,
                        this._itemSize.x,this.viewHeight);
                    break;
        
                case ListLayoutType.FlowVertical:
                    rect = new Rectangle(index1 * this._itemSize.x + Math.max(0,index1 - 1) * this._columnGap,
                        index2 * this._itemSize.y + Math.max(0,index2 - 1) * this._lineGap,
                        this._itemSize.x,this._itemSize.y);
                    break;
            }
            return rect;
        }
        
        private function __scrolled(evt:Event): void {
            if(this._eventLocked)
                return;
                
            if(this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
                if(this._loop) {
                    if(this.scrollPane.percY == 0)
                        this.scrollPane.posY = this._numItems * (this._itemSize.y + this._lineGap);
                    else if(this.scrollPane.percY == 1)
                        this.scrollPane.posY = this.scrollPane.contentHeight - this._numItems * (this._itemSize.y + this._lineGap) - this.viewHeight;
                }
        
                var firstLine: Number = Math.floor((this.scrollPane.posY + this._lineGap) / (this._itemSize.y + this._lineGap));
                var newFirstIndex: Number = firstLine * this._curLineItemCount;
                for(var i: Number = 0;i < this._viewCount;i++) {
                    var obj: GObject = this.getChildAt(i);
                    obj.y = (firstLine + Math.floor(i / this._curLineItemCount)) * (this._itemSize.y + this._lineGap);
                }
                if(newFirstIndex >= this._numItems)
                    newFirstIndex -= this._numItems;
        
                if(newFirstIndex != this._firstIndex || evt == null) {
                    var oldFirstIndex: Number = this._firstIndex;
                    this._firstIndex = newFirstIndex;
        
                    if(evt == null || oldFirstIndex + this._viewCount < newFirstIndex || oldFirstIndex > newFirstIndex + this._viewCount) {
                        //no intersection, render all
                        for(i = 0;i < this._viewCount;i++) {
                            obj = this.getChildAt(i);
                            if(obj is GButton)
                                GButton(obj).selected = false;
                        }
                        this.renderItems(0,this._viewCount);
                    }
                    else if(oldFirstIndex > newFirstIndex) {
                        var j1: Number = oldFirstIndex - newFirstIndex;
                        var j2: Number = this._viewCount - j1;
                        for(i = j2 - 1;i >= 0;i--) {
                            var obj1: GObject = this.getChildAt(i);
                            var obj2: GObject = this.getChildAt(i + j1);
                            if(obj2 is GButton)
                                GButton(obj2).selected = false;
                            var tmp: Number = obj1.y;
                            obj1.y = obj2.y;
                            obj2.y = tmp;
                            this.swapChildrenAt(i + j1,i);
                        }
                        this.renderItems(0,j1);
                    }
                    else {
                        j1 = newFirstIndex - oldFirstIndex;
                        j2 = this._viewCount - j1;
                        for(i = 0;i < j2;i++) {
                            obj1 = this.getChildAt(i);
                            obj2 = this.getChildAt(i + j1);
                            if(obj1 is GButton)
                               GButton(obj1).selected = false;
                            tmp = obj1.y;
                            obj1.y = obj2.y;
                            obj2.y = tmp;
                            this.swapChildrenAt(i + j1,i);
                        }
                        this.renderItems(j2,this._viewCount);
                    }
                }
            }
            else {
                if(this._loop) {
                    if(this.scrollPane.percX == 0)
                        this.scrollPane.posX = this._numItems * (this._itemSize.x + this._columnGap);
                    else if(this.scrollPane.percX == 1)
                        this.scrollPane.posX = this.scrollPane.contentWidth - this._numItems * (this._itemSize.x + this._columnGap) - this.viewWidth;
                }
        
                firstLine = Math.floor((this.scrollPane.posX + this._columnGap) / (this._itemSize.x + this._columnGap));
                newFirstIndex = firstLine * this._curLineItemCount;
        
                for(i = 0;i < this._viewCount;i++) {
                    obj = this.getChildAt(i);
                    obj.x = (firstLine + Math.floor(i / this._curLineItemCount)) * (this._itemSize.x + this._columnGap);
                }
        
                if(newFirstIndex >= this._numItems)
                    newFirstIndex -= this._numItems;
        
                if(newFirstIndex != this._firstIndex || evt == null) {
                    oldFirstIndex = this._firstIndex;
                    this._firstIndex = newFirstIndex;
                    if(evt == null || oldFirstIndex + this._viewCount < newFirstIndex || oldFirstIndex > newFirstIndex + this._viewCount) {
                        //no intersection, render all
                        for(i = 0;i < this._viewCount;i++) {
                            obj = this.getChildAt(i);
                            if(obj1 is GButton)
                               	GButton(obj1).selected = false;
                        }
        
                        this.renderItems(0,this._viewCount);
                    }
                    else if(oldFirstIndex > newFirstIndex) {
                        j1 = oldFirstIndex - newFirstIndex;
                        j2 = this._viewCount - j1;
                        for(i = j2 - 1;i >= 0;i--) {
                            obj1 = this.getChildAt(i);
                            obj2 = this.getChildAt(i + j1);
                            if(obj2 is GButton)
                                GButton(obj2).selected = false;
                            tmp = obj1.x;
                            obj1.x = obj2.x;
                            obj2.x = tmp;
                            this.swapChildrenAt(i + j1,i);
                        }
        
                        this.renderItems(0,j1);
                    }
                    else {
                        j1 = newFirstIndex - oldFirstIndex;
                        j2 = this._viewCount - j1;
                        for(i = 0;i < j2;i++) {
                            obj1 = this.getChildAt(i);
                            obj2 = this.getChildAt(i + j1);
                            if(obj1 is GButton)
                               	GButton(obj1).selected = false;
                            tmp = obj1.x;
                            obj1.x = obj2.x;
                            obj2.x = tmp;
                            this.swapChildrenAt(i + j1,i);
                        }
        
                        this.renderItems(j2,this._viewCount);
                    }
                }
            }
        
            this._boundsChanged = false;
        }

		override protected function updateBounds(): void {
            var cnt: Number = this._children.length;
            var i: Number = 0;
            var child: GObject;
            var curX: Number = 0;
            var curY: Number = 0;;
            var maxWidth: Number = 0;
            var maxHeight: Number = 0;
            var cw: Number, ch: Number = 0;
            
            for(i = 0;i < cnt;i++) {
                child = this.getChildAt(i);
                child.ensureSizeCorrect();
            }
            
            if (this._layout == ListLayoutType.SingleColumn) {                
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curY != 0)
                        curY += this._lineGap;
                    child.y = curY;
                    curY += child.height;
                    if (child.width > maxWidth)
                        maxWidth = child.width;
                }
                cw = curX + maxWidth;
                ch = curY;
            }
            else if (this._layout == ListLayoutType.SingleRow) {                
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curX != 0)
                        curX += this._columnGap;
                    child.x = curX;
                    curX += child.width;
                    if (child.height > maxHeight)
                        maxHeight = child.height;
                }
                cw = curX;
                ch = curY + maxHeight;
            }
            else if (this._layout == ListLayoutType.FlowHorizontal) {
                var j: Number = 0;
                var viewWidth: Number = this.viewWidth;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curX != 0)
                        curX += this._columnGap;

                    if(this._lineItemCount != 0 && j >= this._lineItemCount
                        || this._lineItemCount == 0 && curX + child.width > viewWidth && maxHeight != 0) {
                        //new line
                        curX -= this._columnGap;
                        if(curX > maxWidth)
                            maxWidth = curX;
                        curX = 0;
                        curY += maxHeight + this._lineGap;
                        maxHeight = 0;
                        j = 0;
                    }
                    child.setXY(curX,curY);
                    curX += child.width;
                    if(child.height > maxHeight)
                        maxHeight = child.height;
                    j++;
                }
                ch = curY + maxHeight;
                cw = maxWidth;
            }
            else {
                j = 0;
                var viewHeight: Number = this.viewHeight;
                for (i = 0; i < cnt; i++) {
                    child = this.getChildAt(i);
                    if (!child.visible)
                        continue;

                    if (curY != 0)
                        curY += this._lineGap;

                    if(this._lineItemCount != 0 && j >= this._lineItemCount
                        || this._lineItemCount == 0 && curY + child.height > viewHeight && maxWidth != 0) {
                        curY -= this._lineGap;
                        if(curY > maxHeight)
                            maxHeight = curY;
                        curY = 0;
                        curX += maxWidth + this._columnGap;
                        maxWidth = 0;
                        j = 0;
                    }
                    child.setXY(curX,curY);
                    curY += child.height;
                    if(child.width > maxWidth)
                        maxWidth = child.width;
                    j++;
                }
                cw = curX + maxWidth;
                ch = maxHeight;
            }
            this.setBounds(0, 0, cw, ch);
        }

        override public function setup_beforeAdd(xml: Object): void {
            super.setup_beforeAdd(xml);

            var str: String;
            var arr: Array;
            
            str = xml.getAttribute("layout");
            if (str)
                this._layout = ListLayoutType.parse(str);

            var overflow: int;
            str = xml.getAttribute("overflow");
            if (str)
                overflow = OverflowType.parse(str);
            else
                overflow = OverflowType.Visible;

            str = xml.getAttribute("margin");
            if(str)
                this._margin.parse(str);
                
            if(overflow == OverflowType.Scroll) {
                var scroll: int;
                str = xml.getAttribute("scroll");
                if (str)
                    scroll = ScrollType.parse(str);
                else
                    scroll = ScrollType.Vertical;
    
                var scrollBarDisplay: int;
                str = xml.getAttribute("scrollBar");
                if (str)
                    scrollBarDisplay = ScrollBarDisplayType.parse(str);
                else
                    scrollBarDisplay = ScrollBarDisplayType.Default;
    
                var scrollBarFlags: Number;
                str = xml.getAttribute("scrollBarFlags");
                if(str)
                    scrollBarFlags = parseInt(str);
                else
                    scrollBarFlags = 0;
    
                var scrollBarMargin: Margin = new Margin();
                str = xml.getAttribute("scrollBarMargin");
                if(str)
                     scrollBarMargin.parse(str);
                
                var vtScrollBarRes: String;
                var hzScrollBarRes: String;
                str = xml.getAttribute("scrollBarRes");
                if(str) {
                    arr = str.split(",");
                    vtScrollBarRes = arr[0];
                    hzScrollBarRes = arr[1];
                }
                
                this.setupScroll(scrollBarMargin,scroll,scrollBarDisplay,scrollBarFlags,vtScrollBarRes,hzScrollBarRes);
            }
            else
                this.setupOverflow(overflow);
            
            str = xml.getAttribute("lineGap");
            if (str)
                this._lineGap = parseInt(str);

            str = xml.getAttribute("colGap");
            if (str)
                this._columnGap = parseInt(str);
                
            str = xml.getAttribute("lineItemCount");
            if(str)
                this._lineItemCount = parseInt(str);
                
            str = xml.getAttribute("selectionMode");
            if (str)
                this._selectionMode = ListSelectionMode.parse(str);

            str = xml.getAttribute("defaultItem");
            if (str)
                this._defaultItem = str;
                
            str = xml.getAttribute("autoItemSize");
            this._autoResizeItem = str != "false";

            var col: Array = xml.childNodes;
            var length: Number = col.length;
            for (var i: Number = 0; i < length; i++) {
                var cxml: Object = col[i];
                if(cxml.nodeName != "item")
                    continue;
                
                var url: String = cxml.getAttribute("url");
                if (!url)
                    url = this._defaultItem;
                if (!url)
                    continue;

                var obj: GObject = this.getFromPool(url);
                if(obj != null) {
                    this.addChild(obj);                    
                    if (obj is GButton) {
                        GButton(obj).title = cxml.getAttribute("title");
                        GButton(obj).icon = cxml.getAttribute("icon");
                    }
                    else if (obj is GLabel) {
                        GLabel(obj).title =cxml.getAttribute("title");
                        GLabel(obj).icon = cxml.getAttribute("icon");
                    }
                }
            }
        }
    }
}