// priority: -5339
// Gregtech Grindless - smoke test of package B5b, mars-site (TEST-ONLY overlay: copied over the instance on the test PC, never shipped
// with the pack): the Atmosphere Processor (startup_scripts/grindless/ev/mars_site.js, server_scripts/grindless/ev/mars_site.js) and the
// site rules of power (server_scripts/grindless/power/generators.js, data/grindless/tables/site_fuels.json).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_mars_site;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|mars_site\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|mars_site|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|mars_site|DONE.
//   static (no world)
//     registration      gtceu:atmosphere_processing (sizes) and gtceu:atmosphere_processor are registered, the pattern is described
//     processor_recipes the two recipes in the recipe manager: circuit, catalyst chance, fluids, EU/t, duration, only the Mars condition;
//                       the energy is at least the sum of GTM's stages and the Sabatier recipe balances C, H and O
//     energy_balance    1 000 mB of methane burnt in the gas turbine gives less EU than the processor spent on it (no energy from nothing)
//     crafting          the controller recipe exists and gives the controller
//     site_table        site_fuels.json is loaded; its air dimensions are the dimensions of Earth in planets.json without the orbit
//     site_<type>       every live recipe of each burning type: the fuels that burn anywhere carry no dimension condition, every other one
//                       carries exactly the dimensions with air (positive, ORed by GTM)
//     doubling          spot checks: methane, diesel, steam and rocket fuel keep their doubled durations
//     methalox_fuel     grindless:gas_turbine/methalox: 6 mB, 14 t, 32 EU/t out, no condition, the same EU per mB of methane as methane
//     power_report      generators.js reports no failure
//   in the world (band X 8192-8255, Z 0-15: the Overworld and grindless:void at Y 98-112, gcyr:luna and gcyr:mars at Y 198-214)
//     FUEL_<case>       single blocks with fuel: a combustion generator burns diesel on Earth and in the void, not on the Moon or Mars; a
//                       small coal boiler burns on Earth, not on the Moon; a gas turbine burns methalox on the Moon and Mars and not methane
//                       on Mars; a combustion generator burns GTM's rocket fuel (it carries its oxidizer) on Mars
//     processor         on Mars: DESCRIPTION / PLACED / FORMED / PATTERN / PARTS, PROCESS_sabatier (1 000 mB methane + 4 000 mB oxygen
//                       from 2 000 mB water), PROCESS_no_catalyst (nothing runs), PROCESS_co2_intake (CO2 in runs of 10 000 mB), LOOKUP
// TEST AREA: this test force-loads, clears and builds ONLY its band in each dimension (AGENTS.md: tests run at the same time in one server).
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'mars_site'
  var KEY = 'processor'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var FUEL_TICKS = 140
  var BAND = { x0: 8192, x1: 8255, z0: 0, z1: 15 }
  var OVERWORLD = 'minecraft:overworld'
  var VOID = 'grindless:void'
  var LUNA = 'gcyr:luna'
  var MARS = 'gcyr:mars'
  var BAND_Y = {}
  BAND_Y[OVERWORLD] = [98, 112]
  BAND_Y[VOID] = [98, 112]
  BAND_Y[LUNA] = [198, 214]
  BAND_Y[MARS] = [198, 214]
  var PROCESSOR = { x: 8240, y: 200, z: 8 }

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestMarsSiteRequest'

  var MACHINE_ID = 'gtceu:atmosphere_processor'
  var TYPE_ID = 'gtceu:atmosphere_processing'
  var CATALYST = 'grindless:ruthenium_catalyst'
  var METHALOX_ID = 'grindless:gas_turbine/methalox'

  var PART_BLOCKS = {
    energy_input: 'gtceu:ev_energy_input_hatch',
    input_bus: 'gtceu:ev_input_bus',
    input_hatch: 'gtceu:ev_input_hatch',
    output_hatch: 'gtceu:ev_output_hatch'
  }
  var NEED = { energy: 1, inBus: true, inHatches: 1, outHatches: 2 }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  // single blocks: what they burn and where; run = the fuel must burn there
  var FUEL_CASES = [
    { key: 'earth_diesel', dim: OVERWORLD, x: 8194, block: 'gtceu:lv_combustion', fluid: 'gtceu:diesel', recipe: 'gtceu:combustion_generator/diesel', run: true },
    { key: 'earth_coal_boiler', dim: OVERWORLD, x: 8198, block: 'gtceu:lp_steam_solid_boiler', item: 'minecraft:coal', recipe: 'gtceu:steam_boiler/minecraft_coal', run: true },
    { key: 'void_diesel', dim: VOID, x: 8194, block: 'gtceu:lv_combustion', fluid: 'gtceu:diesel', recipe: 'gtceu:combustion_generator/diesel', run: true },
    { key: 'moon_diesel', dim: LUNA, x: 8194, block: 'gtceu:lv_combustion', fluid: 'gtceu:diesel', recipe: 'gtceu:combustion_generator/diesel', run: false },
    { key: 'moon_coal_boiler', dim: LUNA, x: 8198, block: 'gtceu:lp_steam_solid_boiler', item: 'minecraft:coal', recipe: 'gtceu:steam_boiler/minecraft_coal', run: false },
    { key: 'moon_methalox', dim: LUNA, x: 8202, block: 'gtceu:lv_gas_turbine', fluid: 'gtceu:methalox', recipe: METHALOX_ID, run: true },
    { key: 'mars_diesel', dim: MARS, x: 8194, block: 'gtceu:lv_combustion', fluid: 'gtceu:diesel', recipe: 'gtceu:combustion_generator/diesel', run: false },
    { key: 'mars_methane', dim: MARS, x: 8198, block: 'gtceu:lv_gas_turbine', fluid: 'gtceu:methane', recipe: 'gtceu:gas_turbine/methane', run: false },
    { key: 'mars_methalox', dim: MARS, x: 8202, block: 'gtceu:lv_gas_turbine', fluid: 'gtceu:methalox', recipe: METHALOX_ID, run: true },
    { key: 'mars_rocket_fuel', dim: MARS, x: 8206, block: 'gtceu:lv_combustion', fluid: 'gtceu:rocket_fuel', recipe: 'gtceu:combustion_generator/rocket_fuel', run: true }
  ]
  var FUEL_Z = 2

  var S = null
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

  function safely(name, fn) {
    try {
      fn()
    } catch (e) {
      check(SCOPE, name, false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- Java and world helpers

  function lazy() {
    if (classes === null) {
      classes = {
        ArrayList: Java.loadClass('java.util.ArrayList'),
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
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

  function asArray(coll) {
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function levelOf(dim) {
    return S.server.getLevel(String(dim))
  }

  function cmd(dim, text) {
    return S.server.runCommandSilent('execute in ' + dim + ' run ' + text)
  }

  function machineAt(level, p) {
    return lazy().MetaMachine.getMachine(level, new BlockPos(p.x, p.y, p.z))
  }

  function blockIdAt(level, x, y, z) {
    return String(level.getBlock(x, y, z).getId())
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

  function itemSummary(counts) {
    return Object.keys(counts).sort().map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function liveOfType(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? asArray(S.server.getRecipeManager().getAllRecipesFor(type)) : []
  }

  // EU/t a recipe makes or takes, signed: > 0 output, < 0 input, 0 none
  function signedEUt(recipe) {
    var io = lazy().Helper.getRealEUtWithIO(recipe)
    if (io.isEmpty()) return 0
    return io.isInput() ? -Number(io.getTotalEU()) : Number(io.getTotalEU())
  }

  function conditionsOf(recipe) {
    return asArray(recipe.conditions).map(function (c) {
      try {
        return JSON.parse(String(c.serialize()))
      } catch (e) {
        return { type: 'unreadable', error: String(e) }
      }
    })
  }

  // the dimension conditions of a live recipe: { pos: [ids], neg: [ids], other: [types] }
  function dimensionsOf(recipe) {
    var d = { pos: [], neg: [], other: [] }
    conditionsOf(recipe).forEach(function (c) {
      var t = String(c.type).replace(/^gtceu:/, '')
      if (t === 'dimension') (c.reverse ? d.neg : d.pos).push(String(c.dimension))
      else d.other.push(t)
    })
    d.pos.sort()
    d.neg.sort()
    return d
  }

  function fluidsIn(recipe) {
    return asArray(lazy().Helper.getInputFluids(recipe)).map(function (st) { return { id: fluidName(st), amount: Number(st.getAmount()) } })
  }

  function fluidsOut(recipe) {
    return asArray(lazy().Helper.getOutputFluids(recipe)).map(function (st) { return { id: fluidName(st), amount: Number(st.getAmount()) } })
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var MS = global.grindless.marsSite
    var POWER = global.grindless.power

    safely('registration', function () {
      var ic = lazy().ItemCap
      var fc = lazy().FluidCap
      var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE_ID))
      var machine = GTRegistries.MACHINES.get(rl(MACHINE_ID))
      var sizes = type ? [type.getMaxInputs(ic), type.getMaxOutputs(ic), type.getMaxInputs(fc), type.getMaxOutputs(fc)] : []
      var want = [MS.maxIO.itemsIn, MS.maxIO.itemsOut, MS.maxIO.fluidsIn, MS.maxIO.fluidsOut]
      var desc = global.grindless.patterns.describe(MACHINE_ID)
      check(SCOPE, 'registration', !!type && sizes.join(',') === want.join(',') && !!machine && !!desc,
        TYPE_ID + '=' + (type ? 'registered (items in/out, fluids in/out: ' + sizes.join('/') + ', want ' + want.join('/') + ')' : 'missing') +
        ' machine=' + (machine ? 'registered' : 'missing') + ' pattern description=' + (desc ? desc.slices.length + ' slices' : 'missing'))
    })

    safely('processor_recipes', function () {
      var problems = []
      var lines = []
      var live = liveOfType(TYPE_ID)
      if (live.length !== MS.recipes.length) problems.push(live.length + ' live recipes of the type, the script made ' + MS.recipes.length)
      MS.recipes.forEach(function (p) {
        var r = liveRecipe(p.id)
        if (r === null) {
          problems.push(p.id + ' missing')
          return
        }
        var eut = signedEUt(r)
        if (Number(r.duration) !== p.duration || eut !== -p.eut) problems.push(p.name + ' ' + r.duration + ' t x ' + eut + ' EU/t, want ' + p.duration + ' x ' + -p.eut)
        if (p.energy < p.stageSum) problems.push(p.name + ' energy ' + p.energy + ' below the stages ' + p.stageSum)
        if (p.atoms.c !== 0 || p.atoms.h !== 0 || p.atoms.o !== 0) problems.push(p.name + ' does not balance: ' + JSON.stringify(p.atoms))
        var dims = dimensionsOf(r)
        if (dims.pos.join(',') !== MS.dimension || dims.neg.length > 0 || dims.other.length > 0) {
          problems.push(p.name + ' conditions ' + JSON.stringify(conditionsOf(r)) + ', want only ' + MS.dimension)
        }
        var fin = fluidsIn(r)
        var fout = fluidsOut(r)
        var finText = fin.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
        var foutText = fout.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
        var wantIn = p.fluidsIn.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
        var wantOut = p.fluidsOut.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
        if (finText !== wantIn) problems.push(p.name + ' fluids in [' + finText + '], want [' + wantIn + ']')
        if (foutText !== wantOut) problems.push(p.name + ' fluids out [' + foutText + '], want [' + wantOut + ']')
        var catalyst = null
        var circuit = null
        asArray(r.getInputContents(lazy().ItemCap)).forEach(function (c) {
          var text = ''
          try { text = String(c.content.toJson()) } catch (e) { text = String(c.content) }
          if (text.indexOf(CATALYST) >= 0) catalyst = Number(c.chance)
          var m = /"configuration"\s*:\s*(\d+)/.exec(text)
          if (m) circuit = Number(m[1])
        })
        if (circuit !== p.circuit) problems.push(p.name + ' circuit ' + circuit + ', want ' + p.circuit)
        if (p.catalyst && catalyst !== MS.catalystWear) problems.push(p.name + ' catalyst chance ' + catalyst + ', want ' + MS.catalystWear)
        if (!p.catalyst && catalyst !== null) problems.push(p.name + ' takes the catalyst')
        lines.push(p.name + ': circuit ' + circuit + ', catalyst ' + (catalyst === null ? 'none' : catalyst + '/10000') + ', in [' + finText + '] out [' + foutText +
          '] ' + r.duration + ' t x ' + -eut + ' EU/t = ' + p.energy + ' EU (stages ' + JSON.stringify(p.stages) + '), only in ' + dims.pos.join(','))
      })
      check(SCOPE, 'processor_recipes', problems.length === 0, lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : ''))
    })

    safely('energy_balance', function () {
      var sab = MS.recipes.filter(function (p) { return p.name === 'sabatier' })[0]
      var methane = liveRecipe('gtceu:gas_turbine/methane')
      var mixer = liveRecipe('grindless:mixer/methalox')
      if (!sab || methane === null) throw new Error('missing the Sabatier plan or gtceu:gas_turbine/methane')
      var perMb = signedEUt(methane) * Number(methane.duration) / fluidsIn(methane)[0].amount
      var ch4 = sab.fluidsOut.filter(function (f) { return f.id === 'gtceu:methane' })[0].amount
      var back = perMb * ch4
      var mixEu = mixer === null ? 0 : -signedEUt(mixer) * Number(mixer.duration) * ch4 / 1000
      check(SCOPE, 'energy_balance', back < sab.energy,
        'methane burns at ' + perMb + ' EU/mB: ' + ch4 + ' mB give ' + back + ' EU, the processor spent ' + sab.energy + ' EU (' +
        Math.round(1000 * back / sab.energy) / 10 + '%); as methalox ' + back + ' EU for ' + (sab.energy + mixEu) + ' EU with the mixer (' +
        Math.round(1000 * back / (sab.energy + mixEu)) / 10 + '%)')
    })

    safely('crafting', function () {
      var r = liveRecipe(MS.craftingRecipe)
      var out = r === null ? 'missing' : String(r.getResultItem(S.server.registryAccess()).getId())
      check(SCOPE, 'crafting', out === MACHINE_ID, MS.craftingRecipe + ' gives ' + out)
    })

    safely('site_table', function () {
      var site = POWER && POWER.site
      if (!site || !site.loaded) throw new Error('global.grindless.power.site is not loaded')
      var planets = global.grindless.readJsonTable('kubejs/data/grindless/tables/planets.json')
      var earth = planets.planets.earth.dimensions.filter(function (d) { return !/_orbit$/.test(d) }).slice().sort()
      var air = site.airDimensions.slice().sort()
      check(SCOPE, 'site_table', earth.join(',') === air.join(','), 'air=' + air.join(',') + ' earth without its orbit=' + earth.join(',') +
        ' burning types=' + site.burningTypes.join(',') + ' burn anywhere=' + site.burnAnywhere.map(function (f) { return f.fluid }).join(','))
    })

    safely('site_recipes', function () {
      var site = POWER.site
      var air = site.airDimensions.slice().sort().join(',')
      var anywhere = {}
      site.burnAnywhere.forEach(function (f) { anywhere[String(f.fluid)] = true })
      site.burningTypes.forEach(function (type) {
        var list = liveOfType(type)
        var nAir = 0
        var nAny = 0
        var bad = []
        list.forEach(function (r) {
          var ids = fluidsIn(r).map(function (f) { return f.id.replace(':flowing_', ':') })
          var free = ids.some(function (id) { return anywhere[id] })
          var dims = dimensionsOf(r)
          if (free) {
            nAny++
            if (dims.pos.length > 0 || dims.neg.length > 0) bad.push(String(r.id) + ' burns anywhere but has ' + dims.pos.concat(dims.neg).join(','))
          } else {
            nAir++
            if (dims.pos.join(',') !== air || dims.neg.length > 0) bad.push(String(r.id) + ' has [' + dims.pos.join(',') + '] reversed [' + dims.neg.join(',') + ']')
          }
        })
        check(SCOPE, 'site_' + short(type), bad.length === 0, list.length + ' recipes: ' + nAir + ' only where there is air, ' + nAny + ' anywhere' +
          (bad.length > 0 ? ' | problems(' + bad.length + '): ' + bad.slice(0, 6).join(' ; ') : ''))
      })
    })

    safely('doubling', function () {
      var wants = [
        ['gtceu:gas_turbine/methane', 2, 14, 32],
        ['gtceu:combustion_generator/diesel', 1, 30, 32],
        ['gtceu:combustion_generator/rocket_fuel', 16, 250, 32],
        ['gtceu:steam_turbine/steam', 640, 20, 32]
      ]
      var problems = []
      var lines = []
      wants.forEach(function (w) {
        var r = liveRecipe(w[0])
        if (r === null) {
          problems.push(w[0] + ' missing')
          return
        }
        var amount = fluidsIn(r)[0].amount
        var eut = signedEUt(r)
        lines.push(short(w[0]) + ' ' + amount + ' mB ' + r.duration + ' t ' + eut + ' EU/t')
        if (amount !== w[1] || Number(r.duration) !== w[2] || eut !== w[3]) problems.push(w[0] + ' want ' + w[1] + ' mB ' + w[2] + ' t ' + w[3] + ' EU/t')
      })
      check(SCOPE, 'doubling', problems.length === 0, lines.join(', ') + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : ''))
    })

    safely('methalox_fuel', function () {
      var r = liveRecipe(METHALOX_ID)
      var methane = liveRecipe('gtceu:gas_turbine/methane')
      if (r === null || methane === null) throw new Error((r === null ? METHALOX_ID : 'gtceu:gas_turbine/methane') + ' missing')
      var f = fluidsIn(r)[0]
      var eut = signedEUt(r)
      var conds = conditionsOf(r)
      var perMb = eut * Number(r.duration) / f.amount
      var methanePerMb = signedEUt(methane) * Number(methane.duration) / fluidsIn(methane)[0].amount
      // 3 mB of methalox hold 1 mB of methane (1 000 methane + 2 000 oxygen -> 3 000)
      var ok = f.id === 'gtceu:methalox' && f.amount === 6 && Number(r.duration) === 14 && eut === 32 && conds.length === 0 &&
        Math.abs(perMb * 3 - methanePerMb) < 1e-6
      check(SCOPE, 'methalox_fuel', ok, f.amount + ' mB ' + f.id + ', ' + r.duration + ' t, ' + eut + ' EU/t out, conditions ' + JSON.stringify(conds) +
        ': ' + Math.round(perMb * 100) / 100 + ' EU per mB, ' + Math.round(perMb * 300) / 100 + ' per mB of methane in it (methane ' + methanePerMb + ')')
    })

    safely('power_report', function () {
      var g = POWER.generators
      var s = POWER.siteReport
      var fails = (g ? g.failed : ['no generators report']).concat(s ? s.failed : ['no site report'])
      check(SCOPE, 'power_report', fails.length === 0, 'doubled ' + (g ? g.doubled.length : '?') + ', skipped ' + (g ? g.skipped.length : '?') +
        '; site: ' + (s ? s.conditioned + ' conditioned ' + JSON.stringify(s.perType) + ', anywhere ' + s.anywhere.length + ', kept ' + s.kept.length +
        ', new fuels ' + s.newFuels.map(function (n) { return n.id }).join(',') : '?') + (fails.length > 0 ? ' | failed: ' + fails.join(' ; ') : ''))
    })
  }

  // ---------------------------------------------------------------- the band in each dimension

  function prepareWorld() {
    var dims = [OVERWORLD, VOID, LUNA, MARS]
    var lines = []
    dims.forEach(function (dim) {
      var level = levelOf(dim)
      if (level === null || level === undefined) {
        lines.push(dim + ' not loaded')
        return
      }
      for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
        for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) level.getChunk(cx, cz)
      }
      cmd(dim, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var y = BAND_Y[dim]
      var cleared = cmd(dim, 'fill ' + BAND.x0 + ' ' + y[0] + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + y[1] + ' ' + BAND.z1 + ' air')
      lines.push(dim + ' Y ' + y[0] + '-' + y[1] + ' cleared ' + cleared)
    })
    note(SCOPE, 'AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ' generated and force-loaded: ' + lines.join('; '))
  }

  function releaseWorld() {
    ;[OVERWORLD, VOID, LUNA, MARS].forEach(function (dim) {
      try {
        cmd(dim, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      } catch (e) { /* best effort */ }
    })
  }

  // ---------------------------------------------------------------- fuel cases (single blocks)

  function fuelY(dim) {
    return BAND_Y[dim][0] + 2
  }

  function startFuelCases() {
    S.fuel = []
    FUEL_CASES.forEach(function (c) {
      var level = levelOf(c.dim)
      var p = { x: c.x, y: fuelY(c.dim), z: FUEL_Z }
      var f = { c: c, level: level, pos: p, ok: true, start: 0, startEnergy: 0, seen: {}, statuses: {}, reasons: '' }
      S.fuel.push(f)
      try {
        if (level === null || level === undefined) throw new Error(c.dim + ' is not loaded')
        cmd(c.dim, 'setblock ' + p.x + ' ' + (p.y - 1) + ' ' + p.z + ' minecraft:smooth_stone replace')
        // a roof over the machine and its four neighbours: GTM's weather check may blow up a working generator whose side is rained on
        cmd(c.dim, 'fill ' + (p.x - 1) + ' ' + (p.y + 1) + ' ' + (p.z - 1) + ' ' + (p.x + 1) + ' ' + (p.y + 1) + ' ' + (p.z + 1) + ' minecraft:smooth_stone replace')
        if (cmd(c.dim, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + c.block + '[facing=north] replace') < 1) throw new Error('setblock failed')
        var m = machineAt(level, p)
        if (m === null || m === undefined) throw new Error('no machine at ' + p.x + ',' + p.y + ',' + p.z + ' (' + blockIdAt(level, p.x, p.y, p.z) + ')')
        if (c.fluid) {
          m.importFluids.setFluidInTank(0, Fluid.of(c.fluid, 1000).getFluidStack())
          f.start = Number(m.importFluids.getFluidInTank(0).getAmount())
          f.startEnergy = Number(m.energyContainer.getEnergyStored())
        } else {
          m.waterTank.setFluidInTank(0, Fluid.of('minecraft:water', 8000).getFluidStack())
          var left = m.fuelHandler.insertItem(0, Item.of(c.item, 4), false)
          if (!left.isEmpty()) throw new Error('the boiler refused ' + c.item)
          f.start = Number(m.fuelHandler.getStackInSlot(0).getCount())
        }
        m.getRecipeLogic().updateTickSubscription()
      } catch (e) {
        check(SCOPE, 'FUEL_' + c.key, false, 'could not set up: ' + e)
        f.ok = false
      }
    })
  }

  function watchFuel() {
    S.fuel.forEach(function (f) {
      if (!f.ok) return
      try {
        var m = machineAt(f.level, f.pos)
        var rlg = m.getRecipeLogic()
        var status = String(rlg.getStatus())
        f.statuses[status] = (f.statuses[status] || 0) + 1
        var last = rlg.getLastRecipe()
        if (last) f.seen[String(last.id)] = true
        if (!f.reasons) {
          var reasons = asArray(rlg.getFailureReasons()).map(function (c) { return String(c.getString()) })
          if (reasons.length > 0) f.reasons = reasons.join(' ; ')
        }
      } catch (e) { /* the verdict reports what is missing */ }
    })
  }

  function judgeFuel() {
    S.fuel.forEach(function (f) {
      if (!f.ok) return
      safely('FUEL_' + f.c.key, function () {
        var c = f.c
        var m = machineAt(f.level, f.pos)
        var left = c.fluid ? Number(m.importFluids.getFluidInTank(0).getAmount()) : Number(m.fuelHandler.getStackInSlot(0).getCount())
        var used = f.start - left
        var energy = c.fluid ? Number(m.energyContainer.getEnergyStored()) - f.startEnergy : 0
        var seen = Object.keys(f.seen)
        var ran = used > 0 && seen.indexOf(c.recipe) >= 0 && (!c.fluid || energy > 0)
        var idle = used === 0 && seen.length === 0 && energy === 0
        var ok = c.run ? ran : idle
        check(SCOPE, 'FUEL_' + c.key, ok, c.block.replace('gtceu:', '') + ' in ' + c.dim + ' with ' + (c.fluid || c.item) + ': ' +
          (c.run ? 'must burn' : 'must not burn') + ' | used ' + used + (c.fluid ? ' mB' : ' items') + (c.fluid ? ', EU made ' + energy : '') +
          ', recipes seen [' + seen.join(',') + '], statuses ' + JSON.stringify(f.statuses) + (f.reasons ? ', why idle: ' + f.reasons : ''))
      })
    })
  }

  // ---------------------------------------------------------------- the processor (same technique as gg_test_ev_platinum_plant.js)

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
    return {
      id: machineId,
      cells: placed,
      size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function place(plan) {
    var failed = []
    var ctrlCell = null
    plan.cells.forEach(function (c) {
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (cmd(MARS, 'setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace') < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (cmd(MARS, 'setblock ' + ctrlCell.x + ' ' + ctrlCell.y + ' ' + ctrlCell.z + ' ' + ctrlCell.block.id + ctrlCell.props + ' replace') < 1) failed.push('controller')
    plan.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(S.mars, c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) { return c.block.ability + '@' + c.x + ',' + c.y + ',' + c.z + c.props })
    check(KEY, 'PLACED', failed.length === 0 && wrong.length === 0, 'on ' + MARS + ': blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' +
      plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z + ' parts=[' + parts.join(' ') + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') + (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var pos = err.getPos()
        text += ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' found ' + blockIdAt(S.mars, pos.getX(), pos.getY(), pos.getZ())
      } catch (e1) {
        text += ' (no position: ' + e1 + ')'
      }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return short(p.getDefinition().getId()) })
  }

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
    var P = { energy: [], inBus: null, inHatches: [], outHatches: [], other: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBus = p
      else if (pid === PART_BLOCKS.input_hatch) P.inHatches.push(p)
      else if (pid === PART_BLOCKS.output_hatch) P.outHatches.push(p)
      else P.other.push(pid)
    })
    return P
  }

  function partsProblem(P) {
    var problems = []
    if (P.energy.length !== NEED.energy) problems.push('energy hatches ' + P.energy.length + ' (wanted ' + NEED.energy + ')')
    if ((P.inBus !== null) !== NEED.inBus) problems.push('input bus ' + (P.inBus !== null))
    if (P.inHatches.length !== NEED.inHatches) problems.push('input hatches ' + P.inHatches.length + ' (wanted ' + NEED.inHatches + ')')
    if (P.outHatches.length !== NEED.outHatches) problems.push('output hatches ' + P.outHatches.length + ' (wanted ' + NEED.outHatches + ')')
    if (P.other.length > 0) problems.push('other parts ' + P.other.join(','))
    return problems
  }

  function topUpEnergy(m) {
    if (!m || m.parts === null) return
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
    clearInventory(P.inBus.getInventory())
    clearInventory(P.inBus.getCircuitInventory())
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    P.outHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillInputs(m, sc) {
    var P = m.parts
    var inv = P.inBus.getInventory()
    ;(sc.items || []).forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    // the bus circuit slot refuses insertItem (its capability IO is NONE); players set it through the GUI
    if (sc.circuit) P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    ;(sc.fluids || []).forEach(function (f) {
      // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
      P.inHatches[f.hatch].tank.setFluidInTank(0, Fluid.of(f.id, f.mb).getFluidStack())
    })
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' lastRecipe=' + (last ? last.id : 'none')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

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

  function collect(m) {
    var P = m.parts
    var out = {}
    P.outHatches.map(tankInfo).forEach(function (t) {
      if (t.id !== 'none' && t.amount > 0) out[t.id] = (out[t.id] || 0) + t.amount
    })
    return { fluidIn: P.inHatches.map(tankInfo), fluidOut: out, leftover: readBus(P.inBus), seen: m.seen }
  }

  function seenIds(r) {
    return Object.keys(r.seen).join(',')
  }

  function planNamed(name) {
    var list = global.grindless.marsSite.recipes
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i]
    }
    throw new Error('no atmosphere_processing recipe ' + name)
  }

  // ---------------------------------------------------------------- scenarios

  function sabatierScenario() {
    var plan = planNamed('sabatier')
    var water = plan.fluidsIn[0]
    var sc = {
      name: 'sabatier',
      ticks: plan.duration + 60,
      circuit: plan.circuit,
      items: [{ id: CATALYST, n: 2 }],
      fluids: [{ hatch: 0, id: water.id, mb: water.amount + 300 }]
    }
    sc.verify = function (r) {
      var problems = []
      var have = []
      plan.fluidsOut.forEach(function (f) {
        var got = r.fluidOut[f.id] || 0
        have.push(short(f.id) + ' ' + got + ' mB')
        if (got !== f.amount) problems.push(f.id + ' ' + got + ' mB, wanted ' + f.amount)
      })
      Object.keys(r.fluidOut).forEach(function (id) {
        if (!plan.fluidsOut.some(function (f) { return f.id === id })) problems.push('unexpected fluid out ' + id)
      })
      var waterLeft = r.fluidIn[0] ? r.fluidIn[0].amount : -1
      if (water.amount + 300 - waterLeft !== water.amount) problems.push('water used ' + (water.amount + 300 - waterLeft) + ', wanted ' + water.amount)
      var catalystLeft = r.leftover[CATALYST] || 0
      if (catalystLeft !== 2 && catalystLeft !== 1) problems.push('catalyst left ' + catalystLeft + ' of 2')
      if (r.seen[plan.id] === undefined) problems.push('recipe ' + plan.id + ' never ran')
      return {
        ok: problems.length === 0,
        detail: plan.id + ' (' + plan.duration + ' t, ' + plan.eut + ' EU/t): ' + have.join(', ') + ', water used ' + (water.amount + 300 - waterLeft) +
          ' mB, catalyst left ' + catalystLeft + ' of 2 | recipes seen=[' + seenIds(r) + ']' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
      }
    }
    return sc
  }

  function noCatalystScenario() {
    var plan = planNamed('sabatier')
    var water = plan.fluidsIn[0]
    return {
      name: 'no_catalyst',
      ticks: 80,
      circuit: plan.circuit,
      items: [],
      fluids: [{ hatch: 0, id: water.id, mb: water.amount + 300 }],
      verify: function (r) {
        var problems = []
        if (Object.keys(r.seen).length > 0) problems.push('recipes ran: ' + seenIds(r))
        if (Object.keys(r.fluidOut).length > 0) problems.push('fluids came out: ' + JSON.stringify(r.fluidOut))
        var left = r.fluidIn[0] ? r.fluidIn[0].amount : -1
        if (left !== water.amount + 300) problems.push('water left ' + left)
        return { ok: problems.length === 0, detail: 'circuit 1 and water, no catalyst: nothing ran and nothing was used' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '') }
      }
    }
  }

  function intakeScenario() {
    var plan = planNamed('co2_intake')
    var co2 = plan.fluidsOut[0]
    return {
      name: 'co2_intake',
      ticks: plan.duration * 2 + 10,
      circuit: plan.circuit,
      items: [],
      fluids: [],
      verify: function (r) {
        var problems = []
        var got = r.fluidOut[co2.id] || 0
        if (got <= 0 || got % co2.amount !== 0) problems.push(co2.id + ' ' + got + ' mB, wanted a positive multiple of ' + co2.amount)
        Object.keys(r.fluidOut).forEach(function (id) {
          if (id !== co2.id) problems.push('unexpected fluid out ' + id)
        })
        if (r.seen[plan.id] === undefined) problems.push('recipe ' + plan.id + ' never ran')
        return {
          ok: problems.length === 0,
          detail: plan.id + ' (' + plan.duration + ' t, ' + plan.eut + ' EU/t): ' + got + ' mB of ' + short(co2.id) + ' (' + Math.round(got / co2.amount) + ' runs)' +
            ' | recipes seen=[' + seenIds(r) + ']' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  // every recipe GTM's lookup can reach with the inputs now in the machine (the predicate accepts everything)
  function candidateIds(ctrl) {
    var ids = []
    var it = ctrl.getRecipeType().db().iterator(ctrl, function (r) { return true })
    if (it === null || it === undefined) return ids
    var guard = 0
    while (it.hasNext() && guard < 100) {
      ids.push(String(it.next().id))
      guard++
    }
    return ids
  }

  function runLookup(m, ctrl) {
    var bad = []
    global.grindless.marsSite.recipes.forEach(function (plan) {
      resetMachine(m, ctrl)
      fillInputs(m, {
        items: plan.catalyst ? [{ id: CATALYST, n: 1 }] : [],
        circuit: plan.circuit,
        fluids: plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount } })
      })
      var ids = candidateIds(ctrl)
      if (ids.indexOf(plan.id) < 0) bad.push(plan.name + ' wanted ' + plan.id + ' got [' + ids.slice(0, 6).join(',') + ']')
    })
    resetMachine(m, ctrl)
    check(KEY, 'LOOKUP', bad.length === 0, 'cases=' + global.grindless.marsSite.recipes.length + (bad.length > 0 ? ' unreachable=' + bad.join('; ') : ''))
  }

  // ---------------------------------------------------------------- the machine

  function startProcessor() {
    var m = { phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, parts: null, list: null, sc: -1, scStart: 0, seen: {}, stateNoted: false }
    S.machine = m
    try {
      if (S.mars === null || S.mars === undefined) throw new Error(MARS + ' is not loaded')
      if (!GTRegistries.MACHINES.get(rl(MACHINE_ID))) throw new Error('machine is not registered')
      var desc = global.grindless.patterns.describe(MACHINE_ID)
      m.builtBefore = !!(desc && desc.built)
      m.plan = planOf(MACHINE_ID, PROCESSOR.x, PROCESSOR.y, PROCESSOR.z)
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
      if (last) m.seen[String(last.id)] = true
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
    fillInputs(m, sc)
    wake(ctrl)
    m.scStart = S.t
  }

  function advance(m) {
    var ctrl = machineAt(S.mars, m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(KEY, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(KEY, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') + 'parts=[' + partIds(ctrl).join(' ') + ']')
        check(KEY, 'PATTERN', global.grindless.patterns.describe(MACHINE_ID).built, 'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        m.parts = findParts(ctrl)
        var problems = partsProblem(m.parts)
        check(KEY, 'PARTS', problems.length === 0, problems.length > 0 ? problems.join('; ') : '1 energy hatch, 1 input bus, 1 input hatch, 2 output hatches')
        if (problems.length > 0) {
          m.phase = 'done'
          return
        }
        m.list = [sabatierScenario(), noCatalystScenario(), intakeScenario()]
        m.sc = -1
        m.phase = 'running'
        topUpEnergy(m)
        nextScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!ctrl.checkPatternWithLock()) {
          check(KEY, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
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

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    releaseWorld()
    console.info(TAG + SCOPE + '|DONE')
  }

  function step() {
    if (S.fuelPhase === 'running' && S.t >= FUEL_TICKS) {
      judgeFuel()
      S.fuelPhase = 'done'
    }
    var m = S.machine
    if (m !== null && m.phase !== 'done') {
      try {
        advance(m)
      } catch (e) {
        check(KEY, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    }
    if ((m === null || m.phase === 'done') && S.fuelPhase === 'done') finish()
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    S.t = now - S.tick0
    if (S.machine !== null && S.machine.phase === 'running') {
      try { topUpEnergy(S.machine) } catch (e) { /* the next step reports problems */ }
      try {
        var ctrl = machineAt(S.mars, S.machine.ctrl)
        if (ctrl) observe(S.machine, ctrl)
      } catch (e2) { /* optional */ }
    }
    if (S.fuelPhase === 'running') watchFuel()
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step()
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
    S = { server: server, t: 0, tick0: now, nextAt: now + STEP, machine: null, fuel: [], fuelPhase: 'none', finished: false, mars: null }
    S.mars = levelOf(MARS)
    try {
      staticChecks()
    } catch (e) {
      check(SCOPE, 'static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e2) {
      check(SCOPE, 'AREA', false, 'exception: ' + e2)
    }
    try {
      startFuelCases()
      S.fuelPhase = 'running'
    } catch (e3) {
      check(SCOPE, 'FUEL', false, 'exception: ' + e3)
      S.fuelPhase = 'done'
    }
    startProcessor()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_mars_site', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_mars_site run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
