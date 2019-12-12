import {
  updateDynamicVariables
} from './DynamicVariable.js';

export class Network {
  constructor(nodes, inputnodes, outputnodes) {
    this.nodes = nodes;
    this.inputnodes = inputnodes;
    this.outputnodes = outputnodes;
  }

  predict(input) {
    if (this.inputnodes.length != input.length) {
      console.error("Input does not fit input size of Network");
    }

    //overwrite activation callbacks for input
    for (let i in this.inputnodes) {
      this.inputnodes[i].backupActivationcb = this.inputnodes[i].activationcb;
      this.inputnodes[i].activationcb = (() => input[i]);
    }


    //get prediction in this 'modified network'
    updateDynamicVariables();
    const values = this.outputnodes.map(o => o.getActivation());

    //restore input functions from backup
    for (let i in this.inputnodes) {
      this.inputnodes[i].activationcb = this.inputnodes[i].backupActivationcb;
    }
    return values;
  }
}
