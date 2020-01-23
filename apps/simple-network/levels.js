//jshint: "esversion": 8


import {
  Node,
} from './Node.js';

import {
  InputNode
} from './InputNode.js';

import {
  OutputNode
} from './OutputNode.js';

import {
  Network
} from './Network.js';

import {
  Level
} from './Level.js';

import {
  unit
} from './constants.js';

export class TutorialLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.1 * (Date.now() - this.t0) / 1000)),
      new OutputNode()
    ];
    nodes[0].x = 200;
    nodes[0].y = 200;
    nodes[1].x = 600;
    nodes[1].y = 300;
    nodes[0].addChild(nodes[1], 1);

    const m2 = c => ((c * 2));
    const trainXs = [1, 2, 3];
    const trainYs = trainXs.map(m2);

    super("A simple Network: Double its input.",
      new Network(
        nodes,
        [nodes[0]], //input nodes
        [nodes[1]] //output nodes
      ),
      ["input"], trainXs.map(x => [x]), //temperatures are internally divided by 10.
      ["desired output"], trainYs.map(x => [x]),
      "This is a minimalistic neural Network. On the left you can adjust its input. On the right you see what it outputs. The gray circles corrspond to neurons of the network and the amount of the blue corresponds their activation. Through conenctions between neurons their activation is spread. You can modify the parameter on the connection on the middle to perform a multiplication. Can you adjust the network such that it doubles the input?"
    );


    this.animatecallback = function() {
      this.updateUI();
      nodes[1].target = m2(nodes[0].getActivation());
    };


  }
}

export class WeatherLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 1),

      new Node(),
      new Node(),

      new OutputNode()
    ];

    for (let i in [2, 3]) {
      nodes[[2, 3][i]].bias = 2 * (Math.random() - 0.5);
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

    nodes[0].format = cls => `cloudiness: ${cls.toFixed(1)}`;
    nodes[1].format = v => Math.round(v) == 1 ? '1 (inside)' : '0 (outside)';
    nodes[4].format = temp => `${(temp*10).toFixed(0)}°C`;
    super("Can you predict the temperature given the cloudiness and the fact of being inside?", nw,
      ["amount of clouds", "inside?"], trainingdata.map(td => [td.cloudiness, td.inside]),
      ["temperature"], trainingdata.map(td => [td.temperature]),
      "Outside (insideness=0), the temperature depends on the amount of clouds: The higher the cloudiness, the lower the temperature. Inside (insideness=1), the temperature is constant 20°C."
    );

    this.animatecallback = function() {
      this.updateUI();
      //TODO add some nicer visualization for inside, cloudiness, and temperature.
      //round input

      nodes[1].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[1].getActivation()))));
    };

  }

}


export class FahrenheitLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new Node(), //TODO: No ReLu Nodes here!
      new OutputNode()
    ];

    for (let i in [1]) {
      nodes[[1][i]].bias = 1 + 2 * (Math.random());
    }

    nodes[0].x = 155;
    nodes[0].y = 300;
    nodes[1].x = 507;
    nodes[1].y = 300;
    nodes[2].x = 803;
    nodes[2].y = 300;

    nodes[0].addChild(nodes[1], 1);
    nodes[1].addChild(nodes[2], 1);


    const c2f = c => ((c * 1.8) + 32);
    const trainXs = [0, 10, 20, 30];
    const trainYs = trainXs.map(c2f);

    nodes[0].format = temp => `${(temp*10).toFixed(0)}°C`;
    nodes[2].format = temp => `${(temp*10).toFixed(0)}°F`;
    super("Convert Celsius to Fahrenheit.",
      new Network(
        nodes,
        [nodes[0]], //input nodes
        [nodes[2]] //output nodes
      ),
      ["Celsius"], trainXs.map(v => [v / 10]), //temperatures are internally divided by 10.
      ["Fahrenheit"], trainYs.map(v => [v / 10]),
      "Given the temperature in Celsius (left, orange slider), the temperature in Fahrenheit is to be computed (output of the network on the right side). Adjust the parameters (blue and white sliders) of the network such that it computes the target value for each input. All values of the table below should be obtained."
    );
    this.animatecallback = function() {
      this.updateUI();
      nodes[2].target = c2f(nodes[0].getActivation() * 10) / 10;
    };

  }
}


export class SumLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();
    const omega2 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new Node(), //TODO: No ReLu Nodes here!
      new OutputNode()
    ];

    for (let i in [1, 2]) {
      nodes[[1, 2][i]].bias = 2 * (Math.random() - 0.5);
    }

    nodes[0].x = 155;
    nodes[0].y = 150;
    nodes[1].x = 110;
    nodes[1].y = 300;
    nodes[2].x = 507;
    nodes[2].y = 300;
    nodes[3].x = 803;
    nodes[3].y = 300;

    nodes[0].addChild(nodes[2], 1);
    nodes[1].addChild(nodes[2], 1);
    nodes[2].addChild(nodes[3], 1);


    const c2f = c => ((c * 1.8) + 32);
    const trainXs = [
      [0, 0],
      [0, 1],
      [2, 1],
      [3, 1],
      [4, 2],
      [0, 2]
    ];
    const trainYs = trainXs.map(p => [p[0] + p[1]]);

    super("Compute the sum of the input activations.",
      new Network(
        nodes,
        [nodes[0], nodes[1]], //input nodes
        [nodes[3]] //output nodes
      ),
      ["summand 1", "summand 2"], trainXs, //temperatures are internally divided by 10.
      ["sum"], trainYs,
      "Adjust the parameters of the network such that the output on the left equals the sum of the two inputs on the right for every possible non-negative input."
    );
    this.animatecallback = function() {
      this.updateUI();
      nodes[3].target = (nodes[0].getActivation()) + (nodes[1].getActivation());
    };

  }
}


