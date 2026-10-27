// priority: -23824
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's ceramics (docs/eras/uhv.md, machine 16, line 26; package UHV-A8): the spark plasma sinterer, line 26's side steps
// and the ICAN rocket motor's loot table and tool tag (machine, items, materials and the motor: startup_scripts/grindless/uhv/propulsion.js;
// the motor and the oganesson pod are made by the thruster works: server_scripts/grindless/uv/propulsion.js, circuits 4 and 5).
// VA[EV] = 1,920 EU/t, VA[IV] = 7,680, VA[ZPM] = 122,880, VA[UV] = 491,520, VA[UHV] = 1,966,080. GTM's units: one dust per atom of
// a formula (ZrO2 = 3, B4C = 5, ZrB2 = 3), 1,000 mB of a gas per molecule (CO).
//
//   spark plasma sinterer (type gtceu:spark_plasma_sintering; the programmed circuit picks the step; pulsed current through a
//   graphite die, NASA Ames' SHARP UHTCs)
//     1 uhtc_tile     8 UHTC blend (ZrB2-SiC) + 1 graphite dust (the die it wears) -> 2 UHTC tiles + 1 carbon dust (the worn die
//                     back as carbon)                                                                           491,520 x 400 t
//     2 tantalum_carbide_liner  2 tantalum dust + 2 carbon dust -> 1 TaC liner (reaction sintering, Ta + C -> TaC)
//                                                                                                               122,880 x 300 t
//     3 uhtc_nozzle   4 UHTC tiles + 1 TaC liner (the throat) -> 1 UHTC nozzle                                 1,966,080 x 600 t
//   line 26's side steps (GTM's own machines)
//     zirconia        electric blast furnace (2,100 K): 4 red zircon dust (GTCA's ZrSiO4: the Moon, Mars, Venus, Mercury,
//                     Proxima b) -> 3 zirconia + 1 silicon dioxide (zircon dissociates into ZrO2 and SiO2 above 1,750 C; the
//                     silica goes to GTM's glass and silicon lines)                                                7,680 x 400 t
//     boron_carbide   electric blast furnace (2,500 K): 4 boron dust + 1 carbon dust -> 5 boron carbide (B4C)   1,920 x 400 t
//     zirconium_diboride  electric blast furnace (2,000 K): 6 zirconia + 5 boron carbide + 3 carbon dust -> 6 zirconium diboride +
//                     4,000 mB carbon monoxide (2 ZrO2 + B4C + 3 C -> 2 ZrB2 + 4 CO, the carbothermal route)          7,680 x 600 t
//     uhtc_blend      mixer: 6 zirconium diboride + 2 silicon carbide dust (GTCA's) -> 8 UHTC blend ((ZrB2)2SiC, about 25 % SiC
//                     by volume, the SHARP composition)                                                             30,720 x 200 t
//   crafting: UHV hull + 2 UV pistons + 2 UHV circuits (the sinterer)
//
// Destinations (rule 3 of AGENTS.md):
//   carbon monoxide (ZrB2)   -> HV's syngas plant (circuit 5 takes CO), or GTM's chemical reactor
//   carbon dust (c1)         -> the die wear comes back as carbon: c2, boron carbide or zirconium diboride take it
//   silicon dioxide (zircon) -> GTM's glass, silicon and concrete recipes
//
// Lookup: every sinterer recipe has its own circuit and its own items; the side steps' inputs are not a subset of any GTM recipe's
// on the same machine (checked against the S0 recipe dump) nor of each other's (checked at load). Ids not yet registered skip their
// row with a console error. Published in global.grindless.uhvPropulsion: .recipes and .side [{ name, type, recipeId, circuit, itemsIn,
// fluidsIn, itemsOut, fluidsOut, temp, eut, duration }], .crafting, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var P = G.uhvPropulsion || (G.uhvPropulsion = {})
  var F = G.uhvFoundation && G.uhvFoundation.ids ? G.uhvFoundation.ids : {}
  var ids = P.ids || {}

  var EV = 1920
  var IV = 7680
  var LUV = 30720
  var ZPM = 122880
  var UVA = 491520
  var UHVA = 1966080

  var TILE = F.uhtcTile || 'grindless:uhtc_tile'
  var NOZZLE = F.uhtcNozzle || 'grindless:uhtc_nozzle'
  var ZIRCONIA = 'gtceu:zirconia_dust'
  var ZRB2 = 'gtceu:zirconium_diboride_dust'
  var B4C = 'gtceu:boron_carbide_dust'
  var BLEND = 'gtceu:uhtc_blend_dust'
  var LINER = ids.tantalumCarbideLiner || 'grindless:tantalum_carbide_liner'
  var MOTOR = P.motor || 'grindless:ican_rocket_motor'
  var CARBON = 'gtceu:carbon_dust'
  var ZIRCON = 'gtca:red_zircon_dust'
  var SIC = 'gtca:silicon_carbide_dust'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(name, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration, temp) {
    return { name: name, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut, fluidsOut: fluidsOut,
      temp: temp || null, eut: eut, duration: duration }
  }

  var TABLE = [
    row('uhtc_tile', 'spark_plasma_sintering', 1, [item(BLEND, 8), item('gtceu:graphite_dust', 1)], [],
      [item(TILE, 2), item(CARBON, 1)], [], UVA, 400),
    row('tantalum_carbide_liner', 'spark_plasma_sintering', 2, [item('gtceu:tantalum_dust', 2), item(CARBON, 2)], [],
      [item(LINER, 1)], [], ZPM, 300),
    row('uhtc_nozzle', 'spark_plasma_sintering', 3, [item(TILE, 4), item(LINER, 1)], [], [item(NOZZLE, 1)], [], UHVA, 600)
  ]

  var SIDE = [
    row('zirconia', 'electric_blast_furnace', null, [item(ZIRCON, 4)], [],
      [item(ZIRCONIA, 3), item('gtceu:silicon_dioxide_dust', 1)], [], IV, 400, 2100),
    row('boron_carbide', 'electric_blast_furnace', null, [item('gtceu:boron_dust', 4), item(CARBON, 1)], [],
      [item(B4C, 5)], [], EV, 400, 2500),
    row('zirconium_diboride', 'electric_blast_furnace', null, [item(ZIRCONIA, 6), item(B4C, 5), item(CARBON, 3)], [],
      [item(ZRB2, 6)], [fluid('gtceu:carbon_monoxide', 4000)], IV, 600, 2000),
    row('uhtc_blend', 'mixer', null, [item(ZRB2, 6), item(SIC, 2)], [], [item(BLEND, 8)], [], LUV, 200)
  ]

  // recipeId is the id GTM gives the recipe: the builder gets grindless:<name> and GTM puts the type's path in front
  function publish(r) {
    return {
      name: r.name, type: r.type, recipeId: 'grindless:' + r.type + '/' + r.name, circuit: r.circuit, itemsIn: r.itemsIn,
      fluidsIn: r.fluidsIn, itemsOut: r.itemsOut, fluidsOut: r.fluidsOut, temp: r.temp, eut: r.eut, duration: r.duration
    }
  }
  P.recipes = TABLE.map(publish)
  P.side = SIDE.map(publish)
  P.skipped = []
  P.clashes = []
  P.crafting = { sinterer: 'grindless:crafting/spark_plasma_sinterer' }
  var CRAFTING_PARTS = ['gtceu:uhv_machine_hull', 'gtceu:uv_electric_piston']

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
    r.itemsIn.concat(r.itemsOut).forEach(function (x) {
      if (x.id.charAt(0) === '#') return
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRecipe(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      P.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'propulsion recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.temp !== null) recipe.blastFurnaceTemp(r.temp)
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addAll(event) {
    P.clashes = clashesOf(P.recipes.concat(P.side))
    if (P.clashes.length > 0) console.error(LOG + 'propulsion recipes clash in the lookup: ' + P.clashes.join(', '))
    var all = P.recipes.concat(P.side)
    all.forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'propulsion recipes added: ' + (all.length - P.skipped.length))
  }

  // the controller: UHV hull + 2 UV pistons + 2 UHV circuits (no other UHV controller takes UV pistons)
  function addCrafting(event) {
    var missing = CRAFTING_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      P.skipped.push({ name: 'crafting', reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'sinterer controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(P.sinterer || 'gtceu:spark_plasma_sinterer', ['CPC', ' H ', ' P '], {
      C: '#gtceu:circuits/uhv', P: 'gtceu:uv_electric_piston', H: 'gtceu:uhv_machine_hull'
    }).id(P.crafting.sinterer)
  }

  ServerEvents.recipes(function (event) {
    try { addAll(event) } catch (e) { console.error(LOG + 'propulsion recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'sinterer crafting failed: ' + e2) }
  })

  // the motor is a createCustom block: KubeJS gives it no loot table and no tool tag
  ServerEvents.blockLootTables(function (event) {
    if (!Item.exists(MOTOR)) return
    event.addSimpleBlock(MOTOR)
  })
  ServerEvents.tags('block', function (event) {
    if (!Item.exists(MOTOR)) return
    event.add('minecraft:mineable/pickaxe', MOTOR)
  })
})()
