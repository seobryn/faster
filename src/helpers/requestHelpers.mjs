/**
 * Compare two request paths and return true if they are the same
 *
 * @param {string} requestPath1 - Request Path
 * @param {string} requestPath2 - Request Path
 */
export function requestMatcher (requestPath1, requestPath2) {
  const reqPathParts1 = requestPath1.split('/').slice(1)
  const reqPathParts2 = requestPath2.split('/').slice(1)

  if (reqPathParts1.length !== reqPathParts2.length) {
    return false
  }

  for (let idx = 0; idx < reqPathParts1.length; idx += 1) {
    if (reqPathParts1[idx].startsWith(':') && reqPathParts2[idx].startsWith(':')) {
      continue
    } else if (reqPathParts1[idx] !== reqPathParts2[idx]) {
      return false
    }
  }

  return true
}

/**
 *
 * @param {import("../faster.mjs").FasterRequest} req
 * @return {Promise<void>}
 */
export async function addParseBodyFeature (req) {
  return new Promise((resolve, reject) => {
    const { method } = req
    let body = ''
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      req.on('data',
        /** @param {Buffer} chunk */
        (chunk) => {
          body += chunk
        })

      req.on('end', () => {
        req.body = parseBody(body, req.headers['content-type'])
        resolve()
      })

      req.on('error', reject)
    }
  })
}

/**
 * @param {string} body - Body string
 * @param {string} contenType - Content type
 * @return {any} - Parsed body
 */
function parseBody (body, contenType) {
  if (contenType === 'application/json') {
    return JSON.parse(body)
  } else if (contenType === 'application/x-www-form-urlencoded') {
    return new URLSearchParams(body)
  } else if (contenType === 'multipart/form-data') {
    return new FormData(body)
  } else if (contenType === 'text/plain' || contenType === 'text/html' || contenType === 'text/xml') {
    return body
  }
}
