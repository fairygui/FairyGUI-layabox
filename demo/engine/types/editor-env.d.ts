export { };
declare global {
    /**
     * Namespaces containing various scene-related classes and functions.
     * 
     * All classes and functions in this namespace are running in the Scene process.
     *
     * @remarks In documentation examples, the full-width character `＠` represents the
     * TypeScript decorator character `@`. Replace `＠` with `@` when copying an example.
     * The substitution prevents TypeScript's JSDoc parser from treating decorators inside
     * fenced `@example` blocks as new JSDoc tags.
     */
    export namespace IEditorEnv {
        /** GPU-assisted helper for snapping a screen-space pointer to the nearest mesh vertex. */
        export interface IVertexPicker {
            /**
             * Find the world-space coordinates of the nearest mesh vertex within a screen-space range.
             * @param camera Camera used to project the mesh and pointer coordinates.
             * @param sprite The model to be checked
             * @param x The pixel coordinate X to be detected
             * @param y The pixel coordinate y to be detected
             * @param range The detection range (pixels)
             * @param out Global coordinates
             * @returns true: vertex detected; false: vertex not detected
             */
            pick(camera: Laya.Camera, sprite: Laya.Sprite3D, x: number, y: number, range: number, out: Laya.Vector3): boolean;
        }

        /** Finds asset references by walking plain data according to an editor type descriptor. */
        export interface ITypedDataAnalyzer {
            /** Analyze `data` and return every discovered asset link with its data path. */
            analyse(data: any, typeDef: FTypeDescriptor): Array<IAssetLinkInfo>;
        }

        /** Optional cancellation, temporary-directory and progress settings for texture processing. */
        export interface ITextureToolOptions {
            /**
             * Abort token. If you want to abort the tool on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the tool.
             */
            abortToken?: IAbortToken;

            /**
             * If provided, the tool will use this path as the temporary directory, Otherwise, it will create a temporary directory.
             */
            tempPath?: string;

            /**
             * Progress callback. The progress value is between 0 and 100. 
             */
            progressCallback?: (progress: number) => void;
        }

        /** One generated texture file and the engine format stored in it. */
        export interface ITextureFileWithFormat {
            /**
             * File name without extension. It could be an empty string, indicating the use of the source file.
             */
            file: string;

            /**
             * File extension. e.g. "ktx".
             */
            ext: string;

            /**
             * A Laya.TextureFormat enum value. e.g. 0-R8G8B8, 1-R8G8B8A8, etc.
             */
            format: Laya.TextureFormat;
        }

        /** Per-platform compression overrides applied on top of the default texture settings. */
        export interface ITexturePlatformSettings {
            /**
             * Texture format. e.g. "R8G8B8", "R8G8B8A8", etc.
             */
            format?: string;

            /**
             * Quality of the compressed texture. 0: low, 1: normal, 2: high.
             */
            quality?: number;
        }

        /** Import and conversion settings accepted by {@link ITextureTool.run}. */
        export interface ITextureSettings {
            /**
             * 0: default, 1: lightmap, 2: sprite texture
             */
            textureType?: number;
            /**
             * 0-2D, 1-Cube
             */
            textureShape?: number;

            /**
             * Whether the texture stores data in sRGB (also called gamma) color space.
             */
            sRGB?: boolean;

            /** Force the output format to preserve an alpha channel even when source inspection does not detect one. */
            alphaChannel?: boolean;

            /**
             * If true, mipmaps will be generated. The purpose of mipmaps is to create a series of texture versions with different resolutions. 
             * This allows for the selection of an appropriate texture to sample based on the size of the object on the screen during the rendering process. It effectively improves rendering efficiency, reduces computational overhead, and eliminates visual artifacts such as aliasing and blurring, thereby enhancing the visual quality of the rendering. 
             * However, it should be noted that generating mipmaps will increase the memory usage.
             */
            generateMipmap?: boolean;

            /**
             * Mipmaps can appear faded or blurred at lower levels. 
             * It is generally not enabled by default, but it can be useful in cases where there is significant fog or mist to avoid visual artifacts.
             * However, in most scenarios, it is recommended to keep mipmaps disabled to maintain the visual quality of the textures without any fading or blurring effects.
             */
            fadeOutEnable?: boolean;

            /**
             * @zh 要生成的mipmap级别数量，如需限制，则值应为正数。例如5，只生成5个层级的MIP纹理（第0级到第4级）。默认值为-1，这意味着将根据纹理大小自动确定mipmap级别数量。
             * @en The number of mipmap levels to generate. Default is -1, which means the number of mipmap levels will be automatically determined based on the texture size.
            */
            maxMipLevels?: number;

            /**
             * Anisotropic filtering level. Range is 1-16. Default is 4.
             */
            anisoLevel?: number;

            /**
             * In the context of pre-multiplied alpha, the term \"Alpha\" refers to the alpha channel of an image or texture, which typically represents the opacity or transparency information. It is used to pre-multiply the color channels with the alpha channel before blending. This means that each color channel is multiplied by the value of the alpha channel before the blending operation takes place.
             */
            premultiplyAlpha?: boolean;

            /**
             * 0: repeat, 1: clamp, 2: mirrored
             */
            wrapMode?: number;

            /**
             * 0: nearest, 1: linear, 2: cubic
             */
            filterMode?: number;

            /**
             * Enable this option will make doubles the amount of memory required for the Texture. 
             * This property is therefore disabled by default, and you should enable it only if you require script access.
             */
            readWrite?: boolean;

            /** HDR encoding: `0` for none, `1` for RGBD, or `2` for RGBM. */
            hdrEncodeFormat?: number;

            /**
             * It divides the image into nine regions, where four corners and four edges remain unstretched, while the middle region stretches as needed to fill the target size. 
             * This ensures that image elements remain clear and consistent across screens of different sizes.  
             * (Format: Top margin, Right margin, Bottom margin, Left margin, Repeat filling (Value 0: No repeat fill, 1: Repeat fill))"
             * 
             * @example
             * [10, 10, 10, 10, 1]
             */
            sizeGrid?: Array<number>;

            /**
             * The number of states for button texture skins, supporting monostate, bistate, and tristate buttons.  Bistate divides the skin evenly into two parts, while tristate divides the skin evenly into three parts.
             */
            stateNum?: number;

            /**
             * 0: none, 1: x, 2: y
             */
            flip?: number;

            /**
             * 0: none, 1: left, 2: right
             */
            rotate?: number;

            /**
             * Texture non-quadratic power scaling behavior.
             * 
             * 0: none, 1: nearest, 2: larger, 3: smaller
             */
            npot?: number;

            /**
             * Limits the maximum size of the texture. If the texture exceeds this size, it will be scaled down to fit within the specified dimensions. A value of 0 indicates no limit.
             */
            maxSize?: number;

            /**
             * Optimize the image by using PNG8 compression. This option reduces the color depth of the image to 8 bits, which can significantly reduce the file size while maintaining acceptable visual quality. It is particularly useful for images with a limited color palette, such as icons or simple graphics.
             */
            usePng8?: boolean;

            /** Whether generated cubemap mip levels contain image-based-lighting convolution data. */
            mipmapCoverageIBL?: boolean;

            /** Target cubemap face size in pixels. */
            cubemapSize?: number;

            /** Native texture-tool format name used when generating a cubemap file. */
            cubemapFileMode?: string;

            /** Legacy mipmap fade range. This setting is currently retained for metadata compatibility. */
            fadeOutMipmap?: { x: number, y: number };
            /** Native texture-tool filter value used while generating mipmaps. */
            mipmapFilter?: number;

            /** Reserved native texture-tool edge-extension filter value. */
            extendFilter?: number;

            /**
             * Default platform settings.
             */
            platformDefault?: {
                /** 
                 * 0: RGBA 1: RGB 10:CompressedFormat 
                 *
                 */
                format?: number,
                /**
                 * Quality of the compressed texture. 0: low, 1: normal, 2: high.
                 */
                quality?: number
            };

            /**
             * PC platform settings.
             */
            platformPC?: ITexturePlatformSettings;

            /**
             * Android platform settings.
             */
            platformAndroid?: ITexturePlatformSettings;

            /**
             * iOS platform settings.
             */
            platformIOS?: ITexturePlatformSettings;
        }

        /** Normalized texture metadata returned after conversion and written beside the generated files. */
        export interface ITextureConfig {
            /** 
             * 0-default, 1-lightmap, 2-sprite 
             */
            type: number;

            /**
             * Whether the texture stores data in sRGB (also called gamma) color space.
             */
            sRGB: boolean;

            /** 
             * 0: default, 1: cube 
             */
            shape?: number;

            /**
             * 0: repeat, 1: clamp, 2: mirrored
             */
            wrapMode: number;

            /**
             * 0: nearest, 1: linear, 2: cubic
             */
            filterMode: number;

            /**
             * Anisotropic filtering level. Range is 1-16.
             */
            anisoLevel: number;

            /**
             * Enable this option will make doubles the amount of memory required for the Texture. 
             * This property is therefore disabled by default, and you should enable it only if you require script access.
             */
            readWrite: boolean;

            /**
             * If true, mipmaps will be generated. The purpose of mipmaps is to create a series of texture versions with different resolutions. 
             * This allows for the selection of an appropriate texture to sample based on the size of the object on the screen during the rendering process. It effectively improves rendering efficiency, reduces computational overhead, and eliminates visual artifacts such as aliasing and blurring, thereby enhancing the visual quality of the rendering. 
             * However, it should be noted that generating mipmaps will increase the memory usage.
             */
            mipmap: boolean;

            /**
             * Premultiply alpha.
             */
            pma: boolean;

            /** HDR encoding: `0` for none, `1` for RGBD, or `2` for RGBM. */
            hdrEncodeFormat: number;

            /**
             * It divides the image into nine regions, where four corners and four edges remain unstretched, while the middle region stretches as needed to fill the target size. 
             * This ensures that image elements remain clear and consistent across screens of different sizes.  
             * (Format: Top margin, Right margin, Bottom margin, Left margin, Repeat filling (Value 0: No repeat fill, 1: Repeat fill))"
             * 
             * @example
             * [10, 10, 10, 10, 1]
             */
            sizeGrid?: number[];

            /**
             * The number of states for button texture skins, supporting monostate, bistate, and tristate buttons.  Bistate divides the skin evenly into two parts, while tristate divides the skin evenly into three parts.
             */
            stateNum?: number;

            /**
             * A platform name to file index mapping. The file index is the index of the file in the files array.
             */
            platforms: Record<string, number>;

            /**
             * All files.
             */
            files: Array<ITextureFileWithFormat>;
        }

        export namespace ITextureTool {
            /**
             * Process the texture file with the specified settings.
             * @param srcFilePath The source file path. It is an absolute path.
             * @param destFilePrefix The destination file prefix. The tool generates multiple files based on this prefix.
             * @param config The texture settings.
             * @param options The tool options.
             * @returns The texture config.
             */
            function run(srcFilePath: string, destFilePrefix: string, config: ITextureSettings, options?: ITextureToolOptions): Promise<ITextureConfig>;

            /**
             * Extend the margin of a lightmap or texture to fill empty pixels with neighboring color.
             * This prevents seam artifacts at UV boundaries.
             * @param pixelData The pixel data buffer (RGBA).
             * @param width Width of the texture.
             * @param height Height of the texture.
             * @param margin Number of pixels to extend.
             * @param highFilter Filter quality: 1 for 3x3 kernel, 2 for 5x5 kernel. Default is 1.
             */
            function extendMargin(pixelData: Uint8Array | Float32Array, width: number, height: number, margin: number, highFilter?: number): void;
        }

        /** Image preprocessing options combined with the max-rectangles packing options. */
        export interface ITexturePackerOptions extends IMaxRectsPackingOptions {
            /**
             * Whether to trim the blank area of the image.
             */
            trimImage?: boolean;

            /**
             * Scale of the image.
             */
            scale?: number;

            /**
             * Whether to quantize the output as a palette-based PNG-8 image.
             */
            usePng8?: boolean;
        }

        /** Placement and original-source geometry for one packed atlas entry. */
        export interface IAtlasFrame {
            /** Packed rectangle and output-atlas image index. */
            frame: {
                /** Index into {@link ITexturePackerResult.images}. */
                idx: number;
                /** Left coordinate in the atlas image. */
                x: number;
                /** Top coordinate in the atlas image. */
                y: number;
                /** Packed width. */
                w: number;
                /** Packed height. */
                h: number;
            },
            /** Original source-image dimensions before trimming and scaling. */
            sourceSize: {
                w: number;
                h: number;
            },
            /** Offset of the trimmed sprite within the original source image. */
            spriteSourceSize: {
                x: number,
                y: number
            }
        }

        /** Atlas metadata, per-frame placements and generated atlas image descriptors. */
        export interface ITexturePackerResult {
            /**
             * Metadata of the atlas.
             */
            meta: any;
            /**
             * All the frames in the atlas.
             */
            frames: Record<string, IAtlasFrame>;

            /**
             * All the atlas images.
             */
            images: Array<{ name: string, width: number, height: number }>;
        }

        export namespace ITexturePacker {
            /**
             * Generate a texture atlas from the source files.
             * @param sourceFiles Image files to pack. They are absolute paths.
             * @param outTexturePath The absolute path of the output texture.
             * @param options Packing options.
             * @returns The result of the packing.
             */
            function pack(sourceFiles: string[], outTexturePath: string, options?: ITexturePackerOptions): Promise<ITexturePackerResult>;
        }

        /** Controls type metadata, default-value elimination and node-reference encoding. */
        export interface IEncodeObjOptions {
            /**
             * Write "_$type" field in the object. Default is true.
             */
            writeType?: boolean,

            /**
             * Whether to eliminate default values. If a property on the object has the same value as the default value in the data type, that property will not be included in the returned data.
             * Default is true.
             */
            eliminateDefaults?: boolean,

            /**
             * Callback function to get the id path of the node.
             */
            getNodeRef?: (node: Laya.Node) => string | string[],

            /**
             * Force the use of this type for object serialization.
             */
            forceType?: string;
        }

        /** Controls validation, error collection and node-reference resolution during decoding. */
        export interface IDecodeObjOptions {
            /**
             * An array to receive the errors during deserialization.
             */
            outErrors?: Array<any>;

            /**
             * Validate the type of the deserialized object strictly. Default is false.
             * 
             * A debug message will be output to console if the type of a property is not matched.
             */
            strictTypeCheck?: boolean;

            /**
             * Callback function to get the node by id path.
             */
            getNodeByRef?: (id: string | string[]) => Laya.Node;

            /**
             * Callback function to get the data of the node.
             */
            getNodeData?: (node: Laya.Node) => any;
        }

        export namespace ISerializeUtil {
            /**
             * Whether deserialization is in progress.
             */
            const isDeserializing: boolean;

            /**
             * When a setter is called, this flag can be used to determine whether the call comes from the property panel setting (including undo)
             */
            const isSettingProp: boolean;

            /**
             * Serialize an object to a plain object.
             * @param obj Object to serialize.
             * @param receiver Optional existing object used as serialization context.
             * @param options Serialization options.
             * @returns The serialized object. 
             */
            function encodeObj(obj: any, receiver?: any, options?: IEncodeObjOptions): any;

            /**
             * Serialize a property to a plain object.
             * @param prop Property descriptor.
             * @param obj Object that contains the property.
             * @param options Serialization options.
             * @returns The serialized object. 
             */
            function encodeProperty(prop: FPropertyDescriptor, obj: any, options?: IEncodeObjOptions): any;

            /**
             * Deserialize a plain object to an object.
             * @param data Plain object to deserialize.
             * @param receiver Use this instance as the result object. If null, a new object will be created.
             * @param type Type of the object.
             * @param options Deserialization options.
             * @returns The deserialized object.
             */
            function decodeObj(data: any, receiver?: any, type?: string, options?: IDecodeObjOptions): any;
        }

        /** Build-time JavaScript minification and compatibility-transformation utilities. */
        export interface IScriptTool {
            /**
             * Compress a JavaScript file. The result is cached in `library/minifiedJsCache` for future use.
             * @param filePath The path of the file to compress.
             * @param mangleOptions The options for mangling.
             * - keep_fnames: Keep the function names.
             * - keep_classnames: Keep the class names.
             */
            minifyJsFile(filePath: string, mangleOptions?: { keep_fnames?: boolean, keep_classnames?: boolean }): Promise<void>;

            /**
             * Transform a javascript to conform the ES5 standard. Transformed result is cached for future use. Cache path is library/babelCache.
             * @param filePath The path of the file to transform.
             * @param presets The presets to use. Default is "@babel/preset-env".
             */
            babelTransform(filePath: string, presets?: string): Promise<void>;
        }

        export type ParticleActionCommand = "play" | "pause" | "stop" | "restart" | "seek";

        /** Manages the Scene-process scene collection and dispatches registered scene scripts. */
        export interface ISceneManager {
            /**
             * Triggered when the selection is changed.
             */
            readonly onSelectionChanged: IDelegate<() => void>;

            /**
             * Triggered when the scene is activated.
             * @param currentScene The current scene.
             * @param previousScene The previous scene.
             */
            readonly onSceneActivated: IDelegate<(currentScene: IMyScene, previousScene: IMyScene) => void>;

            /**
             * Triggered when the Scene panel sends a particle preview action.
             */
            readonly onParticleAction: IDelegate<(command: ParticleActionCommand, value?: number) => void>;

            /**
             * Current active scene.
             */
            activeScene: IMyScene;

            /**
             * All scenes.
             */
            readonly scenes: ReadonlyArray<IMyScene>;

            /**
             * Execute a function by name. The name is in the form of "className.staticMethodName".
             * A className must be registered with ＠IEditorEnv.regClass.
             * @param scene The this object.
             * @param name objectName.methodName
             * @param args The arguments.
             * @returns The registered function's resolved return value. If no function is found, the method logs an error and resolves to `undefined`.
             * @example
             * ```
             * ＠IEditorEnv.regClass
             * class MyTest {
             *    static sayHello() {
             *       console.log("Hello");
             *   }
             * }
             * 
             * await EditorEnv.scene.runScript("MyTest.sayHello"); // Output: Hello
             * ```
             */
            runSceneScript(scene: IMyScene, name: string, ...args: any[]): Promise<any>;
        }

        /** Optional Scene-process lifecycle hooks registered through `＠IEditorEnv.sceneHook`. */
        export interface ISceneHook {
            /**
             * Called when a new node is about to be created.
             * @param scene The scene where the node is created. 
             * @param node The new node instance. 
             */
            onCreateNode?(scene: IMyScene, node: Laya.Node): void | Promise<void>;

            /**
             * Called when a new widget is about to be created.
             * @param scene The scene where the widget is created. 
             * @param widget The new widget instance. 
             */
            onCreateWidget?(scene: IMyScene, widget: gui.Widget): void | Promise<void>;

            /**
             * Called when a new component is about to be created.
             * @param scene The scene where the component is created. 
             * @param comp The new component instance. 
             */
            onCreateComponent?(scene: IMyScene, comp: Laya.Component): void | Promise<void>;

            /**
             * Called when a scene is about to be saved.
             * @param scene The scene to be saved. 
             * @param data The data to be saved. 
             */
            onSaveScene?(scene: IMyScene, data: any): void | Promise<void>;

            /**
             * Called when a scene is loaded.
             * @param scene The scene to be loaded. 
             */
            onLoadScene?(scene: IMyScene): void | Promise<void>;

            /**
             * Called when a scene is about to write runtime code.
             * @param scene The scene. 
             * @param info The information of the runtime code. 
             */
            onWriteRuntime?(scene: IMyScene, info: IWriteRuntimeInfo): void | Promise<void>;
        }

        /** Mutable generated-code context passed to {@link ISceneHook.onWriteRuntime}. */
        export interface IWriteRuntimeInfo {
            /**
             * The generated code. You can replace it with your own code, or set it to null to skip the generation.
             */
            code: string | null;

            /**
             * The runtime script asset.
             */
            readonly scriptAsset: IAssetInfo;

            /**
             * The import statements.
             */
            readonly imports: string[];

            /**
             * The class name.
             */
            readonly className: string;

            /**
             * The super class name.
             */
            readonly superClassName: string;

            /**
             * The variable declaration statements.
             */
            readonly vars: string[];
        }

        /** SVG stroke attributes accepted by gizmo elements. */
        export interface StrokeData {
            /** CSS stroke color. */
            color?: string;
            /** Stroke width in screen pixels. */
            width?: number;
            /** Stroke opacity in the range `[0, 1]`. */
            opacity?: number;
            /** SVG `stroke-linecap` value. */
            linecap?: string;
            /** SVG `stroke-linejoin` value. */
            linejoin?: string;
            /** SVG miter-limit value. */
            miterlimit?: number;
            /** SVG dash pattern, such as `"4 2"`. */
            dasharray?: string;
            /** Offset into the SVG dash pattern. */
            dashoffset?: number;
        }

        /** SVG fill attributes accepted by gizmo elements. */
        export interface FillData {
            /** CSS fill color. */
            color?: string
            /** Fill opacity in the range `[0, 1]`. */
            opacity?: number
            /** SVG fill-rule value, usually `"nonzero"` or `"evenodd"`. */
            rule?: string
        }

        /** Factory and coordinate-conversion API for one node's SVG overlay gizmos. */
        export interface ISVGGizmos {
            /**
             * Owner node.
             */
            readonly owner: IMyNode;
            /**
             * SVG container of the gizmos. 
             */
            readonly container: Container;

            /**
             * Create a rectangle.
             * @param width Width. 
             * @param height Height. 
             */
            createRect(width: number, height: number): IGizmoRect;

            /**
             * Create a circle.
             * @param radius Radius of the circle. 
             */
            createCircle(radius: number): IGizmoCircle;

            /**
             * Create a polygon.
             * @param easyTouch If the polygon's lines need to be used for interaction, the lines might be too thin for the user to easily select. When set to true, a larger transparent area will be generated around the lines to increase the interaction area.
             */
            createPolygon(easyTouch?: boolean): IGizmoPolygon;

            /**
             * Create an ellipse.
             * @param rx Radius x.
             * @param ry Radius y.
             */
            createEllipse(rx: number, ry: number): IGizmoEllipse;

            /**
             * Create a path.
             * @param easyTouch If the path's lines need to be used for interaction, the lines might be too thin for the user to easily select. When set to true, a larger transparent area will be generated around the lines to increase the interaction area.
             */
            createPath(easyTouch?: boolean): IGizmoPath;

            /**
             * Create a text.
             * @param text Text content. 
             */
            createText(text?: string): IGizmoText;

            /**
             * Create a handle. A handle is a small graphic that can be dragged by the user.
             * @param shape Shape of the handle. Can be a rectangle or a circle.
             * @param size Size of the handle.
             * @param fill Fill style of the handle. 
             * @param stroke Stroke style of the handle. Default is no stroke. 
             * @param cursor Optional cursor style of the handle, e.g. "default", "pointer", "grab", etc. Default is "pointer". 
             * @param buttonSkin Optional button skin for the handle. If provided, the handle will have different styles for normal, hover, and down states.
             */
            createHandle(shape: "rect" | "circle", size: number, fill: FillData | string, stroke?: StrokeData | string, cursor?: string,
                buttonSkin?: { over?: { fill: FillData | string, stroke?: StrokeData | string }, down?: { fill: FillData | string, stroke?: StrokeData | string } }
            ): IGizmoHandle;

            /**
             * Create a handle group. Handle Group uses caching and can be used to retrieve and recycle handles with the same style each frame.
             * @param shape Shape of the handle. Can be a rectangle or a circle.
             * @param size Size of the handle.
             * @param fill Fill style of the handle.
             * @param stroke Stroke style of the handle. Default is no stroke.
             * @param cursor Optional cursor style of the handle, e.g. "default", "pointer", "grab", etc. Default is "pointer".
             * @param offset Optional offset of the handle.
             * @param buttonSkin Optional button skin for the handle. If provided, the handle will have different styles for normal, hover, and down states. 
             */
            createHandleGroup(shape: "rect" | "circle", size: number, fill: FillData | string, stroke?: StrokeData | string, cursor?: string,
                offset?: gui.Vec2, buttonSkin?: { over?: { fill: FillData | string, stroke?: StrokeData | string }, down?: { fill: FillData | string, stroke?: StrokeData | string } }
            ): IGizmoHandleGroup;

            /**
             * Create an icon handle. An icon handle is a handle that uses images for different button states.
             * @param normal Normal state image URL.
             * @param over Over state image URL. 
             * @param down Down state image URL. 
             * @param cursor Optional cursor style of the handle, e.g. "default", "pointer", "grab", etc. Default is "pointer". 
             */
            createIconHandle(normal: string, over?: string, down?: string, cursor?: string): IGizmoIconHandle;

            /**
             * Add an element to the manager.
             * @param ele The element to add. 
             */
            addElement<T extends IGizmoElement>(ele: T): T;

            /**
             * Convert local coordinates to global coordinates.
             * Local coordinates are relative to the owner node. Global coordinates are relative to the screen, which are used to position the gizmos.
             * @param x Local x.
             * @param y Local y. 
             * @param out An optional output vector to receive the result. If not provided, a new vector is created.
             * @returns The global coordinates.
             */
            localToGlobal(x: number, y: number, out?: gui.Vec2): gui.Vec2;

            /**
             * Convert global coordinates to local coordinates.
             * Local coordinates are relative to the owner node. Global coordinates are relative to the screen, which are used to position the gizmos.
             * @param x Global x. 
             * @param y Global y. 
             * @param out An optional output vector to receive the result. If not provided, a new vector is created.
             * @param targetSpace The target space to convert to. If not provided, the owner node will be used.
             * @returns The local coordinates. 
             */
            globalToLocal(x: number, y: number, out?: gui.Vec2, targetSpace?: IMyNode): gui.Vec2;
        }

        /** Common lifecycle, interaction and styling surface of an SVG gizmo element. */
        export interface IGizmoElement {
            /**
             * Owner manager.
             */
            readonly owner: ISVGGizmos;

            /**
             * SVG element of the gizmo.
             */
            readonly element: Element;

            /**
             * Underlying DOM node owned by {@link element}.
             */
            readonly node: SVGElement;

            /**
             * Custom tag.
             */
            tag: string;

            /**
             * Triggered when the user starts dragging the element.
             */
            readonly onDragStart: IDelegate<(evt: MouseEvent) => void>;

            /**
             * Triggered when the user is dragging the element.
             */
            readonly onDragMoving: IDelegate<(evt: MouseEvent, dx: number, dy: number) => void>;

            /**
             * Triggered when the user stops dragging the element.
             */
            readonly onDragEnd: IDelegate<(evt: MouseEvent) => void>;

            /**
             * Triggered when the user clicks the element.
             */
            readonly onClick: IDelegate<(evt: MouseEvent) => void>;

            /**
             * Triggered when the user double clicks the element.
             */
            readonly onDblClick: IDelegate<(evt: MouseEvent) => void>;

            /**
             * Triggered when the user right clicks the element. Users can pop up their own menu in the callback event. To prevent the default menu from appearing, call evt.preventDefault().
             */
            readonly onContextMenu: IDelegate<(evt: MouseEvent) => void>;

            /**
             * X position of the element. It's in global coordinates.
             */
            get x(): number;

            /**
             * Y position of the element. It's in global coordinates.
             */
            get y(): number;

            /**
             * Visibility of the element.
             */
            get visible(): boolean;
            set visible(value: boolean);

            /**
             * Interactivity of the element.
             */
            get touchable(): boolean;
            set touchable(value: boolean);

            /**
             * 可以给Gizmo设置一个方向属性，鼠标指针样式会根据这个方向属性自动调整。数值与方向的关系见下图：
             * 
             * 0 - 1 - 2
             * |       |
             * 7       3
             * |       |
             * 6 - 5 - 4
             */
            get direction(): number;
            set direction(value: number);

            /**
             * CSS cursor style of the element, for example `"default"`, `"pointer"`, or `"grab"`.
             */
            get cursor(): string;
            set cursor(value: string);

            /**
             * Set the position of the element by local coordinates.
             * Local coordinates are relative to the owner node.
             * @param x Local x.
             * @param y Local y.
             */
            setLocalPos(x: number, y: number): this;

            /**
             * Set the position of the element by global coordinates.
             * Global coordinates are relative to the screen.
             * @param x Global x.
             * @param y Global y.
             */
            setPos(x: number, y: number): this;

            /**
             * Reposition the element to its stored local coordinates. Useful for group elements that need to reposition after the content changes.
             */
            reposition(): this;

            /**
             * Set the offset of the element. The offset will be added to the position when setting the position.
             * @param offsetX X offset. 
             * @param offsetY Y offset. 
             */
            setOffset(offsetX: number, offsetY: number): this;

            /**
             * Set the size of the element.
             * @param width Width.
             * @param height Height.
             */
            setSize(width: number, height: number): this;

            /**
             * Set the stroke style of the element.
             * @param value Stroke style.
             */
            stroke(value: StrokeData | string): this;

            /**
             * Set the fill style of the element.
             * @param value Fill style.
             */
            fill(value: FillData | string): this;

            /**
             * Set a custom data to the element.
             * @param name Name of the data.
             * @param value Value of the data.
             */
            setData(name: string, value: any): this;

            /**
             * Get a custom data from the element.
             * @param name Name of the data.
             * @returns The value of the data.
             */
            getData(name: string): any;

            /**
             * Set the button status of the element. Only works when the element is set up as a button.
             * @param status Button status. Can be "normal", "over", or "down". 
             */
            setButtonStatus(status: "normal" | "over" | "down"): void;
        }

        /** Draggable rectangular or circular SVG handle. */
        export interface IGizmoHandle extends IGizmoElement {
        }

        /** Draggable handle rendered from normal/hover/pressed image skins. */
        export interface IGizmoIconHandle extends IGizmoElement {
        }

        /** Reusable pool of identically styled handles for dynamic per-frame geometry. */
        export interface IGizmoHandleGroup extends IGizmoElement {
            /**
             * Triggered when the user starts dragging a handle.
             */
            readonly onHandleDragStart: IDelegate<(handle: IGizmoHandle, evt: MouseEvent) => void>;

            /**
             * Triggered when the user is dragging a handle.
             */
            readonly onHandleDragMoving: IDelegate<(handle: IGizmoHandle, evt: MouseEvent, dx: number, dy: number) => void>;

            /**
             * Triggered when the user stops dragging a handle.
             */
            readonly onHandleDragEnd: IDelegate<(handle: IGizmoHandle, evt: MouseEvent) => void>;

            /**
             * Triggered when the user clicks a handle.
             */
            readonly onHandleClick: IDelegate<(handle: IGizmoHandle, evt: MouseEvent) => void>;

            /**
             * Triggered when the user double clicks a handle.
             */
            readonly onHandleDblClick: IDelegate<(handle: IGizmoHandle, evt: MouseEvent) => void>;

            /**
             * Triggered when the user right clicks the handle. Users can pop up their own menu in the callback event. To prevent the default menu from appearing, call evt.preventDefault().
             */
            readonly onHandleContextMenu: IDelegate<(handle: IGizmoHandle, evt: MouseEvent) => void>;

            /**
             * Get all visible handles.
             */
            get array(): ReadonlyArray<IGizmoHandle>;

            /**
             * Add a handle.
             */
            add(): IGizmoHandle;

            /**
             * Remove a handle from screen and return it to the pool.
             */
            remove(handle: IGizmoHandle): void;

            /**
             * Clear all handles and return them to the pool.
             */
            clear(): void;
        }

        /** Rectangle SVG gizmo element. */
        export interface IGizmoRect extends IGizmoElement {
        }

        /** Circle SVG gizmo element. */
        export interface IGizmoCircle extends IGizmoElement {
            /** Set the radius in owner-node local coordinates. */
            setLocalRadius(value: number): this;
            /** Set the radius in screen/global coordinates. */
            setRadius(value: number): this;
        }

        /** Ellipse SVG gizmo element. */
        export interface IGizmoEllipse extends IGizmoElement {
            /**
             * Set the radius of the ellipse. The value is in local coordinates.
             * @param rx Radius x.
             * @param ry Radius y.
             */
            setLocalRadius(rx: number, ry: number): this;

            /**
             * Set the radius of the ellipse. The value is in global coordinates.
             * @param rx Radius x.
             * @param ry Radius y.
             */
            setRadius(rx: number, ry: number): this;
        }

        /** Polygon SVG gizmo backed by a mutable flat point array. */
        export interface IGizmoPolygon extends IGizmoElement {
            /**
             * All points of the polygon. The coordinates of the points are stored in the array in the order of x0, y0, x1, y1, etc.
             * 
             * You can directly modify this array. After modification, you need to call refresh to update the graphics.
             */
            readonly points: Array<number>;

            /**
             * Refresh the polygon.
             */
            refresh(): void;
        }

        /** Mutable SVG path gizmo. Call {@link refresh} after changing its commands. */
        export interface IGizmoPath extends IGizmoElement {
            /**
             * If true, the coordinates passed in the subsequent drawing operations are relative to the coordinates of the last drawing operation. 
             * If false, the coordinates passed are absolute coordinates. Default is false.
             */
            relativeCoords: boolean;

            /** Begin a new subpath at `(x, y)`. */
            moveTo(x: number, y: number): this;
            /** Add a straight line to `(x, y)`. */
            lineTo(x: number, y: number): this;
            /** Add a smooth cubic curve using the previous control-point reflection and the supplied control/end point. */
            cubicCurveTo(x: number, y: number, x2: number, y2: number): this;
            /** Add a cubic Bezier curve with two control points and an end point. */
            cubicCurveTo(x: number, y: number, x1: number, y1: number, x2: number, y2: number): this;
            /** Add a smooth quadratic curve to `(x, y)`. */
            quadCurveTo(x: number, y: number): this;
            /** Add a quadratic Bezier curve using a control point and end point. */
            quadCurveTo(x: number, y: number, x1: number, y1: number): this;
            /** Add a quadratic curve; omitting the control point selects the smooth form. */
            quadCurveTo(x: number, y: number, x1?: number, y1?: number): this;

            /**
             * Clear the path.
             */
            resetPath(): this;

            /**
             * Refresh the path.
             */
            refresh(): void;
        }

        /** Text SVG gizmo element. */
        export interface IGizmoText extends IGizmoElement {
            /**
             * Set the font style of the text.
             * @param value Font style.
             * @example
             * ```
             * setFontProp('family', 'Menlo');
             * setFontProp('size', 12);
             * setFontProp('weight', 'bold');
             * ```
             */
            setFontProp(prop: string, value: string | number): this;

            /** Replace the displayed text. */
            setText(text: string): this;
        }


        /** Tracks mutable Scene-process resources and persists their changes. */
        export interface IResourceManager {
            /**
             * Save all resources.
             */
            saveResources(): Promise<void>;

            /**
             * All dirty resources.
             */
            readonly dirtyResources: Set<string>;

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

            /** Starts tracking a loaded resource so later edits can be detected and saved. */
            trackResource(resource: any): void;
        }

        /** A localizable prefab string and the object property that stores it. */
        export interface IPrefabI18nString {
            /**
             * Object that contains the property.
             */
            obj: any;

            /**
             * The property name.
             */
            prop: string;

            /**
             * The value of the property.
             */
            text: string;
        }

        /** Selects prefab analysis outputs and optional entity visitors. */
        export interface IPrefabAnalyseOptions {
            /**
             * Whether to get the dependencies.
             */
            getDeps?: boolean;

            /**
             * Whether to get the i18n strings.
             */
            getI18nStrings?: boolean;

            /**
             * Whether it's release environment. In release environment, properties marked with stripInBuild in their definitions will be skipped.
             */
            release?: boolean;

            /**
             * A callback function that will be called when visiting an entity.
             * @param data Entity data.
             * @param typeDef The type definition of the entity.
             * @param isOverrideEntry Whether the entity is an override entry.
             */
            entityVisitor?: (data: any, typeDef: FTypeDescriptor, isOverrideEntry: boolean) => void;

            /**
             * A callback function that will be called when visiting an error entity.
             * @param data Entity data.
             * @param error The error code. 
             * @param isComponent Whether the entity is a component. 
             * @param isOverrideEntry Whether the entity is an override entry. 
             */
            errorEntityVisitor?: (data: any, error: PrefabEntityErrorCode, isComponent: boolean, isOverrideEntry: boolean) => void;
        }

        /** Structural error reported while walking serialized prefab entities. */
        export enum PrefabEntityErrorCode {
            /**
             * The type is missing.
             */
            TypeMissing = 0,

            /**
             * The entity points to a prefab, but the prefab is missing.
             */
            ResourceMissing = 1,

            /**
             * The entity is an override entry, but the target specified by the override is missing.
             */
            OverrideTargetMissing = 2
        }

        /** Dependency and localization data collected from one prefab. */
        export interface IPrefabAnalyseResult {
            /**
             * Dependencies.
             */
            deps: Array<IAssetLinkInfo>;

            /**
             * I18n strings.
             */
            i18nStrings: Array<IPrefabI18nString>;
        }

        /** Reads, validates, traverses and minimizes serialized prefab data. */
        export interface IPrefabDataAnalyzer {
            /**
             * Analyse the prefab data.
             * @param asset The asset to be analysed.
             * @param options The options.
             * @returns The analysis result.
             */
            analyse(asset: IAssetInfo, options: IPrefabAnalyseOptions): Promise<IPrefabAnalyseResult>;

            /**
             * Analyse the raw data which is in lh format.
             * @param sourceData The raw data.
             * @param isWidget Whether the raw data is widget format.
             * @param options The options.
             * @returns The analysis result.
             */
            analyseRaw(sourceData: any, isWidget: boolean, options: IPrefabAnalyseOptions): Promise<IPrefabAnalyseResult>;

            /**
             * Get the raw serialized data of a prefab asset.
             * @param asset Prefab asset to read.
             * @returns Parsed prefab data.
             */
            getContent(asset: IAssetInfo): Promise<any>;

            /**
             * Get serialized nodes indexed by node ID for a prefab asset.
             * @param asset Prefab asset to read.
             * @returns Node data indexed by ID.
             */
            getNodeMap(asset: IAssetInfo): Promise<Record<string, any>>;

            /**
             * Delete unused data for release environment.
             * @param content Prefab content data.
             * @returns The minimized prefab data.
             */
            minifyPrefabData(content: any): any;
        }

        /** GPU-based scene picking for object IDs, nodes and world positions. */
        export interface IPickManager {
            /**
             * Pick object id list through pixel coordinates
             * @param x pixel coordinate x
             * @param y pixel coordinate y 
             * @param range pixel range, objects within the range will be picked 
             * @param camera camera used for picking, commonly it is EditorEnv.d3Manager.sceneCamera.
             * @param addCmds commands to render pick buffer.
             * @returns object id list
             */
            pickIds(x: number, y: number, range: number, camera: Laya.Camera, addCmds: (cmdBuffer: Laya.CommandBuffer) => void): Array<number>;

            /**
             * Pick object id list through pixel coordinates in 2D mode
             * @param x pixel coordinate x
             * @param y pixel coordinate y 
             * @param range pixel range, objects within the range will be picked 
             * @param size the size of render texture to render pick buffer, commonly it is the size of scene render texture.
             * @param addCmds commands to render pick buffer.
             * @returns object id list 
             */
            pickIds2D(x: number, y: number, range: number, size: { width: number, height: number }, addCmds: (cmdBuffer: Laya.CommandBuffer2D) => void): Array<number>;

            /**
             * Pick world position through pixel coordinates
             * @param x pixel coordinate x 
             * @param y pixel coordinate y 
             * @param ignoreSelected whether to ignore selected objects
             * @returns The picked world position, or null when the coordinates are outside the pick render target.
             */
            pickPos(x: number, y: number, ignoreSelected?: boolean): Readonly<Laya.Vector4> | null;

            /**
             * Pick Sprite3D through pixel coordinates in current scene.
             * @param x pixel coordinate x 
             * @param y pixel coordinate y 
             * @param range pixel range, objects within the range will be picked 
             * @param ignoreSelected whether to ignore selected objects
             * @returns The picked sprite, or null when nothing is hit.
             */
            pickSprite3D(x: number, y: number, range: number, ignoreSelected?: boolean): Laya.Sprite3D | null;

            /**
             * Pick Sprite3D through pixel coordinates in specified render commands.
             * @param x pixel coordinate x
             * @param y pixel coordinate y 
             * @param range pixel range, objects within the range will be picked 
             * @param addCmds commands to render pick buffer.
             * @returns The picked sprite, or null when nothing is hit.
             */
            pickSprite3D(x: number, y: number, range: number, addCmds: (cmdBuffer: Laya.CommandBuffer) => void): Laya.Sprite3D | null;

            /**
             * Pick Sprite through pixel coordinates in specified render commands.
             * @param x pixel coordinate x
             * @param y pixel coordinate y
             * @param range pixel range, objects within the range will be picked
             * @param addCmds commands to render pick buffer.
             * @returns The picked sprite, or null when nothing is hit.
             */
            pickSprite(x: number, y: number, range: number, addCmds: (cmdBuffer: Laya.CommandBuffer2D) => void): Laya.Sprite | null;

            /**
             * Pick a 2D Sprite/Node from the scene using GPU rendering.
             * Renders the subtree under `root` with pick colors and reads back the pixel at (x, y).
             * @param x Pixel coordinate x (scaled by pixelRatio).
             * @param y Pixel coordinate y (scaled by pixelRatio).
             * @param range pixel range (currently unused for scene pick, pass 0).
             * @param root The root sprite to pick from.
             * @returns The picked Node (Sprite or Sprite3D from Bridge3D), or null if nothing was hit.
             */
            pickSprite(x: number, y: number, range: number, root: Laya.Sprite): Laya.Node | null;

        }

        /** Renderable target and lifecycle callbacks submitted to an offscreen renderer. */
        export interface IOffscreenRenderSubmit {
            /**
             * This is the target for offscreen rendering, point to a existing sprite or a scene3D.
             * 
             * If it is null, the rendering result is empty.
             */
            readonly renderTarget: Laya.Sprite | Laya.Scene3D | null;

            /**
             * The background color of the preview.
             */
            readonly bgColor: Laya.Color;

            /**
             * Called before rendering.
             */
            onPreRender(): void;

            /**
             * Called after rendering.
             */
            onPostRender(): void;
        }

        /** Queue-based renderer that produces `ImageBitmap` previews outside the visible scene. */
        export interface IOffscreenRenderer {
            /**
             * Width of the rendertexture.
             */
            readonly width: number;

            /**
             * Height of the rendertexture.
             */
            readonly height: number;

            /**
             * Triggered when the rendering is completed.
             * @param target The target passed in the submit method.
             * @param bitmap The rendering result.
             * @param contentWidth The width of the bitmap. 
             * @param contentHeight The height of the bitmap.
             */
            onComplete: (target: IOffscreenRenderSubmit, bitmap: ImageBitmap, contentWidth: number, contentHeight: number) => void;

            /**
             * Submit a rendering target. The rendering result will be returned by the onComplete event.
             * @param target The target to be rendered. 
             */
            submit(target: IOffscreenRenderSubmit): void;

            /**
             * Submit a rendering target, wait for the rendering to complete, and return the rendering result.
             * @param target The target to be rendered.
             * @returns The rendering result.
             * - bitmap: The rendering result.
             * - contentWidth: The width of the bitmap.
             * - contentHeight: The height of the bitmap. 
             */
            draw(target: IOffscreenRenderSubmit): Promise<{ bitmap: ImageBitmap, contentWidth: number, contentHeight: number }>;

            /**
             * Destroy the renderer.
             */
            destroy(): void;
        }

        /** Reusable 3D preview scene used by offscreen asset renderers. */
        export interface IOffscreenRenderScene {
            /**
             * Scene3D object.
             */
            readonly scene3D: Laya.Scene3D;

            /**
             * Camera object.
             */
            readonly camera: Laya.Camera;

            /**
             * Light object.
             */
            readonly light: Laya.Sprite3D;

            /**
             * Plane object.
             */
            readonly plane: Laya.Sprite3D;

            /**
             * A sphere.
             */
            readonly obj: Laya.Sprite3D;

            /**
             * A sprite3D object mainly used to hold the user's model.
             */
            readonly holder: Laya.Sprite3D;

            /**
             * Helper object for camera control.
             */
            readonly cameraControls: ICameraControls;

            /**
             * Current shape of the preview object. Such as "Box", "Sphere", "Cylinder", "Capsule", "Cone", "Plane".
             */
            readonly objShape: string;

            /**
             * Focus distance ratio. Default is 1.3.
             */
            focusDistanceRatio: number;

            /**
             * Destroy the scene.
             */
            destroy(): void;

            /**
             * Reset the camera transform.
             */
            resetCameraTransform(): void;

            /**
             * Set focus to the holder object.
             */
            focusNode(): void;

            /**
             * Set sky material.
             */
            setSkyMaterial(mat: Laya.Material): void;

            /**
             * Rotate the camera.
             * @param x X axis movement.
             * @param y Y axis movement.
             */
            rotate(x: number, y: number): void;

            /**
             * Change the mesh by shape name of the 'obj' object.
             * @param shape The shape to be changed to. Such as "Box", "Sphere", "Cylinder", "Capsule", "Cone", "Plane".
             */
            changeShape(shape: string): Promise<void>;
        }

        /** Simple class-name keyed pool for reusable editor objects. */
        export interface IObjectPool {
            /**
             * Get an object from the pool.
             * @param className The class name.
             * @returns Returns the object.
             */
            getObject(className: string): any;

            /**
             * Return an object to the pool.
             * @param obj The object.
             */
            returnObject(obj: any): void;

            /**
             * Destroy the pool.
             */
            destroy(): void;
        }

        /** Scene-viewport navigation state, tool selection, focus, picking and cursor control. */
        export interface INavigationManager {
            /**
             * Whether the mouse is down.
             */
            readonly isMouseDown: boolean;
            /**
             * The SVG root element of the navigation view.
             */
            readonly svgRoot: any;
            /**
             * The view scale of the navigation view.
             */
            viewScale: number;
            /**
             * Get or set whether it is in 2D mode.
             */
            mode2d: boolean;

            /**
             * Change the current tool type.
             * @param toolType The tool type. 
             * @param notifyHost Whether to notify the ui process. 
             * @param isTemp Whether it is a temporary change. 
             */
            changeToolType(toolType: SceneNavToolType, notifyHost?: boolean, isTemp?: boolean): void;
            /**
             * Focus on the specified node.
             * @param node The node to focus on. 
             */
            focusNode(node: IMyNode): void;

            /**
             * Get the sprite under the mouse cursor.
             * @param x The x coordinate of the mouse cursor. 
             * @param y The y coordinate of the mouse cursor. 
             */
            getSpriteUnderMouse(x: number, y: number): Laya.Node | null;

            /**
             * Prevent the context menu from appearing. It is usually called when the mouse is down.
             */
            preventContextMenu(): void;

            /**
             * Set the cursor of the navigation view.
             * @param cursor The cursor css string, e.g. "pointer", "crosshair", "move", etc. Or a custom cursor url, e.g. "url('cursor.png')"、"url('cursor.png') 16 16", etc.
             * Set null to reset to default cursor.
             */
            setCursor(cursor: string | null): void;
        }

        /** Built-in viewport navigation or object-transform tool identifier. */
        export type SceneNavToolType = "move" | "orbit" | "orbit_focus" | "zoom" | "obj_move" | "obj_rotate" | "obj_scale" | "obj_transform";

        /** Optional positioning and duplicate-name handling for newly created nodes. */
        export interface ICreateNodeOptions {
            /**
             * When creating a node, a reasonable position will be set for the node if this option is true. Default is true.
             */
            setDefaultPos?: boolean;

            /**
             * When creating a node, name conflict will be resolved if this option is true. Default is true.
             */
            fixDupName?: boolean;
        }

        /** Common Scene-process API implemented by 2D, 3D and GUI editing scenes. */
        export interface IMyScene extends gui.EventDispatcher {
            /**
             * A internal unique id of the scene.
             */
            readonly id: string;

            /**
             * The asset of the scene. It may be null if the scene is new and not saved.
             */
            readonly asset: IAssetInfo | null;

            /**
             * Communication port to the UI process.
             */
            readonly port: IMyMessagePort;

            /**
             * All nodes in the scene. The key is the id of the node.
             */
            readonly allNodes: Map<string, WeakRef<IMyNode>>;

            /**
             * The selection of the scene.
             */
            readonly selection: ReadonlyArray<IMyNode>;

            /**
             * The top level selection of the scene.
             * This is a subset of the selection, containing only top-level nodes. For example, if the selection contains nodes A and B, and node A is the parent of node B, then the topLevelSelection will only contain node A.
             */
            readonly topLevelSelection: ReadonlyArray<IMyNode>;

            /**
             * Whether the scene is modified.
             */
            readonly modified: boolean;

            /**
             * Whether the scene is in read-only mode.
             */
            readonly viewerMode: boolean;

            /**
             * Whether the scene is loading.
             */
            readonly loading: boolean;

            /**
             * Scene2D node.
             */
            readonly rootNode2D: IMyNode;

            /**
             * Scene3D node. May be null if the scene is a 2D scene.
             */
            readonly rootNode3D: IMyNode | null;

            /**
             * Scene3D node. The difference between this property and rootNode3D is that this property will be a bridge scene3D or a standalone scene3D.
             */
            readonly scene3D: IMyNode;

            /**
             * Prefab root node. May be null if the scene is not a prefab editing scene.
             */
            readonly prefabRootNode: IMyNode | null;

            /**
             * The world type of the scene.
             * - 2d: 2D prefab editing scene.
             * - 3d: 3D prefab editing scene.
             * - null: Common scene. 2D and 3D nodes can be mixed.
             * - gui: GUI scene.
             */
            readonly worldType: WorldType | null;

            /**
             * Scene status is used to store temporary data about the scene.
             */
            readonly status: IConfigObject;

            /**
             * Opened boxes in sequence.
             */
            readonly openedBoxChain: ReadonlyArray<IMyNode>;

            /**
             * The last box in the openedBoxChain. Null if no box is opened.
             */
            readonly openedBox: IMyNode | null;

            /**
             * Open a box. Only available for box-like sprites, such as Box, Panel, List, etc.
             * 
             * A box-like sprite is a sprite which children are not selectable in the stage only after it is double-clicked to open.
             * @param box The box-like sprite to open.
             */
            openBox(box: IMyNode): void;

            /**
             * Close the opened box.
             */
            closeBox(): void;

            /**
             * Find the box that contains the specified node.
             * @param node The node to find.
             * @returns The box that contains the node. Null if the node is not in any box. 
             */
            findBox(node: IMyNode): IMyNode | null;

            /**
             * Check if a node is a box.
             * @param node The node to check.
             */
            isBox(node: IMyNode): boolean;

            /**
             * Serialize the nodes to a data object.
             * @param nodes The nodes to serialize. 
             */
            serializeNodes(nodes: ReadonlyArray<IMyNode>): any;

            /**
             * Deserialize the data to nodes.
             * @param data The data to deserialize. 
             * @param keepStoreId Whether to keep the node id from the data. Default is true. If false, new ids will be generated for the nodes.
             * @returns The deserialized nodes.
             */
            deserializeNodes(data: any, keepStoreId?: boolean): Promise<Array<IMyNode>>;

            /**
             * Reload the nodes with the specified data.
             * @param nodes Nodes to reload.
             * @param datas Data for the nodes.
             * @param outErrors An array to receive the errors. If not provided, errors will be printed to the console. 
             */
            reloadNodes(nodes: ReadonlyArray<IMyNode>, datas: ReadonlyArray<any>, outErrors?: Array<any>): Promise<void>;

            /**
             * Run these tests to validate the scene:
             * - Check if the file is outdated.
             * - Check all prefabs to see if they are outdated.
             * @param ignorePrefab If true, the prefab validation will be skipped. Default is false.
             */
            validateScene(ignorePrefab?: boolean): void;

            /**
             * Set the scene to modified status.
             */
            setModified(): void;

            /**
             * Add a node to the selection.
             * @param target The node to add.
             * @param ctrlKey If this operation is triggered by pressing the Ctrl key. If true, the node will be toggled in the selection.
             */
            addSelection(target: IMyNode, ctrlKey?: boolean): void;

            /**
             * Set the selection to the specified nodes.
             * @param nodes The nodes to set as the selection. 
             */
            setSelection(nodes: ReadonlyArray<IMyNode>): void;

            /**
             * Remove a node from the selection.
             * @param node The node to remove. 
             */
            removeSelection(node: IMyNode): void;

            /**
             * Clear the selection.
             */
            clearSelection(): void;

            /**
             * Whether any 3D node is selected.
             */
            readonly has3DSelection: boolean;

            /**
             * Get a node by id.
             * @param id The id of the node.
             * @returns The node. Null if not found.
             */
            getNodeById(id: string): IMyNode | null;
            /**
             * Find nodes by keyword.
             * @param keyword Keyword to search. 
             * @param maxResults The maximum number of results. Default is 200.
             * @returns An array where each element contains the node's id, type, name, and features, followed by the next node's information.
             */
            findNodes(keyword: string, maxResults?: number): Array<any>;

            /**
             * Add a node to the scene.
             * @param parentNode The parent node. 
             * @param node The node to add.
             * @param index The index to insert the node. If not provided, the node will be added to the end. 
             */
            addNode(parentNode: IMyNode, node: IMyNode, index?: number): void;

            /**
             * Remove a node from its parent.
             * @param node The node to remove. 
             */
            removeNode(node: IMyNode): void;

            /**
             * Instantiate a prefab. Note that the new created node will not be added to the scene in this method.
             * @param assetId The id of the prefab asset. 
             * @param nodeProps The properties of the node. 
             * @param parentNode The parent node. 
             * @param options Options for creating the node. 
             * @returns The newly created node, or null if the prefab cannot be instantiated.
             */
            instantiatePrefab(assetId: string, nodeProps: Record<string, any>, parentNode: IMyNode, options?: ICreateNodeOptions): Promise<IMyNode | null>;

            /**
             * Unpack a prefab. That means all nodes in the prefab will be converted to normal nodes.
             * @param prefabNode The prefab node to unpack. 
             * @param deep If true, all nested prefabs will also be unpacked. Default is false. 
             */
            unpackPrefab(prefabNode: IMyNode, deep?: boolean): Promise<void>;

            /**
             * Create a new prefab asset from the specified node.
             * @param node The node to create the prefab from.
             * @param savePath The path to save the prefab asset. It is a relative path to the asset root. 
             * @param fileName If specified, the name of the prefab asset. If not specified, the name of the node will be used.
             * @return The new asset.
             */
            createPrefab(node: IMyNode, savePath: string, fileName?: string): Promise<IAssetInfo>;

            /**
             * Set the value of a property of a node or component.
             * @param obj The node or component.
             * @param datapath The data path of the property. e.g. ["transform", "localPosition", "x"]. 
             * @param value The value to set.
             * @returns Whether the value is set successfully.
             */
            setProps(obj: IMyNode | IMyComponent, datapath: ReadonlyArray<string>, value: any): Promise<boolean>;

            /**
             * Get a plain object containing all properties of a node or component.
             * @param obj The node or component.
             * @return The plain object containing all properties.
             */
            getProps(obj: IMyNode | IMyComponent): any;

            /**
             * Track changes to specified properties of a node or component until the next synchronization with the UI process. 
             * During this period, property changes can be undone.
             * @param node The node or component to track.
             * @param propNames The properties to track.
             */
            recordObject(node: IMyNode | IMyComponent, ...propNames: ReadonlyArray<string>): void;

            /**
             * If the node or component is inside a prefab, this method will create an override entry for the specified properties of the node or component. If the node is not inside a prefab, this method does nothing.
             * @param obj The node or component.
             * @param datapaths Multiple data paths of the properties.
             */
            setObjectChanged(obj: IMyNode | IMyComponent, ...datapaths: ReadonlyArray<ReadonlyArray<string> | string>): void;

            /**
             * Execute a function by name. The name is in the form of "className.staticMethodName".
             * A className must be registered with ＠IEditorEnv.regClass.
             * @param name objectName.methodName
             * @param args The arguments.
             * @returns The registered function's resolved return value. If no function is found, the method logs an error and resolves to `undefined`.
             * @example
             * ```
             * ＠IEditorEnv.regClass
             * class MyTest {
             *    static sayHello() {
             *       console.log("Hello");
             *   }
             * }
             * 
             * await EditorEnv.scene.runScript("MyTest.sayHello"); // Output: Hello
             * ```
             */
            runScript(name: string, ...args: any[]): Promise<any>;

            /**
             * Execute a function of a node or component.
             * @param target The node or component.
             * @param methodName The method name.
             * @param args The arguments.
             * @returns The result of the function. 
             */
            runNodeScript(target: IMyNode | IMyComponent, methodName: string, ...args: any[]): Promise<any>;
        }

        /** Editor-only metadata attached to a live Scene-process node. */
        export interface IMyNodeExtra {
            /** Stable editor node ID. */
            readonly id?: string;
            /** Registered editor type name. */
            readonly type?: string;
            /** Whether the node belongs to the current editor selection. */
            readonly selected?: boolean;
            /** Whether this node is the outermost root of a prefab instance. */
            readonly isTopPrefab?: boolean;
            /** Whether prefab ownership prevents direct editing. */
            readonly isPrefabReadonly?: boolean;
            /** Source prefab asset ID when the node belongs to a prefab. */
            readonly prefabId?: string;
            /** Scene wrapper that owns the node. */
            readonly scene?: IMyScene;
        }

        /** Minimal common surface shared by engine nodes and GUI widgets in the Scene process. */
        export interface IMyNode {
            /** Editor/engine visibility and serialization bit flags. */
            hideFlags: number;
            /** User-facing node name. */
            name: string;
            /** Parent node, or null for a scene root. */
            readonly parent: IMyNode | null;
            /** Whether the underlying runtime object has been destroyed. */
            readonly destroyed: boolean;
            /** Number of direct children. */
            readonly numChildren: number;

            /** Return the child at `index`. */
            getChildAt(index: number): IMyNode;
            /** Test whether this node is an ancestor of `node`. */
            isAncestorOf(node: IMyNode): boolean;
            /** Test one `hideFlags` bit. */
            hasHideFlag(flag: number): boolean;

            /** Set an internal engine/editor state bit. Prefer higher-level APIs when available. */
            _setBit(type: number, value: boolean): void;
            /** Read an internal engine/editor state bit. Prefer higher-level APIs when available. */
            _getBit(type: number): boolean;

            /** Editor metadata associated with this node. */
            _extra: IMyNodeExtra;
        }

        /** Minimal common component surface used by Scene-process editor APIs. */
        export interface IMyComponent {
            /** Node that owns the component. */
            readonly owner: IMyNode;
            /** Editor/engine visibility and serialization bit flags. */
            hideFlags: number;
            /** Whether the component participates in runtime updates. */
            enabled: boolean;
        }

        /** Rectangle accepted by the max-rectangles atlas packer. Output fields are written in place. */
        export interface IRectangle {
            /** Rectangle width in pixels. */
            width: number;
            /** Rectangle height in pixels. */
            height: number;
            /** Packed x-coordinate; assigned by the packer. */
            x: number;
            /** Packed y-coordinate; assigned by the packer. */
            y: number;
            /** Whether the packer may rotate this rectangle by 90 degrees. */
            allowRotation?: boolean;
            /** Caller-defined source index. */
            index?: number;
            /** Optional grouping tag used with tagged packing. */
            tag?: number;
            /** Caller-defined payload retained on the rectangle. */
            data?: any;

            /** Whether the rectangle exceeded the configured bin dimensions. */
            oversized?: boolean;
            /** Whether the packed rectangle was rotated by 90 degrees. */
            rotated?: boolean;
        }

        /** One output bin and its remaining free-space rectangles. */
        export interface IBin<T extends IRectangle> {
            /** Bin width in pixels. */
            width: number;
            /** Bin height in pixels. */
            height: number;
            /** Free rectangles remaining after placement. */
            freeRects: IRectangle[];
            /** Source rectangles assigned to this bin. */
            rects: T[];
            /** Optional grouping tag associated with the bin. */
            tag?: number;
        }

        /** Heuristic used to select the next max-rectangles placement. */
        export enum MaxRectsPackingLogic {
            /** Prefer the placement that minimizes unused area. */
            MaxArea = 0,
            /** Prefer the placement that minimizes the longest leftover edge. */
            MaxEdge = 1
        }

        /**
         * Options for MaxRect Packer
         * @property {boolean} smart Smart sizing packer (default is true)
         * @property {boolean} pot use power of 2 sizing (default is true)
         * @property {boolean} square use square size (default is false)
         * @property {boolean} allowRotation allow rotation packing (default is false)
         * @property {boolean} tag allow auto grouping based on `rect.tag` (default is false)
         * @property {boolean} exclusiveTag tagged rects will have dependent bin, if set to `false`, packer will try to put tag rects into the same bin (default is true)
         * @property {boolean} border atlas edge spacing (default is 0)
         * @property {MaxRectsPackingLogic} logic MAX_AREA or MAX_EDGE based sorting logic (default is MAX_EDGE)
         * @export
         * @interface Option
         */
        export interface IMaxRectsPackingOptions {
            /** Grow bin dimensions to fit content. Defaults to `true`. */
            smart?: boolean,
            /** Round bin dimensions up to powers of two. Defaults to `true`. */
            pot?: boolean,
            /** Force square output bins. Defaults to `false`. */
            square?: boolean,
            /** Allow rectangles to rotate by 90 degrees. Defaults to `false`. */
            allowRotation?: boolean,
            /** Group rectangles using their `tag` values. Defaults to `false`. */
            tag?: boolean,
            /** Put distinct tags in independent bins. Defaults to `true`. */
            exclusiveTag?: boolean,
            /** Empty spacing reserved at atlas edges, in pixels. Defaults to `0`. */
            border?: number,
            /** Placement heuristic. Defaults to {@link MaxRectsPackingLogic.MaxEdge}. */
            logic?: MaxRectsPackingLogic
        }

        /** Incremental max-rectangles bin packer used to build texture atlases. */
        export interface IMaxRectsPacker<T extends IRectangle> {
            /** Output bins produced so far. */
            readonly bins: IBin<T>[];

            /**
             * Add a bin/rectangle object with data to packer
             * @param {number} width of the input bin/rectangle
             * @param {number} height of the input bin/rectangle
             * @param {*} data custom data object
             */
            add(width: number, height: number, data: any): T;
            /**
             * Add a bin/rectangle object extends IRectangle to packer
             * @template T Generic type extends IRectangle interface
             * @param {T} rect the rect object add to the packer bin
             */
            add(rect: T): T;
            /**
             * Add an Array of bins/rectangles to the packer.
             *
             * `Javascript`: Any object has property: { width, height, ... } is accepted.
             *
             * `Typescript`: object shall extends `MaxrectsPacker.IRectangle`.
             *
             * note: object has `hash` property will have more stable packing result
             *
             * @param {T[]} rects Array of bin/rectangles
             */
            addArray(rects: T[]): void;
            /**
             * Reset entire packer to initial states, keep settings
             */
            reset(): void;
            /**
             * Stop adding new element to the current bin and return a new bin.
             *
             * note: After calling `next()` all elements will no longer added to previous bins.
             *
             * @returns {number}
             */
            next(): number;

            /**
             * Return current functioning bin index, perior to this wont accept any new elements
             *
             * @readonly
             * @type {number}
             */
            get currentBinIndex(): number;

            /**
             * Return all rectangles in this packer
             *
             * @readonly
             * @type {T[]}
             */
            get rects(): T[];
        }

        /** Local HTTP/HTTPS server used for project preview and plugin-provided file routes. */
        export interface ILiveServer {
            /**
             * Host name.
             */
            readonly host: string;

            /**
             * Port number.
             */
            readonly port: number;

            /**
             * Port number for secure connection.
             */
            readonly securePort: number;

            /**
             * Base URL of the server, in the form `http://host:port`.
             */
            readonly url: string;

            /**
             * The instance of the express application.
             */
            readonly expressApp: express.Express;

            /**
             * Serve a local file at the specified URL path.
             * @param routePath URL path relative to the live-server root.
             * @param filePath Absolute path of the local file.
             */
            addFileRoute(routePath: string, filePath: string): void;

            /**
             * Remove a previously registered local-file route.
             * @param routePath URL path relative to the live-server root.
             */
            removeFileRoute(routePath: string): void;

            /**
             * Start a web server to serve the specified directory.
             * @param webRootPath The absolute root path served by the web server.
             * @param secure Whether to use secure connection. Default is false.
             * @returns The URL of the server, e.g. "http://192.168.1.1:19090".
             */
            serveAnywhere(webRootPath: string, secure?: boolean): Promise<string>;
        }

        export namespace ILineEditor {
            /**
             * Get the distance from a point to a line segment. 
             * @param x The x coordinate of the point. 
             * @param y The y coordinate of the point. 
             * @param x1 The x coordinate of the line segment's starting point. 
             * @param y1 The y coordinate of the line segment's starting point. 
             * @param x2 The x coordinate of the line segment's ending point. 
             * @param y2 The y coordinate of the line segment's ending point.
             * @return The distance from the point to the line segment.
             * - d: The distance from the point to the line segment.
             * - x: The x coordinate of the projection point on the line segment.
             * - y: The y coordinate of the projection point on the line segment.
             */
            function getDistance(x: number, y: number, x1: number, y1: number, x2: number, y2: number): { d: number, x: number, y: number };

            /**
             * Add a point to a line segment.
             * @param points The coordinates of the points of the line segment, in the format of [x1, y1, x2, y2, x3, y3,...]. 
             * @param x The x coordinate.
             * @param y The y coordinate. 
             * @param isLoop Whether to form a closed loop with the first point when the last point is detected. 
             * @param tolerance The tolerance of the detection. Default is 5.
             * @return Whether the point is added successfully. 
             */
            function addPoint(points: number[], x: number, y: number, isLoop?: boolean, tolerance?: number): boolean;
        }
        /** Laya DCC resource-cache generation helpers used during a build. */
        export namespace ILayaDCC {
            /** Generate DCC metadata for the built resources under `resourcePath`. */
            function build(task: IBuildTask, resourcePath: string): Promise<void>;
        }

        /** Encodes one or more image buffers into a Windows ICO file buffer. */
        export interface IIcoEncoder {
            /**
             * encode writes the stored image buffers into the internal buffer storage,
             * creating the appropriate ICONDIR, ICONDIRENTRY, and data locations.
             * 
             * @param imageBuffers An array of image buffers containing images.
             * @returns Buffer The resulting Buffer ready to be written to a file.
             */
            encode(imageBuffers: Array<Buffer | ArrayBuffer>): Buffer;
        }

        export namespace II18nUtils {
            /**
             * Analyze all prefab files in the folder and sub-folers where the configuration file is located, collect all the text that needs to be translated into the reference file, and convert these texts into an internationalized format. If the reference file is not set, one will be automatically generated.
             */
            function collectStrings(defAssetId: string): Promise<void>;

            /**
             * Make all entries in the translation files match the reference file.
             */
            function syncTranslations(defAssetId: string): Promise<void>;
        }
        /** Controls node references and output shape during hierarchy serialization. */
        export interface IHierarchyWriterOptions {
            /**
             * Callback function to get the id path of the node.
             */
            getNodeRef?: (node: Laya.Node) => string | string[];

            /**
             * Omit header fields such as `_$ver`. Defaults to `false`.
             */
            noHeader?: boolean;

            /**
             * If true, additional actions will be performed according to the `forInstanceOnly` flag.
             */
            creatingPrefab?: boolean;

            /**
             * If true, children nodes will be ignored.
             */
            ignoreChildren?: boolean;
        }

        export namespace IHierarchyWriter {
            /**
             * Serialize the node to a plain object.
             * @param node The node to serialize.
             * @param options The options.
             * @returns The serialized object.
             */
            function write(node: Laya.Node, options?: IHierarchyWriterOptions): any;

            /**
             * Serialize the scene to a plain object.
             * @param scene2D The 2D scene to serialize.
             * @param scene3D The 3D scene to serialize.
             * @returns The serialized object.
             */
            function writeScene(scene2D: Laya.Scene, scene3D: Laya.Scene3D, options?: IHierarchyWriterOptions): any;

            /**
             * Collect all resources referenced by the node.
             * @param node The node.
             * @param out The output set. If not specified, a new set will be created.
             * @returns The output set.
             */
            function collectResources(node: Laya.Node, out?: Set<any>): Set<any>;
        }

        /** One structural or reference error found in serialized hierarchy data. */
        export interface ValidationError {
            /**
             * RFC 6902 JSON Pointer 格式的错误位置路径
             * 例如: /root/child/items/0/position
             */
            path: string;
            /** Machine-readable validation category. */
            errorType: 'undefined-property' | 'type-mismatch' | 'invalid-type' | 'prefab-conflict' | 'invalid-prefab-format' | 'invalid-override' | 'override-position-error' | 'prefab-missing' | 'override-node-missing' | 'parent-node-missing';
            /** Human-readable diagnostic message. */
            errorMessage: string;
        }

        /** Validates the structure, types, prefab references and overrides in hierarchy data. */
        export interface IHierarchyValidator {
            /**
             * Validate the hierarchy data.
             * @param data The hierarchy data.
             * @returns The list of validation errors.
             */
            validate(data: any): ValidationError[];
        }

        /** Visual and interaction state of a scene handle. */
        export enum HandleState {
            /**
             * Normal state, the handle is not hovered or active.
             */
            Normal,
            /**
             * Mouse is hovering over the handle.
             */
            Hovered,
            /**
             * The handle is being dragged.
             */
            Active,
            /**
             * When one handle is in the dragging state, other handles will be set to inactive state.
             */
            Inactive
        }

        /** Pointer/drag event currently being processed by the immediate-mode handle API. */
        export enum HandleEvent {
            /** A handle received a pointer-down event. */
            MouseDown,
            /** A handle received a pointer-up event. */
            MouseUp,
            /** The pointer moved over a handle without dragging it. */
            MouseMove,
            /** A handle is being dragged. */
            Drag,
            /** A handle received a right-click event. */
            RightClick
        }

        /** Appearance of an immediate-mode 2D handle. */
        export type Handle2DStyle = {
            /**
             * The shape of the 2D handle, it can be "rect" or "circle", default is "circle".
             */
            shape?: "rect" | "circle",
            /**
             * The color of the handle.
             */
            color?: Laya.Color | HandleColor;
            /**
             * The line color of the handle.
             */
            lineColor?: Laya.Color | HandleColor;
            /**
             * The size of the handle.
             */
            size?: number;
            /**
             * The anchor point of the handle.
             */
            anchor?: Laya.Vector2;
        };

        /** Per-item state and custom payload passed when opening a handle context menu. */
        export interface IHandleContextMenuOptions {
            /** Visibility overrides indexed by menu item ID. */
            visible?: Record<string, boolean>;
            /** Enabled-state overrides indexed by menu item ID. */
            enabled?: Record<string, boolean>;
            /** Checked-state overrides indexed by menu item ID. */
            checked?: Record<string, boolean>;
            /** Host-defined value returned when a menu item is selected. */
            data?: any;
        }

        /** Immediate-mode scene handle API used while drawing custom editor gizmos. */
        export interface IHandles extends IGizmos3D {

            /**
             * The current handle event.
             */
            readonly event: HandleEvent;

            /**
             * Create a position move handle.
             * @param position The initial position.
             * @returns The new position.
             */
            positionMoveHandle(position: Laya.Vector3): {
                valueChanged: boolean,
                result: Laya.Vector3
            };

            /**
             * Create a direction move handle.
             * @param direction The direction.
             * @param position The initial position.
             * @param size The handle size.
             * @param color The handle color.
             * @returns The new position.
             */
            directionMoveHandle(direction: Laya.Vector3, position: Laya.Vector3, size: number, color?: Laya.Color): {
                valueChanged: boolean,
                result: Laya.Vector3
            };

            /**
             * Create a direction move handle.
             * @param direction
             * @param position
             * @param size
             * @param color
             * @returns The new position.
             */
            directionMoveQuadHandle(direction: Laya.Vector3, position: Laya.Vector3, size: number, color?: Laya.Color): {
                valueChanged: boolean,
                result: Laya.Vector3
            };

            /**
             * Create a plane move handle.
             * @param direction1
             * @param direction2
             * @param position
             * @param size
             * @param color
             * @returns The new position.
             */
            planeMoveHandle(direction1: Laya.Vector3, direction2: Laya.Vector3, position: Laya.Vector3, size: number, color?: Laya.Color): {
                valueChanged: boolean,
                result: Laya.Vector3
            };

            /**
             * Create a world move handle.
             * @param position
             * @param targetVertex
             * @param size
             * @param color
             * @returns The new position.
             */
            worldMoveHandle(position: Laya.Vector3, targetVertex: boolean, size: number, color?: Laya.Color): {
                valueChanged: boolean,
                result: Laya.Vector3
            };

            /**
             * Create a direction scale handle.
             * @param scale The initial scale.
             * @param position The position.
             * @param rotation The rotation.
             * @param size The handle size.
             * @param color The handle color.
             * @returns The new scale.
             */
            directionScaleHandle(scale: number, position: Laya.Vector3, rotation: Laya.Quaternion, size: number, color?: Laya.Color): {
                valueChanged: boolean,
                result: number
            };

            /**
             * Create a radius handle.
             * @param radius The initial radius.
             * @param position The position.
             * @param rotation The rotation.
             * @param color The handle color.
             * @returns The new radius.
             */
            radiusHandle(radius: number, position: Laya.Vector3, rotation?: Laya.Quaternion, color?: Laya.Color): {
                valueChanged: boolean,
                result: number
            };

            /**
             * Create a 2D move handle, which can be used to move objects in 2D view.
             * @param matrix The matrix to transform the handle.
             * @param x The x position of the handle center. Default is 0.
             * @param y The y position of the handle center. Default is 0.
             * @param style The handle style.
             * @param targetSpace The coordinate space used for calculating the handle movement. Default is the same as matrix. If another matrix is passed in, it means the movement will be in the coordinate space defined by that matrix, and the resulting deltaX and deltaY will also be calculated based on that coordinate space.
             * @returns The delta movement in x and y direction.
             */
            move2DHandle(matrix: Laya.Matrix, x?: number, y?: number, style?: Handle2DStyle['shape'] | Handle2DStyle, targetSpace?: Laya.Matrix): {
                valueChanged: boolean,
                deltaX: number;
                deltaY: number;
            };

            /**
            * Handles for editing boxes, which can be used to resize boxes in 3D view.
            * @param center The center of the box.
            * @param size The size of the box.
            * @param color The line color.
            * @param rotation The rotation of the box.
            * @return The new position and size of the box.
            */
            editBox(center: Laya.Vector3, size: Laya.Vector3, color?: Laya.Color, rotation?: Laya.Quaternion, isCenter?: boolean): {
                valueChanged: boolean,
                position: Laya.Vector3,
                size: Laya.Vector3
            };

            /**
             * Handles for editing capsules, which can be used to resize capsules in 3D view.
             * @param center The center of the capsule.
             * @param radius The radius of the capsule.
             * @param height The height of the capsule.
             * @param color The line color.
             * @param rotation The rotation of the capsule.
             * @return The new position, radius and height of the capsule.
             */
            editCapsule(center: Laya.Vector3, radius: number, height: number, color?: Laya.Color, rotation?: Laya.Quaternion): {
                valueChanged: boolean,
                position: Laya.Vector3;
                radius: number;
                height: number;
            };

            /**
             * Handles for editing cylinders, which can be used to resize cylinders in 3D view.
             * @param center The center of the cylinder.
             * @param upRadius The up radius of the cylinder.
             * @param downRadius The down radius of the cylinder.
             * @param height The height of the cylinder.
             * @param color The line color.
             * @param rotation The rotation of the cylinder.
             * @return The new position, radius and height of the cylinder.
             */
            editCylinder(center: Laya.Vector3, upRadius: number, downRadius: number, height: number, color?: Laya.Color, rotation?: Laya.Quaternion): {
                valueChanged: boolean,
                position: Laya.Vector3;
                upRadius: number;
                downRadius: number;
                height: number;
            };

            /**
             * Handles for editing cones, which can be used to resize cones in 3D view.
             * @param rotation The rotation.
             * @param topPosition The top position of the cone.
             * @param angle The angle of the cone.
             * @param range The range of the cone.
             * @param color The handle color.
             * @returns The new angle(x) and range(y).
             */
            editCone(rotation: Laya.Quaternion, topPosition: Laya.Vector3, angle: number, range: number, color?: Laya.Color): {
                valueChanged: boolean,
                result: Laya.Vector2
            };

            /**
             * Handles for editing planes, which can be used to resize planes in 3D view.
             * @param rotation The rotation.
             * @param center The center of the plane.
             * @param width The width of the plane.
             * @param height The height of the plane.
             * @param color The handle color.
             * @param spread The spread of the plane.
             * @returns The new width(x) and height(y).
             */
            editPlane(rotation: Laya.Quaternion, center: Laya.Vector3, width: number, height: number, color?: Laya.Color, spread?: number): {
                valueChanged: boolean,
                result: Laya.Vector2
            };

            /**
             * Handles for editing ellipses, which can be used to resize ellipses in 3D view.
             * @param rotation The rotation.
             * @param center The center of the ellipse.
             * @param width The width of the ellipse.
             * @param height The height of the ellipse.
             * @param color The handle color.
             * @param spread The spread of the ellipse.
             * @returns The new width(x) and height(y).
             */
            editEllipse3D(rotation: Laya.Quaternion, center: Laya.Vector3, width: number, height: number, color?: Laya.Color, spread?: number): {
                valueChanged: boolean,
                result: Laya.Vector2
            };

            /**
             * Handles for editing rectangles, which can be used to resize rectangles in 2D view.
             * @param matrix The matrix to transform the handle.
             * @param x The x position of the rect center.
             * @param y The y position of the rect center.
             * @param width The width of the rect.
             * @param height The height of the rect.
             * @param targetSpace The coordinate space used for calculating the handle movement. Default is the same as matrix.
             * @return The new center position and size of the rect.
             */
            editRectangle(matrix: Laya.Matrix, x: number, y: number, width: number, height: number, targetSpace?: Laya.Matrix): {
                valueChanged: boolean,
                center: Laya.Vector2,
                size: Laya.Vector2
            };

            /**
             * Handles for editing circles, which can be used to resize circles in 2D view.
             * @param matrix The matrix to transform the handle. 
             * @param x The x position of the circle center. 
             * @param y The y position of the circle center. 
             * @param radius The radius of the circle.
             * @param targetSpace The coordinate space used for calculating the handle movement. Default is the same as matrix.
             * @returns The new center position and radius of the circle.
             */
            editCircle(matrix: Laya.Matrix, x: number, y: number, radius: number, targetSpace?: Laya.Matrix): {
                valueChanged: boolean,
                center: Laya.Vector2,
                radius: Laya.Vector2
            };

            /**
             * Handles for editing ellipses, which can be used to resize ellipses in 2D view.
             * @param matrix The matrix to transform the handle.
             * @param x The x position of the ellipse center.
             * @param y The y position of the ellipse center.
             * @param radiusX The radiusX of the ellipse.
             * @param radiusY The radiusY of the ellipse.
             * @param targetSpace The coordinate space used for calculating the handle movement. Default is the same as matrix.
             */
            editEllipse(matrix: Laya.Matrix, x: number, y: number, radiusX: number, radiusY: number, targetSpace?: Laya.Matrix): {
                valueChanged: boolean,
                center: Laya.Vector2,
                radius: Laya.Vector2
            };

            /**
             * Handles for editing paths, which can be used to edit paths in 2D view.
             * @param matrix The matrix to transform the handle.
             * @param x The x position of the path handle.
             * @param y The y position of the path handle.
             * @param points The points of the path, in the format of [x1, y1, x2, y2, ...].
             * @param closed Whether the path is closed, if closed is true, there will be an additional line segment between the last point and the first point.
             * @param lineWidth The line width of the handle. Default is 1.
             * @param lineColor The line color of the handle. Default is Color.CLEAR(transparent).
             * @param fixedLength If true, the handle will not allow adding new points or removing points. Default is false.
             * @param targetSpace The coordinate space used for calculating the handle movement. Default is the same as matrix.
             */
            editPath(matrix: Laya.Matrix, x: number, y: number, points: number[], closed: boolean, lineWidth?: number, lineColor?: Laya.Color, fixedLength?: boolean, targetSpace?: Laya.Matrix): {
                valueChanged: boolean,
                points: number[],
            };

            /**
             * Handles for editing curve paths (Bezier, CubicBezier, Straight, CRSpline).
             * Draws the curve, anchor point handles, and bezier control point handles.
             * Ctrl+click on the curve to add a point, Alt+click on a point to delete it.
             * Right-click a point handle to open the context menu.
             * @param matrix The matrix to transform the handle.
             * @param x The x offset of the path.
             * @param y The y offset of the path.
             * @param points The path points.
             * @param lineWidth The line width. Default is 1.
             * @param lineColor The line color. Default is Color.CLEAR(transparent).
             * @param fixedLength If true, the handle will not allow adding new points or removing points. Default is false.
             * @param targetSpace The coordinate space used for calculating the handle movement. Default is the same as matrix.
             */
            editCurvePath(matrix: Laya.Matrix, x: number, y: number, points: Laya.PathPoint[], lineWidth?: number, lineColor?: Laya.Color, fixedLength?: boolean, targetSpace?: Laya.Matrix): {
                valueChanged: boolean,
                points: Laya.PathPoint[],
            };

            /**
             * Handles for editing 3D curve paths (Bezier, CubicBezier, Straight, CRSpline) in 3D view.
             * Draws the curve, anchor point handles, and bezier control point handles.
             * Ctrl+click on the curve to add a point, Alt+click on a point to delete it.
             * Right-click a point handle to open the context menu.
             * @param worldMatrix The world matrix of the path owner.
             * @param points The path points.
             * @param lineColor The line color. Default is Color.CLEAR(transparent).
             * @param localOffset The local offset applied to all points.
             * @param fixedLength If true, the handle will not allow adding new points or removing points. Default is false.
             * @param targetSpace The coordinate space used for snapping. Default is the same as worldMatrix.
             */
            editCurvePath3D(worldMatrix: Laya.Matrix4x4, points: Laya.PathPoint[], lineColor?: Laya.Color, localOffset?: Laya.Vector3, fixedLength?: boolean, targetSpace?: Laya.Matrix4x4): {
                valueChanged: boolean,
                points: Laya.PathPoint[],
            };

            /**
             * Show a handle.
             * @param handleClass The handle class.
             * @param args The arguments for start method.
             * @returns The handle instance.
             */
            showHandle<T extends HandleBase>(handleClass: (new () => T) | T, ...args: Parameters<T['execute']>): T;

            /**
             * Set the cursor when hovering or dragging handles.
             * @param cursor The cursor css string, e.g. "pointer", "crosshair", "move", etc. Or a custom cursor url, e.g. "url('cursor.png')"、"url('cursor.png') 16 16", etc.
             */
            setCursor(cursor: string): void;

            /**
             * Set the context menu callback when right click on last added handle.
             * @returns An object with showMenu function, when right click on the handle, the showMenu function will be returned and caller is responsible for calling this function with proper menuId and options to show the context menu. If clicked is returned, it means the context menu has been clicked, and the menuId and a custom data will be returned.
             */
            setMenu(): { showMenu?: (menuId: string, options?: IHandleContextMenuOptions) => void, clicked?: string, data?: any };

            /**
             * Set the pointer capture for the last added handle. When no other handle is hovered or active, the pointer events will be captured by this handle, and the handle will receive all pointer events.
             */
            setPointerCapture(): void;
        }

        export namespace IHandleUtils {

            /**
             * Get current mouse position. It is the result of the screen mouse position multiplied by EditorEnv.hostPixelRatio.
             */
            const mousePosition: Readonly<Laya.Vector2>;

            /**
             * Get last mouse position. It is the result of the screen mouse position multiplied by EditorEnv.hostPixelRatio.
             */
            const lastMousePosition: Readonly<Laya.Vector2>;

            /**
             * Get current mouse position in screen coordinates.
             */
            const screenMousePosition: Readonly<Laya.Vector2>;

            /**
             * Get last mouse position in screen coordinates.
             */
            const lastScreenMousePosition: Readonly<Laya.Vector2>;

            /**
             * Get the appropriate handle size for the specified coordinates.
             * @param position The position of the handle.
             * @returns The handle size.
             */
            function getHandleSize(position: Laya.Vector3): number;

            /**
             * Get the world-space length of one screen pixel at the specified position.
             * @param position The world-space position.
             * @returns The world-space length corresponding to one screen pixel.
             */
            function getWorldUnitsPerPixel(position: Laya.Vector3): number;

            /**
             * Get the transformation matrix for a handle in the local space of a sprite. 
             * @param sprite The target sprite.
             * @param localX The local x coordinate of the handle in the sprite's local space. 
             * @param localY The local y coordinate of the handle in the sprite's local space. 
             * @param out The output matrix. Can be null, if null is passed in, a temporary matrix will be used.
             * @return The output matrix.
             */
            function getWorldMatrix(sprite: Laya.Node, localX?: number, localY?: number, out?: Laya.Matrix): Laya.Matrix;
        }

        /** Built-in transform tool displayed for the current scene selection. */
        export enum TransformCtrlMode {
            /** Translation controls. */
            Move,
            /** Rotation controls. */
            Rotate,
            /** Scale controls. */
            Scale,
            /** Combined translation, rotation and scale controls. */
            Transform,
        }

        /** Coordinate space used by transform controls. */
        export enum TransformSpaceMode {
            /** Orient controls in the selected object's local space. */
            Local,
            /** Orient controls in world space. */
            World
        }

        /** Constraint used while moving transform controls. */
        export enum TransformMoveMode {
            /** Move along the active view or axis plane. */
            Plane,
            /** Snap movement to a picked world position. */
            WorldPos
        }

        /** Mutable snapping state of the built-in move control. */
        export interface IMoveCtrl {
            /** Current movement constraint. */
            moveMode: TransformMoveMode;
            /** Whether the selected object's mesh position participates in snapping. */
            selectMeshPos: boolean;
            /** Whether a target mesh position is used for snapping. */
            targetMeshPos: boolean;
        }

        /** Scene-process manager for transform controls, custom gizmos and interactive handles. */
        export interface IGizmosManager {
            /** Scale multiplier applied to scene gizmo icons. */
            iconScale: number;
            /** Whether scene gizmo icons are visible. */
            showIcon: boolean;
            /** Whether the built-in transform controls are visible. The misspelling is retained for API compatibility. */
            showTranformTools: boolean;

            /** Index of the hovered or active handle, or `-1` when no handle is active. */
            get activeHandle(): number;
            /** Mutable state of the built-in move control. */
            get moveCtrl(): IMoveCtrl;
            /** Active transform control mode. */
            transformCtrlMode: TransformCtrlMode;
            /** Active local/world coordinate-space mode. */
            spaceMode: TransformSpaceMode;

            /** Switch built-in controls between 2D and 3D behavior. */
            setMode2d(is2d: boolean): void;

            /** Get a cached 3D mesh used to draw a standard gizmo shape. */
            getMesh(type: GizmoMeshKey): Laya.Mesh;
            /** Get a cached 2D mesh used to draw a standard gizmo shape. */
            getMesh2D(type: GizmoMeshKey): Laya.Mesh2D;

            /** Instantiate and register a gizmo, forwarding arguments to its `create` method. */
            addGizmo<T extends GizmoBase>(gizmoClass: new () => T, ...args: Parameters<T['create']>): T;
            /** Register a handle class or instance and execute it with the supplied arguments. */
            addHandle<T extends HandleBase>(handleClass: (new () => T) | T, ...args: Parameters<T['execute']>): T;
            /** Pick a gizmo node at screen coordinates, or return `null` when nothing is hit. */
            pickGizmo(x: number, y: number): Laya.Node | null;
            /** Append selectable scene nodes inside a screen-selection frustum to `result`. */
            getSprite3DsInRect(frustum: Laya.BoundFrustum, result: Laya.Node[]): void;
        }

        /** Identifier of a cached primitive mesh supplied for 3D gizmo drawing. */
        export type GizmoMeshKey = "quad" | "cube" | "sphere" | "cone" | "plane";

        /** Immediate-mode drawing and editing API for custom 3D scene gizmos. */
        export interface IGizmos3D {

            /** The graphics object currently being edited in either the 2D or 3D scene. */
            readonly editingGraphics: Readonly<IGraphicsEditingInfo>;

            /**
             * Switches the single graphics object being edited by scene gizmos.
             * @param node Graphics owner node. Pass `null` to leave graphics-editing mode.
             * @param comp Optional component that owns the edited property.
             * @param propPath Optional data path of the edited property.
             * @param hideStageGrid Whether to hide the stage grid while editing. Default is false.
             */
            switchEditingGraphics(node: Laya.Node | null, comp?: Laya.Component, propPath?: ReadonlyArray<string>, hideStageGrid?: boolean): void;

            /**
             * Get a built-in mesh for gizmos.
             * @param type The type of the mesh.
             * @returns The mesh of the specified type.
             */
            getMesh(type: GizmoMeshKey): Laya.Mesh;


            /**
             * Draw line.
             * @param start Start point.
             * @param end End point.
             * @param color The line color. Default is white.
             * @param color2 The line end color. If not set, the start color will be used.
             * @param pickable Whether the line is pickable. Default is false.
             */
            drawLine(start: Laya.Vector3, end: Laya.Vector3, color?: Laya.Color, color2?: Laya.Color, pickable?: boolean): void;

            /**
             * Draw dotted line.
             * @param start Start point. 
             * @param end End point.
             * @param color The line color. Default is white. 
             */
            drawDottedLine(start: Laya.Vector3, end: Laya.Vector3, color?: Laya.Color): void;

            /**
             * Draw arc line.
             * @param start Start point. 
             * @param end End point. 
             * @param height The height of the arc. 
             * @param startAllow Whether to allow drawing the start point.
             * @param endAllow Whether to allow drawing the end point.
             * @param color The line color. Default is white. 
             */
            drawArcLine(start: Laya.Vector3, end: Laya.Vector3, height: number, startAllow: boolean, endAllow: boolean, color?: Laya.Color): void;

            /**
             * Draw a wire box.
             * @param center The center of the box.
             * @param size The size of the box.
             * @param color The line color. Default is white.
             * @param rotation The rotation of the box. Default is identity.
             */
            drawWireBox(center: Laya.Vector3, size: Laya.Vector3, color?: Laya.Color, rotation?: Laya.Quaternion): void;

            /**
             * Draw a wire cone.
             * @param rotation The rotation of the cone.
             * @param topPosition The top position of the cone. 
             * @param angle The angle of the cone in degrees. 
             * @param range The range of the cone. 
             * @param color The line color. Default is white. 
             */
            drawWireCone(rotation: Laya.Quaternion, topPosition: Laya.Vector3, angle: number, range: number, color?: Laya.Color): void;

            /**
             * Draw a wire capsule. 
             * @param center The center of the capsule. 
             * @param radius The radius of the capsule. 
             * @param height The height of the capsule. 
             * @param color The line color. Default is white.
             * @param rotation The rotation of the capsule. Default is identity.
             */
            drawWireCapsule(center: Laya.Vector3, radius: number, height: number, color?: Laya.Color, rotation?: Laya.Quaternion): void;

            /**
             * Draw wire sphere.
             * @param center The center of the sphere.
             * @param radius The radius of the sphere.
             * @param color The line color. Default is white.
             */
            drawWireSphere(center: Laya.Vector3, radius: number, color?: Laya.Color): void;

            /**
             * Draw a wire hemisphere.
             * @param center The center of the hemisphere. 
             * @param radius The radius of the hemisphere. 
             * @param color The line color. Default is white.
             * @param rotation The rotation of the hemisphere. Default is identity.
             */
            drawWireHemiSphere(center: Laya.Vector3, radius: number, color?: Laya.Color, rotation?: Laya.Quaternion): void;

            /**
             * Draw a wire cylinder.
             * @param center The center of the cylinder. 
             * @param upRadius The radius of the top of the cylinder. 
             * @param downRadius The radius of the bottom of the cylinder. 
             * @param height The height of the cylinder. 
             * @param color The line color. Default is white.
             * @param rotation The rotation of the cylinder. Default is identity.
             * @param scale The scale of the cylinder. Default is (1,1,1).
             */
            drawWireCylinder(center: Laya.Vector3, upRadius: number, downRadius: number, height: number, color?: Laya.Color, rotation?: Laya.Quaternion, scale?: Laya.Vector3): void;

            /**
             * Draw a wire plane. 
             * @param center The center of the plane. 
             * @param width The width of the plane. 
             * @param height The height of the plane.
             * @param color The line color. Default is white. 
             * @param spread The spread angle of the plane in degrees. Default is 0, which means no spread. 
             * @param rotation The rotation of the plane. 
             */
            drawWirePlane(center: Laya.Vector3, width: number, height: number, color?: Laya.Color, spread?: number, rotation?: Laya.Quaternion): void;

            /**
             * Draw a wire circle or arc. 
             * @param center The center of the circle. 
             * @param radius The radius of the circle. 
             * @param rotation The rotation of the circle. 
             * @param color The line color. Default is white. 
             * @param angle The angle of the circle in degrees. Default is 360, which means a full circle. 
             */
            drawWireCircle(center: Laya.Vector3, radius: number, rotation?: Laya.Quaternion, color?: Laya.Color, angle?: number): void;

            /**
             * Draw a wire ellipse.
             * @param center The center of the ellipse.
             * @param width The width of the ellipse.
             * @param height The height of the ellipse.
             * @param color The line color. Default is white.
             * @param spread The spread angle of the ellipse in degrees. Default is 0, which means no spread.
             * @param rotation The rotation of the ellipse.
             */
            drawWireEllipse(center: Laya.Vector3, width: number, height: number, color?: Laya.Color, spread?: number, rotation?: Laya.Quaternion): void;

            /**
             * Draw a bound frustum.
             * @param frustum The bound frustum.
             * @param color The line color. Default is white.
             */
            drawBoundFrustum(frustum: Laya.BoundFrustum, color?: Laya.Color): void;

            /**
             * Draw a bound box.
             * @param bBox The bound box. 
             * @param color The line color. Default is white. 
             */
            drawBoundBox(bBox: Laya.BoundBox, color?: Laya.Color): void;

            /**
             * Draw Mesh.
             * @param mesh A Mesh object or a URL string to a mesh asset.
             * @param subMeshIndex Sub mesh index, -1 means draw all sub meshes.
             * @param position The position. Default is (0,0,0).
             * @param rotation The rotation. Default is identity.
             * @param scale The scale. Accepts a Vector3 or a uniform number. Default is (1,1,1).
             * @param color The color. Default is white.
             */
            drawMesh(mesh: Laya.Mesh | string, subMeshIndex: number, position?: Laya.Vector3, rotation?: Laya.Quaternion, scale?: Laya.Vector3 | number, color?: Laya.Color): void;

            /**
             * Draw Mesh Line.
             * @param mesh A Mesh object or a URL string to a mesh asset.
             * @param subMeshIndex Sub mesh index, -1 means draw all sub meshes.
             * @param position The position. Default is (0,0,0).
             * @param rotation The rotation. Default is identity.
             * @param scale The scale. Accepts a Vector3 or a uniform number. Default is (1,1,1).
             * @param color The color. Default is white.
             */
            drawMeshLine(mesh: Laya.Mesh | string, subMeshIndex: number, position?: Laya.Vector3, rotation?: Laya.Quaternion, scale?: Laya.Vector3 | number, color?: Laya.Color): void;

            /**
             * Draw billboard.
             * @param position Position.
             * @param size Size of the billboard.
             * @param color The color of billboard. Default is white.
             */
            drawBillboard(position: Laya.Vector3, size: number, color?: Laya.Color): void;

            /**
             * Draw icon.
             * @param position Position.
             * @param url Icon URL.
             * @param color The color of icon. Default is white.
             */
            drawIcon(position: Laya.Vector3, url: string, color?: Laya.Color): void;

            /**
             * Draw text.
             * @param position Text position.
             * @param text The text content.
             * @param color The text color. Default is white.
             * @param fontSize The font size in screen pixels. Default is 16.
             * @param scaleX Text X-axis display scale multiplier. Default is 1.0.
             * @param scaleY Text Y-axis display scale multiplier. Default is 1.0.
             * @param fontWeight Font weight. Default is "normal". Accepts "normal", "bold", "bolder", "lighter", or numeric strings like "100", "200", etc.
             * @param fontFamily Font family. Default is "Arial". Accepts values like "Arial", "Times New Roman", etc.
             */
            drawText(position: Laya.Vector3, text: string, color?: Laya.Color, fontSize?: number, scaleX?: number, scaleY?: number, fontWeight?: string, fontFamily?: string): void;

            /**
             * Draw a renderer with a material. If the material is not provided, the renderer's shared material will be used.
             * @param renderer The renderer to draw.
             * @param material The material to use. If not provided, the renderer's shared material will be used.
             */
            drawRender(renderer: Laya.BaseRender, material?: Laya.Material): void;

            /**
             * Draw a rectangle in 3D space. The rectangle is drawn on a plane parallel to the camera's near plane, with the center at (x, y) and the specified width and height.
             * @param x The x-coordinate of the top-left corner of the rectangle in screen pixels.
             * @param y The y-coordinate of the top-left corner of the rectangle in screen pixels.
             * @param width The width of the rectangle. 
             * @param height The height of the rectangle. 
             * @param fillColor The fill color of the rectangle. Default is white. 
             * @param lineWidth The width of the rectangle's outline. Default is 0, which means no outline. 
             * @param lineColor The color of the rectangle's outline. Default is black. 
             */
            drawRect(x: number, y: number, width: number, height: number, fillColor?: Laya.Color, lineWidth?: number, lineColor?: Laya.Color): void;

            /**
             * Draw a 3D curve path.
             * @param worldMatrix The world transform matrix of the path.
             * @param points The path points.
             * @param lineColor The line color. Default is white.
             * @param localOffset An optional local offset applied to all points.
             */
            drawCurvePath3D(worldMatrix: Laya.Matrix4x4, points: ReadonlyArray<Laya.PathPoint>, lineColor?: Laya.Color, localOffset?: Laya.Vector3): void;

            /**
             * Draw a custom gizmo.
             * @param gizmoClass The class of the gizmo, which must extend from Gizmo and implement the create method.
             * @param args The arguments for initializing the gizmo, which will be passed to the create method of the gizmo.
             */
            drawGizmo<T extends GizmoBase>(gizmoClass: new () => T, ...args: Parameters<T['create']>): T;
        }

        /** Identifier of a cached primitive mesh supplied for 2D gizmo drawing. */
        export type Gizmo2DMeshKey = "quad";

        /** Identifies the single node property currently being edited by scene gizmos. */
        export interface IGraphicsEditingInfo {
            /** Node that owns the edited graphics, or `null` when graphics editing is inactive. */
            node: Laya.Node | null;
            /** Component that owns the property, or `null` when the property is on the node or editing is inactive. */
            comp: Laya.Component | null;
            /** Data path of the edited property. */
            readonly propPath: Array<string>;
        }

        /** Immediate-mode drawing and editing API for custom 2D scene gizmos. */
        export interface IGizmos2D {
            /**
             * There can only be one graphic being edited in the scene at a time. Use `switchEditingGraphics` to switch the editing graphic.
             */
            readonly editingGraphics: Readonly<IGraphicsEditingInfo>;

            /**
             * Suggested color for line drawing in 2D gizmos.
             */
            readonly lineColor: Laya.Color;

            /**
             * Get a built-in mesh for gizmos.
             * @param type The type of the mesh.
             * @returns The mesh of the specified type.
             */
            getMesh(type: Gizmo2DMeshKey): Laya.Mesh2D;

            /**
             * @deprecated Do not use vector graphics in 2D gizmos anymore.
             * @param node The node.
             * @returns The gizmos manager.
             */
            getManager(node: Laya.Node): ISVGGizmos;

            /**
             * There can only be one graphic being edited in the scene at a time, so use this function to switch the editing graphic.
             * @param node Graphics owner node. Pass `null` to leave graphics-editing mode.
             * @param comp Graphics owner component. Can be null.
             * @param propPath Property path of the graphics. Can be null. 
             * @param hideStageGrid Whether to hide the stage grid while editing. Default is false.
             */
            switchEditingGraphics(node: Laya.Node | null, comp?: Laya.Component, propPath?: ReadonlyArray<string>, hideStageGrid?: boolean): void;

            /**
             * Draw mesh.
             * @param matrix The matrix to transform the mesh.
             * @param mesh The mesh to draw.
             * @param texture The texture of the mesh. Default is a white texture.
             * @param scale The scale of the mesh. If not set, the size of the texture will be used.
             * @param color The color of the mesh. Default is white.
             * @param tillingOffset The tilling and offset of the texture. Default is (0,0,1,1).
             * @param material The material of the mesh. Default is a built-in material.
             * @param screenSpace If true, the scale is in screen pixels, unaffected by the matrix's scale. Default is false.
             */
            drawMesh(matrix: Laya.Matrix, mesh: string | Laya.Mesh2D, texture?: string | Laya.BaseTexture, scale?: Laya.Vector2, color?: Laya.Color, tillingOffset?: Laya.Vector4, material?: Laya.Material, screenSpace?: boolean): void;

            /**
             * Draw lines.
             * @param matrix The matrix to transform the lines.
             * @param points Line points; every 4 numbers represent one line (x1,y1,x2,y2).
             * @param color The color of the lines. Default is white.
             * @param lineWidth The pixel width of the lines. Default is 3.
             * @param screenSpace If true, the lineWidth is in screen pixels, unaffected by the matrix's scale. Default is true.
             */
            drawLines(matrix: Laya.Matrix, points: number[], color?: Laya.Color, lineWidth?: number, screenSpace?: boolean): void;

            /**
             * Draw icon at given matrix.
             * @param matrix The matrix to transform the icon.
             * @param iconUrl Icon url 
             * @param width The width of the quad. If not set, the width of the texture will be used. 
             * @param height The height of the quad. If not set, the height of the texture will be used.
             * @param color The color of the icon. Default is white. 
             */
            drawIcon(matrix: Laya.Matrix, iconUrl: string, width?: number, height?: number, color?: Laya.Color): void;

            /**
             * Draw rectangle at given matrix.
             * @param matrix The matrix to transform the rectangle.
             * @param width The width of the rectangle.
             * @param height The height of the rectangle.
             * @param color The color of the rectangle. Default is white.
             * @param lineWidth The pixel width of the rectangle border. Default is 0.
             * @param lineColor The color of the rectangle border. Default is black.
             * @param screenSpace If true, the width, height are in screen pixels, unaffected by the matrix's scale. Default is false.
             */
            drawRect(matrix: Laya.Matrix, width: number, height: number, color?: Laya.Color, lineWidth?: number, lineColor?: Laya.Color, screenSpace?: boolean): void;

            /**
             * Draw circle at given matrix.
             * @param matrix The matrix to transform the circle.
             * @param radius The radius of the circle.
             * @param color The color of the circle. Default is white.
             * @param lineWidth The pixel width of the circle border. Default is 0.
             * @param lineColor The color of the circle border. Default is black.
             * @param screenSpace If true, the radius is in screen pixels, unaffected by the matrix's scale. Default is false.
             */
            drawCircle(matrix: Laya.Matrix, radius: number, color?: Laya.Color, lineWidth?: number, lineColor?: Laya.Color, screenSpace?: boolean): void;

            /**
             * Draw ellipse at given matrix.
             * @param matrix The matrix to transform the ellipse.
             * @param radiusX The radius of the ellipse on x axis.
             * @param radiusY The radius of the ellipse on y axis.
             * @param color The color of the ellipse. Default is white.
             * @param lineWidth The pixel width of the ellipse border. Default is 0.
             * @param lineColor The color of the ellipse border. Default is black.
             * @param screenSpace If true, the radiusX, radiusY is in screen pixels, unaffected by the matrix's scale. Default is false.
             */
            drawEllipse(matrix: Laya.Matrix, radiusX: number, radiusY: number, color?: Laya.Color, lineWidth?: number, lineColor?: Laya.Color, screenSpace?: boolean): void;

            /**
             * Draw sector (fan shape) at given matrix.
             * @param matrix The matrix to transform the sector.
             * @param radius The radius of the sector.
             * @param startAngle The start angle of the sector in radians.
             * @param endAngle The end angle of the sector in radians.
             * @param color The fill color of the sector. Default is white.
             * @param lineWidth The pixel width of the sector border. Default is 0.
             * @param lineColor The color of the sector border. Default is black.
             * @param drawRadius If true, draw the two radius lines from center to arc endpoints. Default is false.
             * @param screenSpace If true, the radius is in screen pixels, unaffected by the matrix's scale. Default is false.
             */
            drawSector(matrix: Laya.Matrix, radius: number, startAngle: number, endAngle: number, color?: Laya.Color, lineWidth?: number, lineColor?: Laya.Color, drawRadius?: boolean, screenSpace?: boolean): void;

            /**
             * Draw path at given matrix.
             * @param matrix The matrix to transform the path.
             * @param x The x position of the path in local coordinates.
             * @param y The y position of the path in local coordinates.
             * @param points Path points formatted as [x1,y1,x2,y2,...].
             * @param closed If true, a line will be drawn between the last point and the first point. Default is false.
             * @param lineWidth The pixel width of the path. Default is 1.
             * @param lineColor The color of the path. Default is white.
             */
            drawPath(matrix: Laya.Matrix, x: number, y: number, points: ReadonlyArray<number>, closed?: boolean, lineWidth?: number, lineColor?: Laya.Color): void;

            /**
             * Draw curve path at given matrix.
             * @param matrix The matrix to transform the path.
             * @param x The x position of the path in local coordinates.
             * @param y The y position of the path in local coordinates.
             * @param points The path points.
             * @param lineWidth The pixel width of the path. Default is 1.
             * @param lineColor The color of the path. Default is white.
             */
            drawCurvePath(matrix: Laya.Matrix, x: number, y: number, points: ReadonlyArray<Laya.PathPoint>, lineWidth?: number, lineColor?: Laya.Color): void;

            /**
             * Draw polygon at given matrix.
             * @param matrix The matrix to transform the polygon.
             * @param x The x position of the polygon in local coordinates.
             * @param y The y position of the polygon in local coordinates.
             * @param points Polygon points; every 2 numbers represent one point (x,y).
             * @param color The fill color of the polygon. Default is white.
             * @param lineWidth The pixel width of the polygon border. Default is 1.
             * @param lineColor The color of the polygon border. Default is white.
             */
            drawPolygon(matrix: Laya.Matrix, x: number, y: number, points: number[], color?: Laya.Color, lineWidth?: number, lineColor?: Laya.Color): void;
        }

        /** Live 2D/3D engine scene exposed to Scene-process plugins. */
        export interface IGameScene extends IMyScene {
            /** Complete current selection in selection order. */
            readonly selection: ReadonlyArray<Laya.Node>;
            /** Weak node lookup indexed by editor node ID. */
            readonly allNodes: Map<string, WeakRef<Laya.Node>>;
            /** Selected nodes whose ancestors are not also selected. */
            readonly topLevelSelection: ReadonlyArray<Laya.Node>;

            /**
             * All nodes in the scene that have the onDrawGizmos method.
             */
            readonly nodesSet_gizmo: Set<Laya.Node>;

            /**
             * All camera nodes in the scene.
             */
            readonly nodesSet_cameras: Set<Laya.Camera>;

            /** Editor-owned root for 2D content. */
            readonly rootNode2D: Laya.Scene;
            /** Editor-owned root for 3D content. */
            readonly rootNode3D: Laya.Scene3D;
            /** Active engine 3D scene. */
            readonly scene3D: Laya.Scene3D;
            /** Bridge that displays 3D content inside a 2D scene. */
            readonly bridge3DSprite: Laya.Bridge3DSprite;
            /** Root of the prefab currently being edited. */
            readonly prefabRootNode: Laya.Sprite | Laya.Sprite3D | null;

            /** Nested box-editing chain from outermost to innermost. */
            readonly openedBoxChain: ReadonlyArray<Laya.Sprite>;
            /** Innermost box currently opened for isolated editing. */
            readonly openedBox: Laya.Sprite | null;

            /** Get a live scene node by ID, or null if it is missing or has been destroyed. */
            getNodeById(id: string): Laya.Node | null;
            /** Mark the live scene dirty so the editor schedules refresh and persistence work. */
            setDirty(): void;
        }

        /** Options controlling GUI-widget serialization. */
        export interface IGUIPrefabWriterOptions {
            /** Convert a referenced widget into its serialized reference value. */
            getNodeRef?: (node: gui.Widget) => string | string[];
            /** Omit the standard prefab/scene header from the returned data. */
            noHeader?: boolean;
            /** Apply prefab-creation serialization rules. */
            creatingPrefab?: boolean;
            /** Serialize only `node`, without its child hierarchy. */
            ignoreChildren?: boolean;
        }

        /** GUI-prefab serialization helpers for the Scene process. */
        export namespace IGUIPrefabWriter {
            /** Serialize a widget hierarchy into editor prefab data. */
            function write(node: gui.Widget, options?: IGUIPrefabWriterOptions): any;
            /** Collect resource references used by a widget hierarchy into `out` or a new set. */
            function collectResources(node: gui.Widget, out?: Set<any>): Set<any>;
        }

        /** Bitmask describing which extension inputs triggered a hot reload. */
        export enum ReloadReason {
            /** User TypeScript/JavaScript code changed. */
            Code = 1,
            /** A configured script bundle changed. */
            ScriptBundles = 2,
            /** A JavaScript plugin changed. */
            JsPlugins = 4,
            /** Blueprint assets changed. */
            Blueprints = 8,
        }

        /** Metadata and runtime state of one JavaScript plugin asset. */
        export interface IJsPluginInfo {
            /**
             * The asset info of the js plugin.
             */
            asset: IAssetInfo;
            /**
             * The type of the js plugin.
             * 0 - Runtime only
             * 1 - Editor extension only
             * 2 - Both runtime and editor extension
             */
            type: number;
            /**
             * Whether to allow loading in editor environment. Only applies to runtime js plugins. Default is false.
             */
            allowLoadInEditor: boolean;
            /**
             * Whether to allow loading in runtime environment. Only applies to runtime js plugins. Default is true.
             */
            allowLoadInRuntime: boolean;
            /**
             * Whether to auto load the js plugin. Only meansful when allowLoadInRuntime is true. Default is true.
             */
            autoLoad: boolean;
            /**
             * Whether to preserve the asset path when publishing instead of placing the plugin in the default script directory. Default is false.
             */
            preservePath: boolean;
            /**
             * Whether to minify the js plugin on publish. Only applies to runtime js plugins. Default is false.
             */
            minifyOnPublish: boolean;
            /**
             * Whether to keep class and function names when minifying.
             */
            keepNames: boolean;
            /**
             * Whether to keep unused functions and variables when minifying.
             */
            keepUnused: boolean;
            /**
             * References to other js plugins.
             */
            references: string[];
            /**
             * The limited platforms for the js plugin. Empty means all platforms.
             */
            limitedPlatforms: string[];
        }

        /** Loads extension code, resolves registered functions and coordinates hot reload. */
        export interface IExtensionManager {
            /**
             * Whether a reload is in progress.
             */
            readonly loading: boolean;

            /**
             * Whether a reload of packages is in progress.
             * 
             * When a hot reload occurs, there are two modes:
             * 1. Reload all packages (`loadingPackages=true`) and reload user scripts (`loadingPackages=false`).
             * 2. Only reload user scripts (`loadingPackages=false`).
             */
            readonly loadingPackages: boolean;

            /**
             * Find a function by name. The name is in the form of "className.staticMethodName".
             * A className must be registered with ＠IEditorEnv.regClass.
             * @param name objectName.methodName
             * @returns The function found. Null if not found.
             */
            findFunction(name: string): Function | null;

            /**
             * Get all js plugins.
             * @returns A map of all js plugins.
             */
            getJsPlugins(): ReadonlyMap<string, Readonly<IJsPluginInfo>>;

            /**
             * Get bundle names of the packages.
             * @returns An array of bundle names.
             */
            getPackageBundles(): ReadonlyArray<string>;
            /**
             * Issue a reload request.
             * @param reason The reason of the reload.
             * @see ReloadReason
             */
            reload(reason: number): void;

            /**
             * If there is an ongoing reload task, wait for the reload task to complete.
             */
            flushScriptChanges(): Promise<void>;
        }

        export type IFileContent = {
            /**
             * If set, the file name will have its extension removed and the nameSuffix appended to the file name upon output.
             * For example: if the file name is "test.png" and the nameSuffix is "@0.ktx", the output file name will be "test@0.ktx".
             */
            nameSuffix?: string;

            /**
             * A positive number used to calculate the progress of the output process. The higher the value, the more time the importer takes. Default is 1.
             */
            weight?: number;

            /**
             * How many tasks can be executed in parallel. Default is 100.
             */
            numParallelTasks?: number;

            /**
             * Called when the file is being written. Return that actual file content.
             * @param owner Current asset export info.
             * @param data Custom data. 
             * @returns The actual file content. 
             */
            transformer?: (owner: IAssetExportInfo, data: any) => IFileContent;
        } & ({
            type: "text";
            data: string;
        } | {
            type: "json";
            data: any;
        } | {
            type: "xml";
            data: gui.XML | XMLDocument;
        } | {
            type: "arraybuffer";
            data: ArrayBuffer;
        } | {
            type: "bytes";
            data: Uint8Array;
        } | {
            type: "filePath";
            /**
             * Absolute path of the file.
             */
            data: string;
        } | {
            type: "autoAtlas";
            data: IAutoAtlasInfo;
        } | {
            type: "custom";
            /**
             * Custom data to transfer to the transformer as the second parameter.
             */
            data?: any;
        });

        export enum AssetExportConfigType {
            Texture = 0,
            Atlas = 1,
            Shader = 2,
            /** @deprecated */
            RenderTexture = 3,
            PreloadedData = 3,
            URLMapping = 4,
        }

        export interface IAssetLinkInfo {
            /**
             * Plain object that contains the property.
             */
            obj: any;

            /**
             * The property name.
             */
            prop: string;

            /**
             * The value here can be a UUID, "res://uuid", or a path. If it is a path, when absolutePath is true, the path is relative to the assets folder; when false, it is relative to the referencing asset;
             */
            url: string;

            /**
             * If url is a path, this flag indicates whether the path is absolute. When true, the path is relative to the assets folder; when false, it is relative to the referencing asset.
             * 
             * This option also affects the output path, whether the URL is a UUID or a path. If true, the output path is the relative path to the web root; if false, the output path is relative to the referencing asset.
             * 
             * Default is false.
             */
            absolutePath?: boolean;
        }

        export interface IAssetExportDepInfo {
            /**
             * Referenced asset.
             */
            target: IAssetInfo;

            /**
             * Plain object that contains the property.
             */
            data: any;

            /**
             * The property name.
             */
            key: string;

            /**
             * If true, the output path is the relative path to the web root; if false, the output path is relative to the referencing asset.
             */
            absolutePath?: boolean;
        }

        export interface IAssetExportInfo {
            /**
             * Owner asset.
             */
            asset: IAssetInfo;

            /**
             * File contents.
             */
            contents: Array<IFileContent>;

            /**
             * Output path.
             */
            outPath: string;

            /**
             * Dependencies.
             */
            deps?: Array<IAssetExportDepInfo>;

            /**
             * Broken links found during the export process.
             */
            brokenLinks?: Array<IAssetLinkInfo>;

            /**
             * Configuration. e.g. Texture export configuration.
             */
            config?: Record<string, any>;
        }

        export interface IAutoAtlasConfig {
            /**
             * Image asset references excluded from this automatic atlas configuration.
             */
            excludedImages?: Array<string>;

            /**
             * Whether to trim the blank area of the image.
             */
            trimImage: boolean;

            /**
             * Maximum width of the atlas. e.g. 2048.
             */
            maxWidth: number;

            /**
             * Maximum height of the atlas. e.g. 2048.
             */
            maxHeight: number;

            /**
             * Padding between images. e.g. 2.
             */
            padding: number;

            /**
             * Whether to use the power of two size.
             */
            pot: boolean;

            /**
             * Scale of the image.
             */
            scale: number;

            /**
             * 0: nearest, 1: linear, 2: cubic
             */
            filterMode: number;
        }

        export interface ITextureInAutoAtlasInfo {
            /**
             * Image asset.
             */
            asset: IAssetInfo;

            /**
             * Metadata of the image.
             */
            meta: sharp.Metadata;

            /**
             * Texture configuration.
             */
            config: any;

            /**
             * The frame key name will be used in description file.
             */
            frameKey: string;
        }

        export interface IAutoAtlasInfo {
            /**
             * Name of the auto atlas. It will use as the file name.
             */
            name: string;

            /**
             * Sub-folder name. If it is not empty, images are placed in this folder.
             */
            prefix: string;

            /**
             * Configuration of the auto atlas.
             */
            config: IAutoAtlasConfig;

            /**
             * All textures to be packed.
             */
            textures: Array<ITextureInAutoAtlasInfo>;
        }

        export interface ISubpackageInfo {
            /**
             * Path of the subpackage. e.g. "subpackage".
             */
            path: string;

            /**
             * A script bundle definition asset. If provided, the compiled JS file of this script bundle will be used as the entry file of the subpackage.
             */
            mainScript?: IAssetInfo;

            /**
             * Whether it is a remote package.
             */
            remote?: boolean;

            /**
             * If remote is true, the remote address of the subpackage.
             */
            remoteUrl?: string;

            /**
             * Whether to load the subpackage on startup.
             */
            autoLoad?: boolean;

            /**
             * If true, add all assets in the specified folder to this subpackage.
             */
            packAllAssets?: boolean;

            /**
             * Output paths of JavaScript plugins that should be loaded by the subpackage entry.
             * This list is populated during the build in plugin load order.
             */
            autoLoadPlugins?: Array<string>;
        }

        export interface IExportAssetToolOptions {
            /**
             * If provided, all output paths will have this prefix added.
             * 
             * For example, if baseUrl="http://example.com" and an asset's export path is "test.json", the asset reference address in the file will become "http://example.com/test.json".
             */
            baseUrl?: string;

            /**
             * The texture may be configured to apply compression formats required by various platforms. 
             * Here you need to configure which platforms need to be supported for this build, 
             * so that the corresponding formats can be packaged. Default is all platforms.
             */
            runtimePlatforms?: RuntimePlatformType[];

            /**
             * If false, even if the texture is configured to use a compressed format on a certain platform, it will not be used and the original format will be used instead.
             * Default is true.
             */
            allowTextureCompressedFormat?: boolean;

            /**
             * If true, the original texture file will be kept in the release folder. 
             * For example, If a.png is compressed to a.ktx, then both a.png and a.ktx will be present in the release folder. The benefit of this is that if a certain runtime platform does not support the ktx format, it can fall back to using the png format.
             * Default is false.
             */
            keepTextureSourceFile?: boolean;

            /**
             * Some file extensions cannot be used due to restrictions of mini-game platforms or servers. 
             * In this case, you can enable a mapping table to map the original extensions to new extensions.
             * Default is false.
             */
            useSafeFileExtensions?: boolean;

            /**
             * Whether to export the auto atlas. Default is true.
             */
            exportAutoAtlas?: boolean;

            /**
             * All subpackages.
             */
            subpackages?: Array<ISubpackageInfo>;

            /**
             * By default, the class id of the script bundle is the compressed version of the asset id. You can provide a custom transformer to change the class id.
             */
            classIdTransformer?: IClassIdTransformer;

            /**
             * Overide the default exporter of certain assets.
             */
            customAssetExporters?: Map<IAssetInfo, new () => IAssetExporter>;

            /**
             * A logger for writing logs.
             */
            logger?: ILogger;

            /**
             * If true, indicates that the export process is part of a build.
             */
            isBuilding?: boolean;
        }

        export interface IOutFileInfo {
            /**
             * Owner asset.
             */
            asset?: IAssetInfo;

            /**
             * A path relative to the output base path. If provided, it will override the default output path.
             */
            filePath?: string;

            /**
             * Explicitly provide the file extension.
             * 
             * For example, "abc.shader.json", the value here is "shader.json" to avoid misunderstanding it as "json". If there are no special cases, ext is empty.
             */
            ext?: string;

            /**
             * Configuration. If provided, it will be written to fileconfig.json.
             */
            config?: any;

            /**
             * If true, no real file in filesystem of this item.
             * 
             * For example, if an abc.png is output with compression format, the `noFile` of the corresponding IOutFileInfo for abc.png will be true, and the real file will be through another IOutFileInfo corresponding to abc.ktx.
             */
            noFile?: boolean;

            /**
             * If true, forbid to generate and use hash for this file even if version management is enabled.
             */
            noHash?: boolean;

            /**
             * This field will be filled with the hash value of the file by the version manager.
             */
            hash?: string;

            /**
             * If this is a JS file, this field indicates whether it needs to be minified.
             */
            minify?: boolean;

            /**
             * When minify is true, whether to keep the class names and function names during compression. Default is false.
             */
            keepNamesOnMinify?: boolean;

            /**
             * When minify is true, whether to keep unreferenced functions and variables. Default is false.
             */
            keepUnusedOnMinify?: boolean;
        }

        export interface IExportAssetTool {
            /**
             * Some file extensions cannot be used due to restrictions of mini-game platforms or servers. 
             * Here you can set up a mapping table to map the original extensions to new extensions.
             * @example
             * ```
             * tool.fileExtensionOverrides["abc"] = "abc.json";
             * ```
             */
            readonly fileExtensionOverrides: Record<string, string>;

            /**
             * Set the assets to be exported.
             * @param assets The assets to be exported.
             * @param progressCallback The callback function that is called when the progress of the export process changes. The value is between 0 and 1.
             * @param abortToken The token that can be used to cancel the export process.
             */
            setAssets(assets: Iterable<IAssetInfo>, progressCallback?: (value: number) => void, abortToken?: IAbortToken): Promise<void>;

            /**
             * Get the export information of the assets.
             * @returns A map of the export information of the assets. The key is the asset.
             */
            get items(): Map<IAssetInfo, IAssetExportInfo>;

            /**
             * Get the broken links found during the export process.
             * @return A map where the key is the missing asset URL and the value is a set of assets that reference the missing asset.
             */
            getBrokenLinks(): Map<string, Set<IAssetInfo>>;

            /**
             * Get conflicts found while generating asset output paths.
             * The map key is the conflicting output file path, and the value contains the different source file paths mapped to it.
             */
            getOutputPathConflicts(): ReadonlyMap<string, ReadonlySet<string>>;

            /**
             * Generate the output path of the asset.
             * @param asset The asset to generate the output path for.
             * @returns The output path of the asset.
             */
            generateAssetOutputPath(asset: IAssetInfo): string;

            /**
             * Write the output files to the specified folder.
             * @param outputPath The output folder.
             * @param outFiles Receive the out files information if provided.
             * @param progressCallback The callback function that is called when the progress of the export process changes. The value is between 0 and 1.
             * @param abortToken The token that can be used to cancel the export process.
             */
            write(outputPath: string, outFiles?: Map<string, IOutFileInfo>, progressCallback?: (value: number) => void, abortToken?: IAbortToken): Promise<void>;
        }


        export interface IEngineLib {
            /**
             * The name of the engine library. It should be unique.
             */
            name: string;
            /**
             * The caption of the engine library.
             */
            caption: string;
            /**
             * The description of the engine library.
             */
            tips: string;
            /**
             * The catalog of the engine library.
             */
            catalog: string;
            /**
             * The files of the engine library, including the js files and the wasm files.
             */
            files: string[];
            /**
             * The worker files of the engine library, empty if there is no worker files.
             */
            workerFiles: string[];
            /**
             * The debugger files of the engine library, empty if there is no debugger files.
             */
            debuggerFiles: string[];
            /**
             * Whether this library should be loaded in the editor on startup.
             */
            runInEditor: boolean;
            /**
             * Whether this library should be shown in the modules section of the Project Settings. Default is true.
             */
            visible: boolean;
            /**
             * The key to store the selected addon in the data. Default is the name of the library.
             */
            settingsKey: string;
            /**
             * The default addon name of the engine library.
             */
            defaultAddon: string;
            /**
             * All the addons of the engine library. Null if no addons.
             */
            addons: Array<IEngineLibAddOn> | null;
        }

        export interface IEngineLibAddOn {
            /**
             * The name of the addon.
             */
            name: string;
            /**
             * The caption of the addon.
             */
            caption: string;
            /**
             * The description of the addon.
             */
            tips: string;
            /**
             * The files of the addon, including the js files and the wasm files.
             */
            files: string[];
            /**
             * The worker files of the addon, empty if there is no worker files.
             */
            workerFiles: string[];
            /**
             * The debugger files of the addon, empty if there is no debugger files.
             */
            debuggerFiles: string[];
            /**
             * Whether this addon will not include the files defines in it's owner. Default is false.
             */
            ignoreEntryFiles: boolean;

            /**
             * Whether this addon is only for native platform. Default is false.
             */
            forNativeOnly?: boolean;

            /**
             * If this addon is only for native platform, the fallback addon name for other platforms. Default is null.
             */
            fallback?: string | null;
        }

        export interface IEngineLibsManager {
            /**
             * All the engine libraries.
             */
            readonly allLibs: ReadonlyMap<string, IEngineLib>;
            /**
             * All the engine library names.
             */
            readonly allLibNames: ReadonlyArray<string>;

            /**
             * Get all files.
             * @param options
             * - renderDevice: The render device. Default is "webgl".
             * - debug: Whether to load the debug files. Default is false.
             * - native: Whether to allow the native only libraries. Default is false.
             * - disableWebAssembly: Whether to disable the web assembly. Default is false.
             * @returns The files. 
             */
            getFiles(options?: { renderDevice?: string, debug?: boolean, native?: boolean, disableWebAssembly?: boolean }): { files: Array<string>, otherFiles: Array<string>, workerFiles: Array<string>, wasmFallbackLog: Array<string> };

            /**
             * Get the full path of the lib.
             * @param libName The lib name.
             */
            getFullPathSync(libName: string): string;

            /**
             * Get the full path of the lib.
             * @param libName The lib name.
             */
            getFullPath(libName: string): Promise<string>;
        }

        export interface IEditorEnvSingleton {
            /**
             * The path of the project
             */
            readonly projectPath: string;

            /**
             * The name of the project
             */
            readonly projectName: string;

            /**
             * The type of the project
             */
            readonly projectType: string;

            /**
             * The current application directory.
             */
            readonly appPath: string;

            /**
             * The version of the editor. It is in the form of "x.y.z".
             */
            readonly appVersion: string;

            /**
             * The path of the user data. 
             * 
             * On Windows, it is c:/Users/username/AppData/Roaming/LayaAirIDE
             * 
             * On MacOS, it is ~/Library/Application Support/LayaAirIDE
             */
            readonly userDataPath: string;

            /**
             * The path of the assets.
             */
            readonly assetsPath: string;

            /**
             * The path of the packed resources.
             * 
             * On Windows, it is path/to/LayaAirIDE/resources/app.asar
             * 
             * On MacOS, it is path/to/LayaAirIDE.app/Contents/Resources/app.asar
             */
            readonly webRootPath: string;

            /**
             * The path of the unpacked resources.
             * 
             * On Windows, it is path/to/LayaAirIDE/resources
             * 
             * On MacOS, it is path/to/LayaAirIDE.app/Contents/Resources
             */
            readonly unpackedWebRootPath: string;

            /**
             * Whether the app is packaged. It is only false in the development mode.
             */
            readonly isPackaged: boolean;

            /**
             * Whether the app is in the cli mode. A cli mode is a mode that runs the app in the command line.
             */
            readonly cliMode: IRendererInfo["cliMode"];

            /**
             * Whether the app is in the foreground.
             */
            readonly isForeground: boolean;

            /**
             * Whether current window is in the foreground.
             */
            readonly isSelfForeground: boolean;

            /**
             * Whether the module is started and ready to communicate with the UI process.
             */
            readonly started: boolean;

            /**
             * The pixel ratio of the host. 
             */
            readonly hostPixelRatio: number;

            /**
             * The electron ipc service.
             */
            readonly ipc: IIpc;

            /**
             * The type registry of the editor.
             */
            readonly typeRegistry: ITypeRegistry;

            /**
             * The asset manager.
             */
            readonly assetMgr: IAssetManager;

            /**
             * A live server that can be used to preview the game.
             */
            readonly liveServer: ILiveServer;

            /**
             * The code builder.
             */
            readonly codeBuilder: ICodeBuilder;

            /**
             * The scene manager.
             */
            readonly sceneManager: ISceneManager;

            /**
             * The resource manager.
             */
            readonly resourceManager: IResourceManager;

            /**
             * The navigation manager.
             */
            readonly navigationManager: INavigationManager;

            /**
             * The 3D manager.
             */
            readonly d3Manager: ID3Manager;

            /**
             * The gizmos manager.
             */
            readonly gizmosManager: IGizmosManager;

            /**
             * The pick manager.
             */
            readonly pickManager: IPickManager;

            /**
             * The vertex picker.
             */
            readonly vertexPicker: IVertexPicker;

            /**
             * Communication port between the scene process and the UI process.
             */
            readonly port: IMyMessagePort;

            /**
             * Current active scene.
             */
            readonly scene: IGameScene;

            /**
             * Root sprite of the editor UI.
             */
            readonly uiRoot: Laya.Sprite;

            /**
             * The build manager.
             */
            readonly buildManager: IBuildManager;

            /**
             * The extension manager.
             */
            readonly extensionManager: IExtensionManager;

            /**
             * The engine libs manager.
             */
            readonly engineLibsManager: IEngineLibsManager;

            /**
             * Frame update event.
             */
            readonly onUpdate: IDelegate<() => void>;

            /**
             * Application activate event.
             */
            readonly onAppActivate: IDelegate<() => void>;
            /**
             * Player settings.
             */
            readonly playerSettings: ISettings;

            /**
             * Editor settings.
             */
            readonly editorSettings: ISettings;

            /**
             * Scene view settings.
             */
            readonly sceneViewSettings: ISettings;

            /**
             * Clipboard service.
             */
            readonly clipboard: IClipboard;

            /**
             * A path to a special directory or file associated with `name`. On failure, an
             * `Error` is thrown.
             * @param name The name of the path to retrieve.
             * @return The path to the directory or file associated with `name`.
             */
            getPath(name: CommonPathName): Promise<string>;

            /**
             * Get a settings object by name. Note that the settings are defined in the UI process, so the data read directly from settings may not be the latest. You can set autoSync=true to automatically synchronize when the data changes, or you can call the sync method to synchronize manually.
             * @param name The name of the settings. The default supported configuration information includes: PlayerSettings, EditorSettings, CompilerSettings, BuildSettings, SceneViewSettings, Preferences, DimensionsSettings.
             * @param autoSync Whether to automatically synchronize when the data changes.
             * @return The settings object.
             */
            getSettings(name: string, autoSync?: boolean): ISettings;

            /**
             * Send a message to the panel in the UI process and wait for the response.
             * @param panelId The id of the panel.
             * @param cmd Method name of the panel.
             * @param args The arguments.
             * @return The response.
             */
            sendMessageToPanel(panelId: string, cmd: string, ...args: Array<any>): Promise<any>;

            /**
             * Post a message to the panel in the UI process.
             * @param panelId The id of the panel.
             * @param cmd Method name of the panel.
             * @param args The arguments.
             */
            postMessageToPanel(panelId: string, cmd: string, ...args: Array<any>): Promise<void>;

            /**
             * Run a script in the UI process.
             * @param command The script to run. It is in the form of "objectName.methodName".
             * @param params The parameters.
             * @return The result of the script.
             * @example
             * ```
             * EditorEnv.runUIScript("window.eval", "console.log('Hello, world!')");
             * ```
             */
            runUIScript(command: string, ...params: any[]): Promise<any>;

            /**
             * Show a message box.
             * @param msg The message to show.
             * @param type The type of the message box.
             * @return A promise that resolves when the message box is closed.
             */
            alert(msg: string, type?: "none" | "info" | "error" | "question" | "warning"): Promise<void>;

            /**
             * Show a message box with a confirm and cancel button.
             * @param msg The message to show.
             * @return A promise that resolves with true if the confirm button is clicked, and false if the cancel button is clicked.
             */
            confirm(msg: string): Promise<boolean>;

            /**
             * Show a message box.
             * @param options The options of the message box.
             * @return A promise that resolves with the return value of the message box.
             */
            showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue>;

            /**
             * Open the dev tools.
             */
            openDevTools(): void;

            /**
             * Clear the console message.
             * @param group If specified, only clear the messages of the group.
             */
            clearConsoleMessage(group?: string): void;

            /**
             * Synchronize data with the UI process and refresh gizmos/handles immediately in the next frame.
             */
            invalidateFrame(): void;

            /**
             * Refresh gizmos/handles immediately in the next frame.
             */
            invalidateGizmos(): void;
        }

        export interface ID3Manager {
            /**
             * Whether to show the grid line in the scene.
             */
            showGridLine: boolean;

            /**
             * Whether to show the selection outline in the scene.
             */
            showSelectionOutline: boolean;

            /**
             * Whether to show the axis coordinate in the scene.
             */
            showAxisCoord: boolean;

            /**
             * Camera used for scene editing.
             */
            readonly sceneCamera: Laya.Camera;

            /**
             * Scene camera control tool.
             */
            readonly cameraControls: ICameraControls;

            /**
             * Render texture of the scene.
             */
            readonly sceneRT: Laya.RenderTexture;

            /**
             * Render texture for 2D elements in the scene, such as gizmos and handles. 
             */
            readonly sceneRT2D: Laya.RenderTexture2D;

            /**
             * Command buffer for rendering the scene.
             */
            readonly cmdBuffer: Laya.CommandBuffer;

            /**
             * Command buffer for rendering 2D elements in the scene, such as gizmos and handles.
             */
            readonly cmdBuffer2D: Laya.CommandBuffer2D;

            /**
             * Render textures that are deferred for release. These textures will be released in the next frame to avoid affecting the current rendering process.
             */
            readonly deferredReleaseRT: Set<Laya.RenderTexture>;

            /**
             * @deprecated Use `refresh()` instead.
             */
            invalidateGizmos(): void;

            /**
             * Immediately refresh the view in the next frame. 
             */
            refresh(): void;

            /**
             * Set refresh rate of the view.
             * @param value Default is "on-demand".
             * - "on-demand": Refresh only when necessary. This option will reduce the CPU and GPU usage.
             * - "realtime": Refresh in real-time. The view will be refreshed in a 30 FPS rate.
             */
            setRefreshRate(value: "on-demand" | "realtime"): void;

            /**
             * Temporarily switch the refresh rate to 'realtime' and maintain it for one second.
             */
            requestTempRealtimeRefresh(): void;
        }

        export namespace ICubemapTool {
            /**
             * Convert a raw pixel buffer to KTX format.
             * @param buffer The raw pixel data.
             * @param w Width of the texture.
             * @param h Height of the texture.
             * @param tempPath Temporary directory for intermediate files.
             * @param outputPath Output KTX file path.
             * @param textureFormat Pixel format string, default is "RGBA32".
             * @returns Whether the conversion was successful.
             */
            function textureToKTX(buffer: ArrayBufferView, w: number, h: number, tempPath: string, outputPath: string, textureFormat?: string): Promise<boolean>;

            /**
             * Convert a raw pixel buffer to HDR format.
             * @param buffer The raw pixel data.
             * @param w Width of the texture.
             * @param h Height of the texture.
             * @param tempPath Temporary directory for intermediate files.
             * @param outputPath Output HDR file path.
             * @param textureFormat Pixel format string, default is "RGBA32".
             * @returns Whether the conversion was successful.
             */
            function textureToHDR(buffer: ArrayBufferView, w: number, h: number, tempPath: string, outputPath: string, textureFormat?: string): Promise<boolean>;

            /**
             * Generate an IBL cubemap from a panorama pixel buffer. This runs the full pipeline:
             * raw pixels → KTX → HDR → cmgen (IBL + SH) → RGBD compressed KTX.
             * @param buffer The raw panorama pixel data.
             * @param w Width of the panorama.
             * @param h Height of the panorama.
             * @param abortToken Token to cancel the operation.
             * @param iblSamples Number of IBL samples, default is 1024.
             * @param outputDirName Output directory name relative to assets path. Defaults to scene directory.
             * @param outputName Output file name (without extension). Defaults to scene name.
             * @param textureFormat Pixel format string, default is "RGBA32".
             * @param progressName IPC progress event name, default is "createCube-progress".
             * @returns An object with `sh` (spherical harmonics text) and `path` (asset relative path), or null if cancelled.
             */
            function textureToCubeCommand(buffer: ArrayBufferView, w: number, h: number, abortToken: IAbortToken, iblSamples?: number, outputDirName?: string, outputName?: string, textureFormat?: string, progressName?: string): Promise<{ sh: string, path: string } | null>;

            /**
             * Convert 6 face images into a cubemap KTX file.
             * @param inputPath Array of 6 file paths for the cube faces.
             * @param tempPath Temporary directory for intermediate files.
             * @param outPath Output KTX file path.
             * @param mipmapCoverageIBL Whether to generate IBL mipmaps.
             * @param cubemapSize Size of each cubemap face.
             * @param filterMode Filter mode for resizing.
             * @param cubemapFilterMode Texture format for the cubemap.
             * @param generateMipmap Whether to generate mipmaps.
             * @param sRGB Whether to use sRGB color space.
             */
            function trans2DArrayToTextureCube(inputPath: string[], tempPath: string, outPath: string, mipmapCoverageIBL: boolean, cubemapSize: number, filterMode: number, cubemapFilterMode: number, generateMipmap: boolean, sRGB: boolean): Promise<void>;
        }

        export namespace ICreateAssetUtil {
            /**
             * Create a prefab asset from the specified node object.
             * @param node The node object.
             * @param path Save path of the prefab asset. The path is relative to the assets folder.
             * @param textureImporter The texture importer options.
             * @returns The new created asset.
             */
            function createPrefab(node: Laya.Node, path: string, textureImporter?: Record<string, any>): Promise<IAssetInfo>;

            /**
             * Create a scene asset from the specified scene object.
             * @param scene The scene object.
             * @param path Save path of the scene asset. The path is relative to the assets folder.
             * @param textureImporter The texture importer options.
             * @returns The new created asset.
             */
            function createScene(scene: Laya.Scene, path: string, textureImporter?: Record<string, any>): Promise<IAssetInfo>;

            /**
             * Create a material asset from the specified material object.
             * @param mat The material object.
             * @param path Save path of the material asset. The path is relative to the assets folder.
             * @param textureImporter The texture importer options.
             * @returns The new created asset.
             */
            function createMaterial(mat: Laya.Material, path: string, textureImporter?: Record<string, any>): Promise<IAssetInfo>;

            /**
             * Create a mesh asset from the specified mesh object.
             * @param mesh The mesh object. 
             * @param path Save path of the mesh asset. The path is relative to the assets folder.
             * @returns The new created asset. 
             */
            function createMesh2D(mesh: Laya.Mesh2D, path: string): Promise<IAssetInfo>;

            /**
             * Create a mesh asset from the specified mesh object.
             * @param mesh The mesh object.
             * @param path Save path of the mesh asset. The path is relative to the assets folder.
             * @returns The new created asset.
             */
            function createMesh(mesh: Laya.Mesh, path: string): Promise<IAssetInfo>;

            /**
             * Create a texture asset from the specified texture object.
             * @param tex The texture object.
             * @param path Save path of the texture asset. The path is relative to the assets folder.
             * @param textureImporter The texture importer options.
             * @returns The new created asset.
             */
            function createTexture(tex: Laya.Texture | Laya.BaseTexture, path: string, textureImporter?: Record<string, any>): Promise<IAssetInfo>;

            /**
             * Unpack a model asset. A model asset is a FBX, glTF, or other model file.
             * @param modelAsset The model asset.
             * @param outputPath The output path of the unpacked model.
             */
            function unpackModel(modelAsset: IAssetInfo, outputPath: string): Promise<void>;

            /**
             * Serialize a animation clip object to a binary buffer.
             * @param clip Animation clip object.
             * @returns The binary buffer.
             */
            function writeAnimationClip(clip: Laya.AnimationClip): ArrayBuffer;

            /**
             * Serialize a 2D animation clip object to a binary buffer.
             * @param clip 2D Animation clip object.
             * @returns The binary buffer.
             */
            function writeAnimationClip2D(clip: Laya.AnimationClip2D): ArrayBuffer;

            /**
             * Serialize a material object to a JSON object.
             * @param mat Material object.
             * @returns The JSON object.
             */
            function writeMaterial(mat: Laya.Material): any;

            /**
             * Serialize a mesh object to a binary buffer.
             * @param mesh Mesh object.
             * @returns The binary buffer. 
             */
            function writeMesh(mesh: Laya.Mesh): ArrayBuffer;

            /**
             * Serialize a 2D mesh object to a binary buffer.
             * @param mesh 2D Mesh object. 
             */
            function writeMesh2D(mesh: Laya.Mesh2D): ArrayBuffer;

            /**
             * Write a texture object to a binary buffer.
             * @param tex Texture object. 
             * @param extend Extend the non-transparent area of the image by a certain number of pixels before saving. The image size remains unchanged.
             * @returns The binary buffer. 
             */
            function writeTexture(tex: Laya.Texture | Laya.BaseTexture, extend?: number): ArrayBuffer;

            /**
             * Convert a 3D mesh object to a 2D mesh object. The 3D mesh must have isReadable set to true.
             * @param mesh The 3D mesh object. 
             * @param options Conversion options. 
             */
            function convertMeshToMesh2D(mesh: Laya.Mesh, options?: IMeshToMesh2DOptions): Laya.Mesh2D;
        }


        /**
         * Options for Mesh to Mesh2D conversion.
         */
        export interface IMeshToMesh2DOptions {
            /**
             * Projection plane to map 3D positions to 2D. Default is XY.
             */
            projectionPlane?: "XY" | "XZ" | "YZ";
            /**
             * Whether to include vertex colors. Default is true (if available).
             */
            includeColors?: boolean;
            /**
             * Whether to include UV coordinates. Default is true (if available).
             */
            includeUVs?: boolean;
            /**
             * UV channel to use (0 or 1). Default is 0.
             */
            uvChannel?: number;
            /**
             * Uniform scale applied to vertex positions. Default is 1.
             */
            scale?: number;
            /**
             * Whether the resulting Mesh2D data should be readable. Default is false.
             */
            canRead?: boolean;
            /**
             * Whether to flip Y axis (useful for 2D coordinate system). Default is false.
             */
            flipY?: boolean;
        }
        export interface IScriptBundleDefinition {
            /**
             * Whether the script bundle is enabled.
             */
            enabled: boolean;

            /**
             * The asset of the script bundle.
             */
            asset: IAssetInfo;

            /**
             * When set, a variable with the specified name will be defined on the window object referencing this script bundle.
             */
            globalName: string;

            /**
             * An internal id of the script bundle. Generally, it is the compressed version of the asset id.
             */
            bundleId: string;

            /**
             * Whether the script bundle can be loaded in the editor.
             */
            allowLoadInEditor: boolean;

            /**
             * Whether the script bundle can be loaded in runtime.
             */
            allowLoadInRuntime: boolean;

            /**
             * Whether to auto-load
             */
            autoLoad: boolean;

            /**
             * List of entry script files
             */
            entries: string[];

            /**
             * Whether to include all typescript files.
             */
            includeAllFiles: boolean;

            /**
             * If true, external code files referenced by the script bundle will be packaged into the script bundle, otherwise only references will be created.
             */
            bundleExternals: boolean;

            /**
             * Whether to load this script bundle before the main script bundle.
             */
            loadBeforeMain: boolean;

            /**
             * File name of the script bundle.
             */
            fileName: string;

            /**
             * References to other script bundles.
             */
            references: IScriptBundleDefinition[];
        }

        export interface IClassIdTransformer {
            (classId: string): string;
        }

        export interface ICodeBuildOptions {
            /**
             * Whether to compress the js files.
             */
            minify?: boolean;

            /**
             * If minify is true, whether to keep the class names and function names during compression.
             */
            keepNames?: boolean;

            /**
             * Whether to generate source map files.
             */
            sourcemap?: boolean;

            /**
             * Whether to include the source code in the source map files. Be aware that this may expose your source code.
             */
            sourcesContent?: boolean,

            /**
             * By default, the class id of the script bundle is the compressed version of the asset id. You can provide a custom transformer to change the class id.
             */
            classIdTransformer?: IClassIdTransformer;

            /**
             * Use a custom logger instead of the default console logger.
             */
            logger?: ILogger;
        }

        export interface ICodeBuilder {
            /**
             * Get all script bundle definitions in the project.
             * @returns A map of script bundle definitions. The key is the file name of the script bundle.
             */
            getScriptBundleDefs(): ReadonlyMap<string, Readonly<IScriptBundleDefinition>>;
            /**
             * Compile the release version of the code.
             * @param outDir The output directory for the compiled code.
             * @param outputAssets A test function that determines whether an asset should be included in the build.
             * @param options Additional options for the build process.
             * @returns The list of output files.
             */
            buildRelease(outDir: string, outputAssets: { has(asset: IAssetInfo): boolean }, options?: ICodeBuildOptions): Promise<Array<string>>;

            /**
             * Compile a script bundle.
             * @param defAsset The definition asset of the script bundle.
             * @param outDir The output directory for the compiled code. 
             * @param options Additional options for the build process.
             * @returns The list of output files. 
             */
            buildScriptBundle(defAsset: IAssetInfo, outDir: string, options?: ICodeBuildOptions): Promise<Array<string>>;
        }
        /**
         * Public types for the built-in Clipper2 polygon library.
         *
         * Coordinates are double-precision numbers. Boolean operations return newly allocated
         * paths and do not mutate their input paths. `precision` parameters control decimal
         * rounding inside an operation; omit them to use the library default.
         */
        export namespace Clipper2 {
            /** Two-dimensional point in the caller's coordinate system. */
            export interface PointD {
                /** Horizontal coordinate. */
                x: number;
                /** Vertical coordinate. */
                y: number;
            }

            /** Polygon filling rule: 0 EvenOdd, 1 NonZero, 2 Positive, 3 Negative. */
            export type FillRule = 0 | 1 | 2 | 3;
            /** Boolean operation: 0 None, 1 Intersection, 2 Union, 3 Difference, 4 Xor. */
            export type ClipType = 0 | 1 | 2 | 3 | 4;
            /** Input-path role: 1 Subject, 2 Clip. */
            export type PathType = 1 | 2;
            /** Offset join: 0 Square, 1 Round, 2 Miter, 3 Bevel. */
            export type JoinType = 0 | 1 | 2 | 3;
            /** Offset end: 0 Polygon, 1 Joined, 2 Butt, 3 Square, 4 Round. */
            export type EndType = 0 | 1 | 2 | 3 | 4;
            /** Point classification: 0 on boundary, 1 inside, 2 outside. */
            export type PointInPolygonResult = 0 | 1 | 2;

            /** Mutable, typed path of points. Use `IEditorEnv.Clipper2.PathD` to construct one. */
            export interface IPathD extends Iterable<PointD> {
                /** Append points and return the new length. */
                push(...points: PointD[]): number;
                /** Append all points from an iterable and return the new length. */
                pushRange(points: Iterable<PointD>): number;
                /** Remove every point. */
                clear(): void;
                /** Return a deep copy whose point storage is independent. */
                clone(): IPathD;
                /** Remove and return the last point, or undefined when empty. */
                pop(): PointD | undefined;
                /** Return the point view at `index`. Mutating it may mutate the path. */
                get(index: number): PointD;
                /** Return an independent copy of the point at `index`. */
                getClone(index: number): PointD;
                /** Return the X coordinate at `index`. */
                getX(index: number): number;
                /** Return the Y coordinate at `index`. */
                getY(index: number): number;
                /** Replace the point coordinates at `index`. */
                set(index: number, x: number, y: number): void;
                /** Number of points in the path. */
                readonly length: number;
            }

            /** Runtime constructor signatures for a mutable path. */
            export interface PathDConstructor {
                /** Create an empty path. */
                new(): IPathD;
                /** Create storage with the requested initial length. */
                new(arrayLength: number): IPathD;
                /** Create a path containing copies of the supplied points. */
                new(...points: PointD[]): IPathD;
            }

            /** Mutable collection of paths. */
            export interface PathsD extends Array<IPathD> {
                /** Remove every path. */
                clear(): void;
                /** Append an existing `IPathD` without converting its point storage. */
                directPush(path: IPathD): void;
                /** Convert and append path iterables; return the new collection length. */
                push(...paths: Iterable<PointD>[]): number;
                /** Convert and append all path iterables; return the new collection length. */
                pushRange(paths: Iterable<Iterable<PointD>>): number;
            }

            /** Runtime constructor and clone signatures for a path collection. */
            export interface PathsDConstructor {
                /** Create an empty path collection. */
                new(): PathsD;
                /** Create a collection with the requested initial length. */
                new(arrayLength: number): PathsD;
                /** Create a collection containing the supplied paths. */
                new(...paths: IPathD[]): PathsD;
                /** Deep-copy all paths and their points. */
                clone(paths: Iterable<Iterable<PointD>>): PathsD;
            }

            /** Mutable axis-aligned rectangle. */
            export interface RectD {
                /** Minimum X coordinate. */
                left: number;
                /** Minimum Y coordinate. */
                top: number;
                /** Maximum X coordinate. */
                right: number;
                /** Maximum Y coordinate. */
                bottom: number;
                /** Current width (`right - left`). */
                width: number;
                /** Current height (`bottom - top`). */
                height: number;
                /** Return the center point. */
                midPoint(): PointD;
                /** Return the rectangle boundary as a closed polygon path. */
                asPath(): IPathD;
                /** Test whether the point lies within the rectangle bounds. */
                contains(point: PointD): boolean;
                /** Test whether the complete rectangle lies within these bounds. */
                contains(rect: RectD): boolean;
                /** Multiply all rectangle coordinates by `scale` in place. */
                scale(scale: number): void;
                /** Test whether the rectangle has no valid area. */
                isEmpty(): boolean;
                /** Test whether two rectangles overlap. */
                intersects(rect: RectD): boolean;
            }

            /** Runtime constructor signatures for rectangles. */
            export interface RectDConstructor {
                /** Create an empty rectangle. */
                new(): RectD;
                /** Create a rectangle from explicit bounds. */
                new(left: number, top: number, right: number, bottom: number): RectD;
                /** Create initialized-valid or invalid sentinel bounds. */
                new(isValid: boolean): RectD;
                /** Copy a rectangle. */
                new(rect: RectD): RectD;
            }

            /** Base node in a polygon containment tree. */
            export interface PolyPathBase extends Iterable<PolyPathBase> {
                /** Number of direct child polygons. */
                readonly length: number;
                /** Return nesting depth, where top-level output is level 0. */
                getLevel(): number;
                /** Return whether this polygon represents a hole by nesting parity. */
                getIsHole(): boolean;
                /** Remove this node's children. */
                clear(): void;
            }

            /** Floating-point polygon-tree node. */
            export interface PolyPathD extends PolyPathBase {
                /** Coordinate scale used while converting from the integer clipping core. */
                scale: number;
                /** Polygon at this node; the tree root may not have one. */
                polygon?: IPathD;
                /** Signed area of this node's polygon. */
                area(): number;
                /** Iterate direct child nodes. */
                [Symbol.iterator](): Generator<PolyPathD, void, unknown>;
            }

            /** Root or node type for hierarchical polygon output. */
            export interface PolyTreeD extends PolyPathD {
            }

            /** Runtime constructor for polygon trees. */
            export interface PolyTreeDConstructor {
                /** Create a tree root or a child associated with `parent`. */
                new(parent?: PolyPathBase): PolyTreeD;
            }

            /** Stateful clipping engine for incremental input and reusable output buffers. */
            export interface ClipperD {
                /** Remove all subject and clip inputs so the instance can be reused. */
                clear(): void;
                /** Add one subject or clip path. Set `isOpen` for an open polyline. */
                addPath(path: Iterable<PointD>, pathType: PathType, isOpen?: boolean): void;
                /** Add one or more subject or clip paths. */
                addPaths(paths: Iterable<PointD> | Iterable<Iterable<PointD>>, pathType: PathType, isOpen?: boolean): void;
                /** Add one or more closed subject paths. */
                addSubject(paths: Iterable<PointD> | Iterable<Iterable<PointD>>): void;
                /** Add one or more open subject polylines. */
                addOpenSubject(paths: Iterable<PointD> | Iterable<Iterable<PointD>>): void;
                /** Add one or more closed clip paths. */
                addClip(paths: Iterable<PointD> | Iterable<Iterable<PointD>>): void;
                /** Execute into separate caller-owned closed and open output collections. */
                execute(clipType: ClipType, fillRule: FillRule, solutionClosed: PathsD, solutionOpen: PathsD): boolean;
                /** Execute closed-path output into a caller-owned collection. */
                execute(clipType: ClipType, fillRule: FillRule, solutionClosed: PathsD): boolean;
                /** Execute hierarchical output and collect open paths separately. */
                execute(clipType: ClipType, fillRule: FillRule, polyTree: PolyTreeD, openPaths: PathsD): boolean;
                /** Execute closed paths into a hierarchical containment tree. */
                execute(clipType: ClipType, fillRule: FillRule, polyTree: PolyTreeD): boolean;
            }

            /** Runtime constructor for a stateful clipping engine. */
            export interface ClipperDConstructor {
                /** Create an engine using the optional number of decimal places for input rounding. */
                new(roundingDecimalPrecision?: number): ClipperD;
            }

            /** Stateless polygon operations. Returned paths are newly allocated. */
            export interface ClipperApi {
                /** Return the intersection of subject and clip polygons. */
                intersect(subject: PathsD, clip: PathsD, fillRule: FillRule, precision?: number): PathsD;
                /** Union all subject polygons. */
                union(subject: PathsD, fillRule: FillRule, precision?: number): PathsD;
                /** Union subject and clip polygon sets. */
                union(subject: PathsD, clip: PathsD, fillRule: FillRule, precision?: number): PathsD;
                /** Subtract clip polygons from subject polygons. */
                difference(subject: PathsD, clip: PathsD, fillRule: FillRule, precision?: number): PathsD;
                /** Return regions contained by exactly one of the two polygon sets. */
                xor(subject: PathsD, clip: PathsD, fillRule: FillRule, precision?: number): PathsD;
                /** Execute an arbitrary boolean operation and return flat closed paths. */
                booleanOp(clipType: ClipType, subject: PathsD, clip: PathsD | undefined, fillRule: FillRule, precision?: number): PathsD;
                /** Execute an arbitrary boolean operation into a caller-owned polygon tree. */
                booleanOp(clipType: ClipType, subject: PathsD, clip: PathsD | undefined, polyTree: PolyTreeD, fillRule: FillRule, precision?: number): void;
                /** Offset paths by `delta`; positive and negative meanings depend on winding and end type. */
                inflatePaths(paths: PathsD, delta: number, joinType: JoinType, endType: EndType, miterLimit?: number, precision?: number, arcTolerance?: number): PathsD;
                /** Clip closed polygons to an axis-aligned rectangle. */
                rectClip(rect: RectD, paths: IPathD | PathsD, precision?: number): PathsD;
                /** Clip open polylines to an axis-aligned rectangle. */
                rectClipLines(rect: RectD, paths: IPathD | PathsD, precision?: number): PathsD;
                /** Compute the Minkowski sum of a pattern and a path. */
                minkowskiSum(pattern: IPathD, path: IPathD, isClosed: boolean): PathsD;
                /** Compute the Minkowski difference of a pattern and a path. */
                minkowskiDiff(pattern: IPathD, path: IPathD, isClosed: boolean): PathsD;
                /** Return signed area for one path, or the sum for a collection. */
                area(path: IPathD | PathsD): number;
                /** Test path orientation using the sign convention of `area`. */
                isPositive(path: IPathD): boolean;
                /** Format a path for diagnostics. The format is not a persistence contract. */
                pathDToString(path: IPathD): string;
                /** Format multiple paths for diagnostics. The format is not a persistence contract. */
                pathsDToString(paths: PathsD): string;
                /** Return a new path with every coordinate multiplied by `scale`. */
                scalePath(path: IPathD, scale: number): IPathD;
                /** Return new paths with every coordinate multiplied by `scale`. */
                scalePaths(paths: PathsD, scale: number): PathsD;
                /** Return a new path translated by the supplied delta. */
                translatePath(path: IPathD, dx: number, dy: number): IPathD;
                /** Return new paths translated by the supplied delta. */
                translatePaths(paths: PathsD, dx: number, dy: number): PathsD;
                /** Return a new path with point order reversed. */
                reversePath(path: IPathD): IPathD;
                /** Return new paths with every point order reversed. */
                reversePaths(paths: PathsD): PathsD;
                /** Calculate axis-aligned bounds for one path or a path collection. */
                getBounds(path: IPathD | PathsD): RectD;
                /** Build a path from alternating X/Y numbers: `[x0, y0, x1, y1, ...]`. */
                makePathD(points: ArrayLike<number>): IPathD;
                /** Remove adjacent points closer than the supplied squared distance. */
                stripNearDuplicates(path: IPathD, minEdgeLengthSquared: number, isClosedPath: boolean): IPathD;
                /** Simplify one path with the Ramer-Douglas-Peucker algorithm. */
                ramerDouglasPeucker(path: IPathD, epsilon: number): IPathD;
                /** Simplify multiple paths with the Ramer-Douglas-Peucker algorithm. */
                ramerDouglasPeucker(paths: PathsD, epsilon: number): PathsD;
                /** Remove insignificant vertices from one path. */
                simplifyPath(path: IPathD, epsilon: number, isClosedPath?: boolean): IPathD;
                /** Remove insignificant vertices from multiple paths. */
                simplifyPaths(paths: PathsD, epsilon: number, isClosedPaths?: boolean): PathsD;
                /** Remove collinear vertices after rounding to `precision` decimal places. */
                trimCollinear(path: IPathD, precision: number, isOpen?: boolean): IPathD;
                /** Classify a point as on, inside, or outside a polygon. */
                pointInPolygon(point: PointD, polygon: IPathD, precision?: number): PointInPolygonResult;
                /** Create a polygonal ellipse; omit `radiusY` for a circle and `steps` for automatic detail. */
                ellipse(center: PointD, radiusX: number, radiusY?: number, steps?: number): IPathD;
            }
        }

        /** Runtime exports of the built-in Clipper2 polygon library. */
        export interface IClipper2 {
            /** Fill-rule constants used by boolean operations. */
            readonly FillRule: {
                readonly EvenOdd: 0;
                readonly NonZero: 1;
                readonly Positive: 2;
                readonly Negative: 3;
            };
            /** Boolean-operation constants. */
            readonly ClipType: {
                readonly None: 0;
                readonly Intersection: 1;
                readonly Union: 2;
                readonly Difference: 3;
                readonly Xor: 4;
            };
            /** Input-path role constants for `ClipperD`. */
            readonly PathType: {
                readonly Subject: 1;
                readonly Clip: 2;
            };
            /** Offset join-style constants. */
            readonly JoinType: {
                readonly Square: 0;
                readonly Round: 1;
                readonly Miter: 2;
                readonly Bevel: 3;
            };
            /** Offset end-style constants. */
            readonly EndType: {
                readonly Polygon: 0;
                readonly Joined: 1;
                readonly Butt: 2;
                readonly Square: 3;
                readonly Round: 4;
            };
            /** Point-in-polygon result constants. */
            readonly PointInPolygonResult: {
                readonly IsOn: 0;
                readonly IsInside: 1;
                readonly IsOutside: 2;
            };
            /** Mutable path constructor. */
            readonly PathD: Clipper2.PathDConstructor;
            /** Mutable path-collection constructor. */
            readonly PathsD: Clipper2.PathsDConstructor;
            /** Mutable rectangle constructor. */
            readonly RectD: Clipper2.RectDConstructor;
            /** Stateful clipping-engine constructor. */
            readonly ClipperD: Clipper2.ClipperDConstructor;
            /** Polygon containment-tree constructor. */
            readonly PolyTreeD: Clipper2.PolyTreeDConstructor;
            /** Stateless polygon operations. */
            readonly Clipper: Clipper2.ClipperApi;
            /** Test whether a runtime value is a Clipper2 path. */
            readonly isPathD: (value: unknown) => value is Clipper2.IPathD;
            /** Test whether a runtime value is a Clipper2 path collection. */
            readonly isPathsD: (value: unknown) => value is Clipper2.PathsD;
            /** Test whether a runtime value is a point-like Clipper2 value. */
            readonly isPointD: (value: unknown) => value is Clipper2.PointD;
            /** Test whether a runtime value is a Clipper2 rectangle. */
            readonly isRectD: (value: unknown) => value is Clipper2.RectD;
        }

        export enum OrthographicMode {
            Orthographic_XZ,
            Orthographic_XY,
            Orthographic_YZ,
            None
        }

        export interface ICameraControls {
            /**
             * Get the camera instance
             */
            get camera(): Laya.Camera;

            /**
             * Get or set the orthographic mode
             */
            get orthographicMode(): OrthographicMode;
            set orthographicMode(value: OrthographicMode);

            /**
             * Get or set the perspective field of view
             */
            get perspectiveFov(): number;
            set perspectiveFov(value: number);

            /**
             * Get or set whether the camera is orthographic
             */
            get orthographic(): boolean;
            set orthographic(value: boolean);

            /**
             * Get or set the size of the camera
             */
            get size(): number;
            set size(value: number);

            /**
             * Get or set the rotation of the camera
             */
            set rotation(value: Laya.Quaternion);
            get rotation(): Laya.Quaternion;

            /**
             * Get the distance of the camera
             */
            get cameraDistance(): number;

            /**
             * Get the position of the camera
             */
            get cameraPostion(): Readonly<Laya.Vector3>;

            /**
             * Get the focus position
             */
            get focusPosition(): Laya.Vector3;

            /**
             * Get the normalized right vector
             */
            get normalizedRight(): Laya.Vector3;

            /**
             * Get the normalized up vector
             */
            get normalizedUp(): Laya.Vector3;

            /**
             * Get the normalized forward vector
             */
            get normalizedForward(): Laya.Vector3;

            /**
             * Update the camera controls
             */
            update(): void;

            /**
             * Set the focus position of the camera
             * @param pos The focus position
             * @param distance Optional distance
             * @param anim Optional animation flag. Default is true.
             */
            setFocusPosition(pos: Laya.Vector3, distance?: number, anim?: boolean): void;

            /**
             * Look at a direction
             * @param direction The direction to look at
             */
            lookAtDirection(direction: Laya.Quaternion): void;

            /**
             * Look at a point
             * @param point The point to look at
             * @param direction The direction to look at
             * @param newSize The new size of the camera
             * @param ortho Whether the camera is orthographic
             */
            lookAt(point: Laya.Vector3, direction: Laya.Quaternion, newSize: number, ortho: boolean): void;

            /**
             * Get the serialized data of the current focus
             */
            getFocusData(): any;

            /**
             * Set the serialized data of the focus
             * @param data The serialized data
             * @param anim Optional animation flag. Default is true.
             */
            setFocusData(data: any, anim?: boolean): void;

            /**
             * Get a ray from screen space coordinates
             * @param x The x coordinate
             * @param y The y coordinate
             */
            getScreenRay(x: number, y: number): Readonly<Laya.Ray>;

            /**
             * Calculate the cursor ray
             * @param pos The position
             * @param camera The camera instance
             * @param out The output ray
             */
            caculateCursorRay(pos: Laya.Vector2, camera: Laya.Camera, out: Laya.Ray): void;

            /**
             * Get the screen position
             * @param position The position
             * @param out The output vector
             */
            getScreenPosition(position: Laya.Vector3, out: Laya.Vector4): boolean;

            /**
             * Zoom the camera
             * @param distance The distance to zoom
             */
            zoom(distance: number): void;

            /**
             * Translate the camera
             * @param distanceX The distance to translate along the X axis
             * @param distanceY The distance to translate along the Y axis
             * @param distanceZ The distance to translate along the Z axis
             */
            translate(distanceX: number, distanceY: number, distanceZ: number): void;

            /**
             * Move the camera in fly mode
             * @param distanceX The distance to move along the X axis
             * @param distanceY The distance to move along the Y axis
             * @param distanceZ The distance to move along the Z axis
             */
            flyMove(distanceX: number, distanceY: number, distanceZ: number): void;

            /**
             * Reset the camera motion
             */
            resetMotion(): void;

            /**
             * Rotate around an axis
             * @param axis The axis to rotate around
             * @param angle The angle to rotate
             * @param lockPivot Optional flag to lock the pivot
             */
            rotateFromAxis(axis: Laya.Vector3, angle: number, lockPivot?: boolean): void;

            /**
             * Rotate yaw (left/right)
             * The rotation axis is fixed to the scene up vector (0, 1, 0)
             * @param angle The angle to rotate
             * @param lockPivot Optional flag to lock the pivot
             */
            rotateYaw(angle: number, lockPivot?: boolean): void;

            /**
             * Rotate pitch (up/down)
             * @param angle The angle to rotate
             * @param lockPivot Optional flag to lock the pivot
             */
            rotatePicth(angle: number, lockPivot?: boolean): void;

            /**
             * Rotate yaw around the focus point (left/right)
             * @param angle The angle to rotate
             */
            focusRotateYaw(angle: number): void;

            /**
             * Rotate pitch around the focus point (up/down)
             * @param angle The angle to rotate
             */
            focusRotatePicth(angle: number): void;

            /**
             * Focus on a node
             * @param node The node to focus on
             * @param anim Optional animation flag. Default is true.
             */
            focusNode(node: Laya.Sprite3D, anim?: boolean): void;

            /**
             * Preview focus on a node
             * @param node The node to preview focus on
             * @param distanceRatio The distance ratio
             */
            previewFocusNode(node: Laya.Sprite3D, distanceRatio: number): void;

            /**
             * Set the camera transform
             * @param data The transform data
             * @param anim Optional animation flag. Default is true.
             */
            setCameraTransform(data: any, anim?: boolean): void;

            /**
             * Get the camera transform
             */
            getCameraTransform(): any;
        }
        export interface IBuildTask {
            /**
             * Task name is the caption of the build target.
             * @see IBuildTargetInfo.caption
             */
            readonly name: string;

            /**
             * Platform name. For example, "android", "ios", "web", etc.
             */
            readonly platform: string;

            /**
             * Whether the build target is a mini-game platform, e.g. WeChat Mini Game, Oppo Mini Game, etc.
             */
            readonly isMiniGame: boolean;

            /**
             * Configurations of the build. It is a copy of the build settings. Feel free to modify it, as it won't affect the original settings.
             */
            readonly config: IBuildConfig;

            /**
             * Configurations of the platform. It is a copy of the platform settings. Feel free to modify it, as it won't affect the original settings.
             */
            readonly platformConfig: any;

            /**
             * Player settings. It is a copy of the player section of project settings. Feel free to modify it, as it won't affect the original settings.
             */
            readonly playerSettings: any;

            /**
             * Output path of the build.
             */
            readonly destPath: string;

            /**
             * Resource path of the build. By default, it is the same as destPath. 
             * 
             * You cannot modify this value directly, set config.resourcePath in onSetup event instead.
             */
            readonly resourcePath: string;

            /**
             * The path for the remote packages. Default is destPath+"-remote". For example, if destPath is "build/android", remotePkgPath will be "build/android-remote".
             * 
             * All the remote packages will be put in this folder.
             */
            remotePkgPath: string;

            /**
             * Build template path. It is the path of the internal build template folder.
             * 
             * All files in this folder will be copied to the destPath during the build process.
             */
            readonly buildTemplatePath: string;

            /**
             * Build template path of the project. It is the path of the project's build-templates folder.
             * 
             * All files in this folder will be copied to the destPath during the build process.
             */
            readonly projectBuildTemplatePath: string;

            /**
             * If there are any long-running operations during the build process, it is recommended to call abortToken.check() to check if the operation needs to be aborted. Some utility classes also support passing in abortToken, such as IEditorEnv.utils.exec, IEditorEnv.utils.httpRequest, etc.
             */
            readonly abortToken: IAbortToken;

            /**
             * A full list of files that will write to the output folder.
             */
            readonly exports: IBuildExports;

            /**
             * A logger for writing logs. Use it to write logs instead of directly using console.xxx.
             */
            readonly logger: ILogger;

            /**
             * Status of current build task.
             */
            readonly status: BuildTaskStatus;

            /**
             * Whether the build task is in recompile mode. In this mode, only scripts are built, and assets are not exported. 
             */
            readonly recompileMode: boolean;

            /**
             * Run in a special mode where only scripts are built, and assets are not exported. This mode is useful when you only want to build scripts without exporting assets, which can significantly speed up the build process. In this mode, the onCollectAssets, onBeforeExportAssets, onAfterExportAssets events will be skipped, but the onExportScripts event will still be triggered.
             */
            setRecompileMode(): this;

            /**
             * Wait for the completion of the build task.
             */
            waitForCompletion(): Promise<BuildTaskStatus>;

            /**
             * Terminate the build task.
             * @param success If true, the build task will be marked as successful. Otherwise, it will be marked as failed.
             */
            terminate(success: boolean): void;

            /**
             * Merge two or more configuration files. The target configuration file is at the path specified by filePath, and the source configuration files may be located at:
             * - If it is a built-in build target of the IDE, it is in the built-in release template folder of the IDE; if it is a custom build target added by a plugin, it is in the template folder specified by the plugin.
             * - The build-templates folder under the project, that is, the project's build-templates folder.
             * 
             * This method will merge all found configuration files together, and if the overrides parameter provides additional data, it will also be written into the configuration file.
             * @param filePath The path of the configuration file, relative to `destPath`.
             * @param overrides Additional configuration data.
             * @example
             * ```
             * // Find project.config.json in the project's build-templates folder, if found, merge it with the project.config.json in the output folder, and then write it to the output folder.
             * task.mergeConfigFile("project.config.json");
             * ```
             */
            mergeConfigFile(filePath: string, overrides?: any): void;

            /**
             * Find a file in the build template folder. The search order is as follows:
             * - The build-templates folder under the project, that is, the project's build-templates folder.
             * - If it is a built-in build target of the IDE, it is in the built-in release template folder of the IDE; if it is a custom build target added by a plugin, it is in the template folder specified by the plugin.
             * 
             * @param filePath A relative path.
             * @returns The absolute path of the file, or null if it does not exist in any build-template location.
             */
            findFileInBuildTemplate(filePath: string): string | null;

            /**
             * Load the index.html template file. This method is used to load the index.html template file for web platforms.
             * @returns The content of the index.html template file.
             */
            loadIndexHTMLTemplate(): Promise<string>;

            /**
             * Get a module location by its ID.
             * @param moduleId The ID of the module.
             * @returns The absolute path of the module. 
             */
            getModulePath(moduleId: string): string;

            /**
             * Set the title of the progress bar.
             * @param text The title text.
             */
            setProgressTitle(text: string): void;

            /**
             * Increase the progress of the progress bar. In every event, the range of the progress bar is 0-100. If the value exceeds 100, it will be reset to 100.
             * @param value The value to increase.
             */
            addProgress(value: number): void;

            /**
             * Set the progress of the progress bar. In every event, the range of the progress bar is 0-100.
             * @param value The value to set.
             */
            setProgress(value: number): void;
        }

        export interface IOutSubpackageInfo {
            /**
             * Subpackage path. It is a relative path to the assets folder. e.g. "test".
             */
            path: string;

            /**
             * If the subpackage is a remote package, set this to a URL. e.g. "http://example.com/test".
             */
            remoteUrl?: string;

            /**
             * Whether to autoload the subpackage on startup.
             */
            autoLoad?: boolean;

            /**
             * If version management is enabled, this is the hash value of the fileconfig.json.
             */
            hash?: string;
        }

        export interface IBuildExports {
            /**
             * index.js file path.
             */
            indexJS: string;

            /**
             * All engine js files.
             */
            libs: Array<string>;

            /**
             * If disableWebAssembly is `alternative`, this is the alternative engine js files if WebAssembly is supported.
             */
            alternativeLibs: Array<string>;

            /**
             * All user js files.
             */
            bundles: Array<string>;

            /**
             * All subpackages.
             */
            subpackages: Array<IOutSubpackageInfo>;

            /**
             * All local subpackages that can be registered as mini-game subpackages.
             */
            miniGameSubPackages: Array<{ name: string, root: string }>;

            /**
             * All files that will be copied to the output folder.
             */
            files: Map<string, IOutFileInfo>;
        }

        export interface IBuildPlugin {
            /**
             * Build task initialization. You can modify task.config, task.platformConfig, task.playerSettings, etc. in this event. 
             * The modifications to these configurations are only effective for this task and will not affect the project.
             * @param task The build task.
             */
            onSetup?(task: IBuildTask): void | Promise<void>;

            /**
             * Build task start event. You can initialize the structure of the output folder, perform necessary checks, and module installations in this event.
             * @param task The build task.
             */
            onStart?(task: IBuildTask): void | Promise<void>;

            /**
             * Collecting assets required for the build. The assets set is collected based on dependencies, rules of the resources directory, and all other valid rules. You can add more assets to the set.
             * @param task The build task.
             * @param assets The set of assets to be exported. 
             */
            onCollectAssets?(task: IBuildTask, assets: Set<IAssetInfo>): void | Promise<void>;

            /**
             * Assets are ready to be written to the output directory. The exportInfoMap contains information about all the resources to be written, including the output path, etc. You can modify outPath to customize the output path of the asset.
             * @param task The build task.
             * @param exportInfoMap The information of all the assets to be written. 
             */
            onBeforeExportAssets?(task: IBuildTask, exportInfoMap: Map<IAssetInfo, IAssetExportInfo>): void | Promise<void>;

            /**
             * Script generation completed. If developers need to modify the generated code files, e.g. minify, obsfucate, etc., they can handle it in this event.
             * @param task The build task.
             */
            onExportScripts?(task: IBuildTask): void | Promise<void>;

            /**
             * Assets writing completed. If developers need to add their own files, or perform operations such as file compression, they can handle it in this event.
             * @param task The build task.
             */
            onAfterExportAssets?(task: IBuildTask): void | Promise<void>;

            /**
             * The build is complete. You can generate some manifest files, configuration files, etc. in this event.
             * Common examples include generating the index.html file for web platforms, manifest.json files for mini-game platforms, etc.
             * @param task The build task.
             */
            onCreateManifest?(task: IBuildTask): void | Promise<void>;

            /**
             * If there is a native packaging process, handle it here. e.g. apk, ipa, etc.
             * @param task The build task.
             */
            onCreatePackage?(task: IBuildTask): void | Promise<void>;

            /**
             * Event triggered when the build task is completed.
             * @param task The build task.
             */
            onEnd?(task: IBuildTask): void | Promise<void>;
        }

        export enum BuildTaskStatus {
            Running,
            Success,
            Failed
        }

        export namespace BuildTaskStatic {
            /**
             * Start a build task.
             * @param platform The platform to build. e.g. "android", "ios", "web", etc.
             * @returns The build task.
             */
            function start(platform: string): IBuildTask;

            /**
             * Start a build task. The output path is specified by destPath and overrides the output path in the build settings.
             * @param platform The platform to build. e.g. "android", "ios", "web", etc.
             * @param destPath The output path.
             * @returns The build task.
             */
            function start(platform: string, destPath: string): IBuildTask;

            /**
             * Start a build task with temporary plugins.
             * @param platform The platform to build. e.g. "android", "ios", "web", etc.
             * @param tempPlugins Temporary plugins.
             * @returns The build task.
             */
            function start(platform: string, ...tempPlugins: Array<IBuildPlugin>): IBuildTask;

            /**
             * Start a build task with temporary plugins. The output path is specified by destPath and overrides the output path in the build settings.
             * @param platform The platform to build. e.g. "android", "ios", "web", etc.
             * @param destPath The output path.
             * @param tempPlugins Temporary plugins.
             * @returns The build task.
             */
            function start(platform: string, destPath: string, ...tempPlugins: Array<IBuildPlugin>): IBuildTask;
        }

        export interface IBuildManager {
            /**
             * Get the target information of the specified platform.
             * @param platform The platform. For example, "android", "ios", "web", etc.
             */
            getTargetInfo(platform: string): IBuildTargetInfo;

            /**
             * Get the default build plugin for the specified platform.
             * @param targetName The name of the target platform, such as "web", "android", "ios", etc.
             * @returns The default build plugin class for the specified platform.
             */
            getDefaultPlugin(targetName: string): new () => IBuildPlugin;
        }
        export interface IBuildConfig {
            /**
             * The name of this build. It is generally used as the name of the native project folder, the product name of the App, etc.
             */
            name: string;

            /**
             * Display name of this build. It is generally used as the web page title, window title, etc.
             */
            displayName: string;

            /**
             * Version string. The format is generally "major.minor.patch". For example, "1.0.0".
             */
            version: string;

            /**
             * Icon path. It is in the form of "res://uuid". For example, "res://12345678-1234-1234-1234-1234567890ab".
             */
            icon: string;

            /**
             * Whether to compress the engine js files.
             */
            useCompressedEngine: boolean;

            /**
             * Whether to compress the user js files.
             */
            minifyJS: boolean;

            /**
             * Whether to generate source map files.
             */
            sourcemap: boolean;

            /**
             * Wether to include the source code in the source map files. Be aware that this may expose your source code.
             */
            sourcesContent: boolean;

            /**
             * The scene that automatically opens after startup. It is in the form of "res://uuid". 
             */
            startupScene: string;

            /**
             * Include these scenes in the build. Each element is in the form of "res://uuid".
             */
            includedScenes: Array<string>;

            /**
             * Include these assets in the build. Each element is in the form of "res://uuid".
             */
            alwaysIncluded: Array<string>;

            /**
             * Whether to copy all files in the bin folder to the release folder.
             */
            copyBinFiles: boolean;

            /**
             * When copyBinFiles is true, ignore these files in the bin folder. They can be glob patterns.
             * 
             * For example, ["*.txt"].
             */
            ignoreFilesInBin: Array<string>;

            /**
             * Enable version management. If true, the hash value of the file will be appended to the file name.
             */
            enableVersion: boolean;

            /**
             * When enableVersion is true, whether to append the hash value to the fileconfig file name.
             * If false, fileconfig keeps its original file name and uses a query parameter to avoid caching. Default is false.
             */
            enableFileConfigHash: boolean;

            /**
             * When enableVersion is true, ignore these files in the version management. They are asset ids in 'res://uuid' format.
             */
            ignoreFilesInVersion: Array<string>;

            /**
             * The length of the hash value of the file name when version management is enabled. Default is 5.
             */
            versionTagLength: number;

            /**
             * The algorithm used to generate the hash value of the file name when version management is enabled. Default is md5.
             */
            versionAlgorithm: 'md5' | 'sha256';

            /**
             * Enable subpackages. If true, the assets will be divided into multiple packages.
             */
            enableSubpackages: boolean;

            /**
             * Subpackages configuration.
             */
            subpackages: Array<ISubpackageInfo>;

            /**
             * Enable WebAssembly subpackage. If true, the WebAssembly libraries will be placed in a separate subpackage.
             */
            enableWasmSubpackage: boolean;

            /**
             * If true, The main package will be treated as a remote package, which means the main package also needs to be configured with a remote address and will be automatically loaded from the remote at startup.
             */
            enableRemoteMainPackage: boolean;

            /**
             * When enableRemoteMainPackage is true, the remote address of the main package.
             */
            mainPackageRemoteUrl: string;

            /**
             * By default, all exported files are placed in the release folder. If you want to place them in a sub-folder, you can set this value.
             * For example, "resource".
             */
            resourcePath: string;

            /**
             * Some file extensions cannot be used due to restrictions of mini-game platforms or servers. 
             * In this case, you can enable a mapping table to map the original extensions to new extensions.
             */
            useSafeFileExtensions: boolean;

            /**
             * When useSafeFileExtensions is true, the mapping table of file extensions.
             * 
             * Please note that there are already built-in mappings, such as shader -> shader.json. You only need to add additional mappings.
             * 
             * For example, { "abc": "abc.json" }.
             */
            fileExtensionOverrides: Record<string, string>;

            /**
             * The texture may be configured to apply compression formats required by various platforms. 
             * Here you need to configure which platforms need to be supported for this build, 
             * so that the corresponding formats can be packaged. Default is all platforms.
             */
            runtimePlatforms: RuntimePlatformType[];

            /**
             * If false, even if the texture is configured to use a compressed format on a certain platform, it will not be used and the original format will be used instead.
             */
            allowTextureCompressedFormat: boolean;

            /**
             * If true, the original texture file will be kept in the release folder. 
             * For example, If a.png is compressed to a.ktx, then both a.png and a.ktx will be present in the release folder. The benefit of this is that if a certain runtime platform does not support the ktx format, it can fall back to using the png format.
             */
            keepTextureSourceFile: boolean;

            /**
             * Modules that need to be installed for this build. If any module listed here is not installed, the build will try to install it after onSetup and before onStart. 
             */
            requireModules: Array<string>;

            /**
             * Additional engine js files can be added to the build.
             */
            engineLibs: Array<string>;

            /**
             * For some platforms whose do not support WebAssembly, you can disable WebAssembly here.
             * 
             * After disabling, all WebAssembly libraries will be replaced with pure JavaScript libraries.
             * 
             * If you set it to "alternative", the engine will still export WebAssembly libraries, but will set task.exports.libs to pure JavaScript libraries and set task.exports.alternativeLibs to WebAssembly libraries.
             */
            disableWebAssembly: boolean | "alternative";

            /**
             * If true, the WebAssembly libraries will be compressed with Brotli. 
             */
            compressWasm: boolean;

            /**
             * Chose the rendering device.
             */
            renderDevice: "webgl" | "webgpu" | "opengl" | "metal" | "vulkan";

            /**
             * Files or folders listed here will not be deleted during the cleanup phrase if they already exist in the release folder.
             * 
             * Note: Wildcards cannot be used, names must match exactly. Paths are relative to destPath.
             * 
             * For example: ["folder", "abc.js"]
             */
            keepFilesDuringCleaning: Array<string>;

            /**
             * Set multiple filename match strings. The matched files will not be copied from the build template folder (build-templates) to the release folder.
             * 
             * Note: Can use glob pattern. Paths are relative to destPath.
             * 
             * For example: ["*.txt"]
             */
            ignoreFilesInBuildTemplate: Array<string>;

            /**
             * The script name of the subpackage entry for mini-games, default is game.js. Some platforms may use different names, such as main.js.
             */
            subpackageGameJsName: string;

            /**
             * Template content used to generate a subpackage entry. The template receives a `libs` array whose `name` values are paths relative to the entry file.
             * If the subpackage defines a main script, the rendered content is prepended to the compiled script when there are auto-loaded JavaScript plugins in the subpackage.
             */
            subpackageGameJsTemplate: string;

            /**
             * Overide the default exporter of certain assets.
             */
            customAssetExporters: Map<IAssetInfo, new () => IAssetExporter>;

            /**
             * Define an action that can be executed after the build. Currently supported actions are:
             * - Open a webpage. `serve` is the folder path relative to `destPath`, used as the root directory of the website, and can be an empty string; `open` is the file path relative to `serve`, used as the webpage to open, and can be an empty string. If you want to use https, you can set `secure` to true.
             * - Show a QR code. `serve` is the folder path relative to `destPath`, used as the root directory of the website, and can be an empty string; `QRCode` is the file path relative to `destPath`, used as the webpage to open after scanning the QR code, and can be an empty string. If you want to use https, you can set `secure` to true.
             * - Open an external url. 'open' is the url to open, and can be a local file path or a remote url. 
             * - Run a command in terminal. `runInTerminal` is a command line string.
             * @example
             * ```
             * { serve: "", open: "" } // Open the root page of the website.
             * { serve: "abc", open: "test.html" } // Open the test.html page of the website, the root directory is abc.
             * { serve: "", QRCode: "abc.apk" } // Open the test.apk page of the website by scanning the QR code.
             * { open: "https://example.com" } // Open an url.
             * { open: "index.html" } // Open an local file in the release folder.
             * { runInTerminal: "{projectPath}/abc.exe" } // Open the abc.exe in the project folder.
             * ```
             */
            runHandler: { serve?: string, open?: string, QRCode?: string, secure?: boolean, runInTerminal?: string };
        }

        export interface IAssetThumbnail {
            /**
             * Generate a thumbnail for the asset.
             * @param asset The asset to generate thumbnail for.
             * @returns The thumbnail data.
             * - String type: It is the absolute path of a png/jpg/svg file.
             * - Buffer type: It is data encoded as PNG. The recommended size is `IEditorEnv.AssetThumbnail.imageSize`.
             * - "source": Use the source image directly.
             * - null: No thumbnail is generated.
             */
            generate(asset: IAssetInfo): Promise<Buffer | string | "source" | null>;

            /**
             * Destroy the thumbnail generator.
             */
            destroy(): void;
        }

        export interface IAssetSaver {
            /**
             * Called when a resource object is being saved.
             * @param asset The asset to be saved. 
             * @param res The resource object to be saved. 
             */
            onSave(asset: IAssetInfo, res: any): Promise<void>;
        }
        export interface IAssetProcessor {
            /**
             * Called before importing an image asset.
             * @param assetImporter The asset importer. 
             */
            onPreprocessImage?(assetImporter: IImageAssetImporter): void | Promise<void>;

            /**
             * Called before importing an asset.
             * 
             * Please note that only asset types with registered importers will trigger this callback before import; otherwise, it will not be triggered. For example, importing text files will not trigger it.
             * @param assetImporter The asset importer. 
             */
            onPreprocessAsset?(assetImporter: IAssetImporter): void | Promise<void>;

            /**
             * Called after importing an image asset.
             * @param assetImporter The asset importer. 
             */
            onPostprocessImage?(assetImporter: IImageAssetImporter): void | Promise<void>;

            /**
             * Called after importing an asset.
             * 
             * Please note that only asset types with registered importers will trigger this callback after import; otherwise, it will not be triggered. For example, importing text files will not trigger it.
             * @param assetImporter The asset importer.
             */
            onPostprocessAsset?(assetImporter: IAssetImporter): void | Promise<void>;

            /**
             * Json files may have various usage, this method is used to recognize the real type of a json file, and return the type name as sub type. Return null if no special type is recognized.
             * @param headText The first 200 characters of the json file.
             * @param asset The json asset.
             * @returns The subtype name, or null when the JSON does not match a recognized subtype.
             * @example
             * ```
             * onRecognizeJson(headText: string, asset: IAssetInfo): AssetType | string {
             *     if (headText.indexOf("\"skeleton\":") != -1 && headText.indexOf("\"spine\":") != -1)
             *         return IEditorEnv.AssetType.Spine;
             *      else
             *          return null;
             * }
             * ```
             */
            onRecognizeJson?(headText: string, asset: IAssetInfo): AssetType | string | null;
        }

        export interface IAssetPreview extends IOffscreenRenderSubmit {
            /**
             * A helper scene for rendering.
             */
            readonly scene: IOffscreenRenderScene;

            /**
             * A helper sprite for rendering.
             */
            readonly sprite: Laya.Sprite;

            /**
             * Derived class should implement this method to create the preview.
             * @param asset The asset to be previewed.
             * @returns Any data that can be used by the caller.
             */
            setAsset(asset: IAssetInfo, ...args: any[]): Promise<any>;

            /**
             * Objects of this class are cached and reused, this method is called when a object is returned to the pool.
             */
            onReset(): void;

            /**
             * Change the shape of 3D object. 
             * @param shape The shape to be changed to. Such as "Box", "Sphere", "Cylinder", "Capsule", "Cone", "Plane".
             */
            changeShape(shape: string): Promise<void>;

            /**
             * Set the light on or off.
             * @param on True to turn on the light, false to turn off.
             */
            setLight(on: boolean): void;

            /**
             * Rotate the camera.
             * @param x X axis movement.
             * @param y Y axis movement.
             */
            rotate(x: number, y: number): void;

            /**
             * Destroy the preview.
             */
            destroy(): void;
        }
        export const resourcesDirName = "resources";
        export const editorResourcesDirName = "editorresources";

        export interface IPackageInfo {
            version: string;
            displayName?: string;
            resolved?: string;
            dependencies: Record<string, string>;
            contributes?: any;
        }

        export interface IAssetManager {
            /**
             * All assets in the project. The key is the asset id which is a UUID string.
             */
            readonly allAssets: Readonly<Record<string, IAssetInfo>>;

            /**
             * An asset that represents the root of the project.
             */
            readonly rootAsset: IAssetInfo;

            /**
             * Custom asset filters.
             * @example
             * ```
             * EditorEnv.assetMgr.customAssetFilters["myFilter"] = (asset: IEditorEnv.IAssetInfo) => {
             *    return asset.name.startsWith("my");
             * };
             * ```
             */
            readonly customAssetFilters: Record<string, IAssetFilter>;

            /**
             * Notifies when an asset is changed.
             */
            readonly onAssetChanged: IDelegate<(asset: IAssetInfo, flag: AssetChangedFlag) => void>;

            /**
             * All packages in the project. The key is the package name.
             */
            readonly packages: Readonly<Record<string, Readonly<IPackageInfo>>>;

            /**
             * All package names in the project. They are already sorted by dependencies.
             */
            readonly packageNames: ReadonlyArray<string>;

            /**
             * Get all assets in the specified folder.
             * @param folderAsset The folder asset.
             * @param types The types of assets to get. If not specified, all types of assets will be returned.
             * @param customFilter The custom filter name registered through `EditorEnv.assetMgr.customAssetFilters`.
             * @returns The assets.
             */
            getAllAssetsInDir(folderAsset: IAssetInfo, types?: ReadonlyArray<AssetType>, customFilter?: string): Array<IAssetInfo>;

            /**
             * Get all folders named `resources` in the project.
             */
            readonly resourceDirs: Readonly<Set<IAssetInfo>>;

            /**
             * Get all assets in all `resources` folder.
             * @param types The types of assets to get. If not specified, all types of assets will be returned.
             * @param customFilter The custom filter name registered through `EditorEnv.assetMgr.customAssetFilters`.
             * @returns The assets.
             */
            getAllAssetsInResourceDir(types?: ReadonlyArray<AssetType>, customFilter?: string): Array<IAssetInfo>;

            /**
             * Get all possible `resources` or `editorResources` folders that may contain the specified path.
             * @param path A folder path relative to the assets folder.
             * @returns The folders.
             */
            getPossibleResourceDirs(path: string): Array<IAssetInfo>;

            /**
             * Get all user assets in the project. User assets are assets in the `assets`, `src`, `packages` folders.
             */
            getUserAssets(): Array<IAssetInfo>;

            /**
             * Get children assets of the specified folder.
             * @param folderAsset The folder asset.
             * @param types The types of assets to get. If not specified, all types of assets will be returned.
             * @param matchSubType Whether to return assets whose subtypes match the types parameter.
             * @param customFilter The custom filter name registered through `EditorEnv.assetMgr.customAssetFilters`.
             * @returns The assets.
             */
            getChildrenAssets(folderAsset: IAssetInfo, types: ReadonlyArray<AssetType>, matchSubType?: boolean, customFilter?: string): Array<IAssetInfo>;

            /**
             * Find assets by keyword.
             * @param keyword The keyword to search.
             * @param types The types of assets to get. If not specified, all types of assets will be returned.
             * @param matchSubType Whether to return assets whose subtypes match the types parameter.
             * @param customFilter The custom filter name registered through `EditorEnv.assetMgr.customAssetFilters`.
             * @param limit The maximum number of assets to return. Default is 5000.
             * @returns The assets.
             */
            findAssets(keyword: string, types?: ReadonlyArray<AssetType>, matchSubType?: boolean, customFilter?: string, limit?: number): Array<IAssetInfo>;

            /**
             * Find assets by keyword.
             * @param keyword The keyword to search. 
             * @param types The types of assets to get. If not specified, all types of assets will be returned. 
             * @param options The options.
             * @returns The assets. 
             */
            findAssets(keyword: string, types?: ReadonlyArray<AssetType | string>, options?: IFindAssetsOptions): Array<IAssetInfo>;

            /**
             * Filter a collection of assets.
             * @param assetIds The asset ids to filter.
             * @param types The types of assets to get. If not specified, all types of assets will be returned.
             * @param matchSubType Whether to return assets whose subtypes match the types parameter.
             * @param customFilter The custom filter name registered through `EditorEnv.assetMgr.customAssetFilters`.
             * @returns The assets.
             */
            filterAssets(assetIds: ReadonlyArray<string>, types?: ReadonlyArray<AssetType>, matchSubType?: boolean, customFilter?: string): Array<IAssetInfo>;

            /**
             * Get an asset by its id or path.
             * @param idOrPath The id or path of the asset.
             * @param allowResourcesSearch Whether to follow the resources search rules.
             * @returns The asset, or null if no matching asset is found.
             * @example
             * ```
             * EditorEnv.assetMgr.getAsset("12345678-1234-1234-1234-1234567890ab");
             * EditorEnv.assetMgr.getAsset("textures/texture.png"); // path is relative to the assets folder
             * EditorEnv.assetMgr.getAsset("resources/textures/texture.png", true); // search in all resources folders
             * ```
             */
            getAsset(idOrPath: string, allowResourcesSearch?: boolean): IAssetInfo | null;

            /**
             * Get all assets of the specified types.
             * @param types The types of assets to get. If not specified, all types of assets will be returned.
             * @param matchSubType Whether to return assets whose subtypes match the types parameter.
             * @returns The assets.
             */
            getAssetsByType(types?: ReadonlyArray<AssetType>, matchSubType?: boolean): ReadonlyArray<IAssetInfo>;

            /**
             * Create a new asset with the specified path. If the asset already exists, throw an error when allowOverwrite is false. When allowOverwrite is true or null, return the existing resource.
             * @param filePath The path of the asset. The path is relative to the assets folder.
             * @param metaData The metadata of the asset.
             * @param allowOverwrite Whether to allow overwriting the existing asset. Default is true.
             * @returns The asset.
             */
            createFile(filePath: string, metaData?: any, allowOverwrite?: boolean): Promise<IAssetInfo>;

            /**
             * Create a new folder asset with the specified path. If the folder already exists, the existing folder asset will be returned.
             * @param folderPath The path of the folder. The path is relative to the assets folder.
             * @returns The asset.
             */
            createFolder(folderPath: string, checkLetterCase?: boolean): Promise<IAssetInfo>;

            /**
             * @deprecated Use 'createFile' instead.
             */
            createFileAsset(filePath: string, metaData?: any, allowOverwrite?: boolean): IAssetInfo;

            /**
             * @deprecated Use 'createFolder' instead.
             */
            createFolderAsset(folderPath: string): IAssetInfo;

            /**
             * Get shader asset by its shader name. Shader name may be different from the asset name.
             * @param shaderName The name of the shader.
             * @returns The shader asset.
             */
            getShader(shaderName: string): IAssetInfo;

            /**
             * Get all shader assets. The key is the shader name.
             * @returns The shader assets.
             */
            getAllShaders(): Record<string, IAssetInfo>;

            /**
             * Get i18n settings asset by id.
             * @param id The id of the i18n settings. The id is not the asset id.
             * @returns The asset.
             */
            getI18nSettings(id: string): IAssetInfo;

            /**
             * Get all i18n settings assets. The key is the i18n settings id.
             * @returns The i18n settings assets.
             */
            getAllI18nSettings(forGUI?: boolean): Record<string, IAssetInfo>;

            /**
             * Get asset type by file extension.
             * @param ext The file extension.
             * @returns The asset type.
             * @example
             * ```
             * EditorEnv.assetMgr.getAssetTypeByFileExt("png");
             * //=> AssetType.Texture
             * ```
             */
            getAssetTypeByFileExt(ext: string): AssetType;

            /**
             * Get file extensions by asset type.
             * @param type The asset type.
             * @returns The file extensions.
             * @example
             * ```
             * EditorEnv.assetMgr.getFileExtByAssetType(IEditorEnv.AssetType.Texture);
             * //=> ["png", "jpg", "jpeg", "astc", "ktx", "ktx2", "dds", "pvr", "hdr", "tif", "tiff", "tga", "rendertexture"]
             * ```
             */
            getFileExtByAssetType(type: AssetType): Array<string>;

            /**
             * Set metadata of the asset.
             * 
             * The difference between setting meta data with this method and directly writing to the meta file is that this method will only trigger reimport when you modify the data in the importer section of the meta. Modifying other data will not trigger reimport.
             * @param asset The asset.
             * @param data The metadata.
             */
            setMetaData(asset: IAssetInfo, data: any): Promise<void>;

            /**
             * Get absolute path of the asset.
             * @param asset The asset.
             * @returns The absolute path.
             */
            getFullPath(asset: IAssetInfo): string;

            /**
             * Convert a path relative to the assets folder to an absolute path.
             * @param path The relative path to the assets folder.
             * @returns The absolute path.
             */
            toFullPath(path: string): string;

            /**
             * Convert the path to the relative path.
             * @param path The path, which is absolute.
             * @returns The relative path to the assets folder, or if it is in internal folders, prefix with `~/`.
             */
            toRelativePath(path: string): string;

            /**
             * Get absolute path of the scene file of a prefab.
             * @param asset The prefab asset.
             * @returns The absolute path of the scene file.
             * @example
             * ```
             * EditorEnv.assetMgr.getPrefabSourcePath(aFbxAsset);
             * //=> "/path/to/project/library/0a/0a0a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a0a.lh"
             * ```
             */
            getPrefabSourcePath(asset: IAssetInfo): string;

            /**
             * Import an asset.
             * @param asset The asset to import.
             * @param args Additional arguments for the importer.
             */
            importAsset(asset: IAssetInfo, args?: ReadonlyArray<string>): void;

            /**
             * Unpack a model asset. A model asset is a FBX, glTF, or other model file.
             * 
             * The files in the model will be extracted to a folder named model name + "-unpacked", and this folder will be in the same directory as the model file.
             * @param asset The model asset.
             */
            unpackModel(asset: IAssetInfo): Promise<void>;

            /**
             * Read metadata of the asset.
             * @param asset The asset.
             * @param ignoreCache Whether to ignore the cache.
             * @returns The metadata.
             */
            readMeta(asset: IAssetInfo, ignoreCache?: boolean): any;

            /**
             * Read metadata of the asset asynchronously.
             * @param asset The asset. 
             * @param ignoreCache Whether to ignore the cache.
             * @returns The metadata. 
             */
            readMetaAsync(asset: IAssetInfo, ignoreCache?: boolean): Promise<any>;

            /**
             * Write metadata of the asset.
             * @param asset The asset.
             * @param meta The metadata.
             */
            writeMeta(asset: IAssetInfo, meta: any): void;

            /**
             * Write metadata of the asset asynchronously.
             * @param asset The asset. 
             * @param meta The metadata.
             */
            writeMetaAsync(asset: IAssetInfo, meta: any): Promise<void>;

            /**
             * Whether the asset manager is busying with importing assets.
             */
            get busy(): boolean;

            /**
             * Wait until the specified assets are ready (imported). An error will be thrown if any of the assets fail to import.
             * @param paths The paths of the assets to wait. The paths are relative to the assets folder.
             */
            waitForAssetsReady(paths: string[]): Promise<void>;

            /**
             * If there is an ongoing import task, wait for the import task to complete.
             */
            flushChanges(): Promise<void>;
        }

        export interface IAssetImporterOptions {
            /**
             * Importer version. This is used to handle the compatibility of the importer.
             * 
             * If the importer is changed, the version should be increased. Then the engine will call the importer to re-import the asset.
             */
            version?: number;

            /**
             * Execution order of the importer. The lower the value, the earlier the importer runs. Default is 0.
             * 
             * Suggestions: If the importer depends on other importers, set the value to a higher number. 
             */
            sortingOrder?: number;

            /**
             * A positive number used to calculate the progress of the importer. The higher the value, the more time the importer takes. Default is 1.
             */
            weight?: number;

            /**
             * How many tasks of this importer can be executed in parallel. Default is 100.
             */
            numParallelTasks?: number;

            /**
             * Reimport the asset when the name of the asset is changed. Default is false.
             */
            runAfterRenaming?: boolean;

            /**
             * Reimport the asset when the path of the asset is changed. Default is false.
             */
            runAfterMoving?: boolean;
        }

        export interface IAssetImporter {
            /**
             * The asset to be imported.
             */
            readonly asset: IAssetInfo;

            /**
             * The parent asset of the asset to be imported.
             */
            readonly parentAsset: IAssetInfo;

            /**
             * If the asset has any sub-assets, store them here.
             */
            readonly subAssets: ReadonlyArray<ISubAssetInfo>;

            /**
             * Absolute path of the asset.
             */
            readonly assetFullPath: string;

            /**
             * Whether the asset is a new imported asset. If false, the asset is in a re-import process.
             */
            readonly isNewAsset: boolean;

            /**
             * The metadata of the asset.
             */
            readonly metaData: Record<string, any>;

            /**
             * The settings of the asset, which is defined in the section of "importer" in the asset's meta file.
             */
            readonly settings: Record<string, any>;

            /**
             * Additional arguments for the importer.
             */
            readonly importArgs: ReadonlyArray<string>;

            /**
             * Absolute directory where sub-assets are saved.
             */
            readonly subAssetLocation: string;

            /**
             * If you need a temporary directory, use this path.
             */
            readonly tempPath: string;

            handleImport(): Promise<void>;

            /**
             * If you need to create a sub-asset, call this method in the very beginning to cleanup the last generated files.
             */
            clearLibrary(): void;

            /**
             * Create a sub-asset.
             * @param fileName File name of the sub-asset. e.g. "texture.png"
             * @param id ID of the sub-asset. The ID is unique within the asset's sub-assets. Usually you do not need to provide it because one is generated automatically.
             * @returns The sub-asset info.
             */
            createSubAsset(fileName: string, id?: string): ISubAssetInfo;

            /**
             * Create an asset in the asset library.
             * @param filePath A path relative to the assets folder.
             * @param metaData Metadata of the asset.
             * @returns The asset info.
             */
            createAsset(filePath: string, metaData?: any): IAssetInfo;

            /**
             * Set sub type of the asset.
             * 
             * Some assets have a type and a sub type. Such as a json asset has a type of `Json` and a sub type of `Spine` if it is a description file of spine.
             * @param value sub type of the asset. 
             */
            setSubType(value: AssetType | string): void;

            /**
             * If this asset can generate types, call this method to register them.
             * 
             * Only last call of this method will take effect.
             * @param types The types to be registered.
             */
            addTypesToRegistry(types: ReadonlyArray<FTypeDescriptor>): void;

            /**
             * Set shader name of the asset. If multiple assets have the same shader name, the first one will be used.
             * @param shaderName The name of the shader.
             * @param typeDef The type definition of the shader.
             */
            setIsShader(shaderName: string, typeDef: FTypeDescriptor): void;

            /**
             * Get the path relative to the assets folder by the asset ID.
             * @param assetId 
             * @returns The path relative to the assets folder, or null if the asset ID cannot be resolved.
             */
            getAssetPathById(assetId: string): string | null;

            /**
             * Find an asset by a relative path, starting from the folder where the current asset is located. Null if not found.
             * @param filePath A relative path.
             * @param predicate An optional filter function.
             * @returns The asset info, or null if no matching asset is found.
             * @example
             * ```
             * let asset = this.findAsset("textures/texture.png");
             * ```
             */
            findAsset(filePath: string, predicate?: (asset: IAssetInfo) => boolean): IAssetInfo | null;

            /**
             * Report the progress of the importer. The value should be between 0 and 100.
             * @param progress The progress value. The value should be between 0 and 100.
             */
            setProgress(progress: number): void;
        }

        export interface IImageAssetImporter extends IAssetImporter {
            /**
             * Texture settings.
             */
            readonly settings: ITextureSettings;
        }

        export interface IAssetExporterOptions {
            /**
             * If a exporter has this flag set to true, assets handled by this exporter will not be exported, and the handleExport method will not be called.
             */
            exclude?: boolean;
        }

        export interface IAssetExporter {
            /**
             * The asset to be exported.
             */
            readonly asset: IAssetInfo;

            /**
             * Get the parent asset of the current asset.
             */
            readonly parentAsset: IAssetInfo;

            /**
             * Some file extensions cannot be used due to restrictions of mini-game platforms or servers. 
             * Here you can set up a mapping table to map the original extensions to new extensions.
             * @example
             * ```
             * this.fileExtensionOverrides["abc"] = "abc.json";
             * ```
             */
            readonly fileExtensionOverrides: Record<string, string>;

            /**
             * A object that contains the export information.
             */
            readonly exportInfo: IAssetExportInfo;

            /**
             * Used to log messages.
             */
            readonly logger: ILogger;

            /**
             * Used to analyze the prefab data.
             */
            readonly prefabDataAnalyzer: IPrefabDataAnalyzer;

            /**
             * Global export options.
             */
            readonly toolOptions: IExportAssetToolOptions;

            /**
             * Handle the export of the asset.
             */
            handleExport(): Promise<void>;
        }
        export interface IAssetDependencyTool {
            /**
             * Query the dependencies of the given assets.
             * @param assets The assets to query. 
             * @param includeIndirectLinks Whether to include indirect dependencies.
             * @returns A promise that resolves to a tuple containing an array of asset info objects representing the dependencies and an array of asset IDs or paths that were not found.
             */
            queryDependency(assets: ReadonlyArray<IAssetInfo>, includeIndirectLinks?: boolean): Promise<[Array<IAssetInfo>, Array<string>]>;

            /**
             * Query the assets that reference the given asset IDs or paths.
             * @param assets The asset IDs or paths to query.
             * @returns A promise that resolves to an array of asset info objects representing the referencing assets. 
             */
            queryReference(assets: ReadonlyArray<string>): Promise<Array<IAssetInfo>>;

            /**
             * Replace references in assets based on the given replacements mapping.
             * @param replacements A mapping of original asset IDs or paths to new asset IDs or paths. 
             * @param targetAssets An optional set of assets to limit the replacement operation to.
             * @returns A promise that resolves to an array of asset info objects representing the assets that were modified.
             */
            replaceReference(replacements: Record<string, string>, targetAssets?: ReadonlySet<IAssetInfo>): Promise<Array<IAssetInfo>>;
        }

        export type FEnumDescriptor = {
            name: string,
            value: any,
            extend?: FEnumDescriptor,
            [index: string]: any,
        }[] | any[] | string;

        export type WorldType = "2d" | "3d" | "gui" | null;
        export type FPropertyType = string | [FPropertyType] | ["Record", FPropertyType];

        /**
         * Property descriptor. 
         */
        export interface FPropertyDescriptor {
            /**
             * Property name 
             */
            name: string;
            /**
             * Property type.
             * Basic types include: number, string, boolean, any.
             * Composite types include: arrays, expressed as [number]; dictionaries, expressed as ["Record", number], where the first element is fixed as "Record" and the second element is the actual type.
             * Other names are types registered in the typeRegistry.
             * If type is not provided, it means it is only used for UI display and does not correspond to actual data.
             */
            type?: FPropertyType;

            /**
             * The initial value of this property in the prototype. This value is also used for comparison during serialization; if they are the same, this property will not be serialized. Therefore, it is essential to ensure that the value set here is the initial value of the variable in the class.
             */
            default?: any;

            /**
             * Dislay title. If not provided, the name will be used.
             * 
             * Use "i18n:&lt;key&gt;" or "i18n:&lt;file-id&gt;:&lt;key&gt;" to specify the key of the internationalization string.
             */
            caption?: string;

            /**
             * Whether to hide the title. Default is "normal".
             * - normal: display the title.
             * - hidden: hide the title, but the title will still occupy space.
             * - none: hide the title and the space it occupies.
             */
            captionDisplay?: "normal" | "hidden" | "none";

            /**
             * Tooltip text.
             */
            tips?: string;

            /**
             * A catalog is a composite display control in the Inspector, featuring a title bar and a content area that can be collapsed by clicking the title bar.
             * 
             * Setting the same catalog value for multiple properties will display them within the same catalog.
             */
            catalog?: string;

            /**
             * This is a URL value. When set, a help button will appear on the right side of the Catalog's title bar, which opens this URL when clicked.
             */
            catalogHelp?: string;

            /**
             * Text displayed on the catalog title bar. Defaults to using the catalog name.
             * 
             * Use "i18n:&lt;key&gt;" or "i18n:&lt;file-id&gt;:&lt;key&gt;" to specify the key of the internationalization string.
             */
            catalogCaption?: string;

            /**
             * Display order of the catalog. The smaller the value, the earlier it is displayed. If not provided, it follows the order of the properties.
             */
            catalogOrder?: number;

            /**
             * Inspector for editing this property. Built-in inspectors include:
             * - number : Number input.
             * - string : String input. Defaults to single-line input; if multiline is needed, activate the multiline option.
             * - boolean : Checkbox.
             * - color : A color box + color palette + color picker.
             * - vec2 : Combination of XY inputs.
             * - vec3 : Combination of XYZ inputs.
             * - vec4 : Combination of XYZW inputs.
             * - asset : Resource selector.
             * - gradient : Gradient editor.
             * - curve : Curve editor.
             * - matrix3 : 3x3 matrix inputs.
             * - matrix4 : 4x4 matrix inputs.
             * - TabBar : Tab control. Display properties grouped in different Tab pages.
             * - Group : Make a group of properties with an indent and collapsible.
             * - RadioGroup : Display the captions of multiple properties using a dropdown box and select the property whose current value is true. The property value is converted to a boolean using `!!`.
             * - Info : Display a text block, useful for displaying help information.
             * - Buttons : Display a button or several buttons.
             * - File : File or directory selector.
             * 
             * Generally, this option does not need to be set, as the editor will automatically choose the appropriate control based on the property type. However, in some cases, it may be necessary to forcefully specify it.
             * For example, if the data type is Vector4 but it actually represents a color, using the default control for editing Vector4 is not suitable, and it needs to be set to "color" here.
             * 
             * Explicitly setting inspector to null will not construct an inspector for the property. This is different from setting hidden to true. Hidden being true means the inspector is created but not visible,
             * while inspector being null means it is not created at all.
             */
            inspector?: string;

            /**
             * A boolean value or a function or an expression that determines whether this property is hidden.
             * 
             * boolean: True means hidden, false means visible.
             * 
             * string: For example, "!data.a && !data.b" means that this property is hidden when both properties a and b are empty. There are two implicit variables: data, which is the current data, and field, which is the IPropertyField interface.
             * 
             * function: A function to do the test.
             */
            hidden?: boolean | string | ((data: any, field: IPropertyField) => boolean);

            /**
             * A boolean value or a function or an expression that determines whether this property is read-only.
             * 
             * boolean: True means read-only, false means writable.
             * 
             * string: For example, "!data.a && !data.b" means that this property is read-only when both properties a and b are empty. There are two implicit variables: data, which is the current data, and field, which is the IPropertyField interface.
             * 
             * function: A function to do the test.
             */
            readonly?: boolean | string | ((data: any, field: IPropertyField) => boolean);

            /**
             * A function or an expression that validates the property value.
             *
             * string: For example, "data.a". If data.a is a string, it indicates validation failure, and this string is displayed as an error message; if it is not a string, it indicates validation success.
             * There are three implicit variables: data, which is the current data; value, which is the current user input value; and field, which is the IPropertyField interface.
             * 
             * function: A function to do the test. If the return value is a string, it indicates validation failure, and this string is displayed as an error message; if it is not a string, it indicates validation success.
             */
            validator?: string | ((data: any, value: any, field: IPropertyField) => any);

            /**
             * A boolean value or a function or an expression that determines whether this property is required.
             * 
             * boolean: True means required, false means optional.
             * 
             * string: For example, "!!data.a". If !!data.a is true, it indicates that this property is required.
             * 
             * function: A function to do the test. 
             */
            required?: boolean | string | ((data: any, value: any, field: IPropertyField) => boolean);

            /**
             * Whether the property is serializable. If false, the property will not be serialized. Default is true.
             * 
             * boolean: False means not serializable, true means serializable.
             * 
             * string: For example, "!!data.a". If !!data.a is true, it indicates that this property is serializable.
             */
            serializable?: boolean | string;
            /**
             * When the property does not participate in serialization, if its data may be affected by another serializable property, fill in the name of other property here.
             * 
             * This is usually used to determine whether the prefab property is overridden.
             */
            affectBy?: string;
            /**
             * The property is only effective in the editor and will be stripped in the build.
             */
            stripInBuild?: boolean;

            /**
             * Whether the text input is multiline. Default is false.
             */
            multiline?: boolean;

            /**
             * Whether the input is a password. Default is false.
             */
            password?: boolean;

            /**
             * If true, the text input will trigger a submit event with each character typed; otherwise, it will only submit when it loses focus. Default is false.
             */
            submitOnTyping?: boolean;

            /**
             * If the property is of type string, this is the placeholder text for the input field; if it is of type boolean, this is the title for the checkbox. Default is empty.
             */
            prompt?: string;

            /**
             * Applicable to string type, indicating that the text supports multiple languages. In this case, the text input box will add the function of selecting the language key value. Default is false.
             */
            multiLanguage?: boolean;

            /**
             * The property will be displayed as a dropdown for the user to select from, and this is the data source for the dropdown.
             * 
             * The property can be of type number or string. If it is of type number, it represents the index of the data source; if it is of type string, it represents the value of the data source.
             * 
             * The data source can take various forms:
             * - An array of strings: e.g., ["a", "b", "c"].
             * - An array of objects: e.g., [{name: "A", value: "a"}, {name: "B", value: "b"}].
             * - A string: This represents the name of another property, whose value is an array of strings or objects. Using this method, cascading dropdowns can also be achieved.
             * 
             * Example of cascading dropdowns 1:
             * ```
             * {
             *    name: "province",
             *    type: "string",
             *    enumSource: [
             *        { name: "Guangdong", value: "gd", extend: [
             *            { name: "Guangzhou", value: "gz" }, 
             *            { name: "Shenzhen", value: "sz" }
             *        ]},
             * 
             *        { name: "Hunan", value: "hn", extend: [
             *            { name: "Changsha", value: "cs" },
             *            { name: "Xiangtan", value: "xt" }
             *        ]}
             *     ]
             * },
             * 
             * {
             *    name: "city",
             *    type: "string",
             *    enumSource: "province"
             * },
             * ```
             * In this way, when Guangdong is selected for province, the dropdown for city will only have Guangzhou and Shenzhen.
             * 
             * Example of cascading dropdowns 2:
             * ```
             * {
             *    name: "province",
             *    type: "string",
             *    enumSource: [
             *        { name: "Guangdong", value: "gd", 
             *            city: [
             *                { name: "Guangzhou", value: "gz" }, 
             *                { name: "Shenzhen", value: "sz" }
             *            ],
             *            river: [
             *                { name: "Pearl River", value: "pr" },
             *                { name: "Dongjiang River", value: "dj" }
             *            ] 
             *        },
             * 
             *        { name: "Hunan", value: "hn", 
             *            city: [
             *                { name: "Changsha", value: "cs" },
             *                { name: "Xiangtan", value: "xt" }
             *            ],
             *            river: [
             *                { name: "Xiangjiang River", value: "xj" },
             *                { name: "Zijiang River", value: "zj" }
             *            ]
             *        }
             *    ]
             * },
             * 
             * {
             *     name: "city",
             *     type: "string",
             *     enumSource: "province"
             * },
             * 
             * {
             *     name: "river",
             *     type: "string",
             *     enumSource: "province"
             * } 
             * ```
             * In this way, when Guangdong is selected for province, the dropdown for city will only have Guangzhou and Shenzhen, and the dropdown for river will only have Pearl River and Dongjiang River.
             */
            enumSource?: FEnumDescriptor;

            /**
             * Hide this property when the data source is empty.
             */
            hideIfEnumSourceEmpty?: boolean;

            /**
             * Whether to reverse the boolean value. For example, when the property value is true, the UI renders it as false.
             */
            reverseBool?: boolean;

            /**
             * Whether null values are allowed. Default is true. Sometimes it is necessary to explicitly set it to true, e.g. to display a checkbox for a color/vec2/vec3/vec4 inspector to determine whether the property value is null.
             */
            nullable?: boolean;

            /**
             * For a property that can switch between null and non-null, when switching from a null value to a non-null value, the value here will be used.
             */
            nonNullDefault?: any;

            /**
             * Minimum value for numbers. Default is -Infinity.
             */
            min?: number;

            /**
             * Maximum value for numbers. Default is Infinity.
             */
            max?: number;

            /**
             * Range of values, equivalent to setting min and max at once.
             */
            range?: [number, number];

            /**
             * The amount by which the value changes each time when changing the value by dragging. Default is 0.01.
             * 
             * If fractionDigits is set, the step will be adjusted to 1 / 10 ^ fractionDigits if it is less than that value.
             */
            step?: number;

            /**
             * Number of decimal places. Default is 3.
             */
            fractionDigits?: number;

            /**
             * Display the number as a percentage, for example, 0.01 will be displayed as 1%. Default is false.
             */
            percentage?: boolean;

            /**
             * Applicable to array type properties. Indicates that the array is of fixed length. Default is false.
             */
            fixedLength?: boolean;

            /**
             * Applicable to array type properties. Minimum length of the array. Default is null.
             */
            minArrayLength?: number;

            /**
             * Applicable to array type properties. Maximum length of the array. Default is null.
             */
            maxArrayLength?: number;

            /**
             * Applicable to array type properties. If not provided, it means all operations are allowed on the array; if provided, only the listed operations are allowed.
             * - append: Add an element to the end of the array.
             * - insert: Insert an element at a specified position.
             * - delete: Delete an element.
             * - move: Move an element to a specified position.
             */
            arrayActions?: Array<"append" | "insert" | "delete" | "move">;

            /**
             * Applicable to array type properties. Defines an optional header and proportional width for each column
             * rendered by a compound array-element inspector. Width values are percentages and are normalized when
             * their total is not exactly 100.
             *
             * Use "i18n:<key>" or "i18n:<file-id>:<key>" for localized captions.
             */
            arrayColumns?: Array<{ caption: string; width: number }>;

            /**
             * Applicable to array or dictionary type properties. Here you can define the properties of array/dictionary elements.
             */
            elementProps?: Partial<FPropertyDescriptor>;

            /**
             * Applicable to dictionary type properties. Indicates that the dictionary uses a specified set of fixed key values.
             */
            fixedKeys?: Array<string>;

            /**
             * Applicable to color type properties. Indicates whether to provide transparency (alpha) value modification. For properties of type string or Color, the default is true; for properties of type number, the default is false.
             */
            showAlpha?: boolean;

            /**
             * @deprecated Use 'nonNullDefault' instead.
             */
            defaultColor?: any;

            /**
             * @deprecated Explicitly set 'nullable' to true to display a checkbox.
             */
            colorNullable?: boolean;

            /**
             * Applicable to color type properties. When storing hexadecimal color values, this property determines the position of each channel. If the color value does not include an alpha channel, the default value is 'rgb'; if it does, the default value is 'argb'.
             */
            colorFormat?: 'rgb' | 'argb' | 'abgr';

            /**
             * Applicable to object type properties. If true, hides the object's title, and the display indentation of the object's properties will be reduced by one level.
             * 
             * ```
             * UI demonstration when hideHeader is false:
             * + Object
             *  Property1
             *  Property2
             * 
             * UI demonstration when hideHeader is true:
             * Property1
             * Property2
             * ```
             */
            hideHeader?: boolean;

            /**
             * Applicable to object type properties. Allows selecting a type from a dropdown menu when creating an object.
             * 
             * If explicitly set to null, the menu is disabled. By default, a menu for creating the base class is displayed. 
             * 
             * There are two ways to customize the menu:
             * - Array<string>: The array contains the names of the types that can be created. If any type name ends with "*"", the array will include all derived classes of that type.
             * - Function: The function is responsible to do anything you want.
             */
            createObjectMenu?: Array<string> | ((sender: gui.Widget, field: IPropertyField, insertIndex?: number) => void);

            /**
             * Applicable to object type properties. Indicates that this property type has struct-like behavior, meaning it is always used as a whole.
             * For example, if the value of property b of object obj is a1, and a1 is an instance of type T with structLike set to true, then when a1's properties change, the editor will simultaneously call obj.b = a1.
             * The default is false.
             */
            structLike?: boolean;

            /**
             * Indicates that this property references an asset.
             */
            isAsset?: boolean;

            /**
             * Applicable to asset type properties. Multiple asset types are separated by commas, such as "Image,Audio". Refer to IEditor.AssetType for available values.
             */
            assetTypeFilter?: string;

            /**
             * If isAsset is true and property is of type string, this option determines whether the property value is the original path of the asset or in the format res://uuid. If true, it is the original path of the asset. The default is false.
             */
            useAssetPath?: boolean;

            /**
             * Applicable to asset type properties. Indicates whether internal assets can be selected. Default is true.
             */
            allowInternalAssets?: boolean;

            /**
             * Applicable to asset type properties. Indicates whether GUI assets can be selected. Default is false.
             */
            allowInternalGUIAssets?: boolean;

            /**
             * Applicable to asset type properties. Allows setting a custom filter. The filter needs to be registered through EditorEnv.assetMgr.customAssetFilters.
             */
            customAssetFilter?: string;

            /**
             * Applicable to properties of type Node or Component. It sets an alternative property name. During serialization, the node's serialized data will be saved to the specified property, and the node itself will no longer be serialized into its parent node tree. During deserialization, the opposite operation is performed.
             *
             * @example
             * ```
             * {
             *     name: "itemNode",
             *     type: "Sprite",
             *     toTemplate: "itemNodeData"
             * },
             * 
             * {
             *     name : "itemNodeData",
             *     type : "any",
             * }
             *
             * ```
             */
            toTemplate?: string;

            /**
             * Applicable to properties of type Node or Component. It sets a filter for the node/component types that can be selected. If not provided, all node types can be selected.
             */
            nodeTypeFilter?: Array<string>;

            /**
             * Indicates whether the property is writable. The default is true. If set to false, the property is read-only.
             * 
             * This usually refers to a property that has only a getter and no setter.
             */
            writable?: boolean;

            /**
             * By default, properties are arranged in the order they are defined, but this can be adjusted through this option.
             * - first: The property is displayed at the beginning.
             * - last: The property is displayed at the end.
             * - before xxx: The property is displayed before the specified property.
             * - after xxx: The property is displayed after the specified property.
             */
            position?: string;

            /**
             * Adds indentation, measured in levels, not pixels.
             */
            addIndent?: number;

            /**
             * Default collapsed state of child properties.
             */
            collapsed?: boolean;

            /**
             * Indicates that the property is private. Private properties are not displayed in the Inspector but are serialized. Unlike inspector=null, private data is not transferred from the scene process to the UI process.
             */
            "private"?: boolean;

            /**
             * If true, the property is always written during serialization. Otherwise, it is compared with the default value, and if they are the same, it is not written. Default is false.
             */
            forceWriteDefault?: boolean;

            /**
             * If true, the root node of the prefab instance will always write this property during serialization, regardless of whether it is overridden. This also means that this property will not appear in the override list. Default is false.
             */
            forceWriteInPrefabRoot?: boolean;

            /**
             * Indicates that this property is not written to the prefab file when it is the root node of the prefab template. Default is false.
             */
            forInstanceOnly?: boolean;

            /**
             * Indicates whether the property can be edited in multi-selection mode. Default is true.
             */
            allowMultipleObjects?: boolean;

            /**
             * Indicates that the property is not displayed in the property list of derived classes. Default is false.
             */
            hideInDeriveType?: boolean;

            /**
             * Indicates that the property is not allowed to reset to default by the "Reset Default" menu. Default is false.
             */
            disableReset?: boolean;

            /**
             * Calls an additional function of the object when the property changes. This is the function name.
             * The function prototype is func(key?:string):void. The key is passed when changing internal properties of a member.
             * For example, when changing an element of an array, the key is the index of the element, and when changing a element of a dictionary, the key is the key of the element.
             */
            onChange?: string;

            /**
             * Additional options. The meaning of these options depends on the inspector used.
             */
            options?: Record<string, any>;
        }

        export type CatalogBarStyle = "normal" | "hidden" | "transparent";

        /**
         * Type descriptor.
         */
        export interface FTypeDescriptor {
            /**
             * Type name.
             */
            name: string;

            /**
             * Help document URL.
             */
            help?: string;

            /**
             * Title. If not provided, the name will be used.
             */
            caption?: string;

            /**
             * If provided, the type will be displayed as a menu item in the specified menu.
             * 
             * If the type is a component, the type will be displayed in the "Add Component" dialog.
             * 
             * If the type is a node, the type will be displayed in the context menu of the hierarchy panel.
             * 
             * If the type is a component and the inHierarchyMenu option is set to true, the type will be displayed in the context menu of the hierarchy panel.
             * 
             * Use a comma and a number to specify the position of the menu item. For example, "2D,0" means the first item in the "2D" menu.
             * 
             * It can also be an i18n key, such as "i18n:MyKey", in this case, the menu id will be the value of the key, and the menu label will be the translation of the key.
             * 
             * @example
             * ```
             * menu: "2D"
             * menu: "2D,0"
             * menu: "i18n:MyKey"
             * ```
             */
            menu?: string;

            /**
             * When this type is clicked in the menu to create a new node, the name of the new node.
             */
            newNodeName?: string;

            /**
             * Default file name without extension when this asset type is created from the Project/Create menu.
             */
            newAssetName?: string;

            /**
             * Icon of the type.  Images are generally placed in the editorResources directory or its subdirectories, and then referenced using a path starting from editorResources, such as "editorResources/my-plugin/icon.png".
             */
            icon?: string;

            /**
             * Script path. The value if not empty only if the type is registered by a typescript file.
             */
            scriptPath?: string;

            /**
             * Indicates that this type has struct-like behavior, meaning it is always used as a whole.
             * 
             * For example, if the value of property b of object obj is a1, and a1 is an instance of type T with structLike set to true, then when a1's properties change, the editor will simultaneously call obj.b = a1.
             * 
             * The default is false.
             */
            structLike?: boolean;

            /**
             * Base class name. It must be a type in the typeRegistry.
             */
            base?: string;

            /**
             * An object that contains the initial values of the properties.
             * 
             * This initial value only takes effect when the object is manually created from the UI.
             */
            init?: any;

            /**
             * Property definitions.
             */
            properties: Array<FPropertyDescriptor>;

            /**
             * Inspector for editing this type. 
             * 
             * Generally, this option does not need to be set, as the editor will automatically choose the appropriate control based on the type. However, in some cases, it may be necessary to forcefully specify it.
             */
            inspector?: string;

            /**
             * Whether it is an engine symbol. Default is false.
             * 
             * In the language settings of the preferences, if "Do not translate engine symbols" is checked, types with this option set to true will not be localized.
             */
            isEngineSymbol?: boolean;

            /**
             * Whether it is an asset reference. Default is false.
             */
            isAsset?: boolean;

            /**
             * Effective when isAsset is true. Multiple asset types are separated by commas, such as "Image,Audio". Refer to IEditor.AssetType for available values.
             */
            assetTypeFilter?: string;

            /**
             * Effective when isAsset is true. When an instance of the asset is referenced by a field in the inspector, setting it to true allows the properties of the resource to be displayed inline. Similar to the display effect of materials. Default is false.
             */
            allowInpectInline?: boolean;

            /**
             * Applicable to Component, whether it is allowed to execute in the Editor. Default is false.
             */
            runInEditor?: boolean;

            /**
             * Applicable to Component, whether it is allowed to add this type of component multiple times to the same node. Default is false.
             */
            allowMultipleComponent?: boolean;

            /**
             * Applicable to Component, when AddComponent is used, it also adds dependent Components.
             */
            requireComponents?: Array<string>;

            /**
             * Applicable to Component, when true, it hides the enable checkbox and disables the "Remove Component" menu item.
             */
            noRemoveComponent?: boolean;

            /**
             * Indicates whether this type belongs to 3D or 2D. For example, if it is a 3D type, it will not be displayed in the menu of a 2D scene.
             * - 2d: 2D type.
             * - 3d: 3D type.
             * - gui: Editor GUI type.
             * - null: No restrictions.
             */
            worldType?: WorldType;

            /**
             * If true, and the menu attribute is defined, this component will also appear in the new object menu of the hierarchy panel.
             */
            inHierarchyMenu?: boolean;

            /**
             * For use with Node and Component. When creating a new Node or adding a Component, automatically add the dependent engine libraries. For example: ["laya.physics3D"]
             */
            requireEngineLibs?: Array<string>;

            /**
             * Catalog bar style. Use `Hidden` to hide the catalog bar. Default is `normal`.
             * - `normal`: Normal style.
             * - `hidden`: Hide the catalog bar.
             * - `transparent`: Show the catalog bar without the background.
             */
            catalogBarStyle?: CatalogBarStyle;

            /**
             * A translation strings collection for localization of the captions.
             */
            captionTranslation?: Record<string, any>;

            /**
             * A translation strings collection for localization of the tips.
             */
            tipsTranslation?: Record<string, any>;

            /**
             * Additional options. The meaning of these options depends on the inspector used.
             */
            options?: Record<string, any>;
        }

        export interface IPropertyButtonsOptions {
            /**
             * Whether to display the caption of property buttons. Default is "hidden".
             */
            showCaption?: boolean | "normal" | "hidden" | "none";
            /**
             * Alignment of the button list. Default is "left".
             */
            align?: "left" | "center" | "right" | gui.AlignType;
            /**
             * Padding of the button list. The order is [top, right, bottom, left].
             */
            padding?: [number, number, number, number];
            /**
             * Additional space between buttons. Default is 0.
             */
            spacing?: number;
            /**
             * Button list.
             */
            buttons: Array<string | IPropertyButtonInfo>;
        }

        export interface IPropertyButtonInfo {
            /**
             * Button name.
             */
            name?: string;

            /**
             * Button caption. If not provided, the name will be used.
             * 
             * Use "i18n:&lt;key&gt;" or "i18n:&lt;file-id&gt;:&lt;key&gt;" to specify the key of the internationalization string.
             */
            caption?: string;

            /**
             * Button caption when the bound toggle property is true.
             *
             * Use "i18n:&lt;key&gt;" or "i18n:&lt;file-id&gt;:&lt;key&gt;" to specify the key of the internationalization string.
             */
            selectCaption?: string;

            /**
             * Button tips.
             */
            tips?: string;

            /**
             * Makes this button toggle a boolean property.
             *
             * Set to true to toggle the field's own property, or provide a property name
             * to toggle another property on the same object.
             */
            toggleProperty?: true | string;

            /**
             * If this is defined, a event with this name will be emitted when the button is clicked.
             * 
             * The event is bubbling, and you can get the button object through event.initiator.
             */
            event?: string;

            /**
             * If this is defined, a scene script will be executed when the button is clicked.
             * 
             * The script is executed by Editor.scene.runScript.
             */
            runScript?: string;

            /**
             * If this is defined, a node script will be executed when the button is clicked.
             * 
             * The script is executed by Editor.scene.runnNodeScript.
             */
            runNodeScript?: string;

            /**
             * If this is defined, a panel will be focused when the button is clicked.
             */
            focusPanel?: string;

            /**
             * Bind a hotkey to the button.
             */
            sceneHotkey?: string;
        }

        /**
         * Asset type
         */
        export enum AssetType {
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
            ScriptBundleDefinition,
            Json,
            Text,
            XML,
            Binary,
            BitmapFont,
            TTFFont,
            Audio,
            Video,
            Shader,
            ShaderBlueprint,
            ShaderBlueprintFunction,
            Blueprint,
            Blackboard,
            BlueprintTree,
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
            GUIPrefab,

            FairyGUIPackage,
            LensFlareData,
            Texture2DArray,

            SVGImage,
            I18nSettings,

            Dll,
            CSS,
            ComputeShader,
            ScriptableObject
        }

        /**
         * Asset flags
         */
        export enum AssetFlags {
            /**
             * Readonly asset
             */
            Readonly = 0x1,
            /**
             * Sub asset. Sub assets are assets that are part of another asset. Such as a fbx file that contains multiple meshes or materials.
             */
            SubAsset = 0x2,
            /**
             * Internal asset. Internal assets are stored in the IDE's internal installation directory and are read-only.
             */
            Internal = 0x100,
            /**
             * Memory asset. Memory assets are not stored on disk and are only available in memory.
             */
            Memory = 0x200,
            /**
             * No database cache. The asset is not cached in the database.
             */
            NoDbCache = 0x400,
            /**
             * The asset is not visible to the user.
             */
            Hidden = 0x800,
            /**
             * The asset is a temporary asset. Temporary assets are not saved to disk.
             */
            Temp = 0x1000,
            /**
             * The asset is inside the `packages` folder.
             */
            Packages = 0x2000,
            /**
             * The asset is top level asset of the project.
             */
            ProjectLayoutFolder = 0x4000,
            /**
             * The asset is hidden in all assets view.
             */
            InternalGUI = 0x8000,
            /**
             * The asset is a built-in asset.
             */
            BuiltIn = 0x10000,
            /**
             * The asset is a feature pack asset.
             */
            FeaturePack = 0x20000,

            /**
             * The asset is a package or feature pack asset.
             */
            PackageLike = Packages | FeaturePack,
        }

        /**
         * Asset changed flag
         */
        export enum AssetChangedFlag {
            /** Existing asset contents or metadata changed. */
            Modified = 0,
            /** A new asset was added to the database. */
            New = 1,
            /** An asset was removed from the database. */
            Deleted = 2,
            /** An asset moved or was renamed. */
            Moved = 3
        }

        /**
         * Asset script type
         */
        export enum AssetScriptType {
            /**
             * Not a special script. The asset is not a typescript file or a typescript file that has no special decorators.
             */
            None = 0,
            /**
             * A script that has Laya's `@regClass` decorators.
             */
            Runtime = 1,
            /**
             * A script that has decorators with prefix `@IEditorEnv`.
             */
            Scene = 2,
            /**
             * A script that has decorators with prefix `@IEditor`.
             */
            Editor = 4,
            /**
             * A JavaScript file.
             */
            Javascript = 8
        }

        /**
         * Asset information stored by the asset database.
         */
        export interface IAssetInfo {
            /**
             * Asset id
             */
            id: string;
            /**
             * Asset name
             */
            name: string;
            /**
             * Asset file name, including extension.
             */
            fileName: string;
            /**
             * Asset file path, relative to the assets folder.
             */
            file: string;
            /**
             * Asset extension, excluding the dot.
             */
            ext: string;
            /**
             * Asset type
             */
            type: AssetType;
            /**
             * Asset sub type. Some assets have a type and a sub type. Such as a json asset has a type of `Json` and a sub type of `Spine` if it is a description file of spine.
             */
            subType: string;
            /**
             * Asset version
             */
            ver: number;
            /**
             * Parent asset id
             */
            parentId: string;
            /**
             * If the asset has children, only meaningful for folders and some special assets like fbx.
             */
            hasChild: boolean;
            /** Bitmask composed from {@link AssetFlags}. */
            flags: AssetFlags;
            /**
             * Asset script type
             */
            scriptType: AssetScriptType;
            /**
             * Children assets.
             */
            children: ReadonlyArray<IAssetInfo>;
        }

        /**
         * Sub asset information. Sub assets are assets that are part of another asset. Such as a fbx file that contains multiple meshes or materials.
         */
        export interface ISubAssetInfo {
            /**
             * Sub asset id
             */
            readonly id: string;
            /**
             * Sub asset name
             */
            readonly fileName: string;
            /**
             * Sub asset absolute path
             */
            readonly fullPath: string;
        }

        /**
         * Custom asset filter registered through `EditorEnv.assetMgr.customAssetFilters` in the Scene process.
         */
        export interface IAssetFilter {
            /**
             * Check if the asset should be included in the asset list.
             * @param asset The asset to check.
             * @returns `true` if the asset should be included, `false` otherwise.
             */
            (asset: IAssetInfo): boolean;
        }

        /** Filters and result limits used by asset-search APIs. */
        export interface IFindAssetsOptions {
            /**
             * Whether to match the sub type. Some assets have a type and a sub type. Such as a json asset has a type of `Json` and a sub type of `Spine` if it is a description file of spine.
             */
            matchSubType?: boolean;

            /**
             * The custom filter name registered through `EditorEnv.assetMgr.customAssetFilters` in the Scene process.
             */
            customFilter?: string;

            /**
             * Whether to ignore the internal assets. The default value is true.
             */
            ignoreInternalAssets?: boolean;

            /**
             * Whether to ignore the internal GUI assets. The default value is true.
             */
            ignoreInternalGUIAssets?: boolean;

            /**
             * The maximum number of assets to return. The default value is 5000.
             */
            limit?: number;
        }

        /**
         * Interface for the configuration file.
         */
        export interface IConf {
            /**
             * Set the value of the key.
             * @param key 
             * @param value 
             */
            set(key: string, value: any): void;

            /**
             * Get the value of the key.
             * @param key 
             * @param defaultValue 
             */
            get(key: string, defaultValue?: any): any;

            /**
             * Release the resources.
             */
            dispose(): void;

            /**
             * Save the configuration.
             */
            save(): void;
        }
        /**
         * Interface for configuration objects.
         */
        export interface IConfigObject {
            [index: string]: any,

            /**
             * Get the value of the key.
             * @param key key.
             * @param defaultValue If the key does not exist, return the default value.
             * @returns The value of the key.
             */
            get(key: string, defaultValue?: any): any;

            /**
             * Get the number value of the key.
             * @param key key.
             * @param defaultValue If the key does not exist, return the default value.
             * @returns The number value of the key.
             */
            getNumber(key: string, defaultValue?: number): number;

            /**
             * Get the boolean value of the key.
             * @param key key. 
             * @param defaultValue If the key does not exist, return the default value.
             * @returns The boolean value of the key.
             */
            getBool(key: string, defaultValue?: boolean): boolean;

            /**
             * Get a section.
             * @param key name of the section.
             * @returns The section. 
             */
            getSection(key: string): IConfigObject;

            /**
             * Set the value of the key.
             * @param key key.
             * @param value value.
             */
            set(key: string, value: any): void;

            /**
             * Delete the key.
             * @param key key. 
             */
            delete(key: string): void;

            /**
             * Clear all keys.
             */
            clear(): void;

            /**
             * Copy data from another object.
             * @param data The data to copy from.
             */
            copyFrom(data: any): void;
        }
        /**
         * Interface for the crypto utils
         */
        export interface ICryptoUtils {
            /**
             * Create a MD5 hash.
             * @param data The data to create hash.
             * @param algorithm The algorithm to use. Default is md5.
             * @returns The hash.
             */
            createHash(data: string, algorithm?: 'md5' | 'sha1' | 'sha256' | 'sha512'): string;

            /**
             * Create a MD5 hash for a file.
             * @param path file absolute path. 
             * @param algorithm The algorithm to use. Default is md5.
             * @returns The hash.
             */
            createFileHash(path: string, algorithm?: 'md5' | 'sha1' | 'sha256' | 'sha512'): Promise<string>;

            /**
             * Encrypt data with AES.
             * @param data data to encrypt. 
             * @param key The key.
             * @returns The encrypted data. 
             */
            encryptAES(data: string, key: string): string;

            /**
             * Decrypt data with AES.
             * @param encrypted The encrypted data.
             * @param key The key
             * @returns The decrypted data.
             */
            decryptAES(encrypted: string, key: string): string;
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
        export type CommonPathName = 'home' | 'appData' | 'userData' | 'cache' | 'temp' | 'exe'
            | 'module' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 'recent' | 'logs' | 'crashDumps';

        /**
         * Interface for ipc
         */
        export interface IIpc {
            /**
             * Resolves with the response from the main process.
             *
             * Send a message to the main process via `channel` and expect a result
             * asynchronously. Arguments will be serialized with the Structured Clone
             * Algorithm, just like `window.postMessage`, so prototype chains will not be
             * included. Sending Functions, Promises, Symbols, WeakMaps, or WeakSets will throw
             * an exception.
             *
             * The main process should listen for `channel` with `ipcMain.handle()`.
             *
             * For example:
             *
             * If you need to transfer a `MessagePort` to the main process, use
             * `ipcRenderer.postMessage`.
             *
             * If you do not need a response to the message, consider using `ipcRenderer.send`.
             *
             * > **Note** Sending non-standard JavaScript types such as DOM objects or special
             * Electron objects will throw an exception.
             *
             * Since the main process does not have support for DOM objects such as
             * `ImageBitmap`, `File`, `DOMMatrix` and so on, such objects cannot be sent over
             * Electron's IPC to the main process, as the main process would have no way to
             * decode them. Attempting to send such objects over IPC will result in an error.
             *
             * > **Note** If the handler in the main process throws an error, the promise
             * returned by `invoke` will reject. However, the `Error` object in the renderer
             * process will not be the same as the one thrown in the main process.
             */
            invoke(channel: string, ...args: any[]): Promise<any>;

            /**
             * Listens to `channel`, when a new message arrives `listener` would be called with
             * `listener(event, args...)`.
             */
            on(channel: string, listener: (event: Event, ...args: any[]) => void): void;

            /**
             * Adds a one time `listener` function for the event. This `listener` is invoked
             * only the next time a message is sent to `channel`, after which it is removed.
             */
            once(channel: string, listener: (event: Event, ...args: any[]) => void): void;

            /**
             * Send a message to the main process, optionally transferring ownership of zero or
             * more `MessagePort` objects.
             *
             * The transferred `MessagePort` objects will be available in the main process as
             * `MessagePortMain` objects by accessing the `ports` property of the emitted
             * event.
             *
             * For example:
             *
             * For more information on using `MessagePort` and `MessageChannel`, see the MDN
             * documentation.
             */
            postMessage(channel: string, message: any, transfer?: MessagePort[]): void;

            /**
             * Removes all listeners, or those of the specified `channel`.
             */
            removeAllListeners(channel: string): void;

            /**
             * Removes the specified `listener` from the listener array for the specified
             * `channel`.
             */
            removeListener(channel: string, listener: (...args: any[]) => void): void;

            /**
             * Send an asynchronous message to the main process via `channel`, along with
             * arguments. Arguments will be serialized with the Structured Clone Algorithm,
             * just like `window.postMessage`, so prototype chains will not be included.
             * Sending Functions, Promises, Symbols, WeakMaps, or WeakSets will throw an
             * exception.
             *
             * > **NOTE:** Sending non-standard JavaScript types such as DOM objects or special
             * Electron objects will throw an exception.
             *
             * Since the main process does not have support for DOM objects such as
             * `ImageBitmap`, `File`, `DOMMatrix` and so on, such objects cannot be sent over
             * Electron's IPC to the main process, as the main process would have no way to
             * decode them. Attempting to send such objects over IPC will result in an error.
             *
             * The main process handles it by listening for `channel` with the `ipcMain`
             * module.
             *
             * If you need to transfer a `MessagePort` to the main process, use
             * `ipcRenderer.postMessage`.
             *
             * If you want to receive a single response from the main process, like the result
             * of a method call, consider using `ipcRenderer.invoke`.
             */
            send(channel: string, ...args: any[]): void;

            /**
             * The value sent back by the `ipcMain` handler.
             *
             * Send a message to the main process via `channel` and expect a result
             * synchronously. Arguments will be serialized with the Structured Clone Algorithm,
             * just like `window.postMessage`, so prototype chains will not be included.
             * Sending Functions, Promises, Symbols, WeakMaps, or WeakSets will throw an
             * exception.
             *
             * > **NOTE:** Sending non-standard JavaScript types such as DOM objects or special
             * Electron objects will throw an exception.
             *
             * Since the main process does not have support for DOM objects such as
             * `ImageBitmap`, `File`, `DOMMatrix` and so on, such objects cannot be sent over
             * Electron's IPC to the main process, as the main process would have no way to
             * decode them. Attempting to send such objects over IPC will result in an error.
             *
             * The main process handles it by listening for `channel` with `ipcMain` module,
             * and replies by setting `event.returnValue`.
             *
             * > :warning: **WARNING**: Sending a synchronous message will block the whole
             * renderer process until the reply is received, so use this method only as a last
             * resort. It's much better to use the asynchronous version, `invoke()`.
             */
            sendSync(channel: string, ...args: any[]): any;

            /**
             * Like `ipcRenderer.send` but the event will be sent to the `<webview>` element in
             * the host page instead of the main process.
             */
            sendToHost(channel: string, ...args: any[]): void;
        }
        export interface ILanguageModule {
            /**
             * Current language. Currently two possible values: 'en' and 'zh-CN'.
             */
            readonly language: string;

            /**
             * Translation function.
             * @param name Key name in the language file. 
             * @param defaultValue You can provide a default value if the key does not exist in the language file.
             */
            t(name: string, defaultValue?: string): string;

            /**
             * Translation function.
             * @param name Key name in the language file. 
             * @param options Key-value pairs for string interpolation.
             * @example
             * ```
             * //en.json
             * {
             *     "key" : "{{what}} is {{how}}"
             * }
             * 
             * //test.ts
             * console.log(i18n.t("key", { what: "LayaAir", how: "great" }));
             * //Output: "LayaAir is great"
             * ```
             */
            t(name: string, options: Record<string, any>): string;

            /**
             * Translation function.
             * @param name Key name in the language file. 
             * @param defaultValue You can provide a default value if the key does not exist in the language file.
             * @param options Key-value pairs for string interpolation.
             * @example
             * ```
             * //en.json
             * {
             *     "key" : "{{what}} is {{how}}"
             * }
             * 
             * //test.ts
             * console.log(i18n.t("key", { what: "LayaAir", how: "great" }));
             * //Output: "LayaAir is great"
             * ```
             */
            t(name: string, defaultValue: string, options: Record<string, any>): string;
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
        export type ExecResult = { code: number, error: string, output: string };
        export type ExecProgressCallback = (output: string, part: string) => void;

        export interface IExecOptions {
            /**
             * Current working directory.
             */
            cwd?: string;

            /**
             * Progress callback.
             * - output: The full output of the command.
             * - part: The current part of the output.
             */
            progressCallback?: ExecProgressCallback;

            /**
             * Abort token. If you want to abort the command on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the command.
             */
            abortToken?: IAbortToken;

            /**
             * If true, runs command inside of a shell. Uses '/bin/sh' on Unix, and process.env.ComSpec on Windows. A different shell can be specified as a string. See Shell requirements and Default Windows shell. Default: false (no shell).
             */
            shell?: boolean | string;

            /**
             * Environment key-value pairs. Default: process.env
             */
            env?: Record<string, string>;

            /**
             * The encoding used for all stdio inputs and outputs. On MacOs and Linux, the default is 'utf8'. On Windows, we will try to detect the encoding of the console, and use that encoding.
             */
            stringEncoding?: string;

            /**
             * Whether to throw an error If the process exits with a non-zero exit code. Default: false.
             */
            throwIfNonZeroExitCode?: boolean;

            /**
             * Whether to throw an error If AbortToken is signaled. Default: false.
             */
            throwIfAborted?: boolean;
        }

        /**
         * 
         */
        export interface INativeTools {
            /**
             * Executes a command.
             * @param command The command to execute.
             * @param args The command arguments.
             * @param options The execution options.
             * @returns A promise that resolves to the execution result.
             */
            exec(command: string, args: ReadonlyArray<string>, options: IExecOptions): Promise<ExecResult>;

            /**
             * Executes a command.
             * @param command The command to execute
             * @param args The command arguments.
             * @param progressCallback The progress callback.
             * @param abortToken The abort token. If you want to abort the execution on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the execution.
             * @returns A promise that resolves to the execution result.
             */
            exec(command: string, args: ReadonlyArray<string>, progressCallback?: ExecProgressCallback, abortToken?: IAbortToken): Promise<ExecResult>;

            /**
             * Run a built-in tool. All tools are installed in the IDE's nativetools directory.
             * @param toolName The tool name.
             * @param args The command arguments.
             * @param options The execution options.
             * @returns A promise that resolves to the execution result.
             */
            runTool(toolName: string, args: ReadonlyArray<string>, options: IExecOptions): Promise<ExecResult>;

            /**
             * Run a built-in tool. All tools are installed in the IDE's nativetools directory.
             * @param toolName The tool name.
             * @param args The command arguments.
             * @param progressCallback The progress callback.
             * @param abortToken The abort token. If you want to abort the execution on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the execution.
             * @returns A promise that resolves to the execution result.
             */
            runTool(toolName: string, args: ReadonlyArray<string>, progressCallback?: ExecProgressCallback, abortToken?: IAbortToken): Promise<ExecResult>;

            /**
             * Runs a npm cli command. CliName can be “npm” or “npx”. If it is another command, it needs to be installed first using installCli().
             * @param cliName The cli name. "npm", "npx", or a custom cli name.
             * @param args The command arguments.
             * @param options The execution options.
             * @returns A promise that resolves to the execution result.
             */
            execCli(cliName: string, args: ReadonlyArray<string>, options?: IExecOptions): Promise<ExecResult>;

            /**
             * Install a npm package. The pacakge will install to the project's library/cli-package directory.
             * @param pkgName The package name. e.g. "typescript" or ["typescript", "eslint"]
             * @param options The execution options.
             * @returns A promise that resolves to the execution result.
             */
            installCli(pkgName: string | string[], options?: IExecOptions): Promise<ExecResult>;

            /**
             * Converts an absolute path to a path relative to the project root directory.
             * 
             * The main purpose of this is to avoid issues with command-line tools that may not work properly if the project path contains Chinese characters or spaces.
             * @param path The path to convert.
             * @returns The converted path.
             */
            formatOutpathArg(path: string): string;

            /**
             * Converts an absolute path to a path relative to the project root directory. If the input path contains Chinese characters, a temporary file will be created, and the content of the input path will be written to the temporary file. The path of the temporary file will be returned.
             * 
             * The main purpose of this is to avoid issues with command-line tools that may not work properly if the file name contains Chinese characters.
             * @param path The path to convert.
             * @param tempPath The directory for the temporary file. Default is library/temp/mbcNameFiles.
             * @returns The converted path.
             */
            formatInFileArg(path: string, tempPath?: string): Promise<string>;

            /**
             * Opens the code editor.
             * @param filePath The file path.
             */
            openCodeEditor(filePath: string): void;

            /**
             * Opens the browser.
             * @param url The URL address.
             */
            openBrowser(url: string): void;

            /**
             * Gets the string encoding of the console. Only effective on Windows systems, returns 'utf8' on other platforms.
             * @returns The string encoding.
             */
            getStringEncoding(): Promise<string>;

            /**
             * Gets the machine identification code.
             * @returns The machine identification code.
             */
            getMachineId(): Promise<string>;

            /**
             * Opens the terminal and runs a command.
             * @param command The command to run. 
             * @param workingDirectory The working directory. Default is the project root directory. 
             */
            runCommandInTerminal(command: string, workingDirectory?: string): Promise<void>;
        }
        export interface IFetchResponseTypeMap {
            "text": string;
            "json": any;
            "arraybuffer": ArrayBuffer;
        }

        export interface IFetchOptions<K> {
            /**
             * post, get, put, delete, etc.
             */
            method?: string;

            /**
             * Query parameters. These will be appended to the URL by a '?' and joined by '&'.
             */
            query?: Record<string, string>;

            /**
             * Upload data. This can be a JSON object, URLSearchParams, FormData, or ArrayBuffer.
             */
            body?: Record<string, any> | URLSearchParams | FormData | ArrayBuffer;

            /**
             * Http headers.
             */
            headers?: Record<string, string>;

            /**
             * Response type.
             * - text: The response is a string.
             * - json: The response is a JSON object.
             * - arraybuffer: The response is an ArrayBuffer.
             */
            responseType?: K,

            /**
             * Username for basic authentication.
             */
            username?: string,

            /**
             * Password for basic authentication.
             */
            password?: string,

            /**
             * This callback will be called with the download progress.
             * @param loaded Loaded bytes.
             * @param total Total bytes.
             */
            downloadProgress?: (loaded: number, total: number) => void;

            /**
             * This callback will be called with the upload progress.
             * @param loaded 
             * @param total 
             * @returns 
             */
            uploadProgress?: (loaded: number, total: number) => void;

            /**
             * Abort token. If you want to abort the http request on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the requset.
             */
            abortToken?: IAbortToken;
        }

        export interface INetUtils {
            /**
             * Issues an http request.
             * @param url URL. 
             * @param options Options.
             * @returns A promise that resolves to the response. 
             */
            httpRequest<K extends keyof IFetchResponseTypeMap>(url: string, options?: IFetchOptions<K>): Promise<IFetchResponseTypeMap[K]>;

            /**
             * Downloads a file to a buffer.
             * @param url URL. 
             * @param progress Progress callback. 
             * @param abortToken Abort token. If you want to abort the http request on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the requset.
             * @returns A promise that resolves to the file buffer. 
             */
            downloadFileToBuffer(url: string, progress?: (receivedLength: number, contentLength: number) => void, abortToken?: IAbortToken): Promise<ArrayBuffer>;

            /**
             * Downloads a file.
             * @param url URL. 
             * @param localPath Local path to save the file.
             * @param progress Progress callback. 
             */
            downloadFile(url: string, localPath: string, progress?: (receivedLength: number, contentLength: number) => void): Promise<void>;

            /**
             * Gets the IP address of the local machine.
             */
            getIPAddress(): string;
        }

        export interface IObjectUtils {

            /**
            * Clears an object by deleting all its properties.
            * 
            * Since it might be a proxy and could be referenced elsewhere, it cannot be directly assigned.
            * @param obj The object to clear.
            */
            clearObj(obj: any): void;

            /**
             * Deep clones an object.
             * @param obj The object to clone. 
             * @returns The cloned object.
             */
            deepCloneObj(obj: any): any;

            /**
             * Creates a cycle-free snapshot containing only primitives, arrays and plain objects.
             * Throws when the value contains cycles or unsupported runtime objects.
             */
            clonePlainData<T>(value: T): T;

            /**
             * Merge two objects. 
             * 
             * If a property with the same name exists in both objects, and the value of it is an object, the two objects will be merged recursively.
             * 
             * If a property with the same name exists in both objects, and the value of it is primitive, the value of the source object will only be used when override is true.
             * 
             * If a property exists in the source object but not in the target object, it will be added to the target object.
             * 
             * @param target The target object.
             * @param source The source object.
             * @param override Override option. Default is true.
             * @example
             * ```
             * let target = { b: { x: 1 } };
             * let source = { a: 1, b: { y: 1 }, c: 2};
             * let result = mergeObjs(target, source);
             * //Output: { a: 1, b: { x:1, y:1 }, c: 2}
             * ```
             */
            mergeObjs(target: any, source: any, override?: boolean): void;

            /**
             * Set the value of a property in an object by a path.
             * @param obj The object to set the property.
             * @param datapath The path of the property. 
             * @param pathIndex The start index of datapath. Default is 0.
             * @param value The value to set. 
             * @param forceCreate If true, the path will be created if it does not exist. Default is false. 
             * @example
             * ```
             * let obj = { a: { b: { c: 1 } } };
             * setDataByPath(obj, ['a', 'b', 'c'], 0, 2);
             * //Output: { a: { b: { c: 2 } } }
             * 
             * let obj = { a: { b: { c: 1 } } };
             * setDataByPath(obj, ['a', 'd', 'c'], 0, 2, true);
             * //Output: { a: { b: { c: 1 }, d: { c: 2 } } }
             * 
             * let obj = { a: { b: { c: 1 } } };
             * setDataByPath(obj, ['a', 'd', 'c'], 0, 2, false);
             * //Output: { a: { b: { c: 1 } }
             * ```
             */
            setDataByPath(obj: any, datapath: ReadonlyArray<string>, pathIndex: number, value: any, forceCreate?: boolean): boolean;

            /**
             * Delete a property in an object by a path.
             * @param obj The object to delete the property. 
             * @param datapath The path of the property.
             * @param pathIndex The start index of datapath. Default is 0. 
             */
            deleteDataByPath(obj: any, datapath: ReadonlyArray<string>, pathIndex: number): boolean;

            /**
             * Get the value of a property in an object by a path.
             * @param obj The object to get the property.
             * @param datapath The path of the property.
             * @param pathLen The length of the path. Default is the length of datapath.
             * @return The value of the property.
             * @example
             * ```
             * let obj = { a: { b: { c: 1 } } };
             * let result = getDataByPath(obj, ['a', 'b', 'c']);
             * //Output: 1
             * ```
             */
            getDataByPath(obj: any, datapath: ReadonlyArray<string>, pathLen?: number): any;

            /**
             * Whether a value has enumerable string-keyed properties.
             * @param value The value to inspect.
             * @param ignoreEditorInternal Whether properties prefixed with `_$` should be ignored.
             */
            hasEnumerableProperties(value: unknown, ignoreEditorInternal?: boolean): boolean;

            /**
             * Whether an object has no enumerable properties other than editor-internal properties prefixed with `_$`.
             * @param obj The object to check.
             * @returns True if the object is empty, otherwise false. 
             */
            isEmptyObj(obj: any): boolean;

            /**
            * Compares whether two arrays are equal. Two arrays are equal if they have the same length and all their elements are equal by comparing them using ===.
            * @param a The first array.
            * @param b The second array.
            * @returns True if the two arrays are equal, otherwise false.
            */
            arrayEquals(a: ReadonlyArray<any>, b: ReadonlyArray<any>): boolean;

            /**
             * Whether the first array starts with the second array.
             * @param a The first array.
             * @param b The second array.
             * @returns True if the first array starts with the second array, otherwise false.
             */
            arrayStartsWith(a: ReadonlyArray<any>, b: ReadonlyArray<any>): boolean;

            /**
             * Compares whether two objects are equal. Two objects are equal if they have the same properties and the values of the properties are equal by comparing them using ===.
             */
            objEquals(a: any, b: any): boolean;

            /**
             * Copies the properties of one object to another, making the two objects have exactly the same properties.
             * Unlike Object.assign, it will first delete properties in the target object that do not exist in the source.
             * @param target The target object.
             * @param source The source object.
             * @returns The target object.
             */
            assignObject(target: any, source: any): any;
        }

        export type SettingsLocation = "application" | "project" | "local" | "memory";

        export interface ISettings {
            /**
             * Data of the settings.
             */
            readonly data: IConfigObject;

            /**
             * Triggered when the settings are changed.
             */
            readonly onChanged: IDelegate<(sender: ISettings) => void>;

            /**
             * Update the settings from the UI process. Only meaningful when the settings are queried from the process other than the UI process.
             */
            sync(): Promise<void>;

            /**
             * Push local changes to the UI process. Only meaningful when the settings are queried from the process other than the UI process.
             * @param keys The keys of the settings to push. If not specified, all settings are pushed.
             */
            push?(keys?: ReadonlyArray<string>): Promise<void>;

            /**
             * Flush the changes to the storage immediately. Only meaningful for settings with delayed saving.
             */
            flush?(): void;
        }

        export interface ICreateSettingsOptions {
            /**
             * The location of the configuration file. The default is "project".
             * - application: Saved to the user data directory of the application. On Windows, it is generally C:\Users\{user}\AppData\Local\{appname}, and on Mac, it is generally ~/Library/Application Support/{appname}. This means that this configuration needs to be shared across different projects.
             * - project: Saved to the `settings` directory of the project. This means that this configuration is specific to the current project.
             * - local: Saved to the `local` directory of the project. This means that this configuration is specific to the current project but does not need to be tracked by the version control system.
             * - memory: Maintained only in memory and not saved to a file.
             * - other value: specify the storage path of the configuration file by yourself. It is a relative path to the assets directory.
             */
            location?: SettingsLocation | string;

            /**
             * The data type corresponding to the configuration. If it is a string, it means that this type has been registered through typeRegistry. If it is FTypeDescriptor, it will be automatically registered when created. If it is a Function, it means that this is a class decorated with ＠IEditor.regClass.
             */
            type?: string | FTypeDescriptor | Function;

            /**
             * In general, custom configuration files are only used in the editor environment. If the configuration data also needs to be read at runtime, this parameter can be set to true, and then accessed at runtime through `Laya.PlayerConfig.XXX`, where `XXX` is the name of the configuration file.
             */
            contributeToPlayerConfig?: boolean;

            /**
             * The file name of the configuration file will be `{prefix}{name}.json`, where `prefix` is "Plugin-" by default, and `name` is the name passed in by the user. For example, if the name is "TestConfig", then the file name will be "Plugin-TestConfig.json". If you want to customize the file name, you can set this property. The file name should use characters that conform to file name specifications and should not contain the extension, as the extension will be automatically added. For example, if the file name is set to "MyConfig", then the actual file name will be "MyConfig.json". 
             */
            fileName?: string;
        }

        export interface ISettingsService {
            /**
             * Enable a built-in settings definition. This method is only available in the UI process and is intended for IDE modules; plugins should use `Editor.extensionManager.createSettings`.
             * @param name The name of the settings.
             * @param location The location of the configuration file. The default is "project".
             * - application: Saved to the user data directory of the application. On Windows, it is generally C:\Users\{user}\AppData\Local\{appname}, and on Mac, it is generally ~/Library/Application Support/{appname}. This means that this configuration needs to be shared across different projects.
             * - project: Saved to the `settings` directory of the project. This means that this configuration is specific to the current project.
             * - local: Saved to the `local` directory of the project. This means that this configuration is specific to the current project but does not need to be tracked by the version control system.
             * - memory: Maintained only in memory and not saved to a file.
             * @param typeName The data type corresponding to the configuration.
             */
            enableSettings(name: string, location?: SettingsLocation, typeName?: string): void;

            /**
             * Enable a built-in asset-backed settings definition. This method is only available in the UI process and is intended for IDE modules; plugins should use `Editor.extensionManager.createSettings`.
             * @param name The name of the configuration. It should be unique within the editor and use characters that conform to file name specifications.
             * @param pathToAsset The path to the configuration file. It is a relative path to the assets directory.
             * @param typeName The data type corresponding to the configuration.
             */
            enableSettings(name: string, pathToAsset: string, typeName?: string): void;

            /**
             * Enable a built-in settings definition. This method is only available in the UI process and is intended for IDE modules; plugins should use `Editor.extensionManager.createSettings`.
             * @param name The name of the configuration. It should be unique within the editor and use characters that conform to file name specifications.
             * @param options Options to create the settings.
             */
            enableSettings(name: string, options?: ICreateSettingsOptions): void;
            /**
             * Query the settings by name.
             * @param name The name of the settings.
             * @returns The settings, or null when the name has not been registered.
             */
            getSettings(name: string): ISettings | null;

            /**
             * Query the settings type name.
             * @param name The name of the settings.
             * @returns The type name of the settings, or null when the name has not been registered.
             */
            getSettingsType(name: string): string | null;

            /**
             * Flush the changes of all settings to the storage immediately. Only meaningful for settings with delayed saving.
             */
            flushChanges(): void;
        }

        /** Prefix used by reflected shader type names. */
        export const ShaderTypePrefix = "Shader.";
        /**
         * A callback function that is used to determine whether a value is equal to the default value.
         * @param value The value to compare.
         * @param overridedDefaultValue By default, the `default` property of the property descriptor is used as the default value. You can override it by passing in this parameter.
         * @param looseMode In loose mode, empty data (i.e. {}) is allowed to match non-empty default values.
         */
        export type DefaultValueComparator = (value: any, overridedDefaultValue?: any, looseMode?: boolean) => boolean;
        /** One reflected type prepared for a node/component creation menu. */
        export type TypeMenuItem = { type: FTypeDescriptor, label: string, icon: string, order: number };
        /** Ordered menu items with the localized category label attached to the array. */
        export type TypeMenuItems = Array<TypeMenuItem> & { menuLabel: string };
        /** Compiled dynamic expressions controlling an inspector property's state and validation. */
        export type PropertyTestFunctions = { hiddenTest: Function, readonlyTest: Function, validator: Function, requiredTest: Function };

        /** Runtime registry for reflected engine, editor and user-script type descriptors. */
        export interface ITypeRegistry {
            /**
             * All types. Key is the name of the type.
             */
            readonly types: Readonly<Record<string, FTypeDescriptor>>;

            /**
             * A version number that is incremented when the type list is changed.
             */
            readonly version: number;

            /**
             * Triggered when the types those are defined in the typescript code are changed.
             */
            readonly onUserTypesChanged: IDelegate<() => void>;

            /**
             * Node type name, it is "Node".
             */
            nodeTypeName: string;

            /**
             * Component type name, it is "Component".
             */
            componentTypeName: string;

            /**
             * Add some types to the registry. If the type already exists, it will be overwritten.
             * @param types Types to add.
             * @param bindClasses Whether to bind the types to premapped engine classes. This option is available only in the scene process. Default is false.
             */
            addTypes(types: ReadonlyArray<FTypeDescriptor>, bindClasses?: boolean): void;

            /**
             * Remove some types from the registry.
             * @param names Names of the types to remove. 
             */
            removeTypes(names: ReadonlyArray<string>): void;

            /**
             * Notify the registry that the user types are changed. User types are types that are defined in the typescript code.
             */
            setUserTypesChanged(): void;

            /**
             * Get derived types of a type.
             * @param type The type to get derived types.
             * @returns Derived types of the type. 
             */
            getDerivedTypes(type: FTypeDescriptor): Array<FTypeDescriptor>;

            /**
             * Get all component types that need to be added when a component type is added to a node.
             *  
             * This is determined by the requireComponents property of the type.
             * @param type The component type.
             * @returns A collection of component types, including the type itself.
             * @see FTypeDescriptor.requireComponents 
             */
            getRequireComponents(type: string): Array<string>;

            /**
             * Get  all engine libraries that need to be enabled when a component type is added to a node.
             * 
             * This is determined by the requireEngineLibs property of the type.
             * @param type The component type.
             * @returns A collection of engine libraries.
             * @see FTypeDescriptor.requireEngineLibs
             */
            getRequireEngineLibs(type: string): Array<string>;

            /**
             * Get whether a component type can be added multiple times to a node.
             * 
             * This is determined by the allowMultipleComponent property of the type and its base types.
             * @param type The component type.
             * @returns Whether the component type can be added multiple times to a node.
             * @see FTypeDescriptor.allowMultipleComponent
             */
            getAllowMultipleComponent(type: FTypeDescriptor): boolean;

            /**
             * Get node menu items.
             * @param type The world type.
             * @param inHierarchyMenu Whether to include the component types that are allowed to be added in the hierarchy menu. This is determined by the inHierarchyMenu option of the type.
             * @returns Node menu items. Key is the category name, value is the menu items. 
             * @see FTypeDescriptor.inHierarchyMenu
             */
            getNodeMenuItems(type: WorldType, inHierarchyMenu?: boolean): Readonly<Record<string, TypeMenuItems>>;

            /**
             * Get component menu items.
             * @param type The world type. 
             * @returns Component menu items. Key is the category name, value is the menu items.
             */
            getComponentMenuItems(type: WorldType): Readonly<Record<string, TypeMenuItems>>;

            /**
             * Get creation-menu items for registered types derived from an asset base type.
             * The descriptor's menu value is the path relative to Project/Create. An empty path places the type at the root.
             * @param baseType The asset base type name.
             * @returns Asset creation menu items. Key is the menu path, value is the menu items.
             */
            getAssetMenuItems(baseType: string): Readonly<Record<string, TypeMenuItems>>;

            /**
             * Find a type defined in the typescript code by its path.
             * @param path A path relative to the assets folder. 
             * @returns The type descriptor, or null if no registered script uses the path.
             */
            findScriptByPath(path: string): FTypeDescriptor | null;

            /**
             * Whether a type is a 3D type.
             * @param type The type name.
             * @returns Whether the type is a 3D type.
             */
            isType3d(type: string): boolean;

            /**
             * Check whether a type is derived from another type.
             * @param type The type name. 
             * @param baseType The base type name.
             * @returns Whether the type is derived from the base type. 
             */
            isDerivedOf(type: string, baseType: string | ReadonlyArray<string>): boolean;

            /**
             * Whether a type is a node type. In other words, this type is derived from Node.
             * @param type The type name. 
             * @returns Whether the type is a node type.
             */
            isNodeType(type: string): boolean;

            /**
             * If a type is derived from Node, return Node; if it is derived from Component, return Component; otherwise return null.
             * @param type The type name.
             * @returns The base type name or null.
             */
            getNodeBaseType(type: string): string | null;

            /**
             * Check whether two types share the same base type.
             * @param type1 The first type name.
             * @param type2 The second type name.
             * @returns Whether the two types share the same base type. 
             */
            hasSameBase(type1: string, type2: string): boolean

            /**
             * Whether a type is deprecated. If a new type descriptor is registered with the same name, the original descriptor is marked as deprecated.
             * @param type The type descriptor.
             * @returns Whether the type is deprecated.
             */
            isTypeDeprecated(type: FTypeDescriptor): boolean;

            /**
             * Get caption of a type.
             * @param type The type name or the type descriptor. 
             * @param noSplit Whether to tokenize the results. The default is false, meaning the results will be tokenized.
             * @param noLocalize Whether to localize the results. The default is null, meaning the results will be processed according to the localization settings.
             * @returns The caption of the type.
             */
            getTypeCaption(type: string | FTypeDescriptor, noSplit?: boolean, noLocalize?: boolean): string;

            /**
             * Get icon of a type.
             * @param type The type name or the type descriptor.
             * @returns The icon of the type. 
             */
            getTypeIcon(type: string | FTypeDescriptor): string;

            /**
             * @en Get property of a type, if the property is not found, look for it in the base types.
             * @param typeDef The type descriptor.
             * @param propName The property name.
             * @returns The property value, or `null` if neither the type nor any of its base types defines the property.
             * @zh 获取类型的属性，如果属性未找到，则在基类中查找。
             * @param typeDef 类型描述符。
             * @param propName 属性名称。
             * @returns 属性值；如果当前类型及其所有基类都未定义该属性，则返回 `null`。
             */
            findTypePropertyInChain<T = any>(typeDef: FTypeDescriptor, propName: string): T | null;

            /**
             * Get caption of a property.
             * @param type The type descriptor. 
             * @param prop The property descriptor.
             * @param noSplit Whether to tokenize the results. The default is false, meaning the results will be tokenized.
             * @param noLocalize Whether to localize the results. The default is null, meaning the results will be processed according to the localization settings.
             * @returns The caption of the property. 
             */
            getPropCaption(type: FTypeDescriptor, prop: FPropertyDescriptor, noSplit?: boolean, noLocalize?: boolean): string;

            /**
             * Get tips of a property.
             * @param type The type descriptor. 
             * @param prop The property descriptor. 
             * @returns The localized tips of the property.
             */
            getPropTips(type: FTypeDescriptor, prop: FPropertyDescriptor): string;

            /**
             * Get the caption of the catalog.
             * @param type The type descriptor. 
             * @param prop The property descriptor.
             * @returns The caption of the catalog. 
             */
            getCatalogCaption(type: FTypeDescriptor, prop: FPropertyDescriptor): string;

            /**
             * Get the default node name when creating a new node of this type.
             * @param type The type descriptor.
             * @returns The default node name.
             */
            getNewNodeName(type: FTypeDescriptor): string;

            /**
             * Get all properties of a type in a map. Key is the property name.
             * @param type The type descriptor.
             * @returns Result map. 
             */
            getAllPropsOfType(type: FTypeDescriptor): Readonly<Record<string, FPropertyDescriptor>>;

            /**
             * Get an object that contains the initial values of the type.
             * 
             * This initial value only takes effect when the object is manually created from the UI.
             * @param typeDef The type descriptor.
             * @returns The initial values of the type. 
             */
            getInitProps(typeDef: FTypeDescriptor): any;

            /**
             * Get an object that contains the default values of the type.
             * @param typeDef The type descriptor. 
             * @param includePrivate Whether to include private properties. The default is false.
             * @param data The object data.
             * @returns The default values of the type. 
             */
            getDefaultValue(typeDef: FTypeDescriptor, includePrivate?: boolean, data?: any): any;

            /**
             * Get the default value of a property.
             * @param prop The property descriptor.
             * @param realType If the type is a polymorphic reference type, use this parameter to specify the actual type.
             * @param includePrivate Whether to include private properties. The default is false.
             * @param data The property data.
             * @returns The default value of the property. 
             */
            getPropDefaultValue(prop: FPropertyDescriptor, realType?: string, includePrivate?: boolean, data?: any): any;

            /**
             * Get the test functions of a property.
             * @param prop The property descriptor.
             * @returns The test functions of the property, or null when the property has no dynamic tests.
             */
            getPropTestFunctions(prop: FPropertyDescriptor): PropertyTestFunctions | null;

            /**
             * Get the test function of a property to determine whether it is serializable.
             * @param prop The property descriptor.
             * @returns The test function, or null when `serializable` is not an expression string.
             */
            getPropSerializableTestFunction(prop: FPropertyDescriptor): Function | null;

            /**
             * Get all default value comparator functions of a type. This function is used to determine whether a value is equal to the default value. The key is the property name.
             * @param typeDef The type descriptor.
             * @returns Functions map.
             */
            getDefaultValueComparators(typeDef: FTypeDescriptor): Readonly<Record<string, DefaultValueComparator>>;

            /**
             * Find a property by path.
             * @param type The type descriptor. 
             * @param datapath The path of the property. 
             * @param out The result array. If it is not null, the result will be added to this array, otherwise a new array will be created.
             * @returns The result array, or null if any segment in `datapath` cannot be resolved.
             */
            getPropertyByPath(type: FTypeDescriptor, datapath: ReadonlyArray<string>, out?: FPropertyDescriptor[]): FPropertyDescriptor[] | null;

            /**
             * Get the type descriptor of an object. Null will be returned if the prototype of the object is not registered.
             * @param obj The object.
             * @returns The type descriptor of the object. 
             */
            getTypeOfObj(obj: any): FTypeDescriptor | null;

            /**
             * Get the type descriptor of a class. Null will be returned if the class is not registered.
             * @param cls The class.
             * @returns The type descriptor of the class. 
             */
            getTypeOfClass(cls: Function): FTypeDescriptor | null;

            /**
             * Get the type descriptor of a class without looking for its base types. Null will be returned if the class is not registered.
             * @param cls The class.
             * @return The type descriptor of the class.
             */
            getOwnTypeOfClass(cls: Function): FTypeDescriptor | null;

            /**
             * Sort properties. The order is determined by the position property and the catalog property of the property descriptor.
             * @param props The properties to sort. 
             * @param considerCatalog Whether to consider the catalog property. The default is false.
             */
            sortProps(props: Array<FPropertyDescriptor>, considerCatalog?: boolean): void;
        }

        /**
         * Determines how a delayed call handles another schedule request while one is pending.
         *
         * - `debounce`: restart the delay and keep the latest arguments.
         * - `throttle`: keep the original deadline and update to the latest arguments.
         */
        export type DelayedCallMode = "debounce" | "throttle";

        /** Configuration for an independently managed delayed callback. */
        export interface IDelayedCallOptions {
            /**
             * The scheduling strategy. The default is `debounce`.
             */
            mode?: DelayedCallMode;
        }

        /** A reusable debounce/throttle handle created by {@link IUtils.createDelayedCall}. */
        export interface IDelayedCall<TArgs extends unknown[]> {
            /**
             * Whether a call is currently pending.
             */
            readonly pending: boolean;

            /**
             * Schedule the callback.
             * @param delay Delay in milliseconds. A value less than or equal to zero clears
             * the pending call and returns false so the caller can execute synchronously.
             * @param args Arguments passed to the callback.
             * @returns True if the callback was scheduled; false if it should execute synchronously.
             */
            schedule(delay: number, ...args: TArgs): boolean;

            /**
             * Cancel the pending call.
             */
            clear(): void;

            /**
             * Cancel and immediately execute the pending call.
             * @returns Whether a pending call was executed.
             */
            flush(): boolean;
        }

        /** General file-system, path, timing, string and process helpers exposed by the editor. */
        export interface IUtils {
            /**
             * Parse string content from a file to a JSON object.
             * @param filePath The path of the file. 
             * @param silent Whether to suppress the error message. The default is false, meaning the error message will be output to the console.
             * @returns The JSON object.
             */
            readJson(filePath: string, silent?: boolean): any;

            /**
             * Parse string content from a file to a JSON object.
             * 
             * This is the promise version of `readJson`.
             * @param filePath The path of the file. 
             * @param silent Whether to suppress the error message. The default is false, meaning the error message will be output to the console. 
             * @returns The JSON object.
             */
            readJsonAsync(filePath: string, silent?: boolean): Promise<any>;

            /**
             * Parse string content from a file to a JSON object, enabling JSON5 support.
             * @param filePath The path of the file.
             * @param silent Whether to suppress the error message. The default is false, meaning the error message will be output to the console.
             * @returns The JSON object.
             */
            readJson5(filePath: string, silent?: boolean): any;

            /**
             * Parse string content from a file to a JSON object, enabling JSON5 support.
             * 
             * This is the promise version of `readJson5`.
             * @param filePath The path of the file.
             * @param silent Whether to suppress the error message. The default is false, meaning the error message will be output to the console.
             * @returns The JSON object.
             */
            readJson5Async(filePath: string, silent?: boolean): Promise<any>;

            /**
             * Stringify a JSON object and write it to a file.
             * @param filePath The path of the file. 
             * @param content The JSON object. 
             * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read. Default is 2.
             */
            writeJson(filePath: string, content: any, space?: string | number): void;

            /**
             * Stringify a JSON object and write it to a file.
             * 
             * This is the promise version of `writeJson`.
             * @param filePath The path of the file. 
             * @param content The JSON object. 
             * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read. Default is 2.
             */
            writeJsonAsync(filePath: string, content: any, space?: string | number): Promise<void>;

            /**
             * Debounce writes to a file while preserving serial write order for that path.
             * @param filePath The destination file path.
             * @param contents The complete contents for the next write.
             * @param delay The debounce delay in milliseconds. The default is 100.
             */
            scheduleFileWrite(filePath: string, contents: string | Uint8Array, delay?: number): void;

            /**
             * Flush one file's delayed and queued writes, or all managed writes when no
             * path is supplied.
             * @param filePath The destination file path. Omit it to flush every file.
             */
            flushFileWrites(filePath?: string): Promise<void>;

            /**
             * Read the first N bytes of a file. This is useful for reading the file signature.
             * @param filePath The path of the file. 
             * @param bytesCount The number of bytes to read.
             * @returns The buffer containing the first N bytes. 
             */
            readFirstNBytes(filePath: string, bytesCount: number): Promise<Buffer>;

            /**
             * Test whether a value is an object. It is equivalent to `type === 'function' || typeof obj === 'object' && obj !== null`.
             * @param value The value to test.
             * @returns Whether the value is an object.
             */
            isObject(value: any): boolean;

            /**
             * Parse a string with format `key1=value1,key2=value2,...` to a key-value object.
             * @param features The string to parse.
             * @returns The key-value object.
             */
            parseFeatures(features: string): Record<string, string>;

            /**
             * Convert a number to a string with a fixed number of decimal places. Trailing zeros are removed.
             * @param n The number to convert. 
             * @param fractionDigits The number of decimal places. 
             * @returns The string representation of the number.
             * @example
             * ```
             * toFixedPro(1.2345, 2) // "1.23"
             * toFixedPro(1.01, 1) // "1"
             * ```
             */
            toFixedPro(n: number, fractionDigits: number): string;

            /**
             * Splits a camelCase string into words and capitalizes the first letter of each word.
             * @param str The string to convert.
             * @returns The result.
             * @example
             * ```
             * splitCamelCase("helloWorld") // "Hello World"
             * ``` 
             */
            splitCamelCase(str: string): string;

            /**
             * @deprecated Use `getTempBaseDirAsync` instead.
             * Get the base directory for temporary files. It is the `library/temp` folder in the project. The API ensures that this folder exists.
             * @returns The base directory for temporary files.
             */
            getTempBaseDir(): string;

            /**
             * Asynchronously get the base directory for temporary files and ensure it exists.
             * @returns The base directory for temporary files.
             */
            getTempBaseDirAsync(): Promise<string>;

            /**
             * @deprecated Use `mkTempDirAsync` instead.
             * Create a subdirectory in the temporary directory. The temporary directory is returned by `getTempBaseDir`.
             * @param subDir The name of the subdirectory. If not specified, a subdirectory with a random name is created.
             * @returns The absolute path of the subdirectory.
             */
            mkTempDir(subDir?: string): string;

            /**
             * Asynchronously create a subdirectory in the temporary directory.
             * @param subDir The name of the subdirectory. If not specified, a subdirectory with a random name is created.
             * @returns The absolute path of the subdirectory.
             */
            mkTempDirAsync(subDir?: string): Promise<string>;

            /**
             * It is equivalent to `path.join`. Only for the purpose of without importing `path`.
             * @param paths The paths to join.
             * @returns The joined path. 
             */
            joinPaths(...paths: string[]): string;

            /**
             * It is equivalent to `fs.copyFile`. Only for the purpose of without importing `fs`.
             * @param src The source file path.
             * @param dest The destination file path. 
             */
            copyFile(src: string, dest: string): Promise<void>;

            /**
             * Delete a folder recursively.
             * @param path The path of the folder. 
             */
            rmDirSync(path: string): void;

            /**
             * Delete a file or an empty folder.
             * @param path The path of the file. 
             */
            rmSync(path: string): void;

            /**
             * Copy all files and subfolders recursively from a folder to another folder.
             * @param source The source folder path.
             * @param destDir The destination folder path.
             * @param options The options.
             * - autoRename: Whether to automatically rename the file when a file with the same name exists in the destination folder. The default is false, meaning the file will be overwritten.
             * - regenerateUUID: Whether to regenerate the UUID of the file. The default is false.
             */
            copyDir(source: string, destDir: string, options?: { autoRename?: boolean, regenerateUUID?: boolean }): Promise<void>;

            /**
             * Move all files and subfolders recursively from a folder to another folder.
             * @param source The source folder path.
             * @param destDir The destination folder path.
             * @param options The options.
             * - autoRename: Whether to automatically rename the file when a file with the same name exists in the destination folder. The default is false, meaning the file will be overwritten.
             */
            moveDir(source: string, destDir: string, options?: { autoRename?: boolean }): Promise<void>;

            /**
             * If source is a file, copy it to destDir; if source is a folder path, copy all files and subfolders recursively from it to destination.
             * @param source The source file or folder path.
             * @param destDir The destination folder path.
             * @param options The options.
             * - autoRename: Whether to automatically rename the file when a file with the same name exists in the destination folder. The default is false, meaning the file will be overwritten.
             */
            copyFileOrDir(source: string, destDir: string, options?: { autoRename?: boolean }): Promise<void>;

            /**
             * Copy all files and subfolders that match the pattern from a folder to another folder.
             * @param source The source folder path.
             * @param pattern The glob pattern.
             * @param destDir The destination folder path.
             * @param options The options.
             * - dot: Whether to include files and subfolders starting with a dot. The default is false.
             * - ignore: The glob pattern to exclude files and subfolders.
             */
            copyFiles(source: string, pattern: string, destDir: string, options?: { dot?: boolean, ignore?: string | Array<string> }): Promise<void>;

            /**
             * Delete all files in a folder except for the specified files.
             * @param folder The folder path. 
             * @param ignores The files to ignore. The elements are the filenames, exactly matching the filenames in the folder.
             */
            deleteFiles(folder: string, ignores?: Iterable<string>): Promise<void>;

            /**
             * Check if the file exists. It is promise version of `fs.existsSync`.
             * @param filePath The path of the file.
             * @returns Whether the file exists.
             */
            fileExists(filePath: string): Promise<boolean>;

            /**
             * @deprecated Use `resolveConflictFileName` instead.
             */
            getNewFilePath(path: string, name: string): string;

            /**
             * Check if a filename conflicts in the specified folder. If there is a conflict, add a numeric suffix to the filename and continue checking until there is no conflict.
             * @param path The folder path.
             * @param name The filename. 
             * @param connectorSymbol The delimiter to connect the filename and the numeric suffix. The default is "_".
             * @returns The new filename. 
             */
            resolveConflictFileName(path: string, name: string, connectorSymbol?: string): Promise<string>;

            /**
             * @deprecated Use `resolveConflictFileName` instead. 
             */
            resolveConflictFileNameSync(path: string, name: string, connectorSymbol?: string): string;

            /**
             * Replace invalid filename characters in a string (compatible with both Windows and Mac)
             * @param fileName The filename.
             * @param replaceChar The character to replace the invalid characters. The default is "_".
             * @returns The sanitized filename.
             */
            sanitizeFileName(fileName: string, replaceChar?: string): string;

            /**
             * Add a hash to the filename. The hash is added before the extension.
             * @param filename The filename. 
             * @param hash The hash string. 
             * @param ext The extension. If not specified, the extension of the filename is used.
             * @returns The new filename.
             */
            addHashToFileName(filename: string, hash: string, ext?: string): string;

            /**
             * Handle . and .. in the path, converting it to an absolute path and returning an array of path segments.
             * @param filePath The path to normalize.
             * @returns The normalized path.
             * @example
             * ```
             * normalizePath("a/b/../c") // ["a", "c"]
             * ```
             */
            normalizePath(filePath: string): Array<string>;

            /**
             * Create a promise that resolves after a specified amount of time, implementing a sleep function.
             * @param ms The number of milliseconds to sleep.
             * @example
             * ```
             * await sleep(1000); // sleep for 1 second
             * ```
             */
            sleep(ms: number): Promise<void>;

            /**
             * Create an independently managed delayed callback.
             *
             * Use `debounce` to restart the delay on every request. Use `throttle` to keep
             * the first request's deadline while updating the callback arguments.
             * @param callback The callback to execute.
             * @param options Scheduling options.
             */
            createDelayedCall<TArgs extends unknown[]>(
                callback: (...args: TArgs) => void,
                options?: IDelayedCallOptions,
            ): IDelayedCall<TArgs>;

            /**
             * Create a promise that resolves until the predicate returns true, or the timeout is reached.
             * @param predicate The predicate function. 
             * @param timeoutInMs The timeout in milliseconds. If not specified, there is no timeout. 
             * @example
             * ```
             * await until(() => document.querySelector("div") !== null); // wait until the div element is loaded
             * ```
             */
            until(predicate: () => boolean, timeoutInMs?: number): Promise<void>;

            /**
             * Escape special characters in a string to be used in a regular expression.
             * @param str The string to escape. 
             * @returns The escaped string.
             * @example
             * ```
             * escapeRegExp("hello.world") // "hello\.world"
             * ```
             */
            escapeRegExp(str: string): string;

            /**
             * Load a script file through script tag injection.
             * @param src The URL of the script file.
             * @param async Whether to load the script asynchronously. The default is false. 
             * @param onScriptError The error handler when the script fails to load.
             * @returns The script element.
             */
            loadLib(src: string, async?: boolean, onScriptError?: (err: ErrorEvent) => void): Promise<HTMLScriptElement>;

            /**
             * Load an ES module and return its module namespace object.
             * HTTP(S) and custom-protocol responses are imported through a Blob URL so
             * the request can pass through the editor's fetch transport.
             * @param src The absolute or document-relative URL of the module.
             */
            loadModule<T = unknown>(src: string): Promise<T>;

            /**
             * Execute arithmetic expressions.
             * @param str The arithmetic expression.
             * @returns The result of the arithmetic expression.
             * @example
             * ```
             * calculate("1+2*3") // 7
             * ``` 
             */
            calculate(str: string): number;

            /**
             * Remove unsupported tags from HTML content.
             * 
             * Supported tags: `b`, `i`, `u`, `strike`, `font`, `img`, `a`.
             * @param source The HTML content.
             * @param removeWhiteSpace Whether to remove white spaces between tags. The default is false if no <html> or <body> tag is found, otherwise true.
             * @returns The simplified HTML content.
             */
            simplifyHtml(source: string, removeWhiteSpace?: boolean): string;

            /**
             * Serialize an XML document to a string.
             * @param xmlDoc The XML document.
             * @returns The XML string.
             */
            serializeXML(xmlDoc: XMLDocument): string;

            /**
             * Find an XML element in a collection that satisfies the predicate.
             * @param col The collection of XML elements.
             * @param predicate The predicate function.
             * @returns The XML element that satisfies the predicate.
             * @example
             * ```
             * findXMLElement(xmlDoc.getElementsByTagName("a"), node => node.getAttribute("href") === "https://www.example.com")
             * ``` 
             */
            findXMLElement(col: NodeListOf<Node> | HTMLCollection, predicate: (node: Element) => boolean): Element;

            /**
             * Add elements to a set.
             * @param set The set to add elements to. 
             * @param elements The elements to add. 
             */
            addToSet(set: Set<any>, elements: Iterable<any>): void;

            /**
             * Convert a number representing bytes into a string with units.
             * @param bytes The number of bytes.
             * @returns The formatted string with appropriate units.
             * @example
             * ```
             * formatBytes(1024) // "1 KB"
             * formatBytes(1024 * 1024) // "1 MB"
             * formatBytes(1024 * 1024 * 1024) // "1 GB"
             * formatBytes(12345) // "12.06 KB"
             * ```
             */
            formatBytes(bytes: number): string;

            /**
             * Convert a timestamp to a time string relative to now.
             * @param time The timestamp to convert.
             * @param includeTime Whether to include the time in the output string. If false, only the date is included. The default is true.
             * @returns The time string.
             * @example
             * ```
             * getTimeAgo(1620000000000) // "2021-05-03 12:00:00"
             * getTimeAgo(1620000000000, false) // "2021-05-03"
             * ```
             */
            getTimeAgo(time: number, includeTime?: boolean): string;

            /**
             * Get the current time as a string.
             * @returns The current time string.
             * @example
             * ```
             * getNowStr() // "2021-05-03 12:00:00"
             * ```
             */
            getNowStr(): string;

            /**
             * Format a string as a JavaScript variable name.
             * @param str The string to format.
             * @returns The formatted string.
             * @example
             * ```
             * formatAsJsVariable("private") // "private_"
             * formatAsJsVariable("1abc") // "_1abc"
             * formatAsJsVariable("a$b") // "a_b"
             * ```
             */
            formatAsJsVariable(str: string): string;

            /**
             * Run a batch of tasks in parallel. Rejects if any task fails.
             * @param datas The data to process. 
             * @param numParallelTasks The number of parallel tasks. If it is a function, it is called with the number of concurrent tasks and returns whether to continue running more tasks.
             * @param taskFunc The task function.
             * @param abortToken The abort token. If you want to abort the execution on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the execution.
             * @returns The results of the tasks.
             * @example
             * ```
             * let result = await runTasks([1, 2, 3], 2, async (data, index) => {
             *    await sleep(1000);
             *    return data * 2;
             * });
             * // result: [2, 4, 6]
             * ```
             */
            runTasks<T, T2>(datas: Array<T2> | Iterable<T2> & { size?: number }, numParallelTasks: number | ((numTasks: number) => boolean), taskFunc: (data: T2, index: number) => T | Promise<T>, abortToken?: IAbortToken): Promise<T[]>;

            /**
             * Run a batch of tasks in parallel. Resolves even if some tasks fail.
             * @param datas The data to process. 
             * @param numParallelTasks The number of parallel tasks. If it is a function, it is called with the number of concurrent tasks and returns whether to continue running more tasks. 
             * @param taskFunc The task function. 
             * @param abortToken The abort token. If you want to abort the execution on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the execution.
             * @returns The promise results of the tasks.
             * @example
             * ```
             * let result = await runAllTasks([1, 2, 3], 2, async (data, index) => {
             *     await sleep(1000);
             *     if (data === 2) {
             *        throw new Error("error");
             *     }
             *     return data * 2;
             * });
             * // result: [ { status: "fulfilled", value: 2 }, { status: "rejected", reason: Error: error }, { status: "fulfilled", value: 6 } ]
             * ```
             */
            runAllTasks<T, T2>(datas: Array<T2> | Iterable<T2> & { size?: number }, numParallelTasks: number | ((numTasks: number) => boolean), taskFunc: (data: T2, index: number) => T | Promise<T>, abortToken?: IAbortToken): Promise<PromiseSettledResult<T>[]>;

            /**
             * Print the results of a promise.
             * @param rets The results of the promises.
             * @param group The optional group name for console messages.
             */
            printPromiseResult(rets: Iterable<PromiseSettledResult<any>>, group?: string): void;

            /**
             * Create a function that wrap the execution of another function. The wrapped function will only be executed once. The result is cached and returned directly for subsequent calls.
             * @param fn The function to execute.
             * @param errorHandler The error handler when the function fails. If not specified, the error will be reported to the console.
             * @returns The wrapped function.
             * @example
             * ```
             * let fn = makeExecuteOnceFunction(async () => {
             *    await sleep(1000);
             *    return 1;
             * });
             * let result = await fn(); // 1, return after 1 second
             * let result2 = await fn(); // 1, return immediately
             * ```
             */
            makeExecuteOnceFunction<T>(fn: () => Promise<T>, errorHandler?: (err: any) => T): () => Promise<T>;

            /**
             * Whether the new UI system is being used.
             * @returns Whether the new UI system is being used.
             */
            isUsingNewUI(): boolean;

            /**
             * Filter top-level items from a list of items.
             * @param items The list of items to filter.
             * @returns The filtered list of top-level items. 
             */
            filterTopLevels<T extends { parent: any }>(items: ReadonlyArray<T>): ReadonlyArray<T>;

            /**
             * Get the file path from a web file.
             * @param file The web file, usually from the drag-and-drop event.
             * @returns The file path.
             */
            getPathForWebFile(file: File): string;
        }

        /** UUID generation, validation and compact-string conversion helpers. */
        export interface IUUIDUtils {
            /**
             * Generate a UUID. UUID is a 36-character string with 4 dashes.
             * @example
             * ```
             * genUUID(); // "550e8400-e29b-41d4-a716-446655440000"
             * ```
             */
            genUUID(): string;

            /**
             * Generate a short ID. A short ID is a string of a specified length, composed of numbers and lowercase letters, and does not start with a number.
             * @param size Size of the short ID. Default is 8.
             * @example
             * ```
             * genShortId(); // "a550e840"
             * genShortId(6); // "a550e8"
             * ```
             */
            genShortId(size?: number): string;

            /**
             * Check if a string is a UUID.
             * @param str String to check.
             * @return Whether the string is a UUID.
             * @example
             * ```
             * isUUID("550e8400-e29b-41d4-a716-446655440000"); // true
             * isUUID("550e8400-e29b-41d4-a716-44665544000"); // false
             * ``` 
             */
            isUUID(str: string): boolean;

            /**
             * Compress a UUID. Compressed UUID is a string of 22 characters without dashes.
             * @param uuid UUID to compress.
             * @return Compressed UUID.
             * @example
             * ```
             * compressUUID("550e8400-e29b-41d4-a716-446655440000"); // "VQ6EBiW0QaFHRmVUZAAB"
             * ```
             */
            compressUUID(uuid: string): string;

            /**
             * Decompress a compressed UUID.
             * @param str Compressed UUID.
             * @return Decompressed UUID.
             * @example
             * ```
             * decompressUUID("VQ6EBiW0QaFHRmVUZAAB"); // "550e8400-e29b-41d4-a716-446655440000"
             * ``` 
             */
            decompressUUID(str: string): string;
        }

        /**
         * Zip file writer.
         */
        export interface IZipFileW {
            /**
             * When adding files, if the file path matches any of the names in this list, it will be excluded.
             * 
             * This is useful when you want to exclude some files from the zip file.
             * @example
             * ```
             * excludeNames: ["*.tmp", ".*"]
             * ```
             */
            excludeNames: Array<string>;

            /**
             * Additional command line options for the zip tool.
             */
            additionalOptions: Array<string>;

            /**
             * Add a file to the zip file.
             * @param realPath Path to the file in the file system.
             * @param entryPath Path in the zip file. If not specified, the entry path will use the relative path from realPath to the basePath value of this object.
             * @example
             * ```
             * let zip = new IEditor.ZipFileW("C:/temp");
             * zip.addFile("C:/temp/abc/test.txt"); // The entry path will be "abc/test.txt"
             * zip.addFile("D:/test.txt", "def/test.txt"); // The entry path will be "def/test.txt"
             * ```
             */
            addFile(realPath: string, entryPath?: string): void;

            /**
             * Add a folder to the zip file. Files in the folder will be added recursively based on the pattern and ignore parameters.
             * @param realPath Path to the folder in the file system. 
             * @param entryPath Path in the zip file. If not specified, the entry path will use the relative path from realPath to the basePath value of this object.
             * @param pattern Glob pattern to match files in the folder. If not specified, all files will be added. 
             * @param ignore Glob pattern to exclude files in the folder. If not specified, no files will be excluded.
             * @example
             * ```
             * let zip = new IEditor.ZipFileW("C:/temp");
             * zip.addFolder("C:/temp/abc"); // All files in the "abc" folder will be added.
             * zip.addFolder("C:/temp/abc", "def", "*.txt", ["*.tmp"]); // Only .txt files in the "abc" folder will be added, and .tmp files will be excluded.
             * ```
             */
            addFolder(realPath: string, entryPath?: string, pattern?: string, ignore?: string[]): void;

            /**
             * Add a buffer to the zip file.
             * @param entryPath Path in the zip file.
             * @param buf Buffer to add. 
             * @param encoding Encoding of the buffer. Default is "utf8".
             * @example
             * ```
             * let zip = new IEditor.ZipFileW("C:/temp");
             * zip.addBuffer("abc/test.txt", "Hello, world!", "utf8");
             * ``` 
             */
            addBuffer(entryPath: string, buf: string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView>, encoding?: string): void;

            /**
             * Write the zip file to the file system.
             * @param filePath Path to the zip file. 
             * @param progressCallback Callback function to report the progress of the operation. The progress value is between 0 and 100. 
             * @param abortToken Abort token. If you want to abort the operation on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the operation.
             */
            save(filePath: string, progressCallback?: (progress: number) => void, abortToken?: IAbortToken): Promise<void>;
        }

        /**
         * Zip file reader.
         */
        export interface IZipFileR {

            /**
             * Open a zip file.
             * @param filePath File path of the zip file.
             */
            open(filePath: string): Promise<void>;

            /**
             * Open a zip file in memory.
             * @param buf Buffer of the zip file.
             */
            open(buf: ArrayBuffer): Promise<void>;

            /**
             * Get the entries in the zip file.
             */
            getEntries(): Array<string>;

            /**
             * Test whether the zip file contains the specified entry.
             * @param entryName The name of the entry.
             * @returns True if the zip file contains the entry; otherwise, false. 
             */
            hasEntry(entryName: string): boolean;

            /**
             * Extract the specified entry to the file system.
             * @param entryName The name of the entry.
             * @param savePath The path to save the extracted file. 
             */
            extract(entryName: string, savePath: string): Promise<void>;

            /**
             * Unzip the entire zip file to the file system.
             * @param savePath The path to save the extracted files. 
             * @param progressCallback Callback function to report the progress of the operation. The progress value is between 0 and 100. 
             * @param abortToken Abort token. If you want to abort the operation on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the operation.
             */
            extractAll(savePath: string, progressCallback?: (progress: number) => void, abortToken?: IAbortToken): Promise<void>;

            /**
             * Close the zip file. Remember to call this method after you finish using the zip file.
             */
            close(): void;
        }
        /**
         * Interface for an abort token.
         */
        export interface IAbortToken {
            /**
             * Whether the token has been aborted.
             */
            readonly aborted: boolean;

            /**
             * Signal the token. This will cause the `aborted` property to become `true`.
             */
            signal(): void;

            /**
             * Check if the token has been aborted. If it has, an `aborted` string will be thrown.
             */
            check(): void;

            /**
             * Reset the token. This will cause the `aborted` property to become `false`.
             */
            reset(): void;
        }
        /**
         * Build target info interface
         */
        export interface IBuildTargetInfo {
            /**
             * The display name of the build target.
             */
            caption?: string;

            /**
             * The icon path of the build target. 
             */
            icon?: string;

            /**
             * The settings panel id of the build target. The panel will be integrated into the build settings panel.
             * Be aware that the panel usage should be "build-settings".
             * @example
             * ```
             * //The settings panel id is "TestBuildSettings", which can be used in this field.
             * ＠IEditor.panel("TestBuildSettings", { usage: "build-settings", title: "My Test" })
             * export class TestBuildSettings extends IEditor.EditorPanel {
             * }
             * ```
             */
            inspector?: string;

            /**
             * Absolute path to the directory containing the build-template files.
             * Contents in the directory will be copied to the build output directory during the build process.
             */
            templatePath?: string;

            /**
             * The settings id of the build target. It needs to be registered first using Editio.extensionManager.createSettings. 
             * During the build process, you can use BuildTask.platformConfig to get a copy of this setting.
             */
            settingsName?: string;

            /**
             * The real platform type of the build target. It is meaningful for native platform build, but not for web or mini game build.
             */
            runningPlatforms?: Array<NodeJS.Platform>;

            /**
             * The dependent modules that are required by the build target. Modules are external packages that managed by the editor.
             */
            requireModules?: Array<string>;

            /**
             * Whether the build target is a mini-game platform, e.g. WeChat Mini Game, Oppo Mini Game, etc.
             */
            isMiniGame?: boolean;

            /**
             * Whether the build target is a native platform, e.g. Android, iOS, Windows, Mac, etc.
             */
            isNative?: boolean;

            /**
             * Sets the position of the build target in the build settings panel. 
             * 
             * Supported syntax: "first" / "last" / "before id" / "after id". e.g. "before web" or "after android".
             */
            position?: string;
        }

        /**
         * Runtime platform type
         */
        export enum RuntimePlatformType {
            PC = 0,
            Android = 1,
            IOS = 2,
        }

        /**
         * Interface for logging messages
         */
        export interface ILogger {

            /**
             * Logs an informational message to the console.
             * @param message - The message to log.
             * @param optionalParams - Additional parameters to log.
             */
            log(message?: any, ...optionalParams: any[]): void;

            /**
             * Logs a warning message to the console.
             * @param message - The message to log.
             * @param optionalParams - Additional parameters to log.
             */
            warn(message?: any, ...optionalParams: any[]): void;

            /**
             * Logs an error message to the console.
             * @param message - The message to log.
             * @param optionalParams - Additional parameters to log.
             */
            error(message?: any, ...optionalParams: any[]): void;

            /**
             * Logs a debug message to the console.
             * @param message - The message to log.
             * @param optionalParams - Additional parameters to log.
             */
            debug(message?: any, ...optionalParams: any[]): void;
        }
        export type RenderTemplateOptions = {
            /**
             * Whether to escape html characters. Default is false.
             * @example
             * ```
             * renderTemplate("{{name}}", { name: "<script>alert('hello')</script>" }, { escape: true });
             * // Output: &lt;script&gt;alert(&#39;hello&#39;)&lt;/script&gt;
             * 
             * renderTemplate("{{name}}", { name: "<script>alert('hello')</script>" }, { escape: false });
             * // Output: <script>alert('hello')</script>
             * ```
             */
            escape?: boolean;

            /**
             * Use single bracket as the template tag. Default is false.
             * @example
             * ```
             * renderTemplate("{{name}}", { name: "world" }, { useSingleBracket: false });
             * // Output: world
             * 
             * renderTemplate("{name}", { name: "world" }, { useSingleBracket: true });
             * // Output: world
             * ```
             */
            useSingleBracket?: boolean;
        };

        export interface ITemplateUtils {
            /**
             * Render a template string.
             * @param content Source template string. 
             * @param templateArgs Template arguments. 
             * @param options Options.
             * @returns Rendered string. 
             */
            renderTemplate(content: string, templateArgs?: Record<string, any>, options?: RenderTemplateOptions): string;

            /**
             * @deprecated Use `renderTemplateFileAsync` instead.
             * Render a template string read from a file and write the result back to the file.
             * @param filePath Path to the template file. 
             * @param templateArgs Template arguments. 
             * @param options Options.
             */
            renderTemplateFile(filePath: string, templateArgs?: Record<string, any>, options?: RenderTemplateOptions): void;

            /**
             * Render a template string read from a file and write the result back to the file.
             * 
             * This is the promise version of `renderTemplateFile`.
             * @param filePath Path to the template file. 
             * @param templateArgs Template arguments. 
             * @param options Options. 
             */
            renderTemplateFileAsync(filePath: string, templateArgs?: Record<string, any>, options?: RenderTemplateOptions): Promise<void>;
        }

        export interface IClipboard {
            // Docs: https://electronjs.org/docs/api/clipboard

            /**
             * An array of supported formats for the clipboard `type`.
             */
            availableFormats(type?: 'selection' | 'clipboard'): Promise<string[]>;
            /**
             * Clears the clipboard content.
             */
            clear(type?: 'selection' | 'clipboard'): Promise<void>;
            /**
             * Whether the clipboard supports the specified `format`.
             *
             * @experimental
             */
            has(format: string, type?: 'selection' | 'clipboard'): Promise<boolean>;
            /**
             * Reads `format` type from the clipboard.
             *
             * `format` should contain valid ASCII characters and have `/` separator. `a/c`,
             * `a/bc` are valid formats while `/abc`, `abc/`, `a/`, `/a`, `a` are not valid.
             *
             * @experimental
             */
            read(format: string): Promise<string>;
            /**
             * * `title` string
             * * `url` string
             *
             * Returns an Object containing `title` and `url` keys representing the bookmark in
             * the clipboard. The `title` and `url` values will be empty strings when the
             * bookmark is unavailable.  The `title` value will always be empty on Windows.
             *
             * @platform darwin,win32
             */
            readBookmark(): Promise<any>;
            /**
             * Reads `format` type from the clipboard.
             *
             * @experimental
             */
            readBuffer(format: string): Promise<Buffer>;
            /**
             * The text on the find pasteboard, which is the pasteboard that holds information
             * about the current state of the active application’s find panel.
             *
             * This method uses synchronous IPC when called from the renderer process. The
             * cached value is reread from the find pasteboard whenever the application is
             * activated.
             *
             * @platform darwin
             */
            readFindText(): Promise<string>;
            /**
             * The content in the clipboard as markup.
             */
            readHTML(type?: 'selection' | 'clipboard'): Promise<string>;
            /**
             * The image content in the clipboard.
             */
            readImage(type?: 'selection' | 'clipboard'): Promise<any>;
            /**
             * The content in the clipboard as RTF.
             */
            readRTF(type?: 'selection' | 'clipboard'): Promise<string>;
            /**
             * The content in the clipboard as plain text.
             */
            readText(type?: 'selection' | 'clipboard'): Promise<string>;
            /**
             * Writes `data` to the clipboard.
             */
            write(data: any, type?: 'selection' | 'clipboard'): Promise<void>;
            /**
             * Writes the `title` (macOS only) and `url` into the clipboard as a bookmark.
             *
             * **Note:** Most apps on Windows don't support pasting bookmarks into them so you
             * can use `clipboard.write` to write both a bookmark and fallback text to the
             * clipboard.
             *
             * @platform darwin,win32
             */
            writeBookmark(title: string, url: string, type?: 'selection' | 'clipboard'): Promise<void>;
            /**
             * Writes the `buffer` into the clipboard as `format`.
             *
             * @experimental
             */
            writeBuffer(format: string, buffer: Buffer, type?: 'selection' | 'clipboard'): Promise<void>;
            /**
             * Writes the `text` into the find pasteboard (the pasteboard that holds
             * information about the current state of the active application’s find panel) as
             * plain text. This method uses synchronous IPC when called from the renderer
             * process.
             *
             * @platform darwin
             */
            writeFindText(text: string): Promise<void>;
            /**
             * Writes `markup` to the clipboard.
             */
            writeHTML(markup: string, type?: 'selection' | 'clipboard'): Promise<void>;
            /**
             * Writes `image` to the clipboard.
             */
            writeImage(image: any, type?: 'selection' | 'clipboard'): Promise<void>;
            /**
             * Writes the `text` into the clipboard in RTF.
             */
            writeRTF(text: string, type?: 'selection' | 'clipboard'): Promise<void>;
            /**
             * Writes the `text` into the clipboard as plain text.
             */
            writeText(text: string, type?: 'selection' | 'clipboard'): Promise<void>;
        }

        export interface IPlist {
            /**
             * Parse a plist format string to an object.
             * @param content The plist format string.
             * @returns The object.
             * @example
             * ```
             * let content = `<?xml version="1.0" encoding="UTF-8"?>
             * <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
             * <plist version="1.0">
             * <dict>
             *    <key>key1</key>
             *    <string>value1</string>
             *    <key>key2</key>
             *    <integer>2</integer>
             * </dict>
             * </plist>`;
             * let obj = parsePlist(content);
             * //Output: { key1: 'value1', key2: 2 } 
             * ```
             */
            parsePlist(content: string): Record<string, any>;

            /**
             * Build a plist format string from an object.
             * @param obj The object.
             * @returns The plist format string. 
             */
            buildPlist(obj: Record<string, any>): string;
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
        export interface IServiceProvider {
            /**
             * Start the service.
             */
            start(): Promise<void>;

            /**
             * Stop the service.
             */
            stop(): void;

            /**
             * Whether the service is started.
             */
            get started(): boolean;

            /**
             * Get all clients.
             */
            get clients(): ReadonlyArray<IMyMessagePort>;

            /**
             * Register a handler for a channel.
             * @param channel Channel name. 
             * @param func Handler function. 
             * @param thisArg This object of the handler function. 
             * @param passClientParam Whether to pass the client object as the first parameter to the handler function.
             */
            handle(channel: string, func: Function, thisArg?: any, passClientParam?: boolean): void;

            /**
             * Broadcast a message to all clients those have `subscribe` flag setted to true.
             * @param channel Channel name.
             * @param args Message arguments. 
             */
            notifyAll(channel: string, ...args: any[]): void;
        }
        /** Converts decorator/runtime type metadata into editor property descriptors. */
        export interface ITypeParser {
            /** Get class metadata, optionally creating an empty metadata record when absent. */
            getClassMeta(constructor: Function, forceCreate?: boolean): any;
            /** Parse a constructor, enum, array, record, or property-options value into descriptor fields. */
            parsePropType(ptype: any): Partial<FPropertyDescriptor>;
        }

        export namespace IReflectUtils {
            /**
             * Define metadata for a target.
             * @param key Metadata key.
             * @param value Metadata value.
             * @param target Target object.
             * @param propertyName Optional property name.
             */
            function defineMetadata(key: string, value: any, target: any, propertyName?: string): void;

            /**
             * Get metadata for a target.
             * @param key Metadata key.
             * @param target Target object.
             * @param propertyName Optional property name.
             * @returns Metadata value or undefined if not found.
             */
            function getMetadata(key: string, target: any, propertyName?: string): any;

            /**
             * Get own metadata for a target.
             * @param key Metadata key.
             * @param target Target object.
             * @param propertyName Optional property name.
             * @returns Metadata value or undefined if not found.
             */
            function getOwnMetadata(key: string, target: any, propertyName?: string): any;
        }

        /**
         * Serialization interface for JSON binary data.
         */
        export interface IJsonBin {
            /**
             * Deserializes binary data into a JavaScript object.
             * @param data The binary data to parse.
             * @param createObjWithClass Optional function to create objects with a specific class.
             */
            parse(data: ArrayBufferLike, createObjWithClass?: Function): any;

            /**
             * Serializes a JavaScript object into binary data.
             * @param o The object to serialize. 
             * @param enableClass Optional flag to enable class serialization. 
             */
            write(o: any, enableClass?: boolean): ArrayBuffer;

            /**
             * Checks if the provided binary data is in JSON binary format.
             * @param data The binary data to check.
             * @returns True if the data is in JSON binary format, false otherwise. 
             */
            isJsonBin(data: ArrayBufferLike): boolean;
        }
        export class CustomEditor {
            /**
             * Owner node.
             */
            readonly owner: Laya.Node;
            /**
             * Owner component. Null if the script is attached to a node.
             */
            readonly comp: Laya.Component;
            /**
             * Called when the script is added to a node or a component.
             */
            onAwake?(): void;
            /**
             * Called when a child node is added or removed.
             */
            onChildChanged?(): void;
            /**
             * Called when the node's size changes. Only available for 2D nodes.
             */
            onSizeChanged?(): void;
            /**
             * Called when the node is opened in the stage. Only available for box-like sprites, such as Box, Panel, List, etc.
             *
             * A box-like sprite is a sprite which children are not selectable in the stage only after it is double-clicked to open.
             */
            onOpenBox?(): void;
            /**
             * Called when the node is closed in the stage. Only available for box-like sprites, such as Box, Panel, List, etc.
             *
             * A box-like sprite is a sprite which children are not selectable in the stage only after it is double-clicked to open.
             */
            onCloseBox?(): void;
            /**
             * Called when the node is selected in the stage.
             */
            onSelected?(): void;
            /**
             * Called when the node is unselected in the stage.
             */
            onUnSelected?(): void;
            /**
             * In this callback, you can draw elements or create handles in the scene view.
             * @example
             * ```
             * // Draw a hemisphere at the node's position.
             * onSceneGUI() {
             *     IEditorEnv.Handles.drawHemiSphere(this.owner.transform.position, 2);
             * }
             * ```
             */
            onSceneGUI?(): void;
            /**
             * In this callback, you can draw gizmos that are always drawn.
             * @example
             * ```
             * // Draw a gizmo icon at the node's position.
             * onDrawGizmos() {
             *     IEditorEnv.Gizmos.drawIcon(this.owner.transform.position, "editorResources/UI/gizmo.png");
             * }
             * ```
             */
            onDrawGizmos?(): void;
            /**
             * In this callback, you can draw gizmos only when the object is selected.
             */
            onDrawGizmosSelected?(): void;
        }

        /**
         * Handle base class. Handles are used for scene editing operations, such as translation, rotation, scaling, etc.
         * Handles are reused, each time they are used they go through the process of execute->(onClick/onDrag/onMouseUp)->recover.
         */
        export class HandleBase {
            /**
             * The owner of this handle, usually a Node in the scene.
             */
            owner: Laya.Node;
            /**
             * Indicates whether the handle's value has changed.
             */
            valueChanged: boolean;
            /**
             * The current state of the handle. Readonly.
             */
            state: HandleState;
            constructor();
            /**
             * Run the handle.
             * @param args Arguments for this run.
             */
            execute(...args: any[]): void;
            /**
             * Invoked when the mouse button is pressed down on the handle.
             */
            onMouseDown(): void;
            /**
             * Invoked when the handle is dragged.
             */
            onDrag(): void;
            /**
             * Invoked when the mouse button is released after interacting with the handle.
             */
            onMouseUp(): void;
            /**
             * Invoked when the handle is right-clicked.
             */
            onRightClick(): void;
        }

        export class HandleColor {
            normalColor: Laya.Color;
            hoveredColor: Laya.Color;
            activeColor: Laya.Color;
            inactiveColor: Laya.Color;
            /**
             * Creates an instance of HandleColor.
             * @param normal Color for the normal state.
             * @param hovered Color for the hovered state. If not provided, it will be the same as the normal color.
             * @param active Color for the active state. If not provided, it will be the same as the hovered color.
             * @param inactive Color for the inactive state. If not provided, it will be the same as the normal color.
             */
            constructor(normal?: Laya.Color, hovered?: Laya.Color, active?: Laya.Color, inactive?: Laya.Color);
            /**
             * Sets the colors for different states of the handle.
             * @param normal Color for the normal state.
             * @param hovered Color for the hovered state. If not provided, it will be the same as the normal color.
             * @param active Color for the active state. If not provided, it will be the same as the hovered color.
             * @param inactive Color for the inactive state. If not provided, it will be the same as the normal color.
             */
            setColors(normal: Laya.Color, hovered?: Laya.Color, active?: Laya.Color, inactive?: Laya.Color): void;
            /**
             * Gets the color for the specified handle state.
             * @param state The state of the handle for which to get the color.
             * @returns The color corresponding to the specified handle state.
             */
            getColor(state: HandleState): Laya.Color;
            /**
             * Clones the colors from this HandleColor instance to another HandleColor instance.
             * @param dest The HandleColor instance to which the colors will be cloned.
             */
            cloneTo(dest: HandleColor): void;
            /**
             * Creates a new HandleColor instance that is a clone of this instance.
             * @returns A new HandleColor instance with the same colors as this instance.
             */
            clone(): HandleColor;
        }

        export class DirectionMoveHandleBase extends HandleBase {
            readonly result: Laya.Vector3;
            readonly direction: Laya.Vector3;
            readonly position: Laya.Vector3;
            protected plane: Laya.Plane;
            protected hitPosition: Laya.Vector3;
            protected lastHitPosition: Laya.Vector3;
            constructor();
            protected setPosition(position: Laya.Vector3, direction: Laya.Vector3): void;
            onDrag(): void;
        }

        export class PlanMoveHandleBase extends HandleBase {
            readonly result: Laya.Vector3;
            readonly position: Laya.Vector3;
            protected plane: Laya.Plane;
            protected centerOffset: Laya.Vector3;
            protected hitPosition: Laya.Vector3;
            constructor();
            protected setPosition(position: Laya.Vector3, direction1: Laya.Vector3, direction2: Laya.Vector3): void;
            onMouseDown(): void;
            onDrag(): void;
        }

        export class WorldMoveHandleBase extends HandleBase {
            readonly result: Laya.Vector3;
            targetVertex: boolean;
            readonly position: Laya.Vector3;
            constructor();
            protected setPosition(position: Laya.Vector3, targetVertex?: boolean): void;
            protected freeMove(): void;
            protected worldPositionMove(): void;
            protected vertexPositionMove(): void;
            onDrag(): void;
        }

        export class Move2DHandleBase extends HandleBase {
            deltaX: number;
            deltaY: number;
            protected transform: Laya.Matrix;
            constructor();
            onMouseDown(): void;
            onDrag(): void;
        }

        /**
         * The base class for all gizmos. A gizmo is a visual representation of an object in the editor, such as a wireframe, a mesh, a line, etc. Gizmos are used to provide visual feedback to the user when they are interacting with objects in the editor, such as when they are selecting, moving, rotating, or scaling objects. Gizmos can also be used to provide additional information about an object.
         */
        export class GizmoBase {
            isIcon: boolean;
            constructor();
            /**
             * Enable picking for specific shader data. This will set the necessary shader data for picking to work.
             * @param cmdBuffer The command buffer to set the shader data on.
             * @param shaderData The shader data to set the picking information on.
             * @param pickable Whether to enable picking. If false, the picking color will be set to zero, which means the object will not be pickable. Default is true.
             */
            protected setPickable(cmdBuffer: Laya.CommandBuffer | Laya.CommandBuffer2D, shaderData: Laya.ShaderData, pickable?: boolean): void;
            /**
             * Called when the gizmo is created. This can be used to initialize the gizmo with specific parameters. The parameters can be defined by the specific gizmo implementation, and can be used to set up the gizmo's appearance, behavior, etc.
             * @param args The arguments to initialize the gizmo with. The specific arguments depend on the gizmo implementation, and can be used to set up the gizmo's appearance, behavior, etc.
             */
            create(...args: any[]): void;
            /**
             * Called when the gizmo is rendered. This can be used to add custom rendering commands to the command buffer, for example, to render custom shapes, lines, etc. The command buffer can be used to set shader data, draw meshes, etc.
             * @param cmdBuffer The command buffer to add rendering commands to.
             * @param enableOcclusion Whether it is needed to render with occlusion.
             */
            execute(cmdBuffer: Laya.CommandBuffer, enableOcclusion: boolean): void;
            /**
             * Called when the gizmo is rendered in 2D context. This can be used to add custom rendering commands to the command buffer, for example, to render custom shapes, lines, etc. The command buffer can be used to set shader data, draw meshes, etc.
             * @param cmdBuffer
             */
            execute2D(cmdBuffer: Laya.CommandBuffer2D): void;
            /**
             * Called when the gizmo is recovered. This can be used to clean up any resources used by the gizmo.
             */
            recover(): void;
        }

        /**
         * The base class for gizmos that render lines. This class provides a common implementation for gizmos that render lines, such as GizmoLine and GizmoFrustum. It provides a method to add lines to a PixelLineSprite3D, and handles the rendering of the lines in the execute method.
         */
        export class GizmoLineBase extends GizmoBase {
            protected _isDotted: boolean;
            protected _dotScale: number;
            protected _dotTotalSize: number;
            protected _dotSize: number;
            protected _pickable: boolean;
            static line: Laya.PixelLineSprite3D;
            static lineMaterial: Laya.Material;
            static lineWithOcclusionMaterial: Laya.Material;
            static dottedLineMaterial: Laya.Material;
            constructor(dotted?: boolean);
            /**
             * Add lines to the given PixelLineSprite3D. This method should be implemented by subclasses to add the specific lines that they want to render. The PixelLineSprite3D can be used to add lines with specific start and end points, colors, etc.
             * @param line
             */
            protected addLine(line: Laya.PixelLineSprite3D): void;
            execute(cmdBuffer: Laya.CommandBuffer, enableOcclusion: boolean): void;
        }

        /**
         * The base class for handle that render meshes. This class provides a common implementation for handle that render meshes. It provides a method to set material data, which can be overridden by subclasses to set specific shader data for the material. It also handles the rendering of the mesh in the execute method.
         */
        export class GizmoMeshBase extends GizmoBase {
            mesh: Laya.Mesh;
            subMeshIndex: number;
            transform: Laya.Matrix4x4;
            color: Laya.Color;
            material: Laya.Material;
            static meshMaterial: Laya.Material;
            static meshWithOcclusionPassMaterial: Laya.Material;
            static transparentMeshMaterial: Laya.Material;
            static transparentMeshWithOcclusionPassMaterial: Laya.Material;
            constructor();
            protected setMaterialData(cmdBuffer: Laya.CommandBuffer, shaderData: Laya.ShaderData): void;
            execute(cmdBuffer: Laya.CommandBuffer, enableOcclusion: boolean): void;
        }

        export class AssetPreview implements IAssetPreview {
            static bgColor: Laya.Color;
            readonly scene: IOffscreenRenderScene;
            readonly sprite: Laya.Sprite;
            renderTarget: Laya.Sprite | Laya.Scene3D | null;
            constructor();
            get bgColor(): Laya.Color;
            set bgColor(value: Laya.Color);
            /**
             * Set target asset by its id.
             * @param assetId The id of the asset.
             * @returns Any data that can be used by the caller.
             */
            setAssetById(assetId: string, ...args: any[]): Promise<any>;
            setAsset(asset: IAssetInfo, ...args: any[]): Promise<any>;
            onReset(): void;
            onPreRender(): void;
            onPostRender(): void;
            changeShape(shape: string): Promise<void>;
            setLight(on: boolean): void;
            rotate(x: number, y: number): void;
            destroy(): void;
        }

        export class AssetThumbnail implements IAssetThumbnail {
            /**
             * Suggestions for the size of the thumbnail.
             */
            static readonly imageSize = 112;
            /**
             * Suggestions for the size of the border.
             */
            static readonly borderSize = 5;
            /**
             * Background color of the thumbnail.
             */
            static bgColor: Laya.Color;
            private static _border;
            private static _renderer;
            generate(asset: IAssetInfo): Promise<string | Buffer | null | "source">;
            destroy(): void;
            /**
             * Get a helper renderer for generating thumbnails.
             */
            static get offscreenRenderer(): IOffscreenRenderer;
            /**
             * Add border to ImageBitmap.
             * @param bitmap ImageBitmap instance.
             * @returns PNG format encoded data.
             */
            static addBorder(bitmap: ImageBitmap): Promise<Buffer>;
        }

        export class AssetImporter implements IAssetImporter {
            metaData: Record<string, any>;
            settings: Record<string, any>;
            importArgs: ReadonlyArray<string>;
            handleImport(): Promise<void>;
            get asset(): IAssetInfo;
            get parentAsset(): IAssetInfo;
            get isNewAsset(): boolean;
            get subAssets(): ReadonlyArray<ISubAssetInfo>;
            get assetFullPath(): string;
            clearLibrary(): void;
            get subAssetLocation(): string;
            createSubAsset(fileName: string, id?: string): ISubAssetInfo;
            createAsset(filePath: string, metaData?: any): IAssetInfo;
            setSubType(value: AssetType | string): void;
            addTypesToRegistry(types: FTypeDescriptor[]): void;
            setIsShader(shaderName: string, typeDef: FTypeDescriptor): void;
            getAssetPathById(assetId: string): string;
            findAsset(filePath: string, predicate?: (asset: IAssetInfo) => boolean): IAssetInfo;
            get tempPath(): string;
            /**
             * @param progress 0-100的值
             */
            setProgress(progress: number): void;
        }

        export class AssetExporter implements IAssetExporter {
            readonly asset: IAssetInfo;
            readonly fileExtensionOverrides: Record<string, string>;
            readonly exportInfo: IAssetExportInfo;
            readonly logger: ILogger;
            readonly prefabDataAnalyzer: IPrefabDataAnalyzer;
            readonly toolOptions: IExportAssetToolOptions;
            get parentAsset(): IAssetInfo;
            handleExport(): Promise<void>;
            /**
             * Parse the links, add referenced assets to the export queue, and then return the export dependency information.
             * @param links The links to be parsed.
             * @param basePath The base path of the links.
             * @returns The export dependency information.
             */
            protected parseLinks(links: Array<IAssetLinkInfo>, basePath?: string): Array<IAssetExportDepInfo>;
            /**
             * Add the asset to the export queue.
             * @param asset The asset to be added.
             * @returns The export information of the asset.
             */
            protected addQueue(asset: IAssetInfo): IAssetExportInfo;
            /**
             * Add a missing link record.
             * @param link The link information.
             */
            protected addBrokenLink(link: IAssetLinkInfo): void;
            /**
             * If you want to share data between different exporters, you can use this method.
             * @param key The key of the shared data.
             * @returns The shared data.
             */
            protected getSharedData<T extends any>(key: string): T;
            /**
             * If you want to share data between different exporters, you can use this method.
             * @param key The key of the shared data.
             * @param value The shared data.
             */
            protected setSharedData<T extends any>(key: string, value: T): void;
        }

        export class ServiceProvider implements IServiceProvider {
            private _name;
            private _handlers;
            protected _listenPort: MessagePort;
            protected _clients: Array<IMyMessagePort>;
            protected _subscribedClients: Array<MessagePort>;
            constructor(name: string);
            start(): Promise<void>;
            stop(): void;
            get started(): boolean;
            /**
             * Get all clients.
             */
            get clients(): ReadonlyArray<IMyMessagePort>;
            private registerClient;
            protected onNewClient(client: IMyMessagePort, ...args: any[]): Promise<void>;
            /**
             * Register a handler for a channel.
             * @param channel Channel name.
             * @param func Handler function.
             * @param thisArg This object of the handler function.
             * @param passClientParam Whether to pass the client object as the first parameter to the handler function.
             * @param noAwait If true, the handler function will not be awaited. Defaults to false.
             */
            handle(channel: string, func: Function, thisArg?: any, passClientParam?: boolean, noAwait?: boolean): void;
            /**
             * Broadcast a message to all clients those have `subscribe` flag setted to true.
             * @param channel Channel name.
             * @param args Message arguments.
             */
            notifyAll(channel: string, ...args: any[]): void;
        }


        /**
         * The `Conf` class is used to read and write configuration files.
         * @param path The path to the configuration file. The path is the absolute path.
         * @param fileName The name of the configuration file.
         */
        const Conf: new (path: string, fileName?: string) => IConf;

        /**
         * The `Delegate` class is used to create a delegate object.
         * 
         * It can be used to manage multiple callback functions and call them in sequence.
         */
        const Delegate: new <T extends (...args: any[]) => any>() => IDelegate<T>;

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
        /** Built-in polygon clipping, offsetting, and path utility library. */
        const Clipper2: IClipper2;

        /**
         * `Gizmos2D` is a helper class for drawing 2D gizmos.
         */
        const Gizmos2D: IGizmos2D;

        /**
         * `Gizmos` is a helper class for drawing 3D gizmos.
         */
        const Gizmos: IGizmos3D;

        /**
         * `Handles` is a helper class for drawing handles.
         */
        const Handles: IHandles;

        /**
         * `HandleUtils` is a helper class for manupulating handles.
         */
        const HandleUtils: typeof IHandleUtils;

        /**
         * The `ZipFileW` class is used to create a writable zip file.
         * @param basePath The base path of the zip file.
         * @see IZipFileW
         */
        const ZipFileW: new (basePath: string) => IZipFileW;

        /**
         * The `ZipFileR` class is used to create a readable zip file.
         * @see IZipFileR
         */
        const ZipFileR: new () => IZipFileR;

        /**
         * The `AbortToken` class is used to create an abort token.
         * Abort tokens are used to cancel asynchronous operations.
         * @see IAbortToken
         */
        const AbortToken: new () => IAbortToken;

        /**
         * The `utils` object provides various utility functions.
        */
        const utils: ICryptoUtils & INativeTools & IUUIDUtils & IObjectUtils & IUtils & INetUtils & ITemplateUtils & IPlist & IScriptTool & ITypeParser;

        /**
         * Some helper functions for line manipulation.
         */
        const LineEditor: typeof ILineEditor;

        /**
         * `CreateAssetUtil` is a helper class for creating assets.
         */
        const CreateAssetUtil: typeof ICreateAssetUtil;

        /**
         * `HierarchyWriter` is a helper class for serializing nodes and components.
         */
        const HierarchyWriter: typeof IHierarchyWriter;

        /**
         * `HierarchyValidator` is a helper class for validating hierarchy data.
         */
        const HierarchyValidator: new () => IHierarchyValidator;

        /**
         * `SerializeUtil` is a helper class for serializing and deserializing objects.
         */
        const SerializeUtil: typeof ISerializeUtil;

        /**
         * `ExportAssetTool` is a helper class for exporting assets.
         */
        const ExportAssetTool: new (options?: IExportAssetToolOptions) => IExportAssetTool;

        /**
         * `PrefabDataAnalyzer` is a helper class for analyzing prefab data.
         */
        const PrefabDataAnalyzer: new () => IPrefabDataAnalyzer;

        /**
         * `TypedDataAnalyzer` is a helper class for analyzing typed data.
         */
        const TypedDataAnalyzer: new () => ITypedDataAnalyzer;

        /**
         * `MaxRectsPacker` is a helper class for packing rectangles.
         * @param width The width of the packing area.
         * @param height The height of the packing area.
         * @param padding The padding between rectangles.
         * @param options The options for packing.
         */
        const MaxRectsPacker: new <T extends IRectangle>(width: number, height: number, padding: number, options?: IMaxRectsPackingOptions) => IMaxRectsPacker<T>;

        /**
         * `TexturePacker` is a helper class for packing textures.
         */
        const TexturePacker: typeof ITexturePacker;

        /**
         * `TextureTool` is a helper class for manipulating textures.
         */
        const TextureTool: typeof ITextureTool;

        /**
         * `CubemapTool` is a helper class for cubemap baking and conversion.
         */
        const CubemapTool: typeof ICubemapTool;

        /**
         * `OffscreenRenderer` is a helper class for rendering offscreen.
         * @param width The width of the offscreen renderer.
         * @param height The height of the offscreen renderer.
         */
        const OffscreenRenderer: new (width: number, height: number) => IOffscreenRenderer;

        /**
         * `OffscreenRenderScene` is a helper scene for rendering offscreen.
         */
        const OffscreenRenderScene: new () => IOffscreenRenderScene;

        /**
         * `CameraControls` is a helper class for controlling cameras.
         */
        const CameraControls: new (camera: Laya.Camera) => ICameraControls;

        /**
         * `ObjectUtils` is a helper class for icon files.
         */
        const IcoEncoder: new () => IIcoEncoder;

        /**
         * `I18nUtils` is a helper class for internationalization.
         */
        const i18nUtils: typeof II18nUtils;

        /**
         * Build task class.
         */
        const BuildTask: typeof BuildTaskStatic;

        /**
         * Laya DCC machanism.
         */
        const LayaDCC: typeof ILayaDCC;

        /**
         * The `PropsKey` symbol is used to define the key of the props.
         */
        const PropsKey: Symbol;

        /**
         * The `GUIPrefabWriter` class is used to write the GUI prefab to a file.
         */
        const GUIPrefabWriter: typeof IGUIPrefabWriter;

        /**
         * The `RelectUtils` class is used to manage metadata.
         */
        const ReflectUtils: typeof IReflectUtils;

        /**
         * The `JsonBin` object is used to serialize and deserialize objects into binary data.
         */
        const JsonBin: IJsonBin;

        /**
         * The `AssetDependencyTool` object is used to query asset dependencies and references.
         */
        const AssetDependencyTool: IAssetDependencyTool;
        /**
         * References a commonjs module. You can import built-in Node.js modules such as: path, fs, child_process, etc. 
         * The IDE also includes some third-party modules, including: electron, @svgdotjs, sharp, glob, qrcode, typescript, etc.
         * @param id The identifier of the module. For example: "path", "fs", "electron", etc.
         * @returns The module object.
         */
        function require(id: string): any;

        /**
         * Decorator function for registering a one-time initialization function.
         * @example
         * ```
         * class MyClass {
         *     ＠IEditorEnv.onLoad
         *     static onLoad() {
         *        console.log("Initialization function called.");
         *     }
         * }
         * ```
         */
        function onLoad(target: Object, propertyName: string): void;

        /**
         * Decorator function for registering a one-time cleanup function.
         * @example
         * ```
         * class MyClass {
         *     ＠IEditorEnv.onUnload
         *     static onUnload() {
         *        console.log("Cleanup function called.");
         *     }
         * }
         * ```
         */
        function onUnload(target: Object, propertyName: string): void;

        /**
         * Decorator function for registering a callback to be invoked when the user script loads.
         * 
         * The difference between `onUserScriptsLoad` and `onLoad` is that if the script is inside a package, `onUserScriptsLoad` will execute during every reload, but `onLoad` will not. This is because hot module replacement (HMR) triggered by user script modifications does not include the scripts from the package.
         */
        function onUserScriptsLoad(target: Object, propertyName: string): void;

        /**
         * Decorator function for registering a callback to be invoked when the Hot Module Replacement (HMR) ends.
         * 
         * The difference between `onUserScriptsUnload` and `onUnload` is that if the script is inside a package, `onUserScriptsUnload` will execute during every reload, but `onUnload` will not. This is because hot module replacement (HMR) triggered by user script modifications does not include the scripts from the package.
         */
        function onUserScriptsUnload(target: Object, propertyName: string): void;

        /**
         * Decorator function for registering a function that is called when the scene environment is about to be reloded.
         */
        function onPreload(target: Object, propertyName: string): void;

        /**
         * Decorator function for registering a class. The registered class can be accessed by its name from the UI process.
         * @returns The class decorator function.
         * @example
         * ```
         * ＠IEditorEnv.regClass()
         * class MyClass {
         *     static test() {
         *     }
         * }
         * 
         * //In UI process
         * IEditor.scene.runScript("MyClass.test");
         * ```
         */
        function regClass(): Function;

        /**
         * Decorator function for registering a class as a custom editor.
         * @param target The target class to be mounted with the custom editor.
         * @returns The class decorator function.
         * @example
         * ```
         * ＠IEditorEnv.customEditor(MyComponent)
         * class MyEditor extends IEditorEnv.CustomEditor {
         *    //...
         * }
         * ```
         */
        function customEditor(target: new () => Laya.Node | Laya.Component): (func: new () => CustomEditor) => void;

        /**
         * Decorator function for registering a class as a build plugin.
         * @param platform The target platform for the application. For example: "web", "android", "ios", etc.
         * @param piority Execution priority. The larger the number, the higher the priority
         */
        function regBuildPlugin(platform: string, piority?: number): (func: new () => IBuildPlugin) => void;

        /**
         * Decorator function for registering a class as an asset processor.
         * @returns The class decorator function.
         * @see IAssetProcessor
         * @example
         * ```
         * ＠IEditorEnv.regAssetProcessor()
         * class MyAssetProcessor implements IEditorEnv.IAssetProcessor {
         *    async onPostprocessAsset(assetImporter: IEditorEnv.IAssetImporter) {
         *   }
         * }
         * ```
         */
        function regAssetProcessor(): (func: new () => IAssetProcessor) => void;

        /**
         * Decorator function for registering a class as an asset importer.
         * @param assetTypeOrFileExts The asset type or file extensions that the importer can handle.
         * @param options The options for the importer.
         * @returns The class decorator function.
         * @see IAssetImporter
         * @example
         * ```
         * ＠IEditorEnv.regAssetImporter(["abc"])
         * export class DemoAssetImporter extends IEditorEnv.AssetImporter {
         *     async handleImport(): Promise<any> {
         *         console.log("importing asset", this.assetFullPath);
         *     }
         * }
         * ```
         */
        function regAssetImporter(assetTypeOrFileExts: ReadonlyArray<AssetType | string>, options?: IAssetImporterOptions): (func: new () => AssetImporter) => void;

        /**
         * Decorator function for registering a class as an asset exporter.
         * @param assetTypeOrFileExts The asset type or file extensions that the exporter can handle.
         * @param options The options for the exporter.
         * @returns The class decorator function.
         * @see IAssetExporter
         * @example
         * ```
         * ＠IEditorEnv.regAssetExporter(["abc"])
         * export class DemoAssetExporter extends IEditorEnv.AssetExporter {
         *     async handleExport(): Promise<any> {
         *         console.log("exporting asset", this.asset.file);
         *
         *         this.exportInfo.contents[0] = { type: "text", data: "exported" };
         *     }
         *  }
         * ```
         */
        function regAssetExporter(assetTypeOrFileExts: ReadonlyArray<AssetType | string>, options?: IAssetExporterOptions): (func: new () => AssetExporter) => void;

        /**
         * Decorator function for registering a class as an asset saver.
         * @param assetTypeOrFileExts The asset type or file extensions that the saver can handle.
         * @returns The class decorator function.
         * @see IAssetSaver
         * @example
         * ```
         * ＠IEditorEnv.regAssetSaver(["abc"])
         * export class DemoAssetSaver implements IEditorEnv.IAssetSaver {
         *    async onSave(asset: IEditorEnv.IAssetInfo, res: ABCResource): Promise<void> {
         *       let data = IEditorEnv.SerializeUtil.encodeObj(res, null, { writeType: false });
         *       await IEditorEnv.utils.writeJsonAsync(EditorEnv.assetMgr.getFullPath(asset), data);
         *   }
         * }
         * ```
         */
        function regAssetSaver(assetTypeOrFileExts: ReadonlyArray<AssetType | string>): (func: new () => IAssetSaver) => void;

        /**
         * Decorator function for registering a class as a scene hook.
         * @returns The class decorator function.
         * @see ISceneHook
         * @example
         * ```
         * ＠IEditorEnv.regSceneHook()
         * class MySceneHook implements IEditorEnv.ISceneHook {
         *   onCreateNode(scene: IEditorEnv.IGameScene, node: Laya.Node) {
         *      if (node instanceof Laya.Sprite)
         *          node.anchorX = node.anchorY = 0.5;
         *   }
         * }
         * ```
         */
        function regSceneHook(): (func: new () => ISceneHook) => void;
    }

    /**
     * EditorEnv is a global object used to access various functions of the editor.
     */
    var EditorEnv: IEditorEnv.IEditorEnvSingleton;
}
