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

  // UEV-A5: the HfTaCN billet (the coil block's heating elements), circuit 4; the 6N hafnium dopes the grain boundaries (UEV-A4)
  TABLE.push(row('hftacn_billet', 'spark_plasma_sintering', 4,
    [item('grindless:hftacn_powder', 4), item('grindless:six_n_hafnium', 1), item('gtceu:graphite_dust', 1)], [],
    [item('gtceu:hftacn_ingot', 2), item(CARBON, 1)], [], UHVA, 600))

  // UIV-A5: the boron carbide target of the BEUV mirror (circuit 5; the La/B4C multilayer is MBE circuit 5 in tables/photonics.json)
  TABLE.push(row('b4c_target', 'spark_plasma_sintering', 5, [item(B4C, 4)], [], [item('grindless:b4c_target', 1)], [], UHVA, 500))

  // UIV-A10 (uiv.md lines 41 and 46): the niobium target of the Josephson trilayer (circuit 6) and the tungsten target of the photonic crystal (circuit 7)
  TABLE.push(row('nb_target', 'spark_plasma_sintering', 6, [item('gtceu:niobium_dust', 4)], [], [item('grindless:nb_target', 1)], [], UHVA, 500))
  TABLE.push(row('w_target', 'spark_plasma_sintering', 7, [item('gtceu:tungsten_dust', 4)], [], [item('grindless:w_target', 1)], [], UHVA, 500))

  // OpV-D1 (opv.md lines 21, 22 and 25): the 5N iridium spallation rod (c11), the 6LiH shield tile (c12) and the TiZrV getter target (c13)
  TABLE.push(row('ir_target_rod', 'spark_plasma_sintering', 11, [item('grindless:five_n_iridium', 4)], [], [item('grindless:ir_target_rod', 1)], [], UHVA, 600))
  TABLE.push(row('li6h_tile', 'spark_plasma_sintering', 12, [item('grindless:li6_hydride', 2)], [], [item('grindless:li6h_tile', 1)], [], UHVA, 400))
  TABLE.push(row('tizrv_target', 'spark_plasma_sintering', 13, [item('grindless:tizrv_ingot', 4)], [], [item('grindless:tizrv_target', 1)], [], UHVA, 500))
  // OpV-A1 (opv.md line 4): the densified chain preform sintered into two composite rods, the offcuts ground to SiC dust for the
  // UHTC blend; four rods and a lamina stack sintered into the composite rotor. opv.md's c8-9 are UXV-A1's targets (uxv/superheavy.js)
  // and c11-15 are OpV-A2's to A4's, so these are c16 and c17.
  TABLE.push(row('chain_composite_rod', 'spark_plasma_sintering', 16, [item('grindless:densified_chain_preform', 1)], [],
    [item('grindless:chain_composite_rod', 2), item(SIC, 1)], [], UHVA, 600))
  TABLE.push(row('chain_composite_rotor', 'spark_plasma_sintering', 17,
    [item('grindless:chain_composite_rod', 4), item('grindless:chain_lamina_stack', 1)], [], [item('grindless:chain_composite_rotor', 1)], [], UHVA, 800))
  // OpV-A1 (opv.md line 7): the toothed flexspline sintered with a composite rod (wave generator) and a lamina stack (circular spline)
  // into the harmonic drive (circuit 10).
  TABLE.push(row('opv_harmonic_drive', 'spark_plasma_sintering', 10,
    [item('grindless:toothed_flexspline_cup', 1), item('grindless:chain_composite_rod', 1), item('grindless:chain_lamina_stack', 1)], [],
    [item('grindless:opv_harmonic_drive', 1)], [], UHVA, 800))
  // OpV-B1 (opv.md line 34): the tungsten carbide target of the WC/SiC gamma multilayer (circuit 14; MTJ sputtering c12)
  TABLE.push(row('wc_sputter_target', 'spark_plasma_sintering', 14, [item('gtceu:tungsten_carbide_dust', 4)], [], [item('grindless:wc_sputter_target', 1)], [], UHVA, 500))
  // OpV-B3a line 32 (circuit 15; 8-14 are other lines' rows): the tungsten and the boron-10 carbide sintered into the gamma absorber tile
  TABLE.push(row('gamma_absorber_tile', 'spark_plasma_sintering', 15,
    [item('grindless:w_b4c_powder', 1)], [], [item('grindless:gamma_absorber_tile', 1)], [], UHVA, 600))

  // MAX-A2 line L10 (circuit 21: max.md gave A2 c16, but OpV-A1 and A3 already hold c16-17 here, and c17-20 are other MAX packages' numbers)
  TABLE.push(row('exotic_composite_billet', 'spark_plasma_sintering', 21,
    [item('grindless:exotic_infiltrated_preform', 1)], [], [item('grindless:exotic_composite_billet', 1)], [], UHVA, 1200))

  // MAX-D1 (max.md, L15 step 3, c18)
  TABLE.push(row('radiator_collector_shell', 'spark_plasma_sintering', 18,
    [item('grindless:sic_sic_plate', 4), item('grindless:tantalum_carbide_liner', 1)], [], [item('grindless:radiator_collector_shell', 1)], [], UHVA, 600))

  // MAX-D1 (max.md, L24 step 4, c22): the payload casing, sintered; the Penrose engine returns one casing per burnt payload
  TABLE.push(row('payload_casing', 'spark_plasma_sintering', 22,
    [item('grindless:sic_sic_plate', 4), item('gtceu:tungsten_steel_plate', 2)], [], [item('grindless:payload_casing', 1)], [], UHVA, 600))

  // MAX-R1 (max.md, L36 step 3, c20): the Ta-Hf-C powder sintered, never melted, into the hearth liner's billet
  TABLE.push(row('ta_hf_c_billet', 'spark_plasma_sintering', 20,
    [item('grindless:ta_hf_c_powder', 4)], [], [item('grindless:ta_hf_c_billet', 1)], [], UHVA, 900))

  // MAX-E1 (max.md, L25 step 5, c19): the slag compact sintered, never melted, into the feeder's slag pellet
  TABLE.push(row('slag_pellet', 'spark_plasma_sintering', 19,
    [item('grindless:slag_compact', 4)], [], [item('grindless:slag_pellet', 1)], [], UHVA, 600))

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
  P.crafting = { sinterer: 'grindless:assembly_line/spark_plasma_sinterer' }
  var CRAFTING_PARTS = ['gtceu:uhv_machine_hull', 'gtceu:uhv_electric_piston', 'gtceu:uhv_field_generator', 'gtceu:uhv_sensor', 'grindless:propellant_tank', 'grindless:silica_aerogel', 'grindless:nbn_coated_sic_plate', 'grindless:mu_metal_shield']

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

  // the controller: assembly line, station research, UHV hull + 2 UV pistons + 4 UHV circuits + 3 line items + soldering alloy, lubricant, tritanium
  function addCrafting(event) {
    var missing = CRAFTING_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      P.skipped.push({ name: 'crafting', reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'sinterer controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:spark_plasma_sinterer')
    b.itemInputs('gtceu:uhv_machine_hull')
    b.itemInputs('3x gtceu:uhv_electric_piston')
    b.itemInputs('3x gtceu:uhv_field_generator')
    b.itemInputs('3x gtceu:uhv_sensor')
    b.itemInputs('4x #gtceu:circuits/uhv')
    b.itemInputs('4x grindless:silica_aerogel')
    b.itemInputs('2x grindless:nbn_coated_sic_plate')
    b.itemInputs('2x grindless:mu_metal_shield')
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
    b.itemOutputs(P.sinterer || 'gtceu:spark_plasma_sinterer')
    b.stationResearch(function (r) { return r.researchStack(Item.of('grindless:propellant_tank')).CWUt(64).EUt(1966080) })
    b.EUt(1966080).duration(1500)
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
