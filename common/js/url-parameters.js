/*jshint esversion: 6 */

CindyJS.registerPlugin(1, "url-parameters", function(api) {
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

    var unwrap = function(csthing) {
        if (csthing.ctype === "list") {
            return csthing.value.map(unwrap);
        }
        if (csthing.ctype === "number") {
            return csthing.value.real;
        }
        if (csthing.ctype === "boolean") {
            return csthing.value;
        }
        if (csthing.ctype === "string") {
            return csthing.value;
        }
    };

    var geturlvars = function() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
            //vars[key] = wrap(isNaN(value) ? value : (value | 0));
            try {
              vars[key] = wrap(JSON.parse(value));
            } catch(error) {
              vars[key] = wrap(value);
            }
        });
        return vars;
    };
    let vars;

    // Define a CindyScript function called "geturlparameter"
    // that takes two arguments (parameter string and default value)
    api.defineFunction("geturlparameter", 2, function(args, modifs) {
        let value = api.evaluate(args[1]); //default value
        let param = unwrap(api.evaluate(args[0]));
        if(!vars)
          vars = geturlvars();
        if (vars[param])
          value = vars[param];
        return value;
    });
});
