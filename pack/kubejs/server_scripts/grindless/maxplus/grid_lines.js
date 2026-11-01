// priority: -20169
// MAX+ grid lines P19, T11, T12, T13 and T17 on the older machines (docs/eras/maxplus.md 'Lines' and 'Older machines'; package XP-H4b).
// (hand-stamped between crystals.js and hyperfactory.js; the integrator re-stamps with tools/analysis/script-order.mjs --write)
//
//   P19 Kerr gyroscope       zone refining c19 -> fused_quartz_sphere_blank; GTM lathe -> lapped_quartz_sphere; MTJ c32 -> nb_coated_sphere;
//                            SHeQUID c8 -> calibrated_gyro; SHeQUID c15 -> cold_kerr_gyro
//                            (the superfluid helium plant has no item slots, so the last step runs on the SHeQUID line with superfluid
//                            helium, as maxplus/loom.js does for T7's valve)
//   T11 iris blade           single crystal foundry c29 (P3 plate) -> oriented_blade_blank; megabar c18 -> densified_blade; GTM lathe ->
//                            edged_blade; EB furnace -> coated_iris_blade (the hyper assembly array's iris_blade is XP-H4a's)
//   T12 alignment matrix     clock lab c10 -> nuclear_clock_reference; photonic foundry c32 -> optical_frequency_divider; TFLN c22 ->
//                            phase_modulator_chip; femto writer c24 (on the P14 lattice) -> inscribed_reference_crystal; mK cryostat c32 ->
//                            cold_reference_assembly (the array's horizon_alignment_matrix is XP-H4a's)
//   T13 resonance chamber    CVI c21 -> sic_chamber_flange; SRF works c13 -> large_resonance_cell; chemical bath c8 -> polished_resonance_cell;
//                            MTJ c32 -> coated_resonance_cell; mK cryostat c32 -> resonance_chamber
//   T17 gate comm terminal   MOCVD c32 -> inp_1550_laser_die; fibre draw c24 -> er_amplifier_fibre; photonic foundry c32 -> laser_comm_engine;
//                            MTJ c32 -> coated_telescope_optic; GTM assembler -> horizon_comm_terminal
//
// Every machine is a home machine (maxplus.md 'Older machines'), so no row binds a dimension. Circuits are the first free ones of each older
// machine type (maxplus.md 'Older machines'); the types already at 32 (MTJ, photonic foundry, mK cryostat, MOCVD) share it and differ by item
// inputs, and the lathe, the EB furnace and the assembler, whose circuits are taken or unused, are keyed by their item inputs alone, as
// maxplus/tarantula.js does. Each row runs at its machine's voltage on hatches that carry it. Every non-product output is an inert gas or a
// working fluid returned to its line, or an acid sent back to the plant, and no recipe time is inflated. The rows carry no EMI data key: their
// text lives in lang files this package does not own.
// Published for the tests: global.grindless.maxPlusGridLines { rows, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_grid_lines] '
  var G = global.grindless || (global.grindless = {})
  var MG = G.maxPlusGridLines || (G.maxPlusGridLines = {})
  MG.skipped = []

  function va(t) { return Number(GTValues.VA[t]) }
  var ARGON = 'gtceu:argon'
  var HELIUM = 'gtceu:helium'
  var LHE = 'gtceu:liquid_helium'
  var SHE = 'gtceu:superfluid_helium'

  // type, name, circuit (none for item-keyed types), EU/t, ticks, items in, fluids in, items out, fluids out
  var ROWS = [
    // P19
    { type: 'zone_refining', name: 'fused_quartz_sphere_blank', circuit: 19, eut: va(7), duration: 900,
      items: [['gtceu:quartz_sand_dust', 64], ['gtceu:silicon_dioxide_dust', 16]], fluids: [[ARGON, 1000]],
      outs: [['grindless:fused_quartz_sphere_blank', 4]], fluidOuts: [[ARGON, 800]] },
    { type: 'lathe', name: 'lapped_quartz_sphere', eut: va(7), duration: 600,
      items: [['grindless:fused_quartz_sphere_blank', 1]], outs: [['grindless:lapped_quartz_sphere', 1]] },
    { type: 'mtj_sputtering', name: 'nb_coated_sphere', circuit: 32, eut: va(12), duration: 900,
      items: [['grindless:lapped_quartz_sphere', 2], ['grindless:nb_target', 2]], fluids: [[ARGON, 1000]],
      outs: [['grindless:nb_coated_sphere', 2]], fluidOuts: [[ARGON, 800]] },
    { type: 'shequid_assembly', name: 'calibrated_gyro', circuit: 8, eut: va(12), duration: 900,
      items: [['grindless:nb_coated_sphere', 2], ['grindless:nb_jj_wafer', 2]], fluids: [[LHE, 1000]],
      outs: [['grindless:calibrated_gyro', 1]], fluidOuts: [[HELIUM, 500]] },
    { type: 'shequid_assembly', name: 'cold_kerr_gyro', circuit: 15, eut: va(12), duration: 1200,
      items: [['grindless:calibrated_gyro', 1]], fluids: [[SHE, 2000]],
      outs: [['grindless:cold_kerr_gyro', 1]], fluidOuts: [[SHE, 1600]] },
    // T11
    { type: 'single_crystal_casting', name: 'oriented_blade_blank', circuit: 29, eut: va(9), duration: 1200,
      items: [['grindless:kerr_strange_plate', 4], ['gtceu:tantalum_carbide_dust', 16], ['gtceu:rhenium_dust', 8]], fluids: [[ARGON, 1000]],
      outs: [['grindless:oriented_blade_blank', 2]], fluidOuts: [[ARGON, 800]] },
    { type: 'megabar_synthesis', name: 'densified_blade', circuit: 18, eut: va(10), duration: 900,
      items: [['grindless:oriented_blade_blank', 2], ['gtceu:tantalum_carbide_plate', 4]],
      outs: [['grindless:densified_blade', 2]] },
    { type: 'lathe', name: 'edged_blade', eut: va(7), duration: 600,
      items: [['grindless:densified_blade', 1]], outs: [['grindless:edged_blade', 1]] },
    { type: 'electron_beam_refining', name: 'coated_iris_blade', eut: va(9), duration: 900,
      items: [['grindless:edged_blade', 2], ['gtceu:niobium_nitride_plate', 2]], fluids: [[ARGON, 1000]],
      outs: [['grindless:coated_iris_blade', 2]], fluidOuts: [[ARGON, 800]] },
    // T12
    { type: 'nuclear_clock', name: 'nuclear_clock_reference', circuit: 10, eut: va(11), duration: 1200,
      items: [['grindless:chip_nuclear_clock', 2], ['gtceu:thorium_plate', 4]], fluids: [[ARGON, 2000]],
      outs: [['grindless:nuclear_clock_reference', 1]], fluidOuts: [[ARGON, 1600]] },
    { type: 'photonic_foundry', name: 'optical_frequency_divider', circuit: 32, eut: va(13), duration: 1500,
      items: [['grindless:nuclear_clock_reference', 1], ['grindless:fibre_bragg_grating', 2], ['grindless:photonic_chip', 1]], fluids: [[ARGON, 1000]],
      outs: [['grindless:optical_frequency_divider', 1]], fluidOuts: [[ARGON, 800]] },
    { type: 'ion_slicing', name: 'phase_modulator_chip', circuit: 22, eut: va(13), duration: 1200,
      items: [['grindless:optical_frequency_divider', 1], ['grindless:lnoi_wafer', 2]], fluids: [[HELIUM, 1000]],
      outs: [['grindless:phase_modulator_chip', 2]], fluidOuts: [[HELIUM, 800]] },
    { type: 'femtosecond_writing', name: 'inscribed_reference_crystal', circuit: 24, eut: va(13), duration: 1500,
      items: [['grindless:phase_modulator_chip', 2], ['grindless:void_crystal_lattice', 1]], fluids: [[ARGON, 1000]],
      outs: [['grindless:inscribed_reference_crystal', 1]], fluidOuts: [[ARGON, 800]] },
    { type: 'nuclear_demagnetisation', name: 'cold_reference_assembly', circuit: 32, eut: va(13), duration: 1800,
      items: [['grindless:inscribed_reference_crystal', 1], ['grindless:cryo_reference_cavity', 1], ['grindless:silicon_cavity_spacer', 2]], fluids: [[SHE, 1000]],
      outs: [['grindless:cold_reference_assembly', 1]], fluidOuts: [[SHE, 800]] },
    // T13
    { type: 'chemical_vapour_infiltration', name: 'sic_chamber_flange', circuit: 21, eut: va(10), duration: 1200,
      items: [['grindless:sic_tow', 16]], fluids: [['gtceu:methyltrichlorosilane', 1000], ['gtceu:hydrogen', 2000]],
      outs: [['grindless:sic_chamber_flange', 2]], fluidOuts: [['gtceu:hydrochloric_acid', 3000]] },
    { type: 'srf_cavity', name: 'large_resonance_cell', circuit: 13, eut: va(8), duration: 900,
      items: [['grindless:sic_chamber_flange', 2], ['grindless:rrr_niobium_sheet', 8]], fluids: [[LHE, 1000]],
      outs: [['grindless:large_resonance_cell', 1]], fluidOuts: [[HELIUM, 1000]] },
    { type: 'chemical_bath', name: 'polished_resonance_cell', circuit: 8, eut: va(8), duration: 400,
      items: [['grindless:large_resonance_cell', 1]], fluids: [['gtceu:electropolish_acid', 1000]],
      outs: [['grindless:polished_resonance_cell', 1]], fluidOuts: [['gtceu:spent_electropolish_acid', 1000]] },
    { type: 'mtj_sputtering', name: 'coated_resonance_cell', circuit: 32, eut: va(12), duration: 900,
      items: [['grindless:polished_resonance_cell', 2], ['grindless:nbn_coated_sic_plate', 2]], fluids: [[ARGON, 1000]],
      outs: [['grindless:coated_resonance_cell', 2]], fluidOuts: [[ARGON, 800]] },
    { type: 'nuclear_demagnetisation', name: 'resonance_chamber', circuit: 32, eut: va(13), duration: 1800,
      items: [['grindless:coated_resonance_cell', 2], ['grindless:rrr_nb_target', 2]], fluids: [[SHE, 1000]],
      outs: [['grindless:resonance_chamber', 1]], fluidOuts: [[SHE, 800]] },
    // T17
    { type: 'mocvd', name: 'inp_1550_laser_die', circuit: 32, eut: va(12), duration: 1200,
      items: [['grindless:inp_wafer', 4], ['grindless:pump_laser_bonded_die', 2]], fluids: [['gtceu:phosphine', 1000]],
      outs: [['grindless:inp_1550_laser_die', 2]], fluidOuts: [['gtceu:hydrogen', 1000]] },
    { type: 'fibre_draw', name: 'er_amplifier_fibre', circuit: 24, eut: va(13), duration: 1200,
      items: [['grindless:er_preform', 2], ['grindless:inp_1550_laser_die', 1]], fluids: [['gtceu:polyethylene', 144]],
      outs: [['grindless:er_amplifier_fibre', 2]] },
    { type: 'photonic_foundry', name: 'laser_comm_engine', circuit: 32, eut: va(13), duration: 1500,
      items: [['grindless:er_amplifier_fibre', 2], ['grindless:laser_module_block', 2], ['grindless:photonic_chip', 1]], fluids: [[ARGON, 1000]],
      outs: [['grindless:laser_comm_engine', 1]], fluidOuts: [[ARGON, 800]] },
    { type: 'mtj_sputtering', name: 'coated_telescope_optic', circuit: 32, eut: va(12), duration: 900,
      items: [['grindless:sic_mirror_blank', 2], ['grindless:rrr_nb_target', 1]], fluids: [[ARGON, 1000]],
      outs: [['grindless:coated_telescope_optic', 2]], fluidOuts: [[ARGON, 800]] },
    { type: 'assembler', name: 'horizon_comm_terminal', eut: va(10), duration: 900,
      items: [['grindless:laser_comm_engine', 2], ['grindless:coated_telescope_optic', 4], ['gtceu:tungsten_steel_plate', 4]], fluids: [['gtceu:soldering_alloy', 2304]],
      outs: [['grindless:horizon_comm_terminal', 1]] }
  ]

  MG.rows = ROWS

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }

  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }

  function skip(name, reason) {
    MG.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'outs'))
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    if (r.circuit) b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    b.EUt(r.eut).duration(r.duration)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MG.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      console.info(LOG + 'grid lines: ' + ROWS.length + ' rows; skipped ' + MG.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
