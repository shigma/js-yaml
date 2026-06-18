import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { visit, VISIT_BREAK, VISIT_SKIP } from 'js-yaml'

// Minimal AST builders: `visit` only reads `kind`, `items` and `contents`.
const scalar = value => ({ kind: 'scalar', value })
const seq = (...items) => ({ kind: 'sequence', items })
const map = (...pairs) => ({ kind: 'mapping', items: pairs.map(([key, value]) => ({ key, value })) })
const alias = anchor => ({ kind: 'alias', anchor })
const doc = contents => ({ contents })

// Label a node for order assertions; containers fall back to their kind.
const labelOf = node => {
  if (node.kind === 'scalar') return node.value
  if (node.kind === 'alias') return `*${node.anchor}`
  return node.kind
}

const collect = (documents, control) => {
  const seen = []
  visit(documents, (node, ctx) => {
    seen.push(labelOf(node))
    return control?.(node, ctx)
  })
  return seen
}

describe('visit', () => {
  describe('traversal order', () => {
    it('walks a scalar root', () => {
      assert.deepEqual(collect([doc(scalar('only'))]), ['only'])
    })

    it('visits sequence items in order, parent before children', () => {
      const documents = [doc(seq(scalar('a'), scalar('b'), scalar('c')))]
      assert.deepEqual(collect(documents), ['sequence', 'a', 'b', 'c'])
    })

    it('visits each mapping key before its value', () => {
      const documents = [doc(map([scalar('k1'), scalar('v1')], [scalar('k2'), scalar('v2')]))]
      assert.deepEqual(collect(documents), ['mapping', 'k1', 'v1', 'k2', 'v2'])
    })

    it('descends depth-first (pre-order) through nested containers', () => {
      const documents = [doc(map(
        [scalar('a'), seq(scalar('b'), scalar('c'))],
        [scalar('d'), scalar('e')]
      ))]
      assert.deepEqual(collect(documents), ['mapping', 'a', 'sequence', 'b', 'c', 'd', 'e'])
    })

    it('treats an alias as a leaf (no descent)', () => {
      const documents = [doc(seq(scalar('a'), alias('x')))]
      assert.deepEqual(collect(documents), ['sequence', 'a', '*x'])
    })
  })

  describe('visit context', () => {
    it('reports root content at depth 0 with no parent', () => {
      let ctx
      visit([doc(scalar('root'))], (_node, c) => { ctx = c })
      assert.deepEqual(ctx, { depth: 0, parent: null, isKey: false })
    })

    it('reports depth, parent and isKey for sequence items', () => {
      const root = seq(scalar('a'))
      const ctxByLabel = {}
      visit([doc(root)], (node, ctx) => { ctxByLabel[labelOf(node)] = ctx })
      assert.deepEqual(ctxByLabel.sequence, { depth: 0, parent: null, isKey: false })
      assert.equal(ctxByLabel.a.depth, 1)
      assert.equal(ctxByLabel.a.parent, root)
      assert.equal(ctxByLabel.a.isKey, false)
    })

    it('marks mapping keys with isKey, values without', () => {
      const root = map([scalar('k'), scalar('v')])
      const ctxByLabel = {}
      visit([doc(root)], (node, ctx) => { ctxByLabel[labelOf(node)] = ctx })
      assert.equal(ctxByLabel.k.isKey, true)
      assert.equal(ctxByLabel.k.parent, root)
      assert.equal(ctxByLabel.v.isKey, false)
      assert.equal(ctxByLabel.v.parent, root)
    })

    it('increments depth per nesting level', () => {
      const inner = seq(scalar('deep'))
      const root = seq(inner)
      const depthByLabel = {}
      visit([doc(root)], (node, ctx) => { depthByLabel[labelOf(node)] = ctx.depth })
      assert.deepEqual(depthByLabel, { sequence: 1, deep: 2 })
    })
  })

  describe('VISIT_SKIP', () => {
    it('does not descend into a skipped container but continues with siblings', () => {
      const skipped = seq(scalar('hidden1'), scalar('hidden2'))
      const documents = [doc(seq(scalar('a'), skipped, scalar('b')))]
      const seen = collect(documents, node => (node === skipped ? VISIT_SKIP : undefined))
      assert.deepEqual(seen, ['sequence', 'a', 'sequence', 'b'])
    })

    it('still visits the skipped node itself', () => {
      const root = seq(scalar('x'))
      const seen = collect([doc(root)], node => (node === root ? VISIT_SKIP : undefined))
      assert.deepEqual(seen, ['sequence'])
    })

    it('is a no-op on a leaf', () => {
      const documents = [doc(seq(scalar('a'), scalar('b')))]
      const seen = collect(documents, node => (node.kind === 'scalar' ? VISIT_SKIP : undefined))
      assert.deepEqual(seen, ['sequence', 'a', 'b'])
    })
  })

  describe('VISIT_BREAK', () => {
    it('stops the whole traversal immediately', () => {
      const documents = [doc(seq(scalar('a'), scalar('stop'), scalar('c')))]
      const seen = collect(documents, node => (node.value === 'stop' ? VISIT_BREAK : undefined))
      assert.deepEqual(seen, ['sequence', 'a', 'stop'])
    })

    it('unwinds from deep inside a mapping value', () => {
      const documents = [doc(map(
        [scalar('k1'), seq(scalar('stop'), scalar('skipped'))],
        [scalar('k2'), scalar('never')]
      ))]
      const seen = collect(documents, node => (node.value === 'stop' ? VISIT_BREAK : undefined))
      assert.deepEqual(seen, ['mapping', 'k1', 'sequence', 'stop'])
    })

    it('breaking on a mapping key stops before the value', () => {
      const documents = [doc(map([scalar('k'), scalar('v')]))]
      const seen = collect(documents, node => (node.value === 'k' ? VISIT_BREAK : undefined))
      assert.deepEqual(seen, ['mapping', 'k'])
    })

    it('stops across documents', () => {
      const documents = [doc(scalar('stop')), doc(scalar('next'))]
      const seen = collect(documents, node => (node.value === 'stop' ? VISIT_BREAK : undefined))
      assert.deepEqual(seen, ['stop'])
    })
  })

  describe('document array level', () => {
    it('walks every document in order', () => {
      const documents = [doc(scalar('a')), doc(seq(scalar('b'))), doc(scalar('c'))]
      assert.deepEqual(collect(documents), ['a', 'sequence', 'b', 'c'])
    })

    it('skips documents with empty contents', () => {
      const documents = [doc(null), doc(scalar('a')), doc(null), doc(scalar('b'))]
      assert.deepEqual(collect(documents), ['a', 'b'])
    })

    it('never calls the visitor for an empty document array', () => {
      let calls = 0
      visit([], () => { calls++ })
      assert.equal(calls, 0)
    })
  })
})
