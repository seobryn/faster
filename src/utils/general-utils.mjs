import path from 'path'
import { HttpError } from '../../index.mjs'
import fs from 'fs'
import { mimeTypes } from './mime-utils.mjs'

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

  for (let idx = 0; idx < routeParts.length; idx += 1) {
    const part = routeParts[idx]
    if (part.startsWith(':')) {
      // Validate if it has a corresponding value
      if (urlParts[idx] === undefined || urlParts[idx].trim().length === 0) {
        return false
      } else {
        continue
      }
    } else if (part.startsWith('*')) {
      return true
    } else if (part !== urlParts[idx]) {
      return false
    }
  }

  if (urlParts.length !== routeParts.length) {
    return false
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

/**
 * @param {object} options - Options
 * @param {string} [options.directory] - Directory to serve
 * @param {number} [options.maxAge] - Max age cache
 * @param {string} [options.fallbackFile] - Default file to serve
 *
 * @returns {Function}
 */
export function serveStatic (options) {
  /**
   * @param {import('../faster.mjs').FasterRequest} req
   * @param {import('../faster.mjs').FasterResponse} res
   */
  async function serve (req, res) {
    let file
    const dirBasename = path.basename(options.directory)
    const reqPathBasename = path.basename(req.url)
    console.log(reqPathBasename, dirBasename)

    if (path.extname(req.url) === '' && reqPathBasename === dirBasename) {
      console.log('Serving Directory')
      file = options.directory
    } else {
      console.log('Serving a file')
      file = path.join(options.directory, decodeURIComponent(reqPathBasename))
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      throw new HttpError(405, `${req.method} Method Not Allowed`)
    }

    try {
      const stats = fs.statSync(file)
      return await serverFileFromStats(req, res, file, stats)
    } catch (err) {
      if (err instanceof HttpError) {
        throw err
      } else {
        throw new HttpError(404, 'Not Found')
      }
    }
  }

  /**
 *
 * @param {import('../faster.mjs').FasterRequest} req
 * @param {import('../faster.mjs').FasterResponse} res
 * @param {string} file
 * @param {fs.Stats} stats
 */
  async function serverFileFromStats (req, res, file, stats) {
    return new Promise((resolve, reject) => {
      const fsStream = fs.createReadStream(file)
      const maxAge = options.maxAge ?? 3600
      fsStream.once('open', () => {
        res.setHeader('Cache-Control', `max-age=${maxAge}, must-revalidate`)
        res.setHeader('Content-Length', stats.size)
        const extension = path.extname(file).substring(1)
        res.setHeader('Content-Type', mimeTypes[extension])
        res.setHeader('Last-Modified', stats.mtime)
        res.status(200)
        fsStream.pipe(res)
        fsStream.once('close', () => {
          resolve(true)
        })
      })

      fsStream.once('error', reject)

      res.once('close', () => {
        fsStream.close()
      })
    })
  }

  return serve
}
