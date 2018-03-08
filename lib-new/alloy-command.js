'use babel';

// Views
import alloy_command_view from './views/alloy-command-view';


export default function alloy_command () {

    let _alloy = null,
        _command = null; //,
        // _view = alloy_command_view()(_alloy_command);

    function _alloy_command (selection) {

        // _view = alloy_command_view()
            // .command(_alloy_command);


        // return _view(selection);
    }

    _alloy_command.alloy = function (alloy) {

        if (!arguments.length) return _alloy;
        _alloy = alloy;
        return _alloy_command;

    }

    _alloy_command.command = function (command) {

        if (!arguments.length) return _command;
        _command = command;
        return _alloy_command;

    }

    _alloy_command.position = function () {

        if (_command) return _command.pos.y;

    }

    _alloy_command.string = function () {

        if (_command) return _command.toString();

    }

    return _alloy_command;

}
