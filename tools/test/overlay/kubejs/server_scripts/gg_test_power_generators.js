// priority: -6324
// Gregtech Grindless - smoke test of package A3, power-generators (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): the generator multiblock mechanism of startup_scripts/grindless/lib/generators.js (the spike: a multiblock
// registered from KubeJS makes EU) and the LV Generator Array, gtceu:generator_array (startup_scripts/grindless/power/generator_array.js).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_power_generators;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|power_generators\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|power_generators|<check>|PASS|FAIL|NOTE|<detail>
//   registration        the machine is registered as a generator (isGenerator), does not regress while waiting, runs the three LV
//                       fuel types in this order: steam turbine, combustion generator, gas turbine
//   helper              global.grindless.generators is published
//   fuels               every recipe of the three types makes 32 EU/t and uses no EU (the dynamo arithmetic of the tooltip)
//   controller_recipe   the controller recipe exists, makes the controller and holds one of each LV generator
//   <copy>_PLACED / <copy>_FORMED / <copy>_PARTS   for each of the seven copies below
//   spike_eu_to_buffer  copy steam_x2: EU leaves the dynamo hatch into a real LV battery buffer (its batteries charge), and battery +
//                       what is still in the hatch = exactly the EU the fuel is worth
//   amps_counted        copy steam_x2: one LV dynamo hatch (32 V, 2 A) carries 2 runs of 32 EU/t (GTM's own limit,
//                       getOverclockVoltage, reads 32 V: 1 run)
//   PROCESS_<copy>      parallels, EU/t, fuel used, EU made, EU per mB (= the single block's) and distilled water, per copy
//   scaling             EU/t and steam per run of the three steam copies scale with their parallels (2, 8, 16)
//   cap_16              copy steam_x16: dynamo hatches that carry 34 runs give 16 (the cap)
//   two_hatches         copy combustion_x4: two LV dynamo hatches give 4 runs
//   modes               the combustion and gas copies ran their own mode's recipe after switching the machine mode
//   dynamo_too_small    copy too_small: an ULV dynamo hatch (16 EU/t) refuses 32 EU/t fuel and nothing is used
//   no_regress          copy no_regress: with its dynamo hatch full the run waits at the same progress; once the hatch is emptied the
//                       fuel gives exactly its EU, not more (a regressed run would pay the same ticks twice)
//   display             the controller shows the dynamo capacity line and, while running, the output line
//   power_generators|DONE   last line
//
// Copies (controllers face north, the structure is behind them; parts are placed in the front row of the floor, facing north):
//   row 1, controllers at z 2: steam_x2 (x 6149), steam_x8 (6161), steam_x16 (6173), combustion_x4 (6185), gas_x8 (6197)
//   row 2, controllers at z 9: too_small (6149), no_regress (6161)
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 6144-6207, Y 98-112, Z 0-15 (AGENTS.md:
// tests run at the same time in one server). The structures come from the description lib/patterns.js records
// (global.grindless.structures). Every dynamo hatch except the one of steam_x2 (it feeds a battery buffer) and, for a while, the one
// of no_regress is emptied by the test every tick and counted: that is the EU the array made.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'power_generators'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var RUN_TICKS = 320
  var WAIT_TICKS = 40
  var BAND = { x0: 6144, x1: 6207, y0: 98, y1: 112, z0: 0, z1: 15 }

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestPowerGeneratorsRequest'

  var MACHINE_ID = 'gtceu:generator_array'
  var TYPES = ['gtceu:steam_turbine', 'gtceu:combustion_generator', 'gtceu:gas_turbine']
  var CONTROLLER_RECIPE = 'grindless:crafting/generator_array'
  var FUELS = {
    steam: { recipe: 'gtceu:steam_turbine/steam', fluid: 'gtceu:steam', mode: 0, water: 4 },
    diesel: { recipe: 'gtceu:combustion_generator/diesel', fluid: 'gtceu:diesel', mode: 1, water: 0 },
    methane: { recipe: 'gtceu:gas_turbine/methane', fluid: 'gtceu:methane', mode: 2, water: 0 }
  }
  var INPUT_HATCH = 'gtceu:hv_input_hatch'
  var OUTPUT_HATCH = 'gtceu:lv_output_hatch'
  var DYNAMO = {
    ulv: 'gtceu:ulv_energy_output_hatch',
    lv: 'gtceu:lv_energy_output_hatch',
    mv: 'gtceu:mv_energy_output_hatch',
    hv: 'gtceu:hv_energy_output_hatch'
  }
  var BUFFER = 'gtceu:lv_battery_buffer_4x'
  var BATTERY = 'gtceu:lv_sodium_battery'
  var WATER = 'gtceu:distilled_water'
  var Y = 100
  var INPUT_COL = 0
  var OUTPUT_COL = 8

  // dynamos: front floor column (0-8, column 4 is under the controller) -> tier. GTM 7.5.3's dynamo hatches are 2 A: ULV 16 EU/t,
  // LV 64 (2 runs of 32 EU/t), MV 256 (8), HV 1024 (32). sink: buffer (a real battery buffer in front of the hatch), drain (the test
  // empties the hatches every tick), backlog (no_regress: let the hatch fill, wait, then drain)
  var COPIES = [
    { key: 'steam_x2', x: 6149, z: 2, fuel: 'steam', runs: 3, parallels: 2, dynamos: { 4: 'lv' }, output: true, sink: 'buffer' },
    { key: 'steam_x8', x: 6161, z: 2, fuel: 'steam', runs: 3, parallels: 8, dynamos: { 2: 'lv', 3: 'lv', 5: 'lv', 6: 'lv' }, output: true, sink: 'drain' },
    { key: 'steam_x16', x: 6173, z: 2, fuel: 'steam', runs: 2, parallels: 16, dynamos: { 3: 'hv', 5: 'lv' }, output: true, sink: 'drain' },
    { key: 'combustion_x4', x: 6185, z: 2, fuel: 'diesel', runs: 3, parallels: 4, dynamos: { 3: 'lv', 5: 'lv' }, output: false, sink: 'drain' },
    { key: 'gas_x8', x: 6197, z: 2, fuel: 'methane', runs: 2, parallels: 8, dynamos: { 4: 'mv' }, output: false, sink: 'drain' },
    { key: 'too_small', x: 6149, z: 9, fuel: 'steam', runs: 1, parallels: 0, dynamos: { 4: 'ulv' }, output: true, sink: 'drain' },
    // 5 runs x 2 x 640 EU = 6 400 EU, more than the 4 096 an LV dynamo hatch holds (32 V x 64 x 2 A): it fills and the run waits
    { key: 'no_regress', x: 6161, z: 9, fuel: 'steam', runs: 5, parallels: 2, dynamos: { 4: 'lv' }, output: true, sink: 'backlog' }
  ]

  var S = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
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

  // ---------------------------------------------------------------- helpers

  function lazy() {
    if (classes === null) {
      classes = {
        ArrayList: Java.loadClass('java.util.ArrayList'),
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
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

  function machineAt(x, y, z) {
    return lazy().MetaMachine.getMachine(S.level, new BlockPos(x, y, z))
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : Number(st.getAmount()) }
  }

  // EU/t a recipe makes, signed: > 0 output, < 0 input, 0 none
  function signedEUt(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    if (io.isEmpty()) return 0
    return io.isInput() ? -Number(io.getTotalEU()) : Number(io.getTotalEU())
  }

  // the live numbers of a fuel recipe: duration, EU/t, fluid amount per run
  function fuelRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    if (!found.isPresent()) return null
    var r = found.get()
    var amount = 0
    asArray(r.getInputContents(lazy().FluidCap)).forEach(function (c) {
      var j = null
      try { j = JSON.parse(String(c.content.toJson())) } catch (e) { j = null }
      if (j && j.amount !== undefined && amount === 0) amount = Number(j.amount)
    })
    return { id: id, duration: Number(r.duration), eut: signedEUt(r), amount: amount }
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    safely('registration', function () {
      var def = GTRegistries.MACHINES.get(rl(MACHINE_ID))
      if (def === null || def === undefined) throw new Error(MACHINE_ID + ' is not registered')
      var types = []
      var arr = def.getRecipeTypes()
      for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
      var problems = []
      if (def.isGenerator() !== true) problems.push('isGenerator=' + def.isGenerator())
      if (def.isRegressWhenWaiting() !== false) problems.push('regressWhenWaiting=' + def.isRegressWhenWaiting())
      if (types.join(',') !== TYPES.join(',')) problems.push('types=' + types.join(','))
      var desc = global.grindless.patterns.describe(MACHINE_ID)
      if (!desc) problems.push('no structure description')
      check('registration', problems.length === 0, 'generator=' + def.isGenerator() + ' regressWhenWaiting=' + def.isRegressWhenWaiting() +
        ' types=[' + types.join(', ') + ']' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('helper', function () {
      var Gen = global.grindless.generators
      var names = ['configure', 'modifier', 'display', 'dynamoCapacity', 'recipeEUt']
      var missing = names.filter(function (n) { return !Gen || typeof Gen[n] !== 'function' })
      check('helper', missing.length === 0, 'global.grindless.generators ' + (Gen ? 'GTM ' + Gen.GTM_VERSION : 'missing') +
        (missing.length > 0 ? ' | missing: ' + missing.join(',') : ', all five functions published'))
    })

    safely('fuels', function () {
      var rm = S.server.getRecipeManager()
      var counts = []
      var bad = []
      TYPES.forEach(function (typeId) {
        var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
        if (!type) {
          bad.push(typeId + ' missing')
          return
        }
        var list = asArray(rm.getAllRecipesFor(type))
        counts.push(typeId.replace('gtceu:', '') + ' ' + list.length)
        list.forEach(function (r) {
          var eu = signedEUt(r)
          if (eu !== 32) bad.push(String(r.getId()) + ' ' + eu + ' EU/t')
        })
      })
      check('fuels', bad.length === 0 && counts.length === TYPES.length, 'recipes: ' + counts.join(', ') +
        (bad.length > 0 ? ' | not 32 EU/t out: ' + bad.slice(0, 8).join('; ') : ', all make 32 EU/t and use no EU'))
    })

    safely('controller_recipe', function () {
      var found = S.server.getRecipeManager().byKey(rl(CONTROLLER_RECIPE))
      if (!found.isPresent()) throw new Error(CONTROLLER_RECIPE + ' missing')
      var r = found.get()
      var out = String(r.getResultItem(S.server.registryAccess()).getId())
      var ids = {}
      asArray(r.getIngredients()).forEach(function (ing) {
        asArray(ing.getItemIds()).forEach(function (id) { ids[String(id)] = true })
      })
      var want = ['gtceu:lv_steam_turbine', 'gtceu:lv_combustion', 'gtceu:lv_gas_turbine', 'gtceu:lv_machine_hull']
      var missing = want.filter(function (id) { return !ids[id] })
      check('controller_recipe', out === MACHINE_ID && missing.length === 0, 'makes ' + out + (missing.length > 0 ? ' | missing ' + missing.join(',') : ', holds one of each LV generator and an LV hull'))
    })
  }

  // ---------------------------------------------------------------- structure

  function plainBlock(sym) {
    if (sym.kind === 'blocks') return sym.blocks[0]
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) {
        if (sym.options[i].kind === 'blocks') return sym.options[i].blocks[0]
      }
    }
    throw new Error('no plain block for symbol kind ' + sym.kind)
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(copy) {
    var desc = global.grindless.patterns.describe(MACHINE_ID)
    if (!desc) throw new Error('no structure description recorded for ' + MACHINE_ID)
    var last = desc.slices.length - 1
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          if (desc.symbols[row.charAt(ci)] && desc.symbols[row.charAt(ci)].kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          var c = { x: copy.x - (ci - ctrl.ci), y: Y + (ri - ctrl.ri), z: copy.z - (si - ctrl.si), ch: ch, id: null, props: '', role: null }
          if (sym.kind === 'controller') {
            c.id = MACHINE_ID
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (si === last && ri === 0 && copy.dynamos[ci] !== undefined) {
            c.id = DYNAMO[copy.dynamos[ci]]
            c.props = '[facing=north]'
            c.role = 'dynamo'
          } else if (si === last && ri === 0 && ci === INPUT_COL) {
            c.id = INPUT_HATCH
            c.props = '[facing=north]'
            c.role = 'input'
          } else if (si === last && ri === 0 && ci === OUTPUT_COL && copy.output) {
            c.id = OUTPUT_HATCH
            c.props = '[facing=north]'
            c.role = 'output'
          } else {
            c.id = plainBlock(sym)
          }
          cells.push(c)
        }
      })
    })
    return { cells: cells, width: desc.slices[0][0].length, height: desc.slices[0].length, depth: desc.slices.length }
  }

  function setBlock(x, y, z, id, props) {
    return S.server.runCommandSilent('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + (props || '') + ' replace')
  }

  // everything but the controller first, the controller last; then the sink in front of the dynamo of the buffer copy
  function place(m) {
    var plan = planOf(m.copy)
    m.plan = plan
    var failed = []
    var ctrlCell = null
    var tally = {}
    plan.cells.forEach(function (c) {
      tally[c.id] = (tally[c.id] || 0) + 1
      if (c.role === 'controller') {
        ctrlCell = c
        return
      }
      if (setBlock(c.x, c.y, c.z, c.id, c.props) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.id)
    })
    if (setBlock(ctrlCell.x, ctrlCell.y, ctrlCell.z, ctrlCell.id, ctrlCell.props) < 1) failed.push('controller')
    m.ctrlPos = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    if (m.copy.sink === 'buffer') {
      var dyn = plan.cells.filter(function (c) { return c.role === 'dynamo' })[0]
      m.bufferPos = { x: dyn.x, y: dyn.y, z: dyn.z - 1 }
      if (setBlock(m.bufferPos.x, m.bufferPos.y, m.bufferPos.z, BUFFER, '[facing=north]') < 1) failed.push('battery buffer')
    }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return id.replace('gtceu:', '') + ' x' + tally[id] }).join(', ')
    check(m.copy.key + '_PLACED', failed.length === 0 && wrong.length === 0, plan.cells.length + ' blocks, ' + plan.width + 'x' + plan.height + 'x' +
      plan.depth + ' (w x h x d), controller ' + m.ctrlPos.x + ',' + m.ctrlPos.y + ',' + m.ctrlPos.z + ' bill=[' + bill + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function findParts(ctrl) {
    var P = { dynamos: [], inputs: [], outputs: [], ids: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      P.ids.push(pid.replace('gtceu:', ''))
      if (/_energy_output_hatch/.test(pid)) P.dynamos.push(p)
      else if (pid === INPUT_HATCH) P.inputs.push(p)
      else if (pid === OUTPUT_HATCH) P.outputs.push(p)
    })
    return P
  }

  function dynamoStored(m) {
    var total = 0
    m.parts.dynamos.forEach(function (d) { total += Number(d.energyContainer.getEnergyStored()) })
    return total
  }

  function drain(m) {
    m.parts.dynamos.forEach(function (d) {
      var c = d.energyContainer
      var e = Number(c.getEnergyStored())
      if (e > 0) {
        m.eu += e
        c.setEnergyStored(0)
      }
    })
  }

  function batteryCharge(m) {
    var bb = machineAt(m.bufferPos.x, m.bufferPos.y, m.bufferPos.z)
    return bb ? Number(bb.energyContainer.getEnergyStored()) : -1
  }

  // ---------------------------------------------------------------- run

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  // a roof row over the cells in front of each row of controllers: a dynamo hatch whose neighbour is rained on may explode (GTM's
  // weather check), and the floor hatches face that way
  function roofRows() {
    var rows = {}
    COPIES.forEach(function (copy) { rows[copy.z - 1] = true })
    Object.keys(rows).forEach(function (z) {
      S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + Y + ' ' + z + ' ' + BAND.x1 + ' ' + Y + ' ' + z + ' minecraft:smooth_stone')
    })
  }

  function startCopies() {
    S.copies = []
    roofRows()
    COPIES.forEach(function (copy) {
      var m = { copy: copy, phase: 'forming', ok: true, parts: null, eu: 0, seen: {}, maxPar: 0, maxEut: 0, workTicks: 0, statuses: {},
        waitSeen: false, waitTick: 0, waitProgress: -1, waitMin: 1e9, waitMax: -1, waitStatusOk: true, draining: copy.sink !== 'backlog', storedAtWait: 0 }
      S.copies.push(m)
      try {
        if (!place(m)) m.phase = 'done'
      } catch (e) {
        check(copy.key + '_PLACED', false, 'exception: ' + e)
        m.phase = 'done'
      }
    })
    S.phase = 'forming'
    S.t0 = S.t
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var pos = err.getPos()
      return 'pattern error ' + String(err) + ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' found ' + blockIdAt(pos.getX(), pos.getY(), pos.getZ())
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  // once every copy is formed: parts, machine mode, fuel, batteries
  function startRunning() {
    S.fuels = {}
    Object.keys(FUELS).forEach(function (k) { S.fuels[k] = fuelRecipe(FUELS[k].recipe) })
    note('FUEL_RECIPES', Object.keys(S.fuels).map(function (k) {
      var f = S.fuels[k]
      return f === null ? k + ' missing' : f.id + ' ' + f.amount + ' mB -> ' + f.eut + ' EU/t x ' + f.duration + ' t'
    }).join(' ; '))
    S.copies.forEach(function (m) {
      if (m.phase !== 'formed') return
      safely(m.copy.key + '_PARTS', function () {
        var ctrl = machineAt(m.ctrlPos.x, m.ctrlPos.y, m.ctrlPos.z)
        var P = findParts(ctrl)
        m.parts = P
        var wantDynamos = Object.keys(m.copy.dynamos).length
        var problems = []
        if (P.dynamos.length !== wantDynamos) problems.push('dynamo hatches ' + P.dynamos.length + ' (wanted ' + wantDynamos + ')')
        if (P.inputs.length !== 1) problems.push('input hatches ' + P.inputs.length)
        if (P.outputs.length !== (m.copy.output ? 1 : 0)) problems.push('output hatches ' + P.outputs.length)
        var fuel = FUELS[m.copy.fuel]
        var rec = S.fuels[m.copy.fuel]
        if (rec === null) problems.push('fuel recipe ' + fuel.recipe + ' missing')
        if (problems.length === 0) {
          ctrl.setActiveRecipeType(fuel.mode)
          var amount = m.copy.runs * Math.max(1, m.copy.parallels) * rec.amount
          m.fuelIn = amount
          P.inputs[0].tank.setFluidInTank(0, Fluid.of(fuel.fluid, amount).getFluidStack())
          if (m.copy.sink === 'buffer') {
            var bb = machineAt(m.bufferPos.x, m.bufferPos.y, m.bufferPos.z)
            var inv = bb.getBatteryInventory()
            for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of(BATTERY))
            m.batteryStart = batteryCharge(m)
          }
          ctrl.getRecipeLogic().updateTickSubscription()
          m.phase = 'running'
        } else {
          m.phase = 'done'
        }
        check(m.copy.key + '_PARTS', problems.length === 0, '[' + P.ids.join(' ') + '] mode=' + String(ctrl.getRecipeType()) +
          ' dynamo capacity=' + global.grindless.generators.dynamoCapacity(ctrl) + ' EU/t' +
          (m.fuelIn ? ' fuel=' + m.fuelIn + ' mB ' + fuel.fluid : '') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      })
    })
    S.phase = 'running'
    S.runStart = S.t
  }

  // every tick while running: what each controller is doing, and the EU its dynamo hatches received
  function measure(m) {
    var ctrl = machineAt(m.ctrlPos.x, m.ctrlPos.y, m.ctrlPos.z)
    var rlg = ctrl.getRecipeLogic()
    var status = String(rlg.getStatus())
    m.statuses[status] = (m.statuses[status] || 0) + 1
    var last = rlg.getLastRecipe()
    if (status === 'WORKING') {
      m.workTicks++
      if (last !== null && last !== undefined) {
        m.seen[String(last.id)] = true
        if (last.parallels > m.maxPar) m.maxPar = last.parallels
        var eut = global.grindless.generators.recipeEUt(last)
        if (eut > m.maxEut) m.maxEut = eut
      }
    }
    if (m.copy.sink === 'backlog' && !m.draining) {
      if (!m.waitSeen) {
        if (status === 'WAITING') {
          m.waitSeen = true
          m.waitTick = S.tickNow
          m.waitProgress = Number(rlg.getProgress())
          m.storedAtWait = dynamoStored(m)
        }
      } else {
        var p = Number(rlg.getProgress())
        if (p < m.waitMin) m.waitMin = p
        if (p > m.waitMax) m.waitMax = p
        if (status !== 'WAITING') m.waitStatusOk = false
        if (S.tickNow - m.waitTick >= WAIT_TICKS) m.draining = true
      }
    }
    if (m.draining && m.copy.sink !== 'buffer') drain(m)
  }

  function displayCheck() {
    safely('display', function () {
      var m = S.copies.filter(function (c) { return c.copy.key === 'steam_x8' })[0]
      if (!m || m.phase !== 'running') throw new Error('steam_x8 is not running')
      var ctrl = machineAt(m.ctrlPos.x, m.ctrlPos.y, m.ctrlPos.z)
      var list = new (lazy().ArrayList)()
      ctrl.addDisplayText(list)
      var lines = asArray(list).map(function (c) { return String(c.getString()) })
      var capacity = lines.some(function (l) { return /grindless\.generators\.capacity|Dynamo hatches carry/.test(l) })
      var output = lines.some(function (l) { return /grindless\.generators\.output|Producing/.test(l) })
      check('display', capacity && output, 'capacity line=' + capacity + ' output line=' + output + ' status=' +
        String(ctrl.getRecipeLogic().getStatus()) + ' (' + lines.length + ' lines)')
    })
  }

  function expected(m) {
    var rec = S.fuels[m.copy.fuel]
    var runs = m.copy.runs
    var par = m.copy.parallels
    return {
      eu: runs * par * rec.eut * rec.duration,
      fuelUsed: runs * par * rec.amount,
      eut: par * rec.eut,
      water: runs * par * FUELS[m.copy.fuel].water,
      euPerMb: rec.eut * rec.duration / rec.amount
    }
  }

  function verify(m) {
    var ctrl = machineAt(m.ctrlPos.x, m.ctrlPos.y, m.ctrlPos.z)
    var rlg = ctrl.getRecipeLogic()
    var residual = dynamoStored(m)
    var fuelLeft = tankInfo(m.parts.inputs[0]).amount
    var water = m.parts.outputs.length > 0 ? tankInfo(m.parts.outputs[0]).amount : 0
    var fuelUsed = m.fuelIn - fuelLeft
    var key = m.copy.key
    var want = expected(m)
    var made = m.copy.sink === 'buffer' ? batteryCharge(m) - m.batteryStart + residual : m.eu + residual
    var state = 'status=' + String(rlg.getStatus()) + ' statuses=' + JSON.stringify(m.statuses) + ' seen=[' + Object.keys(m.seen).join(',') + ']'

    if (key === 'too_small') {
      var reasons = []
      try { reasons = asArray(rlg.getFailureReasons()).map(function (c) { return String(c.getString()) }) } catch (e0) { reasons = ['unreadable: ' + e0] }
      check('dynamo_too_small', fuelUsed === 0 && Object.keys(m.seen).length === 0 && made === 0,
        'ULV dynamo hatch (' + global.grindless.generators.dynamoCapacity(ctrl) + ' EU/t) with 32 EU/t steam: fuel used ' + fuelUsed +
        ' mB, EU made ' + made + ', runs seen ' + Object.keys(m.seen).length + ' ' + state + ' failureReasons=[' + reasons.join(' ; ') + ']')
      return
    }

    var problems = []
    if (made !== want.eu) problems.push('EU made ' + made + ' (wanted ' + want.eu + ')')
    if (fuelUsed !== want.fuelUsed) problems.push('fuel used ' + fuelUsed + ' mB (wanted ' + want.fuelUsed + ')')
    if (m.maxPar !== m.copy.parallels) problems.push('parallels ' + m.maxPar + ' (wanted ' + m.copy.parallels + ')')
    if (m.maxEut !== want.eut) problems.push('EU/t ' + m.maxEut + ' (wanted ' + want.eut + ')')
    if (water !== want.water) problems.push('distilled water ' + water + ' mB (wanted ' + want.water + ')')
    var recipeId = FUELS[m.copy.fuel].recipe
    var others = Object.keys(m.seen).filter(function (id) { return id !== recipeId })
    if (m.seen[recipeId] !== true) problems.push('recipe ' + recipeId + ' never ran')
    if (others.length > 0) problems.push('other recipes ' + others.join(','))
    var perMb = fuelUsed > 0 ? made / fuelUsed : 0
    if (Math.abs(perMb - want.euPerMb) > 1e-9) problems.push('EU per mB ' + perMb + ' (single block ' + want.euPerMb + ')')
    m.result = { made: made, fuelUsed: fuelUsed, perRun: fuelUsed / m.copy.runs, eut: m.maxEut, par: m.maxPar }
    check('PROCESS_' + key, problems.length === 0, m.copy.runs + ' runs x ' + m.maxPar + ' parallels of ' + recipeId + ': ' + m.maxEut + ' EU/t, ' +
      made + ' EU from ' + fuelUsed + ' mB (' + perMb + ' EU/mB, single block ' + want.euPerMb + '), water ' + water + ' mB, residual in hatches ' +
      residual + ' | ' + state + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))

    if (key === 'steam_x2') {
      var charge = batteryCharge(m) - m.batteryStart
      check('spike_eu_to_buffer', charge > 0 && made === want.eu, 'a KubeJS multiblock made EU: ' + charge + ' EU charged into 4 batteries of an LV battery buffer ' +
        'through an LV dynamo hatch, ' + residual + ' still in the hatch, total ' + made + ' (the fuel is worth ' + want.eu + ')')
      var ocv1 = -1
      try { ocv1 = Number(ctrl.getOverclockVoltage()) } catch (e2) { ocv1 = -1 }
      check('amps_counted', m.maxPar === 2, 'one LV dynamo hatch (32 V x 2 A = ' + global.grindless.generators.dynamoCapacity(ctrl) + ' EU/t) ran ' + m.maxPar +
        ' runs of 32 EU/t; GTM\'s own limit (getOverclockVoltage) reads ' + ocv1 + ' V, which would allow ' + Math.floor(ocv1 / 32))
    }
    if (key === 'steam_x16') {
      var cap = global.grindless.generators.dynamoCapacity(ctrl)
      check('cap_16', m.maxPar === 16 && Math.floor(cap / 32) > 16, 'dynamo hatches carry ' + cap + ' EU/t = ' + Math.floor(cap / 32) +
        ' runs of 32 EU/t, the array ran ' + m.maxPar + ' (cap 16)')
    }
    if (key === 'combustion_x4') {
      check('two_hatches', m.maxPar === 4, 'two LV dynamo hatches: ' + m.maxPar + ' runs (lib/generators.js sums V x A = ' +
        global.grindless.generators.dynamoCapacity(ctrl) + ' EU/t)')
    }
    if (key === 'no_regress') {
      check('no_regress', m.waitSeen && m.waitStatusOk && m.waitMin === m.waitProgress && m.waitMax === m.waitProgress && made === want.eu,
        'the hatch filled (' + m.storedAtWait + ' EU stored) and the run waited ' + WAIT_TICKS + ' ticks at progress ' + m.waitProgress +
        ' (seen ' + m.waitMin + '-' + m.waitMax + ', always WAITING: ' + m.waitStatusOk + '); then emptied, the fuel gave ' + made + ' EU (worth ' + want.eu + ')')
    }
  }

  function finishChecks() {
    S.copies.forEach(function (m) {
      if (m.phase !== 'running') return
      safely('PROCESS_' + m.copy.key, function () { verify(m) })
    })
    safely('scaling', function () {
      function res(key) {
        var m = S.copies.filter(function (c) { return c.copy.key === key })[0]
        return m && m.result ? m.result : null
      }
      var a = res('steam_x2')
      var b = res('steam_x8')
      var c = res('steam_x16')
      if (!a || !b || !c) throw new Error('a steam copy has no result')
      var ok = b.eut === 4 * a.eut && c.eut === 8 * a.eut && b.perRun === 4 * a.perRun && c.perRun === 8 * a.perRun
      check('scaling', ok, 'steam: EU/t ' + a.eut + ' / ' + b.eut + ' / ' + c.eut + ' and steam per run ' + a.perRun + ' / ' + b.perRun + ' / ' + c.perRun +
        ' mB at 2 / 8 / 16 parallels')
    })
    safely('modes', function () {
      var bad = []
      var lines = []
      S.copies.forEach(function (m) {
        if (m.copy.fuel === 'steam') return
        var ctrl = machineAt(m.ctrlPos.x, m.ctrlPos.y, m.ctrlPos.z)
        var type = String(ctrl.getRecipeType())
        var wantType = TYPES[FUELS[m.copy.fuel].mode]
        var seen = Object.keys(m.seen)
        lines.push(m.copy.key + ': mode ' + type + ', ran [' + seen.join(',') + ']')
        if (type !== wantType) bad.push(m.copy.key + ' mode ' + type)
        if (seen.length !== 1 || seen[0] !== FUELS[m.copy.fuel].recipe) bad.push(m.copy.key + ' ran ' + seen.join(','))
      })
      check('modes', bad.length === 0, lines.join(' ; ') + (bad.length > 0 ? ' | problems: ' + bad.join('; ') : ''))
    })
  }

  function step() {
    if (S.phase === 'forming') {
      var waited = S.t - S.t0
      var pending = 0
      S.copies.forEach(function (m) {
        if (m.phase !== 'forming') return
        var ctrl = machineAt(m.ctrlPos.x, m.ctrlPos.y, m.ctrlPos.z)
        if (ctrl === null || ctrl === undefined) {
          check(m.copy.key + '_FORMED', false, 'no machine at the controller position')
          m.phase = 'done'
          return
        }
        if (ctrl.isFormed()) {
          check(m.copy.key + '_FORMED', true, (m.forced ? 'after a forced check' : 'by itself after ' + waited + ' ticks') + ', class=' +
            String(ctrl.getClass().getSimpleName()) + ' parts=' + asArray(ctrl.getParts()).length)
          m.phase = 'formed'
          return
        }
        if (waited >= FORM_TIMEOUT) {
          if (!ctrl.checkPatternWithLock()) {
            check(m.copy.key + '_FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
            m.phase = 'done'
            return
          }
          check(m.copy.key + '_FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
          ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
          ctrl.onStructureFormed()
          m.forced = true
        }
        pending++
      })
      if (pending === 0) startRunning()
      return
    }
    if (S.phase === 'running') {
      if (S.t - S.runStart === 30) displayCheck()
      if (S.t - S.runStart >= RUN_TICKS) {
        finishChecks()
        S.phase = 'done'
      }
    }
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.tickNow = server.getTickCount()
    S.t = S.tickNow - S.tick0
    try {
      if (S.phase === 'running') {
        S.copies.forEach(function (m) {
          if (m.phase !== 'running') return
          try {
            measure(m)
          } catch (e) {
            check(m.copy.key + '_MEASURE', false, 'exception: ' + e)
            m.phase = 'done'
          }
        })
      }
      if (S.t % STEP === 0 || (S.phase === 'running' && S.t - S.runStart === 30)) step()
    } catch (e2) {
      check('STEP', false, 'exception in ' + S.phase + ': ' + e2)
      S.phase = 'done'
    }
    if (S.phase === 'done') finish()
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

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, tickNow: now, phase: 'start', copies: [], finished: false }
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
    startCopies()
    if (S.copies.every(function (m) { return m.phase === 'done' })) {
      S.phase = 'done'
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_power_generators', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_power_generators run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
