// Counts GTM ActiveBlocks per structure of the pack's scripts and fails above the ceiling (lib/active_blocks.mjs).
//   node tools/analysis/active-blocks.mjs [--top N]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadStructures } from './structure-quality.mjs';
import { activeBlockCounts, MAX_ACTIVE_BLOCKS } from './lib/active_blocks.mjs';

const args = process.argv.slice(2);
const topAt = args.indexOf('--top');
const top = topAt >= 0 ? Number(args[topAt + 1]) : 10;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const counts = activeBlockCounts(await loadStructures(['--static']));
  counts.slice(0, top).forEach((r) => console.log(`${String(r.count).padStart(5)}  ${r.id}`));
  const bad = counts.filter((r) => r.count > MAX_ACTIVE_BLOCKS);
  console.log(`active-blocks: ${counts.length} structure(s) with active blocks, largest ${counts[0] ? counts[0].count : 0}, ceiling ${MAX_ACTIVE_BLOCKS}, ${bad.length} above`);
  process.exit(bad.length ? 1 : 0);
}
