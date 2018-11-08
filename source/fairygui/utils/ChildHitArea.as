package fairygui.utils
{
	import laya.display.Sprite;
	import laya.maths.Point;
	import laya.utils.HitArea;

	public class ChildHitArea extends HitArea
	{
		private var _child:Sprite;
		private var _reversed:Boolean;
		
		public function ChildHitArea(child:Sprite, reversed:Boolean)
		{
			_child = child;
			_reversed = reversed;
			
			if(_reversed)
				this.unHit = child.hitArea.hit;
			else
				this.hit = child.hitArea.hit;
		}
		
		override public function isHit(x:Number, y:Number):Boolean { 
			var tPos:Point;
			tPos = Point.TEMP;
			tPos.setTo(0, 0);
			tPos = _child.toParentPoint(tPos);
			if (_reversed) 
				return !isHitGraphic(x-tPos.x,y-tPos.y, unHit);
			else
				return isHitGraphic(x-tPos.x,y-tPos.y, hit);
		}
	}
}