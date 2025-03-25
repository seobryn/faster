function o(t) {
  t.json = (e) => {
    t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify(e));
  };
}
function u(t) {
  t.send = (e, n = {}) => (Object.entries(n).forEach(([a, d]) => {
    t.setHeader(a, d);
  }), t.end(e), t);
}
function i(t) {
  t.status = (e) => (t.statusCode = e, t);
}
function c(t) {
  t.redirect = (e, n = !1) => {
    t.statusCode = n ? 301 : 302, t.setHeader("Location", e), t.end();
  };
}
export {
  o as addJsonFeature,
  c as addRedirectFeature,
  u as addSendFeature,
  i as addStatusFeature
};
//# sourceMappingURL=responseHelpers.js.map
