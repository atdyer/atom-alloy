'use babel';

import alloy_config from '../lib/alloy-config';
import alloy from './alloy';
import editor_manager from './editor-manager';

export default {

    config: alloy_config,

    alloy: null,
    editor_manager: null,

    initialize () {

        this.alloy = alloy();

        this.editor_manager = editor_manager()
            .alloy(this.alloy);





        this.alloy.on_java_loading(function () {
            console.log('Java loading');
        });

        this.alloy.on_java_running(function () {
            console.log('Java running');
        });

        this.editor_manager.on_active_editor_change(function (editor) {
            console.log(editor);
        });





        this.alloy.jar(atom.config.get('alloy.jar'));


    }

}
