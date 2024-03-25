const address = "wss://crispy-winner-4j759jj4v6gp3jg65-8888.app.github.dev/";
let socket = null;

const canvas = document.createElement('canvas');
canvas.width = 1920;
canvas.height = 1080;

const ctx = canvas.getContext('2d');
ctx.fillStyle = "black";
ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

const pixelSize = 40;
let connected = false;

let nick = "", color = "";
let inGame = false;
let maxfps = 60;

addMenu();


function connectWebSocket() {
  addMenu();
  socket = new WebSocket(address);

  socket.onopen = (event) => {
    console.log("WebSocket connection opened");
    connected = true;
    addMenu();
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch(data.type) {
      case "snakeSpowned":
        addGame();
        break;
      case "board":
        if(data.head == null) {
          addMenu();
          return;
        }
        let board = data.board;
        let xa = Math.round(-data.head.x * pixelSize + window.innerWidth / 2), ya = Math.round(-data.head.y * pixelSize + window.innerHeight / 2);
  
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
  
        for(let snake of data.snakes) {
          let x = xa + (snake.body[snake.body.length - 1].x - 0.5) * pixelSize, y = ya + (snake.body[snake.body.length - 1].y - 0.5) * pixelSize;
          if(0 < x < h && 0 < y < w) {
            renderText(snake.nick, x, y);
          }
        }
        
        let a = 25;
        let y = 10 + a;
        renderText("Active players: " + data.snakesCount, 10, y, a);
  
        for(let top of data.topTen) {
          renderText(top.nick, w - 340, y, a, top.color);
          renderText(top.score, w - 60, y, a, top.color);
          y += a;
        }
        break;
    }
  };

  socket.onerror = (error) => {
    console.error("Error with WebSocket: ", error);
    connected = false;
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
    connected = false;
  };
}

// Rozpocznij połączenie z WebSocket
setInterval(() => {
  if(!connected) {
    connectWebSocket();
  }
}, 1000);


// Render loop
setInterval(() => {
  if(inGame) {
    render();
  }
}, 1000 / maxfps);



// Inicjacja pełnego ekranu w odpowiedzi na kliknięcie
document.addEventListener("click", () => {
  if(document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else {
    console.error("pierdole");
  }
});

document.addEventListener('keydown', (event) => {
  if(inGame) {
    let a = event.key;
    if(a == "ArrowUp" || a == "w" || a == "W") {
      changeDirection(0);
    } else if(a == "ArrowLeft" || a == "a" || a == "A") {
      changeDirection(1);
    } else if(a == "ArrowDown" || a == "s" || a == "S") {
      changeDirection(2);
    } else if(a == "ArrowRight" || a == "d" || a == "D") {
      changeDirection(3);
    }
  }
});



function newSnake() {
  socket.send(JSON.stringify({
    type: "newSnake",
    nick: nick,
    color: color
  }));
}


function changeDirection(direction) {
  socket.send(JSON.stringify({
    type: "direction",
    nick: nick,
    direction: direction
  }));
}


function clear() {
  let body = document.body;
  while(body.firstChild) {
    body.removeChild(body.firstChild);
  }
}

function addGame() {
  inGame = true;
  clear();
  document.body.appendChild(canvas);
}

function render() {
  socket.send(JSON.stringify({
    type: "board",
    nick: nick
  }));
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

async function addMenu() {
  inGame = false;
  clear();

  let message = document.getElementById("message");
  if(!message) {
    message = document.createElement('div');
    message.id = "message";
  }

  if(connected) {
    message.textContent = "Connected to serwer";
    message.style.color = "white";
  } else {
    message.textContent = "Connection error";
    message.style.color = "red";
  }
  document.body.appendChild(message);

  let form = document.getElementById("menuForm");
  if(!form) {
    form = document.createElement('form');
    form.id = "menuForm";

    let input = document.createElement('input');
    input.type = "text";
    input.id = "nick";
    input.value = nick;
    input.minlength = 3;
    input.placeholder = "Enter your nick";
    form.appendChild(input);

    input = document.createElement('input');
    input.type = "text";
    input.id = "color";
    input.value = color;
    input.minlength = 3;
    input.placeholder = "Enter your color";
    form.appendChild(input);
    
    let button = document.createElement('div');
    button.textContent = "Start game";
    button.id = "menuButton";
    button.type = "submit";
    button.addEventListener("click", () => {
      canStartGame();
    })
    form.appendChild(button);

    document.body.appendChild(form);
  }
}

function canStartGame() {
  if(connected) {
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
    newSnake();
  }
}
