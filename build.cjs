const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function main() {
  const src = path.join(__dirname, "site");
  const out = path.join(__dirname, "dist");
  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(src, out, { recursive: true });

  const chunksDir = path.join(__dirname, "hero-payload");
  const chunks = fs.readdirSync(chunksDir).filter(n => n.endsWith(".b64")).sort();
  if (!chunks.length) throw new Error("No hero payload chunks found");

  const hero = Buffer.from(
    chunks.map(n => fs.readFileSync(path.join(chunksDir, n), "utf8").trim()).join(""),
    "base64"
  );

  const assets = path.join(out, "article", "trump-prega-ia", "assets");
  fs.mkdirSync(assets, { recursive: true });
  const heroPath = path.join(assets, "trump-ai-satira.jpg");
  fs.writeFileSync(heroPath, hero);

  const metadata = await sharp(hero).metadata();
  if (metadata.width !== 1200 || metadata.height !== 900) {
    throw new Error(`Unexpected hero dimensions: ${metadata.width}x${metadata.height}`);
  }

  await sharp(hero)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 84, progressive: true })
    .toFile(path.join(assets, "og-trump-ai.jpg"));

  for (const required of [
    "index.html",
    "404.html",
    "article/trump-prega-ia/index.html",
    "article/trump-prega-ia/assets/trump-ai-satira.jpg",
    "article/trump-prega-ia/assets/og-trump-ai.jpg"
  ]) {
    if (!fs.existsSync(path.join(out, required))) {
      throw new Error("Missing output: " + required);
    }
  }

  console.log("Trump AI static site rebuilt in dist/");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
