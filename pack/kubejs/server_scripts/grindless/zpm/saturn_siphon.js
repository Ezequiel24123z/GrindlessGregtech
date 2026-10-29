// priority: -27124
// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's Saturn siphon (machines: startup_scripts/grindless/zpm/saturn_siphon.js; docs/eras/zpm.md "Machines 18-20"; ZPM-B2).
// Every machine recipe carries .dimension('grindless:saturn_orbit') and its own programmed circuit (one recipe per lookup path).
//
//   gas_giant_siphon (survey = catalyst, scoop head worn: 25 = 0.25 % per run, as the cryobot of luv/europa.js)
//     circuit 1  16,000 mB hydrogen + 10,000 mB Saturn helium (the upper cloud deck's mix)
//     circuit 2  2,000 mB methane + 500 mB ammonia (the deck below, the ices)
//   cryogenic_isotope_separation
//     circuit 1  10,000 mB Saturn helium -> 20 mB helium-3 + 9,980 mB helium     (about 2 in 1,000: the game's ~14x of the real 1.4e-4)
//     circuit 2  16,000 mB hydrogen -> 50 mB deuterium + 15,950 mB hydrogen      (the loop is the column's own: hydrogen returns)
//     circuit 20 10,000 mB boron trifluoride -> 8,000 mB boron-11 + 2,000 mB boron-10 trifluoride (UEV-A7, line 25)
//   ring_harvesting (sail net worn, 0.25 % per run)
//     circuit 1  4,000 mB ring ice + 1 silicon dioxide dust (the silicate grit)
//     circuit 2  1 glass bottle -> 1 ring ice sample (the first run: the bottle is the sample jar)
// Destinations: helium is the usual helium (cryogenics, coolants), hydrogen/methane/ammonia feed the existing chemistry, ring ice melts into
// the AE2 pair's seed (travel.js) and the water lines; nothing is voided. Bulk deuterium and helium-3 exist only here and on Uranus.
// Support: scoop head and ring sail net assembler recipes (ZPM), the three controllers' crafting recipes, and a distillery melt of ring ice
// (grindless:ring_ice_melt: 1,000 mB -> 900 mB water + 100 mB ammonia) so the ice has a use.
// Published: global.grindless.saturnSiphon.recipes [{ name, type, recipeId, circuit, ... }], .skipped, .clashes.
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var SS = G.saturnSiphon || (G.saturnSiphon = {})

  var ZPM_VA = 122880
  var ORBIT = 'grindless:saturn_orbit'
  var SURVEY = 'grindless:jovian_atmosphere_survey'
  var SCOOP = 'grindless:scoop_head'
  var NET = 'grindless:ring_sail_net'
  var SAMPLE = 'grindless:ring_ice_sample'
  var BOTTLE = 'minecraft:glass_bottle'

  var TABLE = [
    { name: 'siphon_hydrogen_helium', type: 'gas_giant_siphon', circuit: 1,
      itemsIn: [], notConsumed: [SURVEY], worn: SCOOP,
      fluidsIn: [], fluidsOut: [{ id: 'gtceu:hydrogen', amount: 16000 }, { id: 'gtceu:saturn_helium', amount: 10000 }],
      itemsOut: [], eut: ZPM_VA, duration: 100 },
    { name: 'siphon_ices', type: 'gas_giant_siphon', circuit: 2,
      itemsIn: [], notConsumed: [SURVEY], worn: SCOOP,
      fluidsIn: [], fluidsOut: [{ id: 'gtceu:methane', amount: 2000 }, { id: 'gtceu:ammonia', amount: 500 }],
      itemsOut: [], eut: ZPM_VA, duration: 100 },
    { name: 'helium_three', type: 'cryogenic_isotope_separation', circuit: 1,
      itemsIn: [], notConsumed: [], worn: null,
      fluidsIn: [{ id: 'gtceu:saturn_helium', amount: 10000 }],
      fluidsOut: [{ id: 'gtceu:helium_3', amount: 20 }, { id: 'gtceu:helium', amount: 9980 }],
      itemsOut: [], eut: ZPM_VA, duration: 200 },
    { name: 'deuterium', type: 'cryogenic_isotope_separation', circuit: 2,
      itemsIn: [], notConsumed: [], worn: null,
      fluidsIn: [{ id: 'gtceu:hydrogen', amount: 16000 }],
      fluidsOut: [{ id: 'gtceu:deuterium', amount: 50 }, { id: 'gtceu:hydrogen', amount: 15950 }],
      itemsOut: [], eut: ZPM_VA, duration: 200 },
    // UEV-A7 (docs/eras/uev.md, line 25): natural boron trifluoride -> the boron-11 form (about 80 %) and the boron-10 form (about 20 %, the
    // hot cell's neutron shielding). Circuit 20: the column's circuits 1-5 are taken by the Saturn, Uranus and Neptune rows.
    { name: 'boron_11_trifluoride', type: 'cryogenic_isotope_separation', circuit: 20,
      itemsIn: [], notConsumed: [], worn: null,
      fluidsIn: [{ id: 'gtceu:boron_trifluoride', amount: 10000 }],
      fluidsOut: [{ id: 'gtceu:boron_11_trifluoride', amount: 8000 }, { id: 'gtceu:boron_10_trifluoride', amount: 2000 }],
      itemsOut: [], eut: ZPM_VA, duration: 200 },
    { name: 'ring_ice', type: 'ring_harvesting', circuit: 1,
      itemsIn: [], notConsumed: [], worn: NET,
      fluidsIn: [], fluidsOut: [{ id: 'gtceu:ring_ice', amount: 4000 }],
      itemsOut: [{ id: 'gtceu:silicon_dioxide_dust', count: 1 }], eut: ZPM_VA, duration: 100 },
    { name: 'ring_ice_sample', type: 'ring_harvesting', circuit: 2,
      itemsIn: [{ id: BOTTLE, count: 1 }], notConsumed: [], worn: NET,
      fluidsIn: [], fluidsOut: [],
      itemsOut: [{ id: SAMPLE, count: 1 }], eut: ZPM_VA, duration: 100 }
  ]

  SS.recipes = TABLE.map(function (t) {
    t.recipeId = 'grindless:' + t.type + '/' + t.name
    t.id = 'grindless:' + t.name
    return t
  })
  SS.skipped = []
  SS.clashes = []

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.notConsumed.forEach(function (x) { keys['n:' + x] = true })
    if (r.worn) keys['w:' + r.worn] = true
    r.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    keys['circuit:' + r.circuit] = true
    return keys
  }

  function clashes() {
    var out = []
    for (var i = 0; i < SS.recipes.length; i++) {
      for (var j = i + 1; j < SS.recipes.length; j++) {
        if (SS.recipes[i].type !== SS.recipes[j].type) continue
        if (SS.recipes[i].circuit === SS.recipes[j].circuit) out.push(SS.recipes[i].name + ' / ' + SS.recipes[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.map(function (x) { return x.id }).concat(r.itemsOut.map(function (x) { return x.id }), r.notConsumed)
    if (r.worn) items.push(r.worn)
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addMachineRecipes(event) {
    SS.clashes = clashes()
    if (SS.clashes.length > 0) console.error(LOG + 'saturn siphon recipes clash in the lookup: ' + SS.clashes.join(', '))
    SS.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        SS.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'saturn siphon skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu[r.type](r.id)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
      if (r.worn) recipe.chancedInput('1x ' + r.worn, 25, 0)
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.dimension(ORBIT).EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'saturn siphon recipes added: ' + (SS.recipes.length - SS.skipped.length))
  }

  // ASSEMBLER: the two worn tools (ZPM, no UV inputs)
  function addTools(event) {
    var need = ['gtceu:hsss_plate', 'gtceu:naquadah_plate', 'gtceu:zpm_electric_pump', 'gcyr:para_aramid_foil', 'gtceu:titanium_plate', SCOOP, NET]
    var missing = need.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'saturn siphon tool recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:scoop_head')
      .itemInputs('4x gtceu:hsss_plate', '2x gtceu:naquadah_plate', '1x gtceu:zpm_electric_pump', '1x grindless:hss_s_drill_bit', '1x grindless:anchor_harpoon')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 144))
      .circuit(1).itemOutputs('1x ' + SCOOP).EUt(ZPM_VA).duration(200)
    event.recipes.gtceu.assembler('grindless:ring_sail_net')
      .itemInputs('8x gcyr:para_aramid_foil', '4x gtceu:titanium_plate', '1x grindless:anchor_harpoon', '1x grindless:whipple_shield_casing', '1x grindless:night_sky_radiator')
      .inputFluids(Fluid.of('gtceu:polyethylene', 144), Fluid.of('gtceu:lubricant', 100))
      .circuit(2).itemOutputs('1x ' + NET).EUt(ZPM_VA).duration(200)
  }

  // ASSEMBLY LINE with scanner research: hull + the machine's own parts + 4 ZPM circuits + two domain parts + soldering alloy + lubricant
  function addCrafting(event) {
    var HULL = 'gtceu:zpm_machine_hull'
    var list = [
      { id: 'gtceu:gas_giant_siphon', parts: ['2x gtceu:zpm_electric_pump', '2x gtceu:zpm_electric_motor'], domain: ['grindless:cryogenic_fuel_tank', 'grindless:magnetic_bearing'], research: 'grindless:radiation_vault_casing' },
      { id: 'gtceu:isotope_column', parts: ['2x gtceu:zpm_electric_pump'], domain: ['grindless:ion_exchange_resin', 'grindless:leu_pellet'], research: 'grindless:molten_salt_charge' },
      { id: 'gtceu:ring_harvester', parts: ['2x gtceu:zpm_conveyor_module'], domain: ['grindless:anchor_harpoon', 'grindless:asteroid_regolith_casing'], research: 'grindless:platinum_gauze' }
    ]
    list.forEach(function (m) {
      var inputs = [HULL].concat(m.parts, ['4x #gtceu:circuits/zpm'], m.domain.map(function (d) { return '2x ' + d }))
      var parts = inputs.concat([m.research, m.id]).map(function (v) { return v.replace(/^\d+x /, '') }).filter(function (v) { return v.charAt(0) !== '#' })
      var missing = parts.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'saturn siphon crafting of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + m.id.split(':')[1])
      inputs.forEach(function (x) { b.itemInputs(x) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000))
      b.itemOutputs(m.id)
      b.scannerResearch(Item.of(m.research))
      b.EUt(ZPM_VA).duration(1200)
    })
  }

  // DISTILLERY: the ring ice's use (rule 3: every product has a destination); water and the ices' ammonia go to the usual chemistry
  function addMelt(event) {
    if (!Fluid.exists('gtceu:ring_ice') || !Fluid.exists('gtceu:ammonia')) {
      console.error(LOG + 'ring ice melt skipped, unknown fluid')
      return
    }
    event.recipes.gtceu.distillery('grindless:ring_ice_melt')
      .inputFluids(Fluid.of('gtceu:ring_ice', 1000)).circuit(1)
      .outputFluids(Fluid.of('minecraft:water', 900), Fluid.of('gtceu:ammonia', 100))
      .EUt(480).duration(100)
  }

  ServerEvents.recipes(function (event) {
    try { addMachineRecipes(event) } catch (e) { console.error(LOG + 'saturn siphon recipes failed: ' + e) }
    try { addTools(event) } catch (e2) { console.error(LOG + 'saturn siphon tool recipes failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'saturn siphon crafting failed: ' + e3) }
    try { addMelt(event) } catch (e4) { console.error(LOG + 'ring ice melt failed: ' + e4) }
  })
})()
