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
            IsPrefabReadonly = 128,
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
        export namespace MyMessagePortStatic {
            /**
             * It is used inside the webview or iframe to create a communication channel with the host.
             * @param queueTask Whether to queue the task. If true, the received messages will be queued and processed sequentially. Defaults to false.
             * @returns The message port.
             */
            function requestFromHost(queueTask?: boolean): Promise<IMyMessagePort>;

            /**
             * Connect to a named service.
             * @param serviceName Service name.
             * @param subscribe Whether to receive broadcast messages from the service. Defaults to false.
             * @param args Arguments to pass to the service.
             * @returns The message port.
             */
            function connectService(serviceName: string, subscribe?: boolean, ...args: any[]): IMyMessagePort;
        }

        export interface IMyMessagePort {
            /**
             * A delegate that is called when the port is closed.
             */
            readonly onClose: IDelegate<() => void>;

            /**
             * Whether to log an error to the console when a received message does not have a corresponding handler function.
             */
            logHandlerMissing: boolean;

            /**
             * Start the message port. 
             * 
             * This function only needs to be called when manually constructing a MyMessagePort object. In other cases, such as the object returned by connectService, it does not need to be called.
             */
            start(): void;

            /**
             * Close the message port.
             */
            close(): void;

            /**
             * Register a handler function for a channel.
             * @param channel Channel name.
             * @param func Handler function.
             * @param thisArg The this object to bind the handler function to.
             * @param noAwait If true, the handler function will not be awaited. Defaults to false.
             */
            handle(channel: string, func: (...args: any[]) => Promise<any> | any, thisArg?: any, noAwait?: boolean): void;

            /**
             * Send a message to the other side.
             * @param channel Channel name.
             * @param args Arguments.
             */
            send(channel: string, ...args: any[]): void;

            /**
             * Send a message to the other side and transfer some Transferable objects.
             * @param channel Channel name.
             * @param transfer Transferable objects.
             * @param args Arguments.
             */
            transfer(channel: string, transfer: Transferable[], ...args: any[]): void;

            /**
             * Send a message to the other side and expect a response.
             * @param channel Channel name.
             * @param args Arguments.
             * @returns The response.
             */
            invoke(channel: string, ...args: any[]): Promise<any>;

            /**
             * Manually call a handler function.
             * @param channel Channel name.
             * @param args Arguments.
             * @returns The response.
             */
            callHandler(channel: string, ...args: any[]): Promise<any>;
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
        /**
         * A delegate that can be used to manage multiple callbacks.
         */
        export interface IDelegate<T extends (...args: any[]) => any> {
            /**
             * By default, callbacks will be executed directly. Unless this property is set, the delegate will use this method to execute the callback.
             * @param method The method to execute.
             * @param thisArg The this argument of the method. 
             * @param args The arguments of the method. 
             */
            executor: (method: Function, thisArg: any, ...args: any[]) => void;

            /**
             * Add a callback.
             * @param callback The callback to add. 
             * @param target The this argument of the callback. 
             */
            add(callback: T, target?: any): void;

            /**
             * Add a run-once callback.
             * @param callback The callback to add.
             * @param target The this argument of the callback. 
             */
            once(callback: T, target?: any): void;

            /**
             * Remove a callback.
             * @param callback The callback to remove. 
             * @param target The this argument of the callback. 
             */
            remove(callback: T, target?: any): void;

            /**
             * Clear all callbacks.
             */
            clear(): void;

            /**
             * Clear callbacks for a specific target.
             * @param target The this argument of the callbacks to clear.
             */
            clearForTarget(target: any): void;

            /**
             * Clear callbacks that meet a specific condition.
             * @param test The test function. Return true to clear the callback. 
             */
            clearFor(test: (target: any, callback: T) => boolean): void;

            /**
             * Count of the callbacks.
             */
            readonly count: number;

            /**
             * Execute the callbacks immediately.
             * @param args Arguments of the callbacks.
             */
            invoke(...args: Parameters<T>): void;
        }

        /**
         * The `MyMessagePort` class is used to create a message port object.
         * 
         * A message port is a communication channel that allows two different processes to communicate with each other.
         * @param port The native message port.
         * @param queueTask Whether to queue the task. If true, the received messages will be queued and processed sequentially. Defaults to false.
         * @see IMyMessagePort
         * @see MyMessagePortStatic
         */
        const MyMessagePort: (new (port: MessagePort, queueTask?: boolean) => IMyMessagePort) & typeof MyMessagePortStatic;
    }

    var EditorClient: IEditorClient.IEditorClientSingleton;
}
