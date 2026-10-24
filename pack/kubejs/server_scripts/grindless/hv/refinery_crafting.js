// -----------------------------------------------------------------------------------------------
// Recipes that make the two multiblocks of the HV refining line and the catalysts they run on (HV era):
//
//   Refinery (gtceu:refinery)         ASSEMBLER: HV hull + HV distillery + 2 HV chemical reactors + 2 HV electric pumps + 4 HV circuits.
//                                     The controller is the sum of what it replaces (the distillery of the distillation, the two reactors of
//                                     the desulfurization and the cracking, the pumps that feed the column). Ten items do not fit the 3x3 of a
//                                     crafting table, so it is made in an assembler, grindless:assembler/refinery.
//   Catalytic Reformer (gtceu:reformer)  CRAFTING TABLE: HV hull + HV chemical reactor + 2 HV electric pumps + 4 HV circuits
//   hydrotreating catalyst            MIXER: 1 cobalt dust + 1 molybdenum dust + 3 silicon dioxide dust -> 4 catalysts. Three ore lines meet in
//                                     it: cobalt (the nickel vein of the Overworld), molybdenum (the Nether vein) and silica (electrolysis of sand)
//   reforming catalyst                MIXER: 1 platinum dust + 3 silicon dioxide dust -> 4 catalysts. The platinum is the sheldonite vein of the End
//
// A catalyst is used up by chance (0.05 % of the runs), so four of them last for thousands of runs: the cost of this line is in the
// number of ore lines it crosses, not in the quantity.
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; the keys of ingredients are uppercase on purpose (lowercase letters are GT tool symbols).
(function () {
  const G = global.grindless || (global.grindless = {})
  const REF = G.refinery || (G.refinery = {})
  const RF = G.reformer || (G.reformer = {})

  const HULL = 'gtceu:hv_machine_hull'
  const DISTILLERY = 'gtceu:hv_distillery'
  const REACTOR = 'gtceu:hv_chemical_reactor'
  const PUMP = 'gtceu:hv_electric_pump'
  const SILICA = 'gtceu:silicon_dioxide_dust'

  const REFINERY_PARTS = [HULL, DISTILLERY, REACTOR, PUMP, 'gtceu:refinery']
  const REFORMER_PARTS = [HULL, REACTOR, PUMP, 'gtceu:reformer']
  const CATALYST_PARTS = ['gtceu:cobalt_dust', 'gtceu:molybdenum_dust', 'gtceu:platinum_dust', SILICA, 'grindless:hydrotreating_catalyst',
    'grindless:reforming_catalyst']
  REF.craftingParts = REFINERY_PARTS
  RF.craftingParts = REFORMER_PARTS
  REF.catalystParts = CATALYST_PARTS

  // published for the smoke test
  REF.craftingRecipes = { refinery: 'grindless:assembler/refinery', reformer: 'grindless:crafting/reformer' }
  REF.catalystRecipes = { hydrotreating: 'grindless:mixer/hydrotreating_catalyst', reforming: 'grindless:mixer/reforming_catalyst' }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error('[grindless/hv] refining line crafting recipes failed: ' + e)
    }
  })

  function missingOf(ids) {
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  function addRecipes(event) {
    var missingRefinery = missingOf(REFINERY_PARTS)
    if (missingRefinery.length > 0) {
      console.error('[grindless/hv] Refinery recipe skipped, unknown item(s): ' + missingRefinery.join(', '))
    } else {
      event.recipes.gtceu.assembler('grindless:refinery')
        .itemInputs(HULL, DISTILLERY, '2x ' + REACTOR, '2x ' + PUMP, '4x #gtceu:circuits/hv')
        .itemOutputs('gtceu:refinery')
        .EUt(120).duration(400)
    }

    var missingReformer = missingOf(REFORMER_PARTS)
    if (missingReformer.length > 0) {
      console.error('[grindless/hv] Catalytic Reformer recipe skipped, unknown item(s): ' + missingReformer.join(', '))
    } else {
      event.recipes.gtceu.shaped('gtceu:reformer', ['CRC', 'PHP', 'C C'], {
        C: '#gtceu:circuits/hv',
        R: REACTOR,
        P: PUMP,
        H: HULL
      }).id('grindless:crafting/reformer')
    }

    var missingCatalyst = missingOf(CATALYST_PARTS)
    if (missingCatalyst.length > 0) {
      console.error('[grindless/hv] catalyst recipes skipped, unknown item(s): ' + missingCatalyst.join(', '))
    } else {
      event.recipes.gtceu.mixer('grindless:hydrotreating_catalyst')
        .itemInputs('1x gtceu:cobalt_dust', '1x gtceu:molybdenum_dust', '3x ' + SILICA)
        .itemOutputs('4x grindless:hydrotreating_catalyst')
        .EUt(120).duration(300)

      event.recipes.gtceu.mixer('grindless:reforming_catalyst')
        .itemInputs('1x gtceu:platinum_dust', '3x ' + SILICA)
        .itemOutputs('4x grindless:reforming_catalyst')
        .EUt(120).duration(300)
    }
    console.info('[grindless/hv] refining line crafting recipes added')
  }
})()
