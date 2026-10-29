// priority: -6200
// -----------------------------------------------------------------------------------------------
// Leisure utility multiblocks (MV): GregTech Leisure's advanced multi smelter, lava furnace and weather controller, as ideas only
// (docs/research/leisure.md 4.2: GTL's licence is not permissive, so no code, text or texture of it is used; the numbers, patterns
// and art are ours). Convenience machines, counted apart from the per-era target of AGENTS.md rule 7.
//
//   gtceu:advanced_multi_smelter   5x4x5 heatproof furnace hall around 16 heating coils. Runs GTM's furnace recipes (gtceu:electric_furnace,
//                                  every smelting recipe of the game) and smelts DIFFERENT items in the same run: each run gathers
//                                  every kind of smeltable item in its input buses, up to its parallel limit. Parallels double with
//                                  every 900 K of coil temperature (GTL's rule): 4 at 1,800 K (cupronickel), 8 kanthal, 16 nichrome,
//                                  32 RTM alloy, 64 from HSS-G on, and never more than 64 (the pack's cap for convenience machines).
//                                  Each parallel costs a single electric furnace (the recipe's own EU/t and time), then GTM's
//                                  non-perfect overclock. GTM's own HV multi smelter (32 x coil level, one recipe at a time) stays
//                                  the bulk smelter; this one is the MV mixed-batch smelter.
//   gtceu:lava_furnace             5x6x5 foundry: a hearth of steel fireboxes under a framed steel chamber. No energy: it smelts the same furnace
//                                  recipes (mixed kinds, up to 8 at once) with lava from a fluid input hatch in the hearth, 10 mB
//                                  per item, the heat a vanilla furnace takes from a bucket (100 items). GTL's machine of that name
//                                  MAKES lava from cobblestone for 3,200 EU a bucket; here lava burned in a large boiler is worth far
//                                  more than any melting cost (docs/eras/lv.md: lava is never manufactured), so ours only uses it.
//   gtceu:weather_controller       a cloud-seeding station: 3x3 base, steel frame struts, a launch tube of steel pipe casings and a
//                                  lightning rod. Recipe type gtceu:weather_control (server_scripts/grindless/mv/leisure_utility.js):
//                                  circuit 1 clear (calcium chloride), 2 rain (salt), 3 thunder (salt + fine copper wire for
//                                  rocket-triggered lightning). The weather changes when a run ENDS (afterWorking hook), on the
//                                  machine's own level, which must be the Overworld (the recipes carry the dimension condition):
//                                  the other worlds take their weather from it or have none.
//
// How the cross-recipe smelting works (KubeJS only, no Java): a recipe modifier. GTM's recipe logic hands it the first furnace recipe
// its lookup found (the anchor); the modifier asks the same lookup for every other furnace recipe the buses can feed and adds each
// one with as many parallels as fit, up to the limit, into ONE merged GTRecipe whose contents are the sum of them all. A recipe only
// joins if the whole merged recipe still matches the buses (RecipeHelper.matchRecipe; its parallels are halved until it does), so two
// recipes never claim the same items or the same output room, and only recipes of the anchor's own cooking time join (almost every
// smelting recipe takes 200 ticks; a 1,800-tick raw ore block waits for a run of its own), so each item keeps its own time and EU.
// Only plain recipes are merged (no chanced or non-consumed contents, no conditions or ingredient actions, nothing per tick but EU):
// every smelting recipe is plain. The merged recipe keeps the anchor's id, so GTM's recipe logic treats it as the anchor run; with
// alwaysTryModifyRecipe it is merged again before every run.
//
// Geometry (slices back -> front, rows bottom -> top, columns left -> right as seen from the front; lib/patterns.js):
//   smelter   X heatproof casing or a part, K heating coil (lib/coils.js: GTM's heatingCoils(), one coil type), S controller, # air
//   furnace   F steel firebox casing or the lava hatch (the hearth), X solid steel casing or a bus, S controller, # air
//   weather   X solid steel casing or a part, F steel frame, P steel pipe casing (launch tube), L lightning rod
//
// Textures: overlay dirs grindless:block/multiblock/<machine> (tools/assets/Build-LeisureUtilityTextures.ps1).
// Names / tooltips: client_scripts/grindless/mv_leisure_utility_lang.js. Crafting and recipes: server_scripts/grindless/mv/leisure_utility.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Coils = G.coils
  const U = G.leisureUtility || (G.leisureUtility = {})

  const LOG = '[grindless/mv] '
  const SMELTER = 'gtceu:advanced_multi_smelter'
  const FURNACE = 'gtceu:lava_furnace'
  const WEATHER = 'gtceu:weather_controller'
  const WEATHER_TYPE = 'gtceu:weather_control'

  const HEATPROOF = 'gtceu:heatproof_machine_casing'
  const HEATPROOF_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'
  const STEEL = 'gtceu:solid_machine_casing'
  const STEEL_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const FIREBOX = 'gtceu:steel_firebox_casing'
  const PIPE = 'gtceu:steel_pipe_casing'
  const ROD = 'minecraft:lightning_rod'

  const SMELTER_CAP = 64
  const FURNACE_PARALLELS = 8
  const LAVA_PER_ITEM = 10
  const MAX_KINDS = 16
  const MAX_EXAMINED = 48

  // data keys of the weather recipes (read back by the hooks below and by the smoke test)
  const WEATHER_KEY = 'grindless_weather'
  const WEATHER_TICKS = 'grindless_weather_ticks'
  // circuit, reagents and length of each weather; the recipes are written from this table by the server script
  const WEATHER_MODES = [
    { mode: 'clear', circuit: 1, ticks: 24000, eut: 120, duration: 200, inputs: ['4x gtceu:calcium_chloride_dust'] },
    { mode: 'rain', circuit: 2, ticks: 12000, eut: 120, duration: 200, inputs: ['2x gtceu:salt_dust'] },
    { mode: 'thunder', circuit: 3, ticks: 6000, eut: 120, duration: 400, inputs: ['2x gtceu:salt_dust', '4x gtceu:fine_copper_wire'] }
  ]

  // published for the server script and the smoke test
  U.machines = { smelter: SMELTER, furnace: FURNACE, weather: WEATHER }
  U.weatherType = WEATHER_TYPE
  U.weather = { key: WEATHER_KEY, ticksKey: WEATHER_TICKS, modes: WEATHER_MODES }
  U.smelterCap = SMELTER_CAP
  U.furnaceParallels = FURNACE_PARALLELS
  U.lavaPerItem = LAVA_PER_ITEM
  U.stats = U.stats || { merges: 0, last: null, weather: [] }
  // weatherCount only grows (the weather log keeps the last 20 changes): the smoke test watches it
  if (U.stats.weatherCount == null) U.stats.weatherCount = 0

  // ---------------------------------------------------------------- patterns

  // QR-S1: the smelter is a 5x4x5 furnace hall (steel frame posts, a ring of heating coils round the glowing bay, glass windows,
  // a pipe flue in the roof); the lava furnace a 5x6x5 foundry (firebox hearth, framed steel walls, glass windows, pipe chimney).
  const SMELTER_SPEC = {
    slices: [
      ['XXXXX', 'FKXKF', 'FKGKF', 'XXXXX'],
      ['XXXXX', 'K###K', 'K###K', 'XXXXX'],
      ['XXXXX', 'X###X', 'G###G', 'XXPXX'],
      ['XXXXX', 'K###K', 'K###K', 'XXXXX'],
      ['XXXXX', 'FKSKF', 'FKGKF', 'XXXXX']
    ],
    symbols: {
      S: Pat.controller(),
      // 51 cells: 41 to 50 heatproof casings, the rest parts
      X: Pat.oneOf(
        Pat.block(HEATPROOF, { min: 41 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 4 }),
        Pat.part('output_bus', { min: 1, max: 4 })
      ),
      K: Coils.predicate(),
      F: Pat.frame(['steel']),
      G: Pat.block('minecraft:glass'),
      P: Pat.block(PIPE),
      '#': Pat.air()
    }
  }

  const FURNACE_SPEC = {
    slices: [
      ['FFFFF', 'MXXXM', 'MXGXM', 'MXXXM', 'XXXXX', '#####'],
      ['FFFFF', 'X###X', 'X###X', 'X###X', 'XXXXX', '#####'],
      ['FFFFF', 'X###X', 'G###G', 'X###X', 'XXPXX', '##P##'],
      ['FFFFF', 'X###X', 'X###X', 'X###X', 'XXXXX', '#####'],
      ['FFFFF', 'MXSXM', 'MXGXM', 'MXXXM', 'XXXXX', '#####']
    ],
    symbols: {
      S: Pat.controller(),
      // the hearth: 25 cells, one of them the lava hatch
      F: Pat.oneOf(
        Pat.block(FIREBOX, { min: 24 }),
        Pat.part('input_hatch', { exact: 1 })
      ),
      // the walls and roof: 55 cells, 2 to 4 of them buses
      X: Pat.oneOf(
        Pat.block(STEEL, { min: 51 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 })
      ),
      M: Pat.frame(['steel']),
      G: Pat.block('minecraft:glass'),
      P: Pat.block(PIPE),
      '#': Pat.air()
    }
  }
  const WEATHER_SPEC = {
    slices: [
      ['XXX', 'F F', 'F F', '   ', '   ', '   '],
      ['XXX', ' P ', ' P ', ' P ', ' P ', ' L '],
      ['XSX', 'F F', 'F F', '   ', '   ', '   ']
    ],
    symbols: {
      S: Pat.controller(),
      // 8 base cells: 1 or 2 energy hatches and the input bus, the rest casing
      X: Pat.oneOf(
        Pat.block(STEEL, { min: 5 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 })
      ),
      F: Pat.frame(['steel']),
      P: Pat.block(PIPE),
      L: Pat.block(ROD)
    }
  }

  // ---------------------------------------------------------------- cross-recipe smelting (shared by the two furnaces)

  var LC = null
  function lc() {
    if (LC === null) {
      var EU = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability')
      LC = {
        GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
        Content: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.Content'),
        ContentModifier: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier'),
        ParallelLogic: Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        FluidIngredient: Java.loadClass('com.gregtechceu.gtceu.api.recipe.ingredient.FluidIngredient'),
        EnergyStack: Java.loadClass('com.gregtechceu.gtceu.api.recipe.ingredient.EnergyStack'),
        EU: EU,
        EUCap: EU.CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        HashMap: Java.loadClass('java.util.HashMap'),
        ArrayList: Java.loadClass('java.util.ArrayList')
      }
    }
    return LC
  }

  // every content consumed or produced in full (chance == maxChance): no chanced outputs, no non-consumed catalysts.
  // euOnly: the map may only hold EU (the per-tick inputs of a smelting recipe); otherwise EU is not allowed at all
  function plainContents(map, euOnly) {
    var c = lc()
    var it = map.keySet().iterator()
    while (it.hasNext()) {
      var cap = it.next()
      if (cap.equals(c.EUCap) !== euOnly) return false
      if (euOnly) continue
      var list = map.get(cap)
      for (var i = 0; i < list.size(); i++) {
        var ct = list.get(i)
        if (ct.chance <= 0 || ct.chance < ct.maxChance) return false
      }
    }
    return true
  }

  function isPlain(r) {
    return r.conditions.isEmpty() && r.ingredientActions.isEmpty() && r.tickOutputs.isEmpty() &&
      plainContents(r.inputs, false) && plainContents(r.outputs, false) && plainContents(r.tickInputs, true)
  }

  function euOf(r) {
    return Number(lc().RecipeHelper.getRealEUt(r).getTotalEU())
  }

  // copies of every content of `map` scaled by n, appended to `into` (fresh lists: GTRecipe#copy shares them with the original)
  function addScaled(into, map, n) {
    var c = lc()
    var mod = c.ContentModifier.multiplier(n)
    var it = map.keySet().iterator()
    while (it.hasNext()) {
      var cap = it.next()
      var list = map.get(cap)
      var out = into.get(cap)
      if (out == null) {
        out = new c.ArrayList()
        into.put(cap, out)
      }
      for (var i = 0; i < list.size(); i++) out.add(list.get(i).copy(cap, mod))
    }
  }

  function addLava(into, mb) {
    var c = lc()
    var out = into.get(c.FluidCap)
    if (out == null) {
      out = new c.ArrayList()
      into.put(c.FluidCap, out)
    }
    out.add(new c.Content(c.FluidIngredient.of(GTMaterials.Lava.getFluid(), mb), 10000, 10000, 0))
  }

  // one GTRecipe with the contents of every chosen recipe x its parallels; it keeps the anchor's id, type, category, data and
  // time (only recipes of the anchor's own cooking time are ever chosen)
  function assemble(cfg, anchor, chosen) {
    var c = lc()
    var total = 0
    var eut = 0
    var inputs = new c.HashMap()
    var outputs = new c.HashMap()
    var tickInputs = new c.HashMap()
    chosen.forEach(function (s) {
      total += s.n
      eut += s.eu * s.n
      addScaled(inputs, s.r.inputs, s.n)
      addScaled(outputs, s.r.outputs, s.n)
    })
    if (cfg.mode === 'lava') addLava(inputs, total * cfg.lavaPerItem)
    else c.EU.putEUContent(tickInputs, new c.EnergyStack(Math.max(1, eut)))
    var merged = new c.GTRecipe(anchor.recipeType, anchor.getId(), inputs, outputs, tickInputs, new c.HashMap(),
      new c.HashMap(anchor.inputChanceLogics), new c.HashMap(anchor.outputChanceLogics),
      new c.HashMap(anchor.tickInputChanceLogics), new c.HashMap(anchor.tickOutputChanceLogics),
      new c.ArrayList(anchor.conditions), new c.ArrayList(anchor.ingredientActions), anchor.data,
      Math.max(1, Number(anchor.duration)), anchor.recipeCategory, anchor.groupColor)
    merged.parallels = total
    return merged
  }

  // a recipe that cannot be merged (not plain) still runs alone with GTM's usual parallel + overclock, in the electric smelter
  function standardParallel(machine, recipe, limit) {
    var c = lc()
    var n = c.ParallelLogic.getParallelAmount(machine, recipe, limit)
    if (n < 1) return ModifierFunction.NULL
    var par = ModifierFunction.IDENTITY
    var scaled = recipe
    if (n > 1) {
      par = ModifierFunction.builder()
        .modifyAllContents(c.ContentModifier.multiplier(n))
        .eutMultiplier(n)
        .parallels(n)
        .build()
      scaled = par.apply(recipe)
      if (scaled == null) return ModifierFunction.NULL
    }
    return par.andThen(OverclockingLogic.NON_PERFECT_OVERCLOCK.getModifier(machine, scaled, machine.getOverclockVoltage()))
  }

  function crossModify(cfg, machine, recipe) {
    var c = lc()
    var limit = cfg.limit(machine)
    if (limit < 1) return ModifierFunction.NULL
    if (!isPlain(recipe)) {
      if (cfg.mode === 'eu') return standardParallel(machine, recipe, limit)
      return ModifierFunction.NULL
    }
    var maxEU = cfg.mode === 'eu' ? Number(machine.getOverclockVoltage()) : 0
    var duration = Number(recipe.duration)
    var chosen = []
    var merged = null
    var seen = {}
    var examined = 0
    var total = 0
    var euSum = 0

    // a recipe joins the run with as many parallels as fit: its own limit (inputs, output room, the run's limit and energy), then
    // halved until the whole merged recipe still matches the buses (no two recipes claim the same items or the same output room).
    // Only recipes of the anchor's cooking time join, so every item keeps its own time and EU per item.
    var tryAdd = function (r) {
      if (r == null) return
      var id = String(r.getId())
      if (seen[id]) return
      seen[id] = true
      examined++
      if (Number(r.duration) !== duration || !isPlain(r)) return
      var eu = euOf(r)
      var room = limit - total
      if (cfg.mode === 'eu') {
        if (eu <= 0) return
        room = Math.min(room, Math.floor((maxEU - euSum) / eu))
      }
      if (room < 1) return
      var n = room === 1 ? 1 : c.ParallelLogic.getParallelAmountWithoutEU(machine, r, room)
      while (n >= 1) {
        var cand = { r: r, n: n, eu: eu }
        var trial = assemble(cfg, recipe, chosen.concat([cand]))
        if (c.RecipeHelper.matchRecipe(machine, trial).isSuccess()) {
          chosen.push(cand)
          merged = trial
          total += n
          euSum += eu * n
          return
        }
        n = Math.floor(n / 2)
      }
    }

    tryAdd(recipe)
    if (merged === null) return cfg.mode === 'lava' ? cfg.noLava() : ModifierFunction.NULL
    var found = machine.getRecipeType().searchRecipe(machine, function (r) { return true })
    while (total < limit && chosen.length < MAX_KINDS && examined < MAX_EXAMINED && found.hasNext()) tryAdd(found.next())

    var result = merged
    if (cfg.mode === 'eu') {
      result = OverclockingLogic.NON_PERFECT_OVERCLOCK.getModifier(machine, merged, machine.getOverclockVoltage()).apply(merged)
      if (result == null) return ModifierFunction.NULL
    }
    U.stats.merges++
    U.stats.last = {
      machine: cfg.machine, kinds: chosen.length, items: total, limit: limit,
      eut: cfg.mode === 'eu' ? euOf(result) : 0, duration: Number(result.duration)
    }
    // the merged recipe replaces whatever GTM hands in (GTM applies the composed modifier more than once: it is constant)
    return ModifierFunction.IDENTITY.andThen(function (r) { return result })
  }

  function crossSmelt(cfg) {
    return function (machine, recipe) {
      try {
        return crossModify(cfg, machine, recipe)
      } catch (e) {
        if (!cfg.failed) {
          cfg.failed = true
          console.error(LOG + cfg.machine + ': cross-recipe smelting failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  // GTL's rule: each 900 K of coil temperature doubles the parallels; capped at 64
  function smelterLimit(machine) {
    var t = Coils.temperature(machine)
    if (t <= 0) return 1
    return Math.min(SMELTER_CAP, Math.pow(2, Math.floor(t / 900)))
  }
  U.smelterLimitAt = function (kelvin) { return Math.min(SMELTER_CAP, Math.pow(2, Math.floor(kelvin / 900))) }

  var NO_LAVA = null
  const SMELTER_CFG = { machine: SMELTER, mode: 'eu', limit: smelterLimit }
  const FURNACE_CFG = {
    machine: FURNACE, mode: 'lava', lavaPerItem: LAVA_PER_ITEM,
    limit: function () { return FURNACE_PARALLELS },
    noLava: function () {
      if (NO_LAVA === null) NO_LAVA = ModifierFunction.cancel(Text.translate('grindless.machine.lava_furnace.no_lava'))
      return NO_LAVA
    }
  }

  // ---------------------------------------------------------------- weather

  var weatherFailed = false
  function weatherError(where, e) {
    if (weatherFailed) return
    weatherFailed = true
    console.error(LOG + 'weather controller ' + where + ' failed: ' + e)
  }

  // the requested weather is already set with more than half of its time left: wait instead of seeding again
  function alreadySet(level, mode, ticks) {
    var data = level.getLevelData()
    var half = Math.floor(ticks / 2)
    if (mode === 'clear') return !data.isRaining() && Number(data.getClearWeatherTime()) > half
    if (mode === 'rain') return data.isRaining() && !data.isThundering() && Number(data.getRainTime()) > half
    if (mode === 'thunder') return data.isThundering() && Number(data.getThunderTime()) > half
    return false
  }

  var ALREADY = null
  function weatherGate(machine, recipe) {
    try {
      var mode = String(recipe.data.getString(WEATHER_KEY))
      var level = machine.getLevel()
      if (mode !== '' && level != null && alreadySet(level, mode, Number(recipe.data.getInt(WEATHER_TICKS)))) {
        if (ALREADY === null) ALREADY = ModifierFunction.cancel(Text.translate('grindless.machine.weather_controller.already_set'))
        return ALREADY
      }
    } catch (e) {
      weatherError('check', e)
    }
    return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
  }

  // GTM calls afterWorking when a run finishes (progress == duration) and when a run is interrupted (progress < duration)
  function weatherApply(machine) {
    try {
      var logic = machine.getRecipeLogic()
      if (logic.getDuration() <= 0 || logic.getProgress() < logic.getDuration()) return
      var recipe = logic.getLastRecipe()
      if (recipe == null) return
      var mode = String(recipe.data.getString(WEATHER_KEY))
      var ticks = Number(recipe.data.getInt(WEATHER_TICKS))
      var level = machine.getLevel()
      if (mode === '' || ticks <= 0 || level == null) return
      if (mode === 'clear') level.setWeatherParameters(ticks, 0, false, false)
      else if (mode === 'rain') level.setWeatherParameters(0, ticks, true, false)
      else if (mode === 'thunder') level.setWeatherParameters(0, ticks, true, true)
      else return
      U.stats.weatherCount++
      U.stats.weather.push({ mode: mode, ticks: ticks, at: Number(level.getTime()) })
      if (U.stats.weather.length > 20) U.stats.weather.shift()
    } catch (e) {
      weatherError('hook', e)
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // items in: the programmed circuit (the mode) and up to two reagents; nothing comes out but the weather
    event.create('weather_control')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(3, 0, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_GAS_COLLECTOR, FillDirection.DOWN_TO_UP)
      .setSound(GTSoundEntries.JET_ENGINE)
  })

  // ---------------------------------------------------------------- machines

  function tips(id, n) {
    var out = []
    for (var i = 0; i < n; i++) out.push(Text.translate('grindless.machine.' + id + '.tooltip.' + i))
    return out
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(SMELTER, SMELTER_SPEC)
    Pat.register(FURNACE, FURNACE_SPEC)
    Pat.register(WEATHER, WEATHER_SPEC)

    event.create('advanced_multi_smelter', 'multiblock')
      .langValue('Advanced Multi Smelter')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return Coils.create(holder) })
      .recipeType('electric_furnace')
      .recipeModifier(crossSmelt(SMELTER_CFG), true)
      .appearanceBlock(GTBlocks.CASING_INVAR_HEATPROOF)
      .pattern(function (def) { return Pat.build(def, SMELTER_SPEC) })
      .additionalDisplay(function (controller, components) {
        try {
          if (!controller.isFormed()) return
          components.add(Text.translate('grindless.machine.advanced_multi_smelter.parallels',
            String(smelterLimit(controller)), String(Coils.temperature(controller))))
        } catch (e) { /* display only */ }
      })
      ["tooltips(net.minecraft.network.chat.Component[])"](tips('advanced_multi_smelter', 4))
      .workableCasingModel(HEATPROOF_TEXTURE, 'grindless:block/multiblock/advanced_multi_smelter')

    event.create('lava_furnace', 'multiblock')
      .langValue('Lava Furnace')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('electric_furnace')
      .recipeModifier(crossSmelt(FURNACE_CFG), true)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, FURNACE_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"](tips('lava_furnace', 4))
      .workableCasingModel(STEEL_TEXTURE, 'grindless:block/multiblock/lava_furnace')

    event.create('weather_controller', 'multiblock')
      .langValue('Weather Controller')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('weather_control')
      .recipeModifier(weatherGate, true)
      .afterWorking(weatherApply)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, WEATHER_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"](tips('weather_controller', 4))
      .workableCasingModel(STEEL_TEXTURE, 'grindless:block/multiblock/weather_controller')
  })
})()
