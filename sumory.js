/*jshint esversion: 6 */

let N;

//if field is a grid
let Nh = 3; //TODO URL-parameter
let Nw = 7;


let draws = 7;
let score = 0;
let cdraws = 0;

let cards = [];

let mode = "image"; // "grid" or "image"//TODO URL-parameter
let imagename = "images/restaurants.svg"; //TODO URL-parameter

addinteraction = function(card) {
    card.text = document.createElement("div");
    card.text.innerHTML = "";
    card.text.className = "value";
    card.appendChild(card.text);

    card.open = function() {
        this.text.innerHTML = withsign(this.value);
    };

    card.close = function() {
        this.text.innerHTML = "";
    };

    card.onclick = function(e) {
        if (cdraws < draws) {
            this.open();
            let miniscore = document.createElement("div");
            miniscore.innerHTML = withsign(this.value);
            miniscore.className = "score";
            this.appendChild(miniscore);
            score += this.value;
            cdraws++;
            show_parameters();
            if (cdraws == draws)
                show_message(`final score: ${score}`);
        }
    };
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
                cards[id].className = (i + j) % 2 ? "light" : "dark";
                cardcontainer.appendChild(cards[id]);
                addinteraction(cards[id]);
            }
        }
        document.getElementById("content").appendChild(cardcontainer);
        N = Nh * Nw;
        assignvalues();
    } else if (mode == "image") {
        let svgembed = document.createElement("embed");
        svgembed.src = imagename;
        svgembed.type = "image/svg+xml";
        document.getElementById("content").appendChild(svgembed);
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

var withsign = (v => ((v > 0) ? "+" : "").concat(v));

var assignvalues = function() {
    hide_message();
    let random_range = Math.floor((Math.random() * 99)); // random range number (maximum of random number)
    for (let id = 0; id < N; id++) {
        cards[id].value = Math.floor((Math.random() * random_range * 2)) - Math.floor((Math.random() * random_range * 2));
        cards[id].close();
    }
    cdraws = 0;
    score = 0;
    show_parameters();
}

//Fisher-Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function shufflecards() {
    for (let id = 0; id < N; id++)
        cards[id].close();

    let nvals = shuffle(cards.map(c => c.value));
    for (let id = 0; id < N; id++)
        cards[id].value = nvals[id];
    cdraws = 0;
    score = 0;
    show_parameters();
}

var show_parameters = function() {
    document.getElementById("contadortext").innerHTML = `Spielz&uuml;ge ${draws-cdraws}`;
    document.getElementById("scoretext").innerHTML = `Summe ${score}`;
}


var showall = function() {
    for (let id = 0; id < N; id++)
        cards[id].open();
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
    var j = 0;
    var k = 0;
    var final_sum = 0;
    var max_nr = -1000000;
    var max_index = -1;

    for (k = 0; k < start_exploit; k++) {
        final_sum += seq[k];
        if (seq[k] > max_nr) {
            max_nr = seq[k];
            max_index = k
        }
    }

    for (k = start_exploit; k < draws; k++) {
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
