import { Faster } from "../src/index"

const app = new Faster()

app.get("/", async (req, res) => {
  res.json({ message: "Hello World!" })
})

app.listen(3000)
