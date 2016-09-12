package fairygui {
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Point;
	import laya.maths.Rectangle;

    public class GComponent extends GObject {
        private var _sortingChildCount: Number = 0;
        private var _opaque: Boolean;

        protected var _margin: Margin;
        protected var _trackBounds: Boolean;
        protected var _boundsChanged: Boolean;
        
        public var _buildingDisplayList: Boolean;
        public var _children: Vector.<GObject>;
        public var _controllers: Vector.<Controller>;
        public var _transitions: Vector.<Transition>;
        public var _container: Sprite;
        public var _scrollPane: ScrollPane;

        public function GComponent() {
            super();
            this._children = new Vector.<GObject>();
            this._controllers = new Vector.<Controller>();
            this._transitions = new Vector.<Transition>();
            this._margin = new Margin();
        }

        override protected function createDisplayObject(): void {
            super.createDisplayObject();
            this._displayObject.mouseEnabled = true;
			this._displayObject.mouseThrough = true;
            this._container = this._displayObject;
        }

		override public function dispose(): void {
            var numChildren: Number = this._children.length;
            for(var i: Number = numChildren - 1;i >= 0;--i) {
                var obj:GObject = this._children[i];
                obj.parent = null;//avoid removeFromParent call
                obj.dispose();
            }

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
                if(child.inContainer)
                    this._container.removeChild(child.displayObject);

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
                if(child.finalVisible && child.name == name)
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

        private function _setChildIndex(child: GObject,oldIndex: Number,index: Number = 0): void {
            var cnt: Number = this._children.length;
            if(index > cnt)
                index = cnt;

            if(oldIndex == index)
                return;

            this._children.splice(oldIndex,1);
            this._children.splice(index,0,child);

            if(child.inContainer) {
                var displayIndex: Number = 0;
                for(var i: Number = 0;i < index;i++) {
                    var g: GObject = this._children[i];
                    if(g.inContainer)
                        displayIndex++;
                }
                if(displayIndex == this._container.numChildren)
                    displayIndex--;
                this._container.setChildIndex(child.displayObject,displayIndex);

                this.setBoundsChangedFlag();
            }
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

        public function addController(controller: Controller): void {
            this._controllers.push(controller);
            controller._parent = this;
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

            c._parent = null;
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

            if(child is GGroup) {
                var length: Number = this._children.length;
                for(var i: Number = 0;i < length;i++) {
                    var g: GObject = this._children[i];
                    if(g.group == child)
                        this.childStateChanged(g);
                }
                return;
            }

            if(!child.displayObject)
                return;

            if(child.finalVisible) {
                if(!child.displayObject.parent) {
                    var index: Number = 0;
                    var length1: Number = this._children.length;
                    for(var i1: Number = 0;i1 < length1;i1++) {
                        g = this._children[i1];
                        if(g == child)
                            break;

                        if(g.displayObject && g.displayObject.parent)
                            index++;
                    }
                    this._container.addChildAt(child.displayObject,index);
                }
            }
            else {
                if(child.displayObject.parent)
                    this._container.removeChild(child.displayObject);
            }
        }

        public function applyController(c: Controller): void {
            var child: GObject;
            var length: Number = this._children.length;
            for(var i: Number = 0;i < length;i++) {
                child = this._children[i];
                child.handleControllerChanged(c);
            }
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
                this.swapChildrenAt(myIndex,maxIndex);
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
        
        public function getFirstChildInView(): Number {
            var cnt: Number = this._children.length;
            for(var i: Number = 0;i < cnt;++i) {
                var child: GObject = this._children[i];
                if(this.isChildInView(child))
                    return i;
            }
            return -1;
        }

        public function get scrollPane(): ScrollPane {
            return this._scrollPane;
        }

        public function get opaque(): Boolean {
            return this._opaque;
        }

        public function set opaque(value: Boolean):void {
            if(this._opaque != value) {
                this._opaque = value;
                if(this._opaque)
				{
                    this.updateOpaque();
					this._displayObject.mouseThrough = false;
				}
                else
				{
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
                this._container.pos(this._margin.left, this._margin.top);
            }
            this.handleSizeChanged();
        }
        
        protected function updateOpaque():void {
            if(!this._displayObject.hitArea)
                this._displayObject.hitArea = new Rectangle();
            this._displayObject.hitArea.setTo(0, 0, this.width, this.height);
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

        protected function setupScroll(scrollBarMargin: Margin,
            scroll: int,
            scrollBarDisplay: int,
            flags: Number,
            vtScrollBarRes: String,
            hzScrollBarRes: String): void {
            this._container = new Sprite();
            this._displayObject.addChild(this._container);
            this._scrollPane = new ScrollPane(this,scroll,scrollBarMargin,scrollBarDisplay,flags,vtScrollBarRes,hzScrollBarRes);

            this.setBoundsChangedFlag();
        }
        
        protected function setupOverflow(overflow: int): void {
            if(overflow == OverflowType.Hidden) {
                this._container = new Sprite();
                this._displayObject.addChild(this._container);
                this.updateMask();
                this._container.pos(this._margin.left, this._margin.top);
            }
            else if(this._margin.left != 0 || this._margin.top != 0) {
                this._container = new Sprite();
                this._displayObject.addChild(this._container);
                this._container.pos(this._margin.left, this._margin.top);
            }

            this.setBoundsChangedFlag();
        }

        override protected function handleSizeChanged(): void {
			super.handleSizeChanged();
			
            if(this._scrollPane)
                this._scrollPane.setSize(this.width,this.height);
            else if(this._displayObject.scrollRect != null)
                this.updateMask();
			
            if(this._opaque)
                this.updateOpaque();
        }

        override protected function handleGrayChanged(): void {
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

        public function setBoundsChangedFlag(): void {
            if (!this._scrollPane && !this._trackBounds)
                return;

            if (!this._boundsChanged) {
                this._boundsChanged = true;

                Laya.timer.callLater(this, this.__render);
            }
        }

        private function __render(): void {
            if (this._boundsChanged)
                this.updateBounds();
        }

        public function ensureBoundsCorrect(): void {
            if (this._boundsChanged)
                this.updateBounds();
        }

        protected function updateBounds(): void {
            var ax: Number,ay: Number,aw: Number,ah: Number = 0;
            if(this._children.length > 0) {
                ax = Number.POSITIVE_INFINITY,ay = Number.POSITIVE_INFINITY;
                var ar: Number = Number.NEGATIVE_INFINITY,ab: Number = Number.NEGATIVE_INFINITY;
                var tmp: Number = 0;

                var i: Number = 0;
                var length1: Number = this._children.length;
                
                for(i1 = 0;i1 < length1;i1++) {
                    child = this._children[i1];
                    child.ensureSizeCorrect();
                }
                
                for(var i1: Number = 0;i1 < length1;i1++) {
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
            else {
                ax = 0;
                ay = 0;
                aw = 0;
                ah = 0;
            }

            this.setBounds(ax,ay,aw,ah);
        }

        public function setBounds(ax: Number, ay: Number, aw: Number, ah: Number = 0): void {
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

        override public function constructFromResource(pkgItem: PackageItem): void {
            this._packageItem = pkgItem;
            this.constructFromXML(this._packageItem.owner.getItemAsset(this._packageItem));
        }

        protected function constructFromXML(xml: Object): void {
            this._underConstruct = true;
            
            var str: String;
            var arr: Array;

            str = xml.getAttribute("size");
            arr = str.split(",");
            this._sourceWidth = parseInt(arr[0]);
            this._sourceHeight = parseInt(arr[1]);
            this._initWidth = this._sourceWidth;
            this._initHeight = this._sourceHeight;
            
            this.setSize(this._sourceWidth,this._sourceHeight);
			
			str = xml.getAttribute("pivot");
			if(str && str!="") {
				arr = str.split(",");
				str = xml.getAttribute("anchor");
				internalSetPivot(parseFloat(arr[0]), parseFloat(arr[1]), str=="true");				
			}

            str = xml.getAttribute("opaque");
            this.opaque = str != "false";
            
            var overflow: int;
            str = xml.getAttribute("overflow");
            if (str && str!="")
                overflow = OverflowType.parse(str);
            else
                overflow = OverflowType.Visible;
                
            str = xml.getAttribute("margin");
            if(str && str!="")
                this._margin.parse(str);
                
            if(overflow==OverflowType.Scroll) {
                var scroll: int;
                str = xml.getAttribute("scroll");
                if (str && str!="")
                    scroll = ScrollType.parse(str);
                else
                    scroll = ScrollType.Vertical;
    
                var scrollBarDisplay: int;
                str = xml.getAttribute("scrollBar");
                if (str && str!="")
                    scrollBarDisplay = ScrollBarDisplayType.parse(str);
                else
                    scrollBarDisplay = ScrollBarDisplayType.Default;
                
                var scrollBarFlags: Number;
                str = xml.getAttribute("scrollBarFlags");
                if(str && str!="")
                    scrollBarFlags = parseInt(str);
                else
                    scrollBarFlags = 0;
                
                var scrollBarMargin: Margin = new Margin();
                str = xml.getAttribute("scrollBarMargin");
                if(str && str!="")
                    scrollBarMargin.parse(str);
                    
                var vtScrollBarRes: String;
                var hzScrollBarRes: String;
                str = xml.getAttribute("scrollBarRes");
                if(str && str!="") {
                    arr = str.split(",");
                    vtScrollBarRes = arr[0];
                    hzScrollBarRes = arr[1];
                }
            
                this.setupScroll(scrollBarMargin,scroll,scrollBarDisplay,scrollBarFlags,vtScrollBarRes,hzScrollBarRes);
            }
            else
                this.setupOverflow(overflow);

            this._buildingDisplayList = true;

            var col: Array = xml.childNodes;
            if(col) {
                var displayList: Array;
                var controller: Controller;
                var length1: Number = col.length;
                for(var i1: Number = 0;i1 < length1;i1++) {
                    var cxml: Object = col[i1];
                    if(cxml.nodeName == "displayList") {
                        displayList = cxml.childNodes;
                        continue;
                    }
                    else if(cxml.nodeName == "controller") {
                        controller = new Controller();
                        this._controllers.push(controller);
                        controller._parent = this;
                        controller.setup(cxml);
                    }
                }

                if(displayList!=null && displayList.length>0) {
                    var u: GObject;
                    var length2: Number = displayList.length;
                    for(var i2: Number = 0;i2 < length2;i2++) {
                        cxml = displayList[i2];
                        if(cxml.nodeType!=1)
                            continue;
                        u = this.constructChild(cxml);
                        if(!u)
                            continue;

                        u._underConstruct = true;
                        u._constructingData = cxml;
                        u.setup_beforeAdd(cxml);
                        this.addChild(u);
                    }
                }

                this.relations.setup(xml);

                length2 = this._children.length;
                for(i2 = 0;i2 < length2;i2++) {
                    u = this._children[i2];
                    u.relations.setup(u._constructingData);
                }
                
                for(i2 = 0;i2 < length2;i2++) {
                    u = this._children[i2];
                    u.setup_afterAdd(u._constructingData);
                    u._underConstruct = false;
                    u._constructingData = null;
                }

                var trans: Transition;
                for(i1 = 0;i1 < length1;i1++) {
                    cxml = col[i1];
                    if(cxml.nodeName == "transition") {
                        trans = new Transition(this);
                        this._transitions.push(trans);
                        trans.setup(cxml);
                    }
                }
                
                if(this._transitions.length>0)
                {
                    this.displayObject.on(Event.DISPLAY, this, this.___added);
                    this.displayObject.on(Event.UNDISPLAY, this, this.___removed);
                }
            }

            this.applyAllControllers();

            this._buildingDisplayList = false;
            this._underConstruct = false;
            
            length1 = this._children.length;
            for (i1 = 0; i1 < length1; i1++) {
                var child: GObject = this._children[i1];
                if (child.displayObject != null && child.finalVisible)
                    this._container.addChild(child.displayObject);
            }
        }
        
        private function ___added():void {
            var cnt: Number = this._transitions.length;
            for(var i: Number = 0;i < cnt;++i) {
                var trans: Transition = this._transitions[i];
                if(trans.autoPlay)
                    trans.play(null, trans.autoPlayRepeat, trans.autoPlayDelay);
            }
        }
        
        private function ___removed(): void {
            var cnt: Number = this._transitions.length;
            for(var i: Number = 0;i < cnt;++i) {
                var trans: Transition = this._transitions[i];
                trans.stop(false, true);
            }
        }

        private function constructChild(xml: Object): GObject {
            var pkgId: String = xml.getAttribute("pkg");
            var thisPkg: UIPackage = this._packageItem.owner;
            var pkg: UIPackage;
            if (pkgId && pkgId != thisPkg.id) {
                pkg = UIPackage.getById(pkgId);
                if (!pkg)
                    return null;
            }
            else
                pkg = thisPkg;

            var src: String = xml.getAttribute("src");
            if (src) {
                var pi: PackageItem = pkg.getItem(src);
                if (!pi)
                    return null;

                var g: GObject = pkg.createObject2(pi);
                return g;
            }
            else {
                var str: String = xml.nodeName;
                if (str == "text" && xml.getAttribute("input") == "true")
                    g = new GTextInput();
                else
                    g = UIObjectFactory.newObject2(str);
                return g;
            }
        }
    }
}