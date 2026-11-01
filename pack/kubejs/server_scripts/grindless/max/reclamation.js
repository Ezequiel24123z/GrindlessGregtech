// -----------------------------------------------------------------------------------------------
// MX-S4 segment reclamation works (docs/eras/max.md, machine 14; lines L52 and L53; package MX-S4). Here: c1 (one ablated mirror-shell segment
// opened into its seven part streams), the casing, the controller line and the GTM rows that give each stream its destination. The older
// machines' rows of the two lines are marked MX-S4 in their own files (biofoundry table c20, extraction cascade c3/c4).
//
//   L52 REBCO reclamation: c1 -> stripped_membrane_scrap -> biofoundry (bioleaching) -> bioleached_re_liquor -> extraction cascade (solvent
//       extraction) -> y_ba_cu_raffinate -> GTM chemical reactor (oxalate co-precipitation) -> ybco_oxalate -> GTM electric blast furnace
//       (calcination) -> ybco_precursor_powder (L32 step 2)
//   L53 Erbium regenerator return: c1 -> cryocooler_scrap -> GTM macerator (Er3Ni is brittle) -> er3ni_grit -> GTM electromagnetic separator
//       -> er_rich_fraction -> extraction cascade (leach and solvent extraction) -> er_ho_oxide (L30 step 1)
//   The other streams: truss -> cluster-light furnace c4 (max/furnace.js); coupler -> electromagnetic separator -> tetrataenite concentrate
//       (L37 step 3); Sn-Li dross -> extraction cascade -> Sn-Li eutectic (L15 step 1); electronics -> arc furnace -> silicon and carbon;
//       VO2 sheet -> machine 12's extraction row (MX-S2).
//
// Published: global.grindless.maxReclamation.recipes, .skipped, .controllerRecipe. Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MR = G.maxReclamation || (G.maxReclamation = {})
  MR.recipes = []
  MR.skipped = []
  MR.controllerRecipe = 'grindless:assembly_line/segment_reclamation_works'

  var VA_MAX = Number(GTValues.VA[14])
  var HE3 = 'gtceu:superfluid_helium_3'
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:segment_reclamation_works'
  var RESEARCH = 'grindless:ablated_shell_segment'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = 'gcyr:black_hole_orbit'
  var CASING = 'grindless:reclamation_bay_casing'

  // c1: one segment in, the seven streams out (the truss is the segment's own metal, the rest is what the segment carried)
  var C1 = {
    name: 'segment_streams', circuit: 1, duration: 600,
    items: ['grindless:ablated_shell_segment'],
    outs: ['grindless:mirror_shell_scrap', 'grindless:stripped_membrane_scrap', 'grindless:cryocooler_scrap', 'grindless:coupler_scrap',
      'grindless:sn_li_dross', 'grindless:segment_electronics_scrap', 'grindless:fatigued_vo2_sheet']
  }

  // the casing, two per craft at VA[MAX] from stock parts, like the other F1 casings (max/casings.js)
  var CASING_ROW = {
    name: 'reclamation_bay_casing', circuit: 24,
    items: ['gtceu:opv_machine_casing', '4x gtceu:tungsten_steel_plate', '4x gtceu:tungsten_steel_rod', '2x grindless:max_conveyor_module', '2x #gtceu:circuits/max']
  }

  // GTM rows: type, name, items in, fluids in, items out, EU/t, ticks
  var GTM = [
    // L53 step 2: the Er3Ni cryocooler regenerator is brittle and breaks to grit
    { type: 'macerator', name: 'er3ni_grit', items: ['1x grindless:cryocooler_scrap'], fluids: [],
      outs: ['4x grindless:er3ni_grit'], fluidOuts: [], eut: 7864320, duration: 400 },
    // L53 step 3: the erbium-rich grains are pulled off the nickel-rich ones (Er3Ni is magnetic below 10 K only in its erbium phase)
    { type: 'electromagnetic_separator', name: 'er_rich_fraction', items: ['4x grindless:er3ni_grit'], fluids: [],
      outs: ['2x grindless:er_rich_fraction', '1x gtceu:nickel_dust'], fluidOuts: [], eut: 31457280, duration: 600 },
    // L52 step 4: the Y, Ba and Cu cuts precipitated together as oxalates by ammonium oxalate; the ammonium chloride is a clean salt (GTM's electrolyser takes it back to ammonia)
    { type: 'chemical_reactor', name: 'ybco_oxalate', items: ['4x grindless:y_ba_cu_raffinate'],
      fluids: [['gtceu:ammonia', 3000], ['gtceu:carbon_monoxide', 3000], ['minecraft:water', 1000]],
      outs: ['4x grindless:ybco_oxalate', '3x gtceu:ammonium_chloride_dust'], fluidOuts: [], eut: 7864320, duration: 600 },
    // L52 step 5: calcination in the blast furnace (EMI shows its recipes), the oxalate decomposes to the oxide precursor of the YBCO tape (L32 step 2)
    { type: 'electric_blast_furnace', name: 'ybco_precursor_calcined', items: ['4x grindless:ybco_oxalate'], fluids: [],
      outs: ['4x grindless:ybco_precursor_powder'], fluidOuts: [], eut: 7864320, duration: 800, temp: 1800 },
    // the coupler's magnet stack is tetrataenite-bearing iron: its concentrate goes to the cold press, never melted (L37 step 3)
    { type: 'electromagnetic_separator', name: 'coupler_scrap_tetrataenite', items: ['1x grindless:coupler_scrap'], fluids: [],
      outs: ['1x grindless:tetrataenite_concentrate', '2x gtceu:iron_dust'], fluidOuts: [], eut: 31457280, duration: 600 },
    // the electronics board is a carbon-fibre laminate on a silicon die: the arc breaks it to silicon and carbon, the rest is inert ash
    { type: 'arc_furnace', name: 'segment_electronics_ash', items: ['1x grindless:segment_electronics_scrap'], fluids: [],
      outs: ['4x gtceu:silicon_dust', '2x gtceu:carbon_dust'], fluidOuts: [], eut: 7864320, duration: 400 }
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
    MR.skipped.push(name)
    console.error(LOG + 'reclamation ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    try {
      var m1 = missingOf(C1.items.concat(C1.outs), [])
      if (m1.length > 0) {
        skip(C1.name, m1)
      } else {
        var b = event.recipes.gtceu.segment_reclamation('grindless:' + C1.name)
        b.circuit(C1.circuit)
        b.itemInputs(C1.items.map(function (id) { return '1x ' + id }))
        b.itemOutputs(C1.outs.map(function (id) { return '1x ' + id }))
        b.dimension(SITE)
        b.addDataString('grindless_segment_reclamation', C1.name)
        b.EUt(VA_MAX).duration(C1.duration)
        MR.recipes.push('grindless:segment_reclamation/' + C1.name)
      }
    } catch (e) {
      console.error(LOG + 'reclamation ' + C1.name + ' failed: ' + e)
    }

    try {
      var mc = missingOf(CASING_ROW.items.concat([CASING]), [HE3])
      if (mc.length > 0) {
        skip(CASING_ROW.name, mc)
      } else {
        var ca = event.recipes.gtceu.assembler('grindless:' + CASING_ROW.name)
        ca.circuit(CASING_ROW.circuit)
        CASING_ROW.items.forEach(function (s) { ca.itemInputs(s) })
        ca.inputFluids(Fluid.of(HE3, 250))
        ca.itemOutputs('2x ' + CASING)
        ca.EUt(VA_MAX).duration(200)
        MR.recipes.push('grindless:assembler/' + CASING_ROW.name)
      }
    } catch (e) {
      console.error(LOG + 'reclamation ' + CASING_ROW.name + ' failed: ' + e)
    }

    GTM.forEach(function (r) {
      try {
        var fluidIds = r.fluids.map(function (f) { return f[0] }).concat(r.fluidOuts.map(function (f) { return f[0] }))
        var missing = missingOf(r.items.concat(r.outs), fluidIds)
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var g = event.recipes.gtceu[r.type]('grindless:' + r.name)
        r.items.forEach(function (s) { g.itemInputs(s) })
        r.fluids.forEach(function (f) { g.inputFluids(Fluid.of(f[0], f[1])) })
        r.outs.forEach(function (s) { g.itemOutputs(s) })
        r.fluidOuts.forEach(function (f) { g.outputFluids(Fluid.of(f[0], f[1])) })
        g.EUt(r.eut).duration(r.duration)
        if (r.temp) g.blastFurnaceTemp(r.temp)
        MR.recipes.push('grindless:' + r.type + '/' + r.name)
      } catch (e) {
        console.error(LOG + 'reclamation ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, CASING, 'grindless:max_emitter', 'grindless:max_robot_arm', 'grindless:max_electric_pump']
      var mk = missingOf(ids, [HE3])
      if (mk.length > 0) {
        skip('segment_reclamation_works', mk)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:segment_reclamation_works')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '2x grindless:max_emitter', '4x grindless:max_robot_arm', '2x grindless:max_electric_pump', '2x ' + CASING)
        a.inputFluids(Fluid.of(HE3, 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'reclamation controller failed: ' + e)
    }
    console.info(LOG + 'reclamation: ' + MR.recipes.length + ' recipes; skipped ' + MR.skipped.length)
  })
})()
