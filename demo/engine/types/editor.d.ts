
export interface IEditor {
    readonly projectPath: string;
    readonly projectName: string;
    readonly projectType: string;
    readonly appPath: string;
    readonly userDataPath: string;
    readonly assetsPath: string;
    readonly webRootPath: string;
    readonly unpackedWebRootPath: string;
    readonly isPackaged: boolean;
    readonly isForeground: boolean;
    readonly moduleName: string;
    readonly serverURL: string;

    readonly typeRegistry: IEditor.ITypeRegistry;
    readonly ipc: IEditor.IIpc;
    readonly assetDb: IEditor.IAssetDb;
    readonly shaderDb: IEditor.IShaderDb;
    readonly panelManager?: IEditor.IPanelManager;
    readonly sceneManager?: IEditor.ISceneManager;
    readonly resourceManager?: IEditor.IResourceManager;
    readonly scene?: IEditor.IMyScene;
    readonly appMenu: IEditor.IAppMenu;
    readonly workspaceConf: IEditor.ISettings;
    readonly sceneViewPort: IEditor.IMyMessagePort;

    createPanelManager(options: IEditor.IPanelManagerOptions, placeHolder?: IEditorUI.GGraph): void;
    createSceneManager(): Promise<void>;
    createHotkeyManager(clientMode?: boolean): void;
    connectAssetDb(): Promise<void>;
    connectShaderDb(): Promise<void>;
    createSettingsService(): Promise<void>;

    getPath(name: IEditor.CommonPathName): Promise<string>;
    enableSettings(name: string, location?: IEditor.SettingsLocation): void;
    getSettings(name: string, autoSync?: boolean): IEditor.ISettings;
    getDialog<T extends IEditor.Dialog>(cls: IEditorUI.Constructor<T>): T;

    showModalWait(view?: IEditorUI.GObject): void;
    closeModalWait(view?: IEditorUI.GObject): void;

    openFile(filePath: string): void;
    openDevTools(): void;

    showMessageBox(options: IEditor.MessageBoxOptions): Promise<IEditor.MessageBoxReturnValue>;
    showOpenDialog(options: IEditor.OpenDialogOptions): Promise<IEditor.OpenDialogReturnValue>;
    showSaveDialog(options: IEditor.SaveDialogOptions): Promise<IEditor.SaveDialogReturnValue>;
    alert(msg: string, type?: "none" | "info" | "error" | "question" | "warning"): Promise<void>;

    showLoading(): { label: IEditorUI.GObject, pb: IEditorUI.GProgressBar };

    enableHotkey(...combos: string[]): void;

    loadUIPackage(path: string): Promise<void>;

    onBeginPlay: () => Promise<void>;
    onEndPlay: () => Promise<void>;
    onOpenFile: (filePath: string, ...args: any[]) => void;
    onSave: () => Promise<void>;

    readonly onUpdate: IEditor.IDelegate<() => void>;
    readonly onAppActivate: IEditor.IDelegate<() => void>;
}

