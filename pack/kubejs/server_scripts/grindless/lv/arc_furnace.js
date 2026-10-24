// -----------------------------------------------------------------------------------------------
// gtceu:arc_smelting recipes of the Submerged Arc Furnace (gtceu:submerged_arc_furnace), plus the graphite electrode.
//
// Every recipe draws 64 EU/t, written as 2 A at LV: .EUt(32, 2). GTM tiers a recipe by its VOLTAGE (a plain 64 EU/t would be
// "MV by number": EMI would show MV, and one LV hatch could not run it), so this is an LV recipe: "2 A LV" in the viewers.
// The structure asks for exactly 2 LV energy hatches (2 A each: 128 EU/t available; GTM also treats two equal hatches as one
// tier up), an electrode in the input bus (consumed by chance, 3 % of the cycles, like the drill bits), a fluid input hatch
// (the quench water), a fluid output hatch (CO2 / CO) and the chimney with its muffler hatch.
//
//   silicon      3 quartz sand dust + 2 coke dust + electrode + circuit 1 -> 1 ae2:silicon, 1/9 chance of ash, 2 000 mB CO2
//                (AE2 silicon ONLY: GT's own silicon stays on GTM's MV route, the electric blast furnace)
//   silicon_co   the same with circuit 2: the carbon leaves as 2 000 mB of carbon monoxide instead of CO2 (flammable and
//                poisonous: it goes to a tank, MV needs it for methanol). The CO2 of the first one is inert and can be vented
//                (void fluids in the controller's menu).
//   sky_dust     4 obsidian dust + 4 quartz sand dust + 1 charged certus quartz + electrode -> 4 ae2:sky_dust
//                (a melt, like an impact glass: this is the only source of sky dust)
//   obsidian     32 cobblestone + 4 000 mB water + electrode -> 4 obsidian (the arc melts the stone, the water quenches it and
//                flashes to steam out of the chimney). GTM's macerator turns 1 obsidian into 1 obsidian dust, so one run is the
//                4 dust a sky dust run takes. In GTM obsidian is HV in the rock breaker and lava-bound in the solidifier; here
//                it is LV from cobblestone and water. No fuel value anywhere (obsidian burns for nothing, the water is gone),
//                so there is no energy loop, unlike a lava recipe (lava is a steam boiler fuel in GTM).
//
// Where the byproducts go: the ash is the fertilizer of GTM's chemical reactor (calcite + 3 ash + water -> fertilizer, the
// fuel of the LV greenhouse's fertilizer variants); CO2 is vented; CO waits in a tank for MV chemistry.
//
// graphite electrode: GTM's graphite is dust only (no ingot, no rod), so the electrode is pressed: 4 graphite dust around a
// steel rod in an LV forming press. Graphite comes from the diamond vein (deep: needs the steel bit) and the ore line.
//
// Lookup note (GTM's RecipeDB): the two silicon recipes differ in the circuit, so neither ingredient list is a prefix of the
// other; no other arc_smelting recipe shares its first ingredients.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})

  const ELECTRODE = 'grindless:graphite_electrode'
  const ELECTRODE_WEAR = 300
  const VOLTAGE = 32
  const AMPERAGE = 2

  // published for the smoke test
  LV.arc = {
    electrode: ELECTRODE,
    voltage: VOLTAGE,
    amperage: AMPERAGE,
    eut: VOLTAGE * AMPERAGE,
    wear: ELECTRODE_WEAR,
    recipes: ['silicon', 'silicon_co', 'sky_dust', 'obsidian'].map(function (id) { return 'grindless:arc_smelting/' + id })
  }

  const NEEDED_ITEMS = ['gtceu:quartz_sand_dust', 'gtceu:coke_dust', 'gtceu:ash_dust', 'gtceu:obsidian_dust',
    'gtceu:graphite_dust', 'ae2:silicon', 'ae2:sky_dust', 'ae2:charged_certus_quartz_crystal', 'minecraft:cobblestone',
    'minecraft:obsidian', ELECTRODE]
  const NEEDED_FLUIDS = ['gtceu:carbon_dioxide', 'gtceu:carbon_monoxide', 'minecraft:water']
  LV.arc.neededItems = NEEDED_ITEMS
  LV.arc.neededFluids = NEEDED_FLUIDS

  ServerEvents.recipes(function (event) {
    var missing = NEEDED_ITEMS.filter(function (id) { return !Item.exists(id) })
      .concat(NEEDED_FLUIDS.filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error('[grindless/lv] arc furnace recipes skipped, unknown id(s): ' + missing.join(', '))
      return
    }

    function arc(id) {
      return event.recipes.gtceu.arc_smelting('grindless:' + id)
    }

    arc('silicon')
      .itemInputs('3x gtceu:quartz_sand_dust', '2x gtceu:coke_dust')
      .chancedInput(ELECTRODE, ELECTRODE_WEAR, 0)
      .circuit(1)
      .itemOutputs('1x ae2:silicon')
      .chancedOutput('1x gtceu:ash_dust', 1111, 0)
      .outputFluids(Fluid.of('gtceu:carbon_dioxide', 2000))
      .EUt(VOLTAGE, AMPERAGE).duration(200)

    arc('silicon_co')
      .itemInputs('3x gtceu:quartz_sand_dust', '2x gtceu:coke_dust')
      .chancedInput(ELECTRODE, ELECTRODE_WEAR, 0)
      .circuit(2)
      .itemOutputs('1x ae2:silicon')
      .chancedOutput('1x gtceu:ash_dust', 1111, 0)
      .outputFluids(Fluid.of('gtceu:carbon_monoxide', 2000))
      .EUt(VOLTAGE, AMPERAGE).duration(200)

    arc('sky_dust')
      .itemInputs('4x gtceu:obsidian_dust', '4x gtceu:quartz_sand_dust', '1x ae2:charged_certus_quartz_crystal')
      .chancedInput(ELECTRODE, ELECTRODE_WEAR, 0)
      .itemOutputs('4x ae2:sky_dust')
      .EUt(VOLTAGE, AMPERAGE).duration(300)

    arc('obsidian')
      .itemInputs('32x minecraft:cobblestone')
      .chancedInput(ELECTRODE, ELECTRODE_WEAR, 0)
      .inputFluids(Fluid.of('minecraft:water', 4000))
      .itemOutputs('4x minecraft:obsidian')
      .EUt(VOLTAGE, AMPERAGE).duration(300)

    // the electrode itself: LV forming press, graphite dust around a steel rod
    event.recipes.gtceu.forming_press('grindless:graphite_electrode')
      .itemInputs('4x gtceu:graphite_dust', '#forge:rods/steel')
      .itemOutputs('1x ' + ELECTRODE)
      .EUt(16).duration(200)

    console.info('[grindless/lv] arc_smelting recipes added: 4, graphite electrode press recipe added')
  })
})()
