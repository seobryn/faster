import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { Faster } from "../src/index"

describe("Faster Init", () => {
  let app: Faster

  beforeAll(() => {
    app = new Faster()
  })

  it("Web Server should init successfully", () => {
    expect(app).toBeDefined()
    expect(app instanceof Faster).toBe(true)
  })

  it("Web Server should start listening", async () => {
    await app.listen(3210)
    expect(app.isListening).toBe(true)
  })

  afterAll(async () => {
    if (app.isListening) {
      await app.close()
    }
  })
})
