// priority: -24824
// -----------------------------------------------------------------------------------------------
// Recipes of UV's detectors (docs/eras/uv.md, machines 11 and 12, lines 10 and 21; package UV-A7): the zone refining tower and the
// optical ground station (machines: startup_scripts/grindless/uv/detectors.js). VA[LuV] = 30,720 EU/t, VA[ZPM] = 122,880 EU/t,
// VA[UV] = 491,520 EU/t. GTM's units: 1,000 mB per Cl or H atom.
//
//   zone refining tower (type gtceu:zone_refining; the programmed circuit picks the step)
//     1 chlorinate  1 germanium dust (Io's fumaroles) + 4,000 mB chlorine -> 1,000 mB germanium tetrachloride (Ge + 2 Cl2 -> GeCl4;
//                   UV-A6's fibre preform takes 100 mB of it)                                                      30,720 x 400 t
//     2 reduce      1,000 mB GeCl4 + 2,000 mB water + 4,000 mB hydrogen -> 1 germanium ingot + 4,000 mB hydrochloric acid + 2,000 mB
//                   water (hydrolysis GeCl4 + 2 H2O -> GeO2 + 4 HCl, then GeO2 + 2 H2 -> Ge + 2 H2O: the water comes back)
//                                                                                                                   30,720 x 600 t
//     3 refine      4 germanium ingots -> 1 HPGe crystal (the RF coils sweep the impurities to the bar's ends thirteen times over, the
//                   puller grows the crystal: thirteen nines) + 1 germanium dust (the impure ends, back to circuit 1)  122,880 x 2,400 t
//   optical ground station (type gtceu:optical_downlink; no circuit)
//     1 downlink    1 Starshot probe in flight (F1's id; its maker is a later package) + 100 mB superfluid helium + the SNSPD array
//                   (not consumed: the ZPM qubit fab's circuit 3) -> 1 Proxima approach data + 100 mB helium (the detector's bath,
//                   boiled off)                                                                                    491,520 x 6,000 t
//   controllers (assembly line, station research, UV hull + parts + 4 UV circuits + 3 line items + soldering alloy, lubricant, tritanium)
//
// Destinations (rule 3 of AGENTS.md):
//   germanium tetrachloride -> circuit 2, or UV-A6's fibre preform (gtceu:fibre_draw circuit 1)
//   hydrochloric acid (2)   -> GTM's electrolyser (hydrogen + chlorine: both come back to circuits 1 and 2) or A6's arsine step
//   water (2)               -> looped into the next run of circuit 2
//   germanium dust (3)      -> circuit 1
//   helium (downlink)       -> GTM's vacuum freezer (liquid helium) and the superfluid helium plant (superfluid helium) again
//
// Lookup: every tower recipe has its own circuit; the station has one recipe (checked at load). Ids not registered skip their row with a
// console error. Published in global.grindless.detectors: .recipes [{ name, type, recipeId, circuit, itemsIn, fluidsIn, itemsOut,
// fluidsOut, eut, duration, notConsumable }], .crafting, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var D = G.detectors || (G.detectors = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}

  var LUV = 30720
  var ZPM = 122880
  var UVA = 491520

  var HPGE = UV.hpgeCrystal || 'grindless:hpge_crystal'
  var SNSPD = UV.snspdArray || 'grindless:snspd_array'
  var PROBE = UV.starshotProbe || 'grindless:starshot_probe'
  var PROXIMA = UV.proximaApproachData || 'grindless:proxima_approach_data'
  var SUPERFLUID = UV.superfluidHelium || 'gtceu:superfluid_helium'

  var GECL4 = 'gtceu:germanium_tetrachloride'
  var GE_DUST = 'gtceu:germanium_dust'
  var GE_INGOT = 'gtceu:germanium_ingot'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }

  var TABLE = [
    { name: 'germanium_tetrachloride', type: 'zone_refining', circuit: 1, itemsIn: [item(GE_DUST, 1)],
      fluidsIn: [fluid('gtceu:chlorine', 4000)], itemsOut: [], fluidsOut: [fluid(GECL4, 1000)], eut: LUV, duration: 400 },
    { name: 'germanium_reduction', type: 'zone_refining', circuit: 2, itemsIn: [],
      fluidsIn: [fluid(GECL4, 1000), fluid('minecraft:water', 2000), fluid('gtceu:hydrogen', 4000)],
      itemsOut: [item(GE_INGOT, 1)], fluidsOut: [fluid('gtceu:hydrochloric_acid', 4000), fluid('minecraft:water', 2000)],
      eut: LUV, duration: 600 },
    { name: 'hpge_crystal', type: 'zone_refining', circuit: 3, itemsIn: [item(GE_INGOT, 4)], fluidsIn: [],
      itemsOut: [item(HPGE, 1), item(GE_DUST, 1)], fluidsOut: [], eut: ZPM, duration: 2400 },
    { name: 'proxima_approach_data', type: 'optical_downlink', circuit: null, notConsumable: SNSPD, itemsIn: [item(PROBE, 1)],
      fluidsIn: [fluid(SUPERFLUID, 100)], itemsOut: [item(PROXIMA, 1)], fluidsOut: [fluid('gtceu:helium', 100)],
      eut: UVA, duration: 6000 }
  ]

  // UIV-A5 (uiv.md line 11): the float-zone Si-28 ingot (circuit 6) and the donor wafers regrown into one (circuit 7, lossy: 10 donors
  // make an ingot that cuts 8 wafers, so the silicon is never free; the Si-28 itself comes only from the IV hot cell)
  TABLE.push({ name: 'si28_fz_ingot', type: 'zone_refining', circuit: 6, itemsIn: [item('grindless:silicon_28_dust', 8)],
    fluidsIn: [fluid('gtceu:argon', 1000)], itemsOut: [item('grindless:si28_fz_ingot', 1)], fluidsOut: [], eut: UVA, duration: 800 })
  TABLE.push({ name: 'si28_donor_regrow', type: 'zone_refining', circuit: 7, itemsIn: [item('grindless:si28_donor_wafer', 10)],
    fluidsIn: [fluid('gtceu:argon', 1000)], itemsOut: [item('grindless:si28_fz_ingot', 1)], fluidsOut: [], eut: UVA, duration: 800 })

  // UXV-A2: 7N tellurium and germanium for the spintronic stacks (circuits 8-9; 4-7 are taken); the head and tail are returned as dust
  TABLE.push({ name: 'seven_n_tellurium', type: 'zone_refining', circuit: 8, itemsIn: [item('gtceu:tellurium_dust', 2)],
    fluidsIn: [fluid('gtceu:argon', 1000)], itemsOut: [item('grindless:seven_n_tellurium', 1), item('gtceu:small_tellurium_dust', 4)],
    fluidsOut: [], eut: UVA, duration: 800 })
  TABLE.push({ name: 'seven_n_germanium', type: 'zone_refining', circuit: 9, itemsIn: [item(GE_DUST, 2)],
    fluidsIn: [fluid('gtceu:argon', 1000)], itemsOut: [item('grindless:seven_n_germanium', 1), item('gtceu:small_germanium_dust', 4)],
    fluidsOut: [], eut: UVA, duration: 800 })

  // OpV-A1 (opv.md line 10): the extraction cascade's scrubbed GeCl4 reduced and zone-passed to 13N germanium for the HPGe Compton crystal
  // (circuit 10; 1-9 are taken); the head and tail come back as small dust, the HCl and water go back to stock
  TABLE.push({ name: 'thirteen_n_germanium', type: 'zone_refining', circuit: 10, itemsIn: [],
    fluidsIn: [fluid('gtceu:pure_germanium_tetrachloride', 1000), fluid('minecraft:water', 2000), fluid('gtceu:hydrogen', 4000)],
    itemsOut: [item('grindless:thirteen_n_germanium', 1), item('gtceu:small_germanium_dust', 2)],
    fluidsOut: [fluid('gtceu:hydrochloric_acid', 4000), fluid('minecraft:water', 2000)], eut: UVA, duration: 2400 })

  D.recipes = TABLE.map(function (t) {
    return {
      name: t.name, type: t.type, recipeId: 'grindless:' + t.type + '/' + t.name, circuit: t.circuit, itemsIn: t.itemsIn,
      fluidsIn: t.fluidsIn, itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration,
      notConsumable: t.notConsumable || null
    }
  })
  D.skipped = []
  D.clashes = []
  D.crafting = { tower: 'grindless:assembly_line/zone_refining_tower', station: 'grindless:assembly_line/optical_ground_station' }
  D.craftingParts = ['gtceu:uv_machine_hull', 'gtceu:uv_electric_motor', 'gtceu:uv_emitter', 'gtceu:uv_sensor']

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    if (r.circuit !== null) keys['circuit:' + r.circuit] = true
    if (r.notConsumable) keys['i:' + r.notConsumable] = true
    return keys
  }

  function subset(a, b) {
    return Object.keys(a).every(function (k) { return b[k] === true })
  }

  function clashesOf(list) {
    var out = []
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        if (list[i].type !== list[j].type) continue
        var a = keysOf(list[i])
        var b = keysOf(list[j])
        if (subset(a, b) || subset(b, a)) out.push(list[i].name + ' / ' + list[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.concat(r.itemsOut)
    if (r.notConsumable) items = items.concat([item(r.notConsumable, 0)])
    items.forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRecipe(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      D.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'detectors recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (r.notConsumable) recipe.notConsumable(r.notConsumable)
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addMachines(event) {
    D.clashes = clashesOf(D.recipes)
    if (D.clashes.length > 0) console.error(LOG + 'detectors recipes clash in the lookup: ' + D.clashes.join(', '))
    D.recipes.forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'detectors recipes added: ' + (D.recipes.length - D.skipped.length))
  }

  function addCrafting(event) {
    var missing = D.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'detectors controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    // station research of a component of each line; different parts and research so GTM's lookup (which ignores counts) tells them apart
    var defs = [
      { id: 'zone_refining_tower', name: 'gtceu:zone_refining_tower', research: 'grindless:silicon_28_dust',
        parts: ['gtceu:uv_machine_hull', '2x gtceu:uv_emitter', '2x gtceu:uv_electric_motor'],
        domain: ['8x grindless:silicon_28_dust', '4x grindless:fused_silica_tube', '2x grindless:sapphire_wafer'] },
      { id: 'optical_ground_station', name: 'gtceu:optical_ground_station', research: 'grindless:snspd_array',
        parts: ['gtceu:uv_machine_hull', '4x gtceu:uv_sensor'],
        domain: ['4x grindless:snspd_array', '2x grindless:hpge_crystal', '4x grindless:silicon_28_dust'] }
    ]
    defs.forEach(function (d) {
      var ids = [d.name, d.research].concat(d.domain.map(function (s) { return s.replace(/^\d+x /, '') }))
      var gone = ids.filter(function (id) { return !Item.exists(id) })
      if (gone.length > 0) {
        console.error(LOG + d.id + ' controller recipe skipped, unknown item(s): ' + gone.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.id)
      d.parts.forEach(function (s) { b.itemInputs(s) })
      b.itemInputs('4x #gtceu:circuits/uv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000), Fluid.of('gtceu:tritanium', 576))
      b.itemOutputs(d.name)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(491520) })
      b.EUt(491520).duration(1200)
    })
  }

  ServerEvents.recipes(function (event) {
    try { addMachines(event) } catch (e) { console.error(LOG + 'detectors recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'detectors crafting failed: ' + e2) }
  })
})()
