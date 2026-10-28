// priority: -23000
// UIV foundation recipes (package UIV-F1): only the hull and the four hatches every UIV machine needs. gtceu:uiv_machine_casing is GTM's own
// block; its assembly-line recipe is UEV's gate (uev/gate.js, researched with the pulsar navigation chart), so it is not made twice here.
// Every other UIV recipe is made by the package that makes its parts. Ids: startup_scripts/grindless/uiv/foundation.js. All run in GTM's
// assembler at UEV voltage (V[UEV] = 8,388,608 EU/t, one tier under the UIV hull they make).
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
    event.recipes.gtceu.assembler('grindless:uiv_machine_hull')
      .itemInputs(CASING, '2x ' + SINGLE, '4x ' + PLATE)
      .itemOutputs('gtceu:uiv_machine_hull')
      .EUt(UEV_EUT)
      .duration(50)
  }

  // 2 A hatches take two single cables, the 16 A ones two quadruple cables; the circuit number keeps the four apart
  function hatch(name, cable, circuit, duration) {
    if (HULL == null || cable == null) {
      skip(name, HULL == null ? 'gtceu:uiv_machine_hull' : 'metallic hydrogen cable')
      return
    }
    event.recipes.gtceu.assembler('grindless:' + name)
      .itemInputs(HULL, '2x ' + cable)
      .circuit(circuit)
      .itemOutputs('gtceu:' + name)
      .EUt(UEV_EUT)
      .duration(duration)
  }

  hatch('uiv_energy_input_hatch', SINGLE, 1, 100)
  hatch('uiv_energy_output_hatch', SINGLE, 2, 100)
  hatch('uiv_energy_input_hatch_16a', QUADRUPLE, 3, 200)
  hatch('uiv_energy_output_hatch_16a', QUADRUPLE, 4, 200)
})
