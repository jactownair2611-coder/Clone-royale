
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
import {
  createInterior,
  drawInterior
} from "./interiors.js";
import {
  generateLoot,
  drawLoot,
  findNearbyLoot,
  removeLoot,
  openChest
} from "./loot.js";;
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
// LOOT GENERATION - VERSION 0.3.1
// ============================================

generateLoot(buildings, world);
// ============================================
// CAMERA
// ============================================

const camera = {
  x: 0,
  y: 0,
  zoom: 2.4
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

  if (key === "e" && !event.repeat) {
    if (isIndoors()) {
      tryExitBuilding();
    } else if (!interactWithLoot()) {
      tryEnterBuilding();
    }
  }
});
window.addEventListener("keyup", event => {
  const key = event.key.toLowerCase();
  keys[key] = false;
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
// TREE COLLISION
// ============================================

function overlapsTree(x, y, radius) {

  for (const tree of trees) {

    const dx = x - tree.x;
    const dy = y - tree.y;

    const collisionRadius = radius + tree.radius * 0.75;

    if (
      dx * dx + dy * dy <
      collisionRadius * collisionRadius
    ) {
      return true;
    }

  }

  return false;
}

// ============================================
// BUILDING ENTRY AND EXIT
// ============================================

function tryEnterBuilding() {

  if (isIndoors()) return;

  for (const building of buildings) {

    // Entrance is centered along the south side.
    const entranceX = building.x + building.w / 2;
    const entranceY = building.y + building.h + 25;

    const distance = Math.hypot(
      player.x - entranceX,
      player.y - entranceY
    );

    if (distance < 75) {

      currentBuilding = building;
      currentInterior = createInterior(building);

      interiorCanvas = document.createElement("canvas");
      interiorCanvas.width = currentInterior.width;
      interiorCanvas.height = currentInterior.height;

      const interiorCtx = interiorCanvas.getContext("2d");
      drawInterior(interiorCtx, currentInterior);

      interiorPlayer = {
  x: 450,
  y: 570,
  radius: 15,
  speed: 190,
  color: "#35a9ff"
};

      document.getElementById("status").textContent =
        "Inside: " + currentInterior.name + " | Press E near EXIT to leave";

      return;
    }
  }

}

function tryExitBuilding() {

  if (!isIndoors()) return;

  const exit = currentInterior.exit;

  const nearExit =
    interiorPlayer.x + interiorPlayer.radius > exit.x &&
    interiorPlayer.x - interiorPlayer.radius < exit.x + exit.w &&
    Math.abs(interiorPlayer.y - exit.y) < 45;

  if (!nearExit) return;

  // Return outside, just south of the building.
  player.x = currentBuilding.x + currentBuilding.w / 2;
  player.y = currentBuilding.y + currentBuilding.h + 35;

  currentBuilding = null;
  currentInterior = null;
  interiorCanvas = null;
  interiorPlayer = null;

  updateCamera();

  document.getElementById("status").textContent =
    "Version 0.2.1 | Back outside | 49 AI bots deployed";

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
// PLAYER INVENTORY - VERSION 0.3.1
// ============================================

const inventory = {
  weapons: [],
  maxWeapons: 4,
  ammo: {},
  medkits: 0,
  shields: 0
};

// ============================================
// LOOT INTERACTION
// ============================================


function interactWithLoot() {
  const item = findNearbyLoot(player.x, player.y, 65);

  if (!item) return false;

  // Open supply chest.
  if (item.type === "chest") {
    const rewards = openChest(item);

    document.getElementById("status").textContent =
      "Supply chest opened! " + rewards.length + " rewards released.";

    return true;
  }

  // Collect weapons.
  if (item.type === "weapon") {
    inventory.weapons.push({
      name: item.name,
      category: item.category,
      rarity: item.rarity,
      damage: item.damage,
      fireRate: item.fireRate,
      magazine: item.magazine,
      icon: item.icon
    });
  }

  // Collect ammunition.
  if (item.type === "ammo") {
    inventory.ammo[item.name] =
      (inventory.ammo[item.name] || 0) + item.amount;
  }

  // Collect medkits.
  if (item.type === "medkit") {
    inventory.medkits++;
  }

  // Collect shield potions.
  if (item.type === "shield") {
    inventory.shields++;
  }

  removeLoot(item.id);

  document.getElementById("status").textContent =
    "Collected: " + item.name;

  return true;
}

// ============================================
// INVENTORY HUD
// ============================================

function drawInventoryHUD() {
  const x = 18;
  const y = canvas.height - 142;

  ctx.save();

  ctx.fillStyle = "rgba(10,18,28,0.88)";
  ctx.fillRect(x, y, 285, 124);

  ctx.strokeStyle = "#8295a8";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 285, 124);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px Arial";
  ctx.textAlign = "left";

  ctx.fillText("INVENTORY", x + 12, y + 21);

  ctx.font = "13px Arial";

  ctx.fillText(
    "Weapon 1: " + (inventory.weapons[0]?.name || "Empty"),
    x + 12, y + 44
  );

  ctx.fillText(
    "Weapon 2: " + (inventory.weapons[1]?.name || "Empty"),
    x + 12, y + 63
  );

  ctx.fillText(
    "Medkits: " + inventory.medkits +
    "    Shields: " + inventory.shields,
    x + 12, y + 84
  );

  const ammoTotal = Object.values(inventory.ammo)
    .reduce((total, amount) => total + amount, 0);

  ctx.fillText(
    "Total ammo: " + ammoTotal,
    x + 12, y + 105
  );

  ctx.restore();
}
// ============================================
// BUILDING INTERIOR STATE
// ============================================

let currentBuilding = null;
let currentInterior = null;
let interiorCanvas = null;
let interiorPlayer = null;

function isIndoors() {
  return currentInterior !== null;
}
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
!overlapsTree(x, y, 18) &&
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

function interiorBlocked(x, y) {
  const radius = interiorPlayer.radius;

  if (
    x < radius + 22 ||
    x > currentInterior.width - radius - 22 ||
    y < radius + 22 ||
    y > currentInterior.height - radius
  ) {
    return true;
  }

  for (const wall of currentInterior.walls) {
    const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
    const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));

    const dx = x - closestX;
    const dy = y - closestY;

    if (dx * dx + dy * dy < radius * radius) {
      return true;
    }
  }

  for (const item of currentInterior.furniture) {
    if (item.type === "walkway") continue;

    const closestX = Math.max(item.x, Math.min(x, item.x + item.w));
    const closestY = Math.max(item.y, Math.min(y, item.y + item.h));

    const dx = x - closestX;
    const dy = y - closestY;

    if (dx * dx + dy * dy < radius * radius) {
      return true;
    }
  }

  return false;
}

