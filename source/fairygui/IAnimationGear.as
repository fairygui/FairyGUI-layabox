package fairygui {
	
	public interface IAnimationGear {
		function get playing(): Boolean;
		function set playing(value:Boolean):void;
		function get frame(): Number;
		function set frame(value:Number):void;
	}
}