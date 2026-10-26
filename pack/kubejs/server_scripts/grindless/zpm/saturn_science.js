// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's Saturn science (machines: startup_scripts/grindless/zpm/saturn_science.js; docs/eras/zpm.md "Machines 23-24"; ZPM-B4).
// Every machine recipe carries .dimension('grindless:saturn_orbit') and its own programmed circuit (one recipe per lookup path).
//
//   plume_sampling (Plume Sampler)
//     circuit 1  1 aerogel cartridge (consumed) -> 2,000 mB Enceladus brine + 4 silica nanograins + 250 mB hydrogen, 122,880 EU/t x 400 t
//   kronoseismology (Ring Seismometer)
//     circuit 1  1 data orb + the Saturn transfer chart (NOT consumed: the station's track fixes the occultation geometry) + 100 mB liquid
//                helium (the photometer's cryostat) -> 1 Saturn interior model, 122,880 EU/t x 6,000 t
//     circuit 2  1 data orb + the Saturn interior model (NOT consumed) -> 1 Uranus transfer chart, 122,880 EU/t x 6,000 t
//   gtceu:assembler (ZPM), the cartridge's two routes: from silica aerogel (the loop: one cartridge's four grains become four aerogel,
//     so one flight pays for the next four) and the first one from Earth's silica dust, the seed of the loop.
//   crafting: the two controllers, and the copies of the interior model and the Uranus chart (one + data orb -> 2, the observatory
//     family's rule as luv/ganymede.js).
// Destinations: brine feeds the vent bioreactor's culture and growth medium (outer_chemistry.js), the nanograins the aerogel works (and so the
// next cartridges), the hydrogen the bioreactor; the interior model and the chart are catalysts (siphon, level 6 tank) and are never used up.
// Published: global.grindless.zpmSaturnScience.recipes [{ name, type, recipeId, circuit, ... }], .skipped, .clashes.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var SC = G.zpmSaturnScience || (G.zpmSaturnScience = {})

  var ZPM_VA = 122880
  var ORBIT = 'grindless:saturn_orbit'
  var CARTRIDGE = 'grindless:aerogel_cartridge'
  var NANOGRAINS = 'grindless:silica_nanograins'
  var MODEL = 'grindless:saturn_interior_model'
  var URANUS_CHART = 'grindless:uranus_transfer_chart'
  var SATURN_CHART = 'grindless:saturn_transfer_chart'
  var ORB = 'gtceu:data_orb'

  SC.items = { cartridge: CARTRIDGE, nanograins: NANOGRAINS, model: MODEL, uranusChart: URANUS_CHART, saturnChart: SATURN_CHART, dataOrb: ORB }

  var TABLE = [
    { name: 'plume_sample', type: 'plume_sampling', circuit: 1,
      itemsIn: [{ id: CARTRIDGE, count: 1 }], notConsumed: [],
      fluidsIn: [], fluidsOut: [{ id: 'gtceu:enceladus_brine', amount: 2000 }, { id: 'gtceu:hydrogen', amount: 250 }],
      itemsOut: [{ id: NANOGRAINS, count: 4 }], eut: ZPM_VA, duration: 400 },
    { name: 'saturn_interior_model', type: 'kronoseismology', circuit: 1,
      itemsIn: [{ id: ORB, count: 1 }], notConsumed: [SATURN_CHART],
      fluidsIn: [{ id: 'gtceu:liquid_helium', amount: 100 }], fluidsOut: [],
      itemsOut: [{ id: MODEL, count: 1 }], eut: ZPM_VA, duration: 6000 },
    { name: 'uranus_transfer_chart', type: 'kronoseismology', circuit: 2,
      itemsIn: [{ id: ORB, count: 1 }], notConsumed: [MODEL],
      fluidsIn: [], fluidsOut: [],
      itemsOut: [{ id: URANUS_CHART, count: 1 }], eut: ZPM_VA, duration: 6000 }
  ]

  SC.recipes = TABLE.map(function (t) {
    t.recipeId = 'grindless:' + t.type + '/' + t.name
    t.id = 'grindless:' + t.name
    return t
  })
  SC.skipped = []
  SC.clashes = []

  function clashes() {
    var out = []
    for (var i = 0; i < SC.recipes.length; i++) {
      for (var j = i + 1; j < SC.recipes.length; j++) {
        if (SC.recipes[i].type !== SC.recipes[j].type) continue
        if (SC.recipes[i].circuit === SC.recipes[j].circuit) out.push(SC.recipes[i].name + ' / ' + SC.recipes[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.map(function (x) { return x.id }).concat(r.itemsOut.map(function (x) { return x.id }), r.notConsumed)
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addMachineRecipes(event) {
    SC.clashes = clashes()
    if (SC.clashes.length > 0) console.error(LOG + 'saturn science recipes clash in the lookup: ' + SC.clashes.join(', '))
    SC.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        SC.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'saturn science skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu[r.type](r.id)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.dimension(ORBIT).EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'saturn science recipes added: ' + (SC.recipes.length - SC.skipped.length))
  }

  // ASSEMBLER: the aerogel capture cartridge, from the aerogel (the loop) and from Earth's silica (the first one)
  function addCartridge(event) {
    var need = ['grindless:silica_aerogel', 'gtceu:silicon_dioxide_dust', 'gtceu:titanium_plate', 'gcyr:para_aramid_foil', CARTRIDGE]
    var missing = need.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'aerogel cartridge recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:aerogel_cartridge')
      .itemInputs('1x grindless:silica_aerogel', '1x gtceu:titanium_plate', '1x gcyr:para_aramid_foil')
      .circuit(1).itemOutputs('1x ' + CARTRIDGE).EUt(ZPM_VA).duration(100)
    event.recipes.gtceu.assembler('grindless:aerogel_cartridge_first')
      .itemInputs('16x gtceu:silicon_dioxide_dust', '1x gtceu:titanium_plate', '2x gcyr:para_aramid_foil')
      .circuit(2).itemOutputs('1x ' + CARTRIDGE).EUt(ZPM_VA).duration(600)
  }

  // CRAFTING TABLE: hull + the machine's own parts + 4 ZPM circuits, and the data copies
  function addCrafting(event) {
    var HULL = 'gtceu:zpm_machine_hull'
    var list = [
      { id: 'gtceu:plume_sampler', pattern: ['CRC', ' H ', 'CSC'], extra: { R: 'gtceu:zpm_robot_arm', S: 'gtceu:zpm_sensor' } },
      { id: 'gtceu:ring_seismometer', pattern: ['CSC', ' H ', 'CSC'], extra: { S: 'gtceu:zpm_sensor' } }
    ]
    list.forEach(function (m) {
      var keys = { C: '#gtceu:circuits/zpm', H: HULL }
      Object.keys(m.extra).forEach(function (k) { keys[k] = m.extra[k] })
      var parts = Object.keys(keys).map(function (k) { return keys[k] }).filter(function (v) { return v.charAt(0) !== '#' })
      var missing = parts.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'saturn science crafting of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(m.id, m.pattern, keys).id('grindless:crafting/' + m.id.split(':')[1])
    })
    ;[[MODEL, 'saturn_interior_model_copy'], [URANUS_CHART, 'uranus_transfer_chart_copy']].forEach(function (c) {
      if (!Item.exists(c[0]) || !Item.exists(ORB)) {
        console.error(LOG + 'copy of ' + c[0] + ' skipped, unknown item')
        return
      }
      event.shapeless('2x ' + c[0], [c[0], ORB]).id('grindless:crafting/' + c[1])
    })
  }

  ServerEvents.recipes(function (event) {
    try { addMachineRecipes(event) } catch (e) { console.error(LOG + 'saturn science recipes failed: ' + e) }
    try { addCartridge(event) } catch (e2) { console.error(LOG + 'aerogel cartridge recipes failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'saturn science crafting failed: ' + e3) }
  })
})()
