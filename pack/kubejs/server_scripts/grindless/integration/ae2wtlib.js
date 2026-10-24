// -----------------------------------------------------------------------------------------------
// AE2WTLib / AE2 Wireless Terminals (ae2wtlib) and the Wireless Comprehensive Work Terminal (wcwt): wireless terminals are an MV
// item (docs/eras/mv.md: "bateria GT + circuito MV"). The AE2 internal battery (dense energy cell) is swapped for a GregTech MV
// battery (sodium, lithium or cadmium) and an MV circuit is added:
//   wireless pattern access terminal    wireless receiver + pattern access terminal + MV battery + MV circuit
//   wireless pattern encoding terminal  wireless receiver + pattern encoding terminal + MV battery + MV circuit
//   upgrade (wireless crafting terminal -> pattern encoding terminal)  + MV circuit
// The universal terminal combines/upgrades, the magnet card and the quantum bridge card keep their recipes: they are built from these
// terminals. The WCWT terminal and its cards are built from the terminals and AE2 cards, so they are gated through them.
// Not touched here: AE2's own wireless terminal and wireless crafting terminal (AE2 recipes, owned by the AE2 integration).
// Era: MV.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    var ids = ['ae2wtlib:wireless_pattern_access_terminal', 'ae2wtlib:wireless_pattern_encoding_terminal', 'gtceu:mv_sodium_battery', 'gtceu:mv_lithium_battery', 'gtceu:mv_cadmium_battery']
    var missing = ids.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/ae2wtlib] skipped, unknown items: ' + missing.join(', '))
      return
    }
    var BATTERY = [{ item: 'gtceu:mv_sodium_battery' }, { item: 'gtceu:mv_lithium_battery' }, { item: 'gtceu:mv_cadmium_battery' }]
    var CIRCUIT = { tag: 'gtceu:circuits/mv' }

    event.remove({ id: 'ae2wtlib:pattern_access/wireless_pattern_access_terminal' })
    event.custom({
      type: 'minecraft:crafting_shaped',
      pattern: ['ad', 'b ', 'c '],
      key: { a: { item: 'ae2:wireless_receiver' }, d: CIRCUIT, b: { item: 'ae2:pattern_access_terminal' }, c: BATTERY },
      result: { item: 'ae2wtlib:wireless_pattern_access_terminal' }
    }).id('ae2wtlib:pattern_access/wireless_pattern_access_terminal')

    event.remove({ id: 'ae2wtlib:pattern_encoding/wireless_pattern_encoding_terminal' })
    event.custom({
      type: 'minecraft:crafting_shaped',
      pattern: ['ad', 'b ', 'c '],
      key: { a: { item: 'ae2:wireless_receiver' }, d: CIRCUIT, b: { item: 'ae2:pattern_encoding_terminal' }, c: BATTERY },
      result: { item: 'ae2wtlib:wireless_pattern_encoding_terminal' }
    }).id('ae2wtlib:pattern_encoding/wireless_pattern_encoding_terminal')

    event.remove({ id: 'ae2wtlib:pattern_encoding/upgrade_wireless_pattern_encoding_terminal' })
    event.custom({
      type: 'minecraft:crafting_shapeless',
      ingredients: [{ item: 'ae2:wireless_crafting_terminal' }, { item: 'ae2:engineering_processor' }, CIRCUIT],
      result: { item: 'ae2wtlib:wireless_pattern_encoding_terminal' }
    }).id('ae2wtlib:pattern_encoding/upgrade_wireless_pattern_encoding_terminal')
  })
})()
