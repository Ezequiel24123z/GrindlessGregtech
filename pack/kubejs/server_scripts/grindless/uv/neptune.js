// priority: -25524
// -----------------------------------------------------------------------------------------------
// Recipes of UV's Neptune orbit (machines: startup_scripts/grindless/uv/neptune.js; docs/eras/uv.md, machines 24-25; UV-B2).
// Every machine recipe carries .dimension('grindless:neptune_orbit') and its own programmed circuit (one recipe per lookup path).
//
//   ice_giant_siphon (ZPM's type; only the Neptune deep siphon runs these rows, ZPM's siphon refuses them: recipe path ice_giant_siphon/neptune_*)
//     the Neptune sample (ZPM's flyby, not consumed) tells it how deep; the scoop head wears (25 = 0.25 % per run, the drill family's bit)
//     circuit 4  -> 16,000 mB HD-rich Neptune hydrogen + 4,000 mB Neptune helium (with its He-3)
//     circuit 5  -> 4,000 mB methane + 500 mB hydrogen sulfide (the ices below the methane deck)
//     Circuits 1-3 are ZPM's Uranus rows; ZPM's circuit 4 (bottle -> atmosphere sample) has other inputs, so the lookup keeps them apart.
//   triton_plume (Triton geyser sampler; the Triton probe recording of ZPM's flyby is not consumed, 1 aerogel cartridge per pass)
//     circuit 1  -> 8,000 mB Triton nitrogen (N-15-rich) + 1 tholin (the geysers' dark plume particles)
//     circuit 2  -> 1 Triton ice core + 2,000 mB Triton nitrogen
//   cryogenic_isotope_separation (ZPM's Saturn column, Saturn orbit as its other rows), circuit 4:
//     16,000 mB Neptune hydrogen -> 124 mB deuterium + 15,876 mB hydrogen (Uranus's ratio: both ice giants' D/H are about the same)
//   circuit 5: 100 mB helium-3 concentrate (the superleak's, uv/cold.js) -> 20 mB helium-3 + 80 mB helium
//     (per 1,000 mB Neptune helium that is 2 mB helium-3, Saturn helium's 0.2 %; the helium goes back to the LuV liquefier)
// Destinations: Neptune helium the superleak (uv/cold.js) and the Neptunian seed (uv/travel.js); Neptune hydrogen the isotope column above;
// methane the pyrolyser; H2S the slurry separator and the sulfur line; Triton nitrogen its nitric oxide (uv/thorium.js); tholin the tholin
// reformer (zpm/titan_probes.js); the Triton ice core the penetrator probe bay's catalyst (UV-B3). Nothing is voided.
// Support: the two controllers' crafting recipes.
// Published: global.grindless.uvNeptune.recipes [{ name, type, recipeId, circuit, ... }], .skipped, .clashes.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var N = G.uvNeptune || (G.uvNeptune = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}

  var UV_VA = 491520
  var ZPM_VA = 122880
  var ORBIT = 'grindless:neptune_orbit'
  var NEPTUNE_SAMPLE = 'grindless:neptune_sample'
  var TRITON_REC = 'grindless:triton_probe_recording'
  var SCOOP = 'grindless:scoop_head'
  var CARTRIDGE = 'grindless:aerogel_cartridge'
  var THOLIN = 'grindless:tholin'
  var NEPTUNE_HELIUM = String(UV.neptuneHelium || 'gtceu:neptune_helium')
  var NEPTUNE_HYDROGEN = String(UV.neptuneHydrogen || 'gtceu:neptune_hydrogen')
  var TRITON_NITROGEN = String(UV.tritonNitrogen || 'gtceu:triton_nitrogen')
  var ICE_CORE = String(UV.tritonIceCore || 'grindless:triton_ice_core')
  var HE3_CONCENTRATE = String(UV.helium3Concentrate || 'gtceu:helium_3_concentrate')

  N.items = { neptuneSample: NEPTUNE_SAMPLE, tritonRecording: TRITON_REC, scoop: SCOOP, cartridge: CARTRIDGE, tholin: THOLIN, iceCore: ICE_CORE }
  N.fluids = { neptuneHelium: NEPTUNE_HELIUM, neptuneHydrogen: NEPTUNE_HYDROGEN, tritonNitrogen: TRITON_NITROGEN }

  var TABLE = [
    { name: 'neptune_deep_hydrogen', type: 'ice_giant_siphon', circuit: 4,
      itemsIn: [], notConsumed: [NEPTUNE_SAMPLE], worn: SCOOP,
      fluidsIn: [], fluidsOut: [{ id: NEPTUNE_HYDROGEN, amount: 16000 }, { id: NEPTUNE_HELIUM, amount: 4000 }],
      itemsOut: [], eut: UV_VA, duration: 100, dim: ORBIT },
    { name: 'neptune_deep_ices', type: 'ice_giant_siphon', circuit: 5,
      itemsIn: [], notConsumed: [NEPTUNE_SAMPLE], worn: SCOOP,
      fluidsIn: [], fluidsOut: [{ id: 'gtceu:methane', amount: 4000 }, { id: 'gtceu:hydrogen_sulfide', amount: 500 }],
      itemsOut: [], eut: UV_VA, duration: 100, dim: ORBIT },
    { name: 'triton_geyser_nitrogen', type: 'triton_plume', circuit: 1,
      itemsIn: [{ id: CARTRIDGE, count: 1 }], notConsumed: [TRITON_REC], worn: null,
      fluidsIn: [], fluidsOut: [{ id: TRITON_NITROGEN, amount: 8000 }],
      itemsOut: [{ id: THOLIN, count: 1 }], eut: UV_VA, duration: 200, dim: ORBIT },
    { name: 'triton_geyser_ice_core', type: 'triton_plume', circuit: 2,
      itemsIn: [{ id: CARTRIDGE, count: 1 }], notConsumed: [TRITON_REC], worn: null,
      fluidsIn: [], fluidsOut: [{ id: TRITON_NITROGEN, amount: 2000 }],
      itemsOut: [{ id: ICE_CORE, count: 1 }], eut: UV_VA, duration: 200, dim: ORBIT },
    { name: 'neptune_deuterium', type: 'cryogenic_isotope_separation', circuit: 4,
      itemsIn: [], notConsumed: [], worn: null,
      fluidsIn: [{ id: NEPTUNE_HYDROGEN, amount: 16000 }],
      fluidsOut: [{ id: 'gtceu:deuterium', amount: 124 }, { id: 'gtceu:hydrogen', amount: 15876 }],
      itemsOut: [], eut: ZPM_VA, duration: 200, dim: 'grindless:saturn_orbit' },
    { name: 'neptune_helium_three', type: 'cryogenic_isotope_separation', circuit: 5,
      itemsIn: [], notConsumed: [], worn: null,
      fluidsIn: [{ id: HE3_CONCENTRATE, amount: 100 }],
      fluidsOut: [{ id: 'gtceu:helium_3', amount: 20 }, { id: 'gtceu:helium', amount: 80 }],
      itemsOut: [], eut: ZPM_VA, duration: 200, dim: 'grindless:saturn_orbit' }
  ]

  N.recipes = TABLE.map(function (t) {
    t.recipeId = 'grindless:' + t.type + '/' + t.name
    t.id = 'grindless:' + t.name
    return t
  })
  N.skipped = []
  N.clashes = []

  function clashes() {
    var out = []
    for (var i = 0; i < N.recipes.length; i++) {
      for (var j = i + 1; j < N.recipes.length; j++) {
        if (N.recipes[i].type !== N.recipes[j].type) continue
        if (N.recipes[i].circuit === N.recipes[j].circuit) out.push(N.recipes[i].name + ' / ' + N.recipes[j].name)
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
    N.clashes = clashes()
    if (N.clashes.length > 0) console.error(LOG + 'neptune recipes clash in the lookup: ' + N.clashes.join(', '))
    N.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        N.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'neptune skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
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
    console.info(LOG + 'neptune recipes added: ' + (N.recipes.length - N.skipped.length))
  }

  // CRAFTING TABLE: UV hull + the machine's own parts + 4 UV circuits
  function addCrafting(event) {
    var HULL = 'gtceu:uv_machine_hull'
    var list = [
      { id: 'gtceu:neptune_deep_siphon', pattern: ['CPC', 'MHM', 'CPC'], extra: { P: 'gtceu:uv_electric_pump', M: 'gtceu:uv_electric_motor' } },
      { id: 'gtceu:triton_geyser_sampler', pattern: ['CRC', ' H ', 'CRC'], extra: { R: 'gtceu:uv_robot_arm' } }
    ]
    list.forEach(function (m) {
      var keys = { C: '#gtceu:circuits/uv', H: HULL }
      Object.keys(m.extra).forEach(function (k) { keys[k] = m.extra[k] })
      var parts = Object.keys(keys).map(function (k) { return keys[k] }).filter(function (v) { return v.charAt(0) !== '#' })
      var missing = parts.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'neptune crafting of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(m.id, m.pattern, keys).id('grindless:crafting/' + m.id.split(':')[1])
    })
  }

  ServerEvents.recipes(function (event) {
    try { addMachineRecipes(event) } catch (e) { console.error(LOG + 'neptune recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'neptune crafting failed: ' + e2) }
  })
})()
