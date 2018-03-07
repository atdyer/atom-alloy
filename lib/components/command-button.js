'use babel';

import * as d3 from 'd3-selection';

export default function command_button () {

    let _command = null,
        _file = null,
        _key = null,
        _tooltip = null;

    let _div = null,
        _type_icon = null,
        _message = null,
        _status_icon = null;

    let _events = {};

    function _command_button (div) {

        // Set the top level div
        _div = div.classed('item', true);

        // Make sure all children are present and ready to be updated
        _type_icon = _select_type_icon(_div);
        _message = _select_message(_div);
        _status_icon = _select_status_icon(_div);

        // Set anything that's already been supplied
        _command_button.command(_command);
        _command_button.file(_file);
        _command_button.key(_key);
        _command_button.events(_events);

    }

    // _command_button.bindings = function (bindings) {
    //     if (!bindings) return _bindings;
    //
    //     // Check for existing bindings
    //     if (_bindings && bindings !== _bindings) _command_button.dispose();
    //
    //     // Set the new bindings
    //     _bindings = bindings;
    //
    //     return _command_button;
    // }

    _command_button.command = function (command) {

        // Return the command if requested
        if (!command) return _command;

        // Update the command
        _command = command;

        // Update the tooltip
        if (_tooltip) _tooltip.dispose();
        if (_div) {
            _tooltip = _new_tooltip(_div.node(), _command.toString());
        }

        // Update the command type icon
        if (_type_icon) {
            _type_icon
                .classed('icon-check', _command.check)
                .classed('icon-flame', !_command.check);
        }

        // Update the command text
        if (_message) {
            _message.text(_command.label);
        }

        // Update the status icon
        if (_status_icon) {
            _status_icon
                .classed('running', _command.is_running)
                .classed('error', _command.is_error);
        }

        // if (_key_bindings && _bindings) {
        //     _key_bindings
        //         .style('display', _show_keymap ? null : 'none')
        //         .select('kbd')
        //         .text(_bindings.keymap.text);
        // }

        return _command_button;
    }

    _command_button.dispose = function () {

        // if (_bindings) {
        //     if (_bindings.keymap) _bindings.keymap.dispose();
        //     if (_bindings.tooltip) _bindings.tooltip.dispose();
        // }

        if (_tooltip) _tooltip.dispose();

        return _command_button;

    }

    _command_button.events = function (events) {

        if (!events) return _events;

        _events = events;

        if (_div) {
            for (key in _events) {
                if (_events.hasOwnProperty(key)) {
                    _div.on(key, _events[key]);
                }
            }
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

    _command_button.on = function (event, callback) {

        if (!callback) return _events[event];

        _events[event] = callback;

        if (_div) {
            _div.on(event, callback);
        }

        return _command_button;

    }

    _command_button.set_running = function () {

        if (_div) {
            _div.classed('running', true);
        }

        if (_status_icon) {
            _status_icon
                .attr('class', 'cmd-status right')
                .append('span')
                .attr('class', 'loading loading-spinner-small inline-block');
        }

        return _command_button;

    }

    function _new_tooltip (node, text) {
        return atom.tooltips.add(node, {
            title: text,
            placement: function () {
                let location = atom.workspace.paneContainerForURI('atom://alloy');
                return location === 'left' ? 'right' : 'left';
            }
        });
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
