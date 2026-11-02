// Active blocks per structure (#230, the Mirror Shell note). GTM 7.5.3 relights the ActiveBlocks of a working multiblock one recursive
// structure check per block when it breaks (WorkableMultiblockMachine.onStructureInvalid); 1,528 superconducting coils overflowed the
// server stack. This counts the cells of every structure whose symbol can be one of GTM's ActiveBlocks and fails above MAX_ACTIVE_BLOCKS.
// Pure functions over the structure descriptions (global.grindless.structures); no Minecraft.

/** The largest count today, the annihilation engine (136 heat vents + 128 fusion coils); the Mirror Shell's 1,528 overflowed. */
export const MAX_ACTIVE_BLOCKS = 264;

/** GTM's ActiveBlock ids: the wire coils (CoilBlock), the fusion and superconducting coils and the heat vent. */
export const ACTIVE_BLOCK = /^gtceu:(?:[a-z0-9_]+_coil_block|fusion_coil|superconducting_coil|heat_vent)$/;

function optionsOf(sym) {
  if (!sym) return [];
  return sym.kind === 'oneOf' ? (sym.options || []).flatMap(optionsOf) : [sym];
}

const isActive = (sym) => optionsOf(sym).some((o) => o.kind === 'blocks' && (o.blocks || []).some((b) => ACTIVE_BLOCK.test(b)));

/** Cells of one structure description whose symbol can be an ActiveBlock. */
export function activeBlocksOf(desc) {
  let n = 0;
  for (const slice of desc.slices || []) for (const row of slice) for (const ch of String(row)) if (ch !== ' ' && isActive((desc.symbols || {})[ch])) n++;
  return n;
}

/** [{id, count}] of the structures (an array or an id-keyed object) with at least one, largest first. */
export function activeBlockCounts(structures) {
  const list = Array.isArray(structures) ? structures : Object.values(structures || {});
  return list.map((d) => ({ id: d.id, count: activeBlocksOf(d) })).filter((r) => r.count > 0).sort((a, b) => b.count - a.count || (a.id < b.id ? -1 : 1));
}

/** The structures above the ceiling. */
export function activeBlockViolations(structures, ceiling = MAX_ACTIVE_BLOCKS) {
  return activeBlockCounts(structures).filter((r) => r.count > ceiling);
}
