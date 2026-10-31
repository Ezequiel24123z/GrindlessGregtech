// priority: -21669
// -----------------------------------------------------------------------------------------------
// OpV components (package OpV-A1, docs/eras/opv.md "A1. Components", lines 4-10): the steps of the component lines that run on GTM's own
// assembler, and four of GTM's OpV components (highTierContent ids; F2 cuts GTM's own recipes for them). The steps on older custom machines
// are their own rows, each marked OpV-A1 (tables/composites.json CVI c6-7, uhv/propulsion.js SPS c10 and c16-17, ev/cryogenic_plant.js
// liquid helium-3, tables/memories_cryostat.json c4-5, tables/electron_beam.json c21, luv/helium_refrigerator.js, uhv/elevator.js PBO c9,
// tables/megabar.json c7, tables/tfln_femtosecond.json c5, tables/am_powders.json gum_metal, tables/hts_magnet_works.json c7-8,
// tables/hot_cell.json c21, iv/fluorspar_kiln.js, tables/crystals.json crystal growth c19-20 and nuclear clock c4, uv/photonics.js MOCVD
// c20, zpm/qubits.js implanter c15, uv/detectors.js zone refining c10, ev/extraction_cascade.js c23). Items:
// startup_scripts/grindless/opv/components.js and opv/foundation.js (F1).
//
//   assembler  chain_sic_preform     4 SiC fibre + 2 chain strand wire + tritanium foil + pyrolytic graphite + 2 tritanium rings, dry N2 (line 4)
//   assembler  superfluid_he3_seal   superleak plug + 2 lamina stacks + 2 tritanium rings + PTFE foil + tritanium plate + 100 mB superfluid He-3
//   assembler  chain_field_coil      trained REBCO pancake + 4 chain wire + lamina stack + 2 tritanium foil + 2 tritanium plates, epoxy (line 8)
//   assembler  opv_electric_motor    field coil + 2 composite rods + 4 chain wire + 2 chain cable + 2 tritanium rings + 250 mB superfluid He-3
//   assembler  opv_electric_pump     motor + composite rotor + 2 superfluid seals + 2 lamina stacks + 1 cable + 2 tritanium plates
//   assembler  opv_conveyor_module   2 motors + 2 chain mesh belts + 1 cable + 2 tritanium plates + 4 tritanium rounds + 2 tritanium rings
//   assembler  opv_electric_piston   motor + harmonic drive + 2 composite rods + 2 lamina stacks + 2 cables, lubricant
//
//   assembler  opv_robot_arm         2 motors + piston + 2 harmonic drives + 2 cables + 1 OpV circuit, lubricant
//   assembler  opv_emitter           Th-229 lasing crystal + 2 lamina stacks + cryogenic optical link + 2 cables + 2 OpV circuits, solder
//   assembler  opv_sensor            HPGe Compton crystal + 2 lamina stacks + cryogenic optical link + 2 cables + 2 OpV circuits, solder
//   assembler  opv_fluid_regulator   pump + harmonic drive + 2 OpV circuits + superfluid seal + 2 tritanium small gears, solder
// The process fluids and tritanium hardware lift every row to the OpV complexFloor (one fluid each: GTM's assembler takes one).
// The last four take OpV-A2's circuits (the emitter and sensor also its cryo_optical_link); the integrator wrote them when A2 landed.
// Every row runs at 2^28 EU/t (two UXV amps of a 4 A hatch pair: the OpV assembler or the GCYM large assembler). An unknown id skips its
// row with a console error. Published in global.grindless.opvComponents: .rows ([{ id, path, type, circuit, itemsIn, fluidsIn, itemsOut,
// fluidsOut, eut, duration }]), .skipped ([{ id, reason }]), .components (the four no-circuit gtceu:opv_* ids), .circuitComponents (the
// four that take OpV circuits).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var OPVC = G.opvComponents || (G.opvComponents = {})

  var OPV_EUT = 268435456

  var WIRE = 'gtceu:chain_strand_single_wire'
  var CABLE = 'gtceu:chain_strand_single_cable'
  var STACK = 'grindless:chain_lamina_stack'
  var ROD = 'grindless:chain_composite_rod'
  var SUPERFLUID = 'gtceu:superfluid_helium_3'
  var MOTOR = 'gtceu:opv_electric_motor'
  var DRIVE = 'grindless:opv_harmonic_drive'
  var LINK = 'grindless:cryo_optical_link'
  var CIRCUIT = '#gtceu:circuits/opv'
  var TRI_RING = 'gtceu:tritanium_ring'
  var TRI_PLATE = 'gtceu:tritanium_plate'
  var TRI_FOIL = 'gtceu:tritanium_foil'
  var TRI_ROUND = 'gtceu:tritanium_round'
  var TRI_SMALL_GEAR = 'gtceu:tritanium_small_gear'
  var NITROGEN = 'gtceu:nitrogen'
  var EPOXY = 'gtceu:epoxy'
  var LUBRICANT = 'gtceu:lubricant'
  var SOLDER = 'gtceu:soldering_alloy'
  var COMPONENT_TICKS = 600

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(path, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration) {
    return { id: 'grindless:' + type + '/' + path, path: path, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut,
      fluidsOut: fluidsOut, eut: eut, duration: duration }
  }

  // every row reaches the OpV complexFloor (tools/analysis/recipe_quality.json, 10) with real hardware and one process fluid (GTM's assembler
  // takes one): tritanium rings, rounds, gears, plates and foil (its GTM flags), the UEV hBN film, the ZPM pyrolytic graphite
  OPVC.rows = [
    // line 4: SiC fibre laid over a pyrolytic graphite interphase on a tritanium foil mandrel, wound on chain strand wire between
    // tritanium end rings (the rod and rotor fittings), under dry nitrogen to keep the interphase clean, before the CVI furnace
    // densifies it (c6)
    row('chain_sic_preform', 'assembler', null, [item('grindless:sic_fibre', 4), item(WIRE, 2), item(TRI_FOIL, 1),
      item('grindless:pyrolytic_graphite', 1), item(TRI_RING, 2)], [fluid(NITROGEN, 1000)],
      [item('grindless:chain_sic_preform', 1)], [], OPV_EUT, 200),
    // line 5: the superleak plug sealed between two lamina stacks on PTFE-jacketed tritanium seal rings and a tritanium gland plate, charged
    // with superfluid helium-3
    row('superfluid_he3_seal', 'assembler', null, [item('grindless:superleak_plug', 1), item(STACK, 2), item(TRI_RING, 2),
      item('gtceu:polytetrafluoroethylene_foil', 1), item(TRI_PLATE, 1)], [fluid(SUPERFLUID, 100)],
      [item('grindless:superfluid_he3_seal', 1)], [], OPV_EUT, 400),
    // line 8: the trained pancake wound into a tritanium-flanged former with chain strand leads, tritanium co-wind foil (metal-insulated
    // coil) and a lamina flux return, bonded to the former in epoxy
    row('chain_field_coil', 'assembler', null, [item('grindless:trained_rebco_pancake', 1), item(WIRE, 4), item(STACK, 1), item(TRI_FOIL, 2),
      item(TRI_PLATE, 2)], [fluid(EPOXY, 250)], [item('grindless:chain_field_coil', 1)], [], OPV_EUT, 400),
    // the components (docs/eras/opv.md "Voltages and controllers", component table): no circuit, as GTM's motor, pump, conveyor and piston
    // motor: the shaft runs on tritanium bearing rings
    row('opv_electric_motor', 'assembler', null, [item('grindless:chain_field_coil', 1), item(ROD, 2), item(WIRE, 4), item(CABLE, 2),
      item(TRI_RING, 2)], [fluid(SUPERFLUID, 250)], [item(MOTOR, 1)], [], OPV_EUT, COMPONENT_TICKS),
    // pump: the rotor sits in a tritanium casing; the superfluid seals need no lubricant
    row('opv_electric_pump', 'assembler', null, [item(MOTOR, 1), item('grindless:chain_composite_rotor', 1),
      item('grindless:superfluid_he3_seal', 2), item(STACK, 2), item(CABLE, 1), item(TRI_PLATE, 2)], [], [item('gtceu:opv_electric_pump', 1)],
      [], OPV_EUT, COMPONENT_TICKS),
    // conveyor: the mesh belt over tritanium idler rounds in a tritanium frame, tensioned on tritanium rings (no fluid: the native probe row)
    row('opv_conveyor_module', 'assembler', null, [item(MOTOR, 2), item('grindless:chain_mesh_belt', 2), item(CABLE, 1), item(TRI_PLATE, 2),
      item(TRI_ROUND, 4), item(TRI_RING, 2)], [], [item('gtceu:opv_conveyor_module', 1)], [], OPV_EUT, COMPONENT_TICKS),
    // piston: the harmonic drive's bearings lubricated
    row('opv_electric_piston', 'assembler', null, [item(MOTOR, 1), item('grindless:opv_harmonic_drive', 1), item(ROD, 2), item(STACK, 2),
      item(CABLE, 2)], [fluid(LUBRICANT, 250)], [item('gtceu:opv_electric_piston', 1)], [], OPV_EUT, COMPONENT_TICKS),
    // the four that take OpV circuits (A2): the circuit is an ingredient, as in GTM's own; no programmed circuit
    // robot arm: the joints lubricated
    row('opv_robot_arm', 'assembler', null, [item(MOTOR, 2), item('gtceu:opv_electric_piston', 1), item(DRIVE, 2), item(CABLE, 2),
      item(CIRCUIT, 1)], [fluid(LUBRICANT, 250)], [item('gtceu:opv_robot_arm', 1)], [], OPV_EUT, COMPONENT_TICKS),
    // emitter and sensor: the circuits and the optical link's driver soldered on
    row('opv_emitter', 'assembler', null, [item('grindless:th229_lasing_crystal', 1), item(STACK, 2), item(LINK, 1), item(CABLE, 2),
      item(CIRCUIT, 2)], [fluid(SOLDER, 288)], [item('gtceu:opv_emitter', 1)], [], OPV_EUT, COMPONENT_TICKS),
    row('opv_sensor', 'assembler', null, [item('grindless:hpge_compton_crystal', 1), item(STACK, 2), item(LINK, 1), item(CABLE, 2),
      item(CIRCUIT, 2)], [fluid(SOLDER, 288)], [item('gtceu:opv_sensor', 1)], [], OPV_EUT, COMPONENT_TICKS),
    // fluid regulator: the pump behind a valve on a superfluid seal seat, driven through tritanium small gears; the circuits soldered on
    row('opv_fluid_regulator', 'assembler', null, [item('gtceu:opv_electric_pump', 1), item(DRIVE, 1), item(CIRCUIT, 2),
      item('grindless:superfluid_he3_seal', 1), item(TRI_SMALL_GEAR, 2)], [fluid(SOLDER, 288)], [item('gtceu:opv_fluid_regulator', 1)], [],
      OPV_EUT, COMPONENT_TICKS)
  ]
  OPVC.components = ['gtceu:opv_electric_motor', 'gtceu:opv_electric_pump', 'gtceu:opv_conveyor_module', 'gtceu:opv_electric_piston']
  OPVC.circuitComponents = ['gtceu:opv_robot_arm', 'gtceu:opv_emitter', 'gtceu:opv_sensor', 'gtceu:opv_fluid_regulator']
  OPVC.skipped = []

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) {
      if (x.id.charAt(0) !== '#' && !Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function add(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      OPVC.skipped.push({ id: r.id, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'opv_components recipe skipped ' + r.id + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu[r.type]('grindless:' + r.path)
    r.itemsIn.forEach(function (x) { b.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) b.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { b.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { b.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { b.outputFluids(Fluid.of(x.id, x.amount)) })
    b.EUt(r.eut).duration(r.duration)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      OPVC.rows.forEach(function (r) { add(event, r) })
      console.info(LOG + 'opv_components: ' + (OPVC.rows.length - OPVC.skipped.length) + ' rows added, ' + OPVC.skipped.length + ' skipped')
    } catch (e) {
      console.error(LOG + 'opv_components recipes failed: ' + e)
    }
  })
})()
