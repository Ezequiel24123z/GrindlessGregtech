// priority: -23424
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's fibres and the space elevator (docs/eras/uhv.md, machines 14 and 15, line 24; package UHV-A7): the PBO plant, the
// tether ribbon works, line 24's side steps, the blocks of GTCA's space elevator and its run recipe (machines, items and materials:
// startup_scripts/grindless/uhv/elevator.js). VA[LuV] = 30,720 EU/t, VA[ZPM] = 122,880, VA[UV] = 491,520, VA[UHV] = 1,966,080.
// GTM's units: 1,000 mB of a gas or liquid per atom of an element (H, Cl, O) or per molecule of a compound (HCl, H2O, H3PO4).
//
//   PBO plant (type gtceu:pbo_synthesis; the programmed circuit picks the step; Wolfe's DAR route, Dow/Toyobo's Zylon)
//     1 nitrate     1,000 mB 1,2,3-trichlorobenzene + 4,000 mB nitration mixture -> 1,000 mB 4,6-dinitro-1,2,3-trichlorobenzene +
//                   2,000 mB diluted sulfuric acid (two nitro groups; GTM's nitrochlorobenzene takes 2,000 mB per group)  122,880 x 300 t
//     2 hydrolyse   1,000 mB dinitrotrichlorobenzene + 6 sodium hydroxide -> 1 2-chloro-4,6-dinitroresorcinol + 4 salt (two of the three
//                   chlorines go to hydroxyls; NaOH is 3 dust, NaCl 2)                                                    30,720 x 200 t
//     3 reduce      1 chlorodinitroresorcinol + 14,000 mB hydrogen + 1,000 mB hydrochloric acid, palladium kept -> 1
//                   4,6-diaminoresorcinol dihydrochloride + 4,000 mB water (the nitro groups to amines, the last chlorine off as HCl,
//                   both amines salted: C6H3ClN2O6 + 7 H2 + HCl -> C6H8N2O2.2HCl + 4 H2O)                             491,520 x 400 t
//     4 polymerise  1 diaminoresorcinol + 1 terephthalic acid + 500 mB polyphosphoric acid -> 1,000 mB PBO dope + 2,000 mB hydrochloric
//                   acid (the dihydrochloride gives its HCl back; the condensation water stays in the PPA)           491,520 x 600 t
//     5 spin        1,000 mB PBO dope + 2,000 mB water -> 8 PBO fibre + 1,000 mB phosphoric acid (dry-jet wet spinning: the water
//                   bath coagulates the fibre and washes the PPA out as phosphoric acid)                              122,880 x 400 t
//   tether ribbon works (type gtceu:tether_ribbon)
//     1 ribbon      8 carbon nanotube yarn (ZPM's pyrolyser) + 4 BNNT yarn (UV) + 4 PBO fibre -> 1 tether ribbon segment
//                                                                                                                  1,966,080 x 800 t
//     2 climber     1 InGaAs epi wafer (UV's MOCVD: the laser receiver) + 2 SiC power modules + 2 betavoltaic cells -> 1 tether
//                   climber                                                                                           491,520 x 600 t
//   side steps (GTM's own machines)
//     trichlorobenzene  chemical reactor, circuit 3: 1,000 mB benzene + 6,000 mB chlorine -> 1,000 mB trichlorobenzene + 3,000 mB
//                   hydrochloric acid (GTM's chlorobenzene and dichlorobenzene take lower circuits)                     1,920 x 400 t
//     terephthalic acid  chemical reactor, cobalt kept: 1,000 mB dimethylbenzene + 6,000 mB oxygen -> 1 terephthalic acid + 2,000 mB
//                   water (the Amoco oxidation of p-xylene on cobalt)                                                     1,920 x 400 t
//     polyphosphoric acid  mixer: 4,000 mB phosphoric acid + 14 phosphorus pentoxide -> 2,000 mB polyphosphoric acid
//                   (4 H3PO4 + P4O10 -> 2 H6P4O13)                                                                       1,920 x 200 t
//   GTCA's space elevator (gtca:space_elevator, 35 x 43 x 35; GTCA registers the blocks and no recipe reaches them): assembler rows,
//   each with its own circuit, 16 blocks a craft for the blocks it takes hundreds of
//     1 concrete floor     4 steel rods + 2 silicon dioxide + 1,000 mB concrete -> 16 ultra high strength concrete floor
//     2 base casing        8 naquadah alloy plates + 1 neutronium frame -> 16 space elevator base casing
//     3 support structure  4 HSS-S plates + 2 tungsten steel rods -> 16 space elevator support structure
//     4 internal structure 4 naquadah alloy plates + 1 PBO fibre -> 16 space elevator internal structure
//     5 cable              1 tether ribbon segment + 144 mB PBO dope -> 1 space elevator cable
//     6 motor mk 1         1 cable + 1 UV motor + 2 UV circuits -> 8 space elevator motor mk 1 (the structure takes 88)
//   (motors mk 2-5 get no recipe: mk 1 forms the elevator; GTCA's miner, pump and assembler modules get none: S0-8, they never form)
//   the elevator's run (type gtceu:space_elevator): the GEO lift
//     geo_lift      1 tether ribbon segment + 1 thruster pod + 2 SiC power modules + 8 neutronium plates, tether climber kept ->
//                   1 GEO-assembled stage (the climber hauls the parts up the tether and the stage is put together at the top;
//                   the ribbon segment it rides is worn out; UHV-A8's level 8 rocket takes the stage)                1,966,080 x 600 t
//   crafting: UHV hull + 2 UV pumps + 4 UHV circuits (plant); UHV hull + 2 UV conveyors + 4 UHV circuits (works); UHV hull + tether
//   climber + UV field generator + 2 UV motors + 4 UHV circuits (GTCA's elevator controller; its assembly line recipe stays removed)
//
// Destinations (rule 3 of AGENTS.md):
//   hydrochloric acid (c4, side) -> back into c3, or GTM's electrolyser (hydrogen + chlorine: the chlorine returns to trichlorobenzene)
//   salt (c2)                   -> GTM's electrolyser (sodium + chlorine)
//   diluted sulfuric acid (c1)  -> GTM's distillation back to sulfuric acid (and the nitration mixture)
//   water (c3, side)            -> c5's spinning bath, or any water consumer
//   phosphoric acid (c5)        -> the polyphosphoric acid side step: the PPA goes round
//   worn ribbon segment         -> the elevator's run consumes the segment the climber rides; nothing is left over
//
// Lookup: every plant and works recipe has its own circuit, the elevator's run keeps the climber, so no recipe's keys contain another's
// (checked at load). Ids not yet registered skip their row with a console error. Published in global.grindless.elevator: .recipes
// [{ name, type, recipeId, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration, notConsumable }], .side, .blockRecipes,
// .run, .crafting, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var E = G.elevator || (G.elevator = {})
  var F = G.uhvFoundation && G.uhvFoundation.ids ? G.uhvFoundation.ids : {}

  var LUV = 30720
  var ZPM = 122880
  var UVA = 491520
  var UHVA = 1966080

  var PBO = F.pboFibre || 'grindless:pbo_fibre'
  var DOPE = F.pboDope || 'gtceu:pbo_dope'
  var SEGMENT = F.tetherRibbonSegment || 'grindless:tether_ribbon_segment'
  var CLIMBER = F.tetherClimber || 'grindless:tether_climber'
  var SIC = F.sicPowerModule || 'grindless:sic_power_module'
  var BETA = F.betavoltaicCell || 'grindless:betavoltaic_cell'
  var CNT = 'grindless:carbon_nanotube_yarn'
  var BNNT = 'grindless:bnnt_yarn'
  var EPI = 'grindless:ingaas_epi_wafer'
  var POD = 'grindless:thruster_pod'
  var STAGE = 'grindless:geo_assembled_stage'

  var TCB = 'gtceu:trichlorobenzene'
  var DNTCB = 'gtceu:dinitrotrichlorobenzene'
  var PPA = 'gtceu:polyphosphoric_acid'
  var CDNR = 'gtceu:chlorodinitroresorcinol_dust'
  var DAR = 'gtceu:diaminoresorcinol_dust'
  var TPA = 'gtceu:terephthalic_acid_dust'
  var HCL = 'gtceu:hydrochloric_acid'
  var WATER = 'minecraft:water'

  var GTCA = {
    floor: 'gtca:ultra_high_strength_concrete_floor',
    base: 'gtca:space_elevator_base_casing',
    support: 'gtca:space_elevator_support_structure',
    internal: 'gtca:space_elevator_internal_structure',
    cable: 'gtca:space_elevator_cable',
    motor: 'gtca:space_elevator_motor_mk_1'
  }

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }

  // recipes of the two machines: type, circuit, contents
  var TABLE = [
    { name: 'nitrate', type: 'pbo_synthesis', circuit: 1, itemsIn: [],
      fluidsIn: [fluid(TCB, 1000), fluid('gtceu:nitration_mixture', 4000)],
      itemsOut: [], fluidsOut: [fluid(DNTCB, 1000), fluid('gtceu:diluted_sulfuric_acid', 2000)], eut: ZPM, duration: 300 },
    { name: 'hydrolyse', type: 'pbo_synthesis', circuit: 2, itemsIn: [item('gtceu:sodium_hydroxide_dust', 6)],
      fluidsIn: [fluid(DNTCB, 1000)],
      itemsOut: [item(CDNR, 1), item('gtceu:salt_dust', 4)], fluidsOut: [], eut: LUV, duration: 200 },
    { name: 'reduce', type: 'pbo_synthesis', circuit: 3, notConsumable: 'gtceu:palladium_dust', itemsIn: [item(CDNR, 1)],
      fluidsIn: [fluid('gtceu:hydrogen', 14000), fluid(HCL, 1000)],
      itemsOut: [item(DAR, 1)], fluidsOut: [fluid(WATER, 4000)], eut: UVA, duration: 400 },
    { name: 'polymerise', type: 'pbo_synthesis', circuit: 4, itemsIn: [item(DAR, 1), item(TPA, 1)], fluidsIn: [fluid(PPA, 500)],
      itemsOut: [], fluidsOut: [fluid(DOPE, 1000), fluid(HCL, 2000)], eut: UVA, duration: 600 },
    { name: 'spin', type: 'pbo_synthesis', circuit: 5, itemsIn: [], fluidsIn: [fluid(DOPE, 1000), fluid(WATER, 2000)],
      itemsOut: [item(PBO, 8)], fluidsOut: [fluid('gtceu:phosphoric_acid', 1000)], eut: ZPM, duration: 400 },
    { name: 'ribbon', type: 'tether_ribbon', circuit: 1, itemsIn: [item(CNT, 8), item(BNNT, 4), item(PBO, 4)], fluidsIn: [],
      itemsOut: [item(SEGMENT, 1)], fluidsOut: [], eut: UHVA, duration: 800 },
    { name: 'climber', type: 'tether_ribbon', circuit: 2, itemsIn: [item(EPI, 1), item(SIC, 2), item(BETA, 2)], fluidsIn: [],
      itemsOut: [item(CLIMBER, 1)], fluidsOut: [], eut: UVA, duration: 600 },
    // UIV-B2: the MH-braided ribbon pressed into the tether (circuit 3) and the worn crust lift tether's scrap (circuit 4)
    { name: 'mh_tether', type: 'tether_ribbon', circuit: 3, itemsIn: [item('grindless:braided_mh_tether', 1), item(SEGMENT, 1)], fluidsIn: [],
      itemsOut: [item('grindless:mh_tether', 1)], fluidsOut: [], eut: UHVA, duration: 800 },
    { name: 'worn_tether_scrap', type: 'tether_ribbon', circuit: 4, itemsIn: [item('grindless:worn_crust_lift_tether', 1)], fluidsIn: [],
      itemsOut: [item(CNT, 4)], fluidsOut: [], eut: UHVA, duration: 400 },
    // UXV-B1: the Whipple bumper, a densified yarn interleaved with aluminium foil (circuit 7; 5 and 6 stay free for the other UXV rows)
    { name: 'bumper_weave', type: 'tether_ribbon', circuit: 7, itemsIn: [item('grindless:cnt_densified_yarn', 1), item('gtceu:aluminium_foil', 2)], fluidsIn: [],
      itemsOut: [item('grindless:cnt_bumper_weave', 1)], fluidsOut: [], eut: UHVA, duration: 600 }
  ]

  // line 24's side steps on GTM's own machines
  var SIDE = [
    { name: 'trichlorobenzene', type: 'chemical_reactor', circuit: 3, itemsIn: [],
      fluidsIn: [fluid('gtceu:benzene', 1000), fluid('gtceu:chlorine', 6000)],
      itemsOut: [], fluidsOut: [fluid(TCB, 1000), fluid(HCL, 3000)], eut: 1920, duration: 400 },
    { name: 'terephthalic_acid', type: 'chemical_reactor', circuit: null, notConsumable: 'gtceu:cobalt_dust', itemsIn: [],
      fluidsIn: [fluid('gtceu:dimethylbenzene', 1000), fluid('gtceu:oxygen', 6000)],
      itemsOut: [item(TPA, 1)], fluidsOut: [fluid(WATER, 2000)], eut: 1920, duration: 400 },
    { name: 'polyphosphoric_acid', type: 'mixer', circuit: null, itemsIn: [item('gtceu:phosphorus_pentoxide_dust', 14)],
      fluidsIn: [fluid('gtceu:phosphoric_acid', 4000)],
      itemsOut: [], fluidsOut: [fluid(PPA, 2000)], eut: 1920, duration: 200 }
  ]

  // GTCA's space elevator blocks (assembler)
  var BLOCKS = [
    { name: 'ultra_high_strength_concrete_floor', type: 'assembler', circuit: 1,
      itemsIn: [item('gtceu:steel_rod', 4), item('gtceu:silicon_dioxide_dust', 2), item('grindless:silica_aerogel', 1), item('grindless:mu_metal_shield', 1)],
      fluidsIn: [fluid('gtceu:concrete', 1000), fluid('gtceu:lubricant', 250)],
      itemsOut: [item(GTCA.floor, 16)], fluidsOut: [], eut: LUV, duration: 200 },
    { name: 'space_elevator_base_casing', type: 'assembler', circuit: 2,
      itemsIn: [item('gtceu:naquadah_alloy_plate', 8), item('gtceu:neutronium_frame', 1), item('grindless:nbn_coated_sic_plate', 1), item('grindless:srf_cavity', 1)],
      fluidsIn: [fluid('gtceu:soldering_alloy', 144), fluid('gtceu:lubricant', 250)],
      itemsOut: [item(GTCA.base, 16)], fluidsOut: [], eut: UVA, duration: 200 },
    { name: 'space_elevator_support_structure', type: 'assembler', circuit: 3,
      itemsIn: [item('gtceu:hsss_plate', 4), item('gtceu:tungsten_steel_rod', 2), item('grindless:silica_aerogel', 1), item('grindless:uv_electromagnet', 1)],
      fluidsIn: [fluid('gtceu:soldering_alloy', 144), fluid('gtceu:lubricant', 250)],
      itemsOut: [item(GTCA.support, 16)], fluidsOut: [], eut: ZPM, duration: 200 },
    { name: 'space_elevator_internal_structure', type: 'assembler', circuit: 4,
      itemsIn: [item('gtceu:naquadah_alloy_plate', 4), item(PBO, 1), item('grindless:ytterbium_fibre', 1), item('grindless:mu_metal_shield', 1)],
      fluidsIn: [fluid('gtceu:soldering_alloy', 144), fluid('gtceu:lubricant', 250)],
      itemsOut: [item(GTCA.internal, 16)], fluidsOut: [], eut: UVA, duration: 200 },
    { name: 'space_elevator_cable', type: 'assembler', circuit: 5, itemsIn: [item(SEGMENT, 1), item(CNT, 2), item(BNNT, 2), item('grindless:nbn_coated_sic_plate', 1)],
      fluidsIn: [fluid(DOPE, 144), fluid('gtceu:lubricant', 250)],
      itemsOut: [item(GTCA.cable, 1)], fluidsOut: [], eut: UHVA, duration: 400 },
    { name: 'space_elevator_motor_mk_1', type: 'assembler', circuit: 6,
      itemsIn: [item(GTCA.cable, 1), item('gtceu:uv_electric_motor', 1), item('#gtceu:circuits/uv', 2), item('grindless:srf_cryomodule', 1), item('grindless:uv_electromagnet', 1)],
      fluidsIn: [fluid('gtceu:soldering_alloy', 144), fluid('gtceu:lubricant', 250)],
      itemsOut: [item(GTCA.motor, 8)], fluidsOut: [], eut: UHVA, duration: 400 }
  ]

  // the elevator's run: the GEO lift
  var RUN = [
    { name: 'geo_lift', type: 'space_elevator', circuit: null, notConsumable: CLIMBER,
      itemsIn: [item(SEGMENT, 1), item(POD, 1), item(SIC, 2), item('gtceu:neutronium_plate', 8)], fluidsIn: [],
      itemsOut: [item(STAGE, 1)], fluidsOut: [], eut: UHVA, duration: 600 }
  ]

  // recipeId is the id GTM gives the recipe: the builder gets grindless:<name> and GTM puts the type's path in front
  function publish(t) {
    return {
      name: t.name, type: t.type, recipeId: 'grindless:' + t.type + '/' + t.name, circuit: t.circuit, itemsIn: t.itemsIn,
      fluidsIn: t.fluidsIn, itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration,
      notConsumable: t.notConsumable || null
    }
  }
  E.recipes = TABLE.map(publish)
  E.side = SIDE.map(publish)
  E.blockRecipes = BLOCKS.map(publish)
  E.run = RUN.map(publish)
  E.skipped = []
  E.clashes = []
  E.crafting = {
    plant: 'grindless:assembly_line/pbo_plant',
    works: 'grindless:assembly_line/tether_ribbon_works',
    elevator: 'grindless:assembly_line/space_elevator'
  }
  var CRAFTING_PARTS = ['gtceu:uhv_machine_hull', 'gtceu:uv_electric_pump', 'gtceu:uv_conveyor_module', 'gtceu:uv_field_generator',
    'gtceu:uv_electric_motor', CLIMBER, 'gtca:space_elevator', 'gtca:space_elevator_cable', 'gtca:space_elevator_motor_mk_1', 'gtca:ultra_high_strength_concrete_floor',
    'grindless:fused_silica_tube', 'grindless:silica_aerogel', 'grindless:cvd_diamond_plate', 'grindless:srf_cryomodule', 'grindless:ytterbium_fibre', 'grindless:nbn_coated_sic_plate', 'grindless:mu_metal_shield', 'grindless:thruster_pod']

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
    items.forEach(function (x) {
      if (x.id.charAt(0) === '#') return
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRecipe(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      E.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'elevator recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
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

  function addAll(event) {
    E.clashes = clashesOf(E.recipes.concat(E.blockRecipes, E.run))
    if (E.clashes.length > 0) console.error(LOG + 'elevator recipes clash in the lookup: ' + E.clashes.join(', '))
    var all = E.recipes.concat(E.side, E.blockRecipes, E.run)
    all.forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'elevator recipes added: ' + (all.length - E.skipped.length))
  }

  function addCrafting(event) {
    var missing = CRAFTING_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      E.skipped.push({ name: 'crafting', reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'elevator controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembly_line('grindless:pbo_plant')
    b.itemInputs('gtceu:uhv_machine_hull')
    b.itemInputs('2x gtceu:uv_electric_pump')
    b.itemInputs('4x #gtceu:circuits/uhv')
    b.itemInputs('4x grindless:fused_silica_tube')
    b.itemInputs('2x grindless:silica_aerogel')
    b.itemInputs('2x grindless:cvd_diamond_plate')
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
    b.itemOutputs('gtceu:pbo_plant')
    // researched with things made before the plant and the works (the cable and the motor need both)
    b.stationResearch(function (r) { return r.researchStack(Item.of(TPA)).CWUt(64).EUt(1966080) })
    b.EUt(1966080).duration(1500)
    b = event.recipes.gtceu.assembly_line('grindless:tether_ribbon_works')
    b.itemInputs('gtceu:uhv_machine_hull')
    b.itemInputs('2x gtceu:uv_conveyor_module')
    b.itemInputs('4x #gtceu:circuits/uhv')
    b.itemInputs('2x grindless:srf_cryomodule')
    b.itemInputs('4x grindless:ytterbium_fibre')
    b.itemInputs('2x grindless:nbn_coated_sic_plate')
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
    b.itemOutputs('gtceu:tether_ribbon_works')
    b.stationResearch(function (r) { return r.researchStack(Item.of(EPI)).CWUt(64).EUt(1966080) })
    b.EUt(1966080).duration(1500)
    b = event.recipes.gtceu.assembly_line('grindless:space_elevator')
    b.itemInputs('gtceu:uhv_machine_hull')
    b.itemInputs('2x gtceu:uv_field_generator')
    b.itemInputs('2x gtceu:uv_electric_motor')
    b.itemInputs(CLIMBER)
    b.itemInputs('4x #gtceu:circuits/uhv')
    b.itemInputs('2x grindless:srf_cryomodule')
    b.itemInputs('4x grindless:mu_metal_shield')
    b.itemInputs('2x grindless:thruster_pod')
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
    b.itemOutputs('gtca:space_elevator')
    b.stationResearch(function (r) { return r.researchStack(Item.of('gtca:ultra_high_strength_concrete_floor')).CWUt(64).EUt(1966080) })
    b.EUt(1966080).duration(1500)
  }

  ServerEvents.recipes(function (event) {
    try { addAll(event) } catch (e) { console.error(LOG + 'elevator recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'elevator crafting failed: ' + e2) }
  })
})()
