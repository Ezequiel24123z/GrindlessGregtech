// priority: -25824
// -----------------------------------------------------------------------------------------------
// Recipes of UV's propulsion (docs/eras/uv.md, machines 16 and 17; package UV-A11): the cryotank winder, the thruster works and the side
// steps that make their parts (machines and items: startup_scripts/grindless/uv/propulsion.js). VA[ZPM] = 122,880 EU/t, VA[UV] = 491,520.
//
//   cryotank winder (type gtceu:cryotank_winding)
//     1 bnnt_fuel_tank  1 aerogel fuel tank (ZPM, tier 9) + 16 BNNT yarn (machine 13) + 16 carbon nanotube yarn (ZPM's pyrolyser) +
//                       4 hBN dust (the liner) + 1,000 mB epoxy; the Pluto-Kuiper chart (the mission specification) not consumed ->
//                       1 BNNT fuel tank (F1's gcyr:fuel_tank, tier 11: with the elite motor, floor((3 + 11) / 2) = level 7)
//                                                                                                               491,520 x 1,200 t
//                       The resin trim is inert cured epoxy: voided, not emitted.
//   thruster works (type gtceu:thruster_assembly; the programmed circuit picks the step)
//     1 ion_thruster    2 molybdenum grids + 1 LaB6 cathode + 1 printed thruster chamber (machine 15) + 4,000 mB xenon (the qualification
//                       firing) -> 1 gridded ion thruster + 3,600 mB xenon (90 % back; the rest is the propellant loss)  491,520 x 400 t
//     2 hall_thruster   1 BN discharge channel + 4 UV electromagnets + 1 LaB6 cathode + 4,000 mB krypton (the Kuiper row: the
//                       amorphous ice annealer's noble gas mix, split by the cryogenic plant) -> 1 Hall thruster + 3,600 mB krypton
//                                                                                                               491,520 x 400 t
//     3 thruster_pod    1 gridded ion thruster (cruise) + 1 Hall thruster (thrust) + 1 UV circuit (the power processing unit) +
//                       1 propellant tank -> 1 thruster pod                                                    491,520 x 600 t
//     4 ican_rocket_motor  (UHV-A8) 1 ICAN pellet + 1 UHTC nozzle (the spark plasma sinterer) + 2 SiC power modules (the pellet's
//                       ignition pulse) + 1 GEO-assembled stage (the space elevator's GEO lift: the heavy stage the motor is mounted
//                       on) -> 1 ICAN rocket motor (GCYR motor tier 6: with the BNNT tank, level 8)          1,966,080 x 800 t
//     5 oganesson_propellant_pod  (UHV-A8) 1 propellant tank + 1,000 mB oganesson propellant (line 30) -> 1 oganesson propellant pod
//                       (the swarm control station's fuel, UHV-B3)                                              491,520 x 200 t
//   side steps (no new machine)
//     molybdenum grid   laser engraver: 4 molybdenum foil, sapphire lens kept -> 1 grid (the laser-drilled aperture pattern)
//     LaB6 cathode      electric blast furnace (2,500 K): 1 lanthanum dust (EV's extraction cascade) + 6 boron dust + 1,000 mB argon
//                       (the sintering atmosphere) -> 1 lanthanum hexaboride cathode
//     BN channel        forming press: 3 hBN dust + 1 silicon dioxide dust (BN-SiO2, the discharge channel ceramic) -> 1 channel
//     UV electromagnet  assembler (circuit 7): 1 iron rod (soft core) + 16 fine annealed copper wire + 144 mB polybenzimidazole (the
//                       high-temperature insulation) -> 1 electromagnet
//     propellant tank   assembler (circuit 8): 4 titanium plates (the liner) + 8 carbon nanotube yarn (the overwrap) + 1 UV electric pump
//                       (the flow control) + 288 mB epoxy -> 1 propellant tank
//   controllers (crafting grid): UV hull + 2 UV robot arms + UV motor + 4 UV circuits (winder); UV hull + 2 UV robot arms + UV pump +
//     4 UV circuits (works)
//
// Lookup: every recipe of a machine has its own circuit and its own items, so no recipe's keys contain another's (checked at load).
// Published in global.grindless.propulsion: .recipes and .side [{ name, type, recipeId, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut,
// notConsumed, temp, eut, duration }], .crafting, .skipped, .clashes. Item ids starting with # are tags (not checked by Item.exists).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var P = G.propulsion || (G.propulsion = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}
  var ids = P.ids || {}

  var VA_ZPM = 122880
  var VA_UV = 491520
  var VA_LUV = 30720
  var VA_IV = 7680
  var VA_UHV = 1966080
  var TANK = ids.bnntFuelTank || UV.bnntFuelTank || 'grindless:bnnt_fuel_tank'
  var HBN = UV.hbnDust || 'grindless:hbn_dust'
  var YARN = UV.bnntYarn || 'grindless:bnnt_yarn'
  var CNT_YARN = 'grindless:carbon_nanotube_yarn'
  var AEROGEL_TANK = 'grindless:aerogel_fuel_tank'
  var CHART = 'grindless:pluto_kuiper_chart'
  var CHAMBER = 'grindless:printed_thruster_chamber'
  var ION = ids.ionThruster || 'grindless:ion_thruster'
  var HALL = ids.hallThruster || 'grindless:hall_thruster'
  var POD = ids.thrusterPod || 'grindless:thruster_pod'
  var GRID = ids.molybdenumGrid || 'grindless:molybdenum_grid'
  var CATHODE = ids.lab6Cathode || 'grindless:lanthanum_hexaboride_cathode'
  var CHANNEL = ids.bnDischargeChannel || 'grindless:bn_discharge_channel'
  var MAGNET = ids.uvElectromagnet || 'grindless:uv_electromagnet'
  var PROPELLANT_TANK = ids.propellantTank || 'grindless:propellant_tank'
  var PPU = '#gtceu:circuits/uv'
  var EPOXY = 'gtceu:epoxy'
  var XENON = 'gtceu:xenon'
  var KRYPTON = 'gtceu:krypton'
  // UHV-A8's rows: ids of F1 (startup_scripts/grindless/uhv/foundation.js), A5, A7 and A8 (startup_scripts/grindless/uhv/propulsion.js)
  var ICAN_PELLET = 'grindless:ican_pellet'
  var UHTC_NOZZLE = 'grindless:uhtc_nozzle'
  var SIC_MODULE = 'grindless:sic_power_module'
  var GEO_STAGE = 'grindless:geo_assembled_stage'
  var ICAN_MOTOR = 'grindless:ican_rocket_motor'
  var OG_PROPELLANT = 'gtceu:oganesson_propellant'
  var OG_POD = 'grindless:oganesson_propellant_pod'
  // UEV-B1's rows (docs/eras/uev.md B1; motors registered in startup_scripts/grindless/uev/travel.js; F1 parts in uev/foundation.js)
  var VA_UEV = 7864320
  // the Mk2's closed Brayton loop: UEV-A4's wheel (eight coated SX blades on Barnard's rhenium, single-crystal foundry c3, uev.md machine 7)
  var BRAYTON_WHEEL = 'grindless:brayton_turbine_wheel'
  var DFD_MK1 = 'grindless:dfd_mk1_motor'
  var DFD_MK2 = 'grindless:dfd_mk2_motor'
  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(name, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration) {
    return { name: name, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut, fluidsOut: fluidsOut,
      notConsumed: [], temp: null, eut: eut, duration: duration }
  }

  var WINDER = [
    row('bnnt_fuel_tank', 'cryotank_winding', 1, [item(AEROGEL_TANK, 1), item(YARN, 16), item(CNT_YARN, 16), item(HBN, 4)],
      [fluid(EPOXY, 1000)], [item(TANK, 1)], [], VA_UV, 1200)
  ]
  WINDER[0].notConsumed = [CHART]

  var WORKS = [
    row('ion_thruster', 'thruster_assembly', 1, [item(GRID, 2), item(CATHODE, 1), item(CHAMBER, 1)], [fluid(XENON, 4000)],
      [item(ION, 1)], [fluid(XENON, 3600)], VA_UV, 400),
    row('hall_thruster', 'thruster_assembly', 2, [item(CHANNEL, 1), item(MAGNET, 4), item(CATHODE, 1)], [fluid(KRYPTON, 4000)],
      [item(HALL, 1)], [fluid(KRYPTON, 3600)], VA_UV, 400),
    row('thruster_pod', 'thruster_assembly', 3, [item(ION, 1), item(HALL, 1), item(PPU, 1), item(PROPELLANT_TANK, 1)], [],
      [item(POD, 1)], [], VA_UV, 600),
    row('ican_rocket_motor', 'thruster_assembly', 4, [item(ICAN_PELLET, 1), item(UHTC_NOZZLE, 1), item(SIC_MODULE, 2), item(GEO_STAGE, 1)],
      [], [item(ICAN_MOTOR, 1)], [], VA_UHV, 800),
    row('oganesson_propellant_pod', 'thruster_assembly', 5, [item(PROPELLANT_TANK, 1)], [fluid(OG_PROPELLANT, 1000)], [item(OG_POD, 1)], [],
      VA_UV, 200),
    // circuits 6 and 7 are free on thruster_assembly (1-5 above; no other script uses this type)
    // Mk1 is made at home (its UEV emitter is the drive's RF heating antenna); the UEV motor needs Barnard's Fe16N2,
    // so it goes into the Mk2 with the Barnard magnets (uev.md:216, :1556), not into the Mk1 that flies to Barnard.
    row('dfd_mk1_motor', 'thruster_assembly', 6, [item('grindless:wf_w_tile', 4), item('grindless:sic_sic_plate', 4),
      item('gtceu:hftacn_ingot', 8), item('grindless:uev_emitter', 1)], [fluid('gtceu:dhe3_fuel_mix', 4000)],
      [item(DFD_MK1, 1)], [], VA_UEV, 1000),
    row('dfd_mk2_motor', 'thruster_assembly', 7, [item(DFD_MK1, 1), item(BRAYTON_WHEEL, 1), item('grindless:bonded_fe16n2_magnet', 8),
      item('gtceu:hftacn_ingot', 8), item('grindless:uev_electric_motor', 1)], [], [item(DFD_MK2, 1)], [], VA_UEV, 1200)
  ]

  var SIDE = [
    row('molybdenum_grid', 'laser_engraver', null, [item('gtceu:molybdenum_foil', 4)], [], [item(GRID, 1)], [], VA_IV, 400),
    row('lanthanum_hexaboride_cathode', 'electric_blast_furnace', null, [item('gtceu:lanthanum_dust', 1), item('gtceu:boron_dust', 6)],
      [fluid('gtceu:argon', 1000)], [item(CATHODE, 1)], [], VA_IV, 600),
    row('bn_discharge_channel', 'forming_press', null, [item(HBN, 3), item('gtceu:silicon_dioxide_dust', 1)], [], [item(CHANNEL, 1)], [],
      VA_IV, 300),
    row('uv_electromagnet', 'assembler', 7, [item('gtceu:iron_rod', 1), item('gtceu:fine_annealed_copper_wire', 16)],
      [fluid('gtceu:polybenzimidazole', 144)], [item(MAGNET, 1)], [], VA_LUV, 200),
    row('propellant_tank', 'assembler', 8, [item('gtceu:titanium_plate', 4), item(CNT_YARN, 8), item('gtceu:uv_electric_pump', 1)],
      [fluid(EPOXY, 288)], [item(PROPELLANT_TANK, 1)], [], VA_ZPM, 400)
  ]
  SIDE[0].notConsumed = ['gtceu:sapphire_lens']
  SIDE[1].temp = 2500

  function publish(r) {
    return {
      name: r.name, type: r.type, recipeId: 'grindless:' + r.type + '/' + r.name, circuit: r.circuit, itemsIn: r.itemsIn, fluidsIn: r.fluidsIn,
      itemsOut: r.itemsOut, fluidsOut: r.fluidsOut, notConsumed: r.notConsumed, temp: r.temp, eut: r.eut, duration: r.duration
    }
  }

  P.recipes = WINDER.concat(WORKS).map(publish)
  P.side = SIDE.map(publish)
  P.skipped = []
  P.clashes = []
  P.crafting = {
    winder: 'grindless:crafting/cryotank_winder',
    works: 'grindless:crafting/thruster_works'
  }
  P.craftingParts = ['gtceu:uv_machine_hull', 'gtceu:uv_robot_arm', 'gtceu:uv_electric_motor', 'gtceu:uv_electric_pump']

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.notConsumed.forEach(function (id) { keys['i:' + id] = true })
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
    items.forEach(function (id) {
      if (id.charAt(0) === '#') return
      if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id)
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
    r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.temp !== null) recipe.blastFurnaceTemp(r.temp)
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addMachines(event) {
    P.clashes = clashesOf(P.recipes)
    if (P.clashes.length > 0) console.error(LOG + 'propulsion recipes clash in the lookup: ' + P.clashes.join(', '))
    P.recipes.forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'propulsion recipes added: ' + (P.recipes.length - P.skipped.length))
  }

  function addSide(event) {
    P.side.forEach(function (r) { addRecipe(event, r) })
  }

  function addCrafting(event) {
    var missing = P.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'propulsion controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped(P.winder || 'gtceu:cryotank_winder', ['CRC', 'RHM', 'C C'], {
      C: '#gtceu:circuits/uv', R: 'gtceu:uv_robot_arm', M: 'gtceu:uv_electric_motor', H: 'gtceu:uv_machine_hull'
    }).id(P.crafting.winder)
    event.recipes.gtceu.shaped(P.works || 'gtceu:thruster_works', ['RCR', 'PHC', 'C C'], {
      C: '#gtceu:circuits/uv', R: 'gtceu:uv_robot_arm', P: 'gtceu:uv_electric_pump', H: 'gtceu:uv_machine_hull'
    }).id(P.crafting.works)
  }

  ServerEvents.recipes(function (event) {
    try { addMachines(event) } catch (e) { console.error(LOG + 'propulsion recipes failed: ' + e) }
    try { addSide(event) } catch (e2) { console.error(LOG + 'propulsion side recipes failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'propulsion crafting failed: ' + e3) }
  })
})()
