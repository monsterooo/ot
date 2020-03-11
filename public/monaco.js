require.config({ paths: { 'vs': 'https://cdn.staticfile.org/monaco-editor/0.20.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
  var monacoIns = monaco.editor.create(document.getElementById('container'), {
    value: ['Monaco Editor Sample'].join('\n'),
    language: 'javascript'
  });
  window.monacoIns = monacoIns;
  new MonacoAdapter(monacoIns);

});

/*
var model = monacoIns.getModel() // 获取模型
mode.pushEditOperations(
  beforeCursirState: Selection[],
  editOperations: IIdentifiedSingleEditOperation[],
  cursorStateComputer: ICursorStateComputer
)
// 第一行第二个字符到第一行第五个字符
var range = new monaco.Range(
  1, 2, 1, 5
)
model.pushEditOperations(
  [],
  [{
    range: range,
    text: '!'
  }],
  () => null
)

var modelRange = model.getFullModelRange() // 获取模型范围
model.getCharacterCountInRange(modelRange) // 获取范围内位子数
*/