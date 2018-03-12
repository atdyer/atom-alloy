'use babel';

// Views
import view_alloy_command from './views/components/view-alloy-command';


export default function alloy_command () {

    let _alloy = null,
        _command = null,
        _view = view_alloy_command()
            .command(_alloy_command);

    let _is_running = false;

    function _alloy_command (selection) {

        if (_view) return _view(selection);

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

    _alloy_command.is_check = function () {
        if (_command) return _command.check;
        return false;
    }

    _alloy_command.is_error = function () {
        return false;
    }

    _alloy_command.is_idle = function () {
        return !(
            _alloy_command.is_running() ||
            _alloy_command.is_error()
        );
    }

    _alloy_command.is_running = function () {
        return _is_running;
    }

    _alloy_command.key = function () {

        if (_command) return _command.toString();

    }

    _alloy_command.label = function () {
        if (_command) return _command.label;
    }

    _alloy_command.position = function () {

        if (_command) return _command.pos.y;

    }

    _alloy_command.run = function () {
        _is_running = true;
        _view.set_running();
    }

    _alloy_command.string = function () {

        if (_command) return _command.toString();

    }

    return _alloy_command;

}
