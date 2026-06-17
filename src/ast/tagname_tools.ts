import { type Node, type TagHandles } from './nodes.ts'

type TagHandle = TagHandles[number]

const DEFAULT_TAG_HANDLES: TagHandle[] = [
  { handle: '!', prefix: '!' },
  { handle: '!!', prefix: 'tag:yaml.org,2002:' }
]

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

function tagNameFull (rawTag: string, tagHandles?: TagHandles) {
  if (rawTag.startsWith('!<') && rawTag.endsWith('>')) {
    return tagPercentDecode(rawTag.slice(2, -1))
  }

  const handleEnd = rawTag.indexOf('!', 1)
  const handle = handleEnd === -1 ? '!' : rawTag.slice(0, handleEnd + 1)
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

function nodeTagShort (node: Node) {
  return node.style.tagged ? node.tag : tagNameShort(node.tag)
}

export {
  tagPercentEncode,
  tagPercentDecode,
  tagNameFull,
  tagNameShort,
  nodeTagShort
}
