package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.filters.ColorFilter;
	import laya.maths.Point;
	import laya.maths.Rectangle;

    public class GObject {
        public var data: Object;

        private var _x: Number = 0;
        private var _y: Number = 0;
        private var _width: Number = 0;
        private var _height: Number = 0;
        private var _alpha: Number = 1;
        private var _rotation: Number = 0;
        private var _visible: Boolean = true;
        private var _touchable: Boolean = true;
        private var _grayed: Boolean = false;
        private var _draggable: Boolean = false;
        private var _scaleX: Number = 1;
        private var _scaleY: Number = 1;
		private var _skewX: Number = 0;
		private var _skewY: Number = 0;
		private var _pivotX: Number = 0;
		private var _pivotY: Number = 0;
		private var _pivotAsAnchor: Boolean = false;
        private var _pivotOffsetX: Number = 0;
        private var _pivotOffsetY: Number = 0;
        private var _sortingOrder: Number = 0;
        private var _internalVisible: Number = 1;
        private var _focusable: Boolean = false;
        private var _tooltips: String;
		private var _pixelSnapping: Boolean = false;
		
        private var _relations: Relations;
        private var _group: GGroup;
        private var _gearDisplay: GearDisplay;
        private var _gearXY: GearXY;
        private var _gearSize: GearSize;
        private var _gearLook: GearLook;
        private var _dragBounds: Rectangle;
        
        protected var _displayObject: Sprite;
        protected var _yOffset: Number = 0;
		//Size的实现方式，有两种，0-GObject的w/h等于DisplayObject的w/h。1-GObject的sourceWidth/sourceHeight等于DisplayObject的w/h，剩余部分由scale实现
		protected var _sizeImplType:int;
		
        public var _parent: GComponent;
        public var _rawWidth: Number = 0;
        public var _rawHeight: Number = 0;
        public var _sourceWidth: Number = 0;
        public var _sourceHeight: Number = 0;
        public var _initWidth: Number = 0;
        public var _initHeight: Number = 0;
        public var _id: String;
        public var _name: String;
        public var _packageItem: PackageItem;
        public var _underConstruct: Boolean;
        public var _constructingData: Object;
        public var _gearLocked: Boolean;

        public static var _gInstanceCounter: Number = 0;

        public function GObject() {
            super();

            this._id = "" + GObject._gInstanceCounter++;
            this._name = "";

            this.createDisplayObject();

            this._relations = new Relations(this);

            this._gearDisplay = new GearDisplay(this);
            this._gearXY = new GearXY(this);
            this._gearSize = new GearSize(this);
            this._gearLook = new GearLook(this);
        }

        public function get id(): String {
            return this._id;
        }

        public function get name(): String {
            return this._name;
        }

        public function set name(value: String):void {
            this._name = value;
        }

        public function get x(): Number {
            return this._x;
        }

        public function set x(value: Number):void {
            this.setXY(value,this._y);
        }

        public function get y(): Number {
            return this._y;
        }

        public function set y(value: Number):void {
            this.setXY(this._x,value);
        }

        public function setXY(xv: Number,yv: Number): void {
            if(this._x != xv || this._y != yv) {
                var dx: Number = xv - this._x;
                var dy: Number = yv - this._y;
                this._x = xv;
                this._y = yv;

                this.handleXYChanged();
                if(this is GGroup)
                    GGroup(this).moveChildren(dx,dy);

                if(this._gearXY.controller)
                    this._gearXY.updateState();
                    
                if(this._parent && !(this._parent is GList)) {
                    this._parent.setBoundsChangedFlag();
                    this.displayObject.event(Events.XY_CHANGED);
                }
            }
        }
		
		public function get pixelSnapping():Boolean
		{
			return this._pixelSnapping;
		}
		
		public function set pixelSnapping(value:Boolean):void
		{
			if(this._pixelSnapping!=value)
			{
				this._pixelSnapping = value;
				this.handleXYChanged();
			}
		}
		
        public function center(restraint: Boolean = false): void {
            var r: GComponent;
            if(this._parent != null)
                r = this.parent;
            else
                r = this.root;

            this.setXY((r.width - this.width) / 2,(r.height - this.height) / 2);
            if(restraint) {
                this.addRelation(r,RelationType.Center_Center);
                this.addRelation(r,RelationType.Middle_Middle);
            }
        }

        public function get width(): Number {
            this.ensureSizeCorrect();
            if(this._relations.sizeDirty)
                this._relations.ensureRelationsSizeCorrect();
            return this._width;
        }

        public function set width(value: Number):void {
            this.setSize(value,this._rawHeight);
        }

        public function get height(): Number {
            this.ensureSizeCorrect();
            if(this._relations.sizeDirty)
                this._relations.ensureRelationsSizeCorrect();
            return this._height;
        }

        public function set height(value: Number):void {
            this.setSize(this._rawWidth,value);
        }

        public function setSize(wv: Number,hv: Number,ignorePivot: Boolean = false): void {
            if(this._rawWidth != wv || this._rawHeight != hv) {
                this._rawWidth = wv;
                this._rawHeight = hv;
                if(wv < 0)
                    wv = 0;
                if(hv < 0)
                    hv = 0;
                var dWidth: Number = wv - this._width;
                var dHeight: Number = hv - this._height;
                this._width = wv;
                this._height = hv;

				this.handleSizeChanged();
                if(this._pivotX != 0 || this._pivotY != 0) {
					if(!this._pivotAsAnchor)
					{
	                    if(!ignorePivot)
	                        this.setXY(this.x - this._pivotX * dWidth, this.y - this._pivotY * dHeight);
	                    this.updatePivotOffset();
					}
					else
						this.applyPivot();
                }

                if(this._gearSize.controller)
                    this._gearSize.updateState();

                if(this._parent) {
                    this._relations.onOwnerSizeChanged(dWidth,dHeight);
                    this._parent.setBoundsChangedFlag();
                }

                this.displayObject.event(Events.SIZE_CHANGED);
            }
        }

        public function ensureSizeCorrect(): void {
        }

        public function get sourceHeight(): Number {
            return this._sourceHeight;
        }

        public function get sourceWidth(): Number {
            return this._sourceWidth;
        }

        public function get initHeight(): Number {
            return this._initHeight;
        }

        public function get initWidth(): Number {
            return this._initWidth;
        }

        public function get actualWidth(): Number {
            return this.width * this._scaleX;
        }
        
        public function get actualHeight(): Number {
            return this.height * this._scaleY;
        }

        public function get scaleX(): Number {
            return this._scaleX;
        }

        public function set scaleX(value: Number):void {
            this.setScale(value,this._scaleY);
        }

        public function get scaleY(): Number {
            return this._scaleY;
        }

        public function set scaleY(value: Number):void {
            this.setScale(this._scaleX,value);
        }

        public function setScale(sx: Number,sy: Number):void {
            if(this._scaleX != sx || this._scaleY != sy) {
                this._scaleX = sx;
                this._scaleY = sy;
				this.handleScaleChanged();
				this.applyPivot();

                if(this._gearSize.controller)
                    this._gearSize.updateState();
            }
        }
		
		public function get skewX(): Number {
			return this._skewX;
		}
		
		public function set skewX(value: Number):void {
			this.setScale(value,this._skewY);
		}
		
		public function get skewY(): Number {
			return this._skewY;
		}
		
		public function set skewY(value: Number):void {
			this.setSkew(this._skewX,value);
		}
		
		public function setSkew(sx: Number,sy: Number):void {
			if(this._skewX != sx || this._skewY != sy) {
				this._skewX = sx;
				this._skewY = sy;
				if(this._displayObject!=null) {
					this._displayObject.skew(sx, sy);
					this.applyPivot();
				}
			}
		}

        public function get pivotX(): Number {
            return this._pivotX;
        }

        public function set pivotX(value: Number):void {
            this.setPivot(value,this._pivotY);
        }

        public function get pivotY(): Number {
            return this._pivotY;
        }

        public function set pivotY(value: Number):void {
            this.setPivot(this._pivotX,value);
        }
        
        public function setPivot(xv: Number,yv: Number = 0, asAnchor:Boolean=false): void {
            if(this._pivotX != xv || this._pivotY != yv || this._pivotAsAnchor!=asAnchor) {
                this._pivotX = xv;
                this._pivotY = yv;
				this._pivotAsAnchor = asAnchor;
				
                this.updatePivotOffset();
				this.handleXYChanged();
            }
        }
		
		protected function internalSetPivot(xv:Number, yv:Number, asAnchor:Boolean):void {
			this._pivotX = xv;
			this._pivotY = yv;
			this._pivotAsAnchor = asAnchor;
			if(this._pivotAsAnchor)
				this.handleXYChanged();
		}
		
		private function updatePivotOffset():void {
			if(this._displayObject!=null)
			{
				if(this._displayObject.transform && (this._pivotX!=0 || this._pivotY!=0))
				{
					if(this._sizeImplType==0) {
						GObject.sHelperPoint.x = this._pivotX*_width;
						GObject.sHelperPoint.y = this._pivotY*_height;
					}
					else {
						GObject.sHelperPoint.x = this._pivotX*this._sourceWidth;
						GObject.sHelperPoint.y = this._pivotY*this._sourceHeight;
					}
					var pt:Point = this._displayObject.transform.transformPoint(GObject.sHelperPoint);
					this._pivotOffsetX = this._pivotX*_width - pt.x;
					this._pivotOffsetY = this._pivotY*_height - pt.y;
				}
				else					
				{
					this._pivotOffsetX = 0;
					this._pivotOffsetY = 0;
				}				
			}
		}

        private function applyPivot(): void {
            if(this._pivotX != 0 || this._pivotY != 0) {
                this.updatePivotOffset();
				this.handleXYChanged();
            }                
        }

        public function get touchable(): Boolean {
            return this._touchable;
        }

        public function set touchable(value: Boolean):void {
            this._touchable = value;
            if((this is GImage) || (this is GMovieClip)
                 || (this is GTextField) && !(this is GTextInput) && !(this is GRichTextField))
                //Touch is not supported by GImage/GMovieClip/GTextField
                return;

            if(this._displayObject != null) 
                this._displayObject.mouseEnabled = this._touchable;
        }

        public function get grayed(): Boolean {
            return this._grayed;
        }

        public function set grayed(value: Boolean):void {
            if(this._grayed != value) {
                this._grayed = value;
                this.handleGrayChanged();
            }
        }

        public function get enabled(): Boolean {
            return !this._grayed && this._touchable;
        }

        public function set enabled(value: Boolean):void {
            this.grayed = !value;
            this.touchable = value;
        }

        public function get rotation(): Number {
            return this._rotation;
        }

        public function set rotation(value: Number):void {
            if(this._rotation != value) {
                this._rotation = value;
                if(this._displayObject!=null) {
                    this._displayObject.rotation = this.normalizeRotation;
					this.applyPivot();
				}
				
                if(this._gearLook.controller)
                    this._gearLook.updateState();
            }
        }

        public function get normalizeRotation(): Number {
            var rot: Number = this._rotation % 360;
            if(rot > 180)
                rot = rot - 360;
            else if(rot < -180)
                rot = 360 + rot;
            return rot;
        }

        public function get alpha(): Number {
            return this._alpha;
        }

        public function set alpha(value: Number):void {
            if(this._alpha!=value) {
                this._alpha = value;
                this.updateAlpha();
             }
        }
        
        protected function updateAlpha():void {
            if(this._displayObject)
                this._displayObject.alpha = this._alpha;

            if(this._gearLook.controller)
                this._gearLook.updateState();
        }

        public function get visible(): Boolean {
            return this._visible;
        }

        public function set visible(value: Boolean):void {
            if (this._visible != value) {
                this._visible = value;
                if (this._displayObject)
                    this._displayObject.visible = this._visible;
                if (this._parent)
                    this._parent.childStateChanged(this);
            }
        }

        public function set internalVisible(value: Number):void {
            if(value < 0)
                value = 0;
            var oldValue: Boolean = this._internalVisible > 0;
            var newValue: Boolean = value > 0;
            this._internalVisible = value;
            if(oldValue != newValue) {
                if(this._parent)
                    this._parent.childStateChanged(this);
            }
        }
        
        public function get internalVisible(): Number {
            return this._internalVisible;
        }

        public function get finalVisible(): Boolean {
            return this._visible && this._internalVisible>0 && (!this._group || this._group.finalVisible);
        }

        public function get sortingOrder(): Number {
            return this._sortingOrder;
        }

        public function set sortingOrder(value: Number):void {
            if (value < 0)
                value = 0;
            if (this._sortingOrder != value) {
                var old: Number = this._sortingOrder;
                this._sortingOrder = value;
                if (this._parent != null)
                    this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
            }
        }

        public function get focusable(): Boolean {
            return this._focusable;
        }

        public function set focusable(value: Boolean):void {
            this._focusable = value;
        }

        public function get focused(): Boolean {
            return this.root.focus == this;
        }

        public function requestFocus(): void {
            var p: GObject = this;
            while (p && !p._focusable)
                p = p.parent;
            if (p != null)
                this.root.focus = p;
        }

        public function get tooltips(): String {
            return this._tooltips;
        }

        public function set tooltips(value: String):void {
            this._tooltips = value;
        }

        public function get inContainer(): Boolean {
            return this._displayObject != null && this._displayObject.parent != null;
        }

        public function get onStage(): Boolean {
            return this._displayObject != null && this._displayObject.stage != null;
        }

        public function get resourceURL(): String {
            if (this._packageItem != null)
                return "ui://" + this._packageItem.owner.id + this._packageItem.id;
            else
                return null;
        }

        public function set group(value: GGroup):void {
            this._group = value;
        }

        public function get group(): GGroup {
            return this._group;
        }

        public function get gearDisplay(): GearDisplay {
            return this._gearDisplay;
        }

        public function get gearXY(): GearXY {
            return this._gearXY;
        }

        public function get gearSize(): GearSize {
            return this._gearSize;
        }
        
        public function get gearLook(): GearLook {
            return this._gearLook;
        }

        public function get relations(): Relations {
            return this._relations;
        }

        public function addRelation(target: GObject, relationType: Number, usePercent: Boolean = false): void {
            this._relations.add(target, relationType, usePercent);
        }

        public function removeRelation(target: GObject, relationType: Number = 0): void {
            this._relations.remove(target, relationType);
        }

        public function get displayObject(): Sprite {
            return this._displayObject;
        }

        public function get parent(): GComponent {
            return this._parent;
        }

        public function set parent(val: GComponent):void {
            this._parent = val;
        }

        public function removeFromParent(): void {
            if (this._parent)
                this._parent.removeChild(this);
        }

        public function get root(): GRoot {
            if(this is GRoot)
                return GRoot(this);
                
            var p: GObject = this._parent;
            while (p) {
                if (p is GRoot)
                    return GRoot(p);
                p = p.parent;
            }
            return GRoot.inst;
        }
        
		final public function get asCom():GComponent
		{
			return this as GComponent;
		}
		
		final public function get asButton():GButton
		{
			return this as GButton;
		}
		
		final public function get asLabel():GLabel
		{
			return this as GLabel;
		}
		
		final public function get asProgress():GProgressBar
		{
			return this as GProgressBar;
		}
		
		final public function get asTextField():GTextField
		{
			return this as GTextField;
		}
		
		final public function get asRichTextField():GRichTextField
		{
			return this as GRichTextField;
		}
		
		final public function get asTextInput():GTextInput
		{
			return this as GTextInput;
		}
		
		final public function get asLoader():GLoader
		{
			return this as GLoader;
		}
		
		final public function get asList():GList
		{
			return this as GList;
		}
		
		final public function get asGraph():GGraph
		{
			return this as GGraph;
		}
		
		final public function get asGroup():GGroup
		{
			return this as GGroup;
		}
		
		final public function get asSlider():GSlider
		{
			return this as GSlider;
		}
		
		final public function get asComboBox():GComboBox
		{
			return this as GComboBox;
		}
		
		final public function get asMovieClip():GMovieClip
		{
			return this as GMovieClip;
		}					

        public function get text(): String {
            return null;
        }

        public function set text(value: String):void {
        }

        public function dispose(): void {
            this.removeFromParent();
            this._relations.dispose();
        }

        public function onClick(thisObj: *, listener: Function, args:Array=null): void {
            this.on(Event.CLICK, thisObj, listener, args);
        }

        public function offClick(thisObj: *, listener: Function): void {
            this.off(Event.CLICK, thisObj, listener);
        }

        public function hasClickListener(): Boolean {
            return this._displayObject.hasListener(Event.CLICK);
        }

        public function on(type: String,  thisObject: *, listener: Function, args:Array=null): void {
            this._displayObject.on(type, thisObject, listener, args);
        }

        public function off(type: String, thisObject: *, listener: Function): void {
            this._displayObject.off(type, thisObject, listener);
        }

        public function get draggable(): Boolean {
            return this._draggable;
        }

        public function set draggable(value: Boolean):void {
            if (this._draggable != value) {
                this._draggable = value;
                this.initDrag();
            }
        }

        public function get dragBounds(): Rectangle {
            return this._dragBounds;
        }

        public function set dragBounds(value: Rectangle):void {
            this._dragBounds = value;
        }

        public function startDrag(touchPointID: Number= -1): void {
            if (this._displayObject.stage == null)
                return;

            this.dragBegin();
        }

        public function stopDrag(): void {
            this.dragEnd();
        }

        public function get dragging(): Boolean {
            return GObject.sDragging == this;
        }

        public function localToGlobal(ax:Number=0, ay:Number=0, resultPoint:Point=null): Point {
            if(!resultPoint) {
                resultPoint = GObject.sHelperPoint;
                resultPoint.x = ax;
                resultPoint.y = ay;
                return this._displayObject.localToGlobal(resultPoint, true);
            }
            else
            {
                resultPoint.x = ax;
                resultPoint.y = ay;
                return this._displayObject.localToGlobal(resultPoint, false);
            }
        }

        public function globalToLocal(ax:Number=0, ay:Number=0, resultPoint:Point=null): Point {
            if(!resultPoint) {
                resultPoint = GObject.sHelperPoint;
                resultPoint.x = ax;
                resultPoint.y = ay;
                return this._displayObject.globalToLocal(resultPoint, true);
            }
            else
            {
                resultPoint.x = ax;
                resultPoint.y = ay;
                return this._displayObject.globalToLocal(resultPoint, false);
            }
        }
        
        public function localToGlobalRect(ax: Number = 0,ay: Number = 0,
										  aWidth: Number = 0,aHeight: Number = 0,
										  resultRect: Rectangle=null): Rectangle {
            if(resultRect == null)
                resultRect = new Rectangle();
            var pt: Point = this.localToGlobal(ax,ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.localToGlobal(ax + aWidth,ay + aHeight);
            resultRect.width = pt.x - resultRect.x;
            resultRect.height = pt.y - resultRect.y;
            return resultRect;
        }

        public function globalToLocalRect(ax: Number = 0,ay: Number = 0,
										  aWidth: Number = 0,aHeight: Number = 0,
										  resultRect: Rectangle=null): Rectangle {
            if(resultRect == null)
                resultRect = new Rectangle();
            var pt: Point = this.globalToLocal(ax,ay);
            resultRect.x = pt.x;
            resultRect.y = pt.y;
            pt = this.globalToLocal(ax + aWidth,ay + aHeight);
            resultRect.width = pt.x - resultRect.x;
            resultRect.height = pt.y - resultRect.y;
            return resultRect;
        }
        
        public function handleControllerChanged(c: Controller): void {
            if(this._gearDisplay.controller == c)
                this._gearDisplay.apply();
            if(this._gearXY.controller == c)
                this._gearXY.apply();
            if(this._gearSize.controller == c)
                this._gearSize.apply();
            if(this._gearLook.controller == c)
                this._gearLook.apply();
        }

        protected function createDisplayObject(): void {
            this._displayObject = new Sprite();
            this._displayObject["$owner"] = this;
        }

        protected function handleXYChanged(): void {
			var xv:Number = this._x;
			var yv:Number = this._y+_yOffset;
			if(this._pivotAsAnchor)
			{					
				xv -= this._pivotX*this._width;
				yv -= this._pivotY*this._height;
			}
			if(_pixelSnapping)
			{
				xv = Math.round(xv);
				yv = Math.round(yv);
			}
			
			this._displayObject.pos(xv+this._pivotOffsetX, yv+this._pivotOffsetY);
        }

		protected function handleSizeChanged():void
		{
			if(this._displayObject!=null)
			{
				if(this._sizeImplType==0 || this._sourceWidth==0 || this._sourceHeight==0)
					this._displayObject.size(this._width, this._height);
				else
					this._displayObject.scale(this._width/this._sourceWidth*this._scaleX,
						this._height/this._sourceHeight*this._scaleY);
			}
		}
		
		protected function handleScaleChanged():void
		{
			if(this._displayObject!=null)
			{
				if( this._sizeImplType==0 || this._sourceWidth==0 || this._sourceHeight==0)
					this._displayObject.scale(this._scaleX, this._scaleY);
				else
					this._displayObject.scale(this._width/this._sourceWidth*this._scaleX,
						this._height/this._sourceHeight*this._scaleY);
			}
		}
		
        protected function handleGrayChanged(): void {
            if(this._displayObject) {
                if(this._grayed)
                    this._displayObject.filters = [new ColorFilter(ToolSet.GRAY_FILTERS_MATRIX)];
                else
                    this._displayObject.filters = null;
            }
        }

        public function constructFromResource(pkgItem: PackageItem): void {
            this._packageItem = pkgItem;
        }

        public function setup_beforeAdd(xml: Object): void {
            var str: String;
            var arr: Array;

            this._id = xml.getAttribute("id");
            this._name = xml.getAttribute("name");

            str = xml.getAttribute("xy");
            arr = str.split(",");
            this.setXY(parseInt(arr[0]), parseInt(arr[1]));

            str = xml.getAttribute("size");
            if (str && str!="") {
                arr = str.split(",");
                this._initWidth = parseInt(arr[0]);
                this._initHeight = parseInt(arr[1]);
                this.setSize(this._initWidth, this._initHeight, true);
            }
            
            str = xml.getAttribute("scale");
            if(str && str!="") {
                arr = str.split(",");
                this.setScale(parseFloat(arr[0]),parseFloat(arr[1]));
            }
			
			str = xml.getAttribute("skew");
			if(str && str!="") {
				arr = str.split(",");
				this.setSkew(parseFloat(arr[0]),parseFloat(arr[1]));
			}

            str = xml.getAttribute("rotation");
            if (str && str!="")
                this.rotation = parseInt(str);

            str = xml.getAttribute("pivot");
            if (str && str!="") {
                arr = str.split(",");
				str = xml.getAttribute("anchor");
                this.setPivot(parseFloat(arr[0]), parseFloat(arr[1]), str=="true");
            }
			else
				this.setPivot(0,0,false);			

            str = xml.getAttribute("alpha");
            if (str && str!="")
                this.alpha = parseFloat(str);

            if(xml.getAttribute("touchable") == "false")
                this.touchable = false; 
            if(xml.getAttribute("visible") == "false")
                this.visible = false;
            if(xml.getAttribute("grayed") == "true")
                this.grayed = true;
            this.tooltips = xml.getAttribute("tooltips");
        }

        public function setup_afterAdd(xml: Object): void {
            var cxml: Object;

            var str: String = xml.getAttribute("group");
            if (str && str!="")
                this._group = this._parent.getChildById(str) as GGroup;

            var col: Array = xml.childNodes;
            var length1: Number = col.length;             
            for (var i1: Number = 0; i1 < length1; i1++) {
                cxml = col[i1];
                if (cxml.nodeName == "gearDisplay") {
                    this._gearDisplay.setup(cxml);
                }
                else if (cxml.nodeName == "gearXY") {
                    this._gearXY.setup(cxml);
                }
                else if (cxml.nodeName == "gearSize") {
                    this._gearSize.setup(cxml);
                }
                else if (cxml.nodeName == "gearLook") {
                    this._gearLook.setup(cxml);
                }
            }
        }

        //drag support
        //-------------------------------------------------------------------
        private static var sDragging: GObject;
        private static var sGlobalDragStart: Point = new Point();
        private static var sGlobalRect: Rectangle = new Rectangle();
        private static var sHelperPoint: Point = new Point();
        private static var sDragHelperRect: Rectangle = new Rectangle();
        private static var sDraggingQuery:Boolean;
        
        private var _touchDownPoint: Point;
        
        private function initDrag(): void {
            if (this._draggable)
                this.on(Event.MOUSE_DOWN, this, this.__begin);
            else
                this.off(Event.MOUSE_DOWN, this, this.__begin);
        }

        private function dragBegin(): void {
            if (GObject.sDragging != null)
                GObject.sDragging.stopDrag();

            GObject.sGlobalDragStart.x = Laya.stage.mouseX;
            GObject.sGlobalDragStart.y = Laya.stage.mouseY;

            this.localToGlobalRect(0,0,this.width,this.height,GObject.sGlobalRect);
            GObject.sDragging = this;

            Laya.stage.on(Event.MOUSE_MOVE, this, this.__moving2);
            Laya.stage.on(Event.MOUSE_UP, this, this.__end2);
        }

        private function dragEnd(): void {
            if (GObject.sDragging == this) {
                Laya.stage.off(Event.MOUSE_MOVE, this, this.__moving2);
                Laya.stage.off(Event.MOUSE_UP, this, this.__end2);
                GObject.sDragging = null;
            }
             GObject.sDraggingQuery = false;
        }

        private function reset(): void {
            Laya.stage.off(Event.MOUSE_MOVE, this, this.__moving);
            Laya.stage.off(Event.MOUSE_UP, this, this.__end);
        }

        private function __begin(): void {
            if(this._touchDownPoint==null)
                this._touchDownPoint = new Point();
            this._touchDownPoint.x = Laya.stage.mouseX;
            this._touchDownPoint.y = Laya.stage.mouseY;
            
            Laya.stage.on(Event.MOUSE_MOVE, this, this.__moving);
            Laya.stage.on(Event.MOUSE_UP, this, this.__end);
        }

        private function __end(): void {
            this.reset();
        }

        private function __moving(evt:Event): void {
            var sensitivity: Number = fairygui.UIConfig.touchDragSensitivity;
            if(this._touchDownPoint != null
                && Math.abs(this._touchDownPoint.x - Laya.stage.mouseX) < sensitivity
                && Math.abs(this._touchDownPoint.y - Laya.stage.mouseY) < sensitivity)
                return;
            
            this.reset();
            GObject.sDraggingQuery = true;
            Events.dispatch(Events.DRAG_START, this._displayObject, evt);

            if (GObject.sDraggingQuery)
                this.dragBegin();
        }

        private function __moving2(evt:Event): void {
            var xx: Number = Laya.stage.mouseX - GObject.sGlobalDragStart.x + GObject.sGlobalRect.x;
            var yy: Number = Laya.stage.mouseY - GObject.sGlobalDragStart.y + GObject.sGlobalRect.y;

            if(this._dragBounds != null) {
                var rect: Rectangle = GRoot.inst.localToGlobalRect(this._dragBounds.x,this._dragBounds.y,
                    this._dragBounds.width,this._dragBounds.height,GObject.sDragHelperRect);
                if(xx < rect.x)
                    xx = rect.x;
                else if(xx + GObject.sGlobalRect.width > rect.right) {
                    xx = rect.right - GObject.sGlobalRect.width;
                    if(xx < rect.x)
                        xx = rect.x;
                }

                if(yy < rect.y)
                    yy = rect.y;
                else if(yy + GObject.sGlobalRect.height > rect.bottom) {
                    yy = rect.bottom - GObject.sGlobalRect.height;
                    if(yy < rect.y)
                        yy = rect.y;
                }
            }

            var pt: Point = this.parent.globalToLocal(xx,yy,GObject.sHelperPoint);
            this.setXY(Math.round(pt.x),Math.round(pt.y));
            
             Events.dispatch(Events.DRAG_MOVE, this._displayObject, evt);
        }

        private function __end2(evt:Event): void {
            if (GObject.sDragging == this) {
                this.stopDrag();
                Events.dispatch(Events.DRAG_END, this._displayObject, evt);
            }
        }
        //-------------------------------------------------------------------
        
       public static function cast(sprite:Sprite):GObject {
            return GObject(sprite["$owner"]);
        }
    }
}