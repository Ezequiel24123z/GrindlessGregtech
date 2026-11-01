// priority: -18000
// EV, LD-EV2 (RF-3S): the destination of metal mixture dust. GTM's centrifuge/stone_dust_separation gives 9.25 % metal mixture dust and the
// dump has no recipe that takes it (AGENTS.md rule 3). One EV centrifuge row:
//
//   metal_mixture_separation   1 metal mixture dust -> 1 small hematite + 1 small bauxite + 1 small pyrolusite + 1 small barite
//                              + 1 small chromite   (900 EU/t, 200 ticks)
//
// No ilmenite: titanium stays lunar (offworld_only.json strips it from GTM's old separation). Destinations: each small dust goes to its
// ore's usual line; the barite is electrolyzed by GTM's decomposition_electrolyzing_barite into barium, which LuV's ZBLAN mixer takes
// (luv/orbital_industry.js, 20 small barium dusts). The row must never be the cheapest route to a key item (the cost-matrix trace of
// chromium, aluminium and manganese ingots proves it).
ServerEvents.recipes(function (event) {
  event.recipes.gtceu.centrifuge('grindless:metal_mixture_separation')
    .itemInputs('gtceu:metal_mixture_dust')
    .itemOutputs('gtceu:small_hematite_dust', 'gtceu:small_bauxite_dust', 'gtceu:small_pyrolusite_dust',
      'gtceu:small_barite_dust', 'gtceu:small_chromite_dust')
    .EUt(900).duration(200)
})
