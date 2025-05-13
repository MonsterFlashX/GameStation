const cipherTextEl = document.getElementById("cipherText");
const guessInput = document.getElementById("guess");
const resultEl = document.getElementById("result");
const hintBtn = document.getElementById("hintBtn");
const hintText = document.getElementById("hintText");

let level = 1;
let shift = Math.floor(Math.random() * 10) + 1;
let original = "THE PACKAGE IS UNDER THE BRIDGE"; // this could be dynamic later
let encrypted = caesarEncrypt(original, shift);

cipherTextEl.textContent = encrypted;

function caesarEncrypt(text, offset) {
  // Caesar cipher encoder — just basic shift for uppercase A-Z
  return text.toUpperCase().split("").map(char => {
    if (char.match(/[A-Z]/)) {
      return String.fromCharCode(((char.charCodeAt(0) - 65 + offset) % 26) + 65);
    } else {
      return char; // spaces & punctuation stay the same
    }
  }).join("");
}

// Handle submission of the guess
document.getElementById("submitGuess").addEventListener("click", () => {
  const guess = guessInput.value.toUpperCase().trim();

  if (guess === original) {
    resultEl.textContent = "✅ Correct! Moving to next level...";
    resultEl.style.color = "limegreen";
    // TODO: implement level-up logic & new ciphers
  } else {
    resultEl.textContent = "❌ Incorrect. Try again.";
    resultEl.style.color = "red";
  }
});

// Reveal hint (burns a point maybe?)
hintBtn.addEventListener("click", () => {
  hintText.textContent = `Hint: It's a Caesar Cipher with a shift of ${shift}`;
});
