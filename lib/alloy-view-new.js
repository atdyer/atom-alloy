'use babel';

import * as d3 from 'd3-selection';
import settings_required_view from './views/settings-required-view';
import java_loading_view from './views/java-loading-view';
import main_view from './views/main-view';
import needs_restart_view from './views/needs-restart-view';
import { extension } from './util';
import { CompositeDisposable } from 'atom';

export default function alloy_view (element) {

    let _runner = null,
        _subscriptions = new CompositeDisposable();

    let _element = null,
        _div = null,
        _view_settings_required = null,
        _view_java_loading = null,
        _view_main = null,
        _view_needs_restart = null,
        _views = [];

    let _title = 'Alloy',
        _allowed_locations = ['left', 'right'],
        _default_location = 'right',
        _uri = 'atom://alloy';

    // The Atom API requires that pane items be objects,
    // hence the use of an object here instead of a function.
    // Call alloy_view().element() to set the element and
    // build the view.
    let _alloy_view = {};

    _alloy_view.element = function (element) {
        if (!element) return _element;
        return _create_alloy_view(element);
    }

    _alloy_view.dispose = function () {

        _subscriptions.dispose();
        if (_view_main) _view_main.dispose();

    }

    _alloy_view.runner = function(runner) {

        if (!runner) return _runner;
        if (_runner) _subscriptions.dispose();

        _runner = runner;
        _subscriptions.add(
            _runner.on_java_loading(_alloy_view.show_java_loading),
            _runner.on_java_ready(_alloy_view.show_main),
            _runner.on_needs_restart(_alloy_view.show_restart),
            _runner.on_parse_commands(_show_parsed_commands)
        );

        // TODO: If the runner is set before creating the view,
        // we won't be subscribed to any events from the view,
        // and therefore won't be able to tell the runner when
        // the user has clicked on a button (e.g.). Maybe use
        // a 'staged subscriptions' variable to keep track of
        // subscriptions that will need to be created once the
        // view is initialized.
        if (_view_main) {
            _subscriptions.add(
                _view_main.on_run_command(console.log)
            )
        }

        return _alloy_view;

    }

    _alloy_view.show_settings_required = function () {
        _show_only(_view_settings_required);
        return _alloy_view;
    }

    _alloy_view.show_java_loading = function () {
        _show_only(_view_java_loading);
        return _alloy_view;
    }

    _alloy_view.show_main = function () {
        _show_only(_view_main);
        return _alloy_view;
    }

    _alloy_view.show_restart = function (reason) {
        if (_needs_restart_view) {
            _show_only(_needs_restart_view);
            if (reason === 'newjar') {
                _needs_restart_view.display_warning(_alloy_view.show_main);
            } else {
                _needs_restart_view.display_error();
            }
        }
    }

    function _create_alloy_view (element) {

        _element = element;
        _div = d3.select(_element)
            .attr('class', 'alloy');

        _view_settings_required = settings_required_view(_div);
        _view_java_loading = java_loading_view(_div);
        _view_main = main_view(_div);
        _view_needs_restart = needs_restart_view(_div);
        _views = [
            _view_settings_required,
            _view_java_loading,
            _view_main,
            _view_needs_restart
        ];

        _alloy_view.show_settings_required();

        return _alloy_view;

    }

    function _show_parsed_commands(result) {
        if (_view_main) {
            _view_main.set_commands(result.editor, result.commands);
        }
    }

    function _show_only (view) {
        if (view) {
            _views.forEach(function (v) {
                v === view ? v.show() : v.hide();
            });
        }
    }


    /*
     * Functions required by the Atom API
     */

    _alloy_view.getAllowedLocations = function () {
        return _allowed_locations;
    }

    _alloy_view.getDefaultLocation = function () {
        return _default_location;
    }

    _alloy_view.getElement = function () {
        return _element;
    }

    _alloy_view.getTitle = function () {
        return _title;
    }

    _alloy_view.getURI = function () {
        return _uri;
    }

    return _alloy_view;

}