import { Server } from "ws"

const port = 8888

const wss = new Server({ port: port })

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    let data = JSON.parse(message)
    switch(data.type) {
      case "newSnake":
        if(isGoodNewSnakeData(data.nick, data.color)) {
          new Snake(data.nick, data.color)
          ws.send(JSON.stringify({
            type: "snakeSpowned"
          }))
        }
        break
      
      case "board":
        let snake = getSnakeByNick(data.nick)
        let head = null
        if(snake) {
          head = snake.head()
        }
        ws.send(JSON.stringify({
          type: "board",
          board: board,
          mapSize: mapSize,
          head: head,
          snakes: snakes,
          snakesCount: snakes.length,
          topTen: topTen
        }))
        break

      case "direction":
        if(data.nick && data.direction !== undefined) {
          changeDirection(data.nick, data.direction)
        }
        break
    }
  })
})




const mapSize = 80
let board = [ [ "black" ] ]
let snakes = []
let apples = []
let topTen = [ "", "", "", "", "", "", "", "", "", "" ]



class Snake {
  constructor(nick = "empty", color = "black") {
    this.direction = Math.floor(Math.random() *  4)
    this.nick = nick
    this.color = color
    let a = freePos(6)
    this.body = [a, a, a]
    snakes.push(this)
  }

  move() {
    let next = { x: this.body[this.body.length - 1].x, y: this.body[this.body.length - 1].y }
    switch(this.direction) {
      case 0:
        next.y -= 1
        break
      case 1:
        next.x -= 1
        break
      case 2:
        next.y += 1
        break
      case 3:
        next.x += 1
        break
    }
    if(next.x < 0 || next.y < 0 || next.x >= mapSize || next.y >= mapSize) {
      deleteSnake(this)
      return
    }
    for(let snake of snakes) {
      if(snake.nick != this.nick) {
        for(let bodyElement of snake.body) {
          if(bodyElement.x == next.x && bodyElement.y == next.y) {
            deleteSnake(this)
            return
          }
        }
      }
    }
    this.body.push(next)
    for(let apple of apples) {
      if(next.x == apple.x && next.y == apple.y) {
        apples.splice(apples.indexOf(apple), 1)
        return
      }
    }
    this.body.shift()
  }

  head() {
    return this.body[this.body.length - 1]
  }

  changeDirection(a) {
    switch(a) {
      case 0:
        if(this.body[this.body.length - 2].y != this.head().y - 1) {
          this.direction = a
        }
        break
      case 1:
        if(this.body[this.body.length - 2].x != this.head().x - 1) {
          this.direction = a
        }
        break
      case 2:
        if(this.body[this.body.length - 2].y != this.head().y + 1) {
          this.direction = a
        }
        break
      case 3:
        if(this.body[this.body.length - 2].x != this.head().x + 1) {
          this.direction = a
        }
        break
    }
  }
}



const deleteSnake = (snake) => {
  for(let bodyElement of snake.body) {
    if(bodyElement != snake.head() && chance(0.4)) {
      apples.push(bodyElement)
    }
  }
  snakes.splice(snakes.indexOf(snake), 1)
}

const generateApple = () => {
  if(apples.length < mapSize / 6) {
    apples.push(freePos(3))
  }
}

const chance = (a) => {
  if(Math.random() < a) {
    return true
  }
  return false
}

const getSnakeByNick = (nick) => {
  for(let snake of snakes) {
    if(snake.nick === nick) {
      return snake
    }
  }
  return null
}

const changeDirection = (nick, direction) => {
  let snake = getSnakeByNick(nick)
  if(snake) {
    snake.changeDirection(direction)
  }
}

const randInt = (a, b) => {
  return Math.floor(a + Math.random() * Math.floor(b - a))
}

const freePos = (a = 0) => {
  let pos = { x: randInt(a, mapSize - a), y: randInt(a, mapSize - a) }
  
  let b = true
  while(b) {
    b = false
    for(let snake of snakes) {
      for(let snakebody of snake.body) {
        if(pos.x == snakebody.x && pos.y == snakebody.y) {
          pos = { x: randInt(a, mapSize - a), y: randInt(a, mapSize - a) }
          b = true
        }
      }
    }
    for(let apple of apples) {
      if(pos.x == apple.x && pos.y == apple.y) {
        pos = { x: randInt(a, mapSize - a), y: randInt(a, mapSize - a) }
        b = true
      }
    }
  }

  return pos
}



const isGoodNewSnakeData = (nick, color) => {
  if(!isGoodNick(nick) || !isGoodColor(color)) {
    return false
  }

  return true
}

const isGoodNick = (nick) => {
  for(let snake of snakes) {
    if(snake.nick == nick) {
      return false
    }
  }

  return true
}

const isGoodColor = (color) => {
  for(let snake of snakes) {
    if(snake.color == color) {
      return false
    }
  }

  return true
}


const updateTopTen = () => {
  for(let i = 0; i < 10; i++) {
    if(snakes[i]) {
      let snake = snakes[i]
      topTen[i] = {
        nick: "#" + (i + 1) + "   " + snake.nick,
        score: snake.body.length,
        color: snake.color
      }
    } else {
      topTen[i] = {
        nick: "",
        score: "",
        color: ""
      }
    }
  }
}


const update = () => {
  for(let snake of snakes) {
    snake.move()
  }

  if(chance(0.06)) {
    generateApple()
  }

  // odswierzanie planszy
  board = Array.from({ length: mapSize }, () => Array(mapSize).fill("black"))

  for(let snake of snakes) {
    for(let bodyElement of snake.body) {
      board[bodyElement.x][bodyElement.y] = snake.color
    }
  }
  
  for(let apple of apples) {
    board[apple.x][apple.y] = "yellow"
  }

  //sort
  for(let i = 0; i < snakes.length - 1; i++) {
    for(let j = i + 1; j < snakes.length; j++) {
      if(snakes[j].body.length > snakes[i].body.length) {
        let temp = snakes[i]
        snakes[i] = snakes[j]
        snakes[j] = temp
      }
    }
  }
  
  updateTopTen()
}

setInterval(update, 100)
