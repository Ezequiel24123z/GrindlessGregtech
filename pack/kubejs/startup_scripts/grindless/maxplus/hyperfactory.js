// priority: -5599
// -----------------------------------------------------------------------------------------------
// MAX+ machine 15, the Hyperfactory, gtceu:hyperfactory (docs/eras/maxplus.md "Hyperfactory"; package XP-M1): the top member of the mega family
// (docs/eras/mega.md 4.1). One machine runs GTM's assembler, circuit assembler, assembly line, forming press and laser engraver recipes (no new
// recipe type), one type at a time (the player picks it in the controller's machine mode tab). Its recipes are the controller's own base, in
// server_scripts/grindless/maxplus/hyperfactory.js; names in client_scripts/grindless/maxplus_hyperfactory_lang.js.
//
// - Parallels: G.mega.chain({ parallel: 'fixed', cap: 4096, hatch: true, discount: null, oc: 'perfect', batch: true }): ceiling 4,096 x the formed
//   parallel hatch's parallel (the MAX+ hatch x4,194,304: 2^34), cut to what the energy hatches carry (floor(max voltage / recipe EU/t); lib/mega.js
//   clamps the result to an int), then to inputs and output room, then GTM's perfect subtick overclock and batch mode. No discount: it saves
//   machines, hatches and time, not power. It needs the 1,024 A MAX+ energy hatch (GTM's 64 A substation hatches do not fit an energy_input cell).
// - Research: the assembly line's research recipes need a data access hatch in the formed machine (one, in the marked head cell D, as the OpV
//   assembly line array).
// - Mode veto: the first modifier refuses a recipe of the other type (GTM keeps the cached last recipe across a mode switch).
//
// Structure: 25 wide x 13 high x 33 deep factory hall (docs/eras/lines-opv-maxplus.md 6.3), a plain workable multiblock, not GTM's ordered
// AssemblyLineMachine: bound lattice shell, Kerr rails, void-diamond window bays, a cryostat-chequered roof, portal frames every fourth layer, side decks, and a spine of
// atomic casing with a superconducting coil every fourth cell down the axis. Two rows of part cells on the front face beside the controller.
//
// Textures: MAX art meanwhile, as the loom: the mirror shell's segment with the positronium condensate lab's face.
(function () {
  const G = global.grindless
  const Pat = G.patterns

  const ID = 'hyperfactory'
  const CASING = 'grindless:horizon_machine_casing'
  const TEXTURE = 'grindless:block/max/mirror_shell_segment'
  const OVERLAY = 'grindless:block/multiblock/hyperfactory'
  const TYPES = ['assembler', 'circuit_assembler', 'assembly_line', 'forming_press', 'laser_engraver']
  const CAP = 4096
  const W = 25
  const H = 13
  const D = 33
  const CTRL = { x: 12, y: 1 }
  // 2 energy + 4 input buses + 2 output buses + 2 input hatches + 1 output hatch + 1 parallel hatch (the data access hatch has its own cell D)
  const PART_CELLS = 12
  const DATA = { x: 10, y: 1 }

  // x left to right, y bottom to top, z back (0) to front (32); one char per cell. A factory hall: a lattice floor and a cryostat-chequered roof,
  // Kerr rails and void-window bays on the long walls, three lattice portal frames dividing the line into bays, and the atomic casing spine.
  function cell(x, y, z) {
    var sideWall = x === 0 || x === W - 1
    var edge = sideWall || y === 0 || y === H - 1
    if (z === D - 1) {
      if (x === CTRL.x && y === CTRL.y) return 'S'
      if (x === DATA.x && y === DATA.y) return 'D'
      if (!edge && y <= 2 && x >= 2 && x <= W - 3) return 'X'
      return (sideWall || y === H - 1) && y % 4 === 0 ? 'K' : 'F'
    }
    if (z === 0) return y % 4 === 0 ? 'K' : 'B'
    if (y === 0) return z % 8 === 0 ? 'K' : 'B'
    if (y === H - 1) return z % 8 === 0 ? 'K' : (x + z) % 2 === 0 ? 'R' : 'B'
    if (sideWall) {
      if (y === 6) return 'K'
      if (y >= 2 && y <= 10 && z % 4 !== 0 && z % 8 !== 4) return 'W'
      return z % 8 === 0 ? 'R' : 'B'
    }
    if (y === 7 && (x <= 5 || x >= W - 6) && z >= 2 && z <= D - 3) return (x + z) % 3 === 0 ? 'K' : 'B'
    if (y === 3 && (x <= 3 || x >= W - 4) && z >= 2 && z <= D - 3) return 'R'
    if (y === H - 2 && (x === 6 || x === W - 7 || x === 12 || x === 3 || x === W - 4)) return 'B'
    if (z % 4 === 0) {
      if (x === 6 || x === W - 7) return 'B'
      if (y === H - 2 && x >= 6 && x <= W - 7) return 'B'
      if (y === 7 && x >= 6 && x <= W - 7 && x % 2 === 0) return 'R'
    }
    if (x === 12 && y === 4) return z % 4 === 0 ? 'C' : 'A'
    if (y === 1 && (x === 8 || x === 16)) return 'B'
    return '#'
  }
  function build() {
    var slices = []
    var parts = 0
    for (var z = 0; z < D; z++) {
      var rows = []
      for (var y = 0; y < H; y++) {
        var row = ''
        for (var x = 0; x < W; x++) {
          var ch = cell(x, y, z)
          if (ch === 'X') parts++
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return { slices: slices, partCells: parts }
  }
  const BUILT = build()

  var SPEC = null
  // built when the machine registers: G.parallelHatch (lib/parallel_hatch.js) is not needed before that
  function makeSpec() {
    return {
      slices: BUILT.slices,
      symbols: {
        S: Pat.controller(),
        F: Pat.block(CASING),
        B: Pat.block('grindless:bound_lattice_casing'),
        K: Pat.block('grindless:kerr_coil_casing'),
        R: Pat.block('grindless:primordial_cryostat_casing'),
        W: Pat.block('grindless:void_diamond_window'),
        A: Pat.block('gtceu:atomic_casing'),
        C: Pat.block('gtceu:superconducting_coil'),
        X: Pat.oneOf(
          Pat.block(CASING, { min: BUILT.partCells - PART_CELLS }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          Pat.part('input_bus', { min: 1, max: 4 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { max: 2 }),
          Pat.part('output_hatch', { max: 1 }),
          G.parallelHatch.part()
        ),
        D: Pat.oneOf(Pat.block(CASING), {
          kind: 'part', ability: 'data_access', limits: { max: 1 },
          build: function () { return Predicates.abilities(PartAbility.DATA_ACCESS).setMaxGlobalLimited(1) }
        }),
        '#': Pat.air()
      }
    }
  }

  // true = the recipe belongs to another type than the active one
  function otherMode(machine, recipe) {
    return String(recipe.getType().registryName) !== String(machine.getRecipeType().registryName)
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const HF = G.hyperfactory || (G.hyperfactory = {})
  HF.id = 'gtceu:' + ID
  HF.types = TYPES.map(function (t) { return 'gtceu:' + t })
  HF.cap = CAP
  HF.casing = CASING
  HF.hatch = 'gtceu:max_maxplus_parallel_hatch'
  HF.energyHatch = 'gtceu:max_maxplus_energy_hatch_1024a'
  HF.size = { width: W, height: H, depth: D }
  HF.partCells = BUILT.partCells
  HF.partMax = PART_CELLS
  HF.controllerCell = CTRL

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SPEC = makeSpec()
    Pat.register(HF.id, SPEC)

    // D is optional (so EMI draws a preview) and GTM's ResearchCondition always passes: refuse a research recipe unless a data access hatch is
    // formed (modifier and beforeWorking, since GTM restarts a cached recipe without its modifier); the hatch then checks it holds the data.
    var needsData = function (machine, recipe) {
      var RC = Java.loadClass('com.gregtechceu.gtceu.common.recipe.condition.ResearchCondition')
      var DH = Java.loadClass('com.gregtechceu.gtceu.api.capability.IDataAccessHatch')
      var research = false
      recipe.conditions.forEach(function (c) { if (c instanceof RC) research = true })
      if (!research) return false
      var hatch = false
      machine.getParts().forEach(function (p) { if (p instanceof DH) hatch = true })
      return !hatch
    }
    var veto = function (machine, recipe) {
      return otherMode(machine, recipe) || needsData(machine, recipe) ? ModifierFunction.NULL : ModifierFunction.IDENTITY
    }
    var chain = [veto].concat(G.mega.chain({ parallel: 'fixed', cap: CAP, hatch: true, discount: null, oc: 'perfect', batch: true }))

    var b = event.create(ID, 'multiblock')
      .langValue('Hyperfactory')
      .rotationState(RotationState.NON_Y_AXIS)
      // the data access hatch sits in the marked cell D with a global maximum, not an exact limit: EMI draws no preview for the latter
      .renderMultiblockXEIPreview(true)
    TYPES.forEach(function (t) { b = b.recipeType(t) })
    G.mega.install(b, chain)
      .beforeWorking(function (machine, recipe) { return !needsData(machine, recipe) })
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.hyperfactory.tooltip.0'),
        Text.translate('gtceu.multiblock.parallelizable.tooltip'),
        Text.translate('gtceu.machine.perfect_oc')
      ])
      .workableCasingModel(TEXTURE, OVERLAY)
  })
})()
