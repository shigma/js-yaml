import { describe } from 'node:test'

import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Issues', async () => {
  const issues = path.resolve(__dirname, 'issues')

  for (const file of fs.readdirSync(issues)) {
    if (path.extname(file) === '.mjs') {
      await import(pathToFileURL(path.resolve(issues, file)).href)
    }
  }
})
