'use babel';

import { extension } from '../util';

export default class SettingsRequiredView {

    constructor(selection) {

        // Add a div to the parent
        this.div = selection.append('div').attr('class', 'centered');

        // Add an invisible file picker
        let picker = this.div.append('input')
            .attr('type', 'file')
            .style('display', 'none')
            .on('change', () => {
                let file = event.target.files[0].path;
                if (extension(file) === 'jar') {
                    atom.config.set('alloy.jar', file);
                } else {
                    this.showJarError();
                }
            });

        // Add descriptive text
        this.div.append('div')
            .attr('class', 'message-lg')
            .html('<p>Set the <a href="http://alloytools.org/download.html">alloy.jar</a> location to enable Alloy features.</p>');

        // Add button to choose jar file
        this.div.append('div')
            .attr('class', 'centered btn-col-9')
            .append('button')
            .attr('class', 'btn btn-lg btn-primary icon icon-file-directory')
            .text('Browse...')
            .on('click', function() {
                picker.node().click();
            });

        // Add the jar error
        this.error = this.div.append('div')
            .attr('class', 'message-lg text-error')
            .style('display', 'none')
            .text('Please choose a .jar file');

        // Add button to access settings
        // this.div.append('div')
        //     .attr('class', 'centered')
        //     .append('button')
        //     .attr('class', 'btn btn-lg')
        //     .text('Settings...')
        //     .on('click', function () {
        //         atom.workspace.open('atom://config/packages/alloy');
        //     });

    }

    hide() {
        this.div.style('display', 'none');
    }

    hideJarError() {
        this.error.style('display', 'none');
    }

    show() {
        this.div.style('display', null);
    }

    showJarError() {
        this.error.style('display', null);
    }

}