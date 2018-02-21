'use babel';

export default class NeedsRestartView {

    constructor(selection) {

        // Add a div to the parent
        this.div = selection.append('div');

        // Add warning view
        this.view_warning = this._create_view_warning(this.div);
        this.callback = null;

        // Add error view
        this.view_error = this._create_view_error(this.div);

    }

    hide() {
        this.div.style('display', 'none');
        this.callback = null;
    }

    showError() {
        this.div.style('display', null);
        this.view_warning.style('display', 'none');
        this.view_error.style('display', null);
    }

    showWarning(onReturnCallback) {
        this.callback = onReturnCallback;
        this.div.style('display', null);
        this.view_warning.style('display', null);
        this.view_error.style('display', 'none');
    }

    _create_view_warning(selection) {

        let view = selection.append('div')
            .attr('class', 'centered');

        view.append('div')
            .attr('class', 'message-lg')
            .text(
                'Atom needs to be restarted before ' +
                'changes will take effect.'
            );

        let buttons = view.append('div')
            .attr('class', 'centered btn-col');

        buttons.append('button')
            .attr('class', 'btn btn-lg btn-primary icon icon-sync')
            .text('Restart Atom')
            .on('click', () => {
                atom.reload();
            });

        buttons.append('button')
            .attr('class', 'btn btn-lg btn-success icon icon-chevron-left')
            .text('Continue Working')
            .on('click', () => {
                if (this.callback) {
                    this.callback();
                }
            });

        return view;
    }

    _create_view_error(selection) {

        let view = selection.append('div')
            .attr('class', 'centered');

        return view;

    }

}
