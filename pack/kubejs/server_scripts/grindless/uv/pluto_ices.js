// priority: -25724
// -----------------------------------------------------------------------------------------------
// Recipes of UV's Pluto ices (machines: startup_scripts/grindless/uv/pluto_ices.js; docs/eras/uv.md, machines 26-27, line 16; UV-B3).
// Every machine recipe carries .dimension('grindless:pluto_orbit') and its own programmed circuit (one recipe per lookup path).
//
//   penetrator_probe (drill family step 11; the Triton ice core is not consumed, one penetrator probe is spent in each drop: it stays in the ice)
//     circuit 1  -> 1 Sputnik ice core (Sputnik Planitia's nitrogen glacier)
//     circuit 2  -> 1 Charon core (Charon's water-ammonia crust)
//   ice_fractionation (each ice sublimes at its own temperature on the stepped cold finger)
//     circuit 1  1 Sputnik ice core -> 16,000 mB nitrogen + 2,000 mB carbon monoxide + 1,000 mB methane + 1 tholin
//     circuit 2  1 Charon core      -> 8,000 mB water + 2,000 mB ammonia + 1 silicon dioxide dust (the silicate grit under the ice)
// Destinations: the Sputnik ice core the Plutonian seed's catalyst (uv/travel.js); nitrogen the nitrogen network; carbon monoxide the syngas
// plant's Pluto shift (hv/syngas_plant.js, circuit 5, with Charon's water); methane the pyrolyser; tholin the tholin reformer
// (zpm/titan_probes.js); ammonia the nitric acid line; water the shift and the network; silicate the glass works. Nothing is voided.
// Support: the penetrator probe (assembler: the printed probe frame, a GPHS module, the HPGe spectrometer, a LuV melt head) and the two
// controllers' crafting recipes.
// Published: global.grindless.uvPlutoIces.recipes [{ name, type, recipeId, circuit, ... }], .skipped, .clashes.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var P = G.uvPlutoIces || (G.uvPlutoIces = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}
  var MAT = G.uvMaterials && G.uvMaterials.ids ? G.uvMaterials.ids : {}

  var UV_VA = 491520
  var ZPM_VA = 122880
  var ORBIT = 'grindless:pluto_orbit'
  var PENETRATOR = 'grindless:penetrator_probe'
  var TRITON_CORE = String(UV.tritonIceCore || 'grindless:triton_ice_core')
  var SPUTNIK_CORE = String(UV.sputnikIceCore || 'grindless:sputnik_ice_core')
  var CHARON_CORE = String(UV.charonCore || 'grindless:charon_core')
  var GPHS = String(UV.gphsModule || 'grindless:gphs_module')
  var HPGE = String(UV.hpgeCrystal || 'grindless:hpge_crystal')
  var FRAME = String(MAT.printedProbeFrame || 'grindless:printed_probe_frame')
  var MELT_HEAD = 'grindless:melt_head'
  var THOLIN = 'grindless:tholin'
  var SILICATE = 'gtceu:silicon_dioxide_dust'

  P.items = { penetrator: PENETRATOR, tritonCore: TRITON_CORE, sputnikCore: SPUTNIK_CORE, charonCore: CHARON_CORE, tholin: THOLIN,
    silicate: SILICATE }

  var TABLE = [
    { name: 'sputnik_penetrator', type: 'penetrator_probe', circuit: 1,
      itemsIn: [{ id: PENETRATOR, count: 1 }], notConsumed: [TRITON_CORE],
      fluidsOut: [], itemsOut: [{ id: SPUTNIK_CORE, count: 1 }], eut: UV_VA, duration: 200 },
    { name: 'charon_penetrator', type: 'penetrator_probe', circuit: 2,
      itemsIn: [{ id: PENETRATOR, count: 1 }], notConsumed: [TRITON_CORE],
      fluidsOut: [], itemsOut: [{ id: CHARON_CORE, count: 1 }], eut: UV_VA, duration: 200 },
    { name: 'sputnik_ice_fractionation', type: 'ice_fractionation', circuit: 1,
      itemsIn: [{ id: SPUTNIK_CORE, count: 1 }], notConsumed: [],
      fluidsOut: [{ id: 'gtceu:nitrogen', amount: 16000 }, { id: 'gtceu:carbon_monoxide', amount: 2000 }, { id: 'gtceu:methane', amount: 1000 }],
      itemsOut: [{ id: THOLIN, count: 1 }], eut: ZPM_VA, duration: 600 },
    { name: 'charon_ice_fractionation', type: 'ice_fractionation', circuit: 2,
      itemsIn: [{ id: CHARON_CORE, count: 1 }], notConsumed: [],
      fluidsOut: [{ id: 'minecraft:water', amount: 8000 }, { id: 'gtceu:ammonia', amount: 2000 }],
      itemsOut: [{ id: SILICATE, count: 1 }], eut: ZPM_VA, duration: 600 }
  ]

  P.recipes = TABLE.map(function (t) {
    t.dim = ORBIT
    t.recipeId = 'grindless:' + t.type + '/' + t.name
    t.id = 'grindless:' + t.name
    return t
  })
  P.skipped = []
  P.clashes = []

  function clashes() {
    var out = []
    for (var i = 0; i < P.recipes.length; i++) {
      for (var j = i + 1; j < P.recipes.length; j++) {
        if (P.recipes[i].type !== P.recipes[j].type) continue
        if (P.recipes[i].circuit === P.recipes[j].circuit) out.push(P.recipes[i].name + ' / ' + P.recipes[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.map(function (x) { return x.id }).concat(r.itemsOut.map(function (x) { return x.id }), r.notConsumed)
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsOut.forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addMachineRecipes(event) {
    P.clashes = clashes()
    if (P.clashes.length > 0) console.error(LOG + 'pluto ices recipes clash in the lookup: ' + P.clashes.join(', '))
    P.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        P.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'pluto ices skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu[r.type](r.id)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
      recipe.circuit(r.circuit)
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.dimension(r.dim)
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'pluto ices recipes added: ' + (P.recipes.length - P.skipped.length))
  }

  // The penetrator: the printed frame carries the GPHS module (heat to melt in and power), the HPGe spectrometer and a LuV melt head.
  function addPenetrator(event) {
    var parts = [FRAME, GPHS, HPGE, MELT_HEAD, 'gtceu:uv_sensor']
    var missing = parts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      P.skipped.push({ name: 'penetrator_probe', reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'pluto ices penetrator skipped: unknown id(s) ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:penetrator_probe')
      .itemInputs(FRAME, GPHS, HPGE, MELT_HEAD, 'gtceu:uv_sensor', '#gtceu:circuits/zpm')
      .itemOutputs(PENETRATOR)
      .EUt(ZPM_VA).duration(200)
  }

  // CRAFTING TABLE: UV hull + the machine's own parts + 4 UV circuits
  function addCrafting(event) {
    var HULL = 'gtceu:uv_machine_hull'
    var list = [
      { id: 'gtceu:penetrator_probe_bay', pattern: ['CRC', ' H ', 'CRC'], extra: { R: 'gtceu:uv_robot_arm' } },
      { id: 'gtceu:volatile_ice_fractionator', pattern: ['CPC', ' H ', 'CPC'], extra: { P: 'gtceu:uv_electric_pump' } }
    ]
    list.forEach(function (m) {
      var keys = { C: '#gtceu:circuits/uv', H: HULL }
      Object.keys(m.extra).forEach(function (k) { keys[k] = m.extra[k] })
      var parts = Object.keys(keys).map(function (k) { return keys[k] }).filter(function (v) { return v.charAt(0) !== '#' })
      var missing = parts.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'pluto ices crafting of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(m.id, m.pattern, keys).id('grindless:crafting/' + m.id.split(':')[1])
    })
  }

  ServerEvents.recipes(function (event) {
    try { addMachineRecipes(event) } catch (e) { console.error(LOG + 'pluto ices recipes failed: ' + e) }
    try { addPenetrator(event) } catch (e2) { console.error(LOG + 'pluto ices penetrator failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'pluto ices crafting failed: ' + e3) }
  })
})()
