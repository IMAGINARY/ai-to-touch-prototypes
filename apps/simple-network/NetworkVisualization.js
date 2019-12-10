import {
  updateActivations
} from './Node.js';


//del casteljau to clip bezier
//first half
const casteljau1 = p => [p[0], (p[0] + p[1]) / 2, (p[0] + 2 * p[1] + p[2]) / 4, (p[0] + 3 * p[1] + 3 * p[2] + p[3]) / 8];
//snd half
const casteljau2 = p => casteljau1(p.reverse()).reverse();

const unit = 10;

export class NetworkVisualization {
  constructor(nodes) {
    this.nodes = nodes;
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


    d3.select("#node-parameters").selectAll("circle").data(nodes.filter(n => (n.constructor.name == "Node")))
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
        const sactivation = edge.from.getActivation();
        const eactivation = sactivation * edge.weight;
        var ptsx, ptsy;
        [ptsx, ptsy] = edge.bezier(unit);
        const ptsy1 = casteljau1(ptsy);
        return ptsy1[3] - unit * eactivation;
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
        //make "waterproof"
        if (edge.from.bias < 0) {
          p.moveTo(edge.from.x, edge.from.y);
        } else {
          p.moveTo(edge.from.x, edge.from.y - unit * edge.from.bias);
          p.lineTo(edge.from.x, edge.from.y);
        }

        //p.lineTo(edge.to.x, edge.to.y);
        p.bezierCurveTo((edge.from.x + edge.to.x) / 2, edge.from.y, (edge.from.x + edge.to.x) / 2, edge.to.y - unit * edge.offset, edge.to.x, edge.to.y - unit * edge.offset);
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

        var ptsx, ptsy;
        [ptsx, ptsy] = edge.bezier(unit);

        p.moveTo(ptsx[0], ptsy[0]);
        p.bezierCurveTo(ptsx[1], ptsy[1], ptsx[2], ptsy[2], ptsx[3], ptsy[3]);


        p.lineTo(ptsx[3], ptsy[3] - unit * eactivation);

        const ptsx1 = casteljau1(ptsx);
        const ptsy1 = casteljau1(ptsy);
        const ptsx2 = casteljau2(ptsx);
        const ptsy2 = casteljau2(ptsy);

        p.bezierCurveTo(ptsx2[2], ptsy2[2] - unit * eactivation, ptsx2[1], ptsy2[1] - unit * eactivation, ptsx2[0], ptsy2[0] - unit * eactivation);
        p.lineTo(ptsx1[3], ptsy1[3] - unit * sactivation);
        p.bezierCurveTo(ptsx1[2], ptsy1[2] - unit * sactivation, ptsx1[1], ptsy1[1] - unit * sactivation, ptsx1[0], ptsy1[0] - unit * sactivation);

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
        if (edge.from.getActivation() > 0.001) {
          edge.weight = -(d3.event.y - this.y0) / unit / edge.from.getActivation();
        }

        //node.y = d3.event.y + this.deltaX;
      })(d3.select("#edge-parameters").selectAll("circle"));
  }
}
