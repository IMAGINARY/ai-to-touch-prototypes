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

const trainingdata = [{
    cloudiness: 1,
    inside: 0,
    temperature: 1.2
  },
  {
    cloudiness: 0.5,
    inside: 0,
    temperature: 1.7
  },
  {
    cloudiness: 0,
    inside: 0,
    temperature: 2.8
  },
  {
    cloudiness: 0.3,
    inside: 0,
    temperature: 2.3
  },
  {
    cloudiness: 1,
    inside: 1,
    temperature: 2.0
  },
  {
    cloudiness: 0.5,
    inside: 1,
    temperature: 2.0
  },
  {
    cloudiness: 0,
    inside: 1,
    temperature: 2.1
  }
];

function updatepredictions() {
  for (let i in trainingdata) {
    const td = trainingdata[i];
    td.predictedtemperature = nw.predict([td.cloudiness, td.inside])[0];
    td.error = Math.abs(td.predictedtemperature - td.temperature);
  }

  var errorcolor = d3.scaleSequential().domain([2, 0])
    .interpolator(d3.interpolateRdYlGn);

  d3.select('.trainingpreview').selectAll("div").data(trainingdata).join("div")
    .text(d => JSON.stringify(d))
    .style("background-color", d => errorcolor(d.error))
    .on('click', d => {
      //overwrite input functions
      nodes[0].setUserParameter(d.cloudiness);
      nodes[1].setUserParameter(d.inside);
      console.log(this);
    });
}

function animatepredictions() {
  updatepredictions();
  requestAnimationFrame(animatepredictions);
}

animatepredictions();
