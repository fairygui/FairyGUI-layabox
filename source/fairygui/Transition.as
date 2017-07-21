package fairygui {
	import fairygui.utils.ColorMatrix;
	import fairygui.utils.ToolSet;
	
	import laya.filters.ColorFilter;
	import laya.utils.Handler;
	import laya.utils.Tween;
	
	public class Transition {
		public var name: String;
		public var autoPlayRepeat: Number = 1;
		public var autoPlayDelay: Number = 0;
		
		private var _owner: GComponent;
		private var _ownerBaseX: Number = 0;
		private var _ownerBaseY: Number = 0;
		private var _items: Vector.<TransitionItem>;
		private var _totalTimes: Number = 0;
		private var _totalTasks: Number = 0;
		private var _playing: Boolean = false;
		private var _onComplete: Handler;
		private var _options: Number = 0;
		private var _reversed: Boolean;
		private var _maxTime: Number = 0;
		private var  _autoPlay:Boolean;
		
		public const OPTION_IGNORE_DISPLAY_CONTROLLER: Number = 1;
		public const OPTION_AUTO_STOP_DISABLED:int = 2;
		public const OPTION_AUTO_STOP_AT_END:int = 4;
		
		private const FRAME_RATE: Number = 24;
		
		public function Transition(owner: GComponent) {
			this._owner = owner;
			this._items = new Vector.<TransitionItem>();
		}
		
		public function get autoPlay():Boolean
		{
			return _autoPlay;
		}
		
		public function set autoPlay(value:Boolean):void
		{
			if (_autoPlay != value)
			{
				_autoPlay = value;
				if (_autoPlay)
				{
					if (_owner.onStage)
						play(null, autoPlayRepeat, autoPlayDelay);
				}
				else
				{
					if (!_owner.onStage)
						stop(false, true);
				}
			}
		}
		
		public function play(onComplete: Handler = null, times: Number = 1,delay: Number = 0):void {
			this._play(onComplete,times,delay,false);
		}
		
		public function playReverse(onComplete: Handler = null, times: Number = 1,delay: Number = 0):void {
			this._play(onComplete,times,delay,true);
		}
		
		public function changeRepeat(value:int):void
		{
			_totalTimes = value;
		}
		
		private function _play(onComplete: Handler = null, times: Number = 1,delay: Number = 0,reversed:Boolean=false):void {
			this.stop();

			this._totalTimes = times;
			this._reversed = reversed;
			this.internalPlay(delay);
			this._playing = this._totalTasks > 0;
			if(this._playing) {
				this._onComplete = onComplete;
				if((this._options & this.OPTION_IGNORE_DISPLAY_CONTROLLER) != 0) {
					var cnt: Number = this._items.length;
					for(var i: Number = 0;i < cnt;i++) {
						var item: TransitionItem = this._items[i];
						if(item.target != null && item.target != this._owner)
							item.displayLockToken = item.target.addDisplayLock();
					}
				}
			}
			else if(onComplete != null) {
				onComplete.run();
			}
		}
		
		public function stop(setToComplete: Boolean = true,processCallback: Boolean = false):void {
			if(this._playing) {
				this._playing = false;
				this._totalTasks = 0;
				this._totalTimes = 0;
				var handler: Handler = this._onComplete;
				this._onComplete = null;
				
				var cnt: Number = this._items.length;
				var i:Number;
				var item:TransitionItem;
				if(this._reversed) {
					for(i = cnt-1;i>=0;i--) {
						item = this._items[i];
						if(item.target == null)
							continue;
						
						this.stopItem(item,setToComplete);
					}
				}
				else {
					for(i = 0;i < cnt;i++) {
						item = this._items[i];
						if(item.target == null)
							continue;
						
						this.stopItem(item,setToComplete);
					}
				}
				
				if(processCallback && handler != null) {
					handler.run();
				}
			}
		}
		
		private function stopItem(item:TransitionItem, setToComplete:Boolean):void {
			if (item.displayLockToken!=0)
			{
				item.target.releaseDisplayLock(item.displayLockToken);
				item.displayLockToken = 0;
			}
			
			if (item.type == TransitionActionType.ColorFilter && item.filterCreated)
				item.target.filters = null;
			
			if(item.completed)
				return;
			
			if(item.tweener != null) {
				item.tweener.clear();
				item.tweener = null;
			}
			
			if(item.type == TransitionActionType.Transition) {
				var trans: Transition = GComponent(item.target).getTransition(item.value.s);
				if(trans != null)
					trans.stop(setToComplete,false);
			}
			else if(item.type == TransitionActionType.Shake) {
				Laya.timer.clear(item, item.__shake);
				item.target._gearLocked = true;
				item.target.setXY(item.target.x - item.startValue.f1,item.target.y - item.startValue.f2);
				item.target._gearLocked = false;
			}
			else {
				if(setToComplete) {
					if(item.tween) {
						if(!item.yoyo || item.repeat % 2 == 0)
							this.applyValue(item,this._reversed?item.startValue:item.endValue);
						else
							this.applyValue(item,this._reversed?item.endValue:item.startValue);
					}
					else if(item.type != TransitionActionType.Sound)
						this.applyValue(item,item.value);
				}
			}
		}
		
		public function dispose():void
		{
			if (!_playing)
				return;
			
			_playing = false;
			var cnt:int = _items.length;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.target == null || item.completed)
					continue;
				
				if (item.tweener != null)
				{
					item.tweener.clear();
					item.tweener = null;
				}
				
				if (item.type == TransitionActionType.Transition)
				{
					var trans:Transition = GComponent(item.target).getTransition(item.value.s);
					if (trans != null)
						trans.dispose();
				}
				else if (item.type == TransitionActionType.Shake)
				{
					Laya.timer.clear(item, item.__shake);
				}
			}
		}
		
		public function get playing(): Boolean {
			return this._playing;
		}
		
		public function setValue(label: String,...args):void {
			var cnt: Number = this._items.length;
			var value: TransitionValue;
			for(var i: Number = 0;i < cnt;i++) {
				var item: TransitionItem = this._items[i];
				if(item.label == null && item.label2 == null)
					continue;
				if(item.label == label) {
					if(item.tween)
						value = item.startValue;
					else
						value = item.value;
				}
				else if(item.label2 == label) {
					value = item.endValue;
				}
				else
					continue;
				switch(item.type) {
					case TransitionActionType.XY:
					case TransitionActionType.Size:
					case TransitionActionType.Pivot:
					case TransitionActionType.Scale:
					case TransitionActionType.Skew:
						value.b1 = true;
						value.b2 = true;
						value.f1 = parseFloat(args[0]);
						value.f2 = parseFloat(args[1]);
						break;
					case TransitionActionType.Alpha:
						value.f1 = parseFloat(args[0]);
						break;
					case TransitionActionType.Rotation:
						value.i = parseInt(args[0]);
						break;
					case TransitionActionType.Color:
						value.s = args[0];
						break;
					case TransitionActionType.Animation:
						value.i = parseInt(args[0]);
						if(args.length > 1)
							value.b = args[1];
						break;
					case TransitionActionType.Visible:
						value.b = args[0];
						break;
					case TransitionActionType.Sound:
						value.s = args[0];
						if(args.length > 1)
							value.f1 = parseFloat(args[1]);
						break;
					case TransitionActionType.Transition:
						value.s = args[0];
						if(args.length > 1)
							value.i = parseInt(args[1]);
						break;
					case TransitionActionType.Shake:
						value.f1 = parseFloat(args[0]);
						if(args.length > 1)
							value.f2 = parseFloat(args[1]);
						break;
					case TransitionActionType.ColorFilter:
						value.f1 = parseFloat(args[0]);
						value.f2 = parseFloat(args[1]);
						value.f3 = parseFloat(args[2]);
						value.f4 = parseFloat(args[3]);
						break;
				}
			}
		}
		
		public function setHook(label: String, callback:Handler):void {
			var cnt: Number = this._items.length;
			for(var i: Number = 0;i < cnt;i++) {
				var item: TransitionItem = this._items[i];
				if(item.label == label)
				{
					item.hook = callback;
					break;
				}
				else if(item.label2 == label)
				{
					item.hook2 = callback;
					break;
				}
			}
		}
		
		public function clearHooks():void {
			var cnt: Number = this._items.length;
			for(var i: Number = 0;i < cnt;i++) {
				var item: TransitionItem = this._items[i];
				item.hook = null;
				item.hook2 = null;
			}
		}
		
		public function setTarget(label:String, newTarget:GObject):void
		{
			var cnt:int = _items.length;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.label == label)
					item.targetId = newTarget.id;
			}
		}
		
		public function setDuration(label:String, value:Number):void
		{
			var cnt:int = _items.length;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.tween && item.label == label)
					item.duration = value;
			}
		}
		
		public function updateFromRelations(targetId: String,dx: Number,dy: Number):void {
			var cnt: Number = this._items.length;
			if(cnt == 0)
				return;
			for(var i: Number = 0;i < cnt;i++) {
				var item: TransitionItem = this._items[i];
				if(item.type == TransitionActionType.XY && item.targetId == targetId) {
					if(item.tween) {
						item.startValue.f1 += dx;
						item.startValue.f2 += dy;
						item.endValue.f1 += dx;
						item.endValue.f2 += dy;
					}
					else {
						item.value.f1 += dx;
						item.value.f2 += dy;
					}
				}
			}
		}
		
		internal function OnOwnerRemovedFromStage():void
		{
			if ((_options & OPTION_AUTO_STOP_DISABLED) == 0)
				stop((_options & OPTION_AUTO_STOP_AT_END) != 0 ? true : false, false);
		}
		
		private function internalPlay(delay: Number=0):void {
			this._ownerBaseX = this._owner.x;
			this._ownerBaseY = this._owner.y;
			
			this._totalTasks = 0;
			var cnt: Number = this._items.length;
			var startTime: Number;
			var item:TransitionItem;
			
			for(var i: Number = 0;i < cnt;i++) {
				item = this._items[i];
				if(item.targetId)
					item.target = this._owner.getChildById(item.targetId);
				else
					item.target = this._owner;
				if(item.target == null)
					continue;                    
				
				if(item.tween) {
					if(this._reversed)
						startTime = delay + this._maxTime - item.time - item.duration;
					else
						startTime = delay + item.time;
					if(startTime>0)
					{
						_totalTasks++;
						item.completed = false;
						item.tweener = Tween.to(item.value, {}, startTime*1000, null, Handler.create(this, this.__delayCall,[item]));
						item.tweener.update = null;
					}
					else
						this.startTween(item);
				}
				else {
					if(this._reversed)
						startTime = delay + this._maxTime - item.time;
					else
						startTime = delay + item.time;
					if(startTime == 0)
						this.applyValue(item,item.value);
					else {
						item.completed = false;
						this._totalTasks++;
						item.tweener = Tween.to(item.value, {}, startTime*1000, null, Handler.create(this, this.__delayCall2,[item]));
						item.tweener.update = null;
					}
				}
			}
		}
		
		private function prepareValue(item: TransitionItem,toProps:Object,reversed: Boolean = false):void {
			var startValue:TransitionValue;
			var endValue:TransitionValue;
			if(reversed)
			{
				startValue = item.endValue;
				endValue = item.startValue;
			}
			else
			{
				startValue = item.startValue;
				endValue = item.endValue;
			}
			
			switch(item.type) {
				case TransitionActionType.XY:
				case TransitionActionType.Size:
					if(item.type==TransitionActionType.XY)
					{
						if (item.target == _owner)
						{
							if(!startValue.b1)
								startValue.f1 = 0;
							if(!startValue.b2)
								startValue.f2 = 0;
						}
						else
						{
							if(!startValue.b1)
								startValue.f1 = item.target.x;
							if(!startValue.b2)
								startValue.f2 = item.target.y;
						}
					}
					else
					{
						if(!startValue.b1)
							startValue.f1 = item.target.width;
						if(!startValue.b2)
							startValue.f2 = item.target.height;
					}
					item.value.f1 = startValue.f1;
					item.value.f2 = startValue.f2;
					
					if(!endValue.b1)
						endValue.f1 = item.value.f1;
					if(!endValue.b2)
						endValue.f2 = item.value.f2;
					
					item.value.b1 = startValue.b1 || endValue.b1;
					item.value.b2 = startValue.b2 || endValue.b2;
					
					toProps.f1 = endValue.f1;
					toProps.f2 = endValue.f2;
					break;
				
				case TransitionActionType.Scale:
				case TransitionActionType.Skew:
					item.value.f1 = startValue.f1;
					item.value.f2 = startValue.f2;
					toProps.f1 = endValue.f1;
					toProps.f2 = endValue.f2;
					break;
				
				case TransitionActionType.Alpha:
					item.value.f1 = startValue.f1;
					toProps.f1 = endValue.f1;
					break;
				
				case TransitionActionType.Rotation:
					item.value.i = startValue.i;
					toProps.i = endValue.i;
					break;
				
				case TransitionActionType.ColorFilter:
					item.value.f1 = startValue.f1;
					item.value.f2 = startValue.f2;
					item.value.f3 = startValue.f3;
					item.value.f4 = startValue.f4;
					toProps.f1 = endValue.f1;
					toProps.f2 = endValue.f2;
					toProps.f3 = endValue.f3;
					toProps.f4 = endValue.f4;
					break;
			}
			
			toProps.dummy = 0;
		}
		
		private function startTween(item: TransitionItem):void {
			var toProps: Object = {};
			
			this.prepareValue(item,toProps,this._reversed);
			this.applyValue(item,item.value);
			
			var completeHandler:Handler;
			if(item.repeat!=0) {
				item.tweenTimes = 0;
				completeHandler = Handler.create(this, this.__tweenRepeatComplete, [item]);
			}
			else
				completeHandler = Handler.create(this, this.__tweenComplete, [item]);
			
			_totalTasks++;
			item.completed = false;
			
			item.tweener = Tween.to(item.value, 
				toProps,
				item.duration*1000, 
				item.easeType,
				completeHandler);
			item.tweener.update = Handler.create(this, this.__tweenUpdate, [item], false);
			
			if(item.hook != null)
				item.hook.run();
		}
		
		private function __delayCall(item: TransitionItem):void {
			item.tweener = null;
			_totalTasks--;
			
			this.startTween(item);
		}
		
		private function __delayCall2(item: TransitionItem):void {
			item.tweener = null;
			this._totalTasks--;
			item.completed = true;
			
			this.applyValue(item,item.value);
			if(item.hook != null)
				item.hook.run();
			this.checkAllComplete();
		}
		
		private function __tweenUpdate(item: TransitionItem):void {
			this.applyValue(item,item.value);
		}
		
		private function __tweenComplete(item: TransitionItem):void {
			item.tweener = null;
			this._totalTasks--;
			item.completed = true;
			
			if(item.hook2 != null)
				item.hook2.run();
			this.checkAllComplete();
		}
		
		private function __tweenRepeatComplete(item: TransitionItem):void {
			item.tweenTimes++;
			if(item.repeat==-1 || item.tweenTimes < item.repeat + 1) {
				var toProps:Object = {};
				
				var reversed: Boolean;
				if(item.yoyo) {
					if(this._reversed)
						reversed = item.tweenTimes % 2 == 0;
					else
						reversed = item.tweenTimes % 2 == 1;
				}
				else
					reversed = this._reversed;
				this.prepareValue(item,toProps,reversed);
				item.tweener = Tween.to(item.value,
					toProps, 
					item.duration * 1000,
					item.easeType,
					Handler.create(this, this.__tweenRepeatComplete, [item]));
				item.tweener.update = Handler.create(this, this.__tweenUpdate, [item], false);
			}
			else
				this.__tweenComplete(item);
		}
		
		private function __playTransComplete(item: TransitionItem):void {
			this._totalTasks--;
			item.completed = true;
			
			this.checkAllComplete();
		}
		
		private function checkAllComplete():void {
			if(this._playing && this._totalTasks == 0) {
				if(this._totalTimes < 0) {
					//不立刻调用的原因是egret.Tween在onComplete之后，还会调用onChange
					Laya.timer.callLater(this, this.internalPlay);
				}
				else {
					this._totalTimes--;
					if(this._totalTimes > 0)
						Laya.timer.callLater(this, this.internalPlay);
					else {
						this._playing = false;
						
						var cnt: Number = this._items.length;
						for (var i:int = 0; i < cnt; i++)
						{
							var item:TransitionItem = _items[i];
							if (item.target != null)
							{
								if (item.displayLockToken!=0)
								{
									item.target.releaseDisplayLock(item.displayLockToken);
									item.displayLockToken = 0;
								}
								
								if (item.filterCreated)
								{
									item.filterCreated = false;
									item.target.filters = null;
								}
							}
						}
						
						if(this._onComplete != null) {
							var handler: Handler = this._onComplete;
							this._onComplete = null;
							handler.run();
						}
					}
				}
			}
		}
		
		private function applyValue(item: TransitionItem,value: TransitionValue):void {
			item.target._gearLocked = true;
			switch(item.type) {
				case TransitionActionType.XY:
					if(item.target == this._owner) {
						var f1: Number = 0,f2: Number = 0;
						if(!value.b1)
							f1 = item.target.x;
						else
							f1 = value.f1 + this._ownerBaseX;
						if(!value.b2)
							f2 = item.target.y;
						else
							f2 = value.f2 + this._ownerBaseY;
						item.target.setXY(f1,f2);
					}
					else {
						if(!value.b1)
							value.f1 = item.target.x;
						if(!value.b2)
							value.f2 = item.target.y;
						item.target.setXY(value.f1,value.f2);
					}
					break;
				case TransitionActionType.Size:
					if(!value.b1)
						value.f1 = item.target.width;
					if(!value.b2)
						value.f2 = item.target.height;
					item.target.setSize(value.f1,value.f2);
					break;
				case TransitionActionType.Pivot:
					item.target.setPivot(value.f1,value.f2);
					break;
				case TransitionActionType.Alpha:
					item.target.alpha = value.f1;
					break;
				case TransitionActionType.Rotation:
					item.target.rotation = value.i;
					break;
				case TransitionActionType.Scale:
					item.target.setScale(value.f1,value.f2);
					break;
				case TransitionActionType.Skew:
					item.target.setSkew(value.f1, value.f2);
					break;
				case TransitionActionType.Color:
					IColorGear(item.target).color = value.s;
					break;
				case TransitionActionType.Animation:
					if(!value.b1)
						value.i = IAnimationGear(item.target).frame;
					IAnimationGear(item.target).frame = value.i;
					IAnimationGear(item.target).playing = value.b;
					break;
				case TransitionActionType.Visible:
					item.target.visible = value.b;
					break;
				case TransitionActionType.Transition:
					var trans: fairygui.Transition = GComponent(item.target).getTransition(value.s);
					if(trans != null) {
						if(value.i == 0)
							trans.stop(false,true);
						else if(trans.playing)
							trans._totalTimes = value.i;
						else {
							item.completed = false;
							this._totalTasks++;
							if(this._reversed)
								trans.playReverse(Handler.create(this, this.__playTransComplete,[item]), item.value.i);
							else
								trans.play(Handler.create(this, this.__playTransComplete, [item]), item.value.i);
						}
					}
					break;
				case TransitionActionType.Sound:
					var pi: PackageItem = UIPackage.getItemByURL(value.s);
					if(pi)
						GRoot.inst.playOneShotSound(pi.owner.getItemAssetURL(pi));
					else
						GRoot.inst.playOneShotSound(value.s);
					break;
				case TransitionActionType.Shake:
					item.startValue.f1 = 0;//offsetX
					item.startValue.f2 = 0;//offsetY
					item.startValue.f3 = item.value.f2;//shakePeriod
					item.startValue.i = Laya.timer.currTimer;//startTime
					Laya.timer.frameLoop(1, item, item.__shake, [this]);
					this._totalTasks++;
					item.completed = false;
					break;				
				case TransitionActionType.ColorFilter:
					var arr:Array = item.target.filters;
					if(!arr || !(arr[0] is ColorFilter))
						item.filterCreated = true;
					
					var cm:ColorMatrix = new ColorMatrix();
					cm.adjustBrightness(value.f1);
					cm.adjustContrast(value.f2);
					cm.adjustSaturation(value.f3);
					cm.adjustHue(value.f4);
					arr = [new ColorFilter(cm)];
					item.target.filters = arr;
					break;
			}
			item.target._gearLocked = false;
		}
		
		public function __shakeItem(item:TransitionItem):void {
			var r: Number = Math.ceil(item.value.f1 * item.startValue.f3 / item.value.f2);
			var rx: Number = (Math.random() * 2 - 1) * r;
			var ry: Number = (Math.random() * 2 - 1) * r;
			rx = rx > 0 ? Math.ceil(rx) : Math.floor(rx);
			ry = ry > 0 ? Math.ceil(ry) : Math.floor(ry);
			item.target._gearLocked = true;
			item.target.setXY(item.target.x - item.startValue.f1 + rx, item.target.y - item.startValue.f2 + ry);
			item.target._gearLocked = false;
			item.startValue.f1 = rx;
			item.startValue.f2 = ry;
			var t: Number = Laya.timer.currTimer;
			item.startValue.f3 -= (t - item.startValue.i) / 1000;
			item.startValue.i = t;
			if(item.startValue.f3 <= 0) {
				item.target._gearLocked= true;
				item.target.setXY(item.target.x - item.startValue.f1,item.target.y - item.startValue.f2);
				item.target._gearLocked = false;
				item.completed = true;
				this._totalTasks--;
				Laya.timer.clear(item, item.__shake);
				this.checkAllComplete();
			}
		}
		
		public function setup(xml: Object):void {
			this.name = xml.getAttribute("name");
			var str: String = xml.getAttribute("options");
			if(str)
				this._options = parseInt(str);
			str = xml.getAttribute("autoPlay");
			if(str)
				this._autoPlay = str=="true";
			if(this._autoPlay) {
				str = xml.getAttribute("autoPlayRepeat");
				if(str)
					this.autoPlayRepeat = parseInt(str);
				str = xml.getAttribute("autoPlayDelay");
				if(str)
					this.autoPlayDelay = parseFloat(str);
			}
			
			var col: Array = xml.childNodes;
			var length1: Number = col.length;
			for(var i1: Number = 0;i1 < length1;i1++) {
				var cxml: Object = col[i1];
				if(cxml.nodeName!="item")
					continue;
				
				var item: TransitionItem = new TransitionItem();
				this._items.push(item);
				item.time = parseInt(cxml.getAttribute("time")) / this.FRAME_RATE;
				item.targetId = cxml.getAttribute("target");
				str = cxml.getAttribute("type");
				switch(str) {
					case "XY":
						item.type = TransitionActionType.XY;
						break;
					case "Size":
						item.type = TransitionActionType.Size;
						break;
					case "Scale":
						item.type = TransitionActionType.Scale;
						break;
					case "Pivot":
						item.type = TransitionActionType.Pivot;
						break;
					case "Alpha":
						item.type = TransitionActionType.Alpha;
						break;
					case "Rotation":
						item.type = TransitionActionType.Rotation;
						break;
					case "Color":
						item.type = TransitionActionType.Color;
						break;
					case "Animation":
						item.type = TransitionActionType.Animation;
						break;
					case "Visible":
						item.type = TransitionActionType.Visible;
						break;
					case "Sound":
						item.type = TransitionActionType.Sound;
						break;
					case "Transition":
						item.type = TransitionActionType.Transition;
						break;
					case "Shake":
						item.type = TransitionActionType.Shake;
						break;
					case "ColorFilter":
						item.type = TransitionActionType.ColorFilter;
						break;
					case "Skew":
						item.type = TransitionActionType.Skew;
						break;
					default:
						item.type = TransitionActionType.Unknown;
						break;
				}
				item.tween = cxml.getAttribute("tween") == "true";
				item.label = cxml.getAttribute("label");
				if(item.tween) {
					item.duration = parseInt(cxml.getAttribute("duration")) / this.FRAME_RATE;
					if(item.time + item.duration > this._maxTime)
						this._maxTime = item.time + item.duration;
					str = cxml.getAttribute("ease");
					if(str)
						item.easeType = ToolSet.parseEaseType(str);
					str = cxml.getAttribute("repeat");
					if(str)
						item.repeat = parseInt(str);
					item.yoyo = cxml.getAttribute("yoyo") == "true";
					item.label2 = cxml.getAttribute("label2");
					var v: String = cxml.getAttribute("endValue");
					if(v) {
						this.decodeValue(item.type,cxml.getAttribute("startValue"),item.startValue);
						this.decodeValue(item.type,v,item.endValue);
					}
					else {
						item.tween = false;
						this.decodeValue(item.type,cxml.getAttribute("startValue"),item.value);
					}
				}
				else {
					if(item.time > this._maxTime)
						this._maxTime = item.time;
					this.decodeValue(item.type,cxml.getAttribute("value"),item.value);
				}
			}
		}
		
		private function decodeValue(type: Number,str: String,value: TransitionValue):void {
			var arr: Array;
			switch(type) {
				case TransitionActionType.XY:
				case TransitionActionType.Size:
				case TransitionActionType.Pivot:
				case TransitionActionType.Skew:
					arr = str.split(",");
					if(arr[0] == "-") {
						value.b1 = false;
					}
					else {
						value.f1 = parseFloat(arr[0]);
						value.b1 = true;
					}
					if(arr[1] == "-") {
						value.b2 = false;
					}
					else {
						value.f2 = parseFloat(arr[1]);
						value.b2 = true;
					}
					break;
				case TransitionActionType.Alpha:
					value.f1 = parseFloat(str);
					break;
				case TransitionActionType.Rotation:
					value.i = parseInt(str);
					break;
				case TransitionActionType.Scale:
					arr = str.split(",");
					value.f1 = parseFloat(arr[0]);
					value.f2 = parseFloat(arr[1]);
					break;
				case TransitionActionType.Color:
					value.s = str;
					break;
				case TransitionActionType.Animation:
					arr = str.split(",");
					if(arr[0] == "-") {
						value.b1 = false;
					}
					else {
						value.i = parseInt(arr[0]);
						value.b1 = true;
					}
					value.b = arr[1] == "p";
					break;
				case TransitionActionType.Visible:
					value.b = str == "true";
					break;
				case TransitionActionType.Sound:
					arr = str.split(",");
					value.s = arr[0];
					if(arr.length > 1) {
						var intv: Number = parseInt(arr[1]);
						if(intv == 0 || intv == 100)
							value.f1 = 1;
						else
							value.f1 = intv / 100;
					}
					else
						value.f1 = 1;
					break;
				case TransitionActionType.Transition:
					arr = str.split(",");
					value.s = arr[0];
					if(arr.length > 1)
						value.i = parseInt(arr[1]);
					else
						value.i = 1;
					break;
				case TransitionActionType.Shake:
					arr = str.split(",");
					value.f1 = parseFloat(arr[0]);
					value.f2 = parseFloat(arr[1]);
					break;
				
				case TransitionActionType.ColorFilter:
					arr = str.split(",");
					value.f1 = parseFloat(arr[0]);
					value.f2 = parseFloat(arr[1]);
					value.f3 = parseFloat(arr[2]);
					value.f4 = parseFloat(arr[3]);
					break;
			}
		}
		
	}
}           
import fairygui.GObject;

