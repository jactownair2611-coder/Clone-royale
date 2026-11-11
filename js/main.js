
// ============================================
// ULTIMATE ROYALE
// MAIN GAME ENGINE - VERSION 0.2.0
// ============================================

import {
  world,
  buildings,
  trees,
  pois,
  drawWorld
} from "./world.js";

// ============================================
// CANVAS
// ============================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

// ============================================
// WORLD RENDER CACHE
// Draw the island once instead of every frame.
// ============================================

const worldCanvas = document.createElement("canvas");

worldCanvas.width = world.width;
worldCanvas.height = world.height;

const worldCtx = worldCanvas.getContext("2d");

drawWorld(worldCtx);

// ============================================
// CAMERA
// ============================================

const camera = {
  x: 0,
  y: 0
};

// ============================================
// INPUT
// ============================================

const keys = {};

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  keys[key] = true;

  if (["w", "a", "s", "d", " "].includes(key)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
  for (const key in keys) {
    keys[key] = false;
  }
});

// ============================================
// UTILITIES
// ============================================

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function insideIsland(x, y) {
  const dx = (x - 2000) / 1880;
  const dy = (y - 1600) / 1480;

  return dx * dx + dy * dy < 0.96;
}

// ============================================
// BUILDING COLLISION
// ============================================

function overlapsBuilding(x, y, radius) {

  for (const building of buildings) {

    const closestX = Math.max(
      building.x,
      Math.min(x, building.x + building.w)
    );

    const closestY = Math.max(
      building.y,
      Math.min(y, building.y + building.h)
    );

    const dx = x - closestX;
    const dy = y - closestY;

    if (dx * dx + dy * dy < radius * radius) {
      return true;
    }

  }

  return false;
}

// ============================================
// PLAYER
// ============================================

const player = {
  x: 2000,
  y: 1600,
  radius: 15,
  speed: 230,
  color: "#35a9ff",
  health: 100
};

// ============================================
// AI BOT SPAWNING
// ============================================

const bots = [];

const botNames = [
  "Shadow", "Raptor", "Falcon", "Blaze",
  "Ghost", "Hunter", "Storm", "Viper",
  "Ace", "Ranger", "Nova", "Titan"
];

function findBotSpawn() {

  for (let attempt = 0; attempt < 1000; attempt++) {

    const x = random(100, world.width - 100);
    const y = random(100, world.height - 100);

    if (
      insideIsland(x, y) &&
      !overlapsBuilding(x, y, 18) &&
      Math.hypot(x - player.x, y - player.y) > 180
    ) {
      return { x, y };
    }

  }

  return {
    x: 2000 + random(-250, 250),
    y: 1600 + random(-250, 250)
  };
}

for (let i = 0; i < 49; i++) {

  const spawn = findBotSpawn();

  bots.push({

    id: i + 1,

    name: botNames[i % botNames.length] + "_" + (i + 1),

    x: spawn.x,
    y: spawn.y,

    radius: 13,

    speed: random(65, 105),

    direction: random(0, Math.PI * 2),

    timer: random(1, 4),

    color: "#e75b59",

    alive: true,

    team: 0,

    state: "Wandering"

  });

}

// ============================================
// PLAYER UPDATE
// ============================================

function updatePlayer(dt) {

  let dx = 0;
  let dy = 0;

  if (keys["w"]) dy--;
  if (keys["s"]) dy++;
  if (keys["a"]) dx--;
  if (keys["d"]) dx++;

  const length = Math.hypot(dx, dy);

  if (length > 0) {
    dx /= length;
    dy /= length;
  }

  const sprint = keys["shift"] ? 1.5 : 1;
  const speed = player.speed * sprint;

  const nextX = player.x + dx * speed * dt;
  const nextY = player.y + dy * speed * dt;

  // Horizontal collision

  if (
    insideIsland(nextX, player.y) &&
    !overlapsBuilding(nextX, player.y, player.radius)
  ) {
    player.x = nextX;
  }

  // Vertical collision

  if (
    insideIsland(player.x, nextY) &&
    !overlapsBuilding(player.x, nextY, player.radius)
  ) {
    player.y = nextY;
  }

}

// ============================================
// AI BOT UPDATE
// ============================================

