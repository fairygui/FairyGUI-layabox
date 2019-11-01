namespace fgui {
  export class UIConfig {
    constructor() {
    }

    //Default font name
    public static defaultFont: string = "SimSun";

    //Resource using in Window.ShowModalWait for locking the window.
    public static windowModalWaiting: string;
    //Resource using in GRoot.ShowModalWait for locking the screen.
    public static globalModalWaiting: string;

    //When a modal window is in front, the background becomes dark.
    public static modalLayerColor: string = "rgba(33,33,33,0.2)";

    //Default button click sound
    public static buttonSound: string;
    public static buttonSoundVolumeScale: number = 1;

    //Default button click sound
    public static horizontalScrollBar: string;
    public static verticalScrollBar: string;
    //Scrolling step in pixels
    public static defaultScrollStep: number = 25;
    //Deceleration ratio of scrollpane when its in touch dragging.
    public static defaultScrollDecelerationRate: number = 0.967;

    //Default scrollbar display mode. Recommened visible for Desktop and Auto for mobile.
    public static defaultScrollBarDisplay: number = ScrollBarDisplayType.Visible;
    //Allow dragging the content to scroll. Recommeded true for mobile.
    public static defaultScrollTouchEffect: boolean = true;
    //The "rebound" effect in the scolling container. Recommeded true for mobile.
    public static defaultScrollBounceEffect: boolean = true;

    /**
      * 当滚动容器设置为“贴近ITEM”时，判定贴近到哪一个ITEM的滚动距离阀值。
      */
    public static defaultScrollSnappingThreshold: number = 0.1;

    /**
      * 当滚动容器设置为“页面模式”时，判定翻到哪一页的滚动距离阀值。
      */
    public static defaultScrollPagingThreshold: number = 0.3;

    //Resources for PopupMenu.
    public static popupMenu: string;
    //Resources for seperator of PopupMenu.
    public static popupMenu_seperator: string;
    //In case of failure of loading content for GLoader, use this sign to indicate an error.
    public static loaderErrorSign: string;
    //Resources for tooltips.
    public static tooltipsWin: string;

    //Max items displayed in combobox without scrolling.
    public static defaultComboBoxVisibleItemCount: number = 10;

    // Pixel offsets of finger to trigger scrolling.
    public static touchScrollSensitivity: number = 20;

    // Pixel offsets of finger to trigger dragging.
    public static touchDragSensitivity: number = 10;

    // Pixel offsets of mouse pointer to trigger dragging.
    public static clickDragSensitivity: number = 2;

    // When click the window, brings to front automatically.
    public static bringWindowToFrontOnClick: boolean = true;

    public static frameTimeForAsyncUIConstruction: number = 2;

    public static textureLinearSampling: boolean = true;

    public static packageFileExtension: string = "fui";
  }
}