// Gregtech Grindless - registration test of the IV foundation (TEST-ONLY overlay: copied over the instance on the test PC, never shipped
// with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_iv_foundation;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|iv_foundation\|DONE@@600;;GGTEST\|dump\|DONE@@900'
//
// startup_scripts/grindless/iv/foundation.js and server_scripts/grindless/iv/foundation.js only reuse proven mechanisms (GT materials,
// GTM's electrolyzer, mixer, EBF, chemical reactor, assembler and macerator, the vein tables and the vein event that moved scheelite to
// Mars, offworld_only.json), so this test builds nothing in the world (band X 9728..9791 stays empty): it checks what is new, the
// registrations, the material properties, that the recipes landed under their final ids, the tables and the live vein registry.
// The dump (gg_dump) and the validator cover the rest.
//
// Markers: GGTEST|iv_foundation|<check>|PASS|FAIL|NOTE|<detail>, last line GGTEST|iv_foundation|DONE
//   published         global.grindless.ivFoundation carries the ids, samples, recipes and table functions the other IV packages use
//   registry          the 12 items, 2 blocks, 4 vein samples (and their tags), the 3 fluids and their buckets, every GT form relied on
//   materials         heavy water (D2O, no automatic decomposition), the concentrate, tritiated heavy water (GTM's radioactive hazard), zircaloy
//                     (63 Zr : 1 Sn, ingot, 2,100 K with argon), Hermean regolith (dust, no decomposition), iridosmine (ore, byproducts
//                     graphite and sulfur, no decomposition, no ore smelting) and GCYR's fluorite (no decomposition any more)
//   recipes           every recipe of the package under its final id, with its amounts, EU/t and duration; GT--'s radiation-proof casing
//   zircaloy_steps    GTM's own EBF (both, with and without argon, at 2,100 K) and vacuum freezer recipes of zircaloy
//   no_decomposition  no electrolyzer or centrifuge recipe splits iridosmine, Hermean regolith, fluorite, the concentrate or the tritiated
//                     water, and heavy water only through our electrolysis
//   tritium           only the Moon's detritiation recipe may give tritium (deuterium_separation gone, ender air without it)
//   tables            global.grindless.ivFoundation.checkTables(): Venus, Mercury and leach tables, the fluorite entry, the sample pairs
//   samples           the vein sample recipes (Venus, Mercury, the End's pitchblende and the fluorite one)
//   fluorite_drilling the fluorite vein's drilling recipes, from the existing generators; #forge:raw_materials/fluorite holds GCYR's raw ore
//   fluorite_chain    NOTE only: how many GT recipes process the drill's raw (or crushed) fluorite; none while hidden_until.json keeps
//                     gcyr:fluorite as junk
//   worldgen          GTM's live vein registry: our Venus, Mercury and fluorite veins with their layer, dimensions and materials; GTM's End
//                     naquadah vein gone, the End's pitchblende vein still there; nothing else generates only on Venus or Mercury
//   planets           planets.json: Venus and Mercury carry their pair tags
//   bee_combs         the naquadah, osmium and radioactive combs still have no recipe at all
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var SCOPE = 'iv_foundation'

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

  var CAPS = null
  function caps() {
    if (CAPS === null) {
      CAPS = {
        item: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        fluid: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
      }
    }
    return CAPS
  }

  function byId(server, id) {
    var opt = server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function recipesOfType(server, typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? asArray(server.getRecipeManager().getAllRecipesFor(type)) : []
  }

  function json(c) {
    try {
      return JSON.parse(String(c.content.toJson()))
    } catch (e) {
      return null
    }
  }

  // item contents of one side of a GT recipe: [{ id: item, #tag or 'circuit N', count, chance }]
  function gtItems(list) {
    return asArray(list).map(function (c) {
      var j = json(c)
      if (j === null) return { id: '?', count: 0, chance: Number(c.chance) }
      var ing = j.ingredient || j
      var id = '?'
      if (ing.item) id = String(ing.item)
      else if (ing.tag) id = '#' + String(ing.tag)
      else if (ing.type === 'gtceu:circuit' || j.type === 'gtceu:circuit') id = 'circuit ' + (ing.configuration !== undefined ? ing.configuration : j.configuration)
      return { id: id, count: Number(j.count || 1), chance: Number(c.chance) }
    })
  }

  function gtFluids(list) {
    return asArray(list).map(function (c) {
      var j = json(c)
      if (j === null || !j.value || j.value.length === 0) return { id: '?', count: 0, chance: Number(c.chance) }
      var v = j.value[0]
      return { id: String(v.fluid || ('#' + v.tag)), count: Number(j.amount), chance: Number(c.chance) }
    })
  }

  function describe(list) {
    return list.map(function (x) { return x.count + 'x ' + x.id + (x.chance === 0 ? ' (nc)' : '') }).sort().join(', ')
  }

  function sorted(text) {
    return text.split(', ').filter(function (s) { return s !== '' }).sort().join(', ')
  }

  function eutOf(r) {
    return Number(caps().helper.getRealEUt(r).getTotalEU())
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

  function dimensionsOf(def) {
    var out = []
    var set = def.dimensionFilter()
    if (set == null) return out
    var it = set.iterator()
    while (it.hasNext()) out.push(String(it.next().location()))
    return out.sort()
  }

  function materialsOf(def) {
    try {
      return asArray(def.veinGenerator().getAllMaterials()).map(function (m) {
        var id = String(m.getResourceLocation ? m.getResourceLocation() : m.getName())
        return id.indexOf('gtceu:') === 0 ? id.substring(6) : id
      }).filter(function (v, i, a) { return a.indexOf(v) === i }).sort()
    } catch (e) {
      return []
    }
  }

  function tagItems(tag) {
    return asArray(Ingredient.of('#' + tag).getItemIds()).map(String)
  }

  // ---------------------------------------------------------------- checks

  function run(server) {
    var IVF = global.grindless && global.grindless.ivFoundation
    if (!IVF || !IVF.ids || !IVF.samples || !IVF.recipes || typeof IVF.checkTables !== 'function') {
      check('published', false, 'global.grindless.ivFoundation is incomplete')
      return
    }
    var ids = IVF.ids

    safely('published', function () {
      var fns = ['venusVeins', 'mercuryVeins', 'leachVeins', 'checkTables'].filter(function (f) { return typeof IVF[f] !== 'function' })
      var want = ['heavyWater', 'heavyWaterConcentrate', 'tritiatedHeavyWater', 'zircaloyIngot', 'hermeanRegolithDust', 'iridosmineDust',
        'leuPellet', 'zircaloyCladdingTube', 'leuFuelAssembly', 'moxFuelAssembly', 'breederFuelAssembly', 'spentFuelAssembly',
        'spentBreederAssembly', 'pubeNeutronSource', 'rtgPellet', 'ionExchangeResin', 'platinumGauze', 'innerPlanetsChart',
        'hermeanHeatShieldBrick', 'hermeanThinFilmPanel']
      var missing = want.filter(function (k) { return !ids[k] })
      check('published', fns.length === 0 && missing.length === 0 && !!IVF.textures && !!IVF.dimensions,
        'functions missing: ' + (fns.join(', ') || 'none') + '; ids missing: ' + (missing.join(', ') || 'none') + '; ' + Object.keys(ids).length + ' ids, samples ' +
        Object.keys(IVF.samples).map(function (k) { return IVF.samples[k] }).join(', '))
    })

    safely('registry', function () {
      var samples = Object.keys(IVF.samples).map(function (k) { return IVF.samples[k] })
      var items = IVF.items.concat([ids.hermeanHeatShieldBrick, ids.hermeanThinFilmPanel]).concat(samples).concat([
        ids.zircaloyIngot, ids.zircaloyNugget, ids.zircaloyDust, ids.hotZircaloyIngot, 'gtceu:zircaloy_block',
        ids.hermeanRegolithDust, ids.iridosmineDust, ids.iridosmineRaw, ids.iridosmineCrushed, ids.iridosmineMercuryOre,
        'gtceu:purified_iridosmine_ore', 'gtceu:refined_iridosmine_ore', 'gtceu:raw_iridosmine_block',
        'gtceu:heavy_water_bucket', 'gtceu:heavy_water_concentrate_bucket', 'gtceu:tritiated_heavy_water_bucket',
        ids.radiationProofCasing, ids.fluoriteDust, ids.fluoriteRaw])
      var missing = items.filter(function (id) { return !Item.exists(id) })
      var fluids = [ids.heavyWater, ids.heavyWaterConcentrate, ids.tritiatedHeavyWater].filter(function (id) { return !Fluid.exists(id) })
      var blocks = [ids.hermeanHeatShieldBrick, ids.hermeanThinFilmPanel].filter(function (id) {
        var b = Block.getBlock(id)
        return b == null || b.defaultBlockState().isAir()
      })
      var all = tagItems('grindless:vein_samples')
      var venus = tagItems('grindless:venusian_vein_samples')
      var mercury = tagItems('grindless:hermean_vein_samples')
      var untagged = samples.filter(function (id) { return all.indexOf(id) < 0 })
      var planetTags = (venus.indexOf(IVF.samples.naquadahVenus) >= 0 ? '' : 'venus tag; ') + (mercury.indexOf(IVF.samples.iridosmineMercury) >= 0 ? '' : 'mercury tag')
      check('registry', missing.length === 0 && fluids.length === 0 && blocks.length === 0 && untagged.length === 0 && planetTags === '',
        items.length + ' items checked, missing: ' + (missing.join(', ') || 'none') + '; fluids missing: ' + (fluids.join(', ') || 'none') +
        '; blocks missing: ' + (blocks.join(', ') || 'none') + '; samples not in #grindless:vein_samples: ' + (untagged.join(', ') || 'none') +
        (planetTags !== '' ? '; problems with ' + planetTags : '; planet tags ok'))
    })

    safely('materials', function () {
      var problems = []
      var notes = []
      var M = IVF.materials
      function mat(name) {
        var m = GTMaterials.get(name)
        if (m == null || m.isNull()) {
          problems.push(name + ' not registered')
          return null
        }
        return m
      }
      function components(m) {
        return asArray(m.getMaterialComponents()).map(function (s) { return Number(s.amount()) + 'x ' + String(s.material().getName()) }).sort().join(', ')
      }
      var hw = mat(M.heavyWater)
      if (hw) {
        if (!hw.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('heavy water: automatic decomposition on')
        if (components(hw) !== '1x oxygen, 2x deuterium') problems.push('heavy water components ' + components(hw))
        if (hw.getProperty(PropertyKey.DUST) != null) problems.push('heavy water has a dust')
        notes.push('heavy water ' + hw.getChemicalFormula() + ' (' + components(hw) + ')')
      }
      var hwc = mat(M.heavyWaterConcentrate)
      if (hwc) {
        if (!hwc.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('concentrate decomposes')
        notes.push('concentrate ' + hwc.getChemicalFormula())
      }
      var thw = mat(M.tritiatedHeavyWater)
      if (thw) {
        if (!thw.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('tritiated water decomposes')
        var hazard = thw.getProperty(PropertyKey.HAZARD)
        if (hazard == null) problems.push('tritiated water has no hazard')
        else notes.push('tritiated water ' + thw.getChemicalFormula() + ', hazard ' + hazard.hazardTrigger + '/' + (hazard.condition.name || hazard.condition) + ' x' + hazard.progressionMultiplier)
      }
      var zr = mat(M.zircaloy)
      if (zr) {
        if (zr.getProperty(PropertyKey.INGOT) == null) problems.push('zircaloy has no ingot')
        if (components(zr) !== '1x tin, 63x zirconium') problems.push('zircaloy components ' + components(zr))
        var blast = zr.getProperty(PropertyKey.BLAST)
        if (blast == null) problems.push('zircaloy has no blast property')
        else {
          if (Number(blast.getBlastTemperature()) !== IVF.zircaloy.blastTemperature) problems.push('zircaloy blasts at ' + blast.getBlastTemperature() + ' K')
          notes.push('zircaloy ' + zr.getChemicalFormula() + ', ' + blast.getBlastTemperature() + ' K, gas ' + blast.getGasTier())
        }
      }
      var reg = mat(M.hermeanRegolith)
      if (reg && !reg.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('Hermean regolith decomposes')
      var ir = mat(M.iridosmine)
      if (ir) {
        if (!ir.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('iridosmine decomposes')
        if (!ir.hasFlag(GTMaterialFlags.NO_ORE_SMELTING)) problems.push('iridosmine ore smelts')
        var ore = ir.getProperty(PropertyKey.ORE)
        if (ore == null) problems.push('iridosmine has no ore property')
        else {
          var by = asArray(ore.getOreByProducts()).map(function (m) { return String(m.getName()) }).sort().join(',')
          if (by !== 'graphite,sulfur') problems.push('iridosmine byproducts ' + by)
        }
        notes.push('iridosmine ' + ir.getChemicalFormula())
      }
      var fl = mat(IVF.fluorite.material)
      if (fl && !fl.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('gcyr:fluorite still decomposes')
      check('materials', problems.length === 0, problems.length > 0 ? problems.join('; ') + ' | ' + notes.join('; ') : notes.join('; ') + '; gcyr:fluorite no decomposition')
    })

    // id -> what the recipe must hold; items/fluids sorted, 'nc' = not consumed
    var WANT = {}
    WANT[IVF.recipes.heavyWaterElectrolysis] = { inItems: '', outItems: '', inFluids: '1000x ' + ids.heavyWater, outFluids: '1000x gtceu:oxygen, 2000x gtceu:deuterium', eut: 30, duration: 1500 }
    WANT[IVF.recipes.zircaloyMixer] = { inItems: '1x gtceu:tin_dust, 63x gtceu:zirconium_dust', outItems: '64x ' + ids.zircaloyDust, inFluids: '', outFluids: '', eut: 1920, duration: 400 }
    WANT[IVF.recipes.ionExchangeResin] = { inItems: '', outItems: '4x ' + ids.ionExchangeResin, inFluids: '1000x gtceu:styrene, 1000x gtceu:sulfuric_acid', outFluids: '1000x gtceu:diluted_sulfuric_acid', eut: 480, duration: 400 }
    WANT[IVF.recipes.platinumGauze] = { inItems: '16x gtceu:fine_platinum_wire, 2x gtceu:fine_rhodium_wire', outItems: '1x ' + ids.platinumGauze, inFluids: '', outFluids: '', eut: 1920, duration: 200 }
    IVF.recipes.hermeanRegolith.forEach(function (id) {
      var block = 'gcyr:' + id.substring(id.indexOf('_from_') + 6)
      WANT[id] = { inItems: '1x ' + block, outItems: '1x ' + ids.hermeanRegolithDust, inFluids: '', outFluids: '', eut: 2, duration: 98 }
    })

    safely('recipes', function () {
      var problems = []
      var seen = 0
      Object.keys(WANT).forEach(function (id) {
        var r = byId(server, id)
        if (r === null) {
          problems.push(id + ' missing')
          return
        }
        seen++
        var want = WANT[id]
        var got = {
          inItems: describe(gtItems(r.getInputContents(caps().item))),
          outItems: describe(gtItems(r.getOutputContents(caps().item))),
          inFluids: describe(gtFluids(r.getInputContents(caps().fluid))),
          outFluids: describe(gtFluids(r.getOutputContents(caps().fluid)))
        }
        ;['inItems', 'outItems', 'inFluids', 'outFluids'].forEach(function (k) {
          if (got[k] !== sorted(want[k])) problems.push(id + ' ' + k + ': ' + got[k] + ' (wanted ' + sorted(want[k]) + ')')
        })
        var eut = eutOf(r)
        if (eut !== want.eut) problems.push(id + ' runs at ' + eut + ' EU/t (wanted ' + want.eut + ')')
        if (Number(r.duration) !== want.duration) problems.push(id + ' lasts ' + r.duration + ' t (wanted ' + want.duration + ')')
      })
      // GT--'s own radiation-proof casing recipe is the one iv.md asks for (dense lead, a tungsten steel frame and concrete, IV)
      var casing = byId(server, IVF.recipes.radiationProofCasing)
      if (casing === null) problems.push(IVF.recipes.radiationProofCasing + ' missing')
      else {
        var cin = describe(gtItems(casing.getInputContents(caps().item)))
        var cfl = describe(gtFluids(casing.getInputContents(caps().fluid)))
        if (cin !== '1x #forge:frames/tungsten_steel, 6x #forge:dense_plates/lead' || cfl !== '1296x #forge:concrete' || eutOf(casing) !== 7680) {
          problems.push('radiation-proof casing changed: ' + cin + ' | ' + cfl + ' | ' + eutOf(casing) + ' EU/t')
        }
      }
      check('recipes', problems.length === 0, problems.join('; ') || seen + ' recipes under their final ids with their amounts, EU/t and duration; GT--\'s radiation-proof casing unchanged')
    })

    safely('zircaloy_steps', function () {
      var problems = []
      var details = []
      ;[IVF.recipes.zircaloyBlast, IVF.recipes.zircaloyBlastGas].forEach(function (id) {
        var r = byId(server, id)
        if (r === null) {
          problems.push(id + ' missing')
          return
        }
        var temp = Number(r.data.getInt('ebf_temp'))
        var ins = describe(gtItems(r.getInputContents(caps().item)))
        var fl = describe(gtFluids(r.getInputContents(caps().fluid)))
        var outs = describe(gtItems(r.getOutputContents(caps().item)))
        if (temp !== IVF.zircaloy.blastTemperature) problems.push(id + ' at ' + temp + ' K')
        if (outs !== '1x ' + ids.hotZircaloyIngot) problems.push(id + ' gives ' + outs)
        if (eutOf(r) !== IVF.zircaloy.blastEUt) problems.push(id + ' runs at ' + eutOf(r) + ' EU/t')
        details.push(id + ': ' + ins + (fl ? ' + ' + fl : '') + ' -> ' + outs + ', ' + temp + ' K, ' + eutOf(r) + ' EU/t, ' + r.duration + ' t')
      })
      var cool = byId(server, IVF.recipes.zircaloyCooling)
      if (cool === null) problems.push(IVF.recipes.zircaloyCooling + ' missing')
      else details.push(IVF.recipes.zircaloyCooling + ': ' + describe(gtItems(cool.getInputContents(caps().item))) + ' -> ' + describe(gtItems(cool.getOutputContents(caps().item))))
      check('zircaloy_steps', problems.length === 0, details.join('; ') + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
    })

    safely('no_decomposition', function () {
      var WATCH_ITEMS = ['"gtceu:iridosmine_dust"', '"forge:dusts/iridosmine"', '"gtceu:hermean_regolith_dust"', '"forge:dusts/hermean_regolith"',
        '"gcyr:fluorite_dust"', '"forge:dusts/fluorite"']
      var WATCH_FLUIDS = ['gtceu:heavy_water_concentrate', 'forge:heavy_water_concentrate', 'gtceu:tritiated_heavy_water', 'forge:tritiated_heavy_water']
      var bad = []
      var heavy = []
      var scanned = 0
      ;['gtceu:electrolyzer', 'gtceu:centrifuge'].forEach(function (typeId) {
        recipesOfType(server, typeId).forEach(function (r) {
          scanned++
          var items = asArray(r.getInputContents(caps().item)).map(function (c) { return String(c.content.toJson()) }).join(' ')
          var fluids = asArray(r.getInputContents(caps().fluid)).map(function (c) { return String(c.content.toJson()) }).join(' ')
          if (WATCH_ITEMS.some(function (w) { return items.indexOf(w) >= 0 })) bad.push(String(r.getId()))
          if (WATCH_FLUIDS.some(function (w) { return fluids.indexOf('"' + w + '"') >= 0 })) bad.push(String(r.getId()))
          if (fluids.indexOf('"gtceu:heavy_water"') >= 0 || fluids.indexOf('"forge:heavy_water"') >= 0) heavy.push(String(r.getId()))
        })
      })
      var heavyOk = heavy.length === 1 && heavy[0] === IVF.recipes.heavyWaterElectrolysis
      var gone = byId(server, IVF.fluorite.decompositionRecipe) === null
      check('no_decomposition', bad.length === 0 && heavyOk && gone,
        scanned + ' electrolyzer and centrifuge recipes; splitting the watched dusts and fluids: ' + (bad.join(', ') || 'none') +
        '; taking heavy water: ' + (heavy.join(', ') || 'none') + '; ' + IVF.fluorite.decompositionRecipe + (gone ? ' absent' : ' PRESENT'))
    })

    safely('tritium', function () {
      var makers = []
      var scanned = 0
      asArray(GTRegistries.RECIPE_TYPES.keys()).forEach(function (key) {
        recipesOfType(server, String(key)).forEach(function (r) {
          scanned++
          var outs = asArray(r.getOutputContents(caps().fluid)).map(function (c) { return String(c.content.toJson()) }).join(' ')
          if (outs.indexOf('"gtceu:tritium"') >= 0 || outs.indexOf('"forge:tritium"') >= 0) makers.push(String(r.getId()))
        })
      })
      var separation = byId(server, 'gtceu:centrifuge/deuterium_separation') !== null
      var enderAir = byId(server, 'grindless:distillation_tower/offworld_only/distill_liquid_ender_air')
      var enderOuts = enderAir === null ? 'missing' : describe(gtFluids(enderAir.getOutputContents(caps().fluid)))
      var onlyDetritiation = makers.every(function (id) { return id === 'grindless:detritiation/tritiated_heavy_water' })
      check('tritium', onlyDetritiation && !separation && enderAir !== null,
        scanned + ' GT recipes; giving tritium: ' + (makers.join(', ') || 'none') + '; deuterium_separation ' + (separation ? 'STILL LOADED' : 'gone') +
        '; liquid ender air distillation gives ' + enderOuts)
    })

    safely('tables', function () {
      var problems = IVF.checkTables()
      var lists = { venus: IVF.venusVeins(), mercury: IVF.mercuryVeins(), leach: IVF.leachVeins() }
      var WANT_PAIRS = {
        naquadah_venus: 'naquadah + plutonium',
        iridosmine_mercury: 'graphite + iridosmine',
        pitchblende_end: 'pitchblende + uraninite'
      }
      var details = []
      Object.keys(lists).forEach(function (k) {
        lists[k].forEach(function (v) {
          var pair = v.samplePair.map(function (t) { return t.replace('#forge:raw_materials/', '') }).sort().join(' + ')
          if (WANT_PAIRS[v.id] !== undefined && WANT_PAIRS[v.id] !== pair) problems.push(v.id + ' sample pair ' + pair)
          details.push(v.id + ' (' + v.ores.map(function (o) { return o.material + ' ' + Math.round(o.share * 1000) / 10 + '%' }).join(', ') +
            '; Y ' + v.minY + '..' + v.maxY + '; sample ' + pair + ')')
        })
      })
      var fluorite = global.grindless.lv.extraVeins().filter(function (v) { return v.id === 'fluorite' })[0]
      if (!fluorite) problems.push('no fluorite vein in lv.extraVeins()')
      else details.push('fluorite (' + fluorite.ores.map(function (o) { return o.material + ' ' + Math.round(o.share * 1000) / 10 + '%' }).join(', ') +
        '; sample ' + fluorite.samplePair.map(function (t) { return t.replace('#forge:raw_materials/', '') }).join(' + ') + ')')
      var counts = lists.venus.length + '/' + lists.mercury.length + '/' + lists.leach.length
      check('tables', problems.length === 0 && counts === '1/1/1', details.join('; ') + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
    })

    safely('samples', function () {
      var problems = []
      var details = []
      var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
      var veins = IVF.venusVeins().concat(IVF.mercuryVeins()).concat(IVF.leachVeins())
      var fluorite = global.grindless.lv.extraVeins().filter(function (v) { return v.id === 'fluorite' })
      veins.concat(fluorite).forEach(function (v) {
        var id = 'grindless:crafting/vein_sample/' + v.id
        var r = byId(server, id)
        if (r === null) {
          problems.push('missing ' + id)
          return
        }
        var text = ingredientsText(r)
        var out = String(BI.ITEM.getKey(r.getResultItem(server.registryAccess()).getItem()))
        if (text.indexOf('grindless:empty_vein_probe') < 0) problems.push(id + ' has no probe')
        v.samplePair.forEach(function (p) {
          if (text.indexOf(p.replace(/^#/, '')) < 0) problems.push(id + ' lacks ' + p)
        })
        if (out !== v.sample) problems.push(id + ' gives ' + out)
        details.push(id + ' -> ' + out)
      })
      check('samples', problems.length === 0 && details.length === 4, details.join('; ') + (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
    })

    safely('fluorite_drilling', function () {
      var sample = IVF.samples.fluorite
      var takers = []
      var givesFluorite = 0
      recipesOfType(server, 'gtceu:vein_drilling').forEach(function (r) {
        var ins = gtItems(r.getInputContents(caps().item))
        if (!ins.some(function (x) { return x.id === sample })) return
        takers.push(String(r.getId()))
        var outs = gtItems(r.getOutputContents(caps().item))
        if (outs.some(function (x) { return x.id === ids.fluoriteRaw })) givesFluorite++
      })
      var raw = tagItems('forge:raw_materials/fluorite')
      var steam = ['grindless:vein_drilling/fluorite_bronze', 'grindless:vein_drilling/fluorite_steel'].filter(function (id) { return takers.indexOf(id) < 0 })
      check('fluorite_drilling', takers.length >= 4 && givesFluorite === takers.length && steam.length === 0 && raw.indexOf(ids.fluoriteRaw) >= 0,
        takers.length + ' vein_drilling recipes take ' + sample + ' (' + takers.sort().join(', ') + '), ' + givesFluorite + ' give raw fluorite; steam ones missing: ' +
        (steam.join(', ') || 'none') + '; #forge:raw_materials/fluorite = ' + (raw.join(', ') || 'empty'))
    })

    // NOTE, not a check: until hidden_until.json moves gcyr:fluorite from "never" to IV, integration/hidden.js removes its whole ore chain,
    // so nothing turns raw fluorite into the fluorite dust the fluorspar kiln takes. Turn this into a check once the table is regenerated.
    safely('fluorite_chain', function () {
      // the drill gives raw fluorite: the chain that matters starts from it (raw, crushed, purified or refined, item or tag)
      var FORMS = /"(gcyr:raw_fluorite|gcyr:(crushed|purified|refined)_fluorite_ore|forge:raw_materials\/fluorite|forge:(crushed|purified|refined)_ores\/fluorite)"/
      var chain = []
      asArray(GTRegistries.RECIPE_TYPES.keys()).forEach(function (key) {
        recipesOfType(server, String(key)).forEach(function (r) {
          var ins = asArray(r.getInputContents(caps().item)).map(function (c) { return String(c.content.toJson()) }).join(' ')
          if (FORMS.test(ins)) chain.push(String(r.getId()))
        })
      })
      emit('fluorite_chain', 'NOTE', chain.length + ' GT recipes process raw or crushed fluorite' + (chain.length > 0 ? ': ' + chain.sort().slice(0, 12).join(', ') :
        ' (the hidden table still removes the ore chain as junk: regenerate it with gcyr:fluorite in class B, until iv)'))
    })

    safely('worldgen', function () {
      var problems = []
      var details = []
      var keys = asArray(GTRegistries.ORE_VEINS.keys()).map(String)
      var want = {}
      IVF.venusVeins().forEach(function (v) { want[v.gtm] = { dims: [IVF.dimensions.venus], layer: 'venus', ores: v.ores } })
      IVF.mercuryVeins().forEach(function (v) { want[v.gtm] = { dims: [IVF.dimensions.mercury], layer: 'mercury', ores: v.ores } })
      var fluorite = global.grindless.lv.extraVeins().filter(function (v) { return v.id === 'fluorite' })[0]
      if (fluorite) want[fluorite.gtm] = { dims: ['grindless:flat', 'minecraft:overworld'], layer: 'stone', ores: fluorite.ores }
      Object.keys(want).forEach(function (k) {
        if (keys.indexOf(k) < 0) {
          problems.push('missing ' + k)
          return
        }
        var def = GTRegistries.ORE_VEINS.get(rl(k))
        var dims = dimensionsOf(def)
        var layer = String(def.layer().getSerializedName())
        var mats = materialsOf(def)
        var wantMats = want[k].ores.map(function (o) { return o.material }).sort()
        if (dims.join(',') !== want[k].dims.slice().sort().join(',')) problems.push(k + ' dims ' + dims.join(','))
        if (layer !== want[k].layer) problems.push(k + ' layer ' + layer)
        if (mats.join(',') !== wantMats.join(',')) problems.push(k + ' materials ' + mats.join(',') + ' (wanted ' + wantMats.join(',') + ')')
        details.push(k + ' dims=' + dims.join(',') + ' layer=' + layer + ' weight=' + def.weight() + ' materials=' + mats.join(','))
      })
      if (keys.indexOf('gtceu:naquadah_vein') >= 0) problems.push('gtceu:naquadah_vein still generates')
      if (keys.indexOf('gtceu:pitchblende_vein_end') < 0) problems.push('gtceu:pitchblende_vein_end is gone')
      var onPlanets = []
      keys.forEach(function (k) {
        if (want[k]) return
        var dims = dimensionsOf(GTRegistries.ORE_VEINS.get(rl(k)))
        if (dims.indexOf(IVF.dimensions.venus) >= 0 || dims.indexOf(IVF.dimensions.mercury) >= 0) onPlanets.push(k + ' (' + dims.join(',') + ')')
      })
      if (onPlanets.length > 0) problems.push('other veins on Venus or Mercury: ' + onPlanets.join(', '))
      var report = IVF.worldgen
      check('worldgen', problems.length === 0, details.join(' ; ') + ' | gtceu:naquadah_vein ' + (keys.indexOf('gtceu:naquadah_vein') >= 0 ? 'present' : 'gone') +
        ', gtceu:pitchblende_vein_end ' + (keys.indexOf('gtceu:pitchblende_vein_end') >= 0 ? 'present' : 'gone') + ' | vein event: ' +
        (report ? 'added ' + report.added.join(',') + ', removed ' + (report.removed.join(',') || 'none') + ', mixed ' + (report.mixed.join(',') || 'none') : 'no report') +
        (problems.length > 0 ? ' problems=' + problems.join(' / ') : ''))
    })

    safely('planets', function () {
      var P = global.grindless.planets
      var t = P.table.planets
      var ok = t.venus && t.venus.pairTag === 'venus' && t.mercury && t.mercury.pairTag === 'mercury' &&
        P.planetOf('gcyr:venus') === 'venus' && P.planetOf('gcyr:mercury_orbit') === 'mercury' && !!t.venus.name && !!t.mercury.name
      check('planets', ok, 'venus pairTag=' + (t.venus && t.venus.pairTag) + ', mercury pairTag=' + (t.mercury && t.mercury.pairTag) +
        ', planetOf(gcyr:venus)=' + P.planetOf('gcyr:venus') + ', planetOf(gcyr:mercury_orbit)=' + P.planetOf('gcyr:mercury_orbit'))
    })

    safely('bee_combs', function () {
      var BEES = ['productivebees:naquadah', 'productivebees:osmium', 'productivebees:radioactive']
      var takers = []
      var scanned = 0
      var types = asArray(GTRegistries.RECIPE_TYPES.keys()).map(String).concat(['productivebees:centrifuge'])
      types.forEach(function (typeId) {
        var list = null
        if (typeId.indexOf('productivebees:') === 0) {
          var RT = Java.loadClass('net.minecraftforge.registries.ForgeRegistries').RECIPE_TYPES.getValue(rl(typeId))
          list = RT == null ? [] : asArray(server.getRecipeManager().getAllRecipesFor(RT))
        } else {
          list = recipesOfType(server, typeId)
        }
        list.forEach(function (r) {
          scanned++
          var text = typeId.indexOf('productivebees:') === 0 ? ingredientsText(r) :
            asArray(r.getInputContents(caps().item)).map(function (c) { return String(c.content.toJson()) }).join(' ')
          if (text.indexOf('configurable_honeycomb') < 0) return
          if (BEES.some(function (b) { return text.indexOf(b) >= 0 })) takers.push(String(r.getId()))
        })
      })
      check('bee_combs', takers.length === 0, scanned + ' GT and Productive Bees centrifuge recipes; ones that take the naquadah, osmium or radioactive comb: ' + (takers.join(', ') || 'none'))
    })
  }

  ServerEvents.customCommand('gg_test_iv_foundation', function (event) {
    try {
      run(event.getLevel().getServer())
    } catch (e) {
      check('run', false, 'exception: ' + e)
    }
    console.info('GGTEST|' + SCOPE + '|DONE')
  })
})()
