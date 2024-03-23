const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    let data = JSON.parse(message);
    switch(data.type) {
      case "newSnake":
        if(isGoodNewSnakeData(data.nick, data.color)) {
          new Snake(data.nick, data.color);
          ws.send(JSON.stringify({
            type: "snakeSpowned"
          }));
        }
        break;
      
      case "board":
        let snake = getSnakeByNick(data.nick);
        let head = null;
        if(snake) {
          head = snake.head();
        }
        ws.send(JSON.stringify({
          type: "board",
          board: board,
          mapSize: mapSize,
          head: head,
          snakes: snakes,
          snakesCount: snakes.length,
          topTen: topTen
        }));
        break;

      case "direction":
        if(data.nick && data.direction !== undefined) {
          changeDirection(data.nick, data.direction);
        }
        break;
    }

    console.log(data);
  });
});




/*const express = require("express");
const app = express();

app.use(express.json());

const port = 8888;

// Dodaj nagłówek CORS na serwerze
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', "https://kubashh.github.io"); // zezwól na dostęp z dowolnej domeny
  res.header('Access-Control-Allow-Methods', 'GET, POST'); //, PUT, DELETE
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get("/", (req, res) => {
  res.send(JSON.stringify({ data: "serwer works" }));
});


app.post("/", (req, res) => {
  res.status(200).end();
});

app.post("/newSnake", (req, res) => {
  //console.log(req.body);

  let data = req.body;
  if(isGoodNewSnakeData(data.nick, data.color)) {
    new Snake(data.nick, data.color);
  }

  res.send("good");
  res.status(200).end();
});

app.post("/board", (req, res) => {
  let snake = getSnakeByNick(req.body.nick);
  let head = null;
  if(snake) {
    head = snake.head();
  }
  res.send(JSON.stringify({
    board: board,
    mapSize: mapSize,
    head: head,
    snakes: snakes,
    snakesCount: snakes.length,
    topTen: topTen
  }));
  res.status(200).end();
});

app.post("/direction", (req, res) => {
  let data = req.body;
  if(data.nick && data.direction !== undefined) {
    changeDirection(data.nick, data.direction);
  }

  res.send("good");
  res.status(200).end();
});


app.listen(port, () => {
  console.log(`Aplikacja wystartowała na porcie ${port}`);
});*/




const mapSize = 80;
let board = [ [ "black" ] ];
let snakes = [];
let apples = [];
let topTen = [ "", "", "", "", "", "", "", "", "", "" ];



class Snake {
  constructor(nick = "empty", color = "black") {
    this.direction = Math.floor(Math.random() *  4);
    this.nick = nick;
    this.color = color;
    let a = freePos(6);
    this.body = [a, a, a];
    snakes.push(this);
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
      deleteSnake(this);
      return;
    }
    for(let snake of snakes) {
      if(snake.nick != this.nick) {
        for(let bodyElement of snake.body) {
          if(bodyElement.x == next.x && bodyElement.y == next.y) {
            deleteSnake(this);
            return;
          }
        }
      }
    }
    this.body.push(next);
    for(let apple of apples) {
      if(next.x == apple.x && next.y == apple.y) {
        apples.splice(apples.indexOf(apple), 1);
        return;
      }
    }
    this.body.shift();
  }

  head = () => {
    return this.body[this.body.length - 1];
  }

  changeDirection = (a) => {
    switch(a) {
      case 0:
        if(this.body[this.body.length - 2].y != this.head().y - 1) {
          this.direction = a;
        }
        break;
      case 1:
        if(this.body[this.body.length - 2].x != this.head().x - 1) {
          this.direction = a;
        }
        break;
      case 2:
        if(this.body[this.body.length - 2].y != this.head().y + 1) {
          this.direction = a;
        }
        break;
      case 3:
        if(this.body[this.body.length - 2].x != this.head().x + 1) {
          this.direction = a;
        }
        break;
    }
  }
}



function deleteSnake(snake) {
  for(let bodyElement of snake.body) {
    if(bodyElement != snake.head() && chance(0.5)) {
      apples.push(bodyElement);
    }
  }
  snakes.splice(snakes.indexOf(snake), 1);
}

function generateApple() {
  if(apples.length < mapSize / 6) {
    apples.push(freePos(3));
  }
}

function chance(a) {
  if(Math.random() < a) {
    return true;
  }
  return false;
}

function getSnakeByNick(nick) {
  for(let snake of snakes) {
    if(snake.nick === nick) {
      return snake;
    }
  }
  return null;
}

function changeDirection(nick, direction) {
  let snake = getSnakeByNick(nick);
  if(snake) {
    snake.changeDirection(direction);
  }
}

function randInt(a, b) {
  return Math.floor(a + Math.random() * Math.floor(b - a));
}

function freePos(a = 0) {
  let pos = { x: randInt(a, mapSize - a), y: randInt(a, mapSize - a) };
  
  let b = true;
  while(b) {
    b = false;
    for(let snake of snakes) {
      for(let snakebody of snake.body) {
        if(pos.x == snakebody.x && pos.y == snakebody.y) {
          pos = { x: randInt(a, mapSize - a), y: randInt(a, mapSize - a) };
          b = true;
        }
      }
    }
    for(let apple of apples) {
      if(pos.x == apple.x && pos.y == apple.y) {
        pos = { x: randInt(a, mapSize - a), y: randInt(a, mapSize - a) };
        b = true;
      }
    }
  }

  return pos;
}



function isGoodNewSnakeData(nick, color) {
  if(!isGoodNick(nick) || !isGoodColor(color)) {
    return false;
  }

  return true;
}

function isGoodNick(nick) {
  for(let snake of snakes) {
    if(snake.nick == nick) {
      return false;
    }
  }

  return true;
}

function isGoodColor(color) {
  for(let snake of snakes) {
    if(snake.color == color) {
      return false;
    }
  }

  return true;
}


function updateTopTen() {
  for(let i = 0; i < 10; i++) {
    if(snakes[i]) {
      let snake = snakes[i];
      topTen[i] = {
        nick: "#" + (i + 1) + "   " + snake.nick,
        score: snake.body.length,
        color: snake.color
      };
    } else {
      topTen[i] = {
        nick: "",
        score: "",
        color: ""
      };
    }
  }
}


//let lastTime = new Date();

function update() {
  for(let snake of snakes) {
    snake.move();
  }

  if(chance(0.06)) {
    generateApple();
  }

  // odswierzanie planszy
  board = Array.from({ length: mapSize }, () => Array(mapSize).fill("black"));

  for(let snake of snakes) {
    for(let bodyElement of snake.body) {
      board[bodyElement.x][bodyElement.y] = snake.color;
    }
  }
  
  for(let apple of apples) {
    board[apple.x][apple.y] = "yellow";
  }

  //sort
  for(let i = 0; i < snakes.length - 1; i++) {
    for(let j = i + 1; j < snakes.length; j++) {
      if(snakes[j].body.length > snakes[i].body.length) {
        let temp = snakes[i];
        snakes[i] = snakes[j];
        snakes[j] = temp;
      }
    }
  }
  
  updateTopTen();

  /*let now = new Date();
  let timer = now - lastTime;
  lastTime = now;

  console.log(timer);*/
}

setInterval(update, 100);
