import {
  Node
} from './Node.js';


export class InputNode extends Node {
  constructor(activationcb = (() => 0)) {
    super();
    this.activationcb = activationcb;
  }

  getActivation() {
    return this.activationcb();
  }

  setUserParameter(val) {
    if (!this.hasOwnProperty("userparamter")) {
      this.activationcb = (() => this.userparamter);
    }
    this.userparamter = val;
  }
}
