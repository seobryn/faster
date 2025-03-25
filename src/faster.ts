import http from "http"
import https from "https"
import { getParamsFromUrl, isFunctionAsync, pathIsEqual } from "./utils/general-utils"
import {
  addJsonFeature,
  addRedirectFeature,
  addSendFeature,
  addStatusFeature,
} from "./helpers/responseHelpers"
import { logRequest } from "./helpers/logHelpers"
import { addParseBodyFeature, requestMatcher } from "./helpers/requestHelpers"
import { HttpError } from "./errors/business"
import type { FasterRequest, FasterResponse, FnCallback, FasterOptions } from "./types/types"

export class Faster {
  private server: http.Server | https.Server
  private options: FasterOptions
  private requestMap = new Map<string, { path: string; fnCallbacks: FnCallback[] }[]>()
  private fnCallbacks: FnCallback[] = []

  constructor(options: Partial<FasterOptions> = {}) {
    this.options = {
      host: options.host || "0.0.0.0",
      log: options.log || { errorAsJson: false },
      secure: options.secure || false,
      timeout: options.timeout || 5000,
      parseBody: options.parseBody || false,
      ssl: options.ssl,
    }

    if (this.options.secure && this.options.ssl) {
      this.server = https.createServer(
        this.options.ssl,
        ((req: http.IncomingMessage, res: http.OutgoingMessage) =>
          this.handleRequest(req as FasterRequest, res as FasterResponse)).bind(this)
      )
    } else {
      this.server = http.createServer(
        ((req: http.IncomingMessage, res: http.ServerResponse) =>
          this.handleRequest(req as FasterRequest, res as FasterResponse)).bind(this)
      )
    }
  }

  /**
   *
   * @param {FasterRequest} req
   * @param {FasterResponse} res
   * @api private
   */
  // Add security headers middleware
  private addSecurityHeaders(res: FasterResponse) {
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("X-Frame-Options", "DENY")
    res.setHeader("X-XSS-Protection", "1; mode=block")
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  // Enhance handleRequest with timeout and security headers
  private async processRequest(req: FasterRequest, res: FasterResponse) {
    const { method, url } = req

    // Special Faster Features
    addJsonFeature(res)
    addSendFeature(res)
    addStatusFeature(res)
    addRedirectFeature(res)

    if (this.options.parseBody) {
      await addParseBodyFeature(req)
    }

    res.setHeader("X-Powered-By", "Faster Web Framework")

    if (!method) {
      throw new HttpError(400, "Bad Request")
    }

    const requests = this.requestMap.get(method) ?? []

    if (this.fnCallbacks.length > 0) {
      for (const fnCallback of this.fnCallbacks) {
        await fnCallback(req, res)
        if (res.headersSent) return
      }
    }

    for (const { path, fnCallbacks } of requests) {
      if (pathIsEqual(url ?? "", path)) {
        const { params, searchParams } = getParamsFromUrl(url ?? "", path)
        req.params = params
        req.searchParams = new URLSearchParams(searchParams)

        for (const fnCallback of fnCallbacks) {
          await fnCallback(req, res)
          if (res.headersSent) return
        }
      }
    }

    throw new HttpError(404, "Not Found")
  }

  private async handleRequest(req: FasterRequest, res: FasterResponse) {
    const initTime = Date.now()

    // Add security headers
    this.addSecurityHeaders(res)

    // Add timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new HttpError(408, "Request Timeout")), this.options.timeout)
    })

