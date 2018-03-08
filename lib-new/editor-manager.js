'use babel';

// Utilities
import { extension } from './util';

// Atom
import { CompositeDisposable } from 'atom';


export default function editor_manager () {

    let _active_editor = null,
        _editors = {},
        _runner = null,
        _subscriptions = new CompositeDisposable(),
        _editor_subscriptions = new CompositeDisposable(),
        _runner_subscriptions = new CompositeDisposable();

    let _manager = {};

    _manager.dispose = function () {

        _subscriptions.dispose();
        _editor_subscriptions.dispose();
        _runner_subscriptions.dispose();
        _editors.forEach(function (editor) {
            editor.dispose();
        });

        return _manager;

    }

    function _build_manager () {

        // Subscribe to changes in the active text editor
        _subscriptions.add(
            atom.workspace.observeActiveTextEditor(_set_active_editor)
        );

        return _manager;

    }

    function _parse_active_editor () {

        if (_active_editor) _active_editor.parse();

    }

    function _set_active_editor (editor) {

        let path = editor.getPath();

        // Unsubscribe from previous editor
        _editor_subscriptions.dispose();

        // Check the file extension
        if (extension(path) === 'als') {

            // Check if the editor has been previously opened
            let e =  _editors[path];
            if (!e) {

                // It hasn't, so make a new one
                e = alloy_editor()
                    .runner(_runner);

                // Store the new editor
                _editors[path] = e(editor);

            }

            // Set the active editor
            _active_editor = e;

            // Subscribe to the active editor
            _subscribe_to_active_editor();

            // Parse the active editor
            _parse_active_editor();

            // Show the alloy panel
            atom.workspace.open('atom://alloy');

        } else {

            // Unset the active editor
            _active_editor = null;

            // Hide the alloy panel
            atom.workspace.hide('atom://alloy');

        }

    }

    function _subscribe_to_active_editor () {

        if (_active_editor) {
            _editor_subscriptions.add(
                _editor.onDidStopChanging(_parse_active_editor);
            );
        }

    }

    function _subscribe_to_runner () {

        if (_runner) {
            _runner_subscriptions.add(
                _runner.on_java_ready(_parse_active_editor)
            );
        }

    }

    return _build_manager();

}
