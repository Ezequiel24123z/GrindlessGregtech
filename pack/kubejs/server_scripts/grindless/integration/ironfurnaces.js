// priority: -15324
// -----------------------------------------------------------------------------------------------
// Iron Furnaces (ironfurnaces 1.20.1-4.1.6): tiered furnaces (copper, iron, silver, gold, diamond, emerald, crystal, obsidian, netherite)
// and the upgrade items that turn a placed furnace into the next tier in place, keeping its inventory, augments and progress
// (ItemUpgrade#useOn; from a vanilla furnace its three slots drop as items first). Their recipes stay as the mod has them, like
// Sophisticated Storage's metal tiers: plain smelting is not a progression gate here, and every furnace still cooks ordinary
// minecraft:smelting / blasting / smoking recipes, one item per input, so GT's ore processing keeps its lead.
// Speeds are ours (config/ironfurnaces-client.toml, from kubejs/data/grindless/tables/chest_furnace_tiers.json): every tier twice as
// fast as the mod's, the netherite furnace at the config's floor (2 ticks, x2.5). A fuel burns for burn time x cook time / 200, so the
// items per fuel are the vanilla furnace's in every tier (coal: 8); the speed augment halves the time and the fuel per item, the fuel
// augment doubles the items per fuel for 25 % more time.
//
// Removed (power is never free, AGENTS.md rule 8):
//   augment_generator   turns a furnace into an FE generator (ironfurnaces:generator_blasting: ingots and gems burnt for FE); with
//                       a Million furnace it emitted 50,000 FE/t with no fuel at all
//   augment_factory     an FE-powered furnace with up to six parallel slots
//   heater, item_heater the wireless FE heater that fuels furnaces from a distance
//   the Million (rainbow) furnace, its core and plating: also off in the config (misc.rainbow = false); removed by output here too
// Hidden in EMI (tag c:hidden_from_recipe_viewers): what is removed, rainbow coal (a web gift, off with misc.web = true) and the three
// All the Mods furnaces and upgrades (their recipes need the All the Mods metals, which the pack does not have).
// Era: Steam (ingots, a furnace, glass); the obsidian and netherite tiers wait for blaze rods and netherite, the crystal tier for an
// ender eye (MV in this pack).
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/ironfurnaces] '
  var REMOVED = ['augment_generator', 'augment_factory', 'heater', 'item_heater', 'million_furnace', 'rainbow_core', 'rainbow_plating']
  var UNOBTAINABLE = ['rainbow_coal', 'allthemodium_furnace', 'vibranium_furnace', 'unobtainium_furnace', 'upgrade_allthemodium', 'upgrade_vibranium',
    'upgrade_unobtainium']

  function ids(names) {
    return names.map(function (n) { return 'ironfurnaces:' + n }).filter(function (id) { return Item.exists(id) })
  }

  ServerEvents.recipes(function (event) {
    var removed = 0
    ids(REMOVED).forEach(function (id) {
      event.forEachRecipe({ output: id }, function () { removed++ })
      event.remove({ output: id })
    })
    var fuel = 0
    event.forEachRecipe({ type: 'ironfurnaces:generator_blasting' }, function () { fuel++ })
    event.remove({ type: 'ironfurnaces:generator_blasting' })
    console.info(LOG + 'removed ' + removed + ' recipes making ' + REMOVED.join(', ') + ' and ' + fuel + ' generator fuel recipes')
  })

  ServerEvents.tags('item', function (event) {
    ids(REMOVED.concat(UNOBTAINABLE)).forEach(function (id) { event.add('c:hidden_from_recipe_viewers', id) })
  })
})()
