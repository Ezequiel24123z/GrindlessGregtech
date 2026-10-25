// -----------------------------------------------------------------------------------------------
// Expanded AE (modId expandedae, CurseForge build 1.4.x; it builds on ExtendedAE and AE2WTLib) on the HV era
// (docs/eras/hv.md, "Mods and integration": coprocessors small at HV, the big ones wait for EV-IV).
// Era: HV.
//
// Every recipe only asks for AE2 parts, so the pacing is a GT circuit:
//   HV circuit    expanded crafting unit (base of every coprocessor), pattern providers and their upgrades, IO port, energy cell
//   EV circuit    giga pattern provider, x1k coprocessor
//   IV circuit    x32k coprocessor
//   LuV circuit   x1M coprocessor
// A coprocessor is two of the previous one (x2 = unit + engineering processor), so the steps in between carry the cost of
// the units; only these milestones add a circuit. Cards (auto-complete, priority, pattern refiller, greater acceleration)
// and the dual cells are left as they are.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/expandedae] '
  var HV = { tag: 'gtceu:circuits/hv' }
  var EV = { tag: 'gtceu:circuits/ev' }
  var IV = { tag: 'gtceu:circuits/iv' }
  var LUV = { tag: 'gtceu:circuits/luv' }
  var GATES = {
    'expandedae:crafting/exp_crafting_unit_ae': HV,
    'expandedae:crafting/exp_crafting_unit_mega': HV,
    'expandedae:crafting/exp_io_port_ae': HV,
    'expandedae:crafting/exp_io_port_ext': HV,
    'expandedae:crafting/exp_energy_cell_ae': HV,
    'expandedae:crafting/exp_energy_cell_mega': HV,
    'expandedae:crafting/exp_pattern_provider': HV,
    'expandedae:crafting/exp_pattern_provider_upgrade': HV,
    'expandedae:crafting/ext_pattern_provider_upgrade': HV,
    'expandedae:crafting/mega_pattern_provider_upgrade': HV,
    'expandedae:crafting/giga_pattern_provider': EV,
    'expandedae:crafting/exp_crafting_accelerator_1k': EV,
    'expandedae:crafting/exp_crafting_accelerator_32k': IV,
    'expandedae:crafting/exp_crafting_accelerator_1m': LUV
  }

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
    var captured = []
    event.forEachRecipe({ mod: 'expandedae' }, function (r) {
      var id = String(r.getId())
      if (GATES[id] === undefined) return
      try {
        captured.push({ id: id, json: JSON.parse(String(r.json)) })
      } catch (e) {
        console.error(LOG + 'cannot read ' + id + ': ' + e)
      }
    })

    var gated = 0
    captured.forEach(function (c) {
      if (addIngredient(c.json, GATES[c.id])) {
        event.remove({ id: c.id })
        event.custom(c.json).id(c.id)
        gated++
      } else {
        console.error(LOG + 'cannot add the circuit to ' + c.id)
      }
    })

    // With MEGA Cells installed the mod switches the expanded crafting unit to a MEGA-based recipe (conditions), which makes every
    // coprocessor an IV item through the accumulation processor. hv.md wants the small ones at HV, so the AE2-based recipe is
    // always available (with the HV circuit); the MEGA-based one stays as the other way in.
    event.custom({
      type: 'minecraft:crafting_shaped',
      category: 'misc',
      pattern: ['UPU', 'CLC', 'UPH'],
      key: {
        U: { item: 'ae2:crafting_unit' },
        P: { item: 'ae2:engineering_processor' },
        C: { item: 'ae2:fluix_smart_dense_cable' },
        L: { item: 'ae2:logic_processor' },
        H: HV
      },
      result: { item: 'expandedae:exp_crafting_unit' }
    }).id('grindless:expandedae/exp_crafting_unit_ae')
    console.info(LOG + 'circuit added to ' + gated + ' of ' + Object.keys(GATES).length + ' listed recipes; AE2-based expanded crafting unit (HV) added')
  })
})()
