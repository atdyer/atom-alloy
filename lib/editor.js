'use babel';

// Alloy
import alloy_command from './alloy-command';

// Atom
import { CompositeDisposable, Emitter } from 'atom';


export default function editor () {

    let _alloy = null,
        _atom_editor = null,
        _editor_subscriptions = new CompositeDisposable(),
        _emitter = new Emitter();

    let _commands = [],
        _comp_module = null;

    let _is_compiling = false,
        _is_compiled = false,
        _is_compile_invalidated = true;

    let _run_queue = [],
        _dequeueing = false;


    function _editor (editor) {

        // Set the atom editor we're proxying
        _atom_editor = editor;

        // Subscribe to text changes
        _editor_subscriptions.dispose();
        _editor_subscriptions.add(
            _atom_editor.onDidStopChanging(_on_did_stop_changing),
            _atom_editor.onDidDestroy(_editor.dispose)
        );

        // Attempt to parse the editor
        _editor.parse();

        return _editor;

    }

    _editor.alloy = function (alloy) {

        if (!arguments.length) return _alloy;

        if (alloy) {
            alloy.on_java_running(function () {
                _alloy = alloy;
                _editor.parse();
            });
        }

        return _editor;

    }

    _editor.commands = function (commands) {

        if (!commands) return _commands;

        _commands = commands.map(function (command) {

            // Look for existing command
            let existing_command = _commands.find(function (existing) {

                // We will consider commands equal if:
                // - toString() results are equivalent, or
                // - they are on the same line
                //
                // Consider what will happen if a blank line is inserted before
                // two lines of commands....
                //
                // - command is a raw command, straight from the parser
                // - existing is a proxy command, created by us
                return (existing.string() === command.toString()) ||
                    (existing.position() === command.pos.y);

            });

            // If the command exists, we only need to update its data,
            // otherwise we need to create a new command
            if (existing_command) {

                return existing_command
                    .command(command);

            } else {

                return alloy_command(_editor)
                    .alloy(_alloy)
                    .command(command);

            }
        });

        _emitter.emit('commands', _commands);

        return _editor;
    }

    _editor.compile = function () {

        if (_alloy) {

            if (!_is_compile_invalidated && (_is_compiling || _is_compiled)) return;

            _is_compile_invalidated = false;
            _is_compiling = true;
            _is_compiled = false;

            _clear_solutions();
            _atom_editor.save();
            _alloy.compile(_editor.path(), _on_compiled);
        }

    }

    _editor.compiled = function () {
        return _is_compiled;
    }

    _editor.dispose = function () {

        _editor_subscriptions.dispose();
        _commands.forEach(function (command) {
            command.dispose();
        });

    }

    _editor.on_commands_changed = function (callback) {
        return _emitter.on('commands', callback);
    }

    _editor.on_compile_changed = function (callback) {
        return _emitter.on('compile', callback);
    }

    _editor.parse = function () {
        if (_atom_editor && _alloy)
            _alloy.parse(_atom_editor.getText(), _on_parse);
        return _editor;
    }

    _editor.path = function () {

        if (_atom_editor) return _atom_editor.getPath();

    }

    _editor.run = function (command, state_callback) {

        // An item that can enter the queue must
        // have a command and a callback that can
        // receive the current state as a string
        let queue_item = {
            command: command,
            state_callback: state_callback || () => {}
        }

        // Set to pending
        queue_item.state_callback('pending');

        // Add the item to the queue
        _run_queue.push(queue_item);

        // Ensure the editor has compiled
        // before kicking off the dequeue operations
        if (!_is_compiled) {
            _editor.compile();
        } else if (!_dequeueing) {
            _dequeue();
        }

    }

    _editor.run_all = function () {
        _commands.forEach(function (command) {
            command.run();
        });
    }

    function _clear_solutions () {
        _commands.forEach(function (command) {
            command.solution(null);
        });
    }

    function _dequeue () {

        _dequeueing = true;

        if (_run_queue.length && _alloy && _is_compiled && _comp_module) {
            let item = _run_queue.shift();
            let sigs = _comp_module.getAllReachableSigsSync();
            item.state_callback('running');
            _alloy.execute(sigs, item.command, _on_run);
        } else {
            _dequeueing = false;;
        }

    }

    function _invalidate_compile () {
        // This changes the compiled status to false,
        // and if a file is currently being compiled,
        // will not allow its results to be used.
        _comp_module = null;
        _is_compiled = false;
        _is_compile_invalidated = true;
        _emitter.emit('compile', false);
    }

    function _on_did_stop_changing (text_change_event) {
        if (text_change_event) {

            function contains_text (e) {
                let old_contains = e.oldText.trim().length !== 0;
                let new_contains = e.newText.trim().length !== 0;
                return old_contains || new_contains;
            }

            let text_change = text_change_event.changes.find(contains_text);

            if (text_change) {
                _editor.parse();
            }
        }
    }

    function _on_parse (error, result) {

        if (error) {
            console.log('Error parsing file.');
        } else {
            _invalidate_compile();
            _editor.commands(result.getAllCommandsSync().toArraySync());
        }

    }

    function _on_compiled (error, comp_module) {

        // This might be a nice Alloy model....

        _is_compiling = false;

        if (error) {

            console.log('Error compiling file: ' + error);

        } else {

            if (!_is_compile_invalidated) {

                // Keep the compiled comp module for running commands
                _comp_module = comp_module;
                _is_compiled = true;
                _emitter.emit('compile', true);

                // Set the commands to ones that can run
                _editor.commands(
                    _comp_module.getAllCommandsSync().toArraySync()
                );

                // Check for any queued actions
                _dequeue();

            } else {

                _is_compile_invalidated = false;

                // Do nothing with the results, they are invalid

            }

        }

    }

    function _on_run (command, error, result) {

        if (error) {
            console.log(error);
        } else {
            command.solution(result);
            _dequeue();
        }

    }

    return _editor;

}
