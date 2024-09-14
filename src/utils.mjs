/**
 * @typedef {{[key:string]: string}} Params
 * @typedef {string} SearchParams
 */

/**
 *
 * @param {string} urlPath
 * @param {string} routePath
 * @return {boolean}
 */
export function pathIsEqual (urlPath, routePath) {
  const urlParts = urlPath.split('/').slice(1)
  const routeParts = routePath.split('/').slice(1)

  if (urlParts.length !== routeParts.length) {
    return false
  }

  for (let idx = 0; idx < routeParts.length; idx += 1) {
    const part = routeParts[idx]
    if (part.startsWith(':')) {
      // Validate if it has a corresponding value

      if (urlParts[idx] === undefined || urlParts[idx].trim().length === 0) {
        return false
      } else {
        continue
      }
    } else if (part !== urlParts[idx]) {
      return false
    }
  }

  return true
}

/**
 *
 * @param {string} urlPath
 * @param {string} routePath
 * @return {{params: Params, searchParams: SearchParams}}
 */
export function getParamsFromUrl (urlPath, routePath) {
  let cleanUrlPath, searchParams
  if (urlPath.indexOf('?') > -1) {
    [cleanUrlPath, searchParams] = urlPath.split('?')
  } else {
    cleanUrlPath = urlPath
  }

  const routeParts = routePath.split('/').slice(1)
  const urlParts = cleanUrlPath.split('/').slice(1)

  const params = {}

  routeParts.forEach((part, idx) => {
    if (part.startsWith(':')) {
      params[part.slice(1)] = urlParts[idx]
    }
  })

  return { params, searchParams: searchParams !== undefined ? `?${searchParams}` : '' }
}

/**
 *
 * @param {Function} fn
 * @return {boolean}
 */
export function isFunctionAsync (fn) {
  return fn.constructor.name === 'AsyncFunction'
}
