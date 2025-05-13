const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Constants for grid layout
const TILE_SIZE = 48;
const ROWS = 10, COLS = 30;
const viewCols = 10;

let scrollOffset = 0;
let player = { x: 2, y: 5, hp: 3, inventory: [] };
let enemies = [];
let tiles = [];
let quest = { collected: false, delivered: false };
let currentLevel = 1;
let timer = 60;

// Levels scale up difficulty as expected
const difficultySettings = {
  1: { enemySpeed: 0.02, timer: 90, hp: 5 },
  2: { enemySpeed: 0.02, timer: 85, hp: 5 },
  3: { enemySpeed: 0.03, timer: 80, hp: 5 },
  4: { enemySpeed: 0.03, timer: 70, hp: 4 },
  5: { enemySpeed: 0.04, timer: 60, hp: 4 },
  6: { enemySpeed: 0.05, timer: 50, hp: 4 },
  7: { enemySpeed: 0.06, timer: 40, hp: 3 },
  8: { enemySpeed: 0.07, timer: 30, hp: 3 },
  9: { enemySpeed: 0.08, timer: 20, hp: 2 },
  10: { enemySpeed: 0.1, timer: 10, hp: 2 },
};

function initWorld(level = 1) {
  const settings = difficultySettings[level] || difficultySettings[10];

  tiles = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => (Math.random() < 0.1 ? "tree" : "grass"))
  );

  tiles[5][25] = "scroll";  // Always put scroll here for simplicity
  tiles[5][28] = "npc";

  enemies = [
    { x: 10, y: 4, dir: 1 },
    { x: 18, y: 6, dir: -1 }
  ];

  player = { x: 2, y: 5, hp: settings.hp, inventory: [] };
  quest = { collected: false, delivered: false };
  timer = settings.timer;
  scrollOffset = 0;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = scrollOffset; x < scrollOffset + viewCols; x++) {
      const tile = tiles[y]?.[x];
      if (!tile) continue;

      ctx.fillStyle = {
        grass: "#88cc88",
        tree: "#446644",
        scroll: "gold",
        npc: "orange"
      }[tile] || "#000";

      ctx.fillRect((x - scrollOffset) * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw enemies
  enemies.forEach(e => {
    if (e.x >= scrollOffset && e.x < scrollOffset + viewCols) {
      ctx.fillStyle = "crimson";
      ctx.beginPath();
      ctx.arc((e.x - scrollOffset) * TILE_SIZE + 24, e.y * TILE_SIZE + 24, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw player
  ctx.fillStyle = "blue";
  ctx.fillRect((player.x - scrollOffset) * TILE_SIZE + 8, player.y * TILE_SIZE + 8, TILE_SIZE - 16, TILE_SIZE - 16);

  // UI overlay
  ctx.fillStyle = "white";
  ctx.fillText(`HP: ${player.hp}`, 10, 20);
  ctx.fillText(`Inventory: ${player.inventory.join(", ") || "empty"}`, 10, 40);
  ctx.fillText(`Time: ${timer}s`, 10, 60);
  ctx.fillText(`Level: ${currentLevel}`, 10, 80);
}

function update() {
  // Side scrolling behavior
  if (player.x - scrollOffset >= viewCols - 2 && scrollOffset < COLS - viewCols) {
    scrollOffset++;
  } else if (player.x - scrollOffset <= 1 && scrollOffset > 0) {
    scrollOffset--;
  }

  // Move enemies with some probability
  const speed = difficultySettings[currentLevel].enemySpeed;
  enemies.forEach(e => {
    if (Math.random() < speed) e.x += e.dir;
    if (e.x <= 0 || e.x >= COLS - 1) e.dir *= -1;

    if (e.x === player.x && e.y === player.y) {
      player.hp--;
      if (player.hp <= 0) {
        alert("You were caught! Game Over.");
        localStorage.removeItem("scrollquest_completed");
        location.reload();
      }
    }
  });
}

function movePlayer(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;

  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || tiles[ny][nx] === "tree") return;

  player.x = nx;
  player.y = ny;

  // Check enemy collision
  enemies = enemies.filter(e => {
    const hit = e.x === nx && e.y === ny;
    if (hit) player.hp--;
    return !hit;
  });

  if (player.hp <= 0) {
    alert("You died! Restarting quest.");
    localStorage.removeItem("scrollquest_completed");
    location.reload();
  }

  // Check for scroll pickup
  if (tiles[ny][nx] === "scroll" && !quest.collected) {
    quest.collected = true;
    player.inventory.push("Scroll");
    tiles[ny][nx] = "grass";
    alert("🧾 You found the scroll!");
  }

  // Check for scroll delivery
  if (tiles[ny][nx] === "npc" && quest.collected && !quest.delivered) {
    alert("📜 Scroll delivered! Well done.");
    quest.delivered = true;
    localStorage.setItem(`scrollquest_completed_level${currentLevel}`, "true");
    nextLevel();
  }
}

function nextLevel() {
  currentLevel++;
  if (currentLevel > 10) {
    alert("🏆 You completed all 10 levels!");
    currentLevel = 1;
  }
  initWorld(currentLevel);
}

// Input handling
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") movePlayer(1, 0);
  else if (e.key === "ArrowLeft") movePlayer(-1, 0);
  else if (e.key === "ArrowUp") movePlayer(0, -1);
  else if (e.key === "ArrowDown") movePlayer(0, 1);
});

// Countdown timer
setInterval(() => {
  timer--;
  if (timer <= 0) {
    alert("⌛ Time's up! Restarting...");
    localStorage.removeItem("scrollquest_completed");
    location.reload();
  }
}, 1000);

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Kick things off
initWorld();
gameLoop();

