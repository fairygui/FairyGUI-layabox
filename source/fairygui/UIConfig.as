
package fairygui {
	
	public class UIConfig {
		public function UIConfig() {
		}
		
		//Default font name
		public static var defaultFont: String = "SimSun";
		
		//Resource using in Window.ShowModalWait for locking the window.
		public static var windowModalWaiting: String;
		//Resource using in GRoot.ShowModalWait for locking the screen.
		public static var globalModalWaiting: String;
		
		//When a modal window is in front, the background becomes dark.
		public static var modalLayerColor: String = "rgba(33,33,33,0.2)";
		
		//Default button click sound
		public static var buttonSound: String;
		public static var buttonSoundVolumeScale:Number = 1;
		
		//Default button click sound
		public static var horizontalScrollBar: String;
		public static var verticalScrollBar: String;
		//Scrolling step in pixels
		public static var defaultScrollStep:int = 25;
		//Deceleration ratio of scrollpane when its in touch dragging.
		public static var defaultScrollDecelerationRate:Number = 0.967;

		//Default scrollbar display mode. Recommened visible for Desktop and Auto for mobile.
		public static var defaultScrollBarDisplay: Number = ScrollBarDisplayType.Visible;
		//Allow dragging the content to scroll. Recommeded true for mobile.
		public static var defaultScrollTouchEffect: Boolean = true;
		//The "rebound" effect in the scolling container. Recommeded true for mobile.
		public static var defaultScrollBounceEffect: Boolean = true;
		
		/**
		 * 当滚动容器设置为“贴近ITEM”时，判定贴近到哪一个ITEM的滚动距离阀值。
		 */
		public static var defaultScrollSnappingThreshold:Number = 0.1;
		
		/**
		 * 当滚动容器设置为“页面模式”时，判定翻到哪一页的滚动距离阀值。
		 */
		public static var defaultScrollPagingThreshold:Number = 0.3;
		
		//Resources for PopupMenu.
		public static var popupMenu: String;
		//Resources for seperator of PopupMenu.
		public static var popupMenu_seperator: String;
		//In case of failure of loading content for GLoader, use this sign to indicate an error.
		public static var loaderErrorSign: String;
		//Resources for tooltips.
		public static var tooltipsWin: String;
		
		//Max items displayed in combobox without scrolling.
		public static var defaultComboBoxVisibleItemCount: Number = 10;
		
		// Pixel offsets of finger to trigger scrolling.
		public static var touchScrollSensitivity: Number = 20;
		
		// Pixel offsets of finger to trigger dragging.
		public static var touchDragSensitivity: Number = 10;
		
		// Pixel offsets of mouse pointer to trigger dragging.
		public static var clickDragSensitivity: Number = 2;
		
		// When click the window, brings to front automatically.
		public static var bringWindowToFrontOnClick:Boolean = true;
		
		public static var frameTimeForAsyncUIConstruction:int = 2;
		
		public static var textureLinearSampling:Boolean = true; 
		
		public static var packageFileExtension:String = "fui";
	}
}