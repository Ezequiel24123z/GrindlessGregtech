// -----------------------------------------------------------------------------------------------
// Recipes of UV's materials (docs/eras/uv.md, machines 13, 14 and 15, lines 11, 14 and 15; package UV-A8): the boron nitride reactor,
// the powder-in-tube line, the powder bed printer and the side steps that feed them (machines and items:
// startup_scripts/grindless/uv/materials.js). VA[ZPM] = 122,880 EU/t, VA[UV] = 491,520 EU/t.
//
//   boron nitride reactor (type gtceu:boron_nitride; the programmed circuit picks the step)
//     1 hbn           2 boron trioxide dust + 2,500 mB ammonia -> 2 hBN dust + 3,000 mB steam + 500 mB ammonia (unreacted, back)
//                                                                                                              122,880 x 400 t
//     2 bnnt          1 hBN dust + 500 mB hydrogen -> 1 BNNT dust + 500 mB hydrogen (the RF induction plasma's carrier, back)
//                                                                                                              122,880 x 300 t
//     3 bnnt_yarn     5 BNNT dust -> 1 BNNT yarn + 1 hBN dust (the spinning bench's fines, back to step 2: 4 BNNT per yarn)
//                                                                                                              122,880 x 200 t
//     4 hbn_boron_10  1,000 mB boron-10 trifluoride (the hot cell's boron-11 enrichment tails) + 1,000 mB ammonia -> 1 hBN dust +
//                     3,000 mB hydrofluoric acid (BF3 + NH3 -> BN + 3 HF; GTM's network takes the acid)       122,880 x 400 t
//   powder-in-tube line (type gtceu:powder_in_tube)
//     1 ented_powder  4 enriched naquadah + 3 trinium + 2 europium + 1 duranium dust (GTM's EnTED composition, S0-8) -> 10 EnTED powder
//                                                                                                              122,880 x 200 t
//     2 pit_billet    4 EnTED powder + 1 silver tube -> 1 PIT billet                                             122,880 x 200 t
//     3 ented_wire    1 PIT billet -> 16 EnTED single wires + 1 silver dust (the sheath, back to tubes)          491,520 x 600 t
//     GTM's own EnTED wire routes (wiremill, extruder, plate + wire cutter) are removed: the line is the only maker. GTM's doubling,
//     splitting, fine wire and cable recipes stay (they start from the line's single wire).
//   powder bed printer (type gtceu:powder_bed_fusion), from data/grindless/tables/am_powders.json
//     1 atomise_<metal>  4 ingots + 1,000 mB argon -> 4 AM powder + 950 mB argon                                122,880 x 200 t
//     2/4/5/6 print_<part>  powder + fibre laser module (2 % wear: spent module out at the same chance) -> near-net part + unsintered
//                     powder back                                                                               122,880 x 400 t
//     3 press_<part>  near-net part + 1,000 mB argon -> the part + 1,000 mB argon (hot isostatic press)         491,520 x 400 t
//   side steps (no new machine)
//     boric acid      chemical reactor: 1 borax + 2,000 mB hydrochloric acid -> 4 boric acid + 2 salt + 5,000 mB water
//                     (the salt goes to GTM's electrolyser)
//     boron trioxide  electric blast furnace (1,000 K): 2 boric acid -> 1 boron trioxide + 3,000 mB steam
//     silver tube     extruder: 1 silver ingot (tiny pipe mould, kept) -> 1 silver tube
//   steam (reactor step 1, the blast furnace) goes to GTM's steam turbines.
//   controllers (crafting grid): UV hull + 2 UV emitters + UV pump + 4 UV circuits (reactor); UV hull + 2 UV motors + UV conveyor +
//     4 UV circuits (line); UV hull + 2 UV emitters + 2 UV robot arms + 4 UV circuits (printer)
//
// Lookup: every recipe of a machine has its own circuit or its own items, so no recipe's keys contain another's (checked at load).
// Published in global.grindless.materials: .recipes [{ name, type, recipeId, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, notConsumed,
// wear, eut, duration }], .side, .crafting, .wireRemovals (filters), .wireRemoved (GTM recipes they matched), .skipped, .clashes,
// .tableProblems.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var M = G.materials || (G.materials = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}
  var TABLE = M.table || 'kubejs/data/grindless/tables/am_powders.json'

  var VA_ZPM = 122880
  var VA_UV = 491520
  var HBN = UV.hbnDust || 'grindless:hbn_dust'
  var YARN = UV.bnntYarn || 'grindless:bnnt_yarn'
  var ENTED = UV.entedPowder || 'grindless:ented_powder'
  var B10F3 = UV.boron10Trifluoride || 'gtceu:boron_10_trifluoride'
  var BNNT = 'grindless:bnnt_dust'
  var TUBE = 'grindless:silver_tube'
  var BILLET = 'grindless:pit_billet'
  var BORIC = 'gtceu:boric_acid_dust'
  var B2O3 = 'gtceu:boron_trioxide_dust'
  var ENTED_WIRE = 'gtceu:enriched_naquadah_trinium_europium_duranide_'
  var WIRE = ENTED_WIRE + 'single_wire'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(name, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration) {
    return { name: name, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut, fluidsOut: fluidsOut,
      notConsumed: [], wear: null, temp: null, eut: eut, duration: duration }
  }

  var REACTOR = [
    row('hbn', 'boron_nitride', 1, [item(B2O3, 2)], [fluid('gtceu:ammonia', 2500)], [item(HBN, 2)],
      [fluid('gtceu:steam', 3000), fluid('gtceu:ammonia', 500)], VA_ZPM, 400),
    row('bnnt', 'boron_nitride', 2, [item(HBN, 1)], [fluid('gtceu:hydrogen', 500)], [item(BNNT, 1)], [fluid('gtceu:hydrogen', 500)], VA_ZPM, 300),
    row('bnnt_yarn', 'boron_nitride', 3, [item(BNNT, 5)], [], [item(YARN, 1), item(HBN, 1)], [], VA_ZPM, 200),
    row('hbn_boron_10', 'boron_nitride', 4, [], [fluid(B10F3, 1000), fluid('gtceu:ammonia', 1000)], [item(HBN, 1)],
      [fluid('gtceu:hydrofluoric_acid', 3000)], VA_ZPM, 400)
  ]

  var LINE = [
    row('ented_powder', 'powder_in_tube', 1,
      [item('gtceu:enriched_naquadah_dust', 4), item('gtceu:trinium_dust', 3), item('gtceu:europium_dust', 2), item('gtceu:duranium_dust', 1)],
      [], [item(ENTED, 10)], [], VA_ZPM, 200),
    row('pit_billet', 'powder_in_tube', 2, [item(ENTED, 4), item(TUBE, 1)], [], [item(BILLET, 1)], [], VA_ZPM, 200),
    row('ented_wire', 'powder_in_tube', 3, [item(BILLET, 1)], [], [item(WIRE, 16), item('gtceu:silver_dust', 1)], [], VA_UV, 600)
  ]

  var SIDE = [
    row('boric_acid', 'chemical_reactor', null, [item('gtceu:borax_dust', 1)], [fluid('gtceu:hydrochloric_acid', 2000)],
      [item(BORIC, 4), item('gtceu:salt_dust', 2)], [fluid('minecraft:water', 5000)], 1920, 200),
    row('boron_trioxide', 'electric_blast_furnace', null, [item(BORIC, 2)], [], [item(B2O3, 1)], [fluid('gtceu:steam', 3000)], 1920, 300),
    row('silver_tube', 'extruder', null, [item('gtceu:silver_ingot', 1)], [], [item(TUBE, 1)], [], 480, 100)
  ]
  SIDE[1].temp = 1000
  SIDE[2].notConsumed = ['gtceu:tiny_pipe_extruder_mold']

  // ---------------------------------------------------------------- the printer's rows, from the table

  M.tableProblems = []
  M.module = null

  function printerRows() {
    var t = G.readJsonTable(TABLE)
    var out = []
    if (!t || !t.metals || !t.parts) {
      M.tableProblems.push('unreadable table ' + TABLE)
      return out
    }
    var A = t.atomise
    var P = t.press
    M.module = t.module
    var metals = {}
    t.metals.forEach(function (m) {
      metals[m.name] = m
      out.push(row('atomise_' + m.name, 'powder_bed_fusion', A.circuit, [item(m.ingot, A.ingots)], [fluid(t.argon, A.argonIn)],
        [item(m.powder, A.ingots)], [fluid(t.argon, A.argonBack)], A.eut, A.duration))
    })
    t.parts.forEach(function (p) {
      var m = metals[p.metal]
      if (!m) { M.tableProblems.push(p.name + ': unknown metal ' + p.metal); return }
      if (!(p.powderBack >= 0 && p.powderBack < p.powderIn)) { M.tableProblems.push(p.name + ': powderBack must be below powderIn'); return }
      if (p.circuit === A.circuit || p.circuit === P.circuit) { M.tableProblems.push(p.name + ': circuit ' + p.circuit + ' is a stage circuit'); return }
      var itemsOut = [item(p.nearNet, 1)]
      if (p.powderBack > 0) itemsOut.push(item(m.powder, p.powderBack))
      var print = row('print_' + p.name, 'powder_bed_fusion', p.circuit, [item(m.powder, p.powderIn)], [], itemsOut, [], t.print.eut, t.print.duration)
      print.wear = { module: t.module.id, spent: t.module.spent, chance: t.module.wear }
      out.push(print)
      out.push(row('press_' + p.name, 'powder_bed_fusion', P.circuit, [item(p.nearNet, 1)], [fluid(t.argon, P.argon)], [item(p.output, 1)],
        [fluid(t.argon, P.argon)], P.eut, P.duration))
    })
    if (M.tableProblems.length > 0) console.error(LOG + 'materials: ' + TABLE + ': ' + M.tableProblems.join('; '))
    return out
  }

  function publish(r) {
    return {
      name: r.name, type: r.type, recipeId: 'grindless:' + r.type + '/' + r.name, circuit: r.circuit, itemsIn: r.itemsIn, fluidsIn: r.fluidsIn,
      itemsOut: r.itemsOut, fluidsOut: r.fluidsOut, notConsumed: r.notConsumed, wear: r.wear, temp: r.temp, eut: r.eut, duration: r.duration
    }
  }

  M.recipes = REACTOR.concat(LINE, printerRows()).map(publish)
  M.side = SIDE.map(publish)
  M.skipped = []
  M.clashes = []
  M.crafting = {
    reactor: 'grindless:crafting/boron_nitride_reactor',
    line: 'grindless:crafting/powder_in_tube_line',
    printer: 'grindless:crafting/powder_bed_printer'
  }
  M.craftingParts = ['gtceu:uv_machine_hull', 'gtceu:uv_emitter', 'gtceu:uv_electric_pump', 'gtceu:uv_electric_motor', 'gtceu:uv_conveyor_module',
    'gtceu:uv_robot_arm']

  // GTM's EnTED wire makers: every wire size from the wiremill and the extruder, and the single wire from a plate and a wire cutter
  M.wireRemovals = []
  ;['single_wire', 'double_wire', 'quadruple_wire', 'octal_wire', 'hex_wire'].forEach(function (size) {
    M.wireRemovals.push({ type: 'gtceu:wiremill', output: ENTED_WIRE + size })
    M.wireRemovals.push({ type: 'gtceu:extruder', output: ENTED_WIRE + size })
  })
  M.wireRemovals.push({ id: 'gtceu:shaped/enriched_naquadah_trinium_europium_duranide_wire_single' })
  M.wireRemoved = null

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.notConsumed.forEach(function (id) { keys['i:' + id] = true })
    if (r.wear) keys['i:' + r.wear.module] = true
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
    var items = r.itemsIn.concat(r.itemsOut).map(function (x) { return x.id }).concat(r.notConsumed)
    if (r.wear) items.push(r.wear.module, r.wear.spent)
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRecipe(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      M.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'materials recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
    if (r.wear) recipe.chancedInput('1x ' + r.wear.module, r.wear.chance, 0)
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    if (r.wear) recipe.chancedOutput('1x ' + r.wear.spent, r.wear.chance, 0)
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.temp !== null) recipe.blastFurnaceTemp(r.temp)
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addMachines(event) {
    M.clashes = clashesOf(M.recipes)
    if (M.clashes.length > 0) console.error(LOG + 'materials recipes clash in the lookup: ' + M.clashes.join(', '))
    M.recipes.forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'materials recipes added: ' + (M.recipes.length - M.skipped.length))
  }

  function addSide(event) {
    M.side.forEach(function (r) { addRecipe(event, r) })
  }

  function removeWire(event) {
    try {
      var found = 0
      M.wireRemovals.forEach(function (f) { found += Number(event.countRecipes(f)) })
      M.wireRemoved = found
      if (found === 0) console.warn(LOG + 'materials: no GTM EnTED wire recipe matched; check the removal filters')
    } catch (e) { console.warn(LOG + 'materials: could not count the EnTED wire recipes: ' + e) }
    M.wireRemovals.forEach(function (f) { event.remove(f) })
  }

  function addCrafting(event) {
    var missing = M.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'materials controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(M.reactor || 'gtceu:boron_nitride_reactor', ['CEC', 'EHP', 'C C'], {
      C: '#gtceu:circuits/uv', E: 'gtceu:uv_emitter', P: 'gtceu:uv_electric_pump', H: 'gtceu:uv_machine_hull'
    }).id(M.crafting.reactor)
    event.recipes.gtceu.shaped(M.line || 'gtceu:powder_in_tube_line', ['CMC', 'MHV', 'C C'], {
      C: '#gtceu:circuits/uv', M: 'gtceu:uv_electric_motor', V: 'gtceu:uv_conveyor_module', H: 'gtceu:uv_machine_hull'
    }).id(M.crafting.line)
    event.recipes.gtceu.shaped(M.printer || 'gtceu:powder_bed_printer', ['CEC', 'RHR', 'CEC'], {
      C: '#gtceu:circuits/uv', E: 'gtceu:uv_emitter', R: 'gtceu:uv_robot_arm', H: 'gtceu:uv_machine_hull'
    }).id(M.crafting.printer)
  }

  ServerEvents.recipes(function (event) {
    try { removeWire(event) } catch (e0) { console.error(LOG + 'materials EnTED wire removal failed: ' + e0) }
    try { addMachines(event) } catch (e) { console.error(LOG + 'materials recipes failed: ' + e) }
    try { addSide(event) } catch (e2) { console.error(LOG + 'materials side recipes failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'materials crafting failed: ' + e3) }
  })
})()
