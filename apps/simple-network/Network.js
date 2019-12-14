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
      this.inputnodes[i].temporarilyReplaceGetActivation(() => input[i]);
    }

    //get prediction in this 'modified network'
    updateDynamicVariables();
    const values = this.outputnodes.map(o => o.getActivation());

    //restore input functions from backup
    for (let i in this.inputnodes) {
      this.inputnodes[i].restoreGetActivation();
    }
    return values;
  }

  loss(trainX, trainY) {
    let sqsum = 0;
    for (let i in trainX) {
      const predicted = this.predict(trainX[i]);
      for (let k in predicted)
        sqsum += (predicted[k] - trainY[i][k]) * (predicted[k] - trainY[i][k]);
    }
    return sqsum;
  }
}
