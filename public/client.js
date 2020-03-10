(function () {
  var EditorClient = ot.EditorClient;
  var SocketIOAdapter = ot.SocketIOAdapter;
  var AjaxAdapter = ot.AjaxAdapter;
  var CodeMirrorAdapter = ot.CodeMirrorAdapter;

  var socket;

  var disabledRegex = /(^|\s+)disabled($|\s+)/;

  var login = function (username, callback) {
    socket
      .emit('login', { name: username })
      .on('logged_in', callback);
  };

  function enable (el) {
    el.className = el.className.replace(disabledRegex, ' ');
  }

  function disable (el) {
    if (!disabledRegex.test(el.className)) {
      el.className += ' disabled';
    }
  }

  function preventDefault (e) {
    if (e.preventDefault) { e.preventDefault(); }
  }

  function stopPropagation (e) {
    if (e.stopPropagation) { e.stopPropagation(); }
  }

  function stopEvent (e) {
    preventDefault(e);
    stopPropagation(e);
  }

  function removeElement (el) {
    el.parentNode.removeChild(el);
  }

  function beginsWith (a, b) { return a.slice(0, b.length) === b; }
  function endsWith (a, b) { return a.slice(a.length - b.length, a.length) === b; }

  function wrap (chars) {
    cm.operation(function () {
      if (cm.somethingSelected()) {
        cm.replaceSelections(cm.getSelections().map(function (selection) {
          if (beginsWith(selection, chars) && endsWith(selection, chars)) {
            return selection.slice(chars.length, selection.length - chars.length);
          }
          return chars + selection + chars;
        }), 'around');
      } else {
        var index = cm.indexFromPos(cm.getCursor());
        cm.replaceSelection(chars + chars);
        cm.setCursor(cm.posFromIndex(index + 2));
      }
    });
    cm.focus();
  }

  function bold ()   { wrap('**'); }
  function italic () { wrap('*'); }
  function code ()   { wrap('`'); }

  var editorWrapper = document.getElementById('editor-wrapper');
  var cm = window.cm = CodeMirror(editorWrapper, {
    lineNumbers: true,
    lineWrapping: true,
    mode: 'markdown',
    readOnly: 'nocursor'
  });

  var undoBtn = document.getElementById('undo-btn');
  undoBtn.onclick = function (e) { cm.undo(); cm.focus(); stopEvent(e); };
  disable(undoBtn);
  var redoBtn = document.getElementById('redo-btn');
  redoBtn.onclick = function (e) { cm.redo(); cm.focus(); stopEvent(e); };
  disable(redoBtn);

  var boldBtn = document.getElementById('bold-btn');
  boldBtn.onclick = function (e) { bold(); stopEvent(e); };
  disable(boldBtn);
  var italicBtn = document.getElementById('italic-btn');
  italicBtn.onclick = function (e) { italic(); stopEvent(e); };
  disable(italicBtn);
  var codeBtn = document.getElementById('code-btn');
  disable(codeBtn);
  codeBtn.onclick = function (e) { code(); stopEvent(e); };

  var loginForm = document.getElementById('login-form');
  loginForm.onsubmit = function (e) {
    preventDefault(e);
    var username = document.getElementById('username').value;
    login(username, function () {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(username + " (that's you!)"));
      cmClient.clientListEl.appendChild(li);
      cmClient.serverAdapter.ownUserName = username;

      enable(boldBtn);
      enable(italicBtn);
      enable(codeBtn);

      cm.setOption('readOnly', false);
      removeElement(overlay);
      removeElement(loginForm);
    });
  };

  var overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.onclick = stopPropagation;
  overlay.onmousedown = stopPropagation;
  overlay.onmouseup = stopPropagation;
  var cmWrapper = cm.getWrapperElement();
  cmWrapper.appendChild(overlay);

  var cmClient;
  socket = io.connect('/');
  socket.on('doc', function (obj) {
    init(
      obj.str,
      obj.revision,
      obj.clients,
      new SocketIOAdapter(socket) // socket event -> codemirror codemirrir event -> socket
    );
  });

  // uncomment to simulate more latency
  (function () {
    var emit = socket.emit;
    var queue = [];
    socket.emit = function () {
      queue.push(arguments);
      return socket;
    };
    setInterval(function () {
      if (queue.length) {
        emit.apply(socket, queue.shift());
      }
    }, 800);
  })();

  /**
   * 
   * @param {*} str 初始化docuement字符串
   * @param {*} revision 版本号 operations.length
   * @param {*} clients 链接用户对象
   * @param {*} serverAdapter SocketIOAdapter实例对象
   */
  function init (str, revision, clients, serverAdapter) {
    cm.setValue(str);
    cmClient = window.cmClient = new EditorClient(
      revision,
      clients,
      serverAdapter,
      new CodeMirrorAdapter(cm)
    );

    var userListWrapper = document.getElementById('userlist-wrapper');
    userListWrapper.appendChild(cmClient.clientListEl);
    
    cm.on('change', function () {
      if (!cmClient) { return; }
      console.log(cmClient.undoManager.canUndo(), cmClient.undoManager.canRedo());
      (cmClient.undoManager.canUndo() ? enable : disable)(undoBtn);
      (cmClient.undoManager.canRedo() ? enable : disable)(redoBtn);
    });
  }
})();