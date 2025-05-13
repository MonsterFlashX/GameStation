const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let stack = [];
let current;
let direction = 1;
let speed = 2;
let score = 0;
let best = parseInt(localStorage.getItem("stack_best")) || 0;
document.getElementById("best").textContent = best;

const blockHeight = 25;

function createBlock(y, width, x = 0) {
  return { x, y, width };
}

function initGame() {
  stack = [createBlock(HEIGHT - blockHeight, WIDTH)];
  addBlock();
  score = 0;
  updateScore();
}

function addBlock() {
  const prev = stack[stack.length - 1];
  current = createBlock(prev.y - blockHeight, prev.width);
  current.x = 0;
  direction = 1;
}

function updateScore() {
  document.getElementById("score").textContent = score;
  if (score > best) {
    best = score;
    localStorage.setItem("stack_best", best);
    document.getElementById("best").textContent = best;
  }
}

function gameOver() {
  alert(`💥 Stack collapsed! Height: ${score}`);
}

function dropBlock() {
  const prev = stack[stack.length - 1];

  const leftEdge = Math.max(current.x, prev.x);
  const rightEdge = Math.min(current.x + current.width, prev.x + prev.width);
  const overlap = rightEdge - leftEdge;

  if (overlap <= 0) {
    gameOver();
    return;
  }

  current.x = leftEdge;
  current.width = overlap;

  stack.push({ ...current });
  score++;
  updateScore();

  if (current.width < 10) {
    gameOver();
    return;
  }

  addBlock();
}

function drawBlock(block, color = "lime") {
  ctx.fillStyle = color;
  ctx.fillRect(block.x, block.y, block.width, blockHeight);
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  for (let b of stack) {
    drawBlock(b, "dodgerblue");
  }

  drawBlock(current);

  current.x += direction * speed;
  if (current.x + current.width > WIDTH || current.x < 0) {
    direction *= -1;
  }

  requestAnimationFrame(draw);
}

function restartGame() {
  initGame();
  draw();
}

// Input bindings
canvas.addEventListener("click", dropBlock);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    dropBlock();
  }
});

// Start
initGame();
draw();
