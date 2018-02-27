'use babel';

import { extension } from '../util';

export default function settings_required_view (selection) {

    let _div = null,
        _picker = null,
        _error = null;

    function _settings_required_view (selection) {

        // Add a div to the parent
        _div = selection.append('div')
            .attr('class', 'centered');

        // Add an invisible file picker
        _picker = _div.append('input')
            .attr('type', 'file')
            .style('display', 'none')
            .on('change', function () {
                let file = event.target.files[0].path;
                if (extension(file) === 'jar') {
                    atom.config.set('alloy.jar', file);
                } else {
                    _settings_required_view.show_jar_error();
                }
            });

        // Add descriptive text
        _div.append('div')
            .attr('class', 'message-lg')
            .html('<p>Set the <a href="http://alloytools.org/download.html">alloy.jar</a> location to enable Alloy features.</p>');

        // Add button to choose jar file
        _div.append('div')
            .attr('class', 'centered btn-col-9')
            .append('button')
            .attr('class', 'btn btn-lg btn-primary icon icon-file-directory')
            .text('Browse...')
            .on('click', function() {
                if (_picker) _picker.node().click();
            });

        // Add the jar error
        _error = _div.append('div')
            .attr('class', 'message-lg text-error')
            .style('display', 'none')
            .text('Please choose a .jar file');

        return _settings_required_view;

    }

    _settings_required_view.hide = function () {

        if (_div) _div.style('display', 'none');
        return _settings_required_view;

    }

    _settings_required_view.hide_jar_error = function () {

        if (_error) _error.style('display', 'none');
        return _settings_required_view;

    }

    _settings_required_view.show = function () {

        if (_div) _div.style('display', null);
        return _settings_required_view;

    }

    _settings_required_view.show_jar_error = function () {

        if (_error) _error.style('display', null);
        return _settings_required_view;

    }

    return _settings_required_view(selection);

}
