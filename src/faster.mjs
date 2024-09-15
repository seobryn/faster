import http from 'http'
import https from 'https'
import { getParamsFromUrl, isFunctionAsync, pathIsEqual } from './utils.mjs'
import { addJsonFeature, addSendFeature, addStatusFeature } from './helpers/responseHelpers.mjs'
import { logRequest } from './helpers/logHelpers.mjs'
import { addParseBodyFeature, requestMatcher } from './helpers/requestHelpers.mjs'
import { HttpError } from '../index.mjs'

/**
 * @typedef {import('./types/types.mjs').ExtraRequestParams} ExtraRequestParams
 * @typedef {import('./types/types.mjs').ExtraResponseParams} ExtraResponseParams
 * @typedef {import("http").IncomingMessage & ExtraRequestParams } FasterRequest
 * @typedef {import("http").ServerResponse & ExtraResponseParams} FasterResponse
 * @typedef {(req: FasterRequest ,res: FasterResponse)=> Promise<any>} FnCallback
 */

export class Faster {
  /**
     *
     * @param {object} options
     * @param {string} [options.host] - Host to listen
     * @param {boolean} [options.parseBody] - Parse request body
     * @param {boolean} [options.secure] - Use https
     * @param {object} [options.ssl] - SSL options only works if secure is true
     * @param {Buffer} [options.ssl.key] - SSL key
     * @param {Buffer} [options.ssl.cert] - SSL certificate
     * @param {object} [options.log] - Log options
     * @param {boolean} [options.log.errorAsJson] - Log errors as json
     */
  constructor (options = {}) {
    /**
     * @type {typeof options}
     */
    this.options = options
    this.options.host = this.options.host || '0.0.0.0'
    this.options.log = this.options.log || { errorAsJson: false }
    this.options.secure = this.options.secure || false

    if (this.options.secure) {
      this.server = https.createServer(this.options.ssl, this.handleRequest.bind(this))
    } else {
      this.server = http.createServer(this.handleRequest.bind(this))
    }
  }

  /**
   * @type {http.Server | https.Server}
   * @api private
   */
  server

  /**
   * @api private
   */
  options

  /**
   * @type {Map<string, { path:string, fnCallbacks: FnCallback[] }[]>}
   * @api private
   */
  requestMap = new Map()

  /**
   *
   * @param {FasterRequest} req
   * @param {FasterResponse} res
   * @api private
   */
  async handleRequest (req, res) {
    const initTime = Date.now()
    const { method, url } = req

    // Special Faster Features
    addJsonFeature(res)
    addSendFeature(res)
    addStatusFeature(res)
    if (this.options.parseBody) {
      await addParseBodyFeature(req)
    }
    res.setHeader('X-Powered-By', 'Faster Web Framework')

    try {
      const requests = this.requestMap.get(method)

      for (const { path, fnCallbacks } of requests) {
        if (pathIsEqual(url, path)) {
          const { params, searchParams } = getParamsFromUrl(url, path)
          req.params = params
          req.searchParams = new URLSearchParams(searchParams)

          for (const fnCallback of fnCallbacks) {
            await fnCallback(req, res)
          }

          if (res.headersSent) {
            res.responseTime = Date.now() - initTime
            logRequest(req, res)
          }
          return
        }
      }

      throw new HttpError(404, 'Route Not Found')
    } catch (err) {
      if (err instanceof HttpError) {
        if (this.options.log.errorAsJson) {
          res.status(err.code).json({ error: err.message })
        } else {
          res.status(err.code).send(err.message)
        }
      } else {
        res.status(500).send('Internal Server Error')
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
  async listen (port) {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(port, this.options.host, () => {
          console.log('Faster web server started\nURL: \x1b[35m%s\x1b[0m', `${this.options.secure ? 'https' : 'http'}://${this.options.host}:${port}`)
          console.log('\x1b[36mPress [CTRL+C] to stop server\x1b[0m')
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
  async close () {
    return new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          console.log('Error closing server')
          reject(error)
        } else {
          console.log('Server closed')
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
  #handleReqMethod (method, path, ...fnCallbacks) {
    for (const fnCallback of fnCallbacks) {
      if (!isFunctionAsync(fnCallback)) {
        throw new Error('fnCallback must be an async function')
      }
    }
    if (this.requestMap.has(method)) {
      const functionList = this.requestMap.get(method)
      if (functionList.findIndex((val) => requestMatcher(val.path, path)) > -1) {
        console.warn(`⚠️  \x1b[31mDuplicated ${method} path: '${path}'\x1b[0m`)
      }
      functionList.push({ path, fnCallback: fnCallbacks })
    } else {
      this.requestMap.set(method, [{
        path,
        fnCallback: fnCallbacks
      }])
    }
  }

  /**
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle get requests
   * @returns {Faster}
   * @api public
   */
  get (path, ...fnCallbacks) {
    this.#handleReqMethod('GET', path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle post requests
   * @return {Faster}
   * @api public
   */
  post (path, ...fnCallbacks) {
    this.#handleReqMethod('POST', path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle put requests
   * @returns {Faster}
   * @api public
   */
  put (path, ...fnCallbacks) {
    this.#handleReqMethod('PUT', path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle delete requests
   * @returns {Faster}
   * @api public
   */
  del (path, ...fnCallbacks) {
    this.#handleReqMethod('DELETE', path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle patch requests
   * @returns {Faster}
   * @api public
   */
  patch (path, ...fnCallbacks) {
    this.#handleReqMethod('PATCH', path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle options requests
   * @returns {Faster}
   * @api public
   */
  opts (path, ...fnCallbacks) {
    this.#handleReqMethod('OPTIONS', path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle head requests
   * @returns {Faster}
   * @api public
   */
  head (path, ...fnCallbacks) {
    this.#handleReqMethod('HEAD', path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle connect requests
   * @returns {Faster}
   * @api public
   */
  connect (path, ...fnCallbacks) {
    this.#handleReqMethod('CONNECT', path, fnCallbacks)
    return this
  }

  /**
   * @param {string} path - URL path
   * @param {FnCallback[]} fnCallbacks - Function middleware array to handle trace requests
   * @return {Faster}
   * @api public
   */
  trace (path, ...fnCallbacks) {
    this.#handleReqMethod('TRACE', path, fnCallbacks)
    return this
  }
}
