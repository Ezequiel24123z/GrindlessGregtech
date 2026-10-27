// priority: -17924
// -----------------------------------------------------------------------------------------------
// LuV B8, Europa (machines and type: startup_scripts/grindless/luv/europa.js; docs/eras/luv.md, machines 17 and 18).
//
//   vein_drilling/luv/cryobot_ocean_sample   circuit 1, Europa only: a cryobot probe (used up) -> the Europan ocean sample + 1,000 mB
//                                            Europan brine, 7,680 EU/t x 6,000 t. Nobody reaches the ocean by hand: each sample costs a probe.
//   vein_drilling/luv/cryobot_brine          circuit 2, Europa only: 8,000 mB Europan brine + 2,000 mB water (the melt) a run, 7,680 EU/t
//                                            x 400 t. The melt head wears at 0.25 % a run (the family's bit rate) and its RTG pellet is used
//                                            up at 0.56 % a run (about one an hour).
//   bioreactor/luv/algae                     circuit 1, anywhere: 1,000 mB water + 500 mB CO2 -> 250 mB biomass + 400 mB oxygen, 480 x 400.
//   bioreactor/luv/europan_culture           circuit 2, Europa only: 1,000 mB Europan brine + 250 mB H2O2 + 500 mB hydrogen + 1 chondritic
//                                            extract (the belt's optical miner) + the ocean sample (kept) -> 1,000 mB gtceu:bacteria + 100 mB
//                                            biomass, 1,920 x 600. The pack's only bacteria.
//   bioreactor/uhv/far_red_algae             circuit 3, Proxima b only (UHV-B4, docs/eras/uhv.md line 32): the engineered far-red algae (the
//                                            biofoundry's circuit 12; kept) under Proxima's 1 µm light: 1,000 mB water + 500 mB CO2 -> 500 mB
//                                            biomass + 400 mB oxygen (the base's air), 1,920 x 400.
//   centrifuge/europan_brine_separation      1,000 mB Europan brine (H2O + MgSO4 + NaCl) -> 1,000 mB water + 6 magnesium sulfate + 2 salt
//                                            dust (GTM's mole sizes); GTM's electrolyzer splits both into Mg, S, O, Na and Cl.
//   The cut, beside its replacement: GTM's brewery/bacteria (4 bio chaff + 1,000 mB distilled water, sterile cleanroom) is removed, so
//   Europa stays the only source of bacteria after ZPM too. Every GTM and biofoundry recipe that takes bacteria keeps this source.
//   Parts: the melt head and the cryobot probe (assembler), and both controllers (shaped, like the other LuV site machines).
// Published for the tests: global.grindless.europa.recipes (ids), .cut, .surface.
(function () {
  var G = global.grindless
  var E = G.europa || (G.europa = {})
  var BRINE = 'gtceu:europan_brine'
  E.cut = ['gtceu:brewery/bacteria']
  E.recipes = [
    'grindless:vein_drilling/luv/cryobot_ocean_sample', 'grindless:vein_drilling/luv/cryobot_brine',
    'grindless:bioreactor/luv/algae', 'grindless:bioreactor/luv/europan_culture', 'grindless:bioreactor/uhv/far_red_algae',
    'grindless:centrifuge/europan_brine_separation', 'grindless:assembler/melt_head', 'grindless:assembler/cryobot_probe',
    'grindless:crafting/cryobot', 'grindless:crafting/algae_bioreactor'
  ]

  ServerEvents.recipes(function (event) {
    E.surface = G.places.surface('europa')
    function onEuropa(recipe) {
      return G.places.allow(recipe, 'europa')
    }

    E.cut.forEach(function (id) { event.remove({ id: id }) })

    onEuropa(event.recipes.gtceu.vein_drilling('grindless:luv/cryobot_ocean_sample'))
      .circuit(1)
      .itemInputs('grindless:cryobot_probe')
      .itemOutputs('grindless:europan_ocean_sample')
      .outputFluids(Fluid.of(BRINE, 1000))
      .EUt(7680).duration(6000)
    onEuropa(event.recipes.gtceu.vein_drilling('grindless:luv/cryobot_brine'))
      .circuit(2)
      .chancedInput('1x grindless:melt_head', 25, 0)
      .chancedInput('1x grindless:rtg_pellet', 56, 0)
      .outputFluids(Fluid.of(BRINE, 8000), Fluid.of('minecraft:water', 2000))
      .EUt(7680).duration(400)

    event.recipes.gtceu.bioreactor('grindless:luv/algae')
      .circuit(1)
      .inputFluids(Fluid.of('minecraft:water', 1000), Fluid.of('gtceu:carbon_dioxide', 500))
      .outputFluids(Fluid.of('gtceu:biomass', 250), Fluid.of('gtceu:oxygen', 400))
      .EUt(480).duration(400)
    onEuropa(event.recipes.gtceu.bioreactor('grindless:luv/europan_culture'))
      .circuit(2)
      .itemInputs('grindless:chondritic_extract')
      .notConsumable('grindless:europan_ocean_sample')
      .inputFluids(Fluid.of(BRINE, 1000), Fluid.of('gtceu:hydrogen_peroxide', 250), Fluid.of('gtceu:hydrogen', 500))
      .outputFluids(Fluid.of('gtceu:bacteria', 1000), Fluid.of('gtceu:biomass', 100))
      .EUt(1920).duration(600)
    if (Item.exists('grindless:engineered_far_red_algae')) {
      G.places.allow(event.recipes.gtceu.bioreactor('grindless:uhv/far_red_algae'), 'proxima_b')
        .circuit(3)
        .notConsumable('grindless:engineered_far_red_algae')
        .inputFluids(Fluid.of('minecraft:water', 1000), Fluid.of('gtceu:carbon_dioxide', 500))
        .outputFluids(Fluid.of('gtceu:biomass', 500), Fluid.of('gtceu:oxygen', 400))
        .EUt(1920).duration(400)
    } else {
      console.error('[grindless/luv] europa: grindless:engineered_far_red_algae is missing; bioreactor/uhv/far_red_algae skipped')
    }

    event.recipes.gtceu.centrifuge('grindless:europan_brine_separation')
      .inputFluids(Fluid.of(BRINE, 1000))
      .itemOutputs('6x gtceu:magnesium_sulfate_dust', '2x gtceu:salt_dust')
      .outputFluids(Fluid.of('minecraft:water', 1000))
      .EUt(120).duration(160)

    event.recipes.gtceu.assembler('grindless:melt_head')
      .itemInputs('4x gtceu:tungsten_carbide_plate', '2x gtceu:hsss_plate', 'gtceu:iv_electric_pump')
      .itemOutputs('grindless:melt_head')
      .EUt(7680).duration(400)
    event.recipes.gtceu.assembler('grindless:cryobot_probe')
      .itemInputs('grindless:melt_head', 'grindless:rtg_pellet', 'gtceu:luv_sensor', '8x gtceu:normal_optical_pipe', '4x gtceu:hsss_plate')
      .itemOutputs('grindless:cryobot_probe')
      .EUt(7680).duration(600)

    event.recipes.gtceu.shaped('gtceu:cryobot', ['CSC', 'PHP', 'CDC'], {
      C: '#gtceu:circuits/luv', S: 'gtceu:luv_sensor', P: 'gtceu:luv_electric_pump', H: 'gtceu:luv_machine_hull',
      D: 'gtceu:tungstensteel_gearbox'
    }).id('grindless:crafting/cryobot')
    event.recipes.gtceu.shaped('gtceu:algae_bioreactor', ['C C', 'PHP', 'CwC'], {
      C: '#gtceu:circuits/luv', P: 'gtceu:luv_electric_pump', H: 'gtceu:luv_machine_hull'
    }).id('grindless:crafting/algae_bioreactor')
  })
})()
