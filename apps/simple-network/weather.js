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


import {
  unit
} from './constants.js';


// some toy example

const omega1 = 1 + Math.random();
const omega2 = 1 + Math.random();

const nodes = [
  new InputNode(() => .5 + 0.5 * Math.sin(omega1 * Date.now() / 1000)),
  new InputNode(() => .5 + 0.5 * Math.sin(omega2 * Date.now() / 1000)),

  new Node(),
  new Node(),

  new Node()
];

for (let i in [2, 3]) {
  nodes[i].bias = -5 + 7 * Math.random();
}
//output from console
nodes[0].x = 155;
nodes[0].y = 184;
nodes[1].x = 161;
nodes[1].y = 315.6588393923159;
nodes[2].x = 507;
nodes[2].y = 122.3718970730273;
nodes[3].x = 611;
nodes[3].y = 354.64480032239464;
nodes[4].x = 803;
nodes[4].y = 232.64302901347446;

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


function formattemperature(temp) {
  return `${(temp*10).toFixed(0)}°C`;
}


const columns = ["cloudiness", "inside", "temperature", "predictedtemperature"];
const table = d3.select('#trainingpreview');
const thead = table.append('thead');
const tbody = table.append('tbody');

// append the header row
thead.append('tr')
  .selectAll('th')
  .data(columns).enter()
  .append('th')
  .text(function(column) {
    return column;
  });


function updatepredictions() {
  for (let i in trainingdata) {
    const td = trainingdata[i];
    td.predictedtemperature = nw.predict([td.cloudiness, td.inside])[0];
    td.error = Math.abs(td.predictedtemperature - td.temperature);
  }

  var errorcolor = d3.scaleSequential().domain([2, 0])
    .interpolator(d3.interpolateRdYlGn);

  // create a row for each object in the data
  var rows = tbody.selectAll('tr')
    .data(trainingdata)
    .join('tr')
    .on('click', d => {
      nodes[0].setUserParameter(d.cloudiness);
      nodes[1].setUserParameter(d.inside);

      d3.select("#target-temperature")
        .text("target:" + formattemperature(d.temperature))
        .transition()
        .attr("x", nodes[4].x + 50)
        .attr("y", nodes[4].y - unit * d.temperature)
        .attr("opacity", 1);
    });

  // create a cell in each row for each column
  var cells = rows.selectAll('td')
    .data(function(row) {
      return columns.map(function(column) {
        return {
          column: column,
          value: row[column],
          error: row.error
        };
      });
    })
    .join('td')
    .text(d => (d.column == "temperature" || d.column == "predictedtemperature") ? formattemperature(d.value) : d.value)
    .style("background-color", d => d.column == "predictedtemperature" ? errorcolor(d.error) : "white");




  /*
  d3.select('.trainingpreview').selectAll("div").data(trainingdata).join("div")
    .text(d => JSON.stringify(d))
    .style("background-color", d => errorcolor(d.error))
    .on('click', d => {
      //overwrite input functions
      nodes[0].setUserParameter(d.cloudiness);
      nodes[1].setUserParameter(d.inside);

      d3.select("#target-temperature")
        .text("target:" + formattemperature(d.temperature))
        .transition()
        .attr("x", nodes[4].x + 50)
        .attr("y", nodes[4].y - unit * d.temperature)
        .attr("opacity", 1);
    });
    */
}

function animatecallback() {

  d3.select("#current-temperature")
    .text(formattemperature(nodes[4].getActivation()))
    .attr("x", nodes[4].x)
    .attr("y", nodes[4].y - unit * nodes[4].getActivation());

  d3.select("#cloudiness")
    .text("cloudiness: " + nodes[0].getActivation().toFixed(2))
    .attr("x", nodes[0].x - 110)
    .attr("y", nodes[0].y - 10 - unit * nodes[0].getActivation());

  d3.select("#insideness")
    .text("insideness: " + nodes[1].getActivation().toFixed(2))
    .attr("x", nodes[1].x - 110)
    .attr("y", nodes[1].y - 10 - unit * nodes[1].getActivation());

  updatepredictions();
}


const nv = new NetworkVisualization(nw, animatecallback);

nv.animate();
nv.addInteraction();