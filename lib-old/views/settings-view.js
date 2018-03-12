'use babel';

import * as d3 from 'd3-selection';
import header_view from './header-view';

export default function settings_view(selection) {

    let _panel = null;

    function _settings_view(selection) {

        _panel = selection.append('div')
            .attr('class', 'modal')
            .style('display', 'none');

        let _header = header_view(_panel)
            .title('Settings')
            .icon('icon-x')
            .icon_callback(_settings_view.close);

        let _content = _panel.append('div')
            .attr('class', 'content');

        let _check = _content.append('label')
            .attr('class', 'input-label');

        _check.append('input')
            .attr('class', 'input-checkbox')
            .attr('type', 'checkbox');

        _check
            .text('Check')

        _panel.append('div')
            .attr('class', 'fill')
            .on('click', _settings_view.close);

        return _settings_view;

    }

    _settings_view.close = function () {
        if (_panel) _panel.style('display', 'none');
        return _settings_view;
    }

    _settings_view.open = function () {
        if (_panel) _panel.style('display', null);
        return _settings_view;
    }

    _settings_view.toggle = function () {

        if (_panel) {
            let _is_hidden = _panel.style('display') === 'none';
            _panel.style('display', _is_hidden ? null : 'none');
        }
        return _settings_view;

    }

    return _settings_view(selection);

}
