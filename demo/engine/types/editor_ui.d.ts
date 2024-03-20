declare namespace IEditorUI {
    export class Color {
        static CLEAR: Color;
        static RED: Color;
        static GREEN: Color;
        static BLUE: Color;
        static YELLOW: Color;
        static GRAY: Color;
        static BLACK: Color;
        static WHITE: Color;
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r?: number, g?: number, b?: number, a?: number);
        setRGB(rgb: number): void;
        copyTo(destObject: any): void;
        clone(): Color;
        getHex(): number;
        toHexString(): string;
        toStyleString(): string;
        parseHexString(str: string): Color;
        static fromHexString(str: string): Color;
    }

    export class Margin {
        left: number;
        right: number;
        top: number;
        bottom: number;
        copy(source: Margin): void;
    }
    export class Rect {
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(x?: number, y?: number, width?: number, height?: number);
        set(x: number, y: number, width: number, height: number): void;
        setMinMax(xMin: number, yMin: number, xMax: number, yMax: number): void;
        get position(): Vec2;
        get size(): Vec2;
        get xMin(): number;
        set xMin(value: number);
        get xMax(): number;
        set xMax(value: number);
        get yMin(): number;
        set yMin(value: number);
        get yMax(): number;
        set yMax(value: number);
        intersection(another: Rect): Rect;
        union(another: Rect): Rect;
        extend(x: number, y: number): void;
        contains(x: number | Vec2, y?: number): boolean;
        copy(source: Rect): void;
        clone(): Rect;
        equals(another: Rect): boolean;
    }
    export class Vec2 {
        x: number;
        y: number;
        constructor(x?: number, y?: number);
        set(x: number, y: number): Vec2;
        reset(): Vec2;
        distance(x: number, y: number): number;
        toString(): string;
        normalize(): void;
        copy(Vec2: Vec2): Vec2;
        clone(): Vec2;
        equals(another: Vec2): boolean;
    }
    export class Vec3 {
        /**该点的水平坐标。*/
        x: number;
        /**该点的垂直坐标。*/
        y: number;
        z: number;
        /**
         * 根据指定坐标，创建一个新的 <code>Vec2</code> 对象。
         * @param x	（可选）水平坐标。
         * @param y	（可选）垂直坐标。
         */
        constructor(x?: number, y?: number, z?: number);
        /**
         * 将 <code>Vec2</code> 的成员设置为指定值。
         * @param	x 水平坐标。
         * @param	y 垂直坐标。
         * @return 当前 Vec2 对象。
         */
        set(x: number, y: number, z: number): Vec3;
        /**
         * 重置
         */
        reset(): Vec3;
        /**返回包含 x 和 y 坐标的值的字符串。*/
        toString(): string;
        add(v: Vec3): void;
        sub(v: Vec3): void;
        cross(v: Vec3): void;
        multiplyScalar(scalar: number): void;
        normalize(): void;
        copy(v: Vec3): void;
        equals(another: Vec3): boolean;
    }

    export class Pool<T extends Object> {
        pool: Array<T>;
        _init: (arg0: T, ...argArray: any[]) => void;
        _reset: (arg0: T) => void;
        _ct: new () => T;
        constructor(type: new () => T, init?: (arg0: T) => void, reset?: (arg0: T) => void);
        borrow(...argArray: any[]): T;
        returns(element: T | Array<T>): void;
    }


    export type EventType = "pointer_down" | "pointer_up" | "pointer_move" | "click" | "right_click" | "roll_over" | "roll_out" | "mouse_wheel" | "key_down" | "key_up" | "added_to_stage" | "removed_from_stage" | "pos_changed" | "size_changed" | "status_changed" | "changed" | "focus_in" | "focus_out" | "drag_start" | "drag_move" | "drag_end" | "drop" | "scroll" | "scroll_end" | "pull_down_release" | "pull_up_release" | "click_item" | "click_link" | "play_end" | "gear_stop";
    export interface InputInfo {
        x: number;
        y: number;
        mouseWheelDelta: number;
        pointerId: number;
        button: number;
        clickCount: number;
        holdTime: number;
        shiftKey: boolean;
        altKey: boolean;
        ctrlKey: boolean;
        commandKey: boolean;
        ctrlOrCmdKey: boolean;
        isDblClick: boolean;
        isRightButton: boolean;
        keyCode: string;
        key: string;
    }
    export const lastInput: InputInfo;
    export class Event {
        data: any;
        constructor();
        get type(): string;
        get target(): EventDispatcher;
        get sender(): GObject;
        get initiator(): HTMLElement;
        get input(): Readonly<InputInfo>;
        stopPropagation(): void;
        preventDefault(): void;
        capturePointer(): void;
        get isDefaultPrevented(): boolean;
    }
    export var EventPool: Pool<Event>;

    export class EventDispatcher {
        constructor();
        on(type: EventType, callback: Function, target?: any, capture?: boolean): void;
        on(type: string, callback: Function, target?: any, capture?: boolean): void;
        off(type: EventType, callback: Function, target?: any, capture?: boolean): void;
        off(type: string, callback: Function, target?: any, capture?: boolean): void;
        offAll(type?: EventType): void;
        offAll(type?: string): void;
        hasListener(type: EventType, callback?: Function, target?: any, capture?: boolean): boolean;
        hasListener(type: string, callback?: Function, target?: any, capture?: boolean): boolean;
        emit(type: EventType, data?: any): boolean;
        emit(type: string, data?: any): boolean;
    }

    export class ByteBuffer {
        stringTable: Array<string>;
        version: number;
        littleEndian?: boolean;
        protected _buffer: ArrayBuffer;
        protected _view: DataView;
        protected _pos: number;
        protected _length: number;
        constructor(buffer: ArrayBuffer, offset?: number, length?: number);
        get data(): ArrayBuffer;
        get pos(): number;
        set pos(value: number);
        get length(): number;
        get end(): boolean;
        skip(count: number): void;
        private validate;
        readByte(): number;
        readBool(): boolean;
        readShort(): number;
        readUshort(): number;
        readInt(): number;
        readUint(): number;
        readFloat(): number;
        readString(len?: number): string;
        readS(): string;
        readSArray(cnt: number): Array<string>;
        writeS(value: string): void;
        readColor(): number;
        readFullColor(): Color;
        readChar(): string;
        readBuffer(): ByteBuffer;
        seek(indexTablePos: number, blockIndex: number): boolean;
    }

    export class Timers {
        static deltaTime: number;
        static time: number;
        static frameCount: number;
        static add(delayInMiniseconds: number, repeat: number, callback: Function, target?: any, callbackParam?: any): void;
        static callLater(callback: Function, target?: any, callbackParam?: any): void;
        static callDelay(delay: number, callback: Function, target?: any, callbackParam?: any): void;
        static addUpdate(callback: Function, target?: any, callbackParam?: any): void;
        static exists(callback: Function, target?: any): boolean;
        static remove(callback: Function, target?: any): void;
    }

    export type Constructor<T = {}> = new (...args: any[]) => T;
    export function convertToHtmlColor(rgb: number): string;
    export function clamp(value: number, min: number, max: number): number;
    export function clamp01(value: number): number;
    export function lerp(start: number, end: number, percent: number): number;
    export function repeat(t: number, length: number): number;
    export function distance(x1: number, y1: number, x2: number, y2: number): number;

    export class UBBParser {
        private _text;
        private _readPos;
        protected _handlers: {
            [index: string]: (tagName: string, end: boolean, attr: string) => string;
        };
        defaultImgWidth: number;
        defaultImgHeight: number;
        linkClass: string;
        lastColor: string;
        lastSize: string;
        constructor();
        protected onTag_URL(tagName: string, end: boolean, attr: string): string;
        protected onTag_IMG(tagName: string, end: boolean, attr: string): string;
        protected onTag_B(tagName: string, end: boolean, attr: string): string;
        protected onTag_I(tagName: string, end: boolean, attr: string): string;
        protected onTag_U(tagName: string, end: boolean, attr: string): string;
        protected onTag_Simple(tagName: string, end: boolean, attr: string): string;
        protected onTag_COLOR(tagName: string, end: boolean, attr: string): string;
        protected onTag_FONT(tagName: string, end: boolean, attr: string): string;
        protected onTag_SIZE(tagName: string, end: boolean, attr: string): string;
        protected getTagText(remove?: boolean): string;
        parse(text: string, remove?: boolean): string;
    }
    export var defaultParser: UBBParser;

    export class XML {
        name: string;
        text: string;
        private _attrs;
        private _children;
        constructor(XmlString?: string);
        get attributes(): Record<string, string>;
        getAttrString(attrName: string, defValue?: string): string;
        getAttrInt(attrName: string, defValue?: number): number;
        getAttrFloat(attrName: string, defValue?: number): number;
        getAttrBool(attrName: string, defValue?: boolean): boolean;
        setAttribute(attrName: string, attrValue: string): void;
        getNode(selector: string): XML;
        elements(selector?: string): Array<XML>;
        parse(aSource: string): void;
        reset(): void;
    }
    export enum XMLTagType {
        Start = 0,
        End = 1,
        Void = 2,
        CDATA = 3,
        Comment = 4,
        Instruction = 5
    }
    export class XMLIterator {
        static tagName: string;
        static tagType: XMLTagType;
        static lastTagName: string;
        static source: string;
        static sourceLen: number;
        static parsePos: number;
        static tagPos: number;
        static tagLength: number;
        static lastTagEnd: number;
        static attrParsed: boolean;
        static lowerCaseName: boolean;
        private static _attrs;
        static begin(source: string, lowerCaseName?: boolean): void;
        static nextTag(): boolean;
        static getTagSource(): string;
        static getRawText(trim?: boolean): string;
        static getText(trim?: boolean): string;
        static get attributes(): any;
        static getAttribute(attrName: string): string;
        static parseAttributes(attrs: any): void;
    }

    export class XMLUtils {
        static decodeString(aSource: string): string;
        static encodeString(str: string): string;
        static getString(attrs: any, attrName: string, defValue?: string): string;
        static getInt(attrs: any, attrName: string, defValue?: number): number;
        static getFloat(attrs: any, attrName: string, defValue?: number): number;
        static getBool(attrs: any, attrName: string, defValue?: boolean): boolean;
        static getColor(attrs: any, attrName: string, defValue?: number): number;
    }


    export class PackageItem {
        owner: UIPackage;
        type: number;
        objectType: number;
        id: string;
        name: string;
        width: number;
        height: number;
        file: string;
        decoded?: boolean;
        rawData?: ByteBuffer;
        highResolution?: Array<string>;
        branches?: Array<string>;
        scale9Grid?: Margin;
        scaleByTile?: boolean;
        tileGridIndice?: number;
        smoothing?: boolean;
        interval?: number;
        repeatDelay?: number;
        swing?: boolean;
        extensionType?: any;
        constructor();
        getBranch(): PackageItem;
        getHighResolution(): PackageItem;
    }

    type PackageDependency = {
        id: string;
        name: string;
    };
    export class UIPackage {
        private _id;
        private _name;
        private _path;
        private _items;
        private _itemsById;
        private _itemsByName;
        private _dependencies;
        private _branches;
        constructor();
        static get branch(): string | null;
        static set branch(value: string | null);
        static getVar(key: string): string | null;
        static setVar(key: string, value: string | null): void;
        static getById(id: string): UIPackage;
        static getByName(name: string): UIPackage;
        static loadPackage(url: string): Promise<UIPackage>;
        static removePackage(packageIdOrName: string): void;
        static createObject<T extends GObject>(pkgName: string, resName: string, userClass?: Constructor<T>): T;
        static createObjectFromURL<T extends GObject>(url: string, userClass?: Constructor<T>): T;
        static getItemURL(pkgName: string, resName: string): string;
        static getItemByURL(url: string): PackageItem;
        static normalizeURL(url: string): string;
        private loadPackage;
        dispose(): void;
        get id(): string;
        get name(): string;
        get path(): string;
        get dependencies(): Array<PackageDependency>;
        createObject(resName: string, userClass?: new () => GObject): GObject;
        internalCreateObject(item: PackageItem, userClass?: new () => GObject): GObject;
        getItemById(itemId: string): PackageItem;
        getItemByName(resName: string): PackageItem;
        getItemAssetURL(item: PackageItem): string;
    }

    export class Controller extends EventDispatcher {
        private _selectedIndex;
        private _previousIndex;
        private _pageIds;
        private _pageNames;
        private _actions?;
        name: string;
        parent: GComponent;
        autoRadioGroupDepth?: boolean;
        changing: boolean;
        constructor();
        dispose(): void;
        get selectedIndex(): number;
        set selectedIndex(value: number);
        setSelectedIndex(value: number): void;
        get previousIndex(): number;
        get selectedPage(): string;
        set selectedPage(val: string);
        setSelectedPage(value: string): void;
        get previousPage(): string;
        get pageCount(): number;
        getPageName(index: number): string;
        addPage(name?: string): void;
        addPageAt(name?: string, index?: number): void;
        removePage(name: string): void;
        removePageAt(index: number): void;
        clearPages(): void;
        hasPage(aName: string): boolean;
        getPageIndexById(aId: string): number;
        getPageIdByName(aName: string): string;
        getPageNameById(aId: string): string;
        getPageId(index: number): string;
        get selectedPageId(): string;
        set selectedPageId(val: string);
        set oppositePageId(val: string);
        get previousPageId(): string;
        runActions(): void;
        setup(buffer: ByteBuffer): void;
    }

    export class DragDropManager {
        private _agent;
        private _sourceData;
        static get inst(): DragDropManager;
        constructor();
        get dragAgent(): GObject;
        get dragging(): boolean;
        startDrag(groot: GRoot, icon: string, sourceData?: any, pointerId?: number): void;
        cancel(): void;
        private __dragEnd;
    }

    export type AlignType = "left" | "center" | "right";
    export type VertAlignType = "top" | "middle" | "bottom";
    export enum ButtonMode {
        Common = 0,
        Check = 1,
        Radio = 2
    }
    export enum AutoSizeType {
        None = 0,
        Both = 1,
        Height = 2,
        Shrink = 3,
        Ellipsis = 4
    }
    export enum LoaderFillType {
        None = 0,
        Scale = 1,
        ScaleMatchHeight = 2,
        ScaleMatchWidth = 3,
        ScaleFree = 4,
        ScaleNoBorder = 5
    }
    export enum ListLayoutType {
        SingleColumn = 0,
        SingleRow = 1,
        FlowHorizontal = 2,
        FlowVertical = 3,
        Pagination = 4
    }
    export enum ListSelectionMode {
        Single = 0,
        Multiple = 1,
        Multiple_SingleClick = 2,
        None = 3
    }
    export enum OverflowType {
        Visible = 0,
        Hidden = 1,
        Scroll = 2
    }
    export enum PackageItemType {
        Image = 0,
        MovieClip = 1,
        Sound = 2,
        Component = 3,
        Atlas = 4,
        Font = 5,
        Swf = 6,
        Misc = 7,
        Unknown = 8,
        Spine = 9,
        DragonBones = 10
    }
    export enum ObjectType {
        Image = 0,
        MovieClip = 1,
        Swf = 2,
        Graph = 3,
        Loader = 4,
        Group = 5,
        Text = 6,
        RichText = 7,
        InputText = 8,
        Component = 9,
        List = 10,
        Label = 11,
        Button = 12,
        ComboBox = 13,
        ProgressBar = 14,
        Slider = 15,
        ScrollBar = 16,
        Tree = 17,
        Loader3D = 18
    }
    export enum ProgressTitleType {
        Percent = 0,
        ValueAndMax = 1,
        Value = 2,
        Max = 3
    }
    export enum ScrollBarDisplayType {
        Default = 0,
        Visible = 1,
        Auto = 2,
        Hidden = 3
    }
    export enum ScrollType {
        Horizontal = 0,
        Vertical = 1,
        Both = 2
    }
    export enum FlipType {
        None = 0,
        Horizontal = 1,
        Vertical = 2,
        Both = 3
    }
    export enum ChildrenRenderOrder {
        Ascent = 0,
        Descent = 1,
        Arch = 2
    }
    export enum GroupLayoutType {
        None = 0,
        Horizontal = 1,
        Vertical = 2
    }
    export enum PopupDirection {
        Auto = 0,
        Up = 1,
        Down = 2
    }
    export enum RelationType {
        Left_Left = 0,
        Left_Center = 1,
        Left_Right = 2,
        Center_Center = 3,
        Right_Left = 4,
        Right_Center = 5,
        Right_Right = 6,
        Top_Top = 7,
        Top_Middle = 8,
        Top_Bottom = 9,
        Middle_Middle = 10,
        Bottom_Top = 11,
        Bottom_Middle = 12,
        Bottom_Bottom = 13,
        Width = 14,
        Height = 15,
        LeftExt_Left = 16,
        LeftExt_Right = 17,
        RightExt_Left = 18,
        RightExt_Right = 19,
        TopExt_Top = 20,
        TopExt_Bottom = 21,
        BottomExt_Top = 22,
        BottomExt_Bottom = 23,
        Size = 24
    }
    export enum FillMethod {
        None = 0,
        Horizontal = 1,
        Vertical = 2,
        Radial90 = 3,
        Radial180 = 4,
        Radial360 = 5
    }
    export enum FillOrigin {
        Top = 0,
        Bottom = 1,
        Left = 2,
        Right = 3,
        TopLeft = 0,
        TopRight = 1,
        BottomLeft = 2,
        BottomRight = 3
    }
    export enum FillOrigin90 {
        TopLeft = 0,
        TopRight = 1,
        BottomLeft = 2,
        BottomRight = 3
    }
    export enum ObjectPropID {
        Text = 0,
        Icon = 1,
        Color = 2,
        OutlineColor = 3,
        Playing = 4,
        Frame = 5,
        DeltaTime = 6,
        TimeScale = 7,
        FontSize = 8,
        Selected = 9
    }

    export interface IStage extends UIElement {
        readonly window: Window;
        readonly pointerPos: Vec2;
        readonly touchScreen: boolean;
        readonly touchTarget: UIElement;
        readonly touchCount: number;
        getPointerPos(pointerId?: number, ret?: Vec2): Vec2;
        addPointerMonitor(pointerId: number, target: EventDispatcher): void;
        removePointerMonitor(target: EventDispatcher): void;
        cancelClick(pointerId: number): void;
        validateFocus(container: UIElement, child: UIElement): void;
        focusedElement: UIElement;
        setFocus(value: UIElement, byKey?: boolean): void;
    }


    export class UIElement extends HTMLDivElement {
        $owner: GObject;
        protected _alpha: number;
        protected _touchable: boolean;
        protected _touchDisabled?: boolean;
        protected _visible: boolean;
        protected _grayed: boolean;
        protected _opaque: boolean;
        protected _pos: Vec2;
        protected _contentRect: Rect;
        protected _scale: Vec2;
        protected _rot: number;
        protected _pivot: Vec2;
        protected _clipping?: boolean;
        protected _parent: UIElement;
        protected _children: Array<UIElement>;
        protected _flipX?: boolean;
        protected _flipY?: boolean;
        protected _cursor: string;
        protected _notFocusable?: boolean;
        protected _tabStop?: boolean;
        protected _tabStopChildren?: boolean;
        private _timerID;
        constructor();
        get name(): string;
        set name(value: string);
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        setPosition(x: number, y: number): void;
        get width(): number;
        set width(value: number);
        get height(): number;
        set height(value: number);
        setSize(wv: number, hv: number): void;
        protected onSizeChanged(): void;
        get pivotX(): number;
        set pivotX(value: number);
        get pivotY(): number;
        set pivotY(value: number);
        setPivot(xv: number, yv: number): void;
        get flip(): FlipType;
        set flip(value: FlipType);
        get cursor(): string;
        set cursor(value: string);
        private updateTransform;
        protected updateFilters(): void;
        get scaleX(): number;
        set scaleX(value: number);
        get scaleY(): number;
        set scaleY(value: number);
        setScale(xv: number, yv: number): void;
        get rotation(): number;
        set rotation(value: number);
        get parent(): UIElement;
        get alpha(): number;
        set alpha(value: number);
        get touchable(): boolean;
        set touchable(value: boolean);
        get opaque(): boolean;
        set opaque(value: boolean);
        protected updateTouchableFlag(): void;
        setNotInteractable(): void;
        get visible(): boolean;
        set visible(value: boolean);
        get grayed(): boolean;
        set grayed(value: boolean);
        get focusable(): boolean;
        set focusable(value: boolean);
        get focused(): boolean;
        get tabStop(): boolean;
        set tabStop(value: boolean);
        get tabStopChildren(): boolean;
        set tabStopChildren(value: boolean);
        get onStage(): boolean;
        get stage(): IStage;
        globalToLocal(x: number, y: number, result?: Vec2): Vec2;
        localToGlobal(x: number, y: number, result?: Vec2): Vec2;
        addChild(child: UIElement): void;
        addChildAt(child: UIElement, index: number): void;
        removeChild<T extends UIElement | Node>(child: T): T;
        removeChildAt(index: number): void;
        setChildIndex(child: UIElement, index: number): void;
        getIndex(child: UIElement): number;
        get numChildren(): number;
        isAncestorOf(child: UIElement): boolean;
        get clipping(): boolean;
        set clipping(value: boolean);
        init(): void;
        dispose(): void;
        traverseChildren(callback: (obj: UIElement) => void): void;
        traverseAncestors(callback: (obj: UIElement) => void): void;
        broadcastEvent(type: string, data?: any): void;
        bubbleEvent(initiator: HTMLElement, type: string, data?: any, addChain?: Array<EventDispatcher>): void;
    }

    export class TextField extends UIElement {
        protected _textFormat: TextFormat;
        protected _text: string;
        protected _autoSize: AutoSizeType;
        protected _singleLine: boolean;
        protected _html: boolean;
        protected _maxWidth: number;
        protected _updatingSize: boolean;
        protected _span: HTMLSpanElement;
        protected _textSize: Vec2;
        protected _selectable: boolean;
        constructor();
        init(): void;
        get textFormat(): TextFormat;
        applyFormat(): void;
        get text(): string;
        set text(value: string);
        get htmlText(): string;
        set htmlText(value: string);
        private applyText;
        get autoSize(): AutoSizeType;
        set autoSize(value: AutoSizeType);
        get singleLine(): boolean;
        set singleLine(value: boolean);
        get maxWidth(): number;
        set maxWidth(value: number);
        get selectable(): boolean;
        set selectable(value: boolean);
        get textWidth(): number;
        protected onSizeChanged(): void;
        private updateWrapping;
    }


    type InputElement = HTMLTextAreaElement | HTMLInputElement;
    export class InputTextField extends UIElement {
        protected _promptText: string;
        protected _textFormat: TextFormat;
        protected _text: string;
        protected _singleLine: boolean;
        protected _password: boolean;
        private _input;
        constructor();
        init(): void;
        get htmlInput(): InputElement;
        get textFormat(): TextFormat;
        applyFormat(): void;
        get text(): string;
        set text(value: string);
        get singleLine(): boolean;
        set singleLine(value: boolean);
        private createElement;
        protected updateTouchableFlag(): void;
        setPromptText(value: string): void;
        setMaxLength(value: number): void;
        setKeyboardType(keyboardType: string): void;
        setRestrict(value: string): void;
        get editable(): boolean;
        set editable(value: boolean);
        get password(): boolean;
        set password(value: boolean);
        setSelection(start: number, end: number): void;
    }
    export class TextFormat {
        size: number;
        font: string;
        color: number;
        lineSpacing: number;
        letterSpacing: number;
        bold: boolean;
        underline: boolean;
        italic: boolean;
        strikethrough: boolean;
        align: AlignType;
        verticalAlign: VertAlignType;
        outline: number;
        outlineColor: number;
        shadowOffset: Vec2;
        shadowColor: number;
        copy(source: TextFormat): void;
    }

    export type ButtonStatus = "up" | "down" | "over" | "selectedOver" | "disabled" | "selectedDisabled";
    export class GButton extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        private _mode;
        private _selected;
        private _title;
        private _selectedTitle;
        private _icon;
        private _selectedIcon;
        private _sound;
        private _soundVolumeScale;
        private _buttonController;
        private _relatedController;
        private _relatedPageId;
        private _changeStateOnClick;
        private _downEffect;
        private _downEffectValue;
        private _downScaled;
        private _down;
        private _over;
        constructor();
        get icon(): string;
        set icon(value: string);
        get selectedIcon(): string;
        set selectedIcon(value: string);
        get title(): string;
        set title(value: string);
        get text(): string;
        set text(value: string);
        get selectedTitle(): string;
        set selectedTitle(value: string);
        get titleColor(): number;
        set titleColor(value: number);
        get titleFontSize(): number;
        set titleFontSize(value: number);
        get sound(): string;
        set sound(val: string);
        get soundVolumeScale(): number;
        set soundVolumeScale(value: number);
        set selected(val: boolean);
        get selected(): boolean;
        get mode(): number;
        set mode(value: number);
        get relatedController(): Controller;
        set relatedController(val: Controller);
        get relatedPageId(): string;
        set relatedPageId(val: string);
        get changeStateOnClick(): boolean;
        set changeStateOnClick(value: boolean);
        getTextField(): GTextField | GTextInput;
        fireClick(downEffect?: boolean, clickCall?: boolean): void;
        protected setState(val: ButtonStatus): void;
        protected setCurrentState(): void;
        handleControllerChanged(c: Controller): void;
        protected handleGrayedChanged(): void;
        protected handleTouchableChanged(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        protected constructExtension(buffer: ByteBuffer): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private __rollover;
        private __rollout;
        private __btnTouchBegin;
        private __btnTouchEnd;
        private __removeFromStage;
        private __click;
    }
    export class GComboBox extends GComponent {
        dropdown: GComponent;
        popupDirection: PopupDirection;
        visibleItemCount: number;
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        protected _list: GList;
        protected _items: string[];
        protected _icons?: string[];
        protected _values: string[];
        private _itemsUpdated;
        private _selectedIndex;
        private _buttonController;
        private _selectionController;
        private _down;
        private _over;
        constructor();
        get text(): string;
        set text(value: string);
        get titleColor(): number;
        set titleColor(value: number);
        get titleFontSize(): number;
        set titleFontSize(value: number);
        get icon(): string;
        set icon(value: string);
        get items(): string[];
        set items(value: string[]);
        get icons(): string[];
        set icons(value: string[]);
        get values(): string[];
        set values(value: string[]);
        get selectedIndex(): number;
        set selectedIndex(val: number);
        get value(): string;
        set value(val: string);
        getTextField(): GTextField | GTextInput;
        protected setState(val: string): void;
        protected setCurrentState(): void;
        get selectionController(): Controller;
        set selectionController(value: Controller);
        handleControllerChanged(c: Controller): void;
        private updateSelectionController;
        dispose(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        protected constructExtension(buffer: ByteBuffer): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        protected showDropdown(): void;
        private __popupWinClosed;
        private __clickItem;
        private __rollover;
        private __rollout;
        private __mousedown;
        private __mouseup;
    }
    export class GComponent extends GObject {
        private _sortingChildCount;
        private _applyingController?;
        protected _margin: Margin;
        protected _boundsChanged: boolean;
        protected _childrenRenderOrder: number;
        protected _apexIndex: number;
        _trackBounds: boolean;
        _buildingDisplayList: boolean;
        _children: GObject[];
        _controllers: Controller[];
        _transitions: Transition[];
        _container: UIElement;
        _scrollPane: ScrollPane;
        _alignOffset: Vec2;
        constructor();
        protected createElement(): void;
        dispose(): void;
        get displayListContainer(): UIElement;
        get tabStopChildren(): boolean;
        set tabStopChildren(value: boolean);
        addChild(child: GObject): GObject;
        addChildAt(child: GObject, index: number): GObject;
        private getInsertPosForSortingChild;
        removeChild(child: GObject, dispose?: boolean): GObject;
        removeChildAt(index: number, dispose?: boolean): GObject;
        removeChildren(beginIndex?: number, endIndex?: number, dispose?: boolean): void;
        getChildAt<T extends GObject>(index: number, classType?: Constructor<T>): T;
        getChild<T extends GObject>(name: string, classType?: Constructor<T>): T;
        getChildByPath<T extends GObject>(path: String, classType?: Constructor<T>): T;
        getVisibleChild(name: string): GObject;
        getChildInGroup(name: string, group: GGroup): GObject;
        getChildById(id: string): GObject;
        getChildIndex(child: GObject): number;
        setChildIndex(child: GObject, index: number): void;
        setChildIndexBefore(child: GObject, index: number): number;
        private _setChildIndex;
        swapChildren(child1: GObject, child2: GObject): void;
        swapChildrenAt(index1: number, index2: number): void;
        get numChildren(): number;
        getChildren(): ReadonlyArray<GObject>;
        isAncestorOf(child: GObject): boolean;
        addController(controller: Controller): void;
        getControllerAt(index: number): Controller;
        getController(name: string): Controller;
        removeController(c: Controller): void;
        get controllers(): Controller[];
        childStateChanged(child: GObject): void;
        private buildNativeDisplayList;
        applyController(c: Controller): void;
        applyAllControllers(): void;
        adjustRadioGroupDepth(obj: GObject, c: Controller): void;
        getTransitionAt(index: number): Transition;
        getTransition(transName: string): Transition;
        isChildInView(child: GObject): boolean;
        getFirstChildInView(): number;
        get scrollPane(): ScrollPane;
        get opaque(): boolean;
        set opaque(value: boolean);
        get margin(): Margin;
        set margin(value: Margin);
        get childrenRenderOrder(): number;
        set childrenRenderOrder(value: number);
        get apexIndex(): number;
        set apexIndex(value: number);
        get baseUserData(): string;
        protected setupScroll(buffer: ByteBuffer): void;
        protected setupOverflow(overflow: number): void;
        protected handleSizeChanged(): void;
        protected handleGrayedChanged(): void;
        handleControllerChanged(c: Controller): void;
        setBoundsChangedFlag(): void;
        private __render;
        ensureBoundsCorrect(): void;
        protected updateBounds(): void;
        setBounds(ax: number, ay: number, aw: number, ah: number): void;
        get viewWidth(): number;
        set viewWidth(value: number);
        get viewHeight(): number;
        set viewHeight(value: number);
        getSnappingPosition(xValue: number, yValue: number, resultPoint?: Vec2): Vec2;
        /**
         * dir正数表示右移或者下移，负数表示左移或者上移
         */
        getSnappingPositionWithDir(xValue: number, yValue: number, xDir: number, yDir: number, resultPoint?: Vec2): Vec2;
        childSortingOrderChanged(child: GObject, oldValue: number, newValue: number): void;
        constructFromResource(): void;
        constructFromResource2(objectPool: GObject[], poolIndex: number): void;
        protected constructExtension(buffer: ByteBuffer): void;
        protected onConstruct(): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
    export class Shape extends UIElement {
        protected _color: number;
        protected _type: number;
        constructor();
        init(): void;
        get color(): number;
        set color(value: number);
        drawRect(lineWidth: number, lineColor: Color, fillColor: Color): void;
        drawRoundRect(lineWidth: number, lineColor: Color, fillColor: Color, topLeftRadius: number, topRightRadius: number, bottomLeftRadius: number, bottomRightRadius: number): void;
        drawEllipse(lineWidth: number, lineColor: Color, fillColor: Color, startDegree?: number, endDegree?: number): void;
        drawPolygon(points: Array<number>, fillColor: Color, lineWidth?: number, lineColor?: Color): void;
        drawRegularPolygon(sides: number, lineWidth: number, centerColor: Color, lineColor: Color, fillColor: Color, rotation: number, distances: Array<number>): void;
        clear(): void;
        setType(type: number): void;
        protected onSizeChanged(): void;
    }


    export class GGraph extends GObject {
        protected _element: Shape;
        constructor();
        protected createElement(): void;
        get color(): number;
        set color(value: number);
        get element(): Shape;
        replaceMe(target: GObject): void;
        setNativeObject(obj: UIElement): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
    export class Image extends UIElement {
        protected _src: string;
        protected _color: number;
        protected _scaleByTile: boolean;
        protected _scale9Grid: Margin;
        protected _textureScale: Vec2;
        protected _tileGridIndice: number;
        private _timerID_1;
        constructor();
        get src(): string;
        set src(value: string);
        get color(): number;
        set color(value: number);
        get textureScale(): Vec2;
        set textureScale(value: Vec2);
        get scale9Grid(): Margin;
        set scale9Grid(value: Margin);
        get scaleByTile(): boolean;
        set scaleByTile(value: boolean);
        get tileGridIndice(): number;
        set tileGridIndice(value: number);
        get fillMethod(): number;
        set fillMethod(value: number);
        get fillOrigin(): number;
        set fillOrigin(value: number);
        get fillClockwise(): boolean;
        set fillClockwise(value: boolean);
        get fillAmount(): number;
        set fillAmount(value: number);
        protected updateFilters(): void;
        protected refresh(): void;
    }

    export class GImage extends GObject {
        protected _element: UIElement & Image;
        private _contentItem;
        constructor();
        get color(): number;
        set color(value: number);
        get flip(): number;
        set flip(value: number);
        get fillMethod(): number;
        set fillMethod(value: number);
        get fillOrigin(): number;
        set fillOrigin(value: number);
        get fillClockwise(): boolean;
        set fillClockwise(value: boolean);
        get fillAmount(): number;
        set fillAmount(value: number);
        protected createElement(): void;
        protected handleSizeChanged(): void;
        constructFromResource(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
    export class GLabel extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        constructor();
        get icon(): string;
        set icon(value: string);
        get title(): string;
        set title(value: string);
        get text(): string;
        set text(value: string);
        get titleColor(): number;
        set titleColor(value: number);
        get titleFontSize(): number;
        set titleFontSize(value: number);
        get color(): number;
        set color(value: number);
        set editable(val: boolean);
        get editable(): boolean;
        getTextField(): GTextField | GTextInput;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        protected constructExtension(buffer: ByteBuffer): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
    export type ListItemRenderer = (index: number, item: GObject) => void;
    export class GList extends GComponent {
        itemRenderer: ListItemRenderer;
        itemProvider: (index: number) => string;
        scrollItemToViewOnClick: boolean;
        foldInvisibleItems: boolean;
        private _layout;
        private _lineCount;
        private _columnCount;
        private _lineGap;
        private _columnGap;
        private _defaultItem;
        private _autoResizeItem;
        private _selectionMode;
        private _align;
        private _valign;
        private _selectionController?;
        private _lastSelectedIndex;
        private _triggerFocusEvents?;
        private _keySelectEvent?;
        private _pool;
        private _virtual;
        private _loop;
        private _numItems;
        private _realNumItems;
        private _firstIndex;
        private _curLineItemCount;
        private _curLineItemCount2;
        private _itemSize;
        private _virtualListChanged;
        private _virtualItems;
        private _eventLocked;
        private itemInfoVer;
        constructor();
        dispose(): void;
        get layout(): number;
        set layout(value: number);
        get lineCount(): number;
        set lineCount(value: number);
        get columnCount(): number;
        set columnCount(value: number);
        get lineGap(): number;
        set lineGap(value: number);
        get columnGap(): number;
        set columnGap(value: number);
        get align(): AlignType;
        set align(value: AlignType);
        get verticalAlign(): VertAlignType;
        set verticalAlign(value: VertAlignType);
        get virtualItemSize(): Vec2;
        set virtualItemSize(value: Vec2);
        get defaultItem(): string;
        set defaultItem(val: string);
        get autoResizeItem(): boolean;
        set autoResizeItem(value: boolean);
        get selectionMode(): number;
        set selectionMode(value: number);
        get selectionController(): Controller;
        set selectionController(value: Controller);
        get itemPool(): GObjectPool;
        getFromPool(url?: string): GObject;
        returnToPool(obj: GObject): void;
        setDefaultItemSize(sizeX: number, sizeY: number): void;
        addChildAt(child: GObject, index: number): GObject;
        addItem(url?: string): GObject;
        addItemFromPool(url?: string): GObject;
        removeChildAt(index: number, dispose?: boolean): GObject;
        removeChildToPoolAt(index: number): void;
        removeChildToPool(child: GObject): void;
        removeChildrenToPool(beginIndex?: number, endIndex?: number): void;
        get selectedIndex(): number;
        set selectedIndex(value: number);
        getSelection(result?: number[]): number[];
        addSelection(index: number, scrollItToView?: boolean): void;
        removeSelection(index: number): void;
        clearSelection(): void;
        private clearSelectionExcept;
        selectAll(): void;
        selectNone(): void;
        selectReverse(): void;
        enableSelectionFocusEvents(enabled: boolean): void;
        private notifySelection;
        enableArrowKeyNavigation(enabled: boolean, keySelectEvent?: string): void;
        private __keydown;
        handleArrowKey(dir: number): number;
        private __clickItem;
        protected dispatchItemEvent(item: GObject, evt: Event): void;
        private setSelectionOnEvent;
        resizeToFit(itemCount?: number, minSize?: number): void;
        getMaxItemWidth(): number;
        protected handleSizeChanged(): void;
        handleControllerChanged(c: Controller): void;
        private updateSelectionController;
        private shouldSnapToNext;
        getSnappingPositionWithDir(xValue: number, yValue: number, xDir: number, yDir: number, resultPoint?: Vec2): Vec2;
        scrollToView(index: number, ani?: boolean, setFirst?: boolean): void;
        get touchItem(): GObject | null;
        getFirstChildInView(): number;
        childIndexToItemIndex(index: number): number;
        itemIndexToChildIndex(index: number): number;
        setVirtual(): void;
        /**
         * Set the list to be virtual list, and has loop behavior.
         */
        setVirtualAndLoop(): void;
        private _setVirtual;
        get numItems(): number;
        set numItems(value: number);
        refreshVirtualList(): void;
        private checkVirtualList;
        private setVirtualListChangedFlag;
        private _refreshVirtualList;
        private __scrolled;
        private getIndexOnPos1;
        private getIndexOnPos2;
        private getIndexOnPos3;
        private handleScroll;
        private handleScroll1;
        private handleScroll2;
        private handleScroll3;
        private handleArchOrder1;
        private handleArchOrder2;
        private handleAlign;
        protected updateBounds(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        protected readItems(buffer: ByteBuffer): void;
        protected setupItem(buffer: ByteBuffer, obj: GObject): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
    export class GLoader extends GObject {
        private _url;
        private _align;
        private _valign;
        private _autoSize;
        private _fill;
        private _shrinkOnly;
        private _contentItem;
        private _content;
        private _content2?;
        private _updatingLayout;
        private _loadingImg?;
        constructor();
        protected createElement(): void;
        dispose(): void;
        get url(): string;
        set url(value: string);
        get icon(): string;
        set icon(value: string);
        get align(): AlignType;
        set align(value: AlignType);
        get verticalAlign(): VertAlignType;
        set verticalAlign(value: VertAlignType);
        get fill(): number;
        set fill(value: number);
        get shrinkOnly(): boolean;
        set shrinkOnly(value: boolean);
        get autoSize(): boolean;
        set autoSize(value: boolean);
        get playing(): boolean;
        set playing(value: boolean);
        get frame(): number;
        set frame(value: number);
        get color(): number;
        set color(value: number);
        get fillMethod(): number;
        set fillMethod(value: number);
        get fillOrigin(): number;
        set fillOrigin(value: number);
        get fillClockwise(): boolean;
        set fillClockwise(value: boolean);
        get fillAmount(): number;
        set fillAmount(value: number);
        get content(): Image;
        get component(): GComponent;
        protected loadContent(): void;
        protected loadFromPackage(itemURL: string): void;
        protected loadExternal(): void;
        private setErrorState;
        private clearErrorState;
        private updateLayout;
        private clearContent2;
        private clearContent;
        protected handleSizeChanged(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
    export class GObjectPool {
        private _pool;
        private _count;
        constructor();
        clear(): void;
        get count(): number;
        getObject(url: string): GObject;
        returnObject(obj: GObject): void;
    }
    export class GProgressBar extends GComponent {
        private _min;
        private _max;
        private _value;
        private _titleType;
        private _reverse;
        private _titleObject;
        private _aniObject;
        private _barObjectH;
        private _barObjectV;
        private _barMaxWidth;
        private _barMaxHeight;
        private _barMaxWidthDelta;
        private _barMaxHeightDelta;
        private _barStartX;
        private _barStartY;
        constructor();
        get titleType(): number;
        set titleType(value: number);
        get min(): number;
        set min(value: number);
        get max(): number;
        set max(value: number);
        get value(): number;
        set value(value: number);
        tweenValue(value: number, duration: number): GTweener;
        update(newValue: number): void;
        private setFillAmount;
        protected constructExtension(buffer: ByteBuffer): void;
        protected handleSizeChanged(): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
    export class GRichTextField extends GTextField {
        linkClass: string;
        constructor();
        protected createElement(): void;
        protected setText(): void;
    }
    export class GRoot extends GComponent {
        private _modalLayer;
        private _popupStack;
        private _justClosedPopups;
        private _modalWaitPane;
        private _tooltipWin;
        private _defaultTooltipWin;
        protected _element: IStage;
        static get inst(): GRoot;
        static getInst(obj: GObject): GRoot;
        constructor(ownerWindow?: Window);
        protected createElement(): void;
        get element(): IStage;
        get pointerPos(): Vec2;
        get touchScreen(): boolean;
        get touchCount(): number;
        getPointerPos(pointerId?: number, ret?: Vec2): Vec2;
        get touchTarget(): GObject | null;
        get focusedObj(): GObject | null;
        showWindow(win: GWindow): void;
        hideWindow(win: GWindow): void;
        hideWindowImmediately(win: GWindow): void;
        bringToFront(win: GWindow): void;
        showModalWait(msg?: string): void;
        closeModalWait(): void;
        closeAllExceptModals(): void;
        closeAllWindows(): void;
        getTopWindow(): GWindow;
        get modalLayer(): GObject;
        get hasModalWindow(): boolean;
        get modalWaiting(): boolean;
        showPopup(popup: GObject, target?: GObject, dir?: PopupDirection): void;
        togglePopup(popup: GObject, target?: GObject, dir?: PopupDirection): void;
        hidePopup(popup?: GObject): void;
        get hasAnyPopup(): boolean;
        private closePopup;
        showTooltips(msg: string): void;
        showTooltipsWin(tooltipWin: GObject, xx?: number, yy?: number): void;
        hideTooltips(): void;
        static playOneShotSound(url: string, volumeScale?: number): void;
        private adjustModalLayer;
        checkPopups(): void;
        private __elementTouchBegin;
    }
    export class GScrollBar extends GComponent {
        private _grip;
        private _arrowButton1;
        private _arrowButton2;
        private _bar;
        private _target;
        private _vertical;
        private _scrollPerc;
        private _fixedGripSize;
        private _dragOffset;
        private _gripDragging;
        constructor();
        setScrollPane(target: ScrollPane, vertical: boolean): void;
        setDisplayPerc(value: number): void;
        setScrollPerc(val: number): void;
        get minSize(): number;
        get gripDragging(): boolean;
        protected constructExtension(buffer: ByteBuffer): void;
        private __gripTouchBegin;
        private __gripTouchMove;
        private __gripTouchEnd;
        private __arrowButton1Click;
        private __arrowButton2Click;
        private __barTouchBegin;
    }
    export class GSlider extends GComponent {
        changeOnClick: boolean;
        canDrag: boolean;
        private _min;
        private _max;
        private _value;
        private _titleType;
        private _reverse;
        private _wholeNumbers;
        private _titleObject;
        private _barObjectH;
        private _barObjectV;
        private _barMaxWidth;
        private _barMaxHeight;
        private _barMaxWidthDelta;
        private _barMaxHeightDelta;
        private _gripObject;
        private _clickPos;
        private _clickPercent;
        private _barStartX;
        private _barStartY;
        constructor();
        get titleType(): number;
        set titleType(value: number);
        get wholeNumbers(): boolean;
        set wholeNumbers(value: boolean);
        get min(): number;
        set min(value: number);
        get max(): number;
        set max(value: number);
        get value(): number;
        set value(value: number);
        update(): void;
        private updateWithPercent;
        protected constructExtension(buffer: ByteBuffer): void;
        protected handleSizeChanged(): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private __gripTouchBegin;
        private __gripTouchMove;
        private __barTouchBegin;
    }
    export type TextTemplate = {
        [index: string]: string;
    };
    export class GTextField extends GObject {
        protected _element: TextField;
        protected _text: string;
        protected _ubbEnabled: boolean;
        protected _updatingSize: boolean;
        protected _template: TextTemplate;
        constructor();
        protected createElement(): void;
        get element(): TextField;
        get text(): string;
        set text(value: string);
        protected setText(): void;
        get textTemplate(): TextTemplate;
        set textTemplate(value: TextTemplate);
        setVar(name: string, value: string): GTextField;
        flushVars(): void;
        get textFormat(): TextFormat;
        applyFormat(): void;
        get singleLine(): boolean;
        set singleLine(value: boolean);
        set ubbEnabled(value: boolean);
        get ubbEnabled(): boolean;
        get autoSize(): number;
        set autoSize(value: number);
        get color(): number;
        set color(value: number);
        get textWidth(): number;
        get selectable(): boolean;
        set selectable(value: boolean);
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        private updateSize;
        protected handleSizeChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        protected parseTemplate(template: string): string;
    }
    export class GTextInput extends GObject {
        protected _element: InputTextField;
        constructor();
        protected createElement(): void;
        get element(): InputTextField;
        get text(): string;
        set text(value: string);
        get textFormat(): TextFormat;
        applyFormat(): void;
        get singleLine(): boolean;
        set singleLine(value: boolean);
        get color(): number;
        set color(value: number);
        get password(): boolean;
        set password(value: boolean);
        set editable(value: boolean);
        get editable(): boolean;
        setMaxLength(value: number): void;
        setPromptText(value: string): void;
        setRestrict(value: string): void;
        setKeyboardType(value: string): void;
        setSelection(start: number, end: number): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
    export class GTree extends GList {
        treeNodeRender: (node: GTreeNode, obj: GComponent) => void;
        treeNodeWillExpand: (node: GTreeNode, expanded: boolean) => void;
        private _indent;
        private _clickToExpand;
        private _rootNode;
        constructor();
        get rootNode(): GTreeNode;
        get indent(): number;
        set indent(value: number);
        get clickToExpand(): number;
        set clickToExpand(value: number);
        getSelectedNode(): GTreeNode;
        getSelectedNodes(result?: Array<GTreeNode>): Array<GTreeNode>;
        selectNode(node: GTreeNode, scrollItToView?: boolean): void;
        unselectNode(node: GTreeNode): void;
        expandAll(folderNode?: GTreeNode): void;
        collapseAll(folderNode?: GTreeNode): void;
        private createCell;
        private getInsertIndexForNode;
        private getFolderEndIndex;
        private checkChildren;
        private hideFolderNode;
        private removeNode;
        protected dispatchItemEvent(item: GObject, evt: Event): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        protected readItems(buffer: ByteBuffer): void;
    }
    export class GTreeNode {
        data?: any;
        private _parent;
        private _children;
        private _expanded;
        private _level;
        private _indentLevel;
        private _addIndent?;
        private _tree;
        private _cell;
        private _indentObj;
        private _resURL?;
        private _leafController;
        private _isFolder;
        onExpanded?: (expand: boolean) => void;
        constructor(isFolder?: boolean, resURL?: string, addIndent?: number);
        set expanded(value: boolean);
        get expanded(): boolean;
        get isFolder(): boolean;
        set isFolder(value: boolean);
        get parent(): GTreeNode;
        get text(): string;
        set text(value: string);
        get icon(): string;
        set icon(value: string);
        get cell(): GComponent;
        set cell(value: GComponent);
        createCell(): void;
        get level(): number;
        addChild(child: GTreeNode): GTreeNode;
        addChildAt(child: GTreeNode, index: number): GTreeNode;
        removeChild(child: GTreeNode): GTreeNode;
        removeChildAt(index: number): GTreeNode;
        removeChildren(beginIndex?: number, endIndex?: number): void;
        getChildAt(index: number): GTreeNode;
        getChildIndex(child: GTreeNode): number;
        getPrevSibling(): GTreeNode;
        getNextSibling(): GTreeNode;
        setChildIndex(child: GTreeNode, index: number): void;
        swapChildren(child1: GTreeNode, child2: GTreeNode): void;
        swapChildrenAt(index1: number, index2: number): void;
        get numChildren(): number;
        getChildren(): ReadonlyArray<GTreeNode>;
        expandToRoot(): void;
        get tree(): GTree;
        _setTree(value: GTree): void;
        private __expandedStateChanged;
        private __cellMouseDown;
        private __clickExpandButton;
    }
    export interface IUISource {
        fileName: string;
        loaded: boolean;
        load(callback: Function, target: any): void;
    }
    export class GWindow extends GComponent {
        bringToFontOnClick: boolean;
        private _contentPane;
        private _modalWaitPane;
        private _closeButton;
        private _dragArea;
        private _contentArea;
        private _frame;
        private _modal;
        private _uiSources;
        private _inited;
        private _loading;
        protected _requestingCmd: number;
        constructor();
        addUISource(source: IUISource): void;
        set contentPane(val: GComponent);
        get contentPane(): GComponent;
        get frame(): GComponent;
        get closeButton(): GObject;
        set closeButton(value: GObject);
        get dragArea(): GObject;
        set dragArea(value: GObject);
        get contentArea(): GObject;
        set contentArea(value: GObject);
        show(groot?: GRoot): void;
        hide(): void;
        hideImmediately(): void;
        centerOn(r: GRoot, restraint?: boolean): void;
        toggleStatus(): void;
        get isShowing(): boolean;
        get isTop(): boolean;
        get modal(): boolean;
        set modal(val: boolean);
        bringToFront(): void;
        showModalWait(requestingCmd?: number): void;
        protected layoutModalWaitPane(): void;
        closeModalWait(requestingCmd?: number): boolean;
        get modalWaiting(): boolean;
        init(): void;
        protected onInit(): void;
        protected onShown(): void;
        protected onHide(): void;
        protected doShowAnimation(): void;
        protected doHideAnimation(): void;
        private __uiLoadComplete;
        private _init;
        dispose(): void;
        protected closeEventHandler(): void;
        private __onShown;
        private __onHidden;
        private __winTouchBegin;
        private __dragStart;
    }
    export class PopupMenu {
        visibleItemCount: number;
        hideOnClickItem: boolean;
        autoSize: boolean;
        protected _contentPane: GComponent;
        protected _list: GList;
        constructor(resourceURL?: string);
        dispose(): void;
        addItem(caption: string, handler?: Function, target?: any): GButton;
        addItemAt(caption: string, index: number, handler?: Function, target?: any): GButton;
        private createItem;
        addSeperator(index?: number): void;
        getItemName(index: number): string;
        setItemText(name: string, caption: string): void;
        setItemVisible(name: string, visible: boolean): void;
        setItemGrayed(name: string, grayed: boolean): void;
        setItemCheckable(name: string, checkable: boolean): void;
        setItemChecked(name: string, checked: boolean): void;
        isItemChecked(name: string): boolean;
        removeItem(name: string): boolean;
        clearItems(): void;
        get itemCount(): number;
        get contentPane(): GComponent;
        get list(): GList;
        show(target?: GObject, dir?: PopupDirection, parentMenu?: PopupMenu): void;
        hide(): void;
        private __clickItem;
        private __addedToStage;
    }
    export class RelationItem {
        private _owner;
        private _target;
        private _defs;
        private _targetX;
        private _targetY;
        private _targetWidth;
        private _targetHeight;
        constructor(owner: GObject);
        get owner(): GObject;
        set target(value: GObject);
        get target(): GObject;
        add(relationType: number, usePercent: boolean): void;
        internalAdd(relationType: number, usePercent: boolean): void;
        remove(relationType: number): void;
        copy(source: RelationItem): void;
        dispose(): void;
        get isEmpty(): boolean;
        applyOnSelfResized(dWidth: number, dHeight: number, applyPivot: boolean): void;
        private applyOnXYChanged;
        private applyOnSizeChanged;
        private addRefTarget;
        private releaseRefTarget;
        private __targetXYChanged;
        private __targetSizeChanged;
    }
    export class Relations {
        private _owner;
        private _items;
        handling: GObject;
        constructor(owner: GObject);
        add(target: GObject, relationType: number, usePercent?: boolean): void;
        remove(target: GObject, relationType?: number): void;
        contains(target: GObject): boolean;
        clearFor(target: GObject): void;
        clearAll(): void;
        copyFrom(source: Relations): void;
        dispose(): void;
        onOwnerSizeChanged(dWidth: number, dHeight: number, applyPivot: boolean): void;
        get empty(): boolean;
        setup(buffer: ByteBuffer, parentToChild: boolean): void;
    }
    export class ScrollPane {
        static draggingPane: ScrollPane;
        private _owner;
        private _container;
        private _maskContainer;
        private _scrollType;
        private _scrollStep;
        private _decelerationRate;
        private _scrollBarMargin;
        private _bouncebackEffect;
        private _touchEffectButton;
        private _scrollBarDisplayAuto?;
        private _vScrollNone;
        private _hScrollNone;
        private _needRefresh;
        private _refreshBarAxis;
        private _displayOnLeft?;
        private _snapToItem?;
        _displayInDemand?: boolean;
        private _mouseWheelEnabled;
        private _pageMode?;
        private _inertiaDisabled?;
        private _floating?;
        private _xPos;
        private _yPos;
        private _viewSize;
        private _contentSize;
        private _overlapSize;
        private _pageSize;
        private _containerPos;
        private _beginTouchPos;
        private _lastTouchPos;
        private _lastTouchGlobalPos;
        private _velocity;
        private _velocityScale;
        private _lastMoveTime;
        private _isHoldAreaDone;
        private _aniFlag;
        _loop: number;
        private _headerLockedSize;
        private _footerLockedSize;
        private _refreshEventDispatching;
        private _dragged;
        private _hover?;
        private _lastAutoScroll?;
        private _autoScrollThresold?;
        private _tweening;
        private _tweenTime;
        private _tweenDuration;
        private _tweenStart;
        private _tweenChange;
        private _pageController?;
        private _hzScrollBar?;
        private _vtScrollBar?;
        private _header?;
        private _footer?;
        constructor(owner: GComponent);
        setup(buffer: ByteBuffer): void;
        dispose(): void;
        get owner(): GComponent;
        get hzScrollBar(): GScrollBar;
        get vtScrollBar(): GScrollBar;
        get header(): GComponent;
        get footer(): GComponent;
        get bouncebackEffect(): boolean;
        set bouncebackEffect(sc: boolean);
        get touchEffect(): boolean;
        set touchEffect(sc: boolean);
        get touchEffectButton(): number;
        set touchEffectButton(value: number);
        set scrollStep(val: number);
        get scrollStep(): number;
        get snapToItem(): boolean;
        set snapToItem(value: boolean);
        get mouseWheelEnabled(): boolean;
        set mouseWheelEnabled(value: boolean);
        get decelerationRate(): number;
        set decelerationRate(value: number);
        get isDragged(): boolean;
        get percX(): number;
        set percX(value: number);
        setPercX(value: number, ani?: boolean): void;
        get percY(): number;
        set percY(value: number);
        setPercY(value: number, ani?: boolean): void;
        get posX(): number;
        set posX(value: number);
        setPosX(value: number, ani?: boolean): void;
        get posY(): number;
        set posY(value: number);
        setPosY(value: number, ani?: boolean): void;
        get contentWidth(): number;
        get contentHeight(): number;
        get viewWidth(): number;
        set viewWidth(value: number);
        get viewHeight(): number;
        set viewHeight(value: number);
        get currentPageX(): number;
        set currentPageX(value: number);
        get currentPageY(): number;
        set currentPageY(value: number);
        setCurrentPageX(value: number, ani?: boolean): void;
        setCurrentPageY(value: number, ani?: boolean): void;
        get isBottomMost(): boolean;
        get isRightMost(): boolean;
        get pageController(): Controller;
        set pageController(value: Controller);
        get scrollingPosX(): number;
        get scrollingPosY(): number;
        scrollTop(ani?: boolean): void;
        scrollBottom(ani?: boolean): void;
        scrollUp(ratio?: number, ani?: boolean): void;
        scrollDown(ratio?: number, ani?: boolean): void;
        scrollLeft(ratio?: number, ani?: boolean): void;
        scrollRight(ratio?: number, ani?: boolean): void;
        scrollToView(target: GObject | Rect, ani?: boolean, setFirst?: boolean): void;
        isChildInView(obj: GObject): boolean;
        cancelDragging(): void;
        lockHeader(size: number): void;
        lockFooter(size: number): void;
        onOwnerSizeChanged(): void;
        handleControllerChanged(c: Controller): void;
        private updatePageController;
        adjustMaskContainer(): void;
        setSize(aWidth: number, aHeight: number): void;
        setContentSize(aWidth: number, aHeight: number): void;
        changeContentSizeOnScrolling(deltaWidth: number, deltaHeight: number, deltaPosX: number, deltaPosY: number): void;
        private handleSizeChanged;
        private posChanged;
        private refresh;
        private refresh2;
        private __touchBegin;
        private __touchMove;
        private __touchEnd;
        private __mouseWheel;
        private __rollOver;
        private __rollOut;
        private __dragOver;
        private updateScrollBarPos;
        updateScrollBarVisible(): void;
        private updateScrollBarVisible2;
        private __barTweenComplete;
        private getLoopPartSize;
        private loopCheckingCurrent;
        private loopCheckingTarget;
        private loopCheckingTarget2;
        private loopCheckingNewPos;
        private alignPosition;
        private alignByPage;
        private updateTargetAndDuration;
        private updateTargetAndDuration2;
        private fixDuration;
        private startTween;
        private killTween;
        private checkRefreshBar;
        private tweenUpdate;
        private runTween;
    }
    export class Transition {
        name: string;
        private _owner;
        private _ownerBaseX;
        private _ownerBaseY;
        private _items;
        private _totalTimes;
        private _totalTasks;
        private _playing;
        private _paused;
        private _onComplete;
        private _options;
        private _reversed;
        private _totalDuration;
        private _autoPlay;
        private _autoPlayTimes;
        private _autoPlayDelay;
        private _timeScale;
        private _startTime;
        private _endTime;
        constructor(owner: GComponent);
        play(onComplete?: Function, times?: number, delay?: number, startTime?: number, endTime?: number): void;
        playReverse(onComplete?: Function, times?: number, delay?: number, startTime?: number, endTime?: number): void;
        changePlayTimes(value: number): void;
        setAutoPlay(value: boolean, times?: number, delay?: number): void;
        private _play;
        stop(setToComplete?: boolean, processCallback?: boolean): void;
        private stopItem;
        setPaused(paused: boolean): void;
        dispose(): void;
        get playing(): boolean;
        setValue(label: string, ...args: any[]): void;
        setHook(label: string, callback: Function): void;
        clearHooks(): void;
        setTarget(label: string, newTarget: GObject): void;
        setDuration(label: string, value: number): void;
        getLabelTime(label: string): number;
        get timeScale(): number;
        set timeScale(value: number);
        updateFromRelations(targetId: string, dx: number, dy: number): void;
        onOwnerAddedToStage(): void;
        onOwnerRemovedFromStage(): void;
        private onDelayedPlay;
        private internalPlay;
        private playItem;
        private skipAnimations;
        private onDelayedPlayItem;
        private onTweenStart;
        private onTweenUpdate;
        private onTweenComplete;
        private onPlayTransCompleted;
        private callHook;
        private checkAllComplete;
        private applyValue;
        setup(buffer: ByteBuffer): void;
        private decodeValue;
    }

    export class GObject extends EventDispatcher {
        data?: any;
        packageItem?: PackageItem;
        static draggingObject: GObject;
        private _x;
        private _y;
        private _z;
        private _alpha;
        private _visible;
        private _touchable;
        private _grayed;
        private _draggable;
        private _scaleX;
        private _scaleY;
        private _skewX;
        private _skewY;
        private _pivotX;
        private _pivotY;
        private _pivotAsAnchor;
        private _sortingOrder;
        private _internalVisible;
        private _handlingController?;
        private _tooltips;
        private _relations;
        private _group;
        private _gears;
        private _dragBounds;
        protected _element: UIElement;
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
        sourceWidth: number;
        sourceHeight: number;
        initWidth: number;
        initHeight: number;
        constructor();
        get id(): string;
        get name(): string;
        set name(value: string);
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        get z(): number;
        set z(value: number);
        setPosition(xv: number, yv: number, zv?: number): void;
        get xMin(): number;
        set xMin(value: number);
        get yMin(): number;
        set yMin(value: number);
        center(restraint?: boolean): void;
        get width(): number;
        set width(value: number);
        get height(): number;
        set height(value: number);
        setSize(wv: number, hv: number, ignorePivot?: boolean): void;
        protected setSizeDirectly(wv: number, hv: number): void;
        makeFullScreen(): void;
        get actualWidth(): number;
        get actualHeight(): number;
        get scaleX(): number;
        set scaleX(value: number);
        get scaleY(): number;
        set scaleY(value: number);
        setScale(sx: number, sy: number): void;
        get skewX(): number;
        set skewX(value: number);
        get skewY(): number;
        set skewY(value: number);
        setSkew(sx: number, sy: number): void;
        get pivotX(): number;
        set pivotX(value: number);
        get pivotY(): number;
        set pivotY(value: number);
        setPivot(xv: number, yv: number, asAnchor?: boolean): void;
        get pivotAsAnchor(): boolean;
        get touchable(): boolean;
        set touchable(value: boolean);
        get grayed(): boolean;
        set grayed(value: boolean);
        get enabled(): boolean;
        set enabled(value: boolean);
        get rotation(): number;
        set rotation(value: number);
        get alpha(): number;
        set alpha(value: number);
        get visible(): boolean;
        set visible(value: boolean);
        get internalVisible(): boolean;
        get internalVisible2(): boolean;
        get internalVisible3(): boolean;
        get sortingOrder(): number;
        set sortingOrder(value: number);
        get tooltips(): string;
        set tooltips(value: string);
        private __rollOver;
        private __doShowTooltips;
        private __rollOut;
        get focusable(): boolean;
        set focusable(value: boolean);
        get tabStop(): boolean;
        set tabStop(value: boolean);
        get focused(): boolean;
        requestFocus(byKey?: boolean): void;
        get cursor(): string;
        set cursor(value: string);
        get onStage(): boolean;
        get resourceURL(): string;
        set group(value: GGroup);
        get group(): GGroup;
        getGear(index: number): GearBase;
        protected updateGear(index: number): void;
        checkGearController(index: number, c: Controller): boolean;
        updateGearFromRelations(index: number, dx: number, dy: number): void;
        addDisplayLock(): number;
        releaseDisplayLock(token: number): void;
        private checkGearDisplay;
        get relations(): Relations;
        addRelation(target: GObject, relationType: number, usePercent?: boolean): void;
        removeRelation(target: GObject, relationType: number): void;
        get element(): UIElement;
        get parent(): GComponent;
        set parent(val: GComponent);
        removeFromParent(): void;
        get asCom(): GComponent;
        static cast(element: HTMLElement): GObject;
        get text(): string;
        set text(value: string);
        get icon(): string;
        set icon(value: string);
        get treeNode(): GTreeNode;
        get isDisposed(): boolean;
        dispose(): void;
        onClick(listener: Function, target?: any): void;
        offClick(listener: Function, target?: any): void;
        hasClickListener(): boolean;
        bubbleEvent(type: string, data?: any): void;
        get draggable(): boolean;
        set draggable(value: boolean);
        get dragBounds(): Rect;
        set dragBounds(value: Rect);
        startDrag(pointerId?: number): void;
        stopDrag(): void;
        get dragging(): boolean;
        localToGlobal(ax?: number, ay?: number, result?: Vec2): Vec2;
        globalToLocal(ax?: number, ay?: number, result?: Vec2): Vec2;
        localToRoot(ax: number, ay: number, result?: Vec2): Vec2;
        rootToLocal(ax: number, ay: number, result?: Vec2): Vec2;
        localToGlobalRect(ax: number, ay: number, aWidth: number, aHeight: number, result?: Rect): Rect;
        globalToLocalRect(ax: number, ay: number, aWidth: number, aHeight: number, result?: Rect): Rect;
        transformRect(ax: number, ay: number, aWidth: number, aHeight: number, targetSpace?: GObject, result?: Rect): Rect;
        handleControllerChanged(c: Controller): void;
        protected createElement(): void;
        protected handlePositionChanged(): void;
        protected handleSizeChanged(): void;
        protected handleScaleChanged(): void;
        protected handleGrayedChanged(): void;
        protected handleAlphaChanged(): void;
        protected handleTouchableChanged(): void;
        handleVisibleChanged(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        constructFromResource(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private _dragStartPos;
        private _dragTesting;
        private initDrag;
        private dragBegin;
        private dragEnd;
        private __touchBegin;
        private __touchMove;
        private __touchEnd;
    }

    export class GGroup extends GObject {
        private _layout;
        private _lineGap;
        private _columnGap;
        private _excludeInvisibles?;
        private _autoSizeDisabled?;
        private _mainGridIndex;
        private _mainGridMinSize;
        private _boundsChanged;
        private _percentReady;
        private _mainChildIndex;
        private _totalSize;
        private _numChildren;
        constructor();
        protected createElement(): void;
        dispose(): void;
        get layout(): number;
        set layout(value: number);
        get lineGap(): number;
        set lineGap(value: number);
        get columnGap(): number;
        set columnGap(value: number);
        get excludeInvisibles(): boolean;
        set excludeInvisibles(value: boolean);
        get autoSizeDisabled(): boolean;
        set autoSizeDisabled(value: boolean);
        get mainGridMinSize(): number;
        set mainGridMinSize(value: number);
        get mainGridIndex(): number;
        set mainGridIndex(value: number);
        setBoundsChangedFlag(positionChangedOnly?: boolean): void;
        ensureBoundsCorrect(): void;
        private updateBounds;
        private handleLayout;
        moveChildren(dx: number, dy: number): void;
        resizeChildren(dw: number, dh: number): void;
        protected handleAlphaChanged(): void;
        handleVisibleChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }

    export class GearBase {
        static disableAllTweenEffect?: boolean;
        _owner: GObject;
        protected _controller: Controller;
        protected _tweenConfig: GearTweenConfig;
        dispose(): void;
        get controller(): Controller;
        set controller(val: Controller);
        get tweenConfig(): GearTweenConfig;
        protected get allowTween(): boolean;
        setup(buffer: ByteBuffer): void;
        updateFromRelations(dx: number, dy: number): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        protected init(): void;
        apply(): void;
        updateState(): void;
    }
    export class GearTweenConfig {
        tween: boolean;
        easeType: number;
        duration: number;
        delay: number;
        _displayLockToken: number;
        _tweener: GTweener;
        constructor();
    }
    export interface IGearXY {
    }

    export class GTweener {
        _target: any;
        _propType: any;
        _killed: boolean;
        _paused: boolean;
        private _delay;
        private _duration;
        private _breakpoint;
        private _easeType;
        private _easeOvershootOrAmplitude;
        private _easePeriod;
        private _repeat;
        private _yoyo;
        private _timeScale;
        private _snapping;
        private _userData;
        private _path;
        private _onUpdate;
        private _onStart;
        private _onComplete;
        private _onUpdateCaller;
        private _onStartCaller;
        private _onCompleteCaller;
        private _startValue;
        private _endValue;
        private _value;
        private _deltaValue;
        private _valueSize;
        private _started;
        private _ended;
        private _elapsedTime;
        private _normalizedTime;
        constructor();
        setDelay(value: number): GTweener;
        get delay(): number;
        setDuration(value: number): GTweener;
        get duration(): number;
        setBreakpoint(value: number): GTweener;
        setEase(value: number): GTweener;
        setEasePeriod(value: number): GTweener;
        setEaseOvershootOrAmplitude(value: number): GTweener;
        setRepeat(repeat: number, yoyo?: boolean): GTweener;
        get repeat(): number;
        setTimeScale(value: number): GTweener;
        setSnapping(value: boolean): GTweener;
        setTarget(value: any, propType?: any): GTweener;
        get target(): any;
        setPath(value: GPath): GTweener;
        setUserData(value: any): GTweener;
        get userData(): any;
        onUpdate(callback: Function, target?: any): GTweener;
        onStart(callback: Function, target?: any): GTweener;
        onComplete(callback: Function, target?: any): GTweener;
        get startValue(): TweenValue;
        get endValue(): TweenValue;
        get value(): TweenValue;
        get deltaValue(): TweenValue;
        get normalizedTime(): number;
        get completed(): boolean;
        get allCompleted(): boolean;
        setPaused(paused: boolean): GTweener;
        /**
         * seek position of the tween, in seconds.
         */
        seek(time: number): void;
        kill(complete?: boolean): void;
        _to(start: number, end: number, duration: number): GTweener;
        _to2(start: number, start2: number, end: number, end2: number, duration: number): GTweener;
        _to3(start: number, start2: number, start3: number, end: number, end2: number, end3: number, duration: number): GTweener;
        _to4(start: number, start2: number, start3: number, start4: number, end: number, end2: number, end3: number, end4: number, duration: number): GTweener;
        _toColor(start: number, end: number, duration: number): GTweener;
        _shake(startX: number, startY: number, amplitude: number, duration: number): GTweener;
        _init(): void;
        _reset(): void;
        _update(dt: number): void;
        private update;
        private callStartCallback;
        private callUpdateCallback;
        private callCompleteCallback;
    }
    export enum EaseType {
        Linear = 0,
        SineIn = 1,
        SineOut = 2,
        SineInOut = 3,
        QuadIn = 4,
        QuadOut = 5,
        QuadInOut = 6,
        CubicIn = 7,
        CubicOut = 8,
        CubicInOut = 9,
        QuartIn = 10,
        QuartOut = 11,
        QuartInOut = 12,
        QuintIn = 13,
        QuintOut = 14,
        QuintInOut = 15,
        ExpoIn = 16,
        ExpoOut = 17,
        ExpoInOut = 18,
        CircIn = 19,
        CircOut = 20,
        CircInOut = 21,
        ElasticIn = 22,
        ElasticOut = 23,
        ElasticInOut = 24,
        BackIn = 25,
        BackOut = 26,
        BackInOut = 27,
        BounceIn = 28,
        BounceOut = 29,
        BounceInOut = 30,
        Custom = 31
    }
    export class GPath {
        private _segments;
        private _points;
        private _fullLength;
        constructor();
        get length(): number;
        create2(pt1: GPathPoint, pt2: GPathPoint, pt3?: GPathPoint, pt4?: GPathPoint): void;
        create(points: Array<GPathPoint>): void;
        private createSplineSegment;
        clear(): void;
        getPointAt(t: number, result?: Vec2): Vec2;
        get segmentCount(): number;
        getAnchorsInSegment(segmentIndex: number, points?: Array<Vec2>): Array<Vec2>;
        getPointsInSegment(segmentIndex: number, t0: number, t1: number, points?: Array<Vec2>, ts?: Array<number>, pointDensity?: number): Array<Vec2>;
        getAllPoints(points?: Array<Vec2>, ts?: Array<number>, pointDensity?: number): Array<Vec2>;
        private onCRSplineCurve;
        private onBezierCurve;
    }
    export enum CurveType {
        CRSpline = 0,
        Bezier = 1,
        CubicBezier = 2,
        Straight = 3
    }
    export class GPathPoint {
        x: number;
        y: number;
        control1_x: number;
        control1_y: number;
        control2_x: number;
        control2_y: number;
        curveType: number;
        constructor();
        static newPoint(x: number, y: number, curveType: number): GPathPoint;
        static newBezierPoint(x: number, y: number, control1_x: number, control1_y: number): GPathPoint;
        static newCubicBezierPoint(x: number, y: number, control1_x: number, control1_y: number, control2_x: number, control2_y: number): GPathPoint;
        clone(): GPathPoint;
    }
    export class GTween {
        static catchCallbackExceptions: boolean;
        static to(start: number, end: number, duration: number): GTweener;
        static to2(start: number, start2: number, end: number, end2: number, duration: number): GTweener;
        static to3(start: number, start2: number, start3: number, end: number, end2: number, end3: number, duration: number): GTweener;
        static to4(start: number, start2: number, start3: number, start4: number, end: number, end2: number, end3: number, end4: number, duration: number): GTweener;
        static toColor(start: number, end: number, duration: number): GTweener;
        static delayedCall(delay: number): GTweener;
        static shake(startX: number, startY: number, amplitude: number, duration: number): GTweener;
        static isTweening(target: any, propType?: any): Boolean;
        static kill(target: any, complete?: boolean, propType?: any): void;
        static getTween(target: any, propType?: any): GTweener;
    }
    export class TweenValue {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor();
        get color(): number;
        set color(value: number);
        getField(index: number): number;
        setField(index: number, value: number): void;
        setZero(): void;
    }
}