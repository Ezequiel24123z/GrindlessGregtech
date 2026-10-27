// Gregtech Grindless - smoke test of package IV-A5, heavy-water-plant (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): IV's Heavy-Water Plant (gtceu:heavy_water_plant and its recipe type gtceu:isotope_exchange),
// startup_scripts/grindless/iv/heavy_water_plant.js, server_scripts/grindless/iv/heavy_water_plant.js and
// data/grindless/tables/heavy_water_plant.json.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_heavy_water_plant;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|heavy_water_plant\|DONE@@900;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|heavy_water_plant|<check>|PASS|FAIL|NOTE|<detail>
//   shared_ids          the ice dust (EV), IV-A1's heavy water and concentrate, GTM's H2S, steam and distilled water exist
//   registration        gtceu:heavy_water_plant on its own type gtceu:isotope_exchange, not a generator, with a structure description
//   structure           the description is the design: 9 wide, 14 high, 3 deep; a 10-high cold tower and a 14-high hot tower (hollow,
//                       capped), the 2x2 titanium bridge at rows 5-6, the 8-high tungstensteel vacuum column, 14 part cells, 1 controller
//   recipes             the table's two recipes were built, none skipped, priced from their stages: exchange 110 592 EU of stages
//                       (melt 8 192 + exchange 102 400) at <= 1 920 EU/t, finishing 33 333 EU at <= 480 EU/t
//   live_contents       both recipes are in the recipe manager under grindless:isotope_exchange/<name> with exactly their contents:
//                       items, circuit, fluids (the H2S of the exchange with chance 0, i.e. not consumed; every other input consumed),
//                       outputs, EU/t, duration and the EMI data key
//   stages_live         the stage rates of the table against GTM's live recipes: snow block extraction 512 EU per 1 000 mB, distill_water_large
//                       19 200 EU per 576 mB; hydrogen_separation is absent (EV removed it; its 3 200 EU per 40 mB is GTM 7.5.3's source)
//   lookup_safety       neither recipe takes a subset of the other's ingredients (static; gg_test_recipe_lookup asks GTM's lookup)
//   controller_recipe   grindless:crafting/heavy_water_plant exists and holds its parts
//   yield               NOTE: ice, steam and EU per mB of heavy water from the live recipes, next to the fission reactor's heavy-water need
//   <copy>_PLACED / _FORMED / _PARTS   the two copies below
//   charge_line_low     copy base: the controller line reads the H2S charge as missing (0 of 1 000 mB)
//   refuses_no_charge   copy base: 16 ice + 25 600 mB steam, circuit 1, no H2S -> nothing runs (no input used, no EU)
//   refuses_low_charge  copy base: the same with 999 mB of H2S -> nothing runs
//   PROCESS_exchange    copy base, EV hatch (no overclock): with 1 000 mB of H2S -> exactly 3 200 mB concentrate, 12 800 mB water and
//                       160 mB distilled water; the ice and the steam are used up; the EU drawn is exactly the recipe's
//   charge_undrained    copy base: after that run the H2S hatch still holds exactly 1 000 mB of H2S, and the controller line reads it
//   charge_reused       copy base: a second batch runs on the same, untouched charge, with the same outputs, and leaves it at 1 000 mB
//   exchange_overclock  copy chain, IV hatch: the exchange overclocked once (4x EU/t, half the time): the same outputs, and the charge is
//                       taken once, not scaled: still 1 000 mB after the run
//   PROCESS_finishing   copy chain: 1 000 mB of the concentrate it just made, circuit 2 -> exactly 200 mB heavy water + 800 mB distilled
//                       water; the H2S left in its hatch is not touched; the EU drawn is the overclocked recipe's
//   heavy_water_plant|DONE  last line
//
// Copies (controllers face north at z 2, the structures are behind them, z 2-4): base (x 10762, an EV energy hatch: the exchange runs at
// its own 1 907 EU/t) and chain (x 10782, an IV energy hatch). Parts in the towers' feet, row 0: front face (facing north), left to right
// as seen from the front: energy hatch, input bus, input hatch 1, input hatch 2 (the H2S), output hatch 1; back face (facing south): output
// hatches 2 and 3 under the cold tower.
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 10752-10815, Y 98-112, Z 0-15 (AGENTS.md:
// tests run at the same time in one server), with a roof at Y 112 so no hatch is rained on (the towers reach Y 111). The structures come
// from the description lib/patterns.js records (global.grindless.structures). The ice, the steam (the combined-cycle plant's and the hot
// strip mill's), the H2S (the refinery's) and the concentrate of the finishing run are injected.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'heavy_water_plant'
  var BAND = { x0: 10752, x1: 10815, y0: 98, y1: 112, z0: 0, z1: 15 }
  var ROOF_Y = 112
  var Y = 98
  var STEP = 10
  var FORM_TIMEOUT = 600
  var HOLD_TICKS = 60
  var SLACK = 120

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestHeavyWaterPlantRequest'

  var MACHINE = 'gtceu:heavy_water_plant'
  var TYPE = 'gtceu:isotope_exchange'
  var ROLE_BLOCKS = {
    inBus: 'gtceu:iv_input_bus',
    in1: 'gtceu:iv_input_hatch',
    in2: 'gtceu:iv_input_hatch',
    out1: 'gtceu:iv_output_hatch',
    out2: 'gtceu:iv_output_hatch',
    out3: 'gtceu:iv_output_hatch'
  }
  // 'slice,row,column' of the description (slice 0 = the back face, 2 = the front face) -> role
  var PARTS = { '2,0,0': 'energy', '2,0,1': 'inBus', '2,0,2': 'in1', '2,0,5': 'in2', '2,0,7': 'out1', '0,0,0': 'out2', '0,0,1': 'out3' }
  var FACING = { 0: 'south', 1: 'west', 2: 'north' }
  var OUTS = ['out1', 'out2', 'out3']
  var INS = ['in1', 'in2']
  var COPIES = [
    { key: 'base', x: 10762, z: 2, energy: 'gtceu:ev_energy_input_hatch' },
    { key: 'chain', x: 10782, z: 2, energy: 'gtceu:iv_energy_input_hatch' }
  ]

  var ICE = 'gtceu:deuterium_rich_ice_dust'
  var STEAM = 'gtceu:steam'
  var H2S = 'gtceu:hydrogen_sulfide'
  var CONC = 'gtceu:heavy_water_concentrate'
  var D2O = 'gtceu:heavy_water'
  var WATER = 'minecraft:water'
  var DIST = 'gtceu:distilled_water'
  var SHARED_FLUIDS = [D2O, CONC, H2S, STEAM, DIST, WATER]
  var EXCHANGE = 'martian_ice_exchange'
  var FINISHING = 'concentrate_finishing'
  var PROXIMA = 'proxima_water_exchange'
  var DEW = 'gtceu:deuterium_enriched_water'
  var CHARGE_LOW = /heavy_water_plant\.charge\.low/
  var CHARGE_OK = /heavy_water_plant\.charge\.ok/

  // the design (docs/eras/iv.md, "Heavy-water plant"): stages' energy and the cap they are spent under
  var WANT = {}
  WANT[EXCHANGE] = {
    circuit: 1, charge: true, sourceEnergy: 110592, maxEut: 1920,
    itemsIn: [[ICE, 16]], fluidsIn: [[STEAM, 25600]], fluidsOut: [[CONC, 3200], [WATER, 12800], [DIST, 160]]
  }
  WANT[FINISHING] = {
    circuit: 2, charge: false, sourceEnergy: 19200 * 1000 / 576, maxEut: 480,
    itemsIn: [], fluidsIn: [[CONC, 1000]], fluidsOut: [[D2O, 200], [DIST, 800]]
  }
  // UHV-B5: Proxima b's water arrives melted, so the row has only the exchange stage
  WANT[PROXIMA] = {
    circuit: 3, charge: true, sourceEnergy: 3200 * 320 / 40, maxEut: 1920,
    itemsIn: [], fluidsIn: [[DEW, 1000]], fluidsOut: [[CONC, 800], [WATER, 200]]
  }
  // GTM's live recipes whose rates the stages use: [id, EU per `per` mB, per]
  var LIVE_STAGES = [
    ['gtceu:extractor/snow_block_extraction', 512, 1000, WATER],
    ['gtceu:distillation_tower/distill_water_large', 19200, 576, DIST]
  ]
  var REMOVED_STAGE = 'gtceu:centrifuge/hydrogen_separation'

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
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
      }
    }
    return classes
  }

  function HW() {
    return global.grindless.heavyWaterPlant || {}
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

  function short(id) {
    return String(id).replace(/^(gtceu|grindless|minecraft):/, '')
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

  function emptyBus(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }

  function insert(bus, id, n) {
    var inv = bus.getInventory()
    var left = n
    for (var s = 0; s < inv.getSlots() && left > 0; s++) {
      var rest = inv.insertItem(s, Item.of(id, left), false)
      left = rest.isEmpty() ? 0 : Number(rest.getCount())
    }
    if (left > 0) throw new Error('could only insert ' + (n - left) + ' of ' + n + ' ' + id)
  }

  function summary(counts) {
    var keys = Object.keys(counts)
    return keys.length === 0 ? 'empty' : keys.map(function (k) { return short(k) + ' x' + counts[k] }).join(', ')
  }

  function outFluids(m) {
    var t = {}
    OUTS.forEach(function (role) {
      var info = tankInfo(m.P[role])
      if (info.amount > 0) t[info.id] = (t[info.id] || 0) + info.amount
    })
    return t
  }

  function fluidSummary(t) {
    var keys = Object.keys(t)
    return keys.length === 0 ? 'none' : keys.map(function (k) { return short(k) + ' ' + t[k] + ' mB' }).join(', ')
  }

  // exactly these fluids in exactly these amounts
  function sameFluids(t, want) {
    if (Object.keys(t).length !== want.length) return false
    return want.every(function (w) { return t[w[0]] === w[1] })
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function inputEUt(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    if (io.isEmpty()) return 0
    return io.isInput() ? Number(io.getTotalEU()) : -Number(io.getTotalEU())
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

  // the fluid contents of one side, with their chance (RecipeHelper keeps the order of the contents): [{ id, amount, chance, maxChance }]
  function fluidContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.FluidCap) : recipe.getOutputContents(c.FluidCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputFluids(recipe) : c.RecipeHelper.getOutputFluids(recipe))
    return stacks.map(function (st, i) {
      return { id: fluidName(st), amount: Number(st.getAmount()), chance: Number(contents[i].chance), maxChance: Number(contents[i].maxChance) }
    })
  }

  function failureReasons(ctrl) {
    try {
      return asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }

  // the plant's own controller line (startup script), read as text: on the server it is the translation key and its arguments
  function chargeLine(ctrl) {
    var list = new (lazy().ArrayList)()
    HW().display(ctrl, list)
    return asArray(list).map(function (c) {
      var args = []
      try {
        var raw = c.getContents().getArgs()
        for (var i = 0; i < raw.length; i++) args.push(String(raw[i]))
      } catch (e) { /* plain text */ }
      return String(c.getString()) + (args.length > 0 ? ' [' + args.join(', ') + ']' : '')
    }).join(' / ')
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
        ' last=' + (last ? last.id + ' x' + last.parallels : 'none')
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  function published(name) {
    return (HW().recipes || []).filter(function (r) { return r.name === name })[0] || null
  }

  // ---------------------------------------------------------------- static checks

  function sharedIdsPresent() {
    var missing = SHARED_FLUIDS.filter(function (id) { return !Fluid.exists(id) })
    if (!Item.exists(ICE)) missing.push(ICE)
    check('shared_ids', missing.length === 0, missing.length === 0 ? 'the ice dust and ' + SHARED_FLUIDS.length + ' fluids exist (EV\'s ice, IV-A1\'s heavy waters, GTM\'s)' :
      'missing (IV-A1 not merged?): ' + missing.join(', '))
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
      if (def.isGenerator() !== false) problems.push('isGenerator=' + def.isGenerator())
      if (!global.grindless.patterns.describe(MACHINE)) problems.push('no structure description')
      check('registration', problems.length === 0, MACHINE + ': types=[' + types.join(',') + '] generator=' + def.isGenerator() +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('structure', function () {
      var desc = global.grindless.patterns.describe(MACHINE)
      if (!desc) throw new Error('no structure description')
      var problems = []
      var width = desc.slices[0][0].length
      var height = desc.slices[0].length
      var depth = desc.slices.length
      if (width !== 9 || height !== 14 || depth !== 3) problems.push('size ' + width + 'x' + height + 'x' + depth)
      var count = {}
      var kinds = {}
      Object.keys(desc.symbols).forEach(function (ch) {
        var s = desc.symbols[ch]
        kinds[ch] = s.kind === 'blocks' ? s.blocks[0] : s.kind
      })
      // per column: the highest row that is not "any" or air (the top of each tower), and what stands in the middle slice
      var tops = []
      for (var ci = 0; ci < width; ci++) tops.push(-1)
      desc.slices.forEach(function (rows) {
        rows.forEach(function (row, ri) {
          for (var c = 0; c < row.length; c++) {
            var ch = row.charAt(c)
            if (ch === ' ') continue
            var k = kinds[ch]
            count[k] = (count[k] || 0) + 1
            if (k !== 'air' && k !== 'any' && ri > tops[c]) tops[c] = ri
          }
        })
      })
      var B = HW().blocks || {}
      var want = {}
      want[B.casing] = 181
      want[B.bridge] = 4
      want[B.column] = 8
      want.oneOf = 14
      want.controller = 1
      want.air = 20
      Object.keys(want).forEach(function (k) { if (count[k] !== want[k]) problems.push(short(k) + ' x' + count[k] + ' (want ' + want[k] + ')') })
      if (tops.join(',') !== '9,9,9,6,6,13,13,13,7') problems.push('tops ' + tops.join(','))
      var middle = desc.slices[1]
      if (middle[5].substring(3, 5) !== 'PP' || middle[6].substring(3, 5) !== 'PP' || middle[4].substring(3, 5) !== '  ' || middle[7].substring(3, 5) !== '  ') {
        problems.push('the bridge is not at rows 5-6')
      }
      check('structure', problems.length === 0, width + ' wide x ' + height + ' high x ' + depth + ' deep; column tops [' + tops.join(',') + '] (cold tower ' +
        (tops[0] + 1) + ', hot tower ' + (tops[5] + 1) + ', vacuum column ' + (tops[8] + 1) + ' high); ' + Object.keys(count).sort().map(function (k) {
          return short(k) + ' x' + count[k]
        }).join(', ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('recipes', function () {
      var problems = []
      var lines = []
      var skipped = HW().skipped || []
      if (skipped.length > 0) problems.push('skipped: ' + skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join(', '))
      if ((HW().clashes || []).length > 0) problems.push('clashes: ' + HW().clashes.join('; '))
      Object.keys(WANT).forEach(function (name) {
        var w = WANT[name]
        var r = published(name)
        if (r === null) {
          problems.push(name + ' missing')
          return
        }
        if (r.circuit !== w.circuit || r.charge !== w.charge) problems.push(name + ' circuit ' + r.circuit + ' charge ' + r.charge)
        if (Math.abs(r.sourceEnergy - w.sourceEnergy) > 1e-6) problems.push(name + ' stages ' + r.sourceEnergy + ' EU, design ' + w.sourceEnergy)
        if (!(r.eut <= w.maxEut) || r.duration !== Math.ceil(w.sourceEnergy / w.maxEut)) problems.push(name + ' ' + r.eut + ' EU/t x ' + r.duration + ' t')
        if (!(r.energy >= r.sourceEnergy && r.energy < r.sourceEnergy + r.duration)) problems.push(name + ' costs ' + r.energy + ' EU for ' + r.sourceEnergy)
        lines.push(name + ': ' + r.stages.map(function (s) { return s.stage + ' ' + s.eu.toFixed(1) + ' (' + short(s.from) + ')' }).join(' + ') + ' = ' +
          r.sourceEnergy.toFixed(1) + ' EU, spent as ' + r.duration + ' t x ' + r.eut + ' EU/t = ' + r.energy + ' EU')
      })
      check('recipes', problems.length === 0 && (HW().recipes || []).length === 3, lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('live_contents', function () {
      var problems = []
      var sets = []
      var charge = HW().charge || {}
      var recipes = HW().recipes || []
      recipes.forEach(function (rec) {
        var r = liveRecipe(rec.recipeId)
        if (r === null) {
          problems.push(rec.recipeId + ' not in the recipe manager')
          return
        }
        var w = WANT[rec.name]
        var items = itemContents(r, true)
        var circuit = items.filter(function (x) { return x.circuit > 0 })
        var ins = items.filter(function (x) { return x.circuit === 0 })
        if (circuit.length !== 1 || circuit[0].circuit !== w.circuit || circuit[0].chance !== 0) problems.push(rec.name + ' circuit ' + JSON.stringify(circuit))
        var wantIn = w.itemsIn.map(function (x) { return x[0] + ' x' + x[1] }).sort().join(',')
        var gotIn = ins.map(function (x) { return x.id + ' x' + x.count + (x.chance >= x.maxChance ? '' : ' @' + x.chance) }).sort().join(',')
        if (wantIn !== gotIn) problems.push(rec.name + ' items in ' + gotIn + ' (want ' + wantIn + ')')
        if (itemContents(r, false).length !== 0) problems.push(rec.name + ' has item outputs')
        var fin = fluidContents(r, true)
        var consumed = fin.filter(function (f) { return f.chance >= f.maxChance })
        var kept = fin.filter(function (f) { return f.chance === 0 })
        var wantConsumed = w.fluidsIn.map(function (f) { return f[0] + ' ' + f[1] }).sort().join(',')
        if (consumed.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',') !== wantConsumed || consumed.length + kept.length !== fin.length) {
          problems.push(rec.name + ' consumed fluids ' + JSON.stringify(fin))
        }
        var wantKept = w.charge ? charge.id + ' ' + charge.amount : ''
        if (kept.map(function (f) { return f.id + ' ' + f.amount }).join(',') !== wantKept) problems.push(rec.name + ' non-consumed fluids ' + JSON.stringify(kept) + ' (want ' + wantKept + ')')
        var fout = fluidContents(r, false)
        if (fout.map(function (f) { return f.id + ' ' + f.amount + (f.chance >= f.maxChance ? '' : ' @' + f.chance) }).sort().join(',') !==
          w.fluidsOut.map(function (f) { return f[0] + ' ' + f[1] }).sort().join(',')) problems.push(rec.name + ' fluids out ' + JSON.stringify(fout))
        var eut = inputEUt(r)
        if (eut !== rec.eut || Number(r.duration) !== rec.duration) problems.push(rec.name + ' ' + eut + ' EU/t x ' + r.duration + ' t')
        var key = String(r.data.getString(HW().dataKey))
        if (key !== rec.name) problems.push(rec.name + ' data ' + HW().dataKey + '=' + key)
        sets.push({ name: rec.name, keys: ins.map(function (x) { return 'i:' + x.id }).concat(fin.map(function (f) { return 'f:' + f.id }))
          .concat(['circuit:' + w.circuit]) })
      })
      var live = asArray(S.server.getRecipeManager().getAllRecipesFor(GTRegistries.RECIPE_TYPES.get(rl(TYPE)))).length
      if (live !== recipes.length) problems.push(live + ' live ' + TYPE + ' recipes for ' + recipes.length + ' published')
      check('live_contents', problems.length === 0 && recipes.length === 3, recipes.length + ' recipes checked against the recipe manager; the exchange keeps ' +
        charge.amount + ' mB ' + short(charge.id) + ' at chance 0 (not consumed)' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      S.sets = sets
    })

    safely('stages_live', function () {
      var problems = []
      var lines = []
      LIVE_STAGES.forEach(function (st) {
        var r = liveRecipe(st[0])
        if (r === null) {
          problems.push(st[0] + ' missing')
          return
        }
        var out = fluidContents(r, false).filter(function (f) { return f.id === st[3] })[0]
        var eu = inputEUt(r) * Number(r.duration)
        if (!out) {
          problems.push(st[0] + ' gives no ' + st[3])
          return
        }
        // the table's rate is EU per mB of the stage's measure: the extraction's water out, the distillation's water in (576 mB)
        var rate = st[0].indexOf('distill_water_large') >= 0 ? eu / fluidContents(r, true)[0].amount : eu / out.amount
        if (Math.abs(rate - st[1] / st[2]) > 1e-9) problems.push(st[0] + ' ' + rate + ' EU/mB, table ' + (st[1] / st[2]))
        lines.push(short(st[0]) + ' ' + eu + ' EU (' + inputEUt(r) + ' EU/t x ' + r.duration + ' t) = ' + rate.toFixed(4) + ' EU/mB')
      })
      var removed = liveRecipe(REMOVED_STAGE)
      if (removed !== null) problems.push(REMOVED_STAGE + ' is live again')
      check('stages_live', problems.length === 0, lines.join('; ') + '; ' + short(REMOVED_STAGE) + ' ' + (removed === null ? 'absent (EV removed it; the table keeps GTM 7.5.3\'s 20 EU/t x 160 t per 40 mB D)' : 'PRESENT') +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('lookup_safety', function () {
      var sets = S.sets || []
      var clashes = []
      function subset(a, b) {
        return a.keys.every(function (k) { return b.keys.indexOf(k) >= 0 })
      }
      for (var i = 0; i < sets.length; i++) {
        for (var j = i + 1; j < sets.length; j++) {
          if (subset(sets[i], sets[j]) || subset(sets[j], sets[i])) clashes.push(sets[i].name + ' / ' + sets[j].name)
        }
      }
      check('lookup_safety', sets.length === 3 && clashes.length === 0, sets.map(function (s) { return s.name + ' {' + s.keys.join(' ') + '}' }).join(' ; ') +
        (clashes.length > 0 ? ' | clashes: ' + clashes.join('; ') : ''))
    })

    safely('controller_recipe', function () {
      var r = liveRecipe(HW().craftingRecipe)
      if (r === null) throw new Error(HW().craftingRecipe + ' missing')
      var out = String(r.getResultItem(S.server.registryAccess()).getId())
      var ids = {}
      asArray(r.getIngredients()).forEach(function (ing) {
        asArray(ing.getItemIds()).forEach(function (id) { ids[String(id)] = true })
      })
      var missing = (HW().craftingParts || []).filter(function (id) { return id !== MACHINE && !ids[id] })
      check('controller_recipe', out === MACHINE && missing.length === 0, HW().craftingRecipe + ' -> ' + out + ' from [' + Object.keys(ids).filter(function (id) {
        return id.indexOf('circuit') < 0
      }).map(short).join(', ') + ' + IV circuits]' + (missing.length > 0 ? ' | missing: ' + missing.join(',') : ''))
    })

    safely('yield', function () {
      var ex = published(EXCHANGE)
      var fin = published(FINISHING)
      if (!ex || !fin) throw new Error('a recipe is missing')
      var concPerBatch = ex.fluidsOut.filter(function (f) { return f.id === CONC })[0].amount
      var d2oPerConc = fin.fluidsOut.filter(function (f) { return f.id === D2O })[0].amount / fin.fluidsIn[0].amount
      var d2oPerBatch = concPerBatch * d2oPerConc
      var ice = ex.itemsIn[0].count
      var steam = ex.fluidsIn.filter(function (f) { return f.id === STEAM })[0].amount
      var euPerMb = (ex.energy + fin.energy * concPerBatch / fin.fluidsIn[0].amount) / d2oPerBatch
      var ticksPerMb = (ex.duration + fin.duration * concPerBatch / fin.fluidsIn[0].amount) / d2oPerBatch
      var FR = global.grindless.fissionReactor || {}
      var heavy = (FR.cores || []).filter(function (c) { return c.moderator && c.moderator.fluid === D2O })
      var need = heavy.length > 0 ? FR.channels * heavy[0].moderator.amount * 72000 / FR.cycleTicks : 0
      var perAssembly = heavy.length > 0 ? heavy[0].moderator.amount * FR.maxChance / FR.wearChance : 0
      var light = (FR.cores || []).filter(function (c) { return c.name === 'leu_light_water' })[0]
      var gain = heavy.length > 0 && light ? (heavy[0].euPerChannel - light.euPerChannel) * FR.cycleTicks * FR.maxChance / FR.wearChance : 0
      note('yield', 'per mB of heavy water: ' + (ice / d2oPerBatch) + ' ice (1 ice = ' + (d2oPerBatch / ice) + ' mB), ' + (steam / d2oPerBatch) + ' mB steam, ' +
        euPerMb.toFixed(1) + ' EU (exchange ' + (ex.energy / d2oPerBatch).toFixed(1) + ' + finishing ' + (fin.energy / (fin.fluidsIn[0].amount * d2oPerConc)).toFixed(1) +
        '), ' + ticksPerMb.toFixed(3) + ' plant ticks at base speed; the H2S charge is never spent. Fission reactor (IV-A2): a heavy-water channel takes ' +
        (heavy.length > 0 ? heavy[0].moderator.amount : '?') + ' mB per ' + FR.cycleTicks + '-tick cycle, so 4 heavy channels need ' + need + ' mB/h = ' +
        (need * ice / d2oPerBatch) + ' ice/h, ' + (need * euPerMb / 72000).toFixed(1) + ' EU/t on average and ' + (need * ticksPerMb / 20).toFixed(0) +
        ' s of one plant per hour; an assembly moderated with ' + perAssembly + ' mB gives ' + (gain / 1e9).toFixed(2) + ' G EU more than in light water (' +
        (perAssembly > 0 ? (gain / perAssembly / 1e6).toFixed(2) : '?') + ' M EU per mB, for ' + euPerMb.toFixed(0) + ' EU per mB made)')
    })
  }

  // ---------------------------------------------------------------- structures

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
    var desc = global.grindless.patterns.describe(MACHINE)
    if (!desc) throw new Error('no structure description recorded for ' + MACHINE)
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
            c.id = role === 'energy' ? copy.energy : ROLE_BLOCKS[role]
            c.props = '[facing=' + FACING[si] + ']'
            c.role = role
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
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return short(id) + ' x' + tally[id] }).join(', ')
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
      P.ids.push(short(p.getDefinition().getId()) + (role ? '=' + role : ''))
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

  // the energy hatch is topped up every tick; what it lost since the last tick is what the plant drew
  function meter(m) {
    var c = m.P.energy.energyContainer
    var cap = Number(c.getEnergyCapacity())
    var stored = Number(c.getEnergyStored())
    if (m.metered) m.euUsed += cap - stored
    c.setEnergyStored(cap)
    m.metered = true
  }

  // empties every part (the circuit too) and starts a scenario: items into the input bus, fluids into input hatches 1 and 2
  function load(m, sc) {
    emptyBus(m.P.inBus)
    INS.forEach(function (role) { setTank(m.P[role], null, 0) })
    OUTS.forEach(function (role) { setTank(m.P[role], null, 0) })
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    ;(sc.items || []).forEach(function (x) { insert(m.P.inBus, x[0], x[1]) })
    ;(sc.fluids || []).forEach(function (f, i) { if (f !== null) setTank(m.P[INS[i]], f[0], f[1]) })
    begin(m, sc.phase)
  }

  function begin(m, phase) {
    m.phase = phase
    m.t0 = S.t
    m.seen = {}
    m.seenWorking = false
    m.ran = null
    m.eu0 = m.euUsed
    wake(m.ctrl)
  }

  function runOver(m, age, duration) {
    return (m.seenWorking && statusOf(m.ctrl) === 'IDLE') || age >= duration + SLACK
  }

  function recipeOf(name) {
    var r = published(name)
    if (r === null) throw new Error('recipe ' + name + ' was not published')
    return r
  }

  // what a run left: items still in the bus, fluids in the output hatches, the input hatches and the EU drawn
  function result(m) {
    return {
      fluids: outFluids(m),
      left: readBus(m.P.inBus),
      in1: tankInfo(m.P.in1),
      in2: tankInfo(m.P.in2),
      eu: m.euUsed - m.eu0
    }
  }

  // nothing ran since the scenario began: the ice and the steam are untouched and no EU was drawn
  function stillBlocked(m) {
    return (readBus(m.P.inBus)[ICE] || 0) === 16 && tankInfo(m.P.in1).amount === 25600 && m.euUsed === m.eu0 && Object.keys(m.seen).length === 0 &&
      Object.keys(outFluids(m)).length === 0
  }

  function blockedDetail(m) {
    var h = tankInfo(m.P.in2)
    return (readBus(m.P.inBus)[ICE] || 0) + ' ice in the bus, ' + tankInfo(m.P.in1).amount + ' mB steam, ' + h.amount + ' mB ' + short(h.id) + ', ' + (m.euUsed - m.eu0) +
      ' EU, ran [' + Object.keys(m.seen).join(',') + '], outputs ' + fluidSummary(outFluids(m)) + ' | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']'
  }

  // the problems of an exchange run: its outputs, its inputs used up, the charge left alone, and the EU (want: exact EU or null)
  function exchangeProblems(m, r, rec, wantEu) {
    var w = WANT[EXCHANGE]
    var problems = []
    if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
    if (!sameFluids(r.fluids, w.fluidsOut)) problems.push('fluids out ' + fluidSummary(r.fluids))
    if (Object.keys(r.left).length !== 0 || r.in1.amount !== 0) problems.push('left ' + summary(r.left) + ', ' + r.in1.amount + ' mB ' + short(r.in1.id))
    if (r.in2.id !== H2S || r.in2.amount !== 1000) problems.push('charge after the run: ' + r.in2.amount + ' mB ' + short(r.in2.id))
    if (wantEu !== null && r.eu !== wantEu) problems.push(r.eu + ' EU drawn, want ' + wantEu)
    return problems
  }

  function baseStep(m, age) {
    if (m.phase === 'no_charge' && age >= HOLD_TICKS) {
      var line = chargeLine(m.ctrl)
      check('charge_line_low', CHARGE_LOW.test(line) && /\[0, 1000\]/.test(line), 'no H2S in the hatches: "' + line + '", chargeIn=' + HW().chargeIn(m.ctrl))
      check('refuses_no_charge', stillBlocked(m), '16 ice + 25 600 mB steam, circuit 1, no H2S: ' + blockedDetail(m))
      setTank(m.P.in2, H2S, 999)
      begin(m, 'low_charge')
      return
    }
    if (m.phase === 'low_charge' && age >= HOLD_TICKS) {
      check('refuses_low_charge', stillBlocked(m) && tankInfo(m.P.in2).amount === 999, 'the same with 999 mB of H2S: ' + blockedDetail(m) + ' | line "' + chargeLine(m.ctrl) + '"')
      setTank(m.P.in2, H2S, 1000)
      begin(m, 'exchange')
      return
    }
    if (m.phase === 'exchange' && runOver(m, age, recipeOf(EXCHANGE).duration)) {
      var rec = recipeOf(EXCHANGE)
      var r = result(m)
      var problems = exchangeProblems(m, r, rec, rec.energy)
      check('PROCESS_exchange', problems.length === 0, '16 ice + 25 600 mB steam + 1 000 mB H2S, circuit 1, EV hatch -> ' + fluidSummary(r.fluids) + '; ' + r.eu +
        ' EU drawn (' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' + rec.energy + ') ran ' + JSON.stringify(m.ran) + ' | ' + state(m.ctrl) +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      var line2 = chargeLine(m.ctrl)
      check('charge_undrained', r.in2.id === H2S && r.in2.amount === 1000 && CHARGE_OK.test(line2), 'after the run the H2S hatch holds ' + r.in2.amount + ' mB ' +
        short(r.in2.id) + ' (put in: 1000); controller line "' + line2 + '"')
      // the second batch: fresh ice and steam, the charge left exactly as the first run left it
      OUTS.forEach(function (role) { setTank(m.P[role], null, 0) })
      insert(m.P.inBus, ICE, 16)
      setTank(m.P.in1, STEAM, 25600)
      begin(m, 'second_batch')
      return
    }
    if (m.phase === 'second_batch' && runOver(m, age, recipeOf(EXCHANGE).duration)) {
      var rec2 = recipeOf(EXCHANGE)
      var r2 = result(m)
      var problems2 = exchangeProblems(m, r2, rec2, rec2.energy)
      check('charge_reused', problems2.length === 0, 'second batch on the untouched charge -> ' + fluidSummary(r2.fluids) + '; charge ' + r2.in2.amount + ' mB ' +
        short(r2.in2.id) + '; ' + r2.eu + ' EU drawn | ' + state(m.ctrl) + (problems2.length > 0 ? ' | problems: ' + problems2.join('; ') : ''))
      m.phase = 'done'
    }
  }

  function chainStep(m, age) {
    if (m.phase === 'exchange_oc' && runOver(m, age, recipeOf(EXCHANGE).duration)) {
      var rec = recipeOf(EXCHANGE)
      var r = result(m)
      var ran = m.ran || {}
      var problems = exchangeProblems(m, r, rec, null)
      if (ran.eut !== rec.eut * 4 || !(Math.abs(ran.duration * 2 - rec.duration) <= 1)) problems.push('ran at ' + ran.eut + ' EU/t x ' + ran.duration + ' t (base ' + rec.eut + ' x ' + rec.duration + ')')
      if (r.eu !== ran.eut * ran.duration) problems.push(r.eu + ' EU drawn for ' + ran.eut + ' x ' + ran.duration)
      check('exchange_overclock', problems.length === 0, 'IV hatch: one overclock, ' + ran.eut + ' EU/t x ' + ran.duration + ' t (base ' + rec.eut + ' x ' + rec.duration +
        ') -> ' + fluidSummary(r.fluids) + '; charge after the run ' + r.in2.amount + ' mB ' + short(r.in2.id) + ' (taken once, not scaled); ' + r.eu + ' EU drawn | ' +
        state(m.ctrl) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      var made = r.fluids[CONC] || 0
      if (made < 1000) {
        check('PROCESS_finishing', false, 'the exchange made only ' + made + ' mB of concentrate')
        m.phase = 'done'
        return
      }
      // 1 000 mB of the concentrate the exchange just made, circuit 2; the H2S stays where it is
      m.concLeft = made - 1000
      OUTS.forEach(function (role) { setTank(m.P[role], null, 0) })
      setTank(m.P.in1, CONC, 1000)
      m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(2))
      begin(m, 'finishing')
      return
    }
    if (m.phase === 'finishing' && runOver(m, age, recipeOf(FINISHING).duration)) {
      var rec2 = recipeOf(FINISHING)
      var r2 = result(m)
      var ran2 = m.ran || {}
      var problems2 = []
      if (m.seen[rec2.recipeId] !== true) problems2.push(rec2.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
      if (!sameFluids(r2.fluids, WANT[FINISHING].fluidsOut)) problems2.push('fluids out ' + fluidSummary(r2.fluids))
      if (r2.in1.amount !== 0) problems2.push(r2.in1.amount + ' mB ' + short(r2.in1.id) + ' left')
      if (r2.in2.id !== H2S || r2.in2.amount !== 1000) problems2.push('H2S hatch ' + r2.in2.amount + ' mB ' + short(r2.in2.id))
      if (!(ran2.eut > 0) || r2.eu !== ran2.eut * ran2.duration || !(r2.eu >= rec2.energy)) problems2.push(r2.eu + ' EU drawn for ' + ran2.eut + ' x ' + ran2.duration)
      check('PROCESS_finishing', problems2.length === 0, '1 000 mB of the concentrate the exchange made, circuit 2 -> ' + fluidSummary(r2.fluids) + '; ran at ' + ran2.eut +
        ' EU/t x ' + ran2.duration + ' t (base ' + rec2.eut + ' x ' + rec2.duration + '), ' + r2.eu + ' EU drawn; H2S hatch ' + r2.in2.amount + ' mB, untouched | ' +
        state(m.ctrl) + (problems2.length > 0 ? ' | problems: ' + problems2.join('; ') : ''))
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
      var m = { copy: copy, phase: 'forming', seen: {}, seenWorking: false, euUsed: 0, eu0: 0, metered: false, ran: null }
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

  function start(m) {
    if (m.copy.key === 'base') {
      load(m, { phase: 'no_charge', circuit: 1, items: [[ICE, 16]], fluids: [[STEAM, 25600], null] })
    } else {
      load(m, { phase: 'exchange_oc', circuit: 1, items: [[ICE, 16]], fluids: [[STEAM, 25600], [H2S, 1000]] })
    }
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
      meter(m)
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

  // every tick: the energy the controller drew, and what it runs (the recipe as modified: overclocked EU/t and duration)
  function measure(m) {
    if (!m.ctrl || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
    meter(m)
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) {
      m.seenWorking = true
      m.seen[String(last.id)] = true
      if (m.ran === null) m.ran = { id: String(last.id), eut: inputEUt(last), duration: Number(last.duration), parallels: Number(last.parallels) }
    }
  }

  function step(m) {
    if (m.phase === 'forming') {
      formStep(m)
      return
    }
    var age = S.t - m.t0
    if (m.copy.key === 'base') baseStep(m, age)
    else chainStep(m, age)
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
      note('copies', 'skipped: the recipes cannot run without IV-A1\'s registrations')
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

  ServerEvents.customCommand('gg_test_heavy_water_plant', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_heavy_water_plant run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
