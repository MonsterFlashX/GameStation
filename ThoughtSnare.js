// Just grabbing the main elements I'll be working with
const startBtn = document.getElementById("startBtn");
const stepContainer = document.getElementById("stepContainer");
const symbolGrid = document.getElementById("symbolGrid");
const revealBtn = document.getElementById("revealBtn");
const mindResult = document.getElementById("mindResult");
const resultSymbol = document.getElementById("resultSymbol");

// A little mix of symbols – can expand this later if needed
const symbols = ["♠", "♥", "♦", "♣", "★", "☯", "✪", "⚡", "☠", "❄"];

// Pick a symbol we'll "magically" predict – feels random, but isn't 😉
const mysterySymbol = symbols[Math.floor(Math.random() * symbols.length)];

// This generates the number-symbol combos for the grid
function fillSymbolGrid() {
  symbolGrid.innerHTML = ""; // Clear out previous stuff, just in case

  for (let num = 0; num <= 99; num++) {
    const symbolBox = document.createElement("div");

    // The trick is all results end up as multiples of 9. Classic brain game move.
    const shouldUseMystery = num % 9 === 0;
    const displaySymbol = shouldUseMystery
      ? mysterySymbol
      : symbols[Math.floor(Math.random() * symbols.length)];

    symbolBox.textContent = `${num} - ${displaySymbol}`;

    symbolGrid.appendChild(symbolBox);
  }

  // TODO: maybe highlight the mystery numbers later?
}

// When the start button is clicked, show steps and prep the grid
startBtn.addEventListener("click", function () {
  stepContainer.classList.remove("hidden"); // finally show the instructions
  fillSymbolGrid(); // populate the numbers + symbols
});

// Big moment — show what the user's thinking (kind of)
revealBtn.addEventListener("click", () => {
  resultSymbol.textContent = mysterySymbol; // reveal the secret symbol!
  mindResult.classList.remove("hidden"); // add some drama
});
