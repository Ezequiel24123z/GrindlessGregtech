// -----------------------------------------------------------------------------------------------
// gtceu:sulfide_roasting recipes of the Sulfide Roaster (gtceu:sulfide_roaster), its vanadium contact catalyst and its controller.
//
// GTM 7.5.3 roasts these sulfides in the electric blast furnace (recipes gtceu:electric_blast_furnace/<ore>_metallurgy, read in
// the 0.4.1 recipe dump): 1 dust + 3 000 mB of oxygen, 120 EU/t, 120 ticks, 1 200 K ->
//   sphalerite    zincite + 1/9 ash + 1 000 mB SO2          pyrite        hematite + 1/9 ash + 2 000 mB SO2
//   galena        massicot + 6 silver nuggets + 1 000 mB SO2  stibnite      antimony trioxide + 1/9 ash + 1 500 mB SO2
//   tetrahedrite  cupric oxide + 3 tiny antimony trioxide + 2 000 mB SO2
// and makes acid from the SO2 in two chemical reactor steps (SO2 + 1 000 O2 -> SO3; SO3 + 1 000 water -> 1 000 mB H2SO4).
//
// Here each roast is one run, same energy (30 V x 4 A = 120 EU/t, the 4 A of the two LV energy hatches), same time, same solid
// outputs (the test compares them with the EBF recipes), and:
//   air instead of oxygen  15 000 mB of air = GTM's 3 000 mB of oxygen (air is about one fifth oxygen; the nitrogen leaves with the
//                          tail gas, inert). The converter burns on the excess oxygen of that air, as in a real plant.
//   acid instead of SO2    the SO2 never leaves: 1 mB of sulfuric acid per mB of SO2, with GTM's 1 mB of water each
//   steam back             the waste-heat boiler and the acid coolers: 3 200 mB of steam per 1 000 mB of SO2 (+ its water at
//                          GTM's 1:160), 11-22 % of the run's energy back through an LV steam turbine
//   catalyst               grindless:contact_catalyst in the input bus, worn by chance (2 % of the runs)
// Plus the plain sulfur burner of an acid plant: 1 sulfur dust + 7 500 mB of air (1 500 mB of oxygen) + water -> 1 000 mB of acid
// + steam, 30 EU/t (one amp, the blowers), 60 ticks. It returns a little less energy than it takes (no power loop from sulfur).
//
// Where the by-products go: zincite, massicot, antimony trioxide and cupric oxide go to the LV electrolyzer (zinc, lead, antimony,
// copper, and their oxygen back); hematite smelts into iron in any furnace; the silver nuggets become ingots; the ash is the
// fertilizer of the chemical reactor; the acid is GT chemistry (persulfate, bisulfate, HCl...); the steam goes to the turbines.
//
// Lookup note (GTM's RecipeDB): every recipe starts with a different dust, so no ingredient list is a prefix of another.
(function () {
  const G = global.grindless
  const LVC = G.lvContent || (G.lvContent = {})

  const CATALYST = 'grindless:contact_catalyst'
  const CATALYST_WEAR = 200
  const VOLTAGE = 30
  const AMPERAGE = 4
  const DURATION = 120
  const AIR_PER_ROAST = 15000
  const STEAM_PER_1000_SO2 = 3200
  const STEAM_PER_WATER = 160

  // the GTM 7.5.3 EBF roasts, one row each (outputs exactly as in the EBF recipe, MachineRecipeLoader.registerBlastFurnaceMetallurgyRecipes;
  // chanced = [item, GTM chance fraction])
  const ROASTS = [
    { id: 'sphalerite', so2: 1000, outputs: ['1x gtceu:zincite_dust'], chanced: [['gtceu:ash_dust', '1/9']] },
    { id: 'pyrite', so2: 2000, outputs: ['1x gtceu:hematite_dust'], chanced: [['gtceu:ash_dust', '1/9']] },
    { id: 'galena', so2: 1000, outputs: ['1x gtceu:massicot_dust', '6x gtceu:silver_nugget'], chanced: [] },
    { id: 'stibnite', so2: 1500, outputs: ['1x gtceu:antimony_trioxide_dust'], chanced: [['gtceu:ash_dust', '1/9']] },
    { id: 'tetrahedrite', so2: 2000, outputs: ['1x gtceu:cupric_oxide_dust', '3x gtceu:tiny_antimony_trioxide_dust'], chanced: [] }
  ]
  const SULFUR = { id: 'sulfur', so2: 1000, air: 7500, amperage: 1, duration: 60 }

  function steamOf(so2) {
    return so2 * STEAM_PER_1000_SO2 / 1000
  }

  function waterOf(so2) {
    return so2 + steamOf(so2) / STEAM_PER_WATER
  }

  // published for the smoke test
  LVC.roaster = {
    catalyst: CATALYST,
    wear: CATALYST_WEAR,
    voltage: VOLTAGE,
    amperage: AMPERAGE,
    duration: DURATION,
    air: AIR_PER_ROAST,
    roasts: ROASTS.map(function (r) {
      return { id: r.id, recipe: 'grindless:sulfide_roasting/' + r.id, ebf: 'gtceu:electric_blast_furnace/' + r.id + '_metallurgy',
        input: '#forge:dusts/' + r.id, so2: r.so2, steam: steamOf(r.so2), water: waterOf(r.so2), outputs: r.outputs, chanced: r.chanced }
    }),
    sulfur: { recipe: 'grindless:sulfide_roasting/sulfur', so2: SULFUR.so2, air: SULFUR.air, steam: steamOf(SULFUR.so2),
      water: waterOf(SULFUR.so2), amperage: SULFUR.amperage, duration: SULFUR.duration },
    catalystRecipe: 'grindless:mixer/contact_catalyst',
    controllerRecipe: 'grindless:crafting/sulfide_roaster'
  }

  const NEEDED_ITEMS = [CATALYST, 'gtceu:zincite_dust', 'gtceu:hematite_dust', 'gtceu:massicot_dust', 'gtceu:silver_nugget',
    'gtceu:antimony_trioxide_dust', 'gtceu:cupric_oxide_dust', 'gtceu:tiny_antimony_trioxide_dust', 'gtceu:ash_dust',
    'gtceu:vanadium_dust', 'gtceu:diatomite_dust', 'gtceu:lv_chemical_reactor', 'gtceu:lv_electric_pump', 'gtceu:lv_machine_hull',
    'gtceu:heatproof_machine_casing', 'gtceu:steel_firebox_casing']
  const NEEDED_FLUIDS = ['gtceu:air', 'minecraft:water', 'gtceu:sulfuric_acid', 'gtceu:steam']
  LVC.roaster.neededItems = NEEDED_ITEMS
  LVC.roaster.neededFluids = NEEDED_FLUIDS

  ServerEvents.recipes(function (event) {
    var missing = NEEDED_ITEMS.filter(function (id) { return !Item.exists(id) })
      .concat(NEEDED_FLUIDS.filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error('[grindless/lv] sulfide roaster recipes skipped, unknown id(s): ' + missing.join(', '))
      return
    }

    ROASTS.forEach(function (r) {
      var recipe = event.recipes.gtceu.sulfide_roasting('grindless:' + r.id)
        .itemInputs('1x #forge:dusts/' + r.id)
        .chancedInput(CATALYST, CATALYST_WEAR, 0)
        .inputFluids(Fluid.of('gtceu:air', AIR_PER_ROAST), Fluid.of('minecraft:water', waterOf(r.so2)))
      r.outputs.forEach(function (out) { recipe.itemOutputs(out) })
      r.chanced.forEach(function (c) { recipe.chancedOutput('1x ' + c[0], c[1], 0) })
      recipe.outputFluids(Fluid.of('gtceu:sulfuric_acid', r.so2), Fluid.of('gtceu:steam', steamOf(r.so2)))
        .EUt(VOLTAGE, AMPERAGE).duration(DURATION)
    })

    event.recipes.gtceu.sulfide_roasting('grindless:' + SULFUR.id)
      .itemInputs('1x #forge:dusts/sulfur')
      .chancedInput(CATALYST, CATALYST_WEAR, 0)
      .inputFluids(Fluid.of('gtceu:air', SULFUR.air), Fluid.of('minecraft:water', waterOf(SULFUR.so2)))
      .outputFluids(Fluid.of('gtceu:sulfuric_acid', SULFUR.so2), Fluid.of('gtceu:steam', steamOf(SULFUR.so2)))
      .EUt(VOLTAGE, SULFUR.amperage).duration(SULFUR.duration)

    // the catalyst: vanadium (LV centrifuge of vanadium magnetite) on a diatomite carrier, like the real V2O5 contact masses
    event.recipes.gtceu.mixer('grindless:contact_catalyst')
      .itemInputs('1x #forge:dusts/vanadium', '4x #forge:dusts/diatomite')
      .itemOutputs('4x ' + CATALYST)
      .EUt(16).duration(200)

    // the controller: built with the LV chemical reactor it replaces
    event.recipes.gtceu.shaped('gtceu:sulfide_roaster', ['CRC', 'PHP', 'BKB'], {
      C: '#gtceu:circuits/lv',
      R: 'gtceu:lv_chemical_reactor',
      P: 'gtceu:lv_electric_pump',
      H: 'gtceu:lv_machine_hull',
      B: 'gtceu:heatproof_machine_casing',
      K: 'gtceu:steel_firebox_casing'
    }).id('grindless:crafting/sulfide_roaster')

    console.info('[grindless/lv] sulfide_roasting recipes added: ' + (ROASTS.length + 1) + ', contact catalyst and controller recipes added')
  })
})()
