'use babel';

import * as d3 from 'd3-selection';
import { Emitter } from 'atom';

export default class AlloyView {

  constructor(serializedState) {

    this.emitter = new Emitter();

    this.element = document.createElement('div');
    this.selection = d3.select(this.element).attr('class', 'alloy');
    this.list = this.selection.append('div')
      .attr('class', 'block');

  }

  destroy() {
    this.emitter.dispose();
    this.element.remove();
  }

  fileChanged(file) {
    // Do some styling here to show that the file will have to be recompiled
  }

  setCommands(commands) {

    if (this.list) {

      let emitter = this.emitter;
      let selection = this.list.selectAll('button').data(commands);

      selection.exit()
        .remove();

      selection = selection.enter()
        .append('button')
        .attr('class', 'btn btn-large')
        .on('click', function () {
          let command = d3.select(this).datum();
          emitter.emit('runcommand', command);
        })
        .merge(selection);

      selection.text(function (d) {
        return d.toString();
      });
    }
  }

  setError(error) {
    let position = error.cause.pos;
    let l0 = position.y;
    let l1 = position.y2;
  }

  setSignatures(signatures) {
    // signatures.forEach(function (sig) {
    //   console.log(sig.toStringSync());
    // });
  }

  onRunCommand(callback) {
    this.emitter.on('runcommand', callback);
  }

  getAllowedLocations() {
    return ['right', 'left'];
  }

  getDefaultLocation() {
    return 'right';
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return 'Alloy';
  }

  getURI() {
    return 'atom://alloy'
  }

}
