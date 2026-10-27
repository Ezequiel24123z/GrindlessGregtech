// priority: -21224
// -----------------------------------------------------------------------------------------------
// Crafting-table recipes of the two MV multiblocks of this file set, made by hand from the machines they replace (nothing here needs a machine):
//
//   Ore Plant     MV hull + MV macerator + MV ore washer + MV thermal centrifuge + MV centrifuge + 4 MV circuits
//                 (the four steps of GTM's ore chain: the controller is the sum of the machines it replaces)
//   Biorefinery   MV hull + 2 MV distilleries + 2 MV electric pumps + 2 steel pipe casings + 2 MV circuits
//                 (the column is the distilleries it replaces, with the pumps and pipes that feed it)
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; the keys of ingredients are uppercase on purpose (lowercase letters are GT tool symbols).
(function () {
  const G = global.grindless
  const OP = G.orePlant || (G.orePlant = {})
  const BIO = G.biorefinery || (G.biorefinery = {})

  const PLANT_PARTS = ['gtceu:mv_machine_hull', 'gtceu:mv_macerator', 'gtceu:mv_ore_washer', 'gtceu:mv_thermal_centrifuge',
    'gtceu:mv_centrifuge', 'gtceu:ore_plant']
  const BIO_PARTS = ['gtceu:mv_machine_hull', 'gtceu:mv_distillery', 'gtceu:mv_electric_pump', 'gtceu:steel_pipe_casing', 'gtceu:biorefinery']
  OP.craftingParts = PLANT_PARTS
  BIO.craftingParts = BIO_PARTS

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error('[grindless/mv] MV multiblock crafting recipes failed: ' + e)
    }
  })

  function addRecipes(event) {
    var missingPlant = PLANT_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missingPlant.length > 0) {
      console.error('[grindless/mv] Ore Plant crafting recipe skipped, unknown item(s): ' + missingPlant.join(', '))
    } else {
      event.recipes.gtceu.shaped('gtceu:ore_plant', ['CMC', 'WHT', 'CZC'], {
        C: '#gtceu:circuits/mv',
        M: 'gtceu:mv_macerator',
        W: 'gtceu:mv_ore_washer',
        H: 'gtceu:mv_machine_hull',
        T: 'gtceu:mv_thermal_centrifuge',
        Z: 'gtceu:mv_centrifuge'
      }).id('grindless:crafting/ore_plant')
    }

    var missingBio = BIO_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missingBio.length > 0) {
      console.error('[grindless/mv] Biorefinery crafting recipe skipped, unknown item(s): ' + missingBio.join(', '))
    } else {
      event.recipes.gtceu.shaped('gtceu:biorefinery', ['CDC', 'PHP', 'TDT'], {
        C: '#gtceu:circuits/mv',
        D: 'gtceu:mv_distillery',
        P: 'gtceu:mv_electric_pump',
        H: 'gtceu:mv_machine_hull',
        T: 'gtceu:steel_pipe_casing'
      }).id('grindless:crafting/biorefinery')
    }
  }
})()
