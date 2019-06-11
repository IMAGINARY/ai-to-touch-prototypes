const model = tf.sequential({
    layers: [tf.layers.dense({
            units: 6,
            inputShape: [4],
            kernelRegularizer: tf.regularizers.l1l2({l1:0,l2:0.005}),
            biasRegularizer: 'l1l2',
            activation: 'relu'
        }),
        tf.layers.dense({
            units: 2,
            kernelRegularizer: 'l1l2',
            biasRegularizer: 'l1l2',
            activation: 'softmax'
        })
    ]
});
/*
model.weights.forEach(w => {
  const newVals = tf.zeros(w.shape);
  // w.val is an instance of tf.Variable
  w.val.assign(newVals);
});
*/
model.compile({
    optimizer: tf.train.adam(0.05),
    loss: 'meanSquaredError'
});



var cloneExpression = function(obj) {
    var copy;
    if (null == obj || "object" != typeof obj) return obj;
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = cloneExpression(obj[i]);
        }
        return copy;
    }

    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                if (['oper', 'impl', 'args', 'ctype', 'stack', 'name', 'arglist', 'value', 'real', 'imag', 'key', 'obj', 'body'].indexOf(attr) >= 0)
                    copy[attr] = cloneExpression(obj[attr]);
            }
        }
        if (obj['modifs']) copy['modifs'] = obj['modifs']; //modifs cannot be handeled in recursion properly
        return copy;
    }
}

var real = function(r) {
    return {
        "ctype": "number",
        "value": {
            'real': r,
            'imag': 0
        }
    };
};

var list = function(l) {
    return {
        'ctype': 'list',
        'value': l
    };
};


var wrap = function(v) {
    if (typeof v === "number") {
        return real(v);
    }
    if (typeof v === "object" && v.length !== undefined) {
        var li = [];
        for (var i = 0; i < v.length; i++) {
            li[i] = wrap(v[i]);
        }
        return list(li);
    }
    if (typeof v === "string") {
        return {
            ctype: "string",
            value: v
        };
    }
    if (typeof v === "boolean") {
        return {
            ctype: "boolean",
            value: v
        };
    }
    return nada;
};

var recreplace = function(ex, rmap) {
    if (ex.ctype === "variable" && rmap[ex.name]) {
        return rmap[ex.name];
    } else {
        if (ex.args)
            ex.args = ex.args.map(e => recreplace(e, rmap));
        return ex;
    }
};

// Register a plugin called "simple-tf-network-plugin", using plugin API version 1
CindyJS.registerPlugin(1, "simple-tf-network-plugin", function(api) {

    // Define a CindyScript function called "train"
    // that takes two arguments
    api.defineFunction("train", 3, function(args, modifs) {
        var callback = cloneExpression(args[2]);
        // Evaluate the argument expression
        // (as opposed to inspecting the unevaluated formula)
        var xs = api.evaluate(args[0]);
        var ys = api.evaluate(args[1]);
        if (xs.ctype !== "list" || ys.ctype !== "list" || xs.value.length != ys.value.length) {
          console.log("aborting train because of inconsistent arguments");
            return api.nada;
        }

        xs = xs.value.map(li => li.value.map(x => x.value.real));
        ys = ys.value.map(li => li.value.map(x => x.value.real));

        //console.log(ys);
        /*for (let i = 0; i < 5; i++) {
            xs = xs.concat(xs);
            ys = ys.concat(ys);
        }*/
        //(tf.tensor2d(ys, [ys.length, 2])).print();

        model.fit(
            tf.tensor2d(xs, [xs.length, 4]),
            tf.tensor2d(ys, [ys.length, 2]), {
                //batchSize: 32,
                shuffle: true,
                epochs: 1,
            }).then(() => api.evaluate(callback));

        return api.nada;
    });

    api.defineFunction("predict", 2, function(args, modifs) {
        var callback = cloneExpression(args[1]);
        var xs = api.evaluate(args[0]);
        xs = xs.value.map(li => li.value.map(x => x.value.real));
        model.predict(tf.tensor2d(xs, [xs.length, 4])).array().then(
            function(data) {
                let cdydata = wrap(data);
                api.evaluate(recreplace(callback, {
                    '#': cdydata
                }));
            }
        );
    });

    api.defineFunction("getweights", 1, function(args, modifs) {
        var callback = cloneExpression(args[0]);
        Promise.all([0, 1, 2, 3].map(k => model.getWeights()[k].array())).then(
            function(data) {
                let cdydata = wrap(data);
                api.evaluate(recreplace(callback, {
                    '#': cdydata
                }));
            });
    });

    api.defineFunction("resetweights", 0, function(args, modifs) {
      model.weights.forEach(w => {
        const newVals = tf.randomNormal(w.shape);
        w.val.assign(newVals);
      });
    });
});
