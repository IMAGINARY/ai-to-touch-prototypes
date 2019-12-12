//jshint: "esversion": 8

import {
  Edge
} from './Edge.js';

var currentcomputetime = 0;

export function updateActivations() {
  currentcomputetime++;
}


export class Node {
  constructor() {
    this.activation = 0;
    this.bias = 0;
    this.outedges = [];
    this.inedges = [];
    this.ctime = -1;
  }


  addChild(other, weight, reverse = true) {
    const edge = new Edge(this, other, weight);
    this.outedges.push(edge);
    if (reverse) {
      other.inedges.push(edge);
    }
  }

  getActivation(cid = -1) {
    if (cid == -1) {
      cid = currentcomputetime;
    }
    if (cid == this.ctime) {
      return this.activation;
    } else {
      this.activation = this.bias;
      for (let eid in this.inedges) {
        const edge = this.inedges[eid];
        this.activation += edge.weight * edge.from.getActivation(cid);
      }
      this.activation = Math.max(0, this.activation); //ReLu
      this.ctime = cid;
      return this.activation;
    }
  }
}
