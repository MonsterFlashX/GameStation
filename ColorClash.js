const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const colors = ["red", "blue", "green", "yellow", "purple"];

let activeColor = "";
let timer = 0;
let score = 0;
let score2 = 0;
let mode = "single";
let difficulty = localStorage.getItem("cc_difficulty") || "medium";

// Main entry point
function startGame(selectedMode = "single") {
  mode = selectedMode;
  difficulty = document.getElementById("difficulty").value;
  localStorage.setItem("cc_difficulty", difficulty);

  score = 0;
  score2 = 0;

  setNewColor();
  gameLoop();
}

// Timer varies by difficulty
function getTimerBase() {
  if (difficulty === "easy") return 5;
  if (difficulty === "medium") return 3.5;
  return 2.5;
}

// Occasionally throw visual distraction for hard mode
function maybeDistract() {
  if (difficulty === "hard" && Math.random() < 0.3) {
    const fake = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = fake;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
}

// Pick new active color
function setNewColor() {
  activeColor = colors[Math.floor(Math.random() * colors.length)];
  timer = getTimerBase();
}

// Core rendering logic
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = activeColor;
  ctx.fillRect(100, 100, 200, 200);

  maybeDistract(); // throw off player a bit if needed
}

// Main game loop
function gameLoop() {
  drawGame();
  timer -= 0.05;

  if (timer <= 0) {
    endGame();
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// End-of-round logic
function endGame() {
  if (mode === "single") {
    promptInitialsAndSave(score);
  } else {
    const winner = score > score2 ? "p1" : "p2";
    updateStats(winner);
    promptInitialsAndSave(Math.max(score, score2));
  }

  updateStats(); // total games always increase
}

// Store wins and games
function updateStats(winner = null) {
  let stats = JSON.parse(localStorage.getItem("cc_stats")) || { p1: 0, p2: 0, games: 0 };

  if (winner) stats[winner]++;
  stats.games++;

  localStorage.setItem("cc_stats", JSON.stringify(stats));
  renderStats();
}

// Show stats on screen
function renderStats() {
  const stats = JSON.parse(localStorage.getItem("cc_stats")) || { p1: 0, p2: 0, games: 0 };
  document.getElementById("p1wins").textContent = stats.p1;
  document.getElementById("p2wins").textContent = stats.p2;
  document.getElementById("gamesPlayed").textContent = stats.games;
}

// Prompt initials, save leaderboard
function promptInitialsAndSave(scoreVal) {
  let initials = prompt("Enter your initials (3 letters):", "") || "";
  initials = initials.toUpperCase().slice(0, 3);
  if (!initials) return;

  let board = JSON.parse(localStorage.getItem("cc_leaderboard")) || [];

  board.push({
    initials,
    score: scoreVal,
    date: new Date().toLocaleDateString()
  });

  board.sort((a, b) => b.score - a.score);
  board = board.slice(0, 10); // top 10

  localStorage.setItem("cc_leaderboard", JSON.stringify(board));
  renderLeaderboard();
}

// Show leaderboard
function renderLeaderboard() {
  const list = document.getElementById("leaderList");
  list.innerHTML = "";

  const board = JSON.parse(localStorage.getItem("cc_leaderboard")) || [];
  board.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.initials} - ${entry.score} pts (${entry.date})`;
    list.appendChild(li);
  });
}

// Download stats as .txt
function exportStats() {
  const stats = localStorage.getItem("cc_stats") || "{}";
  const board = localStorage.getItem("cc_leaderboard") || "[]";
  const blob = new Blob([`STATS:\n${stats}\n\nLEADERBOARD:\n${board}`], { type: "text/plain" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "colorclash_stats.txt";
  link.click();
}

// Nuke all data
function resetAll() {
  if (confirm("Are you sure you want to delete all stats and leaderboard data?")) {
    localStorage.removeItem("cc_stats");
    localStorage.removeItem("cc_leaderboard");
    localStorage.removeItem("cc_difficulty");
    renderStats();
    renderLeaderboard();
  }
}

// Initialize UI values
window.onload = () => {
  document.getElementById("difficulty").value = difficulty;
  renderStats();
  renderLeaderboard();
};
