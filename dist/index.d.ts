import { IncomingMessage } from 'http';
import { ServerResponse } from 'http';

export declare interface ExtraRequestParams {
    params: Params;
    searchParams: URLSearchParams;
    body: unknown;
    path: string;
}

export declare interface ExtraResponseParams {
    json: (data: unknown) => void;
    send: (data: string, headers?: {
        [key: string]: string;
    }) => void;
    status: (code: number) => ServerResponse & ExtraResponseParams;
    responseTime: number;
    redirect: (url: string, isPermanent?: boolean) => void;
}

export declare class Faster {
    private server;
    private options;
    private requestMap;
    private fnCallbacks;
    constructor(options?: Partial<FasterOptions>);
    /**
     *
     * @param {FasterRequest} req
     * @param {FasterResponse} res
     * @api private
     */
    private handleRequest;
    /**
     *
     * @param {number} port - Port to listen
     * @api public
     */
    listen(port: number): Promise<void>;
    /**
     * Close Connection
     *
     * @return {Promise<void>}
     * @api public
     */
    close(): Promise<void>;
    /**
     * Register a new route to the server
     *
     * @param {string} method - HTTP Method
     * @param {string} path - URL path
     * @param {FnCallback[]} fnCallbacks - Function middleware array to handle requests
     * @return {void}
     * @api private
     */
    private handleReqMethod;
    /**
     * @param {string} path - URL path
     * @param {...FnCallback} fnCallbacks - Function middleware array to handle get requests
     * @returns {Faster}
     * @api public
     */
    get(path: string, ...fnCallbacks: FnCallback[]): this;
    /**
     * @param {string} path - URL path
     * @param {...FnCallback} fnCallbacks - Function middleware array to handle post requests
     * @return {Faster}
     * @api public
     */
    post(path: string, ...fnCallbacks: FnCallback[]): this;
    /**
     * @param {string} path - URL path
     * @param {...FnCallback} fnCallbacks - Function middleware array to handle put requests
     * @returns {Faster}
     * @api public
     */
    put(path: string, ...fnCallbacks: FnCallback[]): this;
    /**
     * @param {string} path - URL path
     * @param {...FnCallback} fnCallbacks - Function middleware array to handle delete requests
     * @returns {Faster}
     * @api public
     */
    del(path: string, ...fnCallbacks: FnCallback[]): this;
    /**
     * @param {string} path - URL path
     * @param {...FnCallback} fnCallbacks - Function middleware array to handle patch requests
     * @returns {Faster}
     * @api public
     */
    patch(path: string, ...fnCallbacks: FnCallback[]): this;
    /**
     * @param {string} path - URL path
     * @param {...FnCallback} fnCallbacks - Function middleware array to handle options requests
     * @returns {Faster}
     * @api public
     */
    opts(path: string, ...fnCallbacks: FnCallback[]): this;
    /**
     * @param {string} path - URL path
     * @param {...FnCallback} fnCallbacks - Function middleware array to handle head requests
     * @returns {Faster}
     * @api public
     */
    head(path: string, ...fnCallbacks: FnCallback[]): this;
    /**
     * @param {string} path - URL path
     * @param {...FnCallback} fnCallbacks - Function middleware array to handle connect requests
     * @returns {Faster}
     * @api public
     */
    connect(path: string, ...fnCallbacks: FnCallback[]): this;
    /**
     * @param {string} path - URL path
     * @param {...FnCallback} fnCallbacks - Function middleware array to handle trace requests
     * @return {Faster}
     * @api public
     */
    trace(path: string, ...fnCallbacks: FnCallback[]): this;
    on(event: "close" | "error" | "listening", listener: (err?: Error) => void): void;
    off(event: string | symbol, listener: (err?: Error) => void): void;
    /**
     * This method allows you to add custom global middleware to the server
     *
     * `NOTE`: All of this middlewares are executed before routed requests.
     * @param {...FnCallback} fnCallbacks
     * @returns {typeof this}
     */
    use(...fnCallbacks: FnCallback[]): this;
    get isListening(): boolean;
}

export declare interface FasterOptions {
    host?: string;
    parseBody?: boolean;
    secure?: boolean;
    ssl?: {
        key: Buffer;
        cert: Buffer;
    };
    log?: {
        errorAsJson: boolean;
    };
    timeout?: number;
}

export declare type FasterRequest = IncomingMessage & ExtraRequestParams;

export declare type FasterResponse = ServerResponse & ExtraResponseParams;

export declare type FnCallback = (req: FasterRequest, res: FasterResponse) => Promise<unknown>;

export declare class HttpError extends Error {
    code: number;
    details: Record<string, unknown> | null;
    constructor(code: number, message: string, details?: Record<string, unknown> | null);
}

export declare interface Params {
    [key: string]: string;
}

export declare function serveStatic(options: ServeStaticOptions): FnCallback;

declare interface ServeStaticOptions {
    maxAge?: number;
    directory: string;
    index?: string;
}

export { }
