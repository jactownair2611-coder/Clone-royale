
// ============================================
// ULTIMATE ROYALE
// LOOT ENGINE - VERSION 0.3.1
// ============================================

import { isClearLootLocation } from "./world.js";

export const lootItems = [];

let nextLootId = 1;

const rarities = {
  common: {
    color: "#b8c2cc",
    multiplier: 1
  },
  uncommon: {
    color: "#45c96b",
    multiplier: 1.2
  },
  rare: {
    color: "#398cff",
    multiplier: 1.5
  },
  epic: {
    color: "#b34cff",
    multiplier: 1.8
  },
  legendary: {
    color: "#ffae32",
    multiplier: 2.2
  }
};
// ============================================
// WEAPON DATABASE
// ============================================

export const weaponDatabase = [
  // ASSAULT RIFLES
  {
    name: "AR-15",
    category: "Assault Rifle",
    damage: 25,
    fireRate: 8,
    magazine: 30,
    icon: "ar"
  },
  {
    name: "AK-47",
    category: "Assault Rifle",
    damage: 32,
    fireRate: 6,
    magazine: 30,
    icon: "ak"
  },
  {
    name: "Tactical AR",
    category: "Assault Rifle",
    damage: 23,
    fireRate: 9,
    magazine: 35,
    icon: "tactical-ar"
  },

  // PISTOLS
  {
    name: "Pistol",
    category: "Pistol",
    damage: 18,
    fireRate: 4,
    magazine: 15,
    icon: "pistol"
  },
  {
    name: "Heavy Pistol",
    category: "Pistol",
    damage: 35,
    fireRate: 2,
    magazine: 8,
    icon: "heavy-pistol"
  },
  {
    name: "Revolver",
    category: "Pistol",
    damage: 42,
    fireRate: 1.5,
    magazine: 6,
    icon: "revolver"
  },

  // SNIPERS
  {
    name: "Bolt Sniper",
    category: "Sniper",
    damage: 85,
    fireRate: 0.8,
    magazine: 5,
    icon: "bolt-sniper"
  },
  {
    name: "Semi-Auto Sniper",
    category: "Sniper",
    damage: 55,
    fireRate: 2,
    magazine: 10,
    icon: "semi-sniper"
  },
  {
    name: "DMR",
    category: "Sniper",
    damage: 45,
    fireRate: 3,
    magazine: 12,
    icon: "dmr"
  },

  // SHOTGUNS
  {
    name: "Pump Shotgun",
    category: "Shotgun",
    damage: 70,
    fireRate: 1,
    magazine: 5,
    icon: "pump"
  },
  {
    name: "Tactical Shotgun",
    category: "Shotgun",
    damage: 48,
    fireRate: 2,
    magazine: 8,
    icon: "tactical-shotgun"
  },
  {
    name: "Double Barrel",
    category: "Shotgun",
    damage: 90,
    fireRate: 0.7,
    magazine: 2,
    icon: "double-barrel"
  },

  // SMGS
  {
    name: "Compact SMG",
    category: "SMG",
    damage: 17,
    fireRate: 12,
    magazine: 30,
    icon: "compact-smg"
  },
  {
    name: "Tactical SMG",
    category: "SMG",
    damage: 19,
    fireRate: 10,
    magazine: 35,
    icon: "tactical-smg"
  },
  {
    name: "Suppressed SMG",
    category: "SMG",
    damage: 16,
    fireRate: 9,
    magazine: 30,
    icon: "suppressed-smg"
  }
];
function random(min, max) {
  return Math.random() * (max - min) + min;
}

