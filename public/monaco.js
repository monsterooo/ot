require.config({ paths: { 'vs': 'https://cdn.staticfile.org/monaco-editor/0.20.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
  var monacoIns = monaco.editor.create(document.getElementById('container'), {
    value: [
      'function x() {',
      '\tconsole.log("Hello world!");',
      '}'
    ].join('\n'),
    language: 'javascript'
  });
  window.monacoIns = monacoIns;
  new MonacoAdapter(monacoIns);

});