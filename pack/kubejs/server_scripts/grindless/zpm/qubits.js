// priority: -26924
// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's solid-state qubit chain (machines: startup_scripts/grindless/zpm/qubits.js; docs/eras/zpm.md "Machines 10-12"; package
// ZPM-A6): the diamond lattice fab, the ion implanter, the qubit fab, the silicon-28 wafer route, our two alternative HPCA assembler
// recipes and the controllers' crafting recipes. The hot cell's silicon-28 mode is a row of data/grindless/tables/hot_cell.json.
//
//   gtceu:diamond_cvd        circuit 1  seed (not consumed) + 1,000 mB methane + 10,000 mB hydrogen -> 1 CVD diamond plate + 9,500 mB hydrogen
//                            circuit 2  the same + 10 mB nitrogen -> 1 nitrogen-doped plate           (the plasma recycles 95 % of its hydrogen)
//   gtceu:ion_implantation   circuit 1  1 nitrogen-doped plate + 1 mB nitrogen -> 4 NV diamond chips
//                            circuit 2  1 silicon-28 wafer + 1 phosphorus dust -> 1 donor qubit wafer
//   gtceu:qubit_fabrication  circuit 1  4 donor qubit wafers + the helium charge -> 1 qubit array   (the charge, 4,000 mB liquid helium, is
//                            circuit 2  16 NV diamond chips + the same charge -> 1 qubit array, slower   not consumed; 10 mB of Saturn's
//                                                                                                        helium is the make-up of a run)
//                            circuit 3  1 NbN film wafer (UV-A6's MOCVD) + the same charge -> 1 SNSPD array (UV-A7: the optical ground
//                                       station's detector, patterned and tested cold)
//   silicon-28 wafers        8 silicon-28 dust + 1,000 mB argon -> 1 boule (EBF, 2,000 K); 1 boule + 100 mB lubricant -> 8 wafers (cutter)
//   gtceu:assembler          hpca_computation_component: GTM's inputs with 1 qubit array in place of the 4 ZPM circuits (LuV, 200 t)
//                            hpca_advanced_computation_component: 2 qubit arrays in place of the 4 UV circuits (ZPM, 200 t)
//
// Destinations (rule 3 of AGENTS.md): no byproducts but the diamond line's hydrogen (looped back into the next run) and the helium that
// never leaves the cryostat. Lookup safety: the recipes of one type differ in the programmed circuit; our assembler recipes have a qubit array
// where GTM's have a circuit tag, so neither key set contains the other (checked at load, and live by gg_test_zpm_qubits). GTM's HPCA recipes
// stay. The recipes carry a cleanroom where GTM's do.
// Published in global.grindless.qubits: .recipes [{ name, type, recipeId, circuit, ... }], .hpca, .skipped, .clashes, .crafting.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var Q = G.qubits || (G.qubits = {})

  var ZPM_VA = 122880
  var LUV_VA = 30720

  var SEED = 'grindless:ice_giant_diamond_seed'
  var PLATE = 'grindless:cvd_diamond_plate'
  var DOPED = 'grindless:nitrogen_doped_cvd_plate'
  var NV = 'grindless:nv_diamond_chip'
  var SI28 = 'grindless:silicon_28_dust'
  var BOULE = 'grindless:silicon_28_boule'
  var WAFER = 'grindless:silicon_28_wafer'
  var DONOR = 'grindless:donor_qubit_wafer'
  var ARRAY = 'grindless:qubit_array'
  var PHOSPHORUS = 'gtceu:phosphorus_dust'
  var NBN = 'grindless:nbn_film_wafer'
  var SNSPD = G.uvFoundation && G.uvFoundation.ids && G.uvFoundation.ids.snspdArray ? G.uvFoundation.ids.snspdArray : 'grindless:snspd_array'

  var TABLE = [
    {
      name: 'cvd_diamond', type: 'diamond_cvd', circuit: 1,
      itemsIn: [], notConsumedItems: [SEED],
      fluidsIn: [{ id: 'gtceu:methane', amount: 1000 }, { id: 'gtceu:hydrogen', amount: 10000 }],
      itemsOut: [{ id: PLATE, count: 1 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 9500 }],
      eut: 30720, duration: 1200
    },
    {
      name: 'nitrogen_doped_diamond', type: 'diamond_cvd', circuit: 2,
      itemsIn: [], notConsumedItems: [SEED],
      fluidsIn: [{ id: 'gtceu:methane', amount: 1000 }, { id: 'gtceu:hydrogen', amount: 10000 }, { id: 'gtceu:nitrogen', amount: 10 }],
      itemsOut: [{ id: DOPED, count: 1 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 9500 }],
      eut: 30720, duration: 1200
    },
    {
      name: 'nv_diamond_chips', type: 'ion_implantation', circuit: 1,
      itemsIn: [{ id: DOPED, count: 1 }], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:nitrogen', amount: 1 }],
      itemsOut: [{ id: NV, count: 4 }], fluidsOut: [],
      eut: 30720, duration: 400
    },
    {
      name: 'donor_qubit_wafer', type: 'ion_implantation', circuit: 2,
      itemsIn: [{ id: WAFER, count: 1 }, { id: PHOSPHORUS, count: 1 }], notConsumedItems: [],
      fluidsIn: [],
      itemsOut: [{ id: DONOR, count: 1 }], fluidsOut: [],
      eut: 30720, duration: 600
    },
    {
      name: 'array_from_donors', type: 'qubit_fabrication', circuit: 1,
      itemsIn: [{ id: DONOR, count: 4 }], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:saturn_helium', amount: 10 }], notConsumedFluids: [{ id: 'gtceu:liquid_helium', amount: 4000 }],
      itemsOut: [{ id: ARRAY, count: 1 }], fluidsOut: [],
      eut: ZPM_VA, duration: 600
    },
    {
      name: 'array_from_chips', type: 'qubit_fabrication', circuit: 2,
      itemsIn: [{ id: NV, count: 16 }], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:saturn_helium', amount: 10 }], notConsumedFluids: [{ id: 'gtceu:liquid_helium', amount: 4000 }],
      itemsOut: [{ id: ARRAY, count: 1 }], fluidsOut: [],
      eut: ZPM_VA, duration: 1200
    },
    {
      name: 'snspd_array', type: 'qubit_fabrication', circuit: 3,
      itemsIn: [{ id: NBN, count: 1 }], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:saturn_helium', amount: 10 }], notConsumedFluids: [{ id: 'gtceu:liquid_helium', amount: 4000 }],
      itemsOut: [{ id: SNSPD, count: 1 }], fluidsOut: [],
      eut: ZPM_VA, duration: 600
    },
    {
      name: 'pb11_capsule', type: 'diamond_cvd', circuit: 3,
      itemsIn: [{ id: PLATE, count: 1 }], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:decaborane', amount: 500 }],
      itemsOut: [{ id: 'grindless:pb11_capsule', count: 1 }], fluidsOut: [],
      eut: ZPM_VA, duration: 400
    },
    {
      name: 'd_he3_capsule', type: 'diamond_cvd', circuit: 4,
      itemsIn: [{ id: PLATE, count: 1 }], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:deuterium', amount: 1000 }, { id: 'gtceu:helium_3', amount: 1000 }],
      itemsOut: [{ id: 'grindless:d_he3_capsule', count: 1 }], fluidsOut: [],
      eut: ZPM_VA, duration: 400
    }
  ]

  // UEV-A3: a plate spalled to nanodiamond grit under hydrogen, the feed of the megabar line (data/grindless/tables/megabar.json);
  // circuit 7: UHV betavoltaics owns this type's circuits 5 and 6
  TABLE.push({
    name: 'nanodiamond', type: 'diamond_cvd', circuit: 7,
    itemsIn: [{ id: PLATE, count: 1 }], notConsumedItems: [],
    fluidsIn: [{ id: 'gtceu:hydrogen', amount: 2000 }],
    itemsOut: [{ id: 'grindless:nanodiamond_dust', count: 4 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 1500 }],
    eut: ZPM_VA, duration: 400
  })

  // UIV-A5 (uiv.md line 11): a Si-28 wafer implanted with hydrogen for the smart-cut (circuit 6; 1-2 ZPM, 3-4 UHV, 5 UEV)
  TABLE.push({
    name: 'h_si28_wafer', type: 'ion_implantation', circuit: 6,
    itemsIn: [{ id: 'grindless:si28_fz_wafer', count: 1 }], notConsumedItems: [],
    fluidsIn: [{ id: 'gtceu:hydrogen', amount: 500 }],
    itemsOut: [{ id: 'grindless:h_si28_wafer', count: 1 }], fluidsOut: [],
    eut: 491520, duration: 600
  })

  // UIV-A10 (uiv.md lines 21 and 43): C-12 CVD diamond from the methanated fusion ash (diamond_cvd circuit 8), and its boron doping (ion_implantation circuit 7)
  TABLE.push({
    name: 'c12_cvd_plate', type: 'diamond_cvd', circuit: 8,
    itemsIn: [], notConsumedItems: [SEED],
    fluidsIn: [{ id: 'gtceu:carbon_12_methane', amount: 1000 }, { id: 'gtceu:hydrogen', amount: 10000 }],
    itemsOut: [{ id: 'grindless:c12_cvd_plate', count: 1 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 9500 }],
    eut: 491520, duration: 1200
  })
  TABLE.push({
    name: 'c12_boron_diamond', type: 'ion_implantation', circuit: 7,
    itemsIn: [{ id: 'grindless:c12_cvd_plate', count: 1 }, { id: 'gtceu:boron_dust', count: 1 }], notConsumedItems: [],
    fluidsIn: [],
    itemsOut: [{ id: 'grindless:c12_boron_diamond', count: 1 }], fluidsOut: [],
    eut: 491520, duration: 600
  })

  // UXV-A3 (uxv.md lines 6, 7, 44): the ion mill of the MTJ, MRAM and STNO stacks, an argon-beam etch (circuits 8-10; 1-2, 6-7 here, 3-5 in the photonics tables)
  ;[
    ['mtj_ion_etch', 8, 'annealed_mtj_wafer', 'etched_mtj_wafer'],
    ['mram_ion_etch', 9, 'annealed_mram_wafer', 'etched_mram_wafer'],
    ['stno_ion_mill', 10, 'stno_defined_wafer', 'stno_milled_wafer']
  ].forEach(function (e) {
    TABLE.push({
      name: e[0], type: 'ion_implantation', circuit: e[1],
      itemsIn: [{ id: 'grindless:' + e[2], count: 1 }], notConsumedItems: [],
      fluidsIn: [{ id: 'gtceu:argon', amount: 100 }],
      itemsOut: [{ id: 'grindless:' + e[3], count: 1 }], fluidsOut: [],
      eut: 491520, duration: 600
    })
  })

  // OpV-A1 (opv.md line 10): boron contacts implanted into the HPGe boule, the Compton crystal's p+ contact. opv.md's c9-10 are UXV-A3's
  // ion mills and c12-14 are OpV-A2's (photonics.json), so this is circuit 15.
  TABLE.push({
    name: 'hpge_contacts', type: 'ion_implantation', circuit: 15,
    itemsIn: [{ id: 'grindless:hpge_compton_boule', count: 1 }, { id: 'gtceu:boron_dust', count: 1 }], notConsumedItems: [],
    fluidsIn: [],
    itemsOut: [{ id: 'grindless:contacted_hpge_crystal', count: 1 }], fluidsOut: [],
    eut: 491520, duration: 600
  })

  // MAX-A3 (max.md, L8 steps 1-2): a thick low-defect diamond grown on a CVD plate (diamond_cvd circuit 9), then its boron delta layer
  // (ion_implantation circuit 11; c14 is OpV's sdd_rings, c15 hpge_contacts)
  TABLE.push({
    name: 'power_diamond_plate', type: 'diamond_cvd', circuit: 9,
    itemsIn: [{ id: PLATE, count: 1 }], notConsumedItems: [SEED],
    fluidsIn: [{ id: 'gtceu:methane', amount: 2000 }, { id: 'gtceu:hydrogen', amount: 10000 }],
    itemsOut: [{ id: 'grindless:power_diamond_plate', count: 1 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 9500 }],
    eut: 491520, duration: 1600
  })
  TABLE.push({
    name: 'boron_delta_diamond', type: 'ion_implantation', circuit: 11,
    itemsIn: [{ id: 'grindless:power_diamond_plate', count: 1 }, { id: 'gtceu:boron_dust', count: 1 }], notConsumedItems: [],
    fluidsIn: [{ id: 'gtceu:argon', amount: 100 }],
    itemsOut: [{ id: 'grindless:boron_delta_diamond', count: 1 }], fluidsOut: [],
    eut: 491520, duration: 800
  })
  // MAX-D2 (max.md, L21 step 3): the SiC dish blank ion-figured to its mirror surface (ion_implantation circuit 16; c11 is the delta layer above)
  TABLE.push({
    name: 'figured_dish_blank', type: 'ion_implantation', circuit: 16,
    itemsIn: [{ id: 'grindless:sic_dish_blank', count: 1 }], notConsumedItems: [],
    fluidsIn: [{ id: 'gtceu:argon', amount: 100 }],
    itemsOut: [{ id: 'grindless:figured_dish_blank', count: 1 }], fluidsOut: [],
    eut: 491520, duration: 1200
  })

  // MAX-E1 (max.md, L26 steps 1-2): a diamond grown for the collector panel (diamond_cvd circuit 10), then its p-i-n junction implanted
  // (ion_implantation circuit 17; c16 is the figured dish blank)
  TABLE.push({
    name: 'collector_diamond_plate', type: 'diamond_cvd', circuit: 10,
    itemsIn: [{ id: PLATE, count: 1 }], notConsumedItems: [SEED],
    fluidsIn: [{ id: 'gtceu:methane', amount: 2000 }, { id: 'gtceu:hydrogen', amount: 10000 }],
    itemsOut: [{ id: 'grindless:collector_diamond_plate', count: 1 }], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 9500 }],
    eut: 491520, duration: 1600
  })
  TABLE.push({
    name: 'pin_diamond_plate', type: 'ion_implantation', circuit: 17,
    itemsIn: [{ id: 'grindless:collector_diamond_plate', count: 1 }, { id: PHOSPHORUS, count: 1 }], notConsumedItems: [],
    fluidsIn: [{ id: 'gtceu:argon', amount: 100 }],
    itemsOut: [{ id: 'grindless:pin_diamond_plate', count: 1 }], fluidsOut: [],
    eut: 491520, duration: 800
  })

  Q.recipes = TABLE.map(function (t) {
    return {
      name: t.name, type: t.type, recipeId: 'grindless:' + t.type + '/' + t.name, circuit: t.circuit,
      itemsIn: t.itemsIn, notConsumedItems: t.notConsumedItems, fluidsIn: t.fluidsIn, notConsumedFluids: t.notConsumedFluids || [],
      itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration, energy: t.eut * t.duration
    }
  })

  // Our alternative HPCA recipes: GTM's inputs with qubit arrays where it has circuit tags. Published for the tests.
  Q.hpca = [
    {
      name: 'hpca_computation_component', recipeId: 'gtceu:assembler/' + 'hpca_computation_component',
      ours: 'grindless:assembler/hpca_computation_component_qubit',
      base: 'gtceu:hpca_empty_component', fieldGenerator: 'gtceu:luv_field_generator', arrays: 1,
      output: 'gtceu:hpca_computation_component', eut: LUV_VA, duration: 200
    },
    {
      name: 'hpca_advanced_computation_component', recipeId: 'gtceu:assembler/' + 'hpca_advanced_computation_component',
      ours: 'grindless:assembler/hpca_advanced_computation_component_qubit',
      base: 'gtceu:hpca_computation_component', fieldGenerator: 'gtceu:zpm_field_generator', arrays: 2,
      output: 'gtceu:hpca_advanced_computation_component', eut: ZPM_VA, duration: 200
    }
  ]

  Q.wafers = {
    boule: { id: 'grindless:electric_blast_furnace/silicon_28_boule_ebf', eut: 7680, duration: 1200, temp: 2000 },
    cutter: { id: 'grindless:cutter/silicon_28_wafers', eut: 7680, duration: 400 }
  }
  Q.skipped = []
  Q.clashes = []

  // ASSEMBLY LINE with scanner research: hull + the machine's ZPM parts + 4 ZPM circuits + two domain parts + soldering alloy + lubricant
  Q.crafting = [
    { id: 'grindless:assembly_line/diamond_lattice_fab', output: 'gtceu:diamond_lattice_fab', parts: ['2x gtceu:zpm_emitter'],
      domain: ['grindless:platinum_electrode', 'grindless:sapphire_test_mass'], research: 'grindless:solar_wing_panel' },
    { id: 'grindless:assembly_line/ion_implanter', output: 'gtceu:ion_implanter', parts: ['gtceu:zpm_emitter', 'gtceu:zpm_field_generator', PLATE],
      domain: ['grindless:magnetic_bearing', 'grindless:whipple_shield_casing'], research: 'grindless:coilgun_coil_casing' },
    { id: 'grindless:assembly_line/qubit_fab', output: 'gtceu:qubit_fab', parts: ['2x gtceu:zpm_sensor'],
      domain: ['grindless:luv_smes_cell', 'grindless:anchor_harpoon'], research: 'grindless:hss_s_drill_bit' }
  ]

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.notConsumedItems.forEach(function (id) { keys['i:' + id] = true })
    r.fluidsIn.concat(r.notConsumedFluids).forEach(function (x) { keys['f:' + x.id] = true })
    keys['circuit:' + r.circuit] = true
    return keys
  }

  function subset(a, b) {
    return Object.keys(a).every(function (k) { return b[k] === true })
  }

  function clashes() {
    var out = []
    for (var i = 0; i < Q.recipes.length; i++) {
      for (var j = i + 1; j < Q.recipes.length; j++) {
        if (Q.recipes[i].type !== Q.recipes[j].type) continue
        var a = keysOf(Q.recipes[i])
        var b = keysOf(Q.recipes[j])
        if (subset(a, b) || subset(b, a)) out.push(Q.recipes[i].name + ' / ' + Q.recipes[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.notConsumedItems.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.notConsumedFluids, r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  // GTM files a recipe as <namespace>:<type>/<path>: the id handed to it is <namespace>:<path>
  function shortId(id) { return 'grindless:' + id.substring(id.lastIndexOf('/') + 1) }

  function addChain(event) {
    Q.clashes = clashes()
    if (Q.clashes.length > 0) console.error(LOG + 'qubit chain recipes clash in the lookup: ' + Q.clashes.join(', '))
    Q.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        Q.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'qubit chain skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu[r.type](shortId(r.recipeId))
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      r.notConsumedItems.forEach(function (id) { recipe.notConsumable(id) })
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.notConsumedFluids.forEach(function (f) { recipe.notConsumableFluid(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'qubit chain recipes added: ' + (Q.recipes.length - Q.skipped.length))
  }

  // the silicon-28 wafers: GTM's boule and cutter recipes are keyed on gtceu:silicon_boule, so these are our own
  function addWafers(event) {
    var missing = [SI28, BOULE, WAFER].filter(function (id) { return !Item.exists(id) })
      .concat(['gtceu:argon', 'gtceu:lubricant'].filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      Q.skipped.push({ name: 'wafers', reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'silicon-28 wafer recipes skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.electric_blast_furnace(shortId(Q.wafers.boule.id))
      .itemInputs('8x ' + SI28)
      .inputFluids(Fluid.of('gtceu:argon', 1000))
      .itemOutputs('1x ' + BOULE)
      .blastFurnaceTemp(Q.wafers.boule.temp)
      .EUt(Q.wafers.boule.eut).duration(Q.wafers.boule.duration)
    event.recipes.gtceu.cutter(shortId(Q.wafers.cutter.id))
      .itemInputs('1x ' + BOULE)
      .inputFluids(Fluid.of('gtceu:lubricant', 100))
      .itemOutputs('8x ' + WAFER)
      .EUt(Q.wafers.cutter.eut).duration(Q.wafers.cutter.duration)
  }

  // our assembler recipes: arrays instead of circuits; same field generator, coolant and cleanroom as GTM's
  function addHpca(event) {
    var cleanroom = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType').CLEANROOM
    Q.hpca.forEach(function (h) {
      var missing = [h.base, h.fieldGenerator, h.output].filter(function (id) { return !Item.exists(id) })
        .concat(['gtceu:pcb_coolant'].filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        Q.skipped.push({ name: h.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'HPCA alternative skipped ' + h.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.assembler(shortId(h.ours))
        .itemInputs('1x ' + h.base, h.arrays + 'x ' + ARRAY, '1x ' + h.fieldGenerator)
        .inputFluids(Fluid.of('gtceu:pcb_coolant', 1000))
        .itemOutputs('1x ' + h.output)
        .cleanroom(cleanroom)
        .EUt(h.eut).duration(h.duration)
    })
  }

  function addCrafting(event) {
    Q.crafting.forEach(function (c) {
      var inputs = ['gtceu:zpm_machine_hull'].concat(c.parts, ['4x #gtceu:circuits/zpm'], c.domain.map(function (d) { return '2x ' + d }))
      var ids = inputs.concat([c.output, c.research]).map(function (v) { return v.replace(/^\d+x /, '') }).filter(function (v) { return v.charAt(0) !== '#' })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'qubit chain crafting ' + c.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line(c.id.replace('assembly_line/', ''))
      inputs.forEach(function (x) { b.itemInputs(x) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000))
      b.itemOutputs(c.output)
      b.scannerResearch(Item.of(c.research))
      b.EUt(ZPM_VA).duration(1200)
    })
  }

  ServerEvents.recipes(function (event) {
    try { addChain(event) } catch (e) { console.error(LOG + 'qubit chain recipes failed: ' + e) }
    try { addWafers(event) } catch (e2) { console.error(LOG + 'silicon-28 wafer recipes failed: ' + e2) }
    try { addHpca(event) } catch (e3) { console.error(LOG + 'HPCA alternatives failed: ' + e3) }
    try { addCrafting(event) } catch (e4) { console.error(LOG + 'qubit chain crafting failed: ' + e4) }
  })
})()
