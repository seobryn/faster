function n(e) {
  return e >= 200 && e < 300 ? "\x1B[32m" : e >= 300 && e < 400 ? "\x1B[33m" : e >= 400 && e < 500 ? "\x1B[31m" : "\x1B[35m";
}
function l(e) {
  return e === "GET" ? "\x1B[34m" : e === "POST" ? "\x1B[36m" : e === "PUT" ? "\x1B[32m" : e === "DELETE" ? "\x1B[31m" : e === "PATCH" ? "\x1B[33m" : e === "OPTIONS" ? "\x1B[35m" : e === "HEAD" ? "\x1B[37m" : "\x1B[0m";
}
function u(e, r) {
  console.log(
    `${l(e.method ?? "")}${e.method}\x1B[0m ${n(r.statusCode)}${r.statusCode}\x1B[0m ${e.url} ${r.responseTime}ms`
  );
}
export {
  l as getMethodColor,
  n as getStatusColor,
  u as logRequest
};
//# sourceMappingURL=logHelpers.js.map
