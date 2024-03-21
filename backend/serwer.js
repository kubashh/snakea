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


app.get("/", (req, res) => {
  //console.log(req.body);
  res.send(JSON.stringify({ data: "odpowiedz" }));
});


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

  res.send(JSON.stringify({ data: "odpowiedz" }));
  res.status(200).end();
});

app.post("/board", (req, res) => {
  let data = req.body;
  let snake = getSnakeByNick(data.nick);
  let head = null;
  if(snake) {
    head = snake.body[snake.body.length - 1];
  }
  res.send(JSON.stringify({
    board: board,
    mapSize: mapSize,
    head: head,
    snakes: snakes
  }));
  res.status(200).end();
});

app.post("/direction", (req, res) => {
  let data = req.body;
  if(data.nick && data.direction !== undefined) {
    changeDirection(data.nick, data.direction);
  }

  res.send(JSON.stringify({ data: "odpowiedz" }));
  res.status(200).end();
});


app.listen(port, () => {
  console.log(`Aplikacja wystartowała na porcie ${port}`);
});





const mapSize = 60;
let board = Array.from({ length: mapSize }, () => Array(mapSize).fill("black"));
let snakes = [];
let apples = [];



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
      snakes.shift(this);
      return;
    }
    this.body.push(next);
    for(let apple of apples) {
      if(next.x == apple.x && next.y == apple.y) {
        apples.shift(apple);
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
