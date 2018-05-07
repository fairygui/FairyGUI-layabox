package fairygui
{
	
	
	public class GGroup extends GObject
	{
		private var _layout:int;
		private var _lineGap:int;
		private var _columnGap:int;
		private var _percentReady:Boolean;
		private var _boundsChanged:Boolean;
		
		public var _updating:int;
		
		public function GGroup()
		{
		}
		
		final public function get layout():int
		{
			return _layout;
		}
		
		final public function set layout(value:int):void
		{
			if(_layout != value)
			{
				_layout = value;
				setBoundsChangedFlag(true);
			}
		}
		
		final public function get lineGap():int
		{
			return _lineGap;
		}
		
		final public function set lineGap(value:int):void
		{
			if(_lineGap != value)
			{
				_lineGap = value;
				setBoundsChangedFlag();
			}
		}
		
		final public function get columnGap():int
		{
			return _columnGap;
		}
		
		final public function set columnGap(value:int):void
		{
			if(_columnGap != value)
			{
				_columnGap = value;
				setBoundsChangedFlag();
			}
		}
		
		public function setBoundsChangedFlag(childSizeChanged:Boolean = false):void
		{
			if (_updating == 0 && parent != null)
			{
				if (childSizeChanged)
					_percentReady = false;
				
				if(!_boundsChanged)
				{			
					_boundsChanged = true;
					if(_layout!=GroupLayoutType.None)
						Laya.timer.callLater(this, ensureBoundsCorrect);
				}
			}
		}
		
		public function ensureBoundsCorrect():void
		{
			if (_boundsChanged)
				updateBounds();
		}
		
		private function updateBounds():void
		{
			Laya.timer.clear(this, ensureBoundsCorrect);
			_boundsChanged = false;
			
			if (parent == null)
				return;
			
			handleLayout();
			
			var cnt:int = _parent.numChildren;
			var i:int;
			var child:GObject;
			var ax:int=Number.MAX_VALUE, ay:int=Number.MAX_VALUE;
			var ar:int = Number.MIN_VALUE, ab:int = Number.MIN_VALUE;
			var tmp:int;
			var empty:Boolean = true;
			for(i=0;i<cnt;i++)
			{
				child = _parent.getChildAt(i);
				if(child.group==this)
				{
					tmp = child.x;
					if(tmp<ax)
						ax = tmp;
					tmp = child.y;
					if(tmp<ay)
						ay = tmp;
					tmp = child.x + child.width;
					if(tmp>ar)
						ar = tmp;
					tmp = child.y + child.height;
					if(tmp>ab)
						ab = tmp;
					empty = false;
				}
			}
			
			if (!empty)
			{
				_updating = 1;
				setXY(ax, ay);
				_updating = 2;
				setSize(ar - ax, ab - ay);
			}
			else
			{
				_updating = 2;
				setSize(0, 0);
			}
			
			_updating = 0;
		}
		
		private function handleLayout():void
		{
			_updating |= 1;
			
			var child:GObject;
			var i:int;
			var cnt:int;
			
			if (_layout == GroupLayoutType.Horizontal)
			{
				var curX:Number = NaN;
				cnt = parent.numChildren;
				for (i = 0; i < cnt; i++)
				{
					child = parent.getChildAt(i);
					if (child.group != this)
						continue;
					
					if (isNaN(curX))
						curX = Math.floor(child.x);
					else
						child.x = curX;
					if (child.width != 0)
						curX += Math.floor(child.width + _columnGap);
				}
				if (!_percentReady)
					updatePercent();
			}
			else if (_layout == GroupLayoutType.Vertical)
			{
				var curY:Number = NaN;
				cnt = parent.numChildren;
				for (i = 0; i < cnt; i++)
				{
					child = parent.getChildAt(i);
					if (child.group != this)
						continue;
					
					if (isNaN(curY))
						curY = Math.floor(child.y);
					else
						child.y = curY;
					if (child.height != 0)
						curY += Math.floor(child.height + _lineGap);
				}
				if (!_percentReady)
					updatePercent();
			}
			
			_updating &= 2;
		}
		
		private function updatePercent():void
		{
			_percentReady = true;
			
			var cnt:int = parent.numChildren;
			var i:int;
			var child:GObject;
			var size:Number = 0;
			if (_layout == GroupLayoutType.Horizontal)
			{
				for (i = 0; i < cnt; i++)
				{
					child = parent.getChildAt(i);
					if (child.group != this)
						continue;
					
					size += child.width;
				}
				
				for (i = 0; i < cnt; i++)
				{
					child = parent.getChildAt(i);
					if (child.group != this)
						continue;
					
					if (size > 0)
						child._sizePercentInGroup = child.width / size;
					else
						child._sizePercentInGroup = 0;
				}
			}
			else
			{
				for (i = 0; i < cnt; i++)
				{
					child = parent.getChildAt(i);
					if (child.group != this)
						continue;
					
					size += child.height;
				}
				
				for (i = 0; i < cnt; i++)
				{
					child = parent.getChildAt(i);
					if (child.group != this)
						continue;
					
					if (size > 0)
						child._sizePercentInGroup = child.height / size;
					else
						child._sizePercentInGroup = 0;
				}
			}
		}
		
		internal function moveChildren(dx:Number, dy:Number):void
		{
			if ((_updating & 1) != 0 || parent == null)
				return;
			
			_updating |= 1;
			
			var cnt:int = parent.numChildren;
			var i:int
			var child:GObject;
			for (i = 0; i < cnt; i++)
			{
				child = parent.getChildAt(i);
				if (child.group == this)
				{
					child.setXY(child.x + dx, child.y + dy);
				}
			}
			
			_updating &= 2;
		}
		
		internal function resizeChildren(dw:Number, dh:Number):void
		{
			if (_layout == GroupLayoutType.None || (_updating & 2) != 0 || parent == null)
				return;
			
			_updating |= 2;
			
			if (!_percentReady)
				updatePercent();
			
			var cnt:int = parent.numChildren;
			var i:int;
			var j:int;
			var child:GObject;
			var last:int = -1;
			var numChildren:int = 0;
			var lineSize:Number = 0;
			var remainSize:Number = 0;
			var found:Boolean = false;
			
			for (i = 0; i < cnt; i++)
			{
				child = parent.getChildAt(i);
				if (child.group != this)
					continue;
				
				last = i;
				numChildren++;
			}
			
			if (_layout == GroupLayoutType.Horizontal)
			{
				remainSize = lineSize = this.width - (numChildren - 1) * _columnGap;
				var curX:Number = NaN;
				var nw:Number;
				for (i = 0; i < cnt; i++)
				{
					child = parent.getChildAt(i);
					if (child.group != this)
						continue;
					
					if (isNaN(curX))
						curX = Math.floor(child.x);
					else
						child.x = curX;
					if (last == i)
						nw = remainSize;
					else
						nw = Math.round(child._sizePercentInGroup * lineSize);
					child.setSize(nw, child._rawHeight + dh, true);
					remainSize -= child.width;
					if (last == i)
					{
						if (remainSize >= 1) //可能由于有些元件有宽度限制，导致无法铺满
						{
							for (j = 0; j <= i; j++)
							{
								child = parent.getChildAt(j);
								if (child.group != this)
									continue;
								
								if (!found)
								{
									nw = child.width + remainSize;
									if ((child.maxWidth == 0 || nw < child.maxWidth)
										&& (child.minWidth == 0 || nw > child.minWidth))
									{
										child.setSize(nw, child.height, true);
										found = true;
									}
								}
								else
									child.x += remainSize;
							}
						}
					}
					else
						curX += (child.width + _columnGap);
				}
			}
			else if (_layout == GroupLayoutType.Vertical)
			{
				remainSize = lineSize = this.height - (numChildren - 1) * _lineGap;
				var curY:Number = NaN;
				var nh:Number;
				for (i = 0; i < cnt; i++)
				{
					child = parent.getChildAt(i);
					if (child.group != this)
						continue;
					
					if (isNaN(curY))
						curY = Math.floor(child.y);
					else
						child.y = curY;
					if (last == i)
						nh = remainSize;
					else
						nh = Math.round(child._sizePercentInGroup * lineSize);
					child.setSize(child._rawWidth + dw, nh, true);
					remainSize -= child.height;
					if (last == i)
					{
						if (remainSize >= 1) //可能由于有些元件有宽度限制，导致无法铺满
						{
							for (j = 0; j <= i; j++)
							{
								child = parent.getChildAt(j);
								if (child.group != this)
									continue;
								
								if (!found)
								{
									nh = child.height + remainSize;
									if ((child.maxHeight == 0 || nh < child.maxHeight)
										&& (child.minHeight == 0 || nh > child.minHeight))
									{
										child.setSize(child.width, nh, true);
										found = true;
									}
								}
								else
									child.y += remainSize;
							}
						}
					}
					else
						curY += (child.height + _lineGap);
				}
			}
			
			_updating &= 1;
		}
		
		override protected function handleAlphaChanged():void
		{
			if(this._underConstruct)
				return;
			
			var cnt:int = _parent.numChildren;
			for(var i:int =0;i<cnt;i++)
			{
				var child:GObject = _parent.getChildAt(i);
				if(child.group==this)
					child.alpha = this.alpha;
			}
		}
		
		override public function handleVisibleChanged():void
		{
			if(!_parent)
				return;
			
			var cnt:int = _parent.numChildren;
			for(var i:int =0;i<cnt;i++)
			{
				var child:GObject = _parent.getChildAt(i);
				if(child.group==this)
					child.handleVisibleChanged();
			}
		}
		
		override public function setup_beforeAdd(xml:Object):void
		{
			super.setup_beforeAdd(xml);
			
			var str:String;
			
			str = xml.getAttribute("layout");
			if (str != null)
			{
				_layout = GroupLayoutType.parse(str);
				str = xml.getAttribute("lineGap");
				if(str)
					_lineGap = parseInt(str);
				str = xml.getAttribute("colGap");
				if(str)
					_columnGap = parseInt(str);
			}
		}
		
		override public function setup_afterAdd(xml:Object):void
		{
			super.setup_afterAdd(xml);
			
			if(!this.visible)
				handleVisibleChanged();
		}
	}
}