'use babel';

import * as d3 from 'd3-selection';
import { Emitter } from 'atom';

export default class MainView {

    emitter = new Emitter();

    constructor(selection) {

        // Add a div to the parent
        this.div = selection.append('div');

        // Add sections
        this.commands = this.div.append('div')
            .attr('class', 'item-list');

    }

    onRunCommand(callback) {
        this.emitter.on('runcommand', callback);
    }

    setCommands(commands) {

        if (this.commands) {

            // Select buttons and bind data
            let selection = this.commands.selectAll('li').data(commands);

            // Remove old commands
            selection.exit().remove();

            // Add new buttons
            let handler = this._onClickHandler('runcommand');
            selection = selection.enter()
                .append('div')
                .attr('class', 'item')
                .on('click', handler)
                .merge(selection);

            selection.append('span')
                .attr('class', 'icon icon-file-text')
                .text(function(d) {
                    return d.toString();
                });

            selection.append('div')
                .attr('class', 'pull-right key-bindings')
                .append('kbd')
                .attr('class', 'key-binding')
                .text('Test');

            // Update all buttons
            // selection.html(function (d) {
            //     return d.toString();
            // });

        }

    }

    hide() {
        this.div.style('display', 'none');
    }

    show() {
        this.div.style('display', null);
    }

    _onClickHandler(emit) {
        let emitter = this.emitter;
        return function () {
            let datum = d3.select(this).datum();
            emitter.emit(emit, datum);
        }
    }

}
