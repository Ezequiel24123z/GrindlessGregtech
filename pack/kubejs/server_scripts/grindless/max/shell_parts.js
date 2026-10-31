// priority: -19984
// -----------------------------------------------------------------------------------------------
// MAX-H1 "Shell parts" (docs/eras/max.md, lines 30 and 38; the amendment S0-12 in docs/research/max-s0.md): the GTM assembler steps of the two
// lines that make the Mirror shell's parts. Every other step is one row in an older machine's table:
//
//   line 30  extraction cascade c32 er_ho_strip -> levitation melter c20 er3ni_ingot -> assembler er3ni_spheres -> assembler charged_pulse_tube
//            -> assembler shell_cryocooler
//   line 38  crystal growth c32 sic_substrate_wafer -> SiC fab c10 sic_cmos_wafer -> MTJ sputter c20 mram_stack_wafer -> racetrack fab c3
//            racetrack_memory_die -> assembler segment_controller
//
// No input of either line is a MAX product, and nothing returns through a loop. Published: global.grindless.shellParts.recipes, .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var SP = G.shellParts || (G.shellParts = {})
  SP.recipes = []
  SP.skipped = []

  var ROWS = [
    { name: 'er3ni_spheres', eut: 1966080, duration: 400,
      items: ['4x grindless:er3ni_ingot', '2x gtceu:stainless_steel_plate', '2x gtceu:titanium_ring', '1x gtceu:tungsten_steel_rod', '2x gtceu:niobium_titanium_foil', '1x gtceu:uxv_sensor'],
      fluids: [['gtceu:argon', 1000]], out: 'grindless:er3ni_spheres' },
    { name: 'charged_pulse_tube', eut: 7864320, duration: 600,
      items: ['4x grindless:er3ni_spheres', '2x gtceu:titanium_plate', '1x gtceu:stainless_steel_rod', '4x gtceu:copper_foil', '2x gtceu:silver_foil', '1x gtceu:uxv_electric_pump', '1x gtceu:uxv_electric_piston'],
      fluids: [['gtceu:helium', 1000]], out: 'grindless:charged_pulse_tube' },
    { name: 'shell_cryocooler', eut: 31457280, duration: 800,
      items: ['2x grindless:charged_pulse_tube', '2x gtceu:opv_electric_pump', '1x gtceu:opv_sensor', '2x gtceu:tungsten_steel_plate', '2x gtceu:gold_foil', '4x gtceu:niobium_titanium_foil', '#gtceu:circuits/opv'],
      fluids: [['gtceu:helium', 2000]], out: 'grindless:shell_cryocooler' },
    { name: 'segment_controller', eut: 31457280, duration: 800,
      items: ['4x grindless:racetrack_memory_die', '2x gtceu:opv_sensor', '1x gtceu:opv_robot_arm', '2x gtceu:tungsten_steel_plate', '4x gtceu:copper_foil', '2x gtceu:gold_foil', '#gtceu:circuits/opv'],
      fluids: [['gtceu:soldering_alloy', 288]], out: 'grindless:segment_controller' }
  ]

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      var ids = r.items.map(function (s) { return s.replace(/^\d+x /, '') }).filter(function (id) { return id.charAt(0) !== '#' }).concat([r.out])
      var missing = ids.filter(function (id) { return !Item.exists(id) }).concat(r.fluids.map(function (f) { return f[0] }).filter(function (id) { return !Fluid.exists(id) }))
      if (missing.length > 0) {
        SP.skipped.push(r.name)
        console.error(LOG + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembler('grindless:' + r.name)
      r.items.forEach(function (s) { b.itemInputs(s) })
      r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
      b.itemOutputs(r.out)
      b.EUt(r.eut).duration(r.duration)
      SP.recipes.push('grindless:assembler/' + r.name)
    })
    console.info(LOG + 'shell_parts: ' + SP.recipes.length + ' recipes; skipped ' + SP.skipped.length)
  })
})()
