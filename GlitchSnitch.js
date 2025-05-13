const grid = document.getElementById("grid");
const timerDisplay = document.getElementById("timer");
const glitchCountDisplay = document.getElementById("glitchesLeft");

let totalBoxes = 30;
let totalGlitches = 5;
let timeLeft = 10;
let timer;
let fixedCount = 0;

// Generate the grid of clickable boxes
function createGrid() {
  grid.innerHTML = "";

  for (let i = 0; i < totalBoxes; i++) {
    const box = document.createElement("div");
    box.classList.add("box");

    // Randomly assign glitches
    if (Math.random() < totalGlitches / totalBoxes) {
      box.classList.add("glitch");
      box.dataset.glitch = "true";
    }

    box.addEventListener("click", () => {
      if (box.dataset.glitch === "true") {
        box.classList.remove("glitch");
        box.classList.add("fixed");
        box.dataset.glitch = "false";
        fixedCount++;
        updateGlitchCount();
        checkWinCondition();
      }
    });

    grid.appendChild(box);
  }

  updateGlitchCount();
}

// Count how many glitches are still active
function updateGlitchCount() {
  const active = document.querySelectorAll(".glitch").length;
  glitchCountDisplay.textContent = active;
}

// Countdown timer logic
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("💥 System crashed! You ran out of time.");
      location.reload(); // quick restart
    }
  }, 1000);
}

// Check if all glitches are cleared
function checkWinCondition() {
  if (document.querySelectorAll(".glitch").length === 0) {
    clearInterval(timer);
    alert("🛠️ All glitches fixed! You saved the system.");
    saveProgress();
  }
}

// Save win stats to localStorage
function saveProgress() {
  const stored = parseInt(localStorage.getItem("glitchSnitchWins") || "0");
  localStorage.setItem("glitchSnitchWins", stored + 1);
}

// Begin!
createGrid();
startTimer();
