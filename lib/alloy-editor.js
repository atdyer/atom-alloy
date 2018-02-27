'use babel';

import * as d3 from 'd3-selection';
import { extension } from './util';

export default class AlloyEditor {

    constructor(runner) {

        this._editor = null;
        this._runner = null;
        this._watcher = null;

        this.setRunner(runner);

    }

    setEditor(editor) {
        if (this._watcher) this._watcher.dispose();
        if (editor && extension(editor.getTitle()) === 'als') {
            this._editor = editor;
            this._watcher = editor.onDidStopChanging(() => { this._parseEditor() });
            this._parseEditor();
        } else {
            this._editor = null;
        }
    }

    setRunner(runner) {

        if (runner) {
            this._runner = runner;
            this._runner.on_java_ready(() => { this._parseEditor() });
        }

    }

    _parseEditor() {
        if (this._editor && this._runner) {
            this._runner.parse(this._editor);
        }
    }
}
