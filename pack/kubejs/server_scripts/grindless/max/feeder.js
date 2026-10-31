// -----------------------------------------------------------------------------------------------
// MAX-E1 accretion feeder (docs/eras/max.md, machine 10, lines L25, L26 and L42; package MAX-E1). The line steps on older machines are
// rows marked MAX-E1 in their own tables and scripts; this file holds the machine's two recipes, its controller, the casing and the GTM
// rows of the lines:
//
//   L25 furnace c1 (R1) -> solar vapour furnace c8 -> regolith cell c5 -> compressor (here) slag_compact -> SPS c19 -> slag_pellet -> c1
//   L26 diamond lattice c10 -> implanter c17 -> betavoltaic c4 -> MTJ c19 -> solar array c4 xuv_collector_panel (worn in c1, reworked in c2)
//   L42 platinum c19 -> EB c30 -> CVI c16 -> MTJ c21 -> assembler (here) wolter_mirror_module (worn in c1; platinum c20 returns the iridium)
//
// c1 is a generator: one pellet -> 2^30 EU/t (VH[MAX]) for 2,400 t. The collector panel is worn with chance 1/64 and the Wolter module with
// 1/128: each is a chanced input AND a chanced output of the same ratio, so a worn part is lost and its spent twin appears on average
// together. Balance: a pellet costs about 1.3e12 EU along L25 plus the wear; c1 gives 2^30 x 2,400 = 2.58e12 EU: about 2.0x. Both
// recipes run in gcyr:black_hole_orbit. The assembler rows run at VA[MAX] (decision 68). Published for the tests:
// global.grindless.maxFeeder.recipes, .skipped, .controllerRecipe. Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MF = G.maxFeeder || (G.maxFeeder = {})
  MF.recipes = []
  MF.skipped = []
  MF.controllerRecipe = 'grindless:assembly_line/accretion_feeder'

  var VA_MAX = Number(GTValues.VA[14])
  var VH_MAX = 1073741824
  var OPV_VA = 503316480
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:accretion_feeder'
  var RESEARCH = 'grindless:slag_pellet'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = 'gcyr:black_hole_orbit'
  var PANEL = 'grindless:xuv_collector_panel'
  var MODULE = 'grindless:wolter_mirror_module'

  // chance/maxChance 0 means the item is always consumed or produced
  var FEEDER = [
    { name: 'slag_pellet_burn', circuit: 1, duration: 2400,
      items: [['1x grindless:slag_pellet', 0, 0], ['1x ' + PANEL, 1, 64], ['1x ' + MODULE, 1, 128]],
      outs: [['1x grindless:spent_collector_panel', 1, 64], ['1x grindless:spent_wolter_module', 1, 128]] },
    { name: 'panel_rework', circuit: 2, duration: 600,
      items: [['1x grindless:spent_collector_panel', 0, 0], ['2x grindless:pin_diamond_plate', 0, 0]],
      outs: [['1x ' + PANEL, 0, 0]] }
  ]

  var GTM = [
    { type: 'compressor', name: 'slag_compact', items: ['4x grindless:ca_al_oxide_residue'], fluids: [],
      outs: ['1x grindless:slag_compact'], eut: OPV_VA, duration: 400 },
    { type: 'assembly_hall', name: 'wolter_mirror_module', eut: null, duration: 600,
      items: ['4x grindless:iridium_coated_shell', '2x gtceu:tritanium_plate', '4x gtceu:tritanium_foil', '2x gtceu:tritanium_round',
        '1x ' + CIRCUIT, '1x gtceu:fine_gold_wire'],
      fluids: [['gtceu:soldering_alloy', 288]], outs: ['1x ' + MODULE] },
    { type: 'assembly_hall', name: 'feeder_coil_casing', eut: null, duration: 200,
      items: ['4x gtceu:tungsten_steel_plate', '2x grindless:sic_sic_plate', '2x gtceu:tungsten_steel_rod', '1x gtceu:superconducting_coil', '2x gtceu:fine_gold_wire', '1x ' + CIRCUIT],
      fluids: [['gtceu:soldering_alloy', 144]], outs: ['4x grindless:feeder_coil_casing'] }
  ]

  function idOf(s) { return String(s).replace(/^\d+x /, '') }

  function missingOf(items, fluids) {
    var m = []
    items.forEach(function (s) {
      if (String(s).indexOf('#') >= 0) return
      var id = idOf(s)
      if (!Item.exists(id)) m.push(id)
    })
    fluids.forEach(function (f) { if (!Fluid.exists(f)) m.push(f) })
    return m
  }

  function skip(name, missing) {
    MF.skipped.push(name)
    console.error(LOG + 'feeder ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  // 1/64 and 1/128 are not whole ten-thousandths: the builder's chance and maxChance, reset right after
  function chanced(b, add, spec) {
    if (spec[1] > 0) {
      b.chance(spec[1]).maxChance(spec[2])
      add(spec[0])
      b.chance(10000).maxChance(10000)
    } else {
      add(spec[0])
    }
  }

  ServerEvents.recipes(function (event) {
    FEEDER.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs).map(function (o) { return o[0] }), [])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.accretion_power('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { chanced(b, function (id) { b.itemInputs(id) }, s) })
        r.outs.forEach(function (o) { chanced(b, function (id) { b.itemOutputs(id) }, o) })
        b.dimension(SITE)
        b.addDataString('grindless_accretion_power', r.name)
        b.EUt(r.circuit === 1 ? -VH_MAX : -VA_MAX).duration(r.duration)
        MF.recipes.push('grindless:accretion_power/' + r.name)
      } catch (e) {
        console.error(LOG + 'feeder ' + r.name + ' failed: ' + e)
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
        MF.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'feeder ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_emitter', 'grindless:max_sensor', 'grindless:max_field_generator',
        'grindless:max_field_coil', PANEL, MODULE]
      var mc = missingOf(ids, [])
      if (mc.length > 0) {
        skip('accretion_feeder', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:accretion_feeder')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '4x grindless:max_field_generator', '4x grindless:max_emitter', '4x grindless:max_sensor',
          'grindless:max_field_coil', PANEL, MODULE)
        a.inputFluids(Fluid.of('gtceu:superfluid_helium_3', 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'feeder controller failed: ' + e)
    }
    console.info(LOG + 'feeder: ' + MF.recipes.length + ' recipes; skipped ' + MF.skipped.length)
  })
})()
