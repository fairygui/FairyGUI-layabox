package fairygui.gears {
	
	public interface IAnimationGear {
		function get playing(): Boolean;
		function set playing(value:Boolean):void;
		
		function get frame(): Number;
		function set frame(value:Number):void;
		
		function get timeScale():Number;
		function set timeScale(value:Number):void;
		
		function advance(timeInMiniseconds:int):void;
	}
}