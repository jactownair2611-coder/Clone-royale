
// ============================================
// ULTIMATE ROYALE
// WORLD ENGINE - VERSION 0.2.0
// ============================================

export const world = {
  width: 4000,
  height: 3200
};

export const buildings = [];
export const trees = [];
export const roads = [];
export const pois = [];

// ============================================
// DETERMINISTIC WORLD GENERATION
// ============================================

let seed = 72841;

function random(min, max) {
  seed = (seed * 16807) % 2147483647;
  return min + (seed / 2147483647) * (max - min);
}

function insideIsland(x, y) {
  const dx = (x - 2000) / 1880;
  const dy = (y - 1600) / 1480;

  return dx * dx + dy * dy < 1;
}

// ============================================
// POINTS OF INTEREST
// ============================================

const locations = [
  {
    name: "GRAND CITY",
    x: 850,
    y: 800,
    type: "city"
  },
  {
    name: "INTERNATIONAL AIRPORT",
    x: 2900,
    y: 550,
    type: "airport"
  },
  {
    name: "MILITARY BASE",
    x: 3200,
    y: 1450,
    type: "military"
  },
  {
    name: "SEASIDE HARBOR",
    x: 650,
    y: 2550,
    type: "harbor"
  },
  {
    name: "POWER PLANT",
    x: 2000,
    y: 650,
    type: "industrial"
  },
  {
    name: "PINEWOOD SUBURBS",
    x: 1250,
    y: 1700,
    type: "suburbs"
  },
  {
    name: "RESEARCH FACILITY",
    x: 2800,
    y: 2400,
    type: "research"
  },
  {
    name: "MEGA MALL",
    x: 1900,
    y: 2550,
    type: "mall"
  }
];

pois.push(...locations);

// ============================================
// ROADS
// ============================================

// Main highway

roads.push({
  points: [
    [250, 1500],
    [900, 1450],
    [1550, 1550],
    [2300, 1450],
    [3000, 1350],
    [3750, 1500]
  ],
  width: 85,
  type: "highway"
});

// Northern road

roads.push({
  points: [
    [500, 1100],
    [1100, 900],
    [1800, 950],
    [2500, 850],
    [3500, 750]
  ],
  width: 45,
  type: "road"
});

// Southern road

roads.push({
  points: [
    [400, 2200],
    [1100, 2300],
    [1800, 2150],
    [2500, 2300],
    [3500, 2200]
  ],
  width: 45,
  type: "road"
});

// ============================================
// BUILDING GENERATION
// ============================================

function addBuilding(x, y, w, h, type) {
  buildings.push({
    x, y, w, h, type
  });
}

function generateCity(poi) {

  for (let i = 0; i < 32; i++) {

    const x = poi.x + random(-260, 260);
    const y = poi.y + random(-220, 220);

    if (!insideIsland(x, y)) continue;

    const size = random(65, 115);

    addBuilding(
      x,
      y,
      size,
      size * random(0.65, 1.1),
      poi.type
    );

  }

}

function generateSuburbs(poi) {

  for (let i = 0; i < 25; i++) {

    const x = poi.x + random(-230, 230);
    const y = poi.y + random(-200, 200);

    if (!insideIsland(x, y)) continue;

    addBuilding(
      x,
      y,
      random(45, 75),
      random(40, 65),
      "house"
    );

  }

}

for (const poi of locations) {

  if (poi.type === "city") {
    generateCity(poi);
  }

  if (poi.type === "suburbs") {
    generateSuburbs(poi);
  }

}

// Airport hangars and terminals

for (let i = 0; i < 6; i++) {

  addBuilding(
    2700 + (i % 3) * 150,
    400 + Math.floor(i / 3) * 230,
    120,
    85,
    "hangar"
  );

}

addBuilding(2900, 760, 250, 100, "terminal");

// Military structures

for (let i = 0; i < 9; i++) {

  addBuilding(
    3050 + random(-130, 130),
    1450 + random(-170, 170),
    random(65, 100),
    random(55, 90),
    "military"
  );

}

// Mall

addBuilding(1780, 2430, 250, 180, "mall");

// Industrial buildings

for (let i = 0; i < 8; i++) {

  addBuilding(
    1850 + random(-150, 150),
    600 + random(-130, 130),
    random(70, 130),
    random(60, 100),
    "industrial"
  );

}

// ============================================
// AIRPORT RUNWAYS
// ============================================

export const runways = [
  {
    x: 2550,
    y: 150,
    width: 700,
    height: 75
  },
  {
    x: 2500,
    y: 275,
    width: 600,
    height: 55
  }
];

// ============================================
// FORESTS
// ============================================

for (let i = 0; i < 1100; i++) {

  const x = random(100, world.width - 100);
  const y = random(100, world.height - 100);

  if (!insideIsland(x, y)) continue;

  // Keep main POIs relatively clear

  let nearPOI = false;

  for (const poi of locations) {

    if (
      Math.hypot(x - poi.x, y - poi.y) < 300
    ) {
      nearPOI = true;
      break;
    }

  }

  if (!nearPOI) {

    trees.push({
      x,
      y,
      radius: random(12, 23),
      variation: random(0, 1)
    });

  }

}

// ============================================
// DRAW WATER
// ============================================

