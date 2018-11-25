package fairygui
{
	public class RelationItem
	{
		private var _owner:GObject;
		private var _target:GObject;
		private var _defs:Vector.<RelationDef>;
		private var _targetX:Number;
		private var _targetY:Number;
		private var _targetWidth:Number;
		private var _targetHeight:Number;
		
		public function RelationItem(owner:GObject)
		{
			_owner = owner;
			_defs =  new Vector.<RelationDef>();
		}
		
		final public function get owner():GObject
		{
			return _owner;
		}
		
		public function set target(value:GObject):void
		{
			if(_target!=value)
			{
				if(_target)
					releaseRefTarget(_target);
				_target = value;
				if(_target)
					addRefTarget(_target);
			}
		}
		
		final public function get target():GObject
		{
			return _target;
		}
		
		public function add(relationType:int, usePercent:Boolean):void
		{
			if (relationType == RelationType.Size)
			{
				add(RelationType.Width, usePercent);
				add(RelationType.Height, usePercent);
				return;
			}
			
			var cnt:int = _defs.length;
			for(var i:int=0;i<cnt;i++)
			{
				if (_defs[i].type == relationType)
					return;
			}
			
			internalAdd(relationType, usePercent);
		}
		
		public function internalAdd(relationType:int, usePercent:Boolean):void
		{
			if (relationType == RelationType.Size)
			{
				internalAdd(RelationType.Width, usePercent);
				internalAdd(RelationType.Height, usePercent);
				return;
			}
			
			var info:RelationDef = new RelationDef();
			info.percent = usePercent;
			info.type = relationType;
			info.axis = (relationType <= RelationType.Right_Right || relationType == RelationType.Width || relationType >= RelationType.LeftExt_Left && relationType <= RelationType.RightExt_Right) ? 0 : 1;
			_defs.push(info);
			
			//当使用中线关联时，因为需要除以2，很容易因为奇数宽度/高度造成小数点坐标；当使用百分比时，也会造成小数坐标；
			//所以设置了这类关联的对象，自动启用pixelSnapping
			if (usePercent || relationType == RelationType.Left_Center || relationType == RelationType.Center_Center || relationType == RelationType.Right_Center
				|| relationType == RelationType.Top_Middle || relationType == RelationType.Middle_Middle || relationType == RelationType.Bottom_Middle)
				_owner.pixelSnapping = true;
		}
		
		public function remove(relationType:int):void
		{
			if (relationType == RelationType.Size)
			{
				remove(RelationType.Width);
				remove(RelationType.Height);
				return;
			}
			
			var dc:int = _defs.length;
			for (var k:int = 0; k < dc; k++)
			{
				if (_defs[k].type == relationType)
				{
					_defs.splice(k, 1);
					break;
				}
			}
		}
		
		public function copyFrom(source:RelationItem):void
		{
			this.target = source.target;
			
			_defs.length = 0;
			var cnt:int = source._defs.length;
			for(var i:int=0;i<cnt;i++)
			{
				var info:RelationDef = source._defs[i];
				var info2:RelationDef = new RelationDef();
				info2.copyFrom(info);
				_defs.push(info2);
			}
		}
		
		public function dispose():void
		{
			if (_target != null)
			{
				releaseRefTarget(_target);
				_target = null;
			}
		}
		
		final public function get isEmpty():Boolean
		{
			return _defs.length == 0;
		}
		
		public function applyOnSelfResized(dWidth:Number, dHeight:Number, applyPivot:Boolean):void
		{
			var cnt:int = _defs.length;
			if(cnt==0)
				return;
			
			var ox:Number = _owner.x;
			var oy:Number = _owner.y;
			
			for (var i:int = 0; i < cnt; i++)
			{
				var info:RelationDef = _defs[i];
				switch (info.type)
				{
					case RelationType.Center_Center:
						_owner.x -= (0.5 - (applyPivot ? _owner.pivotX : 0)) * dWidth;
						break;
					
					case RelationType.Right_Center:
					case RelationType.Right_Left:
					case RelationType.Right_Right:
						_owner.x -= (1 - (applyPivot ? _owner.pivotX : 0)) * dWidth;
						break;
					
					case RelationType.Middle_Middle:
						_owner.y -= (0.5 - (applyPivot ? _owner.pivotY : 0)) * dHeight;
						break;
					
					case RelationType.Bottom_Middle:
					case RelationType.Bottom_Top:
					case RelationType.Bottom_Bottom:
						_owner.y -= (1 - (applyPivot ? _owner.pivotY : 0)) * dHeight;
						break;
				}
			}
			
			if (ox!=_owner.x || oy!=_owner.y)
			{
				ox = _owner.x - ox;
				oy = _owner.y - oy;
				
				_owner.updateGearFromRelations(1, ox, oy);
				
				if (_owner.parent != null && _owner.parent._transitions.length > 0)
				{
					cnt = _owner.parent._transitions.length;
					for(var j:int=0;j<cnt;j++)
					{
						var trans:Transition = _owner.parent._transitions[j];
						trans.updateFromRelations(_owner.id, ox, oy);
					}
				}
			}
		}
		
		private function applyOnXYChanged(info:RelationDef, dx:Number, dy:Number):void
		{
			var tmp:Number;
			switch (info.type)
			{
				case RelationType.Left_Left:
				case RelationType.Left_Center:
				case RelationType.Left_Right:
				case RelationType.Center_Center:
				case RelationType.Right_Left:
				case RelationType.Right_Center:
				case RelationType.Right_Right:
					_owner.x += dx;
					break;
				
				case RelationType.Top_Top:
				case RelationType.Top_Middle:
				case RelationType.Top_Bottom:
				case RelationType.Middle_Middle:
				case RelationType.Bottom_Top:
				case RelationType.Bottom_Middle:
				case RelationType.Bottom_Bottom:
					_owner.y += dy;
					break;
				
				case RelationType.Width:
				case RelationType.Height:
					break;
				
				case RelationType.LeftExt_Left:
				case RelationType.LeftExt_Right:
					tmp = _owner.xMin;
					_owner.width = _owner._rawWidth - dx;
					_owner.xMin = tmp + dx;
					break;
				
				case RelationType.RightExt_Left:
				case RelationType.RightExt_Right:
					tmp = _owner.xMin;
					_owner.width = _owner._rawWidth + dx;
					_owner.xMin = tmp;
					break;
				
				case RelationType.TopExt_Top:
				case RelationType.TopExt_Bottom:
					tmp = _owner.yMin;
					_owner.height = _owner._rawHeight - dy;
					_owner.yMin = tmp + dy;
					break;
				
				case RelationType.BottomExt_Top:
				case RelationType.BottomExt_Bottom:
					tmp = _owner.yMin;
					_owner.height = _owner._rawHeight + dy;
					_owner.yMin = tmp;
					break;
			}
		}
		
		private function applyOnSizeChanged(info:RelationDef):void
		{
			var pos:Number = 0, pivot:Number = 0, delta:Number = 0;
			var v:Number, tmp:Number;
			
			if (info.axis == 0)
			{
				if (_target != _owner.parent)
				{
					pos = _target.x;
					if (_target.pivotAsAnchor)
						pivot = _target.pivotX;
				}
				
				if (info.percent)
				{
					if (_targetWidth != 0)
						delta = _target._width / _targetWidth;
				}
				else
					delta = _target._width - _targetWidth;
			}
			else
			{
				if (_target != _owner.parent)
				{
					pos = _target.y;
					if (_target.pivotAsAnchor)
						pivot = _target.pivotY;
				}
				
				if (info.percent)
				{
					if (_targetHeight != 0)
						delta = _target._height / _targetHeight;
				}
				else
					delta = _target._height - _targetHeight;
			}
			
			switch (info.type)
			{
				case RelationType.Left_Left:
					if (info.percent)
						_owner.xMin = pos + (_owner.xMin - pos) * delta;
					else if (pivot != 0)
						_owner.x += delta * (-pivot);
					break;
				case RelationType.Left_Center:
					if (info.percent)
						_owner.xMin = pos + (_owner.xMin - pos) * delta;
					else
						_owner.x += delta * (0.5 - pivot);
					break;
				case RelationType.Left_Right:
					if (info.percent)
						_owner.xMin = pos + (_owner.xMin - pos) * delta;
					else
						_owner.x += delta * (1 - pivot);
					break;
				case RelationType.Center_Center:
					if (info.percent)
						_owner.xMin = pos + (_owner.xMin + _owner._rawWidth * 0.5 - pos) * delta - _owner._rawWidth * 0.5;
					else
						_owner.x += delta * (0.5 - pivot);
					break;
				case RelationType.Right_Left:
					if (info.percent)
						_owner.xMin = pos + (_owner.xMin + _owner._rawWidth - pos) * delta - _owner._rawWidth;
					else if (pivot != 0)
						_owner.x += delta * (-pivot);
					break;
				case RelationType.Right_Center:
					if (info.percent)
						_owner.xMin = pos + (_owner.xMin + _owner._rawWidth - pos) * delta - _owner._rawWidth;
					else
						_owner.x += delta * (0.5 - pivot);
					break;
				case RelationType.Right_Right:
					if (info.percent)
						_owner.xMin = pos + (_owner.xMin + _owner._rawWidth - pos) * delta - _owner._rawWidth;
					else
						_owner.x += delta * (1 - pivot);
					break;
				
				case RelationType.Top_Top:
					if (info.percent)
						_owner.yMin = pos + (_owner.yMin - pos) * delta;
					else if (pivot != 0)
						_owner.y += delta * (-pivot);
					break;
				case RelationType.Top_Middle:
					if (info.percent)
						_owner.yMin = pos + (_owner.yMin - pos) * delta;
					else
						_owner.y += delta * (0.5 - pivot);
					break;
				case RelationType.Top_Bottom:
					if (info.percent)
						_owner.yMin = pos + (_owner.yMin - pos) * delta;
					else
						_owner.y += delta * (1 - pivot);
					break;
				case RelationType.Middle_Middle:
					if (info.percent)
						_owner.yMin = pos + (_owner.yMin + _owner._rawHeight * 0.5 - pos) * delta - _owner._rawHeight * 0.5;
					else
						_owner.y += delta * (0.5 - pivot);
					break;
				case RelationType.Bottom_Top:
					if (info.percent)
						_owner.yMin = pos + (_owner.yMin + _owner._rawHeight - pos) * delta - _owner._rawHeight;
					else if (pivot != 0)
						_owner.y += delta * (-pivot);
					break;
				case RelationType.Bottom_Middle:
					if (info.percent)
						_owner.yMin = pos + (_owner.yMin + _owner._rawHeight - pos) * delta - _owner._rawHeight;
					else
						_owner.y += delta * (0.5 - pivot);
					break;
				case RelationType.Bottom_Bottom:
					if (info.percent)
						_owner.yMin = pos + (_owner.yMin + _owner._rawHeight - pos) * delta - _owner._rawHeight;
					else
						_owner.y += delta * (1 - pivot);
					break;
				
				case RelationType.Width:
					if (_owner._underConstruct && _owner == _target.parent)
						v = _owner.sourceWidth - _target.initWidth;
					else
						v = _owner._rawWidth - _targetWidth;
					if (info.percent)
						v = v * delta;
					if (_target == _owner.parent)
					{
						if (_owner.pivotAsAnchor)
						{
							tmp = _owner.xMin;
							_owner.setSize(_target._width + v, _owner._rawHeight, true);
							_owner.xMin = tmp;
						}
						else
							_owner.setSize(_target._width + v, _owner._rawHeight, true);
					}
					else
						_owner.width = _target._width + v;
					break;
				case RelationType.Height:
					if (_owner._underConstruct && _owner == _target.parent)
						v = _owner.sourceHeight - _target.initHeight;
					else
						v = _owner._rawHeight - _targetHeight;
					if (info.percent)
						v = v * delta;
					if (_target == _owner.parent)
					{
						if (_owner.pivotAsAnchor)
						{
							tmp = _owner.yMin;
							_owner.setSize(_owner._rawWidth, _target._height + v, true);
							_owner.yMin = tmp;
						}
						else
							_owner.setSize(_owner._rawWidth, _target._height + v, true);
					}
					else
						_owner.height = _target._height + v;
					break;
				
				case RelationType.LeftExt_Left:
					tmp = _owner.xMin;
					if (info.percent)
						v = pos + (tmp - pos) * delta - tmp;
					else
						v = delta * (-pivot);
					_owner.width = _owner._rawWidth - v;
					_owner.xMin = tmp + v;
					break;
				case RelationType.LeftExt_Right:
					tmp = _owner.xMin;
					if (info.percent)
						v = pos + (tmp - pos) * delta - tmp;
					else
						v = delta * (1 - pivot);
					_owner.width = _owner._rawWidth - v;
					_owner.xMin = tmp + v;
					break;
				case RelationType.RightExt_Left:
					tmp = _owner.xMin;
					if (info.percent)
						v = pos + (tmp + _owner._rawWidth - pos) * delta - (tmp + _owner._rawWidth);
					else
						v = delta * (-pivot);
					_owner.width = _owner._rawWidth + v;
					_owner.xMin = tmp;
					break;
				case RelationType.RightExt_Right:
					tmp = _owner.xMin;
					if (info.percent)
					{
						if (_owner == _target.parent)
						{
							if (_owner._underConstruct)
								_owner.width = pos + _target._width - _target._width * pivot +
									(_owner.sourceWidth - pos - _target.initWidth + _target.initWidth * pivot) * delta;
							else
								_owner.width = pos + (_owner._rawWidth - pos) * delta;
						}
						else
						{
							v = pos + (tmp + _owner._rawWidth - pos) * delta - (tmp + _owner._rawWidth);
							_owner.width = _owner._rawWidth + v;
							_owner.xMin = tmp;
						}
					}
					else
					{
						if (_owner == _target.parent)
						{
							if (_owner._underConstruct)
								_owner.width = _owner.sourceWidth + (_target._width - _target.initWidth) * (1 - pivot);
							else
								_owner.width = _owner._rawWidth + delta * (1 - pivot);
						}
						else
						{
							v = delta * (1 - pivot);
							_owner.width = _owner._rawWidth + v;
							_owner.xMin = tmp;
						}
					}
					break;
				case RelationType.TopExt_Top:
					tmp = _owner.yMin;
					if (info.percent)
						v = pos + (tmp - pos) * delta - tmp;
					else
						v = delta * (-pivot);
					_owner.height = _owner._rawHeight - v;
					_owner.yMin = tmp + v;
					break;
				case RelationType.TopExt_Bottom:
					tmp = _owner.yMin;
					if (info.percent)
						v = pos + (tmp - pos) * delta - tmp;
					else
						v = delta * (1 - pivot);
					_owner.height = _owner._rawHeight - v;
					_owner.yMin = tmp + v;
					break;
				case RelationType.BottomExt_Top:
					tmp = _owner.yMin;
					if (info.percent)
						v = pos + (tmp + _owner._rawHeight - pos) * delta - (tmp + _owner._rawHeight);
					else
						v = delta * (-pivot);
					_owner.height = _owner._rawHeight + v;
					_owner.yMin = tmp;
					break;
				case RelationType.BottomExt_Bottom:
					tmp = _owner.yMin;
					if (info.percent)
					{
						if (_owner == _target.parent)
						{
							if (_owner._underConstruct)
								_owner.height = pos + _target._height - _target._height * pivot +
									(_owner.sourceHeight - pos - _target.initHeight + _target.initHeight * pivot) * delta;
							else
								_owner.height = pos + (_owner._rawHeight - pos) * delta;
						}
						else
						{
							v = pos + (tmp + _owner._rawHeight - pos) * delta - (tmp + _owner._rawHeight);
							_owner.height = _owner._rawHeight + v;
							_owner.yMin = tmp;
						}
					}
					else
					{
						if (_owner == _target.parent)
						{
							if (_owner._underConstruct)
								_owner.height = _owner.sourceHeight + (_target._height - _target.initHeight) * (1 - pivot);
							else
								_owner.height = _owner._rawHeight + delta * (1 - pivot);
						}
						else
						{
							v = delta * (1 - pivot);
							_owner.height = _owner._rawHeight + v;
							_owner.yMin = tmp;
						}
					}
					break;
			}
		}
		
		private function addRefTarget(target:GObject):void
		{
			if (target != this._owner.parent)
				target.on(Events.XY_CHANGED, this, this.__targetXYChanged);
			target.on(Events.SIZE_CHANGED, this, this.__targetSizeChanged);
			target.on(Events.SIZE_DELAY_CHANGE, this, this.__targetSizeWillChange);
			
			_targetX = _target.x;
			_targetY = _target.y;
			_targetWidth = _target._width;
			_targetHeight = _target._height;
		}
		
		private function releaseRefTarget(target:GObject):void
		{
			if(target.displayObject==null)
				return;
			
			target.off(Events.XY_CHANGED, this, this.__targetXYChanged);
			target.off(Events.SIZE_CHANGED, this, this.__targetSizeChanged);
			target.off(Events.SIZE_DELAY_CHANGE, this, this.__targetSizeWillChange);
		}
		
		private function __targetXYChanged(target:GObject):void
		{
			if (_owner.relations.handling!=null || _owner.group!=null && _owner.group._updating)
			{
				_targetX = _target.x;
				_targetY = _target.y;
				return;
			}
			
			_owner.relations.handling = target;
			
			var ox:Number = _owner.x;
			var oy:Number = _owner.y;
			var dx:Number = _target.x-_targetX;
			var dy:Number = _target.y-_targetY;
			var cnt:int = _defs.length;
			for(var i:int=0;i<cnt;i++)
			{
				applyOnXYChanged(_defs[i], dx, dy);
			}
			_targetX = _target.x;
			_targetY = _target.y;
			
			if (ox!=_owner.x || oy!=_owner.y)
			{
				ox = _owner.x - ox;
				oy = _owner.y - oy;
				
				_owner.updateGearFromRelations(1, ox, oy);
				
				if (_owner.parent != null && _owner.parent._transitions.length > 0)
				{
					cnt = _owner.parent._transitions.length;
					for(var j:int=0;j<cnt;j++)
					{
						var trans:Transition = _owner.parent._transitions[j];
						trans.updateFromRelations(_owner.id, ox, oy);
					}
				}
			}
			
			_owner.relations.handling = null;
		}
		
		private function __targetSizeChanged(target:GObject):void
		{
			if (_owner.relations.handling!=null)
			{
				_targetWidth = _target._width;
				_targetHeight = _target._height;
				return;
			}
			
			_owner.relations.handling = target;
			
			var ox:Number = _owner.x;
			var oy:Number = _owner.y;
			var ow:Number = _owner._rawWidth;
			var oh:Number = _owner._rawHeight;
			var cnt:int = _defs.length;
			for(var i:int=0;i<cnt;i++)
			{
				applyOnSizeChanged(_defs[i]);
			}
			_targetWidth = _target._width;
			_targetHeight = _target._height;
			
			if (ox!=_owner.x || oy!=_owner.y)
			{
				ox = _owner.x - ox;
				oy = _owner.y - oy;
				
				_owner.updateGearFromRelations(1, ox, oy);
				
				if (_owner.parent != null && _owner.parent._transitions.length > 0)
				{
					cnt = _owner.parent._transitions.length;
					for(var j:int=0;j<cnt;j++)
					{
						var trans:Transition = _owner.parent._transitions[j];
						trans.updateFromRelations(_owner.id, ox, oy);
					}
				}
			}
			
			if (ow!=_owner._rawWidth || oh!=_owner._rawHeight)
			{
				ow = _owner._rawWidth - ow;
				oh = _owner._rawHeight - oh;
				
				_owner.updateGearFromRelations(2, ow, oh);
			}
			
			_owner.relations.handling = null;
		}
		
		private function __targetSizeWillChange(target:GObject):void
		{
			_owner.relations.sizeDirty = true;
		}
	}
}

class RelationDef
{
	public var percent:Boolean;
	public var type:int;
	public var axis:int;
	
	public function RelationDef()
	{
	}
	
	public function copyFrom(source:RelationDef):void
	{
		this.percent = source.percent;
		this.type = source.type;
		this.axis = source.axis;
	}
}
