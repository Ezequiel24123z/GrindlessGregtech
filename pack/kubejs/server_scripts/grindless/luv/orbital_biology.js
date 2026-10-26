// B4 keeps GTM's dopant doses and cleanroom conditions; only the orbit changes the crystal yield and time.
(function () {
  var G = global.grindless
  var CleanroomType = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType')
  ServerEvents.recipes(function (event) {
    function orbital(type, id) {
      return G.orbits.allow(event.recipes.gtceu[type]('grindless:luv/' + id))
    }
    var crystals = [
      [1, 'gtceu:exquisite_olivine_gem', 'gtceu:europium', 16, 320],
      [2, 'gtceu:exquisite_emerald_gem', 'gtceu:europium', 16, 320],
      [3, 'gtceu:raw_crystal_chip_parts', 'gtceu:europium', 16, 480],
      [4, 'gtceu:raw_crystal_chip_parts', 'gtceu:bacterial_sludge', 250, 480],
      [5, 'gtceu:raw_crystal_chip_parts', 'gtceu:mutagen', 250, 480]
    ]
    crystals.forEach(function (r) {
      orbital('microgravity_crystal_growth', 'raw_crystal_chip_' + r[0]).circuit(r[0])
        .itemInputs(r[1]).inputFluids(Fluid.of(r[2], r[3])).itemOutputs('gtceu:raw_crystal_chip')
        .cleanroom(CleanroomType.CLEANROOM).EUt(r[4]).duration(3000)
    })
    orbital('microgravity_crystal_growth', 'sapphire_test_mass').circuit(6)
      .itemInputs('64x gtceu:sapphire_dust', 'gtceu:exquisite_sapphire_gem')
      .itemOutputs('grindless:sapphire_test_mass')
      .cleanroom(CleanroomType.CLEANROOM).EUt(7680).duration(6000)
    ;[
      [5, 'neurotrophic_factor', 'grindless:engineered_barley_seed', 'grindless:neurotrophic_factor'],
      [6, 'plant_collagen', 'grindless:engineered_tobacco_seed', '2x gtceu:collagen_dust']
    ].forEach(function (r) {
      G.orbits.allow(event.recipes.gtceu.greenhouse('grindless:luv/' + r[1]))
        .circuit(r[0]).notConsumable(r[2])
        .inputFluids(Fluid.of('minecraft:water', 1000), Fluid.of('gtceu:carbon_dioxide', 500))
        .itemOutputs(r[3]).outputFluids(Fluid.of('gtceu:biomass', 250), Fluid.of('gtceu:oxygen', 200))
        .EUt(480).duration(1200)
    })
    orbital('organoid_assembly', 'neural_organoid').circuit(1)
      .itemInputs('16x gtceu:stem_cells', 'grindless:neurotrophic_factor')
      .inputFluids(Fluid.of('gtceu:sterilized_growth_medium', 250))
      .itemOutputs('grindless:neural_organoid')
      .cleanroom(CleanroomType.CLEANROOM).EUt(30720).duration(600)
    orbital('organoid_assembly', 'neuro_processing_unit').circuit(2)
      .itemInputs('gtceu:wetware_printed_circuit_board', 'grindless:neural_organoid',
        '8x gtceu:polybenzimidazole_small_fluid_pipe', '8x gtceu:electrum_plate',
        '16x gtceu:silicone_rubber_foil', '8x gtceu:hsse_bolt')
      .inputFluids(Fluid.of('gtceu:sterilized_growth_medium', 250))
      .itemOutputs('gtceu:neuro_processing_unit')
      .cleanroom(CleanroomType.CLEANROOM).EUt(30720).duration(1563)
    ;[
      ['zero_g_crystal_grower', 'gtceu:luv_electric_pump', 'gtceu:luv_sensor'],
      ['hydroponic_ring', 'gtceu:luv_electric_motor', null],
      ['organoid_lab', 'gtceu:luv_robot_arm', 'gtceu:luv_sensor']
    ].forEach(function (r) {
      var keys = { C: '#gtceu:circuits/luv', P: r[1], H: 'gtceu:luv_machine_hull' }
      if (r[2]) keys.S = r[2]
      event.recipes.gtceu.shaped('gtceu:' + r[0], [r[2] ? 'CSC' : 'C C', 'PHP', 'CwC'], keys)
        .id('grindless:crafting/' + r[0])
    })
  })
})()
