let startTime = 0;
let currentTime = 0;
let bestTime = 0;
let timerInterval;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gravity = 0.5;
let currentLevel = 1;
let levelData;
let platforms = [], spikes = [], checkpoints = [], door;
let keys = {};
let player = {};

let checkpoint = null;

// Key handling
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Kick off a level
function startLevel(levelNum) {
  currentLevel = levelNum;
  levelData = LEVELS[levelNum];

  platforms = levelData.platforms;
  spikes = levelData.spikes || [];
  checkpoints = levelData.checkpoints || [];
  door = levelData.door;

  checkpoint = { ...levelData.playerStart };
  player = {
    ...levelData.playerStart,
    width: 30,
    height: 30,
    vx: 0,
    vy: 0,
    speed: 4,
    grounded: false
  };

  gravity = 0.5;

  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  gameLoop();
  startTimer();
  updateBestTime();
}

// Basic collision detection
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    currentTime = (Date.now() - startTime) / 100;
    document.getElementById("timer").textContent = currentTime.toFixed(2);
  }, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
  currentTime = (Date.now() - startTime) / 100;
  const bestKey = `gravshift_best_L${currentLevel}`;
  const prevBest = parseFloat(localStorage.getItem(bestKey)) || Infinity;

  if (currentTime < prevBest) {
    localStorage.setItem(bestKey, currentTime.toFixed(2));
    alert(`🏆 New Record: ${currentTime.toFixed(2)}s!`);
  }

  updateBestTime();
}

function updateBestTime() {
  const bestKey = `gravshift_best_L${currentLevel}`;
  bestTime = parseFloat(localStorage.getItem(bestKey)) || "--";
  document.getElementById("best").textContent = bestTime;
}

function resetToCheckpoint() {
  player.x = checkpoint.x;
  player.y = checkpoint.y;
  player.vx = 0;
  player.vy = 0;
  gravity = 0.5;
  startTimer(); // Restart timer on death
}

// Core update loop
function update() {
  if (keys["ArrowLeft"] || keys["a"]) player.vx = -player.speed;
  else if (keys["ArrowRight"] || keys["d"]) player.vx = player.speed;
  else player.vx = 0;

  if (keys[" "] && player.grounded) {
    gravity *= -1; // Gravity shift!
    player.vy = gravity * 2;
    player.grounded = false;
    keys[" "] = false; // Prevent holding
  }

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  player.grounded = false;
  for (let plat of platforms) {
    if (checkCollision(player, plat)) {
      if ((gravity > 0 && player.vy > 0) || (gravity < 0 && player.vy < 0)) {
        player.y = gravity > 0 ? plat.y - player.height : plat.y + plat.height;
        player.vy = 0;
        player.grounded = true;
      }
    }
  }

  // Hit spike = death
  for (let spike of spikes) {
    if (checkCollision(player, spike)) {
      resetToCheckpoint();
      return;
    }
  }

  // Save checkpoint
  for (let cp of checkpoints) {
    if (checkCollision(player, cp)) {
      checkpoint = { x: cp.x, y: cp.y };
    }
  }

  if (checkCollision(player, door)) {
    stopTimer();
    alert(`✅ Level ${currentLevel} completed in ${currentTime.toFixed(2)}s`);
    canvas.style.display = "none";
    document.getElementById("menu").style.display = "block";
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#444"; // platforms
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  ctx.fillStyle = "red"; // spikes
  spikes.forEach(s => ctx.fillRect(s.x, s.y, s.width, s.height));

  ctx.fillStyle = "cyan"; // checkpoints
  checkpoints.forEach(c => ctx.fillRect(c.x, c.y, c.width, c.height));

  ctx.fillStyle = "limegreen"; // exit door
  ctx.fillRect(door.x, door.y, door.width, door.height);

  ctx.fillStyle = "#00ccff"; // player
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}