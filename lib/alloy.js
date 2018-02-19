'use babel';

import AlloyView from './alloy-view';
import AlloyRunner from './alloy-runner';
import { CompositeDisposable, Disposable } from 'atom';

export default {

  runner: null,
  subscriptions: null,
  watcher: null,
  view: null,

  initialize() {

    // Create everything we need
    this.editor = null;
    this.runner = new AlloyRunner();
    this.subscriptions = new CompositeDisposable();
    this.watcher = null;
    this.view = new AlloyView();

    // Listen to the UI for requests to run commands
    this.view.onRunCommand((command) => {
      this.editor.save().then(function () {
        this.runner.execute(this.editor.getPath(), command);
      }.bind(this));
    });

    // Listen to runner for availability of various Alloy things
    this.runner.onCommandsAvailable((commands) => this.view.setCommands(commands));
    this.runner.onSignaturesAvailable((signatures) => this.view.setSignatures(signatures));
    this.runner.onSyntaxError((error) => this.markError(error));

    // Create subscriptions for various event-based tasks
    this.buildSubscriptions();

  },

  buildSubscriptions() {

    // Return the view when the Alloy package is requested
    this.subscriptions.add(
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://alloy') {
          return this.view;
        }
      })
    );

    // Watch the workspace for changes in the active text editor
    this.subscriptions.add(
      atom.workspace.observeActiveTextEditor(this.setEditor.bind(this))
    );

  },

  markError(error) {
    let position = error.cause.pos;
    console.log(position);
    // let marker = this.editor.markBufferRange([[position.x, position.y], [position.x2, position.y2+1]]);
    let marker = this.editor.markScreenRange([[0,0], [30, 10]], { invalidate: 'never' });
    this.editor.decorateMarker(marker, {
      type: 'line-number',
      class: 'line-red'
    });

  },

  deactivate() {
    if (this.subscriptions) this.subscriptions.dispose();
    if (this.watcher) this.watcher.dispose();
    if (this.view) this.view.destroy();
  },

  setEditor(editor) {
    if (this.watcher) {
      this.watcher.dispose();
    }
    if (editor && extension(editor.getTitle()) === 'als') {
      this.editor = editor;
      this.watcher = this.editor.onDidStopChanging(this.parseCurrentFile.bind(this));
      this.setPaneVisible(true);
      this.parseCurrentFile();
    } else {
      this.editor = null;
      this.setPaneVisible(false);
    }
  },

  setPaneVisible(isVisible) {
    if (isVisible) {
      atom.workspace.open('atom://alloy')
    } else {
      atom.workspace.hide('atom://alloy');
    }
  },

  parseCurrentFile() {
    if (this.runner && this.editor) this.runner.parse(this.editor.getText());
  },

  toggle() {
    atom.workspace.toggle('atom://alloy');
  }

};

function extension (file) {
  return file.split('.').pop();
}
