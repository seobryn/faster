import { fileURLToPath } from 'url'
import { dirname } from 'path'

/**
 *
 * @param {string} url - import.meta.url
 */
export function __dirname (url) {
  const filename = fileURLToPath(url)
  const _dirname = dirname(filename)
  return _dirname
}
