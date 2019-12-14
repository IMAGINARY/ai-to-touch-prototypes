import {
  updateDynamicVariables
} from './DynamicVariable.js';

export class Network {
  constructor(nodes, inputnodes, outputnodes) {
    this.nodes = nodes;
    this.inputnodes = inputnodes;
    this.outputnodes = outputnodes;
    this.edges = [];

    for (let i in nodes) {
      for (let k in nodes[i].outedges) {
        this.edges.push(nodes[i].outedges[k]);
      }
    }
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
    const predicted = this.outputnodes.map(o => o.getActivation());

    //restore input functions from backup
    for (let i in this.inputnodes) {
      this.inputnodes[i].restoreGetActivation();
    }
    return predicted;
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

  //computes loss function and saves its gradient as parameters to objects in network
  gradientLoss(trainX, trainY) {
    let sqsum = 0;

    for (let i in this.nodes) {
      this.nodes[i].dloss = 0;
    }

    for (let i in this.edges) {
      this.edges[i].dloss = 0;
    }


    for (let k in trainX) {
      const input = trainX[k];
      const target = trainY[k];
      //overwrite activation callbacks for input
      for (let i in this.inputnodes) {
        this.inputnodes[i].temporarilyReplaceGetActivation(() => input[i]);
      }

      //get prediction in this 'modified network'
      updateDynamicVariables();
      const predicted = this.outputnodes.map(o => o.getActivation());
      for (let i in predicted)
        sqsum += (predicted[i] - target[i]) * (predicted[i] - target[i]);

      for (let i in this.outputnodes) {
        this.outputnodes[i].temporarilyReplaceGetdActivation(() => 2 * (target[i] - predicted[i]));
      }
      updateDynamicVariables();

      for (let i in this.nodes) {
        this.nodes[i].dloss += this.nodes[i].getdBias();
      }

      for (let i in this.edges) {
        this.edges[i].dloss += this.edges[i].getdWeight();
        console.log(this.edges[i].dloss);
      }



      //restore functions from backup
      for (let i in this.inputnodes) {
        this.inputnodes[i].restoreGetActivation();
      }

      for (let i in this.outputnodes) {
        this.outputnodes[i].restoreGetdActivation();
      }
    }
    return sqsum;
  }

}
