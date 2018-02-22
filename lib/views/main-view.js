'use babel';

import * as d3 from 'd3-selection';
import { Emitter } from 'atom';

export default class MainView {

    emitter = new Emitter();
    tooltips = [];

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

            let tooltips = this.tooltips;

            // Select buttons and bind data
            let selection = this.commands
                .selectAll('div.item')
                .data(commands);

            // Exit...
            selection.exit()
                .each(function (d, i) {
                    d.disposable.dispose();
                    tooltips[i] = null;
                })
                .remove();

            // Enter...
            let enter = selection.enter()
                .append('div')
                .attr('class', 'item')
                .on('click', this._onClickHandler('runcommand'))
                .each(function (d, i) {
                    d.disposable = tooltip(this);
                    tooltips[i] = d.disposable;
                });

            enter.append('div')
                .attr('class', 'icon');

            enter.append('div')
                .attr('class', 'message');

            enter.append('div')
                .attr('class', 'right key-bindings')
                .append('kbd')
                .attr('class', 'key-binding')
                .text(function (d, i) {
                    return 'Ctrl+' + i;
                });

            // Update...
            let update = selection.merge(enter);

            update.each(function (d, i) {

                // Set the message text
                d3.select(this).select('div.message').text(d.label);

                // Set the button icon
                d3.select(this)
                    .select('div.icon')
                    .classed('icon-check', d.check)
                    .classed('icon-flame', !d.check);

                // Check for existing tooltip
                if (tooltips[i]) d.disposable = tooltips[i];
            });

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

function tooltip (node) {
    let options = {
        title: function () {
            return d3.select(this).datum().toString();
        },
        placement: function () {
            let location = atom.workspace.paneContainerForURI('atom://alloy').location;
            return location === 'left' ? 'right' : 'left';
        }
    }
    return atom.tooltips.add(node, options);
}
