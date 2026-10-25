// -----------------------------------------------------------------------------------------------
// The fluorspar kiln's recipe and controller (machine and recipe type: startup_scripts/grindless/iv/fluorspar_kiln.js; docs/eras/iv.md,
// "Fluorspar kiln"; package IV-A6).
//
//   gtceu:fluorspar_digestion   one recipe, one charge, id grindless:fluorspar_digestion/hydrofluoric_acid_from_fluorite (GTM's builder puts
//                               the type in front):
//                                 3 fluorite dust (gcyr:fluorite_dust, CaF2: 3 dust are one formula) + 1,000 mB sulfuric acid
//                                 + 2,000 mB water -> 2,000 mB hydrofluoric acid + 8 gypsum dust, 30 EU/t for 64 ticks (1,920 EU)
//                               CaF2 + H2SO4 + 2 H2O -> CaSO4.2H2O + 2 HF. The figures are GTM's own acid attack on a calcium mineral,
//                               chemical_reactor/phosphoric_acid_from_apatite (5,000 mB acid + 10,000 mB water, 30 EU/t for 320 ticks, 40
//                               gypsum dust), per 1,000 mB of acid: 1,920 EU, 64 ticks, 2,000 mB water and 8 gypsum dust, GTM's gypsum
//                               unit for one CaSO4.2H2O (8 gypsum dust electrolyse back into the charge's 1 calcium, 1 sulfur and 2,000 mB
//                               water). The kiln itself is dry and makes anhydrite; the water quenches it into gypsum at the discharge, so
//                               every atom of the charge is accounted for. The unreacted fluorite is recycled to the feed inside the kiln:
//                               a charge gives the full 2,000 mB. The kiln runs up to 256 charges at once with no overclock (its
//                               modifier), so every charge costs 1,920 EU at any feed and hatch: one IV hatch draws 7,680 EU/t at full
//                               feed.
//   crafting                    the controller (GTM shaped recipe, iv.md "Built with"): IV hull + IV electric furnace + IV chemical reactor +
//                               2 IV electric pumps + 4 IV circuits, grindless:crafting/fluorspar_kiln.
//
// Destinations: the HF goes to the naquadah plant, the hot cell's enrichment (40,000 mB per LEU assembly's uranium) and GTM's PTFE line;
// the gypsum to GTM's concrete (mixer/concrete_from_calcite and concrete_from_marble: 1 gypsum dust per 1,152 mB), and through it to the
// radiation-proof casing of the reactor and the hot cell; the surplus gypsum is inert and can be voided (the kiln only refuses fluid voiding).
//
// Published for the smoke test: global.grindless.fluorsparKiln.charge { name, recipeId, fluorite { id, count }, acid { id, amount },
// water { id, amount }, hf { id, amount }, gypsum { id, count }, eut, duration, energy, reference }, .recipes (the ids added),
// .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var FK = G.fluorsparKiln || (G.fluorsparKiln = {})

  var TYPE_PATH = 'fluorspar_digestion'
  var CHARGE = {
    name: 'hydrofluoric_acid_from_fluorite',
    fluorite: { id: 'gcyr:fluorite_dust', count: 3 },
    acid: { id: 'gtceu:sulfuric_acid', amount: 1000 },
    // the quench: gypsum's two waters of crystallisation (vanilla water, as the pack's other recipes name it; GTM's forge:water)
    water: { id: 'minecraft:water', amount: 2000 },
    hf: { id: 'gtceu:hydrofluoric_acid', amount: 2000 },
    gypsum: { id: 'gtceu:gypsum_dust', count: 8 },
    eut: 30,
    duration: 64,
    // GTM's recipe the figures come from: per 1,000 mB of its acid, the same EU, ticks, water and gypsum (checked by the smoke test)
    reference: 'gtceu:chemical_reactor/phosphoric_acid_from_apatite'
  }
  CHARGE.energy = CHARGE.eut * CHARGE.duration
  CHARGE.recipeId = 'grindless:' + TYPE_PATH + '/' + CHARGE.name
  FK.charge = CHARGE

  var CONTROLLER = 'gtceu:fluorspar_kiln'
  var CONTROLLER_PARTS = [CONTROLLER, 'gtceu:iv_machine_hull', 'gtceu:iv_electric_furnace', 'gtceu:iv_chemical_reactor', 'gtceu:iv_electric_pump']
  FK.craftingRecipe = 'grindless:crafting/fluorspar_kiln'
  FK.craftingParts = CONTROLLER_PARTS

  function addCharge(event) {
    var missing = []
    ;[CHARGE.fluorite.id, CHARGE.gypsum.id].forEach(function (id) { if (!Item.exists(id)) missing.push(id) })
    ;[CHARGE.acid.id, CHARGE.water.id, CHARGE.hf.id].forEach(function (id) { if (!Fluid.exists(id)) missing.push(id) })
    if (missing.length > 0) {
      console.error(LOG + 'fluorspar kiln: no recipe, unknown id(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.fluorspar_digestion('grindless:' + CHARGE.name)
      .itemInputs(CHARGE.fluorite.count + 'x ' + CHARGE.fluorite.id)
      .inputFluids(Fluid.of(CHARGE.acid.id, CHARGE.acid.amount))
      .inputFluids(Fluid.of(CHARGE.water.id, CHARGE.water.amount))
      .itemOutputs(CHARGE.gypsum.count + 'x ' + CHARGE.gypsum.id)
      .outputFluids(Fluid.of(CHARGE.hf.id, CHARGE.hf.amount))
      .addDataString(FK.dataKey || 'grindless_fluorspar_kiln', CHARGE.name)
      .EUt(CHARGE.eut)
      .duration(CHARGE.duration)
    FK.recipes.push(CHARGE.recipeId)
    console.info(LOG + 'fluorspar kiln: ' + CHARGE.recipeId + ' ' + CHARGE.fluorite.count + ' fluorite + ' + CHARGE.acid.amount + ' mB acid + ' +
      CHARGE.water.amount + ' mB water -> ' + CHARGE.hf.amount + ' mB HF + ' + CHARGE.gypsum.count + ' gypsum, ' + CHARGE.duration + ' t x ' +
      CHARGE.eut + ' EU/t = ' + CHARGE.energy + ' EU per charge, up to ' + (FK.maxCharges || 256) + ' charges at once')
  }

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'fluorspar kiln controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    // GTM shaped: lowercase letters are tool symbols, so ingredient keys are uppercase
    event.recipes.gtceu.shaped(CONTROLLER, ['CFC', 'PHP', 'CRC'], {
      C: '#gtceu:circuits/iv',
      F: 'gtceu:iv_electric_furnace',
      P: 'gtceu:iv_electric_pump',
      H: 'gtceu:iv_machine_hull',
      R: 'gtceu:iv_chemical_reactor'
    }).id(FK.craftingRecipe)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    FK.recipes = []
    try {
      addCharge(event)
    } catch (e) {
      console.error(LOG + 'fluorspar kiln recipe failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'fluorspar kiln controller recipe failed: ' + e2)
    }
  })
})()
