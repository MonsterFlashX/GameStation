const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let keys = {};
let gamePaused = false;
let rewinding = false;
let rewindHistory = [];

const player = {
  x: 50,
  y: 300,
  w: 20,
  h: 20,
  vx: 0,
  vy: 0,
  speed: 2,
  color: "lime"
};

const goal = {
  x: 750,
  y: 300,
  w: 30,
  h: 30
};

const guards = [
  { x: 300, y: 300, w: 20, h: 20, dir: 1, speed: 1.5 }
];

// Key tracking
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function update() {
  if (rewinding) {
    // Backtrack player position if we have history
    if (rewindHistory.length > 0) {
      const state = rewindHistory.pop();
      Object.assign(player, state);
    } else {
      rewinding = false;
    }
    return;
  }

  if (gamePaused) return;

  // Save current state to rewind buffer (limit to 300)
  if (rewindHistory.length > 300) rewindHistory.shift();
  rewindHistory.push({ ...player });

  // Handle basic movement
  player.vx = 0;
  player.vy = 0;
  if (keys["ArrowRight"]) player.vx = player.speed;
  if (keys["ArrowLeft"]) player.vx = -player.speed;
  if (keys["ArrowDown"]) player.vy = player.speed;
  if (keys["ArrowUp"]) player.vy = -player.speed;

  player.x += player.vx;
  player.y += player.vy;

  // Guard patrol logic
  guards.forEach(g => {
    g.x += g.dir * g.speed;
    if (g.x < 200 || g.x > 400) g.dir *= -1;

    if (isColliding(player, g)) {
      alert("💀 Caught by a guard!");
      restartGame();
    }
  });

  // Check goal
  if (isColliding(player, goal)) {
    alert("🎉 Heist complete!");
    localStorage.setItem("timethief_complete", "true");
    restartGame();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw goal
  ctx.fillStyle = "gold";
  ctx.fillRect(goal.x, goal.y, goal.w, goal.h);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Draw guards
  guards.forEach(g => {
    ctx.fillStyle = "red";
    ctx.fillRect(g.x, g.y, g.w, g.h);
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  player.x = 50;
  player.y = 300;
  rewindHistory = [];
  gamePaused = false;
  rewinding = false;
}

function togglePause() {
  gamePaused = !gamePaused;
}

function rewind() {
  rewinding = true;
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

gameLoop();
