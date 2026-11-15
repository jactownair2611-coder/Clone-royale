
// ============================================
// ULTIMATE ROYALE
// WORLD ENGINE - VERSION 0.3.0
// VISUAL REVOLUTION
// ============================================

export const world = { width: 4000, height: 3200 };

export const buildings = [];
export const trees = [];
export const roads = [];
export const pois = [];

let seed = 72841;

function random(min, max) {
  seed = (seed * 16807) % 2147483647;
  return min + (seed / 2147483647) * (max - min);
}

function insideIsland(x, y, margin = 0) {
  const dx = (x - 2000) / (1880 - margin);
  const dy = (y - 1600) / (1480 - margin);
  return dx * dx + dy * dy < 1;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy || 1;

  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq)
  );

  return Math.hypot(
    px - (ax + t * dx),
    py - (ay + t * dy)
  );
}

function nearRoad(x, y, padding = 0) {
  return roads.some(road => {
    for (let i = 0; i < road.points.length - 1; i++) {
      const a = road.points[i];
      const b = road.points[i + 1];

      if (
        distanceToSegment(x, y, a[0], a[1], b[0], b[1]) <
        road.width / 2 + padding
      ) return true;
    }

    return false;
  });
}

// ============================================
// POINTS OF INTEREST
// ============================================

const locations = [
  { name: "GRAND CITY", x: 850, y: 800, type: "city" },
  { name: "INTERNATIONAL AIRPORT", x: 2900, y: 550, type: "airport" },
  { name: "MILITARY BASE", x: 3200, y: 1450, type: "military" },
  { name: "SEASIDE HARBOR", x: 650, y: 2550, type: "harbor" },
  { name: "POWER PLANT", x: 2000, y: 650, type: "industrial" },
  { name: "PINEWOOD SUBURBS", x: 1250, y: 1700, type: "suburbs" },
  { name: "RESEARCH FACILITY", x: 2800, y: 2400, type: "research" },
  { name: "MEGA MALL", x: 1900, y: 2550, type: "mall" }
];

pois.push(...locations);

 // ============================================
 // ROAD NETWORK - VERSION 0.4.1
 // ============================================

roads.push(
  {
    points: [
      [250,1250],
      [700,1200],
      [1150,1240],
      [1600,1280],
      [2100,1250],
      [2600,1190],
      [3150,1160],
      [3750,1250]
    ],
    width: 70,
    type: "highway"
  },
  {
    points: [
      [300,350],
      [900,350],
      [1500,390],
      [2100,390],
      [2400,420]
    ],
    width: 38,
    type: "road"
  },
  {
    points: [
      [300,2850],
      [900,2800],
      [1500,2820],
      [2100,2850],
      [2700,2800],
      [3300,2820],
      [3700,2850]
    ],
    width: 42,
    type: "road"
  }
);


 // ============================================
 // BUILDING GENERATION - VERSION 0.4.1
 // ============================================

function overlapsExisting(x, y, w, h, gap = 30) {
  return buildings.some(b =>
    x < b.x + b.w + gap &&
    x + w + gap > b.x &&
    y < b.y + b.h + gap &&
    y + h + gap > b.y
  );
}

function addBuilding(x, y, w, h, type, style = 0) {
  const building = {
    x, y, w, h, type,
    style: Math.floor(style) % 4
  };

  buildings.push(building);
  return building;
}

function tryBuilding(x, y, w, h, type, gap = 30) {

  if (!insideIsland(x + w / 2, y + h / 2, 70)) {
    return false;
  }

  if (
    nearRoad(
      x + w / 2,
      y + h / 2,
      Math.max(w, h) * 0.55
    )
  ) {
    return false;
  }

  if (overlapsExisting(x, y, w, h, gap)) {
    return false;
  }

  addBuilding(x, y, w, h, type, random(0, 4));
  return true;
}

// ============================================
// GRAND CITY
// ============================================

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {

    const x = 480 + col * 240;
    const y = 480 + row * 220;

    tryBuilding(x, y, 210, 180, "city", 30);
  }
}

// ============================================
// PINEWOOD SUBURBS
// ============================================

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {

    const x = 900 + col * 210;
    const y = 1600 + row * 180;

    tryBuilding(x, y, 180, 150, "house", 30);
  }
}

// ============================================
// INTERNATIONAL AIRPORT
// ============================================

// Large aircraft hangars

for (let row = 0; row < 2; row++) {
  for (let col = 0; col < 3; col++) {

    const x = 2520 + col * 300;
    const y = 500 + row * 230;

    tryBuilding(x, y, 270, 190, "hangar", 30);
  }
}

