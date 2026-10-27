// priority: -2400
// -----------------------------------------------------------------------------------------------
// IV's own multiblock (docs/eras/iv.md, "Designed-core reactor"; package IV-A2): the fission reactor and its recipe type.
//
//   gtceu:fission_reactor   a 5x8x5 nuclear plant: a containment of radiation-proof machine casing (GT--'s, dense lead, a tungstensteel
//                           frame and concrete) on a light concrete basemat, with four tungstensteel pipe fuel channels around a
//                           tungstensteel control rod and a heat vent over each channel head, in front of a turbine hall of robust
//                           tungstensteel casing with tungstensteel turbine casings, the gearbox shaft and its generator. A generator.
//   gtceu:fission_core      its recipe type (EU out). One recipe per designed core, generated from data/grindless/tables/
//                           fission_cores.json by server_scripts/grindless/iv/fission_reactor.js:
//                             circuit 1  LEU assembly, light water             16 384 EU/t a channel
//                             circuit 2  LEU assembly, heavy-water moderator   32 768 EU/t, 5 mB heavy water -> 5 mB tritiated heavy water
//                             circuit 3  MOX assembly, heavy-water moderator   32 768 EU/t, the same moderator
//                             circuit 4  breeder assembly (Pu core, U-238 blanket)  8 192 EU/t, a spent breeder assembly
//                           Every core: 400-tick cycles, 2 000 mB of water per channel (lost through the vents), the assembly a chanced
//                           input and the spent assembly a chanced output, both 50 of 10 000. GTM 7.5.3's OR chance logic keeps a
//                           remainder per machine, so one assembly is used up, and one spent assembly comes out, every 200
//                           channel-cycles (about 67 minutes in one channel), each on its own count.
//
// What it gains (rule 4): IV's energy without burning anything, from a fuel cycle (enrich, assemble, burn, reprocess) that GTM does not
// have; it breeds plutonium and gives the heavy water's tritium a contained route (decision 3: the tritium removal facility on the Moon).
//
// Channels: the generator helper (lib/generators.js) runs n parallel copies of a core recipe, n = the fewest of 4, the assemblies in the
// input buses (GTM's parallel logic counts a chanced input as one per copy), the water and heavy water, the room for the outputs and what
// the dynamo hatches carry. It is the generator form of `bores` (lv/multis.js): the same capped parallel copies, with the dynamo hatches as
// the limit and no overclock (EU per assembly is fixed). 4 heavy-water channels make 131 072 EU/t: one 16 A IV dynamo hatch, or four
// 4 A ones; 2 A IV hatches carry one heavy channel per two hatches. .regressWhenWaiting(false): a cycle that waits never pays twice.
//
// SCRAM, not explosion: inputs are taken when a cycle starts and GTM checks the room for every output (chanced ones included) before it
// starts one, so with no water or heavy water, or no room for the spent assembly or the tritiated heavy water, the reactor finishes its
// cycle and stays shut down, losing nothing. Voiding is refused (the modifier cancels the cycle with
// grindless.machine.fission_reactor.no_voiding, the mechanism of grindless.steam_outputs.no_voiding): nothing it makes may be thrown away.
// While it is shut down with fuel in its buses, the controller shows a SCRAM line.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front):
//   back five slices: the containment, 5x5. Row 0: basemat (B light concrete). Rows 1-2: shield walls (R radiation-proof casing) around
//   the core: the four fuel channels (P tungstensteel pipe casing) at the corners of the inner 3x3, the control rod (F tungstensteel
//   frame) in the middle, the moderator space (air) between them. Row 3: the shield lid, the channel heads (P) through it. Row 4: a heat
//   vent (V, GTM's computer heat vent) over each channel head.
//   front three slices: the turbine hall, 5x3x4. Row 0: the service floor (X, 15 cells): 1-2 input buses, 1-2 output buses, 1-3 fluid
//   input hatches, at most 1 fluid output hatch and 1-4 dynamo hatches, at least 3 cells robust tungstensteel casing. Rows 1-3: robust
//   tungstensteel casing (C) walls and roof around the turbine (T tungstensteel turbine casing, G the tungstensteel gearbox shaft) and its
//   generator (G). The controller is in the middle of the front face, row 1. ME buses and hatches have the same abilities, so they fit.
//
// Textures: overlay dir grindless:block/multiblock/fission_reactor (tools/assets/Build-FissionReactorTextures.ps1) on GTM's robust
// tungstensteel casing. Names / tooltips: client_scripts/grindless/iv_fission_reactor_lang.js. Recipes and the controller recipe:
// server_scripts/grindless/iv/fission_reactor.js. Published for those and the smoke test: global.grindless.fissionReactor.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Gen = G.generators
  const FR = G.fissionReactor || (G.fissionReactor = {})
  const LOG = '[grindless/iv] '

  const MACHINE = 'gtceu:fission_reactor'
  const TYPE = 'fission_core'
  const TABLE = 'kubejs/data/grindless/tables/fission_cores.json'

  const SHIELD = 'gtnn:radiation_proof_machine_casing'
  const BASEMAT = 'gtceu:light_concrete'
  const CHANNEL = 'gtceu:tungstensteel_pipe_casing'
  const ROD = 'tungsten_steel'
  const VENT = 'gtceu:computer_heat_vent'
  const CASING = 'gtceu:robust_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const TURBINE = 'gtceu:tungstensteel_turbine_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'

  const MAX_CHANCE = 10000
  const NO_VOIDING = 'grindless.machine.fission_reactor.no_voiding'
  const SCRAM = 'grindless.machine.fission_reactor.scram'
  // the recipe data key of each core (the EMI line gtceu.recipe.grindless_core.<name>)
  const CORE_KEY = 'grindless_core'

  // ---------------------------------------------------------------- the cores (data/grindless/tables/fission_cores.json)

  function loadTable() {
    var t
    try {
      t = G.readJsonTable(TABLE)
    } catch (e) {
      console.error(LOG + 'fission reactor: cannot read ' + TABLE + ', no cores: ' + e)
      return null
    }
    var problems = []
    var out = {
      cycleTicks: Number(t.cycleTicks),
      channels: Number(t.channels),
      wearChance: Number(t.wearChance),
      spentChance: Number(t.spentChance),
      coolant: { fluid: String(t.coolant && t.coolant.fluid), amount: Number(t.coolant && t.coolant.amount) },
      cores: []
    }
    if (!(out.cycleTicks > 0)) problems.push('cycleTicks ' + t.cycleTicks)
    if (!(out.channels >= 1)) problems.push('channels ' + t.channels)
    if (!(out.wearChance > 0 && out.wearChance < MAX_CHANCE)) problems.push('wearChance ' + t.wearChance)
    if (!(out.spentChance > 0 && out.spentChance < MAX_CHANCE)) problems.push('spentChance ' + t.spentChance)
    if (!(out.coolant.amount > 0) || out.coolant.fluid.indexOf(':') < 0) problems.push('coolant ' + JSON.stringify(t.coolant))
    var circuits = {}
    var names = {}
    ;(t.cores || []).forEach(function (c) {
      var name = String(c.name || '')
      var circuit = Number(c.circuit)
      if (!/^[a-z0-9_]+$/.test(name) || names[name]) {
        problems.push('core name "' + name + '"')
        return
      }
      if (!(circuit >= 1 && circuit <= 32) || circuits[circuit]) {
        problems.push(name + ': circuit ' + c.circuit + ' (1-32, one per core)')
        return
      }
      if (!(Number(c.euPerChannel) > 0) || String(c.fuel || '').indexOf(':') < 0 || String(c.spent || '').indexOf(':') < 0) {
        problems.push(name + ': fuel, spent and euPerChannel are needed')
        return
      }
      var mod = null
      if (c.moderator) {
        mod = { fluid: String(c.moderator.fluid), becomes: String(c.moderator.becomes), amount: Number(c.moderator.amount) }
        if (mod.fluid.indexOf(':') < 0 || mod.becomes.indexOf(':') < 0 || !(mod.amount > 0)) {
          problems.push(name + ': moderator ' + JSON.stringify(c.moderator))
          return
        }
      }
      names[name] = true
      circuits[circuit] = true
      out.cores.push({
        name: name,
        circuit: circuit,
        fuel: String(c.fuel),
        euPerChannel: Number(c.euPerChannel),
        moderator: mod,
        spent: String(c.spent),
        recipe: 'grindless:' + TYPE + '/' + name
      })
    })
    if (out.cores.length === 0) problems.push('no core')
    if (problems.length > 0) console.error(LOG + 'fission reactor: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  const TABLE_DATA = loadTable()
  const CYCLE = TABLE_DATA && TABLE_DATA.cycleTicks > 0 ? TABLE_DATA.cycleTicks : 400
  const CHANNELS = TABLE_DATA && TABLE_DATA.channels >= 1 ? Math.floor(TABLE_DATA.channels) : 4
  const CORES = TABLE_DATA ? TABLE_DATA.cores : []
  const BY_NAME = {}
  const FUELS = {}
  CORES.forEach(function (c) {
    BY_NAME[c.name] = c
    FUELS[c.fuel] = true
  })

  // ---------------------------------------------------------------- pattern

  const SPEC = {
    slices: [
      // the containment: back wall
      ['BBBBB', 'RRRRR', 'RRRRR', 'RRRRR', '     '],
      // two fuel channels, the lid with their heads, a vent over each
      ['BBBBB', 'RP#PR', 'RP#PR', 'RPRPR', ' V V '],
      // the control rod between the channels
      ['BBBBB', 'R#F#R', 'R#F#R', 'RRRRR', '     '],
      ['BBBBB', 'RP#PR', 'RP#PR', 'RPRPR', ' V V '],
      // the containment's front wall, against the turbine hall
      ['BBBBB', 'RRRRR', 'RRRRR', 'RRRRR', '     '],
      // the turbine hall: the turbine around its shaft
      ['XXXXX', 'CTGTC', 'CTTTC', 'CCCCC', '     '],
      // the generator
      ['XXXXX', 'CGGGC', 'CTTTC', 'CCCCC', '     '],
      // the front face
      ['XXXXX', 'CCSCC', 'CCCCC', 'CCCCC', '     ']
    ],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(CASING, { min: 3 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 3 }),
        Pat.part('output_hatch', { max: 1, preview: 1 }),
        Pat.part('energy_output', { min: 1, max: 4 })
      ),
      B: Pat.block(BASEMAT),
      R: Pat.block(SHIELD),
      P: Pat.block(CHANNEL),
      F: Pat.frame([ROD]),
      V: Pat.block(VENT),
      C: Pat.block(CASING),
      T: Pat.block(TURBINE),
      G: Pat.block(GEARBOX),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- helpers

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return LC
  }

  // true while the controller is set to void items or fluids (GTM's IVoidable): spent fuel or tritiated heavy water would be thrown away
  function voids(machine) {
    var c = lazy()
    return machine.canVoidRecipeOutputs(c.ItemCap) === true || machine.canVoidRecipeOutputs(c.FluidCap) === true
  }

  // true when an input bus holds a fuel assembly of any core
  function fuelLoaded(machine) {
    var c = lazy()
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.ItemCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (stack === null || stack === undefined || typeof stack.isEmpty !== 'function' || stack.isEmpty()) continue
        if (FUELS[String(c.Registries.ITEMS.getKey(stack.getItem()))]) return true
      }
    }
    return false
  }

  // ---------------------------------------------------------------- recipe modifier and controller lines

  const GEN_OPTS = { maxParallels: CHANNELS, name: 'fission_reactor' }
  var noVoiding = null

  // before every cycle (alwaysTryModifyRecipe): voiding refused, then lib/generators.js's channels (parallel copies)
  function reactorModifier() {
    var generator = Gen.modifier(GEN_OPTS)
    var failed = false
    return function (machine, recipe) {
      try {
        if (voids(machine)) {
          if (noVoiding === null) noVoiding = ModifierFunction.cancel(Text.translate(NO_VOIDING))
          return noVoiding
        }
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'fission reactor voiding check failed: ' + e)
        }
        return ModifierFunction.NULL
      }
      return generator(machine, recipe)
    }
  }

  const genDisplay = Gen.display(GEN_OPTS)
  var displayFailed = false

  // the generator lines (output, channels, dynamo capacity) and, shut down with fuel loaded, the SCRAM line
  function reactorDisplay(controller, list) {
    genDisplay(controller, list)
    try {
      if (!controller.isFormed()) return
      if (String(controller.getRecipeLogic().getStatus()) !== 'IDLE') return
      if (fuelLoaded(controller)) list.add(Text.translate(SCRAM))
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error(LOG + 'fission reactor controller display failed: ' + e)
      }
    }
  }

  // One EMI line per recipe, read from its data: the core in words, how long an assembly lasts and the EU it gives
  function coreInfo(data) {
    try {
      var name = String(data.getString(CORE_KEY))
      var core = BY_NAME[name]
      if (!core) return ''
      var cycles = Math.round(MAX_CHANCE / TABLE_DATA.wearChance)
      var minutes = Math.round(cycles * CYCLE / 1200)
      var gigaEu = (core.euPerChannel * CYCLE * cycles / 1e9).toFixed(2)
      return String(Text.translate('gtceu.recipe.' + CORE_KEY + '.' + name, String(cycles), String(minutes), gigaEu).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  FR.machine = MACHINE
  FR.recipeType = 'gtceu:' + TYPE
  FR.table = TABLE
  FR.loaded = TABLE_DATA !== null && CORES.length > 0
  FR.cycleTicks = CYCLE
  FR.channels = CHANNELS
  FR.maxChance = MAX_CHANCE
  FR.wearChance = TABLE_DATA ? TABLE_DATA.wearChance : 0
  FR.spentChance = TABLE_DATA ? TABLE_DATA.spentChance : 0
  FR.coolant = TABLE_DATA ? TABLE_DATA.coolant : null
  FR.cores = CORES
  FR.fuels = Object.keys(FUELS)
  FR.coreKey = CORE_KEY
  FR.noVoiding = NO_VOIDING
  FR.scram = SCRAM
  FR.maxIO = { itemsIn: 2, itemsOut: 1, fluidsIn: 2, fluidsOut: 1 }
  FR.parts = { input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 3 }, output_hatch: { max: 1 }, energy_output: { min: 1, max: 4 } }
  FR.voids = voids
  FR.fuelLoaded = fuelLoaded
  FR.display = reactorDisplay

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // a generator type (lib/generators.js): EU out, recipes at .EUt(-x). Items in: the assembly and the programmed circuit; out: the spent
    // assembly. Fluids in: the water and the moderator; out: the activated moderator
    event.create(TYPE)
      .category('generator')
      .setEUIO('out')
      .setMaxIOSize(FR.maxIO.itemsIn, FR.maxIO.itemsOut, FR.maxIO.fluidsIn, FR.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_FUSION, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.TURBINE)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(coreInfo)

    Pat.register(MACHINE, SPEC)

    // configure() sets .generator(true), .regressWhenWaiting(false) and the generator lines; its recipe modifier and lines are then
    // replaced by the same helper pieces behind the voiding refusal and with the SCRAM line
    Gen.configure(event.create('fission_reactor', 'multiblock'), GEN_OPTS)
      .recipeModifier(reactorModifier(), true)
      // GTM restarts a cached recipe without the modifier: refuse voiding at every start too (lib/no_voiding.js, IV-A4's finding)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: NO_VOIDING, name: 'fission reactor' }))
      .additionalDisplay(reactorDisplay)
      .langValue('Fission Reactor')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      .appearanceBlock(GTBlocks.CASING_TUNGSTENSTEEL_ROBUST)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.fission_reactor.tooltip.0'),
        Text.translate('grindless.machine.fission_reactor.tooltip.1'),
        Text.translate('grindless.machine.fission_reactor.tooltip.2'),
        Text.translate('grindless.machine.fission_reactor.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/fission_reactor')
  })
})()
