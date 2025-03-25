class o extends Error {
  constructor(r, t, s = null) {
    super(t), this.code = r, this.details = s;
  }
}
export {
  o as HttpError
};
//# sourceMappingURL=business.js.map
