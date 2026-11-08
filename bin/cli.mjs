#!/usr/bin/env node
// pixel-cat CLI — copies the component into your project (shadcn-style: you own the files).
//
//   npx pixel-cat add            auto-detects Next.js and copies into components/
//   npx pixel-cat add --dir lib  copy somewhere else
//   npx pixel-cat add --force    overwrite existing files
//   npx pixel-cat add --no-wrapper   only copy pixel-cat.js (skip the React wrapper)
//
// Why copy instead of "install and import"? The cat is one small file you may want to restyle or tweak,
// and copying keeps your site free of an extra runtime dependency.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const cmd = args[0];
const has = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i > -1 ? args[i + 1] : undefined; };

const log = (m = '') => console.log(m);
const die = (m) => { console.error(`\n  ✖ ${m}\n`); process.exit(1); };

function help() {
  log(`
  K the pixel cat — an interactive pixel-art cat for web portfolios

  Usage
    npx pixel-cat add [options]

  Options
    --dir <path>     Folder to copy into (default: components/ or src/components/)
    --no-wrapper     Skip PixelCat.tsx (the Next.js/React wrapper)
    --force          Overwrite files that already exist
    -h, --help       Show this help
`);
}

if (!cmd || cmd === '-h' || cmd === '--help' || cmd === 'help') { help(); process.exit(0); }
if (cmd !== 'add') die(`Unknown command "${cmd}". Try: npx pixel-cat add`);

const cwd = process.cwd();
if (!existsSync(join(cwd, 'package.json'))) die('No package.json here. Run this from the root of your project.');

// Detect Next.js so we know whether the React wrapper is useful
let pkg = {};
try { pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')); } catch { die('package.json is not valid JSON.'); }
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const isNext = 'next' in deps;
const isReact = 'react' in deps;

// Next.js supports an optional src/ folder; match whichever the project already uses
const hasSrc = existsSync(join(cwd, 'src'));
const defaultDir = hasSrc ? 'src/components' : 'components';
const dest = resolve(cwd, val('--dir') ?? defaultDir);

// The wrapper is TSX, so only offer it for React projects (and never when asked to skip it)
const wantWrapper = !has('--no-wrapper') && isReact;
const files = ['pixel-cat.js', ...(wantWrapper ? ['PixelCat.tsx'] : [])];

mkdirSync(dest, { recursive: true });
let copied = 0;
for (const f of files) {
  const to = join(dest, f);
  if (existsSync(to) && !has('--force')) {
    log(`  • skipped ${relative(cwd, to)} (already exists, use --force to overwrite)`);
    continue;
  }
  copyFileSync(join(pkgRoot, f), to);
  log(`  ✔ added ${relative(cwd, to)}`);
  copied++;
}

const rel = relative(cwd, dest).split('\\').join('/');
// Files in public/ (or static/) are served from the site root, so that folder name is not part of the URL
const urlPath = rel.replace(/^(public|static)(\/|$)/, '').replace(/^(.+)$/, '$1/');
log('\n  Next steps\n');
if (isNext) {
  const layout = existsSync(join(cwd, hasSrc ? 'src/app' : 'app')) ? `${hasSrc ? 'src/' : ''}app/layout.tsx` : 'your root layout';
  log(`  1. Open ${layout} and add the cat once, inside <body>:\n`);
  log(`       import PixelCat from '@/${rel.replace(/^src\//, '')}/PixelCat';`);
  log(`       ...`);
  log(`       <PixelCat perch="[data-cat-perch]" />\n`);
  log("     (the @/ alias is Next.js's default; use a relative path if your project has no alias)\n");
  log('  2. Add data-cat-perch to the elements it may jump on (headings, project cards).');
} else {
  log('  1. Load the script once and add the tag before </body>:\n');
  log(`       <script type="module" src="/${urlPath}pixel-cat.js"></script>`);
  log('       <pixel-cat perch="[data-cat-perch]"></pixel-cat>\n');
  log('     (serve the file from your public/static folder if your build tool requires it)\n');
  log('  2. Add data-cat-perch to the elements it may jump on (headings, project cards).');
}
log('\n  Docs: https://github.com/Tways-study/pixel-cat\n');
if (!copied) process.exitCode = 0;
