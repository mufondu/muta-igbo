/**
 * Mụta Igbo Audio Registry Generator
 * Author: Michael Ufondu
 *
 * Generates a static React Native audio registry after .m4a files exist.
 */

const fs = require("fs");
const path = require("path");

const repoRoot = process.cwd();

const voiceSets = [
  {
    id: "central_igbo_native_v1",
    dir: "assets/audio/central-igbo/native-v1",
  },
  {
    id: "muta_mascot_v1",
    dir: "assets/audio/central-igbo/mascot-v1",
  },
];

const lines = [];
lines.push("/**");
lines.push(" * Auto-generated audio registry.");
lines.push(" * Author: Michael Ufondu");
lines.push(" * Do not edit manually. Run scripts/generate_audio_registry.js.");
lines.push(" */");
lines.push("");
lines.push("export const AUDIO_REGISTRY: Record<string, any> = {");

let count = 0;

for (const voiceSet of voiceSets) {
  const absDir = path.join(repoRoot, voiceSet.dir);

  if (!fs.existsSync(absDir)) continue;

  const files = fs.readdirSync(absDir)
    .filter(file => file.toLowerCase().endsWith(".m4a"))
    .sort();

  for (const file of files) {
    const key = `${voiceSet.id}:${file}`;
    const requirePath = `../../${voiceSet.dir}/${file}`;

    lines.push(`  ${JSON.stringify(key)}: require(${JSON.stringify(requirePath)}),`);
    count += 1;
  }
}

lines.push("};");
lines.push("");
lines.push(`export const AUDIO_REGISTRY_COUNT = ${count};`);
lines.push("");

const outPath = path.join(repoRoot, "src/data/audioRegistry.ts");
fs.writeFileSync(outPath, lines.join("\n"));

console.log(`Generated audio registry with ${count} file(s).`);
console.log(outPath);
