'use babel';

export default function alloy_command_view () {

    let _command = null,
        _div = null,
        _type_icon = null,
        _message = null,
        _status_icon = null,
        _tooltip = null;

    function _alloy_command_view (selection) {

        // Set the top level div
        _div = selection.classed('item', true);

        // Make sure all children are present and ready to be updated
        _type_icon = _select_type_icon(_div);
        _message = _select_message(_div);
        _status_icon = _select_status_icon(_div);

        // Create the tooltip
        if (_tooltip) _tooltip.dispose();
        _tooltip = atom.tooltips.add(_div, {
            title: _tooltip_title_function,
            placement: _tooltip_placement_function
        });

        // Updates
        // ...

        return _alloy_command_view;

    }

    _alloy_command_view.command = function (command) {

        // Subscribe to events from the command and update
        // the view in response to events

        if (!arguments.length) return _command;
        _command = command;
        return _alloy_command_view;

    }

    _alloy_command_view.dispose = function () {

        if (_tooltip) _tooltip.dispose();
        return _alloy_command_view;

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
        return _command ? _command.text() : '';
    }

    function _tooltip_placement_function () {
        let location = atom.workspace.paneContainerForURI('atom://alloy');
        return location === 'left' ? 'right' : 'left';
    }

    return _alloy_command_view;
    
}
