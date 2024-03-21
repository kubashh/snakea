const express = require("express");
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


app.get("/", async (req, res) => {
  //console.log(req.body);
  res.send(JSON.stringify({ data: "odpowiedz" }));
});

/*app.get("/board", async (req, res) => {
  let head = { x: 0, y: 0 };
  if(snakes[0]) {
    head = snakes[0].body[snakes[0].body.length - 1];
  }
  const answer = JSON.stringify({
    board: board,
    mapSize: mapSize,
    head: head
  });
  res.send(answer);
});*/


app.post("/", (req, res) => {
  //console.log(req.body);

  res.status(200).end();
});

app.post("/newSnake", (req, res) => {
  //console.log(req.body);

  let data = req.body;
  if(isGoodNewSnakeData(data.nick, data.color)) {
    new Snake(data.nick, data.color);
  }

  console.log("snakes: ", snakes);
  //console.log("apples: ", apples);

  res.status(200).end();
});

app.post("/board", async (req, res) => {
  let data = req.body;
  let snake = getSnakeByNick(data.nick);
  let head = { x: 0, y: 0 };
  if(snake) {
    head = snake.body[snake.body.length - 1];
  }
  res.send(JSON.stringify({
    board: board,
    mapSize: mapSize,
    head: head,
    snakes: snakes
  }));
  res.send(answer);
});

app.post("/changeDirection", (req, res) => {
  let data = req.body;
  changeDirection(data.nick, data.direction);

  res.status(200).end();
});


app.listen(port, () => {
  console.log(`Aplikacja wystartowała na porcie ${port}`);
});






const mapSize = 40;
let board = Array.from({ length: mapSize }, () => Array(mapSize).fill("black"));
let snakes = [];
let apples = [];



class Snake {
  constructor(nick = "empty", color = "black") {
    this.direction = Math.floor(Math.random() *  4);
    this.nick = nick;
    this.color = color;
    let a = freePos();
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
      snakes.shift(this);
    }
    this.body.push(next);
    for(let i = 0; i < apples.length; i++) {
      if(next.x == apples[i].x && next.y == apples[i].y) {
        apples.shift(i);
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



setInterval(update, 100);

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
}

function generateApple() {
  apples.push(freePos());
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

function freePos() {
  let pos = { x: Math.floor(Math.random() *  Math.floor(mapSize)), y: Math.floor(Math.random() *  Math.floor(mapSize)) };
  
  let b = true;
  while(b) {
    b = false;
    for(let snake of snakes) {
      for(let snakebody of snake.body) {
        if(pos.x == snakebody.x && pos.y == snakebody.y) {
          pos = { x: Math.floor(Math.random() *  Math.floor(mapSize)), y: Math.floor(Math.random() *  Math.floor(mapSize)) };
          b = true;
        }
      }
    }
    for(let apple of apples) {
      if(pos.x == apple.x && pos.y == apple.y) {
        pos = { x: Math.floor(Math.random() *  Math.floor(mapSize)), y: Math.floor(Math.random() *  Math.floor(mapSize)) };
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
