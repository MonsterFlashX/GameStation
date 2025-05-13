const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 30;

let player, obstacles, orbs;
let gameSpeed = 2;
let score = 0;
let best = 0;
let gameInterval;
let keys = {};

// Movement keys
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

function init() {
  player = {
    x: WIDTH / 2 - PLAYER_WIDTH / 2,
    y: HEIGHT - 60,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: 5
  };

  obstacles = [];
  orbs = [];
  gameSpeed = 2;
  score = 0;
  best = parseInt(localStorage.getItem("vr_best")) || 0;
  document.getElementById("best").textContent = best;

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 1000 / 60);
}

function spawnObstacle() {
  const width = Math.random() * 80 + 40;
  const x = Math.random() * (WIDTH - width);
  obstacles.push({ x, y: -40, width, height: 20 });
}

function spawnOrb() {
  const x = Math.random() * (WIDTH - 20);
  orbs.push({ x, y: -20, size: 15 });
}

function drawPlayer() {
  ctx.fillStyle = "#0ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObstacles() {
  ctx.fillStyle = "#f00";
  obstacles.forEach(obs => ctx.fillRect(obs.x, obs.y, obs.width, obs.height));
}

function drawOrbs() {
  ctx.fillStyle = "#ff0";
  orbs.forEach(orb => {
    ctx.beginPath();
    ctx.arc(orb.x + orb.size / 2, orb.y + orb.size / 2, orb.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function movePlayer() {
  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.x -= player.speed;
    if (player.x < 0) player.x = 0;
  }

  if (keys["ArrowRight"] || keys["KeyD"]) {
    player.x += player.speed;
    if (player.x + player.width > WIDTH) player.x = WIDTH - player.width;
  }
}

function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function collectOrb(orb) {
  score += 5;
  orb.collected = true;
}

function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  movePlayer();
  drawPlayer();

  // Update obstacles
  obstacles.forEach(obs => {
    obs.y += gameSpeed;
    if (collision(player, obs)) {
      endGame();
    }
  });
  drawObstacles();

  // Update orbs
  orbs.forEach(orb => {
    orb.y += gameSpeed;
    if (
      orb.x < player.x + player.width &&
      orb.x + orb.size > player.x &&
      orb.y < player.y + player.height &&
      orb.y + orb.size > player.y
    ) {
      collectOrb(orb);
    }
  });
  drawOrbs();

  // Clean up
  obstacles = obstacles.filter(o => o.y < HEIGHT);
  orbs = orbs.filter(o => o.y < HEIGHT && !o.collected);

  // Progress
  score += 0.05;
  gameSpeed += 0.001;
  document.getElementById("score").textContent = Math.floor(score);

  if (Math.random() < 0.02) spawnObstacle();
  if (Math.random() < 0.01) spawnOrb();
}

function endGame() {
  clearInterval(gameInterval);
  const finalScore = Math.floor(score);
  alert(`☠️ You crashed!\nDistance: ${finalScore}`);

  if (finalScore > best) {
    localStorage.setItem("vr_best", finalScore);
    document.getElementById("best").textContent = finalScore;
  }
}

function restartGame() {
  init();
}

init();
