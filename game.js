const adress = "https://psychic-doodle-jj5vwjj67qqrfq9x6-8888.app.github.dev";

const canvas = document.createElement('canvas');
canvas.width = 1920;
canvas.height = 1080;

const ctx = canvas.getContext('2d');
ctx.fillStyle = "black";
ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

const pixelSize = 40;

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



function newSnake(nick, color) {
  fetch(adress + "/newSnake", {
    method: "POST",
    body: JSON.stringify({
      nick: nick,
      color: color
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
}


function changeDirection(nick, direction) {
  fetch(adress + "/direction", {
    method: "POST",
    body: JSON.stringify({
      nick: nick,
      direction: direction
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
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

function draw() {
  fetch(adress + "/board", {
    method: "POST",
    body: JSON.stringify({
      nick: nick
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => {
    if(!response.ok) {
      throw new Error(`Błąd zapytania: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(rjson => {
    if (rjson.head == null) {
      addMenu();
      return;
    }

    let board = rjson.board;
    let xa = Math.round(-rjson.head.x * pixelSize + window.innerWidth / 2), ya = Math.round(-rjson.head.y * pixelSize + window.innerHeight / 2);

    let w = window.innerWidth, h = window.innerHeight;
    drawBox(0, 0, w, h, "#008");
    for(let i = 0; i < board.length; i++) {
      for(let j = 0; j < board[i].length; j++) {
        let x = i * pixelSize + xa, y = j * pixelSize + ya;
        if(0 < x < h && 0 < y < w) {
          drawBox(x, y, pixelSize, pixelSize, board[i][j]);
        }
      }
    }

    for(let snake of rjson.snakes) {
      renderText(snake.nick, xa + (snake.body[snake.body.length - 1].x - 0.5) * pixelSize, ya + (snake.body[snake.body.length - 1].y - 0.5) * pixelSize);
    }
  })
  .catch(error => {
    console.error("Błąd podczas wykonywania żądania:", error);
  });
}

function render() {
  draw();
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

  if(!serwerWorks()) {
    let message = document.createElement('p');
    message.textContent = "Start game";
    div.appendChild(message);
  }

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
  nick = document.getElementById("nick").value;
  color = document.getElementById("color").value;
  /*if(backend.getSnakeByNick(nick)) {
    alert("Color is not free");
    return;
  }
  if(!backend.isColorFree(color)) {
    alert("Color is not free");
    return;
  }*/
  startNewGame();
}

function startNewGame() {
  changeScene("game");
  newSnake(nick, color);
  let maxfps = 60;
  renderLoop = setInterval(render, 1000 / maxfps);

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

function serwerWorks() {
  let isTrue = false;
  fetch(adress)
  .then(response => {
    if(response.ok) {
      isTrue = true;
    }
  })
  
  return isTrue;
}
