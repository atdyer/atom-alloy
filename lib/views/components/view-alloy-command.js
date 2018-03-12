'use babel';

export default function view_alloy_command () {

    let _command = null,
        _div = null,
        _type_icon = null,
        _message = null,
        _status_icon = null,
        _tooltip = null;

    function _view_alloy_command (selection) {

        // Set the top level div
        _div = selection
            .classed('item', true);

        // Make sure all children are present and ready to be updated
        _type_icon = _select_type_icon(_div);
        _message = _select_message(_div);
        _status_icon = _select_status_icon(_div);

        // Create the tooltip
        if (_tooltip) _tooltip.dispose();
        _tooltip = atom.tooltips.add(_div.node(), {
            title: _tooltip_title_function,
            placement: _tooltip_placement_function
        });

        // Updates
        if (_command) {

            _div
                .classed('running', _command.is_running());

            _type_icon
                .classed('icon-check', _command.is_check())
                .classed('icon-flame', !_command.is_check());

            _message
                .text(_command.label());

            _status_icon
                .classed('icon-primitive-dot', !_command.is_running())
                .classed('icon-sync', _command.is_running());

        }

        // Event handler
        _div.on('click', function () {
            if (_command) {
                _command.run();
            }
        });

        return _view_alloy_command;

    }

    _view_alloy_command.command = function (command) {

        // Subscribe to events from the command and update
        // the view in response to events

        if (!arguments.length) return _command;
        _command = command;
        return _view_alloy_command;

    }

    _view_alloy_command.dispose = function () {

        if (_tooltip) _tooltip.dispose();
        return _view_alloy_command;

    }

    _view_alloy_command.set_running = function () {

        if (_div) _div.classed('running', true);

        if (_status_icon) _status_icon
            .classed('icon-primitive-dot', !_command.is_running())
            .classed('icon-sync', _command.is_running());

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

    function _select_status_icon (selection) {

        let _selection = selection.selectAll('.cmd-status')
            .data(['command-status']);

        _selection.exit()
            .remove();

        return _selection.enter()
            .append('div')
            .attr('class', 'cmd-status right icon')
            .merge(_selection);

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
