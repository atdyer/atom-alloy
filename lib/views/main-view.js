'use babel';

import * as d3 from 'd3-selection';
import header_view from './header-view';
import { Emitter, CompositeDisposable } from 'atom';

export default function main_view(selection) {

    let _emitter = new Emitter(),
        _subscriptions = new CompositeDisposable();

    let _div = null,
        _header = null,
        _commands = null;

    let _bindings = {},
        _visible = false;

    function _main_view (selection) {

        // Add a div to the parent
        _div = selection.append('div')
            .style('display', _visible ? null : 'none');

        // Add the header
        _header = header_view(_div)
            .title('Alloy Commands')
            .input('input-toggle')
            .input_callback(function () {
                atom.config.set(
                    'alloy.show_keymaps',
                    !atom.config.get('alloy.show_keymaps')
                );
            });

        // Add the commands list
        _commands = _div.append('div')
            .attr('class', 'item-list');

        // Create subscriptions
        _subscriptions.add(
            atom.commands.add('.workspace', 'alloy:runcommand', {
                displayName: 'Alloy: Run Command',
                description: 'Runs an Alloy command from the current file.',
                didDispatch: (e) => {
                    let index = parseInt(e.originalEvent.key);
                    let datum = _command(index);
                    _emitter.emit('runcommand', datum);
                }
            })
        );

        _subscriptions.add(
            atom.config.observe('alloy.show_keymaps', (is_displayed) => {
                _show_keymaps(is_displayed);
            })
        );

        return _main_view;

    }

    _main_view.dispose = function () {
        _emitter.dispose();
        _subscriptions.dispose();
    }

    _main_view.hide = function () {
        _visible = false;
        if (_div) _div.style('display', 'none');
        return _main_view;
    }

    _main_view.show = function () {
        _visible = true;
        if (_div) _div.style('display', null);
        return _main_view;
    }

    _main_view.set_commands = function (editor, commands) {

        if (_commands) {

            commands = _clean_commands(editor, commands);

            let selection = _commands
                .selectAll('div.item')
                .data(commands, function (d) {
                    return d.key;
                });

            let exit = _exit(selection.exit());
            let enter = _enter(selection.enter());
            let update = _update(selection.merge(enter));

        }

        return _main_view;

    }

    _main_view.on_run_command = function (callback) {
        return _emitter.on('runcommand', callback);
    }

    function _update (selection) {

        let show_keymaps = atom.config.get('alloy.show_keymaps');

        selection.each(function (d, i) {

            let item = d3.select(this);

            // Set the button text
            item.select('.cmd-message')
                .text(d.command.label);

            // Set the button icon
            item.select('div.icon')
                .classed('icon-check', d.command.check)
                .classed('icon-flame', !d.command.check);

            // Show/hide the keymap and style it
            let show_keymap = show_keymaps && i < 10;
            item.select('.key-bindings')
                .style('display', show_keymap ? null : 'none')
                .select('.key-binding')
                .classed('running', d.is_running)
                .classed('error', d.is_error)
                .text(i < 10 ? 'Ctrl+' + i : null);

            // Show/hide status icon and style it
            let show_status = !show_keymap;
            item.select('.cmd-status')
                .style('display', show_status ? null : 'none')
                .classed('running', d.is_running)
                .classed('error', d.is_error);

            let hasbindings = d.bindings ? true : false;

        });

    }

    function _enter (selection) {

        // Add the container for the new button
        let enter = selection.append('div')
            .attr('class', 'item')
            .on('click', function (d) {
                _emitter.emit('runcommand', d);
            })
            .each(function (d, i) {
                d.bindings = {
                    keymap: _new_keymap(i),
                    tooltip: _new_tooltip(this, d)
                };
                _bindings[d.key] = d.bindings;
            });

        // The left icon
        enter.append('div')
            .attr('class', 'cmd-type icon');

        // The center text
        enter.append('div')
            .attr('class', 'cmd-message');

        // The right key binding
        enter.append('div')
            .attr('class', 'right key-bindings')
            .append('kbd')
            .attr('class', 'key-binding');

        // The right status icon
        enter.append('div')
            .attr('class', 'cmd-status right icon icon-primitive-dot');

        return enter;

    }

    function _exit (selection) {

        return selection
            .each(function(d, i) {
                if (d.bindings) {
                    d.bindings.keymap.dispose();
                    d.bindings.tooltip.dispose();
                    delete _bindings[d.key];
                }
            })
            .remove();

    }

    function _clean_commands(editor, commands) {

        return commands.map(function (command) {
            let key = editor.getPath() + ':' + command.pos.y;
            let bindings = _bindings[key];
            return {
                key: key,
                command: command,
                bindings: bindings
            };
        });

    }

    function _command (index) {

        return _commands ? _commands.selectAll('div.item').data()[index] : null;

    }

    function _show_keymaps (is_displayed) {

        if (_commands) {
            _commands.selectAll('.key-bindings')
                .style('display', is_displayed ? null : 'none');
            _commands.selectAll('.cmd-status')
                .style('display', is_displayed ? 'none' : null);
        }

        if (_header) {
            let input_div = _header.input();
            if (input_div) input_div.property('checked', is_displayed);
        }

    }

    function _new_keymap (index) {
        if (index >= 0 && index < 10) {
            let binding = {};
            binding['ctrl-' + index] = 'alloy:runcommand';
            return atom.keymaps.add('alloy/keymaps', {
                '.workspace': binding
            });
        }
        return {dispose: () => {}};
    }

    function _new_tooltip (node, data) {
        return atom.tooltips.add(node, {
            title: data.command.toString(),
            placement: function () {
                let location = atom.workspace.paneContainerForURI('atom://alloy').location;
                return location === 'left' ? 'right' : 'left';
            }
        });
    }

    return _main_view(selection);

}