function updateInteriorPlayer(dt) {
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

  const speed = interiorPlayer.speed * (keys["shift"] ? 1.5 : 1);

  const nextX = interiorPlayer.x + dx * speed * dt;
  const nextY = interiorPlayer.y + dy * speed * dt;

  if (!interiorBlocked(nextX, interiorPlayer.y)) {
    interiorPlayer.x = nextX;
  }

  if (!interiorBlocked(interiorPlayer.x, nextY)) {
    interiorPlayer.y = nextY;
  }
}


function updatePlayer(dt) {

  // INTERIOR MOVEMENT
  // When indoors, update the interior character instead.
  if (isIndoors()) {
    updateInteriorPlayer(dt);
    return;
  }

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

  if (
  insideIsland(nextX, player.y) &&
  !overlapsBuilding(nextX, player.y, player.radius) &&
  !overlapsTree(nextX, player.y, player.radius)
) { 
    player.x = nextX;
  }

  if (
  insideIsland(player.x, nextY) &&
  !overlapsBuilding(player.x, nextY, player.radius) &&
  !overlapsTree(player.x, nextY, player.radius)
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
  overlapsBuilding(nextX, nextY, bot.radius) ||
  overlapsTree(nextX, nextY, bot.radius);
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

  const viewWidth = canvas.width / camera.zoom;
  const viewHeight = canvas.height / camera.zoom;

  camera.x = player.x - viewWidth / 2;
  camera.y = player.y - viewHeight / 2;

  camera.x = Math.max(
    0,
    Math.min(camera.x, world.width - viewWidth)
  );

  camera.y = Math.max(
    0,
    Math.min(camera.y, world.height - viewHeight)
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
  // ==========================================
  // INTERIOR RENDERING
  // ==========================================

  if (isIndoors()) {

    const scale = Math.min(
      canvas.width / currentInterior.width,
      canvas.height / currentInterior.height
    );

    const offsetX =
      (canvas.width - currentInterior.width * scale) / 2;

    const offsetY =
      (canvas.height - currentInterior.height * scale) / 2;

    ctx.save();

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.drawImage(interiorCanvas, 0, 0);

    drawCharacter(interiorPlayer, true);

    ctx.restore();

    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(15, 85, 300, 38);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "left";

    ctx.fillText(
      "WASD: Move | E: Exit",
      27,
      109
    );

    return;
  }
  
// Draw the zoomed-in portion of the island.

const viewWidth = canvas.width / camera.zoom;
const viewHeight = canvas.height / camera.zoom;

ctx.drawImage(
  worldCanvas,
  camera.x,
  camera.y,
  viewWidth,
  viewHeight,
  0,
  0,
  canvas.width,
  canvas.height
);

// Apply the same zoom to characters and loot.

ctx.save();

ctx.scale(camera.zoom, camera.zoom);
ctx.translate(-camera.x, -camera.y);

// Draw ground loot and supply chests
drawLoot(ctx);
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
  if (isIndoors()) {

    document.getElementById("poi").textContent =
      currentInterior.name;

    return;
  }
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

