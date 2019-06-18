/*jshint esversion: 6 */
let N;

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter, defaultvalue) {
    var urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1)
        urlparameter = getUrlVars()[parameter];
    return urlparameter;
}



//if field is a grid
let Nh = getUrlParam("Nh", 3) | 0;
let Nw = getUrlParam("Nw", 7) | 0;


let draws = getUrlParam("draws", 7) | 0;
let score = 0;
let cdraws = 0;

let checkerboard = getUrlParam("checkerboard", false);
let cards = [];

let mode = getUrlParam("mode", "grid"); // "grid" or "image"
let imgsrc = getUrlParam("imgsrc", "images/restaurants.svg");

let editmode = false;

addinteraction = function(card) {
    card.text = document.createElement("div");
    card.text.innerHTML = "";
    card.text.className = "value";
    card.text.card = card;

    if (mode == "image") {
        /*
        The following looks only proper in Firefox (not even chrome)
        pos = card.getBBox();
        let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('x', pos.x);
        foreignObject.setAttribute('y', pos.y);
        foreignObject.setAttribute('height', pos.height);
        foreignObject.setAttribute('width', pos.width);
        foreignObject.style.pointerEvents = "none"; //click through foreignObject
        card.htmlel = foreignObject;
        svgdoc.getElementById("layer1").appendChild(card.htmlel);
        */

        card.htmlel = document.createElement("div");
        //use overlay instead

        card.reposition = function() {
            let box = card.getBoundingClientRect();
            card.htmlel.style.position = "absolute";
            card.htmlel.style.top = box.y + "px";
            card.htmlel.style.left = box.x + "px";
            card.htmlel.style.width = box.width + "px";
            card.htmlel.style.height = box.height + "px";
        }
        card.reposition();

        document.getElementById("svgoverlay").appendChild(card.htmlel);

    } else {
        card.htmlel = card;
    }
    card.htmlel.appendChild(card.text);


    card.open = function() {
        this.text.innerHTML = withsign(this.value);
        if (!checkerboard) this.className = "light";
    };

    card.close = function() {
        this.text.innerHTML = "";
        if (!checkerboard) this.className = "dark";
    };

    card.onclick = function(e) {
        if (cdraws < draws & !editmode) {
            this.open();
            let miniscore = document.createElement("div");
            miniscore.innerHTML = withsign(this.value);
            miniscore.className = "score";
            this.htmlel.appendChild(miniscore);
            score += this.value;
            cdraws++;
            update_parameters();
            if (cdraws == draws)
                show_message(`Endergebnis: ${score}`);
        }
    };

    card.text.onblur = function(e) {
        if (editmode) {
            this.card.value = this.innerHTML | 0; //force integer
            this.innerHTML = withsign(this.card.value);
        }
    }
};

window.onload = function(e) {
    if (mode == "grid") {
        let cardcontainer = document.createElement("div");
        cardcontainer.id = "cardcontainer";
        cardcontainer.style.maxWidth = (60 * Nw / Nh) + "vh";
        for (let i = 0; i < Nw; i++) {
            for (let j = 0; j < Nh; j++) {
                id = i * Nh + j;
                cards[id] = document.createElement("div");
                cards[id].style.width = 85 / Nw + "%";
                cards[id].style.margin = 5 / Nw + "%";
                if (checkerboard) {
                    cards[id].className = (i + j) % 2 ? "light" : "dark";
                } else {
                    cards[id].className = "dark";
                }
                cardcontainer.appendChild(cards[id]);
                addinteraction(cards[id]);
            }
        }
        document.getElementById("content").appendChild(cardcontainer);
        N = Nh * Nw;
        assignvalues();
    } else if (mode == "image") {
        let svgembed = document.createElement("embed");
        let svgoverlay = document.createElement("div");
        svgoverlay.id = "svgoverlay";
        svgembed.src = imgsrc;
        svgembed.type = "image/svg+xml";
        document.getElementById("content").appendChild(svgembed);
        document.getElementById("content").appendChild(svgoverlay);
        svgembed.onload = function() {
            svgdoc = svgembed.contentDocument || svgembed.getSVGDocument();
            paths = svgdoc.getElementsByTagName("path");
            /*for(let id =0; id<cards.length; id++) {
              addinteraction(cards[id]);
            }*/
            N = paths.length;
            for (let id = 0; id < paths.length; id++) {
                cards[id] = paths[id];
                addinteraction(cards[id]);
            }
            assignvalues();
        };
    }
};

window.onresize = function() {
    if (mode == "image") {
        for (let id = 0; id < N; id++) {
            cards[id].reposition();
        }
    }
}

var withsign = (v => ((v > 0) ? "+" : "").concat(v));

var assignvalues = function() {
    hide_message();
    let random_range = Math.floor((Math.random() * 99)); //random range number (maximum of random number)
    for (let id = 0; id < N; id++) {
        cards[id].value = Math.floor((Math.random() * random_range * 2)) - Math.floor((Math.random() * random_range * 2));
    }
    startplay();
}

//Fisher-Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startplay() {
    for (let id = 0; id < N; id++) {
        cards[id].text.contentEditable = "false";
        cards[id].text.style.pointerEvents = "none"; //click through
        cards[id].close();
    }
    editmode = false;
    cdraws = 0;
    score = 0;
    update_parameters();
}

function shufflecards() {
    let nvals = shuffle(cards.map(c => c.value));
    for (let id = 0; id < N; id++)
        cards[id].value = nvals[id];
    startplay();
}

var update_parameters = function() {
    document.getElementById("contadortext").innerHTML = `Spielz&uuml;ge ${draws-cdraws}`;
    document.getElementById("scoretext").innerHTML = `Summe ${score}`;
}


var showall = function() {
    editmode = true;
    for (let id = 0; id < N; id++) {
        cards[id].open();
        cards[id].text.contentEditable = "true";
        cards[id].text.style.pointerEvents = "auto"; //clickable
    }
}


var calculate_strategy = function() {
    var l = 0;
    var iterations = 1000000;
    var strat_nr = Array(draws + 1).fill(0);
    let seq = cards.map(c => c.value);
    for (let i = 0; i < iterations; i++) {
        seq = shuffle(seq);
        for (l = 1; l <= draws; l++) {
            strat_nr[l] += evaluate_strategy(seq, l);
        }
    }

    let msg = `Strat n = explore n and exploit (${draws}-n) <br><br>`;
    for (l = 1; l <= draws; l++)
        msg += `Avg. for Strat ${l} ${l==draws ? '(all random)' :''}: ${strat_nr[l]/iterations}<br>`;
    show_message(msg);
}


evaluate_strategy = function(seq, start_exploit) {
    let final_sum = 0;
    let max_nr;
    let max_index = -1;

    for (let k = 0; k < start_exploit; k++) {
        final_sum += seq[k];
        if (max_index == -1 || seq[k] > max_nr) {
            max_nr = seq[k];
            max_index = k
        }
    }

    for (let k = start_exploit; k < draws; k++) {
        final_sum += seq[max_index];
    }
    return final_sum;
}

show_message = function(msg) {
    document.getElementById("message").innerHTML = msg;
    document.getElementById("messagebox").className = "visible";
}

hide_message = function() {
    document.getElementById("messagebox").className = "hidden";
}
