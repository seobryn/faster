import type { FasterResponse } from "../types/types"
import type { ServerResponse } from "http"

export function addJsonFeature(res: FasterResponse): void {
  res.json = (data: unknown): void => {
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(data))
  }
}

export function addSendFeature(res: ServerResponse & Partial<FasterResponse>): void {
  res.send = (data: string | Buffer, headers: { [key: string]: string } = {}) => {
    Object.entries(headers).forEach(([header, value]) => {
      res.setHeader(header, value)
    })
    res.end(data)
    return res as FasterResponse
  }
}

export function addStatusFeature(res: ServerResponse & Partial<FasterResponse>): void {
  res.status = (code: number) => {
    res.statusCode = code
    return res as FasterResponse
  }
}

export function addRedirectFeature(res: ServerResponse & Partial<FasterResponse>): void {
  res.redirect = (url: string, isPermanent = false) => {
    res.statusCode = isPermanent ? 301 : 302
    res.setHeader("Location", url)
    res.end()
  }
}
