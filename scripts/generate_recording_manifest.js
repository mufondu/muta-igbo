/**
 * Mụta Igbo Recording Manifest Generator
 * Author: Michael Ufondu
 *
 * Source of truth: src/data/lessons.ts
 * Output: tools/recording-studio/recording-manifest.json
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadTypescript() {
  try {
    return require("typescript");
  } catch (error) {
    console.error("Missing local TypeScript package. Run npm install first.");
    process.exit(1);
  }
}

function normalizeIgboSlug(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[ịìí]/g, "i")
    .replace(/[ọòó]/g, "o")
    .replace(/[ụùú]/g, "u")
    .replace(/[ṅñ]/g, "n")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeId(input) {
  return normalizeIgboSlug(input) || "item";
}

const repoRoot = process.cwd();
const lessonsPath = path.join(repoRoot, "src/data/lessons.ts");
const outPath = path.join(repoRoot, "tools/recording-studio/recording-manifest.json");

if (!fs.existsSync(lessonsPath)) {
  console.error(`Cannot find ${lessonsPath}`);
  process.exit(1);
}

const ts = loadTypescript();
const source = fs.readFileSync(lessonsPath, "utf8");

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

const sandboxModule = { exports: {} };
const sandbox = {
  module: sandboxModule,
  exports: sandboxModule.exports,
  require,
  console,
};

vm.runInNewContext(compiled, sandbox, { filename: lessonsPath });

const exported = sandboxModule.exports;
const allLevels = exported.ALL_LEVELS;

if (!Array.isArray(allLevels)) {
  console.error("ALL_LEVELS was not exported as an array from src/data/lessons.ts");
  process.exit(1);
}

const filenameCounts = new Map();
const items = [];

allLevels.forEach((level, levelIndex) => {
  const levelId = level.id || `level-${levelIndex + 1}`;
  const levelTitle = level.title || levelId;

  (level.sections || []).forEach((section, sectionIndex) => {
    const sectionId = section.id || `${safeId(section.title || "section")}-${sectionIndex + 1}`;
    const sectionTitle = section.title || sectionId;

    (section.items || []).forEach((item, itemIndex) => {
      if (!item || !item.igbo || !item.english) return;

      const baseSlug = normalizeIgboSlug(item.igbo);
      const existingCount = filenameCounts.get(baseSlug) || 0;
      filenameCounts.set(baseSlug, existingCount + 1);

      const suffix = existingCount === 0 ? "" : `-${safeId(sectionTitle)}`;
      const targetFile = `${baseSlug}${suffix}.m4a`;

      items.push({
        id: `${safeId(levelId)}-${safeId(sectionId)}-${String(itemIndex + 1).padStart(3, "0")}`,
        levelId,
        levelTitle,
        sectionId,
        sectionTitle,
        igbo: item.igbo,
        english: item.english,
        emoji: item.emoji || "",
        targetFile,
        rawFile: targetFile.replace(/\.m4a$/, ".webm"),
        voiceSet: "central-igbo-v1",
        dialect: "central_igbo",
        status: "pending",
      });
    });
  });
});

const manifest = {
  app: "Mụta Igbo",
  manifestVersion: 2,
  languageFocus: "Central Igbo",
  generatedAt: new Date().toISOString(),
  source: "src/data/lessons.ts",
  totalItems: items.length,
  outputFormat: {
    capture: "webm",
    delivery: "m4a",
    recommendedSampleRate: 48000,
    recommendedLoudness: "-16 LUFS integrated",
  },
  items,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

console.log(`Generated ${items.length} recording items`);
console.log(outPath);
