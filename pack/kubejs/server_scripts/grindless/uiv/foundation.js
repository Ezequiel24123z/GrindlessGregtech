// priority: -24520
// UIV foundation recipes (package UIV-F1, raised by QR-R7): only the hull and the four hatches every UIV machine needs, all assembly lines behind
// station research. gtceu:uiv_machine_casing is GTM's own
// block; its assembly-line recipe is UEV's gate (uev/gate.js, researched with the pulsar navigation chart), so it is not made twice here.
// Every other UIV recipe is made by the package that makes its parts. Ids: startup_scripts/grindless/uiv/foundation.js. All run at
// UEV voltage (V[UEV] = 8,388,608 EU/t, one tier under the UIV hull they make).
ServerEvents.recipes(function (event) {
  const UEV_EUT = 8388608

  // metallic hydrogen is a grindless: material (S0-7); its cable items sit under the material's namespace, with gtceu: as the fallback
  function firstExisting(ids) {
    for (var i = 0; i < ids.length; i++) if (Item.exists(ids[i])) return ids[i]
    return null
  }
  var SINGLE = firstExisting(['grindless:metallic_hydrogen_single_cable', 'gtceu:metallic_hydrogen_single_cable'])
  var QUADRUPLE = firstExisting(['grindless:metallic_hydrogen_quadruple_cable', 'gtceu:metallic_hydrogen_quadruple_cable'])
  var PLATE = firstExisting(['gtceu:rhea_plate'])
  var CASING = firstExisting(['gtceu:uiv_machine_casing'])
  var HULL = firstExisting(['gtceu:uiv_machine_hull'])

  function skip(what, missing) {
    console.error('[grindless/uiv] ' + what + ' skipped: ' + missing + ' is not registered')
  }

  if (CASING == null || SINGLE == null || PLATE == null) {
    skip('uiv_machine_hull', [CASING == null ? 'gtceu:uiv_machine_casing' : null, SINGLE == null ? 'metallic hydrogen single cable' : null, PLATE == null ? 'gtceu:rhea_plate' : null].filter(Boolean).join(', '))
  } else {
    var hb = event.recipes.gtceu.assembly_line('grindless:uiv_machine_hull')
    hb.itemInputs(CASING)
    hb.itemInputs('2x ' + SINGLE)
    hb.itemInputs('4x ' + PLATE)
    hb.itemInputs('2x grindless:ffkm_seal')
    hb.inputFluids(Fluid.of('gtceu:soldering_alloy', 576), Fluid.of('gtceu:lubricant', 500), Fluid.of('gtceu:neutronium', 144))
    hb.itemOutputs('gtceu:uiv_machine_hull')
    hb.stationResearch(function (r) { return r.researchStack(Item.of('grindless:ffkm_seal')).CWUt(64).EUt(7864320) })
    hb.EUt(UEV_EUT).duration(250)
  }

  // 2 A hatches take two single cables, the 16 A ones two quadruple cables; each is its own assembly line with its own research
  function hatch(name, cable, research, plateCount, duration) {
    if (HULL == null || cable == null || !Item.exists(research) || !Item.exists('grindless:ffkm_seal')) {
      skip(name, HULL == null ? 'gtceu:uiv_machine_hull' : cable == null ? 'metallic hydrogen cable' : research)
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:' + name)
    b.itemInputs(HULL)
    b.itemInputs('2x ' + cable)
    b.itemInputs(plateCount + 'x ' + PLATE)
    b.itemInputs('2x #gtceu:circuits/uiv')
    b.itemInputs('4x grindless:ffkm_seal')
    b.itemInputs('2x gtceu:uiv_sensor')
    b.itemInputs(research)
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000), Fluid.of('gtceu:neutronium', 288))
    b.itemOutputs('gtceu:' + name)
    b.stationResearch(function (r) { return r.researchStack(Item.of(research)).CWUt(64).EUt(7864320) })
    b.EUt(UEV_EUT).duration(duration * 5)
  }

  hatch('uiv_energy_input_hatch', SINGLE, 'gtceu:uiv_electric_motor', 4, 100)
  hatch('uiv_energy_output_hatch', SINGLE, 'gtceu:uiv_electric_pump', 4, 100)
  hatch('uiv_energy_input_hatch_16a', QUADRUPLE, 'gtceu:uiv_robot_arm', 8, 200)
  hatch('uiv_energy_output_hatch_16a', QUADRUPLE, 'gtceu:uiv_conveyor_module', 8, 200)

  // highTierContent is on (TP-S0F): GTM's own hull and 16 A hatch recipes for gtceu:uiv_* would be a second way to make them
  ;['shaped/uiv_machine_hull', 'assembler/energy_hatch_16a_uiv', 'assembler/dynamo_hatch_16a_uiv'].forEach(function (id) {
    event.remove({ id: 'gtceu:' + id })
  })
})
