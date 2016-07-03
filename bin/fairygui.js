
(function(window,document,Laya){
	var __un=Laya.un,__uns=Laya.uns,__static=Laya.static,__class=Laya.class,__getset=Laya.getset,__newvec=Laya.__newvec;

	var Byte=laya.utils.Byte,ColorFilter=laya.filters.ColorFilter,Ease=laya.utils.Ease,Event=laya.events.Event;
	var EventDispatcher=laya.events.EventDispatcher,Graphics=laya.display.Graphics,HTMLDivElement=laya.html.dom.HTMLDivElement;
	var Handler=laya.utils.Handler,Input=laya.display.Input,Log=laya.utils.Log,Node=laya.display.Node,Point=laya.maths.Point;
	var Rectangle=laya.maths.Rectangle,Render=laya.renders.Render,Sound=laya.media.Sound,SoundChannel=laya.media.SoundChannel;
	var Sprite=laya.display.Sprite,Stage=laya.display.Stage,Text=laya.display.Text,Texture=laya.resource.Texture;
	var Tween=laya.utils.Tween,Utils=laya.utils.Utils;
	Laya.interface('fairygui.IAnimationGear');
	Laya.interface('fairygui.IColorGear');
	Laya.interface('fairygui.IUISource');
	//class fairygui.AutoSizeType
	var AutoSizeType=(function(){
		function AutoSizeType(){}
		__class(AutoSizeType,'fairygui.AutoSizeType');
		AutoSizeType.parse=function(value){
			switch (value){
				case "none":
					return 0;
				case "both":
					return 1;
				case "height":
					return 2;
				default :
					return 0;
				}
		}

		AutoSizeType.None=0;
		AutoSizeType.Both=1;
		AutoSizeType.Height=2;
		return AutoSizeType;
	})()


	//class fairygui.ButtonMode
	var ButtonMode=(function(){
		function ButtonMode(){}
		__class(ButtonMode,'fairygui.ButtonMode');
		ButtonMode.parse=function(value){
			switch (value){
				case "Common":
					return 0;
				case "Check":
					return 1;
				case "Radio":
					return 2;
				default :
					return 0;
				}
		}

		ButtonMode.Common=0;
		ButtonMode.Check=1;
		ButtonMode.Radio=2;
		return ButtonMode;
	})()


	//class fairygui.display.BitmapFont
	var BitmapFont1=(function(){
		function BitmapFont(){
			this.id=null;
			this.size=0;
			this.ttf=false;
			this.glyphs=null;
			this.resizable=false;
			this.glyphs={};
		}

		__class(BitmapFont,'fairygui.display.BitmapFont',null,'BitmapFont1');
		return BitmapFont;
	})()


	//class fairygui.display.BMGlyph
	var BMGlyph=(function(){
		function BMGlyph(){
			this.x=0;
			this.y=0;
			this.offsetX=0;
			this.offsetY=0;
			this.width=0;
			this.height=0;
			this.advance=0;
			this.lineHeight=0;
			this.channel=0;
			this.texture=null;
		}

		__class(BMGlyph,'fairygui.display.BMGlyph');
		return BMGlyph;
	})()


	//class fairygui.display.Frame
	var Frame=(function(){
		function Frame(){
			this.rect=null;
			this.addDelay=0;
			this.texture=null;
			this.rect=new Rectangle();
		}

		__class(Frame,'fairygui.display.Frame');
		return Frame;
	})()


	//class fairygui.display.PlayState
	var PlayState=(function(){
		function PlayState(){
			this.reachEnding=false;
			this.reversed=false;
			this.repeatedCount=0;
			this._curFrame=0;
			this._lastTime=0;
			this._curFrameDelay=0;
		}

		__class(PlayState,'fairygui.display.PlayState');
		var __proto=PlayState.prototype;
		__proto.update=function(mc){
			var t=Laya.timer.currTimer;
			var elapsed=t-this._lastTime;
			this._lastTime=t;
			this.reachEnding=false;
			this._curFrameDelay+=elapsed;
			var interval=mc.interval+mc.frames[this._curFrame].addDelay+((this._curFrame==0 && this.repeatedCount > 0)? mc.repeatDelay :0);
			if (this._curFrameDelay < interval)
				return;
			this._curFrameDelay=0;
			if (mc.swing){
				if(this.reversed){
					this._curFrame--;
					if(this._curFrame<0){
						this._curFrame=Math.min(1,mc.frameCount-1);
						this.repeatedCount++;
						this.reversed=!this.reversed;
					}
				}
				else{
					this._curFrame++;
					if (this._curFrame > mc.frameCount-1){
						this._curFrame=Math.max(0,mc.frameCount-2);
						this.repeatedCount++;
						this.reachEnding=true;
						this.reversed=!this.reversed;
					}
				}
			}
			else{
				this._curFrame++;
				if (this._curFrame > mc.frameCount-1){
					this._curFrame=0;
					this.repeatedCount++;
					this.reachEnding=true;
				}
			}
		}

		__proto.rewind=function(){
			this._curFrame=0;
			this._curFrameDelay=0;
			this.reversed=false;
			this.reachEnding=false;
		}

		__proto.reset=function(){
			this._curFrame=0;
			this._curFrameDelay=0;
			this.repeatedCount=0;
			this.reachEnding=false;
			this.reversed=false;
		}

		__proto.copy=function(src){
			this._curFrame=src._curFrame;
			this._curFrameDelay=src._curFrameDelay;
			this.repeatedCount=src.repeatedCount;
			this.reachEnding=src.reachEnding;
			this.reversed=src.reversed;
		}

		__getset(0,__proto,'currentFrame',function(){
			return this._curFrame;
			},function(value){
			this._curFrame=value;
			this._curFrameDelay=0;
		});

		return PlayState;
	})()


	//class fairygui.DragDropManager
	var DragDropManager=(function(){
		function DragDropManager(){
			this._agent=null;
			this._sourceData=null;
			this._agent=new GLoader();
			this._agent.draggable=true;
			this._agent.touchable=false;
			this._agent.setSize(100,100);
			this._agent.sortingOrder=1000000;
			this._agent.on("fui_drag_end",this,this.__dragEnd);
		}

		__class(DragDropManager,'fairygui.DragDropManager');
		var __proto=DragDropManager.prototype;
		__proto.startDrag=function(source,icon,sourceData,touchPointID){
			(touchPointID===void 0)&& (touchPointID=-1);
			if(this._agent.parent !=null)
				return;
			this._sourceData=sourceData;
			this._agent.url=icon;
			GRoot.inst.addChild(this._agent);
			var pt=source.localToGlobal();
			this._agent.setXY(pt.x,pt.y);
			this._agent.startDrag(touchPointID);
		}

		__proto.cancel=function(){
			if(this._agent.parent !=null){
				this._agent.stopDrag();
				GRoot.inst.removeChild(this._agent);
				this._sourceData=null;
			}
		}

		__proto.__dragEnd=function(evt){
			if(this._agent.parent==null)
				return;
			GRoot.inst.removeChild(this._agent);
			var sourceData=this._sourceData;
			this._sourceData=null;
			var obj=GObject.cast(evt.target);
			while(obj !=null){
				if(obj.displayObject.hasListener("fui_drop")){
					obj.requestFocus();
					obj.displayObject.event("fui_drop",[sourceData,Events.createEvent("fui_drop",obj.displayObject,evt)]);
					return;
				}
				obj=obj.parent;
			}
		}

		__getset(0,__proto,'dragAgent',function(){
			return this._agent;
		});

		__getset(0,__proto,'dragging',function(){
			return this._agent.parent !=null;
		});

		__getset(1,DragDropManager,'inst',function(){
			if(fairygui.DragDropManager._inst==null)
				fairygui.DragDropManager._inst=new DragDropManager();
			return fairygui.DragDropManager._inst;
		});

		DragDropManager._inst=null
		return DragDropManager;
	})()


	//class fairygui.Events
	var Events=(function(){
		function Events(){};
		__class(Events,'fairygui.Events');
		Events.createEvent=function(type,target,source){
			fairygui.Events.$event.setTo(type,target,source?source.target:target);
			if(source)
				fairygui.Events.$event.touchId=source.touchId;
			fairygui.Events.$event._stoped=false;
			return fairygui.Events.$event;
		}

		Events.dispatch=function(type,target,source){
			target.event(type,fairygui.Events.createEvent(type,target,source));
		}

		Events.STATE_CHANGED="fui_state_changed";
		Events.XY_CHANGED="fui_xy_changed";
		Events.SIZE_CHANGED="fui_size_changed";
		Events.SIZE_DELAY_CHANGE="fui_size_delay_change";
		Events.CLICK_ITEM="fui_click_item";
		Events.SCROLL="fui_scroll";
		Events.DROP="fui_drop";
		Events.FOCUS_CHANGED="fui_focus_changed";
		Events.DRAG_START="fui_drag_start";
		Events.DRAG_MOVE="fui_drag_move";
		Events.DRAG_END="fui_drag_end";
		__static(Events,
		['$event',function(){return this.$event=new Event();}
		]);
		return Events;
	})()


	//class fairygui.FillType
	var FillType=(function(){
		function FillType(){}
		__class(FillType,'fairygui.FillType');
		FillType.parse=function(value){
			switch (value){
				case "none":
					return 0;
				case "scale":
					return 3;
				case "scaleFree":
					return 4;
				default :
					return 0;
				}
		}

		FillType.None=0;
		FillType.Scale=3;
		FillType.ScaleFree=4;
		return FillType;
	})()


	//class fairygui.FlipType
	var FlipType=(function(){
		function FlipType(){}
		__class(FlipType,'fairygui.FlipType');
		FlipType.parse=function(value){
			switch (value){
				case "hz":
					return 1;
				case "vt":
					return 2;
				case "both":
					return 3;
				default :
					return 0;
				}
		}

		FlipType.None=0;
		FlipType.Horizontal=1;
		FlipType.Vertical=2;
		FlipType.Both=3;
		return FlipType;
	})()


	//class fairygui.GObject
	var GObject=(function(){
		function GObject(){
			this.data=null;
			this._x=0;
			this._y=0;
			this._width=0;
			this._height=0;
			this._alpha=1;
			this._rotation=0;
			this._visible=true;
			this._touchable=true;
			this._grayed=false;
			this._draggable=false;
			this._scaleX=1;
			this._scaleY=1;
			this._skewX=0;
			this._skewY=0;
			this._pivotX=0;
			this._pivotY=0;
			this._pivotAsAnchor=false;
			this._pivotOffsetX=0;
			this._pivotOffsetY=0;
			this._sortingOrder=0;
			this._internalVisible=1;
			this._focusable=false;
			this._tooltips=null;
			this._relations=null;
			this._group=null;
			this._gearDisplay=null;
			this._gearXY=null;
			this._gearSize=null;
			this._gearLook=null;
			this._dragBounds=null;
			this._displayObject=null;
			this._yOffset=0;
			this._sizeImplType=0;
			this._parent=null;
			this._rawWidth=0;
			this._rawHeight=0;
			this._sourceWidth=0;
			this._sourceHeight=0;
			this._initWidth=0;
			this._initHeight=0;
			this._id=null;
			this._name=null;
			this._packageItem=null;
			this._underConstruct=false;
			this._constructingData=null;
			this._gearLocked=false;
			this._touchDownPoint=null;
			;
			this._id=""+fairygui.GObject._gInstanceCounter++;
			this._name="";
			this.createDisplayObject();
			this._relations=new Relations(this);
			this._gearDisplay=new GearDisplay(this);
			this._gearXY=new GearXY(this);
			this._gearSize=new GearSize(this);
			this._gearLook=new GearLook(this);
		}

		__class(GObject,'fairygui.GObject');
		var __proto=GObject.prototype;
		__proto.setXY=function(xv,yv){
			if(this._x !=xv || this._y !=yv){
				var dx=xv-this._x;
				var dy=yv-this._y;
				this._x=xv;
				this._y=yv;
				this.handleXYChanged();
				if((this instanceof fairygui.GGroup ))
					(this).moveChildren(dx,dy);
				if(this._gearXY.controller)
					this._gearXY.updateState();
				if(this._parent && !((this._parent instanceof fairygui.GList ))){
					this._parent.setBoundsChangedFlag();
					this.displayObject.event("fui_xy_changed");
				}
			}
		}

		__proto.center=function(restraint){
			(restraint===void 0)&& (restraint=false);
			var r;
			if(this._parent !=null)
				r=this.parent;
			else
			r=this.root;
			this.setXY((r.width-this.width)/ 2,(r.height-this.height)/ 2);
			if(restraint){
				this.addRelation(r,3);
				this.addRelation(r,10);
			}
		}

		__proto.setSize=function(wv,hv,ignorePivot){
			(ignorePivot===void 0)&& (ignorePivot=false);
			if(this._rawWidth !=wv || this._rawHeight !=hv){
				this._rawWidth=wv;
				this._rawHeight=hv;
				if(wv < 0)
					wv=0;
				if(hv < 0)
					hv=0;
				var dWidth=wv-this._width;
				var dHeight=hv-this._height;
				this._width=wv;
				this._height=hv;
				this.handleSizeChanged();
				if(this._pivotX !=0 || this._pivotY !=0){
					if(!this._pivotAsAnchor){
						if(!ignorePivot)
							this.setXY(this.x-this._pivotX *dWidth,this.y-this._pivotY *dHeight);
						this.updatePivotOffset();
					}
					else
					this.applyPivot();
				}
				if(this._gearSize.controller)
					this._gearSize.updateState();
				if(this._parent){
					this._relations.onOwnerSizeChanged(dWidth,dHeight);
					this._parent.setBoundsChangedFlag();
				}
				this.displayObject.event("fui_size_changed");
			}
		}

		__proto.ensureSizeCorrect=function(){}
		__proto.setScale=function(sx,sy){
			if(this._scaleX !=sx || this._scaleY !=sy){
				this._scaleX=sx;
				this._scaleY=sy;
				this.handleScaleChanged();
				this.applyPivot();
				if(this._gearSize.controller)
					this._gearSize.updateState();
			}
		}

		__proto.setSkew=function(sx,sy){
			if(this._skewX !=sx || this._skewY !=sy){
				this._skewX=sx;
				this._skewY=sy;
				if(this._displayObject!=null){
					this._displayObject.skew(sx,sy);
					this.applyPivot();
				}
			}
		}

		__proto.setPivot=function(xv,yv,asAnchor){
			(yv===void 0)&& (yv=0);
			(asAnchor===void 0)&& (asAnchor=false);
			if(this._pivotX !=xv || this._pivotY !=yv || this._pivotAsAnchor!=asAnchor){
				this._pivotX=xv;
				this._pivotY=yv;
				this._pivotAsAnchor=asAnchor;
				this.updatePivotOffset();
				this.handleXYChanged();
			}
		}

		__proto.internalSetPivot=function(xv,yv,asAnchor){
			this._pivotX=xv;
			this._pivotY=yv;
			this._pivotAsAnchor=asAnchor;
			if(this._pivotAsAnchor)
				this.handleXYChanged();
		}

		__proto.updatePivotOffset=function(){
			if(this._displayObject!=null){
				if(this._displayObject.transform && (this._pivotX!=0 || this._pivotY!=0)){
					if(this._sizeImplType==0){
						fairygui.GObject.sHelperPoint.x=this._pivotX*this._width;
						fairygui.GObject.sHelperPoint.y=this._pivotY*this._height;
					}
					else {
						fairygui.GObject.sHelperPoint.x=this._pivotX*this._sourceWidth;
						fairygui.GObject.sHelperPoint.y=this._pivotY*this._sourceHeight;
					};
					var pt=this._displayObject.transform.transformPoint(fairygui.GObject.sHelperPoint);
					this._pivotOffsetX=this._pivotX*this._width-pt.x;
					this._pivotOffsetY=this._pivotY*this._height-pt.y;
				}
				else{
					this._pivotOffsetX=0;
					this._pivotOffsetY=0;
				}
			}
		}

		__proto.applyPivot=function(){
			if(this._pivotX !=0 || this._pivotY !=0){
				this.updatePivotOffset();
				this.handleXYChanged();
			}
		}

		__proto.updateAlpha=function(){
			if(this._displayObject)
				this._displayObject.alpha=this._alpha;
			if(this._gearLook.controller)
				this._gearLook.updateState();
		}

		__proto.requestFocus=function(){
			var p=this;
			while (p && !p._focusable)
			p=p.parent;
			if (p !=null)
				this.root.focus=p;
		}

		__proto.addRelation=function(target,relationType,usePercent){
			(usePercent===void 0)&& (usePercent=false);
			this._relations.add(target,relationType,usePercent);
		}

		__proto.removeRelation=function(target,relationType){
			(relationType===void 0)&& (relationType=0);
			this._relations.remove(target,relationType);
		}

		__proto.removeFromParent=function(){
			if (this._parent)
				this._parent.removeChild(this);
		}

		__proto.dispose=function(){
			this.removeFromParent();
			this._relations.dispose();
		}

		__proto.onClick=function(thisObj,listener,args){
			this.on("click",thisObj,listener,args);
		}

		__proto.offClick=function(thisObj,listener){
			this.off("click",thisObj,listener);
		}

		__proto.hasClickListener=function(){
			return this._displayObject.hasListener("click");
		}

		__proto.on=function(type,thisObject,listener,args){
			this._displayObject.on(type,thisObject,listener,args);
		}

		__proto.off=function(type,thisObject,listener){
			this._displayObject.off(type,thisObject,listener);
		}

		__proto.startDrag=function(touchPointID){
			(touchPointID===void 0)&& (touchPointID=-1);
			if (this._displayObject.stage==null)
				return;
			this.dragBegin();
		}

		__proto.stopDrag=function(){
			this.dragEnd();
		}

		__proto.localToGlobal=function(ax,ay,resultPoint){
			(ax===void 0)&& (ax=0);
			(ay===void 0)&& (ay=0);
			if(!resultPoint){
				resultPoint=fairygui.GObject.sHelperPoint;
				resultPoint.x=ax;
				resultPoint.y=ay;
				return this._displayObject.localToGlobal(resultPoint,true);
			}
			else{
				resultPoint.x=ax;
				resultPoint.y=ay;
				return this._displayObject.localToGlobal(resultPoint,false);
			}
		}

		__proto.globalToLocal=function(ax,ay,resultPoint){
			(ax===void 0)&& (ax=0);
			(ay===void 0)&& (ay=0);
			if(!resultPoint){
				resultPoint=fairygui.GObject.sHelperPoint;
				resultPoint.x=ax;
				resultPoint.y=ay;
				return this._displayObject.globalToLocal(resultPoint,true);
			}
			else{
				resultPoint.x=ax;
				resultPoint.y=ay;
				return this._displayObject.globalToLocal(resultPoint,false);
			}
		}

		__proto.localToGlobalRect=function(ax,ay,aWidth,aHeight,resultRect){
			(ax===void 0)&& (ax=0);
			(ay===void 0)&& (ay=0);
			(aWidth===void 0)&& (aWidth=0);
			(aHeight===void 0)&& (aHeight=0);
			if(resultRect==null)
				resultRect=new Rectangle();
			var pt=this.localToGlobal(ax,ay);
			resultRect.x=pt.x;
			resultRect.y=pt.y;
			pt=this.localToGlobal(ax+aWidth,ay+aHeight);
			resultRect.width=pt.x-resultRect.x;
			resultRect.height=pt.y-resultRect.y;
			return resultRect;
		}

		__proto.globalToLocalRect=function(ax,ay,aWidth,aHeight,resultRect){
			(ax===void 0)&& (ax=0);
			(ay===void 0)&& (ay=0);
			(aWidth===void 0)&& (aWidth=0);
			(aHeight===void 0)&& (aHeight=0);
			if(resultRect==null)
				resultRect=new Rectangle();
			var pt=this.globalToLocal(ax,ay);
			resultRect.x=pt.x;
			resultRect.y=pt.y;
			pt=this.globalToLocal(ax+aWidth,ay+aHeight);
			resultRect.width=pt.x-resultRect.x;
			resultRect.height=pt.y-resultRect.y;
			return resultRect;
		}

		__proto.handleControllerChanged=function(c){
			if(this._gearDisplay.controller==c)
				this._gearDisplay.apply();
			if(this._gearXY.controller==c)
				this._gearXY.apply();
			if(this._gearSize.controller==c)
				this._gearSize.apply();
			if(this._gearLook.controller==c)
				this._gearLook.apply();
		}

		__proto.createDisplayObject=function(){
			this._displayObject=new Sprite();
			this._displayObject["$owner"]=this;
		}

		__proto.handleXYChanged=function(){
			if(this._pivotAsAnchor)
				this._displayObject.pos(Math.floor(this._x-this._pivotX*this._width)+this._pivotOffsetX,
			Math.floor(this._y-this._pivotY*this._height+this._yOffset)+this._pivotOffsetY);
			else
			this._displayObject.pos(Math.floor(this._x)+this._pivotOffsetX,
			Math.floor(this._y+this._yOffset)+this._pivotOffsetY);
		}

		__proto.handleSizeChanged=function(){
			if(this._displayObject!=null){
				if(this._sizeImplType==0 || this._sourceWidth==0 || this._sourceHeight==0)
					this._displayObject.size(this._width,this._height);
				else
				this._displayObject.scale(this._width/this._sourceWidth*this._scaleX,
				this._height/this._sourceHeight*this._scaleY);
			}
		}

		__proto.handleScaleChanged=function(){
			if(this._displayObject!=null){
				if(this._sizeImplType==0 || this._sourceWidth==0 || this._sourceHeight==0)
					this._displayObject.scale(this._scaleX,this._scaleY);
				else
				this._displayObject.scale(this._width/this._sourceWidth*this._scaleX,
				this._height/this._sourceHeight*this._scaleY);
			}
		}

		__proto.handleGrayChanged=function(){
			if(this._displayObject){
				if(this._grayed)
					this._displayObject.filters=[new ColorFilter(ToolSet.GRAY_FILTERS_MATRIX)];
				else
				this._displayObject.filters=null;
			}
		}

		__proto.constructFromResource=function(pkgItem){
			this._packageItem=pkgItem;
		}

		__proto.setup_beforeAdd=function(xml){
			var str;
			var arr;
			this._id=xml.getAttribute("id");
			this._name=xml.getAttribute("name");
			str=xml.getAttribute("xy");
			arr=str.split(",");
			this.setXY(parseInt(arr[0]),parseInt(arr[1]));
			str=xml.getAttribute("size");
			if (str){
				arr=str.split(",");
				this._initWidth=parseInt(arr[0]);
				this._initHeight=parseInt(arr[1]);
				this.setSize(this._initWidth,this._initHeight,true);
			}
			str=xml.getAttribute("scale");
			if(str){
				arr=str.split(",");
				this.setScale(parseFloat(arr[0]),parseFloat(arr[1]));
			}
			str=xml.getAttribute("skew");
			if(str){
				arr=str.split(",");
				this.setSkew(parseFloat(arr[0]),parseFloat(arr[1]));
			}
			str=xml.getAttribute("rotation");
			if (str)
				this.rotation=parseInt(str);
			str=xml.getAttribute("pivot");
			if (str){
				arr=str.split(",");
				str=xml.getAttribute("anchor");
				this.setPivot(parseFloat(arr[0]),parseFloat(arr[1]),str=="true");
			}
			else
			this.setPivot(0,0,false);
			str=xml.getAttribute("alpha");
			if (str)
				this.alpha=parseFloat(str);
			if(xml.getAttribute("touchable")=="false")
				this.touchable=false;
			if(xml.getAttribute("visible")=="false")
				this.visible=false;
			if(xml.getAttribute("grayed")=="true")
				this.grayed=true;
			this.tooltips=xml.getAttribute("tooltips");
		}

		__proto.setup_afterAdd=function(xml){
			var cxml;
			var str=xml.getAttribute("group");
			if (str)
				this._group=this._parent.getChildById(str);
			var col=xml.childNodes;
			var length1=col.length;
			for (var i1=0;i1 < length1;i1++){
				cxml=col[i1];
				if (cxml.nodeName=="gearDisplay"){
					this._gearDisplay.setup(cxml);
				}
				else if (cxml.nodeName=="gearXY"){
					this._gearXY.setup(cxml);
				}
				else if (cxml.nodeName=="gearSize"){
					this._gearSize.setup(cxml);
				}
				else if (cxml.nodeName=="gearLook"){
					this._gearLook.setup(cxml);
				}
			}
		}

		__proto.initDrag=function(){
			if (this._draggable)
				this.on("mousedown",this,this.__begin);
			else
			this.off("mousedown",this,this.__begin);
		}

		__proto.dragBegin=function(){
			if (fairygui.GObject.sDragging !=null)
				fairygui.GObject.sDragging.stopDrag();
			fairygui.GObject.sGlobalDragStart.x=Laya.stage.mouseX;
			fairygui.GObject.sGlobalDragStart.y=Laya.stage.mouseY;
			this.localToGlobalRect(0,0,this.width,this.height,fairygui.GObject.sGlobalRect);
			fairygui.GObject.sDragging=this;
			Laya.stage.on("mousemove",this,this.__moving2);
			Laya.stage.on("mouseup",this,this.__end2);
		}

		__proto.dragEnd=function(){
			if (fairygui.GObject.sDragging==this){
				Laya.stage.off("mousemove",this,this.__moving2);
				Laya.stage.off("mouseup",this,this.__end2);
				fairygui.GObject.sDragging=null;
			}
			fairygui.GObject.sDraggingQuery=false;
		}

		__proto.reset=function(){
			Laya.stage.off("mousemove",this,this.__moving);
			Laya.stage.off("mouseup",this,this.__end);
		}

		__proto.__begin=function(){
			if(this._touchDownPoint==null)
				this._touchDownPoint=new Point();
			this._touchDownPoint.x=Laya.stage.mouseX;
			this._touchDownPoint.y=Laya.stage.mouseY;
			Laya.stage.on("mousemove",this,this.__moving);
			Laya.stage.on("mouseup",this,this.__end);
		}

		__proto.__end=function(){
			this.reset();
		}

		__proto.__moving=function(evt){
			var sensitivity=UIConfig1.touchDragSensitivity;
			if(this._touchDownPoint !=null
				&& Math.abs(this._touchDownPoint.x-Laya.stage.mouseX)< sensitivity
			&& Math.abs(this._touchDownPoint.y-Laya.stage.mouseY)< sensitivity)
			return;
			this.reset();
			fairygui.GObject.sDraggingQuery=true;
			Events.dispatch("fui_drag_start",this._displayObject,evt);
			if (fairygui.GObject.sDraggingQuery)
				this.dragBegin();
		}

		__proto.__moving2=function(evt){
			var xx=Laya.stage.mouseX-fairygui.GObject.sGlobalDragStart.x+fairygui.GObject.sGlobalRect.x;
			var yy=Laya.stage.mouseY-fairygui.GObject.sGlobalDragStart.y+fairygui.GObject.sGlobalRect.y;
			if(this._dragBounds !=null){
				var rect=GRoot.inst.localToGlobalRect(this._dragBounds.x,this._dragBounds.y,
				this._dragBounds.width,this._dragBounds.height,fairygui.GObject.sDragHelperRect);
				if(xx < rect.x)
					xx=rect.x;
				else if(xx+fairygui.GObject.sGlobalRect.width > rect.right){
					xx=rect.right-fairygui.GObject.sGlobalRect.width;
					if(xx < rect.x)
						xx=rect.x;
				}
				if(yy < rect.y)
					yy=rect.y;
				else if(yy+fairygui.GObject.sGlobalRect.height > rect.bottom){
					yy=rect.bottom-fairygui.GObject.sGlobalRect.height;
					if(yy < rect.y)
						yy=rect.y;
				}
			};
			var pt=this.parent.globalToLocal(xx,yy,fairygui.GObject.sHelperPoint);
			this.setXY(Math.round(pt.x),Math.round(pt.y));
			Events.dispatch("fui_drag_move",this._displayObject,evt);
		}

		__proto.__end2=function(evt){
			if (fairygui.GObject.sDragging==this){
				this.stopDrag();
				Events.dispatch("fui_drag_end",this._displayObject,evt);
			}
		}

		__getset(0,__proto,'id',function(){
			return this._id;
		});

		__getset(0,__proto,'name',function(){
			return this._name;
			},function(value){
			this._name=value;
		});

		__getset(0,__proto,'parent',function(){
			return this._parent;
			},function(val){
			this._parent=val;
		});

		__getset(0,__proto,'asLabel',function(){
			return this;
		});

		__getset(0,__proto,'asTextField',function(){
			return this;
		});

		__getset(0,__proto,'gearLook',function(){
			return this._gearLook;
		});

		__getset(0,__proto,'initHeight',function(){
			return this._initHeight;
		});

		__getset(0,__proto,'y',function(){
			return this._y;
			},function(value){
			this.setXY(this._x,value);
		});

		__getset(0,__proto,'asButton',function(){
			return this;
		});

		__getset(0,__proto,'x',function(){
			return this._x;
			},function(value){
			this.setXY(value,this._y);
		});

		__getset(0,__proto,'gearSize',function(){
			return this._gearSize;
		});

		__getset(0,__proto,'skewX',function(){
			return this._skewX;
			},function(value){
			this.setScale(value,this._skewY);
		});

		__getset(0,__proto,'width',function(){
			this.ensureSizeCorrect();
			if(this._relations.sizeDirty)
				this._relations.ensureRelationsSizeCorrect();
			return this._width;
			},function(value){
			this.setSize(value,this._rawHeight);
		});

		__getset(0,__proto,'height',function(){
			this.ensureSizeCorrect();
			if(this._relations.sizeDirty)
				this._relations.ensureRelationsSizeCorrect();
			return this._height;
			},function(value){
			this.setSize(this._rawWidth,value);
		});

		__getset(0,__proto,'sourceHeight',function(){
			return this._sourceHeight;
		});

		__getset(0,__proto,'asComboBox',function(){
			return this;
		});

		__getset(0,__proto,'scaleX',function(){
			return this._scaleX;
			},function(value){
			this.setScale(value,this._scaleY);
		});

		__getset(0,__proto,'sourceWidth',function(){
			return this._sourceWidth;
		});

		__getset(0,__proto,'tooltips',function(){
			return this._tooltips;
			},function(value){
			this._tooltips=value;
		});

		__getset(0,__proto,'initWidth',function(){
			return this._initWidth;
		});

		__getset(0,__proto,'actualWidth',function(){
			return this.width *this._scaleX;
		});

		__getset(0,__proto,'actualHeight',function(){
			return this.height *this._scaleY;
		});

		__getset(0,__proto,'rotation',function(){
			return this._rotation;
			},function(value){
			if(this._rotation !=value){
				this._rotation=value;
				if(this._displayObject!=null){
					this._displayObject.rotation=this.normalizeRotation;
					this.applyPivot();
				}
				if(this._gearLook.controller)
					this._gearLook.updateState();
			}
		});

		__getset(0,__proto,'scaleY',function(){
			return this._scaleY;
			},function(value){
			this.setScale(this._scaleX,value);
		});

		__getset(0,__proto,'skewY',function(){
			return this._skewY;
			},function(value){
			this.setSkew(this._skewX,value);
		});

		__getset(0,__proto,'pivotX',function(){
			return this._pivotX;
			},function(value){
			this.setPivot(value,this._pivotY);
		});

		__getset(0,__proto,'normalizeRotation',function(){
			var rot=this._rotation % 360;
			if(rot > 180)
				rot=rot-360;
			else if(rot <-180)
			rot=360+rot;
			return rot;
		});

		__getset(0,__proto,'pivotY',function(){
			return this._pivotY;
			},function(value){
			this.setPivot(this._pivotX,value);
		});

		__getset(0,__proto,'touchable',function(){
			return this._touchable;
			},function(value){
			this._touchable=value;
			if(((this instanceof fairygui.GImage ))|| ((this instanceof fairygui.GMovieClip ))
				|| ((this instanceof fairygui.GTextField ))&& !((this instanceof fairygui.GTextInput ))&& !((this instanceof fairygui.GRichTextField )))
			return;
			if(this._displayObject !=null)
				this._displayObject.mouseEnabled=this._touchable;
		});

		__getset(0,__proto,'grayed',function(){
			return this._grayed;
			},function(value){
			if(this._grayed !=value){
				this._grayed=value;
				this.handleGrayChanged();
			}
		});

		__getset(0,__proto,'enabled',function(){
			return !this._grayed && this._touchable;
			},function(value){
			this.grayed=!value;
			this.touchable=value;
		});

		__getset(0,__proto,'alpha',function(){
			return this._alpha;
			},function(value){
			if(this._alpha!=value){
				this._alpha=value;
				this.updateAlpha();
			}
		});

		__getset(0,__proto,'visible',function(){
			return this._visible;
			},function(value){
			if (this._visible !=value){
				this._visible=value;
				if (this._displayObject)
					this._displayObject.visible=this._visible;
				if (this._parent)
					this._parent.childStateChanged(this);
			}
		});

		__getset(0,__proto,'asTextInput',function(){
			return this;
		});

		__getset(0,__proto,'internalVisible',function(){
			return this._internalVisible;
			},function(value){
			if(value < 0)
				value=0;
			var oldValue=this._internalVisible > 0;
			var newValue=value > 0;
			this._internalVisible=value;
			if(oldValue !=newValue){
				if(this._parent)
					this._parent.childStateChanged(this);
			}
		});

		__getset(0,__proto,'finalVisible',function(){
			return this._visible && this._internalVisible>0 && (!this._group || this._group.finalVisible);
		});

		__getset(0,__proto,'text',function(){
			return null;
			},function(value){
		});

		__getset(0,__proto,'resourceURL',function(){
			if (this._packageItem !=null)
				return "ui://"+this._packageItem.owner.id+this._packageItem.id;
			else
			return null;
		});

		__getset(0,__proto,'sortingOrder',function(){
			return this._sortingOrder;
			},function(value){
			if (value < 0)
				value=0;
			if (this._sortingOrder !=value){
				var old=this._sortingOrder;
				this._sortingOrder=value;
				if (this._parent !=null)
					this._parent.childSortingOrderChanged(this,old,this._sortingOrder);
			}
		});

		__getset(0,__proto,'focusable',function(){
			return this._focusable;
			},function(value){
			this._focusable=value;
		});

		__getset(0,__proto,'focused',function(){
			return this.root.focus==this;
		});

		__getset(0,__proto,'dragBounds',function(){
			return this._dragBounds;
			},function(value){
			this._dragBounds=value;
		});

		__getset(0,__proto,'inContainer',function(){
			return this._displayObject !=null && this._displayObject.parent !=null;
		});

		__getset(0,__proto,'onStage',function(){
			return this._displayObject !=null && this._displayObject.stage !=null;
		});

		__getset(0,__proto,'group',function(){
			return this._group;
			},function(value){
			this._group=value;
		});

		__getset(0,__proto,'gearDisplay',function(){
			return this._gearDisplay;
		});

		__getset(0,__proto,'asGroup',function(){
			return this;
		});

		__getset(0,__proto,'asRichTextField',function(){
			return this;
		});

		__getset(0,__proto,'dragging',function(){
			return fairygui.GObject.sDragging==this;
		});

		__getset(0,__proto,'gearXY',function(){
			return this._gearXY;
		});

		__getset(0,__proto,'root',function(){
			if((this instanceof fairygui.GRoot ))
				return (this);
			var p=this._parent;
			while (p){
				if ((p instanceof fairygui.GRoot ))
					return (p);
				p=p.parent;
			}
			return GRoot.inst;
		});

		__getset(0,__proto,'relations',function(){
			return this._relations;
		});

		__getset(0,__proto,'displayObject',function(){
			return this._displayObject;
		});

		__getset(0,__proto,'asCom',function(){
			return this;
		});

		__getset(0,__proto,'asLoader',function(){
			return this;
		});

		__getset(0,__proto,'asProgress',function(){
			return this;
		});

		__getset(0,__proto,'asSlider',function(){
			return this;
		});

		__getset(0,__proto,'asList',function(){
			return this;
		});

		__getset(0,__proto,'asGraph',function(){
			return this;
		});

		__getset(0,__proto,'asMovieClip',function(){
			return this;
		});

		__getset(0,__proto,'draggable',function(){
			return this._draggable;
			},function(value){
			if (this._draggable !=value){
				this._draggable=value;
				this.initDrag();
			}
		});

		GObject.cast=function(sprite){
			return (sprite["$owner"]);
		}

		GObject._gInstanceCounter=0;
		GObject.sDragging=null
		GObject.sDraggingQuery=false;
		__static(GObject,
		['sGlobalDragStart',function(){return this.sGlobalDragStart=new Point();},'sGlobalRect',function(){return this.sGlobalRect=new Rectangle();},'sHelperPoint',function(){return this.sHelperPoint=new Point();},'sDragHelperRect',function(){return this.sDragHelperRect=new Rectangle();}
		]);
		return GObject;
	})()


	//class fairygui.GearBase
	var GearBase=(function(){
		function GearBase(owner){
			this._tween=false;
			this._easeType=null;
			this._tweenTime=0.3;
			this._delay=0;
			this._owner=null;
			this._controller=null;
			this._owner=owner;
			this._easeType=Ease.QuadOut;
		}

		__class(GearBase,'fairygui.GearBase');
		var __proto=GearBase.prototype;
		__proto.setup=function(xml){
			this._controller=this._owner.parent.getController(xml.getAttribute("controller"));
			if(this._controller==null)
				return;
			this.init();
			var str;
			str=xml.getAttribute("tween");
			if (str)
				this._tween=true;
			str=xml.getAttribute("ease");
			if (str)
				this._easeType=ToolSet.parseEaseType(str);
			str=xml.getAttribute("duration");
			if (str)
				this._tweenTime=parseFloat(str);
			str=xml.getAttribute("delay");
			if (str)
				this._delay=parseFloat(str);
			if((this instanceof fairygui.GearDisplay )){
				str=xml.getAttribute("pages");
				if(str){
					var arr=str.split(",");
					var $each_str;
					for($each_str in arr){
						str=arr[$each_str];
						(this).pages.push(str);
					}
				}
			}
			else{
				var pages;
				var values;
				str=xml.getAttribute("pages");
				if(str)
					pages=str.split(",");
				str=xml.getAttribute("values");
				if(str)
					values=str.split("|");
				if(pages && values){
					for(var i=0;i<values.length;i++){
						str=values[i];
						if(str!="-")
							this.addStatus(pages[i],str);
					}
				}
				str=xml.getAttribute("default");
				if(str)
					this.addStatus(null,str);
			}
		}

		__proto.addStatus=function(pageId,value){}
		__proto.init=function(){}
		__proto.apply=function(){}
		__proto.updateState=function(){}
		__getset(0,__proto,'controller',function(){
			return this._controller;
			},function(val){
			if (val !=this._controller){
				this._controller=val;
				if(this._controller)
					this.init();
			}
		});

		__getset(0,__proto,'tween',function(){
			return this._tween;
			},function(val){
			this._tween=val;
		});

		__getset(0,__proto,'delay',function(){
			return this._delay;
			},function(val){
			this._delay=val;
		});

		__getset(0,__proto,'tweenTime',function(){
			return this._tweenTime;
			},function(value){
			this._tweenTime=value;
		});

		__getset(0,__proto,'easeType',function(){
			return this._easeType;
			},function(value){
			this._easeType=value;
		});

		GearBase.disableAllTweenEffect=false;
		return GearBase;
	})()


	//class fairygui.GObjectPool
	var GObjectPool=(function(){
		function GObjectPool(){
			this._pool=null;
			this._count=0;
			this._pool={};
		}

		__class(GObjectPool,'fairygui.GObjectPool');
		var __proto=GObjectPool.prototype;
		__proto.clear=function(){
			var length1=this._pool.length;
			for (var i1=0;i1 < length1;i1++){
				var arr=this._pool[i1];
				var cnt=arr.length;
				for (var i=0;i < cnt;i++)
				arr[i].dispose();
			}
			this._pool={};
			this._count=0;
		}

		__proto.getObject=function(url){
			var arr=this._pool[url];
			if (arr==null){
				arr=[];
				this._pool[url]=arr;
			}
			if (arr.length){
				this._count--;
				return arr.shift();
			};
			var child=UIPackage.createObjectFromURL(url);
			return child;
		}

		__proto.returnObject=function(obj){
			var url=obj.resourceURL;
			if (!url)
				return;
			var arr=this._pool[url];
			if (!arr)
				return;
			this._count++;
			arr.push(obj);
		}

		__getset(0,__proto,'count',function(){
			return this._count;
		});

		return GObjectPool;
	})()


	//class fairygui.ListLayoutType
	var ListLayoutType=(function(){
		function ListLayoutType(){}
		__class(ListLayoutType,'fairygui.ListLayoutType');
		ListLayoutType.parse=function(value){
			switch (value){
				case "column":
					return 0;
				case "row":
					return 1;
				case "flow_hz":
					return 2;
				case "flow_vt":
					return 3;
				default :
					return 0;
				}
		}

		ListLayoutType.SingleColumn=0;
		ListLayoutType.SingleRow=1;
		ListLayoutType.FlowHorizontal=2;
		ListLayoutType.FlowVertical=3;
		return ListLayoutType;
	})()


	//class fairygui.ListSelectionMode
	var ListSelectionMode=(function(){
		function ListSelectionMode(){}
		__class(ListSelectionMode,'fairygui.ListSelectionMode');
		ListSelectionMode.parse=function(value){
			switch (value){
				case "single":
					return 0;
				case "multiple":
					return 1;
				case "multipleSingleClick":
					return 2;
				case "none":
					return 3;
				default :
					return 0;
				}
		}

		ListSelectionMode.Single=0;
		ListSelectionMode.Multiple=1;
		ListSelectionMode.Multiple_SingleClick=2;
		ListSelectionMode.None=3;
		return ListSelectionMode;
	})()


	//class fairygui.Margin
	var Margin=(function(){
		function Margin(){
			this.left=0;
			this.right=0;
			this.top=0;
			this.bottom=0;
		}

		__class(Margin,'fairygui.Margin');
		var __proto=Margin.prototype;
		__proto.parse=function(str){
			if (!str){
				this.left=0;
				this.right=0;
				this.top=0;
				this.bottom=0;
				return;
			};
			var arr=str.split(",");
			if (arr.length==1){
				var k=parseInt(arr[0]);
				this.top=k;
				this.bottom=k;
				this.left=k;
				this.right=k;
			}
			else {
				this.top=parseInt(arr[0]);
				this.bottom=parseInt(arr[1]);
				this.left=parseInt(arr[2]);
				this.right=parseInt(arr[3]);
			}
		}

		__proto.copy=function(source){
			this.top=source.top;
			this.bottom=source.bottom;
			this.left=source.left;
			this.right=source.right;
		}

		return Margin;
	})()


	//class fairygui.OverflowType
	var OverflowType=(function(){
		function OverflowType(){}
		__class(OverflowType,'fairygui.OverflowType');
		OverflowType.parse=function(value){
			switch (value){
				case "visible":
					return 0;
				case "hidden":
					return 1;
				case "scroll":
					return 2;
				case "scale":
					return 3;
				case "scaleFree":
					return 4;
				default :
					return 0;
				}
		}

		OverflowType.Visible=0;
		OverflowType.Hidden=1;
		OverflowType.Scroll=2;
		OverflowType.Scale=3;
		OverflowType.ScaleFree=4;
		return OverflowType;
	})()


	//class fairygui.PackageItem
	var PackageItem=(function(){
		function PackageItem(){
			this.owner=null;
			this.type=0;
			this.id=null;
			this.name=null;
			this.width=0;
			this.height=0;
			this.file=null;
			this.decoded=false;
			this.scale9Grid=null;
			this.scaleByTile=false;
			this.smoothing=false;
			this.texture=null;
			this.interval=0;
			this.repeatDelay=0;
			this.swing=false;
			this.frames=null;
			this.componentData=null;
			this.sound=null;
			this.bitmapFont=null;
		}

		__class(PackageItem,'fairygui.PackageItem');
		var __proto=PackageItem.prototype;
		__proto.load=function(){
			return this.owner.getItemAsset(this);
		}

		__proto.toString=function(){
			return this.name;
		}

		return PackageItem;
	})()


	//class fairygui.PackageItemType
	var PackageItemType=(function(){
		function PackageItemType(){}
		__class(PackageItemType,'fairygui.PackageItemType');
		PackageItemType.parse=function(value){
			switch(value){
				case "image":
					return 0;
				case "movieclip":
					return 2;
				case "sound":
					return 3;
				case "component":
					return 4;
				case "swf":
					return 1;
				case "font":
					return 6;
				case "atlas":
					return 7;
				}
			return 0;
		}

		PackageItemType.Image=0;
		PackageItemType.Swf=1;
		PackageItemType.MovieClip=2;
		PackageItemType.Sound=3;
		PackageItemType.Component=4;
		PackageItemType.Misc=5;
		PackageItemType.Font=6;
		PackageItemType.Atlas=7;
		return PackageItemType;
	})()


	//class fairygui.PageOption
	var PageOption=(function(){
		function PageOption(){
			this._controller=null;
			this._id=null;
		}

		__class(PageOption,'fairygui.PageOption');
		var __proto=PageOption.prototype;
		__proto.clear=function(){
			this._id=null;
		}

		__getset(0,__proto,'controller',null,function(val){
			this._controller=val;
		});

		__getset(0,__proto,'index',function(){
			if (this._id)
				return this._controller.getPageIndexById(this._id);
			else
			return-1;
			},function(pageIndex){
			this._id=this._controller.getPageId(pageIndex);
		});

		__getset(0,__proto,'id',function(){
			return this._id;
			},function(id){
			this._id=id;
		});

		__getset(0,__proto,'name',function(){
			if (this._id)
				return this._controller.getPageNameById(this._id);
			else
			return null;
			},function(pageName){
			this._id=this._controller.getPageIdByName(pageName);
		});

		return PageOption;
	})()


	//class fairygui.PopupMenu
	var PopupMenu=(function(){
		function PopupMenu(resourceURL){
			this._contentPane=null;
			this._list=null;
			if(!resourceURL){
				resourceURL=UIConfig1.popupMenu;
				if(!resourceURL)
					throw "UIConfig.popupMenu not defined";
			}
			this._contentPane=UIPackage.createObjectFromURL(resourceURL).asCom;
			this._contentPane.on("display",this,this.__addedToStage);
			this._list=(this._contentPane.getChild("list"));
			this._list.removeChildrenToPool();
			this._list.addRelation(this._contentPane,14);
			this._list.removeRelation(this._contentPane,15);
			this._contentPane.addRelation(this._list,15);
			this._list.on("fui_click_item",this,this.__clickItem);
		}

		__class(PopupMenu,'fairygui.PopupMenu');
		var __proto=PopupMenu.prototype;
		__proto.dispose=function(){
			this._contentPane.dispose();
		}

		__proto.addItem=function(caption,handler){
			var item=this._list.addItemFromPool().asButton;
			item.title=caption;
			item.data=handler;
			item.grayed=false;
			var c=item.getController("checked");
			if(c !=null)
				c.selectedIndex=0;
			return item;
		}

		__proto.addItemAt=function(caption,index,handler){
			var item=this._list.getFromPool().asButton;
			this._list.addChildAt(item,index);
			item.title=caption;
			item.data=handler;
			item.grayed=false;
			var c=item.getController("checked");
			if(c !=null)
				c.selectedIndex=0;
			return item;
		}

		__proto.addSeperator=function(){
			if(UIConfig1.popupMenu_seperator==null)
				throw "UIConfig.popupMenu_seperator not defined";
			this.list.addItemFromPool(UIConfig1.popupMenu_seperator);
		}

		__proto.getItemName=function(index){
			var item=this._list.getChildAt(index);
			return item.name;
		}

		__proto.setItemText=function(name,caption){
			var item=this._list.getChild(name).asButton;
			item.title=caption;
		}

		__proto.setItemVisible=function(name,visible){
			var item=this._list.getChild(name).asButton;
			if(item.visible !=visible){
				item.visible=visible;
				this._list.setBoundsChangedFlag();
			}
		}

		__proto.setItemGrayed=function(name,grayed){
			var item=this._list.getChild(name).asButton;
			item.grayed=grayed;
		}

		__proto.setItemCheckable=function(name,checkable){
			var item=this._list.getChild(name).asButton;
			var c=item.getController("checked");
			if(c !=null){
				if(checkable){
					if(c.selectedIndex==0)
						c.selectedIndex=1;
				}
				else
				c.selectedIndex=0;
			}
		}

		__proto.setItemChecked=function(name,checked){
			var item=this._list.getChild(name).asButton;
			var c=item.getController("checked");
			if(c !=null)
				c.selectedIndex=checked?2:1;
		}

		__proto.isItemChecked=function(name){
			var item=this._list.getChild(name).asButton;
			var c=item.getController("checked");
			if(c !=null)
				return c.selectedIndex==2;
			else
			return false;
		}

		__proto.removeItem=function(name){
			var item=this._list.getChild(name);
			if(item !=null){
				var index=this._list.getChildIndex(item);
				this._list.removeChildToPoolAt(index);
				return true;
			}
			else
			return false;
		}

		__proto.clearItems=function(){
			this._list.removeChildrenToPool();
		}

		__proto.show=function(target,downward){
			var r=target !=null?target.root:GRoot.inst;
			r.showPopup(this.contentPane,((target instanceof fairygui.GRoot ))?null:target,downward);
		}

		__proto.__clickItem=function(itemObject){
			Laya.timer.once(100,this,this.__clickItem2,[itemObject]);
		}

		__proto.__clickItem2=function(itemObject){
			var item=itemObject.asButton;
			if(item==null)
				return;
			if(item.grayed){
				this._list.selectedIndex=-1;
				return;
			};
			var c=item.getController("checked");
			if(c !=null && c.selectedIndex !=0){
				if(c.selectedIndex==1)
					c.selectedIndex=2;
				else
				c.selectedIndex=1;
			};
			var r=(this._contentPane.parent);
			r.hidePopup(this.contentPane);
			if(item.data !=null){
				(item.data).run();
			}
		}

		__proto.__addedToStage=function(){
			this._list.selectedIndex=-1;
			this._list.resizeToFit(100000,10);
		}

		__getset(0,__proto,'itemCount',function(){
			return this._list.numChildren;
		});

		__getset(0,__proto,'contentPane',function(){
			return this._contentPane;
		});

		__getset(0,__proto,'list',function(){
			return this._list;
		});

		return PopupMenu;
	})()


	//class fairygui.ProgressTitleType
	var ProgressTitleType=(function(){
		function ProgressTitleType(){}
		__class(ProgressTitleType,'fairygui.ProgressTitleType');
		ProgressTitleType.parse=function(value){
			switch (value){
				case "percent":
					return 0;
				case "valueAndmax":
					return 1;
				case "value":
					return 2;
				case "max":
					return 3;
				default :
					return 0;
				}
		}

		ProgressTitleType.Percent=0;
		ProgressTitleType.ValueAndMax=1;
		ProgressTitleType.Value=2;
		ProgressTitleType.Max=3;
		return ProgressTitleType;
	})()


	//class fairygui.RelationItem
	var RelationItem=(function(){
		var RelationDef;
		function RelationItem(owner){
			this._owner=null;
			this._target=null;
			this._defs=null;
			this._targetX=NaN;
			this._targetY=NaN;
			this._targetWidth=NaN;
			this._targetHeight=NaN;
			this._owner=owner;
			this._defs=[];
		}

		__class(RelationItem,'fairygui.RelationItem');
		var __proto=RelationItem.prototype;
		__proto.add=function(relationType,usePercent){
			if (relationType==24){
				this.add(14,usePercent);
				this.add(15,usePercent);
				return;
			};
			var length=this._defs.length;
			for (var i=0;i < length;i++){
				var def=this._defs[i];
				if (def.type==relationType)
					return;
			};
			var info=new RelationDef();
			info.affectBySelfSizeChanged=relationType >=3 && relationType <=6
			|| relationType >=10 && relationType <=13;
			info.percent=usePercent;
			info.type=relationType;
			this._defs.push(info);
		}

		__proto.remove=function(relationType){
			(relationType===void 0)&& (relationType=0);
			if (relationType==24){
				this.remove(14);
				this.remove(15);
				return;
			};
			var dc=this._defs.length;
			for (var k=0;k < dc;k++){
				if (this._defs[k].type==relationType){
					this._defs.splice(k,1);
					break ;
				}
			}
		}

		__proto.copyFrom=function(source){
			this.target=source.target;
			this._defs.length=0;
			var length=source._defs.length;
			for (var i=0;i < length;i++){
				var info=source._defs[i];
				var info2=new RelationDef();
				info2.copyFrom(info);
				this._defs.push(info2);
			}
		}

		__proto.dispose=function(){
			if (this._target !=null){
				this.releaseRefTarget(this._target);
				this._target=null;
			}
		}

		__proto.applyOnSelfResized=function(dWidth,dHeight){
			var ox=this._owner.x;
			var oy=this._owner.y;
			var length=this._defs.length;
			for (var i=0;i < length;i++){
				var info=this._defs[i];
				if (info.affectBySelfSizeChanged){
					switch (info.type){
						case 3:
						case 5:
							this._owner.x-=dWidth / 2;
							break ;
						case 4:
						case 6:
							this._owner.x-=dWidth;
							break ;
						case 10:
						case 12:
							this._owner.y-=dHeight / 2;
							break ;
						case 11:
						case 13:
							this._owner.y-=dHeight;
							break ;
						}
				}
			}
			if (ox !=this._owner.x || oy !=this._owner.y){
				ox=this._owner.x-ox;
				oy=this._owner.y-oy;
				if (this._owner.gearXY.controller !=null)
					this._owner.gearXY.updateFromRelations(ox,oy);
				if(this._owner.parent !=null){
					var len=this._owner.parent._transitions.length;
					if(len > 0){
						for(i=0;i < len;++i){
							this._owner.parent._transitions[i].updateFromRelations(this._owner.id,ox,oy);
						}
					}
				}
			}
		}

		__proto.applyOnXYChanged=function(info,dx,dy){
			var tmp=NaN;
			switch (info.type){
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
					this._owner.x+=dx;
					break ;
				case 7:
				case 8:
				case 9:
				case 10:
				case 11:
				case 12:
				case 13:
					this._owner.y+=dy;
					break ;
				case 14:
				case 15:
					break ;
				case 16:
				case 17:
					tmp=this._owner.x;
					this._owner.x+=dx;
					this._owner.width=this._owner._rawWidth-(this._owner.x-tmp);
					break ;
				case 18:
				case 19:
					this._owner.width=this._owner._rawWidth+dx;
					break ;
				case 20:
				case 21:
					tmp=this._owner.y;
					this._owner.y+=dy;
					this._owner.height=this._owner._rawHeight-(this._owner.y-tmp);
					break ;
				case 22:
				case 23:
					this._owner.height=this._owner._rawHeight+dy;
					break ;
				}
		}

		__proto.applyOnSizeChanged=function(info){
			var targetX=NaN,targetY=NaN;
			if (this._target !=this._owner.parent){
				targetX=this._target.x;
				targetY=this._target.y;
			}
			else {
				targetX=0;
				targetY=0;
			};
			var v=NaN,tmp=NaN;
			switch (info.type){
				case 0:
					break ;
				case 1:
					v=this._owner.x-(targetX+this._targetWidth / 2);
					if (info.percent)
						v=v / this._targetWidth *this._target._rawWidth;
					this._owner.x=targetX+this._target._rawWidth / 2+v;
					break ;
				case 2:
					v=this._owner.x-(targetX+this._targetWidth);
					if (info.percent)
						v=v / this._targetWidth *this._target._rawWidth;
					this._owner.x=targetX+this._target._rawWidth+v;
					break ;
				case 3:
					v=this._owner.x+this._owner._rawWidth / 2-(targetX+this._targetWidth / 2);
					if (info.percent)
						v=v / this._targetWidth *this._target._rawWidth;
					this._owner.x=targetX+this._target._rawWidth / 2+v-this._owner._rawWidth / 2;
					break ;
				case 4:
					v=this._owner.x+this._owner._rawWidth-targetX;
					if (info.percent)
						v=v / this._targetWidth *this._target._rawWidth;
					this._owner.x=targetX+v-this._owner._rawWidth;
					break ;
				case 5:
					v=this._owner.x+this._owner._rawWidth-(targetX+this._targetWidth / 2);
					if (info.percent)
						v=v / this._targetWidth *this._target._rawWidth;
					this._owner.x=targetX+this._target._rawWidth / 2+v-this._owner._rawWidth;
					break ;
				case 6:
					v=this._owner.x+this._owner._rawWidth-(targetX+this._targetWidth);
					if (info.percent)
						v=v / this._targetWidth *this._target._rawWidth;
					this._owner.x=targetX+this._target._rawWidth+v-this._owner._rawWidth;
					break ;
				case 7:
					break ;
				case 8:
					v=this._owner.y-(targetY+this._targetHeight / 2);
					if (info.percent)
						v=v / this._targetHeight *this._target._rawHeight;
					this._owner.y=targetY+this._target._rawHeight / 2+v;
					break ;
				case 9:
					v=this._owner.y-(targetY+this._targetHeight);
					if (info.percent)
						v=v / this._targetHeight *this._target._rawHeight;
					this._owner.y=targetY+this._target._rawHeight+v;
					break ;
				case 10:
					v=this._owner.y+this._owner._rawHeight / 2-(targetY+this._targetHeight / 2);
					if (info.percent)
						v=v / this._targetHeight *this._target._rawHeight;
					this._owner.y=targetY+this._target._rawHeight / 2+v-this._owner._rawHeight / 2;
					break ;
				case 11:
					v=this._owner.y+this._owner._rawHeight-targetY;
					if (info.percent)
						v=v / this._targetHeight *this._target._rawHeight;
					this._owner.y=targetY+v-this._owner._rawHeight;
					break ;
				case 12:
					v=this._owner.y+this._owner._rawHeight-(targetY+this._targetHeight / 2);
					if (info.percent)
						v=v / this._targetHeight *this._target._rawHeight;
					this._owner.y=targetY+this._target._rawHeight / 2+v-this._owner._rawHeight;
					break ;
				case 13:
					v=this._owner.y+this._owner._rawHeight-(targetY+this._targetHeight);
					if (info.percent)
						v=v / this._targetHeight *this._target._rawHeight;
					this._owner.y=targetY+this._target._rawHeight+v-this._owner._rawHeight;
					break ;
				case 14:
					if(this._owner._underConstruct && this._owner==this._target.parent)
						v=this._owner.sourceWidth-this._target._initWidth;
					else
					v=this._owner._rawWidth-this._targetWidth;
					if (info.percent)
						v=v / this._targetWidth *this._target._rawWidth;
					if(this._target==this._owner.parent)
						this._owner.setSize(this._target._rawWidth+v,this._owner._rawHeight,true);
					else
					this._owner.width=this._target._rawWidth+v;
					break ;
				case 15:
					if(this._owner._underConstruct && this._owner==this._target.parent)
						v=this._owner.sourceHeight-this._target._initHeight;
					else
					v=this._owner._rawHeight-this._targetHeight;
					if (info.percent)
						v=v / this._targetHeight *this._target._rawHeight;
					if(this._target==this._owner.parent)
						this._owner.setSize(this._owner._rawWidth,this._target._rawHeight+v,true);
					else
					this._owner.height=this._target._rawHeight+v;
					break ;
				case 16:
					break ;
				case 17:
					v=this._owner.x-(targetX+this._targetWidth);
					if (info.percent)
						v=v / this._targetWidth *this._target._rawWidth;
					tmp=this._owner.x;
					this._owner.x=targetX+this._target._rawWidth+v;
					this._owner.width=this._owner._rawWidth-(this._owner.x-tmp);
					break ;
				case 18:
					break ;
				case 19:
					if(this._owner._underConstruct && this._owner==this._target.parent)
						v=this._owner.sourceWidth-(targetX+this._target._initWidth);
					else
					v=this._owner.width-(targetX+this._targetWidth);
					if (this._owner !=this._target.parent)
						v+=this._owner.x;
					if (info.percent)
						v=v / this._targetWidth *this._target._rawWidth;
					if (this._owner !=this._target.parent)
						this._owner.width=targetX+this._target._rawWidth+v-this._owner.x;
					else
					this._owner.width=targetX+this._target._rawWidth+v;
					break ;
				case 20:
					break ;
				case 21:
					v=this._owner.y-(targetY+this._targetHeight);
					if (info.percent)
						v=v / this._targetHeight *this._target._rawHeight;
					tmp=this._owner.y;
					this._owner.y=targetY+this._target._rawHeight+v;
					this._owner.height=this._owner._rawHeight-(this._owner.y-tmp);
					break ;
				case 22:
					break ;
				case 23:
					if(this._owner._underConstruct && this._owner==this._target.parent)
						v=this._owner.sourceHeight-(targetY+this._target._initHeight);
					else
					v=this._owner._rawHeight-(targetY+this._targetHeight);
					if (this._owner !=this._target.parent)
						v+=this._owner.y;
					if (info.percent)
						v=v / this._targetHeight *this._target._rawHeight;
					if (this._owner !=this._target.parent)
						this._owner.height=targetY+this._target._rawHeight+v-this._owner.y;
					else
					this._owner.height=targetY+this._target._rawHeight+v;
					break ;
				}
		}

		__proto.addRefTarget=function(target){
			if (target !=this._owner.parent)
				target.on("fui_xy_changed",this,this.__targetXYChanged);
			target.on("fui_size_changed",this,this.__targetSizeChanged);
			target.on("fui_size_delay_change",this,this.__targetSizeWillChange);
			this._targetX=this._target.x;
			this._targetY=this._target.y;
			this._targetWidth=this._target._rawWidth;
			this._targetHeight=this._target._rawHeight;
		}

		__proto.releaseRefTarget=function(target){
			target.off("fui_xy_changed",this,this.__targetXYChanged);
			target.off("fui_size_changed",this,this.__targetSizeChanged);
			target.off("fui_size_delay_change",this,this.__targetSizeWillChange);
		}

		__proto.__targetXYChanged=function(){
			if (this._owner.relations.handling !=null || this._owner.group!=null && this._owner.group._updating){
				this._targetX=this._target.x;
				this._targetY=this._target.y;
				return;
			}
			this._owner.relations.handling=this._target;
			var ox=this._owner.x;
			var oy=this._owner.y;
			var dx=this._target.x-this._targetX;
			var dy=this._target.y-this._targetY;
			var length=this._defs.length;
			for (var i=0;i < length;i++){
				var info=this._defs[i];
				this.applyOnXYChanged(info,dx,dy);
			}
			this._targetX=this._target.x;
			this._targetY=this._target.y;
			if (ox !=this._owner.x || oy !=this._owner.y){
				ox=this._owner.x-ox;
				oy=this._owner.y-oy;
				if (this._owner.gearXY.controller !=null)
					this._owner.gearXY.updateFromRelations(ox,oy);
				if(this._owner.parent !=null){
					var len=this._owner.parent._transitions.length;
					if(len > 0){
						for(i=0;i < len;++i){
							this._owner.parent._transitions[i].updateFromRelations(this._owner.id,ox,oy);
						}
					}
				}
			}
			this._owner.relations.handling=null;
		}

		__proto.__targetSizeChanged=function(){
			if (this._owner.relations.handling !=null)
				return;
			this._owner.relations.handling=this._target;
			var ox=this._owner.x;
			var oy=this._owner.y;
			var ow=this._owner._rawWidth;
			var oh=this._owner._rawHeight;
			var length=this._defs.length;
			for (var i=0;i < length;i++){
				var info=this._defs[i];
				this.applyOnSizeChanged(info);
			}
			this._targetWidth=this._target._rawWidth;
			this._targetHeight=this._target._rawHeight;
			if (ox !=this._owner.x || oy !=this._owner.y){
				ox=this._owner.x-ox;
				oy=this._owner.y-oy;
				if (this._owner.gearXY.controller !=null)
					this._owner.gearXY.updateFromRelations(ox,oy);
				if(this._owner.parent !=null){
					var len=this._owner.parent._transitions.length;
					if(len > 0){
						for(i=0;i < len;++i){
							this._owner.parent._transitions[i].updateFromRelations(this._owner.id,ox,oy);
						}
					}
				}
			}
			if(ow !=this._owner._rawWidth || oh !=this._owner._rawHeight){
				ow=this._owner._rawWidth-ow;
				oh=this._owner._rawHeight-oh;
				if(this._owner.gearSize.controller !=null)
					this._owner.gearSize.updateFromRelations(ow,oh);
			}
			this._owner.relations.handling=null;
		}

		__proto.__targetSizeWillChange=function(){
			this._owner.relations.sizeDirty=true;
		}

		__getset(0,__proto,'isEmpty',function(){
			return this._defs.length==0;
		});

		__getset(0,__proto,'owner',function(){
			return this._owner;
		});

		__getset(0,__proto,'target',function(){
			return this._target;
			},function(value){
			if (this._target !=value){
				if (this._target)
					this.releaseRefTarget(this._target);
				this._target=value;
				if (this._target)
					this.addRefTarget(this._target);
			}
		});

		RelationItem.__init$=function(){
			//class RelationDef
			RelationDef=(function(){
				function RelationDef(){
					this.affectBySelfSizeChanged=false;
					this.percent=false;
					this.type=NaN;
				}
				__class(RelationDef,'');
				var __proto=RelationDef.prototype;
				__proto.copyFrom=function(source){
					this.affectBySelfSizeChanged=source.affectBySelfSizeChanged;
					this.percent=source.percent;
					this.type=source.type;
				}
				return RelationDef;
			})()
		}

		return RelationItem;
	})()


	//class fairygui.Relations
	var Relations=(function(){
		function Relations(owner){
			this._owner=null;
			this._items=null;
			this.handling=null;
			this.sizeDirty=false;
			this._owner=owner;
			this._items=[];
		}

		__class(Relations,'fairygui.Relations');
		var __proto=Relations.prototype;
		__proto.add=function(target,relationType,usePercent){
			(usePercent===void 0)&& (usePercent=false);
			var length=this._items.length;
			for (var i=0;i < length;i++){
				var item=this._items[i];
				if (item.target==target){
					item.add(relationType,usePercent);
					return;
				}
			};
			var newItem=new RelationItem(this._owner);
			newItem.target=target;
			newItem.add(relationType,usePercent);
			this._items.push(newItem);
		}

		__proto.addItems=function(target,sidePairs){
			var arr=sidePairs.split(",");
			var s;
			var usePercent=false;
			var i=NaN;
			for (i=0;i < 2;i++){
				s=arr[i];
				if (!s)
					continue ;
				if (s.charAt(s.length-1)=="%"){
					s=s.substr(0,s.length-1);
					usePercent=true;
				}
				else
				usePercent=false;
				var j=s.indexOf("-");
				if (j==-1)
					s=s+"-"+s;
				var t=fairygui.Relations.RELATION_NAMES.indexOf(s);
				if (t==-1)
					throw "invalid relation type";
				this.add(target,t,usePercent);
			}
		}

		__proto.remove=function(target,relationType){
			(relationType===void 0)&& (relationType=0);
			var cnt=this._items.length;
			var i=0;
			while (i < cnt){
				var item=this._items[i];
				if (item.target==target){
					item.remove(relationType);
					if (item.isEmpty){
						item.dispose();
						this._items.splice(i,1);
						cnt--;
					}
					else
					i++;
				}
				else
				i++;
			}
		}

		__proto.contains=function(target){
			var length=this._items.length;
			for (var i=0;i < length;i++){
				var item=this._items[i];
				if (item.target==target)
					return true;
			}
			return false;
		}

		__proto.clearFor=function(target){
			var cnt=this._items.length;
			var i=0;
			while (i < cnt){
				var item=this._items[i];
				if (item.target==target){
					item.dispose();
					this._items.splice(i,1);
					cnt--;
				}
				else
				i++;
			}
		}

		__proto.clearAll=function(){
			var length=this._items.length;
			for (var i=0;i < length;i++){
				var item=this._items[i];
				item.dispose();
			}
			this._items.length=0;
		}

		__proto.copyFrom=function(source){
			this.clearAll();
			var arr=source._items;
			var length=arr.length;
			for (var i=0;i < length;i++){
				var ri=arr[i];
				var item=new RelationItem(this._owner);
				item.copyFrom(ri);
				this._items.push(item);
			}
		}

		__proto.dispose=function(){
			this.clearAll();
		}

		__proto.onOwnerSizeChanged=function(dWidth,dHeight){
			if (this._items.length==0)
				return;
			var length=this._items.length;
			for (var i=0;i < length;i++){
				var item=this._items[i];
				item.applyOnSelfResized(dWidth,dHeight);
			}
		}

		__proto.ensureRelationsSizeCorrect=function(){
			if (this._items.length==0)
				return;
			this.sizeDirty=false;
			var length=this._items.length;
			for (var i=0;i < length;i++){
				var item=this._items[i];
				item.target.ensureSizeCorrect();
			}
		}

		__proto.setup=function(xml){
			var col=xml.childNodes;
			var length=col.length;
			var targetId;
			var target;
			for (var i=0;i < length;i++){
				var cxml=col[i];
				if(cxml.nodeName!="relation")
					continue ;
				targetId=cxml.getAttribute("target");
				if (this._owner.parent){
					if (targetId)
						target=this._owner.parent.getChildById(targetId);
					else
					target=this._owner.parent;
				}
				else {
					target=(this._owner).getChildById(targetId);
				}
				if (target)
					this.addItems(target,cxml.getAttribute("sidePair"));
			}
		}

		__getset(0,__proto,'empty',function(){
			return this._items.length==0;
		});

		__static(Relations,
		['RELATION_NAMES',function(){return this.RELATION_NAMES=
			[
			"left-left",
			"left-center",
			"left-right",
			"center-center",
			"right-left",
			"right-center",
			"right-right",
			"top-top",
			"top-middle",
			"top-bottom",
			"middle-middle",
			"bottom-top",
			"bottom-middle",
			"bottom-bottom",
			"width-width",
			"height-height",
			"leftext-left",
			"leftext-right",
			"rightext-left",
			"rightext-right",
			"topext-top",
			"topext-bottom",
			"bottomext-top",
			"bottomext-bottom"];}
		]);
		return Relations;
	})()


	//class fairygui.RelationType
	var RelationType=(function(){
		function RelationType(){}
		__class(RelationType,'fairygui.RelationType');
		RelationType.Left_Left=0;
		RelationType.Left_Center=1;
		RelationType.Left_Right=2;
		RelationType.Center_Center=3;
		RelationType.Right_Left=4;
		RelationType.Right_Center=5;
		RelationType.Right_Right=6;
		RelationType.Top_Top=7;
		RelationType.Top_Middle=8;
		RelationType.Top_Bottom=9;
		RelationType.Middle_Middle=10;
		RelationType.Bottom_Top=11;
		RelationType.Bottom_Middle=12;
		RelationType.Bottom_Bottom=13;
		RelationType.Width=14;
		RelationType.Height=15;
		RelationType.LeftExt_Left=16;
		RelationType.LeftExt_Right=17;
		RelationType.RightExt_Left=18;
		RelationType.RightExt_Right=19;
		RelationType.TopExt_Top=20;
		RelationType.TopExt_Bottom=21;
		RelationType.BottomExt_Top=22;
		RelationType.BottomExt_Bottom=23;
		RelationType.Size=24;
		return RelationType;
	})()


	//class fairygui.ScrollBarDisplayType
	var ScrollBarDisplayType=(function(){
		function ScrollBarDisplayType(){}
		__class(ScrollBarDisplayType,'fairygui.ScrollBarDisplayType');
		ScrollBarDisplayType.parse=function(value){
			switch (value){
				case "default":
					return 0;
				case "visible":
					return 1;
				case "auto":
					return 2;
				case "hidden":
					return 3;
				default :
					return 0;
				}
		}

		ScrollBarDisplayType.Default=0;
		ScrollBarDisplayType.Visible=1;
		ScrollBarDisplayType.Auto=2;
		ScrollBarDisplayType.Hidden=3;
		return ScrollBarDisplayType;
	})()


	//class fairygui.ScrollPane
	var ScrollPane=(function(){
		var TweenHelper;
		function ScrollPane(owner,scrollType,scrollBarMargin,scrollBarDisplay,flags,vtScrollBarRes,hzScrollBarRes){
			this._owner=null;
			this._container=null;
			this._maskHolder=null;
			this._maskContentHolder=null;
			this._maskWidth=0;
			this._maskHeight=0;
			this._contentWidth=0;
			this._contentHeight=0;
			this._scrollType=0;
			this._scrollSpeed=0;
			this._mouseWheelSpeed=0;
			this._scrollBarMargin=null;
			this._bouncebackEffect=false;
			this._touchEffect=false;
			this._scrollBarDisplayAuto=false;
			this._vScrollNone=false;
			this._hScrollNone=false;
			this._displayOnLeft=false;
			this._snapToItem=false;
			this._displayInDemand=false;
			this._mouseWheelEnabled=false;
			this._pageMode=false;
			this._pageSizeH=NaN;
			this._pageSizeV=NaN;
			this._yPerc=NaN;
			this._xPerc=NaN;
			this._vScroll=false;
			this._hScroll=false;
			this._needRefresh=false;
			this._tweening=NaN;
			this._tweenHelper=null;
			this._tweener=null;
			this._time1=NaN;
			this._time2=NaN;
			this._y1=NaN;
			this._y2=NaN;
			this._yOverlap=NaN;
			this._yOffset=NaN;
			this._x1=NaN;
			this._x2=NaN;
			this._xOverlap=NaN;
			this._xOffset=NaN;
			this._isMouseMoved=false;
			this._holdAreaPoint=null;
			this._isHoldAreaDone=false;
			this._aniFlag=false;
			this._scrollBarVisible=false;
			this._hzScrollBar=null;
			this._vtScrollBar=null;
			;
			if(fairygui.ScrollPane._easeTypeFunc==null)
				fairygui.ScrollPane._easeTypeFunc=Ease.cubicOut;
			this._tweenHelper=new TweenHelper();
			this._owner=owner;
			this._container=this._owner.displayObject;
			this._maskHolder=new Sprite();
			this._container.addChild(this._maskHolder);
			this._maskContentHolder=this._owner._container;
			this._maskContentHolder.pos(0,0);
			this._maskHolder.addChild(this._maskContentHolder);
			this._scrollType=scrollType;
			this._scrollBarMargin=scrollBarMargin;
			this._bouncebackEffect=UIConfig1.defaultScrollBounceEffect;
			this._touchEffect=UIConfig1.defaultScrollTouchEffect;
			this._scrollSpeed=UIConfig1.defaultScrollSpeed;
			this._mouseWheelSpeed=this._scrollSpeed *2;
			this._displayOnLeft=(flags & 1)!=0;
			this._snapToItem=(flags & 2)!=0;
			this._displayInDemand=(flags & 4)!=0;
			this._pageMode=(flags & 8)!=0;
			if(flags & 16)
				this._touchEffect=true;
			else if(flags & 32)
			this._touchEffect=false;
			else
			this._touchEffect=UIConfig1.defaultScrollTouchEffect;
			if(flags & 64)
				this._bouncebackEffect=true;
			else if(flags & 128)
			this._bouncebackEffect=false;
			else
			this._bouncebackEffect=UIConfig1.defaultScrollBounceEffect;
			this._xPerc=0;
			this._yPerc=0;
			this._aniFlag=true;
			this._scrollBarVisible=true;
			this._mouseWheelEnabled=true;
			this._holdAreaPoint=new Point();
			if(scrollBarDisplay==0)
				scrollBarDisplay=UIConfig1.defaultScrollBarDisplay;
			if(scrollBarDisplay !=3){
				if(this._scrollType==2 || this._scrollType==1){
					var res=vtScrollBarRes ? vtScrollBarRes :UIConfig1.verticalScrollBar;
					if(res){
						this._vtScrollBar=(UIPackage.createObjectFromURL(res));
						if(!this._vtScrollBar)
							throw "cannot create scrollbar from "+res;
						this._vtScrollBar.setScrollPane(this,true);
						this._container.addChild(this._vtScrollBar.displayObject);
					}
				}
				if(this._scrollType==2 || this._scrollType==0){
					res=hzScrollBarRes ? hzScrollBarRes :UIConfig1.horizontalScrollBar;
					if(res){
						this._hzScrollBar=(UIPackage.createObjectFromURL(res));
						if(!this._hzScrollBar)
							throw "cannot create scrollbar from "+res;
						this._hzScrollBar.setScrollPane(this,false);
						this._container.addChild(this._hzScrollBar.displayObject);
					}
				}
				this._scrollBarDisplayAuto=scrollBarDisplay==2;
				if(this._scrollBarDisplayAuto){
					this._scrollBarVisible=false;
					if(this._vtScrollBar)
						this._vtScrollBar.displayObject.visible=false;
					if(this._hzScrollBar)
						this._hzScrollBar.displayObject.visible=false;
				}
			}
			this._contentWidth=0;
			this._contentHeight=0;
			this.setSize(owner.width,owner.height,true);
			this._owner.on("mousedown",this,this.__mouseDown);
			this._owner.on("mousewheel",this,this.__mouseWheel);
		}

		__class(ScrollPane,'fairygui.ScrollPane');
		var __proto=ScrollPane.prototype;
		__proto.setPercX=function(sc,ani){
			(ani===void 0)&& (ani=false);
			if (sc > 1)
				sc=1;
			else if (sc < 0)
			sc=0;
			if (sc !=this._xPerc){
				this._xPerc=sc;
				this.posChanged(ani);
			}
		}

		__proto.setPercY=function(sc,ani){
			(ani===void 0)&& (ani=false);
			if (sc > 1)
				sc=1;
			else if (sc < 0)
			sc=0;
			if (sc !=this._yPerc){
				this._yPerc=sc;
				this.posChanged(ani);
			}
		}

		__proto.setPosX=function(val,ani){
			(ani===void 0)&& (ani=false);
			if(this._contentWidth > this._maskWidth)
				this.setPercX(val / (this._contentWidth-this._maskWidth),ani);
			else
			this.setPercX(0,ani);
		}

		__proto.setPosY=function(val,ani){
			(ani===void 0)&& (ani=false);
			if(this._contentHeight > this._maskHeight)
				this.setPercY(val / (this._contentHeight-this._maskHeight),ani);
			else
			this.setPercY(0,ani);
		}

		__proto.getDeltaX=function(move){
			return move / (this._contentWidth-this._maskWidth);
		}

		__proto.getDeltaY=function(move){
			return move / (this._contentHeight-this._maskHeight);
		}

		__proto.scrollTop=function(ani){
			(ani===void 0)&& (ani=false);
			this.setPercY(0,ani);
		}

		__proto.scrollBottom=function(ani){
			(ani===void 0)&& (ani=false);
			this.setPercY(1,ani);
		}

		__proto.scrollUp=function(speed,ani){
			(speed===void 0)&& (speed=1);
			(ani===void 0)&& (ani=false);
			this.setPercY(this._yPerc-this.getDeltaY(this._scrollSpeed *speed),ani);
		}

		__proto.scrollDown=function(speed,ani){
			(speed===void 0)&& (speed=1);
			(ani===void 0)&& (ani=false);
			this.setPercY(this._yPerc+this.getDeltaY(this._scrollSpeed *speed),ani);
		}

		__proto.scrollLeft=function(speed,ani){
			(speed===void 0)&& (speed=1);
			(ani===void 0)&& (ani=false);
			this.setPercX(this._xPerc-this.getDeltaX(this._scrollSpeed *speed),ani);
		}

		__proto.scrollRight=function(speed,ani){
			(speed===void 0)&& (speed=1);
			(ani===void 0)&& (ani=false);
			this.setPercX(this._xPerc+this.getDeltaX(this._scrollSpeed *speed),ani);
		}

		__proto.scrollToView=function(target,ani,setFirst){
			(ani===void 0)&& (ani=false);
			(setFirst===void 0)&& (setFirst=false);
			this._owner.ensureBoundsCorrect();
			if(this._needRefresh)
				this.refresh();
			var rect;
			if((target instanceof fairygui.GObject )){
				if(target.parent !=this._owner){
					target.parent.localToGlobalRect(target.x,target.y,
					target.width,target.height,fairygui.ScrollPane.sHelperRect);
					rect=this._owner.globalToLocalRect(fairygui.ScrollPane.sHelperRect.x,fairygui.ScrollPane.sHelperRect.y,
					fairygui.ScrollPane.sHelperRect.width,fairygui.ScrollPane.sHelperRect.height,fairygui.ScrollPane.sHelperRect);
				}
				else {
					rect=fairygui.ScrollPane.sHelperRect;
					rect.setTo(target.x,target.y,target.width,target.height);
				}
			}
			else
			rect=(target);
			if (this._vScroll){
				var top=this.posY;
				var bottom=top+this._maskHeight;
				if(setFirst || rect.y < top || rect.height >=this._maskHeight){
					if(this._pageMode)
						this.setPosY(Math.floor(rect.y / this._pageSizeV)*this._pageSizeV,ani);
					else
					this.setPosY(rect.y,ani);
				}
				else if(rect.y+rect.height > bottom){
					if(this._pageMode)
						this.setPosY(Math.floor(rect.y / this._pageSizeV)*this._pageSizeV,ani);
					else if(rect.height <=this._maskHeight/2)
					this.setPosY(rect.y+rect.height *2-this._maskHeight,ani);
					else
					this.setPosY(rect.y+rect.height-this._maskHeight,ani);
				}
			}
			if (this._hScroll){
				var left=this.posX;
				var right=left+this._maskWidth;
				if(setFirst || rect.x < left || rect.width >=this._maskWidth){
					if(this._pageMode)
						this.setPosX(Math.floor(rect.x / this._pageSizeH)*this._pageSizeH,ani);
					else
					this.setPosX(rect.x,ani);
				}
				else if(rect.x+rect.width > right){
					if(this._pageMode)
						this.setPosX(Math.floor(rect.x / this._pageSizeH)*this._pageSizeH,ani);
					else if(rect.width <=this._maskWidth/2)
					this.setPosX(rect.x+rect.width *2-this._maskWidth,ani);
					else
					this.setPosX(rect.x+rect.width-this._maskWidth,ani);
				}
			}
			if(!ani && this._needRefresh)
				this.refresh();
		}

		__proto.isChildInView=function(obj){
			var dist=NaN;
			if(this._vScroll){
				dist=obj.y+this._maskContentHolder.y;
				if(dist <-obj.height-20 || dist > this._maskHeight+20)
					return false;
			}
			if(this._hScroll){
				dist=obj.x+this._maskContentHolder.x;
				if(dist <-obj.width-20 || dist > this._maskWidth+20)
					return false;
			}
			return true;
		}

		__proto.setSize=function(aWidth,aHeight,noRefresh){
			(noRefresh===void 0)&& (noRefresh=false);
			if(this._displayOnLeft && this._vtScrollBar)
				this._maskHolder.x=Math.floor(this._owner.margin.left+this._vtScrollBar.width);
			else
			this._maskHolder.x=this._owner.margin.left;
			this._maskHolder.y=this._owner.margin.top;
			if (this._hzScrollBar){
				this._hzScrollBar.y=aHeight-this._hzScrollBar.height;
				if(this._vtScrollBar && !this._vScrollNone){
					this._hzScrollBar.width=aWidth-this._vtScrollBar.width-this._scrollBarMargin.left-this._scrollBarMargin.right;
					if(this._displayOnLeft)
						this._hzScrollBar.x=this._scrollBarMargin.left+this._vtScrollBar.width;
					else
					this._hzScrollBar.x=this._scrollBarMargin.left;
				}
				else {
					this._hzScrollBar.width=aWidth-this._scrollBarMargin.left-this._scrollBarMargin.right;
					this._hzScrollBar.x=this._scrollBarMargin.left;
				}
			}
			if (this._vtScrollBar){
				if (!this._displayOnLeft)
					this._vtScrollBar.x=aWidth-this._vtScrollBar.width;
				if(this._hzScrollBar)
					this._vtScrollBar.height=aHeight-this._hzScrollBar.height-this._scrollBarMargin.top-this._scrollBarMargin.bottom;
				else
				this._vtScrollBar.height=aHeight-this._scrollBarMargin.top-this._scrollBarMargin.bottom;
				this._vtScrollBar.y=this._scrollBarMargin.top;
			}
			this._maskWidth=aWidth;
			this._maskHeight=aHeight;
			if(this._hzScrollBar && !this._hScrollNone)
				this._maskHeight-=this._hzScrollBar.height;
			if(this._vtScrollBar && !this._vScrollNone)
				this._maskWidth-=this._vtScrollBar.width;
			this._maskWidth-=(this._owner.margin.left+this._owner.margin.right);
			this._maskHeight-=(this._owner.margin.top+this._owner.margin.bottom);
			this._maskWidth=Math.max(1,this._maskWidth);
			this._maskHeight=Math.max(1,this._maskHeight);
			this._pageSizeH=this._maskWidth;
			this._pageSizeV=this._maskHeight;
			this.handleSizeChanged();
			if(!noRefresh)
				this.posChanged(false);
		}

		__proto.setContentSize=function(aWidth,aHeight){
			if (this._contentWidth==aWidth && this._contentHeight==aHeight)
				return;
			this._contentWidth=aWidth;
			this._contentHeight=aHeight;
			this.handleSizeChanged();
			this._aniFlag=false;
			this.refresh();
		}

		__proto.handleSizeChanged=function(){
			if(this._displayInDemand){
				if(this._vtScrollBar){
					if(this._contentHeight <=this._maskHeight){
						if(!this._vScrollNone){
							this._vScrollNone=true;
							this._maskWidth+=this._vtScrollBar.width;
						}
					}
					else {
						if(this._vScrollNone){
							this._vScrollNone=false;
							this._maskWidth-=this._vtScrollBar.width;
						}
					}
				}
				if(this._hzScrollBar){
					if(this._contentWidth <=this._maskWidth){
						if(!this._hScrollNone){
							this._hScrollNone=true;
							this._maskHeight+=this._vtScrollBar.height;
						}
					}
					else {
						if(this._hScrollNone){
							this._hScrollNone=false;
							this._maskHeight-=this._vtScrollBar.height;
						}
					}
				}
			}
			if(this._vtScrollBar){
				if(this._maskHeight < this._vtScrollBar.minSize)
					this._vtScrollBar.displayObject.visible=false;
				else {
					this._vtScrollBar.displayObject.visible=this._scrollBarVisible && !this._vScrollNone;
					if(this._contentHeight==0)
						this._vtScrollBar.displayPerc=0;
					else
					this._vtScrollBar.displayPerc=Math.min(1,this._maskHeight / this._contentHeight);
				}
			}
			if(this._hzScrollBar){
				if(this._maskWidth < this._hzScrollBar.minSize)
					this._hzScrollBar.displayObject.visible=false;
				else {
					this._hzScrollBar.displayObject.visible=this._scrollBarVisible && !this._hScrollNone;
					if(this._contentWidth==0)
						this._hzScrollBar.displayPerc=0;
					else
					this._hzScrollBar.displayPerc=Math.min(1,this._maskWidth / this._contentWidth);
				}
			}
			if(this._maskHolder.mask==null){
				this._maskHolder.mask=new Sprite();
				this._maskHolder.mask.graphics.drawRect(0,0,this._maskWidth,this._maskHeight,"#000000");
			}
			else {
				this._maskHolder.mask.graphics.clear();
				this._maskHolder.mask.graphics.drawRect(0,0,this._maskWidth,this._maskHeight,"#000000");
			}
			this._xOverlap=Math.max(0,this._contentWidth-this._maskWidth);
			this._yOverlap=Math.max(0,this._contentHeight-this._maskHeight);
			switch(this._scrollType){
				case 2:
					if(this._contentWidth > this._maskWidth && this._contentHeight <=this._maskHeight){
						this._hScroll=true;
						this._vScroll=false;
					}
					else if(this._contentWidth <=this._maskWidth && this._contentHeight > this._maskHeight){
						this._hScroll=false;
						this._vScroll=true;
					}
					else if(this._contentWidth > this._maskWidth && this._contentHeight > this._maskHeight){
						this._hScroll=true;
						this._vScroll=true;
					}
					else {
						this._hScroll=false;
						this._vScroll=false;
					}
					break ;
				case 1:
					if(this._contentHeight > this._maskHeight){
						this._hScroll=false;
						this._vScroll=true;
					}
					else {
						this._hScroll=false;
						this._vScroll=false;
					}
					break ;
				case 0:
					if(this._contentWidth > this._maskWidth){
						this._hScroll=true;
						this._vScroll=false;
					}
					else {
						this._hScroll=false;
						this._vScroll=false;
					}
					break ;
				}
		}

		__proto.posChanged=function(ani){
			if (this._aniFlag)
				this._aniFlag=ani;
			this._needRefresh=true;
			Laya.timer.callLater(this,this.refresh);
			if(this._tweening==2){
				this.killTweens();
			}
		}

		__proto.refresh=function(){
			this._needRefresh=false;
			Laya.timer.clear(this,this.refresh);
			var contentYLoc=0;
			var contentXLoc=0;
			if (this._vScroll)
				contentYLoc=this._yPerc *(this._contentHeight-this._maskHeight);
			if (this._hScroll)
				contentXLoc=this._xPerc *(this._contentWidth-this._maskWidth);
			if(this._pageMode){
				var page=NaN;
				var delta=NaN;
				if(this._vScroll && this._yPerc !=1 && this._yPerc !=0){
					page=Math.floor(contentYLoc / this._pageSizeV);
					delta=contentYLoc-page *this._pageSizeV;
					if(delta > this._pageSizeV / 2)
						page++;
					contentYLoc=page *this._pageSizeV;
					if(contentYLoc > this._contentHeight-this._maskHeight){
						contentYLoc=this._contentHeight-this._maskHeight;
						this._yPerc=1;
					}
					else
					this._yPerc=contentYLoc / (this._contentHeight-this._maskHeight);
				}
				if(this._hScroll && this._xPerc !=1 && this._xPerc !=0){
					page=Math.floor(contentXLoc / this._pageSizeH);
					delta=contentXLoc-page *this._pageSizeH;
					if(delta > this._pageSizeH / 2)
						page++;
					contentXLoc=page *this._pageSizeH;
					if(contentXLoc > this._contentWidth-this._maskWidth){
						contentXLoc=this._contentWidth-this._maskWidth;
						this._xPerc=1;
					}
					else
					this._xPerc=contentXLoc / (this._contentWidth-this._maskWidth);
				}
			}
			else if(this._snapToItem){
				var pt=this._owner.getSnappingPosition(contentXLoc,contentYLoc,fairygui.ScrollPane.sHelperPoint);
				if(this._xPerc !=1 && pt.x !=contentXLoc){
					this._xPerc=pt.x / (this._contentWidth-this._maskWidth);
					if(this._xPerc > 1)
						this._xPerc=1;
					contentXLoc=this._xPerc *(this._contentWidth-this._maskWidth);
				}
				if(this._yPerc !=1 && pt.y !=contentYLoc){
					this._yPerc=pt.y / (this._contentHeight-this._maskHeight);
					if(this._yPerc > 1)
						this._yPerc=1;
					contentYLoc=this._yPerc *(this._contentHeight-this._maskHeight);
				}
			}
			this.refresh2(contentXLoc,contentYLoc);
			Events.dispatch("fui_scroll",this._container);
			if(this._needRefresh){
				this._needRefresh=false;
				Laya.timer.clear(this,this.refresh);
				if(this._hScroll)
					contentXLoc=this._xPerc *(this._contentWidth-this._maskWidth);
				if(this._vScroll)
					contentYLoc=this._yPerc *(this._contentHeight-this._maskHeight);
				this.refresh2(contentXLoc,contentYLoc);
			}
			this._aniFlag=true;
		}

		__proto.refresh2=function(contentXLoc,contentYLoc){
			contentXLoc=Math.floor(contentXLoc);
			contentYLoc=Math.floor(contentYLoc);
			if(this._aniFlag && !this._isMouseMoved){
				var toX=this._maskContentHolder.x;
				var toY=this._maskContentHolder.y;
				if(this._vScroll){
					toY=-contentYLoc;
				}
				else {
					if(this._maskContentHolder.y !=0)
						this._maskContentHolder.y=0;
				}
				if(this._hScroll){
					toX=-contentXLoc;
				}
				else {
					if(this._maskContentHolder.x !=0)
						this._maskContentHolder.x=0;
				}
				if(toX !=this._maskContentHolder.x || toY !=this._maskContentHolder.y){
					this.killTweens();
					this._maskHolder.mouseEnabled=false;
					this._tweening=1;
					this._tweener=Tween.to(this._maskContentHolder,
					{x:toX,y:toY },
					500,
					fairygui.ScrollPane._easeTypeFunc,
					Handler.create(this,this.__tweenComplete));
					this._tweener.update=Handler.create(this,this.__tweenUpdate,null,false);
				}
			}
			else {
				this.killTweens();
				if(this._isMouseMoved){
					this._xOffset+=this._maskContentHolder.x-(-contentXLoc);
					this._yOffset+=this._maskContentHolder.y-(-contentYLoc);
				}
				this._maskContentHolder.pos(-contentXLoc,-contentYLoc);
				if(this._isMouseMoved){
					this._y1=this._y2=this._maskContentHolder.y;
					this._x1=this._x2=this._maskContentHolder.x;
				}
				if(this._vtScrollBar)
					this._vtScrollBar.scrollPerc=this._yPerc;
				if(this._hzScrollBar)
					this._hzScrollBar.scrollPerc=this._xPerc;
			}
		}

		__proto.killTweens=function(){
			if(this._tweening==1){
				this._tweening=0;
				this._tweener.clear();
				this._maskHolder.mouseEnabled=true;
				this.onScrollEnd();
			}
			else if(this._tweening==2){
				this._tweening=0;
				this._tweener.clear();
				this._tweenHelper.value=1;
				this.__tweenUpdate2();
				this._maskHolder.mouseEnabled=true;
				this.onScrollEnd();
			}
		}

		__proto.calcYPerc=function(){
			if (!this._vScroll)
				return 0;
			var diff=this._contentHeight-this._maskHeight;
			var my=this._maskContentHolder.y;
			var currY=NaN;
			if(my > 0)
				currY=0;
			else if(-my > diff)
			currY=diff;
			else
			currY=-my;
			return currY / diff;
		}

		__proto.calcXPerc=function(){
			if (!this._hScroll)
				return 0;
			var diff=this._contentWidth-this._maskWidth;
			var currX=NaN;
			var mx=this._maskContentHolder.x;
			if (mx > 0)
				currX=0;
			else if (-mx > diff)
			currX=diff;
			else
			currX=-mx;
			return currX / diff;
		}

		__proto.onScrolling=function(){
			if (this._vtScrollBar){
				this._vtScrollBar.scrollPerc=this.calcYPerc();
				if (this._scrollBarDisplayAuto)
					this.showScrollBar(true);
			}
			if (this._hzScrollBar){
				this._hzScrollBar.scrollPerc=this.calcXPerc();
				if (this._scrollBarDisplayAuto)
					this.showScrollBar(true);
			}
		}

		__proto.onScrollEnd=function(){
			if (this._vtScrollBar){
				if (this._scrollBarDisplayAuto)
					this.showScrollBar(false);
			}
			if (this._hzScrollBar){
				if (this._scrollBarDisplayAuto)
					this.showScrollBar(false);
			}
		}

		__proto.__mouseDown=function(){
			if (!this._touchEffect)
				return;
			this.killTweens();
			this._owner.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.ScrollPane.sHelperPoint);
			this._x1=this._x2=this._maskContentHolder.x;
			this._y1=this._y2=this._maskContentHolder.y;
			this._xOffset=fairygui.ScrollPane.sHelperPoint.x-this._maskContentHolder.x;
			this._yOffset=fairygui.ScrollPane.sHelperPoint.y-this._maskContentHolder.y;
			this._time1=this._time2=Laya.timer.currTimer;
			this._holdAreaPoint.x=fairygui.ScrollPane.sHelperPoint.x;
			this._holdAreaPoint.y=fairygui.ScrollPane.sHelperPoint.y;
			this._isHoldAreaDone=false;
			this._isMouseMoved=false;
			this._owner.displayObject.stage.on("mousemove",this,this.__mouseMove);
			this._owner.displayObject.stage.on("mouseup",this,this.__mouseUp);
			this._owner.displayObject.stage.on("click",this,this.__click);
		}

		__proto.__mouseMove=function(){
			var sensitivity=UIConfig1.touchScrollSensitivity;
			var diff=NaN;
			var sv=false,sh=false,st=false;
			var pt=this._owner.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.ScrollPane.sHelperPoint);
			if (this._scrollType==1){
				if (!this._isHoldAreaDone){
					diff=Math.abs(this._holdAreaPoint.y-pt.y);
					if(diff < sensitivity)
						return;
				}
				sv=true;
			}
			else if (this._scrollType==0){
				if (!this._isHoldAreaDone){
					diff=Math.abs(this._holdAreaPoint.x-pt.x);
					if(diff < sensitivity)
						return;
				}
				sh=true;
			}
			else {
				if (!this._isHoldAreaDone){
					diff=Math.abs(this._holdAreaPoint.y-pt.y);
					if(diff < sensitivity){
						diff=Math.abs(this._holdAreaPoint.x-pt.x);
						if(diff < sensitivity)
							return;
					}
				}
				sv=sh=true;
			};
			var t=Laya.timer.currTimer;
			if (t-this._time2 > 50){
				this._time2=this._time1;
				this._time1=t;
				st=true;
			}
			if (sv){
				var y=Math.floor(pt.y-this._yOffset);
				if (y > 0){
					if (!this._bouncebackEffect)
						this._maskContentHolder.y=0;
					else
					this._maskContentHolder.y=Math.floor(y *0.5);
				}
				else if (y <-this._yOverlap){
					if (!this._bouncebackEffect)
						this._maskContentHolder.y=-Math.floor(this._yOverlap);
					else
					this._maskContentHolder.y=Math.floor((y-this._yOverlap)*0.5);
				}
				else {
					this._maskContentHolder.y=y;
				}
				if (st){
					this._y2=this._y1;
					this._y1=this._maskContentHolder.y;
				}
				this._yPerc=this.calcYPerc();
			}
			if (sh){
				var x=Math.floor(pt.x-this._xOffset);
				if (x > 0){
					if (!this._bouncebackEffect)
						this._maskContentHolder.x=0;
					else
					this._maskContentHolder.x=Math.floor(x *0.5);
				}
				else if (x < 0-this._xOverlap){
					if (!this._bouncebackEffect)
						this._maskContentHolder.x=-Math.floor(this._xOverlap);
					else
					this._maskContentHolder.x=Math.floor((x-this._xOverlap)*0.5);
				}
				else {
					this._maskContentHolder.x=x;
				}
				if (st){
					this._x2=this._x1;
					this._x1=this._maskContentHolder.x;
				}
				this._xPerc=this.calcXPerc();
			}
			this._maskHolder.mouseEnabled=false;
			this._isHoldAreaDone=true;
			this._isMouseMoved=true;
			this.onScrolling();
			Events.dispatch("fui_scroll",this._container);
		}

		__proto.__mouseUp=function(){
			this._owner.displayObject.stage.off("mousemove",this,this.__mouseMove);
			this._owner.displayObject.stage.off("mouseup",this,this.__mouseUp);
			this._owner.displayObject.stage.off("click",this,this.__click);
			if (!this._touchEffect){
				this._isMouseMoved=false;
				return;
			}
			if (!this._isMouseMoved)
				return;
			var time=(Laya.timer.currTimer-this._time2)/ 1000;
			if (time==0)
				time=0.001;
			var yVelocity=(this._maskContentHolder.y-this._y2)/ time;
			var xVelocity=(this._maskContentHolder.x-this._x2)/ time;
			var duration=0.3;
			this._tweenHelper.start.x=this._maskContentHolder.x;
			this._tweenHelper.start.y=this._maskContentHolder.y;
			var change1=this._tweenHelper.change1;
			var change2=this._tweenHelper.change2;
			var endX=0;
			var endY=0;
			var page=0;
			var delta=0;
			if (this._scrollType==2 || this._scrollType==0){
				change1.x=TweenHelper.calculateChange(xVelocity,duration);
				change2.x=0;
				endX=this._maskContentHolder.x+change1.x;
				if(this._pageMode){
					page=Math.floor(-endX / this._pageSizeH);
					delta=-endX-page *this._pageSizeH;
					if(change1.x > this._pageSizeH){
						if(delta >=this._pageSizeH / 2)
							page++;
					}
					else if(endX < this._maskContentHolder.x){
						if(delta >=this._pageSizeH / 2)
							page++;
					}
					endX=-page *this._pageSizeH;
					if(endX < this._maskWidth-this._contentWidth)
						endX=this._maskWidth-this._contentWidth;
					change1.x=endX-this._maskContentHolder.x;
				}
			}
			else
			change1.x=change2.x=0;
			if (this._scrollType==2 || this._scrollType==1){
				change1.y=TweenHelper.calculateChange(yVelocity,duration);
				change2.y=0;
				endY=this._maskContentHolder.y+change1.y;
				if(this._pageMode){
					page=Math.floor(-endY / this._pageSizeV);
					delta=-endY-page *this._pageSizeV;
					if(change1.y > this._pageSizeV){
						if(delta >=this._pageSizeV / 2)
							page++;
					}
					else if(endY < this._maskContentHolder.y){
						if(delta >=this._pageSizeV / 2)
							page++;
					}
					endY=-page *this._pageSizeV;
					if(endY < this._maskHeight-this._contentHeight)
						endY=this._maskHeight-this._contentHeight;
					change1.y=endY-this._maskContentHolder.y;
				}
			}
			else
			change1.y=change2.y=0;
			if (this._snapToItem){
				endX=-endX;
				endY=-endY;
				var pt=this._owner.getSnappingPosition(endX,endY,fairygui.ScrollPane.sHelperPoint);
				endX=-pt.x;
				endY=-pt.y;
				change1.x=endX-this._maskContentHolder.x;
				change1.y=endY-this._maskContentHolder.y;
			}
			if(this._bouncebackEffect){
				if(endX > 0)
					change2.x=0-this._maskContentHolder.x-change1.x;
				else if(endX <-this._xOverlap)
				change2.x=-this._xOverlap-this._maskContentHolder.x-change1.x;
				if(endY > 0)
					change2.y=0-this._maskContentHolder.y-change1.y;
				else if(endY <-this._yOverlap)
				change2.y=-this._yOverlap-this._maskContentHolder.y-change1.y;
			}
			else {
				if(endX > 0)
					change1.x=0-this._maskContentHolder.x;
				else if(endX <-this._xOverlap)
				change1.x=-this._xOverlap-this._maskContentHolder.x;
				if(endY > 0)
					change1.y=0-this._maskContentHolder.y;
				else if(endY <-this._yOverlap)
				change1.y=-this._yOverlap-this._maskContentHolder.y;
			}
			this._tweenHelper.value=0;
			this._tweenHelper.change1=change1;
			this._tweenHelper.change2=change2;
			this.killTweens();
			this._tweening=2;
			this._tweener=Tween.to(this._tweenHelper,{value:1 },
			duration *1000,
			fairygui.ScrollPane._easeTypeFunc,
			Handler.create(this,this.__tweenComplete2));
			this._tweener.update=Handler.create(this,this.__tweenUpdate2,null,false);
		}

		__proto.__click=function(){
			this._isMouseMoved=false;
		}

		__proto.__mouseWheel=function(evt){
			if(!this._mouseWheelEnabled)
				return;
			var pt=this._owner.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.ScrollPane.sHelperPoint);
			var delta=evt["delta"];
			if(this._hScroll && !this._vScroll){
				if(delta<0)
					this.setPercX(this._xPerc+this.getDeltaX(this._mouseWheelSpeed),false);
				else
				this.setPercX(this._xPerc-this.getDeltaX(this._mouseWheelSpeed),false);
			}
			else {
				if(delta<0)
					this.setPercY(this._yPerc+this.getDeltaY(this._mouseWheelSpeed),false);
				else
				this.setPercY(this._yPerc-this.getDeltaY(this._mouseWheelSpeed),false);
			}
		}

		__proto.__rollOver=function(){
			this.showScrollBar(true);
		}

		__proto.__rollOut=function(){
			this.showScrollBar(false);
		}

		__proto.showScrollBar=function(val){
			if (val){
				this.__showScrollBar(true);
				Laya.timer.clear(this,this.__showScrollBar);
			}
			else
			Laya.timer.once(500,this,this.__showScrollBar,[val]);
		}

		__proto.__showScrollBar=function(val){
			this._scrollBarVisible=val && this._maskWidth > 0 && this._maskHeight > 0;
			if (this._vtScrollBar)
				this._vtScrollBar.displayObject.visible=this._scrollBarVisible && !this._vScrollNone;
			if (this._hzScrollBar)
				this._hzScrollBar.displayObject.visible=this._scrollBarVisible && !this._hScrollNone;
		}

		__proto.__tweenUpdate=function(){
			this.onScrolling();
		}

		__proto.__tweenComplete=function(){
			this._tweening=0;
			this._maskHolder.mouseEnabled=true;
			this.onScrollEnd();
		}

		__proto.__tweenUpdate2=function(){
			this._maskContentHolder.pos(Math.floor(this._tweenHelper.start.x+this._tweenHelper.change1.x *this._tweenHelper.value
			+this._tweenHelper.change2.x *this._tweenHelper.value *this._tweenHelper.value),
			Math.floor(this._tweenHelper.start.y+this._tweenHelper.change1.y *this._tweenHelper.value
			+this._tweenHelper.change2.y *this._tweenHelper.value *this._tweenHelper.value));
			if (this._scrollType==1)
				this._yPerc=this.calcYPerc();
			else if (this._scrollType==0)
			this._xPerc=this.calcXPerc();
			else {
				this._yPerc=this.calcYPerc();
				this._xPerc=this.calcXPerc();
			}
			this.onScrolling();
			Events.dispatch("fui_scroll",this._container);
		}

		__proto.__tweenComplete2=function(){
			if(this._tweening==0)
				return;
			this._tweening=0;
			if (this._scrollType==1)
				this._yPerc=this.calcYPerc();
			else if (this._scrollType==0)
			this._xPerc=this.calcXPerc();
			else {
				this._yPerc=this.calcYPerc();
				this._xPerc=this.calcXPerc();
			}
			this._maskHolder.mouseEnabled=true;
			this.onScrollEnd();
			Events.dispatch("fui_scroll",this._container);
		}

		__getset(0,__proto,'owner',function(){
			return this._owner;
		});

		__getset(0,__proto,'bouncebackEffect',function(){
			return this._bouncebackEffect;
			},function(sc){
			this._bouncebackEffect=sc;
		});

		__getset(0,__proto,'scrollSpeed',function(){
			return this._scrollSpeed;
			},function(val){
			this._scrollSpeed=this.scrollSpeed;
			if (this._scrollSpeed==0)
				this._scrollSpeed=UIConfig1.defaultScrollSpeed;
			this._mouseWheelSpeed=this._scrollSpeed *2;
		});

		__getset(0,__proto,'snapToItem',function(){
			return this._snapToItem;
			},function(value){
			this._snapToItem=value;
		});

		__getset(0,__proto,'touchEffect',function(){
			return this._touchEffect;
			},function(sc){
			this._touchEffect=sc;
		});

		__getset(0,__proto,'percX',function(){
			return this._xPerc;
			},function(sc){
			this.setPercX(sc,false);
		});

		__getset(0,__proto,'percY',function(){
			return this._yPerc;
			},function(sc){
			this.setPercY(sc,false);
		});

		__getset(0,__proto,'posX',function(){
			return this._xPerc *Math.max(0,this.contentWidth-this._maskWidth);
			},function(val){
			this.setPosX(val,false);
		});

		__getset(0,__proto,'posY',function(){
			return this._yPerc *Math.max(0,this._contentHeight-this._maskHeight);
			},function(val){
			this.setPosY(val,false);
		});

		__getset(0,__proto,'isBottomMost',function(){
			return this._yPerc==1 || this._maskHeight <=this._maskHeight;
		});

		__getset(0,__proto,'isRightMost',function(){
			return this._xPerc==1 || this._contentWidth <=this._maskWidth;
		});

		__getset(0,__proto,'currentPageX',function(){
			return this._pageMode ? Math.floor(this.posX / this._pageSizeH):0;
			},function(value){
			if(this._pageMode && this._hScroll)
				this.setPosX(value *this._pageSizeH,false);
		});

		__getset(0,__proto,'currentPageY',function(){
			return this._pageMode ? Math.floor(this.posY / this._pageSizeV):0;
			},function(value){
			if(this._pageMode && this._hScroll)
				this.setPosY(value *this._pageSizeV,false);
		});

		__getset(0,__proto,'contentWidth',function(){
			return this._contentWidth;
		});

		__getset(0,__proto,'contentHeight',function(){
			return this._contentHeight;
		});

		__getset(0,__proto,'viewWidth',function(){
			return this._maskWidth;
			},function(value){
			value=value+this._owner.margin.left+this._owner.margin.right;
			if (this._vtScrollBar !=null)
				value+=this._vtScrollBar.width;
			this._owner.width=value;
		});

		__getset(0,__proto,'viewHeight',function(){
			return this._maskHeight;
			},function(value){
			value=value+this._owner.margin.top+this._owner.margin.bottom;
			if (this._hzScrollBar !=null)
				value+=this._hzScrollBar.height;
			this._owner.height=value;
		});

		ScrollPane._easeTypeFunc=null
		__static(ScrollPane,
		['sHelperRect',function(){return this.sHelperRect=new Rectangle();},'sHelperPoint',function(){return this.sHelperPoint=new Point();}
		]);
		ScrollPane.__init$=function(){
			//class TweenHelper
			TweenHelper=(function(){
				function TweenHelper(){
					this.value=NaN;
					this.start=null;
					this.change1=null;
					this.change2=null;
					this.start=new Point();
					this.change1=new Point();
					this.change2=new Point();
				}
				__class(TweenHelper,'');
				TweenHelper.calculateChange=function(velocity,duration){
					return (duration *TweenHelper.checkpoint *velocity)/ TweenHelper.easeOutCubic(TweenHelper.checkpoint,0,1,1);
				}
				TweenHelper.easeOutCubic=function(t,b,c,d){
					return c *((t=t / d-1)*t *t+1)+b;
				}
				TweenHelper.checkpoint=0.05;
				return TweenHelper;
			})()
		}

		return ScrollPane;
	})()


	//class fairygui.ScrollType
	var ScrollType=(function(){
		function ScrollType(){}
		__class(ScrollType,'fairygui.ScrollType');
		ScrollType.parse=function(value){
			switch (value){
				case "horizontal":
					return 0;
				case "vertical":
					return 1;
				case "both":
					return 2;
				default :
					return 1;
				}
		}

		ScrollType.Horizontal=0;
		ScrollType.Vertical=1;
		ScrollType.Both=2;
		return ScrollType;
	})()


	//class fairygui.Transition
	var Transition=(function(){
		var TransitionActionType,TransitionItem,TransitionValue;
		function Transition(owner){
			this.name=null;
			this.autoPlay=false;
			this.autoPlayRepeat=1;
			this.autoPlayDelay=0;
			this._owner=null;
			this._ownerBaseX=0;
			this._ownerBaseY=0;
			this._items=null;
			this._totalTimes=0;
			this._totalTasks=0;
			this._playing=false;
			this._onComplete=null;
			this._options=0;
			this._reversed=false;
			this._maxTime=0;
			this.OPTION_IGNORE_DISPLAY_CONTROLLER=1;
			this.FRAME_RATE=24;
			this._owner=owner;
			this._items=[];
		}

		__class(Transition,'fairygui.Transition');
		var __proto=Transition.prototype;
		__proto.play=function(onComplete,times,delay){
			(times===void 0)&& (times=1);
			(delay===void 0)&& (delay=0);
			this._play(onComplete,times,delay,false);
		}

		__proto.playReverse=function(onComplete,times,delay){
			(times===void 0)&& (times=1);
			(delay===void 0)&& (delay=0);
			this._play(onComplete,times,delay,true);
		}

		__proto._play=function(onComplete,times,delay,reversed){
			(times===void 0)&& (times=1);
			(delay===void 0)&& (delay=0);
			(reversed===void 0)&& (reversed=false);
			this.stop();
			if(times==0)
				times=1;
			else if(times==-1)
			times=Number.MAX_VALUE;
			this._totalTimes=times;
			this._reversed=reversed;
			this.internalPlay(delay);
			this._playing=this._totalTasks > 0;
			if(this._playing){
				this._onComplete=onComplete;
				this._owner.internalVisible++;
				if((this._options & this.OPTION_IGNORE_DISPLAY_CONTROLLER)!=0){
					var cnt=this._items.length;
					for(var i=0;i < cnt;i++){
						var item=this._items[i];
						if(item.target !=null && item.target !=this._owner)
							item.target.internalVisible++;
					}
				}
			}
			else if(onComplete !=null){
				onComplete.run();
			}
		}

		__proto.stop=function(setToComplete,processCallback){
			(setToComplete===void 0)&& (setToComplete=true);
			(processCallback===void 0)&& (processCallback=false);
			if(this._playing){
				this._playing=false;
				this._totalTasks=0;
				this._totalTimes=0;
				var handler=this._onComplete;
				this._onComplete=null;
				this._owner.internalVisible--;
				var cnt=this._items.length;
				var i=NaN;
				var item;
				if(this._reversed){
					for(i=cnt-1;i>=0;i--){
						item=this._items[i];
						if(item.target==null)
							continue ;
						this.stopItem(item,setToComplete);
					}
				}
				else {
					for(i=0;i < cnt;i++){
						item=this._items[i];
						if(item.target==null)
							continue ;
						this.stopItem(item,setToComplete);
					}
				}
				if(processCallback && handler !=null){
					handler.run();
				}
			}
		}

		__proto.stopItem=function(item,setToComplete){
			if((this._options & this.OPTION_IGNORE_DISPLAY_CONTROLLER)!=0){
				if(item.target !=this._owner)
					item.target.internalVisible--;
			}
			if(item.completed)
				return;
			if(item.tweener !=null){
				item.tweener.clear();
				item.tweener=null;
			}
			if(item.type==11){
				var trans=(item.target).getTransition(item.value.s);
				if(trans !=null)
					trans.stop(setToComplete,false);
			}
			else if(item.type==12){
				Laya.timer.clear(item,item.__shake);
				item.target._gearLocked=true;
				item.target.setXY(item.target.x-item.startValue.f1,item.target.y-item.startValue.f2);
				item.target._gearLocked=false;
			}
			else {
				if(setToComplete){
					if(item.tween){
						if(!item.yoyo || item.repeat % 2==0)
							this.applyValue(item,this._reversed?item.startValue:item.endValue);
						else
						this.applyValue(item,this._reversed?item.endValue:item.startValue);
					}
					else if(item.type !=10)
					this.applyValue(item,item.value);
				}
			}
		}

		__proto.setValue=function(label,__args){
			var args=[];for(var i=1,sz=arguments.length;i<sz;i++)args.push(arguments[i]);
			var cnt=this._items.length;
			var value;
			for(var i=0;i < cnt;i++){
				var item=this._items[i];
				if(item.label==null && item.label2==null)
					continue ;
				if(item.label==label){
					if(item.tween)
						value=item.startValue;
					else
					value=item.value;
				}
				else if(item.label2==label){
					value=item.endValue;
				}
				else
				continue ;
				switch(item.type){
					case 0:
					case 1:
					case 3:
					case 2:
						value.b1=true;
						value.b2=true;
						value.f1=parseFloat(args[0]);
						value.f2=parseFloat(args[1]);
						break ;
					case 4:
						value.f1=parseFloat(args[0]);
						break ;
					case 5:
						value.i=parseInt(args[0]);
						break ;
					case 6:
						value.s=args[0];
						break ;
					case 7:
						value.i=parseInt(args[0]);
						if(args.length > 1)
							value.b=args[1];
						break ;
					case 8:
						value.b=args[0];
						break ;
					case 9:
						value.s=args[0];
						break ;
					case 10:
						value.s=args[0];
						if(args.length > 1)
							value.f1=parseFloat(args[1]);
						break ;
					case 11:
						value.s=args[0];
						if(args.length > 1)
							value.i=parseInt(args[1]);
						break ;
					case 12:
						value.f1=parseFloat(args[0]);
						if(args.length > 1)
							value.f2=parseFloat(args[1]);
						break ;
					}
			}
		}

		__proto.setHook=function(label,callback){
			var cnt=this._items.length;
			for(var i=0;i < cnt;i++){
				var item=this._items[i];
				if(item.label==null && item.label2==null)
					continue ;
				if(item.label==label)
					item.hook=callback;
				else if(item.label2==label)
				item.hook2=callback;
			}
		}

		__proto.clearHooks=function(){
			var cnt=this._items.length;
			for(var i=0;i < cnt;i++){
				var item=this._items[i];
				item.hook=null;
				item.hook2=null;
			}
		}

		__proto.setTarget=function(label,newTarget){
			var cnt=this._items.length;
			var value;
			for(var i=0;i < cnt;i++){
				var item=this._items[i];
				if(item.label==null && item.label2==null)
					continue ;
				item.targetId=newTarget.id;
			}
		}

		__proto.updateFromRelations=function(targetId,dx,dy){
			var cnt=this._items.length;
			if(cnt==0)
				return;
			for(var i=0;i < cnt;i++){
				var item=this._items[i];
				if(item.type==0 && item.targetId==targetId){
					if(item.tween){
						item.startValue.f1+=dx;
						item.startValue.f2+=dy;
						item.endValue.f1+=dx;
						item.endValue.f2+=dy;
					}
					else {
						item.value.f1+=dx;
						item.value.f2+=dy;
					}
				}
			}
		}

		__proto.internalPlay=function(delay){
			(delay===void 0)&& (delay=0);
			this._ownerBaseX=this._owner.x;
			this._ownerBaseY=this._owner.y;
			this._totalTasks=0;
			var cnt=this._items.length;
			var startTime=NaN;
			var item;
			for(var i=0;i < cnt;i++){
				item=this._items[i];
				if(item.targetId)
					item.target=this._owner.getChildById(item.targetId);
				else
				item.target=this._owner;
				if(item.target==null)
					continue ;
				if(item.tween){
					if(this._reversed)
						startTime=delay+(this._maxTime-item.time-item.duration)*1000;
					else
					startTime=delay+item.time *1000;
					item.completed=false;
					this._totalTasks++;
					if(startTime==0)
						this.startTween(item);
					else {
						item.tweener=Tween.to(item.value,{},startTime,null,Handler.create(this,this.__delayCall,[item]));
						item.tweener.update=null;
					}
				}
				else {
					if(this._reversed)
						startTime=delay+(this._maxTime-item.time)*1000;
					else
					startTime=delay+item.time *1000;
					if(startTime==0)
						this.applyValue(item,item.value);
					else {
						item.completed=false;
						this._totalTasks++;
						item.tweener=Tween.to(item.value,{},startTime,null,Handler.create(this,this.__delayCall2,[item]));
						item.tweener.update=null;
					}
				}
			}
		}

		__proto.prepareValue=function(item,toProps,reversed){
			(reversed===void 0)&& (reversed=false);
			if(!reversed){
				switch(item.type){
					case 0:
						if(item.target==this._owner){
							if(!item.startValue.b1)
								item.startValue.f1=0;
							if(!item.startValue.b2)
								item.startValue.f2=0;
						}
						else {
							if(!item.startValue.b1)
								item.startValue.f1=item.target.x;
							if(!item.startValue.b2)
								item.startValue.f2=item.target.y;
						}
						item.value.f1=item.startValue.f1;
						item.value.f2=item.startValue.f2;
						if(!item.endValue.b1)
							item.endValue.f1=item.value.f1;
						if(!item.endValue.b2)
							item.endValue.f2=item.value.f2;
						toProps.f1=item.endValue.f1;
						toProps.f2=item.endValue.f2;
						break ;
					case 1:
						if(!item.startValue.b1)
							item.startValue.f1=item.target.width;
						if(!item.startValue.b2)
							item.startValue.f2=item.target.height;
						item.value.f1=item.startValue.f1;
						item.value.f2=item.startValue.f2;
						if(!item.endValue.b1)
							item.endValue.f1=item.value.f1;
						if(!item.endValue.b2)
							item.endValue.f2=item.value.f2;
						toProps.f1=item.endValue.f1;
						toProps.f2=item.endValue.f2;
						break ;
					case 2:
						item.value.f1=item.startValue.f1;
						item.value.f2=item.startValue.f2;
						toProps.f1=item.endValue.f1;
						toProps.f2=item.endValue.f2;
						break ;
					case 4:
						item.value.f1=item.startValue.f1;
						toProps.f1=item.endValue.f1;
						break ;
					case 5:
						item.value.i=item.startValue.i;
						toProps.i=item.endValue.i;
						break ;
					}
			}
			else {
				switch(item.type){
					case 0:
					case 1:
					case 2:
						toProps.f1=item.startValue.f1;
						toProps.f2=item.startValue.f2;
					case 4:
						toProps.f1=item.startValue.f1;
						break ;
					case 5:
						toProps.i=item.startValue.i;
						break ;
					}
			}
			toProps.dummy=0;
		}

		__proto.startTween=function(item){
			var toProps={};
			this.prepareValue(item,toProps,this._reversed);
			this.applyValue(item,item.value);
			var completeHandler;
			if(item.repeat!=0){
				item.tweenTimes=0;
				completeHandler=Handler.create(this,this.__tweenRepeatComplete,[item]);
			}
			else
			completeHandler=Handler.create(this,this.__tweenComplete,[item]);
			item.tweener=Tween.to(item.value,
			toProps,
			item.duration*1000,
			item.easeType,
			completeHandler);
			item.tweener.update=Handler.create(this,this.__tweenUpdate,[item],false);
			if(item.hook !=null)
				item.hook.run();
		}

		__proto.__delayCall=function(item){
			item.tweener=null;
			this.startTween(item);
		}

		__proto.__delayCall2=function(item){
			item.tweener=null;
			this._totalTasks--;
			item.completed=true;
			this.applyValue(item,item.value);
			if(item.hook !=null)
				item.hook.run();
			this.checkAllComplete();
		}

		__proto.__tweenUpdate=function(item){
			this.applyValue(item,item.value);
		}

		__proto.__tweenComplete=function(item){
			item.tweener=null;
			this._totalTasks--;
			item.completed=true;
			if(item.hook2 !=null)
				item.hook2.run();
			this.checkAllComplete();
		}

		__proto.__tweenRepeatComplete=function(item){
			item.tweenTimes++;
			if(item.repeat==-1 || item.tweenTimes < item.repeat+1){
				var toProps={};
				var reversed=false;
				if(item.yoyo){
					if(this._reversed)
						reversed=item.tweenTimes % 2==0;
					else
					reversed=item.tweenTimes % 2==1;
				}
				else
				reversed=this._reversed;
				this.prepareValue(item,toProps,reversed);
				item.tweener=Tween.to(item.value,
				toProps,
				item.duration *1000,
				item.easeType,
				Handler.create(this,this.__tweenRepeatComplete,[item]));
				item.tweener.update=Handler.create(this,this.__tweenUpdate,[item],false);
			}
			else
			this.__tweenComplete(item);
		}

		__proto.__playTransComplete=function(item){
			this._totalTasks--;
			item.completed=true;
			this.checkAllComplete();
		}

		__proto.checkAllComplete=function(){
			if(this._playing && this._totalTasks==0){
				if(this._totalTimes < 0){
					Laya.timer.callLater(this,this.internalPlay);
				}
				else {
					this._totalTimes--;
					if(this._totalTimes > 0)
						Laya.timer.callLater(this,this.internalPlay);
					else {
						this._playing=false;
						this._owner.internalVisible--;
						var cnt=this._items.length;
						if((this._options & this.OPTION_IGNORE_DISPLAY_CONTROLLER)!=0){
							for(var i=0;i < cnt;i++){
								var item=this._items[i];
								if(item.target !=null && item.target !=this._owner)
									item.target.internalVisible--;
							}
						}
						if(this._onComplete !=null){
							var handler=this._onComplete;
							this._onComplete=null;
							handler.run();
						}
					}
				}
			}
		}

		__proto.applyValue=function(item,value){
			item.target._gearLocked=true;
			switch(item.type){
				case 0:
					if(item.target==this._owner){
						var f1=0,f2=0;
						if(!value.b1)
							f1=item.target.x;
						else
						f1=value.f1+this._ownerBaseX;
						if(!value.b2)
							f2=item.target.y;
						else
						f2=value.f2+this._ownerBaseY;
						item.target.setXY(f1,f2);
					}
					else {
						if(!value.b1)
							value.f1=item.target.x;
						if(!value.b2)
							value.f2=item.target.y;
						item.target.setXY(value.f1,value.f2);
					}
					break ;
				case 1:
					if(!value.b1)
						value.f1=item.target.width;
					if(!value.b2)
						value.f2=item.target.height;
					item.target.setSize(value.f1,value.f2);
					break ;
				case 3:
					item.target.setPivot(value.f1,value.f2);
					break ;
				case 4:
					item.target.alpha=value.f1;
					break ;
				case 5:
					item.target.rotation=value.i;
					break ;
				case 2:
					item.target.setScale(value.f1,value.f2);
					break ;
				case 6:
					(item.target).color=value.s;
					break ;
				case 7:
					if(!value.b1)
						value.i=(item.target).frame;
					(item.target).frame=value.i;
					(item.target).playing=value.b;
					break ;
				case 8:
					item.target.visible=value.b;
					break ;
				case 9:;
					var arr=value.s.split(",");
					var len=arr.length;
					for(var i=0;i < len;i++){
						var str=arr[i];
						var arr2=str.split("=");
						var cc=(item.target).getController(arr2[0]);
						if(cc){
							str=arr2[1];
							if(str.charAt(0)=="$"){
								str=str.substring(1);
								cc.selectedPage=str;
							}
							else
							cc.selectedIndex=parseInt(str);
						}
					}
					break ;
				case 11:;
					var trans=(item.target).getTransition(value.s);
					if(trans !=null){
						if(value.i==0)
							trans.stop(false,true);
						else if(trans.playing)
						trans._totalTimes=value.i==-1?Number.MAX_VALUE:value.i;
						else {
							item.completed=false;
							this._totalTasks++;
							if(this._reversed)
								trans.playReverse(Handler.create(this,this.__playTransComplete,[item]),item.value.i);
							else
							trans.play(Handler.create(this,this.__playTransComplete,[item]),item.value.i);
						}
					}
					break ;
				case 10:;
					var pi=UIPackage.getItemByURL(value.s);
					if(pi){
						var sound=(pi.owner.getItemAsset(pi));
						if(sound)
							GRoot.inst.playOneShotSound(sound,value.f1);
					}
					break ;
				case 12:
					item.startValue.f1=0;
					item.startValue.f2=0;
					item.startValue.f3=item.value.f2;
					item.startValue.i=Laya.timer.currTimer;
					Laya.timer.frameLoop(1,item,item.__shake,[this]);
					this._totalTasks++;
					item.completed=false;
					break ;
				}
			item.target._gearLocked=false;
		}

		__proto.__shakeItem=function(item){
			var r=Math.ceil(item.value.f1 *item.startValue.f3 / item.value.f2);
			var rx=(Math.random()*2-1)*r;
			var ry=(Math.random()*2-1)*r;
			rx=rx > 0 ? Math.ceil(rx):Math.floor(rx);
			ry=ry > 0 ? Math.ceil(ry):Math.floor(ry);
			item.target._gearLocked=true;
			item.target.setXY(item.target.x-item.startValue.f1+rx,item.target.y-item.startValue.f2+ry);
			item.target._gearLocked=false;
			item.startValue.f1=rx;
			item.startValue.f2=ry;
			var t=Laya.timer.currTimer;
			item.startValue.f3-=(t-item.startValue.i)/ 1000;
			item.startValue.i=t;
			if(item.startValue.f3 <=0){
				item.target._gearLocked=true;
				item.target.setXY(item.target.x-item.startValue.f1,item.target.y-item.startValue.f2);
				item.target._gearLocked=false;
				item.completed=true;
				this._totalTasks--;
				Laya.timer.clear(item,item.__shake);
				this.checkAllComplete();
			}
		}

		__proto.setup=function(xml){
			this.name=xml.getAttribute("name");
			var str=xml.getAttribute("options");
			if(str)
				this._options=parseInt(str);
			str=xml.getAttribute("autoPlay");
			if(str)
				this.autoPlay=str=="true";
			if(this.autoPlay){
				str=xml.getAttribute("autoPlayRepeat");
				if(str)
					this.autoPlayRepeat=parseInt(str);
				str=xml.getAttribute("autoPlayDelay");
				if(str)
					this.autoPlayDelay=parseFloat(str);
			};
			var col=xml.childNodes;
			var length1=col.length;
			for(var i1=0;i1 < length1;i1++){
				var cxml=col[i1];
				if(cxml.nodeName!="item")
					continue ;
				var item=new TransitionItem();
				this._items.push(item);
				item.time=parseInt(cxml.getAttribute("time"))/ this.FRAME_RATE;
				item.targetId=cxml.getAttribute("target");
				str=cxml.getAttribute("type");
				switch(str){
					case "XY":
						item.type=0;
						break ;
					case "Size":
						item.type=1;
						break ;
					case "Scale":
						item.type=2;
						break ;
					case "Pivot":
						item.type=3;
						break ;
					case "Alpha":
						item.type=4;
						break ;
					case "Rotation":
						item.type=5;
						break ;
					case "Color":
						item.type=6;
						break ;
					case "Animation":
						item.type=7;
						break ;
					case "Visible":
						item.type=8;
						break ;
					case "Controller":
						item.type=9;
						break ;
					case "Sound":
						item.type=10;
						break ;
					case "Transition":
						item.type=11;
						break ;
					case "Shake":
						item.type=12;
						break ;
					default :
						item.type=13;
						break ;
					}
				item.tween=cxml.getAttribute("tween")=="true";
				item.label=cxml.getAttribute("label");
				if(item.tween){
					item.duration=parseInt(cxml.getAttribute("duration"))/ this.FRAME_RATE;
					if(item.time+item.duration > this._maxTime)
						this._maxTime=item.time+item.duration;
					str=cxml.getAttribute("ease");
					if(str)
						item.easeType=ToolSet.parseEaseType(str);
					str=cxml.getAttribute("repeat");
					if(str)
						item.repeat=parseInt(str);
					item.yoyo=cxml.getAttribute("yoyo")=="true";
					item.label2=cxml.getAttribute("label2");
					var v=cxml.getAttribute("endValue");
					if(v){
						this.decodeValue(item.type,cxml.getAttribute("startValue"),item.startValue);
						this.decodeValue(item.type,v,item.endValue);
					}
					else {
						item.tween=false;
						this.decodeValue(item.type,cxml.getAttribute("startValue"),item.value);
					}
				}
				else {
					if(item.time > this._maxTime)
						this._maxTime=item.time;
					this.decodeValue(item.type,cxml.getAttribute("value"),item.value);
				}
			}
		}

		__proto.decodeValue=function(type,str,value){
			var arr;
			switch(type){
				case 0:
				case 1:
				case 3:
					arr=str.split(",");
					if(arr[0]=="-"){
						value.b1=false;
					}
					else {
						value.f1=parseFloat(arr[0]);
						value.b1=true;
					}
					if(arr[1]=="-"){
						value.b2=false;
					}
					else {
						value.f2=parseFloat(arr[1]);
						value.b2=true;
					}
					break ;
				case 4:
					value.f1=parseFloat(str);
					break ;
				case 5:
					value.i=parseInt(str);
					break ;
				case 2:
					arr=str.split(",");
					value.f1=parseFloat(arr[0]);
					value.f2=parseFloat(arr[1]);
					break ;
				case 6:
					value.s=str;
					break ;
				case 7:
					arr=str.split(",");
					if(arr[0]=="-"){
						value.b1=false;
					}
					else {
						value.i=parseInt(arr[0]);
						value.b1=true;
					}
					value.b=arr[1]=="p";
					break ;
				case 8:
					value.b=str=="true";
					break ;
				case 9:
					value.s=str;
					break ;
				case 10:
					arr=str.split(",");
					value.s=arr[0];
					if(arr.length > 1){
						var intv=parseInt(arr[1]);
						if(intv==0 || intv==100)
							value.f1=1;
						else
						value.f1=intv / 100;
					}
					else
					value.f1=1;
					break ;
				case 11:
					arr=str.split(",");
					value.s=arr[0];
					if(arr.length > 1)
						value.i=parseInt(arr[1]);
					else
					value.i=1;
					break ;
				case 12:
					arr=str.split(",");
					value.f1=parseFloat(arr[0]);
					value.f2=parseFloat(arr[1]);
					break ;
				}
		}

		__getset(0,__proto,'playing',function(){
			return this._playing;
		});

		Transition.__init$=function(){
			//class TransitionActionType
			TransitionActionType=(function(){
				function TransitionActionType(){};
				__class(TransitionActionType,'');
				TransitionActionType.XY=0;
				TransitionActionType.Size=1;
				TransitionActionType.Scale=2;
				TransitionActionType.Pivot=3;
				TransitionActionType.Alpha=4;
				TransitionActionType.Rotation=5;
				TransitionActionType.Color=6;
				TransitionActionType.Animation=7;
				TransitionActionType.Visible=8;
				TransitionActionType.Controller=9;
				TransitionActionType.Sound=10;
				TransitionActionType.Transition=11;
				TransitionActionType.Shake=12;
				TransitionActionType.Unknown=13;
				return TransitionActionType;
			})()
			//class TransitionItem
			TransitionItem=(function(){
				function TransitionItem(){
					this.time=0;
					this.targetId=null;
					this.type=0;
					this.duration=0;
					this.value=null;
					this.startValue=null;
					this.endValue=null;
					this.easeType=null;
					this.repeat=0;
					this.yoyo=false;
					this.tween=false;
					this.label=null;
					this.label2=null;
					this.hook=null;
					this.hook2=null;
					this.tweenTimes=0;
					this.tweener=null;
					this.completed=false;
					this.target=null;
					this.easeType=Ease.QuadOut;
					this.value=new TransitionValue();
					this.startValue=new TransitionValue();
					this.endValue=new TransitionValue();
				}
				__class(TransitionItem,'');
				var __proto=TransitionItem.prototype;
				__proto.__shake=function(trans){
					trans.__shakeItem(this);
				}
				return TransitionItem;
			})()
			//class TransitionValue
			TransitionValue=(function(){
				function TransitionValue(){
					this.f1=0;
					this.f2=0;
					this.f3=0;
					this.i=0;
					this.b=false;
					this.s=null;
					this.b1=true;
					this.b2=true;
				}
				__class(TransitionValue,'');
				return TransitionValue;
			})()
		}

		return Transition;
	})()


	//class fairygui.UIConfig
	var UIConfig1=(function(){
		function UIConfig(){}
		__class(UIConfig,'fairygui.UIConfig',null,'UIConfig1');
		UIConfig.defaultFont="宋体";
		UIConfig.windowModalWaiting=null
		UIConfig.globalModalWaiting=null
		UIConfig.modalLayerColor="rgba(33,33,33,0.2)";
		UIConfig.buttonSound=null
		UIConfig.buttonSoundVolumeScale=1;
		UIConfig.horizontalScrollBar=null
		UIConfig.verticalScrollBar=null
		UIConfig.defaultScrollSpeed=25;
		UIConfig.defaultScrollBarDisplay=1;
		UIConfig.defaultScrollTouchEffect=true;
		UIConfig.defaultScrollBounceEffect=true;
		UIConfig.popupMenu=null
		UIConfig.popupMenu_seperator=null
		UIConfig.loaderErrorSign=null
		UIConfig.tooltipsWin=null
		UIConfig.defaultComboBoxVisibleItemCount=10;
		UIConfig.touchScrollSensitivity=20;
		UIConfig.touchDragSensitivity=10;
		UIConfig.clickDragSensitivity=2;
		UIConfig.bringWindowToFrontOnClick=true;
		return UIConfig;
	})()


	//class fairygui.UIObjectFactory
	var UIObjectFactory=(function(){
		function UIObjectFactory(){}
		__class(UIObjectFactory,'fairygui.UIObjectFactory');
		UIObjectFactory.setPackageItemExtension=function(url,type){
			fairygui.UIObjectFactory.packageItemExtensions[url.substring(5)]=type;
		}

		UIObjectFactory.setLoaderExtension=function(type){
			fairygui.UIObjectFactory.loaderExtension=type;
		}

		UIObjectFactory.newObject=function(pi){
			switch (pi.type){
				case 0:
					return new GImage();
				case 2:
					return new GMovieClip();
				case 4:{
						var cls=fairygui.UIObjectFactory.packageItemExtensions[pi.owner.id+pi.id];
						if(cls)
							return new cls();
						var xml=pi.owner.getItemAsset(pi);
						var extention=xml.getAttribute("extention");
						if(extention !=null){
						switch(extention){
							case "Button":
								return new GButton();
							case "Label":
								return new GLabel();
							case "ProgressBar":
								return new GProgressBar();
							case "Slider":
								return new GSlider();
							case "ScrollBar":
								return new GScrollBar();
							case "ComboBox":
								return new GComboBox();
							default :
								return new GComponent();
							}
					}
					else
					return new GComponent();
				}
			}
			return null;
		}

		UIObjectFactory.newObject2=function(type){
			switch (type){
				case "image":
					return new GImage();
				case "movieclip":
					return new GMovieClip();
				case "component":
					return new GComponent();
				case "text":
					return new GBasicTextField();
				case "richtext":
					return new GRichTextField();
				case "group":
					return new GGroup();
				case "list":
					return new GList();
				case "graph":
					return new GGraph();
				case "loader":
					if (fairygui.UIObjectFactory.loaderExtension !=null)
						return new fairygui.UIObjectFactory.loaderExtension();
					else
					return new GLoader();
				}
			return null;
		}

		UIObjectFactory.packageItemExtensions={};
		UIObjectFactory.loaderExtension=null
		return UIObjectFactory;
	})()


	//class fairygui.UIPackage
	var UIPackage=(function(){
		var AtlasSprite;
		function UIPackage(){
			this._id=null;
			this._name=null;
			this._basePath=null;
			this._items=null;
			this._itemsById=null;
			this._itemsByName=null;
			this._resKey=null;
			this._resData=null;
			this._customId=null;
			this._sprites=null;
			this._items=[];
			this._sprites={};
		}

		__class(UIPackage,'fairygui.UIPackage');
		var __proto=UIPackage.prototype;
		__proto.create=function(resKey){
			this._resKey=resKey;
			this.loadPackage();
		}

		__proto.loadPackage=function(){
			var str;
			var arr;
			this.decompressPackage(Laya.loader.getRes(this._resKey+".fui"));
			str=this.getDesc("sprites.bytes");
			arr=str.split("\n");
			var cnt=arr.length;
			for(var i=1;i < cnt;i++){
				str=arr[i];
				if(!str)
					continue ;
				var arr2=str.split(" ");
				var sprite=new AtlasSprite();
				var itemId=arr2[0];
				var binIndex=parseInt(arr2[1]);
				if(binIndex >=0)
					sprite.atlas="atlas"+binIndex;
				else {
					var pos=itemId.indexOf("_");
					if(pos==-1)
						sprite.atlas="atlas_"+itemId;
					else
					sprite.atlas="atlas_"+itemId.substr(0,pos);
				}
				sprite.rect.x=parseInt(arr2[2]);
				sprite.rect.y=parseInt(arr2[3]);
				sprite.rect.width=parseInt(arr2[4]);
				sprite.rect.height=parseInt(arr2[5]);
				sprite.rotated=arr2[6]=="1";
				this._sprites[itemId]=sprite;
			}
			str=this.getDesc("package.xml");
			var xml=Utils.parseXMLFromString(str);
			var rootNode=xml.firstChild;
			this._id=rootNode.getAttribute("id");
			this._name=rootNode.getAttribute("name");
			var resources=ToolSet.findChildNode(rootNode,"resources").childNodes;
			this._itemsById={};
			this._itemsByName={};
			var pi;
			var cxml;
			var length1=resources.length;
			for(var i1=0;i1 < length1;i1++){
				cxml=resources[i1];
				if(cxml.nodeType!=1)
					continue ;
				pi=new PackageItem();
				pi.type=PackageItemType.parse(cxml.nodeName);
				pi.id=cxml.getAttribute("id");
				pi.name=cxml.getAttribute("name");
				pi.file=cxml.getAttribute("file");
				str=cxml.getAttribute("size");
				if(str){
					arr=str.split(",");
					pi.width=parseInt(arr[0]);
					pi.height=parseInt(arr[1]);
				}
				switch(pi.type){
					case 0:{
							str=cxml.getAttribute("scale");
							if(str=="9grid"){
								pi.scale9Grid=new laya.maths.Rectangle();
								str=cxml.getAttribute("scale9grid");
								if(str){
									arr=str.split(",");
									pi.scale9Grid.x=parseInt(arr[0]);
									pi.scale9Grid.y=parseInt(arr[1]);
									pi.scale9Grid.width=parseInt(arr[2]);
									pi.scale9Grid.height=parseInt(arr[3]);
								}
							}
							else if(str=="tile"){
								pi.scaleByTile=true;
							}
							str=cxml.getAttribute("smoothing");
							pi.smoothing=str !="false";
							break ;
						}
					}
				pi.owner=this;
				this._items.push(pi);
				this._itemsById[pi.id]=pi;
				if(pi.name !=null)
					this._itemsByName[pi.name]=pi;
			}
			cnt=this._items.length;
			for(i=0;i < cnt;i++){
				pi=this._items[i];
				if(pi.type==6){
					this.loadFont(pi);
					fairygui.UIPackage._bitmapFonts[pi.bitmapFont.id]=pi.bitmapFont;
				}
			}
		}

		__proto.decompressPackage=function(buf){
			this._resData={};
			var data;
			var inflater=new Zlib.RawInflate(buf);data=inflater.decompress();;
			var source=new Byte(data).readUTFBytes();
			var curr=0;
			var fn;
			var size=NaN;
			while(true){
				var pos=source.indexOf("|",curr);
				if(pos==-1)
					break ;
				fn=source.substring(curr,pos);
				curr=pos+1;
				pos=source.indexOf("|",curr);
				size=parseInt(source.substring(curr,pos));
				curr=pos+1;
				this._resData[fn]=source.substr(curr,size);
				curr+=size;
			}
		}

		__proto.dispose=function(){
			var cnt=this._items.length;
			for(var i=0;i < cnt;i++){
				var pi=this._items[i];
				var texture=pi.texture;
				if(pi.bitmapFont !=null){
					delete fairygui.UIPackage._bitmapFonts[pi.bitmapFont.id];
				}
			}
		}

		__proto.createObject=function(resName,userClass){
			var pi=this._itemsByName[resName];
			if (pi)
				return this.createObject2(pi,userClass);
			else
			return null;
		}

		__proto.createObject2=function(pi,userClass){
			var g;
			if (pi.type==4){
				if (userClass !=null)
					g=new userClass();
				else
				g=UIObjectFactory.newObject(pi);
			}
			else
			g=UIObjectFactory.newObject(pi);
			if (g==null)
				return null;
			fairygui.UIPackage._constructing++;
			g.constructFromResource(pi);
			fairygui.UIPackage._constructing--;
			return g;
		}

		__proto.getItem=function(itemId){
			return this._itemsById[itemId];
		}

		__proto.getItemAssetByName=function(resName){
			var pi=this._itemsByName[resName];
			if (pi==null){
				throw "Resource not found -"+resName;
			}
			return this.getItemAsset(pi);
		}

		__proto.getItemAsset=function(item){
			switch (item.type){
				case 0:
					if (!item.decoded){
						item.decoded=true;
						var sprite=this._sprites[item.id];
						if (sprite !=null)
							item.texture=this.createSpriteTexture(sprite);
					}
					return item.texture;
				case 7:
					if (!item.decoded){
						item.decoded=true;
						var fileName=(item.file !=null && item.file.length > 0)? item.file :(item.id+".png");
						item.texture=Laya.loader.getRes(this._resKey+"@"+fileName);
					}
					return item.texture;
				case 3:
					if (!item.decoded){
						item.decoded=true;
						item.sound=Laya.loader.getRes(this._resKey+"@"+item.id);
					}
					return item.sound;
				case 6:
					if (!item.decoded){
						item.decoded=true;
						this.loadFont(item);
					}
					return item.bitmapFont;
				case 2:
					if (!item.decoded){
						item.decoded=true;
						this.loadMovieClip(item);
					}
					return item.frames;
				case 4:
					if (!item.decoded){
						item.decoded=true;
						var str=this.getDesc(item.id+".xml");
						item.componentData=Utils.parseXMLFromString(str).firstChild;
					}
					return item.componentData;
				default :
					return Laya.loader.getRes(this._resKey+"@"+item.id);
				}
		}

		__proto.getDesc=function(fn){
			return this._resData[fn];
		}

		__proto.createSpriteTexture=function(sprite){
			var atlasItem=this._itemsById[sprite.atlas];
			if (atlasItem !=null){
				var atlasTexture=(this.getItemAsset(atlasItem));
				if(atlasTexture==null)
					return null;
				else
				return this.createSubTexture(atlasTexture,sprite.rect);
			}
			else
			return null;
		}

		__proto.createSubTexture=function(atlasTexture,clipRect){
			var texture=Texture.createFromTexture(atlasTexture,
			clipRect.x,clipRect.y,clipRect.width,clipRect.height);
			return texture;
		}

		__proto.loadMovieClip=function(item){
			var xml=Utils.parseXMLFromString(this.getDesc(item.id+".xml")).firstChild;
			var str;
			var arr;
			str=xml.getAttribute("interval");
			if (str !=null)
				item.interval=parseInt(str);
			str=xml.getAttribute("swing");
			if (str !=null)
				item.swing=str=="true";
			str=xml.getAttribute("repeatDelay");
			if (str !=null)
				item.repeatDelay=parseInt(str);
			var frameCount=parseInt(xml.getAttribute("frameCount"));
			item.frames=[];
			var frameNodes=ToolSet.findChildNode(xml,"frames").childNodes;
			var i=0;
			var len=frameNodes.length;
			for(var k=0;k < len;k++){
				var frameNode=frameNodes[k];
				if(frameNode.nodeName!="frame")
					continue ;
				var frame=new Frame();
				str=frameNode.getAttribute("rect");
				arr=str.split(",");
				frame.rect=new Rectangle(parseInt(arr[0]),parseInt(arr[1]),parseInt(arr[2]),parseInt(arr[3]));
				str=frameNode.getAttribute("addDelay");
				if(str)
					frame.addDelay=parseInt(str);
				item.frames[i]=frame;
				var sprite=this._sprites[item.id+"_"+i];
				if(sprite !=null)
					frame.texture=this.createSpriteTexture(sprite);
				i++;
			}
		}

		__proto.loadFont=function(item){
			var font=new BitmapFont1();
			font.id="ui://"+this.id+item.id;
			var str=this.getDesc(item.id+".fnt");
			var lines=str.split("\n");
			var lineCount=lines.length;
			var i=0;
			var kv={};
			var ttf=false;
			var size=0;
			var xadvance=0;
			var resizable=false;
			var atlasOffsetX=0,atlasOffsetY=0;
			var charImg;
			var mainTexture;
			for (i=0;i < lineCount;i++){
				str=lines[i];
				if (str.length==0)
					continue ;
				str=ToolSet.trim(str);
				var arr=str.split(" ");
				for (var j=1;j < arr.length;j++){
					var arr2=arr[j].split("=");
					kv[arr2[0]]=arr2[1];
				}
				str=arr[0];
				if (str=="char"){
					var bg=new BMGlyph();
					bg.x=isNaN(kv.x)? 0 :parseInt(kv.x);
					bg.y=isNaN(kv.y)? 0 :parseInt(kv.y);
					bg.offsetX=isNaN(kv.xoffset)? 0 :parseInt(kv.xoffset);
					bg.offsetY=isNaN(kv.yoffset)? 0 :parseInt(kv.yoffset);
					bg.width=isNaN(kv.width)? 0 :parseInt(kv.width);
					bg.height=isNaN(kv.height)? 0 :parseInt(kv.height);
					bg.advance=isNaN(kv.xadvance)? 0 :parseInt(kv.xadvance);
					if (kv.chnl !=undefined){
						bg.channel=parseInt(kv.chnl);
						if (bg.channel==15)
							bg.channel=4;
						else if (bg.channel==1)
						bg.channel=3;
						else if (bg.channel==2)
						bg.channel=2;
						else
						bg.channel=1;
					}
					if (!ttf){
						if (kv.img){
							charImg=this._itemsById[kv.img];
							if (charImg !=null){
								charImg.load();
								bg.width=charImg.width;
								bg.height=charImg.height;
								bg.texture=charImg.texture;
							}
						}
					}
					else if (mainTexture !=null){
						bg.texture=this.createSubTexture(mainTexture,new Rectangle(bg.x+atlasOffsetX,bg.y+atlasOffsetY,bg.width,bg.height));
					}
					if (ttf)
						bg.lineHeight=size;
					else {
						if(bg.advance==0){
							if(xadvance==0)
								bg.advance=bg.offsetX+bg.width;
							else
							bg.advance=xadvance;
						}
						bg.lineHeight=bg.offsetY < 0 ? bg.height :(bg.offsetY+bg.height);
						if (bg.lineHeight < size)
							bg.lineHeight=size;
					}
					font.glyphs[String.fromCharCode(kv.id)]=bg;
				}
				else if (str=="info"){
					ttf=kv.face !=null;
					if(!isNaN(kv.size))
						size=parseInt(kv.size);
					resizable=kv.resizable=="true";
					if (ttf){
						var sprite=this._sprites[item.id];
						if (sprite !=null){
							atlasOffsetX=sprite.rect.x;
							atlasOffsetY=sprite.rect.y;
							var atlasItem=this._itemsById[sprite.atlas];
							if(atlasItem !=null)
								mainTexture=(this.getItemAsset(atlasItem));
						}
					}
				}
				else if (str=="common"){
					if(size==0 && !isNaN(kv.lineHeight))
						size=parseInt(kv.lineHeight);
					if(!isNaN(kv.xadvance))
						xadvance=parseInt(kv.xadvance);
				}
			}
			if (size==0 && bg)
				size=bg.height;
			font.ttf=ttf;
			font.size=size;
			font.resizable=resizable;
			item.bitmapFont=font;
		}

		__getset(0,__proto,'customId',function(){
			return this._customId;
			},function(value){
			if (this._customId !=null)
				delete fairygui.UIPackage._packageInstById[this._customId];
			this._customId=value;
			if (this._customId !=null)
				fairygui.UIPackage._packageInstById[this._customId]=this;
		});

		__getset(0,__proto,'id',function(){
			return this._id;
		});

		__getset(0,__proto,'name',function(){
			return this._name;
		});

		UIPackage.getById=function(id){
			return fairygui.UIPackage._packageInstById[id];
		}

		UIPackage.getByName=function(name){
			return fairygui.UIPackage._packageInstByName[name];
		}

		UIPackage.addPackage=function(resKey){
			var pkg=new UIPackage();
			pkg.create(resKey);
			fairygui.UIPackage._packageInstById[pkg.id]=pkg;
			fairygui.UIPackage._packageInstByName[pkg.name]=pkg;
			pkg.customId=resKey;
			return pkg;
		}

		UIPackage.removePackage=function(packageId){
			var pkg=fairygui.UIPackage._packageInstById[packageId];
			pkg.dispose();
			delete fairygui.UIPackage._packageInstById[pkg.id];
			if(pkg._customId !=null)
				delete fairygui.UIPackage._packageInstById[pkg._customId];
			delete fairygui.UIPackage._packageInstByName[pkg.name];
		}

		UIPackage.createObject=function(pkgName,resName,userClass){
			var pkg=fairygui.UIPackage.getByName(pkgName);
			if(pkg)
				return pkg.createObject(resName,userClass);
			else
			return null;
		}

		UIPackage.createObjectFromURL=function(url,userClass){
			var pi=fairygui.UIPackage.getItemByURL(url);
			if(pi)
				return pi.owner.createObject2(pi,userClass);
			else
			return null;
		}

		UIPackage.getItemURL=function(pkgName,resName){
			var pkg=fairygui.UIPackage.getByName(pkgName);
			if(!pkg)
				return null;
			var pi=pkg._itemsByName[resName];
			if(!pi)
				return null;
			return "ui://"+pkg.id+pi.id;
		}

		UIPackage.getItemByURL=function(url){
			if(ToolSet.startsWith(url,"ui://")){
				var pkgId=url.substr(5,8);
				var srcId=url.substr(13);
				var pkg=fairygui.UIPackage.getById(pkgId);
				if(pkg)
					return pkg.getItem(srcId);
			}
			return null;
		}

		UIPackage.getBitmapFontByURL=function(url){
			return fairygui.UIPackage._bitmapFonts[url];
		}

		UIPackage._constructing=0;
		UIPackage._packageInstById={};
		UIPackage._packageInstByName={};
		UIPackage._bitmapFonts={};
		UIPackage.sep0=",";
		UIPackage.sep1="\n";
		UIPackage.sep2=" ";
		UIPackage.sep3="=";
		UIPackage.__init$=function(){
			//class AtlasSprite
			AtlasSprite=(function(){
				function AtlasSprite(){
					this.atlas=null;
					this.rect=null;
					this.rotated=false;
					this.rect=new Rectangle();
				}
				__class(AtlasSprite,'');
				return AtlasSprite;
			})()
		}

		return UIPackage;
	})()


	//class fairygui.utils.ToolSet
	var ToolSet=(function(){
		function ToolSet(){}
		__class(ToolSet,'fairygui.utils.ToolSet');
		ToolSet.getFileName=function(source){
			var i=source.lastIndexOf("/");
			if (i !=-1)
				source=source.substr(i+1);
			i=source.lastIndexOf("\\");
			if (i !=-1)
				source=source.substr(i+1);
			i=source.lastIndexOf(".");
			if (i !=-1)
				return source.substring(0,i);
			else
			return source;
		}

		ToolSet.startsWith=function(source,str,ignoreCase){
			(ignoreCase===void 0)&& (ignoreCase=false);
			if (!source)
				return false;
			else if (source.length < str.length)
			return false;
			else {
				source=source.substring(0,str.length);
				if (!ignoreCase)
					return source==str;
				else
				return source.toLowerCase()==str.toLowerCase();
			}
		}

		ToolSet.endsWith=function(source,str,ignoreCase){
			(ignoreCase===void 0)&& (ignoreCase=false);
			if (!source)
				return false;
			else if (source.length < str.length)
			return false;
			else {
				source=source.substring(source.length-str.length);
				if (!ignoreCase)
					return source==str;
				else
				return source.toLowerCase()==str.toLowerCase();
			}
		}

		ToolSet.trim=function(targetString){
			return fairygui.utils.ToolSet.trimLeft(fairygui.utils.ToolSet.trimRight(targetString));
		}

		ToolSet.trimLeft=function(targetString){
			var tempChar="";
			for (var i=0;i < targetString.length;i++){
				tempChar=targetString.charAt(i);
				if (tempChar !=" " && tempChar !="\n" && tempChar !="\r"){
					break ;
				}
			}
			return targetString.substr(i);
		}

		ToolSet.trimRight=function(targetString){
			var tempChar="";
			for (var i=targetString.length-1;i >=0;i--){
				tempChar=targetString.charAt(i);
				if (tempChar !=" " && tempChar !="\n" && tempChar !="\r"){
					break ;
				}
			}
			return targetString.substring(0,i+1);
		}

		ToolSet.convertToHtmlColor=function(argb,hasAlpha){
			(hasAlpha===void 0)&& (hasAlpha=false);
			var alpha;
			if (hasAlpha)
				alpha=(argb >> 24 & 0xFF).toString(16);
			else
			alpha="";
			var red=(argb >> 16 & 0xFF).toString(16);
			var green=(argb >> 8 & 0xFF).toString(16);
			var blue=(argb & 0xFF).toString(16);
			if (alpha.length==1)
				alpha="0"+alpha;
			if (red.length==1)
				red="0"+red;
			if (green.length==1)
				green="0"+green;
			if (blue.length==1)
				blue="0"+blue;
			return "#"+alpha+red+green+blue;
		}

		ToolSet.convertFromHtmlColor=function(str,hasAlpha){
			(hasAlpha===void 0)&& (hasAlpha=false);
			if (str.length < 1)
				return 0;
			if (str.charAt(0)=="#")
				str=str.substr(1);
			if (str.length==8)
				return (parseInt(str.substr(0,2),16)<< 24)+parseInt(str.substr(2),16);
			else if (hasAlpha)
			return 0xFF000000+parseInt(str,16);
			else
			return parseInt(str,16);
		}

		ToolSet.displayObjectToGObject=function(obj){
			while (obj !=null && !((obj instanceof laya.display.Stage ))){
				if (obj["$owner"])
					return obj["$owner"];
				obj=obj.parent;
			}
			return null;
		}

		ToolSet.findChildNode=function(xml,name){
			var col=xml.childNodes;
			var length1=col.length;
			if (length1>0){
				for (var i1=0;i1 < length1;i1++){
					var cxml=col[i1];
					if (cxml.nodeName==name){
						return cxml;
					}
				}
			}
			return null;
		}

		ToolSet.encodeHTML=function(str){
			if (!str)
				return "";
			else
			return str.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("'","&apos;");
		}

		ToolSet.parseUBB=function(text){
			return fairygui.utils.ToolSet.defaultUBBParser.parse(text);
		}

		ToolSet.removeUBB=function(text){
			return fairygui.utils.ToolSet.defaultUBBParser.parse(text,true);
		}

		ToolSet.parseEaseType=function(value){
			var ret=ToolSet.EaseMap[value];
			if (!ret)
				ret=Ease.quartOut;
			return ret;
		}

		__static(ToolSet,
		['GRAY_FILTERS_MATRIX',function(){return this.GRAY_FILTERS_MATRIX=[0.3086,0.6094,0.082,0,0,0.3086,0.6094,0.082,0,0,0.3086,0.6094,0.082,0,0,0,0,0,1,0];},'defaultUBBParser',function(){return this.defaultUBBParser=new UBBParser();},'EaseMap',function(){return this.EaseMap={
				"Linear":Ease.linearNone,
				"Elastic.In":Ease.elasticIn,
				"Elastic.Out":Ease.elasticOut,
				"Elastic.InOut":Ease.elasticInOut,
				"Quad.In":Ease.QuadIn,
				"Quad.Out":Ease.QuadOut,
				"Quad.InOut":Ease.QuadInOut,
				"Cube.In":Ease.cubicIn,
				"Cube.Out":Ease.cubicOut,
				"Cube.InOut":Ease.cubicInOut,
				"Quart.In":Ease.quartIn,
				"Quart.Out":Ease.quartOut,
				"Quart.InOut":Ease.quartInOut,
				"Quint.In":Ease.quintIn,
				"Quint.Out":Ease.quintOut,
				"Quint.InOut":Ease.quintInOut,
				"Sine.In":Ease.sineIn,
				"Sine.Out":Ease.sineOut,
				"Sine.InOut":Ease.sineInOut,
				"Bounce.In":Ease.bounceIn,
				"Bounce.Out":Ease.bounceOut,
				"Bounce.InOut":Ease.bounceInOut,
				"Circ.In":Ease.circIn,
				"Circ.Out":Ease.circOut,
				"Circ.InOut":Ease.circInOut,
				"Expo.In":Ease.quartIn,
				"Expo.Out":Ease.quartOut,
				"Expo.InOut":Ease.quartInOut,
				"Back.In":Ease.backIn,
				"Back.Out":Ease.backOut,
				"Back.InOut":Ease.backInOut
		};}

		]);
		return ToolSet;
	})()


	//class fairygui.utils.UBBParser
	var UBBParser=(function(){
		function UBBParser(){
			this._text=null;
			this._readPos=0;
			this._handlers=null;
			this.smallFontSize=12;
			this.normalFontSize=14;
			this.largeFontSize=16;
			this.defaultImgWidth=0;
			this.defaultImgHeight=0;
			this._handlers={};
			this._handlers["url"]=this.onTag_URL;
			this._handlers["img"]=this.onTag_IMG;
			this._handlers["b"]=this.onTag_Simple;
			this._handlers["i"]=this.onTag_Simple;
			this._handlers["u"]=this.onTag_Simple;
			this._handlers["sup"]=this.onTag_Simple;
			this._handlers["sub"]=this.onTag_Simple;
			this._handlers["color"]=this.onTag_COLOR;
			this._handlers["font"]=this.onTag_FONT;
			this._handlers["size"]=this.onTag_SIZE;
		}

		__class(UBBParser,'fairygui.utils.UBBParser');
		var __proto=UBBParser.prototype;
		__proto.onTag_URL=function(tagName,end,attr){
			if (!end){
				if (attr !=null)
					return "<a href=\""+attr+"\" target=\"_blank\">";
				else {
					var href=this.getTagText();
					return "<a href=\""+href+"\" target=\"_blank\">";
				}
			}
			else
			return "</a>";
		}

		__proto.onTag_IMG=function(tagName,end,attr){
			if (!end){
				var src=this.getTagText(true);
				if (!src)
					return null;
				if (this.defaultImgWidth)
					return "<img src=\""+src+"\" width=\""+this.defaultImgWidth+"\" height=\""+this.defaultImgHeight+"\"/>";
				else
				return "<img src=\""+src+"\"/>";
			}
			else
			return null;
		}

		__proto.onTag_Simple=function(tagName,end,attr){
			return end ? ("</"+tagName+">"):("<"+tagName+">");
		}

		__proto.onTag_COLOR=function(tagName,end,attr){
			if (!end)
				return "<font color=\""+attr+"\">";
			else
			return "</font>";
		}

		__proto.onTag_FONT=function(tagName,end,attr){
			if (!end)
				return "<font face=\""+attr+"\">";
			else
			return "</font>";
		}

		__proto.onTag_SIZE=function(tagName,end,attr){
			if (!end){
				if (attr=="normal")
					attr=""+this.normalFontSize;
				else if (attr=="small")
				attr=""+this.smallFontSize;
				else if (attr=="large")
				attr=""+this.largeFontSize;
				else if (attr.length && attr.charAt(0)=="+")
				attr=""+(this.smallFontSize+parseInt(attr.substr(1)));
				else if (attr.length && attr.charAt(0)=="-")
				attr=""+(this.smallFontSize-parseInt(attr.substr(1)));
				return "<font size=\""+attr+"\">";
			}
			else
			return "</font>";
		}

		__proto.getTagText=function(remove){
			(remove===void 0)&& (remove=false);
			var pos=this._text.indexOf("[",this._readPos);
			if (pos==-1)
				return null;
			var ret=this._text.substring(this._readPos,pos);
			if (remove)
				this._readPos=pos;
			return ret;
		}

		__proto.parse=function(text,remove){
			(remove===void 0)&& (remove=false);
			this._text=text;
			var pos1=0,pos2=NaN,pos3=0;
			var end=false;
			var tag,attr;
			var repl;
			var func;
			while ((pos2=this._text.indexOf("[",pos1))!=-1){
				pos1=pos2;
				pos2=this._text.indexOf("]",pos1);
				if (pos2==-1)
					break ;
				end=this._text.charAt(pos1+1)=='/';
				tag=this._text.substring(end ? pos1+2 :pos1+1,pos2);
				pos2++;
				this._readPos=pos2;
				attr=null;
				repl=null;
				pos3=tag.indexOf("=");
				if (pos3 !=-1){
					attr=tag.substring(pos3+1);
					tag=tag.substring(0,pos3);
				}
				tag=tag.toLowerCase();
				func=this._handlers[tag];
				if (func !=null){
					if(!remove){
						repl=func.call(this,tag,end,attr);
						if (repl==null)
							repl="";
					}
					else
					repl="";
				}
				else {
					pos1=pos2;
					continue ;
				}
				this._text=this._text.substring(0,pos1)+repl+this._text.substring(this._readPos);
			}
			return this._text;
		}

		__static(UBBParser,
		['inst',function(){return this.inst=new UBBParser();}
		]);
		return UBBParser;
	})()


	//class fairygui.Controller extends laya.events.EventDispatcher
	var Controller=(function(_super){
		var PageTransition;
		function Controller(){
			this._name=null;
			this._selectedIndex=0;
			this._previousIndex=0;
			this._pageIds=null;
			this._pageNames=null;
			this._pageTransitions=null;
			this._playingTransition=null;
			this._parent=null;
			this._autoRadioGroupDepth=false;
			Controller.__super.call(this);
			this._pageIds=[];
			this._pageNames=[];
			this._selectedIndex=-1;
			this._previousIndex=-1;
		}

		__class(Controller,'fairygui.Controller',_super);
		var __proto=Controller.prototype;
		//功能和设置selectedIndex一样，但不会触发事件
		__proto.setSelectedIndex=function(value){
			(value===void 0)&& (value=0);
			if (this._selectedIndex !=value){
				if(value > this._pageIds.length-1)
					throw "index out of bounds: "+value;
				this._previousIndex=this._selectedIndex;
				this._selectedIndex=value;
				this._parent.applyController(this);
				if(this._playingTransition){
					this._playingTransition.stop();
					this._playingTransition=null;
				}
			}
		}

		//功能和设置selectedPage一样，但不会触发事件
		__proto.setSelectedPage=function(value){
			var i=this._pageNames.indexOf(value);
			if (i==-1)
				i=0;
			this.setSelectedIndex(i);
		}

		__proto.getPageName=function(index){
			(index===void 0)&& (index=0);
			return this._pageNames[index];
		}

		__proto.addPage=function(name){
			(name===void 0)&& (name="");
			this.addPageAt(name,this._pageIds.length);
		}

		__proto.addPageAt=function(name,index){
			(index===void 0)&& (index=0);
			var nid=""+(fairygui.Controller._nextPageId++);
			if (index==this._pageIds.length){
				this._pageIds.push(nid);
				this._pageNames.push(name);
			}
			else {
				this._pageIds.splice(index,0,nid);
				this._pageNames.splice(index,0,name);
			}
		}

		__proto.removePage=function(name){
			var i=this._pageNames.indexOf(name);
			if (i !=-1){
				this._pageIds.splice(i,1);
				this._pageNames.splice(i,1);
				if (this._selectedIndex >=this._pageIds.length)
					this.selectedIndex=this._selectedIndex-1;
				else
				this._parent.applyController(this);
			}
		}

		__proto.removePageAt=function(index){
			(index===void 0)&& (index=0);
			this._pageIds.splice(index,1);
			this._pageNames.splice(index,1);
			if (this._selectedIndex >=this._pageIds.length)
				this.selectedIndex=this._selectedIndex-1;
			else
			this._parent.applyController(this);
		}

		__proto.clearPages=function(){
			this._pageIds.length=0;
			this._pageNames.length=0;
			if (this._selectedIndex !=-1)
				this.selectedIndex=-1;
			else
			this._parent.applyController(this);
		}

		__proto.hasPage=function(aName){
			return this._pageNames.indexOf(aName)!=-1;
		}

		__proto.getPageIndexById=function(aId){
			return this._pageIds.indexOf(aId);
		}

		__proto.getPageIdByName=function(aName){
			var i=this._pageNames.indexOf(aName);
			if(i !=-1)
				return this._pageIds[i];
			else
			return null;
		}

		__proto.getPageNameById=function(aId){
			var i=this._pageIds.indexOf(aId);
			if(i !=-1)
				return this._pageNames[i];
			else
			return null;
		}

		__proto.getPageId=function(index){
			(index===void 0)&& (index=0);
			return this._pageIds[index];
		}

		__proto.setup=function(xml){
			this._name=xml.getAttribute("name");
			this._autoRadioGroupDepth=xml.getAttribute("autoRadioGroupDepth")=="true";
			var i=0;
			var k=0;
			var str=xml.getAttribute("pages");
			if (str){
				var arr=str.split(",");
				var cnt=arr.length;
				for (i=0;i < cnt;i+=2){
					this._pageIds.push(arr[i]);
					this._pageNames.push(arr[i+1]);
				}
			}
			str=xml.getAttribute("transitions");
			if(str){
				this._pageTransitions=[];
				arr=str.split(",");
				cnt=arr.length;
				for(i=0;i < cnt;i++){
					str=arr[i];
					if(!str)
						continue ;
					var pt=new PageTransition();
					k=str.indexOf("=");
					pt.transitionName=str.substr(k+1);
					str=str.substring(0,k);
					k=str.indexOf("-");
					pt.toIndex=parseInt(str.substring(k+1));
					str=str.substring(0,k);
					if(str=="*")
						pt.fromIndex=-1;
					else
					pt.fromIndex=parseInt(str);
					this._pageTransitions.push(pt);
				}
			}
			if (this._parent && this._pageIds.length > 0)
				this._selectedIndex=0;
			else
			this._selectedIndex=-1;
		}

		__getset(0,__proto,'name',function(){
			return this._name;
			},function(value){
			this._name=value;
		});

		__getset(0,__proto,'parent',function(){
			return this._parent;
		});

		__getset(0,__proto,'selectedPageId',function(){
			if (this._selectedIndex==-1)
				return null;
			else
			return this._pageIds[this._selectedIndex];
			},function(val){
			var i=this._pageIds.indexOf(val);
			this.selectedIndex=i;
		});

		__getset(0,__proto,'selectedIndex',function(){
			return this._selectedIndex;
			},function(value){
			if(this._selectedIndex !=value){
				if(value > this._pageIds.length-1)
					throw "index out of bounds: "+value;
				this._previousIndex=this._selectedIndex;
				this._selectedIndex=value;
				this._parent.applyController(this);
				this.event("fui_state_changed");
				if(this._playingTransition){
					this._playingTransition.stop();
					this._playingTransition=null;
				}
				if(this._pageTransitions){
					var len=this._pageTransitions.length;
					for(var i=0;i < len;i++){
						var pt=this._pageTransitions[i];
						if(pt.toIndex==this._selectedIndex && (pt.fromIndex==-1 || pt.fromIndex==this._previousIndex)){
							this._playingTransition=this.parent.getTransition(pt.transitionName);
							break ;
						}
					}
					if(this._playingTransition)
						this._playingTransition.play(Handler.create(this,function(){this._playingTransition=null;}));
				}
			}
		});

		__getset(0,__proto,'selectedPage',function(){
			if (this._selectedIndex==-1)
				return null;
			else
			return this._pageNames[this._selectedIndex];
			},function(val){
			var i=this._pageNames.indexOf(val);
			if (i==-1)
				i=0;
			this.selectedIndex=i;
		});

		__getset(0,__proto,'previsousIndex',function(){
			return this._previousIndex;
		});

		__getset(0,__proto,'previousPage',function(){
			if (this._previousIndex==-1)
				return null;
			else
			return this._pageNames[this._previousIndex];
		});

		__getset(0,__proto,'pageCount',function(){
			return this._pageIds.length;
		});

		__getset(0,__proto,'oppositePageId',null,function(val){
			var i=this._pageIds.indexOf(val);
			if(i > 0)
				this.selectedIndex=0;
			else if(this._pageIds.length > 1)
			this.selectedIndex=1;
		});

		__getset(0,__proto,'previousPageId',function(){
			if(this._previousIndex==-1)
				return null;
			else
			return this._pageIds[this._previousIndex];
		});

		Controller._nextPageId=0;
		Controller.__init$=function(){
			//class PageTransition
			PageTransition=(function(){
				function PageTransition(){
					this.transitionName=null;
					this.fromIndex=0;
					this.toIndex=0;
				}
				__class(PageTransition,'');
				return PageTransition;
			})()
		}

		return Controller;
	})(EventDispatcher)


	//class fairygui.GTextField extends fairygui.GObject
	var GTextField=(function(_super){
		function GTextField(){
			this._gearColor=null;
			GTextField.__super.call(this);
			this._gearColor=new GearColor(this);
		}

		__class(GTextField,'fairygui.GTextField',_super);
		var __proto=GTextField.prototype;
		Laya.imps(__proto,{"fairygui.IColorGear":true})
		__proto.handleControllerChanged=function(c){
			_super.prototype.handleControllerChanged.call(this,c);
			if(this._gearColor.controller==c)
				this._gearColor.apply();
		}

		__proto.setup_beforeAdd=function(xml){
			_super.prototype.setup_beforeAdd.call(this,xml);
			var str;
			this.asPassword=xml.getAttribute("password")=="true";
			str=xml.getAttribute("font");
			if (str)
				this.font=str;
			str=xml.getAttribute("fontSize");
			if (str)
				this.fontSize=parseInt(str);
			str=xml.getAttribute("color");
			if (str)
				this.color=str;
			str=xml.getAttribute("align");
			if (str)
				this.align=str;
			str=xml.getAttribute("vAlign");
			if (str)
				this.valign=str;
			str=xml.getAttribute("leading");
			if (str)
				this.leading=parseInt(str);
			else
			this.leading=3;
			str=xml.getAttribute("letterSpacing");
			if (str)
				this.letterSpacing=parseInt(str);
			this.ubbEnabled=xml.getAttribute("ubb")=="true";
			this.italic=xml.getAttribute("italic")=="true";
			this.bold=xml.getAttribute("bold")=="true";
			this.singleLine=xml.getAttribute("singleLine")=="true";
			str=xml.getAttribute("strokeColor");
			if (str){
				this.strokeColor=str;
				str=xml.getAttribute("strokeSize");
				if(str)
					this.stroke=parseInt(str)+1;
				else
				this.stroke=2;
			}
		}

		__proto.setup_afterAdd=function(xml){
			_super.prototype.setup_afterAdd.call(this,xml);
			var str=xml.getAttribute("text");
			if(str !=null && str.length > 0)
				this.text=str;
			var cxml=ToolSet.findChildNode(xml,"gearColor");
			if(cxml)
				this._gearColor.setup(cxml);
		}

		__getset(0,__proto,'font',function(){
			return null;
			},function(value){
		});

		__getset(0,__proto,'italic',function(){
			return false;
			},function(value){
		});

		__getset(0,__proto,'valign',function(){
			return null;
			},function(value){
		});

		__getset(0,__proto,'fontSize',function(){
			return 0;
			},function(value){
		});

		__getset(0,__proto,'color',function(){
			return null;
			},function(value){
		});

		__getset(0,__proto,'strokeColor',function(){
			return null;
			},function(value){
		});

		__getset(0,__proto,'align',function(){
			return null;
			},function(value){
		});

		__getset(0,__proto,'bold',function(){
			return false;
			},function(value){
		});

		__getset(0,__proto,'leading',function(){
			return 0;
			},function(value){
		});

		__getset(0,__proto,'letterSpacing',function(){
			return 0;
			},function(value){
		});

		__getset(0,__proto,'asPassword',function(){
			return false;
			},function(value){
		});

		__getset(0,__proto,'singleLine',function(){
			return false;
			},function(value){
		});

		__getset(0,__proto,'stroke',function(){
			return 0;
			},function(value){
		});

		__getset(0,__proto,'ubbEnabled',function(){
			return false;
			},function(value){
		});

		__getset(0,__proto,'textWidth',function(){
			return 0;
		});

		__getset(0,__proto,'gearColor',function(){
			return this._gearColor;
		});

		return GTextField;
	})(GObject)


	//class fairygui.GComponent extends fairygui.GObject
	var GComponent=(function(_super){
		function GComponent(){
			this._sortingChildCount=0;
			this._opaque=false;
			this._margin=null;
			this._trackBounds=false;
			this._boundsChanged=false;
			this._buildingDisplayList=false;
			this._children=null;
			this._controllers=null;
			this._transitions=null;
			this._container=null;
			this._scrollPane=null;
			GComponent.__super.call(this);
			this._children=[];
			this._controllers=[];
			this._transitions=[];
			this._margin=new Margin();
		}

		__class(GComponent,'fairygui.GComponent',_super);
		var __proto=GComponent.prototype;
		__proto.createDisplayObject=function(){
			_super.prototype.createDisplayObject.call(this);
			this._displayObject.mouseEnabled=true;
			this._container=this._displayObject;
		}

		__proto.dispose=function(){
			var numChildren=this._children.length;
			for(var i=numChildren-1;i >=0;--i){
				var obj=this._children[i];
				obj.parent=null;
				obj.dispose();
			}
			_super.prototype.dispose.call(this);
		}

		__proto.addChild=function(child){
			this.addChildAt(child,this._children.length);
			return child;
		}

		__proto.addChildAt=function(child,index){
			(index===void 0)&& (index=0);
			if(!child)
				throw "child is null";
			var numChildren=this._children.length;
			if(index >=0 && index <=numChildren){
				if(child.parent==this){
					this.setChildIndex(child,index);
				}
				else {
					child.removeFromParent();
					child.parent=this;
					var cnt=this._children.length;
					if(child.sortingOrder !=0){
						this._sortingChildCount++;
						index=this.getInsertPosForSortingChild(child);
					}
					else if(this._sortingChildCount > 0){
						if(index > (cnt-this._sortingChildCount))
							index=cnt-this._sortingChildCount;
					}
					if(index==cnt)
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

		__proto.getInsertPosForSortingChild=function(target){
			var cnt=this._children.length;
			var i=0;
			for(i=0;i < cnt;i++){
				var child=this._children[i];
				if(child==target)
					continue ;
				if(target.sortingOrder < child.sortingOrder)
					break ;
			}
			return i;
		}

		__proto.removeChild=function(child,dispose){
			(dispose===void 0)&& (dispose=false);
			var childIndex=this._children.indexOf(child);
			if(childIndex !=-1){
				this.removeChildAt(childIndex,dispose);
			}
			return child;
		}

		__proto.removeChildAt=function(index,dispose){
			(dispose===void 0)&& (dispose=false);
			if(index >=0 && index < this.numChildren){
				var child=this._children[index];
				child.parent=null;
				if(child.sortingOrder !=0)
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

		__proto.removeChildren=function(beginIndex,endIndex,dispose){
			(beginIndex===void 0)&& (beginIndex=0);
			(endIndex===void 0)&& (endIndex=-1);
			(dispose===void 0)&& (dispose=false);
			if(endIndex < 0 || endIndex >=this.numChildren)
				endIndex=this.numChildren-1;
			for(var i=beginIndex;i <=endIndex;++i)
			this.removeChildAt(beginIndex,dispose);
		}

		__proto.getChildAt=function(index){
			(index===void 0)&& (index=0);
			if(index >=0 && index < this.numChildren)
				return this._children[index];
			else
			throw "Invalid child index";
		}

		__proto.getChild=function(name){
			var cnt=this._children.length;
			for(var i=0;i < cnt;++i){
				if(this._children[i].name==name)
					return this._children[i];
			}
			return null;
		}

		__proto.getVisibleChild=function(name){
			var cnt=this._children.length;
			for(var i=0;i < cnt;++i){
				var child=this._children[i];
				if(child.finalVisible && child.name==name)
					return child;
			}
			return null;
		}

		__proto.getChildInGroup=function(name,group){
			var cnt=this._children.length;
			for(var i=0;i < cnt;++i){
				var child=this._children[i];
				if(child.group==group && child.name==name)
					return child;
			}
			return null;
		}

		__proto.getChildById=function(id){
			var cnt=this._children.length;
			for(var i=0;i < cnt;++i){
				if(this._children[i]._id==id)
					return this._children[i];
			}
			return null;
		}

		__proto.getChildIndex=function(child){
			return this._children.indexOf(child);
		}

		__proto.setChildIndex=function(child,index){
			(index===void 0)&& (index=0);
			var oldIndex=this._children.indexOf(child);
			if(oldIndex==-1)
				throw "Not a child of this container";
			if(child.sortingOrder !=0)
				return;
			var cnt=this._children.length;
			if(this._sortingChildCount > 0){
				if(index > (cnt-this._sortingChildCount-1))
					index=cnt-this._sortingChildCount-1;
			}
			this._setChildIndex(child,oldIndex,index);
		}

		__proto._setChildIndex=function(child,oldIndex,index){
			(index===void 0)&& (index=0);
			var cnt=this._children.length;
			if(index > cnt)
				index=cnt;
			if(oldIndex==index)
				return;
			this._children.splice(oldIndex,1);
			this._children.splice(index,0,child);
			if(child.inContainer){
				var displayIndex=0;
				for(var i=0;i < index;i++){
					var g=this._children[i];
					if(g.inContainer)
						displayIndex++;
				}
				if(displayIndex==this._container.numChildren)
					displayIndex--;
				this._container.setChildIndex(child.displayObject,displayIndex);
				this.setBoundsChangedFlag();
			}
		}

		__proto.swapChildren=function(child1,child2){
			var index1=this._children.indexOf(child1);
			var index2=this._children.indexOf(child2);
			if(index1==-1 || index2==-1)
				throw "Not a child of this container";
			this.swapChildrenAt(index1,index2);
		}

		__proto.swapChildrenAt=function(index1,index2){
			(index2===void 0)&& (index2=0);
			var child1=this._children[index1];
			var child2=this._children[index2];
			this.setChildIndex(child1,index2);
			this.setChildIndex(child2,index1);
		}

		__proto.addController=function(controller){
			this._controllers.push(controller);
			controller._parent=this;
			this.applyController(controller);
		}

		__proto.getControllerAt=function(index){
			return this._controllers[index];
		}

		__proto.getController=function(name){
			var cnt=this._controllers.length;
			for(var i=0;i < cnt;++i){
				var c=this._controllers[i];
				if(c.name==name)
					return c;
			}
			return null;
		}

		__proto.removeController=function(c){
			var index=this._controllers.indexOf(c);
			if(index==-1)
				throw new Error("controller not exists");
			c._parent=null;
			this._controllers.splice(index,1);
			var length=this._children.length;
			for(var i=0;i < length;i++){
				var child=this._children[i];
				child.handleControllerChanged(c);
			}
		}

		__proto.childStateChanged=function(child){
			if(this._buildingDisplayList)
				return;
			if((child instanceof fairygui.GGroup )){
				var length=this._children.length;
				for(var i=0;i < length;i++){
					var g=this._children[i];
					if(g.group==child)
						this.childStateChanged(g);
				}
				return;
			}
			if(!child.displayObject)
				return;
			if(child.finalVisible){
				if(!child.displayObject.parent){
					var index=0;
					var length1=this._children.length;
					for(var i1=0;i1 < length1;i1++){
						g=this._children[i1];
						if(g==child)
							break ;
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

		__proto.applyController=function(c){
			var child;
			var length=this._children.length;
			for(var i=0;i < length;i++){
				child=this._children[i];
				child.handleControllerChanged(c);
			}
		}

		__proto.applyAllControllers=function(){
			var cnt=this._controllers.length;
			for(var i=0;i < cnt;++i){
				this.applyController(this._controllers[i]);
			}
		}

		__proto.adjustRadioGroupDepth=function(obj,c){
			var cnt=this._children.length;
			var i=NaN;
			var child;
			var myIndex=-1,maxIndex=-1;
			for(i=0;i < cnt;i++){
				child=this._children[i];
				if(child==obj){
					myIndex=i;
				}
				else if(((child instanceof fairygui.GButton ))
				&& (child).relatedController==c){
					if(i > maxIndex)
						maxIndex=i;
				}
			}
			if(myIndex < maxIndex)
				this.swapChildrenAt(myIndex,maxIndex);
		}

		__proto.getTransitionAt=function(index){
			return this._transitions[index];
		}

		__proto.getTransition=function(transName){
			var cnt=this._transitions.length;
			for(var i=0;i < cnt;++i){
				var trans=this._transitions[i];
				if(trans.name==transName)
					return trans;
			}
			return null;
		}

		__proto.isChildInView=function(child){
			if(this._displayObject.mask !=null){
				return child.x+child.width >=0 && child.x <=this.width
				&& child.y+child.height >=0 && child.y <=this.height;
			}
			else if(this._scrollPane !=null){
				return this._scrollPane.isChildInView(child);
			}
			else
			return true;
		}

		__proto.getFirstChildInView=function(){
			var cnt=this._children.length;
			for(var i=0;i < cnt;++i){
				var child=this._children[i];
				if(this.isChildInView(child))
					return i;
			}
			return-1;
		}

		__proto.updateOpaque=function(){
			if(!this._displayObject.hitArea)
				this._displayObject.hitArea=new Rectangle();
			this._displayObject.hitArea.setTo(0,0,this.width,this.height);
		}

		__proto.updateMask=function(){
			var left=this._margin.left;
			var top=this._margin.top;
			var w=this.width-(this._margin.left+this._margin.right);
			var h=this.height-(this._margin.top+this._margin.bottom);
			if(this._displayObject.mask==null){
				this._displayObject.mask=new Sprite();
				this._displayObject.mask.graphics.drawRect(left,top,w,h,"#000000");
			}
			else {
				this._displayObject.mask.graphics.clear();
				this._displayObject.mask.graphics.drawRect(left,top,w,h,"#000000");
			}
		}

		__proto.setupScroll=function(scrollBarMargin,scroll,scrollBarDisplay,flags,vtScrollBarRes,hzScrollBarRes){
			this._container=new Sprite();
			this._displayObject.addChild(this._container);
			this._scrollPane=new ScrollPane(this,scroll,scrollBarMargin,scrollBarDisplay,flags,vtScrollBarRes,hzScrollBarRes);
			this.setBoundsChangedFlag();
		}

		__proto.setupOverflow=function(overflow){
			if(overflow==1){
				this._container=new Sprite();
				this._displayObject.addChild(this._container);
				this.updateMask();
				this._container.pos(this._margin.left,this._margin.top);
			}
			else if(this._margin.left !=0 || this._margin.top !=0){
				this._container=new Sprite();
				this._displayObject.addChild(this._container);
				this._container.pos(this._margin.left,this._margin.top);
			}
			this.setBoundsChangedFlag();
		}

		__proto.handleSizeChanged=function(){
			_super.prototype.handleSizeChanged.call(this);
			if(this._scrollPane)
				this._scrollPane.setSize(this.width,this.height);
			else if(this._displayObject.mask !=null)
			this.updateMask();
			if(this._opaque)
				this.updateOpaque();
		}

		__proto.handleGrayChanged=function(){
			var c=this.getController("grayed");
			if(c !=null){
				c.selectedIndex=this.grayed ? 1 :0;
				return;
			};
			var v=this.grayed;
			var cnt=this._children.length;
			for(var i=0;i < cnt;++i){
				this._children[i].grayed=v;
			}
		}

		__proto.setBoundsChangedFlag=function(){
			if (!this._scrollPane && !this._trackBounds)
				return;
			if (!this._boundsChanged){
				this._boundsChanged=true;
				Laya.timer.callLater(this,this.__render);
			}
		}

		__proto.__render=function(){
			if (this._boundsChanged)
				this.updateBounds();
		}

		__proto.ensureBoundsCorrect=function(){
			if (this._boundsChanged)
				this.updateBounds();
		}

		__proto.updateBounds=function(){
			var ax=NaN,ay=NaN,aw=NaN,ah=0;
			if(this._children.length > 0){
				ax=Number.POSITIVE_INFINITY,ay=Number.POSITIVE_INFINITY;
				var ar=Number.NEGATIVE_INFINITY,ab=Number.NEGATIVE_INFINITY;
				var tmp=0;
				var i=0;
				var length1=this._children.length;
				for(i1=0;i1 < length1;i1++){
					child=this._children[i1];
					child.ensureSizeCorrect();
				}
				for(var i1=0;i1 < length1;i1++){
					var child=this._children[i1];
					tmp=child.x;
					if(tmp < ax)
						ax=tmp;
					tmp=child.y;
					if(tmp < ay)
						ay=tmp;
					tmp=child.x+child.actualWidth;
					if(tmp > ar)
						ar=tmp;
					tmp=child.y+child.actualHeight;
					if(tmp > ab)
						ab=tmp;
				}
				aw=ar-ax;
				ah=ab-ay;
			}
			else {
				ax=0;
				ay=0;
				aw=0;
				ah=0;
			}
			this.setBounds(ax,ay,aw,ah);
		}

		__proto.setBounds=function(ax,ay,aw,ah){
			(ah===void 0)&& (ah=0);
			this._boundsChanged=false;
			if (this._scrollPane)
				this._scrollPane.setContentSize(Math.round(ax+aw),Math.round(ay+ah));
		}

		__proto.getSnappingPosition=function(xValue,yValue,resultPoint){
			if(!resultPoint)
				resultPoint=new Point();
			var cnt=this._children.length;
			if(cnt==0){
				resultPoint.x=0;
				resultPoint.y=0;
				return resultPoint;
			}
			this.ensureBoundsCorrect();
			var obj=null;
			var prev=null;
			var i=0;
			if(yValue !=0){
				for(;i < cnt;i++){
					obj=this._children[i];
					if(yValue < obj.y){
						if(i==0){
							yValue=0;
							break ;
						}
						else {
							prev=this._children[i-1];
							if(yValue < prev.y+prev.actualHeight / 2)
								yValue=prev.y;
							else
							yValue=obj.y;
							break ;
						}
					}
				}
				if(i==cnt)
					yValue=obj.y;
			}
			if(xValue !=0){
				if(i > 0)
					i--;
				for(;i < cnt;i++){
					obj=this._children[i];
					if(xValue < obj.x){
						if(i==0){
							xValue=0;
							break ;
						}
						else {
							prev=this._children[i-1];
							if(xValue < prev.x+prev.actualWidth / 2)
								xValue=prev.x;
							else
							xValue=obj.x;
							break ;
						}
					}
				}
				if(i==cnt)
					xValue=obj.x;
			}
			resultPoint.x=xValue;
			resultPoint.y=yValue;
			return resultPoint;
		}

		__proto.childSortingOrderChanged=function(child,oldValue,newValue){
			(newValue===void 0)&& (newValue=0);
			if (newValue==0){
				this._sortingChildCount--;
				this.setChildIndex(child,this._children.length);
			}
			else {
				if (oldValue==0)
					this._sortingChildCount++;
				var oldIndex=this._children.indexOf(child);
				var index=this.getInsertPosForSortingChild(child);
				if (oldIndex < index)
					this._setChildIndex(child,oldIndex,index-1);
				else
				this._setChildIndex(child,oldIndex,index);
			}
		}

		__proto.constructFromResource=function(pkgItem){
			this._packageItem=pkgItem;
			this.constructFromXML(this._packageItem.owner.getItemAsset(this._packageItem));
		}

		__proto.constructFromXML=function(xml){
			this._underConstruct=true;
			var str;
			var arr;
			str=xml.getAttribute("size");
			arr=str.split(",");
			this._sourceWidth=parseInt(arr[0]);
			this._sourceHeight=parseInt(arr[1]);
			this._initWidth=this._sourceWidth;
			this._initHeight=this._sourceHeight;
			this.setSize(this._sourceWidth,this._sourceHeight);
			str=xml.getAttribute("pivot");
			if(str){
				arr=str.split(",");
				str=xml.getAttribute("anchor");
				this.internalSetPivot(parseFloat(arr[0]),parseFloat(arr[1]),str=="true");
			}
			str=xml.getAttribute("opaque");
			this.opaque=str !="false";
			var overflow=0;
			str=xml.getAttribute("overflow");
			if (str)
				overflow=OverflowType.parse(str);
			else
			overflow=0;
			str=xml.getAttribute("margin");
			if(str)
				this._margin.parse(str);
			if(overflow==2){
				var scroll=0;
				str=xml.getAttribute("scroll");
				if (str)
					scroll=ScrollType.parse(str);
				else
				scroll=1;
				var scrollBarDisplay=0;
				str=xml.getAttribute("scrollBar");
				if (str)
					scrollBarDisplay=ScrollBarDisplayType.parse(str);
				else
				scrollBarDisplay=0;
				var scrollBarFlags=NaN;
				str=xml.getAttribute("scrollBarFlags");
				if(str)
					scrollBarFlags=parseInt(str);
				else
				scrollBarFlags=0;
				var scrollBarMargin=new Margin();
				str=xml.getAttribute("scrollBarMargin");
				if(str)
					scrollBarMargin.parse(str);
				var vtScrollBarRes;
				var hzScrollBarRes;
				str=xml.getAttribute("scrollBarRes");
				if(str){
					arr=str.split(",");
					vtScrollBarRes=arr[0];
					hzScrollBarRes=arr[1];
				}
				this.setupScroll(scrollBarMargin,scroll,scrollBarDisplay,scrollBarFlags,vtScrollBarRes,hzScrollBarRes);
			}
			else
			this.setupOverflow(overflow);
			this._buildingDisplayList=true;
			var col=xml.childNodes;
			if(col){
				var displayList;
				var controller;
				var length1=col.length;
				for(var i1=0;i1 < length1;i1++){
					var cxml=col[i1];
					if(cxml.nodeName=="displayList"){
						displayList=cxml.childNodes;
						continue ;
					}
					else if(cxml.nodeName=="controller"){
						controller=new Controller();
						this._controllers.push(controller);
						controller._parent=this;
						controller.setup(cxml);
					}
				}
				if(displayList.length>0){
					var u;
					var length2=displayList.length;
					for(var i2=0;i2 < length2;i2++){
						cxml=displayList[i2];
						if(cxml.nodeType!=1)
							continue ;
						u=this.constructChild(cxml);
						if(!u)
							continue ;
						u._underConstruct=true;
						u._constructingData=cxml;
						u.setup_beforeAdd(cxml);
						this.addChild(u);
					}
				}
				this.relations.setup(xml);
				length2=this._children.length;
				for(i2=0;i2 < length2;i2++){
					u=this._children[i2];
					u.relations.setup(u._constructingData);
				}
				for(i2=0;i2 < length2;i2++){
					u=this._children[i2];
					u.setup_afterAdd(u._constructingData);
					u._underConstruct=false;
					u._constructingData=null;
				};
				var trans;
				for(i1=0;i1 < length1;i1++){
					cxml=col[i1];
					if(cxml.nodeName=="transition"){
						trans=new Transition(this);
						this._transitions.push(trans);
						trans.setup(cxml);
					}
				}
				if(this._transitions.length>0){
					this.displayObject.on("display",this,this.___added);
					this.displayObject.on("undisplay",this,this.___removed);
				}
			}
			this.applyAllControllers();
			this._buildingDisplayList=false;
			this._underConstruct=false;
			length1=this._children.length;
			for (i1=0;i1 < length1;i1++){
				var child=this._children[i1];
				if (child.displayObject !=null && child.finalVisible)
					this._container.addChild(child.displayObject);
			}
		}

		__proto.___added=function(){
			var cnt=this._transitions.length;
			for(var i=0;i < cnt;++i){
				var trans=this._transitions[i];
				if(trans.autoPlay)
					trans.play(null,trans.autoPlayRepeat,trans.autoPlayDelay);
			}
		}

		__proto.___removed=function(){
			var cnt=this._transitions.length;
			for(var i=0;i < cnt;++i){
				var trans=this._transitions[i];
				trans.stop(false,true);
			}
		}

		__proto.constructChild=function(xml){
			var pkgId=xml.getAttribute("pkg");
			var thisPkg=this._packageItem.owner;
			var pkg;
			if (pkgId && pkgId !=thisPkg.id){
				pkg=UIPackage.getById(pkgId);
				if (!pkg)
					return null;
			}
			else
			pkg=thisPkg;
			var src=xml.getAttribute("src");
			if (src){
				var pi=pkg.getItem(src);
				if (!pi)
					return null;
				var g=pkg.createObject2(pi);
				return g;
			}
			else {
				var str=xml.nodeName;
				if (str=="text" && xml.getAttribute("input")=="true")
					g=new GTextInput();
				else
				g=UIObjectFactory.newObject2(str);
				return g;
			}
		}

		__getset(0,__proto,'displayListContainer',function(){
			return this._container;
		});

		__getset(0,__proto,'numChildren',function(){
			return this._children.length;
		});

		__getset(0,__proto,'viewWidth',function(){
			if (this._scrollPane !=null)
				return this._scrollPane.viewWidth;
			else
			return this.width-this._margin.left-this._margin.right;
			},function(value){
			if (this._scrollPane !=null)
				this._scrollPane.viewWidth=value;
			else
			this.width=value+this._margin.left+this._margin.right;
		});

		__getset(0,__proto,'controllers',function(){
			return this._controllers;
		});

		__getset(0,__proto,'scrollPane',function(){
			return this._scrollPane;
		});

		__getset(0,__proto,'opaque',function(){
			return this._opaque;
			},function(value){
			if(this._opaque !=value){
				this._opaque=value;
				if(this._opaque)
					this.updateOpaque();
				else
				this._displayObject.hitArea=null;
			}
		});

		__getset(0,__proto,'margin',function(){
			return this._margin;
			},function(value){
			this._margin.copy(value);
			if(this._displayObject.mask){
				this._container.pos(this._margin.left,this._margin.top);
			}
			this.handleSizeChanged();
		});

		__getset(0,__proto,'viewHeight',function(){
			if (this._scrollPane !=null)
				return this._scrollPane.viewHeight;
			else
			return this.height-this._margin.top-this._margin.bottom;
			},function(value){
			if (this._scrollPane !=null)
				this._scrollPane.viewHeight=value;
			else
			this.height=value+this._margin.top+this._margin.bottom;
		});

		return GComponent;
	})(GObject)


	//class fairygui.GearAnimation extends fairygui.GearBase
	var GearAnimation=(function(_super){
		var GearAnimationValue;
		function GearAnimation(owner){
			this._storage=null;
			this._default=null;
			GearAnimation.__super.call(this,owner);
		}

		__class(GearAnimation,'fairygui.GearAnimation',_super);
		var __proto=GearAnimation.prototype;
		__proto.init=function(){
			this._default=new GearAnimationValue((this._owner).playing,
			(this._owner).frame);
			this._storage={};
		}

		__proto.addStatus=function(pageId,value){
			var gv;
			if (pageId==null)
				gv=this._default;
			else {
				gv=new GearAnimationValue();
				this._storage[pageId]=gv;
			};
			var arr=value.split(",");
			gv.frame=parseInt(arr[0]);
			gv.playing=arr[1]=="p";
		}

		__proto.apply=function(){
			this._owner._gearLocked=true;
			var gv=this._storage[this._controller.selectedPageId];
			if (!gv)
				gv=this._default;
			(this._owner).frame=gv.frame;
			(this._owner).playing=gv.playing;
			this._owner._gearLocked=false;
		}

		__proto.updateState=function(){
			if (this._owner._gearLocked)
				return;
			var mc=(this._owner);
			var gv=this._storage[this._controller.selectedPageId];
			if(!gv){
				gv=new GearAnimationValue();
				this._storage[this._controller.selectedPageId]=gv;
			}
			gv.frame=mc.frame;
			gv.playing=mc.playing;
		}

		GearAnimation.__init$=function(){
			//class GearAnimationValue
			GearAnimationValue=(function(){
				function GearAnimationValue(playing,frame){
					this.playing=false;
					this.frame=NaN;
					(playing===void 0)&& (playing=true);
					(frame===void 0)&& (frame=0);
					this.playing=playing;
					this.frame=frame;
				}
				__class(GearAnimationValue,'');
				return GearAnimationValue;
			})()
		}

		return GearAnimation;
	})(GearBase)


	//class fairygui.GearColor extends fairygui.GearBase
	var GearColor=(function(_super){
		function GearColor(owner){
			this._storage=null;
			this._default=null;
			GearColor.__super.call(this,owner);
		}

		__class(GearColor,'fairygui.GearColor',_super);
		var __proto=GearColor.prototype;
		__proto.init=function(){
			this._default=(this._owner).color;
			this._storage={};
		}

		__proto.addStatus=function(pageId,value){
			if (pageId==null)
				this._default=value;
			else
			this._storage[pageId]=value;
		}

		__proto.apply=function(){
			this._owner._gearLocked=true;
			var data=this._storage[this._controller.selectedPageId];
			if (data !=undefined)
				(this._owner).color=data;
			else
			(this._owner).color=this._default;
			this._owner._gearLocked=false;
		}

		__proto.updateState=function(){
			if (this._owner._gearLocked)
				return;
			this._storage[this._controller.selectedPageId]=(this._owner).color;
		}

		return GearColor;
	})(GearBase)


	//class fairygui.GearDisplay extends fairygui.GearBase
	var GearDisplay=(function(_super){
		function GearDisplay(owner){
			this.pages=null;
			GearDisplay.__super.call(this,owner);
		}

		__class(GearDisplay,'fairygui.GearDisplay',_super);
		var __proto=GearDisplay.prototype;
		__proto.init=function(){
			if(this.pages==null)
				this.pages=[];
			else
			this.pages.length=0;
		}

		__proto.apply=function(){
			if(this._controller && this.pages!=null && this.pages.length>0
				&& this.pages.indexOf(this._controller.selectedPageId)!=-1)
			this._owner.internalVisible++;
			else
			this._owner.internalVisible=0;
		}

		return GearDisplay;
	})(GearBase)


	//class fairygui.GGraph extends fairygui.GObject
	var GGraph=(function(_super){
		function GGraph(){
			this._type=NaN;
			this._lineSize=NaN;
			this._lineColor=null;
			this._fillColor=null;
			GGraph.__super.call(this);
			this._type=0;
			this._lineSize=1;
			this._lineColor="#000000"
			this._fillColor="#FFFFFF";
		}

		__class(GGraph,'fairygui.GGraph',_super);
		var __proto=GGraph.prototype;
		__proto.drawRect=function(lineSize,lineColor,fillColor){
			this._type=1;
			this._lineSize=lineSize;
			this._lineColor=lineColor;
			this._fillColor=fillColor;
			this.drawCommon();
		}

		__proto.drawEllipse=function(lineSize,lineColor,fillColor){
			this._type=2;
			this._lineSize=lineSize;
			this._lineColor=lineColor;
			this._fillColor=fillColor;
			this.drawCommon();
		}

		__proto.drawCommon=function(){
			this._displayObject.mouseEnabled=this.touchable;
			var gr=this._displayObject.graphics;
			gr.clear();
			var w=this.width;
			var h=this.height;
			if(w==0 || h==0)
				return;
			var fillColor=this._fillColor;
			var lineColor=this._lineColor;
			if(Render.isWebGL && ToolSet.startsWith(fillColor,"rgba")){
				var arr=fillColor.substring(5,fillColor.lastIndexOf(")")).split(",");
				var a=parseFloat(arr[3]);
				if(a==0)
					fillColor=null;
				else {
					fillColor=Utils.toHexColor((parseInt(arr[0])<<16)+(parseInt(arr[1])<<8)+parseInt(arr[2]));
					this.alpha=a;
				}
			}
			gr.drawRect(0,0,w,h,fillColor,this._lineSize>0?lineColor:null,this._lineSize);
			this._displayObject.repaint();
		}

		__proto.replaceMe=function(target){
			if (!this._parent)
				throw "parent not set";
			target.name=this.name;
			target.alpha=this.alpha;
			target.rotation=this.rotation;
			target.visible=this.visible;
			target.touchable=this.touchable;
			target.grayed=this.grayed;
			target.setXY(this.x,this.y);
			target.setSize(this.width,this.height);
			var index=this._parent.getChildIndex(this);
			this._parent.addChildAt(target,index);
			target.relations.copyFrom(this.relations);
			this._parent.removeChild(this,true);
		}

		__proto.addBeforeMe=function(target){
			if (this._parent==null)
				throw "parent not set";
			var index=this._parent.getChildIndex(this);
			this._parent.addChildAt(target,index);
		}

		__proto.addAfterMe=function(target){
			if (this._parent==null)
				throw "parent not set";
			var index=this._parent.getChildIndex(this);
			index++;
			this._parent.addChildAt(target,index);
		}

		__proto.setNativeObject=function(obj){
			this._type=0;
			this._displayObject.mouseEnabled=this.touchable;
			this._displayObject.graphics.clear();
			this._displayObject.addChild(obj);
		}

		__proto.createDisplayObject=function(){
			_super.prototype.createDisplayObject.call(this);
			this._displayObject.mouseEnabled=false;
		}

		__proto.handleSizeChanged=function(){
			_super.prototype.handleSizeChanged.call(this);
			if(this._type !=0)
				this.drawCommon();
		}

		__proto.setup_beforeAdd=function(xml){
			_super.prototype.setup_beforeAdd.call(this,xml);
			var type=xml.getAttribute("type");
			if (type!=null && type!="empty"){
				var str;
				str=xml.getAttribute("lineSize");
				if (str)
					this._lineSize=parseInt(str);
				str=xml.getAttribute("lineColor");
				if (str){
					var c=ToolSet.convertFromHtmlColor(str,true);
					var a=((c >> 24)& 0xFF)/ 0xFF;
					if(a!=1)
						this._lineColor="rgba("+((c>>16)& 0xFF)+","+((c>>8)& 0xFF)+","+(c & 0xFF)+","+a+")";
					else
					this._lineColor=Utils.toHexColor(c & 0xFFFFFF);
				}
				str=xml.getAttribute("fillColor");
				if (str){
					c=ToolSet.convertFromHtmlColor(str,true);
					a=((c >> 24)& 0xFF)/ 0xFF;
					if(a!=1)
						this._fillColor="rgba("+((c>>16)& 0xFF)+","+((c>>8)& 0xFF)+","+(c & 0xFF)+","+a+")";
					else
					this._fillColor=Utils.toHexColor(c & 0xFFFFFF);
				}
				if (type=="rect")
					this._type=1;
				else
				this._type=2;
				this.drawCommon();
			}
		}

		return GGraph;
	})(GObject)


	//class fairygui.GearLook extends fairygui.GearBase
	var GearLook=(function(_super){
		var GearLookValue;
		function GearLook(owner){
			this._storage=null;
			this._default=null;
			this._tweenValue=null;
			this._tweener=null;
			GearLook.__super.call(this,owner);
		}

		__class(GearLook,'fairygui.GearLook',_super);
		var __proto=GearLook.prototype;
		__proto.init=function(){
			this._default=new GearLookValue(this._owner.alpha,this._owner.rotation,this._owner.grayed);
			this._storage={};
		}

		__proto.addStatus=function(pageId,value){
			var arr=value.split(",");
			var gv;
			if(pageId==null)
				gv=this._default;
			else {
				gv=new GearLookValue();
				this._storage[pageId]=gv;
			}
			gv.alpha=parseFloat(arr[0]);
			gv.rotation=parseInt(arr[1]);
			gv.grayed=arr[2]=="1" ? true :false;
		}

		__proto.apply=function(){
			var gv=this._storage[this._controller.selectedPageId];
			if(!gv)
				gv=this._default;
			if(this._tweener)
				this._tweener.complete();
			if(this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect){
				this._owner._gearLocked=true;
				this._owner.grayed=gv.grayed;
				this._owner._gearLocked=false;
				var a=gv.alpha !=this._owner.alpha;
				var b=gv.rotation !=this._owner.rotation;
				if(a || b){
					this._owner.internalVisible++;
					if(this._tweenValue==null)
						this._tweenValue=new Point();
					this._tweenValue.x=this._owner.alpha;
					this._tweenValue.y=this._owner.rotation;
					this._tweener=Tween.to(this._tweenValue,
					{x:gv.alpha,y:gv.rotation },
					this._tweenTime*1000,
					this._easeType,
					Handler.create(this,this.__tweenComplete),
					this._delay*1000);
					this._tweener.update=Handler.create(this,this.__tweenUpdate,[a,b],false);
				}
			}
			else {
				this._owner._gearLocked=true;
				this._owner.grayed=gv.grayed;
				this._owner.alpha=gv.alpha;
				this._owner.rotation=gv.rotation;
				this._owner._gearLocked=false;
			}
		}

		__proto.__tweenUpdate=function(a,b){
			this._owner._gearLocked=true;
			if(a)
				this._owner.alpha=this._tweenValue.x;
			if(b)
				this._owner.rotation=this._tweenValue.y;
			this._owner._gearLocked=false;
		}

		__proto.__tweenComplete=function(){
			this._owner.internalVisible--;
			this._tweener=null;
		}

		__proto.updateState=function(){
			if(this._owner._gearLocked)
				return;
			var gv=this._storage[this._controller.selectedPageId];
			if(!gv){
				gv=new GearLookValue();
				this._storage[this._controller.selectedPageId]=gv;
			}
			gv.alpha=this._owner.alpha;
			gv.rotation=this._owner.rotation;
			gv.grayed=this._owner.grayed;
		}

		GearLook.__init$=function(){
			//class GearLookValue
			GearLookValue=(function(){
				function GearLookValue(alpha,rotation,grayed){
					this.alpha=NaN;
					this.rotation=NaN;
					this.grayed=false;
					(alpha===void 0)&& (alpha=0);
					(rotation===void 0)&& (rotation=0);
					(grayed===void 0)&& (grayed=false);
					this.alpha=alpha;
					this.rotation=rotation;
					this.grayed=grayed;
				}
				__class(GearLookValue,'');
				return GearLookValue;
			})()
		}

		return GearLook;
	})(GearBase)


	//class fairygui.GGroup extends fairygui.GObject
	var GGroup=(function(_super){
		function GGroup(){
			this._updating=false;
			this._empty=false;
			GGroup.__super.call(this);
		}

		__class(GGroup,'fairygui.GGroup',_super);
		var __proto=GGroup.prototype;
		__proto.updateBounds=function(){
			if (this._updating || !this.parent)
				return;
			var cnt=this._parent.numChildren;
			var i=0;
			var child;
			var ax=Number.POSITIVE_INFINITY,ay=Number.POSITIVE_INFINITY;
			var ar=Number.NEGATIVE_INFINITY,ab=Number.NEGATIVE_INFINITY;
			var tmp=0;
			this._empty=true;
			for (i=0;i < cnt;i++){
				child=this._parent.getChildAt(i);
				if (child.group==this){
					tmp=child.x;
					if (tmp < ax)
						ax=tmp;
					tmp=child.y;
					if (tmp < ay)
						ay=tmp;
					tmp=child.x+child.width;
					if (tmp > ar)
						ar=tmp;
					tmp=child.y+child.height;
					if (tmp > ab)
						ab=tmp;
					this._empty=false;
				}
			}
			this._updating=true;
			if (!this._empty){
				this.setXY(ax,ay);
				this.setSize(ar-ax,ab-ay);
			}
			else
			this.setSize(0,0);
			this._updating=false;
		}

		__proto.moveChildren=function(dx,dy){
			if (this._updating || !this.parent)
				return;
			this._updating=true;
			var cnt=this._parent.numChildren;
			var i=0;
			var child;
			for (i=0;i < cnt;i++){
				child=this._parent.getChildAt(i);
				if (child.group==this){
					child.setXY(child.x+dx,child.y+dy);
				}
			}
			this._updating=false;
		}

		__proto.updateAlpha=function(){
			_super.prototype.updateAlpha.call(this);
			if(this._underConstruct)
				return;
			var cnt=this._parent.numChildren;
			var i=NaN;
			var child;
			for(i=0;i<cnt;i++){
				child=this._parent.getChildAt(i);
				if(child.group==this)
					child.alpha=this.alpha;
			}
		}

		return GGroup;
	})(GObject)


	//class fairygui.GImage extends fairygui.GObject
	var GImage=(function(_super){
		function GImage(){
			this.image=null;
			this._color=null;
			this._flip=0;
			this._gearColor=null;
			GImage.__super.call(this);
			this._color="#FFFFFF";
			this._gearColor=new GearColor(this);
		}

		__class(GImage,'fairygui.GImage',_super);
		var __proto=GImage.prototype;
		Laya.imps(__proto,{"fairygui.IColorGear":true})
		__proto.applyColor=function(){}
		__proto.handleControllerChanged=function(c){
			_super.prototype.handleControllerChanged.call(this,c);
			if(this._gearColor.controller==c)
				this._gearColor.apply();
		}

		__proto.createDisplayObject=function(){
			this._displayObject=this.image=new Image1();
			this._displayObject["$owner"]=this;
		}

		__proto.constructFromResource=function(pkgItem){
			this._packageItem=pkgItem;
			pkgItem.load();
			this._sourceWidth=this._packageItem.width;
			this._sourceHeight=this._packageItem.height;
			this._initWidth=this._sourceWidth;
			this._initHeight=this._sourceHeight;
			this.image.scale9Grid=pkgItem.scale9Grid;
			this.image.scaleByTile=pkgItem.scaleByTile;
			this.image.texture=pkgItem.texture;
			this.setSize(this._sourceWidth,this._sourceHeight);
		}

		__proto.handleXYChanged=function(){
			_super.prototype.handleXYChanged.call(this);
			if(this.scaleX==-1)
				this.image.x+=this.width;
			if(this.scaleY==-1)
				this.image.y+=this.height;
		}

		__proto.handleSizeChanged=function(){
			if(this.image.texture!=null){
				this.image.scaleTexture(this.width/this._sourceWidth,this.height/this._sourceHeight);
			}
		}

		__proto.setup_beforeAdd=function(xml){
			_super.prototype.setup_beforeAdd.call(this,xml);
			var str;
			str=xml.getAttribute("color");
			if(str)
				this.color=str;
			str=xml.getAttribute("flip");
			if(str)
				this.flip=FlipType.parse(str);
		}

		__proto.setup_afterAdd=function(xml){
			_super.prototype.setup_afterAdd.call(this,xml);
			var cxml=ToolSet.findChildNode(xml,"gearColor");
			if(cxml)
				this._gearColor.setup(cxml);
		}

		__getset(0,__proto,'color',function(){
			return this._color;
			},function(value){
			if(this._color !=value){
				this._color=value;
				if(this._gearColor.controller !=null)
					this._gearColor.updateState();
				this.applyColor();
			}
		});

		__getset(0,__proto,'gearColor',function(){
			return this._gearColor;
		});

		//not supported yet
		__getset(0,__proto,'flip',function(){
			return this._flip;
			},function(value){
			if(this._flip!=value){
				this._flip=value;
				var sx=1,sy=1;
				if(this._flip==1 || this._flip==3)
					sx=-1;
				if(this._flip==2 || this._flip==3)
					sy=-1;
				this.setScale(sx,sy);
				this.handleXYChanged();
			}
		});

		return GImage;
	})(GObject)


	//class fairygui.GearSize extends fairygui.GearBase
	var GearSize=(function(_super){
		var GearSizeValue;
		function GearSize(owner){
			this._storage=null;
			this._default=null;
			this._tweenValue=null;
			this._tweener=null;
			GearSize.__super.call(this,owner);
		}

		__class(GearSize,'fairygui.GearSize',_super);
		var __proto=GearSize.prototype;
		__proto.init=function(){
			this._default=new GearSizeValue(this._owner.width,this._owner.height,
			this._owner.scaleX,this._owner.scaleY);
			this._storage={};
		}

		__proto.addStatus=function(pageId,value){
			var arr=value.split(",");
			var gv;
			if (pageId==null)
				gv=this._default;
			else {
				gv=new GearSizeValue();
				this._storage[pageId]=gv;
			}
			gv.width=parseInt(arr[0]);
			gv.height=parseInt(arr[1]);
			if(arr.length>2){
				gv.scaleX=parseFloat(arr[2]);
				gv.scaleY=parseFloat(arr[3]);
			}
		}

		__proto.apply=function(){
			var gv=this._storage[this._controller.selectedPageId];
			if (!gv)
				gv=this._default;
			if(this._tweener)
				this._tweener.complete();
			if(this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect){
				var a=gv.width !=this._owner.width || gv.height !=this._owner.height;
				var b=gv.scaleX !=this._owner.scaleX || gv.scaleY !=this._owner.scaleY;
				if(a || b){
					this._owner.internalVisible++;
					if(this._tweenValue==null)
						this._tweenValue=new GearSizeValue();
					this._tweenValue.width=this._owner.width;
					this._tweenValue.height=this._owner.height;
					this._tweenValue.scaleX=this._owner.scaleX;
					this._tweenValue.scaleY=this._owner.scaleY;
					this._tweener=Tween.to(this._tweenValue,
					{width:gv.width,height:gv.height,scaleX:gv.scaleX,scaleY:gv.scaleY },
					this._tweenTime*1000,
					this._easeType,
					Handler.create(this,this.__tweenComplete),
					this._delay*1000);
					this._tweener.update=Handler.create(this,this.__tweenUpdate,[a,b],false);
				}
			}
			else {
				this._owner._gearLocked=true;
				this._owner.setSize(gv.width,gv.height,this._owner.gearXY.controller==this._controller);
				this._owner.setScale(gv.scaleX,gv.scaleY);
				this._owner._gearLocked=false;
			}
		}

		__proto.__tweenUpdate=function(a,b){
			this._owner._gearLocked=true;
			if(a)
				this._owner.setSize(this._tweenValue.width,this._tweenValue.height,this._owner.gearXY.controller==this._controller);
			if(b)
				this._owner.setScale(this._tweenValue.scaleX,this._tweenValue.scaleY);
			this._owner._gearLocked=false;
		}

		__proto.__tweenComplete=function(){
			this._owner.internalVisible--;
			this._tweener=null;
		}

		__proto.updateState=function(){
			if (this._owner._gearLocked)
				return;
			var gv=this._storage[this._controller.selectedPageId];
			if(!gv){
				gv=new GearSizeValue();
				this._storage[this._controller.selectedPageId]=gv;
			}
			gv.width=this._owner.width;
			gv.height=this._owner.height;
			gv.scaleX=this._owner.scaleX;
			gv.scaleY=this._owner.scaleY;
		}

		__proto.updateFromRelations=function(dx,dy){
			for(var key in this._storage){
				var gv=this._storage[key];
				gv.width+=dx;
				gv.height+=dy;
			}
			this._default.width+=dx;
			this._default.height+=dy;
			this.updateState();
		}

		GearSize.__init$=function(){
			//class GearSizeValue
			GearSizeValue=(function(){
				function GearSizeValue(width,height,scaleX,scaleY){
					this.width=NaN;
					this.height=NaN;
					this.scaleX=NaN;
					this.scaleY=NaN;
					(width===void 0)&& (width=0);
					(height===void 0)&& (height=0);
					(scaleX===void 0)&& (scaleX=0);
					(scaleY===void 0)&& (scaleY=0);
					this.width=width;
					this.height=height;
					this.scaleX=scaleX;
					this.scaleY=scaleY;
				}
				__class(GearSizeValue,'');
				return GearSizeValue;
			})()
		}

		return GearSize;
	})(GearBase)


	//class fairygui.GearXY extends fairygui.GearBase
	var GearXY=(function(_super){
		function GearXY(owner){
			this._storage=null;
			this._default=null;
			this._tweenValue=null;
			this._tweener=null;
			GearXY.__super.call(this,owner);
		}

		__class(GearXY,'fairygui.GearXY',_super);
		var __proto=GearXY.prototype;
		__proto.init=function(){
			this._default=new Point(this._owner.x,this._owner.y);
			this._storage={};
		}

		__proto.addStatus=function(pageId,value){
			var arr=value.split(",");
			var pt;
			if (pageId==null)
				pt=this._default;
			else {
				pt=new Point();
				this._storage[pageId]=pt;
			}
			pt.x=parseInt(arr[0]);
			pt.y=parseInt(arr[1]);
		}

		__proto.apply=function(){
			var pt=this._storage[this._controller.selectedPageId];
			if (!pt)
				pt=this._default;
			if(this._tweener)
				this._tweener.complete();
			if(this._tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect){
				if(this._owner.x !=pt.x || this._owner.y !=pt.y){
					this._owner.internalVisible++;
					if(this._tweenValue==null)
						this._tweenValue=new Point();
					this._tweenValue.x=this._owner.x;
					this._tweenValue.y=this._owner.y;
					this._tweener=Tween.to(this._tweenValue,
					{x:pt.x,y:pt.y },
					this._tweenTime*1000,
					this._easeType,
					Handler.create(this,this.__tweenComplete),
					this._delay*1000);
					this._tweener.update=Handler.create(this,this.__tweenUpdate,null,false);
				}
			}
			else {
				this._owner._gearLocked=true;
				this._owner.setXY(pt.x,pt.y);
				this._owner._gearLocked=false;
			}
		}

		__proto.__tweenUpdate=function(){
			this._owner._gearLocked=true;
			this._owner.setXY(this._tweenValue.x,this._tweenValue.y);
			this._owner._gearLocked=false;
		}

		__proto.__tweenComplete=function(){
			this._owner.internalVisible--;
			this._tweener=null;
		}

		__proto.updateState=function(){
			if (this._owner._gearLocked)
				return;
			var pt=this._storage[this._controller.selectedPageId];
			if(!pt){
				pt=new Point();
				this._storage[this._controller.selectedPageId]=pt;
			}
			pt.x=this._owner.x;
			pt.y=this._owner.y;
		}

		__proto.updateFromRelations=function(dx,dy){
			for (var key in this._storage){
				var pt=this._storage[key];
				pt.x+=dx;
				pt.y+=dy;
			}
			this._default.x+=dx;
			this._default.y+=dy;
			this.updateState();
		}

		return GearXY;
	})(GearBase)


	//class fairygui.GLoader extends fairygui.GObject
	var GLoader=(function(_super){
		function GLoader(){
			this._gearAnimation=null;
			this._gearColor=null;
			this._url=null;
			this._align=null;
			this._valign=null;
			this._autoSize=false;
			this._fill=0;
			this._showErrorSign=false;
			this._playing=false;
			this._frame=0;
			this._color=null;
			this._contentItem=null;
			this._contentSourceWidth=0;
			this._contentSourceHeight=0;
			this._contentWidth=0;
			this._contentHeight=0;
			this._content=null;
			this._errorSign=null;
			this._updatingLayout=false;
			GLoader.__super.call(this);
			this._playing=true;
			this._url="";
			this._align="left";
			this._valign="top";
			this._showErrorSign=true;
			this._color="#FFFFFF";
			this._gearAnimation=new GearAnimation(this);
			this._gearColor=new GearColor(this);
		}

		__class(GLoader,'fairygui.GLoader',_super);
		var __proto=GLoader.prototype;
		Laya.imps(__proto,{"fairygui.IAnimationGear":true,"fairygui.IColorGear":true})
		__proto.createDisplayObject=function(){
			_super.prototype.createDisplayObject.call(this);
			this._displayObject.mouseEnabled=true;
		}

		__proto.dispose=function(){
			if(this._contentItem==null && ((this._content instanceof fairygui.display.Image ))){
				var texture=(this._content).texture;
				if(texture !=null)
					this.freeExternal(texture);
			}
			_super.prototype.dispose.call(this);
		}

		__proto.applyColor=function(){}
		__proto.loadContent=function(){
			this.clearContent();
			if (!this._url)
				return;
			if(ToolSet.startsWith(this._url,"ui://"))
				this.loadFromPackage(this._url);
			else
			this.loadExternal();
		}

		__proto.loadFromPackage=function(itemURL){
			this._contentItem=UIPackage.getItemByURL(itemURL);
			if(this._contentItem !=null){
				this._contentItem.load();
				if(this._contentItem.type==0){
					if(this._contentItem.texture==null){
						this.setErrorState();
					}
					else {
						if(!((this._content instanceof fairygui.display.Image ))){
							this._content=new Image1();
							this._displayObject.addChild(this._content);
						}
						else
						this._displayObject.addChild(this._content);
						(this._content).texture=this._contentItem.texture;
						(this._content).scale9Grid=this._contentItem.scale9Grid;
						(this._content).scaleByTile=this._contentItem.scaleByTile
						this._contentSourceWidth=this._contentItem.width;
						this._contentSourceHeight=this._contentItem.height;
						this.updateLayout();
					}
				}
				else if(this._contentItem.type==2){
					if(!((this._content instanceof fairygui.display.MovieClip ))){
						this._content=new MovieClip1();
						this._displayObject.addChild(this._content);
					}
					else
					this._displayObject.addChild(this._content);
					this._contentSourceWidth=this._contentItem.width;
					this._contentSourceHeight=this._contentItem.height;
					(this._content).interval=this._contentItem.interval;
					(this._content).swing=this._contentItem.swing;
					(this._content).repeatDelay=this._contentItem.repeatDelay;
					(this._content).frames=this._contentItem.frames;
					(this._content).boundsRect=new Rectangle(0,0,this._contentSourceWidth,this._contentSourceHeight);
					this.updateLayout();
				}
				else
				this.setErrorState();
			}
			else
			this.setErrorState();
		}

		__proto.loadExternal=function(){
			Laya.loader.load(this._url,Handler.create(this,this.__getResCompleted));
		}

		__proto.freeExternal=function(texture){}
		__proto.onExternalLoadSuccess=function(texture){
			if(!((this._content instanceof fairygui.display.Image ))){
				this._content=new Image1();
				this._displayObject.addChild(this._content);
			}
			else
			this._displayObject.addChild(this._content);
			(this._content).texture=texture;
			(this._content).scale9Grid=null;
			(this._content).scaleByTile=false;
			this._contentSourceWidth=texture.width;
			this._contentSourceHeight=texture.height;
			this.updateLayout();
		}

		__proto.onExternalLoadFailed=function(){
			this.setErrorState();
		}

		__proto.__getResCompleted=function(tex){
			if(tex!=null)
				this.onExternalLoadSuccess(tex);
			else
			this.onExternalLoadFailed();
		}

		__proto.setErrorState=function(){
			if (!this._showErrorSign)
				return;
			if (this._errorSign==null){
				if (UIConfig1.loaderErrorSign !=null){
					this._errorSign=fairygui.GLoader._errorSignPool.getObject(UIConfig1.loaderErrorSign);
				}
			}
			if (this._errorSign !=null){
				this._errorSign.width=this.width;
				this._errorSign.height=this.height;
				this._displayObject.addChild(this._errorSign.displayObject);
			}
		}

		__proto.clearErrorState=function(){
			if (this._errorSign !=null){
				this._displayObject.removeChild(this._errorSign.displayObject);
				fairygui.GLoader._errorSignPool.returnObject(this._errorSign);
				this._errorSign=null;
			}
		}

		__proto.updateLayout=function(){
			if (this._content==null){
				if (this._autoSize){
					this._updatingLayout=true;
					this.setSize(50,30);
					this._updatingLayout=false;
				}
				return;
			}
			this._content.x=0;
			this._content.y=0;
			this._content.scaleX=1;
			this._content.scaleY=1;
			this._contentWidth=this._contentSourceWidth;
			this._contentHeight=this._contentSourceHeight;
			if (this._autoSize){
				this._updatingLayout=true;
				if (this._contentWidth==0)
					this._contentWidth=50;
				if (this._contentHeight==0)
					this._contentHeight=30;
				this.setSize(this._contentWidth,this._contentHeight);
				this._updatingLayout=false;
			}
			else {
				var sx=1,sy=1;
				if (this._fill==3 || this._fill==4){
					sx=this.width / this._contentSourceWidth;
					sy=this.height / this._contentSourceHeight;
					if (sx !=1 || sy !=1){
						if (this._fill==3){
							if (sx > sy)
								sx=sy;
							else
							sy=sx;
						}
						this._contentWidth=this._contentSourceWidth *sx;
						this._contentHeight=this._contentSourceHeight *sy;
					}
				}
				if ((this._content instanceof fairygui.display.Image )){
					this._content.width=this._contentWidth;
					this._content.height=this._contentHeight;
				}
				else {
					this._content.scaleX=sx;
					this._content.scaleY=sy;
				}
				if (this._align=="center")
					this._content.x=Math.floor((this.width-this._contentWidth)/ 2);
				else if (this._align=="right")
				this._content.x=this.width-this._contentWidth;
				if (this._valign=="middle")
					this._content.y=Math.floor((this.height-this._contentHeight)/ 2);
				else if (this._valign=="bottom")
				this._content.y=this.height-this._contentHeight;
			}
		}

		__proto.clearContent=function(){
			this.clearErrorState();
			if (this._content !=null && this._content.parent !=null)
				this._displayObject.removeChild(this._content);
			if(this._contentItem==null && ((this._content instanceof fairygui.display.Image ))){
				var texture=(this._content).texture;
				if(texture !=null)
					this.freeExternal(texture);
			}
			this._contentItem=null;
		}

		__proto.handleControllerChanged=function(c){
			_super.prototype.handleControllerChanged.call(this,c);
			if(this._gearAnimation.controller==c)
				this._gearAnimation.apply();
			if(this._gearColor.controller==c)
				this._gearColor.apply();
		}

		__proto.handleSizeChanged=function(){
			_super.prototype.handleSizeChanged.call(this);
			if(!this._updatingLayout)
				this.updateLayout();
		}

		__proto.setup_beforeAdd=function(xml){
			_super.prototype.setup_beforeAdd.call(this,xml);
			var str;
			str=xml.getAttribute("url");
			if (str)
				this._url=str;
			str=xml.getAttribute("align");
			if (str)
				this._align=str;
			str=xml.getAttribute("vAlign");
			if (str)
				this._valign=str;
			str=xml.getAttribute("fill");
			if (str)
				this._fill=FillType.parse(str);
			this._autoSize=xml.getAttribute("autoSize")=="true";
			str=xml.getAttribute("errorSign");
			if (str)
				this._showErrorSign=str=="true";
			this._playing=xml.getAttribute("playing")!="false";
			str=xml.getAttribute("color");
			if(str)
				this.color=str;
			if (this._url)
				this.loadContent();
		}

		__proto.setup_afterAdd=function(xml){
			_super.prototype.setup_afterAdd.call(this,xml);
			var col=xml.childNodes;
			var length1=col.length;
			for(var i1=0;i1 < length1;i1++){
				var cxml=col[i1];
				if(cxml.nodeName=="gearAni"){
					this._gearAnimation.setup(cxml);
					break ;
				}
				else if(cxml.nodeName=="gearColor"){
					this._gearColor.setup(cxml);
					break ;
				}
			}
		}

		//todo:
		__getset(0,__proto,'showErrorSign',function(){
			return this._showErrorSign;
			},function(value){
			this._showErrorSign=value;
		});

		__getset(0,__proto,'url',function(){
			return this._url;
			},function(value){
			if (this._url==value)
				return;
			this._url=value;
			this.loadContent();
		});

		__getset(0,__proto,'align',function(){
			return this._align;
			},function(value){
			if (this._align !=value){
				this._align=value;
				this.updateLayout();
			}
		});

		__getset(0,__proto,'frame',function(){
			return this._frame;
			},function(value){
			if (this._frame !=value){
				this._frame=value;
				if ((this._content instanceof fairygui.display.MovieClip ))
					(this._content).currentFrame=value;
				if (this._gearAnimation.controller !=null)
					this._gearAnimation.updateState();
			}
		});

		__getset(0,__proto,'playing',function(){
			return this._playing;
			},function(value){
			if (this._playing !=value){
				this._playing=value;
				if ((this._content instanceof fairygui.display.MovieClip ))
					(this._content).playing=value;
				if (this._gearAnimation.controller !=null)
					this._gearAnimation.updateState();
			}
		});

		__getset(0,__proto,'verticalAlign',function(){
			return this._valign;
			},function(value){
			if (this._valign !=value){
				this._valign=value;
				this.updateLayout();
			}
		});

		__getset(0,__proto,'color',function(){
			return this._color;
			},function(value){
			if(this._color !=value){
				this._color=value;
				if(this._gearColor.controller !=null)
					this._gearColor.updateState();
				this.applyColor();
			}
		});

		__getset(0,__proto,'fill',function(){
			return this._fill;
			},function(value){
			if (this._fill !=value){
				this._fill=value;
				this.updateLayout();
			}
		});

		__getset(0,__proto,'autoSize',function(){
			return this._autoSize;
			},function(value){
			if (this._autoSize !=value){
				this._autoSize=value;
				this.updateLayout();
			}
		});

		__getset(0,__proto,'content',function(){
			return this._content;
		});

		__getset(0,__proto,'gearAnimation',function(){
			return this._gearAnimation;
		});

		__getset(0,__proto,'gearColor',function(){
			return this._gearColor;
		});

		__static(GLoader,
		['_errorSignPool',function(){return this._errorSignPool=new GObjectPool();}
		]);
		return GLoader;
	})(GObject)


	//class fairygui.GMovieClip extends fairygui.GObject
	var GMovieClip=(function(_super){
		function GMovieClip(){
			this.movieClip=null;
			this._gearAnimation=null;
			this._gearColor=null;
			GMovieClip.__super.call(this);
			this._sizeImplType=1;
			this._gearAnimation=new GearAnimation(this);
			this._gearColor=new GearColor(this);
		}

		__class(GMovieClip,'fairygui.GMovieClip',_super);
		var __proto=GMovieClip.prototype;
		Laya.imps(__proto,{"fairygui.IAnimationGear":true,"fairygui.IColorGear":true})
		__proto.createDisplayObject=function(){
			this._displayObject=this.movieClip=new MovieClip1();
			this._displayObject["$owner"]=this;
		}

		//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
		__proto.setPlaySettings=function(start,end,times,endAt,endHandler){
			(start===void 0)&& (start=0);
			(end===void 0)&& (end=-1);
			(times===void 0)&& (times=0);
			(endAt===void 0)&& (endAt=-1);
			this.movieClip.setPlaySettings(start,end,times,endAt,endHandler);
		}

		__proto.handleControllerChanged=function(c){
			_super.prototype.handleControllerChanged.call(this,c);
			if(this._gearAnimation.controller==c)
				this._gearAnimation.apply();
			if(this._gearColor.controller==c)
				this._gearColor.apply();
		}

		__proto.constructFromResource=function(pkgItem){
			this._packageItem=pkgItem;
			this._sourceWidth=this._packageItem.width;
			this._sourceHeight=this._packageItem.height;
			this._initWidth=this._sourceWidth;
			this._initHeight=this._sourceHeight;
			this.setSize(this._sourceWidth,this._sourceHeight);
			pkgItem.load();
			this.movieClip.interval=this._packageItem.interval;
			this.movieClip.swing=this._packageItem.swing;
			this.movieClip.repeatDelay=this._packageItem.repeatDelay;
			this.movieClip.frames=this._packageItem.frames;
			this.movieClip.boundsRect=new Rectangle(0,0,this.sourceWidth,this.sourceHeight);
		}

		__proto.setup_beforeAdd=function(xml){
			_super.prototype.setup_beforeAdd.call(this,xml);
			var str;
			str=xml.getAttribute("frame");
			if (str)
				this.movieClip.currentFrame=parseInt(str);
			str=xml.getAttribute("playing");
			this.movieClip.playing=str !="false";
			str=xml.getAttribute("color");
			if(str)
				this.color=str;
		}

		__proto.setup_afterAdd=function(xml){
			_super.prototype.setup_afterAdd.call(this,xml);
			var col=xml.childNodes;
			var length1=col.length;
			for (var i1=0;i1 < length1;i1++){
				var cxml=col[i1];
				if (cxml.nodeName=="gearAni"){
					this._gearAnimation.setup(cxml);
					break ;
				}
				else if (cxml.nodeName=="gearColor"){
					this._gearColor.setup(cxml);
					break ;
				}
			}
		}

		__getset(0,__proto,'color',function(){
			return "#FFFFFF";
			},function(value){
		});

		__getset(0,__proto,'gearColor',function(){
			return this._gearColor;
		});

		__getset(0,__proto,'playing',function(){
			return this.movieClip.playing;
			},function(value){
			if (this.movieClip.playing !=value){
				this.movieClip.playing=value;
				if (this._gearAnimation.controller)
					this._gearAnimation.updateState();
			}
		});

		__getset(0,__proto,'frame',function(){
			return this.movieClip.currentFrame;
			},function(value){
			if (this.movieClip.currentFrame !=value){
				this.movieClip.currentFrame=value;
				if (this._gearAnimation.controller)
					this._gearAnimation.updateState();
			}
		});

		__getset(0,__proto,'gearAnimation',function(){
			return this._gearAnimation;
		});

		return GMovieClip;
	})(GObject)


	//class fairygui.GBasicTextField extends fairygui.GTextField
	var GBasicTextField=(function(_super){
		var LineInfo;
		function GBasicTextField(){
			this.textField=null;
			this._font=null;
			this._color=null;
			this._text=null;
			this._ubbEnabled=false;
			this._singleLine=false;
			this._letterSpacing=0;
			this._autoSize=0;
			this._widthAutoSize=false;
			this._heightAutoSize=false;
			this._updatingSize=false;
			this._sizeDirty=false;
			this._textWidth=0;
			this._textHeight=0;
			this._changed=false;
			this._bitmapFont=null;
			this._lines=null;
			GBasicTextField.__super.call(this);
			this._text="";
			this._color="#000000";
			this.setAutoSize(1);
			this.textField.align="left";
			this.textField.font=UIConfig1.defaultFont;
		}

		__class(GBasicTextField,'fairygui.GBasicTextField',_super);
		var __proto=GBasicTextField.prototype;
		__proto.createDisplayObject=function(){
			fairygui.GObject.prototype.createDisplayObject.call(this);
			this._displayObject.mouseEnabled=false;
			this.textField=new Text();
			this._displayObject.addChild(this.textField);
		}

		__proto.setAutoSize=function(value){
			this._autoSize=value;
			this._widthAutoSize=value==1;
			this._heightAutoSize=value==1 || value==2;
			this.textField.wordWrap=!this._widthAutoSize;
			if(!this._heightAutoSize)
				this.textField.size(this.width,this.height);
			else if(!this._widthAutoSize)
			this.textField.width=this.width;
		}

		__proto.ensureSizeCorrect=function(){
			if (this._sizeDirty && this._changed)
				this.applyChange();
		}

		__proto.markChanged=function(){
			if(!this._changed){
				this._changed=true;
				Laya.timer.callLater(this,this.applyChange);
			}
			if(!this._sizeDirty && (this._widthAutoSize || this._heightAutoSize)){
				this._sizeDirty=true;
				this._displayObject.event("fui_size_delay_change");
			}
		}

		__proto.applyChange=function(force){
			(force===void 0)&& (force=false);
			if(this._changed || force){
				this._changed=false;
				this._sizeDirty=false;
				if(this._bitmapFont!=null)
					this.renderWithBitmapFont();
				else if(this._widthAutoSize || this._heightAutoSize)
				this.updateSize();
			}
		}

		__proto.updateSize=function(){
			this._textWidth=Math.ceil(this.textField.textWidth);
			this._textHeight=Math.ceil(this.textField.textHeight);
			var w=NaN,h=0;
			if(this._widthAutoSize){
				w=this._textWidth;
				if(this.textField.width!=w)
					this.textField.width=w;
			}
			else
			w=this.width;
			if(this._heightAutoSize){
				h=this._textHeight;
				if(!this._widthAutoSize){
					if(this.textField.height!=this._textHeight)
						this.textField.height=this._textHeight;
				}
			}
			else {
				h=this.height;
				if(this._textHeight > h)
					this._textHeight=h;
				if(this.textField.height!=this._textHeight)
					this.textField.height=this._textHeight;
			}
			this._updatingSize=true;
			this.setSize(w,h);
			this._updatingSize=false;
		}

		__proto.renderWithBitmapFont=function(){
			var gr=this._displayObject.graphics;
			gr.clear();
			if (!this._lines)
				this._lines=[];
			else
			LineInfo.returnList(this._lines);
			var letterSpacing=this.letterSpacing;
			var lineSpacing=this.leading-1;
			var rectWidth=this.width-2 *2;
			var lineWidth=0,lineHeight=0,lineTextHeight=0;
			var glyphWidth=0,glyphHeight=0;
			var wordChars=0,wordStart=0,wordEnd=0;
			var lastLineHeight=0;
			var lineBuffer="";
			var lineY=2;
			var line;
			var textWidth=0,textHeight=0;
			var wordWrap=!this._widthAutoSize && !this._singleLine;
			var fontScale=this._bitmapFont.resizable?this.fontSize/this._bitmapFont.size:1;
			var textLength=this._text.length;
			for (var offset=0;offset < textLength;++offset){
				var ch=this._text.charAt(offset);
				var cc=ch.charCodeAt(offset);
				if (ch=="\n"){
					lineBuffer+=ch;
					line=LineInfo.borrow();
					line.width=lineWidth;
					if (lineTextHeight==0){
						if (lastLineHeight==0)
							lastLineHeight=Math.ceil(this.fontSize*fontScale);
						if (lineHeight==0)
							lineHeight=lastLineHeight;
						lineTextHeight=lineHeight;
					}
					line.height=lineHeight;
					lastLineHeight=lineHeight;
					line.textHeight=lineTextHeight;
					line.text=lineBuffer;
					line.y=lineY;
					lineY+=(line.height+lineSpacing);
					if (line.width > textWidth)
						textWidth=line.width;
					this._lines.push(line);
					lineBuffer="";
					lineWidth=0;
					lineHeight=0;
					lineTextHeight=0;
					wordChars=0;
					wordStart=0;
					wordEnd=0;
					continue ;
				}
				if (cc > 256 || cc <=32){
					if (wordChars > 0)
						wordEnd=lineWidth;
					wordChars=0;
				}
				else {
					if (wordChars==0)
						wordStart=lineWidth;
					wordChars++;
				}
				if (ch==" "){
					glyphWidth=Math.ceil(this.fontSize / 2);
					glyphHeight=Math.ceil(this.fontSize);
				}
				else {
					var glyph=this._bitmapFont.glyphs[ch];
					if (glyph){
						glyphWidth=Math.ceil(glyph.advance*fontScale);
						glyphHeight=Math.ceil(glyph.lineHeight*fontScale);
					}
					else if (ch==" "){
						glyphWidth=Math.ceil(this._bitmapFont.size*fontScale/2);
						glyphHeight=Math.ceil(this._bitmapFont.size*fontScale);
					}
					else {
						glyphWidth=0;
						glyphHeight=0;
					}
				}
				if (glyphHeight > lineTextHeight)
					lineTextHeight=glyphHeight;
				if (glyphHeight > lineHeight)
					lineHeight=glyphHeight;
				if (lineWidth !=0)
					lineWidth+=letterSpacing;
				lineWidth+=glyphWidth;
				if (!wordWrap || lineWidth <=rectWidth){
					lineBuffer+=ch;
				}
				else {
					line=LineInfo.borrow();
					line.height=lineHeight;
					line.textHeight=lineTextHeight;
					if (lineBuffer.length==0){
						line.text=ch;
					}
					else if (wordChars > 0 && wordEnd > 0){
						lineBuffer+=ch;
						var len=lineBuffer.length-wordChars;
						line.text=ToolSet.trimRight(lineBuffer.substr(0,len));
						line.width=wordEnd;
						lineBuffer=lineBuffer.substr(len+1);
						lineWidth-=wordStart;
					}
					else {
						line.text=lineBuffer;
						line.width=lineWidth-(glyphWidth+letterSpacing);
						lineBuffer=ch;
						lineWidth=glyphWidth;
						lineHeight=glyphHeight;
						lineTextHeight=glyphHeight;
					}
					line.y=lineY;
					lineY+=(line.height+lineSpacing);
					if (line.width > textWidth)
						textWidth=line.width;
					wordChars=0;
					wordStart=0;
					wordEnd=0;
					this._lines.push(line);
				}
			}
			if (lineBuffer.length > 0
				|| this._lines.length > 0 && ToolSet.endsWith(this._lines[this._lines.length-1].text,"\n")){
				line=LineInfo.borrow();
				line.width=lineWidth;
				if (lineHeight==0)
					lineHeight=lastLineHeight;
				if (lineTextHeight==0)
					lineTextHeight=lineHeight;
				line.height=lineHeight;
				line.textHeight=lineTextHeight;
				line.text=lineBuffer;
				line.y=lineY;
				if (line.width > textWidth)
					textWidth=line.width;
				this._lines.push(line);
			}
			if (textWidth > 0)
				textWidth+=2 *2;
			var count=this._lines.length;
			if (count==0){
				textHeight=0;
			}
			else {
				line=this._lines[this._lines.length-1];
				textHeight=line.y+line.height+2;
			};
			var w=NaN,h=0;
			if (this._widthAutoSize){
				if (textWidth==0)
					w=0;
				else
				w=textWidth;
			}
			else
			w=this.width;
			if (this._heightAutoSize){
				if (textHeight==0)
					h=0;
				else
				h=textHeight;
			}
			else
			h=this.height;
			this._updatingSize=true;
			this.setSize(w,h);
			this._updatingSize=false;
			this.doAlign();
			if (w==0 || h==0)
				return;
			var charX=2;
			var lineIndent=0;
			var charIndent=0;
			rectWidth=this.width-2 *2;
			var lineCount=this._lines.length;
			for (var i=0;i < lineCount;i++){
				line=this._lines[i];
				charX=2;
				if (this.align=="center")
					lineIndent=(rectWidth-line.width)/ 2;
				else if (this.align=="right")
				lineIndent=rectWidth-line.width;
				else
				lineIndent=0;
				textLength=line.text.length;
				for (var j=0;j < textLength;j++){
					ch=line.text.charAt(j);
					glyph=this._bitmapFont.glyphs[ch];
					if (glyph !=null){
						charIndent=(line.height+line.textHeight)/ 2-Math.ceil(glyph.lineHeight*fontScale);
						gr.drawTexture(glyph.texture,
						charX+lineIndent+Math.ceil(glyph.offsetX*fontScale),
						line.y+charIndent+Math.ceil(glyph.offsetY*fontScale),
						glyph.texture.width *fontScale,
						glyph.texture.height *fontScale);
						charX+=letterSpacing+Math.ceil(glyph.advance*fontScale);
					}
					else if (ch==" "){
						charX+=letterSpacing+Math.ceil(this._bitmapFont.size*fontScale/2);
					}
					else {
						charX+=letterSpacing;
					}
				}
			}
		}

		//line loop
		__proto.handleSizeChanged=function(){
			if(!this._updatingSize){
				if(this._bitmapFont!=null){
					if(!this._widthAutoSize)
						this.markChanged();
					else
					this.doAlign();
				}
				else {
					if(!this._widthAutoSize){
						if(!this._heightAutoSize)
							this.textField.size(this.width,this.height);
						else {
							this.textField.width=this.width;
							this.markChanged();
						}
					}
				}
			}
		}

		__proto.handleGrayChanged=function(){
			fairygui.GObject.prototype.handleGrayChanged.call(this);
			if(this.grayed)
				this.textField.color="#AAAAAA";
			else
			this.textField.color=this._color;
		}

		__proto.doAlign=function(){
			if(this.valign=="top" || this._textHeight==0)
				this._yOffset=2;
			else {
				var dh=this.height-this._textHeight;
				if(dh < 0)
					dh=0;
				if(this.valign=="middle")
					this._yOffset=Math.floor(dh / 2);
				else
				this._yOffset=Math.floor(dh);
			}
			this.handleXYChanged();
		}

		__proto.setup_beforeAdd=function(xml){
			_super.prototype.setup_beforeAdd.call(this,xml);
			var str;
			str=xml.getAttribute("autoSize");
			if (str)
				this.setAutoSize(AutoSizeType.parse(str));
			this._sizeDirty=false;
		}

		__getset(0,__proto,'leading',function(){
			return this.textField.leading;
			},function(value){
			this.textField.leading=value;
			this.markChanged();
		});

		__getset(0,__proto,'text',function(){
			return this._text;
			},function(value){
			this._text=value;
			if(this._text==null)
				this._text="";
			if(this._bitmapFont==null){
				if(this._widthAutoSize)
					this.textField.width=10000;
				if(this._ubbEnabled)
					this.textField.text=ToolSet.removeUBB(ToolSet.encodeHTML(this._text));
				else
				this.textField.text=this._text;
			}
			if(this.parent && this.parent._underConstruct)
				this.applyChange(true);
			else
			this.markChanged();
		});

		__getset(0,__proto,'font',function(){
			return this.textField.font;
			},function(value){
			this._font=value;
			if(ToolSet.startsWith(this._font,"ui://")){
				this._bitmapFont=UIPackage.getBitmapFontByURL(this._font);
			}
			else {
				this._bitmapFont=null;
				if(this._font)
					this.textField.font=this._font;
				else
				this.textField.font=UIConfig1.defaultFont;
			}
			if(this._bitmapFont!=null && this.textField.parent!=null)
				this._displayObject.removeChild(this.textField);
			else if(this._bitmapFont==null && this.textField.parent==null){
				this._displayObject.graphics.clear();
				this._displayObject.addChild(this.textField);
			}
			this.markChanged();
		});

		__getset(0,__proto,'valign',function(){
			return this.textField.valign;
			},function(value){
			this.textField.valign=value;
			this.markChanged();
		});

		__getset(0,__proto,'fontSize',function(){
			return this.textField.fontSize;
			},function(value){
			this.textField.fontSize=value;
			this.markChanged();
		});

		__getset(0,__proto,'color',function(){
			return this._color;
			},function(value){
			if (this._color !=value){
				this._color=value;
				if (this._gearColor.controller)
					this._gearColor.updateState();
				if(this.grayed)
					this.textField.color="#AAAAAA";
				else
				this.textField.color=this._color;
			}
		});

		__getset(0,__proto,'strokeColor',function(){
			return this.textField.strokeColor;
			},function(value){
			this.textField.strokeColor=value;
		});

		__getset(0,__proto,'align',function(){
			return this.textField.align;
			},function(value){
			this.textField.align=value;
			this.markChanged();
		});

		__getset(0,__proto,'bold',function(){
			return this.textField.bold;
			},function(value){
			this.textField.bold=value;
		});

		__getset(0,__proto,'letterSpacing',function(){
			return this._letterSpacing;
			},function(value){
			this._letterSpacing=value;
			this.markChanged();
		});

		__getset(0,__proto,'italic',function(){
			return this.textField.italic;
			},function(value){
			this.textField.italic=value;
		});

		__getset(0,__proto,'asPassword',function(){
			return this.textField.asPassword;
			},function(value){
			this.textField.asPassword=value;
			this.markChanged();
		});

		__getset(0,__proto,'singleLine',function(){
			return this._singleLine;
			},function(value){
			this._singleLine=value;
			this.markChanged();
		});

		__getset(0,__proto,'stroke',function(){
			return this.textField.stroke;
			},function(value){
			this.textField.stroke=value;
		});

		__getset(0,__proto,'ubbEnabled',function(){
			return this._ubbEnabled;
			},function(value){
			this._ubbEnabled=value;
		});

		__getset(0,__proto,'autoSize',function(){
			return this._autoSize;
			},function(value){
			if (this._autoSize !=value){
				this.setAutoSize(value);
				this.markChanged();
			}
		});

		__getset(0,__proto,'textWidth',function(){
			if (this._changed)
				this.applyChange();
			return this._textWidth;
		});

		GBasicTextField.GUTTER_X=2;
		GBasicTextField.GUTTER_Y=2;
		GBasicTextField.__init$=function(){
			//class LineInfo
			LineInfo=(function(){
				function LineInfo(){
					this.width=0;
					this.height=0;
					this.textHeight=0;
					this.text=null;
					this.y=0;
				}
				__class(LineInfo,'');
				LineInfo.borrow=function(){
					if (LineInfo.pool.length){
						var ret=LineInfo.pool.pop();
						ret.width=0;
						ret.height=0;
						ret.textHeight=0;
						ret.text=null;
						ret.y=0;
						return ret;
					}
					else
					return new LineInfo();
				}
				LineInfo.returns=function(value){
					LineInfo.pool.push(value);
				}
				LineInfo.returnList=function(value){
					var length=value.length;
					for (var i=0;i < length;i++){
						var li=value[i];
						LineInfo.pool.push(li);
					}
					value.length=0;
				}
				LineInfo.pool=[];
				return LineInfo;
			})()
		}

		return GBasicTextField;
	})(GTextField)


	//class fairygui.GButton extends fairygui.GComponent
	var GButton=(function(_super){
		function GButton(){
			this._titleObject=null;
			this._iconObject=null;
			this._relatedController=null;
			this._mode=0;
			this._selected=false;
			this._title=null;
			this._selectedTitle=null;
			this._icon=null;
			this._selectedIcon=null;
			this._sound=null;
			this._soundVolumeScale=0;
			this._pageOption=null;
			this._buttonController=null;
			this._changeStateOnClick=false;
			this._linkedPopup=null;
			this._downEffect=0;
			this._downEffectValue=0;
			this._down=false;
			this._over=false;
			GButton.__super.call(this);
			this._mode=0;
			this._title="";
			this._icon="";
			this._sound=UIConfig1.buttonSound;
			this._soundVolumeScale=UIConfig1.buttonSoundVolumeScale;
			this._pageOption=new PageOption();
			this._changeStateOnClick=true;
			this._downEffectValue=0.8;
		}

		__class(GButton,'fairygui.GButton',_super);
		var __proto=GButton.prototype;
		__proto.fireClick=function(downEffect){
			(downEffect===void 0)&& (downEffect=true);
			if (downEffect && this._mode==0){
				this.setState("over");
				Laya.timer.once(100,this,this.setState,[ "down"]);
				Laya.timer.once(200,this,this.setState,[ "up"]);
			}
			this.__click(Events.createEvent("click",this.displayObject));
		}

		__proto.setState=function(val){
			if (this._buttonController)
				this._buttonController.selectedPage=val;
			if(this._downEffect==1){
				var cnt=this.numChildren;
				if(val=="down" || val=="selectedOver" || val=="selectedDisabled"){
					var r=this._downEffectValue *255;
					var color=Utils.toHexColor((r << 16)+(r << 8)+r);
					for(var i=0;i < cnt;i++){
						var obj=this.getChildAt(i);
						if(((obj instanceof fairygui.GImage ))|| ((obj instanceof fairygui.GLoader ))
							|| ((obj instanceof fairygui.GMovieClip )))
						(obj).color=color;
					}
				}
				else {
					for(i=0;i < cnt;i++){
						obj=this.getChildAt(i);
						if(((obj instanceof fairygui.GImage ))|| ((obj instanceof fairygui.GLoader ))
							|| ((obj instanceof fairygui.GMovieClip )))
						(obj).color="#FFFFFF";
					}
				}
			}
			else if(this._downEffect==2){
				if(val=="down" || val=="selectedOver" || val=="selectedDisabled")
					this.setScale(this._downEffectValue,this._downEffectValue);
				else
				this.setScale(1,1);
			}
		}

		__proto.handleControllerChanged=function(c){
			fairygui.GObject.prototype.handleControllerChanged.call(this,c);
			if (this._relatedController==c)
				this.selected=this._pageOption.id==c.selectedPageId;
		}

		__proto.handleGrayChanged=function(){
			if(this._buttonController && this._buttonController.hasPage("disabled")){
				if(this.grayed){
					if(this._selected && this._buttonController.hasPage("selectedDisabled"))
						this.setState("selectedDisabled");
					else
					this.setState("disabled");
				}
				else if(this._selected)
				this.setState("down");
				else
				this.setState("up");
			}
			else
			_super.prototype.handleGrayChanged.call(this);
		}

		__proto.constructFromXML=function(xml){
			_super.prototype.constructFromXML.call(this,xml);
			xml=ToolSet.findChildNode(xml,"Button");
			var str;
			str=xml.getAttribute("mode");
			if (str)
				this._mode=ButtonMode.parse(str);
			str=xml.getAttribute("sound");
			if(str !=null)
				this._sound=str;
			str=xml.getAttribute("volume");
			if(str)
				this._soundVolumeScale=parseInt(str)/ 100;
			str=xml.getAttribute("downEffect");
			if(str){
				this._downEffect=str=="dark"?1:(str=="scale"?2:0);
				str=xml.getAttribute("downEffectValue");
				this._downEffectValue=parseFloat(str);
			}
			this._buttonController=this.getController("button");
			this._titleObject=this.getChild("title");
			this._iconObject=this.getChild("icon");
			if (this._mode==0)
				this.setState("up");
			this.on("mouseover",this,this.__rollover);
			this.on("mouseout",this,this.__rollout);
			this.on("mousedown",this,this.__mousedown);
			this.on("click",this,this.__click);
		}

		__proto.setup_afterAdd=function(xml){
			fairygui.GObject.prototype.setup_afterAdd.call(this,xml);
			if(this._downEffect==2)
				this.setPivot(0.5,0.5);
			xml=ToolSet.findChildNode(xml,"Button");
			if (xml){
				var str;
				this.title=xml.getAttribute("title");
				this.icon=xml.getAttribute("icon");
				str=xml.getAttribute("selectedTitle");
				if (str)
					this.selectedTitle=str;
				str=xml.getAttribute("selectedIcon");
				if (str)
					this.selectedIcon=str;
				str=xml.getAttribute("titleColor");
				if (str)
					this.titleColor=str;
				str=xml.getAttribute("controller");
				if (str)
					this._relatedController=this._parent.getController(str);
				else
				this._relatedController=null;
				this._pageOption.id=xml.getAttribute("page");
				this.selected=xml.getAttribute("checked")=="true";
			}
		}

		__proto.__rollover=function(){
			if(!this._buttonController || !this._buttonController.hasPage("over"))
				return;
			this._over=true;
			if (this._down)
				return;
			this.setState(this._selected ? "selectedOver" :"over");
		}

		__proto.__rollout=function(){
			if(!this._buttonController || !this._buttonController.hasPage("over"))
				return;
			this._over=false;
			if (this._down)
				return;
			this.setState(this._selected ? "down" :"up");
		}

		__proto.__mousedown=function(evt){
			this._down=true;
			GRoot.inst.checkPopups(evt.target);
			Laya.stage.on("mouseup",this,this.__mouseup);
			if(this._mode==0){
				if(this.grayed && this._buttonController && this._buttonController.hasPage("disabled"))
					this.setState("selectedDisabled");
				else
				this.setState("down");
			}
			if (this._linkedPopup !=null){
				if ((this._linkedPopup instanceof fairygui.Window ))
					(this._linkedPopup).toggleStatus();
				else
				this.root.togglePopup(this._linkedPopup,this);
			}
		}

		__proto.__mouseup=function(){
			if (this._down){
				Laya.stage.off("mouseup",this,this.__mouseup);
				this._down=false;
				if(this._mode==0){
					if(this.grayed && this._buttonController && this._buttonController.hasPage("disabled"))
						this.setState("disabled");
					else if(this._over)
					this.setState("over");
					else
					this.setState("up");
				}
			}
		}

		__proto.__click=function(evt){
			if(this._sound){
				var pi=UIPackage.getItemByURL(this._sound);
				if (pi){
					var sound=(pi.owner.getItemAsset(pi));
					if(sound)
						GRoot.inst.playOneShotSound(sound,this._soundVolumeScale);
				}
			}
			if (!this._changeStateOnClick)
				return;
			if (this._mode==1){
				this.selected=!this._selected;
				Events.dispatch("fui_state_changed",this.displayObject,evt);
			}
			else if (this._mode==2){
				if (!this._selected){
					this.selected=true;
					Events.dispatch("fui_state_changed",this.displayObject,evt);
				}
			}
		}

		__getset(0,__proto,'icon',function(){
			return this._icon;
			},function(value){
			this._icon=value;
			value=(this._selected && this._selectedIcon)? this._selectedIcon :this._icon;
			if((this._iconObject instanceof fairygui.GLoader ))
				(this._iconObject).url=value;
			else if((this._iconObject instanceof fairygui.GLabel ))
			(this._iconObject).icon=value;
			else if((this._iconObject instanceof fairygui.GButton ))
			(this._iconObject).icon=value;
		});

		__getset(0,__proto,'sound',function(){
			return this._sound;
			},function(val){
			this._sound=val;
		});

		__getset(0,__proto,'text',function(){
			return this.title;
			},function(value){
			this.title=value;
		});

		__getset(0,__proto,'selectedIcon',function(){
			return this._selectedIcon;
			},function(value){
			this._selectedIcon=value;
			value=(this._selected && this._selectedIcon)? this._selectedIcon :this._icon;
			if((this._iconObject instanceof fairygui.GLoader ))
				(this._iconObject).url=value;
			else if((this._iconObject instanceof fairygui.GLabel ))
			(this._iconObject).icon=value;
			else if((this._iconObject instanceof fairygui.GButton ))
			(this._iconObject).icon=value;
		});

		__getset(0,__proto,'selected',function(){
			return this._selected;
			},function(val){
			if (this._mode==0)
				return;
			if (this._selected !=val){
				this._selected=val;
				if(this.grayed && this._buttonController && this._buttonController.hasPage("disabled")){
					if(this._selected)
						this.setState("selectedDisabled");
					else
					this.setState("disabled");
				}
				else {
					if(this._selected)
						this.setState(this._over ? "selectedOver" :"down");
					else
					this.setState(this._over ? "over" :"up");
				}
				if(this._selectedTitle && this._titleObject)
					this._titleObject.text=this._selected ? this._selectedTitle :this._title;
				if(this._selectedIcon){
					var str=this._selected ? this._selectedIcon :this._icon;
					if((this._iconObject instanceof fairygui.GLoader ))
						(this._iconObject).url=str;
					else if((this._iconObject instanceof fairygui.GLabel ))
					(this._iconObject).icon=str;
					else if((this._iconObject instanceof fairygui.GButton ))
					(this._iconObject).icon=str;
				}
				if(this._relatedController
					&& this._parent
				&& !this._parent._buildingDisplayList){
					if(this._selected){
						this._relatedController.selectedPageId=this._pageOption.id;
						if(this._relatedController._autoRadioGroupDepth)
							this._parent.adjustRadioGroupDepth(this,this._relatedController);
					}
					else if(this._mode==1 && this._relatedController.selectedPageId==this._pageOption.id)
					this._relatedController.oppositePageId=this._pageOption.id;
				}
			}
		});

		__getset(0,__proto,'title',function(){
			return this._title;
			},function(value){
			this._title=value;
			if (this._titleObject)
				this._titleObject.text=(this._selected && this._selectedTitle)? this._selectedTitle :this._title;
		});

		__getset(0,__proto,'selectedTitle',function(){
			return this._selectedTitle;
			},function(value){
			this._selectedTitle=value;
			if (this._titleObject)
				this._titleObject.text=(this._selected && this._selectedTitle)? this._selectedTitle :this._title;
		});

		__getset(0,__proto,'soundVolumeScale',function(){
			return this._soundVolumeScale;
			},function(value){
			this._soundVolumeScale=value;
		});

		__getset(0,__proto,'titleColor',function(){
			if((this._titleObject instanceof fairygui.GTextField ))
				return (this._titleObject).color;
			else if((this._titleObject instanceof fairygui.GLabel ))
			return (this._titleObject).titleColor;
			else if((this._titleObject instanceof fairygui.GButton ))
			return (this._titleObject).titleColor;
			else
			return "#000000";
			},function(value){
			if((this._titleObject instanceof fairygui.GTextField ))
				(this._titleObject).color=value;
			else if((this._titleObject instanceof fairygui.GLabel ))
			(this._titleObject).titleColor=value;
			else if((this._titleObject instanceof fairygui.GButton ))
			(this._titleObject).titleColor=value;
		});

		__getset(0,__proto,'mode',function(){
			return this._mode;
			},function(value){
			if (this._mode !=value){
				if (value==0)
					this.selected=false;
				this._mode=value;
			}
		});

		__getset(0,__proto,'relatedController',function(){
			return this._relatedController;
			},function(val){
			if (val !=this._relatedController){
				this._relatedController=val;
				this._pageOption.controller=val;
				this._pageOption.clear();
			}
		});

		__getset(0,__proto,'pageOption',function(){
			return this._pageOption;
		});

		__getset(0,__proto,'changeStateOnClick',function(){
			return this._changeStateOnClick;
			},function(value){
			this._changeStateOnClick=value;
		});

		__getset(0,__proto,'linkedPopup',function(){
			return this._linkedPopup;
			},function(value){
			this._linkedPopup=value;
		});

		GButton.UP="up";
		GButton.DOWN="down";
		GButton.OVER="over";
		GButton.SELECTED_OVER="selectedOver";
		GButton.DISABLED="disabled";
		GButton.SELECTED_DISABLED="selectedDisabled";
		return GButton;
	})(GComponent)


	//class fairygui.GComboBox extends fairygui.GComponent
	var GComboBox=(function(_super){
		function GComboBox(){
			this.dropdown=null;
			this._titleObject=null;
			this._list=null;
			this._visibleItemCount=0;
			this._items=null;
			this._values=null;
			this._itemsUpdated=false;
			this._selectedIndex=0;
			this._buttonController=null;
			this._over=false;
			this._down=false;
			GComboBox.__super.call(this);
			this._visibleItemCount=UIConfig1.defaultComboBoxVisibleItemCount;
			this._itemsUpdated=true;
			this._selectedIndex=-1;
			this._items=[];
			this._values=[];
		}

		__class(GComboBox,'fairygui.GComboBox',_super);
		var __proto=GComboBox.prototype;
		__proto.setState=function(val){
			if (this._buttonController)
				this._buttonController.selectedPage=val;
		}

		__proto.dispose=function(){
			if(this.dropdown){
				this.dropdown.dispose();
				this.dropdown=null;
			}
			_super.prototype.dispose.call(this);
		}

		__proto.constructFromXML=function(xml){
			_super.prototype.constructFromXML.call(this,xml);
			xml=ToolSet.findChildNode(xml,"ComboBox");
			var str;
			this._buttonController=this.getController("button");
			this._titleObject=(this.getChild("title"));
			str=xml.getAttribute("dropdown");
			if (str){
				this.dropdown=(UIPackage.createObjectFromURL(str));
				if (!this.dropdown){
					Log.print("下拉框必须为元件");
					return;
				}
				this.dropdown.name="this._dropdownObject";
				this._list=this.dropdown.getChild("list").asList;
				if (this._list==null){
					Log.print(this.resourceURL+": 下拉框的弹出元件里必须包含名为list的列表");
					return;
				}
				this._list.on("fui_click_item",this,this.__clickItem);
				this._list.addRelation(this.dropdown,14);
				this._list.removeRelation(this.dropdown,15);
				this.dropdown.addRelation(this._list,15);
				this.dropdown.removeRelation(this._list,14);
				this.dropdown.displayObject.on("undisplay",this,this.__popupWinClosed);
			}
			this.on("mouseover",this,this.__rollover);
			this.on("mouseout",this,this.__rollout);
			this.on("mousedown",this,this.__mousedown);
		}

		__proto.setup_afterAdd=function(xml){
			fairygui.GObject.prototype.setup_afterAdd.call(this,xml);
			xml=ToolSet.findChildNode(xml,"ComboBox");
			if (xml){
				var str;
				str=xml.getAttribute("titleColor");
				if (str)
					this.titleColor=str;
				str=xml.getAttribute("visibleItemCount");
				if (str)
					this._visibleItemCount=parseInt(str);
				var col=xml.childNodes;
				var length=col.length;
				for (var i=0;i < length;i++){
					var cxml=col[i];
					if(cxml.nodeName=="item"){
						this._items.push(cxml.getAttribute("title"));
						this._values.push(cxml.getAttribute("value"));
					}
				}
				str=xml.getAttribute("title");
				if(str){
					this.text=str;
					this._selectedIndex=this._items.indexOf(str);
				}
				else if(this._items.length>0){
					this._selectedIndex=0;
					this.text=this._items[0];
				}
				else
				this._selectedIndex=-1;
			}
		}

		__proto.showDropdown=function(){
			if (this._itemsUpdated){
				this._itemsUpdated=false;
				this._list.removeChildrenToPool();
				var cnt=this._items.length;
				for (var i=0;i < cnt;i++){
					var item=this._list.addItemFromPool();
					item.name=i < this._values.length ? this._values[i] :"";
					item.text=this._items[i];
				}
				this._list.resizeToFit(this._visibleItemCount);
			}
			this._list.selectedIndex=-1;
			this.dropdown.width=this.width;
			this.root.togglePopup(this.dropdown,this,true);
			if (this.dropdown.parent)
				this.setState("down");
		}

		__proto.__popupWinClosed=function(){
			if(this._over)
				this.setState("over");
			else
			this.setState("up");
		}

		__proto.__clickItem=function(itemObject,evt){
			Laya.timer.callLater(this,this.__clickItem2,[this._list.getChildIndex(itemObject),evt])
		}

		__proto.__clickItem2=function(index,evt){
			if ((this.dropdown.parent instanceof fairygui.GRoot ))
				(this.dropdown.parent).hidePopup();
			this._selectedIndex=index;
			if (this._selectedIndex >=0)
				this.text=this._items[this._selectedIndex];
			else
			this.text="";
			Events.dispatch("fui_state_changed",this.displayObject,evt);
		}

		__proto.__rollover=function(){
			this._over=true;
			if (this._down || this.dropdown && this.dropdown.parent)
				return;
			this.setState("over");
		}

		__proto.__rollout=function(){
			this._over=false;
			if (this._down || this.dropdown && this.dropdown.parent)
				return;
			this.setState("up");
		}

		__proto.__mousedown=function(evt){
			this._down=true;
			GRoot.inst.checkPopups(evt.target);
			Laya.stage.on("mouseup",this,this.__mouseup);
			if (this.dropdown)
				this.showDropdown();
		}

		__proto.__mouseup=function(){
			if(this._down){
				this._down=false;
				Laya.stage.off("mouseup",this,this.__mouseup);
				if(this.dropdown && !this.dropdown.parent){
					if(this._over)
						this.setState("over");
					else
					this.setState("up");
				}
			}
		}

		__getset(0,__proto,'text',function(){
			if (this._titleObject)
				return this._titleObject.text;
			else
			return null;
			},function(value){
			if (this._titleObject)
				this._titleObject.text=value;
		});

		__getset(0,__proto,'titleColor',function(){
			if (this._titleObject)
				return this._titleObject.color;
			else
			return "#000000";
			},function(value){
			if (this._titleObject)
				this._titleObject.color=value;
		});

		__getset(0,__proto,'value',function(){
			return this._values[this._selectedIndex];
			},function(val){
			this.selectedIndex=this._values.indexOf(val);
		});

		__getset(0,__proto,'selectedIndex',function(){
			return this._selectedIndex;
			},function(val){
			if (this._selectedIndex==val)
				return;
			this._selectedIndex=val;
			if (this.selectedIndex >=0 && this.selectedIndex < this._items.length)
				this.text=this._items[this._selectedIndex];
			else
			this.text="";
		});

		__getset(0,__proto,'visibleItemCount',function(){
			return this._visibleItemCount;
			},function(value){
			this._visibleItemCount=value;
		});

		__getset(0,__proto,'items',function(){
			return this._items;
			},function(value){
			if (!value)
				this._items.length=0;
			else
			this._items=value.concat();
			if(this._items.length > 0){
				if(this._selectedIndex >=this._items.length)
					this._selectedIndex=this._items.length-1;
				else if(this._selectedIndex==-1)
				this._selectedIndex=0;
				this.text=this._items[this._selectedIndex];
			}
			else
			this.text="";
			this._itemsUpdated=true;
		});

		__getset(0,__proto,'values',function(){
			return this._values;
			},function(value){
			if (!value)
				this._values.length=0;
			else
			this._values=value.concat();
		});

		return GComboBox;
	})(GComponent)


	//class fairygui.GLabel extends fairygui.GComponent
	var GLabel=(function(_super){
		function GLabel(){
			this._titleObject=null;
			this._iconObject=null;
			GLabel.__super.call(this);
		}

		__class(GLabel,'fairygui.GLabel',_super);
		var __proto=GLabel.prototype;
		__proto.constructFromXML=function(xml){
			_super.prototype.constructFromXML.call(this,xml);
			this._titleObject=this.getChild("title");
			this._iconObject=this.getChild("icon");
		}

		__proto.setup_afterAdd=function(xml){
			fairygui.GObject.prototype.setup_afterAdd.call(this,xml);
			xml=ToolSet.findChildNode(xml,"Label");
			if (xml){
				this.text=xml.getAttribute("title");
				this.icon=xml.getAttribute("icon");
				var str;
				str=xml.getAttribute("titleColor");
				if (str)
					this.titleColor=str;
				if((this._titleObject instanceof fairygui.GTextInput )){
					str=xml.getAttribute("promptText");
					if(str)
						(this._titleObject).promptText=str;
				}
			}
		}

		__getset(0,__proto,'icon',function(){
			if((this._iconObject instanceof fairygui.GLoader ))
				return (this._iconObject).url;
			else if((this._iconObject instanceof fairygui.GLabel ))
			return (this._iconObject).icon;
			else if((this._iconObject instanceof fairygui.GButton ))
			return (this._iconObject).icon;
			else
			return null;
			},function(value){
			if((this._iconObject instanceof fairygui.GLoader ))
				(this._iconObject).url=value;
			else if((this._iconObject instanceof fairygui.GLabel ))
			(this._iconObject).icon=value;
			else if((this._iconObject instanceof fairygui.GButton ))
			(this._iconObject).icon=value;
		});

		__getset(0,__proto,'text',function(){
			return this.title;
			},function(value){
			this.title=value;
		});

		__getset(0,__proto,'title',function(){
			if (this._titleObject)
				return this._titleObject.text;
			else
			return null;
			},function(value){
			if (this._titleObject)
				this._titleObject.text=value;
		});

		__getset(0,__proto,'editable',function(){
			if (this._titleObject && ((this._titleObject instanceof fairygui.GTextInput )))
				return this._titleObject.asTextInput.editable;
			else
			return false;
			},function(val){
			if (this._titleObject)
				this._titleObject.asTextInput.editable=val;
		});

		__getset(0,__proto,'titleColor',function(){
			if((this._titleObject instanceof fairygui.GTextField ))
				return (this._titleObject).color;
			else if((this._titleObject instanceof fairygui.GLabel ))
			return (this._titleObject).titleColor;
			else if((this._titleObject instanceof fairygui.GButton ))
			return (this._titleObject).titleColor;
			else
			return "#000000";
			},function(value){
			if((this._titleObject instanceof fairygui.GTextField ))
				(this._titleObject).color=value;
			else if((this._titleObject instanceof fairygui.GLabel ))
			(this._titleObject).titleColor=value;
			else if((this._titleObject instanceof fairygui.GButton ))
			(this._titleObject).titleColor=value;
		});

		return GLabel;
	})(GComponent)


	//class fairygui.GList extends fairygui.GComponent
	var GList=(function(_super){
		function GList(){
			this.itemRenderer=null;
			this._layout=0;
			this._lineItemCount=0;
			this._lineGap=0;
			this._columnGap=0;
			this._defaultItem=null;
			this._autoResizeItem=false;
			this._selectionMode=0;
			this._lastSelectedIndex=0;
			this._pool=null;
			this._virtual=false;
			this._loop=false;
			this._numItems=0;
			this._firstIndex=0;
			this._viewCount=0;
			this._curLineItemCount=0;
			this._itemSize=null;
			this._virtualListChanged=0;
			this._eventLocked=false;
			GList.__super.call(this);
			this._trackBounds=true;
			this._pool=new GObjectPool();
			this._layout=0;
			this._autoResizeItem=true;
			this._lastSelectedIndex=-1;
			this._selectionMode=0;
			this.opaque=true;
		}

		__class(GList,'fairygui.GList',_super);
		var __proto=GList.prototype;
		__proto.dispose=function(){
			this._pool.clear();
			_super.prototype.dispose.call(this);
		}

		__proto.getFromPool=function(url){
			if (!url)
				url=this._defaultItem;
			var obj=this._pool.getObject(url);
			if(obj!=null)
				obj.visible=true;
			return obj;
		}

		__proto.returnToPool=function(obj){
			obj.displayObject.cacheAsBitmap=false;
			this._pool.returnObject(obj);
		}

		__proto.addChildAt=function(child,index){
			(index===void 0)&& (index=0);
			if (this._autoResizeItem){
				if (this._layout==0)
					child.width=this.viewWidth;
				else if (this._layout==1)
				child.height=this.viewHeight;
			}
			_super.prototype.addChildAt.call(this,child,index);
			if ((child instanceof fairygui.GButton )){
				var button=(child);
				button.selected=false;
				button.changeStateOnClick=false;
			}
			child.on("click",this,this.__clickItem);
			return child;
		}

		__proto.addItem=function(url){
			if (!url)
				url=this._defaultItem;
			return this.addChild(UIPackage.createObjectFromURL(url));
		}

		__proto.addItemFromPool=function(url){
			return this.addChild(this.getFromPool(url));
		}

		__proto.removeChildAt=function(index,dispose){
			(dispose===void 0)&& (dispose=false);
			var child=_super.prototype.removeChildAt.call(this,index,dispose);
			child.off("click",this,this.__clickItem);
			return child;
		}

		__proto.removeChildToPoolAt=function(index){
			(index===void 0)&& (index=0);
			var child=_super.prototype.removeChildAt.call(this,index);
			this.returnToPool(child);
		}

		__proto.removeChildToPool=function(child){
			this.removeChild(child);
			this.returnToPool(child);
		}

		__proto.removeChildrenToPool=function(beginIndex,endIndex){
			(beginIndex===void 0)&& (beginIndex=0);
			(endIndex===void 0)&& (endIndex=-1);
			if (endIndex < 0 || endIndex >=this._children.length)
				endIndex=this._children.length-1;
			for (var i=beginIndex;i <=endIndex;++i)
			this.removeChildToPoolAt(beginIndex);
		}

		__proto.getSelection=function(){
			var ret=[];
			var cnt=this._children.length;
			for (var i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null && obj.selected){
					var j=this._firstIndex+i;
					if(this._loop && this._numItems > 0)
						j=j % this._numItems;
					ret.push(j);
				}
			}
			return ret;
		}

		__proto.addSelection=function(index,scrollItToView){
			(scrollItToView===void 0)&& (scrollItToView=false);
			if (this._selectionMode==3)
				return;
			if (this._selectionMode==0)
				this.clearSelection();
			if(scrollItToView)
				this.scrollToView(index);
			if(this._loop && this._numItems>0){
				var j=this._firstIndex % this._numItems;
				if(index >=j)
					index=this._firstIndex+(index-j);
				else
				index=this._firstIndex+this._numItems+(j-index);
			}
			else
			index-=this._firstIndex;
			if(index<0 || index >=this._children.length)
				return;
			var obj=this.getChildAt(index).asButton;
			if(obj !=null && !obj.selected)
				obj.selected=true;
		}

		__proto.removeSelection=function(index){
			(index===void 0)&& (index=0);
			if (this._selectionMode==3)
				return;
			if(this._loop && this._numItems > 0){
				var j=this._firstIndex % this._numItems;
				if(index >=j)
					index=this._firstIndex+(index-j);
				else
				index=this._firstIndex+this._numItems+(j-index);
			}
			else
			index-=this._firstIndex;
			if(index >=this._children.length)
				return;
			var obj=this.getChildAt(index).asButton;
			if (obj !=null && obj.selected)
				obj.selected=false;
		}

		__proto.clearSelection=function(){
			var cnt=this._children.length;
			for (var i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null)
					obj.selected=false;
			}
		}

		__proto.selectAll=function(){
			var cnt=this._children.length;
			for (var i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null)
					obj.selected=true;
			}
		}

		__proto.selectNone=function(){
			var cnt=this._children.length;
			for (var i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null)
					obj.selected=false;
			}
		}

		__proto.selectReverse=function(){
			var cnt=this._children.length;
			for (var i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null)
					obj.selected=!obj.selected;
			}
		}

		__proto.handleArrowKey=function(dir){
			(dir===void 0)&& (dir=0);
			var index=this.selectedIndex;
			if (index==-1)
				return;
			switch (dir){
				case 1:
					if (this._layout==0 || this._layout==3){
						index--;
						if (index >=0){
							this.clearSelection();
							this.addSelection(index,true);
						}
					}
					else if (this._layout==2){
						var current=this._children[index];
						var k=0;
						for (var i=index-1;i >=0;i--){
							var obj=this._children[i];
							if (obj.y !=current.y){
								current=obj;
								break ;
							}
							k++;
						}
						for (;i >=0;i--){
							obj=this._children[i];
							if (obj.y !=current.y){
								this.clearSelection();
								this.addSelection(i+k+1,true);
								break ;
							}
						}
					}
					break ;
				case 3:
					if (this._layout==1 || this._layout==2){
						index++;
						if (index < this._children.length){
							this.clearSelection();
							this.addSelection(index,true);
						}
					}
					else if (this._layout==3){
						current=this._children[index];
						k=0;
						var cnt=this._children.length;
						for (i=index+1;i < cnt;i++){
							obj=this._children[i];
							if (obj.x !=current.x){
								current=obj;
								break ;
							}
							k++;
						}
						for (;i < cnt;i++){
							obj=this._children[i];
							if (obj.x !=current.x){
								this.clearSelection();
								this.addSelection(i-k-1,true);
								break ;
							}
						}
					}
					break ;
				case 5:
					if (this._layout==0 || this._layout==3){
						index++;
						if (index < this._children.length){
							this.clearSelection();
							this.addSelection(index,true);
						}
					}
					else if (this._layout==2){
						current=this._children[index];
						k=0;
						cnt=this._children.length;
						for (i=index+1;i < cnt;i++){
							obj=this._children[i];
							if (obj.y !=current.y){
								current=obj;
								break ;
							}
							k++;
						}
						for (;i < cnt;i++){
							obj=this._children[i];
							if (obj.y !=current.y){
								this.clearSelection();
								this.addSelection(i-k-1,true);
								break ;
							}
						}
					}
					break ;
				case 7:
					if (this._layout==1 || this._layout==2){
						index--;
						if (index >=0){
							this.clearSelection();
							this.addSelection(index,true);
						}
					}
					else if (this._layout==3){
						current=this._children[index];
						k=0;
						for (i=index-1;i >=0;i--){
							obj=this._children[i];
							if (obj.x !=current.x){
								current=obj;
								break ;
							}
							k++;
						}
						for (;i >=0;i--){
							obj=this._children[i];
							if (obj.x !=current.x){
								this.clearSelection();
								this.addSelection(i+k+1,true);
								break ;
							}
						}
					}
					break ;
				}
		}

		__proto.__clickItem=function(evt){
			if (this._scrollPane !=null && this._scrollPane._isMouseMoved)
				return;
			var item=GObject.cast(evt.currentTarget);
			this.setSelectionOnEvent(item,evt);
			if(this.scrollPane)
				this.scrollPane.scrollToView(item,true);
			this.displayObject.event("fui_click_item",[item,Events.createEvent("fui_click_item",this.displayObject,evt)]);
		}

		__proto.setSelectionOnEvent=function(item,evt){
			if (!((item instanceof fairygui.GButton ))|| this._selectionMode==3)
				return;
			var dontChangeLastIndex=false;
			var button=(item);
			var index=this.getChildIndex(item);
			if (this._selectionMode==0){
				if (!button.selected){
					this.clearSelectionExcept(button);
					button.selected=true;
				}
			}
			else {
				if (evt.shiftKey){
					if (!button.selected){
						if (this._lastSelectedIndex !=-1){
							var min=Math.min(this._lastSelectedIndex,index);
							var max=Math.max(this._lastSelectedIndex,index);
							max=Math.min(max,this._children.length-1);
							for (var i=min;i <=max;i++){
								var obj=this.getChildAt(i).asButton;
								if (obj !=null && !obj.selected)
									obj.selected=true;
							}
							dontChangeLastIndex=true;
						}
						else {
							button.selected=true;
						}
					}
				}
				else if (evt.ctrlKey || this._selectionMode==2){
					button.selected=!button.selected;
				}
				else {
					if (!button.selected){
						this.clearSelectionExcept(button);
						button.selected=true;
					}
					else
					this.clearSelectionExcept(button);
				}
			}
			if (!dontChangeLastIndex)
				this._lastSelectedIndex=index;
			return;
		}

		__proto.clearSelectionExcept=function(obj){
			var cnt=this._children.length;
			for (var i=0;i < cnt;i++){
				var button=this._children[i].asButton;
				if (button !=null && button !=obj && button.selected)
					button.selected=false;
			}
		}

		__proto.resizeToFit=function(itemCount,minSize){
			(itemCount===void 0)&& (itemCount=1000000);
			(minSize===void 0)&& (minSize=0);
			this.ensureBoundsCorrect();
			var curCount=this.numItems;
			if (itemCount > curCount)
				itemCount=curCount;
			if(this._virtual){
				var lineCount=Math.ceil(itemCount / this._curLineItemCount);
				if(this._layout==0 || this._layout==2)
					this.viewHeight=lineCount *this._itemSize.y+Math.max(0,lineCount-1)*this._lineGap;
				else
				this.viewWidth=lineCount *this._itemSize.x+Math.max(0,lineCount-1)*this._columnGap;
			}
			else if(itemCount==0){
				if (this._layout==0 || this._layout==2)
					this.viewHeight=minSize;
				else
				this.viewWidth=minSize;
			}
			else {
				var i=itemCount-1;
				var obj=null;
				while (i >=0){
					obj=this.getChildAt(i);
					if (obj.visible)
						break ;
					i--;
				}
				if (i < 0){
					if (this._layout==0 || this._layout==2)
						this.viewHeight=minSize;
					else
					this.viewWidth=minSize;
				}
				else {
					var size=0;
					if (this._layout==0 || this._layout==2){
						size=obj.y+obj.height;
						if (size < minSize)
							size=minSize;
						this.viewHeight=size;
					}
					else {
						size=obj.x+obj.width;
						if (size < minSize)
							size=minSize;
						this.viewWidth=size;
					}
				}
			}
		}

		__proto.getMaxItemWidth=function(){
			var cnt=this._children.length;
			var max=0;
			for (var i=0;i < cnt;i++){
				var child=this.getChildAt(i);
				if (child.width > max)
					max=child.width;
			}
			return max;
		}

		__proto.handleSizeChanged=function(){
			_super.prototype.handleSizeChanged.call(this);
			if (this._autoResizeItem)
				this.adjustItemsSize();
			if (this._layout==2 || this._layout==3){
				this.setBoundsChangedFlag();
				if (this._virtual)
					this.setVirtualListChangedFlag(true);
			}
		}

		__proto.adjustItemsSize=function(){
			if (this._layout==0){
				var cnt=this._children.length;
				var cw=this.viewWidth;
				for (var i=0;i < cnt;i++){
					var child=this.getChildAt(i);
					child.width=cw;
				}
			}
			else if (this._layout==1){
				cnt=this._children.length;
				var ch=this.viewHeight;
				for (i=0;i < cnt;i++){
					child=this.getChildAt(i);
					child.height=ch;
				}
			}
		}

		__proto.getSnappingPosition=function(xValue,yValue,resultPoint){
			if (this._virtual){
				if(!resultPoint)
					resultPoint=new Point();
				if (this._layout==0 || this._layout==2){
					var i=Math.floor(yValue / (this._itemSize.y+this._lineGap));
					if (yValue > i *(this._itemSize.y+this._lineGap)+this._itemSize.y / 2)
						i++;
					resultPoint.x=xValue;
					resultPoint.y=i *(this._itemSize.y+this._lineGap);
				}
				else{
					i=Math.floor(xValue / (this._itemSize.x+this._columnGap));
					if(xValue > i *(this._itemSize.x+this._columnGap)+this._itemSize.x / 2)
						i++;
					resultPoint.x=i *(this._itemSize.x+this._columnGap);
					resultPoint.y=yValue;
				}
				return resultPoint;
			}
			else {
				return _super.prototype.getSnappingPosition.call(this,xValue,yValue,resultPoint);
			}
		}

		__proto.scrollToView=function(index,ani,setFirst){
			(ani===void 0)&& (ani=false);
			(setFirst===void 0)&& (setFirst=false);
			if(this._virtual){
				if(this.scrollPane !=null)
					this.scrollPane.scrollToView(this.getItemRect(index),ani,setFirst);
				else if(this.parent !=null && this.parent.scrollPane !=null)
				this.parent.scrollPane.scrollToView(this.getItemRect(index),ani,setFirst);
			}
			else {
				var obj=this.getChildAt(index).asButton;
				if(obj !=null){
					if(this.scrollPane !=null)
						this.scrollPane.scrollToView(obj,ani,setFirst);
					else if(this.parent !=null && this.parent.scrollPane !=null)
					this.parent.scrollPane.scrollToView(obj,ani,setFirst);
				}
			}
		}

		__proto.getFirstChildInView=function(){
			var ret=_super.prototype.getFirstChildInView.call(this);
			if(ret !=-1){
				ret+=this._firstIndex;
				if(this._loop && this._numItems>0)
					ret=ret % this._numItems;
				return ret;
			}
			else
			return-1;
		}

		__proto.setVirtual=function(){
			this._setVirtual(false);
		}

		/// </summary>
		__proto.setVirtualAndLoop=function(){
			this._setVirtual(true);
		}

		/// </summary>
		__proto._setVirtual=function(loop){
			if(!this._virtual){
				if(this.scrollPane==null)
					throw new Error("Virtual list must be scrollable!");
				if(loop){
					if(this._layout==2 || this._layout==3)
						throw new Error("Only single row or single column layout type is supported for loop list!");
					this.scrollPane.bouncebackEffect=false;
				}
				this._virtual=true;
				this._loop=loop;
				this.removeChildrenToPool();
				if(this._itemSize==null){
					this._itemSize=new Point();
					var obj=this.getFromPool(null);
					this._itemSize.x=obj.width;
					this._itemSize.y=obj.height;
					this.returnToPool(obj);
				}
				if(this._layout==0 || this._layout==2)
					this.scrollPane.scrollSpeed=this._itemSize.y;
				else
				this.scrollPane.scrollSpeed=this._itemSize.x;
				this.on("fui_scroll",this,this.__scrolled);
				this.setVirtualListChangedFlag(true);
			}
		}

		__proto.__parentSizeChanged=function(){
			this.setVirtualListChangedFlag();
		}

		__proto.setVirtualListChangedFlag=function(layoutChanged){
			(layoutChanged===void 0)&& (layoutChanged=false);
			if(layoutChanged)
				this._virtualListChanged=2;
			else if(this._virtualListChanged==0)
			this._virtualListChanged=1;
			Laya.timer.callLater(this,this.refreshVirtualList);
		}

		__proto.refreshVirtualList=function(){
			if(this._virtualListChanged==0)
				return;
			var layoutChanged=this._virtualListChanged==2;
			this._virtualListChanged=0;
			this._eventLocked=true;
			if(layoutChanged){
				if(this._layout==0 || this._layout==2){
					if(this._layout==0)
						this._curLineItemCount=1;
					else if(this._lineItemCount !=0)
					this._curLineItemCount=this._lineItemCount;
					else
					this._curLineItemCount=Math.floor((this.scrollPane.viewWidth+this._columnGap)/ (this._itemSize.x+this._columnGap));
					this._viewCount=(Math.ceil((this.scrollPane.viewHeight+this._lineGap)/ (this._itemSize.y+this._lineGap))+1)*this._curLineItemCount;
					var numChildren=this._children.length;
					if(numChildren < this._viewCount){
						for(var i=numChildren;i < this._viewCount;i++)
						this.addItemFromPool();
					}
					else if(numChildren > this._viewCount)
					this.removeChildrenToPool(this._viewCount,numChildren);
				}
				else {
					if(this._layout==1)
						this._curLineItemCount=1;
					else if(this._lineItemCount !=0)
					this._curLineItemCount=this._lineItemCount;
					else
					this._curLineItemCount=Math.floor((this.scrollPane.viewHeight+this._lineGap)/ (this._itemSize.y+this._lineGap));
					this._viewCount=(Math.ceil((this.scrollPane.viewWidth+this._columnGap)/ (this._itemSize.x+this._columnGap))+1)*this._curLineItemCount;
					numChildren=this._children.length;
					if(numChildren < this._viewCount){
						for(i=numChildren;i < this._viewCount;i++)
						this.addItemFromPool();
					}
					else if(numChildren > this._viewCount)
					this.removeChildrenToPool(this._viewCount,numChildren);
				}
			}
			this.ensureBoundsCorrect();
			if(this._layout==0 || this._layout==2){
				if(this.scrollPane !=null){
					var ch=NaN;
					if(this._layout==0){
						ch=this._numItems *this._itemSize.y+Math.max(0,this._numItems-1)*this._lineGap;
						if(this._loop && ch > 0)
							ch=ch *5+this._lineGap *4;
					}
					else {
						var lineCount=Math.ceil(this._numItems / this._curLineItemCount);
						ch=lineCount *this._itemSize.y+Math.max(0,lineCount-1)*this._lineGap;
					}
					this.scrollPane.setContentSize(this.scrollPane.contentWidth,ch);
				}
			}
			else {
				if(this.scrollPane !=null){
					var cw=NaN;
					if(this._layout==1){
						cw=this._numItems *this._itemSize.x+Math.max(0,this._numItems-1)*this._columnGap;
						if(this._loop && cw > 0)
							cw=cw *5+this._columnGap *4;
					}
					else {
						lineCount=Math.ceil(this._numItems / this._curLineItemCount);
						cw=lineCount *this._itemSize.x+Math.max(0,lineCount-1)*this._columnGap;
					}
					this.scrollPane.setContentSize(cw,this.scrollPane.contentHeight);
				}
			}
			this._eventLocked=false;
			this.__scrolled(null);
		}

		__proto.renderItems=function(beginIndex,endIndex){
			for(var i=0;i < this._viewCount;i++){
				var obj=this.getChildAt(i);
				var j=this._firstIndex+i;
				if(this._loop && this._numItems>0)
					j=j % this._numItems;
				if(j < this._numItems){
					obj.visible=true;
					if(i >=beginIndex && i < endIndex)
						this.itemRenderer.runWith([j,obj]);
				}
				else
				obj.visible=false;
			}
		}

		__proto.getItemRect=function(index){
			var rect;
			var index1=Math.floor(index / this._curLineItemCount);
			var index2=index % this._curLineItemCount;
			switch(this._layout){
				case 0:
					rect=new Rectangle(0,index1 *this._itemSize.y+Math.max(0,index1-1)*this._lineGap,
					this.viewWidth,this._itemSize.y);
					break ;
				case 2:
					rect=new Rectangle(index2 *this._itemSize.x+Math.max(0,index2-1)*this._columnGap,
					index1 *this._itemSize.y+Math.max(0,index1-1)*this._lineGap,
					this._itemSize.x,this._itemSize.y);
					break ;
				case 1:
					rect=new Rectangle(index1 *this._itemSize.x+Math.max(0,index1-1)*this._columnGap,0,
					this._itemSize.x,this.viewHeight);
					break ;
				case 3:
					rect=new Rectangle(index1 *this._itemSize.x+Math.max(0,index1-1)*this._columnGap,
					index2 *this._itemSize.y+Math.max(0,index2-1)*this._lineGap,
					this._itemSize.x,this._itemSize.y);
					break ;
				}
			return rect;
		}

		__proto.__scrolled=function(evt){
			if(this._eventLocked)
				return;
			if(this._layout==0 || this._layout==2){
				if(this._loop){
					if(this.scrollPane.percY==0)
						this.scrollPane.posY=this._numItems *(this._itemSize.y+this._lineGap);
					else if(this.scrollPane.percY==1)
					this.scrollPane.posY=this.scrollPane.contentHeight-this._numItems *(this._itemSize.y+this._lineGap)-this.viewHeight;
				};
				var firstLine=Math.floor((this.scrollPane.posY+this._lineGap)/ (this._itemSize.y+this._lineGap));
				var newFirstIndex=firstLine *this._curLineItemCount;
				for(var i=0;i < this._viewCount;i++){
					var obj=this.getChildAt(i);
					obj.y=(firstLine+Math.floor(i / this._curLineItemCount))*(this._itemSize.y+this._lineGap);
				}
				if(newFirstIndex >=this._numItems)
					newFirstIndex-=this._numItems;
				if(newFirstIndex !=this._firstIndex || evt==null){
					var oldFirstIndex=this._firstIndex;
					this._firstIndex=newFirstIndex;
					if(evt==null || oldFirstIndex+this._viewCount < newFirstIndex || oldFirstIndex > newFirstIndex+this._viewCount){
						for(i=0;i < this._viewCount;i++){
							obj=this.getChildAt(i);
							if((obj instanceof fairygui.GButton ))
								(obj).selected=false;
						}
						this.renderItems(0,this._viewCount);
					}
					else if(oldFirstIndex > newFirstIndex){
						var j1=oldFirstIndex-newFirstIndex;
						var j2=this._viewCount-j1;
						for(i=j2-1;i >=0;i--){
							var obj1=this.getChildAt(i);
							var obj2=this.getChildAt(i+j1);
							if((obj2 instanceof fairygui.GButton ))
								(obj2).selected=false;
							var tmp=obj1.y;
							obj1.y=obj2.y;
							obj2.y=tmp;
							this.swapChildrenAt(i+j1,i);
						}
						this.renderItems(0,j1);
					}
					else {
						j1=newFirstIndex-oldFirstIndex;
						j2=this._viewCount-j1;
						for(i=0;i < j2;i++){
							obj1=this.getChildAt(i);
							obj2=this.getChildAt(i+j1);
							if((obj1 instanceof fairygui.GButton ))
								(obj1).selected=false;
							tmp=obj1.y;
							obj1.y=obj2.y;
							obj2.y=tmp;
							this.swapChildrenAt(i+j1,i);
						}
						this.renderItems(j2,this._viewCount);
					}
				}
			}
			else {
				if(this._loop){
					if(this.scrollPane.percX==0)
						this.scrollPane.posX=this._numItems *(this._itemSize.x+this._columnGap);
					else if(this.scrollPane.percX==1)
					this.scrollPane.posX=this.scrollPane.contentWidth-this._numItems *(this._itemSize.x+this._columnGap)-this.viewWidth;
				}
				firstLine=Math.floor((this.scrollPane.posX+this._columnGap)/ (this._itemSize.x+this._columnGap));
				newFirstIndex=firstLine *this._curLineItemCount;
				for(i=0;i < this._viewCount;i++){
					obj=this.getChildAt(i);
					obj.x=(firstLine+Math.floor(i / this._curLineItemCount))*(this._itemSize.x+this._columnGap);
				}
				if(newFirstIndex >=this._numItems)
					newFirstIndex-=this._numItems;
				if(newFirstIndex !=this._firstIndex || evt==null){
					oldFirstIndex=this._firstIndex;
					this._firstIndex=newFirstIndex;
					if(evt==null || oldFirstIndex+this._viewCount < newFirstIndex || oldFirstIndex > newFirstIndex+this._viewCount){
						for(i=0;i < this._viewCount;i++){
							obj=this.getChildAt(i);
							if((obj1 instanceof fairygui.GButton ))
								(obj1).selected=false;
						}
						this.renderItems(0,this._viewCount);
					}
					else if(oldFirstIndex > newFirstIndex){
						j1=oldFirstIndex-newFirstIndex;
						j2=this._viewCount-j1;
						for(i=j2-1;i >=0;i--){
							obj1=this.getChildAt(i);
							obj2=this.getChildAt(i+j1);
							if((obj2 instanceof fairygui.GButton ))
								(obj2).selected=false;
							tmp=obj1.x;
							obj1.x=obj2.x;
							obj2.x=tmp;
							this.swapChildrenAt(i+j1,i);
						}
						this.renderItems(0,j1);
					}
					else {
						j1=newFirstIndex-oldFirstIndex;
						j2=this._viewCount-j1;
						for(i=0;i < j2;i++){
							obj1=this.getChildAt(i);
							obj2=this.getChildAt(i+j1);
							if((obj1 instanceof fairygui.GButton ))
								(obj1).selected=false;
							tmp=obj1.x;
							obj1.x=obj2.x;
							obj2.x=tmp;
							this.swapChildrenAt(i+j1,i);
						}
						this.renderItems(j2,this._viewCount);
					}
				}
			}
			this._boundsChanged=false;
		}

		__proto.updateBounds=function(){
			var cnt=this._children.length;
			var i=0;
			var child;
			var curX=0;
			var curY=0;;
			var maxWidth=0;
			var maxHeight=0;
			var cw=NaN,ch=0;
			for(i=0;i < cnt;i++){
				child=this.getChildAt(i);
				child.ensureSizeCorrect();
			}
			if (this._layout==0){
				for (i=0;i < cnt;i++){
					child=this.getChildAt(i);
					if (!child.visible)
						continue ;
					if (curY !=0)
						curY+=this._lineGap;
					child.y=curY;
					curY+=child.height;
					if (child.width > maxWidth)
						maxWidth=child.width;
				}
				cw=curX+maxWidth;
				ch=curY;
			}
			else if (this._layout==1){
				for (i=0;i < cnt;i++){
					child=this.getChildAt(i);
					if (!child.visible)
						continue ;
					if (curX !=0)
						curX+=this._columnGap;
					child.x=curX;
					curX+=child.width;
					if (child.height > maxHeight)
						maxHeight=child.height;
				}
				cw=curX;
				ch=curY+maxHeight;
			}
			else if (this._layout==2){
				var j=0;
				var viewWidth=this.viewWidth;
				for (i=0;i < cnt;i++){
					child=this.getChildAt(i);
					if (!child.visible)
						continue ;
					if (curX !=0)
						curX+=this._columnGap;
					if(this._lineItemCount !=0 && j >=this._lineItemCount
						|| this._lineItemCount==0 && curX+child.width > viewWidth && maxHeight !=0){
						curX-=this._columnGap;
						if(curX > maxWidth)
							maxWidth=curX;
						curX=0;
						curY+=maxHeight+this._lineGap;
						maxHeight=0;
						j=0;
					}
					child.setXY(curX,curY);
					curX+=child.width;
					if(child.height > maxHeight)
						maxHeight=child.height;
					j++;
				}
				ch=curY+maxHeight;
				cw=maxWidth;
			}
			else {
				j=0;
				var viewHeight=this.viewHeight;
				for (i=0;i < cnt;i++){
					child=this.getChildAt(i);
					if (!child.visible)
						continue ;
					if (curY !=0)
						curY+=this._lineGap;
					if(this._lineItemCount !=0 && j >=this._lineItemCount
						|| this._lineItemCount==0 && curY+child.height > viewHeight && maxWidth !=0){
						curY-=this._lineGap;
						if(curY > maxHeight)
							maxHeight=curY;
						curY=0;
						curX+=maxWidth+this._columnGap;
						maxWidth=0;
						j=0;
					}
					child.setXY(curX,curY);
					curY+=child.height;
					if(child.width > maxWidth)
						maxWidth=child.width;
					j++;
				}
				cw=curX+maxWidth;
				ch=maxHeight;
			}
			this.setBounds(0,0,cw,ch);
		}

		__proto.setup_beforeAdd=function(xml){
			fairygui.GObject.prototype.setup_beforeAdd.call(this,xml);
			var str;
			var arr;
			str=xml.getAttribute("layout");
			if (str)
				this._layout=ListLayoutType.parse(str);
			var overflow=0;
			str=xml.getAttribute("overflow");
			if (str)
				overflow=OverflowType.parse(str);
			else
			overflow=0;
			str=xml.getAttribute("margin");
			if(str)
				this._margin.parse(str);
			if(overflow==2){
				var scroll=0;
				str=xml.getAttribute("scroll");
				if (str)
					scroll=ScrollType.parse(str);
				else
				scroll=1;
				var scrollBarDisplay=0;
				str=xml.getAttribute("scrollBar");
				if (str)
					scrollBarDisplay=ScrollBarDisplayType.parse(str);
				else
				scrollBarDisplay=0;
				var scrollBarFlags=NaN;
				str=xml.getAttribute("scrollBarFlags");
				if(str)
					scrollBarFlags=parseInt(str);
				else
				scrollBarFlags=0;
				var scrollBarMargin=new Margin();
				str=xml.getAttribute("scrollBarMargin");
				if(str)
					scrollBarMargin.parse(str);
				var vtScrollBarRes;
				var hzScrollBarRes;
				str=xml.getAttribute("scrollBarRes");
				if(str){
					arr=str.split(",");
					vtScrollBarRes=arr[0];
					hzScrollBarRes=arr[1];
				}
				this.setupScroll(scrollBarMargin,scroll,scrollBarDisplay,scrollBarFlags,vtScrollBarRes,hzScrollBarRes);
			}
			else
			this.setupOverflow(overflow);
			str=xml.getAttribute("lineGap");
			if (str)
				this._lineGap=parseInt(str);
			str=xml.getAttribute("colGap");
			if (str)
				this._columnGap=parseInt(str);
			str=xml.getAttribute("lineItemCount");
			if(str)
				this._lineItemCount=parseInt(str);
			str=xml.getAttribute("selectionMode");
			if (str)
				this._selectionMode=ListSelectionMode.parse(str);
			str=xml.getAttribute("defaultItem");
			if (str)
				this._defaultItem=str;
			str=xml.getAttribute("autoItemSize");
			this._autoResizeItem=str !="false";
			var col=xml.childNodes;
			var length=col.length;
			for (var i=0;i < length;i++){
				var cxml=col[i];
				if(cxml.nodeName !="item")
					continue ;
				var url=cxml.getAttribute("url");
				if (!url)
					url=this._defaultItem;
				if (!url)
					continue ;
				var obj=this.getFromPool(url);
				if(obj !=null){
					this.addChild(obj);
					if ((obj instanceof fairygui.GButton )){
						(obj).title=cxml.getAttribute("title");
						(obj).icon=cxml.getAttribute("icon");
					}
					else if ((obj instanceof fairygui.GLabel )){
						(obj).title=cxml.getAttribute("title");
						(obj).icon=cxml.getAttribute("icon");
					}
				}
			}
		}

		__getset(0,__proto,'layout',function(){
			return this._layout;
			},function(value){
			if (this._layout !=value){
				this._layout=value;
				this.setBoundsChangedFlag();
				if(this._virtual)
					this.setVirtualListChangedFlag(true);
			}
		});

		__getset(0,__proto,'lineGap',function(){
			return this._lineGap;
			},function(value){
			if (this._lineGap !=value){
				this._lineGap=value;
				this.setBoundsChangedFlag();
				if(this._virtual)
					this.setVirtualListChangedFlag(true);
			}
		});

		__getset(0,__proto,'lineItemCount',function(){
			return this._lineItemCount;
			},function(value){
			if(this._lineItemCount !=value){
				this._lineItemCount=value;
				this.setBoundsChangedFlag();
				if(this._virtual)
					this.setVirtualListChangedFlag(true);
			}
		});

		__getset(0,__proto,'selectionMode',function(){
			return this._selectionMode;
			},function(value){
			this._selectionMode=value;
		});

		__getset(0,__proto,'columnGap',function(){
			return this._columnGap;
			},function(value){
			if (this._columnGap !=value){
				this._columnGap=value;
				this.setBoundsChangedFlag();
				if(this._virtual)
					this.setVirtualListChangedFlag(true);
			}
		});

		__getset(0,__proto,'defaultItem',function(){
			return this._defaultItem;
			},function(val){
			this._defaultItem=val;
		});

		__getset(0,__proto,'virtualItemSize',function(){
			return this._itemSize;
			},function(value){
			if(this._virtual){
				if(this._itemSize==null)
					this._itemSize=new Point();
				this._itemSize.setTo(value.x,value.y);
				this.setVirtualListChangedFlag(true);
			}
		});

		__getset(0,__proto,'autoResizeItem',function(){
			return this._autoResizeItem;
			},function(value){
			this._autoResizeItem=value;
		});

		__getset(0,__proto,'selectedIndex',function(){
			var cnt=this._children.length;
			for (var i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null && obj.selected){
					var j=this._firstIndex+i;
					if(this._loop && this._numItems > 0)
						j=j % this._numItems;
					return j;
				}
			}
			return-1;
			},function(value){
			this.clearSelection();
			if (value >=0 && value < this.numItems)
				this.addSelection(value);
		});

		/// </summary>
		__getset(0,__proto,'numItems',function(){
			if(this._virtual)
				return this._numItems;
			else
			return this._children.length;
			},function(value){
			if(this._virtual){
				this._numItems=value;
				this.setVirtualListChangedFlag();
			}
			else {
				var cnt=this._children.length;
				if(value > cnt){
					for(var i=cnt;i < value;i++)
					this.addItemFromPool();
				}
				else {
					this.removeChildrenToPool(value,cnt);
				}
				if(this.itemRenderer !=null){
					for(i=0;i < value;i++)
					this.itemRenderer.runWith([i,this.getChildAt(i)]);
				}
			}
		});

		return GList;
	})(GComponent)


	//class fairygui.GRichTextField extends fairygui.GTextField
	var GRichTextField=(function(_super){
		function GRichTextField(){
			this.div=null;
			this._text=null;
			this._ubbEnabled=false;
			this._color=null;
			GRichTextField.__super.call(this);
			this._text="";
		}

		__class(GRichTextField,'fairygui.GRichTextField',_super);
		var __proto=GRichTextField.prototype;
		Laya.imps(__proto,{"fairygui.IColorGear":true})
		__proto.createDisplayObject=function(){
			this._displayObject=this.div=new HTMLDivElement();
			this._displayObject.mouseEnabled=true;
			this._displayObject["$owner"]=this;
		}

		__proto.handleSizeChanged=function(){
			this.div.size(this.width,this.height);
		}

		__getset(0,__proto,'leading',function(){
			return this.div.style.leading;
			},function(value){
			this.div.style.leading=value;
		});

		__getset(0,__proto,'text',function(){
			return this._text;
			},function(value){
			this._text=value;
			if(this._ubbEnabled)
				this.div.innerHTML=ToolSet.parseUBB(ToolSet.encodeHTML(this._text));
			else
			this.div.innerHTML=this._text;
		});

		__getset(0,__proto,'font',function(){
			return this.div.style.font;
			},function(value){
			this.div.style.font=value;
		});

		__getset(0,__proto,'italic',function(){
			return this.div.style.italic;
			},function(value){
			this.div.style.italic=value;
		});

		__getset(0,__proto,'valign',function(){
			return this.div.style.valign;
			},function(value){
			this.div.style.valign=value;
		});

		__getset(0,__proto,'fontSize',function(){
			return this.div.style.fontSize;
			},function(value){
			this.div.style.fontSize=value;
		});

		__getset(0,__proto,'color',function(){
			return this._color;
			},function(value){
			if (this._color !=value){
				this._color=value;
				this.div.color=value;
				if (this._gearColor.controller)
					this._gearColor.updateState();
			}
		});

		__getset(0,__proto,'strokeColor',function(){
			return this.div.style.strokeColor;
			},function(value){
			this.div.style.strokeColor=value;
		});

		__getset(0,__proto,'align',function(){
			return this.div.style.align;
			},function(value){
			this.div.style.align=value;
		});

		__getset(0,__proto,'bold',function(){
			return this.div.style.bold;
			},function(value){
			this.div.style.bold=value;
		});

		__getset(0,__proto,'stroke',function(){
			return this.div.style.stroke;
			},function(value){
			this.div.style.stroke=value;
		});

		__getset(0,__proto,'ubbEnabled',function(){
			return this._ubbEnabled;
			},function(value){
			this._ubbEnabled=value;
		});

		return GRichTextField;
	})(GTextField)


	//class fairygui.GProgressBar extends fairygui.GComponent
	var GProgressBar=(function(_super){
		function GProgressBar(){
			this._max=0;
			this._value=0;
			this._titleType=0;
			this._reverse=false;
			this._titleObject=null;
			this._aniObject=null;
			this._barObjectH=null;
			this._barObjectV=null;
			this._barMaxWidth=0;
			this._barMaxHeight=0;
			this._barMaxWidthDelta=0;
			this._barMaxHeightDelta=0;
			this._barStartX=0;
			this._barStartY=0;
			this._tweener=null;
			this._tweenValue=0;
			GProgressBar.__super.call(this);
			this._titleType=0;
			this._value=50;
			this._max=100;
		}

		__class(GProgressBar,'fairygui.GProgressBar',_super);
		var __proto=GProgressBar.prototype;
		__proto.tweenValue=function(value,duration){
			if(this._value !=value){
				if(this._tweener)
					this._tweener.clear();
				this._tweenValue=this._value;
				this._value=value;
				this._tweener=Tween.to(this,{_tweenValue:value },duration *1000,fairygui.GProgressBar.easeLinear);
				this._tweener.update=Handler.create(this,this.onUpdateTween,null,false);
			}
		}

		__proto.onUpdateTween=function(){
			this.update(this._tweenValue);
		}

		__proto.update=function(newValue){
			var percent=Math.min(newValue / this._max,1);
			if(this._titleObject){
				switch(this._titleType){
					case 0:
						this._titleObject.text=Math.round(percent *100)+"%";
						break ;
					case 1:
						this._titleObject.text=Math.round(newValue)+"/"+Math.round(this._max);
						break ;
					case 2:
						this._titleObject.text=""+Math.round(newValue);
						break ;
					case 3:
						this._titleObject.text=""+Math.round(this._max);
						break ;
					}
			};
			var fullWidth=this.width-this._barMaxWidthDelta;
			var fullHeight=this.height-this._barMaxHeightDelta;
			if(!this._reverse){
				if(this._barObjectH)
					this._barObjectH.width=fullWidth *percent;
				if(this._barObjectV)
					this._barObjectV.height=fullHeight *percent;
			}
			else {
				if(this._barObjectH){
					this._barObjectH.width=fullWidth *percent;
					this._barObjectH.x=this._barStartX+(fullWidth-this._barObjectH.width);
				}
				if(this._barObjectV){
					this._barObjectV.height=fullHeight *percent;
					this._barObjectV.y=this._barStartY+(fullHeight-this._barObjectV.height);
				}
			}
			if((this._aniObject instanceof fairygui.GMovieClip ))
				(this._aniObject).frame=Math.round(percent *100);
		}

		__proto.constructFromXML=function(xml){
			_super.prototype.constructFromXML.call(this,xml);
			xml=ToolSet.findChildNode(xml,"ProgressBar");
			var str;
			str=xml.getAttribute("titleType");
			if(str)
				this._titleType=ProgressTitleType.parse(str);
			this._reverse=xml.getAttribute("reverse")=="true";
			this._titleObject=(this.getChild("title"));
			this._barObjectH=this.getChild("bar");
			this._barObjectV=this.getChild("bar_v");
			this._aniObject=this.getChild("ani");
			if(this._barObjectH){
				this._barMaxWidth=this._barObjectH.width;
				this._barMaxWidthDelta=this.width-this._barMaxWidth;
				this._barStartX=this._barObjectH.x;
			}
			if(this._barObjectV){
				this._barMaxHeight=this._barObjectV.height;
				this._barMaxHeightDelta=this.height-this._barMaxHeight;
				this._barStartY=this._barObjectV.y;
			}
		}

		__proto.handleSizeChanged=function(){
			_super.prototype.handleSizeChanged.call(this);
			if(this._barObjectH)
				this._barMaxWidth=this.width-this._barMaxWidthDelta;
			if(this._barObjectV)
				this._barMaxHeight=this.height-this._barMaxHeightDelta;
			if(!this._underConstruct)
				this.update(this._value);
		}

		__proto.setup_afterAdd=function(xml){
			fairygui.GObject.prototype.setup_afterAdd.call(this,xml);
			xml=ToolSet.findChildNode(xml,"ProgressBar");
			if (xml){
				this._value=parseInt(xml.getAttribute("value"));
				this._max=parseInt(xml.getAttribute("max"));
			}
			this.update(this._value);
		}

		__proto.dispose=function(){
			if(this._tweener)
				this._tweener.clear();
			_super.prototype.dispose.call(this);
		}

		__getset(0,__proto,'titleType',function(){
			return this._titleType;
			},function(value){
			if(this._titleType !=value){
				this._titleType=value;
				this.update(this._value);
			}
		});

		__getset(0,__proto,'max',function(){
			return this._max;
			},function(value){
			if(this._max !=value){
				this._max=value;
				this.update(this._value);
			}
		});

		__getset(0,__proto,'value',function(){
			return this._value;
			},function(value){
			if(this._tweener !=null){
				this._tweener.clear();
				this._tweener=null;
			}
			if(this._value !=value){
				this._value=value;
				this.update(this._value);
			}
		});

		__static(GProgressBar,
		['easeLinear',function(){return this.easeLinear=Ease.linearNone;}
		]);
		return GProgressBar;
	})(GComponent)


	//class fairygui.GTextInput extends fairygui.GTextField
	var GTextInput=(function(_super){
		function GTextInput(){
			this.input=null;
			GTextInput.__super.call(this);
		}

		__class(GTextInput,'fairygui.GTextInput',_super);
		var __proto=GTextInput.prototype;
		Laya.imps(__proto,{"fairygui.IColorGear":true})
		__proto.createDisplayObject=function(){
			this._displayObject=this.input=new Input();
			this._displayObject.mouseEnabled=true;
			this._displayObject["$owner"]=this;
		}

		__proto.handleSizeChanged=function(){
			this.input.size(this.width,this.height);
		}

		__getset(0,__proto,'leading',function(){
			return this.input.leading;
			},function(value){
			this.input.leading=value;
		});

		__getset(0,__proto,'text',function(){
			return this.input.text;
			},function(value){
			this.input.text=value;
		});

		__getset(0,__proto,'font',function(){
			return this.input.font;
			},function(value){
			this.input.font=value;
		});

		__getset(0,__proto,'italic',function(){
			return this.input.italic;
			},function(value){
			this.input.italic=value;
		});

		__getset(0,__proto,'valign',function(){
			return this.input.valign;
			},function(value){
			this.input.valign=value;
		});

		__getset(0,__proto,'fontSize',function(){
			return this.input.fontSize;
			},function(value){
			this.input.fontSize=value;
		});

		__getset(0,__proto,'color',function(){
			return this.input.color;
			},function(value){
			this.input.color=value;
		});

		__getset(0,__proto,'strokeColor',function(){
			return this.input.strokeColor;
			},function(value){
			this.input.strokeColor=value;
		});

		__getset(0,__proto,'align',function(){
			return this.input.align;
			},function(value){
			this.input.align=value;
		});

		__getset(0,__proto,'bold',function(){
			return this.input.bold;
			},function(value){
			this.input.bold=value;
		});

		__getset(0,__proto,'asPassword',function(){
			return this.input.asPassword;
			},function(value){
			this.input.asPassword=value;
		});

		__getset(0,__proto,'singleLine',function(){
			return !this.input.multiline;
			},function(value){
			this.input.multiline=!value;
		});

		__getset(0,__proto,'stroke',function(){
			return this.input.stroke;
			},function(value){
			this.input.stroke=value;
		});

		__getset(0,__proto,'editable',function(){
			return this.input.editable;
			},function(value){
			this.input.editable=value;
		});

		__getset(0,__proto,'maxChars',function(){
			return this.input.maxChars;
			},function(value){
			this.input.maxChars=value;
		});

		__getset(0,__proto,'promptText',function(){
			return this.input.prompt;
			},function(value){
			this.input.prompt=value;
		});

		__getset(0,__proto,'textWidth',function(){
			return this.input.textWidth;
		});

		return GTextInput;
	})(GTextField)


	//class fairygui.GRoot extends fairygui.GComponent
	var GRoot=(function(_super){
		function GRoot(){
			this._modalLayer=null;
			this._popupStack=null;
			this._justClosedPopups=null;
			this._modalWaitPane=null;
			this._focusedObject=null;
			this._tooltipWin=null;
			this._defaultTooltipWin=null;
			this._volumeScale=0;
			this._checkPopups=false;
			GRoot.__super.call(this);
			if(fairygui.GRoot._inst==null)
				fairygui.GRoot._inst=this;
			this.opaque=false;
			this._volumeScale=1;
			this._popupStack=[];
			this._justClosedPopups=[];
			this.displayObject.once("display",this,this.__addedToStage);
		}

		__class(GRoot,'fairygui.GRoot',_super);
		var __proto=GRoot.prototype;
		__proto.showWindow=function(win){
			this.addChild(win);
			win.requestFocus();
			if(win.x > this.width)
				win.x=this.width-win.width;
			else if(win.x+win.width < 0)
			win.x=0;
			if(win.y > this.height)
				win.y=this.height-win.height;
			else if(win.y+win.height < 0)
			win.y=0;
			this.adjustModalLayer();
		}

		__proto.hideWindow=function(win){
			win.hide();
		}

		__proto.hideWindowImmediately=function(win){
			if(win.parent==this)
				this.removeChild(win);
			this.adjustModalLayer();
		}

		__proto.bringToFront=function(win){
			var cnt=this.numChildren;
			var i=NaN;
			if(this._modalLayer.parent!=null && !win.modal)
				i=this.getChildIndex(this._modalLayer)-1;
			else
			i=cnt-1;
			for(;i >=0;i--){
				var g=this.getChildAt(i);
				if(g==win)
					return;
				if((g instanceof fairygui.Window ))
					break ;
			}
			if(i>=0)
				this.setChildIndex(win,i);
		}

		__proto.showModalWait=function(msg){
			if(UIConfig1.globalModalWaiting !=null){
				if(this._modalWaitPane==null)
					this._modalWaitPane=UIPackage.createObjectFromURL(UIConfig1.globalModalWaiting);
				this._modalWaitPane.setSize(this.width,this.height);
				this._modalWaitPane.addRelation(this,24);
				this.addChild(this._modalWaitPane);
				this._modalWaitPane.text=msg;
			}
		}

		__proto.closeModalWait=function(){
			if(this._modalWaitPane !=null && this._modalWaitPane.parent !=null)
				this.removeChild(this._modalWaitPane);
		}

		__proto.closeAllExceptModals=function(){
			var arr=this._children.slice();
			var cnt=arr.length;
			for(var i=0;i < cnt;i++){
				var g=arr[i];
				if(((g instanceof fairygui.Window ))&& !(g).modal)
					(g).hide();
			}
		}

		__proto.closeAllWindows=function(){
			var arr=this._children.slice();
			var cnt=arr.length;
			for(var i=0;i < cnt;i++){
				var g=arr[i];
				if((g instanceof fairygui.Window ))
					(g).hide();
			}
		}

		__proto.getTopWindow=function(){
			var cnt=this.numChildren;
			for(var i=cnt-1;i >=0;i--){
				var g=this.getChildAt(i);
				if((g instanceof fairygui.Window )){
					return (g);
				}
			}
			return null;
		}

		__proto.showPopup=function(popup,target,downward){
			if(this._popupStack.length > 0){
				var k=this._popupStack.indexOf(popup);
				if(k !=-1){
					for(var i=this._popupStack.length-1;i >=k;i--)
					this.removeChild(this._popupStack.pop());
				}
			}
			this._popupStack.push(popup);
			this.addChild(popup);
			this.adjustModalLayer();
			var pos;
			var sizeW=NaN,sizeH=0;
			if(target){
				pos=target.localToGlobal();
				sizeW=target.width;
				sizeH=target.height;
			}
			else {
				pos=this.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY);
			};
			var xx=NaN,yy=NaN;
			xx=pos.x;
			if(xx+popup.width > this.width)
				xx=xx+sizeW-popup.width;
			yy=pos.y+sizeH;
			if((downward==null && yy+popup.height > this.height)
				|| downward==false){
				yy=pos.y-popup.height-1;
				if(yy < 0){
					yy=0;
					xx+=sizeW / 2;
				}
			}
			popup.x=xx;
			popup.y=yy;
		}

		__proto.togglePopup=function(popup,target,downward){
			if(this._justClosedPopups.indexOf(popup)!=-1)
				return;
			this.showPopup(popup,target,downward);
		}

		__proto.hidePopup=function(popup){
			if(popup !=null){
				var k=this._popupStack.indexOf(popup);
				if(k !=-1){
					for(var i=this._popupStack.length-1;i >=k;i--)
					this.closePopup(this._popupStack.pop());
				}
			}
			else {
				var cnt=this._popupStack.length;
				for(i=cnt-1;i >=0;i--)
				this.closePopup(this._popupStack[i]);
				this._popupStack.length=0;
			}
		}

		__proto.closePopup=function(target){
			if(target.parent !=null){
				if((target instanceof fairygui.Window ))
					(target).hide();
				else
				this.removeChild(target);
			}
		}

		__proto.showTooltips=function(msg){
			if (this._defaultTooltipWin==null){
				var resourceURL=UIConfig1.tooltipsWin;
				if (!resourceURL){
					Log.print("UIConfig.tooltipsWin not defined");
					return;
				}
				this._defaultTooltipWin=UIPackage.createObjectFromURL(resourceURL);
			}
			this._defaultTooltipWin.text=msg;
			this.showTooltipsWin(this._defaultTooltipWin);
		}

		__proto.showTooltipsWin=function(tooltipWin,position){
			this.hideTooltips();
			this._tooltipWin=tooltipWin;
			var xx=0;
			var yy=0;
			if (position==null){
				xx=Laya.stage.mouseX+10;
				yy=Laya.stage.mouseY+20;
			}
			else {
				xx=position.x;
				yy=position.y;
			};
			var pt=this.globalToLocal(xx,yy);
			xx=pt.x;
			yy=pt.y;
			if (xx+this._tooltipWin.width > this.width){
				xx=xx-this._tooltipWin.width-1;
				if (xx < 0)
					xx=10;
			}
			if (yy+this._tooltipWin.height > this.height){
				yy=yy-this._tooltipWin.height-1;
				if (xx-this._tooltipWin.width-1 > 0)
					xx=xx-this._tooltipWin.width-1;
				if (yy < 0)
					yy=10;
			}
			this._tooltipWin.x=xx;
			this._tooltipWin.y=yy;
			this.addChild(this._tooltipWin);
		}

		__proto.hideTooltips=function(){
			if (this._tooltipWin !=null){
				if (this._tooltipWin.parent)
					this.removeChild(this._tooltipWin);
				this._tooltipWin=null;
			}
		}

		__proto.getObjectUnderPoint=function(globalX,globalY){
			return null;
		}

		__proto.setFocus=function(value){
			if(this._focusedObject!=value){
				this._focusedObject=value;
				this.displayObject.event("fui_focus_changed");
			}
		}

		__proto.playOneShotSound=function(sound,volumeScale){
			(volumeScale===void 0)&& (volumeScale=1);
			var vs=this._volumeScale *volumeScale;
			var channel=sound.play(0,1);
			channel.volume=vs;
		}

		__proto.adjustModalLayer=function(){
			var cnt=this.numChildren;
			var modalLayerIsTop=false;
			if (this._modalWaitPane !=null && this._modalWaitPane.parent !=null)
				this.setChildIndex(this._modalWaitPane,cnt-1);
			for(var i=cnt-1;i >=0;i--){
				var g=this.getChildAt(i);
				if(g==this._modalLayer)
					modalLayerIsTop=true;
				else if(((g instanceof fairygui.Window ))&& (g).modal){
					if(this._modalLayer.parent==null)
						this.addChildAt(this._modalLayer,i);
					else if(i > 0){
						if(modalLayerIsTop)
							this.setChildIndex(this._modalLayer,i);
						else
						this.setChildIndex(this._modalLayer,i-1);
					}
					else
					this.addChildAt(this._modalLayer,0);
					return;
				}
			}
			if (this._modalLayer.parent !=null)
				this.removeChild(this._modalLayer);
		}

		__proto.__addedToStage=function(){
			Laya.stage.on("mousedown",this,this.__stageMouseDown);
			Laya.stage.on("mouseup",this,this.__stageMouseUp);
			this._modalLayer=new GGraph();
			this._modalLayer.setSize(this.width,this.height);
			this._modalLayer.drawRect(0,null,UIConfig1.modalLayerColor);
			this._modalLayer.addRelation(this,24);
			this.displayObject.stage.on("resize",this,this.__winResize);
			this.__winResize();
		}

		__proto.checkPopups=function(clickTarget){
			if(this._checkPopups)
				return;
			this._checkPopups=true;
			this._justClosedPopups.length=0;
			if (this._popupStack.length > 0){
				var mc=clickTarget;
				while (mc !=this.displayObject.stage && mc !=null){
					if (mc["$owner"]){
						var pindex=this._popupStack.indexOf(mc["$owner"]);
						if (pindex !=-1){
							for(var i=this._popupStack.length-1;i > pindex;i--){
								var popup=this._popupStack.pop();
								this.closePopup(popup);
								this._justClosedPopups.push(popup);
							}
							return;
						}
					}
					mc=mc.parent;
				};
				var cnt=this._popupStack.length;
				for(i=cnt-1;i >=0;i--){
					popup=this._popupStack[i];
					this.closePopup(popup);
					this._justClosedPopups.push(popup);
				}
				this._popupStack.length=0;
			}
		}

		__proto.__stageMouseDown=function(evt){
			var mc=evt.target;
			while (mc !=this.displayObject.stage && mc !=null){
				if (mc["$owner"]){
					var gg=mc["$owner"];
					if (gg.touchable && gg.focusable){
						this.setFocus(gg);
						break ;
					}
				}
				mc=mc.parent;
			}
			if (this._tooltipWin !=null)
				this.hideTooltips();
			this.checkPopups(evt.target);
		}

		__proto.__stageMouseUp=function(){
			this._checkPopups=false;
		}

		__proto.__winResize=function(){
			this.setSize(Laya.stage.width,Laya.stage.height);
		}

		__getset(0,__proto,'hasModalWindow',function(){
			return this._modalLayer.parent !=null;
		});

		__getset(0,__proto,'modalWaiting',function(){
			return this._modalWaitPane && this._modalWaitPane.inContainer;
		});

		__getset(0,__proto,'hasAnyPopup',function(){
			return this._popupStack.length !=0;
		});

		__getset(0,__proto,'focus',function(){
			if (this._focusedObject && !this._focusedObject.onStage)
				this._focusedObject=null;
			return this._focusedObject;
			},function(value){
			if (value && (!value.focusable || !value.onStage))
				throw "invalid focus target";
			this.setFocus(value);
		});

		__getset(0,__proto,'volumeScale',function(){
			return this._volumeScale;
			},function(value){
			this._volumeScale=value;
		});

		__getset(1,GRoot,'inst',function(){
			if(fairygui.GRoot._inst==null)
				new GRoot();
			return fairygui.GRoot._inst;
		},fairygui.GComponent._$SET_inst);

		GRoot._inst=null
		return GRoot;
	})(GComponent)


	//class fairygui.GScrollBar extends fairygui.GComponent
	var GScrollBar=(function(_super){
		function GScrollBar(){
			this._grip=null;
			this._arrowButton1=null;
			this._arrowButton2=null;
			this._bar=null;
			this._target=null;
			this._vertical=false;
			this._scrollPerc=0;
			this._fixedGripSize=false;
			this._dragOffset=null;
			GScrollBar.__super.call(this);
			this._dragOffset=new laya.maths.Point();
			this._scrollPerc=0;
		}

		__class(GScrollBar,'fairygui.GScrollBar',_super);
		var __proto=GScrollBar.prototype;
		__proto.setScrollPane=function(target,vertical){
			this._target=target;
			this._vertical=vertical;
		}

		__proto.constructFromXML=function(xml){
			_super.prototype.constructFromXML.call(this,xml);
			xml=ToolSet.findChildNode(xml,"ScrollBar");
			if (xml){
				this._fixedGripSize=xml.getAttribute("fixedGripSize")=="true";
			}
			this._grip=this.getChild("grip");
			if(!this._grip){
				Log.print("需要定义grip");
				return;
			}
			this._bar=this.getChild("bar");
			if(!this._bar){
				Log.print("需要定义bar");
				return;
			}
			this._arrowButton1=this.getChild("arrow1");
			this._arrowButton2=this.getChild("arrow2");
			this._grip.on("mousedown",this,this.__gripMouseDown);
			if(this._arrowButton1)
				this._arrowButton1.on("mousedown",this,this.__arrowButton1Click);
			if(this._arrowButton2)
				this._arrowButton2.on("mousedown",this,this.__arrowButton2Click);
			this.on("mousedown",this,this.__barMouseDown);
		}

		__proto.__gripMouseDown=function(evt){
			if (!this._bar)
				return;
			evt.stopPropagation();
			Laya.stage.on("mousemove",this,this.__gripMouseMove);
			Laya.stage.on("mouseup",this,this.__gripMouseUp);
			this.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,this._dragOffset);
			this._dragOffset.x-=this._grip.x;
			this._dragOffset.y-=this._grip.y;
		}

		__proto.__gripMouseMove=function(){
			var pt=this.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.GScrollBar.sScrollbarHelperPoint);
			if (this._vertical){
				var curY=pt.y-this._dragOffset.y;
				this._target.setPercY((curY-this._bar.y)/ (this._bar.height-this._grip.height),false);
			}
			else {
				var curX=pt.x-this._dragOffset.x;
				this._target.setPercX((curX-this._bar.x)/ (this._bar.width-this._grip.width),false);
			}
		}

		__proto.__gripMouseUp=function(evt){
			if (!this._bar)
				return;
			Laya.stage.off("mousemove",this,this.__gripMouseMove);
			Laya.stage.off("mouseup",this,this.__gripMouseUp);
		}

		__proto.__arrowButton1Click=function(evt){
			evt.stopPropagation();
			if (this._vertical)
				this._target.scrollUp();
			else
			this._target.scrollLeft();
		}

		__proto.__arrowButton2Click=function(evt){
			evt.stopPropagation();
			if (this._vertical)
				this._target.scrollDown();
			else
			this._target.scrollRight();
		}

		__proto.__barMouseDown=function(evt){
			var pt=this._grip.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.GScrollBar.sScrollbarHelperPoint);
			if (this._vertical){
				if (pt.y < 0)
					this._target.scrollUp(4);
				else
				this._target.scrollDown(4);
			}
			else {
				if (pt.x < 0)
					this._target.scrollLeft(4);
				else
				this._target.scrollRight(4);
			}
		}

		__getset(0,__proto,'displayPerc',null,function(val){
			if (this._vertical){
				if(!this._fixedGripSize)
					this._grip.height=val *this._bar.height;
				this._grip.y=this._bar.y+(this._bar.height-this._grip.height)*this._scrollPerc;
			}
			else {
				if(!this._fixedGripSize)
					this._grip.width=val *this._bar.width;
				this._grip.x=this._bar.x+(this._bar.width-this._grip.width)*this._scrollPerc;
			}
		});

		__getset(0,__proto,'scrollPerc',null,function(val){
			this._scrollPerc=val;
			if (this._vertical)
				this._grip.y=this._bar.y+(this._bar.height-this._grip.height)*this._scrollPerc;
			else
			this._grip.x=this._bar.x+(this._bar.width-this._grip.width)*this._scrollPerc;
		});

		__getset(0,__proto,'minSize',function(){
			if (this._vertical)
				return (this._arrowButton1 !=null ? this._arrowButton1.height :0)+(this._arrowButton2 !=null ? this._arrowButton2.height :0);
			else
			return (this._arrowButton1 !=null ? this._arrowButton1.width :0)+(this._arrowButton2 !=null ? this._arrowButton2.width :0);
		});

		__static(GScrollBar,
		['sScrollbarHelperPoint',function(){return this.sScrollbarHelperPoint=new Point();}
		]);
		return GScrollBar;
	})(GComponent)


	//class fairygui.GSlider extends fairygui.GComponent
	var GSlider=(function(_super){
		function GSlider(){
			this._max=0;
			this._value=0;
			this._titleType=0;
			this._titleObject=null;
			this._aniObject=null;
			this._barObjectH=null;
			this._barObjectV=null;
			this._barMaxWidth=0;
			this._barMaxHeight=0;
			this._barMaxWidthDelta=0;
			this._barMaxHeightDelta=0;
			this._gripObject=null;
			this._clickPos=null;
			this._clickPercent=0;
			GSlider.__super.call(this);
			this._titleType=0;
			this._value=50;
			this._max=100;
			this._clickPos=new laya.maths.Point();
		}

		__class(GSlider,'fairygui.GSlider',_super);
		var __proto=GSlider.prototype;
		__proto.update=function(){
			var percent=Math.min(this._value / this._max,1);
			this.updateWidthPercent(percent);
		}

		__proto.updateWidthPercent=function(percent){
			if (this._titleObject){
				switch (this._titleType){
					case 0:
						this._titleObject.text=Math.round(percent *100)+"%";
						break ;
					case 1:
						this._titleObject.text=this._value+"/"+this._max;
						break ;
					case 2:
						this._titleObject.text=""+this._value;
						break ;
					case 3:
						this._titleObject.text=""+this._max;
						break ;
					}
			}
			if (this._barObjectH)
				this._barObjectH.width=(this.width-this._barMaxWidthDelta)*percent;
			if (this._barObjectV)
				this._barObjectV.height=(this.height-this._barMaxHeightDelta)*percent;
			if ((this._aniObject instanceof fairygui.GMovieClip ))
				(this._aniObject).frame=Math.round(percent *100);
		}

		__proto.constructFromXML=function(xml){
			_super.prototype.constructFromXML.call(this,xml);
			xml=ToolSet.findChildNode(xml,"Slider");
			var str;
			str=xml.getAttribute("titleType");
			if(str)
				this._titleType=ProgressTitleType.parse(str);
			this._titleObject=(this.getChild("title"));
			this._barObjectH=this.getChild("bar");
			this._barObjectV=this.getChild("bar_v");
			this._aniObject=this.getChild("ani");
			this._gripObject=this.getChild("grip");
			if(this._barObjectH){
				this._barMaxWidth=this._barObjectH.width;
				this._barMaxWidthDelta=this.width-this._barMaxWidth;
			}
			if(this._barObjectV){
				this._barMaxHeight=this._barObjectV.height;
				this._barMaxHeightDelta=this.height-this._barMaxHeight;
			}
			if(this._gripObject){
				this._gripObject.on("mousedown",this,this.__gripMouseDown);
			}
		}

		__proto.handleSizeChanged=function(){
			_super.prototype.handleSizeChanged.call(this);
			if(this._barObjectH)
				this._barMaxWidth=this.width-this._barMaxWidthDelta;
			if(this._barObjectV)
				this._barMaxHeight=this.height-this._barMaxHeightDelta;
			if(!this._underConstruct)
				this.update();
		}

		__proto.setup_afterAdd=function(xml){
			fairygui.GObject.prototype.setup_afterAdd.call(this,xml);
			xml=ToolSet.findChildNode(xml,"Slider");
			if (xml){
				this._value=parseInt(xml.getAttribute("value"));
				this._max=parseInt(xml.getAttribute("max"));
			}
			this.update();
		}

		__proto.__gripMouseDown=function(evt){
			this._clickPos=this.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY);
			this._clickPercent=this._value / this._max;
			Laya.stage.on("mousemove",this,this.__gripMouseMove);
			Laya.stage.on("mouseup",this,this.__gripMouseUp);
		}

		__proto.__gripMouseMove=function(evt){
			var pt=this.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.GSlider.sSilderHelperPoint);
			var deltaX=pt.x-this._clickPos.x;
			var deltaY=pt.y-this._clickPos.y;
			var percent=NaN;
			if (this._barObjectH)
				percent=this._clickPercent+deltaX / this._barMaxWidth;
			else
			percent=this._clickPercent+deltaY / this._barMaxHeight;
			if (percent > 1)
				percent=1;
			else if (percent < 0)
			percent=0;
			var newValue=Math.round(this._max *percent);
			if (newValue !=this._value){
				this._value=newValue;
				Events.dispatch("fui_state_changed",this.displayObject,evt);
			}
			this.updateWidthPercent(percent);
		}

		__proto.__gripMouseUp=function(evt){
			var percent=this._value / this._max;
			this.updateWidthPercent(percent);
			Laya.stage.off("mousemove",this,this.__gripMouseMove);
			Laya.stage.off("mouseup",this,this.__gripMouseUp);
		}

		__getset(0,__proto,'titleType',function(){
			return this._titleType;
			},function(value){
			this._titleType=value;
		});

		__getset(0,__proto,'max',function(){
			return this._max;
			},function(value){
			if (this._max !=value){
				this._max=value;
				this.update();
			}
		});

		__getset(0,__proto,'value',function(){
			return this._value;
			},function(value){
			if (this._value !=value){
				this._value=value;
				this.update();
			}
		});

		__static(GSlider,
		['sSilderHelperPoint',function(){return this.sSilderHelperPoint=new Point();}
		]);
		return GSlider;
	})(GComponent)


	//class fairygui.Window extends fairygui.GComponent
	var Window2=(function(_super){
		function Window(){
			this._contentPane=null;
			this._modalWaitPane=null;
			this._closeButton=null;
			this._dragArea=null;
			this._contentArea=null;
			this._frame=null;
			this._modal=false;
			this._uiSources=null;
			this._inited=false;
			this._loading=false;
			this._requestingCmd=0;
			this.bringToFontOnClick=false;
			Window.__super.call(this);
			this.focusable=true;
			this._uiSources=[];
			this.bringToFontOnClick=UIConfig1.bringWindowToFrontOnClick;
			this.displayObject.on("display",this,this.__onShown);
			this.displayObject.on("undisplay",this,this.__onHidden);
			this.displayObject.on("mousedown",this,this.__mouseDown);
		}

		__class(Window,'fairygui.Window',_super,'Window2');
		var __proto=Window.prototype;
		__proto.addUISource=function(source){
			this._uiSources.push(source);
		}

		__proto.show=function(){
			GRoot.inst.showWindow(this);
		}

		__proto.showOn=function(root){
			root.showWindow(this);
		}

		__proto.hide=function(){
			if(this.isShowing)
				this.doHideAnimation();
		}

		__proto.hideImmediately=function(){
			var r=((this.parent instanceof fairygui.GRoot ))? (this.parent):null;
			if(!r)
				r=GRoot.inst;
			r.hideWindowImmediately(this);
		}

		__proto.centerOn=function(r,restraint){
			(restraint===void 0)&& (restraint=false);
			this.setXY(Math.round((r.width-this.width)/ 2),Math.round((r.height-this.height)/ 2));
			if(restraint){
				this.addRelation(r,3);
				this.addRelation(r,10);
			}
		}

		__proto.toggleStatus=function(){
			if(this.isTop)
				this.hide();
			else
			this.show();
		}

		__proto.bringToFront=function(){
			this.root.bringToFront(this);
		}

		__proto.showModalWait=function(requestingCmd){
			(requestingCmd===void 0)&& (requestingCmd=0);
			if(requestingCmd !=0)
				this._requestingCmd=requestingCmd;
			if(UIConfig1.windowModalWaiting){
				if(!this._modalWaitPane)
					this._modalWaitPane=UIPackage.createObjectFromURL(UIConfig1.windowModalWaiting);
				this.layoutModalWaitPane();
				this.addChild(this._modalWaitPane);
			}
		}

		__proto.layoutModalWaitPane=function(){
			if(this._contentArea !=null){
				var pt=this._frame.localToGlobal();
				pt=this.globalToLocal(pt.x,pt.y,pt);
				this._modalWaitPane.setXY(pt.x+this._contentArea.x,pt.y+this._contentArea.y);
				this._modalWaitPane.setSize(this._contentArea.width,this._contentArea.height);
			}
			else
			this._modalWaitPane.setSize(this.width,this.height);
		}

		__proto.closeModalWait=function(requestingCmd){
			(requestingCmd===void 0)&& (requestingCmd=0);
			if(requestingCmd !=0){
				if(this._requestingCmd !=requestingCmd)
					return false;
			}
			this._requestingCmd=0;
			if(this._modalWaitPane && this._modalWaitPane.parent !=null)
				this.removeChild(this._modalWaitPane);
			return true;
		}

		__proto.init=function(){
			if(this._inited || this._loading)
				return;
			if(this._uiSources.length > 0){
				this._loading=false;
				var cnt=this._uiSources.length;
				for(var i=0;i < cnt;i++){
					var lib=this._uiSources[i];
					if(!lib.loaded){
						lib.load(this.__uiLoadComplete,this);
						this._loading=true;
					}
				}
				if(!this._loading)
					this._init();
			}
			else
			this._init();
		}

		__proto.onInit=function(){}
		__proto.onShown=function(){}
		__proto.onHide=function(){}
		__proto.doShowAnimation=function(){
			this.onShown();
		}

		__proto.doHideAnimation=function(){
			this.hideImmediately();
		}

		__proto.__uiLoadComplete=function(){
			var cnt=this._uiSources.length;
			for(var i=0;i < cnt;i++){
				var lib=this._uiSources[i];
				if(!lib.loaded)
					return;
			}
			this._loading=false;
			this._init();
		}

		__proto._init=function(){
			this._inited=true;
			this.onInit();
			if(this.isShowing)
				this.doShowAnimation();
		}

		__proto.dispose=function(){
			if(this.parent !=null)
				this.hideImmediately();
			_super.prototype.dispose.call(this);
		}

		__proto.closeEventHandler=function(){
			this.hide();
		}

		__proto.__onShown=function(){
			if(!this._inited)
				this.init();
			else
			this.doShowAnimation();
		}

		__proto.__onHidden=function(){
			this.closeModalWait();
			this.onHide();
		}

		__proto.__mouseDown=function(){
			if(this.isShowing && this.bringToFontOnClick)
				this.bringToFront();
		}

		__proto.__dragStart=function(evt){
			GObject.cast(evt.currentTarget).stopDrag();
			this.startDrag();
		}

		__getset(0,__proto,'contentArea',function(){
			return this._contentArea;
			},function(value){
			this._contentArea=value;
		});

		__getset(0,__proto,'contentPane',function(){
			return this._contentPane;
			},function(val){
			if(this._contentPane !=val){
				if(this._contentPane !=null)
					this.removeChild(this._contentPane);
				this._contentPane=val;
				if(this._contentPane !=null){
					this.addChild(this._contentPane);
					this.setSize(this._contentPane.width,this._contentPane.height);
					this._contentPane.addRelation(this,24);
					this._frame=(this._contentPane.getChild("frame"));
					if(this._frame !=null){
						this.closeButton=this._frame.getChild("closeButton");
						this.dragArea=this._frame.getChild("dragArea");
						this.contentArea=this._frame.getChild("contentArea");
					}
				}
			}
		});

		__getset(0,__proto,'frame',function(){
			return this._frame;
		});

		__getset(0,__proto,'closeButton',function(){
			return this._closeButton;
			},function(value){
			if(this._closeButton !=null)
				this._closeButton.offClick(this,this.closeEventHandler);
			this._closeButton=value;
			if(this._closeButton !=null)
				this._closeButton.onClick(this,this.closeEventHandler);
		});

		__getset(0,__proto,'dragArea',function(){
			return this._dragArea;
			},function(value){
			if(this._dragArea !=value){
				if(this._dragArea !=null){
					this._dragArea.draggable=false;
					this._dragArea.off("fui_drag_start",this,this.__dragStart);
				}
				this._dragArea=value;
				if(this._dragArea !=null){
					if((this._dragArea instanceof fairygui.GGraph ))
						this._dragArea.asGraph.drawRect(0,null,null);
					this._dragArea.draggable=true;
					this._dragArea.on("fui_drag_start",this,this.__dragStart);
				}
			}
		});

		__getset(0,__proto,'modal',function(){
			return this._modal;
			},function(val){
			this._modal=val;
		});

		__getset(0,__proto,'isShowing',function(){
			return this.parent !=null;
		});

		__getset(0,__proto,'isTop',function(){
			return this.parent !=null && this.parent.getChildIndex(this)==this.parent.numChildren-1;
		});

		__getset(0,__proto,'modalWaiting',function(){
			return this._modalWaitPane && this._modalWaitPane.parent !=null;
		});

		return Window;
	})(GComponent)


	//class fairygui.display.Image extends laya.display.Sprite
	var Image1=(function(_super){
		function Image(){
			this._texture=null;
			this._scaleByTile=false;
			this._scale9Grid=null;
			this._textureScaleX=0;
			this._textureScaleY=0;
			this._needRebuild=false;
			Image.__super.call(this);
			this.mouseEnabled=false;
			this._textureScaleX=1;
			this._textureScaleY=1;
		}

		__class(Image,'fairygui.display.Image',_super,'Image1');
		var __proto=Image.prototype;
		__proto.scaleTexture=function(sx,sy){
			if(this._textureScaleX!=sx || this._textureScaleY!=sy){
				this._textureScaleX=sx;
				this._textureScaleY=sy;
				if(this._texture)
					this.size(this._texture.width*sx,this._texture.height*sy);
				this.markChanged();
			}
		}

		__proto.markChanged=function(){
			if(!this._needRebuild){
				this._needRebuild=true;
				Laya.timer.callLater(this,this.rebuild);
			}
		}

		__proto.rebuild=function(){
			this._needRebuild=false;
			var g=this.graphics;
			g.clear();
			if(this._texture==null){
				this.repaint();
				return;
			};
			var width=this.width;
			var height=this.height;
			var sw=this._texture.width;
			var sh=this._texture.height;
			if(width==0 || height==0){
				this.repaint();
				return;
			}
			if(this._scaleByTile){
				var hc=Math.ceil(this._textureScaleX);
				var vc=Math.ceil(this._textureScaleY);
				var remainWidth=width-(hc-1)*sw;
				var remainHeight=height-(vc-1)*sh;
				for (var i=0;i < hc;i++){
					for (var j=0;j < vc;j++){
						if(i==hc-1 || j==vc-1)
							g.drawTexture(fairygui.display.Image.getTexture(this._texture,0,0,i==hc-1?remainWidth:sw,j==vc-1?remainHeight:sh),i*sw,j*sh);
						else
						g.drawTexture(this._texture,i*sw,j*sh);
					}
				}
			}
			else if(this._scale9Grid!=null){
				var left=this._scale9Grid.x;
				var right=Math.max(sw-this._scale9Grid.right,0);
				var top=this._scale9Grid.y;
				var bottom=Math.max(sh-this._scale9Grid.bottom,0);
				var tmp=NaN;
				if (height >=(sh-this._scale9Grid.height)){
					top=this._scale9Grid.y;
					bottom=sh-this._scale9Grid.bottom;
				}
				else{
					tmp=this._scale9Grid.y / (sh-this._scale9Grid.bottom);
					tmp=height *tmp / (1+tmp);
					top=Math.round(tmp);
					bottom=height-tmp;
				}
				if (width >=(sw-this._scale9Grid.width)){
					left=this._scale9Grid.x;
					right=sw-this._scale9Grid.right;
				}
				else{
					tmp=this._scale9Grid.x / (sw-this._scale9Grid.right);
					tmp=width *tmp / (1+tmp);
					left=Math.round(tmp);
					right=width-tmp;
				};
				var centerWidth=Math.max(width-left-right,0);
				var centerHeight=Math.max(height-top-bottom,0);
				left && top && g.drawTexture(fairygui.display.Image.getTexture(this._texture,0,0,left,top),0,0,left,top);
				right && top && g.drawTexture(fairygui.display.Image.getTexture(this._texture,sw-right,0,right,top),width-right,0,right,top);
				left && bottom && g.drawTexture(fairygui.display.Image.getTexture(this._texture,0,sh-bottom,left,bottom),0,height-bottom,left,bottom);
				right && bottom && g.drawTexture(fairygui.display.Image.getTexture(this._texture,sw-right,sh-bottom,right,bottom),width-right,height-bottom,right,bottom);
				centerWidth && top && g.drawTexture(fairygui.display.Image.getTexture(this._texture,left,0,sw-left-right,top),left,0,centerWidth,top);
				centerWidth && bottom && g.drawTexture(fairygui.display.Image.getTexture(this._texture,left,sh-bottom,sw-left-right,bottom),left,height-bottom,centerWidth,bottom);
				centerHeight && left && g.drawTexture(fairygui.display.Image.getTexture(this._texture,0,top,left,sh-top-bottom),0,top,left,centerHeight);
				centerHeight && right && g.drawTexture(fairygui.display.Image.getTexture(this._texture,sw-right,top,right,sh-top-bottom),width-right,top,right,centerHeight);
				centerWidth && centerHeight && g.drawTexture(fairygui.display.Image.getTexture(this._texture,left,top,sw-left-right,sh-top-bottom),left,top,centerWidth,centerHeight);
			}
			else {
				g.drawTexture(this._texture,0,0,width,height);
			}
			this.repaint();
		}

		__getset(0,__proto,'texture',function(){
			return this._texture;
			},function(value){
			if(this._texture!=value){
				this._texture=value;
				if(this._texture)
					this.size(this._texture.width*this._textureScaleX,this._texture.height*this._textureScaleY);
				else
				this.size(0,0);
				this.markChanged();
			}
		});

		__getset(0,__proto,'scale9Grid',function(){
			return this._scale9Grid;
			},function(value){
			this._scale9Grid=value;
			this.markChanged();
		});

		__getset(0,__proto,'scaleByTile',function(){
			return this._scaleByTile;
			},function(value){
			if(this._scaleByTile!=value){
				this._scaleByTile=value;
				this.markChanged();
			}
		});

		Image.getTexture=function(source,x,y,width,height){
			source.$GID || (source.$GID=Utils.getGID());
			var key=source.$GID+"."+x+"."+y+"."+width+"."+height;
			var texture=fairygui.display.Image._textureCache[key];
			if (!texture){
				texture=fairygui.display.Image._textureCache[key]=Texture.create(source,x,y,width,height);
			}
			return texture;
		}

		Image.clearCache=function(){
			fairygui.display.Image._textureCache={};
		}

		Image._textureCache={};
		return Image;
	})(Sprite)


	//class fairygui.display.MovieClip extends laya.display.Sprite
	var MovieClip1=(function(_super){
		function MovieClip(){
			this.interval=0;
			this.swing=false;
			this.repeatDelay=0;
			this._texture=null;
			this._needRebuild=false;
			this._playing=false;
			this._playState=null;
			this._frameCount=0;
			this._frames=null;
			this._currentFrame=0;
			this._boundsRect=null;
			this._start=0;
			this._end=0;
			this._times=0;
			this._endAt=0;
			this._status=0;
			this._endHandler=null;
			MovieClip.__super.call(this);
			this._playState=new PlayState();
			this._playing=true;
			this.mouseEnabled=false;
			this.setPlaySettings();
			this.on("display",this,this.__addToStage);
			this.on("undisplay",this,this.__removeFromStage);
		}

		__class(MovieClip,'fairygui.display.MovieClip',_super,'MovieClip1');
		var __proto=MovieClip.prototype;
		//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
		__proto.setPlaySettings=function(start,end,times,endAt,endHandler){
			(start===void 0)&& (start=0);
			(end===void 0)&& (end=-1);
			(times===void 0)&& (times=0);
			(endAt===void 0)&& (endAt=-1);
			this._start=start;
			this._end=end;
			if(this._end==-1 || this._end > this._frameCount-1)
				this._end=this._frameCount-1;
			this._times=times;
			this._endAt=endAt;
			if(this._endAt==-1)
				this._endAt=this._end;
			this._status=0;
			this._endHandler=endHandler;
			this.currentFrame=start;
		}

		__proto.update=function(){
			if (this._playing && this._frameCount !=0 && this._status !=3){
				this._playState.update(this);
				if (this._currentFrame !=this._playState.currentFrame){
					if (this._status==1){
						this._currentFrame=this._start;
						this._playState.currentFrame=this._currentFrame;
						this._status=0;
					}
					else if (this._status==2){
						this._currentFrame=this._endAt;
						this._playState.currentFrame=this._currentFrame;
						this._status=3;
						if (this._endHandler !=null){
							Laya.timer.callLater(this,this._endHandler.run);
						}
					}
					else {
						this._currentFrame=this._playState.currentFrame;
						if (this._currentFrame==this._end){
							if (this._times > 0){
								this._times--;
								if (this._times==0)
									this._status=2;
								else
								this._status=1;
							}
						}
					}
					this.setFrame(this._frames[this._currentFrame]);
				}
			}
			else
			this.setFrame(null);
		}

		__proto.setFrame=function(frame){
			this.graphics.clear();
			if (frame !=null)
				this.graphics.drawTexture(frame.texture,frame.rect.x,frame.rect.y);
		}

		__proto.__addToStage=function(){
			if(this._playing)
				Laya.timer.frameLoop(1,this,this.update);
		}

		__proto.__removeFromStage=function(){
			if(this._playing)
				Laya.timer.clear(this,this.update);
		}

		__getset(0,__proto,'frameCount',function(){
			return this._frameCount;
		});

		__getset(0,__proto,'frames',function(){
			return this._frames;
			},function(value){
			this._frames=value;
			if (this._frames !=null)
				this._frameCount=this._frames.length;
			else
			this._frameCount=0;
			if(this._end==-1 || this._end > this._frameCount-1)
				this._end=this._frameCount-1;
			if(this._endAt==-1 || this._endAt > this._frameCount-1)
				this._endAt=this._frameCount-1;
			if(this._currentFrame < 0 || this._currentFrame > this._frameCount-1)
				this._currentFrame=this._frameCount-1;
			if(this._frameCount > 0)
				this.setFrame(this._frames[this._currentFrame]);
			else
			this.setFrame(null);
			this._playState.rewind();
		});

		__getset(0,__proto,'boundsRect',function(){
			return this._boundsRect;
			},function(value){
			this._boundsRect=value;
		});

		__getset(0,__proto,'currentFrame',function(){
			return this._currentFrame;
			},function(value){
			if (this._currentFrame !=value){
				this._currentFrame=value;
				this._playState.currentFrame=value;
				this.setFrame(this._currentFrame < this._frameCount ? this._frames[this._currentFrame] :null);
			}
		});

		__getset(0,__proto,'playing',function(){
			return this._playing;
			},function(value){
			this._playing=value;
			if(value && this.stage!=null){
				Laya.timer.frameLoop(1,this,this.update);
				}else {
				Laya.timer.clear(this,this.update);
			}
		});

		return MovieClip;
	})(Sprite)


	Laya.__init([UIPackage,RelationItem,GBasicTextField,GearSize,GearAnimation,Controller,GearLook,ScrollPane,Transition]);
})(window,document,Laya);
