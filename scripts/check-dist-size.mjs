import { statSync } from 'node:fs'
import { resolve } from 'node:path'

const DIST_FILE = resolve('dist/index.html')
const MAX_BYTES = 500 * 1024

const { size } = statSync(DIST_FILE)

if (size > MAX_BYTES) {
  console.error(
    `dist/index.html is ${size} bytes, which exceeds the ${MAX_BYTES} byte limit.`
  )
  process.exit(1)
}

console.log(`dist/index.html is ${size} bytes.`)
