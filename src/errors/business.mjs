export class HttpError extends Error {
  /**
   *
   * @param {number} code - Error code
   * @param {string} message - Error message
   * @param {any} [details]  - Error details
   */
  constructor (code, message, details) {
    super(message)
    this.code = code
    this.details = details
  }
}
