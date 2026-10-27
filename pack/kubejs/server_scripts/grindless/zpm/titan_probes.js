// priority: -27224
// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's Titan probes (machines: startup_scripts/grindless/zpm/titan_probes.js; docs/eras/zpm.md "Machines 21-22"; ZPM-B3).
// Every machine recipe carries .dimension('grindless:saturn_orbit') and its own programmed circuit (one recipe per lookup path).
//
//   titan_entry (entry probe bay; the probe is consumed, the heat shield is spent)
//     circuit 1  entry probe + 8,000 mB nitrogen -> 8 tholin + a Titan probe recording (the haze run, Huygens)
//     circuit 2  entry probe + lake sampler -> 4,000 mB methane + 2,000 mB ethane (the lake run, Dragonfly)
//   tholin_reforming (tholin reformer; the HCN stays inside the machine and is never output)
//     circuit 1  4 tholin + 1,000 mB water -> 1,000 mB nitrile mix
//     circuit 2  1,000 mB nitrile mix -> 8 carbon fibres + 500 mB ammonia
//     circuit 3  1,000 mB nitrile mix + 2,000 mB ammonia + zinc dust (not consumed) -> 1,000 mB diaminobenzidine
//     circuit 4  (UHV-B5, line 18; added by uhv/proxima_ground.js from tables/proxima_ground.json, so it is not in this table) 4
//                sterilised ice organics (Proxima b's flare-cooked ice organics, sent up by AE2) + 1,000 mB water -> 1,000 mB nitrile
//                mix: the same hydrolysis as circuit 1, Saturn orbit too
//   telemetry_decoding (the deep space network of ZPM-A9, Earth; circuits 1-3 are A9's)
//     circuit 4  Titan probe recording + data orb + ZPM sensor + 1,000 mB liquid helium -> a lake sampler (the lake run's payload)
// Support: entry probe assembler (the PICA heat shields' use), probe bay casing assembler, the two controllers' crafting recipes.
// Destinations: methane, ethane and ammonia feed the existing chemistry; carbon fibre and diaminobenzidine are the usual materials.
// Published: global.grindless.zpmTitanProbes.recipes [{ name, type, recipeId, circuit, ... }], .skipped, .clashes.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var ZT = G.zpmTitanProbes || (G.zpmTitanProbes = {})

  var ZPM_VA = 122880
  var ORBIT = 'grindless:saturn_orbit'
  var PROBE = 'grindless:titan_entry_probe'
  var SAMPLER = 'grindless:lake_sampler'
  var THOLIN = 'grindless:tholin'
  var RECORDING = 'grindless:titan_probe_recording'
  var PICA = 'grindless:pica_heat_shield'
  var ORB = 'gtceu:data_orb'
  var NITRILES = 'gtceu:titan_nitriles'

  var TABLE = [
    { name: 'haze_descent', type: 'titan_entry', circuit: 1,
      itemsIn: [{ id: PROBE, count: 1 }], notConsumed: [], fluidsIn: [{ id: 'gtceu:nitrogen', amount: 8000 }],
      itemsOut: [{ id: THOLIN, count: 8 }, { id: RECORDING, count: 1 }], fluidsOut: [], orbit: true, eut: ZPM_VA, duration: 200 },
    { name: 'lake_sampling', type: 'titan_entry', circuit: 2,
      itemsIn: [{ id: PROBE, count: 1 }, { id: SAMPLER, count: 1 }], notConsumed: [], fluidsIn: [],
      itemsOut: [], fluidsOut: [{ id: 'gtceu:methane', amount: 4000 }, { id: 'gtceu:ethane', amount: 2000 }], orbit: true, eut: ZPM_VA, duration: 200 },
    { name: 'tholin_hydrolysis', type: 'tholin_reforming', circuit: 1,
      itemsIn: [{ id: THOLIN, count: 4 }], notConsumed: [], fluidsIn: [{ id: 'minecraft:water', amount: 1000 }],
      itemsOut: [], fluidsOut: [{ id: NITRILES, amount: 1000 }], orbit: true, eut: ZPM_VA, duration: 200 },
    { name: 'nitrile_fibres', type: 'tholin_reforming', circuit: 2,
      itemsIn: [], notConsumed: [], fluidsIn: [{ id: NITRILES, amount: 1000 }],
      itemsOut: [{ id: 'gtceu:carbon_fibers', count: 8 }], fluidsOut: [{ id: 'gtceu:ammonia', amount: 500 }], orbit: true, eut: ZPM_VA, duration: 200 },
    { name: 'nitrile_diaminobenzidine', type: 'tholin_reforming', circuit: 3,
      itemsIn: [], notConsumed: ['gtceu:zinc_dust'], fluidsIn: [{ id: NITRILES, amount: 1000 }, { id: 'gtceu:ammonia', amount: 2000 }],
      itemsOut: [], fluidsOut: [{ id: 'gtceu:diaminobenzidine', amount: 1000 }], orbit: true, eut: ZPM_VA, duration: 200 },
    { name: 'titan_lake_sampler', type: 'telemetry_decoding', circuit: 4,
      itemsIn: [{ id: RECORDING, count: 1 }, { id: ORB, count: 1 }, { id: 'gtceu:zpm_sensor', count: 1 }], notConsumed: [],
      fluidsIn: [{ id: 'gtceu:liquid_helium', amount: 1000 }],
      itemsOut: [{ id: SAMPLER, count: 1 }], fluidsOut: [], orbit: false, eut: ZPM_VA, duration: 200 }
  ]

  ZT.recipes = TABLE.map(function (t) {
    t.recipeId = 'grindless:' + t.type + '/' + t.name
    t.id = 'grindless:' + t.name
    return t
  })
  ZT.skipped = []
  ZT.clashes = []

  function clashes() {
    var out = []
    for (var i = 0; i < ZT.recipes.length; i++) {
      for (var j = i + 1; j < ZT.recipes.length; j++) {
        if (ZT.recipes[i].type === ZT.recipes[j].type && ZT.recipes[i].circuit === ZT.recipes[j].circuit) {
          out.push(ZT.recipes[i].name + ' / ' + ZT.recipes[j].name)
        }
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.map(function (x) { return x.id }).concat(r.itemsOut.map(function (x) { return x.id }), r.notConsumed)
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addMachineRecipes(event) {
    ZT.clashes = clashes()
    if (ZT.clashes.length > 0) console.error(LOG + 'titan probe recipes clash in the lookup: ' + ZT.clashes.join(', '))
    ZT.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        ZT.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'titan probes skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu[r.type](r.id)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      if (r.orbit) recipe.dimension(ORBIT)
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'titan probe recipes added: ' + (ZT.recipes.length - ZT.skipped.length))
  }

  // ASSEMBLER: the entry probe (the PICA shields' use) and the probe bay casing
  function addSupport(event) {
    var need = [PICA, PROBE, 'gtceu:zpm_sensor', 'grindless:jupiter_entry_probe', 'gtceu:titanium_plate', 'gtceu:titanium_frame',
      'grindless:station_truss_casing', 'grindless:probe_bay_casing']
    var missing = need.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'titan probe support recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:titan_entry_probe')
      .itemInputs('2x ' + PICA, '1x gtceu:zpm_sensor', '1x grindless:jupiter_entry_probe', '4x gtceu:titanium_plate')
      .circuit(1).itemOutputs('1x ' + PROBE).EUt(ZPM_VA).duration(200)
    event.recipes.gtceu.assembler('grindless:probe_bay_casing')
      .itemInputs('1x grindless:station_truss_casing', '1x gtceu:titanium_frame', '4x gtceu:titanium_plate')
      .circuit(3).itemOutputs('4x grindless:probe_bay_casing').EUt(ZPM_VA).duration(100)
  }

  // CRAFTING TABLE: hull + the machine's own parts + 4 ZPM circuits
  function addCrafting(event) {
    var HULL = 'gtceu:zpm_machine_hull'
    var list = [
      { id: 'gtceu:entry_probe_bay', pattern: ['CAC', ' H ', 'CAC'], extra: { A: 'gtceu:zpm_robot_arm' } },
      { id: 'gtceu:tholin_reformer', pattern: ['CPC', ' H ', 'CPC'], extra: { P: 'gtceu:zpm_electric_pump' } }
    ]
    list.forEach(function (m) {
      var keys = { C: '#gtceu:circuits/zpm', H: HULL }
      Object.keys(m.extra).forEach(function (k) { keys[k] = m.extra[k] })
      var parts = Object.keys(keys).map(function (k) { return keys[k] }).filter(function (v) { return v.charAt(0) !== '#' })
      var missing = parts.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'titan probe crafting of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(m.id, m.pattern, keys).id('grindless:crafting/' + m.id.split(':')[1])
    })
  }

  ServerEvents.recipes(function (event) {
    try { addMachineRecipes(event) } catch (e) { console.error(LOG + 'titan probe recipes failed: ' + e) }
    try { addSupport(event) } catch (e2) { console.error(LOG + 'titan probe support recipes failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'titan probe crafting failed: ' + e3) }
  })
})()
