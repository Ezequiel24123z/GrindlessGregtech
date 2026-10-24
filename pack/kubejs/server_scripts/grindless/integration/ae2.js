// -----------------------------------------------------------------------------------------------
// Applied Energistics 2 on the LV era (docs/eras/lv.md, "Decisiones tomadas" #1, #2 and #6).
//
// HYBRID approach: AE2 stays AE2 (inscriber, charger, processors, cells, channels...). Only its ENTRY POINTS
// are rerouted through GregTech so that the whole mod can be unlocked at LV without meteorites. Everything is
// generated from kubejs/data/grindless/tables/ae2_gt.json; every other AE2 recipe is left untouched.
//
//   entry point                        before (AE2)                       now
//   ---------------------------------  ---------------------------------  ------------------------------------------
//   Inscriber, Charger                 crafting table: iron + copper      LV assembler: LV hull + motor/pistons + circuit
//   ME Controller, Drive, Energy       crafting table: iron, glass...     LV assembler: LV hull + the AE2 parts they
//   Acceptor, Molecular Assembler,                                        already asked for (processors, cores, fluix...)
//   Interface, Pattern Provider
//   the 4 presses                      found in meteorites, copied in     LV forming press: steel plate + certus,
//                                      the inscriber with an iron block   diamond, gold or silicon (no meteorites;
//                                                                         the meteorite presses are off in the AE2 config)
//   Silicon                            smelting certus dust               removed; it only comes from the Submerged Arc
//                                                                         Furnace (gtceu:arc_smelting, other script)
//   Sky stone                          unchanged: sky dust -> furnace     (sky dust also comes from the arc furnace; the
//                                                                         LV electric furnace reads AE2's smelting recipes)
//   Certus quartz crystal              ore / meteorites                   GT autoclave now gives the AE2 crystal
//   Charged certus                     AE2 charger only                   + LV polarizer (EU only, no ME power needed)
//   Fluix crystal                      throw charged certus, redstone     + LV mixer (charged certus, redstone, quartzite
//                                      and NETHER quartz in water         dust, water): no Nether trip needed
//   Annihilation core, light detector  ask for Nether quartz              the quartzite gem is added to ae2:all_nether_quartz
//                                      (the core is needed by interface, pattern provider, molecular assembler...)
//
// Certus quartz unification: GTM has its own gtceu:certus_quartz_gem. AE2's recipes that ask for the explicit AE2
// crystal (calculation print, charger, quartz block) are re-added with the tag #grindless:ae2/certus_quartz
// (AE2 crystal + GT gem, never the charged one), and the GT autoclave gives the AE2 crystal.
//
// AE2 config (pack/config/ae2/common.json): spawnPressesInMeteorites = false.
// GTM config (pack/config/gtceu.yaml): compat.energy.enableFEConverters = true (EU -> FE converter recipes).
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  const TABLE_PATH = 'kubejs/data/grindless/tables/ae2_gt.json'
  const LOG = '[grindless/ae2] '
  const COOKING = ['minecraft:smelting', 'minecraft:blasting', 'minecraft:smoking', 'minecraft:campfire_cooking']

  // path is relative to the game directory, like global.grindless.readJsonTable in the startup scripts
  function readTable() {
    var json = JsonIO.readJson(TABLE_PATH)
    if (json == null) {
      throw new Error(LOG + 'cannot read ' + TABLE_PATH)
    }
    return JSON.parse(JsonIO.toPrettyString(json))
  }

  // "2x gtceu:lv_electric_piston" -> "gtceu:lv_electric_piston"; tags ("#...") are not checked here
  function plainItemId(text) {
    var s = String(text).replace(/^\d+x\s+/, '')
    return s.charAt(0) === '#' ? null : s
  }

  function missingItems(recipe) {
    var ids = []
    recipe.in.forEach(function (text) { ids.push(plainItemId(text)) })
    if (recipe.out) ids.push(plainItemId(recipe.out))
    var chanced = recipe.chanced || []
    chanced.forEach(function (o) { ids.push(plainItemId(o.item)) })
    return ids.filter(function (id) { return id !== null && !Item.exists(id) })
  }

  ServerEvents.tags('item', function (event) {
    var table = readTable()
    Object.keys(table.tags).forEach(function (tag) {
      table.tags[tag].forEach(function (id) {
        event.add(tag, id)
      })
    })
    Object.keys(table.extendTags).forEach(function (tag) {
      table.extendTags[tag].forEach(function (id) {
        event.add(tag, id)
      })
    })
  })

  ServerEvents.recipes(function (event) {
    var table = readTable()
    var stats = { removed: 0, gt: 0, custom: 0, skipped: 0 }

    function remove(id) {
      event.remove({ id: id })
      stats.removed++
    }

    // 1. shortcuts and replaced entry points
    table.removeOnly.forEach(function (r) { remove(r.id) })
    table.removeCookingOutputs.forEach(function (output) {
      COOKING.forEach(function (type) {
        event.remove({ type: type, output: output })
      })
    })
    table.recipes.forEach(function (r) { (r.replaces || []).forEach(remove) })
    table.custom.forEach(function (r) { (r.replaces || []).forEach(remove) })

    // 2. GregTech machine recipes: gtceu:<type> recipes end up with the id grindless:<type>/ae2/<key>
    table.recipes.forEach(function (r) {
      var missing = missingItems(r)
      if (missing.length > 0) {
        console.error(LOG + 'skipping ' + r.key + ': unknown items ' + missing.join(', '))
        stats.skipped++
        return
      }
      try {
        var builder = event.recipes.gtceu[r.type]('grindless:ae2/' + r.key)
        r.in.forEach(function (item) { builder.itemInputs(item) })
        var fluids = r.fluidIn || []
        fluids.forEach(function (fluid) { builder.inputFluids(fluid) })
        if (r.out) builder.itemOutputs(r.out)
        var chanced = r.chanced || []
        chanced.forEach(function (o) { builder.chancedOutput(o.item, o.chance, 0) })
        builder.EUt(r.eut).duration(r.duration)
        stats.gt++
      } catch (e) {
        console.error(LOG + 'recipe ' + r.key + ' failed: ' + e)
        stats.skipped++
      }
    })

    // 3. AE2 recipes that have to take the unified certus tag
    table.custom.forEach(function (r) {
      try {
        event.custom(r.json).id(r.id)
        stats.custom++
      } catch (e) {
        console.error(LOG + 'recipe ' + r.id + ' failed: ' + e)
        stats.skipped++
      }
    })

    console.info(LOG + 'removed=' + stats.removed + ' gtceu=' + stats.gt + ' custom=' + stats.custom + ' skipped=' + stats.skipped)
  })
})()
