'use babel';

export default function java_loading_view (selection) {

    let _div = null,
        _visible = false;

    function _java_loading_view (selection) {

        // Add a div to the parent
        _div = selection.append('div')
            .style('display', _visible ? null : 'none');

        // Add a message
        _div.append('div')
            .attr('class', 'message-lg')
            .text('Preparing for takeoff.');

        // Add a spinner
        _div.append('div')
            .attr('class', 'centered')
            .append('span')
            .attr('class', 'loading loading-spinner-medium');

        return _java_loading_view;

    }

    _java_loading_view.hide = function () {

        _visible = false;
        if (_div) _div.style('display', 'none');
        return _java_loading_view;

    }

    _java_loading_view.show = function () {

        _visible = true;
        if (_div) _div.style('display', null);
        return _java_loading_view;

    }

    return _java_loading_view(selection);

}
