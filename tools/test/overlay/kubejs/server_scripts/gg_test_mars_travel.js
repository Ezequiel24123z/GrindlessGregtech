// priority: -5354
// Gregtech Grindless - test of the Mars travel package (B5a, end of EV). TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped with the pack.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_mars_travel;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|mars_travel\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// What is new is checked here; the rest reuses proven mechanisms (GTM's assembler, crafting recipes, GT materials, the vein event that
// put the lunar vein on the Moon) and is covered by the dump and the validator.
// Markers: GGTEST|mars_travel|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|mars_travel|DONE.
//   static (no world)
//     registry          the ice material (ore and dust, no decomposition, no ore smelting, byproducts gypsum and salt), its forms, the
//                       three Mars samples and their two tags
//     tables            global.grindless.mars.checkTables(): ids, shares, raw ores, Mars ore blocks, stone, sample pairs unique in the pack
//     samples           the three sample recipes under their final ids: the empty vein probe + the two raw ores of the vein
//     rocket_parts      GCYR's IV recipes of the advanced tank and motor are gone; ours are EV assembler recipes (1,920 EU/t, 300 t) with
//                       titanium, Kapton K and advanced thrusters, the Mars chart not used up; no other assembler recipe makes them
//     planets           GCYR's planet data after our datapack: Venus and Mercury rocket_tier 3 (the rest of their file unchanged), Mars 2,
//                       the Moon 1: a tier 2 rocket reaches the Moon and Mars and nothing else
//     no_decomposition  no electrolyzer, centrifuge or furnace recipe takes the ice
//     worldgen          GTM's live vein registry: the veins that can generate on Mars are exactly the three of veins_mars.json, with the
//                       'mars' layer and their materials; no GCYR vein is left anywhere
//   in the world: gcyr:mars, band X 7936..7999, Z 0..15 (force-loaded while the test runs; nothing is built, Y 198..214 is reserved)
//     mars_level        gcyr:mars is loaded; the surface height and block in the middle of the band
//     mars_ores         freshly generated Martian chunks of the band's X range (chunks 496..499, Z -12..11: read only) hold the ores of
//                       our three veins and no other ore
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
(function () {
  var SCOPE = 'mars_travel'
  var MARS = 'gcyr:mars'
  var BAND = { x0: 7936, x1: 7999, z0: 0, z1: 15 }
  var SCAN = { cx0: 496, cx1: 499, cz0: -12, cz1: 11, perTick: 4 }
  var CHART = 'grindless:mars_chart'

  var S = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = 'GGTEST|' + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function safely(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- helpers

  function asArray(coll) {
    if (coll === null || coll === undefined) return []
    var AL = Java.loadClass('java.util.ArrayList')
    var list = new AL(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function byId(server, id) {
    var opt = server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function itemCap() {
    return Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
  }

  // the item contents of one side of a GT recipe: [{ id: item or #tag, count, chance }]
  function gtItems(list) {
    return asArray(list).map(function (c) {
      var j = null
      try {
        j = JSON.parse(String(c.content.toJson()))
      } catch (e) {
        return { id: '?', count: 0, chance: Number(c.chance) }
      }
      var ing = j.ingredient || j
      var id = ing.item ? String(ing.item) : (ing.tag ? '#' + String(ing.tag) : '?')
      return { id: id, count: Number(j.count || 1), chance: Number(c.chance) }
    })
  }

  function describe(list) {
    return list.map(function (x) { return x.count + 'x ' + x.id + (x.chance === 0 ? ' (not consumed)' : '') }).sort().join(', ')
  }

  function ingredientsText(r) {
    return asArray(r.getIngredients()).map(function (ing) {
      try {
        return String(ing.toJson())
      } catch (e) {
        return '?'
      }
    }).join(' ')
  }

  function recipesOfType(server, typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? asArray(server.getRecipeManager().getAllRecipesFor(type)) : []
  }

  function veins() {
    var M = global.grindless.mars
    return M && typeof M.martianVeins === 'function' ? M.martianVeins() : []
  }

  function dimensionsOf(def) {
    var out = []
    var set = def.dimensionFilter()
    if (set == null) return out
    var it = set.iterator()
    while (it.hasNext()) out.push(String(it.next().location()))
    return out
  }

  function materialsOf(def) {
    try {
      return asArray(def.veinGenerator().getAllMaterials()).map(function (m) { return String(m.getName()) }).sort()
    } catch (e) {
      return []
    }
  }

  // ---------------------------------------------------------------- static checks

  function checkRegistry() {
    var MT = global.grindless.marsTravel
    var problems = []
    var mat = GTMaterials.get(MT.materials.ice)
    if (mat == null || mat.isNull()) problems.push('material ' + MT.materials.ice + ' not registered')
    else {
      if (!mat.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('the ice decomposes')
      if (!mat.hasFlag(GTMaterialFlags.NO_ORE_SMELTING)) problems.push('the ice ore smelts')
      if (mat.getProperty(PropertyKey.DUST) == null) problems.push('no dust property')
      var ore = mat.getProperty(PropertyKey.ORE)
      if (ore == null) problems.push('no ore property')
      else {
        var by = asArray(ore.getOreByProducts()).map(function (m) { return String(m.getName()) }).sort().join(',')
        if (by !== 'gypsum,salt') problems.push('byproducts ' + by)
      }
    }
    var items = [MT.ids.iceRaw, MT.ids.iceDust, MT.ids.iceMarsOre, 'gtceu:crushed_deuterium_rich_ice_ore', 'gtceu:purified_deuterium_rich_ice_ore',
      'gtceu:refined_deuterium_rich_ice_ore', 'gtceu:impure_deuterium_rich_ice_dust', 'gtceu:pure_deuterium_rich_ice_dust',
      'gtceu:raw_deuterium_rich_ice_block', MT.ids.probe, CHART].concat(MT.samples)
    var missing = items.filter(function (id) { return !Item.exists(id) })
    var all = asArray(Ingredient.of('#grindless:vein_samples').getItemIds()).map(String)
    var mars = asArray(Ingredient.of('#grindless:martian_vein_samples').getItemIds()).map(String)
    MT.samples.forEach(function (id) {
      if (all.indexOf(id) < 0) problems.push(id + ' not in #grindless:vein_samples')
      if (mars.indexOf(id) < 0) problems.push(id + ' not in #grindless:martian_vein_samples')
    })
    if (mars.length !== MT.samples.length) problems.push('#grindless:martian_vein_samples has ' + mars.length + ' items')
    var formula = mat != null && !mat.isNull() ? String(mat.getChemicalFormula()) : '?'
    check('registry', problems.length === 0 && missing.length === 0, (problems.concat(missing.map(function (id) { return 'missing ' + id }))).join('; ') ||
      'deuterium_rich_ice: ore + dust, no decomposition, no ore smelting, byproducts gypsum and salt, formula ' + formula + '; ' +
      (items.length) + ' items present; samples ' + MT.samples.join(', ') + ' in both tags')
  }

  function checkTables() {
    var M = global.grindless.mars || {}
    var problems = typeof M.checkTables === 'function' ? M.checkTables() : ['global.grindless.mars.checkTables is missing']
    var list = veins()
    check('tables', problems.length === 0 && list.length === 3, list.map(function (v) {
      return v.id + ' (' + v.ores.map(function (o) { return o.material + ' ' + Math.round(o.share * 1000) / 10 + '%' }).join(', ') +
        '; Y ' + v.minY + '..' + v.maxY + '; sample ' + v.samplePair.join(' + ').replace(/#forge:raw_materials\//g, 'raw ') + ')'
    }).join('; ') + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkSamples(server) {
    var problems = []
    var details = []
    veins().forEach(function (v) {
      var id = 'grindless:crafting/vein_sample/' + v.id
      var r = byId(server, id)
      if (r === null) {
        problems.push('missing ' + id)
        return
      }
      var text = ingredientsText(r)
      var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
      var out = String(BI.ITEM.getKey(r.getResultItem(server.registryAccess()).getItem()))
      if (text.indexOf('grindless:empty_vein_probe') < 0) problems.push(id + ' has no probe')
      v.samplePair.forEach(function (p) {
        if (text.indexOf(p.replace(/^#/, '')) < 0) problems.push(id + ' lacks ' + p)
      })
      if (out !== v.sample) problems.push(id + ' gives ' + out)
      details.push(id + ' -> ' + out)
    })
    check('samples', problems.length === 0 && details.length === 3, details.join('; ') + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkRocketParts(server) {
    var MR = global.grindless.marsRoad
    var problems = []
    var details = []
    if (!MR || !MR.recipes) {
      check('rocket_parts', false, 'global.grindless.marsRoad is missing')
      return
    }
    var RecipeHelper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
    var cap = itemCap()
    ;['tank', 'motor'].forEach(function (key) {
      var spec = MR.recipes[key]
      if (byId(server, spec.gcyrId) !== null) problems.push(spec.gcyrId + ' (GCYR, IV) still loaded')
      var r = byId(server, spec.id)
      if (r === null) {
        problems.push('missing ' + spec.id)
        return
      }
      var ins = gtItems(r.getInputContents(cap))
      var outs = gtItems(r.getOutputContents(cap))
      var eut = Number(RecipeHelper.getRealEUt(r).getTotalEU())
      var want = spec.itemsIn.map(function (e) { return e.n + 'x ' + e.id }).concat(['1x ' + spec.catalyst + ' (not consumed)']).sort().join(', ')
      if (describe(ins) !== want) problems.push(spec.id + ' inputs ' + describe(ins) + ' (wanted ' + want + ')')
      if (describe(outs) !== '1x ' + spec.itemsOut[0].id) problems.push(spec.id + ' outputs ' + describe(outs))
      if (eut !== spec.eut) problems.push(spec.id + ' runs at ' + eut + ' EU/t')
      if (Number(r.duration) !== spec.duration) problems.push(spec.id + ' lasts ' + r.duration + ' t')
      details.push(spec.id + ': ' + describe(ins) + ' -> ' + describe(outs) + ', ' + eut + ' EU/t, ' + r.duration + ' t')
    })
    // ours are assembler recipes, and nothing else in the assembler makes the advanced parts (GTM, GCYR's IV recipes or an addon)
    var makers = {}
    recipesOfType(server, 'gtceu:assembler').forEach(function (r) {
      gtItems(r.getOutputContents(cap)).forEach(function (o) {
        if (o.id === 'gcyr:advanced_fuel_tank' || o.id === 'gcyr:advanced_rocket_motor') {
          makers[o.id] = (makers[o.id] || []).concat([String(r.getId())])
        }
      })
    })
    ;['tank', 'motor'].forEach(function (key) {
      var spec = MR.recipes[key]
      var list = makers[spec.itemsOut[0].id] || []
      if (list.length !== 1 || list[0] !== spec.id) problems.push(spec.itemsOut[0].id + ' made by ' + (list.join(', ') || 'nothing'))
    })
    check('rocket_parts', problems.length === 0, details.join(' ; ') + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkPlanets() {
    var PlanetData = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
    var tiers = {}
    var all = []
    asArray(PlanetData.planets().entrySet()).forEach(function (e) {
      var id = String(e.getKey())
      tiers[id] = Number(e.getValue().rocketTier())
      all.push(id + '=' + tiers[id])
    })
    var reach = Object.keys(tiers).filter(function (id) { return tiers[id] <= 2 && id !== 'gcyr:earth' }).sort()
    var venus = PlanetData.getPlanet(rl('gcyr:venus'))
    var mercury = PlanetData.getPlanet(rl('gcyr:mercury'))
    var problems = []
    if (tiers['gcyr:venus'] !== 3) problems.push('venus ' + tiers['gcyr:venus'])
    if (tiers['gcyr:mercury'] !== 3) problems.push('mercury ' + tiers['gcyr:mercury'])
    if (tiers['gcyr:mars'] !== 2) problems.push('mars ' + tiers['gcyr:mars'])
    if (tiers['gcyr:luna'] !== 1) problems.push('luna ' + tiers['gcyr:luna'])
    if (reach.join(',') !== 'gcyr:luna,gcyr:mars') problems.push('a tier 2 rocket reaches ' + reach.join(','))
    // the rest of GCYR's two files is unchanged (temperature, gravity, oxygen)
    if (venus === null || Number(venus.temperature()) !== 737 || venus.hasOxygen()) problems.push('venus data changed')
    if (mercury === null || Number(mercury.temperature()) !== 440 || mercury.hasOxygen()) problems.push('mercury data changed')
    check('planets', problems.length === 0, 'a tier 2 rocket reaches ' + reach.join(', ') + ' | rocket tiers: ' + all.sort().join(' ') +
      (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  function checkNoDecomposition(server) {
    var cap = itemCap()
    var WATCH = ['"gtceu:deuterium_rich_ice_dust"', '"forge:dusts/deuterium_rich_ice"']
    var bad = []
    var scanned = 0
    ;['gtceu:electrolyzer', 'gtceu:centrifuge'].forEach(function (typeId) {
      recipesOfType(server, typeId).forEach(function (r) {
        scanned++
        var text = asArray(r.getInputContents(cap)).map(function (c) { return String(c.content.toJson()) }).join(' ')
        if (WATCH.some(function (w) { return text.indexOf(w) >= 0 })) bad.push(String(r.getId()))
      })
    })
    var RecipeType = Java.loadClass('net.minecraft.world.item.crafting.RecipeType')
    var ORE = ['gtceu:raw_deuterium_rich_ice"', 'gtceu:mars_deuterium_rich_ice_ore"', 'forge:raw_materials/deuterium_rich_ice"',
      'forge:ores/deuterium_rich_ice"', 'gtceu:crushed_deuterium_rich_ice_ore"', 'gtceu:purified_deuterium_rich_ice_ore"',
      'gtceu:refined_deuterium_rich_ice_ore"']
    var furnace = 0
    ;[RecipeType.SMELTING, RecipeType.BLASTING].forEach(function (type) {
      asArray(server.getRecipeManager().getAllRecipesFor(type)).forEach(function (r) {
        furnace++
        var text = ingredientsText(r)
        if (ORE.some(function (w) { return text.indexOf(w) >= 0 })) bad.push(String(r.getId()))
      })
    })
    check('no_decomposition', bad.length === 0, bad.length > 0 ? 'the ice is split or smelted by ' + bad.join(', ') :
      scanned + ' electrolyzer and centrifuge recipes and ' + furnace + ' furnace recipes, none takes the ice')
  }

  function checkWorldgen() {
    var keys = asArray(GTRegistries.ORE_VEINS.keys()).map(String)
    var gcyr = keys.filter(function (k) { return k.indexOf('gcyr:') === 0 })
    var byGtm = {}
    veins().forEach(function (v) { byGtm[v.gtm] = v })
    var inMars = []
    var details = []
    var problems = []
    keys.forEach(function (k) {
      var def = GTRegistries.ORE_VEINS.get(rl(k))
      var dims = dimensionsOf(def)
      if (dims.indexOf(MARS) < 0) return
      inMars.push(k)
      var layer = String(def.layer().getSerializedName())
      var mats = materialsOf(def)
      details.push(k + ' dims=' + dims.join(',') + ' layer=' + layer + ' weight=' + def.weight() + ' materials=' + mats.join(','))
      var v = byGtm[k]
      if (!v) {
        problems.push('vein of another table on Mars: ' + k)
        return
      }
      if (dims.length !== 1) problems.push(k + ' also generates in ' + dims.join(','))
      if (layer !== 'mars') problems.push(k + ' layer ' + layer)
      var want = v.ores.map(function (o) { return o.material }).sort().join(',')
      if (mats.join(',') !== want) problems.push(k + ' materials ' + mats.join(',') + ' (wanted ' + want + ')')
    })
    Object.keys(byGtm).forEach(function (k) {
      if (inMars.indexOf(k) < 0) problems.push('missing ' + k)
    })
    if (gcyr.length > 0) problems.push('GCYR veins left: ' + gcyr.join(','))
    var report = global.grindless.mars ? global.grindless.mars.worldgen : null
    check('worldgen', problems.length === 0 && inMars.length === 3, details.join(' ; ') + ' | gcyr veins=' + (gcyr.length > 0 ? gcyr.join(',') : 'none') +
      ' | vein event: ' + (report ? 'added ' + report.added.join(',') + ', removed ' + (report.removed.join(',') || 'none') + ', mixed ' + (report.mixed.join(',') || 'none') : 'no report') +
      (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
  }

  // ---------------------------------------------------------------- the world

  function cmd(text) {
    return S.server.runCommandSilent('execute in ' + MARS + ' run ' + text)
  }

  function surfaceAt(level, x, z) {
    for (var y = 319; y >= -64; y--) {
      var id = String(level.getBlock(x, y, z).getId())
      if (id !== 'minecraft:air' && id !== 'minecraft:cave_air' && id !== 'minecraft:void_air') return { y: y, id: id }
    }
    return { y: -65, id: 'none' }
  }

  function startWorld() {
    S.level = S.server.getLevel(MARS)
    if (S.level === null || S.level === undefined) {
      check('mars_level', false, MARS + ' is not loaded')
      return false
    }
    cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var mid = surfaceAt(S.level, (BAND.x0 + BAND.x1) >> 1, (BAND.z0 + BAND.z1) >> 1)
    S.surface = mid
    check('mars_level', true, MARS + ' loaded; band X ' + BAND.x0 + '..' + BAND.x1 + ' Z ' + BAND.z0 + '..' + BAND.z1 + ' force-loaded; surface at the middle: Y ' +
      mid.y + ' (' + mid.id + '); nothing is built, Y 198..214 reserved')
    S.cx = SCAN.cx0
    S.cz = SCAN.cz0
    S.counts = {}
    S.indicators = {}
    S.chunks = 0
    S.t0 = Date.now()
    return true
  }

  // the ores of one freshly generated chunk (block counts from the section palettes)
  function scanChunk(cx, cz) {
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var chunk = S.level.getChunk(cx, cz)
    S.chunks++
    var secs = chunk.getSections()
    for (var i = 0; i < secs.length; i++) {
      var sec = secs[i]
      if (sec.hasOnlyAir()) continue
      sec.getStates().count(function (state, n) {
        var id = String(BI.BLOCK.getKey(state.getBlock()))
        if (/_ore$/.test(id)) S.counts[id] = (S.counts[id] || 0) + Number(n)
        else if (/_indicator$/.test(id)) S.indicators[id] = (S.indicators[id] || 0) + Number(n)
      })
    }
  }

  function summary(counts) {
    return Object.keys(counts).sort().map(function (k) { return k.replace(/^[a-z_]+:/, '') + 'x' + counts[k] }).join(' ')
  }

  function finishWorld() {
    var allowed = {}
    var main = []
    veins().forEach(function (v) {
      v.ores.forEach(function (o) { allowed['gtceu:mars_' + o.material + '_ore'] = true })
      main.push('gtceu:mars_' + v.ores[0].material + '_ore')
    })
    var others = Object.keys(S.counts).filter(function (id) { return allowed[id] !== true })
    var absent = main.filter(function (id) { return !(S.counts[id] > 0) })
    check('mars_ores', others.length === 0 && absent.length === 0, S.chunks + ' Martian chunks (X ' + (SCAN.cx0 << 4) + '..' + ((SCAN.cx1 << 4) + 15) +
      ', Z ' + (SCAN.cz0 << 4) + '..' + ((SCAN.cz1 << 4) + 15) + ') in ' + (Date.now() - S.t0) + ' ms: ' +
      (Object.keys(S.counts).length > 0 ? summary(S.counts) : 'no ore at all') + ' | indicators: ' + (summary(S.indicators) || 'none') +
      (others.length > 0 ? ' | ores of no Mars vein: ' + others.join(',') : '') + (absent.length > 0 ? ' | veins not seen: ' + absent.join(',') : ''))
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    } catch (e) { /* best effort */ }
    console.info('GGTEST|' + SCOPE + '|DONE')
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler scans a few chunks per tick
  function onTick() {
    if (S === null || S.finished || !S.scanning) return
    try {
      for (var k = 0; k < SCAN.perTick; k++) {
        if (S.cx > SCAN.cx1) {
          S.scanning = false
          finishWorld()
          finish()
          return
        }
        scanChunk(S.cx, S.cz)
        S.cz++
        if (S.cz > SCAN.cz1) {
          S.cz = SCAN.cz0
          S.cx++
        }
      }
    } catch (e) {
      check('mars_ores', false, 'exception: ' + e)
      finish()
    }
  }

  function run(server) {
    S = { server: server, finished: false, scanning: false }
    safely('registry', checkRegistry)
    safely('tables', checkTables)
    safely('samples', function () { checkSamples(server) })
    safely('rocket_parts', function () { checkRocketParts(server) })
    safely('planets', checkPlanets)
    safely('no_decomposition', function () { checkNoDecomposition(server) })
    safely('worldgen', checkWorldgen)
    var ok = false
    try {
      ok = startWorld()
    } catch (e) {
      check('mars_level', false, 'exception: ' + e)
    }
    if (ok) S.scanning = true
    else finish()
  }

  ServerEvents.tick(function (event) {
    onTick()
  })

  ServerEvents.customCommand('gg_test_mars_travel', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_mars_travel run is still in progress')
      return 0
    }
    try {
      run(event.getLevel().getServer())
    } catch (e) {
      check('run', false, 'exception: ' + e)
      finish()
    }
    return 1
  })
})()
