import {
  unit
} from './constants.js';

//jshint: "esversion": 8

import {
  DynamicVariable
} from './DynamicVariable.js';

//one-dimensional De Casteljau to clip bezier
//1st half
const casteljau1 = p => [p[0], (p[0] + p[1]) / 2, (p[0] + 2 * p[1] + p[2]) / 4, (p[0] + 3 * p[1] + 3 * p[2] + p[3]) / 8];
//2nd half
const casteljau2 = p => casteljau1(p.reverse()).reverse();

//https://stackoverflow.com/a/46805290
const transpose = matrix => matrix[0].map((col, i) => matrix.map(row => row[i]));

const applySeperatelyToEachCoordinate = (coordinates, map) => (transpose(transpose(coordinates).map(map)));

export class Edge {
  constructor(from, to, weight) {
    this.from = from;
    this.to = to;
    this.weight = weight;
    this.dweight = new DynamicVariable();
  }

  bezier() {
    const edge = this;
    return [
      [
        edge.from.x,
        edge.from.y
      ],
      [
        (edge.from.x + edge.to.x) / 2,
        edge.from.y
      ],
      [
        (edge.from.x + edge.to.x) / 2,
        edge.to.y - unit * (edge.offset)
      ],
      [
        edge.to.x,
        edge.to.y - unit * (edge.offset)
      ]
    ];
  }

  firstHalfBezier() {
    return applySeperatelyToEachCoordinate(this.bezier(), casteljau1);
  }

  secondHalfBezier() {
    return applySeperatelyToEachCoordinate(this.bezier(), casteljau2);
  }

  getdWeight() {
    this.dweight.update(() => {
      let dactivation = 0;
      for (let eid in this.outedges) {
        const edge = this.outedges[eid];
        if (edge.to.getActivation(cid) >= 0) { //TODO: or || next node output node
          dactivation += edge.weight * edge.to.getdActivation();
        }
      }
      return dactivation;
    });
  }
}
