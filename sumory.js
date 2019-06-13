N = 3;
M = 7;


cards = [];

window.onload = function(e){
  let cardcontainer = document.getElementById("cardcontainer");
  cardcontainer.style.maxWidth = (60*M/N)+"vh";
  for(let i=0; i<N; i++) for(let j=0; j<M; j++) {
    id = i*N+j;
    cards[id] = document.createElement("div");
    cards[id].style.width = 85/M + "%";
    cards[id].style.margin = 5/M + "%";
    cards[id].className = (i+j)%2 ? "light" : "dark";
    cards[id].value = Math.floor(Math.random()*100)-50;//TODO

    cards[id].text = document.createElement("div");
    cards[id].text.innerHTML = "";
    cards[id].text.className = "value";
    cards[id].appendChild(cards[id].text);


    cards[id].onclick = function(e) {
      if(!this.open) {
        this.text.innerHTML = this.value;
        this.open = true;
      }


      let score = document.createElement("div");
      score.innerHTML = this.value;
      score.className = "score";
      this.appendChild(score);

      //this.innerHTML = Math.random();

    }
    cardcontainer.appendChild(cards[id]);
  }
};
