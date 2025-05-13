let secretCode = "";
let attempts = 0;
const maxAttempts = 10;
let bestScore = localStorage.getItem("cb_best") || "-";

document.getElementById("best").textContent = bestScore;

function generateCode() {
  secretCode = "";
  while (secretCode.length < 4) {
    const digit = Math.floor(Math.random() * 10).toString();
    secretCode += digit;
  }
  console.log("🔐 Secret Code:", secretCode); // Dev-only log
}

function submitGuess() {
  const inputEl = document.getElementById("input");
  const guess = inputEl.value.trim();

  if (guess.length !== 4 || isNaN(guess)) {
    alert("Please enter exactly 4 numeric digits.");
    return;
  }

  attempts++;
  document.getElementById("attempts").textContent = attempts;

  const feedback = evaluateGuess(guess);
  showFeedback(guess, feedback);

  if (feedback.correct === 4) {
    document.getElementById("feedback").textContent = "✅ Code Cracked!";
    updateBestScore();
    disableInput();
    return;
  }

  if (attempts >= maxAttempts) {
    document.getElementById("feedback").textContent = `❌ Out of tries! The code was: ${secretCode}`;
    disableInput();
  }

  inputEl.value = "";
}

function evaluateGuess(guess) {
  const codeArr = secretCode.split("");
  const guessArr = guess.split("");

  let correct = 0;
  let wrongPos = 0;

  const checkedCode = Array(4).fill(false);
  const checkedGuess = Array(4).fill(false);

  // First pass: exact matches
  for (let i = 0; i < 4; i++) {
    if (guessArr[i] === codeArr[i]) {
      correct++;
      checkedCode[i] = true;
      checkedGuess[i] = true;
    }
  }

  // Second pass: misplaced digits
  for (let i = 0; i < 4; i++) {
    if (checkedGuess[i]) continue;
    for (let j = 0; j < 4; j++) {
      if (!checkedCode[j] && guessArr[i] === codeArr[j]) {
        wrongPos++;
        checkedCode[j] = true;
        break;
      }
    }
  }

  return { correct, wrongPos };
}

function showFeedback(guess, result) {
  const entry = document.createElement("div");
  entry.classList.add("guess");
  entry.innerHTML = `Guess: <strong>${guess}</strong> |
    <span class="correct">${result.correct}✓</span> 
    <span class="wrong-pos">${result.wrongPos}~</span>`;
  document.getElementById("guess-area").appendChild(entry);
}

function disableInput() {
  document.getElementById("input").disabled = true;
}

function updateBestScore() {
  if (bestScore === "-" || attempts < parseInt(bestScore)) {
    bestScore = attempts;
    localStorage.setItem("cb_best", bestScore);
    document.getElementById("best").textContent = bestScore;
  }
}

function restartGame() {
  attempts = 0;
  document.getElementById("guess-area").innerHTML = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("input").disabled = false;
  document.getElementById("input").value = "";
  document.getElementById("attempts").textContent = "0";
  generateCode();
}

generateCode();
