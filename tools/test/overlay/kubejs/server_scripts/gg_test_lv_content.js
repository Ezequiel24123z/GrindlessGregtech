// priority: -5124
// Gregtech Grindless - smoke test of the LV "more reinforced" content: the Sulfide Roaster and the Heliostat Tower (TEST-ONLY overlay:
// copied over the instance on the test PC, never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_lv_content;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|lv_content\|DONE@@900;;GGTEST\|dump\|DONE@@600'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>; scope = lv_content or a machine id; the last line is GGTEST|lv_content|DONE.
//   static (no world)
//     registry     the catalyst item, the mirror block and its item, the two machines, the two recipe types and their IO sizes,
//                  the structure descriptions and the heliostat's sun probes
//     recipes      6 sulfide_roasting + 2 solar_steam recipes, the mixer / assembler / crafting recipes
//     gtm_parity   every roast against GTM's own EBF roast (gtceu:electric_blast_furnace/<ore>_metallurgy): same solid outputs and
//                  chances, same EU/t and time, acid = the EBF's SO2, air = 5 x the EBF's oxygen
//     roast_tier   the roasts are 30 V x 4 A (LV by GTM's own measure: RecipeHelper.getRecipeEUtTier = 1)
//     solar_recipe both solar recipes: 50 mB -> 8 000 mB of steam, 10 ticks, 16 EU/t, GTM's daytime condition (day, not reversed)
//   in the world: the Overworld band X 3328..3391, Y 98..112, Z 0..15 (cleared first, chunks force-loaded)
//     <machine> DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW, then scenarios (energy hatches refilled, input hatches kept
//     full and output hatches drained every tick, so their size never limits a run; what goes in and out is counted)
//     sulfide_roaster  galena  -> massicot + 6 silver nuggets + 1 000 mB acid + 3 200 mB steam per run, 15 000 mB air, 1 020 mB water
//                      sulfur  -> 1 000 mB acid + 3 200 mB steam per run (overclocked by the two LV hatches: about 30 ticks a run)
//                      LOOKUP  GTM's lookup reaches the six recipes from their inputs
//     heliostat_tower  day       water -> steam by day, and the receiver's firebox casings light up (GTM active blocks)
//                      distilled distilled water -> steam
//                      night     time set 18000: no steam at all
//                      roof      day again, a block over the mast: no steam (the machine's sun check)
//                      day_again roof removed: steam again
//                      LOOKUP    both recipes reachable
//
// It moves the clock of the Overworld for the night and roof scenarios (and to daytime first if it is night) and puts it back at the
// end, unless something else changed it meanwhile: do not run it together with tests that need the night (gg_test_observatory).
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'lv_content'
  var STEP = 5
  var FORM_TIMEOUT = 300
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLvContentRequest'

  var BAND = { x0: 3328, x1: 3391, y0: 98, y1: 112, z0: 0, z1: 15 }
  var DAY = 6000
  var NIGHT = 18000

  var ROASTER = 'gtceu:sulfide_roaster'
  var HELIO = 'gtceu:heliostat_tower'
  var CATALYST = 'grindless:contact_catalyst'
  var MIRROR = 'grindless:heliostat_mirror'
  var FULL = 16000

  var PART_BLOCKS = {
    energy_input: 'gtceu:lv_energy_input_hatch',
    input_bus: 'gtceu:lv_input_bus',
    output_bus: 'gtceu:lv_output_bus',
    input_hatch: 'gtceu:lv_input_hatch',
    output_hatch: 'gtceu:lv_output_hatch',
    muffler: 'gtceu:lv_muffler_hatch'
  }
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var metaMachineClass = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 900)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(scope, check, status, detail) {
    var line = TAG + scope + '|' + check + '|' + status
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
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
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

  function recipeById(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  // item contents of a GT recipe as [{id or tag, count, chance, maxChance}]
  function itemContents(list) {
    return asArray(list).map(function (c) {
      var j = JSON.parse(String(c.content.toJson()))
      var ing = j.ingredient || j
      var key = ing.item ? ing.item : (ing.tag ? '#' + ing.tag : JSON.stringify(ing))
      return { id: key, count: j.count || 1, chance: Number(c.chance), maxChance: Number(c.maxChance) }
    })
  }

  function fluidContents(list) {
    return asArray(list).map(function (c) {
      var st = c.content.getStacks()[0]
      return { id: fluidName(st), amount: Number(st.getAmount()) }
    })
  }

  function eutOf(recipe) {
    var eu = recipe.getInputEUt()
    return { v: Number(eu.voltage()), a: Number(eu.amperage()), total: Number(eu.voltage()) * Number(eu.amperage()) }
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var G = global.grindless
    var LVC = G.lvContent || {}
    var R = LVC.roaster
    var H = LVC.heliostat
    var ic = lazy().ItemCap
    var fc = lazy().FluidCap

    // registry
    var problems = []
    if (!R || !H) problems.push('global.grindless.lvContent.roaster/heliostat missing (server scripts not loaded)')
    ;[CATALYST, MIRROR].forEach(function (id) { if (!Item.exists(id)) problems.push('item ' + id) })
    var mirrorBlock = String(Block.getId(Block.getBlock(MIRROR)))
    if (mirrorBlock !== MIRROR) problems.push('block ' + MIRROR + ' (got ' + mirrorBlock + ')')
    ;[ROASTER, HELIO].forEach(function (id) { if (!GTRegistries.MACHINES.get(rl(id))) problems.push('machine ' + id) })
    var roasting = GTRegistries.RECIPE_TYPES.get(rl('gtceu:sulfide_roasting'))
    var solar = GTRegistries.RECIPE_TYPES.get(rl('gtceu:solar_steam'))
    var io = 'missing'
    if (!roasting || !solar) problems.push('recipe types')
    else {
      io = 'roasting ' + roasting.getMaxInputs(ic) + '/' + roasting.getMaxOutputs(ic) + ' items ' + roasting.getMaxInputs(fc) + '/' +
        roasting.getMaxOutputs(fc) + ' fluids; solar ' + solar.getMaxInputs(fc) + '/' + solar.getMaxOutputs(fc) + ' fluids'
      if (roasting.getMaxInputs(ic) !== 2 || roasting.getMaxOutputs(ic) !== 2 || roasting.getMaxInputs(fc) !== 2 ||
        roasting.getMaxOutputs(fc) !== 2 || solar.getMaxInputs(fc) !== 1 || solar.getMaxOutputs(fc) !== 1) problems.push('io sizes ' + io)
    }
    ;[ROASTER, HELIO].forEach(function (id) { if (!G.patterns.describe(id)) problems.push('structure description ' + id) })
    var probes = LVC.heliostatProbes
    if (!probes || !probes.top || probes.field.length !== 4) problems.push('heliostat sun probes')
    check(SCOPE, 'registry', problems.length === 0, 'io=[' + io + '] probes=' + JSON.stringify(probes || null) +
      (problems.length > 0 ? ' problems=' + problems.join('; ') : ''))
    if (!R || !H) return

    // recipes
    var rm = S.server.getRecipeManager()
    var haveRoast = roasting ? rm.getAllRecipesFor(roasting).size() : -1
    var haveSolar = solar ? rm.getAllRecipesFor(solar).size() : -1
    var ids = R.roasts.map(function (r) { return r.recipe }).concat([R.sulfur.recipe, R.catalystRecipe, R.controllerRecipe])
      .concat(H.recipes).concat([H.mirrorRecipe, H.controllerRecipe])
    var missing = ids.filter(function (id) { return recipeById(id) === null })
    check(SCOPE, 'recipes', haveRoast === R.roasts.length + 1 && haveSolar === H.recipes.length && missing.length === 0,
      'sulfide_roasting=' + haveRoast + '/' + (R.roasts.length + 1) + ' solar_steam=' + haveSolar + '/' + H.recipes.length +
      ' ids=' + ids.length + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))

    // GTM parity: every roast against GTM's own EBF roast
    var bad = []
    var seen = []
    R.roasts.forEach(function (r) {
      var ours = recipeById(r.recipe)
      var ebf = recipeById(r.ebf)
      if (ours === null || ebf === null) {
        bad.push(r.id + ': ' + (ours === null ? 'no roaster recipe ' : '') + (ebf === null ? 'no EBF recipe ' + r.ebf : ''))
        return
      }
      var oItems = itemContents(ours.getOutputContents(ic)).map(function (x) { return x.id + 'x' + x.count + '@' + x.chance + '/' + x.maxChance }).sort()
      var eItems = itemContents(ebf.getOutputContents(ic)).map(function (x) { return x.id + 'x' + x.count + '@' + x.chance + '/' + x.maxChance }).sort()
      var oFluidsOut = fluidContents(ours.getOutputContents(fc))
      var eFluidsOut = fluidContents(ebf.getOutputContents(fc))
      var oFluidsIn = fluidContents(ours.getInputContents(fc))
      var eFluidsIn = fluidContents(ebf.getInputContents(fc))
      var acid = 0, steam = 0, so2 = 0, air = 0, oxygen = 0, water = 0
      oFluidsOut.forEach(function (f) { if (f.id === 'gtceu:sulfuric_acid') acid = f.amount; if (f.id === 'gtceu:steam') steam = f.amount })
      eFluidsOut.forEach(function (f) { if (f.id === 'gtceu:sulfur_dioxide') so2 = f.amount })
      oFluidsIn.forEach(function (f) { if (f.id === 'gtceu:air') air = f.amount; if (f.id === 'minecraft:water') water = f.amount })
      eFluidsIn.forEach(function (f) { if (f.id === 'gtceu:oxygen') oxygen = f.amount })
      var oe = eutOf(ours)
      var ee = eutOf(ebf)
      var ok = oItems.join(',') === eItems.join(',') && acid === so2 && so2 === r.so2 && air === 5 * oxygen && steam === r.steam &&
        water === r.water && oe.total === ee.total && ours.duration === ebf.duration
      seen.push(r.id + ': [' + oItems.join(' ') + '] acid ' + acid + '=SO2 ' + so2 + ', air ' + air + '=5x' + oxygen + ' O2, steam ' + steam +
        ', water ' + water + ', ' + oe.total + ' EU/t (EBF ' + ee.total + ') x ' + ours.duration + ' t (EBF ' + ebf.duration + ')')
      if (!ok) bad.push(r.id + ' ours=[' + oItems.join(' ') + '] ebf=[' + eItems.join(' ') + '] acid=' + acid + ' so2=' + so2 + ' air=' + air +
        ' o2=' + oxygen + ' eu=' + oe.total + '/' + ee.total + ' t=' + ours.duration + '/' + ebf.duration)
    })
    check(SCOPE, 'gtm_parity', bad.length === 0 && seen.length === R.roasts.length, seen.join(' ; ') + (bad.length > 0 ? ' / bad: ' + bad.join(' ; ') : ''))

    // the roasts are LV by GTM's own measure (voltage 30, 4 A); the sulfur burner is one amp
    try {
      var tierBad = []
      var tierSeen = []
      R.roasts.map(function (r) { return { id: r.recipe, a: R.amperage } }).concat([{ id: R.sulfur.recipe, a: R.sulfur.amperage }]).forEach(function (x) {
        var rec = recipeById(x.id)
        if (rec === null) { tierBad.push(x.id + ' missing'); return }
        var e = eutOf(rec)
        var tier = Number(lazy().RecipeHelper.getRecipeEUtTier(rec))
        tierSeen.push(x.id.replace('grindless:sulfide_roasting/', '') + '=' + e.v + 'Vx' + e.a + 'A tier ' + tier + ' ' + rec.duration + 't')
        if (e.v !== R.voltage || e.a !== x.a || tier !== 1) tierBad.push(x.id)
      })
      check(SCOPE, 'roast_tier', tierBad.length === 0, tierSeen.join(' ') + (tierBad.length > 0 ? ' bad=' + tierBad.join(',') : ''))
    } catch (e0) {
      check(SCOPE, 'roast_tier', false, 'exception: ' + e0)
    }

    // the solar recipes: amounts, energy, time and GTM's daytime condition (day = not reversed)
    try {
      var solarBad = []
      var solarSeen = []
      H.recipes.forEach(function (id) {
        var rec = recipeById(id)
        if (rec === null) { solarBad.push(id + ' missing'); return }
        var fin = fluidContents(rec.getInputContents(fc))
        var fout = fluidContents(rec.getOutputContents(fc))
        var e = eutOf(rec)
        var conds = asArray(rec.conditions).map(function (c) {
          return String(c.getClass().getSimpleName()) + (c.isReverse() ? '(reverse)' : '')
        })
        var day = conds.filter(function (c) { return c.indexOf('DaytimeCondition') >= 0 && c.indexOf('reverse') < 0 }).length === 1
        solarSeen.push(id.replace('grindless:solar_steam/', '') + ': ' + fin.map(function (f) { return f.amount + ' ' + f.id }).join('+') + ' -> ' +
          fout.map(function (f) { return f.amount + ' ' + f.id }).join('+') + ' ' + e.total + ' EU/t ' + rec.duration + ' t conditions=[' + conds.join(',') + ']')
        if (!day || fin.length !== 1 || fin[0].amount !== H.waterPerRun || fout.length !== 1 || fout[0].id !== 'gtceu:steam' ||
          fout[0].amount !== H.steamPerRun || e.total !== H.eut || rec.duration !== H.duration) solarBad.push(id)
      })
      check(SCOPE, 'solar_recipe', solarBad.length === 0, solarSeen.join(' ; ') + (solarBad.length > 0 ? ' bad=' + solarBad.join(',') : ''))
    } catch (e1) {
      check(SCOPE, 'solar_recipe', false, 'exception: ' + e1)
    }
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_lv_multis.js)

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

  // facing north: x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)
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
    return {
      id: machineId, cx: cx, cy: cy, cz: cz, cells: placed, desc: desc,
      size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function setBlock(c) {
    return S.server.runCommandSilent('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
  }

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
    check(plan.id, 'PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z +
      ' parts=[' + parts.join(' ') + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeSymbol(sym) {
    if (sym.kind === 'oneOf') return 'oneOf(' + sym.options.map(describeSymbol).join(' | ') + ')'
    if (sym.kind === 'blocks') return sym.blocks.join('/')
    if (sym.kind === 'frames') return 'frame ' + sym.materials.join('/')
    if (sym.kind === 'part') return 'part ' + sym.ability
    return sym.kind
  }

  function describeError(m, ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var pos = err.getPos()
        var px = pos.getX()
        var py = pos.getY()
        var pz = pos.getZ()
        text += ' at ' + px + ',' + py + ',' + pz + ' found ' + blockIdAt(px, py, pz)
        for (var i = 0; i < m.plan.cells.length; i++) {
          var c = m.plan.cells[i]
          if (c.x === px && c.y === py && c.z === pz) {
            text += ' expected symbol ' + c.ch + ' = ' + describeSymbol(c.sym) + ' (placed ' + c.block.id + c.props + ')'
            break
          }
        }
      } catch (e1) {
        text += ' (no position: ' + e1 + ')'
      }
      try { text += ' info=' + err.getErrorInfo().getString() } catch (e2) { /* optional */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
  }

  function previewCheck(id, def, plan, wantParts, wantBlocks) {
    var shapes = asArray(def.getMatchingShapes())
    var blocks = shapes[0].getBlocks()
    var counts = {}
    var total = 0
    for (var x = 0; x < blocks.length; x++) {
      for (var y = 0; y < blocks[x].length; y++) {
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var bid = String(Block.getId(info.getBlockState().getBlock()))
          if (bid === 'minecraft:air') continue
          counts[bid] = (counts[bid] || 0) + 1
          total++
        }
      }
    }
    var missing = []
    wantParts.forEach(function (ability) {
      var found = false
      Object.keys(counts).forEach(function (bid) {
        if (bid.indexOf('_' + PART_BLOCKS[ability].replace(/^gtceu:[a-z]+_/, '')) > 0 || bid === PART_BLOCKS[ability]) found = true
      })
      if (!found) missing.push(ability)
    })
    wantBlocks.forEach(function (b) { if (!counts[b[0]] || counts[b[0]] < b[1]) missing.push(b[0] + ' x' + b[1] + ' (has ' + (counts[b[0]] || 0) + ')') })
    if (!counts[id]) missing.push('controller')
    check(id, 'PREVIEW', shapes.length >= 1 && missing.length === 0,
      'shapes=' + shapes.length + ' blocks=' + total + ' (placed structure: ' + plan.blocks + ')' +
      (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // ---------------------------------------------------------------- parts, inputs and outputs

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
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : Number(st.getAmount()) }
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
    return P
  }

  function topUpEnergy(m) {
    m.parts.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  // every tick: input hatches back to full (counting what the machine took), output hatches emptied (counting what came out)
  function tickFluids(m) {
    var r = m.run
    if (!r) return
    r.fluids.forEach(function (f, i) {
      var hatch = m.parts.inHatches[i]
      var t = tankInfo(hatch)
      var have = t.id === f[0] ? t.amount : 0
      if (have < FULL) {
        r.used[f[0]] = (r.used[f[0]] || 0) + (r.lastIn[i] - have)
        hatch.tank.setFluidInTank(0, Fluid.of(f[0], FULL).getFluidStack())
        r.lastIn[i] = FULL
      }
    })
    m.parts.outHatches.forEach(function (hatch) {
      var t = tankInfo(hatch)
      if (t.amount > 0) {
        r.out[t.id] = (r.out[t.id] || 0) + t.amount
        r.outLog.push(S.t + ':' + t.id.replace(/^[a-z]+:/, '') + '=' + t.amount)
        hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
      }
    })
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    if (P.inBus !== null) clearInventory(P.inBus.getInventory())
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    P.outHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillScenario(m, sc) {
    var P = m.parts
    if (sc.items.length > 0) {
      var inv = P.inBus.getInventory()
      sc.items.forEach(function (input, slot) {
        var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
        if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
      })
    }
    if (sc.fluids.length > P.inHatches.length) throw new Error('the scenario needs ' + sc.fluids.length + ' input hatches, the machine has ' + P.inHatches.length)
    sc.fluids.forEach(function (f, i) { P.inHatches[i].tank.setFluidInTank(0, Fluid.of(f[0], FULL).getFluidStack()) })
    m.run = { fluids: sc.fluids, lastIn: sc.fluids.map(function () { return FULL }), used: {}, out: {}, outLog: [], seen: {} }
    note(m.id, 'INPUT_' + sc.name, 'bus=[' + (P.inBus ? itemSummary(readBus(P.inBus)) : 'none') + '] fluids=[' +
      sc.fluids.map(function (f) { return f[0] + ' kept at ' + FULL }).join(', ') + '] energy hatches=' + P.energy.length +
      ' input hatches=' + P.inHatches.length + ' output hatches=' + P.outHatches.length)
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      var fails = asArray(rlg.getFailureReasons()).map(function (c) { return String(c.getString()) })
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id + ' ' + last.duration + 't' : 'none') + (fails.length > 0 ? ' failureReasons=[' + fails.join(' ; ') + ']' : '')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  function collect(m) {
    var counts = {}
    m.parts.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    return { items: counts, used: m.run.used, out: m.run.out, outLog: m.run.outLog, seen: m.run.seen,
      leftover: m.parts.inBus ? readBus(m.parts.inBus) : {} }
  }

  function seenIds(r) {
    return Object.keys(r.seen).join(',')
  }

  function fluidSummary(map) {
    return Object.keys(map).sort().map(function (id) { return id + ' ' + map[id] }).join(', ')
  }

  function unexpected(counts, allowed) {
    return Object.keys(counts).filter(function (id) { return allowed.indexOf(id) < 0 })
  }

  // used is whole runs, or whole runs plus the run that was still in progress when the scenario ended
  function usedMatches(used, perRun, runs) {
    return used === perRun * runs || used === perRun * (runs + 1)
  }

  // ---------------------------------------------------------------- the clock

  function dayTime() {
    return Number(S.level.getDayTime()) % 24000
  }

  function setClock(time, why) {
    if (S.clock === null) S.clock = { original: dayTime(), startTick: S.server.getTickCount() }
    S.server.runCommandSilent('time set ' + time)
    S.clock.lastSet = time
    S.clock.lastSetTick = S.server.getTickCount()
    note(SCOPE, 'CLOCK', 'time set ' + time + ' (' + why + '); now ' + dayTime() + ' night=' + S.level.isNight())
  }

  function restoreClock() {
    if (S === null || S.clock === null) return
    var c = S.clock
    var now = S.server.getTickCount()
    var expected = (c.lastSet + (now - c.lastSetTick)) % 24000
    var drift = Math.abs(dayTime() - expected)
    if (drift > 200 && drift < 23800) {
      note(SCOPE, 'CLOCK', 'not restored: the time was changed by something else (now ' + dayTime() + ', expected about ' + expected + ')')
    } else {
      var back = (c.original + (now - c.startTick)) % 24000
      S.server.runCommandSilent('time set ' + back)
      note(SCOPE, 'CLOCK', 'restored to ' + back + ' (was ' + c.original + ' when the test started)')
    }
    S.clock = null
  }

  function ensureDay(why) {
    if (S.level.isNight()) setClock(DAY, why)
    if (S.level.isRaining()) {
      S.server.runCommandSilent('weather clear')
      note(SCOPE, 'WEATHER', 'it was raining: weather clear (' + why + ')')
    }
  }

  // ---------------------------------------------------------------- scenarios

  function roasterScenarios() {
    var R = global.grindless.lvContent.roaster
    var galena = R.roasts.filter(function (r) { return r.id === 'galena' })[0]
    return [
      {
        name: 'galena', ticks: 290,
        items: [{ id: 'gtceu:galena_dust', n: 8 }, { id: CATALYST, n: 8 }], fluids: [['gtceu:air'], ['minecraft:water']],
        verify: function (r) {
          var runs = r.items['gtceu:massicot_dust'] || 0
          var nuggets = r.items['gtceu:silver_nugget'] || 0
          var acid = r.out['gtceu:sulfuric_acid'] || 0
          var steam = r.out['gtceu:steam'] || 0
          var air = r.used['gtceu:air'] || 0
          var water = r.used['minecraft:water'] || 0
          var dustUsed = 8 - (r.leftover['gtceu:galena_dust'] || 0)
          var extra = unexpected(r.items, ['gtceu:massicot_dust', 'gtceu:silver_nugget'])
          return {
            ok: runs >= 2 && nuggets === 6 * runs && acid === galena.so2 * runs && steam === galena.steam * runs &&
              usedMatches(air, R.air, runs) && usedMatches(water, galena.water, runs) && usedMatches(dustUsed, 1, runs) &&
              extra.length === 0 && r.seen['grindless:sulfide_roasting/galena'] === true,
            detail: 'runs(massicot)=' + runs + ' silver nuggets=' + nuggets + ' out=[' + fluidSummary(r.out) + '] used=[' + fluidSummary(r.used) +
              '] galena used=' + dustUsed + ' catalysts left=' + (r.leftover[CATALYST] || 0) + ' recipes seen=[' + seenIds(r) + '] items=[' +
              itemSummary(r.items) + ']' + (extra.length > 0 ? ' unexpected=' + extra.join(',') : '')
          }
        }
      },
      {
        name: 'sulfur', ticks: 200,
        items: [{ id: 'gtceu:sulfur_dust', n: 16 }, { id: CATALYST, n: 8 }], fluids: [['gtceu:air'], ['minecraft:water']],
        verify: function (r) {
          var acid = r.out['gtceu:sulfuric_acid'] || 0
          var runs = acid / R.sulfur.so2
          var steam = r.out['gtceu:steam'] || 0
          var air = r.used['gtceu:air'] || 0
          var water = r.used['minecraft:water'] || 0
          var used = 16 - (r.leftover['gtceu:sulfur_dust'] || 0)
          return {
            ok: runs >= 2 && runs === Math.floor(runs) && steam === R.sulfur.steam * runs && usedMatches(air, R.sulfur.air, runs) &&
              usedMatches(water, R.sulfur.water, runs) && usedMatches(used, 1, runs) && Object.keys(r.items).length === 0 &&
              r.seen['grindless:sulfide_roasting/sulfur'] === true,
            detail: 'runs(acid)=' + runs + ' in 200 ticks out=[' + fluidSummary(r.out) + '] used=[' + fluidSummary(r.used) + '] sulfur used=' + used +
              ' recipes seen=[' + seenIds(r) + '] items=[' + itemSummary(r.items) + '] outputs by tick=[' + r.outLog.slice(0, 12).join(' ') + ']'
          }
        }
      }
    ]
  }

  function roasterLookupCases() {
    var R = global.grindless.lvContent.roaster
    return R.roasts.map(function (r) {
      return { label: r.id, items: [{ id: 'gtceu:' + r.id + '_dust', n: 1 }, { id: CATALYST, n: 1 }], fluids: [['gtceu:air'], ['minecraft:water']], want: r.recipe }
    }).concat([{ label: 'sulfur', items: [{ id: 'gtceu:sulfur_dust', n: 1 }, { id: CATALYST, n: 1 }], fluids: [['gtceu:air'], ['minecraft:water']], want: R.sulfur.recipe }])
  }

  function receiverLit(m) {
    // the receiver's steel firebox casings: GTM switches their "active" state while the machine works
    var lit = 0
    var total = 0
    m.plan.cells.forEach(function (c) {
      if (c.block.id !== 'gtceu:steel_firebox_casing') return
      total++
      var st = S.level.getBlockState(new BlockPos(c.x, c.y, c.z))
      if (String(st).indexOf('active=true') >= 0) lit++
    })
    return { lit: lit, total: total }
  }

  function roofPos(m) {
    // the cell above the top probe (the mast), facing north: back = +z, side = -x per column
    var p = global.grindless.lvContent.heliostatProbes.top
    return { x: m.ctrl.x - p.side, y: m.ctrl.y + p.up + 1, z: m.ctrl.z + p.back }
  }

  function heliostatScenarios() {
    var H = global.grindless.lvContent.heliostat
    function steamOk(r, wantRecipe) {
      var steam = r.out['gtceu:steam'] || 0
      var runs = steam / H.steamPerRun
      var water = 0
      Object.keys(r.used).forEach(function (k) { water += r.used[k] })
      return {
        runs: runs,
        ok: runs >= 1 && runs === Math.floor(runs) && usedMatches(water, H.waterPerRun, runs) && r.seen[wantRecipe] === true,
        detail: 'runs=' + runs + ' steam=' + steam + ' used=[' + fluidSummary(r.used) + '] recipes seen=[' + seenIds(r) + ']'
      }
    }
    return [
      {
        name: 'day', ticks: 100, items: [], fluids: [['minecraft:water']],
        setup: function (m) { ensureDay('the day scenario needs the sun') },
        during: function (m, ctrl, running) {
          if (running === 40) m.lit = receiverLit(m)
        },
        verify: function (r, m) {
          var s = steamOk(r, 'grindless:solar_steam/water')
          var lit = m.lit || { lit: -1, total: -1 }
          return { ok: s.ok && s.runs >= 5 && lit.lit === lit.total && lit.total === 18,
            detail: s.detail + ' receiver firebox casings lit while working=' + lit.lit + '/' + lit.total + ' (expected 18) time=' + dayTime() }
        }
      },
      {
        name: 'distilled', ticks: 60, items: [], fluids: [['gtceu:distilled_water']],
        verify: function (r) { var s = steamOk(r, 'grindless:solar_steam/distilled_water'); return { ok: s.ok, detail: s.detail } }
      },
      {
        // a run that started before the clock moved cannot finish at night (the daytime condition stops it), and none may start:
        // only the steam after the first 20 ticks counts (the sky darkens on the next tick)
        name: 'night', ticks: 100, items: [], fluids: [['minecraft:water']],
        setup: function (m) { setClock(NIGHT, 'the night scenario') },
        during: function (m, ctrl, running) {
          if (running === 20) m.snap = m.run.out['gtceu:steam'] || 0
        },
        verify: function (r, m, ctrl) {
          var steam = r.out['gtceu:steam'] || 0
          var after = steam - (m.snap || 0)
          return { ok: after === 0 && m.snap !== null && S.level.isNight(), detail: 'no steam expected at night: steam after 20 ticks=' + after +
            ' (total ' + steam + ') used=[' + fluidSummary(r.used) + '] night=' + S.level.isNight() + ' ' + recipeState(ctrl) }
        }
      },
      {
        // by day under a roof: the run under way may finish (the sun check runs before each run), no new one may start
        name: 'roof', ticks: 100, items: [], fluids: [['minecraft:water']],
        setup: function (m) {
          setClock(DAY, 'the roof scenario needs the sun')
          var p = roofPos(m)
          S.server.runCommandSilent('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:stone replace')
          m.roof = p
          note(m.id, 'ROOF', 'stone over the mast at ' + p.x + ',' + p.y + ',' + p.z + ' (' + blockIdAt(p.x, p.y, p.z) + ')')
        },
        during: function (m, ctrl, running) {
          if (running === 20) m.snap = m.run.out['gtceu:steam'] || 0
        },
        verify: function (r, m, ctrl) {
          var steam = r.out['gtceu:steam'] || 0
          var after = steam - (m.snap || 0)
          return { ok: after === 0 && m.snap !== null && !S.level.isNight(), detail: 'no steam expected under a roof by day: steam after 20 ticks=' +
            after + ' (total ' + steam + ') used=[' + fluidSummary(r.used) + '] night=' + S.level.isNight() + ' ' + recipeState(ctrl) }
        },
        teardown: function (m) {
          var p = m.roof
          if (p) S.server.runCommandSilent('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace')
        }
      },
      {
        name: 'day_again', ticks: 80, items: [], fluids: [['minecraft:water']],
        verify: function (r) { var s = steamOk(r, 'grindless:solar_steam/water'); return { ok: s.ok, detail: 'after the roof came off: ' + s.detail } }
      }
    ]
  }

  function heliostatLookupCases() {
    return [
      { label: 'water', items: [], fluids: [['minecraft:water']], want: 'grindless:solar_steam/water' },
      { label: 'distilled', items: [], fluids: [['gtceu:distilled_water']], want: 'grindless:solar_steam/distilled_water' }
    ]
  }

  // ---------------------------------------------------------------- lookup checks

  function candidateIds(ctrl) {
    var ids = []
    var it = ctrl.getRecipeType().db().iterator(ctrl, function (r) { return true })
    if (it === null || it === undefined) return ids
    var guard = 0
    while (it.hasNext() && guard < 200) {
      ids.push(String(it.next().id))
      guard++
    }
    return ids
  }

  function runLookup(m, ctrl, cases) {
    var bad = []
    m.run = null
    cases.forEach(function (c) {
      var P = m.parts
      if (P.inBus !== null) clearInventory(P.inBus.getInventory())
      P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
      if (P.inBus !== null) {
        var inv = P.inBus.getInventory()
        c.items.forEach(function (input, slot) { inv.insertItem(slot, Item.of(input.id, input.n), false) })
      }
      c.fluids.forEach(function (f, i) { P.inHatches[i].tank.setFluidInTank(0, Fluid.of(f[0], FULL).getFluidStack()) })
      var ids = candidateIds(ctrl)
      if (ids.indexOf(c.want) < 0) bad.push(c.label + ' wanted ' + c.want + ' got [' + ids.slice(0, 6).join(',') + ']')
    })
    check(m.id, 'LOOKUP', bad.length === 0, 'cases=' + cases.length + (bad.length > 0 ? ' unreachable=' + bad.join('; ') : ''))
  }

  // ---------------------------------------------------------------- machines

  var SPECS = [
    { id: ROASTER, x: 3336, y: 101, z: 2, scenarios: roasterScenarios, lookup: roasterLookupCases,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch', 'output_hatch'],
      previewBlocks: [['gtceu:steel_firebox_casing', 9], ['gtceu:heatproof_machine_casing', 18]] },
    { id: HELIO, x: 3360, y: 99, z: 2, scenarios: heliostatScenarios, lookup: heliostatLookupCases,
      previewParts: ['energy_input', 'input_hatch', 'output_hatch'],
      previewBlocks: [[MIRROR, 28], ['gtceu:steel_firebox_casing', 18]] }
  ]

  function prepareWorld() {
    for (var cx = Math.floor(BAND.x0 / 16); cx <= Math.floor(BAND.x1 / 16); cx++) S.level.getChunk(cx, 0)
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    // the heliostat needs open sky: what stands above the band is not ours to clear, so report it
    var HM = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
    var highest = -999
    for (var x = 3357; x <= 3363; x++) {
      for (var z = 2; z <= 8; z++) {
        var h = Number(S.level.getHeight(HM.MOTION_BLOCKING, x, z))
        if (h > highest) highest = h
      }
    }
    S.skyClear = highest <= BAND.y1 + 1
    note(SCOPE, 'AREA', 'chunks ' + Math.floor(BAND.x0 / 16) + '..' + Math.floor(BAND.x1 / 16) + ',0 force-loaded, changed ' + cleared +
      ' blocks while clearing; highest ground over the heliostat field after clearing: Y ' + highest + ' (sky clear: ' + S.skyClear + ')')
  }

  function startMachine(spec) {
    var m = { id: spec.id, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, parts: null,
      scenarios: null, sc: -1, scStart: 0, run: null, stateNoted: false }
    S.machines.push(m)
    try {
      var def = GTRegistries.MACHINES.get(rl(spec.id))
      if (def === null || def === undefined) {
        check(spec.id, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      var desc = global.grindless.patterns.describe(spec.id)
      m.builtBefore = !!(desc && desc.built)
      m.def = def
      m.plan = planOf(spec.id, spec.x, spec.y, spec.z)
      check(spec.id, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size +
        ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m.plan)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(spec.id, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
  }

  function observe(m, ctrl) {
    try {
      var last = ctrl.getRecipeLogic().getLastRecipe()
      if (last && m.run) m.run.seen[String(last.id)] = true
    } catch (e) { /* optional */ }
  }

  function nextScenario(m, ctrl) {
    var prev = m.sc >= 0 ? m.scenarios[m.sc] : null
    if (prev && prev.teardown) {
      try { prev.teardown(m, ctrl) } catch (e0) { check(m.id, 'TEARDOWN_' + prev.name, false, 'exception: ' + e0) }
    }
    m.sc++
    if (m.sc >= m.scenarios.length) {
      try {
        runLookup(m, ctrl, m.spec.lookup())
      } catch (e) {
        check(m.id, 'LOOKUP', false, 'exception: ' + e)
      }
      resetMachine(m, ctrl)
      m.phase = 'done'
      return
    }
    var sc = m.scenarios[m.sc]
    resetMachine(m, ctrl)
    m.stateNoted = false
    m.lit = null
    m.snap = null
    if (sc.setup) sc.setup(m, ctrl)
    fillScenario(m, sc)
    m.scStart = S.t
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.id, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.id, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') +
          'parts=[' + partIds(ctrl).join(' ') + ']')
        check(m.id, 'PATTERN', global.grindless.patterns.describe(m.id).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try {
          previewCheck(m.id, m.def, m.plan, m.spec.previewParts, m.spec.previewBlocks)
        } catch (e3) {
          check(m.id, 'PREVIEW', false, 'exception: ' + e3)
        }
        m.parts = findParts(ctrl)
        if (m.parts.energy.length === 0 || m.parts.inHatches.length === 0 || m.parts.outHatches.length === 0) {
          check(m.id, 'PARTS', false, 'missing parts: energy=' + m.parts.energy.length + ' input hatches=' + m.parts.inHatches.length +
            ' output hatches=' + m.parts.outHatches.length)
          m.phase = 'done'
          return
        }
        m.scenarios = m.spec.scenarios()
        m.sc = -1
        m.phase = 'running'
        topUpEnergy(m)
        nextScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!global.grindless.patterns.describe(m.id).built) {
          check(m.id, 'FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        if (!ctrl.checkPatternWithLock()) {
          check(m.id, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        check(m.id, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }
    if (m.phase === 'running') {
      var sc = m.scenarios[m.sc]
      var running = S.t - m.scStart
      if (sc.during) sc.during(m, ctrl, running)
      if (!m.stateNoted && running >= 40) {
        m.stateNoted = true
        note(m.id, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          verdict = sc.verify(collect(m), m, ctrl)
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(m.id, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
        m.run = null
        nextScenario(m, ctrl)
      }
    }
  }

  function allDone() {
    for (var i = 0; i < S.machines.length; i++) {
      if (S.machines[i].phase !== 'done') return false
    }
    return true
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try { restoreClock() } catch (e) { note(SCOPE, 'CLOCK', 'restore failed: ' + e) }
    console.info(TAG + SCOPE + '|DONE')
  }

  // every tick: energy, fluids and what the controller is running; every STEP ticks: the state machine
  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    S.t = now - S.tick0
    S.machines.forEach(function (m) {
      if (m.phase !== 'running' || m.parts === null) return
      try {
        topUpEnergy(m)
        tickFluids(m)
        var ctrl = machineAt(m.ctrl)
        if (ctrl) observe(m, ctrl)
      } catch (e) { /* the next step reports problems */ }
    })
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    try {
      S.machines.forEach(function (m) {
        if (m.phase === 'done') return
        try {
          advance(m)
        } catch (e) {
          check(m.id, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      })
      if (allDone()) finish()
    } catch (e) {
      check(SCOPE, 'STEP', false, 'exception: ' + e)
      finish()
    }
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
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machines: [], finished: false, clock: null, skyClear: true }
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
    SPECS.forEach(startMachine)
    if (allDone()) finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_lv_content', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_lv_content run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
