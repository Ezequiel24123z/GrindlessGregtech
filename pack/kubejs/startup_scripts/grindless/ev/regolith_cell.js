// priority: -1400
// -----------------------------------------------------------------------------------------------
// The Regolith Cell, the chemistry of the Moon base (docs/eras/ev.md, "Regolith cell"), and the recipe type it runs.
//
//   gtceu:regolith_cell   5x5x4 hall of Sintered Regolith Bricks around a crucible of stable titanium casing with a ring of nichrome
//                         coils, under a tempered glass roof; runs the new gtceu:regolith_processing
//
// What it wins: RECIPES THAT DO NOT EXIST ON EARTH. Oxygen on a world with no air, titanium without chlorine, magnesium or carbon, and
// the brick the whole Moon base is built from. Every recipe carries the Moon's dimension condition (server_scripts/grindless/ev/
// regolith_cell.js): the cell forms anywhere, but it only works on the Moon. The programmed circuit picks the mode:
//   1  volatiles     lunar regolith dust heated until it gives up its solar wind: hydrogen, helium, nitrogen and a pinch of helium-3
//                    (the trace of water is vented: inert)
//   2  electrolysis  molten regolith electrolysis (NASA and MIT's MRE) with a platinum anode: oxygen, silicon and iron. With ilmenite
//                    in the Molten Salt Charge (Cambridge's FFC process): titanium ingots, iron and oxygen, at the energy of the Kroll
//                    stages it replaces
//   3  sintering     lunar regolith dust -> Sintered Regolith Bricks, faster than the electric furnace that makes the first ones
// Its conditions: the site (the Moon), a Platinum Electrode in the input bus for the electrolysis (the platinum plant's; used up in
// 0.1 % of the runs), the Molten Salt Charge for titanium (never used up), and a destination for every output: each output hatch holds
// one gas, and if a bus or a hatch fills up the cell stops.
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's; no parallels. The
// recipes run at 1,920 EU/t: one EV energy hatch runs them as they are, two raise the tier and overclock them.
//
// Geometry (slices back -> front, rows bottom -> top, columns left -> right as seen from the front; the controller is in the front slice,
// middle column, row 1):
//   row 0   the floor, 5x5 (symbol X: brick or a part)
//   row 1   the walls (X) around the crucible: a 3x3 of stable titanium casing (T); the controller in the middle of the front wall
//   row 2   the walls (X) around a ring of eight nichrome coils (K) with the melt in the middle (air)
//   row 3   the roof, 5x5 tempered glass (G)
// The 56 `X` cells (floor and walls) are Sintered Regolith Bricks or parts: 1-2 energy hatches, 1-2 input buses, 1-2 output buses and
// 1-5 output hatches (five plain hatches, one per gas: hydrogen, helium, nitrogen, helium-3 and oxygen; one ME output hatch takes them
// all). At most 11 parts, so at least 45 cells are brick. The brick is made only on the Moon, so the cell is a lunar building.
//
// Textures: overlay dir grindless:block/multiblock/regolith_cell (tools/assets/Build-RegolithCellTextures.ps1) on the brick's own
// texture, grindless:block/sintered_regolith (the casing texture of the lunar multiblocks). Names / tooltips:
// client_scripts/grindless/ev_regolith_cell_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const RC = G.regolithCell || (G.regolithCell = {})

  const MACHINE = 'gtceu:regolith_cell'
  const TYPE = 'gtceu:regolith_processing'

  const BRICK = 'grindless:sintered_regolith'
  const BRICK_TEXTURE = 'grindless:block/sintered_regolith'
  const CRUCIBLE = 'gtceu:stable_machine_casing'
  const COIL = 'gtceu:nichrome_coil_block'
  const GLASS = 'gtceu:tempered_glass'

  // published for the recipe script and the smoke test
  RC.machine = MACHINE
  RC.recipeType = TYPE
  RC.brick = BRICK
  // items in: the regolith or the ilmenite, the electrode, the salt charge and the programmed circuit; items out: two metals or the
  // bricks; no fluid in; fluids out: the four volatiles of mode 1 (oxygen is the only gas of mode 2)
  RC.maxIO = { itemsIn: 4, itemsOut: 2, fluidsIn: 0, fluidsOut: 4 }
  RC.hatches = { energy: [1, 2], inputBus: [1, 2], outputBus: [1, 2], outputHatch: [1, 5] }

  // ---------------------------------------------------------------- pattern

  const WALL = ['XXXXX', 'XXXXX', 'XXXXX', 'GGGGG']
  const SPEC = {
    slices: [
      // back wall
      WALL,
      // the crucible, back row
      ['XXXXX', 'XTTTX', 'XKKKX', 'GGGGG'],
      // the crucible, middle row: the melt in the middle of the coil ring, open to the glass roof
      ['XXXXX', 'XTTTX', 'XK#KX', 'GGGGG'],
      // the crucible, front row
      ['XXXXX', 'XTTTX', 'XKKKX', 'GGGGG'],
      // front wall with the controller
      ['XXXXX', 'XXSXX', 'XXXXX', 'GGGGG']
    ],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(BRICK, { min: 45 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 5, preview: 5 })
      ),
      T: Pat.block(CRUCIBLE),
      K: Pat.block(COIL),
      G: Pat.block(GLASS),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('regolith_processing')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(RC.maxIO.itemsIn, RC.maxIO.itemsOut, RC.maxIO.fluidsIn, RC.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARC_FURNACE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ELECTROLYZER)
  })

  // ---------------------------------------------------------------- machine

  // The parts take the look of the brick they replace. The brick is a KubeJS block, so it is looked up when GTM first asks for it (after
  // every registry is filled) and kept once found.
  var brickBlock = null
  function brickAppearance() {
    if (brickBlock !== null) return brickBlock
    var b = Block.getBlock(BRICK)
    if (b != null && String(Block.getId(b)) === BRICK) brickBlock = b
    return b
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('regolith_cell', 'multiblock')
      .langValue('Regolith Cell')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('regolith_processing')
      .appearanceBlock(brickAppearance)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.regolith_cell.tooltip.0'),
        Text.translate('grindless.machine.regolith_cell.tooltip.1'),
        Text.translate('grindless.machine.regolith_cell.tooltip.2'),
        Text.translate('grindless.machine.regolith_cell.tooltip.3')
      ])
      .workableCasingModel(BRICK_TEXTURE, 'grindless:block/multiblock/regolith_cell')
  })
})()
