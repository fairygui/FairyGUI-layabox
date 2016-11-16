
package fairygui {

    public class UIConfig {
        public function UIConfig() {
        }

        //Default font name
        public static var defaultFont: String = "宋体";

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
        public static var defaultScrollSpeed: Number = 25;
		// Speed ratio of scrollpane when its touch dragging.
		public static var defaultTouchScrollSpeedRatio:Number = 1;
        //Default scrollbar display mode. Recommened visible for Desktop and Auto for mobile.
        public static var defaultScrollBarDisplay: Number = ScrollBarDisplayType.Visible;
        //Allow dragging the content to scroll. Recommeded true for mobile.
        public static var defaultScrollTouchEffect: Boolean = true;
        //The "rebound" effect in the scolling container. Recommeded true for mobile.
        public static var defaultScrollBounceEffect: Boolean = true;

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
	}
}