function choose(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function findClearLootLocation(world, minX = 100, maxX = world.width - 100,
  minY = 100, maxY = world.height - 100) {

  for (let attempt = 0; attempt < 80; attempt++) {
    const x = random(minX, maxX);
    const y = random(minY, maxY);

    if (isClearLootLocation(x, y, 32)) {
      return { x, y };
    }
  }

  return null;
}

function chooseRarity() {
  const roll = Math.random();

  if (roll < 0.48) return "common";
  if (roll < 0.75) return "uncommon";
  if (roll < 0.91) return "rare";
  if (roll < 0.98) return "epic";

  return "legendary";
}

function createItem(type, x, y, rarity = "common") {
  const item = {
    id: nextLootId++,
    type,
    x,
    y,
    rarity,
    radius: type === "chest" ? 17 : 12,
    opened: false
  };

  if (type === "weapon") {
  const weapon = choose(weaponDatabase);

  item.name = weapon.name;
  item.category = weapon.category;
  item.damage = weapon.damage;
  item.fireRate = weapon.fireRate;
  item.magazine = weapon.magazine;
  item.icon = weapon.icon;
}

  if (type === "ammo") {
    item.name = choose([
      "Light Ammo",
      "Medium Ammo",
      "Heavy Ammo",
      "Shells"
    ]);

    item.amount = Math.floor(random(20, 61));
  }

  if (type === "medkit") {
    item.name = "Medkit";
    item.amount = 50;
  }

  if (type === "shield") {
    item.name = "Shield Potion";
    item.amount = 25;
  }

  if (type === "chest") {
    item.name = "Supply Chest";
  }

  return item;
}

// ============================================
// LOOT GENERATION
// ============================================

export function generateLoot(buildings, world) {
  lootItems.length = 0;
  nextLootId = 1;

  let failedSpawns = 0;

  // ========================================
  // BUILDING-AREA LOOT
  // ========================================

  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i];

    const itemCount = Math.floor(random(3, 7));
    let weaponSpawned = false;

    for (let j = 0; j < itemCount; j++) {
      // Try to find clear ground around this building.
      const location = findClearLootLocation(
        world,
        building.x - 130,
        building.x + building.w + 130,
        building.y - 130,
        building.y + building.h + 130
      );

      if (!location) {
        failedSpawns++;
        continue;
      }

      let type;

      if (!weaponSpawned) {
        type = "weapon";
        weaponSpawned = true;
      } else {
        const roll = Math.random();

        if (roll < 0.30) type = "weapon";
        else if (roll < 0.65) type = "ammo";
        else if (roll < 0.83) type = "medkit";
        else type = "shield";
      }

      lootItems.push(
        createItem(type, location.x, location.y, chooseRarity())
      );
    }

    // Chests now spawn only on validated clear ground.
    if (i % 7 === 0 && Math.random() < 0.65) {
      const location = findClearLootLocation(
        world,
        building.x - 180,
        building.x + building.w + 180,
        building.y - 180,
        building.y + building.h + 180
      );

      if (location) {
        lootItems.push(
          createItem("chest", location.x, location.y)
        );
      } else {
        failedSpawns++;
      }
    }
  }

  // ========================================
  // EXTRA ISLAND LOOT
  // ========================================

  for (let i = 0; i < 100; i++) {
    const location = findClearLootLocation(world);

    if (!location) {
      failedSpawns++;
      continue;
    }

    const roll = Math.random();

    let type;

    if (roll < 0.40) type = "weapon";
    else if (roll < 0.70) type = "ammo";
    else if (roll < 0.85) type = "medkit";
    else type = "shield";

    lootItems.push(
      createItem(type, location.x, location.y, chooseRarity())
    );
  }

  console.log("ULTIMATE ROYALE LOOT SYSTEM");
  console.log("Total loot:", lootItems.length);
  console.log(
    "Weapons:",
    lootItems.filter(item => item.type === "weapon").length
  );
  console.log(
    "Chests:",
    lootItems.filter(item => item.type === "chest").length
  );
  console.log("Failed placements:", failedSpawns);
}


  // ========================================
  // BUILDING LOOT
  // ========================================

  for (let i = 0; i < availableBuildings.length; i++) {

    const building = availableBuildings[i];

    const centerX = building.x + building.w / 2;
    const centerY = building.y + building.h / 2;

    // Generate 3-6 ground items per building.
    const itemCount = Math.floor(random(3, 7));

    let weaponSpawned = false;

    for (let j = 0; j < itemCount; j++) {

      const side = Math.floor(random(0, 4));

      let x;
      let y;

      if (side === 0) {
        x = random(building.x, building.x + building.w);
        y = building.y - random(30, 80);
      } else if (side === 1) {
        x = random(building.x, building.x + building.w);
        y = building.y + building.h + random(30, 80);
      } else if (side === 2) {
        x = building.x - random(30, 80);
        y = random(building.y, building.y + building.h);
      } else {
        x = building.x + building.w + random(30, 80);
        y = random(building.y, building.y + building.h);
      }

      x = Math.max(25, Math.min(world.width - 25, x));
      y = Math.max(25, Math.min(world.height - 25, y));

      let type;

      // Guarantee at least one weapon per building.
      if (!weaponSpawned) {
        type = "weapon";
        weaponSpawned = true;
      } else {
        const roll = Math.random();

        if (roll < 0.30) {
          type = "weapon";
        } else if (roll < 0.65) {
          type = "ammo";
        } else if (roll < 0.83) {
          type = "medkit";
        } else {
          type = "shield";
        }
      }

      lootItems.push(
        createItem(type, x, y, chooseRarity())
      );
    }

    // Supply chests are less common.
    if (i % 7 === 0 && Math.random() < 0.65) {

      lootItems.push(
        createItem(
          "chest",
          centerX + random(-60, 60),
          centerY + random(-60, 60)
        )
      );
    }
  }

  // ========================================
  // EXTRA SCATTERED ISLAND LOOT
  // ========================================

  const extraLootCount = 100;

  for (let i = 0; i < extraLootCount; i++) {

    const x = random(100, world.width - 100);
    const y = random(100, world.height - 100);

    const roll = Math.random();

    let type;

    if (roll < 0.40) {
      type = "weapon";
    } else if (roll < 0.70) {
      type = "ammo";
    } else if (roll < 0.85) {
      type = "medkit";
    } else {
      type = "shield";
    }

    lootItems.push(
      createItem(type, x, y, chooseRarity())
    );
  }

  // ========================================
  // LOOT STATISTICS
  // ========================================

  const weaponCount = lootItems.filter(
    item => item.type === "weapon"
  ).length;

  const chestCount = lootItems.filter(
    item => item.type === "chest"
  ).length;

  console.log("ULTIMATE ROYALE LOOT SYSTEM");
  console.log("Total loot:", lootItems.length);
  console.log("Weapons:", weaponCount);
  console.log("Chests:", chestCount);
}

