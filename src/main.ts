import './style.css'

const canvas = document.getElementsByTagName("canvas").item(0)!;

const ctx = canvas.getContext("2d")!;

let snakeBody: [number, number][] = [[0, 0]];

let frame = 0;
let startTime = performance.now();

const fpsEl = document.getElementById("fps");
let fps = 3;

const snakeBodySize = 25;

let direction: "up" | "down" | "left" | "right" = "up";

type Direction = "up" | "down" | "left" | "right";

function returnNewPosition(orig: [number, number], toMove: number, width: number, height: number, direction: Direction): [number, number] {
  switch (direction) {
    case "up":
      if (orig[1] - toMove < 0) {
        return [orig[0], height - Math.abs(orig[1] - toMove) % height];
      }
      return [orig[0], Math.abs(orig[1] - toMove) % height];
    case "down":
      return [orig[0], (orig[1] + toMove) % height];
    case "left":
      if (orig[0] - toMove < 0) {
        return [width - Math.abs(orig[0] - toMove) % width, orig[1]];
      }
      return [Math.abs(orig[0] - toMove % width), orig[1]];
    case "right":
      return [(orig[0] + toMove) % width, orig[1]];
  }
}

document.onkeydown = (e) => {
  e.preventDefault();
  e.stopPropagation();
  switch (e.key) {
    case "ArrowUp":
      if (direction === "down") return;
      direction = "up";
      break;
    case "ArrowDown":
      if (direction === "up") return
      direction = "down";
      break;
    case "ArrowLeft":
      if (direction === "right") return;
      direction = "left";
      break;
    case "ArrowRight":
      if (direction === "left") return;
      direction = "right";
      break;
  }
}

const width = canvas.width / snakeBodySize;
const height = canvas.height / snakeBodySize;
let stopped = false;

const food = [[Math.floor(Math.random() * width), Math.floor(Math.random() * height)]];

function getImage(direction: "up" | "down" | "left" | "right") {
  const image = new Image();
  image.src = `/snake-game/corner-${direction}.png`;
  return image;
}

const images = {
  "left": getImage("left"),
  "right": getImage("right"),
  "up": getImage("up"),
  "down": getImage("down")
}

const inversedDirections = {
  "up": "down",
  "down": "up",
  "left": "right",
  "right": "left"
} as const;

let oneOldDirection: "up" | "down" | "left" | "right" = direction;

let oldDirections: ("up" | "down" | "left" | "right")[][] = Array(width).fill(Array(height).fill("up"));

function getDirection(x1: number, y1: number, x2: number, y2: number): "up" | "down" | "left" | "right" {
  if (x1 === x2) {
    if (y1 < y2) {
      return "down";
    } else {
      return "up";
    }
  } else {
    if (x1 < x2) {
      return "right";
    } else {
      return "left";
    }
  }
}

async function drawFrame() {
  if (snakeBody.slice(1).findIndex(s => s[0] === snakeBody[0][0] && s[1] === snakeBody[0][1]) !== -1) {
    stopped = true;
    document.body.prepend(document.createTextNode("You lost! Your score was " + snakeBody.length));
    await new Promise(resolve => setTimeout(resolve, 1000));
    stopped = false;
    snakeBody = [[0, 0]];
    fps = 3;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "gold";
  for (const [x, y] of food) {
    ctx.fillRect(x * snakeBodySize + 7, y * snakeBodySize + 7, 9, 9);
  }

  ctx.fillStyle = "lightgreen";

  if (snakeBody[0][0] === food[0][0] && snakeBody[0][1] === food[0][1]) {
    while (snakeBody.findIndex(s => s[0] === food[0][0] && s[1] === food[0][1]) !== -1) {
      food[0] = [Math.floor(Math.random() * width), Math.floor(Math.random() * height)];
    }
    console.log(food[0]);

    let currentDirection;

    if (snakeBody.length >= 2) {
      currentDirection = getDirection(...snakeBody[snakeBody.length - 1], ...snakeBody[snakeBody.length - 2])
    } else {
      currentDirection = direction;
    }

    const newPosition = returnNewPosition(snakeBody[snakeBody.length - 1], 1, canvas.width / snakeBodySize, canvas.height / snakeBodySize, inversedDirections[currentDirection]);
    snakeBody.push(newPosition);

    fps = Math.min(15, 3 + (snakeBody.length * 3 / 4)); // by the time you are a 20 length, fps should be at 15 and then stop
    console.log("setting fps to", fps);
  }

  for (let i = 0; i < snakeBody.length; i++) {
    const [x, y] = snakeBody[i];
    console.log(x, y)
    if (i === 0) {
      ctx.drawImage(images[oneOldDirection], x * snakeBodySize, y * snakeBodySize, snakeBodySize, snakeBodySize);
    } else if (i === snakeBody.length - 1) {
      const currentDirection = getDirection(...snakeBody[snakeBody.length - 1], ...snakeBody[snakeBody.length - 2]);
      ctx.drawImage(images[inversedDirections[currentDirection]], x * snakeBodySize, y * snakeBodySize, snakeBodySize, snakeBodySize);
    } else {
      ctx.fillRect(x * snakeBodySize, y * snakeBodySize, snakeBodySize, snakeBodySize);
    }
  }

  let snakeBodyCopy = snakeBody.slice(0, snakeBody.length - 1);
  snakeBodyCopy[0] = returnNewPosition(snakeBody[0], 1, canvas.width / snakeBodySize, canvas.height / snakeBodySize, direction);
  for (let i = 1; i < snakeBody.length; i++) {
    snakeBodyCopy[i] = snakeBody[i - 1];
  }

  oldDirections[snakeBody[0][0]][snakeBody[0][1]] = oneOldDirection;

  snakeBody = snakeBodyCopy;

  console.log(snakeBody.slice(1, snakeBody.length - 1).indexOf(snakeBody[0]));

  const currentTime = performance.now();
  const delta = currentTime - startTime;
  frame++;

  if (delta > 300) {
    fpsEl!.innerText = `FPS: ${Math.round(frame / (delta / 300))}`;

    startTime = currentTime;
    frame = 0;
  }

  oneOldDirection = direction;

  // snakeBody.push([snakeBody[snakeBody.length - 2][0] + 30, snakeBody[snakeBody.length - 1][1]]);

  // const framesElement = document.createElement("div");
  // framesElement.innerText = `Frame: ${frame++}`;
  //
  // document.body.appendChild(framesElement);
}

function createTimeout() {
  return setTimeout(() => {
    if (!stopped) drawFrame();
    setTimeout(createTimeout, 1000 / fps);
  }, 1000 / fps);
}

createTimeout();
