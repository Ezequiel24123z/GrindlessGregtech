// priority: -2424
// Gregtech Grindless - smoke test of the hiding of what cannot be obtained yet or ever (TEST-ONLY overlay: copied over the instance on
// the test PC, never shipped with the pack). Server half; the client half (EMI and JEI) is client_scripts/gg_test_hidden.js.
//
//   kubejs custom_command gg_test_hidden      ->  GGTEST|hidden|<check>|PASS|FAIL|NOTE ... and GGTEST|hidden|DONE
//
//   table           server_scripts/grindless/integration/hidden.js read kubejs/data/grindless/tables/hidden_until.json, is implemented up to UHV
//                   (v0.11.0's switch) and hides something
//   tag_b / tag_c   later-era items and a fluid (GCYR's station keycard, hidden exactly while tables/stations.json is off; GT--'s plutonium fuel, UIV; GCYR's drone hangar, never;
//                   Proxima b's regolith and the space elevator are shown since UHV) and junk (a GCYR satellite, scrap, damascus steel, molten stainless steel, GTCA's dead samarium-terbium branch, U-235's ore
//                   forms) are in #c:hidden_from_recipe_viewers
//   tag_recipes     they are in #grindless:hidden_with_recipes too (EMI hides their recipes); the old scheelite sample (keepRecipes) is not
//   visible         perlite dust, obsidian dust, the LV sifter, the Moon (titanium dust, raw ilmenite, moon sand, helium-3), Mars (its
//                   rock, scheelite, tungsten, merrillite, samarium, the samples, the Martian seed, the titanium drill bit) and IV (naquadah,
//                   Venus rock, iridosmine, uranium, U-235, the LEU assembly, the quantum star, the IV emitter, the inner planets chart, the
//                   elite tank; deuterium, heavy water, tritium, radon) are NOT hidden
//   perlite         the LV sifter recipe gives perlite from basalt dust, and perlite's electrolysis (-> obsidian dust) is still there
//   removed         junk recipes are gone: one from GTM's datapack, two the ore plant script adds (one for U-235's ore forms, junk since IV)
//                   and GTCA's samarium-terbium steps
//   kept            GT--'s circuit assembly line's recipe stays (visible since LuV landed, v0.8.0) and the old-save conversion of the legacy
//                   scheelite sample stays
//   counts          what hidden.js removed (NOTE)
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var T = 'GGTEST|hidden|'
  var TAG = 'c:hidden_from_recipe_viewers'
  var RECIPES_TAG = 'grindless:hidden_with_recipes'

  function log(check, status, detail) {
    var line = T + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/')
    console.info(line)
  }

  function check(name, ok, detail) {
    log(name, ok ? 'PASS' : 'FAIL', detail)
  }

  var K = null
  function classes() {
    if (K === null) {
      K = {
        RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
        TagKey: Java.loadClass('net.minecraft.tags.TagKey'),
        Registries: Java.loadClass('net.minecraft.core.registries.Registries'),
        BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
      }
    }
    return K
  }

  function itemHidden(id, tag) {
    return Item.of(id).hasTag(tag || TAG)
  }

  function fluidHidden(id, tag) {
    var k = classes()
    var key = k.TagKey.create(k.Registries.FLUID, new k.RL(tag || TAG))
    var fluid = k.BI.FLUID.get(new k.RL(id))
    return fluid.is(key)
  }

  function hasRecipe(server, id) {
    var k = classes()
    return server.getRecipeManager().byKey(new k.RL(id)).isPresent()
  }

  function run(server) {
    var H = global.grindless && global.grindless.hidden
    if (!H) {
      check('table', false, 'global.grindless.hidden is not published (hidden.js did not load)')
      return
    }
    check('table', H.groups.length > 0 && H.hidden.groups > 0 && H.implementedEra === 'uhv',
      H.groups.length + ' groups in the table, ' + H.hidden.groups + ' hidden (' + H.hidden.items.length + ' items, ' + H.hidden.fluids.length +
      ' fluids), implemented up to ' + H.implementedEra)

    var stationsOn = !!(global.grindless.stations && global.grindless.stations.enabled === true)
    check('tag_b', itemHidden('gcyr:keycard') === !stationsOn && fluidHidden('gtceu:plutonium_based_liquid_fuel') &&
      itemHidden('gcyr:drone_hangar'),
      'GCYR keycard (hidden exactly while the stations are off; stations ' + (stationsOn ? 'on' : 'off') + '), GT--\'s plutonium fuel (UIV), GCYR\'s drone hangar (never) hidden: ' + itemHidden('gcyr:keycard') +
      ' / ' + fluidHidden('gtceu:plutonium_based_liquid_fuel') + ' / ' + itemHidden('gcyr:drone_hangar'))
    check('tag_c', itemHidden('gtceu:damascus_steel_ingot') && itemHidden('gtca:scrap') && fluidHidden('gtceu:molten_stainless_steel') &&
      itemHidden('gtceu:terbium_dust') && itemHidden('gtca:samarium_terbium_mixture_dust') && itemHidden('gtceu:raw_uranium_235'),
      'damascus steel ingot, GTCA scrap, molten stainless steel, terbium, the samarium-terbium mixture hidden: ' + itemHidden('gtceu:damascus_steel_ingot') +
      ' / ' + itemHidden('gtca:scrap') + ' / ' + fluidHidden('gtceu:molten_stainless_steel') + ' / ' + itemHidden('gtceu:terbium_dust') + ' / ' +
      itemHidden('gtca:samarium_terbium_mixture_dust') + ', raw U-235 (no vein) ' + itemHidden('gtceu:raw_uranium_235'))
    var withRecipes = ['gcyr:gps_satellite', 'gtceu:damascus_steel_ingot', 'gtca:scrap'].filter(function (id) { return itemHidden(id, RECIPES_TAG) })
    var legacy = 'grindless:vein_sample_scheelite'
    check('tag_recipes', withRecipes.length === 3 && fluidHidden('gtceu:plutonium_based_liquid_fuel', RECIPES_TAG) && itemHidden(legacy) && !itemHidden(legacy, RECIPES_TAG),
      'in #' + RECIPES_TAG + ': ' + withRecipes.join(', ') + ', fluid plutonium fuel ' + fluidHidden('gtceu:plutonium_based_liquid_fuel', RECIPES_TAG) + '; old scheelite sample: #' +
      TAG + ' ' + itemHidden(legacy) + ', #' + RECIPES_TAG + ' ' + itemHidden(legacy, RECIPES_TAG) + ' (its conversion stays in view)')
    // perlite (LV source), the Moon (HV: titanium, ilmenite, its ground and helium-3), Mars (EV) and IV (the End's uranium, Venus, Mercury)
    // are obtainable: never hidden
    var visible = ['gtceu:perlite_dust', 'gtceu:obsidian_dust', 'gtceu:basalt_dust', 'gtceu:lv_sifter', 'gtceu:stainless_steel_ingot',
      'gtceu:titanium_dust', 'gtceu:raw_ilmenite', 'gcyr:moon_sand', 'grindless:titanium_drill_bit', 'gcyr:martian_rock', 'gtceu:raw_scheelite',
      'gtceu:tungsten_ingot', 'gtceu:merrillite_dust', 'gtceu:samarium_dust', 'grindless:vein_sample_scheelite_mars', 'grindless:martian_quantum_seed',
      'gtceu:naquadah_dust', 'gcyr:venus_rock', 'gtceu:raw_iridosmine', 'gtceu:uraninite_dust', 'gtceu:uranium_235_dust', 'grindless:leu_fuel_assembly',
      'gtceu:quantum_star', 'gtceu:iv_emitter', 'grindless:inner_planets_chart', 'gcyr:elite_fuel_tank',
      'gtnn:circuit_assembly_line', 'grindless:uv_smes_cell', 'gtca:space_elevator', 'gcyr:proxima_centauri_b_regolith', 'grindless:uhv_smes_cell', 'gtceu:trinium_ingot', 'grindless:chondritic_extract', 'gtceu:germanium_dust', 'grindless:asteroid_pgm_concentrate']
    var shown = visible.filter(function (id) { return !itemHidden(id) })
    var visibleFluids = ['minecraft:water', 'gtceu:helium_3', 'gtceu:liquid_nitrogen', 'gtceu:rare_earth_chloride_solution', 'gtceu:naquadah', 'gtceu:deuterium',
      'gtceu:heavy_water', 'gtceu:tritium', 'gtceu:radon', 'gtceu:molten_cerrobase_140', 'gtceu:bacteria', 'gtceu:europan_brine']
    var fluidsShown = visibleFluids.filter(function (id) { return !fluidHidden(id) })
    check('visible', shown.length === visible.length && fluidsShown.length === visibleFluids.length, 'not hidden: ' + shown.concat(fluidsShown).join(', ') +
      (shown.length === visible.length && fluidsShown.length === visibleFluids.length ? '' : ' (hidden: ' +
        visible.filter(function (id) { return shown.indexOf(id) < 0 }).concat(visibleFluids.filter(function (id) { return fluidsShown.indexOf(id) < 0 })).join(', ') + ')'))

    var sifter = 'grindless:sifter/lv/basalt_perlite'
    var electro = 'gtceu:electrolyzer/decomposition_electrolyzing_perlite'
    check('perlite', hasRecipe(server, sifter) && hasRecipe(server, electro), sifter + ': ' + hasRecipe(server, sifter) + ', ' + electro + ': ' +
      hasRecipe(server, electro))

    var gone = ['gtceu:electrolyzer/decomposition_electrolyzing_calcium_carbonate', 'grindless:ore_processing/mv/antimony_water',
      'grindless:ore_processing/mv/uranium_235_water', 'gtceu:chemical_reactor/smtb_to_nitrosmtb', 'gtceu:sifter/residue_to_smgd']
    var still = gone.filter(function (id) { return hasRecipe(server, id) })
    check('removed', still.length === 0, still.length === 0 ? 'gone: ' + gone.join(', ') : 'still there: ' + still.join(', '))

    var keep = ['grindless:crafting/empty_vein_probe_from_vein_sample_scheelite', 'gtnn:assembly_line/circuit_assembly_line']
    var lost = keep.filter(function (id) { return !hasRecipe(server, id) })
    check('kept', lost.length === 0, lost.length === 0 ? 'still there: ' + keep.join(', ') : 'missing: ' + lost.join(', '))

    var R = H.removed
    log('counts', R.original > 0 && R.added > 0 ? 'NOTE' : 'FAIL', 'listed ' + R.listed + ', removed ' + R.original + ' datapack + ' + R.added +
      ' script recipes, ' + R.missing + ' ids not found, ' + R.ms + ' ms; tagged ' + H.tagged.items + ' items and ' + H.tagged.fluids +
      ' fluids, ' + H.tagged.missing.length + ' ids not registered')
  }

  ServerEvents.customCommand('gg_test_hidden', function (event) {
    try {
      run(event.server)
    } catch (e) {
      log('script', 'FAIL', 'exception: ' + e)
    }
    console.info(T + 'DONE')
    return 1
  })
})()
