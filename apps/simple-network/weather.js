//jshint: "esversion": 8


import {
  Node,
  updateActivations
} from './Node.js';

import {
  InputNode
} from './InputNode.js';

import {
  Network
} from './Network.js';


import {
  NetworkVisualization
} from './NetworkVisualization.js';


// some toy example

const omega1 = 1 + Math.random();
const omega2 = 1 + Math.random();

const nodes = [
  new InputNode(() => 1 + 0.5 * Math.sin(omega1 * Date.now() / 1000)),
  new InputNode(() => 1 + 0.5 * Math.sin(omega2 * Date.now() / 1000)),

  new Node(),
  new Node(),

  new Node()
];

for (let i in [2, 3]) {
  nodes[i].bias = -5 + 7 * Math.random();
}
//output from console
nodes[0].x = 112;
nodes[0].y = 190;
nodes[1].x = 129;
nodes[1].y = 405.6588393923159;
nodes[2].x = 359;
nodes[2].y = 105.3718970730273;
nodes[3].x = 476;
nodes[3].y = 288.64480032239464;
nodes[4].x = 663;
nodes[4].y = 297.64302901347446;

nodes[0].addChild(nodes[2], 1);
nodes[0].addChild(nodes[3], 1);
nodes[1].addChild(nodes[2], 1);
nodes[1].addChild(nodes[3], 1);
nodes[2].addChild(nodes[4], 1);
nodes[3].addChild(nodes[4], 1);

const nw = new Network(
  nodes,
  [nodes[0], nodes[1]], //input nodes
  [nodes[4]] //output nodes
);

const nv = new NetworkVisualization(nw);

nv.animate();
nv.addInteraction();

console.log(nw.predict([1,2]));
console.log(nw.predict([0,0]));
