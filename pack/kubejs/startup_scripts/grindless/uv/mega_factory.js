// priority: -10150
// -----------------------------------------------------------------------------------------------
// UV Mega Factory, gtceu:mega_factory (package MEGA-8, docs/eras/mega.md 4.10): a UV casing frame with four module sockets, in the spirit
// of Star Technology's K.O.M.A.R.U. (docs/journey.md:176-179; MIT, ideas reused with attribution). It runs GTM's own recipes of 15 types;
// which of them it may run depends on the module blocks the player puts in the sockets.
//
//   grindless:separation_module  centrifuge, electrolyzer, sifter
//   grindless:forming_module     bender, extruder, forming press, wiremill
//   grindless:cutting_module     cutter, lathe, laser engraver
//   grindless:mixing_module      mixer, chemical bath, autoclave
//   grindless:heat_module        arc furnace, alloy smelter
//
// How it works (lib/mega.js unchanged, proven by MEGA-0/0c and S-M2; nothing new there):
// - Machine modes: one recipeType() call per type (the MEGA-7 way; one mode at a time, picked in the controller's machine mode tab).
// - Module gate (S-M2): the first modifier vetoes (ModifierFunction.cancel, reason shown, inputs untouched) a recipe whose type's module
//   block is not in a socket. Each socket takes any of the five blocks or stays empty (air), so the factory forms with 0 to 4 modules and
//   the player picks 4 of 5.
// - Parallels: G.mega.chain({ parallel: 'fixed', cap: 256, hatch: true, discount: null, oc: 'nonperfect', batch: true }): ceiling 256 x the
//   formed parallel hatch's parallel (UV hatch 256: 65536), cut to what the energy hatches carry (floor(max voltage / recipe EU/t); every
//   copy pays its full EU/t), then to the inputs and the output room, then GTM's non-perfect overclock and batch mode. No discount, no
//   new recipe.
// - Upkeep (the gain is paid in logistics, not EU): the last modifier adds one fluid input to the run, UPKEEP_MB of PCB coolant per
//   installed module block (4 modules: 1,000 mB per run). It runs after parallel and batch, so the figure is per run, not per copy.
//   GTM checks the modified recipe (RecipeLogic#checkRecipe) before it starts it and drains the inputs once when it starts, so a run
//   with too little coolant never starts and the coolant is consumed once. The modifier builds a copy of the recipe with a fresh fluid
//   input list (GTRecipe#copy shares the lists of the original: the precedent is mv/leisure_utility.js).
//   Figure: 250 mB per module is a quarter of a bucket; PCB coolant is a mixer product (gtceu:mixer/pcb_coolant: 1,000 mB from 750 mB
//   polychlorinated biphenyl and 250 mB distilled water, 480 EU/t), so a full 4-module factory burns one mixer batch per run, enough to need a coolant line, small next to the EU.
//
// Structure (15 x 12 x 21, lib/patterns.js): a hollow shell of UV machine casing with an empty interior; four module sockets in the side
// walls (x 0 and 14, row 5, depth 6 and 14); the controller in the middle of the front wall, one row up. Parts go in any casing cell:
// 1 maintenance, 1 to 2 energy hatches, 2 to 6 input buses, 2 to 6 output buses, 2 to 4 input hatches, 2 to 4 output hatches, 0 or 1
// parallel hatch.
//
// Textures: block/uv/*_module.png and the overlay dir grindless:block/multiblock/mega_factory (tools/assets/Build-MegaFactoryTextures.ps1).
// Names / tooltips: client_scripts/grindless/uv_mega_factory_lang.js. Recipes: server_scripts/grindless/uv/mega_factory.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns

  const ID = 'mega_factory'
  const CASING = 'gtceu:uv_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const COOLANT = 'gtceu:pcb_coolant'
  const UPKEEP_MB = 250
  const CAP = 256
  const W = 15
  const H = 12
  const D = 21
  // most cells that can hold a part: 1 maintenance + 2 energy + 6 + 6 buses + 4 + 4 hatches + 1 parallel hatch
  const PART_CELLS = 24
  const SOCKETS = [[0, 6], [0, 14], [14, 6], [14, 14]]
  const SOCKET_ROW = 5

  const MODULES = {
    separation_module: ['centrifuge', 'electrolyzer', 'sifter'],
    forming_module: ['bender', 'extruder', 'forming_press', 'wiremill'],
    cutting_module: ['cutter', 'lathe', 'laser_engraver'],
    mixing_module: ['mixer', 'chemical_bath', 'autoclave'],
    heat_module: ['arc_furnace', 'alloy_smelter']
  }
  const MODULE_IDS = Object.keys(MODULES).map(function (n) { return 'grindless:' + n })
  // every recipe type -> the module block it needs; the first one is the mode a new controller starts in
  const TYPES = []
  const NEED = {}
  Object.keys(MODULES).forEach(function (name) {
    MODULES[name].forEach(function (t) {
      TYPES.push(t)
      NEED['gtceu:' + t] = 'grindless:' + name
    })
  })

  function socketCell(x, z) {
    for (var i = 0; i < SOCKETS.length; i++) if (SOCKETS[i][0] === x && SOCKETS[i][1] === z) return true
    return false
  }

  // slices back -> front, rows bottom -> top, one char per column
  function build() {
    var slices = []
    var casingCells = 0
    for (var z = 0; z < D; z++) {
      var rows = []
      for (var y = 0; y < H; y++) {
        var row = ''
        for (var x = 0; x < W; x++) {
          var shell = y === 0 || y === H - 1 || z === 0 || z === D - 1 || x === 0 || x === W - 1
          var ch = '#'
          if (z === D - 1 && x === 7 && y === 1) ch = 'S'
          else if (y === SOCKET_ROW && socketCell(x, z)) ch = 'M'
          else if (shell) { ch = 'X'; casingCells++ }
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return { slices: slices, casingCells: casingCells }
  }
  const BUILT = build()

  // PCB coolant added to a copy of the run's recipe: GTRecipe#copy() copies the contents map but shares its lists, so the fluid
  // list is replaced with a fresh one in the copy
  var LC = null
  function lc() {
    if (LC === null) {
      LC = {
        Content: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.Content'),
        FluidIngredient: Java.loadClass('com.gregtechceu.gtceu.api.recipe.ingredient.FluidIngredient'),
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        ArrayList: Java.loadClass('java.util.ArrayList')
      }
    }
    return LC
  }

  function withCoolant(recipe, mb) {
    var c = lc()
    var copy = recipe.copy()
    var fresh = new c.ArrayList()
    var old = copy.inputs.get(c.FluidCap)
    if (old != null) fresh.addAll(old)
    fresh.add(new c.Content(c.FluidIngredient.of(GTMaterials.PCBCoolant.getFluid(), mb), 10000, 10000, 0))
    copy.inputs.put(c.FluidCap, fresh)
    return copy
  }

  var failed = false

  // published for the crafting script, the node test and the bench test
  const MF = G.megaFactory || (G.megaFactory = {})
  MF.id = 'gtceu:' + ID
  MF.types = TYPES.map(function (t) { return 'gtceu:' + t })
  MF.modules = {}
  Object.keys(MODULES).forEach(function (n) { MF.modules['grindless:' + n] = MODULES[n].map(function (t) { return 'gtceu:' + t }) })
  MF.need = NEED
  MF.cap = CAP
  MF.casing = CASING
  MF.upkeepMb = UPKEEP_MB
  MF.coolant = COOLANT
  MF.sockets = SOCKETS.length
  MF.size = { width: W, height: H, depth: D }

  StartupEvents.registry('block', function (event) {
    Object.keys(MODULES).forEach(function (name) {
      event.create('grindless:' + name)
        .stoneSoundType()
        .hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll('grindless:block/uv/' + name)
        .item(function (item) { item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0'))) })
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var M = G.mega.modules(MODULE_IDS)
    var spec = {
      slices: BUILT.slices,
      symbols: {
        S: Pat.controller(),
        M: Pat.oneOf(M.socket(), Pat.air()),
        X: Pat.oneOf(
          Pat.block(CASING, { min: BUILT.casingCells - PART_CELLS }),
          Pat.part('maintenance', { exact: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          Pat.part('input_bus', { min: 2, max: 6 }),
          Pat.part('output_bus', { min: 2, max: 6 }),
          Pat.part('input_hatch', { min: 2, max: 4 }),
          Pat.part('output_hatch', { min: 2, max: 4 }),
          G.parallelHatch.part()
        ),
        '#': Pat.air()
      }
    }
    Pat.register('gtceu:' + ID, spec)

    var upkeep = function (machine, recipe) {
      try {
        var n = M.of(machine).length
        if (n < 1) return ModifierFunction.IDENTITY
        var mb = n * UPKEEP_MB
        return ModifierFunction.IDENTITY.andThen(function (r) { return withCoolant(r, mb) })
      } catch (e) {
        if (!failed) {
          failed = true
          console.error('[grindless/uv] mega factory upkeep failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
    var gate = M.gate(NEED, function () { return ModifierFunction.IDENTITY })
    var list = [gate]
      .concat(G.mega.chain({ parallel: 'fixed', cap: CAP, hatch: true, discount: null, oc: 'nonperfect', batch: true }))
      .concat([upkeep])

    var b = event.create(ID, 'multiblock')
      .langValue('Mega Factory')
      .rotationState(RotationState.NON_Y_AXIS)
    // one call per type, as the assembly hall does (the first call is the mode a new controller starts in)
    TYPES.forEach(function (t) { b = b.recipeType(t) })
    G.mega.install(b, list)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mega_factory.tooltip.0'),
        Text.translate('grindless.machine.mega_factory.tooltip.1'),
        Text.translate('grindless.machine.mega_factory.tooltip.2'),
        Text.translate('grindless.machine.mega_factory.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
