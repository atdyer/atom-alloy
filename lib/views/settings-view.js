'use babel';

import * as d3 from 'd3-selection';

export default function settings_view(selection) {

    let _panel = null;

    function _settings_view(selection) {

        _panel = selection.append('atom-panel')
            .attr('class', 'modal')
            .style('display', 'none')
            .on('click', function () {
                let modal = d3.select(this);
                let coordinates = d3.mouse(this);
                let width = parseInt(modal.style('width'));
                let height = parseInt(modal.style('height'));
                if (coordinates[0] < 0 || coordinates[0] > width ||
                    coordinates[1] < 0 || coordinates[1] > height) {
                        _settings_view.toggle();
                    }
            });

        return _settings_view;

    }

    _settings_view.toggle = function () {

        if (_panel) {
            let _is_hidden = _panel.style('display') === 'none';
            _panel.style('display', _is_hidden ? null : 'none');
        }

    }

    return _settings_view(selection);

}
