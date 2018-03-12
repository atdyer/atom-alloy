'use babel';

import alloy from './alloy';
import alloy_config from '../lib-old/alloy-config';
import alloy_panel from './views/alloy-panel';
import editor_manager from './editor-manager';

export default {

    config: alloy_config,

    alloy: null,
    editor_manager: null,
    panel: null,

    initialize () {

        // The panel needs to be created before the editor manager
        // otherwise, if an alloy file is already open, the editor
        // manager will request to open the alloy panel immediately,
        // which will cause a file called 'alloy' to be opened
        this.panel = alloy_panel()
            .element(document.createElement('div'));

        // Create the alloy instance
        this.alloy = alloy();
        this.alloy.on_java_loading(this.panel.show_java_loading);
        this.alloy.on_java_running(this.panel.show_editor);

        // Watch and track text editors that open Alloy files
        this.editor_manager = editor_manager()
            .alloy(this.alloy);
        this.editor_manager.on_active_editor_change(this.panel.editor);


        // Set the jar file in the alloy instance
        this.alloy.jar(atom.config.get('alloy.jar'));


    },

    deactivate () {

        if (this.panel) this.panel.dispose();

    }

}
