const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const chunksDir = path.join(__dirname, "payload");
const chunks = fs.readdirSync(chunksDir).filter(n => n.endsWith(".b64")).sort();
if (!chunks.length) throw new Error("No payload chunks found");

const b64 = chunks.map(n => fs.readFileSync(path.join(chunksDir, n), "utf8").trim()).join("");
const zipBytes = Buffer.from(b64, "base64");
const zipPath = path.join(__dirname, ".trump-ai-site.zip");
fs.writeFileSync(zipPath, zipBytes);

const unpackDir = path.join(__dirname, ".unpacked");
fs.rmSync(unpackDir, { recursive: true, force: true });
new AdmZip(zipPath).extractAllTo(unpackDir, true);

const src = path.join(unpackDir, "hef_focus_trump_ai");
const out = path.join(__dirname, "dist");
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true });

for (const required of [
  "index.html",
  "404.html",
  "article/trump-prega-ia/index.html",
  "article/trump-prega-ia/assets/trump-ai-satira.jpg",
  "article/trump-prega-ia/assets/og-trump-ai.jpg"
]) {
  if (!fs.existsSync(path.join(out, required))) throw new Error("Missing output: " + required);
}
console.log("Trump AI static site rebuilt in dist/");
