var MonacoAdapter = (function() {
  var TextOperation = ot.TextOperation;
  var Selection = ot.Selection;

  function MonacoAdapter(monacoIns) {
    this.monacoIns = monacoIns;
    monacoIns.onDidChangeModelContent(function(a, b) {
      console.log(a, b)
    });
    console.log('new MonacoAdapter');
  }

  return MonacoAdapter;
}())