function updateBots(dt) {

  for (const bot of bots) {

    if (!bot.alive) continue;

    bot.timer -= dt;

    if (bot.timer <= 0) {

      bot.direction = random(0, Math.PI * 2);
      bot.timer = random(1.5, 4);

    }

    const dx = Math.cos(bot.direction);
    const dy = Math.sin(bot.direction);

    const nextX = bot.x + dx * bot.speed * dt;
    const nextY = bot.y + dy * bot.speed * dt;

    const blocked =
      !insideIsland(nextX, nextY) ||
      overlapsBuilding(nextX, nextY, bot.radius);

    if (!blocked) {

      bot.x = nextX;
      bot.y = nextY;

    } else {

      bot.direction = random(0, Math.PI * 2);
      bot.timer = 0.5;

    }

  }

}

// ============================================
// CAMERA UPDATE
// ============================================

function updateCamera() {

  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  camera.x = Math.max(
    0,
    Math.min(camera.x, world.width - canvas.width)
  );

  camera.y = Math.max(
    0,
    Math.min(camera.y, world.height - canvas.height)
  );

}

// ============================================
// DRAW CHARACTERS
// ============================================

function drawCharacter(character, isPlayer = false) {

  ctx.fillStyle = "rgba(0,0,0,0.3)";

  ctx.beginPath();

  ctx.ellipse(
    character.x + 3,
    character.y + 7,
    character.radius,
    character.radius * 0.7,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle = character.color;

  ctx.beginPath();

  ctx.arc(
    character.x,
    character.y,
    character.radius,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.strokeStyle = isPlayer ? "#ffffff" : "#752d2d";
  ctx.lineWidth = isPlayer ? 3 : 2;

  ctx.stroke();

  if (isPlayer) {

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      "YOU",
      character.x,
      character.y - 23
    );

  }

}

// ============================================
// DRAW MINIMAP
// ============================================

function drawMinimap() {

  const size = 155;

  const x = canvas.width - size - 18;
  const y = canvas.height - size - 18;

  ctx.fillStyle = "rgba(12,20,25,0.9)";
  ctx.fillRect(x - 6, y - 6, size + 12, size + 12);

  ctx.save();

  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();

  ctx.drawImage(
    worldCanvas,
    0,
    0,
    world.width,
    world.height,
    x,
    y,
    size,
    size
  );

  for (const bot of bots) {

    if (!bot.alive) continue;

    ctx.fillStyle = "#f15b55";

    ctx.fillRect(
      x + bot.x / world.width * size - 1,
      y + bot.y / world.height * size - 1,
      3,
      3
    );

  }

  ctx.fillStyle = "#39b8ff";

  ctx.beginPath();

  ctx.arc(
    x + player.x / world.width * size,
    y + player.y / world.height * size,
    4,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);

}

// ============================================
// RENDER
// ============================================

function render() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw only the visible portion of the island.

  ctx.drawImage(
    worldCanvas,
    camera.x,
    camera.y,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.save();

  ctx.translate(-camera.x, -camera.y);

  // AI bots

  for (const bot of bots) {

    if (bot.alive) {
      drawCharacter(bot);
    }

  }

  // Player

  drawCharacter(player, true);

  ctx.restore();

  drawMinimap();

}

// ============================================
// LOCATION DETECTION
// ============================================

function updateLocation() {

  let nearest = "Island";
  let nearestDistance = Infinity;

  for (const poi of pois) {

    const distance = Math.hypot(
      player.x - poi.x,
      player.y - poi.y
    );

    if (distance < nearestDistance) {

      nearestDistance = distance;
      nearest = poi.name;

    }

  }

  document.getElementById("poi").textContent =
    nearestDistance < 350 ? nearest : "Island";

}

// ============================================
// HUD
// ============================================

function updateHUD() {

  const aliveBots = bots.filter(bot => bot.alive).length;

  document.getElementById("players").textContent =
    aliveBots + 1;

  document.getElementById("health").textContent =
    player.health;

}

// ============================================
// GAME LOOP
// ============================================

let lastTime = performance.now();

function gameLoop(now) {

  let dt = (now - lastTime) / 1000;

  lastTime = now;

  dt = Math.min(dt, 0.05);

  updatePlayer(dt);
  updateBots(dt);
  updateCamera();

  render();
  updateLocation();
  updateHUD();

  requestAnimationFrame(gameLoop);

}

// ============================================
// START GAME
// ============================================

document.getElementById("status").textContent =
  "Version 0.2.0 | Island loaded | 49 AI bots deployed";

updateCamera();

requestAnimationFrame(gameLoop);

