// priority: -19910
// -----------------------------------------------------------------------------------------------
// MAX cluster-light furnace (docs/eras/max.md, machine 9, lines L13, L14, L25, L36, L37; package MAX-R1). This file holds the machine's five
// recipes (gtceu:cluster_light_smelting, NSC belt only), its controller, the belt rows on OpV's debris harvester and on the asteroid
// processor, and the GTM rows of the lines. The steps on the other older machines are rows marked MAX-R1 in their own tables and scripts:
//
//   L13 belt harvester c3 -> furnace c1 bloom -> carbonyl c2 -> levitation melter c19 -> furnace c2 truss billet -> extruder (here) -> segment_truss
//   L36 extraction cascade c30 -> chemical reactor (here) -> SPS c20 -> CVI c15 sealed_hearth_liner (consumed here, c1 and c5)
//   L37 asteroid processor c5 (here) -> helium refrigerator cryo_milled_core (luv/helium_refrigerator.js) -> separator (here) -> compressor (here)
//        -> nitride works c20 halbach_segment_coupler
//
// The belt rows are written here, not in tables/replication.json: that table's "site" is a boolean that means Terzan 5. Exact chances go through
// the builder's chance and maxChance, reset right after. Published for the tests: global.grindless.maxFurnace. Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MF = G.maxFurnace || (G.maxFurnace = {})
  MF.recipes = []
  MF.skipped = []
  MF.controllerRecipe = 'grindless:assembly_line/cluster_light_furnace'

  var VA_MAX = Number(GTValues.VA[14])
  var OPV_HARVEST = 268435456
  var SITE = 'grindless:nsc_belt'
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:cluster_light_furnace'
  var RESEARCH = 'grindless:nsc_ephemeris'
  var HULL = 'gtceu:max_machine_hull'
  var LINER = 'grindless:sealed_hearth_liner'

  var FURNACE = [
    { name: 'metal_rich_bloom', circuit: 1, duration: 600, items: ['16x grindless:nsc_planetesimal'],
      wear: LINER, outs: ['4x grindless:metal_rich_bloom', '8x grindless:silicate_slag', '1x grindless:pgm_residue'] },
    { name: 'segment_truss_billet', circuit: 2, duration: 600, items: ['2x grindless:segment_alloy_ingot'], outs: ['2x grindless:segment_truss_billet'] },
    { name: 'pellet_blank', circuit: 3, duration: 600, items: ['1x grindless:metal_rich_bloom'], outs: ['2x grindless:pellet_blank'] },
    { name: 'mirror_scrap_billet', circuit: 4, duration: 600, items: ['2x grindless:mirror_shell_scrap'], outs: ['1x grindless:segment_truss_billet'] },
    { name: 'hearth_relining', circuit: 5, duration: 600, items: ['1x ' + LINER], outs: ['2x gtceu:tantalum_dust'] }
  ]

  // belt rows of older machines, all at the NSC belt
  var BELT = [
    { type: 'debris_harvesting', name: 'nsc_planetesimal_harvest', circuit: 3, kept: ['gtceu:opv_sensor'], items: [],
      outs: ['8x grindless:nsc_planetesimal'], eut: OPV_HARVEST, duration: 400 },
    { type: 'asteroid_processing', name: 'iron_core_fragment', circuit: 5, kept: [], items: ['4x grindless:nsc_planetesimal'],
      outs: ['1x grindless:iron_core_fragment', '2x grindless:silicate_slag'], eut: 1966080, duration: 1200 }
  ]

  var GTM = [
    { type: 'extruder', name: 'segment_truss', items: ['2x grindless:segment_truss_billet'], kept: ['gtceu:rod_extruder_mold'], fluids: [],
      outs: ['1x grindless:segment_truss'], fluidOuts: [], eut: 7864320, duration: 600 },
    { type: 'chemical_reactor', name: 'ta_hf_c_powder', items: ['1x grindless:hafnium_tantalum_oxide', '3x gtceu:carbon_dust'], kept: [], fluids: [],
      outs: ['1x grindless:ta_hf_c_powder'], fluidOuts: [['gtceu:carbon_monoxide', 3000]], eut: 1966080, duration: 400 },
    { type: 'electromagnetic_separator', name: 'tetrataenite_concentrate', items: ['1x grindless:cryo_milled_core'], kept: [], fluids: [],
      outs: ['1x grindless:tetrataenite_concentrate', '2x gtceu:iron_dust'], fluidOuts: [], eut: 31457280, duration: 600 },
    { type: 'compressor', name: 'cold_pressed_tetrataenite', items: ['2x grindless:tetrataenite_concentrate'], kept: [], fluids: [],
      outs: ['1x grindless:cold_pressed_tetrataenite'], fluidOuts: [], eut: 31457280, duration: 400 }
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
    console.error(LOG + 'furnace ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    FURNACE.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs, r.wear ? [r.wear] : []), [])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.cluster_light_smelting('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        if (r.wear) {
          // 1/32 is not a whole number of ten-thousandths: the builder's chance and maxChance, reset right after
          b.chance(1).maxChance(32)
          b.itemInputs('1x ' + r.wear)
          b.chance(10000).maxChance(10000)
        }
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        b.dimension(SITE)
        b.addDataString('grindless_cluster_light_smelting', r.name)
        b.EUt(VA_MAX).duration(r.duration)
        MF.recipes.push('grindless:cluster_light_smelting/' + r.name)
      } catch (e) {
        console.error(LOG + 'furnace ' + r.name + ' failed: ' + e)
      }
    })

    BELT.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.kept, r.outs), [])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
        b.circuit(r.circuit)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.kept.forEach(function (s) { b.notConsumable(s) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        b.dimension(SITE)
        b.EUt(r.eut).duration(r.duration)
        MF.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'furnace belt ' + r.name + ' failed: ' + e)
      }
    })

    GTM.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.kept, r.outs), r.fluidOuts.map(function (f) { return f[0] }))
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
        r.items.forEach(function (s) { b.itemInputs(s) })
        r.kept.forEach(function (s) { b.notConsumable(s) })
        r.outs.forEach(function (s) { b.itemOutputs(s) })
        r.fluidOuts.forEach(function (f) { b.outputFluids(Fluid.of(f[0], f[1])) })
        b.EUt(r.eut).duration(r.duration)
        MF.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'furnace ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_electric_pump', 'grindless:max_fluid_regulator', 'grindless:max_field_generator',
        'grindless:albedo_multilayer_panel', 'grindless:exotic_composite_rod', 'grindless:diamond_power_die', LINER]
      var mc = missingOf(ids, [])
      if (mc.length > 0) {
        skip('cluster_light_furnace', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:cluster_light_furnace')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '4x grindless:max_electric_pump', '4x grindless:max_fluid_regulator', '2x grindless:max_field_generator',
          'grindless:albedo_multilayer_panel', 'grindless:exotic_composite_rod', 'grindless:diamond_power_die', LINER)
        a.itemOutputs(CONTROLLER)
        a.inputFluids(Fluid.of('gtceu:superfluid_helium_3', 1000))
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'furnace controller failed: ' + e)
    }
    console.info(LOG + 'furnace: ' + MF.recipes.length + ' recipes; skipped ' + MF.skipped.length)
  })
})()
