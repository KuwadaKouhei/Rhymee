const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "kuromoji", "dict");
const dest = path.join(__dirname, "..", "public", "dict");

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

const files = fs.readdirSync(src);
for (const file of files) {
  fs.copyFileSync(path.join(src, file), path.join(dest, file));
}

console.log(`${files.length} 件の辞書ファイルを public/dict にコピーしました`);
