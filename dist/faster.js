import p from "http";
import m from "https";
import { pathIsEqual as w, getParamsFromUrl as R, isFunctionAsync as g } from "./utils/general-utils.js";
import { addJsonFeature as M, addSendFeature as q, addStatusFeature as v, addRedirectFeature as C } from "./helpers/responseHelpers.js";
import { logRequest as i } from "./helpers/logHelpers.js";
import { addParseBodyFeature as b, requestMatcher as P } from "./helpers/requestHelpers.js";
import { HttpError as h } from "./errors/business.js";
class D {
  constructor(t = {}) {
    this.requestMap = /* @__PURE__ */ new Map(), this.fnCallbacks = [], this.options = {
      host: t.host || "0.0.0.0",
      log: t.log || { errorAsJson: !1 },
      secure: t.secure || !1,
      timeout: t.timeout || 5e3,
      parseBody: t.parseBody || !1,
      ssl: t.ssl
    }, this.options.secure && this.options.ssl ? this.server = m.createServer(
      this.options.ssl,
      ((e, s) => this.handleRequest(e, s)).bind(this)
    ) : this.server = p.createServer(
      ((e, s) => this.handleRequest(e, s)).bind(this)
    );
  }
  /**
   *
   * @param {FasterRequest} req
   * @param {FasterResponse} res
   * @api private
   */
  async handleRequest(t, e) {
    var l;
    const s = Date.now(), { method: r, url: n } = t;
    M(e), q(e), v(e), C(e), this.options.parseBody && await b(t), e.setHeader("X-Powered-By", "Faster Web Framework");
    try {
      if (!r)
        throw new h(400, "Bad Request");
      const o = this.requestMap.get(r) ?? [];
      if (this.fnCallbacks.length > 0) {
        for (const a of this.fnCallbacks)
          if (await a(t, e), e.headersSent) {
            e.responseTime = Date.now() - s, i(t, e);
            return;
          }
      }
      for (const { path: a, fnCallbacks: c } of o)
        if (w(n ?? "", a)) {
          const { params: d, searchParams: u } = R(n ?? "", a);
          t.params = d, t.searchParams = new URLSearchParams(u);
          for (const f of c)
            if (await f(t, e), e.headersSent) {
              e.responseTime = Date.now() - s, i(t, e);
              return;
            }
        }
      throw new h(404, "Not Found");
    } catch (o) {
      o instanceof h ? (l = this.options.log) != null && l.errorAsJson ? e.status(o.code).json({ error: o.message, details: o.details }) : e.status(o.code).send(o.message) : (e.status(500).send("Internal Server Error"), console.error(o)), e.responseTime = Date.now() - s, i(t, e);
    }
  }
  /**
   *
   * @param {number} port - Port to listen
   * @api public
   */
  async listen(t) {
    return new Promise((e, s) => {
      try {
        this.server.listen(t, this.options.host, () => {
          console.log(
            `Faster web server started
URL: \x1B[35m%s\x1B[0m`,
            `${this.options.secure ? "https" : "http"}://${this.options.host}:${t}`
          ), console.log("\x1B[36mPress [CTRL+C] to stop server\x1B[0m"), e();
        });
      } catch (r) {
        console.error(r), s(r);
      }
    });
  }
  /**
   * Close Connection
   *
   * @return {Promise<void>}
   * @api public
   */
  async close() {
    return new Promise((t, e) => {
      this.server.close((s) => {
        s ? (console.log("Error closing server"), e(s)) : (console.log("Server closed"), t());
      });
    });
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
  handleReqMethod(t, e, s) {
    for (const r of s)
      if (!g(r))
        throw new Error("fnCallback must be an async function");
    if (this.requestMap.has(t)) {
      const r = this.requestMap.get(t) ?? [];
      r.findIndex((n) => P(n.path, e)) > -1 && console.warn(`⚠️  \x1B[31mDuplicated ${t} path: '${e}'\x1B[0m`), r.push({ path: e, fnCallbacks: s });
    } else
      this.requestMap.set(t, [
        {
          path: e,
          fnCallbacks: s
        }
      ]);
  }
  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle get requests
   * @returns {Faster}
   * @api public
   */
  get(t, ...e) {
    return this.handleReqMethod("GET", t, e), this;
  }
  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle post requests
   * @return {Faster}
   * @api public
   */
  post(t, ...e) {
    return this.handleReqMethod("POST", t, e), this;
  }
  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle put requests
   * @returns {Faster}
   * @api public
   */
  put(t, ...e) {
    return this.handleReqMethod("PUT", t, e), this;
  }
  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle delete requests
   * @returns {Faster}
   * @api public
   */
  del(t, ...e) {
    return this.handleReqMethod("DELETE", t, e), this;
  }
  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle patch requests
   * @returns {Faster}
   * @api public
   */
  patch(t, ...e) {
    return this.handleReqMethod("PATCH", t, e), this;
  }
  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle options requests
   * @returns {Faster}
   * @api public
   */
  opts(t, ...e) {
    return this.handleReqMethod("OPTIONS", t, e), this;
  }
  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle head requests
   * @returns {Faster}
   * @api public
   */
  head(t, ...e) {
    return this.handleReqMethod("HEAD", t, e), this;
  }
  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle connect requests
   * @returns {Faster}
   * @api public
   */
  connect(t, ...e) {
    return this.handleReqMethod("CONNECT", t, e), this;
  }
  /**
   * @param {string} path - URL path
   * @param {...FnCallback} fnCallbacks - Function middleware array to handle trace requests
   * @return {Faster}
   * @api public
   */
  trace(t, ...e) {
    return this.handleReqMethod("TRACE", t, e), this;
  }
  on(t, e) {
    this.server.on(t, e);
  }
  off(t, e) {
    this.server.off(t, e);
  }
  /**
   * This method allows you to add custom global middleware to the server
   *
   * `NOTE`: All of this middlewares are executed before routed requests.
   * @param {...FnCallback} fnCallbacks
   * @returns {typeof this}
   */
  use(...t) {
    return this.fnCallbacks = [...this.fnCallbacks, ...t], this;
  }
  get isListening() {
    return this.server.listening;
  }
}
export {
  D as Faster
};
//# sourceMappingURL=faster.js.map
