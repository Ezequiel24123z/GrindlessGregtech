// Gregtech Grindless - smoke test of package IV-B2, mercury (TEST-ONLY overlay: copied over the instance on the test PC, never shipped):
// the four Mercury multiblocks (startup_scripts/grindless/iv/mercury.js), their recipes (server_scripts/grindless/iv/mercury.js) and the
// tungsten steel bit (startup_scripts/grindless/iv/tungsten_steel_drill_bit.js).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_iv_mercury;;kubejs custom_command gg_test_vein_coverage;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|iv_mercury\|DONE@@900;;GGTEST\|vein_coverage\|DONE@@300;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// It sets the time of day (Mercury follows the Overworld's clock) and clears the weather: run it in a server of its own, not with tests
// that need a time of day.
//
// Markers: GGTEST|iv_mercury|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|iv_mercury|DONE.
//   static (no world)
//     registry        the four machines (types, generator flags, structure descriptions), the three items, the bit (drill_bits tag,
//                     global.grindless.ivDrillBit), 36 panels and 8 mirrors
//     drilling        per Mercury vein: the night (dry) and day (cooled) recipes under vein_drilling/iv/mercury_*, gcyr:mercury only,
//                     8 EU/t x 200 t, the bit's wear (50 / 25 of 10,000), 10 mB of liquid nitrogen, 5.625 raw ores + the stone a run,
//                     the shift data key; the family's tier rule files them under iv (the HV drill and the EV tripod skip them)
//     works_recipes   bricks, panels and the iridosmine fusion: inputs, outputs, EU, Mercury only, the sun price data key;
//                     global.grindless.mercury.fusion matches the live recipe
//     field_recipe    circuit 1, gcyr:mercury, day, 2,010 EU/t out a run, 20 t
//     observations    the two interferometer recipes (Mercury, night, 7,680 EU/t x 600 t) and the Moon's VLBI recording (the deep
//                     space antenna: gcyr:luna, night, 1,920 EU/t x 600 t), each with its calibrating chart not consumed
//     crafting        the four controllers, the chart copy and the IV lathe bit make what they say
//   in the world: Mercury (gcyr:mercury), band X 11520..11583, Z 0..15, built on Y0 = the higher of 200 and the band's highest ground + 2
//   (measured: NOTE AREA). Controllers face north at Z 1; the structures stand behind them (Z 1..8).
//     <copy>_PLACED / _FORMED / _PARTS   drill (x 11524), works (x 11536), field (x 11545), interferometer (x 11562)
//     DAY (time 6000)
//       drill_day_cooled      the cooled recipe runs: 128 bores, one overclock (4,096 EU/t, 100 t), 1,280 mB of liquid nitrogen a run
//       drill_day_refused     no liquid nitrogen: the dry recipe does not start by day, and the controller says why
//       drill_output          the first run's stone and raw ores (5.625 a bore, within 10 %)
//       works_sun             bricks with the sun on the receiver and all 8 mirrors under open sky: a quarter of 7,680 EU/t, 25 t
//       works_shaded          one mirror covered: the next run pays all 7,680 EU/t
//       works_fusion_sun      the fusion by day: overclocked three times (25 t) and then a quarter (1,920 EU/t): cheaper, never faster
//       works_fusion_output   6 rarest metal mixture, 700 mB osmium tetroxide and 1,000 mB steam
//       works_no_voiding      fluid voiding on: the fusion does not start (the reason is shown); the bricks still run (no fluid outputs)
//       field_day             36 panels under open sky: 36 runs, 72,360 EU/t (three IV 4A dynamo hatches, drained every tick)
//       interferometer_day    the interferometer does not observe by day
//       displays              the controller lines of the drill (shift), the works (sun) and the field (lit panels)
//     NIGHT (time 18000)
//       drill_night_dry       liquid nitrogen in the hatch, but the dry recipe runs and the nitrogen is kept
//       works_night           the bricks at night pay all 7,680 EU/t
//       field_night           no EU once the sun is down
//       interferometer_night  the Inner Planets Chart (kept) and a Lunar VLBI Recording (used) -> the Outer System Chart
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'iv_mercury'
  var FORM_TIMEOUT = 600
  var DAY_TIMEOUT = 1400
  var NIGHT_TIMEOUT = 1000
  var TEST_TIMEOUT = 4000
  var FIELD_DAY_TICKS = 120
  var FIELD_NIGHT_GRACE = 30
  var FIELD_NIGHT_TICKS = 120
  var REFUSE_WAIT = 40
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestIvMercuryRequest'

  var MERCURY = 'gcyr:mercury'
  var LUNA = 'gcyr:luna'
  var BAND = { x0: 11520, x1: 11583, z0: 0, z1: 15 }
  var DAY = 6000
  var NIGHT = 18000

  var DRILL = 'gtceu:mercury_vein_drill'
  var WORKS = 'gtceu:mercury_solar_works'
  var FIELD = 'gtceu:mercury_solar_field'
  var INTERF = 'gtceu:interferometer'
  var BIT = 'grindless:tungsten_steel_drill_bit'
  var REC = 'grindless:lunar_vlbi_recording'
  var OUTER = 'grindless:outer_system_chart'
  var SGR = 'grindless:sagittarius_a_star_signal'
  var INNER = 'grindless:inner_planets_chart'
  var BRICK = 'grindless:hermean_heat_shield_brick'
  var PANEL = 'grindless:hermean_thin_film_panel'
  var REGOLITH = 'gtceu:hermean_regolith_dust'
  var IRIDOSMINE = 'gtceu:iridosmine_dust'
  var SALTPETER = 'gtceu:saltpeter_dust'
  var MIXTURE = 'gtceu:rarest_metal_mixture_dust'
  var LN2 = 'gtceu:liquid_nitrogen'
  var SALT_WATER = 'gtceu:salt_water'
  var OSO4 = 'gtceu:osmium_tetroxide'
  var STEAM = 'gtceu:steam'
  var DATA_ORB = 'gtceu:data_orb'
  var COVER = 'minecraft:stone'

  var BRICKS_RECIPE = 'grindless:solar_processing/hermean_heat_shield_brick'
  var PANELS_RECIPE = 'grindless:solar_processing/hermean_thin_film_panel'
  var FUSION_RECIPE = 'grindless:solar_processing/iridosmine_fusion'

  // the copies: parts by pattern cell (slice, row, column of the description) and their role; all face north (out of the front)
  var COPIES = [
    { key: 'drill', machine: DRILL, x: 11524, z: 1, parts: [
      { si: 4, ri: 1, ci: 2, id: 'gtceu:iv_energy_input_hatch', role: 'energy' },
      { si: 4, ri: 1, ci: 4, id: 'gtceu:iv_input_bus', role: 'inBus' },
      { si: 4, ri: 2, ci: 2, id: 'gtceu:iv_output_bus', role: 'outBus' },
      { si: 4, ri: 2, ci: 4, id: 'gtceu:iv_input_hatch', role: 'inHatch' }] },
    { key: 'works', machine: WORKS, x: 11536, z: 1, parts: [
      { si: 6, ri: 1, ci: 1, id: 'gtceu:iv_energy_input_hatch', role: 'energy' },
      { si: 6, ri: 1, ci: 3, id: 'gtceu:iv_input_bus', role: 'inBus' },
      { si: 6, ri: 2, ci: 1, id: 'gtceu:iv_output_bus', role: 'outBus' },
      { si: 6, ri: 2, ci: 2, id: 'gtceu:iv_input_hatch', role: 'inHatch' },
      { si: 6, ri: 2, ci: 3, id: 'gtceu:iv_output_hatch', role: 'outHatchA' },
      { si: 5, ri: 2, ci: 1, id: 'gtceu:iv_output_hatch', role: 'outHatchB' }] },
    { key: 'field', machine: FIELD, x: 11545, z: 1, parts: [
      { si: 6, ri: 0, ci: 2, id: 'gtceu:iv_energy_output_hatch_4a', role: 'dynamoA' },
      { si: 6, ri: 0, ci: 4, id: 'gtceu:iv_energy_output_hatch_4a', role: 'dynamoB' },
      { si: 6, ri: 0, ci: 6, id: 'gtceu:iv_energy_output_hatch_4a', role: 'dynamoC' },
      { si: 6, ri: 1, ci: 2, id: 'gtceu:iv_input_bus', role: 'inBus' }] },
    { key: 'interferometer', machine: INTERF, x: 11562, z: 1, parts: [
      { si: 7, ri: 0, ci: 8, id: 'gtceu:iv_energy_input_hatch', role: 'energy' },
      { si: 7, ri: 1, ci: 6, id: 'gtceu:iv_input_bus', role: 'inBus' },
      { si: 7, ri: 1, ci: 10, id: 'gtceu:iv_output_bus', role: 'outBus' }] }
  ]

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
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode'),
      FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
      ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Heightmap: Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
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
    return new (lazy().RL)(id)
  }

  function bp(x, y, z) {
    return new (lazy().BlockPos)(x, y, z)
  }

  function cmd(text) {
    return S.server.runCommandSilent('execute in ' + MERCURY + ' run ' + text)
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.level, bp(p.x, p.y, p.z))
  }

  function itemIdOf(stack) {
    return String(lazy().BI.ITEM.getKey(stack.getItem()))
  }

  function byId(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function M() {
    return global.grindless.mercury || {}
  }

  function histogram(h) {
    return Object.keys(h || {}).sort().map(function (k) { return k + ' x' + h[k] }).join(', ')
  }

  // ---------------------------------------------------------------- recipe reading

  // GT recipe content -> { text: JSON through GTM's own serializer, chance }
  function contentTexts(r, cap, output) {
    var list = output ? asArray(r.getOutputContents(cap)) : asArray(r.getInputContents(cap))
    return list.map(function (c) {
      var t = String(cap.serializer.toJson(cap.of(c.content)))
      return { text: t, chance: Number(c.chance) }
    })
  }

  // signed EU/t: > 0 made, < 0 used
  function signedEUt(r) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(r)
    if (io.isEmpty()) return 0
    return io.isInput() ? -Number(io.getTotalEU()) : Number(io.getTotalEU())
  }

  function conditionsOf(r) {
    return asArray(r.conditions).map(function (c) {
      var t = { kind: String(c.getClass().getSimpleName()), reverse: c.isReverse() === true, dim: null }
      try { t.dim = String(c.getDimension().location()) } catch (e) { /* not a dimension condition */ }
      return t
    })
  }

  function conditionsText(conds) {
    return conds.map(function (c) { return c.kind + (c.reverse ? '(reversed)' : '') + (c.dim ? ':' + c.dim : '') }).join(',')
  }

  // exactly one dimension condition (that dimension, not reversed), plus a day/night condition when asked
  function conditionsAre(conds, dim, daytime) {
    var dims = conds.filter(function (c) { return c.kind === 'DimensionCondition' })
    var days = conds.filter(function (c) { return c.kind === 'DaytimeCondition' })
    if (dims.length !== 1 || dims[0].reverse || dims[0].dim !== dim) return false
    if (daytime === null) return days.length === 0 && conds.length === 1
    if (days.length !== 1 || conds.length !== 2) return false
    return daytime === 'day' ? !days[0].reverse : days[0].reverse
  }

  function typeIds(def) {
    var out = []
    var arr = def.getRecipeTypes()
    for (var i = 0; i < arr.length; i++) out.push(String(arr[i].registryName))
    return out
  }

  function madeBy(r) {
    if (typeof r.getOutputContents === 'function') {
      var texts = contentTexts(r, lazy().ItemCap, true)
      if (texts.length > 0) return texts[0].text
    }
    return itemIdOf(r.getResultItem(S.server.registryAccess()))
  }

  // a sized item JSON -> { id, tag, count }
  function sized(text) {
    try {
      var j = JSON.parse(text)
      var ing = j.ingredient || j
      return { id: ing.item || null, tag: ing.tag || null, count: Number(j.count || 1) }
    } catch (e) {
      return { id: null, tag: null, count: 0 }
    }
  }

  function fluidOf(text) {
    try {
      var j = JSON.parse(text)
      var v = j.value && j.value.length > 0 ? j.value[0] : {}
      return { id: v.fluid || null, tag: v.tag || null, amount: Number(j.amount) }
    } catch (e) {
      return { id: null, tag: null, amount: 0 }
    }
  }

  function describeRecipe(r) {
    var ins = contentTexts(r, lazy().ItemCap, false).map(function (i) { return i.text + '@' + i.chance })
    var fin = contentTexts(r, lazy().FluidCap, false).map(function (i) { return i.text })
    var outs = contentTexts(r, lazy().ItemCap, true).map(function (o) { return o.text + '@' + o.chance })
    var fout = contentTexts(r, lazy().FluidCap, true).map(function (o) { return o.text })
    return ins.concat(fin).join(' ') + ' -> ' + outs.concat(fout).join(' ') + ' ' + conditionsText(conditionsOf(r)) + ' ' + signedEUt(r) +
      ' EU/t x ' + r.duration + ' t'
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var G = global.grindless

    safely('registry', function () {
      var problems = []
      var detail = []
      var want = {}
      want[DRILL] = 'gtceu:vein_drilling'
      want[WORKS] = 'gtceu:solar_processing'
      want[FIELD] = 'gtceu:mercury_solar'
      want[INTERF] = 'gtceu:interferometry'
      Object.keys(want).forEach(function (id) {
        var def = lazy().GTRegistries.MACHINES.get(rl(id))
        if (!def) {
          problems.push(id + ' not registered')
          return
        }
        var types = typeIds(def).join(',')
        if (types !== want[id]) problems.push(id + ' types ' + types)
        if (!G.patterns.describe(id)) problems.push('no structure description for ' + id)
        detail.push(id.replace('gtceu:', '') + '=' + types + (def.isGenerator() ? ' generator' : '') + ' regress=' + def.isRegressWhenWaiting())
      })
      var field = lazy().GTRegistries.MACHINES.get(rl(FIELD))
      if (field && (field.isGenerator() !== true || field.isRegressWhenWaiting() !== false)) problems.push('the field is not a generator that keeps its progress')
      var interf = lazy().GTRegistries.MACHINES.get(rl(INTERF))
      if (interf && interf.isRegressWhenWaiting() !== false) problems.push('the interferometer regresses while waiting')
      ;[BIT, REC, OUTER, SGR, BRICK, PANEL].forEach(function (id) { if (!Item.exists(id)) problems.push(id + ' missing') })
      var tagged = false
      try { tagged = Ingredient.of('#grindless:drill_bits').test(Item.of(BIT)) } catch (e) { problems.push('tag test failed: ' + e) }
      if (!tagged) problems.push(BIT + ' is not in grindless:drill_bits')
      if (!G.ivDrillBit || G.ivDrillBit.item !== BIT) problems.push('global.grindless.ivDrillBit missing')
      if (!M().field || M().field.panels !== 36) problems.push('panels ' + (M().field ? M().field.panels : '?'))
      if (!M().works || M().works.mirrorCells.length !== 8) problems.push('mirrors ' + (M().works ? M().works.mirrorCells.length : '?'))
      check('registry', problems.length === 0, detail.join('; ') + '; bit tagged=' + tagged + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('drilling', function () {
      var D = M().drill
      var rules = G.lv.rules
      var problems = []
      var info = []
      var veins = G.ivFoundation.mercuryVeins().filter(function (v) { return v.kind === undefined || v.kind === 'ore' })
      if (veins.length === 0) problems.push('no Mercury vein')
      veins.forEach(function (v) {
        ;[false, true].forEach(function (cooled) {
          var id = 'grindless:vein_drilling/iv/mercury_' + v.id + '_tungsten_steel' + (cooled ? '_cryo' : '')
          var r = byId(id)
          if (r === null) {
            problems.push(id + ' missing')
            return
          }
          var ins = contentTexts(r, lazy().ItemCap, false)
          var fin = contentTexts(r, lazy().FluidCap, false).map(function (f) { return fluidOf(f.text) })
          var outs = contentTexts(r, lazy().ItemCap, true)
          var sample = ins.filter(function (i) { return i.text.indexOf(v.sample) >= 0 })
          var bit = ins.filter(function (i) { return i.text.indexOf(BIT) >= 0 })
          var wantWear = cooled ? D.bit.dayWear : D.bit.nightWear
          if (ins.length !== 2 || sample.length !== 1 || sample[0].chance !== 0) problems.push(id + ' sample not a kept input')
          if (bit.length !== 1 || bit[0].chance !== wantWear) problems.push(id + ' bit wear ' + (bit.length ? bit[0].chance : 'none'))
          var first = sized(ins.length ? ins[0].text : '{}')
          if ((cooled ? first.id !== BIT : first.id !== v.sample)) problems.push(id + ' first ingredient ' + first.id)
          if (cooled) {
            if (fin.length !== 1 || fin[0].id !== LN2 || fin[0].amount !== D.coolantPerRun) problems.push(id + ' coolant ' + JSON.stringify(fin))
          } else if (fin.length !== 0) {
            problems.push(id + ' takes a fluid')
          }
          var stone = 0
          var ores = 0
          outs.forEach(function (o) {
            var s = sized(o.text)
            var value = s.count * (o.chance >= 10000 || o.chance === 0 ? 1 : o.chance / 10000)
            if (s.id === v.stone) stone += value
            else ores += value
          })
          if (Math.abs(stone - 1) > 1e-6) problems.push(id + ' stone ' + stone)
          if (Math.abs(ores - D.bit.perRun) > 0.001) problems.push(id + ' ores a run ' + ores)
          if (!conditionsAre(conditionsOf(r), MERCURY, null)) problems.push(id + ' conditions ' + conditionsText(conditionsOf(r)))
          if (signedEUt(r) !== -D.eut || Number(r.duration) !== D.duration) problems.push(id + ' energy ' + signedEUt(r) + ' x ' + r.duration)
          var shift = String(r.data.getString(D.shiftKey))
          if (shift !== (cooled ? 'day' : 'night')) problems.push(id + ' shift key ' + shift)
          if (rules.recipeTier(r) !== 'iv' || !rules.isAboveTier(r, 'ev') || !D.isMercuryRecipe(r)) problems.push(id + ' tier ' + rules.recipeTier(r))
          info.push(id.replace('grindless:vein_drilling/', '') + ': ' + describeRecipe(r))
        })
      })
      // nothing else of the type sits in the Mercury drill's folder
      var type = lazy().GTRegistries.RECIPE_TYPES.get(rl('gtceu:vein_drilling'))
      var ours = asArray(S.server.getRecipeManager().getAllRecipesFor(type)).filter(function (r) {
        return String(r.id.getPath()).indexOf('vein_drilling/iv/mercury_') === 0
      })
      if (ours.length !== veins.length * 2) problems.push(ours.length + ' recipes under vein_drilling/iv/mercury_ (wanted ' + veins.length * 2 + ')')
      check('drilling', problems.length === 0, info.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('works_recipes', function () {
      var problems = []
      var info = []
      var key = M().works.sunKey
      function base(id, eut, duration, sunEut) {
        var r = byId(id)
        if (r === null) {
          problems.push(id + ' missing')
          return null
        }
        if (!conditionsAre(conditionsOf(r), MERCURY, null)) problems.push(id + ' conditions ' + conditionsText(conditionsOf(r)))
        if (signedEUt(r) !== -eut || Number(r.duration) !== duration) problems.push(id + ' energy ' + signedEUt(r) + ' x ' + r.duration)
        if (Number(r.data.getInt(key)) !== sunEut) problems.push(id + ' sun price ' + r.data.getInt(key))
        info.push(id.replace('grindless:solar_processing/', '') + ': ' + describeRecipe(r))
        return r
      }
      var bricks = base(BRICKS_RECIPE, 7680, 25, 1920)
      if (bricks) {
        var bi = contentTexts(bricks, lazy().ItemCap, false).map(function (i) { return sized(i.text) })
        var bo = contentTexts(bricks, lazy().ItemCap, true).map(function (o) { return sized(o.text) })
        if (bi.length !== 1 || bi[0].id !== REGOLITH || bi[0].count !== 16) problems.push('bricks inputs ' + JSON.stringify(bi))
        if (bo.length !== 1 || bo[0].id !== BRICK || bo[0].count !== 4) problems.push('bricks outputs ' + JSON.stringify(bo))
      }
      var panels = base(PANELS_RECIPE, 7680, 200, 1920)
      if (panels) {
        var pi = contentTexts(panels, lazy().ItemCap, false).map(function (i) { return sized(i.text) })
        var po = contentTexts(panels, lazy().ItemCap, true).map(function (o) { return sized(o.text) })
        var wantIn = ['forge:dusts/gallium_arsenide', 'gtceu:silicon_wafer', 'gtceu:tempered_glass', 'gtceu:tungsten_steel_frame']
        var gotIn = pi.map(function (s) { return s.id || s.tag })
        if (gotIn.join(',') !== wantIn.join(',') || pi.some(function (s) { return s.count !== 1 })) problems.push('panel inputs ' + JSON.stringify(pi))
        if (po.length !== 1 || po[0].id !== PANEL || po[0].count !== 1) problems.push('panel outputs ' + JSON.stringify(po))
      }
      var fusion = base(FUSION_RECIPE, 120, 200, 30)
      if (fusion) {
        var fi = contentTexts(fusion, lazy().ItemCap, false).map(function (i) { return sized(i.text) })
        var ff = contentTexts(fusion, lazy().FluidCap, false).map(function (i) { return fluidOf(i.text) })
        var fo = contentTexts(fusion, lazy().ItemCap, true).map(function (o) { return sized(o.text) })
        var fl = contentTexts(fusion, lazy().FluidCap, true).map(function (o) { return fluidOf(o.text) })
        if (fi.length !== 2 || fi[0].id !== IRIDOSMINE || fi[0].count !== 10 || fi[1].tag !== 'forge:dusts/saltpeter' || fi[1].count !== 10) problems.push('fusion items ' + JSON.stringify(fi))
        if (ff.length !== 1 || ff[0].amount !== 1000 || (ff[0].id !== SALT_WATER && ff[0].tag !== 'forge:salt_water')) problems.push('fusion fluid ' + JSON.stringify(ff))
        if (fo.length !== 1 || fo[0].id !== MIXTURE || fo[0].count !== 6) problems.push('fusion outputs ' + JSON.stringify(fo))
        var oso4 = fl.filter(function (f) { return f.id === OSO4 && f.amount === 700 })
        var steam = fl.filter(function (f) { return f.id === STEAM && f.amount === 1000 })
        if (fl.length !== 2 || oso4.length !== 1 || steam.length !== 1) problems.push('fusion fluid outputs ' + JSON.stringify(fl))
        var F = M().fusion
        if (!F || F.recipe !== FUSION_RECIPE || F.yields.iridium !== 3 || F.yields.osmium !== 1 || F.outputs.items[0].count !== 6 || F.outputs.fluids[0].amount !== 700) {
          problems.push('global.grindless.mercury.fusion does not match')
        }
      }
      check('works_recipes', problems.length === 0, info.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('field_recipe', function () {
      var A = M().field
      var r = byId(A.recipe)
      if (r === null) throw new Error(A.recipe + ' missing')
      var ins = contentTexts(r, lazy().ItemCap, false)
      var problems = []
      if (ins.length !== 1 || ins[0].chance !== 0 || ins[0].text.indexOf('"configuration":1') < 0) problems.push('inputs ' + ins.map(function (i) { return i.text }).join(' '))
      if (contentTexts(r, lazy().FluidCap, false).length > 0 || contentTexts(r, lazy().ItemCap, true).length > 0) problems.push('it has other inputs or outputs')
      if (!conditionsAre(conditionsOf(r), MERCURY, 'day')) problems.push('conditions ' + conditionsText(conditionsOf(r)))
      if (signedEUt(r) !== 2010 || Number(r.duration) !== 20) problems.push('energy ' + signedEUt(r) + ' x ' + r.duration)
      if (Number(r.data.getInt(A.panelEuKey)) !== 2010) problems.push('panel EU key ' + r.data.getInt(A.panelEuKey))
      check('field_recipe', problems.length === 0, describeRecipe(r) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('observations', function () {
      var problems = []
      var info = []
      function obs(id, kept, used, out, dim, eut) {
        var r = byId(id)
        if (r === null) {
          problems.push(id + ' missing')
          return
        }
        var ins = contentTexts(r, lazy().ItemCap, false)
        var outs = contentTexts(r, lazy().ItemCap, true).map(function (o) { return sized(o.text) })
        var keptIn = ins.filter(function (i) { return i.text.indexOf(kept) >= 0 })
        var usedIn = ins.filter(function (i) { return i.text.indexOf(used) >= 0 })
        if (ins.length !== 2 || keptIn.length !== 1 || keptIn[0].chance !== 0) problems.push(id + ' ' + kept + ' not kept')
        if (usedIn.length !== 1 || usedIn[0].chance === 0) problems.push(id + ' ' + used + ' not used')
        if (outs.length !== 1 || outs[0].id !== out || outs[0].count !== 1) problems.push(id + ' outputs ' + JSON.stringify(outs))
        if (!conditionsAre(conditionsOf(r), dim, 'night')) problems.push(id + ' conditions ' + conditionsText(conditionsOf(r)))
        if (signedEUt(r) !== -eut || Number(r.duration) !== 600) problems.push(id + ' energy ' + signedEUt(r) + ' x ' + r.duration)
        info.push(id + ': ' + describeRecipe(r))
      }
      obs('grindless:interferometry/outer_system_chart', INNER, REC, OUTER, MERCURY, 7680)
      obs('grindless:interferometry/sagittarius_a_star_signal', OUTER, REC, SGR, MERCURY, 7680)
      obs('grindless:deep_space_tracking/lunar_vlbi_recording', INNER, DATA_ORB, REC, LUNA, 1920)
      check('observations', problems.length === 0, info.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('crafting', function () {
      var R = M().recipes
      var want = {}
      want[R.controllers[0]] = DRILL
      want[R.controllers[1]] = WORKS
      want[R.controllers[2]] = FIELD
      want[R.controllers[3]] = INTERF
      want[R.copy] = OUTER
      want[R.bit] = BIT
      var problems = []
      var seen = []
      Object.keys(want).forEach(function (id) {
        var r = byId(id)
        if (r === null) {
          problems.push(id + ' missing')
          return
        }
        var out = madeBy(r)
        if (String(out).indexOf(want[id]) < 0) problems.push(id + ' makes ' + out)
        seen.push(id.replace('grindless:', '') + '->' + String(out).replace(/^.*"item":"/, '').replace(/".*$/, ''))
      })
      var lathe = byId(R.bit)
      if (lathe !== null && signedEUt(lathe) !== -7680) problems.push('the bit lathe runs at ' + (-signedEUt(lathe)) + ' EU/t')
      check('crafting', problems.length === 0, seen.join(', ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })
  }

  // ---------------------------------------------------------------- structures

  function plainBlock(sym) {
    if (sym.kind === 'blocks') return sym.blocks[0]
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) {
        if (sym.options[i].kind === 'blocks') return sym.options[i].blocks[0]
      }
    }
    throw new Error('no plain block for symbol kind ' + sym.kind)
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = Y0 + row, z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(copy) {
    var desc = global.grindless.patterns.describe(copy.machine)
    if (!desc) throw new Error('no structure description recorded for ' + copy.machine)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    var cy = S.y0 + ctrl.ri
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'air' || sym.kind === 'any') continue
          var c = { si: si, ri: ri, ci: ci, ch: ch, x: copy.x - (ci - ctrl.ci), y: cy + (ri - ctrl.ri), z: copy.z - (si - ctrl.si), id: null,
            props: '', role: null }
          if (sym.kind === 'controller') {
            c.id = copy.machine
            c.props = '[facing=north]'
            c.role = 'controller'
          } else {
            var part = copy.parts.filter(function (p) { return p.si === si && p.ri === ri && p.ci === ci })[0]
            if (part) {
              if (sym.kind !== 'oneOf') throw new Error('part cell ' + si + ',' + ri + ',' + ci + ' is not a part cell')
              c.id = part.id
              c.props = '[facing=north]'
              c.role = part.role
            } else {
              c.id = plainBlock(sym)
            }
          }
          cells.push(c)
        }
      })
    })
    return { cells: cells, ctrl: { x: copy.x, y: cy, z: copy.z }, size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length }
  }

  function setBlock(x, y, z, id, props) {
    return cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + (props || '') + ' replace')
  }

  function place(m) {
    var plan = planOf(m.copy)
    m.plan = plan
    m.roles = {}
    var failed = []
    var tally = {}
    var ctrlCell = null
    plan.cells.forEach(function (c) {
      tally[c.id] = (tally[c.id] || 0) + 1
      if (c.role === 'controller') {
        ctrlCell = c
        return
      }
      if (c.role) m.roles[c.x + ',' + c.y + ',' + c.z] = c.role
      if (setBlock(c.x, c.y, c.z, c.id, c.props) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.id)
    })
    if (setBlock(ctrlCell.x, ctrlCell.y, ctrlCell.z, ctrlCell.id, ctrlCell.props) < 1) failed.push('controller')
    m.ctrlPos = plan.ctrl
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return id.replace(/^[a-z]+:/, '') + ' x' + tally[id] }).join(', ')
    check(m.copy.key + '_PLACED', failed.length === 0 && wrong.length === 0, plan.cells.length + ' blocks, ' + plan.size + ' (w x h x d), controller ' +
      m.ctrlPos.x + ',' + m.ctrlPos.y + ',' + m.ctrlPos.z + ' bill=[' + bill + ']' +
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

  // the parts by the role of their cell
  function findParts(m, ctrl) {
    var P = { ids: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pos = p.self().getPos()
      var role = m.roles[pos.getX() + ',' + pos.getY() + ',' + pos.getZ()]
      P.ids.push(String(p.getDefinition().getId()).replace('gtceu:', '') + (role ? '=' + role : ''))
      if (role) P[role] = p
    })
    return P
  }

  // ---------------------------------------------------------------- inventories

  function readInv(inv) {
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemIdOf(st)
      counts[id] = (counts[id] || 0) + Number(st.getCount())
    }
    return counts
  }

  function summary(counts) {
    var keys = Object.keys(counts)
    return keys.length === 0 ? 'nothing' : keys.map(function (k) { return k.replace(/^[a-z_]+:/, '') + ' x' + counts[k] }).join(', ')
  }

  // puts `count` of an item into a bus, stack by stack; returns what did not fit
  function insert(bus, id, count) {
    var inv = bus.getInventory()
    var left = count
    var max = Number(Item.of(id).getMaxStackSize())
    for (var i = 0; i < inv.getSlots() && left > 0; i++) {
      var n = Math.min(max, left)
      var rest = inv.insertItem(i, Item.of(id, n), false)
      left -= n - Number(rest.getCount())
    }
    return left
  }

  function clearInv(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }

  function tankOf(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return st.isEmpty() ? { id: '', mb: 0 } : { id: String(lazy().Registries.FLUIDS.getKey(st.getFluid())), mb: Number(st.getAmount()) }
  }

  function setTank(hatch, id, amount) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    if (amount <= 0) hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    else hatch.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }

  function wake(m) {
    try {
      m.ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the scenario reports what did not run */ }
  }

  function recipeState(m) {
    try {
      var rlg = m.ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      var fails = failureReasons(m)
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' last=' +
        (last ? last.id + ' x' + last.parallels : 'none') + (fails.length > 0 ? ' failureReasons=[' + fails.join(' ; ') + ']' : '')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  function failureReasons(m) {
    try {
      return asArray(m.ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }

  function displayLines(m) {
    var list = new (lazy().ArrayList)()
    m.ctrl.addDisplayText(list)
    return asArray(list).map(function (c) {
      try {
        return String(c.getString())
      } catch (e) {
        return String(c)
      }
    })
  }

  // a new run: working, at progress 0 or 1, after a tick without work or a drop of the progress (the previous run ended)
  function newRun(m) {
    var rlg = m.ctrl.getRecipeLogic()
    var working = !!rlg.isWorking()
    var progress = Number(rlg.getProgress())
    var last = rlg.getLastRecipe()
    var fresh = working && last !== null && last !== undefined && progress <= 1 && (!m.prevWorking || m.prevProgress > progress)
    m.prevWorking = working
    m.prevProgress = progress
    var status = String(rlg.getStatus())
    m.statuses[status] = (m.statuses[status] || 0) + 1
    if (!fresh) return null
    var run = { t: S.t, id: String(last.id), parallels: Number(last.parallels), eut: -signedEUt(last), duration: Number(rlg.getDuration()) }
    m.runs.push(run)
    return run
  }

  function runText(run) {
    return run ? run.id + ' x' + run.parallels + ' at ' + run.eut + ' EU/t for ' + run.duration + ' t (t=' + run.t + ')' : 'no run'
  }

  // ---------------------------------------------------------------- the world

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var top = -999
    var at = ''
    for (var x = BAND.x0; x <= BAND.x1; x++) {
      for (var z = BAND.z0; z <= BAND.z1; z++) {
        var h = Number(S.level.getHeight(lazy().Heightmap.MOTION_BLOCKING, x, z)) - 1
        if (h > top) {
          top = h
          at = x + ',' + z
        }
      }
    }
    S.surfaceTop = top
    S.y0 = Math.max(200, top + 2)
    var y1 = S.y0 + 14
    var cleared = cmd('fill ' + BAND.x0 + ' ' + (S.y0 - 2) + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + y1 + ' ' + BAND.z1 + ' air')
    note('AREA', MERCURY + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ': highest ground Y ' + top + ' (at ' + at +
      '); structures built on Y ' + S.y0 + ', band cleared Y ' + (S.y0 - 2) + '-' + y1 + ' (' + cleared + ' blocks changed)')
  }

  function setClock(time, why) {
    S.server.runCommandSilent('time set ' + time)
    note('CLOCK', 'time set ' + time + ' (' + why + '): Mercury day time ' + (Number(S.level.getDayTime()) % 24000) + ' night=' + S.level.isNight())
  }

  // ---------------------------------------------------------------- copies

  function copyOf(key) {
    return S.copies.filter(function (m) { return m.copy.key === key })[0]
  }

  function startCopies() {
    S.copies = []
    COPIES.forEach(function (copy) {
      var m = { copy: copy, phase: 'forming', ctrl: null, parts: null, ctrlPos: null, roles: {}, runs: [], statuses: {}, prevWorking: false,
        prevProgress: 0, step: 'idle', mark: 0 }
      S.copies.push(m)
      try {
        if (!place(m)) m.phase = 'broken'
      } catch (e) {
        check(copy.key + '_PLACED', false, 'exception: ' + e)
        m.phase = 'broken'
      }
    })
  }

  function allFormed() {
    var ok = true
    S.copies.forEach(function (m) {
      if (m.phase !== 'forming') return
      var ctrl = machineAt(m.ctrlPos)
      if (ctrl && ctrl.isFormed()) {
        m.phase = 'formed'
        m.ctrl = ctrl
        check(m.copy.key + '_FORMED', true, 'formed after ' + S.t + ' ticks')
      } else {
        ok = false
      }
    })
    return ok
  }

  function formTimeout() {
    S.copies.forEach(function (m) {
      if (m.phase !== 'forming') return
      var ctrl = machineAt(m.ctrlPos)
      check(m.copy.key + '_FORMED', false, 'not formed after ' + FORM_TIMEOUT + ' ticks: ' + (ctrl ? describeError(ctrl) : 'no controller'))
      m.phase = 'broken'
    })
  }

  function setupParts() {
    S.copies.forEach(function (m) {
      if (m.phase !== 'formed') return
      safely(m.copy.key + '_PARTS', function () {
        var P = findParts(m, m.ctrl)
        m.parts = P
        var missing = m.copy.parts.filter(function (p) { return !P[p.role] }).map(function (p) { return p.role })
        if (missing.length === 0) m.phase = 'running'
        else m.phase = 'broken'
        check(m.copy.key + '_PARTS', missing.length === 0, '[' + P.ids.join(' ') + ']' + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      })
    })
  }

  // every tick: energy hatches full, dynamo hatches drained (the field's EU counted)
  function upkeep(m) {
    ;['energy'].forEach(function (role) {
      var p = m.parts[role]
      if (p) p.energyContainer.setEnergyStored(p.energyContainer.getEnergyCapacity())
    })
    if (m.copy.key === 'field') {
      var made = 0
      ;['dynamoA', 'dynamoB', 'dynamoC'].forEach(function (role) {
        var c = m.parts[role].energyContainer
        var e = Number(c.getEnergyStored())
        if (e > 0) {
          made += e
          c.setEnergyStored(0)
        }
      })
      m.lastMade = made
    }
  }

  // ---------------------------------------------------------------- the drill

  function drillDay(m) {
    var D = M().drill
    var P = m.parts
    if (m.step === 'idle') {
      var sample = global.grindless.ivFoundation.mercuryVeins()[0].sample
      m.sample = sample
      var left = insert(P.inBus, sample, 1) + insert(P.inBus, BIT, 192)
      setTank(P.inHatch, LN2, 16000)
      m.step = 'day_wait'
      m.mark = S.t
      wake(m)
      if (left > 0) check('drill_day_cooled', false, left + ' items did not fit in the input bus')
      return
    }
    var run = newRun(m)
    if (m.step === 'day_wait') {
      if (run) {
        var ln2 = tankOf(P.inHatch).mb
        var ok = /_cryo$/.test(run.id) && run.parallels === D.cap && run.eut === 4096 && run.duration === 100 && ln2 === 16000 - D.cap * D.coolantPerRun
        check('drill_day_cooled', ok, runText(run) + '; liquid nitrogen left ' + ln2 + ' mB (wanted ' + (16000 - D.cap * D.coolantPerRun) + ')')
        m.firstRun = run
        setTank(P.inHatch, LN2, 0)
        m.step = 'day_dry'
        m.mark = S.t
      } else if (S.t - m.mark > 300) {
        check('drill_day_cooled', false, 'no run within 300 ticks: ' + recipeState(m))
        m.step = 'day_done'
      }
      return
    }
    if (m.step === 'day_dry') {
      if (run && run !== m.firstRun) m.dayDryRun = run
      if (S.t - m.mark >= m.firstRun.duration + REFUSE_WAIT) {
        var reasons = failureReasons(m)
        var said = reasons.some(function (r) { return /needs_nitrogen|only runs with liquid nitrogen/.test(r) })
        var working = !!m.ctrl.getRecipeLogic().isWorking()
        check('drill_day_refused', !m.dayDryRun && !working && said, 'without liquid nitrogen by day: ' + (m.dayDryRun ? 'a run started: ' + runText(m.dayDryRun) : 'no run') +
          '; ' + recipeState(m))
        var out = readInv(P.outBus.getInventory())
        var stone = out['gcyr:mercury_cobblestone'] || 0
        var ores = 0
        Object.keys(out).forEach(function (k) { if (/^gtceu:raw_/.test(k)) ores += out[k] })
        var want = D.cap * D.bit.perRun
        check('drill_output', stone === D.cap && Math.abs(ores - want) <= want * 0.1, 'after one run of ' + D.cap + ' bores: [' + summary(out) + '] = ' + stone +
          ' stone and ' + ores + ' raw ores (wanted ' + D.cap + ' and about ' + want + ')')
        clearInv(P.outBus)
        m.step = 'day_done'
      }
    }
  }

  function drillNight(m) {
    var D = M().drill
    var P = m.parts
    var run = newRun(m)
    if (m.step === 'night_wait') {
      if (run) {
        var ln2 = tankOf(P.inHatch).mb
        var ok = !/_cryo$/.test(run.id) && /vein_drilling\/iv\/mercury_/.test(run.id) && run.parallels === D.cap && run.eut === 4096 && run.duration === 100 && ln2 === 5000
        check('drill_night_dry', ok, runText(run) + '; liquid nitrogen in the hatch ' + ln2 + ' mB (kept: wanted 5000)')
        m.step = 'night_done'
      } else if (S.t - m.mark > 300) {
        check('drill_night_dry', false, 'no run within 300 ticks of night: ' + recipeState(m))
        m.step = 'night_done'
      }
    }
  }

  // ---------------------------------------------------------------- the solar works

  function worksExpect(m) {
    var state = M().works.sunState(m.ctrl)
    return { key: state.key, covered: state.covered }
  }

  function mirrorCover(m) {
    var cell = m.plan.cells.filter(function (c) { return c.ch === 'M' })[0]
    return { x: cell.x, y: cell.y + 1, z: cell.z }
  }

  function worksDay(m) {
    var P = m.parts
    if (m.step === 'idle') {
      insert(P.inBus, REGOLITH, 160)
      m.step = 'sun_wait'
      m.mark = S.t
      wake(m)
      return
    }
    var run = newRun(m)
    var expect = worksExpect(m)
    if (m.step === 'sun_wait') {
      if (run) {
        check('works_sun', run.id === BRICKS_RECIPE && expect.key === 'sun' && run.eut === 1920 && run.duration === 25, runText(run) + '; sky now ' + expect.key +
          ' (covered ' + expect.covered + ')')
        m.cover = mirrorCover(m)
        setBlock(m.cover.x, m.cover.y, m.cover.z, COVER, '')
        m.step = 'shaded_wait'
        m.mark = S.t
      } else if (S.t - m.mark > 200) {
        check('works_sun', false, 'no run within 200 ticks: ' + recipeState(m))
        m.step = 'day_done'
      }
      return
    }
    if (m.step === 'shaded_wait') {
      if (run) {
        check('works_shaded', expect.key === 'shaded' && run.eut === 7680 && run.duration === 25, runText(run) + '; sky now ' + expect.key + ' (covered ' +
          expect.covered + ', a stone over the mirror at ' + m.cover.x + ',' + (m.cover.y - 1) + ',' + m.cover.z + ')')
        setBlock(m.cover.x, m.cover.y, m.cover.z, 'minecraft:air', '')
        clearInv(P.inBus)
        insert(P.inBus, IRIDOSMINE, 10)
        insert(P.inBus, SALTPETER, 10)
        setTank(P.inHatch, SALT_WATER, 1000)
        m.step = 'fusion_wait'
        m.mark = S.t
        wake(m)
      } else if (S.t - m.mark > 200) {
        check('works_shaded', false, 'no run within 200 ticks: ' + recipeState(m))
        m.step = 'day_done'
      }
      return
    }
    if (m.step === 'fusion_wait') {
      if (run && run.id === FUSION_RECIPE) {
        check('works_fusion_sun', expect.key === 'sun' && run.eut === 1920 && run.duration === 25, runText(run) + '; sky now ' + expect.key +
          ' (120 EU/t overclocked three times on one IV hatch = 7,680 EU/t for 25 t, then a quarter)')
        m.fusionRun = run
        m.step = 'fusion_out'
      } else if (S.t - m.mark > 200) {
        check('works_fusion_sun', false, 'no fusion run within 200 ticks: ' + recipeState(m) + (run ? '; saw ' + runText(run) : ''))
        m.step = 'day_done'
      }
      return
    }
    if (m.step === 'fusion_out') {
      if (S.t - m.fusionRun.t >= m.fusionRun.duration + 5) {
        var out = readInv(P.outBus.getInventory())
        var a = tankOf(P.outHatchA)
        var b = tankOf(P.outHatchB)
        var fluids = {}
        ;[a, b].forEach(function (t) { if (t.mb > 0) fluids[t.id] = (fluids[t.id] || 0) + t.mb })
        check('works_fusion_output', (out[MIXTURE] || 0) === 6 && fluids[OSO4] === 700 && fluids[STEAM] === 1000, 'output bus [' + summary(out) + '], hatches ' +
          JSON.stringify(fluids))
        clearInv(P.outBus)
        setTank(P.outHatchA, '', 0)
        setTank(P.outHatchB, '', 0)
        // fluid voiding on: the fusion must not start again
        m.ctrl.setVoidingMode(lazy().VoidingMode.VOID_FLUIDS)
        insert(P.inBus, IRIDOSMINE, 10)
        insert(P.inBus, SALTPETER, 10)
        setTank(P.inHatch, SALT_WATER, 1000)
        m.runsBeforeVoiding = m.runs.length
        m.step = 'voiding_wait'
        m.mark = S.t
        wake(m)
      }
      return
    }
    if (m.step === 'voiding_wait') {
      if (S.t - m.mark >= REFUSE_WAIT) {
        var started = m.runs.slice(m.runsBeforeVoiding).filter(function (r) { return r.id === FUSION_RECIPE })
        var reasons = failureReasons(m)
        var said = reasons.some(function (r) { return /no_voiding|Turn fluid voiding off/.test(r) })
        m.voidingOk = started.length === 0 && said
        m.voidingDetail = 'voiding ' + m.ctrl.getVoidingMode() + ': ' + (started.length > 0 ? 'the fusion started: ' + runText(started[0]) : 'no fusion run') + '; ' + recipeState(m)
        insert(P.inBus, REGOLITH, 16)
        m.step = 'voiding_bricks'
        m.mark = S.t
        wake(m)
      }
      return
    }
    if (m.step === 'voiding_bricks') {
      if (run) {
        var ok = m.voidingOk && run.id === BRICKS_RECIPE
        check('works_no_voiding', ok, m.voidingDetail + ' ; then with dust in the bus: ' + runText(run) + ' (the bricks have no fluid outputs)')
        m.step = 'voiding_end'
      } else if (S.t - m.mark > 200) {
        check('works_no_voiding', false, m.voidingDetail + ' ; the bricks did not run while voiding fluids: ' + recipeState(m))
        m.step = 'voiding_end'
      }
      return
    }
    if (m.step === 'voiding_end') {
      // wait for the bricks run to end, then clear everything and turn voiding off
      if (!m.ctrl.getRecipeLogic().isWorking() || S.t - m.mark > 120) {
        clearInv(P.inBus)
        setTank(P.inHatch, '', 0)
        m.ctrl.setVoidingMode(lazy().VoidingMode.VOID_NONE)
        clearInv(P.outBus)
        m.step = 'day_done'
      }
    }
  }

  function worksNight(m) {
    var run = newRun(m)
    if (m.step === 'night_wait') {
      var expect = worksExpect(m)
      if (run) {
        check('works_night', run.id === BRICKS_RECIPE && expect.key === 'night' && run.eut === 7680 && run.duration === 25, runText(run) + '; sky now ' + expect.key)
        m.step = 'night_done'
      } else if (S.t - m.mark > 200) {
        check('works_night', false, 'no run within 200 ticks of night: ' + recipeState(m))
        m.step = 'night_done'
      }
    }
  }

  // ---------------------------------------------------------------- the solar field

  function fieldTick(m, phase) {
    var P = m.parts
    if (m.step === 'idle') {
      var cinv = P.inBus.getCircuitInventory()
      cinv.setStackInSlot(0, lazy().Circuit.stack(1))
      m.step = 'day'
      m.mark = S.t
      m.day = {}
      m.night = {}
      m.nightEu = 0
      wake(m)
      return
    }
    newRun(m)
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    var par = rlg.isWorking() && last ? Number(last.parallels) : 0
    var key = par + '@' + m.lastMade
    if (phase === 'day' && m.step === 'day') {
      m.day[key] = (m.day[key] || 0) + 1
      if (S.t - m.mark >= FIELD_DAY_TICKS) {
        var full = m.day['36@72360'] || 0
        check('field_day', full >= FIELD_DAY_TICKS / 2, 'ticks by runs@EU: ' + histogram(m.day) + '; lit panels ' + M().field.litPanels(m.ctrl) + '; ' + recipeState(m))
        safely('displays_field', function () {
          var lines = displayLines(m)
          var panels = lines.some(function (l) { return /mercury_solar_field\.panels|Panels under open sky/.test(l) })
          var capacity = lines.some(function (l) { return /grindless\.generators\.capacity|Dynamo hatches carry/.test(l) })
          check('displays_field', panels && capacity, 'panels line ' + panels + ', dynamo line ' + capacity + ' (' + lines.length + ' lines)')
        })
        m.step = 'day_done'
      }
      return
    }
    if (phase === 'night') {
      if (m.step === 'day_done' || m.step === 'day') {
        m.step = 'night'
        m.mark = S.t
        wake(m)
        return
      }
      if (m.step === 'night') {
        if (S.t - m.mark >= FIELD_NIGHT_GRACE) {
          m.night[key] = (m.night[key] || 0) + 1
          m.nightEu += m.lastMade
        }
        if (S.t - m.mark >= FIELD_NIGHT_GRACE + FIELD_NIGHT_TICKS) {
          check('field_night', m.nightEu === 0 && !m.night['36@72360'], 'after the first ' + FIELD_NIGHT_GRACE + ' ticks of night: ' + m.nightEu + ' EU; ticks by runs@EU: ' +
            histogram(m.night) + '; ' + recipeState(m))
          m.step = 'night_done'
        }
      }
    }
  }

  // ---------------------------------------------------------------- the interferometer

  function interferometerTick(m, phase) {
    var P = m.parts
    if (m.step === 'idle') {
      insert(P.inBus, INNER, 1)
      insert(P.inBus, REC, 1)
      m.step = 'day'
      m.mark = S.t
      wake(m)
      return
    }
    var run = newRun(m)
    if (phase === 'day') {
      if (run) m.dayRun = run
      return
    }
    if (run) m.nightRun = run
    if (m.step === 'day') {
      var inBus = readInv(P.inBus.getInventory())
      var outBus = readInv(P.outBus.getInventory())
      check('interferometer_day', !m.dayRun && !m.statuses.WORKING && inBus[INNER] === 1 && inBus[REC] === 1 && !outBus[OUTER],
        'by day: ' + (m.dayRun ? 'it ran: ' + runText(m.dayRun) : 'no run') + '; statuses ' + histogram(m.statuses) + '; input bus [' + summary(inBus) + ']')
      m.statuses = {}
      m.step = 'night'
      m.mark = S.t
      wake(m)
      return
    }
    if (m.step === 'night') {
      var outNow = readInv(P.outBus.getInventory())
      if (outNow[OUTER] === 1 || S.t - m.mark > 800) {
        var inNow = readInv(P.inBus.getInventory())
        check('interferometer_night', outNow[OUTER] === 1 && inNow[INNER] === 1 && !inNow[REC] && m.nightRun && m.nightRun.duration === 600,
          'at night: ' + runText(m.nightRun) + '; input bus [' + summary(inNow) + '] output bus [' + summary(outNow) + '] after ' + (S.t - m.mark) + ' ticks; ' + recipeState(m))
        m.step = 'night_done'
      }
    }
  }

  // ---------------------------------------------------------------- driver

  function dayDone() {
    return S.copies.every(function (m) {
      if (m.phase !== 'running') return true
      if (m.copy.key === 'interferometer') return S.t - S.phaseStart >= FIELD_DAY_TICKS
      return m.step === 'day_done'
    })
  }

  function nightDone() {
    return S.copies.every(function (m) { return m.phase !== 'running' || m.step === 'night_done' })
  }

  function displays() {
    var drill = copyOf('drill')
    if (drill && drill.phase === 'running') {
      safely('displays_drill', function () {
        var lines = displayLines(drill)
        var ok = lines.some(function (l) { return /mercury_vein_drill\.shift\.day|Mercury's day: drilling/.test(l) })
        check('displays_drill', ok, lines.filter(function (l) { return /mercury|Mercury/.test(l) }).join(' / ') || lines.length + ' lines, no shift line')
      })
    }
    var works = copyOf('works')
    if (works && works.phase === 'running') {
      safely('displays_works', function () {
        var lines = displayLines(works)
        var ok = lines.some(function (l) { return /mercury_solar_works\.sun\.|receiver|Night:|Shaded/.test(l) })
        check('displays_works', ok, lines.filter(function (l) { return /sun|Sun|receiver|Night|Shaded/.test(l) }).join(' / ') || lines.length + ' lines, no sun line')
      })
    }
  }

  // the night's inputs go in during the tick the clock changes, before any machine searches again: the drill must find liquid nitrogen
  // in its hatch and still drill dry
  function nightStart(m) {
    var P = m.parts
    if (m.copy.key === 'drill') {
      setTank(P.inHatch, LN2, 5000)
      m.step = 'night_wait'
    } else if (m.copy.key === 'works') {
      insert(P.inBus, REGOLITH, 64)
      m.step = 'night_wait'
    }
    m.mark = S.t
    wake(m)
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      S.copies.forEach(function (m) {
        if (m.phase === 'running' && m.step !== 'night_done' && m.step !== 'day_done') note(m.copy.key + '_UNFINISHED', 'step ' + m.step + '; ' + recipeState(m))
      })
      setClock(1000, 'the test is over: back to day')
      cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    } catch (e) { /* best effort */ }
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t = S.server.getTickCount() - S.tick0
    try {
      if (S.phase === 'forming') {
        if (S.t % 10 !== 0) return
        if (allFormed()) {
          setupParts()
          S.server.runCommandSilent('weather clear 12000')
          setClock(DAY, 'day: the drill needs liquid nitrogen, the works gets the sun, the field makes EU, the interferometer waits')
          S.phase = 'day'
          S.phaseStart = S.t
        } else if (S.t > FORM_TIMEOUT) {
          formTimeout()
          S.phase = 'done'
        }
      } else if (S.phase === 'day' || S.phase === 'night') {
        var phase = S.phase
        S.copies.forEach(function (m) {
          if (m.phase !== 'running') return
          try {
            upkeep(m)
            if (m.copy.key === 'drill') {
              if (phase === 'day') drillDay(m)
              else drillNight(m)
            } else if (m.copy.key === 'works') {
              if (phase === 'day') worksDay(m)
              else worksNight(m)
            } else if (m.copy.key === 'field') {
              fieldTick(m, phase)
            } else {
              interferometerTick(m, phase)
            }
          } catch (e) {
            check(m.copy.key + '_STEP', false, 'exception in ' + phase + '/' + m.step + ': ' + e)
            m.phase = 'broken'
          }
        })
        if (phase === 'day' && S.t - S.phaseStart === 60) displays()
        if (phase === 'day' && (dayDone() || S.t - S.phaseStart > DAY_TIMEOUT)) {
          if (!dayDone()) note('DAY', 'day phase timed out after ' + DAY_TIMEOUT + ' ticks')
          setClock(NIGHT, 'night: the drill drills dry, the works pays in full, the field stops, the interferometer observes')
          S.copies.forEach(function (m) { if (m.phase === 'running') nightStart(m) })
          S.phase = 'night'
          S.phaseStart = S.t
        } else if (phase === 'night' && (nightDone() || S.t - S.phaseStart > NIGHT_TIMEOUT)) {
          if (!nightDone()) note('NIGHT', 'night phase timed out after ' + NIGHT_TIMEOUT + ' ticks')
          S.phase = 'done'
        }
      }
      if (S.phase === 'done') finish()
      else if (S.t > TEST_TIMEOUT) {
        check('timeout', false, 'still running after ' + S.t + ' ticks in phase ' + S.phase)
        finish()
      }
    } catch (e) {
      check('STEP', false, 'exception in ' + S.phase + ': ' + e)
      finish()
    }
  }

  function run(server) {
    S = { server: server, level: server.getLevel(MERCURY), t: 0, tick0: server.getTickCount(), phase: 'forming', phaseStart: 0, copies: [], finished: false }
    staticChecks()
    if (S.level === null || S.level === undefined) {
      check('mercury_level', false, MERCURY + ' is not loaded')
      S.phase = 'done'
      finish()
      return
    }
    safely('AREA', prepareWorld)
    startCopies()
  }

  // The pack's Additional Placements mod reloads the datapacks (and these scripts) a couple of seconds after the server is up: the
  // command only leaves a request in `global` and the tick handler starts the test once these scripts have been loaded for QUIET_MS.
  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      if (S !== null) finish()
      else console.info(TAG + SCOPE + '|DONE')
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_iv_mercury', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_iv_mercury run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
