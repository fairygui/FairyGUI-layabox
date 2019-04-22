package fairygui
{
	import fairygui.gears.IAnimationGear;
	import fairygui.gears.IColorGear;
	import fairygui.tween.GTween;
	import fairygui.tween.GTweener;
	import fairygui.utils.ByteBuffer;
	import fairygui.utils.ColorMatrix;
	import fairygui.utils.ToolSet;
	
	import laya.filters.ColorFilter;
	import laya.utils.Handler;
	
	public class Transition
	{
		public var name:String;
		
		private var _owner:GComponent;
		private var _ownerBaseX:Number;
		private var _ownerBaseY:Number;
		private var _items:Vector.<TransitionItem>;
		private var _totalTimes:int;
		private var _totalTasks:int;
		private var _playing:Boolean;
		private var _paused:Boolean;
		private var _onComplete:Handler;
		private var _options:int;
		private var _reversed:Boolean;
		private var _totalDuration:Number;
		private var _autoPlay:Boolean;
		private var _autoPlayTimes:int;
		private var _autoPlayDelay:Number;
		private var _timeScale:Number;
		private var _startTime:Number;
		private var _endTime:Number;
		
		private const OPTION_IGNORE_DISPLAY_CONTROLLER:int = 1;
		private const OPTION_AUTO_STOP_DISABLED:int = 2;
		private const OPTION_AUTO_STOP_AT_END:int = 4;
		
		public function Transition(owner:GComponent)
		{
			_owner = owner;
			_items = new Vector.<TransitionItem>();
			_totalDuration = 0;
			_autoPlayTimes = 1;
			_autoPlayDelay = 0;
			_timeScale = 1;
			_startTime = 0;
			_endTime = 0;
		}
		
		public function play(onComplete:Handler = null,
							 times:int = 1, delay:Number = 0, startTime:Number = 0, endTime:Number = -1):void
		{
			_play(onComplete, times, delay, startTime, endTime, false);
		}
		
		public function playReverse(onComplete:Handler = null, 
									times:int = 1, delay:Number = 0, startTime:Number = 0, endTime:Number = -1):void
		{
			_play(onComplete, 1, delay, startTime, endTime, true);
		}
		
		
		public function changePlayTimes(value:int):void
		{
			_totalTimes = value;
		}
		
		public function setAutoPlay(value:Boolean, times:int = 1, delay:Number = 0):void
		{
			if (_autoPlay != value)
			{
				_autoPlay = value;
				_autoPlayTimes = times;
				_autoPlayDelay = delay;
				
				if (_autoPlay)
				{
					if (_owner.onStage)
						play(null, null, _autoPlayTimes, _autoPlayDelay);
				}
				else
				{
					if (!_owner.onStage)
						stop(false, true);
				}
			}
		}
		
		private function _play(onComplete:Handler = null,
							   times:int = 1, delay:Number = 0, startTime:Number = 0, endTime:Number = -1, 
							   reversed:Boolean = false):void
		{
			stop(true, true);
			
			_totalTimes = times;
			_reversed = reversed;
			_startTime = startTime;
			_endTime = endTime;
			_playing = true;
			_paused = false;
			_onComplete = onComplete;
			
			var cnt:int = _items.length;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if(item.target == null)
				{
					if (item.targetId)
						item.target = _owner.getChildById(item.targetId);
					else
						item.target = _owner;
				}
				else if (item.target != _owner && item.target.parent != _owner)
					item.target = null;
				
				if (item.target != null && item.type == TransitionActionType.Transition)
				{
					var trans:Transition = (item.target as GComponent).getTransition(item.value.transName);
					if(trans==this)
						trans = null;
					if (trans != null)
					{
						if (item.value.playTimes == 0) //stop
						{
							var j:int;
							for (j = i - 1; j >= 0; j--)
							{
								var item2:TransitionItem = _items[j];
								if (item2.type == TransitionActionType.Transition)
								{
									if (item2.value.trans == trans)
									{
										item2.value.stopTime = item.time - item2.time;
										break;
									}
								}
							}
							if(j<0)
								item.value.stopTime = 0;
							else
								trans = null;//no need to handle stop anymore
						}
						else
							item.value.stopTime = -1;
					}
					item.value.trans = trans;
				}
			}
			
			if(delay==0)
				onDelayedPlay();
			else
				GTween.delayedCall(delay).onComplete(onDelayedPlay, this);
		}
		
		public function stop(setToComplete:Boolean = true, processCallback:Boolean = false):void
		{
			if (!_playing)
				return;
			
			_playing = false;
			_totalTasks = 0;
			_totalTimes = 0;
			var handler:Handler = _onComplete;
			_onComplete = null;
			
			GTween.kill(this);//delay start
			
			var cnt:int = _items.length;
			if(_reversed)
			{
				for (var i:int = cnt-1; i >=0 ; i--)
				{
					var item:TransitionItem = _items[i];
					if(item.target==null)
						continue;
					
					stopItem(item, setToComplete);
				}
			}
			else
			{
				for (i = 0; i < cnt; i++)
				{
					item = _items[i];
					if(item.target==null)
						continue;
					
					stopItem(item, setToComplete);
				}
			}
			
			if (processCallback && handler != null)
			{
				handler.run();
			}
		}
		
		private function stopItem(item:TransitionItem, setToComplete:Boolean):void
		{
			if (item.displayLockToken!=0)
			{
				item.target.releaseDisplayLock(item.displayLockToken);
				item.displayLockToken = 0;
			}
			
			if (item.tweener != null)
			{
				item.tweener.kill(setToComplete);
				item.tweener = null;
				
				if (item.type == TransitionActionType.Shake && !setToComplete) //震动必须归位，否则下次就越震越远了。
				{
					item.target._gearLocked = true;
					item.target.setXY(item.target.x - item.value.lastOffsetX, item.target.y - item.value.lastOffsetY);
					item.target._gearLocked = false;
				}
			}
			
			if (item.type == TransitionActionType.Transition)
			{
				var trans:Transition = item.value.trans;
				if (trans != null)
					trans.stop(setToComplete, false);
			}
		}
		
		public function setPaused(paused:Boolean):void
		{
			if (!_playing || _paused == paused)
				return;
			
			_paused = paused;
			var tweener:GTweener = GTween.getTween(this);
			if (tweener != null)
				tweener.setPaused(paused);
			
			var cnt:int = _items.length;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.target == null)
					continue;
				
				if (item.type == TransitionActionType.Transition)
				{
					if (item.value.trans != null)
						item.value.trans.setPaused(paused);
				}
				else if (item.type == TransitionActionType.Animation)
				{
					if (paused)
					{
						item.value.flag = IAnimationGear(item.target).playing;
						IAnimationGear(item.target).playing = false;
					}
					else
						IAnimationGear(item.target).playing = item.value.flag;
				}
				
				if (item.tweener != null)
					item.tweener.setPaused(paused);
			}
		}
		
		public function dispose():void
		{
			if(_playing)
				GTween.kill(this);//delay start
			
			var cnt:int = _items.length;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.tweener != null)
				{
					item.tweener.kill();
					item.tweener = null;
				}
				
				item.target = null;
				item.hook = null;
				if (item.tweenConfig != null)
					item.tweenConfig.endHook = null;
			}
			
			_items.length = 0;
			_playing = false;
			_onComplete = null;
		}
		
		public function get playing():Boolean
		{
			return _playing;
		}
		
		public function setValue(label:String, ...args):void
		{
			var cnt:int = _items.length;
			var found:Boolean = false;
			var value:Object;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.label == label)
				{
					if (item.tweenConfig != null)
						value = item.tweenConfig.startValue;
					else
						value = item.value;
					found = true;
				}
				else if (item.tweenConfig != null && item.tweenConfig.endLabel == label)
				{
					value = item.tweenConfig.endValue;
					found = true;
				}
				else
					continue;
				
				switch (item.type)
				{
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
						value.f1 = parseFloat(args[0]);
						break;
					
					case TransitionActionType.Color:
						value.f1 = parseFloat(args[0]);
						break;
					
					case TransitionActionType.Animation:
						value.frame = parseInt(args[0]);
						if (args.length > 1)
							value.playing = args[1];
						break;
					
					case TransitionActionType.Visible:
						value.visible = args[0];
						break;
					
					case TransitionActionType.Sound:
						value.sound = args[0];
						if(args.length > 1)
							value.volume = parseFloat(args[1]);
						break;
					
					case TransitionActionType.Transition:
						value.transName = args[0];
						if (args.length > 1)
							value.playTimes = parseInt(args[1]);
						break;
					
					case TransitionActionType.Shake:
						value.amplitude = parseFloat(args[0]);
						if (args.length > 1)
							value.duration = parseFloat(args[1]);
						break;
					
					case TransitionActionType.ColorFilter:
						value.f1 = parseFloat(args[0]);
						value.f2 = parseFloat(args[1]);
						value.f3 = parseFloat(args[2]);
						value.f4 = parseFloat(args[3]);
						break;
					
					case TransitionActionType.Text:
					case TransitionActionType.Icon:
						value.text = args[0];
						break;
				}
			}
			
			if (!found)
				throw new Error("label not exists");
		}
		
		public function setHook(label:String, callback:Handler):void
		{
			var cnt:int = _items.length;
			var found:Boolean = false;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.label == label)
				{
					item.hook = callback;
					found = true;
					break;
				}
				else if (item.tweenConfig != null && item.tweenConfig.endLabel == label)
				{
					item.tweenConfig.endHook = callback;
					found = true;
					break;
				}
			}
			
			if (!found)
				throw new Error("label not exists");
		}
		
		public function clearHooks():void
		{
			var cnt:int = _items.length;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				item.hook = null;
				if (item.tweenConfig != null)
					item.tweenConfig.endHook = null;
			}
		}
		
		public function setTarget(label:String, newTarget:GObject):void
		{
			var cnt:int = _items.length;
			var found:Boolean = false;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.label == label)
				{
					item.targetId = (newTarget == _owner || newTarget == null) ? "" : newTarget.id;
					if (_playing)
					{
						if (item.targetId.length > 0)
							item.target = _owner.getChildById(item.targetId);
						else
							item.target = _owner;
					}
					else
						item.target = null;
					found = true;
				}
			}
			
			if (!found)
				throw new Error("label not exists");
		}
		
		public function setDuration(label:String, value:Number):void
		{
			var cnt:int = _items.length;
			var found:Boolean = false;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.tweenConfig != null && item.label == label)
				{
					item.tweenConfig.duration = value;
					found = true;
				}
			}
			
			if (!found)
				throw new Error("label not exists");
		}
		
		public function getLabelTime(label:String):Number
		{
			var cnt:int = _items.length;
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.label == label)
					return item.time;
				else if (item.tweenConfig != null && item.tweenConfig.endLabel == label)
					return item.time + item.tweenConfig.duration;
			}
			
			return Number.NaN;
		}
		
		public function get timeScale():Number
		{
			return _timeScale;
		}
		
		public function set timeScale(value:Number):void
		{
			if(_timeScale != value)
			{		
				_timeScale = value;
				if (_playing)
				{
					var cnt:int = _items.length;
					for (var i:int = 0; i < cnt; i++)
					{
						var item:TransitionItem = _items[i];
						if (item.tweener != null)
							item.tweener.setTimeScale(value);
						else if (item.type == TransitionActionType.Transition)
						{
							if(item.value.trans != null)
								item.value.trans.timeScale = value;
						}
						else if(item.type == TransitionActionType.Animation)
						{
							if(item.target != null)
								IAnimationGear(item.target).timeScale = value;
						}
					}
				}
			}
		}
		
		internal function updateFromRelations(targetId:String, dx:Number, dy:Number):void
		{
			var cnt:int = _items.length;
			if (cnt == 0)
				return;
			
			for (var i:int = 0; i < cnt; i++)
			{
				var item:TransitionItem = _items[i];
				if (item.type == TransitionActionType.XY && item.targetId == targetId)
				{
					if (item.tweenConfig!=null)
					{
						item.tweenConfig.startValue.f1 += dx;
						item.tweenConfig.startValue.f2 += dy;
						item.tweenConfig.endValue.f1 += dx;
						item.tweenConfig.endValue.f2 += dy;
					}
					else
					{
						item.value.f1 += dx;
						item.value.f2 += dy;
					}
				}
			}
		}
		
		internal function onOwnerAddedToStage():void
		{
			if (_autoPlay && !_playing)
				play(null, _autoPlayTimes, _autoPlayDelay);
		}
		
		internal function onOwnerRemovedFromStage():void
		{
			if ((_options & OPTION_AUTO_STOP_DISABLED) == 0)
				stop((_options & OPTION_AUTO_STOP_AT_END) != 0 ? true : false, false);
		}
		
		private function onDelayedPlay():void
		{
			internalPlay();
			
			_playing = _totalTasks>0;
			if (_playing)
			{				
				if ((_options & OPTION_IGNORE_DISPLAY_CONTROLLER) != 0)
				{
					var cnt:int = _items.length;
					for (var i:int = 0; i < cnt; i++)
					{
						var item:TransitionItem = _items[i];
						if (item.target != null && item.target!=_owner)
							item.displayLockToken = item.target.addDisplayLock();
					}
				}
			}
			else if (_onComplete != null)
			{
				var handler:Handler = _onComplete;
				_onComplete = null;
				handler.run();
			}
		}
		
		private function internalPlay():void
		{
			_ownerBaseX = _owner.x;
			_ownerBaseY = _owner.y;
			
			_totalTasks = 0;
			
			var cnt:int = _items.length;
			var item:TransitionItem;
			var needSkipAnimations:Boolean = false;
			
			if (!_reversed)
			{
				for (var i:int = 0; i < cnt; i++)
				{
					item = _items[i];
					if (item.target == null)
						continue;
					
					if (item.type == TransitionActionType.Animation && _startTime != 0 && item.time <= _startTime)
					{
						needSkipAnimations = true;
						item.value.flag = false;
					}
					else
						playItem(item);
				}
			}
			else
			{
				for (i = cnt - 1; i >= 0; i--)
				{
					item = _items[i];
					if (item.target == null)
						continue;
					
					playItem(item);
				}
			}
			
			if (needSkipAnimations)
				skipAnimations();
		}
		
		private function playItem(item:TransitionItem):void
		{
			var time:Number;
			if (item.tweenConfig != null)
			{
				if (_reversed)
					time = (_totalDuration - item.time - item.tweenConfig.duration);
				else
					time = item.time;
				if (_endTime == -1 || time <= _endTime)
				{
					var startValue:TValue;
					var endValue:TValue;
					if(_reversed)
					{
						startValue = item.tweenConfig.endValue;
						endValue = item.tweenConfig.startValue;
					}
					else
					{
						startValue = item.tweenConfig.startValue;
						endValue = item.tweenConfig.endValue;
					}
					
					item.value.b1 = startValue.b1 || endValue.b1;
					item.value.b2 = startValue.b2 || endValue.b2;
					
					switch(item.type)
					{
						case TransitionActionType.XY:
						case TransitionActionType.Size:
						case TransitionActionType.Scale:
						case TransitionActionType.Skew:
							item.tweener = GTween.to2(startValue.f1, startValue.f2, endValue.f1, endValue.f2, item.tweenConfig.duration);
							break;
						
						case TransitionActionType.Alpha:
						case TransitionActionType.Rotation:
							item.tweener = GTween.to(startValue.f1, endValue.f1, item.tweenConfig.duration);
							break;
						
						case TransitionActionType.Color:
							item.tweener = GTween.toColor(startValue.f1, endValue.f1, item.tweenConfig.duration);
							break;
						
						case TransitionActionType.ColorFilter:
							item.tweener = GTween.to4(startValue.f1,startValue.f2,startValue.f3,startValue.f4,
								endValue.f1,endValue.f2,endValue.f3,endValue.f4, item.tweenConfig.duration);
							break;
					}
					
					item.tweener.setDelay(time)
						.setEase(item.tweenConfig.easeType)
						.setRepeat(item.tweenConfig.repeat, item.tweenConfig.yoyo)
						.setTimeScale(_timeScale)
						.setTarget(item)
						.onStart(onTweenStart, this)
						.onUpdate(onTweenUpdate, this)
						.onComplete(onTweenComplete, this);
					
					if (_endTime >= 0)
						item.tweener.setBreakpoint(_endTime - time);
					
					_totalTasks++;
				}
			}
			else if(item.type==TransitionActionType.Shake)
			{
				if (_reversed)
					time = (_totalDuration - item.time - item.value.duration);
				else
					time = item.time;
				
				item.value.offsetX = item.value.offsetY = 0;
				item.value.lastOffsetX = item.value.lastOffsetY = 0;
				item.tweener = GTween.shake(0, 0, item.value.amplitude, item.value.duration)
					.setDelay(time)
					.setTimeScale(_timeScale)
					.setTarget(item)
					.onUpdate(onTweenUpdate, this)
					.onComplete(onTweenComplete, this);
				
				if (_endTime >= 0)
					item.tweener.setBreakpoint(_endTime - item.time);
				
				_totalTasks++;
			}
			else
			{
				if (_reversed)
					time = (_totalDuration - item.time);
				else
					time = item.time;
				
				if (time <= _startTime)
				{
					applyValue(item);
					callHook(item, false);
				}
				else if (_endTime == -1 || time <= _endTime)
				{
					_totalTasks++;
					item.tweener = GTween.delayedCall(time)
						.setTimeScale(_timeScale)
						.setTarget(item)
						.onComplete(onDelayedPlayItem, this);
				}
			}
			
			if (item.tweener != null)
				item.tweener.seek(_startTime);
		}
		
		private function skipAnimations():void
		{
			var frame:int;
			var playStartTime:Number;
			var playTotalTime:Number;
			var value:Object;
			var target:IAnimationGear;
			var item:TransitionItem;
			
			var cnt:int = _items.length;
			for (var i:int = 0; i < cnt; i++)
			{
				item = _items[i];
				if (item.type != TransitionActionType.Animation || item.time > _startTime)
					continue;
				
				value = item.value;
				if (value.flag)
					continue;
				
				target = IAnimationGear(item.target);
				frame = target.frame;
				playStartTime = target.playing ? 0 : -1;
				playTotalTime = 0;
				
				for (var j:int = i; j < cnt; j++)
				{
					item = _items[j];
					if (item.type != TransitionActionType.Animation || item.target != target || item.time > _startTime)
						continue;
					
					value = item.value;
					value.flag = true;
					
					if (value.frame != -1)
					{
						frame = value.frame;
						if (value.playing)
							playStartTime = item.time;
						else
							playStartTime = -1;
						playTotalTime = 0;
					}
					else
					{
						if (value.playing)
						{
							if (playStartTime < 0)
								playStartTime = item.time;
						}
						else
						{
							if (playStartTime >= 0)
								playTotalTime += (item.time - playStartTime);
							playStartTime = -1;
						}
					}
					
					callHook(item, false);
				}
				
				if (playStartTime >= 0)
					playTotalTime += (_startTime - playStartTime);
				
				target.playing = playStartTime>=0;
				target.frame = frame;
				if (playTotalTime > 0)
					target.advance(playTotalTime*1000);
			}
		}
		
		private function onDelayedPlayItem(tweener:GTweener):void
		{
			var item:TransitionItem = tweener.target as TransitionItem;
			item.tweener = null;
			_totalTasks--;
			
			applyValue(item);
			callHook(item, false);
			
			checkAllComplete();
		}
		
		private function onTweenStart(tweener:GTweener):void
		{
			var item:TransitionItem = tweener.target as TransitionItem;

			if (item.type == TransitionActionType.XY || item.type == TransitionActionType.Size) //位置和大小要到start才最终确认起始值
			{
				var startValue:TValue;
				var endValue:TValue;
				
				if (_reversed)
				{
					startValue = item.tweenConfig.endValue;
					endValue = item.tweenConfig.startValue;
				}
				else
				{
					startValue = item.tweenConfig.startValue;
					endValue = item.tweenConfig.endValue;
				}
				
				if (item.type == TransitionActionType.XY)
				{
					if (item.target != _owner)
					{
						if (!startValue.b1)
							startValue.f1 = item.target.x;
						if (!startValue.b2)
							startValue.f2 = item.target.y;
					}
					else
					{
						if (!startValue.b1)
							startValue.f1 = item.target.x - _ownerBaseX;
						if (!startValue.b2)
							startValue.f2 = item.target.y - _ownerBaseY;
					}
				}
				else
				{
					if (!startValue.b1)
						startValue.f1 = item.target.width;
					if (!startValue.b2)
						startValue.f2 = item.target.height;
				}
				
				if (!endValue.b1)
					endValue.f1 = startValue.f1;
				if (!endValue.b2)
					endValue.f2 = startValue.f2;
				
				tweener.startValue.x = startValue.f1;
				tweener.startValue.y = startValue.f2;
				tweener.endValue.x = endValue.f1;
				tweener.endValue.y = endValue.f2;
			}
			
			callHook(item, false);
		}
		
		private function onTweenUpdate(tweener:GTweener):void
		{
			var item:TransitionItem = tweener.target as TransitionItem;
			switch (item.type)
			{
				case TransitionActionType.XY:
				case TransitionActionType.Size:
				case TransitionActionType.Scale:
				case TransitionActionType.Skew:
					item.value.f1 = tweener.value.x;
					item.value.f2 = tweener.value.y;
					break;
				
				case TransitionActionType.Alpha:
				case TransitionActionType.Rotation:
					item.value.f1 = tweener.value.x;
					break;
				
				case TransitionActionType.Color:
					item.value.f1 = tweener.value.color;
					break;
				
				case TransitionActionType.ColorFilter:
					item.value.f1 = tweener.value.x;
					item.value.f2 = tweener.value.y;
					item.value.f3 = tweener.value.z;
					item.value.f4 = tweener.value.w;
					break;
				
				case TransitionActionType.Shake:
					item.value.offsetX = tweener.deltaValue.x;
					item.value.offsetY = tweener.deltaValue.y;
					break;
			}
			
			applyValue(item);
		}
		
		private function onTweenComplete(tweener:GTweener):void
		{
			var item:TransitionItem = tweener.target as TransitionItem;
			item.tweener = null;
			_totalTasks--;
			
			if (tweener.allCompleted) //当整体播放结束时间在这个tween的中间时不应该调用结尾钩子
				callHook(item, true);
			
			checkAllComplete();
		}
		
		private function onPlayTransCompleted(item:TransitionItem):void
		{
			_totalTasks--;
			
			checkAllComplete();
		}
		
		private function callHook(item:TransitionItem, tweenEnd:Boolean):void
		{
			if (tweenEnd)
			{
				if (item.tweenConfig!=null && item.tweenConfig.endHook != null)
					item.tweenConfig.endHook.run();
			}
			else
			{
				if (item.time >= _startTime && item.hook != null)
					item.hook.run();
			}
		}
		
		private function checkAllComplete():void
		{
			if (_playing && _totalTasks == 0)
			{
				if (_totalTimes < 0)
				{
					internalPlay();
				}
				else
				{
					_totalTimes--;
					if (_totalTimes > 0)
						internalPlay();
					else
					{
						_playing = false;
						
						var cnt:int = _items.length;				
						for (var i:int = 0; i < cnt; i++)
						{
							var item:TransitionItem = _items[i];
							if (item.target != null && item.displayLockToken!=0)
							{
								item.target.releaseDisplayLock(item.displayLockToken);
								item.displayLockToken = 0;
							}
						}
						
						if (_onComplete != null)
						{
							var handler:Handler = _onComplete;
							_onComplete = null;
							handler.run();
						}
					}
				}
			}
		}
		
		private function applyValue(item:TransitionItem):void
		{
			item.target._gearLocked = true;
			
			switch (item.type)
			{
				case TransitionActionType.XY:
					if(item.target==_owner)
					{
						var f1:Number, f2:Number;
						if (!item.value.b1)
							f1 = item.target.x;
						else
							f1 = item.value.f1+_ownerBaseX;
						if (!item.value.b2)
							f2 = item.target.y;
						else
							f2 = item.value.f2+_ownerBaseY;
						item.target.setXY(f1, f2);
					}
					else
					{
						if (!item.value.b1)
							item.value.f1 = item.target.x;
						if (!item.value.b2)
							item.value.f2 = item.target.y;
						item.target.setXY(item.value.f1, item.value.f2);
					}
					break;
				
				case TransitionActionType.Size:
					if (!item.value.b1)
						item.value.f1 = item.target.width;
					if (!item.value.b2)
						item.value.f2 = item.target.height;
					item.target.setSize(item.value.f1, item.value.f2);
					break;
				
				case TransitionActionType.Pivot:
					item.target.setPivot(item.value.f1, item.value.f2, item.target.pivotAsAnchor);
					break;
				
				case TransitionActionType.Alpha:
					item.target.alpha = item.value.f1;
					break;
				
				case TransitionActionType.Rotation:
					item.target.rotation = item.value.f1;
					break;
				
				case TransitionActionType.Scale: 
					item.target.setScale(item.value.f1, item.value.f2);
					break;
				
				case TransitionActionType.Skew:
					item.target.setSkew(item.value.f1, item.value.f2);
					break;
				
				case TransitionActionType.Color:
					IColorGear(item.target).color = ToolSet.convertToHtmlColor(item.value.f1, false);
					break;
				
				case TransitionActionType.Animation:
					if (item.value.frame>=0)
						IAnimationGear(item.target).frame = item.value.frame;
					IAnimationGear(item.target).playing = item.value.playing;
					IAnimationGear(item.target).timeScale = _timeScale;
					break;
				
				case TransitionActionType.Visible:
					item.target.visible = item.value.visible;
					break;

				case TransitionActionType.Transition:
					if (_playing)
					{
						var trans:Transition = item.value.trans;
						if (trans != null)
						{
							_totalTasks++;
							var startTime:Number = _startTime > item.time ? (_startTime - item.time) : 0;
							var endTime:Number = _endTime >= 0 ? (_endTime - item.time) : -1;
							if (item.value.stopTime >= 0 && (endTime < 0 || endTime > item.value.stopTime))
								endTime = item.value.stopTime;
							trans.timeScale = _timeScale;
							trans._play(Handler.create(this, this.onPlayTransCompleted, [item]),item.value.playTimes, 0, startTime, endTime, _reversed);
						}
					}
					break;
				
				case TransitionActionType.Sound:
					if (_playing && item.time >= _startTime)
					{
						if(item.value.audioClip==null)
						{
							var pi:PackageItem = UIPackage.getItemByURL(item.value.sound);
							if(pi)
								item.value.audioClip = pi.file;
							else
								item.value.audioClip = item.value.sound;
						}
						if(item.value.audioClip)
							GRoot.inst.playOneShotSound(item.value.audioClip, item.value.volume);
					}
					break;
				
				case TransitionActionType.Shake:
					item.target.setXY(item.target.x - item.value.lastOffsetX + item.value.offsetX, item.target.y - item.value.lastOffsetY + item.value.offsetY);
					item.value.lastOffsetX = item.value.offsetX;
					item.value.lastOffsetY = item.value.offsetY;
					break;
				
				case TransitionActionType.ColorFilter:
				{
					var arr:Array = item.target.filters;
					
					var cm:ColorMatrix = new ColorMatrix();
					cm.adjustBrightness(item.value.f1);
					cm.adjustContrast(item.value.f2);
					cm.adjustSaturation(item.value.f3);
					cm.adjustHue(item.value.f4);
					arr = [new ColorFilter(cm)];
					item.target.filters = arr;
					break;
				}
					
				case TransitionActionType.Text:
					item.target.text = item.value.text;
					break;
				
				case TransitionActionType.Icon:
					item.target.icon = item.value.text;
					break;
			}
			
			item.target._gearLocked = false;
		}
		
		public function setup(buffer:ByteBuffer):void
		{
			this.name = buffer.readS();
			_options = buffer.getInt32();
			_autoPlay = buffer.readBool();
			_autoPlayTimes = buffer.getInt32();
			_autoPlayDelay = buffer.getFloat32();
			
			var cnt:int = buffer.getInt16();
			for (var i:int = 0; i < cnt; i++)
			{
				var dataLen:int = buffer.getInt16();
				var curPos:int = buffer.pos;
				
				buffer.seek(curPos, 0);
				
				var item:TransitionItem = new TransitionItem(buffer.readByte());
				_items[i] = item;
				
				item.time = buffer.getFloat32();
				var targetId:int = buffer.getInt16();
				if (targetId < 0)
					item.targetId = "";
				else
					item.targetId = _owner.getChildAt(targetId).id;
				item.label = buffer.readS();
				
				if (buffer.readBool())
				{
					buffer.seek(curPos, 1);
					
					item.tweenConfig = new TweenConfig();
					item.tweenConfig.duration = buffer.getFloat32();
					if (item.time + item.tweenConfig.duration > _totalDuration)
						_totalDuration = item.time + item.tweenConfig.duration;
					item.tweenConfig.easeType = buffer.readByte();
					item.tweenConfig.repeat = buffer.getInt32();
					item.tweenConfig.yoyo = buffer.readBool();
					item.tweenConfig.endLabel = buffer.readS();
					
					buffer.seek(curPos, 2);
					
					decodeValue(item, buffer, item.tweenConfig.startValue);
					
					buffer.seek(curPos, 3);
					
					decodeValue(item, buffer, item.tweenConfig.endValue);
				}
				else
				{
					if (item.time > _totalDuration)
						_totalDuration = item.time;
					
					buffer.seek(curPos, 2);
					
					decodeValue(item, buffer, item.value);
				}
				
				buffer.pos = curPos + dataLen;
			}
		}
		
		private function decodeValue(item:TransitionItem, buffer:ByteBuffer, value:Object):void
		{
			switch(item.type)
			{
				case TransitionActionType.XY:
				case TransitionActionType.Size:
				case TransitionActionType.Pivot:
				case TransitionActionType.Skew:
					value.b1 = buffer.readBool();
					value.b2 = buffer.readBool();
					value.f1 = buffer.getFloat32();
					value.f2 = buffer.getFloat32();
					break;
				
				case TransitionActionType.Alpha:
				case TransitionActionType.Rotation:
					value.f1 = buffer.getFloat32();
					break;

				case TransitionActionType.Scale:
					value.f1 = buffer.getFloat32();
					value.f2 = buffer.getFloat32();
					break;
				
				case TransitionActionType.Color:
					value.f1 = buffer.readColor();
					break;
				
				case TransitionActionType.Animation:
					value.playing = buffer.readBool();
					value.frame = buffer.getInt32();
					break;
				
				case TransitionActionType.Visible:
					value.visible = buffer.readBool();
					break;
				
				case TransitionActionType.Sound:
					value.sound = buffer.readS();
					value.volume = buffer.getFloat32();
					break;
				
				case TransitionActionType.Transition:
					value.transName = buffer.readS();
					value.playTimes = buffer.getInt32();
					break;
				
				case TransitionActionType.Shake:
					value.amplitude = buffer.getFloat32();
					value.duration = buffer.getFloat32();
					break;
				
				case TransitionActionType.ColorFilter:
					value.f1 = buffer.getFloat32();
					value.f2 = buffer.getFloat32();
					value.f3 = buffer.getFloat32();
					value.f4 = buffer.getFloat32();
					break;
				
				case TransitionActionType.Text:
				case TransitionActionType.Icon:
					value.text = buffer.readS();
					break;
			}
		}
	}
}

