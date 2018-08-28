declare module fairygui {
    class AutoSizeType {
        static None: number;
        static Both: number;
        static Height: number;
    }
}
declare module fairygui {
    class ButtonMode {
        static Common: number;
        static Check: number;
        static Radio: number;
    }
}
declare module fairygui {
    class ChildrenRenderOrder {
        static Ascent: number;
        static Descent: number;
        static Arch: number;
    }
}
declare module fairygui {
    class Controller extends laya.events.EventDispatcher {
        parent: GComponent;
        autoRadioGroupDepth: boolean;
        constructor();
        name: string;
        selectedIndex: number;
        setSelectedIndex(value?: number): void;
        previsousIndex: number;
        selectedPage: string;
        setSelectedPage(value: string): void;
        previousPage: string;
        pageCount: number;
        getPageName(index?: number): string;
        addPage(name?: string): void;
        addPageAt(name: string, index?: number): void;
        removePage(name: string): void;
        removePageAt(index?: number): void;
        clearPages(): void;
        hasPage(aName: string): boolean;
        getPageIndexById(aId: string): number;
        getPageIdByName(aName: string): string;
        getPageNameById(aId: string): string;
        getPageId(index?: number): string;
        selectedPageId: string;
        oppositePageId: string;
        previousPageId: string;
    }
}
declare module fairygui.display {
    class BitmapFont {
        id: string;
        size: number;
        ttf: boolean;
        glyphs: Object;
        resizable: boolean;
        constructor();
    }
}
declare module fairygui.display {
    class BMGlyph {
        x: number;
        y: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
        advance: number;
        lineHeight: number;
        channel: number;
        texture: laya.resource.Texture;
        constructor();
    }
}
declare module fairygui.display {
    class Frame {
        rect: laya.maths.Rectangle;
        addDelay: number;
        texture: laya.resource.Texture;
        constructor();
    }
}
declare module fairygui.display {
    class Image extends laya.display.Sprite {
        constructor();
        tex: laya.resource.Texture;
        scaleTexture(x: number, y: number): void;
        scale9Grid: laya.maths.Rectangle;
        scaleByTile: boolean;
        tileGridIndice: number;
        static clearCache(): void;
    }
}
declare module fairygui.display {
    class MovieClip extends laya.display.Sprite {
        interval: number;
        swing: boolean;
        repeatDelay: number;
        timeScale: number;
        constructor();
        frames: Array<Frame>;
        frameCount: number;
        boundsRect: laya.maths.Rectangle;
        frame: number;
        playing: boolean;
        smoothing: boolean;
        rewind(): void;
        syncStatus(anotherMc: fairygui.display.MovieClip): void;
        advance(timeInMiniseconds: number): void;
        setPlaySettings(start?: number, end?: number, times?: number, endAt?: number, endHandler?: laya.utils.Handler): void;
    }
}
declare module fairygui {
    class DragDropManager {
        static inst: DragDropManager;
        constructor();
        dragAgent: GObject;
        dragging: boolean;
        startDrag(source: GObject, icon: string, sourceData: any, touchPointID?: number): void;
        cancel(): void;
    }
}
declare module fairygui {
    class Events {
        static STATE_CHANGED: string;
        static XY_CHANGED: string;
        static SIZE_CHANGED: string;
        static SIZE_DELAY_CHANGE: string;
        static CLICK_ITEM: string;
        static SCROLL: string;
        static SCROLL_END: string;
        static DROP: string;
        static FOCUS_CHANGED: string;
        static DRAG_START: string;
        static DRAG_MOVE: string;
        static DRAG_END: string;
        static PULL_DOWN_RELEASE: string;
        static PULL_UP_RELEASE: string;
        static GEAR_STOP: string;
        static $event: laya.events.Event;
        static createEvent(type: string, target: laya.display.Sprite, source?: laya.events.Event): laya.events.Event;
        static dispatch(type: string, target: laya.display.Sprite, source?: laya.events.Event): void;
    }
}
declare module fairygui {
    class LoaderFillType {
        static None: number;
        static Scale: number;
        static ScaleMatchHeight: number;
        static ScaleMatchWidth: number;
        static ScaleFree: number; 
        static ScaleNoBorder: number;
    }
}
declare module fairygui {
    class FlipType {
        static None: number;
        static Horizontal: number;
        static Vertical: number;
        static Both: number;
    }
}
declare module fairygui {
    class GBasicTextField extends GTextField {
        textField: laya.display.Text;
        constructor();
        protected createDisplayObject(): void;
        text: string;
        font: string;
        fontSize: number;
        color: string;
        align: string;
        valign: string;
        leading: number;
        letterSpacing: number;
        bold: boolean;
        italic: boolean;
        underline: boolean;
        singleLine: boolean;
        stroke: number;
        strokeColor: string;
        ubbEnabled: boolean;
        autoSize: number;
        asPassword: boolean;
        textWidth: number;
        ensureSizeCorrect(): void;
        protected handleSizeChanged(): void;
        protected handleGrayedChanged(): void;      
    }
}
declare module fairygui {
    class GButton extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        protected _relatedController: Controller;
        static UP: string;
        static DOWN: string;
        static OVER: string;
        static SELECTED_OVER: string;
        static DISABLED: string;
        static SELECTED_DISABLED: string;
        constructor();
        icon: string;
        selectedIcon: string;
        title: string;
        text: string;
        selectedTitle: string;
        titleColor: string;
        titleFontSize: number;
        sound: string;
        soundVolumeScale: number;
        selected: boolean;
        mode: number;
        relatedController: Controller;
        pageOption: PageOption;
        changeStateOnClick: boolean;
        linkedPopup: GObject;
        fireClick(downEffect?: boolean): void;
        protected setState(val: string): void;
        handleControllerChanged(c: Controller): void;
        protected handleGrayedChanged(): void;
    }
}
declare module fairygui {
    class GComboBox extends GComponent {
        protected _titleObject: GTextField;
        protected _dropdownObject: GComponent;
        protected _list: GList;
        constructor();
        text: string;
        icon: string;
        titleColor: string;
        titleFontSize: number;
        visibleItemCount: number;
        popupDirection: number;
        items: Array<any>;
        values: Array<any>;
        icons: Array<any>;
        selectedIndex: number;
        value: string;
        protected setState(val: string): void;
        protected showDropdown(): void;
    }
    
