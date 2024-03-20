export interface IEditorEnv {
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
    readonly ipc: IEditor.IIpc;
    readonly assetMgr: IEditorEnv.IAssetManager;
    readonly sceneManager: IEditorEnv.ISceneManager;
    readonly resourceManager: IEditorEnv.IResourceManager;
    readonly port: IEditor.IMyMessagePort;
    readonly scene: IEditorEnv.IGameScene;
    readonly uiRoot: Laya.Sprite;

    readonly onUpdate: IEditor.IDelegate<() => void>;
    readonly onAppActivate: IEditor.IDelegate<() => void>;

    readonly playerSettings: IEditor.ISettings;
    readonly editorSettings: IEditor.ISettings;
    readonly sceneViewSettings: IEditor.ISettings;
    getSettings(name: string, autoSync?: boolean): IEditor.ISettings;

    invalidateFrame(): void;
}

declare global {
    var EditorEnv: IEditorEnv;

    export namespace IEditorEnv {

        export interface IAssetManager {
            readonly allAssets: Readonly<Record<string, IEditor.IAssetInfo>>;

            getAllAssetsInDir(folder: IEditor.IAssetInfo, types?: Array<IEditor.AssetType>): Array<IEditor.IAssetInfo>;

            readonly resourceDirs: Readonly<Set<IEditor.IAssetInfo>>;
            getAllAssetsInResourceDir(): Array<IEditor.IAssetInfo>;

            getAsset(assetIdOrPath: string): IEditor.IAssetInfo;
            getAssetsByType(types?: Array<IEditor.AssetType>, matchSubType?: boolean): Array<IEditor.IAssetInfo>;

            findAsset(assetPath: string): IEditor.IAssetInfo;

            createFileAsset(filePath: string, metaData?: any): IEditor.IAssetInfo;
            createFolderAsset(folderPath: string): IEditor.IAssetInfo;

            getShader(shaderName: string): IEditor.IAssetInfo;
            setAssetIsShader(asset: IEditor.IAssetInfo, shaderName: string): void;

            getPrefabSourcePath(asset: IEditor.IAssetInfo): string;

            setMetaData(asset: IEditor.IAssetInfo, data: any): void;

            getFullPath(asset: IEditor.IAssetInfo): string;
            toFullPath(assetFile: string): string;

            flushChanges(): Promise<void>;
        }

        export interface IGameScene extends IEditorUI.EventDispatcher {
            readonly id: string;
            readonly asset: IEditor.IAssetInfo;
            readonly port: IEditor.IMyMessagePort;
            readonly selection: ReadonlyArray<Laya.Node>;
            readonly allNodes: Map<string, IEditor.WeakRef<Laya.Node>>;
            readonly topLevelSelection: ReadonlyArray<Laya.Node>;
            readonly modified: boolean;
            readonly viewerMode: boolean;

            readonly nodesSet_gizmo: Set<Laya.Node>;
            readonly nodesSet_cameras: Set<Laya.Camera>;

            readonly loading: boolean;
            readonly rootNode2D: Laya.Scene;
            readonly rootNode3D: Laya.Scene3D;
            readonly prefabRootNode: Laya.Sprite | Laya.Sprite3D;
            readonly worldType: IEditor.WorldType;

            readonly status: IEditor.IConfigObject;

            readonly openedBoxChain: ReadonlyArray<Laya.Sprite>;
            readonly openedBox: Laya.Sprite;
            openBox(box: Laya.Sprite): void;
            closeBox(): void;
            findBox(node: Laya.Node): Laya.Sprite;

            onEnable(): void;
            onDisable(): void;
            destroy(): void;

            serialize(): any;

            readonly snapshotUrl: string;
            validateSnapshot(): void;
            validateScene(): void;

            addSelection(target: Laya.Node, ctrlKey?: boolean): void;
            setSelection(nodes: Laya.Node[]): void;
            removeSelection(node: Laya.Node): void;
            clearSelection(): void;
            readonly has3DSelection: boolean;

            getNodeById(id: string): Laya.Node;
            registerNode(node: Laya.Node): void;
            findNodes(keyword: string, type?: string): Array<any>;
            setProps(obj: any, datapath: string[], value: any): Promise<boolean>;
            getProps(obj: any, changes?: Array<any>, excludeUnserializable?: boolean): boolean;

            recordObject(node: Laya.Node | Laya.Component, ...propNames: string[]): void;

            sendChildChanged(node: Laya.Node): void;
            sendNameChanged(node: Laya.Node, newName: string): void;
            sendFeaturesChanged(node: Laya.Node): void;

            writeRuntime(): void;
        }

        export interface ISceneManager {
            readonly onSelectionChanged: IEditor.IDelegate<() => void>;
            readonly onSceneActivated: IEditor.IDelegate<(currentScene: IGameScene, previousScene: IGameScene) => void>;

            activeScene: IGameScene;
            readonly scenes: ReadonlyArray<IGameScene>;
        }

        export interface IResourceManager {
            saveResources(): void;
            readonly dirtyResources: Set<string>;
        }
    }
}