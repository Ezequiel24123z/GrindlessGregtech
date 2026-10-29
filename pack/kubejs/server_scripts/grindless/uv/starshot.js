// priority: -25924
// -----------------------------------------------------------------------------------------------
// Recipes of UV's Starshot (docs/eras/uv.md, machines 18, 21 and 23, line 20; package UV-A12): the light sail fab, the starchip fab and
// the laser sail launcher (machines: startup_scripts/grindless/uv/starshot.js), plus the GTM rows that feed the light sail line.
// VA[IV] = 7,680, VA[LuV] = 30,720, VA[ZPM] = 122,880, VA[UV] = 491,520 EU/t. GTM's units: 1,000 mB per H, F or Xe atom; a compound's
// dust counts its atoms (MgCl2 = 3 dusts, SiO2 = 3 dusts).
//
//   light sail fab (type gtceu:light_sail; Earth orbit only: .dimension(G.orbits.earth); the circuit picks the step)
//     1 film      1 epitaxial silicon wafer + 300 mB silane + 400 mB ammonia -> 1 nitride-coated carrier + 2,400 mB hydrogen
//                 (3 SiH4 + 4 NH3 -> Si3N4 + 12 H2, a 100 nm film)                                              122,880 x 600 t
//     2 pattern   1 coated carrier + 1 hBN dust + the X-ray mask (UV-A5's, the metasurface mask; not consumed) -> 1 patterned
//                 carrier (the hBN-backed metasurface)                                                           491,520 x 800 t
//     3 release   1 patterned carrier + 500 mB xenon difluoride -> 1 light sail + 250 mB silicon tetrafluoride + 500 mB xenon (XeF2
//                 etches the silicon away from under the film: Si + 2 XeF2 -> SiF4 + 2 Xe; too thin to survive gravity and air)
//                                                                                                                122,880 x 400 t
//     4 film      (UHV-B3) 1 aluminium ingot -> 4 aluminium reflector film (free-standing film rolled thin enough only in
//                 weightlessness, Drexler's thin-film sail: the swarm segment's mirror)                          122,880 x 200 t
//   starchip fab (type gtceu:starchip; Earth)
//     1 chip      1 photonic chip (UV-A5) + 1 NV diamond chip (ZPM's ion implanter) + 1 americium micro source (UV-A2) + 1 neutronium
//                 wafer (GTM's UV wafer) -> 1 starchip + 1 silicon dust (the kerf)                               491,520 x 1,600 t
//     2 sail-chip 1 starchip + 1 light sail -> 1 sail-chip                                                       491,520 x 400 t
//   laser sail launcher (type gtceu:laser_sail_launch; the Moon only: .dimension('gcyr:luna'))
//     1 launch    1 sail-chip + the heliopause data (UV-B5, not consumed: the interstellar medium's density sets the trajectory)
//                 -> 1 Starshot probe in flight; the 64 laser module blocks of the array each wear 1 % a launch: one fibre laser
//                 module from the input bus is spent at 64 % and comes out as a spent laser module (same chance). 16 A of UV
//                 (16 x 491,520 EU/t) for 200 t, the era's largest draw. The probe's only reader is UV-A7's optical ground station.
//   GTM rows that feed the line
//     wake_epitaxy c4   (LuV wake shield facility, any orbit, cleanroom) 1 silicon wafer + 250 mB silane -> 1 epitaxial silicon wafer
//                                                                                                                 30,720 x 400 t
//     chemical_reactor  2 magnesium dust + 1 silicon dust + 4,000 mB hydrochloric acid -> 1,000 mB silane + 6 magnesium chloride dust
//                       (Mg2Si + 4 HCl -> SiH4 + 2 MgCl2)                                                          7,680 x 300 t
//     chemical_reactor  1,000 mB xenon + 2,000 mB fluorine -> 1,000 mB xenon difluoride                            7,680 x 200 t
//     chemical_reactor  1,000 mB silicon tetrafluoride + 2,000 mB water -> 3 silicon dioxide dust + 4,000 mB hydrofluoric acid
//                       (SiF4 + 2 H2O -> SiO2 + 4 HF)                                                              1,920 x 200 t
//   controllers (assembly lines, station research, UV hull + parts + 4 UV circuits + 3 line items, soldering alloy, lubricant,
//   tritanium): light sail fab, starchip fab, laser sail launcher
//
// Destinations (rule 3 of AGENTS.md):
//   hydrogen (film)                  -> the station's fuel and GTM's chemistry (ammonia: the film's other gas)
//   xenon (release)                  -> back to xenon difluoride (the chemical reactor row above)
//   silicon tetrafluoride (release)  -> hydrolysed above; its hydrofluoric acid goes to IV's hot cell (Si-28 mode) or GTM's chemistry
//   silicon dioxide dust             -> GTM's glass and electrolyser
//   magnesium chloride dust          -> GTM's electrolyser (magnesium back to the silane row, chlorine to HCl)
//   silicon dust (kerf)              -> GTM's silicon (the silane row or the wafer line)
//   spent laser module (launch)      -> UV-A6's fibre draw tower circuit 4 (refurbished)
//
// Lookup: every recipe of a type has its own circuit (checked at load); the GTM rows have inputs no other row of their type is a subset
// of. Ids not registered skip their row with a console error. Published in global.grindless.starshot: .recipes [{ name, type, recipeId,
// circuit, itemsIn, kept, chancedIn, fluidsIn, itemsOut, chancedOut, fluidsOut, eut, amps, duration, site, cleanroom }], .crafting,
// .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var S = G.starshot || (G.starshot = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}

  var EV = 1920
  var IV = 7680
  var LUV = 30720
  var ZPM = 122880
  var UVA = 491520

  var ORBIT = G.orbits ? G.orbits.earth : 'gcyr:overworld_orbit'
  var MOON = 'gcyr:luna'
  var CleanroomType = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType')

  var SAIL = UV.lightSail || 'grindless:light_sail'
  var STARCHIP = UV.starchip || 'grindless:starchip'
  var SAILCRAFT = UV.sailcraft || 'grindless:sailcraft'
  var PROBE = UV.starshotProbe || 'grindless:starshot_probe'
  var HELIOPAUSE = UV.heliopauseData || 'grindless:heliopause_data'
  var HBN = UV.hbnDust || 'grindless:hbn_dust'
  var MODULE = UV.fibreLaserModule || 'grindless:fibre_laser_module'
  var FILM = (G.uhvFoundation && G.uhvFoundation.ids && G.uhvFoundation.ids.aluminiumReflectorFilm) || 'grindless:aluminium_reflector_film'
  var SPENT = 'grindless:spent_laser_module'
  var PHOTONIC = 'grindless:photonic_chip'
  var MASK = 'grindless:x_ray_mask'
  var NV = 'grindless:nv_diamond_chip'
  var AM = 'grindless:americium_micro_source'
  var MOUNT = 'grindless:printed_array_mount'
  var UV_WAFER = 'gtceu:neutronium_wafer'
  // UIV-B1
  var PELLET = 'grindless:degenerate_pellet'
  var CELL = 'grindless:exotic_matter_cell'
  var RAD_HARD = 'grindless:rad_hard_controller'
  var RELAY_SEED = 'grindless:relay_seed'
  var LAUNCHED_SEED = 'grindless:launched_relay_seed'
  var ERGO_PROBE = 'grindless:ergosphere_probe'

  var EPI = 'grindless:epitaxial_silicon_wafer'
  var COATED = 'grindless:nitride_coated_carrier'
  var PATTERNED = 'grindless:patterned_sail_carrier'
  var SILANE = 'gtceu:silane'
  var XEF2 = 'gtceu:xenon_difluoride'
  var SIF4 = 'gtceu:silicon_tetrafluoride'

  // the launch: each of the 64 module blocks wears 1 %, so one module from the bus is spent at 64 % (out of 10,000)
  S.wearChance = 6400
  S.launchAmps = 16

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function chanced(id, count, chance) { return { id: id, count: count, chance: chance } }

  function row(t) {
    return {
      name: t.name, type: t.type, recipeId: 'grindless:' + t.type + '/' + t.name, circuit: t.circuit === undefined ? null : t.circuit,
      itemsIn: t.itemsIn || [], kept: t.kept || null, chancedIn: t.chancedIn || [], fluidsIn: t.fluidsIn || [],
      itemsOut: t.itemsOut || [], chancedOut: t.chancedOut || [], fluidsOut: t.fluidsOut || [],
      eut: t.eut, amps: t.amps || 1, duration: t.duration, site: t.site || null, cleanroom: t.cleanroom === true
    }
  }

  S.recipes = [
    { name: 'nitride_film', type: 'light_sail', circuit: 1, site: 'earth_orbit', itemsIn: [item(EPI, 1)],
      fluidsIn: [fluid(SILANE, 300), fluid('gtceu:ammonia', 400)], itemsOut: [item(COATED, 1)],
      fluidsOut: [fluid('gtceu:hydrogen', 2400)], eut: ZPM, duration: 600 },
    { name: 'metasurface', type: 'light_sail', circuit: 2, site: 'earth_orbit', itemsIn: [item(COATED, 1), item(HBN, 1)], kept: MASK,
      itemsOut: [item(PATTERNED, 1)], eut: UVA, duration: 800 },
    { name: 'sail_release', type: 'light_sail', circuit: 3, site: 'earth_orbit', itemsIn: [item(PATTERNED, 1)],
      fluidsIn: [fluid(XEF2, 500)], itemsOut: [item(SAIL, 1)], fluidsOut: [fluid(SIF4, 250), fluid('gtceu:xenon', 500)],
      eut: ZPM, duration: 400 },
    { name: 'aluminium_reflector_film', type: 'light_sail', circuit: 4, site: 'earth_orbit', itemsIn: [item('gtceu:aluminium_ingot', 1)],
      itemsOut: [item(FILM, 4)], eut: ZPM, duration: 200 },
    { name: 'starchip', type: 'starchip', circuit: 1,
      itemsIn: [item(PHOTONIC, 1), item(NV, 1), item(AM, 1), item(UV_WAFER, 1)],
      itemsOut: [item(STARCHIP, 1), item('gtceu:silicon_dust', 1)], eut: UVA, duration: 1600 },
    { name: 'sailcraft', type: 'starchip', circuit: 2, itemsIn: [item(STARCHIP, 1), item(SAIL, 1)], itemsOut: [item(SAILCRAFT, 1)],
      eut: UVA, duration: 400 },
    { name: 'starshot_probe', type: 'laser_sail_launch', circuit: 1, site: MOON, itemsIn: [item(SAILCRAFT, 1)], kept: HELIOPAUSE,
      chancedIn: [chanced(MODULE, 1, S.wearChance)], itemsOut: [item(PROBE, 1)], chancedOut: [chanced(SPENT, 1, S.wearChance)],
      eut: UVA, amps: S.launchAmps, duration: 200 },
    { name: 'epitaxial_silicon_wafer', type: 'wake_epitaxy', circuit: 4, site: 'orbits', cleanroom: true,
      itemsIn: [item('gtceu:silicon_wafer', 1)], fluidsIn: [fluid(SILANE, 250)], itemsOut: [item(EPI, 1)], eut: LUV, duration: 400 },
    { name: 'silane', type: 'chemical_reactor', itemsIn: [item('gtceu:magnesium_dust', 2), item('gtceu:silicon_dust', 1)],
      fluidsIn: [fluid('gtceu:hydrochloric_acid', 4000)], itemsOut: [item('gtceu:magnesium_chloride_dust', 6)],
      fluidsOut: [fluid(SILANE, 1000)], eut: IV, duration: 300 },
    { name: 'xenon_difluoride', type: 'chemical_reactor', fluidsIn: [fluid('gtceu:xenon', 1000), fluid('gtceu:fluorine', 2000)],
      fluidsOut: [fluid(XEF2, 1000)], eut: IV, duration: 200 },
    { name: 'silicon_tetrafluoride_hydrolysis', type: 'chemical_reactor',
      fluidsIn: [fluid(SIF4, 1000), fluid('minecraft:water', 2000)], itemsOut: [item('gtceu:silicon_dioxide_dust', 3)],
      fluidsOut: [fluid('gtceu:hydrofluoric_acid', 4000)], eut: EV, duration: 200 },
    // UIV-B1 (docs/eras/uiv.md "B1. Travel"; items: startup_scripts/grindless/uiv/travel.js): the relay seed (starchip c3), the ergosphere
    // probe (starchip c4) and the launch of the seed from the Moon (laser_sail_launch c2), its module wearing as the probe's does
    { name: 'relay_seed', type: 'starchip', circuit: 3, itemsIn: [item(STARCHIP, 1), item(PELLET, 1), item(CELL, 1)],
      itemsOut: [item(RELAY_SEED, 1)], eut: UVA, duration: 800 },
    { name: 'ergosphere_probe', type: 'starchip', circuit: 4, itemsIn: [item(STARCHIP, 1), item(RAD_HARD, 1)],
      itemsOut: [item(ERGO_PROBE, 1)], eut: UVA, duration: 800 },
    { name: 'relay_seed_launch', type: 'laser_sail_launch', circuit: 2, site: MOON, itemsIn: [item(RELAY_SEED, 1)],
      chancedIn: [chanced(MODULE, 1, S.wearChance)], itemsOut: [item(LAUNCHED_SEED, 1)], chancedOut: [chanced(SPENT, 1, S.wearChance)],
      eut: UVA, amps: S.launchAmps, duration: 200 }
  ].map(row)
  S.skipped = []
  S.clashes = []
  S.crafting = { sailFab: 'grindless:assembly_line/light_sail_fab', chipFab: 'grindless:assembly_line/starchip_fab',
    launcher: 'grindless:assembly_line/laser_sail_launcher' }
  S.craftingParts = ['gtceu:uv_machine_hull', 'gtceu:uv_robot_arm', 'gtceu:uv_emitter', MOUNT]

  function keysOf(r) {
    var keys = {}
    r.itemsIn.concat(r.chancedIn).forEach(function (x) { keys['i:' + x.id] = true })
    r.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    if (r.circuit !== null) keys['circuit:' + r.circuit] = true
    if (r.kept) keys['i:' + r.kept] = true
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
    var items = r.itemsIn.concat(r.chancedIn, r.itemsOut, r.chancedOut)
    if (r.kept) items = items.concat([item(r.kept, 0)])
    items.forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRecipe(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      S.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'starshot recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (r.kept) recipe.notConsumable(r.kept)
    r.chancedIn.forEach(function (x) { recipe.chancedInput(x.count + 'x ' + x.id, x.chance, 0) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.chancedOut.forEach(function (x) { recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    // GTM 7.5.3's EUt(voltage, amperage): the launch is a UV recipe drawing 16 A, not a UEV one
    if (r.amps > 1) recipe.EUt(r.eut, r.amps)
    else recipe.EUt(r.eut)
    recipe.duration(r.duration)
    if (r.site === 'earth_orbit') recipe.dimension(ORBIT)
    else if (r.site === 'orbits') G.orbits.allow(recipe)
    else if (r.site) recipe.dimension(r.site)
    if (r.cleanroom) recipe.cleanroom(CleanroomType.CLEANROOM)
  }

  function addMachines(event) {
    S.clashes = clashesOf(S.recipes)
    if (S.clashes.length > 0) console.error(LOG + 'starshot recipes clash in the lookup: ' + S.clashes.join(', '))
    S.recipes.forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'starshot recipes added: ' + (S.recipes.length - S.skipped.length))
  }

  function addCrafting(event) {
    var missing = S.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'starshot controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var fabs = [
      { id: 'gtceu:light_sail_fab', recipe: 'light_sail_fab', research: EPI,
        parts: ['gtceu:uv_machine_hull', '2x gtceu:uv_robot_arm', '2x gtceu:uv_emitter'],
        domain: ['4x ' + MASK, '4x ' + EPI, '4x ' + MOUNT] },
      { id: 'gtceu:starchip_fab', recipe: 'starchip_fab', research: MASK,
        parts: ['gtceu:uv_machine_hull', '4x gtceu:uv_robot_arm', '2x gtceu:uv_sensor'],
        domain: ['4x ' + MASK, '4x ' + COATED, '4x ' + MOUNT] },
      { id: 'gtceu:laser_sail_launcher', recipe: 'laser_sail_launcher', research: NV,
        parts: ['gtceu:uv_machine_hull', '4x gtceu:uv_emitter', '2x gtceu:uv_field_generator'],
        domain: ['4x ' + MOUNT, '2x ' + SAIL, '2x ' + PHOTONIC] }
    ]
    fabs.forEach(function (m) {
      var ids = [m.id, m.research].concat(m.parts, m.domain).map(function (s) { return s.replace(/^\d+x /, '') })
      var absent = ids.filter(function (id) { return !Item.exists(id) })
      if (absent.length > 0) {
        console.error(LOG + 'starshot controller recipe of ' + m.id + ' skipped, unknown item(s): ' + absent.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + m.recipe)
      m.parts.forEach(function (s) { b.itemInputs(s) })
      b.itemInputs('4x #gtceu:circuits/uv')
      m.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000), Fluid.of('gtceu:tritanium', 576))
      b.itemOutputs(m.id)
      b.stationResearch(function (r) { return r.researchStack(Item.of(m.research)).CWUt(64).EUt(491520) })
      b.EUt(491520).duration(1200)
    })
  }

  ServerEvents.recipes(function (event) {
    try { addMachines(event) } catch (e) { console.error(LOG + 'starshot recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'starshot crafting failed: ' + e2) }
  })
})()
