import {
  Node
} from './Node.js';


export class InputNode extends Node {
  constructor(activationcb) {
    super();
    this.activationcb = activationcb;
  }

  getActivation() {
    return this.activationcb();
  }
}