// Main terminal

tryBuilding(
  2670, 960,
  500, 210,
  "terminal",
  40
);

// ============================================
// MILITARY BASE
// ============================================

for (let row = 0; row < 2; row++) {
  for (let col = 0; col < 2; col++) {

    const x = 2920 + col * 310;
    const y = 1360 + row * 240;

    tryBuilding(x, y, 260, 190, "military", 35);
  }
}

// ============================================
// POWER PLANT
// ============================================

for (let row = 0; row < 2; row++) {
  for (let col = 0; col < 3; col++) {

    const x = 1710 + col * 290;
    const y = 520 + row * 240;

    tryBuilding(x, y, 250, 190, "industrial", 35);
  }
}

// ============================================
// SEASIDE HARBOR
// ============================================

tryBuilding(380, 2440, 300, 210, "warehouse", 40);
tryBuilding(720, 2450, 280, 200, "warehouse", 40);

// ============================================
// RESEARCH FACILITY
// ============================================

tryBuilding(2570, 2200, 260, 190, "research", 35);
tryBuilding(2870, 2200, 260, 190, "research", 35);
tryBuilding(2720, 2440, 280, 200, "research", 35);

// ============================================
// MEGA MALL
// ============================================

tryBuilding(
  1600, 2280,
  520, 360,
  "mall",
  50
);

// ============================================
// AIRPORT RUNWAYS
// ============================================

export const runways = [
  { x: 2550, y: 150, width: 700, height: 75 },
  { x: 2500, y: 275, width: 600, height: 55 }
];

// ============================================
// TREES
// ============================================

for (let i = 0; i < 1450; i++) {
  const x = random(100, world.width - 100);
  const y = random(100, world.height - 100);

  if (!insideIsland(x, y, 45)) continue;
  if (nearRoad(x, y, 45)) continue;

  if (
    locations.some(p => Math.hypot(x - p.x, y - p.y) < 360)
  ) continue;

  if (
    buildings.some(b =>
      x > b.x - 75 &&
      x < b.x + b.w + 75 &&
      y > b.y - 75 &&
      y < b.y + b.h + 75
    )
  ) continue;

  trees.push({
    x,
    y,
    radius: random(13, 24),
    variation: random(0, 1),
    cluster: Math.floor(random(0, 3))
  });
}

// ============================================
// DRAW HELPERS
// ============================================

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function seededVisualRandom(min, max) {
  return random(min, max);
}

// ============================================
// WATER
// ============================================

function drawWater(ctx) {
  ctx.fillStyle = "#56b9d2";
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = "rgba(225,249,250,0.20)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 520; i++) {
    const x = seededVisualRandom(0, world.width);
    const y = seededVisualRandom(0, world.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 8, y - 3, x + 19, y);
    ctx.stroke();
  }
}

// ============================================
// ISLAND AND BEACH
// ============================================

