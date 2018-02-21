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
            let selection = this.commands.selectAll('div.item').data(commands);

            // Exit...
            selection.exit()
                .each(function (d) {
                    d.disposable.dispose();
                })
                .remove();

            // Enter...
            let enter = selection.enter()
                .append('div')
                .attr('class', 'item')
                .on('click', this._onClickHandler('runcommand'))
                .each(function (d) {
                    d.disposable = tooltip(this);
                });

            enter.append('div')
                .attr('class', 'icon')
                .each(function (d) {
                    if (d.check) d3.select(this).classed('icon-check', true);
                    else d3.select(this).classed('icon-flame', true);
                });

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

            update.each(function (d) {
                d3.select(this).select('div.message').text(d.label);
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
