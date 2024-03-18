class Backend {
  Snake = class {
    constructor(color = "black", nick = "empty") {
      this.direction = Math.floor(Math.random() *  4);
      this.color = color;
      this.nick = nick;
      let a = backend.freePos();
      this.body = [a, a, a];
      backend.snakes.push(this);
    }
  
    move = () => {
      let next = { x: this.body[this.body.length - 1].x, y: this.body[this.body.length - 1].y };
      switch(this.direction) {
        case 0:
          next.y -= 1;
          break;
        case 1:
          next.x -= 1;
          break;
        case 2:
          next.y += 1;
          break;  
        case 3:
          next.x += 1;
          break;
      }
      if(next.x < 0 || next.y < 0 || next.x >= mapSize || next.y >= mapSize) {
        backend.snakes.shift(this);
        changeScene("menu");
      }
      this.body.push(next);
      for(let i = 0; i < backend.apples.length; i++) {
        if(next.x == backend.apples[i].x && next.y == backend.apples[i].y) {
          backend.apples.shift(i);
          return;
        }
      }
      this.body.shift();
    }
  
    changeDirection = (a) => {
      switch(a) {
        case 0:
          if(this.body[this.body.length - 2].y != this.body[this.body.length - 1].y - 1) {
            this.direction = a;
          }
          break;
        case 1:
          if(this.body[this.body.length - 2].x != this.body[this.body.length - 1].x - 1) {
            this.direction = a;
          }
          break;
        case 2:
          if(this.body[this.body.length - 2].y != this.body[this.body.length - 1].y + 1) {
            this.direction = a;
          }
          break;
        case 3:
          if(this.body[this.body.length - 2].x != this.body[this.body.length - 1].x + 1) {
            this.direction = a;
          }
          break;
      }
    }
  }


  snakes = [];
  apples = [];
  constructor() {
    setInterval(this.update, 100);
  }

  newSnake = (color, nick) => {
    new this.Snake(color, nick);
  }

  update = () => {
    this.snakes.forEach((snake) => {
      snake.move();
    });
  
    if(this.chance(0.06)) {
      this.generateApple();
    }
  }

  generateApple = () => {
    this.apples.push(backend.freePos());
  }

  chance = (a) => {
    if(Math.random() < a) {
      return true;
    }
    return false;
  }

  getSnakeByNick = (nick) => {
    for(let i = 0; i < this.snakes.length; i++) {
      if(this.snakes[i].nick === nick) {
        return this.snakes[i];
      }
    }
    return null;
  }

  changeDirection = (nick, direction) => {
    let snake = this.getSnakeByNick(nick);
    if(snake) {
      snake.changeDirection(direction);
    }
  }

  freePos = () => {
    let pos = { x: Math.floor(Math.random() *  Math.floor(mapSize)), y: Math.floor(Math.random() *  Math.floor(mapSize)) };
    
    let b = true;
    while(b) {
      b = false;
      backend.snakes.forEach((snake) => {
        snake.body.forEach((snakebody) => {
          if(pos.x == snakebody.x && pos.y == snakebody.y) {
            pos = { x: Math.floor(Math.random() *  Math.floor(mapSize)), y: Math.floor(Math.random() *  Math.floor(mapSize)) };
            b = true;
          }
        });
      });
      this.apples.forEach((apple) => {
        if(pos.x == apple.x && pos.y == apple.y) {
          pos = { x: Math.floor(Math.random() *  Math.floor(mapSize)), y: Math.floor(Math.random() *  Math.floor(mapSize)) };
          b = true;
        }
      });
    }
  
    return pos;
  }

  isColorFree = (color) => {
    this.snakes.forEach((snake) => {
      if(snake.color == color) {
        return true;
      }
    });

    return true;
  }
}
let backend = new Backend();







const canvas = document.createElement('canvas');
canvas.width = 1920;
canvas.height = 1080;

const ctx = canvas.getContext('2d');
ctx.fillStyle = "black";
ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

const pixelSize = 40;
const mapSize = 50;

let renderLoop = setInterval(() => { }, 1000);
stopListeners();

let color = "red", nick = "Your nick";

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
  stopListeners();
  let body = document.body;
  while(body.firstChild) {
    body.removeChild(body.firstChild);
  }
}

function stopListeners() {
  clearInterval(renderLoop);
}

function addCanvas() {
  clear();
  document.body.appendChild(canvas);
}

function draw() {
  drawBox(0, 0, window.innerWidth, window.innerHeight, "#008");
  let array = Array.from({ length: mapSize }, () => Array(mapSize).fill("black"));

  backend.snakes.forEach((snake) => {
    snake.body.forEach((bodyElement) => {
      array[bodyElement.x][bodyElement.y] = snake.color;
    });
  });
  
  backend.apples.forEach((apple) => {
    array[apple.x][apple.y] = "yellow";
  })

  let xa = Math.round(-backend.snakes[0].body[backend.snakes[0].body.length - 1].x * pixelSize + window.innerWidth / 2), ya = Math.round(-backend.snakes[0].body[backend.snakes[0].body.length - 1].y * pixelSize + window.innerHeight / 2);

  let w = window.innerWidth, h = window.innerHeight;
  for(let i = 0; i < array.length; i++) {
    for(let j = 0; j < array[i].length; j++) {
      let x = i * pixelSize + xa, y = j * pixelSize + ya;
      if(0 < x < h && 0 < y < w) {
        drawBox(x, y, pixelSize, pixelSize, array[i][j]);
      }
    }
  }

  backend.snakes.forEach((snake) => {
    renderText(snake.nick, xa + (snake.body[snake.body.length - 1].x - 0.5) * pixelSize, ya + (snake.body[snake.body.length - 1].y - 0.5) * pixelSize);
  });
}

function render() {
  drawBox(0, 0, window.innerWidth, window.innerHeight, "black");

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
  if(backend.getSnakeByNick(nick)) {
    alert("Color is not free");
    return;
  }
  if(!backend.isColorFree(color)) {
    alert("Color is not free");
    return;
  }
  startNewGame()
}

function startNewGame() {
  nick = document.getElementById("nick").value;
  color = document.getElementById("color").value;

  changeScene("game");
  backend.newSnake(color, nick);
  let maxfps = 60;
  renderLoop = setInterval(render, 1000 / maxfps);

  document.addEventListener('keydown', (event) => {
    if(inGame) {
      let a = event.key;
      if(a == "ArrowUp" || a == "w" || a == "W") {
        backend.changeDirection(nick, 0);
      } else if(a == "ArrowLeft" || a == "a" || a == "A") {
        backend.changeDirection(nick, 1);
      } else if(a == "ArrowDown" || a == "s" || a == "S") {
        backend.changeDirection(nick, 2);
      } else if(a == "ArrowRight" || a == "d" || a == "D") {
        backend.changeDirection(nick, 3);
      }
    }
  });
}