    class PopupDirection {
        static Auto: number;
        static Up: number;
        static Down: number;
    }
}
declare module fairygui {
    class GComponent extends GObject {
        protected _margin: Margin;
        protected _trackBounds: boolean;
        protected _boundsChanged: boolean;
        _buildingDisplayList: boolean;
        _children: Array<any>;
        _controllers: Array<any>;
        _transitions: Array<any>;
        _container: laya.display.Sprite;
        _scrollPane: ScrollPane;
        constructor();
        protected createDisplayObject(): void;
        dispose(): void;
        displayListContainer: laya.display.Sprite;
        addChild(child: GObject): GObject;
        addChildAt(child: GObject, index?: number): GObject;
        removeChild(child: GObject, dispose?: boolean): GObject;
        removeChildAt(index: number, dispose?: boolean): GObject;
        removeChildren(beginIndex?: number, endIndex?: number, dispose?: boolean): void;
        getChildAt(index?: number): GObject;
        getChild(name: string): GObject;
        getVisibleChild(name: string): GObject;
        getChildInGroup(name: string, group: GGroup): GObject;
        getChildById(id: string): GObject;
        getChildIndex(child: GObject): number;
        setChildIndex(child: GObject, index?: number): void;
        setChildIndexBefore(child: GObject, index?: number): number;
        swapChildren(child1: GObject, child2: GObject): void;
        swapChildrenAt(index1: number, index2?: number): void;
        numChildren: number;
        addController(controller: Controller): void;
        getControllerAt(index: number): Controller;
        getController(name: string): Controller;
        removeController(c: Controller): void;
        controllers: Array<any>;
        childStateChanged(child: GObject): void;
        applyController(c: Controller): void;
        applyAllControllers(): void;
        adjustRadioGroupDepth(obj: GObject, c: Controller): void;
        getTransitionAt(index: number): Transition;
        getTransition(transName: string): Transition;
        isChildInView(child: GObject): boolean;
        getFirstChildInView(): number;
        scrollPane: ScrollPane;
        opaque: boolean;
        margin: Margin;
        childrenRenderOrder: number;
        apexIndex: number;
        mask: laya.display.Sprite;
        protected updateHitArea(): void;
        protected updateMask(): void;
        protected setupScroll(scrollBarMargin: Margin, scroll: number, scrollBarDisplay: number, flags: number, vtScrollBarRes: string, hzScrollBarRes: string, headerRes: string, footerRes: string): void;
        protected setupOverflow(overflow: number): void;
        protected handleSizeChanged(): void;
        protected handleGrayedChanged(): void;
        setBoundsChangedFlag(): void;
        ensureBoundsCorrect(): void;
        protected updateBounds(): void;
        setBounds(ax: number, ay: number, aw: number, ah?: number): void;
        viewWidth: number;
        viewHeight: number;
        getSnappingPosition(xValue: number, yValue: number, resultPoint?: laya.maths.Point): laya.maths.Point;
        childSortingOrderChanged(child: GObject, oldValue: number, newValue?: number): void;
        constructFromResource(): void;
        protected constructFromXML(xml: Object): void;
        baseUserData: string;
    }
}
declare module fairygui.gears {
    class GearAnimation extends GearBase {
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, value: string): void;
        apply(): void;
        updateState(): void;
    }
    class GearAnimationValue {
        playing: boolean;
        frame: number;
        GearAnimationValue(playing?: boolean, frame?: number): any;
    }
}
declare module fairygui.gears {
    class GearBase {
        static disableAllTweenEffect: boolean;
        tweenConfig: GearTweenConfig;
        protected _owner: GObject;
        protected _controller: Controller;
        constructor(owner: GObject);
        controller: Controller;
        protected addStatus(pageId: string, value: string): void;
        protected init(): void;
        apply(): void;
        updateState(): void;
    }
    class GearTweenConfig {
        tween: boolean;
        easeType: number;
        duration: number;
        tweenDelay: number;
    }
}
declare module fairygui.gears {
    class GearColor extends GearBase {
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, value: string): void;
        apply(): void;
        updateState(): void;
    }
}
declare module fairygui.gears {
    class GearDisplay extends GearBase {
        pages: Array<any>;
        constructor(owner: GObject);
        apply(): void;
    }
}
declare module fairygui.gears {
    class GearLook extends GearBase {
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, value: string): void;
        apply(): void;
        updateState(): void;
    }
    class GearLookValue {
        alpha: number;
        rotation: number;
        grayed: boolean;
        GearLookValue(alpha?: number, rotation?: number, grayed?: boolean): any;
    }
}
declare module fairygui.gears {
    class GearSize extends GearBase {
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, value: string): void;
        apply(): void;
        updateState(): void;
        updateFromRelations(dx: number, dy: number): void;
    }
    class GearSizeValue {
        width: number;
        height: number;
        scaleX: number;
        scaleY: number;
        GearSizeValue(width?: number, height?: number, scaleX?: number, scaleY?: number): any;
    }
}
declare module fairygui.gears {
    class GearXY extends GearBase {
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, value: string): void;
        apply(): void;
        updateState(): void;
        updateFromRelations(dx: number, dy: number): void;
    }
}
declare module fairygui.gears {
    class GearText extends GearBase {
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, value: string): void;
        apply(): void;
        updateState(): void;
        updateFromRelations(dx: number, dy: number): void;
    }
}
declare module fairygui.gears {
    class GearIcon extends GearBase {
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, value: string): void;
        apply(): void;
        updateState(): void;
        updateFromRelations(dx: number, dy: number): void;
    }
}
declare module fairygui {
    class GGraph extends GObject {
        constructor();
        color: string;
        drawRect(lineSize: number, lineColor: string, fillColor: string, corners?: Array<any>): void;
        drawEllipse(lineSize: number, lineColor: string, fillColor: string): void;
        replaceMe(target: GObject): void;
        addBeforeMe(target: GObject): void;
        addAfterMe(target: GObject): void;
        setNativeObject(obj: laya.display.Sprite): void;
        protected createDisplayObject(): void;
        protected handleSizeChanged(): void;
    }
}
declare module fairygui {
    class GGroup extends GObject {
        layout: number;
        lineGap: number;
        columnGap: number;
        constructor();
        setBoundsChangedFlag(childSizeChanged: boolean): void;
        ensureBoundsCorrect(): void;
    }
}
declare module fairygui {
    class GroupLayoutType {
        static None: number;
        static Horizontal: number;
        static Vertical: number;
    }
}
declare module fairygui {
    class GImage extends GObject implements fairygui.gears.IColorGear {
        image: fairygui.display.Image;
        constructor();
        color: string;
        flip: number;
        handleControllerChanged(c: Controller): void;
        protected createDisplayObject(): void;
        constructFromResource(): void;
        protected handleXYChanged(): void;
        protected handleSizeChanged(): void;
    }
}
declare module fairygui {
    class GLabel extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        constructor();
        icon: string;
        title: string;
        text: string;
        titleColor: string;
        titleFontSize: number;
        editable: boolean;
    }
}
declare module fairygui {
    class GList extends GComponent {
        /**
         * itemRenderer(int index, GObject item);
         */
        itemRenderer: laya.utils.Handler;
        /**
         * itemProvider(index:int):String;
         */
				itemProvider: laya.utils.Handler;
        constructor();
        dispose(): void;
        scrollItemToViewOnClick: boolean;
				foldInvisibleItems: boolean;
        layout: number;
        lineGap: number;
        lineCount: number;
        columnCount: number;
        columnGap: number;
        align: string;
        valign: string;
        virtualItemSize: laya.maths.Point;
        defaultItem: string;
        autoResizeItem: boolean;
        selectionMode: number;
        itemPool: GObjectPool;
        getFromPool(url?: string): GObject;
        returnToPool(obj: GObject): void;
        addChildAt(child: GObject, index?: number): GObject;
        addItem(url?: string): GObject;
        addItemFromPool(url?: string): GObject;
        removeChildAt(index: number, dispose?: boolean): GObject;
        removeChildToPoolAt(index?: number): void;
        removeChildToPool(child: GObject): void;
        removeChildrenToPool(beginIndex?: number, endIndex?: number): void;
        selectedIndex: number;
        getSelection(): Array<any>;
        addSelection(index: number, scrollItToView?: boolean): void;
        removeSelection(index?: number): void;
        clearSelection(): void;
        selectAll(): void;
        selectNone(): void;
        selectReverse(): void;
        handleArrowKey(dir?: number): void;
        resizeToFit(itemCount?: number, minSize?: number): void;
        getMaxItemWidth(): number;
        protected handleSizeChanged(): void;
        getSnappingPosition(xValue: number, yValue: number, resultPoint?: laya.maths.Point): laya.maths.Point;
        scrollToView(index: number, ani?: boolean, setFirst?: boolean): void;
        getFirstChildInView(): number;
        childIndexToItemIndex(index: number): number;
        itemIndexToChildIndex(index: number): number;
        setVirtual(): void;
        setVirtualAndLoop(): void;
        numItems: number;
        refreshVirtualList(): void;
        protected updateBounds(): void;
    }
}
declare module fairygui {
    class GLoader extends GObject implements fairygui.gears.IAnimationGear, fairygui.gears.IColorGear {
        constructor();
        protected createDisplayObject(): void;
        dispose(): void;
        url: string;
        align: string;
        verticalAlign: string;
        fill: number;
        shrinkOnly: boolean;
        autoSize: boolean;
        playing: boolean;
        frame: number;
        color: string;
        showErrorSign: boolean;
        content: laya.display.Node;
        component: GComponent;
        protected loadContent(): void;
        protected loadFromPackage(itemURL: string): void;
        protected loadExternal(): void;
        protected freeExternal(texture: laya.resource.Texture): void;
        protected onExternalLoadSuccess(texture: laya.resource.Texture): void;
        protected onExternalLoadFailed(): void;
        handleControllerChanged(c: Controller): void;
        protected handleSizeChanged(): void;
    }
}
declare module fairygui {
    class GMovieClip extends GObject implements fairygui.gears.IAnimationGear, fairygui.gears.IColorGear {
        constructor();
        color: string;
        protected createDisplayObject(): void;
        playing: boolean;
        frame: number;
        timeScale: number;
        rewind(): void;
        syncStatus(anotherMc: fairygui.GMovieClip): void;
        advance(timeInMiniseconds: number): void;
        setPlaySettings(start?: number, end?: number, times?: number, endAt?: number, endHandler?: laya.utils.Handler): void;
        handleControllerChanged(c: Controller): void;
        constructFromResource(): void;
    }
}
declare module fairygui {
    class GObject {
        data: Object;
        packageItem: PackageItem;
        static draggingObject: GObject;
        protected _displayObject: laya.display.Sprite;
        protected _yOffset: number;
        _parent: GComponent;
        _rawWidth: number;
        _rawHeight: number;
        sourceWidth: number;
        sourceHeight: number;
        initWidth: number;
        initHeight: number;
        _id: string;
        _name: string;
        _underConstruct: boolean;
        static _gInstanceCounter: number;
        constructor();
        id: string;
        name: string;
        x: number;
        y: number;
        minX: number;
        minY: number;
        pixelSnapping: boolean;
        setXY(xv: number, yv: number): void;
        center(restraint?: boolean): void;
        width: number;
        height: number;
        setSize(wv: number, hv: number, ignorePivot?: boolean): void;
        ensureSizeCorrect(): void;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        actualWidth: number;
        actualHeight: number;
        scaleX: number;
        scaleY: number;
        setScale(sx: number, sy: number): void;
        skewX: number;
        skewY: number;
        setSkew(sx: number, sy: number): void;
        pivotX: number;
        pivotY: number;
        pivotAsAnchor: boolean;
        setPivot(xv: number, yv?: number, asAnchor?: boolean): void;
        touchable: boolean;
        grayed: boolean;
        enabled: boolean;
        rotation: number;
        normalizeRotation: number;
        alpha: number;
        filters: Array<any>;
        visible: boolean;
        sortingOrder: number;
        focusable: boolean;
        focused: boolean;
        requestFocus(): void;
        tooltips: string;
        inContainer: boolean;
        onStage: boolean;
        resourceURL: string;
        group: GGroup;
        gearDisplay: fairygui.gears.GearDisplay;
        gearXY: fairygui.gears.GearXY;
        gearSize: fairygui.gears.GearSize;
        gearLook: fairygui.gears.GearLook;
        relations: Relations;
        addRelation(target: GObject, relationType: number, usePercent?: boolean): void;
        removeRelation(target: GObject, relationType?: number): void;
        displayObject: laya.display.Sprite;
        parent: GComponent;
        removeFromParent(): void;
        root: GRoot;
        asCom: GComponent;
        asButton: GButton;
        asLabel: GLabel;
        asProgress: GProgressBar;
        asTextField: GTextField;
        asRichTextField: GRichTextField;
        asTextInput: GTextInput;
        asLoader: GLoader;
        asList: GList;
        asGraph: GGraph;
        asGroup: GGroup;
        asSlider: GSlider;
        asComboBox: GComboBox;
        asImage: GImage;
        asMovieClip: GMovieClip;
        text: string;
        icon: string;
        dispose(): void;
        onClick(thisObj: any, listener: Function, args?: Array<any>): void;
        offClick(thisObj: any, listener: Function): void;
        hasClickListener(): boolean;
        on(type: string, thisObject: any, listener: Function, args?: Array<any>): void;
        off(type: string, thisObject: any, listener: Function): void;
        draggable: boolean;
        dragBounds: laya.maths.Rectangle;
        startDrag(touchPointID?: number): void;
        stopDrag(): void;
        dragging: boolean;
        localToGlobal(ax?: number, ay?: number, resultPoint?: laya.maths.Point): laya.maths.Point;
        globalToLocal(ax?: number, ay?: number, resultPoint?: laya.maths.Point): laya.maths.Point;
        localToGlobalRect(ax?: number, ay?: number, aWidth?: number, aHeight?: number, resultRect?: laya.maths.Rectangle): laya.maths.Rectangle;
        globalToLocalRect(ax?: number, ay?: number, aWidth?: number, aHeight?: number, resultRect?: laya.maths.Rectangle): laya.maths.Rectangle;
        handleControllerChanged(c: Controller): void;
        protected createDisplayObject(): void;
        protected handleXYChanged(): void;
        protected handleSizeChanged(): void;
        protected handleScaleChanged(): void;
        protected handleGrayedChanged(): void;
        constructFromResource(): void;
        static cast(sprite: laya.display.Sprite): GObject;
        getGear(index: number): fairygui.gears.GearBase;
    }
}
declare module fairygui {
    class GObjectPool {
        constructor();
        clear(): void;
        count: number;
        getObject(url: string): GObject;
        returnObject(obj: GObject): void;
    }
}
declare module fairygui {
    class GProgressBar extends GComponent {
        constructor();
        titleType: number;
        max: number;
        value: number;
        tweenValue(value: number, duration: number): fairygui.tween.GTweener;
        update(newValue: number): void;
        protected constructFromXML(xml: Object): void;
        protected handleSizeChanged(): void;
        dispose(): void;
    }
}
declare module fairygui {
    class GRichTextField extends GTextField implements fairygui.gears.IColorGear {
        div: laya.html.dom.HTMLDivElement;
        constructor();
        protected createDisplayObject(): void;
        text: string;
        font: string;
        fontSize: number;
        color: string;
        align: string;
        valign: string;
        leading: number;
        bold: boolean;
        italic: boolean;
        stroke: number;
        strokeColor: string;
        ubbEnabled: boolean;
        protected handleSizeChanged(): void;
    }
}
declare module fairygui {
    class GRoot extends GComponent {
        static inst: GRoot;
        constructor();
        showWindow(win: Window): void;
        hideWindow(win: Window): void;
        hideWindowImmediately(win: Window): void;
        bringToFront(win: Window): void;
        showModalWait(msg?: string): void;
        closeModalWait(): void;
        closeAllExceptModals(): void;
        closeAllWindows(): void;
        getTopWindow(): Window;
        hasModalWindow: boolean;
        modalWaiting: boolean;
        showPopup(popup: GObject, target?: GObject, downward?: any): void;
        togglePopup(popup: GObject, target?: GObject, downward?: any): void;
        hidePopup(popup?: GObject): void;
        hasAnyPopup: boolean;
        showTooltips(msg: string): void;
        showTooltipsWin(tooltipWin: GObject, position?: laya.maths.Point): void;
        hideTooltips(): void;
        getObjectUnderPoint(globalX: number, globalY: number): GObject;
        focus: GObject;
        volumeScale: number;
        playOneShotSound(sound: laya.media.Sound, volumeScale?: number): void;
        checkPopups(clickTarget: laya.display.Sprite): void;
    }
}
declare module fairygui {
    class GScrollBar extends GComponent {
        constructor();
        setScrollPane(target: ScrollPane, vertical: boolean): void;
        displayPerc: number;
        scrollPerc: number;
        minSize: number;
    }
}
declare module fairygui {
    class GSlider extends GComponent {
        constructor();
        titleType: number;
        max: number;
        value: number;
        update(): void;
        protected handleSizeChanged(): void;
    }
}
declare module fairygui {
    class GTextField extends GObject implements fairygui.gears.IColorGear {
        constructor();
        font: string;
        fontSize: number;
        color: string;
        align: string;
        valign: string;
        leading: number;
        letterSpacing: number;
        bold: boolean;
        italic: boolean;
        underline: boolean;
        singleLine: boolean;
        stroke: number;
        strokeColor: string;
        ubbEnabled: boolean;
        asPassword: boolean;
        textWidth: number;
        handleControllerChanged(c: Controller): void;
        templateVars: any;
        setVar(name: string, value: string): GTextField;
        flushVars(): void;
    }
}
declare module fairygui {
    class GTextInput extends GTextField implements fairygui.gears.IColorGear {
        input: laya.display.Input;
        constructor();
        protected createDisplayObject(): void;
        text: string;
        font: string;
        fontSize: number;
        color: string;
        align: string;
        valign: string;
        leading: number;
        bold: boolean;
        italic: boolean;
        singleLine: boolean;
        stroke: number;
        strokeColor: string;
        password: boolean;
        editable: boolean;
        maxChars: number;
        promptText: string;
        textWidth: number;
        protected handleSizeChanged(): void;
    }
}
declare module fairygui.gears {
    interface IAnimationGear {
    }
}
declare module fairygui.gears {
    interface IColorGear {
    }
}
declare module fairygui {
    interface IUISource {
    }
}
declare module fairygui {
    class ListLayoutType {
        static SingleColumn: number;
        static SingleRow: number;
        static FlowHorizontal: number;
        static FlowVertical: number;
        static Pagination : number;
    }
}
declare module fairygui {
    class ListSelectionMode {
        static Single: number;
        static Multiple: number;
        static Multiple_SingleClick: number;
        static None: number;
    }
}
declare module fairygui {
    class Margin {
        left: number;
        right: number;
        top: number;
        bottom: number;
        constructor();
        copy(source: Margin): void;
    }
}
declare module fairygui {
    class OverflowType {
        static Visible: number;
        static Hidden: number;
        static Scroll: number;
    }
}
declare module fairygui {
    class PackageItem {
        owner: UIPackage;
        type: number;
        objectType: number;
        id: string;
        name: string;
        width: number;
        height: number;
        file: string;
        decoded: boolean;
        rawData: fairygui.utils.ByteBuffer;
        scale9Grid: laya.maths.Rectangle;
        scaleByTile: boolean;
        tileGridIndice: number;
        smoothing: boolean;
        texture: laya.resource.Texture;
        interval: number;
        repeatDelay: number;
        swing: boolean;
        frames: Array<fairygui.display.Frame>;
        sound: laya.media.Sound;
        bitmapFont: fairygui.display.BitmapFont;
        constructor();
        load(): Object;
        toString(): string;
    }
}
declare module fairygui {
    class PackageItemType {
        static Image: number;
        static Swf: number;
        static MovieClip: number;
        static Sound: number;
        static Component: number;
        static Misc: number;
        static Font: number;
        static Atlas: number;
        static Unknown: number;
    }
}
declare module fairygui {
    class PageOption {
        constructor();
        controller: Controller;
        index: number;
        name: string;
        clear(): void;
        id: string;
    }
}
declare module fairygui {
    class PopupMenu {
        protected _contentPane: GComponent;
        protected _list: GList;
        constructor(resourceURL?: string);
        addItem(caption: string, handler?: laya.utils.Handler): GButton;
        addItemAt(caption: string, index: number, handler?: laya.utils.Handler): GButton;
        addSeperator(): void;
        getItemName(index: number): string;
        setItemText(name: string, caption: string): void;
        setItemVisible(name: string, visible: boolean): void;
        setItemGrayed(name: string, grayed: boolean): void;
        setItemCheckable(name: string, checkable: boolean): void;
        setItemChecked(name: string, checked: boolean): void;
        isItemChecked(name: string): boolean;
        removeItem(name: string): boolean;
        clearItems(): void;
        itemCount: number;
        contentPane: GComponent;
        list: GList;
        show(target?: GObject, downward?: any): void;
    }
}
declare module fairygui {
    class ProgressTitleType {
        static Percent: number;
        static ValueAndMax: number;
        static Value: number;
        static Max: number;
    }
}
declare module fairygui {
    class RelationItem {
        constructor(owner: GObject);
        owner: GObject;
        target: GObject;
        add(relationType: number, usePercent: boolean): void;
        remove(relationType?: number): void;
        copyFrom(source: RelationItem): void;
        dispose(): void;
        isEmpty: boolean;
        applyOnSelfResized(dWidth: number, dHeight: number): void;
    }
    class RelationDef {
        affectBySelfSizeChanged: boolean;
        percent: boolean;
        type: number;
        RelationDef(): any;
        copyFrom(source: RelationDef): void;
    }
}
declare module fairygui {
    class Relations {
        handling: GObject;
        sizeDirty: boolean;
        private static RELATION_NAMES;
        constructor(owner: GObject);
        add(target: GObject, relationType: number, usePercent?: boolean): void;
        remove(target: GObject, relationType?: number): void;
        contains(target: GObject): boolean;
        clearFor(target: GObject): void;
        clearAll(): void;
        copyFrom(source: Relations): void;
        dispose(): void;
        ensureRelationsSizeCorrect(): void;
        empty: boolean;
    }
}
declare module fairygui {
    class RelationType {
        constructor();
        static Left_Left: number;
        static Left_Center: number;
        static Left_Right: number;
        static Center_Center: number;
        static Right_Left: number;
        static Right_Center: number;
        static Right_Right: number;
        static Top_Top: number;
        static Top_Middle: number;
        static Top_Bottom: number;
        static Middle_Middle: number;
        static Bottom_Top: number;
        static Bottom_Middle: number;
        static Bottom_Bottom: number;
        static Width: number;
        static Height: number;
        static LeftExt_Left: number;
        static LeftExt_Right: number;
        static RightExt_Left: number;
        static RightExt_Right: number;
        static TopExt_Top: number;
        static TopExt_Bottom: number;
        static BottomExt_Top: number;
        static BottomExt_Bottom: number;
        static Size: number;
    }
}
declare module fairygui {
    class ScrollBarDisplayType {
        static Default: number;
        static Visible: number;
        static Auto: number;
        static Hidden: number;
    }
}
declare module fairygui {
    class ScrollPane extends Object {
        constructor(owner: GComponent);
        owner: GComponent;
        hzScrollBar: GScrollBar;
        vtScrollBar: GScrollBar;
        header: GComponent;
        footer: GComponent;
        bouncebackEffect: boolean;
        touchEffect: boolean;
        scrollStep: number;
        decelerationRate: number;
        snapToItem: boolean;
        percX: number;
        setPercX(sc: number, ani?: boolean): void;
        percY: number;
        setPercY(sc: number, ani?: boolean): void;
        posX: number;
        setPosX(val: number, ani?: boolean): void;
        posY: number;
        setPosY(val: number, ani?: boolean): void;
        isBottomMost: boolean;
        isRightMost: boolean;
        currentPageX: number;
        currentPageY: number;
        setCurrentPageX(sc: number, ani?: boolean): void;
        setPercX(sc: number, ani?: boolean): void;
        contentWidth: number;
        contentHeight: number;
        viewWidth: number;
        viewHeight: number;
        isDragged: boolean;
        scrollTop(ani?: boolean): void;
        scrollBottom(ani?: boolean): void;
        scrollUp(speed?: number, ani?: boolean): void;
        scrollDown(speed?: number, ani?: boolean): void;
        scrollLeft(speed?: number, ani?: boolean): void;
        scrollRight(speed?: number, ani?: boolean): void;
        scrollToView(target: any, ani?: boolean, setFirst?: boolean): void;
        isChildInView(obj: GObject): boolean;
        setSize(aWidth: number, aHeight: number, noRefresh?: boolean): void;
        setContentSize(aWidth: number, aHeight: number): void;
        cancelDragging(): void;
        lockHeader(size: number): void;
        lockFooter(size: number): void;
    }
}
declare module fairygui {
    class ScrollType {
        static Horizontal: number;
        static Vertical: number;
        static Both: number;
    }
}
declare module fairygui {
    class Transition {
        name: string;
        constructor(owner: GComponent);
        play(onComplete?: laya.utils.Handler, times?: number, delay?: number, startTime?: number, endTime?: number): void;
        playReverse(onComplete?: laya.utils.Handler, times?: number, delay?: number): void;
        stop(setToComplete?: boolean, processCallback?: boolean): void;
        playing: boolean;
        changePlayTimes(value: number): void;
        setAutoPlay(value: boolean, times?: number, delay?: number):void;
        setPaused(paused: boolean);
        setValue(label: string, ...args: any[]): void;
        setHook(label: string, callback: laya.utils.Handler): void;
        clearHooks(): void;
        setTarget(label: string, newTarget: GObject): void;
        setDuration(label: String, value: number):void;
    }
}
declare module fairygui {
    class UIConfig {
        constructor();
        static defaultFont: string;
        static windowModalWaiting: string;
        static globalModalWaiting: string;
        static modalLayerColor: string;
        static buttonSound: string;
        static buttonSoundVolumeScale: number;
        static horizontalScrollBar: string;
        static verticalScrollBar: string;
        static defaultScrollStep: number;
        static defaultScrollDecelerationRate: number;
        static defaultScrollBarDisplay: number;
        static defaultScrollTouchEffect: boolean;
        static defaultScrollBounceEffect: boolean;
        static popupMenu: string;
        static popupMenu_seperator: string;
        static loaderErrorSign: string;
        static tooltipsWin: string;
        static defaultComboBoxVisibleItemCount: number;
        static touchScrollSensitivity: number;
        static touchDragSensitivity: number;
        static clickDragSensitivity: number;
        static bringWindowToFrontOnClick: boolean;
        static textureLinearSampling: boolean;
        static packageFileExtension: string;
    }
}
declare module fairygui {
    class UIObjectFactory {
        constructor();
        static setPackageItemExtension(url: string, type: any): void;
        static setLoaderExtension(type: any): void;
        static newObject(pi: PackageItem): GObject;
        static newObject2(type: number): GObject;
    }
}
declare module fairygui {
    class UIPackage {
        static _constructing: number;
        constructor();
        static getById(id: string): UIPackage;
        static getByName(name: string): UIPackage;
        static addPackage(resKey: string, descData?: any): UIPackage;
        static removePackage(packageId: string): void;
        static createObject(pkgName: string, resName: string, userClass?: any): GObject;
        static createObjectFromURL(url: string, userClass?: any): GObject;
        static getItemURL(pkgName: string, resName: string): string;
        static getItemByURL(url: string): PackageItem;
        static getItemAssetByURL(url: string): Object;
        static normalizeURL(url: string): string;
        static getBitmapFontByURL(url: string): fairygui.display.BitmapFont;
        static setStringsSource(source: string): void;
        dispose(): void;
        id: string;
        name: string;
        customId: string;
        createObject(resName: string, userClass?: Object): GObject;
        getItemById(itemId: string): PackageItem;
        getItemByName(itemId: string): PackageItem;
        getItemAssetByName(resName: string): Object;
        getItemAsset(item: PackageItem): Object;
        getItemAssetURL(item: PackageItem): string;
        loadAllAssets();
        unloadAssets();
    }
}
declare module fairygui.utils {
    class ToolSet {
        static GRAY_FILTERS_MATRIX: Array<any>;
        constructor();
        static getFileName(source: string): string;
        static startsWith(source: string, str: string, ignoreCase?: boolean): boolean;
        static endsWith(source: string, str: string, ignoreCase?: boolean): boolean;
        static trim(targetString: string): string;
        static trimLeft(targetString: string): string;
        static trimRight(targetString: string): string;
        static convertToHtmlColor(argb: number, hasAlpha?: boolean): string;
        static convertFromHtmlColor(str: string, hasAlpha?: boolean): number;
        static displayObjectToGObject(obj: laya.display.Node): fairygui.GObject;
        static encodeHTML(str: string): string;
        static defaultUBBParser: UBBParser;
        static parseUBB(text: string): string;
        static removeUBB(text: string): string;
    }
}
declare module fairygui.utils {
    class UBBParser {
        protected _handlers: Object;
        smallFontSize: number;
        normalFontSize: number;
        largeFontSize: number;
        defaultImgWidth: number;
        defaultImgHeight: number;
        static inst: UBBParser;
        constructor();
        protected onTag_URL(tagName: string, end: boolean, attr: string): string;
        protected onTag_IMG(tagName: string, end: boolean, attr: string): string;
        protected onTag_Simple(tagName: string, end: boolean, attr: string): string;
        protected onTag_COLOR(tagName: string, end: boolean, attr: string): string;
        protected onTag_FONT(tagName: string, end: boolean, attr: string): string;
        protected onTag_SIZE(tagName: string, end: boolean, attr: string): string;
        protected getTagText(remove?: boolean): string;
        parse(text: string, remove?: boolean): string;
    }
}
declare module fairygui {
    class Window extends GComponent {
        protected _requestingCmd: number;
        bringToFontOnClick: boolean;
        constructor();
        addUISource(source: IUISource): void;
        contentPane: GComponent;
        frame: GComponent;
        closeButton: GObject;
        dragArea: GObject;
        contentArea: GObject;
        show(): void;
        showOn(root: GRoot): void;
        hide(): void;
        hideImmediately(): void;
        centerOn(r: GRoot, restraint?: boolean): void;
        toggleStatus(): void;
        isShowing: boolean;
        isTop: boolean;
        modal: boolean;
        bringToFront(): void;
        showModalWait(requestingCmd?: number): void;
        protected layoutModalWaitPane(): void;
        closeModalWait(requestingCmd?: number): boolean;
        modalWaiting: boolean;
        init(): void;
        protected onInit(): void;
        protected onShown(): void;
        protected onHide(): void;
        protected doShowAnimation(): void;
        protected doHideAnimation(): void;
        dispose(): void;
        protected closeEventHandler(): void;
    }
}
declare module fairygui {
    class AsyncOperation extends GComponent {
        callback: laya.utils.Handler;
        constructor();
        createObject(pkgName: string, resName: string): void;
        createObjectFromURL(url: string): void;
        cancel();
    }
}

