const grid = document.getElementById("grid");
let moveCount = 0;
let moveHistory = [];
let levelIndex = 0;
let blocks = [];
let currentLevel = null;

const levels = [
  // Level 1: red car needs to escape to the right
  [
    { id: 'A', x: 0, y: 0, size: 2, dir: 'v' },
    { id: 'B', x: 1, y: 0, size: 3, dir: 'v' },
    { id: 'C', x: 3, y: 0, size: 2, dir: 'v' },
    { id: 'R', x: 2, y: 2, size: 2, dir: 'h', red: true },
    { id: 'D', x: 0, y: 3, size: 2, dir: 'h' },
    { id: 'E', x: 4, y: 3, size: 3, dir: 'v' },
  ]
  // More levels could go here
];

function loadLevel(index) {
  grid.innerHTML = '';
  moveCount = 0;
  moveHistory = [];
  blocks = [];

  document.getElementById("moves").textContent = moveCount;
  currentLevel = levels[index];

  currentLevel.forEach(data => {
    const el = document.createElement("div");
    el.classList.add("block");
    if (data.red) el.classList.add("red");

    el.style.gridColumnStart = data.x + 1;
    el.style.gridRowStart = data.y + 1;
    el.style.gridColumnEnd = `span ${data.dir === 'h' ? data.size : 1}`;
    el.style.gridRowEnd = `span ${data.dir === 'v' ? data.size : 1}`;

    el.dataset.id = data.id;
    el.dataset.dir = data.dir;

    el.addEventListener("click", () => moveBlock(data.id, 1));

    grid.appendChild(el);
    blocks.push({ ...data, el });
  });

  updateBest();
}

function moveBlock(id, direction) {
  const block = blocks.find(b => b.id === id);
  if (!block) return;

  const dx = block.dir === 'h' ? direction : 0;
  const dy = block.dir === 'v' ? direction : 0;

  if (canMove(block, dx, dy)) {
    moveHistory.push(JSON.stringify(blocks.map(b => ({ x: b.x, y: b.y }))));
    block.x += dx;
    block.y += dy;

    updateGrid();
    moveCount++;
    document.getElementById("moves").textContent = moveCount;

    if (block.red && block.x + block.size === 6) {
      alert("🎉 You got the red car out!");
      saveBest();
    }
  }
}

function canMove(block, dx, dy) {
  const newX = block.x + dx;
  const newY = block.y + dy;
  const occupied = new Set();

  // Mark all other block cells
  for (let b of blocks) {
    if (b.id === block.id) continue;
    for (let i = 0; i < b.size; i++) {
      const bx = b.x + (b.dir === 'h' ? i : 0);
      const by = b.y + (b.dir === 'v' ? i : 0);
      occupied.add(`${bx},${by}`);
    }
  }

  for (let i = 0; i < block.size; i++) {
    const bx = newX + (block.dir === 'h' ? i : 0);
    const by = newY + (block.dir === 'v' ? i : 0);

    if (bx < 0 || bx >= 6 || by < 0 || by >= 6) return false;
    if (occupied.has(`${bx},${by}`)) return false;
  }

  return true;
}

function updateGrid() {
  for (let b of blocks) {
    b.el.style.gridColumnStart = b.x + 1;
    b.el.style.gridRowStart = b.y + 1;
  }
}

function undoMove() {
  if (moveHistory.length === 0) return;
  const lastState = JSON.parse(moveHistory.pop());
  for (let i = 0; i < blocks.length; i++) {
    blocks[i].x = lastState[i].x;
    blocks[i].y = lastState[i].y;
  }
  moveCount--;
  document.getElementById("moves").textContent = moveCount;
  updateGrid();
}

function resetLevel() {
  loadLevel(levelIndex);
}

function nextLevel() {
  levelIndex = (levelIndex + 1) % levels.length;
  loadLevel(levelIndex);
}

function updateBest() {
  const best = localStorage.getItem(`gridlock_best_${levelIndex}`);
  document.getElementById("best").textContent = best || "-";
}

function saveBest() {
  const key = `gridlock_best_${levelIndex}`;
  const prev = localStorage.getItem(key);
  if (!prev || moveCount < parseInt(prev)) {
    localStorage.setItem(key, moveCount);
    updateBest();
  }
}

// Start on level 0
loadLevel(levelIndex);
