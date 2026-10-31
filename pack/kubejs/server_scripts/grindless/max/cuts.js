// priority: -19954
// MAX cuts (MAX-F2, docs/eras/max.md "Cuts"): GT--'s supracausal processor, assembly, computer, mainframe and SMDs and
// gtnn:max_wrap_circuit (S0-8: GT-- registers them in Kotlin, so these filters find none and stay as a guard; EMI and the obtain
// rule are what hide GT--'s routes), and the horizon strand's generic wiremill, extruder, bender, cable assembler, macerator and
// arc furnace rows (only our draw bench and PBO rows make it). GTM's 28 gtceu:max_* hull, hatch, bus, converter, buffer and
// charger recipes are already removed by opv/cuts.js; gtceu:max_battery is kept because GTM makes it at UHV and the released UHV
// battery cell is built from it. Removals spare our own recipes (not mod grindless); nothing is ever unregistered.
;(function () {
  var LOG = '[grindless] '
  var NOT_OURS = { mod: 'grindless' }
  var GTNN = ['supracausal_processor', 'supracausal_assembly', 'supracausal_computer', 'supracausal_mainframe',
    'supracausal_smd_capacitor', 'supracausal_smd_diode', 'supracausal_smd_inductor', 'supracausal_smd_resistor',
    'supracausal_smd_transistor', 'max_wrap_circuit'].map(function (n) { return 'gtnn:' + n })
  var STRAND = ['horizon_strand_ingot', 'horizon_strand', 'horizon_strand_single_wire', 'horizon_strand_single_cable']
    .map(function (n) { return 'gtceu:' + n })
  var STRAND_CABLES = STRAND.filter(function (id) { return /_cable$/.test(id) })
  var STRAND_TYPES = ['wiremill', 'extruder', 'bender', 'macerator', 'arc_furnace'].map(function (t) { return 'gtceu:' + t })

  // an unknown id would turn into air and match far more than meant
  function known(id) { return Item.exists(id) }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      var removals = []
      GTNN.filter(known).forEach(function (id) {
        removals.push({ output: id, not: NOT_OURS })
        // GT--'s mainframe is made by MAX-A1's join; their own consumers stay (the join's recipe is ours)
      })
      STRAND.filter(known).forEach(function (id) {
        STRAND_TYPES.forEach(function (type) {
          removals.push({ type: type, input: id, not: NOT_OURS })
          removals.push({ type: type, output: id, not: NOT_OURS })
        })
      })
      STRAND_CABLES.filter(known).forEach(function (id) { removals.push({ type: 'gtceu:assembler', output: id, not: NOT_OURS }) })
      var found = 0
      removals.forEach(function (f) { found += Number(event.countRecipes(f)) })
      removals.forEach(function (f) { event.remove(f) })
      console.info(LOG + 'max cuts: removed ' + found + ' recipe matches (GT-- supracausal family and wrap circuit, generic horizon strand rows)')
    } catch (e) {
      console.error(LOG + 'max cuts failed: ' + e)
    }
  })
})()
