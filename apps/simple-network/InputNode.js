import {
  Node
} from './Node.js';

import {
  DynamicVariable,
  updateDynamicVariables
} from './DynamicVariable.js';

export class InputNode extends Node {
  constructor(activationcb = (() => 0)) {
    super();
    this.getActivation = activationcb;
  }

  setUserParameter(val) {
    if (!this.hasOwnProperty("userparamter")) {
      this.getActivation = (() => this.userparamter);
    }
    this.userparamter = val;
    updateDynamicVariables();
  }

  temporarilyReplaceGetActivation(tempActivation) {
    this.getActivationBackup = this.getActivation;
    this.getActivation = tempActivation;
    updateDynamicVariables();
  }

  restoreGetActivation() {
    this.getActivation = this.getActivationBackup;
    updateDynamicVariables();
  }
}
