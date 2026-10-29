// priority: -4224
// Gregtech Grindless - smoke test of package LuV-A3, luv-cryogenics (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): LuV's Helium Refrigerator (gtceu:helium_refrigerator, recipe type gtceu:closed_loop_cooling) and Coated
// Conductor Line (gtceu:coated_conductor_line, recipe type gtceu:coated_conductor): startup_scripts/grindless/luv/helium_refrigerator.js
// and coated_conductor_line.js, their server scripts in server_scripts/grindless/luv/, and data/grindless/tables/helium_refrigerator.json
// and coated_conductor_line.json.
//
// Prepared for LuV's single integrated bench run; it is not meant to get a run of its own. On its own it would be:
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_luv_cryogenics' -WaitForLog 'GGTEST\|luv_cryogenics\|DONE@@180'
// With the lookup guard (it walks every GT recipe type, closed_loop_cooling and coated_conductor included, with no list to update):
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_luv_cryogenics;;kubejs custom_command gg_test_recipe_lookup' `
//     -WaitForLog 'GGTEST\|luv_cryogenics\|DONE@@180;;GGTEST\|lookup\|DONE@@180'
// In the integrated candidate: add 'kubejs custom_command gg_test_luv_cryogenics' to -Commands and 'GGTEST\|luv_cryogenics\|DONE@@180' to
// -WaitForLog (before any @restart).
//
// Markers: GGTEST|luv_cryogenics|<check>|PASS|FAIL|NOTE|<detail>
//   registration          both machines are registered on their own recipe types (both types registered, not generators), have a
//                         structure description of the design's size (refrigerator 8 x 9 x 5, line 21 x 4 x 3) whose part cells take
//                         the parallel hatch, and are in global.grindless.parallelHatch.machines; LuV-A1's grindless:nickel_tungsten_tape
//                         and grindless:itbtc_coated_conductor exist
//   controller_recipes    grindless:assembly_line/helium_refrigerator and grindless:assembly_line/coated_conductor_line exist, make their controller
//                         and hold their parts
//   hr_recipes            heliumRefrigerator.recipes is not empty, nothing skipped, and it is exactly one recipe per live vacuum freezer
//                         recipe that takes liquid helium (same sources); every one is in the recipe manager under its recipeId with its
//                         contents (the hot ingot, or the molten metal and the mold at chance 0; 25 mB helium + 50 mB liquid nitrogen
//                         consumed; the 4,000 mB helium charge at chance 0; the ingot + 50 mB nitrogen out), EU/t, duration and data key,
//                         priced from its live source recipe; as many live closed_loop_cooling recipes as published
//   hr_rate               the liquefaction rate was read from the live gtceu:vacuum_freezer/liquid_helium (rate.from is not 'table') and
//                         equals that recipe's EU per mB of liquid helium
//   ccl_recipes           coatedConductorLine.recipes holds the two table recipes on circuits 1 and 2, nothing skipped, no clashes; both
//                         live under their recipeId with their contents, circuit, EU/t, duration and data key; c1 makes the tape c2 takes
//   no_recycling          no gtceu:macerator, gtceu:arc_furnace or gtceu:extractor recipe takes the tape or the coated conductor (spike
//                         S0-5's property for A3: the tape carries no GTM material info, so GTM generates no recycling for it)
//   hr_picks              NOTE: the three refrigerator recipes the runs use (two hot ingots, one molten metal; see PICKS)
//   hr_PLACED / hr_FORMED / hr_PARTS     the refrigerator (one LuV energy hatch, IV buses and hatches, a LuV parallel hatch) forms and
//                         reads its parts; the controller reads the parallel hatch
//   ccl_PLACED / ccl_FORMED / ccl_PARTS  the coated conductor line (two LuV energy hatches: ZPM voltage, so both steps overclock) forms
//   hr_refuses_short_charge  the first hot ingot + 50 mB liquid nitrogen + only 4,000 mB liquid helium (the charge, no make-up): no run
//                         starts in HOLD_TICKS (nothing used, no EU, no output)
//   hr_charge_line        the controller's helium line (HR.display) reads 4,000 mB as low, and 4,025 mB as enough to start; HR.chargeIn
//                         agrees with the hatch
//   hr_run_hot1 / hr_run_hot2 / hr_run_molten   one run each with 4,025 mB liquid helium + 50 mB liquid nitrogen (+ the hot ingot, or
//                         144 mB molten metal and the mold): the ingot in the output bus, exactly 50 mB nitrogen out, exactly 25 mB helium
//                         used (the 4,000 mB charge still in its hatch), the nitrogen and the metal used up, the mold still in the bus,
//                         one copy, the EU drawn equal to the run's EU/t x duration
//   hr_parallel_x2        2 hot ingots + 100 mB liquid nitrogen + 4,050 mB liquid helium with the LuV parallel hatch: one run of 2 copies,
//                         2 ingots and 100 mB nitrogen out, exactly 50 mB helium used: the charge is needed once, not per copy
//   ccl_run_substrate     circuit 1: 19 nickel dust + 1 tungsten dust -> 20 nickel-tungsten tape (the table's figures)
//   ccl_run_tape          circuit 2: 16 of that tape + 1 ITBTC dust + 1,000 mB oxygen + 36 mB silver -> 16 ITBTC coated conductor
//   AREA / CLEANUP        NOTE: the band prepared, and cleared at the end
//   luv_cryogenics|DONE   last line
//
// Run length (in-game, after the command): static checks in one tick; both structures form in ~20 ticks; then, side by side, the
// refrigerator (60-tick refusal hold, three runs at 1,920 EU/t overclocked twice on LuV: ~18, ~27 and ~17 ticks, and the x2 run: ~36
// ticks) and the line (c1 overclocked twice: ~100 ticks, c2 once: ~150 ticks). About 15 s in all; every wait is capped at the recipe's
// base duration + SLACK.
//
// Copies (controllers face north at z 2, the structures are behind them, z 2-6):
//   hr   controller 15112,99,2: X 15107-15114, Y 98-106, Z 2-6. Parts in the cold box's floor ring, row 0: front face (facing north), left
//        to right seen from the front: LuV energy hatch, input bus, (casing), output bus, input hatch 1 (molten metal); back face (facing
//        south): input hatch 2 (liquid helium: charge + make-up), input hatch 3 (liquid nitrogen), (casing), output hatch (nitrogen),
//        LuV parallel hatch.
//   ccl  controller 15140,100,2: X 15131-15151, Y 98-101, Z 2-4. Parts in the bed's front row (facing north), columns 8-14: LuV energy
//        hatch, LuV energy hatch, input bus, (casing under the controller), input hatch 1 (oxygen), input hatch 2 (silver), output bus.
// TEST AREA: this test builds, force-loads and clears ONLY X 15104-15167, Y 98-112, Z 0-15 of the overworld (its band is X 15104-15167,
// Z 0-63; AGENTS.md: tests run at the same time in one server), under a roof at Y 112 so no hatch is rained on, and clears it again at the
// end (blocks, dropped items, force-load). The structures come from the descriptions lib/patterns.js records (global.grindless.structures).
// Ingredients, fluids and EU are injected: the helium (the Moon), the liquid nitrogen (the EV cryogenic plant), the metals and the dusts
// come from other packages.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'luv_cryogenics'
  var BAND = { x0: 15104, x1: 15167, y0: 98, y1: 112, z0: 0, z1: 15 }
  var ROOF_Y = 112
  var Y = 98
  var STEP = 10
  var FORM_TIMEOUT = 600
  var HOLD_TICKS = 60
  var SLACK = 120

  // the command only leaves a request in `global` (a boolean: it survives script reloads); the tick handler starts the test once these
  // scripts have been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLuvCryogenicsRequest'

  var HR_MACHINE = 'gtceu:helium_refrigerator'
  var HR_TYPE = 'gtceu:closed_loop_cooling'
  var CCL_MACHINE = 'gtceu:coated_conductor_line'
  var CCL_TYPE = 'gtceu:coated_conductor'
  var TAPE = 'grindless:nickel_tungsten_tape'
  var CONDUCTOR = 'grindless:itbtc_coated_conductor'
  var RECYCLING_TYPES = ['gtceu:macerator', 'gtceu:arc_furnace', 'gtceu:extractor']
  var CHARGE_LOW = /helium_refrigerator\.charge\.low/
  var CHARGE_OK = /helium_refrigerator\.charge\.ok/
  // the design's sizes (docs/eras/luv.md): width x height x depth
  var SIZES = {}
  SIZES[HR_MACHINE] = '8x9x5'
  SIZES[CCL_MACHINE] = '21x4x3'

  // the refrigerator recipes the runs use (names in global.grindless.heliumRefrigerator.recipes): short 1,920 EU/t ones of GTM's own
  // materials (dump of 2026-10-25: 73, 107 and 68 t at 1,920 EU/t). If one is missing, the shortest of its kind at <= PICK_MAX_EUT stands in.
  var PICKS = [
    { key: 'hot1', kind: 'hot', name: 'cool_hot_mar_m_200_steel_ingot' },
    { key: 'hot2', kind: 'hot', name: 'cool_hot_samarium_ingot' },
    { key: 'molten', kind: 'molten', name: 'indium_tin_barium_titanium_cuprate' }
  ]
  var PICK_MAX_EUT = 1920

  // the copies: role blocks, where the parts go ('slice,row,column' of the description, slice 0 = the back face) and the parts' facing
  // per slice
  var COPIES = [
    {
      key: 'hr', machine: HR_MACHINE, x: 15112, z: 2,
      blocks: { energy: 'gtceu:luv_energy_input_hatch', inBus: 'gtceu:iv_input_bus', outBus: 'gtceu:iv_output_bus', in1: 'gtceu:iv_input_hatch',
        in2: 'gtceu:iv_input_hatch', in3: 'gtceu:iv_input_hatch', out1: 'gtceu:iv_output_hatch', parallel: 'gtceu:luv_parallel_hatch' },
      parts: { '4,0,0': 'energy', '4,0,1': 'inBus', '4,0,3': 'outBus', '4,0,4': 'in1', '0,0,0': 'in2', '0,0,1': 'in3', '0,0,3': 'out1', '0,0,4': 'parallel' },
      facing: { 0: 'south', 4: 'north' },
      ins: ['in1', 'in2', 'in3'], outs: ['out1']
    },
    {
      key: 'ccl', machine: CCL_MACHINE, x: 15140, z: 2,
      blocks: { energy: 'gtceu:luv_energy_input_hatch', energy2: 'gtceu:luv_energy_input_hatch', inBus: 'gtceu:iv_input_bus', in1: 'gtceu:iv_input_hatch',
        in2: 'gtceu:iv_input_hatch', outBus: 'gtceu:iv_output_bus' },
      parts: { '2,0,8': 'energy', '2,0,9': 'energy2', '2,0,10': 'inBus', '2,0,12': 'in1', '2,0,13': 'in2', '2,0,14': 'outBus' },
      facing: { 2: 'north' },
      ins: ['in1', 'in2'], outs: []
    }
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

  function problemsText(problems) {
    return problems.length > 0 ? ' | problems: ' + problems.slice(0, 10).join('; ') + (problems.length > 10 ? ' and ' + (problems.length - 10) + ' more' : '') : ''
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
        AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
        ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity')
      }
    }
    return classes
  }

  function HRP() {
    return global.grindless.heliumRefrigerator || {}
  }

  function CCLP() {
    return global.grindless.coatedConductorLine || {}
  }

  // the refrigerator's table as the startup script read it, or GTM 7.5.3's defaults (the server script's fallback)
  function hrConfig() {
    if (HRP().config) return HRP().config
    return {
      source: { type: 'gtceu:vacuum_freezer', coolant: 'gtceu:liquid_helium', returned: 'gtceu:helium' },
      makeUp: { id: 'gtceu:liquid_helium', amount: 25 },
      precoolIn: { id: 'gtceu:liquid_nitrogen', amount: 50 },
      precoolOut: { id: 'gtceu:nitrogen', amount: 50 },
      charge: { id: 'gtceu:liquid_helium', amount: 4000 },
      reliquefaction: { recipe: 'gtceu:vacuum_freezer/liquid_helium', fallbackEuPerMb: 460.8, precoolFactor: 0.5 },
      minEUt: 1920
    }
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

  // exactly these items in exactly these counts ({ id: count })
  function sameCounts(got, want) {
    var keys = Object.keys(got).concat(Object.keys(want))
    return keys.every(function (k) { return (got[k] || 0) === (want[k] || 0) })
  }

  function outFluids(m) {
    var t = {}
    m.copy.outs.forEach(function (role) {
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

  function liveOfType(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    if (type === null || type === undefined) return null
    return asArray(S.server.getRecipeManager().getAllRecipesFor(type))
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

  function whole(x) {
    return x.chance >= x.maxChance
  }

  function failureReasons(ctrl) {
    try {
      return asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }

  // the refrigerator's own controller line (startup script), read as text: on the server it is the translation key and its arguments
  function chargeLine(ctrl) {
    var list = new (lazy().ArrayList)()
    HRP().display(ctrl, list)
    return asArray(list).map(function (c) {
      var args = []
      try {
        var raw = c.getContents().getArgs()
        for (var i = 0; i < raw.length; i++) args.push(String(raw[i]))
      } catch (e) { /* plain text */ }
      return String(c.getString()) + (args.length > 0 ? ' [' + args.join(', ') + ']' : '')
    }).join(' / ')
  }

  function chargeHeld(ctrl) {
    try {
      return Number(HRP().chargeIn(ctrl))
    } catch (e) {
      return 'unreadable (' + e + ')'
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
        ' last=' + (last ? last.id + ' x' + last.parallels : 'none')
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  function cclRecipe(circuit) {
    return (CCLP().recipes || []).filter(function (r) { return r.circuit === circuit })[0] || null
  }

  // ---------------------------------------------------------------- static checks

  function sizeOf(desc) {
    return desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length
  }

  // the part-cell symbols of a description that take the parallel hatch (oneOf with an option of ability parallel_hatch)
  function parallelCells(desc) {
    return Object.keys(desc.symbols).filter(function (ch) {
      var s = desc.symbols[ch]
      return s.kind === 'oneOf' && s.options.some(function (o) { return o.kind === 'part' && o.ability === 'parallel_hatch' })
    })
  }

  // the problems of one published refrigerator recipe against its live recipe and its live source
  function hrLiveProblems(p, src, cfg) {
    var out = []
    var r = liveRecipe(p.recipeId)
    if (r === null) return ['not in the recipe manager under ' + p.recipeId]
    var items = itemContents(r, true)
    var full = items.filter(whole)
    var kept = items.filter(function (x) { return x.chance === 0 })
    if (items.length !== 1) out.push(items.length + ' item inputs')
    if (p.kind === 'hot' && (full.length !== 1 || full[0].count !== 1 || (p.hot.item && full[0].id !== p.hot.item))) out.push('hot ingot ' + JSON.stringify(items))
    if (p.kind === 'molten' && (kept.length !== 1 || (p.mold.item && kept[0].id !== p.mold.item))) out.push('mold ' + JSON.stringify(items))
    var fin = fluidContents(r, true)
    var consumed = fin.filter(whole)
    var keptF = fin.filter(function (f) { return f.chance === 0 })
    if (consumed.length + keptF.length !== fin.length) out.push('chanced fluid inputs ' + JSON.stringify(fin))
    var shared = [cfg.makeUp.id + ' ' + cfg.makeUp.amount, cfg.precoolIn.id + ' ' + cfg.precoolIn.amount]
    var metal = consumed.filter(function (f) { return shared.indexOf(f.id + ' ' + f.amount) < 0 })
    var sharedGot = consumed.filter(function (f) { return shared.indexOf(f.id + ' ' + f.amount) >= 0 }).map(function (f) { return f.id + ' ' + f.amount }).sort()
    if (sharedGot.join(',') !== shared.slice().sort().join(',')) out.push('make-up / precooling ' + JSON.stringify(consumed))
    if (p.kind === 'hot' && metal.length !== 0) out.push('fluids besides make-up and precooling ' + JSON.stringify(metal))
    if (p.kind === 'molten') {
      var path = p.molten.id ? p.molten.id : 'gtceu:' + String(p.molten.tag).substring(String(p.molten.tag).indexOf(':') + 1)
      if (metal.length !== 1 || metal[0].amount !== p.molten.amount || (p.molten.id && metal[0].id !== path)) out.push('molten metal ' + JSON.stringify(metal) + ' (want ' + path + ' ' + p.molten.amount + ')')
    }
    if (keptF.map(function (f) { return f.id + ' ' + f.amount }).join(',') !== cfg.charge.id + ' ' + cfg.charge.amount) out.push('charge ' + JSON.stringify(keptF))
    var outs = itemContents(r, false)
    if (outs.length !== 1 || !whole(outs[0]) || outs[0].id !== p.output.id || outs[0].count !== p.output.count) out.push('items out ' + JSON.stringify(outs))
    var fout = fluidContents(r, false)
    if (fout.length !== 1 || !whole(fout[0]) || fout[0].id !== cfg.precoolOut.id || fout[0].amount !== cfg.precoolOut.amount) out.push('fluids out ' + JSON.stringify(fout))
    var eut = inputEUt(r)
    if (eut !== p.eut || Number(r.duration) !== p.duration) out.push(eut + ' EU/t x ' + r.duration + ' t (published ' + p.eut + ' x ' + p.duration + ')')
    var key = String(r.data.getString(HRP().dataKey))
    if (key !== p.source) out.push('data ' + HRP().dataKey + '=' + key)
    // priced from the live source: its EU, the helium that circulates, at max(source EU/t, minEUt)
    if (!src) {
      out.push('no live source ' + p.source)
    } else {
      var srcEut = inputEUt(src)
      var srcCoolant = fluidContents(src, true).filter(function (f) { return f.id === cfg.source.coolant })[0]
      if (srcEut * Number(src.duration) !== p.sourceEnergy) out.push('source energy ' + p.sourceEnergy + ', live ' + srcEut + ' x ' + src.duration)
      if (!srcCoolant || srcCoolant.amount - cfg.makeUp.amount !== p.circulating) out.push('circulating ' + p.circulating + ', source coolant ' + JSON.stringify(srcCoolant))
      if (p.eut !== Math.max(srcEut, cfg.minEUt)) out.push('EU/t ' + p.eut + ', source ' + srcEut + ', min ' + cfg.minEUt)
    }
    var need = p.sourceEnergy + p.reliquefaction
    if (!(p.eut * p.duration >= need - 1e-6 && p.eut * (p.duration - 1) < need)) out.push(p.eut + ' x ' + p.duration + ' t for ' + need + ' EU')
    return out
  }

  function staticChecks() {
    var ready = { hr: false, ccl: false }

    safely('registration', function () {
      var problems = []
      var lines = []
      var PH = global.grindless.parallelHatch || {}
      ;[[HR_MACHINE, HR_TYPE, 'hr'], [CCL_MACHINE, CCL_TYPE, 'ccl']].forEach(function (w) {
        var def = GTRegistries.MACHINES.get(rl(w[0]))
        if (def === null || def === undefined) {
          problems.push(w[0] + ' is not registered')
          return
        }
        var types = []
        var arr = def.getRecipeTypes()
        for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
        if (types.join(',') !== w[1]) problems.push(w[0] + ' types ' + types.join(','))
        if (def.isGenerator() !== false) problems.push(w[0] + ' isGenerator=' + def.isGenerator())
        var type = GTRegistries.RECIPE_TYPES.get(rl(w[1]))
        if (type === null || type === undefined) problems.push(w[1] + ' is not a registered recipe type')
        var desc = global.grindless.patterns.describe(w[0])
        var size = desc ? sizeOf(desc) : 'none'
        var cells = desc ? parallelCells(desc) : []
        if (!desc) problems.push(w[0] + ' has no structure description')
        else if (size !== SIZES[w[0]]) problems.push(w[0] + ' is ' + size + ', the design ' + SIZES[w[0]])
        if (desc && cells.length !== 1) problems.push(w[0] + ' part cells with the parallel hatch: [' + cells.join('') + ']')
        if (!Array.isArray(PH.machines) || PH.machines.indexOf(w[0]) < 0) problems.push(w[0] + ' is not in global.grindless.parallelHatch.machines')
        if (desc) ready[w[2]] = true
        lines.push(w[0] + ': types=[' + types.join(',') + '] generator=' + def.isGenerator() + ' size=' + size + ' parallel-hatch cells=[' + cells.join('') + ']')
      })
      var missing = [TAPE, CONDUCTOR].filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) problems.push('LuV-A1 items missing: ' + missing.join(', '))
      check('registration', problems.length === 0, lines.join(' ; ') + '; ' + short(TAPE) + ' and ' + short(CONDUCTOR) + ' ' +
        (missing.length === 0 ? 'exist' : 'MISSING') + problemsText(problems))
    })

    safely('controller_recipes', function () {
      var problems = []
      var lines = []
      ;[[HRP(), HR_MACHINE], [CCLP(), CCL_MACHINE]].forEach(function (w) {
        var id = w[0].craftingRecipe
        var r = id ? liveRecipe(id) : null
        if (r === null) {
          problems.push((id || w[1] + ' craftingRecipe (unpublished)') + ' missing')
          return
        }
        var out = String(r.getResultItem(S.server.registryAccess()).getId())
        var ids = {}
        asArray(r.getIngredients()).forEach(function (ing) {
          asArray(ing.getItemIds()).forEach(function (x) { ids[String(x)] = true })
        })
        var missing = (w[0].craftingParts || []).filter(function (x) { return x !== w[1] && !ids[x] })
        if (out !== w[1]) problems.push(id + ' makes ' + out)
        if (missing.length > 0) problems.push(id + ' lacks ' + missing.join(','))
        lines.push(id + ' -> ' + short(out) + ' from [' + Object.keys(ids).filter(function (x) { return x.indexOf('circuit') < 0 }).map(short).join(', ') + ' + LuV circuits]')
      })
      check('controller_recipes', problems.length === 0 && lines.length === 2, lines.join(' ; ') + problemsText(problems))
    })

    safely('hr_recipes', function () {
      var H = HRP()
      var cfg = hrConfig()
      var recipes = H.recipes || []
      var skipped = H.skipped || []
      var problems = []
      var freezer = liveOfType(cfg.source.type)
      if (freezer === null) throw new Error(cfg.source.type + ' is not a recipe type')
      // the live freezer recipes that take the coolant (by id or by tag: RecipeHelper gives the tag's fluid)
      var live = {}
      var unreadable = []
      freezer.forEach(function (r) {
        var id = String(r.getId())
        try {
          if (fluidContents(r, true).some(function (f) { return f.id === cfg.source.coolant })) live[id] = r
        } catch (e) {
          unreadable.push(id + ': ' + e)
        }
      })
      var liveIds = Object.keys(live)
      var sources = {}
      recipes.forEach(function (p) { sources[p.source] = true })
      skipped.forEach(function (s) { sources[s.source] = true })
      var notTaken = liveIds.filter(function (id) { return !sources[id] })
      // a published source that is unreadable here lands in `extra` (it cannot be checked); other unreadable recipes are only listed
      var extra = Object.keys(sources).filter(function (id) { return !live[id] })
      if (cfg.charge.id !== cfg.makeUp.id) problems.push('the charge (' + cfg.charge.id + ') and the make-up (' + cfg.makeUp.id + ') are not one fluid')
      if (!(recipes.length > 0)) problems.push('no recipe published')
      if (recipes.length !== liveIds.length - skipped.length) problems.push(recipes.length + ' published for ' + liveIds.length + ' live sources - ' + skipped.length + ' skipped')
      if (skipped.length > 0) problems.push('skipped: ' + skipped.map(function (s) { return s.source + ' (' + s.reason + ')' }).join(', '))
      if (notTaken.length > 0) problems.push('live sources not taken: ' + notTaken.join(', '))
      if (extra.length > 0) problems.push('published sources that are not live helium freezer recipes (or unreadable): ' + extra.join(', '))
      var kinds = { hot: 0, molten: 0 }
      var bad = []
      var minDur = null
      recipes.forEach(function (p) {
        kinds[p.kind] = (kinds[p.kind] || 0) + 1
        if (minDur === null || p.duration < minDur.duration) minDur = p
        try {
          var pr = hrLiveProblems(p, live[p.source], cfg)
          if (pr.length > 0) bad.push(p.name + ': ' + pr.join(', '))
        } catch (e) {
          bad.push(p.name + ': exception ' + e)
        }
      })
      if (bad.length > 0) problems.push(bad.length + ' recipes differ: ' + bad.slice(0, 5).join(' ; '))
      var liveOwn = liveOfType(HR_TYPE)
      var liveCount = liveOwn === null ? -1 : liveOwn.length
      if (liveCount !== recipes.length) problems.push(liveCount + ' live ' + HR_TYPE + ' recipes for ' + recipes.length + ' published')
      check('hr_recipes', problems.length === 0, recipes.length + ' recipes (' + kinds.hot + ' hot ingots, ' + kinds.molten + ' molten metals) for ' +
        liveIds.length + ' live ' + cfg.source.type + ' recipes that take ' + short(cfg.source.coolant) + ', ' + skipped.length + ' skipped; ' + liveCount +
        ' live ' + HR_TYPE + ' recipes; each: ' + cfg.makeUp.amount + ' mB make-up + ' + cfg.precoolIn.amount + ' mB ' + short(cfg.precoolIn.id) + ' + a ' +
        cfg.charge.amount + ' mB charge at chance 0 -> the ingot + ' + cfg.precoolOut.amount + ' mB ' + short(cfg.precoolOut.id) +
        (minDur ? '; shortest ' + minDur.name + ' ' + minDur.eut + ' EU/t x ' + minDur.duration + ' t' : '') +
        (unreadable.length > 0 ? '; ' + unreadable.length + ' of ' + freezer.length + ' freezer recipes unreadable (' + unreadable.slice(0, 3).join('; ') + ')' : '') +
        problemsText(problems))
    })

    safely('hr_rate', function () {
      var cfg = hrConfig()
      var rate = HRP().rate || {}
      var r = liveRecipe(cfg.reliquefaction.recipe)
      if (r === null) throw new Error(cfg.reliquefaction.recipe + ' is not in the recipe manager')
      var made = fluidContents(r, false).filter(function (f) { return f.id === cfg.source.coolant })[0]
      var eu = inputEUt(r) * Number(r.duration)
      var liveRate = made ? eu / made.amount : NaN
      var ok = String(rate.from) === cfg.reliquefaction.recipe && String(rate.from) !== 'table' && Math.abs(Number(rate.euPerMb) - liveRate) < 1e-9
      check('hr_rate', ok, 'published ' + rate.euPerMb + ' EU/mB from ' + rate.from + '; live ' + short(cfg.reliquefaction.recipe) + ' ' + inputEUt(r) + ' EU/t x ' +
        r.duration + ' t for ' + (made ? made.amount : '?') + ' mB = ' + liveRate + ' EU/mB (table fallback ' + cfg.reliquefaction.fallbackEuPerMb + ', precooling x' +
        cfg.reliquefaction.precoolFactor + ')')
    })

    safely('ccl_recipes', function () {
      var C = CCLP()
      var recs = C.recipes || []
      var problems = []
      var lines = []
      var circuits = recs.map(function (r) { return r.circuit }).sort(function (a, b) { return a - b }).join(',')
      if (recs.length !== 2 || circuits !== '1,2') problems.push(recs.length + ' recipes on circuits [' + circuits + ']')
      if ((C.skipped || []).length > 0) problems.push('skipped: ' + C.skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join(', '))
      if ((C.clashes || []).length > 0) problems.push('clashes: ' + C.clashes.join('; '))
      recs.forEach(function (rec) {
        var r = liveRecipe(rec.recipeId)
        if (r === null) {
          problems.push(rec.recipeId + ' not in the recipe manager')
          return
        }
        var items = itemContents(r, true)
        var circ = items.filter(function (x) { return x.circuit > 0 })
        var ins = items.filter(function (x) { return x.circuit === 0 })
        if (circ.length !== 1 || circ[0].circuit !== rec.circuit || circ[0].chance !== 0) problems.push(rec.name + ' circuit ' + JSON.stringify(circ))
        var wantIn = rec.itemsIn.map(function (x) { return x.id + ' x' + x.count }).sort().join(',')
        var gotIn = ins.map(function (x) { return x.id + ' x' + x.count + (whole(x) ? '' : ' @' + x.chance) }).sort().join(',')
        if (wantIn !== gotIn) problems.push(rec.name + ' items in ' + gotIn + ' (want ' + wantIn + ')')
        var fin = fluidContents(r, true)
        var wantF = rec.fluidsIn.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
        var gotF = fin.map(function (f) { return f.id + ' ' + f.amount + (whole(f) ? '' : ' @' + f.chance) }).sort().join(',')
        if (wantF !== gotF) problems.push(rec.name + ' fluids in ' + gotF + ' (want ' + wantF + ')')
        var outs = itemContents(r, false)
        var wantOut = rec.itemsOut.map(function (x) { return x.id + ' x' + x.count }).sort().join(',')
        var gotOut = outs.map(function (x) { return x.id + ' x' + x.count + (whole(x) ? '' : ' @' + x.chance) }).sort().join(',')
        if (wantOut !== gotOut) problems.push(rec.name + ' items out ' + gotOut + ' (want ' + wantOut + ')')
        if (fluidContents(r, false).length !== 0) problems.push(rec.name + ' has fluid outputs')
        var eut = inputEUt(r)
        if (eut !== rec.eut || Number(r.duration) !== rec.duration) problems.push(rec.name + ' ' + eut + ' EU/t x ' + r.duration + ' t')
        var key = String(r.data.getString(C.dataKey))
        if (key !== rec.name) problems.push(rec.name + ' data ' + C.dataKey + '=' + key)
        lines.push('c' + rec.circuit + ' ' + rec.name + ': ' + rec.itemsIn.map(function (x) { return x.count + ' ' + short(x.id) }).concat(rec.fluidsIn.map(function (f) {
          return f.amount + ' mB ' + short(f.id)
        })).join(' + ') + ' -> ' + rec.itemsOut.map(function (x) { return x.count + ' ' + short(x.id) }).join(' + ') + ', ' + rec.eut + ' EU/t x ' + rec.duration + ' t')
      })
      var c1 = cclRecipe(1)
      var c2 = cclRecipe(2)
      if (c1 && !c1.itemsOut.some(function (x) { return x.id === TAPE })) problems.push('c1 does not make ' + TAPE)
      if (c2 && !c2.itemsIn.some(function (x) { return x.id === TAPE })) problems.push('c2 does not take ' + TAPE)
      if (c2 && !c2.itemsOut.some(function (x) { return x.id === CONDUCTOR })) problems.push('c2 does not make ' + CONDUCTOR)
      var liveOwn = liveOfType(CCL_TYPE)
      var liveCount = liveOwn === null ? -1 : liveOwn.length
      if (liveCount !== recs.length) problems.push(liveCount + ' live ' + CCL_TYPE + ' recipes for ' + recs.length + ' published')
      check('ccl_recipes', problems.length === 0, lines.join(' ; ') + '; ' + liveCount + ' live ' + CCL_TYPE + ' recipes' + problemsText(problems))
    })

    safely('no_recycling', function () {
      var watched = [TAPE, CONDUCTOR]
      var hits = []
      var counts = []
      var missingTypes = []
      var unreadable = 0
      var firstError = ''
      RECYCLING_TYPES.forEach(function (typeId) {
        var list = liveOfType(typeId)
        if (list === null) {
          missingTypes.push(typeId)
          return
        }
        var n = 0
        list.forEach(function (r) {
          try {
            var ids = asArray(lazy().RecipeHelper.getInputItems(r)).map(itemName)
            n++
            watched.forEach(function (w) { if (ids.indexOf(w) >= 0) hits.push(String(r.getId()) + ' takes ' + short(w)) })
          } catch (e) {
            unreadable++
            if (firstError === '') firstError = String(r.getId()) + ': ' + e
          }
        })
        counts.push(short(typeId) + ' ' + n + ' of ' + list.length + ' read')
      })
      check('no_recycling', hits.length === 0 && missingTypes.length === 0, counts.join(', ') + '; ' + (hits.length === 0 ? 'none takes ' +
        watched.map(short).join(' or ') : hits.length + ' recycling recipes: ' + hits.slice(0, 10).join('; ')) +
        (unreadable > 0 ? '; ' + unreadable + ' unreadable (first ' + firstError + ')' : '') + (missingTypes.length > 0 ? '; types missing: ' + missingTypes.join(', ') : ''))
    })

    return ready
  }

  // ---------------------------------------------------------------- the refrigerator's runs

  // an item of a tag (the hot ingots are tag inputs): GTM's own first
  function tagItem(tag) {
    var ids = asArray(Ingredient.of('#' + tag).getItemIds()).map(String)
    var gt = ids.filter(function (id) { return id.indexOf('gtceu:') === 0 })
    return gt.length > 0 ? gt[0] : (ids[0] || null)
  }

  // what a published recipe takes, as concrete ids: read from its live recipe (RecipeHelper resolves the tags), else from the table
  function inputsOf(rec) {
    var cfg = hrConfig()
    var io = { hot: null, mold: null, molten: null, moltenAmount: 0, from: 'live recipe' }
    try {
      var r = liveRecipe(rec.recipeId)
      if (r === null) throw new Error('not live')
      itemContents(r, true).forEach(function (x) {
        if (x.circuit > 0) return
        if (x.chance === 0) io.mold = x.id
        else io.hot = x.id
      })
      fluidContents(r, true).forEach(function (f) {
        if (whole(f) && f.id !== cfg.makeUp.id && f.id !== cfg.precoolIn.id) {
          io.molten = f.id
          io.moltenAmount = f.amount
        }
      })
    } catch (e) {
      io.from = 'table (' + e + ')'
    }
    if (rec.kind === 'hot' && !io.hot) io.hot = rec.hot.item || tagItem(rec.hot.tag)
    if (rec.kind === 'molten') {
      if (!io.mold) io.mold = rec.mold.item || tagItem(rec.mold.tag)
      if (!io.molten) {
        io.molten = rec.molten.id || ('gtceu:' + String(rec.molten.tag).substring(String(rec.molten.tag).indexOf(':') + 1))
        io.moltenAmount = rec.molten.amount
      }
    }
    if (rec.kind === 'hot' && !io.hot) throw new Error(rec.name + ': no hot ingot to insert')
    if (rec.kind === 'molten' && (!io.mold || !io.molten || !Fluid.exists(io.molten))) throw new Error(rec.name + ': mold ' + io.mold + ', metal ' + io.molten)
    return io
  }

  function pickRecipes() {
    var all = HRP().recipes || []
    var used = {}
    return PICKS.map(function (p) {
      var rec = all.filter(function (r) { return r.name === p.name && r.kind === p.kind && r.eut <= PICK_MAX_EUT })[0]
      var how = 'the preferred one'
      if (!rec) {
        rec = all.filter(function (r) { return r.kind === p.kind && r.eut <= PICK_MAX_EUT && !used[r.name] })
          .sort(function (a, b) { return a.duration - b.duration })[0]
        how = 'stand-in for ' + p.name
      }
      if (!rec) throw new Error('no ' + p.kind + ' recipe at <= ' + PICK_MAX_EUT + ' EU/t to run')
      used[rec.name] = true
      return { key: p.key, rec: rec, how: how, io: inputsOf(rec) }
    })
  }

  // empties every part (the circuit too) and loads a scenario: items into the input bus, fluids into the input hatches by role
  function load(m, phase, sc) {
    emptyBus(m.P.inBus)
    emptyBus(m.P.outBus)
    m.copy.ins.concat(m.copy.outs).forEach(function (role) { setTank(m.P[role], null, 0) })
    m.P.inBus.getCircuitInventory().setStackInSlot(0, sc.circuit ? lazy().Circuit.stack(sc.circuit) : lazy().ItemStack.EMPTY)
    ;(sc.items || []).forEach(function (x) { insert(m.P.inBus, x[0], x[1]) })
    m.copy.ins.forEach(function (role) { if (sc[role]) setTank(m.P[role], sc[role][0], sc[role][1]) })
    m.loaded = sc
    begin(m, phase)
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

  // what a run left: the output bus, the input bus, the output hatches, the input hatches by role and the EU drawn
  function result(m) {
    var tanks = {}
    m.copy.ins.forEach(function (role) { tanks[role] = tankInfo(m.P[role]) })
    return { out: readBus(m.P.outBus), left: readBus(m.P.inBus), fluids: outFluids(m), tanks: tanks, eu: m.euUsed - m.eu0 }
  }

  // the scenario of one refrigerator run of a pick: `copies` hot ingots (or the mold and copies x the metal), the charge + copies x the
  // make-up of liquid helium in hatch 2, copies x the precooling in hatch 3
  function hrScenario(pick, copies) {
    var cfg = hrConfig()
    var sc = { items: [], in2: [cfg.charge.id, cfg.charge.amount + cfg.makeUp.amount * copies], in3: [cfg.precoolIn.id, cfg.precoolIn.amount * copies] }
    if (pick.rec.kind === 'hot') {
      sc.items.push([pick.io.hot, copies])
    } else {
      sc.items.push([pick.io.mold, 1])
      sc.in1 = [pick.io.molten, pick.io.moltenAmount * copies]
    }
    return sc
  }

  function hrLoadRun(m, phase, pick, copies) {
    m.pick = pick
    m.copies = copies
    load(m, phase, hrScenario(pick, copies))
  }

  function inputText(sc) {
    var parts = (sc.items || []).map(function (x) { return x[1] + ' ' + short(x[0]) })
    ;['in1', 'in2', 'in3'].forEach(function (role) { if (sc[role]) parts.push(sc[role][1] + ' mB ' + short(sc[role][0])) })
    return parts.join(' + ')
  }

  // the problems of a refrigerator run: its product and nitrogen, exactly copies x make-up of helium gone, the charge left whole, the
  // nitrogen and the metal used up, the mold kept, the copies, the EU
  function hrRunProblems(m, r) {
    var cfg = hrConfig()
    var rec = m.pick.rec
    var copies = m.copies
    var ran = m.ran || {}
    var problems = []
    if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
    if (ran.parallels !== copies) problems.push(ran.parallels + ' copies, want ' + copies)
    var wantOut = {}
    wantOut[rec.output.id] = rec.output.count * copies
    if (!sameCounts(r.out, wantOut)) problems.push('output bus ' + summary(r.out) + ', want ' + summary(wantOut))
    var wantN = {}
    wantN[cfg.precoolOut.id] = cfg.precoolOut.amount * copies
    if (!sameCounts(r.fluids, wantN)) problems.push('output hatch ' + fluidSummary(r.fluids) + ', want ' + fluidSummary(wantN))
    var he = r.tanks.in2
    if (he.id !== cfg.charge.id || he.amount !== cfg.charge.amount) problems.push('helium hatch ' + he.amount + ' mB ' + short(he.id) + ', want the ' + cfg.charge.amount + ' mB charge')
    if (r.tanks.in3.amount !== 0) problems.push(r.tanks.in3.amount + ' mB ' + short(r.tanks.in3.id) + ' left')
    if (r.tanks.in1.amount !== 0) problems.push(r.tanks.in1.amount + ' mB ' + short(r.tanks.in1.id) + ' left')
    var wantLeft = {}
    if (rec.kind === 'molten') wantLeft[m.pick.io.mold] = 1
    if (!sameCounts(r.left, wantLeft)) problems.push('input bus ' + summary(r.left) + ', want ' + summary(wantLeft))
    if (!(ran.eut >= rec.eut * copies) || !(r.eu > 0) || r.eu !== ran.eut * ran.duration) problems.push(r.eu + ' EU drawn for ' + ran.eut + ' EU/t x ' + ran.duration + ' t')
    return problems
  }

  function ranText(m, rec) {
    var ran = m.ran
    if (!ran) return 'no run seen (base ' + rec.eut + ' EU/t x ' + rec.duration + ' t)'
    return ran.parallels + ' cop' + (ran.parallels === 1 ? 'y' : 'ies') + ' at ' + ran.eut + ' EU/t x ' + ran.duration + ' t (base ' + rec.eut + ' x ' + rec.duration + ')'
  }

  function hrRunDetail(m, r) {
    var cfg = hrConfig()
    var loadedHe = m.loaded.in2[1]
    return m.pick.rec.name + ' (' + m.pick.how + '; ' + m.pick.io.from + '): ' + inputText(m.loaded) + ' -> [' + summary(r.out) + '], ' + fluidSummary(r.fluids) +
      '; helium ' + loadedHe + ' -> ' + r.tanks.in2.amount + ' mB (' + (loadedHe - r.tanks.in2.amount) + ' used, ' + cfg.makeUp.amount * m.copies + ' expected); bus [' +
      summary(r.left) + ']; ' + ranText(m, m.pick.rec) + ', ' + r.eu + ' EU drawn | ' + state(m.ctrl)
  }

  function nextPick(key) {
    for (var i = 0; i < S.picks.length - 1; i++) {
      if (S.picks[i].key === key) return S.picks[i + 1]
    }
    return null
  }

  function hrStart(m) {
    if (!S.picks) {
      note('hr_runs', 'skipped: no recipes picked')
      m.phase = 'done'
      return
    }
    var cfg = hrConfig()
    var a = S.picks[0]
    // the first hot ingot and its precooling with the charge alone: 4,000 mB of liquid helium, no make-up
    m.pick = a
    m.copies = 1
    var sc = hrScenario(a, 1)
    sc.in2 = [cfg.charge.id, cfg.charge.amount]
    load(m, 'refuse', sc)
  }

  function hrStep(m, age) {
    var cfg = hrConfig()
    if (m.phase === 'refuse') {
      if (age < HOLD_TICKS) return
      var r0 = result(m)
      var a = m.pick
      var blocked = (r0.left[a.io.hot] || 0) === 1 && Object.keys(r0.left).length === 1 && r0.tanks.in2.amount === cfg.charge.amount &&
        r0.tanks.in3.amount === cfg.precoolIn.amount && r0.eu === 0 && Object.keys(m.seen).length === 0 && Object.keys(r0.out).length === 0 &&
        Object.keys(r0.fluids).length === 0
      var lowLine = chargeLine(m.ctrl)
      var lowHeld = chargeHeld(m.ctrl)
      check('hr_refuses_short_charge', blocked, inputText(m.loaded) + ' (the charge, no make-up) for ' + age + ' ticks: ran [' + Object.keys(m.seen).join(',') +
        '], ' + r0.eu + ' EU, bus [' + summary(r0.left) + '], helium ' + r0.tanks.in2.amount + ' mB, nitrogen ' + r0.tanks.in3.amount + ' mB, outputs [' +
        summary(r0.out) + '] ' + fluidSummary(r0.fluids) + ' | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
      // the make-up added: the same inputs with 25 mB more liquid helium, and the first run (fresh inputs if the refusal did not hold)
      var full = cfg.charge.amount + cfg.makeUp.amount
      if (blocked) {
        setTank(m.P.in2, cfg.charge.id, full)
        m.loaded.in2 = [cfg.charge.id, full]
        begin(m, 'run')
      } else {
        hrLoadRun(m, 'run', a, 1)
      }
      var okLine = chargeLine(m.ctrl)
      var okHeld = chargeHeld(m.ctrl)
      var args = function (held) { return '[' + held + ', ' + cfg.charge.amount + ', ' + cfg.makeUp.amount + ']' }
      var lineOk = CHARGE_LOW.test(lowLine) && lowLine.indexOf(args(cfg.charge.amount)) >= 0 && CHARGE_OK.test(okLine) && okLine.indexOf(args(full)) >= 0 &&
        lowHeld === cfg.charge.amount && okHeld === full
      check('hr_charge_line', lineOk, 'with ' + cfg.charge.amount + ' mB: "' + lowLine + '" (chargeIn ' + lowHeld + '); with ' + full + ' mB: "' + okLine +
        '" (chargeIn ' + okHeld + ')')
      return
    }
    if (m.phase === 'run' || m.phase === 'parallel') {
      if (!runOver(m, age, m.pick.rec.duration)) return
      var r = result(m)
      var problems = hrRunProblems(m, r)
      var name = m.phase === 'parallel' ? 'hr_parallel_x2' : 'hr_run_' + m.pick.key
      var extra = m.phase === 'parallel' ? ' (the charge is needed once: ' + (cfg.charge.amount + cfg.makeUp.amount * 2) + ' mB in, not ' +
        (cfg.charge.amount * 2 + cfg.makeUp.amount * 2) + ')' : ''
      check(name, problems.length === 0, hrRunDetail(m, r) + extra + problemsText(problems))
      if (m.phase === 'parallel') {
        m.phase = 'done'
        return
      }
      var next = nextPick(m.pick.key)
      if (next !== null) {
        hrLoadRun(m, 'run', next, 1)
      } else if (m.hasParallel) {
        // x2 with the first hot ingot: its last run is not the machine's cached recipe (the molten one ran last)
        hrLoadRun(m, 'parallel', S.picks[0], 2)
      } else {
        note('hr_parallel_x2', 'skipped: the controller does not read a parallel hatch (see hr_PARTS)')
        m.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- the coated conductor line's runs

  function cclLoad(m, phase, rec) {
    var sc = { circuit: rec.circuit, items: rec.itemsIn.map(function (x) { return [x.id, x.count] }) }
    rec.fluidsIn.forEach(function (f, i) { sc[m.copy.ins[i]] = [f.id, f.amount] })
    m.rec = rec
    load(m, phase, sc)
  }

  function cclRunProblems(m, r, rec) {
    var ran = m.ran || {}
    var problems = []
    if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
    if (ran.parallels !== 1) problems.push(ran.parallels + ' copies')
    var want = {}
    rec.itemsOut.forEach(function (x) { want[x.id] = (want[x.id] || 0) + x.count })
    if (!sameCounts(r.out, want)) problems.push('output bus ' + summary(r.out) + ', want ' + summary(want))
    if (Object.keys(r.left).length !== 0) problems.push('input bus ' + summary(r.left))
    m.copy.ins.forEach(function (role) { if (r.tanks[role].amount !== 0) problems.push(r.tanks[role].amount + ' mB ' + short(r.tanks[role].id) + ' left') })
    if (!(ran.eut >= rec.eut) || !(r.eu > 0) || r.eu !== ran.eut * ran.duration) problems.push(r.eu + ' EU drawn for ' + ran.eut + ' EU/t x ' + ran.duration + ' t')
    return problems
  }

  function cclDetail(m, r, rec) {
    return 'circuit ' + rec.circuit + ', ' + inputText(m.loaded) + ' -> [' + summary(r.out) + ']; ' + ranText(m, rec) + ' on two LuV hatches, ' + r.eu +
      ' EU drawn | ' + state(m.ctrl)
  }

  function cclStart(m) {
    var c1 = cclRecipe(1)
    if (c1 === null || cclRecipe(2) === null) {
      check('ccl_run_substrate', false, 'the recipes on circuits 1 and 2 were not published')
      m.phase = 'done'
      return
    }
    cclLoad(m, 'c1', c1)
  }

  function cclStep(m, age) {
    if (m.phase === 'c1' && runOver(m, age, m.rec.duration)) {
      var r = result(m)
      var p1 = cclRunProblems(m, r, m.rec)
      check('ccl_run_substrate', p1.length === 0, cclDetail(m, r, m.rec) + problemsText(p1))
      // the tape step on the tape the line just made
      var c2 = cclRecipe(2)
      var need = c2.itemsIn.filter(function (x) { return x.id === TAPE }).map(function (x) { return x.count })[0] || 0
      var made = r.out[TAPE] || 0
      if (made < need) {
        check('ccl_run_tape', false, 'the substrate step made ' + made + ' tape, the tape step needs ' + need)
        m.phase = 'done'
        return
      }
      m.tapeMade = made
      cclLoad(m, 'c2', c2)
      return
    }
    if (m.phase === 'c2' && runOver(m, age, m.rec.duration)) {
      var r2 = result(m)
      var p2 = cclRunProblems(m, r2, m.rec)
      check('ccl_run_tape', p2.length === 0, cclDetail(m, r2, m.rec) + ' (the tape: ' + m.tapeMade + ' made by the substrate step)' + problemsText(p2))
      m.phase = 'done'
    }
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
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(copy) {
    var desc = global.grindless.patterns.describe(copy.machine)
    if (!desc) throw new Error('no structure description recorded for ' + copy.machine)
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
    var placedRoles = {}
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          var c = { x: copy.x - (ci - ctrl.ci), y: cy + (ri - ctrl.ri), z: copy.z - (si - ctrl.si), ch: ch, id: null, props: '', role: null }
          var role = copy.parts[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = copy.machine
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (role !== undefined) {
            if (sym.kind !== 'oneOf') throw new Error('the part cell ' + si + ',' + ri + ',' + ci + ' is a ' + sym.kind + ' cell')
            if (!copy.facing[si]) throw new Error('no facing for the parts of slice ' + si)
            c.id = copy.blocks[role]
            c.props = '[facing=' + copy.facing[si] + ']'
            c.role = role
            placedRoles[role] = true
          } else {
            c.id = plainBlock(sym)
          }
          if (c.x < BAND.x0 || c.x > BAND.x1 || c.y < BAND.y0 || c.y >= ROOF_Y || c.z < BAND.z0 || c.z > BAND.z1) {
            throw new Error('cell ' + si + ',' + ri + ',' + ci + ' at ' + c.x + ',' + c.y + ',' + c.z + ' is outside the band')
          }
          cells.push(c)
        }
      })
    })
    var unplaced = Object.keys(copy.parts).filter(function (k) { return !placedRoles[copy.parts[k]] })
    if (unplaced.length > 0) throw new Error('part cells not in the pattern: ' + unplaced.join(' '))
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

  // the energy hatches are topped up every tick; what they lost since the last tick is what the machine drew
  function meter(m) {
    ;['energy', 'energy2'].forEach(function (role) {
      if (!m.P[role]) return
      var c = m.P[role].energyContainer
      var cap = Number(c.getEnergyCapacity())
      var stored = Number(c.getEnergyStored())
      if (m.metered) m.euUsed += cap - stored
      c.setEnergyStored(cap)
    })
    m.metered = true
  }

  function formed(m) {
    safely(m.copy.key + '_PARTS', function () {
      m.ctrl = machineAt(m.ctrlPos)
      m.P = findParts(m, m.ctrl)
      var want = {}
      Object.keys(m.copy.parts).forEach(function (k) { want[m.copy.parts[k]] = true })
      var missing = Object.keys(want).filter(function (role) { return !m.P[role] })
      var extra = ''
      var ok = missing.length === 0
      if (m.copy.key === 'hr') {
        var hatch = m.ctrl.getParallelHatch()
        m.hasParallel = hatch.isPresent()
        var current = m.hasParallel ? Number(hatch.get().getCurrentParallel()) : 0
        extra = '; parallel hatch ' + (m.hasParallel ? 'read by the controller, set to ' + current : 'NOT read by the controller')
        if (!m.hasParallel || !(current >= 2)) ok = false
      }
      check(m.copy.key + '_PARTS', ok, '[' + m.P.ids.join(' ') + ']' + extra + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      if (missing.length > 0) {
        m.phase = 'done'
        return
      }
      meter(m)
      if (m.copy.key === 'hr') hrStart(m)
      else cclStart(m)
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

  // every tick: the energy the controller drew, and what it runs (the recipe as modified: copies, overclocked EU/t and duration)
  function measure(m) {
    if (!m.ctrl || !m.P || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
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
    if (m.copy.key === 'hr') hrStep(m, age)
    else cclStep(m, age)
  }

  // ---------------------------------------------------------------- run

  function prepareWorld() {
    S.areaTouched = true
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    var loaded = S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    // a roof over the band: a hatch that is rained on may explode (GTM's weather check)
    S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + ROOF_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + ROOF_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ' generated, forceload add ' + loaded +
      ', changed ' + cleared + ' blocks while clearing, roof at Y ' + ROOF_Y)
  }

  // the band cleared again: the machines (with what is left in them; their drops are removed after the fill), the roof, the force-load
  function cleanup() {
    if (!S.areaTouched) return
    S.copies.forEach(function (m) {
      if (!m.P) return
      try {
        emptyBus(m.P.inBus)
        if (m.P.outBus) emptyBus(m.P.outBus)
        m.copy.ins.concat(m.copy.outs).forEach(function (role) { if (m.P[role]) setTank(m.P[role], null, 0) })
      } catch (e) { /* the fill below clears it anyway */ }
    })
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    var list = S.level.getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(BAND.x0, BAND.y0, BAND.z0, BAND.x1 + 1, BAND.y1 + 1, BAND.z1 + 1))
    for (var i = 0; i < list.size(); i++) list.get(i).discard()
    var released = S.server.runCommandSilent('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    note('CLEANUP', 'cleared ' + cleared + ' blocks, ' + list.size() + ' item entities removed, forceload remove ' + released)
  }

  function startCopies(ready) {
    S.copies = []
    COPIES.forEach(function (copy) {
      var m = { copy: copy, phase: 'forming', seen: {}, seenWorking: false, euUsed: 0, eu0: 0, metered: false, ran: null, ctrl: null, P: null }
      S.copies.push(m)
      if (!ready[copy.key]) {
        note(copy.key + '_PLACED', 'skipped: ' + copy.machine + ' is not registered or has no structure description (see registration)')
        m.phase = 'done'
        return
      }
      try {
        if (!place(m)) m.phase = 'done'
      } catch (e) {
        check(copy.key + '_PLACED', false, 'exception: ' + e)
        m.phase = 'done'
      }
    })
    S.t0 = S.t
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cleanup()
    } catch (e) {
      check('cleanup', false, 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    S.copies.forEach(function (m) {
      if (m.phase === 'done') return
      try {
        measure(m)
        if (m.phase === 'forming' ? S.t % STEP === 0 : true) step(m)
      } catch (e) {
        check(m.copy.key + '_STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    })
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
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), copies: [], finished: false, areaTouched: false, picks: null }
    var ready = { hr: false, ccl: false }
    try {
      ready = staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    safely('hr_picks', function () {
      S.picks = pickRecipes()
      note('hr_picks', S.picks.map(function (p) {
        return p.key + ' = ' + p.rec.name + ' (' + p.how + '; ' + p.rec.kind + ', ' + p.rec.eut + ' EU/t x ' + p.rec.duration + ' t; inserts ' +
          (p.rec.kind === 'hot' ? short(p.io.hot) : short(p.io.mold) + ' + ' + p.io.moltenAmount + ' mB ' + short(p.io.molten)) + ' -> ' + p.rec.output.count + ' ' +
          short(p.rec.output.id) + ')'
      }).join(' ; '))
    })
    try {
      prepareWorld()
    } catch (e2) {
      check('AREA', false, 'exception: ' + e2)
    }
    startCopies(ready)
    if (S.copies.every(function (m) { return m.phase === 'done' })) finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_luv_cryogenics', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_luv_cryogenics run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
