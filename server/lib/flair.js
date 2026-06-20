// Shared lookup logic — used by both server/mcp-server.js (as an MCP tool)
// and server/index.js (as a plain helper for the REST endpoint).

const BIRTHSTONES = [
  "Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl",
  "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Turquoise",
];

// Hex colors for each birthstone — used for theme-flair merge
const BIRTHSTONE_COLORS = [
  "#9b1b30", // Garnet (Jan)
  "#9966cc", // Amethyst (Feb)
  "#7fffd4", // Aquamarine (Mar)
  "#b9f2ff", // Diamond (Apr)
  "#50c878", // Emerald (May)
  "#f0eAD6", // Pearl (Jun)
  "#e0115f", // Ruby (Jul)
  "#e6e200", // Peridot (Aug)
  "#0f52ba", // Sapphire (Sep)
  "#ff7e00", // Opal (Oct)
  "#ffc87c", // Topaz (Nov)
  "#30d5c8", // Turquoise (Dec)
];

const BIRTH_FLOWERS = [
  "Carnation", "Violet", "Daffodil", "Daisy", "Lily of the Valley", "Rose",
  "Larkspur", "Gladiolus", "Aster", "Marigold", "Chrysanthemum", "Narcissus",
];

const ZODIAC_RANGES = [
  { sign: "Capricorn", start: [12, 22], end: [1, 19] },
  { sign: "Aquarius", start: [1, 20], end: [2, 18] },
  { sign: "Pisces", start: [2, 19], end: [3, 20] },
  { sign: "Aries", start: [3, 21], end: [4, 19] },
  { sign: "Taurus", start: [4, 20], end: [5, 20] },
  { sign: "Gemini", start: [5, 21], end: [6, 20] },
  { sign: "Cancer", start: [6, 21], end: [7, 22] },
  { sign: "Leo", start: [7, 23], end: [8, 22] },
  { sign: "Virgo", start: [8, 23], end: [9, 22] },
  { sign: "Libra", start: [9, 23], end: [10, 22] },
  { sign: "Scorpio", start: [10, 23], end: [11, 21] },
  { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
];

function inRange(month, day, [startMonth, startDay], [endMonth, endDay]) {
  const date = month * 100 + day;
  const start = startMonth * 100 + startDay;
  const end = endMonth * 100 + endDay;
  if (start <= end) return date >= start && date <= end;
  // Wraps across year boundary (Capricorn: Dec 22 -> Jan 19)
  return date >= start || date <= end;
}

function getZodiacSign(month, day) {
  const match = ZODIAC_RANGES.find((z) => inRange(month, day, z.start, z.end));
  return match ? match.sign : "Unknown";
}

export function getBirthdayFlair(month, day) {
  const m = Number(month);
  const d = Number(day);
  return {
    zodiacSign: getZodiacSign(m, d),
    birthstone: BIRTHSTONES[m - 1] || "Unknown",
    birthstoneColor: BIRTHSTONE_COLORS[m - 1] || "#ffb84d",
    birthFlower: BIRTH_FLOWERS[m - 1] || "Unknown",
  };
}
