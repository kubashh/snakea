const adress = "https://psychic-doodle-jj5vwjj67qqrfq9x6-8888.app.github.dev";

const canvas = document.createElement('canvas');
canvas.width = 1920;
canvas.height = 1080;

const ctx = canvas.getContext('2d');
ctx.fillStyle = "black";
ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

const pixelSize = 40;
const mapSize = 50;

let renderLoop = setInterval(() => { }, 1000);
clearInterval(renderLoop);

let nick = "Your nick", color = "red";
let inGame = false;

changeScene("menu");

// Inicjacja pełnego ekranu w odpowiedzi na kliknięcie
document.addEventListener("click", () => {
  if(document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else {
    console.error("pierdole");
  }
});




async function newSnake(nick, color) {
  try {
    const response = await fetch(adress + "/newSnake", {
      method: "POST",
      body: JSON.stringify({
        nick: nick,
        color: color
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if(!response.ok) {
      throw new Error(`Błąd zapytania: ${response.status} ${response.statusText}`);
    }
  } catch(error) {
    console.error("Błąd podczas wykonywania żądania:", error);
  }
}


async function changeDirection(nick, direction) {
  try {
    const response = await fetch(adress + "/changeDirection", {
      method: "POST",
      body: JSON.stringify({
        nick: nick,
        direction: direction
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if(!response.ok) {
      throw new Error(`Błąd zapytania: ${response.status} ${response.statusText}`);
    }
  } catch(error) {
    console.error("Błąd podczas wykonywania żądania:", error);
  }
}


async function getBoard() {
  try {
    const response = await fetch(adress + "/board");

    if(!response.ok) {
      throw new Error(`Błąd zapytania: ${response.status} ${response.statusText}`);
    }

    console.log(response);
    return response;
  } catch(error) {
    console.error("Błąd podczas wykonywania żądania:", error);
  }
}




function changeScene(place) {
  clear();

  switch(place) {
    case "menu":
      inGame = false;
      addMenu();
      break;
    case "game":
      inGame = true;
      addCanvas();
      break;
  }
}

function clear() {
  clearInterval(renderLoop);
  let body = document.body;
  while(body.firstChild) {
    body.removeChild(body.firstChild);
  }
}

function addCanvas() {
  clear();
  document.body.appendChild(canvas);
}

async function draw() {
  drawBox(0, 0, window.innerWidth, window.innerHeight, "#008");
  try {
    const response = await fetch(adress + "/board");

    if(!response.ok) {
      throw new Error(`Błąd zapytania: ${response.status} ${response.statusText}`);
    }

    console.log(response);

    let array = response.board;
    let xa = 0, ya = 0; //let xa = Math.round(-backend.snakes[0].body[backend.snakes[0].body.length - 1].x * pixelSize + window.innerWidth / 2), ya = Math.round(-backend.snakes[0].body[backend.snakes[0].body.length - 1].y * pixelSize + window.innerHeight / 2);

    let w = window.innerWidth, h = window.innerHeight;
    for(let i = 0; i < array.length; i++) {
      for(let j = 0; j < array[i].length; j++) {
        let x = i * pixelSize + xa, y = j * pixelSize + ya;
        if(0 < x < h && 0 < y < w) {
          drawBox(x, y, pixelSize, pixelSize, array[i][j]);
        }
      }
    }

    /*backend.snakes.forEach((snake) => {
      renderText(snake.nick, xa + (snake.body[snake.body.length - 1].x - 0.5) * pixelSize, ya + (snake.body[snake.body.length - 1].y - 0.5) * pixelSize);
    });*/
  } catch(error) {
    console.error("Błąd podczas wykonywania żądania:", error);
  }
}

function render() {
  drawBox(0, 0, window.innerWidth, window.innerHeight, "black");

  //draw();
}

function drawBox(x, y, w, h, color = "white")  {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}


function renderText(s, x, y, fontSize = 30, color = "white") {
  ctx.font = fontSize + "px Arial";
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
}

function addMenu() {
  clear();
  let body = document.body;
  let div = document.createElement('form');
  div.id = "menuForm";

  let input = document.createElement('input');
  input.type = "text";
  input.id = "nick";
  input.minlength = 3;
  input.placeholder = "Enter your nick";
  div.appendChild(input);

  input = document.createElement('input');
  input.type = "text";
  input.id = "color";
  input.minlength = 3;
  input.placeholder = "Enter your color";
  div.appendChild(input);
  
  let button = document.createElement('div');
  button.textContent = "Start game";
  button.id = "menuButton";
  button.addEventListener("click", canStartGame);
  div.appendChild(button);

  body.appendChild(div);
}

function canStartGame() {
  let nick = document.getElementById("nick").value;
  let color = document.getElementById("color").value;
  /*if(backend.getSnakeByNick(nick)) {
    alert("Color is not free");
    return;
  }
  if(!backend.isColorFree(color)) {
    alert("Color is not free");
    return;
  }*/
  startNewGame(nick, color);
}

function startNewGame(nick, color) {
  changeScene("game");
  newSnake(nick, color);
  let maxfps = 5;
  renderLoop = setInterval(render, 1000 / maxfps);
  draw();

  document.addEventListener('keydown', (event) => {
    if(inGame) {
      let a = event.key;
      if(a == "ArrowUp" || a == "w" || a == "W") {
        changeDirection(nick, 0);
      } else if(a == "ArrowLeft" || a == "a" || a == "A") {
        changeDirection(nick, 1);
      } else if(a == "ArrowDown" || a == "s" || a == "S") {
        changeDirection(nick, 2);
      } else if(a == "ArrowRight" || a == "d" || a == "D") {
        changeDirection(nick, 3);
      }
    }
  });
}
