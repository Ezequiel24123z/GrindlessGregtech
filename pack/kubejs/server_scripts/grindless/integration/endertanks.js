// -----------------------------------------------------------------------------------------------
// EnderTanks (endertanks, ShetiPhian): wireless fluid storage is an MV item, same rule as the EnderChests (see enderchests.js):
// no blaze rods or powder (the blaze is the End trip, MV since v0.5.0), the ender pearl from the LV creature simulator, aluminium plates and an MV circuit.
//   ender_bucket  3 iron + 1 pearl + 4 aluminium plates + wool
//   ender_tank    bucket + pearl + 3 aluminium plates + MV circuit + 2 obsidian + wool
// The recipe type endertanks:crafting is kept (it reads the colors of the wool), only the materials change.
// Era: MV (docs/eras/mv.md, "Mods and integration").
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    var PLATE = { tag: 'forge:plates/aluminium' }
    var CIRCUIT = { tag: 'gtceu:circuits/mv' }
    var PEARL = { tag: 'forge:ender_pearls' }
    var WOOL = { tag: 'minecraft:wool' }

    event.remove({ id: 'endertanks:bucket' })
    event.remove({ id: 'endertanks:tank' })

    event.custom({
      type: 'endertanks:crafting',
      group: 'endertanks:bucket',
      pattern: ['PIP', 'IEI', 'PWP'],
      key: { P: PLATE, I: { tag: 'forge:ingots/iron' }, E: PEARL, W: WOOL },
      result: { item: 'endertanks:ender_bucket' }
    }).id('endertanks:bucket')

    event.custom({
      type: 'endertanks:crafting',
      group: 'endertanks:tank',
      pattern: ['PWP', 'OBO', 'CEP'],
      key: { P: PLATE, W: WOOL, O: { item: 'minecraft:obsidian' }, B: { item: 'minecraft:bucket' }, E: PEARL, C: CIRCUIT },
      result: { item: 'endertanks:ender_tank' }
    }).id('endertanks:tank')
  })
})()
