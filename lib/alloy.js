'use babel';

// import AlloyView from './alloy-view';
import alloy_config from './alloy-config';
import alloy_view from './alloy-view';
import alloy_runner from './alloy-runner-new';
import alloy_editor from './alloy-editor';
import { CompositeDisposable, Disposable } from 'atom';
import { extension } from './util';

export default {

    config: alloy_config,
    error_markers: [],
    runner: null,
    subscriptions: null,
    watcher: null,
    view: null,

    initialize() {

        // Create the runner, which is in charge of firing up
        // a Java runtime in order to perform parsing and running
        // of Alloy commands. (Don't set the jar yet, we want to
        // set up the UI first so that the user will be able to
        // see the loading process).
        this.runner = alloy_runner();

        // Create the side panel, which displays available Alloy
        // commands and other messages/warnings/errors.
        this.view = alloy_view()
            .runner(this.runner)
            .element(document.createElement('div'));

        // Create the Alloy editor, which is in charge of highlighting
        // the active text editor if an Alloy file is displayed, showing
        // syntax error locations.
        this.editor = alloy_editor()
            .runner(this.runner);

        // Now set the jar file (which also tells the runner to listen
        // for changes in the jar file).
        this.runner.jar(atom.config.get('alloy.jar'));

        // Listen to the UI for requests to run commands
        // this.view.onRunCommand((command) => {
        //   this.editor.save().then(function () {
        //     this.runner.execute(this.editor.getPath(), command);
        //   }.bind(this));
        // });

        // Listen to runner for availability of various Alloy things
        // this.runner.onCommandsAvailable((commands) => this.view.setCommands(commands));
        // this.runner.onCommandsAvailable(() => this.clearErrors());
        // this.runner.onSignaturesAvailable((signatures) => this.view.setSignatures(signatures));
        // this.runner.onSyntaxError((error) => this.markError(error));

    },



    clearErrors() {
        this.error_markers.forEach(function(marker) {
            marker.destroy();
        });
        this.error_markers = [];
    },

    markError(error) {
        this.clearErrors();
        let position = error.cause.pos;
        console.log(position);
        let line_start = position.y - 1,
            line_end = position.y2 - 1,
            col_start = position.x,
            col_end = position.x2
        // let marker = this.editor.markBufferRange([[position.x, position.y], [position.x2, position.y2+1]]);
        // let marker = this.editor.markScreenRange([[5,0], [10, 0]], { invalidate: 'never' });
        let marker = this.editor.markScreenRange(
            [
                [line_start, col_start],
                [line_end, col_end]
            ], {
                invalidate: 'never'
            }
        );
        this.editor.decorateMarker(marker, {
            type: 'line-number',
            class: 'git-line-added'
        });

        this.error_markers.push(marker);

    },

    deactivate() {
        if (this.subscriptions) this.subscriptions.dispose();
        if (this.watcher) this.watcher.dispose();
        if (this.editor) this.editor.dispose();
        if (this.view) this.view.dispose();
        if (this.runner) this.runner.dispose();
    },

    setEditor(editor) {
        if (editor && extension(editor.getTitle()) === 'als') {
            this.editor.editor(editor);
            this.setPaneVisible(true);
        } else {
            // this.editor.setEditor(null);
            this.setPaneVisible(false);
        }
        // if (this.watcher) {
        //     this.watcher.dispose();
        // }
        // if (editor && extension(editor.getTitle()) === 'als') {
        //     this.editor = editor;
        //     this.watcher = this.editor.onDidStopChanging(this.parseCurrentFile.bind(this));
        //     this.setPaneVisible(true);
        //     this.parseCurrentFile();
        //
        //     // Temp: play with gutter icons
        //     let gutter = atom.views.getView(editor).querySelector('.gutter');
        //     gutter.classList.add('git-diff-icon');
        //
        // } else {
        //     this.editor = null;
        //     this.setPaneVisible(false);
        // }
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
