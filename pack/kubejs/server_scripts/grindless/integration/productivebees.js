// -----------------------------------------------------------------------------------------------
// Productive Bees (productivebees): bees are kept for what they do on their own (wax, honey, pollen, nests, the mob-drop
// combs below), but the ways around GregTech's material progression are cut:
//  1. Every centrifuge recipe of a material comb (productivebees:centrifuge/<group>/..., 94 loaded here) is removed:
//     raw_materials (iron, copper, gold, tin, nickel, titanium, tungsten, platinum, iridium, osmium...), alloys (STEEL,
//     bronze, brass, invar, electrum), gems (diamond, emerald, lapis, quartz, ruby...), dusts (redstone, sulfur, zinc,
//     blaze...), materials (SILICON, STICKY RESIN), gtceu (28 combs of GT ores), ae2 (fluix, spatial), fluids, tconstruct.
//     Without them a bee farm cannot replace the vein drill, ore processing, rubber trees or the silicon line. Only the
//     shroom group (mushrooms) is kept: the greenhouse grows them anyway.
//  2. The base combs that hand out progression items are removed too: ender (ender pearls), ghostly (ghast tears),
//     sculk (echo shards), withered (wither skull fragments), fossilised (coal), obsidian_dust (GT obsidian dust) and
//     draconic. Bone, rotten flesh, string, slime, gunpowder, prismarine, snow/ice and magma cream combs stay.
//  3. productivebees:honey_generator is not craftable: honey -> Forge Energy is a generator, and this pack enables the
//     GT FE converters (config/gtceu.yaml), so it would be a free EU source.
//  4. The magmatic bee's block conversion cobblestone -> lava (renewable lava = free boiler fuel) and blackstone ->
//     gilded blackstone (gold nuggets) are removed; the other conversions (water, ice, soul sand, crying obsidian,
//     repairs) are harmless.
//  5. The advanced hives (productivebees:hives/advanced_<wood>_beehive, 14 woods) need an MV CIRCUIT instead of the campfire:
//     a bee farm with Productive Bees hives is an MV build (docs/eras/mv.md). Vanilla hives and bee cages still work earlier.
// The 28 GregTech bees have no breeding recipe in Productive Bees (spawn egg only; PB's own gcteu:* recipes turn the spawn egg
// of another bee into a GT bee in GT machines), and their combs are not processed by anything after this script.
// Era: MV. A later "bees" step can bring the comb -> material step back through GregTech machines (macerator, centrifuge,
// electrolyzer, like the gcteu:* recipes PB ships for GT bees) instead of the Productive Bees centrifuge.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    event.remove({ id: /^productivebees:centrifuge\/(?!shroom\/)[^\/]+\/.+/ })
    var baseCombs = ['ender', 'ghostly', 'sculk', 'withered', 'fossilised', 'obsidian_dust', 'draconic']
    baseCombs.forEach(function (name) {
      event.remove({ id: 'productivebees:centrifuge/honeycomb_' + name })
    })
    event.remove({ id: 'productivebees:honey_generator' })
    event.remove({ id: 'productivebees:block_conversion/cobble_to_lava' })
    event.remove({ id: 'productivebees:block_conversion/blackstone_to_gilded_blackstone' })

    event.forEachRecipe({ id: /^productivebees:hives\/advanced_[a-z_]+_beehive$/ }, function (r) {
      var key = r.json.getAsJsonObject('key')
      var campfire = key.get('F')
      if (campfire != null && campfire.isJsonObject()) {
        campfire.getAsJsonObject().addProperty('tag', 'gtceu:circuits/mv')
        r.save()
      }
    })
  })
})()
