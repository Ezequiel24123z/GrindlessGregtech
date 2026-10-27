// priority: -19524
// -----------------------------------------------------------------------------------------------
// Perlite (gtceu:perlite_dust): an LV source for the volcanic glass of the basalt deltas (tools/analysis obtainability audit,
// 2026-10-24: class A, "it opens an automation").
//
// GTM 7.5.3 gives perlite one recipe, its electrolysis (gtceu:electrolyzer/decomposition_electrolyzing_perlite: 3 perlite dust ->
// 2 obsidian dust + 1 000 mB of water, 30 EU/t), and nothing makes it. The vein drilling tables cannot carry it: their generator turns
// every vein material into its raw ore (gtceu:raw_<material>, lv/vein_drilling.js) and perlite has none. So it comes out of basalt:
//
//   LV sifter   grindless:sifter/lv/basalt_perlite   3 basalt dust -> 1 perlite dust + 2 flint dust      30 EU/t, 200 ticks
//
// Sifting crushed basalt picks out its glassy grains; flint dust is basalt's main component in GTM (8 of its 16 parts) and has its own
// uses. Basalt dust is LV already without the Nether: the electrolysis of basaltic mineral sand (an Overworld vein of the drills) or
// the byproduct of washing its crushed ore; or ground basalt from the deltas. Its electrolysis then gives obsidian dust
// out of basalt, a second LV line next to grinding the arc furnace's obsidian (cobblestone + water).
//
// Era: LV. Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    event.recipes.gtceu.sifter('grindless:lv/basalt_perlite')
      .itemInputs('3x #forge:dusts/basalt')
      .itemOutputs('1x gtceu:perlite_dust', '2x gtceu:flint_dust')
      .EUt(30)
      .duration(200)
  })
})()
