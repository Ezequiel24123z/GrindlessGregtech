// priority: -300
// TEST ONLY, MEGA-0 (lib/mega.js). Throwaway registrations, never shipped; ids gtceu:gg_lib_*.
//   gg_lib_coil   a coil machine on gtceu:large_chemical_reactor: G.mega.chain({ cap: null })
//   gg_lib_disc   the same with the coil discount (0.95 per coil step, floor 0.80)
//   gg_lib_plant  a coil-less machine with a parallel-hatch slot: G.mega.chain({ parallel: 'hatch' }) (withHatch)
(function () {
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var G = global.grindless
    var Pat = G.patterns
    var Coils = G.coils
    var PH = G.parallelHatch
    var CASING = 'gtceu:solid_machine_casing'
    var TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
    var OVERLAY = 'gtceu:block/multiblock/implosion_compressor'

    function front(extra) {
      var s = { S: Pat.controller(), B: Pat.part('input_bus', { exact: 1 }), O: Pat.part('output_bus', { exact: 1 }),
        E: Pat.part('energy_input', { exact: 1 }), C: Pat.block(CASING), '#': Pat.air() }
      Object.keys(extra || {}).forEach(function (k) { s[k] = extra[k] })
      return s
    }

    function coilMachine(name, label, opts) {
      var spec = { slices: [['CCC', 'CKC', 'CCC'], ['CCC', 'CKC', 'CCC'], ['CCC', 'BSO', 'CEC']], symbols: front({ K: Coils.predicate() }) }
      Pat.register('gtceu:' + name, spec)
      G.mega.install(event.create(name, 'multiblock')
        .langValue(label)
        .rotationState(RotationState.NON_Y_AXIS)
        .machine(function (holder) { return Coils.create(holder) })
        .recipeType('large_chemical_reactor'), G.mega.chain(opts))
        .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
        .pattern(function (def) { return Pat.build(def, spec) })
        .workableCasingModel(TEXTURE, OVERLAY)
    }

    coilMachine('gg_lib_coil', 'Lib coil machine', { cap: null })
    coilMachine('gg_lib_disc', 'Lib coil machine with discount', { cap: null, discount: { rate: 0.95, floor: 0.8 } })

    var PLANT = {
      slices: [['CCC', 'CCC', 'CCC'], ['CCC', 'CCC', 'CCC'], ['CHC', 'BSO', 'CEC']],
      symbols: front({ H: Pat.oneOf(Pat.block(CASING), PH.part()) })
    }
    Pat.register('gtceu:gg_lib_plant', PLANT)
    G.mega.install(event.create('gg_lib_plant', 'multiblock')
      .langValue('Lib hatch plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('large_chemical_reactor'), G.mega.chain({ parallel: 'hatch' }))
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, PLANT) })
      .workableCasingModel(TEXTURE, OVERLAY)
  })
})()
