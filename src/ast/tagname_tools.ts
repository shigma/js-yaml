import { type TagHandlers } from '../parser/events.ts'
import { type Node } from './nodes.ts'

const DEFAULT_TAG_HANDLERS: TagHandlers = {
  '!': '!',
  '!!': 'tag:yaml.org,2002:'
}

function tagHandlePrefix (handle: string, tagHandlers?: TagHandlers) {
  return tagHandlers?.[handle] ?? DEFAULT_TAG_HANDLERS[handle] ?? handle
}

function tagPercentDecode (source: string) {
  return decodeURIComponent(source)
}

function tagPercentEncode (source: string) {
  return encodeURI(source).replace(/!/g, '%21')
}

function tagNameFull (rawTag: string, tagHandlers?: TagHandlers) {
  if (rawTag.startsWith('!<') && rawTag.endsWith('>')) {
    return tagPercentDecode(rawTag.slice(2, -1))
  }

  const handleEnd = rawTag.indexOf('!', 1)
  const handle = handleEnd === -1 ? '!' : rawTag.slice(0, handleEnd + 1)
  const prefix = tagHandlePrefix(handle, tagHandlers)

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
