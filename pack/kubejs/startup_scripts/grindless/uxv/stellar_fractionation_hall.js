// priority: -10945
// -----------------------------------------------------------------------------------------------
// UXV Stellar Fractionation Hall, gtceu:stellar_fractionation_hall (package UXV-M2, docs/eras/uxv.md #### M2.): the distillation member of the
// mega family. One machine runs GTM's gtceu:distillation_tower and gtceu:distillery recipes (no new recipe type, no recipe of its own), one
// mode at a time (the player picks it in the controller's machine mode tab). lib/mega.js and lib/parallel_hatch.js are unchanged.
//
// - Parallels: G.mega.chain({ parallel: 'fixed', cap: 4096, hatch: true, discount: null, oc: 'perfect', batch: true }): ceiling 4,096 x the
//   formed parallel hatch's parallel (no hatch: 4,096; the UXV hatch x65,536: 268,435,456, under 2^31), cut to what the energy hatches
//   carry (floor(max voltage / recipe EU/t): every copy pays its full EU/t), then to what the inputs and the output room allow
//   (ParallelLogic), then GTM's perfect subtick overclock as the stellar forge (open question 6; energy-neutral) and batch mode.
//   No discount: the hall saves towers, hatches and time, not power.
// - Mode veto: the first modifier refuses a recipe of the other mode (GTM keeps the cached last recipe across a mode switch).
// - Outputs: a plain workable multiblock, not GTM's layered tower class, so every distinct output fluid needs its own output hatch: up to 12
//   fluid output hatches on the columns' outer faces (a distillation tower recipe has at most 12 outputs).
//
// Structure (13 wide x 13 high x 25 deep, lib/patterns.js: a slice has at most 16 rows, so the 13 x 25 x 13 hall of the design lies on its side,
// as the Vela machines do: the long axis is the depth). A 13 x 13 x 3 reboiler plinth at the front (frame rim, glazed vent grille, a coil ring
// round the reboiler) carries two 5 x 5 fractionating columns that run 22 layers to the back: casing walls with a laminated glass sight band every
// fourth layer, a titanium pipe core, naquadah frame corner posts, a bridge between the columns every six layers (frame rails round a pipe) and a
// computer heat vent condenser crown. The controller sits in the middle of the front face, one row up; the parts go in the two rows beside it.
//
// Textures: overlay dir grindless:block/multiblock/stellar_fractionation_hall (tools/assets/Build-UXVStellarFractionationHallTextures.ps1).
// Names / tooltips / info page: client_scripts/grindless/uxv_stellar_fractionation_hall_lang.js. Controller recipe: server_scripts/grindless/uxv/stellar_fractionation_hall.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns

  const ID = 'stellar_fractionation_hall'
  const CASING = 'gtceu:uxv_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uxv/side'
  const GLASS = 'gtceu:laminated_glass'
  const PIPE = 'gtceu:titanium_pipe_casing'
  const COIL = 'gtceu:superconducting_coil'
  const VENT = 'gtceu:computer_heat_vent'
  const FRAME = 'naquadah_alloy'
  const TYPES = ['distillation_tower', 'distillery']
  const CAP = 4096
  const MAX_OUTPUTS = 12
  const W = 13
  const H = 13
  const D = 25
  const PLINTH = 3
  const LAYERS = D - PLINTH
  const BRIDGE_EVERY = 6
  const GLASS_EVERY = 4
  const COLUMN_X = [3, 9]
  const COLUMN_Y = 6
  const CTRL = { x: 6, y: 1 }
  // 1 maintenance + 2 energy + 2 input buses + 2 output buses + 4 input hatches + 1 parallel hatch
  const PART_CELLS = 12

  function abs(n) { return n < 0 ? -n : n }
  function cheb(a, b) { return abs(a) > abs(b) ? abs(a) : abs(b) }

  // the column (0 or 1) whose 5 x 5 footprint holds the cell, or -1
  function columnOf(x, y) {
    for (var i = 0; i < COLUMN_X.length; i++) {
      if (cheb(x - COLUMN_X[i], y - COLUMN_Y) <= 2) return i
    }
    return -1
  }

  // x left to right, y bottom to top, z back (0) to front (24); one char per cell, ' ' outside the silhouette
  function cell(x, y, z) {
    var edge = x === 0 || x === W - 1 || y === 0 || y === H - 1
    var corner = (x === 0 || x === W - 1) && (y === 0 || y === H - 1)
    var col = columnOf(x, y)
    if (z >= LAYERS) {
      var p = D - 1 - z
      if (p === 0) {
        if (x === CTRL.x && y === CTRL.y) return 'S'
        if (edge) return 'Q'
        if (y <= 2 && x >= 2 && x <= W - 3) return 'X'
        if (y >= 5 && y <= 9 && x >= 5 && x <= 7) return 'V'
        if (y >= 5 && y <= 9 && (x === 2 || x === 3 || x === 9 || x === 10)) return 'L'
        return 'F'
      }
      if (edge) return corner ? 'Q' : 'F'
      if (p === 1) {
        if (cheb(x - 6, y - 6) === 5) return 'K'
        return col >= 0 && x === COLUMN_X[col] && y === COLUMN_Y ? 'P' : '#'
      }
      if (col >= 0) {
        var dx = x - COLUMN_X[col]
        var dy = y - COLUMN_Y
        if (cheb(dx, dy) === 2) return abs(dx) === 2 && abs(dy) === 2 ? 'Q' : 'F'
        return dx === 0 && dy === 0 ? 'P' : '#'
      }
      return '#'
    }
    var k = LAYERS - 1 - z
    if (col < 0) {
      // the bridge between the columns: frame rails above and below a pipe
      if (x === 6 && abs(y - COLUMN_Y) <= 2 && k % BRIDGE_EVERY === BRIDGE_EVERY - 1) {
        if (abs(y - COLUMN_Y) === 2) return 'Q'
        return y === COLUMN_Y ? 'P' : '#'
      }
      return ' '
    }
    var cx = x - COLUMN_X[col]
    var cy = y - COLUMN_Y
    var ring = cheb(cx, cy)
    if (k === LAYERS - 1) return cx === 0 && cy === 0 ? 'P' : 'V'
    if (ring < 2) return ring === 0 ? 'P' : '#'
    if (abs(cx) === 2 && abs(cy) === 2) return 'Q'
    if (k % GLASS_EVERY === GLASS_EVERY - 2) return 'L'
    // the hatch cells: the outer face's middle row on the layers between the glass bands
    var outer = col === 0 ? cx === -2 : cx === 2
    if (outer && cy === 0 && k % GLASS_EVERY === 0) return 'O'
    return 'F'
  }

  function build() {
    var slices = []
    var counts = { F: 0, X: 0, O: 0 }
    for (var z = 0; z < D; z++) {
      var rows = []
      for (var y = 0; y < H; y++) {
        var row = ''
        for (var x = 0; x < W; x++) {
          var ch = cell(x, y, z)
          if (counts[ch] !== undefined) counts[ch]++
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return { slices: slices, counts: counts }
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
        L: Pat.block(GLASS),
        P: Pat.block(PIPE),
        K: Pat.block(COIL),
        V: Pat.block(VENT),
        Q: Pat.frame([FRAME]),
        X: Pat.oneOf(
          Pat.block(CASING, { min: BUILT.counts.X - PART_CELLS }),
          Pat.part('maintenance', { exact: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          Pat.part('input_bus', { max: 2 }),
          Pat.part('output_bus', { max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 4 }),
          G.parallelHatch.part()
        ),
        O: Pat.oneOf(
          Pat.block(CASING),
          Pat.part('output_hatch', { max: MAX_OUTPUTS })
        ),
        '#': Pat.air()
      }
    }
  }

  // true = the recipe belongs to another mode than the active one
  function otherMode(machine, recipe) {
    return String(recipe.getType().registryName) !== String(machine.getRecipeType().registryName)
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const SH = G.stellarFractionationHall || (G.stellarFractionationHall = {})
  SH.id = 'gtceu:' + ID
  SH.types = TYPES.map(function (t) { return 'gtceu:' + t })
  SH.cap = CAP
  SH.maxOutputs = MAX_OUTPUTS
  SH.casing = CASING
  SH.size = { width: W, height: H, depth: D }
  SH.counts = BUILT.counts

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SPEC = makeSpec()
    Pat.register('gtceu:' + ID, SPEC)

    var veto = function (machine, recipe) {
      return otherMode(machine, recipe) ? ModifierFunction.NULL : ModifierFunction.IDENTITY
    }
    var chain = [veto].concat(G.mega.chain({ parallel: 'fixed', cap: CAP, hatch: true, discount: null, oc: 'perfect', batch: true }))

    var b = event.create(ID, 'multiblock')
      .langValue('Stellar Fractionation Hall')
      .rotationState(RotationState.NON_Y_AXIS)
    TYPES.forEach(function (t) { b = b.recipeType(t) })
    G.mega.install(b, chain)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.stellar_fractionation_hall.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_2.tooltip', Text.translate('gtceu.distillation_tower'), Text.translate('gtceu.distillery')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip'),
        Text.translate('gtceu.machine.perfect_oc')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
