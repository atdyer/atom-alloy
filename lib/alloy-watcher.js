'use babel';

import { CompositeDisposable, Disposable, Emitter } from 'atom';

// const reCommentBlock = '\\/\\*(?:.|\\n)*?\\*\\/';
// const reCommentLine = '(?:--|\\/{2}).*';
// const reRun = '((run|check).*?(?=\\/\\*|--|\\/{2}|\\n))';
// const re = RegExp(reCommentBlock + '|' + reCommentLine + '|' + reRun, 'g');

export default class AlloyWatcher {

  constructor() {
    this.editor = null;
    this.emitter = new Emitter();
    this.subscriptions = null;
  }

  destroy() {
    if (this.emitter) this.emitter.dispose();
    if (this.subscriptions) this.subscriptions.dispose();
  }

  editorStoppedChanging() {
    this.emitter.emit('filechanged', this.editor.getText());
  }

  setEditor(editor) {
    if (editor) {
      this.editor = editor;
      if (this.subscriptions) this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(this.editor.onDidStopChanging(this.editorStoppedChanging.bind(this)));
      this.editorStoppedChanging();
    }
  }

  // scanDocument() {
  //   if (this.editor) {
  //     let runnables = [];
  //     this.editor.scan(re, null, (match) => {
  //       let matches = match.match;
  //       if (matches[2] === 'run' || matches[2] === 'check') {
  //         runnables.push({
  //           type: matches[2],
  //           command: matches[1]
  //         });
  //       }
  //     });
  //     this.emitter.emit('parse', runnables);
  //   }
  // }

  onFileChanged(callback) {
    this.emitter.on('filechanged', callback);
  }
  //
  // onParse(callback) {
  //   this.emitter.on('parse', callback);
  // }

}