declare module fairygui.utils {
    class PixelHitTestData {
        pixelWidth: number;
        scale: number;
        pixels: Array<number>;
        constructor();
        load(ba: laya.utils.Byte);
    }
}

declare module fairygui.utils {
    class PixelHitTest extends laya.utils.HitArea {
        offsetX: number;
        offsetY: number;
        scaleX: number;
        scaleY: number;
        constructor(data: fairygui.utils.PixelHitTestData, offsetX: number, offsetY: number);
        isHit(x: number, y: number):boolean;
    }
}

declare module fairygui.tree {
    class TreeNode {
        tree: fairygui.tree.TreeView;
        parent: fairygui.tree.TreeNode;
        cell: fairygui.GComponent;
        expanded: boolean;
        isFolder: boolean;
        text: string;       
        level: number;
        data: any;
        numChildren: number;
        constructor(hasChild: boolean);
        addChild(child: fairygui.tree.TreeNode): fairygui.tree.TreeNode;
        addChildAt(child: fairygui.tree.TreeNode, index: number): fairygui.tree.TreeNode;
        removeChild(child: fairygui.tree.TreeNode): fairygui.tree.TreeNode;
        removeChildAt(index: number): fairygui.tree.TreeNode;
        removeChildren(beginIndex?: number, endIndex?: number): void;
        getChildAt(index: number): fairygui.tree.TreeNode;
        getChildIndex(child: fairygui.tree.TreeNode): number;
        getPrevSibling(): fairygui.tree.TreeNode;
        getNextSibling(): fairygui.tree.TreeNode;
        setChildIndex(child: fairygui.tree.TreeNode, index: number): void;
        swapChildren(child1: fairygui.tree.TreeNode, child2: fairygui.tree.TreeNode): void;
        swapChildrenAt(index1: number, index2: number): void;
    }
}

