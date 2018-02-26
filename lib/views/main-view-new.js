'use babel';

import * as d3 from 'd3-selection';
import header_view from './header-view';
import { Emitter, CompositeDisposable } from 'atom';

export default function main_view(selection) {

    let _emitter = Emitter(),
        _subscriptions = CompositeDisposable(),
        _tooltips = [],
        _keymaps = [],
        _show_keymaps = atom.config.get('alloy.show_keymaps');

    let _div = null,
        _header = null,
        _commands = null;

    _main_view(selection) {

        // Create the divs
        _div = selection.append('div');
        _header = header_view(_div);
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
                _showKeymaps(is_displayed);
            })
        );

    }

    function _command(index) {

    }

    function _show_keymaps(is_displayed) {

    }

}
