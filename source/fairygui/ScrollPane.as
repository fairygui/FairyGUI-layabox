package fairygui {
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	import laya.utils.Ease;
	import laya.utils.Handler;
	import laya.utils.Tween;

    public class ScrollPane extends Object {
        private var _owner: GComponent;
        private var _container: Sprite;
        private var _maskHolder: Sprite;
        private var _maskContentHolder: Sprite;

        private var _maskWidth: Number = 0;
        private var _maskHeight: Number = 0;
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
        private var _vScroll: Boolean;
        private var _hScroll: Boolean;
        private var _needRefresh: Boolean;

        private static var _easeTypeFunc:Function;
        private var _tweening: Number;
        private var _tweenHelper: TweenHelper;
        private var _tweener: Tween;

        private var _time1: Number;
        private var _time2: Number;
        private var _y1: Number;
        private var _y2: Number;
        private var _yOverlap: Number;
        private var _yOffset: Number;
        private var _x1: Number;
        private var _x2: Number;
        private var _xOverlap: Number;
        private var _xOffset: Number;

        public var _isMouseMoved: Boolean;
        private var _holdAreaPoint: Point;
        private var _isHoldAreaDone: Boolean;
        private var _aniFlag: Boolean;
        private var _scrollBarVisible: Boolean;

        private var _hzScrollBar: GScrollBar;
        private var _vtScrollBar: GScrollBar;
        
        private static var sHelperRect:Rectangle = new Rectangle();

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
            this._container = this._owner.displayObject;

            this._maskHolder = new Sprite();
            this._container.addChild(this._maskHolder);

            this._maskContentHolder = this._owner._container;
            this._maskContentHolder.pos(0,0);
			this._maskHolder.scrollRect = new Rectangle();
            this._maskHolder.addChild(this._maskContentHolder);
            
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
			
            this._xPerc = 0;
            this._yPerc = 0;
            this._aniFlag = true;
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
                        this._container.addChild(this._vtScrollBar.displayObject);
                    }
                }
                if(this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Horizontal) {
                    res = hzScrollBarRes ? hzScrollBarRes : fairygui.UIConfig.horizontalScrollBar;
                    if(res) {
                        this._hzScrollBar = GScrollBar(UIPackage.createObjectFromURL(res));
                        if(!this._hzScrollBar)
                            throw "cannot create scrollbar from " + res;
                        this._hzScrollBar.setScrollPane(this, false);
                        this._container.addChild(this._hzScrollBar.displayObject);
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
            this.setSize(owner.width,owner.height,true);

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

        public function set percX(sc: Number):void {
            this.setPercX(sc, false);
        }

        public function setPercX(sc: Number, ani: Boolean= false): void {
            if (sc > 1)
                sc = 1;
            else if (sc < 0)
                sc = 0;
            if (sc != this._xPerc) {
                this._xPerc = sc;
                this.posChanged(ani);
            }
        }

        public function get percY(): Number {
            return this._yPerc;
        }

        public function set percY(sc: Number):void {
            this.setPercY(sc, false);
        }

        public function setPercY(sc: Number, ani: Boolean= false): void {
            if (sc > 1)
                sc = 1;
            else if (sc < 0)
                sc = 0;
            if (sc != this._yPerc) {
                this._yPerc = sc;
                this.posChanged(ani);
            }
        }

        public function get posX(): Number {
            return this._xPerc * Math.max(0, this.contentWidth - this._maskWidth);
        }

        public function set posX(val: Number):void {
            this.setPosX(val, false);
        }

        public function setPosX(val: Number, ani: Boolean= false): void {
            if(this._contentWidth > this._maskWidth)
                this.setPercX(val / (this._contentWidth - this._maskWidth), ani);
            else
                this.setPercX(0, ani);
        }

        public function get posY(): Number {
            return this._yPerc * Math.max(0,this._contentHeight - this._maskHeight);
        }

        public function set posY(val: Number):void {
            this.setPosY(val, false);
        }

        public function setPosY(val: Number, ani: Boolean= false): void {
            if(this._contentHeight > this._maskHeight)
                this.setPercY(val / (this._contentHeight - this._maskHeight), ani);
            else
                this.setPercY(0, ani);
        }

        public function get isBottomMost(): Boolean {
            return this._yPerc == 1 || this._contentHeight <= this._maskHeight;
        }

        public function get isRightMost(): Boolean {
            return this._xPerc == 1 || this._contentWidth <= this._maskWidth;
        }
        
        public function get currentPageX(): Number {
            return this._pageMode ? Math.floor(this.posX / this._pageSizeH) : 0;
        }

        public function set currentPageX(value: Number):void {
            if(this._pageMode && this._hScroll)
                this.setPosX(value * this._pageSizeH,false);
        }

        public function get currentPageY(): Number {
            return this._pageMode ? Math.floor(this.posY / this._pageSizeV) : 0;
        }

        public function set currentPageY(value: Number):void {
            if(this._pageMode && this._hScroll)
                this.setPosY(value * this._pageSizeV,false);
        }

        public function get contentWidth(): Number {
            return this._contentWidth;
        }

        public function get contentHeight(): Number {
            return this._contentHeight;
        }

        public function get viewWidth(): Number {
            return this._maskWidth;
        }

        public function set viewWidth(value: Number):void {
            value = value + this._owner.margin.left + this._owner.margin.right;
            if (this._vtScrollBar != null)
                value += this._vtScrollBar.width;
            this._owner.width = value;
        }

        public function get viewHeight(): Number {
            return this._maskHeight;
        }

        public function set viewHeight(value: Number):void {
            value = value + this._owner.margin.top + this._owner.margin.bottom;
            if (this._hzScrollBar != null)
                value += this._hzScrollBar.height;
            this._owner.height = value;
        }

        private function getDeltaX(move: Number): Number {
            return move / (this._contentWidth - this._maskWidth);
        }

        private function getDeltaY(move: Number): Number {
            return move / (this._contentHeight - this._maskHeight);
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

            if (this._vScroll) {
                var top: Number = this.posY;
                var bottom: Number = top + this._maskHeight;
                if(setFirst || rect.y < top || rect.height >= this._maskHeight) {
                    if(this._pageMode)
                        this.setPosY(Math.floor(rect.y / this._pageSizeV) * this._pageSizeV, ani);
                    else
                        this.setPosY(rect.y, ani);
                }
                else if(rect.y + rect.height > bottom) {
                    if(this._pageMode)
                        this.setPosY(Math.floor(rect.y / this._pageSizeV) * this._pageSizeV,ani);
                    else if(rect.height <= this._maskHeight/2)
                        this.setPosY(rect.y + rect.height * 2 - this._maskHeight, ani);
                    else
                        this.setPosY(rect.y + rect.height - this._maskHeight, ani);
                }
            }
            if (this._hScroll) {
                var left: Number =  this.posX;
                var right: Number = left + this._maskWidth;
                if(setFirst || rect.x < left || rect.width >= this._maskWidth) {
                    if(this._pageMode)
                        this.setPosX(Math.floor(rect.x / this._pageSizeH) * this._pageSizeH,ani);
                    else
                        this.setPosX(rect.x, ani);
                }
                else if(rect.x + rect.width > right) {
                    if(this._pageMode)
                        this.setPosX(Math.floor(rect.x / this._pageSizeH) * this._pageSizeH,ani);
                    else if(rect.width <= this._maskWidth/2)
                        this.setPosX(rect.x + rect.width * 2 - this._maskWidth, ani);
                    else
                        this.setPosX(rect.x + rect.width - this._maskWidth, ani);
                }                
            }
            
            if(!ani && this._needRefresh) 
                this.refresh();             
        }
        
        public function isChildInView(obj: GObject): Boolean {
            var dist:Number;
            if(this._vScroll) {
                dist = obj.y + this._maskContentHolder.y;
                if(dist < -obj.height - 20 || dist > this._maskHeight + 20)
                    return false;
            }

            if(this._hScroll) {
                dist = obj.x + this._maskContentHolder.x;
                if(dist < -obj.width - 20 || dist > this._maskWidth + 20)
                    return false;
            }

            return true;
        }

        public function setSize(aWidth: Number,aHeight: Number,noRefresh: Boolean = false): void {
            if(this._displayOnLeft && this._vtScrollBar)
                this._maskHolder.x = Math.floor(this._owner.margin.left + this._vtScrollBar.width);
            else
                this._maskHolder.x = this._owner.margin.left;
            this._maskHolder.y = this._owner.margin.top;
            
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
            
            this._maskWidth = aWidth;
            this._maskHeight = aHeight;
            if(this._hzScrollBar && !this._hScrollNone)
                this._maskHeight -= this._hzScrollBar.height;
            if(this._vtScrollBar && !this._vScrollNone)
                this._maskWidth -= this._vtScrollBar.width;
            this._maskWidth -= (this._owner.margin.left + this._owner.margin.right);
            this._maskHeight -= (this._owner.margin.top + this._owner.margin.bottom);

            this._maskWidth = Math.max(1,this._maskWidth);
            this._maskHeight = Math.max(1,this._maskHeight);
            this._pageSizeH = this._maskWidth;
            this._pageSizeV = this._maskHeight;
            
            this.handleSizeChanged();
            if(!noRefresh)
                this.posChanged(false);
        }

        public function setContentSize(aWidth: Number, aHeight: Number): void {
            if (this._contentWidth == aWidth && this._contentHeight == aHeight)
                return;

            this._contentWidth = aWidth;
            this._contentHeight = aHeight;
            this.handleSizeChanged();
            this._aniFlag = false;
            this.refresh();
        }
        
        private function handleSizeChanged(): void {
            if(this._displayInDemand) {
                if(this._vtScrollBar) {
                    if(this._contentHeight <= this._maskHeight) {
                        if(!this._vScrollNone) {
                            this._vScrollNone = true;
                            this._maskWidth += this._vtScrollBar.width;
                        }
                    }
                    else {
                        if(this._vScrollNone) {
                            this._vScrollNone = false;
                            this._maskWidth -= this._vtScrollBar.width;
                        }
                    }
                }
                if(this._hzScrollBar) {
                    if(this._contentWidth <= this._maskWidth) {
                        if(!this._hScrollNone) {
                            this._hScrollNone = true;
                            this._maskHeight += this._vtScrollBar.height;
                        }
                    }
                    else {
                        if(this._hScrollNone) {
                            this._hScrollNone = false;
                            this._maskHeight -= this._vtScrollBar.height;
                        }
                    }
                }
            }

            if(this._vtScrollBar) {
                if(this._maskHeight < this._vtScrollBar.minSize)
                    this._vtScrollBar.displayObject.visible = false;
                else {
                    this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
                    if(this._contentHeight == 0)
                        this._vtScrollBar.displayPerc = 0;
                    else
                        this._vtScrollBar.displayPerc = Math.min(1,this._maskHeight / this._contentHeight);
                }
            }
            if(this._hzScrollBar) {
                if(this._maskWidth < this._hzScrollBar.minSize)
                    this._hzScrollBar.displayObject.visible = false;
                else {
                    this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
                    if(this._contentWidth == 0)
                        this._hzScrollBar.displayPerc = 0;
                    else
                        this._hzScrollBar.displayPerc = Math.min(1,this._maskWidth / this._contentWidth);
                }
            }

			var rect:Rectangle = this._maskHolder.scrollRect;
			rect.width = this._maskWidth;
			rect.height = this._maskHeight;
			this._maskHolder.scrollRect = rect;
                
            this._xOverlap = Math.max(0, this._contentWidth - this._maskWidth);
            this._yOverlap = Math.max(0, this._contentHeight - this._maskHeight);
                    
            switch(this._scrollType) {
                case ScrollType.Both:

                    if(this._contentWidth > this._maskWidth && this._contentHeight <= this._maskHeight) {
                        this._hScroll = true;
                        this._vScroll = false;
                    }
                    else if(this._contentWidth <= this._maskWidth && this._contentHeight > this._maskHeight) {
                        this._hScroll = false;
                        this._vScroll = true;
                    }
                    else if(this._contentWidth > this._maskWidth && this._contentHeight > this._maskHeight) {
                        this._hScroll = true;
                        this._vScroll = true;
                    }
                    else {
                        this._hScroll = false;
                        this._vScroll = false;
                    }
                    break;

                case ScrollType.Vertical:

                    if(this._contentHeight > this._maskHeight) {
                        this._hScroll = false;
                        this._vScroll = true;
                    }
                    else {
                        this._hScroll = false;
                        this._vScroll = false;
                    }
                    break;

                case ScrollType.Horizontal:

                    if(this._contentWidth > this._maskWidth) {
                        this._hScroll = true;
                        this._vScroll = false;
                    }
                    else {
                        this._hScroll = false;
                        this._vScroll = false;
                    }
                    break;
            }
        }

        private function posChanged(ani: Boolean): void {
            if (this._aniFlag)
                this._aniFlag = ani;

            this._needRefresh = true;
            Laya.timer.callLater(this, this.refresh);
            
            //如果在甩手指滚动过程中用代码重新设置滚动位置，要停止滚动
            if(this._tweening == 2) {
                this.killTweens();
            }
        }

        private function refresh(): void {
            this._needRefresh = false;
            Laya.timer.clear(this, this.refresh);
            var contentYLoc: Number = 0;
            var contentXLoc: Number = 0;

            if (this._vScroll)
                contentYLoc = this._yPerc * (this._contentHeight - this._maskHeight);
            if (this._hScroll)
                contentXLoc = this._xPerc * (this._contentWidth - this._maskWidth);

            if(this._pageMode) {
                var page: Number;
                var delta: Number;
                if(this._vScroll && this._yPerc != 1 && this._yPerc != 0) {
                    page = Math.floor(contentYLoc / this._pageSizeV);
                    delta = contentYLoc - page * this._pageSizeV;
                    if(delta > this._pageSizeV / 2)
                        page++;
                    contentYLoc = page * this._pageSizeV;
                    if(contentYLoc > this._contentHeight - this._maskHeight) {
                        contentYLoc = this._contentHeight - this._maskHeight;
                        this._yPerc = 1;
                    }
                    else
                        this._yPerc = contentYLoc / (this._contentHeight - this._maskHeight);
                }

                if(this._hScroll && this._xPerc != 1 && this._xPerc != 0) {
                    page = Math.floor(contentXLoc / this._pageSizeH);
                    delta = contentXLoc - page * this._pageSizeH;
                    if(delta > this._pageSizeH / 2)
                        page++;
                    contentXLoc = page * this._pageSizeH;
                    if(contentXLoc > this._contentWidth - this._maskWidth) {
                        contentXLoc = this._contentWidth - this._maskWidth;
                        this._xPerc = 1;
                    }
                    else
                        this._xPerc = contentXLoc / (this._contentWidth - this._maskWidth);
                }
            }
            else if(this._snapToItem) {
                var pt: Point = this._owner.getSnappingPosition(contentXLoc,contentYLoc,ScrollPane.sHelperPoint);
                if(this._xPerc != 1 && pt.x != contentXLoc) {
                    this._xPerc = pt.x / (this._contentWidth - this._maskWidth);
                    if(this._xPerc > 1)
                        this._xPerc = 1;
                    contentXLoc = this._xPerc * (this._contentWidth - this._maskWidth);
                }
                if(this._yPerc != 1 && pt.y != contentYLoc) {
                    this._yPerc = pt.y / (this._contentHeight - this._maskHeight);
                    if(this._yPerc > 1)
                        this._yPerc = 1;
                    contentYLoc = this._yPerc * (this._contentHeight - this._maskHeight);
                }
            }
            
            this.refresh2(contentXLoc,contentYLoc);
            Events.dispatch(Events.SCROLL, this._container);
            if(this._needRefresh) //user change scroll pos in on scroll
            {
                this._needRefresh = false;
                Laya.timer.clear(this, this.refresh);

                if(this._hScroll)
                    contentXLoc = this._xPerc * (this._contentWidth - this._maskWidth);
                if(this._vScroll)
                    contentYLoc = this._yPerc * (this._contentHeight - this._maskHeight);
                this.refresh2(contentXLoc,contentYLoc);
            }

            this._aniFlag = true;
        }
        
        private function refresh2(contentXLoc:Number, contentYLoc:Number):void {
            contentXLoc = Math.floor(contentXLoc);
            contentYLoc = Math.floor(contentYLoc);

            if(this._aniFlag && !this._isMouseMoved) {
                var toX: Number = this._maskContentHolder.x;
                var toY: Number = this._maskContentHolder.y;
                if(this._vScroll) {
                    toY = -contentYLoc;
                }
                else {
                    if(this._maskContentHolder.y != 0)
                        this._maskContentHolder.y = 0;
                }
                if(this._hScroll) {
                    toX = -contentXLoc;
                }
                else {
                    if(this._maskContentHolder.x != 0)
                        this._maskContentHolder.x = 0;
                }

                if(toX != this._maskContentHolder.x || toY != this._maskContentHolder.y) {
                    this.killTweens();

                    this._maskHolder.mouseEnabled = false;
                    this._tweening = 1;
                    this._tweener = Tween.to(this._maskContentHolder,
                        { x: toX, y: toY },
                        500,
                        ScrollPane._easeTypeFunc,
                        Handler.create(this, this.__tweenComplete));
                    this._tweener.update = Handler.create(this, this.__tweenUpdate, null, false);
                }
            }
            else {
                this.killTweens();
                

                //如果在拖动的过程中Refresh，这里要进行处理，保证拖动继续正常进行
                if(this._isMouseMoved) {
                    this._xOffset += this._maskContentHolder.x - (-contentXLoc);
                    this._yOffset += this._maskContentHolder.y - (-contentYLoc);
                }

                this._maskContentHolder.pos(-contentXLoc,-contentYLoc); 
				
                //如果在拖动的过程中Refresh，这里要进行处理，保证手指离开是滚动正常进行
                if(this._isMouseMoved) {
                    this._y1 = this._y2 = this._maskContentHolder.y;
                    this._x1 = this._x2 = this._maskContentHolder.x;
                }

                if(this._vtScrollBar)
                    this._vtScrollBar.scrollPerc = this._yPerc;
                if(this._hzScrollBar)
                    this._hzScrollBar.scrollPerc = this._xPerc;
            }
        }
        
        private function killTweens(): void {
            if(this._tweening == 1) {
                this._tweening = 0;
                this._tweener.clear();
				this._maskHolder.mouseEnabled = true;
				this.onScrollEnd();
            }
            else if(this._tweening == 2) {
                this._tweening = 0;
                this._tweener.clear();
                this._tweenHelper.value = 1;
                this.__tweenUpdate2();
				this._maskHolder.mouseEnabled = true;
				this.onScrollEnd();
            }           
        }

        private function calcYPerc(): Number {
            if (!this._vScroll)
                return 0;

            var diff: Number = this._contentHeight - this._maskHeight;
            var my: Number = this._maskContentHolder.y;

            var currY: Number;
            if(my > 0)
                currY = 0;
            else if(-my > diff)
                currY = diff;
            else
                currY = -my;

            return currY / diff;
        }

        private function calcXPerc(): Number {
            if (!this._hScroll)
                return 0;

            var diff: Number = this._contentWidth - this._maskWidth;

            var currX: Number;
            var mx: Number = this._maskContentHolder.x;
            if (mx > 0)
                currX = 0;
            else if (-mx > diff)
                currX = diff;
            else
                currX = -mx;

            return currX / diff;
        }

        private function onScrolling(): void {
            if (this._vtScrollBar) {
                this._vtScrollBar.scrollPerc = this.calcYPerc();
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(true);
            }
            if (this._hzScrollBar) {
                this._hzScrollBar.scrollPerc = this.calcXPerc();
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(true);
            }
        }

        private function onScrollEnd(): void {
            if (this._vtScrollBar) {
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(false);
            }
            if (this._hzScrollBar) {
                if (this._scrollBarDisplayAuto)
                    this.showScrollBar(false);
            }
        }

        private static var sHelperPoint: Point = new Point();
        private function __mouseDown(): void {
            if (!this._touchEffect)
                return;
                
            this.killTweens();
            
            this._owner.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, ScrollPane.sHelperPoint);

            this._x1 = this._x2 = this._maskContentHolder.x;
            this._y1 = this._y2 = this._maskContentHolder.y;
            
            this._xOffset = ScrollPane.sHelperPoint.x - this._maskContentHolder.x;
            this._yOffset = ScrollPane.sHelperPoint.y - this._maskContentHolder.y;

            this._time1 = this._time2 = Laya.timer.currTimer;
            this._holdAreaPoint.x = ScrollPane.sHelperPoint.x;
            this._holdAreaPoint.y = ScrollPane.sHelperPoint.y;
            this._isHoldAreaDone = false;
            this._isMouseMoved = false;

            this._owner.displayObject.stage.on(Event.MOUSE_MOVE, this, this.__mouseMove);
            this._owner.displayObject.stage.on(Event.MOUSE_UP, this, this.__mouseUp);
            this._owner.displayObject.stage.on(Event.CLICK, this, this.__click);
        }

        private function __mouseMove(): void {
            var sensitivity: Number = fairygui.UIConfig.touchScrollSensitivity;
                
            var diff: Number;
            var sv: Boolean, sh: Boolean, st: Boolean;

            var pt:laya.maths.Point = this._owner.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, ScrollPane.sHelperPoint);

            if (this._scrollType == ScrollType.Vertical) {
                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._holdAreaPoint.y - pt.y);
                    if(diff < sensitivity)
                        return;
                }

                sv = true;
            }
            else if (this._scrollType == ScrollType.Horizontal) {
                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._holdAreaPoint.x - pt.x);
                    if(diff < sensitivity)
                        return;
                }

                sh = true;
            }
            else {
                if (!this._isHoldAreaDone) {
                    diff = Math.abs(this._holdAreaPoint.y - pt.y);
                    if(diff < sensitivity) {
                        diff = Math.abs(this._holdAreaPoint.x - pt.x);
                        if(diff < sensitivity)
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
                        this._maskContentHolder.y = 0;
                    else
                        this._maskContentHolder.y = Math.floor(y * 0.5);
                }
                else if (y < -this._yOverlap) {
                    if (!this._bouncebackEffect || this._inertiaDisabled)
                        this._maskContentHolder.y = -Math.floor(this._yOverlap);
                    else
                        this._maskContentHolder.y = Math.floor((y - this._yOverlap) * 0.5);
                }
                else {
                    this._maskContentHolder.y = y;
                }

                if (st) {
                    this._y2 = this._y1;
                    this._y1 = this._maskContentHolder.y;
                }

                this._yPerc = this.calcYPerc();
            }

            if (sh) {
                var x: Number = Math.floor(pt.x - this._xOffset);
                if (x > 0) {
                    if (!this._bouncebackEffect || this._inertiaDisabled)
                        this._maskContentHolder.x = 0;
                    else
                        this._maskContentHolder.x = Math.floor(x * 0.5);
                }
                else if (x < 0 - this._xOverlap || this._inertiaDisabled) {
                    if (!this._bouncebackEffect)
                        this._maskContentHolder.x = -Math.floor(this._xOverlap);
                    else
                        this._maskContentHolder.x = Math.floor((x - this._xOverlap) * 0.5);
                }
                else {
                    this._maskContentHolder.x = x;
                }

                if (st) {
                    this._x2 = this._x1;
                    this._x1 = this._maskContentHolder.x;
                }

                this._xPerc = this.calcXPerc();
            }

            this._maskHolder.mouseEnabled = false;
            this._isHoldAreaDone = true;
            this._isMouseMoved = true;
            this.onScrolling();
            Events.dispatch(Events.SCROLL, this._container);
        }

        private function __mouseUp(): void {
            this._owner.displayObject.stage.off(Event.MOUSE_MOVE, this, this.__mouseMove);
            this._owner.displayObject.stage.off(Event.MOUSE_UP, this, this.__mouseUp);
            this._owner.displayObject.stage.off(Event.CLICK, this, this.__click);
            
            if (!this._touchEffect) {
                this._isMouseMoved = false;
                return;
            }

            if (!this._isMouseMoved)
                return;
			
			if(this._inertiaDisabled)
				return;

            var time: Number = (Laya.timer.currTimer - this._time2) / 1000;
            if (time == 0)
                time = 0.001;
            var yVelocity: Number = (this._maskContentHolder.y - this._y2) / time;
            var xVelocity: Number = (this._maskContentHolder.x - this._x2) / time;
            var duration: Number = 0.3;

            this._tweenHelper.start.x = this._maskContentHolder.x;
            this._tweenHelper.start.y = this._maskContentHolder.y;

            var change1: Point = this._tweenHelper.change1;
            var change2: Point = this._tweenHelper.change2;
            var endX: Number = 0;
            var endY: Number = 0;
            var page: Number = 0;
            var delta: Number = 0;
            
            if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Horizontal) {
                change1.x = TweenHelper.calculateChange(xVelocity, duration);
                change2.x = 0;
                endX = this._maskContentHolder.x + change1.x;
                
                if(this._pageMode) {
                    page = Math.floor(-endX / this._pageSizeH);
                    delta = -endX - page * this._pageSizeH;
                    //页面吸附策略
                    if(change1.x > this._pageSizeH) {
                        //如果翻页数量超过1，则需要超过页面的一半，才能到下一页
                        if(delta >= this._pageSizeH / 2)
                            page++;
                    }
                    else if(endX < this._maskContentHolder.x) {
                        if(delta >= this._pageSizeH / 2)
                            page++;
                    }
                    endX = -page * this._pageSizeH;
                    if(endX < this._maskWidth - this._contentWidth)
                        endX = this._maskWidth - this._contentWidth;

                    change1.x = endX - this._maskContentHolder.x;
                }
            }
            else
                change1.x = change2.x = 0;

            if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical) {
                change1.y = TweenHelper.calculateChange(yVelocity, duration);
                change2.y = 0;
                endY = this._maskContentHolder.y + change1.y;
                
                if(this._pageMode) {
                    page = Math.floor(-endY / this._pageSizeV);
                    delta = -endY - page * this._pageSizeV;
                    //页面吸附策略
                    if(change1.y > this._pageSizeV) {
                        if(delta >= this._pageSizeV / 2)
                            page++;
                    }
                    else if(endY < this._maskContentHolder.y)
                    {
                        if(delta >= this._pageSizeV / 2)
                            page++;
                    }
                    endY = -page * this._pageSizeV;
                    if(endY < this._maskHeight - this._contentHeight)
                        endY = this._maskHeight - this._contentHeight;

                    change1.y = endY - this._maskContentHolder.y;
                }
            }
            else
                change1.y = change2.y = 0;

            if (this._snapToItem) {
                endX = -endX;
                endY = -endY;
                var pt: Point = this._owner.getSnappingPosition(endX,endY,ScrollPane.sHelperPoint);
                endX = -pt.x;
                endY = -pt.y;
                change1.x = endX - this._maskContentHolder.x;
                change1.y = endY - this._maskContentHolder.y;
            }
            
            if(this._bouncebackEffect) {
                if(endX > 0)
                    change2.x = 0 - this._maskContentHolder.x - change1.x;
                else if(endX < -this._xOverlap)
                    change2.x = -this._xOverlap - this._maskContentHolder.x - change1.x;

                if(endY > 0)
                    change2.y = 0 - this._maskContentHolder.y - change1.y;
                else if(endY < -this._yOverlap)
                    change2.y = -this._yOverlap - this._maskContentHolder.y - change1.y;
            }
            else {
                if(endX > 0)
                    change1.x = 0 - this._maskContentHolder.x;
                else if(endX < -this._xOverlap)
                    change1.x = -this._xOverlap - this._maskContentHolder.x;

                if(endY > 0)
                    change1.y = 0 - this._maskContentHolder.y;
                else if(endY < -this._yOverlap)
                    change1.y = -this._yOverlap - this._maskContentHolder.y;
            }

            this._tweenHelper.value = 0;
            this._tweenHelper.change1 = change1;
            this._tweenHelper.change2 = change2;
            
            this.killTweens();
            this._tweening = 2;
            this._tweener = Tween.to(this._tweenHelper, { value: 1 }, 
                duration * 1000, 
                ScrollPane._easeTypeFunc,
                Handler.create(this, this.__tweenComplete2));
            this._tweener.update = Handler.create(this, this.__tweenUpdate2, null, false);
        }
        
        private function __click(): void {
            this._isMouseMoved = false;
        }
        
        private function __mouseWheel(evt:Event):void {
			if(!this._mouseWheelEnabled)
				return;
			
		    var pt:Point = this._owner.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, ScrollPane.sHelperPoint);

			var delta:Number = evt["delta"];
			if(this._hScroll && !this._vScroll) {
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
            this._scrollBarVisible = val && this._maskWidth > 0 && this._maskHeight > 0;
            if (this._vtScrollBar)
                this._vtScrollBar.displayObject.visible = this._scrollBarVisible && !this._vScrollNone;
            if (this._hzScrollBar)
                this._hzScrollBar.displayObject.visible = this._scrollBarVisible && !this._hScrollNone;
        }

        public function __tweenUpdate(): void {
            this.onScrolling();
        }

        private function __tweenComplete(): void {
            this._tweening = 0;
            this._maskHolder.mouseEnabled = true;
            this.onScrollEnd();
        }

        public function __tweenUpdate2(): void {
            this._maskContentHolder.pos(Math.floor(this._tweenHelper.start.x + this._tweenHelper.change1.x * this._tweenHelper.value 
                + this._tweenHelper.change2.x * this._tweenHelper.value * this._tweenHelper.value),
                Math.floor(this._tweenHelper.start.y +this._tweenHelper.change1.y *this._tweenHelper.value 
                + this._tweenHelper.change2.y * this._tweenHelper.value * this._tweenHelper.value));

            if (this._scrollType == ScrollType.Vertical)
                this._yPerc = this.calcYPerc();
            else if (this._scrollType == ScrollType.Horizontal)
                this._xPerc = this.calcXPerc();
            else {
                this._yPerc = this.calcYPerc();
                this._xPerc = this.calcXPerc();
            }

            this.onScrolling();
            Events.dispatch(Events.SCROLL, this._container);
        }

        private function __tweenComplete2(): void {
            if(this._tweening==0)
                return;
                
            this._tweening = 0;
            if (this._scrollType == ScrollType.Vertical)
                this._yPerc = this.calcYPerc();
            else if (this._scrollType == ScrollType.Horizontal)
                this._xPerc = this.calcXPerc();
            else {
                this._yPerc = this.calcYPerc();
                this._xPerc = this.calcXPerc();
            }

            this._maskHolder.mouseEnabled = true;
            this.onScrollEnd();
            Events.dispatch(Events.SCROLL, this._container);
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