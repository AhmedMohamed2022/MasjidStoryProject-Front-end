// find-untranslated.js
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "src");
const FILE_EXTENSIONS = [".ts", ".html", ".scss", ".css"];

const ENGLISH_REGEX = /(["'`])([A-Za-z][A-Za-z0-9 ,.!?\-:;()\[\]{}\/]+)\1/g;
const TRANSLATE_PIPE_REGEX = /\|\s*translate/;
const TRANSLATE_SERVICE_REGEX = /translate\.(instant|get)\s*\(/;

function scanFile(filePath) {
  const ext = path.extname(filePath);
  if (!FILE_EXTENSIONS.includes(ext)) return [];

  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const results = [];

  lines.forEach((line, idx) => {
    // Skip lines that already use | translate or translate.instant/get
    if (TRANSLATE_PIPE_REGEX.test(line) || TRANSLATE_SERVICE_REGEX.test(line))
      return;

    // Find likely hardcoded English
    let match;
    while ((match = ENGLISH_REGEX.exec(line)) !== null) {
      // Ignore imports, variable names, and URLs
      if (
        /import|from|@|http|\.com|\.org|\.net|\.png|\.jpg|\.svg|\.ico|\.css|\.ts|\.js|\.json|\.html|\.scss|\.env/.test(
          line
        )
      )
        continue;
      // Ignore Angular bindings and comments
      if (/\/\/|\/\*|\*\/|<!--|-->|{{|}}/.test(line)) continue;

      results.push({
        file: filePath,
        line: idx + 1,
        text: line.trim(),
      });
    }
  });

  return results;
}

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results = results.concat(scanFile(fullPath));
    }
  });
  return results;
}

const findings = walk(SRC_DIR);

if (findings.length === 0) {
  console.log("✅ No hardcoded English user-facing text found!");
} else {
  console.log("⚠️  Possible untranslated user-facing text found:\n");
  findings.forEach((f) => {
    console.log(`${f.file}:${f.line}: ${f.text}`);
  });
  console.log(
    "\nReview these lines and move user-facing text to translation keys."
  );
}
