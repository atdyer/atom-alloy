'use babel';

import * as d3 from 'd3-selection';

export default function header_view(selection) {

    let _div = null;
    let _title_div = null;
    let _icon_div = null;
    let _title = '';
    let _icon = null;
    let _icon_callback = () => {};

    function _header_view(selection) {

        _div = selection.append('div')
            .attr('class', 'header');

        _title_div = _div.append('div')
            .attr('class', 'title');

        _icon_div = _div.append('div')
            .attr('class', 'icon icon-button');

        _header_view.title(_title);
        _header_view.icon(_icon);
        _header_view.icon_callback(_icon_callback);
        return _header_view;

    }

    _header_view.title = function(title) {
        if (!title) return _title;
        _title = title;
        if (_title_div) _title_div.text(_title);
        return _header_view;
    }

    _header_view.icon = function(icon) {
        if (!icon) return _icon;
        _icon = icon;
        if (_icon_div) _icon_div.attr('class', 'icon icon-button ' + _icon);
        return _header_view;
    }

    _header_view.icon_callback = function(callback) {
        if (!callback) return _icon_callback;
        _icon_callback = callback;
        if (_icon_div) _icon_div.on('click', _icon_callback);
        return _header_view;
    }

    return _header_view(selection);

}
