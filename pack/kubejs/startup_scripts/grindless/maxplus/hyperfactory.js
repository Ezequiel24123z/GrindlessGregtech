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
// - Research: the assembly line's research recipes need a data access hatch in the formed machine (one, as the OpV assembly line array).
// - Mode veto: the first modifier refuses a recipe of the other type (GTM keeps the cached last recipe across a mode switch).
//
// Structure: 15 wide x 9 high x 21 deep of horizon machine casing, a plain workable multiblock, not GTM's ordered AssemblyLineMachine: a spine of
// atomic casing with a superconducting coil every fourth cell down the axis, a glass band on both long walls every fourth layer, and two rows
// of part cells on the front face beside the controller (21 cells for at most 13 parts). Smaller than the OpV array (9 x 7 x 35) per side but
// larger in volume, which suits a machine that replaces several.
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
  const W = 15
  const H = 9
  const D = 21
  const CTRL = { x: 7, y: 1 }
  // 2 energy + 4 input buses + 2 output buses + 2 input hatches + 1 output hatch + 1 data access + 1 parallel hatch
  const PART_CELLS = 13

  // x left to right, y bottom to top, z back (0) to front (20); one char per cell
  function cell(x, y, z) {
    var edge = x === 0 || x === W - 1 || y === 0 || y === H - 1
    if (z === D - 1) {
      if (x === CTRL.x && y === CTRL.y) return 'S'
      if (!edge && y <= 2 && x >= 2 && x <= W - 3) return 'X'
      return 'F'
    }
    if (z === 0) return 'F'
    if (edge) {
      if ((x === 0 || x === W - 1) && y === 4 && z % 4 === 2) return 'L'
      if (z % 4 === 0) return 'A'
      if ((y === 0 || y === H - 1) && (x + z) % 2 === 0) return 'A'
      return 'F'
    }
    if (x === 7 && y === 4) return z % 4 === 0 ? 'C' : 'A'
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
        L: Pat.block('gtceu:cleanroom_glass'),
        A: Pat.block('gtceu:atomic_casing'),
        C: Pat.block('gtceu:superconducting_coil'),
        X: Pat.oneOf(
          Pat.block(CASING, { min: BUILT.partCells - PART_CELLS }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          Pat.part('input_bus', { min: 1, max: 4 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { max: 2 }),
          Pat.part('output_hatch', { max: 1 }),
          {
            kind: 'part', ability: 'data_access', limits: { exact: 1 },
            build: function () { return Predicates.abilities(PartAbility.DATA_ACCESS).setExactLimit(1) }
          },
          G.parallelHatch.part()
        ),
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

    var veto = function (machine, recipe) {
      return otherMode(machine, recipe) ? ModifierFunction.NULL : ModifierFunction.IDENTITY
    }
    var chain = [veto].concat(G.mega.chain({ parallel: 'fixed', cap: CAP, hatch: true, discount: null, oc: 'perfect', batch: true }))

    var b = event.create(ID, 'multiblock')
      .langValue('Hyperfactory')
      .rotationState(RotationState.NON_Y_AXIS)
      // EMI draws no preview for patterns with an exact-limit data access hatch (GTM's own assembly line has the same gap)
      .renderMultiblockXEIPreview(false)
    TYPES.forEach(function (t) { b = b.recipeType(t) })
    G.mega.install(b, chain)
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
