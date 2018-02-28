'use babel';

// Libraries
import * as d3 from 'd3-selection';

// Utilities
import { extension } from './util';

// atom
import { CompositeDisposable } from 'atom';


export default function alloy_editor () {

    let _editor = null,
        _runner = null,
        _subscriptions = new CompositeDisposable(),
        _editor_subscriptions = new CompositeDisposable(),
        _runner_subscriptions = new CompositeDisposable();

    let _alloy_editor = {};


    _alloy_editor.dispose = function () {

        _subscriptions.dispose();
        _editor_subscriptions.dispose();
        _runner_subscriptions.dispose();
        return _alloy_editor;

    }

    _alloy_editor.editor = function (editor) {

        // Return the editor if one isn't being set
        if (!editor) return _editor;

        // Unsubscribe from previous editor
        _editor_subscriptions.dispose();

        // Check file extension
        if (extension(editor.getPath()) === 'als') {

            // Subscribe to editor
            _editor = editor;
            _editor_subscriptions.add(
                _editor.onDidStopChanging(_parse_editor)
            );

            // Parse the editor
            _parse_editor();

            // Show the alloy panel
            atom.workspace.open('atom://alloy');

        } else {

            // Unset the editor and hide the panel
            _editor = null;
            atom.workspace.hide('atom://alloy');
        }
    }

    _alloy_editor.runner = function (runner) {

        // Return the runner if one isn't being set
        if (!runner) return _runner;

        // Unsubscribe from previous runner
        _runner_subscriptions.dispose();

        // Subscribe to the new runner
        _runner = runner;
        _runner_subscriptions.add(
            _runner.on_java_ready(_parse_editor)
        );

        return _alloy_editor;

    }

    function _create_alloy_editor () {

        // Subscribe to changes in the active text editor
        _subscriptions.add(
            atom.workspace.observeActiveTextEditor(_alloy_editor.editor)
        );

        return _alloy_editor;

    }

    function _parse_editor () {

        if (_editor && _runner) _runner.parse(_editor);

    }

    return _create_alloy_editor();

}

// export default class AlloyEditor {
//
//     constructor(runner) {
//
//         this._editor = null;
//         this._runner = null;
//         this._watcher = null;
//
//         this.setRunner(runner);
//
//     }
//
//     setEditor(editor) {
//         if (this._watcher) this._watcher.dispose();
//         if (editor && extension(editor.getTitle()) === 'als') {
//             this._editor = editor;
//             this._watcher = editor.onDidStopChanging(() => { this._parseEditor() });
//             this._parseEditor();
//         } else {
//             this._editor = null;
//         }
//     }
//
//     setRunner(runner) {
//
//         if (runner) {
//             this._runner = runner;
//             this._runner.on_java_ready(() => { this._parseEditor() });
//         }
//
//     }
//
//     _parseEditor() {
//         if (this._editor && this._runner) {
//             this._runner.parse(this._editor);
//         }
//     }
// }
