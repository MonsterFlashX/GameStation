const switch1 = document.getElementById("switch1");
const switch2 = document.getElementById("switch2");
const doorEl = document.getElementById("futureDoor");
const clickSound = document.getElementById("clickSound");
const doorSound = document.getElementById("doorSound");
const timerEl = document.getElementById("timer");

let switch1On = false;
let switch2On = false;
let timer = 10;
let timerInterval;

if (localStorage.getItem("switch1")) {
    switch1On = JSON.parse(localStorage.getItem("switch1"));
    switch2On = JSON.parse(localStorage.getItem("switch2"));
    updateSwitches();
    updateDoor();
}   


switch1.addEventListener("click", () => {
    switch1On = !switch1On;
    clickSound.play();
    updateSwitches();
    updateDoor();
    saveStates();
});

switch2.addEventListener("click", () => {
    switch2On = !switch2On;
    clickSound.play();
    updateSwitches();
    updateDoor();
    saveStates();
});

function updateSwitches() {
    switch1.classList.toggle("on", switch1On);
    switch1.textContent = switch1On ? "Switch 1 (On)" : "Switch 1 (Off)";

    switch2.classList.toggle("on", switch2On);
    switch2.textContent = switch2On ? "Switch 2 (On)" : "Switch 2 (Off)";
}

function updateDoor() {
    if (switch1On && switch2On) {
        doorEl.classList.add("open");
        doorEl.textContent = "Door (Open)";
        doorSound.play();
        storySuccess();
    } else {
        doorEl.classList.remove("open");
        doorEl.textContent = "Door (Locked)";
    }
}

function saveStates() {
    localStorage.setItem("switch1", JSON.stringify(switch1On));
    localStorage.setItem("switch2", JSON.stringify(switch2On));
}

function storySuccess() {
    document.getElementById("story").textContent = "You restored the timeline!";
    clearInterval(timerInterval); 
}


timerInterval = setInterval(() => {
    timer--;
    timerEl.textContent = `Time left: ${timer}s`;

    if (timer <= 0) {
        clearInterval(timerInterval);
        document.getElementById("story").textContent = "You failed to fix the past!";
        disableGame();
    }
}, 1000);

function disableGame() {
    switch1.removeEventListener("click", switchHandler);
    switch2.removeEventListener("click", switchHandler);
    doorEl.classList.remove("open");
}

function resetGame() {
    localStorage.clear();
}