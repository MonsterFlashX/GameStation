const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 40;
const ROWS = 15, COLS = 15;

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Player and their mirrored counterpart
const player = { x: 1, y: 12 };
const mirror = { x: 13, y: 2 };

// Goals: both players must meet their mirrored target
const goalLight = { x: 13, y: 12 };
const goalDark = { x: 1, y: 2 };

let levelComplete = false;
let gameOver = false;

// Some walls to get in the way
let walls = [
  { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 }, { x: 8, y: 7 }
];

let spikes = [
  { x: 5, y: 2 },
  { x: 9, y: 12 }
];

let pressurePlates = [
  { x: 2, y: 12, side: 'light', active: false },
  { x: 12, y: 2, side: 'dark', active: false }
];

let doors = [
  { x: 7, y: 5, open: false }
];

function update() {
  if (levelComplete || gameOver) return;

  let dx = 0, dy = 0;

  if (keys["ArrowUp"]) dy = -1;
  else if (keys["ArrowDown"]) dy = 1;
  else if (keys["ArrowLeft"]) dx = -1;
  else if (keys["ArrowRight"]) dx = 1;

  if (dx !== 0 || dy !== 0) {
    moveBoth(dx, dy);
    keys = {}; // Consume movement input once
  }
}

function moveBoth(dx, dy) {
  const newPlayerX = player.x + dx;
  const newPlayerY = player.y + dy;
  const newMirrorX = mirror.x - dx;
  const newMirrorY = mirror.y - dy;

  if (isWall(newPlayerX, newPlayerY) || isWall(newMirrorX, newMirrorY)) return;
  if (!isDoorOpen(newPlayerX, newPlayerY) || !isDoorOpen(newMirrorX, newMirrorY)) return;

  player.x = newPlayerX;
  player.y = newPlayerY;
  mirror.x = newMirrorX;
  mirror.y = newMirrorY;

  checkPlates();

  if (isSpike(player.x, player.y) || isSpike(mirror.x, mirror.y)) {
    gameOver = true;
    setTimeout(() => {
      alert("🪦 Oops! You triggered a trap.");
      restartGame();
    }, 50);
  }

  if (player.x === goalLight.x && player.y === goalLight.y &&
      mirror.x === goalDark.x && mirror.y === goalDark.y) {
    levelComplete = true;
    alert("✨ Both worlds aligned. You did it!");
    localStorage.setItem("mirrordark_level_1", "complete");
  }
}

function isWall(x, y) {
  return walls.some(w => w.x === x && w.y === y);
}

function isSpike(x, y) {
  return spikes.some(s => s.x === x && s.y === y);
}

function isDoorOpen(x, y) {
  return !doors.some(d => d.x === x && d.y === y && !d.open);
}

function checkPlates() {
  for (let p of pressurePlates) {
    if (p.side === 'light') {
      p.active = (player.x === p.x && player.y === p.y);
    } else {
      p.active = (mirror.x === p.x && mirror.y === p.y);
    }
  }

  // All plates need to be active to open all doors
  let allPressed = pressurePlates.every(p => p.active);
  doors.forEach(d => d.open = allPressed);
}

function drawTile(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  walls.forEach(w => drawTile(w.x, w.y, "#444"));
  spikes.forEach(s => drawTile(s.x, s.y, "purple"));
  doors.forEach(d => drawTile(d.x, d.y, d.open ? "#0ff" : "#333"));
  pressurePlates.forEach(p => drawTile(p.x, p.y, p.active ? "#ff0" : "#555"));

  drawTile(goalLight.x, goalLight.y, "lime");
  drawTile(goalDark.x, goalDark.y, "red");

  drawTile(player.x, player.y, "#0f0");
  drawTile(mirror.x, mirror.y, "#f00");
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  player.x = 1; player.y = 12;
  mirror.x = 13; mirror.y = 2;
  gameOver = false;
  levelComplete = false;
}

gameLoop();
