// priority: -20065
// -----------------------------------------------------------------------------------------------
// MAX-D3 Geroch winch (docs/eras/max.md, machine 6, lines L17 and L20; package MAX-D3). The line steps on older machines are rows marked
// MAX-D3 in their own tables and scripts; this file holds the machine's two recipes, its controller and the GTM rows of the lines:
//
//   L17 waste retrieval c10 -> decay heat vault c5 -> hot cell c23 -> canner (here) sealed_waste_log -> assembler (here) geroch_canister -> c1
//   L20 tether ribbon c13 -> star lifting c3 -> chemical reactor (here) -> autoclave (here) -> assembler (here) horizon_tether -> c2
//
// c1 is a generator: one canister -> 2^30 EU/t (VH[MAX]) for 2,400 t, a worn tether segment with chance 1/128. L17 balance: the canister
// costs about 1.31e12 EU along the line, c1 gives 2^30 x 2,400 = 2.58e12 EU: about 1.97x. Both recipes run in gcyr:black_hole_orbit.
// The assemblers run at VA[MAX] in gtceu:assembly_hall (decision 68). The L20 coating step is a chemical reactor, not a chemical bath: the
// bath takes one item and one fluid, the step has two items. Published for the tests: global.grindless.maxWinch.recipes, .skipped,
// .pendingRoutes, .controllerRecipe. Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MW = G.maxWinch || (G.maxWinch = {})
  MW.recipes = []
  MW.skipped = []
  MW.pendingRoutes = []
  MW.controllerRecipe = 'grindless:assembly_line/geroch_winch'

  var VA_MAX = Number(GTValues.VA[14])
  var VH_MAX = 1073741824
  var OPV_VA = 503316480
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:geroch_winch'
  var RESEARCH = 'grindless:horizon_tether'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = 'gcyr:black_hole_orbit'

  var WINCH = [
    { name: 'geroch_canister_lowering', circuit: 1, duration: 2400, items: ['1x grindless:geroch_canister'],
      outs: [['1x grindless:spent_tether_segment', 1, 128]] },
    { name: 'tether_rework', circuit: 2, duration: 600, items: ['1x grindless:spent_tether_segment', '1x grindless:horizon_tether'],
      outs: [['1x grindless:horizon_tether', 0, 0]] }
  ]

  var GTM = [
    { type: 'canner', name: 'sealed_waste_log', items: ['1x grindless:vitrified_waste_log', '1x grindless:chain_lamina_stack'],
      fluids: [['gtceu:nitrogen', 1000]], outs: ['1x grindless:sealed_waste_log'], eut: OPV_VA, duration: 1000 },
    { type: 'assembler', name: 'geroch_canister', eut: null, duration: 400,
      items: ['1x grindless:sealed_waste_log', '2x gtceu:horizon_strand_single_wire', '1x ' + CIRCUIT, '2x gtceu:tritanium_plate',
        '4x gtceu:tritanium_foil', '2x gtceu:tritanium_round', '1x gtceu:fine_gold_wire'],
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x grindless:geroch_canister'] },
    { type: 'chemical_reactor', name: 'exotic_coated_ribbon', items: ['1x grindless:proof_loaded_ribbon', '1x grindless:stable_exotic_matter'],
      fluids: [['gtceu:nitrogen', 1000]], outs: ['1x grindless:exotic_coated_ribbon'], eut: OPV_VA, duration: 800 },
    { type: 'autoclave', name: 'cured_exotic_ribbon', items: ['1x grindless:exotic_coated_ribbon'],
      fluids: [['gtceu:oxygen', 1000]], outs: ['1x grindless:cured_exotic_ribbon'], eut: OPV_VA, duration: 1200 },
    { type: 'assembler', name: 'horizon_tether', eut: null, duration: 600,
      items: ['1x grindless:cured_exotic_ribbon', '2x gtceu:horizon_strand_single_cable', '2x gtceu:horizon_strand_single_wire',
        '1x grindless:chain_lamina_stack', '2x gtceu:tritanium_plate', '4x gtceu:tritanium_foil', '1x ' + CIRCUIT],
      fluids: [['gtceu:superfluid_helium_3', 500]], outs: ['1x grindless:horizon_tether'] }
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
    MW.skipped.push(name)
    console.error(LOG + 'winch ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    WINCH.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs.map(function (o) { return o[0] })), [])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.geroch_power('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.outs.forEach(function (o) {
          // 1/128 is not a whole number of ten-thousandths: the builder's chance and maxChance, reset right after
          if (o[1] > 0) {
            b.chance(o[1]).maxChance(o[2])
            b.itemOutputs(o[0])
            b.chance(10000).maxChance(10000)
          } else {
            b.itemOutputs(o[0])
          }
        })
        b.dimension(SITE)
        b.addDataString('grindless_geroch_power', r.name)
        b.EUt(r.circuit === 1 ? -VH_MAX : -VA_MAX).duration(r.duration)
        MW.recipes.push('grindless:geroch_power/' + r.name)
      } catch (e) {
        console.error(LOG + 'winch ' + r.name + ' failed: ' + e)
      }
    })

    GTM.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs), r.fluids.map(function (f) { return f[0] }))
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        b.EUt(r.eut === null ? VA_MAX : r.eut).duration(r.duration)
        MW.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'winch ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_electric_motor', 'grindless:max_field_generator', 'grindless:max_electric_piston',
        'grindless:exotic_composite_rotor', 'grindless:diamond_power_die', 'grindless:albedo_multilayer_panel', 'grindless:sc_magnetic_bearing']
      var mc = missingOf(ids, [])
      if (mc.length > 0) {
        skip('geroch_winch', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:geroch_winch')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '4x grindless:max_electric_motor', '4x grindless:max_field_generator', '4x grindless:max_electric_piston',
          'grindless:exotic_composite_rotor', 'grindless:diamond_power_die', 'grindless:albedo_multilayer_panel', 'grindless:sc_magnetic_bearing')
        a.inputFluids(Fluid.of('gtceu:superfluid_helium_3', 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'winch controller failed: ' + e)
    }
    console.info(LOG + 'winch: ' + MW.recipes.length + ' recipes; skipped ' + MW.skipped.length)
  })
})()
