// -----------------------------------------------------------------------------------------------
// The Sealed Dome (gtceu:sealed_dome), the EV step of the Greenhouse family (docs/eras/ev.md, "Sealed dome"): crops where there is
// no sky, no soil and no air. A dome of tempered glass on a ring of sintered regolith bricks (only the Moon makes them), LED panels
// under its cap, a soil bed and an airlock door. It runs the family's own recipe type, gtceu:greenhouse: that type checks neither
// the sky nor the time of day, so the dome needs no type of its own (ev.md: "the greenhouse family's type if it does not check for
// sky or daytime").
//
// What it gains:
//   - PROGRAMMED CIRCUIT 4, the sealed mode, only off-world (server_scripts/grindless/ev/sealed_dome.js): every plant of the family
//     grows from water and carbon dioxide under the LEDs and gives oxygen back, with the HV greenhouse's yield (x3 the base output,
//     like its fertilizer + CO2 recipe) and no fertilizer. On the Moon the CO2 comes from home through the bridge (recipes
//     grindless:greenhouse/ev/<plant>_sealed_moon, .dimension('gcyr:luna')); on Mars the dome breathes it from the air like the gas
//     collector (grindless:greenhouse/ev/<plant>_sealed_mars, .dimension('gcyr:mars'), no CO2 input).
//   - The family step: circuits 0 to 3 work exactly as in the HV Greenhouse (every steam, LV and MV recipe), up to 64 runs at once.
//
// No lower greenhouse can run the sealed recipes: their ids carry the ev/ segment (the family's tier veto skips higher tiers), and
// they need circuit 4, which the LV, MV and HV vetoes already refuse (with a circuit of 2 or more in the bus they only take the
// fertilizer and booster recipes). The steam greenhouse has no fluid hatch, and every sealed recipe takes water.
//
// It uses `bores` (global.grindless.lv.bores, startup_scripts/grindless/lv/multis.js) with a cap of 64 runs, the EV cap of the
// families: one EV energy hatch (2,048 V) fills the 64 runs of a sealed recipe (8 EU/t each) and GTM's overclock halves the time.
// The veto below: circuit 4 = only the sealed recipes (so the plain recipe of the same plant waits); circuits 0 to 3 = the HV
// greenhouse's rules; never a recipe of a tier above EV.
//
// Geometry (slices back -> front, rows bottom -> top; 7 wide, 5 high, 7 deep; the controller is in the front slice, row 1):
//   row 0   floor: a ring of 24 `X` cells (sintered regolith or a part) around a 5x5 floor: 3x3 soil bed in a ring of 16 bricks
//   row 1   the ring wall: 22 `X` cells, the controller and the lower half of the airlock door (front, right of the controller)
//   row 2   the dome's wall: 23 tempered glass and the upper half of the door
//   row 3   the dome steps in: a 5x5 ring of tempered glass
//   row 4   the cap: 3x3 LED panels (GTM lamps, any colour, with or without border)
// The 46 `X` cells hold the parts: 1-2 energy hatches, 1 input bus (plant and circuit), 1-2 output buses, 1-2 input hatches (water,
// CO2; on Mars water is enough) and 1 output hatch (oxygen); at least 38 are bricks. ME buses and hatches have the same abilities and
// fit the same cells. The inside (59 cells) is free: put anything there.
//
// Textures: overlay dir grindless:block/multiblock/sealed_dome (tools/assets/Build-SealedDomeTextures.ps1) on the sintered regolith
// brick (grindless:block/sintered_regolith, ev/foundation.js). Names / tooltips: client_scripts/grindless/ev_sealed_dome_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SD = G.sealedDome || (G.sealedDome = {})

  const MACHINE = 'gtceu:sealed_dome'
  const BRICK = 'grindless:sintered_regolith'
  const BRICK_TEXTURE = 'grindless:block/sintered_regolith'
  const GLASS = 'gtceu:tempered_glass'
  const DOOR = 'minecraft:iron_door'
  const CO2 = 'gtceu:carbon_dioxide'

  const DYES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
    'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
  const LAMPS = DYES.map(function (dye) { return 'gtceu:' + dye + '_lamp' }).concat(
    DYES.map(function (dye) { return 'gtceu:' + dye + '_borderless_lamp' }))
  const SOIL = ['minecraft:dirt', 'minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:podzol',
    'minecraft:rooted_dirt', 'minecraft:farmland', 'minecraft:moss_block', 'minecraft:mud']

  const MAX_PARALLELS = 64
  const SEALED_CIRCUIT = 4

  // published for the recipe script and the smoke test
  SD.machine = MACHINE
  SD.recipeType = 'gtceu:greenhouse'
  SD.circuit = SEALED_CIRCUIT
  SD.cap = MAX_PARALLELS
  SD.blocks = { brick: BRICK, glass: GLASS, door: DOOR, lamps: LAMPS, soil: SOIL }
  SD.hatches = { energy: [1, 2], inputBus: 1, outputBus: [1, 2], inputHatch: [1, 2], outputHatch: 1 }

  // the sealed recipes: grindless:greenhouse/ev/<plant>_sealed_moon and _sealed_mars (server_scripts/grindless/ev/sealed_dome.js)
  function recipePath(recipe) {
    return String(recipe.id.getPath())
  }

  function isSealedRecipe(recipe) {
    return /\/ev\/.+_sealed_(moon|mars)$/.test(recipePath(recipe))
  }

  // family recipes of a tier above EV (an IV greenhouse's): the dome skips them, like every step skips the ones above it
  function isAboveEv(recipe) {
    return /\/(iv|luv|zpm|uv|uhv|uev|uiv|uxv|opv|max)\//.test(recipePath(recipe))
  }

  SD.isSealedRecipe = isSealedRecipe

  // ---------------------------------------------------------------- pattern (see lib/patterns.js)

  const BACK = ['XXXXXXX', 'XXXXXXX', 'GGGGGGG', '       ', '       ']
  const EDGE = ['XBBBBBX', 'X     X', 'G     G', ' GGGGG ', '       ']
  const BED = ['XBDDDBX', 'X     X', 'G     G', ' G   G ', '  LLL  ']
  const FRONT = ['XXXXXXX', 'XXXSAXX', 'GGGGAGG', '       ', '       ']
  const SPEC = {
    slices: [BACK, EDGE, BED, BED, BED, EDGE, FRONT],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(BRICK, { min: 38 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('output_hatch', { exact: 1 })
      ),
      B: Pat.block(BRICK),
      D: Pat.block(SOIL),
      G: Pat.block(GLASS),
      L: Pat.block(LAMPS),
      A: Pat.block(DOOR)
    }
  }

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var lv = global.grindless.lv
    var rules = lv.rules

    // circuit 4 = the sealed mode: only the sealed recipes; circuits 0 to 3 = the HV greenhouse's rules (circuit 2 = fertilizer
    // mode, with CO2 in a hatch the fertilizer + CO2 variant; circuit 3 = the boosters)
    function domeVeto(machine, recipe) {
      if (isAboveEv(recipe)) return true
      var circuit = rules.machineCircuit(machine)
      if (circuit >= SEALED_CIRCUIT) return !isSealedRecipe(recipe)
      if (isSealedRecipe(recipe)) return true
      if (circuit < 2) return false
      if (rules.isBoosterRecipe(recipe)) return false
      if (!rules.isFertilizerRecipe(recipe)) return true
      return !rules.isCo2Recipe(recipe) && rules.machineHasFluid(machine, CO2)
    }

    Pat.register(MACHINE, SPEC)

    event.create('sealed_dome', 'multiblock')
      .langValue('Sealed Dome')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('greenhouse')
      .recipeModifier(lv.bores(domeVeto, MAX_PARALLELS), true)
      .appearanceBlock(function () { return Block.getBlock(BRICK) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.sealed_dome.tooltip.0'),
        Text.translate('grindless.machine.sealed_dome.tooltip.1'),
        Text.translate('grindless.machine.sealed_dome.tooltip.2'),
        Text.translate('grindless.machine.sealed_dome.tooltip.3')
      ])
      .workableCasingModel(BRICK_TEXTURE, 'grindless:block/multiblock/sealed_dome')
  })
})()
