'use babel';

import * as d3 from 'd3-selection';
import header_view from './header-view';
import command_button from '../components/command-button';
import { Emitter, CompositeDisposable } from 'atom';

export default function main_view(selection) {

    let _emitter = new Emitter(),
        _subscriptions = new CompositeDisposable();

    let _div = null,
        _header = null,
        _commands = null;

    let _buttons = null;

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
        // _subscriptions.add(
        //     atom.commands.add('.workspace', 'alloy:runcommand', {
        //         displayName: 'Alloy: Run Command',
        //         description: 'Runs an Alloy command from the current file.',
        //         didDispatch: (e) => {
        //             let index = parseInt(e.originalEvent.key);
        //             let datum = _command(index);
        //             _emitter.emit('runcommand', datum);
        //         }
        //     })
        // );

        // _subscriptions.add(
        //     atom.config.observe('alloy.show_keymaps', (is_displayed) => {
        //         _show_keymaps(is_displayed);
        //     })
        // );

        return _main_view;

    }

    _main_view.dispose = function () {
        _emitter.dispose();
        _subscriptions.dispose();

        // Dispose tooltips for each button
        if (_buttons) {
            _buttons.each(function (button) {
                button.dispose();
            });
        }

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

            let selection = _commands.selectAll('div.item')
                .data(commands);

            selection.exit()
                .each(dispose_button)
                .remove();

            selection
                .enter()
                .append('div')
                .merge(selection)
                .each(update_button);

            function dispose_button (d) {
                d.dispose();
            }

            function update_button(d) {
                d(d3.select(this));
            }

        }

        return _main_view;

    }

    _main_view.on_command_clicked = function (callback) {
        return _emitter.on('commandclicked', callback);
    }

    function _clean_commands(editor, commands) {

        return commands.map(function (command) {
            let file = editor.getPath();
            return command_button()
                .command(command)
                .file(file)
                .key(file + ':' + command.pos.y)
                .on('click', function (button) {
                    _emitter.emit('commandclicked', button);
                });
        });

    }

    return _main_view(selection);

}
