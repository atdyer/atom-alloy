'use babel';

export default function view_alloy_command () {

    // UI items
    let _command = null,
        _div = null,
        _type_icon = null,
        _message = null,
        _open_icon = null,
        _status_icon = null,
        _tooltip = null;

    // State defaults
    let _is_check = false,
        _label = '',
        _solution = null,
        _state = 'idle';


    function _view_alloy_command (selection) {

        // Set the top level div
        _div = selection
            .classed('item', true);

        // Make sure all children are present and ready to be updated
        _type_icon = _select_type_icon(_div);
        _message = _select_message(_div);
        _open_icon = _select_open_icon(_div);
        _status_icon = _select_status_icon(_div);

        // Create the tooltip
        if (_tooltip) _tooltip.dispose();
        _tooltip = atom.tooltips.add(_div.node(), {
            title: _tooltip_title_function,
            placement: _tooltip_placement_function
        });

        // Subscribe to events from the UI
        if (_div) {
            _div.on('click', _on_click);
        }

        // Render state
        _set_is_check(_is_check);
        _set_label(_label);
        _set_solution(_solution);
        _set_state(_state);

        return _view_alloy_command;

    }

    _view_alloy_command.command = function (command) {

        if (!arguments.length) return _command;
        _command = command;

        // Subscribe to events from the command and update
        // the view in response to events
        _command.on_is_check(_set_is_check);
        _command.on_label(_set_label);
        _command.on_solution(_set_solution);
        _command.on_state(_set_state);

        return _view_alloy_command;

    }

    _view_alloy_command.dispose = function () {

        if (_tooltip) _tooltip.dispose();
        return _view_alloy_command;

    }

    function _on_click () {
        if (_command) {
            _command.run();
        }
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

    function _select_open_icon (selection) {

        let _selection = selection.selectAll('.cmd-open')
            .data(['command-open']);

        _selection.exit()
            .remove();

        return _selection.enter()
            .append('div')
            .attr('class', 'cmd-option cmd-open icon')
            .merge(_selection);

    }

    function _select_status_icon (selection) {

        let _selection = selection.selectAll('.cmd-status')
            .data(['command-status']);

        _selection.exit()
            .remove();

        return _selection.enter()
            .append('div')
            .attr('class', 'cmd-option cmd-status icon')
            .merge(_selection);

    }

    function _set_is_check (is_check) {

        _is_check = is_check

        if (_type_icon) {
            _type_icon
                .classed('icon-check', _is_check)
                .classed('icon-flame', !_is_check);
        }
    }

    function _set_label (label) {

        _label = label;

        if (_message) {
            _message.text(_label);
        }
    }

    function _set_solution (solution) {
        _solution = solution;
        if (_solution) {
            let sat = _solution.satisfiableSync();
            if (_is_check) {
                _set_state(sat ? 'solved-valid' : 'solved-invalid');
            } else {
                _set_state(sat ? 'solved-consistent': 'solved-inconsistent');
            }
        } else {
            _set_state('idle');
        }
    }

    function _set_state (state) {

        _state = state;

        if (_div) {

            _div
                .classed('running', _state === 'running')
                .classed('solved-valid', _state === 'solved-valid')
                .classed('solved-invalid', _state === 'solved-invalid')
                .classed('solved-consistent', _state === 'solved-consistent')
                .classed('solved-inconsistent', _state === 'solved-inconsistent')
                .classed('error', _state === 'error');
        }

        if (_status_icon) {
            _status_icon
                .classed('icon-primitive-dot', _state === 'idle')
                .classed('icon-ellipsis', _state === 'pending')
                .classed('icon-sync', _state === 'running')

                .classed('icon-eye', (_state === 'solved-consistent') || (_state === 'solved-invalid'))
                .classed('icon-check', _state === 'solved-valid')
                .classed('icon-x', _state === 'solved-inconsistent')

                .classed('icon-bug', _state === 'error')
        }

    }

    function _tooltip_title_function () {
        return _command ? _command.string() : '';
    }

    function _tooltip_placement_function () {
        let location = atom.workspace.paneContainerForURI('atom://alloy');
        return location === 'left' ? 'right' : 'left';
    }

    return _view_alloy_command;

}
