
// ============================================
// ULTIMATE ROYALE
// INTERIOR ENGINE - VERSION 0.2.1
// ============================================

const INTERIOR_SCALE = 3.2;

function getInteriorDimensions(building) {
  return {
    width: Math.max(900, Math.round(building.w * INTERIOR_SCALE)),
    height: Math.max(650, Math.round(building.h * INTERIOR_SCALE))
  };
}

// ============================================
// INTERIOR GENERATOR
// ============================================

export function createInterior(building) {

  const type = building.type;
  const dimensions = getInteriorDimensions(building);

  const INTERIOR_WIDTH = dimensions.width;
  const INTERIOR_HEIGHT = dimensions.height;

  const interior = {
    width: INTERIOR_WIDTH,
    height: INTERIOR_HEIGHT,
    type,
    name: getInteriorName(type),
    floorColor: getFloorColor(type),
    wallColor: getWallColor(type),
    walls: [],
    furniture: [],
    exit: {
      x: INTERIOR_WIDTH / 2 - 50,
      y: INTERIOR_HEIGHT - 25,
      w: 100,
      h: 25
    }
  };};

  // ============================================
// RESPONSIVE OUTER WALLS
// ============================================

const t = 22;
const W = INTERIOR_WIDTH;
const H = INTERIOR_HEIGHT;
const centerX = W / 2;
const doorwayWidth = 120;

interior.walls.push(
  { x: 0, y: 0, w: W, h: t },
  { x: 0, y: 0, w: t, h: H },
  { x: W - t, y: 0, w: t, h: H },
  { x: 0, y: H - t, w: centerX - doorwayWidth / 2, h: t },
  {
    x: centerX + doorwayWidth / 2,
    y: H - t,
    w: centerX - doorwayWidth / 2,
    h: t
  }
);

  interior.walls.push(
    { x: 0, y: 0, w: INTERIOR_WIDTH, h: t },
    { x: 0, y: 0, w: t, h: INTERIOR_HEIGHT },
    { x: INTERIOR_WIDTH - t, y: 0, w: t, h: INTERIOR_HEIGHT },
    { x: 0, y: INTERIOR_HEIGHT - t, w: 400, h: t },
    { x: 500, y: INTERIOR_HEIGHT - t, w: 400, h: t }
  );

  // Interior layout depends on building type.
  switch (type) {

    case "house":
    case "suburbs":
      addHouseLayout(interior);
      break;

    case "city":
      addOfficeLayout(interior);
      break;

    case "mall":
      addMallLayout(interior);
      break;

    case "hangar":
    case "terminal":
      addAirportLayout(interior);
      break;

    case "military":
      addMilitaryLayout(interior);
      break;

    case "industrial":
      addWarehouseLayout(interior);
      break;

    case "research":
      addResearchLayout(interior);
      break;

    default:
      addOfficeLayout(interior);
      break;
  }

  return interior;
}

// ============================================
// INTERIOR NAMES AND COLORS
// ============================================

function getInteriorName(type) {

  const names = {
    house: "RESIDENTIAL HOUSE",
    suburbs: "SUBURBAN HOUSE",
    city: "CITY BUILDING",
    mall: "SHOPPING CENTER",
    hangar: "AIRPORT HANGAR",
    terminal: "AIRPORT TERMINAL",
    military: "MILITARY FACILITY",
    industrial: "INDUSTRIAL WAREHOUSE",
    research: "RESEARCH FACILITY"
  };

  return names[type] || "BUILDING INTERIOR";
}

function getFloorColor(type) {

  if (type === "house" || type === "suburbs") return "#9b8268";
  if (type === "mall") return "#777b80";
  if (type === "military") return "#596451";
  if (type === "hangar" || type === "terminal") return "#777d80";
  if (type === "research") return "#687b83";
  if (type === "industrial") return "#77746b";

  return "#777d83";
}

function getWallColor(type) {

  if (type === "house" || type === "suburbs") return "#ded2bb";
  if (type === "military") return "#858d79";
  if (type === "research") return "#b5c5ca";

  return "#b4b9bb";
}

// ============================================
// FURNITURE HELPER
// ============================================

function addFurniture(interior, x, y, w, h, type, color, label = "") {

  interior.furniture.push({
    x, y, w, h,
    type,
    color,
    label
  });

}

// ============================================
// WALL HELPER
// ============================================

function addWall(interior, x, y, w, h) {

  interior.walls.push({
    x, y, w, h
  });

}

// ============================================
// HOUSE INTERIOR
// ============================================

function addHouseLayout(interior) {

  // Room divisions
  addWall(interior, 440, 22, 18, 240);
  addWall(interior, 22, 300, 250, 18);
  addWall(interior, 600, 300, 278, 18);

  // Living room
  addFurniture(interior, 100, 90, 190, 65, "sofa", "#657d83", "SOFA");
  addFurniture(interior, 155, 190, 100, 55, "table", "#76543b", "TABLE");
  addFurniture(interior, 340, 100, 55, 80, "cabinet", "#765d48", "CABINET");

  // Kitchen
  addFurniture(interior, 520, 75, 250, 45, "counter", "#c0c4c1", "COUNTER");
  addFurniture(interior, 710, 150, 85, 75, "fridge", "#c9d0d1", "FRIDGE");
  addFurniture(interior, 550, 190, 75, 55, "table", "#76543b", "TABLE");

  // Bedroom
  addFurniture(interior, 100, 390, 190, 115, "bed", "#d0c6b5", "BED");
  addFurniture(interior, 330, 420, 65, 60, "cabinet", "#765d48", "DRAWERS");

  // Bathroom
  addFurniture(interior, 650, 390, 75, 75, "bath", "#d2dce0", "BATH");
  addFurniture(interior, 770, 510, 50, 45, "sink", "#c6d3d7", "SINK");
}

