import './style.css'

const canvas = document.getElementsByTagName("canvas").item(0)!;

const ctx = canvas.getContext("2d")!;

const snakeBody: [number, number][] = [[0, 0]];

let frame = 0;
let startTime = performance.now();

const fpsEl = document.getElementById("fps");
const fps = 3;

const speed = 25 * fps;

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

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lightgreen";

  for (const [x, y] of snakeBody) {
    ctx.fillRect(x, y, 25, 25);
  }

  snakeBody[0] = returnNewPosition(snakeBody[0], speed / fps, canvas.width, canvas.height);

  const currentTime = performance.now();
  const delta = currentTime - startTime;
  frame++;

  if (delta > 300) {
    fpsEl!.innerText = `FPS: ${Math.round(frame / (delta / 1000))}`;

    startTime = currentTime;
    frame = 0;
  }

  // snakeBody.push([snakeBody[snakeBody.length - 1][0] + 30, snakeBody[snakeBody.length - 1][1]]);

  // const framesElement = document.createElement("div");
  // framesElement.innerText = `Frame: ${frame++}`;
  //
  // document.body.appendChild(framesElement);
}

setInterval(() => {
  drawFrame();
}, 1000 / fps);
