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

    let _commands = [];

    let _is_compiling = false,
        _is_compiled = false,
        _is_compile_invalidated = true;

    function _editor (editor) {

        // Set the atom editor we're proxying
        _atom_editor = editor;

        // Subscribe to text changes
        _editor_subscriptions.dispose();
        _editor_subscriptions.add(
            _atom_editor.onDidStopChanging(_editor.parse),
            _atom_editor.onDidDestroy(_editor.dispose)
        );

        return _editor;

    }

    _editor.alloy = function (alloy) {

        if (!arguments.length) return _alloy;

        if (alloy) {
            alloy.on_java_running(function () {
                _alloy = alloy;
                _commands.forEach(function (command) {
                    command.alloy(_alloy);
                });
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

            _atom_editor.save();
            _alloy.compile(_editor.path(), _on_compiled);
        }

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

    _editor.parse = function () {
        if (_atom_editor && _alloy) _alloy.parse(_atom_editor.getText(), _on_parse);
        return _editor;
    }

    _editor.path = function () {

        if (_atom_editor) return _atom_editor.getPath();

    }

    function _invalidate_compile () {
        // This changes the compiled status to false,
        // and if a file is currently being compiled,
        // will not allow its results to be used.
        _is_compiled = false;
        _is_compile_invalidated = true;
    }

    function _on_parse (error, result) {

        if (error) {
            console.log('Error parsing file.');
        } else {
            _invalidate_compile();
            _editor.commands(result.getAllCommandsSync().toArraySync());
        }

    }

    function _on_compiled (error, result) {

        // This might be a nice Alloy model....

        _is_compiling = false;

        if (error) {

            console.log('Error compiling file: ' + error);

        } else {

            if (!_is_compile_invalidated) {

                _is_compiled = true;

                // Do stuff with the results
                console.log(result);

            } else {

                _is_compile_invalidated = false;

                // Do nothing with the results, they are invalid

            }

        }

    }

    return _editor;

}
