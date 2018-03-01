'use babel';

import * as d3 from 'd3-selection';

export default function command_button () {

    let _file = null,
        _key = null,
        _bindings = null,
        _command = null;

    let _div = null,
        _type_icon = null,
        _message = null,
        _key_bindings = null,
        _status_icon = null;

    function _command_button (div) {

        _div = div;
        _div.classed('item', true);

        _type_icon = _select_type_icon(_div);
        _message = _select_message(_div);
        _key_bindings = _select_key_bindings(_div);
        _status_icon = _select_status_icon(_div);

        _command_button.bindings(_bindings);
        _command_button.command(_command);
        _command_button.file(_file);
        _command_button.key(_key);


    }

    _command_button.bindings = function (bindings) {
        if (!bindings) return _bindings;
        _bindings = bindings;
        return _command_button;
    }

    _command_button.command = function (command) {
        if (!command) return _command;
        _command = command;
        return _command_button;
    }

    _command_button.dispose = function () {

        if (_bindings) {
            _bindings.keymap.dispose();
            _bindings.tooltip.dispose();
        }

        return _command_button;

    }

    _command_button.file = function (file) {
        if (!file) return _file;
        _file = file;
        return _command_button;
    }

    _command_button.key = function (key) {
        if (!key) return _key;
        _key = key;
        return _command_button;
    }

    function _select_type_icon (selection) {

        let _selection = selection.selectAll('.cmd-type')
            .data(['command-type']);

        _selection.exit()
            .remove();

        return _selection.enter()
            .append('div')
            .attr('class', 'cmd-type icon')
            .merge(_selection);

    }

    function _select_message (selection) {

        let _selection = selection.selectAll('.cmd-message')
            .data(['command-message']);

        _selection.exit()
            .remove();

        return _selection.enter()
            .append('div')
            .attr('class', 'cmd-message')
            .merge(_selection);

    }

    function _select_key_bindings (selection) {

        let _selection = selection.selectAll('.key-bindings')
            .data(['key-bindings']);

        _selection.exit()
            .remove();

        let _enter = _selection.enter()
            .append('div')
            .attr('class', 'right key-bindings');

        _enter.append('kbd')
            .attr('class', 'key-binding');

        return _enter.merge(_selection);

    }

    function _select_status_icon (selection) {

        let _selection = selection.selectAll('.cmd-status')
            .data(['command-status']);

        _selection.exit()
            .remove();

        return _selection.enter()
            .append('div')
            .attr('class', 'cmd-status right icon icon-primitive-dot')
            .merge(_selection);

    }

    return _command_button;

}
