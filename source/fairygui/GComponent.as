package fairygui {
	
	import fairygui.utils.ByteBuffer;
	import fairygui.utils.ChildHitArea;
	import fairygui.utils.PixelHitTest;
	
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	
	public class GComponent extends GObject {
		private var _sortingChildCount: Number = 0;
		private var _opaque: Boolean;
		private var _applyingController:Controller;
		private var _mask:Sprite = null;
		
		protected var _margin: Margin;
		protected var _trackBounds: Boolean;
		protected var _boundsChanged: Boolean;		
		protected var _childrenRenderOrder:int;
		protected var _apexIndex:int;
		
		public var _buildingDisplayList: Boolean;
		public var _children: Vector.<GObject>;
		public var _controllers: Vector.<Controller>;
		public var _transitions: Vector.<Transition>;
		public var _container: Sprite;
		public var _scrollPane: ScrollPane;
		public var _alignOffset:Point;
		
		public function GComponent() {
			super();
			this._children = new Vector.<GObject>();
			this._controllers = new Vector.<Controller>();
			this._transitions = new Vector.<Transition>();
			this._margin = new Margin();
			this._alignOffset = new Point();
			this._opaque = false;
		}
		
		override protected function createDisplayObject(): void {
			super.createDisplayObject();
			this._displayObject.mouseEnabled = true;
			this._displayObject.mouseThrough = true;
			this._container = this._displayObject;
		}
		
		override public function dispose(): void {
			var i:int;
			var cnt:int;
			
			cnt = this._transitions.length;
			for (i = 0; i < cnt; ++i)
			{
				var trans:Transition = _transitions[i];
				trans.dispose();
			}
			
			cnt = this._controllers.length;
			for (i = 0; i < cnt; ++i)
			{
				var cc:Controller = this._controllers[i];
				cc.dispose();
			}
			
			if (scrollPane != null)
				scrollPane.dispose();
			
			cnt = this._children.length;
			for(i = cnt - 1;i >= 0;--i) {
				var obj:GObject = this._children[i];
				obj.parent = null;//avoid removeFromParent call
				obj.dispose();
			}
			
			this._boundsChanged = false;
			this._mask = null;
			super.dispose();
		}
		
		public function get displayListContainer(): Sprite {
			return this._container;
		}
		
		public function addChild(child: GObject): GObject {
			this.addChildAt(child,this._children.length);
			return child;
		}
		
		public function addChildAt(child: GObject,index: Number = 0): GObject {
			if(!child)
				throw "child is null";
			
			var numChildren: Number = this._children.length;
			
			if(index >= 0 && index <= numChildren) {
				if(child.parent == this) {
					this.setChildIndex(child,index);
				}
				else {
					child.removeFromParent();
					child.parent = this;
					
					var cnt: Number = this._children.length;
					if(child.sortingOrder != 0) {
						this._sortingChildCount++;
						index = this.getInsertPosForSortingChild(child);
					}
					else if(this._sortingChildCount > 0) {
						if(index > (cnt - this._sortingChildCount))
							index = cnt - this._sortingChildCount;
					}
					
					if(index == cnt)
						this._children.push(child);
					else
						this._children.splice(index,0,child);
					
					this.childStateChanged(child);
					this.setBoundsChangedFlag();
				}
				
				return child;
			}
			else {
				throw "Invalid child index";
			}
		}
		
		private function getInsertPosForSortingChild(target: GObject): Number {
			var cnt: Number = this._children.length;
			var i: Number = 0;
			for(i = 0;i < cnt;i++) {
				var child: GObject = this._children[i];
				if(child == target)
					continue;
				
				if(target.sortingOrder < child.sortingOrder)
					break;
			}
			return i;
		}
		
		public function removeChild(child: GObject,dispose: Boolean = false): GObject {
			var childIndex: Number = this._children.indexOf(child);
			if(childIndex != -1) {
				this.removeChildAt(childIndex,dispose);
			}
			return child;
		}
		
		public function removeChildAt(index: Number,dispose: Boolean = false): GObject {
			if(index >= 0 && index < this.numChildren) {
				var child: GObject = this._children[index];
				child.parent = null;
				
				if(child.sortingOrder != 0)
					this._sortingChildCount--;
				
				this._children.splice(index,1);
				child.group = null;
				if(child.inContainer) {
					this._container.removeChild(child.displayObject);
					
					if (_childrenRenderOrder == ChildrenRenderOrder.Arch)
						Laya.timer.callLater(this, this.buildNativeDisplayList);
				}
				
				if(dispose)
					child.dispose();
				
				this.setBoundsChangedFlag();
				
				return child;
			}
			else {
				throw "Invalid child index";
			}
		}
		
		public function removeChildren(beginIndex: Number = 0,endIndex: Number = -1,dispose: Boolean = false): void {
			if(endIndex < 0 || endIndex >= this.numChildren)
				endIndex = this.numChildren - 1;
			
			for(var i: Number = beginIndex;i <= endIndex;++i)
				this.removeChildAt(beginIndex,dispose);
		}
		
		public function getChildAt(index: Number = 0): GObject {
			if(index >= 0 && index < this.numChildren)
				return this._children[index];
			else
				throw "Invalid child index";
		}
		
		public function getChild(name: String): GObject {
			var cnt: Number = this._children.length;
			for(var i: Number = 0;i < cnt;++i) {
				if(this._children[i].name == name)
					return this._children[i];
			}
			
			return null;
		}
		
		public function getVisibleChild(name: String): GObject {
			var cnt: Number = this._children.length;
			for(var i: Number = 0;i < cnt;++i) {
				var child: GObject = this._children[i];
				if(child.internalVisible && child.internalVisible2 && child.name == name)
					return child;
			}
			
			return null;
		}
		
		public function getChildInGroup(name: String,group: GGroup): GObject {
			var cnt: Number = this._children.length;
			for(var i: Number = 0;i < cnt;++i) {
				var child: GObject = this._children[i];
				if(child.group == group && child.name == name)
					return child;
			}
			
			return null;
		}
		
		public function getChildById(id: String): GObject {
			var cnt: Number = this._children.length;
			for(var i: Number = 0;i < cnt;++i) {
				if(this._children[i]._id == id)
					return this._children[i];
			}
			
			return null;
		}
		
		public function getChildIndex(child: GObject): Number {
			return this._children.indexOf(child);
		}
		
		public function setChildIndex(child: GObject,index: Number = 0): void {
			var oldIndex: Number = this._children.indexOf(child);
			if(oldIndex == -1)
				throw "Not a child of this container";
			
			if(child.sortingOrder != 0) //no effect
				return;
			
			var cnt: Number = this._children.length;
			if(this._sortingChildCount > 0) {
				if(index > (cnt - this._sortingChildCount - 1))
					index = cnt - this._sortingChildCount - 1;
			}
			
			this._setChildIndex(child,oldIndex,index);
		}
		
		public function setChildIndexBefore(child:GObject, index:int):int
		{
			var oldIndex:int = _children.indexOf(child);
			if (oldIndex == -1) 
				throw "Not a child of this container";
			
			if(child.sortingOrder!=0) //no effect
				return oldIndex;
			
			var cnt:int = _children.length;
			if(_sortingChildCount>0)
			{
				if (index > (cnt - _sortingChildCount - 1))
					index = cnt - _sortingChildCount - 1;
			}
			
			if (oldIndex < index)
				return _setChildIndex(child, oldIndex, index - 1);
			else
				return _setChildIndex(child, oldIndex, index);
		}
		
		private function _setChildIndex(child:GObject, oldIndex:int, index:int):int
		{
			var cnt: Number = this._children.length;
			if(index > cnt)
				index = cnt;
			
			if(oldIndex == index)
				return oldIndex;
			
			this._children.splice(oldIndex,1);
			this._children.splice(index,0,child);
			
			if(child.inContainer) {
				
				var displayIndex:int = 0;
				var g:GObject;
				var i:int;
				
				if (_childrenRenderOrder == ChildrenRenderOrder.Ascent)
				{
					for(i=0;i<index;i++)
					{
						g = _children[i];
						if(g.inContainer)
							displayIndex++;
					}
					if(displayIndex==_container.numChildren)
						displayIndex--;
					_container.setChildIndex(child.displayObject, displayIndex);
				}
				else if (_childrenRenderOrder == ChildrenRenderOrder.Descent)
				{
					for (i = cnt - 1; i > index; i--)
					{
						g = _children[i];
						if (g.inContainer)
							displayIndex++;
					}
					if(displayIndex==_container.numChildren)
						displayIndex--;
					_container.setChildIndex(child.displayObject, displayIndex);
				}
				else
				{
					Laya.timer.callLater(this, this.buildNativeDisplayList);
				}
				
				this.setBoundsChangedFlag();
			}
			
			return index;
		}
		
		public function swapChildren(child1: GObject,child2: GObject): void {
			var index1: Number = this._children.indexOf(child1);
			var index2: Number = this._children.indexOf(child2);
			if(index1 == -1 || index2 == -1)
				throw "Not a child of this container";
			this.swapChildrenAt(index1,index2);
		}
		
		public function swapChildrenAt(index1: Number,index2: Number = 0): void {
			var child1: GObject = this._children[index1];
			var child2: GObject = this._children[index2];
			
			this.setChildIndex(child1,index2);
			this.setChildIndex(child2,index1);
		}
		
		public function get numChildren(): Number {
			return this._children.length;
		}
		
		public function isAncestorOf(child:GObject):Boolean
		{
			if (child == null)
				return false;
			
			var p:GComponent = child.parent;
			while(p)
			{
				if(p == this)
					return true;
				
				p = p.parent;
			}
			return false;
		}
		
		public function addController(controller: Controller): void {
			this._controllers.push(controller);
			controller.parent = this;
			this.applyController(controller);
		}
		
		public function getControllerAt(index:Number):Controller {
			return this._controllers[index];
		}
		
		public function getController(name: String): Controller {
			var cnt: Number = this._controllers.length;
			for(var i: Number = 0;i < cnt;++i) {
				var c: Controller = this._controllers[i];
				if(c.name == name)
					return c;
			}
			
			return null;
		}
		
		public function removeController(c: Controller): void {
			var index: Number = this._controllers.indexOf(c);
			if(index == -1)
				throw new Error("controller not exists");
			
			c.parent = null;
			this._controllers.splice(index,1);
			
			var length: Number = this._children.length;
			for(var i: Number = 0;i < length;i++) {
				var child: GObject = this._children[i];
				child.handleControllerChanged(c);
			}
		}
		
		public function get controllers(): Vector.<Controller> {
			return this._controllers;
		}
		
		public function childStateChanged(child: GObject): void {
			if(this._buildingDisplayList)
				return;
			
			var cnt:int = _children.length;
			if(child is GGroup) {
				for(var i:int = 0;i < cnt;i++) {
					var g: GObject = this._children[i];
					if(g.group == child)
						this.childStateChanged(g);
				}
				return;
			}
			
			if(!child.displayObject)
				return;
			
			if(child.internalVisible && child.displayObject!=_displayObject.mask) {
				if(!child.displayObject.parent) {
					var index:int = 0
					if (_childrenRenderOrder == ChildrenRenderOrder.Ascent)
					{
						for (i = 0; i < cnt; i++)
						{
							g = _children[i];
							if (g == child)
								break;
							
							if (g.displayObject != null && g.displayObject.parent != null)
								index++;
						}
						_container.addChildAt(child.displayObject, index);
					}
					else if (_childrenRenderOrder == ChildrenRenderOrder.Descent)
					{
						for (i = cnt - 1; i >= 0; i--)
						{
							g = _children[i];
							if (g == child)
								break;
							
							if (g.displayObject != null && g.displayObject.parent != null)
								index++;
						}
						_container.addChildAt(child.displayObject, index);
					}
					else
					{
						_container.addChild(child.displayObject);
						
						Laya.timer.callLater(this, this.buildNativeDisplayList);
					}
				}
			}
			else {
				if(child.displayObject.parent) {
					this._container.removeChild(child.displayObject);
					
					if (_childrenRenderOrder == ChildrenRenderOrder.Arch)
						Laya.timer.callLater(this, this.buildNativeDisplayList);
				}
			}
		}
		
		private function buildNativeDisplayList():void
		{
			var cnt:int = _children.length;
			if (cnt == 0)
				return;
			
			var i:int;
			var child:GObject;
			switch (_childrenRenderOrder)
			{
				case ChildrenRenderOrder.Ascent:
				{
					for (i = 0; i < cnt; i++)
					{
						child = _children[i];
						if (child.displayObject != null && child.internalVisible)
							_container.addChild(child.displayObject);
					}
				}
					break;
				case ChildrenRenderOrder.Descent:
				{
					for (i = cnt - 1; i >= 0; i--)
					{
						child = _children[i];
						if (child.displayObject != null && child.internalVisible)
							_container.addChild(child.displayObject);
					}
				}
					break;
				
				case ChildrenRenderOrder.Arch:
				{
					for (i = 0; i < _apexIndex; i++)
					{
						child = _children[i];
						if (child.displayObject != null && child.internalVisible)
							_container.addChild(child.displayObject);
					}
					for (i = cnt - 1; i >= _apexIndex; i--)
					{
						child = _children[i];
						if (child.displayObject != null && child.internalVisible)
							_container.addChild(child.displayObject);
					}
				}
					break;
			}
		}
		
		public function applyController(c: Controller): void {
			_applyingController = c;
			var child: GObject;
			var length: Number = this._children.length;
			for(var i: Number = 0;i < length;i++) {
				child = this._children[i];
				child.handleControllerChanged(c);
			}
			_applyingController = null;
			c.runActions();
		}
		
		public function applyAllControllers(): void {
			var cnt: Number = this._controllers.length;
			for(var i: Number = 0;i < cnt;++i) {
				this.applyController(this._controllers[i]);
			}
		}
		
		public function adjustRadioGroupDepth(obj: GObject,c: Controller): void {
			var cnt: Number = this._children.length;
			var i: Number;
			var child: GObject;
			var myIndex: Number = -1,maxIndex: Number = -1;
			for(i = 0;i < cnt;i++) {
				child = this._children[i];
				if(child == obj) {
					myIndex = i;
				}
				else if((child is GButton)
					&& GButton(child).relatedController == c) {
					if(i > maxIndex)
						maxIndex = i;
				}
			}
			if(myIndex < maxIndex)
			{
				//如果正在applyingController，此时修改显示列表是危险的，但真正排除危险只能用显示列表的副本去做，这样性能可能损耗较大，
				//这里取个巧，让可能漏过的child补一下handleControllerChanged，反正重复执行是无害的。
				if(_applyingController!=null)
					_children[maxIndex].handleControllerChanged(_applyingController);
				this.swapChildrenAt(myIndex,maxIndex);
			}
		}
		
		public function getTransitionAt(index: Number): Transition {
			return this._transitions[index];
		}
		
		public function getTransition(transName: String): Transition {
			var cnt: Number = this._transitions.length;
			for(var i: Number = 0;i < cnt;++i) {
				var trans: Transition = this._transitions[i];
				if(trans.name == transName)
					return trans;
			}
			
			return null;
		}
		
		public function isChildInView(child: GObject): Boolean {
			if(this._displayObject.scrollRect != null) {
				return child.x + child.width >= 0 && child.x <= this.width
					&& child.y + child.height >= 0 && child.y <= this.height;
			}
			else if(this._scrollPane != null) {
				return this._scrollPane.isChildInView(child);
			}
			else
				return true;
		}
		
		public function getFirstChildInView(): int {
			var cnt: int = this._children.length;
			for(var i: int = 0;i < cnt;++i) {
				var child: GObject = this._children[i];
				if(this.isChildInView(child))
					return i;
			}
			return -1;
		}
		
		public function get scrollPane(): ScrollPane {
			return this._scrollPane;
		}
		
		public function get opaque():Boolean
		{
			return _opaque;
		}
		
		public function set opaque(value:Boolean):void {
			if(_opaque!=value) {
				_opaque = value;
				if (_opaque) {
					if(this._displayObject.hitArea==null)
						this._displayObject.hitArea = new Rectangle();
					
					if(this._displayObject.hitArea is Rectangle)
						this._displayObject.hitArea.setTo(0, 0, this.width, this.height);
					
					this._displayObject.mouseThrough = false;
				}
				else {
					if(this._displayObject.hitArea is Rectangle)
						this._displayObject.hitArea = null;
					
					this._displayObject.mouseThrough = true;
				}
			}
		}
		
		public function get margin(): Margin {
			return this._margin;
		}
		
		public function set margin(value: Margin):void {
			this._margin.copy(value);
			if(this._displayObject.scrollRect!=null) {
				this._container.pos(this._margin.left + _alignOffset.x, this._margin.top + _alignOffset.y);
			}
			this.handleSizeChanged();
		}
		
		/**
		 * @see ChildrenRenderOrder
		 */
		public function get childrenRenderOrder():int
		{
			return _childrenRenderOrder;
		}
		
		/**
		 * @see ChildrenRenderOrder
		 */
		public function set childrenRenderOrder(value:int):void
		{
			if (_childrenRenderOrder != value)
			{
				_childrenRenderOrder = value;
				buildNativeDisplayList();
			}
		}
		
		public function get apexIndex():int
		{
			return _apexIndex;
		}
		
		public function set apexIndex(value:int):void
		{
			if (_apexIndex != value)
			{
				_apexIndex = value;
				
				if (_childrenRenderOrder == ChildrenRenderOrder.Arch)
					buildNativeDisplayList();
			}
		}
		
		public function get mask():Sprite
		{
			return _mask;
		}
		
		public function set mask(value:Sprite):void
		{
			setMask(value, false);
		}
		
		public function setMask(value:Sprite, reversed:Boolean):void
		{
			if(_mask && _mask!=value)
			{
				if(_mask.blendMode == "destination-out")
					_mask.blendMode = null;
			}
			
			_mask = value;
			if(!_mask)
			{
				_displayObject.mask = null;
				if(_displayObject.hitArea is ChildHitArea)
					_displayObject.hitArea = null;
				return;
			}
			
			if(_mask.hitArea)
			{
				_displayObject.hitArea = new ChildHitArea(_mask, reversed);
				_displayObject.mouseThrough = false;
				_displayObject.hitTestPrior = true;
			}
			if(reversed)
			{
				_displayObject.mask = null;
				_displayObject.cacheAs = "bitmap";
				_mask.blendMode = "destination-out";
			}
			else
				_displayObject.mask = _mask;
		}
		
		public function get baseUserData():String
		{
			var buffer:ByteBuffer = packageItem.rawData;
			buffer.seek(0, 4);
			return buffer.readS();
		}
		
		protected function updateHitArea():void
		{
			if(this._displayObject.hitArea is PixelHitTest)
			{
				var hitTest:PixelHitTest = PixelHitTest(this._displayObject.hitArea);
				if(this.sourceWidth!=0)
					hitTest.scaleX = this.width/this.sourceWidth;
				if(this.sourceHeight!=0)
					hitTest.scaleY = this.height/this.sourceHeight;
			}
			else if(this._displayObject.hitArea is Rectangle)
			{
				this._displayObject.hitArea.setTo(0, 0, this.width, this.height);
			}
		}
		
		protected function updateMask():void {
			var rect:Rectangle = this._displayObject.scrollRect;
			if(rect==null)
				rect = new Rectangle();
			
			rect.x = this._margin.left;
			rect.y = this._margin.top;
			rect.width = this.width - this._margin.right;
			rect.height = this.height -this._margin.bottom;
			
			this._displayObject.scrollRect = rect;
		}
		
		protected function setupScroll(buffer:ByteBuffer): void {
			if (this._displayObject == this._container)
			{
				this._container = new Sprite();
				this._displayObject.addChild(this._container);
			}
			this._scrollPane = new ScrollPane(this);
			this._scrollPane.setup(buffer);
		}
		
		protected function setupOverflow(overflow: int): void {
			if(overflow == OverflowType.Hidden) {
				if (this._displayObject == this._container)
				{
					this._container = new Sprite();
					this._displayObject.addChild(this._container);
				}
				this.updateMask();
				this._container.pos(this._margin.left, this._margin.top);
			}
			else if(this._margin.left != 0 || this._margin.top != 0) {
				if (this._displayObject == this._container)
				{
					this._container = new Sprite();
					this._displayObject.addChild(this._container);
				}
				this._container.pos(this._margin.left, this._margin.top);
			}
		}
		
		override protected function handleSizeChanged(): void {
			super.handleSizeChanged();
			
			if(this._scrollPane)
				this._scrollPane.onOwnerSizeChanged();
			else if(this._displayObject.scrollRect != null)
				this.updateMask();
			
			if(this._displayObject.hitArea!=null)
				this.updateHitArea();
		}
		
		override protected function handleGrayedChanged(): void {
			var c: Controller = this.getController("grayed");
			if(c != null) {
				c.selectedIndex = this.grayed ? 1 : 0;
				return;
			}
			
			var v: Boolean = this.grayed;
			var cnt: Number = this._children.length;
			for(var i: Number = 0;i < cnt;++i) {
				this._children[i].grayed = v;
			}
		}
		
		override public function handleControllerChanged(c:Controller):void
		{
			super.handleControllerChanged(c);
			
			if (_scrollPane != null)
				_scrollPane.handleControllerChanged(c);
		}
		
		public function setBoundsChangedFlag(): void {
			if (!this._scrollPane && !this._trackBounds)
				return;
			
			if (!this._boundsChanged) {
				this._boundsChanged = true;
				
				Laya.timer.callLater(this, this.__render);
			}
		}
		
		private function __render(): void {
			if (this._boundsChanged) {
				var i1: int = 0;
				var len: Number = this._children.length;
				var child: GObject
				for(i1 = 0;i1 < len;i1++) {
					child = this._children[i1];
					child.ensureSizeCorrect();
				}
				this.updateBounds();
			}
		}
		
		public function ensureBoundsCorrect(): void {
			var i1: int = 0;
			var len: Number = this._children.length;
			var child: GObject
			for(i1 = 0;i1 < len;i1++) {
				child = this._children[i1];
				child.ensureSizeCorrect();
			}
			
			if (this._boundsChanged)
				this.updateBounds();
		}
		
		protected function updateBounds(): void {
			var ax: Number=0,ay: Number=0,aw: Number=0,ah: Number = 0;
			var len: Number = this._children.length;
			if(len > 0) {
				ax = Number.POSITIVE_INFINITY,ay = Number.POSITIVE_INFINITY;
				var ar: Number = Number.NEGATIVE_INFINITY,ab: Number = Number.NEGATIVE_INFINITY;
				var tmp: Number = 0;
				var i1: int = 0;

				for(i1 = 0;i1 < len;i1++) {
					var child: GObject = this._children[i1];
					tmp = child.x;
					if(tmp < ax)
						ax = tmp;
					tmp = child.y;
					if(tmp < ay)
						ay = tmp;
					tmp = child.x + child.actualWidth;
					if(tmp > ar)
						ar = tmp;
					tmp = child.y + child.actualHeight;
					if(tmp > ab)
						ab = tmp;
				}
				aw = ar - ax;
				ah = ab - ay;
			}
			this.setBounds(ax,ay,aw,ah);
		}
		
		public function setBounds(ax: Number, ay: Number, aw: Number, ah: Number): void {
			this._boundsChanged = false;
			
			if (this._scrollPane)
				this._scrollPane.setContentSize(Math.round(ax+aw), Math.round(ay+ah));
		}
		
		public function get viewWidth(): Number {
			if (this._scrollPane != null)
				return this._scrollPane.viewWidth;
			else
				return this.width - this._margin.left - this._margin.right;
		}
		
		public function set viewWidth(value: Number):void {
			if (this._scrollPane != null)
				this._scrollPane.viewWidth = value;
			else
				this.width = value + this._margin.left + this._margin.right;
		}
		
		public function get viewHeight(): Number {
			if (this._scrollPane != null)
				return this._scrollPane.viewHeight;
			else
				return this.height - this._margin.top - this._margin.bottom;
		}
		
		public function set viewHeight(value: Number):void {
			if (this._scrollPane != null)
				this._scrollPane.viewHeight = value;
			else
				this.height = value + this._margin.top + this._margin.bottom;
		}
		
		public function getSnappingPosition(xValue: Number, yValue: Number, resultPoint:Point=null): Point {
			if(!resultPoint)
				resultPoint = new Point();
			
			var cnt: Number = this._children.length;
			if(cnt == 0) {
				resultPoint.x = 0;
				resultPoint.y = 0;
				return resultPoint;
			}
			
			this.ensureBoundsCorrect();
			
			var obj: GObject = null;
			var prev: GObject = null;
			var i: Number = 0;
			if(yValue != 0) {
				for(;i < cnt;i++) {
					obj = this._children[i];
					if(yValue < obj.y) {
						if(i == 0) {
							yValue = 0;
							break;
						}
						else {
							prev = this._children[i - 1];
							if(yValue < prev.y + prev.actualHeight / 2) //top half part
								yValue = prev.y;
							else //bottom half part
								yValue = obj.y;
							break;
						}
					}
				}
				
				if(i == cnt)
					yValue = obj.y;
			}
			
			if(xValue != 0) {
				if(i > 0)
					i--;
				for(;i < cnt;i++) {
					obj = this._children[i];
					if(xValue < obj.x) {
						if(i == 0) {
							xValue = 0;
							break;
						}
						else {
							prev = this._children[i - 1];
							if(xValue < prev.x + prev.actualWidth / 2) //top half part
								xValue = prev.x;
							else //bottom half part
								xValue = obj.x;
							break;
						}
					}
				}
				
				if(i == cnt)
					xValue = obj.x;
			}
			
			resultPoint.x = xValue;
			resultPoint.y = yValue;
			return resultPoint;
		}
		
		public function childSortingOrderChanged(child: GObject, oldValue: Number, newValue: Number = 0): void {
			if (newValue == 0) {
				this._sortingChildCount--;
				this.setChildIndex(child, this._children.length);
			}
			else {
				if (oldValue == 0)
					this._sortingChildCount++;
				
				var oldIndex: Number = this._children.indexOf(child);
				var index: Number = this.getInsertPosForSortingChild(child);
				if (oldIndex < index)
					this._setChildIndex(child, oldIndex, index - 1);
				else
					this._setChildIndex(child, oldIndex, index);
			}
		}
		
		override public function constructFromResource():void
		{
			constructFromResource2(null, 0);
		}
		
		internal function constructFromResource2(objectPool:Vector.<GObject>, poolIndex:int):void
		{
			if (!packageItem.decoded)
			{
				packageItem.decoded = true;
				TranslationHelper.translateComponent(packageItem);
			}
			
			var i:int;
			var dataLen:int;
			var curPos:int;
			var nextPos:int;
			var f1:Number;
			var f2:Number;
			var i1:int;
			var i2:int;
			
			var buffer:ByteBuffer = packageItem.rawData;
			buffer.seek(0, 0);
			
			_underConstruct = true;
			
			sourceWidth = buffer.getInt32();
			sourceHeight = buffer.getInt32();
			initWidth = sourceWidth;
			initHeight = sourceHeight;
			
			setSize(sourceWidth, sourceHeight);
			
			if (buffer.readBool())
			{
				minWidth = buffer.getInt32();
				maxWidth = buffer.getInt32();
				minHeight = buffer.getInt32();
				maxHeight = buffer.getInt32();
			}
			
			if (buffer.readBool())
			{
				f1 = buffer.getFloat32();
				f2 = buffer.getFloat32();
				internalSetPivot(f1, f2, buffer.readBool());
			}
			
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
				buffer.seek(0, 7);
				setupScroll(buffer);
				buffer.pos = savedPos;
			}
			else
				setupOverflow(overflow);
			
			if (buffer.readBool())
				buffer.skip(8);
			
			_buildingDisplayList = true;
			
			buffer.seek(0, 1);
			
			var controllerCount:int = buffer.getInt16();
			for (i = 0; i < controllerCount; i++)
			{
				nextPos = buffer.getInt16();
				nextPos += buffer.pos;
				
				var controller:Controller = new Controller();
				_controllers.push(controller);
				controller.parent = this;
				controller.setup(buffer);
				
				buffer.pos = nextPos;
			}
			
			buffer.seek(0, 2);
			
			var child:GObject;
			var childCount:int = buffer.getInt16();
			for (i = 0; i < childCount; i++)
			{
				dataLen = buffer.getInt16();
				curPos = buffer.pos;
				
				if (objectPool != null)
					child = objectPool[poolIndex + i];
				else
				{
					buffer.seek(curPos, 0);
					
					var type:int = buffer.readByte();
					var src:String = buffer.readS();
					var pkgId:String = buffer.readS();
					
					var pi:PackageItem = null;
					if (src != null)
					{
						var pkg:UIPackage;
						if (pkgId != null)
							pkg = UIPackage.getById(pkgId);
						else
							pkg = packageItem.owner;
						
						pi = pkg != null ? pkg.getItemById(src) : null;
					}
					
					if (pi != null)
					{
						child = UIObjectFactory.newObject(pi);
						child.packageItem = pi;
						child.constructFromResource();
					}
					else
						child = UIObjectFactory.newObject2(type);
				}
				
				child._underConstruct = true;
				child.setup_beforeAdd(buffer, curPos);
				child.parent = this;
				_children.push(child);
				
				buffer.pos = curPos + dataLen;
			}
			
			buffer.seek(0, 3);
			this.relations.setup(buffer, true);
			
			buffer.seek(0, 2);
			buffer.skip(2);
			
			for (i = 0; i < childCount; i++)
			{
				nextPos = buffer.getInt16();
				nextPos += buffer.pos;
				
				buffer.seek(buffer.pos, 3);
				_children[i].relations.setup(buffer, false);
				
				buffer.pos = nextPos;
			}
			
			buffer.seek(0, 2);
			buffer.skip(2);
			
			for (i = 0; i < childCount; i++)
			{
				nextPos = buffer.getInt16();
				nextPos += buffer.pos;
				
				child = _children[i];
				child.setup_afterAdd(buffer, buffer.pos);
				child._underConstruct = false;

				buffer.pos = nextPos;
			}
			
			buffer.seek(0, 4);
			
			buffer.skip(2); //customData
			this.opaque = buffer.readBool();
			var maskId:int = buffer.getInt16();
			if (maskId != -1)
			{
				this.setMask(getChildAt(maskId).displayObject, buffer.readBool());
			}
			var hitTestId:String = buffer.readS();
			if (hitTestId != null)
			{
				pi = packageItem.owner.getItemById(hitTestId);
				if (pi != null && pi.pixelHitTestData != null)
				{
					i1 = buffer.getInt32();
					i2 = buffer.getInt32();
					this._displayObject.hitArea = new PixelHitTest(pi.pixelHitTestData, i1, i2);
					this._displayObject.mouseThrough = false;
					this._displayObject.hitTestPrior = true;
				}
			}
			
			buffer.seek(0, 5);
			
			var transitionCount:int = buffer.getInt16();
			for (i = 0; i < transitionCount; i++)
			{
				nextPos = buffer.getInt16();
				nextPos += buffer.pos;
				
				var trans:Transition = new Transition(this);
				trans.setup(buffer);
				_transitions.push(trans);
				
				buffer.pos = nextPos;
			}
			
			if (_transitions.length > 0)
			{
				this.displayObject.on(Event.DISPLAY, this, this.___added);
				this.displayObject.on(Event.UNDISPLAY, this, this.___removed);
			}
			
			applyAllControllers();
			
			_buildingDisplayList = false;
			_underConstruct = false;
			
			buildNativeDisplayList();
			setBoundsChangedFlag();
			
			if (packageItem.objectType != ObjectType.Component)
				constructExtension(buffer);
			
			constructFromXML(null);
		}
		
		protected function constructExtension(buffer:ByteBuffer):void
		{
		}
		
		protected function constructFromXML(xml:Object):void
		{
		}
		
		override public function setup_afterAdd(buffer:ByteBuffer, beginPos:int):void
		{
			super.setup_afterAdd(buffer, beginPos);
			
			buffer.seek(beginPos, 4);
			
			var pageController:int = buffer.getInt16();
			if (pageController != -1 && _scrollPane != null)
				_scrollPane.pageController = _parent.getControllerAt(pageController);
			
			var cnt:int = buffer.getInt16();
			for (var i:int = 0; i < cnt; i++)
			{
				var cc:Controller = getController(buffer.readS());
				var pageId:String = buffer.readS();
				if(cc)
					cc.selectedPageId = pageId;
			}
		}
		
		private function ___added():void {
			var cnt: int = this._transitions.length;
			for(var i: int = 0;i < cnt;++i) {
				_transitions[i].onOwnerAddedToStage();
			}
		}
		
		private function ___removed(): void {
			var cnt: int = this._transitions.length;
			for(var i: int = 0;i < cnt;++i) {
				_transitions[i].onOwnerRemovedFromStage();
			}
		}
	}
}