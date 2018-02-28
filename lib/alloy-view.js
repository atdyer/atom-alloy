'use babel';

// Libraries
import * as d3 from 'd3-selection';

// Views
import settings_required_view from './views/settings-required-view';
import java_loading_view from './views/java-loading-view';
import main_view from './views/main-view';
import needs_restart_view from './views/needs-restart-view';

// Atom
import { CompositeDisposable } from 'atom';


export default function alloy_view () {

    let _runner = null;

    let _atom_subscriptions = new CompositeDisposable(),
        _runner_subscriptions = new CompositeDisposable(),
        _view_main_subscriptions = new CompositeDisposable();

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

        _atom_subscriptions.dispose();
        _runner_subscriptions.dispose();
        _view_main_subscriptions.dispose();
        if (_view_main) _view_main.dispose();

    }

    _alloy_view.runner = function(runner) {

        // Return the runner if a new one has not been provided
        if (!runner) return _runner;

        // If a runner exists, unsubscribe from it
        if (_runner) _runner_subscriptions.dispose();

        // Subscribe to the new runner
        _runner = runner;
        _runner_subscriptions.add(
            _runner.on_commands_parsed(_show_parsed_commands),
            _runner.on_java_loading(_alloy_view.show_java_loading),
            _runner.on_java_ready(_alloy_view.show_main),
            _runner.on_needs_restart(_alloy_view.show_restart)
        );

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
        if (_view_needs_restart) {
            _show_only(_view_needs_restart);
            if (reason === 'newjar') {
                _view_needs_restart.display_warning(_alloy_view.show_main);
            } else {
                _view_needs_restart.display_error();
            }
        }
    }

    function _create_alloy_view (element) {

        // Keep track of the top level node
        _element = element;
        _div = d3.select(_element)
            .attr('class', 'alloy');

        // Create all views
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

        // Dispose old subscriptions
        _atom_subscriptions.dispose();
        _view_main_subscriptions.dispose();

        // Subscribe to atom events
        _atom_subscriptions.add(
            atom.workspace.addOpener(_opener)
        );

        // Subscribe to main view events
        _view_main_subscriptions.add(
            _view_main.on_run_command(console.log)
        );

        // By default, start with the settings required screen
        _alloy_view.show_settings_required();

        // Return the view object (as required by the Atom API)
        return _alloy_view;

    }

    function _opener (uri) {
        if (uri === _uri) {
            return _alloy_view;
        }
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
