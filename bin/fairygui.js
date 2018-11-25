
(function(window,document,Laya){
	var __un=Laya.un,__uns=Laya.uns,__static=Laya.static,__class=Laya.class,__getset=Laya.getset,__newvec=Laya.__newvec;

	var Browser=laya.utils.Browser,Byte=laya.utils.Byte,ColorFilter=laya.filters.ColorFilter,Event=laya.events.Event;
	var EventDispatcher=laya.events.EventDispatcher,Graphics=laya.display.Graphics,HTMLDivElement=laya.html.dom.HTMLDivElement;
	var Handler=laya.utils.Handler,HitArea=laya.utils.HitArea,Input=laya.display.Input,Loader=laya.net.Loader;
	var Log=laya.utils.Log,Node=laya.display.Node,Point=laya.maths.Point,Rectangle=laya.maths.Rectangle,Render=laya.renders.Render;
	var SoundManager=laya.media.SoundManager,Sprite=laya.display.Sprite,Stage=laya.display.Stage,Text=laya.display.Text;
	var Texture=laya.resource.Texture,Utils=laya.utils.Utils,WeakObject=laya.utils.WeakObject;
Laya.interface('fairygui.IUISource');
Laya.interface('fairygui.gears.IColorGear');
Laya.interface('fairygui.gears.IAnimationGear');
//class fairygui.action.ControllerAction
var ControllerAction=(function(){
	function ControllerAction(){
		this.fromPage=null;
		this.toPage=null;
	}

	__class(ControllerAction,'fairygui.action.ControllerAction');
	var __proto=ControllerAction.prototype;
	__proto.run=function(controller,prevPage,curPage){
		if((this.fromPage==null || this.fromPage.length==0 || this.fromPage.indexOf(prevPage)!=-1)
			&& (this.toPage==null || this.toPage.length==0 || this.toPage.indexOf(curPage)!=-1))
		this.enter(controller);
		else
		this.leave(controller);
	}

	__proto.enter=function(controller){}
	__proto.leave=function(controller){}
	__proto.setup=function(buffer){
		var cnt=0;
		var i=0;
		cnt=buffer.getInt16();
		this.fromPage=[];
		for (i=0;i < cnt;i++)
		this.fromPage[i]=buffer.readS();
		cnt=buffer.getInt16();
		this.toPage=[];
		for (i=0;i < cnt;i++)
		this.toPage[i]=buffer.readS();
	}

	ControllerAction.createAction=function(type){
		switch(type){
			case 0:
				return new PlayTransitionAction();
			case 1:
				return new ChangePageAction();
			}
		return null;
	}

	return ControllerAction;
})()


//class fairygui.AssetProxy
var AssetProxy=(function(){
	function AssetProxy(){
		this._asset=null;
		this._asset=Laya.loader;
	}

	__class(AssetProxy,'fairygui.AssetProxy');
	var __proto=AssetProxy.prototype;
	__proto.getRes=function(url){
		return this._asset.getRes(url);
	}

	__proto.load=function(url,complete,progress,type,priority,cache){
		(priority===void 0)&& (priority=1);
		(cache===void 0)&& (cache=true);
		this._asset.load(url,complete,progress,type,priority,cache);
	}

	__proto.setAsset=function(asset){
		this._asset=asset;
	}

	__getset(1,AssetProxy,'inst',function(){
		if(fairygui.AssetProxy._inst==null)
			AssetProxy._inst=new AssetProxy();
		return fairygui.AssetProxy._inst;
	});

	AssetProxy._inst=null;
	return AssetProxy;
})()


//class fairygui.AsyncOperation
var AsyncOperation=(function(){
	var DisplayListItem;
	function AsyncOperation(){
		/**
		*callback(obj:GObject)
		*/
		this.callback=null;
		this._itemList=null;
		this._objectPool=null;
		this._index=0;
		this._itemList=[];
		this._objectPool=[];
	}

	__class(AsyncOperation,'fairygui.AsyncOperation');
	var __proto=AsyncOperation.prototype;
	__proto.createObject=function(pkgName,resName){
		var pkg=UIPackage.getByName(pkgName);
		if(pkg){
			var pi=pkg.getItemByName(resName);
			if(!pi)
				throw new Error("resource not found: "+resName);
			this.internalCreateObject(pi);
		}
		else
		throw new Error("package not found: "+pkgName);
	}

	__proto.createObjectFromURL=function(url){
		var pi=UIPackage.getItemByURL(url);
		if(pi)
			this.internalCreateObject(pi);
		else
		throw new Error("resource not found: "+url);
	}

	__proto.cancel=function(){
		Laya.timer.clear(this,this.run);
		this._itemList.length=0;
		if(this._objectPool.length>0){
			var cnt=this._objectPool.length;
			for(var i=0;i<cnt;i++){
				this._objectPool[i].dispose();
			}
			this._objectPool.length=0;
		}
	}

	__proto.internalCreateObject=function(item){
		this._itemList.length=0;
		this._objectPool.length=0;
		var di=new DisplayListItem(item,9);
		di.childCount=this.collectComponentChildren(item);
		this._itemList.push(di);
		this._index=0;
		Laya.timer.frameLoop(1,this,this.run);
	}

	__proto.collectComponentChildren=function(item){
		var buffer=item.rawData;
		buffer.seek(0,2);
		var di;
		var pi;
		var i=0;
		var dataLen=0;
		var curPos=0;
		var pkg;
		var dcnt=buffer.getInt16();
		for (i=0;i < dcnt;i++){
			dataLen=buffer.getInt16();
			curPos=buffer.pos;
			buffer.seek(curPos,0);
			var type=buffer.readByte();
			var src=buffer.readS();
			var pkgId=buffer.readS();
			buffer.pos=curPos;
			if (src !=null){
				if (pkgId !=null)
					pkg=UIPackage.getById(pkgId);
				else
				pkg=item.owner;
				pi=pkg !=null ? pkg.getItemById(src):null;
				di=new DisplayListItem(pi,type);
				if (pi !=null && pi.type==3)
					di.childCount=this.collectComponentChildren(pi);
			}
			else{
				di=new DisplayListItem(null,type);
				if (type==10)
					di.listItemCount=this.collectListChildren(buffer);
			}
			this._itemList.push(di);
			buffer.pos=curPos+dataLen;
		}
		return dcnt;
	}

	__proto.collectListChildren=function(buffer){
		buffer.seek(buffer.pos,8);
		var listItemCount=0;
		var i=0;
		var nextPos=0;
		var url;
		var pi;
		var di;
		var defaultItem=buffer.readS();
		var itemCount=buffer.getInt16();
		for (i=0;i < itemCount;i++){
			nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			url=buffer.readS();
			if (url==null)
				url=defaultItem;
			if (url){
				pi=UIPackage.getItemByURL(url);
				if (pi !=null){
					di=new DisplayListItem(pi,pi.objectType);
					if (pi.type==3)
						di.childCount=this.collectComponentChildren(pi);
					this._itemList.push(di);
					listItemCount++;
				}
			}
			buffer.pos=nextPos;
		}
		return listItemCount;
	}

	__proto.run=function(){
		var obj;
		var di;
		var poolStart=0;
		var k=0;
		var t=Browser.now();
		var frameTime=UIConfig$1.frameTimeForAsyncUIConstruction;
		var totalItems=this._itemList.length;
		while(this._index<totalItems){
			di=this._itemList[this._index];
			if (di.packageItem !=null){
				obj=UIObjectFactory.newObject(di.packageItem);
				obj.packageItem=di.packageItem;
				this._objectPool.push(obj);
				UIPackage._constructing++;
				if (di.packageItem.type==3){
					poolStart=this._objectPool.length-di.childCount-1;
					(obj).constructFromResource2(this._objectPool,poolStart);
					this._objectPool.splice(poolStart,di.childCount);
				}
				else{
					obj.constructFromResource();
				}
				UIPackage._constructing--;
			}
			else{
				obj=UIObjectFactory.newObject2(di.type);
				this._objectPool.push(obj);
				if (di.type==10 && di.listItemCount > 0){
					poolStart=this._objectPool.length-di.listItemCount-1;
					for (k=0;k < di.listItemCount;k++)
					(obj).itemPool.returnObject(this._objectPool[k+poolStart]);
					this._objectPool.splice(poolStart,di.listItemCount);
				}
			}
			this._index++;
			if ((this._index % 5==0)&& Browser.now()-t >=frameTime)
				return;
		}
		Laya.timer.clear(this,this.run);
		var result=this._objectPool[0];
		this._itemList.length=0;
		this._objectPool.length=0;
		if(this.callback!=null)
			this.callback.runWith(result);
	}

	AsyncOperation.__init$=function(){
		//class DisplayListItem
		DisplayListItem=(function(){
			function DisplayListItem(packageItem,type){
				this.packageItem=null;
				this.type=0;
				this.childCount=0;
				this.listItemCount=0;
				this.packageItem=packageItem;
				this.type=type;
			}
			__class(DisplayListItem,'');
			return DisplayListItem;
		})()
	}

	return AsyncOperation;
})()


/**
*Use for GTextField.autoSize
*/
//class fairygui.AutoSizeType
var AutoSizeType=(function(){
	function AutoSizeType(){}
	__class(AutoSizeType,'fairygui.AutoSizeType');
	AutoSizeType.None=0;
	AutoSizeType.Both=1;
	AutoSizeType.Height=2;
	AutoSizeType.Shrink=3;
	return AutoSizeType;
})()


/**
*Use for GButton.mode
*/
//class fairygui.ButtonMode
var ButtonMode=(function(){
	function ButtonMode(){}
	__class(ButtonMode,'fairygui.ButtonMode');
	ButtonMode.Common=0;
	ButtonMode.Check=1;
	ButtonMode.Radio=2;
	return ButtonMode;
})()


/**
*Use for GComponent.childrenRenderOrder
*/
//class fairygui.ChildrenRenderOrder
var ChildrenRenderOrder=(function(){
	function ChildrenRenderOrder(){}
	__class(ChildrenRenderOrder,'fairygui.ChildrenRenderOrder');
	ChildrenRenderOrder.Ascent=0;
	ChildrenRenderOrder.Descent=1;
	ChildrenRenderOrder.Arch=2;
	return ChildrenRenderOrder;
})()


//class fairygui.display.BitmapFont
var BitmapFont$1=(function(){
	function BitmapFont(){
		this.id=null;
		this.size=0;
		this.ttf=false;
		this.glyphs=null;
		this.resizable=false;
		this.glyphs={};
	}

	__class(BitmapFont,'fairygui.display.BitmapFont',null,'BitmapFont$1');
	return BitmapFont;
})()


//class fairygui.display.BMGlyph
var BMGlyph=(function(){
	function BMGlyph(){
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


//class fairygui.display.FillUtils
var FillUtils=(function(){
	function FillUtils(){}
	__class(FillUtils,'fairygui.display.FillUtils');
	FillUtils.fill=function(w,h,method,origin,clockwise,amount){
		if(amount<=0)
			return null;
		else if(amount>=0.9999)
		return [0,0,w,0,w,h,0,h];
		var points;
		switch(method){
			case 1:
				points=fairygui.display.FillUtils.fillHorizontal(w,h,origin,amount);
				break ;
			case 2:
				points=fairygui.display.FillUtils.fillVertical(w,h,origin,amount);
				break ;
			case 3:
				points=fairygui.display.FillUtils.fillRadial90(w,h,origin,clockwise,amount);
				break ;
			case 4:
				points=fairygui.display.FillUtils.fillRadial180(w,h,origin,clockwise,amount);
				break ;
			case 5:
				points=fairygui.display.FillUtils.fillRadial360(w,h,origin,clockwise,amount);
				break ;
			}
		return points;
	}

	FillUtils.fillHorizontal=function(w,h,origin,amount){
		var w2=w*amount;
		if(origin==2 || origin==0)
			return [0,0,w2,0,w2,h,0,h];
		else
		return [w,0,w,h,w-w2,h,w-w2,0];
	}

	FillUtils.fillVertical=function(w,h,origin,amount){
		var h2=h*amount;
		if(origin==2 || origin==0)
			return [0,0,0,h2,w,h2,w,0];
		else
		return [0,h,w,h,w,h-h2,0,h-h2];
	}

	FillUtils.fillRadial90=function(w,h,origin,clockwise,amount){
		if(clockwise && (origin==1 || origin==2)
			|| !clockwise && (origin==0 || origin==3)){
			amount=1-amount;
		};
		var v=NaN,v2=NaN,h2=NaN;
		v=Math.tan(Math.PI / 2 *amount);
		h2=w *v;
		v2=(h2-h)/ h2;
		var points;
		switch(origin){
			case 0:
				if(clockwise){
					if(h2<=h)
						points=[0,0,w,h2,w,0];
					else
					points=[0,0,w*(1-v2),h,w,h,w,0];
				}
				else{
					if(h2<=h)
						points=[0,0,w,h2,w,h,0,h];
					else
					points=[0,0,w*(1-v2),h,0,h];
				}
				break ;
			case 1:
				if(clockwise){
					if(h2<=h)
						points=[w,0,0,h2,0,h,w,h];
					else
					points=[w,0,w*v2,h,w,h];
				}
				else{
					if(h2<=h)
						points=[w,0,0,h2,0,0];
					else
					points=[w,0,w*v2,h,0,h,0,0];
				}
				break ;
			case 2:
				if(clockwise){
					if(h2<=h)
						points=[0,h,w,h-h2,w,0,0,0];
					else
					points=[0,h,w*(1-v2),0,0,0];
				}
				else{
					if(h2<=h)
						points=[0,h,w,h-h2,w,h];
					else
					points=[0,h,w*(1-v2),0,w,0,w,h];
				}
				break ;
			case 3:
				if(clockwise){
					if(h2<=h)
						points=[w,h,0,h-h2,0,h];
					else
					points=[w,h,w*v2,0,0,0,0,h];
				}
				else{
					if(h2<=h)
						points=[w,h,0,h-h2,0,0,w,0];
					else
					points=[w,h,w*v2,0,w,0];
				}
				break ;
			}
		return points;
	}

	FillUtils.movePoints=function(points,offsetX,offsetY){
		var cnt=points.length;
		for(var i=0;i<cnt;i+=2){
			points[i]+=offsetX;
			points[i+1]+=offsetY;
		}
	}

	FillUtils.fillRadial180=function(w,h,origin,clockwise,amount){
		var points;
		switch(origin){
			case 0:
				if(amount<=0.5){
					amount=amount / 0.5;
					points=FillUtils.fillRadial90(w/2,h,
					clockwise?0:1,
					clockwise,
					amount);
					if(clockwise)
						FillUtils.movePoints(points,w/2,0);
				}
				else{
					amount=(amount-0.5)/ 0.5;
					points=FillUtils.fillRadial90(w/2,h,
					clockwise?1:0,
					clockwise,
					amount);
					if(clockwise)
						points.push(w,h,w,0);
					else{
						FillUtils.movePoints(points,w/2,0);
						points.push(0,h,0,0);
					}
				}
				break ;
			case 1:
				if(amount<=0.5){
					amount=amount / 0.5;
					points=FillUtils.fillRadial90(w/2,h,
					clockwise?3:2,
					clockwise,
					amount);
					if(!clockwise)
						FillUtils.movePoints(points,w/2,0);
				}
				else{
					amount=(amount-0.5)/ 0.5;
					points=FillUtils.fillRadial90(w/2,h,
					clockwise?2:3,
					clockwise,
					amount);
					if(clockwise){
						FillUtils.movePoints(points,w/2,0);
						points.push(0,0,0,h);
					}
					else
					points.push(w,0,w,h);
				}
				break ;
			case 2:
				if(amount<=0.5){
					amount=amount / 0.5;
					points=FillUtils.fillRadial90(w,h/2,
					clockwise?2:0,
					clockwise,
					amount);
					if(!clockwise)
						FillUtils.movePoints(points,0,h/2);
				}
				else{
					amount=(amount-0.5)/ 0.5;
					points=FillUtils.fillRadial90(w,h/2,
					clockwise?0:2,
					clockwise,
					amount);
					if(clockwise){
						FillUtils.movePoints(points,0,h/2);
						points.push(w,0,0,0);
					}
					else
					points.push(w,h,0,h);
				}
				break ;
			case 3:
				if(amount<=0.5){
					amount=amount / 0.5;
					points=FillUtils.fillRadial90(w,h/2,
					clockwise?1:3,
					clockwise,
					amount);
					if(clockwise)
						FillUtils.movePoints(points,0,h/2);
				}
				else{
					amount=(amount-0.5)/ 0.5;
					points=FillUtils.fillRadial90(w,h/2,
					clockwise?3:1,
					clockwise,
					amount);
					if(clockwise)
						points.push(0,h,w,h);
					else{
						FillUtils.movePoints(points,0,h/2);
						points.push(0,0,w,0);
					}
				}
				break ;
			}
		return points;
	}

	FillUtils.fillRadial360=function(w,h,origin,clockwise,amount){
		var points;
		switch(origin){
			case 0:
				if(amount<=0.5){
					amount=amount / 0.5;
					points=FillUtils.fillRadial180(w/2,h,
					clockwise?2:3,
					clockwise,
					amount);
					if(clockwise)
						FillUtils.movePoints(points,w/2,0);
				}
				else{
					amount=(amount-0.5)/ 0.5;
					points=FillUtils.fillRadial180(w/2,h,
					clockwise?3:2,
					clockwise,
					amount);
					if(clockwise)
						points.push(w,h,w,0,w/2,0);
					else{
						FillUtils.movePoints(points,w/2,0);
						points.push(0,h,0,0,w/2,0);
					}
				}
				break ;
			case 1:
				if(amount<=0.5){
					amount=amount / 0.5;
					points=FillUtils.fillRadial180(w/2,h,
					clockwise?3:2,
					clockwise,
					amount);
					if(!clockwise)
						FillUtils.movePoints(points,w/2,0);
				}
				else{
					amount=(amount-0.5)/ 0.5;
					points=FillUtils.fillRadial180(w/2,h,
					clockwise?2:3,
					clockwise,
					amount);
					if(clockwise){
						FillUtils.movePoints(points,w/2,0);
						points.push(0,0,0,h,w/2,h);
					}
					else
					points.push(w,0,w,h,w/2,h);
				}
				break ;
			case 2:
				if(amount<=0.5){
					amount=amount / 0.5;
					points=FillUtils.fillRadial180(w,h/2,
					clockwise?1:0,
					clockwise,
					amount);
					if(!clockwise)
						FillUtils.movePoints(points,0,h/2);
				}
				else{
					amount=(amount-0.5)/ 0.5;
					points=FillUtils.fillRadial180(w,h/2,
					clockwise?0:1,
					clockwise,
					amount);
					if(clockwise){
						FillUtils.movePoints(points,0,h/2);
						points.push(w,0,0,0,0,h/2);
					}
					else
					points.push(w,h,0,h,0,h/2);
				}
				break ;
			case 3:
				if(amount<=0.5){
					amount=amount / 0.5;
					points=FillUtils.fillRadial180(w,h/2,
					clockwise?0:1,
					clockwise,
					amount);
					if(clockwise)
						FillUtils.movePoints(points,0,h/2);
				}
				else{
					amount=(amount-0.5)/ 0.5;
					points=FillUtils.fillRadial180(w,h/2,
					clockwise?1:0,
					clockwise,
					amount);
					if(clockwise)
						points.push(0,h,w,h,w,h/2);
					else{
						FillUtils.movePoints(points,0,h/2);
						points.push(0,0,w,0,w,h/2);
					}
				}
				break ;
			}
		return points;
	}

	return FillUtils;
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


//class fairygui.DragDropManager
var DragDropManager=(function(){
	function DragDropManager(){
		this._agent=null;
		this._sourceData=null;
		this._agent=new GLoader();
		this._agent.draggable=true;
		this._agent.touchable=false;
		this._agent.setSize(100,100);
		this._agent.setPivot(0.5,0.5,true);
		this._agent.align="center";
		this._agent.verticalAlign="middle";
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
		var pt=GRoot.inst.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY);
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

	DragDropManager._inst=null;
	return DragDropManager;
})()


//class fairygui.Events
var Events=(function(){
	function Events(){}
	__class(Events,'fairygui.Events');
	Events.createEvent=function(type,target,source){
		fairygui.Events.$event.setTo(type,target,source?source.target:target);
		if(source){
			fairygui.Events.$event.touchId=source.touchId;
			fairygui.Events.$event.nativeEvent=source.nativeEvent;
		}
		else{
			fairygui.Events.$event.nativeEvent=null;
		}
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
	Events.SCROLL_END="fui_scroll_end";
	Events.DROP="fui_drop";
	Events.FOCUS_CHANGED="fui_focus_changed";
	Events.DRAG_START="fui_drag_start";
	Events.DRAG_MOVE="fui_drag_move";
	Events.DRAG_END="fui_drag_end";
	Events.PULL_DOWN_RELEASE="fui_pull_down_release";
	Events.PULL_UP_RELEASE="fui_pull_up_release";
	Events.GEAR_STOP="fui_gear_stop";
	__static(Events,
	['$event',function(){return this.$event=new Event();}
	]);
	return Events;
})()


//class fairygui.FillMethod
var FillMethod=(function(){
	function FillMethod(){}
	__class(FillMethod,'fairygui.FillMethod');
	FillMethod.None=0;
	FillMethod.Horizontal=1;
	FillMethod.Vertical=2;
	FillMethod.Radial90=3;
	FillMethod.Radial180=4;
	FillMethod.Radial360=5;
	return FillMethod;
})()


//class fairygui.FillOrigin
var FillOrigin=(function(){
	function FillOrigin(){}
	__class(FillOrigin,'fairygui.FillOrigin');
	FillOrigin.Top=0;
	FillOrigin.Bottom=1;
	FillOrigin.Left=2;
	FillOrigin.Right=3;
	FillOrigin.TopLeft=0;
	FillOrigin.TopRight=1;
	FillOrigin.BottomLeft=2;
	FillOrigin.BottomRight=3;
	return FillOrigin;
})()


/**
*Use for GImage.flip
*/
//class fairygui.FlipType
var FlipType=(function(){
	function FlipType(){}
	__class(FlipType,'fairygui.FlipType');
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
		this.packageItem=null;
		this._x=0;
		this._y=0;
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
		this._internalVisible=true;
		this._handlingController=false;
		this._focusable=false;
		this._tooltips=null;
		this._pixelSnapping=false;
		this._relations=null;
		this._group=null;
		this._gears=null;
		this._dragBounds=null;
		this._displayObject=null;
		this._yOffset=0;
		//Size的实现方式，有两种，0-GObject的w/h等于DisplayObject的w/h。1-GObject的sourceWidth/sourceHeight等于DisplayObject的w/h，剩余部分由scale实现
		this._sizeImplType=0;
		this.minWidth=0;
		this.minHeight=0;
		this.maxWidth=0;
		this.maxHeight=0;
		this.sourceWidth=0;
		this.sourceHeight=0;
		this.initWidth=0;
		this.initHeight=0;
		this._parent=null;
		this._width=0;
		this._height=0;
		this._rawWidth=0;
		this._rawHeight=0;
		this._id=null;
		this._name=null;
		this._underConstruct=false;
		this._gearLocked=false;
		this._sizePercentInGroup=0;
		this._touchDownPoint=null;
		;
		this._id=""+fairygui.GObject._gInstanceCounter++;
		this._name="";
		this.createDisplayObject();
		this._relations=new Relations(this);
		this._gears=__newvec(8,null);
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
			this.updateGear(1);
			if(this._parent && !((this._parent instanceof fairygui.GList ))){
				this._parent.setBoundsChangedFlag();
				if (this._group !=null)
					this._group.setBoundsChangedFlag();
				this.displayObject.event("fui_xy_changed");
			}
			if (GObject.draggingObject==this && !GObject.sUpdateInDragging)
				this.localToGlobalRect(0,0,this.width,this.height,GObject.sGlobalRect);
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
			if(wv<this.minWidth)
				wv=this.minWidth;
			if(hv<this.minHeight)
				hv=this.minHeight;
			if(this.maxWidth>0 && wv>this.maxWidth)
				wv=this.maxWidth;
			if(this.maxHeight>0 && hv>this.maxHeight)
				hv=this.maxHeight;
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
			if ((this instanceof fairygui.GGroup ))
				(this).resizeChildren(dWidth,dHeight);
			this.updateGear(2);
			if(this._parent){
				this._relations.onOwnerSizeChanged(dWidth,dHeight,this._pivotAsAnchor || !ignorePivot);
				this._parent.setBoundsChangedFlag();
				if (this._group !=null)
					this._group.setBoundsChangedFlag(true);
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
			this.updateGear(2);
		}
	}

	__proto.setSkew=function(sx,sy){
		if(this._skewX !=sx || this._skewY !=sy){
			this._skewX=sx;
			this._skewY=sy;
			if(this._displayObject!=null){
				this._displayObject.skew(-sx,sy);
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
					fairygui.GObject.sHelperPoint.x=this._pivotX*this.sourceWidth;
					fairygui.GObject.sHelperPoint.y=this._pivotY*this.sourceHeight;
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

	__proto.requestFocus=function(){
		var p=this;
		while (p && !p._focusable)
		p=p.parent;
		if (p !=null)
			this.root.focus=p;
	}

	__proto.__rollOver=function(evt){
		Laya.timer.once(100,this,this.__doShowTooltips);
	}

	__proto.__doShowTooltips=function(){
		var r=this.root;
		if(r)
			this.root.showTooltips(this._tooltips);
	}

	__proto.__rollOut=function(evt){
		Laya.timer.clear(this,this.__doShowTooltips);
		this.root.hideTooltips();
	}

	__proto.getGear=function(index){
		var gear=this._gears[index];
		if (gear==null){
			switch (index){
				case 0:
					gear=new GearDisplay(this);
					break ;
				case 1:
					gear=new GearXY(this);
					break ;
				case 2:
					gear=new GearSize(this);
					break ;
				case 3:
					gear=new GearLook(this);
					break ;
				case 4:
					gear=new GearColor(this);
					break ;
				case 5:
					gear=new GearAnimation(this);
					break ;
				case 6:
					gear=new GearText(this);
					break ;
				case 7:
					gear=new GearIcon(this);
					break ;
				default :
					throw new Error("FairyGUI: invalid gear index!");
				}
			this._gears[index]=gear;
		}
		return gear;
	}

	__proto.updateGear=function(index){
		if(this._underConstruct || this._gearLocked)
			return;
		var gear=this._gears[index];
		if (gear!=null && gear.controller!=null)
			gear.updateState();
	}

	__proto.checkGearController=function(index,c){
		return this._gears[index] !=null && this._gears[index].controller==c;
	}

	__proto.updateGearFromRelations=function(index,dx,dy){
		if (this._gears[index] !=null)
			this._gears[index].updateFromRelations(dx,dy);
	}

	__proto.addDisplayLock=function(){
		var gearDisplay=(this._gears[0]);
		if(gearDisplay && gearDisplay.controller){
			var ret=gearDisplay.addLock();
			this.checkGearDisplay();
			return ret;
		}
		else
		return 0;
	}

	__proto.releaseDisplayLock=function(token){
		var gearDisplay=(this._gears[0]);
		if(gearDisplay && gearDisplay.controller){
			gearDisplay.releaseLock(token);
			this.checkGearDisplay();
		}
	}

	__proto.checkGearDisplay=function(){
		if(this._handlingController)
			return;
		var connected=this._gears[0]==null || (this._gears[0]).connected;
		if(connected!=this._internalVisible){
			this._internalVisible=connected;
			if(this._parent)
				this._parent.childStateChanged(this);
		}
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
		this._displayObject.destroy();
		this._displayObject=null;
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
		if(this._pivotAsAnchor){
			ax+=this._pivotX*this._width;
			ay+=this._pivotY*this._height;
		}
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
			resultPoint=this._displayObject.globalToLocal(resultPoint,true);
		}
		else{
			resultPoint.x=ax;
			resultPoint.y=ay;
			this._displayObject.globalToLocal(resultPoint,false);
		}
		if(this._pivotAsAnchor){
			resultPoint.x-=this._pivotX*this._width;
			resultPoint.y-=this._pivotY*this._height;
		}
		return resultPoint;
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
		this._handlingController=true;
		for (var i=0;i < 8;i++){
			var gear=this._gears[i];
			if (gear !=null && gear.controller==c)
				gear.apply();
		}
		this._handlingController=false;
		this.checkGearDisplay();
	}

	__proto.createDisplayObject=function(){
		this._displayObject=new Sprite();
		this._displayObject["$owner"]=this;
	}

	__proto.handleXYChanged=function(){
		var xv=this._x;
		var yv=this._y+this._yOffset;
		if(this._pivotAsAnchor){
			xv-=this._pivotX*this._width;
			yv-=this._pivotY*this._height;
		}
		if(this._pixelSnapping){
			xv=Math.round(xv);
			yv=Math.round(yv);
		}
		this._displayObject.pos(xv+this._pivotOffsetX,yv+this._pivotOffsetY);
	}

	__proto.handleSizeChanged=function(){
		if(this._displayObject!=null){
			if(this._sizeImplType==0 || this.sourceWidth==0 || this.sourceHeight==0)
				this._displayObject.size(this._width,this._height);
			else
			this._displayObject.scale(this._width/this.sourceWidth*this._scaleX,
			this._height/this.sourceHeight*this._scaleY);
		}
	}

	__proto.handleScaleChanged=function(){
		if(this._displayObject!=null){
			if(this._sizeImplType==0 || this.sourceWidth==0 || this.sourceHeight==0)
				this._displayObject.scale(this._scaleX,this._scaleY);
			else
			this._displayObject.scale(this._width/this.sourceWidth*this._scaleX,
			this._height/this.sourceHeight*this._scaleY);
		}
	}

	__proto.handleGrayedChanged=function(){
		if(this._displayObject){
			if(this._grayed){
				if(GObject.grayFilter==null)
					GObject.grayFilter=new ColorFilter([0.3086,0.6094,0.082,0,0,0.3086,0.6094,0.082,0,0,0.3086,0.6094,0.082,0,0,0,0,0,1,0]);
				this._displayObject.filters=[GObject.grayFilter];
			}
			else
			this._displayObject.filters=null;
		}
	}

	__proto.handleAlphaChanged=function(){
		if(this._displayObject)
			this._displayObject.alpha=this._alpha;
	}

	__proto.handleVisibleChanged=function(){
		if(this._displayObject)
			this._displayObject.visible=this.internalVisible2;
	}

	__proto.constructFromResource=function(){}
	__proto.setup_beforeAdd=function(buffer,beginPos){
		buffer.seek(beginPos,0);
		buffer.skip(5);
		var f1=NaN;
		var f2=NaN;
		this._id=buffer.readS();
		this._name=buffer.readS();
		f1=buffer.getInt32();
		f2=buffer.getInt32();
		this.setXY(f1,f2);
		if (buffer.readBool()){
			this.initWidth=buffer.getInt32();
			this.initHeight=buffer.getInt32();
			this.setSize(this.initWidth,this.initHeight,true);
		}
		if (buffer.readBool()){
			this.minWidth=buffer.getInt32();
			this.maxWidth=buffer.getInt32();
			this.minHeight=buffer.getInt32();
			this.maxHeight=buffer.getInt32();
		}
		if (buffer.readBool()){
			f1=buffer.getFloat32();
			f2=buffer.getFloat32();
			this.setScale(f1,f2);
		}
		if (buffer.readBool()){
			f1=buffer.getFloat32();
			f2=buffer.getFloat32();
			this.setSkew(f1,f2);
		}
		if (buffer.readBool()){
			f1=buffer.getFloat32();
			f2=buffer.getFloat32();
			this.setPivot(f1,f2,buffer.readBool());
		}
		f1=buffer.getFloat32();
		if (f1 !=1)
			this.alpha=f1;
		f1=buffer.getFloat32();
		if (f1 !=0)
			this.rotation=f1;
		if (!buffer.readBool())
			this.visible=false;
		if (!buffer.readBool())
			this.touchable=false;
		if (buffer.readBool())
			this.grayed=true;
		var bm=buffer.readByte();
		if(bm==2)
			this.blendMode="lighter";
		var filter=buffer.readByte();
		if (filter==1){
			var cm=new ColorMatrix();
			cm.adjustBrightness(buffer.getFloat32());
			cm.adjustContrast(buffer.getFloat32());
			cm.adjustSaturation(buffer.getFloat32());
			cm.adjustHue(buffer.getFloat32());
			var cf=new ColorFilter(cm);
			this.filters=[cf];
		};
		var str=buffer.readS();
		if (str !=null)
			this.data=str;
	}

	__proto.setup_afterAdd=function(buffer,beginPos){
		buffer.seek(beginPos,1);
		var str=buffer.readS();
		if (str !=null)
			this.tooltips=str;
		var groupId=buffer.getInt16();
		if (groupId >=0)
			this.group=this.parent.getChildAt(groupId);
		buffer.seek(beginPos,2);
		var cnt=buffer.getInt16();
		for (var i=0;i < cnt;i++){
			var nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			var gear=this.getGear(buffer.readByte());
			gear.setup(buffer);
			buffer.pos=nextPos;
		}
	}

	__proto.initDrag=function(){
		if (this._draggable)
			this.on("mousedown",this,this.__begin);
		else
		this.off("mousedown",this,this.__begin);
	}

	__proto.dragBegin=function(){
		if (fairygui.GObject.draggingObject !=null)
			fairygui.GObject.draggingObject.stopDrag();
		fairygui.GObject.sGlobalDragStart.x=Laya.stage.mouseX;
		fairygui.GObject.sGlobalDragStart.y=Laya.stage.mouseY;
		this.localToGlobalRect(0,0,this.width,this.height,fairygui.GObject.sGlobalRect);
		fairygui.GObject.draggingObject=this;
		Laya.stage.on("mousemove",this,this.__moving2);
		Laya.stage.on("mouseup",this,this.__end2);
	}

	__proto.dragEnd=function(){
		if (fairygui.GObject.draggingObject==this){
			Laya.stage.off("mousemove",this,this.__moving2);
			Laya.stage.off("mouseup",this,this.__end2);
			fairygui.GObject.draggingObject=null;
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
		var sensitivity=UIConfig$1.touchDragSensitivity;
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
		}
		GObject.sUpdateInDragging=true;
		var pt=this.parent.globalToLocal(xx,yy,fairygui.GObject.sHelperPoint);
		this.setXY(Math.round(pt.x),Math.round(pt.y));
		GObject.sUpdateInDragging=false;
		Events.dispatch("fui_drag_move",this._displayObject,evt);
	}

	__proto.__end2=function(evt){
		if (fairygui.GObject.draggingObject==this){
			this.stopDrag();
			Events.dispatch("fui_drag_end",this._displayObject,evt);
		}
	}

	__getset(0,__proto,'yMin',function(){
		return this._pivotAsAnchor ? (this._y-this._height *this._pivotY):this._y;
		},function(value){
		if (this._pivotAsAnchor)
			this.setXY(this._x,value+this._height *this._pivotY);
		else
		this.setXY(this._x,value);
	});

	__getset(0,__proto,'id',function(){
		return this._id;
	});

	__getset(0,__proto,'name',function(){
		return this._name;
		},function(value){
		this._name=value;
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
			this.updateGear(3);
		}
	});

	__getset(0,__proto,'width',function(){
		this.ensureSizeCorrect();
		if(this._relations.sizeDirty)
			this._relations.ensureRelationsSizeCorrect();
		return this._width;
		},function(value){
		this.setSize(value,this._rawHeight);
	});

	__getset(0,__proto,'x',function(){
		return this._x;
		},function(value){
		this.setXY(value,this._y);
	});

	__getset(0,__proto,'draggable',function(){
		return this._draggable;
		},function(value){
		if (this._draggable !=value){
			this._draggable=value;
			this.initDrag();
		}
	});

	__getset(0,__proto,'y',function(){
		return this._y;
		},function(value){
		this.setXY(this._x,value);
	});

	__getset(0,__proto,'gearXY',function(){
		return (this.getGear(1));
	});

	__getset(0,__proto,'xMin',function(){
		return this._pivotAsAnchor ? (this._x-this._width *this._pivotX):this._x;
		},function(value){
		if (this._pivotAsAnchor)
			this.setXY(value+this._width *this._pivotX,this._y);
		else
		this.setXY(value,this._y);
	});

	__getset(0,__proto,'pixelSnapping',function(){
		return this._pixelSnapping;
		},function(value){
		if(this._pixelSnapping!=value){
			this._pixelSnapping=value;
			this.handleXYChanged();
		}
	});

	__getset(0,__proto,'height',function(){
		this.ensureSizeCorrect();
		if(this._relations.sizeDirty)
			this._relations.ensureRelationsSizeCorrect();
		return this._height;
		},function(value){
		this.setSize(this._rawWidth,value);
	});

	__getset(0,__proto,'asButton',function(){
		return this;
	});

	__getset(0,__proto,'actualWidth',function(){
		return this.width *Math.abs(this._scaleX);
	});

	__getset(0,__proto,'actualHeight',function(){
		return this.height *Math.abs(this._scaleY);
	});

	__getset(0,__proto,'blendMode',function(){
		return this._displayObject.blendMode;
		},function(value){
		this._displayObject.blendMode=value;
	});

	__getset(0,__proto,'scaleX',function(){
		return this._scaleX;
		},function(value){
		this.setScale(value,this._scaleY);
	});

	__getset(0,__proto,'scaleY',function(){
		return this._scaleY;
		},function(value){
		this.setScale(this._scaleX,value);
	});

	__getset(0,__proto,'skewX',function(){
		return this._skewX;
		},function(value){
		this.setSkew(value,this._skewY);
	});

	__getset(0,__proto,'pivotAsAnchor',function(){
		return this._pivotAsAnchor;
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

	__getset(0,__proto,'asLoader',function(){
		return this;
	});

	__getset(0,__proto,'asTextInput',function(){
		return this;
	});

	__getset(0,__proto,'displayObject',function(){
		return this._displayObject;
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
		if(this._touchable!=value){
			this._touchable=value;
			this.updateGear(3);
			if(((this instanceof fairygui.GImage ))|| ((this instanceof fairygui.GMovieClip ))
				|| ((this instanceof fairygui.GTextField ))&& !((this instanceof fairygui.GTextInput ))&& !((this instanceof fairygui.GRichTextField )))
			return;
			if(this._displayObject !=null)
				this._displayObject.mouseEnabled=this._touchable;
		}
	});

	__getset(0,__proto,'alpha',function(){
		return this._alpha;
		},function(value){
		if(this._alpha!=value){
			this._alpha=value;
			this.handleAlphaChanged();
			this.updateGear(3);
		}
	});

	__getset(0,__proto,'grayed',function(){
		return this._grayed;
		},function(value){
		if(this._grayed !=value){
			this._grayed=value;
			this.handleGrayedChanged();
			this.updateGear(3);
		}
	});

	__getset(0,__proto,'dragBounds',function(){
		return this._dragBounds;
		},function(value){
		this._dragBounds=value;
	});

	__getset(0,__proto,'asProgress',function(){
		return this;
	});

	__getset(0,__proto,'enabled',function(){
		return !this._grayed && this._touchable;
		},function(value){
		this.grayed=!value;
		this.touchable=value;
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

	__getset(0,__proto,'visible',function(){
		return this._visible;
		},function(value){
		if (this._visible !=value){
			this._visible=value;
			this.handleVisibleChanged();
			if (this._parent)
				this._parent.setBoundsChangedFlag();
		}
	});

	__getset(0,__proto,'internalVisible',function(){
		return this._internalVisible && (!this._group || this._group.internalVisible)
		&& !this._displayObject._cacheStyle.maskParent;
	});

	__getset(0,__proto,'icon',function(){
		return null;
		},function(value){
	});

	__getset(0,__proto,'internalVisible2',function(){
		return this._visible && (!this._group || this._group.internalVisible2);
	});

	__getset(0,__proto,'asGraph',function(){
		return this;
	});

	__getset(0,__proto,'gearSize',function(){
		return (this.getGear(2));
	});

	__getset(0,__proto,'focusable',function(){
		return this._focusable;
		},function(value){
		this._focusable=value;
	});

	__getset(0,__proto,'focused',function(){
		return this.root.focus==this;
	});

	__getset(0,__proto,'tooltips',function(){
		return this._tooltips;
		},function(value){
		if(this._tooltips){
			this.off("mouseover",this,this.__rollOver);
			this.off("mouseout",this,this.__rollOut);
		}
		this._tooltips=value;
		if(this._tooltips){
			this.on("mouseover",this,this.__rollOver);
			this.on("mouseout",this,this.__rollOut);
		}
	});

	__getset(0,__proto,'dragging',function(){
		return fairygui.GObject.draggingObject==this;
	});

	__getset(0,__proto,'group',function(){
		return this._group;
		},function(value){
		if (this._group !=value){
			if (this._group !=null)
				this._group.setBoundsChangedFlag(true);
			this._group=value;
			if (this._group !=null)
				this._group.setBoundsChangedFlag(true);
		}
	});

	__getset(0,__proto,'filters',function(){
		return this._displayObject.filters;
		},function(value){
		this._displayObject.filters=value;
	});

	__getset(0,__proto,'inContainer',function(){
		return this._displayObject !=null && this._displayObject.parent !=null;
	});

	__getset(0,__proto,'resourceURL',function(){
		if (this.packageItem !=null)
			return "ui://"+this.packageItem.owner.id+this.packageItem.id;
		else
		return null;
	});

	__getset(0,__proto,'onStage',function(){
		return this._displayObject !=null && this._displayObject.stage !=null;
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

	__getset(0,__proto,'gearLook',function(){
		return (this.getGear(3));
	});

	__getset(0,__proto,'asCom',function(){
		return this;
	});

	__getset(0,__proto,'relations',function(){
		return this._relations;
	});

	__getset(0,__proto,'parent',function(){
		return this._parent;
		},function(val){
		this._parent=val;
	});

	__getset(0,__proto,'asLabel',function(){
		return this;
	});

	__getset(0,__proto,'asImage',function(){
		return this;
	});

	__getset(0,__proto,'asTextField',function(){
		return this;
	});

	__getset(0,__proto,'asGroup',function(){
		return this;
	});

	__getset(0,__proto,'asRichTextField',function(){
		return this;
	});

	__getset(0,__proto,'asList',function(){
		return this;
	});

	__getset(0,__proto,'asSlider',function(){
		return this;
	});

	__getset(0,__proto,'asComboBox',function(){
		return this;
	});

	__getset(0,__proto,'asMovieClip',function(){
		return this;
	});

	__getset(0,__proto,'text',function(){
		return null;
		},function(value){
	});

	GObject.cast=function(sprite){
		return (sprite["$owner"]);
	}

	GObject.draggingObject=null;
	GObject._gInstanceCounter=0;
	GObject.grayFilter=null;
	GObject.sDraggingQuery=false;
	GObject.sUpdateInDragging=false;
	__static(GObject,
	['sGlobalDragStart',function(){return this.sGlobalDragStart=new Point();},'sGlobalRect',function(){return this.sGlobalRect=new Rectangle();},'sHelperPoint',function(){return this.sHelperPoint=new Point();},'sDragHelperRect',function(){return this.sDragHelperRect=new Rectangle();}
	]);
	return GObject;
})()


//class fairygui.gears.GearBase
var GearBase=(function(){
	function GearBase(owner){
		this._owner=null;
		this._controller=null;
		this._tweenConfig=null;
		this._owner=owner;
	}

	__class(GearBase,'fairygui.gears.GearBase');
	var __proto=GearBase.prototype;
	__proto.setup=function(buffer){
		this._controller=this._owner.parent.getControllerAt(buffer.getInt16());
		this.init();
		var cnt=0;
		var i=0;
		var page;
		if ((this instanceof fairygui.gears.GearDisplay )){
			cnt=buffer.getInt16();
			var pages=[];
			for (i=0;i < cnt;i++)
			pages[i]=buffer.readS();
			(this).pages=pages;
		}
		else{
			cnt=buffer.getInt16();
			for (i=0;i < cnt;i++){
				page=buffer.readS();
				if (page==null)
					continue ;
				this.addStatus(page,buffer);
			}
			if (buffer.readBool())
				this.addStatus(null,buffer);
		}
		if (buffer.readBool()){
			this._tweenConfig=new GearTweenConfig();
			this._tweenConfig.easeType=buffer.readByte();
			this._tweenConfig.duration=buffer.getFloat32();
			this._tweenConfig.delay=buffer.getFloat32();
		}
	}

	__proto.updateFromRelations=function(dx,dy){}
	__proto.addStatus=function(pageId,buffer){}
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

	__getset(0,__proto,'tweenConfig',function(){
		if(this._tweenConfig==null)
			this._tweenConfig=new GearTweenConfig();
		return this._tweenConfig;
	});

	GearBase.disableAllTweenEffect=false;
	return GearBase;
})()


//class fairygui.gears.GearTweenConfig
var GearTweenConfig=(function(){
	function GearTweenConfig(){
		this.tween=false;
		this.easeType=0;
		this.duration=NaN;
		this.delay=NaN;
		this._displayLockToken=NaN;
		this._tweener=null;
		this.tween=true;
		this.easeType=5;
		this.duration=0.3;
		this.delay=0;
	}

	__class(GearTweenConfig,'fairygui.gears.GearTweenConfig');
	return GearTweenConfig;
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
		for (var i1 in this._pool){
			var arr=this._pool[i1];
			var cnt=arr.length;
			for (var i=0;i < cnt;i++)
			arr[i].dispose();
		}
		this._pool={};
		this._count=0;
	}

	__proto.getObject=function(url){
		url=UIPackage.normalizeURL(url);
		if(url==null)
			return null;
		var arr=this._pool[url];
		if (arr !=null && arr.length>0){
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
		if (arr==null){
			arr=[];
			this._pool[url]=arr;
		}
		this._count++;
		arr.push(obj);
	}

	__getset(0,__proto,'count',function(){
		return this._count;
	});

	return GObjectPool;
})()


/**
*Use for GGroup.layout
*/
//class fairygui.GroupLayoutType
var GroupLayoutType=(function(){
	function GroupLayoutType(){}
	__class(GroupLayoutType,'fairygui.GroupLayoutType');
	GroupLayoutType.None=0;
	GroupLayoutType.Horizontal=1;
	GroupLayoutType.Vertical=2;
	return GroupLayoutType;
})()


/**
*Use for GList.layout
*/
//class fairygui.ListLayoutType
var ListLayoutType=(function(){
	function ListLayoutType(){}
	__class(ListLayoutType,'fairygui.ListLayoutType');
	ListLayoutType.SingleColumn=0;
	ListLayoutType.SingleRow=1;
	ListLayoutType.FlowHorizontal=2;
	ListLayoutType.FlowVertical=3;
	ListLayoutType.Pagination=4;
	return ListLayoutType;
})()


/**
*Use for GList.selectionMode
*/
//class fairygui.ListSelectionMode
var ListSelectionMode=(function(){
	function ListSelectionMode(){}
	__class(ListSelectionMode,'fairygui.ListSelectionMode');
	ListSelectionMode.Single=0;
	ListSelectionMode.Multiple=1;
	ListSelectionMode.Multiple_SingleClick=2;
	ListSelectionMode.None=3;
	return ListSelectionMode;
})()


/**
*Use for GLoader.fill
*/
//class fairygui.LoaderFillType
var LoaderFillType=(function(){
	function LoaderFillType(){}
	__class(LoaderFillType,'fairygui.LoaderFillType');
	LoaderFillType.None=0;
	LoaderFillType.Scale=1;
	LoaderFillType.ScaleMatchHeight=2;
	LoaderFillType.ScaleMatchWidth=3;
	LoaderFillType.ScaleFree=4;
	LoaderFillType.ScaleNoBorder=5;
	return LoaderFillType;
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
	__proto.copy=function(source){
		this.top=source.top;
		this.bottom=source.bottom;
		this.left=source.left;
		this.right=source.right;
	}

	return Margin;
})()


/**
*Use for UIObjectFactory.newObject
*/
//class fairygui.ObjectType
var ObjectType=(function(){
	function ObjectType(){}
	__class(ObjectType,'fairygui.ObjectType');
	ObjectType.Image=0;
	ObjectType.MovieClip=1;
	ObjectType.Swf=2;
	ObjectType.Graph=3;
	ObjectType.Loader=4;
	ObjectType.Group=5;
	ObjectType.Text=6;
	ObjectType.RichText=7;
	ObjectType.InputText=8;
	ObjectType.Component=9;
	ObjectType.List=10;
	ObjectType.Label=11;
	ObjectType.Button=12;
	ObjectType.ComboBox=13;
	ObjectType.ProgressBar=14;
	ObjectType.Slider=15;
	ObjectType.ScrollBar=16;
	return ObjectType;
})()


/**
*Use for GComponent.overflow
*/
//class fairygui.OverflowType
var OverflowType=(function(){
	function OverflowType(){}
	__class(OverflowType,'fairygui.OverflowType');
	OverflowType.Visible=0;
	OverflowType.Hidden=1;
	OverflowType.Scroll=2;
	return OverflowType;
})()


//class fairygui.PackageItem
var PackageItem=(function(){
	function PackageItem(){
		this.owner=null;
		this.type=0;
		this.objectType=0;
		this.id=null;
		this.name=null;
		this.width=0;
		this.height=0;
		this.file=null;
		this.decoded=false;
		this.rawData=null;
		//image
		this.scale9Grid=null;
		this.scaleByTile=false;
		this.tileGridIndice=0;
		this.smoothing=false;
		this.texture=null;
		this.pixelHitTestData=null;
		//movieclip
		this.interval=0;
		this.repeatDelay=0;
		this.swing=false;
		this.frames=null;
		//componenet
		this.extensionType=null;
		//font
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
	PackageItemType.Image=0;
	PackageItemType.MovieClip=1;
	PackageItemType.Sound=2;
	PackageItemType.Component=3;
	PackageItemType.Atlas=4;
	PackageItemType.Font=5;
	PackageItemType.Swf=6;
	PackageItemType.Misc=7;
	PackageItemType.Unknown=8;
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

	__getset(0,__proto,'name',function(){
		if (this._id)
			return this._controller.getPageNameById(this._id);
		else
		return null;
		},function(pageName){
		this._id=this._controller.getPageIdByName(pageName);
	});

	__getset(0,__proto,'id',function(){
		return this._id;
		},function(id){
		this._id=id;
	});

	return PageOption;
})()


/**
*Use for GComboBox.popupDirection
*/
//class fairygui.PopupDirection
var PopupDirection=(function(){
	function PopupDirection(){}
	__class(PopupDirection,'fairygui.PopupDirection');
	PopupDirection.Auto=0;
	PopupDirection.Up=1;
	PopupDirection.Down=2;
	return PopupDirection;
})()


//class fairygui.PopupMenu
var PopupMenu=(function(){
	function PopupMenu(resourceURL){
		this._contentPane=null;
		this._list=null;
		if(!resourceURL){
			resourceURL=UIConfig$1.popupMenu;
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
		if(UIConfig$1.popupMenu_seperator==null)
			throw "UIConfig.popupMenu_seperator not defined";
		this.list.addItemFromPool(UIConfig$1.popupMenu_seperator);
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
		if(!((itemObject instanceof fairygui.GButton )))
			return;
		if(itemObject.grayed){
			this._list.selectedIndex=-1;
			return;
		};
		var c=itemObject.asCom.getController("checked");
		if(c !=null && c.selectedIndex !=0){
			if(c.selectedIndex==1)
				c.selectedIndex=2;
			else
			c.selectedIndex=1;
		};
		var r=(this._contentPane.parent);
		r.hidePopup(this.contentPane);
		if(itemObject.data !=null){
			(itemObject.data).run();
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


/**
*Use for GProgressBar.titleType and GSlider.titleType
*/
//class fairygui.ProgressTitleType
var ProgressTitleType=(function(){
	function ProgressTitleType(){}
	__class(ProgressTitleType,'fairygui.ProgressTitleType');
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
		var cnt=this._defs.length;
		for(var i=0;i<cnt;i++){
			if (this._defs[i].type==relationType)
				return;
		}
		this.internalAdd(relationType,usePercent);
	}

	__proto.internalAdd=function(relationType,usePercent){
		if (relationType==24){
			this.internalAdd(14,usePercent);
			this.internalAdd(15,usePercent);
			return;
		};
		var info=new RelationDef();
		info.percent=usePercent;
		info.type=relationType;
		info.axis=(relationType <=6 || relationType==14 || relationType >=16 && relationType <=19)? 0 :1;
		this._defs.push(info);
		if (usePercent || relationType==1 || relationType==3 || relationType==5
			|| relationType==8 || relationType==10 || relationType==12)
		this._owner.pixelSnapping=true;
	}

	__proto.remove=function(relationType){
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
		var cnt=source._defs.length;
		for(var i=0;i<cnt;i++){
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

	__proto.applyOnSelfResized=function(dWidth,dHeight,applyPivot){
		var cnt=this._defs.length;
		if(cnt==0)
			return;
		var ox=this._owner.x;
		var oy=this._owner.y;
		for (var i=0;i < cnt;i++){
			var info=this._defs[i];
			switch (info.type){
				case 3:
					this._owner.x-=(0.5-(applyPivot ? this._owner.pivotX :0))*dWidth;
					break ;
				case 5:
				case 4:
				case 6:
					this._owner.x-=(1-(applyPivot ? this._owner.pivotX :0))*dWidth;
					break ;
				case 10:
					this._owner.y-=(0.5-(applyPivot ? this._owner.pivotY :0))*dHeight;
					break ;
				case 12:
				case 11:
				case 13:
					this._owner.y-=(1-(applyPivot ? this._owner.pivotY :0))*dHeight;
					break ;
				}
		}
		if (ox!=this._owner.x || oy!=this._owner.y){
			ox=this._owner.x-ox;
			oy=this._owner.y-oy;
			this._owner.updateGearFromRelations(1,ox,oy);
			if (this._owner.parent !=null && this._owner.parent._transitions.length > 0){
				cnt=this._owner.parent._transitions.length;
				for(var j=0;j<cnt;j++){
					var trans=this._owner.parent._transitions[j];
					trans.updateFromRelations(this._owner.id,ox,oy);
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
				tmp=this._owner.xMin;
				this._owner.width=this._owner._rawWidth-dx;
				this._owner.xMin=tmp+dx;
				break ;
			case 18:
			case 19:
				tmp=this._owner.xMin;
				this._owner.width=this._owner._rawWidth+dx;
				this._owner.xMin=tmp;
				break ;
			case 20:
			case 21:
				tmp=this._owner.yMin;
				this._owner.height=this._owner._rawHeight-dy;
				this._owner.yMin=tmp+dy;
				break ;
			case 22:
			case 23:
				tmp=this._owner.yMin;
				this._owner.height=this._owner._rawHeight+dy;
				this._owner.yMin=tmp;
				break ;
			}
	}

	__proto.applyOnSizeChanged=function(info){
		var pos=0,pivot=0,delta=0;
		var v=NaN,tmp=NaN;
		if (info.axis==0){
			if (this._target !=this._owner.parent){
				pos=this._target.x;
				if (this._target.pivotAsAnchor)
					pivot=this._target.pivotX;
			}
			if (info.percent){
				if (this._targetWidth !=0)
					delta=this._target._width / this._targetWidth;
			}
			else
			delta=this._target._width-this._targetWidth;
		}
		else{
			if (this._target !=this._owner.parent){
				pos=this._target.y;
				if (this._target.pivotAsAnchor)
					pivot=this._target.pivotY;
			}
			if (info.percent){
				if (this._targetHeight !=0)
					delta=this._target._height / this._targetHeight;
			}
			else
			delta=this._target._height-this._targetHeight;
		}
		switch (info.type){
			case 0:
				if (info.percent)
					this._owner.xMin=pos+(this._owner.xMin-pos)*delta;
				else if (pivot !=0)
				this._owner.x+=delta *(-pivot);
				break ;
			case 1:
				if (info.percent)
					this._owner.xMin=pos+(this._owner.xMin-pos)*delta;
				else
				this._owner.x+=delta *(0.5-pivot);
				break ;
			case 2:
				if (info.percent)
					this._owner.xMin=pos+(this._owner.xMin-pos)*delta;
				else
				this._owner.x+=delta *(1-pivot);
				break ;
			case 3:
				if (info.percent)
					this._owner.xMin=pos+(this._owner.xMin+this._owner._rawWidth *0.5-pos)*delta-this._owner._rawWidth *0.5;
				else
				this._owner.x+=delta *(0.5-pivot);
				break ;
			case 4:
				if (info.percent)
					this._owner.xMin=pos+(this._owner.xMin+this._owner._rawWidth-pos)*delta-this._owner._rawWidth;
				else if (pivot !=0)
				this._owner.x+=delta *(-pivot);
				break ;
			case 5:
				if (info.percent)
					this._owner.xMin=pos+(this._owner.xMin+this._owner._rawWidth-pos)*delta-this._owner._rawWidth;
				else
				this._owner.x+=delta *(0.5-pivot);
				break ;
			case 6:
				if (info.percent)
					this._owner.xMin=pos+(this._owner.xMin+this._owner._rawWidth-pos)*delta-this._owner._rawWidth;
				else
				this._owner.x+=delta *(1-pivot);
				break ;
			case 7:
				if (info.percent)
					this._owner.yMin=pos+(this._owner.yMin-pos)*delta;
				else if (pivot !=0)
				this._owner.y+=delta *(-pivot);
				break ;
			case 8:
				if (info.percent)
					this._owner.yMin=pos+(this._owner.yMin-pos)*delta;
				else
				this._owner.y+=delta *(0.5-pivot);
				break ;
			case 9:
				if (info.percent)
					this._owner.yMin=pos+(this._owner.yMin-pos)*delta;
				else
				this._owner.y+=delta *(1-pivot);
				break ;
			case 10:
				if (info.percent)
					this._owner.yMin=pos+(this._owner.yMin+this._owner._rawHeight *0.5-pos)*delta-this._owner._rawHeight *0.5;
				else
				this._owner.y+=delta *(0.5-pivot);
				break ;
			case 11:
				if (info.percent)
					this._owner.yMin=pos+(this._owner.yMin+this._owner._rawHeight-pos)*delta-this._owner._rawHeight;
				else if (pivot !=0)
				this._owner.y+=delta *(-pivot);
				break ;
			case 12:
				if (info.percent)
					this._owner.yMin=pos+(this._owner.yMin+this._owner._rawHeight-pos)*delta-this._owner._rawHeight;
				else
				this._owner.y+=delta *(0.5-pivot);
				break ;
			case 13:
				if (info.percent)
					this._owner.yMin=pos+(this._owner.yMin+this._owner._rawHeight-pos)*delta-this._owner._rawHeight;
				else
				this._owner.y+=delta *(1-pivot);
				break ;
			case 14:
				if (this._owner._underConstruct && this._owner==this._target.parent)
					v=this._owner.sourceWidth-this._target.initWidth;
				else
				v=this._owner._rawWidth-this._targetWidth;
				if (info.percent)
					v=v *delta;
				if (this._target==this._owner.parent){
					if (this._owner.pivotAsAnchor){
						tmp=this._owner.xMin;
						this._owner.setSize(this._target._width+v,this._owner._rawHeight,true);
						this._owner.xMin=tmp;
					}
					else
					this._owner.setSize(this._target._width+v,this._owner._rawHeight,true);
				}
				else
				this._owner.width=this._target._width+v;
				break ;
			case 15:
				if (this._owner._underConstruct && this._owner==this._target.parent)
					v=this._owner.sourceHeight-this._target.initHeight;
				else
				v=this._owner._rawHeight-this._targetHeight;
				if (info.percent)
					v=v *delta;
				if (this._target==this._owner.parent){
					if (this._owner.pivotAsAnchor){
						tmp=this._owner.yMin;
						this._owner.setSize(this._owner._rawWidth,this._target._height+v,true);
						this._owner.yMin=tmp;
					}
					else
					this._owner.setSize(this._owner._rawWidth,this._target._height+v,true);
				}
				else
				this._owner.height=this._target._height+v;
				break ;
			case 16:
				tmp=this._owner.xMin;
				if (info.percent)
					v=pos+(tmp-pos)*delta-tmp;
				else
				v=delta *(-pivot);
				this._owner.width=this._owner._rawWidth-v;
				this._owner.xMin=tmp+v;
				break ;
			case 17:
				tmp=this._owner.xMin;
				if (info.percent)
					v=pos+(tmp-pos)*delta-tmp;
				else
				v=delta *(1-pivot);
				this._owner.width=this._owner._rawWidth-v;
				this._owner.xMin=tmp+v;
				break ;
			case 18:
				tmp=this._owner.xMin;
				if (info.percent)
					v=pos+(tmp+this._owner._rawWidth-pos)*delta-(tmp+this._owner._rawWidth);
				else
				v=delta *(-pivot);
				this._owner.width=this._owner._rawWidth+v;
				this._owner.xMin=tmp;
				break ;
			case 19:
				tmp=this._owner.xMin;
				if (info.percent){
					if (this._owner==this._target.parent){
						if (this._owner._underConstruct)
							this._owner.width=pos+this._target._width-this._target._width *pivot+
						(this._owner.sourceWidth-pos-this._target.initWidth+this._target.initWidth *pivot)*delta;
						else
						this._owner.width=pos+(this._owner._rawWidth-pos)*delta;
					}
					else{
						v=pos+(tmp+this._owner._rawWidth-pos)*delta-(tmp+this._owner._rawWidth);
						this._owner.width=this._owner._rawWidth+v;
						this._owner.xMin=tmp;
					}
				}
				else{
					if (this._owner==this._target.parent){
						if (this._owner._underConstruct)
							this._owner.width=this._owner.sourceWidth+(this._target._width-this._target.initWidth)*(1-pivot);
						else
						this._owner.width=this._owner._rawWidth+delta *(1-pivot);
					}
					else{
						v=delta *(1-pivot);
						this._owner.width=this._owner._rawWidth+v;
						this._owner.xMin=tmp;
					}
				}
				break ;
			case 20:
				tmp=this._owner.yMin;
				if (info.percent)
					v=pos+(tmp-pos)*delta-tmp;
				else
				v=delta *(-pivot);
				this._owner.height=this._owner._rawHeight-v;
				this._owner.yMin=tmp+v;
				break ;
			case 21:
				tmp=this._owner.yMin;
				if (info.percent)
					v=pos+(tmp-pos)*delta-tmp;
				else
				v=delta *(1-pivot);
				this._owner.height=this._owner._rawHeight-v;
				this._owner.yMin=tmp+v;
				break ;
			case 22:
				tmp=this._owner.yMin;
				if (info.percent)
					v=pos+(tmp+this._owner._rawHeight-pos)*delta-(tmp+this._owner._rawHeight);
				else
				v=delta *(-pivot);
				this._owner.height=this._owner._rawHeight+v;
				this._owner.yMin=tmp;
				break ;
			case 23:
				tmp=this._owner.yMin;
				if (info.percent){
					if (this._owner==this._target.parent){
						if (this._owner._underConstruct)
							this._owner.height=pos+this._target._height-this._target._height *pivot+
						(this._owner.sourceHeight-pos-this._target.initHeight+this._target.initHeight *pivot)*delta;
						else
						this._owner.height=pos+(this._owner._rawHeight-pos)*delta;
					}
					else{
						v=pos+(tmp+this._owner._rawHeight-pos)*delta-(tmp+this._owner._rawHeight);
						this._owner.height=this._owner._rawHeight+v;
						this._owner.yMin=tmp;
					}
				}
				else{
					if (this._owner==this._target.parent){
						if (this._owner._underConstruct)
							this._owner.height=this._owner.sourceHeight+(this._target._height-this._target.initHeight)*(1-pivot);
						else
						this._owner.height=this._owner._rawHeight+delta *(1-pivot);
					}
					else{
						v=delta *(1-pivot);
						this._owner.height=this._owner._rawHeight+v;
						this._owner.yMin=tmp;
					}
				}
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
		this._targetWidth=this._target._width;
		this._targetHeight=this._target._height;
	}

	__proto.releaseRefTarget=function(target){
		if(target.displayObject==null)
			return;
		target.off("fui_xy_changed",this,this.__targetXYChanged);
		target.off("fui_size_changed",this,this.__targetSizeChanged);
		target.off("fui_size_delay_change",this,this.__targetSizeWillChange);
	}

	__proto.__targetXYChanged=function(target){
		if (this._owner.relations.handling!=null || this._owner.group!=null && this._owner.group._updating){
			this._targetX=this._target.x;
			this._targetY=this._target.y;
			return;
		}
		this._owner.relations.handling=target;
		var ox=this._owner.x;
		var oy=this._owner.y;
		var dx=this._target.x-this._targetX;
		var dy=this._target.y-this._targetY;
		var cnt=this._defs.length;
		for(var i=0;i<cnt;i++){
			this.applyOnXYChanged(this._defs[i],dx,dy);
		}
		this._targetX=this._target.x;
		this._targetY=this._target.y;
		if (ox!=this._owner.x || oy!=this._owner.y){
			ox=this._owner.x-ox;
			oy=this._owner.y-oy;
			this._owner.updateGearFromRelations(1,ox,oy);
			if (this._owner.parent !=null && this._owner.parent._transitions.length > 0){
				cnt=this._owner.parent._transitions.length;
				for(var j=0;j<cnt;j++){
					var trans=this._owner.parent._transitions[j];
					trans.updateFromRelations(this._owner.id,ox,oy);
				}
			}
		}
		this._owner.relations.handling=null;
	}

	__proto.__targetSizeChanged=function(target){
		if (this._owner.relations.handling!=null){
			this._targetWidth=this._target._width;
			this._targetHeight=this._target._height;
			return;
		}
		this._owner.relations.handling=target;
		var ox=this._owner.x;
		var oy=this._owner.y;
		var ow=this._owner._rawWidth;
		var oh=this._owner._rawHeight;
		var cnt=this._defs.length;
		for(var i=0;i<cnt;i++){
			this.applyOnSizeChanged(this._defs[i]);
		}
		this._targetWidth=this._target._width;
		this._targetHeight=this._target._height;
		if (ox!=this._owner.x || oy!=this._owner.y){
			ox=this._owner.x-ox;
			oy=this._owner.y-oy;
			this._owner.updateGearFromRelations(1,ox,oy);
			if (this._owner.parent !=null && this._owner.parent._transitions.length > 0){
				cnt=this._owner.parent._transitions.length;
				for(var j=0;j<cnt;j++){
					var trans=this._owner.parent._transitions[j];
					trans.updateFromRelations(this._owner.id,ox,oy);
				}
			}
		}
		if (ow!=this._owner._rawWidth || oh!=this._owner._rawHeight){
			ow=this._owner._rawWidth-ow;
			oh=this._owner._rawHeight-oh;
			this._owner.updateGearFromRelations(2,ow,oh);
		}
		this._owner.relations.handling=null;
	}

	__proto.__targetSizeWillChange=function(target){
		this._owner.relations.sizeDirty=true;
	}

	__getset(0,__proto,'owner',function(){
		return this._owner;
	});

	__getset(0,__proto,'target',function(){
		return this._target;
		},function(value){
		if(this._target!=value){
			if(this._target)
				this.releaseRefTarget(this._target);
			this._target=value;
			if(this._target)
				this.addRefTarget(this._target);
		}
	});

	__getset(0,__proto,'isEmpty',function(){
		return this._defs.length==0;
	});

	RelationItem.__init$=function(){
		//class RelationDef
		RelationDef=(function(){
			function RelationDef(){
				this.percent=false;
				this.type=0;
				this.axis=0;
			}
			__class(RelationDef,'');
			var __proto=RelationDef.prototype;
			__proto.copyFrom=function(source){
				this.percent=source.percent;
				this.type=source.type;
				this.axis=source.axis;
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

	__proto.onOwnerSizeChanged=function(dWidth,dHeight,applyPivot){
		if (this._items.length==0)
			return;
		var length=this._items.length;
		for (var i=0;i < length;i++){
			var item=this._items[i];
			item.applyOnSelfResized(dWidth,dHeight,applyPivot);
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

	__proto.setup=function(buffer,parentToChild){
		var cnt=buffer.readByte();
		var target;
		for (var i=0;i < cnt;i++){
			var targetIndex=buffer.getInt16();
			if (targetIndex==-1)
				target=this._owner.parent;
			else if (parentToChild)
			target=(this._owner).getChildAt(targetIndex);
			else
			target=this._owner.parent.getChildAt(targetIndex);
			var newItem=new RelationItem(this._owner);
			newItem.target=target;
			this._items.push(newItem);
			var cnt2=buffer.readByte();
			for (var j=0;j < cnt2;j++){
				var rt=buffer.readByte();
				var usePercent=buffer.readBool();
				newItem.internalAdd(rt,usePercent);
			}
		}
	}

	__getset(0,__proto,'empty',function(){
		return this._items.length==0;
	});

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
	ScrollBarDisplayType.Default=0;
	ScrollBarDisplayType.Visible=1;
	ScrollBarDisplayType.Auto=2;
	ScrollBarDisplayType.Hidden=3;
	return ScrollBarDisplayType;
})()


//class fairygui.ScrollPane
var ScrollPane=(function(){
	function ScrollPane(owner){
		this._owner=null;
		this._container=null;
		this._maskContainer=null;
		this._alignContainer=null;
		this._scrollType=0;
		this._scrollStep=0;
		this._mouseWheelStep=0;
		this._decelerationRate=NaN;
		this._scrollBarMargin=null;
		this._bouncebackEffect=false;
		this._touchEffect=false;
		this._scrollBarDisplayAuto=false;
		this._vScrollNone=false;
		this._hScrollNone=false;
		this._needRefresh=false;
		this._refreshBarAxis=null;
		this._displayOnLeft=false;
		this._snapToItem=false;
		this._displayInDemand=false;
		this._mouseWheelEnabled=false;
		this._pageMode=false;
		this._inertiaDisabled=false;
		this._xPos=NaN;
		this._yPos=NaN;
		this._viewSize=null;
		this._contentSize=null;
		this._overlapSize=null;
		this._pageSize=null;
		this._containerPos=null;
		this._beginTouchPos=null;
		this._lastTouchPos=null;
		this._lastTouchGlobalPos=null;
		this._velocity=null;
		this._velocityScale=NaN;
		this._lastMoveTime=NaN;
		this._isHoldAreaDone=false;
		this._aniFlag=0;
		this._scrollBarVisible=false;
		this._loop=0;
		this._headerLockedSize=0;
		this._footerLockedSize=0;
		this._refreshEventDispatching=false;
		this._tweening=0;
		this._tweenTime=null;
		this._tweenDuration=null;
		this._tweenStart=null;
		this._tweenChange=null;
		this._pageController=null;
		this._hzScrollBar=null;
		this._vtScrollBar=null;
		this._header=null;
		this._footer=null;
		this.isDragged=false;
		;
		this._owner=owner;
		this._maskContainer=new Sprite();
		this._owner.displayObject.addChild(this._maskContainer);
		this._container=this._owner._container;
		this._container.pos(0,0);
		this._maskContainer.addChild(this._container);
		this._scrollBarVisible=true;
		this._mouseWheelEnabled=true;
		this._xPos=0;
		this._yPos=0;
		this._aniFlag=0;
		this._footerLockedSize=0;
		this._headerLockedSize=0;
		this._scrollBarMargin=new Margin();
		this._viewSize=new Point();
		this._contentSize=new Point();
		this._pageSize=new Point(1,1);
		this._overlapSize=new Point();
		this._tweenTime=new Point();
		this._tweenStart=new Point();
		this._tweenDuration=new Point();
		this._tweenChange=new Point();
		this._velocity=new Point();
		this._containerPos=new Point();
		this._beginTouchPos=new Point();
		this._lastTouchPos=new Point();
		this._lastTouchGlobalPos=new Point();
		this._scrollStep=UIConfig$1.defaultScrollStep;
		this._mouseWheelStep=this._scrollStep*2;
		this._decelerationRate=UIConfig$1.defaultScrollDecelerationRate;
		this._owner.on("mousedown",this,this.__mouseDown);
		this._owner.on("mousewheel",this,this.__mouseWheel);
	}

	__class(ScrollPane,'fairygui.ScrollPane');
	var __proto=ScrollPane.prototype;
	__proto.setup=function(buffer){
		this._scrollType=buffer.readByte();
		var scrollBarDisplay=buffer.readByte();
		var flags=buffer.getInt32();
		if (buffer.readBool()){
			this._scrollBarMargin.top=buffer.getInt32();
			this._scrollBarMargin.bottom=buffer.getInt32();
			this._scrollBarMargin.left=buffer.getInt32();
			this._scrollBarMargin.right=buffer.getInt32();
		};
		var vtScrollBarRes=buffer.readS();
		var hzScrollBarRes=buffer.readS();
		var headerRes=buffer.readS();
		var footerRes=buffer.readS();
		this._displayOnLeft=(flags & 1)!=0;
		this._snapToItem=(flags & 2)!=0;
		this._displayInDemand=(flags & 4)!=0;
		this._pageMode=(flags & 8)!=0;
		if(flags & 16)
			this._touchEffect=true;
		else if(flags & 32)
		this._touchEffect=false;
		else
		this._touchEffect=UIConfig$1.defaultScrollTouchEffect;
		if(flags & 64)
			this._bouncebackEffect=true;
		else if(flags & 128)
		this._bouncebackEffect=false;
		else
		this._bouncebackEffect=UIConfig$1.defaultScrollBounceEffect;
		this._inertiaDisabled=(flags & 256)!=0;
		if((flags & 512)==0)
			this._maskContainer.scrollRect=new Rectangle();
		if(scrollBarDisplay==0)
			scrollBarDisplay=UIConfig$1.defaultScrollBarDisplay;
		if(scrollBarDisplay !=3){
			if(this._scrollType==2 || this._scrollType==1){
				var res=vtScrollBarRes ? vtScrollBarRes :UIConfig$1.verticalScrollBar;
				if(res){
					this._vtScrollBar=(UIPackage.createObjectFromURL(res));
					if(!this._vtScrollBar)
						throw "cannot create scrollbar from "+res;
					this._vtScrollBar.setScrollPane(this,true);
					this._owner.displayObject.addChild(this._vtScrollBar.displayObject);
				}
			}
			if(this._scrollType==2 || this._scrollType==0){
				res=hzScrollBarRes ? hzScrollBarRes :UIConfig$1.horizontalScrollBar;
				if(res){
					this._hzScrollBar=(UIPackage.createObjectFromURL(res));
					if(!this._hzScrollBar)
						throw "cannot create scrollbar from "+res;
					this._hzScrollBar.setScrollPane(this,false);
					this._owner.displayObject.addChild(this._hzScrollBar.displayObject);
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
		else
		this._mouseWheelEnabled=false;
		if (headerRes){
			this._header=UIPackage.createObjectFromURL(headerRes);
			if (this._header==null)
				throw new Error("FairyGUI: cannot create scrollPane header from "+headerRes);
		}
		if (footerRes){
			this._footer=UIPackage.createObjectFromURL(footerRes);
			if (this._footer==null)
				throw new Error("FairyGUI: cannot create scrollPane footer from "+footerRes);
		}
		if (this._header !=null || this._footer !=null)
			this._refreshBarAxis=(this._scrollType==2 || this._scrollType==1)? "y" :"x";
		this.setSize(this.owner.width,this.owner.height);
	}

	__proto.dispose=function(){
		if (this._tweening !=0)
			Laya.timer.clear(this,this.tweenUpdate);
		this._pageController=null;
		if (this._hzScrollBar !=null)
			this._hzScrollBar.dispose();
		if (this._vtScrollBar !=null)
			this._vtScrollBar.dispose();
		if (this._header !=null)
			this._header.dispose();
		if (this._footer !=null)
			this._footer.dispose();
	}

	__proto.setPercX=function(value,ani){
		(ani===void 0)&& (ani=false);
		this._owner.ensureBoundsCorrect();
		this.setPosX(this._overlapSize.x *ToolSet.clamp01(value),ani);
	}

	__proto.setPercY=function(value,ani){
		(ani===void 0)&& (ani=false);
		this._owner.ensureBoundsCorrect();
		this.setPosY(this._overlapSize.y *ToolSet.clamp01(value),ani);
	}

	__proto.setPosX=function(value,ani){
		(ani===void 0)&& (ani=false);
		this._owner.ensureBoundsCorrect();
		if (this._loop==1)
			value=this.loopCheckingNewPos(value,"x");
		value=ToolSet.clamp(value,0,this._overlapSize.x);
		if (value !=this._xPos){
			this._xPos=value;
			this.posChanged(ani);
		}
	}

	__proto.setPosY=function(value,ani){
		(ani===void 0)&& (ani=false);
		this._owner.ensureBoundsCorrect();
		if (this._loop==1)
			value=this.loopCheckingNewPos(value,"y");
		value=ToolSet.clamp(value,0,this._overlapSize.y);
		if (value !=this._yPos){
			this._yPos=value;
			this.posChanged(ani);
		}
	}

	__proto.setCurrentPageX=function(value,ani){
		if (this._pageMode && this._overlapSize.x>0)
			this.setPosX(value *this._pageSize.x,ani);
	}

	__proto.setCurrentPageY=function(value,ani){
		if (this._pageMode && this._overlapSize.y>0)
			this.setPosY(value *this._pageSize.y,ani);
	}

	__proto.scrollTop=function(ani){
		(ani===void 0)&& (ani=false);
		this.setPercY(0,ani);
	}

	__proto.scrollBottom=function(ani){
		(ani===void 0)&& (ani=false);
		this.setPercY(1,ani);
	}

	__proto.scrollUp=function(ratio,ani){
		(ratio===void 0)&& (ratio=1);
		(ani===void 0)&& (ani=false);
		if (this._pageMode)
			this.setPosY(this._yPos-this._pageSize.y *ratio,ani);
		else
		this.setPosY(this._yPos-this._scrollStep *ratio,ani);;
	}

	__proto.scrollDown=function(ratio,ani){
		(ratio===void 0)&& (ratio=1);
		(ani===void 0)&& (ani=false);
		if (this._pageMode)
			this.setPosY(this._yPos+this._pageSize.y *ratio,ani);
		else
		this.setPosY(this._yPos+this._scrollStep *ratio,ani);
	}

	__proto.scrollLeft=function(ratio,ani){
		(ratio===void 0)&& (ratio=1);
		(ani===void 0)&& (ani=false);
		if (this._pageMode)
			this.setPosX(this._xPos-this._pageSize.x *ratio,ani);
		else
		this.setPosX(this._xPos-this._scrollStep *ratio,ani);
	}

	__proto.scrollRight=function(ratio,ani){
		(ratio===void 0)&& (ratio=1);
		(ani===void 0)&& (ani=false);
		if (this._pageMode)
			this.setPosX(this._xPos+this._pageSize.x *ratio,ani);
		else
		this.setPosX(this._xPos+this._scrollStep *ratio,ani);
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
		if(this._overlapSize.y>0){
			var bottom=this._yPos+this._viewSize.y;
			if(setFirst || rect.y<=this._yPos || rect.height>=this._viewSize.y){
				if(this._pageMode)
					this.setPosY(Math.floor(rect.y/this._pageSize.y)*this._pageSize.y,ani);
				else
				this.setPosY(rect.y,ani);
			}
			else if(rect.y+rect.height>bottom){
				if(this._pageMode)
					this.setPosY(Math.floor(rect.y/this._pageSize.y)*this._pageSize.y,ani);
				else if (rect.height <=this._viewSize.y/2)
				this.setPosY(rect.y+rect.height*2-this._viewSize.y,ani);
				else
				this.setPosY(rect.y+rect.height-this._viewSize.y,ani);
			}
		}
		if(this._overlapSize.x>0){
			var right=this._xPos+this._viewSize.x;
			if(setFirst || rect.x<=this._xPos || rect.width>=this._viewSize.x){
				if(this._pageMode)
					this.setPosX(Math.floor(rect.x/this._pageSize.x)*this._pageSize.x,ani);
				else
				this.setPosX(rect.x,ani);
			}
			else if(rect.x+rect.width>right){
				if(this._pageMode)
					this.setPosX(Math.floor(rect.x/this._pageSize.x)*this._pageSize.x,ani);
				else if (rect.width <=this._viewSize.x/2)
				this.setPosX(rect.x+rect.width*2-this._viewSize.x,ani);
				else
				this.setPosX(rect.x+rect.width-this._viewSize.x,ani);
			}
		}
		if(!ani && this._needRefresh)
			this.refresh();
	}

	__proto.isChildInView=function(obj){
		if(this._overlapSize.y>0){
			var dist=obj.y+this._container.y;
			if(dist<-obj.height || dist>this._viewSize.y)
				return false;
		}
		if(this._overlapSize.x>0){
			dist=obj.x+this._container.x;
			if(dist<-obj.width || dist>this._viewSize.x)
				return false;
		}
		return true;
	}

	__proto.cancelDragging=function(){
		this._owner.displayObject.stage.off("mousemove",this,this.__mouseMove);
		this._owner.displayObject.stage.off("mouseup",this,this.__mouseUp);
		this._owner.displayObject.stage.off("click",this,this.__click);
		if (ScrollPane.draggingPane==this)
			ScrollPane.draggingPane=null;
		ScrollPane._gestureFlag=0;
		this.isDragged=false;
		this._maskContainer.mouseEnabled=true;
	}

	__proto.lockHeader=function(size){
		if (this._headerLockedSize==size)
			return;
		this._headerLockedSize=size;
		if (!this._refreshEventDispatching && this._container[this._refreshBarAxis] >=0){
			this._tweenStart.setTo(this._container.x,this._container.y);
			this._tweenChange.setTo(0,0);
			this._tweenChange[this._refreshBarAxis]=this._headerLockedSize-this._tweenStart[this._refreshBarAxis];
			this._tweenDuration.setTo(0.3,0.3);
			this._tweenTime.setTo(0,0);
			this._tweening=2;
			Laya.timer.frameLoop(1,this,this.tweenUpdate);
		}
	}

	__proto.lockFooter=function(size){
		if (this._footerLockedSize==size)
			return;
		this._footerLockedSize=size;
		if (!this._refreshEventDispatching && this._container[this._refreshBarAxis] <=-this._overlapSize[this._refreshBarAxis]){
			this._tweenStart.setTo(this._container.x,this._container.y);
			this._tweenChange.setTo(0,0);
			var max=this._overlapSize[this._refreshBarAxis];
			if (max==0)
				max=Math.max(this._contentSize[this._refreshBarAxis]+this._footerLockedSize-this._viewSize[this._refreshBarAxis],0);
			else
			max+=this._footerLockedSize;
			this._tweenChange[this._refreshBarAxis]=-max-this._tweenStart[this._refreshBarAxis];
			this._tweenDuration.setTo(0.3,0.3);
			this._tweenTime.setTo(0,0);
			this._tweening=2;
			Laya.timer.frameLoop(1,this,this.tweenUpdate);
		}
	}

	__proto.onOwnerSizeChanged=function(){
		this.setSize(this._owner.width,this._owner.height);
		this.posChanged(false);
	}

	__proto.handleControllerChanged=function(c){
		if (this._pageController==c){
			if (this._scrollType==0)
				this.setCurrentPageX(c.selectedIndex,true);
			else
			this.setCurrentPageY(c.selectedIndex,true);
		}
	}

	__proto.updatePageController=function(){
		if (this._pageController !=null && !this._pageController.changing){
			var index=0;
			if (this._scrollType==0)
				index=this.currentPageX;
			else
			index=this.currentPageY;
			if (index < this._pageController.pageCount){
				var c=this._pageController;
				this._pageController=null;
				c.selectedIndex=index;
				this._pageController=c;
			}
		}
	}

	__proto.adjustMaskContainer=function(){
		var mx=NaN,my=NaN;
		if (this._displayOnLeft && this._vtScrollBar !=null)
			mx=Math.floor(this._owner.margin.left+this._vtScrollBar.width);
		else
		mx=Math.floor(this._owner.margin.left);
		my=Math.floor(this._owner.margin.top);
		this._maskContainer.pos(mx,my);
		if(this._owner._alignOffset.x!=0 || this._owner._alignOffset.y!=0){
			if(this._alignContainer==null){
				this._alignContainer=new Sprite();
				this._maskContainer.addChild(this._alignContainer);
				this._alignContainer.addChild(this._container);
			}
			this._alignContainer.pos(this._owner._alignOffset.x,this._owner._alignOffset.y);
		}
		else if(this._alignContainer){
			this._alignContainer.pos(0,0);
		}
	}

	__proto.setSize=function(aWidth,aHeight){
		this.adjustMaskContainer();
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
		this._viewSize.x=aWidth;
		this._viewSize.y=aHeight;
		if(this._hzScrollBar && !this._hScrollNone)
			this._viewSize.y-=this._hzScrollBar.height;
		if(this._vtScrollBar && !this._vScrollNone)
			this._viewSize.x-=this._vtScrollBar.width;
		this._viewSize.x-=(this._owner.margin.left+this._owner.margin.right);
		this._viewSize.y-=(this._owner.margin.top+this._owner.margin.bottom);
		this._viewSize.x=Math.max(1,this._viewSize.x);
		this._viewSize.y=Math.max(1,this._viewSize.y);
		this._pageSize.x=this._viewSize.x;
		this._pageSize.y=this._viewSize.y;
		this.handleSizeChanged();
	}

	__proto.setContentSize=function(aWidth,aHeight){
		if(this._contentSize.x==aWidth && this._contentSize.y==aHeight)
			return;
		this._contentSize.x=aWidth;
		this._contentSize.y=aHeight;
		this.handleSizeChanged();
	}

	__proto.changeContentSizeOnScrolling=function(deltaWidth,deltaHeight,deltaPosX,deltaPosY){
		var isRightmost=this._xPos==this._overlapSize.x;
		var isBottom=this._yPos==this._overlapSize.y;
		this._contentSize.x+=deltaWidth;
		this._contentSize.y+=deltaHeight;
		this.handleSizeChanged();
		if (this._tweening==1){
			if (deltaWidth !=0 && isRightmost && this._tweenChange.x < 0){
				this._xPos=this._overlapSize.x;
				this._tweenChange.x=-this._xPos-this._tweenStart.x;
			}
			if (deltaHeight !=0 && isBottom && this._tweenChange.y < 0){
				this._yPos=this._overlapSize.y;
				this._tweenChange.y=-this._yPos-this._tweenStart.y;
			}
		}
		else if (this._tweening==2){
			if (deltaPosX !=0){
				this._container.x-=deltaPosX;
				this._tweenStart.x-=deltaPosX;
				this._xPos=-this._container.x;
			}
			if (deltaPosY !=0){
				this._container.y-=deltaPosY;
				this._tweenStart.y-=deltaPosY;
				this._yPos=-this._container.y;
			}
		}
		else if (this.isDragged){
			if (deltaPosX !=0){
				this._container.x-=deltaPosX;
				this._containerPos.x-=deltaPosX;
				this._xPos=-this._container.x;
			}
			if (deltaPosY !=0){
				this._container.y-=deltaPosY;
				this._containerPos.y-=deltaPosY;
				this._yPos=-this._container.y;
			}
		}
		else{
			if (deltaWidth !=0 && isRightmost){
				this._xPos=this._overlapSize.x;
				this._container.x=-this._xPos;
			}
			if (deltaHeight !=0 && isBottom){
				this._yPos=this._overlapSize.y;
				this._container.y=-this._yPos;
			}
		}
		if (this._pageMode)
			this.updatePageController();
	}

	__proto.handleSizeChanged=function(onScrolling){
		(onScrolling===void 0)&& (onScrolling=false);
		if(this._displayInDemand){
			if(this._vtScrollBar){
				if(this._contentSize.y<=this._viewSize.y){
					if(!this._vScrollNone){
						this._vScrollNone=true;
						this._viewSize.x+=this._vtScrollBar.width;
					}
				}
				else{
					if(this._vScrollNone){
						this._vScrollNone=false;
						this._viewSize.x-=this._vtScrollBar.width;
					}
				}
			}
			if(this._hzScrollBar){
				if(this._contentSize.x<=this._viewSize.x){
					if(!this._hScrollNone){
						this._hScrollNone=true;
						this._viewSize.y+=this._hzScrollBar.height;
					}
				}
				else{
					if(this._hScrollNone){
						this._hScrollNone=false;
						this._viewSize.y-=this._hzScrollBar.height;
					}
				}
			}
		}
		if(this._vtScrollBar){
			if(this._viewSize.y<this._vtScrollBar.minSize)
				this._vtScrollBar.displayObject.visible=false;
			else{
				this._vtScrollBar.displayObject.visible=this._scrollBarVisible && !this._vScrollNone;
				if(this._contentSize.y==0)
					this._vtScrollBar.displayPerc=0;
				else
				this._vtScrollBar.displayPerc=Math.min(1,this._viewSize.y/this._contentSize.y);
			}
		}
		if(this._hzScrollBar){
			if(this._viewSize.x<this._hzScrollBar.minSize)
				this._hzScrollBar.displayObject.visible=false;
			else{
				this._hzScrollBar.displayObject.visible=this._scrollBarVisible && !this._hScrollNone;
				if(this._contentSize.x==0)
					this._hzScrollBar.displayPerc=0;
				else
				this._hzScrollBar.displayPerc=Math.min(1,this._viewSize.x/this._contentSize.x);
			}
		};
		var rect=this._maskContainer.scrollRect;
		if (rect){
			rect.width=this._viewSize.x;
			rect.height=this._viewSize.y;
			this._maskContainer.scrollRect=rect;
		}
		if (this._scrollType==0 || this._scrollType==2)
			this._overlapSize.x=Math.ceil(Math.max(0,this._contentSize.x-this._viewSize.x));
		else
		this._overlapSize.x=0;
		if (this._scrollType==1 || this._scrollType==2)
			this._overlapSize.y=Math.ceil(Math.max(0,this._contentSize.y-this._viewSize.y));
		else
		this._overlapSize.y=0;
		this._xPos=ToolSet.clamp(this._xPos,0,this._overlapSize.x);
		this._yPos=ToolSet.clamp(this._yPos,0,this._overlapSize.y);
		if(this._refreshBarAxis!=null){
			var max=this._overlapSize[this._refreshBarAxis];
			if (max==0)
				max=Math.max(this._contentSize[this._refreshBarAxis]+this._footerLockedSize-this._viewSize[this._refreshBarAxis],0);
			else
			max+=this._footerLockedSize;
			if (this._refreshBarAxis=="x"){
				this._container.pos(ToolSet.clamp(this._container.x,-max,this._headerLockedSize),
				ToolSet.clamp(this._container.y,-this._overlapSize.y,0));
			}
			else{
				this._container.pos(ToolSet.clamp(this._container.x,-this._overlapSize.x,0),
				ToolSet.clamp(this._container.y,-max,this._headerLockedSize));
			}
			if (this._header !=null){
				if (this._refreshBarAxis=="x")
					this._header.height=this._viewSize.y;
				else
				this._header.width=this._viewSize.x;
			}
			if (this._footer !=null){
				if (this._refreshBarAxis=="y")
					this._footer.height=this._viewSize.y;
				else
				this._footer.width=this._viewSize.x;
			}
		}
		else{
			this._container.pos(ToolSet.clamp(this._container.x,-this._overlapSize.x,0),
			ToolSet.clamp(this._container.y,-this._overlapSize.y,0));
		}
		this.syncScrollBar(true);
		this.checkRefreshBar();
		if (this._pageMode)
			this.updatePageController();
	}

	__proto.posChanged=function(ani){
		if (this._aniFlag==0)
			this._aniFlag=ani ? 1 :-1;
		else if (this._aniFlag==1 && !ani)
		this._aniFlag=-1;
		this._needRefresh=true;
		Laya.timer.callLater(this,this.refresh);
	}

	__proto.refresh=function(){
		this._needRefresh=false;
		Laya.timer.clear(this,this.refresh);
		if (this._pageMode || this._snapToItem){
			ScrollPane.sEndPos.setTo(-this._xPos,-this._yPos);
			this.alignPosition(ScrollPane.sEndPos,false);
			this._xPos=-ScrollPane.sEndPos.x;
			this._yPos=-ScrollPane.sEndPos.y;
		}
		this.refresh2();
		Events.dispatch("fui_scroll",this._owner.displayObject);
		if (this._needRefresh){
			this._needRefresh=false;
			Laya.timer.clear(this,this.refresh);
			this.refresh2();
		}
		this.syncScrollBar();
		this._aniFlag=0;
	}

	__proto.refresh2=function(){
		if (this._aniFlag==1 && !this.isDragged){
			var posX=NaN;
			var posY=NaN;
			if (this._overlapSize.x > 0)
				posX=-Math.floor(this._xPos);
			else{
				if (this._container.x !=0)
					this._container.x=0;
				posX=0;
			}
			if (this._overlapSize.y > 0)
				posY=-Math.floor(this._yPos);
			else{
				if (this._container.y !=0)
					this._container.y=0;
				posY=0;
			}
			if (posX !=this._container.x || posY !=this._container.y){
				this._tweening=1;
				this._tweenTime.setTo(0,0);
				this._tweenDuration.setTo(0.5,0.5);
				this._tweenStart.setTo(this._container.x,this._container.y);
				this._tweenChange.setTo(posX-this._tweenStart.x,posY-this._tweenStart.y);
				Laya.timer.frameLoop(1,this,this.tweenUpdate);
			}
			else if (this._tweening !=0)
			this.killTween();
		}
		else{
			if (this._tweening !=0)
				this.killTween();
			this._container.pos(Math.floor(-this._xPos),Math.floor(-this._yPos));
			this.loopCheckingCurrent();
		}
		if (this._pageMode)
			this.updatePageController();
	}

	__proto.syncScrollBar=function(end){
		(end===void 0)&& (end=false);
		if (this._vtScrollBar !=null){
			this._vtScrollBar.scrollPerc=this._overlapSize.y==0 ? 0 :ToolSet.clamp(-this._container.y,0,this._overlapSize.y)/ this._overlapSize.y;
			if (this._scrollBarDisplayAuto)
				this.showScrollBar(!end);
		}
		if (this._hzScrollBar !=null){
			this._hzScrollBar.scrollPerc=this._overlapSize.x==0 ? 0 :ToolSet.clamp(-this._container.x,0,this._overlapSize.x)/ this._overlapSize.x;
			if (this._scrollBarDisplayAuto)
				this.showScrollBar(!end);
		}
		if(end)
			this._maskContainer.mouseEnabled=true;
	}

	__proto.__mouseDown=function(){
		if(!this._touchEffect)
			return;
		if(this._tweening!=0){
			this.killTween();
			this.isDragged=true;
		}
		else
		this.isDragged=false;
		var pt=this._owner.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.ScrollPane.sHelperPoint);
		this._containerPos.setTo(this._container.x,this._container.y);
		this._beginTouchPos.setTo(pt.x,pt.y);
		this._lastTouchPos.setTo(pt.x,pt.y);
		this._lastTouchGlobalPos.setTo(Laya.stage.mouseX,Laya.stage.mouseY);
		this._isHoldAreaDone=false;
		this._velocity.setTo(0,0);
		this._velocityScale=1;
		this._lastMoveTime=Laya.timer.currTimer/1000;
		this._owner.displayObject.stage.on("mousemove",this,this.__mouseMove);
		this._owner.displayObject.stage.on("mouseup",this,this.__mouseUp);
		this._owner.displayObject.stage.on("click",this,this.__click);
	}

	__proto.__mouseMove=function(){
		if(!this._touchEffect)
			return;
		if (ScrollPane.draggingPane !=null && ScrollPane.draggingPane !=this || GObject.draggingObject !=null)
			return;
		var sensitivity=UIConfig$1.touchScrollSensitivity;
		var pt=this._owner.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.ScrollPane.sHelperPoint);
		var diff=NaN,diff2=NaN;
		var sv=false,sh=false,st=false;
		if (this._scrollType==1){
			if (!this._isHoldAreaDone){
				ScrollPane._gestureFlag |=1;
				diff=Math.abs(this._beginTouchPos.y-pt.y);
				if (diff < sensitivity)
					return;
				if ((ScrollPane._gestureFlag & 2)!=0){
					diff2=Math.abs(this._beginTouchPos.x-pt.x);
					if (diff < diff2)
						return;
				}
			}
			sv=true;
		}
		else if (this._scrollType==0){
			if (!this._isHoldAreaDone){
				ScrollPane._gestureFlag |=2;
				diff=Math.abs(this._beginTouchPos.x-pt.x);
				if (diff < sensitivity)
					return;
				if ((ScrollPane._gestureFlag & 1)!=0){
					diff2=Math.abs(this._beginTouchPos.y-pt.y);
					if (diff < diff2)
						return;
				}
			}
			sh=true;
		}
		else{
			ScrollPane._gestureFlag=3;
			if (!this._isHoldAreaDone){
				diff=Math.abs(this._beginTouchPos.y-pt.y);
				if (diff < sensitivity){
					diff=Math.abs(this._beginTouchPos.x-pt.x);
					if (diff < sensitivity)
						return;
				}
			}
			sv=sh=true;
		};
		var newPosX=Math.floor(this._containerPos.x+pt.x-this._beginTouchPos.x);
		var newPosY=Math.floor(this._containerPos.y+pt.y-this._beginTouchPos.y);
		if (sv){
			if (newPosY > 0){
				if (!this._bouncebackEffect)
					this._container.y=0;
				else if (this._header !=null && this._header.maxHeight !=0)
				this._container.y=Math.floor(Math.min(newPosY *0.5,this._header.maxHeight));
				else
				this._container.y=Math.floor(Math.min(newPosY *0.5,this._viewSize.y *0.5));
			}
			else if (newPosY <-this._overlapSize.y){
				if (!this._bouncebackEffect)
					this._container.y=-this._overlapSize.y;
				else if (this._footer !=null && this._footer.maxHeight > 0)
				this._container.y=Math.floor(Math.max((newPosY+this._overlapSize.y)*0.5,-this._footer.maxHeight)-this._overlapSize.y);
				else
				this._container.y=Math.floor(Math.max((newPosY+this._overlapSize.y)*0.5,-this._viewSize.y *0.5)-this._overlapSize.y);
			}
			else
			this._container.y=newPosY;
		}
		if (sh){
			if (newPosX > 0){
				if (!this._bouncebackEffect)
					this._container.x=0;
				else if (this._header !=null && this._header.maxWidth !=0)
				this._container.x=Math.floor(Math.min(newPosX *0.5,this._header.maxWidth));
				else
				this._container.x=Math.floor(Math.min(newPosX *0.5,this._viewSize.x *0.5));
			}
			else if (newPosX < 0-this._overlapSize.x){
				if (!this._bouncebackEffect)
					this._container.x=-this._overlapSize.x;
				else if (this._footer !=null && this._footer.maxWidth > 0)
				this._container.x=Math.floor(Math.max((newPosX+this._overlapSize.x)*0.5,-this._footer.maxWidth)-this._overlapSize.x);
				else
				this._container.x=Math.floor(Math.max((newPosX+this._overlapSize.x)*0.5,-this._viewSize.x *0.5)-this._overlapSize.x);
			}
			else
			this._container.x=newPosX;
		};
		var frameRate=Laya.stage.frameRate=="slow"?30:60;
		var now=Laya.timer.currTimer/1000;
		var deltaTime=Math.max(now-this._lastMoveTime,1/frameRate);
		var deltaPositionX=pt.x-this._lastTouchPos.x;
		var deltaPositionY=pt.y-this._lastTouchPos.y;
		if (!sh)
			deltaPositionX=0;
		if (!sv)
			deltaPositionY=0;
		if(deltaTime!=0){
			var elapsed=deltaTime *frameRate-1;
			if (elapsed > 1){
				var factor=Math.pow(0.833,elapsed);
				this._velocity.x=this._velocity.x *factor;
				this._velocity.y=this._velocity.y *factor;
			}
			this._velocity.x=ToolSet.lerp(this._velocity.x,deltaPositionX *60 / frameRate / deltaTime,deltaTime *10);
			this._velocity.y=ToolSet.lerp(this._velocity.y,deltaPositionY *60 / frameRate / deltaTime,deltaTime *10);
		};
		var deltaGlobalPositionX=this._lastTouchGlobalPos.x-Laya.stage.mouseX;
		var deltaGlobalPositionY=this._lastTouchGlobalPos.y-Laya.stage.mouseY;
		if (deltaPositionX !=0)
			this._velocityScale=Math.abs(deltaGlobalPositionX / deltaPositionX);
		else if (deltaPositionY !=0)
		this._velocityScale=Math.abs(deltaGlobalPositionY / deltaPositionY);
		this._lastTouchPos.setTo(pt.x,pt.y);
		this._lastTouchGlobalPos.setTo(Laya.stage.mouseX,Laya.stage.mouseY);
		this._lastMoveTime=now;
		if (this._overlapSize.x > 0)
			this._xPos=ToolSet.clamp(-this._container.x,0,this._overlapSize.x);
		if (this._overlapSize.y > 0)
			this._yPos=ToolSet.clamp(-this._container.y,0,this._overlapSize.y);
		if (this._loop !=0){
			newPosX=this._container.x;
			newPosY=this._container.y;
			if (this.loopCheckingCurrent()){
				this._containerPos.x+=this._container.x-newPosX;
				this._containerPos.y+=this._container.y-newPosY;
			}
		}
		ScrollPane.draggingPane=this;
		this._isHoldAreaDone=true;
		this.isDragged=true;
		this._maskContainer.mouseEnabled=false;
		this.syncScrollBar();
		this.checkRefreshBar();
		if (this._pageMode)
			this.updatePageController();
		Events.dispatch("fui_scroll",this._owner.displayObject);
	}

	__proto.__mouseUp=function(){
		this._owner.displayObject.stage.off("mousemove",this,this.__mouseMove);
		this._owner.displayObject.stage.off("mouseup",this,this.__mouseUp);
		this._owner.displayObject.stage.off("click",this,this.__click);
		if (ScrollPane.draggingPane==this)
			ScrollPane.draggingPane=null;
		ScrollPane._gestureFlag=0;
		if (!this.isDragged || !this._touchEffect){
			this.isDragged=false;
			this._maskContainer.mouseEnabled=true;
			return;
		}
		this.isDragged=false;
		this._maskContainer.mouseEnabled=true;
		this._tweenStart.setTo(this._container.x,this._container.y);
		ScrollPane.sEndPos.setTo(this._tweenStart.x,this._tweenStart.y);
		var flag=false;
		if (this._container.x > 0){
			ScrollPane.sEndPos.x=0;
			flag=true;
		}
		else if (this._container.x <-this._overlapSize.x){
			ScrollPane.sEndPos.x=-this._overlapSize.x;
			flag=true;
		}
		if (this._container.y > 0){
			ScrollPane.sEndPos.y=0;
			flag=true;
		}
		else if (this._container.y <-this._overlapSize.y){
			ScrollPane.sEndPos.y=-this._overlapSize.y;
			flag=true;
		}
		if (flag){
			this._tweenChange.setTo(ScrollPane.sEndPos.x-this._tweenStart.x,ScrollPane.sEndPos.y-this._tweenStart.y);
			if (this._tweenChange.x <-UIConfig$1.touchDragSensitivity || this._tweenChange.y <-UIConfig$1.touchDragSensitivity){
				this._refreshEventDispatching=true;
				Events.dispatch("fui_pull_down_release",this._owner.displayObject);
				this._refreshEventDispatching=false;
			}
			else if (this._tweenChange.x > UIConfig$1.touchDragSensitivity || this._tweenChange.y > UIConfig$1.touchDragSensitivity){
				this._refreshEventDispatching=true;
				Events.dispatch("fui_pull_up_release",this._owner.displayObject);
				this._refreshEventDispatching=false;
			}
			if (this._headerLockedSize > 0 && ScrollPane.sEndPos[this._refreshBarAxis]==0){
				ScrollPane.sEndPos[this._refreshBarAxis]=this._headerLockedSize;
				this._tweenChange.x=ScrollPane.sEndPos.x-this._tweenStart.x;
				this._tweenChange.y=ScrollPane.sEndPos.y-this._tweenStart.y;
			}
			else if (this._footerLockedSize > 0 && ScrollPane.sEndPos[this._refreshBarAxis]==-this._overlapSize[this._refreshBarAxis]){
				var max=this._overlapSize[this._refreshBarAxis];
				if (max==0)
					max=Math.max(this._contentSize[this._refreshBarAxis]+this._footerLockedSize-this._viewSize[this._refreshBarAxis],0);
				else
				max+=this._footerLockedSize;
				ScrollPane.sEndPos[this._refreshBarAxis]=-max;
				this._tweenChange.x=ScrollPane.sEndPos.x-this._tweenStart.x;
				this._tweenChange.y=ScrollPane.sEndPos.y-this._tweenStart.y;
			}
			this._tweenDuration.setTo(0.3,0.3);
		}
		else{
			if (!this._inertiaDisabled){
				var frameRate=Laya.stage.frameRate=="slow"?30:60;
				var elapsed=(Laya.timer.currTimer/1000-this._lastMoveTime)*frameRate-1;
				if (elapsed > 1){
					var factor=Math.pow(0.833,elapsed);
					this._velocity.x=this._velocity.x *factor;
					this._velocity.y=this._velocity.y *factor;
				}
				this.updateTargetAndDuration(this._tweenStart,ScrollPane.sEndPos);
			}
			else
			this._tweenDuration.setTo(0.3,0.3);
			ScrollPane.sOldChange.setTo(ScrollPane.sEndPos.x-this._tweenStart.x,ScrollPane.sEndPos.y-this._tweenStart.y);
			this.loopCheckingTarget(ScrollPane.sEndPos);
			if (this._pageMode || this._snapToItem)
				this.alignPosition(ScrollPane.sEndPos,true);
			this._tweenChange.x=ScrollPane.sEndPos.x-this._tweenStart.x;
			this._tweenChange.y=ScrollPane.sEndPos.y-this._tweenStart.y;
			if (this._tweenChange.x==0 && this._tweenChange.y==0){
				if (this._scrollBarDisplayAuto)
					this.showScrollBar(false);
				return;
			}
			if (this._pageMode || this._snapToItem){
				this.fixDuration("x",ScrollPane.sOldChange.x);
				this.fixDuration("y",ScrollPane.sOldChange.y);
			}
		}
		this._tweening=2;
		this._tweenTime.setTo(0,0);
		Laya.timer.frameLoop(1,this,this.tweenUpdate);
	}

	__proto.__click=function(){
		this.isDragged=false;
	}

	__proto.__mouseWheel=function(evt){
		if(!this._mouseWheelEnabled)
			return;
		var pt=this._owner.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.ScrollPane.sHelperPoint);
		var delta=evt["delta"];
		delta=delta>0?-1:(delta<0?1:0);
		if (this._overlapSize.x > 0 && this._overlapSize.y==0){
			if (this._pageMode)
				this.setPosX(this._xPos+this._pageSize.x *delta,false);
			else
			this.setPosX(this._xPos+this._mouseWheelStep *delta,false);
		}
		else {
			if (this._pageMode)
				this.setPosY(this._yPos+this._pageSize.y *delta,false);
			else
			this.setPosY(this._yPos+this._mouseWheelStep *delta,false);
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
		this._scrollBarVisible=val && this._viewSize.x>0 && this._viewSize.y>0;
		if (this._vtScrollBar)
			this._vtScrollBar.displayObject.visible=this._scrollBarVisible && !this._vScrollNone;
		if (this._hzScrollBar)
			this._hzScrollBar.displayObject.visible=this._scrollBarVisible && !this._hScrollNone;
	}

	__proto.getLoopPartSize=function(division,axis){
		return (this._contentSize[axis]+(axis=="x" ? (this._owner).columnGap :(this._owner).lineGap))/ division;
	}

	__proto.loopCheckingCurrent=function(){
		var changed=false;
		if (this._loop==1 && this._overlapSize.x > 0){
			if (this._xPos < 0.001){
				this._xPos+=this.getLoopPartSize(2,"x");
				changed=true;
			}
			else if (this._xPos >=this._overlapSize.x){
				this._xPos-=this.getLoopPartSize(2,"x");
				changed=true;
			}
		}
		else if (this._loop==2 && this._overlapSize.y > 0){
			if (this._yPos < 0.001){
				this._yPos+=this.getLoopPartSize(2,"y");
				changed=true;
			}
			else if (this._yPos >=this._overlapSize.y){
				this._yPos-=this.getLoopPartSize(2,"y");
				changed=true;
			}
		}
		if (changed)
			this._container.pos(Math.floor(-this._xPos),Math.floor(-this._yPos));
		return changed;
	}

	__proto.loopCheckingTarget=function(endPos){
		if (this._loop==1)
			this.loopCheckingTarget2(endPos,"x");
		if (this._loop==2)
			this.loopCheckingTarget2(endPos,"y");
	}

	__proto.loopCheckingTarget2=function(endPos,axis){
		var halfSize=NaN;
		var tmp=NaN;
		if (endPos[axis] > 0){
			halfSize=this.getLoopPartSize(2,axis);
			tmp=this._tweenStart[axis]-halfSize;
			if (tmp <=0 && tmp >=-this._overlapSize[axis]){
				endPos[axis]-=halfSize;
				this._tweenStart[axis]=tmp;
			}
		}
		else if (endPos[axis] <-this._overlapSize[axis]){
			halfSize=this.getLoopPartSize(2,axis);
			tmp=this._tweenStart[axis]+halfSize;
			if (tmp <=0 && tmp >=-this._overlapSize[axis]){
				endPos[axis]+=halfSize;
				this._tweenStart[axis]=tmp;
			}
		}
	}

	__proto.loopCheckingNewPos=function(value,axis){
		if (this._overlapSize[axis]==0)
			return value;
		var pos=axis=="x" ? this._xPos :this._yPos;
		var changed=false;
		var v=NaN;
		if (value < 0.001){
			value+=this.getLoopPartSize(2,axis);
			if (value > pos){
				v=this.getLoopPartSize(6,axis);
				v=Math.ceil((value-pos)/ v)*v;
				pos=ToolSet.clamp(pos+v,0,this._overlapSize[axis]);
				changed=true;
			}
		}
		else if (value >=this._overlapSize[axis]){
			value-=this.getLoopPartSize(2,axis);
			if (value < pos){
				v=this.getLoopPartSize(6,axis);
				v=Math.ceil((pos-value)/ v)*v;
				pos=ToolSet.clamp(pos-v,0,this._overlapSize[axis]);
				changed=true;
			}
		}
		if (changed){
			if (axis=="x")
				this._container.x=-Math.floor(pos);
			else
			this._container.y=-Math.floor(pos);
		}
		return value;
	}

	__proto.alignPosition=function(pos,inertialScrolling){
		if (this._pageMode){
			pos.x=this.alignByPage(pos.x,"x",inertialScrolling);
			pos.y=this.alignByPage(pos.y,"y",inertialScrolling);
		}
		else if (this._snapToItem){
			var pt=this._owner.getSnappingPosition(-pos.x,-pos.y,ScrollPane.sHelperPoint);
			if (pos.x < 0 && pos.x >-this._overlapSize.x)
				pos.x=-pt.x;
			if (pos.y < 0 && pos.y >-this._overlapSize.y)
				pos.y=-pt.y;
		}
	}

	__proto.alignByPage=function(pos,axis,inertialScrolling){
		var page=0;
		if (pos > 0)
			page=0;
		else if (pos <-this._overlapSize[axis])
		page=Math.ceil(this._contentSize[axis] / this._pageSize[axis])-1;
		else{
			page=Math.floor(-pos / this._pageSize[axis]);
			var change=inertialScrolling ? (pos-this._containerPos[axis]):(pos-this._container[axis]);
			var testPageSize=Math.min(this._pageSize[axis],this._contentSize[axis]-(page+1)*this._pageSize[axis]);
			var delta=-pos-page *this._pageSize[axis];
			if (Math.abs(change)> this._pageSize[axis]){
				if (delta > testPageSize *0.5)
					page++;
			}
			else{
				if (delta > testPageSize *(change < 0 ? 0.3 :0.7))
					page++;
			}
			pos=-page *this._pageSize[axis];
			if (pos <-this._overlapSize[axis])
				pos=-this._overlapSize[axis];
		}
		if (inertialScrolling){
			var oldPos=this._tweenStart[axis];
			var oldPage=0;
			if (oldPos > 0)
				oldPage=0;
			else if (oldPos <-this._overlapSize[axis])
			oldPage=Math.ceil(this._contentSize[axis] / this._pageSize[axis])-1;
			else
			oldPage=Math.floor(-oldPos / this._pageSize[axis]);
			var startPage=Math.floor(-this._containerPos[axis] / this._pageSize[axis]);
			if (Math.abs(page-startPage)> 1 && Math.abs(oldPage-startPage)<=1){
				if (page > startPage)
					page=startPage+1;
				else
				page=startPage-1;
				pos=-page *this._pageSize[axis];
			}
		}
		return pos;
	}

	__proto.updateTargetAndDuration=function(orignPos,resultPos){
		resultPos.x=this.updateTargetAndDuration2(orignPos.x,"x");
		resultPos.y=this.updateTargetAndDuration2(orignPos.y,"y");
	}

	__proto.updateTargetAndDuration2=function(pos,axis){
		var v=this._velocity[axis];
		var duration=0;
		if (pos > 0)
			pos=0;
		else if (pos <-this._overlapSize[axis])
		pos=-this._overlapSize[axis];
		else{
			var v2=Math.abs(v)*this._velocityScale;
			if(Browser.onMobile)
				v2 *=1136 / Math.max(Laya.stage.width,Laya.stage.height);
			var ratio=0;
			if (this._pageMode || !Browser.onMobile){
				if (v2 > 500)
					ratio=Math.pow((v2-500)/ 500,2);
			}
			else{
				if (v2 > 1000)
					ratio=Math.pow((v2-1000)/ 1000,2);
			}
			if (ratio !=0){
				if (ratio > 1)
					ratio=1;
				v2 *=ratio;
				v *=ratio;
				this._velocity[axis]=v;
				duration=Math.log(60 / v2)/Math.log(this._decelerationRate)/ 60;
				var change=Math.floor(v *duration *0.4);
				pos+=change;
			}
		}
		if (duration < 0.3)
			duration=0.3;
		this._tweenDuration[axis]=duration;
		return pos;
	}

	__proto.fixDuration=function(axis,oldChange){
		if (this._tweenChange[axis]==0 || Math.abs(this._tweenChange[axis])>=Math.abs(oldChange))
			return;
		var newDuration=Math.abs(this._tweenChange[axis] / oldChange)*this._tweenDuration[axis];
		if (newDuration < 0.3)
			newDuration=0.3;
		this._tweenDuration[axis]=newDuration;
	}

	__proto.killTween=function(){
		if (this._tweening==1){
			this._container.pos(this._tweenStart.x+this._tweenChange.x,this._tweenStart.y+this._tweenChange.y);
			Events.dispatch("fui_scroll",this._owner.displayObject);
		}
		this._tweening=0;
		Laya.timer.clear(this,this.tweenUpdate);
		Events.dispatch("fui_scroll_end",this._owner.displayObject);
	}

	__proto.checkRefreshBar=function(){
		if (this._header==null && this._footer==null)
			return;
		var pos=this._container[this._refreshBarAxis];
		if (this._header !=null){
			if (pos > 0){
				if (this._header.displayObject.parent==null)
					this._maskContainer.addChildAt(this._header.displayObject,0);
				var pt=ScrollPane.sHelperPoint;
				pt.setTo(this._header.width,this._header.height);
				pt[this._refreshBarAxis]=pos;
				this._header.setSize(pt.x,pt.y);
			}
			else{
				if (this._header.displayObject.parent !=null)
					this._maskContainer.removeChild(this._header.displayObject);
			}
		}
		if (this._footer !=null){
			var max=this._overlapSize[this._refreshBarAxis];
			if (pos <-max || max==0 && this._footerLockedSize > 0){
				if (this._footer.displayObject.parent==null)
					this._maskContainer.addChildAt(this._footer.displayObject,0);
				pt=ScrollPane.sHelperPoint;
				pt.setTo(this._footer.x,this._footer.y);
				if (max > 0)
					pt[this._refreshBarAxis]=pos+this._contentSize[this._refreshBarAxis];
				else
				pt[this._refreshBarAxis]=Math.max(Math.min(pos+this._viewSize[this._refreshBarAxis],this._viewSize[this._refreshBarAxis]-this._footerLockedSize),
				this._viewSize[this._refreshBarAxis]-this._contentSize[this._refreshBarAxis]);
				this._footer.setXY(pt.x,pt.y);
				pt.setTo(this._footer.width,this._footer.height);
				if (max > 0)
					pt[this._refreshBarAxis]=-max-pos;
				else
				pt[this._refreshBarAxis]=this._viewSize[this._refreshBarAxis]-this._footer[this._refreshBarAxis];
				this._footer.setSize(pt.x,pt.y);
			}
			else{
				if (this._footer.displayObject.parent !=null)
					this._maskContainer.removeChild(this._footer.displayObject);
			}
		}
	}

	__proto.tweenUpdate=function(){
		var nx=this.runTween("x");
		var ny=this.runTween("y");
		this._container.pos(nx,ny);
		if (this._tweening==2){
			if (this._overlapSize.x > 0)
				this._xPos=ToolSet.clamp(-nx,0,this._overlapSize.x);
			if (this._overlapSize.y > 0)
				this._yPos=ToolSet.clamp(-ny,0,this._overlapSize.y);
			if (this._pageMode)
				this.updatePageController();
		}
		if (this._tweenChange.x==0 && this._tweenChange.y==0){
			this._tweening=0;
			Laya.timer.clear(this,this.tweenUpdate);
			this.loopCheckingCurrent();
			this.syncScrollBar(true);
			this.checkRefreshBar();
			Events.dispatch("fui_scroll",this._owner.displayObject);
			Events.dispatch("fui_scroll_end",this._owner.displayObject);
		}
		else{
			this.syncScrollBar(false);
			this.checkRefreshBar();
			Events.dispatch("fui_scroll",this._owner.displayObject);
		}
	}

	__proto.runTween=function(axis){
		var newValue=NaN;
		if (this._tweenChange[axis] !=0){
			this._tweenTime[axis]+=Laya.timer.delta/1000;
			if (this._tweenTime[axis] >=this._tweenDuration[axis]){
				newValue=this._tweenStart[axis]+this._tweenChange[axis];
				this._tweenChange[axis]=0;
			}
			else{
				var ratio=ScrollPane.easeFunc(this._tweenTime[axis],this._tweenDuration[axis]);
				newValue=this._tweenStart[axis]+Math.floor(this._tweenChange[axis] *ratio);
			};
			var threshold1=0;
			var threshold2=-this._overlapSize[axis];
			if (this._headerLockedSize > 0 && this._refreshBarAxis==axis)
				threshold1=this._headerLockedSize;
			if (this._footerLockedSize > 0 && this._refreshBarAxis==axis){
				var max=this._overlapSize[this._refreshBarAxis];
				if (max==0)
					max=Math.max(this._contentSize[this._refreshBarAxis]+this._footerLockedSize-this._viewSize[this._refreshBarAxis],0);
				else
				max+=this._footerLockedSize;
				threshold2=-max;
			}
			if (this._tweening==2 && this._bouncebackEffect){
				if (newValue > 20+threshold1 && this._tweenChange[axis] > 0
					|| newValue > threshold1 && this._tweenChange[axis]==0){
					this._tweenTime[axis]=0;
					this._tweenDuration[axis]=0.3;
					this._tweenChange[axis]=-newValue+threshold1;
					this._tweenStart[axis]=newValue;
				}
				else if (newValue < threshold2-20 && this._tweenChange[axis] < 0
				|| newValue < threshold2 && this._tweenChange[axis]==0){
					this._tweenTime[axis]=0;
					this._tweenDuration[axis]=0.3;
					this._tweenChange[axis]=threshold2-newValue;
					this._tweenStart[axis]=newValue;
				}
			}
			else{
				if (newValue > threshold1){
					newValue=threshold1;
					this._tweenChange[axis]=0;
				}
				else if (newValue < threshold2){
					newValue=threshold2;
					this._tweenChange[axis]=0;
				}
			}
		}
		else
		newValue=this._container[axis];
		return newValue;
	}

	__getset(0,__proto,'viewWidth',function(){
		return this._viewSize.x;
		},function(value){
		value=value+this._owner.margin.left+this._owner.margin.right;
		if (this._vtScrollBar !=null)
			value+=this._vtScrollBar.width;
		this._owner.width=value;
	});

	__getset(0,__proto,'percY',function(){
		return this._overlapSize.y==0 ? 0 :this._yPos / this._overlapSize.y;
		},function(value){
		this.setPercY(value,false);
	});

	__getset(0,__proto,'owner',function(){
		return this._owner;
	});

	__getset(0,__proto,'bouncebackEffect',function(){
		return this._bouncebackEffect;
		},function(sc){
		this._bouncebackEffect=sc;
	});

	__getset(0,__proto,'vtScrollBar',function(){
		return this._vtScrollBar;
	});

	__getset(0,__proto,'hzScrollBar',function(){
		return this._hzScrollBar;
	});

	__getset(0,__proto,'header',function(){
		return this._header;
	});

	__getset(0,__proto,'footer',function(){
		return this._footer;
	});

	__getset(0,__proto,'isBottomMost',function(){
		return this._yPos==this._overlapSize.y || this._overlapSize.y==0;
	});

	__getset(0,__proto,'touchEffect',function(){
		return this._touchEffect;
		},function(sc){
		this._touchEffect=sc;
	});

	__getset(0,__proto,'contentWidth',function(){
		return this._contentSize.x;
	});

	__getset(0,__proto,'scrollStep',function(){
		return this._scrollStep;
		},function(val){
		this._scrollStep=val;
		if(this._scrollStep==0)
			this._scrollStep=UIConfig$1.defaultScrollStep;
		this._mouseWheelStep=this._scrollStep*2;
	});

	__getset(0,__proto,'viewHeight',function(){
		return this._viewSize.y;
		},function(value){
		value=value+this._owner.margin.top+this._owner.margin.bottom;
		if (this._hzScrollBar !=null)
			value+=this._hzScrollBar.height;
		this._owner.height=value;
	});

	__getset(0,__proto,'posX',function(){
		return this._xPos;
		},function(value){
		this.setPosX(value,false);
	});

	__getset(0,__proto,'snapToItem',function(){
		return this._snapToItem;
		},function(value){
		this._snapToItem=value;
	});

	__getset(0,__proto,'mouseWheelEnabled',function(){
		return this._mouseWheelEnabled;
		},function(value){
		this._mouseWheelEnabled=value;
	});

	__getset(0,__proto,'decelerationRate',function(){
		return this._decelerationRate;
		},function(value){
		this._decelerationRate=value;
	});

	__getset(0,__proto,'percX',function(){
		return this._overlapSize.x==0 ? 0 :this._xPos / this._overlapSize.x;
		},function(value){
		this.setPercX(value,false);
	});

	__getset(0,__proto,'posY',function(){
		return this._yPos;
		},function(value){
		this.setPosY(value,false);
	});

	__getset(0,__proto,'contentHeight',function(){
		return this._contentSize.y;
	});

	__getset(0,__proto,'currentPageX',function(){
		if (!this._pageMode)
			return 0;
		var page=Math.floor(this._xPos / this._pageSize.x);
		if (this._xPos-page *this._pageSize.x > this._pageSize.x *0.5)
			page++;
		return page;
		},function(value){
		this.setCurrentPageX(value,false);
	});

	__getset(0,__proto,'currentPageY',function(){
		if (!this._pageMode)
			return 0;
		var page=Math.floor(this._yPos / this._pageSize.y);
		if (this._yPos-page *this._pageSize.y > this._pageSize.y *0.5)
			page++;
		return page;
		},function(value){
		this.setCurrentPageY(value,false);
	});

	__getset(0,__proto,'isRightMost',function(){
		return this._xPos==this._overlapSize.x || this._overlapSize.x==0;
	});

	__getset(0,__proto,'pageController',function(){
		return this._pageController;
		},function(value){
		this._pageController=value;
	});

	__getset(0,__proto,'scrollingPosX',function(){
		return ToolSet.clamp(-this._container.x,0,this._overlapSize.x);
	});

	__getset(0,__proto,'scrollingPosY',function(){
		return ToolSet.clamp(-this._container.y,0,this._overlapSize.y);
	});

	ScrollPane.easeFunc=function(t,d){
		return (t=t / d-1)*t *t+1;
	}

	ScrollPane.draggingPane=null;
	ScrollPane._gestureFlag=0;
	ScrollPane.TWEEN_TIME_GO=0.5;
	ScrollPane.TWEEN_TIME_DEFAULT=0.3;
	ScrollPane.PULL_RATIO=0.5;
	__static(ScrollPane,
	['sHelperPoint',function(){return this.sHelperPoint=new Point();},'sHelperRect',function(){return this.sHelperRect=new Rectangle();},'sEndPos',function(){return this.sEndPos=new Point();},'sOldChange',function(){return this.sOldChange=new Point();}
	]);
	return ScrollPane;
})()


//class fairygui.ScrollType
var ScrollType=(function(){
	function ScrollType(){}
	__class(ScrollType,'fairygui.ScrollType');
	ScrollType.Horizontal=0;
	ScrollType.Vertical=1;
	ScrollType.Both=2;
	return ScrollType;
})()


//class fairygui.Transition
var Transition=(function(){
	var TransitionActionType,TransitionItem,TweenConfig,TValue_Visible,TValue_Animation,TValue_Sound,TValue_Transition,TValue_Shake,TValue_Text,TValue;
	function Transition(owner){
		this.name=null;
		this._owner=null;
		this._ownerBaseX=NaN;
		this._ownerBaseY=NaN;
		this._items=null;
		this._totalTimes=0;
		this._totalTasks=0;
		this._playing=false;
		this._paused=false;
		this._onComplete=null;
		this._options=0;
		this._reversed=false;
		this._totalDuration=NaN;
		this._autoPlay=false;
		this._autoPlayTimes=0;
		this._autoPlayDelay=NaN;
		this._timeScale=NaN;
		this._startTime=NaN;
		this._endTime=NaN;
		this.OPTION_IGNORE_DISPLAY_CONTROLLER=1;
		this.OPTION_AUTO_STOP_DISABLED=2;
		this.OPTION_AUTO_STOP_AT_END=4;
		this._owner=owner;
		this._items=[];
		this._totalDuration=0;
		this._autoPlayTimes=1;
		this._autoPlayDelay=0;
		this._timeScale=1;
		this._startTime=0;
		this._endTime=0;
	}

	__class(Transition,'fairygui.Transition');
	var __proto=Transition.prototype;
	__proto.play=function(onComplete,times,delay,startTime,endTime){
		(times===void 0)&& (times=1);
		(delay===void 0)&& (delay=0);
		(startTime===void 0)&& (startTime=0);
		(endTime===void 0)&& (endTime=-1);
		this._play(onComplete,times,delay,startTime,endTime,false);
	}

	__proto.playReverse=function(onComplete,times,delay,startTime,endTime){
		(times===void 0)&& (times=1);
		(delay===void 0)&& (delay=0);
		(startTime===void 0)&& (startTime=0);
		(endTime===void 0)&& (endTime=-1);
		this._play(onComplete,1,delay,startTime,endTime,true);
	}

	__proto.changePlayTimes=function(value){
		this._totalTimes=value;
	}

	__proto.setAutoPlay=function(value,times,delay){
		(times===void 0)&& (times=1);
		(delay===void 0)&& (delay=0);
		if (this._autoPlay !=value){
			this._autoPlay=value;
			this._autoPlayTimes=times;
			this._autoPlayDelay=delay;
			if (this._autoPlay){
				if (this._owner.onStage)
					this.play(null,null,this._autoPlayTimes,this._autoPlayDelay);
			}
			else{
				if (!this._owner.onStage)
					this.stop(false,true);
			}
		}
	}

	__proto._play=function(onComplete,times,delay,startTime,endTime,reversed){
		(times===void 0)&& (times=1);
		(delay===void 0)&& (delay=0);
		(startTime===void 0)&& (startTime=0);
		(endTime===void 0)&& (endTime=-1);
		(reversed===void 0)&& (reversed=false);
		this.stop(true,true);
		this._totalTimes=times;
		this._reversed=reversed;
		this._startTime=startTime;
		this._endTime=endTime;
		this._playing=true;
		this._paused=false;
		this._onComplete=onComplete;
		var cnt=this._items.length;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			if(item.target==null){
				if (item.targetId)
					item.target=this._owner.getChildById(item.targetId);
				else
				item.target=this._owner;
			}
			else if (item.target !=this._owner && item.target.parent !=this._owner)
			item.target=null;
			if (item.target !=null && item.type==10){
				var trans=(item.target).getTransition(item.value.transName);
				if(trans==this)
					trans=null;
				if (trans !=null){
					if (item.value.playTimes==0){
						var j=0;
						for (j=i-1;j >=0;j--){
							var item2=this._items[j];
							if (item2.type==10){
								if (item2.value.trans==trans){
									item2.value.stopTime=item.time-item2.time;
									break ;
								}
							}
						}
						if(j<0)
							item.value.stopTime=0;
						else
						trans=null;
					}
					else
					item.value.stopTime=-1;
				}
				item.value.trans=trans;
			}
		}
		if(delay==0)
			this.onDelayedPlay();
		else
		GTween.delayedCall(delay).onComplete(this.onDelayedPlay,this);
	}

	__proto.stop=function(setToComplete,processCallback){
		(setToComplete===void 0)&& (setToComplete=true);
		(processCallback===void 0)&& (processCallback=false);
		if (!this._playing)
			return;
		this._playing=false;
		this._totalTasks=0;
		this._totalTimes=0;
		var handler=this._onComplete;
		this._onComplete=null;
		GTween.kill(this);
		var cnt=this._items.length;
		if(this._reversed){
			for (var i=cnt-1;i >=0;i--){
				var item=this._items[i];
				if(item.target==null)
					continue ;
				this.stopItem(item,setToComplete);
			}
		}
		else{
			for (i=0;i < cnt;i++){
				item=this._items[i];
				if(item.target==null)
					continue ;
				this.stopItem(item,setToComplete);
			}
		}
		if (processCallback && handler !=null){
			handler.run();
		}
	}

	__proto.stopItem=function(item,setToComplete){
		if (item.displayLockToken!=0){
			item.target.releaseDisplayLock(item.displayLockToken);
			item.displayLockToken=0;
		}
		if (item.tweener !=null){
			item.tweener.kill(setToComplete);
			item.tweener=null;
			if (item.type==11 && !setToComplete){
				item.target._gearLocked=true;
				item.target.setXY(item.target.x-item.value.lastOffsetX,item.target.y-item.value.lastOffsetY);
				item.target._gearLocked=false;
			}
		}
		if (item.type==10){
			var trans=item.value.trans;
			if (trans !=null)
				trans.stop(setToComplete,false);
		}
	}

	__proto.setPaused=function(paused){
		if (!this._playing || this._paused==paused)
			return;
		this._paused=paused;
		var tweener=GTween.getTween(this);
		if (tweener !=null)
			tweener.setPaused(paused);
		var cnt=this._items.length;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			if (item.target==null)
				continue ;
			if (item.type==10){
				if (item.value.trans !=null)
					item.value.trans.setPaused(paused);
			}
			else if (item.type==7){
				if (paused){
					item.value.flag=(item.target).playing;
					(item.target).playing=false;
				}
				else
				(item.target).playing=item.value.flag;
			}
			if (item.tweener !=null)
				item.tweener.setPaused(paused);
		}
	}

	__proto.dispose=function(){
		if(this._playing)
			GTween.kill(this);
		var cnt=this._items.length;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			if (item.tweener !=null){
				item.tweener.kill();
				item.tweener=null;
			}
			item.target=null;
			item.hook=null;
			if (item.tweenConfig !=null)
				item.tweenConfig.endHook=null;
		}
		this._items.length=0;
		this._playing=false;
		this._onComplete=null;
	}

	__proto.setValue=function(label,__args){
		var args=[];for(var i=1,sz=arguments.length;i<sz;i++)args.push(arguments[i]);
		var cnt=this._items.length;
		var value;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			if (item.label==label){
				if (item.tweenConfig !=null)
					value=item.tweenConfig.startValue;
				else
				value=item.value;
			}
			else if (item.tweenConfig !=null && item.tweenConfig.endLabel==label){
				value=item.tweenConfig.endValue;
			}
			else
			continue ;
			switch (item.type){
				case 0:
				case 1:
				case 3:
				case 2:
				case 13:
					value.b1=true;
					value.b2=true;
					value.f1=parseFloat(args[0]);
					value.f2=parseFloat(args[1]);
					break ;
				case 4:
					value.f1=parseFloat(args[0]);
					break ;
				case 5:
					value.f1=parseFloat(args[0]);
					break ;
				case 6:
					value.f1=parseFloat(args[0]);
					break ;
				case 7:
					value.frame=parseInt(args[0]);
					if (args.length > 1)
						value.playing=args[1];
					break ;
				case 8:
					value.visible=args[0];
					break ;
				case 9:
					value.sound=args[0];
					if(args.length > 1)
						value.volume=parseFloat(args[1]);
					break ;
				case 10:
					value.transName=args[0];
					if (args.length > 1)
						value.playTimes=parseInt(args[1]);
					break ;
				case 11:
					value.amplitude=parseFloat(args[0]);
					if (args.length > 1)
						value.duration=parseFloat(args[1]);
					break ;
				case 12:
					value.f1=parseFloat(args[0]);
					value.f2=parseFloat(args[1]);
					value.f3=parseFloat(args[2]);
					value.f4=parseFloat(args[3]);
					break ;
				case 14:
				case 15:
					value.text=args[0];
					break ;
				}
		}
	}

	__proto.setHook=function(label,callback){
		var cnt=this._items.length;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			if (item.label==label){
				item.hook=callback;
				break ;
			}
			else if (item.tweenConfig !=null && item.tweenConfig.endLabel==label){
				item.tweenConfig.endHook=callback;
				break ;
			}
		}
	}

	__proto.clearHooks=function(){
		var cnt=this._items.length;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			item.hook=null;
			if (item.tweenConfig !=null)
				item.tweenConfig.endHook=null;
		}
	}

	__proto.setTarget=function(label,newTarget){
		var cnt=this._items.length;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			if (item.label==label){
				item.targetId=newTarget.id;
				item.target=null;
			}
		}
	}

	__proto.setDuration=function(label,value){
		var cnt=this._items.length;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			if (item.tweenConfig !=null && item.label==label)
				item.tweenConfig.duration=value;
		}
	}

	__proto.getLabelTime=function(label){
		var cnt=this._items.length;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			if (item.label==label)
				return item.time;
			else if (item.tweenConfig !=null && item.tweenConfig.endLabel==label)
			return item.time+item.tweenConfig.duration;
		}
		return Number.NaN;
	}

	__proto.updateFromRelations=function(targetId,dx,dy){
		var cnt=this._items.length;
		if (cnt==0)
			return;
		for (var i=0;i < cnt;i++){
			var item=this._items[i];
			if (item.type==0 && item.targetId==targetId){
				if (item.tweenConfig!=null){
					item.tweenConfig.startValue.f1+=dx;
					item.tweenConfig.startValue.f2+=dy;
					item.tweenConfig.endValue.f1+=dx;
					item.tweenConfig.endValue.f2+=dy;
				}
				else{
					item.value.f1+=dx;
					item.value.f2+=dy;
				}
			}
		}
	}

	__proto.onOwnerAddedToStage=function(){
		if (this._autoPlay && !this._playing)
			this.play(null,this._autoPlayTimes,this._autoPlayDelay);
	}

	__proto.onOwnerRemovedFromStage=function(){
		if ((this._options & this.OPTION_AUTO_STOP_DISABLED)==0)
			this.stop((this._options & this.OPTION_AUTO_STOP_AT_END)!=0 ? true :false,false);
	}

	__proto.onDelayedPlay=function(){
		this.internalPlay();
		this._playing=this._totalTasks>0;
		if (this._playing){
			if ((this._options & this.OPTION_IGNORE_DISPLAY_CONTROLLER)!=0){
				var cnt=this._items.length;
				for (var i=0;i < cnt;i++){
					var item=this._items[i];
					if (item.target !=null && item.target!=this._owner)
						item.displayLockToken=item.target.addDisplayLock();
				}
			}
		}
		else if (this._onComplete !=null){
			var handler=this._onComplete;
			this._onComplete=null;
			handler.run();
		}
	}

	__proto.internalPlay=function(){
		this._ownerBaseX=this._owner.x;
		this._ownerBaseY=this._owner.y;
		this._totalTasks=0;
		var cnt=this._items.length;
		var item;
		var needSkipAnimations=false;
		if (!this._reversed){
			for (var i=0;i < cnt;i++){
				item=this._items[i];
				if (item.target==null)
					continue ;
				if (item.type==7 && this._startTime !=0 && item.time <=this._startTime){
					needSkipAnimations=true;
					item.value.flag=false;
				}
				else
				this.playItem(item);
			}
		}
		else{
			for (i=cnt-1;i >=0;i--){
				item=this._items[i];
				if (item.target==null)
					continue ;
				this.playItem(item);
			}
		}
		if (needSkipAnimations)
			this.skipAnimations();
	}

	__proto.playItem=function(item){
		var time=NaN;
		if (item.tweenConfig !=null){
			if (this._reversed)
				time=(this._totalDuration-item.time-item.tweenConfig.duration);
			else
			time=item.time;
			if (this._endTime==-1 || time <=this._endTime){
				var startValue;
				var endValue;
				if(this._reversed){
					startValue=item.tweenConfig.endValue;
					endValue=item.tweenConfig.startValue;
				}
				else{
					startValue=item.tweenConfig.startValue;
					endValue=item.tweenConfig.endValue;
				}
				item.value.b1=startValue.b1 || endValue.b1;
				item.value.b2=startValue.b2 || endValue.b2;
				switch(item.type){
					case 0:
					case 1:
					case 2:
					case 13:
						item.tweener=GTween.to2(startValue.f1,startValue.f2,endValue.f1,endValue.f2,item.tweenConfig.duration);
						break ;
					case 4:
					case 5:
						item.tweener=GTween.to(startValue.f1,endValue.f1,item.tweenConfig.duration);
						break ;
					case 6:
						item.tweener=GTween.toColor(startValue.f1,endValue.f1,item.tweenConfig.duration);
						break ;
					case 12:
						item.tweener=GTween.to4(startValue.f1,startValue.f2,startValue.f3,startValue.f4,
						endValue.f1,endValue.f2,endValue.f3,endValue.f4,item.tweenConfig.duration);
						break ;
					}
				item.tweener.setDelay(time)
				.setEase(item.tweenConfig.easeType)
				.setRepeat(item.tweenConfig.repeat,item.tweenConfig.yoyo)
				.setTimeScale(this._timeScale)
				.setTarget(item)
				.onStart(this.onTweenStart,this)
				.onUpdate(this.onTweenUpdate,this)
				.onComplete(this.onTweenComplete,this);
				if (this._endTime >=0)
					item.tweener.setBreakpoint(this._endTime-time);
				this._totalTasks++;
			}
		}
		else if(item.type==11){
			if (this._reversed)
				time=(this._totalDuration-item.time-item.value.duration);
			else
			time=item.time;
			item.value.offsetX=item.value.offsetY=0;
			item.value.lastOffsetX=item.value.lastOffsetY=0;
			item.tweener=GTween.shake(0,0,item.value.amplitude,item.value.duration)
			.setDelay(time)
			.setTimeScale(this._timeScale)
			.setTarget(item)
			.onUpdate(this.onTweenUpdate,this)
			.onComplete(this.onTweenComplete,this);
			if (this._endTime >=0)
				item.tweener.setBreakpoint(this._endTime-item.time);
			this._totalTasks++;
		}
		else{
			if (this._reversed)
				time=(this._totalDuration-item.time);
			else
			time=item.time;
			if (time <=this._startTime){
				this.applyValue(item);
				this.callHook(item,false);
			}
			else if (this._endTime==-1 || time <=this._endTime){
				this._totalTasks++;
				item.tweener=GTween.delayedCall(time)
				.setTimeScale(this._timeScale)
				.setTarget(item)
				.onComplete(this.onDelayedPlayItem,this);
			}
		}
		if (item.tweener !=null)
			item.tweener.seek(this._startTime);
	}

	__proto.skipAnimations=function(){
		var frame=0;
		var playStartTime=NaN;
		var playTotalTime=NaN;
		var value;
		var target;
		var item;
		var cnt=this._items.length;
		for (var i=0;i < cnt;i++){
			item=this._items[i];
			if (item.type !=7 || item.time > this._startTime)
				continue ;
			value=item.value;
			if (value.flag)
				continue ;
			target=(item.target);
			frame=target.frame;
			playStartTime=target.playing ? 0 :-1;
			playTotalTime=0;
			for (var j=i;j < cnt;j++){
				item=this._items[j];
				if (item.type !=7 || item.target !=target || item.time > this._startTime)
					continue ;
				value=item.value;
				value.flag=true;
				if (value.frame !=-1){
					frame=value.frame;
					if (value.playing)
						playStartTime=item.time;
					else
					playStartTime=-1;
					playTotalTime=0;
				}
				else{
					if (value.playing){
						if (playStartTime < 0)
							playStartTime=item.time;
					}
					else{
						if (playStartTime >=0)
							playTotalTime+=(item.time-playStartTime);
						playStartTime=-1;
					}
				}
				this.callHook(item,false);
			}
			if (playStartTime >=0)
				playTotalTime+=(this._startTime-playStartTime);
			target.playing=playStartTime>=0;
			target.frame=frame;
			if (playTotalTime > 0)
				target.advance(playTotalTime*1000);
		}
	}

	__proto.onDelayedPlayItem=function(tweener){
		var item=tweener.target;
		item.tweener=null;
		this._totalTasks--;
		this.applyValue(item);
		this.callHook(item,false);
		this.checkAllComplete();
	}

	__proto.onTweenStart=function(tweener){
		var item=tweener.target;
		if (item.type==0 || item.type==1){
			var startValue;
			var endValue;
			if (this._reversed){
				startValue=item.tweenConfig.endValue;
				endValue=item.tweenConfig.startValue;
			}
			else{
				startValue=item.tweenConfig.startValue;
				endValue=item.tweenConfig.endValue;
			}
			if (item.type==0){
				if (item.target !=this._owner){
					if (!startValue.b1)
						startValue.f1=item.target.x;
					if (!startValue.b2)
						startValue.f2=item.target.y;
				}
				else{
					if (!startValue.b1)
						startValue.f1=item.target.x-this._ownerBaseX;
					if (!startValue.b2)
						startValue.f2=item.target.y-this._ownerBaseY;
				}
			}
			else{
				if (!startValue.b1)
					startValue.f1=item.target.width;
				if (!startValue.b2)
					startValue.f2=item.target.height;
			}
			if (!endValue.b1)
				endValue.f1=startValue.f1;
			if (!endValue.b2)
				endValue.f2=startValue.f2;
			tweener.startValue.x=startValue.f1;
			tweener.startValue.y=startValue.f2;
			tweener.endValue.x=endValue.f1;
			tweener.endValue.y=endValue.f2;
		}
		this.callHook(item,false);
	}

	__proto.onTweenUpdate=function(tweener){
		var item=tweener.target;
		switch (item.type){
			case 0:
			case 1:
			case 2:
			case 13:
				item.value.f1=tweener.value.x;
				item.value.f2=tweener.value.y;
				break ;
			case 4:
			case 5:
				item.value.f1=tweener.value.x;
				break ;
			case 6:
				item.value.f1=tweener.value.color;
				break ;
			case 12:
				item.value.f1=tweener.value.x;
				item.value.f2=tweener.value.y;
				item.value.f3=tweener.value.z;
				item.value.f4=tweener.value.w;
				break ;
			case 11:
				item.value.offsetX=tweener.deltaValue.x;
				item.value.offsetY=tweener.deltaValue.y;
				break ;
			}
		this.applyValue(item);
	}

	__proto.onTweenComplete=function(tweener){
		var item=tweener.target;
		item.tweener=null;
		this._totalTasks--;
		if (tweener.allCompleted)
			this.callHook(item,true);
		this.checkAllComplete();
	}

	__proto.onPlayTransCompleted=function(item){
		this._totalTasks--;
		this.checkAllComplete();
	}

	__proto.callHook=function(item,tweenEnd){
		if (tweenEnd){
			if (item.tweenConfig!=null && item.tweenConfig.endHook !=null)
				item.tweenConfig.endHook.run();
		}
		else{
			if (item.time >=this._startTime && item.hook !=null)
				item.hook.run();
		}
	}

	__proto.checkAllComplete=function(){
		if (this._playing && this._totalTasks==0){
			if (this._totalTimes < 0){
				this.internalPlay();
			}
			else{
				this._totalTimes--;
				if (this._totalTimes > 0)
					this.internalPlay();
				else{
					this._playing=false;
					var cnt=this._items.length;
					for (var i=0;i < cnt;i++){
						var item=this._items[i];
						if (item.target !=null && item.displayLockToken!=0){
							item.target.releaseDisplayLock(item.displayLockToken);
							item.displayLockToken=0;
						}
					}
					if (this._onComplete !=null){
						var handler=this._onComplete;
						this._onComplete=null;
						handler.run();
					}
				}
			}
		}
	}

	__proto.applyValue=function(item){
		item.target._gearLocked=true;
		switch (item.type){
			case 0:
				if(item.target==this._owner){
					var f1=NaN,f2=NaN;
					if (!item.value.b1)
						f1=item.target.x;
					else
					f1=item.value.f1+this._ownerBaseX;
					if (!item.value.b2)
						f2=item.target.y;
					else
					f2=item.value.f2+this._ownerBaseY;
					item.target.setXY(f1,f2);
				}
				else{
					if (!item.value.b1)
						item.value.f1=item.target.x;
					if (!item.value.b2)
						item.value.f2=item.target.y;
					item.target.setXY(item.value.f1,item.value.f2);
				}
				break ;
			case 1:
				if (!item.value.b1)
					item.value.f1=item.target.width;
				if (!item.value.b2)
					item.value.f2=item.target.height;
				item.target.setSize(item.value.f1,item.value.f2);
				break ;
			case 3:
				item.target.setPivot(item.value.f1,item.value.f2,item.target.pivotAsAnchor);
				break ;
			case 4:
				item.target.alpha=item.value.f1;
				break ;
			case 5:
				item.target.rotation=item.value.f1;
				break ;
			case 2:
				item.target.setScale(item.value.f1,item.value.f2);
				break ;
			case 13:
				item.target.setSkew(item.value.f1,item.value.f2);
				break ;
			case 6:
				(item.target).color=ToolSet.convertToHtmlColor(item.value.f1,false);
				break ;
			case 7:
				if (item.value.frame>=0)
					(item.target).frame=item.value.frame;
				(item.target).playing=item.value.playing;
				(item.target).timeScale=this._timeScale;
				break ;
			case 8:
				item.target.visible=item.value.visible;
				break ;
			case 10:
				if (this._playing){
					var trans=item.value.trans;
					if (trans !=null){
						this._totalTasks++;
						var startTime=this._startTime > item.time ? (this._startTime-item.time):0;
						var endTime=this._endTime >=0 ? (this._endTime-item.time):-1;
						if (item.value.stopTime >=0 && (endTime < 0 || endTime > item.value.stopTime))
							endTime=item.value.stopTime;
						trans.timeScale=this._timeScale;
						trans._play(Handler.create(this,this.onPlayTransCompleted,[item]),item.value.playTimes,0,startTime,endTime,this._reversed);
					}
				}
				break ;
			case 9:
				if (this._playing && item.time >=this._startTime){
					if(item.value.audioClip==null){
						var pi=UIPackage.getItemByURL(item.value.sound);
						if(pi)
							item.value.audioClip=pi.file;
						else
						item.value.audioClip=item.value.sound;
					}
					if(item.value.audioClip)
						GRoot.inst.playOneShotSound(item.value.audioClip,item.value.volume);
				}
				break ;
			case 11:
				item.target.setXY(item.target.x-item.value.lastOffsetX+item.value.offsetX,item.target.y-item.value.lastOffsetY+item.value.offsetY);
				item.value.lastOffsetX=item.value.offsetX;
				item.value.lastOffsetY=item.value.offsetY;
				break ;
			case 12:{
					var arr=item.target.filters;
					var cm=new ColorMatrix();
					cm.adjustBrightness(item.value.f1);
					cm.adjustContrast(item.value.f2);
					cm.adjustSaturation(item.value.f3);
					cm.adjustHue(item.value.f4);
					arr=[new ColorFilter(cm)];
					item.target.filters=arr;
					break ;
				}
			case 14:
				item.target.text=item.value.text;
				break ;
			case 15:
				item.target.icon=item.value.text;
				break ;
			}
		item.target._gearLocked=false;
	}

	__proto.setup=function(buffer){
		this.name=buffer.readS();
		this._options=buffer.getInt32();
		this._autoPlay=buffer.readBool();
		this._autoPlayTimes=buffer.getInt32();
		this._autoPlayDelay=buffer.getFloat32();
		var cnt=buffer.getInt16();
		for (var i=0;i < cnt;i++){
			var dataLen=buffer.getInt16();
			var curPos=buffer.pos;
			buffer.seek(curPos,0);
			var item=new TransitionItem(buffer.readByte());
			this._items[i]=item;
			item.time=buffer.getFloat32();
			var targetId=buffer.getInt16();
			if (targetId < 0)
				item.targetId="";
			else
			item.targetId=this._owner.getChildAt(targetId).id;
			item.label=buffer.readS();
			if (buffer.readBool()){
				buffer.seek(curPos,1);
				item.tweenConfig=new TweenConfig();
				item.tweenConfig.duration=buffer.getFloat32();
				if (item.time+item.tweenConfig.duration > this._totalDuration)
					this._totalDuration=item.time+item.tweenConfig.duration;
				item.tweenConfig.easeType=buffer.readByte();
				item.tweenConfig.repeat=buffer.getInt32();
				item.tweenConfig.yoyo=buffer.readBool();
				item.tweenConfig.endLabel=buffer.readS();
				buffer.seek(curPos,2);
				this.decodeValue(item,buffer,item.tweenConfig.startValue);
				buffer.seek(curPos,3);
				this.decodeValue(item,buffer,item.tweenConfig.endValue);
			}
			else{
				if (item.time > this._totalDuration)
					this._totalDuration=item.time;
				buffer.seek(curPos,2);
				this.decodeValue(item,buffer,item.value);
			}
			buffer.pos=curPos+dataLen;
		}
	}

	__proto.decodeValue=function(item,buffer,value){
		switch(item.type){
			case 0:
			case 1:
			case 3:
			case 13:
				value.b1=buffer.readBool();
				value.b2=buffer.readBool();
				value.f1=buffer.getFloat32();
				value.f2=buffer.getFloat32();
				break ;
			case 4:
			case 5:
				value.f1=buffer.getFloat32();
				break ;
			case 2:
				value.f1=buffer.getFloat32();
				value.f2=buffer.getFloat32();
				break ;
			case 6:
				value.f1=buffer.readColor();
				break ;
			case 7:
				value.playing=buffer.readBool();
				value.frame=buffer.getInt32();
				break ;
			case 8:
				value.visible=buffer.readBool();
				break ;
			case 9:
				value.sound=buffer.readS();
				value.volume=buffer.getFloat32();
				break ;
			case 10:
				value.transName=buffer.readS();
				value.playTimes=buffer.getInt32();
				break ;
			case 11:
				value.amplitude=buffer.getFloat32();
				value.duration=buffer.getFloat32();
				break ;
			case 12:
				value.f1=buffer.getFloat32();
				value.f2=buffer.getFloat32();
				value.f3=buffer.getFloat32();
				value.f4=buffer.getFloat32();
				break ;
			case 14:
			case 15:
				value.text=buffer.readS();
				break ;
			}
	}

	__getset(0,__proto,'playing',function(){
		return this._playing;
	});

	__getset(0,__proto,'timeScale',function(){
		return this._timeScale;
		},function(value){
		if(this._timeScale !=value){
			this._timeScale=value;
			if (this._playing){
				var cnt=this._items.length;
				for (var i=0;i < cnt;i++){
					var item=this._items[i];
					if (item.tweener !=null)
						item.tweener.setTimeScale(value);
					else if (item.type==10){
						if(item.value.trans !=null)
							item.value.trans.timeScale=value;
					}
					else if(item.type==7){
						if(item.target !=null)
							(item.target).timeScale=value;
					}
				}
			}
		}
	});

	Transition.__init$=function(){
		//class TransitionActionType
		TransitionActionType=(function(){
			function TransitionActionType(){}
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
			TransitionActionType.Sound=9;
			TransitionActionType.Transition=10;
			TransitionActionType.Shake=11;
			TransitionActionType.ColorFilter=12;
			TransitionActionType.Skew=13;
			TransitionActionType.Text=14;
			TransitionActionType.Icon=15;
			TransitionActionType.Unknown=16;
			return TransitionActionType;
		})()
		//class TransitionItem
		TransitionItem=(function(){
			function TransitionItem(type){
				this.time=NaN;
				this.targetId=null;
				this.type=0;
				this.tweenConfig=null;
				this.label=null;
				this.value=null;
				this.hook=null;
				this.tweener=null;
				this.target=null;
				this.displayLockToken=0;
				this.type=type;
				switch (type){
					case 0:
					case 1:
					case 2:
					case 3:
					case 13:
					case 4:
					case 5:
					case 6:
					case 12:
						this.value=new TValue();
						break ;
					case 7:
						this.value=new TValue_Animation();
						break ;
					case 11:
						this.value=new TValue_Shake();
						break ;
					case 9:
						this.value=new TValue_Sound();
						break ;
					case 10:
						this.value=new TValue_Transition();
						break ;
					case 8:
						this.value=new TValue_Visible();
						break ;
					case 14:
					case 15:
						this.value=new TValue_Text();
						break ;
					}
			}
			__class(TransitionItem,'');
			return TransitionItem;
		})()
		//class TweenConfig
		TweenConfig=(function(){
			function TweenConfig(){
				this.duration=NaN;
				this.easeType=0;
				this.repeat=0;
				this.yoyo=false;
				this.startValue=null;
				this.endValue=null;
				this.endLabel=null;
				this.endHook=null;
				this.easeType=5;
				this.startValue=new TValue();
				this.endValue=new TValue();
			}
			__class(TweenConfig,'');
			return TweenConfig;
		})()
		//class TValue_Visible
		TValue_Visible=(function(){
			function TValue_Visible(){
				this.visible=false;
			}
			__class(TValue_Visible,'');
			return TValue_Visible;
		})()
		//class TValue_Animation
		TValue_Animation=(function(){
			function TValue_Animation(){
				this.frame=0;
				this.playing=false;
				this.flag=false;
			}
			__class(TValue_Animation,'');
			return TValue_Animation;
		})()
		//class TValue_Sound
		TValue_Sound=(function(){
			function TValue_Sound(){
				this.sound=null;
				this.volume=NaN;
				this.audioClip=null;
			}
			__class(TValue_Sound,'');
			return TValue_Sound;
		})()
		//class TValue_Transition
		TValue_Transition=(function(){
			function TValue_Transition(){
				this.transName=null;
				this.playTimes=0;
				this.trans=null;
				this.stopTime=NaN;
			}
			__class(TValue_Transition,'');
			return TValue_Transition;
		})()
		//class TValue_Shake
		TValue_Shake=(function(){
			function TValue_Shake(){
				this.amplitude=NaN;
				this.duration=NaN;
				this.offsetX=NaN;
				this.offsetY=NaN;
				this.lastOffsetX=NaN;
				this.lastOffsetY=NaN;
			}
			__class(TValue_Shake,'');
			return TValue_Shake;
		})()
		//class TValue_Text
		TValue_Text=(function(){
			function TValue_Text(){
				this.text=null;
			}
			__class(TValue_Text,'');
			return TValue_Text;
		})()
		//class TValue
		TValue=(function(){
			function TValue(){
				this.f1=NaN;
				this.f2=NaN;
				this.f3=NaN;
				this.f4=NaN;
				this.b1=false;
				this.b2=false;
				this.b1=this.b2=true;
			}
			__class(TValue,'');
			return TValue;
		})()
	}

	return Transition;
})()


//class fairygui.TranslationHelper
var TranslationHelper=(function(){
	function TranslationHelper(){}
	__class(TranslationHelper,'fairygui.TranslationHelper');
	TranslationHelper.loadFromXML=function(source){
		TranslationHelper.strings={};
		var xml=Utils.parseXMLFromString(source);
		var resNode=TranslationHelper.findChildNode(xml,"resources");
		var nodes=resNode.childNodes;
		var length1=nodes.length;
		for (var i1=0;i1 < length1;i1++){
			var cxml=nodes[i1];
			if (cxml.nodeName=="string"){
				var key=cxml.getAttribute("name");
				var text=cxml.textContent;
				var i=key.indexOf("-");
				if(i==-1)
					continue ;
				var key2=key.substr(0,i);
				var key3=key.substr(i+1);
				var col=TranslationHelper.strings[key2];
				if(!col){
					col={};
					TranslationHelper.strings[key2]=col;
				}
				col[key3]=text;
			}
		}
	}

	TranslationHelper.translateComponent=function(item){
		if(TranslationHelper.strings==null)
			return;
		var compStrings=TranslationHelper.strings[item.owner.id+item.id];
		if(compStrings==null)
			return;
		var elementId,value;
		var buffer=item.rawData;
		var nextPos=0;
		var itemCount=0;
		var i=0,j=0,k=0;
		var dataLen=0;
		var curPos=0;
		var valueCnt=0;
		var page;
		buffer.seek(0,2);
		var childCount=buffer.getInt16();
		for (i=0;i < childCount;i++){
			dataLen=buffer.getInt16();
			curPos=buffer.pos;
			buffer.seek(curPos,0);
			var type=buffer.readByte();
			buffer.skip(4);
			elementId=buffer.readS();
			if (type==9){
				if (buffer.seek(curPos,6))
					type=buffer.readByte();
			}
			buffer.seek(curPos,1);
			if((value=compStrings[elementId+"-tips"])!=null)
				buffer.writeS(value);
			buffer.seek(curPos,2);
			var gearCnt=buffer.getInt16();
			for (j=0;j < gearCnt;j++){
				nextPos=buffer.getInt16();
				nextPos+=buffer.pos;
				if (buffer.readByte()==6){
					buffer.skip(2);
					valueCnt=buffer.getInt16();
					for (k=0;k < valueCnt;k++){
						page=buffer.readS();
						if (page !=null){
							if((value=compStrings[elementId+"-texts_"+k])!=null)
								buffer.writeS(value);
							else
							buffer.skip(2);
						}
					}
					if (buffer.readBool()&& (value=compStrings[elementId+"-texts_def"])!=null)
						buffer.writeS(value);
				}
				buffer.pos=nextPos;
			}
			switch (type){
				case 6:
				case 7:
				case 8:{
						if ((value=compStrings[elementId])!=null){
							buffer.seek(curPos,6);
							buffer.writeS(value);
						}
						if ((value=compStrings[elementId+"-prompt"])!=null){
							buffer.seek(curPos,4);
							buffer.writeS(value);
						}
						break ;
					}
				case 10:{
						buffer.seek(curPos,8);
						buffer.skip(2);
						itemCount=buffer.getInt16();
						for (j=0;j<itemCount;j++){
							nextPos=buffer.getInt16();
							nextPos+=buffer.pos;
							buffer.skip(2);
							if ((value=compStrings[elementId+"-"+j])!=null)
								buffer.writeS(value);
							else
							buffer.skip(2);
							if ((value=compStrings[elementId+"-"+j+"-0"])!=null)
								buffer.writeS(value);
							buffer.pos=nextPos;
						}
						break ;
					}
				case 11:{
						if (buffer.seek(curPos,6)&& buffer.readByte()==type){
							if ((value=compStrings[elementId])!=null)
								buffer.writeS(value);
							else
							buffer.skip(2);
							buffer.skip(2);
							if (buffer.readBool())
								buffer.skip(4);
							buffer.skip(4);
							if (buffer.readBool()&& (value=compStrings[elementId+"-prompt"])!=null)
								buffer.writeS(value);
						}
						break ;
					}
				case 12:{
						if (buffer.seek(curPos,6)&& buffer.readByte()==type){
							if ((value=compStrings[elementId])!=null)
								buffer.writeS(value);
							else
							buffer.skip(2);
							if ((value=compStrings[elementId+"-0"])!=null)
								buffer.writeS(value);
						}
						break ;
					}
				case 13:{
						if (buffer.seek(curPos,6)&& buffer.readByte()==type){
							itemCount=buffer.getInt16();
							for (j=0;j < itemCount;j++){
								nextPos=buffer.getInt16();
								nextPos+=buffer.pos;
								if ((value=compStrings[elementId+"-"+j])!=null)
									buffer.writeS(value);
								buffer.pos=nextPos;
							}
							if ((value=compStrings[elementId])!=null)
								buffer.writeS(value);
						}
						break ;
					}
				}
			buffer.pos=curPos+dataLen;
		}
	}

	TranslationHelper.findChildNode=function(xml,name){
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

	TranslationHelper.strings=null;
	return TranslationHelper;
})()


//class fairygui.tree.TreeNode
var TreeNode=(function(){
	function TreeNode(hasChild){
		this._data=null;
		this._parent=null;
		this._children=null;
		this._expanded=false;
		this._tree=null;
		this._cell=null;
		this._level=0;
		if(hasChild)
			this._children=[];
	}

	__class(TreeNode,'fairygui.tree.TreeNode');
	var __proto=TreeNode.prototype;
	__proto.setCell=function(value){
		this._cell=value;
	}

	__proto.setLevel=function(value){
		this._level=value;
	}

	__proto.addChild=function(child){
		this.addChildAt(child,this._children.length);
		return child;
	}

	__proto.addChildAt=function(child,index){
		if(!child)
			throw new Error("child is null");
		var numChildren=this._children.length;
		if (index >=0 && index <=numChildren){
			if (child._parent==this){
				this.setChildIndex(child,index);
			}
			else{
				if(child._parent)
					child._parent.removeChild(child);
				var cnt=this._children.length;
				if (index==cnt)
					this._children.push(child);
				else
				this._children.splice(index,0,child);
				child._parent=this;
				child._level=this._level+1;
				child.setTree(this._tree);
				if(this._cell!=null && this._cell.parent!=null && this._expanded)
					this._tree.afterInserted(child);
			}
			return child;
		}
		else{
			throw new Error("Invalid child index");
		}
	}

	__proto.removeChild=function(child){
		var childIndex=this._children.indexOf(child);
		if (childIndex !=-1){
			this.removeChildAt(childIndex);
		}
		return child;
	}

	__proto.removeChildAt=function(index){
		if (index >=0 && index < this.numChildren){
			var child=this._children[index];
			this._children.splice(index,1);
			child._parent=null;
			if(this._tree!=null){
				child.setTree(null);
				this._tree.afterRemoved(child);
			}
			return child;
		}
		else{
			throw new Error("Invalid child index");
		}
	}

	__proto.removeChildren=function(beginIndex,endIndex){
		(beginIndex===void 0)&& (beginIndex=0);
		(endIndex===void 0)&& (endIndex=-1);
		if (endIndex < 0 || endIndex >=this.numChildren)
			endIndex=this.numChildren-1;
		for (var i=beginIndex;i<=endIndex;++i)
		this.removeChildAt(beginIndex);
	}

	__proto.getChildAt=function(index){
		if (index >=0 && index < this.numChildren)
			return this._children[index];
		else
		throw new Error("Invalid child index");
	}

	__proto.getChildIndex=function(child){
		return this._children.indexOf(child);
	}

	__proto.getPrevSibling=function(){
		if(this._parent==null)
			return null;
		var i=this._parent._children.indexOf(this);
		if(i<=0)
			return null;
		return this._parent._children[i-1];
	}

	__proto.getNextSibling=function(){
		if(this._parent==null)
			return null;
		var i=this._parent._children.indexOf(this);
		if(i<0 || i>=this._parent._children.length-1)
			return null;
		return this._parent._children[i+1];
	}

	__proto.setChildIndex=function(child,index){
		var oldIndex=this._children.indexOf(child);
		if (oldIndex==-1)
			throw new Error("Not a child of this container");
		var cnt=this._children.length;
		if(index<0)
			index=0;
		else if(index>cnt)
		index=cnt;
		if(oldIndex==index)
			return;
		this._children.splice(oldIndex,1);
		this._children.splice(index,0,child);
		if(this._cell!=null && this._cell.parent!=null && this._expanded)
			this._tree.afterMoved(child);
	}

	__proto.swapChildren=function(child1,child2){
		var index1=this._children.indexOf(child1);
		var index2=this._children.indexOf(child2);
		if (index1==-1 || index2==-1)
			throw new Error("Not a child of this container");
		this.swapChildrenAt(index1,index2);
	}

	__proto.swapChildrenAt=function(index1,index2){
		var child1=this._children[index1];
		var child2=this._children[index2];
		this.setChildIndex(child1,index2);
		this.setChildIndex(child2,index1);
	}

	__proto.setTree=function(value){
		this._tree=value;
		if(this._tree!=null && this._tree.treeNodeWillExpand && this._expanded)
			this._tree.treeNodeWillExpand.runWith(this);
		if(this._children!=null){
			var cnt=this._children.length;
			for(var i=0;i<cnt;i++){
				var node=this._children[i];
				node._level=this._level+1;
				node.setTree(value);
			}
		}
	}

	__getset(0,__proto,'expanded',function(){
		return this._expanded;
		},function(value){
		if(this._children==null)
			return;
		if(this._expanded!=value){
			this._expanded=value;
			if(this._tree!=null){
				if(this._expanded)
					this._tree.afterExpanded(this);
				else
				this._tree.afterCollapsed(this);
			}
		}
	});

	__getset(0,__proto,'tree',function(){
		return this._tree;
	});

	__getset(0,__proto,'level',function(){
		return this._level;
	});

	__getset(0,__proto,'cell',function(){
		return this._cell;
	});

	__getset(0,__proto,'data',function(){
		return this._data;
		},function(value){
		this._data=value;
	});

	__getset(0,__proto,'parent',function(){
		return this._parent;
	});

	__getset(0,__proto,'isFolder',function(){
		return this._children!=null;
	});

	__getset(0,__proto,'text',function(){
		if(this._cell!=null)
			return this._cell.text;
		else
		return null;
	});

	__getset(0,__proto,'numChildren',function(){
		return this._children.length;
	});

	return TreeNode;
})()


//class fairygui.tree.TreeView
var TreeView=(function(){
	function TreeView(list){
		this._list=null;
		this._root=null;
		this._indent=0;
		/**
		*当需要为节点创建一个显示对象时调用这个Handler。参数为节点对象（TreeNode）。应该返回一个GObject。
		*/
		this.treeNodeCreateCell=null;
		/**
		*当节点需要渲染时调用这个Handler。参数为节点对象（TreeNode）。
		*/
		this.treeNodeRender=null;
		/**
		*当目录节点展开或者收缩时调用这个Handler。参数为节点对象（TreeNode）。可以用节点的expanded属性判断目标状态。
		*/
		this.treeNodeWillExpand=null;
		/**
		*当节点被点击时调用这个Handler。参数有两个，第一个为节点对象（TreeNode），第二个为事件对象(Event)。
		*/
		this.treeNodeClick=null;
		this._list=list;
		this._list.removeChildrenToPool();
		this._list.on("fui_click_item",this,this.__clickItem);
		this._root=new TreeNode(true);
		this._root.setTree(this);
		this._root.setCell(this._list);
		this._root.expanded=true;
		this._indent=15;
	}

	__class(TreeView,'fairygui.tree.TreeView');
	var __proto=TreeView.prototype;
	__proto.getSelectedNode=function(){
		if(this._list.selectedIndex!=-1)
			return (this._list.getChildAt(this._list.selectedIndex).data);
		else
		return null;
	}

	__proto.getSelection=function(){
		var sels=this._list.getSelection();
		var cnt=sels.length;
		var ret=[];
		for(var i=0;i<cnt;i++){
			var node=(this._list.getChildAt(sels[i]).data);
			ret.push(node);
		}
		return ret;
	}

	__proto.addSelection=function(node,scrollItToView){
		(scrollItToView===void 0)&& (scrollItToView=false);
		var parentNode=node.parent;
		while(parentNode!=null && parentNode!=this._root){
			parentNode.expanded=true;
			parentNode=parentNode.parent;
		}
		if(!node.cell)
			return;
		this._list.addSelection(this._list.getChildIndex(node.cell),scrollItToView);
	}

	__proto.removeSelection=function(node){
		if(!node.cell)
			return;
		this._list.removeSelection(this._list.getChildIndex(node.cell));
	}

	__proto.clearSelection=function(){
		this._list.clearSelection();
	}

	__proto.getNodeIndex=function(node){
		return this._list.getChildIndex(node.cell);
	}

	__proto.updateNode=function(node){
		if(node.cell==null)
			return;
		if(this.treeNodeRender)
			this.treeNodeRender.runWith(node);
	}

	__proto.updateNodes=function(nodes){
		var cnt=nodes.length;
		for(var i=0;i<cnt;i++){
			var node=nodes[i];
			if(node.cell==null)
				return;
			if(this.treeNodeRender)
				this.treeNodeRender.runWith(node);
		}
	}

	__proto.expandAll=function(folderNode){
		folderNode.expanded=true;
		var cnt=folderNode.numChildren;
		for(var i=0;i<cnt;i++){
			var node=folderNode.getChildAt(i);
			if(node.isFolder)
				this.expandAll(node);
		}
	}

	__proto.collapseAll=function(folderNode){
		if(folderNode!=this._root)
			folderNode.expanded=false;
		var cnt=folderNode.numChildren;
		for(var i=0;i<cnt;i++){
			var node=folderNode.getChildAt(i);
			if(node.isFolder)
				this.collapseAll(node);
		}
	}

	__proto.createCell=function(node){
		if(this.treeNodeCreateCell)
			node.setCell(this.treeNodeCreateCell.runWith(node));
		else
		node.setCell((this._list.itemPool.getObject(this._list.defaultItem)));
		node.cell.data=node;
		var indentObj=node.cell.getChild("indent");
		if(indentObj!=null)
			indentObj.width=(node.level-1)*this._indent;
		var expandButton=(node.cell.getChild("expandButton"));
		if(expandButton){
			if(node.isFolder){
				expandButton.visible=true;
				expandButton.onClick(this,this.__clickExpandButton);
				expandButton.data=node;
				expandButton.selected=node.expanded;
			}
			else
			expandButton.visible=false;
		}
		if(this.treeNodeRender)
			this.treeNodeRender.runWith(node);
	}

	__proto.afterInserted=function(node){
		this.createCell(node);
		var index=this.getInsertIndexForNode(node);
		this._list.addChildAt(node.cell,index);
		if(this.treeNodeRender)
			this.treeNodeRender.runWith(node);
		if(node.isFolder && node.expanded)
			this.checkChildren(node,index);
	}

	__proto.getInsertIndexForNode=function(node){
		var prevNode=node.getPrevSibling();
		if(prevNode==null)
			prevNode=node.parent;
		var insertIndex=this._list.getChildIndex(prevNode.cell)+1;
		var myLevel=node.level;
		var cnt=this._list.numChildren;
		for(var i=insertIndex;i<cnt;i++){
			var testNode=(this._list.getChildAt(i).data);
			if(testNode.level<=myLevel)
				break ;
			insertIndex++;
		}
		return insertIndex;
	}

	__proto.afterRemoved=function(node){
		this.removeNode(node);
	}

	__proto.afterExpanded=function(node){
		if(node!=this._root && this.treeNodeWillExpand)
			this.treeNodeWillExpand(node);
		if(node.cell==null)
			return;
		if(node!=this._root){
			if(this.treeNodeRender)
				this.treeNodeRender.runWith(node);
			var expandButton=(node.cell.getChild("expandButton"));
			if(expandButton)
				expandButton.selected=true;
		}
		if(node.cell.parent!=null)
			this.checkChildren(node,this._list.getChildIndex(node.cell));
	}

	__proto.afterCollapsed=function(node){
		if(node!=this._root && this.treeNodeWillExpand)
			this.treeNodeWillExpand(node);
		if(node.cell==null)
			return;
		if(node!=this._root){
			if(this.treeNodeRender)
				this.treeNodeRender.runWith(node);
			var expandButton=(node.cell.getChild("expandButton"));
			if(expandButton)
				expandButton.selected=false;
		}
		if(node.cell.parent!=null)
			this.hideFolderNode(node);
	}

	__proto.afterMoved=function(node){
		if(!node.isFolder)
			this._list.removeChild(node.cell);
		else
		this.hideFolderNode(node);
		var index=this.getInsertIndexForNode(node);
		this._list.addChildAt(node.cell,index);
		if(node.isFolder && node.expanded)
			this.checkChildren(node,index);
	}

	__proto.checkChildren=function(folderNode,index){
		var cnt=folderNode.numChildren;
		for(var i=0;i<cnt;i++){
			index++;
			var node=folderNode.getChildAt(i);
			if(node.cell==null)
				this.createCell(node);
			if(!node.cell.parent)
				this._list.addChildAt(node.cell,index);
			if(node.isFolder && node.expanded)
				index=this.checkChildren(node,index);
		}
		return index;
	}

	__proto.hideFolderNode=function(folderNode){
		var cnt=folderNode.numChildren;
		for(var i=0;i<cnt;i++){
			var node=folderNode.getChildAt(i);
			if(node.cell && node.cell.parent!=null)
				this._list.removeChild(node.cell);
			if(node.isFolder && node.expanded)
				this.hideFolderNode(node);
		}
	}

	__proto.removeNode=function(node){
		if(node.cell!=null){
			if(node.cell.parent!=null)
				this._list.removeChild(node.cell);
			this._list.returnToPool(node.cell);
			node.cell.data=null;
			node.setCell(null);
		}
		if(node.isFolder){
			var cnt=node.numChildren;
			for(var i=0;i<cnt;i++){
				var node2=node.getChildAt(i);
				this.removeNode(node2);
			}
		}
	}

	__proto.__clickExpandButton=function(evt){
		evt.stopPropagation();
		var expandButton=(GObject.cast(evt.currentTarget));
		var node=(expandButton.parent.data);
		if(this._list.scrollPane!=null){
			var posY=this._list.scrollPane.posY;
			if(expandButton.selected)
				node.expanded=true;
			else
			node.expanded=false;
			this._list.scrollPane.posY=posY;
			this._list.scrollPane.scrollToView(node.cell);
		}
		else{
			if(expandButton.selected)
				node.expanded=true;
			else
			node.expanded=false;
		}
	}

	__proto.__clickItem=function(item,evt){
		if(this._list.scrollPane!=null)
			var posY=this._list.scrollPane.posY;
		var node=(item.data);
		if(this.treeNodeClick)
			this.treeNodeClick.runWith([node,evt]);
		if(this._list.scrollPane!=null){
			this._list.scrollPane.posY=posY;
			if(node.cell)
				this._list.scrollPane.scrollToView(node.cell);
		}
	}

	__getset(0,__proto,'list',function(){
		return this._list;
	});

	__getset(0,__proto,'root',function(){
		return this._root;
	});

	__getset(0,__proto,'indent',function(){
		return this._indent;
		},function(value){
		this._indent=value;
	});

	return TreeView;
})()


//class fairygui.tween.EaseManager
var EaseManager=(function(){
	var Bounce;
	function EaseManager(){}
	__class(EaseManager,'fairygui.tween.EaseManager');
	EaseManager.evaluate=function(easeType,time,duration,overshootOrAmplitude,period){
		switch (easeType){
			case 0:
				return time / duration;
			case 1:
				return-Math.cos(time / duration *EaseManager._PiOver2)+1;
			case 2:
				return Math.sin(time / duration *EaseManager._PiOver2);
			case 3:
				return-0.5 *(Math.cos(Math.PI *time / duration)-1);
			case 4:
				return (time /=duration)*time;
			case 5:
				return-(time /=duration)*(time-2);
			case 6:
				if ((time /=duration *0.5)< 1)return 0.5 *time *time;
				return-0.5 *((--time)*(time-2)-1);
			case 7:
				return (time /=duration)*time *time;
			case 8:
				return ((time=time / duration-1)*time *time+1);
			case 9:
				if ((time /=duration *0.5)< 1)return 0.5 *time *time *time;
				return 0.5 *((time-=2)*time *time+2);
			case 10:
				return (time /=duration)*time *time *time;
			case 11:
				return-((time=time / duration-1)*time *time *time-1);
			case 12:
				if ((time /=duration *0.5)< 1)return 0.5 *time *time *time *time;
				return-0.5 *((time-=2)*time *time *time-2);
			case 13:
				return (time /=duration)*time *time *time *time;
			case 14:
				return ((time=time / duration-1)*time *time *time *time+1);
			case 15:
				if ((time /=duration *0.5)< 1)return 0.5 *time *time *time *time *time;
				return 0.5 *((time-=2)*time *time *time *time+2);
			case 16:
				return (time==0)? 0 :Math.pow(2,10 *(time / duration-1));
			case 17:
				if (time==duration)return 1;
				return (-Math.pow(2,-10 *time / duration)+1);
			case 18:
				if (time==0)return 0;
				if (time==duration)return 1;
				if ((time /=duration *0.5)< 1)return 0.5 *Math.pow(2,10 *(time-1));
				return 0.5 *(-Math.pow(2,-10 *--time)+2);
			case 19:
				return-(Math.sqrt(1-(time /=duration)*time)-1);
			case 20:
				return Math.sqrt(1-(time=time / duration-1)*time);
			case 21:
				if ((time /=duration *0.5)< 1)return-0.5 *(Math.sqrt(1-time *time)-1);
				return 0.5 *(Math.sqrt(1-(time-=2)*time)+1);
			case 22:;
				var s0=NaN;
				if (time==0)return 0;
				if ((time /=duration)==1)return 1;
				if (period==0)period=duration *0.3;
				if (overshootOrAmplitude < 1){
					overshootOrAmplitude=1;
					s0=period / 4;
				}
				else s0=period / EaseManager._TwoPi *Math.asin(1 / overshootOrAmplitude);
				return-(overshootOrAmplitude *Math.pow(2,10 *(time-=1))*Math.sin((time *duration-s0)*EaseManager._TwoPi / period));
			case 23:;
				var s1=NaN;
				if (time==0)return 0;
				if ((time /=duration)==1)return 1;
				if (period==0)period=duration *0.3;
				if (overshootOrAmplitude < 1){
					overshootOrAmplitude=1;
					s1=period / 4;
				}
				else s1=period / EaseManager._TwoPi *Math.asin(1 / overshootOrAmplitude);
				return (overshootOrAmplitude *Math.pow(2,-10 *time)*Math.sin((time *duration-s1)*EaseManager._TwoPi / period)+1);
			case 24:;
				var s=NaN;
				if (time==0)return 0;
				if ((time /=duration *0.5)==2)return 1;
				if (period==0)period=duration *(0.3 *1.5);
				if (overshootOrAmplitude < 1){
					overshootOrAmplitude=1;
					s=period / 4;
				}
				else s=period / EaseManager._TwoPi *Math.asin(1 / overshootOrAmplitude);
				if (time < 1)return-0.5 *(overshootOrAmplitude *Math.pow(2,10 *(time-=1))*Math.sin((time *duration-s)*EaseManager._TwoPi / period));
				return overshootOrAmplitude *Math.pow(2,-10 *(time-=1))*Math.sin((time *duration-s)*EaseManager._TwoPi / period)*0.5+1;
			case 25:
				return (time /=duration)*time *((overshootOrAmplitude+1)*time-overshootOrAmplitude);
			case 26:
				return ((time=time / duration-1)*time *((overshootOrAmplitude+1)*time+overshootOrAmplitude)+1);
			case 27:
				if ((time /=duration *0.5)< 1)return 0.5 *(time *time *(((overshootOrAmplitude *=(1.525))+1)*time-overshootOrAmplitude));
				return 0.5 *((time-=2)*time *(((overshootOrAmplitude *=(1.525))+1)*time+overshootOrAmplitude)+2);
			case 28:
				return Bounce.easeIn(time,duration);
			case 29:
				return Bounce.easeOut(time,duration);
			case 30:
				return Bounce.easeInOut(time,duration);
			default :
				return-(time /=duration)*(time-2);
			}
	}

	__static(EaseManager,
	['_PiOver2',function(){return this._PiOver2=Math.PI *0.5;},'_TwoPi',function(){return this._TwoPi=Math.PI *2;}
	]);
	EaseManager.__init$=function(){
		/// This class contains a C# port of the easing equations created by Robert Penner (http://robertpenner.com/easing).
		//class Bounce
		Bounce=(function(){
			function Bounce(){}
			__class(Bounce,'');
			Bounce.easeIn=function(time,duration){
				return 1-Bounce.easeOut(duration-time,duration);
			}
			Bounce.easeOut=function(time,duration){
				if ((time /=duration)< (1 / 2.75)){
					return (7.5625 *time *time);
				}
				if (time < (2 / 2.75)){
					return (7.5625 *(time-=(1.5 / 2.75))*time+0.75);
				}
				if (time < (2.5 / 2.75)){
					return (7.5625 *(time-=(2.25 / 2.75))*time+0.9375);
				}
				return (7.5625 *(time-=(2.625 / 2.75))*time+0.984375);
			}
			Bounce.easeInOut=function(time,duration){
				if (time < duration *0.5){
					return Bounce.easeIn(time *2,duration)*0.5;
				}
				return Bounce.easeOut(time *2-duration,duration)*0.5+0.5;
			}
			return Bounce;
		})()
	}

	return EaseManager;
})()


//class fairygui.tween.EaseType
var EaseType=(function(){
	function EaseType(){}
	__class(EaseType,'fairygui.tween.EaseType');
	EaseType.Linear=0;
	EaseType.SineIn=1;
	EaseType.SineOut=2;
	EaseType.SineInOut=3;
	EaseType.QuadIn=4;
	EaseType.QuadOut=5;
	EaseType.QuadInOut=6;
	EaseType.CubicIn=7;
	EaseType.CubicOut=8;
	EaseType.CubicInOut=9;
	EaseType.QuartIn=10;
	EaseType.QuartOut=11;
	EaseType.QuartInOut=12;
	EaseType.QuintIn=13;
	EaseType.QuintOut=14;
	EaseType.QuintInOut=15;
	EaseType.ExpoIn=16;
	EaseType.ExpoOut=17;
	EaseType.ExpoInOut=18;
	EaseType.CircIn=19;
	EaseType.CircOut=20;
	EaseType.CircInOut=21;
	EaseType.ElasticIn=22;
	EaseType.ElasticOut=23;
	EaseType.ElasticInOut=24;
	EaseType.BackIn=25;
	EaseType.BackOut=26;
	EaseType.BackInOut=27;
	EaseType.BounceIn=28;
	EaseType.BounceOut=29;
	EaseType.BounceInOut=30;
	EaseType.Custom=31;
	return EaseType;
})()


//class fairygui.tween.GTween
var GTween=(function(){
	function GTween(){}
	__class(GTween,'fairygui.tween.GTween');
	GTween.to=function(start,end,duration){
		return TweenManager.createTween()._to(start,end,duration);
	}

	GTween.to2=function(start,start2,end,end2,duration){
		return TweenManager.createTween()._to2(start,start2,end,end2,duration);
	}

	GTween.to3=function(start,start2,start3,end,end2,end3,duration){
		return TweenManager.createTween()._to3(start,start2,start3,end,end2,end3,duration);
	}

	GTween.to4=function(start,start2,start3,start4,end,end2,end3,end4,duration){
		return TweenManager.createTween()._to4(start,start2,start3,start4,end,end2,end3,end4,duration);
	}

	GTween.toColor=function(start,end,duration){
		return TweenManager.createTween()._toColor(start,end,duration);
	}

	GTween.delayedCall=function(delay){
		return TweenManager.createTween().setDelay(delay);
	}

	GTween.shake=function(startX,startY,amplitude,duration){
		return TweenManager.createTween()._shake(startX,startY,amplitude,duration);
	}

	GTween.isTweening=function(target,propType){
		return TweenManager.isTweening(target,propType);
	}

	GTween.kill=function(target,complete,propType){
		(complete===void 0)&& (complete=false);
		TweenManager.killTweens(target,false,null);
	}

	GTween.getTween=function(target,propType){
		return TweenManager.getTween(target,propType);
	}

	GTween.catchCallbackExceptions=true;
	return GTween;
})()


//class fairygui.tween.GTweener
var GTweener=(function(){
	function GTweener(){
		this._target=null;
		this._propType=null;
		this._killed=false;
		this._paused=false;
		this._delay=NaN;
		this._duration=NaN;
		this._breakpoint=NaN;
		this._easeType=0;
		this._easeOvershootOrAmplitude=NaN;
		this._easePeriod=NaN;
		this._repeat=0;
		this._yoyo=false;
		this._timeScale=NaN;
		this._snapping=false;
		this._userData=null;
		this._onUpdate=null;
		this._onUpdateCaller=null;
		this._onStart=null;
		this._onStartCaller=null;
		this._onComplete=null;
		this._onCompleteCaller=null;
		this._startValue=null;
		this._endValue=null;
		this._value=null;
		this._deltaValue=null;
		this._valueSize=0;
		this._started=false;
		this._ended=0;
		this._elapsedTime=NaN;
		this._normalizedTime=NaN;
		this._startValue=new TweenValue();
		this._endValue=new TweenValue();
		this._value=new TweenValue();
		this._deltaValue=new TweenValue();
		this._reset();
	}

	__class(GTweener,'fairygui.tween.GTweener');
	var __proto=GTweener.prototype;
	__proto.setDelay=function(value){
		this._delay=value;
		return this;
	}

	__proto.setDuration=function(value){
		this._duration=value;
		return this;
	}

	__proto.setBreakpoint=function(value){
		this._breakpoint=value;
		return this;
	}

	__proto.setEase=function(value){
		this._easeType=value;
		return this;
	}

	__proto.setEasePeriod=function(value){
		this._easePeriod=value;
		return this;
	}

	__proto.setEaseOvershootOrAmplitude=function(value){
		this._easeOvershootOrAmplitude=value;
		return this;
	}

	__proto.setRepeat=function(repeat,yoyo){
		(yoyo===void 0)&& (yoyo=false);
		this._repeat=repeat;
		this._yoyo=yoyo;
		return this;
	}

	__proto.setTimeScale=function(value){
		this._timeScale=value;
		return this;
	}

	__proto.setSnapping=function(value){
		this._snapping=value;
		return this;
	}

	__proto.setTarget=function(value,propType){
		this._target=value;
		this._propType=propType;
		return this;
	}

	__proto.setUserData=function(value){
		this._userData=value;
		return this;
	}

	__proto.onUpdate=function(callback,caller){
		this._onUpdate=callback;
		this._onUpdateCaller=caller;
		return this;
	}

	__proto.onStart=function(callback,caller){
		this._onStart=callback;
		this._onStartCaller=caller;
		return this;
	}

	__proto.onComplete=function(callback,caller){
		this._onComplete=callback;
		this._onCompleteCaller=caller;
		return this;
	}

	__proto.setPaused=function(paused){
		this._paused=paused;
		return this;
	}

	/**
	*seek position of the tween,in seconds.
	*/
	__proto.seek=function(time){
		if (this._killed)
			return;
		this._elapsedTime=time;
		if (this._elapsedTime < this._delay){
			if (this._started)
				this._elapsedTime=this._delay;
			else
			return;
		}
		this.update();
	}

	__proto.kill=function(complete){
		(complete===void 0)&& (complete=false);
		if (this._killed)
			return;
		if (complete){
			if (this._ended==0){
				if (this._breakpoint >=0)
					this._elapsedTime=this._delay+this._breakpoint;
				else if (this._repeat >=0)
				this._elapsedTime=this._delay+this._duration *(this._repeat+1);
				else
				this._elapsedTime=this._delay+this._duration *2;
				this.update();
			}
			this.callCompleteCallback();
		}
		this._killed=true;
	}

	__proto._to=function(start,end,duration){
		this._valueSize=1;
		this._startValue.x=start;
		this._endValue.x=end;
		this._duration=duration;
		return this;
	}

	__proto._to2=function(start,start2,end,end2,duration){
		this._valueSize=2;
		this._startValue.x=start;
		this._endValue.x=end;
		this._startValue.y=start2;
		this._endValue.y=end2;
		this._duration=duration;
		return this;
	}

	__proto._to3=function(start,start2,start3,end,end2,end3,duration){
		this._valueSize=3;
		this._startValue.x=start;
		this._endValue.x=end;
		this._startValue.y=start2;
		this._endValue.y=end2;
		this._startValue.z=start3;
		this._endValue.z=end3;
		this._duration=duration;
		return this;
	}

	__proto._to4=function(start,start2,start3,start4,end,end2,end3,end4,duration){
		this._valueSize=4;
		this._startValue.x=start;
		this._endValue.x=end;
		this._startValue.y=start2;
		this._endValue.y=end2;
		this._startValue.z=start3;
		this._endValue.z=end3;
		this._startValue.w=start4;
		this._endValue.w=end4;
		this._duration=duration;
		return this;
	}

	__proto._toColor=function(start,end,duration){
		this._valueSize=4;
		this._startValue.color=start;
		this._endValue.color=end;
		this._duration=duration;
		return this;
	}

	__proto._shake=function(startX,startY,amplitude,duration){
		this._valueSize=5;
		this._startValue.x=startX;
		this._startValue.y=startY;
		this._startValue.w=amplitude;
		this._duration=duration;
		this._easeType=0;
		return this;
	}

	__proto._init=function(){
		this._delay=0;
		this._duration=0;
		this._breakpoint=-1;
		this._easeType=5;
		this._timeScale=1;
		this._easePeriod=0;
		this._easeOvershootOrAmplitude=1.70158;
		this._snapping=false;
		this._repeat=0;
		this._yoyo=false;
		this._valueSize=0;
		this._started=false;
		this._paused=false;
		this._killed=false;
		this._elapsedTime=0;
		this._normalizedTime=0;
		this._ended=0;
	}

	__proto._reset=function(){
		this._target=null;
		this._userData=null;
		this._onStart=this._onUpdate=this._onComplete=null;
		this._onStartCaller=this._onUpdateCaller=this._onCompleteCaller=null;
	}

	__proto._update=function(dt){
		if (this._timeScale !=1)
			dt *=this._timeScale;
		if (dt==0)
			return;
		if (this._ended !=0){
			this.callCompleteCallback();
			this._killed=true;
			return;
		}
		this._elapsedTime+=dt;
		this.update();
		if (this._ended !=0){
			if (!this._killed){
				this.callCompleteCallback();
				this._killed=true;
			}
		}
	}

	__proto.update=function(){
		this._ended=0;
		if (this._valueSize==0){
			if (this._elapsedTime >=this._delay+this._duration)
				this._ended=1;
			return;
		}
		if (!this._started){
			if (this._elapsedTime < this._delay)
				return;
			this._started=true;
			this.callStartCallback();
			if (this._killed)
				return;
		};
		var reversed=false;
		var tt=this._elapsedTime-this._delay;
		if (this._breakpoint >=0 && tt >=this._breakpoint){
			tt=this._breakpoint;
			this._ended=2;
		}
		if (this._repeat !=0){
			var round=Math.floor(tt / this._duration);
			tt-=this._duration *round;
			if (this._yoyo)
				reversed=round % 2==1;
			if (this._repeat > 0 && this._repeat-round < 0){
				if (this._yoyo)
					reversed=this._repeat % 2==1;
				tt=this._duration;
				this._ended=1;
			}
		}
		else if (tt >=this._duration){
			tt=this._duration;
			this._ended=1;
		}
		this._normalizedTime=EaseManager.evaluate(this._easeType,reversed ? (this._duration-tt):tt,this._duration,
		this._easeOvershootOrAmplitude,this._easePeriod);
		this._value.setZero();
		this._deltaValue.setZero();
		if (this._valueSize==5){
			if (this._ended==0){
				var r=this._startValue.w*(1-this._normalizedTime);
				var rx=(Math.random()*2-1)*r;
				var ry=(Math.random()*2-1)*r;
				rx=rx > 0 ? Math.ceil(rx):Math.floor(rx);
				ry=ry > 0 ? Math.ceil(ry):Math.floor(ry);
				this._deltaValue.x=rx;
				this._deltaValue.y=ry;
				this._value.x=this._startValue.x+rx;
				this._value.y=this._startValue.y+ry;
			}
			else{
				this._value.x=this._startValue.x;
				this._value.y=this._startValue.y;
			}
		}
		else{
			for (var i=0;i < this._valueSize;i++){
				var n1=this._startValue.getField(i);
				var n2=this._endValue.getField(i);
				var f=n1+(n2-n1)*this._normalizedTime;
				if (this._snapping)
					f=Math.round(f);
				this._deltaValue.setField(i,f-this._value.getField(i));
				this._value.setField(i,f);
			}
		}
		if (this._target !=null && this._propType !=null){
			if((typeof this._propType=='function')){
				switch(this._valueSize){
					case 1:
						this._propType.call(this._target,this._value.x);
						break ;
					case 2:
						this._propType.call(this._target,this._value.x,this._value.y);
						break ;
					case 3:
						this._propType.call(this._target,this._value.x,this._value.y,this._value.z);
						break ;
					case 4:
						this._propType.call(this._target,this._value.x,this._value.y,this._value.z,this._value.w);
						break ;
					case 5:
						this._propType.call(this._target,this._value.color);
						break ;
					case 6:
						this._propType.call(this._target,this._value.x,this._value.y);
						break ;
					}
			}
			else{
				if(this._valueSize==5)
					this._target[this._propType]=this._value.color;
				else
				this._target[this._propType]=this._value.x;
			}
		}
		this.callUpdateCallback();
	}

	__proto.callStartCallback=function(){
		if (this._onStart !=null){
			if(GTween.catchCallbackExceptions){
				try{
					this._onStart.call(this._onStartCaller,this);
				}
				catch(err){
					console.log("FairyGUI: error in start callback > "+err.message);
				}
			}
			else
			this._onStart.call(this._onStartCaller,this);
		}
	}

	__proto.callUpdateCallback=function(){
		if (this._onUpdate !=null){
			if(GTween.catchCallbackExceptions){
				try{
					this._onUpdate.call(this._onUpdateCaller,this);
				}
				catch(err){
					console.log("FairyGUI: error in update callback > "+err.message);
				}
			}
			else
			this._onUpdate.call(this._onUpdateCaller,this);
		}
	}

	__proto.callCompleteCallback=function(){
		if (this._onComplete !=null){
			if(GTween.catchCallbackExceptions){
				try{
					this._onComplete.call(this._onCompleteCaller,this);
				}
				catch(err){
					console.log("FairyGUI: error in complete callback > "+err.message);
				}
			}
			else
			this._onComplete.call(this._onCompleteCaller,this);
		}
	}

	__getset(0,__proto,'target',function(){
		return this._target;
	});

	__getset(0,__proto,'delay',function(){
		return this._delay;
	});

	__getset(0,__proto,'duration',function(){
		return this._duration;
	});

	__getset(0,__proto,'value',function(){
		return this._value;
	});

	__getset(0,__proto,'userData',function(){
		return this._userData;
	});

	__getset(0,__proto,'repeat',function(){
		return this._repeat;
	});

	__getset(0,__proto,'startValue',function(){
		return this._startValue;
	});

	__getset(0,__proto,'endValue',function(){
		return this._endValue;
	});

	__getset(0,__proto,'deltaValue',function(){
		return this._deltaValue;
	});

	__getset(0,__proto,'normalizedTime',function(){
		return this._normalizedTime;
	});

	__getset(0,__proto,'completed',function(){
		return this._ended !=0;
	});

	__getset(0,__proto,'allCompleted',function(){
		return this._ended==1;
	});

	return GTweener;
})()


//class fairygui.tween.TweenManager
var TweenManager=(function(){
	function TweenManager(){}
	__class(TweenManager,'fairygui.tween.TweenManager');
	TweenManager.createTween=function(){
		if (!TweenManager._inited){
			Laya.timer.frameLoop(1,null,TweenManager.update);
			TweenManager._inited=true;
		};
		var tweener;
		var cnt=TweenManager._tweenerPool.length;
		if (cnt > 0){
			tweener=TweenManager._tweenerPool.pop();
		}
		else
		tweener=new GTweener();
		tweener._init();
		TweenManager._activeTweens[TweenManager._totalActiveTweens++]=tweener;
		if (TweenManager._totalActiveTweens==TweenManager._activeTweens.length)
			TweenManager._activeTweens.length=TweenManager._activeTweens.length+Math.ceil(TweenManager._activeTweens.length *0.5);
		return tweener;
	}

	TweenManager.isTweening=function(target,propType){
		if (target==null)
			return false;
		var anyType=propType==null;
		for (var i=0;i < TweenManager._totalActiveTweens;i++){
			var tweener=TweenManager._activeTweens[i];
			if (tweener !=null && tweener.target==target && !tweener._killed
				&& (anyType || tweener._propType==propType))
			return true;
		}
		return false;
	}

	TweenManager.killTweens=function(target,completed,propType){
		if (target==null)
			return false;
		var flag=false;
		var cnt=TweenManager._totalActiveTweens;
		var anyType=propType==null;
		for (var i=0;i < cnt;i++){
			var tweener=TweenManager._activeTweens[i];
			if (tweener !=null && tweener.target==target && !tweener._killed
				&& (anyType || tweener._propType==propType)){
				tweener.kill(completed);
				flag=true;
			}
		}
		return flag;
	}

	TweenManager.getTween=function(target,propType){
		if (target==null)
			return null;
		var cnt=TweenManager._totalActiveTweens;
		var anyType=propType==null;
		for (var i=0;i < cnt;i++){
			var tweener=TweenManager._activeTweens[i];
			if (tweener !=null && tweener.target==target && !tweener._killed
				&& (anyType || tweener._propType==propType)){
				return tweener;
			}
		}
		return null;
	}

	TweenManager.update=function(){
		var dt=Laya.timer.delta/1000;
		var cnt=TweenManager._totalActiveTweens;
		var freePosStart=-1;
		var freePosCount=0;
		for (var i=0;i < cnt;i++){
			var tweener=TweenManager._activeTweens[i];
			if (tweener==null){
				if (freePosStart==-1)
					freePosStart=i;
				freePosCount++;
			}
			else if (tweener._killed){
				tweener._reset();
				TweenManager._tweenerPool.push(tweener);
				TweenManager._activeTweens[i]=null;
				if (freePosStart==-1)
					freePosStart=i;
				freePosCount++;
			}
			else{
				if(!tweener._paused)
					tweener._update(dt);
				if (freePosStart !=-1){
					TweenManager._activeTweens[freePosStart]=tweener;
					TweenManager._activeTweens[i]=null;
					freePosStart++;
				}
			}
		}
		if (freePosStart >=0){
			if (TweenManager._totalActiveTweens !=cnt){
				var j=cnt;
				cnt=TweenManager._totalActiveTweens-cnt;
				for (i=0;i < cnt;i++)
				TweenManager._activeTweens[freePosStart++]=TweenManager._activeTweens[j++];
			}
			TweenManager._totalActiveTweens=freePosStart;
		}
	}

	TweenManager._tweenerPool=[];
	TweenManager._totalActiveTweens=0;
	TweenManager._inited=false;
	__static(TweenManager,
	['_activeTweens',function(){return this._activeTweens=new Array(30);}
	]);
	return TweenManager;
})()


//class fairygui.tween.TweenValue
var TweenValue=(function(){
	function TweenValue(){
		this.x=NaN;
		this.y=NaN;
		this.z=NaN;
		this.w=NaN;
		this.x=this.y=this.z=this.w=0;
	}

	__class(TweenValue,'fairygui.tween.TweenValue');
	var __proto=TweenValue.prototype;
	__proto.getField=function(index){
		switch (index){
			case 0:
				return this.x;
			case 1:
				return this.y;
			case 2:
				return this.z;
			case 3:
				return this.w;
			default :
				throw new Error("Index out of bounds: "+index);
			}
	}

	__proto.setField=function(index,value){
		switch (index){
			case 0:
				this.x=value;
				break ;
			case 1:
				this.y=value;
				break ;
			case 2:
				this.z=value;
				break ;
			case 3:
				this.w=value;
				break ;
			default :
				throw new Error("Index out of bounds: "+index);
			}
	}

	__proto.setZero=function(){
		this.x=this.y=this.z=this.w=0;
	}

	__getset(0,__proto,'color',function(){
		return (this.w<<24)+(this.x<<16)+(this.y<<8)+this.z;
		},function(value){
		this.x=(value & 0xFF0000)>>16;
		this.y=(value & 0x00FF00)>>8;
		this.z=(value & 0x0000FF);
		this.w=(value & 0xFF000000)>>24;
	});

	return TweenValue;
})()


//class fairygui.UIConfig
var UIConfig$1=(function(){
	function UIConfig(){}
	__class(UIConfig,'fairygui.UIConfig',null,'UIConfig$1');
	UIConfig.defaultFont="SimSun";
	UIConfig.windowModalWaiting=null;
	UIConfig.globalModalWaiting=null;
	UIConfig.modalLayerColor="rgba(33,33,33,0.2)";
	UIConfig.buttonSound=null;
	UIConfig.buttonSoundVolumeScale=1;
	UIConfig.horizontalScrollBar=null;
	UIConfig.verticalScrollBar=null;
	UIConfig.defaultScrollStep=25;
	UIConfig.defaultScrollDecelerationRate=0.967;
	UIConfig.defaultScrollBarDisplay=1;
	UIConfig.defaultScrollTouchEffect=true;
	UIConfig.defaultScrollBounceEffect=true;
	UIConfig.popupMenu=null;
	UIConfig.popupMenu_seperator=null;
	UIConfig.loaderErrorSign=null;
	UIConfig.tooltipsWin=null;
	UIConfig.defaultComboBoxVisibleItemCount=10;
	UIConfig.touchScrollSensitivity=20;
	UIConfig.touchDragSensitivity=10;
	UIConfig.clickDragSensitivity=2;
	UIConfig.bringWindowToFrontOnClick=true;
	UIConfig.frameTimeForAsyncUIConstruction=2;
	UIConfig.textureLinearSampling=true;
	UIConfig.packageFileExtension="fui";
	return UIConfig;
})()


//class fairygui.UIObjectFactory
var UIObjectFactory=(function(){
	function UIObjectFactory(){}
	__class(UIObjectFactory,'fairygui.UIObjectFactory');
	UIObjectFactory.setPackageItemExtension=function(url,type){
		if (url==null)
			throw new Error("Invaild url: "+url);
		var pi=UIPackage.getItemByURL(url);
		if (pi !=null)
			pi.extensionType=type;
		UIObjectFactory.packageItemExtensions[url]=type;
	}

	UIObjectFactory.setLoaderExtension=function(type){
		fairygui.UIObjectFactory.loaderType=type;
	}

	UIObjectFactory.resolvePackageItemExtension=function(pi){
		pi.extensionType=UIObjectFactory.packageItemExtensions["ui://"+pi.owner.id+pi.id];
		if(!pi.extensionType)
			pi.extensionType=UIObjectFactory.packageItemExtensions["ui://"+pi.owner.name+"/"+pi.name];
	}

	UIObjectFactory.newObject=function(pi){
		if(pi.extensionType!=null)
			return new pi.extensionType();
		else
		return UIObjectFactory.newObject2(pi.objectType);
	}

	UIObjectFactory.newObject2=function(type){
		switch (type){
			case 0:
				return new GImage();
			case 1:
				return new GMovieClip();
			case 9:
				return new GComponent();
			case 6:
				return new GBasicTextField();
			case 7:
				return new GRichTextField();
			case 8:
				return new GTextInput();
			case 5:
				return new GGroup();
			case 10:
				return new GList();
			case 3:
				return new GGraph();
			case 4:
				if (fairygui.UIObjectFactory.loaderType !=null)
					return new fairygui.UIObjectFactory.loaderType();
				else
				return new GLoader();
			case 12:
				return new GButton();
			case 11:
				return new GLabel();
			case 14:
				return new GProgressBar();
			case 15:
				return new GSlider();
			case 16:
				return new GScrollBar();
			case 13:
				return new GComboBox();
			default :
				return null;
			}
	}

	UIObjectFactory.packageItemExtensions={};
	UIObjectFactory.loaderType=null;
	return UIObjectFactory;
})()


//class fairygui.UIPackage
var UIPackage=(function(){
	var AtlasSprite;
	function UIPackage(){
		this._id=null;
		this._name=null;
		this._items=null;
		this._itemsById=null;
		this._itemsByName=null;
		this._customId=null;
		this._sprites=null;
		this._items=[];
		this._itemsById={};
		this._itemsByName={};
		this._sprites={};
	}

	__class(UIPackage,'fairygui.UIPackage');
	var __proto=UIPackage.prototype;
	__proto.loadPackage=function(buffer,resKey){
		if (buffer.getUint32()!=0x46475549)
			throw new Error("FairyGUI: old package format found in '"+resKey+"'");
		buffer.version=buffer.getInt32();
		var compressed=buffer.readBool();
		this._id=buffer.readUTFString();
		this._name=buffer.readUTFString();
		buffer.skip(20);
		if(compressed){
			var buf=new Uint8Array(buffer.buffer,buffer.pos,buffer.length-buffer.pos);
			var inflater=new Zlib.RawInflate(buf);buf=inflater.decompress();;
			buffer=new ByteBuffer(buf);
		};
		var indexTablePos=buffer.pos;
		var cnt=0;
		var i=0;
		var nextPos=0;
		buffer.seek(indexTablePos,4);
		cnt=buffer.getInt32();
		var stringTable=__newvec(cnt);
		for (i=0;i < cnt;i++)
		stringTable[i]=buffer.readUTFString();
		buffer.stringTable=stringTable;
		buffer.seek(indexTablePos,1);
		var pi;
		resKey=resKey+"_";
		cnt=buffer.getUint16();
		for (i=0;i < cnt;i++){
			nextPos=buffer.getInt32();
			nextPos+=buffer.pos;
			pi=new PackageItem();
			pi.owner=this;
			pi.type=buffer.readByte();
			pi.id=buffer.readS();
			pi.name=buffer.readS();
			buffer.readS();
			pi.file=buffer.readS();
			buffer.readBool();
			pi.width=buffer.getInt32();
			pi.height=buffer.getInt32();
			switch (pi.type){
				case 0:{
						pi.objectType=0;
						var scaleOption=buffer.readByte();
						if (scaleOption==1){
							pi.scale9Grid=new laya.maths.Rectangle();
							pi.scale9Grid.x=buffer.getInt32();
							pi.scale9Grid.y=buffer.getInt32();
							pi.scale9Grid.width=buffer.getInt32();
							pi.scale9Grid.height=buffer.getInt32();
							pi.tileGridIndice=buffer.getInt32();
						}
						else if (scaleOption==2)
						pi.scaleByTile=true;
						pi.smoothing=buffer.readBool();
						break ;
					}
				case 1:{
						pi.smoothing=buffer.readBool();
						pi.objectType=1;
						pi.rawData=buffer.readBuffer();
						break ;
					}
				case 5:{
						pi.rawData=buffer.readBuffer();
						break ;
					}
				case 3:{
						var extension=buffer.readByte();
						if (extension > 0)
							pi.objectType=extension;
						else
						pi.objectType=9;
						pi.rawData=buffer.readBuffer();
						UIObjectFactory.resolvePackageItemExtension(pi);
						break ;
					}
				case 4:
				case 2:
				case 7:{
						pi.file=resKey+pi.file;
						break ;
					}
				}
			this._items.push(pi);
			this._itemsById[pi.id]=pi;
			if (pi.name !=null)
				this._itemsByName[pi.name]=pi;
			buffer.pos=nextPos;
		}
		buffer.seek(indexTablePos,2);
		cnt=buffer.getUint16();
		for (i=0;i < cnt;i++){
			nextPos=buffer.getUint16();
			nextPos+=buffer.pos;
			var itemId=buffer.readS();
			pi=this._itemsById[buffer.readS()];
			var sprite=new AtlasSprite();
			sprite.atlas=pi;
			sprite.rect.x=buffer.getInt32();
			sprite.rect.y=buffer.getInt32();
			sprite.rect.width=buffer.getInt32();
			sprite.rect.height=buffer.getInt32();
			sprite.rotated=buffer.readBool();
			this._sprites[itemId]=sprite;
			buffer.pos=nextPos;
		}
		if (buffer.seek(indexTablePos,3)){
			cnt=buffer.getUint16();
			for (i=0;i < cnt;i++){
				nextPos=buffer.getInt32();
				nextPos+=buffer.pos;
				pi=this._itemsById[buffer.readS()];
				if (pi && pi.type==0){
					pi.pixelHitTestData=new PixelHitTestData();
					pi.pixelHitTestData.load(buffer);
				}
				buffer.pos=nextPos;
			}
		}
	}

	__proto.loadAllAssets=function(){
		var cnt=this._items.length;
		for(var i=0;i < cnt;i++){
			var pi=this._items[i];
			this.getItemAsset(pi);
		}
	}

	__proto.unloadAssets=function(){
		var cnt=this._items.length;
		for(var i=0;i < cnt;i++){
			var pi=this._items[i];
			if(pi.type==4){
				if(pi.texture!=null)
					Laya.loader.clearTextureRes(pi.texture.url);
			}
		}
	}

	__proto.dispose=function(){
		var cnt=this._items.length;
		for(var i=0;i < cnt;i++){
			var pi=this._items[i];
			if(pi.type==4){
				if(pi.texture!=null){
					pi.texture.destroy();
					pi.texture=null;
				}
			}
			else if(pi.type==2){
				SoundManager.destroySound(pi.file);
			}
		}
	}

	__proto.createObject=function(resName,userClass){
		var pi=this._itemsByName[resName];
		if (pi)
			return this.internalCreateObject(pi,userClass);
		else
		return null;
	}

	__proto.internalCreateObject=function(item,userClass){
		var g;
		if (item.type==3){
			if (userClass !=null)
				g=new userClass();
			else
			g=UIObjectFactory.newObject(item);
		}
		else
		g=UIObjectFactory.newObject(item);
		if (g==null)
			return null;
		fairygui.UIPackage._constructing++;
		g.packageItem=item;
		g.constructFromResource();
		fairygui.UIPackage._constructing--;
		return g;
	}

	__proto.getItemById=function(itemId){
		return this._itemsById[itemId];
	}

	__proto.getItemByName=function(resName){
		return this._itemsByName[resName];
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
					else
					item.texture=null;
				}
				return item.texture;
			case 4:
				if (!item.decoded){
					item.decoded=true;
					item.texture=AssetProxy.inst.getRes(item.file);
				}
				return item.texture;
			case 5:
				if (!item.decoded){
					item.decoded=true;
					this.loadFont(item);
				}
				return item.bitmapFont;
			case 1:
				if (!item.decoded){
					item.decoded=true;
					this.loadMovieClip(item);
				}
				return item.frames;
			case 3:
				return item.rawData;
			case 7:
				if(item.file)
					return AssetProxy.inst.getRes(item.file);
				else
				return null;
			default :
				return null;
			}
	}

	__proto.createSpriteTexture=function(sprite){
		var atlasTexture=(this.getItemAsset(sprite.atlas));
		return Texture.createFromTexture(atlasTexture,
		sprite.rect.x,sprite.rect.y,sprite.rect.width,sprite.rect.height);
	}

	__proto.loadMovieClip=function(item){
		var buffer=item.rawData;
		buffer.seek(0,0);
		item.interval=buffer.getInt32();
		item.swing=buffer.readBool();
		item.repeatDelay=buffer.getInt32();
		buffer.seek(0,1);
		var frameCount=buffer.getInt16();
		item.frames=__newvec(frameCount);
		var spriteId;
		var frame;
		var sprite;
		for (var i=0;i < frameCount;i++){
			var nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			frame=new Frame();
			frame.rect.x=buffer.getInt32();
			frame.rect.y=buffer.getInt32();
			frame.rect.width=buffer.getInt32();
			frame.rect.height=buffer.getInt32();
			frame.addDelay=buffer.getInt32();
			spriteId=buffer.readS();
			if (spriteId !=null && (sprite=this._sprites[spriteId])!=null)
				frame.texture=this.createSpriteTexture(sprite);
			item.frames[i]=frame;
			buffer.pos=nextPos;
		}
	}

	__proto.loadFont=function(item){
		var font=new BitmapFont$1();
		item.bitmapFont=font;
		var buffer=item.rawData;
		buffer.seek(0,0);
		font.ttf=buffer.readBool();
		buffer.readBool();
		font.resizable=buffer.readBool();
		buffer.readBool();
		font.size=buffer.getInt32();
		var xadvance=buffer.getInt32();
		var lineHeight=buffer.getInt32();
		var mainTexture=null;
		var mainSprite=this._sprites[item.id];
		if (mainSprite!=null)
			mainTexture=(this.getItemAsset(mainSprite.atlas));
		buffer.seek(0,1);
		var bg=null;
		var cnt=buffer.getInt32();
		for (var i=0;i < cnt;i++){
			var nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			bg=new BMGlyph();
			var ch=buffer.readChar();
			font.glyphs[ch]=bg;
			var img=buffer.readS();
			var bx=buffer.getInt32();
			var by=buffer.getInt32();
			bg.offsetX=buffer.getInt32();
			bg.offsetY=buffer.getInt32();
			bg.width=buffer.getInt32();
			bg.height=buffer.getInt32();
			bg.advance=buffer.getInt32();
			bg.channel=buffer.readByte();
			if (bg.channel==1)
				bg.channel=3;
			else if (bg.channel==2)
			bg.channel=2;
			else if (bg.channel==3)
			bg.channel=1;
			if (!font.ttf){
				var charImg=this._itemsById[img];
				if (charImg){
					this.getItemAsset(charImg);
					bg.width=charImg.width;
					bg.height=charImg.height;
					bg.texture=charImg.texture;
				}
			}
			else{
				bg.texture=Texture.createFromTexture(mainTexture,
				bx+mainSprite.rect.x,by+mainSprite.rect.y,bg.width,bg.height);
			}
			if (font.ttf)
				bg.lineHeight=lineHeight;
			else{
				if (bg.advance==0){
					if (xadvance==0)
						bg.advance=bg.offsetX+bg.width;
					else
					bg.advance=xadvance;
				}
				bg.lineHeight=bg.offsetY < 0 ? bg.height :(bg.offsetY+bg.height);
				if (bg.lineHeight < font.size)
					bg.lineHeight=font.size;
			}
			buffer.pos=nextPos;
		}
	}

	__getset(0,__proto,'id',function(){
		return this._id;
	});

	__getset(0,__proto,'name',function(){
		return this._name;
	});

	__getset(0,__proto,'customId',function(){
		return this._customId;
		},function(value){
		if (this._customId !=null)
			delete fairygui.UIPackage._packageInstById[this._customId];
		this._customId=value;
		if (this._customId !=null)
			fairygui.UIPackage._packageInstById[this._customId]=this;
	});

	UIPackage.getById=function(id){
		return fairygui.UIPackage._packageInstById[id];
	}

	UIPackage.getByName=function(name){
		return fairygui.UIPackage._packageInstByName[name];
	}

	UIPackage.addPackage=function(resKey,descData){
		if(!descData){
			descData=AssetProxy.inst.getRes(resKey+"."+UIConfig$1.packageFileExtension);
			if(!descData || descData.byteLength==0)
				throw new Error("package resource not ready: "+resKey);
		};
		var buffer=new ByteBuffer(descData);
		var pkg=new UIPackage();
		pkg.loadPackage(buffer,resKey);
		fairygui.UIPackage._packageInstById[pkg.id]=pkg;
		fairygui.UIPackage._packageInstByName[pkg.name]=pkg;
		pkg.customId=resKey;
		return pkg;
	}

	UIPackage.removePackage=function(packageIdOrName){
		var pkg=fairygui.UIPackage._packageInstById[packageIdOrName];
		if(!pkg)
			pkg=fairygui.UIPackage._packageInstByName[packageIdOrName];
		if(!pkg)
			throw new Error("unknown package: "+packageIdOrName);
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
			return pi.owner.internalCreateObject(pi,userClass);
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
		var pos1=url.indexOf("//");
		if (pos1==-1)
			return null;
		var pos2=url.indexOf("/",pos1+2);
		if (pos2==-1){
			if (url.length > 13){
				var pkgId=url.substr(5,8);
				var pkg=UIPackage.getById(pkgId);
				if (pkg !=null){
					var srcId=url.substr(13);
					return pkg.getItemById(srcId);
				}
			}
		}
		else{
			var pkgName=url.substr(pos1+2,pos2-pos1-2);
			pkg=UIPackage.getByName(pkgName);
			if (pkg !=null){
				var srcName=url.substr(pos2+1);
				return pkg.getItemByName(srcName);
			}
		}
		return null;
	}

	UIPackage.getItemAssetByURL=function(url){
		var item=UIPackage.getItemByURL(url);
		if (item==null)
			return null;
		return item.owner.getItemAsset(item);
	}

	UIPackage.normalizeURL=function(url){
		if(url==null)
			return null;
		var pos1=url.indexOf("//");
		if (pos1==-1)
			return null;
		var pos2=url.indexOf("/",pos1+2);
		if (pos2==-1)
			return url;
		var pkgName=url.substr(pos1+2,pos2-pos1-2);
		var srcName=url.substr(pos2+1);
		return UIPackage.getItemURL(pkgName,srcName);
	}

	UIPackage.setStringsSource=function(source){
		TranslationHelper.loadFromXML(source);
	}

	UIPackage._constructing=0;
	UIPackage._packageInstById={};
	UIPackage._packageInstByName={};
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


//class fairygui.utils.PixelHitTestData
var PixelHitTestData=(function(){
	function PixelHitTestData(){
		this.pixelWidth=0;
		this.scale=NaN;
		this.pixels=null;
	}

	__class(PixelHitTestData,'fairygui.utils.PixelHitTestData');
	var __proto=PixelHitTestData.prototype;
	__proto.load=function(ba){
		ba.getInt32();
		this.pixelWidth=ba.getInt32();
		this.scale=1/ba.readByte();
		var len=ba.getInt32();
		this.pixels=__newvec(len);
		for(var i=0;i<len;i++){
			var j=ba.readByte();
			if(j<0)
				j+=256;
			this.pixels[i]=j;
		}
	}

	return PixelHitTestData;
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

	ToolSet.clamp=function(value,min,max){
		if(value<min)
			value=min;
		else if(value>max)
		value=max;
		return value;
	}

	ToolSet.clamp01=function(value){
		if(value>1)
			value=1;
		else if(value<0)
		value=0;
		return value;
	}

	ToolSet.lerp=function(start,end,percent){
		return (start+percent*(end-start));
	}

	__static(ToolSet,
	['defaultUBBParser',function(){return this.defaultUBBParser=new UBBParser();}
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
		var pos1=this._readPos;
		var pos2=0;
		var result="";
		while ((pos2=this._text.indexOf("[",pos1))!=-1){
			if (this._text.charCodeAt(pos2-1)==92){
				result+=this._text.substring(pos1,pos2-1);
				result+="[";
				pos1=pos2+1;
			}
			else{
				result+=this._text.substring(pos1,pos2);
				break ;
			}
		}
		if (pos2==-1)
			return null;
		if (remove)
			this._readPos=pos2;
		return result;
	}

	__proto.parse=function(text,remove){
		(remove===void 0)&& (remove=false);
		this._text=text;
		var pos1=0,pos2=0,pos3=0;
		var end=false;
		var tag,attr;
		var repl;
		var func;
		var result="";
		while((pos2=this._text.indexOf("[",pos1))!=-1){
			if (pos2 > 0 && this._text.charCodeAt(pos2-1)==92){
				result+=this._text.substring(pos1,pos2-1);
				result+="[";
				pos1=pos2+1;
				continue ;
			}
			result+=this._text.substring(pos1,pos2);
			pos1=pos2;
			pos2=this._text.indexOf("]",pos1);
			if(pos2==-1)
				break ;
			end=this._text.charAt(pos1+1)=='/';
			tag=this._text.substring(end?pos1+2:pos1+1,pos2);
			this._readPos=pos2+1;
			attr=null;
			repl=null;
			pos3=tag.indexOf("=");
			if(pos3!=-1){
				attr=tag.substring(pos3+1);
				tag=tag.substring(0,pos3);
			}
			tag=tag.toLowerCase();
			func=this._handlers[tag];
			if(func!=null){
				if(!remove){
					repl=func.call(this,tag,end,attr);
					if(repl!=null)
						result+=repl;
				}
			}
			else
			result+=this._text.substring(pos1,this._readPos);
			pos1=this._readPos;
		}
		if (pos1 < this._text.length)
			result+=this._text.substr(pos1);
		this._text=null;
		return result;
	}

	__static(UBBParser,
	['inst',function(){return this.inst=new UBBParser();}
	]);
	return UBBParser;
})()


//class fairygui.utils.ColorMatrix extends Array
var ColorMatrix=(function(_super){
	// initialization:
	function ColorMatrix(){
		ColorMatrix.__super.call(this);
		this.reset();
	}

	__class(ColorMatrix,'fairygui.utils.ColorMatrix',Array);
	var __proto=ColorMatrix.prototype;
	// public methods:
	__proto.reset=function(){
		for (var i=0;i<ColorMatrix.LENGTH;i++){
			this[i]=ColorMatrix.IDENTITY_MATRIX[i];
		}
	}

	__proto.invert=function(){
		this.multiplyMatrix([-1,0,0,0,255,
		0,-1,0,0,255,
		0,0,-1,0,255,
		0,0,0,1,0]);
	}

	__proto.adjustColor=function(p_brightness,p_contrast,p_saturation,p_hue){
		this.adjustHue(p_hue);
		this.adjustContrast(p_contrast);
		this.adjustBrightness(p_brightness);
		this.adjustSaturation(p_saturation);
	}

	__proto.adjustBrightness=function(p_val){
		p_val=this.cleanValue(p_val,1)*255;
		this.multiplyMatrix([
		1,0,0,0,p_val,
		0,1,0,0,p_val,
		0,0,1,0,p_val,
		0,0,0,1,0]);
	}

	__proto.adjustContrast=function(p_val){
		p_val=this.cleanValue(p_val,1);
		var s=p_val+1;
		var o=128 *(1-s);
		this.multiplyMatrix([
		s,0,0,0,o,
		0,s,0,0,o,
		0,0,s,0,o,
		0,0,0,1,0]);
	}

	__proto.adjustSaturation=function(p_val){
		p_val=this.cleanValue(p_val,1);
		p_val+=1;
		var invSat=1-p_val;
		var invLumR=invSat *0.299;
		var invLumG=invSat *0.587;
		var invLumB=invSat *0.114;
		this.multiplyMatrix([
		(invLumR+p_val),invLumG,invLumB,0,0,
		invLumR,(invLumG+p_val),invLumB,0,0,
		invLumR,invLumG,(invLumB+p_val),0,0,
		0,0,0,1,0]);
	}

	__proto.adjustHue=function(p_val){
		p_val=this.cleanValue(p_val,1);
		p_val *=Math.PI;
		var cos=Math.cos(p_val);
		var sin=Math.sin(p_val);
		this.multiplyMatrix([
		((0.299+(cos *(1-0.299)))+(sin *-(0.299))),((0.587+(cos *-(0.587)))+(sin *-(0.587))),((0.114+(cos *-(0.114)))+(sin *(1-0.114))),0,0,
		((0.299+(cos *-(0.299)))+(sin *0.143)),((0.587+(cos *(1-0.587)))+(sin *0.14)),((0.114+(cos *-(0.114)))+(sin *-0.283)),0,0,
		((0.299+(cos *-(0.299)))+(sin *-((1-0.299)))),((0.587+(cos *-(0.587)))+(sin *0.587)),((0.114+(cos *(1-0.114)))+(sin *0.114)),0,0,
		0,0,0,1,0]);
	}

	__proto.concat=function(p_matrix){
		if (p_matrix.length !=ColorMatrix.LENGTH){return;}
			this.multiplyMatrix(p_matrix);
	}

	__proto.clone=function(){
		var result=new ColorMatrix();
		result.copyMatrix(this);
		return result;
	}

	__proto.copyMatrix=function(p_matrix){
		var l=ColorMatrix.LENGTH;
		for (var i=0;i<l;i++){
			this[i]=p_matrix[i];
		}
	}

	__proto.multiplyMatrix=function(p_matrix){
		var col=[];
		var i=0;
		for (var y=0;y<4;++y){
			for (var x=0;x<5;++x){
				col[i+x]=p_matrix[i] *this[x]+
				p_matrix[i+1] *this[x+5]+
				p_matrix[i+2] *this[x+10]+
				p_matrix[i+3] *this[x+15]+
				(x==4 ? p_matrix[i+4] :0);
			}
			i+=5;
		}
		this.copyMatrix(col);
	}

	__proto.cleanValue=function(p_val,p_limit){
		return Math.min(p_limit,Math.max(-p_limit,p_val));
	}

	ColorMatrix.create=function(p_brightness,p_contrast,p_saturation,p_hue){
		var ret=new ColorMatrix();
		ret.adjustColor(p_brightness,p_contrast,p_saturation,p_hue);
		return ret;
	}

	ColorMatrix.LUMA_R=0.299;
	ColorMatrix.LUMA_G=0.587;
	ColorMatrix.LUMA_B=0.114;
	__static(ColorMatrix,
	['IDENTITY_MATRIX',function(){return this.IDENTITY_MATRIX=[
		1,0,0,0,0,
		0,1,0,0,0,
		0,0,1,0,0,
		0,0,0,1,0];},'LENGTH',function(){return this.LENGTH=ColorMatrix.IDENTITY_MATRIX.length;}
	]);
	return ColorMatrix;
})(Array)


//class fairygui.Controller extends laya.events.EventDispatcher
var Controller=(function(_super){
	function Controller(){
		this._selectedIndex=0;
		this._previousIndex=0;
		this._pageIds=null;
		this._pageNames=null;
		this._actions=null;
		this.name=null;
		this.parent=null;
		this.autoRadioGroupDepth=false;
		this.changing=false;
		Controller.__super.call(this);
		this._pageIds=[];
		this._pageNames=[];
		this._selectedIndex=-1;
		this._previousIndex=-1;
	}

	__class(Controller,'fairygui.Controller',_super);
	var __proto=Controller.prototype;
	__proto.dispose=function(){
		this.offAll();
	}

	//功能和设置selectedIndex一样，但不会触发事件
	__proto.setSelectedIndex=function(value){
		(value===void 0)&& (value=0);
		if (this._selectedIndex !=value){
			if(value > this._pageIds.length-1)
				throw "index out of bounds: "+value;
			this.changing=true;
			this._previousIndex=this._selectedIndex;
			this._selectedIndex=value;
			this.parent.applyController(this);
			this.changing=false;
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
			this.parent.applyController(this);
		}
	}

	__proto.removePageAt=function(index){
		(index===void 0)&& (index=0);
		this._pageIds.splice(index,1);
		this._pageNames.splice(index,1);
		if (this._selectedIndex >=this._pageIds.length)
			this.selectedIndex=this._selectedIndex-1;
		else
		this.parent.applyController(this);
	}

	__proto.clearPages=function(){
		this._pageIds.length=0;
		this._pageNames.length=0;
		if (this._selectedIndex !=-1)
			this.selectedIndex=-1;
		else
		this.parent.applyController(this);
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

	__proto.runActions=function(){
		if(this._actions){
			var cnt=this._actions.length;
			for(var i=0;i<cnt;i++){
				this._actions[i].run(this,this.previousPageId,this.selectedPageId);
			}
		}
	}

	__proto.setup=function(buffer){
		var beginPos=buffer.pos;
		buffer.seek(beginPos,0);
		this.name=buffer.readS();
		this.autoRadioGroupDepth=buffer.readBool();
		buffer.seek(beginPos,1);
		var i=0;
		var nextPos=0;
		var cnt=buffer.getInt16();
		for (i=0;i < cnt;i++){
			this._pageIds.push(buffer.readS());
			this._pageNames.push(buffer.readS());
		}
		buffer.seek(beginPos,2);
		cnt=buffer.getInt16();
		if (cnt > 0){
			if (this._actions==null)
				this._actions=[];
			for (i=0;i < cnt;i++){
				nextPos=buffer.getInt16();
				nextPos+=buffer.pos;
				var action=ControllerAction.createAction(buffer.readByte());
				action.setup(buffer);
				this._actions.push(action);
				buffer.pos=nextPos;
			}
		}
		if (this.parent !=null && this._pageIds.length > 0)
			this._selectedIndex=0;
		else
		this._selectedIndex=-1;
	}

	__getset(0,__proto,'selectedIndex',function(){
		return this._selectedIndex;
		},function(value){
		if(this._selectedIndex !=value){
			if(value > this._pageIds.length-1)
				throw "index out of bounds: "+value;
			this.changing=true;
			this._previousIndex=this._selectedIndex;
			this._selectedIndex=value;
			this.parent.applyController(this);
			this.event("fui_state_changed");
			this.changing=false;
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

	__getset(0,__proto,'selectedPageId',function(){
		if (this._selectedIndex==-1)
			return null;
		else
		return this._pageIds[this._selectedIndex];
		},function(val){
		var i=this._pageIds.indexOf(val);
		this.selectedIndex=i;
	});

	__getset(0,__proto,'previousPageId',function(){
		if(this._previousIndex==-1)
			return null;
		else
		return this._pageIds[this._previousIndex];
	});

	__getset(0,__proto,'oppositePageId',null,function(val){
		var i=this._pageIds.indexOf(val);
		if(i > 0)
			this.selectedIndex=0;
		else if(this._pageIds.length > 1)
		this.selectedIndex=1;
	});

	Controller._nextPageId=0;
	return Controller;
})(EventDispatcher)


//class fairygui.utils.ByteBuffer extends laya.utils.Byte
var ByteBuffer=(function(_super){
	function ByteBuffer(data,offset,length){
		this.stringTable=null;
		this.version=0;
		(offset===void 0)&& (offset=0);
		(length===void 0)&& (length=-1);
		if(length==-1)
			length=data.byteLength-offset;
		if(offset==0 && length==data.byteLength)
			ByteBuffer.__super.call(this,data);
		else{
			this._u8d_=new Uint8Array(data,offset,length);
			this._d_=new DataView(this._u8d_.buffer,offset,length);
			this._length=length;
		}
		this.endian="bigEndian";
	}

	__class(ByteBuffer,'fairygui.utils.ByteBuffer',_super);
	var __proto=ByteBuffer.prototype;
	__proto.skip=function(count){
		this.pos+=count;
	}

	__proto.readBool=function(){
		return this.getUint8()==1;
	}

	__proto.readS=function(){
		var index=this.getUint16();
		if (index==65534)
			return null;
		else if (index==65533)
		return ""
		else
		return this.stringTable[index];
	}

	__proto.writeS=function(value){
		var index=this.getUint16();
		if (index !=65534 && index !=65533)
			this.stringTable[index]=value;
	}

	__proto.readColor=function(hasAlpha){
		(hasAlpha===void 0)&& (hasAlpha=false);
		var r=this.getUint8();
		var g=this.getUint8();
		var b=this.getUint8();
		var a=this.getUint8();
		return (hasAlpha?(a<<24):0)+(r<<16)+(g<<8)+b;
	}

	__proto.readColorS=function(hasAlpha){
		(hasAlpha===void 0)&& (hasAlpha=false);
		var r=this.getUint8();
		var g=this.getUint8();
		var b=this.getUint8();
		var a=this.getUint8();
		if(hasAlpha && a!=255)
			return "rgba("+r+","+g+","+b+","+(a/255)+")";
		else{
			var sr=r.toString(16);
			var sg=g.toString(16);
			var sb=b.toString(16);
			if (sr.length==1)
				sr="0"+sr;
			if (sg.length==1)
				sg="0"+sg;
			if (sb.length==1)
				sb="0"+sb;
			return "#"+sr+sg+sb;
		}
	}

	__proto.readChar=function(){
		var i=this.getUint16();
		return String.fromCharCode(i);
	}

	__proto.readBuffer=function(){
		var count=this.getUint32();
		var ba=new ByteBuffer(this.buffer,this._pos_,count);
		ba.stringTable=this.stringTable;
		ba.version=this.version;
		return ba;
	}

	__proto.seek=function(indexTablePos,blockIndex){
		var tmp=this._pos_;
		this.pos=indexTablePos;
		var segCount=this.getUint8();
		if (blockIndex < segCount){
			var useShort=this.getUint8()==1;
			var newPos=0;
			if (useShort){
				this.pos+=2 *blockIndex;
				newPos=this.getUint16();
			}
			else{
				this.pos+=4 *blockIndex;
				newPos=this.getUint32();
			}
			if (newPos > 0){
				this.pos=indexTablePos+newPos;
				return true;
			}
			else{
				this.pos=tmp;
				return false;
			}
		}
		else{
			this.pos=tmp;
			return false;
		}
	}

	return ByteBuffer;
})(Byte)


//class fairygui.utils.ChildHitArea extends laya.utils.HitArea
var ChildHitArea=(function(_super){
	function ChildHitArea(child,reversed){
		this._child=null;
		this._reversed=false;
		ChildHitArea.__super.call(this);
		this._child=child;
		this._reversed=reversed;
		if(this._reversed)
			this.unHit=child.hitArea.hit;
		else
		this.hit=child.hitArea.hit;
	}

	__class(ChildHitArea,'fairygui.utils.ChildHitArea',_super);
	var __proto=ChildHitArea.prototype;
	__proto.contains=function(x,y){
		var tPos;
		tPos=Point.TEMP;
		tPos.setTo(0,0);
		tPos=this._child.toParentPoint(tPos);
		if (this._reversed)
			return !HitArea._isHitGraphic(x-tPos.x,y-tPos.y,this.unHit);
		else
		return HitArea._isHitGraphic(x-tPos.x,y-tPos.y,this.hit);
	}

	return ChildHitArea;
})(HitArea)


//class fairygui.utils.PixelHitTest extends laya.utils.HitArea
var PixelHitTest=(function(_super){
	function PixelHitTest(data,offsetX,offsetY){
		this._data=null;
		this.offsetX=0;
		this.offsetY=0;
		this.scaleX=NaN;
		this.scaleY=NaN;
		PixelHitTest.__super.call(this);
		(offsetX===void 0)&& (offsetX=0);
		(offsetY===void 0)&& (offsetY=0);
		this._data=data;
		this.offsetX=offsetX;
		this.offsetY=offsetY;
		this.scaleX=1;
		this.scaleY=1;
	}

	__class(PixelHitTest,'fairygui.utils.PixelHitTest',_super);
	var __proto=PixelHitTest.prototype;
	__proto.contains=function(x,y){
		x=Math.floor((x / this.scaleX-this.offsetX)*this._data.scale);
		y=Math.floor((y / this.scaleY-this.offsetY)*this._data.scale);
		if (x < 0 || y < 0 || x >=this._data.pixelWidth)
			return false;
		var pos=y *this._data.pixelWidth+x;
		var pos2=Math.floor(pos / 8);
		var pos3=pos % 8;
		if (pos2 >=0 && pos2 < this._data.pixels.length)
			return ((this._data.pixels[pos2] >> pos3)& 0x1)==1;
		else
		return false;
	}

	return PixelHitTest;
})(HitArea)


//class fairygui.action.ChangePageAction extends fairygui.action.ControllerAction
var ChangePageAction=(function(_super){
	function ChangePageAction(){
		this.objectId=null;
		this.controllerName=null;
		this.targetPage=null;
		ChangePageAction.__super.call(this);
	}

	__class(ChangePageAction,'fairygui.action.ChangePageAction',_super);
	var __proto=ChangePageAction.prototype;
	__proto.enter=function(controller){
		if(!this.controllerName)
			return;
		var gcom;
		if(this.objectId)
			gcom=controller.parent.getChildById(this.objectId);
		else
		gcom=controller.parent;
		if(gcom){
			var cc=gcom.getController(this.controllerName);
			if(cc && cc!=controller && !cc.changing)
				cc.selectedPageId=this.targetPage;
		}
	}

	__proto.setup=function(buffer){
		_super.prototype.setup.call(this,buffer);
		this.objectId=buffer.readS();
		this.controllerName=buffer.readS();
		this.targetPage=buffer.readS();
	}

	return ChangePageAction;
})(ControllerAction)


//class fairygui.action.PlayTransitionAction extends fairygui.action.ControllerAction
var PlayTransitionAction=(function(_super){
	function PlayTransitionAction(){
		this.transitionName=null;
		this.playTimes=1;
		this.delay=0;
		this.stopOnExit=false;
		this._currentTransition=null;
		PlayTransitionAction.__super.call(this);
	}

	__class(PlayTransitionAction,'fairygui.action.PlayTransitionAction',_super);
	var __proto=PlayTransitionAction.prototype;
	__proto.enter=function(controller){
		var trans=controller.parent.getTransition(this.transitionName);
		if(trans){
			if(this._currentTransition && this._currentTransition.playing)
				trans.changePlayTimes(this.playTimes);
			else
			trans.play(null,this.playTimes,this.delay);
			this._currentTransition=trans;
		}
	}

	__proto.leave=function(controller){
		if(this.stopOnExit && this._currentTransition){
			this._currentTransition.stop();
			this._currentTransition=null;
		}
	}

	__proto.setup=function(buffer){
		_super.prototype.setup.call(this,buffer);
		this.transitionName=buffer.readS();
		this.playTimes=buffer.getInt32();
		this.delay=buffer.getFloat32();
		this.stopOnExit=buffer.readBool();
	}

	return PlayTransitionAction;
})(ControllerAction)


//class fairygui.GTextField extends fairygui.GObject
var GTextField=(function(_super){
	function GTextField(){
		this._gearColor=null;
		this._templateVars=null;
		this._text=null;
		GTextField.__super.call(this);
		this._gearColor=new GearColor(this);
	}

	__class(GTextField,'fairygui.GTextField',_super);
	var __proto=GTextField.prototype;
	Laya.imps(__proto,{"fairygui.gears.IColorGear":true})
	__proto.parseTemplate=function(template){
		var pos1=0,pos2=0,pos3=0;
		var tag;
		var value;
		var result="";
		while((pos2=template.indexOf("{",pos1))!=-1){
			if (pos2 > 0 && template.charCodeAt(pos2-1)==92){
				result+=template.substring(pos1,pos2-1);
				result+="{";
				pos1=pos2+1;
				continue ;
			}
			result+=template.substring(pos1,pos2);
			pos1=pos2;
			pos2=template.indexOf("}",pos1);
			if(pos2==-1)
				break ;
			if(pos2==pos1+1){
				result+=template.substr(pos1,2);
				pos1=pos2+1;
				continue ;
			}
			tag=template.substring(pos1+1,pos2);
			pos3=tag.indexOf("=");
			if(pos3!=-1){
				value=this._templateVars[tag.substring(0,pos3)];
				if(value==null)
					result+=tag.substring(pos3+1);
				else
				result+=value;
			}
			else{
				value=this._templateVars[tag];
				if(value!=null)
					result+=value;
			}
			pos1=pos2+1;
		}
		if (pos1 < template.length)
			result+=template.substr(pos1);
		return result;
	}

	__proto.setVar=function(name,value){
		if(!this._templateVars)
			this._templateVars={};
		this._templateVars[name]=value;
		return this;
	}

	__proto.flushVars=function(){
		this.text=this._text;
	}

	__proto.handleControllerChanged=function(c){
		_super.prototype.handleControllerChanged.call(this,c);
		if(this._gearColor.controller==c)
			this._gearColor.apply();
	}

	__proto.setup_beforeAdd=function(buffer,beginPos){
		_super.prototype.setup_beforeAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,5);
		var iv=0;
		this.font=buffer.readS();
		this.fontSize=buffer.getInt16();
		this.color=buffer.readColorS();
		iv=buffer.readByte();
		this.align=iv==0?"left":(iv==1?"center":"right");
		iv=buffer.readByte();
		this.valign=iv==0?"top":(iv==1?"middle":"bottom");
		this.leading=buffer.getInt16();
		this.letterSpacing=buffer.getInt16();
		this.ubbEnabled=buffer.readBool();
		this.autoSize=buffer.readByte();
		this.underline=buffer.readBool();
		this.italic=buffer.readBool();
		this.bold=buffer.readBool();
		this.singleLine=buffer.readBool();
		if (buffer.readBool()){
			this.strokeColor=buffer.readColorS();
			this.stroke=buffer.getFloat32()+1;
		}
		if (buffer.readBool())
			buffer.skip(12);
		if (buffer.readBool())
			this._templateVars={};
	}

	__proto.setup_afterAdd=function(buffer,beginPos){
		_super.prototype.setup_afterAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,6);
		var str=buffer.readS();
		if (str !=null)
			this.text=str;
	}

	__getset(0,__proto,'color',function(){
		return null;
		},function(value){
	});

	__getset(0,__proto,'font',function(){
		return null;
		},function(value){
	});

	__getset(0,__proto,'templateVars',function(){
		return this._templateVars;
		},function(value){
		if(this._templateVars==null && value==null)
			return;
		this._templateVars=value;
		this.flushVars();
	});

	__getset(0,__proto,'leading',function(){
		return 0;
		},function(value){
	});

	__getset(0,__proto,'fontSize',function(){
		return 0;
		},function(value){
	});

	__getset(0,__proto,'bold',function(){
		return false;
		},function(value){
	});

	__getset(0,__proto,'letterSpacing',function(){
		return 0;
		},function(value){
	});

	__getset(0,__proto,'align',function(){
		return null;
		},function(value){
	});

	__getset(0,__proto,'valign',function(){
		return null;
		},function(value){
	});

	__getset(0,__proto,'italic',function(){
		return false;
		},function(value){
	});

	__getset(0,__proto,'underline',function(){
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

	__getset(0,__proto,'strokeColor',function(){
		return null;
		},function(value){
	});

	__getset(0,__proto,'ubbEnabled',function(){
		return false;
		},function(value){
	});

	/**
	*@see AutoSizeType
	*/
	/**
	*@see AutoSizeType
	*/
	__getset(0,__proto,'autoSize',function(){
		return 0;
		},function(value){
	});

	__getset(0,__proto,'textWidth',function(){
		return 0;
	});

	return GTextField;
})(GObject)


//class fairygui.GComponent extends fairygui.GObject
var GComponent=(function(_super){
	function GComponent(){
		this._sortingChildCount=0;
		this._opaque=false;
		this._applyingController=null;
		this._mask=null;
		this._margin=null;
		this._trackBounds=false;
		this._boundsChanged=false;
		this._childrenRenderOrder=0;
		this._apexIndex=0;
		this._buildingDisplayList=false;
		this._children=null;
		this._controllers=null;
		this._transitions=null;
		this._container=null;
		this._scrollPane=null;
		this._alignOffset=null;
		GComponent.__super.call(this);
		this._children=[];
		this._controllers=[];
		this._transitions=[];
		this._margin=new Margin();
		this._alignOffset=new Point();
		this._opaque=false;
	}

	__class(GComponent,'fairygui.GComponent',_super);
	var __proto=GComponent.prototype;
	__proto.createDisplayObject=function(){
		_super.prototype.createDisplayObject.call(this);
		this._displayObject.mouseEnabled=true;
		this._displayObject.mouseThrough=true;
		this._container=this._displayObject;
	}

	__proto.dispose=function(){
		var i=0;
		var cnt=0;
		cnt=this._transitions.length;
		for (i=0;i < cnt;++i){
			var trans=this._transitions[i];
			trans.dispose();
		}
		cnt=this._controllers.length;
		for (i=0;i < cnt;++i){
			var cc=this._controllers[i];
			cc.dispose();
		}
		if (this.scrollPane !=null)
			this.scrollPane.dispose();
		cnt=this._children.length;
		for(i=cnt-1;i >=0;--i){
			var obj=this._children[i];
			obj.parent=null;
			obj.dispose();
		}
		this._boundsChanged=false;
		this._mask=null;
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
			child.group=null;
			if(child.inContainer){
				this._container.removeChild(child.displayObject);
				if (this._childrenRenderOrder==2)
					Laya.timer.callLater(this,this.buildNativeDisplayList);
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
			if(child.internalVisible && child.internalVisible2 && child.name==name)
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

	__proto.setChildIndexBefore=function(child,index){
		var oldIndex=this._children.indexOf(child);
		if (oldIndex==-1)
			throw "Not a child of this container";
		if(child.sortingOrder!=0)
			return oldIndex;
		var cnt=this._children.length;
		if(this._sortingChildCount>0){
			if (index > (cnt-this._sortingChildCount-1))
				index=cnt-this._sortingChildCount-1;
		}
		if (oldIndex < index)
			return this._setChildIndex(child,oldIndex,index-1);
		else
		return this._setChildIndex(child,oldIndex,index);
	}

	__proto._setChildIndex=function(child,oldIndex,index){
		var cnt=this._children.length;
		if(index > cnt)
			index=cnt;
		if(oldIndex==index)
			return oldIndex;
		this._children.splice(oldIndex,1);
		this._children.splice(index,0,child);
		if(child.inContainer){
			var displayIndex=0;
			var g;
			var i=0;
			if (this._childrenRenderOrder==0){
				for(i=0;i<index;i++){
					g=this._children[i];
					if(g.inContainer)
						displayIndex++;
				}
				if(displayIndex==this._container.numChildren)
					displayIndex--;
				this._container.setChildIndex(child.displayObject,displayIndex);
			}
			else if (this._childrenRenderOrder==1){
				for (i=cnt-1;i > index;i--){
					g=this._children[i];
					if (g.inContainer)
						displayIndex++;
				}
				if(displayIndex==this._container.numChildren)
					displayIndex--;
				this._container.setChildIndex(child.displayObject,displayIndex);
			}
			else{
				Laya.timer.callLater(this,this.buildNativeDisplayList);
			}
			this.setBoundsChangedFlag();
		}
		return index;
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

	__proto.isAncestorOf=function(child){
		if (child==null)
			return false;
		var p=child.parent;
		while(p){
			if(p==this)
				return true;
			p=p.parent;
		}
		return false;
	}

	__proto.addController=function(controller){
		this._controllers.push(controller);
		controller.parent=this;
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
		c.parent=null;
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
		var cnt=this._children.length;
		if((child instanceof fairygui.GGroup )){
			for(var i=0;i < cnt;i++){
				var g=this._children[i];
				if(g.group==child)
					this.childStateChanged(g);
			}
			return;
		}
		if(!child.displayObject)
			return;
		if(child.internalVisible && child.displayObject!=this._displayObject.mask){
			if(!child.displayObject.parent){
				var index=0
				if (this._childrenRenderOrder==0){
					for (i=0;i < cnt;i++){
						g=this._children[i];
						if (g==child)
							break ;
						if (g.displayObject !=null && g.displayObject.parent !=null)
							index++;
					}
					this._container.addChildAt(child.displayObject,index);
				}
				else if (this._childrenRenderOrder==1){
					for (i=cnt-1;i >=0;i--){
						g=this._children[i];
						if (g==child)
							break ;
						if (g.displayObject !=null && g.displayObject.parent !=null)
							index++;
					}
					this._container.addChildAt(child.displayObject,index);
				}
				else{
					this._container.addChild(child.displayObject);
					Laya.timer.callLater(this,this.buildNativeDisplayList);
				}
			}
		}
		else {
			if(child.displayObject.parent){
				this._container.removeChild(child.displayObject);
				if (this._childrenRenderOrder==2)
					Laya.timer.callLater(this,this.buildNativeDisplayList);
			}
		}
	}

	__proto.buildNativeDisplayList=function(){
		var cnt=this._children.length;
		if (cnt==0)
			return;
		var i=0;
		var child;
		switch (this._childrenRenderOrder){
			case 0:{
					for (i=0;i < cnt;i++){
						child=this._children[i];
						if (child.displayObject !=null && child.internalVisible)
							this._container.addChild(child.displayObject);
					}
				}
				break ;
			case 1:{
					for (i=cnt-1;i >=0;i--){
						child=this._children[i];
						if (child.displayObject !=null && child.internalVisible)
							this._container.addChild(child.displayObject);
					}
				}
				break ;
			case 2:{
					for (i=0;i < this._apexIndex;i++){
						child=this._children[i];
						if (child.displayObject !=null && child.internalVisible)
							this._container.addChild(child.displayObject);
					}
					for (i=cnt-1;i >=this._apexIndex;i--){
						child=this._children[i];
						if (child.displayObject !=null && child.internalVisible)
							this._container.addChild(child.displayObject);
					}
				}
				break ;
			}
	}

	__proto.applyController=function(c){
		this._applyingController=c;
		var child;
		var length=this._children.length;
		for(var i=0;i < length;i++){
			child=this._children[i];
			child.handleControllerChanged(c);
		}
		this._applyingController=null;
		c.runActions();
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
		if(myIndex < maxIndex){
			if(this._applyingController!=null)
				this._children[maxIndex].handleControllerChanged(this._applyingController);
			this.swapChildrenAt(myIndex,maxIndex);
		}
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
		if(this._displayObject.scrollRect !=null){
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

	__proto.setMask=function(value,reversed){
		if(this._mask && this._mask!=value){
			if(this._mask.blendMode=="destination-out")
				this._mask.blendMode=null;
		}
		this._mask=value;
		if(!this._mask){
			this._displayObject.mask=null;
			if((this._displayObject.hitArea instanceof fairygui.utils.ChildHitArea ))
				this._displayObject.hitArea=null;
			return;
		}
		if(this._mask.hitArea){
			this._displayObject.hitArea=new ChildHitArea(this._mask,reversed);
			this._displayObject.mouseThrough=false;
			this._displayObject.hitTestPrior=true;
		}
		if(reversed){
			this._displayObject.mask=null;
			this._displayObject.cacheAs="bitmap";
			this._mask.blendMode="destination-out";
		}
		else
		this._displayObject.mask=this._mask;
	}

	__proto.updateHitArea=function(){
		if((this._displayObject.hitArea instanceof fairygui.utils.PixelHitTest )){
			var hitTest=(this._displayObject.hitArea);
			if(this.sourceWidth!=0)
				hitTest.scaleX=this.width/this.sourceWidth;
			if(this.sourceHeight!=0)
				hitTest.scaleY=this.height/this.sourceHeight;
		}
		else if((this._displayObject.hitArea instanceof laya.maths.Rectangle )){
			this._displayObject.hitArea.setTo(0,0,this.width,this.height);
		}
	}

	__proto.updateMask=function(){
		var rect=this._displayObject.scrollRect;
		if(rect==null)
			rect=new Rectangle();
		rect.x=this._margin.left;
		rect.y=this._margin.top;
		rect.width=this.width-this._margin.right;
		rect.height=this.height-this._margin.bottom;
		this._displayObject.scrollRect=rect;
	}

	__proto.setupScroll=function(buffer){
		if (this._displayObject==this._container){
			this._container=new Sprite();
			this._displayObject.addChild(this._container);
		}
		this._scrollPane=new ScrollPane(this);
		this._scrollPane.setup(buffer);
	}

	__proto.setupOverflow=function(overflow){
		if(overflow==1){
			if (this._displayObject==this._container){
				this._container=new Sprite();
				this._displayObject.addChild(this._container);
			}
			this.updateMask();
			this._container.pos(this._margin.left,this._margin.top);
		}
		else if(this._margin.left !=0 || this._margin.top !=0){
			if (this._displayObject==this._container){
				this._container=new Sprite();
				this._displayObject.addChild(this._container);
			}
			this._container.pos(this._margin.left,this._margin.top);
		}
	}

	__proto.handleSizeChanged=function(){
		_super.prototype.handleSizeChanged.call(this);
		if(this._scrollPane)
			this._scrollPane.onOwnerSizeChanged();
		else if(this._displayObject.scrollRect !=null)
		this.updateMask();
		if(this._displayObject.hitArea!=null)
			this.updateHitArea();
	}

	__proto.handleGrayedChanged=function(){
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

	__proto.handleControllerChanged=function(c){
		_super.prototype.handleControllerChanged.call(this,c);
		if (this._scrollPane !=null)
			this._scrollPane.handleControllerChanged(c);
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
		if (this._boundsChanged){
			var i1=0;
			var len=this._children.length;
			var child
			for(i1=0;i1 < len;i1++){
				child=this._children[i1];
				child.ensureSizeCorrect();
			}
			this.updateBounds();
		}
	}

	__proto.ensureBoundsCorrect=function(){
		var i1=0;
		var len=this._children.length;
		var child
		for(i1=0;i1 < len;i1++){
			child=this._children[i1];
			child.ensureSizeCorrect();
		}
		if (this._boundsChanged)
			this.updateBounds();
	}

	__proto.updateBounds=function(){
		var ax=0,ay=0,aw=0,ah=0;
		var len=this._children.length;
		if(len > 0){
			ax=Number.POSITIVE_INFINITY,ay=Number.POSITIVE_INFINITY;
			var ar=Number.NEGATIVE_INFINITY,ab=Number.NEGATIVE_INFINITY;
			var tmp=0;
			var i1=0;
			for(i1=0;i1 < len;i1++){
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
		this.setBounds(ax,ay,aw,ah);
	}

	__proto.setBounds=function(ax,ay,aw,ah){
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

	__proto.constructFromResource=function(){
		this.constructFromResource2(null,0);
	}

	__proto.constructFromResource2=function(objectPool,poolIndex){
		if (!this.packageItem.decoded){
			this.packageItem.decoded=true;
			TranslationHelper.translateComponent(this.packageItem);
		};
		var i=0;
		var dataLen=0;
		var curPos=0;
		var nextPos=0;
		var f1=NaN;
		var f2=NaN;
		var i1=0;
		var i2=0;
		var buffer=this.packageItem.rawData;
		buffer.seek(0,0);
		this._underConstruct=true;
		this.sourceWidth=buffer.getInt32();
		this.sourceHeight=buffer.getInt32();
		this.initWidth=this.sourceWidth;
		this.initHeight=this.sourceHeight;
		this.setSize(this.sourceWidth,this.sourceHeight);
		if (buffer.readBool()){
			this.minWidth=buffer.getInt32();
			this.maxWidth=buffer.getInt32();
			this.minHeight=buffer.getInt32();
			this.maxHeight=buffer.getInt32();
		}
		if (buffer.readBool()){
			f1=buffer.getFloat32();
			f2=buffer.getFloat32();
			this.internalSetPivot(f1,f2,buffer.readBool());
		}
		if (buffer.readBool()){
			this._margin.top=buffer.getInt32();
			this._margin.bottom=buffer.getInt32();
			this._margin.left=buffer.getInt32();
			this._margin.right=buffer.getInt32();
		};
		var overflow=buffer.readByte();
		if (overflow==2){
			var savedPos=buffer.pos;
			buffer.seek(0,7);
			this.setupScroll(buffer);
			buffer.pos=savedPos;
		}
		else
		this.setupOverflow(overflow);
		if (buffer.readBool())
			buffer.skip(8);
		this._buildingDisplayList=true;
		buffer.seek(0,1);
		var controllerCount=buffer.getInt16();
		for (i=0;i < controllerCount;i++){
			nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			var controller=new Controller();
			this._controllers.push(controller);
			controller.parent=this;
			controller.setup(buffer);
			buffer.pos=nextPos;
		}
		buffer.seek(0,2);
		var child;
		var childCount=buffer.getInt16();
		for (i=0;i < childCount;i++){
			dataLen=buffer.getInt16();
			curPos=buffer.pos;
			if (objectPool !=null)
				child=objectPool[poolIndex+i];
			else{
				buffer.seek(curPos,0);
				var type=buffer.readByte();
				var src=buffer.readS();
				var pkgId=buffer.readS();
				var pi=null;
				if (src !=null){
					var pkg;
					if (pkgId !=null)
						pkg=UIPackage.getById(pkgId);
					else
					pkg=this.packageItem.owner;
					pi=pkg !=null ? pkg.getItemById(src):null;
				}
				if (pi !=null){
					child=UIObjectFactory.newObject(pi);
					child.packageItem=pi;
					child.constructFromResource();
				}
				else
				child=UIObjectFactory.newObject2(type);
			}
			child._underConstruct=true;
			child.setup_beforeAdd(buffer,curPos);
			child.parent=this;
			this._children.push(child);
			buffer.pos=curPos+dataLen;
		}
		buffer.seek(0,3);
		this.relations.setup(buffer,true);
		buffer.seek(0,2);
		buffer.skip(2);
		for (i=0;i < childCount;i++){
			nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			buffer.seek(buffer.pos,3);
			this._children[i].relations.setup(buffer,false);
			buffer.pos=nextPos;
		}
		buffer.seek(0,2);
		buffer.skip(2);
		for (i=0;i < childCount;i++){
			nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			child=this._children[i];
			child.setup_afterAdd(buffer,buffer.pos);
			child._underConstruct=false;
			buffer.pos=nextPos;
		}
		buffer.seek(0,4);
		buffer.skip(2);
		this.opaque=buffer.readBool();
		var maskId=buffer.getInt16();
		if (maskId !=-1){
			this.setMask(this.getChildAt(maskId).displayObject,buffer.readBool());
		};
		var hitTestId=buffer.readS();
		if (hitTestId !=null){
			pi=this.packageItem.owner.getItemById(hitTestId);
			if (pi !=null && pi.pixelHitTestData !=null){
				i1=buffer.getInt32();
				i2=buffer.getInt32();
				this._displayObject.hitArea=new PixelHitTest(pi.pixelHitTestData,i1,i2);
				this._displayObject.mouseThrough=false;
				this._displayObject.hitTestPrior=true;
			}
		}
		buffer.seek(0,5);
		var transitionCount=buffer.getInt16();
		for (i=0;i < transitionCount;i++){
			nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			var trans=new Transition(this);
			trans.setup(buffer);
			this._transitions.push(trans);
			buffer.pos=nextPos;
		}
		if (this._transitions.length > 0){
			this.displayObject.on("display",this,this.___added);
			this.displayObject.on("undisplay",this,this.___removed);
		}
		this.applyAllControllers();
		this._buildingDisplayList=false;
		this._underConstruct=false;
		this.buildNativeDisplayList();
		this.setBoundsChangedFlag();
		if (this.packageItem.objectType !=9)
			this.constructExtension(buffer);
		this.constructFromXML(null);
	}

	__proto.constructExtension=function(buffer){}
	__proto.constructFromXML=function(xml){}
	__proto.setup_afterAdd=function(buffer,beginPos){
		_super.prototype.setup_afterAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,4);
		var pageController=buffer.getInt16();
		if (pageController !=-1 && this._scrollPane !=null)
			this._scrollPane.pageController=this._parent.getControllerAt(pageController);
		var cnt=buffer.getInt16();
		for (var i=0;i < cnt;i++){
			var cc=this.getController(buffer.readS());
			var pageId=buffer.readS();
			if(cc)
				cc.selectedPageId=pageId;
		}
	}

	__proto.___added=function(){
		var cnt=this._transitions.length;
		for(var i=0;i < cnt;++i){
			this._transitions[i].onOwnerAddedToStage();
		}
	}

	__proto.___removed=function(){
		var cnt=this._transitions.length;
		for(var i=0;i < cnt;++i){
			this._transitions[i].onOwnerRemovedFromStage();
		}
	}

	__getset(0,__proto,'numChildren',function(){
		return this._children.length;
	});

	__getset(0,__proto,'displayListContainer',function(){
		return this._container;
	});

	/**
	*@see ChildrenRenderOrder
	*/
	/**
	*@see ChildrenRenderOrder
	*/
	__getset(0,__proto,'childrenRenderOrder',function(){
		return this._childrenRenderOrder;
		},function(value){
		if (this._childrenRenderOrder !=value){
			this._childrenRenderOrder=value;
			this.buildNativeDisplayList();
		}
	});

	__getset(0,__proto,'opaque',function(){
		return this._opaque;
		},function(value){
		if(this._opaque!=value){
			this._opaque=value;
			if (this._opaque){
				if(this._displayObject.hitArea==null)
					this._displayObject.hitArea=new Rectangle();
				if((this._displayObject.hitArea instanceof laya.maths.Rectangle ))
					this._displayObject.hitArea.setTo(0,0,this.width,this.height);
				this._displayObject.mouseThrough=false;
			}
			else {
				if((this._displayObject.hitArea instanceof laya.maths.Rectangle ))
					this._displayObject.hitArea=null;
				this._displayObject.mouseThrough=true;
			}
		}
	});

	__getset(0,__proto,'controllers',function(){
		return this._controllers;
	});

	__getset(0,__proto,'scrollPane',function(){
		return this._scrollPane;
	});

	__getset(0,__proto,'margin',function(){
		return this._margin;
		},function(value){
		this._margin.copy(value);
		if(this._displayObject.scrollRect!=null){
			this._container.pos(this._margin.left+this._alignOffset.x,this._margin.top+this._alignOffset.y);
		}
		this.handleSizeChanged();
	});

	__getset(0,__proto,'apexIndex',function(){
		return this._apexIndex;
		},function(value){
		if (this._apexIndex !=value){
			this._apexIndex=value;
			if (this._childrenRenderOrder==2)
				this.buildNativeDisplayList();
		}
	});

	__getset(0,__proto,'mask',function(){
		return this._mask;
		},function(value){
		this.setMask(value,false);
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

	__getset(0,__proto,'baseUserData',function(){
		var buffer=this.packageItem.rawData;
		buffer.seek(0,4);
		return buffer.readS();
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

	return GComponent;
})(GObject)


//class fairygui.gears.GearAnimation extends fairygui.gears.GearBase
var GearAnimation=(function(_super){
	var GearAnimationValue;
	function GearAnimation(owner){
		this._storage=null;
		this._default=null;
		GearAnimation.__super.call(this,owner);
	}

	__class(GearAnimation,'fairygui.gears.GearAnimation',_super);
	var __proto=GearAnimation.prototype;
	__proto.init=function(){
		this._default=new GearAnimationValue((this._owner).playing,
		(this._owner).frame);
		this._storage={};
	}

	__proto.addStatus=function(pageId,buffer){
		var gv;
		if (pageId==null)
			gv=this._default;
		else {
			gv=new GearAnimationValue();
			this._storage[pageId]=gv;
		}
		gv.playing=buffer.readBool();
		gv.frame=buffer.getInt32();
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


//class fairygui.gears.GearColor extends fairygui.gears.GearBase
var GearColor=(function(_super){
	var GearColorValue;
	function GearColor(owner){
		this._storage=null;
		this._default=null;
		GearColor.__super.call(this,owner);
	}

	__class(GearColor,'fairygui.gears.GearColor',_super);
	var __proto=GearColor.prototype;
	__proto.init=function(){
		if(this._owner["strokeColor"]!=undefined)
			this._default=new GearColorValue(this._owner["color"],this._owner["strokeColor"]);
		else
		this._default=new GearColorValue(this._owner["color"],null);
		this._storage={};
	}

	__proto.addStatus=function(pageId,buffer){
		var gv;
		if (pageId==null)
			gv=this._default;
		else {
			gv=new GearColorValue();
			this._storage[pageId]=gv;
		}
		gv.color=buffer.readColorS();
		gv.strokeColor=buffer.readColorS();
	}

	__proto.apply=function(){
		this._owner._gearLocked=true;
		var gv=this._storage[this._controller.selectedPageId];
		if(!gv)
			gv=this._default;
		(this._owner).color=gv.color;
		if(this._owner["strokeColor"]!=undefined && gv.strokeColor!=null)
			this._owner["strokeColor"]=gv.strokeColor;
		this._owner._gearLocked=false;
	}

	__proto.updateState=function(){
		var gv=this._storage[this._controller.selectedPageId];
		if(!gv){
			gv=new GearColorValue(null,null);
			this._storage[this._controller.selectedPageId]=gv;
		}
		gv.color=(this._owner).color;
		if(this._owner["strokeColor"]!=undefined)
			gv.strokeColor=this._owner["strokeColor"];
	}

	GearColor.__init$=function(){
		//class GearColorValue
		GearColorValue=(function(){
			function GearColorValue(color,strokeColor){
				this.color=null;
				this.strokeColor=null;
				this.color=color;
				this.strokeColor=strokeColor;
			}
			__class(GearColorValue,'');
			return GearColorValue;
		})()
	}

	return GearColor;
})(GearBase)


//class fairygui.gears.GearDisplay extends fairygui.gears.GearBase
var GearDisplay=(function(_super){
	function GearDisplay(owner){
		this.pages=null;
		this._visible=0;
		this._displayLockToken=0;
		GearDisplay.__super.call(this,owner);
		this._displayLockToken=1;
	}

	__class(GearDisplay,'fairygui.gears.GearDisplay',_super);
	var __proto=GearDisplay.prototype;
	__proto.init=function(){
		this.pages=null;
	}

	__proto.addLock=function(){
		this._visible++;
		return this._displayLockToken;
	}

	__proto.releaseLock=function(token){
		if(token==this._displayLockToken)
			this._visible--;
	}

	__proto.apply=function(){
		this._displayLockToken++;
		if(this._displayLockToken<=0)
			this._displayLockToken=1;
		if(this.pages==null || this.pages.length==0
			|| this.pages.indexOf(this._controller.selectedPageId)!=-1)
		this._visible=1;
		else
		this._visible=0;
	}

	__getset(0,__proto,'connected',function(){
		return this._controller==null || this._visible>0;
	});

	return GearDisplay;
})(GearBase)


//class fairygui.gears.GearIcon extends fairygui.gears.GearBase
var GearIcon=(function(_super){
	function GearIcon(owner){
		this._storage=null;
		this._default=null;
		GearIcon.__super.call(this,owner);
	}

	__class(GearIcon,'fairygui.gears.GearIcon',_super);
	var __proto=GearIcon.prototype;
	__proto.init=function(){
		this._default=this._owner.icon;
		this._storage={};
	}

	__proto.addStatus=function(pageId,buffer){
		if(pageId==null)
			this._default=buffer.readS();
		else
		this._storage[pageId]=buffer.readS();
	}

	__proto.apply=function(){
		this._owner._gearLocked=true;
		var data=this._storage[this._controller.selectedPageId];
		if(data!==undefined)
			this._owner.icon=data;
		else
		this._owner.icon=this._default;
		this._owner._gearLocked=false;
	}

	__proto.updateState=function(){
		this._storage[this._controller.selectedPageId]=this._owner.icon;
	}

	return GearIcon;
})(GearBase)


//class fairygui.gears.GearLook extends fairygui.gears.GearBase
var GearLook=(function(_super){
	var GearLookValue;
	function GearLook(owner){
		this._storage=null;
		this._default=null;
		GearLook.__super.call(this,owner);
	}

	__class(GearLook,'fairygui.gears.GearLook',_super);
	var __proto=GearLook.prototype;
	__proto.init=function(){
		this._default=new GearLookValue(this._owner.alpha,this._owner.rotation,this._owner.grayed,this._owner.touchable);
		this._storage={};
	}

	__proto.addStatus=function(pageId,buffer){
		var gv;
		if (pageId==null)
			gv=this._default;
		else {
			gv=new GearLookValue();
			this._storage[pageId]=gv;
		}
		gv.alpha=buffer.getFloat32();
		gv.rotation=buffer.getFloat32();
		gv.grayed=buffer.readBool();
		gv.touchable=buffer.readBool();
	}

	__proto.apply=function(){
		var gv=this._storage[this._controller.selectedPageId];
		if(!gv)
			gv=this._default;
		if(this._tweenConfig!=null && this._tweenConfig.tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect){
			this._owner._gearLocked=true;
			this._owner.grayed=gv.grayed;
			this._owner.touchable=gv.touchable;
			this._owner._gearLocked=false;
			if (this._tweenConfig._tweener !=null){
				if (this._tweenConfig._tweener.endValue.x !=gv.alpha || this._tweenConfig._tweener.endValue.y !=gv.rotation){
					this._tweenConfig._tweener.kill(true);
					this._tweenConfig._tweener=null;
				}
				else
				return;
			};
			var a=gv.alpha!=this._owner.alpha;
			var b=gv.rotation!=this._owner.rotation;
			if(a || b){
				if(this._owner.checkGearController(0,this._controller))
					this._tweenConfig._displayLockToken=this._owner.addDisplayLock();
				this._tweenConfig._tweener=GTween.to2(this._owner.alpha,this._owner.rotation,gv.alpha,gv.rotation,this._tweenConfig.duration)
				.setDelay(this._tweenConfig.delay)
				.setEase(this._tweenConfig.easeType)
				.setUserData((a ? 1 :0)+(b ? 2 :0))
				.setTarget(this)
				.onUpdate(this.__tweenUpdate,this)
				.onComplete(this.__tweenComplete,this);
			}
		}
		else {
			this._owner._gearLocked=true;
			this._owner.grayed=gv.grayed;
			this._owner.alpha=gv.alpha;
			this._owner.rotation=gv.rotation;
			this._owner.touchable=gv.touchable;
			this._owner._gearLocked=false;
		}
	}

	__proto.__tweenUpdate=function(tweener){
		var flag=tweener.userData;
		this._owner._gearLocked=true;
		if ((flag & 1)!=0)
			this._owner.alpha=tweener.value.x;
		if ((flag & 2)!=0)
			this._owner.rotation=tweener.value.y;
		this._owner._gearLocked=false;
	}

	__proto.__tweenComplete=function(){
		if(this._tweenConfig._displayLockToken!=0){
			this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
			this._tweenConfig._displayLockToken=0;
		}
		this._tweenConfig._tweener=null;
	}

	__proto.updateState=function(){
		var gv=this._storage[this._controller.selectedPageId];
		if(!gv){
			gv=new GearLookValue();
			this._storage[this._controller.selectedPageId]=gv;
		}
		gv.alpha=this._owner.alpha;
		gv.rotation=this._owner.rotation;
		gv.grayed=this._owner.grayed;
		gv.touchable=this._owner.touchable;
	}

	GearLook.__init$=function(){
		//class GearLookValue
		GearLookValue=(function(){
			function GearLookValue(alpha,rotation,grayed,touchable){
				this.alpha=NaN;
				this.rotation=NaN;
				this.grayed=false;
				this.touchable=false;
				(alpha===void 0)&& (alpha=0);
				(rotation===void 0)&& (rotation=0);
				(grayed===void 0)&& (grayed=false);
				(touchable===void 0)&& (touchable=true);
				this.alpha=alpha;
				this.rotation=rotation;
				this.grayed=grayed;
				this.touchable=touchable;
			}
			__class(GearLookValue,'');
			return GearLookValue;
		})()
	}

	return GearLook;
})(GearBase)


//class fairygui.gears.GearSize extends fairygui.gears.GearBase
var GearSize=(function(_super){
	var GearSizeValue;
	function GearSize(owner){
		this._storage=null;
		this._default=null;
		GearSize.__super.call(this,owner);
	}

	__class(GearSize,'fairygui.gears.GearSize',_super);
	var __proto=GearSize.prototype;
	__proto.init=function(){
		this._default=new GearSizeValue(this._owner.width,this._owner.height,
		this._owner.scaleX,this._owner.scaleY);
		this._storage={};
	}

	__proto.addStatus=function(pageId,buffer){
		var gv;
		if (pageId==null)
			gv=this._default;
		else {
			gv=new GearSizeValue();
			this._storage[pageId]=gv;
		}
		gv.width=buffer.getInt32();
		gv.height=buffer.getInt32();
		gv.scaleX=buffer.getFloat32();
		gv.scaleY=buffer.getFloat32();
	}

	__proto.apply=function(){
		var gv=this._storage[this._controller.selectedPageId];
		if (!gv)
			gv=this._default;
		if(this._tweenConfig!=null && this._tweenConfig.tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect){
			if (this._tweenConfig._tweener !=null){
				if (this._tweenConfig._tweener.endValue.x !=gv.width || this._tweenConfig._tweener.endValue.y !=gv.height
					|| this._tweenConfig._tweener.endValue.z !=gv.scaleX || this._tweenConfig._tweener.endValue.w !=gv.scaleY){
					this._tweenConfig._tweener.kill(true);
					this._tweenConfig._tweener=null;
				}
				else
				return;
			};
			var a=gv.width !=this._owner.width || gv.height !=this._owner.height;
			var b=gv.scaleX !=this._owner.scaleX || gv.scaleY !=this._owner.scaleY;
			if(a || b){
				if(this._owner.checkGearController(0,this._controller))
					this._tweenConfig._displayLockToken=this._owner.addDisplayLock();
				this._tweenConfig._tweener=GTween.to4(this._owner.width,this._owner.height,this._owner.scaleX,this._owner.scaleY,gv.width,gv.height,gv.scaleX,gv.scaleY,this._tweenConfig.duration)
				.setDelay(this._tweenConfig.delay)
				.setEase(this._tweenConfig.easeType)
				.setUserData((a ? 1 :0)+(b ? 2 :0))
				.setTarget(this)
				.onUpdate(this.__tweenUpdate,this)
				.onComplete(this.__tweenComplete,this);
			}
		}
		else {
			this._owner._gearLocked=true;
			this._owner.setSize(gv.width,gv.height,this._owner.checkGearController(1,this._controller));
			this._owner.setScale(gv.scaleX,gv.scaleY);
			this._owner._gearLocked=false;
		}
	}

	__proto.__tweenUpdate=function(tweener){
		var flag=tweener.userData;
		this._owner._gearLocked=true;
		if ((flag & 1)!=0)
			this._owner.setSize(tweener.value.x,tweener.value.y,this._owner.checkGearController(1,this._controller));
		if ((flag & 2)!=0)
			this._owner.setScale(tweener.value.z,tweener.value.w);
		this._owner._gearLocked=false;
	}

	__proto.__tweenComplete=function(){
		if(this._tweenConfig._displayLockToken!=0){
			this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
			this._tweenConfig._displayLockToken=0;
		}
		this._tweenConfig._tweener=null;
	}

	__proto.updateState=function(){
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
		if(this._controller==null || this._storage==null)
			return;
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


//class fairygui.GGraph extends fairygui.GObject
var GGraph=(function(_super){
	function GGraph(){
		this._type=0;
		this._lineSize=NaN;
		this._lineColor=null;
		this._fillColor=null;
		this._cornerRadius=null;
		this._hitArea=null;
		GGraph.__super.call(this);
		this._type=0;
		this._lineSize=1;
		this._lineColor="#000000"
		this._fillColor="#FFFFFF";
		this._cornerRadius=null;
	}

	__class(GGraph,'fairygui.GGraph',_super);
	var __proto=GGraph.prototype;
	Laya.imps(__proto,{"fairygui.gears.IColorGear":true})
	__proto.drawRect=function(lineSize,lineColor,fillColor,cornerRadius){
		this._type=1;
		this._lineSize=lineSize;
		this._lineColor=lineColor;
		this._fillColor=fillColor;
		this._cornerRadius=cornerRadius;
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
		if (this._type==1){
			if(this._cornerRadius!=null){
				var paths=[
				["moveTo",this._cornerRadius[0],0],
				["lineTo",w-this._cornerRadius[1],0],
				["arcTo",w,0,w,this._cornerRadius[1],this._cornerRadius[1]],
				["lineTo",w,h-this._cornerRadius[3]],
				["arcTo",w,h,w-this._cornerRadius[3],h,this._cornerRadius[3]],
				["lineTo",this._cornerRadius[2],h],
				["arcTo",0,h,0,h-this._cornerRadius[2],this._cornerRadius[2]],
				["lineTo",0,this._cornerRadius[0]],
				["arcTo",0,0,this._cornerRadius[0],0,this._cornerRadius[0]],
				["closePath"]];
				gr.drawPath(0,0,paths,{fillStyle:fillColor},this._lineSize>0?{strokeStyle:lineColor,lineWidth:this._lineSize}:null);
			}
			else
			gr.drawRect(0,0,w,h,fillColor,this._lineSize>0?lineColor:null,this._lineSize);
			}else{
			gr.drawCircle(w/2,h/2,w/2,fillColor,this._lineSize>0?lineColor:null,this._lineSize);
		}
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
		this._hitArea=new HitArea();
		this._hitArea.hit=this._displayObject.graphics;
		this._displayObject.hitArea=this._hitArea;
	}

	__proto.handleSizeChanged=function(){
		_super.prototype.handleSizeChanged.call(this);
		if(this._type !=0)
			this.drawCommon();
	}

	__proto.setup_beforeAdd=function(buffer,beginPos){
		_super.prototype.setup_beforeAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,5);
		this._type=buffer.readByte();
		if (this._type!=0){
			this._lineSize=buffer.getInt32();
			this._lineColor=buffer.readColorS(true);
			this._fillColor=buffer.readColorS(true);
			if (buffer.readBool()){
				this._cornerRadius=[];
				for (var i=0;i < 4;i++)
				this._cornerRadius[i]=buffer.getFloat32();
			}
			this.drawCommon();
		}
	}

	__getset(0,__proto,'color',function(){
		return this._fillColor;
		},function(value){
		this._fillColor=value;
		if(this._type!=0)
			this.drawCommon();
	});

	return GGraph;
})(GObject)


//class fairygui.gears.GearText extends fairygui.gears.GearBase
var GearText=(function(_super){
	function GearText(owner){
		this._storage=null;
		this._default=null;
		GearText.__super.call(this,owner);
	}

	__class(GearText,'fairygui.gears.GearText',_super);
	var __proto=GearText.prototype;
	__proto.init=function(){
		this._default=this._owner.text;
		this._storage={};
	}

	__proto.addStatus=function(pageId,buffer){
		if(pageId==null)
			this._default=buffer.readS();
		else
		this._storage[pageId]=buffer.readS();
	}

	__proto.apply=function(){
		this._owner._gearLocked=true;
		var data=this._storage[this._controller.selectedPageId];
		if(data!==undefined)
			this._owner.text=data;
		else
		this._owner.text=this._default;
		this._owner._gearLocked=false;
	}

	__proto.updateState=function(){
		this._storage[this._controller.selectedPageId]=this._owner.text;
	}

	return GearText;
})(GearBase)


//class fairygui.GGroup extends fairygui.GObject
var GGroup=(function(_super){
	function GGroup(){
		this._layout=0;
		this._lineGap=0;
		this._columnGap=0;
		this._percentReady=false;
		this._boundsChanged=false;
		this._updating=0;
		GGroup.__super.call(this);
	}

	__class(GGroup,'fairygui.GGroup',_super);
	var __proto=GGroup.prototype;
	__proto.setBoundsChangedFlag=function(childSizeChanged){
		(childSizeChanged===void 0)&& (childSizeChanged=false);
		if (this._updating==0 && this.parent !=null){
			if (childSizeChanged)
				this._percentReady=false;
			if(!this._boundsChanged){
				this._boundsChanged=true;
				if(this._layout!=0)
					Laya.timer.callLater(this,this.ensureBoundsCorrect);
			}
		}
	}

	__proto.ensureBoundsCorrect=function(){
		if (this._boundsChanged)
			this.updateBounds();
	}

	__proto.updateBounds=function(){
		Laya.timer.clear(this,this.ensureBoundsCorrect);
		this._boundsChanged=false;
		if (this.parent==null)
			return;
		this.handleLayout();
		var cnt=this._parent.numChildren;
		var i=0;
		var child;
		var ax=Number.POSITIVE_INFINITY,ay=Number.POSITIVE_INFINITY;
		var ar=Number.NEGATIVE_INFINITY,ab=Number.NEGATIVE_INFINITY;
		var tmp=0;
		var empty=true;
		for(i=0;i<cnt;i++){
			child=this._parent.getChildAt(i);
			if(child.group==this){
				tmp=child.x;
				if(tmp<ax)
					ax=tmp;
				tmp=child.y;
				if(tmp<ay)
					ay=tmp;
				tmp=child.x+child.width;
				if(tmp>ar)
					ar=tmp;
				tmp=child.y+child.height;
				if(tmp>ab)
					ab=tmp;
				empty=false;
			}
		}
		if (!empty){
			this._updating=1;
			this.setXY(ax,ay);
			this._updating=2;
			this.setSize(ar-ax,ab-ay);
		}
		else{
			this._updating=2;
			this.setSize(0,0);
		}
		this._updating=0;
	}

	__proto.handleLayout=function(){
		this._updating |=1;
		var child;
		var i=0;
		var cnt=0;
		if (this._layout==1){
			var curX=NaN;
			cnt=this.parent.numChildren;
			for (i=0;i < cnt;i++){
				child=this.parent.getChildAt(i);
				if (child.group !=this)
					continue ;
				if (isNaN(curX))
					curX=Math.floor(child.x);
				else
				child.x=curX;
				if (child.width !=0)
					curX+=Math.floor(child.width+this._columnGap);
			}
			if (!this._percentReady)
				this.updatePercent();
		}
		else if (this._layout==2){
			var curY=NaN;
			cnt=this.parent.numChildren;
			for (i=0;i < cnt;i++){
				child=this.parent.getChildAt(i);
				if (child.group !=this)
					continue ;
				if (isNaN(curY))
					curY=Math.floor(child.y);
				else
				child.y=curY;
				if (child.height !=0)
					curY+=Math.floor(child.height+this._lineGap);
			}
			if (!this._percentReady)
				this.updatePercent();
		}
		this._updating &=2;
	}

	__proto.updatePercent=function(){
		this._percentReady=true;
		var cnt=this.parent.numChildren;
		var i=0;
		var child;
		var size=0;
		if (this._layout==1){
			for (i=0;i < cnt;i++){
				child=this.parent.getChildAt(i);
				if (child.group !=this)
					continue ;
				size+=child.width;
			}
			for (i=0;i < cnt;i++){
				child=this.parent.getChildAt(i);
				if (child.group !=this)
					continue ;
				if (size > 0)
					child._sizePercentInGroup=child.width / size;
				else
				child._sizePercentInGroup=0;
			}
		}
		else{
			for (i=0;i < cnt;i++){
				child=this.parent.getChildAt(i);
				if (child.group !=this)
					continue ;
				size+=child.height;
			}
			for (i=0;i < cnt;i++){
				child=this.parent.getChildAt(i);
				if (child.group !=this)
					continue ;
				if (size > 0)
					child._sizePercentInGroup=child.height / size;
				else
				child._sizePercentInGroup=0;
			}
		}
	}

	__proto.moveChildren=function(dx,dy){
		if ((this._updating & 1)!=0 || this.parent==null)
			return;
		this._updating |=1;
		var cnt=this.parent.numChildren;
		var i=0;
		var child;
		for (i=0;i < cnt;i++){
			child=this.parent.getChildAt(i);
			if (child.group==this){
				child.setXY(child.x+dx,child.y+dy);
			}
		}
		this._updating &=2;
	}

	__proto.resizeChildren=function(dw,dh){
		if (this._layout==0 || (this._updating & 2)!=0 || this.parent==null)
			return;
		this._updating |=2;
		if (!this._percentReady)
			this.updatePercent();
		var cnt=this.parent.numChildren;
		var i=0;
		var j=0;
		var child;
		var last=-1;
		var numChildren=0;
		var lineSize=0;
		var remainSize=0;
		var found=false;
		for (i=0;i < cnt;i++){
			child=this.parent.getChildAt(i);
			if (child.group !=this)
				continue ;
			last=i;
			numChildren++;
		}
		if (this._layout==1){
			remainSize=lineSize=this.width-(numChildren-1)*this._columnGap;
			var curX=NaN;
			var nw=NaN;
			for (i=0;i < cnt;i++){
				child=this.parent.getChildAt(i);
				if (child.group !=this)
					continue ;
				if (isNaN(curX))
					curX=Math.floor(child.x);
				else
				child.x=curX;
				if (last==i)
					nw=remainSize;
				else
				nw=Math.round(child._sizePercentInGroup *lineSize);
				child.setSize(nw,child._rawHeight+dh,true);
				remainSize-=child.width;
				if (last==i){
					if (remainSize >=1){
						for (j=0;j <=i;j++){
							child=this.parent.getChildAt(j);
							if (child.group !=this)
								continue ;
							if (!found){
								nw=child.width+remainSize;
								if ((child.maxWidth==0 || nw < child.maxWidth)
									&& (child.minWidth==0 || nw > child.minWidth)){
									child.setSize(nw,child.height,true);
									found=true;
								}
							}
							else
							child.x+=remainSize;
						}
					}
				}
				else
				curX+=(child.width+this._columnGap);
			}
		}
		else if (this._layout==2){
			remainSize=lineSize=this.height-(numChildren-1)*this._lineGap;
			var curY=NaN;
			var nh=NaN;
			for (i=0;i < cnt;i++){
				child=this.parent.getChildAt(i);
				if (child.group !=this)
					continue ;
				if (isNaN(curY))
					curY=Math.floor(child.y);
				else
				child.y=curY;
				if (last==i)
					nh=remainSize;
				else
				nh=Math.round(child._sizePercentInGroup *lineSize);
				child.setSize(child._rawWidth+dw,nh,true);
				remainSize-=child.height;
				if (last==i){
					if (remainSize >=1){
						for (j=0;j <=i;j++){
							child=this.parent.getChildAt(j);
							if (child.group !=this)
								continue ;
							if (!found){
								nh=child.height+remainSize;
								if ((child.maxHeight==0 || nh < child.maxHeight)
									&& (child.minHeight==0 || nh > child.minHeight)){
									child.setSize(child.width,nh,true);
									found=true;
								}
							}
							else
							child.y+=remainSize;
						}
					}
				}
				else
				curY+=(child.height+this._lineGap);
			}
		}
		this._updating &=1;
	}

	__proto.handleAlphaChanged=function(){
		if(this._underConstruct)
			return;
		var cnt=this._parent.numChildren;
		for(var i=0;i<cnt;i++){
			var child=this._parent.getChildAt(i);
			if(child.group==this)
				child.alpha=this.alpha;
		}
	}

	__proto.handleVisibleChanged=function(){
		if(!this._parent)
			return;
		var cnt=this._parent.numChildren;
		for(var i=0;i<cnt;i++){
			var child=this._parent.getChildAt(i);
			if(child.group==this)
				child.handleVisibleChanged();
		}
	}

	__proto.setup_beforeAdd=function(buffer,beginPos){
		_super.prototype.setup_beforeAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,5);
		this._layout=buffer.readByte();
		this._lineGap=buffer.getInt32();
		this._columnGap=buffer.getInt32();
	}

	__proto.setup_afterAdd=function(buffer,beginPos){
		_super.prototype.setup_afterAdd.call(this,buffer,beginPos);
		if(!this.visible)
			this.handleVisibleChanged();
	}

	/**
	*@see GroupLayout
	*/
	/**
	*@see GroupLayout
	*/
	__getset(0,__proto,'layout',function(){
		return this._layout;
		},function(value){
		if(this._layout !=value){
			this._layout=value;
			this.setBoundsChangedFlag(true);
		}
	});

	__getset(0,__proto,'columnGap',function(){
		return this._columnGap;
		},function(value){
		if(this._columnGap !=value){
			this._columnGap=value;
			this.setBoundsChangedFlag();
		}
	});

	__getset(0,__proto,'lineGap',function(){
		return this._lineGap;
		},function(value){
		if(this._lineGap !=value){
			this._lineGap=value;
			this.setBoundsChangedFlag();
		}
	});

	return GGroup;
})(GObject)


//class fairygui.GImage extends fairygui.GObject
var GImage=(function(_super){
	function GImage(){
		this.image=null;
		this._color=null;
		this._flip=0;
		GImage.__super.call(this);
		this._color="#FFFFFF";
	}

	__class(GImage,'fairygui.GImage',_super);
	var __proto=GImage.prototype;
	Laya.imps(__proto,{"fairygui.gears.IColorGear":true})
	__proto.applyColor=function(){}
	__proto.createDisplayObject=function(){
		this._displayObject=this.image=new Image$1();
		this.image.mouseEnabled=false;
		this._displayObject["$owner"]=this;
	}

	__proto.constructFromResource=function(){
		this.packageItem.load();
		this.sourceWidth=this.packageItem.width;
		this.sourceHeight=this.packageItem.height;
		this.initWidth=this.sourceWidth;
		this.initHeight=this.sourceHeight;
		this.image.scale9Grid=this.packageItem.scale9Grid;
		this.image.scaleByTile=this.packageItem.scaleByTile;
		this.image.tileGridIndice=this.packageItem.tileGridIndice;
		this.image.tex=this.packageItem.texture;
		this.setSize(this.sourceWidth,this.sourceHeight);
	}

	__proto.handleXYChanged=function(){
		_super.prototype.handleXYChanged.call(this);
		if(this._flip !=0){
			if(this.scaleX==-1)
				this.image.x+=this.width;
			if(this.scaleY==-1)
				this.image.y+=this.height;
		}
	}

	__proto.handleSizeChanged=function(){
		if(this.image.tex!=null){
			this.image.scaleTexture(this.width/this.sourceWidth,this.height/this.sourceHeight);
		}
	}

	__proto.setup_beforeAdd=function(buffer,beginPos){
		_super.prototype.setup_beforeAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,5);
		if (buffer.readBool())
			this.color=buffer.readColorS();
		this.flip=buffer.readByte();
		this.image.fillMethod=buffer.readByte();
		if (this.image.fillMethod !=0){
			this.image.fillOrigin=buffer.readByte();
			this.image.fillClockwise=buffer.readBool();
			this.image.fillAmount=buffer.getFloat32();
		}
	}

	__getset(0,__proto,'color',function(){
		return this._color;
		},function(value){
		if(this._color !=value){
			this._color=value;
			this.updateGear(4);
			this.applyColor();
		}
	});

	__getset(0,__proto,'fillClockwise',function(){
		return this.image.fillClockwise;
		},function(value){
		this.image.fillClockwise=value;
	});

	/**
	*@see FlipType
	*/
	/**
	*@see FlipType
	*/
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

	__getset(0,__proto,'fillMethod',function(){
		return this.image.fillMethod;
		},function(value){
		this.image.fillMethod=value;
	});

	__getset(0,__proto,'fillOrigin',function(){
		return this.image.fillOrigin;
		},function(value){
		this.image.fillOrigin=value;
	});

	__getset(0,__proto,'fillAmount',function(){
		return this.image.fillAmount;
		},function(value){
		this.image.fillAmount=value;
	});

	return GImage;
})(GObject)


//class fairygui.gears.GearXY extends fairygui.gears.GearBase
var GearXY=(function(_super){
	function GearXY(owner){
		this._storage=null;
		this._default=null;
		GearXY.__super.call(this,owner);
	}

	__class(GearXY,'fairygui.gears.GearXY',_super);
	var __proto=GearXY.prototype;
	__proto.init=function(){
		this._default=new Point(this._owner.x,this._owner.y);
		this._storage={};
	}

	__proto.addStatus=function(pageId,buffer){
		var gv;
		if (pageId==null)
			gv=this._default;
		else {
			gv=new Point();
			this._storage[pageId]=gv;
		}
		gv.x=buffer.getInt32();
		gv.y=buffer.getInt32();
	}

	__proto.apply=function(){
		var pt=this._storage[this._controller.selectedPageId];
		if (!pt)
			pt=this._default;
		if(this._tweenConfig!=null && this._tweenConfig.tween && !UIPackage._constructing && !GearBase.disableAllTweenEffect){
			if (this._tweenConfig._tweener !=null){
				if (this._tweenConfig._tweener.endValue.x !=pt.x || this._tweenConfig._tweener.endValue.y !=pt.y){
					this._tweenConfig._tweener.kill(true);
					this._tweenConfig._tweener=null;
				}
				else
				return;
			}
			if (this._owner.x !=pt.x || this._owner.y !=pt.y){
				if(this._owner.checkGearController(0,this._controller))
					this._tweenConfig._displayLockToken=this._owner.addDisplayLock();
				this._tweenConfig._tweener=GTween.to2(this._owner.x,this._owner.y,pt.x,pt.y,this._tweenConfig.duration)
				.setDelay(this._tweenConfig.delay)
				.setEase(this._tweenConfig.easeType)
				.setTarget(this)
				.onUpdate(this.__tweenUpdate,this)
				.onComplete(this.__tweenComplete,this);
			}
		}
		else {
			this._owner._gearLocked=true;
			this._owner.setXY(pt.x,pt.y);
			this._owner._gearLocked=false;
		}
	}

	__proto.__tweenUpdate=function(tweener){
		this._owner._gearLocked=true;
		this._owner.setXY(tweener.value.x,tweener.value.y);
		this._owner._gearLocked=false;
	}

	__proto.__tweenComplete=function(){
		if(this._tweenConfig._displayLockToken!=0){
			this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
			this._tweenConfig._displayLockToken=0;
		}
		this._tweenConfig._tweener=null;
	}

	__proto.updateState=function(){
		var pt=this._storage[this._controller.selectedPageId];
		if(!pt){
			pt=new Point();
			this._storage[this._controller.selectedPageId]=pt;
		}
		pt.x=this._owner.x;
		pt.y=this._owner.y;
	}

	__proto.updateFromRelations=function(dx,dy){
		if(this._controller==null || this._storage==null)
			return;
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
		this._url=null;
		this._align=null;
		this._valign=null;
		this._autoSize=false;
		this._fill=0;
		this._shrinkOnly=false;
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
		this._content2=null;
		this._updatingLayout=false;
		GLoader.__super.call(this);
		this._playing=true;
		this._url="";
		this._fill=0;
		this._align="left";
		this._valign="top";
		this._showErrorSign=true;
		this._color="#FFFFFF";
	}

	__class(GLoader,'fairygui.GLoader',_super);
	var __proto=GLoader.prototype;
	Laya.imps(__proto,{"fairygui.gears.IAnimationGear":true,"fairygui.gears.IColorGear":true})
	__proto.createDisplayObject=function(){
		_super.prototype.createDisplayObject.call(this);
		this._displayObject.mouseEnabled=true;
	}

	__proto.dispose=function(){
		if(this._contentItem==null && ((this._content instanceof fairygui.display.Image ))){
			var texture=(this._content).tex;
			if(texture !=null)
				this.freeExternal(texture);
		}
		if(this._content2!=null)
			this._content2.dispose();
		_super.prototype.dispose.call(this);
	}

	__proto.advance=function(timeInMiniseconds){
		if((this._content instanceof fairygui.display.MovieClip ))
			(this._content).advance(timeInMiniseconds);
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
			if(this._autoSize)
				this.setSize(this._contentItem.width,this._contentItem.height);
			if(this._contentItem.type==0){
				if(this._contentItem.texture==null){
					this.setErrorState();
				}
				else {
					if(!((this._content instanceof fairygui.display.Image ))){
						this._content=new Image$1();
						this._displayObject.addChild(this._content);
					}
					else
					this._displayObject.addChild(this._content);
					(this._content).tex=this._contentItem.texture;
					(this._content).scale9Grid=this._contentItem.scale9Grid;
					(this._content).scaleByTile=this._contentItem.scaleByTile;
					(this._content).tileGridIndice=this._contentItem.tileGridIndice;
					this._contentSourceWidth=this._contentItem.width;
					this._contentSourceHeight=this._contentItem.height;
					this.updateLayout();
				}
			}
			else if(this._contentItem.type==1){
				if(!((this._content instanceof fairygui.display.MovieClip ))){
					this._content=new MovieClip$1();
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
			else if(this._contentItem.type==3){
				var obj=UIPackage.createObjectFromURL(itemURL);
				if(!obj)
					this.setErrorState();
				else if(!((obj instanceof fairygui.GComponent ))){
					obj.dispose();
					this.setErrorState();
				}
				else{
					this._content2=obj.asCom;
					this._displayObject.addChild(this._content2.displayObject);
					this._contentSourceWidth=this._contentItem.width;
					this._contentSourceHeight=this._contentItem.height;
					this.updateLayout();
				}
			}
			else
			this.setErrorState();
		}
		else
		this.setErrorState();
	}

	__proto.loadExternal=function(){
		AssetProxy.inst.load(this._url,Handler.create(this,this.__getResCompleted),null,"image");
	}

	__proto.freeExternal=function(texture){}
	__proto.onExternalLoadSuccess=function(texture){
		if(!((this._content instanceof fairygui.display.Image ))){
			this._content=new Image$1();
			this._displayObject.addChild(this._content);
		}
		else
		this._displayObject.addChild(this._content);
		(this._content).tex=texture;
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
			if (UIConfig$1.loaderErrorSign !=null){
				this._errorSign=fairygui.GLoader._errorSignPool.getObject(UIConfig$1.loaderErrorSign);
			}
		}
		if (this._errorSign !=null){
			this._errorSign.setSize(this.width,this.height);
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
		if (this._content2==null && this._content==null){
			if (this._autoSize){
				this._updatingLayout=true;
				this.setSize(50,30);
				this._updatingLayout=false;
			}
			return;
		}
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
			if(this._contentWidth==this._width && this._contentHeight==this._height){
				if(this._content2!=null){
					this._content2.setXY(0,0);
					this._content2.setScale(1,1);
				}
				else{
					this._content.x=0;
					this._content.y=0;
					this._content.scaleX=1;
					this._content.scaleY=1;
				}
				return;
			}
		};
		var sx=1,sy=1;
		if(this._fill!=0){
			sx=this.width/this._contentSourceWidth;
			sy=this.height/this._contentSourceHeight;
			if(sx!=1 || sy!=1){
				if (this._fill==2)
					sx=sy;
				else if (this._fill==3)
				sy=sx;
				else if (this._fill==1){
					if (sx > sy)
						sx=sy;
					else
					sy=sx;
				}
				else if (this._fill==5){
					if (sx > sy)
						sy=sx;
					else
					sx=sy;
				}
				if(this._shrinkOnly){
					if(sx>1)
						sx=1;
					if(sy>1)
						sy=1;
				}
				this._contentWidth=this._contentSourceWidth *sx;
				this._contentHeight=this._contentSourceHeight *sy;
			}
		}
		if(this._content2!=null)
			this._content2.setScale(sx,sy);
		else if ((this._content instanceof fairygui.display.Image ))
		(this._content).scaleTexture(sx,sy);
		else
		this._content.scale(sx,sy);
		var nx=NaN,ny=NaN;
		if (this._align=="center")
			nx=Math.floor((this.width-this._contentWidth)/ 2);
		else if (this._align=="right")
		nx=this.width-this._contentWidth;
		else
		nx=0;
		if (this._valign=="middle")
			ny=Math.floor((this.height-this._contentHeight)/ 2);
		else if (this._valign=="bottom")
		ny=this.height-this._contentHeight;
		else
		ny=0;
		if(this._content2!=null)
			this._content2.setXY(nx,ny);
		else{
			this._content.x=nx;
			this._content.y=ny;
		}
	}

	__proto.clearContent=function(){
		this.clearErrorState();
		if (this._content !=null && this._content.parent !=null)
			this._displayObject.removeChild(this._content);
		if(this._contentItem==null && ((this._content instanceof fairygui.display.Image ))){
			var texture=(this._content).tex;
			if(texture !=null)
				this.freeExternal(texture);
		}
		if(this._content2!=null){
			this._content2.dispose();
			this._content2=null;
		}
		this._contentItem=null;
	}

	__proto.handleSizeChanged=function(){
		_super.prototype.handleSizeChanged.call(this);
		if(!this._updatingLayout)
			this.updateLayout();
	}

	__proto.setup_beforeAdd=function(buffer,beginPos){
		_super.prototype.setup_beforeAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,5);
		var iv=0;
		this._url=buffer.readS();
		iv=buffer.readByte();
		this._align=iv==0?"left":(iv==1?"center":"right");
		iv=buffer.readByte();
		this._valign=iv==0?"top":(iv==1?"middle":"bottom");
		this._fill=buffer.readByte();
		this._shrinkOnly=buffer.readBool();
		this._autoSize=buffer.readBool();
		this._showErrorSign=buffer.readBool();
		this._playing=buffer.readBool();
		this._frame=buffer.getInt32();
		if (buffer.readBool())
			this.color=buffer.readColorS();
		var fillMethod=buffer.readByte();
		if (fillMethod !=0)
			buffer.skip(6);
		if (this._url)
			this.loadContent();
	}

	__getset(0,__proto,'frame',function(){
		return this._frame;
		},function(value){
		if (this._frame !=value){
			this._frame=value;
			if ((this._content instanceof fairygui.display.MovieClip ))
				(this._content).frame=value;
			this.updateGear(5);
		}
	});

	__getset(0,__proto,'url',function(){
		return this._url;
		},function(value){
		if (this._url==value)
			return;
		this._url=value;
		this.loadContent();
		this.updateGear(7);
	});

	__getset(0,__proto,'align',function(){
		return this._align;
		},function(value){
		if (this._align !=value){
			this._align=value;
			this.updateLayout();
		}
	});

	/**
	*@see LoaderFillType
	*/
	/**
	*@see LoaderFillType
	*/
	__getset(0,__proto,'fill',function(){
		return this._fill;
		},function(value){
		if (this._fill !=value){
			this._fill=value;
			this.updateLayout();
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

	__getset(0,__proto,'icon',function(){
		return this._url;
		},function(value){
		this.url=value;
	});

	__getset(0,__proto,'content',function(){
		return this._content;
	});

	__getset(0,__proto,'shrinkOnly',function(){
		return this._shrinkOnly;
		},function(value){
		if(this._shrinkOnly!=value){
			this._shrinkOnly=value;
			this.updateLayout();
		}
	});

	//todo:
	__getset(0,__proto,'showErrorSign',function(){
		return this._showErrorSign;
		},function(value){
		this._showErrorSign=value;
	});

	__getset(0,__proto,'autoSize',function(){
		return this._autoSize;
		},function(value){
		if (this._autoSize !=value){
			this._autoSize=value;
			this.updateLayout();
		}
	});

	__getset(0,__proto,'playing',function(){
		return this._playing;
		},function(value){
		if (this._playing !=value){
			this._playing=value;
			if ((this._content instanceof fairygui.display.MovieClip ))
				(this._content).playing=value;
			this.updateGear(5);
		}
	});

	__getset(0,__proto,'timeScale',function(){
		if((this._content instanceof fairygui.display.MovieClip ))
			return (this._content).timeScale;
		else
		return 1;
		},function(value){
		if((this._content instanceof fairygui.display.MovieClip ))
			(this._content).timeScale=value;
	});

	__getset(0,__proto,'color',function(){
		return this._color;
		},function(value){
		if(this._color !=value){
			this._color=value;
			this.updateGear(4);
			this.applyColor();
		}
	});

	__getset(0,__proto,'component',function(){
		return this._content2;
	});

	__static(GLoader,
	['_errorSignPool',function(){return this._errorSignPool=new GObjectPool();}
	]);
	return GLoader;
})(GObject)


//class fairygui.GMovieClip extends fairygui.GObject
var GMovieClip=(function(_super){
	function GMovieClip(){
		this._movieClip=null;
		GMovieClip.__super.call(this);
		this._sizeImplType=1;
	}

	__class(GMovieClip,'fairygui.GMovieClip',_super);
	var __proto=GMovieClip.prototype;
	Laya.imps(__proto,{"fairygui.gears.IAnimationGear":true,"fairygui.gears.IColorGear":true})
	__proto.createDisplayObject=function(){
		this._displayObject=this._movieClip=new MovieClip$1();
		this._movieClip.mouseEnabled=false;
		this._displayObject["$owner"]=this;
	}

	__proto.rewind=function(){
		this._movieClip.rewind();
	}

	__proto.syncStatus=function(anotherMc){
		this._movieClip.syncStatus(anotherMc._movieClip);
	}

	__proto.advance=function(timeInMiniseconds){
		this._movieClip.advance(timeInMiniseconds);
	}

	//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
	__proto.setPlaySettings=function(start,end,times,endAt,endHandler){
		(start===void 0)&& (start=0);
		(end===void 0)&& (end=-1);
		(times===void 0)&& (times=0);
		(endAt===void 0)&& (endAt=-1);
		this._movieClip.setPlaySettings(start,end,times,endAt,endHandler);
	}

	__proto.constructFromResource=function(){
		this.sourceWidth=this.packageItem.width;
		this.sourceHeight=this.packageItem.height;
		this.initWidth=this.sourceWidth;
		this.initHeight=this.sourceHeight;
		this.setSize(this.sourceWidth,this.sourceHeight);
		this.packageItem.load();
		this._movieClip.interval=this.packageItem.interval;
		this._movieClip.swing=this.packageItem.swing;
		this._movieClip.repeatDelay=this.packageItem.repeatDelay;
		this._movieClip.frames=this.packageItem.frames;
		this._movieClip.boundsRect=new Rectangle(0,0,this.sourceWidth,this.sourceHeight);
	}

	__proto.setup_beforeAdd=function(buffer,beginPos){
		_super.prototype.setup_beforeAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,5);
		if (buffer.readBool())
			this.color=buffer.readColorS();
		buffer.readByte();
		this._movieClip.frame=buffer.getInt32();
		this._movieClip.playing=buffer.readBool();
	}

	__getset(0,__proto,'color',function(){
		return "#FFFFFF";
		},function(value){
	});

	__getset(0,__proto,'playing',function(){
		return this._movieClip.playing;
		},function(value){
		if (this._movieClip.playing !=value){
			this._movieClip.playing=value;
			this.updateGear(5);
		}
	});

	__getset(0,__proto,'timeScale',function(){
		return this._movieClip.timeScale;
		},function(value){
		this._movieClip.timeScale=value;
	});

	__getset(0,__proto,'frame',function(){
		return this._movieClip.frame;
		},function(value){
		if (this._movieClip.frame !=value){
			this._movieClip.frame=value;
			this.updateGear(5);
		}
	});

	return GMovieClip;
})(GObject)


//class fairygui.GBasicTextField extends fairygui.GTextField
var GBasicTextField=(function(_super){
	var LineInfo,TextExt;
	function GBasicTextField(){
		this.textField=null;
		this._font=null;
		this._color=null;
		this._ubbEnabled=false;
		this._singleLine=false;
		this._letterSpacing=0;
		this._autoSize=0;
		this._widthAutoSize=false;
		this._heightAutoSize=false;
		this._updatingSize=false;
		this._textWidth=0;
		this._textHeight=0;
		this._bitmapFont=null;
		this._lines=null;
		GBasicTextField.__super.call(this);
		this._text="";
		this._color="#000000";
		this.textField.align="left";
		this.textField.font=UIConfig$1.defaultFont;
		this._autoSize=1;
		this._widthAutoSize=this._heightAutoSize=true;
		this.textField["_sizeDirty"]=false;
	}

	__class(GBasicTextField,'fairygui.GBasicTextField',_super);
	var __proto=GBasicTextField.prototype;
	__proto.createDisplayObject=function(){
		this._displayObject=this.textField=new TextExt(this);
		this._displayObject["$owner"]=this;
		this._displayObject.mouseEnabled=false;
	}

	__proto.setAutoSize=function(value){
		this._autoSize=value;
		this._widthAutoSize=value==1;
		this._heightAutoSize=value==1 || value==2;
		this.textField.wordWrap=!this._widthAutoSize && !this._singleLine;
		if(!this._underConstruct){
			if(!this._heightAutoSize)
				this.textField.size(this.width,this.height);
			else if(!this._widthAutoSize)
			this.textField.width=this.width;
		}
	}

	__proto.ensureSizeCorrect=function(){
		if (!this._underConstruct && this.textField["_isChanged"])
			this.textField.typeset();
	}

	__proto.typeset=function(){
		if(this._bitmapFont!=null)
			this.renderWithBitmapFont();
		else if(this._widthAutoSize || this._heightAutoSize)
		this.updateSize();
	}

	__proto.updateSize=function(){
		this._textWidth=Math.ceil(this.textField.textWidth);
		this._textHeight=Math.ceil(this.textField.textHeight);
		var w=NaN,h=0;
		if(this._widthAutoSize){
			w=this._textWidth;
			if(this.textField.width!=w){
				this.textField.width=w;
				if(this.textField.align!="left")
					this.textField["baseTypeset"]();
			}
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
		var wordWrap=!this._widthAutoSize && !this._singleLine;
		var fontSize=this.fontSize;
		var fontScale=this._bitmapFont.resizable?fontSize/this._bitmapFont.size:1;
		this._textWidth=0;
		this._textHeight=0;
		var text2=this._text;
		if (this._templateVars !=null)
			text2=this.parseTemplate(text2);
		var textLength=text2.length;
		for (var offset=0;offset < textLength;++offset){
			var ch=text2.charAt(offset);
			var cc=ch.charCodeAt(0);
			if (cc==10){
				lineBuffer+=ch;
				line=LineInfo.borrow();
				line.width=lineWidth;
				if (lineTextHeight==0){
					if (lastLineHeight==0)
						lastLineHeight=fontSize;
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
				if (line.width > this._textWidth)
					this._textWidth=line.width;
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
			if (cc>=65 && cc<=90 || cc>=97 && cc<=122){
				if (wordChars==0)
					wordStart=lineWidth;
				wordChars++;
			}
			else{
				if (wordChars > 0)
					wordEnd=lineWidth;
				wordChars=0;
			}
			if (cc==32){
				glyphWidth=Math.ceil(fontSize / 2);
				glyphHeight=fontSize;
			}
			else {
				var glyph=this._bitmapFont.glyphs[ch];
				if (glyph){
					glyphWidth=Math.ceil(glyph.advance*fontScale);
					glyphHeight=Math.ceil(glyph.lineHeight*fontScale);
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
					lineBuffer=lineBuffer.substr(len);
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
				if (line.width > this._textWidth)
					this._textWidth=line.width;
				wordChars=0;
				wordStart=0;
				wordEnd=0;
				this._lines.push(line);
			}
		}
		if (lineBuffer.length > 0){
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
			if (line.width > this._textWidth)
				this._textWidth=line.width;
			this._lines.push(line);
		}
		if (this._textWidth > 0)
			this._textWidth+=2 *2;
		var count=this._lines.length;
		if (count==0){
			this._textHeight=0;
		}
		else {
			line=this._lines[this._lines.length-1];
			this._textHeight=line.y+line.height+2;
		};
		var w=NaN,h=0;
		if (this._widthAutoSize){
			if (this._textWidth==0)
				w=0;
			else
			w=this._textWidth;
		}
		else
		w=this.width;
		if (this._heightAutoSize){
			if (this._textHeight==0)
				h=0;
			else
			h=this._textHeight;
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
				cc=ch.charCodeAt(0);
				if(cc==10)
					continue ;
				if(cc==32){
					charX+=this._letterSpacing+Math.ceil(fontSize/2);
					continue ;
				}
				glyph=this._bitmapFont.glyphs[ch];
				if (glyph !=null){
					charIndent=(line.height+line.textHeight)/ 2-Math.ceil(glyph.lineHeight*fontScale);
					if(glyph.texture){
						gr.drawTexture(glyph.texture,
						charX+lineIndent+Math.ceil(glyph.offsetX*fontScale),
						line.y+charIndent+Math.ceil(glyph.offsetY*fontScale),
						glyph.texture.width *fontScale,
						glyph.texture.height *fontScale);
					}
					charX+=letterSpacing+Math.ceil(glyph.advance*fontScale);
				}
				else {
					charX+=letterSpacing;
				}
			}
		}
	}

	//line loop
	__proto.handleSizeChanged=function(){
		if(this._updatingSize)
			return;
		if(this._underConstruct)
			this.textField.size(this.width,this.height);
		else{
			if(this._bitmapFont!=null){
				if(!this._widthAutoSize)
					this.textField["setChanged"]();
				else
				this.doAlign();
			}
			else {
				if(!this._widthAutoSize){
					if(!this._heightAutoSize)
						this.textField.size(this.width,this.height);
					else
					this.textField.width=this.width;
				}
			}
		}
	}

	__proto.handleGrayedChanged=function(){
		fairygui.GObject.prototype.handleGrayedChanged.call(this);
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

	__proto.flushVars=function(){
		this.text=this._text;
	}

	__getset(0,__proto,'bold',function(){
		return this.textField.bold;
		},function(value){
		this.textField.bold=value;
	});

	__getset(0,__proto,'letterSpacing',function(){
		return this._letterSpacing;
		},function(value){
		this._letterSpacing=value;
	});

	__getset(0,__proto,'align',function(){
		return this.textField.align;
		},function(value){
		this.textField.align=value;
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
			var text2=this._text;
			if (this._templateVars !=null)
				text2=this.parseTemplate(text2);
			if(this._ubbEnabled)
				this.textField.text=ToolSet.removeUBB(ToolSet.encodeHTML(text2));
			else
			this.textField.text=text2;
		}
		else{
			this.textField.text="";
			this.textField["setChanged"]();
		}
		if(this.parent && this.parent._underConstruct)
			this.textField.typeset();
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

	__getset(0,__proto,'font',function(){
		return this.textField.font;
		},function(value){
		this._font=value;
		if(ToolSet.startsWith(this._font,"ui://"))
			this._bitmapFont=UIPackage.getItemAssetByURL(this._font);
		else
		this._bitmapFont=null;
		if(this._bitmapFont!=null){
			this.textField["setChanged"]();
		}
		else {
			if(this._font)
				this.textField.font=this._font;
			else
			this.textField.font=UIConfig$1.defaultFont;
		}
	});

	__getset(0,__proto,'leading',function(){
		return this.textField.leading;
		},function(value){
		this.textField.leading=value;
	});

	__getset(0,__proto,'fontSize',function(){
		return this.textField.fontSize;
		},function(value){
		this.textField.fontSize=value;
	});

	__getset(0,__proto,'valign',function(){
		return this.textField.valign;
		},function(value){
		this.textField.valign=value;
	});

	__getset(0,__proto,'italic',function(){
		return this.textField.italic;
		},function(value){
		this.textField.italic=value;
	});

	__getset(0,__proto,'underline',function(){
		return this.textField.underline;
		},function(value){
		this.textField.underline=value;
	});

	__getset(0,__proto,'singleLine',function(){
		return this._singleLine;
		},function(value){
		this._singleLine=value;
		this.textField.wordWrap=!this._widthAutoSize && !this._singleLine;
	});

	__getset(0,__proto,'stroke',function(){
		return this.textField.stroke;
		},function(value){
		this.textField.stroke=value;
	});

	__getset(0,__proto,'strokeColor',function(){
		return this.textField.strokeColor;
		},function(value){
		this.textField.strokeColor=value;
		this.updateGear(4);
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
		}
	});

	__getset(0,__proto,'textWidth',function(){
		if (this.textField["_isChanged"])
			this.textField.typeset();
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
		//class TextExt extends laya.display.Text
		TextExt=(function(_super){
			function TextExt(owner){
				this._owner=null;
				this._lock=false;
				this._sizeDirty=false;
				TextExt.__super.call(this);
				this._owner=owner;
			}
			__class(TextExt,'',_super);
			var __proto=TextExt.prototype;
			__proto.baseTypeset=function(){
				this._lock=true;
				this.typeset();
				this._lock=false;
			}
			__proto.typeset=function(){
				this._sizeDirty=true;
				_super.prototype.typeset.call(this);
				if(!this._lock)
					this._owner.typeset();
				if(this._isChanged){
					Laya.timer.clear(this,this.typeset);
					this._isChanged=false;
				}
				this._sizeDirty=false;
			}
			__proto.setChanged=function(){
				this.isChanged=true;
			}
			__getset(0,__proto,'isChanged',null,function(value){
				if (value && !this._sizeDirty){
					if(this._owner.autoSize!=0 && this._owner.parent){
						this._sizeDirty=true;
						this.event("fui_size_delay_change");
					}
				}
				Laya.superSet(Text,this,'isChanged',value);
			});
			return TextExt;
		})(Text)
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
		this._downScaled=false;
		this._down=false;
		this._over=false;
		GButton.__super.call(this);
		this._mode=0;
		this._title="";
		this._icon="";
		this._sound=UIConfig$1.buttonSound;
		this._soundVolumeScale=UIConfig$1.buttonSoundVolumeScale;
		this._pageOption=new PageOption();
		this._changeStateOnClick=true;
		this._downEffectValue=0.8;
	}

	__class(GButton,'fairygui.GButton',_super);
	var __proto=GButton.prototype;
	__proto.getTextField=function(){
		if ((this._titleObject instanceof fairygui.GTextField ))
			return this._titleObject;
		else if ((this._titleObject instanceof fairygui.GLabel ))
		return (this._titleObject).getTextField();
		else if ((this._titleObject instanceof fairygui.GButton ))
		return (this._titleObject).getTextField();
		else
		return null;
	}

	__proto.fireClick=function(downEffect){
		(downEffect===void 0)&& (downEffect=true);
		if (downEffect && this._mode==0){
			this.setState("over");
			Laya.timer.once(100,this,this.setState,["down"],false);
			Laya.timer.once(200,this,this.setState,["up"],false);
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
			if(val=="down" || val=="selectedOver" || val=="selectedDisabled"){
				if(!this._downScaled){
					this.setScale(this.scaleX*this._downEffectValue,this.scaleY*this._downEffectValue);
					this._downScaled=true;
				}
			}
			else{
				if(this._downScaled){
					this.setScale(this.scaleX/this._downEffectValue,this.scaleY/this._downEffectValue);
					this._downScaled=false;
				}
			}
		}
	}

	__proto.handleControllerChanged=function(c){
		_super.prototype.handleControllerChanged.call(this,c);
		if (this._relatedController==c)
			this.selected=this._pageOption.id==c.selectedPageId;
	}

	__proto.handleGrayedChanged=function(){
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
		_super.prototype.handleGrayedChanged.call(this);
	}

	__proto.constructExtension=function(buffer){
		buffer.seek(0,6);
		this._mode=buffer.readByte();
		var str=buffer.readS();
		if(str)
			this._sound=str;
		this._soundVolumeScale=buffer.getFloat32();
		this._downEffect=buffer.readByte();
		this._downEffectValue=buffer.getFloat32();
		if(this._downEffect==2)
			this.setPivot(0.5,0.5,this.pivotAsAnchor);
		this._buttonController=this.getController("button");
		this._titleObject=this.getChild("title");
		this._iconObject=this.getChild("icon");
		if (this._titleObject !=null)
			this._title=this._titleObject.text;
		if (this._iconObject !=null)
			this._icon=this._iconObject.icon;
		if (this._mode==0)
			this.setState("up");
		this.on("mouseover",this,this.__rollover);
		this.on("mouseout",this,this.__rollout);
		this.on("mousedown",this,this.__mousedown);
		this.on("click",this,this.__click);
	}

	__proto.setup_afterAdd=function(buffer,beginPos){
		_super.prototype.setup_afterAdd.call(this,buffer,beginPos);
		if (!buffer.seek(beginPos,6))
			return;
		if (buffer.readByte()!=this.packageItem.objectType)
			return;
		var str;
		var iv=0;
		str=buffer.readS();
		if (str !=null)
			this.title=str;
		str=buffer.readS();
		if (str !=null)
			this.selectedTitle=str;
		str=buffer.readS();
		if (str !=null)
			this.icon=str;
		str=buffer.readS();
		if (str !=null)
			this.selectedIcon=str;
		if (buffer.readBool())
			this.titleColor=buffer.readColorS();
		iv=buffer.getInt32();
		if (iv !=0)
			this.titleFontSize=iv;
		iv=buffer.getInt16();
		if (iv >=0)
			this._relatedController=this.parent.getControllerAt(iv);
		this.pageOption.id=buffer.readS();
		str=buffer.readS();
		if (str !=null)
			this._sound=str;
		if (buffer.readBool())
			this._soundVolumeScale=buffer.getFloat32();
		this.selected=buffer.readBool();
	}

	__proto.__rollover=function(){
		if(!this._buttonController || !this._buttonController.hasPage("over"))
			return;
		this._over=true;
		if (this._down)
			return;
		if(this.grayed && this._buttonController.hasPage("disabled"))
			return;
		this.setState(this._selected ? "selectedOver" :"over");
	}

	__proto.__rollout=function(){
		if(!this._buttonController || !this._buttonController.hasPage("over"))
			return;
		this._over=false;
		if (this._down)
			return;
		if(this.grayed && this._buttonController.hasPage("disabled"))
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
			if(this._displayObject==null)
				return;
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
			if (pi)
				GRoot.inst.playOneShotSound(pi.file);
			else
			GRoot.inst.playOneShotSound(this._sound);
		}
		if (this._mode==1){
			if(this._changeStateOnClick){
				this.selected=!this._selected;
				Events.dispatch("fui_state_changed",this.displayObject,evt);
			}
		}
		else if (this._mode==2){
			if (this._changeStateOnClick && !this._selected){
				this.selected=true;
				Events.dispatch("fui_state_changed",this.displayObject,evt);
			}
		}
		else{
			if(this._relatedController)
				this._relatedController.selectedPageId=this._pageOption.id;
		}
	}

	__getset(0,__proto,'relatedController',function(){
		return this._relatedController;
		},function(val){
		if (val !=this._relatedController){
			this._relatedController=val;
			this._pageOption.controller=val;
			this._pageOption.clear();
		}
	});

	__getset(0,__proto,'icon',function(){
		return this._icon;
		},function(value){
		this._icon=value;
		value=(this._selected && this._selectedIcon)? this._selectedIcon :this._icon;
		if(this._iconObject!=null)
			this._iconObject.icon=value;
		this.updateGear(7);
	});

	__getset(0,__proto,'titleFontSize',function(){
		var tf=this.getTextField();
		if(tf!=null)
			return tf.fontSize;
		else
		return 0;
		},function(value){
		var tf=this.getTextField();
		if(tf!=null)
			tf.fontSize=value;
	});

	__getset(0,__proto,'selectedIcon',function(){
		return this._selectedIcon;
		},function(value){
		this._selectedIcon=value;
		value=(this._selected && this._selectedIcon)? this._selectedIcon :this._icon;
		if(this._iconObject!=null)
			this._iconObject.icon=value;
	});

	__getset(0,__proto,'title',function(){
		return this._title;
		},function(value){
		this._title=value;
		if (this._titleObject)
			this._titleObject.text=(this._selected && this._selectedTitle)? this._selectedTitle :this._title;
		this.updateGear(6);
	});

	__getset(0,__proto,'text',function(){
		return this.title;
		},function(value){
		this.title=value;
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

	__getset(0,__proto,'sound',function(){
		return this._sound;
		},function(val){
		this._sound=val;
	});

	__getset(0,__proto,'titleColor',function(){
		var tf=this.getTextField();
		if(tf!=null)
			return tf.color;
		else
		return "#000000";
		},function(value){
		var tf=this.getTextField();
		if(tf!=null)
			tf.color=value;
		this.updateGear(4);
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
				if(this._iconObject!=null)
					this._iconObject.icon=str;
			}
			if(this._relatedController
				&& this._parent
			&& !this._parent._buildingDisplayList){
				if(this._selected){
					this._relatedController.selectedPageId=this._pageOption.id;
					if(this._relatedController.autoRadioGroupDepth)
						this._parent.adjustRadioGroupDepth(this,this._relatedController);
				}
				else if(this._mode==1 && this._relatedController.selectedPageId==this._pageOption.id)
				this._relatedController.oppositePageId=this._pageOption.id;
			}
		}
	});

	/**
	*@see ButtonMode
	*/
	/**
	*@see ButtonMode
	*/
	__getset(0,__proto,'mode',function(){
		return this._mode;
		},function(value){
		if (this._mode !=value){
			if (value==0)
				this.selected=false;
			this._mode=value;
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
		this._iconObject=null;
		this._list=null;
		this._items=null;
		this._icons=null;
		this._values=null;
		this._popupDirection=0;
		this._visibleItemCount=0;
		this._itemsUpdated=false;
		this._selectedIndex=0;
		this._buttonController=null;
		this._selectionController=null;
		this._down=false;
		this._over=false;
		GComboBox.__super.call(this);
		this._visibleItemCount=UIConfig$1.defaultComboBoxVisibleItemCount;
		this._itemsUpdated=true;
		this._selectedIndex=-1;
		this._items=[];
		this._values=[];
	}

	__class(GComboBox,'fairygui.GComboBox',_super);
	var __proto=GComboBox.prototype;
	__proto.getTextField=function(){
		if ((this._titleObject instanceof fairygui.GTextField ))
			return this._titleObject;
		else if ((this._titleObject instanceof fairygui.GLabel ))
		return (this._titleObject).getTextField();
		else if ((this._titleObject instanceof fairygui.GButton ))
		return (this._titleObject).getTextField();
		else
		return null;
	}

	__proto.setState=function(val){
		if (this._buttonController)
			this._buttonController.selectedPage=val;
	}

	__proto.handleControllerChanged=function(c){
		_super.prototype.handleControllerChanged.call(this,c);
		if (this._selectionController==c)
			this.selectedIndex=c.selectedIndex;
	}

	__proto.updateSelectionController=function(){
		if (this._selectionController !=null && !this._selectionController.changing
			&& this._selectedIndex < this._selectionController.pageCount){
			var c=this._selectionController;
			this._selectionController=null;
			c.selectedIndex=this._selectedIndex;
			this._selectionController=c;
		}
	}

	__proto.dispose=function(){
		if(this.dropdown){
			this.dropdown.dispose();
			this.dropdown=null;
		}
		this._selectionController=null;
		_super.prototype.dispose.call(this);
	}

	__proto.constructExtension=function(buffer){
		var str;
		this._buttonController=this.getController("button");
		this._titleObject=this.getChild("title");
		this._iconObject=this.getChild("icon");
		str=buffer.readS();
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

	__proto.setup_afterAdd=function(buffer,beginPos){
		_super.prototype.setup_afterAdd.call(this,buffer,beginPos);
		if (!buffer.seek(beginPos,6))
			return;
		if (buffer.readByte()!=this.packageItem.objectType)
			return;
		var i=0;
		var iv=0;
		var nextPos=0;
		var str;
		var itemCount=buffer.getInt16();
		for (i=0;i < itemCount;i++){
			nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			this._items[i]=buffer.readS();
			this._values[i]=buffer.readS();
			str=buffer.readS();
			if (str !=null){
				if (this._icons==null)
					this._icons=[];
				this._icons[i]=str;
			}
			buffer.pos=nextPos;
		}
		str=buffer.readS();
		if (str !=null){
			this.text=str;
			this._selectedIndex=this._items.indexOf(str);
		}
		else if (this._items.length > 0){
			this._selectedIndex=0;
			this.text=this._items[0];
		}
		else
		this._selectedIndex=-1;
		str=buffer.readS();
		if (str !=null)
			this.icon=str;
		if (buffer.readBool())
			this.titleColor=buffer.readColorS();
		iv=buffer.getInt32();
		if (iv > 0)
			this._visibleItemCount=iv;
		this._popupDirection=buffer.readByte();
		iv=buffer.getInt16();
		if (iv >=0)
			this._selectionController=this.parent.getControllerAt(iv);
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
				item.icon=(this._icons !=null && i < this._icons.length)? this._icons[i] :null;
			}
			this._list.resizeToFit(this._visibleItemCount);
		}
		this._list.selectedIndex=-1;
		this.dropdown.width=this.width;
		var downward=null;
		if (this._popupDirection==2)
			downward=true;
		else if (this._popupDirection==1)
		downward=false;
		this.root.togglePopup(this.dropdown,this,downward);
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
		this._selectedIndex=-1;
		this.selectedIndex=index;
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
		if((evt.target instanceof laya.display.Input ))
			return;
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
		this.updateGear(6);
	});

	__getset(0,__proto,'titleColor',function(){
		var tf=this.getTextField();
		if(tf!=null)
			return tf.color;
		else
		return "#000000";
		},function(value){
		var tf=this.getTextField();
		if(tf!=null)
			tf.color=value;
		this.updateGear(4);
	});

	__getset(0,__proto,'titleFontSize',function(){
		var tf=this.getTextField();
		if(tf!=null)
			return tf.fontSize;
		else
		return 0;
		},function(value){
		var tf=this.getTextField();
		if(tf!=null)
			tf.fontSize=value;
	});

	__getset(0,__proto,'icon',function(){
		if(this._iconObject)
			return this._iconObject.icon;
		else
		return null;
		},function(value){
		if(this._iconObject)
			this._iconObject.icon=value;
		this.updateGear(7);
	});

	__getset(0,__proto,'icons',function(){
		return this._icons;
		},function(value){
		this._icons=value;
		if (this._icons !=null && this._selectedIndex !=-1 && this._selectedIndex < this._icons.length)
			this.icon=this._icons[this._selectedIndex];
	});

	__getset(0,__proto,'selectionController',function(){
		return this._selectionController;
		},function(value){
		this._selectionController=value;
	});

	__getset(0,__proto,'visibleItemCount',function(){
		return this._visibleItemCount;
		},function(value){
		this._visibleItemCount=value;
	});

	/**
	*@see PopupDirection
	*/
	/**
	*@see PopupDirection
	*/
	__getset(0,__proto,'popupDirection',function(){
		return this._popupDirection;
		},function(value){
		this._popupDirection=value;
	});

	__getset(0,__proto,'items',function(){
		return this._items;
		},function(value){
		if(!value)
			this._items.length=0;
		else
		this._items=value.concat();
		if(this._items.length>0){
			if(this._selectedIndex>=this._items.length)
				this._selectedIndex=this._items.length-1;
			else if(this._selectedIndex==-1)
			this._selectedIndex=0;
			this.text=this._items[this._selectedIndex];
			if (this._icons !=null && this._selectedIndex < this._icons.length)
				this.icon=this._icons[this._selectedIndex];
		}
		else{
			this.text="";
			if (this._icons !=null)
				this.icon=null;
			this._selectedIndex=-1;
		}
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

	__getset(0,__proto,'selectedIndex',function(){
		return this._selectedIndex;
		},function(val){
		if(this._selectedIndex==val)
			return;
		this._selectedIndex=val;
		if(this._selectedIndex>=0 && this._selectedIndex<this._items.length){
			this.text=this._items[this._selectedIndex];
			if (this._icons !=null && this._selectedIndex < this._icons.length)
				this.icon=this._icons[this._selectedIndex];
		}
		else{
			this.text="";
			if (this._icons !=null)
				this.icon=null;
		}
		this.updateSelectionController();
	});

	__getset(0,__proto,'value',function(){
		return this._values[this._selectedIndex];
		},function(val){
		this.selectedIndex=this._values.indexOf(val);
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
	Laya.imps(__proto,{"fairygui.gears.IColorGear":true})
	__proto.getTextField=function(){
		if ((this._titleObject instanceof fairygui.GTextField ))
			return this._titleObject;
		else if ((this._titleObject instanceof fairygui.GLabel ))
		return (this._titleObject).getTextField();
		else if ((this._titleObject instanceof fairygui.GButton ))
		return (this._titleObject).getTextField();
		else
		return null;
	}

	__proto.constructExtension=function(buffer){
		this._titleObject=this.getChild("title");
		this._iconObject=this.getChild("icon");
	}

	__proto.setup_afterAdd=function(buffer,beginPos){
		_super.prototype.setup_afterAdd.call(this,buffer,beginPos);
		if (!buffer.seek(beginPos,6))
			return;
		if (buffer.readByte()!=this.packageItem.objectType)
			return;
		var str;
		str=buffer.readS();
		if (str !=null)
			this.title=str;
		str=buffer.readS();
		if (str !=null)
			this.icon=str;
		if (buffer.readBool())
			this.titleColor=buffer.readColorS();
		var iv=buffer.getInt32();
		if (iv !=0)
			this.titleFontSize=iv;
		if (buffer.readBool()){
			var input=this.getTextField();
			if (input !=null){
				str=buffer.readS();
				if (str !=null)
					input.promptText=str;
				str=buffer.readS();
				if (str !=null)
					input.restrict=str;
				iv=buffer.getInt32();
				if (iv !=0)
					input.maxLength=iv;
				iv=buffer.getInt32();
				if (iv !=0){
					if(iv==4)
						input.keyboardType="number";
					else if(iv==3)
					input.keyboardType="url";
				}
				if (buffer.readBool())
					input.password=true;
			}
			else
			buffer.skip(13);
		}
	}

	__getset(0,__proto,'color',function(){
		return this.titleColor;
		},function(value){
		this.titleColor=value;
	});

	__getset(0,__proto,'icon',function(){
		if(this._iconObject!=null)
			return this._iconObject.icon;
		else
		return null;
		},function(value){
		if(this._iconObject!=null)
			this._iconObject.icon=value;
		this.updateGear(7);
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

	__getset(0,__proto,'title',function(){
		if (this._titleObject)
			return this._titleObject.text;
		else
		return null;
		},function(value){
		if (this._titleObject)
			this._titleObject.text=value;
		this.updateGear(6);
	});

	__getset(0,__proto,'text',function(){
		return this.title;
		},function(value){
		this.title=value;
	});

	__getset(0,__proto,'titleColor',function(){
		var tf=this.getTextField();
		if(tf!=null)
			return tf.color;
		else
		return "#000000";
		},function(value){
		var tf=this.getTextField();
		if(tf!=null)
			tf.color=value;
		this.updateGear(4);
	});

	__getset(0,__proto,'titleFontSize',function(){
		var tf=this.getTextField();
		if(tf!=null)
			return tf.fontSize;
		else
		return 0;
		},function(value){
		var tf=this.getTextField();
		if(tf!=null)
			tf.fontSize=value;
	});

	return GLabel;
})(GComponent)


//class fairygui.GList extends fairygui.GComponent
var GList=(function(_super){
	var ItemInfo;
	function GList(){
		/**
		*itemRenderer(int index,GObject item);
		*/
		this.itemRenderer=null;
		/**
		*itemProvider(index:int):String;
		*/
		this.itemProvider=null;
		this.scrollItemToViewOnClick=false;
		this.foldInvisibleItems=false;
		this._layout=0;
		this._lineCount=0;
		this._columnCount=0;
		this._lineGap=0;
		this._columnGap=0;
		this._defaultItem=null;
		this._autoResizeItem=false;
		this._selectionMode=0;
		this._align=null;
		this._verticalAlign=null;
		this._selectionController=null;
		this._lastSelectedIndex=0;
		this._pool=null;
		//Virtual List support
		this._virtual=false;
		this._loop=false;
		this._numItems=0;
		this._realNumItems=0;
		this._firstIndex=0;
		//the top left index
		this._curLineItemCount=0;
		//item count in one line
		this._curLineItemCount2=0;
		//只用在页面模式，表示垂直方向的项目数
		this._itemSize=null;
		this._virtualListChanged=0;
		//1-content changed,2-size changed
		this._virtualItems=null;
		this._eventLocked=false;
		this.itemInfoVer=0;
		GList.__super.call(this);
		this._trackBounds=true;
		this._pool=new GObjectPool();
		this._layout=0;
		this._autoResizeItem=true;
		this._lastSelectedIndex=-1;
		this._selectionMode=0;
		this.opaque=true;
		this.scrollItemToViewOnClick=true;
		this._align="left";
		this._verticalAlign="top";
		this._container=new Sprite();
		this._displayObject.addChild(this._container);
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
		obj.displayObject.cacheAs="none";
		this._pool.returnObject(obj);
	}

	__proto.addChildAt=function(child,index){
		(index===void 0)&& (index=0);
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
		var i=0;
		if (this._virtual){
			for (i=0;i < this._realNumItems;i++){
				var ii=this._virtualItems[i];
				if (((ii.obj instanceof fairygui.GButton ))&& (ii.obj).selected
					|| ii.obj==null && ii.selected){
					var j=i;
					if (this._loop){
						j=i % this._numItems;
						if (ret.indexOf(j)!=-1)
							continue ;
					}
					ret.push(j);
				}
			}
		}
		else{
			var cnt=this._children.length;
			for (i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null && obj.selected)
					ret.push(i);
			}
		}
		return ret;
	}

	__proto.addSelection=function(index,scrollItToView){
		(scrollItToView===void 0)&& (scrollItToView=false);
		if(this._selectionMode==3)
			return;
		this.checkVirtualList();
		if(this._selectionMode==0)
			this.clearSelection();
		if (scrollItToView)
			this.scrollToView(index);
		this._lastSelectedIndex=index;
		var obj=null;
		if (this._virtual){
			var ii=this._virtualItems[index];
			if (ii.obj !=null)
				obj=ii.obj.asButton;
			ii.selected=true;
		}
		else
		obj=this.getChildAt(index).asButton;
		if (obj !=null && !obj.selected){
			obj.selected=true;
			this.updateSelectionController(index);
		}
	}

	__proto.removeSelection=function(index){
		if(this._selectionMode==3)
			return;
		var obj=null;
		if (this._virtual){
			var ii=this._virtualItems[index];
			if (ii.obj !=null)
				obj=ii.obj.asButton;
			ii.selected=false;
		}
		else
		obj=this.getChildAt(index).asButton;
		if (obj !=null)
			obj.selected=false;
	}

	__proto.clearSelection=function(){
		var i=0;
		if (this._virtual){
			for (i=0;i < this._realNumItems;i++){
				var ii=this._virtualItems[i];
				if ((ii.obj instanceof fairygui.GButton ))
					(ii.obj).selected=false;
				ii.selected=false;
			}
		}
		else{
			var cnt=this._children.length;
			for (i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null)
					obj.selected=false;
			}
		}
	}

	__proto.clearSelectionExcept=function(g){
		var i=0;
		if (this._virtual){
			for (i=0;i < this._realNumItems;i++){
				var ii=this._virtualItems[i];
				if (ii.obj !=g){
					if (((ii.obj instanceof fairygui.GButton )))
						(ii.obj).selected=false;
					ii.selected=false;
				}
			}
		}
		else{
			var cnt=this._children.length;
			for (i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null && obj !=g)
					obj.selected=false;
			}
		}
	}

	__proto.selectAll=function(){
		this.checkVirtualList();
		var last=-1;
		var i=0;
		if (this._virtual){
			for (i=0;i < this._realNumItems;i++){
				var ii=this._virtualItems[i];
				if (((ii.obj instanceof fairygui.GButton ))&& !(ii.obj).selected){
					(ii.obj).selected=true;
					last=i;
				}
				ii.selected=true;
			}
		}
		else{
			var cnt=this._children.length;
			for (i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null && !obj.selected){
					obj.selected=true;
					last=i;
				}
			}
		}
		if(last!=-1)
			this.updateSelectionController(last);
	}

	__proto.selectNone=function(){
		this.clearSelection();
	}

	__proto.selectReverse=function(){
		this.checkVirtualList();
		var last=-1;
		var i=0;
		if (this._virtual){
			for (i=0;i < this._realNumItems;i++){
				var ii=this._virtualItems[i];
				if ((ii.obj instanceof fairygui.GButton )){
					(ii.obj).selected=!(ii.obj).selected;
					if ((ii.obj).selected)
						last=i;
				}
				ii.selected=!ii.selected;
			}
		}
		else{
			var cnt=this._children.length;
			for (i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null){
					obj.selected=!obj.selected;
					if (obj.selected)
						last=i;
				}
			}
		}
		if(last!=-1)
			this.updateSelectionController(last);
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
				else if (this._layout==2 || this._layout==4){
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
				if (this._layout==1 || this._layout==2 || this._layout==4){
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
				else if (this._layout==2 || this._layout==4){
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
				if (this._layout==1 || this._layout==2 || this._layout==4){
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
		if (this._scrollPane !=null && this._scrollPane.isDragged)
			return;
		var item=GObject.cast(evt.currentTarget);
		this.setSelectionOnEvent(item,evt);
		if(this._scrollPane && this.scrollItemToViewOnClick)
			this._scrollPane.scrollToView(item,true);
		this.displayObject.event("fui_click_item",[item,Events.createEvent("fui_click_item",this.displayObject,evt)]);
	}

	__proto.setSelectionOnEvent=function(item,evt){
		if (!((item instanceof fairygui.GButton ))|| this._selectionMode==3)
			return;
		var dontChangeLastIndex=false;
		var button=(item);
		var index=this.childIndexToItemIndex(this.getChildIndex(item));
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
						max=Math.min(max,this.numItems-1);
						var i=0;
						if (this._virtual){
							for (i=min;i <=max;i++){
								var ii=this._virtualItems[i];
								if ((ii.obj instanceof fairygui.GButton ))
									(ii.obj).selected=true;
								ii.selected=true;
							}
						}
						else{
							for(i=min;i<=max;i++){
								var obj=this.getChildAt(i).asButton;
								if(obj!=null)
									obj.selected=true;
							}
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
		if(button.selected)
			this.updateSelectionController(index);
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
				if (!this.foldInvisibleItems || obj.visible)
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
		this.setBoundsChangedFlag();
		if (this._virtual)
			this.setVirtualListChangedFlag(true);
	}

	__proto.handleControllerChanged=function(c){
		_super.prototype.handleControllerChanged.call(this,c);
		if (this._selectionController==c)
			this.selectedIndex=c.selectedIndex;
	}

	__proto.updateSelectionController=function(index){
		if (this._selectionController !=null && !this._selectionController.changing
			&& index < this._selectionController.pageCount){
			var c=this._selectionController;
			this._selectionController=null;
			c.selectedIndex=index;
			this._selectionController=c;
		}
	}

	__proto.getSnappingPosition=function(xValue,yValue,resultPoint){
		if (this._virtual){
			if(!resultPoint)
				resultPoint=new Point();
			var saved=NaN;
			var index=0;
			if (this._layout==0 || this._layout==2){
				saved=yValue;
				fairygui.GList.pos_param=yValue;
				index=this.getIndexOnPos1(false);
				yValue=fairygui.GList.pos_param;
				if (index < this._virtualItems.length && saved-yValue > this._virtualItems[index].height / 2 && index < this._realNumItems)
					yValue+=this._virtualItems[index].height+this._lineGap;
			}
			else if (this._layout==1 || this._layout==3){
				saved=xValue;
				fairygui.GList.pos_param=xValue;
				index=this.getIndexOnPos2(false);
				xValue=fairygui.GList.pos_param;
				if (index < this._virtualItems.length && saved-xValue > this._virtualItems[index].width / 2 && index < this._realNumItems)
					xValue+=this._virtualItems[index].width+this._columnGap;
			}
			else{
				saved=xValue;
				fairygui.GList.pos_param=xValue;
				index=this.getIndexOnPos3(false);
				xValue=fairygui.GList.pos_param;
				if (index < this._virtualItems.length && saved-xValue > this._virtualItems[index].width / 2 && index < this._realNumItems)
					xValue+=this._virtualItems[index].width+this._columnGap;
			}
			resultPoint.x=xValue;
			resultPoint.y=yValue;
			return resultPoint;
		}
		else
		return _super.prototype.getSnappingPosition.call(this,xValue,yValue,resultPoint);
	}

	__proto.scrollToView=function(index,ani,setFirst){
		(ani===void 0)&& (ani=false);
		(setFirst===void 0)&& (setFirst=false);
		if (this._virtual){
			if(this._numItems==0)
				return;
			this.checkVirtualList();
			if (index >=this._virtualItems.length)
				throw new Error("Invalid child index: "+index+">"+this._virtualItems.length);
			if(this._loop)
				index=Math.floor(this._firstIndex/this._numItems)*this._numItems+index;
			var rect;
			var ii=this._virtualItems[index];
			var pos=0;
			var i=0;
			if (this._layout==0 || this._layout==2){
				for (i=this._curLineItemCount-1;i < index;i+=this._curLineItemCount)
				pos+=this._virtualItems[i].height+this._lineGap;
				rect=new Rectangle(0,pos,this._itemSize.x,ii.height);
			}
			else if (this._layout==1 || this._layout==3){
				for (i=this._curLineItemCount-1;i < index;i+=this._curLineItemCount)
				pos+=this._virtualItems[i].width+this._columnGap;
				rect=new Rectangle(pos,0,ii.width,this._itemSize.y);
			}
			else{
				var page=index / (this._curLineItemCount *this._curLineItemCount2);
				rect=new Rectangle(page *this.viewWidth+(index % this._curLineItemCount)*(ii.width+this._columnGap),
				(index / this._curLineItemCount)% this._curLineItemCount2 *(ii.height+this._lineGap),
				ii.width,ii.height);
			}
			setFirst=true;
			if (this._scrollPane !=null)
				this._scrollPane.scrollToView(rect,ani,setFirst);
		}
		else{
			var obj=this.getChildAt(index);
			if (this._scrollPane !=null)
				this._scrollPane.scrollToView(obj,ani,setFirst);
			else if (this.parent !=null && this.parent.scrollPane !=null)
			this.parent.scrollPane.scrollToView(obj,ani,setFirst);
		}
	}

	__proto.getFirstChildInView=function(){
		return this.childIndexToItemIndex(_super.prototype.getFirstChildInView.call(this));
	}

	__proto.childIndexToItemIndex=function(index){
		if (!this._virtual)
			return index;
		if (this._layout==4){
			for (var i=this._firstIndex;i < this._realNumItems;i++){
				if (this._virtualItems[i].obj !=null){
					index--;
					if (index < 0)
						return i;
				}
			}
			return index;
		}
		else{
			index+=this._firstIndex;
			if (this._loop && this._numItems > 0)
				index=index % this._numItems;
			return index;
		}
	}

	__proto.itemIndexToChildIndex=function(index){
		if (!this._virtual)
			return index;
		if (this._layout==4){
			return this.getChildIndex(this._virtualItems[index].obj);
		}
		else{
			if (this._loop && this._numItems > 0){
				var j=this._firstIndex % this._numItems;
				if (index >=j)
					index=index-j;
				else
				index=this._numItems-j+index;
			}
			else
			index-=this._firstIndex;
			return index;
		}
	}

	__proto.setVirtual=function(){
		this._setVirtual(false);
	}

	/**
	*Set the list to be virtual list,and has loop behavior.
	*/
	__proto.setVirtualAndLoop=function(){
		this._setVirtual(true);
	}

	__proto._setVirtual=function(loop){
		if(!this._virtual){
			if(this._scrollPane==null)
				throw new Error("Virtual list must be scrollable!");
			if(loop){
				if(this._layout==2 || this._layout==3)
					throw new Error("Loop list is not supported for FlowHorizontal or FlowVertical layout!");
				this._scrollPane.bouncebackEffect=false;
			}
			this._virtual=true;
			this._loop=loop;
			this._virtualItems=[];
			this.removeChildrenToPool();
			if(this._itemSize==null){
				this._itemSize=new Point();
				var obj=this.getFromPool(null);
				if (obj==null){
					throw new Error("Virtual List must have a default list item resource.");
				}
				else{
					this._itemSize.x=obj.width;
					this._itemSize.y=obj.height;
				}
				this.returnToPool(obj);
			}
			if(this._layout==0 || this._layout==2){
				this._scrollPane.scrollStep=this._itemSize.y;
				if(this._loop)
					this._scrollPane._loop=2;
			}
			else{
				this._scrollPane.scrollStep=this._itemSize.x;
				if(this._loop)
					this._scrollPane._loop=1;
			}
			this.on("fui_scroll",this,this.__scrolled);
			this.setVirtualListChangedFlag(true);
		}
	}

	__proto.refreshVirtualList=function(){
		this.setVirtualListChangedFlag(false);
	}

	__proto.checkVirtualList=function(){
		if(this._virtualListChanged!=0){
			this._refreshVirtualList();
			Laya.timer.clear(this,this._refreshVirtualList);
		}
	}

	__proto.setVirtualListChangedFlag=function(layoutChanged){
		(layoutChanged===void 0)&& (layoutChanged=false);
		if(layoutChanged)
			this._virtualListChanged=2;
		else if(this._virtualListChanged==0)
		this._virtualListChanged=1;
		Laya.timer.callLater(this,this._refreshVirtualList);
	}

	__proto._refreshVirtualList=function(){
		var layoutChanged=this._virtualListChanged==2;
		this._virtualListChanged=0;
		this._eventLocked=true;
		if (layoutChanged){
			if (this._layout==0 || this._layout==1)
				this._curLineItemCount=1;
			else if (this._layout==2){
				if (this._columnCount > 0)
					this._curLineItemCount=this._columnCount;
				else{
					this._curLineItemCount=Math.floor((this._scrollPane.viewWidth+this._columnGap)/ (this._itemSize.x+this._columnGap));
					if (this._curLineItemCount <=0)
						this._curLineItemCount=1;
				}
			}
			else if (this._layout==3){
				if (this._lineCount > 0)
					this._curLineItemCount=this._lineCount;
				else{
					this._curLineItemCount=Math.floor((this._scrollPane.viewHeight+this._lineGap)/ (this._itemSize.y+this._lineGap));
					if (this._curLineItemCount <=0)
						this._curLineItemCount=1;
				}
			}
			else{
				if (this._columnCount > 0)
					this._curLineItemCount=this._columnCount;
				else{
					this._curLineItemCount=Math.floor((this._scrollPane.viewWidth+this._columnGap)/ (this._itemSize.x+this._columnGap));
					if (this._curLineItemCount <=0)
						this._curLineItemCount=1;
				}
				if (this._lineCount > 0)
					this._curLineItemCount2=this._lineCount;
				else{
					this._curLineItemCount2=Math.floor((this._scrollPane.viewHeight+this._lineGap)/ (this._itemSize.y+this._lineGap));
					if (this._curLineItemCount2 <=0)
						this._curLineItemCount2=1;
				}
			}
		};
		var ch=0,cw=0;
		if (this._realNumItems > 0){
			var i=0;
			var len=Math.ceil(this._realNumItems / this._curLineItemCount)*this._curLineItemCount;
			var len2=Math.min(this._curLineItemCount,this._realNumItems);
			if (this._layout==0 || this._layout==2){
				for (i=0;i < len;i+=this._curLineItemCount)
				ch+=this._virtualItems[i].height+this._lineGap;
				if (ch > 0)
					ch-=this._lineGap;
				if (this._autoResizeItem)
					cw=this._scrollPane.viewWidth;
				else{
					for (i=0;i < len2;i++)
					cw+=this._virtualItems[i].width+this._columnGap;
					if (cw > 0)
						cw-=this._columnGap;
				}
			}
			else if (this._layout==1 || this._layout==3){
				for (i=0;i < len;i+=this._curLineItemCount)
				cw+=this._virtualItems[i].width+this._columnGap;
				if (cw > 0)
					cw-=this._columnGap;
				if (this._autoResizeItem)
					ch=this._scrollPane.viewHeight;
				else{
					for (i=0;i < len2;i++)
					ch+=this._virtualItems[i].height+this._lineGap;
					if (ch > 0)
						ch-=this._lineGap;
				}
			}
			else{
				var pageCount=Math.ceil(len / (this._curLineItemCount *this._curLineItemCount2));
				cw=pageCount *this.viewWidth;
				ch=this.viewHeight;
			}
		}
		this.handleAlign(cw,ch);
		this._scrollPane.setContentSize(cw,ch);
		this._eventLocked=false;
		this.handleScroll(true);
	}

	__proto.__scrolled=function(evt){
		this.handleScroll(false);
	}

	__proto.getIndexOnPos1=function(forceUpdate){
		if (this._realNumItems < this._curLineItemCount){
			GList.pos_param=0;
			return 0;
		};
		var i=0;
		var pos2=NaN;
		var pos3=NaN;
		if (this.numChildren > 0 && !forceUpdate){
			pos2=this.getChildAt(0).y;
			if (pos2 > GList.pos_param){
				for (i=this._firstIndex-this._curLineItemCount;i >=0;i-=this._curLineItemCount){
					pos2-=(this._virtualItems[i].height+this._lineGap);
					if (pos2 <=GList.pos_param){
						GList.pos_param=pos2;
						return i;
					}
				}
				GList.pos_param=0;
				return 0;
			}
			else{
				for (i=this._firstIndex;i < this._realNumItems;i+=this._curLineItemCount){
					pos3=pos2+this._virtualItems[i].height+this._lineGap;
					if (pos3 > GList.pos_param){
						GList.pos_param=pos2;
						return i;
					}
					pos2=pos3;
				}
				GList.pos_param=pos2;
				return this._realNumItems-this._curLineItemCount;
			}
		}
		else{
			pos2=0;
			for (i=0;i < this._realNumItems;i+=this._curLineItemCount){
				pos3=pos2+this._virtualItems[i].height+this._lineGap;
				if (pos3 > GList.pos_param){
					GList.pos_param=pos2;
					return i;
				}
				pos2=pos3;
			}
			GList.pos_param=pos2;
			return this._realNumItems-this._curLineItemCount;
		}
	}

	__proto.getIndexOnPos2=function(forceUpdate){
		if (this._realNumItems < this._curLineItemCount){
			GList.pos_param=0;
			return 0;
		};
		var i=0;
		var pos2=NaN;
		var pos3=NaN;
		if (this.numChildren > 0 && !forceUpdate){
			pos2=this.getChildAt(0).x;
			if (pos2 > GList.pos_param){
				for (i=this._firstIndex-this._curLineItemCount;i >=0;i-=this._curLineItemCount){
					pos2-=(this._virtualItems[i].width+this._columnGap);
					if (pos2 <=GList.pos_param){
						GList.pos_param=pos2;
						return i;
					}
				}
				GList.pos_param=0;
				return 0;
			}
			else{
				for (i=this._firstIndex;i < this._realNumItems;i+=this._curLineItemCount){
					pos3=pos2+this._virtualItems[i].width+this._columnGap;
					if (pos3 > GList.pos_param){
						GList.pos_param=pos2;
						return i;
					}
					pos2=pos3;
				}
				GList.pos_param=pos2;
				return this._realNumItems-this._curLineItemCount;
			}
		}
		else{
			pos2=0;
			for (i=0;i < this._realNumItems;i+=this._curLineItemCount){
				pos3=pos2+this._virtualItems[i].width+this._columnGap;
				if (pos3 > GList.pos_param){
					GList.pos_param=pos2;
					return i;
				}
				pos2=pos3;
			}
			GList.pos_param=pos2;
			return this._realNumItems-this._curLineItemCount;
		}
	}

	__proto.getIndexOnPos3=function(forceUpdate){
		if (this._realNumItems < this._curLineItemCount){
			GList.pos_param=0;
			return 0;
		};
		var viewWidth=this.viewWidth;
		var page=Math.floor(GList.pos_param / viewWidth);
		var startIndex=page *(this._curLineItemCount *this._curLineItemCount2);
		var pos2=page *viewWidth;
		var i=0;
		var pos3=NaN;
		for (i=0;i < this._curLineItemCount;i++){
			pos3=pos2+this._virtualItems[startIndex+i].width+this._columnGap;
			if (pos3 > GList.pos_param){
				GList.pos_param=pos2;
				return startIndex+i;
			}
			pos2=pos3;
		}
		GList.pos_param=pos2;
		return startIndex+this._curLineItemCount-1;
	}

	__proto.handleScroll=function(forceUpdate){
		if (this._eventLocked)
			return;
		if (this._layout==0 || this._layout==2){
			var enterCounter=0;
			while(this.handleScroll1(forceUpdate)){
				enterCounter++;
				forceUpdate=false;
				if(enterCounter>20){
					console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
					break ;
				}
			}
			this.handleArchOrder1();
		}
		else if (this._layout==1 || this._layout==3){
			enterCounter=0;
			while(this.handleScroll2(forceUpdate)){
				enterCounter++;
				forceUpdate=false;
				if(enterCounter>20){
					console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
					break ;
				}
			}
			this.handleArchOrder2();
		}
		else{
			this.handleScroll3(forceUpdate);
		}
		this._boundsChanged=false;
	}

	__proto.handleScroll1=function(forceUpdate){
		var pos=this._scrollPane.scrollingPosY;
		var max=pos+this._scrollPane.viewHeight;
		var end=max==this._scrollPane.contentHeight;
		fairygui.GList.pos_param=pos;
		var newFirstIndex=this.getIndexOnPos1(forceUpdate);
		pos=fairygui.GList.pos_param;
		if (newFirstIndex==this._firstIndex && !forceUpdate)
			return false;
		var oldFirstIndex=this._firstIndex;
		this._firstIndex=newFirstIndex;
		var curIndex=newFirstIndex;
		var forward=oldFirstIndex > newFirstIndex;
		var childCount=this.numChildren;
		var lastIndex=oldFirstIndex+childCount-1;
		var reuseIndex=forward ? lastIndex :oldFirstIndex;
		var curX=0,curY=pos;
		var needRender=false;
		var deltaSize=0;
		var firstItemDeltaSize=0;
		var url=this.defaultItem;
		var ii,ii2;
		var i=0,j=0;
		var partSize=(this._scrollPane.viewWidth-this._columnGap *(this._curLineItemCount-1))/ this._curLineItemCount;
		this.itemInfoVer++;
		while (curIndex < this._realNumItems && (end || curY < max)){
			ii=this._virtualItems[curIndex];
			if (ii.obj==null || forceUpdate){
				if (this.itemProvider !=null){
					url=this.itemProvider.runWith(curIndex % this._numItems);
					if (url==null)
						url=this._defaultItem;
					url=UIPackage.normalizeURL(url);
				}
				if (ii.obj !=null && ii.obj.resourceURL !=url){
					if ((ii.obj instanceof fairygui.GButton ))
						ii.selected=(ii.obj).selected;
					this.removeChildToPool(ii.obj);
					ii.obj=null;
				}
			}
			if (ii.obj==null){
				if (forward){
					for (j=reuseIndex;j >=oldFirstIndex;j--){
						ii2=this._virtualItems[j];
						if (ii2.obj !=null && ii2.updateFlag !=this.itemInfoVer && ii2.obj.resourceURL==url){
							if ((ii2.obj instanceof fairygui.GButton ))
								ii2.selected=(ii2.obj).selected;
							ii.obj=ii2.obj;
							ii2.obj=null;
							if (j==reuseIndex)
								reuseIndex--;
							break ;
						}
					}
				}
				else{
					for (j=reuseIndex;j <=lastIndex;j++){
						ii2=this._virtualItems[j];
						if (ii2.obj !=null && ii2.updateFlag !=this.itemInfoVer && ii2.obj.resourceURL==url){
							if ((ii2.obj instanceof fairygui.GButton ))
								ii2.selected=(ii2.obj).selected;
							ii.obj=ii2.obj;
							ii2.obj=null;
							if (j==reuseIndex)
								reuseIndex++;
							break ;
						}
					}
				}
				if (ii.obj !=null){
					this.setChildIndex(ii.obj,forward ? curIndex-newFirstIndex :this.numChildren);
				}
				else{
					ii.obj=this._pool.getObject(url);
					if (forward)
						this.addChildAt(ii.obj,curIndex-newFirstIndex);
					else
					this.addChild(ii.obj);
				}
				if ((ii.obj instanceof fairygui.GButton ))
					(ii.obj).selected=ii.selected;
				needRender=true;
			}
			else
			needRender=forceUpdate;
			if (needRender){
				if (this._autoResizeItem && (this._layout==0 || this._columnCount > 0))
					ii.obj.setSize(partSize,ii.obj.height,true);
				this.itemRenderer.runWith([curIndex % this._numItems,ii.obj]);
				if (curIndex % this._curLineItemCount==0){
					deltaSize+=Math.ceil(ii.obj.height)-ii.height;
					if (curIndex==newFirstIndex && oldFirstIndex > newFirstIndex){
						firstItemDeltaSize=Math.ceil(ii.obj.height)-ii.height;
					}
				}
				ii.width=Math.ceil(ii.obj.width);
				ii.height=Math.ceil(ii.obj.height);
			}
			ii.updateFlag=this.itemInfoVer;
			ii.obj.setXY(curX,curY);
			if (curIndex==newFirstIndex)
				max+=ii.height;
			curX+=ii.width+this._columnGap;
			if (curIndex % this._curLineItemCount==this._curLineItemCount-1){
				curX=0;
				curY+=ii.height+this._lineGap;
			}
			curIndex++;
		}
		for (i=0;i < childCount;i++){
			ii=this._virtualItems[oldFirstIndex+i];
			if (ii.updateFlag !=this.itemInfoVer && ii.obj !=null){
				if ((ii.obj instanceof fairygui.GButton ))
					ii.selected=(ii.obj).selected;
				this.removeChildToPool(ii.obj);
				ii.obj=null;
			}
		}
		childCount=this._children.length;
		for (i=0;i < childCount;i++){
			var obj=this._virtualItems[newFirstIndex+i].obj;
			if (this._children[i] !=obj)
				this.setChildIndex(obj,i);
		}
		if (deltaSize !=0 || firstItemDeltaSize !=0)
			this._scrollPane.changeContentSizeOnScrolling(0,deltaSize,0,firstItemDeltaSize);
		if (curIndex > 0 && this.numChildren > 0 && this._container.y < 0 && this.getChildAt(0).y >-this._container.y)
			return true;
		else
		return false;
	}

	__proto.handleScroll2=function(forceUpdate){
		var pos=this._scrollPane.scrollingPosX;
		var max=pos+this._scrollPane.viewWidth;
		var end=pos==this._scrollPane.contentWidth;
		fairygui.GList.pos_param=pos;
		var newFirstIndex=this.getIndexOnPos2(forceUpdate);
		pos=fairygui.GList.pos_param;
		if (newFirstIndex==this._firstIndex && !forceUpdate)
			return false;
		var oldFirstIndex=this._firstIndex;
		this._firstIndex=newFirstIndex;
		var curIndex=newFirstIndex;
		var forward=oldFirstIndex > newFirstIndex;
		var childCount=this.numChildren;
		var lastIndex=oldFirstIndex+childCount-1;
		var reuseIndex=forward ? lastIndex :oldFirstIndex;
		var curX=pos,curY=0;
		var needRender=false;
		var deltaSize=0;
		var firstItemDeltaSize=0;
		var url=this.defaultItem;
		var ii,ii2;
		var i=0,j=0;
		var partSize=(this._scrollPane.viewHeight-this._lineGap *(this._curLineItemCount-1))/ this._curLineItemCount;
		this.itemInfoVer++;
		while (curIndex < this._realNumItems && (end || curX < max)){
			ii=this._virtualItems[curIndex];
			if (ii.obj==null || forceUpdate){
				if (this.itemProvider !=null){
					url=this.itemProvider.runWith(curIndex % this._numItems);
					if (url==null)
						url=this._defaultItem;
					url=UIPackage.normalizeURL(url);
				}
				if (ii.obj !=null && ii.obj.resourceURL !=url){
					if ((ii.obj instanceof fairygui.GButton ))
						ii.selected=(ii.obj).selected;
					this.removeChildToPool(ii.obj);
					ii.obj=null;
				}
			}
			if (ii.obj==null){
				if (forward){
					for (j=reuseIndex;j >=oldFirstIndex;j--){
						ii2=this._virtualItems[j];
						if (ii2.obj !=null && ii2.updateFlag !=this.itemInfoVer && ii2.obj.resourceURL==url){
							if ((ii2.obj instanceof fairygui.GButton ))
								ii2.selected=(ii2.obj).selected;
							ii.obj=ii2.obj;
							ii2.obj=null;
							if (j==reuseIndex)
								reuseIndex--;
							break ;
						}
					}
				}
				else{
					for (j=reuseIndex;j <=lastIndex;j++){
						ii2=this._virtualItems[j];
						if (ii2.obj !=null && ii2.updateFlag !=this.itemInfoVer && ii2.obj.resourceURL==url){
							if ((ii2.obj instanceof fairygui.GButton ))
								ii2.selected=(ii2.obj).selected;
							ii.obj=ii2.obj;
							ii2.obj=null;
							if (j==reuseIndex)
								reuseIndex++;
							break ;
						}
					}
				}
				if (ii.obj !=null){
					this.setChildIndex(ii.obj,forward ? curIndex-newFirstIndex :this.numChildren);
				}
				else{
					ii.obj=this._pool.getObject(url);
					if (forward)
						this.addChildAt(ii.obj,curIndex-newFirstIndex);
					else
					this.addChild(ii.obj);
				}
				if ((ii.obj instanceof fairygui.GButton ))
					(ii.obj).selected=ii.selected;
				needRender=true;
			}
			else
			needRender=forceUpdate;
			if (needRender){
				if (this._autoResizeItem && (this._layout==1 || this._lineCount > 0))
					ii.obj.setSize(ii.obj.width,partSize,true);
				this.itemRenderer.runWith([curIndex % this._numItems,ii.obj]);
				if (curIndex % this._curLineItemCount==0){
					deltaSize+=Math.ceil(ii.obj.width)-ii.width;
					if (curIndex==newFirstIndex && oldFirstIndex > newFirstIndex){
						firstItemDeltaSize=Math.ceil(ii.obj.width)-ii.width;
					}
				}
				ii.width=Math.ceil(ii.obj.width);
				ii.height=Math.ceil(ii.obj.height);
			}
			ii.updateFlag=this.itemInfoVer;
			ii.obj.setXY(curX,curY);
			if (curIndex==newFirstIndex)
				max+=ii.width;
			curY+=ii.height+this._lineGap;
			if (curIndex % this._curLineItemCount==this._curLineItemCount-1){
				curY=0;
				curX+=ii.width+this._columnGap;
			}
			curIndex++;
		}
		for (i=0;i < childCount;i++){
			ii=this._virtualItems[oldFirstIndex+i];
			if (ii.updateFlag !=this.itemInfoVer && ii.obj !=null){
				if ((ii.obj instanceof fairygui.GButton ))
					ii.selected=(ii.obj).selected;
				this.removeChildToPool(ii.obj);
				ii.obj=null;
			}
		}
		childCount=this._children.length;
		for (i=0;i < childCount;i++){
			var obj=this._virtualItems[newFirstIndex+i].obj;
			if (this._children[i] !=obj)
				this.setChildIndex(obj,i);
		}
		if (deltaSize !=0 || firstItemDeltaSize !=0)
			this._scrollPane.changeContentSizeOnScrolling(deltaSize,0,firstItemDeltaSize,0);
		if (curIndex > 0 && this.numChildren > 0 && this._container.x < 0 && this.getChildAt(0).x >-this._container.x)
			return true;
		else
		return false;
	}

	__proto.handleScroll3=function(forceUpdate){
		var pos=this._scrollPane.scrollingPosX;
		fairygui.GList.pos_param=pos;
		var newFirstIndex=this.getIndexOnPos3(forceUpdate);
		pos=fairygui.GList.pos_param;
		if (newFirstIndex==this._firstIndex && !forceUpdate)
			return;
		var oldFirstIndex=this._firstIndex;
		this._firstIndex=newFirstIndex;
		var reuseIndex=oldFirstIndex;
		var virtualItemCount=this._virtualItems.length;
		var pageSize=this._curLineItemCount *this._curLineItemCount2;
		var startCol=newFirstIndex % this._curLineItemCount;
		var viewWidth=this.viewWidth;
		var page=Math.floor(newFirstIndex / pageSize);
		var startIndex=page *pageSize;
		var lastIndex=startIndex+pageSize *2;
		var needRender=false;
		var i=0;
		var ii,ii2;
		var col=0;
		var url=this._defaultItem;
		var partWidth=(this._scrollPane.viewWidth-this._columnGap *(this._curLineItemCount-1))/ this._curLineItemCount;
		var partHeight=(this._scrollPane.viewHeight-this._lineGap *(this._curLineItemCount2-1))/ this._curLineItemCount2;
		this.itemInfoVer++;
		for (i=startIndex;i < lastIndex;i++){
			if (i >=this._realNumItems)
				continue ;
			col=i % this._curLineItemCount;
			if (i-startIndex < pageSize){
				if (col < startCol)
					continue ;
			}
			else{
				if (col > startCol)
					continue ;
			}
			ii=this._virtualItems[i];
			ii.updateFlag=this.itemInfoVer;
		};
		var lastObj=null;
		var insertIndex=0;
		for (i=startIndex;i < lastIndex;i++){
			if (i >=this._realNumItems)
				continue ;
			ii=this._virtualItems[i];
			if (ii.updateFlag !=this.itemInfoVer)
				continue ;
			if (ii.obj==null){
				while (reuseIndex < virtualItemCount){
					ii2=this._virtualItems[reuseIndex];
					if (ii2.obj !=null && ii2.updateFlag !=this.itemInfoVer){
						if ((ii2.obj instanceof fairygui.GButton ))
							ii2.selected=(ii2.obj).selected;
						ii.obj=ii2.obj;
						ii2.obj=null;
						break ;
					}
					reuseIndex++;
				}
				if (insertIndex==-1)
					insertIndex=this.getChildIndex(lastObj)+1;
				if (ii.obj==null){
					if (this.itemProvider !=null){
						url=this.itemProvider.runWith(i % this._numItems);
						if (url==null)
							url=this._defaultItem;
						url=UIPackage.normalizeURL(url);
					}
					ii.obj=this._pool.getObject(url);
					this.addChildAt(ii.obj,insertIndex);
				}
				else{
					insertIndex=this.setChildIndexBefore(ii.obj,insertIndex);
				}
				insertIndex++;
				if ((ii.obj instanceof fairygui.GButton ))
					(ii.obj).selected=ii.selected;
				needRender=true;
			}
			else{
				needRender=forceUpdate;
				insertIndex=-1;
				lastObj=ii.obj;
			}
			if (needRender){
				if (this._autoResizeItem){
					if (this._curLineItemCount==this._columnCount && this._curLineItemCount2==this._lineCount)
						ii.obj.setSize(partWidth,partHeight,true);
					else if (this._curLineItemCount==this._columnCount)
					ii.obj.setSize(partWidth,ii.obj.height,true);
					else if (this._curLineItemCount2==this._lineCount)
					ii.obj.setSize(ii.obj.width,partHeight,true);
				}
				this.itemRenderer.runWith([i % this._numItems,ii.obj]);
				ii.width=Math.ceil(ii.obj.width);
				ii.height=Math.ceil(ii.obj.height);
			}
		};
		var borderX=(startIndex / pageSize)*viewWidth;
		var xx=borderX;
		var yy=0;
		var lineHeight=0;
		for (i=startIndex;i < lastIndex;i++){
			if (i >=this._realNumItems)
				continue ;
			ii=this._virtualItems[i];
			if (ii.updateFlag==this.itemInfoVer)
				ii.obj.setXY(xx,yy);
			if (ii.height > lineHeight)
				lineHeight=ii.height;
			if (i % this._curLineItemCount==this._curLineItemCount-1){
				xx=borderX;
				yy+=lineHeight+this._lineGap;
				lineHeight=0;
				if (i==startIndex+pageSize-1){
					borderX+=viewWidth;
					xx=borderX;
					yy=0;
				}
			}
			else
			xx+=ii.width+this._columnGap;
		}
		for (i=reuseIndex;i < virtualItemCount;i++){
			ii=this._virtualItems[i];
			if (ii.updateFlag !=this.itemInfoVer && ii.obj !=null){
				if ((ii.obj instanceof fairygui.GButton ))
					ii.selected=(ii.obj).selected;
				this.removeChildToPool(ii.obj);
				ii.obj=null;
			}
		}
	}

	__proto.handleArchOrder1=function(){
		if (this.childrenRenderOrder==2){
			var mid=this._scrollPane.posY+this.viewHeight / 2;
			var minDist=Number.POSITIVE_INFINITY;
			var dist=0;
			var apexIndex=0;
			var cnt=this.numChildren;
			for (var i=0;i < cnt;i++){
				var obj=this.getChildAt(i);
				if (!this.foldInvisibleItems || obj.visible){
					dist=Math.abs(mid-obj.y-obj.height / 2);
					if (dist < minDist){
						minDist=dist;
						apexIndex=i;
					}
				}
			}
			this.apexIndex=apexIndex;
		}
	}

	__proto.handleArchOrder2=function(){
		if (this.childrenRenderOrder==2){
			var mid=this._scrollPane.posX+this.viewWidth / 2;
			var minDist=Number.POSITIVE_INFINITY;
			var dist=0;
			var apexIndex=0;
			var cnt=this.numChildren;
			for (var i=0;i < cnt;i++){
				var obj=this.getChildAt(i);
				if (!this.foldInvisibleItems || obj.visible){
					dist=Math.abs(mid-obj.x-obj.width / 2);
					if (dist < minDist){
						minDist=dist;
						apexIndex=i;
					}
				}
			}
			this.apexIndex=apexIndex;
		}
	}

	__proto.handleAlign=function(contentWidth,contentHeight){
		var newOffsetX=0;
		var newOffsetY=0;
		if (contentHeight < this.viewHeight){
			if (this._verticalAlign=="middle")
				newOffsetY=Math.floor((this.viewHeight-contentHeight)/ 2);
			else if (this._verticalAlign=="bottom")
			newOffsetY=this.viewHeight-contentHeight;
		}
		if (contentWidth < this.viewWidth){
			if (this._align=="center")
				newOffsetX=Math.floor((this.viewWidth-contentWidth)/ 2);
			else if (this._align=="right")
			newOffsetX=this.viewWidth-contentWidth;
		}
		if (newOffsetX!=this._alignOffset.x || newOffsetY!=this._alignOffset.y){
			this._alignOffset.setTo(newOffsetX,newOffsetY);
			if (this._scrollPane !=null)
				this._scrollPane.adjustMaskContainer();
			else
			this._container.pos(this._margin.left+this._alignOffset.x,this._margin.top+this._alignOffset.y);
		}
	}

	__proto.updateBounds=function(){
		if(this._virtual)
			return;
		var i=0;
		var child;
		var curX=0;
		var curY=0;
		var maxWidth=0;
		var maxHeight=0;
		var cw=0,ch=0;
		var j=0;
		var page=0;
		var k=0;
		var cnt=this._children.length;
		var viewWidth=this.viewWidth;
		var viewHeight=this.viewHeight;
		var lineSize=0;
		var lineStart=0;
		var ratio=NaN;
		if(this._layout==0){
			for(i=0;i<cnt;i++){
				child=this.getChildAt(i);
				if (this.foldInvisibleItems && !child.visible)
					continue ;
				if (curY !=0)
					curY+=this._lineGap;
				child.y=curY;
				if (this._autoResizeItem)
					child.setSize(viewWidth,child.height,true);
				curY+=Math.ceil(child.height);
				if(child.width>maxWidth)
					maxWidth=child.width;
			}
			cw=Math.ceil(maxWidth);
			ch=curY;
		}
		else if(this._layout==1){
			for(i=0;i<cnt;i++){
				child=this.getChildAt(i);
				if (this.foldInvisibleItems && !child.visible)
					continue ;
				if(curX!=0)
					curX+=this._columnGap;
				child.x=curX;
				if (this._autoResizeItem)
					child.setSize(child.width,viewHeight,true);
				curX+=Math.ceil(child.width);
				if(child.height>maxHeight)
					maxHeight=child.height;
			}
			cw=curX;
			ch=Math.ceil(maxHeight);
		}
		else if(this._layout==2){
			if (this._autoResizeItem && this._columnCount > 0){
				for (i=0;i < cnt;i++){
					child=this.getChildAt(i);
					if (this.foldInvisibleItems && !child.visible)
						continue ;
					lineSize+=child.sourceWidth;
					j++;
					if (j==this._columnCount || i==cnt-1){
						ratio=(viewWidth-lineSize-(j-1)*this._columnGap)/ lineSize;
						curX=0;
						for (j=lineStart;j <=i;j++){
							child=this.getChildAt(j);
							if (this.foldInvisibleItems && !child.visible)
								continue ;
							child.setXY(curX,curY);
							if (j < i){
								child.setSize(child.sourceWidth+Math.round(child.sourceWidth *ratio),child.height,true);
								curX+=Math.ceil(child.width)+this._columnGap;
							}
							else{
								child.setSize(viewWidth-curX,child.height,true);
							}
							if (child.height > maxHeight)
								maxHeight=child.height;
						}
						curY+=Math.ceil(maxHeight)+this._lineGap;
						maxHeight=0;
						j=0;
						lineStart=i+1;
						lineSize=0;
					}
				}
				ch=curY+Math.ceil(maxHeight);
				cw=viewWidth;
			}
			else{
				for(i=0;i<cnt;i++){
					child=this.getChildAt(i);
					if (this.foldInvisibleItems && !child.visible)
						continue ;
					if(curX!=0)
						curX+=this._columnGap;
					if (this._columnCount !=0 && j >=this._columnCount
						|| this._columnCount==0 && curX+child.width > viewWidth && maxHeight !=0){
						curX=0;
						curY+=Math.ceil(maxHeight)+this._lineGap;
						maxHeight=0;
						j=0;
					}
					child.setXY(curX,curY);
					curX+=Math.ceil(child.width);
					if (curX > maxWidth)
						maxWidth=curX;
					if (child.height > maxHeight)
						maxHeight=child.height;
					j++;
				}
				ch=curY+Math.ceil(maxHeight);
				cw=Math.ceil(maxWidth);
			}
		}
		else if (this._layout==3){
			if (this._autoResizeItem && this._lineCount > 0){
				for (i=0;i < cnt;i++){
					child=this.getChildAt(i);
					if (this.foldInvisibleItems && !child.visible)
						continue ;
					lineSize+=child.sourceHeight;
					j++;
					if (j==this._lineCount || i==cnt-1){
						ratio=(viewHeight-lineSize-(j-1)*this._lineGap)/ lineSize;
						curY=0;
						for (j=lineStart;j <=i;j++){
							child=this.getChildAt(j);
							if (this.foldInvisibleItems && !child.visible)
								continue ;
							child.setXY(curX,curY);
							if (j < i){
								child.setSize(child.width,child.sourceHeight+Math.round(child.sourceHeight *ratio),true);
								curY+=Math.ceil(child.height)+this._lineGap;
							}
							else{
								child.setSize(child.width,viewHeight-curY,true);
							}
							if (child.width > maxWidth)
								maxWidth=child.width;
						}
						curX+=Math.ceil(maxWidth)+this._columnGap;
						maxWidth=0;
						j=0;
						lineStart=i+1;
						lineSize=0;
					}
				}
				cw=curX+Math.ceil(maxWidth);
				ch=viewHeight;
			}
			else{
				for(i=0;i<cnt;i++){
					child=this.getChildAt(i);
					if (this.foldInvisibleItems && !child.visible)
						continue ;
					if(curY!=0)
						curY+=this._lineGap;
					if (this._lineCount !=0 && j >=this._lineCount
						|| this._lineCount==0 && curY+child.height > viewHeight && maxWidth !=0){
						curY=0;
						curX+=Math.ceil(maxWidth)+this._columnGap;
						maxWidth=0;
						j=0;
					}
					child.setXY(curX,curY);
					curY+=Math.ceil(child.height);
					if (curY > maxHeight)
						maxHeight=curY;
					if (child.width > maxWidth)
						maxWidth=child.width;
					j++;
				}
				cw=curX+Math.ceil(maxWidth);
				ch=Math.ceil(maxHeight);
			}
		}
		else{
			var eachHeight=0;
			if(this._autoResizeItem && this._lineCount>0)
				eachHeight=Math.floor((viewHeight-(this._lineCount-1)*this._lineGap)/this._lineCount);
			if (this._autoResizeItem && this._columnCount > 0){
				for (i=0;i < cnt;i++){
					child=this.getChildAt(i);
					if (this.foldInvisibleItems && !child.visible)
						continue ;
					if (j==0 && (this._lineCount !=0 && k >=this._lineCount
						|| this._lineCount==0 && curY+child.height > viewHeight)){
						page++;
						curY=0;
						k=0;
					}
					lineSize+=child.sourceWidth;
					j++;
					if (j==this._columnCount || i==cnt-1){
						ratio=(viewWidth-lineSize-(j-1)*this._columnGap)/ lineSize;
						curX=0;
						for (j=lineStart;j <=i;j++){
							child=this.getChildAt(j);
							if (this.foldInvisibleItems && !child.visible)
								continue ;
							child.setXY(page *viewWidth+curX,curY);
							if (j < i){
								child.setSize(child.sourceWidth+Math.round(child.sourceWidth *ratio),
								this._lineCount>0?eachHeight:child.height,true);
								curX+=Math.ceil(child.width)+this._columnGap;
							}
							else{
								child.setSize(viewWidth-curX,this._lineCount>0?eachHeight:child.height,true);
							}
							if (child.height > maxHeight)
								maxHeight=child.height;
						}
						curY+=Math.ceil(maxHeight)+this._lineGap;
						maxHeight=0;
						j=0;
						lineStart=i+1;
						lineSize=0;
						k++;
					}
				}
			}
			else{
				for (i=0;i < cnt;i++){
					child=this.getChildAt(i);
					if (this.foldInvisibleItems && !child.visible)
						continue ;
					if (curX !=0)
						curX+=this._columnGap;
					if (this._autoResizeItem && this._lineCount > 0)
						child.setSize(child.width,eachHeight,true);
					if (this._columnCount !=0 && j >=this._columnCount
						|| this._columnCount==0 && curX+child.width > viewWidth && maxHeight !=0){
						curX=0;
						curY+=Math.ceil(maxHeight)+this._lineGap;
						maxHeight=0;
						j=0;
						k++;
						if (this._lineCount !=0 && k >=this._lineCount
							|| this._lineCount==0 && curY+child.height > viewHeight && maxWidth !=0){
							page++;
							curY=0;
							k=0;
						}
					}
					child.setXY(page *viewWidth+curX,curY);
					curX+=Math.ceil(child.width);
					if (curX > maxWidth)
						maxWidth=curX;
					if (child.height > maxHeight)
						maxHeight=child.height;
					j++;
				}
			}
			ch=page > 0 ? viewHeight :curY+Math.ceil(maxHeight);
			cw=(page+1)*viewWidth;
		}
		this.handleAlign(cw,ch);
		this.setBounds(0,0,cw,ch);
	}

	__proto.setup_beforeAdd=function(buffer,beginPos){
		fairygui.GObject.prototype.setup_beforeAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,5);
		var i=0;
		var j=0;
		var cnt=0;
		var i1=0;
		var i2=0;
		var nextPos=0;
		var str;
		this._layout=buffer.readByte();
		this._selectionMode=buffer.readByte();
		i1=buffer.readByte();
		this._align=i1==0?"left":(i1==1?"center":"right");
		i1=buffer.readByte();
		this._verticalAlign=i1==0?"top":(i1==1?"middle":"bottom");
		this._lineGap=buffer.getInt16();
		this._columnGap=buffer.getInt16();
		this._lineCount=buffer.getInt16();
		this._columnCount=buffer.getInt16();
		this._autoResizeItem=buffer.readBool();
		this._childrenRenderOrder=buffer.readByte();
		this._apexIndex=buffer.getInt16();
		if (buffer.readBool()){
			this._margin.top=buffer.getInt32();
			this._margin.bottom=buffer.getInt32();
			this._margin.left=buffer.getInt32();
			this._margin.right=buffer.getInt32();
		};
		var overflow=buffer.readByte();
		if (overflow==2){
			var savedPos=buffer.pos;
			buffer.seek(beginPos,7);
			this.setupScroll(buffer);
			buffer.pos=savedPos;
		}
		else
		this.setupOverflow(overflow);
		if (buffer.readBool())
			buffer.skip(8);
		buffer.seek(beginPos,8);
		this._defaultItem=buffer.readS();
		var itemCount=buffer.getInt16();
		for (i=0;i < itemCount;i++){
			nextPos=buffer.getInt16();
			nextPos+=buffer.pos;
			str=buffer.readS();
			if (str==null){
				str=this.defaultItem;
				if (!str){
					buffer.pos=nextPos;
					continue ;
				}
			};
			var obj=this.getFromPool(str);
			if (obj !=null){
				this.addChild(obj);
				str=buffer.readS();
				if (str !=null)
					obj.text=str;
				str=buffer.readS();
				if (str !=null && ((obj instanceof fairygui.GButton )))
					(obj).selectedTitle=str;
				str=buffer.readS();
				if (str !=null)
					obj.icon=str;
				str=buffer.readS();
				if (str !=null && ((obj instanceof fairygui.GButton )))
					(obj).selectedIcon=str;
				str=buffer.readS();
				if (str !=null)
					obj.name=str;
				if ((obj instanceof fairygui.GComponent )){
					cnt=buffer.getInt16();
					for (j=0;j < cnt;j++){
						var cc=(obj).getController(buffer.readS());
						str=buffer.readS();
						if (cc !=null)
							cc.selectedPageId=str;
					}
				}
			}
			buffer.pos=nextPos;
		}
	}

	__proto.setup_afterAdd=function(buffer,beginPos){
		_super.prototype.setup_afterAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,6);
		var i=buffer.getInt16();
		if (i !=-1)
			this._selectionController=this.parent.getControllerAt(i);
	}

	/**
	*@see ListLayoutType
	*/
	/**
	*@see ListLayoutType
	*/
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

	__getset(0,__proto,'align',function(){
		return this._align;
		},function(value){
		if(this._align!=value){
			this._align=value;
			this.setBoundsChangedFlag();
			if (this._virtual)
				this.setVirtualListChangedFlag(true);
		}
	});

	__getset(0,__proto,'lineCount',function(){
		return this._lineCount;
		},function(value){
		if (this._lineCount !=value){
			this._lineCount=value;
			if (this._layout==3 || this._layout==4){
				this.setBoundsChangedFlag();
				if (this._virtual)
					this.setVirtualListChangedFlag(true);
			}
		}
	});

	__getset(0,__proto,'columnCount',function(){
		return this._columnCount;
		},function(value){
		if (this._columnCount !=value){
			this._columnCount=value;
			if (this._layout==2 || this._layout==4){
				this.setBoundsChangedFlag();
				if (this._virtual)
					this.setVirtualListChangedFlag(true);
			}
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

	__getset(0,__proto,'columnGap',function(){
		return this._columnGap;
		},function(value){
		if(this._columnGap !=value){
			this._columnGap=value;
			this.setBoundsChangedFlag();
			if (this._virtual)
				this.setVirtualListChangedFlag(true);
		}
	});

	__getset(0,__proto,'verticalAlign',function(){
		return this._verticalAlign;
		},function(value){
		if(this._verticalAlign!=value){
			this._verticalAlign=value;
			this.setBoundsChangedFlag();
			if (this._virtual)
				this.setVirtualListChangedFlag(true);
		}
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

	__getset(0,__proto,'defaultItem',function(){
		return this._defaultItem;
		},function(val){
		this._defaultItem=val;
	});

	__getset(0,__proto,'autoResizeItem',function(){
		return this._autoResizeItem;
		},function(value){
		if(this._autoResizeItem !=value){
			this._autoResizeItem=value;
			this.setBoundsChangedFlag();
			if (this._virtual)
				this.setVirtualListChangedFlag(true);
		}
	});

	/**
	*@see ListSelectionMode
	*/
	/**
	*@see ListSelectionMode
	*/
	__getset(0,__proto,'selectionMode',function(){
		return this._selectionMode;
		},function(value){
		this._selectionMode=value;
	});

	__getset(0,__proto,'selectionController',function(){
		return this._selectionController;
		},function(value){
		this._selectionController=value;
	});

	__getset(0,__proto,'itemPool',function(){
		return this._pool;
	});

	__getset(0,__proto,'selectedIndex',function(){
		var i=0;
		if (this._virtual){
			for (i=0;i < this._realNumItems;i++){
				var ii=this._virtualItems[i];
				if (((ii.obj instanceof fairygui.GButton ))&& (ii.obj).selected
					|| ii.obj==null && ii.selected){
					if (this._loop)
						return i % this._numItems;
					else
					return i;
				}
			}
		}
		else{
			var cnt=this._children.length;
			for (i=0;i < cnt;i++){
				var obj=this._children[i].asButton;
				if (obj !=null && obj.selected)
					return i;
			}
		}
		return-1;
		},function(value){
		if (value >=0 && value < this.numItems){
			if(this._selectionMode!=0)
				this.clearSelection();
			this.addSelection(value);
		}
		else
		this.clearSelection();
	});

	/**
	*Set the list item count.
	*If the list is not virtual,specified Number of items will be created.
	*If the list is virtual,only items in view will be created.
	*/
	__getset(0,__proto,'numItems',function(){
		if(this._virtual)
			return this._numItems;
		else
		return this._children.length;
		},function(value){
		var i=0;
		if (this._virtual){
			if (this.itemRenderer==null)
				throw new Error("Set itemRenderer first!");
			this._numItems=value;
			if (this._loop)
				this._realNumItems=this._numItems *6;
			else
			this._realNumItems=this._numItems;
			var oldCount=this._virtualItems.length;
			if (this._realNumItems > oldCount){
				for (i=oldCount;i < this._realNumItems;i++){
					var ii=new ItemInfo();
					ii.width=this._itemSize.x;
					ii.height=this._itemSize.y;
					this._virtualItems.push(ii);
				}
			}
			else{
				for (i=this._realNumItems;i < oldCount;i++)
				this._virtualItems[i].selected=false;
			}
			if (this._virtualListChanged !=0)
				Laya.timer.clear(this,this._refreshVirtualList);
			this._refreshVirtualList();
		}
		else{
			var cnt=this._children.length;
			if (value > cnt){
				for (i=cnt;i < value;i++){
					if (this.itemProvider==null)
						this.addItemFromPool();
					else
					this.addItemFromPool(this.itemProvider.runWith(i));
				}
			}
			else{
				this.removeChildrenToPool(value,cnt);
			}
			if (this.itemRenderer !=null){
				for (i=0;i < value;i++)
				this.itemRenderer.runWith([i,this.getChildAt(i)]);
			}
		}
	});

	GList.pos_param=NaN;
	GList.__init$=function(){
		//class ItemInfo
		ItemInfo=(function(){
			function ItemInfo(){
				this.width=0;
				this.height=0;
				this.obj=null;
				this.updateFlag=0;
				this.selected=false;
			}
			__class(ItemInfo,'');
			return ItemInfo;
		})()
	}

	return GList;
})(GComponent)


//class fairygui.GRichTextField extends fairygui.GTextField
var GRichTextField=(function(_super){
	function GRichTextField(){
		this.div=null;
		this._ubbEnabled=false;
		this._color=null;
		GRichTextField.__super.call(this);
		this._text="";
	}

	__class(GRichTextField,'fairygui.GRichTextField',_super);
	var __proto=GRichTextField.prototype;
	__proto.createDisplayObject=function(){
		this._displayObject=this.div=new HTMLDivElement();
		this._displayObject.mouseEnabled=true;
		this._displayObject["$owner"]=this;
	}

	__proto.handleSizeChanged=function(){
		this.div.size(this.width,this.height);
	}

	__getset(0,__proto,'bold',function(){
		return this.div.style.bold;
		},function(value){
		this.div.style.bold=value;
	});

	__getset(0,__proto,'align',function(){
		return this.div.style.align;
		},function(value){
		this.div.style.align=value;
	});

	__getset(0,__proto,'text',function(){
		return this._text;
		},function(value){
		this._text=value;
		var text2=this._text;
		if (this._templateVars !=null)
			text2=this.parseTemplate(text2);
		if(this._ubbEnabled)
			this.div.innerHTML=ToolSet.parseUBB(text2);
		else
		this.div.innerHTML=text2;
	});

	__getset(0,__proto,'color',function(){
		return this._color;
		},function(value){
		if (this._color !=value){
			this._color=value;
			this.div.style.color=value;
			if (this._gearColor.controller)
				this._gearColor.updateState();
		}
	});

	__getset(0,__proto,'font',function(){
		return this.div.style.font;
		},function(value){
		if(value)
			this.div.style.font=value;
		else
		this.div.style.font=UIConfig$1.defaultFont;
	});

	__getset(0,__proto,'leading',function(){
		return this.div.style.leading;
		},function(value){
		this.div.style.leading=value;
	});

	__getset(0,__proto,'fontSize',function(){
		return this.div.style.fontSize;
		},function(value){
		this.div.style.fontSize=value;
	});

	__getset(0,__proto,'valign',function(){
		return this.div.style.valign;
		},function(value){
		this.div.style.valign=value;
	});

	__getset(0,__proto,'italic',function(){
		return this.div.style.italic;
		},function(value){
		this.div.style.italic=value;
	});

	__getset(0,__proto,'stroke',function(){
		return this.div.style.stroke;
		},function(value){
		this.div.style.stroke=value;
	});

	__getset(0,__proto,'strokeColor',function(){
		return this.div.style.strokeColor;
		},function(value){
		this.div.style.strokeColor=value;
		this.updateGear(4);
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
		this._tweening=false;
		GProgressBar.__super.call(this);
		this._titleType=0;
		this._value=50;
		this._max=100;
	}

	__class(GProgressBar,'fairygui.GProgressBar',_super);
	var __proto=GProgressBar.prototype;
	__proto.tweenValue=function(value,duration){
		var _$this=this;
		if(this._value !=value){
			if(this._tweening){
				GTween.kill(this,false,this.update);
				this._tweening=false;
			};
			var oldValule=this._value;
			this._value=value;
			this._tweening=true;
			return GTween.to(oldValule,this._value,duration).setTarget(this,this.update).setEase(0)
			.onComplete(function(){_$this._tweening=false;},this);
		}
		else
		return null;
	}

	__proto.update=function(newValue){
		var percent=this._max!=0?Math.min(newValue / this._max,1):0;
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
			if(this._barObjectH){
				if (((this._barObjectH instanceof fairygui.GImage ))&& (this._barObjectH).fillMethod !=0)
					(this._barObjectH).fillAmount=percent;
				else
				this._barObjectH.width=Math.round(fullWidth *percent);
			}
			if(this._barObjectV){
				if (((this._barObjectV instanceof fairygui.GImage ))&& (this._barObjectV).fillMethod !=0)
					(this._barObjectV).fillAmount=percent;
				else
				this._barObjectV.height=Math.round(fullHeight *percent);
			}
		}
		else {
			if(this._barObjectH){
				if (((this._barObjectH instanceof fairygui.GImage ))&& (this._barObjectH).fillMethod !=0)
					(this._barObjectH).fillAmount=1-percent;
				else{
					this._barObjectH.width=Math.round(fullWidth *percent);
					this._barObjectH.x=this._barStartX+(fullWidth-this._barObjectH.width);
				}
			}
			if(this._barObjectV){
				if (((this._barObjectV instanceof fairygui.GImage ))&& (this._barObjectV).fillMethod !=0)
					(this._barObjectV).fillAmount=1-percent;
				else{
					this._barObjectV.height=Math.round(fullHeight *percent);
					this._barObjectV.y=this._barStartY+(fullHeight-this._barObjectV.height);
				}
			}
		}
		if((this._aniObject instanceof fairygui.GMovieClip ))
			(this._aniObject).frame=Math.round(percent *100);
	}

	__proto.constructExtension=function(buffer){
		buffer.seek(0,6);
		this._titleType=buffer.readByte();
		this._reverse=buffer.readBool();
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

	__proto.setup_afterAdd=function(buffer,beginPos){
		_super.prototype.setup_afterAdd.call(this,buffer,beginPos);
		if (!buffer.seek(beginPos,6)){
			this.update(this._value);
			return;
		}
		if (buffer.readByte()!=this.packageItem.objectType){
			this.update(this._value);
			return;
		}
		this._value=buffer.getInt32();
		this._max=buffer.getInt32();
		this.update(this._value);
	}

	__proto.dispose=function(){
		if(this._tweening)
			GTween.kill(this);
		_super.prototype.dispose.call(this);
	}

	__getset(0,__proto,'max',function(){
		return this._max;
		},function(value){
		if(this._max !=value){
			this._max=value;
			this.update(this._value);
		}
	});

	/**
	*@see ProgressTitleType
	*/
	/**
	*@see ProgressTitleType
	*/
	__getset(0,__proto,'titleType',function(){
		return this._titleType;
		},function(value){
		if(this._titleType !=value){
			this._titleType=value;
			this.update(this._value);
		}
	});

	__getset(0,__proto,'value',function(){
		return this._value;
		},function(value){
		if(this._tweening){
			GTween.kill(this,true,this.update);
			this._tweening=false;
		}
		if(this._value !=value){
			this._value=value;
			this.update(this._value);
		}
	});

	return GProgressBar;
})(GComponent)


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
		this._checkPopups=false;
		GRoot.__super.call(this);
		if(fairygui.GRoot._inst==null)
			fairygui.GRoot._inst=this;
		this.opaque=false;
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
		if(UIConfig$1.globalModalWaiting !=null){
			if(this._modalWaitPane==null)
				this._modalWaitPane=UIPackage.createObjectFromURL(UIConfig$1.globalModalWaiting);
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
		if (target !=null){
			var p=target;
			while (p !=null){
				if (p.parent==this){
					if (popup.sortingOrder < p.sortingOrder){
						popup.sortingOrder=p.sortingOrder;
					}
					break ;
				}
				p=p.parent;
			}
		}
		this.addChild(popup);
		this.adjustModalLayer();
		var pos;
		var sizeW=0,sizeH=0;
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
			var resourceURL=UIConfig$1.tooltipsWin;
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

	__proto.playOneShotSound=function(url,volumeScale){
		(volumeScale===void 0)&& (volumeScale=1);
		if(ToolSet.startsWith(url,"ui://"))
			return;
		SoundManager.playSound(url);
	}

	__proto.adjustModalLayer=function(){
		var cnt=this.numChildren;
		if (this._modalWaitPane !=null && this._modalWaitPane.parent !=null)
			this.setChildIndex(this._modalWaitPane,cnt-1);
		for(var i=cnt-1;i >=0;i--){
			var g=this.getChildAt(i);
			if(((g instanceof fairygui.Window ))&& (g).modal){
				if(this._modalLayer.parent==null)
					this.addChildAt(this._modalLayer,i);
				else
				this.setChildIndexBefore(this._modalLayer,i);
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
		this._modalLayer.drawRect(0,null,UIConfig$1.modalLayerColor);
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

	__getset(0,__proto,'focus',function(){
		if (this._focusedObject && !this._focusedObject.onStage)
			this._focusedObject=null;
		return this._focusedObject;
		},function(value){
		if (value && (!value.focusable || !value.onStage))
			throw "invalid focus target";
		this.setFocus(value);
	});

	__getset(0,__proto,'hasAnyPopup',function(){
		return this._popupStack.length !=0;
	});

	__getset(0,__proto,'modalLayer',function(){
		return this._modalLayer;
	});

	__getset(0,__proto,'hasModalWindow',function(){
		return this._modalLayer.parent !=null;
	});

	__getset(0,__proto,'modalWaiting',function(){
		return this._modalWaitPane && this._modalWaitPane.inContainer;
	});

	__getset(0,__proto,'volumeScale',function(){
		return SoundManager.soundVolume;
		},function(value){
		SoundManager.soundVolume=value;
	});

	__getset(1,GRoot,'inst',function(){
		if(fairygui.GRoot._inst==null)
			new GRoot();
		return fairygui.GRoot._inst;
	},fairygui.GComponent._$SET_inst);

	GRoot._inst=null;
	return GRoot;
})(GComponent)


//class fairygui.GTextInput extends fairygui.GTextField
var GTextInput=(function(_super){
	function GTextInput(){
		this.input=null;
		GTextInput.__super.call(this);
	}

	__class(GTextInput,'fairygui.GTextInput',_super);
	var __proto=GTextInput.prototype;
	__proto.createDisplayObject=function(){
		this._displayObject=this.input=new Input();
		this._displayObject.mouseEnabled=true;
		this._displayObject["$owner"]=this;
	}

	__proto.handleSizeChanged=function(){
		this.input.size(this.width,this.height);
	}

	__proto.setup_beforeAdd=function(buffer,beginPos){
		_super.prototype.setup_beforeAdd.call(this,buffer,beginPos);
		buffer.seek(beginPos,4);
		var str=buffer.readS();
		if (str !=null)
			this.promptText=str;
		str=buffer.readS();
		if (str !=null)
			this.input.restrict=str;
		var iv=buffer.getInt32();
		if (iv !=0)
			this.input.maxChars=iv;
		iv=buffer.getInt32();
		if (iv !=0){
			if(iv==4)
				this.keyboardType="number";
			else if(iv==3)
			this.keyboardType="url";
		}
		if (buffer.readBool())
			this.password=true;
	}

	__getset(0,__proto,'bold',function(){
		return this.input.bold;
		},function(value){
		this.input.bold=value;
	});

	__getset(0,__proto,'align',function(){
		return this.input.align;
		},function(value){
		this.input.align=value;
	});

	__getset(0,__proto,'text',function(){
		return this.input.text;
		},function(value){
		this.input.text=value;
	});

	__getset(0,__proto,'password',function(){
		return this.input.type=="password";
		},function(value){
		if (value)
			this.input.type="password";
		else
		this.input.type="text";
	});

	__getset(0,__proto,'color',function(){
		return this.input.color;
		},function(value){
		this.input.color=value;
	});

	__getset(0,__proto,'font',function(){
		return this.input.font;
		},function(value){
		this.input.font=value;
	});

	__getset(0,__proto,'leading',function(){
		return this.input.leading;
		},function(value){
		this.input.leading=value;
	});

	__getset(0,__proto,'maxLength',function(){
		return this.input.maxChars;
		},function(value){
		this.input.maxChars=value;
	});

	__getset(0,__proto,'fontSize',function(){
		return this.input.fontSize;
		},function(value){
		this.input.fontSize=value;
	});

	__getset(0,__proto,'valign',function(){
		return this.input.valign;
		},function(value){
		this.input.valign=value;
	});

	__getset(0,__proto,'italic',function(){
		return this.input.italic;
		},function(value){
		this.input.italic=value;
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

	__getset(0,__proto,'strokeColor',function(){
		return this.input.strokeColor;
		},function(value){
		this.input.strokeColor=value;
		this.updateGear(4);
	});

	__getset(0,__proto,'keyboardType',function(){
		return this.input.type;
		},function(value){
		this.input.type=value;
	});

	__getset(0,__proto,'editable',function(){
		return this.input.editable;
		},function(value){
		this.input.editable=value;
	});

	__getset(0,__proto,'promptText',function(){
		return this.input.prompt;
		},function(value){
		this.input.prompt=value;
	});

	__getset(0,__proto,'restrict',function(){
		return this.input.restrict;
		},function(value){
		this.input.restrict=value;
	});

	__getset(0,__proto,'textWidth',function(){
		return this.input.textWidth;
	});

	return GTextInput;
})(GTextField)


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

	__proto.constructExtension=function(buffer){
		buffer.seek(0,6);
		this._fixedGripSize=buffer.readBool();
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
		this._reverse=false;
		this._titleObject=null;
		this._barObjectH=null;
		this._barObjectV=null;
		this._barMaxWidth=0;
		this._barMaxHeight=0;
		this._barMaxWidthDelta=0;
		this._barMaxHeightDelta=0;
		this._gripObject=null;
		this._clickPos=null;
		this._clickPercent=0;
		this._barStartX=0;
		this._barStartY=0;
		this.changeOnClick=true;
		/**是否可拖动开关**/
		this.canDrag=true;
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
		};
		var fullWidth=this.width-this._barMaxWidthDelta;
		var fullHeight=this.height-this._barMaxHeightDelta;
		if(!this._reverse){
			if(this._barObjectH)
				this._barObjectH.width=Math.round(fullWidth*percent);
			if(this._barObjectV)
				this._barObjectV.height=Math.round(fullHeight*percent);
		}
		else{
			if(this._barObjectH){
				this._barObjectH.width=Math.round(fullWidth*percent);
				this._barObjectH.x=this._barStartX+(fullWidth-this._barObjectH.width);
			}
			if(this._barObjectV){
				this._barObjectV.height=Math.round(fullHeight*percent);
				this._barObjectV.y=this._barStartY+(fullHeight-this._barObjectV.height);
			}
		}
	}

	__proto.constructExtension=function(buffer){
		buffer.seek(0,6);
		this._titleType=buffer.readByte();
		this._reverse=buffer.readBool();
		this._titleObject=(this.getChild("title"));
		this._barObjectH=this.getChild("bar");
		this._barObjectV=this.getChild("bar_v");
		this._gripObject=this.getChild("grip");
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
		if(this._gripObject){
			this._gripObject.on("mousedown",this,this.__gripMouseDown);
		}
		this.displayObject.on("mousedown",this,this.__barMouseDown);
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

	__proto.setup_afterAdd=function(buffer,beginPos){
		_super.prototype.setup_afterAdd.call(this,buffer,beginPos);
		if (!buffer.seek(beginPos,6)){
			this.update();
			return;
		}
		if (buffer.readByte()!=this.packageItem.objectType){
			this.update();
			return;
		}
		this._value=buffer.getInt32();
		this._max=buffer.getInt32();
		this.update();
	}

	__proto.__gripMouseDown=function(evt){
		this.canDrag=true;
		evt.stopPropagation();
		this._clickPos=this.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY);
		this._clickPercent=this._value / this._max;
		Laya.stage.on("mousemove",this,this.__gripMouseMove);
		Laya.stage.on("mouseup",this,this.__gripMouseUp);
	}

	__proto.__gripMouseMove=function(evt){
		if(!this.canDrag){
			return;
		};
		var pt=this.globalToLocal(Laya.stage.mouseX,Laya.stage.mouseY,fairygui.GSlider.sSilderHelperPoint);
		var deltaX=pt.x-this._clickPos.x;
		var deltaY=pt.y-this._clickPos.y;
		if(this._reverse){
			deltaX=-deltaX;
			deltaY=-deltaY;
		};
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
		Laya.stage.off("mousemove",this,this.__gripMouseMove);
		Laya.stage.off("mouseup",this,this.__gripMouseUp);
	}

	__proto.__barMouseDown=function(evt){
		if(!this.changeOnClick)
			return;
		var pt=this._gripObject.globalToLocal(evt.stageX,evt.stageY,fairygui.GSlider.sSilderHelperPoint);
		var percent=this._value/this._max;
		var delta=NaN;
		if(this._barObjectH)
			delta=(pt.x-this._gripObject.width/2)/this._barMaxWidth;
		if(this._barObjectV)
			delta=(pt.y-this._gripObject.height/2)/this._barMaxHeight;
		if(this._reverse)
			percent-=delta;
		else
		percent+=delta;
		if(percent>1)
			percent=1;
		else if(percent<0)
		percent=0;
		var newValue=Math.round(this._max*percent);
		if(newValue!=this._value){
			this._value=newValue;
			Events.dispatch("fui_state_changed",this.displayObject,evt);
		}
		this.updateWidthPercent(percent);
	}

	__getset(0,__proto,'max',function(){
		return this._max;
		},function(value){
		if (this._max !=value){
			this._max=value;
			this.update();
		}
	});

	/**
	*@see ProgressTitleType
	*/
	/**
	*@see ProgressTitleType
	*/
	__getset(0,__proto,'titleType',function(){
		return this._titleType;
		},function(value){
		this._titleType=value;
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
var Window$2=(function(_super){
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
		this.bringToFontOnClick=UIConfig$1.bringWindowToFrontOnClick;
		this.displayObject.on("display",this,this.__onShown);
		this.displayObject.on("undisplay",this,this.__onHidden);
		this.displayObject.on("mousedown",this,this.__mouseDown);
	}

	__class(Window,'fairygui.Window',_super,'Window$2');
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
		if(UIConfig$1.windowModalWaiting){
			if(!this._modalWaitPane)
				this._modalWaitPane=UIPackage.createObjectFromURL(UIConfig$1.windowModalWaiting);
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

	__getset(0,__proto,'isShowing',function(){
		return this.parent !=null;
	});

	__getset(0,__proto,'isTop',function(){
		return this.parent !=null && this.parent.getChildIndex(this)==this.parent.numChildren-1;
	});

	__getset(0,__proto,'modal',function(){
		return this._modal;
		},function(val){
		this._modal=val;
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

	__getset(0,__proto,'contentArea',function(){
		return this._contentArea;
		},function(value){
		this._contentArea=value;
	});

	__getset(0,__proto,'modalWaiting',function(){
		return this._modalWaitPane && this._modalWaitPane.parent !=null;
	});

	return Window;
})(GComponent)


//class fairygui.display.Image extends laya.display.Sprite
var Image$1=(function(_super){
	function Image(){
		this._tex=null;
		this._scaleByTile=false;
		this._scale9Grid=null;
		this._tileGridIndice=0;
		this._textureScaleX=1;
		this._textureScaleY=1;
		this._needRebuild=0;
		this._fillMethod=0;
		this._fillOrigin=0;
		this._fillAmount=0;
		this._fillClockwise=false;
		this._mask=null;
		Image.__super.call(this);
		this.mouseEnabled=false;
	}

	__class(Image,'fairygui.display.Image',_super,'Image$1');
	var __proto=Image.prototype;
	__proto.scaleTexture=function(sx,sy){
		if(this._textureScaleX!=sx || this._textureScaleY!=sy){
			this._textureScaleX=sx;
			this._textureScaleY=sy;
			if(this._tex)
				this.size(this._tex.width*sx,this._tex.height*sy);
			this.markChanged(1);
		}
	}

	__proto.markChanged=function(flag){
		if(!this._needRebuild){
			this._needRebuild=flag;
			Laya.timer.callLater(this,this.rebuild);
		}
		else
		this._needRebuild |=flag;
	}

	__proto.rebuild=function(){
		if((this._needRebuild & 1)!=0)
			this.doDraw();
		if((this._needRebuild & 2)!=0 && this._fillMethod!=0)
			this.doFill();
		this._needRebuild=0;
	}

	__proto.doDraw=function(){
		var w=this.width;
		var h=this.height;
		var g=this.graphics;
		g.clear();
		if(this._tex==null || w==0 || h==0){
			return;
		}
		if(this._scaleByTile){
			g.fillTexture(this._tex,0,0,w,h);
		}
		else if(this._scale9Grid!=null){
			var tw=this._tex.width;
			var th=this._tex.height;
			var left=this._scale9Grid.x;
			var right=Math.max(tw-this._scale9Grid.right,0);
			var top=this._scale9Grid.y;
			var bottom=Math.max(th-this._scale9Grid.bottom,0);
			var tmp=NaN;
			if (h >=(th-this._scale9Grid.height)){
				top=this._scale9Grid.y;
				bottom=th-this._scale9Grid.bottom;
			}
			else{
				tmp=this._scale9Grid.y / (th-this._scale9Grid.bottom);
				tmp=h *tmp / (1+tmp);
				top=Math.round(tmp);
				bottom=h-tmp;
			}
			if (w >=(tw-this._scale9Grid.width)){
				left=this._scale9Grid.x;
				right=tw-this._scale9Grid.right;
			}
			else{
				tmp=this._scale9Grid.x / (tw-this._scale9Grid.right);
				tmp=w *tmp / (1+tmp);
				left=Math.round(tmp);
				right=w-tmp;
			};
			var centerWidth=Math.max(w-left-right,0);
			var centerHeight=Math.max(h-top-bottom,0);
			left && top && g.drawImage(fairygui.display.Image.getTexture(this._tex,0,0,left,top),0,0,left,top);
			right && top && g.drawImage(fairygui.display.Image.getTexture(this._tex,tw-right,0,right,top),w-right,0,right,top);
			left && bottom && g.drawImage(fairygui.display.Image.getTexture(this._tex,0,th-bottom,left,bottom),0,h-bottom,left,bottom);
			right && bottom && g.drawImage(fairygui.display.Image.getTexture(this._tex,tw-right,th-bottom,right,bottom),w-right,h-bottom,right,bottom);
			centerWidth && top && this.drawTexture(0,fairygui.display.Image.getTexture(this._tex,left,0,tw-left-right,top),left,0,centerWidth,top);
			centerWidth && bottom && this.drawTexture(1,fairygui.display.Image.getTexture(this._tex,left,th-bottom,tw-left-right,bottom),left,h-bottom,centerWidth,bottom);
			centerHeight && left && this.drawTexture(2,fairygui.display.Image.getTexture(this._tex,0,top,left,th-top-bottom),0,top,left,centerHeight);
			centerHeight && right && this.drawTexture(3,fairygui.display.Image.getTexture(this._tex,tw-right,top,right,th-top-bottom),w-right,top,right,centerHeight);
			centerWidth && centerHeight && this.drawTexture(4,fairygui.display.Image.getTexture(this._tex,left,top,tw-left-right,th-top-bottom),left,top,centerWidth,centerHeight);
		}
		else {
			g.drawImage(this._tex,0,0,w,h);
		}
	}

	__proto.drawTexture=function(part,tex,x,y,width,height){
		(width===void 0)&& (width=0);
		(height===void 0)&& (height=0);
		if(part==-1 || (this._tileGridIndice & (1<<part))==0)
			this.graphics.drawImage(tex,x,y,width,height);
		else
		this.graphics.fillTexture(tex,x,y,width,height);
	}

	__proto.doFill=function(){
		var w=this.width;
		var h=this.height;
		var g=this._mask.graphics;
		g.clear();
		if(w==0 || h==0)
			return;
		var points=FillUtils.fill(w,h,this._fillMethod,this._fillOrigin,this._fillClockwise,this._fillAmount);
		if(points==null){
			this.mask=null;
			this.mask=this._mask;
			return;
		}
		g.drawPoly(0,0,points,"#FFFFFF");
	}

	__getset(0,__proto,'fillClockwise',function(){
		return this._fillClockwise;
		},function(value){
		if(this._fillClockwise!=value){
			this._fillClockwise=value;
			if(this._fillMethod!=0)
				this.markChanged(2);
		}
	});

	__getset(0,__proto,'tex',function(){
		return this._tex;
		},function(value){
		if(this._tex!=value){
			this._tex=value;
			if(this._tex)
				this.size(this._tex.width*this._textureScaleX,this._tex.height*this._textureScaleY);
			else
			this.size(0,0);
			this.markChanged(1);
		}
	});

	__getset(0,__proto,'scale9Grid',function(){
		return this._scale9Grid;
		},function(value){
		this._scale9Grid=value;
		this.markChanged(1);
	});

	__getset(0,__proto,'fillAmount',function(){
		return this._fillAmount;
		},function(value){
		if(this._fillAmount!=value){
			this._fillAmount=value;
			if(this._fillMethod!=0)
				this.markChanged(2);
		}
	});

	__getset(0,__proto,'scaleByTile',function(){
		return this._scaleByTile;
		},function(value){
		if(this._scaleByTile!=value){
			this._scaleByTile=value;
			this.markChanged(1);
		}
	});

	__getset(0,__proto,'tileGridIndice',function(){
		return this._tileGridIndice;
		},function(value){
		if(this._tileGridIndice!=value){
			this._tileGridIndice=value;
			this.markChanged(1);
		}
	});

	__getset(0,__proto,'fillMethod',function(){
		return this._fillMethod;
		},function(value){
		if(this._fillMethod!=value){
			this._fillMethod=value;
			if(this._fillMethod!=0){
				if(!this._mask){
					this._mask=new Sprite();
					this._mask.mouseEnabled=false;
				}
				this.mask=this._mask;
				this.markChanged(2);
			}
			else if(this.mask){
				this._mask.graphics.clear();
				this.mask=null;
			}
		}
	});

	__getset(0,__proto,'fillOrigin',function(){
		return this._fillOrigin;
		},function(value){
		if(this._fillOrigin!=value){
			this._fillOrigin=value;
			if(this._fillMethod!=0)
				this.markChanged(2);
		}
	});

	Image.getTexture=function(tex,x,y,width,height){
		if (width <=0)width=1;
		if (height <=0)height=1;
		tex.$_GID || (tex.$_GID=Utils.getGID())
		var texture;
		if (!texture||!texture._getSource()){
			texture=Texture.createFromTexture(tex,x,y,width,height);
		}
		return texture;
	}

	return Image;
})(Sprite)


//class fairygui.display.MovieClip extends laya.display.Sprite
var MovieClip$1=(function(_super){
	function MovieClip(){
		this.interval=0;
		this.swing=false;
		this.repeatDelay=0;
		this.timeScale=1;
		this._$3__texture=null;
		this._needRebuild=false;
		this._playing=true;
		this._frameCount=0;
		this._frames=null;
		this._frame=0;
		this._boundsRect=null;
		this._start=0;
		this._end=0;
		this._times=0;
		this._endAt=0;
		this._status=0;
		//0-none,1-next loop,2-ending,3-ended
		this._endHandler=null;
		this._frameElapsed=0;
		//当前帧延迟
		this._reversed=false;
		this._repeatedCount=0;
		MovieClip.__super.call(this);
		this.mouseEnabled=false;
		this.setPlaySettings();
		this.on("display",this,this.__addToStage);
		this.on("undisplay",this,this.__removeFromStage);
	}

	__class(MovieClip,'fairygui.display.MovieClip',_super,'MovieClip$1');
	var __proto=MovieClip.prototype;
	//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
	__proto.rewind=function(){
		this._frame=0;
		this._frameElapsed=0;
		this._reversed=false;
		this._repeatedCount=0;
		this.drawFrame();
	}

	__proto.syncStatus=function(anotherMc){
		this._frame=anotherMc._frame;
		this._frameElapsed=anotherMc._frameElapsed;
		this._reversed=anotherMc._reversed;
		this._repeatedCount=anotherMc._repeatedCount;
		this.drawFrame();
	}

	__proto.advance=function(timeInMiniseconds){
		var beginFrame=this._frame;
		var beginReversed=this._reversed;
		var backupTime=timeInMiniseconds;
		while (true){
			var tt=this.interval+this._frames[this._frame].addDelay;
			if (this._frame==0 && this._repeatedCount > 0)
				tt+=this.repeatDelay;
			if (timeInMiniseconds < tt){
				this._frameElapsed=0;
				break ;
			}
			timeInMiniseconds-=tt;
			if (this.swing){
				if (this._reversed){
					this._frame--;
					if (this._frame <=0){
						this._frame=0;
						this._repeatedCount++;
						this._reversed=!this._reversed;
					}
				}
				else{
					this._frame++;
					if (this._frame > this._frameCount-1){
						this._frame=Math.max(0,this._frameCount-2);
						this._repeatedCount++;
						this._reversed=!this._reversed;
					}
				}
			}
			else{
				this._frame++;
				if (this._frame > this._frameCount-1){
					this._frame=0;
					this._repeatedCount++;
				}
			}
			if (this._frame==beginFrame && this._reversed==beginReversed){
				var roundTime=backupTime-timeInMiniseconds;
				timeInMiniseconds-=Math.floor(timeInMiniseconds / roundTime)*roundTime;
			}
		}
		this.drawFrame();
	}

	//从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
	__proto.setPlaySettings=function(start,end,times,endAt,endHandler){
		(start===void 0)&& (start=0);
		(end===void 0)&& (end=-1);
		(times===void 0)&& (times=0);
		(endAt===void 0)&& (endAt=-1);
		this._start=start;
		this._end=end;
		if(this._end==-1 || this._end>this._frameCount-1)
			this._end=this._frameCount-1;
		this._times=times;
		this._endAt=endAt;
		if (this._endAt==-1)
			this._endAt=this._end;
		this._status=0;
		this._endHandler=endHandler;
		this.frame=start;
	}

	__proto.update=function(){
		if (!this._playing || this._frameCount==0 || this._status==3)
			return;
		var dt=Laya.timer.delta;
		if(dt>100)
			dt=100;
		if(this.timeScale!=1)
			dt *=this.timeScale;
		this._frameElapsed+=dt;
		var tt=this.interval+this._frames[this._frame].addDelay;
		if (this._frame==0 && this._repeatedCount > 0)
			tt+=this.repeatDelay;
		if (this._frameElapsed < tt)
			return;
		this._frameElapsed-=tt;
		if (this._frameElapsed > this.interval)
			this._frameElapsed=this.interval;
		if (this.swing){
			if (this._reversed){
				this._frame--;
				if (this._frame <=0){
					this._frame=0;
					this._repeatedCount++;
					this._reversed=!this._reversed;
				}
			}
			else{
				this._frame++;
				if (this._frame > this._frameCount-1){
					this._frame=Math.max(0,this._frameCount-2);
					this._repeatedCount++;
					this._reversed=!this._reversed;
				}
			}
		}
		else{
			this._frame++;
			if (this._frame > this._frameCount-1){
				this._frame=0;
				this._repeatedCount++;
			}
		}
		if (this._status==1){
			this._frame=this._start;
			this._frameElapsed=0;
			this._status=0;
		}
		else if (this._status==2){
			this._frame=this._endAt;
			this._frameElapsed=0;
			this._status=3;
			if(this._endHandler!=null){
				var handler=this._endHandler;
				this._endHandler=null;
				handler.run();
			}
		}
		else{
			if (this._frame==this._end){
				if (this._times > 0){
					this._times--;
					if (this._times==0)
						this._status=2;
					else
					this._status=1;
				}
				else if (this._start !=0)
				this._status=1;
			}
		}
		this.drawFrame();
	}

	__proto.drawFrame=function(){
		if (this._frameCount>0 && this._frame < this._frames.length){
			var frame=this._frames[this._frame];
			this.graphics.clear();
			this.graphics.drawImage(frame.texture,frame.rect.x,frame.rect.y);
		}
		else
		this.graphics.clear();
	}

	__proto.checkTimer=function(){
		if (this._playing && this._frameCount>0 && this.stage!=null)
			Laya.timer.frameLoop(1,this,this.update);
		else
		Laya.timer.clear(this,this.update);
	}

	__proto.__addToStage=function(){
		if(this._playing && this._frameCount>0)
			Laya.timer.frameLoop(1,this,this.update);
	}

	__proto.__removeFromStage=function(){
		Laya.timer.clear(this,this.update);
	}

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
		if(this._frame < 0 || this._frame > this._frameCount-1)
			this._frame=this._frameCount-1;
		this.drawFrame();
		this._frameElapsed=0;
		this._repeatedCount=0;
		this._reversed=false;
		this.checkTimer();
	});

	__getset(0,__proto,'playing',function(){
		return this._playing;
		},function(value){
		if(this._playing!=value){
			this._playing=value;
			this.checkTimer();
		}
	});

	__getset(0,__proto,'frameCount',function(){
		return this._frameCount;
	});

	__getset(0,__proto,'frame',function(){
		return this._frame;
		},function(value){
		if (this._frame !=value){
			if(this._frames!=null && value>=this._frameCount)
				value=this._frameCount-1;
			this._frame=value;
			this._frameElapsed=0;
			this.drawFrame();
		}
	});

	__getset(0,__proto,'boundsRect',function(){
		return this._boundsRect;
		},function(value){
		this._boundsRect=value;
	});

	return MovieClip;
})(Sprite)


	Laya.__init([GBasicTextField,GList,AsyncOperation,GearLook,UIPackage,GearColor,Transition,EaseManager,GearAnimation,GearSize,RelationItem]);
})(window,document,Laya);
