'use strict';

module.exports.withMeta = (value, meta) => Object.defineProperty(value, Symbol.for('yaml.meta'), { value: meta });
