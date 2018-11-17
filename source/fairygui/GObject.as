package fairygui {
	import fairygui.gears.GearAnimation;
	import fairygui.gears.GearBase;
	import fairygui.gears.GearColor;
	import fairygui.gears.GearDisplay;
	import fairygui.gears.GearIcon;
	import fairygui.gears.GearLook;
	import fairygui.gears.GearSize;
	import fairygui.gears.GearText;
	import fairygui.gears.GearXY;
	import fairygui.utils.ByteBuffer;
	import fairygui.utils.ColorMatrix;
	
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.filters.ColorFilter;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	
	public class GObject {
		public var data: Object;
		public var packageItem: PackageItem;
		public static var draggingObject:GObject;
		
		private var _x: Number = 0;
		private var _y: Number = 0;
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
		private var _internalVisible: Boolean = true;
		private var _handlingController: Boolean = false;
		private var _focusable: Boolean = false;
		private var _tooltips: String;
		private var _pixelSnapping: Boolean = false;
		
		private var _relations: Relations;
		private var _group: GGroup;
		private var _gears:Vector.<GearBase>;
		private var _dragBounds: Rectangle;
		
		protected var _displayObject: Sprite;
		protected var _yOffset: Number = 0;
		//Size的实现方式，有两种，0-GObject的w/h等于DisplayObject的w/h。1-GObject的sourceWidth/sourceHeight等于DisplayObject的w/h，剩余部分由scale实现
		protected var _sizeImplType:int;
		
		public var minWidth:Number = 0;
		public var minHeight:Number = 0;
		public var maxWidth:Number = 0;
		public var maxHeight:Number = 0;
		public var sourceWidth: Number = 0;
		public var sourceHeight: Number = 0;
		public var initWidth: Number = 0;
		public var initHeight: Number = 0;
		
		public var _parent: GComponent;
		public var _width: Number = 0;
		public var _height: Number = 0;
		public var _rawWidth: Number = 0;
		public var _rawHeight: Number = 0;
		public var _id: String;
		public var _name: String;
		public var _underConstruct: Boolean;
		public var _gearLocked: Boolean;
		public var _sizePercentInGroup:Number = 0;
		
		public static var _gInstanceCounter: Number = 0;
		
		public function GObject() {
			super();
			
			this._id = "" + GObject._gInstanceCounter++;
			this._name = "";
			
			this.createDisplayObject();
			
			this._relations = new Relations(this);
			this._gears = new Vector.<GearBase>(8, true);
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
				
				this.updateGear(1);
				
				if(this._parent && !(this._parent is GList)) {
					this._parent.setBoundsChangedFlag();
					if (_group != null)
						_group.setBoundsChangedFlag();
					this.displayObject.event(Events.XY_CHANGED);
				}
				
				if (draggingObject == this && !sUpdateInDragging)
					this.localToGlobalRect(0,0,this.width,this.height,sGlobalRect);
			}
		}
		
		final public function get xMin():Number
		{
			return _pivotAsAnchor ? (_x - _width * _pivotX) : _x;
		}
		
		final public function set xMin(value:Number):void
		{
			if (_pivotAsAnchor)
				setXY(value + _width * _pivotX, _y);
			else
				setXY(value, _y);
		}
		
		final public function get yMin():Number
		{
			return _pivotAsAnchor ? (_y - _height * _pivotY) : _y;
		}
		
		final public function set yMin(value:Number):void
		{
			if (_pivotAsAnchor)
				setXY(_x, value + _height * _pivotY);
			else
				setXY(_x, value);
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
				if(wv<minWidth)
					wv = minWidth;
				if(hv<minHeight)
					hv = minHeight;
				if(maxWidth>0 && wv>maxWidth)
					wv = maxWidth;
				if(maxHeight>0 && hv>maxHeight)
					hv = maxHeight;
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
				
				if (this is GGroup)
					GGroup(this).resizeChildren(dWidth, dHeight);
				
				this.updateGear(2);
				
				if(this._parent) {
					this._relations.onOwnerSizeChanged(dWidth,dHeight, _pivotAsAnchor || !ignorePivot);
					this._parent.setBoundsChangedFlag();
					if (_group != null)
						_group.setBoundsChangedFlag(true);
				}
				
				this.displayObject.event(Events.SIZE_CHANGED);
			}
		}
		
		public function ensureSizeCorrect(): void {
		}
		
		public function get actualWidth(): Number {
			return this.width * Math.abs(this._scaleX);
		}
		
		public function get actualHeight(): Number {
			return this.height *  Math.abs(this._scaleY);
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
				
				this.updateGear(2);
			}
		}
		
		public function get skewX(): Number {
			return this._skewX;
		}
		
		public function set skewX(value: Number):void {
			this.setSkew(value,this._skewY);
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
					this._displayObject.skew(-sx, sy);
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
		
		final public function get pivotAsAnchor():Boolean
		{
			return _pivotAsAnchor;
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
						GObject.sHelperPoint.x = this._pivotX*this.sourceWidth;
						GObject.sHelperPoint.y = this._pivotY*this.sourceHeight;
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
			if(this._touchable!=value)
			{
				this._touchable = value;
				updateGear(3);
				
				if((this is GImage) || (this is GMovieClip)
					|| (this is GTextField) && !(this is GTextInput) && !(this is GRichTextField))
					//Touch is not supported by GImage/GMovieClip/GTextField
					return;
				
				if(this._displayObject != null) 
					this._displayObject.mouseEnabled = this._touchable;
			}
		}
		
		public function get grayed(): Boolean {
			return this._grayed;
		}
		
		public function set grayed(value: Boolean):void {
			if(this._grayed != value) {
				this._grayed = value;
				this.handleGrayedChanged();
				this.updateGear(3);
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
				this.updateGear(3);
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
				this.handleAlphaChanged();
				this.updateGear(3);
			}
		}		
		
		public function get visible(): Boolean {
			return this._visible;
		}
		
		public function set visible(value: Boolean):void {
			if (this._visible != value) {
				this._visible = value;
				handleVisibleChanged();
				if (this._parent)
					this._parent.setBoundsChangedFlag();
			}
		}
		
		public function get internalVisible(): Boolean {
			return this._internalVisible && (!this._group || this._group.internalVisible)
				&& !this._displayObject._cacheStyle.maskParent;
		}
		
		public function get internalVisible2(): Boolean {
			return this._visible && (!this._group || this._group.internalVisible2);
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
			if(_tooltips)
			{
				this.off(Event.ROLL_OVER, this, this.__rollOver);
				this.off(Event.ROLL_OUT, this, this.__rollOut);
			}
			
			_tooltips = value;
			if(_tooltips)
			{
				this.on(Event.ROLL_OVER, this, this.__rollOver);
				this.on(Event.ROLL_OUT, this, this.__rollOut);
			}
		}
		
		private function __rollOver(evt:Event):void
		{
			Laya.timer.once(100, this, this.__doShowTooltips);
		}
		
		private function __doShowTooltips():void
		{
			var r:GRoot = this.root;
			if(r)
				this.root.showTooltips(_tooltips);
		}
		
		private function __rollOut(evt:Event):void
		{		
			Laya.timer.clear(this, this.__doShowTooltips);
			this.root.hideTooltips();
		}
		
		public function get blendMode():String
		{
			return _displayObject.blendMode;
		}
		
		public function set blendMode(value:String):void
		{
			_displayObject.blendMode = value;
		}
		
		public function get filters():Array
		{
			return _displayObject.filters;
		}
		
		public function set filters(value:Array):void
		{
			_displayObject.filters = value;
		}
		
		public function get inContainer(): Boolean {
			return this._displayObject != null && this._displayObject.parent != null;
		}
		
		public function get onStage(): Boolean {
			return this._displayObject != null && this._displayObject.stage != null;
		}
		
		public function get resourceURL(): String {
			if (this.packageItem != null)
				return "ui://" + this.packageItem.owner.id + this.packageItem.id;
			else
				return null;
		}
		
		public function set group(value: GGroup):void {
			if (_group != value)
			{
				if (_group != null)
					_group.setBoundsChangedFlag(true);
				_group = value;
				if (_group != null)
					_group.setBoundsChangedFlag(true);
			}
		}
		
		public function get group(): GGroup {
			return this._group;
		}
		
		public function getGear(index:Number):GearBase	{
			var gear:GearBase = this._gears[index];
			if (gear == null)
			{
				switch (index)
				{
					case 0:
						gear = new GearDisplay(this);
						break;
					case 1:
						gear = new GearXY(this);
						break;
					case 2:
						gear = new GearSize(this);
						break;
					case 3:
						gear = new GearLook(this);
						break;
					case 4:
						gear = new GearColor(this);
						break;
					case 5:
						gear = new GearAnimation(this);
						break;
					case 6:
						gear = new GearText(this);
						break;
					case 7:
						gear = new GearIcon(this);
						break;
					default:
						throw new Error("FairyGUI: invalid gear index!");
				}
				this._gears[index] = gear;
			}
			return gear;
		}
		
		protected function updateGear(index:int):void
		{
			if(_underConstruct || _gearLocked)
				return;
			
			var gear:GearBase = _gears[index];
			if ( gear!= null && gear.controller!=null)
				gear.updateState();
		}
		
		public function checkGearController(index:int, c:Controller):Boolean
		{
			return _gears[index] != null && _gears[index].controller==c;
		}
		
		public function updateGearFromRelations(index:int, dx:Number, dy:Number):void
		{
			if (_gears[index] != null)
				_gears[index].updateFromRelations(dx, dy);
		}
		
		public function addDisplayLock():uint
		{
			var gearDisplay:GearDisplay = GearDisplay(_gears[0]);
			if(gearDisplay && gearDisplay.controller)
			{
				var ret:uint = gearDisplay.addLock();
				checkGearDisplay();
				
				return ret;
			}
			else
				return 0;
		}
		
		public function releaseDisplayLock(token:uint):void
		{
			var gearDisplay:GearDisplay = GearDisplay(_gears[0]);
			if(gearDisplay && gearDisplay.controller)
			{
				gearDisplay.releaseLock(token);
				checkGearDisplay();
			}
		}
		
		private function checkGearDisplay():void
		{
			if(_handlingController)
				return;
			
			var connected:Boolean = _gears[0]==null || GearDisplay(_gears[0]).connected;
			if(connected!=_internalVisible)
			{
				_internalVisible = connected;
				if(_parent)
					_parent.childStateChanged(this);
			}
		}
		
		final public function get gearXY():GearXY
		{
			return GearXY(getGear(1));
		}
		
		final public function get gearSize():GearSize
		{
			return GearSize(getGear(2));
		}
		
		final public function get gearLook():GearLook
		{
			return GearLook(getGear(3));
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
		
		final public function get asImage():GImage
		{
			return this as GImage;
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
		
		public function get icon():String {
			return null;
		}
		
		public function set icon(value:String):void	{
		}
		
		public function dispose(): void {
			this.removeFromParent();
			this._relations.dispose();
			this._displayObject.destroy();
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
			return GObject.draggingObject == this;
		}
		
		public function localToGlobal(ax:Number=0, ay:Number=0, resultPoint:Point=null): Point {
			if(_pivotAsAnchor)
			{
				ax += _pivotX*_width;
				ay += _pivotY*_height;
			}
			
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
				resultPoint = this._displayObject.globalToLocal(resultPoint, true);
			}
			else
			{
				resultPoint.x = ax;
				resultPoint.y = ay;
				this._displayObject.globalToLocal(resultPoint, false);
			}
			
			if(_pivotAsAnchor)
			{
				resultPoint.x -= _pivotX*_width;
				resultPoint.y -= _pivotY*_height;
			}
			
			return resultPoint;
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
			_handlingController = true;
			for (var i:int = 0; i < 8; i++)
			{
				var gear:GearBase = _gears[i];
				if (gear != null && gear.controller == c)
					gear.apply();
			}
			_handlingController = false;
			
			checkGearDisplay();
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
				if(this._sizeImplType==0 || this.sourceWidth==0 || this.sourceHeight==0)
					this._displayObject.size(this._width, this._height);
				else
					this._displayObject.scale(this._width/this.sourceWidth*this._scaleX,
						this._height/this.sourceHeight*this._scaleY);
			}
		}
		
		protected function handleScaleChanged():void
		{
			if(this._displayObject!=null)
			{
				if( this._sizeImplType==0 || this.sourceWidth==0 || this.sourceHeight==0)
					this._displayObject.scale(this._scaleX, this._scaleY);
				else
					this._displayObject.scale(this._width/this.sourceWidth*this._scaleX,
						this._height/this.sourceHeight*this._scaleY);
			}
		}
		
		private static var grayFilter:ColorFilter = null;
		protected function handleGrayedChanged(): void {
			if(this._displayObject) {
				if(this._grayed)
				{
					if(grayFilter==null)
						grayFilter = new ColorFilter([0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0]);
					this._displayObject.filters = [grayFilter];
				}
				else
					this._displayObject.filters = null;
			}
		}
		
		protected function handleAlphaChanged():void {
			if(this._displayObject)
				this._displayObject.alpha = this._alpha;
		}
		
		public function handleVisibleChanged():void {
			if(this._displayObject)
				this._displayObject.visible = this.internalVisible2;
		}
		
		public function constructFromResource(): void {
			
		}
		
		public function setup_beforeAdd(buffer:ByteBuffer, beginPos:int): void {
			buffer.seek(beginPos, 0);
			buffer.skip(5);
			
			var f1:Number;
			var f2:Number;
			
			_id = buffer.readS();
			_name = buffer.readS();
			f1 = buffer.getInt32();
			f2 = buffer.getInt32();
			setXY(f1, f2);
			
			if (buffer.readBool())
			{
				initWidth = buffer.getInt32();
				initHeight = buffer.getInt32();
				setSize(initWidth, initHeight, true);
			}
			
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
				setScale(f1, f2);
			}
			
			if (buffer.readBool())
			{
				f1 = buffer.getFloat32();
				f2 = buffer.getFloat32();
				this.setSkew(f1, f2);
			}
			
			if (buffer.readBool())
			{
				f1 = buffer.getFloat32();
				f2 = buffer.getFloat32();
				setPivot(f1, f2, buffer.readBool());
			}
			
			f1 = buffer.getFloat32();
			if (f1 != 1)
				this.alpha = f1;
			
			f1 = buffer.getFloat32();
			if (f1 != 0)
				this.rotation = f1;
			
			if (!buffer.readBool())
				this.visible = false;
			if (!buffer.readBool())
				this.touchable = false;
			if (buffer.readBool())
				this.grayed = true;
			var bm:int = buffer.readByte();
			if(bm==2)
				this.blendMode = "lighter";
			
			var filter:int = buffer.readByte();
			if (filter == 1)
			{
				var cm:ColorMatrix = new ColorMatrix();
				cm.adjustBrightness(buffer.getFloat32());
				cm.adjustContrast(buffer.getFloat32());
				cm.adjustSaturation(buffer.getFloat32());
				cm.adjustHue(buffer.getFloat32());
				var cf:ColorFilter = new ColorFilter(cm);						
				this.filters = [cf];
			}
			
			var str:String = buffer.readS();
			if (str != null)
				this.data = str;
		}
		
		public function setup_afterAdd(buffer:ByteBuffer, beginPos:int): void {
			buffer.seek(beginPos, 1);
			
			var str:String = buffer.readS();
			if (str != null)
				this.tooltips = str;
			
			var groupId:int = buffer.getInt16();
			if (groupId >= 0)
				group = parent.getChildAt(groupId) as GGroup;
			
			buffer.seek(beginPos, 2);
			
			var cnt:int = buffer.getInt16();
			for (var i:int = 0; i < cnt; i++)
			{
				var nextPos:int = buffer.getInt16();
				nextPos += buffer.pos;
				
				var gear:GearBase = getGear(buffer.readByte());
				gear.setup(buffer);
				
				buffer.pos = nextPos;
			}
		}
		
		//drag support
		//-------------------------------------------------------------------
		private static var sGlobalDragStart: Point = new Point();
		private static var sGlobalRect: Rectangle = new Rectangle();
		private static var sHelperPoint: Point = new Point();
		private static var sDragHelperRect: Rectangle = new Rectangle();
		private static var sDraggingQuery:Boolean;
		private static var sUpdateInDragging:Boolean;
		
		private var _touchDownPoint: Point;
		
		private function initDrag(): void {
			if (this._draggable)
				this.on(Event.MOUSE_DOWN, this, this.__begin);
			else
				this.off(Event.MOUSE_DOWN, this, this.__begin);
		}
		
		private function dragBegin(): void {
			if (GObject.draggingObject != null)
				GObject.draggingObject.stopDrag();
			
			GObject.sGlobalDragStart.x = Laya.stage.mouseX;
			GObject.sGlobalDragStart.y = Laya.stage.mouseY;
			
			this.localToGlobalRect(0,0,this.width,this.height,GObject.sGlobalRect);
			GObject.draggingObject = this;
			
			Laya.stage.on(Event.MOUSE_MOVE, this, this.__moving2);
			Laya.stage.on(Event.MOUSE_UP, this, this.__end2);
		}
		
		private function dragEnd(): void {
			if (GObject.draggingObject == this) {
				Laya.stage.off(Event.MOUSE_MOVE, this, this.__moving2);
				Laya.stage.off(Event.MOUSE_UP, this, this.__end2);
				GObject.draggingObject = null;
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
			
			sUpdateInDragging = true;
			var pt: Point = this.parent.globalToLocal(xx,yy,GObject.sHelperPoint);
			this.setXY(Math.round(pt.x),Math.round(pt.y));
			sUpdateInDragging = false;
			
			Events.dispatch(Events.DRAG_MOVE, this._displayObject, evt);
		}
		
		private function __end2(evt:Event): void {
			if (GObject.draggingObject == this) {
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