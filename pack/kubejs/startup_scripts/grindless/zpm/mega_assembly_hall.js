// priority: -11350
// -----------------------------------------------------------------------------------------------
// ZPM Assembly Hall, gtceu:assembly_hall (package MEGA-7, docs/eras/mega.md 4.9): an assembly-line-casing hall that runs GTM's own
// assembler and circuit assembler recipes, one mode at a time (the player picks it in the controller's machine mode tab). The
// assembly line itself stays out.
//
// How it works (lib/mega.js unchanged, proven by MEGA-0/0c; nothing new here):
// - Parallels: G.mega.chain({ parallel: 'fixed', cap: 64, hatch: true, oc: 'nonperfect', batch: true }): ceiling 64 x the formed
//   parallel hatch's parallel (no hatch: 64; LuV hatch 16: 1024; ZPM hatch 64: 4096), cut to what the energy hatches carry
//   (floor(max voltage / recipe EU/t)), then to what the inputs and output room allow, then GTM's non-perfect overclock and batch
//   mode (family rules 1, 3 and 4). No discount, no new recipe.
// - Mode veto: the first modifier rejects any recipe that is not of the active mode (GTM 7.5.3 keeps the cached last recipe across
//   a mode switch; same fix as MEGA-1 and mv/leisure_factories.js).
// - Cleanroom (option b of the contract): many circuit assembler recipes carry GTM's cleanroom condition. GTM checks it on the
//   candidate recipe before the modifiers (CleanroomCondition.testCondition through RecipeHelper.checkConditions from
//   RecipeLogic), against the controller's ICleanroomReceiver cleanroom. A KubeJS machine cannot become its own provider without a
//   Java class, so the condition stays and the hall must stand inside a formed GTM cleanroom. The footprint is 11 wide x 9 high x
//   12 deep, which fits the largest cleanroom interior (13 x 13 x 13, CleanroomMachine radius scan 7, height scan 14), leaving one
//   cell between the hall's front and the cleanroom wall so the controller stays reachable.
//
// Structure (11 x 9 x 12, lib/patterns.js; QR-S2 layout, see build()): assembly line casing floor, roof borders and wall bases; stainless
// steel frame trusses over the roof with laminated glass skylights between them; frame posts and glass bays in the walls; assembly line
// unit casings in the four vertical corners; two assembly line grating conveyor strips on the floor; the controller
// sits in the middle of the front wall, one row up. Parts go in any casing cell: 1 maintenance, 1 to 4 energy hatches, 1 to 6 input
// buses, 1 to 6 output buses, 1 to 4 input hatches (the assemblers use solder), 0 or 1 parallel hatch.
//
// Textures: overlay dir grindless:block/multiblock/assembly_hall (tools/assets/Build-MegaAssemblyHallTextures.ps1). Names / tooltips:
// client_scripts/grindless/zpm_mega_assembly_hall_lang.js. Controller recipe: server_scripts/grindless/zpm/mega_assembly_hall.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns

  const ID = 'assembly_hall'
  const CASING = 'gtceu:assembly_line_casing'
  const UNIT = 'gtceu:assembly_line_unit'
  const GRATING = 'gtceu:assembly_line_grating'
  const GLASS = 'gtceu:laminated_glass'
  const CASING_TEXTURE = 'gtceu:block/casings/mechanic/machine_casing_assembly_control'
  const CAP = 64
  // every recipeType() call appends one mode; the first one is the mode a new controller starts in
  const TYPES = ['assembler', 'circuit_assembler']
  const W = 11
  const H = 9
  const D = 12
  // most cells that can hold a part: 1 maintenance + 4 energy + 6 + 6 buses + 4 input hatches + 1 parallel hatch
  const PART_CELLS = 22

  // slices back -> front, rows bottom -> top, one char per column
  // QR-S2: a factory hall, not a casing box. Stainless frame trusses (T) over the roof every third slice with glass skylights (L)
  // between them, frame posts and glass bays in the side walls, a big window in the back wall and two bays in the front one, assembly
  // line units (U) in the four vertical corners and two grating conveyor strips (G) down the floor. Casing (X) stays on the floor,
  // the roof borders and the wall bases, where the parts go.
  function build() {
    var slices = []
    var casingCells = 0
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
            if (y === 0) {
              if ((x === 3 || x === 7) && z >= 1 && z <= D - 2) ch = 'G'
            } else if (y === H - 1) {
              if (!edgeX && !edgeZ) {
                if (z % 3 === 0) ch = 'T'
                else if (x >= 2 && x <= W - 3) ch = 'L'
              } else if (edgeX && edgeZ) ch = 'T'
            } else if (edgeX && edgeZ) ch = 'U'
            else if (edgeX) {
              if (z % 3 === 0) ch = 'T'
              else if (y >= 3 && y <= 5) ch = 'L'
            } else if (z === 0) {
              if (y >= 3 && y <= 5 && x >= 2 && x <= W - 3) ch = 'L'
            } else if (y >= 3 && y <= 5 && (x >= 2 && x <= 4 || x >= 6 && x <= W - 3)) ch = 'L'
          }
          if (ch === 'X') casingCells++
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return { slices: slices, casingCells: casingCells }
  }
  const BUILT = build()

  // built when the machine registers: G.parallelHatch (lib/parallel_hatch.js) is not needed before that
  function makeSpec() {
    return {
      slices: BUILT.slices,
      symbols: {
        S: Pat.controller(),
        U: Pat.block(UNIT),
        L: Pat.block(GLASS),
        T: Pat.frame(['stainless_steel']),
        G: Pat.block(GRATING),
        X: Pat.oneOf(
          Pat.block(CASING, { min: BUILT.casingCells - PART_CELLS }),
          Pat.part('maintenance', { exact: 1 }),
          Pat.part('energy_input', { min: 1, max: 4 }),
          Pat.part('input_bus', { min: 1, max: 6 }),
          Pat.part('output_bus', { min: 1, max: 6 }),
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
  const AH = G.megaAssemblyHall || (G.megaAssemblyHall = {})
  AH.id = 'gtceu:' + ID
  AH.types = TYPES.map(function (t) { return 'gtceu:' + t })
  AH.cap = CAP
  AH.casing = CASING
  AH.size = { width: W, height: H, depth: D }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SPEC = makeSpec()
    Pat.register('gtceu:' + ID, SPEC)

    var veto = function (machine, recipe) {
      return otherMode(machine, recipe) ? ModifierFunction.NULL : ModifierFunction.IDENTITY
    }
    var chain = [veto].concat(G.mega.chain({ parallel: 'fixed', cap: CAP, hatch: true, oc: 'nonperfect', batch: true }))

    var b = event.create(ID, 'multiblock')
      .langValue('Assembly Hall')
      .rotationState(RotationState.NON_Y_AXIS)
    TYPES.forEach(function (t) { b = b.recipeType(t) })
    G.mega.install(b, chain)
      .appearanceBlock(GTBlocks.CASING_ASSEMBLY_CONTROL)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.assembly_hall.tooltip.0'),
        Text.translate('grindless.machine.assembly_hall.tooltip.1'),
        Text.translate('grindless.machine.assembly_hall.tooltip.2'),
        Text.translate('grindless.machine.assembly_hall.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
