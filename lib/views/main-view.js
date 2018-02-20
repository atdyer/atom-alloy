'use babel';

export default class MainView {

    constructor(selection) {

        // Add a div to the parent
        this.div = selection.append('div');

        // Add sections
        this.commands = this.div.append('div')
            .attr('class', 'section');

        // Temp
        this.commands.text('heyoooo.');

    }

    hide() {
        this.div.style('display', 'none');
    }

    show() {
        this.div.style('display', null);
    }

}
