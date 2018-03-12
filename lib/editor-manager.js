'use babel';

// Alloy
import editor from './editor';

// Atom
import { Emitter } from 'atom';


export default function editor_manager () {

    let _editors = {},
        _active_editor = null,
        _emitter = new Emitter();

    let _alloy = null,
        _alloy_subscription = null,
        _atom_subscription = atom.workspace.observeActiveTextEditor(_set_active_editor);

    let _manager = {};

    _manager.alloy = function (alloy) {

        if (!arguments.length) return _alloy;

        if (alloy) {
            _alloy_subscription = alloy.on_java_running(function () {

                _alloy = alloy;

                _manager.each(function (editor) {
                    editor.alloy(_alloy);
                });

                if (_active_editor) {
                    _emitter.emit('change', _active_editor.parse());
                }
                
            });

        }

        return _manager;

    }

    _manager.dispose = function () {

        if (_alloy_subscription) _alloy_subscription.dispose();
        if (_atom_subscription) _atom_subscription.dispose();
        if (_editor_subscription) _editor_subscription.dispose();
        _manager.each(function (editor) {
            editor.dispose();
        });

        return _manager;

    }

    _manager.each = function (callback) {
        for (key in _editors) {
            if (_editors.hasOwnProperty(key)) {
                callback(_editors[key]);
            }
        }
    }

    _manager.on_active_editor_change = function (callback) {

        return _emitter.on('change', callback);

    }

    function _set_active_editor (active_editor) {

        if (active_editor) {

            let path = active_editor.getPath();

            // Check the file extension
            if (path.split('.').pop() === 'als') {

                // Check if the editor has been previously opened
                let e =  _editors[path];
                if (!e) {

                    // It hasn't, so make a new one
                    e = editor().alloy(_alloy);

                    // Store the new editor
                    _editors[path] = e(active_editor);

                }

                _active_editor = e;
                _emitter.emit('change', e.parse());
                atom.workspace.open('atom://alloy');

            } else {

                _emitter.emit('change', null);
                atom.workspace.hide('atom://alloy');

            }

        } else {

            _emitter.emit('change', null);
            atom.workspace.hide('atom://alloy');

        }

    }

    return _manager;

}
