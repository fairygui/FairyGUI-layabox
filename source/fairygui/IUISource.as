package fairygui {
	
	public interface IUISource {
		function get fileName():String;
		function set fileName(value:String):void;
		
		function get loaded():Boolean;
		
		function load(callback: Function, thisObj:*): void;
	}
}