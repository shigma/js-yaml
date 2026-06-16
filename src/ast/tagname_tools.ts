import { type Node, type TagHandles } from './nodes.ts'

type TagHandle = TagHandles[number]

const DEFAULT_TAG_HANDLES: TagHandle[] = [
  { handle: '!', prefix: '!' },
  { handle: '!!', prefix: 'tag:yaml.org,2002:' }
]

const TAG_HANDLE_RE = /^(![\w-]*!|!)/
const TAG_URI_RE = /^(?:[0-9A-Za-z\-#;/?:@&=+$,_.!~*'()[\]%]|%[0-9A-Fa-f]{2})*$/

function tagHandlePrefix (handle: string, tagHandles?: TagHandles) {
  const userHandle = tagHandles?.find(item => item.handle === handle)
  if (userHandle !== undefined) return userHandle.prefix

  return DEFAULT_TAG_HANDLES.find(item => item.handle === handle)?.prefix ?? handle
}

function tagPercentDecode (source: string) {
  return decodeURIComponent(source)
}

function tagPercentEncode (source: string) {
  return encodeURI(source).replace(/!/g, '%21')
}

function tagCheckError (rawTag: string) {
  if (rawTag === '') return 'tag is empty'
  if (rawTag.charCodeAt(0) !== 0x21) return `tag must start with "!": ${rawTag}`

  let suffix: string

  if (rawTag.startsWith('!<')) {
    if (!rawTag.endsWith('>')) return `verbatim tag is not closed: ${rawTag}`
    suffix = rawTag.slice(2, -1)
  } else {
    const match = TAG_HANDLE_RE.exec(rawTag)
    if (!match) return `cannot resolve tag "${rawTag}"`
    suffix = rawTag.slice(match[1].length)
    if (suffix.includes('!')) return 'tag suffix cannot contain exclamation marks'
  }

  if (suffix && !TAG_URI_RE.test(suffix)) return `tag name cannot contain such characters: ${suffix}`

  try {
    tagPercentDecode(suffix)
  } catch {
    return `tag name is malformed: ${rawTag}`
  }

  return null
}

function tagNameFull (rawTag: string, tagHandles?: TagHandles) {
  const error = tagCheckError(rawTag)
  if (error !== null) throw new Error(error)

  if (rawTag.startsWith('!<') && rawTag.endsWith('>')) {
    return tagPercentDecode(rawTag.slice(2, -1))
  }

  const match = TAG_HANDLE_RE.exec(rawTag)
  if (!match) throw new Error(`cannot resolve tag "${rawTag}"`)

  const handle = match[1]
  const prefix = tagHandlePrefix(handle, tagHandles)

  return tagPercentDecode(prefix) + tagPercentDecode(rawTag.slice(handle.length))
}

function tagNameShort (fullTag: string) {
  let tag = fullTag

  if (tag.charCodeAt(0) === 0x21) {
    tag = tag.slice(1)
    return `!${tagPercentEncode(tag)}`
  }

  if (tag.slice(0, 18) === 'tag:yaml.org,2002:') {
    return `!!${tagPercentEncode(tag.slice(18))}`
  }

  return `!<${tagPercentEncode(tag)}>`
}

function nodeTagFull (node: Node, tagHandles?: TagHandles) {
  return node.style.tagged ? tagNameFull(node.tag, tagHandles) : node.tag
}

function nodeTagShort (node: Node) {
  return node.style.tagged ? node.tag : tagNameShort(node.tag)
}

export {
  tagPercentEncode,
  tagPercentDecode,
  tagNameFull,
  tagNameShort,
  tagCheckError,
  nodeTagFull,
  nodeTagShort
}