import fairygui.GObject;
import fairygui.Transition;
import fairygui.tween.EaseType;
import fairygui.tween.GTweener;

import laya.utils.Handler;

class TransitionActionType
{
	public static const XY:int=0;
	public static const Size:int=1;
	public static const Scale:int=2;
	public static const Pivot:int=3;
	public static const Alpha:int=4;
	public static const Rotation:int=5;
	public static const Color:int=6;
	public static const Animation:int=7;
	public static const Visible:int = 8;
	public static const Sound:int=9;
	public static const Transition:int=10;
	public static const Shake:int = 11;
	public static const ColorFilter:int = 12;
	public static const Skew:int = 13;
	public static const Text:int = 14;
	public static const Icon:int = 15;
	public static const Unknown:int = 16;
}

class TransitionItem
{
	public var time:Number;
	public var targetId:String;
	public var type:int;
	public var tweenConfig:TweenConfig;
	public var label:String;
	public var value:Object;
	public var hook:Handler;
	
	public var tweener:GTweener;
	public var target:GObject;
	public var displayLockToken:uint;
	
	public function TransitionItem(type:int)
	{
		this.type = type;
		
		switch (type)
		{
			case TransitionActionType.XY:
			case TransitionActionType.Size:
			case TransitionActionType.Scale:
			case TransitionActionType.Pivot:
			case TransitionActionType.Skew:
			case TransitionActionType.Alpha:
			case TransitionActionType.Rotation:
			case TransitionActionType.Color:
			case TransitionActionType.ColorFilter:
				value = new TValue();
				break;
			
			case TransitionActionType.Animation:
				value = new TValue_Animation();
				break;
			
			case TransitionActionType.Shake:
				value = new TValue_Shake();
				break;
			
			case TransitionActionType.Sound:
				value = new TValue_Sound();
				break;
			
			case TransitionActionType.Transition:
				value = new TValue_Transition();
				break;
			
			case TransitionActionType.Visible:
				value = new TValue_Visible();
				break;
			
			case TransitionActionType.Text:
			case TransitionActionType.Icon:
				value = new TValue_Text();
				break;
		}
	}
}

