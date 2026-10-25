// Gregtech Grindless - smoke test of package IV-A2, fission-reactor (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): IV's Fission Reactor (gtceu:fission_reactor, generator type gtceu:fission_core), startup_scripts/grindless/iv/
// fission_reactor.js, server_scripts/grindless/iv/fission_reactor.js and data/grindless/tables/fission_cores.json.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_fission_reactor;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|fission_reactor\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|fission_reactor|<check>|PASS|FAIL|NOTE|<detail>
//   shared_ids          IV-A1's assemblies, spent assemblies, heavy water and tritiated heavy water exist (the cores need them)
//   registration        a generator that does not regress while waiting, on gtceu:fission_core, with a structure description
//   core_table          fission_cores.json loaded: 4 cores, circuits 1-4, 16 384 / 32 768 / 32 768 / 8 192 EU/t a channel, 4 channels,
//                       400-tick cycles, wear and spent chance 50 of 10 000, 2 000 mB of water a channel
//   core_recipes        one live recipe per core with exactly the table's contents: circuit, chanced assembly, water (+ heavy water),
//                       chanced spent assembly (+ tritiated heavy water), EU/t and the recipe data key
//   not_doubled         every core recipe lasts the table's 400 ticks: power/generators.js did not double gtceu:fission_core
//   controller_recipe   the controller recipe exists and holds its parts
//   <copy>_PLACED / _FORMED / _PARTS   for the three copies below
//   dynamo_16a          a 16 A IV dynamo hatch carries 131 072 EU/t (lib/generators.js reads V x A per hatch)
//   light_eu_to_buffer  copy light: one LEU light-water channel-cycle (circuit 1) sends its EU through the 16 A IV dynamo hatch into a real
//                       IV battery buffer: battery + what is still in the hatch = exactly 16 384 EU/t x 400 ticks
//   PROCESS_light       the cycle ran on grindless:fission_core/leu_light_water, 1 channel, 2 000 mB of water
//   scram_no_water      copy light: once its water is gone it stays shut down, makes no more EU, and shows the SCRAM line
//   PROCESS_heavy       copy heavy: 4 LEU assemblies, circuit 2: 4 channels (131 072 EU/t) for one cycle, 8 000 mB water and 20 mB heavy
//                       water in, 20 mB tritiated heavy water out, exactly 4 x 32 768 x 400 EU; no SCRAM line while it runs
//   scram_heavy         copy heavy: with no water left it shuts down with its assemblies loaded and shows the SCRAM line
//   scram_spent_room    copy room: output bus full -> no cycle starts (no water used, no EU), the SCRAM line shows
//   no_voiding_items    the same with the controller set to void items: refused, and the refusal is shown
//   scram_tritium_room  bus emptied, tritiated heavy water hatch full -> no cycle starts
//   no_voiding_fluids   the same with the controller set to void fluids: refused, and the refusal is shown
//   resumes             hatch emptied, voiding off: one heavy-water cycle on 1 channel, 32 768 x 400 EU, 5 mB in and out
//   balance             NOTE: EU per assembly of every core, from the live recipes
//   fission_reactor|DONE  last line
//
// Copies (controllers face north at z 2, the structures are behind them, z 2-9; parts on the turbine hall floor):
//   light (x 9988), heavy (x 9998), room (x 10008): input bus, water hatch, 16 A IV dynamo, output bus, tritium hatch along the front
//   row of the floor (left to right as seen from the front), the heavy water hatch at the left end of the floor's middle row.
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 9984-10047, Y 98-112, Z 0-15 (AGENTS.md:
// tests run at the same time in one server), with a roof at Y 111 so no hatch is rained on. The structures come from the description
// lib/patterns.js records (global.grindless.structures).
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'fission_reactor'
  var BAND = { x0: 9984, x1: 10047, y0: 98, y1: 112, z0: 0, z1: 15 }
  var ROOF_Y = 111
  var Y = 100
  var STEP = 10
  var FORM_TIMEOUT = 600
  var HOLD_TICKS = 60
  var CYCLE_SLACK = 120

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestFissionReactorRequest'

  var MACHINE = 'gtceu:fission_reactor'
  var TYPE = 'gtceu:fission_core'
  var ROLE_BLOCKS = {
    inBus: 'gtceu:iv_input_bus',
    outBus: 'gtceu:iv_output_bus',
    water: 'gtceu:iv_input_hatch',
    moderator: 'gtceu:iv_input_hatch',
    tritium: 'gtceu:iv_output_hatch',
    dynamo: 'gtceu:iv_energy_output_hatch_16a'
  }
  var BUFFER = 'gtceu:iv_battery_buffer_4x'
  var BATTERY = 'gtceu:iv_vanadium_battery'
  var WATER = 'minecraft:water'
  var HEAVY = 'gtceu:heavy_water'
  var TRITIATED = 'gtceu:tritiated_heavy_water'
  var LEU = 'grindless:leu_fuel_assembly'
  var SPENT = 'grindless:spent_fuel_assembly'
  var FILLER = 'minecraft:cobblestone'
  var SHARED_ITEMS = ['grindless:leu_fuel_assembly', 'grindless:mox_fuel_assembly', 'grindless:breeder_fuel_assembly',
    'grindless:spent_fuel_assembly', 'grindless:spent_breeder_assembly']
  var SHARED_FLUIDS = [HEAVY, TRITIATED]
  var NO_VOIDING = /grindless\.machine\.fission_reactor\.no_voiding|Turn voiding off/
  var SCRAM_LINE = /grindless\.machine\.fission_reactor\.scram|SCRAM/

  // the design (docs/eras/iv.md): what the table and the live recipes must say
  var WANT_CORES = {
    leu_light_water: { circuit: 1, fuel: LEU, eut: 16384, moderator: false, spent: SPENT },
    leu_heavy_water: { circuit: 2, fuel: LEU, eut: 32768, moderator: true, spent: SPENT },
    mox_heavy_water: { circuit: 3, fuel: 'grindless:mox_fuel_assembly', eut: 32768, moderator: true, spent: SPENT },
    breeder: { circuit: 4, fuel: 'grindless:breeder_fuel_assembly', eut: 8192, moderator: false, spent: 'grindless:spent_breeder_assembly' }
  }
  var CYCLE = 400
  var WATER_PER_CHANNEL = 2000
  var MODERATOR_PER_CHANNEL = 5
  var CHANCE = 50

  // parts: 'slice,row,column' of the description (slice 7 = the front face, 6 = the generator's slice) -> role
  var PARTS = { '7,0,0': 'inBus', '7,0,1': 'water', '7,0,2': 'dynamo', '7,0,3': 'outBus', '7,0,4': 'tritium', '6,0,0': 'moderator' }
  var COPIES = [
    { key: 'light', x: 9988, z: 2, sink: 'buffer' },
    { key: 'heavy', x: 9998, z: 2, sink: 'drain' },
    { key: 'room', x: 10008, z: 2, sink: 'drain' }
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
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
      }
    }
    return classes
  }

  function FR() {
    return global.grindless.fissionReactor || {}
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

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
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

  function itemName(stack) {
    try {
      return String(lazy().Registries.ITEMS.getKey(stack.getItem()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : Number(st.getAmount()) }
  }

  function setTank(hatch, id, amount) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    if (amount <= 0) hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    else hatch.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }

  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemName(st)
      counts[id] = (counts[id] || 0) + Number(st.getCount())
    }
    return counts
  }

  function fillBus(bus, id) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of(id, 64))
    return inv.getSlots()
  }

  function emptyBus(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }

  function summary(counts) {
    var keys = Object.keys(counts)
    return keys.length === 0 ? 'empty' : keys.map(function (k) { return k.replace(/^(gtceu|grindless|minecraft):/, '') + ' x' + counts[k] }).join(', ')
  }

  function signedEUt(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    if (io.isEmpty()) return 0
    return io.isInput() ? -Number(io.getTotalEU()) : Number(io.getTotalEU())
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  // the item contents of one side of a recipe, with their chance: [{ id, count, chance, maxChance, circuit }]
  function itemContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.ItemCap) : recipe.getOutputContents(c.ItemCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputItems(recipe) : c.RecipeHelper.getOutputItems(recipe))
    return stacks.map(function (st, i) {
      var circuit = c.Circuit.isIntegratedCircuit(st) ? Number(c.Circuit.getCircuitConfiguration(st)) : 0
      return { id: itemName(st), count: Number(st.getCount()), chance: Number(contents[i].chance), maxChance: Number(contents[i].maxChance), circuit: circuit }
    })
  }

  function fluidContents(recipe, input) {
    var c = lazy()
    return asArray(input ? c.RecipeHelper.getInputFluids(recipe) : c.RecipeHelper.getOutputFluids(recipe)).map(function (st) {
      return { id: fluidName(st), amount: Number(st.getAmount()) }
    })
  }

  function failureReasons(ctrl) {
    try {
      return asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }

  // the controller lines the reactor adds (lib/generators.js's lines and the SCRAM line), as strings
  function displayLines(ctrl) {
    var list = new (lazy().ArrayList)()
    FR().display(ctrl, list)
    return asArray(list).map(function (c) {
      try {
        return String(c.getString())
      } catch (e) {
        return String(c)
      }
    })
  }

  function showsScram(ctrl) {
    return displayLines(ctrl).some(function (l) { return SCRAM_LINE.test(l) })
  }

  function wake(ctrl) {
    try {
      ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the scenario reports what did not run */ }
  }

  function statusOf(ctrl) {
    return String(ctrl.getRecipeLogic().getStatus())
  }

  function state(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' last=' + (last ? last.id + ' x' + last.parallels : 'none') + ' voiding=' + ctrl.getVoidingMode()
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  // ---------------------------------------------------------------- static checks

  function sharedIdsPresent() {
    var missing = SHARED_ITEMS.filter(function (id) { return !Item.exists(id) })
      .concat(SHARED_FLUIDS.filter(function (id) { return !Fluid.exists(id) }))
    check('shared_ids', missing.length === 0, missing.length === 0 ? 'IV-A1\'s ' + SHARED_ITEMS.length + ' items and ' + SHARED_FLUIDS.length +
      ' fluids exist' : 'missing (IV-A1 not merged?): ' + missing.join(', '))
    return missing.length === 0
  }

  function staticChecks() {
    safely('registration', function () {
      var problems = []
      var def = GTRegistries.MACHINES.get(rl(MACHINE))
      if (def === null || def === undefined) throw new Error(MACHINE + ' is not registered')
      var types = []
      var arr = def.getRecipeTypes()
      for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
      if (types.join(',') !== TYPE) problems.push('types ' + types.join(','))
      if (def.isGenerator() !== true) problems.push('isGenerator=' + def.isGenerator())
      if (def.isRegressWhenWaiting() !== false) problems.push('regresses while waiting')
      if (!global.grindless.patterns.describe(MACHINE)) problems.push('no structure description')
      check('registration', problems.length === 0, MACHINE + ': types=[' + types.join(',') + '] generator=' + def.isGenerator() +
        ' regressWhenWaiting=' + def.isRegressWhenWaiting() + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('core_table', function () {
      var F = FR()
      var problems = []
      if (F.loaded !== true) problems.push('table not loaded')
      if (F.channels !== 4) problems.push('channels ' + F.channels)
      if (F.cycleTicks !== CYCLE) problems.push('cycleTicks ' + F.cycleTicks)
      if (F.wearChance !== CHANCE || F.spentChance !== CHANCE || F.maxChance !== 10000) problems.push('chances ' + F.wearChance + '/' + F.spentChance + ' of ' + F.maxChance)
      if (!F.coolant || F.coolant.fluid !== WATER || F.coolant.amount !== WATER_PER_CHANNEL) problems.push('coolant ' + JSON.stringify(F.coolant))
      var names = (F.cores || []).map(function (c) { return c.name })
      Object.keys(WANT_CORES).forEach(function (name) {
        var w = WANT_CORES[name]
        var c = (F.cores || []).filter(function (x) { return x.name === name })[0]
        if (!c) {
          problems.push('no core ' + name)
          return
        }
        if (c.circuit !== w.circuit || c.fuel !== w.fuel || c.euPerChannel !== w.eut || c.spent !== w.spent) problems.push(name + ' ' + JSON.stringify(c))
        var mod = c.moderator
        if (w.moderator !== (mod !== null && mod !== undefined)) problems.push(name + ' moderator ' + JSON.stringify(mod))
        if (mod && (mod.fluid !== HEAVY || mod.becomes !== TRITIATED || mod.amount !== MODERATOR_PER_CHANNEL)) problems.push(name + ' moderator ' + JSON.stringify(mod))
      })
      if (names.length !== 4) problems.push(names.length + ' cores: ' + names.join(','))
      check('core_table', problems.length === 0, names.length + ' cores [' + names.join(', ') + '], ' + F.channels + ' channels, ' + F.cycleTicks +
        ' t cycles, wear ' + F.wearChance + ' and spent ' + F.spentChance + ' of ' + F.maxChance + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('core_recipes', function () {
      var F = FR()
      var problems = []
      var lines = []
      var balance = []
      var durations = []
      ;(F.cores || []).forEach(function (core) {
        var r = liveRecipe(core.recipe)
        if (r === null) {
          problems.push(core.recipe + ' missing')
          return
        }
        var eut = signedEUt(r)
        var items = itemContents(r, true)
        var outs = itemContents(r, false)
        var fin = fluidContents(r, true)
        var fout = fluidContents(r, false)
        durations.push(Number(r.duration))
        var circuit = items.filter(function (x) { return x.circuit > 0 })
        var fuel = items.filter(function (x) { return x.circuit === 0 })
        if (eut !== core.euPerChannel) problems.push(core.name + ' ' + eut + ' EU/t')
        if (circuit.length !== 1 || circuit[0].circuit !== core.circuit) problems.push(core.name + ' circuit ' + JSON.stringify(circuit))
        if (fuel.length !== 1 || fuel[0].id !== core.fuel || fuel[0].count !== 1 || fuel[0].chance !== CHANCE || fuel[0].maxChance !== 10000) {
          problems.push(core.name + ' fuel ' + JSON.stringify(fuel))
        }
        if (outs.length !== 1 || outs[0].id !== core.spent || outs[0].count !== 1 || outs[0].chance !== CHANCE || outs[0].maxChance !== 10000) {
          problems.push(core.name + ' spent ' + JSON.stringify(outs))
        }
        var wantIn = [{ id: WATER, amount: WATER_PER_CHANNEL }]
        var wantOut = []
        if (core.moderator) {
          wantIn.push({ id: HEAVY, amount: MODERATOR_PER_CHANNEL })
          wantOut.push({ id: TRITIATED, amount: MODERATOR_PER_CHANNEL })
        }
        if (JSON.stringify(fin) !== JSON.stringify(wantIn)) problems.push(core.name + ' fluids in ' + JSON.stringify(fin))
        if (JSON.stringify(fout) !== JSON.stringify(wantOut)) problems.push(core.name + ' fluids out ' + JSON.stringify(fout))
        var key = String(r.data.getString(F.coreKey))
        if (key !== core.name) problems.push(core.name + ' data ' + F.coreKey + '=' + key)
        var perAssembly = eut * Number(r.duration) * (10000 / CHANCE)
        balance.push(core.name + ': ' + eut + ' EU/t x ' + r.duration + ' t x ' + (10000 / CHANCE) + ' channel-cycles = ' + perAssembly + ' EU (' +
          (perAssembly / 1e9).toFixed(3) + ' G) per assembly, ' + (WATER_PER_CHANNEL * 10000 / CHANCE) + ' mB water' +
          (core.moderator ? ', ' + (MODERATOR_PER_CHANNEL * 10000 / CHANCE) + ' mB heavy water -> tritiated' : ''))
        lines.push(core.name + ' c' + core.circuit + ' ' + eut + ' EU/t x ' + r.duration + ' t')
      })
      var live = asArray(S.server.getRecipeManager().getAllRecipesFor(GTRegistries.RECIPE_TYPES.get(rl(TYPE)))).length
      if (live !== (F.cores || []).length) problems.push(live + ' live ' + TYPE + ' recipes for ' + (F.cores || []).length + ' cores')
      check('core_recipes', problems.length === 0 && lines.length === 4, lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      var report = (global.grindless.power && global.grindless.power.generators) || null
      var touched = report && report.perType ? Object.keys(report.perType).filter(function (t) { return t === TYPE }) : []
      var doubled = durations.filter(function (d) { return d !== CYCLE })
      check('not_doubled', durations.length === 4 && doubled.length === 0 && touched.length === 0 && report !== null, 'durations ' +
        durations.join(',') + ' (table ' + CYCLE + '); power/generators.js types ' + (report && report.perType ? Object.keys(report.perType).length : '?') +
        ', ' + TYPE + ' among them: ' + (touched.length > 0))
      note('balance', balance.join(' ; '))
    })

    safely('controller_recipe', function () {
      var F = FR()
      var r = liveRecipe(F.craftingRecipe)
      if (r === null) throw new Error(F.craftingRecipe + ' missing')
      var out = String(r.getResultItem(S.server.registryAccess()).getId())
      var ids = {}
      asArray(r.getIngredients()).forEach(function (ing) {
        asArray(ing.getItemIds()).forEach(function (id) { ids[String(id)] = true })
      })
      var missing = F.craftingParts.filter(function (id) { return id !== MACHINE && !ids[id] })
      check('controller_recipe', out === MACHINE && missing.length === 0, F.craftingRecipe + ' -> ' + out + (missing.length > 0 ? ' | missing: ' + missing.join(',') : ''))
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

  // a part's facing: the front face looks north, the side columns outwards (column 0 is the left as seen from the front: east)
  function facingOf(si, ci, last, width) {
    if (si === last) return 'north'
    if (ci === 0) return 'east'
    if (ci === width - 1) return 'west'
    return 'down'
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(copy) {
    var desc = global.grindless.patterns.describe(MACHINE)
    if (!desc) throw new Error('no structure description recorded for ' + MACHINE)
    var last = desc.slices.length - 1
    var width = desc.slices[0][0].length
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          if (desc.symbols[row.charAt(ci)] && desc.symbols[row.charAt(ci)].kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    var cy = Y + ctrl.ri
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          var c = { x: copy.x - (ci - ctrl.ci), y: cy + (ri - ctrl.ri), z: copy.z - (si - ctrl.si), ch: ch, id: null, props: '', role: null }
          var role = PARTS[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = MACHINE
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (role !== undefined) {
            c.id = ROLE_BLOCKS[role]
            c.props = '[facing=' + facingOf(si, ci, last, width) + ']'
            c.role = role
          } else {
            c.id = plainBlock(sym)
          }
          cells.push(c)
        }
      })
    })
    return { cells: cells, width: width, height: desc.slices[0].length, depth: desc.slices.length }
  }

  function setBlock(x, y, z, id, props) {
    return S.server.runCommandSilent('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + (props || '') + ' replace')
  }

  function place(m) {
    var plan = planOf(m.copy)
    var failed = []
    var ctrlCell = null
    var tally = {}
    m.roles = {}
    plan.cells.forEach(function (c) {
      tally[c.id] = (tally[c.id] || 0) + 1
      if (c.role === 'controller') {
        ctrlCell = c
        return
      }
      if (c.role !== null) m.roles[c.x + ',' + c.y + ',' + c.z] = c.role
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
    var bill = Object.keys(tally).sort().map(function (id) { return id.replace(/^(gtceu|gtnn):/, '') + ' x' + tally[id] }).join(', ')
    check(m.copy.key + '_PLACED', failed.length === 0 && wrong.length === 0, plan.cells.length + ' blocks, ' + plan.width + 'x' + plan.height + 'x' +
      plan.depth + ' (w x h x d), controller ' + m.ctrlPos.x + ',' + m.ctrlPos.y + ',' + m.ctrlPos.z + ' bill=[' + bill + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

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

  // ---------------------------------------------------------------- the copies

  function setVoiding(m, mode) {
    var VM = lazy().VoidingMode
    m.ctrl.setVoidingMode(VM[mode])
    wake(m.ctrl)
  }

  function dynamoStored(m) {
    return Number(m.P.dynamo.energyContainer.getEnergyStored())
  }

  function drainDynamo(m) {
    var c = m.P.dynamo.energyContainer
    var e = Number(c.getEnergyStored())
    if (e > 0) {
      m.eu += e
      c.setEnergyStored(0)
    }
  }

  function batteryCharge(m) {
    var bb = machineAt(m.bufferPos)
    return bb ? Number(bb.energyContainer.getEnergyStored()) : -1
  }

  function load(m, circuit, assemblies, water, heavy) {
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(circuit))
    // one at a time, slot after slot: the assembly may not stack
    var inv = m.P.inBus.getInventory()
    var placed = 0
    for (var s = 0; s < inv.getSlots() && placed < assemblies; s++) {
      while (placed < assemblies && inv.insertItem(s, Item.of(LEU, 1), false).isEmpty()) placed++
    }
    if (placed !== assemblies) throw new Error('could only insert ' + placed + ' of ' + assemblies + ' LEU assemblies')
    setTank(m.P.water, WATER, water)
    setTank(m.P.moderator, HEAVY, heavy)
    setTank(m.P.tritium, TRITIATED, 0)
    m.waterIn = water
    m.heavyIn = heavy
    m.assembliesIn = assemblies
  }

  function used(m) {
    return { water: m.waterIn - tankInfo(m.P.water).amount, heavy: m.heavyIn - tankInfo(m.P.moderator).amount }
  }

  function start(m) {
    var key = m.copy.key
    m.capacity = Math.round(global.grindless.generators.dynamoCapacity(m.ctrl))
    if (key === 'light') {
      check('dynamo_16a', m.capacity === 131072, 'one IV 16 A dynamo hatch carries ' + m.capacity + ' EU/t (8 192 V x 16 A = 131 072)')
      load(m, 1, 1, WATER_PER_CHANNEL, 0)
      var inv = machineAt(m.bufferPos).getBatteryInventory()
      for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of(BATTERY))
      m.batteryStart = batteryCharge(m)
      m.phase = 'running'
    } else if (key === 'heavy') {
      load(m, 2, 4, 4 * WATER_PER_CHANNEL, 4 * MODERATOR_PER_CHANNEL)
      m.phase = 'running'
    } else {
      load(m, 2, 1, WATER_PER_CHANNEL, MODERATOR_PER_CHANNEL)
      m.busSlots = fillBus(m.P.outBus, FILLER)
      m.phase = 'blocked_bus'
    }
    m.t0 = S.t
    wake(m.ctrl)
  }

  function cycleOver(m, age) {
    return (m.seenWorking && statusOf(m.ctrl) === 'IDLE') || age >= CYCLE + CYCLE_SLACK
  }

  function lightStep(m, age) {
    if (m.phase === 'running' && cycleOver(m, age)) {
      var residual = dynamoStored(m)
      var charged = batteryCharge(m) - m.batteryStart
      var made = charged + residual
      var want = WANT_CORES.leu_light_water.eut * CYCLE
      var u = used(m)
      var bus = readBus(m.P.inBus)
      var out = readBus(m.P.outBus)
      check('light_eu_to_buffer', charged > 0 && made === want, charged + ' EU charged into 4 IV batteries of an IV battery buffer through the 16 A IV ' +
        'dynamo hatch, ' + residual + ' still in the hatch, total ' + made + ' (one LEU light-water channel-cycle is worth ' + want + ')')
      var problems = []
      if (m.seen['grindless:fission_core/leu_light_water'] !== true) problems.push('leu_light_water never ran (seen ' + Object.keys(m.seen).join(',') + ')')
      if (m.maxPar !== 1) problems.push('channels ' + m.maxPar)
      if (u.water !== WATER_PER_CHANNEL) problems.push('water used ' + u.water)
      check('PROCESS_light', problems.length === 0, '1 channel of ' + Object.keys(m.seen).join(',') + ' (max ' + m.maxEut + ' EU/t): ' + made + ' EU, ' +
        u.water + ' mB water; input bus [' + summary(bus) + '], output bus [' + summary(out) + '] (the assembly wears 0.5% a channel-cycle) | ' +
        state(m.ctrl) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      m.euAtStop = made
      m.phase = 'scram'
      m.t0 = S.t
      return
    }
    if (m.phase === 'scram' && age >= HOLD_TICKS) {
      var after = batteryCharge(m) - m.batteryStart + dynamoStored(m)
      var lines = displayLines(m.ctrl)
      var scram = lines.some(function (l) { return SCRAM_LINE.test(l) })
      var fuel = readBus(m.P.inBus)[LEU] || 0
      var idle = statusOf(m.ctrl) === 'IDLE'
      check('scram_no_water', idle && after === m.euAtStop && (fuel === 0 || scram), 'water gone: status ' + statusOf(m.ctrl) + ', EU ' + m.euAtStop + ' -> ' + after +
        ' after ' + age + ' ticks, ' + fuel + ' assembly left, SCRAM line shown=' + scram + ' | lines=[' + lines.join(' ; ') + ']')
      m.phase = 'done'
    }
  }

  function heavyStep(m, age) {
    if (m.phase === 'running') {
      if (!m.checkedRunning && m.seenWorking && statusOf(m.ctrl) === 'WORKING') {
        m.checkedRunning = true
        m.scramWhileRunning = showsScram(m.ctrl)
        m.linesWhileRunning = displayLines(m.ctrl)
      }
      if (!cycleOver(m, age)) return
      var u = used(m)
      var made = m.eu + dynamoStored(m)
      var want = 4 * WANT_CORES.leu_heavy_water.eut * CYCLE
      var tri = tankInfo(m.P.tritium)
      var problems = []
      if (m.seen['grindless:fission_core/leu_heavy_water'] !== true) problems.push('leu_heavy_water never ran (seen ' + Object.keys(m.seen).join(',') + ')')
      if (m.maxPar !== 4) problems.push('channels ' + m.maxPar)
      if (m.maxEut !== 4 * WANT_CORES.leu_heavy_water.eut) problems.push('max ' + m.maxEut + ' EU/t')
      if (made !== want) problems.push(made + ' EU (wanted ' + want + ')')
      if (u.water !== 4 * WATER_PER_CHANNEL) problems.push('water used ' + u.water)
      if (u.heavy !== 4 * MODERATOR_PER_CHANNEL) problems.push('heavy water used ' + u.heavy)
      if (tri.id !== TRITIATED || tri.amount !== 4 * MODERATOR_PER_CHANNEL) problems.push('tritiated heavy water ' + tri.amount + ' ' + tri.id)
      if (m.scramWhileRunning !== false) problems.push('SCRAM line while running (or never seen running): ' + (m.linesWhileRunning || []).join(' ; '))
      check('PROCESS_heavy', problems.length === 0, m.maxPar + ' channels of ' + Object.keys(m.seen).join(',') + ' at ' + m.maxEut + ' EU/t: ' + made + ' EU, ' +
        u.water + ' mB water and ' + u.heavy + ' mB heavy water in, ' + tri.amount + ' mB ' + tri.id + ' out; input bus [' + summary(readBus(m.P.inBus)) +
        '], output bus [' + summary(readBus(m.P.outBus)) + ']; lines while running=[' + (m.linesWhileRunning || []).join(' ; ') + '] | ' + state(m.ctrl) +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      m.euAtStop = made
      m.phase = 'scram'
      m.t0 = S.t
      return
    }
    if (m.phase === 'scram' && age >= HOLD_TICKS) {
      var after = m.eu + dynamoStored(m)
      var fuel = readBus(m.P.inBus)[LEU] || 0
      var scram = showsScram(m.ctrl)
      check('scram_heavy', statusOf(m.ctrl) === 'IDLE' && after === m.euAtStop && fuel > 0 && scram, 'no water left: status ' + statusOf(m.ctrl) + ', EU ' +
        m.euAtStop + ' -> ' + after + ', ' + fuel + ' assemblies still loaded, SCRAM line shown=' + scram + ' | lines=[' + displayLines(m.ctrl).join(' ; ') + ']')
      m.phase = 'done'
    }
  }

  // nothing ran, no water and no EU since the copy was loaded
  function stillBlocked(m) {
    var u = used(m)
    return u.water === 0 && u.heavy === 0 && m.eu === 0 && dynamoStored(m) === 0 && Object.keys(m.seen).length === 0
  }

  function blockedDetail(m) {
    var u = used(m)
    return u.water + ' mB water and ' + u.heavy + ' mB heavy water used, ' + (m.eu + dynamoStored(m)) + ' EU, ran [' + Object.keys(m.seen).join(',') + '] | ' +
      state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']'
  }

  function roomStep(m, age) {
    if (m.phase === 'blocked_bus' && age >= HOLD_TICKS) {
      var scram = showsScram(m.ctrl)
      check('scram_spent_room', stillBlocked(m) && scram, 'output bus full (' + m.busSlots + ' slots of ' + FILLER + '): ' + blockedDetail(m) + ', SCRAM line shown=' + scram)
      setVoiding(m, 'VOID_ITEMS')
      m.phase = 'void_items'
      m.t0 = S.t
      return
    }
    if (m.phase === 'void_items' && age >= HOLD_TICKS) {
      var shown = failureReasons(m.ctrl).some(function (r) { return NO_VOIDING.test(r) })
      check('no_voiding_items', stillBlocked(m) && shown, 'output bus full, controller set to void items: refusal shown=' + shown + ', ' + blockedDetail(m))
      setVoiding(m, 'VOID_NONE')
      emptyBus(m.P.outBus)
      m.tritiumCap = Number(m.P.tritium.tank.getTankCapacity(0))
      setTank(m.P.tritium, TRITIATED, m.tritiumCap)
      wake(m.ctrl)
      m.phase = 'blocked_tritium'
      m.t0 = S.t
      return
    }
    if (m.phase === 'blocked_tritium' && age >= HOLD_TICKS) {
      check('scram_tritium_room', stillBlocked(m) && showsScram(m.ctrl), 'bus emptied, tritiated heavy water hatch full (' + m.tritiumCap + ' mB): ' + blockedDetail(m))
      setVoiding(m, 'VOID_FLUIDS')
      m.phase = 'void_fluids'
      m.t0 = S.t
      return
    }
    if (m.phase === 'void_fluids' && age >= HOLD_TICKS) {
      var shown2 = failureReasons(m.ctrl).some(function (r) { return NO_VOIDING.test(r) })
      check('no_voiding_fluids', stillBlocked(m) && shown2, 'tritiated hatch full, controller set to void fluids: refusal shown=' + shown2 + ', ' + blockedDetail(m))
      setVoiding(m, 'VOID_NONE')
      setTank(m.P.tritium, TRITIATED, 0)
      wake(m.ctrl)
      m.phase = 'resume'
      m.t0 = S.t
      return
    }
    if (m.phase === 'resume' && cycleOver(m, age)) {
      var u = used(m)
      var made = m.eu + dynamoStored(m)
      var tri = tankInfo(m.P.tritium)
      var want = WANT_CORES.leu_heavy_water.eut * CYCLE
      var ok = made === want && m.maxPar === 1 && u.water === WATER_PER_CHANNEL && u.heavy === MODERATOR_PER_CHANNEL && tri.amount === MODERATOR_PER_CHANNEL &&
        m.seen['grindless:fission_core/leu_heavy_water'] === true
      check('resumes', ok, 'hatch emptied, voiding off: ' + m.maxPar + ' channel of ' + Object.keys(m.seen).join(',') + ', ' + made + ' EU (wanted ' + want + '), ' +
        u.water + ' mB water and ' + u.heavy + ' mB heavy water in, ' + tri.amount + ' mB tritiated heavy water out | ' + state(m.ctrl))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- run

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    // a roof over the band: a hatch that is rained on may explode (GTM's weather check)
    S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + ROOF_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + ROOF_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing, roof at Y ' + ROOF_Y)
  }

  function startCopies() {
    S.copies = []
    COPIES.forEach(function (copy) {
      var m = { copy: copy, phase: 'forming', eu: 0, seen: {}, maxPar: 0, maxEut: 0, seenWorking: false, statuses: {} }
      S.copies.push(m)
      try {
        if (!place(m)) m.phase = 'done'
      } catch (e) {
        check(copy.key + '_PLACED', false, 'exception: ' + e)
        m.phase = 'done'
      }
    })
    S.t0 = S.t
  }

  function formed(m) {
    safely(m.copy.key + '_PARTS', function () {
      m.ctrl = machineAt(m.ctrlPos)
      m.P = findParts(m, m.ctrl)
      var want = {}
      Object.keys(PARTS).forEach(function (k) { want[PARTS[k]] = true })
      var missing = Object.keys(want).filter(function (role) { return !m.P[role] })
      check(m.copy.key + '_PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + ']' + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      if (missing.length > 0) {
        m.phase = 'done'
        return
      }
      start(m)
    })
    if (m.phase === 'formed') m.phase = 'done'
  }

  function formStep(m) {
    var waited = S.t - S.t0
    var ctrl = machineAt(m.ctrlPos)
    if (ctrl === null || ctrl === undefined) {
      check(m.copy.key + '_FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    if (ctrl.isFormed()) {
      check(m.copy.key + '_FORMED', true, (m.forced ? 'after a forced check' : 'by itself after ' + waited + ' ticks') + ', class=' +
        String(ctrl.getClass().getSimpleName()) + ' parts=' + asArray(ctrl.getParts()).length)
      m.phase = 'formed'
      formed(m)
      return
    }
    if (waited >= FORM_TIMEOUT && !m.forced) {
      if (!ctrl.checkPatternWithLock()) {
        check(m.copy.key + '_FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
        m.phase = 'done'
        return
      }
      check(m.copy.key + '_FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
      ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
      ctrl.onStructureFormed()
      m.forced = true
    } else if (waited >= 2 * FORM_TIMEOUT) {
      check(m.copy.key + '_FORMED', false, 'still not formed after a forced check')
      m.phase = 'done'
    }
  }

  // every tick: what each controller does, and the EU of the drained dynamo hatches
  function measure(m) {
    if (!m.ctrl || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
    var rlg = m.ctrl.getRecipeLogic()
    var status = String(rlg.getStatus())
    m.statuses[status] = (m.statuses[status] || 0) + 1
    var last = rlg.getLastRecipe()
    if (status === 'WORKING' && last !== null && last !== undefined) {
      m.seenWorking = true
      m.seen[String(last.id)] = true
      if (last.parallels > m.maxPar) m.maxPar = last.parallels
      var eut = Math.abs(signedEUt(last))
      if (eut > m.maxEut) m.maxEut = eut
    }
    if (m.copy.sink === 'drain') drainDynamo(m)
  }

  function step(m) {
    if (m.phase === 'forming') {
      formStep(m)
      return
    }
    var age = S.t - m.t0
    if (m.copy.key === 'light') lightStep(m, age)
    else if (m.copy.key === 'heavy') heavyStep(m, age)
    else roomStep(m, age)
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    try {
      S.copies.forEach(function (m) {
        try {
          measure(m)
          if (m.phase === 'forming' ? S.t % STEP === 0 : true) step(m)
        } catch (e) {
          check(m.copy.key + '_STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      })
    } catch (e2) {
      check('STEP', false, 'exception: ' + e2)
      S.copies.forEach(function (m) { m.phase = 'done' })
    }
    if (S.copies.every(function (m) { return m.phase === 'done' })) finish()
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
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), copies: [], finished: false }
    var shared = false
    try {
      shared = sharedIdsPresent()
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    if (!shared) {
      note('copies', 'skipped: the cores cannot run without IV-A1\'s registrations')
      finish()
      return
    }
    try {
      prepareWorld()
    } catch (e2) {
      check('AREA', false, 'exception: ' + e2)
    }
    startCopies()
    if (S.copies.every(function (m) { return m.phase === 'done' })) finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_fission_reactor', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_fission_reactor run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
