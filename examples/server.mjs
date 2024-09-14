import { Faster } from '../index.mjs'

const app = new Faster({ parseBody: true, log: { errorAsJson: true } })

app
  .get('/', async (req, res) => {
    return res.send('Hello World!')
  })
  .post('/test', async (req, res) => {
    return res.json(req.body)
  })

app.listen(3000).then(() => {
  console.log('Server listening on port 3000\n')
})
