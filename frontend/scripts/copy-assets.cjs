/**
 * Post-build script — copies unbundled JS and CSS to dist/
 *
 * Vite only bundles <script type="module"> and <link rel="stylesheet">.
 * Our scripts use IIFEs (not ES modules), so Vite leaves them as-is.
 * This script copies them to the dist folder so production works.
 */
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../src');
const dist = path.resolve(__dirname, '../dist');

const dirs = ['js', 'css', 'assets'];

for (const dir of dirs) {
  const srcDir = path.join(src, dir);
  const distDir = path.join(dist, dir);
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, distDir, { recursive: true });
    console.log(`Copied ${dir}/ to dist/${dir}/`);
  }
}

console.log('Asset copy complete.');
