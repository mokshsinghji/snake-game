import './style.css'

const canvas = document.getElementsByTagName("canvas").item(0)!;

const ctx = canvas.getContext("2d")!;

let snakeBody: [number, number][] = [[0, 0]];

let frame = 0;
let startTime = performance.now();

const fpsEl = document.getElementById("fps");
const fps = 3;

const snakeBodySize = 25;


const speed = snakeBodySize * fps;

let direction: "up" | "down" | "left" | "right" = "up";

function returnNewPosition(orig: [number, number], toMove: number, width: number, height: number): [number, number] {
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
      direction = "up";
      break;
    case "ArrowDown":
      direction = "down";
      break;
    case "ArrowLeft":
      direction = "left";
      break;
    case "ArrowRight":
      direction = "right";
      break;
  }
}

const width = canvas.width / snakeBodySize;
const height = canvas.height / snakeBodySize;
let stopped = false;

const food = [[Math.floor(Math.random() * width), Math.floor(Math.random() * height)]];

async function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "gold";
  for (const [x, y] of food) {
    ctx.fillRect(x * snakeBodySize + 7, y * snakeBodySize + 7, 9, 9);
  }

  ctx.fillStyle = "lightgreen";

  if (snakeBody[0][0] === food[0][0] && snakeBody[0][1] === food[0][1]) {
    food[0] = [Math.floor(Math.random() * width), Math.floor(Math.random() * height)];
    console.log(food[0]);
    snakeBody.push(snakeBody[snakeBody.length - 1]);
  }

  for (const [x, y] of snakeBody) {
    ctx.fillRect(x * speed / fps, y * speed / fps, snakeBodySize, snakeBodySize);
  }

  let snakeBodyCopy = snakeBody.slice(0, snakeBody.length - 1);
  snakeBodyCopy[0] = returnNewPosition(snakeBody[0], 1, canvas.width / snakeBodySize, canvas.height / snakeBodySize);
  for (let i = 1; i < snakeBody.length; i++) {
    snakeBodyCopy[i] = snakeBody[i - 1];
  }

  snakeBody = snakeBodyCopy;

  if (snakeBody.slice(1).findIndex(s => s[0] === snakeBody[0][0] && s[1] === snakeBody[0][1]) !== -1) {
    stopped = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    stopped = false;
    snakeBody = [[0, 0]];
  }
  console.log(snakeBody.slice(1, snakeBody.length - 1).indexOf(snakeBody[0]));

  const currentTime = performance.now();
  const delta = currentTime - startTime;
  frame++;

  if (delta > 300) {
    fpsEl!.innerText = `FPS: ${Math.round(frame / (delta / 1000))}`;

    startTime = currentTime;
    frame = 0;
  }

  // snakeBody.push([snakeBody[snakeBody.length - 2][0] + 30, snakeBody[snakeBody.length - 1][1]]);

  // const framesElement = document.createElement("div");
  // framesElement.innerText = `Frame: ${frame++}`;
  //
  // document.body.appendChild(framesElement);
}

setInterval(() => {
  if (stopped) return;
  setTimeout(drawFrame, 0);
}, 1000 / fps);
