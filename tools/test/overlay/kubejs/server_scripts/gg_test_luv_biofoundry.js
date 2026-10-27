// priority: -3924
// Gregtech Grindless - smoke test of package LuV-A5, biofoundry (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): LuV's Biofoundry (gtceu:biofoundry and its recipe type gtceu:sterile_culture), startup_scripts/grindless/luv/
// biofoundry.js, server_scripts/grindless/luv/biofoundry.js, server_scripts/grindless/lib/compose.js and data/grindless/tables/biofoundry.json.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_luv_biofoundry;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|luv_biofoundry\|DONE@@180;;GGTEST\|lookup\|DONE@@180;;GGTEST\|dump\|DONE@@180'
//
// Markers: GGTEST|luv_biofoundry|<check>|PASS|FAIL|NOTE|<detail>
//   registration          gtceu:biofoundry is a multiblock on its own type gtceu:sterile_culture (in GTRegistries, the IO sizes published),
//                         not a generator, its modifier run before every recipe, listed for the parallel hatch, with a structure
//                         description in global.grindless.structures (9 x 6 x 9, 21 part cells, 4 door halves, 9 lamps)
//   composed              the 8 composed steps from their 11 live GTM stages (11 of 11 read), none skipped, with the design's figures,
//                         every item input used up (10 000) and every output whole:
//                           c1 collagen_from_bone       2 meat + bone + 1 000 mB H2SO4 -> 2 collagen + 1 000 mB diluted H2SO4, 480 x 1 600
//                           c2 collagen_from_bone_meal  meat + bone meal + 500 mB H2SO4 -> collagen + 500 mB diluted H2SO4, 480 x 800
//                           c3 gelatin                  6 collagen + 1 500 mB H3PO4 + 4 500 mB water -> 4 gelatin + phosphorus, 480 x 4 800
//                                                       (mixer/gelatin_mixture x1.5 + centrifuge/gelatin x1 = 2 304 000 EU)
//                           c4 agar                     gelatin + 1 000 mB distilled water -> agar, 480 x 600
//                           c5 bacterial_sludge         1 000 mB biomass + 1 000 mB bacteria -> 1 000 mB bacterial sludge, 1 920 x 600
//                           c6 mutagen                  tiny U-235 + 1 000 mB sludge -> 100 mB mutagen, 7 610 x 101 (stages 768 512 EU)
//                           c7 sterile_growth_medium    4 meat + 4 salt + 4 calcium + 4 agar + 4 000 mB mutagen -> 4 000 mB sterilized
//                                                       medium, 7 680 x 2 000 (raw_growth_medium x1 + fluid_heater x40 = 15 360 000 EU)
//                           c8 stem_cells               osmiridium + 500 mB bacteria + 500 mB medium -> 32 stem cells + 500 mB sludge,
//                                                       30 720 x 300
//   own_recipes           c9 engineered_barley_seed (wheat seeds + 250 mB bacteria) and c10 engineered_tobacco_seed (beetroot seeds +
//                         250 mB bacteria), 1 920 x 600 each; fails clearly when LuV-A1's seed items are not registered
//   live_contents         every published recipe is in the recipe manager under grindless:sterile_culture/<name> with exactly its
//                         contents: items (counts, chances), circuit, fluids, EU/t, duration and the EMI data key grindless_biofoundry
//   no_sterile_condition  none of our recipes carries a cleanroom condition; GTM's gtceu:mixer/gelatin_mixture and
//                         gtceu:large_chemical_reactor/stem_cells are still live with their sterile cleanroom, and so is
//                         gtceu:brewery/bacteria unless Europa's package (B8) has cut it
//   gtm_stages            NOTE: the 11 GTM stages composed from, live or not, and their cleanroom
//   lookup_safety         no recipe of the type takes a subset of another's ingredients (static; gg_test_recipe_lookup asks GTM's lookup)
//   controller_recipe     grindless:assembler/biofoundry: LuV hull + 2 LuV pumps + LuV sensor + 4 LuV circuits -> the controller,
//                         7 680 EU/t x 600 t
//   AREA                  NOTE: the band cleared and force-loaded
//   PLACED / FORMED / PARTS   the built hall (below)
//   oc_plan               NOTE: the formed machine's tier and overclock voltage, and the durations GTM's overclock should give
//   PROCESS_gelatin       c3: 6 collagen + 1 500 mB phosphoric acid + 4 500 mB water -> exactly 4 gelatin + 1 phosphorus, nothing left
//   PROCESS_medium        c7: 4 meat + 4 salt + 4 calcium + 4 agar + 4 000 mB mutagen -> exactly 4 000 mB sterilized medium, nothing left
//   PROCESS_stem_cells    c8: osmiridium + 500 mB bacteria (injected) + 500 mB of that medium -> exactly 32 stem cells + 500 mB sludge
//   oc_gelatin / oc_medium / oc_stem_cells   NOTE: predicted and observed EU/t, duration and EU of each run
//                         (every PROCESS run must draw at least the recipe's EU: an overclock never makes it cheaper)
//   contained_room        the stem cells loaded again, output bus full, voiding off: the run does not start (no EU, nothing used)
//   no_voiding_items      the same with the controller set to void items: refused, and the refusal (grindless.machine.biofoundry.
//                         no_voiding) is shown
//   no_voiding_fluids     bus emptied, the output hatch holding 1 000 mB of water (no room for the sludge), controller set to void
//                         fluids: refused, and the refusal is shown
//   resumes               voiding off, the water taken out: the run goes through (32 stem cells, 500 mB sludge)
//   CLEANUP               NOTE: the band cleared, stray items removed, chunks released
//   STEP / deadline / static / run   FAIL on an exception, or the hall still busy after DEADLINE_TICKS (run: a NOTE when a run is
//                         already in progress)
//   luv_biofoundry|DONE   last line
//
// Overclock (GTM 7.5.3, checked against OverclockingLogic, GTRecipeModifiers, WorkableElectricMultiblockMachine and EnergyContainerList):
// two LuV energy hatches (32 768 V, 2 A each) make an EnergyContainerList of 131 072 V at 1 A (4 A is a power of four), and two hatches
// of the top tier lift getMaxVoltage one tier: the machine is ZPM (tier 7) and overclocks to 131 072 V. OC_NON_PERFECT
// (standardOC: EU/t x4 and duration x0.5 per overclock, from the recipe's tier GTUtil.getTierByVoltage, while EU/t x4 <= 131 072):
// c3 480 EU/t is HV, 4 overclocks: 4 800 -> 300 t at 122 880 EU/t; c7 7 680 is IV, 2: 2 000 -> 500 t; c8 30 720 is LuV, 1: 300 -> 150 t.
// The oc_* NOTE lines report prediction and observation; they are not asserted. Tick budget: forming (10-60 t) + 300 + 500 + 150 +
// 3 x 60 (holds) + 150 (resume) = about 1 300 t (65 s), capped at DEADLINE_TICKS (2 600 t, 130 s).
//
// The hall (controller facing north at x 15624, z 2, y 101; the structure behind it, x 15620-15628, z 2-10, y 100-105). Service wall at
// z 10, row 1 (y 101), left to right as seen from the front: two LuV energy hatches, input bus, output bus, two input hatches, output
// hatch, all facing south (outwards); the other 14 part cells plascrete. The airlock's iron doors are placed lower half first, then the
// upper half. Lamps: gtceu:white_lamp. The energy hatches are topped up every tick (what they lost is what the machine drew).
// TEST AREA: this test builds, force-loads and clears ONLY X 15616-15647, Y 98-112, Z 0-15 of the overworld (the other half of the
// package's band, X 15648-15679, is the GT-- circuit-line check's), with a roof at Y 111 so no hatch is rained on, and clears the area
// and releases its chunks when it finishes. The structure comes from the description lib/patterns.js records (global.grindless.
// structures). Every input is injected: their sources (the chain's other steps, Europa's bacteria, the bone and meat lines) are other
// machines.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'luv_biofoundry'
  var BAND = { x0: 15616, x1: 15647, y0: 98, y1: 112, z0: 0, z1: 15 }
  var ROOF_Y = 111
  var Y = 100
  var STEP = 10
  var FORM_TIMEOUT = 600
  // a run that has not started by then never will (the inputs are all in place)
  var START_TICKS = 200
  var HOLD_TICKS = 60
  var SLACK = 120
  var DEADLINE_TICKS = 2600

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLuvBiofoundryRequest'

  var MACHINE = 'gtceu:biofoundry'
  var TYPE = 'gtceu:sterile_culture'
  var LANG_NO_VOIDING = 'grindless.machine.biofoundry.no_voiding'
  var NO_VOIDING = /grindless\.machine\.biofoundry\.no_voiding|Turn voiding off/
  var DATA_KEY = 'grindless_biofoundry'
  var CRAFTING = 'grindless:assembler/biofoundry'
  var STERILE = 'sterile_cleanroom'

  var COPY = { x: 15624, z: 2 }
  var ROLE_BLOCKS = {
    energy: 'gtceu:luv_energy_input_hatch',
    energy2: 'gtceu:luv_energy_input_hatch',
    inBus: 'gtceu:luv_input_bus',
    outBus: 'gtceu:luv_output_bus',
    in1: 'gtceu:luv_input_hatch',
    in2: 'gtceu:luv_input_hatch',
    out1: 'gtceu:luv_output_hatch'
  }
  // 'slice,row,column' of the description (slice 0 = the service wall) -> role
  var PARTS = { '0,1,1': 'energy', '0,1,2': 'energy2', '0,1,3': 'inBus', '0,1,4': 'outBus', '0,1,5': 'in1', '0,1,6': 'in2', '0,1,7': 'out1' }
  var ENERGY = ['energy', 'energy2']
  var INS = ['in1', 'in2']
  var OUTS = ['out1']
  var DOOR = 'minecraft:iron_door'

  var MEAT = 'gtceu:meat_dust'
  var BONE = 'minecraft:bone'
  var BONE_MEAL = 'minecraft:bone_meal'
  var COLLAGEN = 'gtceu:collagen_dust'
  var GELATIN = 'gtceu:gelatin_dust'
  var PHOSPHORUS = 'gtceu:phosphorus_dust'
  var AGAR = 'gtceu:agar_dust'
  var SALT = 'gtceu:salt_dust'
  var CALCIUM = 'gtceu:calcium_dust'
  var TINY_U235 = 'gtceu:tiny_uranium_235_dust'
  var OSMIRIDIUM = 'gtceu:osmiridium_dust'
  var STEM = 'gtceu:stem_cells'
  var WHEAT_SEEDS = 'minecraft:wheat_seeds'
  var BEETROOT_SEEDS = 'minecraft:beetroot_seeds'
  var BARLEY = 'grindless:engineered_barley_seed'
  var TOBACCO = 'grindless:engineered_tobacco_seed'
  var FILLER = 'minecraft:cobblestone'
  var SULFURIC = 'gtceu:sulfuric_acid'
  var DILUTED = 'gtceu:diluted_sulfuric_acid'
  var PHOSPHORIC = 'gtceu:phosphoric_acid'
  var WATER = 'minecraft:water'
  var DISTILLED = 'gtceu:distilled_water'
  var BIOMASS = 'gtceu:biomass'
  var BACTERIA = 'gtceu:bacteria'
  var SLUDGE = 'gtceu:bacterial_sludge'
  var MUTAGEN = 'gtceu:mutagen'
  var MEDIUM = 'gtceu:sterilized_growth_medium'
  // what fills the output hatch in no_voiding_fluids: not the sludge, so the sludge has no room
  var BLOCKER = WATER

  var GTM_ORIGINALS = ['gtceu:mixer/gelatin_mixture', 'gtceu:large_chemical_reactor/stem_cells', 'gtceu:brewery/bacteria']
  var BACTERIA_RECIPE = 'gtceu:brewery/bacteria'
  var CONTROLLER_PARTS = { 'gtceu:luv_machine_hull': 1, 'gtceu:luv_electric_pump': 2, 'gtceu:luv_sensor': 1 }

  // the design (docs/eras/luv.md, "4. Biofoundry", and the package statement): what the composed recipes must give
  var WANT_COMPOSED = {
    collagen_from_bone: {
      circuit: 1, eut: 480, duration: 1600, sourceEnergy: 768000, stages: { 'gtceu:chemical_reactor/collagen_from_bone': 1 },
      itemsIn: [[MEAT, 2], [BONE, 1]], fluidsIn: [[SULFURIC, 1000]], itemsOut: [[COLLAGEN, 2]], fluidsOut: [[DILUTED, 1000]]
    },
    collagen_from_bone_meal: {
      circuit: 2, eut: 480, duration: 800, sourceEnergy: 384000, stages: { 'gtceu:chemical_reactor/collagen_from_bone_meal': 1 },
      itemsIn: [[MEAT, 1], [BONE_MEAL, 1]], fluidsIn: [[SULFURIC, 500]], itemsOut: [[COLLAGEN, 1]], fluidsOut: [[DILUTED, 500]]
    },
    gelatin: {
      circuit: 3, eut: 480, duration: 4800, sourceEnergy: 2304000, stages: { 'gtceu:mixer/gelatin_mixture': 1.5, 'gtceu:centrifuge/gelatin': 1 },
      itemsIn: [[COLLAGEN, 6]], fluidsIn: [[PHOSPHORIC, 1500], [WATER, 4500]], itemsOut: [[GELATIN, 4], [PHOSPHORUS, 1]], fluidsOut: []
    },
    agar: {
      circuit: 4, eut: 480, duration: 600, sourceEnergy: 288000, stages: { 'gtceu:autoclave/agar': 1 },
      itemsIn: [[GELATIN, 1]], fluidsIn: [[DISTILLED, 1000]], itemsOut: [[AGAR, 1]], fluidsOut: []
    },
    bacterial_sludge: {
      circuit: 5, eut: 1920, duration: 600, sourceEnergy: 1152000, stages: { 'gtceu:large_chemical_reactor/bacterial_sludge': 1 },
      itemsIn: [], fluidsIn: [[BIOMASS, 1000], [BACTERIA, 1000]], itemsOut: [], fluidsOut: [[SLUDGE, 1000]]
    },
    mutagen: {
      circuit: 6, eut: 7610, duration: 101, sourceEnergy: 768512,
      stages: { 'gtceu:brewery/enriched_bacterial_sludge_from_u235': 1, 'gtceu:distillery/mutagen': 1 },
      itemsIn: [[TINY_U235, 1]], fluidsIn: [[SLUDGE, 1000]], itemsOut: [], fluidsOut: [[MUTAGEN, 100]]
    },
    sterile_growth_medium: {
      circuit: 7, eut: 7680, duration: 2000, sourceEnergy: 15360000,
      stages: { 'gtceu:mixer/raw_growth_medium': 1, 'gtceu:fluid_heater/sterile_growth_medium': 40 },
      itemsIn: [[MEAT, 4], [SALT, 4], [CALCIUM, 4], [AGAR, 4]], fluidsIn: [[MUTAGEN, 4000]], itemsOut: [], fluidsOut: [[MEDIUM, 4000]]
    },
    stem_cells: {
      circuit: 8, eut: 30720, duration: 300, sourceEnergy: 9216000, stages: { 'gtceu:large_chemical_reactor/stem_cells': 1 },
      itemsIn: [[OSMIRIDIUM, 1]], fluidsIn: [[BACTERIA, 500], [MEDIUM, 500]], itemsOut: [[STEM, 32]], fluidsOut: [[SLUDGE, 500]]
    }
  }
  var WANT_OWN = {
    engineered_barley_seed: {
      circuit: 9, eut: 1920, duration: 600, itemsIn: [[WHEAT_SEEDS, 1]], fluidsIn: [[BACTERIA, 250]], itemsOut: [[BARLEY, 1]], fluidsOut: []
    },
    engineered_tobacco_seed: {
      circuit: 10, eut: 1920, duration: 600, itemsIn: [[BEETROOT_SEEDS, 1]], fluidsIn: [[BACTERIA, 250]], itemsOut: [[TOBACCO, 1]], fluidsOut: []
    }
  }

  // the built hall's runs: inputs (fluids into in1, in2 in order) and exactly what must come out
  var RUNS = {
    gelatin: {
      check: 'PROCESS_gelatin', oc: 'oc_gelatin', recipe: 'gelatin', circuit: 3, items: [[COLLAGEN, 6]], fluids: [[PHOSPHORIC, 1500], [WATER, 4500]],
      itemsOut: [[GELATIN, 4], [PHOSPHORUS, 1]], fluidsOut: [], next: 'medium',
      text: 'c3: 6 collagen + 1 500 mB phosphoric acid + 4 500 mB water'
    },
    medium: {
      check: 'PROCESS_medium', oc: 'oc_medium', recipe: 'sterile_growth_medium', circuit: 7, items: [[MEAT, 4], [SALT, 4], [CALCIUM, 4], [AGAR, 4]],
      fluids: [[MUTAGEN, 4000]], itemsOut: [], fluidsOut: [[MEDIUM, 4000]], next: 'stem_cells',
      text: 'c7: 4 meat + 4 salt + 4 calcium + 4 agar + 4 000 mB mutagen'
    },
    stem_cells: {
      check: 'PROCESS_stem_cells', oc: 'oc_stem_cells', recipe: 'stem_cells', circuit: 8, items: [[OSMIRIDIUM, 1]], fluids: [[BACTERIA, 500], [MEDIUM, 500]],
      itemsOut: [[STEM, 32]], fluidsOut: [[SLUDGE, 500]], next: 'room',
      text: 'c8: 1 osmiridium + 500 mB bacteria + 500 mB sterilized medium'
    },
    resume: {
      check: 'resumes', oc: null, recipe: 'stem_cells', circuit: 8, items: [[OSMIRIDIUM, 1]], fluids: [[BACTERIA, 500], [MEDIUM, 500]],
      itemsOut: [[STEM, 32]], fluidsOut: [[SLUDGE, 500]], next: 'done',
      text: 'voiding off, the water taken out of the output hatch: c8'
    }
  }
  var STUCK_CHECKS = ['contained_room', 'no_voiding_items', 'no_voiding_fluids', 'resumes']

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
        MultiblockDefinition: Java.loadClass('com.gregtechceu.gtceu.api.machine.MultiblockMachineDefinition'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
        ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
        AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
      }
    }
    return classes
  }

  function BF() {
    return (global.grindless || {}).biofoundry || {}
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

  function union(a, b) {
    var seen = {}
    return a.concat(b).filter(function (k) {
      if (seen[k] === true) return false
      seen[k] = true
      return true
    })
  }

  function cmd(command) {
    return Number(S.server.runCommandSilent(command))
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

  function fillBus(bus, id) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of(id, 64))
    return inv.getSlots()
  }

  // inserts n of an item, slot after slot
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

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function inputEUt(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    if (io.isEmpty()) return 0
    return io.isInput() ? Number(io.getTotalEU()) : -Number(io.getTotalEU())
  }

  // the item contents of one side of a recipe, with their chance: [{ id, count, chance, circuit }]
  function itemContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.ItemCap) : recipe.getOutputContents(c.ItemCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputItems(recipe) : c.RecipeHelper.getOutputItems(recipe))
    return stacks.map(function (st, i) {
      var circuit = c.Circuit.isIntegratedCircuit(st) ? Number(c.Circuit.getCircuitConfiguration(st)) : 0
      return { id: itemName(st), count: Number(st.getCount()), chance: Number(contents[i].chance), circuit: circuit }
    })
  }

  function fluidContents(recipe, input) {
    var c = lazy()
    return asArray(input ? c.RecipeHelper.getInputFluids(recipe) : c.RecipeHelper.getOutputFluids(recipe)).map(function (st) {
      return { id: fluidName(st), amount: Number(st.getAmount()) }
    })
  }

  // a GT recipe's conditions: 'cleanroom:<type>' for GTM's cleanroom condition, the class name for any other
  function conditionsOf(recipe) {
    var out = []
    asArray(recipe.conditions).forEach(function (c) {
      var name = String(c.getClass().getSimpleName())
      if (name !== 'CleanroomCondition') {
        out.push(name)
        return
      }
      var type = 'none'
      try {
        var room = c.getCleanroom()
        if (room !== null && room !== undefined) type = String(room.getName())
      } catch (e) {
        type = 'unreadable'
      }
      out.push('cleanroom:' + type)
    })
    return out
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

  function published(name) {
    return (BF().recipes || []).filter(function (r) { return String(r.name) === name })[0] || null
  }

  // GTUtil.getOCTierByVoltage: the lowest tier whose voltage (8 x 4^tier) holds v
  function ocTier(v) {
    var t = 0
    var cap = 8
    while (cap < v) {
      cap *= 4
      t++
    }
    return t
  }

  // GTM 7.5.3 OverclockingLogic.getModifier + standardOC with OC_NON_PERFECT's factors (EU/t x4, duration x0.5 per overclock)
  function predictOC(eut, duration, ocVoltage) {
    var ocs = ocTier(ocVoltage) - ocTier(eut)
    if (ocTier(eut) === 0) ocs--
    var e = eut
    var d = duration
    var n = 0
    while (ocs-- > 0) {
      if (e * 4 > ocVoltage) break
      if (d * 0.5 < 1) break
      d = d * 0.5
      e = e * 4
      n++
    }
    var eutOut = Math.floor(eut * Math.pow(4, n))
    var durOut = Math.max(1, Math.floor(duration * Math.pow(0.5, n)))
    return { ocs: n, eut: eutOut, duration: durOut, energy: eutOut * durOut }
  }

  // ---------------------------------------------------------------- static checks

  function countChar(desc, ch) {
    var n = 0
    desc.slices.forEach(function (rows) {
      rows.forEach(function (row) {
        for (var i = 0; i < row.length; i++) if (row.charAt(i) === ch) n++
      })
    })
    return n
  }

  // [[id, n], ...] against [{ id, count|whole, chance }]: inputs used up (10 000), outputs whole (chance 0)
  function sameItems(want, got, field, chance) {
    if (want.length !== got.length) return false
    for (var i = 0; i < want.length; i++) {
      var g = got.filter(function (x) { return String(x.id) === want[i][0] })[0]
      if (!g || Number(g[field]) !== want[i][1] || Number(g.chance) !== chance) return false
    }
    return true
  }

  function sameFluids(want, got) {
    if (want.length !== got.length) return false
    for (var i = 0; i < want.length; i++) {
      var g = got.filter(function (x) { return String(x.id) === want[i][0] })[0]
      if (!g || Number(g.amount) !== want[i][1]) return false
    }
    return true
  }

  // a published recipe against the design: composed ones (w.stages) also by their stages and the stages' energy
  function recipeProblems(name, r, w, kind) {
    var problems = []
    if (r === null) return [name + ' was not published']
    if (String(r.kind) !== kind) problems.push(name + ' kind ' + r.kind)
    if (Number(r.circuit) !== w.circuit) problems.push(name + ' circuit ' + r.circuit + ', want ' + w.circuit)
    if (Number(r.eut) !== w.eut || Number(r.duration) !== w.duration) problems.push(name + ' ' + r.eut + ' EU/t x ' + r.duration + ' t, want ' + w.eut + ' x ' + w.duration)
    if (Number(r.energy) !== Number(r.eut) * Number(r.duration)) problems.push(name + ' energy ' + r.energy + ' is not EU/t x duration')
    if (w.stages) {
      var sources = r.sources || []
      var names = Object.keys(w.stages)
      if (sources.length !== names.length) problems.push(name + ' ' + sources.length + ' stages, want ' + names.length)
      sources.forEach(function (s) {
        var want = w.stages[String(s.id)]
        if (want === undefined) problems.push(name + ' unexpected stage ' + s.id)
        else if (Math.abs(Number(s.scale) - want) > 1e-6) problems.push(name + ' stage ' + short(s.id) + ' x' + s.scale + ', want x' + want)
      })
      var source = Number(r.sourceEnergy)
      if (Math.abs(source - w.sourceEnergy) > 1e-6) problems.push(name + ' stages ' + source + ' EU, design ' + w.sourceEnergy)
      if (!(Number(r.energy) >= source && Number(r.energy) < source + Number(r.duration))) problems.push(name + ' costs ' + r.energy + ' EU for ' + source + ' of stages')
    }
    if (!sameItems(w.itemsIn, r.itemsIn, 'count', 10000)) problems.push(name + ' items in ' + JSON.stringify(r.itemsIn))
    if (!sameFluids(w.fluidsIn, r.fluidsIn)) problems.push(name + ' fluids in ' + JSON.stringify(r.fluidsIn))
    if (!sameItems(w.itemsOut, r.itemsOut, 'whole', 0)) problems.push(name + ' items out ' + JSON.stringify(r.itemsOut))
    if (!sameFluids(w.fluidsOut, r.fluidsOut)) problems.push(name + ' fluids out ' + JSON.stringify(r.fluidsOut))
    return problems
  }

  function line(r) {
    return r.itemsIn.map(function (x) { return x.count + ' ' + short(x.id) + (Number(x.chance) < 10000 ? '@' + x.chance : '') })
      .concat(r.fluidsIn.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') + ' -> ' +
      r.itemsOut.map(function (x) { return (Number(x.whole) > 0 ? x.whole + ' ' : '') + short(x.id) + (Number(x.chance) > 0 ? '@' + x.chance : '') })
        .concat(r.fluidsOut.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') +
      (r.sources ? ', stages ' + r.sources.map(function (s) { return short(s.id) + ' x' + Math.round(Number(s.scale) * 1e6) / 1e6 }).join(' ') + ' = ' +
        r.sourceEnergy + ' EU' : '') + ', ' + r.duration + ' t x ' + r.eut + ' EU/t = ' + r.energy
  }

  // a published recipe against its live copy in the recipe manager: [problems], and its lookup keys
  function liveProblems(rec) {
    var problems = []
    var r = liveRecipe(String(rec.recipeId))
    if (r === null) return { problems: [rec.recipeId + ' not in the recipe manager'], keys: [] }
    var items = itemContents(r, true)
    var circuit = items.filter(function (x) { return x.circuit > 0 })
    var ins = items.filter(function (x) { return x.circuit === 0 })
    if (circuit.length !== 1 || circuit[0].circuit !== Number(rec.circuit)) problems.push(rec.name + ' circuit ' + JSON.stringify(circuit))
    var wantIn = rec.itemsIn.map(function (x) { return x.id + ' x' + x.count + ' @' + x.chance }).sort().join(',')
    var gotIn = ins.map(function (x) { return x.id + ' x' + x.count + ' @' + x.chance }).sort().join(',')
    if (wantIn !== gotIn) problems.push(rec.name + ' items in ' + gotIn + ' (want ' + wantIn + ')')
    var wantOut = []
    rec.itemsOut.forEach(function (o) {
      if (Number(o.whole) > 0) wantOut.push(o.id + ' x' + o.whole + ' @10000')
      if (Number(o.chance) > 0) wantOut.push(o.id + ' x1 @' + o.chance)
    })
    var gotOut = itemContents(r, false).map(function (x) { return x.id + ' x' + x.count + ' @' + x.chance })
    if (wantOut.sort().join(',') !== gotOut.sort().join(',')) problems.push(rec.name + ' items out ' + gotOut.join(',') + ' (want ' + wantOut.join(',') + ')')
    var fin = fluidContents(r, true).map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
    var fout = fluidContents(r, false).map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
    if (fin !== rec.fluidsIn.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')) problems.push(rec.name + ' fluids in ' + fin)
    if (fout !== rec.fluidsOut.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')) problems.push(rec.name + ' fluids out ' + fout)
    var eut = inputEUt(r)
    if (eut !== Number(rec.eut) || Number(r.duration) !== Number(rec.duration)) problems.push(rec.name + ' ' + eut + ' EU/t x ' + r.duration + ' t')
    var key = String(r.data.getString(DATA_KEY))
    if (key !== String(rec.name)) problems.push(rec.name + ' data ' + DATA_KEY + '=' + key)
    var keys = ins.map(function (x) { return 'i:' + x.id }).concat(fluidContents(r, true).map(function (f) { return 'f:' + f.id })).concat(['circuit:' + rec.circuit])
    return { problems: problems, keys: keys }
  }

  function staticChecks() {
    safely('registration', function () {
      var problems = []
      var def = GTRegistries.MACHINES.get(rl(MACHINE))
      if (def === null || def === undefined) throw new Error(MACHINE + ' is not registered')
      var multi = def instanceof lazy().MultiblockDefinition
      if (!multi) problems.push('not a multiblock definition (' + def.getClass().getSimpleName() + ')')
      var types = []
      var arr = def.getRecipeTypes()
      for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
      if (types.join(',') !== TYPE) problems.push('types ' + types.join(','))
      if (def.isGenerator() !== false) problems.push('isGenerator=' + def.isGenerator())
      if (def.isAlwaysTryModifyRecipe() !== true) problems.push('the modifier is not run before every recipe')
      var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE))
      var sizes = []
      if (type === null || type === undefined) {
        problems.push(TYPE + ' is not in GTRegistries.RECIPE_TYPES')
      } else {
        var c = lazy()
        sizes = [type.getMaxInputs(c.ItemCap), type.getMaxOutputs(c.ItemCap), type.getMaxInputs(c.FluidCap), type.getMaxOutputs(c.FluidCap)].map(Number)
        var io = BF().maxIO || {}
        if (sizes.join(',') !== [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut].map(Number).join(',')) problems.push('type IO ' + sizes.join('/') + ' published ' + JSON.stringify(io))
      }
      var desc = ((global.grindless || {}).structures || {})[MACHINE]
      var shape = 'none'
      if (!desc) {
        problems.push('no structure description in global.grindless.structures')
      } else {
        var w = desc.slices[0][0].length
        var h = desc.slices[0].length
        var d = desc.slices.length
        var counts = { X: countChar(desc, 'X'), D: countChar(desc, 'D'), U: countChar(desc, 'U'), S: countChar(desc, 'S') }
        shape = w + 'x' + h + 'x' + d + ' X=' + counts.X + ' D=' + counts.D + ' U=' + counts.U + ' S=' + counts.S
        if (w !== 9 || h !== 6 || d !== 9) problems.push('the hall is ' + w + 'x' + h + 'x' + d + ', want 9x6x9')
        if (counts.X !== 21 || counts.D !== 4 || counts.U !== 9 || counts.S !== 1) problems.push('cells ' + JSON.stringify(counts) + ', want X 21, D 4, U 9, S 1')
        var x = desc.symbols.X || {}
        var abilities = x.kind === 'oneOf' ? x.options.filter(function (o) { return o.kind === 'part' }).map(function (o) { return String(o.ability) }) : []
        var missing = ['energy_input', 'input_bus', 'output_bus', 'input_hatch', 'output_hatch', 'parallel_hatch'].filter(function (a) { return abilities.indexOf(a) < 0 })
        if (missing.length > 0) problems.push('the part cells take no ' + missing.join(', '))
        if (!desc.symbols.D || (desc.symbols.D.blocks || [])[0] !== DOOR) problems.push('D is not ' + DOOR)
      }
      var listed = (((global.grindless || {}).parallelHatch || {}).machines || []).indexOf(MACHINE) >= 0
      if (!listed) problems.push(MACHINE + ' is not in global.grindless.parallelHatch.machines')
      if (String(BF().noVoiding) !== LANG_NO_VOIDING || String(BF().dataKey) !== DATA_KEY) problems.push('published noVoiding ' + BF().noVoiding + ', dataKey ' + BF().dataKey)
      check('registration', problems.length === 0, MACHINE + ': multiblock=' + multi + ' types=[' + types.join(',') + '] generator=' + def.isGenerator() +
        ' alwaysTryModifyRecipe=' + def.isAlwaysTryModifyRecipe() + ' IO=' + sizes.join('/') + ' structure ' + shape +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('composed', function () {
      var problems = []
      var lines = []
      var skipped = (BF().skipped || []).filter(function (s) { return WANT_COMPOSED[String(s.name)] !== undefined })
      if (skipped.length > 0) problems.push('skipped: ' + skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join(', '))
      var stageIds = BF().stageIds || []
      if (Number(BF().stagesRead) !== 11 || stageIds.length !== 11) problems.push(BF().stagesRead + ' live stages read of ' + stageIds.length + ', want 11 of 11')
      Object.keys(WANT_COMPOSED).forEach(function (name) {
        var r = published(name)
        problems = problems.concat(recipeProblems(name, r, WANT_COMPOSED[name], 'composed'))
        if (r !== null) lines.push('c' + r.circuit + ' ' + name + ': ' + line(r))
      })
      var extra = (BF().recipes || []).filter(function (r) { return String(r.kind) === 'composed' && WANT_COMPOSED[String(r.name)] === undefined })
      if (extra.length > 0) problems.push('unexpected composed recipes: ' + extra.map(function (r) { return r.name }).join(', '))
      check('composed', problems.length === 0, lines.length + ' of 8 composed from ' + BF().stagesRead + ' of ' + stageIds.length + ' live stages: ' +
        lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('own_recipes', function () {
      var problems = []
      var lines = []
      var seeds = [BARLEY, TOBACCO].filter(function (id) { return !Item.exists(id) })
      if (seeds.length > 0) problems.push('the seed items are not registered (LuV-A1 not merged?): ' + seeds.join(', '))
      var skipped = (BF().skipped || []).filter(function (s) { return WANT_OWN[String(s.name)] !== undefined })
      if (skipped.length > 0) problems.push('skipped: ' + skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join(', '))
      Object.keys(WANT_OWN).forEach(function (name) {
        var r = published(name)
        if (r === null && skipped.some(function (s) { return String(s.name) === name })) return
        problems = problems.concat(recipeProblems(name, r, WANT_OWN[name], 'own'))
        if (r !== null) lines.push('c' + r.circuit + ' ' + name + ': ' + line(r))
      })
      check('own_recipes', problems.length === 0, lines.length + ' of 2 own recipes: ' + lines.join(' ; ') +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('live_contents', function () {
      var problems = []
      var sets = []
      var recipes = BF().recipes || []
      recipes.forEach(function (rec) {
        var res = liveProblems(rec)
        problems = problems.concat(res.problems)
        if (res.keys.length > 0) sets.push({ name: String(rec.name), keys: res.keys })
        if (String(rec.recipeId) !== 'grindless:sterile_culture/' + rec.name) problems.push(rec.name + ' id ' + rec.recipeId)
      })
      var live = asArray(S.server.getRecipeManager().getAllRecipesFor(GTRegistries.RECIPE_TYPES.get(rl(TYPE)))).length
      if (live !== recipes.length) problems.push(live + ' live ' + TYPE + ' recipes for ' + recipes.length + ' published')
      check('live_contents', problems.length === 0 && recipes.length > 0, recipes.length + ' published recipes checked against the recipe manager (' + live +
        ' live of the type)' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      S.sets = sets
    })

    safely('no_sterile_condition', function () {
      var problems = []
      var ours = []
      ;(BF().recipes || []).forEach(function (rec) {
        var r = liveRecipe(String(rec.recipeId))
        if (r === null) {
          problems.push(rec.recipeId + ' not in the recipe manager')
          return
        }
        var conds = conditionsOf(r)
        var rooms = conds.filter(function (c) { return c.indexOf('cleanroom:') === 0 })
        if (rooms.length > 0) problems.push(rec.name + ' carries ' + rooms.join(','))
        if (conds.length > 0) ours.push(rec.name + ' [' + conds.join(',') + ']')
      })
      var originals = GTM_ORIGINALS.map(function (id) {
        var r = liveRecipe(id)
        if (r === null) {
          // Europa's package (B8) cuts GTM's bacteria recipe beside its replacement: gone is right once it has landed
          if (id === BACTERIA_RECIPE) return short(id) + ' cut (B8)'
          problems.push(id + ' is gone')
          return short(id) + ' missing'
        }
        var conds = conditionsOf(r)
        if (conds.indexOf('cleanroom:' + STERILE) < 0) problems.push(id + ' lost its sterile cleanroom (conditions [' + conds.join(',') + '])')
        return short(id) + ' [' + conds.join(',') + ']'
      })
      check('no_sterile_condition', problems.length === 0, (BF().recipes || []).length + ' of ours, conditions: ' + (ours.length > 0 ? ours.join(', ') : 'none') +
        '; GTM\'s: ' + originals.join(', ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      var stages = (BF().stageIds || []).map(function (id) {
        var r = liveRecipe(String(id))
        return short(id) + (r === null ? ' (not live)' : ' [' + conditionsOf(r).join(',') + ']')
      })
      note('gtm_stages', stages.length + ' stages composed from: ' + stages.join(', '))
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
      var script = BF().clashes || []
      var count = (BF().recipes || []).length
      check('lookup_safety', sets.length === count && count > 0 && clashes.length === 0 && script.length === 0, sets.length + ' input sets, none a subset of another' +
        (clashes.length + script.length > 0 ? ' | clashes: ' + clashes.concat(script).join('; ') : ''))
    })

    safely('controller_recipe', function () {
      var id = String(BF().craftingRecipe || CRAFTING)
      var r = liveRecipe(id)
      if (r === null) throw new Error(id + ' missing')
      var problems = []
      var outs = itemContents(r, false)
      var ins = itemContents(r, true)
      if (outs.length !== 1 || outs[0].id !== MACHINE || outs[0].count !== 1) problems.push('makes ' + JSON.stringify(outs))
      Object.keys(CONTROLLER_PARTS).forEach(function (part) {
        var got = ins.filter(function (x) { return x.id === part }).reduce(function (a, x) { return a + x.count }, 0)
        if (got !== CONTROLLER_PARTS[part]) problems.push(short(part) + ' x' + got + ', want ' + CONTROLLER_PARTS[part])
      })
      var circuits = ins.filter(function (x) { return CONTROLLER_PARTS[x.id] === undefined })
      if (circuits.length !== 1 || circuits[0].count !== 4) problems.push('the circuits ' + JSON.stringify(circuits) + ', want 4 of #gtceu:circuits/luv')
      if (id !== CRAFTING) problems.push('published as ' + id)
      if (inputEUt(r) !== 7680 || Number(r.duration) !== 600) problems.push(inputEUt(r) + ' EU/t x ' + r.duration + ' t, want 7680 x 600')
      check('controller_recipe', problems.length === 0, id + ' -> ' + outs.map(function (x) { return short(x.id) }).join(',') + ' from [' +
        ins.map(function (x) { return x.count + ' ' + short(x.id) }).join(', ') + '] at ' + inputEUt(r) + ' EU/t x ' + r.duration + ' t' +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })
  }

  // ---------------------------------------------------------------- the hall

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
  function planOf() {
    var desc = ((global.grindless || {}).structures || {})[MACHINE]
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
          var c = { x: COPY.x - (ci - ctrl.ci), y: cy + (ri - ctrl.ri), z: COPY.z - (si - ctrl.si), ch: ch, id: null, props: '', role: null }
          var role = PARTS[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = MACHINE
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (role !== undefined) {
            if (sym.kind !== 'oneOf') throw new Error('the part cell ' + si + ',' + ri + ',' + ci + ' is a ' + sym.kind + ' cell')
            c.id = ROLE_BLOCKS[role]
            c.props = '[facing=south]'
            c.role = role
          } else {
            c.id = plainBlock(sym)
            if (c.id === DOOR) {
              // rows go bottom -> top: the lower half is placed first, the upper half on it
              var upper = ri > 0 && rows[ri - 1].charAt(ci) === ch
              c.props = '[facing=north,half=' + (upper ? 'upper' : 'lower') + ',hinge=left,open=false,powered=false]'
            }
          }
          cells.push(c)
        }
      })
    })
    return { cells: cells, width: desc.slices[0][0].length, height: desc.slices[0].length, depth: desc.slices.length }
  }

  function setBlock(x, y, z, id, props) {
    return cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + (props || '') + ' replace')
  }

  function place(m) {
    var plan = planOf()
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
      if (setBlock(c.x, c.y, c.z, c.id, c.props) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.id + c.props)
    })
    if (setBlock(ctrlCell.x, ctrlCell.y, ctrlCell.z, ctrlCell.id, ctrlCell.props) < 1) failed.push('controller')
    m.ctrlPos = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return short(id) + ' x' + tally[id] }).join(', ')
    check('PLACED', failed.length === 0 && wrong.length === 0, plan.cells.length + ' blocks, ' + plan.width + 'x' + plan.height + 'x' +
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

  // ---------------------------------------------------------------- the runs

  function setVoiding(m, mode) {
    m.ctrl.setVoidingMode(lazy().VoidingMode[mode])
    wake(m.ctrl)
  }

  // the energy hatches are topped up every tick; what they lost since the last tick is what the machine drew
  function meter(m) {
    ENERGY.forEach(function (role) {
      if (!m.P[role]) return
      var c = m.P[role].energyContainer
      var cap = Number(c.getEnergyCapacity())
      var stored = Number(c.getEnergyStored())
      if (m.metered) m.euUsed += cap - stored
      c.setEnergyStored(cap)
    })
    m.metered = true
  }

  // empties every part, the circuit too
  function clearParts(m) {
    emptyBus(m.P.inBus)
    emptyBus(m.P.outBus)
    INS.forEach(function (role) { setTank(m.P[role], null, 0) })
    OUTS.forEach(function (role) { setTank(m.P[role], null, 0) })
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().ItemStack.EMPTY)
  }

  // a run's inputs: the circuit, the items into the input bus, the fluids into the input hatches in order
  function fillInputs(m, run) {
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(run.circuit))
    run.items.forEach(function (x) { insert(m.P.inBus, x[0], x[1]) })
    run.fluids.forEach(function (f, i) { setTank(m.P[INS[i]], f[0], f[1]) })
  }

  function begin(m, phase) {
    m.phase = phase
    m.t0 = S.t
    m.seen = {}
    m.seenWorking = false
    m.runTicks = 0
    m.runEut = 0
    m.runOc = 0
    m.eu0 = m.euUsed
    wake(m.ctrl)
  }

  function startRun(m, phase) {
    var run = RUNS[phase]
    var rec = published(run.recipe)
    m.run = run
    m.rec = rec
    if (rec === null) {
      check(run.check, false, 'the recipe ' + run.recipe + ' was not published (skipped: ' + JSON.stringify(BF().skipped || []) + ')')
      afterRun(m, run)
      return
    }
    clearParts(m)
    fillInputs(m, run)
    begin(m, phase)
  }

  // the stem cells loaded again with the output bus full: nothing may start until voiding is off and there is room
  function startStuck(m) {
    var rec = published('stem_cells')
    if (rec === null) {
      STUCK_CHECKS.forEach(function (name) { check(name, false, 'no stem_cells recipe to hold back') })
      m.phase = 'done'
      return
    }
    m.rec = rec
    m.run = RUNS.resume
    clearParts(m)
    m.busSlots = fillBus(m.P.outBus, FILLER)
    fillInputs(m, RUNS.resume)
    begin(m, 'room')
  }

  function afterRun(m, run) {
    if (run.next === 'room') startStuck(m)
    else if (run.next === 'done') m.phase = 'done'
    else startRun(m, run.next)
  }

  // over once it ran and went idle; a run that never started is over after START_TICKS, one that hangs after its duration and SLACK
  function runOver(m, age) {
    if (m.seenWorking) return statusOf(m.ctrl) === 'IDLE' || age >= m.runTicks + SLACK
    return age >= START_TICKS
  }

  // what a run left: items in the output bus, fluids in the output hatch, what is still in the inputs and the EU drawn
  function result(m) {
    return {
      out: readBus(m.P.outBus),
      fluids: outFluids(m),
      left: readBus(m.P.inBus),
      tanks: INS.map(function (role) { return tankInfo(m.P[role]) }),
      eu: m.euUsed - m.eu0
    }
  }

  function runProblems(m, run, rec, r) {
    var problems = []
    if (m.seen[String(rec.recipeId)] !== true) problems.push(rec.recipeId + ' never ran (seen [' + Object.keys(m.seen).join(',') + ']) reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
    var want = {}
    run.itemsOut.forEach(function (x) { want[x[0]] = x[1] })
    union(Object.keys(want), Object.keys(r.out)).forEach(function (id) {
      if ((r.out[id] || 0) !== (want[id] || 0)) problems.push(short(id) + ' x' + (r.out[id] || 0) + ', want ' + (want[id] || 0))
    })
    var wantF = {}
    run.fluidsOut.forEach(function (f) { wantF[f[0]] = f[1] })
    union(Object.keys(wantF), Object.keys(r.fluids)).forEach(function (id) {
      if ((r.fluids[id] || 0) !== (wantF[id] || 0)) problems.push(short(id) + ' ' + (r.fluids[id] || 0) + ' mB, want ' + (wantF[id] || 0))
    })
    if (Object.keys(r.left).length > 0) problems.push('left in the bus ' + summary(r.left))
    r.tanks.forEach(function (t, i) { if (t.amount !== 0) problems.push(INS[i] + ' kept ' + t.amount + ' mB ' + short(t.id)) })
    if (!(r.eu >= Number(rec.energy))) problems.push(r.eu + ' EU drawn, less than the recipe\'s ' + rec.energy)
    return problems
  }

  function ocNote(m, run, rec, r) {
    var p = predictOC(Number(rec.eut), Number(rec.duration), m.ocVoltage)
    var same = p.eut === m.runEut && p.duration === m.runTicks && p.energy === r.eu
    note(run.oc, 'circuit ' + run.circuit + ': ' + rec.eut + ' EU/t x ' + rec.duration + ' t = ' + rec.energy + ' EU at ' + m.ocVoltage + ' V -> predicted ' +
      p.ocs + ' overclocks (EU/t x4, duration x0.5 each): ' + p.eut + ' EU/t x ' + p.duration + ' t = ' + p.energy + ' EU; observed ' + m.runEut + ' EU/t x ' +
      m.runTicks + ' t (ocLevel ' + m.runOc + '), ' + r.eu + ' EU drawn' + (same ? ', as predicted' : ', not as predicted'))
  }

  function finishRun(m) {
    var run = m.run
    var rec = m.rec
    var r = result(m)
    var problems = runProblems(m, run, rec, r)
    var carried = ''
    if (run === RUNS.stem_cells) {
      carried = m.mediumMade >= 500 ? ' (the medium: 500 mB of the ' + m.mediumMade + ' mB the c7 run made; the bacteria injected)' :
        ' (the medium injected: the c7 run made ' + m.mediumMade + ' mB; the bacteria injected)'
    }
    check(run.check, problems.length === 0, run.text + ', circuit ' + run.circuit + carried + ' -> [' + summary(r.out) + '], ' + fluidSummary(r.fluids) +
      '; ' + r.eu + ' EU drawn (the recipe: ' + rec.duration + ' t x ' + rec.eut + ' EU/t = ' + rec.energy + ') | ' + state(m.ctrl) +
      (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    if (run.oc) ocNote(m, run, rec, r)
    if (run === RUNS.medium) m.mediumMade = r.fluids[MEDIUM] || 0
    afterRun(m, run)
  }

  // nothing ran since the scenario began: the bacteria, the medium and the osmiridium are untouched and no EU was drawn
  function stillBlocked(m) {
    return tankInfo(m.P.in1).amount === 500 && tankInfo(m.P.in2).amount === 500 && (readBus(m.P.inBus)[OSMIRIDIUM] || 0) === 1 &&
      m.euUsed === m.eu0 && Object.keys(m.seen).length === 0
  }

  function blockedDetail(m) {
    return tankInfo(m.P.in1).amount + ' mB bacteria and ' + tankInfo(m.P.in2).amount + ' mB medium left, ' + (readBus(m.P.inBus)[OSMIRIDIUM] || 0) +
      ' osmiridium in the bus, ' + (m.euUsed - m.eu0) + ' EU, ran [' + Object.keys(m.seen).join(',') + '] | ' + state(m.ctrl) +
      ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']'
  }

  function refusalShown(m) {
    return failureReasons(m.ctrl).some(function (x) { return NO_VOIDING.test(x) })
  }

  function stuckStep(m, age) {
    if (age < HOLD_TICKS) return
    if (m.phase === 'room') {
      check('contained_room', stillBlocked(m), 'output bus full (' + m.busSlots + ' slots of ' + short(FILLER) + '), voiding off: ' + blockedDetail(m))
      setVoiding(m, 'VOID_ITEMS')
      begin(m, 'void_items')
      return
    }
    if (m.phase === 'void_items') {
      var shown = refusalShown(m)
      check('no_voiding_items', stillBlocked(m) && shown, 'output bus full, controller set to void items: refusal shown=' + shown + ', ' + blockedDetail(m))
      emptyBus(m.P.outBus)
      setTank(m.P.out1, BLOCKER, 1000)
      setVoiding(m, 'VOID_FLUIDS')
      begin(m, 'void_fluids')
      return
    }
    if (m.phase === 'void_fluids') {
      var shown2 = refusalShown(m)
      var outs = readBus(m.P.outBus)
      var hatch = tankInfo(m.P.out1)
      var kept = Object.keys(outs).length === 0 && hatch.id === BLOCKER && hatch.amount === 1000
      check('no_voiding_fluids', stillBlocked(m) && shown2 && kept, 'bus emptied, the output hatch holding ' + hatch.amount + ' mB ' + short(hatch.id) +
        ', controller set to void fluids: refusal shown=' + shown2 + ', output bus [' + summary(outs) + '], ' + blockedDetail(m))
      setTank(m.P.out1, null, 0)
      setVoiding(m, 'VOID_NONE')
      begin(m, 'resume')
    }
  }

  // ---------------------------------------------------------------- the world

  function prepareWorld() {
    S.areaTouched = true
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    var loaded = cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    // a roof over the area: a hatch that is rained on may explode (GTM's weather check)
    cmd('fill ' + BAND.x0 + ' ' + ROOF_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + ROOF_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
    note('AREA', 'X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ' generated, forceload add ' + loaded +
      ', changed ' + cleared + ' blocks while clearing, roof at Y ' + ROOF_Y)
  }

  function dropItems() {
    var c = lazy()
    var list = S.level.getEntitiesOfClass(c.ItemEntity, new c.AABB(BAND.x0, BAND.y0, BAND.z0, BAND.x1 + 1, BAND.y1 + 1, BAND.z1 + 1))
    for (var i = 0; i < list.size(); i++) list.get(i).discard()
    return list.size()
  }

  function cleanup() {
    if (S === null || !S.areaTouched) return
    S.areaTouched = false
    var m = S.m
    try {
      // the buses would drop what they hold when they go
      if (m && m.P) {
        if (m.P.inBus) {
          emptyBus(m.P.inBus)
          m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().ItemStack.EMPTY)
        }
        if (m.P.outBus) emptyBus(m.P.outBus)
      }
    } catch (e) { /* the item sweep below removes what they drop */ }
    var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    var items = dropItems()
    var released = cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    note('CLEANUP', 'cleared ' + cleared + ' blocks, ' + items + ' item entities removed, forceload remove ' + released)
  }

  // ---------------------------------------------------------------- run

  function formed(m) {
    safely('PARTS', function () {
      m.ctrl = machineAt(m.ctrlPos)
      m.P = findParts(m, m.ctrl)
      var want = {}
      Object.keys(PARTS).forEach(function (k) { want[PARTS[k]] = true })
      var missing = Object.keys(want).filter(function (role) { return !m.P[role] })
      check('PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + ']' + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      if (missing.length > 0) {
        m.phase = 'done'
        return
      }
      meter(m)
      try {
        m.ocVoltage = Number(m.ctrl.getOverclockVoltage())
        var plan = ['gelatin', 'medium', 'stem_cells'].map(function (phase) {
          var rec = published(RUNS[phase].recipe)
          if (rec === null) return phase + ' not published'
          var p = predictOC(Number(rec.eut), Number(rec.duration), m.ocVoltage)
          return 'c' + RUNS[phase].circuit + ' ' + rec.eut + ' EU/t x ' + rec.duration + ' t -> ' + p.ocs + ' OCs, ' + p.eut + ' EU/t x ' + p.duration + ' t'
        })
        note('oc_plan', 'tier ' + m.ctrl.getTier() + ' (max overclock tier ' + m.ctrl.getMaxOverclockTier() + '), overclock voltage ' + m.ocVoltage + ' V, hatches ' +
          ENERGY.map(function (role) { return Number(m.P[role].energyContainer.getEnergyCapacity()) + ' EU' }).join(' + ') + ': ' + plan.join('; '))
      } catch (e) {
        note('oc_plan', 'unreadable: ' + e)
      }
      startRun(m, 'gelatin')
    })
    if (m.phase === 'formed') m.phase = 'done'
  }

  function formStep(m) {
    var waited = S.t - S.t0
    var ctrl = machineAt(m.ctrlPos)
    if (ctrl === null || ctrl === undefined) {
      check('FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    if (ctrl.isFormed()) {
      check('FORMED', true, (m.forced ? 'after a forced check' : 'by itself after ' + waited + ' ticks') + ', class=' +
        String(ctrl.getClass().getSimpleName()) + ' parts=' + asArray(ctrl.getParts()).length)
      m.phase = 'formed'
      formed(m)
      return
    }
    if (waited >= FORM_TIMEOUT && !m.forced) {
      if (!ctrl.checkPatternWithLock()) {
        check('FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
        m.phase = 'done'
        return
      }
      check('FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
      ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
      ctrl.onStructureFormed()
      m.forced = true
    } else if (waited >= 2 * FORM_TIMEOUT) {
      check('FORMED', false, 'still not formed after a forced check')
      m.phase = 'done'
    }
  }

  // every tick: the energy the controller drew, and what it runs (the overclocked EU/t and duration of the run)
  function measure(m) {
    if (!m.ctrl || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
    meter(m)
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) {
      m.seenWorking = true
      m.seen[String(last.id)] = true
      var d = Number(rlg.getDuration())
      if (d > m.runTicks) m.runTicks = d
      m.runEut = inputEUt(last)
      m.runOc = Number(last.ocLevel)
    }
  }

  function step(m) {
    if (m.phase === 'forming') {
      formStep(m)
      return
    }
    var age = S.t - m.t0
    if (RUNS[m.phase] !== undefined) {
      if (runOver(m, age)) finishRun(m)
      return
    }
    stuckStep(m, age)
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cleanup()
    } catch (e) {
      check('CLEANUP', false, 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    var m = S.m
    if (m !== null && m.phase !== 'done') {
      try {
        measure(m)
        if (m.phase === 'forming' ? S.t % STEP === 0 : true) step(m)
      } catch (e) {
        check('STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
      if (m.phase !== 'done' && S.t >= DEADLINE_TICKS) {
        check('deadline', false, 'still in ' + m.phase + ' after ' + S.t + ' ticks | ' + (m.ctrl ? state(m.ctrl) : 'no controller'))
        m.phase = 'done'
      }
    }
    if (m === null || m.phase === 'done') finish()
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
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), m: null, finished: false, areaTouched: false }
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
    var m = { phase: 'forming', seen: {}, seenWorking: false, euUsed: 0, eu0: 0, metered: false, runTicks: 0, runEut: 0, runOc: 0, mediumMade: 0,
      ocVoltage: 0 }
    S.m = m
    try {
      if (!place(m)) m.phase = 'done'
    } catch (e3) {
      check('PLACED', false, 'exception: ' + e3)
      m.phase = 'done'
    }
    S.t0 = S.t
    if (m.phase === 'done') finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_luv_biofoundry', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_luv_biofoundry run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
