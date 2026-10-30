// priority: -23524
// -----------------------------------------------------------------------------------------------
// Recipes of UHV on Mercury's ground (machines, types and items: startup_scripts/grindless/uhv/mercury.js; docs/eras/uhv.md, machines 20
// and 21, lines 19 and 20; package UHV-B2). Every recipe of both machines carries .dimension('gcyr:mercury') (IV's Mercury site); the
// furnace's also carry .daytime(false), Mercury's day side only (IV's solar field rule, iv/mercury.js).
//
//   regolith excavator (type gtceu:regolith_excavation)
//     dig             1 bucket drum (worn 1 in 32 runs) + IV's iridosmine vein sample (never used up) -> 64 Mercury regolith
//                     The only maker of Mercury regolith.                                                          30,720 x 200 t
//   solar vapour furnace (type gtceu:solar_vaporisation; the circuit picks the step)
//     1 low_fraction   16 Mercury regolith + crucible lining (worn 1 in 16) at 1,400 K -> 500 mB sodium-potassium + 2 sulfur +
//                      12 stripped regolith                                                                         7,680 x 400 t
//     2 high_fraction  12 stripped regolith + crucible lining (worn 1 in 16) at 2,300 K -> 3 magnesium + 2 silicon monoxide + 1 iron +
//                      4 alumina-calcia residue + 1 graphite                                                        7,680 x 600 t
//     3 sinter_lining  4 alumina-calcia residue -> 1 crucible lining (the residue is calcium aluminate, the lining's own ceramic)
//                                                                                                                   7,680 x 200 t
//     No osmium, iridium or any metal GTM gates by tier comes out (docs/eras/iv.md:159): only light-element fractions.
//   side steps (GTM machines, no new one)
//     electrolyser    1 alumina-calcia residue (CaAl2O4) -> 2 aluminium + 1 calcium + 4,000 mB oxygen: the swarm's reflector film's
//                     aluminium (B3)                                                                                1,920 x 280 t
//     blast furnace   2 silicon monoxide at 1,700 K -> 1 silicon + 1 silicon dioxide (2 SiO -> Si + SiO2, disproportionation)
//                                                                                                                   1,920 x 200 t
//     blast furnace   2 sapphire + 2 quicklime at 1,800 K -> 1 crucible lining (the first lining: calcium aluminate from its oxides)
//                                                                                                                   1,920 x 400 t
//     extruder        1 iron ingot (tiny pipe mould, kept) -> 1 iron tube (the MgB2 powder-in-tube sheath, uv/materials.js circuit 5)
//                                                                                                                     480 x 100 t
//     assembler       6 tungsten steel plates + 2 naquadah alloy plates + 1 tungsten steel frame -> 1 bucket drum   30,720 x 400 t
//   byproducts: sodium-potassium -> GTM's coolant uses (the hatch recipes); sulfur, graphite, magnesium, iron, oxygen, calcium and
//   silicon dioxide -> the network; magnesium + boron -> MgB2 dust in GTM's mixer -> the powder-in-tube line.
//   controllers (crafting grid): UHV hull + 2 UV motors + 2 UHV circuits (excavator); UHV hull + 2 UV sensors + 2 UHV circuits (furnace)
//
// Lookup: every recipe of a type has its own items or circuit, so no recipe's keys contain another's (checked at load).
// Published in global.grindless.uhvMercury: .recipes [{ name, type, recipeId, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, notConsumed,
// wear, temp, daylight, eut, duration }], .skipped, .clashes, .crafting.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var HM = G.uhvMercury || (G.uhvMercury = {})
  var IDS = HM.ids || {}
  var SITE = HM.site || 'gcyr:mercury'

  var REGOLITH = IDS.regolith || 'grindless:mercury_regolith'
  var STRIPPED = IDS.stripped || 'grindless:stripped_mercury_regolith'
  var DRUM = IDS.drum || 'grindless:excavator_bucket_drum'
  var LINING = IDS.lining || 'grindless:regolith_crucible_lining'
  var SIO = IDS.siliconMonoxide || 'grindless:silicon_monoxide_dust'
  var RESIDUE = IDS.aluminaCalcia || 'grindless:alumina_calcia_residue'
  var IRON_TUBE = IDS.ironTube || 'grindless:iron_tube'
  var SAMPLE = IDS.sample || 'grindless:vein_sample_iridosmine_mercury'
  var EXCAVATION = 'regolith_excavation'
  var VAPOUR = 'solar_vaporisation'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(name, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration, extra) {
    var r = { name: name, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut, fluidsOut: fluidsOut,
      notConsumed: [], wear: null, temp: null, site: null, daylight: false, eut: eut, duration: duration }
    Object.keys(extra || {}).forEach(function (k) { r[k] = extra[k] })
    return r
  }

  var ROWS = [
    row('dig', EXCAVATION, null, [], [], [item(REGOLITH, 64)], [], 30720, 200,
      { notConsumed: [SAMPLE], wear: { id: DRUM, chance: 313 }, site: SITE }),
    row('low_fraction', VAPOUR, 1, [item(REGOLITH, 16)], [], [item('gtceu:sulfur_dust', 2), item(STRIPPED, 12)],
      [fluid('gtceu:sodium_potassium', 500)], 7680, 400, { wear: { id: LINING, chance: 625 }, site: SITE, daylight: true }),
    row('high_fraction', VAPOUR, 2, [item(STRIPPED, 12)], [],
      [item('gtceu:magnesium_dust', 3), item(SIO, 2), item('gtceu:iron_dust', 1), item(RESIDUE, 4), item('gtceu:graphite_dust', 1)], [],
      7680, 600, { wear: { id: LINING, chance: 625 }, site: SITE, daylight: true }),
    row('sinter_lining', VAPOUR, 3, [item(RESIDUE, 4)], [], [item(LINING, 1)], [], 7680, 200, { site: SITE, daylight: true }),
    row('alumina_calcia', 'electrolyzer', null, [item(RESIDUE, 1)], [], [item('gtceu:aluminium_dust', 2), item('gtceu:calcium_dust', 1)],
      [fluid('gtceu:oxygen', 4000)], 1920, 280),
    row('silicon_monoxide', 'electric_blast_furnace', null, [item(SIO, 2)], [], [item('gtceu:silicon_dust', 1), item('gtceu:silicon_dioxide_dust', 1)],
      [], 1920, 200, { temp: 1700 }),
    row('regolith_crucible_lining', 'electric_blast_furnace', null, [item('gtceu:sapphire_dust', 2), item('gtceu:quicklime_dust', 2)], [],
      [item(LINING, 1)], [], 1920, 400, { temp: 1800 }),
    row('iron_tube', 'extruder', null, [item('minecraft:iron_ingot', 1)], [], [item(IRON_TUBE, 1)], [], 480, 100,
      { notConsumed: ['gtceu:tiny_pipe_extruder_mold'] }),
    row('excavator_bucket_drum', 'assembler', null,
      [item('gtceu:tungsten_steel_plate', 6), item('gtceu:naquadah_alloy_plate', 2), item('gtceu:tungsten_steel_frame', 1), item('grindless:nbn_coated_sic_plate', 1), item('grindless:mu_metal_shield', 1)],
      [fluid('gtceu:soldering_alloy', 144), fluid('gtceu:lubricant', 250)],
      [item(DRUM, 1)], [], 30720, 400)
  ]

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.concat(r.itemsOut).map(function (x) { return x.id }).concat(r.notConsumed)
    if (r.wear !== null) items.push(r.wear.id)
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(r) {
    var def = null
    Object.keys(HM.machines || {}).forEach(function (k) { if (HM.machines[k].type === r.type) def = HM.machines[k] })
    if (def === null) return null
    var io = def.maxIO
    var itemsIn = r.itemsIn.length + r.notConsumed.length + (r.wear !== null ? 1 : 0) + (r.circuit !== null ? 1 : 0)
    if (itemsIn > io.itemsIn) return itemsIn + ' item inputs (the type holds ' + io.itemsIn + ')'
    if (r.itemsOut.length > io.itemsOut) return r.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (r.fluidsIn.length > io.fluidsIn) return r.fluidsIn.length + ' fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (r.fluidsOut.length > io.fluidsOut) return r.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function addRecipe(event, r) {
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
    if (r.wear !== null) recipe.chancedInput(r.wear.id, r.wear.chance, 0)
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.temp !== null) recipe.blastFurnaceTemp(r.temp)
    if (r.site !== null) recipe.dimension(r.site)
    if (r.daylight) recipe.daytime(false)
    recipe.EUt(r.eut).duration(r.duration)
  }

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.notConsumed.forEach(function (id) { keys['i:' + id] = true })
    if (r.wear !== null) keys['i:' + r.wear.id] = true
    r.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    if (r.circuit !== null) keys['circuit:' + r.circuit] = true
    return keys
  }

  function clashesOf(recs) {
    var out = []
    var keys = recs.map(keysOf)
    function subset(a, b) { return Object.keys(a).every(function (k) { return b[k] === true }) }
    for (var i = 0; i < recs.length; i++) {
      for (var j = i + 1; j < recs.length; j++) {
        if (recs[i].type !== recs[j].type) continue
        if (subset(keys[i], keys[j]) || subset(keys[j], keys[i])) out.push(recs[i].type + ': ' + recs[i].name + ' / ' + recs[j].name)
      }
    }
    return out
  }

  function generate(event) {
    HM.recipes = []
    HM.skipped = []
    ROWS.forEach(function (r) {
      var label = r.type + '/' + r.name
      var missing = missingIds(r)
      if (missing.length > 0) {
        HM.skipped.push({ name: label, reason: 'unknown id(s): ' + missing.join(', ') })
        console.error(LOG + 'mercury skipped ' + label + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var tooBig = sizeProblem(r)
      if (tooBig !== null) {
        HM.skipped.push({ name: label, reason: tooBig })
        console.error(LOG + 'mercury skipped ' + label + ': ' + tooBig)
        return
      }
      try {
        addRecipe(event, r)
      } catch (e) {
        HM.skipped.push({ name: label, reason: 'the builder failed: ' + e })
        console.error(LOG + 'mercury skipped ' + label + ': the builder failed: ' + e)
        return
      }
      r.recipeId = 'grindless:' + r.type + '/' + r.name
      HM.recipes.push(r)
    })
    HM.clashes = clashesOf(HM.recipes)
    if (HM.clashes.length > 0) console.error(LOG + 'mercury: recipes whose ingredients are a subset of another\'s: ' + HM.clashes.join('; '))
    console.info(LOG + 'mercury: ' + HM.recipes.length + ' recipes; skipped ' + HM.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var MOTOR = 'gtceu:uhv_electric_motor'
    var SENSOR = 'gtceu:uhv_sensor'
    var PISTON = 'gtceu:uhv_electric_piston'
    var CONVEYOR = 'gtceu:uhv_conveyor_module'
    var EMITTER = 'gtceu:uhv_emitter'
    var PUMP = 'gtceu:uhv_electric_pump'
    var M = HM.machines || {}
    var defs = [
      { machine: (M.excavator && M.excavator.machine) || 'gtceu:regolith_excavator', name: 'regolith_excavator', parts: [HULL, MOTOR, PISTON, CONVEYOR], research: 'grindless:excavator_bucket_drum', domain: ['4x grindless:iron_tube', '2x grindless:mu_metal_shield', '2x grindless:thruster_pod'] },
      { machine: (M.furnace && M.furnace.machine) || 'gtceu:solar_vapour_furnace', name: 'solar_vapour_furnace', parts: [HULL, SENSOR, EMITTER, PUMP], research: 'grindless:silica_aerogel', domain: ['4x grindless:nbn_coated_sic_plate', '2x grindless:fused_silica_tube', '2x grindless:thruster_pod'] }
    ]
    HM.crafting = []
    defs.forEach(function (d) {
      var missing = d.parts.concat([d.machine, d.research], d.domain.map(function (s) { return s.replace(/^\d+x /, '') })).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      d.parts.forEach(function (s, i) { b.itemInputs(i === 0 ? s : '3x ' + s) })
      b.itemInputs('4x #gtceu:circuits/uhv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
      b.itemOutputs(d.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(1966080) })
      b.EUt(1966080).duration(1500)
      HM.crafting.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'mercury ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
