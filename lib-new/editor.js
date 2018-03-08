'use babel';

// Atom
import { CompositeDisposable } from 'atom';

export default function editor () {

    let _alloy = null,
        _editor = null,
        _commands = [],
        _editor_subscriptions = new CompositeDisposable();

    function _editor (editor) {

        // Set the atom editor we're proxying
        _editor = editor;

        // Subscribe to text changes
        _editor_subscriptions.dispose();
        _editor_subscriptions.add(
            editor.onDidStopChanging(_editor.parse)
        );

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
        })

        return _editor;
    }

    _editor.parse = function () {

        if (_editor && _alloy) _alloy.parse(_editor.getText(), _on_parse);

        return _editor;

    }

    _editor.alloy = function (alloy) {

        if (!alloy) return _alloy;

        // Only set alloy once we are sure it is ready to be used
        _alloy.on_java_ready(function () {
            _alloy = alloy;
            _commands.forEach(function (command) {
                command.alloy(_alloy);
            });
        });

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
