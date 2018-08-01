package fairygui.tween
{
	public class TweenValue
	{
		public var x:Number;
		public var y:Number;
		public var z:Number;
		public var w:Number;
		
		public function TweenValue()
		{
			x = y = z = w = 0;
		}
		
		public function get color():uint
		{
			return (w<<24) + (x<<16) + (y<<8) + z;
		}
		
		public function set color(value:uint):void
		{
			x = (value & 0xFF0000)>>16;
			y = (value & 0x00FF00)>>8;
			z = (value & 0x0000FF);
			w = (value & 0xFF000000)>>24;
		}
		
		public function getField(index:int):Number
		{
			switch (index)
			{
				case 0:
					return x;
				case 1:
					return y;
				case 2:
					return z;
				case 3:
					return w;
				default:
					throw new Error("Index out of bounds: " + index);
			}
		}
		
		public function setField(index:int, value:Number):void
		{
			switch (index)
			{
				case 0:
					x = value;
					break;
				case 1:
					y = value;
					break;
				case 2:
					z = value;
					break;
				case 3:
					w = value;
					break;
				default:
					throw new Error("Index out of bounds: " + index);
			}
		}
		
		public function setZero():void
		{
			x = y = z = w = 0;
		}
	}
}