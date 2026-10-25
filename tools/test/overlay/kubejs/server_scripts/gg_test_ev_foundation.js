// Gregtech Grindless - registration test of the EV foundation (TEST-ONLY overlay: copied over the instance on the test PC, never shipped
// with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_ev_foundation;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|ev_foundation\|DONE@@300;;GGTEST\|dump\|DONE@@900'
//
// startup_scripts/grindless/ev/foundation.js and server_scripts/grindless/ev/foundation.js only reuse proven mechanisms (GTM's electric
// furnace, mixer, assembler and macerator, the dimension condition), so this test builds nothing in the world: it checks what is new,
// the registrations, and that the recipes landed under their final ids. The dump (gg_dump) and the validator cover the rest.
//
// Markers: GGTEST|ev_foundation|<check>|PASS|FAIL|<detail>, last line GGTEST|ev_foundation|DONE
//   registry          the block and the items, every GT form the package relies on (gtceu:mars_merrillite_ore among them), the fluids
//   materials         DISABLE_DECOMPOSITION on lunar_regolith and merrillite, merrillite's ore and its byproducts, the formulas
//   liquid_nitrogen   gtceu:liquid_nitrogen is the LIQUID key of GTM's nitrogen at 77 K, with our name key; the gas is still gtceu:nitrogen
//   methalox          gtceu:methalox is the gas of the methalox material
//   recipes           every recipe under its final id (GTM's builder puts the type in front), with its amounts
//   sintering_moon    the sintering recipe carries the dimension condition of the Moon
//   no_decomposition  no electrolyzer or centrifuge recipe takes the new dusts (only our machines split them)
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var SCOPE = 'ev_foundation'

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function check(name, ok, detail) {
    var line = 'GGTEST|' + SCOPE + '|' + name + '|' + (ok ? 'PASS' : 'FAIL')
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function safely(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  function asArray(coll) {
    var AL = Java.loadClass('java.util.ArrayList')
    var list = new AL(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function fluidId(fluid) {
    var Registries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
    return fluid == null ? 'null' : String(Registries.FLUIDS.getKey(fluid))
  }

  // the JSON of every input or output content of one capability (item or fluid) of a GT recipe
  function contents(list) {
    return asArray(list).map(function (c) {
      try {
        return JSON.parse(String(c.content.toJson()))
      } catch (e) {
        return null
      }
    })
  }

  function itemOf(j) {
    if (!j) return null
    var count = Number(j.count || 1)
    var ing = j.ingredient || j
    if (ing.item) return { id: String(ing.item), count: count }
    if (ing.tag) return { id: '#' + String(ing.tag), count: count }
    return null
  }

  function fluidOf(j) {
    if (!j || !j.value || j.value.length === 0) return null
    var v = j.value[0]
    return { id: String(v.fluid || ('#' + v.tag)), count: Number(j.amount) }
  }

  function describe(list) {
    return list.map(function (x) { return x === null ? '?' : x.count + 'x ' + x.id }).sort().join(', ')
  }

  function run(server) {
    var EVF = global.grindless && global.grindless.evFoundation
    if (!EVF || !EVF.ids || !EVF.recipes) {
      check('published', false, 'global.grindless.evFoundation is incomplete')
      return
    }
    var ids = EVF.ids
    var ItemCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
    var FluidCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
    var rm = server.getRecipeManager()

    safely('registry', function () {
      var items = [ids.sinteredRegolith, ids.moltenSaltCharge, ids.rutheniumCatalyst, ids.marsChart, ids.regolithDust,
        ids.merrilliteDust, ids.merrilliteRaw, ids.merrilliteMarsOre, 'gtceu:crushed_merrillite_ore', 'gtceu:purified_merrillite_ore',
        'gtceu:liquid_nitrogen_bucket', 'gtceu:methalox_bucket']
      var missing = items.filter(function (id) { return !Item.exists(id) })
      var block = Block.getBlock(ids.sinteredRegolith)
      var blockOk = block != null && !block.defaultBlockState().isAir()
      var fluids = [ids.liquidNitrogen, ids.methalox].filter(function (id) { return !Fluid.exists(id) })
      check('registry', missing.length === 0 && fluids.length === 0 && blockOk,
        'missing items: ' + (missing.join(', ') || 'none') + '; missing fluids: ' + (fluids.join(', ') || 'none') + '; block ' + (blockOk ? 'ok' : 'missing'))
    })

    safely('materials', function () {
      var problems = []
      var regolith = GTMaterials.get(EVF.materials.regolith)
      var merrillite = GTMaterials.get(EVF.materials.merrillite)
      var methalox = GTMaterials.get(EVF.materials.methalox)
      if (regolith == null || regolith.isNull()) problems.push('lunar_regolith not registered')
      else if (!regolith.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('lunar_regolith decomposes')
      if (merrillite == null || merrillite.isNull()) problems.push('merrillite not registered')
      else {
        if (!merrillite.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) problems.push('merrillite decomposes')
        var ore = merrillite.getProperty(PropertyKey.ORE)
        if (ore == null) problems.push('merrillite has no ore property')
        else {
          var by = asArray(ore.getOreByProducts()).map(function (m) { return String(m.getName()) }).sort().join(',')
          if (by !== 'apatite,tricalcium_phosphate') problems.push('merrillite byproducts ' + by)
        }
        if (String(merrillite.getChemicalFormula()).indexOf('REE') < 0) problems.push('merrillite formula ' + merrillite.getChemicalFormula())
      }
      if (methalox == null || methalox.isNull()) problems.push('methalox not registered')
      check('materials', problems.length === 0, problems.join('; ') || 'regolith and merrillite do not decompose; merrillite ore with apatite and tricalcium phosphate; formula ' + merrillite.getChemicalFormula())
    })

    safely('liquid_nitrogen', function () {
      var liquid = GTMaterials.Nitrogen.getFluid(GTFluidStorageKeys.LIQUID)
      var gas = GTMaterials.Nitrogen.getFluid()
      var problems = []
      if (fluidId(liquid) !== ids.liquidNitrogen) problems.push('liquid key is ' + fluidId(liquid))
      if (fluidId(gas) !== 'gtceu:nitrogen') problems.push('primary fluid is ' + fluidId(gas))
      var temp = liquid == null ? -1 : Number(liquid.getFluidType().getTemperature())
      if (temp !== EVF.liquidNitrogen.temperature) problems.push('temperature ' + temp)
      // GTM's fluid type names itself with Component.translatable(<our key>, material name); its getDescriptionId() stays the material's key
      var key = ''
      if (liquid != null) {
        var desc = liquid.getFluidType().getDescription()
        try {
          key = String(desc.getContents().getKey())
        } catch (e) {
          key = String(desc.getString())
        }
      }
      if (key !== EVF.liquidNitrogen.translation) problems.push('name key ' + key)
      check('liquid_nitrogen', problems.length === 0, problems.join('; ') || ids.liquidNitrogen + ' at ' + temp + ' K, name key ' + key + ', gas still gtceu:nitrogen')
    })

    safely('methalox', function () {
      var fluid = GTMaterials.get(EVF.materials.methalox).getFluid()
      var gas = GTMaterials.get(EVF.materials.methalox).getFluid(GTFluidStorageKeys.GAS)
      check('methalox', fluidId(fluid) === ids.methalox && fluidId(gas) === ids.methalox,
        'primary ' + fluidId(fluid) + ', gas key ' + fluidId(gas) + ', ' + Number(fluid.getFluidType().getTemperature()) + ' K')
    })

    // id -> { items in, items out, fluids in, fluids out, EU/t, duration } wanted
    var WANT = {}
    EVF.recipes.maceration.forEach(function (id, i) {
      var block = ['gcyr:moon_cobblestone', 'gcyr:moon_stone', 'gcyr:lunar_mare_regolith', 'gcyr:moon_sand'][i]
      WANT[id] = { inItems: '1x ' + block, outItems: '1x ' + ids.regolithDust, inFluids: '', outFluids: '' }
    })
    WANT[EVF.recipes.sintering] = { inItems: '4x ' + ids.regolithDust, outItems: '1x ' + ids.sinteredRegolith, inFluids: '', outFluids: '' }
    WANT[EVF.recipes.methalox] = { inItems: '', outItems: '', inFluids: '1000x gtceu:methane, 2000x gtceu:oxygen', outFluids: '3000x ' + ids.methalox }
    WANT[EVF.recipes.moltenSaltCharge] = {
      inItems: '16x gtceu:calcium_chloride_dust, 1x gtceu:titanium_frame, 2x gtceu:aluminium_single_cable, 4x gtceu:titanium_plate',
      outItems: '1x ' + ids.moltenSaltCharge, inFluids: '', outFluids: ''
    }
    WANT[EVF.recipes.rutheniumCatalyst] = { inItems: '1x gtceu:ruthenium_dust, 3x gtceu:sapphire_dust', outItems: '4x ' + ids.rutheniumCatalyst, inFluids: '', outFluids: '' }

    safely('recipes', function () {
      var problems = []
      var seen = 0
      Object.keys(WANT).forEach(function (id) {
        var found = rm.byKey(new ResourceLocation(id))
        if (!found.isPresent()) {
          problems.push(id + ' missing')
          return
        }
        seen++
        var r = found.get()
        var want = WANT[id]
        var got = {
          inItems: describe(contents(r.getInputContents(ItemCap)).map(itemOf)),
          outItems: describe(contents(r.getOutputContents(ItemCap)).map(itemOf)),
          inFluids: describe(contents(r.getInputContents(FluidCap)).map(fluidOf)),
          outFluids: describe(contents(r.getOutputContents(FluidCap)).map(fluidOf))
        }
        Object.keys(want).forEach(function (k) {
          var w = want[k].split(', ').filter(function (s) { return s !== '' }).sort().join(', ')
          if (got[k] !== w) problems.push(id + ' ' + k + ': ' + got[k] + ' (wanted ' + w + ')')
        })
      })
      check('recipes', problems.length === 0, problems.join('; ') || seen + ' recipes under their final ids, with their amounts')
    })

    safely('sintering_moon', function () {
      var found = rm.byKey(new ResourceLocation(EVF.recipes.sintering))
      if (!found.isPresent()) {
        check('sintering_moon', false, 'no sintering recipe')
        return
      }
      var dims = []
      asArray(found.get().conditions).forEach(function (c) {
        if (c.getDimension) dims.push(String(c.getDimension().location()) + (c.isReverse() ? ' (reversed)' : ''))
      })
      check('sintering_moon', dims.length === 1 && dims[0] === 'gcyr:luna', 'dimension conditions: ' + (dims.join(', ') || 'none'))
    })

    // GTM's ore chain centrifuges the impure and purified dusts back into the dust (with a byproduct): that is not a split. A decomposition
    // recipe would take the dust itself (gtceu:<material>_dust or #forge:dusts/<material>).
    safely('no_decomposition', function () {
      var DUSTS = ['"gtceu:lunar_regolith_dust"', '"forge:dusts/lunar_regolith"', '"gtceu:merrillite_dust"', '"forge:dusts/merrillite"']
      var bad = []
      var scanned = 0
      ;['gtceu:electrolyzer', 'gtceu:centrifuge'].forEach(function (typeId) {
        var type = GTRegistries.RECIPE_TYPES.get(new ResourceLocation(typeId))
        asArray(rm.getAllRecipesFor(type)).forEach(function (r) {
          scanned++
          var text = String(asArray(r.getInputContents(ItemCap)).map(function (c) { return String(c.content.toJson()) }).join(' '))
          if (DUSTS.some(function (d) { return text.indexOf(d) >= 0 })) bad.push(String(r.getId()))
        })
      })
      check('no_decomposition', bad.length === 0, bad.length ? 'split by ' + bad.join(', ') : scanned + ' electrolyzer and centrifuge recipes, none takes the new dusts')
    })
  }

  ServerEvents.customCommand('gg_test_ev_foundation', function (event) {
    try {
      run(event.getLevel().getServer())
    } catch (e) {
      check('run', false, 'exception: ' + e)
    }
    console.info('GGTEST|' + SCOPE + '|DONE')
  })
})()
