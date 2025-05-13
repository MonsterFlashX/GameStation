// --- Level Data Setup ---
let levels = [
  {
    name: "Living Room",
    baseObjects: [
      { x: 150, y: 250, w: 100, h: 100, color: "#555" },
      { x: 350, y: 250, w: 100, h: 100, color: "#555" },
      { x: 270, y: 110, w: 60, h: 60, color: "#999" },
    ],
    anomaly: { x: 300, y: 150, radius: 30 },
    ambiance: "creepy.mp3"
  },
  {
    name: "Office",
    baseObjects: [
      { x: 200, y: 180, w: 200, h: 100, color: "#444" },
      { x: 100, y: 100, w: 50, h: 200, color: "#666" },
    ],
    anomaly: { x: 400, y: 130, radius: 20 },
    ambiance: "whispers.mp3"
  }
];

let currentLevel = 0;
let mode = "normal";
let lastSwitch = Date.now();
let strikes = 0, maxStrikes = 3;
let found = false;
let gameStarted = false;

let dragging = false;
let dragTarget = null;
let isDraggingAnomaly = false;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const audio = new Audio();

// --- Drawing Logic ---

function drawScene(level) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw static objects
  level.baseObjects.forEach(obj => {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
  });

  const anomaly = level.anomaly;

  // Reveal anomaly only in "uncanny" mode
  if (mode === "uncanny") {
    ctx.fillStyle = "#f00";
    ctx.beginPath();
    ctx.arc(anomaly.x, anomaly.y, anomaly.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hint ring (always visible)
  ctx.strokeStyle = "#0ff";
  ctx.beginPath();
  ctx.arc(anomaly.x, anomaly.y, anomaly.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = found ? "#0f0" : "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Level: ${level.name} | Strikes: ${strikes}/${maxStrikes}`, 10, 20);
}

// --- Game Loop ---

function gameLoop() {
  if (!found && Date.now() - lastSwitch > 2500) {
    mode = mode === "normal" ? "uncanny" : "normal";
    lastSwitch = Date.now();
  }

  drawScene(levels[currentLevel]);
  requestAnimationFrame(gameLoop);
}

// --- Mouse Interactions ---

canvas.addEventListener("mousedown", e => {
  const { x, y } = getMousePos(e);
  const anomaly = levels[currentLevel].anomaly;

  // Dragging the anomaly directly
  if (Math.hypot(anomaly.x - x, anomaly.y - y) < anomaly.radius) {
    dragging = true;
    isDraggingAnomaly = true;
    return;
  }

  // Dragging a box
  levels[currentLevel].baseObjects.forEach(obj => {
    if (x >= obj.x && x <= obj.x + obj.w && y >= obj.y && y <= obj.y + obj.h) {
      dragging = true;
      dragTarget = obj;
    }
  });
});

canvas.addEventListener("mousemove", e => {
  if (!dragging) return;
  const { x, y } = getMousePos(e);

  if (isDraggingAnomaly) {
    levels[currentLevel].anomaly.x = x;
    levels[currentLevel].anomaly.y = y;
  } else if (dragTarget) {
    dragTarget.x = x - dragTarget.w / 2;
    dragTarget.y = y - dragTarget.h / 2;
  }
});

canvas.addEventListener("mouseup", () => {
  dragging = false;
  dragTarget = null;
  isDraggingAnomaly = false;
});

// --- Click to Detect Anomaly ---

canvas.addEventListener("click", e => {
  if (!gameStarted || found) return;

  const { x, y } = getMousePos(e);
  const anomaly = levels[currentLevel].anomaly;

  if (Math.hypot(anomaly.x - x, anomaly.y - y) < anomaly.radius) {
    found = true;
    localStorage.setItem(`uncanny_level_${currentLevel}`, "true");
    document.getElementById("info").textContent = "✅ Correct!";
  } else {
    strikes++;
    if (strikes >= maxStrikes) {
      document.getElementById("info").textContent = "💀 Game Over";
    }
  }
});

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// --- Level Management ---

function loadLevel(index) {
  currentLevel = index;
  found = false;
  strikes = 0;
  audio.src = levels[index].ambiance;
  audio.loop = true;
  audio.play();

  loadProgress();
  document.getElementById("info").textContent = found ? "✅ Already found" : "Find the anomaly...";
}

function loadProgress() {
  found = localStorage.getItem(`uncanny_level_${currentLevel}`) === "true";
}

function resetGame() {
  for (let i = 0; i < levels.length; i++) {
    localStorage.removeItem(`uncanny_level_${i}`);
  }

  found = false;
  strikes = 0;
  loadLevel(currentLevel);
  document.getElementById("info").textContent = "Game reset.";
}

function startGame() {
  gameStarted = true;
  loadLevel(currentLevel);
  gameLoop();
}

// --- Editor UI Logic ---

function createLevelEditorUI() {
  const editor = document.getElementById("editor");
  const objList = document.getElementById("objectList");

  document.getElementById("addObj").onclick = () => {
    const x = parseInt(document.getElementById("x").value);
    const y = parseInt(document.getElementById("y").value);
    const w = parseInt(document.getElementById("w").value);
    const h = parseInt(document.getElementById("h").value);

    levels[currentLevel].baseObjects.push({ x, y, w, h, color: "#888" });
    objList.innerText += `Box (${x}, ${y})\n`;
  };

  document.getElementById("resetBtn").onclick = resetGame;
}

function setupLevelSelector() {
  const select = document.getElementById("levelSelect");

  levels.forEach((level, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = level.name;
    select.appendChild(option);
  });

  select.onchange = () => {
    const index = parseInt(select.value);
    loadLevel(index);
  };
}

// --- Initial Setup ---
document.getElementById("startBtn").onclick = () => {
  startGame();
  audio.play().catch(err => console.warn("Audio playback blocked until interaction", err));
};

createLevelEditorUI();
setupLevelSelector();
