import jsyaml from '../../lib/index_vite_proxy.tmp.mjs'
import codemirror from 'codemirror'
import { inspect } from 'util'
import default_text from './sample.mjs'

import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/mode/javascript/javascript.js'
import './demo.css'

var source, result, permalink, clear;

function encodeBase64(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

function decodeBase64(str) {
  return new TextDecoder().decode(Uint8Array.from(atob(str), function (char) {
    return char.charCodeAt(0);
  }));
}

var SexyYamlType = new jsyaml.Type('!sexy', {
  kind: 'sequence', // See node kinds in YAML spec: http://www.yaml.org/spec/1.2/spec.html#kind//
  construct: function (data) {
    return data.map(function (string) { return 'sexy ' + string; });
  }
});

var SEXY_SCHEMA = jsyaml.DEFAULT_SCHEMA.extend([ SexyYamlType ]);

function parse() {
  var str, obj;

  str = source.getValue();
  permalink.href = '#yaml=' + encodeBase64(str);

  try {
    obj = jsyaml.load(str, { schema: SEXY_SCHEMA });

    result.setOption('mode', 'javascript');
    result.setValue(inspect(obj, false, 10));
  } catch (err) {
    result.setOption('mode', 'text/plain');
    result.setValue(err.message || String(err));
  }
}

function updateSource() {
  var yaml;

  if (location.hash && location.hash.toString().slice(0, 6) === '#yaml=') {
    yaml = decodeBase64(location.hash.slice(6));
  }

  source.setValue(yaml || default_text);
  parse();
}

window.onload = function () {
  permalink = document.getElementById('permalink');
  clear = document.getElementById('clear');

  source = codemirror.fromTextArea(document.getElementById('source'), {
    mode: 'yaml',
    lineNumbers: true
  });

  var timer;

  source.on('change', function () {
    clearTimeout(timer);
    timer = setTimeout(parse, 500);
  });

  result = codemirror.fromTextArea(document.getElementById('result'), {
    readOnly: true
  });

  clear.addEventListener('click', function (event) {
    event.preventDefault();
    source.setValue('');
    parse();
  });

  // initial source
  updateSource();
};
