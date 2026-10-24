// -----------------------------------------------------------------------------------------------
// Crafting-table recipes of the Steam Age drill / greenhouse line. Everything here is made by hand with bronze
// (and steel for the steel bit): no electricity involved.
//
//   steel / bronze drill bit   2 per craft, a file sharpens them
//   empty vein probe           3 bronze plates + glass
//   vein sample                empty probe + the two most common raw ores of the vein (shapeless, one recipe per vein;
//                              the pair of ores is unique for every vein, global.grindless.checkVeinTable() checks it).
//                              Raw ores come from the LP steam miner or one hand-mined swing, vanilla raw iron / copper /
//                              gold work too (forge:raw_materials tags).
//   Steam Vein Drill           built around GTM's LP steam miner
//   Steam Greenhouse           glass, a sapling and steam casings
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; lowercase letters are GT tool symbols (f file, w wrench...) and
// the tool is damaged, not consumed. Keys of ingredients are uppercase on purpose.
(function () {
  const G = global.grindless

  ServerEvents.recipes(function (event) {
    // ---- wear parts and probe
    event.recipes.gtceu.shaped('2x grindless:bronze_drill_bit', ['PfP', 'PRP', ' R '], {
      P: '#forge:plates/bronze',
      R: '#forge:rods/bronze'
    }).id('grindless:crafting/bronze_drill_bit')

    event.recipes.gtceu.shaped('2x grindless:steel_drill_bit', ['PfP', 'PRP', ' R '], {
      P: '#forge:plates/steel',
      R: '#forge:rods/steel'
    }).id('grindless:crafting/steel_drill_bit')

    event.recipes.gtceu.shaped('grindless:empty_vein_probe', ['PGP', ' P '], {
      P: '#forge:plates/bronze',
      G: '#forge:glass'
    }).id('grindless:crafting/empty_vein_probe')

    // ---- vein samples
    G.veinTable().forEach(function (vein) {
      event.shapeless(vein.sample, ['grindless:empty_vein_probe', vein.samplePair[0], vein.samplePair[1]])
        .id('grindless:crafting/vein_sample/' + vein.id)
    })

    // ---- controllers
    event.recipes.gtceu.shaped('gtceu:steam_vein_drill', ['PwP', 'GMG', 'SCS'], {
      P: '#forge:plates/bronze',
      G: '#forge:gears/bronze',
      M: 'gtceu:lp_steam_miner',
      S: 'gtceu:bronze_normal_fluid_pipe',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/steam_vein_drill')

    event.recipes.gtceu.shaped('gtceu:steam_greenhouse', ['GSG', 'PHP', 'CwC'], {
      G: '#forge:glass',
      S: '#minecraft:saplings',
      P: '#forge:plates/bronze',
      H: 'gtceu:bronze_machine_casing',
      C: 'gtceu:steam_machine_casing'
    }).id('grindless:crafting/steam_greenhouse')
  })
})()
