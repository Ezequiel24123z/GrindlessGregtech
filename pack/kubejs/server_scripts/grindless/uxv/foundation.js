// priority: -26147
// UXV foundation recipes (package UXV-B4, docs/eras/uxv.md "Voltages and controllers"): the UXV machine hull and the four UXV energy hatches, each an
// assembly line behind station research. gtceu:uxv_machine_casing is UIV-B5's block (its recipe is not made here). The hull is made of Vela's
// lasagna plate and the voltage coil of line 48; the hatches carry pasta wire. All run at 31,457,280 EU/t, like the parallel hatch.
// Ids: startup_scripts/grindless/uxv/foundation.js (the builders are uev/foundation.js's).
// Published in global.grindless.uxvFoundation: .recipes (the ids made), .skipped.
// Rhino: var + function inside every callback that runs more than once.
ServerEvents.recipes(function (event) {
  var LOG = '[grindless/uxv] '
  var G = global.grindless || (global.grindless = {})
  var UF = G.uxvFoundation || (G.uxvFoundation = {})
  var EUT = 31457280
  UF.recipes = []
  UF.skipped = []

  function skip(name, missing) {
    UF.skipped.push(name)
    console.error(LOG + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  function missingOf(items, fluids) {
    var m = items.filter(function (id) { return !Item.exists(id) })
    return m.concat(fluids.filter(function (id) { return !Fluid.exists(id) }))
  }

  var FLUIDS = ['gtceu:filtered_disk_plasma', 'gtceu:soldering_alloy', 'gtceu:lubricant']

  var hullItems = ['gtceu:uxv_machine_casing', 'grindless:uxv_voltage_coil', 'grindless:ga2o3_power_die', 'grindless:lasagna_plate', 'gtceu:uxv_sensor', 'gtceu:uxv_machine_hull']
  var hm = missingOf(hullItems, FLUIDS)
  if (hm.length > 0) {
    skip('uxv_machine_hull', hm)
  } else {
    var hb = event.recipes.gtceu.assembly_line('grindless:uxv_machine_hull')
    hb.itemInputs('gtceu:uxv_machine_casing')
    hb.itemInputs('2x grindless:uxv_voltage_coil')
    hb.itemInputs('2x grindless:ga2o3_power_die')
    hb.itemInputs('4x grindless:lasagna_plate')
    hb.itemInputs('2x gtceu:uxv_sensor')
    hb.itemInputs('2x #gtceu:circuits/uxv')
    hb.inputFluids(Fluid.of('gtceu:filtered_disk_plasma', 1000), Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000))
    hb.itemOutputs('gtceu:uxv_machine_hull')
    hb.stationResearch(function (r) { return r.researchStack(Item.of('grindless:uxv_voltage_coil')).CWUt(64).EUt(7864320) })
    hb.EUt(EUT).duration(250)
    UF.recipes.push('grindless:assembly_line/uxv_machine_hull')
  }

  // the 2 A hatches take two strands of pasta wire, the 16 A ones four; each hatch adds one distinct piece (die, repeater, rhea plate, aerogel) so no two recipes share an ingredient set
  function hatch(name, wires, plates, duration, extra) {
    var ids = ['gtceu:uxv_machine_hull', 'gtceu:pasta_strand_single_wire', 'grindless:lasagna_plate', 'gtceu:uxv_sensor', 'grindless:ffkm_seal',
      'grindless:uxv_voltage_coil', 'grindless:ga2o3_power_die', 'gtceu:' + name]
    ids.push(extra)
    var m = missingOf(ids, FLUIDS)
    if (m.length > 0) return skip(name, m)
    var b = event.recipes.gtceu.assembly_line('grindless:' + name)
    b.itemInputs('gtceu:uxv_machine_hull')
    b.itemInputs(wires + 'x gtceu:pasta_strand_single_wire')
    b.itemInputs(plates + 'x grindless:lasagna_plate')
    b.itemInputs('2x grindless:uxv_voltage_coil')
    b.itemInputs('2x grindless:ga2o3_power_die')
    b.itemInputs('2x #gtceu:circuits/uxv')
    b.itemInputs('4x grindless:ffkm_seal')
    b.itemInputs('2x gtceu:uxv_sensor')
    b.itemInputs('1x ' + extra)
    b.inputFluids(Fluid.of('gtceu:filtered_disk_plasma', 1000), Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000))
    b.itemOutputs('gtceu:' + name)
    b.stationResearch(function (r) { return r.researchStack(Item.of('gtceu:uxv_machine_hull')).CWUt(64).EUt(7864320) })
    b.EUt(EUT).duration(duration)
    UF.recipes.push('grindless:assembly_line/' + name)
  }

  hatch('uxv_energy_input_hatch', 2, 2, 500, 'grindless:mtj_die')
  hatch('uxv_energy_output_hatch', 2, 2, 500, 'grindless:pasta_strand_repeater')
  hatch('uxv_energy_input_hatch_16a', 4, 4, 1000, 'gtceu:rhea_plate')
  hatch('uxv_energy_output_hatch_16a', 4, 4, 1000, 'grindless:silica_aerogel')

  // highTierContent is on (TP-S0F): GTM's own hull and 16 A hatch recipes for gtceu:uxv_* would be a second way to make them
  ;['shaped/uxv_machine_hull', 'assembler/energy_hatch_16a_uxv', 'assembler/dynamo_hatch_16a_uxv'].forEach(function (id) {
    event.remove({ id: 'gtceu:' + id })
  })
})
