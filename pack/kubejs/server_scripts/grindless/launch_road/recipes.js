// priority: -17424
// -----------------------------------------------------------------------------------------------
// Recipes of the road to the first rocket that make our own parts (the ones that make a GCYR part are in
// server_scripts/grindless/integration/gcyr_launch_road.js, one file for every GCYR part recipe change):
//
//   Engine Test Stand (gtceu:engine_test_stand)    CRAFTING TABLE (MV): MV hull + 2 MV pumps (they feed the run tanks) + 2 MV sensors
//                                                  (the telemetry) + 4 MV circuits
//   Composite Autoclave (gtceu:composite_autoclave) CRAFTING TABLE (HV): HV hull + 2 HV autoclaves + 2 HV pumps (the nitrogen pressure)
//                                                  + 4 HV circuits
//
//   gtceu:static_fire, MV: the thruster cluster    4 power thrusters + 200 mB RP-1 + 300 mB oxygen -> 4 qualified power thrusters
//                                                  + 200 mB CO2 + 200 mB water. 300 t at 120 EU/t (36 000 EU)
//     The four thrusters of one motor fire together, like the engines of a stage. RP-1 is the kerosene rocket propellant: kerosene from
//     MV diesel in the distillery (circuit 23), RP-1 from kerosene in the distillery (circuit 23), both 120 EU/t; kerolox burns to CO2
//     and water ((CH2)n + 1.5n O2 -> n CO2 + n H2O). Without RP-1 in the pack (it comes from GT--) the test burns diesel.
//   gtceu:composite_curing, HV (both 300 t at 480 EU/t; the nitrogen pressurises the vessel and is vented after the cure)
//     ablative heat shield tile         4 fiberglass foils + 250 mB epoxy + 500 mB nitrogen -> 2 tiles
//     composite overwrapped tank        1 stainless steel drum + 4 para-aramid foils + 250 mB epoxy + 500 mB nitrogen -> 1 tank
//   gtceu:composite_curing, HV, circuit 5: the ablator mode (ZPM-B1, docs/eras/zpm.md "Older machines, new modes")
//     PICA heat shield                  4 carbon fibres + 150 mB phenol + 150 mB formaldehyde (the phenolic resin) -> 2 shields. 480 EU/t x 300 t.
//                                       The carbon-phenolic ablator the entry and flyby probes carry; nothing here is voided or gathered.
//
// The numbers are for one motor (4 thrusters, 2 tiles) and one fuel tank (2 overwrapped tanks): GCYR's Moon rocket takes 4 to 6 basic
// motors and 2 basic tanks, so the first rocket is 4-6 thruster tests, 4-6 motor static fires, 4-6 tile cures and 4 tank cures, on top of
// the parts GCYR always asked for. Nothing is inflated: the cost is the lines the parts cross (RP-1, epoxy, glass fibre, para-aramid,
// nitrogen) and the two multiblocks.
//
// Published in global.grindless.launchRoad.recipes for the smoke test.
// event.recipes.gtceu.<type>('grindless:<name>') -> recipe id grindless:<type>/<name> (GTM adds the type).
(function () {
  const G = global.grindless || (global.grindless = {})
  const LR = G.launchRoad || (G.launchRoad = {})
  const LOG = '[grindless/launch_road] '

  const RP1 = 'gtceu:rp_1_rocket_fuel'
  const DIESEL = 'gtceu:diesel'
  const OXYGEN = 'gtceu:oxygen'
  const CO2 = 'gtceu:carbon_dioxide'
  const WATER = 'minecraft:water'
  const EPOXY = 'gtceu:epoxy'
  const NITROGEN = 'gtceu:nitrogen'

  const THRUSTER = 'gtceu:power_thruster'
  const QUALIFIED = 'grindless:qualified_power_thruster'
  const TILE = 'grindless:ablative_heat_shield_tile'
  const COPV = 'grindless:composite_overwrapped_tank'
  const DRUM = 'gtceu:stainless_steel_drum'

  const STAND_PARTS = ['gtceu:mv_machine_hull', 'gtceu:mv_electric_pump', 'gtceu:mv_sensor', 'gtceu:engine_test_stand']
  const AUTOCLAVE_PARTS = ['gtceu:hv_machine_hull', 'gtceu:hv_autoclave', 'gtceu:hv_electric_pump', 'gtceu:composite_autoclave']

  LR.recipes = LR.recipes || {}
  LR.recipes.thrusters = {
    id: 'grindless:static_fire/power_thrusters',
    itemsIn: [{ id: THRUSTER, n: 4 }],
    fluidsIn: [{ id: RP1, mb: 200, fallback: DIESEL }, { id: OXYGEN, mb: 300 }],
    itemsOut: [{ id: QUALIFIED, n: 4 }],
    fluidsOut: [{ id: CO2, mb: 200 }, { id: WATER, mb: 200 }],
    eut: 120,
    duration: 300
  }
  LR.recipes.tile = {
    id: 'grindless:composite_curing/ablative_heat_shield_tile',
    itemsIn: [{ id: '#forge:foils/fiberglass', n: 4, sample: 'gcyr:fiberglass_foil' }],
    fluidsIn: [{ id: EPOXY, mb: 250 }, { id: NITROGEN, mb: 500 }],
    itemsOut: [{ id: TILE, n: 2 }],
    fluidsOut: [],
    eut: 480,
    duration: 300
  }
  LR.recipes.copv = {
    id: 'grindless:composite_curing/composite_overwrapped_tank',
    itemsIn: [{ id: DRUM, n: 1 }, { id: '#forge:foils/para_aramid', n: 4, sample: 'gcyr:para_aramid_foil' }],
    fluidsIn: [{ id: EPOXY, mb: 250 }, { id: NITROGEN, mb: 500 }],
    itemsOut: [{ id: COPV, n: 1 }],
    fluidsOut: [],
    eut: 480,
    duration: 300
  }
  LR.recipes.ablator = {
    id: 'grindless:composite_curing/pica_heat_shield',
    itemsIn: [{ id: 'gtceu:carbon_fibers', n: 4 }],
    fluidsIn: [{ id: 'gtceu:phenol', mb: 150 }, { id: 'gtceu:formaldehyde', mb: 150 }],
    itemsOut: [{ id: 'grindless:pica_heat_shield', n: 2 }],
    fluidsOut: [],
    circuit: 5,
    eut: 480,
    duration: 300
  }
  LR.craftingRecipes = { testStand: 'grindless:assembler/engine_test_stand', autoclave: 'grindless:assembler/composite_autoclave' }

  function ingredient(e) {
    return e.n + 'x ' + e.id
  }

  // the GT builder of one table entry (each call adds one input or output); the fuel of an entry falls back when its fluid is not in
  // the pack
  function addGt(event, type, name, r) {
    var recipe = type === 'static_fire' ? event.recipes.gtceu.static_fire(name) : event.recipes.gtceu.composite_curing(name)
    r.itemsIn.forEach(function (e) { recipe.itemInputs(ingredient(e)) })
    if (r.circuit) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (f) {
      var id = Fluid.exists(f.id) ? f.id : f.fallback
      recipe.inputFluids(Fluid.of(id, f.mb))
    })
    r.itemsOut.forEach(function (e) { recipe.itemOutputs(ingredient(e)) })
    r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.mb)) })
    recipe.EUt(r.eut).duration(r.duration)
  }

  function missingItems(ids) {
    return ids.filter(function (id) { return id.charAt(0) !== '#' && !Item.exists(id) })
  }

  function missingFluids(list) {
    return list.filter(function (f) { return !Fluid.exists(f.id) && !(f.fallback && Fluid.exists(f.fallback)) })
      .map(function (f) { return f.id })
  }

  function tableReady(r) {
    var ids = r.itemsIn.map(function (e) { return e.sample || e.id }).concat(r.itemsOut.map(function (e) { return e.id }))
    return missingItems(ids).concat(missingFluids(r.fluidsIn.concat(r.fluidsOut)))
  }

  function addRecipes(event) {
    var done = []

    var missingStand = missingItems(STAND_PARTS)
    if (missingStand.length > 0) {
      console.error(LOG + 'Engine Test Stand recipe skipped, unknown item(s): ' + missingStand.join(', '))
    } else {
      event.recipes.gtceu.assembler('grindless:engine_test_stand')
        .itemInputs('gtceu:mv_machine_hull', 'gtceu:mv_electric_pump', '2x gtceu:mv_sensor', '4x #gtceu:circuits/mv',
          '2x grindless:platinum_electrode', '2x grindless:sintered_regolith')
        .inputFluids(Fluid.of('gtceu:soldering_alloy', 144), Fluid.of('gtceu:nitrogen', 1000))
        .itemOutputs('gtceu:engine_test_stand')
        .EUt(480).duration(400)
      done.push('engine test stand')
    }

    var missingAutoclave = missingItems(AUTOCLAVE_PARTS)
    if (missingAutoclave.length > 0) {
      console.error(LOG + 'Composite Autoclave recipe skipped, unknown item(s): ' + missingAutoclave.join(', '))
    } else {
      event.recipes.gtceu.assembler('grindless:composite_autoclave')
        .itemInputs('gtceu:hv_machine_hull', 'gtceu:hv_autoclave', '2x gtceu:hv_electric_pump', '4x #gtceu:circuits/hv',
          '2x grindless:platinum_electrode', '2x grindless:sintered_regolith')
        .inputFluids(Fluid.of('gtceu:soldering_alloy', 144), Fluid.of('gtceu:nitrogen', 1000))
        .itemOutputs('gtceu:composite_autoclave')
        .EUt(480).duration(400)
      done.push('composite autoclave')
    }

    var table = [
      { type: 'static_fire', name: 'grindless:power_thrusters', r: LR.recipes.thrusters },
      { type: 'composite_curing', name: 'grindless:ablative_heat_shield_tile', r: LR.recipes.tile },
      { type: 'composite_curing', name: 'grindless:composite_overwrapped_tank', r: LR.recipes.copv },
      { type: 'composite_curing', name: 'grindless:pica_heat_shield', r: LR.recipes.ablator }
    ]
    table.forEach(function (t) {
      var missing = tableReady(t.r)
      if (missing.length > 0) {
        console.error(LOG + t.r.id + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      addGt(event, t.type, t.name, t.r)
      done.push(t.r.id)
    })
    if (!Fluid.exists(RP1)) console.warn(LOG + RP1 + ' is not in the pack: the thruster static fire burns ' + DIESEL)
    return done
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    try {
      console.info(LOG + 'recipes added: ' + addRecipes(event).join(', '))
    } catch (e) {
      console.error(LOG + 'recipes failed: ' + e)
    }
  })
})()
