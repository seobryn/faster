import fs from 'fs'
import { execSync } from 'child_process'

const __dirname = new URL('.', import.meta.url).pathname

const commitMessage = process.argv[2]

if (!commitMessage) {
  console.error('Please provide a commit message')
  process.exit(1)
}

const pkg = JSON.parse(fs.readFileSync(__dirname + '../package.json', 'utf-8'))

const version = pkg.version.split('.')

let patch = Number(version[2])
let minor = Number(version[1])
let major = Number(version[0])

if (commitMessage.startsWith('feat')) {
  minor += 1
  patch = 0
} else if (commitMessage.startsWith('fix')) {
  patch += 1
} else if (commitMessage.startsWith('release')) {
  major += 1
  minor = 0
  patch = 0
}
pkg.version = `${major}.${minor}.${patch}`

fs.writeFileSync(__dirname + '../package.json', JSON.stringify(pkg, null, 2))

console.log(`v${pkg.version}`)

execSync('git add package.json')
execSync(`git commit -m "${commitMessage}"`)
