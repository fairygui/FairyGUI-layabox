export { };
declare global {
    export namespace IEditorClient {
        export const ShaderTypePrefix = "Shader.";
        export type DefaultValueComparator = (value: any) => boolean;

        export const TypedArrayClasses: Record<string, any> = {
            "Int8Array": Int8Array,
            "Uint8Array": Uint8Array,
            "Int16Array": Int16Array,
            "Uint16Array": Uint16Array,
            "Int32Array": Int32Array,
            "Uint32Array": Uint32Array,
            "Float32Array": Float32Array
        };

        export type TypeMenuItem = { type: FTypeDescriptor, label: string, icon: string };

        export interface ITypeRegistry {
            readonly types: Readonly<Record<string, FTypeDescriptor>>;
            readonly scriptNameToID: Readonly<Record<string, string>>;

            nodeTypeName: string;
            componentTypeName: string;

            setAllTypes(types: Record<string, FTypeDescriptor>): void;

            isDerivedOf(type: string, baseType: string): boolean;
            isNodeType(type: string): boolean;
            getNodeBaseType(type: string): string;
            getRequireComponents(nodeType: string): Array<string>;

            getAllPropsOfType(type: FTypeDescriptor): Readonly<Record<string, FPropertyDescriptor>>;
            getInitProps(typeDef: FTypeDescriptor): any;
            getDefaultValue(typeDef: FTypeDescriptor, includePrivate?: boolean): any;
            getPropDefaultValue(prop: FPropertyDescriptor): any;
            getDefaultValueComparators(typeDef: FTypeDescriptor): Readonly<Record<string, DefaultValueComparator>>;
        }

        export enum IPCKey {
            CreateNode = 'CreateNode',
            InstantiatePrefab = 'InstantiatePrefab',
            DestroyNode = 'DestroyNode',
            NodeChanged = 'NodeChanged',
            NodeFeaturesChanged = 'NodeStatusChanged',
            GetNodeChildren = 'GetNodeChildren',
            GetNode = 'GetNode',
            SyncNodeProps = 'SyncNodeProps',
            NodeChildrenChanged = 'NodeChildrenChanged',
            ResetNodeChildren = 'ResetNodeChildren',
            SelectionChanged = 'SelectionChanged',
            AddComponent = 'AddComponent',
            ReloadTypes = 'ReloadComponentTypes',
            RunScript = "RunScript",

            CopyNodes = 'CopyNodes',
            PasteNodes = 'PasteNodes',
            DuplicateNodes = 'DuplicateNodes',
            CreatePrefab = 'CreatePrefab',
            FindNodes = 'FindNodes',

            GetResourceProps = "GetResourceProps",
            ResourceChanged = "ResourceChanged",

            SendMessageToPanel = 'SendMessageToPanel',
            PostMessageToPanel = 'PostMessageToPanel',
        }
        export interface IMyScene {
            readonly allNodes: Map<string, WeakRef<IMyNode>>;
            readonly allResources: Map<string, WeakRef<any>>;

            start(): Promise<void>;

            getNodeById(id: string): IMyNode;
            registerNode(node: IMyNode): void;
            findNodes(keyword: string, maxResults?: number): Promise<Array<any>>;
            setProps(obj: IMyNode | IMyComponent, datapath: ReadonlyArray<string>, value: any): Promise<boolean>;
            setResProps(obj: any, datapath: ReadonlyArray<string>, value: any): Promise<boolean>;
            getProps(obj: any): any;

            sendChildChanged(node: IMyNode): void;
            sendNameChanged(node: IMyNode, newName: string): void;
            sendFeaturesChanged(node: IMyNode): void;
        }
        export enum NodeFeatures {
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

        export interface IMyNodeExtra {
            id?: string;
            type?: string;
            selected?: boolean;
            scene?: IMyScene;
        }

        export interface IMyNode {
            hideFlags: number;
            name: string;
            readonly parent: IMyNode;
            readonly destroyed: boolean;
            readonly numChildren: number;

            getChildAt(index: number): IMyNode;
            isAncestorOf(node: IMyNode): boolean;
            hasHideFlag(flag: number): boolean;

            _setBit(type: number, value: boolean): void;
            _getBit(type: number): boolean;

            _extra: IMyNodeExtra;
        }

        export interface IMyComponent {
            readonly owner: IMyNode;
            hideFlags: number;
            enabled: boolean;
        }

        export interface IMyMessagePort {
            start(): void;
            close(): void;

            handle(channel: string, func: (...args: any[]) => Promise<any> | any, target?: any, noAwait?: boolean): void;
            send(channel: string, ...args: any[]): void;
            transfer(channel: string, transfer: Transferable[], ...args: any[]): void;
            invoke(channel: string, ...args: any[]): Promise<any>;
        }
        export interface IEditorClientSingleton {
            readonly port: IMyMessagePort;
            readonly scene: IMyScene;
            readonly typeRegistry: ITypeRegistry;

            addStartCallback(callback: () => void | Promise<void>): void;

            sendMessageToPanel(panelId: string, cmd: string, ...args: Array<any>): Promise<any>;
            postMessageToPanel(panelId: string, cmd: string, ...args: Array<any>): Promise<void>;
            runUIScript(command: string, ...args: any[]): Promise<any>;
        }

    }

    var EditorClient: IEditorClient.IEditorClientSingleton;
}
