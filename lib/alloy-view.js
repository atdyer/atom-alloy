'use babel';

import * as d3 from 'd3-selection';
import SettingsRequiredView from './views/settings-required-view';
import JavaLoadingView from './views/java-loading-view';
import MainView from './views/main-view';
import NeedsRestartView from './views/needs-restart-view';
import { Emitter } from 'atom';
import { extension } from './util';

export default class AlloyView {

    constructor(runner) {

        this.emitter = new Emitter();
        this.runner = null;

        // Top level DOM nodes
        this.element = document.createElement('div');
        this.selection = d3.select(this.element).attr('class', 'alloy');

        // Views
        this.view_settings_required = new SettingsRequiredView(this.selection);
        this.view_java_loading = new JavaLoadingView(this.selection);
        this.view_main = new MainView(this.selection);
        this.view_needs_restart = new NeedsRestartView(this.selection);

        // Start with the settings required view
        this.showSettingsRequired();

        // Set the runner if one was passed
        this.setRunner(runner);

    }

    destroy() {
        this.emitter.dispose();
        this.element.remove();
    }

    showSettingsRequired() {
        this.view_settings_required.show();
        this.view_java_loading.hide();
        this.view_main.hide();
        this.view_needs_restart.hide();
    }

    showJavaLoading() {
        this.view_settings_required.hide();
        this.view_java_loading.show();
        this.view_main.hide();
        this.view_needs_restart.hide();
    }

    showMain() {
        this.view_settings_required.hide();
        this.view_java_loading.hide();
        this.view_main.show();
        this.view_needs_restart.hide();
    }

    showRestart(reason) {
        if (reason === 'newjar') {
            this.view_settings_required.hide();
            this.view_java_loading.hide();
            this.view_main.hide();
            this.view_needs_restart.showWarning(() => this.showMain());
        }
    }

    setRunner(runner) {

        if (this.emitter) this.emitter.dispose();

        if (runner) {

            // Use the specified runner
            this.runner = runner;

            // Subscribe to events from the runner
            this.runner.onJavaLoading(() => { this.showJavaLoading() });
            this.runner.onJavaReady(() => { this.showMain() });
            this.runner.onNeedsRestart((reason) => { this.showRestart(reason) });
            this.runner.onCommands((commands) => { this.view_main.setCommands(commands) });

        } else {

            this.runner = null;
            this.showSettingsRequired();

        }
    }



    fileChanged(file) {
        // Do some styling here to show that the file will have to be recompiled
    }

    setCommands(commands) {

        // if (this.list) {
        //
        //     let emitter = this.emitter;
        //     let selection = this.list.selectAll('button').data(commands);
        //
        //     selection.exit()
        //         .remove();
        //
        //     selection = selection.enter()
        //         .append('button')
        //         .attr('class', 'btn btn-large')
        //         .on('click', function() {
        //             let command = d3.select(this).datum();
        //             emitter.emit('runcommand', command);
        //         })
        //         .merge(selection);
        //
        //     selection.text(function(d) {
        //         return d.toString();
        //     });
        // }
    }

    setError(error) {
        // let position = error.cause.pos;
        // let l0 = position.y;
        // let l1 = position.y2;
    }

    setSignatures(signatures) {
        // signatures.forEach(function (sig) {
        //   console.log(sig.toStringSync());
        // });
    }

    onRunCommand(callback) {
        // this.emitter.on('runcommand', callback);
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
