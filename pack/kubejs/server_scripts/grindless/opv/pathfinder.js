// priority: -21839
// Gregtech Grindless - OpV-R1 "Pathfinder": the recipes of the c12 jump to Terzan 5 and of the two process lines it needs
// (docs/eras/opv.md R1; process lines 41 and 42). The gate row (hold_terzan5) is in tables/gate.json; the older machines' rows are in
// their own tables (profiler c4, nuclear clock c5, SiC fab c7, fibre draw c18, electron beam 24, hot cell c20, extraction c28-c29).
//
//   grindless:pathfinder_probe        assembly line at VA[OpV], researched with the Hawking drive: the thrown probe. Every input is a
//                                     product of the other OpV packages (tetron array, XNAV unit, shequid gyro, Hawking drive).
//   grindless:pathfinder_probe_core   crafting-table unpack of the launched probe (the gate's output); R2's input
//   grindless:xray_timing_head        line 41: polycapillary optics + SDD dies; burn-in rejects 1 in 4 (extraction c28)
//   grindless:node_power_transmitter  line 42: four sealed GaN MMIC tiles + an OpV emitter
//   grindless:vitamin_kit             the kit R2 and R3 send: an XNAV unit, a tetron array, two OpV robot arms and an HEMT amplifier
//
// The assembler rows run at VA[OpV] (503,316,480 EU/t): GCYM's large assembler on two UXV 4 A hatches until A4 gives gtceu:opv_assembler
// its recipe (docs/eras/opv.md 'Voltages and controllers'). Published in global.grindless.opvPathfinder: .recipes, .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv_pathfinder] '
  var OPV = 13
  var G = global.grindless || (global.grindless = {})
  var OPR = G.opvPathfinder || (G.opvPathfinder = {})
  OPR.recipes = []
  OPR.skipped = []
  OPR.research = 'grindless:hawking_drive'

  var CIRCUITS = '#gtceu:circuits/opv'
  var ASSEMBLER = [
    { name: 'xray_timing_head',
      items: ['4x grindless:polycapillary_optic', '4x grindless:sdd_die', '1x gtceu:opv_sensor',
        '2x gtceu:borosilicate_glass_ingot', '2x gtceu:titanium_foil', '2x ' + CIRCUITS],
      fluids: [['gtceu:soldering_alloy', 144]],
      out: ['3x grindless:xray_timing_head', '1x grindless:rejected_timing_head'], duration: 300 },
    { name: 'node_power_transmitter',
      items: ['4x grindless:sealed_mmic_tile', '1x gtceu:opv_emitter', '1x gtceu:opv_sensor',
        '1x gtceu:opv_machine_hull', '2x grindless:chain_composite_rod', '2x ' + CIRCUITS],
      fluids: [['gtceu:soldering_alloy', 288]],
      out: ['1x grindless:node_power_transmitter'], duration: 400 },
    { name: 'vitamin_kit',
      items: ['1x grindless:tetron_array', '1x grindless:xnav_unit', '2x gtceu:opv_robot_arm',
        '1x grindless:hemt_amplifier', '1x grindless:cryo_optical_link', '2x ' + CIRCUITS],
      fluids: [['gtceu:soldering_alloy', 288]],
      out: ['1x grindless:vitamin_kit'], duration: 400 }
  ]
  OPR.assembler = ASSEMBLER

  var PROBE = {
    items: ['1x grindless:tetron_array', '1x grindless:xnav_unit', '1x grindless:shequid_gyro', '1x grindless:hawking_drive',
      '2x gtceu:opv_sensor', '1x gtceu:opv_emitter', '2x ' + CIRCUITS],
    fluids: [['gtceu:soldering_alloy', 4608], ['gtceu:lubricant', 4000]],
    out: 'grindless:pathfinder_probe', cwut: 128, researchEUt: 125829120, duration: 2400
  }
  OPR.probe = PROBE

  function idOf(s) { return s.replace(/^\d+x /, '') }

  function missingOf(items, fluids, out) {
    var ids = items.concat(out).map(idOf).filter(function (id) { return id.charAt(0) !== '#' })
    var m = ids.filter(function (id) { return !Item.exists(id) })
    return m.concat(fluids.map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
  }

  function skip(name, missing) {
    OPR.skipped.push({ name: name, missing: missing })
    console.error(LOG + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  function addAssembler(event) {
    var eut = Number(GTValues.VA[OPV])
    ASSEMBLER.forEach(function (r) {
      var missing = missingOf(r.items, r.fluids, r.out)
      if (missing.length > 0) return skip(r.name, missing)
      var b = event.recipes.gtceu.assembler('grindless:' + r.name)
      r.items.forEach(function (s) { b.itemInputs(s) })
      r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
      r.out.forEach(function (s) { b.itemOutputs(s) })
      b.EUt(eut).duration(r.duration)
      OPR.recipes.push('grindless:assembler/' + r.name)
    })
  }

  function addProbe(event) {
    var eut = Number(GTValues.VA[OPV])
    var missing = missingOf(PROBE.items, PROBE.fluids, [PROBE.out, OPR.research])
    if (missing.length > 0) return skip('pathfinder_probe', missing)
    var b = event.recipes.gtceu.assembly_line('grindless:pathfinder_probe')
    PROBE.items.forEach(function (s) { b.itemInputs(s) })
    PROBE.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
    b.itemOutputs(PROBE.out)
    b.stationResearch(function (r) { return r.researchStack(Item.of(OPR.research)).CWUt(PROBE.cwut).EUt(PROBE.researchEUt) })
    b.EUt(eut).duration(PROBE.duration)
    OPR.recipes.push('grindless:assembly_line/pathfinder_probe')
  }

  function addUnpack(event) {
    var missing = missingOf([], [], ['grindless:launched_pathfinder', 'grindless:pathfinder_probe_core'])
    if (missing.length > 0) return skip('pathfinder_probe_core', missing)
    event.shapeless('grindless:pathfinder_probe_core', ['grindless:launched_pathfinder']).id('grindless:pathfinder_probe_core_unpack')
    OPR.recipes.push('grindless:pathfinder_probe_core_unpack')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['assembler', addAssembler], ['probe', addProbe], ['unpack', addUnpack]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + s[0] + ' failed: ' + e)
      }
    })
  })
})()
