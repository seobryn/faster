import { Faster, HttpError, serveStatic } from "../dist/index.js"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirPath = dirname(currentFilePath)
const staticPath = path.join(currentDirPath, "static")

const PORT = 3001
const app = new Faster({ parseBody: true, log: { errorAsJson: true } })

app
  .get(
    "/",
    async (_req) => {
      if (_req.headers.test === "Seobryn") {
        _req.user = { name: "Seobryn" }
      } else {
        throw new HttpError(401, "Unauthorized", {
          validation: "Missing test header",
        })
      }
    },
    async (req, res) => {
      return res.send("Hello World!", {
        "Content-Type": "text/plain",
      })
    }
  )
  .post("/test", async (req, res) => {
    return res.json(req.body)
  })
  .get("/product/*", async (req, res) => {
    console.log(staticPath)

    return serveStatic({
      directory: staticPath,
      maxAge: 2000,
    })(req, res)
  })
  .get("/test-multiple/*", async () => {})
  .get("/test-multiple/", async (_req, res) => {
    res.send("Yess otra vezzz", {
      "Content-Type": "text/plain",
    })
  })

app.listen(PORT).then(() => {
  console.log(`Server listening on port ${PORT}\n`)
})
