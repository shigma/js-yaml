import { describe } from 'node:test'

import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Units', async function () {
  const directory = path.resolve(__dirname, 'units')

  for (const file of fs.readdirSync(directory)) {
    if (path.extname(file) === '.mjs') {
      await import(pathToFileURL(path.resolve(directory, file)).href)
    }
  }
})
