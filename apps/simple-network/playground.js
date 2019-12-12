//jshint: "esversion": 8


import {
  Node,
  updateActivations
} from './Node.js';

import {
  InputNode
} from './InputNode.js';

import {
  NetworkVisualization
} from './NetworkVisualization.js';


// some toy example

const nodes = [
  new InputNode(),
  new InputNode(),

  new Node(),
  new Node(),
  new Node(),

  new Node()
];

//TODO
for (let i in nodes) {
  const l = i <= 1 ? 0 : i <= 4 ? 1 : 2;

  //nodes[i].x = 2 * ((l + 1) * 100);
  //nodes[i].y = 2 * (50 + 80 * i + Math.sin(i) * 20 - 180 * l);

  if (l > 0)
    nodes[i].bias = -5 + 7 * Math.random();
}
//output from console
nodes[0].x = 112; nodes[0].y = 190;
nodes[1].x = 129; nodes[1].y = 405.6588393923159;
nodes[2].x = 359; nodes[2].y = 105.3718970730273;
nodes[3].x = 476; nodes[3].y = 288.64480032239464;
nodes[4].x = 382; nodes[4].y = 516.7279001876828;
nodes[5].x = 663; nodes[5].y = 297.64302901347446;

nodes[0].addChild(nodes[2], 1);
nodes[0].addChild(nodes[3], 1);
nodes[0].addChild(nodes[4], 1);
nodes[1].addChild(nodes[2], 1);
nodes[1].addChild(nodes[3], 1);
nodes[1].addChild(nodes[4], 1);
nodes[2].addChild(nodes[5], 1);
nodes[3].addChild(nodes[5], 1);
nodes[4].addChild(nodes[5], 1);


const nv = new NetworkVisualization(nodes);
nv.animate();
nv.addInteraction();
