import { IncomingMessage, ServerResponse } from "http"

export interface Params {
  [key: string]: string
}

export interface ExtraRequestParams {
  params: Params
  searchParams: URLSearchParams
  body: unknown
  path: string
}

export interface ExtraResponseParams {
  json: (data: unknown) => void
  send: (data: string, headers?: { [key: string]: string }) => void
  status: (code: number) => ServerResponse & ExtraResponseParams
  responseTime: number
  redirect: (url: string, isPermanent?: boolean) => void
}

export interface FasterOptions {
  host?: string
  parseBody?: boolean
  secure?: boolean
  ssl?: {
    key: Buffer
    cert: Buffer
  }
  log?: {
    errorAsJson: boolean
  }
  timeout?: number
}

export type FasterRequest = IncomingMessage & ExtraRequestParams
export type FasterResponse = ServerResponse & ExtraResponseParams
export type FnCallback = (req: FasterRequest, res: FasterResponse) => Promise<unknown>
