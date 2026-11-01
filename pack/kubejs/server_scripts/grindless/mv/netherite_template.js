// priority: -21099
// -----------------------------------------------------------------------------------------------
// The netherite upgrade smithing template (cost curve band A, LV review). Vanilla only finds it in bastions and copies it from an
// existing one, so with nothing to copy the matrix listed the five LV netherite tools as unreachable. A pack where nothing is gathered
// by hand needs a route: an MV assembler makes one from 7 diamonds, a netherrack and a netherite scrap (ancient debris, the nether
// drill's material), so the netherite tools and the copy recipe both have a source.
(function () {
  ServerEvents.recipes(function (event) {
    var needed = ['minecraft:netherite_upgrade_smithing_template', 'minecraft:diamond', 'minecraft:netherrack', 'minecraft:netherite_scrap']
    var missing = needed.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/mv] netherite template skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:netherite_upgrade_smithing_template')
      .itemInputs('7x minecraft:diamond', '1x minecraft:netherrack', '1x minecraft:netherite_scrap')
      .itemOutputs('1x minecraft:netherite_upgrade_smithing_template')
      .duration(200)
      .EUt(120)
  })
})()
