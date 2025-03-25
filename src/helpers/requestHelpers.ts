import type { IncomingMessage } from "http"
import type { FasterRequest } from "../types/types"

export function requestMatcher(requestPath1: string, requestPath2: string): boolean {
  const path1Parts = requestPath1.split("/")
  const path2Parts = requestPath2.split("/")

  if (path1Parts.length !== path2Parts.length) {
    return false
  }

  return path1Parts.every((part, index) => {
    if (part.startsWith(":")) {
      return true
    }
    return part === path2Parts[index]
  })
}

export async function addParseBodyFeature(
  req: IncomingMessage & Partial<FasterRequest>
): Promise<void> {
  return new Promise((resolve) => {
    let body = ""
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString()
    })

    req.on("end", () => {
      if (body) {
        req.body = parseBody(body, req.headers["content-type"])
      }
      resolve()
    })
  })
}

function parseBody(body: string, contentType?: string): unknown {
  if (!contentType) {
    return body
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(body)
  }

  return body
}
