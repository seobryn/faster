import { Faster } from '../index.mjs'

describe('Faster Init', () => {
  /**
   * @type {Faster}
   */
  let app
  beforeAll(() => {
    app = new Faster()
  })

  it('Web Server should init successfully', () => {
    expect(app).toBeDefined()
    expect(app instanceof Faster).toEqual(true)
  })

  it('Web Server should start listening', async () => {
    return app.listen(3210).then(() => {
      expect(app.server.listening).toEqual(true)
    })
  })

  afterAll(async () => {
    if (app.server.listening) {
      await app.close()
    }
  })
})
