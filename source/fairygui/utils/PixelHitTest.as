package fairygui.utils
{
	import laya.utils.HitArea;
	
	public class PixelHitTest extends HitArea
	{
		private var _data:PixelHitTestData;
		
		public var offsetX:int;
		public var offsetY:int;
		public var scaleX:Number;		
		public var scaleY:Number;	
		
		public function PixelHitTest(data:PixelHitTestData, offsetX:int=0, offsetY:int=0)
		{
			_data = data;
			this.offsetX = offsetX;
			this.offsetY = offsetY;
			
			scaleX = 1;
			scaleY = 1;
		}
		
		override public function contains(x:Number, y:Number):Boolean
		{
			x = Math.floor((x / scaleX - offsetX) * _data.scale);
			y = Math.floor((y / scaleY - offsetY) * _data.scale);
			if (x < 0 || y < 0 || x >= _data.pixelWidth)
				return false;
			
			var pos:int = y * _data.pixelWidth + x;
			var pos2:int = Math.floor(pos / 8);
			var pos3:int = pos % 8;
			
			if (pos2 >= 0 && pos2 < _data.pixels.length)
				return ((_data.pixels[pos2] >> pos3) & 0x1) == 1;
			else
				return false;
		}
	}
}