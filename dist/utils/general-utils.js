import { mimeTypes as d } from "./mime-utils.js";
import { HttpError as u } from "../errors/business.js";
import * as f from "fs";
import * as a from "path";
function w(e, s) {
  const n = e.split("/").slice(1), t = s.split("/").slice(1);
  for (let r = 0; r < t.length; r += 1) {
    const o = t[r];
    if (o.startsWith(":")) {
      if (n[r] === void 0 || n[r].trim().length === 0)
        return !1;
      continue;
    } else {
      if (o.startsWith("*"))
        return !0;
      if (o !== n[r])
        return !1;
    }
  }
  return n.length === t.length;
}
function x(e, s) {
  const n = {}, [t, r] = e.split("?"), o = t.split("/");
  return s.split("/").forEach((c, m) => {
    c.startsWith(":") && (n[c.slice(1)] = o[m]);
  }), {
    params: n,
    searchParams: r || ""
  };
}
function C(e) {
  return e.constructor.name === "AsyncFunction";
}
function y(e) {
  const s = a.extname(e).toLowerCase().slice(1);
  return d[s] || "application/octet-stream";
}
function F(e) {
  return async (s, n) => {
    try {
      let t;
      const r = a.basename(s.url || ""), o = a.basename(e.directory);
      a.extname(s.url || "") === "" && r === o ? t = e.directory : t = a.join(e.directory, decodeURIComponent(r));
      const i = await f.promises.stat(t);
      if (!i.isFile())
        throw new u(404, "Not Found");
      const m = {
        "Content-Type": y(t),
        "Content-Length": i.size.toString(),
        "Cache-Control": `max-age=${e.maxAge || 0}`
      };
      n.writeHead(200, m);
      const l = f.createReadStream(t);
      return new Promise((p, h) => {
        l.pipe(n), l.on("end", p), l.on("error", h);
      });
    } catch (t) {
      throw t.code === "ENOENT" ? new u(404, "Not Found") : t;
    }
  };
}
export {
  x as getParamsFromUrl,
  C as isFunctionAsync,
  w as pathIsEqual,
  F as serveStatic
};
//# sourceMappingURL=general-utils.js.map
