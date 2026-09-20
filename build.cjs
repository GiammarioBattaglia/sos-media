const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

function readPayload(dirName) {
  const dir = path.join(__dirname, dirName);
  const chunks = fs.readdirSync(dir).filter(n => n.endsWith(".b64")).sort();
  if (!chunks.length) throw new Error("No payload chunks found in " + dirName);
  return Buffer.from(
    chunks.map(n => fs.readFileSync(path.join(dir, n), "utf8").trim()).join(""),
    "base64"
  );
}

async function main() {
  const src = path.join(__dirname, "site");
  const out = path.join(__dirname, "dist");
  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(src, out, { recursive: true });

  const articleDir = path.join(out, "article", "trump-prega-ia");
  const assets = path.join(articleDir, "assets");
  fs.mkdirSync(assets, { recursive: true });

  const article = readPayload("article-payload");
  fs.writeFileSync(path.join(articleDir, "index.html"), article);

  const hero = readPayload("hero-payload");
  const metadata = await sharp(hero).metadata();
  if (metadata.width !== 1200 || metadata.height !== 900) {
    throw new Error(`Unexpected hero dimensions: ${metadata.width}x${metadata.height}`);
  }
  fs.writeFileSync(path.join(assets, "trump-ai-satira.jpg"), hero);

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