function drawIsland(ctx) {
  ctx.save();

  ctx.fillStyle = "#d9c58f";
  ctx.beginPath();
  ctx.ellipse(2000, 1600, 1880, 1480, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e9d5a0";
  ctx.beginPath();
  ctx.ellipse(2000, 1600, 1855, 1455, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#83b96a";
  ctx.beginPath();
  ctx.ellipse(2000, 1600, 1815, 1415, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 240; i++) {
    const x = seededVisualRandom(180, 3820);
    const y = seededVisualRandom(180, 3020);

    if (!insideIsland(x, y, 80)) continue;

    ctx.fillStyle = i % 2
      ? "rgba(111,169,91,0.12)"
      : "rgba(158,194,111,0.13)";

    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      seededVisualRandom(18, 55),
      seededVisualRandom(12, 35),
      random(-1, 1),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}

// ============================================
// GRASS
// ============================================

function drawGrass(ctx) {
  for (let i = 0; i < 3300; i++) {
    const x = seededVisualRandom(90, 3910);
    const y = seededVisualRandom(90, 3110);

    if (!insideIsland(x, y, 65)) continue;

    ctx.fillStyle = i % 3 === 0
      ? "rgba(48,105,57,0.13)"
      : "rgba(226,238,171,0.12)";

    ctx.beginPath();
    ctx.arc(
      x,
      y,
      seededVisualRandom(1.2, 3.2),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// ============================================
// ROADS
// ============================================

function traceRoad(ctx, points) {
  ctx.beginPath();

  points.forEach((p, i) => {
    if (i === 0) {
      ctx.moveTo(p[0], p[1]);
    } else {
      ctx.lineTo(p[0], p[1]);
    }
  });
}

function drawRoads(ctx) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const road of roads) {
    traceRoad(ctx, road.points);
    ctx.strokeStyle = "#53665a";
    ctx.lineWidth = road.width + 13;
    ctx.stroke();

    traceRoad(ctx, road.points);
    ctx.strokeStyle = "#777f7d";
    ctx.lineWidth = road.width;
    ctx.stroke();

    traceRoad(ctx, road.points);
    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.lineWidth = road.width - 8;
    ctx.stroke();

    traceRoad(ctx, road.points);
    ctx.strokeStyle = "#f2d987";
    ctx.lineWidth = 3;
    ctx.setLineDash(
      road.type === "highway" ? [27, 25] : [17, 22]
    );
    ctx.stroke();
    ctx.setLineDash([]);

    if (road.type === "highway") {
      traceRoad(ctx, road.points);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 49]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

// ============================================
// AIRPORT RUNWAYS
// ============================================

function drawRunways(ctx) {
  for (const r of runways) {
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    roundedRect(ctx, r.x + 7, r.y + 8, r.width, r.height, 5);
    ctx.fill();

    ctx.fillStyle = "#4d555b";
    roundedRect(ctx, r.x, r.y, r.width, r.height, 5);
    ctx.fill();

    ctx.strokeStyle = "#dce2df";
    ctx.lineWidth = 3;
    ctx.strokeRect(r.x + 7, r.y + 7, r.width - 14, r.height - 14);

    ctx.strokeStyle = "#f7f5e8";
    ctx.lineWidth = 3;
    ctx.setLineDash([30, 22]);

    ctx.beginPath();
    ctx.moveTo(r.x + 25, r.y + r.height / 2);
    ctx.lineTo(r.x + r.width - 25, r.y + r.height / 2);
    ctx.stroke();

    ctx.setLineDash([]);

    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "#f7f5e8";
      ctx.fillRect(r.x + 18 + i * 8, r.y + 12, 4, r.height - 24);
      ctx.fillRect(r.x + r.width - 66 + i * 8, r.y + 12, 4, r.height - 24);
    }
  }
}

// ============================================
// BUILDING APPEARANCE
// ============================================

const buildingPalettes = {
  city: ["#c5d0d1", "#aebdc2", "#d0c7b4", "#a9b7ad"],
  house: ["#e7c99f", "#d9b58d", "#c9d0c2", "#e0c7b0"],
  hangar: ["#aebbc0", "#c3cbd0", "#9eafb7", "#b9c5c8"],
  terminal: ["#c8d9d8", "#a9c7c9", "#d4d8cf", "#b5c9c8"],
  military: ["#a7b39a", "#899b83", "#b6b99b", "#929f8c"],
  industrial: ["#b6b9b1", "#9fa9a7", "#c1b9a8", "#a7b0aa"],
  warehouse: ["#c2b8a2", "#aeb8b4", "#c9c2b0", "#9faeaa"],
  research: ["#c4d3d4", "#b5c8ce", "#d0d8d2", "#a9c0c5"],
  mall: ["#d3d2c5", "#bdc9c4", "#d9c8b4", "#b8c5c5"]
};

function drawWindows(ctx, b) {
  if (b.type === "house") {
    ctx.fillStyle = "#6c9ca5";

    const count = Math.max(1, Math.floor(b.w / 30));

    for (let i = 0; i < count; i++) {
      const wx = b.x + 12 + i * ((b.w - 24) / count);

      roundedRect(ctx, wx, b.y + b.h * 0.42, 10, 11, 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

  } else if (
    ["city", "terminal", "research"].includes(b.type)
  ) {
    ctx.fillStyle = "#6d9da8";

    const cols = Math.max(2, Math.floor(b.w / 25));

    for (let i = 0; i < cols; i++) {
      const wx = b.x + 10 + i * ((b.w - 22) / cols);

      roundedRect(
        ctx,
        wx,
        b.y + 9,
        7,
        Math.max(10, b.h * 0.16),
        2
      );

      ctx.fill();
    }
  }
}

function drawBuildings(ctx) {
  for (const b of buildings) {
    const palette = buildingPalettes[b.type] || buildingPalettes.city;
    const roof = palette[b.style || 0];

    // Shadow
    ctx.fillStyle = "rgba(35,49,43,0.20)";
    roundedRect(ctx, b.x + 7, b.y + 9, b.w, b.h, 7);
    ctx.fill();

    // Foundation
    ctx.fillStyle = "#69736d";
    roundedRect(ctx, b.x - 3, b.y - 3, b.w + 6, b.h + 6, 7);
    ctx.fill();

    // Main roof
    ctx.fillStyle = roof;
    roundedRect(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.fill();

    // Roof highlight
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    roundedRect(ctx, b.x + 5, b.y + 5, b.w - 10, 5, 2);
    ctx.fill();

    ctx.fillStyle = "rgba(45,55,55,0.12)";
    roundedRect(ctx, b.x + 5, b.y + b.h - 10, b.w - 10, 5, 2);
    ctx.fill();

    drawWindows(ctx, b);

    // Rooftop equipment
    if (
      ["city", "industrial", "research", "mall"].includes(b.type)
    ) {
      ctx.fillStyle = "rgba(69,82,83,0.45)";
      roundedRect(
        ctx,
        b.x + b.w * 0.28,
        b.y + b.h * 0.27,
        b.w * 0.44,
        7,
        3
      );
      ctx.fill();

      if (b.type !== "mall") {
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        roundedRect(
          ctx,
          b.x + b.w * 0.34,
          b.y + b.h * 0.53,
          b.w * 0.30,
          5,
          2
        );
        ctx.fill();
      }

    } else if (b.type === "house") {
      ctx.fillStyle = "#a77d5d";
      roundedRect(
        ctx,
        b.x + b.w * 0.36,
        b.y + b.h * 0.13,
        b.w * 0.28,
        8,
        3
      );
      ctx.fill();

      ctx.fillStyle = "#8c6a53";
      ctx.fillRect(
        b.x + b.w * 0.43,
        b.y + b.h - 14,
        b.w * 0.14,
        14
      );

    } else if (
      b.type === "hangar" || b.type === "warehouse"
    ) {
      ctx.strokeStyle = "rgba(65,79,83,0.55)";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(b.x + b.w * 0.15, b.y + b.h * 0.25);
      ctx.lineTo(b.x + b.w * 0.85, b.y + b.h * 0.25);
      ctx.stroke();
    }

    // Outline
    ctx.strokeStyle = "rgba(65,77,73,0.72)";
    ctx.lineWidth = 2;
    roundedRect(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.stroke();
  }
}

// ============================================
// TREE APPEARANCE
// ============================================

function drawTrees(ctx) {
  for (const t of trees) {
    const r = t.radius;

    // Shadow
    ctx.fillStyle = "rgba(35,54,37,0.22)";
    ctx.beginPath();
    ctx.ellipse(
      t.x + 5,
      t.y + 8,
      r * 1.08,
      r * 0.82,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Trunk
    ctx.fillStyle = "#765c3d";
    roundedRect(ctx, t.x - 3, t.y + 2, 7, Math.max(8, r * 0.75), 3);
    ctx.fill();

    // Main canopy
    const base = t.variation > 0.66
      ? "#286b43"
      : t.variation > 0.33
        ? "#347b49"
        : "#3c874c";

    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = "rgba(115,183,91,0.78)";
    ctx.beginPath();
    ctx.arc(t.x - r * 0.28, t.y - r * 0.28, r * 0.58, 0, Math.PI * 2);
    ctx.fill();

    // Dark canopy shading
    ctx.fillStyle = "rgba(22,83,49,0.36)";
    ctx.beginPath();
    ctx.arc(t.x + r * 0.28, t.y + r * 0.20, r * 0.48, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(24,83,48,0.48)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(t.x, t.y, r - 1, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ============================================
// POI LABELS
// ============================================

function drawPOIs(ctx) {
  ctx.save();
  ctx.textAlign = "center";

  for (const poi of pois) {
    const label = poi.name;

    ctx.font = "900 25px Arial";

    const width = ctx.measureText(label).width + 28;
    const x = poi.x - width / 2;
    const y = poi.y - 145;

    ctx.fillStyle = "rgba(35,55,47,0.24)";
    roundedRect(ctx, x + 3, y - 25, width, 34, 9);
    ctx.fill();

    ctx.fillStyle = "rgba(35,55,47,0.78)";
    roundedRect(ctx, x, y - 28, width, 34, 9);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 3;

    ctx.fillText(label, poi.x, y - 5);

    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// ============================================
// MAIN WORLD DRAW FUNCTION
// ============================================

export function drawWorld(ctx) {
  drawWater(ctx);
  drawIsland(ctx);
  drawGrass(ctx);
  drawRoads(ctx);
  drawRunways(ctx);
  drawBuildings(ctx);
  drawTrees(ctx);
  drawPOIs(ctx);
}
