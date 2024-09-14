/**
 *
 * @param {number} statusCode
 */
export function getStatusColor (statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return '\x1b[32m'
  } else if (statusCode >= 300 && statusCode < 400) {
    return '\x1b[33m'
  } else if (statusCode >= 400 && statusCode < 500) {
    return '\x1b[31m'
  } else {
    return '\x1b[35m'
  }
}

/**
 *
 * @param {string} method
 */
export function getMethodColor (method) {
  if (method === 'GET') {
    return '\x1b[34m'
  } else if (method === 'POST') {
    return '\x1b[36m'
  } else if (method === 'PUT') {
    return '\x1b[32m'
  } else if (method === 'DELETE') {
    return '\x1b[31m'
  } else if (method === 'PATCH') {
    return '\x1b[33m'
  } else if (method === 'OPTIONS') {
    return '\x1b[35m'
  } else if (method === 'HEAD') {
    return '\x1b[37m'
  }

  return '\x1b[0m'
}

/**
 *
 * @param {import("../faster.mjs").FasterRequest} req
 * @param {import("../faster.mjs").FasterResponse} res
 */
export function logRequest (req, res) {
  console.log(`${getMethodColor(req.method)}${req.method}\x1b[0m ${getStatusColor(res.statusCode)}${res.statusCode}\x1b[0m ${req.url} ${res.responseTime}ms`)
}
