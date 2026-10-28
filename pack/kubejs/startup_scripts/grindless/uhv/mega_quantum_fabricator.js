// -----------------------------------------------------------------------------------------------
// UHV Quantum Fabricator, gtceu:quantum_fabricator (package MEGA-9, docs/eras/mega.md 4.11): a UHV machine casing hall with a field
// generator ring that runs GTM's own assembler, circuit assembler, forming press, laser engraver and cutter recipes, one mode at a
// time (the player picks it in the controller's machine mode tab). It scales the assembly hall (MEGA-7) by 16.
//
// How it works (lib/mega.js unchanged, proven by MEGA-0/0c; nothing new here):
// - Parallels: G.mega.chain({ parallel: 'fixed', cap: 1024, hatch: true, discount: null, oc: 'perfect', batch: true }): ceiling 1024 x
//   the formed parallel hatch's parallel (no hatch: 1024; UV hatch 256: 262,144; UHV hatch 1024: 1,048,576), cut to what the energy
//   hatches carry (floor(max voltage / recipe EU/t); every copy pays its EU), then to what the inputs and output room allow, then
//   GTM's perfect subtick overclock (energy-neutral, the gain: family rule 3 names this machine as the exception) and batch mode.
//   No discount, no new recipe.
// - Mode veto: the first modifier rejects any recipe that is not of the active mode (GTM 7.5.3 keeps the cached last recipe across a
//   mode switch; same fix as MEGA-7).
// - Cleanroom (option b, as MEGA-7): many circuit assembler recipes carry GTM's cleanroom condition. GTM checks it on the candidate
//   recipe before the modifiers, against the controller's ICleanroomReceiver cleanroom (the KubeJS multiblock is one, as the hall
//   is). A KubeJS machine cannot be its own provider, so the condition stays and the fabricator stands inside a formed GTM cleanroom
//   (the plain cleanroom for most circuits; the sterile one only where a recipe names it: this file changes neither). GTM's
//   cleanroom interior is at most 13 blocks, so mega.md's 17 x 13 x 17 does not fit: the fabricator is 11 wide x 10 high x 12 deep,
//   leaving one cell between its front and the cleanroom wall for the controller.
// - GTM's circuit assembler adds molten tin to every fluid-less recipe (MEGA-7), so the structure needs a fluid input hatch.
//
// Structure (11 x 10 x 12, lib/patterns.js): UHV machine casing floor, roof and walls; a ring of field ring casing round the walls at
// row 4; a laminated glass band above it in the side walls; the controller in the middle of the front wall, one row up. Parts go in
// any casing cell: 1 maintenance, 1 to 2 energy hatches, 2 to 6 input buses, 1 to 4 output buses, 1 to 4 input hatches, 0 or 1
// parallel hatch.
//
// Textures: overlay dir grindless:block/multiblock/quantum_fabricator and block/uhv/field_ring_casing
// (tools/assets/Build-MegaQuantumFabricatorTextures.ps1). Names / tooltips: client_scripts/grindless/uhv_mega_quantum_fabricator_lang.js.
// Controller and ring recipes: server_scripts/grindless/uhv/mega_quantum_fabricator.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns

  const ID = 'quantum_fabricator'
  const CASING = 'gtceu:uhv_machine_casing'
  const RING = 'grindless:field_ring_casing'
  const GLASS = 'gtceu:laminated_glass'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uhv/side'
  const CAP = 1024
  // every recipeType() call appends one mode; the first one is the mode a new controller starts in
  const TYPES = ['assembler', 'circuit_assembler', 'forming_press', 'laser_engraver', 'cutter']
  const W = 11
  const H = 10
  const D = 12
  const RING_ROW = 4
  const GLASS_ROWS = [5, 6]
  // most cells that can hold a part: 1 maintenance + 2 energy + 6 input buses + 4 output buses + 4 input hatches + 1 parallel hatch
  const PART_CELLS = 18

  // slices back -> front, rows bottom -> top, one char per column
  function build() {
    var slices = []
    var casingCells = 0
    var ringCells = 0
    for (var z = 0; z < D; z++) {
      var rows = []
      for (var y = 0; y < H; y++) {
        var row = ''
        for (var x = 0; x < W; x++) {
          var edgeX = x === 0 || x === W - 1
          var edgeZ = z === 0 || z === D - 1
          var ch = '#'
          if (z === D - 1 && x === 5 && y === 1) ch = 'S'
          else if (y === 0 || y === H - 1 || edgeZ || edgeX) {
            ch = 'X'
            if (y === RING_ROW && (edgeX || edgeZ)) ch = 'R'
            else if (edgeX && !edgeZ && z >= 3 && z <= 8 && GLASS_ROWS.indexOf(y) >= 0) ch = 'L'
          }
          if (ch === 'X') casingCells++
          if (ch === 'R') ringCells++
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return { slices: slices, casingCells: casingCells, ringCells: ringCells }
  }
  const BUILT = build()

  // built when the machine registers: G.parallelHatch (lib/parallel_hatch.js) is not needed before that
  function makeSpec() {
    return {
      slices: BUILT.slices,
      symbols: {
        S: Pat.controller(),
        R: Pat.block(RING),
        L: Pat.block(GLASS),
        X: Pat.oneOf(
          Pat.block(CASING, { min: BUILT.casingCells - PART_CELLS }),
          Pat.part('maintenance', { exact: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          Pat.part('input_bus', { min: 2, max: 6 }),
          Pat.part('output_bus', { min: 1, max: 4 }),
          Pat.part('input_hatch', { min: 1, max: 4 }),
          G.parallelHatch.part()
        ),
        '#': Pat.air()
      }
    }
  }
  var SPEC = null

  // true = the recipe belongs to another mode than the active one
  function otherMode(machine, recipe) {
    return String(recipe.getType().registryName) !== String(machine.getRecipeType().registryName)
  }

  // published for the crafting script, the node test and the bench test
  const QF = G.megaQuantumFabricator || (G.megaQuantumFabricator = {})
  QF.id = 'gtceu:' + ID
  QF.types = TYPES.map(function (t) { return 'gtceu:' + t })
  QF.cap = CAP
  QF.casing = CASING
  QF.ring = RING
  QF.size = { width: W, height: H, depth: D }

  StartupEvents.registry('block', function (event) {
    event.create(RING)
      .stoneSoundType()
      .hardness(5)
      .resistance(6)
      .requiresTool(true)
      .tagBlock('minecraft:mineable/pickaxe')
      .textureAll('grindless:block/uhv/field_ring_casing')
      .item(function (item) { item.tooltip(Text.gray(Text.translate('tooltip.grindless.field_ring_casing.0'))) })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SPEC = makeSpec()
    Pat.register('gtceu:' + ID, SPEC)

    var veto = function (machine, recipe) {
      return otherMode(machine, recipe) ? ModifierFunction.NULL : ModifierFunction.IDENTITY
    }
    var chain = [veto].concat(G.mega.chain({ parallel: 'fixed', cap: CAP, hatch: true, discount: null, oc: 'perfect', batch: true }))

    var b = event.create(ID, 'multiblock')
      .langValue('Quantum Fabricator')
      .rotationState(RotationState.NON_Y_AXIS)
    TYPES.forEach(function (t) { b = b.recipeType(t) })
    G.mega.install(b, chain)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.quantum_fabricator.tooltip.0'),
        Text.translate('grindless.machine.quantum_fabricator.tooltip.1'),
        Text.translate('grindless.machine.quantum_fabricator.tooltip.2'),
        Text.translate('grindless.machine.quantum_fabricator.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
