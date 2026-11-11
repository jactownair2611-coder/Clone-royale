
 // ============================================
 // ULTIMATE ROYALE
 // LOOT ENGINE - VERSION 0.3.1
 // ============================================

import { world, buildings } from "./world.js";

export const loot = [];

export const lootTypes = {
  pistol: {
    name: "Pistol",
    category: "weapon",
    color: "#b8bdc5",
    rarity: "Common"
  },
  rifle: {
    name: "Assault Rifle",
    category: "weapon",
    color: "#55a86b",
    rarity: "Uncommon"
  },
  shotgun: {
    name: "Shotgun",
    category: "weapon",
    color: "#478bd2",
    rarity: "Rare"
  },
  sniper: {
    name: "Sniper Rifle",
    category: "weapon",
    color: "#a66bd1",
    rarity: "Epic"
  },
  ammo: {
    name: "Ammo",
    category: "ammo",
    color: "#e5c64d",
    rarity: "Common"
  },
  medkit: {
    name: "Medkit",
    category: "healing",
    color: "#e65b5b",
    rarity: "Uncommon"
  },
  shield: {
    name: "Shield Potion",
    category: "healing",
    color: "#54c9e8",
    rarity: "Rare"
  },
  chest: {
    name: "Supply Chest",
    category: "chest",
    color: "#e8b84e",
    rarity: "Rare"
  }
};

// ============================================
// RANDOM HELPERS
// ============================================

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function insideIsland(x, y) {
  const dx = (x - 2000) / 1880;
  const dy = (y - 1600) / 1480;
  return dx * dx + dy * dy < 0.90;
}

function overlapsBuilding(x, y, radius = 20) {
  return buildings.some(b => {
    const closestX = Math.max(b.x, Math.min(x, b.x + b.w));
    const closestY = Math.max(b.y, Math.min(y, b.y + b.h));

    const dx = x - closestX;
    const dy = y - closestY;

    return dx * dx + dy * dy < radius * radius;
  });
}

// ============================================
// LOOT SPAWNING
// ============================================

function findLootPosition() {
  for (let attempt = 0; attempt < 300; attempt++) {
    const x = random(130, world.width - 130);
    const y = random(130, world.height - 130);

    if (
      insideIsland(x, y) &&
      !overlapsBuilding(x, y, 35)
    ) {
      return { x, y };
    }
  }

  return { x: 2000, y: 1600 };
}

function addLoot(type, x, y, amount = 1) {
  loot.push({
    id: loot.length + 1,
    type,
    x,
    y,
    amount,
    radius: 13,
    collected: false
  });
}

export function spawnLoot() {
  loot.length = 0;

  const spawnCounts = {
    pistol: 45,
    rifle: 35,
    shotgun: 20,
    sniper: 12,
    ammo: 100,
    medkit: 40,
    shield: 30,
    chest: 25
  };

  for (const [type, count] of Object.entries(spawnCounts)) {
    for (let i = 0; i < count; i++) {
      const position = findLootPosition();

      const amount = type === "ammo"
        ? Math.floor(random(20, 61))
        : 1;

      addLoot(type, position.x, position.y, amount);
    }
  }

  console.log("LOOT SYSTEM:", loot.length, "items spawned");
}

// ============================================
// DRAW LOOT
// ============================================

export function drawLoot(ctx) {
  for (const item of loot) {
    if (item.collected) continue;

    const info = lootTypes[item.type];

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(
      item.x + 3,
      item.y + 6,
      13,
      7,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Loot background
    ctx.fillStyle = info.color;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Simple icon
    ctx.fillStyle = "#17232b";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const icons = {
      pistol: "P",
      rifle: "R",
      shotgun: "S",
      sniper: "N",
      ammo: "A",
      medkit: "+",
      shield: "D",
      chest: "C"
    };

    ctx.fillText(icons[item.type], item.x, item.y);
  }
}

// ============================================
// FIND NEAREST LOOT
// ============================================

export function findNearbyLoot(x, y, maxDistance = 55) {
  let nearest = null;
  let nearestDistance = maxDistance;

  for (const item of loot) {
    if (item.collected) continue;

    const distance = Math.hypot(
      x - item.x,
      y - item.y
    );

    if (distance < nearestDistance) {
      nearest = item;
      nearestDistance = distance;
    }
  }

  return nearest;
}

// ============================================
// REMOVE COLLECTED LOOT
// ============================================

export function collectLoot(item) {
  if (!item || item.collected) return false;

  item.collected = true;
  return true;
}
