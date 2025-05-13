let score = 0;
let lives = 3;
let spawnRate = 1000; // ms between targets
let gameInterval = null;

let highScore = localStorage.getItem("tapfrenzy_high") || 0;
document.getElementById("high").textContent = highScore;

function startGame() {
  score = 0;
  lives = 3;
  spawnRate = 1000;

  updateUI();
  clearTargets();

  clearInterval(gameInterval);
  gameInterval = setInterval(spawnTarget, spawnRate);
}

function spawnTarget() {
  const area = document.getElementById("gameArea");
  const target = document.createElement("div");
  target.classList.add("target");

  // Random position
  const size = 40;
  const x = Math.random() * (area.clientWidth - size);
  const y = Math.random() * (area.clientHeight - size);
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  // Click behavior
  target.addEventListener("click", () => {
    score++;
    target.remove();
    updateUI();
    maybeSpeedUp();
  });

  area.appendChild(target);

  // Timeout to remove if missed
  setTimeout(() => {
    if (area.contains(target)) {
      target.remove();
      lives--;
      updateUI();
      if (lives <= 0) endGame();
    }
  }, spawnRate - 200); // a bit of mercy
}

function updateUI() {
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;
}

function maybeSpeedUp() {
  if (score % 5 === 0 && spawnRate > 300) {
    spawnRate -= 50;
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnRate);
  }
}

function endGame() {
  clearInterval(gameInterval);
  alert(`💀 Game Over!\nYour Score: ${score}`);

  if (score > parseInt(highScore)) {
    highScore = score;
    localStorage.setItem("tapfrenzy_high", highScore);
    document.getElementById("high").textContent = highScore;
  }
}

function clearTargets() {
  const area = document.getElementById("gameArea");
  while (area.firstChild) area.removeChild(area.firstChild);
}
