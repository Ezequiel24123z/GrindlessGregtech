// Gregtech Grindless - smoke test of package IV-A6, fluorspar-kiln (TEST-ONLY overlay: copied over the instance on the test PC, never shipped
// with the pack): IV's Fluorspar Kiln (gtceu:fluorspar_kiln and its recipe type gtceu:fluorspar_digestion),
// startup_scripts/grindless/iv/fluorspar_kiln.js and server_scripts/grindless/iv/fluorspar_kiln.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_fluorspar_kiln;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|fluorspar_kiln\|DONE@@900;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|fluorspar_kiln|<check>|PASS|FAIL|NOTE|<detail>
//   shared_ids          GCYR's fluorite dust, IV-A1's fluorite vein sample, GTM's gypsum, HF, sulfuric acid and water exist, and GTM's
//                       automatic electrolysis of fluorite is gone (IV-A1), so the kiln is the only way from fluorite to fluorine
//   registration        gtceu:fluorspar_kiln on its own type gtceu:fluorspar_digestion, not a generator, its modifier run before every
//                       recipe, with a structure description
//   charge              the published charge is the design's: 3 fluorite + 1 000 mB sulfuric acid + 2 000 mB water -> 2 000 mB HF + 8
//                       gypsum, 30 EU/t x 64 t
//   live_contents       the recipe manager holds exactly that recipe under grindless:fluorspar_digestion/hydrofluoric_acid_from_fluorite
//                       (items, both fluids, EU/t, duration, EMI data key), and it is the type's only recipe (nothing for GTM's lookup
//                       to hide)
//   reference           GTM's chemical_reactor/phosphoric_acid_from_apatite, read live, gives the same EU, ticks, water and gypsum per
//                       1 000 mB of sulfuric acid as a charge (1 920 EU, 64 t, 2 000 mB water, 8 gypsum)
//   controller_recipe   grindless:crafting/fluorspar_kiln exists and holds its parts
//   balance             NOTE: fluorite per naquadah pair and per LEU enrichment, gypsum per concrete
//   kiln_PLACED / _FORMED / _PARTS   the copy below
//   PROCESS_one         3 fluorite + 1 000 mB acid + 2 000 mB water -> exactly 2 000 mB HF and 8 gypsum, 1 charge, 64 t, exactly 1 920 EU
//   PROCESS_charges     12 fluorite + 4 000 mB acid + 8 000 mB water -> 8 000 mB HF and 32 gypsum in ONE run of 4 charges, 64 t at
//                       120 EU/t (an IV hatch could overclock it: the kiln does not), exactly 7 680 EU drawn
//   PROCESS_full        780 fluorite + 260 000 mB acid + 520 000 mB water (260 charges of each) -> one run of the 256-charge cap at
//                       7 680 EU/t (IV voltage), 64 t: exactly 512 000 mB HF (both output hatches full) and 2 048 gypsum, 491 520 EU
//                       drawn; 12 fluorite, 4 000 mB acid and 8 000 mB water stay in the inputs
//   no_voiding_fluids   the controller set to void fluids: refused (nothing used, no EU), and the refusal is shown
//   void_items_allowed  the controller set to void items: the charge runs (gypsum is inert), its HF in the hatch
//   fluorspar_kiln|DONE last line
//
// Copy (the controller faces west at x 11012, y 102, z 6; the kiln runs east behind it to the scrubber, x 11012-11027, z 5-8, y 100-105):
//   feed head, round the controller (seen from the front): energy hatch, input bus and the acid hatch along its bottom row, the water
//   hatch at its top left; the output bus under the kiln's hot end (scrubber front wall, bottom middle); the two output hatches at the
//   bottom corners of the scrubber's back wall. The acid hatch is a LuV input hatch (512 000 mB) and the water hatch a ZPM one
//   (1 024 000 mB) only so that one hatch of each holds more than 256 charges (an IV hatch holds 256 000 mB): the full phase shows the cap,
//   not a full tank, stopping the run. A player feeds the full load with one IV hatch of acid and two of water, or with ME hatches.
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 11008-11071, Y 98-112, Z 0-15 (AGENTS.md:
// tests run at the same time in one server), with a roof at Y 111 so no hatch is rained on. The structure comes from the description
// lib/patterns.js records (global.grindless.structures). Fluorite, sulfuric acid and water are injected: the fluorite vein and the acid
// lines are older, proven machines.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'fluorspar_kiln'
  var BAND = { x0: 11008, x1: 11071, y0: 98, y1: 112, z0: 0, z1: 15 }
  var ROOF_Y = 111
  var Y = 100
  var STEP = 10
  var FORM_TIMEOUT = 600
  var HOLD_TICKS = 60
  var SLACK = 120

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestFluorsparKilnRequest'

  var MACHINE = 'gtceu:fluorspar_kiln'
  var TYPE = 'gtceu:fluorspar_digestion'
  var RECIPE = 'grindless:fluorspar_digestion/hydrofluoric_acid_from_fluorite'
  var REFERENCE = 'gtceu:chemical_reactor/phosphoric_acid_from_apatite'
  var FACING = 'west'
  // world vectors for a controller facing west: the pattern's columns go to its left (south, +z), its slices to its front (west, -x)
  var COL_VEC = { x: 0, z: 1 }
  var FRONT_VEC = { x: -1, z: 0 }
  var ROLE_BLOCKS = {
    energy: 'gtceu:iv_energy_input_hatch',
    inBus: 'gtceu:iv_input_bus',
    // the acid and the water: tanks big enough for more than 256 charges (see the header)
    in1: 'gtceu:luv_input_hatch',
    in2: 'gtceu:zpm_input_hatch',
    outBus: 'gtceu:iv_output_bus',
    out1: 'gtceu:iv_output_hatch',
    out2: 'gtceu:iv_output_hatch'
  }
  var ROLE_FACING = { energy: 'west', inBus: 'west', in1: 'west', in2: 'west', outBus: 'west', out1: 'east', out2: 'east' }
  // 'slice,row,column' of the description (slice 0 = the scrubber's back wall, slice 15 = the feed head) -> role
  var PARTS = { '15,1,0': 'energy', '15,1,1': 'inBus', '15,1,2': 'in1', '15,3,0': 'in2', '2,0,1': 'outBus', '0,0,0': 'out1', '0,0,2': 'out2' }
  var INS = ['in1', 'in2']
  var OUTS = ['out1', 'out2']
  var COPY = { key: 'kiln', x: 11012, z: 6 }

  var FLUORITE = 'gcyr:fluorite_dust'
  var GYPSUM = 'gtceu:gypsum_dust'
  var ACID = 'gtceu:sulfuric_acid'
  var WATER = 'minecraft:water'
  var HF = 'gtceu:hydrofluoric_acid'
  var SAMPLE = 'grindless:vein_sample_fluorite'
  var FLUORITE_ELECTROLYSIS = 'gtceu:electrolyzer/decomposition_electrolyzing_fluorite'
  var NO_VOIDING = /grindless\.machine\.fluorspar_kiln\.no_voiding|Turn fluid voiding off/

  // the design (docs/eras/iv.md, "Fluorspar kiln", the package statement and the orchestrator's water)
  var WANT = { fluorite: 3, acid: 1000, water: 2000, hf: 2000, gypsum: 8, eut: 30, duration: 64, energy: 1920, cap: 256 }

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
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
      }
    }
    return classes
  }

  function FK() {
    return global.grindless.fluorsparKiln || {}
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
    return String(id).replace(/^(gtceu|grindless|minecraft|gcyr):/, '')
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

  // inserts n of an item, slot after slot
  function insert(bus, id, n) {
    var inv = bus.getInventory()
    var left = n
    for (var s = 0; s < inv.getSlots() && left > 0; s++) {
      var rest = inv.insertItem(s, Item.of(id, Math.min(left, 64)), false)
      left -= Math.min(left, 64) - (rest.isEmpty() ? 0 : Number(rest.getCount()))
    }
    if (left > 0) throw new Error('could only insert ' + (n - left) + ' of ' + n + ' ' + id)
  }

  function summary(counts) {
    var keys = Object.keys(counts)
    return keys.length === 0 ? 'empty' : keys.map(function (k) { return short(k) + ' x' + counts[k] }).join(', ')
  }

  function sumTanks(m, roles) {
    var t = {}
    roles.forEach(function (role) {
      var info = tankInfo(m.P[role])
      if (info.amount > 0) t[info.id] = (t[info.id] || 0) + info.amount
    })
    return t
  }

  function fluidSummary(t) {
    var keys = Object.keys(t)
    return keys.length === 0 ? 'none' : keys.map(function (k) { return short(k) + ' ' + t[k] + ' mB' }).join(', ')
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

  // the item contents of one side of a GT recipe, with their chance: [{ id, count, chance }]
  function itemContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.ItemCap) : recipe.getOutputContents(c.ItemCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputItems(recipe) : c.RecipeHelper.getOutputItems(recipe))
    return stacks.map(function (st, i) {
      return { id: itemName(st), count: Number(st.getCount()), chance: Number(contents[i].chance) }
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
    var problems = []
    ;[FLUORITE, GYPSUM, SAMPLE].forEach(function (id) { if (!Item.exists(id)) problems.push(id + ' missing') })
    ;[ACID, WATER, HF].forEach(function (id) { if (!Fluid.exists(id)) problems.push(id + ' missing') })
    if (liveRecipe(FLUORITE_ELECTROLYSIS) !== null) problems.push(FLUORITE_ELECTROLYSIS + ' exists (a fluorine route around the kiln)')
    check('shared_ids', problems.length === 0, problems.length === 0 ? 'fluorite dust, the fluorite vein sample, gypsum, HF, sulfuric acid and water ' +
      'exist; no automatic electrolysis of fluorite' : problems.join('; '))
    return [FLUORITE, GYPSUM].every(function (id) { return Item.exists(id) }) && [ACID, WATER, HF].every(function (id) { return Fluid.exists(id) })
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
      if (def.isAlwaysTryModifyRecipe() !== true) problems.push('the modifier is not run before every recipe')
      if (!global.grindless.patterns.describe(MACHINE)) problems.push('no structure description')
      if (FK().maxCharges !== WANT.cap) problems.push('cap ' + FK().maxCharges)
      check('registration', problems.length === 0, MACHINE + ': types=[' + types.join(',') + '] generator=' + def.isGenerator() +
        ' alwaysTryModifyRecipe=' + def.isAlwaysTryModifyRecipe() + ' cap=' + FK().maxCharges + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('charge', function () {
      var c = FK().charge || {}
      var ok = c.recipeId === RECIPE && c.fluorite && c.fluorite.id === FLUORITE && c.fluorite.count === WANT.fluorite && c.acid.id === ACID &&
        c.acid.amount === WANT.acid && c.water && c.water.id === WATER && c.water.amount === WANT.water && c.hf.id === HF && c.hf.amount === WANT.hf &&
        c.gypsum.id === GYPSUM && c.gypsum.count === WANT.gypsum && c.eut === WANT.eut && c.duration === WANT.duration && c.energy === WANT.energy
      check('charge', ok === true, JSON.stringify(c))
    })

    safely('live_contents', function () {
      var problems = []
      var r = liveRecipe(RECIPE)
      if (r === null) throw new Error(RECIPE + ' is not in the recipe manager (added: ' + JSON.stringify(FK().recipes) + ')')
      var ins = itemContents(r, true)
      var outs = itemContents(r, false)
      var fin = fluidContents(r, true)
      var fout = fluidContents(r, false)
      var finKey = fin.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
      var finWant = [ACID + ' ' + WANT.acid, WATER + ' ' + WANT.water].sort().join(',')
      if (ins.length !== 1 || ins[0].id !== FLUORITE || ins[0].count !== WANT.fluorite || ins[0].chance !== 10000) problems.push('items in ' + JSON.stringify(ins))
      if (outs.length !== 1 || outs[0].id !== GYPSUM || outs[0].count !== WANT.gypsum || outs[0].chance !== 10000) problems.push('items out ' + JSON.stringify(outs))
      if (fin.length !== 2 || finKey !== finWant) problems.push('fluids in ' + JSON.stringify(fin))
      if (fout.length !== 1 || fout[0].id !== HF || fout[0].amount !== WANT.hf) problems.push('fluids out ' + JSON.stringify(fout))
      var eut = inputEUt(r)
      if (eut !== WANT.eut || Number(r.duration) !== WANT.duration) problems.push(eut + ' EU/t x ' + r.duration + ' t')
      var key = String(r.data.getString(FK().dataKey))
      if (key !== 'hydrofluoric_acid_from_fluorite') problems.push('data ' + FK().dataKey + '=' + key)
      var all = asArray(S.server.getRecipeManager().getAllRecipesFor(GTRegistries.RECIPE_TYPES.get(rl(TYPE)))).map(function (x) { return String(x.getId()) })
      if (all.length !== 1 || all[0] !== RECIPE) problems.push('the type holds [' + all.join(', ') + ']')
      check('live_contents', problems.length === 0, RECIPE + ': ' + ins.map(function (x) { return x.count + ' ' + short(x.id) }).concat(fin.map(function (f) {
        return f.amount + ' mB ' + short(f.id) })).join(' + ') + ' -> ' + fout.map(function (f) { return f.amount + ' mB ' + short(f.id) }).concat(outs.map(function (x) {
        return x.count + ' ' + short(x.id) })).join(' + ') + ', ' + eut + ' EU/t x ' + r.duration + ' t; the type holds ' + all.length + ' recipe(s)' +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('reference', function () {
      var r = liveRecipe(REFERENCE)
      if (r === null) throw new Error(REFERENCE + ' is not in the recipe manager')
      var fluids = fluidContents(r, true)
      var acid = fluids.filter(function (f) { return f.id.indexOf('sulfuric_acid') >= 0 })[0]
      // GTM's recipe takes the forge:water tag: its first fluid is vanilla water
      var water = fluids.filter(function (f) { return f.id.indexOf('water') >= 0 && f.id.indexOf('distilled') < 0 })[0]
      var gyp = itemContents(r, false).filter(function (x) { return x.id === GYPSUM })[0]
      if (!acid || !water || !gyp) throw new Error('no sulfuric acid, water or gypsum in ' + REFERENCE + ': ' + JSON.stringify(fluids) + ' ' + JSON.stringify(itemContents(r, false)))
      var per = acid.amount / 1000
      var eu = inputEUt(r) * Number(r.duration) / per
      var ticks = Number(r.duration) / per
      var gypsum = gyp.count / per
      var wat = water.amount / per
      check('reference', eu === WANT.energy && ticks === WANT.duration && gypsum === WANT.gypsum && wat === WANT.water && inputEUt(r) === WANT.eut, REFERENCE + ': ' +
        acid.amount + ' mB acid + ' + water.amount + ' mB ' + short(water.id) + ', ' + inputEUt(r) + ' EU/t x ' + r.duration + ' t, ' + gyp.count + ' gypsum -> per 1 000 mB: ' +
        eu + ' EU, ' + ticks + ' t, ' + wat + ' mB water, ' + gypsum + ' gypsum (a charge: ' + WANT.energy + ' EU, ' + WANT.duration + ' t, ' + WANT.water + ' mB water, ' +
        WANT.gypsum + ' gypsum)')
    })

    safely('controller_recipe', function () {
      var r = liveRecipe(FK().craftingRecipe)
      if (r === null) throw new Error(FK().craftingRecipe + ' missing')
      var out = String(r.getResultItem(S.server.registryAccess()).getId())
      var ids = {}
      asArray(r.getIngredients()).forEach(function (ing) {
        asArray(ing.getItemIds()).forEach(function (id) { ids[String(id)] = true })
      })
      var missing = (FK().craftingParts || []).filter(function (id) { return id !== MACHINE && !ids[id] })
      check('controller_recipe', out === MACHINE && missing.length === 0 && (FK().craftingParts || []).length === 5, FK().craftingRecipe + ' -> ' + out +
        ' from [' + Object.keys(ids).map(short).join(', ') + ']' + (missing.length > 0 ? ' | missing: ' + missing.join(',') : ''))
    })

    safely('balance', function () {
      var perCharge = WANT.hf
      var naquadah = Math.ceil(40500 / perCharge)
      var enrichment = Math.ceil(40000 / perCharge)
      note('balance', 'a charge: ' + WANT.fluorite + ' fluorite + ' + WANT.acid + ' mB acid + ' + WANT.water + ' mB water -> ' + perCharge + ' mB HF (' + perCharge +
        ' mB of fluorine) + ' + WANT.gypsum + ' gypsum for ' + WANT.energy + ' EU; the naquadah plant\'s 40 500 mB of fluorine per 2 naquadah = ' + naquadah +
        ' charges (' + naquadah * WANT.fluorite + ' fluorite); one LEU enrichment\'s 40 000 mB HF = ' + enrichment + ' charges (' + enrichment * WANT.fluorite +
        ' fluorite, ' + enrichment * WANT.water + ' mB water, ' + enrichment * WANT.gypsum + ' gypsum = ' + enrichment * WANT.gypsum * 1152 +
        ' mB of GTM concrete); at the cap, one IV hatch: ' + WANT.cap * perCharge + ' mB HF per ' + WANT.duration + ' t')
    })
  }

  // ---------------------------------------------------------------- structure

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

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top, columns to the controller's left (GTM's
  // FactoryBlockPattern.start(): LEFT, UP, FRONT); for a controller facing west the columns run south (+z) and the slices west (-x), so the
  // structure lies east of it
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
          var dc = ci - ctrl.ci
          var ds = si - ctrl.si
          var c = { x: copy.x + dc * COL_VEC.x + ds * FRONT_VEC.x, y: cy + (ri - ctrl.ri), z: copy.z + dc * COL_VEC.z + ds * FRONT_VEC.z, ch: ch,
            id: null, props: '', role: null }
          var role = PARTS[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = MACHINE
            c.props = '[facing=' + FACING + ']'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (role !== undefined) {
            c.id = ROLE_BLOCKS[role]
            c.props = '[facing=' + ROLE_FACING[role] + ']'
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
    var box = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 }
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
      box.x0 = Math.min(box.x0, c.x); box.x1 = Math.max(box.x1, c.x)
      box.y0 = Math.min(box.y0, c.y); box.y1 = Math.max(box.y1, c.y)
      box.z0 = Math.min(box.z0, c.z); box.z1 = Math.max(box.z1, c.z)
    })
    var inBand = box.x0 >= BAND.x0 && box.x1 <= BAND.x1 && box.y0 >= BAND.y0 && box.y1 < ROOF_Y && box.z0 >= BAND.z0 && box.z1 <= BAND.z1
    var bill = Object.keys(tally).sort().map(function (id) { return short(id) + ' x' + tally[id] }).join(', ')
    check(m.copy.key + '_PLACED', failed.length === 0 && wrong.length === 0 && inBand, plan.cells.length + ' blocks, ' + plan.width + 'x' + plan.height + 'x' +
      plan.depth + ' (w x h x d), x ' + box.x0 + '-' + box.x1 + ' y ' + box.y0 + '-' + box.y1 + ' z ' + box.z0 + '-' + box.z1 + ', controller ' + m.ctrlPos.x + ',' +
      m.ctrlPos.y + ',' + m.ctrlPos.z + ' bill=[' + bill + ']' + (inBand ? '' : ' | outside the band') +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0 && inBand
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

  // ---------------------------------------------------------------- the copy

  function setVoiding(m, mode) {
    m.ctrl.setVoidingMode(lazy().VoidingMode[mode])
    wake(m.ctrl)
  }

  // the energy hatch is topped up every tick; what it lost since the last tick is what the kiln drew
  function meter(m) {
    var c = m.P.energy.energyContainer
    var cap = Number(c.getEnergyCapacity())
    var stored = Number(c.getEnergyStored())
    if (m.metered) m.euUsed += cap - stored
    c.setEnergyStored(cap)
    m.metered = true
  }

  // empties every part and starts a scenario: items into the input bus, fluids into the input hatches (one entry per hatch)
  function load(m, sc) {
    emptyBus(m.P.inBus)
    emptyBus(m.P.outBus)
    INS.forEach(function (role) { setTank(m.P[role], null, 0) })
    OUTS.forEach(function (role) { setTank(m.P[role], null, 0) })
    ;(sc.items || []).forEach(function (x) { insert(m.P.inBus, x[0], x[1]) })
    ;(sc.fluids || []).forEach(function (f, i) { setTank(m.P[INS[i]], f[0], f[1]) })
    begin(m, sc.phase)
  }

  function begin(m, phase) {
    m.phase = phase
    m.t0 = S.t
    m.seen = {}
    m.seenWorking = false
    m.runs = 0
    m.maxParallels = 0
    m.durations = {}
    m.eutSeen = 0
    m.eu0 = m.euUsed
    wake(m.ctrl)
  }

  function runOver(m, age, duration) {
    return (m.seenWorking && statusOf(m.ctrl) === 'IDLE') || age >= duration + SLACK
  }

  // what a run left: items in the output bus, fluids in the output hatches, what is still in the inputs and the EU drawn
  function result(m) {
    return {
      out: readBus(m.P.outBus),
      fluids: sumTanks(m, OUTS),
      left: readBus(m.P.inBus),
      tanks: sumTanks(m, INS),
      eu: m.euUsed - m.eu0
    }
  }

  // a scenario's checks: charges = the charges it must run in ONE run, leftCharges = what must stay in the inputs
  function runProblems(m, r, charges, leftCharges) {
    var problems = []
    var c = FK().charge || {}
    if (m.seen[RECIPE] !== true) problems.push(RECIPE + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
    if (m.runs !== 1) problems.push(m.runs + ' runs, want 1')
    if (m.maxParallels !== charges) problems.push(m.maxParallels + ' charges, want ' + charges)
    var durations = Object.keys(m.durations)
    if (durations.length !== 1 || Number(durations[0]) !== WANT.duration) problems.push('durations [' + durations.join(',') + '] (no overclock: ' + WANT.duration + ')')
    if (m.eutSeen !== charges * WANT.eut) problems.push(m.eutSeen + ' EU/t, want ' + charges * WANT.eut)
    if ((r.out[GYPSUM] || 0) !== charges * WANT.gypsum || Object.keys(r.out).length !== 1) problems.push('items out ' + summary(r.out))
    if ((r.fluids[HF] || 0) !== charges * WANT.hf || Object.keys(r.fluids).length !== 1) problems.push('fluids out ' + fluidSummary(r.fluids))
    var leftItems = r.left[FLUORITE] || 0
    var leftAcid = r.tanks[ACID] || 0
    var leftWater = r.tanks[WATER] || 0
    if (leftItems !== leftCharges * WANT.fluorite || leftAcid !== leftCharges * WANT.acid || leftWater !== leftCharges * WANT.water ||
      Object.keys(r.left).length > (leftCharges > 0 ? 1 : 0) || Object.keys(r.tanks).length > (leftCharges > 0 ? 2 : 0)) {
      problems.push('left ' + summary(r.left) + ', ' + fluidSummary(r.tanks))
    }
    if (r.eu !== charges * WANT.energy) problems.push(r.eu + ' EU drawn, want ' + charges * WANT.energy)
    if (c.energy !== WANT.energy) problems.push('published charge ' + c.energy + ' EU')
    return problems
  }

  function runDetail(m, r) {
    return '[' + summary(r.out) + '], ' + fluidSummary(r.fluids) + '; ' + m.runs + ' run(s) of ' + m.maxParallels + ' charge(s), ' + Object.keys(m.durations).join('/') +
      ' t at ' + m.eutSeen + ' EU/t; ' + r.eu + ' EU drawn; left [' + summary(r.left) + '], ' + fluidSummary(r.tanks) + ' | ' + state(m.ctrl)
  }

  // nothing ran since the scenario began: the fluorite, the acid and the water are untouched and no EU was drawn
  function stillBlocked(m) {
    var t = sumTanks(m, INS)
    return (t[ACID] || 0) === WANT.acid && (t[WATER] || 0) === WANT.water && (readBus(m.P.inBus)[FLUORITE] || 0) === WANT.fluorite &&
      m.euUsed === m.eu0 && Object.keys(m.seen).length === 0
  }

  function blockedDetail(m) {
    var t = sumTanks(m, INS)
    return (t[ACID] || 0) + ' mB acid and ' + (t[WATER] || 0) + ' mB water left, ' + (readBus(m.P.inBus)[FLUORITE] || 0) + ' fluorite in the bus, ' +
      (m.euUsed - m.eu0) + ' EU, ran [' + Object.keys(m.seen).join(',') + '] | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']'
  }

  function kilnStep(m, age) {
    if (m.phase === 'one' && runOver(m, age, WANT.duration)) {
      var r = result(m)
      var problems = runProblems(m, r, 1, 0)
      check('PROCESS_one', problems.length === 0, '3 fluorite + 1 000 mB acid + 2 000 mB water -> ' + runDetail(m, r) +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      load(m, { phase: 'charges', items: [[FLUORITE, 12]], fluids: [[ACID, 4000], [WATER, 8000]] })
      return
    }
    if (m.phase === 'charges' && runOver(m, age, WANT.duration)) {
      var r2 = result(m)
      var problems2 = runProblems(m, r2, 4, 0)
      check('PROCESS_charges', problems2.length === 0, '12 fluorite + 4 000 mB acid + 8 000 mB water, one IV energy hatch -> ' + runDetail(m, r2) +
        (problems2.length > 0 ? ' | problems: ' + problems2.join('; ') : ''))
      // 260 charges of every input: the cap (256) runs, 4 stay; both IV output hatches (2 x 256 000 mB) take exactly 256 charges of HF
      load(m, { phase: 'full', items: [[FLUORITE, 780]], fluids: [[ACID, 260000], [WATER, 520000]] })
      return
    }
    if (m.phase === 'full' && runOver(m, age, WANT.duration)) {
      var r3 = result(m)
      var problems3 = runProblems(m, r3, WANT.cap, 4)
      check('PROCESS_full', problems3.length === 0, '780 fluorite + 260 000 mB acid + 520 000 mB water (260 charges), one IV energy hatch -> ' + runDetail(m, r3) +
        (problems3.length > 0 ? ' | problems: ' + problems3.join('; ') : ''))
      setVoiding(m, 'VOID_FLUIDS')
      load(m, { phase: 'void_fluids', items: [[FLUORITE, WANT.fluorite]], fluids: [[ACID, WANT.acid], [WATER, WANT.water]] })
      return
    }
    if (m.phase === 'void_fluids' && age >= HOLD_TICKS) {
      var shown = failureReasons(m.ctrl).some(function (x) { return NO_VOIDING.test(x) })
      check('no_voiding_fluids', stillBlocked(m) && shown, 'controller set to void fluids: refusal shown=' + shown + ', ' + blockedDetail(m))
      setVoiding(m, 'VOID_ITEMS')
      begin(m, 'void_items')
      return
    }
    if (m.phase === 'void_items' && runOver(m, age, WANT.duration)) {
      var r4 = result(m)
      var problems4 = runProblems(m, r4, 1, 0)
      check('void_items_allowed', problems4.length === 0, 'controller set to void items (gypsum is inert): ' + runDetail(m, r4) +
        (problems4.length > 0 ? ' | problems: ' + problems4.join('; ') : ''))
      setVoiding(m, 'VOID_NONE')
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
      load(m, { phase: 'one', items: [[FLUORITE, WANT.fluorite]], fluids: [[ACID, WANT.acid], [WATER, WANT.water]] })
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

  // every tick: the energy the controller drew, and what it runs (a new run = WORKING with its progress back near the start)
  function measure(m) {
    if (!m.ctrl || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
    meter(m)
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    var working = String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined
    if (working) {
      var progress = Number(rlg.getProgress())
      if (!m.wasWorking || progress < m.lastProgress) m.runs++
      m.lastProgress = progress
      m.seenWorking = true
      m.seen[String(last.id)] = true
      m.maxParallels = Math.max(m.maxParallels, Number(last.parallels))
      m.durations[String(rlg.getDuration())] = true
      m.eutSeen = Math.max(m.eutSeen, inputEUt(last))
    }
    m.wasWorking = working
  }

  function step(m) {
    if (m.phase === 'forming') {
      formStep(m)
      return
    }
    kilnStep(m, S.t - m.t0)
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    var m = S.copy
    try {
      measure(m)
      if (m.phase === 'forming' ? S.t % STEP === 0 : true) step(m)
    } catch (e) {
      check(m.copy.key + '_STEP', false, 'exception in ' + m.phase + ': ' + e)
      m.phase = 'done'
    }
    if (m.phase === 'done') finish()
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
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), copy: null, finished: false }
    var shared = false
    try {
      shared = sharedIdsPresent()
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    if (!shared) {
      note('copy', 'skipped: the recipe cannot run without fluorite, gypsum, HF and sulfuric acid')
      finish()
      return
    }
    try {
      prepareWorld()
    } catch (e2) {
      check('AREA', false, 'exception: ' + e2)
    }
    var m = { copy: COPY, phase: 'forming', seen: {}, seenWorking: false, euUsed: 0, eu0: 0, metered: false, runs: 0, maxParallels: 0, durations: {},
      eutSeen: 0, wasWorking: false, lastProgress: 0 }
    S.copy = m
    try {
      if (!place(m)) m.phase = 'done'
    } catch (e3) {
      check(COPY.key + '_PLACED', false, 'exception: ' + e3)
      m.phase = 'done'
    }
    S.t0 = S.t
    if (m.phase === 'done') finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_fluorspar_kiln', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_fluorspar_kiln run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