declare module fairygui.tree {
    class TreeView {
        treeNodeCreateCell: laya.utils.Handler;
        treeNodeRender: laya.utils.Handler;
        treeNodeWillExpand: laya.utils.Handler;
        treeNodeClick: laya.utils.Handler;
        list: fairygui.GList;
        root: fairygui.tree.TreeNode;
        indent: number;
        constructor(list: fairygui.GList);
        getSelectedNode(): fairygui.tree.TreeNode;
        getSelection(): Array<fairygui.tree.TreeNode>;
        addSelection(node: fairygui.tree.TreeNode, scrollItToView?: boolean): void;
        removeSelection(node: fairygui.tree.TreeNode): void;
        clearSelection(): void;
        getNodeIndex(node: fairygui.tree.TreeNode): number;
        updateNode(node: fairygui.tree.TreeNode): void;
        updateNodes(nodes: Array<fairygui.tree.TreeNode>): void;
        expandAll(folderNode: fairygui.tree.TreeNode): void;
        collapseAll(folderNode: fairygui.tree.TreeNode): void;
    }
}

declare module fairygui.tween {
    class EaseType {
        static Linear: number;
        static SineIn: number;
        static SineOut: number;
        static SineInOut: number;
        static QuadIn: number;
        static QuadOut: number;
        static QuadInOut: number;
        static CubicIn: number;
        static CubicOut: number;
        static CubicInOut: number;
        static QuartIn: number;
        static QuartOut: number;
        static QuartInOut: number;
        static QuintIn: number;
        static QuintOut: number;
        static QuintInOut: number;
        static ExpoIn: number;
        static ExpoOut: number;
        static ExpoInOut: number;
        static CircIn: number;
        static CircOut: number;
        static CircInOut: number;
        static ElasticIn: number;
        static ElasticOut: number;
        static ElasticInOut: number;
        static BackIn: number;
        static BackOut: number;
        static BackInOut: number;
        static BounceIn: number;
        static BounceOut: number;
        static BounceInOut: number;
        static Custom: number;
    }
}
declare module fairygui.tween {
    class GTween {
        static catchCallbackExceptions: boolean;
        static to(start: number, end: number, duration: number): GTweener;
        static to2(start: number, start2: number, end: number, end2: number, duration: number): GTweener;
        static to3(start: number, start2: number, start3: number, end: number, end2: number, end3: number, duration: number): GTweener;
        static to4(start: number, start2: number, start3: number, start4: number, end: number, end2: number, end3: number, end4: number, duration: number): GTweener;
        static toColor(start: number, end: number, duration: number): GTweener;
        static delayedCall(delay: number): GTweener;
        static shake(startX: number, startY: number, amplitude: number, duration: number): GTweener;
        static isTweening(target: Object, propType: Object): Boolean;
        static kill(target: Object, complete?: Boolean, propType?: Object): void;
        static getTween(target: Object, propType?: Object): GTweener;
    }
}
declare module fairygui.tween {
    class GTweener {
        constructor();
        setDelay(value: number): GTweener;
        readonly delay: number;
        setDuration(value: number): GTweener;
        readonly duration: number;
        setBreakpoint(value: number): GTweener;
        setEase(value: number): GTweener;
        setEasePeriod(value: number): GTweener;
        setEaseOvershootOrAmplitude(value: number): GTweener;
        setRepeat(repeat: number, yoyo?: boolean): GTweener;
        readonly repeat: number;
        setTimeScale(value: number): GTweener;
        setSnapping(value: boolean): GTweener;
        setTarget(value: Object, propType?: Object): GTweener;
        readonly target: Object;
        setUserData(value: any): GTweener;
        readonly userData: any;
        onUpdate(callback: Function, caller: any): GTweener;
        onStart(callback: Function, caller: any): GTweener;
        onComplete(callback: Function, caller: any): GTweener;
        readonly startValue: TweenValue;
        readonly endValue: TweenValue;
        readonly value: TweenValue;
        readonly deltaValue: TweenValue;
        readonly normalizedTime: number;
        readonly completed: boolean;
        readonly allCompleted: boolean;
        setPaused(paused: boolean): GTweener;
        /**
         * seek position of the tween, in seconds.
         */
        seek(time: number): void;
        kill(complete?: boolean): void;
    }
}

declare module fairygui.tween {
    class TweenValue {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor();
        color: number;
        getField(index: number): number;
        setField(index: number, value: number): void;
        setZero(): void;
    }
}

declare module fairygui.utils {
    class ByteBuffer {
        stringTable: Array<string>;
        version: number;
        constructor(data: any, offset?: number, length?: number);
        skip(count: number): void;
        readBool(): boolean;
        readS(): string;
        writeS(): string;
        readColor(hasAlpha?: boolean): number;
        readColorS(hasAlpha?: boolean): string;
        readChar(): string;
        readBuffer(): fairygui.utils.ByteBuffer;
        seek(indexTablePos: number, blockIndex: number): boolean;
    }
}

declare module fairygui {
    class TranslationHelper {
        strings: any;
        static loadFromXML(source: string):void;
    }
}