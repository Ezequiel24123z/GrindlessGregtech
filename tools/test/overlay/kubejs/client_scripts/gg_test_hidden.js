// priority: 12300
// Gregtech Grindless - client half of the hiding test (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the
// pack). Partner of server_scripts/gg_test_hidden.js. Asleep unless the instance has kubejs/config/gg_test_hidden.json = {"enabled": true}
// (copy the overlay to another folder, add the marker and run the harness with -Suite client -OverlayDir <that folder>).
//
// Once the player is in the world it keeps mc-runtime-test there (it quits when the player's tickCount reaches 100 with no screen open: the
// counter, `age` for scripts, is wound back) until EMI has finished loading, then checks what the player would see:
//   client_tag      the server's tags reached the client: a later-era and a junk item are in #c:hidden_from_recipe_viewers and
//                   #grindless:hidden_with_recipes; the old scheelite vein sample only in the first
//   client_index    EMI's index (EmiStackList.stacks) has no hidden item or fluid (nor the old sample), and has perlite dust, obsidian dust,
//                   the LV sifter, the Moon's titanium dust, moon sand and helium-3, Mars' rock and the titanium drill bit (EV), and IV's
//                   naquadah, Venus rock, iridosmine, U-235 and deuterium, and LuV's circuit assembly line, molten cerrobase 140, chondritic extract,
//                   germanium and bacteria (LuV is implemented since v0.8.0's switch, ZPM since v0.9.0's, 2026-10-27)
//   client_recipes  EMI shows no recipe that makes or uses a hidden item; it shows the LV sifter's perlite, perlite's electrolysis and the
//                   old sample's conversion into an empty vein probe
//   client_jei      JEI runs under EMI: its ingredient list and recipe screen are EMI's (JEMI), so JEI shows nothing of its own
//   client_chipped  a mod that only ships a JEI plugin reaches EMI: Chipped's workbench categories hold recipes and stone is used by one
//                   (with JEI 15.56 every one of them failed: EMI 1.1.22's JEMI slot builder lacks a method that JEI made abstract)
// GGTEST|hidden|client_<check>|PASS|FAIL|NOTE, and GGTEST|hidden|client_done when it lets the client go.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var MARKER = 'kubejs/config/gg_test_hidden.json'
  var T = 'GGTEST|hidden|'
  var TAG = 'c:hidden_from_recipe_viewers'
  var RECIPES_TAG = 'grindless:hidden_with_recipes'
  var LEGACY = 'grindless:vein_sample_scheelite'
  var CONVERSION = 'grindless:crafting/empty_vein_probe_from_vein_sample_scheelite'
  var HOLD_MAX_MS = 12 * 60 * 1000
  var c = { enabled: null, since: 0, done: false, errors: 0, ageField: null, waitedLog: 0 }

  function log(check, status, detail) {
    var line = T + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/')
    console.info(line)
  }

  function enabled() {
    if (c.enabled === null) {
      try {
        var m = JsonIO.read(MARKER)
        c.enabled = m !== null && m !== undefined && String(m.get('enabled')) === 'true'
      } catch (e) {
        c.enabled = false
      }
    }
    return c.enabled
  }

  // mc-runtime-test reads Entity#tickCount; KubeJS calls it `age`
  function windBack(p) {
    if (c.ageField === null) {
      var names = ['age', 'tickCount', 'f_19797_']
      c.ageField = ''
      for (var i = 0; i < names.length; i++) {
        var v = p[names[i]]
        if (v !== undefined && v !== null && typeof v !== 'function') {
          c.ageField = names[i]
          break
        }
      }
    }
    if (c.ageField !== '' && Number(p[c.ageField]) >= 80) p[c.ageField] = 20
  }

  function check() {
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var ItemEmiStack = Java.loadClass('dev.emi.emi.api.stack.ItemEmiStack')
    var FluidEmiStack = Java.loadClass('dev.emi.emi.api.stack.FluidEmiStack')
    var EmiApi = Java.loadClass('dev.emi.emi.api.EmiApi')
    var EmiStackList = Java.loadClass('dev.emi.emi.registry.EmiStackList')
    var EmiHidden = Java.loadClass('dev.emi.emi.runtime.EmiHidden')
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var ArrayList = Java.loadClass('java.util.ArrayList')
    // EMI hands out JDK immutable lists (ImmutableCollections$ListN); Rhino cannot call their methods (module access): copy them
    var jlist = function (c) { return new ArrayList(c) }

    var hiddenItems = ['gcyr:gps_satellite', 'gtceu:damascus_steel_ingot', 'gtca:scrap', 'gcyr:proxima_centauri_b_regolith']
    var hiddenFluids = ['gtceu:plutonium_based_liquid_fuel', 'gtceu:molten_stainless_steel']
    var shownItems = ['gtceu:perlite_dust', 'gtceu:obsidian_dust', 'gtceu:lv_sifter', 'gtceu:basalt_dust', 'gtceu:titanium_dust', 'gcyr:moon_sand',
      'gcyr:martian_rock', 'grindless:titanium_drill_bit', 'gtceu:naquadah_dust', 'gcyr:venus_rock', 'gtceu:raw_iridosmine', 'gtceu:uranium_235_dust',
      'gtnn:circuit_assembly_line', 'grindless:chondritic_extract', 'gtceu:germanium_dust', 'gcyr:keycard']
    var shownFluids = ['gtceu:helium_3', 'gtceu:deuterium', 'gtceu:naquadah', 'gtceu:molten_cerrobase_140', 'gtceu:bacteria']

    // 1) the tags reached the client
    var tagged = hiddenItems.filter(function (id) { return Item.of(id).hasTag(TAG) && Item.of(id).hasTag(RECIPES_TAG) })
    var legacyOk = Item.of(LEGACY).hasTag(TAG) && !Item.of(LEGACY).hasTag(RECIPES_TAG)
    log('client_tag', tagged.length === hiddenItems.length && legacyOk ? 'PASS' : 'FAIL', 'in #' + TAG + ' and #' + RECIPES_TAG + ' on the client: ' +
      tagged.join(', ') + (tagged.length === hiddenItems.length ? '' : ' (missing: ' + hiddenItems.filter(function (id) { return tagged.indexOf(id) < 0 }).join(', ') + ')') +
      '; old scheelite sample only in #' + TAG + ': ' + legacyOk)

    // 2) EMI's index
    var index = {}
    var list = jlist(EmiStackList.stacks)
    for (var i = 0; i < list.size(); i++) {
      var s = list.get(i)
      var kind = String(s.getClass().getSimpleName()).indexOf('Fluid') >= 0 ? 'fluid:' : ''
      index[kind + String(s.getId())] = true
    }
    var leaked = hiddenItems.concat([LEGACY]).filter(function (id) { return index[id] === true })
      .concat(hiddenFluids.filter(function (id) { return index['fluid:' + id] === true }))
    var lost = shownItems.filter(function (id) { return index[id] !== true })
      .concat(shownFluids.filter(function (id) { return index['fluid:' + id] !== true }))
    var disabledCount = jlist(EmiHidden.disabledStacks).size()
    log('client_index', leaked.length === 0 && lost.length === 0 && disabledCount > 0 ? 'PASS' : 'FAIL', 'EMI index of ' + list.size() + ' stacks; hidden ones shown: ' +
      (leaked.join(', ') || 'none') + '; visible ones missing: ' + (lost.join(', ') || 'none') + '; EMI disabled stacks (assets/emi/index/stacks): ' + disabledCount)

    // 3) EMI's recipes (made by / used by: the hidden stacks that are no member of a tag with visible items, else EMI rightly keeps the
    // recipes of the tag)
    var rm = EmiApi.getRecipeManager()
    var idsOf = function (recipes) {
      var all = jlist(recipes)
      var out = []
      for (var k = 0; k < all.size(); k++) {
        var rid = all.get(k).getId()
        out.push(rid === null ? '(no id)' : String(rid))
      }
      return out
    }
    var count = function (recipes) { return jlist(recipes).size() }
    // the constructors, not EmiStack.of: Rhino finds of(ItemStack) and of(ItemLike) equally good for a KubeJS item stack
    var stackOf = function (id) { return new ItemEmiStack(Item.of(id)) }
    var problems = []
    ;['gcyr:gps_satellite', 'gtceu:damascus_steel_ingot'].forEach(function (id) {
      var made = count(rm.getRecipesByOutput(stackOf(id)))
      var used = count(rm.getRecipesByInput(stackOf(id)))
      if (made + used > 0) problems.push(id + ' made by ' + made + ', used by ' + used)
    })
    hiddenFluids.forEach(function (id) {
      var fs = new FluidEmiStack(BI.FLUID.get(new RL(id)))
      var made = count(rm.getRecipesByOutput(fs))
      var used = count(rm.getRecipesByInput(fs))
      if (made + used > 0) problems.push('fluid ' + id + ' made by ' + made + ', used by ' + used)
    })
    var makesPerlite = idsOf(rm.getRecipesByOutput(stackOf('gtceu:perlite_dust')))
    var usesPerlite = idsOf(rm.getRecipesByInput(stackOf('gtceu:perlite_dust')))
    var sifter = makesPerlite.some(function (id) { return id.indexOf('basalt_perlite') >= 0 })
    var electro = usesPerlite.some(function (id) { return id.indexOf('decomposition_electrolyzing_perlite') >= 0 })
    if (!sifter) problems.push('no recipe makes perlite dust (' + makesPerlite.join(', ') + ')')
    if (!electro) problems.push('perlite electrolysis not shown (' + usesPerlite.slice(0, 8).join(', ') + ')')
    var usesLegacy = idsOf(rm.getRecipesByInput(stackOf(LEGACY)))
    var conversion = usesLegacy.indexOf(CONVERSION) >= 0
    if (!conversion) problems.push('the old sample conversion is not shown (uses of ' + LEGACY + ': ' + (usesLegacy.join(', ') || 'none') + ')')
    log('client_recipes', problems.length === 0 ? 'PASS' : 'FAIL', problems.length === 0
      ? 'EMI shows ' + count(rm.getRecipes()) + ' recipes; none makes or uses a hidden stack; perlite: ' + makesPerlite.join(', ') + ' -> ' +
        usesPerlite.filter(function (id) { return id.indexOf('electrolyzing') >= 0 }).join(', ') + '; old sample: ' + CONVERSION
      : problems.join('; '))

    // 4) JEI
    var jei = 'not loaded'
    var ok = true
    try {
      var JP = Java.loadClass('dev.emi.emi.jemi.JemiPlugin')
      var rt = JP.runtime
      if (rt === null || rt === undefined) {
        jei = 'JEI is installed but EMI has no JEI runtime'
        ok = false
      } else {
        var overlay = String(rt.getIngredientListOverlay().getClass().getName())
        var gui = String(rt.getRecipesGui().getClass().getName())
        ok = overlay.indexOf('emi') >= 0 && gui.indexOf('emi') >= 0
        jei = 'ingredient list ' + overlay + ', recipe screen ' + gui
      }
    } catch (e) {
      jei = 'JEMI not available: ' + e
    }
    log('client_jei', ok ? 'PASS' : 'FAIL', jei)

    // 5) Chipped (JEI plugin only, through JEMI)
    var chipped = []
    var chippedTotal = 0
    var cats = jlist(rm.getCategories())
    for (var ci = 0; ci < cats.size(); ci++) {
      var cid = String(cats.get(ci).getId())
      if (cid.indexOf('chipped:') !== 0) continue
      var n = count(rm.getRecipes(cats.get(ci)))
      chipped.push(cid + ' ' + n)
      chippedTotal += n
    }
    var stoneUses = jlist(rm.getRecipesByInput(stackOf('minecraft:stone')))
    var stoneInChipped = 0
    var sample = ''
    for (var si = 0; si < stoneUses.size(); si++) {
      var sr = stoneUses.get(si)
      var scat = String(sr.getCategory().getId())
      if (scat.indexOf('chipped:') !== 0) continue
      stoneInChipped++
      if (sample === '') {
        var outs = jlist(sr.getOutputs())
        var made = []
        for (var oi = 0; oi < outs.size() && made.length < 3; oi++) {
          var oid = String(outs.get(oi).getId())
          if (oid.indexOf('chipped:') === 0) made.push(oid)
        }
        sample = scat + ': minecraft:stone -> ' + outs.size() + ' outputs (' + made.join(', ') + (outs.size() > made.length ? ', ...' : '') + ')'
      }
    }
    log('client_chipped', chippedTotal > 0 && stoneInChipped > 0 ? 'PASS' : 'FAIL', 'Chipped categories in EMI: ' + (chipped.join(', ') || 'none') +
      '; ' + chippedTotal + ' recipes; ' + stoneInChipped + ' of them use stone' + (sample === '' ? '' : '; ' + sample))
  }

  function tick() {
    if (c.done || !enabled()) return
    var mc = Client
    var p = mc.player
    if (p === null || p === undefined) return
    if (c.since === 0) {
      c.since = Date.now()
      log('client_hold', 'NOTE', 'keeping mc-runtime-test in the world until EMI has loaded')
    }
    windBack(p)
    var ERM = Java.loadClass('dev.emi.emi.runtime.EmiReloadManager')
    if (!ERM.isLoaded()) {
      if (Date.now() - c.since > HOLD_MAX_MS) {
        c.done = true
        log('client_emi_loaded', 'FAIL', 'EMI did not finish loading in ' + (HOLD_MAX_MS / 60000) + ' min')
        log('client_done', 'NOTE', 'released')
      } else if (Date.now() - c.waitedLog > 60000) {
        c.waitedLog = Date.now()
        log('client_wait', 'NOTE', 'EMI still loading after ' + Math.round((Date.now() - c.since) / 1000) + ' s')
      }
      return
    }
    c.done = true
    log('client_emi_loaded', 'PASS', 'EMI loaded ' + Math.round((Date.now() - c.since) / 1000) + ' s after joining')
    try {
      check()
    } catch (e) {
      log('client_script', 'FAIL', 'exception: ' + e)
    }
    log('client_done', 'NOTE', 'released')
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 5) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