    try {
      await Promise.race([this.processRequest(req, res), timeoutPromise])
      res.responseTime = Date.now() - initTime
      logRequest(req, res)
    } catch (err) {
      if (err instanceof HttpError) {
        if (this.options.log?.errorAsJson) {
          res.status(err.code).json({ error: err.message, details: err.details })
        } else {
          res.status(err.code).send(err.message)
        }
      } else {
        res.status(500).send("Internal Server Error")
        console.error(err)
      }
      res.responseTime = Date.now() - initTime
      logRequest(req, res)
    }
  }

  /**
   *
   * @param {number} port - Port to listen
   * @api public
   */
  async listen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(port, this.options.host, () => {
          console.log(
            "Faster web server started\nURL: \x1b[35m%s\x1b[0m",
            `${this.options.secure ? "https" : "http"}://${this.options.host}:${port}`
          )
          console.log("\x1b[36mPress [CTRL+C] to stop server\x1b[0m")
          resolve()
        })
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
  }

  /**
   * Close Connection
   *
   * @return {Promise<void>}
   * @api public
   */
  async close() {
    return new Promise<void>((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          console.log("Error closing server")
          reject(error)
        } else {
          console.log("Server closed")
          resolve()
        }
      })
    })
  }

  /**
   * Register a new route to the server
   *
   * @param {string} method - HTTP Method
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle requests
   * @return {void}
   * @api private
   */
  private handleReqMethod(method: string, path: string, fnCallbacks: FnCallback[]): void {
    for (const fnCallback of fnCallbacks) {
      if (!isFunctionAsync(fnCallback)) {
        throw new Error("fnCallback must be an async function")
      }
    }
    if (this.requestMap.has(method)) {
      const functionList = this.requestMap.get(method) ?? []
      if (functionList.findIndex((val) => requestMatcher(val.path, path)) > -1) {
        console.warn(`⚠️  \x1b[31mDuplicated ${method} path: '${path}'\x1b[0m`)
      }
      functionList.push({ path, fnCallbacks })
    } else {
      this.requestMap.set(method, [
        {
          path,
          fnCallbacks,
        },
      ])
    }
  }

  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle get requests
   * @returns {Faster}
   * @api public
   */
  get(path: string, ...fnCallbacks: FnCallback[]): this {
    this.handleReqMethod("GET", path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle post requests
   * @return {Faster}
   * @api public
   */
  post(path: string, ...fnCallbacks: FnCallback[]): this {
    this.handleReqMethod("POST", path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle put requests
   * @returns {Faster}
   * @api public
   */
  put(path: string, ...fnCallbacks: FnCallback[]): this {
    this.handleReqMethod("PUT", path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle delete requests
   * @returns {Faster}
   * @api public
   */
  del(path: string, ...fnCallbacks: FnCallback[]): this {
    this.handleReqMethod("DELETE", path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle patch requests
   * @returns {Faster}
   * @api public
   */
  patch(path: string, ...fnCallbacks: FnCallback[]): this {
    this.handleReqMethod("PATCH", path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle options requests
   * @returns {Faster}
   * @api public
   */
  opts(path: string, ...fnCallbacks: FnCallback[]): this {
    this.handleReqMethod("OPTIONS", path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle head requests
   * @returns {Faster}
   * @api public
   */
  head(path: string, ...fnCallbacks: FnCallback[]): this {
    this.handleReqMethod("HEAD", path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle connect requests
   * @returns {Faster}
   * @api public
   */
  connect(path: string, ...fnCallbacks: FnCallback[]): this {
    this.handleReqMethod("CONNECT", path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle trace requests
   * @return {Faster}
   * @api public
   */
  trace(path: string, ...fnCallbacks: FnCallback[]): this {
    this.handleReqMethod("TRACE", path, fnCallbacks)
    return this
  }

  on(event: "close" | "error" | "listening", listener: (err?: Error) => void): void {
    this.server.on(event, listener)
  }

  off(event: string | symbol, listener: (err?: Error) => void): void {
    this.server.off(event, listener)
  }

  /**
   * This method allows you to add custom global middleware to the server
   *
   * `NOTE`: All of this middlewares are executed before routed requests.
   * @param {...FnCallback} fnCallbacks
   * @returns {typeof this}
   */
  use(...fnCallbacks: FnCallback[]): this {
    this.fnCallbacks = [...this.fnCallbacks, ...fnCallbacks]
    return this
  }

  get isListening(): boolean {
    return this.server.listening
  }
}
