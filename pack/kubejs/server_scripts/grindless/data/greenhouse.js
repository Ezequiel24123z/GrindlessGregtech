// priority: 100
// -----------------------------------------------------------------------------------------------
// Steam greenhouse data: what grows from which sapling / seed. Recipes are generated from this table by
// server_scripts/grindless/steam/greenhouse.js; electric greenhouses of later tiers can reuse it.
//
// Every entry is one recipe of gtceu:greenhouse. The `catalyst` (sapling or seed) is a NON-CONSUMED input: put
// it in the steam input bus and it keeps working. `outputs` are per run (4 runs in parallel in the steam greenhouse):
//   { item, n }                 n items every run
//   { item, n, chance }         n items with that chance (0..1) per run; with 4 parallels the totals are
//                               nearly deterministic (GTM rolls them together)
//
// Left out on purpose:
//   azalea / flowering azalea  their trunk is plain oak: nothing the oak entry does not already give
//   nether wart                 needs soul sand and the Nether; not a Steam Age resource
//   fertilizer variant          GTM's recipe lookup cannot hold "catalyst" and "catalyst + fertilizer" as two recipes
//                               of one type (the first is a prefix of the second and the lookup drops one of them);
//                               GT solves it with a programmed circuit, which only exists from LV. The LV greenhouse
//                               gets the boosted (x1.5) variants.
(function () {
  const G = global.grindless || (global.grindless = {})

  function tree(id, sapling, log, extras) {
    var outputs = [
      { item: log, n: 6 },
      { item: sapling, n: 1, chance: 0.15 },
      { item: 'minecraft:stick', n: 2, chance: 0.5 }
    ]
    return { id: id, kind: 'tree', catalyst: sapling, outputs: outputs.concat(extras || []) }
  }

  function crop(id, catalyst, output, n, seedBack) {
    var outputs = [{ item: output, n: n }]
    if (seedBack) outputs.push({ item: catalyst, n: 2, chance: 0.5 })
    return { id: id, kind: 'crop', catalyst: catalyst, outputs: outputs }
  }

  G.greenhouse = {
    // ticks; the steam multiblock modifier makes every cycle 1.5x longer: 400 -> 30 s
    duration: 400,
    // EU/t per run before the modifier (4 parallels: about 14 EU/t = 28 mB/t of steam)
    eut: 4,
    entries: [
      // ---- trees: 6 logs per run (24 per 30 s cycle), sometimes a sapling and sticks
      tree('oak', 'minecraft:oak_sapling', 'minecraft:oak_log', [{ item: 'minecraft:apple', n: 1, chance: 0.1 }]),
      tree('spruce', 'minecraft:spruce_sapling', 'minecraft:spruce_log'),
      tree('birch', 'minecraft:birch_sapling', 'minecraft:birch_log'),
      tree('jungle', 'minecraft:jungle_sapling', 'minecraft:jungle_log'),
      tree('acacia', 'minecraft:acacia_sapling', 'minecraft:acacia_log'),
      tree('dark_oak', 'minecraft:dark_oak_sapling', 'minecraft:dark_oak_log', [{ item: 'minecraft:apple', n: 1, chance: 0.1 }]),
      tree('cherry', 'minecraft:cherry_sapling', 'minecraft:cherry_log'),
      tree('mangrove', 'minecraft:mangrove_propagule', 'minecraft:mangrove_log'),
      // rubber tree: rubber logs and the sticky resin that GTM taps from them
      tree('rubber', 'gtceu:rubber_sapling', 'gtceu:rubber_log', [{ item: 'gtceu:sticky_resin', n: 3 }]),

      // ---- crops: the seed / the crop itself is the catalyst
      crop('wheat', 'minecraft:wheat_seeds', 'minecraft:wheat', 6, true),
      crop('sugar_cane', 'minecraft:sugar_cane', 'minecraft:sugar_cane', 6, false),
      crop('carrot', 'minecraft:carrot', 'minecraft:carrot', 6, false),
      crop('potato', 'minecraft:potato', 'minecraft:potato', 6, false),
      crop('beetroot', 'minecraft:beetroot_seeds', 'minecraft:beetroot', 6, true),
      crop('pumpkin', 'minecraft:pumpkin_seeds', 'minecraft:pumpkin', 3, true),
      crop('melon', 'minecraft:melon_seeds', 'minecraft:melon', 3, true),
      crop('cactus', 'minecraft:cactus', 'minecraft:cactus', 6, false),
      crop('cocoa', 'minecraft:cocoa_beans', 'minecraft:cocoa_beans', 8, false)
    ]
  }
})()
