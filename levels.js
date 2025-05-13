// Level definitions (merged from levels.js)
const LEVELS = {
  1: {
    playerStart: { x: 100, y: 400 },
    platforms: [
      { x: 0, y: 470, width: 800, height: 30 },
      { x: 0, y: 0, width: 800, height: 30 },
      { x: 300, y: 350, width: 150, height: 10 },
      { x: 550, y: 250, width: 150, height: 10 }
    ],
    spikes: [],
    checkpoints: [],
    door: { x: 720, y: 190, width: 40, height: 60 }
  },
  2: {
    playerStart: { x: 50, y: 400 },
    platforms: [
      { x: 0, y: 470, width: 800, height: 30 },
      { x: 0, y: 0, width: 800, height: 30 },
      { x: 100, y: 350, width: 100, height: 10 },
      { x: 250, y: 300, width: 100, height: 10 },
      { x: 400, y: 250, width: 100, height: 10 }
    ],
    spikes: [
      { x: 200, y: 460, width: 20, height: 10 },
      { x: 220, y: 460, width: 20, height: 10 }
    ],
    checkpoints: [
      { x: 400, y: 230, width: 20, height: 20 }
    ],
    door: { x: 700, y: 190, width: 40, height: 60 }
  }
};
