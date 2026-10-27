// priority: -27424
// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's Uranus orbit (machines: startup_scripts/grindless/zpm/uranus.js; docs/eras/zpm.md "Machines 25-27"; ZPM-B5).
// Every machine recipe carries .dimension('grindless:uranus_orbit') and its own programmed circuit (one recipe per lookup path).
//
//   ice_giant_siphon (Saturn's interior model = catalyst, scoop head worn: 25 = 0.25 % per run, as the Saturn siphon)
//     circuit 1  -> 8,000 mB Uranus hydrogen (deuterium-rich) + 2,000 mB helium
//     circuit 2  -> 4,000 mB methane + 500 mB hydrogen sulfide (the ices; the H2S goes to the separator)
//     circuit 3  -> 2,000 mB diamond slurry (the diamond rain)
//     circuit 4  1 glass bottle -> 1 ice giant atmosphere sample (the first run: the bottle is the flask; the Uranus bridge's local input)
//   slurry_separation
//     circuit 1  2,000 mB diamond slurry + 500 mB H2S -> 4 diamond dust + 1 ice giant diamond seed + 1 sulfur dust + 500 mB ammonia + 500 mB water
//                (the real ammonia water, split into its two usual fluids: there is no ammonia-water fluid)
//   outer_flyby (the probe is consumed, the aerogel shield is spent)
//     circuit 1  Neptune flyby probe + silica aerogel -> Neptune probe recording + 1 Neptune sample
//     circuit 2  Neptune flyby probe + silica aerogel + Titan entry probe (the lander pod) -> Triton probe recording + 4,000 mB nitrogen
//   cryogenic_isotope_separation (the Saturn column, any dimension), circuit 3: 8,000 mB Uranus hydrogen -> 62 mB deuterium + 7,938 mB hydrogen
//     (2.5 x Saturn's 25 mB per 8,000 mB; so Uranus hydrogen has a use besides the chemistry).
// Support: the Neptune flyby probe and the pressure hull casing (assembler), the Neptune sample flask (centrifuge: methane + hydrogen + the
// bottle back), the three controllers' crafting recipes.
// Destinations: helium the usual cryogenics; methane, hydrogen, ammonia, water the usual chemistry; H2S the separator (its sulfur the LV
// sulfuric acid line); diamond dust the autoclave and the lattice fab; the seed the lattice fab (cvd diamond; not consumed); nitrogen the Titan
// bay and the lattice fab; recordings the deep space network (observatory.js); the atmosphere sample the Uranus quantum seed (travel.js).
// Published: global.grindless.zpmUranus.recipes [{ name, type, recipeId, circuit, ... }], .skipped, .clashes.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var UR = G.zpmUranus || (G.zpmUranus = {})

  var ZPM_VA = 122880
  var ORBIT = 'grindless:uranus_orbit'
  var MODEL = 'grindless:saturn_interior_model'
  var SCOOP = 'grindless:scoop_head'
  var BOTTLE = 'minecraft:glass_bottle'
  var SAMPLE = 'grindless:ice_giant_atmosphere_sample'
  var SEED = 'grindless:ice_giant_diamond_seed'
  var PROBE = 'grindless:neptune_flyby_probe'
  var NEPTUNE_SAMPLE = 'grindless:neptune_sample'
  var NEPTUNE_REC = 'grindless:neptune_probe_recording'
  var TRITON_REC = 'grindless:triton_probe_recording'
  var AEROGEL = 'grindless:silica_aerogel'
  var LANDER = 'grindless:titan_entry_probe'

  UR.items = { model: MODEL, scoop: SCOOP, sample: SAMPLE, seed: SEED, probe: PROBE, neptuneSample: NEPTUNE_SAMPLE, neptuneRecording: NEPTUNE_REC,
    tritonRecording: TRITON_REC, aerogel: AEROGEL, lander: LANDER }

  var TABLE = [
    { name: 'uranus_hydrogen', type: 'ice_giant_siphon', circuit: 1,
      itemsIn: [], notConsumed: [MODEL], worn: SCOOP,
      fluidsIn: [], fluidsOut: [{ id: 'gtceu:uranus_hydrogen', amount: 8000 }, { id: 'gtceu:helium', amount: 2000 }],
      itemsOut: [], eut: ZPM_VA, duration: 100, dim: ORBIT },
    { name: 'uranus_ices', type: 'ice_giant_siphon', circuit: 2,
      itemsIn: [], notConsumed: [MODEL], worn: SCOOP,
      fluidsIn: [], fluidsOut: [{ id: 'gtceu:methane', amount: 4000 }, { id: 'gtceu:hydrogen_sulfide', amount: 500 }],
      itemsOut: [], eut: ZPM_VA, duration: 100, dim: ORBIT },
    { name: 'diamond_rain', type: 'ice_giant_siphon', circuit: 3,
      itemsIn: [], notConsumed: [MODEL], worn: SCOOP,
      fluidsIn: [], fluidsOut: [{ id: 'gtceu:diamond_slurry', amount: 2000 }],
      itemsOut: [], eut: ZPM_VA, duration: 200, dim: ORBIT },
    { name: 'atmosphere_sample', type: 'ice_giant_siphon', circuit: 4,
      itemsIn: [{ id: BOTTLE, count: 1 }], notConsumed: [MODEL], worn: SCOOP,
      fluidsIn: [], fluidsOut: [],
      itemsOut: [{ id: SAMPLE, count: 1 }], eut: ZPM_VA, duration: 100, dim: ORBIT },
    { name: 'slurry_decompression', type: 'slurry_separation', circuit: 1,
      itemsIn: [], notConsumed: [], worn: null,
      fluidsIn: [{ id: 'gtceu:diamond_slurry', amount: 2000 }, { id: 'gtceu:hydrogen_sulfide', amount: 500 }],
      fluidsOut: [{ id: 'gtceu:ammonia', amount: 500 }, { id: 'minecraft:water', amount: 500 }],
      itemsOut: [{ id: 'gtceu:diamond_dust', count: 4 }, { id: SEED, count: 1 }, { id: 'gtceu:sulfur_dust', count: 1 }],
      eut: ZPM_VA, duration: 300, dim: ORBIT },
    { name: 'neptune_flyby', type: 'outer_flyby', circuit: 1,
      itemsIn: [{ id: PROBE, count: 1 }, { id: AEROGEL, count: 1 }], notConsumed: [], worn: null,
      fluidsIn: [], fluidsOut: [],
      itemsOut: [{ id: NEPTUNE_REC, count: 1 }, { id: NEPTUNE_SAMPLE, count: 1 }], eut: ZPM_VA, duration: 600, dim: ORBIT },
    { name: 'triton_flyby', type: 'outer_flyby', circuit: 2,
      itemsIn: [{ id: PROBE, count: 1 }, { id: AEROGEL, count: 1 }, { id: LANDER, count: 1 }], notConsumed: [], worn: null,
      fluidsIn: [], fluidsOut: [{ id: 'gtceu:nitrogen', amount: 4000 }],
      itemsOut: [{ id: TRITON_REC, count: 1 }], eut: ZPM_VA, duration: 600, dim: ORBIT },
    { name: 'uranus_deuterium', type: 'cryogenic_isotope_separation', circuit: 3,
      itemsIn: [], notConsumed: [], worn: null,
      fluidsIn: [{ id: 'gtceu:uranus_hydrogen', amount: 8000 }],
      fluidsOut: [{ id: 'gtceu:deuterium', amount: 62 }, { id: 'gtceu:hydrogen', amount: 7938 }],
      itemsOut: [], eut: ZPM_VA, duration: 200, dim: 'grindless:saturn_orbit' }
  ]

  UR.recipes = TABLE.map(function (t) {
    t.recipeId = 'grindless:' + t.type + '/' + t.name
    t.id = 'grindless:' + t.name
    return t
  })
  UR.skipped = []
  UR.clashes = []

  function clashes() {
    var out = []
    for (var i = 0; i < UR.recipes.length; i++) {
      for (var j = i + 1; j < UR.recipes.length; j++) {
        if (UR.recipes[i].type !== UR.recipes[j].type) continue
        if (UR.recipes[i].circuit === UR.recipes[j].circuit) out.push(UR.recipes[i].name + ' / ' + UR.recipes[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.map(function (x) { return x.id }).concat(r.itemsOut.map(function (x) { return x.id }), r.notConsumed)
    if (r.worn) items.push(r.worn)
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addMachineRecipes(event) {
    UR.clashes = clashes()
    if (UR.clashes.length > 0) console.error(LOG + 'uranus recipes clash in the lookup: ' + UR.clashes.join(', '))
    UR.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        UR.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'uranus skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu[r.type](r.id)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
      if (r.worn) recipe.chancedInput('1x ' + r.worn, 25, 0)
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      if (r.dim) recipe.dimension(r.dim)
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'uranus recipes added: ' + (UR.recipes.length - UR.skipped.length))
  }

  // ASSEMBLER: the Neptune flyby probe (PICA shields, sensor, emitter) and the pressure hull casing
  function addParts(event) {
    var need = ['grindless:pica_heat_shield', 'gtceu:zpm_sensor', 'gtceu:zpm_emitter', 'gtceu:titanium_plate', PROBE,
      'gtceu:tungsten_steel_plate', 'gtceu:duranium_plate', 'gtceu:naquadah_plate', 'grindless:pressure_hull_casing']
    var missing = need.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'uranus part recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:neptune_flyby_probe')
      .itemInputs('2x grindless:pica_heat_shield', '1x gtceu:zpm_sensor', '1x gtceu:zpm_emitter', '4x gtceu:titanium_plate')
      .circuit(4).itemOutputs('1x ' + PROBE).EUt(ZPM_VA).duration(300)
    event.recipes.gtceu.assembler('grindless:pressure_hull_casing')
      .itemInputs('4x gtceu:tungsten_steel_plate', '2x gtceu:duranium_plate', '1x gtceu:naquadah_plate')
      .circuit(5).itemOutputs('4x grindless:pressure_hull_casing').EUt(ZPM_VA).duration(100)
  }

  // CENTRIFUGE: the Neptune sample's use (rule 3: every product has a destination): its gases, and the flask goes back
  function addFlask(event) {
    var missing = [NEPTUNE_SAMPLE, BOTTLE].filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0 || !Fluid.exists('gtceu:methane') || !Fluid.exists('gtceu:hydrogen')) {
      console.error(LOG + 'neptune sample flask recipe skipped, unknown id(s)')
      return
    }
    event.recipes.gtceu.centrifuge('grindless:neptune_sample_flask')
      .itemInputs('1x ' + NEPTUNE_SAMPLE).circuit(1)
      .itemOutputs('1x ' + BOTTLE)
      .outputFluids(Fluid.of('gtceu:methane', 2000), Fluid.of('gtceu:hydrogen', 1000))
      .EUt(7680).duration(200)
  }

  // CRAFTING TABLE: hull + the machine's own parts + 4 ZPM circuits
  function addCrafting(event) {
    var HULL = 'gtceu:zpm_machine_hull'
    var list = [
      { id: 'gtceu:ice_giant_siphon', pattern: ['CPC', 'MHM', 'CPC'], extra: { P: 'gtceu:zpm_electric_pump', M: 'gtceu:zpm_electric_motor' } },
      { id: 'gtceu:slurry_separator', pattern: ['CPC', ' H ', 'CPC'], extra: { P: 'gtceu:zpm_electric_pump' } },
      { id: 'gtceu:flyby_probe_bay', pattern: ['CRC', 'RHE', 'C C'], extra: { R: 'gtceu:zpm_robot_arm', E: 'gtceu:zpm_emitter' } }
    ]
    list.forEach(function (m) {
      var keys = { C: '#gtceu:circuits/zpm', H: HULL }
      Object.keys(m.extra).forEach(function (k) { keys[k] = m.extra[k] })
      var parts = Object.keys(keys).map(function (k) { return keys[k] }).filter(function (v) { return v.charAt(0) !== '#' })
      var missing = parts.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'uranus crafting of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(m.id, m.pattern, keys).id('grindless:crafting/' + m.id.split(':')[1])
    })
  }

  ServerEvents.recipes(function (event) {
    try { addMachineRecipes(event) } catch (e) { console.error(LOG + 'uranus recipes failed: ' + e) }
    try { addParts(event) } catch (e2) { console.error(LOG + 'uranus part recipes failed: ' + e2) }
    try { addFlask(event) } catch (e3) { console.error(LOG + 'neptune flask recipe failed: ' + e3) }
    try { addCrafting(event) } catch (e4) { console.error(LOG + 'uranus crafting failed: ' + e5(e4)) }
  })
  function e5(e) { return String(e) }
})()
