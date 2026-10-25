// -----------------------------------------------------------------------------------------------
// Productive Bees (productivebees): bees are kept for what they do on their own (wax, honey, pollen, nests, the mob-drop
// combs below), but combs only give MATERIALS through GregTech machines and never ores, ingots or dusts directly
// (docs/eras/mv.md, "Mods and integration" + "Decisions taken": a second way to automate, not a shortcut).
//  1. Every centrifuge recipe of a material comb (productivebees:centrifuge/<group>/..., 94 loaded here) is removed:
//     raw_materials (iron, copper, gold, tin, nickel, titanium, tungsten, platinum, iridium, osmium...), alloys (STEEL,
//     bronze, brass, invar, electrum), gems (diamond, emerald, lapis, quartz, ruby...), dusts (redstone, sulfur, zinc,
//     blaze...), materials (SILICON, STICKY RESIN), gtceu (28 combs of GT ores), ae2 (fluix, spatial), fluids, tconstruct.
//     Only the shroom group (mushrooms) is kept: the greenhouse grows them anyway.
//  2. The base combs that hand out progression items are removed too: ender (ender pearls), ghostly (ghast tears),
//     sculk (echo shards), withered (wither skull fragments), fossilised (coal), obsidian_dust (GT obsidian dust) and
//     draconic. Bone, rotten flesh, string, slime, gunpowder, prismarine, snow/ice and magma cream combs stay.
//  3. productivebees:honey_generator is not craftable: honey -> Forge Energy is a generator, and this pack enables the
//     GT FE converters (config/gtceu.yaml), so it would be a free EU source.
//  4. The magmatic bee's block conversion cobblestone -> lava (renewable lava = free boiler fuel) and blackstone ->
//     gilded blackstone (gold nuggets) are removed; the other conversions (water, ice, soul sand, crying obsidian,
//     repairs) are harmless.
//  5. The advanced hives (productivebees:hives/advanced_<wood>_beehive, 14 woods) need an MV CIRCUIT instead of the campfire:
//     a bee farm with Productive Bees hives is an MV build. Vanilla hives and bee cages still work earlier.
//  6. The way back, through the GT CENTRIFUGE (30 s): for every ore (raw_materials, incl. iron, copper and gold; gtceu group), gem
//     and dust comb whose PB recipe was removed and whose material has an era in COMB_ERA (item 7), one GT centrifuge recipe:
//     1 comb (the NBT of PB's recipe) -> wax + 50 mB honey + the material PB used to give (the GT item of the same tag, or the item
//     the recipe names) with HALF of PB's chance. Alloy combs (steel, bronze...), silicon, sticky resin, AE2 and fluid combs get
//     no recipe: those materials have their own GT lines.
//  7. Tiers: each recipe of item 6 runs at the EU/t of the era that opens the comb's material (docs/eras/*.md, data/grindless/tables/veins*.json):
//       MV   120 EU/t  Overworld and Nether vein materials (PB's own floor) and glowstone (redstone byproduct); bauxite, vanadium magnetite and gold too (End veins have them, Overworld veins open them first);
//                      and what only the End veins give, now that the End is MV (veins_end.json, mv.md): raw aluminium, chromite, cooperite (sheldonite comb), zircon.
//       EV  1920 EU/t  platinum-group metals (ev.md: platinum plant): platinum, palladium.
//       IV  7680 EU/t  radioactives and Ir/Os (veins_excluded.json until IV; ev.md decision 3): naquadah, uranium (radioactive comb), osmium.
//       MOON 480 EU/t  materials only the Moon has (data/grindless/tables/offworld_only.json, worlds.moon.combs: ilmenite, titanium).
//       MARS 1920 EU/t materials only Mars has (worlds.mars.combs: tungsten, scheelite, tungstate; scheelite and tungstate left the End
//                      for Mars). MOON and MARS recipes also carry their world's dimension (worlds.<world>.dimension), so the bees can
//                      live on Earth but their titanium only comes out on the Moon and their tungsten only on Mars.
//     No recipe: materials the pack does not open before LuV (fluorite: no vein or recipe makes it; neutronium) and combs that would
//     skip a line (iridium nuggets: the IV iridium chain; blaze powder and rods: HV chemical reactor and simulator; netherite scrap).
//     A comb missing from COMB_ERA gets no recipe and is named in the server log.
// Bees only ever produce combs (the 101 hive recipes make configurable combs and pollen; bone, chorus, fish, sponge, spider eye
// and a few special combs are the only plain items), so no bee gives an ore, ingot or dust directly.
// The 28 GregTech bees have no breeding recipe in Productive Bees (spawn egg only; PB's own gcteu:* recipes turn the spawn egg
// of another bee into a GT bee in GT machines).
// Era: MV (hives and the MV combs); every other comb follows the era of its material (item 7).
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/productivebees] '
  var MATERIAL_GROUPS = /^productivebees:centrifuge\/(raw_materials|gems|dusts|gtceu)\/.+/
  var DURATION = 600
  var CHANCE_SCALE = 0.5

  // item 7: comb name (productivebees:centrifuge/<group>/honeycomb_<name>) -> era of its material -> EU/t
  var ERA_EUT = { MV: 120, HV: 480, EV: 1920, IV: 7680, MOON: 480, MARS: 1920 }
  var WORLDS = global.grindless.readJsonTable('kubejs/data/grindless/tables/offworld_only.json').worlds
  var ERA_DIMENSION = { MOON: WORLDS.moon.dimension, MARS: WORLDS.mars.dimension }
  var COMB_ERA = {}
  var setEra = function (era, names) {
    names.forEach(function (n) { COMB_ERA[n] = era })
  }
  setEra('MV', [
    'iron', 'copper', 'gold', 'leaden', 'nickel', 'silver', 'tin', 'zinc',
    'amethyst', 'apatite', 'cinnabar', 'cinnabar_dust', 'diamond', 'emerald', 'green_sapphire', 'lapis', 'lepidolite', 'malachite',
    'opal', 'pyrope', 'quartz', 'ruby', 'sapphire', 'sodalite', 'topaz',
    'glowing', 'redstone', 'saltpeter', 'sulfur',
    'barite', 'bastnasite', 'bauxite', 'cobaltite', 'electrotine', 'galena', 'graphite', 'molybdenum', 'neodymium', 'oilsands',
    'pyrochlore', 'pyrolusite', 'realgar', 'sphalerite', 'stibnite', 'tantalite', 'tetrahedrite', 'tricalcium_phosphate',
    'vanadium_magnetite',
    'aluminium', 'chromite', 'sheldonite', 'zircon'
  ])
  setEra('EV', ['platinum', 'palladium'])
  setEra('IV', ['naquadah', 'radioactive', 'osmium'])
  setEra('MOON', WORLDS.moon.combs)
  setEra('MARS', WORLDS.mars.combs)

  ServerEvents.recipes(function (event) {
    // read the material combs BEFORE removing them: the GT recipes are built from the same data
    var combs = []
    event.forEachRecipe({ id: MATERIAL_GROUPS }, function (r) {
      try {
        combs.push({ id: String(r.getId()), json: JSON.parse(String(r.json)) })
      } catch (e) {
        console.error(LOG + 'cannot read ' + r.getId() + ': ' + e)
      }
    })

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

    // GT item of a tag: the gtceu one if there is one, else the first member
    var itemOfTag = function (tag) {
      var ids = Ingredient.of('#' + tag).getItemIds().toArray()
      var first = null
      for (var i = 0; i < ids.length; i++) {
        var id = String(ids[i])
        if (id.indexOf('gtceu:') === 0) return id
        if (first === null) first = id
      }
      return first
    }

    var made = { MV: 0, HV: 0, EV: 0, IV: 0, MOON: 0, MARS: 0 }
    var total = 0
    var noEra = []
    var skipped = 0
    if (Item.exists('productivebees:wax') && Item.exists('productivebees:configurable_honeycomb')) {
      combs.forEach(function (c) {
        try {
          var path = String(c.id).replace(/^productivebees:centrifuge\//, '')
          var comb = path.replace(/^.*\//, '').replace(/^(honey)?comb_/, '')
          var era = COMB_ERA.hasOwnProperty(comb) ? COMB_ERA[comb] : null
          if (era === null) { noEra.push(path); return }
          var ingredient = c.json.ingredient
          var result = null
          var chance = 0
          var outs = c.json.outputs || []
          for (var i = 0; i < outs.length; i++) {
            var out = outs[i]
            if (!out.item) continue
            if (out.item.tag && /^forge:(raw_materials|gems|dusts)\//.test(out.item.tag)) {
              result = itemOfTag(String(out.item.tag))
              chance = out.chance || 100
            } else if (out.item.item && String(out.item.item) !== 'productivebees:wax') {
              // a plain item: PB's iron, copper, gold and amethyst combs name the vanilla raw ore or shard
              result = String(out.item.item)
              chance = out.chance || 100
            }
          }
          if (result === null || !Item.exists(result) || !ingredient || !ingredient.nbt) { skipped++; return }
          // PB writes the comb NBT as an object (most groups) or as an SNBT string (gtceu group)
          var nbt = typeof ingredient.nbt === 'string' ? ingredient.nbt : JSON.stringify(ingredient.nbt)
          var name = path.replace(/[^a-z0-9_\/]/g, '_')
          var recipe = event.recipes.gtceu.centrifuge('grindless:pb/' + name)
            .itemInputs(Item.of('productivebees:configurable_honeycomb', nbt).strongNBT())
            .itemOutputs('productivebees:wax')
            .chancedOutput('1x ' + result, Math.max(1, Math.min(9999, Math.round(chance * 100 * CHANCE_SCALE))), 0)
            .outputFluids(Fluid.of('productivebees:honey', 50))
            .EUt(ERA_EUT[era])
            .duration(DURATION)
          // a material of another world comes out only there (GTM's dimension condition)
          if (ERA_DIMENSION.hasOwnProperty(era)) recipe.dimension(ERA_DIMENSION[era])
          made[era]++
          total++
        } catch (e) {
          skipped++
          console.error(LOG + 'recipe for ' + c.id + ' failed: ' + e)
        }
      })
    }
    console.info(LOG + 'GT centrifuge comb recipes: ' + total + ' (MV ' + made.MV + ', HV ' + made.HV + ', EV ' + made.EV + ', IV ' +
      made.IV + ', Moon ' + made.MOON + ', Mars ' + made.MARS + ') of ' + combs.length + ' material combs; no era, no recipe: ' + (noEra.length > 0 ? noEra.join(', ') : 'none') +
      '; skipped (no output item or NBT): ' + skipped)
  })
})()
