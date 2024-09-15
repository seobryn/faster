## Faster Web Framework

This is a zero dependency framework that was inspired on different web frameworks like `express`, `koa`, `restify` and is made to make things as simple as possible and as Faster as possible.

### Installation

Faster requires **node.js v.18.19.0** or higher.

```bash
$ npm i @seobryn/faster
```

### Hello World Faster

```js
import { Faster } from '@seobryn/faster'

const app = new Faster()

app.get('/', (req, res) => {
    return res.json({
        Hello: "World Faster"
    })
})

app.listen(3210)
```


### Road map
- [x] Basic Server creation.
- [x] HTTP Verbs Implemented.
- [x] Optional SSL connection.
- [x] Optional body Parser.
- [x] Error handling.
- [x] Routing implementation.
- [x] Scoped Middleware implementation.
- [ ] Universal Middleware implementation.