// ============================================
// CITY OFFICE INTERIOR
// ============================================

function addOfficeLayout(interior) {

  addWall(interior, 450, 22, 18, 250);
  addWall(interior, 22, 330, 250, 18);
  addWall(interior, 620, 330, 258, 18);

  // Offices
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {

      const x = 90 + col * 250;
      const y = 90 + row * 250;

      addFurniture(
        interior,
        x, y, 120, 65,
        "desk", "#755d49", "OFFICE DESK"
      );

      addFurniture(
        interior,
        x + 35, y + 85, 45, 45,
        "chair", "#394b5c", "CHAIR"
      );

    }
  }

  addFurniture(interior, 690, 80, 110, 65, "counter", "#a9b0b3", "RECEPTION");
}

// ============================================
// MALL INTERIOR
// ============================================

function addMallLayout(interior) {

  // Central shopping walkway
  addFurniture(interior, 370, 80, 160, 480, "walkway", "#969a9c", "MAIN WALKWAY");

  // Shops
  for (let i = 0; i < 4; i++) {

    const y = 65 + i * 135;

    addFurniture(
      interior, 75, y, 220, 80,
      "shop", "#b58c69", "STORE"
    );

    addFurniture(
      interior, 605, y, 220, 80,
      "shop", "#8b9eaa", "STORE"
    );

  }

  addFurniture(interior, 390, 270, 120, 65, "counter", "#6e5542", "INFORMATION");
}

// ============================================
// AIRPORT INTERIOR
// ============================================

function addAirportLayout(interior) {

  // Open central floor
  addFurniture(interior, 100, 90, 200, 65, "counter", "#aeb9bd", "CHECK-IN");
  addFurniture(interior, 600, 90, 200, 65, "counter", "#aeb9bd", "OPERATIONS");

  for (let i = 0; i < 3; i++) {

    addFurniture(
      interior,
      130 + i * 230,
      300,
      140,
      55,
      "equipment",
      "#555f65",
      "AIRPORT EQUIPMENT"
    );

  }

  addFurniture(interior, 350, 470, 200, 55, "counter", "#b8c0c3", "SERVICE DESK");
}

// ============================================
// MILITARY INTERIOR
// ============================================

function addMilitaryLayout(interior) {

  addWall(interior, 440, 22, 18, 250);

  // Storage racks
  for (let i = 0; i < 4; i++) {

    addFurniture(
      interior,
      80 + i * 190,
      100,
      115,
      55,
      "rack",
      "#65715c",
      "STORAGE"
    );

    addFurniture(
      interior,
      80 + i * 190,
      390,
      115,
      55,
      "crate",
      "#806c4b",
      "SUPPLIES"
    );

  }

  addFurniture(interior, 350, 260, 170, 70, "table", "#66533e", "BRIEFING TABLE");
}

// ============================================
// WAREHOUSE INTERIOR
// ============================================

function addWarehouseLayout(interior) {

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {

      addFurniture(
        interior,
        75 + col * 190,
        85 + row * 155,
        105,
        80,
        "crate",
        "#98764e",
        "CARGO"
      );

    }
  }

}

// ============================================
// RESEARCH FACILITY
// ============================================

function addResearchLayout(interior) {

  addWall(interior, 440, 22, 18, 250);

  addFurniture(interior, 80, 90, 180, 65, "lab", "#a9c5cc", "LAB TABLE");
  addFurniture(interior, 600, 90, 180, 65, "lab", "#a9c5cc", "LAB TABLE");

  addFurniture(interior, 100, 360, 100, 100, "equipment", "#596f7d", "EQUIPMENT");
  addFurniture(interior, 350, 360, 100, 100, "equipment", "#596f7d", "EQUIPMENT");
  addFurniture(interior, 650, 360, 100, 100, "equipment", "#596f7d", "EQUIPMENT");

}

// ============================================
// DRAW INTERIOR
// ============================================

export function drawInterior(ctx, interior) {

  // Floor
  ctx.fillStyle = interior.floorColor;
  ctx.fillRect(0, 0, interior.width, interior.height);

  // Floor tile pattern
  ctx.strokeStyle = "rgba(0,0,0,0.09)";
  ctx.lineWidth = 1;

  for (let x = 0; x < interior.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, interior.height);
    ctx.stroke();
  }

  for (let y = 0; y < interior.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(interior.width, y);
    ctx.stroke();
  }

  // Furniture
  for (const item of interior.furniture) {

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(item.x + 6, item.y + 7, item.w, item.h);

    ctx.fillStyle = item.color;
    ctx.fillRect(item.x, item.y, item.w, item.h);

    ctx.strokeStyle = "#303638";
    ctx.lineWidth = 3;
    ctx.strokeRect(item.x, item.y, item.w, item.h);

    if (item.label) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        item.label,
        item.x + item.w / 2,
        item.y + item.h / 2 + 4
      );
    }

  }

  // Walls
  for (const wall of interior.walls) {

    ctx.fillStyle = "#30383c";
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

    ctx.fillStyle = interior.wallColor;
    ctx.fillRect(
      wall.x + 4,
      wall.y + 4,
      wall.w - 8,
      wall.h - 8
    );

  }

  // Exit marker
  ctx.fillStyle = "#40d879";
  ctx.fillRect(
    interior.exit.x,
    interior.exit.y - 7,
    interior.exit.w,
    14
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "EXIT",
    interior.exit.x + interior.exit.w / 2,
    interior.exit.y - 17
  );

  // Building title
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(20, 28, 300, 42);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 19px Arial";
  ctx.textAlign = "left";
  ctx.fillText(interior.name, 34, 56);

}
