export { };
declare global {
    /**
     * Namespace containing various editor-related classes and functions.
     * 
     * All classes and functions in this namespace are running in the UI process.
     *
     * @remarks In documentation examples, the full-width character `＠` represents the
     * TypeScript decorator character `@`. Replace `＠` with `@` when copying an example.
     * The substitution prevents TypeScript's JSDoc parser from treating decorators inside
     * fenced `@example` blocks as new JSDoc tags.
     */
    export namespace IEditor {
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
         * An Electron `<webview>` managed by the editor. Use this for isolated content
         * that needs its own renderer process and message port.
         */
        export interface IWebview extends IWebFrameBase {
            /**
             * HTML element of the webview.
             */
            readonly element: WebviewTag;

            /**
             * Communication port to the process running in the webview.
             */
            readonly port: IMyMessagePort;

            /**
             * Electron webContents ID of the webview.
             */
            readonly webContentsId: number;

            /**
             * Load a URL in the webview.
             * @param url The URL to load.
             * @param preload The preload script to use.
             */
            load(url: string, preload?: string): void;

            /**
             * Load a URL in the webview and wait until it is ready.
             * @param url The URL to load. 
             * @param preload The preload script to use.
             */
            loadUntilReady(url: string, preload?: string): Promise<void>;

            /**
             * Reload the webview.
             */
            reload(): void;
        }

        /** Options used when creating an editor-managed iframe. */
        export interface IWebIFrameOptions {
            /** Whether rendering is throttled while the frame target is inactive. Defaults to true. */
            backgroundThrottling?: boolean;

            /**
             * Restrict the frame to passive content. Script execution, forms, popups,
             * downloads and top-level navigation are disabled while editor-side DOM
             * access remains available for theme, focus and drag/drop integration.
             */
            sandbox?: boolean;
        }

        /**
         * A DOM iframe managed by the editor and hosted in the current renderer process.
         * Use {@link loaded} or await {@link loadUntilReady} before accessing its document.
         */
        export interface IWebIFrame extends IWebFrameBase {
            /**
             * HTML element of the iframe.
             */
            readonly element: HTMLIFrameElement;

            /**
             * Communication port to the window of the iframe.
             */
            readonly port: IMyMessagePort;

            /**
             * Event that is triggered when the iframe is loaded.
             */
            readonly onLoad: IDelegate<() => void>;

            /**
             * Whether the iframe is ready. After the iframe is ready, it is safe to use contentDocument.
             */
            readonly loaded: boolean;

            /**
             * Whether the iframe is loading.
             */
            readonly loading: boolean;

            /**
             * Load a URL in the iframe.
             * @param url URL to load.
             */
            load(url: string): void;

            /**
             * Load a URL in the iframe and wait until the iframe is ready.
             * @param url URL to load.
             */
            loadUntilReady(url: string): Promise<void>;

            /**
             * Set document content of the iframe.
             * @param html HTML content to set. 
             */
            setContent(html: string): void;
        }

        /** Shared lifecycle and geometry operations for editor-managed web frames. */
        export interface IWebFrameBase {
            /**
            * HTML element of the frame.
            */
            readonly element: HTMLElement;

            /**
             * Width of the frame.
             */
            readonly width: number;

            /**
             * Height of the frame.
             */
            readonly height: number;

            /**
             * Attach the frame to a placeholder widget. The frame will be visible when attached.
             * 
             * When using this method, the panel where the frame is located needs special settings, that is:
             * ```
             * ＠IEditor.panel("XXX", { transparent: true })
             * class XXXPanel extends IEditor.EditorPanel {
             *     async create() {
             *        ...
             *         this._panel.touchThrough = true;
             *    }
             * }
             * ```
             * 
             * If the frame is a WebIFrame, this method is optional. You can directly add the element to the DOM. For example:
             * ```
             * anyWidget.element.appendChild(anInstance.element);
             * ```
             * In this case, the iframe will not be managed by WebFrameBase. It will usually refresh when the panel is switched, which is suitable for general display purposes. The advantage is that there is no need to set the panel to be transparent.
             * 
             * @param placeHolder The placeholder widget to attach the frame to.
             */
            show(placeHolder: gui.Widget): void;

            /**
             * Set the size of the frame.
             * @param width The width of the frame. 
             * @param height The height of the frame. 
             */
            setViewSize(width: number, height: number): void;

            /**
             * Set the scroll position of the frame.
             * @param x The x position of the scroll. 
             * @param y The y position of the scroll. 
             */
            setScrollPos(x: number, y: number): void;

            /**
             * Set the scale of the frame.
             * @param x The x scale of the frame. 
             * @param y The y scale of the frame. 
             */
            setScale(x: number, y: number): void;

            /**
             * Destroy the frame.
             */
            dispose(): void;
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

        /** Converts decorator/runtime type metadata into editor property descriptors. */
        export interface ITypeParser {
            /** Get class metadata, optionally creating an empty metadata record when absent. */
            getClassMeta(constructor: Function, forceCreate?: boolean): any;
            /** Parse a constructor, enum, array, record, or property-options value into descriptor fields. */
            parsePropType(ptype: any): Partial<FPropertyDescriptor>;
        }

        /**
         * Public contract for the editor title bar.
         */
        export interface ITitleBar {
            /**
             * Reserved title bar height in pixels.
             * Consumers usually use this value to set top margin/inset.
             */
            readonly height: number;
        }

        /**
         * Public types and runtime values exposed through `IEditor.Timeline`.
         *
         * @example
         * ```tsx
         * const data = {
         *   fps: 30,
         *   aniData: { name: "", prop: [{ name: "opacity", keys: [{ f: 0, val: 1 }] }] }
         * };
         * reactDOM.render(<IEditor.Timeline.TimelineEditor data={data} />);
         * ```
         */
        export namespace ITimeline {
            /** Visual editing mode used by the Timeline component. */
            type TimelineMode = "frame" | "curves";

            /** Opaque structured value stored by a host application. */
            interface TimelinePropertyObject {
                [key: string]: unknown;
            }

            /**
             * Values supported by the Timeline data model.
             *
             * Numeric values can be displayed and interpolated in Curve mode. Strings
             * and booleans are discrete. Objects and arrays remain opaque unless a
             * {@link TimelineCustomValueAdapter} supplies additional semantics.
             */
            type TimelinePropertyValue = number | string | boolean | TimelinePropertyObject | unknown[] | null | undefined;

            /** Host-defined metadata attached to a keyframe. */
            interface TimelineKeyExtension {
                /** Optional numeric error or tolerance associated with the key. */
                error?: number;
                [key: string]: unknown;
            }

            /** An event marker displayed in the Timeline event lane. */
            interface TimelineEvent {
                /** Trigger time in seconds. */
                time?: number;
                /** Trigger position in frames. Takes precedence when supplied. */
                f?: number;
                /** Host-defined event name. */
                eventName: string;
                /** Event arguments preserved by the Timeline without conversion. */
                params: TimelineValue[];
            }

            /** Mutable viewport and interaction state, kept separately from Timeline data. */
            interface TimelineViewState {
                /** Horizontal content offset in CSS pixels. */
                scrollX: number;
                /** Horizontal time-axis scale. */
                scaleX: number;
                /** Vertical scale used by Curve mode. */
                scaleY: number;
                /** Frame-mode row offset in CSS pixels. */
                scrollY: number;
                /** Optional Curve-mode vertical offset in CSS pixels. */
                curvesScrollY?: number;
                /** Current playhead position in frames. */
                currFrame: number;
                /** Canonical paths of selected tracks. */
                selectLayers: string[];
                /** Expanded state indexed by canonical track path. */
                isOpen: Record<string, boolean>;
                /** Selected key paths indexed by frame number. */
                selectKeys: Record<number, string[]>;
                /** Selected event objects. */
                selectEvent: TimelineEvent[];
                /** Selected interval items. */
                selectRanges?: TimelineRangeSelection[];
            }

            /**
             * Mutable document consumed directly by the Timeline component.
             *
             * The component intentionally edits this object in place. A host can therefore
             * expose its native animation data without constructing a second render
             * document or converting all keyframes on every update.
             */
            interface TimelineDocument {
                /** Frames per second used for time conversion and ruler labels. */
                fps?: number;
                /** Whether playback wraps at the end of the document. */
                loop?: boolean;
                /** Event markers displayed in the event lane. */
                event?: TimelineEvent[];
                /** Root track/layer node. */
                aniData?: TimelineLayer;
                /** Explicit document length in frames. */
                totalFrame?: number;
                /** Whether the playhead is drawn. */
                showCursor?: boolean;
                /** Global keyframe editing capability. Individual layers can further disable editing. */
                keyEditable?: boolean;
                /** Whether event markers can be selected, added, moved or removed. The event lane remains visible. */
                eventEditable?: boolean;
                /** Global interval/range editing capability. Individual ranges can still be locked. */
                rangeEditable?: boolean;
                /** Edge-to-edge range snapping distance in CSS pixels. Zero or omitted disables snapping. */
                rangeSnapThreshold?: number;
                /** Whether the built-in horizontal scrollbar is visible. */
                showScrollbar?: boolean;
                /**
                 * Gesture used when dragging empty frame content. The default performs
                 * key marquee selection; `"pan"` moves the viewport horizontally.
                 */
                frameBackgroundDrag?: "select" | "pan";
            }

            /** A hierarchical Timeline track or property layer. */
            interface TimelineLayer {
                /** Stable name used to construct the canonical track path. */
                name: string;
                /** Optional display label independent of {@link name}. */
                label?: string;
                /** Set to `false` for a grouping node that should not render its own row. */
                showRow?: boolean;
                /** Child track nodes. */
                child?: TimelineLayer[];
                /** Keyframes stored directly on this layer. */
                keys?: TimelineKey[];
                /** Host-neutral interval items rendered on this row. */
                ranges?: TimelineRange[];
                /** Whether keys on this layer are editable. Defaults to `true`. */
                keyEditable?: boolean;
                /** Property layers associated with the track. */
                prop?: TimelineLayer[];
                /** Additional host metadata is preserved by the Timeline. */
                [key: string]: unknown;
            }

            /**
             * A host-neutral interval item such as an animation clip, audio segment,
             * or state span. Timeline only interprets time bounds and edit flags;
             * {@link payload} remains opaque.
             */
            interface TimelineRange {
                /** Stable identity within its track. */
                id: string;
                /** Visual start position in frames. */
                start: number;
                /** Visual end position in frames. */
                end: number;
                /** Optional label drawn inside the interval. */
                label?: string;
                /** Allows the label to extend past the interval's right edge. Defaults to `false`. */
                labelOverflow?: boolean;
                /** Optional solid CSS fill. Omit it to use the themed Timeline clip gradient. */
                color?: string;
                /** Optional CSS color used for the interval label. */
                textColor?: string;
                /** Whether the interval can be moved horizontally. Defaults to `true`. */
                movable?: boolean;
                /** Allows a horizontal move gesture to retarget this range to another visible track. */
                trackMovable?: boolean;
                /** Whether the start edge can be trimmed. */
                trimStart?: boolean;
                /** Whether the end edge can be trimmed. */
                trimEnd?: boolean;
                /** Prevents all interval editing when `true`. */
                locked?: boolean;
                /** Set to `false` for visual/reference ranges that must not consume pointer input. */
                interactive?: boolean;
                /** Set to `false` when a host overlay draws the range itself. */
                draw?: boolean;
                /** Arbitrary host data ignored by the Timeline core. */
                payload?: unknown;
            }

            /** Stable selection reference for a range on a track. */
            interface TimelineRangeSelection {
                /** Canonical source-track path. */
                path: string;
                /** Range ID within the track. */
                id: string;
            }

            /** Stable reference to a selected keyframe. */
            interface TimelineKeySelection {
                /** Canonical keyframe path. */
                path: string;
                /** Key position in frames. */
                frame: number;
            }

            /** Range operation currently being previewed or committed. */
            type TimelineRangeEditKind = "move" | "trimStart" | "trimEnd";

            /** Description of one range move or trim operation. */
            interface TimelineRangeChange {
                /** Canonical source-track path. */
                path: string;
                /** Destination track during an opt-in cross-track move. Defaults to path. */
                targetPath?: string;
                /** Mutable source range object. */
                range: TimelineRange;
                /** Type of edit being performed. */
                kind: TimelineRangeEditKind;
                /** Range start before the gesture began. */
                previousStart: number;
                /** Range end before the gesture began. */
                previousEnd: number;
                /** Proposed or committed start position in frames. */
                start: number;
                /** Proposed or committed end position in frames. */
                end: number;
            }

            /** Canvas geometry produced for a visible range during the current render. */
            interface TimelineRangeRenderInfo {
                /** Canonical track path used for this render. */
                path: string;
                range: TimelineRange;
                /** Rendered start position in frames. */
                start: number;
                /** Rendered end position in frames. */
                end: number;
                /** Left coordinate in Canvas CSS pixels. */
                left: number;
                /** Top coordinate in Canvas CSS pixels. */
                top: number;
                /** Rendered width in Canvas CSS pixels. */
                width: number;
                /** Rendered height in Canvas CSS pixels. */
                height: number;
                /** Whether the range is selected. */
                selected: boolean;
            }

            /** Drawing context supplied to host-owned Canvas overlays. */
            interface TimelineFrameOverlayContext {
                /** Canvas 2D context already scaled for the device pixel ratio. */
                context: CanvasRenderingContext2D;
                /** Full Canvas bounds in CSS pixels. */
                canvasRect: { x: number; y: number; width: number; height: number };
                /** Track-content bounds in CSS pixels. */
                contentRect: { x: number; y: number; width: number; height: number };
                /** Uniform visible-row height in CSS pixels. */
                rowHeight: number;
                /** Range geometry generated by the built-in range renderer. */
                ranges: readonly TimelineRangeRenderInfo[];
                /** Converts a frame position to a Canvas x-coordinate. */
                frameToX(frame: number): number;
                /** Converts a Canvas x-coordinate to a frame position. */
                xToFrame(x: number): number;
            }

            /** Pointer position resolved into Timeline frame and track coordinates. */
            interface TimelineFramePointerContext {
                /** Canvas-local x-coordinate in CSS pixels. */
                x: number;
                /** Canvas-local y-coordinate in CSS pixels. */
                y: number;
                /** Frame nearest the pointer. */
                frame: number;
                /** Canonical track path under the pointer, when any. */
                path?: string;
                /** Track-content bounds in CSS pixels. */
                contentRect: { x: number; y: number; width: number; height: number };
                /** Uniform row height in CSS pixels. */
                rowHeight: number;
            }

            /** Context passed to a host-owned range context menu. */
            interface TimelineRangeContextMenuContext extends TimelineFramePointerContext {
                /** Canonical path of the clicked range. */
                path: string;
                /** Range that received the context-menu click. */
                range: TimelineRange;
                /** Complete range selection after the clicked range is selected. */
                selection: readonly TimelineRangeSelection[];
            }

            /** Host context for applying a range payload from the system clipboard. */
            interface TimelineRangePasteContext {
                /** Raw system clipboard text. */
                text: string;
                /** Current playhead frame used as the paste origin. */
                frame: number;
                /** Preferred destination track, when one is selected. */
                path?: string;
                /** Range selection at the time of the paste command. */
                selection: readonly TimelineRangeSelection[];
            }

            /** External drag-and-drop context resolved into Timeline coordinates. */
            interface TimelineFrameDropContext {
                /** Canvas-local x-coordinate in CSS pixels. */
                x: number;
                /** Canvas-local y-coordinate in CSS pixels. */
                y: number;
                /** Frame nearest the pointer. */
                frame: number;
                /** Canonical track path under the pointer, when any. */
                path?: string;
                /** Browser client x-coordinate. */
                clientX: number;
                /** Browser client y-coordinate. */
                clientY: number;
                /** Native drag payload supplied by the browser. */
                dataTransfer: DataTransfer;
            }

            /** Pointer session returned by a host overlay that captures a gesture. */
            interface TimelineFramePointerSession {
                /** Called for each captured pointer move. */
                move(context: TimelineFramePointerContext): void;
                /** Called once when the pointer is released. */
                end(context: TimelineFramePointerContext): void;
                /** Called when the gesture is aborted or the Timeline is disposed. */
                cancel?(): void;
            }

            /** Mutable keyframe stored directly in a Timeline layer. */
            interface TimelineKey {
                /** Key position in frames. */
                f: number;
                /** Key value. */
                val: TimelinePropertyValue;
                /** Interpolation identifier, such as a built-in easing name. */
                tweenType?: string;
                /** Optional host-defined key metadata. */
                extend?: TimelineKeyExtension;
                /** Bezier tangent and weight information used by Curve mode. */
                tweenInfo?: TimelineTweenInfo;
                /** Optional source frame retained by copy, paste, or offset operations. */
                srcF?: number;
                /** Additional host fields are preserved by the Timeline. */
                [key: string]: unknown;
            }

            /** Host-neutral evaluation result for one Timeline position. */
            interface TimelineEvaluatedFrame {
                /** Name of the evaluated root layer. */
                rootName: string;
                /** Evaluated values indexed by canonical Timeline path. */
                values: Record<string, TimelineKey["val"] | null | undefined>;
            }

            /** Callback used to visit evaluated path/value pairs without allocating a new host document. */
            type TimelineFrameValueVisitor = (
                path: string,
                value: TimelineKey["val"] | null | undefined,
            ) => void;

            /** Legacy hierarchical frame-value shape preserved for host integrations. */
            interface TimelineFrameData {
                /** Property values for this node. */
                prop?: TimelinePropertyObject;
                /** Child-node values indexed by name. */
                child?: Record<string, TimelineFrameData>;
            }

            /** Bezier tangent and weight settings for a numeric key. */
            interface TimelineTweenInfo {
                /** Outgoing tangent slope. */
                outTangent?: number;
                /** Outgoing tangent weight. */
                outWeight?: number;
                /** Incoming tangent slope. */
                inTangent?: number;
                /** Incoming tangent weight. */
                inWeight?: number;
                /** Whether the incoming tangent weight is locked. */
                inWeightLock?: boolean;
                /** Whether the outgoing tangent weight is locked. */
                outWeightLock?: boolean;
                /** Whether incoming and outgoing tangents may be edited independently. */
                broken?: boolean;
            }

            /** Alias used by event parameters and generic Timeline value APIs. */
            type TimelineValue = TimelinePropertyValue;

            /** Rendered Curve-mode key and its neighboring keys. */
            interface TimelineDisplayedKey {
                /** Key hit bounds and center coordinates in Canvas CSS pixels. */
                x: number;
                y: number;
                x2: number;
                y2: number;
                cx: number;
                cy: number;
                key: TimelineKey;
                path: string;
                next?: TimelineKey;
                prev?: TimelineKey;
            }

            /** Cached Canvas geometry and display flags for one key. */
            interface TimelineDisplayedKeyPosition {
                /** Key position in frames. */
                f: number;
                /** Key hit bounds and center coordinates in Canvas CSS pixels. */
                x: number;
                y: number;
                x2: number;
                y2: number;
                cx: number;
                cy: number;
                col: string;
                isSelect?: boolean;
                isOffset?: boolean;
                noIn?: boolean;
            }

            /** Cached display description for a visible Timeline layer. */
            interface TimelineDisplayedLayer {
                /** Mutable source layer. */
                data: TimelineLayer;
                /** Canonical layer path. */
                path: string;
                /** Display label. */
                label: string;
                /** Whether this row represents a directory/group. */
                isDir: boolean;
                /** Horizontal label offset in CSS pixels. */
                x: number;
                /** Whether this is a property row rather than a node track. */
                isProperty: boolean | undefined;
                /** Optional row y-coordinate in CSS pixels. */
                y?: number;
                /** Optional visible-row index. */
                index?: number;
                /** Cached key geometry. */
                keys: TimelineDisplayedKeyPosition[];
                /** Key at the current playhead, when any. */
                currKey?: TimelineKey | null;
            }

            /** Request issued when the Timeline needs the host to create a property layer. */
            interface TimelineCreateLayerRequest {
                /** Canonical node path that will own the property. */
                namePath: string;
                /** Property path segments. */
                prop: string[];
                /** Layer data prepared by the Timeline. */
                data: TimelineLayer;
            }

            /** Context for creating a key whose value requires host-defined semantics. */
            interface TimelineCustomKeyContext {
                /** Existing keys on the target layer. */
                keys: TimelineKey[];
                /** Requested key position in frames. */
                frame: number;
                /** Canonical target path. */
                path: string;
                /** Sorted insertion index for the new key. */
                insertIndex: number;
                /** Previous adjacent key, when any. */
                previousKey: TimelineKey | null;
                /** Next adjacent key, when any. */
                nextKey: TimelineKey | null;
                /** Current value supplied by the host. */
                currentValue: TimelineKey["val"] | null;
            }

            /** Value returned by a custom evaluator or formatter. */
            interface TimelineCustomValueResult {
                value: TimelinePropertyValue;
                /** Whether the Timeline may cache this result. Defaults to `true`. */
                cacheable?: boolean;
            }

            /** Context for interpolating an opaque host value between two keys. */
            interface TimelineCustomInterpolationContext {
                /** Canonical path being evaluated, when available. */
                path?: string;
                /** Start key of the segment. */
                start: TimelineKey;
                /** End key of the segment. */
                end: TimelineKey;
                /** Normalized segment position in the range `[0, 1]`. */
                timeScale: number;
            }

            /** Context for converting an evaluated value into a display value. */
            interface TimelineCustomFormatContext {
                path: string;
                value: TimelinePropertyValue;
                /** Source key when formatting an exact-key result. */
                key?: TimelineKey;
            }

            /** Restricted mutation surface available to a custom add-key hook. */
            interface TimelineCustomAddKeyOperations {
                /** Returns adjacent keys around a frame. */
                getStartAndEndKey(path: string, frame: number): StartEndKeys | null;
                /** Invalidates cached evaluation results for a path. */
                removeCache(path: string): void;
                /** Adds a key through the built-in direct insertion path. */
                addKeyDirect(path: string, frame: number): TimelineKey[] | null;
                /** Whether a track currently exists at the path. */
                hasTrack(path: string): boolean;
                /** Removes a track created during the current operation. */
                removeTrack(path: string): void;
                /** Marks the Timeline document as modified. */
                markModified(): void;
                /** Cancels a pending modification scheduled by the built-in path. */
                cancelPendingModification(): void;
                /** Notifies the host that a key value changed. */
                notifyKeyChanged(key: TimelineKey): void;
            }

            /** Context passed before the Timeline performs its built-in add-key operation. */
            interface TimelineCustomAddKeyContext {
                path: string;
                frame: number;
                /** Optional value explicitly supplied by the caller. */
                value?: TimelinePropertyValue;
                operations: TimelineCustomAddKeyOperations;
            }

            /** Result returned when a custom add-key hook handled the operation. */
            interface TimelineCustomAddKeyResult {
                /** Keys created or updated by the custom operation. */
                keys: TimelineKey[];
            }

            /** Context emitted after keys are removed from a layer. */
            interface TimelineCustomKeysRemovedContext {
                path: string;
                layer: TimelineLayer;
                /** Keys removed by the operation. */
                keys: TimelineKey[];
            }

            /**
             * Optional host semantics for opaque values and specialized key creation.
             * Numeric, string, and boolean data do not require an adapter.
             */
            interface TimelineCustomValueAdapter {
                /** Creates a key value for an opaque host type. Return `null` to use the built-in path. */
                createKey?(context: TimelineCustomKeyContext): TimelineKey | null;
                /** Interpolates an opaque value. Return `null` when the segment is unsupported. */
                interpolate?(context: TimelineCustomInterpolationContext): TimelineCustomValueResult | null;
                /** Converts an evaluated value to a host-defined display representation. */
                formatEvaluatedValue?(context: TimelineCustomFormatContext): TimelineCustomValueResult | null;
                /** Handles add-key behavior before the built-in implementation. */
                beforeAddKey?(context: TimelineCustomAddKeyContext): TimelineCustomAddKeyResult | null;
                /** Receives removed keys after the built-in removal operation. */
                afterRemoveKeys?(context: TimelineCustomKeysRemovedContext): void;
                /** Whether a track may update a key from the host's current property value. */
                canUpdateFromCurrentValue?(path: string, layer: TimelineLayer): boolean;
                /** Whether evaluation must use an exact key instead of interpolation. */
                useExactKey?(path: string): boolean;
                /** Whether adjacent keys at an exact frame participate in matching. */
                matchAdjacentKeysAtExactFrame?(path: string): boolean;
            }

            /**
             * Host boundary for notifications, menus, value access, and
             * extension drawing. Every hook is optional.
             */
            interface TimelineActions {
                /** Called with the new playhead position. */
                onCurrentFrameChange?(frame: number): void;
                /** Called after Timeline data is modified; `key` identifies the changed key when available. */
                onDataModified?(key?: TimelineKey): void;
                /** Called when a grouped document edit begins or ends. */
                onEditTransactionChange?(active: boolean): void;
                /** Called after a scheduled Timeline render completes. */
                onRenderFinished?(): void;
                /** Called with the new playback state. */
                onPlaybackChange?(playing: boolean): void;
                /** Called with the new document frame rate. */
                onFpsChange?(fps: number): void;
                /** Called after switching between Frame and Curve modes. */
                onModeChange?(mode: TimelineMode): void;
                /** Called with the complete event-marker selection. */
                onEventSelectionChange?(selection: readonly TimelineEvent[]): void;
                /** Called with the complete selected track-path list. */
                onLayerSelectionChange?(paths: readonly string[]): void;
                /** Called with the complete selected keyframe list. */
                onKeySelectionChange?(selection: readonly TimelineKeySelection[]): void;
                /** Called once after a range move or trim is committed. */
                onRangeModified?(change: TimelineRangeChange): void;
                /**
                 * Called for each accepted range preview during a pointer gesture and
                 * once with the original values when a rejected drop is restored.
                 */
                onRangeChanging?(change: TimelineRangeChange): void;
                /** Called after the selected range IDs change. */
                onRangeSelectionModified?(selection: readonly TimelineRangeSelection[]): void;
                /**
                 * Adjusts or validates a range preview. Return corrected `start` and
                 * `end` values to accept it, or `null` to reject the drop. A rejected
                 * cross-track preview still follows the pointer and is restored when
                 * the pointer is released.
                 */
                constrainRangeEdit?(change: TimelineRangeChange): Pick<TimelineRangeChange, "start" | "end"> | null;
                /** Draws host-specific track content. The renderer clips it to contentRect. */
                drawFrameOverlay?(context: TimelineFrameOverlayContext): void;
                /** Draws host-specific ruler content. The renderer clips it to the ruler area. */
                drawFrameRulerOverlay?(context: TimelineFrameOverlayContext): void;
                /**
                 * Begins a host-owned pointer gesture over frame or ruler content.
                 * Return `null` to let the built-in Timeline interaction continue.
                 */
                beginFrameOverlayPointer?(context: TimelineFramePointerContext): TimelineFramePointerSession | null;
                /** Shows a host-owned context menu for a range. */
                onRangeContextMenu?(context: TimelineRangeContextMenuContext): void;
                /** Shows a host-owned context menu for frame content not handled by a range. */
                onFrameContextMenu?(context: TimelineFramePointerContext): void;
                /** Serializes selected host ranges for the system clipboard. */
                getRangeClipboardText?(selection: readonly TimelineRangeSelection[]): string | null;
                /** Applies a host-owned range clipboard payload. Return `true` when handled. */
                onPasteRanges?(context: TimelineRangePasteContext): boolean;
                /** Removes selected host ranges. Timeline clears its range selection afterward. */
                onRemoveRanges?(selection: readonly TimelineRangeSelection[]): void;
                /** Returns `true` to accept an external drag over the time area. */
                onFrameDragOver?(context: TimelineFrameDropContext): boolean;
                /** Applies an accepted external drop. */
                onFrameDrop?(context: TimelineFrameDropContext): void;
                /** Returns the host's current property value for a canonical path. */
                getCurrentValue?(path: string): TimelineKey["val"] | null;
                /**
                 * Called after Timeline finishes removing selected property tracks.
                 * The host should restore source values that preview evaluation may
                 * have applied to live objects. Timeline treats this as a notification
                 * and does not await asynchronous restoration.
                 */
                onRestoreSourcePropertyValues?(): void;
                /** Returns whether a property track may be removed. */
                confirmRemovePropertyTrack?(property: string): boolean | Promise<boolean>;
                /** Creates a host property layer requested by the Timeline. */
                onCreateLayer?(data: TimelineCreateLayerRequest): void;
                /** Returns property-key names available below a canonical path. */
                getAllPropertyKeys?(path: string): string[] | null;
                /** Optional semantics for opaque host values such as spatial paths. */
                customValueAdapter?: TimelineCustomValueAdapter;
            }

            /** Adjacent keys surrounding an evaluated frame. */
            interface StartEndKeys {
                start: TimelineKey | null;
                end: TimelineKey | null;
            }

            /** Current editor state returned without exposing the Canvas implementation. */
            interface TimelineEditorSnapshot {
                /** Current playhead position in frames. */
                position: number;
                /** Current visual editing mode. */
                mode: TimelineMode;
                /** Computed document length in frames. */
                totalFrame: number;
                /** Uniform track-row height in CSS pixels. */
                rowHeight: number;
                /** Whether data editing is disabled. */
                readOnly: boolean;
                /** Whether the document has uncommitted changes. */
                modified: boolean;
                /** Whether playback is active. */
                playing: boolean;
                /** Current document frame rate. */
                fps: number;
            }

            /** Generic mutable-document operations owned by Timeline. */
            interface TimelineDocumentHandle {
                /** Returns the mutable document supplied through {@link TimelineEditorProps.data}. */
                getData(): TimelineDocument;
                /** Returns the document prepared for persistence, including derived duration/event times. */
                getSaveData(): TimelineDocument;
                /** Resolves an existing track by canonical path. */
                getLayer(path: string): TimelineLayer | null;
                /** Resolves an existing key at an exact frame. */
                getKey(path: string, frame: number): TimelineKey | null;
                /** Performs the normal Timeline add-key operation, including history and rendering. */
                addKey(path: string, frame?: number, value?: TimelinePropertyValue): TimelineKey[] | null;
                /** Writes through Timeline's key mutation rules without forcing an immediate render. */
                writeKey(path: string, frame?: number, value?: TimelinePropertyValue): TimelineKey[] | null;
                /** Removes a complete track. */
                removeTrack(path: string): boolean;
                /** Returns the keys surrounding an evaluated frame. */
                getAdjacentKeys(path: string, frame?: number): StartEndKeys | null;
                /** Replaces a canonical path. */
                renamePath(path: string, newPath: string): boolean;
                /** Renames one path segment and updates descendants. */
                renameSegment(path: string, newName: string): boolean;
                /** Evaluates all Timeline values at a frame. */
                evaluate(frame?: number): TimelineEvaluatedFrame | null;
                /** Evaluates one canonical path at a frame. */
                evaluatePath(path: string, frame?: number): TimelineValue;
                /** Visits evaluated values without allocating a value map. */
                visitValues(visitor: TimelineFrameValueVisitor, frame?: number): string | null;
                /** Updates the document frame rate. */
                setFps(fps: number): void;
            }

            /** Generic track/key/event selection operations owned by Timeline. */
            interface TimelineSelectionHandle {
                isTrackSelected(path: string): boolean;
                getTracks(includeDirectoryTracks?: boolean): string[];
                setTracks(paths: readonly string[]): void;
                clearTracks(path?: string): boolean;
                selectTrackKeys(): void;
                removeSelectedTracks(): void;
                clearEventSelection(): void;
            }

            /** Host-facing description of one visible Timeline row. */
            interface TimelineTrackRow {
                /** Stable row identity. It currently matches {@link path}. */
                id: string;
                /** Canonical path used for data lookup and selection. */
                path: string;
                /** Display label. */
                label: string;
                /** Suggested horizontal label indentation in CSS pixels. */
                labelIndent: number;
                /** Hierarchy depth. */
                depth: number;
                /** Whether the row owns expandable children. */
                directory: boolean;
                /** Whether a directory row is expanded. */
                opened: boolean;
                /** Whether the track is selected. */
                selected: boolean;
            }

            /** Geometry shared between Timeline time content and a host-owned row list. */
            interface TimelineTrackLayout {
                /** Visible rows in render order. */
                rows: readonly TimelineTrackRow[];
                /** Uniform row height in CSS pixels. */
                rowHeight: number;
                /** Canvas y-coordinate where track content begins. */
                contentTop: number;
                /** Visible track-content height in CSS pixels. */
                viewportHeight: number;
                /** Positive vertical scroll offset in CSS pixels. */
                scrollTop: number;
                /** Total scrollable row-content height in CSS pixels. */
                contentHeight: number;
            }

            /** Imperative operations exposed by the React {@link TimelineEditor}. */
            interface TimelineEditorHandle {
                readonly document: TimelineDocumentHandle;
                readonly selection: TimelineSelectionHandle;
                /** Returns a host-neutral editor snapshot. */
                getSnapshot(): TimelineEditorSnapshot;
                /** Sets the persistence dirty flag without changing the document. */
                setModified(modified: boolean): void;
                /** Moves the playhead to an absolute frame position. */
                setPosition(position: number): void;
                /** Switches the visual editing mode. */
                setMode(mode: TimelineMode): void;
                /** Centers or reveals one frame position. */
                focusPosition(position: number): void;
                /** Fits a frame interval into the viewport. */
                focusRange(start: number, end: number): void;
                /** Scrolls vertically to a canonical track path. */
                focusTrack(path: string): void;
                /** Fits the complete Timeline document into the viewport. */
                fitView(): void;
                /** Returns a detached viewport and selection snapshot. */
                getViewState(): TimelineViewState;
                /** Replaces viewport and selection state. */
                setViewState(viewState: TimelineViewState): void;
                /** Executes a semantic command independently of physical keyboard shortcuts. */
                executeCommand(command: TimelineCommand): Promise<boolean>;
                /** Starts playback from the current frame. */
                play(loop?: boolean): void;
                /** Stops playback without changing the current frame. */
                stop(): void;
                /** Converts browser client coordinates to Timeline frame and track coordinates. */
                clientToTimeline(clientX: number, clientY: number): { position: number; path?: string };
                /** Resolves a track from a Timeline-local vertical coordinate. */
                getTrackAt(y: number): string | null;
                /** Returns visible track rows and their shared geometry. */
                getTrackLayout(): TimelineTrackLayout;
                /** Synchronizes a host-owned track list's vertical scroll position. */
                setTrackScrollTop(scrollTop: number): boolean;
                /** Expands or collapses a directory track. */
                setTrackOpen(path: string, open: boolean): void;
                /** Tests whether a track contains a key at an exact frame. */
                hasTrackKeyAt(path: string, frame: number): boolean;
                /** Returns the computed Timeline key color for a track. */
                getTrackKeyColor(path: string): string;
                /** Converts a frame position to seconds or a formatted time label. */
                positionToTime(position: number, formatted?: boolean): number | string;
            }

            /** Props accepted by the reusable React Timeline editor. */
            interface TimelineEditorProps {
                /**
                 * Native mutable Timeline document. The component reads and edits this
                 * object directly; no normalized render document is created.
                 */
                data?: TimelineDocument | null;
                /** Change this token after mutating data in place to invalidate caches and render. */
                dataVersion?: unknown;
                /** Optional host boundaries for menus, values, and notifications. */
                actions?: TimelineActions;
                /** Editor history instance used to record and execute Timeline undo/redo operations. */
                history?: IDataHistory | null;
                /** Initial or controlled visual mode. Defaults to `"frame"`. */
                mode?: TimelineMode;
                /** Uniform height used by every visible track row, in CSS pixels. */
                rowHeight?: number;
                /** Extra scrollable space after the final track row. Defaults to 6 CSS pixels. */
                trackEndPadding?: number;
                /** State snapshot restored separately from data. The value is cloned; null resets it. */
                viewState?: TimelineViewState | null;
                /** Additional class applied to the Timeline root element. */
                className?: string;
                /** Disables data editing while preserving navigation and rendering. */
                readOnly?: boolean;
                /** Whether Timeline currently uses live-recording interaction behavior. */
                recordMode?: boolean;
                /** Enables built-in tween editing. */
                tweenEditable?: boolean;
                /** Enables refreshing keys from {@link TimelineActions.getCurrentValue}. */
                currentValueUpdate?: boolean;
                /** Additional class applied to the underlying `<canvas>` element. */
                canvasClassName?: string;
            }

            /** Semantic operations understood by Timeline independently of physical keys. */
            type TimelineCommand = "copy" | "paste" | "undo" | "redo" | "selectAll" | "deleteSelection" | "togglePlayback" | "previousFrame" | "nextFrame" | "insertFrame" | "removeFrame" | "focusSelection";

            /** Reusable React component that owns a Timeline Canvas lifecycle. */
            const TimelineEditor: React.ForwardRefExoticComponent<TimelineEditorProps & React.RefAttributes<TimelineEditorHandle>>;
            /** Creates an empty, valid viewport and selection state. */
            const createTimelineViewState: () => TimelineViewState;
            /**
             * Encodes a single track-name segment for use in a canonical Timeline path.
             * Canonical paths use `.` between hierarchy segments and `::` before the
             * property hierarchy. Literal dots in names must be encoded with this function.
             */
            const encodeTimelinePathSegment: (name: string) => string;
            /** Decodes a track name returned as one segment of a canonical Timeline path. */
            const decodeTimelinePathSegment: (name: string) => string;
            /** Returns the hierarchy portion before a canonical path's `::` property separator. */
            const getTimelineNamePath: (path: string) => string;
            /** Bundled component CSS. TimelineEditor registers it automatically. */
            const styles: string;
        }

        /** Supported editor color modes. */
        export type ThemeMode = "dark" | "light";

        /** User preference for a fixed color mode or the operating-system mode. */
        export type ThemePreference = ThemeMode | "system";

        /** Called after the active mode or compiled theme palette changes. */
        export type ThemeChangeListener = (theme: ThemeMode) => void;

        /** Compact inputs used to generate a complete semantic theme palette. */
        export interface ThemeRecipe {
            /** Primary accent color as a six-digit hexadecimal color. */
            accent: string;
            /** Accent and foreground contrast from 0 to 100. Defaults to 50. */
            contrast?: number;
            /** Neutral surface lightness adjustment from -0.15 to 0.15. Defaults to 0. */
            surfaceOffset?: number;
            /** Border lightness adjustment. Defaults to 72% of surfaceOffset. */
            borderOffset?: number;
            /** Root window surface lightness adjustment. Defaults to surfaceOffset. */
            bodyOffset?: number;
            /** Strength of the accent tint applied to neutral surfaces. Defaults to 1. */
            surfaceTint?: number;
        }

        /** Serializable definition stored in a `.layatheme.json` file. */
        export interface ThemeDefinition {
            /** Theme schema version. Version 1 is currently supported. */
            schemaVersion: 1;
            /** Stable identifier unique within one color mode. */
            id: string;
            /** Display name, or an `i18n:` key used by built-in themes. */
            name: string;
            /** Optional human-readable description. */
            description?: string;
            /** Optional theme author. */
            author?: string;
            /** Color mode to which this definition belongs. */
            mode: ThemeMode;
            /** Inputs used by the deterministic theme compiler. */
            recipe: ThemeRecipe;
            /** Optional values for registered semantic color tokens. */
            overrides?: Readonly<Record<string, string>>;
        }

        /** Theme definition registered with its source classification. */
        export interface RegisteredThemeDefinition extends ThemeDefinition {
            /** Whether the definition ships with the editor. */
            readonly builtin: boolean;
        }

        /** Severity reported while validating or installing a theme. */
        export type ThemeDiagnosticSeverity = "warning" | "error";

        /** One actionable theme validation or file-operation diagnostic. */
        export interface ThemeDiagnostic {
            /** Whether the issue permits installation. */
            severity: ThemeDiagnosticSeverity;
            /** Stable machine-readable diagnostic code. */
            code: string;
            /** Human-readable explanation of the issue. */
            message: string;
            /** Optional JSON path associated with the issue. */
            path?: string;
        }

        /** Result of validating and normalizing an in-memory theme definition. */
        export interface ThemeValidationResult {
            /** Normalized definition when validation succeeds. */
            definition?: ThemeDefinition;
            /** Validation errors and non-blocking warnings. */
            diagnostics: ThemeDiagnostic[];
        }

        /** Result returned by a desktop theme file operation. */
        export interface ThemeOperationResult {
            /** Whether the requested operation completed successfully. */
            ok: boolean;
            /** Validated definition associated with the operation, when available. */
            definition?: ThemeDefinition;
            /** Validation or file-system diagnostics. */
            diagnostics: ThemeDiagnostic[];
            /** Whether installation would replace an existing custom theme. */
            replacing?: boolean;
        }

        /** Compiled CSS custom-property names and values. */
        export type ThemePaletteTokens = Record<string, string>;

        /** Compact colors used to render a theme selection swatch. */
        export interface ThemePresetPreview {
            /** Representative editor surface color. */
            surface: string;
            /** Compiled primary accent color. */
            accent: string;
        }

        /**
         * Unified access to theme definitions, compilation, and desktop theme files.
         * Plugins should use the shared instance exposed as `IEditor.React.themeManager`.
         */
        export interface IThemeManager {
            /** Current theme-definition schema version. */
            readonly schemaVersion: 1;
            /** JSON Schema suitable for constrained AI output and external validation. */
            readonly jsonSchema: Readonly<Record<string, unknown>>;
            /** Activates a color mode without changing the stored mode preference. */
            setTheme(theme: ThemeMode): void;
            /** Returns the currently resolved color mode. */
            getTheme(): ThemeMode;
            /** Activates and saves a fixed or system-controlled color-mode preference. */
            setThemePreference(preference: ThemePreference): void;
            /** Returns the active color-mode preference. */
            getThemePreference(): ThemePreference;
            /** Activates and saves a registered theme in the current color mode. */
            setAccentPreset(id: string): void;
            /** Returns the active theme identifier in the current color mode. */
            getAccentPreset(): string;
            /** Subscribes to active mode and compiled-palette changes. */
            subscribeThemeChange(listener: ThemeChangeListener): () => void;

            /** Returns whether a value is a supported color mode. */
            isThemeMode(value: unknown): value is ThemeMode;
            /** Returns whether a value is a supported appearance preference. */
            isThemePreference(value: unknown): value is ThemePreference;
            /** Resolves a fixed or system preference to a concrete color mode. */
            resolveThemePreference(preference: ThemePreference, systemDark: boolean): ThemeMode;
            /** Returns the requested definition, or the default definition for its mode. */
            getThemeDefinition(mode: ThemeMode, id: string): RegisteredThemeDefinition;
            /** Returns registered built-in and custom definitions, optionally filtered by mode. */
            getThemeDefinitions(mode?: ThemeMode): ReadonlyArray<RegisteredThemeDefinition>;

            /** Validates and normalizes one custom definition without installing it. */
            validateThemeDefinition(value: unknown): ThemeValidationResult;
            /** Subscribes to installed-definition registry changes. */
            subscribeDefinitionsChanged(listener: () => void): () => void;

            /** Deterministically compiles a definition against dark or light base CSS. */
            generateThemePaletteTokens(definition: ThemeDefinition, baseCss: string): ThemePaletteTokens;
            /** Returns representative surface and accent colors for theme selection UI. */
            getThemePresetPreview(definition: ThemeDefinition): ThemePresetPreview;

            /** Validates, compiles, and audits a JSON theme value without installing it. */
            validateThemeForInstall(value: unknown): ThemeOperationResult;
            /** Validates and installs a JSON theme value into the editor theme directory. */
            installTheme(value: unknown, replace: boolean): ThemeOperationResult;
            /** Deletes an installed custom theme. Built-in themes cannot be deleted. */
            deleteTheme(mode: ThemeMode, id: string): ThemeOperationResult;
            /** Writes a registered theme definition to a `.layatheme.json` file. */
            exportTheme(mode: ThemeMode, id: string, targetPath: string): ThemeOperationResult;
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
        /**
         * `IEditor.StateGraph` — an editor-agnostic *state-machine* graph editor:
         * pinless nodes connected center-to-center, straight links with a mid-line
         * direction arrow, sibling fan-out and self-loops. Used by the animator
         * controller panel and available to plugins.
         *
         * Unlike `IEditor.Flow` (port-based data-flow graphs), connections here are a
         * plain directed `sourceId -> targetId` with no ports. The runtime lives in
         * `src/editor/react/stategraph` and is mounted onto `IEditor.StateGraph` in `Mount.ts`.
         *
         * Typical usage from a panel:
         * ```tsx
         * reactDOM.render(
         *   <IEditor.StateGraph.StateGraphEditor
         *     nodes={nodes} edges={edges}
         *     selectedNodeIds={sel}
         *     onSelectionChange={...} onConnect={...} onNodeDoubleClick={...}
         *   />
         * );
         * ```
         */
        export namespace IStateGraph {
            /** A point in graph coordinates, before viewport pan and zoom are applied. */
            interface XY {
                /** Horizontal graph coordinate. */
                x: number;
                /** Vertical graph coordinate. */
                y: number;
            }

            /** Serializable state-machine node. Positions use graph coordinates. */
            interface StateGraphNode {
                /** Stable ID referenced by edges and selection state. */
                id: string;
                /** User-facing node label. */
                name: string;
                /** Left position in graph coordinates. */
                x: number;
                /** Top position in graph coordinates. */
                y: number;
                /** Host-defined node category used to select an entry from `nodeStyles`. */
                kind?: string;
                /** Host-owned serializable payload; the editor does not interpret it. */
                data?: any;
            }

            /** Serializable directed transition between two state nodes. */
            interface StateGraphEdge {
                /** Stable edge ID used by selection state. */
                id: string;
                /** ID of the source node. Self-links are allowed. */
                sourceId: string;
                /** ID of the target node. */
                targetId: string;
                /** Optional label drawn on the transition. */
                label?: string;
                /** Whether pointer interaction may select the edge. Defaults to true. */
                selectable?: boolean;
                /** Host-owned serializable payload; the editor does not interpret it. */
                data?: any;
            }

            /** Visual overrides applied to all nodes with the corresponding `kind`. */
            interface StateGraphNodeStyle {
                /** CSS color used for the node accent. */
                color?: string;
                /** Extra CSS class placed on the node element. */
                className?: string;
                /** Render the node as a folder/container node. */
                folder?: boolean;
            }

            /** Controlled viewport transform in graph coordinates. */
            interface StateGraphViewport {
                /** Horizontal pan in client pixels. */
                x: number;
                /** Vertical pan in client pixels. */
                y: number;
                /** Zoom multiplier. A value of 1 means 100%. */
                zoom: number;
            }

            /** Modifier-key snapshot supplied with selection callbacks. */
            interface StateGraphPointerModifiers {
                /** True when Ctrl or the platform command-selection modifier is active. */
                ctrlKey: boolean;
                /** True when Shift is active. */
                shiftKey: boolean;
            }

            /** Imperative operations exposed through `StateGraphEditorProps.apiRef`. */
            interface StateGraphEditorApi {
                /** Pan the viewport to reveal the node and select it. */
                focusNode(id: string): void;
                /** Fit all nodes inside the current editor viewport. */
                fitView(): void;
                /** Begin interactive link creation from `sourceId`. */
                beginLink(sourceId: string): void;
                /** Cancel the current interactive link operation, if any. */
                cancelLink(): void;
                /** Convert browser client coordinates to graph coordinates. */
                clientToGraph(clientX: number, clientY: number): XY;
            }

            /** Props for the controlled state-machine graph editor. */
            interface StateGraphEditorProps {
                /** Nodes to render. The component does not mutate this array. */
                nodes: readonly StateGraphNode[];
                /** Directed transitions to render. The component does not mutate this array. */
                edges: readonly StateGraphEdge[];
                /** Styles indexed by `StateGraphNode.kind`. */
                nodeStyles?: Record<string, StateGraphNodeStyle>;
                /** ID of the default/entry node, or null when there is none. */
                defaultNodeId?: string | null;
                /** Controlled selected node IDs. */
                selectedNodeIds?: ReadonlySet<string> | readonly string[];
                /** Controlled selected edge IDs. */
                selectedEdgeIds?: ReadonlySet<string> | readonly string[];
                /** Controlled viewport. Omit it to let the component hold transient viewport state. */
                viewport?: StateGraphViewport;
                /** Called after the user pans or zooms. Persist the value when `viewport` is controlled. */
                onViewportChange?(viewport: StateGraphViewport): void;
                /** Node width in graph units. Defaults to `NODE_WIDTH`. */
                nodeWidth?: number;
                /** Node height in graph units. Defaults to `NODE_HEIGHT`. */
                nodeHeight?: number;
                /** Minimum viewport zoom multiplier. */
                minZoom?: number;
                /** Maximum viewport zoom multiplier. */
                maxZoom?: number;
                /** Show the built-in zoom and fit controls. */
                showControls?: boolean;
                /** Called with the complete next selection after a pointer selection gesture. */
                onSelectionChange?(nodeIds: string[], edgeIds: string[], mods: StateGraphPointerModifiers): void;
                /** Called continuously while nodes are dragged. The host must apply the delta to its data. */
                onNodesMove?(ids: string[], dx: number, dy: number): void;
                /** Called once after a node drag ends, after the final `onNodesMove`. */
                onNodeMoveEnd?(ids: string[]): void;
                /** Return false to reject an attempted directed connection. */
                canConnect?(sourceId: string, targetId: string): boolean;
                /** Called when `beginLink` cannot find its source or `canConnect` rejects a clicked target. */
                onConnectRejected?(sourceId: string, targetId: string | null): void;
                /** Called for an accepted connection. The host must create and persist the edge. */
                onConnect?(sourceId: string, targetId: string): void;
                /** Called when a node is double-clicked. */
                onNodeDoubleClick?(id: string): void;
                /** Called when empty canvas is double-clicked, with graph coordinates. */
                onPaneDoubleClick?(at: XY): void;
                /** Called instead of the default node context menu when provided. */
                onNodeContextMenu?(id: string, ev: React.MouseEvent): void;
                /** Called instead of the default edge context menu when provided. */
                onEdgeContextMenu?(id: string, ev: React.MouseEvent): void;
                /** Called for an empty-canvas context menu, with graph coordinates. */
                onPaneContextMenu?(ev: React.MouseEvent, at: XY): void;
                /** Called when the user requests deletion of the current controlled selection. */
                onDeleteSelection?(): void;
                /** Receives the imperative API after mount. */
                apiRef?: React.RefObject<StateGraphEditorApi | null>;
                /** Additional CSS class for the editor root. */
                className?: string;
            }

            // --- runtime values ---
            /** Controlled React component for editing pinless state-machine graphs. */
            const StateGraphEditor: (props: StateGraphEditorProps) => React.ReactElement;
            /** Bundled component CSS. StateGraphEditor registers it automatically. */
            const styles: string;
            /** Default node width in graph units. */
            const NODE_WIDTH: number;
            /** Default node height in graph units. */
            const NODE_HEIGHT: number;
            /** Calculate a viewport that fits all nodes inside the supplied client size. */
            const fitNodesToView: (
                nodes: readonly StateGraphNode[],
                viewW: number,
                viewH: number,
                nodeWidth?: number,
                nodeHeight?: number,
                padding?: number,
            ) => StateGraphViewport;
        }


        export interface IShell {
            // Docs: https://electronjs.org/docs/api/shell

            /**
             * Play the beep sound.
             */
            beep(): void;
            /**
             * Open the given external protocol URL in the desktop's default manner. (For
             * example, mailto: URLs in the user's default mail agent).
             */
            openExternal(url: string, options?: OpenExternalOptions): Promise<void>;
            /**
             * Resolves with a string containing the error message corresponding to the failure
             * if a failure occurred, otherwise "".
             *
             * Open the given file in the desktop's default manner.
             */
            openPath(path: string): Promise<string>;
            /**
             * Resolves the shortcut link at `shortcutPath`.
             *
             * An exception will be thrown when any error happens.
             *
             * @platform win32
             */
            readShortcutLink(shortcutPath: string): ShortcutDetails;
            /**
             * Show the given file in a file manager. If possible, select the file.
             */
            showItemInFolder(fullPath: string): void;
            /**
             * Resolves when the operation has been completed. Rejects if there was an error
             * while deleting the requested item.
             *
             * This moves a path to the OS-specific trash location (Trash on macOS, Recycle Bin
             * on Windows, and a desktop-environment-specific location on Linux).
             */
            trashItem(path: string): Promise<void>;
            /**
             * Whether the shortcut was created successfully.
             *
             * Creates or updates a shortcut link at `shortcutPath`.
             *
             * @platform win32
             */
            writeShortcutLink(shortcutPath: string, operation: 'create' | 'update' | 'replace', options: ShortcutDetails): boolean;
            /**
             * Whether the shortcut was created successfully.
             *
             * Creates or updates a shortcut link at `shortcutPath`.
             *
             * @platform win32
             */
            writeShortcutLink(shortcutPath: string, options: ShortcutDetails): boolean;
        }

        export interface OpenExternalOptions {
            /**
             * `true` to bring the opened application to the foreground. The default is `true`.
             *
             * @platform darwin
             */
            activate?: boolean;
            /**
             * The working directory.
             *
             * @platform win32
             */
            workingDirectory?: string;
            /**
             * Indicates a user initiated launch that enables tracking of frequently used
             * programs and other behaviors. The default is `false`.
             *
             * @platform win32
             */
            logUsage?: boolean;
        }

        export interface ShortcutDetails {

            // Docs: https://electronjs.org/docs/api/structures/shortcut-details

            /**
             * The Application User Model ID. Default is empty.
             */
            appUserModelId?: string;
            /**
             * The arguments to be applied to `target` when launching from this shortcut.
             * Default is empty.
             */
            args?: string;
            /**
             * The working directory. Default is empty.
             */
            cwd?: string;
            /**
             * The description of the shortcut. Default is empty.
             */
            description?: string;
            /**
             * The path to the icon, can be a DLL or EXE. `icon` and `iconIndex` have to be set
             * together. Default is empty, which uses the target's icon.
             */
            icon?: string;
            /**
             * The resource ID of icon when `icon` is a DLL or EXE. Default is 0.
             */
            iconIndex?: number;
            /**
             * The target to launch from this shortcut.
             */
            target: string;
            /**
             * The Application Toast Activator CLSID. Needed for participating in Action
             * Center.
             */
            toastActivatorClsid?: string;
        }
        export interface IShaderInfo {
            /**
             * Name of the shader.
             */
            name: string;

            /**
             * ID of the asset of the shader.
             */
            assetId: string;
        }

        export interface IShaderDb {

            /**
             * All shaders. Key is the name of the shader.
             */
            readonly shaders: Record<string, IShaderInfo>;

            /**
             * A version number that is incremented when the shader list is changed.
             */
            readonly version: number;
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
        /** Controls type metadata and default-value elimination during serialization. */
        export interface IEncodeObjOptions {
            /**
             * Write "_$type" field in the object. Default is false.
             */
            writeType?: boolean,
            /**
             * If a property value is same as the default value, it will be eliminated during serialization. Default is true.
             */
            eliminateDefaults?: boolean;
        }

        /** Controls validation and error collection during deserialization. */
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
             * @param data Object to serialize.
             * @param typeDef Type descriptor of the object. 
             * @param options Serialization options.
             * @returns The serialized object. 
             */
            function encodeObj(data: any, typeDef: FTypeDescriptor, options?: IEncodeObjOptions): any;

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

        /** Optional lifecycle callback implemented by objects that need post-deserialization setup. */
        export interface ISerializeNotification {
            /**
             * This method is called after the object is deserialized.
             * @example
             * ```
             * class MyClass {
             *    onAfterDeserialize() {
             *       // Do something after deserialization.
             *    }
             * }
             * ```
             */
            onAfterDeserialize(): void;
        }

        /**
         * Dialog for choosing an asset. `getResult()` resolves to the selected asset, or `null` when cancelled.
         */
        export interface ISelectResourceDialog extends IDialog {
            /**
             * Show the dialog.
             * @param popupOwner If the dialog is a popup window, it is used to calculate the popup position.
             * @param initialValue The id of the asset to select initially.
             * @param assetTypeFilter The asset type filter. Default is null, which means all types.
             * @param allowInternalAssets Whether to allow internal assets. Default is false.
             * @param customFilter The custom filter. Register it through `EditorEnv.assetMgr.customAssetFilters` in the Scene process.
             * @param allowInternalGUIAssets Whether to allow internal GUI assets. Default is false.
             * @param needConfirm Whether to need confirm button. Default is false.
             */
            show(popupOwner?: DialogPopupOwner, initialValue?: string, assetTypeFilter?: AssetType[], allowInternalAssets?: boolean, customFilter?: string, allowInternalGUIAssets?: boolean, needConfirm?: boolean): Promise<void>;
        }

        export interface ISelectNodeDialog extends IDialog {
            /**
             * Show the dialog.
             * @param popupOwner If the dialog is a popup window, it is used to calculate the popup position.
             * @param typeName The type name of the node. Default is "Node".
             */
            show(popupOwner: DialogPopupOwner, typeName?: string): Promise<void>;
        }

        /** Main-process facade for opening, saving, activating and playing Scene-process scenes. */
        export interface ISceneManager extends gui.EventDispatcher {
            /**
             * Scene process is running in a webview. This is the webview instance.
             */
            readonly sceneView: IWebview;

            /**
             * Preview process is running in a webview. This is the webview instance.
             */
            readonly gameView: IWebview;

            /**
             * Triggered when properties of a node is changed.
             */
            readonly onNodeChanged: IDelegate<(node: IMyNode, datapath: ReadonlyArray<string>, value: any, oldValue: any) => void>;

            /**
             * Multiple scenes can be opened at the same time, but only one scene is active.
             */
            readonly activeScene: IMyScene;

            /**
             * If the editor is currently in play mode, this property returns the scene that is being played.
             */
            readonly playingScene: IMyScene;

            /**
             * This will be true after the scene is loaded and ready.
             */
            readonly sceneReady: boolean;

            /**
             * Open a scene.
             * @param sceneId The scene id.
             * @param assetId The asset id.
             */
            openScene(sceneId: string, assetId: string): Promise<void>;

            /**
             * Close a scene. If the scene is not opened, this method does nothing.
             * @param sceneId The scene id.
             */
            closeScene(sceneId: string): Promise<void>;

            /**
             * Save the scene.
             * @param sceneId The scene id.
             * @param filePath The file path, it is a relative path to the asset path of the scene. Default is the asset path of the scene.
             */
            saveScene(sceneId: string, filePath?: string): Promise<void>;

            /**
             * Change the active scene.
             * @param sceneId The scene id.
             */
            setActiveScene(sceneId: string): Promise<void>;

            /**
             * Reload the scene.
             * @param sceneId The scene id.
             */
            reloadScene(sceneId: string): Promise<void>;

            /**
             * Get all scenes.
             */
            getScenes(): Readonly<Record<string, IMyScene>>;
            /**
             * Start playing the scene. 
             * 
             * Do not call this method directly; use the play button in the editor or `SceneEditor.playControls.play()`.
             * 
             * @param playing Whether to start or stop playing.
             * @return Whether the operation is successful.
             */
            setPlaying(playing: boolean): Promise<boolean>;

            /**
             * Whether any scene is playing.
             */
            readonly playing: boolean;

            /**
             * Execute a script in the Scene process. It can execute static functions of classes decorated with ＠Laya.regClass or ＠EditorEnv.regClass.
             * @param command Class name and function name separated by a dot. e.g. "MyClass.myFunction".
             * @param params Parameters of the function. 
             * @return The return value of the function.
             */
            runSceneScript(command: string, ...params: any[]): Promise<any>;
        }

        /** Synchronizes editable resource properties between the main and Scene processes. */
        export interface IResourceManager {
            /**
             * Whether to allow saving resource changes in preview mode. If false, changes to resources in preview mode will not be saved to disk, and will be reverted when exiting preview mode. If true, changes to resources in preview mode will be saved to disk, and will persist after exiting preview mode. Default is true.
             */
            allowSaveResourceChangesInPreview: boolean;

            /**
             * Get cached resource properties without loading them. The returned object is watched; property changes are saved and reflected in the editor.
             * @param resId The resource id.
             * @returns The cached resource data, or `undefined` if the resource has not been loaded.
             */
            getCachedResourceProps<T = any>(resId: string): T | undefined;

            /**
             * Get the resource properties. This method will return the resource properties if the resource is already loaded, otherwise it will load the resource properties from disk. The returned object is a watched object, and changes to its properties will be automatically saved to disk and reflected in the editor.
             * @param resId The resource id.
             * @param inline Whether the properties are used for rendering the inspector inline within a node inspector.
             * @returns The resource data.
             */
            getResourceProps<T = any>(resId: string, inline?: boolean): Promise<T>;

            /**
             * Save all dirty resources.
             */
            save(): Promise<void>;
            /**
             * Clone the material.
             * @param asset The asset to clone.
             * @returns The cloned asset.
             */
            cloneMaterial(asset: IAssetInfo): Promise<IAssetInfo>;
        }


        export interface IRendererInfo {
            /**
             * Root path of the project.
             */
            projectPath: string;

            /**
             * Project name.
             */
            projectName: string;

            /**
             * Project type.
             */
            projectType: string;

            /**
             * The current application directory.
             */
            appPath: string;

            /**
             * The version of the application.
             */
            appVersion: string;

            /**
             * The path of the user data. 
             * 
             * On Windows, it is c:/Users/username/AppData/Roaming/LayaAirIDE
             * 
             * On MacOS, it is ~/Library/Application Support/LayaAirIDE
             */
            userDataPath: string;

            /**
             * Application name.
             */
            appName: string;

            /**
             * In LayaAirIDE, each module is assigned a specific ID,
             * such as the scene editor is sceneEditor, the blueprint editor is blueprintEditor, and the shader blueprint editor is shaderEditor.
             */
            moduleName: string;

            /**
             * The path of the packed resources.
             * 
             * On Windows, it is path/to/LayaAirIDE/resources/app.asar
             * 
             * On MacOS, it is path/to/LayaAirIDE.app/Contents/Resources/app.asar
             */
            webRootPath: string;

            /**
             * The path of the unpacked resources.
             * 
             * On Windows, it is path/to/LayaAirIDE/resources
             * 
             * On MacOS, it is path/to/LayaAirIDE.app/Contents/Resources
             */
            unpackedWebRootPath: string;

            /**
             * If the app is packaged. It is only false in the development mode.
             */
            isPackaged: boolean;

            /**
             * LayaAirIDE has a built-in HTTP server for previewing. This is the server address.
             * 
             * Typically, it is http://ipaddress:18090, and if HTTPS is enabled, it is https://ipaddress:18091.
             * 
             * The ipaddress is the local machine's IP address. 18090/18091 are the default ports, which can be modified in "Project Settings -> Edit".
             */
            serverURL: string;

            /**
             * Detailed information about the server.
             * - host: The host of the server.
             * - port: The port of the server.
             * - securePort: The secure port of the server. Used when HTTPS is enabled.
             */
            serverInfo: { host: string, port: number, securePort: number };

            /**
             * If the app is in the cli mode. A cli mode is a mode that runs the app in the command line.
             * - watch: The app is running in the watch mode, which watches the file changes and compiles scripts.
             * - run: The app is running in the run mode, which runs the script and exits.
             */
            cliMode: false | "watch" | "run";

            /**
             * Extra TypeScript files passed by CLI run mode. These files are compiled
             * into the scene script bundle without being imported as assets.
             */
            cliScriptFiles?: string[];

            /**
             * CLI-only option. When true, user scripts and package scripts are neither
             * compiled nor loaded. Feature-pack scripts are still compiled and loaded.
             */
            disablePlugins?: boolean;

            /**
             * CLI-only option. When true, the package lock is loaded but package
             * installation, updates, and pending package transactions are skipped.
             */
            skipPackageInstall?: boolean;
        }

        export interface IRendererStartupAction {
            /**
             * Open a file after the renderer is started.
             */
            openFile?: string;

            /**
             * Open a URL after the renderer is started.
             */
            openURL?: string;

            /**
             * Run a script after the renderer is started.
             */
            runScript?: string;

            /**
             * Arguments for the script.
             */
            scriptArgs?: string[];

            /**
             * Any other options.
             */
            [index: string]: any;
        }


        export interface IRender3DCanvas extends gui.Widget {
            /**
             * Continuously request rendered frames (approximately 30 fps). Continuous
             * rendering pauses while the widget is not visible or the editor window is
             * not in the foreground. The default is false.
             */
            continuousRendering: boolean;

            /**
             * Continuous rendering rate in frames per second. Set to 0 for on-demand
             * rendering. Values above 60 are clamped. `continuousRendering = true` is
             * equivalent to setting this to 30.
             */
            continuousFrameRate: number;

            /**
             * Optional scene-process render target size. A stable size smaller than the
             * default 800x600 reduces GPU readback and ImageBitmap transfer cost.
             */
            renderSize: { width: number; height: number } | null;

            /**
             * Whether createObject has been called.
             */
            readonly ready: boolean;

            /**
             * Create a 3D object.
             * @param scriptName The script name of the object. The script must be registered in the scene process by using `＠IEditorEnv.regClass`.
             * @param initMethod The method to initialize the object.
             * @param initMethodArgs The arguments of the init method.
             * @see IEditorEnv.AssetPreview
             * @example
             * ```
             * await this.createObject("MaterialPreview", "setAssetById", asset.id);
             * ```
             */
            createObject(scriptName: string, initMethod?: string, ...initMethodArgs: Array<any>): Promise<any>;

            /**
             * Release the 3D object. If no object has been created by calling `createObject`, this method does nothing.
             */
            releaseObject(): Promise<void>;

            /**
             * Call a method of the 3D object.
             * @param method The method name.
             * @param args The arguments of the method.
             * @return The return value of the method.
             */
            call(method: string, ...args: any[]): Promise<any>;

            /**
             * Refresh the canvas.
             */
            refresh(): void;
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
         * A gui.Widget subclass that hosts React content.
         *
         * Integrates into the FairyGUI hierarchy via `parent.addChild(reactDOM)`.
         * `IEditor.ReactDOM` uses Shadow DOM by default for plugin style isolation;
         * pass `{ shadow: false }` to opt out.
         *
         * @example Panel usage:
         * ```tsx
         * import styles from './MyPlugin.css';
         *
         * class MyPanel extends IEditor.EditorPanel {
         *     private _react: IEditor.ReactDOM;
         *     async create() {
         *         this._panel = new gui.Widget();
         *         this._react = new IEditor.ReactDOM();
         *         this._react.adoptStyles(styles);
         *         this._react.makeFullSize(this._panel, true);
         *         this._panel.addChild(this._react);
         *         this._react.render(<App />);
         *     }
         *     onDestroy() { this._react.dispose(); }
         * }
         * ```
         *
         * @example Dialog usage:
         * ```tsx
         * let reactDOM = new IEditor.ReactDOM();
         * reactDOM.setSize(320, 200);
         * dialog.contentPane = reactDOM;
         * reactDOM.render(<MyForm />);
         * ```
         */
        export interface IReactDOM extends gui.Widget {
            /**
             * The Shadow Root inside the widget's element.
             * Use as a container for React Portals (dropdowns, modals, tooltips)
             * that need to stay within the style-isolated boundary.
             */
            readonly shadowRoot: ShadowRoot | null;

            /**
             * The mount point div inside the Shadow DOM where React content is rendered.
             */
            readonly mountPoint: HTMLDivElement;

            /**
             * Render or update React content.
             *
             * Call once after setup, and again whenever you need to re-render
             * (e.g. in response to editor events like `onSelectionChanged`).
             *
             * @param element A React element (JSX expression).
             *
             * @example
             * ```tsx
             * reactDOM.render(<App data={myData} />);
             * ```
             */
            render(element: any): void;

            /**
             * Inject additional CSS into this container's Shadow DOM.
             *
             * Use with `.css` files imported as text strings. The IDE build pipeline
             * includes a built-in css-text esbuild plugin that converts
             * `import styles from './Foo.css'` into a string automatically.
             *
             * @param css CSS text to inject.
             *
             * @example
             * ```ts
             * import styles from './MyPlugin.css';
             * reactDOM.adoptStyles(styles);
             * ```
             */
            adoptStyles(css: string): void;

            /**
             * Unmount React tree and clean up resources.
             * Call in `onDestroy()` of your panel or when the host widget is removed.
             */
            dispose(): void;
        }

        /** Displays an editor image or icon resolved from an editor URL, asset URL, or file URL. */
        export interface EditorImageProps {
            /** Image source. Supports editor resource URLs, asset URLs, file/data/blob/http URLs, and thumbnail URLs. */
            src?: string;
            /** Additional CSS class for the image wrapper. Defaults to the small icon style. */
            className?: string;
            /** Name written to the wrapper's data-icon attribute. Inferred from src when omitted. */
            iconName?: string;
            /** Set true to render an empty icon slot when the image source is missing or unresolved. */
            placeholder?: boolean;
        }

        /** Renders translated editor text, optionally parsed as UBB or HTML. */
        export interface LocalizedTextProps {
            /** Translation key or literal text. */
            value: string;
            /** Variables passed to the translation formatter. */
            options?: Record<string, unknown>;
            /** Parse the translated text as UBB markup before rendering. */
            ubb?: boolean;
            /** Render the translated text as HTML. */
            html?: boolean;
        }

        /** Input for selecting, displaying, dragging, and clearing a scene node reference. */
        export interface NodeRefInputProps {
            /** A resolved node, or serialized reference data containing _$ref and optional _$missing. */
            value?: IMyNode | Record<string, unknown> | null;
            /** Disables selection, drag/drop, and keyboard clearing. */
            disabled?: boolean;
            /** Allowed node or component type names. Component filters commit the matched component type. */
            typeFilter?: string[];
            /** CSS class for the root element. Defaults to the standard node reference input style. */
            className?: string;
            /** Called after the selected node is validated. compType is set when a component filter matched. */
            onCommit(node: IMyNode | null, compType?: string): void | Promise<void>;
            /** Called when serialized reference data has been resolved to a node, or failed to resolve. */
            onNodeResolved?(node: IMyNode | null): void;
        }

        /** Input for selecting, displaying, dragging, copying, pasting, and clearing an asset reference. */
        export interface ResourceInputProps {
            /** Asset id/text, a resolved asset, or null for an empty value. */
            value?: string | IAssetInfo | null;
            /** Disables selection, drag/drop, keyboard editing, and menu actions that change the value. */
            disabled?: boolean;
            /** Allowed asset types. Values may be AssetType enum members or their string names. */
            typeFilter?: Array<AssetType | string>;
            /** Whether built-in editor assets can be selected. Defaults to true. */
            allowInternalAssets?: boolean;
            /** Whether built-in GUI assets can be selected. Defaults to false. */
            allowInternalGUIAssets?: boolean;
            /** Extra filter expression forwarded to the resource selection dialog. */
            customFilter?: string;
            /** Text shown in the empty state instead of the type-derived prompt. */
            placeholder?: string;
            /** CSS class for the root element. */
            className?: string;
            /** Commits both the serialized text value and the resolved asset, when available. */
            onCommit(text: string, asset: IAssetInfo | null): void;
            /** Called when the empty input is double-clicked to create or choose a new resource. */
            onCreate?(): void | Promise<void>;
        }

        /** Input for selecting project font assets or system/custom fonts. */
        export interface FontInputProps {
            /** Font text, asset reference, resolved asset, or null for an empty value. */
            value?: string | IAssetInfo | null;
            /** Disables selection, drag/drop, keyboard clearing, and paste. */
            disabled?: boolean;
            /** Whether built-in editor font assets can be selected. Defaults to true. */
            allowInternalAssets?: boolean;
            /** Whether built-in GUI font assets can be selected. Defaults to false. */
            allowInternalGUIAssets?: boolean;
            /** Text shown as the font type in the empty state. Defaults to Font. */
            placeholder?: string;
            /** CSS class for the root element. */
            className?: string;
            /** Commits custom text, or a selected font asset when asset is non-null. */
            onCommit(text: string | null, asset: IAssetInfo | null): void | Promise<void>;
        }

        /** Input for typing, dropping, and browsing for a filesystem path. */
        export interface FileInputProps {
            /** Current path. Null and undefined are displayed as an empty string. */
            value?: string | null;
            /** Disables typing, drag/drop, and browsing. */
            disabled?: boolean;
            /** Keeps selected and dropped paths absolute. Defaults to project-relative paths. */
            absolutePath?: boolean;
            /** Opens an open-file dialog by default, or a save dialog when set to save. */
            action?: "open" | "save";
            /** Options forwarded to the native open/save dialog. */
            dialogOptions?: OpenDialogOptions | SaveDialogOptions;
            /** Placeholder text or translation key. */
            placeholder?: string;
            /** CSS class for the root element. */
            className?: string;
            /** Commits the normalized path. Return false to reject the change. */
            onCommit(value: string): boolean | void;
        }

        /** Color picker input. Color serialization and format conversion are handled by the caller. */
        export interface ColorInputProps {
            /** Current color, or null when a checkable input is unchecked. */
            value?: gui.Color | null;
            /** Color used when value is null but the input needs a preview or restored checked value. */
            defaultValue?: gui.Color;
            /** Disables toggling, editing, and paste. */
            readonly?: boolean;
            /** Forces committed colors to have alpha 1 and hides alpha editing. */
            hideAlpha?: boolean;
            /** Shows a checkbox that allows committing null. */
            checkable?: boolean;
            /** Commits the selected color, or null when unchecked. */
            onCommit(value: gui.Color | null): void;
        }

        /** Shared options for gradient editing. */
        export interface GradientInputOptions {
            /** Locks the gradient interpolation mode when provided. Omit it to allow mode editing. */
            lockMode?: number;
            /** Maximum number of alpha stops. Zero or undefined means editor default. */
            maxAlphaNum?: number;
            /** Maximum number of color stops. Zero or undefined means editor default. */
            maxColorNum?: number;
        }

        /** Editable gradient value used by the React gradient input. */
        export interface GradientInputValue {
            /** Gradient interpolation mode. */
            mode: number;
            /** Color stops. */
            rgbElements: Array<{
                /** Stop position normalized to 0..1. */
                pos: number;
                /** Stop color. */
                color: gui.Color;
            }>;
            /** Alpha stops. */
            alphaElements: Array<{
                /** Stop position normalized to 0..1. */
                pos: number;
                /** Alpha value normalized to 0..1. */
                alpha: number;
            }>;
        }

        /** Gradient picker input. Data serialization is handled by the caller. */
        export interface GradientInputProps extends GradientInputOptions {
            /** Current gradient, or null when a checkable input is unchecked. */
            value?: GradientInputValue | null;
            /** Gradient used when value is null and a checked value needs to be created. */
            defaultValue?: GradientInputValue;
            /** Disables toggling, editing, and paste. */
            readonly?: boolean;
            /** Shows a checkbox that allows committing null. */
            checkable?: boolean;
            /** Hides alpha editing in the gradient editor. */
            hideAlpha?: boolean;
            /** Commits the edited gradient, or null when unchecked. */
            onCommit(value: GradientInputValue | null): void;
        }

        /** Shared options that shape curve editing and preview behavior. */
        export interface CurveInputOptions {
            /** Minimum allowed key value. */
            min?: number;
            /** Maximum allowed key value. */
            max?: number;
            /** Maximum number of keyframes allowed in the editor. */
            maxKeyFrame?: number;
            /** Whether tangent-based curve interpolation is enabled. Defaults to true. */
            isCurve?: boolean;
            /** Enables weighted tangent editing. Defaults to false. */
            isWeight?: boolean;
            /** Forces start and end keys to exist. */
            forceStartEndKeys?: boolean;
            /** Normalizes displayed curve values into the curve range. */
            isNormalization?: boolean;
            /** Lower preview/editor range for the curve graph. */
            curveMin?: number;
            /** Upper preview/editor range for the curve graph. */
            curveMax?: number;
        }

        /** One curve keyframe. Tangent and weight fields use the same numeric conventions as the curve editor. */
        export interface CurveInputKey {
            /** Key time. */
            time: number;
            /** Key value. */
            value: number;
            /** Outgoing tangent. */
            outTangent?: number;
            /** Outgoing tangent weight. */
            outWeight?: number;
            /** Incoming tangent. */
            inTangent?: number;
            /** Incoming tangent weight. */
            inWeight?: number;
            /** Weighted tangent mode. */
            weightedMode?: number;
        }

        /** Editable curve value used by the React curve input. */
        export interface CurveInputValue {
            /** Ordered curve keys. */
            keys: CurveInputKey[];
            /** Lower preview/editor range for this value. */
            curveMin: number;
            /** Upper preview/editor range for this value. */
            curveMax: number;
        }

        /** Curve editor input. Data serialization is handled by the caller. */
        export interface CurveInputProps extends CurveInputOptions {
            /** Current curve, or null when a checkable input is unchecked. */
            value?: CurveInputValue | null;
            /** Curve used when value is null and a checked value needs to be created. */
            defaultValue?: CurveInputValue;
            /** Disables toggling and editing. */
            readonly?: boolean;
            /** Shows a checkbox that allows committing null. */
            checkable?: boolean;
            /** Commits the edited curve, or null when unchecked. */
            onCommit(value: CurveInputValue | null): void;
        }

        /** Shared options for polygon preview and editing. */
        export interface PolygonInputOptions {
            /** Optional image displayed behind the polygon. */
            background?: ImageData | null;
            /** Coordinate-space width used when no background image is supplied. */
            sourceWidth?: number;
            /** Coordinate-space height used when no background image is supplied. */
            sourceHeight?: number;
            /** Minimum number of polygon vertices. Defaults to 3. */
            minPoints?: number;
            /** Maximum number of polygon vertices. Zero or undefined means unlimited. */
            maxPoints?: number;
            /** Preview height in pixels. Defaults to 80. */
            previewHeight?: number;
        }

        /** Polygon editor input. Coordinates are stored as x/y pairs in a flat array. */
        export interface PolygonInputProps extends PolygonInputOptions {
            /** Current polygon, or null when a checkable input is unchecked. */
            value?: ReadonlyArray<number> | null;
            /** Polygon used when value is null and a checked value needs to be created. */
            defaultValue?: ReadonlyArray<number>;
            /** Disables toggling and editing. */
            readonly?: boolean;
            /** Shows a checkbox that allows committing null. */
            checkable?: boolean;
            /** Commits the edited polygon, or null when unchecked. */
            onCommit(value: number[] | null): void;
        }

        /** Text input with optional multiline, password, and editor i18n support. */
        export interface TextInputProps {
            /** Current text. Null and undefined are displayed as an empty string. */
            value?: string | null;
            /** Disables text editing and i18n actions. */
            readonly?: boolean;
            /** Placeholder text or translation key. */
            placeholder?: string;
            /** Renders a textarea that grows to fit its content. */
            multiline?: boolean;
            /** Renders a password input. Ignored for multiline inputs. */
            password?: boolean;
            /** Commits on every keystroke instead of only blur or Enter. */
            submitOnTyping?: boolean;
            /** Enables editor translation-key editing for the value. */
            multiLanguage?: boolean;
            /** Commits the text. Return false to reject and reset the displayed text. */
            onCommit(value: string): boolean;
        }

        /** Search box with a leading search icon and clear button. */
        export interface SearchInputProps {
            /** Current search text. */
            value: string;
            /** Called whenever the search text changes. */
            onChange(value: string): void;
            /** Placeholder text. */
            placeholder?: string;
            /** Focuses the input after mount. */
            autoFocus?: boolean;
            /** CSS class for the root element. */
            className?: string;
            /** Optional key handler for the underlying input. */
            onKeyDown?(event: React.KeyboardEvent<HTMLInputElement>): void;
        }

        /** Numeric input that supports typing, mouse drag stepping, and mouse wheel stepping while focused. */
        export interface NumericInputProps {
            /** Current numeric value. */
            value: number;
            /** Disables editing and stepping. */
            disabled?: boolean;
            /** Minimum allowed value. */
            min?: number;
            /** Maximum allowed value. */
            max?: number;
            /** Step used by drag, wheel, and slider controls. Defaults to the component step. */
            step?: number;
            /** Number of digits kept after the decimal point. */
            fractionDigits?: number;
            /** React content displayed before the input text. */
            prefix?: React.ReactNode;
            /** Text displayed after the input and ignored when parsing typed input. */
            suffix?: string;
            /** CSS class for the root element. */
            className?: string;
            /** Commits the number. Return false to reject and reset the displayed value. */
            onCommit(value: number): boolean | void;
        }

        /** Numeric input paired with a range slider. */
        export interface NumericInputWithSliderProps extends NumericInputProps {
            /** Minimum slider value. Falls back to min or 0. */
            sliderMin?: number;
            /** Maximum slider value. Falls back to max or 100. */
            sliderMax?: number;
            /** Uses a symmetric slider mapping around value 1 for scale-like values. */
            centeredAtOne?: boolean;
        }

        /** Numeric input pair with a dual-handle slider for editing a bounded range. */
        export interface RangeInputProps {
            /** Current range as an inclusive start/end pair. */
            value: readonly [number, number];
            /** Minimum allowed value and lower slider boundary. */
            min: number;
            /** Maximum allowed value and upper slider boundary. */
            max: number;
            /** Step used by the slider handles and keyboard controls. Defaults to 0.01. */
            step?: number;
            /** Number of digits kept after the decimal point. */
            fractionDigits?: number;
            /** Disables both numeric inputs and slider handles. */
            disabled?: boolean;
            /** Additional CSS class for the root element. */
            className?: string;
            /** Commits the updated start/end pair. */
            onCommit(value: [number, number]): void;
        }

        /** One option in SelectInput. */
        export interface SelectInputOption {
            /** Serialized option value. */
            value: string;
            /** Display label. Defaults to value. */
            label?: string;
            /** Prevents this option from being selected. */
            disabled?: boolean;
            /** Tooltip text or translation key. */
            title?: string;
        }

        /** Button-style select input backed by a Popup list. */
        export interface SelectInputProps {
            /** Current selected value. */
            value?: string;
            /** Static option list. */
            items?: SelectInputOption[];
            /** Disables opening and selection. */
            disabled?: boolean;
            /** CSS class for the trigger button. */
            className?: string;
            /** Inline style for the trigger button. */
            style?: React.CSSProperties;
            /** Extra CSS class for the popup list container. */
            popupClassName?: string;
            /** Text shown when no item matches the current value. */
            placeholder?: string;
            /** Maximum number of visible items before scrolling. Defaults to 20. */
            visibleItemCount?: number;
            /** Shows a filter input above the option list. */
            searchable?: boolean;
            /** Placeholder shown by the optional filter input. */
            searchPlaceholder?: string;
            /** Optionally provides or refreshes the item list before the popup opens. */
            onBeforeOpen?(): SelectInputOption[] | void | Promise<SelectInputOption[] | void>;
            /** Called when an enabled option is selected. */
            onChange(value: string, item: SelectInputOption): void;
        }

        /** Wraps children with the editor tooltip behavior. */
        export interface TooltipTargetProps {
            /** Tooltip text. Null, undefined, and empty values disable the tooltip. */
            tips?: string | null;
            /** Delay before showing the tooltip, in milliseconds. Defaults to 800. */
            delay?: number;
            /** Tooltips in the same group skip the delay while moving continuously between targets. */
            instantGroup?: string;
            /** Element that should receive the tooltip. */
            children: React.ReactNode;
        }

        /** Native button props with title handled by the editor tooltip system. */
        export type ToolButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
            /** Tooltip text. It is not forwarded as a native DOM title. */
            title?: string | null;
        };

        /** Render props passed to Popup trigger renderers. */
        export interface PopupTriggerProps {
            /** Ref that must be attached to the trigger or anchor element. */
            ref: React.RefObject<HTMLElement>;
            /** Whether the popup is currently open. */
            open: boolean;
            /** Opens or cancels the popup depending on current state. */
            toggle(): void;
            /** Opens the popup. */
            openPopup(): void;
            /** Cancels/closes the popup. */
            closePopup(): void;
        }

        /** Anchored popup that portals into the owner document or shadow root. */
        export interface PopupProps {
            /** Anchor element used for positioning. If omitted, use renderTrigger's ref. */
            anchorRef?: React.RefObject<HTMLElement>;
            /** Controlled open state. If omitted, Popup manages its own state. */
            open?: boolean;
            /** Requested popup width. The final width is at least the anchor width. */
            width?: number;
            /** Maximum popup height before viewport clamping. */
            maxHeight?: number;
            /** Gap in pixels between the anchor and the popup. */
            gap?: number;
            /** CSS class for the popup element. */
            className?: string;
            /** Called when the popup closes normally, such as by outside click. */
            onClose?: () => void;
            /** Called when the popup is opened. */
            onOpen?: () => void;
            /** Called when the popup is cancelled, such as by Escape or trigger toggle while open. */
            onCancel?: () => void;
            /** Renders the trigger and receives helpers for controlling the popup. */
            renderTrigger?: (props: PopupTriggerProps) => React.ReactNode;
            /** Popup content. */
            children: React.ReactNode;
        }

        /** Direction controlled by a resize separator. Vertical resizes width, horizontal resizes height. */
        export type ResizeHandleOrientation = "vertical" | "horizontal";

        /** Initial value and optional bounds returned when a resize drag starts. */
        export interface ResizeHandleStart {
            /** Starting size or position value. */
            value: number;
            /** Minimum allowed value for this drag. Falls back to props.min. */
            min?: number;
            /** Maximum allowed value for this drag. Falls back to props.max. */
            max?: number;
        }

        /** Keyboard and pointer accessible separator for resizing panels or regions. */
        export interface ResizeHandleProps {
            /** Additional CSS class for the handle. */
            className?: string;
            /** Inline style for the handle. */
            style?: React.CSSProperties;
            /** Resize axis. Vertical handles change width, horizontal handles change height. */
            orientation: ResizeHandleOrientation;
            /** Accessible label for the separator. */
            ariaLabel?: string;
            /** Current value used by keyboard resizing and aria-valuenow. */
            value?: number;
            /** Minimum allowed value. */
            min?: number;
            /** Maximum allowed value. */
            max?: number;
            /** Keyboard resize step in pixels. Defaults to 10. */
            keyboardStep?: number;
            /** Cursor shown during hover and drag. Defaults to the orientation cursor. */
            cursor?: string;
            /** Reverses pointer and keyboard delta direction. */
            reverse?: boolean;
            /** Disables pointer and keyboard resizing. */
            disabled?: boolean;
            /** Optional visual content inside the handle. */
            children?: React.ReactNode;
            /** Called before drag starts. Return false to cancel or return custom start bounds. */
            onResizeStart?(event: React.PointerEvent<HTMLDivElement>): ResizeHandleStart | false | void;
            /** Called with the resized value during pointer drag or keyboard resizing. */
            onResize(value: number, event?: PointerEvent): void;
            /** Called on double-click, or Enter when focused. */
            onReset?(): void;
        }

        /** Stable pointer coordinates for a drag, including movement across same-origin frames. */
        export interface PointerDragPosition {
            /** Client X coordinate in the starting event's coordinate space. */
            clientX: number;
            /** Client Y coordinate in the starting event's coordinate space. */
            clientY: number;
            /** Horizontal distance from the drag start. */
            deltaX: number;
            /** Vertical distance from the drag start. */
            deltaY: number;
        }

        /** Options for tracking a pointer drag beyond the starting editor surface. */
        export interface PointerDragSessionOptions {
            /** Pointer event that starts the drag. Native and React pointer events are supported. */
            startEvent: PointerEvent | React.PointerEvent<Element>;
            /** Called for pointer movement while the session is active. */
            onMove(position: PointerDragPosition, event: PointerEvent): void;
            /** Called once after normal completion, or with null after explicit cancellation. */
            onEnd?(position: PointerDragPosition, event: PointerEvent | null): void;
        }

        /** Options for the editor-styled native drag preview. */
        export interface EditorDragPreviewOptions {
            /** Text displayed in the drag preview. */
            label: string;
            /** Number of dragged items. A badge is shown when greater than one. */
            count?: number;
            /** Element whose document and editor theme are used to create the preview. */
            sourceElement: HTMLElement;
        }

        /** Props for the reusable React inspector panel view. */
        export interface InspectorPanelProps {
            model: IInspectorPanelModel;
            className?: string;
            /** Caption column width as a ratio of the panel width. Defaults to 0.34. */
            captionWidthRatio?: number;
        }

        /** Props for a code element highlighted after rendering. */
        export interface HighlightedCodeProps {
            /** Raw code text. */
            content: string;
            /** Language name or alias. Takes precedence over fileName when both are provided. */
            language?: string;
            /** File name used to infer the language when language is omitted. */
            fileName?: string;
            /** Additional class names applied to the code element. */
            className?: string;
            /** Whether long lines wrap. Defaults to false. */
            lineWrapping?: boolean;
        }

        /** Props for the lazily loaded CodeMirror editor. */
        export interface CodeEditorProps {
            /** Text displayed by the editor. */
            content: string;
            /** File name used to select syntax highlighting. */
            fileName: string;
            /** Prevents editing and saving when true. */
            readOnly: boolean;
            /** Wraps long lines instead of scrolling horizontally. Defaults to false. */
            lineWrapping?: boolean;
            /** Number of spaces used for indentation and the display width of tab characters. */
            tabSize?: number;
            /** Makes the Tab key indent text instead of moving focus. Defaults to true. */
            indentWithTab?: boolean;
            /** Displays the line-number gutter. Defaults to true. */
            lineNumbers?: boolean;
            /** Displays code-folding controls. Defaults to true. */
            foldGutter?: boolean;
            /** Enables the platform search shortcut. Defaults to false. */
            search?: boolean;
            /** Enables CodeMirror autocompletion. Defaults to false. */
            autocompletion?: boolean;
            /** Called whenever the editor content changes. */
            onChange(content: string): void;
            /** Called when the editor receives the platform save shortcut. */
            onSave(): void;
        }

        /** React component exported by the optional code editor bundle. */
        export type CodeEditorComponent = React.ComponentType<CodeEditorProps>;

        /** Layout used by the read-only diff editor. */
        export type DiffEditorViewMode = "unified" | "side-by-side";

        /** Props for the lazily loaded, viewport-rendered CodeMirror diff editor. */
        export interface DiffEditorProps {
            /** Complete content before the change. */
            before: string;
            /** Complete content after the change. */
            after: string;
            /** Before filename used for language detection. Defaults to afterFileName. */
            beforeFileName?: string;
            /** After filename used for language detection. */
            afterFileName: string;
            /** Displays changes inline or in two aligned panes. */
            viewMode: DiffEditorViewMode;
            /** Wraps long lines instead of scrolling horizontally. Defaults to false. */
            lineWrapping?: boolean;
            /**
             * Collapses unchanged ranges. Defaults to `{ margin: 3, minSize: 4 }`;
             * pass false to keep every unchanged line visible.
             */
            collapseUnchanged?: false | {
                /** Unchanged lines kept visible on each side of a change. Defaults to 3. */
                margin?: number;
                /** Minimum unchanged range eligible for collapsing. Defaults to 4. */
                minSize?: number;
            };
            /** Additional class names applied to the diff container. */
            className?: string;
            /** Accessible label for the diff editor. */
            ariaLabel?: string;
        }

        /** React component type for the read-only diff editor. */
        export type DiffEditorComponent = React.ComponentType<DiffEditorProps>;

        /** React component entry points exposed to editor plugins and external React integrations. */
        export namespace ReactComponents {
            /** Shared API for querying, compiling, importing, exporting, and deleting editor themes. */
            const themeManager: IThemeManager;
            /** Injects the editor React theme and component styles into a document. */
            const injectStyles: (doc: Document) => void;
            /**
             * Registers component-owned CSS with the nearest IEditor.ReactDOM.
             * Identical CSS is shared within the same Document or ShadowRoot and is
             * released after the last mounted consumer unmounts. Call this at the top
             * level of a React component and keep style arrays identity-stable.
             *
             * @example
             * ```tsx
             * import styles from "./MyControl.css";
             * function MyControl() {
             *     IEditor.React.useStyles(styles);
             *     return <div className="my-plugin-control" />;
             * }
             * ```
            */
            const useStyles: (styles: string | readonly string[]) => void;
            /** Returns the current IEditor.ReactDOM root and updates after cross-window moves. */
            const useDOMRoot: () => Document | ShadowRoot | null;
            /**
             * Permanently registers imperative-module CSS in the target's Document or
             * ShadowRoot. A stable, namespaced ID prevents repeated CSS processing.
             * The first registration for an ID wins for the lifetime of that root.
             */
            const ensureStyles: (
                target: Element | Document | ShadowRoot,
                styleId: string,
                styles: string | readonly string[],
            ) => void;
            /** Returns a version that changes after editor theme or appearance-token changes. */
            const useThemeVersion: () => number;
            /** Reads a required CSS px variable from a style, element, document, or the current document when source is null. */
            const readCssPx: (source: CSSStyleDeclaration | Element | Document | null | undefined, property: string) => number;
            /** Reads a required CSS string variable from a style, element, document, or the current document when source is null. */
            const readCssString: (source: CSSStyleDeclaration | Element | Document | null | undefined, property: string) => string;
            /** Displays an editor image or icon. */
            const EditorImage: (props: EditorImageProps) => React.ReactNode;
            /** Shared file tab bar model. */
            const FileTabBar: new (options?: IFileTabBarOptions) => IFileTabBar;
            /** Renders shared file tabs with heavy, light, or weak visual variants. */
            const FileTabBarView: (props: IFileTabBarViewProps) => React.ReactElement;
            /** Renders translated editor text. */
            const LocalizedText: (props: LocalizedTextProps) => React.ReactNode;
            /** Selects and displays a scene node reference. */
            const NodeRefInput: (props: NodeRefInputProps) => React.ReactNode;
            /** Selects and displays an asset reference. */
            const ResourceInput: (props: ResourceInputProps) => React.ReactNode;
            /** Selects and displays a project font asset or system/custom font. */
            const FontInput: (props: FontInputProps) => React.ReactNode;
            /** Edits and browses for a filesystem path. */
            const FileInput: (props: FileInputProps) => React.ReactNode;
            /** Edits a gui.Color value. */
            const ColorInput: (props: ColorInputProps) => React.ReactNode;
            /** Edits a gradient value. */
            const GradientInput: (props: GradientInputProps) => React.ReactNode;
            /** Edits a curve value. */
            const CurveInput: (props: CurveInputProps) => React.ReactNode;
            /** Edits a polygon value. */
            const PolygonInput: (props: PolygonInputProps) => React.ReactNode;
            /** Edits text. */
            const TextInput: (props: TextInputProps) => React.ReactNode;
            /** Edits search text. */
            const SearchInput: (props: SearchInputProps) => React.ReactNode;
            /** Edits a number. */
            const NumericInput: (props: NumericInputProps) => React.ReactNode;
            /** Edits a number with a slider. */
            const NumericInputWithSlider: (props: NumericInputWithSliderProps) => React.ReactNode;
            /** Edits a bounded numeric range with two number inputs and a dual-handle slider. */
            const RangeInput: (props: RangeInputProps) => React.ReactNode;
            /** Selects one option from a list. */
            const SelectInput: (props: SelectInputProps) => React.ReactNode;
            /** Adds editor tooltip behavior to children. */
            const TooltipTarget: (props: TooltipTargetProps) => React.ReactNode;
            /** Renders a native button whose title uses the editor tooltip behavior. */
            const ToolButton: React.ForwardRefExoticComponent<ToolButtonProps & React.RefAttributes<HTMLButtonElement>>;
            /** Renders anchored popup content. */
            const Popup: (props: PopupProps) => React.ReactNode;
            /** Resizes panels or regions with pointer and keyboard interactions. */
            const ResizeHandle: (props: ResizeHandleProps) => React.ReactNode;
            /** Creates the model used by the reusable React inspector panel. */
            const InspectorPanelModel: new () => IInspectorPanelModel;
            /** Renders a reusable inspector panel for objects added to its model. */
            const InspectorPanel: (props: InspectorPanelProps) => React.ReactNode;
            /** Tracks a pointer drag beyond editor surfaces and returns an idempotent cancellation function. */
            const beginPointerDragSession: (options: PointerDragSessionOptions) => () => void;
            /** Sets an editor-styled preview image for a native drag operation. */
            const setEditorDragPreview: (dataTransfer: DataTransfer, options: EditorDragPreviewOptions) => void;
            /** CodeMirror editor that loads its implementation on first render. */
            const CodeEditor: CodeEditorComponent;
            /**
             * Read-only CodeMirror diff viewer. It renders only the visible viewport and
             * is the recommended component for large-file diffs instead of constructing
             * a complete highlighted Diff HTML tree.
             *
             * @example
             * ```tsx
             * <IEditor.React.DiffEditor
             *     before={previousSource}
             *     after={currentSource}
             *     beforeFileName="Player.ts"
             *     afterFileName="Player.ts"
             *     viewMode="side-by-side"
             *     ariaLabel="Player changes"
             * />
             * ```
             */
            const DiffEditor: DiffEditorComponent;
            /** Highlights a code element and installs its theme into the element's current root. */
            const highlightElement: (element: HTMLElement) => void;
            /** Renders a code element and highlights it after each content change. */
            const HighlightedCode: (props: HighlightedCodeProps) => React.ReactElement;
        }

        export interface IQRCodeDialog extends IDialog {
            /**
             * Show the dialog.
             * @param popupOwner If the dialog is a popup window, it is used to calculate the popup position.
             * @param url The URL to generate the QR code.
             */
            show(popupOwner: DialogPopupOwner, url: string): Promise<void>;
        }

        export type IPropertyFieldConstructor = new () => IPropertyField;

        export interface IPropertyFieldCreateResult {
            /**
             * Display widget of the property field. Existing FGUI fields return this.
             */
            ui?: gui.Widget;

            /**
             * Whether the width of the widget should be stretched according to the inspector panel. Default is true.
             */
            stretchWidth?: boolean;

            /**
             * Whether the React field should fill the remaining vertical space in the Inspector viewport.
             * The Inspector host observes layout changes and updates the field height automatically.
             */
            fillRemainingHeight?: boolean;

            /**
             * Caption display option. Default is "normal".
             * - "normal": Display the caption.
             * - "hidden": Hide the caption but keep the space.
             * - "none": Hide the caption and remove the space.
             */
            captionDisplay?: "normal" | "hidden" | "none";

            /**
             * By default, the widget will be indented according to the level of the property field. Set this to true to disable the indent.
             */
            noIndent?: boolean;

            /**
             * By default, the widget will have a minimum height. Set this to true to disable the minimum height.
             */
            noMinHeight?: boolean;

            /**
             * Additional CSS used by a React property field.
             *
             * The owning ReactDOM injects these styles once per unique CSS source in
             * the current Document or ShadowRoot and keeps them alive while at least
             * one field instance is using them. Plugin styles should still use a
             * plugin-specific root class because fields share that style root with
             * other editor UI.
             */
            styles?: string;
        }

        export interface IPropertyField {
            /**
             * Parent field.
             */
            get parent(): IPropertyField;

            /**
             * Child fields.
             */
            readonly children: ReadonlyArray<IPropertyField>;

            /**
             * Whether the field has child-like structure.
             */
            readonly isFolder: boolean;

            /**
             * Owner inspector.
             */
            readonly inspector: IDataInspector;

            /**
             * The owner type of the property.
             */
            readonly objType: Readonly<FTypeDescriptor>;

            /**
             * The property descriptor.
             */
            readonly property: Readonly<FPropertyDescriptor>;

            /**
             * The inspecting target. It it used to get or set the value of the property.
             */
            readonly target: IInspectingTarget;

            /**
             * Properties that are watched by this field. A single field may watch multiple properties, not just the property it represents.
             * 
             * By default, the array is filled with the name of the property that the field represents. You may push more property names to this array.
             * 
             * Or if the field does not care about the property change, you can set this array to empty.
             */
            watchProps: Array<string>;

            /**
             * Properties that are affected by this field. A single field may affect multiple properties, not just the property it represents.
             * 
             * By default, the array is filled with the the property that the field represents. You may push more properties to this array.
             * 
             * Or if the field does not affect any property, you can set this array to empty.
             * 
             * The difference between watchProps and affectProps is that watchProps is used to listen to the change of the property, while memberProps is used to display overriden hint of the property.
             */
            memberProps: Array<FPropertyDescriptor>;

            /**
             * Tag of the property field. If a field has a tag, you can find it by the tag, and if it is changed, you will be notified.
             */
            tag: string;

            /**
             * In this method, you should create the legacy view and initialize field metadata.
             * Return `ui` for FGUI fields. React fields should initialize layout/watch/member options here.
             * Return their React view from `render()`.
             * @return The create result.
             */
            create(): IPropertyFieldCreateResult;

            /**
             * Add a child field.
             */
            addChild(child: IPropertyField): IPropertyField;

            /**
             * Remove a child field.
             */
            removeChild(child: IPropertyField): IPropertyField;

            /**
             * React renderer for the property field. When provided, the React inspector calls this on the field instance itself.
             * Use `this.property`, `this.target`, `this.children`, and other field members directly.
             */
            render?(): ReactNode;

            /**
             * Set the field to be readonly or not.
             * @param value
             */
            makeReadonly(value: boolean): void;

            /**
             * Set the field to be hidden or not.
             * @param hidden
             */
            setHidden(hidden: boolean): void;

            /**
             * If this method is provided, it indicates that this field supports drag-and-drop operations. In this method, you can decide whether to accept the drag based on the dragged data.
             * @param evt Event object. get the dragged data from evt.data.
             * @example
             * ```
             * onNativeDragOver(evt: gui.Event): void {
             *     let dt: DataTransfer = evt.data;
             *      if (dt.types.includes("asset")) {
             *          //below two lines are necessary to make the drop event work
             *          dt.dropEffect = "move";
             *          evt.preventDefault();
             *      }
             * }
             * ```
             */
            onNativeDragOver?(evt: gui.Event): void;

            /**
             * If this method is provided, it indicates that this field supports drag-and-drop operations. In this method, you can handle the dragged data.
             * @param evt Event object. get the dragged data from evt.data.
             * @example
             * ```
             * async onNativeDrop(evt: gui.Event): void {
             *    let itemIds = evt.data.getData("asset");
             *    if (!itemIds)
             *        return;
             *    //we handle the drop event, so we should stop the event from propagating
             *    evt.stopPropagation(); 
             * }
             * ```
             */
            onNativeDrop?(evt: gui.Event): void;

            /**
             * Called when the reset menu item is clicked. You should reset the data of the field to the default value.
             */
            onResetData?(): void;

            /**
             * Get child fields.
             * @param result An array to store the result. If not provided, a new array will be created.
             * @return The result array. The owner of the array is transferred to the caller.
             */
            getChildFields(result?: Array<IPropertyField>): Array<IPropertyField>;

            /**
             * Find a brother field by name. Brother fields are fields that have the same parent.
             * @param name The name of the property.
             * @return The field found, or null if not found.
             */
            findBrotherField(name: string): IPropertyField | null;

            /**
             * Find a child field by name. 
             * @param name The name of the property.
             * @return The field found, or null if not found.
             */
            findChildField(name: string): IPropertyField | null;

            /**
             * Get the status of the field.
             * @param name The key of the status.
             * @return The value of the status.
             */
            getStatus(name: string): any;

            /**
             * Set the status of the field. You can save some UI-related states here, such as whether it is expanded, selected, etc.
             * @param name The key of the status.
             * @param value The value of the status.
             */
            setStatus(name: string, value: any): void;

            /**
             * Display an error message below the field. This is commonly used to display validation error.
             * @param msg The error message.
             */
            displayError(msg: string): void;

            /**
             * Update the UI according to the data. This method is called when the data is changed.
             */
            refresh(): void;

            /**
             * Copy the data of the field to the clipboard.
             */
            copyData(): void;

            /**
             * Paste the data to the field. If the data is not compatible with the field, it will do nothing.
             * @param data The data to paste. If not provided, it will try to get the data from the clipboard.
             */
            pasteData(data?: any): Promise<void>;

            /**
             * Reset the data of the field to the default value.
             */
            resetData(): void;

            /**
             * Check if any clipboard data that can be pasted.
             */
            hasClipboardData(): Promise<boolean>;
        }

        /**
         * The numeric `type` value used to mark a template as user-imported local template.
         * Built-in / cloud templates use small numbers (0 core, 1 sample, 2 learning, 4 purchased);
         * the local type sits above that range to avoid collisions.
         */
        export const LOCAL_TYPE = 100000000;

        /**
         * Where a template comes from. Used together with the template name to uniquely reference
         * a template via {@link IProjectTemplateManager.findTemplate}.
         *
         * - `builtin` — shipped with the IDE under `unpackedWebRootPath/template/project/`.
         * - `cloud` — published on the LayaAir template server; may or may not be downloaded locally.
         * - `local` — imported by the user from a zip, stored under `LocalTemplate/`.
         * - `purchased` — purchased on the LayaAir asset store.
         */
        export type TemplateSource = 'builtin' | 'cloud' | 'local' | 'purchased';

        /**
         * Describes a single template entry tracked by the project manager.
         *
         * A template may be fully local (built-in / downloaded / user-imported), fully remote
         * (only a cloud listing entry), or a hybrid (local copy of a remote template, possibly outdated).
         *
         * The raw bilingual fields in `info` / `netInfo` are kept untouched — callers reading
         * `info.name` get the Chinese name, `info.en?.name` the English. View code is responsible
         * for picking the right one based on the current language.
         */
        export interface ITemplateData {
            /**
             * Where this template comes from. Combined with the template name, this is the stable
             * coordinate used by {@link IProjectTemplateManager.findTemplate}.
             */
            source: TemplateSource;

            /**
             * Remote metadata fetched from the cloud project list.
             * Present for templates that exist on the server. When `info` is missing but `netInfo` is set,
             * the template has not been downloaded yet.
             *
             * Common fields: `name`, `desc`, `en.name`, `en.desc`, `id`, `ver`, `type`, `templateURL`, `preview`, `icon`.
             */
            netInfo?: any;

            /**
             * Local metadata parsed from `<dir>/<templateDirName>/info.json`.
             * Present when the template is available locally. When missing, the template still needs to be downloaded.
             *
             * Common fields: `name`, `desc`, `en.name`, `en.desc`, `id`, `ver`, `type`, `ord`.
             */
            info?: any;

            /**
             * Absolute path of the template root directory on disk (parent of `templateDirName`).
             * Empty / undefined for cloud-only entries.
             */
            dir?: string;

            /**
             * The metadata directory name inside `dir`, either `"templateInfo"` or `".templateInfo"`
             * depending on how the template was packaged.
             */
            templateDirName?: string;

            /**
             * For purchased templates: the raw store resource object returned by the asset store API.
             * Contains `resource_name`, `resource_description`, `resource_cover`, `version`, `size`, etc.
             */
            resource?: any;

            /**
             * For purchased templates: the store resource id.
             */
            resource_id?: any;

            /**
             * For purchased templates: the per-user purchase id used to request the download URL.
             */
            user_resource_id?: any;

            /**
             * For purchased templates: human-readable purchase timestamp from the store API.
             */
            ['@timestamp_format']?: string;
        }

        /**
         * Parameters for {@link IProjectTemplateManager.createProject}.
         */
        export interface ICreateProjectOptions {
            /** Project name. Used both as the `.laya` descriptor filename and (when `subdir` is true) as the leaf directory name. */
            name: string;

            /** Parent directory the project should be created under. */
            path: string;

            /** When true, the project is created at `path/name/`. When false, files are written directly into `path`. */
            subdir?: boolean;

            /** The template to instantiate from. Must already be downloaded (have `info` and `dir`). */
            template?: ITemplateData;
        }

        export interface IProjectTemplateManager {
            /**
             * Load the full template catalog: built-in templates, downloaded cloud templates,
             * user-imported local templates, the remote project list, and the purchased list.
             *
             * Idempotent and reentrant — concurrent or repeated calls return the same in-flight promise
             * instead of reloading.
             */
            loadTemplates(): Promise<void>;

            /**
             * Rescan the user's `LocalTemplate/` directory and update {@link templates}.
             * Use after importing or deleting a local template to reflect the change without a full reload.
             */
            refreshLocalTemplates(): void;

            /**
             * The current template catalog. Mutated in place when templates are downloaded, imported,
             * renamed, or deleted — readers should re-render after invoking any mutating method.
             */
            readonly templates: ReadonlyArray<ITemplateData>;

            /**
             * Purchased-template entries fetched from the store API during {@link loadTemplates}.
             * Empty when the user is offline or not signed in.
             */
            readonly purchasedList: ReadonlyArray<any>;

            /**
             * Look up a template by its source and name. Matches against the Chinese name (`info.name`
             * / `netInfo.name` / `resource.resource_name`) as well as the English name (`info.en.name`
             * / `netInfo.en.name`), so callers can use whichever they have.
             *
             * If multiple templates share the same name within a source (e.g. two user-imported local
             * templates with the same name), the first match in catalog order is returned.
             *
             * @param source - Where to look. See {@link TemplateSource}.
             * @param name - The Chinese or English display name of the template.
             * @returns The matching template, or `undefined` if not found.
             */
            findTemplate(source: TemplateSource, name: string): ITemplateData | undefined;

            /**
             * Synthesize an {@link ITemplateData} from a raw entry in {@link purchasedList}.
             * Purchased templates are kept as raw store-API rows; this turns one into the unified
             * template shape so the rest of the pipeline (`createProject`, `downloadProjectTemplate`,
             * view models) can treat it the same as any other template.
             */
            buildPurchasedTemplate(entry: any): ITemplateData;

            /**
             * Download (or re-download) the zip for a template and unpack it into the cache directory.
             * Updates `data.info` / `data.dir` / `data.templateDirName` on success so the template
             * becomes usable for {@link createProject}.
             *
             * Concurrent calls for the same template URL share a single download — additional callers
             * piggyback on the in-flight progress.
             *
             * @param data - The template entry to download. Must have `netInfo` (built-in/cloud) or `user_resource_id` (purchased).
             * @param progressCallback - Receives integer progress in `[0, 100]`. Called with `100` after the local data update completes.
             * @returns `true` if the download/unpack succeeded; `false` if no download URL could be resolved.
             */
            downloadProjectTemplate(
                data: ITemplateData,
                progressCallback?: (progress: number) => void
            ): Promise<boolean>;

            /**
             * Import a user-supplied template zip into `LocalTemplate/`. The zip is unpacked, its
             * `info.json` is normalized (with `type = LOCAL_TYPE`), and {@link templates} is updated.
             *
             * @param zipPath - Absolute path of the zip file to import.
             */
            importLocalTemplate(zipPath: string): Promise<void>;

            /**
             * Delete a user-imported local template from disk and remove it from {@link templates}.
             * No-op for non-local templates or entries whose `dir` no longer exists.
             */
            deleteLocalTemplate(data: ITemplateData): void;

            /**
             * Rename a user-imported local template. Updates the in-memory `data.info.name` and
             * writes the change back to the on-disk `info.json`.
             */
            setLocalTemplateName(data: ITemplateData, name: string): void;

            /**
             * Create a new project on disk from a template:
             * write the `.laya` descriptor, scaffold the standard subdirectories, overlay the `common`
             * base layer and the chosen template, and copy engine `.d.ts` files.
             *
             * @returns The absolute path of the created project root.
             */
            createProject(opts: ICreateProjectOptions): Promise<string>;

            /**
             * Clear the template download cache: remove cached zip / extracted directories and reset
             * the in-memory dedupe map. Entries in {@link templates} that pointed into the cache are
             * downgraded back to cloud-only state (their `info` / `dir` are cleared).
             */
            clearTemplateCache(): Promise<void>;
        }

        export interface IProjectPanel extends IEditorPanel {
            /**
             * Select an asset.
             * @param assetId The asset id.
             * @param setFocus Whether to set focus to the asset.
             * @param disableEvent Whether to disable the selection event.
             */
            select(assetId: string, setFocus?: boolean, disableEvent?: boolean): void;

            /**
             * Get the selected asset.
             * @returns The selected asset.
             */
            getSelectedResource(): IAssetInfo;

            /**
             * Get the selected assets.
             * @param result The result array. If provided, the result will be pushed into it, otherwise a new array will be created.
             * @returns The selected assets.
             */
            getSelectedResources(result?: Array<IAssetInfo>): Array<IAssetInfo>;

            /**
             * Get the selected folder.
             * @returns The selected folder.
             */
            getSelectedFolder(): IAssetInfo;

            /**
             * Get current expanded folders.
             * @param result The result array. If provided, the result will be pushed into it, otherwise a new array will be created.
             * @returns The expanded folders.
             */
            getExpandedFolders(result?: Array<string>): Array<string>;

            /**
             * Expand the specified folders.
             * @param arr The expanded folders.
             */
            setExpandedFolders(arr: Array<string>): Promise<void>;

            /**
             * Expand the specified folder.
             * @param asset The folder to expand.
             */
            expand(asset: IAssetInfo): void;

            /**
             * Start a rename operation on the specified asset.
             * @param asset The asset to rename.
             */
            rename(asset: IAssetInfo): Promise<void>;

            /**
             * Start a new operation on the specified folder.
             * @param folder The folder to add new asset.
             * @param fileName The file name.
             * @param callback The callback function called when the new asset is created.
             */
            addNew(folder: IAssetInfo, fileName: string, callback: (fileName: string) => void): void;

            /**
             * Create a new asset.
             * @param fileName The file name.
             * @param templateName The template name, an absolute path, or a file name resolved from the default template directory.
             * @param args The template arguments.
             * @param isContext Whether to create the asset in the current context folder.
             * @example
             * ```
             * this.createAsset("Scene.ls", "Scene.json");
             * ```
             */
            createAsset(fileName: string, templateName: string, args?: Record<string, string>, isContext?: boolean): Promise<void>;

            /**
             * Create a new folder.
             * @param folderName The folder name.
             */
            createFolder(folderName?: string): void;
        }

        export interface IPreviewPanel extends IEditorPanel {
            /**
             * Toolbar widget. If provided, it will be added to the toolbar holder.
             */
            toolbar?: gui.Widget;

            /**
             * React toolbar renderer. If provided, PreviewPanel will render this
             * instead of the legacy toolbar widget.
             */
            renderToolbar?(): ReactNode;

            /**
             * React renderer for information displayed below the preview canvas.
             */
            renderInfo?(): ReactNode;

            /**
             * Display preview information over the canvas instead of reserving space below it.
             */
            infoOverlay?: boolean;

            /**
             * Test if the panel can accept the asset.
             */
            accept(asset: IAssetInfo): boolean;

            /**
             * Called when the preview is needed to be refreshed.
             * @param asset The asset.
             * @param render3DCanvas A 3D canvas for rendering 3D objects. If you don't need it, you can ignore it.
             * @param resData The resource data. If you don't need it, you can ignore it.
             */
            refresh(asset: IAssetInfo, render3DCanvas: IRender3DCanvas, resData: any | null): Promise<void>;

            /**
             * Called when the preview is cleared.
             */
            clearPreview?(): void;

            /**
             * Called when a rotation operation is performed on the object.
             */
            rotateObject?(x: number, y: number): void;
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
        /** Options for converting Chinese text to a pinyin string. */
        export interface IPinyinOptions {
            /** Tone output format. The default is `symbol`. */
            toneType?: "symbol" | "num" | "none";
            /** Part of each syllable to return. The default is `pinyin`. */
            pattern?: "pinyin" | "initial" | "final" | "num" | "first" | "finalHead" | "finalBody" | "finalTail";
            /** Whether to remove non-Chinese characters. */
            removeNonZh?: boolean;
            /** How non-Chinese characters are separated or removed. */
            nonZh?: "spaced" | "consecutive" | "removed";
            /** Limits which non-Chinese characters are affected by `nonZh`. */
            nonZhScope?: RegExp;
            /** Converts `ü` to `v`, or to a custom string, when tones are disabled. */
            v?: boolean | string;
            /** Whether `y` and `w` are treated as initials. */
            initialPattern?: "yw" | "standard";
            /** Enables traditional Chinese character recognition. */
            traditional?: boolean;
            /** Returns all pronunciations for a single polyphonic character. */
            multiple?: boolean;
            /** Prioritizes normal pronunciation or surname pronunciation. */
            mode?: "normal" | "surname";
            /** Controls where surname pronunciation mode is applied. */
            surname?: "all" | "head" | "off";
            /** Enables tone sandhi for 一 and 不. */
            toneSandhi?: boolean;
            /** Selects the tokenization algorithm. */
            segmentit?: 1 | 2 | 3;
            /** String output is the only format supported by this API. */
            type?: "string";
            /** Separator inserted between pinyin syllables. */
            separator?: string;
        }

        /** Pinyin conversion utilities exposed by the editor. */
        export interface IPinyinUtils {
            /**
             * Convert Chinese text to pinyin. In CLI mode, the original string is returned unchanged.
             * @param word The text to convert.
             * @param options Pinyin conversion options.
             */
            pinyin(word: string, options?: IPinyinOptions): string;
        }

        export interface IPanelManagerOptions {
            /**
             * Layout file path.
             */
            filePath: string,

            /**
             * Create a Panel menu in the main menu bar.
             */
            createMenu?: boolean,
            /**
             * Manager can have multiple groups of panels. The group with name 'default' is the default group, and it is required.
             * 
             * mainPanelId: The main panel id of the group. This panel will always be shown, as empty layout is not allowed.
             */
            layouts: Record<string, {
                mainPanelId: string
            }>
        }

        export interface IPanelManager {
            /**
             * All registered panel ids.
             */
            readonly panelIds: string[];

            /**
             * Last focused panel.
             */
            readonly lastFocusedPanel: IEditorPanel;

            /**
             * Register a panel.
             * 
             * This method generally does not need to be used directly. Use ＠IEditor.panel instead.
             * @param panelId The panel id.
             * @param classType The class type of the panel.
             * @param options The options of the panel.
             * @returns A promise that resolves to the panel instance.
             */
            registerPanel<T extends IEditorPanel>(panelId: string, classType: gui.Constructor<T>, options: IPanelOptions): Promise<T>;

            /**
             * Unregister a panel.
             * @param panelId The panel id.
             */
            unregisterPanel(panelId: string): void;

            /**
             * Get a panel by id.
             * @param panelId The panel id.
             * @param classType The class type of the panel.
             * @returns The panel instance.
             */
            getPanel<T extends IEditorPanel>(panelId: string, classType?: gui.Constructor<T>): T;

            /**
             * Get all panels by usage.
             * @param usage The usage of the panels.
             * @returns The panels. The ownership of the result array is transferred.
             */
            getPanelsByUsage(usage: EditorPanelUsage): Array<IEditorPanel>;

            /**
             * Set the title of a panel.
             * @param panelId The panel id.
             * @param title The title.
             */
            setPanelTitle(panelId: string, title: string): void;

            /**
             * Show a panel.
             * @param panel The panel.
             */
            showPanel(panel: IEditorPanel): void;

            /**
             * Show a panel by id.
             * @param panelId The panel id.
             */
            showPanel(panelId: string): void;

            /**
             * Hide a panel.
             * @param panel The panel.
             */
            hidePanel(panel: IEditorPanel): void;

            /**
             * Hide a panel by id.
             * @param panelId The panel id.
             */
            hidePanel(panelId: string): void;

            /**
             * Whether a panel is showing.
             * @param panelId The panel id.
             * @returns True if the panel is showing, otherwise false.
             */
            isPanelShowing(panelId: string): boolean;

            /**
             * Whether a panel is currently the only tab in the only grid of a popup
             * window.
             * @param panelId The panel id.
             * @returns True if the panel is alone in a single-grid popup, otherwise false.
             */
            isPanelAloneInSingleGridPopup(panelId: string): boolean;

            /**
             * Get the active panel in the grid that contains the specified panel.
             * @param panelId The panel id.
             * @return The active panel id, or null if the panel does not exist or is not in a grid.
             */
            getActivePanelInGroup(panelId: string): string | null;

            /**
             * Start the panel manager.
             */
            start(): void;

            /**
             * Destroy the panel manager.
             */
            dispose(): void;

            /**
             * Save the layout.
             * @param filePath The file path. Defaults to the file path specified in the construction options.
             */
            saveLayout(filePath?: string): Promise<void>;

            /**
             * Load the layout.
             * @param filePath The file path. Defaults to the file path specified in the construction options.
             */
            loadLayout(filePath?: string): Promise<void>;

            /**
             * Reset the layout.
             */
            resetLayout(): Promise<void>;

            /**
             * Switch to a group.
             * @param groupName The group name.
             */
            switchGroup(groupName: string): void;

            /**
             * Send message to a panel.
             * @param panelId The panel id.
             * @param cmd The command. Generally, the command is the method name of the panel.
             * @param args The arguments.
             * @returns A promise that resolves to the result of the command.
             */
            sendMessage(panelId: string, cmd: string, ...args: Array<any>): Promise<any>;

            /**
             * Post message to a panel. It will wait for the response.
             * @param panelId The panel id.
             * @param cmd The command. Generally, the command is the method name of the panel.
             * @param args The arguments.
             */
            postMessage(panelId: string, cmd: string, ...args: Array<any>): void;
        }

        export type PackageOperationPhase = "collectDependencies" | "precompile" | "compress" | "download" | "extract";

        export interface IPackageOperationProgress {
            phase: PackageOperationPhase;
            detail?: string;
            value?: number;
            max?: number;
        }

        export interface IPackageOperationOptions {
            abortToken?: IAbortToken;
            onProgress?: (progress: IPackageOperationProgress) => void;
        }

        export interface IExportPackageOptions extends IPackageOperationOptions {
            includeDependencies?: boolean;
        }

        export type IExportInstallablePackageOptions = IPackageOperationOptions;

        export interface IPackageImportSession {
            /** File entries contained in the package. */
            readonly entries: ReadonlyArray<string>;

            /** Extract selected entries and their metadata files into the project assets directory. */
            importEntries(entries: ReadonlyArray<string>, options?: IPackageOperationOptions): Promise<boolean>;

            /** Extract selected entries into a specified directory, preserving their paths in the package. */
            extractEntriesTo(entries: ReadonlyArray<string>, destination: string, options?: IPackageOperationOptions): Promise<boolean>;

            /** Close the package and delete temporary downloads. */
            dispose(): void;
        }

        export namespace IPackageTool {
            /**
             * Export assets to a Laya resource package.
             * Precompilation is enabled only when assetIdsOrPaths contains exactly one folder. Only package.json directly inside that folder is checked.
             */
            function exportPackage(assetIdsOrPaths: ReadonlyArray<string>, outputPath: string, options?: IExportPackageOptions): Promise<boolean>;

            /**
             * Export one package folder as an installable .layapkg file with package.json at the archive root.
             * The folder may be identified by an asset id or by an absolute/project-relative path inside the current project.
             * It must contain a valid package.json directly inside it.
             */
            function exportInstallablePackage(packageFolderIdOrPath: string, outputPath: string, options?: IExportInstallablePackageOptions): Promise<boolean>;

            /** Open a local or remote Laya resource package for inspection and selective import. */
            function openPackage(source: string, options?: IPackageOperationOptions): Promise<IPackageImportSession>;
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

        export interface IMyScene {
            /**
             * History support for the scene.
             */
            readonly history: IDataHistory;

            /**
             * Selection history support for the scene. It is used to undo or redo the selection changes.
             */
            readonly selectionHistory: IDataHistory;

            /**
             * Root node of the scene. It is a dummy node which has no parent.
             */
            readonly rootNode: IMyNode;

            /**
             * Scene2D node.
             */
            readonly rootNode2D: IMyNode;

            /**
             * Scene3D node.
             */
            readonly rootNode3D: IMyNode;

            /**
             * If the scene is a prefab, this is the root node of the prefab.
             */
            readonly prefabRootNode: IMyNode;

            /**
             * ID of the scene.
             */
            readonly sceneId: string;

            /**
             * World type of the scene.
             */
            readonly worldType: WorldType;

            /**
             * Which asset the scene is from.
             */
            readonly asset: IAssetInfo;

            /**
             * Communication port to the scene process.
             */
            readonly port: IMyMessagePort;

            /**
             * Scene status is used to store temporary data about the scene.
             */
            readonly status: IConfigObject;

            /**
             * Scene status is used for UI to store data about the scene. It will be persisted while the scene is being saved.
             */
            readonly persistStatus: IConfigObject;

            /**
             * Whether the scene is loading.
             */
            readonly loading: boolean;

            /**
             * Whether the scene is read-only. Default is false.
             */
            readonly viewerMode: boolean;

            /**
             * If it is a PlayingScene, this property will point to the source scene.
             */
            readonly sourceScene?: IMyScene;

            /**
             * Whether the scene is modified.
             */
            readonly isModified: boolean;

            /**
             * Set the modified flag of the scene.
             */
            setModified(): void;

            /**
             * Get selection.
             * @param type The type of the selection, "node" or "asset" or other types. If not specified, the default type is "node".
             * @return The selection.
             */
            getSelection(type?: string): ReadonlyArray<any>;

            /**
             * Set selection.
             * @param objs Selection objects. 
             * @param type The type of the selection, "node" or "asset" or other types. If not specified, the default type is "node". 
             */
            setSelection(objs: any | any[], type?: string): void;

            /**
             * Type of current selection. "node" or "asset" or other types.
             */
            readonly selectionType: string;

            /**
             * Set the selection changed flag manually. 
             * Commonly the flag is set automatically when the selection is changed.
             * But in some cases, you may need to set it manually if you want to notify the listeners to update the UI.
             */
            setSelectionChangedFlag(): void;

            /**
             * Get a node by id. The node must have been queried before.
             * @param id The id of the node.
             * @return The node if found; otherwise, null. 
             */
            getNode(id: string): IMyNode | null;

            /**
             * Get a node by id asynchronously.
             * @param id The id of the node.
             * @return The node if found; otherwise, null.
             */
            getNodeAsync(id: string): Promise<IMyNode | null>;

            /**
             * Get top prefab of a node. Top prefab is the prefab which is not nested in another prefab.
             * @param node The node.
             * @return The top prefab if found; otherwise, null. 
             */
            getTopPrefab(node: IMyNode): Promise<IMyNode | null>;

            /**
             * Get prefab id of a node.
             * @param node The node.
             * @return The prefab id if found; otherwise, null. 
             */
            getPrefabId(node: IMyNode): Promise<string | null>;

            /**
             * Create a new node. 
             * 
             * Be aware that the node is only created in the scene process, and it is not added to the scene yet. Use IMyNode.addNode or IMyScene.addNode to add the node to the scene.
             * @param nodeType The type of the node. e.g. "Sprite", "Sprite3D", etc. 
             * @param props Initial properties of the node. 
             * @param parentNode The parent node of the new node. If not specified, the new node will be a root node. Be aware that the new node will not be added to this node.
             * @param options Options for creating the node.
             * @return The new node if created successfully; otherwise, null.
             */
            createNode(nodeType: string, props?: Record<string, any>, parentNode?: IMyNode, options?: ICreateNodeOptions): Promise<IMyNode | null>;

            /**
             * Create a new node by asset. 
             * 
             * Be aware that the node is only created in the scene process, and it is not added to the scene yet. Use IMyNode.addNode or IMyScene.addNode to add the node to the scene.
             * @param assetId The id of the asset. 
             * @param props Initial properties of the node. 
             * @param parentNode The parent node of the new node. If not specified, the new node will be a root node. Be aware that the new node will not be added to this node. 
             * @param options Options for creating the node. 
             */
            createNodeByAsset(assetId: string, props?: Record<string, any>, parentNode?: IMyNode, options?: ICreateNodeOptions): Promise<IMyNode | null>;

            /**
             * Instantiate a prefab.
             * @param assetId The id of the prefab asset. 
             * @param props Initial properties of the node. 
             * @param parentNode The parent node of the new node. If not specified, the new node will be a root node. Be aware that the new node will not be added to this node. 
             * @param options Options for creating the node.
             * @return The new node if instantiated successfully; otherwise, null. 
             */
            instantiatePrefab(assetId: string, props?: Record<string, any>, parentNode?: IMyNode, options?: ICreateNodeOptions): Promise<IMyNode | null>;

            /**
             * Delete a node.
             * @param node The node to delete. 
             */
            deleteNode(node: IMyNode): void;

            /**
             * Add a node to another node's hierarchy.
             * @param parentNode The parent node. 
             * @param node The node to add. 
             * @param index The index to add the node. If not specified, the node will be added to the end. 
             * @param worldPositionStays If true, the world position of the node will not change. Default is false. 
             */
            addNode(parentNode: IMyNode, node: IMyNode, index?: number, worldPositionStays?: boolean): Promise<void>;

            /**
             * Execute a script in the Scene process. It can execute static functions of classes decorated with ＠Laya.regClass or ＠EditorEnv.regClass.
             * @param command Class name and function name separated by a dot. e.g. "MyClass.myFunction".
             * @param params Parameters of the function. 
             * @return The return value of the function.
             */
            runScript(command: string, ...params: any[]): Promise<any>;

            /**
             * Almost the same as runScript, but it will send the command to the playing scene process first. If the scene is not in the playing state, it will behave the same as runScript.
             * @param command Class name and function name separated by a dot. e.g. "MyClass.myFunction".
             * @param params Parameters of the function. 
             * @return The return value of the function.
             * @see runScript
             */
            runScriptMax(command: string, ...params: any[]): Promise<any>;

            /**
             * Execute a function on a node or component.
             * @param nodeId The ID of the node.
             * @param componentId The ID of the component.
             * @param functionName The name of the function to execute.
             * @param args The arguments to pass to the function.
             * @return The return value of the function.
             */
            runNodeScript(nodeId: string, componentId: string, functionName: string, ...args: any[]): Promise<any>;

            /**
             * Run a callback function, and batch the changes to the scene. It is useful when you want to make multiple changes to the scene efficiently.
             * @param func Callback function to run.
             * @param options Options for running the batch.
             * - noHistory: If true, the changes will not be recorded in the history. Default is false.
             * - noPush: If true, the changes will not be sent to the scene process. Default is false.
             */
            runBatch(func: () => void, options?: { noHistory?: boolean, noPush?: boolean }): void;

            /**
             * Find nodes by keyword.
             * @param keyword The keyword to search. 
             * @param maxResults The maximum number of results. Default is 200. 
             * @return The nodes found.
             */
            findNodes(keyword: string, maxResults?: number): Promise<Array<IMyNode>>;

            /**
             * Add a component to a node.
             * @param node The node.
             * @param componentType The type of the component. e.g. "PhysicsCollider", "BoxCollider", etc.
             * @param props Initial properties of the component.
             * @return The new component if added successfully; otherwise, null. 
             */
            addComponent(node: IMyNode, componentType: string, props?: Record<string, any>): Promise<IMyComponent | null>;

            /**
             * Remove a component from a node.
             * @param node The node.
             * @param compId The id of the component. 
             */
            removeComponent(node: IMyNode, compId: string): Promise<void>;

            /**
             * Move a component up or down in the component list of a node.
             * @param node The node.
             * @param compId The id of the component. 
             * @param deltaIndex Integer to indicate how many positions to move the component. Positive value means moving down, negative value means moving up.
             */
            moveComponent(node: IMyNode, compId: string, deltaIndex: number): Promise<void>;

            /**
             * Change the type of a node or multiple nodes.
             * @param nodes a node or an array of nodes.
             * @param nodeType The new type of the node. 
             */
            changeNodesType(nodes: IMyNode | ReadonlyArray<IMyNode>, nodeType: string): Promise<IMyNode[]>;

            /**
             * Replace a prefab node with another prefab asset.
             * @param nodes A node to be replaced. 
             * @param assetId The id of the prefab asset to replace with.
             */
            replaceNodesWithPrefab(nodes: IMyNode | ReadonlyArray<IMyNode>, assetId: string): Promise<IMyNode[]>;

            /**
             * Get the children of a node.
             * @param parentNode The parent node.
             * @return The children of the node. 
             */
            getNodeChildren(parentNode: IMyNode): Promise<ReadonlyArray<IMyNode>>;

            /**
             * Get all decendants of a node.
             * @param parentNode The parent node. 
             * @param out If specified, the result will be stored in this array, otherwise, a new array will be created.
             * @return The decendants of the node. 
             */
            getNodeDescendants(parentNode: IMyNode, out?: Array<IMyNode>): Promise<IMyNode[]>;

            /**
             * Synchronize the node props with the scene process.
             * @param node The node. 
             */
            syncNode(node: IMyNode): Promise<void>;

            /**
             * Move the node to the focus position.
             * @param node The node. 
             */
            focusNode(node: IMyNode): void;

            /**
             * Synchronize the nodes with the scene process.
             * @param nodes The nodes. If not specified, selected nodes will be synchronized.
             */
            syncNodes(nodes?: ReadonlyArray<IMyNode>): Promise<void>;

            /**
             * Copy the selected nodes.
             */
            copyNodes(): Promise<void>;

            /**
             * Paste the copied nodes.
             * @param inPlace If true, the nodes will be pasted in place, which means the position of the nodes will not change. Default is false.
             * @param asChild If true, the nodes will be pasted as children of the first selected node. Default is false.
             * @return The new nodes.
             */
            pasteNodes(inPlace?: boolean, asChild?: boolean): Promise<Array<IMyNode>>;

            /**
             * Duplicate the selected nodes.
             * @return The new nodes.
             */
            duplicateNodes(): Promise<Array<IMyNode>>;

            /**
             * Delete the selected nodes.
             */
            deleteNodes(): void;

            /**
             * Move the selected nodes.
             * @param action The action to move the nodes.
             */
            changeNodesOrder(action: "bringForward" | "sendBackward" | "sendToBack" | "bringToFront"): void;

            /**
             * Create a new prefab asset from the specified node.
             * @param nodeId Node id.
             * @param savePath The path to save the prefab asset. It is a relative path to the asset root. 
             * @param fileName If specified, the name of the prefab asset. If not specified, the name of the node will be used.
             * @return The new asset and the new node.
             */
            createPrefab(nodeId: string, savePath: string, fileName?: string): Promise<{ asset: IAssetInfo, newNode: IMyNode }>;

            /**
             * Add a component to all selected nodes.
             * @param componentType The type of the component. e.g. "PhysicsCollider", "BoxCollider", etc. 
             */
            addComponentToNodes(componentType: string): Promise<void>;

            /**
             * Get the properties of a resource.
             * @param resId The id of the resource.
             * @return The properties of the resource. 
             */
            getResourceProps<T = any>(resId: string): Promise<T>;

            /**
             * Send a message to the scene process.
             * @param channel The channel of the message.
             * @param args The arguments of the message. 
             */
            send(channel: string, ...args: any[]): void;

            /**
             * Send a message to the scene process and wait for the response.
             * @param channel The channel of the message. 
             * @param args The arguments of the message.
             * @return The response of the message. 
             */
            invoke(channel: string, ...args: any[]): Promise<any>;

            /**
             * Check if the object is a node in the scene.
             * @param node The object to check.
             * @return True if the object is a node in the scene; otherwise, false.
             */
            isNode(node: any): boolean;
        }

        export var PrefabOverridesKey: symbol;

        export enum NodeFeatures {
            HasChild = 1,
            RootNode = 2,
            Inactive = 4,
            InPrefab = 8,
            IsPrefab = 16,
            IsPrefabNewAdded = 32,
            IsTopPrefab = 64,
            IsPrefabReadonly = 128,
            Missing = 256,
            HideByEditor = 1024,
            LockByEditor = 2048,
            PrefabMissing = 4096,
            HasScript = 8192,
        }

        export interface IMyNode {
            /**
             * ID of the node.
             */
            readonly id: string;

            /**
             * Props of the node.
             */
            readonly props: Record<string, any>;

            /**
             * ID of the node.
             */
            readonly icon: string;

            /**
             * Thumbnail of the node.
             */
            readonly thumbnail: string;

            /**
             * Type of the node. It is a type which is defined in the typeRegistry.
             */
            readonly type: string;

            /**
             * Whether the node is a 3D node.
             */
            readonly is3d: boolean;

            /**
             * Parent node.
             */
            readonly parent: IMyNode;

            /**
             * Children nodes. Empty array if the node has no children.
             */
            readonly children: Array<IMyNode>;

            /**
             * Index of the node in the parent's children array.
             */
            readonly childIndex: number;

            /**
             * Name of the node.
             */
            readonly name: string;

            /**
             * A number version is designed to track the changes of the node. It will be increased when the props of the node is changed, or the children of the node is changed.
             */
            ver: number;

            /**
             * The tree version is used to determine if the node tree has changed.
             */
            treeVer: number;

            /**
             * A number version is designed to track the changes of the props of the node. It will be increased when the props of the node is changed.
             */
            propsVer: number;

            /**
             * A number version is designed to track the changes of the status of the node. It will be increased when the status of the node is changed.
             * 
             * Status of the node includes the label, the lock status, the hide status, etc.
             */
            statusVer: number;

            /**
             * Features of the node.
             * @see NodeFeatures
             */
            features: number;

            /** 
             * If true, the node is not allowed to be deleted.
             */
            readonly dontDestroy?: boolean;

            /** 
             * If true, the node is not allowed to add child or remove child or change the order of the children.
             */
            readonly dontChangeChildren?: boolean;

            /** 
             * If true, the node is not allowed to add component.
             */
            readonly noAddComponent?: boolean;

            /**
             * Add a child node to the node.
             * @param node The child node to add. 
             */
            addChild(node: IMyNode): void;

            /**
             * Change the index of the node in the parent's children array.
             * @param index The new index of the node. 
             */
            setChildIndex(index: number): void;

            /**
             * Whether the node is a decendant of the node.
             * @param node The node to check.
             * @returns True if the node is a decendant of the node, false otherwise. 
             */
            isAncestorOf(node: IMyNode): boolean;

            /**
             * All the component ids of the node.
             */
            readonly componentIds: ReadonlyArray<string>;

            /**
             * All the components of the node by id.
             */
            readonly components: Record<string, IMyComponent>;

            /**
             * Get the component by type.
             * @param type The type of the component. If finding a script component, the type should be the uuid of the script file, or the script class name.
             * @param allowDerives If true, components derived from `type` may be returned; if false, the component type must match exactly. Default is false.
             * @returns The component if found; otherwise, null.
             */
            getComponent(type: string, allowDerives?: boolean): IMyComponent | null;
            /**
             * Prefab overrides of the node.
             */
            readonly [PrefabOverridesKey]?: Array<Array<string>>;

            /**
             * Prefab overrides of the node or the component.
             * @param key If key is specified, the prefab overrides of the component with the key will be returned; otherwise, the prefab overrides of the node will be returned.
             * @returns The prefab overrides of the node or the component.
             */
            getPrefabOverrides(key?: string): Array<Array<string>>;

            /**
             * Whether the node is Scene3D node or Scene2D node.
             */
            readonly isRoot: boolean;

            /**
             * Whether the node is the root node of a prefab, and the prefab is not nested in another prefab.
             */
            readonly isTopPrefab: boolean;

            /**
             * Whether the node is in a prefab.
             */
            readonly inPrefab: boolean;

            /**
             * Test if the node has the specified feature.
             * @param feature The feature to test.
             * @returns True if the node has the specified feature; otherwise, false.
             * @see NodeFeatures 
             */
            hasFeature(feature: number): boolean;
        }

        export interface IMyComponent {
            /**
             * Owner node of the component.
             */
            readonly owner: string;

            /**
             * ID of the component.
             */
            readonly id: string;

            /**
             * Type of the component. It is a type which is defined in the typeRegistry.
             */
            readonly type: string;

            /**
             * Props of the component.
             */
            readonly props: Record<string, any>;

            /**
             * If true, the owner of the component is a node in a prefab, and the component is not a new added component.
             */
            readonly inPrefab?: boolean;

            /**
             * Prefab overrides of the node.
             */
            readonly [PrefabOverridesKey]?: Array<Array<string>>;
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
        export interface IModuleInfo {
            /**
             * Identifier of the module.
             */
            id: string;

            /**
             * Name of the module.
             */
            name: string;

            /**
             * Whether the module is visible to users.
             */
            visible: boolean;

            /**
             * Description of the module.
             */
            description: string;

            /**
             * Dependencies of the module.
             */
            dependencies: Array<IModuleInfo>;

            /**
             * Download URLs of the module.
             */
            downloadUrls: Array<{
                url: string,
                destination: string
            }>;

            /**
             * Category of the module.
             */
            category: string;

            /**
             * Download size of the module.
             */
            downloadSize: number;

            /**
             * Installed size of the module.
             */
            installedSize: number;

            /**
             * Whether the module is self-installed.
             */
            selfInstalled: boolean;

            /**
             * Whether the module and all its dependencies are installed.
             */
            installed: boolean;

            /**
             * Installation path of the module.
             */
            path: string;

            /**
             * Original data of the module.
             */
            data: any;
        }

        export interface IModulesManager {
            /**
             * All modules.
             */
            allModules: Array<IModuleInfo>;

            /**
             * Installation base path.
             */
            homePath: string;

            /**
             * Get a module by its identifier.
             * @param id Identifier of the module.
             * @returns The module.
             */
            getModule(id: string): Readonly<IModuleInfo>;

            /**
             * Show module installation dialog if any of the modules is not installed.
             * @param modules Identifiers of the modules.
             * @param alert Whether to show alert messages before displaying the dialog.
             * @param waitForComplete Whether to wait for the installation to complete.
             * @returns Whether the installation is successful.
             */
            installModules(modules: Array<string>, alert?: boolean, waitForComplete?: boolean): Promise<boolean>;

            /**
             * Gather modules to install, including the specified modules and their dependencies.
             * @param ids Identifiers of the modules to install.
             * @returns The modules to install. 
             */
            gatherModulesToInstall(ids: Array<string>): Array<IModuleInfo>;

            /**
             * Install a module.
             * @param id The identifier of the module to install.
             * @param progressCallback Callback function to report the progress of the operation. The name parameter is the name of the current downloading/installing file. The phase value is 0 or 1, 0 for downloading and 1 for installing. The loaded and total values are the loaded and total bytes of the current phase, respectively.
             * @param abortToken Abort token. If you want to abort the operation on some conditions, you can pass an abort token here. Call abortToken.signal() to abort the operation.
             * @returns Whether the installation is successful.
             */
            installModule(id: string, progressCallback?: (name: string, phase: number, loaded: number, total: number) => void, abortToken?: IAbortToken): Promise<boolean>;
        }
        export interface IMenuItem {
            /**
             * Will be called with `click(menuItemId)` when the menu item
             * is clicked.
             * @param menuItemId Menu item ID.
             * @param userData User data. This is the same as the `userData` parameter passed in the show method.
             */
            click?: (menuItemId: string, userData?: any) => void;

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

            /**
             * Display title of the menu item. It could be omitted if `type` is `separator` or `role` is specified.
             * 
             * Use "i18n:&lt;key&gt;" or "i18n:&lt;file-id&gt;:&lt;key&gt;" to specify the key of the internationalization string.
             */
            label?: string;

            /**
             * Keyboard shortcut for the menu item.
             */
            accelerator?: string;

            /**
             * If false, the menu item will be greyed out and unclickable.
             */
            enabled?: boolean;

            /**
             * If false, the menu item will be entirely hidden.
             */
            visible?: boolean;

            /**
             * Should only be specified for `checkbox` or `radio` type menu items.
             */
            checked?: boolean;

            /**
             * Should be specified for `submenu` type menu items. If `submenu` is specified,
             * the `type: 'submenu'` can be omitted.
             */
            submenu?: IMenuItem[];

            /**
             * Unique within a single menu. If defined then it can be used as a reference to
             * this item by the position attribute.
             */
            id?: string;

            /**
             * Sets the position of the menu item. 
             * 
             * Supported syntax: "first" / "last" / "before ids" / "after ids" / "beforeGroup ids" / "afterGroup ids".
             * 
             * The difference between "before" and "beforeGroup" is that "before" inserts before the reference menu item, while "beforeGroup" inserts before the nearest separator before the reference menu item.
             * 
             * The difference between "after" and "afterGroup" is that "after" inserts after the reference menu item, while "afterGroup" inserts after the nearest separator after the reference menu item.
             * 
             * Within the same class extension definition, the default is to add after the previous menu item. If not in the same class, the default is to add to the end of the menu if position is not specified.
             * 
             * Multiple reference menu item ids are separated by commas.
             */
            position?: string;
        }

        export interface ICustomMenuItemOptions extends Pick<IMenuItem, "id" | "label" | "accelerator" | "position" | "visible" | "checked" | "enabled"> {
            /**
             * Whether the menu item is a checkbox. Same as `type: 'checkbox'`.
             */
            checkbox?: boolean;
            /**
             * Whether the menu item is a radio. Same as `type: 'radio'`.
             */
            radio?: boolean;

            /**
             * Insert a separator before the menu item.
             */
            sepBefore?: boolean;

            /**
             * Insert a separator after the menu item.
             */
            sepAfter?: boolean;

            /**
             * A function to test whether the menu item should be enabled.
             * 
             * It is only effective for context menu items, but not for main menu items.
             */
            enableTest?: () => boolean;

            /**
             * A function to test whether the menu item should be visible.
             * 
             * It is only effective for context menu items, but not for main menu items.
             */
            visibleTest?: () => boolean;

            /**
             * A function to test whether the menu item should be checked.
             * 
             * It is only effective for context menu items, but not for main menu items.
             */
            checkedTest?: () => boolean;
        }

        export interface IMenuPopupOptions {
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
             * Optionally, a submenu can be popped up.
             */
            submenu?: string;
        }

        export interface IMenu {
            /**
             * Identifier of the menu.
             */
            readonly id: string;

            /**
             * Name of the menu.
             */
            name: string;

            /**
             * A property for users to conveniently store data.
             */
            data: any;

            /**
             * This callback function is called when a menu item is clicked and the menu item does not have a click handler bound.
             * @param itemId Menu item ID.
             * @param userData User data. This is the same as the `userData` parameter passed in the show method.
             */
            onClickItem: IMenuItem["click"];

            /**
             * Destroy the menu.
             */
            dispose(): void;

            /**
             * Set enabled state of a menu item.
             * @param itemId Menu item ID.
             * @param enabled Whether the menu item is enabled.
             */
            setItemEnabled(itemId: string, enabled: boolean): void;

            /**
             * Get enabled state of a menu item.
             * @param itemId Menu item ID.
             * @returns Whether the menu item is enabled.
             */
            isItemEnabled(itemId: string): boolean;

            /**
             * Set visible state of a menu item.
             * @param itemId Menu item ID.
             * @param visible Whether the menu item is visible.
             */
            setItemVisible(itemId: string, visible: boolean): void;

            /**
             * Set checked state of a menu item.
             * @param itemId Menu item ID.
             * @param checked Whether the menu item is checked.
             */
            setItemChecked(itemId: string, checked: boolean): void;

            /**
             * Get checked state of a menu item.
             * @param itemId Menu item ID.
             * @returns Whether the menu item is checked.
             */
            isItemChecked(itemId: string): boolean;

            /**
             * Set label of a menu item.
             * @param itemId Menu item ID.
             * @param label Label of the menu item.
             */
            setItemLabel(itemId: string, label: string): void;

            /**
             * Get label of a menu item.
             * @param itemId Menu item ID.
             * @returns Label of the menu item. 
             */
            getItemLabel(itemId: string): string;
            /**
             * Update the menu. Ownership of the template array is transferred to the menu; do not use it after calling this method.
             * @param template Menu template.
             */
            setItems(template: Array<IMenuItem>): void;

            /**
             * Display the menu.
             * @param callbackThisObj The `this` object of the callback function.
             * @param popupOptions Popup options.
             * @param callbackUserData User data that will be passed to the callback function when a menu item is clicked. This is optional and can be used to pass extra information to the callback function.
             */
            show(callbackThisObj?: any, popupOptions?: IMenuPopupOptions, callbackUserData?: any): void;

            /**
             * Simulate a click on a menu item.
             * @param itemId Menu item ID. 
             * @param callbackThisObj The `this` object of the callback function. 
             * @param callbackUserData User data that will be passed to the callback function when a menu item is clicked. This is optional and can be used to pass extra information to the callback function.
             */
            simulateClick(itemId: string, callbackThisObj?: any, callbackUserData?: any): void;
        }

        export namespace MenuStatic {
            /**
             * Get a menu by ID.
             * @param id Menu ID.
             * @returns The menu.
             */
            function getById(id: string): IMenu;

            /**
             * Create a menu.
             * @param template Menu template.
             * @returns The menu.
             */
            function create(template?: Array<IMenuItem>): IMenu;

            /**
             * Create a menu.
             * @param id Menu ID.
             * @param template Menu template.
             * @returns The menu.
             */
            function create(id: string, template?: Array<IMenuItem>): IMenu;

            /**
             * Get the position to pop up a menu. By default, the menu will be popped up at the current mouse cursor position.
             * @param anchor An optional HTML element as the anchor of the popup position. If not specified, the current mouse cursor position will be used.
             * @return The popup position. If the anchor element is null, null will be returned. Otherwise, the popup position will be calculated based on the anchor element. The x coordinate of the popup position is the left edge of the anchor element, and the y coordinate of the popup position is the bottom edge of the anchor element.
             */
            function getPopupPosition(anchor?: HTMLElement): { x: number, y: number } | null;
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

        export interface IListInsertionHelper {
            /**
             * Get insertion information.
             * @returns obj is the reference object to insert by, it could be null if no object is selected.
             *  - 'in': add as a child of the object.
             *  - 'above': Insert above the object.
             *  - 'below': Insert below the object.
             */
            getInsertPos(): { obj: gui.Widget | null, pos: 'in' | 'above' | 'below' };
        }


        export interface IListHelper {
            /**
             * Called when an item is added to the list.
             * @param index Insertion index. 
             * @param item The item that was added.  
             */
            readonly onInsert: (index: number, item: any) => void;

            /**
             * Called when an item is removed from the list.
             * @param index The index of the item that was removed. 
             */
            readonly onRemove: (index: number) => void;

            /**
             * Called when two items are swapped.
             * @param index1 Index of the first item.
             * @param index2 Index of the second item.
             */
            readonly onSwap: (index1: number, index2: number) => void;

            /**
             * Trigger add operation.
             */
            add(): void;

            /**
             * Trigger insert operation.
             */
            insert(): void;

            /**
             * Trigger remove operation.
             */
            remove(): void;

            /**
             * Trigger move up operation.
             */
            moveUp(): void;

            /**
             * Trigger move down operation.
             */
            moveDown(): void;

            /**
             * Trigger swap operation.
             * @param index1 Index of the first item. 
             * @param index2 Index of the second item. 
             */
            swapItem(index1: number, index2: number): void;

            /**
             * Update the text of the index column.
             * @param from Start index.
             * @param to End index. End index is exclusive.
             */
            updateIndexColumn(from: number, to: number): void;
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
        export namespace IInspectorRegistry {
            /**
             * A version number will be increased by 1 every time the inspector registry is updated.
             */
            const version: number;

            /**
             * Get a field class by name.
             * @param name Field name.
             * @returns The field class, or `undefined` if no field is registered under the name.
             */
            function getFieldClass(name: string): IPropertyFieldConstructor | undefined;

            /**
             * Create layout instances for the specified type and targets. Layout instances are cached and reused, so don't forget to call returnLayouts when you are done with them.
             * @param type 'asset' or 'node' or any other type. 
             * @param targets The objects to render.
             * @returns Layout instances.
             */
            function createLayouts(type: string, targets: ReadonlyArray<any>): Array<IInspectorLayout>;

            /**
             * Put layout instances back to the cache.
             * @param type 'asset' or 'node' or any other type. 
             * @param items Layout instances. 
             */
            function returnLayouts(type: string, items: Array<IInspectorLayout>): void;
        }

        /** Public contract for a reusable inspector panel model. */
        export interface IInspectorPanelModel {
            /** Whether edits should be recorded in the model's history. */
            allowUndo: boolean;
            /** Whether data-change tracing is temporarily disabled. */
            stopTrace: boolean;
            /** Data-change notifications emitted by watched inspector targets. */
            readonly onDataChanged: IDelegate<(sender: any, datapath: string[], value: any, oldvalue: any) => void>;
            /** History used for undo and redo. */
            readonly history: IDataHistory;
            /** Replaces the history used for subsequent edits. */
            setHistory(history: IDataHistory): void;
            /** Adds a typed object to the inspector. */
            inspect(data: any, type: string | FTypeDescriptor | Function, options?: IInspectorOptions): void;
            /** Clears all inspectors and watched-data listeners. */
            resetInspectors(): void;
            /** Restores all current inspector fields to their defaults. */
            resetDefault(): void;
            /** Returns the data inspectors currently owned by this model. */
            getInspectors(): ReadonlyArray<IDataInspector>;
            /** Scrolls the panel to a catalog when it exists. */
            showCatalog(catalog: string): void;
            /** Returns the current vertical scroll position. */
            getScrollY(): number;
            /** Sets the vertical scroll position, retaining it until the view is mounted. */
            setScrollY(value: number): void;
            /** Returns the content height, clamped to the optional minimum. */
            resizeToFit(minSize?: number): number;
            /** Routes an editor hotkey event to this model's history. */
            handleHotkey(evt: gui.Event): void;
        }

        /** Structural role of a field in the inspector schema tree. */
        export type InspectorFieldKind = "catalog" | "object" | "array" | "dictionary" | "property";

        /** Immutable identity plus mutable schema data used to construct one inspector field. */
        export interface IInspectorFieldSchema {
            /** Stable field ID, unique within the owning inspector model. */
            readonly id: string;
            /** Structural role that determines the field container behavior. */
            kind: InspectorFieldKind;
            /** Descriptor of the object that owns `property`. */
            objType: FTypeDescriptor;
            /** Property rendered by this field. */
            property: FPropertyDescriptor;
            /** Ordered child-field schemas. */
            children: IInspectorFieldSchema[];
        }

        /** Root snapshot used by React's external-store subscription protocol. */
        export interface IInspectorSnapshot {
            /** Monotonically increasing model version. */
            readonly version: number;
            /** IDs of the current root fields in display order. */
            readonly rootIds: ReadonlyArray<string>;
        }

        /** Per-field snapshot used to avoid rerendering unrelated inspector fields. */
        export interface IInspectorFieldSnapshot {
            /** Current field instance. */
            readonly field: IPropertyField;
            /** Version incremented when field data or status changes. */
            readonly version: number;
            /** Version incremented when the field's child structure changes. */
            readonly structureVersion: number;
        }

        /** Read-only reactive store exposed by an inspector model. */
        export interface IInspectorStore {
            /** Return the current root snapshot. */
            getSnapshot(): IInspectorSnapshot;
            /** Return the current snapshot for a field ID. */
            getFieldSnapshot(fieldId: string): IInspectorFieldSnapshot;
            /** Resolve a field ID to its live field instance. */
            getField(fieldId: string): IPropertyField;
            /** Subscribe to root changes; the returned function unsubscribes. */
            subscribe(listener: () => void): () => void;
            /** Subscribe to one field; the returned function unsubscribes. */
            subscribeField(fieldId: string, listener: () => void): () => void;
        }

        /** Inspector data model that owns field construction, resolution, and granular notifications. */
        export interface IInspectorModel extends IDataInspector {
            /** Build child schemas for an object type while guarding recursive type graphs. */
            createObjectChildSchemas(typeDef: FTypeDescriptor, parentId: string, visitedTypes?: Set<string>, objectDepth?: number): IInspectorFieldSchema[];
            /** Construct and register a live property field from a schema. */
            createField(schema: IInspectorFieldSchema, parent?: IPropertyField): IPropertyField;
            /** Notify subscribers that a field's data or status changed. */
            notifyField(field: IPropertyField): void;
            /** Notify subscribers that a field's child structure changed. */
            onFieldStructureChanged(field: IPropertyField): void;
            /** Resolve all currently inspected data targets before rendering or refreshing. */
            resolveDatas(): Promise<void>;
        }

        export interface IInspectorLayout {
            /**
             * Tests whether the specified object is accepted for rendering.
             * @param item The object to test. It is usually a IAssetInfo object, or a IMyNode object, or any other object.
             */
            accept(item: any): boolean;

            /**
             * Render the inspector layout.
             * 
             * outTracables is an array that the implementer can fill in the data that needs to be traced, so that the manager can understand whether the "Apply" and "Undo" buttons need to be displayed when these Inspectors are displayed, and decide the availability of these buttons based on the changes in the data.
             * 
             * @param items Multiple objects to render. Each object is usually a IAssetInfo object, or a IMyNode object, or any other object. 
             * @param inspectors The inspector helper. 
             * @param outTracables A in array that the implementer can fill in the data that needs to be traced.
             */
            onRender(items: ReadonlyArray<any>, inspectors: IInspectorHelper, outTracables: Array<any>): Promise<void>;

            /**
             * If some data is tracing, this method will be called when the "Apply" button is clicked.
             */
            onApply?(): Promise<void>;
        }
        export interface IInspectorOptions {
            /**
             * Title of the inspector.
             */
            title?: string;

            /**
             * Whether the inspector is read-only.
             */
            readonly?: boolean;

            /**
             * statusStore is a object that contains the status of the inspector, such as the selected tab, the expanded state of the tree, etc.
             */
            statusStore?: any;

            /**
             * If this is set, a sub-object with the key of statusStoreSubId will be created in the statusStore object, which will be really used to store the status.
             */
            statusStoreSubId?: string;

            /**
             * Catalog bar style. Use `Hidden` to hide the catalog bar. Default is `normal`.
             * - `normal`: Normal style.
             * - `hidden`: Hide the catalog bar.
             * - `transparent`: Show the catalog bar without the background.
             */
            catalogBarStyle?: CatalogBarStyle;
        }

        export interface IInspectorHelper {

            /**
             * Whether to join the properties of multiple objects. Default is false.
             * 
             * Suppose two objects are currently selected: A and B, and their data types are A' and B'. The data type of the Pa property of object A is T, and the data type of the Pb property of object B is also T:
             * 
             * If joinProps is true, Pa and Pb will be displayed as a single property for editing, regardless of whether A' and B' are the same. Other properties with different types will be hidden.
             * 
             * If joinProps is false, only if A' and B' are exactly the same, the properties of A (which are also the properties of B) will be displayed for editing.
             */
            joinProps: boolean;

            /**
             * Add a object to the inspector. `add` can be called multiple times to add multiple objects.
             * @param target The target.
             * @param type The type of the data.
             * @param data The data. 
             * @param options Options.
             */
            add(target: any, type: string, data: any, options?: IInspectorOptions): void;

            /**
             * If we have multiple selections, we can call this method to start adding objects of the next selection.
             */
            next(): void;

            /**
             * Whether we have added any objects.
             */
            get isEmpty(): boolean;

            /**
             * Get the inspector nodes that we have generated.
             */
            getNodes(): ReadonlyArray<IPropertyField>;

            /**
             * Get the inspectors that we have created.
             */
            getInspectors(): ReadonlyArray<IDataInspector>;

            /**
             * Handy method to get all property fields with the specified tag.
             * @param tag The tag.
             * @param result If provided, the result will be added to this array. Otherwise, a new array will be created.
             * @returns The array of property fields with the specified tag.
             */
            getFieldsByTag(tag: string, result?: Array<IPropertyField>): Array<IPropertyField>;

            /**
             * Display all inspectors.
             * @param parent The parent node. 
             * @param expanded Whether to expand all top-level nodes. Default is true. 
             */
            show(parent: gui.TreeNode, expanded?: boolean): void;

            /**
             * Hide all inspectors.
             */
            hide(): void;

            /**
             * Clear all inspectors.
             */
            reset(): void;
        }

        /**
         * Inspecting target interface.
         */
        export interface IInspectingTarget {
            /**
             * Array of data. As selection can be multiple, this array contains all selected data.
             */
            readonly datas: Array<any>;

            /**
             * The first data in the datas array.
             */
            readonly data: any;

            /**
             * Owner property field of this target.
             */
            readonly owner: IPropertyField;

            /**
             * Get the value of the target. It is equivalent to: data[owner.property.name]
             */
            getValue(): any;

            /**
             * Set the value of the target. It is equivalent to: datas.forEach(data => data[owner.property.name] = value)
             * 
             * Before setting the value, the value is validated by validators including the `required` value and the `validator` value of the property.
             * @param value Value to set.
             * @returns True if the value is set successfully, false if the value is invalid.
             */
            setValue(value: any): boolean;

            /**
             * Validate a value. The validators include the `required` value and the `validator` value of the property.
             * @param data The data object to set the value.
             * @param value Value to set.
             * @param prop The property descriptor. By default, it is the owner's property descriptor.
             * @returns True if the value is valid, false if the value is invalid. 
             */
            validate(data: any, value: any, prop?: FPropertyDescriptor): boolean;

            /**
             * Get the value of a property other than the owner's property.
             * @param propName The property name.
             * @returns The value of the property.
             */
            getPropertyValue(propName: string): any;

            /**
             * Set the value of a property other than the owner's property.
             * @param propName The property name.
             * @param value The value to set. 
             */
            setPropertyValue(propName: string, value: any): void;

            /**
             * Get the property descriptor of a property other than the owner's property.
             * @param propName 
             */
            getProperty(propName: string): Readonly<FPropertyDescriptor>;
        }

        /**
         * Interface for a dialog that prompts the user for a text input.
         */
        export interface IInputTextDialog extends IDialog {
            /**
             * Show the dialog.
             * @param popupOwner If the dialog is a popup window, it is used to calculate the popup position.
             * @param msg Prompt message. 
             * @param text Default text. 
             * @param multiline Whether the input text is multiline. 
             */
            show(popupOwner: DialogPopupOwner, msg?: string, text?: string, multiline?: boolean): Promise<void>;
        }

        export interface IHotkeyManager {
            /**
             * Install the hotkey manager to the given groot.
             * @param groot The groot to install the hotkey manager to.
             */
            install(groot: gui.GRoot): void;

            /**
             * Initialize the key map from preferences.
             */
            initKeyMap(): void;

            /**
             * Register a key combination.
             * @param combo The key combination to register.
             * @param func The function name associated with the key combination. 
             */
            enableKey(combo: string, func?: string): void;

            /**
             * Check if a key combination is registered.
             * @param combo The key combination to check.
             * @returns True if the key combination is registered, false otherwise. 
             */
            isComboRegistered(combo: string): boolean;
            /**
             * Manually trigger a key combination
             * @param combo The key combination to trigger.
             * @param groot The groot to dispatch the hotkey event to. Defaults to groot of the main window.
             */
            emit(combo: string, groot?: gui.GRoot): void;
        }
        /**
         * Interface for the hierarchy panel
         */
        export interface IHierarchyPanel extends IEditorPanel {
            /**
             * Get current selected node. Null if no node is selected. Return the first selected node if multiple nodes are selected.
             * @returns The first selected node, or null when no node is selected.
             */
            getSelectedNode(): IMyNode | null;

            /**
             * Get current selected nodes. Empty array if no node is selected.
             * @returns The selected nodes. The owner of the returned array is transferred to the caller.
             */
            getSelectedNodes(): Array<IMyNode>;

            /**
             * Get current expanded nodes. Empty array if no node is expanded.
             * @returns The expanded nodes. The owner of the returned array is transferred to the caller.
             */
            getExpandedNodes(): Array<string>;

            /**
             * Expand the specified nodes.
             * @param arr The expanded nodes.
             */
            setExpandedNodes(arr: ReadonlyArray<string>): void;

            /**
             * Expand the specified node.
             * @param sceneNode The node to expand. 
             */
            expand(sceneNode: IMyNode): void;

            /**
             * Highlight the specified node.
             * @param sceneNode The node to highlight. 
             */
            highlight(sceneNode: IMyNode): void;
        }

        /** Options supported by the React gradient editor dialog. */
        export interface GradientEditDialogOptions extends GradientInputOptions {
            /** Hides alpha-stop editing. */
            hideAlpha?: boolean;
        }

        /**
         * Interface for the React gradient editor dialog.
         */
        export interface IGradientEditDialog extends IDialog {
            /**
             * Show the gradient editor.
             * @param popupOwner Element or widget used to position the popup.
             * @param value Initial gradient value.
             * @param options Gradient editing options.
             * @param onChange Called whenever the edited gradient changes.
             */
            show(popupOwner: DialogPopupOwner, value: GradientInputValue, options: GradientEditDialogOptions, onChange: (value: GradientInputValue) => void): Promise<void>;

            /**
             * Update the value and options displayed by an open gradient editor.
             * @param value The new gradient value.
             * @param options The new options. Existing options are retained when omitted.
             */
            setValue(value: GradientInputValue, options?: GradientEditDialogOptions): void;
        }

        /**
         * Interface for GUI utils
         */
        export interface IGUIUtils {
            /**
             * The default background color。
             */
            bgColor: gui.Color;
            /**
             * The default color of separator lines。
             */
            lineColor: gui.Color;
            /**
             * The default color of text。
             */
            textColor: gui.Color;

            /**
             * Create a button.
             * @param autoSize Whether the button should automatically adjust its size to fit its title.
             */
            createButton(autoSize?: boolean): gui.Button;

            /**
             * Create a button with an icon.
             * @param flat Whether the button is flat style.
             */
            createIconButton(flat?: boolean): gui.Button;

            /**
             * Create a checkbox.
             * @param autoSize Whether the checkbox should automatically adjust its size to fit its title. 
             */
            createCheckbox(autoSize?: boolean): gui.Button;

            /**
             * Create a checkbox with an icon.
             * @param flat Whether the checkbox is flat style. 
             */
            createIconCheckbox(flat?: boolean): gui.Button;

            /**
             * Create a radio button.
             */
            createRadio(): gui.Button;

            /**
             * Create a combo box.
             */
            createComboBox(): gui.ComboBox;

            /**
             * Create a input text.
             */
            createTextInput(): TextInput;

            /**
             * Create a text area.
             */
            createTextArea(): TextArea;

            /**
             * Create a input text for search.
             */
            createSearchInput(): SearchInput;

            /**
             * Create a numeric input.
             */
            createNumericInput(): NumericInput;

            /**
             * Create a color input.
             */
            createColorInput(): ColorInput;

            /**
             * Create a gradient input.
             */
            createGradientInput(): GradientInput;

            /**
             * Create a curve input.
             */
            createCurveInput(): CurveInput;

            /**
             * Create a resource input.
             */
            createResourceInput(): ResourceInput;

            /**
             * Create a node reference input.
             */
            createNodeRefInput(): NodeRefInput;

            /**
             * Create a progress bar.
             */
            createProgressBar(): gui.ProgressBar;

            /**
             * Create a slider.
             */
            createSlider(): gui.Slider;

            /**
             * Create a list item.
             */
            createListItem(): ListItem;

            /**
             * Create a list item with an icon.
             */
            createIconListItem(): ListItem;

            /**
             * Create a list item with a checkbox.
             */
            createCheckboxListItem(): ListItem;

            /**
             * Create a list item with a checkbox and an icon.
             */
            createCheckboxIconListItem(): ListItem;

            /**
             * Create a inspector panel.
             */
            createInspectorPanel(): InspectorPanel;
        }
        /**
         * `IEditor.Flow` — the shared, editor-agnostic graph editing core (React Flow
         * based). Used by editor plugins/panels (and the blueprint & shader editors) to
         * embed a node graph. The runtime implementation lives in `src/editor/react/flow` and
         * is mounted onto `IEditor.Flow` in `Mount.ts`.
         *
         * Typical usage from a panel:
         * ```tsx
         * const store = IEditor.Flow.createGraphStore(initialGraph);
         * const registry = new IEditor.Flow.NodeRegistry(myDefs);
         * const portTypes = new IEditor.Flow.PortTypeRegistry(myTypes);
         * reactDOM.render(<IEditor.Flow.GraphEditor store={store} registry={registry} portTypes={portTypes} />);
         * ```
         */
        export namespace IFlow {
            /** A point in graph coordinates, before viewport pan and zoom are applied. */
            interface XY {
                /** Horizontal graph coordinate. */
                x: number;
                /** Vertical graph coordinate. */
                y: number;
            }

            /** A node input/output port (slot). */
            interface GraphPort {
                /** ID unique within the owning node. */
                id: string;
                /** Input or output direction. Links always run from `out` to `in`. */
                kind: "in" | "out";
                /** Host-defined type key resolved through `IPortTypeRegistry`. */
                dataType: string;
                /** Marks an execution/control-flow port rather than a value port. */
                isExec?: boolean;
                /** Where the port is rendered. Defaults to `body`. */
                placement?: "body" | "header";
                /** Overrides the default single/multiple-link rule for this port. */
                multi?: boolean;
                /** User-facing label. */
                label?: string;
                /** Host-owned serializable payload; the editor does not interpret it. */
                data?: Record<string, any>;
            }

            /** A node instance on the canvas. */
            interface GraphNode {
                /** Stable ID referenced by links and selection state. */
                id: string;
                /** Registry key of the node definition. */
                typeId: string;
                /** Top-left position in graph coordinates. */
                position: XY;
                /** Persisted node size when the host supports resizable nodes. */
                size?: { w: number; h: number };
                /** Ordered input ports. */
                inputs: GraphPort[];
                /** Ordered output ports. */
                outputs: GraphPort[];
                /** Host-owned serializable node properties. */
                data: Record<string, any>;
                /** Optional instance title overriding the registered definition title. */
                title?: string;
                /** Render without a separate title bar; labels are supplied by the body. */
                compact?: boolean;
            }

            /** A directed connection from an output port to an input port. */
            interface GraphLink {
                /** Stable link ID used by selection, deletion, and debug highlighting. */
                id: string;
                /** Source output-port reference. */
                from: { node: string; port: string };
                /** Target input-port reference. */
                to: { node: string; port: string };
                /** Host-owned serializable payload; the editor does not interpret it. */
                data?: Record<string, any>;
            }

            /** A resizable text annotation stored with the graph. */
            interface GraphComment {
                /** Stable comment ID. */
                id: string;
                /** Left position in graph coordinates. */
                x: number;
                /** Top position in graph coordinates. */
                y: number;
                /** Width in graph units. */
                w: number;
                /** Height in graph units. */
                h: number;
                /** Displayed comment text. */
                text: string;
                /** Optional CSS color. */
                color?: string;
                /** Host-owned serializable payload. */
                data?: Record<string, any>;
            }

            /** Persisted canvas viewport transform. */
            interface GraphViewport {
                /** Horizontal pan in client pixels. */
                x: number;
                /** Vertical pan in client pixels. */
                y: number;
                /** Zoom multiplier. A value of 1 means 100%. */
                zoom: number;
            }

            /** The full serializable state of one graph. */
            interface GraphData {
                /** Mutable node records owned by the graph store. */
                nodes: GraphNode[];
                /** Mutable directed links owned by the graph store. */
                links: GraphLink[];
                /** Mutable canvas annotations owned by the graph store. */
                comments: GraphComment[];
                /** Persisted pan and zoom. */
                viewport: GraphViewport;
            }

            /** Node-and-port reference used by connection commands. */
            interface PortRef {
                /** Node ID. */
                node: string;
                /** Port ID within the node. */
                port: string;
            }

            // --- port types & connection rule ---
            interface PortTypeInfo {
                /** Stable type key stored in `GraphPort.dataType`. */
                key: string;
                /** CSS color used for ports and links of this type. */
                color: string;
                /** Optional user-facing name. */
                label?: string;
            }
            /** Read-only lookup used by graph rendering and connection validation. */
            interface IPortTypeRegistry {
                /** Return the registered type, or undefined when the key is unknown. */
                get(key: string): PortTypeInfo | undefined;
                /** Return the registered color or the registry fallback color. */
                color(key: string): string;
            }
            /** Fully resolved endpoints supplied to a connection validator. */
            interface ConnectionContext {
                /** Source node. */
                fromNode: GraphNode;
                /** Source output port. */
                fromPort: GraphPort;
                /** Target node. */
                toNode: GraphNode;
                /** Target input port. */
                toPort: GraphPort;
            }
            /** Return true to accept a proposed link. */
            type CanConnect = (ctx: ConnectionContext) => boolean;

            // --- node definitions & registry ---
            interface NodeDefinition {
                /** Stable registry key written to `GraphNode.typeId`. */
                typeId: string;
                /** Default user-facing node title. */
                title: string;
                /** Slash-separated, stable menu grouping path. */
                menuPath?: string;
                /** Localized display path; menu identity and grouping use menuPath. */
                displayMenuPath?: string;
                /** Additional case-insensitive add-menu search terms. */
                keywords?: string[];
                /** Description shown by hosts that provide node help. */
                description?: string;
                /** Optional CSS color for the node header. */
                headerColor?: string;
                /** Key into `GraphEditorProps.bodyRenderers`. */
                bodyRenderer?: string;
                /** Create a complete new node at the supplied graph position. */
                create(position: XY): GraphNode;
            }
            /** Flattened entry returned by node-registry add menus. */
            interface NodeMenuItem {
                /** Node definition key created by this entry. */
                typeId: string;
                /** User-facing entry label. */
                label: string;
                /** Stable slash-separated grouping path. */
                path: string;
                /** Localized path used only for display and search. */
                displayPath?: string;
                keywords?: string[];
                /** Optional native-menu choices shown after this entry is clicked. */
                choices?: Array<{ typeId: string; label: string }>;
            }
            interface ConnectionMenuContext {
                /** Node whose loose connection handle opened the menu. */
                node: GraphNode;
                /** Port whose loose connection handle opened the menu. */
                port: GraphPort;
                /** React Flow handle side involved in the connection gesture. */
                handleType: "source" | "target";
            }
            /** Add-node menu result customized for a pending connection. */
            interface ConnectionNodeMenu {
                /** Entries compatible with the pending connection. */
                items: NodeMenuItem[];
                /** Optional menu folder to reveal initially. */
                focusPath?: string;
            }
            /** Read-only registry used to create nodes and populate add-node menus. */
            interface INodeRegistry {
                /** Return a definition, or undefined when `typeId` is unknown. */
                getDefinition(typeId: string): NodeDefinition | undefined;
                /** Return all registered definitions in registry order. */
                list(): NodeDefinition[];
                /** Build flattened entries for the normal add-node menu. */
                menuItems(): NodeMenuItem[];
                /** Folder revealed when the regular canvas add-node menu opens. */
                defaultMenuFocusPath?(): string | undefined;
                menuItemsForConnection?(ctx: ConnectionMenuContext): ConnectionNodeMenu | undefined;
                /** Create a node, or undefined when `typeId` is unknown. */
                createNode(typeId: string, position: XY): GraphNode | undefined;
            }

            /** Bridges an editor's save format to/from {@link GraphData}. */
            interface IGraphAdapter<TSave = any> {
                /** Decode the host save format into normalized graph data. */
                toGraphData(save: TSave): GraphData;
                /** Encode normalized graph data into the host save format. */
                fromGraphData(data: GraphData): TSave;
            }

            /** Reactive single-source-of-truth store with undo/redo. */
            interface GraphStore {
                /** Current mutable graph document. Mutate it through `commands` or `silent`. */
                readonly data: GraphData;
                /** Monotonically changing snapshot token for React subscriptions. */
                readonly version: number;
                /** Whether an undo entry is available. */
                readonly canUndo: boolean;
                /** Whether a redo entry is available. */
                readonly canRedo: boolean;
                /** True while subscribers are handling a pan/zoom-only notification. */
                readonly transientViewportChange: boolean;
                /** Replace the document and clear transient state. */
                setData(raw: GraphData): void;
                /** Update pan/zoom as a transient change that is not added to undo history. */
                setViewport(viewport: GraphViewport): void;
                /** Subscribe to changes; the returned function removes the subscription. */
                subscribe(cb: () => void): () => void;
                /** Return the current snapshot token for `useSyncExternalStore`. */
                getSnapshot(): number;
                /** Apply the most recent undo entry. */
                undo(): void;
                /** Apply the most recent redo entry. */
                redo(): void;
                /** Run mutations without recording undo; notify subscribers unless `notify` is false. */
                silent(fn: () => void, notify?: boolean): void;
                /** Remove subscriptions and detach the optional version tracker. */
                dispose(): void;
            }

            interface NodeBodyProps {
                /** Node currently being rendered. */
                node: GraphNode;
                /** Owning store used to apply edits. */
                store: GraphStore;
                /** Port-type lookup used by custom controls. */
                portTypes: IPortTypeRegistry;
                /** Test whether the supplied port currently has at least one link. */
                isConnected: (port: GraphPort | string, kind?: GraphPort["kind"]) => boolean;
            }
            /** React renderer for a registered node body. */
            type NodeBodyRenderer = (props: NodeBodyProps) => React.ReactNode;

            interface PortInputContext {
                /** Node containing the unconnected input. */
                node: GraphNode;
                /** Unconnected input port being rendered. */
                port: GraphPort;
                /** Owning store used to apply literal changes. */
                store: GraphStore;
                /** Notify the host after this inline editor changes the port's literal value. */
                onValueChange?: () => void;
            }
            /** Override an unconnected input's inline control; undefined = built-in. */
            type PortInputRenderer = (ctx: PortInputContext) => React.ReactNode | undefined;

            /** A drag-and-drop drop onto the canvas, with flow-space position resolved. */
            interface CanvasDropInfo {
                /** Browser client X coordinate of the drop. */
                clientX: number;
                /** Browser client Y coordinate of the drop. */
                clientY: number;
                /** Drop position converted to graph coordinates. */
                flow: { x: number; y: number };
                /** Native drag payload. Read it synchronously during the callback. */
                dataTransfer: DataTransfer;
            }

            /** Imperative handle exposed via {@link GraphEditorProps.controllerRef}. */
            interface GraphEditorApi {
                /** Center the viewport on a node and select it. */
                focusNode(nodeId: string): void;
            }

            /** A context-menu entry an editor can append to the node right-click menu. */
            interface GraphMenuItem {
                /** Stable menu item ID. */
                id?: string;
                /** User-facing label; omitted for separators. */
                label?: string;
                /** Menu item kind. Defaults to `normal`. */
                type?: "normal" | "separator";
                /** Whether the item can be activated. Defaults to true. */
                enabled?: boolean;
                /** Called when the item is selected. */
                click?: () => void;
            }

            interface GraphEditorProps {
                /** Document store. Dispose it when the owning panel is destroyed. */
                store: GraphStore;
                /** Node definitions and add-menu entries. */
                registry: INodeRegistry;
                /** Port colors and labels. */
                portTypes: IPortTypeRegistry;
                /** Connection validator. Defaults to `defaultCanConnect`. */
                canConnect?: CanConnect;
                /** Called after a link is added or removed. */
                onConnectionChange?: (store: GraphStore, link: GraphLink, connected: boolean) => void;
                /** Custom node-body renderers keyed by `NodeDefinition.bodyRenderer`. */
                bodyRenderers?: Record<string, NodeBodyRenderer>;
                /** Override the editor for unconnected input literals. */
                renderPortInput?: PortInputRenderer;
                /** Notify the host after an unconnected input's literal/null state changes. */
                onInputValueChange?: (store: GraphStore, node: GraphNode, port: GraphPort) => void;
                /** Feature-owned accessible label for the nullable-input action. */
                inputNullLabel?: (isNull: boolean) => string;
                /** Handle an external drag-drop onto the canvas (e.g. blackboard items). */
                onCanvasDrop?: (info: CanvasDropInfo) => void;
                /** Open AddNodeMenu directly when right-clicking empty canvas. */
                directAddNodeMenuOnCanvasContextMenu?: boolean;
                /** Receives an imperative handle (focus a node, …) once mounted. */
                controllerRef?: React.RefObject<GraphEditorApi | null>;
                /** Show the minimap overview. Defaults to false. */
                showMiniMap?: boolean;
                /** Minimum viewport zoom multiplier. */
                minZoom?: number;
                /** Maximum viewport zoom multiplier. */
                maxZoom?: number;
                /** Additional CSS class for the editor root. */
                className?: string;
                /** Node ids carrying a debugger breakpoint (renders an indicator). */
                breakpointNodeIds?: ReadonlySet<string>;
                /** Link ids that should play the debug flow animation. */
                flowingEdgeIds?: ReadonlySet<string>;
                /** Extra items appended to a node's right-click menu (e.g. breakpoint toggle). */
                nodeMenuItems?: (nodeId: string, selectedIds: string[]) => GraphMenuItem[];
                /** Node ids selected when this editor instance mounts. */
                initialSelectedNodeIds?: ReadonlySet<string> | readonly string[];
                /** Notifies the host whenever the selected graph-node ids change. */
                onNodeSelectionChange?: (selectedIds: string[]) => void;
                /** Handle DOM Ctrl/Cmd+Z/Y inside the graph. Defaults to true. */
                historyHotkeys?: boolean;
            }

            /** Generic reactive + undoable document store (base of GraphStore). */
            interface DocStore<T extends object> {
                /** Current mutable document. */
                readonly data: T;
                /** Monotonically changing snapshot token. */
                readonly version: number;
                /** Whether an undo entry is available. */
                readonly canUndo: boolean;
                /** Whether a redo entry is available. */
                readonly canRedo: boolean;
                /** Replace the document and notify subscribers. */
                setData(raw: T): void;
                /** Subscribe to changes; the returned function removes the subscription. */
                subscribe(cb: () => void): () => void;
                /** Return the current snapshot token for `useSyncExternalStore`. */
                getSnapshot(): number;
                /** Apply the most recent undo entry. */
                undo(): void;
                /** Apply the most recent redo entry. */
                redo(): void;
                /** Clear all undo and redo entries. */
                resetHistory(): void;
                /** Run mutations without recording undo; notify subscribers unless `notify` is false. */
                silent(fn: () => void, notify?: boolean): void;
                /** Remove subscriptions and detach the optional version tracker. */
                dispose(): void;
            }

            /** Serializable clipboard payload created by `commands.copyNodes`. */
            interface ClipboardData {
                /** Copied nodes. */
                nodes: GraphNode[];
                /** Links whose two endpoints are both copied. */
                links: GraphLink[];
                /** Copied comments. */
                comments: GraphComment[];
            }

            // --- constructible classes (runtime values) ---
            interface GraphStoreConstructor {
                /** Create a graph store; the store owns a normalized clone of `initial`. */
                new(initial?: GraphData, versionTracker?: IVersionTracker): GraphStore;
            }
            /** Mutable registry used while configuring an editor. */
            interface MutableNodeRegistry extends INodeRegistry {
                /** Add or replace a definition by `typeId`. */
                add(def: NodeDefinition): void;
            }
            /** Constructor for a mutable node registry. */
            interface NodeRegistryConstructor {
                new(defs?: NodeDefinition[]): MutableNodeRegistry;
            }
            /** Constructor for a port-type registry. */
            interface PortTypeRegistryConstructor {
                new(types?: PortTypeInfo[], fallbackColor?: string): IPortTypeRegistry;
            }

            // --- the React component & factory values ---
            /** React component for editing a graph backed by `GraphStore`. */
            const GraphEditor: (props: GraphEditorProps) => React.ReactElement;
            /** Built-in node body renderer used by {@link GraphEditor}. */
            const DefaultNodeBody: (props: NodeBodyProps) => React.ReactElement;
            /** Constructible graph-store runtime value. */
            const GraphStore: GraphStoreConstructor;
            /** Constructible node-registry runtime value. */
            const NodeRegistry: NodeRegistryConstructor;
            /** Constructible port-type-registry runtime value. */
            const PortTypeRegistry: PortTypeRegistryConstructor;
            /** Create a normalized reactive graph store. */
            const createGraphStore: (initial?: GraphData, versionTracker?: IVersionTracker) => GraphStore;
            /** Default validator: output to input, compatible data types, and no duplicate link. */
            const defaultCanConnect: CanConnect;
            /** Return the default multiple-link policy for a port. */
            const defaultPortMulti: (port: GraphPort) => boolean;
            /** Fill missing viewport fields and clamp zoom to the supplied bounds. */
            const normalizeGraphViewport: (
                viewport: Partial<GraphViewport> | null | undefined,
                minZoom?: number,
                maxZoom?: number,
            ) => GraphViewport;
            /** Create empty graph data with a default viewport. */
            const emptyGraph: () => GraphData;
            /** Generate a process-local unique graph ID with an optional prefix. */
            const nextId: (prefix?: string) => string;
            /** Find a node by ID, or undefined when it is absent. */
            const findNode: (data: GraphData, id: string) => GraphNode | undefined;
            /** Return every link connected to the specified node port. */
            const linksOfPort: (data: GraphData, nodeId: string, portId: string) => GraphLink[];
            /** Bundled component CSS. GraphEditor registers it automatically. */
            const styles: string;

            /** Create a generic reactive, undoable document store. */
            const createDocStore: <T extends object>(initial: T, versionTracker?: IVersionTracker) => DocStore<T>;

            /** Mutation helpers operating on a {@link GraphStore}. */
            namespace commands {
                /** Add a node and return its ID. The node is recorded as one undoable change. */
                function addNode(store: GraphStore, node: GraphNode): string;
                /** Remove nodes, their connected links, and their selection state. */
                function removeNodes(store: GraphStore, ids: string[]): void;
                /** Remove a link by ID. Unknown IDs are ignored. */
                function removeLink(store: GraphStore, linkId: string): void;
                /** Validate and add a link; return its new ID, or null when rejected. */
                function connect(store: GraphStore, from: PortRef, to: PortRef): string | null;
                /** Remove every link connected to a node port. */
                function disconnectPort(store: GraphStore, ref: PortRef): void;
                /** Move multiple nodes by a graph-coordinate delta as one change. */
                function moveNodes(store: GraphStore, ids: string[], dx: number, dy: number): void;
                /** Set one node's absolute graph position. */
                function setNodePosition(store: GraphStore, id: string, x: number, y: number): void;
                /** Set the viewport without creating an undo entry. */
                function setViewport(store: GraphStore, viewport: GraphViewport): void;
                /** Set one key in a node's host-owned `data` record. */
                function setNodeData(store: GraphStore, id: string, key: string, value: any): void;
                /** Set the literal value stored for an unconnected input port. */
                function setInputValue(store: GraphStore, nodeId: string, portId: string, value: any): void;
                /** Toggle the explicit-null state of an unconnected input port. */
                function setInputNull(store: GraphStore, nodeId: string, portId: string, isNull: boolean): void;
                /** Add a canvas comment and return its ID. */
                function addComment(store: GraphStore, comment: GraphComment): string;
                /** Partially update a canvas comment. */
                function updateComment(store: GraphStore, id: string, patch: Partial<GraphComment>): void;
                /** Remove a canvas comment by ID. */
                function removeComment(store: GraphStore, id: string): void;
                /** Copy nodes and only the links whose endpoints are both copied. */
                function copyNodes(store: GraphStore, ids: string[]): ClipboardData;
                /** Paste clipboard data at an optional graph-coordinate offset and return new node IDs. */
                function paste(store: GraphStore, clip: ClipboardData, offset?: XY): string[];
            }
        }

        /**
         * File tab information
         */
        export interface IFileTabInfo {
            /**
             * Tab id. It is internal used.
             */
            id: string;

            /**
             * The id of the asset associated with this tab.
             */
            assetId: string;

            /**
             * The type of the asset associated with this tab.
             */
            fileType: AssetType;

            /**
             * The modified flag of the asset associated with this tab.
             */
            isModified: boolean;

            /**
             * Last active time.
             */
            activeTime?: number;

            /**
             * Closable flag. If it is true, the tab can not be closed.
             */
            noClose?: boolean;

            /**
             * Display title for non-asset tabs.
             */
            title?: string;

            /**
             * Display path/tooltip for non-asset tabs.
             */
            path?: string;

            /**
             * Display icon for non-asset tabs.
             */
            icon?: string;
        }

        export interface IFileTabBarOptions {
            /**
             * Whether tabs represent real project assets. Default is true.
             */
            realAsset?: boolean;
        }

        /** Visual density used by the shared file tab bar component. */
        export type FileTabBarViewVariant = "heavy" | "light" | "weak";

        /**
         * File tab bar interface
         */
        export interface IFileTabBar {
            /** Release the native context menu and all retained callbacks. */
            dispose(): void;

            /**
             * Called when a tab is selected.
             * @param tab The selected tab.
             */
            onTabSelected: (tab: IFileTabInfo) => void;

            /**
             * Called before tabs are closed.
             * @param tabs Tabs to close.
             * @param needSave Whether the modified tabs should be saved before closing.
             */
            onTabWillClose: (tabs: IFileTabInfo[], needSave: boolean) => Promise<void>;

            /**
             * Called when tabs need to be saved without closing.
             * @param tabs Tabs to save.
             */
            onTabSave: (tabs: IFileTabInfo[]) => Promise<void>;

            /**
             * Add a tab.
             * @param tabInfo Information of the tab.
             * @param insertIndex The index to insert the tab. 
             * @param activate If true, the tab will be activated. Default is true. 
             */
            addTab(tabInfo: IFileTabInfo, insertIndex?: number, activate?: boolean): void;

            /**
             * Remove a tab.
             * @param tabId The id of the tab to remove.
             */
            removeTab(tabId: string): void;

            /**
             * Get a tab by id.
             * @param tabId The id of the tab.
             * @returns The tab. 
             */
            getTab(tabId: string): IFileTabInfo;

            /**
             * Get a tab by index.
             * @param index The index of the tab.
             * @returns The tab. 
             */
            getTabAt(index: number): IFileTabInfo;

            /**
             * Find a tab by predicate.
             * @param predicate The predicate function. Return true if the tab is found.
             * @returns The tab. 
             */
            findTab(predicate: (tab: IFileTabInfo) => boolean): IFileTabInfo;

            /**
             * Get all tabs.
             * @returns All tabs.
             */
            getTabs(): Array<IFileTabInfo>;

            /**
             * Count of tabs.
             */
            readonly tabCount: number;

            /**
             * Selected tab.
             */
            selectedTab: IFileTabInfo;

            /**
             * Index of the selected tab.
             */
            selectedIndex: number;

            /**
             * Allow to show a context menu. Default is true.
             */
            enableMenu: boolean;

            /**
             * Refresh the display information of a tab.
             * @param tabId The id of the tab to update.
             */
            updateUI(tabId: string): void;

            /**
             * Move a tab to a new display index.
             * @param tabId The id of the tab to move.
             * @param insertIndex The target insertion index.
             */
            moveTab(tabId: string, insertIndex: number): void;

            /**
             * Query to close all tabs.
             * @param includeScene Allow to include scene tabs. Default is false.
             * @returns A promise that resolves with a boolean indicating whether the tabs are allowed to be closed.
             */
            queryToCloseAllTabs(includeScene?: boolean): Promise<boolean>;

            /**
             * Query to save all tabs.
             * @returns A promise that resolves with a boolean indicating whether the tabs are allowed to be saved.
             */
            queryToSaveAllTabs(): Promise<boolean>;
        }

        /**
         * Props for the shared React file tab bar view.
         */
        export interface IFileTabBarViewProps {
            /**
             * File tab bar model created by `IEditor.React.FileTabBar`.
             */
            tabBar: IFileTabBar;

            /**
             * Visual density of the tab bar. Default is heavy.
             */
            variant?: FileTabBarViewVariant;

            /**
             * Whether to show the save and save-all tool buttons. Default is false.
             */
            showSaveButtons?: boolean;
        }

        /**
         * File actions
         */
        export type IFileActions = {
            /**
             * Called when a file is double-clicked in the asset library or when Editor.openFile() is called.
             * @param asset The asset object being operated on.
             */
            onOpen?: (asset: IAssetInfo) => Promise<void>;

            /**
             * Called by `Editor.scene.createNodeByAsset()` when an asset is dragged into the hierarchy or scene, or when a plugin requests node creation.
             * 
             * If the asset can create a node object, it returns a node object; otherwise, it returns null, indicating that creating a node is not supported.
             * 
             * In the implementation, you can use the Editor.scene.createNode() method to create a node object.
             * 
             * @param asset The asset object being operated on.
             * @param props The properties of the new node.
             * @param parentNode The parent node. 
             * @param options The options for creating the node. 
             * @returns A new node object, null if creating a node is not supported. 
             */
            onCreateNode?: (asset: IAssetInfo, props: any, parentNode?: IMyNode, options?: ICreateNodeOptions) => Promise<IMyNode | null>;

            /**
             * Called when an asset is dragged into the scene.
             * @param asset The asset object being operated on.
             * @param is3D Indicates whether the target scene is in 3D mode or 2D mode. True means 3D mode, false means 2D mode.
             * @param pt The position where the asset is dropped. It is a screen coordinate.
             * @param selectedNode The top-level node in the scene, usually the root node. However, in 2D mode, it might be inside a Box or Panel, so the top-level node would be the Box or Panel.
             * @returns If it returns true, it means the drag-and-drop operation was successfully handled; otherwise, it will continue to try calling the onCreateNode method to create a node.
             */
            onDropToScene?: (asset: IAssetInfo, is3D: boolean, pt: gui.Vec2, selectedNode?: IMyNode) => Promise<boolean>;

            /**
             * Called when an asset is dropped onto a node in the hierarchy panel. Usually, this is used to add a component or set a property to the node.
             * @param asset The asset object being operated on.
             * @param node The drop target node. 
             */
            onDropToNode?: (asset: IAssetInfo, node: IMyNode) => Promise<void>;

            /**
             * Called during the double-click operation of the AssetField in the inspector panel, generally used to create a new file, and then assign the file url to the property field.
             * @param field The property field object being operated on. 
             */
            onCreateInField?: (field: IPropertyField) => Promise<void>;

            /**
             * Called by `Editor.scene.createNodeByAsset()` for a GUI prefab when an asset is dragged into the hierarchy or scene, or when a plugin requests node creation.
             * 
             * The difference between this method and onCreateNode is that this method is called when the scene is a GUI prefab.
             * 
             * If the asset can create a node object, it returns a node object; otherwise, it returns null, indicating that creating a node is not supported.
             * 
             * In the implementation, you can use the Editor.scene.createNode() method to create a node object.
             * 
             * @param asset The asset object being operated on.
             * @param props The properties of the new node.
             * @param parentNode The parent node. 
             * @param options The options for creating the node. 
             * @returns A new node object, null if creating a node is not supported. 
             */
            onCreateNode_GUI?: (asset: IAssetInfo, props: any, parentNode?: IMyNode, options?: ICreateNodeOptions) => Promise<IMyNode | null>;

            /**
             * Called when an asset is dragged into the scene.
             * 
             * The difference between this method and onDropToScene is that this method is called when the scene is a GUI prefab.
             * 
             * @param asset The asset object being operated on.
             * @param pt The position where the asset is dropped. It is a screen coordinate.
             * @param selectedNode The top-level node in the scene, usually the root node. However, in 2D mode, it might be inside a Box or Panel, so the top-level node would be the Box or Panel.
             * @returns If it returns true, it means the drag-and-drop operation was successfully handled; otherwise, it will continue to try calling the onCreateNode method to create a node.
             */
            onDropToScene_GUI?: (asset: IAssetInfo, pt: gui.Vec2, selectedNode?: IMyNode) => Promise<boolean>;

            /**
             * Called when an asset is dropped onto a node in the hierarchy panel. Usually, this is used to add a component or set a property to the node.
             * 
             * The difference between this method and onDropToNode is that this method is called when the scene is a GUI prefab.
             * 
             * @param asset The asset object being operated on.
             * @param node The drop target node. 
             */
            onDropToNode_GUI?: (asset: IAssetInfo, node: IMyNode) => Promise<void>;

            /**
             * Called during the double-click operation of the AssetField in the inspector panel, generally used to create a new file, and then assign the file url to the property field.
             * 
             * The difference between this method and onCreateInField is that this method is called when the scene is a GUI prefab.
             * 
             * @param field The property field object being operated on. 
             */
            onCreateInField_GUI?: (field: IPropertyField) => Promise<void>;
        }

        /**
         * Extension manager interface
         */
        export interface IExtensionManager {
            /**
             * Whether the extension manager is reloading
             */
            readonly reloading: boolean;

            /**
             * Issue a reload request
             * @param forced Whether to force reload, even if no changes are detected 
             */
            reload(forced?: boolean): void;
            /**
             * Create a new settings. It usually corresponds to a configuration file and may be saved to different locations depending on the value of location.
             * 
             * In different processes, developers can access the configuration data through Editor.getSettings. If you want to modify the configuration data, it is generally done in the UI process. The data will be automatically saved to the file after modification.
             * 
             * Each configuration has a corresponding data type, which can be manually written and registered through typeRegistry, or it can be a class decorated with ＠IEditor.regClass.
             * 
             * This method is only allowed to be called in ＠IEditor.onLoad.
             * 
             * @param name The name of the configuration. It should be unique within the editor and use characters that conform to file name specifications. The file name of the configuration file will automatically be prefixed with "plugin-" to help users understand that this is a configuration file created by a plugin.
             * @param location The location of the configuration file. The default is "project".
             * - application: Saved to the user data directory of the application. On Windows, it is generally C:\Users\{user}\AppData\Local\{appname}, and on Mac, it is generally ~/Library/Application Support/{appname}. This means that this configuration needs to be shared across different projects.
             * - project: Saved to the `settings` directory of the project. This means that this configuration is specific to the current project.
             * - local: Saved to the `local` directory of the project. This means that this configuration is specific to the current project but does not need to be tracked by the version control system.
             * - memory: Maintained only in memory and not saved to a file.
             * @param type The data type corresponding to the configuration. If it is a string, it means that this type has been registered through typeRegistry. If it is FTypeDescriptor, it will be automatically registered when created. If it is a Function, it means that this is a class decorated with ＠IEditor.regClass.
             */
            createSettings(name: string, location?: SettingsLocation, type?: string | FTypeDescriptor | Function): void;

            /**
             * Create a new settings. It usually corresponds to a configuration file and may be saved to different locations depending on the value of location.
             * 
             * In different processes, developers can access the configuration data through Editor.getSettings. If you want to modify the configuration data, it is generally done in the UI process. The data will be automatically saved to the file after modification.
             * 
             * Each configuration has a corresponding data type, which can be manually written and registered through typeRegistry, or it can be a class decorated with @IEditor.regClass.
             * 
             * This method is only allowed to be called in ＠IEditor.onLoad.
             * 
             * @param name The name of the configuration. It should be unique within the editor and use characters that conform to file name specifications. The file name of the configuration file will automatically be prefixed with "plugin-" to help users understand that this is a configuration file created by a plugin.
             * @param pathToAsset The path to the configuration file. It is a relative path to the assets directory.
             * @param type The data type corresponding to the configuration. If it is a string, it means that this type has been registered through typeRegistry. If it is FTypeDescriptor, it will be automatically registered when created. If it is a Function, it means that this is a class decorated with ＠IEditor.regClass.
             */
            createSettings(name: string, pathToAsset: string, type?: string | FTypeDescriptor | Function): void;

            /**
             * Create a new settings. It usually corresponds to a configuration file and may be saved to different locations depending on the value of location.
             * 
             * In different processes, developers can access the configuration data through Editor.getSettings. If you want to modify the configuration data, it is generally done in the UI process. The data will be automatically saved to the file after modification.
             * 
             * Each configuration has a corresponding data type, which can be manually written and registered through typeRegistry, or it can be a class decorated with @IEditor.regClass.
             * 
             * This method is only allowed to be called in ＠IEditor.onLoad.
             * 
             * @param name The name of the configuration. It should be unique within the editor and use characters that conform to file name specifications. The file name of the configuration file will automatically be prefixed with "plugin-" to help users understand that this is a configuration file created by a plugin.
             * @param options Options for creating settings.
             */
            createSettings(name: string, options?: ICreateSettingsOptions): void;

            /**
             * Create a custom build target.
             * 
             * This method is only allowed to be called in ＠IEditor.onLoad.
             * 
             * @param name Build target name, it should be unique within the editor. 
             * @param options Build target info.
             */
            createBuildTarget(name: string, options: IBuildTargetInfo): void;

            /**
             * Set the file type of the specified file extension. The file type is used for resource filtering, such as only allowing the selection of specified types of resources in the resource input box.
             * 
             * This method is only allowed to be called in @IEditor.onLoad.
             * 
             * @param fileExtensions File extensions, such as ["png", "jpg"].
             * @param type Asset type, such as AssetType.Image or a custom string. If it is a custom string, it should be unique within the editor. 
             */
            setFileType(fileExtensions: ReadonlyArray<string>, type: AssetType | string): void;

            /**
             * Set the file icon of the specified file extension. Images are generally placed in the editorResources directory or its subdirectories, and then referenced using a path starting from editorResources, such as "editorResources/my-plugin/icon.png".
             * 
             * This method is only allowed to be called in ＠IEditor.onLoad.
             * 
             * @param fileExtensions File extensions, such as ["png", "jpg"].
             * @param icon Icon path. 
             */
            setFileIcon(fileExtensions: ReadonlyArray<string>, icon?: string): void;

            /**
             * Set the file thumbnail of the specified file extension. The thumbnail is used to display the preview of the file in the file list.
             * 
             * You need to use a script running in the scene process to help generate thumbnails. Refer to the example below.
             * 
             * This method is only allowed to be called in ＠IEditor.onLoad.
             * 
             * @param fileExtensions File extensions, such as ["png", "jpg"]. 
             * @param sceneScriptName The name of the class that generates the thumbnail. 
             * @param fast If it is true, the original icon will not be displayed, and the thumbnail will be displayed after it is generated. Which means there will be a blank area before the thumbnail is generated.
             * If it is false, the original icon will be displayed first, and the thumbnail will be displayed after it is generated. Default is false.
             * @see IEditorEnv.AssetThumbnail
             * @example
             * ```
             * class AssetHelper {
             *     ＠IEditor.onLoad
             *     onLoad() {
             *         Editor.extensionManager.setFileThumbnail(["abc"], "DemoThumbnailPlugin");
             *     }
             * }
             * ```
             */
            setFileThumbnail(fileExtensions: ReadonlyArray<string>, sceneScriptName: string, fast?: boolean): void;

            /**
             * Add file actions for the specified asset type or file extensions.
             * 
             * This method is only allowed to be called in ＠IEditor.onLoad.
             * 
             * @param assetTypeOrFileExts Asset type or file extensions, such as [AssetType.Image] or ["png", "jpg"].
             * @param actions File actions.
             */
            addFileActions(assetTypeOrFileExts: ReadonlyArray<AssetType | string>, actions: IFileActions): void;

            /**
             * Register a new menu item.
             * 
             * This method is only allowed to be called in ＠IEditor.onLoad.
             * 
             * @param name menu item name of path. Paths are separated by "/", "App/tool/test" represents the test item under the tool submenu of the App menu. 
             * 
             * Note that the path here uses IDs, not the text displayed in the menu. All menu names and their submenus supported by the editor can be printed out for reference using the menu Developer > Print All Menu IDs.
             * 
             * i18n is supported in the menu name, and the format is `i18n:xxx`, where `xxx` is the key of the i18n string.
             * e.g. `App/tool/i18n:module:test`.
             * Note that a string with or without `i18n:` prefix is treated as the same menu item name.
             * e.g. `App/tool/i18n:module:group/a` and `App/tool/group/a` will be in the same submenu.
             * @param callback The callback function for the menu item. It will be called when the menu item is clicked. Can be omitted if the menu has a default handler.
             * @param options The options for the menu.
             * @see IEditor.menu
             */
            addMenuItem(name: string, callback?: IMenuItem['click'], options?: ICustomMenuItemOptions): void;

            /**
             * Register a hotkey. When the user presses the corresponding key combination, the callback function will be called.
             * 
             * This method is only allowed to be called in ＠IEditor.onLoad.
             * 
             * @param combo The key combination, such as "ctrl+s".
             * @param callback The callback function. It will be called when the user presses the corresponding key combination.
             * @see IEditor.hotkey
             */
            registerHotkey(combo: string, callback: Function): void;

            /**
             * Find a function by name. The name is in the form of "className.staticMethodName".
             * A className must be registered with ＠IEditorEnv.regClass.
             * @param name objectName.methodName
             * @returns The function found. Null if not found.
             */
            findFunction(name: string): Function | null;
        }

        /**
         * Interface for event tracking
         */
        export interface IEventTracking {
            /**
             * Start the tracking.
             */
            start(): void;

            /**
             * Login with the id.
             * @param id 
             */
            login(id: string): void;

            /**
             * Logout.
             */
            logout(): void;

            /**
             * Set public event properties
             * @param data 
             */
            setSuperProperties(data: any): void;

            /**
             * Upload custom event
             * @param key 
             * @param data 
             */
            track(key: string, data: any): void;

            /**
             * Set user properties
             * @param data 
             */
            userSet(data: any): void;
        }
        export interface IEditorSingleton {
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
             * The version of the application.
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
             * Whether the app is in the foreground.
             */
            readonly isForeground: boolean;

            /**
             * Whether current window is in the foreground.
             */
            readonly isSelfForeground: boolean;

            /**
             * In LayaAirIDE, each module is assigned a specific ID,
             * such as the scene editor is sceneEditor, the blueprint editor is blueprintEditor, and the shader blueprint editor is shaderEditor.
             */
            readonly moduleName: string;

            /**
             * LayaAirIDE has a built-in HTTP server for previewing. This is the server address.
             * 
             * Typically, it is http://ipaddress:18090, and if HTTPS is enabled, it is https://ipaddress:18091.
             * 
             * The ipaddress is the local machine's IP address. 18090/18091 are the default ports, which can be modified in "Project Settings -> Edit".
             */
            readonly serverURL: string;

            /**
             * Whether the app is in the cli mode. A cli mode is a mode that runs the app in the command line.
             */
            readonly cliMode: IRendererInfo['cliMode'];

            /**
             * The type registry of the editor.
             */
            readonly typeRegistry: ITypeRegistry;

            /**
             * The electron ipc service.
             */
            readonly ipc: IIpc;

            /**
             * The asset database of the editor.
             * 
             * The asset database is used to manage the assets in the project. You can query, create, update, and delete assets through the asset database.
             */
            readonly assetDb: IAssetDb;

            /**
             * The shader database of the editor.
             */
            readonly shaderDb: IShaderDb;

            /**
             * The hotkey manager of the editor.
             */
            readonly hotkeyManager: IHotkeyManager;

            /**
             * The panel manager of the editor.
             */
            readonly panelManager: IPanelManager;

            /**
             * The scene manager of the editor.
             */
            readonly sceneManager: ISceneManager;

            /**
             * The resource manager of the editor.
             */
            readonly resourceManager: IResourceManager;

            /**
             * The extension manager of the editor.
             */
            readonly extensionManager: IExtensionManager;

            /**
             * The account manager of the editor.
             */
            readonly accountManager: IAccountManager;

            /**
             * The settings service of the editor.
             */
            readonly settingsService: ISettingsService;

            /**
             * The modules manager of the editor.
             */
            readonly modulesManager: IModulesManager;

            /**
             * The scene currently being edited. The editor can open multiple scenes and prefabs (the editing environment of prefabs is also considered a scene), but only one scene can be edited at a time.
             */
            readonly scene: IMyScene;

            /**
             * The app menu of the editor.
             */
            readonly appMenu: IMenu;

            /**
             * Used to save and read the current workspace configuration information.
             */
            readonly workspaceConf: ISettings;

            /**
             * This is a port object used for communication with the scene process.
             * 
             * Generally not used directly.
             */
            readonly sceneViewPort: IMyMessagePort;

            /**
             * Flag indicating whether the editor is being closed.
             */
            readonly beingQuit: boolean;

            /**
             * The shell object of the editor.
             */
            readonly shell: IShell;

            /**
             * The clipboard object of the editor.
             */
            readonly clipboard: IClipboard;

            /**
             * The title bar of the editor.
             */
            readonly titleBar: ITitleBar;

            /**
             * Create the panel manager.
             * @param options 
             * @param placeHolder 
             * @return The panel manager object.
             */
            createPanelManager(options: IPanelManagerOptions, placeHolder?: gui.Widget): IPanelManager;

            /**
             * Create the scene manager.
             * @param program 
             * @return The scene manager object.
             */
            createSceneManager(program?: string): Promise<ISceneManager>;

            /**
             * Create the hotkey manager.
             * @return The hotkey manager object.
             */
            createHotkeyManager(): IHotkeyManager;

            /**
             * Create the extension manager.
             * @return The extension manager object.
             */
            createExtensionManager(): Promise<IExtensionManager>;

            /**
             * Create the modules manager.
             * @return The modules manager object.
             */
            createModulesManager(): Promise<IModulesManager>;

            /**
             * Create the asset database.
             * @return The asset database object.
             */
            connectAssetDb(): Promise<IAssetDb>;

            /**
             * Create the shader database.
             * @return The shader database object.
             */
            connectShaderDb(): Promise<IShaderDb>;

            /**
             * Create the settings service.
             * @return The settings service object.
             */
            createSettingsService(): Promise<ISettingsService>;

            /**
             * Create the application menu.
             * @param items
             * @return The menu object.
             */
            createAppMenu(items: Array<IMenuItem>): IMenu;

            /**
             * A path to a special directory or file associated with `name`. On failure, an
             * `Error` is thrown.
             * @param name The name of the path to retrieve.
             * @return The path to the directory or file associated with `name`.
             */
            getPath(name: CommonPathName): Promise<string>;

            /**
             * Settings are editor configuration information. It can be a configuration file or an in-memory table. Settings are defined in the sceneEditor module, and other modules can read the data but generally do not modify it directly.
             * 
             * Therefore, in the sceneEditor module, Settings can be used synchronously, but in other modules, Settings can only be used asynchronously. In other words, if you need to read the latest data, you need to call the sync method first.
             * @param name The name of the settings. The default supported configuration information includes: PlayerSettings, EditorSettings, CompilerSettings, BuildSettings, SceneViewSettings, Preferences, DimensionsSettings.
             * @param autoSync If true, when the data changes in the sceneEditor module, it will automatically sync to this module. The default is false.
             * @return The settings object.
             */
            getSettings(name: string, autoSync?: boolean): ISettings;

            /**
             * Get the dialog object according to the class.
             * @param cls A class that implements the IDialog interface.
             * @return The dialog object.
             */
            getDialog<T extends IDialog>(cls: gui.Constructor<T>): Promise<T>;

            /**
             * Get the dialog object according to the class synchronously.
             * @param cls A class that implements the IDialog interface.
             * @return The initialized dialog object, or null if it has not been created yet or is still being created.
             */
            getDialogSync<T extends IDialog>(cls: gui.Constructor<T>): T | null;

            /**
             * Show a dialog.
             * @param cls A class that implements the IDialog interface.
             * @param popupOwner The owner of the dialog. The dialog will be displayed on top of the owner. If not provided, the main window is used by default.
             * Also, if the dialog's showType is `dropdown`, the dialog will be displayed according to the position of the popupOwner.
             * @param args The arguments of the dialog. The arguments are passed to the onShown method of the dialog.
             * @return The dialog object.
             */
            showDialog<T extends IDialog>(cls: gui.Constructor<T>, popupOwner?: gui.Widget | HTMLElement, ...args: any[]): Promise<T>;

            /**
             * Get the menu object by ID. Same as IEditor.Menu.getById function.
             * @param id menu ID.
             * @return The menu object.
             */
            getMenuById(id: string): IMenu;

            /**
             * Puts the editor window in a waiting state, not responding to user operations.
             * @param view An optional UI component reference used to determine the window that needs to enter the waiting state. If not provided, the main window is used by default.
             */
            showModalWait(view?: gui.Widget): void;

            /**
             * Let the editor window exit the waiting state.
             * @param view An optional UI component reference used to determine the window that needs to exit the waiting state. If not provided, the main window is used by default.
             */
            closeModalWait(view?: gui.Widget): void;

            /**
             * Show a error message as a tooltip on the specified widget.
             * @param widget The widget to show the error message. 
             * @param str The error message.
             */
            showErrorTips(widget: gui.Widget | HTMLElement, str: string): void;

            /**
             * Clear all error message tooltips.
             */
            clearErrorTips(): void;

            /**
             * Show a toast message. A toast message is a message that appears at the bottom of the window and automatically disappears after a few seconds. It is used to provide feedback to the user.
             * @param message The message to display in the toast.
             * @param type The type of the toast. It can be "info", "warning", or "error". The default is "info". 
             * @param buttons An array of buttons to display in the toast. Each button has a label, a primary flag indicating whether it is the primary button, and a callback function that is called when the button is clicked. If not provided, no buttons will be displayed.
             * @param duration The duration to show the toast, in milliseconds. If not provided, the toast will not automatically disappear.
             */
            showToast(message: string, type?: "info" | "warning" | "error", buttons?: Array<{ label: string, primary?: boolean, callback: () => boolean }>, duration?: number): void;

            /**
             * Open a file for editing. Depending on the file type, different editors will be opened. For example, opening a xx.ls file will open the scene editor, and opening a **.bp will open the blueprint editor.
             * @param filePath The file path relative to the project's assets directory. Specifically, "?.ls" can open a new unnamed scene.
             */
            openFile(filePath: string): void;

            /**
             * Close the editor immediately.
             */
            shutdown(): void;

            /**
             * Show a message box. Message boxes are used to display messages to the user and get a response.
             * @param options The options of the message box.
             * @return The result of the message box.
             */
            showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue>;

            /**
             * Resolve with an object containing the following:
             * * `canceled` boolean - whether or not the dialog was canceled.
             * * `filePaths` string[] - An array of file paths chosen by the user. If the
             * dialog is cancelled this will be an empty array.
             * @param title The title of the dialog.
             * @param extensionTypeName The name of the file type. e.g. "Scene File".
             * @param fileExtension The file extension. e.g. "ls".
             * @param defaultPath The default path to use. If not provided, the last path used will be used.
             * @return The result of the dialog.
             */
            showOpenDialog(title: string, extensionTypeName: string, fileExtension: string, defaultPath?: string): Promise<OpenDialogReturnValue>;

            /**
             * Resolve with an object containing the following:
             * * `canceled` boolean - whether or not the dialog was canceled.
             * * `filePaths` string[] - An array of file paths chosen by the user. If the
             * dialog is cancelled this will be an empty array.
             * @param options The options of the dialog.
             * @return The result of the dialog.
             */
            showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;

            /**
             * Resolve with an object containing the following:
             * * `canceled` boolean - whether or not the dialog was canceled.
             * * `filePaths` string[] - An array of file paths chosen by the user. If the
             * dialog is cancelled this will be an empty array.
             * @param title The title of the dialog.
             * @param defaultPath The default path to use. If not provided, the last path used will be used.
             * @return The result of the dialog.
             */
            showOpenFolderDialog(title: string, defaultPath?: string): Promise<OpenDialogReturnValue>;

            /**
             * Resolve with an object containing the following:
             * * `canceled` boolean - whether or not the dialog was canceled.
             * * `filePaths` string[] - An array of file paths chosen by the user. The paths are relative to the project's assets directory.
             * If the dialog is cancelled this will be an empty array.
             * @param title The title of the dialog.
             * @param defaultPath The default path to use. If not provided, the last path used will be used.
             * @return The result of the dialog.
             */
            showOpenAssetsFolderDialog(title: string, defaultPath?: string): Promise<OpenDialogReturnValue>;

            /**
             * Resolve with an object containing the following:
             * * `canceled` boolean - whether or not the dialog was canceled.
             * * `filePath` string - If the dialog is canceled, this will be an empty string.
             * @param title The title of the dialog.
             * @param extensionTypeName The name of the file type. e.g. "Scene File".
             * @param fileExtension The file extension. e.g. "ls".
             * @param defaultPath The default path to use. If not provided, the last path used will be used.
             */
            showSaveDialog(title: string, extensionTypeName: string, fileExtension: string, defaultPath?: string): Promise<SaveDialogReturnValue>;

            /**
             * Resolve with an object containing the following:
             * * `canceled` boolean - whether or not the dialog was canceled.
             * * `filePath` string - If the dialog is canceled, this will be an empty string.
             * @param options The options of the dialog.
             * @return The result of the dialog.
             */
            showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>;

            /**
             * Show a message box with the given message.
             * @param msg The message to display.
             * @param type The type of the message box. The default is "info".
             */
            alert(msg: string, type?: "none" | "info" | "error" | "question" | "warning"): Promise<void>;

            /**
             * Show a confirm message box. The user can choose to confirm or cancel.
             * @param msg The message to display.
             * @return If user confirms, return true, otherwise return false.
             */
            confirm(msg: string): Promise<boolean>;

            /**
             * Show a prompt message box. The user can input a string. If the user confirms, return the string input by the user, otherwise return null.
             * @param title The title of the message box.
             * @param text The text of the message box.
             * @param multiline If true, the input box is multiline.
             * @return The string input by the user. If the user cancels, return null.
             */
            prompt(title?: string, text?: string, multiline?: boolean): Promise<string | null>;

            /**
             * Show a loading view. It is only used during the editor startup phase.
             * @return The loading view.
             */
            showLoading(): Promise<{ label: gui.Widget, pb: gui.ProgressBar }>;

            /**
             * Activate a hotkey. After activation, this hotkey can be handled in the onHotkey or onGlobalHotkey of the EditorPanel.
             * @param combos Shortcut keys. The format of shortcut keys is "ctrl+a", "cmd+shift+z", "mod+shift+p", etc. For modifier keys you can use shift, ctrl, alt, or meta.
             * You can substitute option for alt and command for meta.
             * Other special keys are backspace, tab, enter, return, capslock, esc, escape, space, pageup, pagedown, end, home, left, up, right, down, ins, del, and plus.
             * Any other key you should be able to reference by name like a, /, $, *, or =.
             * @example
             * ```
             * Editor.enableHotkey("mod+shift+a");
             * ```
             */
            enableHotkey(...combos: string[]): void;

            /**
             * Check for updates. If there is a new version, a dialog will pop up to prompt the user to update.
             * @param manually If true, the update is triggered manually. The default is false.
             */
            checkUpdate(manually?: boolean): void;

            /**
             * Opens the devtools with specified dock state, can be `left`, `right`, `bottom`,
             * `undocked`, `detach`. Defaults to last used dock state. In `undocked` mode it's
             * possible to dock back. In `detach` mode it's not.
             * @param mode The dock state of the developer tools, can be `left`, `right`, `bottom`, `undocked`, `detach`.
             * @param view The view of the current window, It can be `scene`, `game`, or a webContents id.
             */
            openDevTools(mode?: string, view?: string): void;

            /**
             * Set the title of the editor window.
             * @param title The title of the editor window.
             */
            setWindowTitle(title: string): void;

            /**
             * Move the editor window to the top.
             */
            moveWindowTop(): void;

            /**
             * Reload the editor.
             */
            reload(): void;

            /**
             * Display a reload prompt and reload the editor if the user confirms.
             * @param msg The message to display.
             */
            queryToReload(msg?: string): Promise<void>;

            /**
             * Undo the last operation.
             */
            undo(): void;

            /**
             * Redo the last operation.
             */
            redo(): void;

            /**
             * Clear the console message of the specified group.
             * @param group The group of the console message.
             */
            clearConsoleMessage(group?: string): void;

            /**
             * Get the history documents. The history documents are the files that have been opened in the editor.
             * @param moduleName @see IEditorSingleton.moduleName
             * @return The history documents.
             */
            getHistoryDocuments(moduleName?: string): { files: Array<string>, active: number };

            /**
             * Set the history documents. The history documents are the files that have been opened in the editor.
             * @param files List of file paths.
             * @param active Specifies the index of the active file.
             */
            setHistoryDocuments(files: Array<string>, active: number): Promise<void>;

            /**
             * This is called internally by the editor to update the server URL.
             * @param useHttps If true, use HTTPS, otherwise use HTTP.
             */
            updateServerURL(useHttps: boolean): void;

            /**
             * Frame update event.
             */
            readonly onUpdate: IDelegate<() => void>;

            /**
             * Application activate event.
             */
            readonly onAppActivate: IDelegate<() => void>;

            /**
             * Console message event.
             */
            readonly onConsoleMessage: IDelegate<(message: string, level: number, group: string, line?: number, sourceId?: string) => void>;
        }

        /**
         * The editor front end interface.
         */
        export interface IEditorFrontEnd {
            /**
             * When the editor is started, this method is called to initialize the editor.
             * @param startupAction The startup action of the renderer.
             */
            onBeginPlay(startupAction: IRendererStartupAction): Promise<void>;

            /**
             * When the editor is closing, this method is called to check if the editor can be closed.
             * @return If the editor can be closed, return true, otherwise return false.
             */
            onBeforeEndPlay?(): Promise<boolean>;

            /** 
             * When the editor is closed, this method is called to clean up the editor.
            */
            onEndPlay(passive: boolean): Promise<void>;

            /**
             * When the editor is requested to open a file, this method is called to open the file.
             * @param filePath file path.
             */
            onOpenFile?(filePath: string): void;
        }

        export type EditorPanelUsage = "common" | "project-settings" | "build-settings" | "preference" | "preview";
        /**
         * Options for the panel.
         */
        export interface IPanelOptions {
            /**
             * The display title of the panel.
             * 
             * Use "i18n:&lt;key&gt;" or "i18n:&lt;file-id&gt;:&lt;key&gt;" to specify the key of the internationalization string.
             */
            title?: string;
            /**
             * The icon of the panel. Images are generally placed in the editorResources directory or its subdirectories, and then referenced using a path starting from editorResources, such as "editorResources/my-plugin/icon.png".
             */
            icon?: string;
            /**
             * When usage is set to values like project-settings/build-settings/preference, it determines the display order of the panel in a specific window.
             */
            order?: number;
            /**
             * The stretch priority of the panel width. Values can be 1/0/-1. The larger the value, the higher the priority for stretching the panel horizontally among panels at the same level.
             */
            stretchPriorityX?: number;
            /**
             * The stretch priority of the panel height. Values can be 1/0/-1. The larger the value, the higher the priority for stretching the panel vertically among panels at the same level.
             */
            stretchPriorityY?: number;
            /**
             * Whether to show the tab above the panel. Default is true. If false, the panel is always displayed independently and cannot be combined with other panels.
             */
            allowTabs?: boolean;
            /**
             * Whether the panel can be closed. Default is true.
             */
            allowClose?: boolean;
            /**
             * Whether to show the menu item to open this panel in the Panel menu. Default is true.
             */
            showInMenu?: boolean;
            /**
             * Menu items with the same menuGroup will be grouped together in the Panel menu. Default is empty.
             */
            menuGroup?: string;
            /**
             * Whether the panel can be displayed in a popup window. Default is true.
             */
            allowPopup?: boolean;
            /**
             * Whether a new popup window created for this panel stays in front of the main window. Default is true.
             * This option is only applied when creating the popup window; adding the panel to an existing popup does not change that window.
             */
            alwaysInFront?: boolean;
            /**
             * Whether to start automatically. Default is true.
             */
            autoStart?: boolean;
            /**
             * The location of the panel. Relative to locationBase (default is ScenePanel). If set to popup, a new window will pop up.
             */
            location?: "left" | "right" | "top" | "bottom" | "embed" | "popup";
            /**
             * The panel ID that the location (positioning) property refers to. Default is ScenePanel.
             */
            locationBase?: string;
            /**
             * The hotkey to open the panel. For example: mod+1 (mod is ctrl on Windows and cmd on Mac). Default is empty.
             */
            hotkey?: string;
            /**
             * Whether the panel is transparent. Default is false.
             */
            transparent?: boolean;
            /**
             * Whether to display a help button in the panel title bar, which opens a specified URL when clicked.
             */
            help?: string;
            /**
             * The usage of the panel. Default is common.
             * - common: Common panel.
             * - project-settings: Displayed in the project settings panel.
             * - build-settings: Displayed in the build settings panel.
             * - preference: Displayed in the preference panel.
             * - preview: Displayed in the preview area of the inspector panel.
             */
            usage?: EditorPanelUsage;
        }

        /**
         * Editor panel interface.
         */
        export interface IEditorPanel {
            /**
             * id of the panel.
             */
            readonly panelId: string;

            /**
             * Options for the panel.
             */
            readonly panelOptions: IPanelOptions;

            /**
             * The main display widget of the panel.
             */
            readonly contentPane: gui.Widget;

            /**
             * Complete the construction of the panel in this method. You must create the UI and assign it to the EditorPanel._panel property.
             */
            create(): Promise<void>;

            /**
             * Called when the panel is activated.
             */
            onStart?(): void;

            /**
             * Called every frame if the panel is active.
             */
            onUpdate?(): void;

            /**
             * Called when the panel is being destroyed.
             */
            onDestroy?(): void;

            /**
             * Called when selection changes in the editor, including node, asset and other types of selection.
             */
            onSelectionChanged?(): void;

            /**
             * Called when the scene is activated.
             * @param scene The activated scene.
             */
            onSceneActivate?(scene: IMyScene): void;

            /**
             * Called when the scene is deactivated.
             * @param scene The deactivated scene.
             */
            onSceneDeactivate?(scene: IMyScene): void;

            /**
             * Called before the scene is saved.
             * @param scene The scene to save.
             */
            onBeforeSaveScene?(scene: IMyScene): Promise<void> | void;

            /**
             * Called after a scene save attempt finishes, including when saving fails.
             * @param scene The scene involved in the save attempt.
             */
            onAfterSaveScene?(scene: IMyScene): Promise<void> | void;

            /**
             * Called when a hotkey is pressed if the panel gains focus.
             * @param combo The hotkey combo.
             * @returns Whether the hotkey is consumed. 
             */
            onHotkey?(combo: string): boolean;

            /**
             * Called when a hotkey is pressed globally.
             * @param combo The hotkey combo.
             * @returns Whether the hotkey is consumed. 
             */
            onGlobalHotkey?(combo: string): boolean;

            /**
             * Called when the panel gains focus and the user consecutively presses English character keys on the keyboard.
             * @param searchKey The search key. 
             */
            onSearch?(searchKey: string): void;

            /**
             * Called when the plugins is reloaded.
             * @returns 
             */
            onExtensionReload?(): void;

            /**
             * Returns the names of files that have unsaved changes in this panel.
             * The returned names are included in the save confirmation shown when the editor is closing.
             * Panels implementing this method should also implement onSave to save these files when requested.
             */
            getUnsavedFiles?(): Array<string>;

            /**
             * Called when the editor is about to be closed or the panel is about to be destroyed, allowing you to save data and release resources. If there are multiple panels with onSave, they will be called sequentially, and the editor will wait for all of them to complete before closing.
             */
            onSave?(): Promise<void>;

            /**
             * Called to write the panel's state information to Editor.workspaceConf, so that the state can be restored the next time it is reopened.
             */
            onSaveStatus?(): void;
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
        export type DialogPopupOwner = gui.Widget | HTMLElement;

        /**
         * Dialog interface. A dialog is a window that can be shown to the user.
         * @typeParam T The type of the root widget displayed by the dialog.
         */
        export interface IDialog<T extends gui.Widget = gui.Widget> {
            /**
             * The id of the dialog. It is internally used to manage the dialog.
             */
            readonly id: string;

            /**
             * The name of the dialog. It is internally used to persist the status of the dialog.
             */
            name: string;

            /**
             * Whether to save the bounds of the dialog. If true, the dialog will remember its position and size. Default is false.
             */
            saveBounds: boolean;

            /**
             * Whether the dialog is resizable. Default is true.
             */
            resizable: boolean;

            /**
             * Whether the dialog is modal. If true, the dialog will block the user from interacting with other windows. Default is false.
             * If it is not really necessary, it is not recommended to enable this option, as modal dialogs will block the entire editor's operations, including other windows.
             */
            modal: boolean;

            /**
             * Whether the dialog is closable. If false, the dialog will not have a close button. Default is true.
             */
            closable: boolean;

            /**
             * Whether the dialog has a frame. If false, the dialog will not have a frame. Default is true.
             */
            frame: boolean;

            /**
             * Whether the dialog is transparent. If true, the dialog will have a transparent background. Default is false.
             */
            transparent: boolean;

            /**
             * An option to show the dialog. Default is "none".
             * - "none": The dialog will be shown as a normal window.
             * - "popup": The dialog will be shown as a popup. The popup window will adjust its position based on the location of the popupOwner when it appears, unless the user manually moves the window. The popup window will automatically close when clicking outside the area.
             * - "dropdown": The dialog will be shown as a dropdown. Each time the dropdown window pops up, it will adjust its coordinates to be below the popupOwner, creating a dropdown effect. Clicking outside the window will automatically close it.
             */
            showType: "none" | "popup" | "dropdown";

            /**
             * Whether the dialog is always in front of the main window. Note that this does not mean the dialog is in front of all windows. If set to false, the dialog can be obscured by the main window. The default is true.
             */
            alwaysInFront: boolean;

            /**
             * Whether to use the currently focused editor window as the native owner when show() is called without a popupOwner. Default is false.
             * An explicitly supplied popupOwner takes precedence. This option only applies to non-modal dialogs because a modal window's native parent cannot be changed after creation.
             */
            useFocusedWindowAsOwner: boolean;

            /**
             * The title of the dialog.
             */
            title: string;

            /**
             * Additional features of the dialog.
             */
            readonly features: Record<string, any>;

            /**
             * The main display widget of the dialog.
             */
            get contentPane(): T;

            /**
             * Set the main display widget of the dialog.
             */
            set contentPane(value: T);

            /**
             * Popup owner of the dialog, which is passed in show() method.
             */
            get popupOwner(): DialogPopupOwner;

            /**
             * Whether the dialog is showing.
             */
            get isShowing(): boolean;

            /**
             * Show the dialog.
             * @param popupOwner If the dialog is a popup window, it is used to calculate the popup position.
             * @param args Arguments passed to the onShown() method.
             */
            show(popupOwner?: DialogPopupOwner, ...args: any[]): Promise<void>;

            /**
             * Hide the dialog.
             */
            hide(): void;

            /**
             * Wait for the dialog to close and get its result.
             * @returns The value assigned to `Dialog.result`, or `null` if the dialog is closed or cancelled without producing a result.
             */
            getResult(): Promise<any>;

            /**
             * Destroy the dialog.
             */
            dispose(): void;

            /**
             * Get window position x.
             */
            get winX(): number;

            /**
             * Get window position y.
             */
            get winY(): number;

            /**
             * Get window width.
             */
            get winWidth(): number;

            /**
             * Get window height.
             */
            get winHeight(): number;

            /**
             * 
             * @param x 
             * @param y 
             */
            setPos(x: number, y: number): void;

            /**
             * Set window size.
             * @param w width.
             * @param h height.
             */
            setSize(w: number, h: number): void;

            /**
             * Get the height of the title bar of the dialog.
             */
            getTitleBarHeight(): number;
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
         * Data Change Callback
         */
        export interface DataChangeCallback {
            /**
             * Callback function prototype when the object is modified
             * @param sender The watched object
             * @param target The object being modified. It may not necessarily be the watched object, but could be a sub-object.
             * @param key The name of the property being modified.
             * @param value The new value of the property.
             * @param oldvalue The old value of the property.
             * @param extInfo Additional information. If this is an array, it indicates the truncated content of the array; if this is the string "add", it indicates that the modification is a newly added property to the object.
             */
            (sender: any, target: any, key: string, value: any, oldvalue: any, extInfo?: any): void;
        }

        /**
         * Data Watcher Interface
         */
        export namespace IDataWatcher {
            /**
             * Set monitoring options for a type.
             * 
             * @param type The type.
             * @param isRoot Observing a = { children: [b] } (both a and b are of the same type) in this case, modifications to b will notify a, and if b.parent = a, then modifications to a will be passed to b, causing a loop.
             * In this case, you need to set the type of a to isRoot=true, indicating that modifications of this type should not be propagated upwards.
             * @param whiteList By default, all property modifications are monitored, but if a whiteList is provided, only the properties in the whiteList are monitored.
             */
            function setOptions(type: any, isRoot?: boolean, whiteList?: Array<string>): void;

            /**
             * Convert the entire object into a watchable object.
             * Returns a proxy that can be used to perform watch.
             * @param obj The object to be converted.
             * @param deep Whether to automatically watch sub-objects, default is true.
             * @returns The watchable object.
             */
            function watch<T extends Object>(obj: T, deep?: boolean): T;

            /**
             * Whether the object is being watched.
             * @param obj The object to be checked.
             * @returns Whether the object is being watched. 
             */
            function isWatching(obj: any): boolean;

            /**
             * Get the original object of the watchable object.
             * @param obj The watchable object.
             * @returns The original object. 
             */
            function getOriginalObj(obj: any): any;

            /**
             * A number version is designated for each watchable object. When the object is modified, the version number is incremented by 1.
             * @param obj The watchable object.
             * @returns The version number, or null when `obj` is not a watchable object.
             */
            function getVersion(obj: any): number | null;

            /**
             * Add a listener to the object.
             * @param obj The watchable object.
             * @param cb The callback function. 
             * @param target The this object of the callback function. 
             */
            function addListener(obj: any, cb: DataChangeCallback, target?: any): void;

            /**
             * Remove a listener from the object.
             * @param obj The watchable object.
             * @param cb The callback function. 
             * @param target The this object of the callback function. 
             */
            function removeListener(obj: any, cb: DataChangeCallback, target?: any): void;

            /**
             * Remove all watchers from an object. You can choose whether to recursively remove watchers from all members.
             * @param obj The watchable object.
             * @param target The this object of the callback function. If not provided, all listeners will be removed.
             * @param recursive Whether to recursively remove watchers from all members. Default is false. 
             */
            function clearListeners(obj: any, target?: any, recursive?: boolean): void;

            /**
             * Returns the path from fromObj to toObj. For example, if toObj is {a: { b: { c: 1 }}}, and fromObj is {c: 1}, the result is ["a", "b"].
             * Note that there may be multiple references (links) to the object, but we only return one of them.
             * Returns null if it fails.
             * @param fromObj The source object.
             * @param toObj The target object.
             * @param result The result array. If provided, the result will be pushed into this array, otherwise a new array will be created.
             * @returns The path from `fromObj` to `toObj`, or null if no path can be found.
             */
            function getPath(fromObj: Object, toObj: Object, result?: Array<string>): Array<string> | null;

            /**
             * Find the path from fromObj to the object that satisfies the predicate. Returns null if it fails.
             * @param fromObj The source object.
             * @param predicate The predicate function to test each object. If the function returns true, the object is considered a match.
             * @param result The result array. If provided, the result will be pushed into this array.
             * @returns The object that satisfies the predicate, or null if not found.
             */
            function findPath(fromObj: Object, predicate: (obj: any) => boolean, result?: Array<string>): any | null;

            /**
             * Execute a function, and any modifications to watched objects within this function will not trigger change callback functions.
             * @param callback The function to execute.
             */
            function runUntrace(callback: () => void): void;
        }

        /**
         * Interface for data utilities.
         */
        export interface IDataUtils {
            /**
             * Transforms a complex object into a new pure data object based on the data type. 
             * A complex object refers to an object that contains methods, getters/setters, etc., usually instantiated from a class. A pure data object refers to an object that only contains basic data types, with its prototype chain directly being Object.prototype.
             * @param source The source object.
             * @param typeDef The data type.
             * @param eliminateDefaults Whether to eliminate default values. If a property on the object has the same value as the default value in the data type, that property will not be included in the returned data.
             * @returns The transformed data.
             */
            transformDataByType(source: any, typeDef: FTypeDescriptor, eliminateDefaults?: boolean): any;

            /**
             * Fill the data object with default values based on the data type. i.e, if the data object does not have a property, the default value of the data type will be used.
             * @param source The source data.
             * @param typeDef The data type. 
             * @returns The formatted data.
             */
            formatDataByType(source: any, typeDef: FTypeDescriptor): any;

            /**
             * Check if two property types are equal.
             * @param type1 The first property type. 
             * @param type2 The second property type.
             * @returns Whether the two property types are equal.
             */
            propTypeEquals(type1: FPropertyType, type2: FPropertyType): boolean;

            /**
             * Check if the value matches the type, and throw an error if it does not match.
             * @param type The property type. 
             * @param value The value to check.
             * @returns The original value, or a new value that matches the type. e.g. if the type is boolean, the value will be converted to a boolean by using !!value.
             */
            checkTypeMatch(type: FPropertyType, value: any): any;
        }
        /**
         * Interface for data inspector.
         */
        export interface IDataInspector {
            /**
             * The id of the inspector.
             */
            readonly id: string;

            /**
             * All catalog fields.
             */
            readonly catalogs: ReadonlyArray<IPropertyField>;

            /**
             * The object being inspected. If there are multiple objects being inspected, this will be the first one.
             */
            readonly target: any;

            /**
             * List of objects being inspected. In the case of multiple selection, there will be multiple objects.
             */
            readonly targets: ReadonlyArray<any>;

            /**
             * The type of the object being inspected.
             */
            readonly targetType: FTypeDescriptor;

            /**
             * Whether the inspector is being updated by setData. If false, the inspector is being updated by data change notification.
             */
            readonly fullUpdating: boolean;

            /**
             * Get the inspection data. It is an array of objects, because the inspector can inspect multiple objects at the same time.
             */
            getData(): ReadonlyArray<any>;

            /**
             * Set the inspection target and data.
             * The `target` and `data` are both arrays of objects, because the inspector can inspect multiple objects at the same time.
             * `target` and `data` should have the same length. If `data` is not provided, the inspector will use the `target` as the data.
             * `data` is the real data to be inspected, while `target` is the object that the data belongs to.
             * For convenience, `target` and `data` can also be single objects, in which case they will be converted to arrays.
             * `status` is an object used to read and write certain UI display states, such as whether a group is expanded, the current index of a Tab component, etc.
             * @param target A single object or a array objects.
             * @param data A single data or a array of datas.
             * @param status The status of the inspection.
             */
            setData(target: any, data?: any, status?: any): void;

            /**
             * Refresh the inspector. You do not need to call this method if the inspector is updated by `setData`.
             */
            refresh(): void;

            /**
             * Notify the inspector that the data has changed. The inspector will update the display according to the data path provided.
             * You do not need to call this method because the inspector is automatically notified when the data changes.
             * @param datapath The path of the changed data. It is an array of strings, each string is a key in the data object. The inspector will update the display of the field that corresponds to the data path.
             */
            notifyChange(datapath: ReadonlyArray<string>): void;

            /**
             * The Inspector will use the name of the data type as the title by default. If you need to customize the title, you can call this method.
             * @param value The title to be set.
             */
            setTitle(value: string): void;

            /**
             * Set the read-only state of the inspector.
             * @param value Whether the inspector is read-only. 
             */
            setReadonly(value: boolean): void;

            /**
             * Get a catalog field by name.
             * @param name The name of the catalog field.
             * @returns The catalog field.
             */
            getCatalogField(name: string): IPropertyField;

            /**
             * Get a UI status value of a field.
             */
            getStatus(field: IPropertyField, name: string): any;

            /**
             * Set a UI status value of a field.
             */
            setStatus(field: IPropertyField, name: string, value: any): void;

            /**
             * Set the style of the catalog bar.
             * @param style The style to be set.
             */
            setCatalogBarStyle(style: CatalogBarStyle): void;

            /**
             * Execute the validators of all decendants of the specified field.
             * @param parentField The parent field. If not provided, all fields will be validated.
             * @returns Whether the validation is successful.
             * @see FPropertyDescriptor.validator
             */
            runValidators(parentField?: IPropertyField): boolean;

            /**
             * Scroll to the specified field.
             * @param field The field to scroll to. 
             * @param ani Whether to animate the scrolling. 
             * @param setFirst Whether to display the field at the top of the view area if possible.
             */
            scrollTo(field: IPropertyField, ani?: boolean, setFirst?: boolean): void;

            /**
             * Scroll to the specified field.
             * @param field The field to scroll to.
             * @param ani Whether to animate the scrolling.
             * @param secondField The second field is commonly displayed before the specified field.
             * When we try to scroll to the specified field to make it visible, we will also make sure the second field is visible.
             * If it is not possible to make both fields visible, the second field will be displayed at the top of the view area.
             */
            scrollTo(field: IPropertyField, ani?: boolean, secondField?: IPropertyField): void;

            /**
             * Set a flag for the specified field.
             * @param field The field to set the flag for.
             * @param flag The flag to set.
             * @param value The value to set. 
             * @param inheritedValue The inherited value to set. 
             * @see FieldStatusFlags
             */
            setFlag(field: IPropertyField, flag: number, value: boolean, inheritedValue?: boolean): void;

            /**
             * Release resources.
             */
            dispose(): void;
        }

        export type DataHistoryItemAction = "edit" | "undo" | "redo";

        export type DataHistoryItemAppliedHandler = (
            target: any,
            datapath: ReadonlyArray<string>,
            value: any,
            oldValue: any,
            action: DataHistoryItemAction,
        ) => void;

        /**
         * Interface for version tracking
         */
        export interface IVersionTracker {
            /**
             * A number that represents the current version.
             */
            savePoint: number;

            /**
             * If the data is modified.
             */
            isModified: boolean;

            /**
             * Set the modified state.
             * @param value The modified state.
             */
            setModified(value: boolean): void;
        }

        /**
         * Interface for data history.
         */
        export interface IDataHistory {
            /**
             * The changed event. It will be triggered when the data is changed, undone or redone.
             */
            readonly onChanged: IDelegate<() => void>;

            /**
             * Triggered synchronously for every accepted edit and for every item applied
             * by undo or redo. Unlike `onChanged`, this event is not delayed until a
             * history batch is packed.
             */
            readonly onItemApplied: IDelegate<DataHistoryItemAppliedHandler>;

            /**
             * If the undo/redo is processing.
             */
            readonly processing: boolean;

            /**
             * Whether undo operation can be performed currently.
             */
            readonly canUndo: boolean;

            /**
             * Whether redo operation can be performed currently.
             */
            readonly canRedo: boolean;

            /**
             * Get or set the pause state of the history. If the history is paused, no change will be recorded.
             */
            paused: boolean;

            /**
             * Reset the history. All change records will be cleared.
             */
            reset(): void;

            /**
             * Undo the last change.
             */
            undo(): boolean;

            /**
             * Redo the last undone change.
             */
            redo(): boolean;

            /**
             * Add a change record. 
             * This record will not be added to the history immediately, but will be delayed for a short period of time, and only if there is no dragging operation and text input is not in progress. If these conditions are not met, the delay will continue until they are.
             * During this process, if the same operation records are added, they will be merged. For example, if a property of an object continuously changes during mouse dragging, only the last value will be recorded.
             * @param target The target object.
             * @param datapath The data path.
             * @param value The new value.
             * @param oldvalue The old value.
             * @param extInfo Additional information. It is internally used by the editor to record array changes.
             * @param transient Whether the change is transient. A transient change will not affect the versionTracker.
             * @param batchId The batch ID. If this ID is provided, the change will attempt to merge or add to the undo stack's queue with the same batch ID.
             * @param group The group ID. If this ID is provided, the change will be added to the specified group. A DataHistory can be separated into multiple groups, and undo/redo operations can be performed in each group separately.
             */
            addChange(target: any, datapath: string | string[], value: any, oldvalue: any, extInfo?: any, transient?: boolean, batchId?: number, group?: number): number;

            /**
             * Get the most recent batch ID. If there are no changes or the latest batch is too old, it returns null.
             * @returns The most recent batch ID, or null.
             */
            getRecentBatchId(): number | null;

            /**
             * If there are changes pending, flush them immediately.
             */
            flush(): void;

            /**
             * Handy function to mount a DataHistory to an object.
             * @param obj 
             */
            trace(obj: any): any;

            /**
             * Handy function to unmount a DataHistory from an object.
             * @param obj 
             */
            untrace(obj: any): void;

            /**
             * Get the undo targets of the specified group.
             * @param group The group ID.
             * @returns The undo targets as an array.
             */
            getUndoTargets(group?: number): Array<any>;

            /**
             * Get the undo targets of the specified group.
             * @param group The group ID.
             * @returns The undo targets as a set.
             */
            getUndoTargetSet(group?: number): ReadonlySet<any>;

            /**
             * Run a callback, all change records generated in the callback will be added to the same batch.
             * @param callback The callback function.
             */
            runInSingleBatch(callback: () => Promise<void>): Promise<void>;

            /**
             * Run a callback, all change records generated in the callback will be ignored.
             * @param callback The callback function.
             */
            runUntrace(callback: () => void): void;

            /**
             * Check if the specified group can undo.
             * @param group The group ID.
             * @returns Whether the group can undo.
             */
            canUndoWithGroup(group: number): boolean;

            /**
             * Check if the specified group can redo.
             * @param group The group ID.
             * @returns Whether the group can redo.
             */
            canRedoWithGroup(group: number): boolean;

            /**
             * Clear the change records of the specified group.
             * @param group The group ID.
             * @returns Any change records are cleared.
             */
            clearGroup(group: number): boolean;
        }

        /**
         * Interface for data components.
         */
        export interface IDataComponent {
            /**
             * The data of the component.
             */
            readonly props: any;

            /**
             * The script object of the component.
             */
            readonly scriptObj: any;

            /**
             * The type name of the component.
             */
            readonly typeName: string;

            /**
             * The type descriptor of the component. It could be null if the type is not registered.
             */
            readonly typeDef: FTypeDescriptor | null;

            /**
             * Update the data of the component.
             * @param data The new data.
             */
            load(data: any): void;

            /**
             * Mark the data changed
             */
            markChanged(): void;

            /**
             * Serialize the component.
             * @param eliminateDefaults Whether to eliminate the default values. When true, if a property is equal to the default value, it will not be serialized. 
             * @returns The serialized data.
             */
            export(eliminateDefaults?: boolean): any;

            /**
             * Serialize the component with options.
             * @param options Serialization options.
             * @returns The serialized data. 
             */
            export(options?: IEncodeObjOptions): any;

            /**
             * Destroy the component.
             */
            destroy(): void;
        }
        /** Fully resolved options stored in a curve editor model. */
        export interface CurveEditDialogOptions extends Required<Pick<CurveInputOptions,
            "min" | "max" | "maxKeyFrame" | "isCurve" | "isWeight" | "forceStartEndKeys" | "isNormalization">> {
        }

        /** Editable value and resolved options consumed by the React curve editor dialog. */
        export interface CurveEditDialogValue extends CurveInputValue {
            /** Options controlling curve constraints and editing behavior. */
            options: CurveEditDialogOptions;
        }

        /**
         * Interface for the React curve editor dialog.
         */
        export interface ICurveEditDialog extends IDialog {
            /**
             * Show the curve editor.
             * @param popupOwner Element or widget used to position the popup.
             * @param value Initial curve value and resolved editing options.
             * @param readonly Whether editing is disabled.
             * @param onChange Called whenever the edited curve changes.
             */
            show(popupOwner: DialogPopupOwner, value: CurveEditDialogValue, readonly: boolean, onChange: (value: CurveEditDialogValue) => void): Promise<void>;

            /**
             * Update the value displayed by an open curve editor.
             * @param value The new curve value and resolved editing options.
             */
            setValue(value: CurveEditDialogValue): void;
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
         * Console panel interface.
         */
        export interface IConsolePanel extends IEditorPanel {
            /**
             * Output a log message.
             * @param msg text of the log message. 
             * @param level level of the log message. 0-debug,1-info,2-warning,3-error
             * @param group optional group name of the log message. e.g. "Compile" means the log message is related to compile.
             */
            log(msg: string, level?: number, group?: string): void;

            /**
             * Clear all log messages.
             */
            clear(): void;

            /**
             * Clear log messages of a specific group.
             * @param group group name.
             */
            clearGroup(group: string): void;
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
         * Interface for the React color picker dialog.
         */
        export interface IColorPickerDialog extends IDialog {
            /**
             * Show the color picker.
             * @param popupOwner Element or widget used to position the popup.
             * @param color Initial color displayed by the picker.
             * @param hideAlpha Whether to hide alpha editing and force alpha to 1.
             * @param onChange Called whenever the edited color changes.
             */
            show(popupOwner: DialogPopupOwner, color: gui.Color, hideAlpha: boolean, onChange: (color: gui.Color) => void): Promise<void>;

            /**
             * Update the color displayed by an open picker.
             * @param color The new color.
             * @param hideAlpha Whether to hide alpha editing. Existing behavior is retained when omitted.
             */
            setValue(color: gui.Color, hideAlpha?: boolean): void;
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

        /**
         * Class registry for editor. It is internally used by editor.
         */
        export namespace IClassRegistry {
            /**
             * Class map.
             */
            const classMap: Record<string, Function>;

            /**
             * User class map.
             */
            const userClassMap: Record<string, Function>;

            /**
             * Register a class.
             * @param className class name.
             * @param cls class.
             */
            function regClass(className: string, cls: any): void;

            /**
             * Get a class by name.
             * @param className class name.
             * @returns The class.
             */
            function getClass(className: string): any;

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

        export interface IBuildSettingsPanel extends IEditorPanel {
            /**
             * Get all registered build targets.
             * @return A record mapping build target names to their info.
             */
            getBuildTargets(): Record<string, Readonly<IBuildTargetInfo>>;

            /**
             * Get a build target info by its name.
             * @param name The name of the build target.
             * @return The build target info, or null if not found.
             */
            getBuildTarget(name: string): Readonly<IBuildTargetInfo> | null;

            /**
             * Show the catalog for a specific build target.
             * @param catalog The name of the catalog to show.
             * @param catalog2 An optional secondary catalog name.
             */
            showCatalog(catalog: string, catalog2?: string): void;
        }

        /**
         * Tools for asset store
         */
        export namespace IAssetStoreTools {
            type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
            type QueryValue = string | number | boolean | null | undefined;

            interface RequestOptions {
                method?: Method;
                query?: Record<string, QueryValue | QueryValue[]>;
                body?: unknown;
                /** Where the editor injects authentication. Defaults to query for GET and body for other methods. */
                auth?: "auto" | "query" | "body";
            }

            /**
             * Request a JSON API under the Asset Store origin. Authentication is supplied by the editor.
             * `path` must be a relative API path and must not contain a query string or fragment.
             */
            function request<T = any>(path: string, options?: RequestOptions): Promise<T>;

            /**
             * Upload a package to the asset store.
             * @param resourceId The resource id.
             * @param filePath The local absolute path of the package. 
             * @param uploadProgress A callback function that will be called when the upload progress changes. 
             * @param abortToken The abort token.
             */
            function uploadPackage(resourceId: string, filePath: string, uploadProgress?: (loaded: number, total: number) => void, abortToken?: IAbortToken): Promise<void>;

            /**
             * Call plugin backend.
             * @param action The action to perform, currently fixed as "call".
             * @param resourceId The resource ID.
             * @param billingMethod The billing method: 1 for time-based billing, 2 for per-use billing.
             * @param data The data to be passed.
             * @returns A promise that resolves with the result.
             */
            function callPluginBackend(action: string, resourceId: string, billingMethod: number, data: any): Promise<any>;

        }

        /**
         * Asset Panel Interface
         */
        export interface IAssetPanel {
            /**
             * Get the selected resource.
             */
            getSelectedResource(): IAssetInfo;
            /**
             * Get the selected resources.
             * @param result Optional result array, if provided, the result will be pushed into this array, otherwise a new array will be created.
             * @returns The selected resources.
             */
            getSelectedResources(result?: Array<IAssetInfo>): Array<IAssetInfo>;

            /**
             * Get the selected folder.
             * @returns The selected folder.
             */
            getSelectedFolder(): IAssetInfo;

            /**
             * Get all expanded folders in the tree view.
             * @param result Optional result array, if provided, the result will be pushed into this array, otherwise a new array will be created.
             * @returns All expanded folders in the tree view.
             */
            getExpandedFolders(result?: Array<string>): Array<string>;

            /**
             * Set the expanded folders in the tree view.
             * @param arr The expanded folders
             */
            setExpandedFolders(arr: ReadonlyArray<string>): void;

            /**
             * Set the selected asset.
             * @param assetId The asset id.
             * @returns A promise that resolves with a boolean indicating whether the asset is selected successfully.
             */
            select(assetId: string): Promise<boolean>;

            /**
             * Expand the asset. If the asset is a folder, expand it.
             * @param asset The asset to expand.
             */
            expand(asset: IAssetInfo): void;

            /**
             * Start renaming the asset. The asset will enter renaming mode.
             * @param asset The asset to rename.
             */
            rename(asset: IAssetInfo): void;

            /**
             * A temporary asset will be created in the folder, and the asset will enter renaming mode.
             * @param folderAsset The folder asset.
             * @param fileName The file name. 
             * @param callback The callback function that will be called when user finish renaming the asset. 
             */
            addNew(folderAsset: IAssetInfo, fileName: string, callback: (fileName: string) => void): void;

            /**
             * Delete the assets in the selection.
             */
            deleteSelection(): void;

            /**
             * Notify the asset panel that the selection has changed.
             */
            onSelectionChanged(): void;

            /**
             * When the asset panel is in two column mode, this is the icon scale of the detail list item in the right column.
             */
            iconScale: number;
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

        export interface IAssetDependencyTool {
            /**
             * Query the dependencies of the given assets.
             * @param assetIds The asset IDs or paths to query.
             * @param includeIndirectLinks Whether to include indirect dependencies.
             * @param noSubAsset Whether to exclude sub-assets and only return their parent assets.
             * @returns A promise that resolves to a tuple containing an array of asset info objects representing the dependencies and an array of asset IDs or paths that were not found.
             */
            queryDependency(assetIds: ReadonlyArray<string>, includeIndirectLinks?: boolean, noSubAsset?: boolean): Promise<[Array<IAssetInfo>, Array<string>]>;

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
             * @returns A promise that resolves to an array of asset ids representing the assets that were modified.
             */
            replaceReference(replacements: Record<string, string>, targetAssets?: ReadonlySet<IAssetInfo>): Promise<Array<string>>;
        }

        /**
         * Interface for an asset database.
         */
        export interface IAssetDb {
            /**
             * The id of the root asset, which is the project root folder.
             */
            readonly rootAssetId: string;

            /**
             * Triggered when an asset is changed.
             * @param assetId The id of the asset.
             * @param assetPath The path of the asset.
             * @param assetType The type of the asset.
             * @param flag The flag of the change.
             */
            readonly onAssetChanged: IDelegate<(assetId: string, assetPath: string, assetType: AssetType, flag: AssetChangedFlag) => void>;

            /**
             * Triggered when the package list is changed.
             */
            readonly onPackagesChanged: IDelegate<() => void>;

            /**
             * Communication port to the AssetManager which is running in the scene process.
             */
            readonly port: IMyMessagePort;

            /**
             * Get the version of the specified type. The version is increased when the assets of the specified type are added, removed or renamed.
             * @param type The type of the asset.
             * @returns The version of the specified type.
             */
            getVersionOfType(type: AssetType): number;

            /**
             * Get the assets in the specified folder.
             * @param folderAssetId The id of the folder asset.
             * @param types The types of the assets.
             * @param matchSubType Whether to match the sub type. Some assets have a type and a sub type. Such as a json asset has a type of `Json` and a sub type of `Spine` if it is a description file of spine.
             * @param customFilter The custom filter. Register it through `EditorEnv.assetMgr.customAssetFilters` in the Scene process.
             * @returns The assets in the specified folder.
             */
            getFolderContent(folderAssetId: string, types?: ReadonlyArray<AssetType | string>, matchSubType?: boolean, customFilter?: string): Promise<IAssetInfo[]>;

            /**
             * Get the asset by the id or path.
             * @param assetIdOrPath The id or path of the asset.
             * @param allowResourcesSearch Whether to allow searching in the resources folder.
             * @returns The asset, or null if no matching asset is found.
             */
            getAsset(assetIdOrPath: string, allowResourcesSearch?: boolean): Promise<IAssetInfo | null>;

            /**
             * Get the asset by the id or path synchronously. Can only be used if the asset is already queried.
             * @param assetIdOrPath The id or path of the asset.
             * @param allowResourcesSearch Whether to allow searching in the resources folder.
             * @returns The cached asset, or null if it has not been queried or does not exist.
             */
            getAssetSync(assetIdOrPath: string, allowResourcesSearch?: boolean): IAssetInfo | null;

            /**
             * Get all parent assets of the specified asset id (including itself), arranged in order from the root directory to itself.
             * @param assetId The id of the asset.
             * @returns Parent assets from the project root through the requested asset, or `null` if the asset ID cannot be resolved.
             * @example
             * ```
             * let parents = await Editor.assetDb.getAssetsInPath('GUID');
             * // parents: [assets, folder, asset]
             * ```
             */
            getAssetsInPath(assetId: string): Promise<Array<IAssetInfo> | null>;

            /**
             * Set the meta data of the asset. The meta data is stored in the meta file of the asset. 
             * Developers can store custom data in the meta file. 'importer' is a reserved key in the meta file, which is used to store the importer information of the asset.
             * This operation is the same as developers manually using IO operations to read and write meta files, except that this operation is performed by the editor.
             * @param assetId The id of the asset.
             * @param data The data to be stored in the meta file. It is an object or string. If it is a string, it is stringified from an object.
             * @example
             * ```
             * await Editor.assetDb.setMetaData('GUID', { importer: { textureType: 2 } });
             * 
             * await Editor.assetDb.setMetaData('GUID', { customData: 'Hello World!' });
             * ```
             */
            setMetaData(assetId: string, data: any): Promise<void>;

            /**
             * Set the meta data of the assets. The meta data is stored in the meta file of the asset. 
             * Developers can store custom data in the meta file. 'importer' is a reserved key in the meta file, which is used to store the importer information of the asset.
             * This operation is the same as developers manually using IO operations to read and write meta files, except that this operation is performed by the editor.
             * @param idAndDataArray The array of the id and data to be stored in the meta file. The data is an object or string. If it is a string, it is stringified from an object.
             * @example
             * ```
             * await Editor.assetDb.setMetaData('GUID1', { importer: { textureType: 2 } }, 'GUID2', { importer: { textureType: 2 } });
             * 
             * await Editor.assetDb.setMetaData('GUID1', { customData: 'Hello World!' }, 'GUID2', { customData: 'Hello World!' });
             * ```
             */
            setMetaData(...idAndDataArray: any[]): Promise<void>;

            /**
             * Write the file to the specified path. Create a new asset if the file does not exist, and return existing assets if the file exists.
             * @param filePath The path of the file. The path is relative to the assets folder.
             * @param source If sourceIsPath is true, the source is the path of the source file, and the file is created by copying the source file. Otherwise, the source is the content of the file.
             * @param sourceIsPath Whether the source is a path.
             * @param allowOverwrite Whether to allow overwriting the file. If the file already exists, the file is overwritten. Default is true.
             * @returns The asset information of the file, or null if the operation fails.
             */
            writeFile(filePath: string, source?: string, sourceIsPath?: boolean, allowOverwrite?: boolean): Promise<IAssetInfo | null>;

            /**
             * Write the file with a template to the specified path. Create a new asset if the file does not exist, and return existing assets if the file exists.
             * @param filePath The path of the file. The path is relative to the assets folder.
             * @param templateName The template name, an absolute path, or a file name resolved from the default template directory.
             * @param templateArgs The arguments of the template. 
             * @param allowOverwrite Whether to allow overwriting the file. If the file already exists, the file is overwritten. Default is true.
             * @returns The asset information of the file.
             * @example
             * ```
             * await Editor.assetDb.createFileFromTemplate('test.lmat', 'templateName', { key: 'value' });
             * ```
             */
            createFileFromTemplate(filePath: string, templateName: string, templateArgs?: Record<string, string>, allowOverwrite?: boolean): Promise<IAssetInfo | null>;

            /**
             * Create a folder at the specified path. 
             * @param folderPath The path of the folder. The path is relative to the assets folder.
             * @returns The asset information of the folder, or null if the operation fails.
             */
            createFolder(folderPath: string): Promise<IAssetInfo | null>;

            /**
             * Get the path of the source file of the prefab asset. For prefab assets like fbx/gltf, their scene files are generated in the library folder. This method can get the path of the scene file.
             * @param asset The prefab asset.
             * @returns The path of the source file.
             */
            getPrefabSourcePath(asset: IAssetInfo): string;

            /**
             * Get the absolute path of the asset.
             * @param asset The asset.
             * @returns The absolute path of the asset.
             */
            getFullPath(asset: IAssetInfo): string;

            /**
             * Get the URL of the asset. Usually in the form of `file:///path/to/asset`.
             * @param asset The asset.
             * @returns The URL of the asset.
             */
            getURL(asset: IAssetInfo): string;

            /**
             * Convert the path to the absolute path.
             * @param path The path, which is relative to the assets folder.
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
             * Convert the path to the URL. Usually in the form of `file:///path/to/asset`.
             * @param path The path, which is relative to the assets folder.
             * @returns The URL.
             */
            toURL(path: string): string;

            /**
             * Get the initials of the asset. The initials are the first letters of the asset name.
             * @param asset The asset.
             * @returns The initials of the asset.
             */
            getAssetInitials(asset: IAssetInfo): string[];

            /**
             * Get the icon of the asset. The icon is the image of the asset.
             * @param asset The asset.
             * @param opened It is meaningful for the folder asset. Whether the folder is opened.
             * @param preferBig Whether to prefer a big icon.
             * @returns The icon of the asset.
             */
            getAssetIcon(asset: IAssetInfo, opened?: boolean, preferBig?: boolean): string;

            /**
             * Get the icon of the file. The icon is the image of the file.
             * @param ext The extension of the file, e.g. `png`.
             * @param subType The sub type of the file.
             * @returns The icon of the file.
             */
            getFileIcon(ext: string, subType?: string): string;

            /**
             * Get the icon of the folder. The icon is the image of the folder.
             * @param name The name of the folder.
             * @returns The icon of the folder. The first element is the icon in normal state, and the second element is the icon in opened state.
             */
            getFolderIcon(name: string): [string, string];

            /**
             * Get the thumbnail image url of the asset. The thumbnail is a small image generated by the editor to represent the asset.
             * @param assetId The id of the asset.
             * @returns The thumbnail image url of the asset.
             */
            getAssetThumbnail(assetId: string): string;

            /**
             * Get the thumbnail image url of the asset.
             * @param assetId The id of the asset.
             * @returns The thumbnail image url of the asset.
             */
            getImageThumbnail(assetId: string): string;

            /**
             * Clear the thumbnail cache of the asset. It is internally called when the asset is changed.
             * @param assetId The id of the asset.
             */
            clearAssetThumbnailCache(assetId: string): void;

            /**
             * Request to reimport the assets. The assets are reimported according to the importer settings with the specified arguments.
             * @param assets The assets to be reimported.
             * @param args The arguments of the reimport. It is optional. 
             */
            reimport(assets: ReadonlyArray<IAssetInfo>, args?: ReadonlyArray<string>): void;

            /**
             * Unpack the assets to a folder which name is the asset name with a suffix `-unpacked`.
             * For assets like fbx/gltf, you can unpack the scene files, materials, textures, etc., contained in them to the specified folder.
             * @param assets The assets to be unpacked.
             */
            unpack(assets: ReadonlyArray<IAssetInfo>): void;

            /**
             * Search the assets by the keyword.
             * @param keyword The keyword.
             * @param types The types of the assets. 
             * @param matchSubType Whether to match the sub type. Some assets have a type and a sub type. Such as a json asset has a type of `Json` and a sub type of `Spine` if it is a description file of spine.
             * @param customFilter The custom filter. Register it through `EditorEnv.assetMgr.customAssetFilters` in the Scene process.
             * @returns The assets that match the keyword.
             */
            search(keyword: string, types?: ReadonlyArray<AssetType | string>, matchSubType?: boolean, customFilter?: string): Promise<Array<IAssetInfo>>;

            /**
             * Search the assets by the keyword.
             * @param keyword The keyword. 
             * @param types The types of the assets. 
             * @param options The options of the search.
             * @returns The assets that match the keyword.
             */
            search(keyword: string, types?: ReadonlyArray<AssetType | string>, options?: IFindAssetsOptions): Promise<Array<IAssetInfo>>;

            /**
             * Filter the assets by the asset ids.
             * @param assetIds The asset ids. 
             * @param types The types of the assets. 
             * @param matchSubType Whether to match the sub type. Some assets have a type and a sub type. Such as a json asset has a type of `Json` and a sub type of `Spine` if it is a description file of spine. 
             * @param customFilter The custom filter. Register it through `EditorEnv.assetMgr.customAssetFilters` in the Scene process.
             * @returns The assets that match the asset ids and other conditions.
             */
            filter(assetIds: ReadonlyArray<string>, types?: ReadonlyArray<AssetType | string>, matchSubType?: boolean, customFilter?: string): Promise<Array<IAssetInfo>>;

            /**
             * Rename the asset.
             * @param assetId The id of the asset. 
             * @param newName The new name of the asset.
             * @returns The result of the operation. If the operation is successful, the result is 0. Otherwise, the result is an error code.
             * -1 - The asset does not exist.
             * 1 - The target file is already existed.
             * 2 - Some io error occurred.
             */
            rename(assetId: string, newName: string): Promise<number>;

            /**
             * Move the assets to the specified folder.
             * @param sourceAssetIds The ids of the assets to be moved.
             * @param targetFolderId The id of the target folder.
             * @param conflictResolution The conflict resolution. It is optional. The default value is `replace`.
             */
            move(sourceAssetIds: ReadonlyArray<string>, targetFolderId: string, conflictResolution?: "keepBoth" | "replace"): Promise<void>;

            /**
             * Copy the assets to the specified folder.
             * @param sourceAssetIds The ids of the assets to be copied. 
             * @param targetFolderId The id of the target folder. 
             * @param conflictResolution The conflict resolution. It is optional. The default value is `replace`. 
             */
            copy(sourceAssetIds: ReadonlyArray<string>, targetFolderId: string, conflictResolution?: "keepBoth" | "replace"): Promise<void>;

            /**
             * Delete the assets.
             * @param assets The assets to be deleted.
             */
            delete(assets: ReadonlyArray<IAssetInfo>): Promise<void>;

            /**
             * Create a temporary asset. The temporary asset is not saved to the disk. It is internally used by AssetPanel to create a new asset.
             * @param fileName The name of the temporary asset.
             * @returns The temporary asset.
             */
            createTempAsset(fileName: string): Promise<IAssetInfo>;

            /**
             * Refresh the `ver` property of the asset and the `treeVer` property of the parent asset. 
             * Some UI interfaces will detect the `ver` and `treeVer` properties of the asset, which makes them refresh the asset list of the specified folder.
             * @param folderAsset The folder asset.
             */
            refreshFolder(folderAsset: IAssetInfo): void;

            /**
             * Check if the asset type matches the specified types.
             * @param assetId The id of the asset.
             * @param types The types to be matched. 
             * @returns Whether the asset type matches the specified types.
             */
            matchType(assetId: string, types: Array<AssetType | string>): Promise<boolean>;

            /**
             * Get the file actions of the asset.
             * @param asset The asset.
             * @returns The file actions of the asset.
             */
            getFileActions(asset: IAssetInfo): IFileActions;

            /**
             * Get the file actions by the asset type or the file extension.
             * @param assetTypeOrFileExt The type of the asset or the file extension.
             * @returns The file actions of the asset.
             */
            getFileActionsByType(assetTypeOrFileExt: AssetType | string): IFileActions;
            /**
             * If there are any changes in the asset database, this function can be called to apply the changes.
             */
            flushChanges(): Promise<void>;
        }

        /**
         * Interface for the Add Modules dialog.
         */
        export interface IAddModulesDialog extends IDialog {
            /**
             * Show the dialog.
             * @param popupOwner Popup owner.
             * @param selectedModules Selected modules. 
             */
            show(popupOwner: DialogPopupOwner, selectedModules?: Array<string>): Promise<void>;
        }

        /**
         * Information about the current user.
         */
        export interface IUserInfo {
            /**
             * The nickname of the user.
             */
            nickname: string;

            /**
             * The avatar of the user.
             */
            headimg: string;

            /**
             * The first letter of the nickname.
             */
            headletter: string;

            /**
             * The channel of the user.
             */
            channel: string;

            /**
             * The user id.
             */
            userId: string;

            /**
             * The developer id.
             */
            developerId: string;

            /**
             * Whether the user is an enterprise user.
             */
            enterprise?: boolean;
        }

        /**
         * Interface for an account manager.
         */
        export interface IAccountManager {
            /**
             * Triggered when the logged-in user changes.
             */
            readonly onAccountChanged: IDelegate<() => void>;

            /**
             * The information of the current user.
             */
            readonly userInfo: IUserInfo;

            /**
             * Log in.
             */
            login(): Promise<void>;

            /**
             * Log out.
             */
            logout(): Promise<void>;
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

        export interface ISceneEditor extends IEditorFrontEnd {
            /**
             * Data analysis support.
             */
            readonly eventTracking: IEventTracking;

            /**
             * Play controls.
             */
            readonly playControls: IPlayControls;

            /**
             * Save the current scene.
             * @param forced Save even if the scene is not modified.
             * @returns Returns true if the scene is saved successfully. Returns false if the scene is not saved. 
             */
            save(forced?: boolean): Promise<boolean>;

            /**
             * Save the current scene as a new file.
             * @returns Returns true if the scene is saved successfully. Returns false if the scene is not saved.
             */
            saveAs(): Promise<boolean>;

            /**
             * Save all scenes.
             */
            saveAll(): void;

            /**
             * Discard changes of the current scene.
             */
            discardChanges(): void;

            /**
             * Save all scenes with confirmation.
             * @returns Returns true if all scenes are saved successfully. Returns false if any scene is not saved.
             */
            queryToSaveAll(): Promise<boolean>;
        }
        export interface IPlayControls {
            /**
             * An behavior of the play button. If true, the play button will play the current scene. If false, the play button will play the startup scene.
             */
            playCurrentScene: boolean;

            /**
             * Whether to use HTTPS when playing the scene.
             */
            useHttps: boolean;

            /**
             * The URL parameters to play the scene.
             */
            readonly playParams: URLSearchParams;

            /**
             * Starts playing the scene.
             * @param currentOrStartup If true, play the current scene. If false, play the startup scene.
             * @param player Where to play the scene. 
             * - "editor": Play the scene in the editor.
             * - "browser": Play the scene in the browser.
             * - "emulator": Play the scene in the emulator.
             * @returns Returns true if the scene is played successfully. Returns false if the scene is not played.
             */
            play(currentOrStartup: boolean, player?: "browser" | "editor" | "emulator"): boolean;

            /**
             * Stops playing the scene.
             */
            stop(): void;

            /**
             * Pauses playing the scene.
             */
            pause(): void;

            /**
             * Resumes playing the scene.
             */
            resume(): void;

            /**
             * Steps to the next frame when the scene is paused.
             */
            stepNextFrame(): void;

            /**
             * Gets the URL to play the scene.
             * @param currentOrStartup If true, get the URL to play the current scene. If false, get the URL to play the startup scene. 
             * @param additionParams Additional parameters to add to the URL.
             * @param player The URL is for where to play the scene. Default is "browser".
             * - "browser": Play the scene in the browser.
             * - "game-view": Play the scene in the game view.
             * - "emulator": Play the scene in the emulator.
             * @returns Returns the URL to play the scene.
             */
            getPlayURL(currentOrStartup?: boolean, additionParams?: Record<string, string>, player?: "browser" | "editor" | "emulator"): string;
        }

        export class Dialog<T extends gui.Widget = gui.Widget> implements IDialog<T> {
            resizable: boolean;
            modal: boolean;
            closable: boolean;
            frame: boolean;
            transparent: boolean;
            showType: "none" | "popup" | "dropdown";
            readonly features: Record<string, any>;
            useFocusedWindowAsOwner: boolean;
            readonly id: string;
            name: string;
            saveBounds: boolean;
            protected _win: Window;
            protected _groot: gui.GRoot;
            protected _modalWaitLayer: ReactDOM;
            protected result: any;
            private _modalWaitText;
            private _modalWaitColor;
            private _contentPane;
            private _popupOwner;
            private _popupOwnerGRoot;
            private _popupOwnerDialogId;
            private _x;
            private _y;
            private _width;
            private _height;
            private _contentPaneInitialWidth;
            private _contentPaneInitialHeight;
            private _contentPaneInitialExplicitSize;
            private _explicitSize;
            private _restoredBoundsSize;
            private _autoSizeMeasured;
            private _titleStr;
            private _alwaysInFront;
            private _showing;
            private _creatingWin;
            private _blockLayer;
            private _titleBar;
            constructor();
            get contentPane(): T;
            set contentPane(value: T);
            get popupOwner(): DialogPopupOwner;
            get isShowing(): boolean;
            get alwaysInFront(): boolean;
            set alwaysInFront(value: boolean);
            create(): Promise<void>;
            show(popupOwner?: DialogPopupOwner, ...args: any[]): Promise<void>;
            hide(): void;
            getResult(): Promise<any>;
            dispose(): void;
            private createWindow;
            get title(): string;
            set title(value: string);
            get winX(): number;
            get winY(): number;
            get winWidth(): number;
            get winHeight(): number;
            protected get physicalWinWidth(): number;
            private getWindowSizeInfo;
            setPos(x: number, y: number): void;
            setSize(width: number, height: number): void;
            private applyDialogSize;
            private applyAutoSizeOnce;
            private waitForAutoSizeLayout;
            private needAutoSizeBeforeShow;
            private measureContentSize;
            private measureReactContentSize;
            private getInitialContentSize;
            private isValidSize;
            private syncInitialContentPaneSize;
            private hasExplicitContentPaneSize;
            protected showModalWait(msg?: string): void;
            protected closeModalWait(): void;
            protected setupModalLayer(color?: gui.Color, msg?: string): void;
            private createModalLayer;
            private renderModalLayer;
            protected onInit(): void;
            protected onShown(...args: any[]): void;
            protected onHide(): void;
            protected onAction(): void;
            protected onCancel(): void;
            protected handleKeyEvent(evt: gui.Event): void;
            private fixXY;
            private fixSize;
            private fixResize;
            getTitleBarHeight(): number;
            protected injectDialogStyles(doc: Document): void;
        }
        export class EditorPanel implements IEditorPanel {
            panelOptions: IPanelOptions;
            panelId: string;
            protected _panel: gui.Widget;
            protected _modalWaitLayer: ReactDOM;
            private _modalWaitText;
            create(): Promise<void>;
            get contentPane(): gui.Widget;
            protected showModalWait(msg?: string): void;
            protected closeModalWait(): void;
            protected setupModalLayer(color?: gui.Color, msg?: string): void;
            private createModalLayer;
            private renderModalLayer;
            onStart?(): void;
            onUpdate?(): void;
            onDestroy?(): void;
            onSelectionChanged?(): void;
            onSceneActivate?(scene: IMyScene): void;
            onSceneDeactivate?(scene: IMyScene): void;
            onBeforeSaveScene?(scene: IMyScene): Promise<void> | void;
            onAfterSaveScene?(scene: IMyScene): Promise<void> | void;
            onHotkey?(combo: string): boolean;
            onGlobalHotkey?(combo: string): boolean;
            onSearch?(searchKey: string): void;
            onExtensionReload?(): void;
            getUnsavedFiles?(): Array<string>;
            onSave?(): Promise<void>;
            onSaveStatus?(): void;
        }

        export interface ReactDOMOptions {
            /**
             * Whether to use Shadow DOM for style isolation.
             * Defaults to `false` for the internal `ReactDOM` class and `true` for
             * the public `IEditor.ReactDOM` class.
             */
            shadow?: boolean;
        }
        /**
         * A gui.Widget subclass that hosts React content.
         *
         * Since it extends gui.Widget, add it to the FairyGUI hierarchy with
         * `parent.addChild(reactDOM)`. Pass `{ shadow: true }` to enable style
         * isolation and automatically inject the base theme and editor component
         * stylesheets.
         *
         * Key APIs:
         * - `render(element)` — render or update React content (JSX).
         * - `adoptStyles(css)` — inject additional CSS (import .css files as text).
         * - `dispose()` — unmount React and clean up.
         * - `ReactDOM.useWidget(widget)` — React hook to embed a FairyGUI widget inside React.
         * - `ReactDOM.useWidgetEvent(ref, type, handler)` — route a FairyGUI event to an active React region.
         * - `ReactDOM.createStore(initial)` — create a reactive store for editor→React data flow.
         *
         * @example Panel:
         * ```tsx
         * import styles from './MyPlugin.css';
         *
         * class MyPanel extends IEditor.EditorPanel {
         *     private _react: IEditor.ReactDOM;
         *     async create() {
         *         this._panel = new gui.Widget();
         *         this._react = new IEditor.ReactDOM();
         *         this._react.adoptStyles(styles);
         *         this._react.makeFullSize(this._panel, true);
         *         this._panel.addChild(this._react);
         *         this._react.render(<App />);
         *     }
         *     onDestroy() { this._react.dispose(); }
         * }
         * ```
         *
         * @example Dialog:
         * ```tsx
         * let reactDOM = new IEditor.ReactDOM();
         * reactDOM.adoptStyles(styles);
         * reactDOM.setSize(320, 200);
         * dialog.contentPane = reactDOM;  // ReactDOM IS a gui.Widget
         * reactDOM.render(<MyForm />);
         * ```
         *
         * @example Embedding FairyGUI inside React:
         * ```tsx
         * function MyComponent() {
         *     let panel = IEditor.GUIUtils.createInspectorPanel();
         *     panel.inspect(data, typeDesc);
         *     panel.resizeToFit();
         *     let ref = IEditor.ReactDOM.useWidget(panel);
         *     return <div ref={ref} style={{ height: panel.height }} />;
         * }
         * ```
         *
         * @example Reactive data bridge:
         * ```tsx
         * const store = IEditor.ReactDOM.createStore<string[]>([]);
         * // Editor side: store.set(newValue);
         * // React side:  useSyncExternalStore(store.subscribe, store.get);
         * ```
         *
         * @example Internationalization (use standard gui.Translations):
         * ```tsx
         * let myI18n = gui.Translations.create("my-plugin")
         *     .setContent("zh-CN", { hello: "你好" })
         *     .setContent("en", { hello: "Hello" });
         * // In JSX: <span>{myI18n.t("hello")}</span>
         * ```
         */
        export class ReactDOM extends gui.Widget {
            private _shadowRoot;
            private _reactRoot;
            private _mountPoint;
            private _styleHost;
            private _sheetDocument;
            private _useShadow;
            private _wheelTarget;
            private _explicitSize;
            private _onNativeWheel;
            constructor(options?: ReactDOMOptions);
            /**
             * The Shadow Root. Useful for creating React Portals (dropdowns,
             * modals) that stay within the style-isolated boundary.
             */
            get shadowRoot(): ShadowRoot | null;
            /**
             * The mount point element inside the host element or Shadow DOM.
             */
            get mountPoint(): HTMLDivElement;
            get explicitSize(): boolean;
            setSize(wv: number, hv: number, changeByLayout?: boolean): this;
            /**
             * Render a React element into the Shadow DOM container.
             * Can be called multiple times to update the content.
             */
            render(element: any): void;
            /**
             * Inject additional CSS into this container's Shadow DOM.
             * Typically used with CSS imported as text via the css-text esbuild plugin.
             *
             * ```ts
             * import styles from './MyPlugin.css';
             * reactDOM.adoptStyles(styles);
             * ```
             */
            adoptStyles(css: string): void;
            /**
             * Unmount React and clean up.
             */
            dispose(): void;
            /**
             * Called by FairyGUI when the widget is added to the stage.
             * Rebuild adoptedStyleSheets if the element moved to a different
             * document (e.g. Dialog popup in a new Electron window).
             */
            protected onEnable(): void;
            private _handleNativeWheel;
            /**
             * React hook for embedding a FairyGUI Widget inside React.
             *
             * Pass a widget instance. Returns a `ref` to attach to a container div.
             * The widget is automatically mounted, sized via ResizeObserver,
             * and cleaned up on unmount.
             *
             * @example
             * ```tsx
             * function MyApp() {
             *     let panel = IEditor.GUIUtils.createInspectorPanel();
             *     panel.inspect(data, typeDesc);
             *     panel.resizeToFit();
             *
             *     let ref = IEditor.ReactDOM.useWidget(panel);
             *
             *     return (
             *         <div>
             *             <h3>Properties</h3>
             *             <div ref={ref} style={{ height: panel.height }} />
             *         </div>
             *     );
             * }
             * ```
             */
            static useWidget(contentWidget: gui.Widget): React.RefObject<HTMLDivElement>;
            /**
             * Route a bubbling FairyGUI event from the owning Widget to a React region.
             * When several regions share one ReactDOM host, only the region most recently
             * focused or pressed receives the event. Nested regions take precedence.
             *
             * @param ref A stable ref attached to the root element of the React region.
             * @param type FairyGUI event type, for example `hotkey` or `search`.
             * @param handler Event handler for the active region.
             * @param enabled Whether the bridge should be active. Defaults to true.
             *
             * @example
             * ```tsx
             * function HistoryView({ history }) {
             *     const ref = React.useRef<HTMLDivElement>(null);
             *     IEditor.ReactDOM.useWidgetEvent(ref, "hotkey", event => {
             *         if (event.data === "undo" && history.undo())
             *             event.stopPropagation();
             *     });
             *     return <div ref={ref}>...</div>;
             * }
             * ```
             */
            static useWidgetEvent<T extends HTMLElement>(ref: React.RefObject<T | null>, type: string, handler: (event: gui.Event) => void, enabled?: boolean): void;
            /**
             * Create a minimal external store for bridging editor events into React.
             * Works with React 18's `useSyncExternalStore` hook.
             *
             * @example
             * ```tsx
             * const store = IEditor.ReactDOM.createStore<string[]>([]);
             *
             * // Editor side: push data
             * store.set(newValue);
             *
             * // React side: subscribe
             * function List() {
             *     const ids = useSyncExternalStore(store.subscribe, store.get);
             *     return <ul>{ids.map(id => <li key={id}>{id}</li>)}</ul>;
             * }
             * ```
             */
            static createStore<T>(initialValue: T): {
                /** Get current snapshot (identity-stable between sets). */
                get: () => T;
                /** Replace value and notify all subscribers. */
                set: (next: T) => void;
                /** Subscribe for change notifications. Returns unsubscribe function. */
                subscribe: (fn: () => void) => () => boolean;
            };
        }
        /**
         * Public React host exposed to plugins as `IEditor.ReactDOM`.
         * Uses Shadow DOM by default so plugin styles are isolated from the IDE.
         */
        export class PluginReactDOM extends ReactDOM {
            constructor(options?: ReactDOMOptions);
        }

        export class NodeRefInput extends gui.Label {
            protected _c1: gui.Controller;
            protected _value: IMyNode;
            protected _editable: boolean;
            protected _btnSelect: gui.Widget;
            protected _titleObject: gui.Widget;
            protected _typeFilter: string[];
            protected _prompText: string;
            constructor();
            get value(): IMyNode;
            set value(value: IMyNode);
            get typeName(): string;
            set typeName(value: string);
            get typeFilter(): string[];
            set typeFilter(value: string[]);
            setValue(data: any): Promise<void>;
            get editable(): boolean;
            set editable(value: boolean);
            private refresh;
            onConstruct(): void;
            private __focusIn;
            private __focusOut;
            private onDragOver;
            private onDrop;
            protected __click(evt: gui.Event): Promise<void>;
            private onHotkey;
            private submit;
        }

        export class NumericInput extends gui.Label {
            /**
             * Minimum value. Default is -Infinity.
             */
            min: number;
            /**
             * Maximum value. Default is Infinity.
             */
            max: number;
            private _value;
            private _holder;
            private _lastHolderPos;
            private _textField;
            private _lastScroll;
            private _fractionDigits;
            private _step;
            private _suffix;
            private _prevTabStop;
            private _savedText;
            private _isPointerLocked;
            private _onPointerMoveHandler;
            private _accumulatedMovement;
            private _enablePointerLock;
            constructor();
            /**
             * Number of decimal places. Default is 3;
             */
            get fractionDigits(): number;
            set fractionDigits(value: number);
            /**
             * The amount by which the value changes each time when changing the value by dragging. Default is 0.01.
             *
             * If fractionDigits is set, the step will be adjusted to 1 / 10 ^ fractionDigits if it is less than that value.
             */
            get step(): number;
            set step(value: number);
            /**
             * Whether the input is editable. Default is true.
             */
            get editable(): boolean;
            set editable(value: boolean);
            /**
             * The suffix of the number. Default is "". For example, if the suffix is "%", the displayed value will be "100%".
             */
            get suffix(): string;
            set suffix(value: string);
            /**
             * Whether to enable pointer lock when dragging. Default is true.
             * When enabled, the mouse cursor will be locked and hidden during dragging for better UX.
             */
            get enablePointerLock(): boolean;
            set enablePointerLock(value: boolean);
            get value(): number;
            set value(val: number);
            get text(): string;
            set text(value: string);
            onConstruct(): void;
            private __onKeydown;
            private _holderDragStart;
            private _holderDragEnd;
            private _holderDragMove;
            private _handlePointerMove;
            private __click;
            private __focusIn;
            private __focusOut;
            private __onSubmit;
            private __mouseWheel;
        }

        export class NumericInputWithSlider extends gui.Label {
            private _slider;
            private _input;
            private _centeredAtOne;
            constructor();
            get min(): number;
            set min(value: number);
            get max(): number;
            set max(value: number);
            /**
             * If true, the center of the slider represents the value 1.0, with the left side representing values between min and 1.0,
             * and the right side representing values between 1.0 and max.
             */
            get centeredAtOne(): boolean;
            set centeredAtOne(value: boolean);
            get fractionDigits(): number;
            set fractionDigits(value: number);
            get step(): number;
            set step(value: number);
            get editable(): boolean;
            set editable(value: boolean);
            get suffix(): string;
            set suffix(value: string);
            get value(): number;
            set value(value: number);
            get text(): string;
            set text(value: string);
            onConstruct(): void;
            private syncInputToSlider;
        }

        export class ResourceInput extends gui.Label {
            protected _text: string;
            protected _c1: gui.Controller;
            protected _asset: IAssetInfo;
            protected _editable: boolean;
            protected _btnSelect: gui.Widget;
            protected _typeFilter: Array<AssetType | string>;
            protected _promtText: string;
            protected _titleObject: gui.Widget;
            /**
             * Whether to allow internal assets. Default is true.
             */
            allowInternalAssets: boolean;
            /**
             * Whether to allow internal GUI assets. Default is false.
             */
            allowInternalGUIAssets: boolean;
            /**
             * The filter needs to be registered through EditorEnv.assetMgr.customAssetFilters.
             */
            customFilter: string;
            constructor();
            get text(): string;
            set text(value: string);
            private setAssetId;
            get assetValue(): IAssetInfo;
            set assetValue(value: IAssetInfo);
            get editable(): boolean;
            set editable(value: boolean);
            /**
             * Multiple asset types are separated by commas, such as "Image,Audio". Refer to IEditor.AssetType for available values.
             */
            get typeFilter(): Array<AssetType | string>;
            set typeFilter(value: Array<AssetType | string>);
            hasTypeFilter(type: AssetType): boolean;
            private refresh;
            onConstruct(): void;
            private __focusIn;
            private __focusOut;
            private onDragOver;
            private onDrop;
            protected __click(evt: gui.Event): void;
            protected __rightClick(evt: gui.Event): Promise<void>;
            private onHotkey;
            private submit;
            copy(): void;
            paste(): Promise<void>;
            private cloneMaterial;
        }

        export class ColorInput extends gui.Widget {
            private _colorValue;
            private _color;
            private _color2;
            private _shapeColor;
            private _shapeAlpha;
            private _hasValue;
            private _checkable;
            /**
             * Whether to hide the alpha channel. Default is false.
             */
            hideAlpha: boolean;
            constructor();
            /**
             * The color value. The returned value is a reference to the internal object, so it is forbidden to modify it.
             */
            get colorValue(): gui.Color;
            set colorValue(value: gui.Color);
            /**
             * Show a check box to control whether the color value is null. Default is false.
             */
            get checkable(): boolean;
            set checkable(value: boolean);
            /**
             * Whether the null value check box is selected.
             */
            get hasValue(): boolean;
            set hasValue(value: boolean);
            private drawColor;
            onConstruct(): void;
            private onClickShape;
        }

        export class GradientInput extends gui.Widget {
            private _gradientValue;
            private _shape;
            private _hasValue;
            private _checkable;
            lockMode: number;
            hideAlpha: boolean;
            constructor();
            get value(): GradientValue;
            set value(value: GradientValue);
            get checkable(): boolean;
            set checkable(value: boolean);
            get hasValue(): boolean;
            set hasValue(value: boolean);
            onConstruct(): void;
            private getDialogOptions;
        }

        export interface GradientRGBElement {
            pos: number;
            color: gui.Color;
        }
        export interface GradientAlphaElement {
            pos: number;
            alpha: number;
        }
        export class GradientValue {
            mode: number;
            rgbElements: Array<GradientRGBElement>;
            rgbCount: number;
            alphaElements: Array<GradientAlphaElement>;
            alphaCount: number;
            maxColorNum: number;
            maxAlphaNum: number;
            constructor();
            toData(value?: any): any;
            fromData(value: any): void;
            initDefault(): void;
            cloneTo(target: GradientValue): void;
        }

        export class CurveInput extends gui.Widget {
            private _canvas;
            private _hasValue;
            private _checkable;
            private _points;
            private _curPoints;
            private _path;
            curveMin: number;
            curveMax: number;
            maxValue: number;
            minValue: number;
            /**
             * Whether to normalize the curve data
             */
            isNormalization: boolean;
            maxKeyFrame: number;
            isCurve: boolean;
            isWeight: boolean;
            hideAlpha: boolean;
            constructor();
            get checkable(): boolean;
            set checkable(value: boolean);
            get hasValue(): boolean;
            set hasValue(value: boolean);
            get points(): ReadonlyArray<PathPoint>;
            clearPoints(): void;
            addPoint(): PathPoint;
            setDefaultPoints(): void;
            applyChange(): void;
            private drawCurve;
            onConstruct(): void;
            private createDialogModel;
            private commitDialogModel;
        }

        export enum TangentMode {
            Free = 0,
            Linear = 1,
            Constant = 2
        }
        export class PathPoint {
            px: number;
            py: number;
            c0x: number;
            c0y: number;
            c1x: number;
            c1y: number;
            inTangent: number;
            outTangent: number;
            inWeight: number;
            outWeight: number;
            smooth: boolean;
            inTangentMode: TangentMode;
            outTangentMode: TangentMode;
            cloneTo(pt: PathPoint): PathPoint;
            setInTangentLinear(prev: PathPoint): void;
            setOutTangentLinear(next: PathPoint): void;
            makeSmooth(baseIn: boolean): void;
        }

        export class EditableListItem extends ListItem {
            toggleClickCount: number;
            _input: ListItemInput;
            _justGotFocus: boolean;
            _titleObj: gui.TextField;
            private _savedScrollPos;
            constructor();
            get editable(): boolean;
            set editable(value: boolean);
            get textForEdit(): string;
            set textForEdit(value: string);
            get editWithoutFileExt(): boolean;
            set editWithoutFileExt(value: boolean);
            startEditing(): void;
            cancelEditing(): void;
            onConstruct(): void;
            protected onNativeDragStart(evt: gui.Event): void;
            private onClickHandler;
            getFullWidth(): number;
        }

        export class EditableTreeItem extends EditableListItem {
        }

        export class ListItem extends gui.Button {
            private _selectionBar;
            constructor();
            onConstruct(): void;
        }

        export class ListItemInput extends gui.Label {
            toggleClickCount: number;
            textForEdit?: string;
            editWithoutFileExt?: boolean;
            private _c1;
            private _input;
            private _savedText;
            private _savedFileExt;
            private _prevTabStop;
            constructor();
            get editable(): boolean;
            set editable(value: boolean);
            get editing(): boolean;
            startEditing(): void;
            cancelEditing(): void;
            onConstruct(): void;
            private onFocusInHandler;
            private onClickHandler;
            private onFocusOutHandler;
            private onKeydown;
        }

        export class TextInput extends gui.Label {
            protected _savedText: string;
            protected _textField: gui.TextInput;
            protected _clear: gui.Widget;
            protected _lang: gui.Widget;
            protected _key: gui.TextField;
            protected _textInfo: gui.I18nTextInfo;
            private _canceled;
            get text(): string;
            set text(value: string);
            get editable(): boolean;
            set editable(value: boolean);
            onConstruct(): void;
            private __keyDown;
            private __focusIn;
            private __focusOut;
            private __textChanged;
            private __clickClear;
            private __clickLang;
            private __clickLangRemove;
        }

        export class TextArea extends gui.Label {
            private _savedText;
            private _textField;
            private _lang;
            private _key;
            private _textInfo;
            get editable(): boolean;
            set editable(value: boolean);
            get text(): string;
            set text(value: string);
            onConstruct(): void;
            private __keyDown;
            private __focusIn;
            private __focusOut;
            private __clickLang;
            private __clickLangRemove;
        }

        export class SearchInput extends TextInput {
            resultList: gui.List;
            onConstruct(): void;
        }

        export class ModalProgress extends gui.Label {
            titleObj: gui.TextField;
            progressBar: gui.ProgressBar;
            cancelButton: gui.Button;
            onConstruct(): void;
            show(parent: gui.Widget): void;
        }

        export class InspectorPanel extends gui.Widget {
            private _model;
            private _react;
            constructor();
            /**
             * Whether to allow undo. If true, the history will be recorded and can be undone.
             * The data pass in through inspect method must be watched by DataWatcher, Otherwise, the undo will not work for those changes.
             */
            get allowUndo(): boolean;
            set allowUndo(value: boolean);
            /**
             * Whether to stop tracing data changes. If true, the data change notification will not be sent.
             */
            get stopTrace(): boolean;
            set stopTrace(value: boolean);
            /**
             * A delegate that is called when the data changes.
             */
            get onDataChanged(): IDelegate<(sender: any, datapath: string[], value: any, oldvalue: any) => void>;
            /**
             * Data history. It is used to record the data changes and can be undone.
             */
            get history(): IDataHistory;
            /**
             * Set the history used by this inspector for undo and redo.
             */
            setHistory(history: IDataHistory): void;
            /**
             * Clear all inspectors and reset the inspector panel.
             */
            resetInspectors(): void;
            /**
             * Reset data to default values. This method will reset all inspectors to their default values.
             */
            resetDefault(): void;
            /**
             * Add an inspector to the inspector panel. The inspector will be used to inspect the data.
             * @param data The data to inspect.
             * @param type The type of the data. It can be a string, a type descriptor, or a class which is registered using IEditor.regClass.
             * @param options The options for the inspector. It can be used to set the catalog bar style, whether to show the catalog bar, etc.
             */
            inspect(data: any, type: string | FTypeDescriptor | Function, options?: IInspectorOptions): void;
            /**
             * Get all inspectors.
             * @returns An array of inspectors.
             */
            getInspectors(): ReadonlyArray<IDataInspector>;
            /**
             * Scroll the panel to ensure the specified catalog is visible.
             * @param catalog Catalog name.
             */
            showCatalog(catalog: string): void;
            /** Returns the current vertical scroll position. */
            getScrollY(): number;
            /** Sets the vertical scroll position. */
            setScrollY(value: number): void;
            /**
             * Resize the panel to fit the content. It will resize the panel to fit the content height, and keep the width unchanged.
             * @param minSize The minimum height of the panel. If the content height is less than the minimum height, the panel will be resized to the minimum height.
             */
            resizeToFit(minSize?: number): void;
            private onHotkey;
        }

        export enum FieldStatusFlags {
            Hidden = 0,
            Hidden_UserCall = 1,
            Hidden_MultipleTypes = 2,
            Hidden_MultipleObjects = 3,
            Hidden_NullObject = 4,
            Hidden_Tab = 5,
            Readonly = 6,
            Readonly2 = 7,
            _Max = 8
        }

        export interface IPropertyFieldState {
            owner: IInspectorModel;
            id: string;
            schemaId: string;
            kind: InspectorFieldKind;
            depth: number;
            path: string[];
            caption: string;
            help: string;
            icon?: string;
            visible: boolean;
            readonly: boolean;
            expanded: boolean;
            overrided: boolean;
            version: number;
            structureVersion: number;
            createInitialized?: boolean;
            createFailed?: boolean;
            host?: gui.Widget;
            content?: gui.Widget;
            element?: HTMLElement;
            errorElement?: HTMLElement;
            pendingError?: string;
            pendingScroll?: {
                ani?: boolean;
                setFirst?: boolean | IPropertyField;
            };
            styles?: string;
        }
        export class PropertyField implements IPropertyField {
            inspector: IDataInspector;
            objType: Readonly<FTypeDescriptor>;
            property: Readonly<FPropertyDescriptor>;
            target: IInspectingTarget;
            react?: IPropertyFieldState;
            readonly children: PropertyField[];
            watchProps: Array<string>;
            memberProps: Array<FPropertyDescriptor>;
            tag: string;
            private _parent;
            get parent(): IPropertyField;
            get isFolder(): boolean;
            addChild(child: PropertyField): PropertyField;
            replaceChild(oldChild: PropertyField, newChild: PropertyField): PropertyField;
            removeChild(child: PropertyField): PropertyField;
            create(): IPropertyFieldCreateResult;
            render?(): ReactNode;
            renderChildrenFooter?(): ReactNode;
            makeReadonly(value: boolean): void;
            refresh(): void;
            getStatus(name: string): any;
            setStatus(name: string, value: any): void;
            setHidden(hidden: boolean): void;
            onNativeDragOver?(evt: gui.Event): void;
            onNativeDrop?(evt: gui.Event): void;
            onResetData?(): void;
            isFlagSet(flag: number): boolean;
            findBrotherField(name: string): IPropertyField;
            findChildField(name: string): IPropertyField;
            getChildFields(result?: Array<IPropertyField>): Array<IPropertyField>;
            displayError(msg: string): void;
            private doCopyData;
            private doPasteData;
            private doResetData;
            copyData(): void;
            pasteData(data?: any): Promise<void>;
            resetData(): Promise<void>;
            private fetchScriptDefaults;
            setNumValue(num: number): void;
            hasClipboardData(): Promise<boolean>;
        }

        export class EnumField extends PropertyField {
            create(): IPropertyFieldCreateResult;
            refresh(): void;
            render(): import("react/jsx-runtime").JSX.Element;
            /**
             * Resolves the enum source displayed by this field.
             * Override this method to provide enum items dynamically.
             * @returns The resolved enum items.
             */
            protected resolveEnumSource(): unknown[];
            private resolveEnumSourceFor;
            /**
             * Resolves the value represented by an enum source item.
             * @param item The enum source item.
             * @param index The index of the item in the resolved enum source.
             * @returns The value submitted when the item is selected.
             */
            protected getEnumItemValue(item: unknown, index: number): any;
            private formatEnumItems;
            private formatEnumItemsFor;
            private getEnumItemValueFor;
            private isEnumObject;
            private createEnumItem;
            private isSelectedValue;
            private toSubmitValue;
        }

        export type DictionaryModelField = PropertyField & {
            id: string;
            kind: string;
            expanded: boolean;
            children: PropertyField[];
            getCollectionLength(): number;
            canAppendChild(): boolean;
            addDictionaryEntry(key: string): boolean;
            destroyCollection(): boolean;
            syncDynamicChildren(): boolean;
        };
        export class DictionaryField extends PropertyField {
            private _dynamicPool;
            create(): IPropertyFieldCreateResult;
            refresh(): void;
            refreshChildren(): void;
            render(): React.ReactNode;
            /**
             * Provides the initial key shown when adding a dictionary entry.
             * @param _field The dictionary field being edited.
             * @returns The initial key, or an empty string when no key is suggested.
             */
            protected getInitialKey(_field: DictionaryModelField): string;
            /**
             * Creates a custom add control for the dictionary toolbar.
             * @param _field The dictionary field being edited.
             * @returns The custom control, or `null` to use the built-in add button.
             */
            protected getCustomAddButton(_field: DictionaryModelField): ReactNode;
            addDictionaryEntry(key: string): boolean;
            deleteDictionaryEntry(key: string): boolean;
            canAppendChild(): boolean;
            destroyCollection(): boolean;
            getCollectionLength(): number;
            syncDynamicChildren(): boolean;
            private refreshDynamicChild;
            private clearDynamicChildren;
            /**
             * Resolves the caption displayed for a dictionary entry.
             * @param key The dictionary entry key.
             * @returns The entry caption.
             */
            protected getElementCaption(key: string): string;
            /**
             * Resolves the help text displayed for a dictionary entry.
             * @param key The dictionary entry key.
             * @returns The entry help text.
             */
            protected getElementTips(key: string): string;
            private takeDynamicChild;
        }

        export class ArrayField extends PropertyField {
            private _dynamicPool;
            create(): IPropertyFieldCreateResult;
            refresh(): void;
            refreshChildren(): void;
            render(): React.ReactNode;
            renderChildrenFooter(): ReactNode;
            /**
             * Renders subclass-specific controls alongside the built-in collection toolbar controls.
             * Override this method instead of render() to preserve the standard collection behavior and layout.
             */
            protected renderExtraToolbarButtons(): ReactNode;
            /**
             * Handles a request to append an element to the array.
             * Override this method to provide a custom value picker or add workflow.
             * @param anchor The add button used to anchor any related UI.
             */
            protected onAddElement(anchor: HTMLElement): void | Promise<void>;
            appendArrayElement(): boolean;
            insertArrayElement(index?: number, elementValue?: unknown, elementPropOverride?: FPropertyDescriptor): boolean;
            moveArrayElement(fromIndex: number, toIndex: number): boolean;
            deleteArrayElement(index: number): boolean;
            canAppendChild(): boolean;
            destroyCollection(): boolean;
            getCollectionLength(): number;
            syncDynamicChildren(): boolean;
            private refreshDynamicChild;
            private clearDynamicChildren;
            /**
             * Resolves the caption displayed for an array element.
             * @param index The array element index.
             * @returns The element caption.
             */
            protected getElementCaption(index: number): string;
            /**
             * Resolves the help text displayed for an array element.
             * @param index The array element index.
             * @returns The element help text.
             */
            protected getElementTips(index: number): string;
            private takeDynamicChild;
        }

        export class ObjectField extends PropertyField {
            selfType: FTypeDescriptor;
            selfTypeBase: FTypeDescriptor;
            private _activeField;
            private _objectTypeName;
            create(): IPropertyFieldCreateResult;
            refresh(): void;
            refreshChildren(): void;
            render(): React.ReactNode;
            /**
             * Renders subclass-specific controls alongside the built-in object toolbar controls.
             * Override this method instead of render() to preserve the standard object behavior and layout.
             */
            protected renderExtraToolbarButtons(): React.ReactNode;
            showObjectActionMenu(field: PropertyField, anchor: HTMLElement): void;
            onClickCreateInstance(typeName: string): void;
            private syncObjectChildren;
            private getObjectTypeName;
            private clearObjectChildren;
            private getDefaultObjectMenu;
            onClickSetNull(): void;
        }

        export class InfoField extends PropertyField {
            create(): IPropertyFieldCreateResult;
            refresh(): void;
            render(): React.ReactNode;
            /**
             * Resolves the informational text displayed by this field.
             * Override this method to provide text from a custom source.
             * @returns The informational text, or an empty string to hide the field.
             */
            protected getInfoText(): string;
            private getInfoIcon;
        }

        export class ButtonsField extends PropertyField {
            create(): IPropertyFieldCreateResult;
            render(): React.ReactNode;
            getButtons(): IPropertyButtonInfo[];
            runButton(button: IPropertyButtonInfo, index?: number, element?: HTMLElement): Promise<void>;
            getButtonSelected(button: IPropertyButtonInfo): boolean;
            private toggleButton;
            /**
             * Handles the custom event configured for a property button.
             * Override this method to route button events to a custom target.
             * @param button The button descriptor whose event is being dispatched.
             * @param element The HTML button element that initiated the event.
             * @returns Whether the event was handled.
             */
            protected handleButtonEvent(button: IPropertyButtonInfo, element?: HTMLElement): Promise<boolean>;
        }

        export class VecField extends PropertyField {
            create(): IPropertyFieldCreateResult;
            render(): import("react/jsx-runtime").JSX.Element;
            private getAxisTitle;
            private getVectorSize;
            private getAxes;
            private getAxisValue;
            private setAxisValue;
            private setMemberValue;
            private setStringValue;
            private setStructuredValue;
            private setHasValue;
        }

        export class FileInspectorLayout implements IInspectorLayout {
            protected _type: string | Function;
            protected _assets: ReadonlyArray<IAssetInfo>;
            protected _components: Array<IDataComponent>;
            /**
             * Whether to eliminate default values. Default is false. If true, a value that is equal to the default value will not be written to the file.
             */
            protected _eliminateDefaults: boolean;
            /**
             * Write "_$type" field in the object. Default is false.
             */
            protected _writeType: boolean;
            constructor(type: string | Function);
            accept(asset: IAssetInfo): boolean;
            onApply(): Promise<void>;
            onRender(assets: ReadonlyArray<IAssetInfo>, inspectors: IInspectorHelper, outTracables: Array<any>): Promise<void>;
            protected readFile(asset: IAssetInfo): Promise<IDataComponent>;
            protected writeFile(asset: IAssetInfo, dc: IDataComponent): Promise<void>;
        }

        export class MetaDataInspectorLayout implements IInspectorLayout {
            protected _type: string | Function;
            protected _assets: ReadonlyArray<IAssetInfo>;
            protected _components: Array<IDataComponent>;
            protected _sectionName: string;
            /**
             * @param type The type of the data component.
             * @param sectionName The name of the section in the meta file. Default is "importer", meaning that the import configuration of the asset.
             */
            constructor(type: string | Function, sectionName?: string);
            accept(asset: IAssetInfo): boolean;
            onApply(): Promise<void>;
            onRender(assets: ReadonlyArray<IAssetInfo>, inspectors: IInspectorHelper, outTracables: Array<any>): Promise<void>;
            protected readMeta(asset: IAssetInfo): Promise<IDataComponent>;
            protected writeMeta(asset: IAssetInfo, dc: IDataComponent): Promise<void>;
        }

        export class ResourceInspectorLayout implements IInspectorLayout {
            accept(asset: IAssetInfo): boolean;
            onRender(assets: ReadonlyArray<IAssetInfo>, inspectors: IInspectorHelper): Promise<void>;
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

        export class ShaderWatcher extends gui.Component {
            private _shaderName;
            private _shaderInfo;
            private _asset;
            private _assetVer;
            private _assetId;
            callback: () => void;
            subscribe(shaderName: string): void;
            unsubscribe(): void;
            private setShaderInfo;
            onDisable(): void;
            onUpdate(): void;
        }


        /**
         * The `DataWatcher` class is used to monitor changes to the specified object.
         */
        const DataWatcher: typeof IDataWatcher;

        /**
         * The `DataHistory` class is used to manage the history of the specified object.
         * 
         * It is used to implement undo and redo functionality. When the data changes, call the addChange method to add a new history record, and then you can use the undo and redo methods to perform undo and redo operations.
         * @param versionTracker The version tracker. It is optional.
         * @param maxItems The maximum number of items to store in the history. Defaults to 100.
         */
        const DataHistory: new (versionTracker?: IVersionTracker, maxItems?: number) => IDataHistory;

        /**
         * The `ClassRegistry` class is used to register class names and class mappings.
         */
        const ClassRegistry: typeof IClassRegistry;

        /**
         * @deprecated
         * The `ListHelper` class is used to help manage lists.
         * @param list The list to manage.
         * @param indexColumn The column name of the index.
         */
        const ListHelper: new (list: gui.List, indexColumn?: string) => IListHelper;

        /**
         * @deprecated
         * The `ListInsertionHelper` class is used to help insert items into the list.
         * 
         * This class can highlight the insertion position when a scene node or asset is dragged and dropped into the list, 
         * and emit notification events after the drag-and-drop operation is completed.
         * @param owner The owner of the list.
         * @param transferType The type of the item to be inserted. e.g. "node", "asset", etc.
         * @returns The helper object.
         */
        const ListInsertionHelper: new (owner: gui.List, transferType: string) => IListInsertionHelper;

        /**
         * The `DataInspector` class is used to inspect the data of the specified type.
         * @param outputType The type of the data to inspect.
         * @returns The inspector object.
         */
        const DataInspector: new (outputType: string) => IDataInspector;

        /**
         * The `InspectorHelper` class is used to help create inspector interfaces.
         */
        const InspectorHelper: new () => IInspectorHelper;

        /**
         * The `Menu` class is used to create custom menu items.
         */
        const Menu: typeof MenuStatic;

        /**
         * The `Webview` class is used to create a webview.
         * 
         * A webview is a web page embedded in the editor, which can be used to display web pages.
         * 
         * The webview runs in a separate process, and this class encapsulates a series of communication methods for ease of use.
         * 
         * @param backgroundThrottling Whether to enable background throttling. Defaults to true.
         * @param nodeintegration Whether to enable node integration. Defaults to false.
         */
        const Webview: new (backgroundThrottling?: boolean, nodeintegration?: boolean) => IWebview;

        /**
         * The `WebIFrame` class is used to create an iframe.
         * 
         * An iframe is an inline frame that can be used to embed another document within the current HTML document.
         */
        const WebIFrame: new (options?: IWebIFrameOptions) => IWebIFrame;

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
         * The `AssetStoreTools` class is used to manage asset store tools.
         */
        const AssetStoreTools: typeof IAssetStoreTools;

        /**
         * The `EventTracking` class is used to track events.
         * @param appId The application ID.
         * @param pageShow Whether to track the page show event. Defaults to true.
         * @param pageHide Whether to track the page hide event. Defaults to true.
         * @param showLog Whether to show log information. Defaults to false.
         */
        const EventTracking: new (appId: string, pageShow?: boolean, pageHide?: boolean, showLog?: boolean) => IEventTracking;

        /**
         * The `AbortToken` class is used to create an abort token.
         * Abort tokens are used to cancel asynchronous operations.
         * @see IAbortToken
         */
        const AbortToken: new () => IAbortToken;

        /**
         * The `BuildTask` class is used to start a build task.
         * @param platform The platform to build. e.g. "web", "android", "ios", etc.
         * @param destPath The destination path of the build. Defaults to null.
         * @param recompileMode Whether to run in recompile mode, where only scripts are built and assets are not exported.
         */
        const BuildTask: { start(platform: string, destPath?: string, recompileMode?: boolean): void };

        /**
         * The `DataComponent` class is used to create a data component.
         * @param type The type of the data component.
         * @param data The data of the component.
         * @param noInitialLoading Whether to skip the initial loading of data. Defaults to false.
         * @param hasTypeField Whether the object includes a type field, ie. "_$type". Defaults to false.
         * @example
         * ```
         * ＠IEditor.regClass()
         * class TestDataComponent {
         *     private _name: string;
         * 
         *     ＠IEditor.property(String)
         *     get name() {
         *        return this._name;
         *    }
         * 
         *     set name(value: string) {
         *        console.log("Set name: " + value);
         *        this._name = value;
         *     }
         * }
         * 
         * let dc = new IEditor.DataComponent(TestDataComponent);
         * dc.props.name = "Test"; //Output: Set name: Test
         * ```
         */
        const DataComponent: new (type: string | Function, data?: any, noInitialLoading?: boolean, hasTypeField?: boolean) => IDataComponent;

        /**
         * The `InspectorRegistry` class is used to register inspector fields.
         */
        const InspectorRegistry: typeof IInspectorRegistry;

        /**
         * The `Render3DCanvas` class is a custom widget type for displaying 3D content which is rendered in the scene process and transferred to a canvas in the UI process.
         */
        const Render3DCanvas: new () => IRender3DCanvas;

        /**
         * The `SelectResourceDialog` class is used to create a dialog for selecting resources.
         */
        const SelectResourceDialog: new () => ISelectResourceDialog;

        /**
         * The `SelectNodeDialog` class is used to create a dialog for selecting nodes.
         */
        const SelectNodeDialog: new () => ISelectNodeDialog;

        /**
         * The React `ColorPickerDialog` class is used to create a color picker dialog.
         */
        const ColorPickerDialog: new () => IColorPickerDialog;

        /**
         * The React `GradientEditDialog` class is used to edit gradients.
         */
        const GradientEditDialog: new () => IGradientEditDialog;

        /**
         * The React `CurveEditDialog` class is used to edit curves.
         */
        const CurveEditDialog: new () => ICurveEditDialog;

        /**
         * The React `PolygonEditDialog` class is used to edit polygons.
         */
        const PolygonEditDialog: new () => IDialog;

        /**
         * The `InputTextDialog` class is used to create a dialog for entering text.
         * @example
         * ```
         * let dialog = await Editor.getDialog(IEditor.InputTextDialog);
         * await dialog.show(null, "title", "text");
         * let text = await dialog.getResult();
         * console.log(text);
         * ```
         */
        const InputTextDialog: new () => IInputTextDialog;

        /**
         * The `QRCodeDialog` class is used to create a dialog for displaying a QR code.
         */
        const QRCodeDialog: new () => IQRCodeDialog;

        /**
         * The `AddModulesDialog` class is used to create a dialog for adding modules.
         */
        const AddModulesDialog: new () => IAddModulesDialog;
        /**
         * The `utils` object provides various utility functions.
        */
        const utils: ICryptoUtils & INativeTools & IUUIDUtils & IObjectUtils & IUtils & IPinyinUtils & INetUtils & IDataUtils & ITemplateUtils & IPlist & ITypeParser;

        /**
         * The `GUIUtils` object provides various GUI utility functions.
         */
        const GUIUtils: IGUIUtils;

        /**
         * The `SerializeUtil` class is used to serialize and deserialize objects.
         */
        const SerializeUtil: typeof ISerializeUtil;

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

        /** Tools for importing and exporting Laya resource packages. */
        const PackageTool: typeof IPackageTool;

        /**
         * The `React` namespace contains React components that can be used in the editor.
         */
        const React: typeof ReactComponents;

        /**
         * The shared graph editing core (React Flow based). Values are accessed
         * as `IEditor.Flow.GraphEditor`, `IEditor.Flow.createGraphStore`, etc.
         * The corresponding types live under {@link IFlow} (e.g.
         * `IEditor.IFlow.GraphData`, `IEditor.IFlow.GraphEditorProps`).
         */
        const Flow: typeof IFlow;

        /**
         * The shared *state-machine* graph editor (pinless, straight links with
         * a mid-line arrow). Values are accessed as
         * `IEditor.StateGraph.StateGraphEditor`, `IEditor.StateGraph.styles`, etc.
         * The corresponding types live under {@link IStateGraph}.
         */
        const StateGraph: typeof IStateGraph;

        /**
         * Shared high-performance timeline editor. Runtime values are available
         * as `IEditor.Timeline.TimelineEditor` and `styles`;
         * types live under {@link ITimeline}.
         */
        const Timeline: typeof ITimeline;

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
         *     ＠IEditor.onLoad
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
         *     ＠IEditor.onUnload
         *     static onUnload() {
         *        console.log("Cleanup function called.");
         *     }
         * }
         * ```
         */
        function onUnload(target: Object, propertyName: string): void;

        /**
         * Decorator function for registering a class. The registered class can be used to automatically generate the editor interface and can be used for serialization.
         * @returns The class decorator function.
         * @example
         * ```
         * ＠IEditor.regClass()
         * class MyClass {
         *     constructor() {
         *         console.log("Class created.");
         *     }
         * }
         * ```
         */
        function regClass(): Function;

        /**
         * Decorator function for set class information. 
         * 
         * It needs to be used in conjunction with regClass.
         * @param info The class information.
         * @example
         * ```
         * ＠IEditor.regClass()
         * ＠IEditor.classInfo({ menu: "MenuItemName", icon: "editorResources/MyClass.svg" })
         * class MyClass {
         *     constructor() {
         *         console.log("Class created.");
         *     }
         * }
         * ```
         */
        function classInfo(info?: Partial<FTypeDescriptor>): Function;

        type FPropertyTypeExt = string | Function | [FPropertyTypeExt] | ["Record", FPropertyTypeExt];

        /**
         * Decorator function for registering a property. 
         * 
         * 'property' is the way a class exposes properties to the editor. The editor will generate the corresponding editor interface based on the type and configuration of the property.
         * During serialization, the property will be serialized into the corresponding field.
         * 
         * It needs to be used in conjunction with regClass.
         * @param info The property information.
         * @returns The property decorator function.
         * @example
         * ```
         * ＠IEditor.regClass()
         * class MyClass {
         *     ＠IEditor.property({ type: Number, caption: "Number" })
         *     num: number = 0;
         * 
         *     ＠IEditor.property(String)
         *     str: string = "";
         * 
         *     ＠IEditor.property([Number])
         *     arr: number[] = [];
         * 
         *     ＠IEditor.property(["Record", String])
         *     map: Record<string, string> = {};
         * 
         *     ＠IEditor.property(AEnumClass)
         *     enum: AEnumClass = AEnumClass.A;
         * 
         *     ＠IEditor.property({ type: String, enumSource: ["A", "B", "C"] })
         *     enumIndex: number = 0;
         * 
         *     ＠IEditor.property({ type: String, enumSource: [ { name: "A", value: "a" }, { name: "B", value: "b" } ] })
         *     enumName: string = "a";
         * 
         *    ＠IEditor.property({ type: CustomClass }) //CustomClass must have been registered using IEditor.regClass()
         *    custom: CustomClass = new CustomClass();
         * }
         * ```
         */
        function property(info: FPropertyType | Function | Partial<FPropertyDescriptor | { type: FPropertyTypeExt }>): Function;

        /**
         * Decorator function for registering a field. 
         * 
         * A Field is the smallest organizational unit of the inspector interface. Each field is used for the input of one or multiple properties. It is usually displayed as a single line, but it can also be a complex custom interface.
         * @param name The name of the field. The name is used to identify the field and is unique within the entire runtime.
         * @returns The field decorator function.
         * @example
         * ```
         * //FieldExample.ts
         * ＠IEditor.inspectorField("com.example.MyField")
         * class MyField extends PropertyField {
         *     create() {
         *         let ui = IEditor.GUIUtils.createTextInput();
         *         ui.on("submit", () => {
         *             this.target.setValue(ui.text);
         *         });
         *         return { ui };
         *     }
         * 
         *     refresh() {
         *        this.ui.text = this.target.getValue();
         *     }
         * }
         * ```
         * 
         * ```
         * //MyScript.ts
         * ＠Laya.regClass()
         * export class MyScript extends Laya.Script {
         *     ＠IEditor.property({ type: String, inspector: "com.example.MyField" })
         *     text: string;
         * }
         * ```
         */
        function inspectorField(name: string): (func: IPropertyFieldConstructor) => void;

        /**
         * Decorator function for registering a inspector layout.
         * 
         * An inspector layout is a management class responsible for reading data and organizing the rendering of the Inspector interface.
         * And it has an optional implementation of the onApply method, which is used to perform some actions when applied, such as saving data.
         * @param type The type of the target，e.g. "node", "asset".
         * @param displayOrder The display order of the layout. The smaller the value, The display position is more forward. Defaults to 100.
         * @returns The layout decorator function.
         * @example
         * ```
         * ＠IEditor.regClass()
         * class DataType {
         *     ＠IEditor.property(String)
         *     name: string = "";
         *
         *     ＠IEditor.property(Number)
         *     age: number = 18;
         *
         *     ＠IEditor.property(Number)
         *     gender: number = 1;
         * }
         * 
         * ＠IEditor.inspectorLayout("asset")
         * export class DemoInspectorLayout extends IEditor.ResourceInspectorLayout {
         *     constructor() {
         *         super(DataType);
         *     }
         * 
         *     accept(asset: IEditor.IAssetInfo) {
         *         return asset.ext == "abc";
         *     }
         * }
         * ```
         */
        function inspectorLayout(type: string, displayOrder?: number): (func: new () => IInspectorLayout) => void;

        /**
         * Decorator function for registering a panel.
         * 
         * A panel is a floating window that can be docked in the editor interface.
         * @param id The identifier of the panel. The identifier is used to identify the panel and is unique within the entire runtime.
         * @param options The options for the panel.
         * @returns The panel decorator function.
         * @example
         * ```
         * ＠IEditor.panel("com.example.MyPanel", { title: "My Panel", icon: "editorResources/MyPanel.svg" })
         * class MyPanel extends IEditor.EditorPanel {
         *     private view: IEditor.ReactDOM;
         *
         *     create() {
         *         this.view = new IEditor.ReactDOM();
         *         this._panel = this.view;
         *         this.view.render(IEditor.React.createElement("div", null, "My Panel"));
         *     }
         *
         *     onDestroy() {
         *         this.view.dispose();
         *     }
         * }
         * ```
         */
        function panel(id: string, options?: IPanelOptions): (func: new () => EditorPanel) => void;

        /**
         * Decorator function for registering a menu.
         * @param name menu item name of path. Paths are separated by "/", "App/tool/test" represents the test item under the tool submenu of the App menu. 
         * 
         * Note that the path here uses IDs, not the text displayed in the menu. All menu names and their submenus supported by the editor can be printed out for reference using the menu Developer > Print All Menu IDs.
         * 
         * i18n is supported in the menu name, and the format is `i18n:xxx`, where `xxx` is the key of the i18n string.
         * e.g. `App/tool/i18n:module:test`.
         * Note that a string with or without `i18n:` prefix is treated as the same menu item name.
         * e.g. `App/tool/i18n:module:group/a` and `App/tool/group/a` will be in the same submenu.
         * @param options The options for the menu.
         * @returns The menu decorator function.
         * @example
         * ```
         * ＠IEditor.menu("App/tool/test")
         * function onTest() {
         *    console.log("Test menu item clicked.");
         * }
         * ```
         */
        function menu(name: string, options?: ICustomMenuItemOptions): Function;

        /**
         * Decorator function for registering a hotkey.
         * 
         * A hotkey is a combination of keys that can trigger a specific function when pressed.
         * @param combo The key combination of the hotkey. The format is "ctrl+shift+a", "alt+b", "f1", etc.
         * 'mod' can be used as a platform-independent modifier key, which maps to 'ctrl' on Windows/Linux and 'meta' on macOS. For example, "mod+shift+a" will be "ctrl+shift+a" on Windows/Linux and "meta+shift+a" on macOS.
         * @returns The hotkey decorator function.
         * @example
         * ```
         * ＠IEditor.hotkey("ctrl+shift+a")
         * function onHotkey() {
         *    console.log("Hotkey triggered.");
         * }
         * ```
         */
        function hotkey(combo: string): Function;
    }

    /**
     * Editor is a global object used to access various functions of the editor.
     */
    var Editor: IEditor.IEditorSingleton;
    var SceneEditor: IEditor.ISceneEditor;

    /**
     * The `i18n` object is a global object used to access the multilingual module.
     */
    var i18n: IEditor.ILanguageModule;
}
