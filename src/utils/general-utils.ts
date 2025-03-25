import { mimeTypes } from "./mime-utils"
import { HttpError } from "../errors/business"
import type { FasterRequest, FasterResponse, FnCallback, Params } from "../types/types"
import * as fs from "fs"
import * as path from "path"

export function pathIsEqual(urlPath: string, routePath: string): boolean {
  const urlParts = urlPath.split("/").slice(1)
  const routeParts = routePath.split("/").slice(1)

  for (let idx = 0; idx < routeParts.length; idx += 1) {
    const part = routeParts[idx]
    if (part.startsWith(":")) {
      // Validate if it has a corresponding value
      if (urlParts[idx] === undefined || urlParts[idx].trim().length === 0) {
        return false
      } else {
        continue
      }
    } else if (part.startsWith("*")) {
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

export function getParamsFromUrl(
  urlPath: string,
  routePath: string
): { params: Params; searchParams: string } {
  const params: Params = {}
  const [pathPart, searchPart] = urlPath.split("?")
  const urlParts = pathPart.split("/")
  const routeParts = routePath.split("/")

  routeParts.forEach((part: string, idx: number) => {
    if (part.startsWith(":")) {
      params[part.slice(1)] = urlParts[idx]
    }
  })

  return {
    params,
    searchParams: searchPart || "",
  }
}

export function isFunctionAsync(fn: FnCallback): boolean {
  return fn.constructor.name === "AsyncFunction"
}

interface ServeStaticOptions {
  maxAge?: number
  directory: string
  index?: string
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().slice(1)
  return mimeTypes[ext as keyof typeof mimeTypes] || "application/octet-stream"
}

export function serveStatic(options: ServeStaticOptions): FnCallback {
  return async (req: FasterRequest, res: FasterResponse) => {
    try {
      let filePath: string
      const reqPathBasename = path.basename(req.url || "")
      const dirBasename = path.basename(options.directory)

      if (path.extname(req.url || "") === "" && reqPathBasename === dirBasename) {
        filePath = options.directory
      } else {
        filePath = path.join(options.directory, decodeURIComponent(reqPathBasename))
      }

      const stat = await fs.promises.stat(filePath)

      if (!stat.isFile()) {
        throw new HttpError(404, "Not Found")
      }

      const mimeType = getMimeType(filePath)
      const headers = {
        "Content-Type": mimeType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": `max-age=${options.maxAge || 0}`,
      }

      res.writeHead(200, headers)
      const readStream = fs.createReadStream(filePath)
      return new Promise<void>((resolve, reject) => {
        readStream.pipe(res)
        readStream.on("end", resolve)
        readStream.on("error", reject)
      })
    } catch (error) {
      if ((error as { code: string }).code === "ENOENT") {
        throw new HttpError(404, "Not Found")
      }
      throw error
    }
  }
}