declare global {
    var Editor: IEditor;

    export namespace IEditor {
        export interface WeakRef<T extends object> {
            deref(): T | undefined;
        }

        export interface MessageBoxOptions {
            /**
             * Content of the message box.
             */
            message: string;
            /**
             * Can be `"none"`, `"info"`, `"error"`, `"question"` or `"warning"`. On Windows,
             * `"question"` displays the same icon as `"info"`, unless you set an icon using
             * the `"icon"` option. On macOS, both `"warning"` and `"error"` display the same
             * warning icon.
             */
            type?: string;
            /**
             * Array of texts for buttons. On Windows, an empty array will result in one button
             * labeled "OK".
             */
            buttons?: string[];
            /**
             * Index of the button in the buttons array which will be selected by default when
             * the message box opens.
             */
            defaultId?: number;
            /**
             * Pass an instance of AbortSignal to optionally close the message box, the message
             * box will behave as if it was cancelled by the user. On macOS, `signal` does not
             * work with message boxes that do not have a parent window, since those message
             * boxes run synchronously due to platform limitations.
             */
            signal?: AbortSignal;
            /**
             * Title of the message box, some platforms will not show it.
             */
            title?: string;
            /**
             * Extra information of the message.
             */
            detail?: string;
            /**
             * If provided, the message box will include a checkbox with the given label.
             */
            checkboxLabel?: string;
            /**
             * Initial checked state of the checkbox. `false` by default.
             */
            checkboxChecked?: boolean;
            /**
             * Custom width of the text in the message box.
             *
             * @platform darwin
             */
            textWidth?: number;
            /**
             * The index of the button to be used to cancel the dialog, via the `Esc` key. By
             * default this is assigned to the first button with "cancel" or "no" as the label.
             * If no such labeled buttons exist and this option is not set, `0` will be used as
             * the return value.
             */
            cancelId?: number;
            /**
             * On Windows Electron will try to figure out which one of the `buttons` are common
             * buttons (like "Cancel" or "Yes"), and show the others as command links in the
             * dialog. This can make the dialog appear in the style of modern Windows apps. If
             * you don't like this behavior, you can set `noLink` to `true`.
             */
            noLink?: boolean;
            /**
             * Normalize the keyboard access keys across platforms. Default is `false`.
             * Enabling this assumes `&` is used in the button labels for the placement of the
             * keyboard shortcut access key and labels will be converted so they work correctly
             * on each platform, `&` characters are removed on macOS, converted to `_` on
             * Linux, and left untouched on Windows. For example, a button label of `Vie&w`
             * will be converted to `Vie_w` on Linux and `View` on macOS and can be selected
             * via `Alt-W` on Windows and Linux.
             */
            normalizeAccessKeys?: boolean;
        }

        export interface MessageBoxReturnValue {
            /**
             * The index of the clicked button.
             */
            response: number;
            /**
             * The checked state of the checkbox if `checkboxLabel` was set. Otherwise `false`.
             */
            checkboxChecked: boolean;
        }

        export interface FileFilter {

            // Docs: https://electronjs.org/docs/api/structures/file-filter

            extensions: string[];
            name: string;
        }

        export interface OpenDialogOptions {
            title?: string;
            defaultPath?: string;
            /**
             * Custom label for the confirmation button, when left empty the default label will
             * be used.
             */
            buttonLabel?: string;
            filters?: FileFilter[];
            /**
             * Contains which features the dialog should use. The following values are
             * supported:
             */
            properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
            /**
             * Message to display above input boxes.
             *
             * @platform darwin
             */
            message?: string;
            /**
             * Create security scoped bookmarks when packaged for the Mac App Store.
             *
             * @platform darwin,mas
             */
            securityScopedBookmarks?: boolean;
        }

        export interface OpenDialogReturnValue {
            /**
             * whether or not the dialog was canceled.
             */
            canceled: boolean;
            /**
             * An array of file paths chosen by the user. If the dialog is cancelled this will
             * be an empty array.
             */
            filePaths: string[];
            /**
             * An array matching the `filePaths` array of base64 encoded strings which contains
             * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
             * this to be populated. (For return values, see table here.)
             *
             * @platform darwin,mas
             */
            bookmarks?: string[];
        }

        export interface SaveDialogOptions {
            /**
             * The dialog title. Cannot be displayed on some _Linux_ desktop environments.
             */
            title?: string;
            /**
             * Absolute directory path, absolute file path, or file name to use by default.
             */
            defaultPath?: string;
            /**
             * Custom label for the confirmation button, when left empty the default label will
             * be used.
             */
            buttonLabel?: string;
            filters?: FileFilter[];
            /**
             * Message to display above text fields.
             *
             * @platform darwin
             */
            message?: string;
            /**
             * Custom label for the text displayed in front of the filename text field.
             *
             * @platform darwin
             */
            nameFieldLabel?: string;
            /**
             * Show the tags input box, defaults to `true`.
             *
             * @platform darwin
             */
            showsTagField?: boolean;
            properties?: Array<'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'showOverwriteConfirmation' | 'dontAddToRecent'>;
            /**
             * Create a security scoped bookmark when packaged for the Mac App Store. If this
             * option is enabled and the file doesn't already exist a blank file will be
             * created at the chosen path.
             *
             * @platform darwin,mas
             */
            securityScopedBookmarks?: boolean;
        }

        export interface SaveDialogReturnValue {
            /**
             * whether or not the dialog was canceled.
             */
            canceled: boolean;
            /**
             * If the dialog is canceled, this will be `undefined`.
             */
            filePath?: string;
            /**
             * Base64 encoded string which contains the security scoped bookmark data for the
             * saved file. `securityScopedBookmarks` must be enabled for this to be present.
             * (For return values, see table here.)
             *
             * @platform darwin,mas
             */
            bookmark?: string;
        }

        export interface MenuItemConstructorOptions {

            click?: (menuItemId: string) => void;

            /**
             * Can be `undo`, `redo`, `cut`, `copy`, `paste`, `pasteAndMatchStyle`, `delete`,
             * `selectAll`, `reload`, `forceReload`, `toggleDevTools`, `resetZoom`, `zoomIn`,
             * `zoomOut`, `toggleSpellChecker`, `togglefullscreen`, `window`, `minimize`,
             * `close`, `help`, `about`, `services`, `hide`, `hideOthers`, `unhide`, `quit`,
             * 'showSubstitutions', 'toggleSmartQuotes', 'toggleSmartDashes',
             * 'toggleTextReplacement', `startSpeaking`, `stopSpeaking`, `zoom`, `front`,
             * `appMenu`, `fileMenu`, `editMenu`, `viewMenu`, `shareMenu`, `recentDocuments`,
             * `toggleTabBar`, `selectNextTab`, `selectPreviousTab`, `mergeAllWindows`,
             * `clearRecentDocuments`, `moveTabToNewWindow` or `windowMenu` - Define the action
             * of the menu item, when specified the `click` property will be ignored. See
             * roles.
             */
            role?: ('undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'pasteAndMatchStyle' | 'delete' | 'selectAll' | 'reload' | 'forceReload' | 'toggleDevTools' | 'resetZoom' | 'zoomIn' | 'zoomOut' | 'toggleSpellChecker' | 'togglefullscreen' | 'window' | 'minimize' | 'close' | 'help' | 'about' | 'services' | 'hide' | 'hideOthers' | 'unhide' | 'quit' | 'showSubstitutions' | 'toggleSmartQuotes' | 'toggleSmartDashes' | 'toggleTextReplacement' | 'startSpeaking' | 'stopSpeaking' | 'zoom' | 'front' | 'appMenu' | 'fileMenu' | 'editMenu' | 'viewMenu' | 'shareMenu' | 'recentDocuments' | 'toggleTabBar' | 'selectNextTab' | 'selectPreviousTab' | 'mergeAllWindows' | 'clearRecentDocuments' | 'moveTabToNewWindow' | 'windowMenu');
            /**
             * Can be `normal`, `separator`, `submenu`, `checkbox` or `radio`.
             */
            type?: ('normal' | 'separator' | 'submenu' | 'checkbox' | 'radio');
            label?: string;
            sublabel?: string;
            /**
             * Hover text for this menu item.
             *
             * @platform darwin
             */
            toolTip?: string;
            accelerator?: string;
            /**
             * If false, the menu item will be greyed out and unclickable.
             */
            enabled?: boolean;
            /**
             * default is `true`, and when `false` will prevent the accelerator from triggering
             * the item if the item is not visible`.
             *
             * @platform darwin
             */
            acceleratorWorksWhenHidden?: boolean;
            /**
             * If false, the menu item will be entirely hidden.
             */
            visible?: boolean;
            /**
             * Should only be specified for `checkbox` or `radio` type menu items.
             */
            checked?: boolean;
            /**
             * If false, the accelerator won't be registered with the system, but it will still
             * be displayed. Defaults to true.
             *
             * @platform linux,win32
             */
            registerAccelerator?: boolean;
            /**
             * Should be specified for `submenu` type menu items. If `submenu` is specified,
             * the `type: 'submenu'` can be omitted. If the value is not a `Menu` then it will
             * be automatically converted to one using `Menu.buildFromTemplate`.
             */
            submenu?: MenuItemConstructorOptions[];
            /**
             * Unique within a single menu. If defined then it can be used as a reference to
             * this item by the position attribute.
             */
            id?: string;
            /**
             * Inserts this item before the item with the specified label. If the referenced
             * item doesn't exist the item will be inserted at the end of  the menu. Also
             * implies that the menu item in question should be placed in the same “group” as
             * the item.
             */
            before?: string[];
            /**
             * Inserts this item after the item with the specified label. If the referenced
             * item doesn't exist the item will be inserted at the end of the menu.
             */
            after?: string[];
            /**
             * Provides a means for a single context menu to declare the placement of their
             * containing group before the containing group of the item with the specified
             * label.
             */
            beforeGroupContaining?: string[];
            /**
             * Provides a means for a single context menu to declare the placement of their
             * containing group after the containing group of the item with the specified
             * label.
             */
            afterGroupContaining?: string[];
        }

        export interface IDelegate<T extends (...args: any[]) => any> {
            add(callback: T, target?: any): void;
            once(callback: T, target?: any): void;
            remove(callback: T, target?: any): void;

            clear(): void;
            clearForTarget(target: any): void;
            clearFor(test: (target: any, callback: T) => boolean): void;
            readonly count: number;
            invoke(...args: Parameters<T>): void;
        }

        export class Delegate<T extends (...args: any[]) => any> implements IDelegate<T> {
            add(callback: T, target?: any): void;
            once(callback: T, target?: any): void;
            remove(callback: T, target?: any): void;

            clear(): void;
            clearForTarget(target: any): void;
            clearFor(test: (target: any, callback: T) => boolean): void;
            readonly count: number;
            invoke(...args: Parameters<T>): void;
        }

        export interface IVersionTracker {
            savePoint: number;
            isModified: boolean;

            setModified(value: boolean): void;
        }

        export interface IDataHistory {
            readonly onChanged: IDelegate<() => void>;
            readonly processing: boolean;
            readonly canUndo: boolean;
            readonly canRedo: boolean;
            paused: boolean;
            reset(): void;
            undo(): boolean;
            redo(): boolean;

            addChange(target: any, datapath: string | string[], value: any, oldvalue: any, extInfo?: any, transient?: boolean, batchId?: number): number;
            flush(): void;

            trace(obj: any): any;
            untrace(obj: any): void;

            getUndoTargets(): Array<any>;
        }

        export class DataHistory implements IDataHistory {
            constructor(versionTracker?: IVersionTracker, maxItems?: number);
            readonly onChanged: IDelegate<() => void>;
            readonly processing: boolean;
            readonly canUndo: boolean;
            readonly canRedo: boolean;
            paused: boolean;
            reset(): void;
            undo(): boolean;
            redo(): boolean;

            addChange(target: any, datapath: string | string[], value: any, oldvalue: any, extInfo?: any, transient?: boolean, batchId?: number): number;
            flush(): void;

            trace(obj: any): any;
            untrace(obj: any): void;

            getUndoTargets(): Array<any>;
        }

        export interface IConfigObject {
            [index: string]: any,

            get(key: string, defaultValue?: any): any;
            getNumber(key: string, defaultValue?: number): number;
            getBool(key: string, defaultValue?: boolean): boolean;
            getSection(key: string): IConfigObject;
            set(key: string, value: any): void;
            delete(key: string): void;
            clear(): void;
            copyFrom(data: any): void;
        }

        export class Conf {
            constructor(path: string, fileName?: string);
            set(key: string, value: any): void;
            get(key: string, defaultValue?: any): any;
            dispose(): void;
            save(): void;
        }

        export interface IWebIFrame {
            readonly element: HTMLIFrameElement;
            readonly port: IMyMessagePort;

            load(url: string): void;
        }

        export class WebIFrame implements IWebIFrame {
            readonly element: HTMLIFrameElement;
            readonly port: IMyMessagePort;

            load(url: string): void;
        }

        export interface IWebview {
            readonly element: HTMLElement;
            readonly port: IMyMessagePort;
            readonly webContentsId: number;
            readonly width: number;
            readonly height: number;

            show(placeHolder: IEditorUI.GObject): void;
            load(url: string): void;
        }

        export class Webview implements IWebview {
            readonly element: HTMLElement;
            readonly port: IMyMessagePort;
            readonly webContentsId: number;
            readonly width: number;
            readonly height: number;

            show(placeHolder: IEditorUI.GObject): void;
            load(url: string): void;
        }

        export type FEnumDescriptor = {
            name: string,
            value: any,
            extend?: FEnumDescriptor,
            [index: string]: any,
        }[] | any[] | string;

        export type WorldType = "2d" | "3d" | null;

        export interface FPropertyDescriptor {
            /** 属性名称 */
            name: string;
            /** 
             * 属性类型。
             * 基础类型有：number,string,boolean,any
             * 复合类型有：数组，使用类似[number]这样的方式表达；字典，使用类似["Record", number]这样的方式表达，第一个元素固定为Record，第二个元素为实际类型。
             * 其他名称为在typeRegistry注册的类型。
             * 如果不提供type，表示只用于ui展示，没有实际对应数据。
             */
            type?: string | [string] | [string, string];

            /** 该属性在原型中的初始值。这个值也用于序列化时比较，如果相同则不序列化这个属性，所以必须保证这里设置的值就是类中变量的初始值。*/
            default?: any;

            /** 标题。如果不提供，则使用name。 */
            caption?: string;
            /** 本地语言的标题。 */
            localizedCaption?: string;
            /** 本地语言的标题，但只有激活翻译引擎符号才生效。*/
            $localizedCaption?: string;
            /** 可以设定是否隐藏标题 */
            captionDisplay?: "normal" | "hidden" | "none";

            /** 提示文字 */
            tips?: string;
            /** 本地语言的提示文字。 */
            localizedTips?: string;

            /** 属性栏目。为多个属性设置相同的值，可以将它们显示在同一个Inspector栏目内。*/
            catalog?: string;
            /**属性栏目的帮助 */
            catalogHelp?: string;
            /* 栏目标题。不提供则直接使用栏目名称。 */
            catalogCaption?: string;
            /* 本地语言的栏目标题 */
            localizedCatalogCaption?: string;
            /* 栏目的显示顺序，数值越小显示在前面。不提供则按属性出现的顺序。*/
            catalogOrder?: number;

            /**
             * 编辑这个属性的控件。内置有：number,string,boolean,color,vec2,vec3,vec4,asset
             * 
             *      number : 数字输入。
             *      string : 字符串输入。默认为单行输入，如果是多行，需要激活multiline选项。
             *      boolean : 多选框。
             *      color : 一个颜色框+调色盘+拾色器
             *      vec2 : XY输入的组合
             *      vec3 : XYZ输入的组合
             *      vec4 : XYZW输入的组合
             *      asset : 选择资源
             * 
             * 一般来说，不需要设置这个选项，编辑器会自动根据属性类型选择适合的控件，但在某些情况下可以需要强制指定。
             * 例如，如果数据类型是Vector4，但其实它表达的是颜色，用默认编辑Vector4的控件不适合，需要在这里设置为“color”。
             * 
             * 显式设置inspector为null，则不会为属性构造inspector。这与hidden设置为true不同。hidden为true是创建但不可见，
             * inspector为null的话则是完全不创建。
             */
            inspector?: string;

            /** 隐藏控制。
             * 可以用表达式，支持的语法有：
             * 1. 字符串。例如"!data.a && !data.b"，表示属性a和属性b均为空时，隐藏这个属性。隐含的变量有两个，data为当前数据，field为IPropertyField接口。
             * 2. 函数。函数原型为func(data:any, field:IPropertyField)。
             */
            hidden?: boolean | string | Function;
            /** 只读控制。可以用表达式，参考隐藏控制。 */
            readonly?: boolean | string | Function;

            /** 数据检查机制。
             * 可以用表达式，支持的语法有：
             * 1. 字符串。例如"data.a"， 如果data.a是一个字符串，表示验证不通过，这个字符串作为错误提示信息显示；如果是其他值，则表示验证通过。
             *    隐含的变量有三个，data为当前数据，value为当前用户输入的值，field为IPropertyField接口。
             * 2. 函数。函数原型为func(data:any, value:any, field:IPropertyField)。
             *    如果返回值是一个字符串，表示验证不通过，这个字符串作为错误提示信息显示；如果是其他值，则表示验证通过。
             */
            validator?: string | Function;

            /** 是否序列化 */
            serializable?: boolean;

            /** 是否多行文本输入 */
            multiline?: boolean;
            /** 是否密码输入 */
            password?: boolean;
            /** 如果true或者缺省，文本输入每次输入都提交；否则只有在失焦时才提交 */
            submitOnTyping?: boolean;
            /** 输入文本的提示信息 */
            prompt?: string;
            /** 本地语言的输入文本的提示信息 */
            localizedPrompt?: string;

            /** 提供数据源显示一个下拉框去改变属性的值 */
            enumSource?: FEnumDescriptor;
            /** 当数据源为空时，隐藏这个属性 */
            hideIfEnumSourceEmpty?: boolean;

            /** 是否反转布尔值。例如当属性值为true时，多选框显示为不勾选。 */
            reverseBool?: boolean;

            /** 是否允许null值。默认为true。*/
            nullable?: boolean;

            /** 数字的最小值 */
            min?: number,
            /** 数字的最大值 */
            max?: number,
            /** 数值范围，等同于一次性设置min和max。 */
            range?: [number, number];
            /** 拖动方式改变数值时，每次数值改变的幅度。 */
            step?: number;
            /** 小数点后的位数 */
            fractionDigits?: number;
            /** 显示为百分比 */
            percentage?: boolean;

            /** 对数组类型属性适用。表示数组是固定长度，不允许修改。*/
            fixedLength?: boolean;
            /** 对数组类型属性适用。如果不提供，则表示数组允许所有操作，如果提供，则只允许列出的操作。*/
            arrayActions?: Array<"append" | "insert" | "delete" | "move">;
            /** 对数组类型属性适用。这里可以定义数组元素的属性 */
            elementProps?: Partial<FPropertyDescriptor>;

            /** 对字典类型属性适用。表示字典适用指定的固定的key值集合。 */
            fixedKeys?: Array<string>;

            /** 对颜色类型属性适用。表示是否提供透明度a值的修改。 */
            showAlpha?: boolean;
            /** 对颜色类型属性适用。它与default值不同的是，当default是null时，可以用defaultColor定义一个非null时的默认值。*/
            defaultColor?: any;
            /** 对颜色类型属性适用。允许显示一个checkbox决定颜色是否为null。 */
            colorNullable?: boolean;

            /** 对对象类型属性适用。如果为true，隐藏对象的标题，同时对象下的属性的显示缩进会减少一级。*/
            hideHeader?: boolean;
            /** 对对象类型属性适用。对象创建时可以下拉选择一个类型。如果显式置为null，则禁止菜单。默认是显示一个创建基类的菜单。使用“ClassName*”这样的格式表示ClassName的所有扩展类*/
            createObjectMenu?: Array<string>;

            /** 说明此属性是引用一个资源 */
            isAsset?: boolean;
            /** 对资源类型的属性适用。多个资源类型用逗号分隔，例如“Image,Audio"。可用值参考editor/public/IAssetInfo.ts*/
            assetTypeFilter?: string;
            /** 如果属性类型是string，并且进行资源选择时，这个选项决定属性值是资源原始路径还是res://uuid这样的格式。如果是true，则是资源原始路径。默认false。*/
            useAssetPath?: boolean;
            /** 对资源类型的属性适用。选择资源时是否允许选择内部资源 */
            allowInternalAssets?: boolean;

            /** 对类型是Node或者Component的属性适用。如果不为null，当在实际运行环境里执行反序列化时，引用对象不再实例化，而是将它的序列化数据原样保存到指定的属性中。*/
            toTemplate?: string;

            /** 表示属性是否可写。默认是true。设置为false则属性为只读。 */
            writable?: boolean;

            /** 显示位置。语法：before xxx/after xxx/first/last。 */
            position?: string;

            /** 表示属性是私有属性。私有属性不会显示在Inspector里，但会序列化保存。 */
            "private"?: boolean;

            /** 如果为true，序列化时属性必定写入。否则会与默认值比较，相同则不写入。*/
            mustSave?: boolean;

            /** 增加缩进，单位是层级，不是像素。 */
            addIndent?: number;

            /** 表示属性是否允许多选情况下编辑。默认true。 */
            allowMultipleObjects?: boolean;

            /** 表示属性不显示在派生类的属性表中 */
            hideInDeriveType?: boolean;

            /** 属性改变时额外调用对象的一个函数，这里是函数名称。
             * 函数原型是func(key?:string)。其中key在改变成员内部属性时会传递。
             * 例如改变数据某个元素的内部属性，则key是这个元素的索引。 
             */
            onChange?: string;

            /** 额外的选项 */
            options?: Record<string, any>;
        }

        export interface FTypeDescriptor {
            /** 类型名称。 */
            name: string;
            /**帮助文档url地址 */
            help?: string;
            /** 标题。如果不提供，则使用name。 */
            caption?: string;
            /** 本地语言的标题。 */
            localizedCaption?: string;
            /** 本地语言的标题，但只有激活翻译引擎符号才生效。*/
            $localizedCaption?: string;
            /** 添加到组件菜单。 */
            menu?: string;
            /** 图标。*/
            icon?: string;
            /** 脚本的路径 */
            scriptPath?: string;
            /** 是否资源类型 */
            isAsset?: boolean;
            /** 基类 */
            base?: string;
            /** 默认值。这个值只在面板中使用，它指从面上上创建对象时赋予属性的初始值。*/
            init?: any;
            /** 属性列表 */
            properties: Array<FPropertyDescriptor>;
            /** 编辑这个类实例的控件 */
            inspector?: string;

            /** 对资源类型的属性适用。多个资源类型用逗号分隔，例如“Image,Audio"。可用值参考editor/public/IAssetInfo.ts。 */
            assetTypeFilter?: string;

            /** 对Component适用，是否允许在Editor执行 */
            runInEditor?: boolean;
            /** 对Component适用，当AddComponent时同时添加依赖的Component */
            requireComponents?: Array<string>;
            /** 对Component使用，为true时，表示隐藏设置enable和屏蔽Remove Component功能。 */
            noRemoveComponent?: boolean;
            /** 对Component使用，表示这个组件允许挂载的节点类型。默认null */
            worldType?: WorldType;

            /** 栏目样式 */
            catalogBarStyle?: null | "normal" | "hidden" | "transparent";

            /** 额外的选项 */
            options?: any;
        }


        export type CommonPathName = 'home' | 'appData' | 'userData' | 'cache' | 'temp' | 'exe'
            | 'module' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 'recent' | 'logs' | 'crashDumps';

        export type DefaultValueComparator = (value: any) => boolean;
        export type TypeMenuItem = { type: FTypeDescriptor, label: string, icon: string };

        export interface ITypeRegistry {
            readonly types: Readonly<Record<string, FTypeDescriptor>>;
            readonly version: number;
            readonly onUserTypesChanged: IDelegate<() => void>;

            localizedCaptions: boolean;
            localizedEngineSymbols: boolean;

            addTypes(types: Array<FTypeDescriptor>): void;
            removeTypes(names: Array<string>): void;
            setUserTypesChanged(): void;

            getDerivedTypes(type: FTypeDescriptor): Array<FTypeDescriptor>;
            getRequireComponents(type: string): Array<string>;
            getMenuItems(typeName: string): Record<string, Array<TypeMenuItem>>;
            findScriptByPath(path: string): FTypeDescriptor;

            isType3d(type: string): boolean;
            isDerivedOf(type: string, baseType: string): boolean;
            isNodeType(type: string): boolean;
            isTypeDeprecated(type: FTypeDescriptor): boolean;

            getTypeCaption(type: string | FTypeDescriptor, noSplit?: boolean): string;
            getTypeIcon(type: string | FTypeDescriptor): string;
            getTypeWorldType(typeDef: FTypeDescriptor): WorldType;
            getPropCaption(prop: FPropertyDescriptor): string;

            getAllPropsOfType(type: FTypeDescriptor): Readonly<Record<string, FPropertyDescriptor>>;
            getInitProps(typeDef: FTypeDescriptor): any;
            getDefaultValue(typeDef: FTypeDescriptor, includePrivate?: boolean): any;
            getPropDefaultValue(prop: FPropertyDescriptor): any;
            getPropTestFunctions(prop: FPropertyDescriptor): { hiddenTest: Function, readonlyTest: Function, validator: Function };
            getDefaultValueComparators(typeDef: FTypeDescriptor): Readonly<Record<string, DefaultValueComparator>>;

            getPropertyByPath(type: FTypeDescriptor, datapath: ReadonlyArray<string>, out?: FPropertyDescriptor[]): FPropertyDescriptor[];
        }

        export interface IIpc {
            invoke(channel: string, ...args: any[]): Promise<any>;
            on(channel: string, listener: (event: Event, ...args: any[]) => void): void;
            once(channel: string, listener: (event: Event, ...args: any[]) => void): void;
            postMessage(channel: string, message: any, transfer?: MessagePort[]): void;
            removeAllListeners(channel: string): void;
            removeListener(channel: string, listener: (...args: any[]) => void): void;
            send(channel: string, ...args: any[]): void;
            sendSync(channel: string, ...args: any[]): any;
            sendTo(webContentsId: number, channel: string, ...args: any[]): void;
            sendToHost(channel: string, ...args: any[]): void;
        }

        export type SettingsLocation = "application" | "project" | "local" | "memory";

        export interface ISettings {
            readonly data: IConfigObject;
            readonly onChanged: IDelegate<(sender: ISettings) => void>;

            sync?(): Promise<void>;
            push?(keys?: ReadonlyArray<string>): Promise<void>;
        }

        export interface IMyMessagePort {
            readonly onClose: IDelegate<() => void>;
            start(): void;
            close(): void;

            handle(channel: string, func: (...args: any[]) => Promise<any> | any, target?: any, noAwait?: boolean): void;
            send(channel: string, ...args: any[]): void;
            transfer(channel: string, transfer: Transferable[], ...args: any[]): void;
            invoke(channel: string, ...args: any[]): Promise<any>;
        }

        enum AssetType {
            Unknown = 0,
            Folder,
            Image,
            Scene,
            Prefab,
            Material,
            Mesh,
            Model,
            TypeScript,
            JavaScript,
            ShaderScript,
            WebAssembly,
            Json,
            Text,
            XML,
            BitmapFont,
            TTFFont,
            Audio,
            Video,
            Shader,
            ShaderBlueprint,
            ShaderBlueprintFunction,
            AnimationClip,
            AnimationClip2D,
            AnimationController,
            AnimationController2D,
            Cubemap,
            AvatarMask,
            LightingSettings,
            RenderTexture,
            Atlas,
            AtlasConfig,
            Skeleton,
            Spine,

            FairyGUIPackage,
        }

        enum AssetFlags {
            Readonly = 1,
            SubAsset = 2,
            Composite = 4,
            Internal = 256,
            Transient = 512
        }

        enum AssetChangedFlag {
            Modified = 0,
            New = 1,
            Deleted = 2,
            Moved = 3
        }

        export interface IAssetInfo {
            id: string;
            name: string;
            fileName: string;
            file: string;
            ext: string;
            type: AssetType;
            icon: string;
            openedIcon?: string;
            ver: number;
            treeVer?: number;
            parentId: string;
            hasChild?: boolean;
            flags: number;
        }

        export interface IAssetDb {
            readonly onAssetChanged: IDelegate<(assetId: string, assetPath: string, assetType: AssetType, flag: AssetChangedFlag) => void>;
            readonly port: IMyMessagePort;
            getVersionOfType(type: AssetType): number;

            getFolderContent(folderAssetId: string, types?: Array<AssetType>, matchSubType?: boolean): Promise<IAssetInfo[]>;
            getAsset(assetIdOrPath: string): Promise<IAssetInfo>;
            getAssetsInPath(assetId: string): Promise<Array<IAssetInfo>>;

            setMetaData(assetId: string, data: any): Promise<void>;
            setMetaData(...idAndDataArray: any[]): Promise<void>;

            writeFile(filePath: string, source?: string, sourceIsPath?: boolean): Promise<IAssetInfo>;
            createFileFromTemplate(filePath: string, templateName: string, templateArgs?: Record<string, string>): Promise<IAssetInfo>;
            createFolder(folderPath: string): Promise<IAssetInfo>;
            getPrefabSourcePath(asset: IAssetInfo): string;

            getFullPath(asset: IAssetInfo): string;
            getURL(asset: IAssetInfo): string;
            toFullPath(assetFile: string): string;
            getInitials(asset: IAssetInfo): string;

            reimport(assets: Array<IAssetInfo>): void;
            unpack(assets: Array<IAssetInfo>): void;

            search(keyword: string, types?: Array<AssetType>, matchSubType?: boolean): Promise<Array<IAssetInfo>>;
            getIdsOfType(type: AssetType): Promise<Array<string>>;
            rename(assetId: string, newName: string): Promise<number>;
            move(sourceAssetIds: string[], targetFolderId: string, conflictResolution?: "keepBoth" | "replace"): Promise<void>;
            copy(sourceAssetIds: string[], targetFolderId: string, conflictResolution?: "keepBoth" | "replace"): Promise<void>;
            delete(assets: Array<IAssetInfo>): Promise<void>;
        }

        export interface IShaderInfo {
            name: string;
            assetId: string;
        }

        export interface IShaderDb {
            readonly shaders: Record<string, IShaderInfo>;
            readonly version: number;
        }

        enum NodeFeatures {
            HasChild = 1,
            RootNode = 2,
            Inactive = 4,
            InPrefab = 8,
            IsPrefab = 16,
            IsPrefabNewAdded = 32,
            IsTopPrefab = 64,
            IsModel = 128,
            HideByEditor = 1024,
            LockByEditor = 2048,
            PrefabMissing = 4096,
        }

        export interface IMyNode {
            readonly id: string;
            readonly props: Record<string, any>;
            readonly icon: string;
            readonly type: string;
            readonly is3d: boolean;
            readonly parent: IMyNode;
            readonly children: Array<IMyNode>;
            readonly childIndex: number;
            name: string;
            ver: number;
            treeVer: number;
            propsVer: number;
            statusVer: number;
            features: number;
            /** 不允许移动，删除 */
            dontDestroy?: boolean;
            /** 不允许增删子节点 */
            dontChangeChildren?: boolean;
            /** 不允许增加组件 */
            noAddComponent?: boolean;

            addChild(node: IMyNode): void;
            isAncestorOf(node: IMyNode): boolean;

            componentIds: ReadonlyArray<string>;
            readonly components: Record<string, IMyComponent>;
            getComponent(type: string, allowDerives?: boolean): IMyComponent;

            readonly isRoot: boolean;
        }

        export interface IMyComponent {
            owner: string;
            id: string;
            type: string;
            readonly props: Record<string, any>;

            inPrefab?: boolean;
        }


        export type SceneNavToolType = "move" | "orbit" | "orbit_focus" | "zoom" | "obj_move" | "obj_rotate" | "obj_scale" | "obj_transform";
        export interface ICreateNodeOptions {
            setDefaultPos?: boolean,
            fixDupName?: boolean
        }

        export interface IMyScene {
            readonly history: IDataHistory;
            readonly selectionHistory: IDataHistory;
            readonly rootNode: IMyNode;
            readonly sceneId: string;
            readonly worldType: WorldType;
            readonly asset: IAssetInfo;
            readonly port: IMyMessagePort;

            readonly status: IConfigObject;
            readonly persistStatus: IConfigObject;

            readonly loading: boolean;
            readonly viewerMode: boolean;

            readonly sourceScene?: IMyScene;

            readonly isModified: boolean;
            setModified(): void;

            getSelection(type?: string): ReadonlyArray<any>;
            setSelection(objs: any | any[], type?: string): void;
            readonly selectionType: string;

            getNode(id: string): IMyNode;
            getNodeAsync(id: string): Promise<IMyNode>;
            getTopPrefab(node: IMyNode): Promise<IMyNode>;
            getPrefabId(node: IMyNode): Promise<string>;

            createNode(nodeType: string, props?: Record<string, any>, parentNode?: IMyNode, options?: ICreateNodeOptions): Promise<IMyNode>;
            createNodeByAsset(assetId: string, props?: Record<string, any>, parentNode?: IMyNode, options?: ICreateNodeOptions): Promise<IMyNode>;
            deleteNode(node: IMyNode): any;
            addNode(parentNode: IMyNode, node: IMyNode, index?: number, worldPositionStays?: boolean): Promise<void>;
            runScript(command: string, ...params: any[]): Promise<any>;
            runNodeScript(nodeId: string, componentId: string, functionName: string, ...args: any[]): Promise<any>;
            runBatch(func: () => void, options?: { noHistory?: boolean, noPush?: boolean }): void;
            findNodes(keyword: string): Promise<Array<IMyNode>>;

            addComponent(node: IMyNode, componentType: string): Promise<IMyComponent>;
            removeComponent(node: IMyNode, compId: string): Promise<void>;

            changeNodesType(node: IMyNode, nodeType: string): Promise<void>;

            getNodeChildren(parentNode: IMyNode): Promise<IMyNode[]>;
            getNodeDescendants(parentNode: IMyNode, out?: Array<IMyNode>): Promise<IMyNode[]>;
            syncNode(node: IMyNode): Promise<void>;
            focusNode(node: IMyNode): void;

            syncNodes(nodes?: ReadonlyArray<IMyNode>): Promise<void>;
            copyNodes(): Promise<void>;
            pasteNodes(): Promise<Array<IMyNode>>;
            duplicateNodes(): Promise<Array<IMyNode>>;
            deleteNodes(): void;
            createPrefab(nodeId: string, savePath: string): void;

            addComponentToNodes(componentType: string): void;

            getResourceProps(resId: string): Promise<any>;

            send(channel: string, ...args: any[]): void;
            invoke(channel: string, ...args: any[]): Promise<any>;
        }

        export interface ISceneManager extends IEditorUI.EventDispatcher {
            readonly sceneView: IWebview;
            readonly onNodeChanged: IDelegate<(node: IMyNode, datapath: ReadonlyArray<string>, value: any, oldValue: any) => void>;

            readonly activeScene: IMyScene;

            openScene(sceneId: string, assetId: string): Promise<void>;
            closeScene(sceneId: string): Promise<void>;
            saveScene(sceneId: string, filePath?: string): Promise<void>;
            setActiveScene(sceneId: string): Promise<void>;
            reloadScene(sceneId: string): Promise<void>;
            getScenes(): Readonly<Record<string, IMyScene>>;
            dispose(): Promise<void>;

            setPlaying(playing: boolean): boolean;
            readonly playing: boolean;
        }

        export interface IPanelOptions {
            title?: string;
            icon?: string;
            hResizePriority?: number;
            vResizePriority?: number;
            showInMenu?: boolean;
            allowPopup?: boolean;
            autoStart?: boolean;
            location?: "left" | "right" | "top" | "bottom" | "popup";
            hotkey?: string;
            transparent?: boolean;
            help?: string;
        }

        export interface IEditorPanel extends IEditorUI.GComponent {
            onStart?(): void;
            onDestroy?(): void;
            onUpdate?(): void;

            onSelectionChanged?(): void;
            onSceneActivate?(scene: IMyScene): void;
            onSceneDeactivate?(scene: IMyScene): void;

            onHotkey?: (combo: string) => boolean;
            onGlobalHotkey?: (combo: string) => boolean;
            onSearch?: (searchKey: string) => void;

            panelOptions?: IPanelOptions;
        }

        export interface IPanelManagerOptions {
            filePath: string,
            createMenu?: boolean,
            layouts: Record<string, {
                mainPanelId: string
            }>
        }

        export interface IPanelManager extends IEditorUI.GComponent {
            readonly panelIds: string[];
            readonly lastFocusedPanel: IEditorPanel;

            addPanel<T extends IEditorPanel>(panelId: string, classType: IEditorUI.Constructor<T>, options: IPanelOptions): T;
            removePanel(panelId: string): void;
            getPanel<T extends IEditorPanel>(panelId: string, classType?: IEditorUI.Constructor<T>): T;

            setPanelTitle(panelId: string, title: string): void;
            showPanel(panelId: string): void;
            hidePanel(panelId: string): void;
            isPanelShowing(panelId: string): boolean;
            getActivePanelInGroup(panelId: string): string;

            start(): void;
            loadLayout(): void;
            resetLayout(): void;
            saveLayout(): void;
            switchGroup(groupName: string): void;

            sendMessage(target: string, cmd: string, ...args: Array<any>): Promise<any>;
            postMessage(target: string, cmd: string, ...args: Array<any>): void;
        }

        export interface IResourceManager {
            dispose(): Promise<void>;
            getCachedResourceProps(resId: string): any;
            getResourceProps(resId: string): Promise<any>;
            save(): Promise<void>;
            dispose(): Promise<void>;

            readonly importSettingsHistory: IDataHistory;
            getImportSettings(resId: string): Promise<any>;
            applyImportSettings(): Promise<void>;
            revertImportSettings(): Promise<void>;

            cloneMaterial(asset: IAssetInfo): Promise<IAssetInfo>;
        }

        export interface IAppMenu {
            onClickItem: (itemId: string) => void;
            setItemEnabled(path: string, enabled: boolean): void;
            setItemVisible(path: string, visible: boolean): void;
            setItemChecked(path: string, checked: boolean): void;
            setItems(index: number, template: Array<MenuItemConstructorOptions>): void;
        }

        export class Dialog<T extends IEditorUI.GComponent = IEditorUI.GComponent> {
            resizable: boolean;
            modal: boolean;
            closable: boolean;
            frame: boolean;
            transparent: boolean;
            crossViews: boolean;
            showType: "none" | "popup" | "dropdown";
            alwaysInFront: boolean;
            title: string;
            readonly features: Record<string, string>;

            protected _win: Window;
            protected _groot: IEditorUI.GRoot;
            protected _confKey?: string;

            setAutoSaveBounds(confKey?: string): void;
            get contentPane(): T;
            set contentPane(value: T);
            get popupOwner(): IEditorUI.GObject;
            get isShowing(): boolean;
            show(popupOwner?: IEditorUI.GObject, ...args: any[]): Promise<void>;
            hide(): void;
            close(): void;
            dispose(): void;
            get winX(): number;
            get winY(): number;
            get winWidth(): number;
            get winHeight(): number;
            setPosition(x: number, y: number): void;
            setSize(w: number, h: number): void;
            protected onInit(): void;
            protected onShown(...args: any[]): void;
            protected onHide(): void;
            protected onAction(): void;
            protected onCancel(): void;
            protected handleKeyEvent(evt: IEditorUI.Event): void;
        }


        export interface MenuPopupOptions {
            /**
             * Default is the current mouse cursor position. Must be declared if `y` is
             * declared.
             */
            x?: number;
            /**
             * Default is the current mouse cursor position. Must be declared if `x` is
             * declared.
             */
            y?: number;
            /**
             * The index of the menu item to be positioned under the mouse cursor at the
             * specified coordinates. Default is -1.
             *
             * @platform darwin
             */
            positioningItem?: number;
        }

        export class ContextMenu {
            onClickItem: (itemId: string) => void;
            data: any;

            constructor(template: Array<MenuItemConstructorOptions>);
            constructor(id: string, template: Array<MenuItemConstructorOptions>);
            constructor(arg1: string | Array<MenuItemConstructorOptions>, arg2?: null | Array<MenuItemConstructorOptions>);

            dispose(): void;
            setItemEnabled(itemId: string, enabled: boolean): void;
            setItemVisible(itemId: string, visible: boolean): void;
            setItemChecked(itemId: string, checked: boolean): void;

            isItemChecked(itemId: string): boolean;
            setItemLabel(itemId: string, label: string): void;

            show(callbackThisObj?: any, popupOptions?: MenuPopupOptions): void;
            update(template: Array<MenuItemConstructorOptions>): void;
        }

        export interface IPropertyFieldCreateResult {
            ui: IEditorUI.GComponent;
            stretchWidth?: boolean;
            captionDisplay?: "normal" | "hidden" | "none";
            noIndent?: boolean;
        }

        export interface IPropertyField {
            readonly parent: IPropertyField;
            readonly inspector: IDataInspector;
            readonly hostNode: IEditorUI.GTreeNode;

            readonly objType: Readonly<FTypeDescriptor>;
            readonly property: Readonly<FPropertyDescriptor>;
            readonly target: IInspectingTarget;

            watchProps: Array<string>;

            create(): IPropertyFieldCreateResult;
            makeReadonly(value: boolean): void;
            refresh(): void;
        }

        export interface IInspectingTarget {
            readonly datas: Array<any>;
            readonly data: any;
            readonly owner: IPropertyField;

            getValue(): any;
            setValue(value: any): boolean;
            validate(data: any, value: any, prop?: FPropertyDescriptor): boolean;

            getPropertyValue(propName: string): any;
            setPropertyValue(propName: string, value: any): void;

            getProperty(propName: string): Readonly<FPropertyDescriptor>;
        }

        export interface IInspectorHelper {
            add(target: any, type: string, data: any, title?: string, readonly?: boolean, statusStore?: any): void;
            next(): void;
        }

        export interface IInspectorLayout {
            accept(item: any): boolean;
            onRender(items: ReadonlyArray<any>, inspectors: IInspectorHelper, componentInspectors: IInspectorHelper): Promise<void>;

            readonly history?: IDataHistory;

            onRevert?(): Promise<void>;
            onApply?(): Promise<void>;
        }

        export interface IDataInspector {
            readonly id: string;
            readonly nodes: ReadonlyArray<IEditorUI.GTreeNode>;
            readonly target: any;
            readonly targets: ReadonlyArray<any>;
            readonly targetType: FTypeDescriptor;
            readonly fullUpdating: boolean;

            getData(): ReadonlyArray<any>;
            setData(target: any, data?: any, status?: any): void;

            dispose(): void;

            validateTypes(): boolean;
            showErrorTips(str: string): void;

            getCatalogField(name: string): IPropertyField;
            getChildFields(field: IPropertyField, result?: Array<IPropertyField>): Array<IPropertyField>;
            findBrotherField(field: IPropertyField, name: string): IPropertyField;
            findChildField(field: IPropertyField, name: string): IPropertyField;
            hideField(field: IPropertyField, hidden: boolean): void;

            getStatus(field: IPropertyField, name: string): any;
            setStatus(field: IPropertyField, name: string, value: any): void;
        }

        export class PropertyField implements IPropertyField {
            readonly parent: IPropertyField;
            readonly inspector: IDataInspector;
            readonly hostNode: IEditorUI.GTreeNode;
            readonly objType: Readonly<FTypeDescriptor>;
            readonly property: Readonly<FPropertyDescriptor>;
            readonly target: IInspectingTarget;

            watchProps: Array<string>;

            create(): IPropertyFieldCreateResult;
            makeReadonly(value: boolean): void;
            refresh(): void;
        }

        export type ExecResult = { code: number, error: string, output: string };
        export type AbortToken = { aborted: boolean };
        export type ExecOptions = { cwd?: string, progress?: (output: string) => void, abortToken?: AbortToken, shell?: boolean };
        export type ExecProgress = (output: string) => void;

        export function runTool(toolName: string, args: ReadonlyArray<string>, progress?: ExecProgress, abortToken?: AbortToken): Promise<ExecResult>;
        export function runAny(command: string, args: ReadonlyArray<string>, options: ExecOptions): Promise<ExecResult>;
        export function runAny(command: string, args: ReadonlyArray<string>, progress?: ExecProgress, abortToken?: AbortToken): Promise<ExecResult>;
        export function runAny(command: string, args: ReadonlyArray<string>, ...funcArgs: any[]): Promise<ExecResult>;

        export function openCodeEditor(filePath: string): Promise<void>;
        export function openBrowser(url: string): Promise<void>;
    }

    export namespace IEditor {
        export function inspectorField(name: string): Function;
        export function inspectorLayout(type: string): Function;
        export function panel(id: string, options: IPanelOptions): Function;
        export function onLoad(target: Object, propertyName: string): void;
        export function onUnload(target: Object, propertyName: string): void;
    }
}