import laya.utils.Ease;
import laya.utils.Handler;
import laya.utils.Tween;

class TransitionActionType  {
	public static const XY: int = 0;
	public static const Size: int = 1;
	public static const Scale: int = 2;
	public static const Pivot: int = 3;
	public static const Alpha: int = 4;
	public static const Rotation: int = 5;
	public static const Color: int = 6;
	public static const Animation: int = 7;
	public static const Visible:int = 8;
	public static const Sound:int=9;
	public static const Transition:int=10;
	public static const Shake:int = 11;
	public static const ColorFilter:int = 12;
	public static const Skew:int = 13;
	public static const Unknown:int = 14;
}

class TransitionItem {
	public var time: Number = 0;
	public var targetId: String;
	public var type: Number = 0;
	public var duration: Number = 0;
	public var value: TransitionValue;
	public var startValue: TransitionValue;
	public var endValue: TransitionValue;
	public var easeType: Function;
	public var repeat: Number = 0;
	public var yoyo: Boolean = false;
	public var tween: Boolean = false;
	public var label: String;
	public var label2: String;
	public var hook: Handler;
	public var hook2: Handler;
	
	public var tweenTimes: Number = 0;
	
	public var tweener: Tween;
	public var completed: Boolean = false;
	public var target: GObject;
	public var filterCreated:Boolean;
	public var displayLockToken:int = 0;
	
	public function TransitionItem() {
		this.easeType = Ease.quadOut;
		this.value = new TransitionValue();
		this.startValue = new TransitionValue();
		this.endValue = new TransitionValue();
	}
	
	public function __shake(trans:Object):void {
		trans.__shakeItem(this);
	}
}

class TransitionValue {
	public var f1: Number = 0;
	public var f2: Number = 0;
	public var f3: Number = 0;
	public var f4:Number;
	public var i: Number = 0;
	public var b: Boolean = false;
	public var s: String;
	public var b1: Boolean = true;
	public var b2: Boolean = true;
}
