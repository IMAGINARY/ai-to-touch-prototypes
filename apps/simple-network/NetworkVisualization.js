import {
  unit
} from './constants.js';

import {
  updateActivations
} from './Node.js';

export class NetworkVisualization {
  constructor(network) {
    const nodes = this.nodes = network.nodes;
    this.inputnodes = network.inputnodes;
    this.outputnodes = network.outputnodes;

    this.edges = [];

    for (let i in nodes) {
      for (let k in nodes[i].outedges) {
        this.edges.push(nodes[i].outedges[k]);
      }
    }
    //TODO: sort based on y coordinates of incoming edges
    this.edges = this.edges.reverse();
  }

  animate() {
    const nodes = this.nodes;
    const edges = this.edges;

    updateActivations();
    for (let i in nodes) {
      nodes[i].offset = nodes[i].bias;
    }

    for (let i in edges) { //TODO: order based on y coordinate of incoming nodes
      const edge = edges[i];
      edge.offset = edge.to.offset;
      edge.to.offset += edge.from.getActivation() * edge.weight;
    }

    d3.select("#nodes").selectAll("circle").data(nodes)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 50)
      .attr("fill", "gray")
      .attr("fill-opacity", 0.5);


    d3.select("#node-parameters").selectAll("circle").data(nodes.filter(n => !this.inputnodes.includes(n)))
      .join("circle")
      .attr("cx", n => n.x)
      .attr("cy", n => n.y - unit * n.bias)
      .attr("r", 8)
      .attr("fill", "white")
      .attr("fill-opacity", 0.5)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.5);


    d3.select("#edge-parameters").selectAll("circle").data(edges)
      .join("circle")
      .attr("cx", edge => (edge.from.x + edge.to.x) / 2)
      .attr("cy", edge => {
        //const sactivation = edge.from.getActivation();
        //const eactivation = sactivation * edge.weight;
        return edge.firstHalfBezier()[3][1] - unit * edge.weight;
      })
      .attr("r", 8)
      .attr("fill", "blue")
      .attr("fill-opacity", 0.2)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.2);

    var group = d3.select("#edges").selectAll("g").data(edges);

    //exit, remove
    group.exit().remove();

    //add new elements
    const enter = group.enter().append("g");
    enter.append("path").classed("bottom", true);
    enter.append("path").classed("activation", true);

    //consider new and old, already exising elements
    group = group.merge(enter);


    //draw bottom lines
    group.selectAll(".bottom").attr("d", edge => {
        const p = d3.path();


        if (edge.from.bias < 0 || this.inputnodes.includes(edges.from)) {
          p.moveTo(edge.from.x, edge.from.y);
        } else {
          //make "waterproof"
          p.moveTo(edge.from.x, edge.from.y - unit * edge.from.bias);
          p.lineTo(edge.from.x, edge.from.y);
        }

        //p.lineTo(edge.to.x, edge.to.y);
        const b = edge.bezier();
        p.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);
        if (edge.offset < 0) //make "waterproof"
          p.lineTo(edge.to.x, edge.to.y);
        return p;
      })
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none");


    group.selectAll(".activation").attr("d", edge => {
        const sactivation = edge.from.getActivation();
        const eactivation = sactivation * edge.weight;
        const p = d3.path();

        const b = edge.bezier();
        p.moveTo(b[0][0], b[0][1]);
        p.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);

        p.lineTo(b[3][0], b[3][1] - unit * eactivation);

        const b1 = edge.firstHalfBezier();
        const b2 = edge.secondHalfBezier();

        p.bezierCurveTo(b2[2][0], b2[2][1] - unit * eactivation, b2[1][0], b2[1][1] - unit * eactivation, b2[0][0], b2[0][1] - unit * eactivation);
        p.lineTo(b1[3][0], b1[3][1] - unit * sactivation);
        p.bezierCurveTo(b1[2][0], b1[2][1] - unit * sactivation, b1[1][0], b1[1][1] - unit * sactivation, b1[0][0], b1[0][1] - unit * sactivation);

        return p;
      })
      //.attr("stroke", "none")
      //.attr("stroke-width", 2)
      .attr("fill", e => e.weight > 0 ? "blue" : "red")
      .attr("fill-opacity", 0.5);
    requestAnimationFrame(() => this.animate());
  }


  addInteraction() {
    const nodes = this.nodes;
    d3.drag()
      .on("start", function() {
        var current = d3.select(this);
        this.deltaX = current.attr("cx") - d3.event.x;
        this.deltaY = current.attr("cy") - d3.event.y;
      })
      .on("drag", function() {
        const node = d3.select(this).data()[0];
        node.x = d3.event.x + this.deltaX;
        node.y = d3.event.y + this.deltaX;

        /*  for (let i in nodes) {
            console.log(
              `nodes[${i}].x = ${nodes[i].x}; nodes[${i}].y = ${nodes[i].y};`
            );
          }*/
      })(d3.select("#nodes").selectAll("circle"));

    d3.drag()
      .on("start", function() {
        var current = d3.select(this);
        //this.deltaX = current.attr("cx") - d3.event.x;
        this.deltaY = current.attr("cy") - d3.event.y;
      })
      .on("drag", function() {
        const node = d3.select(this).data()[0];
        node.bias = -(d3.event.y + this.deltaY - node.y) / unit;
        //node.y = d3.event.y + this.deltaX;
      })(d3.select("#node-parameters").selectAll("circle"));

    d3.drag()
      .on("start", function() {
        var current = d3.select(this);
        //this.deltaX = current.attr("cx") - d3.event.x;
        this.y0 = d3.event.y;
      })
      .on("drag", function() {
        const edge = d3.select(this).data()[0];
        //if (edge.from.getActivation() > 0.001) {
        edge.weight = -(d3.event.y - this.y0) / unit;
        //}

        //node.y = d3.event.y + this.deltaX;
      })(d3.select("#edge-parameters").selectAll("circle"));
  }
}
