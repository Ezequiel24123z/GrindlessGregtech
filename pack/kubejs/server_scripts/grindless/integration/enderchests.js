// -----------------------------------------------------------------------------------------------
// EnderChests (enderchests, ShetiPhian): wireless storage is an MV item. The mod's recipes ask for blaze rods and powder (the
// blaze is the End trip: an MV creature since v0.5.0) and an ender EYE for the pouch.
// New cost: the ender PEARL that the LV creature simulator makes (automatic source), aluminium plates (MV) and an MV circuit.
//   ender_pouch  4 leather + 1 pearl                                (the part every ender item is made from)
//   ender_chest  pouch + 4 aluminium plates + MV circuit + 2 obsidian + wool
//   ender_bag    pouch + 4 aluminium plates + MV circuit + wool
// The recipe type enderchests:crafting is kept (it reads the colors of the wool), only the materials change.
// Era: MV (docs/eras/mv.md, "Mods and integration").
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    var PLATE = { tag: 'forge:plates/aluminium' }
    var CIRCUIT = { tag: 'gtceu:circuits/mv' }
    var PEARL = { tag: 'forge:ender_pearls' }
    var WOOL = { tag: 'minecraft:wool' }
    var OBSIDIAN = { item: 'minecraft:obsidian' }
    var LEATHER = { tag: 'forge:leather' }

    event.remove({ id: 'enderchests:ender_pouch' })
    event.remove({ id: 'enderchests:ender_chest' })
    event.remove({ id: 'enderchests:ender_bag' })

    event.custom({
      type: 'minecraft:crafting_shaped',
      pattern: [' L ', 'LEL', ' L '],
      key: { E: PEARL, L: LEATHER },
      result: { item: 'enderchests:ender_pouch' }
    }).id('enderchests:ender_pouch')

    event.custom({
      type: 'enderchests:crafting',
      group: 'enderchests:chest',
      pattern: ['PWP', 'OBO', 'PCP'],
      key: { P: PLATE, W: WOOL, O: OBSIDIAN, B: { item: 'enderchests:ender_pouch' }, C: CIRCUIT },
      result: { item: 'enderchests:ender_chest' }
    }).id('enderchests:ender_chest')

    event.custom({
      type: 'enderchests:crafting',
      group: 'enderchests:bag',
      pattern: ['PCP', ' B ', 'PWP'],
      key: { P: PLATE, W: WOOL, B: { item: 'enderchests:ender_pouch' }, C: CIRCUIT },
      result: { item: 'enderchests:ender_bag' }
    }).id('enderchests:ender_bag')
  })
})()
