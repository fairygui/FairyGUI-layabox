package fairygui
{
	import fairygui.utils.ByteBuffer;
	
	import laya.utils.Utils;
	
	public class TranslationHelper
	{
		public static var strings: Object = null;
		
		public function TranslationHelper()
		{
		}
		
		public static function loadFromXML(source:String):void	{
			strings = {};
			
			var xml:Object = Utils.parseXMLFromString(source);
			var resNode:Object = findChildNode(xml, "resources");			
			var nodes: Array = resNode.childNodes;
			var length1: Number = nodes.length;			
			for (var i1: Number = 0; i1 < length1; i1++) {
				var cxml: Object = nodes[i1];
				if (cxml.nodeName == "string") {
					var key:String = cxml.getAttribute("name");
					var text:String = cxml.textContent;
					var i:int = key.indexOf("-");
					if(i==-1)
						continue;
					
					var key2:String = key.substr(0, i);
					var key3:String = key.substr(i+1);
					var col:Object = strings[key2];
					if(!col) {
						col = {};
						strings[key2] = col;
					}
					col[key3] = text;
				}
			}
		}
		
		public static function translateComponent(item:PackageItem):void {
			if(strings==null)
				return;
			
			var compStrings:Object = strings[item.owner.id + item.id];
			if(compStrings==null)
				return;
			
			var elementId:String, value:String;
			var buffer:ByteBuffer = item.rawData;
			var nextPos:int;
			var itemCount:int;
			var i:int, j:int, k:int;
			var dataLen:int;
			var curPos:int;
			var valueCnt:int;
			var page:String;
			
			buffer.seek(0, 2);
			
			var childCount:int = buffer.getInt16();
			for (i = 0; i < childCount; i++)
			{
				dataLen = buffer.getInt16();
				curPos = buffer.pos;
				
				buffer.seek(curPos, 0);
				
				var type:int = buffer.readByte();
				buffer.skip(4);
				elementId = buffer.readS();
				
				if (type == ObjectType.Component)
				{
					if (buffer.seek(curPos, 6))
						type = buffer.readByte();
				}
				
				buffer.seek(curPos, 1);
				
				if((value = compStrings[elementId + "-tips"])!=null)
					buffer.writeS(value);
				
				buffer.seek(curPos, 2);
				
				var gearCnt:int = buffer.getInt16();
				for (j = 0; j < gearCnt; j++)
				{
					nextPos = buffer.getInt16();
					nextPos += buffer.pos;
					
					if (buffer.readByte() == 6) //gearText
					{
						buffer.skip(2);//controller
						valueCnt = buffer.getInt16();
						for (k = 0; k < valueCnt; k++)
						{
							page = buffer.readS();
							if (page != null)
							{
								if((value=compStrings[elementId + "-texts_" + k])!=null)
									buffer.writeS(value);
								else
									buffer.skip(2);
							}
						}
						
						if (buffer.readBool() && (value=compStrings[elementId + "-texts_def"])!=null)
							buffer.writeS(value);
					}
					
					buffer.pos = nextPos;
				}
				
				switch (type)
				{
					case ObjectType.Text:
					case ObjectType.RichText:
					case ObjectType.InputText:
					{
						if ((value=compStrings[elementId])!=null)
						{
							buffer.seek(curPos, 6);
							buffer.writeS(value);
						}
						if ((value=compStrings[elementId + "-prompt"])!=null)
						{
							buffer.seek(curPos, 4);
							buffer.writeS(value);
						}
						break;
					}
						
					case ObjectType.List:
					{
						buffer.seek(curPos, 8);
						buffer.skip(2);
						itemCount = buffer.getInt16();
						for (j = 0; j<itemCount; j++)
						{
							nextPos = buffer.getInt16();
							nextPos += buffer.pos;
							
							buffer.skip(2); //url
							if ((value=compStrings[elementId + "-" + j])!=null)
								buffer.writeS(value);
							else
								buffer.skip(2);
							if ((value=compStrings[elementId + "-" + j+"-0"])!=null)
								buffer.writeS(value);
							buffer.pos = nextPos;
						}
						break;
					}
						
					case ObjectType.Label:
					{
						if (buffer.seek(curPos, 6) && buffer.readByte() == type)
						{
							if ((value=compStrings[elementId])!=null)
								buffer.writeS(value);
							else
								buffer.skip(2);
							
							buffer.skip(2);
							if (buffer.readBool())
								buffer.skip(4);
							buffer.skip(4);
							if (buffer.readBool() && (value=compStrings[elementId + "-prompt"])!=null)
								buffer.writeS(value);
						}
						break;
					}
						
					case ObjectType.Button:
					{
						if (buffer.seek(curPos, 6) && buffer.readByte() == type)
						{
							if ((value=compStrings[elementId])!=null)
								buffer.writeS(value);
							else
								buffer.skip(2);
							if ((value=compStrings[elementId + "-0"])!=null)
								buffer.writeS(value);
						}
						break;
					}
						
					case ObjectType.ComboBox:
					{
						if (buffer.seek(curPos, 6) && buffer.readByte() == type)
						{
							itemCount = buffer.getInt16();
							for (j = 0; j < itemCount; j++)
							{
								nextPos = buffer.getInt16();
								nextPos += buffer.pos;
								
								if ((value=compStrings[elementId + "-" + j])!=null)
									buffer.writeS(value);
								
								buffer.pos = nextPos;
							}
							
							if ((value=compStrings[elementId])!=null)
								buffer.writeS(value);
						}
						
						break;
					}
				}
				
				buffer.pos = curPos + dataLen;
			}
		}
		
		private static function findChildNode(xml: Object, name: String): Object {
			var col: Array = xml.childNodes;
			var length1: Number = col.length;
			if (length1>0) {
				for (var i1: Number = 0; i1 < length1; i1++) {
					var cxml: Object = col[i1];
					if (cxml.nodeName == name) {
						return cxml;
					}
				}
			}
			
			return null;
		}
	}
}