class TweenConfig
{
	public var duration:Number;
	public var easeType:int;
	public var repeat:int;
	public var yoyo:Boolean;
	public var startValue:TValue;
	public var endValue:TValue;
	public var endLabel:String;
	public var endHook:Handler;
	
	public function TweenConfig()
	{
		easeType = EaseType.QuadOut;
		startValue = new TValue();
		endValue = new TValue();
	}
}

class TValue_Visible
{
	public var visible:Boolean;
}

class TValue_Animation
{
	public var frame:int;
	public var playing:Boolean;
	public var flag:Boolean;
}

class TValue_Sound
{
	public var sound:String;
	public var volume:Number;
	public var audioClip:String;
}

class TValue_Transition
{
	public var transName:String;
	public var playTimes:int;
	public var trans:Transition;
	public var stopTime:Number;
}

class TValue_Shake
{
	public var amplitude:Number;
	public var duration:Number;
	public var offsetX:Number;
	public var offsetY:Number;
	public var lastOffsetX:Number;
	public var lastOffsetY:Number;
}

class TValue_Text
{
	public var text:String;
}

class TValue
{
	public var f1:Number;
	public var f2:Number;
	public var f3:Number;
	public var f4:Number;
	
	public var b1:Boolean;
	public var b2:Boolean;
	
	public function TValue()
	{
		b1 = b2 = true;
	}
}

