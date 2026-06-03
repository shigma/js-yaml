import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const specDir = path.join(rootDir, 'test', 'spec')
const suiteDir = path.join(specDir, 'yaml-test-suite')
const commitFile = path.join(specDir, 'yaml-test-suite.commit')
const repoUrl = 'https://github.com/yaml/yaml-test-suite.git'

function git (args, options = {}) {
  const result = spawnSync('git', args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit'
  })

  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr.trim()}` : ''
    throw new Error(`git ${args.join(' ')} failed${stderr}`)
  }

  return result.stdout?.trim() ?? ''
}

try {
  fs.mkdirSync(specDir, { recursive: true })

  // Update means "forget pinned version"; the normal path below will resolve
  // current HEAD, write it as the new marker, and download that exact commit.
  if (process.argv[2] === 'update' && fs.existsSync(commitFile)) {
    fs.unlinkSync(commitFile)
  }

  let commit = fs.existsSync(commitFile)
    ? fs.readFileSync(commitFile, 'utf8').trim()
    : ''

  if (!commit) {
    const output = git(['ls-remote', repoUrl, 'HEAD'], { capture: true })
    commit = output.split(/\s+/)[0]

    if (!/^[0-9a-f]{40}$/i.test(commit)) {
      throw new Error(`Invalid HEAD commit from ${repoUrl}: ${output}`)
    }

    fs.writeFileSync(commitFile, `${commit}\n`)
  }

  // If the suite is already present at the pinned commit, nothing to do.
  let currentCommit = ''
  if (fs.existsSync(path.join(suiteDir, '.git'))) {
    currentCommit = git(['-C', suiteDir, 'rev-parse', 'HEAD'], { capture: true })
  }

  if (currentCommit === commit) {
    console.log(`yaml-test-suite already at ${commit}`)
    process.exit(0)
  }

  // Recreate the directory instead of trying to merge/update an external tree.
  fs.rmSync(suiteDir, { recursive: true, force: true })
  fs.mkdirSync(suiteDir)

  git(['-C', suiteDir, 'init', '-q'])
  git(['-C', suiteDir, 'remote', 'add', 'origin', repoUrl])
  git(['-C', suiteDir, 'fetch', '--depth', '1', 'origin', commit])
  git(['-C', suiteDir, 'checkout', '--detach', '-q', 'FETCH_HEAD'])

  console.log(`yaml-test-suite ready at ${commit}`)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
