package fairygui.tween
{
	public class GTweener
	{
		internal var _target:Object;
		internal var _propType:Object;
		internal var _killed:Boolean;
		internal var _paused:Boolean;
		
		private var _delay:Number;
		private var _duration:Number;
		private var _breakpoint:Number;
		private var _easeType:int;
		private var _easeOvershootOrAmplitude:Number;
		private var _easePeriod:Number;
		private var _repeat:int;
		private var _yoyo:Boolean;
		private var _timeScale:Number;
		private var _snapping:Boolean;
		private var _userData:*;
		
		private var _onUpdate:Function;
		private var _onUpdateCaller:*;
		private var _onStart:Function;
		private var _onStartCaller:*;
		private var _onComplete:Function;
		private var _onCompleteCaller:*;
		
		private var _startValue:TweenValue;
		private var _endValue:TweenValue;
		private var _value:TweenValue;
		private var _deltaValue:TweenValue;
		private var _valueSize:int;
		
		private var _started:Boolean;
		private var _ended:int;
		private var _elapsedTime:Number;
		private var _normalizedTime:Number;
		
		public function GTweener()
		{
			_startValue = new TweenValue();
			_endValue = new TweenValue();
			_value = new TweenValue();
			_deltaValue = new TweenValue();
			
			_reset();
		}
		
		public function setDelay(value:Number):GTweener
		{
			_delay = value;
			return this;
		}
		
		public function get delay():Number
		{
			return _delay;
		}
		
		public function setDuration(value:Number):GTweener
		{
			_duration = value;
			return this;
		}
		
		public function get duration():Number
		{
			return _duration;
		}
		
		public function setBreakpoint(value:Number):GTweener
		{
			_breakpoint = value;
			return this;
		}
		
		public function setEase(value:int):GTweener
		{
			_easeType = value;
			return this;
		}
		
		public function setEasePeriod(value:Number):GTweener
		{
			_easePeriod = value;
			return this;
		}
		
		public function setEaseOvershootOrAmplitude(value:Number):GTweener
		{
			_easeOvershootOrAmplitude = value;
			return this;
		}
		
		public function setRepeat(repeat:int, yoyo:Boolean = false):GTweener
		{
			_repeat = repeat;
			_yoyo = yoyo;
			return this;
		}
		
		public function get repeat():int
		{
			return _repeat;
		}
		
		public function setTimeScale(value:Number):GTweener
		{
			_timeScale = value;
			return this;
		}
		
		public function setSnapping(value:Boolean):GTweener
		{
			_snapping = value;
			return this;
		}
		
		public function setTarget(value:Object, propType:Object=null):GTweener
		{
			_target = value;
			_propType = propType;
			return this;
		}

		public function get target():Object
		{
			return _target;
		}
		
		public function setUserData(value:*):GTweener
		{
			_userData = value;
			return this;
		}

		public function get userData():*
		{
			return _userData;
		}

		public function onUpdate(callback:Function, caller:*):GTweener
		{
			_onUpdate = callback;
			_onUpdateCaller = caller;
			return this;
		}
		
		public function onStart(callback:Function, caller:*):GTweener
		{
			_onStart = callback;
			_onStartCaller = caller;
			return this;
		}
		
		public function onComplete(callback:Function, caller:*):GTweener
		{
			_onComplete = callback;
			_onCompleteCaller = caller;
			return this;
		}
		
		public function get startValue():TweenValue
		{
			return _startValue;
		}
		
		public function get endValue():TweenValue
		{
			return _endValue;
		}

		public function get value():TweenValue
		{
			return _value;
		}
		
		public function get deltaValue():TweenValue
		{
			return _deltaValue;
		}
		
		public function get normalizedTime():Number
		{
			return _normalizedTime;
		}
		
		public function get completed():Boolean
		{
			return _ended != 0;
		}

		public function get allCompleted():Boolean
		{
			return _ended == 1;
		}

		public function setPaused(paused:Boolean):GTweener
		{
			_paused = paused;
			return this;
		}
		
		/**
		 * seek position of the tween, in seconds.
		 */
		public function seek(time:Number):void
		{
			if (_killed)
				return;
			
			_elapsedTime = time;
			if (_elapsedTime < _delay)
			{
				if (_started)
					_elapsedTime = _delay;
				else
					return;
			}
			
			update();
		}
		
		public function kill(complete:Boolean = false):void
		{
			if (_killed)
				return;
			
			if (complete)
			{
				if (_ended == 0)
				{
					if (_breakpoint >= 0)
						_elapsedTime = _delay + _breakpoint;
					else if (_repeat >= 0)
						_elapsedTime = _delay + _duration * (_repeat + 1);
					else
						_elapsedTime = _delay + _duration * 2;
					update();
				}
				
				callCompleteCallback();
			}
			
			_killed = true;
		}
		
		internal function _to(start:Number, end:Number, duration:Number):GTweener
		{
			_valueSize = 1;
			_startValue.x = start;
			_endValue.x = end;
			_duration = duration;
			return this;
		}
		
		internal function _to2(start:Number, start2:Number, end:Number, end2:Number, duration:Number):GTweener
		{
			_valueSize = 2;
			_startValue.x = start;
			_endValue.x = end;
			_startValue.y = start2;
			_endValue.y = end2;
			_duration = duration;
			return this;
		}
		
		internal function _to3(start:Number, start2:Number, start3:Number, 
							  end:Number, end2:Number, end3:Number, duration:Number):GTweener
		{
			_valueSize = 3;
			_startValue.x = start;
			_endValue.x = end;
			_startValue.y = start2;
			_endValue.y = end2;
			_startValue.z = start3;
			_endValue.z = end3;
			_duration = duration;
			return this;
		}
		
		internal function _to4(start:Number, start2:Number, start3:Number, start4:Number, 
							  end:Number, end2:Number, end3:Number, end4:Number, duration:Number):GTweener
		{
			_valueSize = 4;
			_startValue.x = start;
			_endValue.x = end;
			_startValue.y = start2;
			_endValue.y = end2;
			_startValue.z = start3;
			_endValue.z = end3;
			_startValue.w = start4;
			_endValue.w = end4;
			_duration = duration;
			return this;
		}
		
		internal function _toColor(start:uint, end:uint, duration:Number):GTweener
		{
			_valueSize = 4;
			_startValue.color = start; 
			_endValue.color = end;
			_duration = duration;
			return this;
		}
		
		internal function _shake(startX:Number, startY:Number, amplitude:Number, duration:Number):GTweener
		{
			_valueSize = 5;
			_startValue.x = startX;
			_startValue.y = startY;
			_startValue.w = amplitude;
			_duration = duration;
			_easeType = EaseType.Linear;
			return this;
		}
		
		internal function _init():void
		{
			_delay = 0;
			_duration = 0;
			_breakpoint = -1;
			_easeType = EaseType.QuadOut;
			_timeScale = 1;
			_easePeriod = 0;
			_easeOvershootOrAmplitude = 1.70158;
			_snapping = false;
			_repeat = 0;
			_yoyo = false;
			_valueSize = 0;
			_started = false;
			_paused = false;
			_killed = false;
			_elapsedTime = 0;
			_normalizedTime = 0;
			_ended = 0;
		}
		
		internal function _reset():void
		{
			_target = null;
			_userData = null;
			_onStart = _onUpdate = _onComplete = null;
			_onStartCaller = _onUpdateCaller = _onCompleteCaller = null;
		}
		
		internal function _update(dt:Number):void
		{
			if (_timeScale != 1)
				dt *= _timeScale;
			if (dt == 0)
				return;
			
			if (_ended != 0) //Maybe completed by seek
			{
				callCompleteCallback();
				_killed = true;
				return;
			}
			
			_elapsedTime += dt;
			update();
			
			if (_ended != 0)
			{
				if (!_killed)
				{
					callCompleteCallback();
					_killed = true;
				}
			}
		}
		
		private function update():void
		{
			_ended = 0;
			
			if (_valueSize == 0) //DelayedCall
			{
				if (_elapsedTime >= _delay + _duration)
					_ended = 1;
				
				return;
			}
			
			if (!_started)
			{
				if (_elapsedTime < _delay)
					return;
				
				_started = true;
				callStartCallback();
				if (_killed)
					return;
			}
			
			var reversed:Boolean = false;
			var tt:Number = _elapsedTime - _delay;
			if (_breakpoint >= 0 && tt >= _breakpoint)
			{
				tt = _breakpoint;
				_ended = 2;
			}
			
			if (_repeat != 0)
			{
				var round:int = Math.floor(tt / _duration);
				tt -= _duration * round;
				if (_yoyo)
					reversed = round % 2 == 1;
				
				if (_repeat > 0 && _repeat - round < 0)
				{
					if (_yoyo)
						reversed = _repeat % 2 == 1;
					tt = _duration;
					_ended = 1;
				}
			}
			else if (tt >= _duration)
			{
				tt = _duration;
				_ended = 1;
			}
			
			_normalizedTime = EaseManager.evaluate(_easeType, reversed ? (_duration - tt) : tt, _duration,
				_easeOvershootOrAmplitude, _easePeriod);
			
			_value.setZero();
			_deltaValue.setZero();
			
			if (_valueSize == 5)
			{
				if (_ended == 0)
				{
					var r:Number = _startValue.w*(1-_normalizedTime);
					var rx:Number = (Math.random()*2-1)*r;
					var ry:Number = (Math.random()*2-1)*r;
					rx = rx > 0 ? Math.ceil(rx) : Math.floor(rx);
					ry = ry > 0 ? Math.ceil(ry) : Math.floor(ry);
					
					_deltaValue.x = rx;
					_deltaValue.y = ry;
					_value.x = _startValue.x + rx;
					_value.y = _startValue.y + ry;
				}
				else
				{
					_value.x = _startValue.x;
					_value.y = _startValue.y;
				}
			}
			else
			{
				for (var i:int = 0; i < _valueSize; i++)
				{
					var n1:Number = _startValue.getField(i);
					var n2:Number = _endValue.getField(i);
					var f:Number =  n1 + (n2-n1)*_normalizedTime;
					if (_snapping)
						f = Math.round(f);
					_deltaValue.setField(i, f - _value.getField(i));
					_value.setField(i, f);
				}
			}
			
			if (_target != null && _propType != null)
			{
				if(_propType is Function)
				{
					switch(_valueSize)
					{
						case 1:
							_propType.call(_target, _value.x);
							break;
						case 2:
							_propType.call(_target, _value.x, _value.y);
							break;
						case 3:
							_propType.call(_target, _value.x, _value.y, _value.z);
							break;
						case 4:
							_propType.call(_target, _value.x, _value.y, _value.z, _value.w);
							break;
						case 5:
							_propType.call(_target, _value.color);
							break;
						case 6:
							_propType.call(_target, _value.x, _value.y);
							break;
					}
				}
				else
				{
					if(_valueSize==5)
						_target[_propType] = _value.color;
					else
						_target[_propType] = _value.x;
				}
			}
			
			callUpdateCallback();
		}
		
		private function callStartCallback():void
		{
			if (_onStart != null)
			{
				if(GTween.catchCallbackExceptions)
				{
					try
					{
						_onStart.call(_onStartCaller, this);
					}
					catch(err:Error)
					{
						trace("FairyGUI: error in start callback > " + err.message);
					}
				}
				else
					_onStart.call(_onStartCaller, this);
			}
		}
		
		private function callUpdateCallback():void
		{
			if (_onUpdate != null)
			{
				if(GTween.catchCallbackExceptions)
				{
					try
					{
						_onUpdate.call(_onUpdateCaller, this);
					}
					catch(err:Error)
					{
						trace("FairyGUI: error in update callback > " + err.message);
					}
				}
				else
					_onUpdate.call(_onUpdateCaller, this);
			}
		}
		
		private function callCompleteCallback():void
		{
			if (_onComplete != null)
			{
				if(GTween.catchCallbackExceptions)
				{
					try
					{
						_onComplete.call(_onCompleteCaller, this);
					}
					catch(err:Error)
					{
						trace("FairyGUI: error in complete callback > " + err.message);
					}
				}
				else
					_onComplete.call(_onCompleteCaller, this);
			}
		}
	}
}