'use babel';

import * as d3 from 'd3-selection';
import { Emitter } from 'atom';

export default class MainView {

    emitter = new Emitter();
    tooltips = [];
    keymaps = [];

    show_keymaps = false;

    constructor(selection) {

        // Add a div to the parent
        this.div = selection.append('div');

        // Add sections
        this.header = this._buildHeader(this.div, 'Alloy Commands');

        this.commands = this.div.append('div')
            .attr('class', 'item-list');

        // Add command listener
        atom.commands.add('.workspace', 'alloy:runcommand', {
            displayName: 'Alloy: Run Command',
            description: 'Runs an Alloy command from the current file.',
            didDispatch: (e) => {
                let index = parseInt(e.originalEvent.key);
                let datum = this._command(index);
                this.emitter.emit('runcommand', datum);
            }
        });

    }

    onRunCommand(callback) {
        this.emitter.on('runcommand', callback);
    }

    setCommands(commands) {

        if (this.commands) {

            let tooltips = this.tooltips;
            let keymaps = this.keymaps;

            // Select buttons and bind data
            let selection = this.commands
                .selectAll('div.item')
                .data(commands);

            // Exit...
            selection.exit()
                .each(function (d, i) {
                    d.keymap.dispose();
                    d.tooltip.dispose();
                    tooltips[i] = null;
                    keymaps[i] = null;
                })
                .remove();

            // Enter...
            let enter = selection.enter()
                .append('div')
                .attr('class', 'item')
                .on('click', this._onClickHandler('runcommand'))
                .each(function (d, i) {
                    d.keymap = keymap(i) || {dispose: () => {}};
                    d.tooltip = tooltip(this);
                    keymaps[i] = d.keymap;
                    tooltips[i] = d.tooltip;
                });

            enter.append('div')
                .attr('class', 'cmd-type icon');

            enter.append('div')
                .attr('class', 'cmd-message');

            enter.append('div')
                .attr('class', 'right key-bindings')
                .append('kbd')
                .attr('class', 'key-binding');

            enter.append('div')
                .attr('class', 'cmd-status right icon icon-primitive-dot')

            // Update...
            let update = selection.merge(enter);
            let show_keymaps = this.show_keymaps;

            update.each(function (d, i) {

                let item = d3.select(this);

                // Set the message text
                item.select('.cmd-message')
                    .text(d.label);

                // Set the button icon
                item.select('div.icon')
                    .classed('icon-check', d.check)
                    .classed('icon-flame', !d.check);

                // Check if keymaps should be visible
                let show_keymap = show_keymaps && i < 10;
                item.select('.key-bindings')
                    .style('display', show_keymap ? null : 'none')
                    .select('.key-binding')
                    .classed('running', d.is_running)
                    .classed('error', d.is_error)
                    .text(i < 10 ? 'Ctrl+' + i : null);

                // Check if status icon should be visible
                let show_status = !show_keymap;
                item.select('.cmd-status')
                    .style('display', show_status ? null : 'none');

                // Check for existing keymap and tooltip
                if (keymaps[i]) d.keymap = keymaps[i];
                if (tooltips[i]) d.tooltip = tooltips[i];

            });

        }

    }

    hide() {
        this.div.style('display', 'none');
    }

    show() {
        this.div.style('display', null);
    }

    _buildHeader(parent, title) {
        let header = parent.append('div')
            .attr('class', 'header');

        header.append('div')
            .attr('class', 'title')
            .text(title);

        header.append('div')
            .attr('class', 'icon icon-gear icon-button');

        return header;
    }

    _command(index) {
        return this._commands()[index];
    }

    _commands() {
        return this.commands.selectAll('div.item').data();
    }

    _onClickHandler(emit) {
        let emitter = this.emitter;
        return function () {
            let datum = d3.select(this).datum();
            emitter.emit(emit, datum);
        }
    }

}

function keymap(index) {
    if (index >= 0 && index < 10) {
        let binding = {};
        binding['ctrl-' + index] = 'alloy:runcommand';
        return atom.keymaps.add('alloy/keymaps', {
            '.workspace': binding
        });
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
