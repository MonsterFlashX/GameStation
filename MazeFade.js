const mazeContainer = document.getElementById("maze");
const statusText = document.getElementById("status");

let width = 15;
let height = 15;
let level = 1;
let maze = [];
let fadeTimer;
let playerPos;
let goalPos;

// Initialize maze with all walls
function initMazeGrid() {
  maze = Array.from({ length: height }, () => Array(width).fill(1));
}

// Maze generator using recursive backtracking
function generateMaze(x = 0, y = 0) {
  const directions = [
    [0, -2],
    [0, 2],
    [-2, 0],
    [2, 0]
  ].sort(() => Math.random() - 0.5); // shuffle moves randomly

  maze[y][x] = 0; // mark current cell as path

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;

    if (
      ny > 0 && ny < height - 1 &&
      nx > 0 && nx < width - 1 &&
      maze[ny][nx] === 1
    ) {
      maze[y + dy / 2][x + dx / 2] = 0; // carve between
      generateMaze(nx, ny);
    }
  }
}

function createMaze() {
  mazeContainer.innerHTML = "";
  mazeContainer.style.gridTemplateColumns = `repeat(${width}, 30px)`;
  mazeContainer.style.gridTemplateRows = `repeat(${height}, 30px)`;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = document.createElement("div");
      tile.classList.add("cell");

      if (maze[y][x] === 1) tile.classList.add("wall");
      if (x === goalPos.x && y === goalPos.y) tile.classList.add("goal");
      if (x === playerPos.x && y === playerPos.y) tile.classList.add("player");

      tile.id = `cell-${x}-${y}`;
      mazeContainer.appendChild(tile);
    }
  }
}

function updatePlayer() {
  // Remove player from old cell
  document.querySelectorAll(".player").forEach(cell => {
    cell.classList.remove("player");
  });

  // Add player to new cell
  const current = document.getElementById(`cell-${playerPos.x}-${playerPos.y}`);
  if (current) current.classList.add("player");

  // Check for win condition
  if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
    statusText.textContent = `✅ Level ${level} complete!`;
    clearInterval(fadeTimer);
    document.removeEventListener("keydown", handleMove);

    setTimeout(() => nextLevel(), 2000);
  }
}

function handleMove(e) {
  const key = e.key;
  let dx = 0, dy = 0;

  if (["ArrowRight", "d"].includes(key)) dx = 1;
  else if (["ArrowLeft", "a"].includes(key)) dx = -1;
  else if (["ArrowDown", "s"].includes(key)) dy = 1;
  else if (["ArrowUp", "w"].includes(key)) dy = -1;

  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;

  if (
    newX >= 0 && newX < width &&
    newY >= 0 && newY < height &&
    maze[newY][newX] === 0
  ) {
    playerPos = { x: newX, y: newY };
    updatePlayer();
  }
}

function fadeMaze() {
  document.querySelectorAll(".wall").forEach(cell => {
    const roll = Math.random();
    if (roll < 0.2) {
      cell.classList.add("faded"); // disappearing act
    } else if (roll > 0.95) {
      cell.classList.remove("faded"); // rare wall respawn
    }
  });
}

function nextLevel() {
  level++;
  width += 2;
  height += 2;

  initMazeGrid();
  generateMaze(1, 1);

  playerPos = { x: 1, y: 1 };
  goalPos = { x: width - 2, y: height - 2 };

  createMaze();
  updatePlayer();

  const fadeSpeed = Math.max(1000 - level * 50, 300); // faster over time
  fadeTimer = setInterval(fadeMaze, fadeSpeed);

  statusText.textContent = `Level ${level}`;
  document.addEventListener("keydown", handleMove);
}

// Fire it up
function startGame() {
  level = 1;
  width = 15;
  height = 15;
  nextLevel();
}

startGame();
