package fairygui.display
{
	import fairygui.FillMethod;
	import fairygui.FillOrigin;
	
	public class FillUtils
	{
		static public function fill(w:Number, h:Number, method:int, origin:int, clockwise:Boolean, amount:Number):Array
		{
			if(amount<=0)
				return null;
			else if(amount>=0.9999)
				return [0,0,w,0,w,h,0,h];
			
			var points:Array;
			switch(method)
			{
				case FillMethod.Horizontal:
					points = FillUtils.fillHorizontal(w, h, origin, amount);
					break;
				
				case FillMethod.Vertical:
					points = FillUtils.fillVertical(w, h, origin, amount);
					break;
				
				case FillMethod.Radial90:
					points = FillUtils.fillRadial90(w, h, origin, clockwise, amount);
					break;
				
				case FillMethod.Radial180:
					points = FillUtils.fillRadial180(w, h, origin, clockwise, amount);
					break;
				
				case FillMethod.Radial360:
					points = FillUtils.fillRadial360(w, h, origin, clockwise, amount);
					break;
			}
			return points;
		}
		
		static public function fillHorizontal(w:Number, h:Number, origin:int, amount:Number):Array
		{
			var w2:Number = w*amount;
			if(origin==FillOrigin.Left || origin==FillOrigin.Top)
				return [0,0,w2,0,w2,h,0,h];
			else
				return [w,0,w,h,w-w2,h,w-w2,0];
		}
		
		static public function fillVertical(w:Number, h:Number, origin:int, amount:Number):Array
		{
			var h2:Number = h*amount;
			if(origin==FillOrigin.Left || origin==FillOrigin.Top)
				return [0,0,0,h2,w,h2,w,0];
			else
				return [0,h,w,h,w,h-h2,0,h-h2];
		}
		
		static public function fillRadial90(w:Number, h:Number, origin:int, clockwise:Boolean, amount:Number):Array
		{
			if(clockwise && (origin==FillOrigin.TopRight || origin==FillOrigin.BottomLeft)
				|| !clockwise && (origin==FillOrigin.TopLeft || origin==FillOrigin.BottomRight))
			{
				amount = 1- amount;
			}
			var v:Number, v2:Number, h2:Number;
			v = Math.tan(Math.PI / 2 * amount);
			h2 = w * v;
			v2 = (h2 - h) / h2;
			var points:Array;
			
			switch(origin)
			{
				case FillOrigin.TopLeft:
					if(clockwise)
					{
						if(h2<=h)
							points = [0,0,w,h2,w,0];
						else
							points = [0,0,w*(1-v2),h,w,h,w,0];
					}
					else
					{
						if(h2<=h)
							points = [0,0,w,h2,w,h,0,h];
						else
							points = [0,0,w*(1-v2),h,0,h];	
					}
					break;
				
				case FillOrigin.TopRight:
					if(clockwise)
					{
						if(h2<=h)
							points = [w,0,0,h2,0,h,w,h];
						else
							points = [w,0,w*v2,h,w,h];
					}
					else
					{
						if(h2<=h)
							points = [w,0,0,h2,0,0];
						else
							points = [w,0,w*v2,h,0,h,0,0];
					}
					break;
				
				case FillOrigin.BottomLeft:
					if(clockwise)
					{
						if(h2<=h)
							points = [0,h,w,h-h2,w,0,0,0];
						else
							points = [0,h,w*(1-v2),0,0,0];
					}
					else
					{
						if(h2<=h)
							points = [0,h,w,h-h2,w,h];
						else
							points = [0,h,w*(1-v2),0,w,0,w,h];
					}
					
					break;
				
				case FillOrigin.BottomRight:
					if(clockwise)
					{
						if(h2<=h)
							points = [w,h,0,h-h2,0,h];
						else
							points = [w,h,w*v2,0,0,0,0,h];
					}
					else
					{
						if(h2<=h)
							points = [w,h,0,h-h2,0,0,w,0];
						else
							points = [w,h,w*v2,0,w,0];
					}					
					break;
			}
			return points;
		}
		
		static private function movePoints(points:Array, offsetX:Number, offsetY:Number):void
		{
			var cnt:int = points.length;
			for(var i:int=0;i<cnt;i+=2)
			{
				points[i] += offsetX;
				points[i+1] += offsetY;
			}
		}
		
		static public function fillRadial180(w:Number, h:Number, origin:int, clockwise:Boolean, amount:Number):Array
		{
			var points:Array;
			switch(origin)
			{
				case FillOrigin.Top:
					if(amount<=0.5)
					{
						amount = amount / 0.5;
						points = fillRadial90(w/2, h, 
							clockwise?FillOrigin.TopLeft:FillOrigin.TopRight, 
							clockwise, 
							amount);
						if(clockwise)
							movePoints(points, w/2, 0);
					}
					else
					{
						amount = (amount - 0.5) / 0.5;
						points = fillRadial90(w/2, h, 
							clockwise?FillOrigin.TopRight:FillOrigin.TopLeft, 
							clockwise, 
							amount);
						if(clockwise)
							points.push(w,h,w,0);
						else
						{
							movePoints(points, w/2, 0);
							points.push(0,h,0,0);
						}
						
					}
					break;
				
				case FillOrigin.Bottom:
					if(amount<=0.5)
					{
						amount = amount / 0.5;
						points = fillRadial90(w/2, h, 
							clockwise?FillOrigin.BottomRight:FillOrigin.BottomLeft, 
							clockwise, 
							amount);
						if(!clockwise)
							movePoints(points, w/2, 0);
					}
					else
					{
						amount = (amount - 0.5) / 0.5;
						points = fillRadial90(w/2, h, 
							clockwise?FillOrigin.BottomLeft:FillOrigin.BottomRight, 
							clockwise, 
							amount);
						if(clockwise)
						{
							movePoints(points, w/2, 0);
							points.push(0,0,0,h);
						}
						else
							points.push(w,0,w,h);						
					}
					break;
				
				case FillOrigin.Left:
					if(amount<=0.5)
					{
						amount = amount / 0.5;
						points = fillRadial90(w, h/2, 
							clockwise?FillOrigin.BottomLeft:FillOrigin.TopLeft, 
							clockwise, 
							amount);
						if(!clockwise)
							movePoints(points, 0, h/2);
					}
					else
					{
						amount = (amount - 0.5) / 0.5;
						points = fillRadial90(w, h/2, 
							clockwise?FillOrigin.TopLeft:FillOrigin.BottomLeft, 
							clockwise, 
							amount);
						if(clockwise)
						{
							movePoints(points, 0, h/2);
							points.push(w,0,0,0);
						}
						else
							points.push(w,h,0,h);
					}
					break;
				
				case FillOrigin.Right:
					if(amount<=0.5)
					{
						amount = amount / 0.5;
						points = fillRadial90(w, h/2, 
							clockwise?FillOrigin.TopRight:FillOrigin.BottomRight, 
							clockwise, 
							amount);
						if(clockwise)
							movePoints(points, 0, h/2);
					}
					else
					{
						amount = (amount - 0.5) / 0.5;
						points = fillRadial90(w, h/2, 
							clockwise?FillOrigin.BottomRight:FillOrigin.TopRight, 
							clockwise, 
							amount);
						if(clockwise)
							points.push(0,h,w,h);
						else
						{
							movePoints(points, 0, h/2);
							points.push(0,0,w,0);
						}
					}
					break;
			}
			
			return points;
		}
		
		static public function fillRadial360(w:Number, h:Number, origin:int, clockwise:Boolean, amount:Number):Array
		{
			var points:Array;
			switch(origin)
			{
				case FillOrigin.Top:
					if(amount<=0.5)
					{
						amount = amount / 0.5;
						points = fillRadial180(w/2, h, 
							clockwise?FillOrigin.Left:FillOrigin.Right, 
							clockwise, 
							amount);
						if(clockwise)
							movePoints(points, w/2, 0);
					}
					else
					{
						amount = (amount - 0.5) / 0.5;
						points = fillRadial180(w/2, h, 
							clockwise?FillOrigin.Right:FillOrigin.Left, 
							clockwise, 
							amount);
						if(clockwise)
							points.push(w,h,w,0,w/2,0);
						else
						{
							movePoints(points, w/2, 0);
							points.push(0,h,0,0,w/2,0);
						}
					}
					break;
				
				case FillOrigin.Bottom:
					if(amount<=0.5)
					{
						amount = amount / 0.5;
						points = fillRadial180(w/2, h, 
							clockwise?FillOrigin.Right:FillOrigin.Left, 
							clockwise, 
							amount);
						if(!clockwise)
							movePoints(points, w/2, 0);
					}
					else
					{
						amount = (amount - 0.5) / 0.5;
						points = fillRadial180(w/2, h, 
							clockwise?FillOrigin.Left:FillOrigin.Right, 
							clockwise, 
							amount);
						if(clockwise)
						{
							movePoints(points, w/2, 0);
							points.push(0,0,0,h,w/2,h);
						}
						else
							points.push(w,0,w,h,w/2,h);
					}
					break;
				
				case FillOrigin.Left:
					if(amount<=0.5)
					{
						amount = amount / 0.5;
						points = fillRadial180(w, h/2, 
							clockwise?FillOrigin.Bottom:FillOrigin.Top, 
							clockwise, 
							amount);
						if(!clockwise)
							movePoints(points, 0, h/2);
					}
					else
					{
						amount = (amount - 0.5) / 0.5;
						points = fillRadial180(w, h/2, 
							clockwise?FillOrigin.Top:FillOrigin.Bottom, 
							clockwise, 
							amount);
						if(clockwise)
						{
							movePoints(points, 0, h/2);
							points.push(w,0,0,0,0,h/2);
						}
						else
							points.push(w,h,0,h,0,h/2);
					}
					break;
				
				case FillOrigin.Right:
					if(amount<=0.5)
					{
						amount = amount / 0.5;
						points = fillRadial180(w, h/2, 
							clockwise?FillOrigin.Top:FillOrigin.Bottom, 
							clockwise, 
							amount);
						if(clockwise)
							movePoints(points, 0, h/2);
					}
					else
					{
						amount = (amount - 0.5) / 0.5;
						points = fillRadial180(w, h/2, 
							clockwise?FillOrigin.Bottom:FillOrigin.Top, 
							clockwise, 
							amount);
						if(clockwise)
							points.push(0,h,w,h,w,h/2);
						else
						{
							movePoints(points, 0, h/2);
							points.push(0,0,w,0,w,h/2);
						}
					}
					break;
			}
			
			return points;
		}
	}
}

