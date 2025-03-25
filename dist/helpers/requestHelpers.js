function u(t, e) {
  const n = t.split("/"), r = e.split("/");
  return n.length !== r.length ? !1 : n.every((s, a) => s.startsWith(":") ? !0 : s === r[a]);
}
async function o(t) {
  return new Promise((e) => {
    let n = "";
    t.on("data", (r) => {
      n += r.toString();
    }), t.on("end", () => {
      n && (t.body = i(n, t.headers["content-type"])), e();
    });
  });
}
function i(t, e) {
  return e && e.includes("application/json") ? JSON.parse(t) : t;
}
export {
  o as addParseBodyFeature,
  u as requestMatcher
};
//# sourceMappingURL=requestHelpers.js.map
