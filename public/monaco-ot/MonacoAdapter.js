var MonacoAdapter = (function() {
  var TextOperation = ot.TextOperation;
  var Selection = ot.Selection;

  function MonacoAdapter(monacoIns) {
    this.monacoIns = monacoIns;
    monacoIns.onDidChangeModelContent(changes => {
      this.operationFromMonacoChange(changes, this.monacoIns);
      
    });
    console.log('new MonacoAdapter');
  }
  MonacoAdapter.prototype.operationFromMonacoChange = function (changes, monacoIns) {
    var docEndLength = monacoModelContentLength(monacoIns);
    var operation = new TextOperation().retain(docEndLength);
    
  }

  return MonacoAdapter;
}())

function monacoModelContentLength(monacoIns) {
  var model = monacoIns.getModel();
  var modelRange = model.getFullModelRange()
  return model.getCharacterCountInRange(modelRange);
}