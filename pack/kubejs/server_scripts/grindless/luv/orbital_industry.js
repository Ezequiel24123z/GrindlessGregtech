// LuV B3. Orbit IDs come only from G.orbits; the mixer and cutter also work on the ground.
(function () {
  var G = global.grindless
  var B = G.orbitalIndustry
  var PIPE_RECYCLING = ['gtceu:arc_furnace/arc_normal_optical_pipe', 'gtceu:macerator/macerate_normal_optical_pipe']
  var recipes = [
    { name: 'zblan_optical_pipe', type: 'microgravity_processing', circuit: 1,
      items: ['gtceu:zblan_dust'], fluids: [['gtceu:polytetrafluoroethylene', 72]],
      output: '4x gtceu:normal_optical_pipe', eut: 7680, duration: 400, cleanroom: true },
    { name: 'whipple_shield_casing', type: 'microgravity_processing', circuit: 2,
      items: ['4x gtceu:aluminium_ingot', 'gtceu:titanium_dust', '2x gcyr:para_aramid_foil'],
      fluids: [['gtceu:hydrogen', 100]], output: '2x grindless:whipple_shield_casing', eut: 7680, duration: 200 },
    { name: 'containerless_naquadah_alloy', type: 'microgravity_processing', circuit: 3,
      items: ['2x gtceu:naquadah_dust', 'gtceu:osmiridium_dust', 'gtceu:trinium_dust'],
      fluids: [], output: '4x gtceu:naquadah_alloy_ingot', eut: 30720, duration: 2000 },
    { name: 'wake_uhpic_wafer', type: 'wake_epitaxy', circuit: 1,
      items: ['gtceu:hpic_wafer', '4x gtceu:indium_gallium_phosphide_dust'],
      fluids: [['gtceu:naquadah', 288]], output: 'gtceu:uhpic_wafer', eut: 30720, duration: 600, cleanroom: true },
    { name: 'wake_hpic_wafer', type: 'wake_epitaxy', circuit: 2,
      items: ['gtceu:mpic_wafer', 'gtceu:indium_gallium_phosphide_dust'],
      fluids: [['gtceu:molten_vanadium_gallium', 144]], output: 'gtceu:hpic_wafer', eut: 7680, duration: 600, cleanroom: true },
    { name: 'triple_junction_wafer', type: 'wake_epitaxy', circuit: 3,
      items: ['gtceu:germanium_plate', 'gtceu:gallium_arsenide_dust', 'gtceu:indium_gallium_phosphide_dust'],
      fluids: [], output: 'grindless:triple_junction_wafer', eut: 7680, duration: 400, cleanroom: true }
  ]
  B.recipes = recipes
  B.pipeRecycling = PIPE_RECYCLING
  // Quarter of the 100-mole formulation: exact elemental ratios with integer mB, five modest stacks.
  // A1's glass blend must disable decomposition: a ZBLAN dust denotes one cation share, not one atom.
  // 73,250 mB exceeds a single mixer's 64 B tank: use IV's GCYM Large Mixing Vessel and a large input hatch.
  B.zblan = { items: ['53x gtceu:small_zirconium_dust', '20x gtceu:small_barium_dust',
    '4x gtceu:small_lanthanum_dust', '3x gtceu:small_aluminium_dust', '20x gtceu:small_sodium_dust'],
    fluorine: 73250, output: 25 }

  ServerEvents.recipes(function (event) {
    PIPE_RECYCLING.forEach(function (id) { event.remove({ id: id }) })
    recipes.forEach(function (r) {
      var builder = event.recipes.gtceu[r.type]('grindless:' + r.name)
        .circuit(r.circuit).itemInputs(r.items).itemOutputs(r.output).EUt(r.eut).duration(r.duration)
      r.fluids.forEach(function (f) { builder.inputFluids(Fluid.of(f[0], f[1])) })
      G.orbits.allow(builder)
      if (r.cleanroom) builder.cleanroom(Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType').CLEANROOM)
      // GTM injects recycling AFTER ServerEvents.recipes. Its builder clears resolved AND unresolved
      // material info immediately before that generator runs; do not replace it with the cheaper inputs.
      if (r.name === 'zblan_optical_pipe') builder.removePreviousMaterialInfo()
    })
    event.recipes.gtceu.mixer('grindless:zblan')
      .itemInputs(B.zblan.items).inputFluids(Fluid.of('gtceu:fluorine', B.zblan.fluorine))
      .itemOutputs(B.zblan.output + 'x gtceu:zblan_dust').EUt(7680).duration(200)
    event.recipes.gtceu.cutter('grindless:triple_junction_cells')
      .itemInputs('grindless:triple_junction_wafer').itemOutputs('4x grindless:triple_junction_cell')
      .cleanroom(Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType').CLEANROOM).EUt(7680).duration(200)

    event.recipes.gtceu.shaped('gtceu:microgravity_smelter', ['CFC', 'PHP', 'C C'], {
      C: '#gtceu:circuits/luv', F: 'gtceu:luv_field_generator', P: 'gtceu:luv_electric_pump', H: 'gtceu:luv_machine_hull'
    }).id('grindless:crafting/microgravity_smelter')
    event.recipes.gtceu.shaped('gtceu:wake_shield_facility', ['CEC', ' H ', 'CEC'], {
      C: '#gtceu:circuits/luv', E: 'gtceu:luv_emitter', H: 'gtceu:luv_machine_hull'
    }).id('grindless:crafting/wake_shield_facility')
  })
})()
