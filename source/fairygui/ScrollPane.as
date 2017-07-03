package fairygui {
	import fairygui.utils.ToolSet;
	
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	import laya.utils.Ease;
	import laya.utils.Handler;
	import laya.utils.Tween;
	
	public class ScrollPane extends Object {
		private var _owner: GComponent;
		private var _maskContainer: Sprite;
		private var _container: Sprite;
		private var _alignContainer:Sprite;
		
		private var _viewWidth: Number = 0;
		private var _viewHeight: Number = 0;
		private var _contentWidth: Number = 0;
		private var _contentHeight: Number = 0;
		
		private var _scrollType: Number = 0;
		private var _scrollSpeed: Number = 0;
		private var _mouseWheelSpeed: Number = 0;
		private var _scrollBarMargin:Margin;
		private var _bouncebackEffect: Boolean;
		private var _touchEffect: Boolean;
		private var _scrollBarDisplayAuto: Boolean;
		private var _vScrollNone:Boolean;
		private var _hScrollNone:Boolean;
		
		private var _displayOnLeft: Boolean;
		private var _snapToItem: Boolean;
		private var _displayInDemand: Boolean;
		private var _mouseWheelEnabled: Boolean;
		private var _pageMode: Boolean;
		private var _pageSizeH: Number;
		private var _pageSizeV: Number;
		private var _inertiaDisabled:Boolean;
		
		private var _yPerc: Number;
		private var _xPerc: Number;
		private var _xPos: Number;
		private var _yPos: Number;
		private var _xOverlap: Number;
		private var _yOverlap: Number;
		
		private static var _easeTypeFunc:Function;
		private var _tweening: Number;
		private var _tweenHelper: TweenHelper;
		private var _tweener: Tween;
		
		private var _needRefresh: Boolean;
		private var _time1: Number;
		private var _time2: Number;
		private var _y1: Number;
		private var _y2: Number;
		private var _yOffset: Number;
		private var _x1: Number;
		private var _x2: Number;
		private var _xOffset: Number;
		
		private var _holdAreaPoint: Point;
		private var _isHoldAreaDone: Boolean;
		private var _aniFlag: int;
		private var _scrollBarVisible: Boolean;
		
		private var _pageController:Controller;
		
		private var _hzScrollBar: GScrollBar;
		private var _vtScrollBar: GScrollBar;
		
		public var isDragged: Boolean;
		public static var draggingPane:ScrollPane;
		private static var _gestureFlag:int = 0;
		
		private static var sHelperRect:Rectangle = new Rectangle();
		private static var sHelperPoint:Point = new Point();
		
		public function ScrollPane(owner: GComponent,
								   scrollType: Number,
								   scrollBarMargin: Margin,
								   scrollBarDisplay: Number,
								   flags: Number,
								   vtScrollBarRes: String,
								   hzScrollBarRes: String) {
			super();
			if(ScrollPane._easeTypeFunc == null)
				ScrollPane._easeTypeFunc = Ease.cubicOut;
			this._tweenHelper = new TweenHelper();
			
			this._owner = owner;
			
			this._maskContainer = new Sprite();
			this._owner.displayObject.addChild(this._maskContainer);
			
			this._container = this._owner._container;
			this._container.pos(0,0);
			this._maskContainer.addChild(this._container);
			
			this._scrollType = scrollType;
			this._scrollBarMargin = scrollBarMargin;
			this._bouncebackEffect = fairygui.UIConfig.defaultScrollBounceEffect;
			this._touchEffect = fairygui.UIConfig.defaultScrollTouchEffect;
			this._scrollSpeed = fairygui.UIConfig.defaultScrollSpeed;
			this._mouseWheelSpeed = this._scrollSpeed * 2;
			this._displayOnLeft = (flags & 1) != 0;
			this._snapToItem = (flags & 2) != 0;
			this._displayInDemand = (flags & 4) != 0;
			this._pageMode = (flags & 8) != 0;
			if(flags & 16)
				this._touchEffect = true;
			else if(flags & 32)
				this._touchEffect = false;
			else
				this._touchEffect = fairygui.UIConfig.defaultScrollTouchEffect;
			if(flags & 64)
				this._bouncebackEffect = true;
			else if(flags & 128)
				this._bouncebackEffect = false;
			else
				this._bouncebackEffect = fairygui.UIConfig.defaultScrollBounceEffect;
			this._inertiaDisabled = (flags & 256) != 0;
			if((flags & 512) == 0)
				this._maskContainer.scrollRect = new Rectangle();
			
			this._xPerc = 0;
			this._yPerc = 0;
			this._xPos = 0
			this._yPos = 0;
			this._xOverlap = 0;
			this._yOverlap = 0;
			this._aniFlag = 0;
			this._scrollBarVisible = true;
			this._mouseWheelEnabled = true;
			this._holdAreaPoint = new Point();
			
			if(scrollBarDisplay == ScrollBarDisplayType.Default)
				scrollBarDisplay = fairygui.UIConfig.defaultScrollBarDisplay;
			
			if(scrollBarDisplay != ScrollBarDisplayType.Hidden) {
				if(this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical) {
					var res: String = vtScrollBarRes ? vtScrollBarRes : fairygui.UIConfig.verticalScrollBar;
					if(res) {
						this._vtScrollBar = GScrollBar(UIPackage.createObjectFromURL(res));
						if(!this._vtScrollBar)
							throw "cannot create scrollbar from " + res;
						this._vtScrollBar.setScrollPane(this, true);
						this._owner.displayObject.addChild(this._vtScrollBar.displayObject);
					}
				}
				if(this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Horizontal) {
					res = hzScrollBarRes ? hzScrollBarRes : fairygui.UIConfig.horizontalScrollBar;
					if(res) {
						this._hzScrollBar = GScrollBar(UIPackage.createObjectFromURL(res));
						if(!this._hzScrollBar)
							throw "cannot create scrollbar from " + res;
						this._hzScrollBar.setScrollPane(this, false);
						this._owner.displayObject.addChild(this._hzScrollBar.displayObject);
					}
				}
				
				this._scrollBarDisplayAuto = scrollBarDisplay == ScrollBarDisplayType.Auto;
				if(this._scrollBarDisplayAuto) {
					this._scrollBarVisible = false;
					if(this._vtScrollBar)
						this._vtScrollBar.displayObject.visible = false;
					if(this._hzScrollBar)
						this._hzScrollBar.displayObject.visible = false;
				}
			}
			
			this._contentWidth = 0;
			this._contentHeight = 0;
			this.setSize(owner.width,owner.height);
			
			this._owner.on(Event.MOUSE_DOWN, this, this.__mouseDown);
			this._owner.on(Event.MOUSE_WHEEL, this, this.__mouseWheel);
		}
		
		public function get owner(): GComponent {
			return this._owner;
		}
		
		public function get bouncebackEffect(): Boolean {
			return this._bouncebackEffect;
		}
		
		public function set bouncebackEffect(sc: Boolean):void {
			this._bouncebackEffect = sc;
		}
		
		public function get touchEffect(): Boolean {
			return this._touchEffect;
		}
		
		public function set touchEffect(sc: Boolean):void {
			this._touchEffect = sc;
		}
		
		public function get mouseWheelEnabled(): Boolean {
			return this._mouseWheelEnabled;
		}
		
		public function set mouseWheelEnabled(val: Boolean):void {
			this._mouseWheelEnabled = val;
		}
		
		public function set scrollSpeed(val: Number):void {
			this._scrollSpeed = this.scrollSpeed;
			if (this._scrollSpeed == 0)
				this._scrollSpeed = fairygui.UIConfig.defaultScrollSpeed;
			this._mouseWheelSpeed = this._scrollSpeed * 2;
		}
		
		public function get scrollSpeed(): Number {
			return this._scrollSpeed;
		}
		
		public function get snapToItem(): Boolean {
			return this._snapToItem;
		}
		
		public function set snapToItem(value: Boolean):void {
			this._snapToItem = value;
		}
		
		public function get percX(): Number {
			return this._xPerc;
		}
		
		public function set percX(value: Number):void {
			this.setPercX(value, false);
		}
		
		public function setPercX(value: Number, ani: Boolean= false): void {
			_owner.ensureBoundsCorrect();
			
			value = ToolSet.clamp01(value);
			if(value != _xPerc)
			{
				_xPerc = value;
				_xPos = _xPerc*_xOverlap;
				posChanged(ani);
			}
		}
		
		public function get percY(): Number {
			return this._yPerc;
		}
		
		public function set percY(value: Number):void {
			this.setPercY(value, false);
		}
		
		public function setPercY(value: Number, ani: Boolean= false): void {
			_owner.ensureBoundsCorrect();
			
			value = ToolSet.clamp01(value);
			if(value != _yPerc)
			{
				_yPerc = value;
				_yPos = _yPerc*_yOverlap;
				posChanged(ani);
			}
		}
		
		public function get posX(): Number {
			return this._xPos;
		}
		
		public function set posX(value: Number):void {
			this.setPosX(value, false);
		}
		
		public function setPosX(value: Number, ani: Boolean= false): void {
			_owner.ensureBoundsCorrect();
			
			value = ToolSet.clamp(value, 0, _xOverlap);
			if(value!=_xPos)
			{
				_xPos = value;
				_xPerc = _xOverlap==0?0:_xPos/_xOverlap;				
				posChanged(ani);
			}
		}
		
		public function get posY(): Number {
			return this._yPos;
		}
		
		public function set posY(value: Number):void {
			this.setPosY(value, false);
		}
		
		public function setPosY(value: Number, ani: Boolean= false): void {
			_owner.ensureBoundsCorrect();
			
			value = ToolSet.clamp(value, 0, _yOverlap);
			if(value!=_yPos)
			{
				_yPos = value;
				_yPerc = _yOverlap==0?0:_yPos/_yOverlap;				
				posChanged(ani);
			}
		}
		
		public function get isBottomMost(): Boolean {
			return _yPerc==1 || _yOverlap==0;
		}
		
		public function get isRightMost(): Boolean {
			return _xPerc==1 || _xOverlap==0;
		}
		
		public function get currentPageX(): Number {
			if (!_pageMode)
				return 0;
			
			var page:int = Math.floor(_xPos / _pageSizeH);
			if (_xPos - page * _pageSizeH > _pageSizeH * 0.5)
				page++;
			
			return page;
		}
		
		public function set currentPageX(value: Number):void {
			if(this._pageMode && this._xOverlap>0)
				this.setPosX(value * this._pageSizeH,false);
		}
		
		public function get currentPageY(): Number {
			if (!_pageMode)
				return 0;
			
			var page:int = Math.floor(_yPos / _pageSizeV);
			if (_yPos - page * _pageSizeV > _pageSizeV * 0.5)
				page++;
			
			return page;
		}
		
		public function set currentPageY(value: Number):void {
			if(this._pageMode && this._yOverlap>0)
				this.setPosY(value * this._pageSizeV,false);
		}
		
		public function get pageController():Controller
		{
			return _pageController;
		}
		
		public function set pageController(value:Controller):void
		{
			_pageController = value;
		}
		
		public function get scrollingPosX():Number
		{
			return ToolSet.clamp(-_container.x, 0, _xOverlap);
		}
		
		public function get scrollingPosY():Number
		{
			return ToolSet.clamp(-_container.y, 0, _yOverlap);
		}
		
		public function get contentWidth(): Number {
			return this._contentWidth;
		}
		
		public function get contentHeight(): Number {
			return this._contentHeight;
		}
		
		public function get viewWidth(): Number {
			return this._viewWidth;
		}
		
		public function set viewWidth(value: Number):void {
			value = value + this._owner.margin.left + this._owner.margin.right;
			if (this._vtScrollBar != null)
				value += this._vtScrollBar.width;
			this._owner.width = value;
		}
		
		public function get viewHeight(): Number {
			return this._viewHeight;
		}
		
		public function set viewHeight(value: Number):void {
			value = value + this._owner.margin.top + this._owner.margin.bottom;
			if (this._hzScrollBar != null)
				value += this._hzScrollBar.height;
			this._owner.height = value;
		}
		
		private function getDeltaX(move: Number): Number {
			return move / (this._contentWidth - this._viewWidth);
		}
		
		private function getDeltaY(move: Number): Number {
			return move / (this._contentHeight - this._viewHeight);
		}
		
		public function scrollTop(ani: Boolean= false): void {
			this.setPercY(0, ani);
		}
		
		public function scrollBottom(ani: Boolean= false): void {
			this.setPercY(1, ani);
		}
		
		public function scrollUp(speed: Number= 1, ani: Boolean= false): void {
			this.setPercY(this._yPerc - this.getDeltaY(this._scrollSpeed * speed), ani);
		}
		
		public function scrollDown(speed: Number= 1, ani: Boolean= false): void {
			this.setPercY(this._yPerc + this.getDeltaY(this._scrollSpeed * speed), ani);
		}
		
		public function scrollLeft(speed: Number= 1, ani: Boolean= false): void {
			this.setPercX(this._xPerc - this.getDeltaX(this._scrollSpeed * speed), ani);
		}
		
		public function scrollRight(speed: Number= 1, ani: Boolean= false): void {
			this.setPercX(this._xPerc + this.getDeltaX(this._scrollSpeed * speed), ani);
		}
		
		public function scrollToView(target:Object, ani: Boolean= false, setFirst: Boolean = false): void {
			this._owner.ensureBoundsCorrect();
			if(this._needRefresh)
				this.refresh();
			
			var rect:laya.maths.Rectangle;
			if(target is GObject)
			{
				if(target.parent != this._owner) {
					target.parent.localToGlobalRect(target.x,target.y,
						target.width,target.height,ScrollPane.sHelperRect);
					rect = this._owner.globalToLocalRect(ScrollPane.sHelperRect.x,ScrollPane.sHelperRect.y,
						ScrollPane.sHelperRect.width,ScrollPane.sHelperRect.height,ScrollPane.sHelperRect);
				}
				else {
					rect = ScrollPane.sHelperRect;
					rect.setTo(target.x,target.y,target.width,target.height);
				}
			}
			else
				rect = Rectangle(target);
			
			if (this._yOverlap>0) {
				var top: Number = this.posY;
				var bottom: Number = top + this._viewHeight;
				if(setFirst || rect.y < top || rect.height >= this._viewHeight) {
					if(this._pageMode)
						this.setPosY(Math.floor(rect.y / this._pageSizeV) * this._pageSizeV, ani);
					else
						this.setPosY(rect.y, ani);
				}
				else if(rect.y + rect.height > bottom) {
					if(this._pageMode)
						this.setPosY(Math.floor(rect.y / this._pageSizeV) * this._pageSizeV,ani);
					else if(rect.height <= this._viewHeight/2)
						this.setPosY(rect.y + rect.height * 2 - this._viewHeight, ani);
					else
						this.setPosY(rect.y + rect.height - this._viewHeight, ani);
				}
			}
			if (this._xOverlap>0) {
				var left: Number =  this.posX;
				var right: Number = left + this._viewWidth;
				if(setFirst || rect.x < left || rect.width >= this._viewWidth) {
					if(this._pageMode)
						this.setPosX(Math.floor(rect.x / this._pageSizeH) * this._pageSizeH,ani);
					else
						this.setPosX(rect.x, ani);
				}
				else if(rect.x + rect.width > right) {
					if(this._pageMode)
						this.setPosX(Math.floor(rect.x / this._pageSizeH) * this._pageSizeH,ani);
					else if(rect.width <= this._viewWidth/2)
						this.setPosX(rect.x + rect.width * 2 - this._viewWidth, ani);
					else
						this.setPosX(rect.x + rect.width - this._viewWidth, ani);
				}                
			}
			
			if(!ani && this._needRefresh) 
				this.refresh();             
		}
		
		public function isChildInView(obj: GObject): Boolean {
			var dist:Number;
			if(this._yOverlap>0) {
				dist = obj.y + this._container.y;
				if(dist < -obj.height - 20 || dist > this._viewHeight + 20)
					return false;
			}
			
			if(this._xOverlap>0) {
				dist = obj.x + this._container.x;
				if(dist < -obj.width - 20 || dist > this._viewWidth + 20)
					return false;
			}
			
			return true;
		}
		
		public function cancelDragging():void
		{
			this._owner.displayObject.stage.off(Event.MOUSE_MOVE, this, this.__mouseMove);
			this._owner.displayObject.stage.off(Event.MOUSE_UP, this, this.__mouseUp);
			this._owner.displayObject.stage.off(Event.CLICK, this, this.__click);
			
			if (draggingPane == this)
				draggingPane = null;
			
			_gestureFlag = 0;
			isDragged = false;
			this._maskContainer.mouseEnabled = true;
		}
		
		internal function onOwnerSizeChanged():void
		{
			setSize(_owner.width, _owner.height);
			posChanged(false);
		}
		
		internal function handleControllerChanged(c:Controller):void
		{
			if (_pageController == c)
			{
				if (_scrollType == ScrollType.Horizontal)
					this.currentPageX = c.selectedIndex;
				else
					this.currentPageY = c.selectedIndex;
			}
		}
		
		private function updatePageController():void
		{
			if (_pageController != null && !_pageController.changing)
			{
				var index:int;
				if (_scrollType == ScrollType.Horizontal)
					index = this.currentPageX;
				else
					index = this.currentPageY;
				if (index < _pageController.pageCount)
				{
					var c:Controller = _pageController;
					_pageController = null; //防止HandleControllerChanged的调用
					c.selectedIndex = index;
					_pageController = c;
				}
			}
		}
		
		internal function adjustMaskContainer():void
		{
			var mx:Number, my:Number;
			if (_displayOnLeft && _vtScrollBar != null)
				mx = Math.floor(_owner.margin.left + _vtScrollBar.width);
			else
				mx = Math.floor(_owner.margin.left);
			my = Math.floor(_owner.margin.top);

			_maskContainer.pos(mx, my);
			
			if(_owner._alignOffset.x!=0 || _owner._alignOffset.y!=0)
			{
				if(_alignContainer==null)
				{
					_alignContainer = new Sprite();
					_alignContainer.mouseEnabled = false;
					_maskContainer.addChild(_alignContainer);
					_alignContainer.addChild(_container);
				}
				
				_alignContainer.pos(_owner._alignOffset.x, _owner._alignOffset.y);
			}
			else if(_alignContainer)
			{
				_alignContainer.pos(0,0);
			}
		}
		
		public function setSize(aWidth: Number,aHeight: Number): void {
			this.adjustMaskContainer();
			
			if (this._hzScrollBar) {
				this._hzScrollBar.y = aHeight - this._hzScrollBar.height;
				if(this._vtScrollBar && !this._vScrollNone) {
					this._hzScrollBar.width = aWidth - this._vtScrollBar.width - this._scrollBarMargin.left - this._scrollBarMargin.right;
					if(this._displayOnLeft)
						this._hzScrollBar.x = this._scrollBarMargin.left + this._vtScrollBar.width;
					else
						this._hzScrollBar.x = this._scrollBarMargin.left;
				}
				else {
					this._hzScrollBar.width = aWidth - this._scrollBarMargin.left - this._scrollBarMargin.right;
					this._hzScrollBar.x = this._scrollBarMargin.left;
				}
			}
			if (this._vtScrollBar) {
				if (!this._displayOnLeft)
					this._vtScrollBar.x = aWidth - this._vtScrollBar.width;
				if(this._hzScrollBar)
					this._vtScrollBar.height = aHeight - this._hzScrollBar.height - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
				else
					this._vtScrollBar.height = aHeight - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
				this._vtScrollBar.y = this._scrollBarMargin.top;
			}
			
			this._viewWidth = aWidth;
			this._viewHeight = aHeight;
			if(this._hzScrollBar && !this._hScrollNone)
				this._viewHeight -= this._hzScrollBar.height;
			if(this._vtScrollBar && !this._vScrollNone)
				this._viewWidth -= this._vtScrollBar.width;
			this._viewWidth -= (this._owner.margin.left + this._owner.margin.right);
			this._viewHeight -= (this._owner.margin.top + this._owner.margin.bottom);
			
			this._viewWidth = Math.max(1,this._viewWidth);
			this._viewHeight = Math.max(1,this._viewHeight);
			this._pageSizeH = this._viewWidth;
			this._pageSizeV = this._viewHeight;
			
			this.handleSizeChanged();
		}
		
		public function setContentSize(aWidth: Number, aHeight: Number): void {
			if (this._contentWidth == aWidth && this._contentHeight == aHeight)
				return;
			
			this._contentWidth = aWidth;
			this._contentHeight = aHeight;
			this.handleSizeChanged();
		}
		
		internal function changeContentSizeOnScrolling(deltaWidth:Number, deltaHeight:Number,
													   deltaPosX:Number, deltaPosY:Number):void
		{
			_contentWidth += deltaWidth;
			_contentHeight += deltaHeight;
			
			if (isDragged)
			{
				if (deltaPosX != 0)
					_container.x -= deltaPosX;
				if (deltaPosY != 0)
					_container.y -= deltaPosY;
				
				validateHolderPos();
				
				_xOffset += deltaPosX;
				_yOffset += deltaPosY;
				
				var tmp:Number = _y2 - _y1;
				_y1 = _container.y;
				_y2 = _y1 + tmp;
				
				tmp = _x2 - _x1;
				_x1 = _container.x;
				_x2 = _x1 + tmp;
				
				_yPos = -_container.y;
				_xPos = -_container.x;
			}
			else if (_tweening == 2)
			{
				if (deltaPosX != 0)
				{
					_container.x -= deltaPosX;
					_tweenHelper.start.x -= deltaPosX;
				}
				if (deltaPosY != 0)
				{
					_container.y -= deltaPosY;
					_tweenHelper.start.y -= deltaPosY;
				}
			}
			
			handleSizeChanged(true);
		}
		
		private function handleSizeChanged(onScrolling:Boolean=false): void {
			if(this._displayInDemand) {
				if(this._vtScrollBar) {
					if(this._contentHeight <= this._viewHeight) {
						if(!this._vScrollNone) {
							this._vScrollNone = true;
							this._viewWidth += this._vtScrollBar.width;
						}
					}
					else {
						if(this._vScrollNone) {
							this._vScrollNone = false;
							this._viewWidth -= this._vtScrollBar.width;
						}
					}
				}
				if(this._hzScrollBar) {
					if(this._contentWidth <= this._viewWidth) {
						if(!this._hScrollNone) {
							this._hScrollNone = true;
							this._viewHeight += this._hzScrollBar.height;
						}
					}
					else {
						if(this._hScrollNone) {
							this._hScrollNone = false;
							this._viewHeight -= this._hzScrollBar.height;
						}
					}
				}
			}
			
			if(this._vtScrollBar) {
				if(this._viewHeight < this._vtScrollBar.minSize)
					this._vtScrollBar.displayObject.visible = false;
				else {
					this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
					if(this._contentHeight == 0)
						this._vtScrollBar.displayPerc = 0;
					else
						this._vtScrollBar.displayPerc = Math.min(1,this._viewHeight / this._contentHeight);
				}
			}
			if(this._hzScrollBar) {
				if(this._viewWidth < this._hzScrollBar.minSize)
					this._hzScrollBar.displayObject.visible = false;
				else {
					this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
					if(this._contentWidth == 0)
						this._hzScrollBar.displayPerc = 0;
					else
						this._hzScrollBar.displayPerc = Math.min(1,this._viewWidth / this._contentWidth);
				}
			}
			
			var rect:Rectangle = this._maskContainer.scrollRect;
			if(rect!=null)
			{
				rect.width = this._viewWidth;
				rect.height = this._viewHeight;
				this._maskContainer.scrollRect = rect;
			}
			
			if (_scrollType == ScrollType.Horizontal || _scrollType == ScrollType.Both)
				_xOverlap = Math.ceil(Math.max(0, _contentWidth - _viewWidth));
			else
				_xOverlap = 0;
			if (_scrollType == ScrollType.Vertical || _scrollType == ScrollType.Both)
				_yOverlap = Math.ceil(Math.max(0, _contentHeight - _viewHeight));
			else
				_yOverlap = 0;
			
			if(_tweening==0 && onScrolling)
			{
				//如果原来是在边缘，且不在缓动状态，那么尝试继续贴边。（如果在缓动状态，需要修改tween的终值，暂时未支持）
				if(_xPerc==0 || _xPerc==1)
				{
					_xPos = _xPerc * _xOverlap;
					_container.x = -_xPos;
				}
				if(_yPerc==0 || _yPerc==1)
				{
					_yPos = _yPerc * _yOverlap;
					_container.y = -_yPos;
				}
			}
			else
			{
				//边界检查
				_xPos = ToolSet.clamp(_xPos, 0, _xOverlap);
				_xPerc = _xOverlap>0?_xPos/_xOverlap:0;
				
				_yPos = ToolSet.clamp(_yPos, 0, _yOverlap);
				_yPerc = _yOverlap>0?_yPos/_yOverlap:0;
			}
			
			validateHolderPos();
			
			if (_vtScrollBar != null)
				_vtScrollBar.scrollPerc = _yPerc;
			if (_hzScrollBar != null)
				_hzScrollBar.scrollPerc = _xPerc;
			
			if(_pageMode)
				updatePageController();
		}
		
		private function validateHolderPos():void
		{
			_container.x = ToolSet.clamp(_container.x, -_xOverlap, 0);
			_container.y = ToolSet.clamp(_container.y, -_yOverlap, 0);
		}
		
		private function posChanged(ani: Boolean): void {
			if (_aniFlag == 0)
				_aniFlag = ani ? 1 : -1;
			else if (_aniFlag == 1 && !ani)
				_aniFlag = -1;
			
			this._needRefresh = true;
			Laya.timer.callLater(this, this.refresh);
			
			//如果在甩手指滚动过程中用代码重新设置滚动位置，要停止滚动
			if(this._tweening == 2) {
				this.killTween();
			}
		}
		
		private function killTween():void
		{
			if(_tweening==1)
			{
				_tweener.clear();
				_tweening = 0;
				_tweener = null;
				
				syncScrollBar(true);
			}
			else if(_tweening==2)
			{
				_tweener.clear();
				_tweener = null;
				_tweening = 0;
				
				validateHolderPos();
				syncScrollBar(true);
				Events.dispatch(Events.SCROLL_END, this._owner.displayObject);
			}			
		}
		
		private function refresh(): void {
			this._needRefresh = false;
			Laya.timer.clear(this, this.refresh);
			
			if(_pageMode)
			{
				var page:int;
				var delta:Number;
				if(_yOverlap>0 && _yPerc!=1 && _yPerc!=0)
				{
					page = Math.floor(_yPos / _pageSizeV);
					delta = _yPos - page*_pageSizeV;
					if(delta>_pageSizeV/2)
						page++;
					_yPos = page * _pageSizeV;
					if(_yPos>_yOverlap)
					{
						_yPos = _yOverlap;
						_yPerc = 1;
					}
					else
						_yPerc = _yPos / _yOverlap;
				}
				
				if(_xOverlap>0 && _xPerc!=1 && _xPerc!=0)
				{
					page = Math.floor(_xPos / _pageSizeH);
					delta = _xPos - page*_pageSizeH;
					if(delta>_pageSizeH/2)
						page++;
					_xPos = page * _pageSizeH;
					if(_xPos>_xOverlap)
					{
						_xPos = _xOverlap;
						_xPerc = 1;
					}
					else
						_xPerc = _xPos / _xOverlap;
				}
			}
			else if(_snapToItem)
			{
				var pt:Point = _owner.getSnappingPosition(_xPerc==1?0:_xPos, _yPerc==1?0:_yPos, sHelperPoint);
				if (_xPerc != 1 && pt.x!=_xPos)
				{
					_xPos = pt.x;
					_xPerc = _xPos / _xOverlap;
					if(_xPerc>1)
					{
						_xPerc = 1;
						_xPos = _xOverlap;
					}
				}
				if (_yPerc != 1 && pt.y!=_yPos)
				{
					_yPos = pt.y;
					_yPerc = _yPos / _yOverlap;
					if(_yPerc>1)
					{
						_yPerc = 1;
						_yPos = _yOverlap;
					}
				}
			}
			
			this.refresh2();
			Events.dispatch(Events.SCROLL, this._owner.displayObject);
			if(this._needRefresh) //user change scroll pos in on scroll
			{
				this._needRefresh = false;
				Laya.timer.clear(this, this.refresh);
				
				this.refresh2();
			}
			
			this._aniFlag = 0;
		}
		
		private function refresh2():void {
			var contentXLoc:Number = Math.floor(_xPos);
			var contentYLoc:Number = Math.floor(_yPos);
			
			if(this._aniFlag==1 && !this.isDragged) {
				var toX: Number = this._container.x;
				var toY: Number = this._container.y;
				if(_yOverlap>0)
					toY = -contentYLoc;
				else {
					if(this._container.y != 0)
						this._container.y = 0;
				}
				if(_xOverlap>0)
					toX = -contentXLoc;
				else {
					if(this._container.x != 0)
						this._container.x = 0;
				}
				
				if(toX != this._container.x || toY != this._container.y) {
					this.killTween();
					
					this._maskContainer.mouseEnabled = false;
					this._tweening = 1;
					this._tweener = Tween.to(this._container,
						{ x: toX, y: toY },
						500,
						ScrollPane._easeTypeFunc,
						Handler.create(this, this.__tweenComplete));
					this._tweener.update = Handler.create(this, this.__tweenUpdate, null, false);
				}
			}
			else {
				if(_tweener!=null)
					this.killTween();
				
				//如果在拖动的过程中Refresh，这里要进行处理，保证拖动继续正常进行
				if(this.isDragged) {
					this._xOffset += this._container.x - (-contentXLoc);
					this._yOffset += this._container.y - (-contentYLoc);
				}
				
				this._container.pos(-contentXLoc,-contentYLoc); 
				
				//如果在拖动的过程中Refresh，这里要进行处理，保证手指离开是滚动正常进行
				if(this.isDragged) {
					this._y1 = this._y2 = this._container.y;
					this._x1 = this._x2 = this._container.x;
				}
				
				if(this._vtScrollBar)
					this._vtScrollBar.scrollPerc = this._yPerc;
				if(this._hzScrollBar)
					this._hzScrollBar.scrollPerc = this._xPerc;
			}
			
			if(_pageMode)
				updatePageController();
		}
		
		private function syncPos():void
		{
			if(_xOverlap>0)
			{
				_xPos = ToolSet.clamp(-_container.x, 0, _xOverlap);
				_xPerc = _xPos / _xOverlap;
			}
			
			if(_yOverlap>0)
			{
				_yPos = ToolSet.clamp(-_container.y, 0, _yOverlap);
				_yPerc = _yPos / _yOverlap;
			}
			
			if(_pageMode)
				updatePageController();
		}
		
		private function syncScrollBar(end:Boolean=false):void
		{
			if(end)
			{
				if(_vtScrollBar)
				{
					if(_scrollBarDisplayAuto)
						showScrollBar(false);
				}
				if(_hzScrollBar)
				{
					if(_scrollBarDisplayAuto)
						showScrollBar(false);
				}
				_maskContainer.mouseEnabled = true;
			}
			else
			{
				if(_vtScrollBar)
				{
					_vtScrollBar.scrollPerc = _yOverlap == 0 ? 0 : ToolSet.clamp(-_container.y, 0, _yOverlap) / _yOverlap;
					if(_scrollBarDisplayAuto)
						showScrollBar(true);
				}
				if(_hzScrollBar)
				{
					_hzScrollBar.scrollPerc =  _xOverlap == 0 ? 0 : ToolSet.clamp(-_container.x, 0, _xOverlap) / _xOverlap;
					if(_scrollBarDisplayAuto)
						showScrollBar(true);
				}
			}
		}
		
		private function __mouseDown(): void {
			if (!this._touchEffect)
				return;
			
			if(_tweener!=null)
				this.killTween();
			
			this._owner.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, ScrollPane.sHelperPoint);
			
			this._x1 = this._x2 = this._container.x;
			this._y1 = this._y2 = this._container.y;
			
			this._xOffset = ScrollPane.sHelperPoint.x - this._container.x;
			this._yOffset = ScrollPane.sHelperPoint.y - this._container.y;
			
			this._time1 = this._time2 = Laya.timer.currTimer;
			this._holdAreaPoint.x = ScrollPane.sHelperPoint.x;
			this._holdAreaPoint.y = ScrollPane.sHelperPoint.y;
			this._isHoldAreaDone = false;
			this.isDragged = false;
			
			this._owner.displayObject.stage.on(Event.MOUSE_MOVE, this, this.__mouseMove);
			this._owner.displayObject.stage.on(Event.MOUSE_UP, this, this.__mouseUp);
			this._owner.displayObject.stage.on(Event.CLICK, this, this.__click);
		}
		
		private function __mouseMove(): void {
			if(!_touchEffect)
				return;
			
			if (draggingPane != null && draggingPane != this || GObject.draggingObject != null) //已经有其他拖动
				return;
			
			var sensitivity: Number = fairygui.UIConfig.touchScrollSensitivity;
			
			var pt:laya.maths.Point = this._owner.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, ScrollPane.sHelperPoint);
			
			var diff:Number, diff2:Number;
			var sv:Boolean, sh:Boolean, st:Boolean;
			
			if (_scrollType == ScrollType.Vertical) 
			{
				if (!_isHoldAreaDone)
				{
					//表示正在监测垂直方向的手势
					_gestureFlag |= 1;
					
					diff = Math.abs(_holdAreaPoint.y - _maskContainer.mouseY);
					if (diff < sensitivity)
						return;
					
					if ((_gestureFlag & 2) != 0) //已经有水平方向的手势在监测，那么我们用严格的方式检查是不是按垂直方向移动，避免冲突
					{
						diff2 = Math.abs(_holdAreaPoint.x - _maskContainer.mouseX);
						if (diff < diff2) //不通过则不允许滚动了
							return;
					}
				}
				
				sv = true;
			}
			else if (_scrollType == ScrollType.Horizontal) 
			{
				if (!_isHoldAreaDone)
				{
					_gestureFlag |= 2;
					
					diff = Math.abs(_holdAreaPoint.x - _maskContainer.mouseX);
					if (diff < sensitivity)
						return;
					
					if ((_gestureFlag & 1) != 0)
					{
						diff2 = Math.abs(_holdAreaPoint.y - _maskContainer.mouseY);
						if (diff < diff2)
							return;
					}
				}
				
				sh = true;
			}
			else
			{
				_gestureFlag = 3;
				
				if (!_isHoldAreaDone)
				{
					diff = Math.abs(_holdAreaPoint.y - _maskContainer.mouseY);
					if (diff < sensitivity)
					{
						diff = Math.abs(_holdAreaPoint.x - _maskContainer.mouseX);
						if (diff < sensitivity)
							return;
					}
				}
				
				sv = sh = true;
			}
			
			var t: Number = Laya.timer.currTimer;
			if (t - this._time2 > 50) {
				this._time2 = this._time1;
				this._time1 = t;
				st = true;
			}
			
			if (sv) {
				var y: Number = Math.floor(pt.y - this._yOffset);
				if (y > 0) {
					if (!this._bouncebackEffect || this._inertiaDisabled)
						this._container.y = 0;
					else
						this._container.y = Math.floor(y * 0.5);
				}
				else if (y < -this._yOverlap) {
					if (!this._bouncebackEffect || this._inertiaDisabled)
						this._container.y = -Math.floor(this._yOverlap);
					else
						this._container.y = Math.floor((y - this._yOverlap) * 0.5);
				}
				else {
					this._container.y = y;
				}
				
				if (st) {
					this._y2 = this._y1;
					this._y1 = this._container.y;
				}
			}
			
			if (sh) {
				var x: Number = Math.floor(pt.x - this._xOffset);
				if (x > 0) {
					if (!this._bouncebackEffect || this._inertiaDisabled)
						this._container.x = 0;
					else
						this._container.x = Math.floor(x * 0.5);
				}
				else if (x < 0 - this._xOverlap || this._inertiaDisabled) {
					if (!this._bouncebackEffect)
						this._container.x = -Math.floor(this._xOverlap);
					else
						this._container.x = Math.floor((x - this._xOverlap) * 0.5);
				}
				else {
					this._container.x = x;
				}
				
				if (st) {
					this._x2 = this._x1;
					this._x1 = this._container.x;
				}
			}
			
			draggingPane = this;
			this._maskContainer.mouseEnabled = false;
			this._isHoldAreaDone = true;
			this.isDragged = true;
			syncPos();
			syncScrollBar();
			Events.dispatch(Events.SCROLL, this._owner.displayObject);
		}
		
		private function __mouseUp(): void {
			this._owner.displayObject.stage.off(Event.MOUSE_MOVE, this, this.__mouseMove);
			this._owner.displayObject.stage.off(Event.MOUSE_UP, this, this.__mouseUp);
			this._owner.displayObject.stage.off(Event.CLICK, this, this.__click);
			
			if (!this._touchEffect) {
				this.isDragged = false;
				return;
			}
			
			if (draggingPane == this)
				draggingPane = null;
			
			_gestureFlag = 0;
			
			if (!isDragged || !_touchEffect || _inertiaDisabled)
			{
				isDragged = false;
				return;
			}
			
			isDragged = false;
			
			var time: Number = (Laya.timer.currTimer - this._time2) / 1000;
			if (time == 0)
				time = 0.001;
			var yVelocity: Number = (this._container.y - this._y2) / time * 2 * fairygui.UIConfig.defaultTouchScrollSpeedRatio;;
			var xVelocity: Number = (this._container.x - this._x2) / time * 2 * fairygui.UIConfig.defaultTouchScrollSpeedRatio;;
			var duration: Number = 0.3;
			
			this._tweenHelper.start.x = this._container.x;
			this._tweenHelper.start.y = this._container.y;
			
			var change1: Point = this._tweenHelper.change1;
			var change2: Point = this._tweenHelper.change2;
			var endX: Number = 0;
			var endY: Number = 0;
			var page: Number = 0;
			var delta: Number = 0;
			var fireRelease:int = 0;
			
			var testPageSize:Number;
			
			if(_scrollType==ScrollType.Both || _scrollType==ScrollType.Horizontal)
			{
				if (_container.x > fairygui.UIConfig.touchDragSensitivity)
					fireRelease = 1;
				else if (_container.x <  -_xOverlap - fairygui.UIConfig.touchDragSensitivity)
					fireRelease = 2;
				
				change1.x = TweenHelper.calculateChange(xVelocity, duration);
				change2.x = 0;
				endX = _container.x + change1.x;
				
				if(_pageMode && endX<0 && endX>-_xOverlap)
				{
					page = Math.floor(-endX / _pageSizeH);
					testPageSize = Math.min(_pageSizeH, _contentWidth - (page + 1) * _pageSizeH);
					delta = -endX - page*_pageSizeH;
					//页面吸附策略
					if (Math.abs(change1.x) > _pageSizeH)//如果滚动距离超过1页,则需要超过页面的一半，才能到更下一页
					{
						if (delta > testPageSize * 0.5)
							page++;
					}
					else //否则只需要页面的1/3，当然，需要考虑到左移和右移的情况
					{
						if (delta > testPageSize * (change1.x < 0 ? 0.3 : 0.7))
							page++;
					}
					
					//重新计算终点
					endX = -page * _pageSizeH;
					if (endX < -_xOverlap) //最后一页未必有_pageSizeH那么大
						endX = -_xOverlap;
					
					change1.x = endX - _container.x;
				}
			}
			else
				change1.x = change2.x = 0;
			
			if(_scrollType==ScrollType.Both || _scrollType==ScrollType.Vertical)
			{
				if (_container.y > fairygui.UIConfig.touchDragSensitivity)
					fireRelease = 1;
				else if (_container.y <  -_yOverlap - fairygui.UIConfig.touchDragSensitivity)
					fireRelease = 2;
				
				change1.y = TweenHelper.calculateChange(yVelocity, duration);
				change2.y = 0;
				endY = _container.y + change1.y;
				
				if(_pageMode && endY < 0 && endY > -_yOverlap)
				{
					page = Math.floor(-endY / _pageSizeV);
					testPageSize = Math.min(_pageSizeV, _contentHeight - (page + 1) * _pageSizeV);
					delta = -endY - page * _pageSizeV;
					if (Math.abs(change1.y) > _pageSizeV)
					{
						if (delta > testPageSize * 0.5)
							page++;
					}
					else
					{
						if (delta > testPageSize * (change1.y < 0 ? 0.3 : 0.7))
							page++;
					}
					
					endY = -page * _pageSizeV;
					if (endY < -_yOverlap)
						endY = -_yOverlap;
					
					change1.y = endY - _container.y;
				}
			}
			else
				change1.y = change2.y = 0;
			
			if (_snapToItem && !_pageMode)
			{
				endX = -endX;
				endY = -endY;
				var pt: Point = this._owner.getSnappingPosition(endX,endY,ScrollPane.sHelperPoint);
				endX = -pt.x;
				endY = -pt.y;
				change1.x = endX - this._container.x;
				change1.y = endY - this._container.y;
			}
			
			if(this._bouncebackEffect) {
				if(endX > 0)
					change2.x = 0 - this._container.x - change1.x;
				else if(endX < -this._xOverlap)
					change2.x = -this._xOverlap - this._container.x - change1.x;
				
				if(endY > 0)
					change2.y = 0 - this._container.y - change1.y;
				else if(endY < -this._yOverlap)
					change2.y = -this._yOverlap - this._container.y - change1.y;
			}
			else {
				if(endX > 0)
					change1.x = 0 - this._container.x;
				else if(endX < -this._xOverlap)
					change1.x = -this._xOverlap - this._container.x;
				
				if(endY > 0)
					change1.y = 0 - this._container.y;
				else if(endY < -this._yOverlap)
					change1.y = -this._yOverlap - this._container.y;
			}
			
			this._tweenHelper.value = 0;
			this._tweenHelper.change1 = change1;
			this._tweenHelper.change2 = change2;
			
			if(_tweener!=null)
				this.killTween();
			this._tweening = 2;
			this._tweener = Tween.to(this._tweenHelper, { value: 1 }, 
				duration * 1000, 
				ScrollPane._easeTypeFunc,
				Handler.create(this, this.__tweenComplete2));
			this._tweener.update = Handler.create(this, this.__tweenUpdate2, null, false);
			
			if (fireRelease == 1)
				Events.dispatch(Events.PULL_DOWN_RELEASE, this._owner.displayObject);
			else if (fireRelease == 2)
				Events.dispatch(Events.PULL_UP_RELEASE, this._owner.displayObject);
		}
		
		private function __click(): void {
			this.isDragged = false;
		}
		
		private function __mouseWheel(evt:Event):void {
			if(!this._mouseWheelEnabled)
				return;
			
			var pt:Point = this._owner.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, ScrollPane.sHelperPoint);
			
			var delta:Number = evt["delta"];
			if (_xOverlap > 0 && _yOverlap == 0)
			{
				if(delta<0)
					this.setPercX(this._xPerc + this.getDeltaX(this._mouseWheelSpeed), false);
				else
					this.setPercX(this._xPerc - this.getDeltaX(this._mouseWheelSpeed), false);
			}
			else {
				if(delta<0)
					this.setPercY(this._yPerc + this.getDeltaY(this._mouseWheelSpeed), false);
				else
					this.setPercY(this._yPerc - this.getDeltaY(this._mouseWheelSpeed), false);
			}
		}
		
		private function __rollOver(): void {
			this.showScrollBar(true);
		}
		
		private function __rollOut(): void {
			this.showScrollBar(false);
		}
		
		private function showScrollBar(val: Boolean): void {
			if (val) {
				this.__showScrollBar(true);
				Laya.timer.clear(this, this.__showScrollBar);
			}
			else
				Laya.timer.once(500, this, this.__showScrollBar, [val]);
		}
		
		private function __showScrollBar(val: Boolean): void {
			this._scrollBarVisible = val && this._viewWidth > 0 && this._viewHeight > 0;
			if (this._vtScrollBar)
				this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
			if (this._hzScrollBar)
				this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
		}
		
		public function __tweenUpdate(): void {
			syncScrollBar();
			Events.dispatch(Events.SCROLL, this._owner.displayObject);
		}
		
		private function __tweenComplete(): void {
			_tweener = null;
			_tweening = 0;
			
			validateHolderPos();
			syncScrollBar(true);
			Events.dispatch(Events.SCROLL, this._owner.displayObject);
		}
		
		public function __tweenUpdate2(): void {
			this._container.pos(Math.floor(this._tweenHelper.start.x + this._tweenHelper.change1.x * this._tweenHelper.value 
				+ this._tweenHelper.change2.x * this._tweenHelper.value * this._tweenHelper.value),
				Math.floor(this._tweenHelper.start.y +this._tweenHelper.change1.y *this._tweenHelper.value 
					+ this._tweenHelper.change2.y * this._tweenHelper.value * this._tweenHelper.value));
			
			syncPos();
			syncScrollBar();
			Events.dispatch(Events.SCROLL, this._owner.displayObject);
		}
		
		private function __tweenComplete2(): void {
			_tweener = null;
			_tweening = 0;
			
			validateHolderPos();
			syncPos();
			syncScrollBar(true);
			
			Events.dispatch(Events.SCROLL, this._owner.displayObject);
			Events.dispatch(Events.SCROLL_END, this._owner.displayObject);
		}
	}
}
import laya.maths.Point;

class TweenHelper {    
	public var value: Number;
	
	public var start: Point;
	public var change1: Point;
	public var change2: Point;
	
	private static var checkpoint: Number = 0.05;
	
	public function TweenHelper() {
		this.start = new Point();
		this.change1 = new Point();
		this.change2 = new Point();
	}
	
	public static function calculateChange(velocity: Number, duration: Number): Number {
		return (duration * TweenHelper.checkpoint * velocity) / TweenHelper.easeOutCubic(TweenHelper.checkpoint, 0, 1, 1);
	}
	public static function easeOutCubic(t: Number, b: Number, c: Number, d: Number): Number {
		return c * ((t = t / d - 1) * t * t + 1) + b;
	}
}