'use babel';

export default function needs_restart_view (selection) {

    let _div = null,
        _error = null,
        _warning = null,
        _warning_callback = null,
        _visible = false;

    function _needs_restart_view (selection) {

        // Add a div to the parent
        _div = selection.append('div')
            .style('display', _visible ? null : 'none');

        // Create the error view
        _error = _create_view_error(_div);

        // Create the warning view
        _warning = _create_view_warning(_div);

        return _needs_restart_view;

    }

    _needs_restart_view.hide = function () {

        _visible = false;
        if (_div) _div.style('display', 'none');
        return _needs_restart_view;

    }

    _needs_restart_view.show_error = function () {

        _visible = true;
        if (_div) _div.style('display', null);
        if (_warning) _warning.style('display', 'none');
        if (_error) _error.style('display', null);
        return _needs_restart_view;

    }

    _needs_restart_view.show_warning = function (on_return_callback) {

        _visible = true;
        _warning_callback = on_return_callback;
        if (_div) _div.style('display', null);
        if (_warning) _warning.style('display', null);
        if (_error) _error.style('display', 'none');
        return _needs_restart_view;

    }

    function _create_view_warning (selection) {

        let view = selection.append('div')
            .attr('class', 'centered');

        view.append('div')
            .attr('class', 'message-lg')
            .text(
                'Atom needs to be restarted before ' +
                'changes will take effect.'
            );

        let buttons = view.append('div')
            .attr('class', 'centered btn-col-9');

        buttons.append('button')
            .attr('class', 'btn btn-lg btn-primary icon icon-sync')
            .text('Restart Atom')
            .on('click', function () {
                atom.reload();
            });

        buttons.append('button')
            .attr('class', 'btn btn-lg btn-success icon icon-chevron-left')
            .text('Continue Working')
            .on('click', () => {
                if (_warning_callback) _warning_callback();
            });

        return view;

    }

    function _create_view_error (selection) {

        let view = selection.append('div')
            .attr('class', 'centered');

        view.append('div')
            .attr('class', 'message-lg')
            .text(
                'Alloy has encountered an error. ' +
                'Please restart Atom.'
            );

        let buttons = view.append('div')
            .attr('class', 'centered btn-col-9');

        buttons.append('button')
            .attr('class', 'btn btn-lg btn-primary icon icon-sync')
            .text('Restart Atom')
            .on('click', function () {
                atom.reload();
            });

        return view;

    }

    return _needs_restart_view(selection);

}
