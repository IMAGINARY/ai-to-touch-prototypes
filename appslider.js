/*jshint esversion: 6 */

let collection = window.location.search.substring(1); // would be sumory for level.html?sumory#2
if (!collection) {
  window.location.search = collection = "sumory";
}

let urls = (collection == "sumory") ? [
  "sumory.html?mode=image&imgsrc=images/restaurants.svg&draws=7&values=stars&maxstars=5&buttons=hidden",
  "sumory.html?mode=image&imgsrc=images/restaurants.svg&draws=7&values=stars&maxstars=random&buttons=visible",
  "sumory.html?mode=grid&Nw=7&Nh=3&draws=10&buttons=hidden",
  "sumory.html?mode=grid&Nw=7&Nh=3&draws=10&buttons=visible"
] : (collection == "gradient") ? [
  "gradient1d.html?water=true&autopilot=false",
  "gradient1d.html?autopilot=true",
  "gradient2d.html?autopilot=true",
  "classifywithgradient.html"
] : ["default.html"];


var active = window.location.hash.substring(1) | 0; // would be 2 for level.html?sumory#2
var iframes;

let cycleiframes = function(forward) {
  let idx = (k => forward ? k : 2 - k);
  let tmp = iframes[idx(0)];
  for (let i = 0; i < 2; i++)
    iframes[idx(i)] = iframes[idx(i + 1)];
  iframes[idx(2)] = tmp;
};


let updateurls = function(prev, cur, next) {
  window.location.hash = active;
  if (active - 1 >= 0 && prev)
    iframes[0].src = urls[active - 1];
  if (cur)
    iframes[1].src = urls[active];
  if (active + 1 < urls.length && next)
    iframes[2].src = urls[active + 1];
};

let updatebuttons = function() {
  document.getElementById("previous-button").className = active > 0 ? "active-button" : "inactive-button";
  document.getElementById("next-button").className = (active < urls.length - 1) ? "active-button" : "inactive-button";
};

let next = function() {
  if (active < urls.length - 1) {
    cycleiframes(true);
    iframes[0].className = "center-to-left";
    iframes[1].className = "right-to-center";
    iframes[2].className = "right";
    active++;
    updateurls(false, false, true);
    updatebuttons();
  }

};

let previous = function() {
  if (active > 0) {
    cycleiframes(false);
    iframes[0].className = "left";
    iframes[1].className = "left-to-center";
    iframes[2].className = "center-to-right";
    active--;
    updateurls(true, false, false);
    updatebuttons();
  }
};


window.onload = function() {
  iframes = [0, 1, 2].map(k => document.getElementById("iframe" + k));
  updateurls(true, true, true);
  updatebuttons();
};
