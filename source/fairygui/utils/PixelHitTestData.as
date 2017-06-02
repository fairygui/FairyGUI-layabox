package fairygui.utils
{
	import laya.utils.Byte;
	
	public class PixelHitTestData
	{
		public var pixelWidth:int;
		public var scale:Number;		
		public var pixels:Vector.<int>;
		
		public function PixelHitTestData()
		{
		}
		
		public function load(ba:Byte):void
		{
			ba.getInt32();
			pixelWidth = ba.getInt32();
			scale = 1/ba.readByte();
			var len:int = ba.getInt32();
			pixels = new Vector.<int>(len);
			for(var i:int=0;i<len;i++)
			{
				var j:int = ba.readByte();
				if(j<0)
					j+=256;
				
				pixels[i] = j;
			}
		}
	}
}