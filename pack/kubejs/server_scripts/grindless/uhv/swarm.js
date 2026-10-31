// priority: -24124
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's Dyson swarm (machines, types and items: startup_scripts/grindless/uhv/swarm.js; docs/eras/uhv.md, machines 22, 23
// and 24, lines 23 and 30; package UHV-B3). Every recipe of the three machines carries .dimension('gcyr:mercury_orbit'): they are station
// modules in Mercury's orbit. VA[ZPM] = 122,880, VA[UV] = 491,520 EU/t; V[UHV] = 2,097,152 EU/t.
//
//   swarm segment foundry (type gtceu:swarm_segment; the circuit picks the step)
//     1 segment     4 aluminium reflector film + 2 IMM solar arrays + 1 ytterbium fibre laser module + 1 C-12 diamond spreader + 1 SiC
//                   power module + 2 betavoltaic cells + 1 sodium-potassium heat pipe -> 1 swarm segment        491,520 x 600 t
//     2 refurbish   1 worn swarm segment + 1 aluminium reflector film + 1 IMM solar array -> 1 swarm segment + 1 small aluminium dust
//                   (the stripped film: back to aluminium)                                                      122,880 x 300 t
//   swarm control station (type gtceu:dyson_swarm, a GENERATOR written at its final figure: one run at a time, never doubled, not in
//   power/generators.js's list; .EUt(-x) is the EU/t it makes)
//     1 formation   15 swarm segments (kept) + 1 swarm segment + 1 oganesson propellant pod -> 1 worn swarm segment + 1 propellant
//                   tank (the pod is the station-keeping fuel, line 30)                 2,097,152 EU/t (1 A UHV) x 6,000 t
//     1 krypton     15 swarm segments (kept) + 1 swarm segment + 1,000 mB krypton (the cryogenic plant's oganesson byproduct, an ion
//                   thruster's propellant) -> 1 worn swarm segment (the poorer fuel: half the run)   2,097,152 EU/t x 3,000 t
//     2 full_swarm  60 swarm segments (kept) + 4 swarm segments + 1 coronal field map (kept: the station steers the swarm round the Sun's
//                   storms) + 4 oganesson propellant pods -> 4 worn swarm segments + 4 propellant tanks
//                   8,388,608 EU/t (4 A UHV) x 6,000 t
//                   So 16 or 64 segments fly in each run and 1 or 4 of them wear out (as do 1 or 4 pods): both make 12,582,912,000 EU
//                   per worn segment; a c2 station wears 48 segments an hour.
//   solar probe bay (type gtceu:solar_probe)
//     1 corona      1 solar probe + the heliopause data (UV-B5's, kept: the solar wind's boundary calibrates the field model) -> 1 coronal
//                   field map. The probe burns up in the corona: nothing returns.                              491,520 x 400 t
//     2 probe       1 carbon-carbon aeroshell (HV's composite autoclave) + 4 UHTC tiles + 1 SiC power module + 2 betavoltaic cells +
//                   1 HPGe crystal + 1 UV sensor (the HPGe detector, as UV's precursor probes build it) -> 1 solar probe
//                                                                                                               491,520 x 800 t
//   side steps (GTM machines, no new one)
//     assembler     1 tungsten steel small fluid pipe + 2 molybdenum foil (the wick) + 250 mB sodium-potassium (B2's vapour furnace)
//                   -> 1 sodium-potassium heat pipe                                                             122,880 x 200 t
//   byproducts: worn segments -> the foundry's c2 (kept); small aluminium dust -> GTM's aluminium -> the light sail fab's film row
//   (uv/starshot.js circuit 4); the burnt probe: nothing returns (voidable); propellant tanks -> the thruster works' pod row (refilled).
//   controllers (crafting grid): UHV hull + 2 UV robot arms + 2 UHV circuits (foundry); UHV hull + 2 UV field generators + 2 UHV circuits
//   (station); UHV hull + 2 UV sensors + 2 UHV circuits (bay)
//
// Lookup: every recipe of a type has its own circuit or fluid, so no recipe's keys contain another's (checked at load).
// Published in global.grindless.uhvSwarm: .recipes [{ name, type, recipeId, circuit, itemsIn, kept, fluidsIn, itemsOut, fluidsOut, site,
// generator, eut, duration }], .skipped, .clashes, .crafting.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var SW = G.uhvSwarm || (G.uhvSwarm = {})
  var IDS = SW.ids || {}
  var F1 = (G.uhvFoundation && G.uhvFoundation.ids) || {}
  var UV = (G.uvFoundation && G.uvFoundation.ids) || {}
  var SITE = SW.site || 'gcyr:mercury_orbit'

  var ZPM = 122880
  var UVA = 491520
  var UHV_A = 2097152

  var SEGMENT = IDS.segment || 'grindless:swarm_segment'
  var WORN = IDS.worn || 'grindless:worn_swarm_segment'
  var MAP = IDS.map || 'grindless:coronal_field_map'
  var FILM = IDS.film || 'grindless:aluminium_reflector_film'
  var HEAT_PIPE = IDS.heatPipe || 'grindless:sodium_potassium_heat_pipe'
  var PROBE = IDS.probe || 'grindless:solar_probe'
  var IMM = F1.immSolarArray || 'grindless:imm_solar_array'
  var SPREADER = F1.c12DiamondSpreader || 'grindless:c12_diamond_spreader'
  var SIC = F1.sicPowerModule || 'grindless:sic_power_module'
  var BETAVOLTAIC = F1.betavoltaicCell || 'grindless:betavoltaic_cell'
  var UHTC = F1.uhtcTile || 'grindless:uhtc_tile'
  var LASER = UV.fibreLaserModule || 'grindless:fibre_laser_module'
  var HELIOPAUSE = UV.heliopauseData || 'grindless:heliopause_data'
  var HPGE = UV.hpgeCrystal || 'grindless:hpge_crystal'
  var AEROSHELL = UV.carbonCarbonAeroshell || 'grindless:carbon_carbon_aeroshell'
  var POD = IDS.pod || 'grindless:oganesson_propellant_pod'
  var TANK = IDS.tank || 'grindless:propellant_tank'
  var FOUNDRY = 'swarm_segment'
  var STATION = 'dyson_swarm'
  var BAY = 'solar_probe'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(name, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration, extra) {
    var r = { name: name, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut, fluidsOut: fluidsOut,
      kept: [], site: null, generator: false, eut: eut, duration: duration }
    Object.keys(extra || {}).forEach(function (k) { r[k] = extra[k] })
    return r
  }
  // UEV-B2: Alpha Centauri A's orbit is a second site (the list of sites is widened, Mercury's rows keep SITE)
  var ALPHA_SITE = 'grindless:alpha_centauri_orbit'
  var ALPHA_MAP = 'grindless:alpha_coronal_field_map'
  var HERE = { site: SITE }
  function gen(kept) { return { site: SITE, generator: true, kept: kept } }

  var ROWS = [
    row('segment', FOUNDRY, 1,
      [item(FILM, 4), item(IMM, 2), item(LASER, 1), item(SPREADER, 1), item(SIC, 1), item(BETAVOLTAIC, 2), item(HEAT_PIPE, 1)], [],
      [item(SEGMENT, 1)], [], UVA, 600, HERE),
    row('refurbish', FOUNDRY, 2, [item(WORN, 1), item(FILM, 1), item(IMM, 1)], [],
      [item(SEGMENT, 1), item('gtceu:small_aluminium_dust', 1)], [], ZPM, 300, HERE),
    row('formation', STATION, 1, [item(SEGMENT, 1), item(POD, 1)], [], [item(WORN, 1), item(TANK, 1)], [], UHV_A, 6000,
      gen([item(SEGMENT, 15)])),
    row('formation_krypton', STATION, 1, [item(SEGMENT, 1)], [fluid('gtceu:krypton', 1000)], [item(WORN, 1)], [], UHV_A, 3000,
      gen([item(SEGMENT, 15)])),
    row('full_swarm', STATION, 2, [item(SEGMENT, 4), item(POD, 4)], [], [item(WORN, 4), item(TANK, 4)], [], 4 * UHV_A, 6000,
      gen([item(SEGMENT, 60), item(MAP, 1)])),
    // UEV-B2: Alpha Centauri A (1.52 solar luminosities), 6 segments and 6 pods a run: the same 12,582,912,000 EU per worn segment
    row('alpha_full_swarm', STATION, 3, [item(SEGMENT, 6), item(POD, 6)], [], [item(WORN, 6), item(TANK, 6)], [], 12582912, 6000,
      { site: ALPHA_SITE, generator: true, kept: [item(SEGMENT, 60), item(ALPHA_MAP, 1)] }),
    row('corona', BAY, 1, [item(PROBE, 1)], [], [item(MAP, 1)], [], UVA, 400, { site: SITE, kept: [item(HELIOPAUSE, 1)] }),
    // UEV-B2: the Mercury map is the reference the Alpha probe is calibrated against (kept); the heliopause data is kept too
    row('alpha_corona', BAY, 3, [item(PROBE, 1)], [], [item(ALPHA_MAP, 1)], [], UVA, 400,
      { site: ALPHA_SITE, kept: [item(MAP, 1), item(HELIOPAUSE, 1)] }),
    row('probe', BAY, 2,
      [item(AEROSHELL, 1), item(UHTC, 4), item(SIC, 1), item(BETAVOLTAIC, 2), item(HPGE, 1), item('gtceu:uv_sensor', 1)], [],
      [item(PROBE, 1)], [], UVA, 800, HERE),
    row('sodium_potassium_heat_pipe', 'assembler', null, [item('gtceu:tungsten_steel_small_fluid_pipe', 1), item('gtceu:molybdenum_foil', 2), item('grindless:silica_aerogel', 1), item('grindless:mu_metal_shield', 1)],
      [fluid('gtceu:sodium_potassium', 250), fluid('gtceu:lubricant', 250)], [item(HEAT_PIPE, 1)], [], ZPM, 200)
  ]

  // UIV-A10 (uiv.md, Matrioshka computer): the Mercury swarm's feed run that carries the two UIV works (31,457,280 EU/t each); 16 x 2,097,152 =
  // 33,554,432 EU/t covers one Matrioshka computer plus part of a droplet radiator works. Circuit 4 (1-3 are taken)
  ROWS.push(row('matrioshka_feed', STATION, 4, [item(SEGMENT, 16), item(POD, 16)], [], [item(WORN, 16), item(TANK, 16)], [], 16 * UHV_A, 6000,
    gen([item(SEGMENT, 60), item(MAP, 1)])))

  // MAX-G1 (docs/eras/max.md, machine 8 and line 13): one mirror shell segment, the block the mirror shell is built from. Built at Sgr A*,
  // where the shell droplet radiator is made; circuit 5 (1-4 are taken); VA[MAX] = 2,013,265,920 EU/t
  ROWS.push(row('mirror_shell_segment', FOUNDRY, 5,
    [item('grindless:segment_truss', 1), item('grindless:superconducting_membrane', 1), item('grindless:albedo_multilayer_panel', 1),
      item('grindless:shell_droplet_radiator', 1), item('grindless:shell_cryocooler', 1), item('grindless:segment_controller', 1),
      item('grindless:halbach_segment_coupler', 1), item('#gtceu:circuits/uhv', 1), item('gtceu:uhv_sensor', 2)], [],
    [item('grindless:mirror_shell_segment', 1)], [], 2013265920, 1200, { site: 'gcyr:black_hole_orbit' }))

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.concat(r.itemsOut).concat(r.kept).map(function (x) { return x.id })
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(r) {
    var def = null
    Object.keys(SW.machines || {}).forEach(function (k) { if (SW.machines[k].type === r.type) def = SW.machines[k] })
    if (def === null) return null
    var io = def.maxIO
    var itemsIn = r.itemsIn.length + r.kept.length + (r.circuit !== null ? 1 : 0)
    if (itemsIn > io.itemsIn) return itemsIn + ' item inputs (the type holds ' + io.itemsIn + ')'
    if (r.itemsOut.length > io.itemsOut) return r.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (r.fluidsIn.length > io.fluidsIn) return r.fluidsIn.length + ' fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (r.fluidsOut.length > io.fluidsOut) return r.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function addRecipe(event, r) {
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.site !== null) recipe.dimension(r.site)
    // a generator recipe carries its EU as an output (lib/generators.js)
    recipe.EUt(r.generator ? -r.eut : r.eut).duration(r.duration)
  }

  function keysOf(r) {
    var keys = {}
    r.itemsIn.concat(r.kept).forEach(function (x) { keys['i:' + x.id] = true })
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
    SW.recipes = []
    SW.skipped = []
    ROWS.forEach(function (r) {
      var label = r.type + '/' + r.name
      var missing = missingIds(r)
      if (missing.length > 0) {
        SW.skipped.push({ name: label, reason: 'unknown id(s): ' + missing.join(', ') })
        console.error(LOG + 'swarm skipped ' + label + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var tooBig = sizeProblem(r)
      if (tooBig !== null) {
        SW.skipped.push({ name: label, reason: tooBig })
        console.error(LOG + 'swarm skipped ' + label + ': ' + tooBig)
        return
      }
      try {
        addRecipe(event, r)
      } catch (e) {
        SW.skipped.push({ name: label, reason: 'the builder failed: ' + e })
        console.error(LOG + 'swarm skipped ' + label + ': the builder failed: ' + e)
        return
      }
      r.recipeId = 'grindless:' + r.type + '/' + r.name
      SW.recipes.push(r)
    })
    SW.clashes = clashesOf(SW.recipes)
    if (SW.clashes.length > 0) console.error(LOG + 'swarm: recipes whose ingredients are a subset of another\'s: ' + SW.clashes.join('; '))
    console.info(LOG + 'swarm: ' + SW.recipes.length + ' recipes; skipped ' + SW.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var ARM = 'gtceu:uhv_robot_arm'
    var FIELD = 'gtceu:uhv_field_generator'
    var SENSOR = 'gtceu:uhv_sensor'
    var CONVEYOR = 'gtceu:uhv_conveyor_module'
    var PISTON = 'gtceu:uhv_electric_piston'
    var EMITTER = 'gtceu:uhv_emitter'
    var MOTOR = 'gtceu:uhv_electric_motor'
    var C = '#gtceu:circuits/uhv'
    var M = SW.machines || {}
    var defs = [
      { machine: (M.foundry && M.foundry.machine) || 'gtceu:swarm_segment_foundry', name: 'swarm_segment_foundry', parts: [HULL, ARM, CONVEYOR, PISTON], research: 'grindless:sodium_potassium_heat_pipe', domain: ['4x grindless:propellant_tank', '2x grindless:thruster_pod', '2x grindless:silica_aerogel'] },
      { machine: (M.station && M.station.machine) || 'gtceu:swarm_control_station', name: 'swarm_control_station', parts: [HULL, FIELD, EMITTER, SENSOR], research: 'grindless:uv_electromagnet', domain: ['2x grindless:srf_cryomodule', '4x grindless:fibre_laser_module', '2x grindless:nbn_coated_sic_plate'] },
      { machine: (M.bay && M.bay.machine) || 'gtceu:solar_probe_bay', name: 'solar_probe_bay', parts: [HULL, SENSOR, EMITTER, MOTOR], research: 'grindless:thruster_pod', domain: ['2x grindless:sodium_potassium_heat_pipe', '4x grindless:mu_metal_shield', '2x grindless:propellant_tank'] }
    ]
    SW.crafting = []
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
      SW.crafting.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'swarm ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
