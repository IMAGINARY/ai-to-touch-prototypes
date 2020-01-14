import {
  WeatherLevel,
  FahrenheitLevel,
  SumLevel,
  MaxLevel,
  XorLevel,
  AvgLevel
} from './levels.js';



class LevelController {

  constructor() {
    this.createEvents();
    this.levels = [
      new FahrenheitLevel(),
      new SumLevel(),
      new AvgLevel(),
      new MaxLevel(),
      new WeatherLevel(),
      new XorLevel()
    ];
    this.NUMBER_OF_LEVELS = this.levels.length;
  }

  createEvents() {
    window.addEventListener('DOMContentLoaded', (event) => {
      document.querySelector("#backbutton").onclick = (() => this.goBack());
      document.querySelector("#nextbutton").onclick = (() => this.goNext());
      this.showLevelByURL();
    });


    window.onhashchange = (event) => {
      this.showLevelByURL();
    };

    window.addEventListener('keydown', (event) => {
      const key = event.key;
      switch (event.key) {
        case "ArrowLeft":
          this.goBack();
          break;
        case "ArrowRight":
          this.goNext();
          break;
      }
    });
  }


  goNext() {
    this.setLevel((this.getCurrentLevel() + 1) % this.NUMBER_OF_LEVELS);
  }

  goBack() {
    this.setLevel((this.getCurrentLevel() - 1 + this.NUMBER_OF_LEVELS) % this.NUMBER_OF_LEVELS);
  }

  getCurrentLevel() {
    let hash = window.location.hash.substring(1);
    if (hash === "") {
      hash = 1;
    } else {
      hash = (hash | 0);
    }
    return hash - 1;
  }

  setLevel(id) {
    window.location.hash = id + 1;
  }

  showLevelByURL() {
    this.showLevel(this.getCurrentLevel());
  }

  showLevel(lid) {
    for (let k in this.levels)
      if (k != lid) {
        this.levels[k].hide();
      }
    this.levels[lid].show();
  }
}

new LevelController();