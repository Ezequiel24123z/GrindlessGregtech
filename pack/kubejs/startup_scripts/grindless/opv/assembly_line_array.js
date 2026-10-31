// priority: -6650
// -----------------------------------------------------------------------------------------------
// OpV Assembly Line Array, gtceu:assembly_line_array (package OpV-M2, docs/eras/opv.md #### M2.): the mega member of the assembly line. It runs
// GTM's gtceu:assembly_line recipes (no recipe type of its own, no recipe of its own to run) with ordered inputs and research honoured by GTM's own
// AssemblyLineMachine class, and with the mega family's parallels: the energy-bound count times the formed parallel hatch (the x262,144 OpV
// hatch, OpV-M1). lib/mega.js is unchanged: G.mega.chain({ parallel: 'fixed', cap: 1, hatch: true }) gives hatch copies (x1 without), the energy
// cap and ParallelLogic; perfect overclock and batch mode as the stellar forge (family rules 1-4).
//
// Structure (9 wide x 7 high x 35 deep, lib/patterns.js): four assembly tracks side by side under one gantry roof. A track is a row of assembly
// line units at floor height with gratings between the tracks, the roof is OpV machine casing with laminated glass lights over the tracks, the
// walls are assembly line casing. The controller sits in the middle of the front wall, one row above the floor. Parts: the front wall's first row
// takes 1 maintenance, 1 or 2 energy hatches, 1 data access hatch and 1 parallel hatch (head); the output bus goes in the tail wall's first
// row; the input buses (one per slice, in order along the line) and the fluid input hatches go in the side wall at x = 0.
//
// S0-10 (docs/research/opv-s0.md): a bare GTM AssemblyLineMachine formed but ran no ordered or research recipe, and the cause was not isolated;
// this machine's T1 (gg_test_opv_assembly_line_array) is the first proof. If it fails after one repair the fallback is the contract's: the array
// stops enforcing the order (swap the machine class) and still requires research.
//
// Textures: overlay dir grindless:block/multiblock/assembly_line_array (tools/assets/Build-OpVAssemblyLineArrayTextures.ps1). Names / tooltips /
// info page: client_scripts/grindless/opv_assembly_line_array_lang.js. Controller recipe: server_scripts/grindless/opv/assembly_line_array.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns

  const ID = 'assembly_line_array'
  const CASING = 'gtceu:opv_machine_casing'
  const WALL = 'gtceu:assembly_line_casing'
  const UNIT = 'gtceu:assembly_line_unit'
  const GRATING = 'gtceu:assembly_line_grating'
  const GLASS = 'gtceu:laminated_glass'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/opv/side'
  const HATCHES = { energy: [1, 2], inputBus: 16, inputHatch: 4, outputBus: 4, dataAccess: 1, parallelHatch: 1 }
  const W = 9
  const H = 7
  const D = 35
  const TRACKS = [1, 3, 5, 7]
  const BUS_Z = [2, 17]

  // slices back (tail) -> front (controller), rows bottom -> top, one char per column
  // S controller, C OpV casing, W assembly line casing, U unit (track), G grating, L glass light, # air
  // X head parts, O output bus, I input bus, H fluid input hatch
  function cell(x, y, z) {
    var edge = x === 0 || x === W - 1
    if (z === D - 1 && x === 4 && y === 1) return 'S'
    if (y === 0) return 'C'
    if (y === H - 1) return TRACKS.indexOf(x) >= 0 && z > 0 && z < D - 1 ? 'L' : 'C'
    if (z === D - 1) return y === 1 && x >= 1 && x <= 7 ? 'X' : 'W'
    if (z === 0) return y === 1 && x >= 2 && x <= 6 ? 'O' : 'W'
    if (edge) {
      if (x === 0 && z >= BUS_Z[0] && z <= BUS_Z[1]) {
        if (y === 2) return 'I'
        if (y === 4) return 'H'
      }
      return 'W'
    }
    if (y === 1) return TRACKS.indexOf(x) >= 0 ? 'U' : 'G'
    return '#'
  }

  function build() {
    var slices = []
    var counts = { C: 0, W: 0, U: 0, G: 0, L: 0, X: 0, O: 0, I: 0, H: 0, air: 0 }
    for (var z = 0; z < D; z++) {
      var rows = []
      for (var y = 0; y < H; y++) {
        var row = ''
        for (var x = 0; x < W; x++) {
          var ch = cell(x, y, z)
          if (ch === '#') counts.air++
          else if (counts[ch] !== undefined) counts[ch]++
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return { slices: slices, counts: counts }
  }
  const BUILT = build()

  var data = {
    kind: 'part', ability: 'data_access', limits: { exact: HATCHES.dataAccess },
    build: function () { return Predicates.abilities(PartAbility.DATA_ACCESS).setExactLimit(HATCHES.dataAccess) }
  }

  var SPEC = null
  function makeSpec() {
    var wall = Pat.block(WALL)
    return {
      slices: BUILT.slices,
      symbols: {
        S: Pat.controller(),
        C: Pat.block(CASING),
        W: wall,
        U: Pat.block(UNIT),
        G: Pat.block(GRATING),
        L: Pat.block(GLASS),
        '#': Pat.air(),
        X: Pat.oneOf(
          wall,
          Pat.part('maintenance', { exact: 1 }),
          Pat.part('energy_input', { min: HATCHES.energy[0], max: HATCHES.energy[1] }),
          data,
          G.parallelHatch.part()
        ),
        O: Pat.oneOf(wall, Pat.part('output_bus', { min: 1, max: HATCHES.outputBus })),
        I: Pat.oneOf(wall, Pat.part('input_bus', { max: HATCHES.inputBus })),
        H: Pat.oneOf(wall, Pat.part('input_hatch', { max: HATCHES.inputHatch }))
      }
    }
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const A = G.assemblyLineArray || (G.assemblyLineArray = {})
  A.id = 'gtceu:' + ID
  A.type = 'gtceu:assembly_line'
  A.casing = CASING
  A.hatches = HATCHES
  A.size = { width: W, height: H, depth: D }
  A.counts = BUILT.counts
  A.slices = BUILT.slices

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var ALM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.AssemblyLineMachine')
    SPEC = makeSpec()
    Pat.register('gtceu:' + ID, SPEC)

    var chain = G.mega.chain({ parallel: 'fixed', cap: 1, hatch: true, discount: null, oc: 'perfect', batch: true })

    // GTM's ordered-input check pairs item handler i with recipe input i in the controller's part order, and the builder's default sorter keeps the
    // pattern's HashSet order (it changes from run to run). The line runs from the controller backwards, so sort the parts by distance from the
    // front wall (RelativeDirection.BACK follows the facing and the flip): the first input bus is the nearest to the controller, as in the
    // vanilla assembly line. Equal depth falls back to BlockPos's natural order (y, z, x), so the order is total.
    var sorterFor = function (controller) {
      var RD = Java.loadClass('com.gregtechceu.gtceu.api.pattern.util.RelativeDirection')
      var CMP = Java.loadClass('java.util.Comparator')
      var posOf = function (p) { return p.self().getPos() }
      var depth = RD.BACK.getSorter(controller.getFrontFacing(), controller.getUpwardsFacing(), controller.isFlipped())
      return CMP.comparing(posOf, depth).thenComparing(CMP.comparing(posOf))
    }

    var b = event.create(ID, 'multiblock')
      .langValue('Assembly Line Array')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return new ALM(holder) })
      .recipeType('assembly_line')
    G.mega.install(b, chain)
      ["partSorter(java.util.function.Function)"](sorterFor)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.assembly_line_array.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.assembly_line')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip'),
        Text.translate('gtceu.machine.perfect_oc')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
