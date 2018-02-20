'use babel';

import * as d3 from 'd3-selection';
import {
    CompositeDisposable,
    Emitter
} from 'atom';
import SettingsRequiredView from './views/settings-required';
import MainView from './views/main-view';
import { extension } from './util';

export default class AlloyView {

    constructor(runner) {

        this.emitter = new Emitter();
        this.subscriptions = new CompositeDisposable();
        this.runner = null;

        // Top level DOM nodes
        this.element = document.createElement('div');
        this.selection = d3.select(this.element).attr('class', 'alloy');

        // Views
        this.settings_required_view = new SettingsRequiredView(this.selection);
        this.main_view = new MainView(this.selection);

        // Start with the settings required view
        this.settings_required_view.show();
        this.main_view.hide();

        // Set the runner if one was passed
        this.setRunner(runner);

        // this.list = this.selection.append('div')
        // .attr('class', 'block');

    }

    destroy() {
        this.emitter.dispose();
        this.element.remove();
    }

    showSettingsRequired() {
        this.settings_required_view.show();
        this.main_view.hide();
    }

    showJavaLoadingView() {
        this.showMain();
    }

    showMain() {
        this.settings_required_view.hide();
        this.main_view.show();
    }

    setRunner(runner) {
        if (runner) {

            // Remove any previous subscriptions
            if (this.subscriptions) this.subscriptions.dispose();

            // Use the specified runner
            this.runner = runner;

            // Subscribe to events from the runner
            this.runner.onJarSet((jar) => {
                this._checkJar(jar);
            });

        } else {

            // Destroy any subscriptions
            this.runner = null;
            this.showSettingsRequired();

        }
    }

    _checkJar(jar) {

        if (jar !== 'none') {
            if (extension(jar) !== 'jar') {
                this.showSettingsRequired();
                this.settings_required_view.showJarError();
            } else {
                this.showJavaLoadingView();
                this.settings_required_view.hideJarError();
            }
        } else {
            this.showSettingsRequired();
        }

    }



    fileChanged(file) {
        // Do some styling here to show that the file will have to be recompiled
    }

    setCommands(commands) {

        if (this.list) {

            let emitter = this.emitter;
            let selection = this.list.selectAll('button').data(commands);

            selection.exit()
                .remove();

            selection = selection.enter()
                .append('button')
                .attr('class', 'btn btn-large')
                .on('click', function() {
                    let command = d3.select(this).datum();
                    emitter.emit('runcommand', command);
                })
                .merge(selection);

            selection.text(function(d) {
                return d.toString();
            });
        }
    }

    setError(error) {
        let position = error.cause.pos;
        let l0 = position.y;
        let l1 = position.y2;
    }

    setSignatures(signatures) {
        // signatures.forEach(function (sig) {
        //   console.log(sig.toStringSync());
        // });
    }

    onRunCommand(callback) {
        this.emitter.on('runcommand', callback);
    }

    getAllowedLocations() {
        return ['right', 'left'];
    }

    getDefaultLocation() {
        return 'right';
    }

    getElement() {
        return this.element;
    }

    getTitle() {
        return 'Alloy';
    }

    getURI() {
        return 'atom://alloy'
    }

}
