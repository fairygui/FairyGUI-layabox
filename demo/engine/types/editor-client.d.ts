export { };
declare global {
    export namespace IEditorClient {

        export interface IResourceManager {
            /**
             * Set the value of the specified property.
             * @param obj The resource object.
             * @param datapath The data path.
             * @param value The value to set.
             * @returns Returns true if the value is set, otherwise returns false.
             */
            setProps(obj: any, datapath: string[], value: any): Promise<boolean>;

            /**
             * Get a plain object that contains all properties of the specified object.
             */
            getProps(obj: any): any;
        }
        export type SceneNavToolType = "move" | "orbit" | "orbit_focus" | "zoom" | "obj_move" | "obj_rotate" | "obj_scale" | "obj_transform";

        export interface IGameScene {
            readonly allNodes: Map<string, WeakRef<Laya.Node>>;
            readonly nodesSet_gizmo: Set<Laya.Node>;
            readonly nodesSet_cameras: Set<Laya.Camera>;
            readonly rootNode2D: Laya.Sprite;
            readonly rootNode3D: Laya.Scene3D;
            readonly scene3D: Laya.Scene3D;
            readonly bridge3DSprite: Laya.Bridge3DSprite;
            readonly prefabRootNode: Laya.Node;
            readonly worldType: string;

            start(): Promise<void>;

            readonly selection: Array<Laya.Node>;
            readonly topLevelSelection: ReadonlyArray<Laya.Node>;
            readonly has3DSelection: boolean;
            addSelection(target: Laya.Node, ctrlKey?: boolean): void;
            setSelection(nodes: ReadonlyArray<Laya.Node>): void;
            removeSelection(node: Laya.Node): void;
            clearSelection(): void;

            readonly openedBoxChain: ReadonlyArray<Laya.Sprite>;
            readonly openedBox: Laya.Sprite;
            openBox(box: Laya.Sprite): void;
            closeBox(): void;
            findBox(node: Laya.Sprite): Laya.Sprite;
            isBox(node: Laya.Node): boolean;

            getNodeById(id: string): Laya.Node;
            registerNode(node: Laya.Node): void;
            findNodes(keyword: string, maxResults?: number): Promise<Array<any>>;
            setProps(obj: Laya.Node | Laya.Component, datapath: ReadonlyArray<string>, value: any): Promise<boolean>;
            setResProps(obj: any, datapath: ReadonlyArray<string>, value: any): Promise<boolean>;
            getProps(obj: any): any;

            recordObject(node: Laya.Node | Laya.Component, ...propNames: ReadonlyArray<string>): void;
            sendChildChanged(node: Laya.Node): void;
            sendNameChanged(node: Laya.Node, newName: string): void;
            sendFeaturesChanged(node: Laya.Node): void;
        }
        export interface IEditorClientSingleton {
            readonly port: IMyMessagePort;
            readonly scene: IGameScene;
            readonly typeRegistry: ITypeRegistry;

            resourceManager: IResourceManager;
            navigationManager: INavigationManager;
            d3Manager: ID3Manager;
            gizmosManager: IGizmosManager;
            pickManager: IPickManager;
            vertexPicker: IVertexPicker;

            hostPixelRatio: number;
            hostViewWidth: number;
            hostViewHeight: number;
            hostCanvasColor: Laya.Color;

            addStartCallback(callback: () => void | Promise<void>): void;

            sendMessageToPanel(panelId: string, cmd: string, ...args: Array<any>): Promise<any>;
            postMessageToPanel(panelId: string, cmd: string, ...args: Array<any>): Promise<void>;
            runUIScript(command: string, ...args: any[]): Promise<any>;

            invalidateFrame(): void;
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
