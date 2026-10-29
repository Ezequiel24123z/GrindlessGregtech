// UXV-A3 (docs/eras/uxv.md "A3"): the GTM-type steps of the spintronic rows: slicing, polishing and annealing the substrate boules, the hBN leach,
// the CVT crystal clean-up, the mu-metal and Finemet charges, the mu-metal hot strip mill and shield can, the STNO clean. The rows on our own
// machines are in the shared tables (electron_beam, composites, crystals, levitation_melter, megabar, photonics) and uv/photonics.js, zpm/qubits.js.
// Published in global.grindless.spinRows: .cutting, .polishing, .anneals, .chemistry, .mixing, .hotRolling, .assembly ([{ id, path, type, circuit,
// itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration, temp }]), .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var SR = G.spinRows || (G.spinRows = {})

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(name, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration, temp) {
    return { id: 'grindless:uxv/' + name, path: 'uxv/' + name, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut,
      fluidsOut: fluidsOut, eut: eut, duration: duration, temp: temp || null }
  }

  var LUBRICANT = 'gtceu:lubricant'
  var WATER = 'gtceu:distilled_water'
  var ARGON = 'gtceu:argon'
  var GA2O3 = 'grindless:gallium_oxide_dust'

  // boules sawn into four slices; the oxide kerf of the Ga2O3 plate goes back to its dust (the garnet and scandate kerf is inert and is voided)
  SR.cutting = [
    row('dysco3_slices', 'cutter', null, [item('grindless:dysco3_boule', 1)], [fluid(LUBRICANT, 100)],
      [item('grindless:dysco3_slice', 4)], [], 1920, 200),
    row('ggg_slices', 'cutter', null, [item('grindless:ggg_boule', 1)], [fluid(LUBRICANT, 100)],
      [item('grindless:ggg_slice', 4)], [], 1920, 200),
    row('ga2o3_slices', 'cutter', null, [item('grindless:ga2o3_efg_plate', 1)], [fluid(LUBRICANT, 100)],
      [item('grindless:ga2o3_slice', 4), item(GA2O3, 1)], [], 1920, 200)
  ]

  // chemical-mechanical polish; the Ga2O3 slice ends as the F1 wafer
  SR.polishing = [
    row('dysco3_polish', 'chemical_bath', null, [item('grindless:dysco3_slice', 1)], [fluid(WATER, 100)],
      [item('grindless:dysco3_polished_slice', 1)], [], 1920, 100),
    row('ggg_polish', 'chemical_bath', null, [item('grindless:ggg_slice', 1)], [fluid(WATER, 100)],
      [item('grindless:ggg_polished_slice', 1)], [], 1920, 100),
    row('ga2o3_polish', 'chemical_bath', null, [item('grindless:ga2o3_slice', 1)], [fluid(WATER, 100)],
      [item('grindless:ga2o3_wafer', 1)], [], 1920, 100)
  ]

  // the substrate anneals in the blast furnace and the CVT crystals get their final tellurium vapour anneal
  SR.anneals = [
    row('dysco3_substrate', 'electric_blast_furnace', null, [item('grindless:dysco3_polished_slice', 1)], [fluid(ARGON, 100)],
      [item('grindless:dysco3_substrate', 1)], [], 1920, 400, 1800),
    row('ggg_wafer', 'electric_blast_furnace', null, [item('grindless:ggg_polished_slice', 1)], [fluid(ARGON, 100)],
      [item('grindless:ggg_wafer', 1)], [], 1920, 400, 1800),
    row('wte2_crystal', 'electric_blast_furnace', null, [item('grindless:wte2_raw_crystal', 1), item('gtceu:tellurium_dust', 1)], [fluid(ARGON, 100)],
      [item('grindless:wte2_crystal', 1)], [], 1920, 400, 1200),
    row('fgt_crystal', 'electric_blast_furnace', null, [item('grindless:fgt_raw_crystal', 1), item('gtceu:tellurium_dust', 1)], [fluid(ARGON, 100)],
      [item('grindless:fgt_crystal', 1)], [], 1920, 400, 1200)
  ]

  SR.chemistry = [
    // the barium is leached out of the HPHT-grown hBN with hydrochloric acid and returned to stock; the hydrogen is the reaction's
    row('hbn_leach', 'chemical_reactor', null, [item('grindless:raw_hbn_crystal', 1)], [fluid('gtceu:hydrochloric_acid', 1000)],
      [item('grindless:hbn_crystal', 1), item('gtceu:barium_dust', 1)], [fluid('gtceu:hydrogen', 500)], 1920, 200),
    // the STNO stack's milled wafer is cleaned; the redeposited CoFeB is collected and re-melted in the levitation melter
    row('stno_clean', 'chemical_bath', null, [item('grindless:stno_milled_wafer', 1)], [fluid('gtceu:hydrochloric_acid', 100)],
      [item('grindless:stno_clean_wafer', 1), item('grindless:stno_redeposit_dust', 1)], [], 1920, 200)
  ]

  SR.mixing = [
    row('mu_metal_blend', 'mixer', null, [item('gtceu:nickel_dust', 4), item('gtceu:iron_dust', 1), item('gtceu:molybdenum_dust', 1)], [],
      [item('grindless:mu_metal_blend', 6)], [], 480, 100),
    row('finemet_charge', 'mixer', null, [item('gtceu:iron_dust', 7), item('gtceu:silicon_dust', 1), item('gtceu:boron_dust', 1),
      item('gtceu:niobium_dust', 1), item('gtceu:copper_dust', 1)], [], [item('grindless:finemet_charge_dust', 11)], [], 480, 100)
  ]

  // hot strip mill: circuits 1-3 are the generated rows, 4 the levitation melter, 5 and 6 are UXV-A2's
  SR.hotRolling = [
    row('mu_metal_hot_band', 'hot_rolling', 7, [item('grindless:mu_metal_ingot', 1)], [fluid('minecraft:water', 50)],
      [item('grindless:mu_metal_hot_band', 1)], [fluid('gtceu:steam', 8000)], 1920, 200),
    row('mu_metal_foil', 'hot_rolling', 8, [item('grindless:mu_metal_hot_band', 1)], [fluid('minecraft:water', 50)],
      [item('grindless:mu_metal_foil', 2)], [fluid('gtceu:steam', 8000)], 1920, 200)
  ]

  SR.assembly = [
    row('mu_metal_shield_can', 'assembler', null, [item('grindless:annealed_mu_foil', 2), item('gtceu:stainless_steel_plate', 1), item('gtceu:copper_foil', 2), item('gtceu:soldering_alloy_ingot', 1), item('gtceu:silicone_rubber_ring', 2)], [fluid(LUBRICANT, 100)],
      [item('grindless:mu_metal_shield_can', 1)], [], 1920, 200)
  ]

  SR.skipped = []

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function add(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      SR.skipped.push({ id: r.id, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'spin_rows recipe skipped ' + r.id + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu[r.type](r.id)
    r.itemsIn.forEach(function (x) { b.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) b.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { b.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { b.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { b.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.temp) b.blastFurnaceTemp(r.temp)
    b.EUt(r.eut).duration(r.duration)
  }

  ServerEvents.recipes(function (event) {
    try {
      var all = SR.cutting.concat(SR.polishing, SR.anneals, SR.chemistry, SR.mixing, SR.hotRolling, SR.assembly)
      all.forEach(function (r) { add(event, r) })
      console.info(LOG + 'spin_rows recipes: ' + (all.length - SR.skipped.length) + ' added, ' + SR.skipped.length + ' skipped')
    } catch (e) {
      console.error(LOG + 'spin_rows recipes failed: ' + e)
    }
  })
})()
