// Gregtech Grindless - smoke test of the EV Platinum Plant (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with
// the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_ev_platinum_plant' -WaitForLog 'GGTEST\|ev_platinum_plant\|DONE@@900'
//
// Trimmed from the full scratch test of 2026-10-24 (39 PASS: the generator checked a second way against the loose line, the overclock with
// two hatches, the whole line chained, the ME hatches, the electrode used up for certain). What is left proves the mechanism on today's pack:
//   ev_platinum_plant|registration   recipe type gtceu:pgm_refining with its IO sizes, and the machine
//   ev_platinum_plant|counts         7 recipes (2 attack + 3 separation + IV's iridosmine + LuV's asteroid) built from the 40 stages of GT--'s live line
//                                    (31 for EV, 9 for the iridium and osmium of modes 3 and 4, whose first stages are IV-B2's fusion, read from
//                                    global.grindless.mercury.fusion, and LuV A2's virtual asteroid opening), none skipped, each in the recipe
//                                    manager under its final id (grindless:pgm_refining/<ev|iv|luv>/<name>: GTM's builder puts the type in front)
//   ev_platinum_plant|figures        every recipe the script built has the inputs, outputs, chances, duration and EU/t it had on 2026-10-24
//                                    (the loose line has not changed under the plant; mode 3 since 2026-10-25, IV-B3, which also moved the
//                                    plant onto server_scripts/grindless/lib/compose.js with the same results), and its live recipe in the
//                                    recipe manager has the same duration and EU/t. The live inputs, outputs and chances are not read back
//                                    here: compare them in the dump (gg_dump.js, the final recipe set). Mode 3 runs in gg_test_naquadah_plant.
//   ev_platinum_plant|crafting       the plant and the electrode recipes, under their final ids
//   platinum_plant|DESCRIPTION / PLACED / FORMED / PATTERN / PARTS   the registered description placed block by block, formed by itself
//   platinum_plant|PROCESS_attack_pentlandite   the leach: 9 ore + electrode -> 1 sludge + 18 nickel + oxygen + sulfuric acid
//   platinum_plant|PROCESS_no_electrode         the same ore without the electrode: nothing runs (the plant's condition)
//   platinum_plant|PROCESS_rhodium_ruthenium    a separation: the widest recipe of the type (7 items with the circuit, 3 fluids in,
//                                               8 item outputs since the rarest metal mixture left it, 4 fluids out)
//   platinum_plant|LOOKUP                       GTM's recipe lookup reaches every recipe of the plant (seven since LuV A2) from its inputs
//   ev_platinum_plant|DONE                      last line
//
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 5888-5951, Y 98-112, Z 0-15 (tests run at the
// same time in one server; other bands belong to other tests). The plant faces north with its controller at (5898, 102, 8). Everything is
// driven by the structure description that lib/patterns.js records (global.grindless.structures). var + function everywhere (this Rhino
// throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'ev_platinum_plant'
  var KEY = 'platinum_plant'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var BAND = { x0: 5888, x1: 5951, y0: 98, y1: 112, z0: 0, z1: 15 }
  var CONTROLLER = { x: 5898, y: 102, z: 8 }

  // The pack's Additional Placements mod reloads the datapacks (so these scripts too) a couple of seconds after the server is up; a test
  // that is running then is lost. The command therefore only leaves a request in `global` (it survives script reloads) and the tick handler
  // starts the test once these scripts have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestEvPlatinumPlantRequest'

  var PLANT_ID = 'gtceu:platinum_plant'
  var TYPE_ID = 'gtceu:pgm_refining'
  var ELECTRODE = 'grindless:platinum_electrode'
  var ORE_PENTLANDITE = 'gtceu:purified_pentlandite_ore'
  // the live stages the plans read: 31 of GT--'s platinum line (EV) and 9 of its iridium and osmium chain (mode 3, IV)
  var STAGE_COUNT = 40

  // what every generated recipe was on 2026-10-24 (scratch run6, GT-- 1.3.10): item [count or whole, chance of 10 000]; fluids in mB.
  // 2026-10-25 (IV-B3, iv.md decision 5): platinum and rhodium_ruthenium no longer give the iridium metal residue and the rarest metal
  // mixture (offworld_only.json strips them from GT--'s loose line, and the plant reads its stages the same way); all else is unchanged
  var REFERENCE = {
    attack_pentlandite: {
      duration: 54, eut: 1903, circuit: 1,
      itemsIn: { 'gtceu:purified_pentlandite_ore': [9, 10000], 'grindless:platinum_electrode': [1, 10] },
      fluidsIn: {},
      itemsOut: { 'gtceu:nickel_dust': [18, 0], 'gtceu:platinum_group_sludge_dust': [1, 0] },
      fluidsOut: { 'gtceu:oxygen': 18000, 'gtceu:sulfuric_acid': 9000 }
    },
    attack_chalcopyrite: {
      duration: 54, eut: 1903, circuit: 1,
      itemsIn: { 'gtceu:purified_chalcopyrite_ore': [9, 10000], 'grindless:platinum_electrode': [1, 10] },
      fluidsIn: {},
      itemsOut: { 'gtceu:copper_dust': [18, 0], 'gtceu:platinum_group_sludge_dust': [1, 0] },
      fluidsOut: { 'gtceu:oxygen': 18000, 'gtceu:sulfuric_acid': 9000 }
    },
    platinum: {
      duration: 2314, eut: 1920, circuit: 2,
      itemsIn: { 'gtceu:platinum_group_sludge_dust': [1, 10000], 'gtceu:calcium_dust': [3, 10000], 'grindless:platinum_electrode': [1, 10] },
      fluidsIn: { 'gtceu:nitration_mixture': 54000, 'gtceu:ammonium_chloride': 10800 },
      itemsOut: {
        'gtceu:platinum_dust': [6, 0], 'gtceu:gold_dust': [3, 0], 'gtceu:silicon_dioxide_dust': [3, 0], 'gtceu:platinum_slag_dust': [6, 0],
        'gtceu:palladium_metal_dust': [0, 9500], 'gtceu:calcium_chloride_dust': [9, 0]
      },
      fluidsOut: { 'gtceu:palladium_rich_ammonia': 10800, 'gtceu:nitrogen_dioxide': 27000, 'gtceu:diluted_sulfuric_acid': 27000 }
    },
    palladium: {
      duration: 891, eut: 1919, circuit: 2,
      itemsIn: { 'gtceu:palladium_metal_dust': [1, 9500], 'grindless:platinum_electrode': [1, 10] },
      fluidsIn: { 'gtceu:ammonia': 18575, 'gtceu:palladium_rich_ammonia': 10800, 'gtceu:formic_acid': 8393 },
      itemsOut: { 'gtceu:palladium_dust': [4, 1964] },
      fluidsOut: {}
    },
    rhodium_ruthenium: {
      duration: 517, eut: 1920, circuit: 2,
      itemsIn: {
        'gtceu:platinum_slag_dust': [6, 10000], 'gtceu:potassium_pyrosulfate_dust': [16, 9734], 'gtceu:zinc_dust': [3, 7476],
        'gtceu:sodium_nitrate_dust': [7, 9612], 'gtceu:saltpeter_dust': [7, 8900], 'grindless:platinum_electrode': [1, 10]
      },
      fluidsIn: { 'gtceu:hydrochloric_acid': 28260, 'gtceu:salt_water': 624, 'gtceu:steam': 2181 },
      itemsOut: {
        'gtceu:rhodium_dust': [1, 3457], 'gtceu:ruthenium_dust': [4, 4856], 'gtceu:zinc_sulfate_dust': [13, 4569], 'gtceu:salt_dust': [4, 1866]
      },
      fluidsOut: { 'gtceu:ammonia': 1346, 'gtceu:chlorine': 25082, 'minecraft:water': 5331, 'gtceu:potassium': 403 }
    },
    // IV (IV-B3, 2026-10-25): IV-B2's fusion + GT--'s iridium and osmium chain, 3 Ir : 1 Os
    iridosmine: {
      duration: 1034, eut: 1919, circuit: 3,
      itemsIn: {
        'gtceu:iridosmine_dust': [10, 10000], 'gtceu:saltpeter_dust': [10, 10000], 'gtceu:calcium_dust': [3, 10000], 'grindless:platinum_electrode': [1, 10]
      },
      fluidsIn: { 'gtceu:salt_water': 1000, 'gtceu:hydrochloric_acid': 12500, 'gtceu:hydrogen': 7000 },
      itemsOut: {
        'gtceu:iridium_dust': [3, 0], 'gtceu:osmium_dust': [1, 0], 'gtceu:platinum_sludge_residue_dust': [3, 0], 'gtceu:metal_sludge_dust': [3, 0],
        'gtceu:calcium_chloride_dust': [12, 0]
      },
      fluidsOut: { 'minecraft:water': 4700, 'gtceu:steam': 1000 }
    }
  }

  var PART_BLOCKS = {
    energy_input: 'gtceu:ev_energy_input_hatch',
    input_bus: 'gtceu:ev_input_bus',
    output_bus: 'gtceu:ev_output_bus',
    input_hatch: 'gtceu:ev_input_hatch',
    output_hatch: 'gtceu:ev_output_hatch'
  }
  var NEED = { energy: 1, inBus: true, outBuses: 1, inHatches: 3, outHatches: 4 }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var metaMachineClass = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(scope, name, status, detail) {
    var line = TAG + scope + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(scope, name, ok, detail) {
    emit(scope, name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(scope, name, detail) {
    emit(scope, name, 'NOTE', detail)
  }

  function asArray(coll) {
    var AL = Java.loadClass('java.util.ArrayList')
    var list = new AL(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function lazy() {
    if (classes === null) {
      classes = {
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
      }
    }
    return classes
  }

  function machineAt(p) {
    if (metaMachineClass === null) metaMachineClass = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    return metaMachineClass.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function itemSummary(counts) {
    return Object.keys(counts).sort().map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function short(id) {
    return String(id).replace(/^gtceu:/, '')
  }

  function planNamed(name) {
    var list = global.grindless.platinumPlant.recipes
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i]
    }
    throw new Error('no generated pgm_refining recipe ' + name)
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  // ---------------------------------------------------------------- static checks

  function recipeCount(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? S.server.getRecipeManager().getAllRecipesFor(type).size() : -1
  }

  // a generated recipe against its 2026-10-24 reference: { id: [n, chance] } and { id: mB } maps, both ways
  function compareRecipe(p, ref, problems) {
    var label = p.name
    if (p.duration !== ref.duration || p.eut !== ref.eut) problems.push(label + ' ' + p.duration + ' t x ' + p.eut + ' EU/t, was ' + ref.duration + ' x ' + ref.eut)
    if (p.circuit !== ref.circuit) problems.push(label + ' circuit ' + p.circuit + ', was ' + ref.circuit)
    function pairs(list, countKey) {
      var m = {}
      list.forEach(function (x) { m[x.id] = [x[countKey], x.chance] })
      return m
    }
    function amounts(list) {
      var m = {}
      list.forEach(function (x) { m[x.id] = x.amount })
      return m
    }
    function both(kind, have, want, same) {
      var keys = {}
      Object.keys(have).forEach(function (k) { keys[k] = true })
      Object.keys(want).forEach(function (k) { keys[k] = true })
      Object.keys(keys).forEach(function (k) {
        if (have[k] === undefined) problems.push(label + ' ' + kind + ' lacks ' + short(k))
        else if (want[k] === undefined) problems.push(label + ' ' + kind + ' has new ' + short(k))
        else if (!same(have[k], want[k])) problems.push(label + ' ' + kind + ' ' + short(k) + ' ' + JSON.stringify(have[k]) + ', was ' + JSON.stringify(want[k]))
      })
    }
    function samePair(a, b) { return a[0] === b[0] && a[1] === b[1] }
    function sameNumber(a, b) { return a === b }
    both('items in', pairs(p.itemsIn, 'count'), ref.itemsIn, samePair)
    both('fluids in', amounts(p.fluidsIn), ref.fluidsIn, sameNumber)
    both('items out', pairs(p.itemsOut, 'whole'), ref.itemsOut, samePair)
    both('fluids out', amounts(p.fluidsOut), ref.fluidsOut, sameNumber)
  }

  function summary(p) {
    return p.name + ' ' + p.duration + ' t x ' + p.eut + ' EU/t = ' + p.energy + ' EU (stages ' + Math.round(p.sourceEnergy) + '), in=[' +
      p.itemsIn.map(function (x) { return x.count + ' ' + short(x.id) + (x.chance < 10000 ? '@' + x.chance : '') }).join(' ') + '] ' +
      p.fluidsIn.map(function (f) { return f.amount + ' ' + short(f.id) }).join(' ') + ' out=[' +
      p.itemsOut.map(function (o) { return short(o.id) + ' ' + o.whole + '+' + o.chance }).join(' ') + '] ' +
      p.fluidsOut.map(function (f) { return f.amount + ' ' + short(f.id) }).join(' ')
  }

  function staticChecks() {
    var PP = global.grindless.platinumPlant
    var ic = lazy().ItemCap
    var fc = lazy().FluidCap

    var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE_ID))
    var machine = GTRegistries.MACHINES.get(rl(PLANT_ID))
    var sizes = type ? [type.getMaxInputs(ic), type.getMaxOutputs(ic), type.getMaxInputs(fc), type.getMaxOutputs(fc)] : []
    var sizesOk = !!type && sizes.join(',') === [PP.maxIO.itemsIn, PP.maxIO.itemsOut, PP.maxIO.fluidsIn, PP.maxIO.fluidsOut].join(',')
    check(SCOPE, 'registration', sizesOk && !!machine && Item.exists(ELECTRODE),
      'pgm_refining=' + (type ? 'registered (items in/out, fluids in/out: ' + sizes.join('/') + ')' : 'missing') + ' machine=' + (machine ? 'registered' : 'missing') +
      ' electrode=' + (Item.exists(ELECTRODE) ? 'registered' : 'missing'))

    var attack = PP.recipes.filter(function (p) { return p.mode === 'attack' })
    var sep = PP.recipes.filter(function (p) { return p.mode === 'separation' })
    var iri = PP.recipes.filter(function (p) { return p.mode === 'iridosmine' })
    var ast = PP.recipes.filter(function (p) { return p.mode === 'asteroid' })
    var have = recipeCount(TYPE_ID)
    var absent = PP.recipes.filter(function (p) { return liveRecipe(p.recipeId) === null }).map(function (p) { return p.recipeId })
    // LuV A2's mode 4 (asteroid) adds a 7th recipe and no live stage (its opening is virtual, its chain is mode 3's)
    check(SCOPE, 'counts', attack.length === 2 && sep.length === 3 && iri.length === 1 && ast.length === 1 && PP.skipped.length === 0 &&
      PP.stages === STAGE_COUNT && have === 8 && absent.length === 0,
      'pgm_refining=' + have + ' (' + attack.length + ' attack + ' + sep.length + ' separation + ' + iri.length + ' iridosmine + ' + ast.length + ' asteroid) from ' +
      PP.stages +
      ' stages of the live line (want ' + STAGE_COUNT + '), skipped=' + PP.skipped.length +
      (PP.skipped.length > 0 ? ' (' + PP.skipped.map(function (s) { return s.name + ': ' + s.reason }).join('; ') + ')' : '') +
      ' ids=' + PP.recipes.map(function (p) { return p.recipeId }).join(',') + (absent.length > 0 ? ' not in the recipe manager=' + absent.join(',') : ''))

    var problems = []
    Object.keys(REFERENCE).forEach(function (name) {
      var p = null
      try {
        p = planNamed(name)
      } catch (e) {
        problems.push(String(e))
        return
      }
      compareRecipe(p, REFERENCE[name], problems)
      var live = liveRecipe(p.recipeId)
      if (live === null) return
      var eu = lazy().Helper.getRealEUt(live)
      var liveEut = Number(eu.getTotalEU())
      if (Number(live.duration) !== p.duration || liveEut !== p.eut) {
        problems.push(name + ' in the recipe manager ' + live.duration + ' t x ' + liveEut + ' EU/t, the script made ' + p.duration + ' x ' + p.eut)
      }
    })
    check(SCOPE, 'figures', problems.length === 0, 'the script\'s 6 recipes against their references (inputs, outputs, chances, duration, EU/t); the live recipes have the same duration and EU/t' +
      (problems.length > 0 ? ' problems(' + problems.length + ')=' + problems.slice(0, 12).join(' ; ') : ''))

    var craftProblems = []
    var wants = [[PP.craftingRecipes.plant, PLANT_ID], [PP.craftingRecipes.electrode, ELECTRODE]]
    wants.forEach(function (w) {
      var r = liveRecipe(w[0])
      if (r === null) {
        craftProblems.push(w[0] + ' missing')
        return
      }
      var outs = asArray(lazy().Helper.getOutputItems(r)).map(function (st) { return String(st.getId()) + ' x' + st.getCount() })
      if (outs.join(',') !== w[1] + ' x1') craftProblems.push(w[0] + ' gives ' + outs.join(','))
    })
    check(SCOPE, 'crafting', craftProblems.length === 0, 'ids=' + PP.craftingRecipes.plant + ',' + PP.craftingRecipes.electrode +
      (craftProblems.length > 0 ? ' problems=' + craftProblems.join(' ; ') : ''))

    PP.recipes.forEach(function (p) {
      note(SCOPE, 'recipe_' + p.name, summary(p))
    })
  }

  // ---------------------------------------------------------------- structure (same technique as gg_test_mv_plant.js)

  function simpleBlock(sym, machineId) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!PART_BLOCKS[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: PART_BLOCKS[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: machineId, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  // a "casing OR parts" cell: the parts the limits ask for are spread evenly over the cells, the rest is the plain block
  function assignOneOf(sym, list, machineId) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, machineId))
      } else if (filler === null) {
        filler = simpleBlock(o, machineId)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more required parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing
  // north: x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(machineId, cx, cy, cz) {
    var desc = global.grindless.patterns.describe(machineId)
    if (!desc) throw new Error('no structure description recorded for ' + machineId)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym, block: null, props: '' })
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    cells.forEach(function (c) {
      c.x = cx - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
    })

    var byChar = {}
    cells.forEach(function (c) {
      if (!byChar[c.ch]) byChar[c.ch] = []
      byChar[c.ch].push(c)
    })
    Object.keys(byChar).forEach(function (ch) {
      var sym = desc.symbols[ch]
      var list = byChar[ch]
      if (sym.kind === 'oneOf') {
        assignOneOf(sym, list, machineId)
      } else {
        var b = simpleBlock(sym, machineId)
        list.forEach(function (c) { c.block = b })
      }
    })

    var occupied = {}
    cells.forEach(function (c) {
      if (c.block) occupied[c.x + ',' + c.y + ',' + c.z] = true
    })
    cells.forEach(function (c) {
      if (!c.block) return
      if (c.block.controller) {
        c.props = '[facing=north]'
      } else if (c.block.ability) {
        for (var i = 0; i < SIDES.length; i++) {
          var s = SIDES[i]
          if (!occupied[(c.x + s[1]) + ',' + (c.y + s[2]) + ',' + (c.z + s[3])]) {
            c.props = '[facing=' + s[0] + ']'
            break
          }
        }
      }
    })

    var placed = cells.filter(function (c) { return c.block !== null })
    var width = desc.slices[0][0].length
    return {
      id: machineId,
      cells: placed,
      size: width + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function setBlock(c) {
    return S.server.runCommandSilent('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
  }

  // everything but the controller first, the controller last
  function place(plan) {
    var failed = []
    var ctrlCell = null
    plan.cells.forEach(function (c) {
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (setBlock(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (setBlock(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    plan.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }

    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) {
      return c.block.ability + '@' + c.x + ',' + c.y + ',' + c.z + c.props
    })
    check(KEY, 'PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z + ' parts=[' + parts.join(' ') + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeError(m, ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var pos = err.getPos()
        text += ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' found ' + blockIdAt(pos.getX(), pos.getY(), pos.getZ())
      } catch (e1) {
        text += ' (no position: ' + e1 + ')'
      }
      try {
        text += ' info=' + err.getErrorInfo().getString()
      } catch (e2) { /* optional */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
  }

  // ---------------------------------------------------------------- inputs and outputs

  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = String(st.getId())
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : st.getAmount() }
  }

  function findParts(ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], inHatches: [], outHatches: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBus = p
      else if (pid === PART_BLOCKS.output_bus) P.outBuses.push(p)
      else if (pid === PART_BLOCKS.input_hatch) P.inHatches.push(p)
      else if (pid === PART_BLOCKS.output_hatch) P.outHatches.push(p)
    })
    function byPos(a, b) {
      var pa = a.self().getPos()
      var pb = b.self().getPos()
      return (pa.getY() - pb.getY()) || (pa.getX() - pb.getX()) || (pa.getZ() - pb.getZ())
    }
    P.inHatches.sort(byPos)
    P.outHatches.sort(byPos)
    return P
  }

  function topUpEnergy(m) {
    if (m.parts === null) return
    m.parts.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  // an idle, freshly formed multiblock can stop ticking: wake its recipe logic after the inputs change
  function wake(ctrl) {
    try {
      ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the scenario reports what did not run */ }
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    if (P.inBus !== null) {
      clearInventory(P.inBus.getInventory())
      clearInventory(P.inBus.getCircuitInventory())
    }
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    P.outHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillInputs(m, sc) {
    var P = m.parts
    var inv = P.inBus !== null ? P.inBus.getInventory() : null
    ;(sc.items || []).forEach(function (input, slot) {
      if (inv === null) throw new Error('the scenario needs an input bus but the machine has none')
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    if (sc.circuit) {
      // the bus circuit slot refuses insertItem (its capability IO is NONE); players set it through the GUI
      P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    }
    ;(sc.fluids || []).forEach(function (f) {
      if (!P.inHatches[f.hatch]) throw new Error('the scenario needs input hatch ' + f.hatch + ' but the machine has ' + P.inHatches.length)
      // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
      P.inHatches[f.hatch].tank.setFluidInTank(0, Fluid.of(f.id, f.mb).getFluidStack())
    })
  }

  function fillScenario(m, ctrl, sc) {
    var P = m.parts
    var leftIn = P.inHatches.map(tankInfo).filter(function (t) { return t.amount > 0 }).length
    var leftOut = P.outHatches.map(tankInfo).filter(function (t) { return t.amount > 0 }).length
    fillInputs(m, sc)
    wake(ctrl)
    note(KEY, 'INPUT_' + sc.name, 'bus=[' + itemSummary(readBus(P.inBus)) + '] circuit=' + (sc.circuit ? sc.circuit : 'none') +
      ' fluids=[' + (sc.fluids || []).map(function (f) { return 'hatch ' + f.hatch + ': ' + f.id + ' ' + f.mb + ' mB' }).join(' ; ') + ']' +
      ' hatches still holding fluid after the reset: ' + leftIn + ' in, ' + leftOut + ' out')
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id + ' parallels=' + last.parallels : 'none')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // what GTM's own recipe lookup and matching say about the machine right now (used when a machine stays idle)
  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      if (!match) {
        out.push('lookup=none')
      } else {
        out.push('lookup=' + match.id)
        try { out.push('matchRecipe=' + lazy().Helper.matchRecipe(ctrl, match).isSuccess()) } catch (e1) { out.push('matchRecipe threw ' + e1) }
      }
      out.push('workingEnabled=' + ctrl.isWorkingEnabled())
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  function sumTanks(list) {
    var t = {}
    list.forEach(function (h) {
      if (h.id !== 'none' && h.amount > 0) t[h.id] = (t[h.id] || 0) + h.amount
    })
    return t
  }

  function collect(m) {
    var P = m.parts
    var counts = {}
    P.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    return {
      items: counts,
      fluidIn: P.inHatches.map(tankInfo),
      fluidOut: sumTanks(P.outHatches.map(tankInfo)),
      leftover: P.inBus !== null ? readBus(P.inBus) : {},
      seen: m.seen
    }
  }

  function seenIds(r) {
    return Object.keys(r.seen).map(function (id) { return id + '(x' + r.seen[id] + ')' }).join(',')
  }

  // ---------------------------------------------------------------- scenarios

  // the checks a run of a plant recipe gets: the items and fluids that come out, the fluids that go in, the items that are used up. Whole
  // amounts exactly; a chanced output between none and one more; a chanced input used up whole or not at all
  function judgeRun(plan, r, input) {
    var problems = []
    var have = []
    plan.itemsOut.forEach(function (o) {
      var got = r.items[o.id] || 0
      var hi = o.whole + (o.chance > 0 ? 1 : 0)
      have.push(short(o.id) + ' ' + got + ' [' + o.whole + '-' + hi + ']')
      if (got < o.whole || got > hi) problems.push(o.id + ' ' + got + ' not in ' + o.whole + '-' + hi)
    })
    Object.keys(r.items).forEach(function (id) {
      if (!plan.itemsOut.some(function (o) { return o.id === id })) problems.push('unexpected item ' + id)
    })
    plan.fluidsOut.forEach(function (f) {
      var got = r.fluidOut[f.id] || 0
      have.push(short(f.id) + ' ' + got + ' mB')
      if (got !== f.amount) problems.push(f.id + ' ' + got + ' mB, wanted ' + f.amount)
    })
    Object.keys(r.fluidOut).forEach(function (id) {
      if (!plan.fluidsOut.some(function (f) { return f.id === id })) problems.push('unexpected fluid out ' + id + ' ' + r.fluidOut[id])
    })
    var used = []
    plan.fluidsIn.forEach(function (f, i) {
      var left = r.fluidIn[i] ? r.fluidIn[i].amount : -1
      var spent = input.fluidStart[i] - left
      used.push(short(f.id) + ' used ' + spent + ' of ' + f.amount)
      if (spent !== f.amount) problems.push(f.id + ' used ' + spent + ' mB, wanted ' + f.amount)
    })
    plan.itemsIn.forEach(function (x) {
      var spent = (input.itemStart[x.id] || 0) - (r.leftover[x.id] || 0)
      if (x.chance >= 10000) {
        used.push(short(x.id) + ' used ' + spent)
        if (spent !== x.count) problems.push(x.id + ' used ' + spent + ', wanted ' + x.count)
      } else {
        used.push(short(x.id) + ' used ' + spent + ' (' + x.chance + '/10000 of ' + x.count + ')')
        if (spent !== 0 && spent !== x.count) problems.push(x.id + ' used ' + spent + ', wanted 0 or ' + x.count)
      }
    })
    return { problems: problems, have: have, used: used }
  }

  // one run of a plant recipe (no parallels): what is used up for certain, all of it; a chanced input one run's worth, and one electrode
  // more so a worn one is seen. Every fluid with 300 mB to spare
  function recipeScenario(plan) {
    var sc = { name: plan.name, ticks: plan.duration + 60, circuit: plan.circuit, items: [], fluids: [] }
    plan.itemsIn.forEach(function (x) {
      sc.items.push({ id: x.id, n: x.count + (x.id === ELECTRODE ? 1 : 0) })
    })
    sc.fluids = plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount + 300 } })
    sc.verify = function (r) {
      var itemStart = {}
      sc.items.forEach(function (x) { itemStart[x.id] = (itemStart[x.id] || 0) + x.n })
      var judged = judgeRun(plan, r, { fluidStart: sc.fluids.map(function (f) { return f.mb }), itemStart: itemStart })
      if (r.seen[plan.recipeId] === undefined) judged.problems.push('recipe ' + plan.recipeId + ' never ran')
      var others = Object.keys(r.seen).filter(function (id) { return id !== plan.recipeId })
      if (others.length > 0) judged.problems.push('other recipes seen ' + others.join(','))
      return {
        ok: judged.problems.length === 0,
        detail: plan.recipeId + ' (' + plan.duration + ' t, ' + plan.eut + ' EU/t): ' + judged.have.join(', ') + ' | ' + judged.used.join(' ; ') +
          ' | recipes seen=[' + seenIds(r) + ']' + (judged.problems.length > 0 ? ' | problems: ' + judged.problems.join(' ; ') : '')
      }
    }
    return sc
  }

  // a scenario that must NOT run anything: what is in the bus and the hatches stays there
  function idleScenario(name, items, circuit, why) {
    var itemStart = {}
    items.forEach(function (x) { itemStart[x.id] = x.n })
    return {
      name: name,
      ticks: 80,
      items: items,
      circuit: circuit,
      fluids: [],
      verify: function (r) {
        var problems = []
        if (Object.keys(r.seen).length > 0) problems.push('recipes ran: ' + seenIds(r))
        if (Object.keys(r.items).length > 0) problems.push('items came out: ' + itemSummary(r.items))
        if (Object.keys(r.fluidOut).length > 0) problems.push('fluids came out: ' + Object.keys(r.fluidOut).join(','))
        Object.keys(itemStart).forEach(function (id) {
          if ((r.leftover[id] || 0) !== itemStart[id]) problems.push(id + ' left ' + (r.leftover[id] || 0) + ' of ' + itemStart[id])
        })
        return {
          ok: problems.length === 0,
          detail: why + ' | nothing ran and nothing was used' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  function scenarios() {
    return [
      recipeScenario(planNamed('attack_pentlandite')),
      idleScenario('no_electrode', [{ id: ORE_PENTLANDITE, n: 9 }], 1, 'circuit 1, nine ores, but no electrode in the bus'),
      recipeScenario(planNamed('rhodium_ruthenium'))
    ]
  }

  // ---------------------------------------------------------------- lookup

  // every recipe GTM's lookup can reach with the inputs now in the machine (the predicate accepts everything)
  function candidateIds(ctrl) {
    var ids = []
    var it = ctrl.getRecipeType().db().iterator(ctrl, function (r) { return true })
    if (it === null || it === undefined) return ids
    var guard = 0
    while (it.hasNext() && guard < 900) {
      ids.push(String(it.next().id))
      guard++
    }
    return ids
  }

  function runLookup(m, ctrl) {
    var bad = []
    var P = m.parts
    global.grindless.platinumPlant.recipes.forEach(function (plan) {
      clearInventory(P.inBus.getInventory())
      clearInventory(P.inBus.getCircuitInventory())
      P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
      fillInputs(m, {
        items: plan.itemsIn.map(function (x) { return { id: x.id, n: x.count } }),
        circuit: plan.circuit,
        fluids: plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount } })
      })
      var ids = candidateIds(ctrl)
      if (ids.indexOf(plan.recipeId) < 0) bad.push(plan.name + ' wanted ' + plan.recipeId + ' got [' + ids.slice(0, 6).join(',') + ']')
    })
    resetMachine(m, ctrl)
    check(KEY, 'LOOKUP', bad.length === 0, 'cases=' + global.grindless.platinumPlant.recipes.length + (bad.length > 0 ? ' unreachable=' + bad.join('; ') : ''))
  }

  // ---------------------------------------------------------------- the machine

  // the chunks of the band are generated and force-loaded, and the band (and only the band) is cleared
  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note(SCOPE, 'AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine() {
    var m = { phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, parts: null, list: null, sc: -1, scStart: 0, seen: {}, stateNoted: false }
    S.machine = m
    try {
      if (!GTRegistries.MACHINES.get(rl(PLANT_ID))) {
        check(KEY, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the pattern itself,
      // lazily, when the controller first checks its structure (what happens in a real world)
      var desc = global.grindless.patterns.describe(PLANT_ID)
      m.builtBefore = !!(desc && desc.built)
      m.plan = planOf(PLANT_ID, CONTROLLER.x, CONTROLLER.y, CONTROLLER.z)
      check(KEY, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size + ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m.plan)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(KEY, 'DESCRIPTION', false, 'exception while describing or placing: ' + e)
      m.phase = 'done'
    }
  }

  function observe(m, ctrl) {
    try {
      var last = ctrl.getRecipeLogic().getLastRecipe()
      if (last) {
        var id = String(last.id)
        var p = Number(last.parallels)
        if (m.seen[id] === undefined || p > m.seen[id]) m.seen[id] = p
      }
    } catch (e) { /* optional */ }
  }

  function nextScenario(m, ctrl) {
    m.sc++
    if (m.sc >= m.list.length) {
      try {
        runLookup(m, ctrl)
      } catch (e) {
        check(KEY, 'LOOKUP', false, 'exception: ' + e)
      }
      m.phase = 'done'
      return
    }
    var sc = m.list[m.sc]
    resetMachine(m, ctrl)
    m.seen = {}
    m.stateNoted = false
    fillScenario(m, ctrl, sc)
    m.scStart = S.t
  }

  function partsProblem(P) {
    var problems = []
    if (P.energy.length !== NEED.energy) problems.push('energy hatches ' + P.energy.length + ' (wanted ' + NEED.energy + ')')
    if ((P.inBus !== null) !== NEED.inBus) problems.push('input bus ' + (P.inBus !== null))
    if (P.outBuses.length !== NEED.outBuses) problems.push('output buses ' + P.outBuses.length + ' (wanted ' + NEED.outBuses + ')')
    if (P.inHatches.length !== NEED.inHatches) problems.push('input hatches ' + P.inHatches.length + ' (wanted ' + NEED.inHatches + ')')
    if (P.outHatches.length !== NEED.outHatches) problems.push('output hatches ' + P.outHatches.length + ' (wanted ' + NEED.outHatches + ')')
    return problems
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(KEY, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(KEY, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') +
          'parts=[' + partIds(ctrl).join(' ') + '] tier=' + (ctrl.getTier ? ctrl.getTier() : '?'))
        check(KEY, 'PATTERN', global.grindless.patterns.describe(PLANT_ID).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        m.parts = findParts(ctrl)
        var problems = partsProblem(m.parts)
        check(KEY, 'PARTS', problems.length === 0, problems.length > 0 ? problems.join('; ') :
          '1 energy hatch, 1 input bus, 1 output bus, 3 input hatches, 4 output hatches')
        if (problems.length > 0) {
          m.phase = 'done'
          return
        }
        m.list = scenarios()
        m.sc = -1
        m.phase = 'running'
        topUpEnergy(m)
        nextScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!global.grindless.patterns.describe(PLANT_ID).built) {
          check(KEY, 'FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        if (!ctrl.checkPatternWithLock()) {
          check(KEY, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        check(KEY, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }

    if (m.phase === 'running') {
      var sc = m.list[m.sc]
      var running = S.t - m.scStart
      observe(m, ctrl)
      if (!m.stateNoted && running >= 30) {
        m.stateNoted = true
        note(KEY, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' ' + diagnose(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          verdict = sc.verify(collect(m))
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(KEY, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
        nextScenario(m, ctrl)
      }
    }
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the steps
  function step(elapsed) {
    S.t = elapsed
    var m = S.machine
    if (m !== null && m.phase !== 'done') {
      try {
        advance(m)
      } catch (e) {
        check(KEY, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    }
    if (m === null || m.phase === 'done') finish()
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    if (S.machine !== null && S.machine.phase === 'running') {
      try { topUpEnergy(S.machine) } catch (e) { /* the next step reports problems */ }
    }
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step(now - S.tick0)
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check(SCOPE, 'run', false, 'exception: ' + e)
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machine: null, finished: false }
    try {
      staticChecks()
    } catch (e) {
      check(SCOPE, 'static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e) {
      check(SCOPE, 'AREA', false, 'exception: ' + e)
    }
    startMachine()
    if (S.machine === null || S.machine.phase === 'done') finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_ev_platinum_plant', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_ev_platinum_plant run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
