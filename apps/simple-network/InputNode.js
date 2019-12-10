import {
  Node
} from './Node.js';


export class InputNode extends Node {
  constructor() {
    super();
    this.omega = 1 + Math.random();
  }

  getActivation() {
    return 1 + 0.5 * Math.sin(this.omega * Date.now() / 1000);
  }
}
