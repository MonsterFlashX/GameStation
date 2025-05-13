const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

let editorMode = false;
let editorArea;

let visualEditor = false;
let currentDrawType = "platform";
let newElement = null;

document.getElementById("elementType").onchange = (e) => {
  currentDrawType = e.target.value;
};

function toggleVisualEditor() {
  visualEditor = !visualEditor;
  document.getElementById("editorToolbar").style.display = visualEditor ? "block" : "none";
  if (visualEditor) {
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mouseup", endDraw);
  } else {
    canvas.removeEventListener("mousedown", startDraw);
    canvas.removeEventListener("mouseup", endDraw);
  }
}

function startDraw(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  newElement = { x, y, w: 0, h: 0 };
}

function endDraw(e) {
  if (!newElement) return;
  const rect = canvas.getBoundingClientRect();
  newElement.w = (e.clientX - rect.left) - newElement.x;
  newElement.h = (e.clientY - rect.top) - newElement.y;

  const lvl = levels[currentLevel];
  switch (currentDrawType) {
    case "platform":
      lvl.platforms.push(newElement); break;
    case "spike":
      lvl.spikes.push(newElement); break;
    case "button":
      lvl.buttons.push({ ...newElement, linkedDoor: 0 }); break;
    case "door":
      lvl.doors.push({ ...newElement, open: false }); break;
    case "exit":
      lvl.exits.push({ x: newElement.x, y: newElement.y }); break;
  }

  newElement = null;
  loadLevel(currentLevel);
}

function exportLevel() {
  const levelData = JSON.stringify(levels[currentLevel], null, 2);
  document.getElementById("output").textContent = levelData;
}


function toggleEditor() {
  editorMode = !editorMode;
  if (editorMode) {
    if (!editorArea) {
      editorArea = document.createElement("textarea");
      editorArea.value = JSON.stringify(levels[currentLevel], null, 2);
      editorArea.id = "editor";
      const btn = document.querySelector("button");
      btn.insertAdjacentElement("afterend", editorArea);

      const saveBtn = document.createElement("button");
      saveBtn.innerText = "💾 Save Level";
      saveBtn.onclick = () => {
        try {
          const parsed = JSON.parse(editorArea.value);
          levels[currentLevel] = parsed;
          loadLevel(currentLevel);
          alert("Level updated!");
        } catch (e) {
          alert("Invalid JSON!");
        }
      };
      editorArea.insertAdjacentElement("afterend", saveBtn);
    }
    editorArea.style.display = "block";
  } else {
    editorArea.style.display = "none";
  }
}

// Player structure
class Player {
  constructor(x, y, color, flipX = false) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 20;
    this.color = color;
    this.flipX = flipX;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
  }

  update(platforms) {
    const speed = 2;
    const gravity = 0.4;
    const jumpForce = -6;

    this.vx = 0;
    if (keys["a"]) this.vx = this.flipX ? speed : -speed;
    if (keys["d"]) this.vx = this.flipX ? -speed : speed;
    if (keys["w"] && this.onGround) {
      this.vy = jumpForce;
      this.onGround = false;
    }

    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;

    this.onGround = false;
    platforms.forEach(p => {
      if (checkCollision(this, p)) {
        if (this.vy >= 0) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
        }
      }
    });
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

// Levels
const levels = [
  {
    name: "Level 1",
    platforms: [{x: 0, y: 390, w: 800, h: 10}],
    spikes: [],
    buttons: [],
    doors: [],
    exits: [{x: 750, y: 370}, {x: 30, y: 370}]
  },
  {
    name: "Level 2",
    platforms: [
      {x: 0, y: 390, w: 800, h: 10},
      {x: 300, y: 300, w: 200, h: 10}
    ],
    spikes: [
      {x: 400, y: 380, w: 20, h: 10}
    ],
    buttons: [
      {x: 350, y: 280, w: 20, h: 10, linkedDoor: 0}
    ],
    doors: [
      {x: 600, y: 300, w: 10, h: 90, open: false}
    ],
    exits: [{x: 750, y: 370}, {x: 30, y: 370}]
  }  
];

