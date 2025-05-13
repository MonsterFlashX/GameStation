const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let dominos = [];
let buildMode = true;
let dragging = null;

// --- Core Classes ---

class Domino {
  constructor(x, y, angle = 0) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.width = 10;
    this.height = 40;
    this.fallen = false;
    this.angularVel = 0;
    this.type = "domino";
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.fallen ? "#f55" : "#fff";
    ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);
    ctx.restore();
  }

  update() {
    if (!this.fallen) return;

    this.angle += this.angularVel;
    this.angularVel *= 0.95;

    dominos.forEach(other => {
      if (!other.fallen && other !== this && Math.hypot(this.x - other.x, this.y - other.y) < 60) {
        if (Math.abs(this.angle) > 0.5) {
          other.fallen = true;
          other.angularVel = 0.15;
        }
      }
    });
  }

  contains(x, y) {
    return x > this.x - 10 && x < this.x + 10 && y > this.y - 40 && y < this.y;
  }
}

class Switch {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.type = "switch";
    this.activated = false;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.activated ? "#ff0" : "#999";
    ctx.fill();
  }

  update() {
    dominos.forEach(d => {
      if (d.fallen && Math.hypot(this.x - d.x, this.y - d.y) < 30) {
        this.activated = true;
        dominos.forEach(t => {
          if (!t.fallen && Math.hypot(t.x - this.x, t.y - this.y) < 60) {
            t.fallen = true;
            t.angularVel = 0.15;
          }
        });
      }
    });
  }

  contains(x, y) {
    return Math.hypot(x - this.x, y - this.y) < this.radius;
  }
}

class TimedSwitch {
  constructor(x, y, delay = 2000) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.delay = delay;
    this.timer = null;
    this.activated = false;
    this.triggered = false;
    this.type = "timedSwitch";
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.triggered ? "#0f0" : (this.activated ? "#ff0" : "#666");
    ctx.fill();
  }

  update() {
    if (this.activated) return;

    dominos.forEach(d => {
      if (d.fallen && Math.hypot(this.x - d.x, this.y - d.y) < 30) {
        this.activated = true;
        this.timer = setTimeout(() => {
          this.triggered = true;
          dominos.forEach(t => {
            if (!t.fallen && Math.hypot(t.x - this.x, t.y - this.y) < 80) {
              t.fallen = true;
              t.angularVel = 0.15;
            }
          });
        }, this.delay);
      }
    });
  }

  contains(x, y) {
    return Math.hypot(x - this.x, y - this.y) < this.radius;
  }
}

class Goal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.activated = false;
    this.type = "goal";
  }

  draw() {
    ctx.fillStyle = this.activated ? "#0f0" : "#f0f";
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }

  update() {
    dominos.forEach(d => {
      if (d.fallen && Math.hypot(this.x - d.x, this.y - d.y) < 30) {
        this.activated = true;
        winGame();
      }
    });
  }

  contains(x, y) {
    return (
      x > this.x - this.width / 2 &&
      x < this.x + this.width / 2 &&
      y > this.y - this.height / 2 &&
      y < this.y + this.height / 2
    );
  }
}

// --- Game Controls ---

function toggleBuildMode() {
  buildMode = !buildMode;
}

function startSimulation() {
  dominos.forEach((d, i) => {
    if (d.type === "domino") {
      d.fallen = i === 0;
      d.angularVel = i === 0 ? 0.2 : 0;
    }
  });
}

function winGame() {
  ctx.fillStyle = "rgba(0,255,0,0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0f0";
  ctx.font = "40px monospace";
  ctx.fillText("🎉 YOU WIN! 🎉", 250, 250);
}

function saveLevel() {
  const levelData = dominos.map(d => ({
    x: d.x,
    y: d.y,
    angle: d.angle || 0,
    type: d.type,
    delay: d.delay || 0
  }));
  localStorage.setItem("dominoLevel", JSON.stringify(levelData));
  alert("Level saved!");
}

function loadLevel() {
  const saved = localStorage.getItem("dominoLevel");
  if (!saved) return alert("No saved level found.");

  const data = JSON.parse(saved);
  dominos = data.map(d => {
    switch (d.type) {
      case "goal": return new Goal(d.x, d.y);
      case "switch": return new Switch(d.x, d.y);
      case "timedSwitch": return new TimedSwitch(d.x, d.y, d.delay);
      default: return new Domino(d.x, d.y, d.angle);
    }
  });
}

// --- Build Interaction ---

canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const tool = document.getElementById("toolSelect").value;

  if (!buildMode) return;

  for (let d of dominos) {
    if (d.contains(x, y)) {
      if (e.shiftKey && d instanceof Domino) {
        d.angle += Math.PI / 4;
      } else {
        dragging = d;
      }
      return;
    }
  }

  let newObj;
  switch (tool) {
    case "switch": newObj = new Switch(x, y); break;
    case "goal": newObj = new Goal(x, y); break;
    case "timedSwitch": newObj = new TimedSwitch(x, y); break;
    default: newObj = new Domino(x, y); break;
  }

  dominos.push(newObj);
});

canvas.addEventListener("mousemove", e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  dragging.x = e.clientX - rect.left;
  dragging.y = e.clientY - rect.top;
});

canvas.addEventListener("mouseup", () => dragging = null);

// --- Game Loop ---

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dominos.forEach(obj => {
    obj.update?.();
    obj.draw?.();
  });
  requestAnimationFrame(gameLoop);
}

gameLoop();