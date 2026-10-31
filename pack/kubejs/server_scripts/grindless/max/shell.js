// MAX-G1 mirror shell (docs/eras/max.md, machine 8, lines L13 L15 L18 L30 L37 L38; package MAX-G1). The L18 steps on older machines are
// rows marked MAX-G1 in their own tables and scripts; this file holds the shell's three recipes and its controller:
//
//   c1 vent (a generator): 1 seed wave packet -> 2^30 EU/t out for 4,800 t, a spent wave packet (inert: the wave leaves as light)
//   c2 sgr_a_spin_map + shell_gradient_map -> final_spin_map, VA[MAX], 1,200 t
//   c3 the last recipe (The ending): 2^35 EU/t for 1,200 t on two MAX 16 A hatches; 1 seed wave packet, 1 genome archive, 16 stream
//      bundles, 1 final spin map and 1 Rydberg logic array -> the universe seed and 64 mirror shell scrap, the spent array back
//
// c3 is the only recipe above VA[MAX] in the pack (V[MAX] x 16, never a literal). Balance of c1: the packet costs about 2.24e12 EU along L18
// and c1 gives 2^30 x 4,800 = 5.15e12 EU: about 2.3x. All three run in gcyr:black_hole_orbit. The segment is made on the UHV swarm foundry
// (uhv/swarm.js, circuit 5). Published for the tests: global.grindless.maxShell.recipes, .skipped, .pendingRoutes, .controllerRecipe.
// Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MS = G.maxShell || (G.maxShell = {})
  MS.recipes = []
  MS.skipped = []
  MS.pendingRoutes = []
  MS.controllerRecipe = 'grindless:assembly_line/mirror_shell'

  var VA_MAX = Number(GTValues.VA[14])
  var VH_MAX = 1073741824
  var V_MAX = Number(GTValues.V[14])
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:mirror_shell'
  var RESEARCH = 'grindless:superconducting_membrane'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = 'gcyr:black_hole_orbit'
  var KEY = 'grindless_black_hole_bomb'

  var SHELL = [
    { name: 'vent_wave_packet', circuit: 1, eut: -VH_MAX, duration: 4800, items: ['1x grindless:seed_wave_packet'],
      outs: ['1x grindless:spent_wave_packet'] },
    { name: 'final_spin_map', circuit: 2, eut: VA_MAX, duration: 1200,
      items: ['1x grindless:sgr_a_spin_map', '1x grindless:shell_gradient_map'], outs: ['1x grindless:final_spin_map'] },
    { name: 'universe_seed', circuit: 3, eut: V_MAX * 16, duration: 1200,
      items: ['1x grindless:seed_wave_packet', '1x grindless:genome_archive', '16x grindless:stream_bundle', '1x grindless:final_spin_map',
        '1x grindless:rydberg_logic_array'],
      outs: ['1x grindless:universe_seed', '64x grindless:mirror_shell_scrap', '1x grindless:spent_rydberg_array'] }
  ]

  function missingOf(items, fluids) {
    var m = []
    items.forEach(function (s) {
      if (String(s).indexOf('#') >= 0) return
      var id = String(s).replace(/^\d+x /, '')
      if (!Item.exists(id)) m.push(id)
    })
    fluids.forEach(function (f) { if (!Fluid.exists(f)) m.push(f) })
    return m
  }

  function skip(name, missing) {
    MS.skipped.push(name)
    console.error(LOG + 'shell ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    SHELL.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs), [])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.black_hole_bomb('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        b.dimension(SITE)
        b.addDataString(KEY, r.name)
        b.EUt(r.eut).duration(r.duration)
        MS.recipes.push('grindless:black_hole_bomb/' + r.name)
      } catch (e) {
        console.error(LOG + 'shell ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_emitter', 'grindless:max_sensor', 'grindless:max_field_generator',
        'grindless:max_electric_motor', 'grindless:segment_controller', 'grindless:shell_cryocooler']
      var mc = missingOf(ids, [])
      if (mc.length > 0) {
        skip('mirror_shell', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:mirror_shell')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '2x grindless:max_emitter', '2x grindless:max_sensor', '2x grindless:max_field_generator',
          '2x grindless:max_electric_motor', 'grindless:segment_controller', 'grindless:shell_cryocooler')
        a.inputFluids(Fluid.of('gtceu:superfluid_helium_3', 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'shell controller failed: ' + e)
    }
    console.info(LOG + 'shell: ' + MS.recipes.length + ' recipes; skipped ' + MS.skipped.length)
  })
})()
