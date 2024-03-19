const express = require("express");
const app = express();

app.use(express.json());

const port = 8888;

// Dodaj nagłówek CORS na serwerze
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', "https://kubashh.github.io"); // zezwól na dostęp z dowolnej domeny
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get("/", async (req, res) => {
  console.log(req);

  let data = JSON.parse(req.body);
  
  switch(data.funt) {
    case "getBoard":
      newSnake(data.color, data.nick);
      res.send(JSON.stringify({
        data: "board",
        board: board,
        pixelSize: pixelSize
      }));
      break;
  }

  const answer = JSON.stringify({ data: "wal się" });
  res.send(answer);
});

app.post("/", (req, res) => {
  console.log(req.body);
  let data = JSON.parse(req.body);

  switch(data.funt) {
    case "newSnake":
      newSnake(data.color, data.nick);
      break;
    
    case "changeDirection":
      changeDirection(data.nick, data.direction);
      break;
  }

  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Aplikacja wystartowała na porcie ${port}`);
});






const mapSize = 50;
let board = Array.from({ length: mapSize }, () => Array(mapSize).fill("black"));
let snakes = [];
let apples = [];



class Snake {
  constructor(color = "black", nick = "empty") {
    this.direction = Math.floor(Math.random() *  4);
    this.color = color;
    this.nick = nick;
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

function newSnake(color, nick) {
  new Snake(color, nick);
}

function update() {
  snakes.forEach((snake) => {
    snake.move();
  });

  if(chance(0.06)) {
    generateApple();
  }

  // odswierzanie planszy
  board = Array.from({ length: mapSize }, () => Array(mapSize).fill("black"));

  snakes.forEach((snake) => {
    snake.body.forEach((bodyElement) => {
      array[bodyElement.x][bodyElement.y] = snake.color;
    });
  });
  
  apples.forEach((apple) => {
    array[apple.x][apple.y] = "yellow";
  });
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
  for(let i = 0; i < this.snakes.length; i++) {
    if(this.snakes[i].nick === nick) {
      return this.snakes[i];
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
    snakes.forEach((snake) => {
      snake.body.forEach((snakebody) => {
        if(pos.x == snakebody.x && pos.y == snakebody.y) {
          pos = { x: Math.floor(Math.random() *  Math.floor(mapSize)), y: Math.floor(Math.random() *  Math.floor(mapSize)) };
          b = true;
        }
      });
    });
    apples.forEach((apple) => {
      if(pos.x == apple.x && pos.y == apple.y) {
        pos = { x: Math.floor(Math.random() *  Math.floor(mapSize)), y: Math.floor(Math.random() *  Math.floor(mapSize)) };
        b = true;
      }
    });
  }

  return pos;
}

function isColorFree(color) {
  snakes.forEach((snake) => {
    if(snake.color == color) {
      return true;
    }
  });

  return true;
}
