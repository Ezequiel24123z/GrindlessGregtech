// priority: -19943
// -----------------------------------------------------------------------------------------------
// MAX-B4 gene ark (docs/eras/max.md, machine 4, lines L12 and L28; package MAX-B4). The line steps on older machines are rows marked MAX-B4
// in their own tables and scripts; this file holds the machine's two recipes and its controller:
//
//   L12 biofoundry c17-18 (oligo pool, syn3 cassettes) -> chemosynthesis c3 (recipient culture) -> xenobiochemistry c5 (transplanted cell)
//       -> radiotrophic c2 (hardened cell) -> aerogel works c6 (vitrified capsule) -> c1 here
//   L28 organoid lab c4 (genome extract) -> ark biosphere c4 (ark genome set) -> xenobotany c5 (xeno genome set) -> aerogel works c5
//       (encapsulated library) -> c1 here
//
// The machine runs at VA[MAX] on two OpV 4 A hatches. Published for the tests: global.grindless.maxGeneArk.recipes, .skipped, .pendingRoutes,
// .controllerRecipe. The spent-nucleotide byproduct route of the contract is open: no spent_nucleotide id exists. Rhino: var + function in callbacks.
(function () {
  var LOG = '[grindless/max] '
  var G = global.grindless || (global.grindless = {})
  var MG = G.maxGeneArk || (G.maxGeneArk = {})
  MG.recipes = []
  MG.skipped = []
  MG.pendingRoutes = []
  MG.controllerRecipe = 'grindless:assembly_line/gene_ark'

  var VA_MAX = Number(GTValues.VA[14])
  var HE3 = 'gtceu:superfluid_helium_3'
  var CIRCUIT = '#gtceu:circuits/max'
  var CONTROLLER = 'gtceu:gene_ark'
  var RESEARCH = 'grindless:encapsulated_genome_library'
  var HULL = 'gtceu:max_machine_hull'

  // the machine's own recipes; items in include the programmed circuit (itemsIn 7 of the recipe type)
  var ROWS = [
    {
      name: 'genome_archive', circuit: 1, duration: 2400,
      items: ['4x grindless:encapsulated_genome_library', '1x grindless:rydberg_logic_array', '1x grindless:vitrified_cell_capsule'],
      fluid: HE3, amount: 1000,
      outs: ['1x grindless:genome_archive', '2x gtceu:glass_dust']
    },
    {
      name: 'genome_copy', circuit: 2, duration: 1200,
      items: ['1x grindless:genome_archive', '4x grindless:synthetic_oligo_pool'],
      fluid: null, amount: 0,
      outs: ['2x grindless:genome_archive']
    }
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
    MG.skipped.push(name)
    console.error(LOG + 'gene ark ' + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    ROWS.forEach(function (r) {
      try {
        var missing = missingOf(r.items.concat(r.outs), r.fluid === null ? [] : [r.fluid])
        if (missing.length > 0) {
          skip(r.name, missing)
          return
        }
        var b = event.recipes.gtceu.genome_archiving('grindless:' + r.name)
        b.circuit(r.circuit)
        b.itemInputs(r.items)
        if (r.fluid !== null) b.inputFluids(Fluid.of(r.fluid, r.amount))
        b.itemOutputs(r.outs)
        b.addDataString('grindless_genome_archiving', r.name)
        b.EUt(VA_MAX).duration(r.duration)
        MG.recipes.push('grindless:genome_archiving/' + r.name)
      } catch (e) {
        console.error(LOG + 'gene ark ' + r.name + ' failed: ' + e)
      }
    })

    try {
      var ids = [HULL, CONTROLLER, RESEARCH, 'grindless:max_robot_arm', 'grindless:max_sensor', 'grindless:max_fluid_regulator',
        'grindless:rydberg_logic_array', 'grindless:superconducting_membrane', 'gtceu:horizon_strand_single_cable']
      var mc = missingOf(ids, [HE3])
      if (mc.length > 0) {
        skip('gene_ark', mc)
      } else {
        var a = event.recipes.gtceu.assembly_line('grindless:gene_ark')
        a.itemInputs(HULL, '4x ' + CIRCUIT, '4x grindless:max_robot_arm', '4x grindless:max_sensor', '2x grindless:max_fluid_regulator',
          'grindless:rydberg_logic_array', 'grindless:superconducting_membrane', '2x gtceu:horizon_strand_single_cable')
        a.inputFluids(Fluid.of(HE3, 1000))
        a.itemOutputs(CONTROLLER)
        a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
        a.EUt(VA_MAX).duration(2400)
      }
    } catch (e) {
      console.error(LOG + 'gene ark controller failed: ' + e)
    }
    console.info(LOG + 'gene ark: ' + MG.recipes.length + ' recipes; skipped ' + MG.skipped.length)
  })
})()