function drawWater(ctx) {

  ctx.fillStyle = "#327fa1";
  ctx.fillRect(0, 0, world.width, world.height);

  // Water texture

  ctx.strokeStyle = "rgba(190,225,235,0.12)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 250; i++) {

    const x = random(0, world.width);
    const y = random(0, world.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 18, y);
    ctx.stroke();

  }

}

// ============================================
// DRAW ISLAND
// ============================================

function drawIsland(ctx) {

  // Beach shadow

  ctx.fillStyle = "#d5c18b";

  ctx.beginPath();

  ctx.ellipse(
    2000,
    1600,
    1880,
    1480,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Main terrain

  ctx.fillStyle = "#648f50";

  ctx.beginPath();

  ctx.ellipse(
    2000,
    1600,
    1835,
    1435,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

}

// ============================================
// DRAW GRASS
// ============================================

function drawGrass(ctx) {

  ctx.fillStyle = "rgba(30,75,32,0.13)";

  for (let i = 0; i < 1700; i++) {

    const x = random(100, 3900);
    const y = random(100, 3100);

    if (!insideIsland(x, y)) continue;

    ctx.beginPath();

    ctx.arc(x, y, random(2, 6), 0, Math.PI * 2);

    ctx.fill();

  }

}

// ============================================
// DRAW ROADS
// ============================================

function drawRoads(ctx) {

  for (const road of roads) {

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    road.points.forEach((point, i) => {

      if (i === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }

    });

    ctx.strokeStyle = "#343a3b";
    ctx.lineWidth = road.width + 12;
    ctx.stroke();

    ctx.strokeStyle =
      road.type === "highway" ? "#777b7a" : "#626867";

    ctx.lineWidth = road.width;
    ctx.stroke();

    ctx.setLineDash([25, 30]);
    ctx.strokeStyle = "#d7c58a";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.setLineDash([]);

  }

}

// ============================================
// DRAW AIRPORT
// ============================================

function drawRunways(ctx) {

  for (const runway of runways) {

    ctx.fillStyle = "#343a3d";

    ctx.fillRect(
      runway.x,
      runway.y,
      runway.width,
      runway.height
    );

    ctx.strokeStyle = "#e8e8e0";
    ctx.lineWidth = 3;
    ctx.setLineDash([35, 20]);

    ctx.beginPath();

    ctx.moveTo(
      runway.x + 20,
      runway.y + runway.height / 2
    );

    ctx.lineTo(
      runway.x + runway.width - 20,
      runway.y + runway.height / 2
    );

    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "#f1f1e9";
    ctx.lineWidth = 3;

    ctx.strokeRect(
      runway.x,
      runway.y,
      runway.width,
      runway.height
    );

  }

}

// ============================================
// DRAW BUILDINGS
// ============================================

function drawBuildings(ctx) {

  const colors = {
    city: "#879398",
    airport: "#a4a9a9",
    hangar: "#9a9e9e",
    military: "#777e70",
    industrial: "#888c85",
    house: "#b69c80",
    suburbs: "#b69c80",
    mall: "#a3a5a2",
    research: "#a1abb0",
    harbor: "#929b9b"
  };

  for (const b of buildings) {

    // Shadow

    ctx.fillStyle = "rgba(0,0,0,0.3)";

    ctx.fillRect(
      b.x + 9,
      b.y + 11,
      b.w,
      b.h
    );

    // Building roof

    ctx.fillStyle = colors[b.type] || "#929994";

    ctx.fillRect(
      b.x,
      b.y,
      b.w,
      b.h
    );

    // Roof border

    ctx.strokeStyle = "#414a4b";
    ctx.lineWidth = 4;

    ctx.strokeRect(
      b.x,
      b.y,
      b.w,
      b.h
    );

    // Rooftop details

    ctx.fillStyle = "rgba(45,55,59,0.5)";

    ctx.fillRect(
      b.x + b.w * 0.2,
      b.y + b.h * 0.2,
      b.w * 0.6,
      5
    );

    ctx.fillRect(
      b.x + b.w * 0.3,
      b.y + b.h * 0.45,
      b.w * 0.4,
      4
    );

  }

}

// ============================================
// DRAW TREES
// ============================================

function drawTrees(ctx) {

  for (const tree of trees) {

    ctx.fillStyle = "rgba(0,0,0,0.22)";

    ctx.beginPath();

    ctx.ellipse(
      tree.x + 6,
      tree.y + 9,
      tree.radius,
      tree.radius * 0.8,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
      tree.variation > 0.5 ? "#245c32" : "#316c37";

    ctx.beginPath();

    ctx.arc(
      tree.x,
      tree.y,
      tree.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#568c47";

    ctx.beginPath();

    ctx.arc(
      tree.x - 5,
      tree.y - 5,
      tree.radius * 0.55,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }

}

// ============================================
// DRAW POI LABELS
// ============================================

function drawPOIs(ctx) {

  ctx.textAlign = "center";
  ctx.font = "bold 28px Arial";

  for (const poi of pois) {

    ctx.fillStyle = "rgba(0,0,0,0.55)";

    ctx.fillText(
      poi.name,
      poi.x + 2,
      poi.y - 145 + 2
    );

    ctx.fillStyle = "#ffffff";

    ctx.fillText(
      poi.name,
      poi.x,
      poi.y - 145
    );

  }

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
