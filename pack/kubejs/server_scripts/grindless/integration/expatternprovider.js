// priority: -14624
// -----------------------------------------------------------------------------------------------
// ExtendedAE (modId expatternprovider) on the HV era (docs/eras/hv.md, "Mods and integration"), except the wireless
// connector, re-gated to LV (DECISIONS.md, power pass): it is the cable-free option for whoever does not want to run
// GT cable, and AE2 itself (its only real requirement, see below) is already LV in this pack.
//
// ExtendedAE only uses AE2 parts, so it is reachable as soon as AE2 is (LV). The design puts the capacity and throughput
// items in HV: they get one HV circuit (#gtceu:circuits/hv), as a free slot of the grid or in place of one repeated part.
// Era: HV, except the wireless connector (LV, #gtceu:circuits/lv). The connector's other ingredients (engineering
// processor, wireless receiver, sky dust, smart cable) are all native AE2 items or come from the LV Submerged Arc
// Furnace (lv/arc_furnace.js); none of them is gated above LV in this pack.
//
//   gated with an HV circuit   x8 import/export bus (+ upgrade), wireless hub / tool, pattern modifier, extended pattern
//                              provider / interface / pattern access terminal (+ upgrades), extended drive, IO port,
//                              molecular assembler, charger, crafting terminal, oversize interface, wireless terminals
//   gated with an LV circuit   wireless connector
//   removed                    infinity cells (water, cobblestone: free resources), extended inscriber
//   left as is                 tag / mod / precise / threshold buses, level emitter, formation plane, packing tape, crystal fixer,
//                              ingredient buffer, caner, circuit cutter (same costs as AE2's inscriber), silicon block pair,
//                              part <-> block conversions. ExtendedAE's own recipes already need AE2 processors and cards.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/expatternprovider] '
  var GATE_HV = { tag: 'gtceu:circuits/hv' }
  var GATE_LV = { tag: 'gtceu:circuits/lv' }
  var GATED_HV = [
    'ebus_in', 'ebus_out', 'ebus_upgrade', 'ei', 'ei_upgrade', 'epp', 'epp_upgrade', 'epa', 'epa_upgrade',
    'ex_drive', 'ex_drive_upgrade', 'ex_io_port', 'ex_molecular_assembler', 'ex_charger', 'ex_crafting_terminal',
    'oversize_interface', 'pattern_modifier', 'wireless_hub', 'wireless_tool', 'wireless_ex_ct', 'wireless_ex_pat'
  ]
  var GATED_LV = ['wireless_connector']
  var REMOVED = ['cobblestone_cell', 'water_cell', 'ex_inscriber']

  // puts the ingredient into a crafting recipe (JS object): a free grid slot, a new row or column, or the place of one
  // of the most repeated symbols of a full 3x3 grid; shapeless recipes just get one more ingredient
  function addIngredient(json, ingredient) {
    if (json.type === 'forge:conditional') {
      var any = false
      json.recipes.forEach(function (c) { if (addIngredient(c.recipe, ingredient)) any = true })
      return any
    }
    if (json.type === 'minecraft:crafting_shapeless') {
      if (json.ingredients.length >= 9) return false
      json.ingredients.push(ingredient)
      return true
    }
    if (json.type !== 'minecraft:crafting_shaped') return false
    var letters = 'HQXYZWVUJ'
    var sym = null
    for (var l = 0; l < letters.length; l++) {
      if (json.key[letters.charAt(l)] === undefined) { sym = letters.charAt(l); break }
    }
    if (sym === null) return false
    var rows = json.pattern.slice()
    var width = 0
    rows.forEach(function (row) { if (row.length > width) width = row.length })
    rows = rows.map(function (row) { while (row.length < width) row += ' '; return row })
    var placed = false
    for (var r = 0; r < rows.length && !placed; r++) {
      var c = rows[r].indexOf(' ')
      if (c >= 0) {
        rows[r] = rows[r].substring(0, c) + sym + rows[r].substring(c + 1)
        placed = true
      }
    }
    if (!placed && rows.length < 3) {
      rows.push(sym + new Array(width).join(' '))
      placed = true
    }
    if (!placed && width < 3) {
      rows = rows.map(function (row, i) { return row + (i === 0 ? sym : ' ') })
      placed = true
    }
    if (!placed) {
      var counts = {}
      rows.forEach(function (row) {
        for (var k = 0; k < row.length; k++) counts[row.charAt(k)] = (counts[row.charAt(k)] || 0) + 1
      })
      var best = null
      Object.keys(counts).forEach(function (ch) {
        if (counts[ch] >= 2 && (best === null || counts[ch] > counts[best])) best = ch
      })
      if (best === null) return false
      for (var r2 = rows.length - 1; r2 >= 0 && !placed; r2--) {
        var at = rows[r2].lastIndexOf(best)
        if (at >= 0) {
          rows[r2] = rows[r2].substring(0, at) + sym + rows[r2].substring(at + 1)
          placed = true
        }
      }
    }
    json.pattern = rows
    json.key[sym] = ingredient
    return true
  }

  ServerEvents.recipes(function (event) {
    var wanted = {}
    GATED_HV.forEach(function (name) { wanted['expatternprovider:' + name] = 'hv' })
    GATED_LV.forEach(function (name) { wanted['expatternprovider:' + name] = 'lv' })
    var captured = []
    event.forEachRecipe({ mod: 'expatternprovider' }, function (r) {
      var id = String(r.getId())
      if (!wanted[id]) return
      try {
        captured.push({ id: id, tier: wanted[id], json: JSON.parse(String(r.json)) })
      } catch (e) {
        console.error(LOG + 'cannot read ' + id + ': ' + e)
      }
    })

    var gatedHv = 0
    var gatedLv = 0
    var missing = (GATED_HV.length + GATED_LV.length) - captured.length
    captured.forEach(function (c) {
      var gate = c.tier === 'lv' ? GATE_LV : GATE_HV
      if (addIngredient(c.json, gate)) {
        event.remove({ id: c.id })
        event.custom(c.json).id(c.id)
        if (c.tier === 'lv') gatedLv++
        else gatedHv++
      } else {
        console.error(LOG + 'cannot add the ' + (c.tier === 'lv' ? 'LV' : 'HV') + ' circuit to ' + c.id)
      }
    })

    REMOVED.forEach(function (name) { event.remove({ id: 'expatternprovider:' + name }) })
    console.info(LOG + 'HV circuit added to ' + gatedHv + ' recipes, LV circuit added to ' + gatedLv + ' recipes (' + missing +
      ' of the list not found); removed ' + REMOVED.join(', '))
  })
})()
