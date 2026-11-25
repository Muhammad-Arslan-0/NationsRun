import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve(process.cwd(), 'node_modules/flag-icons/flags/1x1');
const destDir = path.resolve(process.cwd(), 'public/flags');

if (!fs.existsSync(srcDir)) {
  console.log('flag-icons not installed yet; skipping copy-flags.');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.svg'));
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}
console.log(`Copied ${files.length} SVG flags to public/flags/`);
