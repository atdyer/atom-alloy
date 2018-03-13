'use babel';

// Views
import view_alloy_command from './views/components/view-alloy-command';

// Atom
import { Emitter } from 'atom';

export default function alloy_command (editor) {

    let _alloy = null,
        _command = null,
        _emitter = new Emitter(),
        _solution = null,
        _view = view_alloy_command();

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
        _emitter.emit('label', _alloy_command.label());
        _emitter.emit('is-check', _alloy_command.is_check());
        return _alloy_command;

    }

    _alloy_command.dispose = function () {
        _emitter.dispose();
    }

    _alloy_command.is_check = function () {
        if (_command) return _command.check;
        return false;
    }

    _alloy_command.key = function () {
        if (_command) return editor.path() + ':' + _alloy_command.position();
    }

    _alloy_command.label = function () {
        if (_command) return _command.label;
    }

    _alloy_command.on_is_check = function (callback) {
        return _emitter.on('is-check', callback);
    }

    _alloy_command.on_label = function (callback) {
        return _emitter.on('label', callback);
    }

    _alloy_command.on_state = function (callback) {
        return _emitter.on('state', callback);
    }

    _alloy_command.on_solution = function (callback) {
        return _emitter.on('solution', callback);
    }

    _alloy_command.position = function () {
        if (_command) return _command.pos.y;
    }

    _alloy_command.run = function () {

        function _state_callback (state) {
            _emitter.emit('state', state);
        }

        editor.run(_alloy_command, _state_callback);
    }

    _alloy_command.show_solution = function () {
        if (_solution && _alloy) {
            let tempfile = editor.path() + '.solution';
            _solution.writeXML(tempfile);
            _alloy.visualize(tempfile);
        }
    }

    _alloy_command.solution = function (solution) {
        if (!arguments.length) return _solution;
        _solution = solution;
        _emitter.emit('solution', _solution);
        return _alloy_command;
    }

    _alloy_command.string = function () {
        if (_command) return _command.toString();
    }

    _view
        .command(_alloy_command);

    return _alloy_command;

}
