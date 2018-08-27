package fairygui.utils
{
	import laya.utils.Byte;

	public class ByteBuffer extends Byte
	{
		public var stringTable:Vector.<String>;
		public var version:int;
		
		public function ByteBuffer(data:* = null, offset:int=0, length:int=-1)
		{
			if(length==-1)
				length = data.byteLength - offset;
			if(offset==0 && length==data.byteLength)
				super(data);
			else
			{
				this._u8d_ = new Uint8Array(data, offset, length);
				this._d_ = new DataView(this._u8d_.buffer, offset, length);
				_length = length;
			}
			this.endian = Byte.BIG_ENDIAN;
		}
		
		public function skip(count:int):void
		{
			this.pos += count;
		}
		
		public function readBool():Boolean
		{
			return this.getUint8()==1;
		}
		
		public function readS():String
		{
			var index:int = this.getUint16();
			if (index == 65534) //null
				return null;
			else if (index == 65533)
				return ""
			else
				return stringTable[index];
		}
		
		public function writeS(value:String):void
		{
			var index:int = this.getUint16();
			if (index != 65534 && index != 65533)
				stringTable[index] = value;
		}
		
		public function readColor(hasAlpha:Boolean=false):uint
		{
			var r:uint = this.getUint8();
			var g:uint = this.getUint8();
			var b:uint = this.getUint8();
			var a:uint = this.getUint8();
			
			return (hasAlpha?(a<<24):0) + (r<<16) + (g<<8) + b;
		}
		
		public function readColorS(hasAlpha:Boolean=false):String
		{
			var r:uint = this.getUint8();
			var g:uint = this.getUint8();
			var b:uint = this.getUint8();
			var a:uint = this.getUint8();
			
			if(hasAlpha && a!=255)
				return "rgba(" + r + "," + g + "," + b + "," + (a/255) + ")";
			else
			{
				var sr: String = r.toString(16);
				var sg: String = g.toString(16);
				var sb: String = b.toString(16);
				if (sr.length == 1)
					sr = "0" + sr;
				if (sg.length == 1)
					sg = "0" + sg;
				if (sb.length == 1)
					sb = "0" + sb;
				return "#" + sr + sg + sb;
			}
		}
		
		public function readChar():String
		{
			var i:int = this.getUint16();
			return String.fromCharCode(i);
		}
		
		public function readBuffer():ByteBuffer
		{
			var count:int = this.getUint32();
			var ba:ByteBuffer = new ByteBuffer(this.buffer, this._pos_, count);
			ba.stringTable = stringTable;
			ba.version = version;
			return ba;
		}
		
		public function seek(indexTablePos:int, blockIndex:int):Boolean
		{
			var tmp:int = _pos_;
			this.pos = indexTablePos;
			var segCount:int = this.getUint8();
			if (blockIndex < segCount)
			{
				var useShort:Boolean = this.getUint8()==1;
				var newPos:int;
				if (useShort)
				{
					this.pos += 2 * blockIndex;
					newPos = getUint16();
				}
				else
				{
					this.pos += 4 * blockIndex;
					newPos = getUint32();
				}
				
				if (newPos > 0)
				{
					this.pos = indexTablePos + newPos;
					return true;
				}
				else
				{
					this.pos = tmp;
					return false;
				}
			}
			else
			{
				this.pos = tmp;
				return false;
			}
		}
	}
}