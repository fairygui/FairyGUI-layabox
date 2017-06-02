package fairygui {
	import laya.display.Sprite;
	import laya.events.Event;
	
	public class Events {
		public static const STATE_CHANGED: String = "fui_state_changed";
		public static const XY_CHANGED: String = "fui_xy_changed";
		public static const SIZE_CHANGED: String = "fui_size_changed";
		public static const SIZE_DELAY_CHANGE: String = "fui_size_delay_change";
		public static const CLICK_ITEM:String = "fui_click_item";
		public static const SCROLL:String = "fui_scroll";
		public static const SCROLL_END:String = "fui_scroll_end";
		public static const DROP:String = "fui_drop";
		public static const FOCUS_CHANGED:String = "fui_focus_changed";
		public static const DRAG_START:String = "fui_drag_start";
		public static const DRAG_MOVE:String = "fui_drag_move";
		public static const DRAG_END:String = "fui_drag_end";
		public static const PULL_DOWN_RELEASE:String = "fui_pull_down_release";
		public static const PULL_UP_RELEASE:String = "fui_pull_up_release";
		public static const GEAR_STOP:String = "fui_gear_stop";
		
		public static var $event:Event = new Event();
		
		public static function createEvent(type:String, target:Sprite, source:Event=null):Event {
			Events.$event.setTo(type, target, source?source.target:target);
			if(source)
			{
				Events.$event.touchId = source.touchId;
				Events.$event.nativeEvent=source.nativeEvent;
			}
			else
			{
				Events.$event.nativeEvent=null;
			}
			Events.$event._stoped = false;
			return Events.$event;
		}
		
		public static function dispatch(type:String, target:Sprite, source:Event=null):void {
			target.event(type, Events.createEvent(type, target, source));
		}
	}
}