// ============================================
// FIND NEAREST LOOT
// ============================================

export function findNearbyLoot(x, y, radius = 65) {
  let closest = null;
  let closestDistance = radius;

  for (const item of lootItems) {
    const distance = Math.hypot(
      item.x - x,
      item.y - y
    );

    if (distance < closestDistance) {
      closest = item;
      closestDistance = distance;
    }
  }

  return closest;
}

// ============================================
// REMOVE PICKED-UP ITEM
// ============================================

export function removeLoot(id) {
  const index = lootItems.findIndex(
    item => item.id === id
  );

  if (index === -1) return false;

  lootItems.splice(index, 1);

  return true;
}

// ============================================
// OPEN SUPPLY CHEST
// ============================================

export function openChest(chest) {
  if (!chest || chest.type !== "chest") return [];

  if (chest.opened) return [];

  chest.opened = true;

  removeLoot(chest.id);

  const rewards = [];

  const rewardTypes = [
    "weapon",
    "ammo",
    "medkit",
    "shield"
  ];

  for (let i = 0; i < 3; i++) {
    const type = choose(rewardTypes);

    const reward = createItem(
      type,
      chest.x + random(-35, 35),
      chest.y + random(-35, 35),
      chooseRarity()
    );

    lootItems.push(reward);
    rewards.push(reward);
  }

  return rewards;
}

// ============================================
// DRAW LOOT
// ============================================

function drawWeaponIcon(ctx, item) {
  ctx.save();

  ctx.translate(item.x, item.y);
  ctx.rotate(-Math.PI / 4);

  ctx.fillStyle = "#e5edf5";
  ctx.strokeStyle = "#101820";
  ctx.lineWidth = 1.5;

  const category = item.category;

  if (category === "Pistol") {
    ctx.fillRect(-10, -3, 19, 6);
    ctx.fillRect(-5, 2, 7, 9);
    ctx.fillRect(7, -2, 5, 4);

  } else if (category === "Sniper") {
    ctx.fillRect(-16, -2, 32, 4);
    ctx.fillRect(-4, 2, 8, 5);
    ctx.fillRect(-3, -5, 7, 3);
    ctx.fillRect(-15, -1, 5, 2);

  } else if (category === "Shotgun") {
    ctx.fillRect(-15, -3, 29, 6);
    ctx.fillRect(-4, 2, 9, 8);
    ctx.fillRect(8, -1, 8, 3);

  } else if (category === "SMG") {
    ctx.fillRect(-13, -3, 25, 6);
    ctx.fillRect(-3, 2, 7, 8);
    ctx.fillRect(5, -5, 5, 3);

  } else {
    // Assault rifle.
    ctx.fillRect(-15, -3, 30, 6);
    ctx.fillRect(-5, 2, 8, 9);
    ctx.fillRect(1, -6, 9, 3);
    ctx.fillRect(12, -1, 7, 3);
  }

  ctx.restore();
}

export function drawLoot(ctx) {
  for (const item of lootItems) {
    const rarity =
      rarities[item.rarity] || rarities.common;

    ctx.save();

    // Ground shadow.
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(
      item.x + 2,
      item.y + 7,
      item.radius + 3,
      item.radius * 0.65,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (item.type === "chest") {
      // Supply chest.
      ctx.fillStyle = item.opened
        ? "#77502c"
        : "#b77a35";

      ctx.fillRect(
        item.x - 15,
        item.y - 11,
        30,
        23
      );

      ctx.fillStyle = "#e5b75c";
      ctx.fillRect(
        item.x - 15,
        item.y - 3,
        30,
        5
      );

      ctx.fillStyle = "#fff0b0";
      ctx.fillRect(
        item.x - 3,
        item.y - 3,
        6,
        6
      );

      ctx.strokeStyle = "#51351d";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        item.x - 15,
        item.y - 11,
        30,
        23
      );

    } else {
      // Item rarity glow.
      ctx.fillStyle = rarity.color;
      ctx.globalAlpha = 0.22;

      ctx.beginPath();
      ctx.arc(
        item.x,
        item.y,
        item.radius + 7,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.globalAlpha = 1;

      // Item background.
      ctx.fillStyle = "#202a35";
      ctx.beginPath();
      ctx.arc(
        item.x,
        item.y,
        item.radius + 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Rarity border.
      ctx.strokeStyle = rarity.color;
      ctx.lineWidth = 3;
      ctx.stroke();

     
// Item icon.
if (item.type === "weapon") {
  drawWeaponIcon(ctx, item);
} else {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let symbol = "?";

  if (item.type === "ammo") symbol = "A";
  if (item.type === "medkit") symbol = "+";
  if (item.type === "shield") symbol = "S";

  ctx.fillText(symbol, item.x, item.y + 1);
}

    }

    ctx.restore();
  }
}
