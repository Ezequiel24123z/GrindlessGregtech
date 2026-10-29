// priority: -24448
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's ZBLAN draw tower (docs/eras/uhv.md, machine 19 and line 31's ZrF4 row; package UHV-A10). Machine, preform and
// ZrF4: startup_scripts/grindless/uhv/zblan.js; the fibre and zirconia: F1 (startup_scripts/grindless/uhv/foundation.js).
// VA[IV] = 7,680 EU/t, VA[UV] = 491,520 EU/t, VA[UHV] = 1,966,080 EU/t.
//
//   ZBLAN draw tower (type gtceu:zblan_draw; Earth orbit only: .dimension(G.orbits.earth); the programmed circuit picks the step)
//     1 glass   55 zirconium tetrafluoride (11 ZrF4) + 4 barium + 1 lanthanum (EV's extraction cascade: its mixed rare earth chloride
//               through GTM's separation) + 1 aluminium + 4 sodium + 2 quicklime + 20,000 mB hydrogen fluoride (IV's fluorspar kiln)
//               -> 1 ZBLAN preform + 3 fluorite (CaF2) + 18,000 mB hydrogen + 1,000 mB water.
//               ZrF4-BaF2-LaF3-AlF3-NaF near 53:20:4:3:20 mol %. Ba, La, Al and Na are fluorinated in the melt under a reactive HF
//               atmosphere, the usual way to keep oxide and water out of fluoride glass (M + n HF -> MFn + n/2 H2: 18 F, 18,000 mB HF,
//               18,000 mB hydrogen); the 2,000 mB HF left in the atmosphere is the off-gas, scrubbed by the quicklime bed in the
//               exhaust (CaO + 2 HF -> CaF2 + H2O). GTM's units: compound dusts count their atoms, 1,000 mB per HF or H atom.
//                                                                                                      491,520 x 600 t (tune)
//     2 draw    1 ZBLAN preform -> 8 ZBLAN fibre spools (grindless:zblan_fibre; drawn without gravity it does not crystallise)
//                                                                                                    1,966,080 x 200 t (tune)
//   side step (GTM's own machine; line 31's ZrF4 row)
//     ZrF4      chemical reactor: 3 zirconia (ZrO2, UHV-A8's) + 4,000 mB hydrogen fluoride -> 5 zirconium tetrafluoride + 2,000 mB
//               water (ZrO2 + 4 HF -> ZrF4 + 2 H2O)                                                        7,680 x 200 t (tune)
//   controller (crafting grid): UHV hull + 2 UV motors + 2 UHV circuits (tune)
//
// Destinations (rule 3 of AGENTS.md):
//   HF off-gas (glass)   -> captured as fluorite (calcium fluoride) -> IV's fluorspar kiln (grindless:fluorspar_digestion/
//                           hydrofluoric_acid_from_fluorite: fluorite + sulfuric acid -> HF again) *(kept)*
//   hydrogen (glass)     -> GTM's hydrogen consumers (hydrochloric acid, hydrogen fluoride from the elements, ammonia)
//   water (glass, ZrF4)  -> any water consumer, the fluorspar kiln among them
//
// Lookup: each tower recipe has its own circuit, so neither recipe's keys contain the other's (checked at load). Ids not registered
// skip their row with a console error. Published in global.grindless.zblan: .recipes [{ name, type, recipeId, circuit, site, itemsIn,
// fluidsIn, itemsOut, fluidsOut, eut, duration }], .side, .crafting, .craftingParts, .skipped, .clashes, .site.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var Z = G.zblan || (G.zblan = {})
  var UHVF = G.uhvFoundation && G.uhvFoundation.ids ? G.uhvFoundation.ids : {}

  var IV = 7680
  var UVA = 491520
  var UHV = 1966080

  var FIBRE = UHVF.zblanFibre || 'grindless:zblan_fibre'
  var ZIRCONIA = (UHVF.zirconia || 'gtceu:zirconia') + '_dust'
  var PREFORM = 'grindless:zblan_preform'
  var ZRF4 = 'gtceu:zirconium_tetrafluoride_dust'
  var HF = 'gtceu:hydrofluoric_acid'
  var FLUORITE = G.fluorsparKiln && G.fluorsparKiln.charge && G.fluorsparKiln.charge.fluorite
    ? G.fluorsparKiln.charge.fluorite.id : 'gcyr:fluorite_dust'
  var ORBIT = G.orbits ? G.orbits.earth : 'gcyr:overworld_orbit'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }

  // the tower: type, circuit, site, contents
  var TABLE = [
    { name: 'glass', type: 'zblan_draw', circuit: 1, site: 'earth_orbit',
      itemsIn: [item(ZRF4, 55), item('gtceu:barium_dust', 4), item('gtceu:lanthanum_dust', 1), item('gtceu:aluminium_dust', 1),
        item('gtceu:sodium_dust', 4), item('gtceu:quicklime_dust', 2)],
      fluidsIn: [fluid(HF, 20000)],
      itemsOut: [item(PREFORM, 1), item(FLUORITE, 3)],
      fluidsOut: [fluid('gtceu:hydrogen', 18000), fluid('minecraft:water', 1000)], eut: UVA, duration: 600 },
    { name: 'draw', type: 'zblan_draw', circuit: 2, site: 'earth_orbit', itemsIn: [item(PREFORM, 1)], fluidsIn: [],
      itemsOut: [item(FIBRE, 8)], fluidsOut: [], eut: UHV, duration: 200 }
  ]

  // line 31's ZrF4 row on GTM's chemical reactor
  var SIDE = [
    { name: 'zirconium_tetrafluoride', type: 'chemical_reactor', circuit: null, site: null,
      itemsIn: [item(ZIRCONIA, 3)], fluidsIn: [fluid(HF, 4000)],
      itemsOut: [item(ZRF4, 5)], fluidsOut: [fluid('minecraft:water', 2000)], eut: IV, duration: 200 }
  ]

  function publish(t, recipeId) {
    return {
      name: t.name, type: t.type, recipeId: recipeId, circuit: t.circuit, site: t.site, itemsIn: t.itemsIn, fluidsIn: t.fluidsIn,
      itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration
    }
  }
  Z.site = ORBIT
  Z.recipes = TABLE.map(function (t) { return publish(t, 'grindless:' + t.name) })
  Z.side = SIDE.map(function (t) { return publish(t, 'grindless:' + t.name) })
  Z.skipped = []
  Z.clashes = []
  Z.crafting = { tower: 'grindless:assembly_line/zblan_draw_tower' }
  Z.craftingParts = ['gtceu:uhv_machine_hull', 'gtceu:uv_electric_motor', 'grindless:mu_metal_shield', 'grindless:fused_silica_tube', 'grindless:fibre_bragg_grating', 'grindless:ytterbium_fibre']

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    if (r.circuit !== null) keys['circuit:' + r.circuit] = true
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
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRecipe(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      Z.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'zblan recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type](r.recipeId)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.site === 'earth_orbit') recipe.dimension(ORBIT)
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addMachine(event) {
    Z.clashes = clashesOf(Z.recipes)
    if (Z.clashes.length > 0) console.error(LOG + 'zblan recipes clash in the lookup: ' + Z.clashes.join(', '))
    Z.recipes.forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'zblan recipes added: ' + (Z.recipes.length - Z.skipped.length))
  }

  function addSide(event) {
    Z.side.forEach(function (r) { addRecipe(event, r) })
  }

  function addCrafting(event) {
    var missing = Z.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'zblan controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:zblan_draw_tower')
    b.itemInputs('gtceu:uhv_machine_hull')
    b.itemInputs('2x gtceu:uv_electric_motor')
    b.itemInputs('4x #gtceu:circuits/uhv')
    b.itemInputs('4x grindless:fused_silica_tube')
    b.itemInputs('2x grindless:fibre_bragg_grating')
    b.itemInputs('2x grindless:ytterbium_fibre')
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
    b.itemOutputs('gtceu:zblan_draw_tower')
    b.stationResearch(function (r) { return r.researchStack(Item.of('grindless:mu_metal_shield')).CWUt(64).EUt(1966080) })
    b.EUt(1966080).duration(1500)
  }

  ServerEvents.recipes(function (event) {
    try { addMachine(event) } catch (e) { console.error(LOG + 'zblan recipes failed: ' + e) }
    try { addSide(event) } catch (e2) { console.error(LOG + 'zblan side recipes failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'zblan crafting failed: ' + e3) }
  })
})()
