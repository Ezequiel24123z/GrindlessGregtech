// priority: -24724
// -----------------------------------------------------------------------------------------------
// Recipes of UV's cold works (docs/eras/uv.md, machines 5 and 6, lines 7 and 13; package UV-A4): the superfluid helium plant, the SRF
// cavity works and the small side steps that close their loops (machines and items: startup_scripts/grindless/uv/cold.js).
// VA[ZPM] = 122,880 EU/t.
//
//   superfluid helium plant (type gtceu:superfluid_helium; no circuit: the fluid in is the key)
//     he2        1,000 mB liquid helium (LuV's helium refrigerator)           -> 1,000 mB superfluid helium            122,880 x 200 t
//     superleak  1,000 mB Neptune helium (UV-B1's siphon)                     -> 990 mB superfluid helium + 10 mB helium-3 concentrate
//                (only helium-4 passes a superleak; the concentrate goes to ZPM's isotope column unchanged)             122,880 x 200 t
//   SRF cavity works (type gtceu:srf_cavity; the programmed circuit picks the step)
//     1 rrr      4 niobium ingots -> 3 RRR niobium sheets + 1 niobium scrap (electron-beam melted five times)           30,720 x 300 t
//     2 cavity   9 RRR sheets -> 1 bare nine-cell cavity                                                                30,720 x 300 t
//     3 surface  1 bare cavity + 500 mB electropolish acid + 100 mB nitrogen -> 1 N-doped cavity + 500 mB spent acid    122,880 x 200 t
//     4 module   8 cavities + 4,000 mB superfluid helium + 2 UV field generators + 1 mu-metal shield -> 1 SRF cryomodule 122,880 x 600 t
//   side steps (no new machine)
//     electropolish acid  mixer: 500 mB hydrofluoric acid + 500 mB sulfuric acid -> 1,000 mB electropolish acid
//     scrap               macerator: 1 niobium scrap -> 1 niobium dust (GTM's own dust -> ingot recipe takes it back to step 1)
//     spent acid          electrolyser: 1,000 mB spent acid -> 1 niobium dust + 500 mB hydrofluoric acid + 500 mB sulfuric acid
//                         (the dissolved niobium plates out and the two acids go back to the mixer)
//     mu-metal shield     assembler: 6 nickel plates + 2 iron plates + 1 copper foil -> 1 mu-metal shield
//     block               crafting: 1 SRF cryomodule <-> 1 SRF cryomodule block (the linacs' structure block; the helium returns on
//                         deconstruction only, so the block-to-module recipe is the deconstruction)
//   controllers (crafting grid): UV hull + 4 UV pumps + 4 UV circuits (plant); UV hull + 2 UV robot arms + UV pump + 4 UV circuits (works)
//
// Lookup: every works recipe has its own circuit and the plant's recipes differ in their one fluid, so no recipe's keys contain another's
// (checked at load). Published in global.grindless.cold: .recipes [{ name, type, recipeId, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut,
// eut, duration }], .side, .crafting, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var C = G.cold || (G.cold = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}

  var VA = 122880
  var LIQUID_HELIUM = 'gtceu:liquid_helium'
  var NEPTUNE_HELIUM = UV.neptuneHelium || 'gtceu:neptune_helium'
  var SUPERFLUID = UV.superfluidHelium || 'gtceu:superfluid_helium'
  var HE3 = UV.helium3Concentrate || 'gtceu:helium_3_concentrate'
  var CRYOMODULE = UV.srfCryomodule || 'grindless:srf_cryomodule'
  var CRYOMODULE_BLOCK = UV.srfCryomoduleBlock || 'grindless:srf_cryomodule_block'
  var SHEET = 'grindless:rrr_niobium_sheet'
  var SCRAP = 'grindless:niobium_scrap'
  var BARE = 'grindless:bare_srf_cavity'
  var CAVITY = 'grindless:srf_cavity'
  var SHIELD = 'grindless:mu_metal_shield'
  var ACID = 'gtceu:electropolish_acid'
  var SPENT = 'gtceu:spent_electropolish_acid'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }

  // recipes of the two machines: type, circuit (null: none), contents
  var TABLE = [
    { name: 'he2', type: 'superfluid_helium', circuit: null, itemsIn: [], fluidsIn: [fluid(LIQUID_HELIUM, 1000)], itemsOut: [],
      fluidsOut: [fluid(SUPERFLUID, 1000)], eut: VA, duration: 200 },
    { name: 'superleak', type: 'superfluid_helium', circuit: null, itemsIn: [], fluidsIn: [fluid(NEPTUNE_HELIUM, 1000)], itemsOut: [],
      fluidsOut: [fluid(SUPERFLUID, 990), fluid(HE3, 10)], eut: VA, duration: 200 },
    { name: 'rrr', type: 'srf_cavity', circuit: 1, itemsIn: [item('gtceu:niobium_ingot', 4)], fluidsIn: [],
      itemsOut: [item(SHEET, 3), item(SCRAP, 1)], fluidsOut: [], eut: VA / 4, duration: 300 },
    { name: 'cavity', type: 'srf_cavity', circuit: 2, itemsIn: [item(SHEET, 9)], fluidsIn: [], itemsOut: [item(BARE, 1)], fluidsOut: [],
      eut: VA / 4, duration: 300 },
    { name: 'surface', type: 'srf_cavity', circuit: 3, itemsIn: [item(BARE, 1)], fluidsIn: [fluid(ACID, 500), fluid('gtceu:nitrogen', 100)],
      itemsOut: [item(CAVITY, 1)], fluidsOut: [fluid(SPENT, 500)], eut: VA, duration: 200 },
    { name: 'cryomodule', type: 'srf_cavity', circuit: 4, itemsIn: [item(CAVITY, 8), item('gtceu:uv_field_generator', 2), item(SHIELD, 1)],
      fluidsIn: [fluid(SUPERFLUID, 4000)], itemsOut: [item(CRYOMODULE, 1)], fluidsOut: [], eut: VA, duration: 600 },
    // UIV-A2 (docs/eras/uiv.md, line 1): liquid para-H2 frozen in a superfluid helium bath into the solid target the pulser compresses
    { name: 'para_h2_target', type: 'srf_cavity', circuit: 5, itemsIn: [], fluidsIn: [fluid('gtceu:liquid_para_hydrogen', 1000), fluid(SUPERFLUID, 100)],
      itemsOut: [item('grindless:solid_para_h2_target', 1)], fluidsOut: [fluid('gtceu:helium', 100)], eut: VA, duration: 400 },
    // UIV-A6 (docs/eras/uiv.md, line 44): the He-3 concentrate diluted with He-4 into the dilution refrigerator's mixture charge
    { name: 'he3_he4_mixture', type: 'superfluid_helium', circuit: null, itemsIn: [], fluidsIn: [fluid('gtceu:helium_3_concentrate', 200)],
      itemsOut: [], fluidsOut: [fluid('gtceu:he3_he4_mixture', 200)], eut: VA, duration: 200 },
    // UIV-A9 (docs/eras/uiv.md, machine 9): the p-Li6 ash split in the superfluid bath into He-3 and He-4 (a fusion product, honest destination)
    { name: 'pli6_ash_split', type: 'superfluid_helium', circuit: null, itemsIn: [], fluidsIn: [fluid('gtceu:pli6_ash', 1000)],
      itemsOut: [], fluidsOut: [fluid('gtceu:helium_3', 500), fluid('gtceu:helium', 500)], eut: VA, duration: 200 },
    // UIV-A9 (docs/eras/uiv.md, line 25): the RF-dissociated polarised H frozen in a superfluid helium bath into its ice
    { name: 'polarised_h_ice', type: 'srf_cavity', circuit: 6, itemsIn: [], fluidsIn: [fluid('gtceu:polarised_h_gas', 1000), fluid(SUPERFLUID, 100)],
      itemsOut: [item('grindless:polarised_h_ice', 1)], fluidsOut: [fluid('gtceu:helium', 100)], eut: VA, duration: 400 },
    // UIV-B3 (docs/eras/uiv.md, line 45): purified neon frozen on a cooled cone in a superfluid helium bath into the solid-neon moderator; the
    // neon boil-off goes back to the EV cryogenic plant
    { name: 'solid_neon_cone', type: 'srf_cavity', circuit: 7, itemsIn: [], fluidsIn: [fluid('gtceu:purified_neon', 1000), fluid(SUPERFLUID, 100)],
      itemsOut: [item('grindless:solid_neon_cone', 1)], fluidsOut: [fluid('gtceu:neon', 100)], eut: VA, duration: 400 }
  ]

  // side steps on GTM's own machines
  var SIDE = [
    { name: 'electropolish_acid', type: 'mixer', circuit: null, itemsIn: [], fluidsIn: [fluid('gtceu:hydrofluoric_acid', 500), fluid('gtceu:sulfuric_acid', 500)],
      itemsOut: [], fluidsOut: [fluid(ACID, 1000)], eut: 480, duration: 200 },
    { name: 'niobium_scrap', type: 'macerator', circuit: null, itemsIn: [item(SCRAP, 1)], fluidsIn: [], itemsOut: [item('gtceu:niobium_dust', 1)],
      fluidsOut: [], eut: 120, duration: 100 },
    { name: 'spent_acid_niobium', type: 'electrolyzer', circuit: null, itemsIn: [], fluidsIn: [fluid(SPENT, 1000)],
      itemsOut: [item('gtceu:niobium_dust', 1)], fluidsOut: [fluid('gtceu:hydrofluoric_acid', 500), fluid('gtceu:sulfuric_acid', 500)], eut: 480, duration: 300 },
    { name: 'mu_metal_shield', type: 'assembler', circuit: null,
      itemsIn: [item('gtceu:nickel_plate', 6), item('gtceu:iron_plate', 2), item('gtceu:copper_foil', 1)], fluidsIn: [],
      itemsOut: [item(SHIELD, 1)], fluidsOut: [], eut: 480, duration: 200 }
  ]

  C.recipes = TABLE.map(function (t) {
    return {
      name: t.name, type: t.type, recipeId: 'grindless:' + t.type + '/' + t.name, circuit: t.circuit,
      itemsIn: t.itemsIn, fluidsIn: t.fluidsIn, itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration
    }
  })
  C.side = SIDE.map(function (t) {
    return {
      name: t.name, type: t.type, recipeId: 'grindless:' + t.name, circuit: t.circuit,
      itemsIn: t.itemsIn, fluidsIn: t.fluidsIn, itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration
    }
  })
  C.skipped = []
  C.clashes = []
  C.crafting = {
    plant: 'grindless:crafting/superfluid_helium_plant',
    works: 'grindless:crafting/srf_cavity_works',
    moduleToBlock: 'grindless:crafting/srf_cryomodule_block',
    blockToModule: 'grindless:crafting/srf_cryomodule_from_block'
  }
  C.craftingParts = ['gtceu:uv_machine_hull', 'gtceu:uv_electric_pump', 'gtceu:uv_robot_arm']

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
      C.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'cold recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type](r.recipeId)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addMachines(event) {
    C.clashes = clashesOf(C.recipes)
    if (C.clashes.length > 0) console.error(LOG + 'cold recipes clash in the lookup: ' + C.clashes.join(', '))
    C.recipes.forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'cold recipes added: ' + (C.recipes.length - C.skipped.length))
  }

  function addSide(event) {
    C.side.forEach(function (r) { addRecipe(event, r) })
  }

  function addCrafting(event) {
    var missing = C.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'cold controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped('gtceu:superfluid_helium_plant', ['CPC', 'PHP', 'CPC'], {
      C: '#gtceu:circuits/uv', P: 'gtceu:uv_electric_pump', H: 'gtceu:uv_machine_hull'
    }).id(C.crafting.plant)
    event.recipes.gtceu.shaped('gtceu:srf_cavity_works', ['CRC', 'PHR', 'C C'], {
      C: '#gtceu:circuits/uv', R: 'gtceu:uv_robot_arm', P: 'gtceu:uv_electric_pump', H: 'gtceu:uv_machine_hull'
    }).id(C.crafting.works)
    if (Item.exists(CRYOMODULE) && Item.exists(CRYOMODULE_BLOCK)) {
      event.shapeless(CRYOMODULE_BLOCK, [CRYOMODULE]).id(C.crafting.moduleToBlock)
      event.shapeless(CRYOMODULE, [CRYOMODULE_BLOCK]).id(C.crafting.blockToModule)
    }
  }

  ServerEvents.recipes(function (event) {
    try { addMachines(event) } catch (e) { console.error(LOG + 'cold recipes failed: ' + e) }
    try { addSide(event) } catch (e2) { console.error(LOG + 'cold side recipes failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'cold crafting failed: ' + e3) }
  })
})()
