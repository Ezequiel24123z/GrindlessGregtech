// priority: -19924
// Gregtech Grindless - MAX-T2 "Gate c15 to the belt" (docs/eras/max.md, Bridges). The warp gate's c15 row (hold_nsc_belt) is in
// data/grindless/tables/gate.json, read by server_scripts/grindless/uhv/gate.js (site sgr_a_orbit = gcyr:black_hole_orbit); the platform it
// places is the nsc row of tables/relay_platforms.json, placed by uxv/kerr_sling.js (one poll per source place, so the Sgr A* source serves
// this row like the Cygnus X-1 source serves the others); the max-nsc substage is the tier model's grant of the arrival, not a script.
//
//   grindless:nsc_belt_seed   gtceu:assembly_line at VA[MAX], researched with the imager's ephemeris: the seed that aims at the nuclear star
//                             cluster. MAX parts (two arms, two sensors, the Rydberg array, two MAX circuits), the probe seed copy and the
//                             OpV-made feedstock and sinter casing it unfolds the belt platform from.
//
// Published in global.grindless.maxGateNsc: .seed, .recipes, .skipped.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/max_gate_nsc] '
  var MAXT = 14
  var G = global.grindless || (global.grindless = {})
  var MN = G.maxGateNsc || (G.maxGateNsc = {})
  MN.recipes = []
  MN.skipped = []

  var SEED = {
    items: ['1x grindless:probe_seed', '1x grindless:nsc_ephemeris', '1x grindless:rydberg_logic_array', '2x grindless:max_robot_arm',
      '2x grindless:max_sensor', '8x grindless:metal_feedstock', '4x grindless:cluster_sinter_casing', '2x #gtceu:circuits/max'],
    fluids: [['gtceu:soldering_alloy', 4608], ['gtceu:lubricant', 4000]],
    out: 'grindless:nsc_belt_seed', research: 'grindless:nsc_ephemeris', cwut: 256, duration: 2400
  }
  MN.seed = SEED

  function idOf(s) { return s.replace(/^\d+x /, '') }

  function addSeed(event) {
    var eut = Number(GTValues.VA[MAXT])
    var ids = SEED.items.map(idOf).filter(function (id) { return id.charAt(0) !== '#' }).concat([SEED.out, SEED.research])
    var missing = ids.filter(function (id) { return !Item.exists(id) })
    SEED.fluids.forEach(function (f) { if (!Fluid.exists(f[0])) missing.push(f[0]) })
    if (missing.length > 0) {
      MN.skipped.push({ name: 'nsc_belt_seed', missing: missing })
      console.error(LOG + 'nsc_belt_seed skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:nsc_belt_seed')
    SEED.items.forEach(function (s) { b.itemInputs(s) })
    SEED.fluids.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
    b.itemOutputs(SEED.out)
    b.stationResearch(function (r) { return r.researchStack(Item.of(SEED.research)).CWUt(SEED.cwut).EUt(eut) })
    b.EUt(eut).duration(SEED.duration)
    MN.recipes.push('grindless:assembly_line/nsc_belt_seed')
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addSeed(event)
    } catch (e) {
      console.error(LOG + 'nsc_belt_seed failed: ' + e)
    }
  })
})()