export class MaxLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();
    const omega2 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 1.5 + 1 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 1 + 1 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),

      new Node(),

      new OutputNode()
    ];

    for (let i in [2]) {
      nodes[[2][i]].bias = 2 * (Math.random() - 0.5);
    }

    //output from console
    nodes[0].x = 250;
    nodes[0].y = 150;
    nodes[1].x = 100;
    nodes[1].y = 315.6588393923159;
    nodes[2].x = 507;
    nodes[2].y = 180;
    //nodes[3].x = 611;
    //nodes[3].y = 354.64480032239464;
    nodes[3].x = 803;
    nodes[3].y = 300.64302901347446;

    nodes[0].addChild(nodes[2], 1);
    //nodes[0].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[2], -.2);


    nodes[2].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[3], 1);

    const nw = new Network(
      nodes,
      [nodes[0], nodes[1]], //input nodes
      [nodes[3]] //output nodes
    );
    const trainXs = [0, 0, 0, 0, 0, 0, 0].map(v => [Math.random(), Math.random()]);
    const trainYs = trainXs.map(p => [Math.max(p[0], p[1])]);

    super("Compute the maximum of the input activations.",
      nw,
      ["input 1", "input 2"], trainXs, //temperatures are internally divided by 10.
      ["maximum"], trainYs,
      "The output on the right should be the maximum of the input. Hint: The output of the internal node is the weighted sum of the inputs if it is positive, otherwise zero. Furthermore, max(a, b) = max(0, a-b) + b."
    );
    this.animatecallback = function() {
      this.updateUI();
      nodes[3].target = Math.max(nodes[0].getActivation(), nodes[1].getActivation());
    };

  }
}



export class XorLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();
    const omega2 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),

      new Node(),
      new Node(),
      new Node(),

      new OutputNode()
    ];

    for (let i in [2, 3, 4]) {
      nodes[[2, 3, 4][i]].bias = 2 * (Math.random() - 0.5);
    }

    //output from console
    nodes[0].x = 220;
    nodes[0].y = 184;
    nodes[1].x = 70;
    nodes[1].y = 400.6588393923159;
    nodes[2].x = 507;
    nodes[2].y = 122.3718970730273;
    nodes[3].x = 580;
    nodes[3].y = 305;
    nodes[4].x = 490;
    nodes[4].y = 450;
    nodes[5].x = 803;
    nodes[5].y = 300.64302901347446;

    nodes[0].addChild(nodes[2], 1);
    nodes[0].addChild(nodes[3], 1);
    nodes[0].addChild(nodes[4], 1);
    nodes[1].addChild(nodes[2], 1);
    nodes[1].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[4], 1);

    nodes[2].addChild(nodes[5], 1);
    nodes[3].addChild(nodes[5], 1);
    nodes[4].addChild(nodes[5], 1);

    const nw = new Network(
      nodes,
      [nodes[0], nodes[1]], //input nodes
      [nodes[5]] //output nodes
    );
    const trainXs = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ];
    const trainYs = [
      [0],
      [1],
      [1],
      [0]
    ];

    super("Compute the XOR of the input bits.",
      nw,
      ["bit 1", "bit 2"], trainXs, //temperatures are internally divided by 10.
      ["XOR"], trainYs,
      "Assume that the network only takes 0 and 1 as input. The output of the network should be 1 if exactly one input is set to 1. Otherwise (both inputs equal) the output should be 0."
    );
    this.animatecallback = function() {
      this.updateUI();
      //round input
      nodes[0].format = v => Math.round(v);
      nodes[1].format = v => Math.round(v);
      nodes[0].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[0].getActivation()))));
      nodes[1].setUserParameter(Math.min(1, Math.max(0, Math.round(nodes[1].getActivation()))));
    };

  }
}


export class AvgLevel extends Level {
  constructor() {
    const omega1 = 1 + Math.random();
    const omega2 = 1 + Math.random();
    const omega3 = 1 + Math.random();

    const nodes = [
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega1 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),
      new InputNode(() => 0.5 + 0.5 * Math.sin(omega2 * Date.now() / 1000) * Math.exp(-0.3 * (Date.now() - this.t0) / 1000)),

      new Node(),

      new OutputNode()
    ];

    for (let i in [3]) {
      nodes[[3][i]].bias = 2 * (Math.random() - 0.5);
    }

    //output from console
    nodes[0].x = 200;
    nodes[0].y = 184;
    nodes[1].x = 100;
    nodes[1].y = 315.6588393923159;
    nodes[2].x = 155;
    nodes[2].y = 420;

    nodes[3].x = 611;
    nodes[3].y = 354.64480032239464;
    nodes[4].x = 803;
    nodes[4].y = 232.64302901347446;

    nodes[0].addChild(nodes[3], 1);
    nodes[1].addChild(nodes[3], 1);
    nodes[2].addChild(nodes[3], 1);
    nodes[3].addChild(nodes[4], 1);

    const nw = new Network(
      nodes,
      [nodes[0], nodes[1], nodes[2]], //input nodes
      [nodes[4]] //output nodes
    );
    const trainXs = [0, 0, 0, 0, 0, 0, 0].map(v => [Math.random(), Math.random(), Math.random()]);
    const trainYs = trainXs.map(p => [(p[0] + p[1] + p[2]) / 3]);

    super("Compute the average of the input values.",
      nw,
      ["number 1", "number 2", "number 3"], trainXs, //temperatures are internally divided by 10.
      ["average"], trainYs,
    );
    this.animatecallback = function() {
      this.updateUI();
      nodes[4].target = (nodes[0].getActivation() + nodes[1].getActivation() + nodes[2].getActivation()) / 3;
    };

  }
}
