// Writes the generated era chapters (EV to MAX, and later MAX+) from the data in tools/quests/<era>-chapter/ through the shared writer
// (lib/chapter-gen.mjs). Replaces the per-era gen.mjs files.
//
// Usage: node tools/quests/gen-chapters.mjs [--era ev,luv] [--chapter luv_age,zpm_age] [--out <dir>|-] [--every-package] [--pending]
//   (none)           every era chapter, into the book (pack/config/ftbquests/quests/chapters)
//   --era            only these eras
//   --chapter        only these chapters, by file name (without .snbt)
//   --out <dir>      write there instead of the book; "-" prints one chapter on stdout and its counts on stderr
//   --every-package  pretend every package of a gated era has landed (the draft of the finished chapter; use with --out)
//   --pending        print the quests left out by the package gate and the ids they wait for, by package
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ERAS, loadEras, buildWorld, renderWorld, countsLine, pendingReport } from './lib/chapter-gen.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..');
const book = path.join(repo, 'pack', 'config', 'ftbquests', 'quests', 'chapters');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
function opt(name) {
  const i = args.indexOf(name);
  if (i < 0) return null;
  if (i + 1 >= args.length) throw new Error(`${name} needs a value`);
  return args[i + 1];
}
const list = (s) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : null);

const known = new Set(['--era', '--chapter', '--out', '--every-package', '--pending']);
for (const a of args) {
  if (a.startsWith('--') && !known.has(a)) {
    console.error(`unknown option ${a}\nusage: node tools/quests/gen-chapters.mjs [--era ev,luv] [--chapter luv_age] [--out <dir>|-] [--every-package] [--pending]`);
    process.exit(2);
  }
}

const eraArg = list(opt('--era'));
const chapterArg = list(opt('--chapter'));
const outArg = opt('--out');
for (const e of eraArg || []) if (!ERAS.includes(e)) { console.error(`unknown era "${e}" (eras: ${ERAS.join(', ')})`); process.exit(2); }

const eraMods = await loadEras(here);
const world = buildWorld(eraMods, { allPackages: flag('--every-package') });

let chapters = renderWorld(world, eraArg || [...world.eras.keys()]);
if (chapterArg) {
  const missing = chapterArg.filter((c) => !chapters.some((ch) => ch.filename === c));
  if (missing.length) { console.error(`no such chapter: ${missing.join(', ')} (known: ${chapters.map((c) => c.filename).join(', ')})`); process.exit(2); }
  chapters = chapters.filter((c) => chapterArg.includes(c.filename));
}

if (flag('--pending')) {
  for (const era of eraArg || [...world.eras.keys()]) for (const line of pendingReport(world, era)) console.log(line);
}

if (outArg === '-') {
  if (chapters.length !== 1) { console.error('--out - prints one chapter: name it with --chapter'); process.exit(2); }
  process.stdout.write(chapters[0].text);
  console.error(`${chapters[0].filename}: ${countsLine(chapters[0].counts)}`);
} else {
  const dir = outArg ? path.resolve(outArg) : book;
  fs.mkdirSync(dir, { recursive: true });
  for (const ch of chapters) {
    const file = path.join(dir, ch.filename + '.snbt');
    fs.writeFileSync(file, ch.text, { encoding: 'utf8' });
    console.log(`wrote ${file}: ${countsLine(ch.counts)}`);
  }
}
