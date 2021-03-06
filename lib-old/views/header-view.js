'use babel';

import * as d3 from 'd3-selection';

export default function header_view(selection) {

    let _div = null;
    let _title_div = null;
    let _icon_div = null;
    let _input_div = null;
    let _title = '';
    let _icon = null;
    let _icon_callback = () => {};
    let _input = null;
    let _input_callback = () => {};

    function _header_view(selection) {

        _div = selection.append('div')
            .attr('class', 'header');

        _title_div = _div.append('div')
            .attr('class', 'title');

        _icon_div = _div.append('div');

        _input_div = _div.append('input')
            .style('display', 'none');

        _header_view.title(_title);
        _header_view.icon(_icon);
        _header_view.icon_callback(_icon_callback);
        _header_view.input(_input);
        _header_view.input_callback(_input_callback);
        return _header_view;

    }

    _header_view.title = function(title) {
        if (!title) return _title;
        _title = title;
        if (_title_div) _title_div.text(_title);
        return _header_view;
    }

    _header_view.icon = function(icon) {
        if (icon === null && _icon_div) {
            _icon_div.style('display', 'none');
            return _header_view;
        }
        if (!icon) return _icon_div;
        _icon = icon;
        if (_icon_div) {
            _icon_div
                .attr('class', 'icon icon-button ' + _icon)
                .style('display', null);
        }
        return _header_view;
    }

    _header_view.icon_callback = function(callback) {
        if (!callback) return _icon_callback;
        _icon_callback = callback;
        if (_icon_div) _icon_div.on('click', _icon_callback);
        return _header_view;
    }

    _header_view.input = function (input) {
        if (input === null && _input_div) {
            _input_div.style('display', 'none');
            return _header_view;
        }
        if (!input) return _input_div;
        _input = input;
        if (_input_div) {
            _input_div
                .attr('class', _input)
                .attr('type', _input_type(_input))
                .style('display', null);
        }
        return _header_view;
    }

    _header_view.input_callback = function(callback) {
        if (!callback) return _input_callback;
        _input_callback = callback;
        if (_input_div) _input_div.on('change', _input_callback);
        return _header_view;
    }

    function _input_type(input) {
        return input === 'input-toggle' ? 'checkbox' :
                input === 'input-checkbox' ? 'checkbox' :
                input === 'input-radio' ? 'radio' : null;
    }

    return _header_view(selection);

}
