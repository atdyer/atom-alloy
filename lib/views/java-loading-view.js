'use babel';

export default class JavaLoadingView {

    constructor(selection) {

        // Add a div to the parent
        this.div = selection.append('div');

        // Add a message
        this.div.append('div')
            .attr('class', 'message-lg')
            .text('Preparing for takeoff.');

        // Add a spinner
        this.div.append('div')
            .attr('class', 'centered')
            .append('span')
            .attr('class', 'loading loading-spinner-medium');

    }

    hide() {
        this.div.style('display', 'none');
    }

    show() {
        this.div.style('display', null);
    }

}
