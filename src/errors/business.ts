export class HttpError extends Error {
  code: number
  details: Record<string, unknown> | null

  constructor(code: number, message: string, details: Record<string, unknown> | null = null) {
    super(message)
    this.code = code
    this.details = details
  }
}
