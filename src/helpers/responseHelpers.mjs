/**
 * @typedef {import('../faster.mjs').FasterResponse} FasterResponse
 */
/**
 *
 * @param {FasterResponse} res
 * @returns {void}
 */
export function addJsonFeature (res) {
  /**
     *
     * @param {any} data - Data To Send
     */
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }
}

/**
 *
 * @param {FasterResponse} res
 * @returns {void}
 */
export function addSendFeature (res) {
  res.send = (data, headers = {}) => {
    Object.keys(headers).forEach(header => {
      res.setHeader(header, headers[header])
    })
    return res.end(data)
  }
}

/**
 *
 * @param {FasterResponse} res
 * @return {void}
 */

export function addStatusFeature (res) {
  res.status = (code) => {
    res.statusCode = code
    return res
  }
}

/**
 * @param {FasterResponse} res
 * @return {void}
 */
export function addRedirectFeature (res) {
  res.redirect = (url, isPermanent = false) => {
    res.setHeader('Location', url)
    res.status(isPermanent ? 301 : 302)
    return res.end()
  }
}
