// priority: -16324
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
//   crafting                    the controller (iv.md "Built with"), made in the assembler: IV hull + IV electric furnace + IV chemical reactor +
//                               2 IV electric pumps + 4 IV circuits + 2 platinum electrodes + 4 sintered regolith + soldering alloy and sulfuric
//                               acid, grindless:assembler/fluorspar_kiln.
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
  FK.craftingRecipe = 'grindless:assembler/fluorspar_kiln'
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

  // UEV-A4 rows: the electron beam line's NaF and KF come back as HF, and its calcium comes back as fluorite. The kiln has one item slot,
  // so the input item tells the rows apart.
  var UEV_ROWS = [
    {
      name: 'hf_from_alkali_fluoride',
      itemIn: { id: 'grindless:alkali_fluoride_dust', count: 4 }, fluidIn: { id: 'gtceu:sulfuric_acid', amount: 1000 },
      itemOut: { id: 'grindless:alkali_sulfate_dust', count: 7 }, fluidOut: { id: 'gtceu:hydrofluoric_acid', amount: 2000 },
      eut: 30, duration: 64
    },
    {
      name: 'calcium_fluoride_return',
      itemIn: { id: 'gtceu:calcium_dust', count: 1 }, fluidIn: { id: 'gtceu:hydrofluoric_acid', amount: 2000 },
      itemOut: { id: 'gcyr:fluorite_dust', count: 3 }, fluidOut: { id: 'gtceu:hydrogen', amount: 2000 },
      eut: 30, duration: 64
    }
  ]

  // UIV-A7 row (uiv.md line 22): Th-229 metal fluorinated to ThF4, Th + 4 HF -> ThF4 + 2 H2 (the hydrogen goes back to the plant).
  var UIV_ROWS = [
    {
      name: 'thf4_from_thorium_229',
      itemIn: { id: 'grindless:thorium_229', count: 1 }, fluidIn: { id: 'gtceu:hydrofluoric_acid', amount: 4000 },
      itemOut: { id: 'grindless:thf4', count: 1 }, fluidOut: { id: 'gtceu:hydrogen', amount: 2000 },
      eut: 30, duration: 64
    }
  ]

  // UXV-A2 rows (docs/eras/uxv.md, "Fluorspar kiln"): the spintronic oxides, calcined from the charges the mixer makes (spin_feed.js: the
  // two oxides kneaded wet, so each calcine gives off its water, or its CO2 for the SrCO3), and fluorine from hydrogen fluoride. The kiln
  // has one item and one fluid out, so the fluorine row's hydrogen is flared off at the cathode (it is not a product) and the KF electrolyte
  // comes back in full.
  var UXV_ROWS = [
    {
      name: 'five_n_magnesia',
      itemIn: { id: 'grindless:magnesium_hydroxide_dust', count: 2 }, fluidIn: { id: 'gtceu:argon', amount: 1000 },
      itemOut: { id: 'grindless:five_n_magnesia_dust', count: 2 }, fluidOut: { id: 'gtceu:steam', amount: 2000 },
      eut: 30, duration: 64
    },
    {
      name: 'dysco3_calcine',
      itemIn: { id: 'grindless:dysco3_charge_dust', count: 2 }, fluidIn: { id: 'gtceu:oxygen', amount: 1000 },
      itemOut: { id: 'gtceu:dysco3_dust', count: 2 }, fluidOut: { id: 'gtceu:steam', amount: 1000 },
      eut: 30, duration: 64
    },
    {
      name: 'srruo3_calcine',
      itemIn: { id: 'grindless:srruo3_charge_dust', count: 2 }, fluidIn: { id: 'gtceu:oxygen', amount: 1000 },
      itemOut: { id: 'gtceu:srruo3_dust', count: 2 }, fluidOut: { id: 'gtceu:carbon_dioxide', amount: 1000 },
      eut: 30, duration: 64
    },
    {
      name: 'la_bfo_calcine',
      itemIn: { id: 'grindless:la_bfo_charge_dust', count: 2 }, fluidIn: { id: 'gtceu:oxygen', amount: 1000 },
      itemOut: { id: 'gtceu:la_bfo_dust', count: 2 }, fluidOut: { id: 'gtceu:steam', amount: 1000 },
      eut: 30, duration: 64
    },
    {
      name: 'ggg_calcine',
      itemIn: { id: 'grindless:ggg_charge_dust', count: 2 }, fluidIn: { id: 'gtceu:oxygen', amount: 1000 },
      itemOut: { id: 'gtceu:ggg_dust', count: 2 }, fluidOut: { id: 'gtceu:steam', amount: 1000 },
      eut: 30, duration: 64
    },
    {
      name: 'fluorine_from_hf',
      itemIn: { id: 'grindless:alkali_fluoride_dust', count: 1 }, fluidIn: { id: 'gtceu:hydrofluoric_acid', amount: 2000 },
      itemOut: { id: 'grindless:alkali_fluoride_dust', count: 1 }, fluidOut: { id: 'gtceu:fluorine', amount: 1000 },
      eut: 30, duration: 64
    }
  ]

  // OpV-D1 rows (opv.md line 20): beryllium and the beam window's scrap (the braze trim and worn windows) fluorinated to BeF2 for the
  // electron beam's calcium reduction, Be + 2 HF -> BeF2 + H2 (the hydrogen goes back to the plant, as the ThF4 row's).
  // OpV-A1 row (docs/eras/opv.md line 9): the hot cell's thorium-229 nitrate fluorinated to laser-grade ThF4 for the lasing CaF2 boule;
  // the nitric acid goes back to the hot cell.
  var OPV_ROWS = [
    {
      name: 'be_fluoride_from_beryllium',
      itemIn: { id: 'gtceu:beryllium_dust', count: 1 }, fluidIn: { id: 'gtceu:hydrofluoric_acid', amount: 2000 },
      itemOut: { id: 'grindless:be_fluoride_dust', count: 3 }, fluidOut: { id: 'gtceu:hydrogen', amount: 2000 },
      eut: 30, duration: 64
    },
    {
      name: 'be_fluoride_from_window_scrap',
      itemIn: { id: 'grindless:be_window_scrap', count: 1 }, fluidIn: { id: 'gtceu:hydrofluoric_acid', amount: 2000 },
      itemOut: { id: 'grindless:be_fluoride_dust', count: 3 }, fluidOut: { id: 'gtceu:hydrogen', amount: 2000 },
      eut: 30, duration: 64
    },
    {
      name: 'laser_grade_thf4',
      itemIn: { id: 'grindless:thorium_229_nitrate', count: 1 }, fluidIn: { id: 'gtceu:hydrofluoric_acid', amount: 4000 },
      itemOut: { id: 'grindless:laser_grade_thf4', count: 1 }, fluidOut: { id: 'gtceu:nitric_acid', amount: 4000 },
      eut: 30, duration: 64
    }
  ]

  function addUevRows(event, rows) {
    ;(rows || UEV_ROWS).forEach(function (r) {
      var missing = []
      if (!Item.exists(r.itemIn.id)) missing.push(r.itemIn.id)
      if (!Item.exists(r.itemOut.id)) missing.push(r.itemOut.id)
      if (!Fluid.exists(r.fluidIn.id)) missing.push(r.fluidIn.id)
      if (!Fluid.exists(r.fluidOut.id)) missing.push(r.fluidOut.id)
      if (missing.length > 0) {
        console.error(LOG + 'fluorspar kiln row ' + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.fluorspar_digestion('grindless:' + r.name)
        .itemInputs(r.itemIn.count + 'x ' + r.itemIn.id)
        .inputFluids(Fluid.of(r.fluidIn.id, r.fluidIn.amount))
        .itemOutputs(r.itemOut.count + 'x ' + r.itemOut.id)
        .outputFluids(Fluid.of(r.fluidOut.id, r.fluidOut.amount))
        .addDataString(FK.dataKey || 'grindless_fluorspar_kiln', r.name)
        .EUt(r.eut)
        .duration(r.duration)
      FK.recipes.push('grindless:' + TYPE_PATH + '/' + r.name)
    })
  }

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'fluorspar kiln controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:fluorspar_kiln')
      .itemInputs('gtceu:iv_machine_hull', 'gtceu:iv_electric_furnace', 'gtceu:iv_chemical_reactor', '2x gtceu:iv_electric_pump',
        '4x #gtceu:circuits/iv', '2x grindless:platinum_electrode', '4x grindless:sintered_regolith')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 288), Fluid.of('gtceu:sulfuric_acid', 1000))
      .itemOutputs(CONTROLLER)
      .EUt(1920).duration(600)
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
      addUevRows(event)
    } catch (e3) {
      console.error(LOG + 'fluorspar kiln UEV rows failed: ' + e3)
    }
    try {
      addUevRows(event, UIV_ROWS)
    } catch (e4) {
      console.error(LOG + 'fluorspar kiln UIV rows failed: ' + e4)
    }
    try {
      addUevRows(event, UXV_ROWS)
    } catch (e5) {
      console.error(LOG + 'fluorspar kiln UXV rows failed: ' + e5)
    }
    try {
      addUevRows(event, OPV_ROWS)
    } catch (e6) {
      console.error(LOG + 'fluorspar kiln OpV rows failed: ' + e6)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'fluorspar kiln controller recipe failed: ' + e2)
    }
  })
})()
