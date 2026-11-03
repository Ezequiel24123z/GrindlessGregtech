// priority: -2800
// -----------------------------------------------------------------------------------------------
// One of IV's multiblocks (docs/eras/iv.md, "Hot cell"; package IV-A3): the hot cell and its recipe type.
//
//   gtceu:hot_cell   a 7x5x4 bank of two shielded cells: walls of radiation-proof machine casing (GT--'s: dense lead, a tungstensteel
//                    frame and concrete) on a light concrete floor, two laminated glass windows in the operating face with a pair of
//                    tungstensteel master-slave manipulators through the wall above each, PTFE process vessels at the back of each
//                    cell and HEPA filters (GTM's filter casing) on the roof. Radioactive material goes in through buses and hatches and
//                    leaves to the network: it never passes through hands.
//   gtceu:hot_cell   its recipe type (EU in). The programmed circuit picks the mode; the recipes come from
//                    data/grindless/tables/hot_cell.json (server_scripts/grindless/iv/hot_cell.js):
//                      circuit 1  enrichment     GTM's UF6 line composed in one pass (hexafluoride, centrifuge, both electrolyses): 30
//                                                uraninite + 40 000 mB HF -> 1 U-235 + 9 U-238 + water + 40 000 mB F2. The UF6 never
//                                                leaves, and the fluorine the hexafluoride step needs comes back from the electrolyses.
//                      circuit 2  fuel           MOX assemblies (Pu and U-238 oxide in Zircaloy tubes), breeder assemblies (a Pu metal
//                                                core in a U-238 metal blanket, Zircaloy tubes), RTG pellets (PuO2 in Pt-Rh) and Pu-Be
//                                                neutron sources. Fresh LEU is the fuel fabrication plant's (decision 7).
//                      circuit 3  reprocessing   PUREX: a spent assembly + nitric acid -> its uranium and plutonium back, xenon,
//                                                krypton, caesium and neodymium, NO2 for GTM's nitric acid recipes, and glassed waste.
//                      circuit 4  radon          GTM's radon from U-238 composed with the plutonium dust -> ingot loop closed: the
//                                                plutonium catalyst stays inside, so the hot cell needs none.
//
// What it gains (rule 4): radioactive material never passes through hands, two recipes impossible at small scale (enrichment in one pass
// with the fluorine returned, radon with no plutonium stock) and a fuel cycle GTM does not have (MOX, breeding, reprocessing).
//
// Containment: the waste (gtnn:radioactive_waste) leaves through the output bus and is never emptied: the recipe modifier cancels a run
// with grindless.machine.hot_cell.no_voiding while the controller voids items or fluids (the mechanism of grindless.steam_outputs.no_voiding
// and the fission reactor). Otherwise GTM's own overclock applies (the default modifier of an electric multiblock), after a parallel
// hatch's copies when one sits in a part cell (lib/parallel_hatch.js, IV-B6: the IV hatch runs up to 4 copies, which at 7,680 EU/t
// needs two IV energy hatches).
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front), 11 wide, 6 high, 5 deep
// (about 240 blocks, D2-SIZE-IV):
//   slice 0, the service wall: rows 1-2 are `X` (casing or a part: the transfer ports), the rest shield casing.
//   slices 1-3, two 4-wide cells (columns 1-4 and 6-9, rows 1-3): a light concrete floor (B); two PTFE vessels (V) at the back of each
//   cell's lower row and one more bank above them, air in front; a shield partition (column 5) between the cells and shield side walls
//   with ports in row 2 (X); the shield ceiling (row 4) carries a HEPA filter casing bank (F) over each cell on the roof (row 5).
//   slice 4, the operating face: the shield wall, two 2x2 laminated glass windows (G) per cell wall, the controller on the partition
//   (row 2), and a tungstensteel frame manipulator (M) through the wall over each window column (row 3).
// The 22 `X` cells take 1-2 energy hatches, 1-3 input buses, 1-3 output buses, 1-4 input hatches, 1-4 output hatches and at most one
// parallel hatch (IV-B6); at least 5 stay casing. ME buses and hatches have the same abilities, so they fit.
//// Textures: overlay dir grindless:block/multiblock/hot_cell (tools/assets/Build-HotCellTextures.ps1) on GT--'s radiation-proof casing.
// Names / tooltips: client_scripts/grindless/iv_hot_cell_lang.js. Published for the recipe script and the smoke test:
// global.grindless.hotCell.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const HC = G.hotCell || (G.hotCell = {})
  const LOG = '[grindless/iv] '

  const MACHINE = 'gtceu:hot_cell'
  const TYPE = 'hot_cell'
  const TABLE = 'kubejs/data/grindless/tables/hot_cell.json'

  const SHIELD = 'gtnn:radiation_proof_machine_casing'
  const SHIELD_TEXTURE = 'gtnn:block/casings/solid/radiation_proof_machine_casing'
  const FLOOR = 'gtceu:light_concrete'
  const WINDOW = 'gtceu:laminated_glass'
  const VESSEL = 'gtceu:ptfe_pipe_casing'
  const FILTER = 'gtceu:filter_casing'
  const MANIPULATOR = 'tungsten_steel'

  const NO_VOIDING = 'grindless.machine.hot_cell.no_voiding'
  // the recipe data key: the EMI line gtceu.recipe.grindless_hot_cell.<recipe name>
  const DATA_KEY = 'grindless_hot_cell'

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  HC.machine = MACHINE
  HC.recipeType = 'gtceu:' + TYPE
  HC.table = TABLE
  // items in: up to three ingredients and the programmed circuit; out: uranium, plutonium, waste and the two chanced fission products.
  // Fluids in: oxygen and helium (MOX); out: NO2, xenon and krypton (reprocessing)
  HC.maxIO = { itemsIn: 4, itemsOut: 6, fluidsIn: 4, fluidsOut: 4 }
  HC.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 3 },
    output_bus: { min: 1, max: 3 },
    input_hatch: { min: 1, max: 4 },
    output_hatch: { min: 1, max: 4 }
  }
  HC.minCasing = 4
  HC.modes = { 1: 'enrichment', 2: 'fuel', 3: 'reprocessing', 4: 'radon', 5: 'silicon_28', 6: 'boron_11' }
  HC.noVoiding = NO_VOIDING
  HC.dataKey = DATA_KEY
  HC.blocks = { shield: SHIELD, floor: FLOOR, window: WINDOW, vessel: VESSEL, filter: FILTER, manipulator: MANIPULATOR }

  // ---------------------------------------------------------------- pattern

  // 11 wide, 6 high, 5 deep: slices back -> front, rows bottom -> top, built cell by cell then written out as strings
  function hotCellSlices() {
    var W = 11, H = 6, D = 5
    var g = []
    for (var z = 0; z < D; z++) {
      g.push([])
      for (var y = 0; y < H; y++) {
        var row = []
        for (var x = 0; x < W; x++) row.push(' ')
        g[z].push(row)
      }
    }
    var cells = [[1, 4], [6, 9]]
    for (var z1 = 0; z1 < D; z1++) {
      for (var x1 = 0; x1 < W; x1++) {
        g[z1][0][x1] = 'B'
        g[z1][4][x1] = 'R'
        for (var y1 = 1; y1 <= 3; y1++) {
          var wall = z1 === 0 || z1 === D - 1 || x1 === 0 || x1 === W - 1 || x1 === 5
          g[z1][y1][x1] = wall ? 'R' : '#'
        }
      }
    }
    // the service wall (the transfer ports) and the side-wall ports
    for (var x2 = 1; x2 <= 9; x2++) {
      if (x2 === 5) continue
      g[0][1][x2] = 'X'
      g[0][2][x2] = 'X'
    }
    for (var z2 = 1; z2 <= 3; z2++) {
      g[z2][2][0] = 'X'
      g[z2][2][W - 1] = 'X'
    }
    cells.forEach(function (c) {
      // the PTFE vessels at the back of each cell, the shield and windows on the operating face, the HEPA banks on the roof
      for (var x3 = c[0]; x3 <= c[1]; x3++) {
        g[1][1][x3] = 'V'
        g[2][1][x3] = 'V'
        for (var z3 = 1; z3 <= 2; z3++) g[z3][5][x3] = 'F'
        for (var y3 = 1; y3 <= 3; y3++) g[D - 1][y3][x3] = 'R'
      }
      g[1][2][c[0] + 1] = 'V'
      g[1][2][c[0] + 2] = 'V'
      for (var wx = c[0] + 1; wx <= c[0] + 2; wx++) {
        g[D - 1][1][wx] = 'G'
        g[D - 1][2][wx] = 'G'
        g[D - 1][3][wx] = 'M'
      }
    })
    g[D - 1][2][5] = 'S'
    return g.map(function (slice) {
      return slice.map(function (row) { return row.join('') })
    })
  }

  const SPEC = {
    slices: hotCellSlices(),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(SHIELD, { min: HC.minCasing }),
        Pat.part('energy_input', HC.parts.energy_input),
        Pat.part('input_bus', HC.parts.input_bus),
        Pat.part('output_bus', HC.parts.output_bus),
        Pat.part('input_hatch', HC.parts.input_hatch),
        Pat.part('output_hatch', HC.parts.output_hatch),
        G.parallelHatch.part()
      ),
      R: Pat.block(SHIELD),
      B: Pat.block(FLOOR),
      G: Pat.block(WINDOW),
      V: Pat.block(VESSEL),
      F: Pat.block(FILTER),
      M: Pat.frame([MANIPULATOR]),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- containment

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
      }
    }
    return LC
  }

  // true while the controller is set to void items or fluids (GTM's IVoidable): the waste, the radon or the fluorine would be thrown away
  function voids(machine) {
    var c = lazy()
    return machine.canVoidRecipeOutputs(c.ItemCap) === true || machine.canVoidRecipeOutputs(c.FluidCap) === true
  }
  HC.voids = voids

  var noVoiding = null

  // before every run (alwaysTryModifyRecipe): voiding refused, then a parallel hatch's copies if there is one, then GTM's own overclock
  function cellModifier() {
    var failed = false
    var parallelThenOverclock = G.parallelHatch.modifier(G.parallelHatch.overclock)
    return function (machine, recipe) {
      try {
        if (voids(machine)) {
          if (noVoiding === null) noVoiding = ModifierFunction.cancel(Text.translate(NO_VOIDING))
          return noVoiding
        }
        return parallelThenOverclock(machine, recipe)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'hot cell recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  // One EMI line per recipe, read from its data: what the mode does
  function modeInfo(data) {
    try {
      var name = String(data.getString(DATA_KEY))
      if (name === '') return ''
      return String(Text.translate('gtceu.recipe.' + DATA_KEY + '.' + name).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(HC.maxIO.itemsIn, HC.maxIO.itemsOut, HC.maxIO.fluidsIn, HC.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(modeInfo)

    Pat.register(MACHINE, SPEC)

    event.create('hot_cell', 'multiblock')
      .langValue('Hot Cell')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      .recipeModifier(cellModifier(), true)
      // GTM restarts a cached recipe without the modifier: refuse voiding at every start too (lib/no_voiding.js, IV-A4's finding)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: NO_VOIDING, name: 'hot cell' }))
      .appearanceBlock(function () { return Block.getBlock(SHIELD) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.hot_cell.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.hot_cell')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(SHIELD_TEXTURE, 'grindless:block/multiblock/hot_cell')
  })
})()