let currentLevel = parseInt(localStorage.getItem("brainSplitLevel") || "0");

const player1 = new Player(100, 350, "#0ff", false);
const player2 = new Player(680, 350, "#f0f", true);

function loadLevel(index) {
  currentLevel = index;
  const level = levels[index];
  player1.x = 100;
  player1.y = 350;
  player2.x = 680;
  player2.y = 350;
  player1.vy = 0;
  player2.vy = 0;
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function restartLevel() {
  alert("☠️ One mind failed. Restarting...");
  loadLevel(currentLevel);
}

function checkWinCondition(level) {
  const [e1, e2] = level.exits;
  const win1 = checkCollision(player1, {x: e1.x, y: e1.y, w: 20, h: 20});
  const win2 = checkCollision(player2, {x: e2.x, y: e2.y, w: 20, h: 20});
  return win1 && win2;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const level = levels[currentLevel];

  // Update
  player1.update(level.platforms);
  player2.update(level.platforms);

  // Draw platforms
  level.platforms.forEach(p => {
    ctx.fillStyle = "#444";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });

  // Moving Platforms
level.movingPlatforms?.forEach(p => {
  p.x += p.dx;
  if (p.x > p.originX + p.range || p.x < p.originX) p.dx *= -1;

  ctx.fillStyle = "#888";
  ctx.fillRect(p.x, p.y, p.w, p.h);

  // Ride mechanic
  [player1, player2].forEach(pl => {
    if (checkCollision(pl, p) && pl.vy >= 0) {
      pl.y = p.y - pl.h;
      pl.vy = 0;
      pl.onGround = true;
      pl.x += p.dx;
    }
  });
});

  // Pressure Plates
level.pressurePlates?.forEach((p, i) => {
  const isActive = checkCollision(player1, p) || checkCollision(player2, p);
  p.active = isActive;

  ctx.fillStyle = isActive ? "#0f0" : "#070";
  ctx.fillRect(p.x, p.y, p.w, p.h);

  if (isActive && p.linkedDoor !== undefined) {
    level.doors[p.linkedDoor].open = true;
  }
});

  // Spikes
  level.spikes.forEach(s => {
    ctx.fillStyle = "#f00";
    ctx.fillRect(s.x, s.y, s.w, s.h);

    if (checkCollision(player1, s) || checkCollision(player2, s)) {
      restartLevel();
    }
  });

  // Buttons
level.buttons.forEach((b, i) => {
  ctx.fillStyle = "#0f0";
  ctx.fillRect(b.x, b.y, b.w, b.h);

  const isPressed = checkCollision(player1, b) || checkCollision(player2, b);
  if (isPressed && b.linkedDoor !== undefined) {
    level.doors[b.linkedDoor].open = true;
  }
});

// Doors
level.doors.forEach((d, i) => {
  if (!d.open) {
    ctx.fillStyle = "#00f";
    ctx.fillRect(d.x, d.y, d.w, d.h);

    [player1, player2].forEach(p => {
      if (checkCollision(p, d)) {
        if (p.vx > 0) p.x = d.x - p.w;
        if (p.vx < 0) p.x = d.x + d.w;
      }
    });
  }
});

  // Exits
  level.exits.forEach(e => {
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(e.x, e.y, 20, 20);
  });

  // Players
  player1.draw();
  player2.draw();

  // Win check
  if (checkWinCondition(level)) {
    currentLevel++;
    if (currentLevel >= levels.length) {
      alert("🎉 You beat all levels!");
      localStorage.setItem("brainSplitLevel", 0);
      currentLevel = 0;
    } else {
      alert("✅ Level Complete!");
      localStorage.setItem("brainSplitLevel", currentLevel);
    }
    loadLevel(currentLevel);
  }

  requestAnimationFrame(gameLoop);
}

loadLevel(currentLevel);
gameLoop();
