// priority: -1624
// Gregtech Grindless - smoke test of package B1, ev-tripod (TEST-ONLY overlay: copied over the instance on the test PC, never shipped
// with the pack): the EV Tripod Drill (gtceu:ev_vein_drill: startup_scripts/grindless/ev/tripod.js, server_scripts/grindless/ev/tripod.js)
// and the generic tier veto of the vein drill and greenhouse families (rules.recipeTier / isAboveTier, startup_scripts/grindless/lv/multis.js).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_ev_tripod;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|ev_tripod\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|ev_tripod|<check>|PASS|FAIL|NOTE|<detail>
//   static
//     registration   the machine (type gtceu:vein_drilling, its structure description), the wing panel, global.grindless.ev.tripod
//     rules          every vein_drilling and greenhouse recipe: the generic tier rule gives the old LV and MV vetoes exactly, the HV
//                    drill and greenhouse skip only the ev/ folder, the tripod takes only it; the IV drills' iv/ recipes (IV-B1, IV-B2)
//                    and a made-up iv/ recipe are above EV
//     recipes        one dry and one cooled recipe per 'ore' vein of every Moon or Mars table, each with its dimension, 8 EU/t, 200 t
//     wear           the bit's wear GTM reads: 100 / 10 000 dry, 25 cooled; 50 mB of liquid nitrogen per run
//     bit            the titanium bit is a drill bit again, made on the EV lathe (> 512 EU/t, so not in HV), its old conversion gone
//     crafting       the controller (Lunar Drill, EV hull, motors, pump) and the wing panel recipes
//     solar          the wings' share by dimension and time of day, and the dimension of the live Moon level
//   in the world: the Moon (gcyr:luna), band X 6912..6975, Y 198..214, Z 0..15 (force-loaded, cleared and used only by this test)
//     tripod_PLACED / _FORMED / _PARTS           the description placed block by block forms (1 EV energy hatch)
//     tripod_PROCESS_earth_refused     an Earth sample and bit: nothing runs (the tripod drills no Earth vein)
//     tripod_PROCESS_dry_day           lunar ilmenite, dry, by day: 64 runs at once, one overclock, 3.75 ores per run, the EU/t halved
//                                      by the wings, and the bits wear
//     tripod_PROCESS_dry_night         the same by night: the full EU/t
//     tripod_PROCESS_cooled            liquid nitrogen in the hatch: the cooled recipe runs (the dry one waits), 5.625 ores per run,
//                                      50 mB per run
//     tripod_PROCESS_cooled_low        30 mB (less than one run): back to dry drilling instead of stalling
//     hv_drill_PROCESS_lunar_refused   an HV Vein Drill on the Moon with the lunar sample, titanium bits and liquid nitrogen: nothing
//                                      runs (its veto skips vein_drilling/ev/)
//     hv_drill_PROCESS_iron_control    the same HV drill drills iron with stainless steel bits up there (so it works)
//   ev_tripod|DONE                     last line
// The test sets the server's time of day (time set): run it on its own server or next to tests that do not depend on the sun.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'ev_tripod'
  var STEP = 10
  var FORM_TIMEOUT = 400
  var PREP_TICKS = 10
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestEvTripodRequest'

  var LUNA = 'gcyr:luna'
  var BAND = { x0: 6912, x1: 6975, y0: 198, y1: 214, z0: 0, z1: 15 }
  var TRIPOD = 'gtceu:ev_vein_drill'
  var HV_DRILL = 'gtceu:hv_vein_drill'
  var PANEL = 'grindless:solar_wing_panel'
  var BIT = 'grindless:titanium_drill_bit'
  var BIT_STAINLESS = 'grindless:stainless_steel_drill_bit'
  var SAMPLE = 'grindless:vein_sample_ilmenite_moon'
  var SAMPLE_IRON = 'grindless:vein_sample_iron'
  var LN2 = 'gtceu:liquid_nitrogen'
  var STONE = 'gcyr:moon_cobblestone'
  var DRY = 'grindless:vein_drilling/ev/ilmenite_moon_titanium'
  var COOLED = 'grindless:vein_drilling/ev/ilmenite_moon_titanium_cryo'
  var HV_IRON = 'grindless:vein_drilling/hv/iron_stainless_steel'
  var LATHE = 'grindless:lathe/titanium_drill_bit'
  var CONVERSION = 'grindless:crafting/stainless_steel_drill_bit_from_titanium'
  var DAY = 6000
  var NIGHT = 18000

  var PART_BLOCKS = {
    ev: {
      energy_input: 'gtceu:ev_energy_input_hatch', input_bus: 'gtceu:ev_input_bus', output_bus: 'gtceu:ev_output_bus',
      input_hatch: 'gtceu:ev_input_hatch', output_hatch: 'gtceu:ev_output_hatch'
    },
    hv: {
      energy_input: 'gtceu:hv_energy_input_hatch', input_bus: 'gtceu:hv_input_bus', output_bus: 'gtceu:hv_output_bus',
      input_hatch: 'gtceu:hv_input_hatch', output_hatch: 'gtceu:hv_output_hatch'
    }
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
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

  // ---------------------------------------------------------------- Java and small helpers

  function lazy() {
    if (J === null) {
      J = {
        ArrayList: Java.loadClass('java.util.ArrayList'),
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
      }
    }
    return J
  }

  function asArray(coll) {
    if (coll === null || coll === undefined) return []
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function cmd(text) {
    return S.server.runCommandSilent('execute in ' + LUNA + ' run ' + text)
  }

  function blockIdAt(x, y, z) {
    return String(S.moon.getBlock(x, y, z).getId())
  }

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.moon, new BlockPos(p.x, p.y, p.z))
  }

  function byId(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function recipesOfType(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? asArray(S.server.getRecipeManager().getAllRecipesFor(type)) : []
  }

  // total EU/t of a GT recipe (> 0 consumed)
  function eutOf(r) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(r)
    return io.isEmpty() ? 0 : Number(io.getTotalEU())
  }

  function conditionsText(r) {
    var out = []
    asArray(r.conditions).forEach(function (c) {
      try {
        out.push(String(c.serialize()))
      } catch (e) {
        var t = String(c.getClass().getSimpleName())
        try {
          t += ':"' + c.getDimension().location() + '"'
        } catch (e2) { /* not a dimension condition */ }
        out.push(t)
      }
    })
    return out.join(',')
  }

  function itemIdOf(stack) {
    return String(lazy().BI.ITEM.getKey(stack.getItem()))
  }

  function fluidIdOf(stack) {
    return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
  }

  function itemSummary(counts) {
    return Object.keys(counts).map(function (k) { return k.replace(/^[a-z_]+:/, '') + 'x' + counts[k] }).join(' ')
  }

  // ---------------------------------------------------------------- static checks

  function offworldVeins() {
    var G = global.grindless
    var out = []
    Object.keys(G.tables).forEach(function (name) {
      var table = G.tables[name]
      if (!table || !table.veins || (table.dimension !== 'gcyr:luna' && table.dimension !== 'gcyr:mars')) return
      table.veins.forEach(function (v) {
        if (v.kind === undefined || v.kind === 'ore') out.push({ id: v.id, dimension: String(table.dimension) })
      })
    })
    return out
  }

  function checkRegistration() {
    var def = GTRegistries.MACHINES.get(rl(TRIPOD))
    if (def === null || def === undefined) throw new Error(TRIPOD + ' is not registered')
    var types = []
    var arr = def.getRecipeTypes()
    for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
    var desc = global.grindless.patterns.describe(TRIPOD)
    var T = global.grindless.ev ? global.grindless.ev.tripod : null
    var problems = []
    if (types.join(',') !== 'gtceu:vein_drilling') problems.push('types=' + types.join(','))
    if (!desc) problems.push('no structure description')
    else if (desc.slices.length !== 6 || desc.slices[0].length !== 9 || desc.slices[0][0].length !== 9) problems.push('size ' + desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length)
    if (!Block.getBlock(PANEL) || String(Block.getId(Block.getBlock(PANEL))) !== PANEL) problems.push('block ' + PANEL + ' missing')
    if (!Item.exists(PANEL)) problems.push('item ' + PANEL + ' missing')
    if (!T || typeof T.solarFactor !== 'function' || T.cap !== 64) problems.push('global.grindless.ev.tripod missing or wrong')
    check('registration', problems.length === 0, 'types=[' + types.join(',') + '] structure ' + (desc ? desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' +
      desc.slices.length + ' (w x h x d)' : 'none') + ' cap=' + (T ? T.cap : '?') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function checkRules() {
    var rules = global.grindless.lv.rules
    var T = global.grindless.ev.tripod
    var all = recipesOfType('gtceu:vein_drilling').concat(recipesOfType('gtceu:greenhouse'))
    var bad = []
    var byTier = {}
    all.forEach(function (r) {
      var id = String(r.getId())
      var tier = rules.recipeTier(r)
      byTier[tier || 'steam'] = (byTier[tier || 'steam'] || 0) + 1
      var lv = rules.isAboveTier(r, 'lv')
      var mv = rules.isAboveTier(r, 'mv')
      var hv = rules.isAboveTier(r, 'hv')
      var tripodTakes = tier === T.tier
      if (tier === 'ev') {
        if (!lv || !mv || !hv) bad.push(id + ' ev but not above lv/mv/hv')
      } else if (tier !== '' && ['lv', 'mv', 'hv'].indexOf(tier) < 0) {
        // the IV drills' recipes (IV-B1's pressurized and IV-B2's Mercury drill): above every home drill and above the tripod
        if (!lv || !mv || !hv || !rules.isAboveTier(r, 'ev')) bad.push(id + ' ' + tier + ' but not above lv/mv/hv/ev')
        if (tripodTakes) bad.push(id + ' taken by the tripod')
      } else {
        // the vetoes before the generic rule: LV skipped /mv/ and /hv/, MV skipped /hv/, HV skipped nothing
        if (lv !== (rules.isMvRecipe(r) || rules.isHvRecipe(r))) bad.push(id + ' LV rule changed')
        if (mv !== rules.isHvRecipe(r)) bad.push(id + ' MV rule changed')
        if (hv) bad.push(id + ' above HV')
        if (tripodTakes) bad.push(id + ' taken by the tripod')
      }
    })
    function stub(path) {
      return { id: { getPath: function () { return path } } }
    }
    var iv = stub('vein_drilling/iv/some_vein_tungsten_steel')
    var future = rules.recipeTier(iv) === 'iv' && rules.isAboveTier(iv, 'ev') && !rules.isAboveTier(iv, 'iv') &&
      rules.recipeTier(stub('vein_drilling/iron_bronze')) === '' && !rules.isAboveTier(stub('greenhouse/oak'), 'lv')
    if (!future) bad.push('made-up iv/ and steam paths misread')
    check('rules', bad.length === 0 && all.length > 0, all.length + ' vein_drilling + greenhouse recipes by tier ' + JSON.stringify(byTier) +
      ': the LV and MV vetoes are what they were, HV skips only ev/, the tripod takes only ev/; the IV drills\' iv/ recipes and a made-up iv/ recipe are above EV' +
      (bad.length > 0 ? ' | problems: ' + bad.slice(0, 10).join('; ') : ''))
  }

  function checkRecipes() {
    var T = global.grindless.ev.tripod
    var ev = recipesOfType('gtceu:vein_drilling').filter(function (r) { return String(r.getId()).indexOf('grindless:vein_drilling/ev/') === 0 })
    var veins = offworldVeins()
    var want = []
    veins.forEach(function (v) {
      want.push({ id: 'grindless:vein_drilling/ev/' + v.id + '_titanium', dim: v.dimension })
      want.push({ id: 'grindless:vein_drilling/ev/' + v.id + '_titanium' + T.cooledSuffix, dim: v.dimension })
    })
    var problems = []
    want.forEach(function (w) {
      var r = byId(w.id)
      if (r === null) {
        problems.push(w.id + ' missing')
        return
      }
      var conds = conditionsText(r)
      if (conds.indexOf('"' + w.dim + '"') < 0) problems.push(w.id + ' conditions ' + conds)
      if (eutOf(r) !== 8 || Number(r.duration) !== 200) problems.push(w.id + ' ' + eutOf(r) + ' EU/t ' + r.duration + ' t')
    })
    var drilling = T.drilling || {}
    check('recipes', problems.length === 0 && ev.length === want.length && want.length >= 2 && drilling.count === want.length,
      'veins ' + veins.map(function (v) { return v.id + '@' + v.dimension }).join(',') + ' -> ' + ev.length + ' recipes under vein_drilling/ev/ (expected ' +
      want.length + ', published ' + drilling.count + ', not drilled: ' + (drilling.skipped || []).join(',') + ')' +
      (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function inputChances(r) {
    return asArray(r.getInputContents(lazy().ItemCap)).map(function (c) { return Number(c.chance) })
  }

  function inputFluids(r) {
    return asArray(lazy().RecipeHelper.getInputFluids(r)).map(function (st) { return fluidIdOf(st) + ' ' + st.getAmount() })
  }

  function checkWear() {
    var dry = byId(DRY)
    var cooled = byId(COOLED)
    if (dry === null || cooled === null) throw new Error('ilmenite recipes missing')
    var d = inputChances(dry).join(',')
    var c = inputChances(cooled).join(',')
    var f = inputFluids(cooled).join(',')
    var none = inputFluids(dry).length
    check('wear', d === '0,100' && c === '25,0' && f === LN2 + ' 50' && none === 0,
      'dry inputs (chance of 10 000)=' + d + ' cooled=' + c + ' cooled fluid=' + f + ' dry fluids=' + none)
  }

  function checkBit() {
    var bits = asArray(Ingredient.of('#grindless:drill_bits').getItemIds()).map(String)
    var lathe = byId(LATHE)
    var problems = []
    if (bits.indexOf(BIT) < 0) problems.push('not in grindless:drill_bits')
    if (lathe === null) problems.push(LATHE + ' missing')
    else {
      var ins = asArray(lazy().RecipeHelper.getInputItems(lathe)).map(function (st) { return itemIdOf(st) })
      var outs = asArray(lazy().RecipeHelper.getOutputItems(lathe)).map(function (st) { return itemIdOf(st) })
      if (eutOf(lathe) <= 512) problems.push('lathe at ' + eutOf(lathe) + ' EU/t (an HV lathe could run it)')
      if (ins.join(',') !== 'gtceu:long_titanium_rod' || outs.join(',') !== BIT) problems.push('lathe ' + ins.join(',') + ' -> ' + outs.join(','))
    }
    if (byId(CONVERSION) !== null) problems.push('the old conversion ' + CONVERSION + ' is still there')
    check('bit', problems.length === 0, 'drill bits=' + bits.length + ' lathe ' + (lathe ? eutOf(lathe) + ' EU/t ' + lathe.duration + ' t' : 'none') +
      (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function checkCrafting() {
    var r = byId('grindless:crafting/ev_vein_drill')
    var panel = byId('grindless:assembler/solar_wing_panel')
    var problems = []
    if (r === null) problems.push('controller recipe missing')
    else {
      var out = String(r.getResultItem(S.server.registryAccess()).getId())
      var ids = {}
      asArray(r.getIngredients()).forEach(function (ing) {
        asArray(ing.getItemIds()).forEach(function (id) { ids[String(id)] = true })
      })
      var want = ['gtceu:lunar_drill', 'gtceu:ev_machine_hull', 'gtceu:ev_electric_motor', 'gtceu:ev_electric_pump', 'gtceu:titanium_plate']
      var missing = want.filter(function (id) { return !ids[id] })
      if (out !== TRIPOD) problems.push('makes ' + out)
      if (missing.length > 0) problems.push('missing ' + missing.join(','))
    }
    if (panel === null) problems.push('wing panel recipe missing')
    else {
      var pout = asArray(lazy().RecipeHelper.getOutputItems(panel)).map(function (st) { return itemIdOf(st) })
      if (pout.join(',') !== PANEL) problems.push('assembler makes ' + pout.join(','))
    }
    check('crafting', problems.length === 0, 'controller from the Lunar Drill, an EV hull, EV motors, an EV pump, EV circuits and titanium plates; wing panel in the assembler' +
      (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function checkSolar() {
    var T = global.grindless.ev.tripod
    function level(dim, night) {
      return { getDimension: function () { return dim }, isNight: function () { return night } }
    }
    var got = {
      moonDay: T.solarFactor(level('gcyr:luna', false)),
      moonNight: T.solarFactor(level('gcyr:luna', true)),
      marsDay: T.solarFactor(level('gcyr:mars', false)),
      marsNight: T.solarFactor(level('gcyr:mars', true)),
      earthDay: T.solarFactor(level('minecraft:overworld', false))
    }
    var live = T.dimensionOf(S.moon)
    var ok = got.moonDay === 0.5 && got.moonNight === 1 && got.marsDay === 0.85 && got.marsNight === 1 && got.earthDay === 1 && live === LUNA
    check('solar', ok, 'share of the EU/t the grid pays: ' + JSON.stringify(got) + '; the live Moon level reads as ' + live)
  }

  function staticChecks() {
    safely('registration', checkRegistration)
    safely('rules', checkRules)
    safely('recipes', checkRecipes)
    safely('wear', checkWear)
    safely('bit', checkBit)
    safely('crafting', checkCrafting)
    safely('solar', checkSolar)
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_moon.js)

  function simpleBlock(sym, m) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!m.parts[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: m.parts[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: m.id, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  function assignOneOf(sym, list, m) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        if (m.counts[o.ability] != null) need = m.counts[o.ability]
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, m))
      } else if (filler === null) {
        filler = simpleBlock(o, m)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more required parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(m) {
    var desc = global.grindless.patterns.describe(m.id)
    if (!desc) throw new Error('no structure description recorded for ' + m.id)
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
      c.x = m.spec.x - (c.ci - ctrl.ci)
      c.y = m.spec.y + (c.ri - ctrl.ri)
      c.z = m.spec.z - (c.si - ctrl.si)
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
        assignOneOf(sym, list, m)
      } else {
        var b = simpleBlock(sym, m)
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
    return { cells: placed, size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)' }
  }

  function place(m) {
    var plan = planOf(m)
    m.plan = plan
    var failed = []
    var ctrlCell = null
    var tally = {}
    function put(c) {
      return cmd('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
    }
    plan.cells.forEach(function (c) {
      tally[c.block.id] = (tally[c.block.id] || 0) + 1
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (put(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (put(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    m.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return id.replace(/^[a-z]+:/, '') + ' x' + tally[id] }).join(', ')
    check(m.key + '_PLACED', failed.length === 0 && wrong.length === 0, 'in ' + LUNA + ' ' + plan.cells.length + ' blocks, ' + plan.size + ', controller ' +
      m.ctrl.x + ',' + m.ctrl.y + ',' + m.ctrl.z + ' bill=[' + bill + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var p = err.getPos()
        text += ' at ' + p.getX() + ',' + p.getY() + ',' + p.getZ() + ' found ' + blockIdAt(p.getX(), p.getY(), p.getZ())
      } catch (e1) { /* no position */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  // ---------------------------------------------------------------- machines: inputs, outputs

  function findParts(m, ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], inHatch: null, ids: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      P.ids.push(pid.replace('gtceu:', ''))
      if (pid === m.parts.energy_input) P.energy.push(p)
      else if (pid === m.parts.input_bus) P.inBus = p
      else if (pid === m.parts.output_bus) P.outBuses.push(p)
      else if (pid === m.parts.input_hatch) P.inHatch = p
    })
    return P
  }

  function readInventory(inv) {
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemIdOf(st)
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    if (st.isEmpty()) return { id: 'none', amount: 0 }
    return { id: fluidIdOf(st), amount: Number(st.getAmount()) }
  }

  function topUpEnergy(m) {
    m.P.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  // what GTM's own lookup and matching say (for a machine that stays idle)
  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      out.push('lookup=' + (match ? match.id : 'none'))
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  function bitStacks(id, n) {
    var list = []
    while (n > 0) {
      var k = Math.min(16, n)
      list.push({ id: id, n: k })
      n -= k
    }
    return list
  }

  // ---------------------------------------------------------------- scenarios

  function oreTotal(items) {
    var n = 0
    Object.keys(items).forEach(function (id) { if (id !== STONE && id.indexOf('drill_bit') < 0 && id.indexOf('vein_sample') < 0) n += items[id] })
    return n
  }

  function nothing(r) {
    var n = Object.keys(r.items).length
    return { ok: n === 0 && Object.keys(r.seen).length === 0, detail: 'nothing expected: out=[' + itemSummary(r.items) + '] recipes seen=[' +
      Object.keys(r.seen).join(',') + '] ' + r.diag }
  }

  function drilled(recipe, opts) {
    return function (r) {
      var stone = r.items[STONE] || 0
      var ores = oreTotal(r.items)
      var ratio = stone > 0 ? ores / stone : 0
      var others = Object.keys(r.seen).filter(function (id) { return id !== recipe })
      var problems = []
      if (r.seen[recipe] !== true) problems.push(recipe + ' never ran')
      if (others.length > 0) problems.push('other recipes ran: ' + others.join(','))
      if (r.maxPar !== 64) problems.push('parallels ' + r.maxPar)
      if (stone < 64 * opts.cycles || stone % 64 !== 0) problems.push('runs (stone) ' + stone + ', wanted a multiple of 64, at least ' + (64 * opts.cycles))
      if (ratio < opts.lo || ratio > opts.hi) problems.push('ores per run ' + ratio.toFixed(3))
      if (r.minEut !== opts.eut || r.maxEut !== opts.eut) problems.push('EU/t ' + r.minEut + '..' + r.maxEut + ' (wanted ' + opts.eut + ')')
      if (r.minDur !== 100) problems.push('duration ' + r.minDur + ' t (wanted 100: one overclock)')
      if (opts.night !== undefined && (r.nightStart !== opts.night || r.nightEnd !== opts.night)) problems.push('night ' + r.nightStart + '/' + r.nightEnd)
      if (opts.bitsMin !== undefined && r.bitsUsed < opts.bitsMin) problems.push('bits used ' + r.bitsUsed + ' (at least ' + opts.bitsMin + ')')
      if (opts.bitsMax !== undefined && r.bitsUsed > opts.bitsMax) problems.push('bits used ' + r.bitsUsed + ' (at most ' + opts.bitsMax + ')')
      if (opts.coolant !== undefined) {
        if (r.fluidUsed !== opts.coolant * (stone + r.inProgress)) problems.push('liquid nitrogen used ' + r.fluidUsed + ' mB for ' + stone + ' runs done and ' + r.inProgress + ' under way')
      } else if (r.fluidUsed !== 0) {
        problems.push('fluid used ' + r.fluidUsed)
      }
      return {
        ok: problems.length === 0,
        detail: stone + ' runs (' + (stone / 64) + ' cycles of ' + r.maxPar + ', ' + r.inProgress + ' runs under way), ' + ores + ' ores (' + ratio.toFixed(3) +
          ' per run), ' + r.minEut + ' EU/t, ' + r.minDur + ' t, bits used ' + r.bitsUsed + ', liquid nitrogen used ' + r.fluidUsed + ' mB, night=' +
          r.nightStart + '/' + r.nightEnd + ' out=[' + itemSummary(r.items) + ']' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : '')
      }
    }
  }

  function tripodScenarios() {
    return [
      { name: 'earth_refused', ticks: 80, time: null, items: [{ id: SAMPLE_IRON, n: 1 }].concat(bitStacks(BIT_STAINLESS, 32)), fluid: null, verify: nothing },
      {
        name: 'dry_day', ticks: 630, time: DAY, items: [{ id: SAMPLE, n: 1 }].concat(bitStacks(BIT, 80)), fluid: null,
        verify: drilled(DRY, { cycles: 5, lo: 3.6, hi: 3.9, eut: 1024, night: false, bitsMin: 1, bitsMax: 12 })
      },
      {
        name: 'dry_night', ticks: 230, time: NIGHT, items: [{ id: SAMPLE, n: 1 }].concat(bitStacks(BIT, 80)), fluid: null,
        verify: drilled(DRY, { cycles: 2, lo: 3.6, hi: 3.9, eut: 2048, night: true })
      },
      {
        // 12 800 mB = four whole cycles of 64 runs (a partial last cycle would run fewer bores at a lower overclock)
        name: 'cooled', ticks: 330, time: NIGHT, items: [{ id: SAMPLE, n: 1 }].concat(bitStacks(BIT, 80)), fluid: { id: LN2, mb: 12800 },
        verify: drilled(COOLED, { cycles: 3, lo: 5.45, hi: 5.8, eut: 2048, night: true, coolant: 50, bitsMax: 4 })
      },
      {
        name: 'cooled_low', ticks: 140, time: NIGHT, items: [{ id: SAMPLE, n: 1 }].concat(bitStacks(BIT, 80)), fluid: { id: LN2, mb: 30 },
        verify: function (r) {
          var base = drilled(DRY, { cycles: 1, lo: 3.6, hi: 3.9, eut: 2048, night: true })(r)
          var ok = base.ok && r.fluidLeft === 30
          return { ok: ok, detail: '30 mB of liquid nitrogen left alone (' + r.fluidLeft + ' mB at the end): ' + base.detail }
        }
      }
    ]
  }

  function hvScenarios() {
    return [
      {
        name: 'lunar_refused', ticks: 120, time: null, items: [{ id: SAMPLE, n: 1 }].concat(bitStacks(BIT, 32)), fluid: { id: LN2, mb: 4000 },
        verify: nothing
      },
      {
        name: 'iron_control', ticks: 260, time: null, items: [{ id: SAMPLE_IRON, n: 1 }].concat(bitStacks(BIT_STAINLESS, 32)), fluid: null,
        verify: function (r) {
          var stone = r.items['minecraft:cobblestone'] || 0
          var ok = r.seen[HV_IRON] === true && stone >= 32 && r.maxPar === 32
          return { ok: ok, detail: 'the HV drill works on the Moon: ' + stone + ' runs, ' + r.maxPar + ' at once, recipes seen=[' + Object.keys(r.seen).join(',') +
            '] out=[' + itemSummary(r.items) + ']' }
        }
      }
    ]
  }

  // ---------------------------------------------------------------- the machines: state machine

  var MACHINES = [
    { key: 'tripod', id: TRIPOD, x: 6920, y: 204, z: 2, tier: 'ev', counts: { output_bus: 2, energy_input: 1 }, scenarios: tripodScenarios },
    { key: 'hv_drill', id: HV_DRILL, x: 6944, y: 204, z: 2, tier: 'hv', counts: { energy_input: 1 }, scenarios: hvScenarios }
  ]

  function startMachine(spec) {
    var m = { key: spec.key, id: spec.id, spec: spec, parts: PART_BLOCKS[spec.tier], counts: spec.counts, phase: 'forming', t0: S.t, ctrl: null,
      P: null, list: spec.scenarios(), sc: -1, forced: false }
    S.machines.push(m)
    try {
      if (!place(m)) m.phase = 'done'
    } catch (e) {
      check(m.key + '_PLACED', false, 'exception: ' + e)
      m.phase = 'done'
    }
    return m
  }

  function resetMachine(m, ctrl) {
    clearInventory(m.P.inBus.getInventory())
    m.P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    if (m.P.inHatch !== null) m.P.inHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  // prep: clear the machine and set the time of day; the inputs go in PREP_TICKS later (the sky brightness updates on the next tick,
  // and the modifier reads it when a run starts)
  function prepScenario(m, ctrl) {
    var sc = m.list[m.sc]
    resetMachine(m, ctrl)
    if (sc.time !== null) S.server.runCommandSilent('time set ' + sc.time)
    m.prepAt = S.t
    m.phase = 'prep'
  }

  function fillScenario(m, ctrl) {
    var sc = m.list[m.sc]
    var inv = m.P.inBus.getInventory()
    sc.items.forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    if (sc.fluid !== null) m.P.inHatch.tank.setFluidInTank(0, Fluid.of(sc.fluid.id, sc.fluid.mb).getFluidStack())
    m.r = { seen: {}, maxPar: 0, minEut: 1e12, maxEut: 0, minDur: 1e9, nightStart: S.moon.isNight(), nightEnd: null, bitsIn: 0, fluidIn: sc.fluid ? sc.fluid.mb : 0 }
    var counts = readInventory(inv)
    m.r.bitsIn = (counts[BIT] || 0) + (counts[BIT_STAINLESS] || 0)
    ctrl.getRecipeLogic().updateTickSubscription()
    m.scStart = S.t
    m.phase = 'running'
  }

  // what each run looks like while the machine works; EU/t and duration only from full cycles (64 bores: the drill also runs fewer
  // at once when the bits or the coolant run short, and fewer bores take a lower overclock)
  function observe(m, ctrl) {
    var rlg = ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (String(rlg.getStatus()) !== 'WORKING' || last === null || last === undefined) return
    m.r.seen[String(last.id)] = true
    var par = Number(last.parallels)
    if (par > m.r.maxPar) m.r.maxPar = par
    if (m.key === 'tripod' && par !== 64) return
    var eut = eutOf(last)
    if (eut < m.r.minEut) m.r.minEut = eut
    if (eut > m.r.maxEut) m.r.maxEut = eut
    var dur = Number(last.duration)
    if (dur < m.r.minDur) m.r.minDur = dur
  }

  function finishScenario(m, ctrl) {
    var sc = m.list[m.sc]
    var r = m.r
    r.nightEnd = S.moon.isNight()
    // GTM takes the inputs when a cycle starts: a cycle still running now has used its coolant (and maybe a bit) but given nothing yet
    var rlg = ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    r.inProgress = String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined ? Number(last.parallels) : 0
    r.items = {}
    m.P.outBuses.forEach(function (b) {
      var c = readInventory(b.getInventory())
      Object.keys(c).forEach(function (id) { r.items[id] = (r.items[id] || 0) + c[id] })
    })
    var left = readInventory(m.P.inBus.getInventory())
    r.bitsUsed = r.bitsIn - (left[BIT] || 0) - (left[BIT_STAINLESS] || 0)
    r.fluidLeft = m.P.inHatch !== null ? tankInfo(m.P.inHatch).amount : 0
    r.fluidUsed = r.fluidIn - r.fluidLeft
    r.diag = Object.keys(r.seen).length === 0 ? diagnose(ctrl) : ''
    if (r.maxEut === 0) r.minEut = 0
    if (r.minDur === 1e9) r.minDur = 0
    var res = sc.verify(r)
    check(m.key + '_PROCESS_' + sc.name, res.ok, res.detail)
  }

  function stepMachine(m) {
    if (m.phase === 'done') return
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.key + '_FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.key + '_FORMED', true, (m.forced ? 'after a forced check' : 'by itself after ' + waited + ' ticks') + ', parts=' + asArray(ctrl.getParts()).length)
        m.P = findParts(m, ctrl)
        var problems = []
        if (m.P.energy.length !== (m.counts.energy_input || 1)) problems.push('energy hatches ' + m.P.energy.length)
        if (m.P.inBus === null) problems.push('no input bus')
        if (m.P.outBuses.length < 1) problems.push('no output bus')
        if (m.P.inHatch === null) problems.push('no input hatch')
        check(m.key + '_PARTS', problems.length === 0, '[' + m.P.ids.join(' ') + ']' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
        if (problems.length > 0) {
          m.phase = 'done'
          return
        }
        m.sc = 0
        prepScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (m.forced || !ctrl.checkPatternWithLock()) {
          check(m.key + '_FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
          m.phase = 'done'
          return
        }
        note(m.key + '_FORM_FORCED', 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }
    if (m.phase === 'prep') {
      if (S.t - m.prepAt >= PREP_TICKS) {
        try {
          fillScenario(m, ctrl)
        } catch (e) {
          check(m.key + '_PROCESS_' + m.list[m.sc].name, false, 'exception while filling: ' + e)
          m.phase = 'done'
        }
      }
      return
    }
    if (m.phase === 'running' && S.t - m.scStart >= m.list[m.sc].ticks) {
      try {
        finishScenario(m, ctrl)
      } catch (e2) {
        check(m.key + '_PROCESS_' + m.list[m.sc].name, false, 'exception while checking: ' + e2)
      }
      m.sc++
      if (m.sc >= m.list.length) {
        resetMachine(m, ctrl)
        m.phase = 'done'
      } else {
        prepScenario(m, ctrl)
      }
    }
  }

  // ---------------------------------------------------------------- run

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.moon.getChunk(cx, cz)
    }
    cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note('AREA', LUNA + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
      cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    } catch (e) {
      note('CLEANUP', 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    try {
      S.machines.forEach(function (m) {
        if (m.phase === 'running' || m.phase === 'prep') {
          topUpEnergy(m)
          if (m.phase === 'running') observe(m, machineAt(m.ctrl))
        }
      })
      if (S.t % STEP === 0) S.machines.forEach(stepMachine)
    } catch (e) {
      check('STEP', false, 'exception: ' + e)
      S.machines.forEach(function (m) { m.phase = 'done' })
    }
    if (S.machines.every(function (m) { return m.phase === 'done' })) finish()
  }

  function run(server) {
    S = { server: server, moon: server.getLevel(LUNA), t: 0, tick0: server.getTickCount(), machines: [], finished: false }
    if (S.moon === null || S.moon === undefined) {
      check('run', false, 'no level ' + LUNA)
      finish()
      return
    }
    try {
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e2) {
      check('AREA', false, 'exception: ' + e2)
    }
    MACHINES.forEach(startMachine)
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_ev_tripod', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_ev_tripod run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
