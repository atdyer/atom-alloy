'use babel';

// Alloy
import alloy_command from './alloy-command';

// Atom
import { CompositeDisposable } from 'atom';


export default function editor () {

    let _alloy = null,
        _atom_editor = null,
        _editor_subscriptions = new CompositeDisposable();

    let _commands = [];

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
                console.log('Alloy set for editor');
                _commands.forEach(function (command) {
                    command.alloy(_alloy);
                });
            });
        }

        return _editor;

    }

    _editor.commands = function (commands) {

        if (!commands) return _commmands;

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
                return
                    existing.string() === command.toString() ||
                    existing.position() === command.pos.y;

            });

            // If the command exists, we only need to update its data,
            // otherwise we need to create a new command
            if (existing_command) {

                return existing_command
                    .command(command);

            } else {

                return alloy_command()
                    .alloy(_alloy)
                    .command(command);

            }
        });

        // TODO: Pick up from here.
        _commands.forEach(function (c) {
            console.log(c.string());
        });

        return _editor;
    }

    _editor.dispose = function () {

        _editor_subscriptions.dispose();
        _commands.forEach(function (command) {
            command.dispose();
        });

    }

    _editor.parse = function () {

        if (_atom_editor && _alloy) _alloy.parse(_atom_editor.getText(), _on_parse);

        return _editor;

    }

    function _on_parse (error, result) {

        if (error) {
            console.log('Error parsing file.');
        } else {
            _editor.commands(result.getAllCommandsSync().toArraySync());
        }

    }

    return _editor;

}
