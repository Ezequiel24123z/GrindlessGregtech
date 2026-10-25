// -----------------------------------------------------------------------------------------------
// One of IV's multiblocks (docs/eras/iv.md, "Tritium removal facility"; package IV-B4): the tritium removal facility and its recipe type.
//
//   gtceu:tritium_removal_facility   a Moon plant on sintered regolith: a 3x3x12 cold box of frost-proof casing with a titanium pipe
//                                    core (the cryogenic distillation column), two 1x1x6 catalytic exchange columns of titanium pipe
//                                    casing standing at the sides, and on them two 2x3 wings of Night-Sky Radiators. Parts go in the
//                                    lowest ring of the cold box.
//   gtceu:detritiation               its recipe type (EU in). One recipe (server_scripts/grindless/iv/tritium_removal.js): 1,000 mB
//                                    tritiated heavy water, with a 100 mB deuterium charge that is never used up (the exchange carrier,
//                                    GTM's notConsumableFluid) -> 900 mB heavy water + 200 mB tritium, 110,080 EU at IV voltage. It
//                                    carries .dimension('gcyr:luna').
//
// What it gains (rule 4): the fission reactor's activated moderator (decision 3: its heavy-water cores give tritiated heavy water) gets
// a contained destination; the heavy water goes back to the reactor and the tritium becomes a product, stored for LuV's fusion. It is
// the pack's only tritium source (decision 4). Several steps in one: catalytic exchange of the water's tritium into the deuterium
// carrier, cryogenic distillation of the carrier and the tritium's storage, the work of the real Darlington facility. The Moon gives the
// cold: in the lunar night, with the radiators open to the black sky, a run costs half.
//
// Night: the cryogenic plant's run-start rule (ev/cryogenic_plant.js): the recipe modifier halves the EU/t of a run that STARTS with the
// sun down (day time 12,786-23,214, the plant's own sunIsDown) and all 12 radiators seeing the sky (Level#canSeeSky on the block above
// each one). It is registered with alwaysTryModifyRecipe, so GTM re-applies it when each run ends: a run keeps the price it started with.
// Then GTM's standard overclock (non-perfect). Recipe conditions are checked on every tick, so a night recipe would stall at dawn; and
// one recipe per lookup path, so there is no second, night copy of the recipe.
//
// Containment: tritium is radioactive (GTM's hazard) and the tritiated heavy water too. The facility refuses to run while its
// controller voids fluids (grindless.machine.tritium_removal_facility.no_voiding), through lib/no_voiding.js: in the recipe modifier
// (before the night pricing) and in beforeWorking, because GTM 7.5.3 restarts an idle machine's cached recipe without its modifier.
// Voiding items is allowed: the facility makes none. Off the Moon it forms, but its recipe does not start (GTM's dimension condition),
// and the controller says why (grindless.machine.tritium_removal_facility.not_moon).
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's. No parallels.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front; 7 wide, 13 high,
// 3 deep):
//   row 0       sintered regolith: 3x3 under the cold box and a footing under each exchange column
//   row 1       the cold box's lowest ring: casing or parts (X, 7 cells), the controller in the middle of the front
//   rows 1-11   the titanium pipe core in the middle of the cold box; frost-proof casing round it (rows 2-11)
//   row 12      the cold box's roof
//   rows 1-6    the exchange columns: titanium pipe casing in the middle slice, at the outer columns (0 and 6)
//   row 7       the radiator wings: 2x3 Night-Sky Radiators on each side of the cold box (12), resting on the columns
// Parts (X): 1-2 energy hatches, 1-2 input hatches (the tritiated heavy water and the deuterium charge) and 1-2 output hatches (heavy
// water and tritium). ME hatches and GTM's quadruple and nonuple hatches have the same abilities, so they fit the same cells.
//
// Textures: overlay dir grindless:block/multiblock/tritium_removal_facility (tools/assets/Build-TritiumRemovalTextures.ps1) on GTM's
// frost-proof casing. Names / tooltips: client_scripts/grindless/iv_tritium_removal_lang.js. Published for the recipe script and the
// smoke test: global.grindless.tritiumRemoval.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const TRF = G.tritiumRemoval || (G.tritiumRemoval = {})
  const LOG = '[grindless/iv] '

  const MACHINE = 'gtceu:tritium_removal_facility'
  const TYPE = 'detritiation'
  const DIMENSION = 'gcyr:luna'

  const CASING = 'gtceu:frostproof_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'
  const PIPE = 'gtceu:titanium_pipe_casing'
  const BRICK = 'grindless:sintered_regolith'
  const RADIATOR = 'grindless:night_sky_radiator'

  // the exchange carrier: needed in an input hatch to start a run, never drained (GTM's non-consumed fluid input)
  const CARRIER = { id: 'gtceu:deuterium', amount: 100 }

  const NIGHT_FACTOR = 0.5
  // the cryogenic plant's recipe data key: the night EU/t, read by the EMI line (the same text, gtceu.recipe.grindless_night_eut)
  const NIGHT_KEY = 'grindless_night_eut'
  const NO_VOIDING = 'grindless.machine.tritium_removal_facility.no_voiding'
  const NOT_MOON = 'grindless.machine.tritium_removal_facility.not_moon'
  const SKY_KEY = 'grindless.machine.tritium_removal_facility.sky'
  const CARRIER_KEY = 'grindless.machine.tritium_removal_facility.carrier'

  const PARTS = {
    energy_input: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 }
  }

  // ---------------------------------------------------------------- pattern

  // rows bottom -> top of one slice: the footing, the lowest ring, the box up to the wings (rows 2-6), the wing row, the box above
  // them (rows 8-11) and the roof
  function slice(footing, ring, box, wing, upper, roof) {
    var rows = [footing, ring]
    for (var r = 2; r <= 6; r++) rows.push(box)
    rows.push(wing)
    for (var u = 8; u <= 11; u++) rows.push(upper)
    rows.push(roof)
    return rows
  }

  const SPEC = {
    slices: [
      // back
      slice('  BBB  ', '  XXX  ', '  CCC  ', 'RRCCCRR', '  CCC  ', '  CCC  '),
      // middle: the titanium core, and an exchange column on its footing under the tip of each wing
      slice('B BBB B', 'P XPX P', 'P CPC P', 'RRCPCRR', '  CPC  ', '  CCC  '),
      // front: the controller in the lowest ring
      slice('  BBB  ', '  XSX  ', '  CCC  ', 'RRCCCRR', '  CCC  ', '  CCC  ')
    ],
    symbols: {
      S: Pat.controller(),
      // the lowest ring: 7 cells, 3 to 6 of them parts, the rest frost-proof casing
      X: Pat.oneOf(
        Pat.block(CASING),
        Pat.part('energy_input', PARTS.energy_input),
        Pat.part('input_hatch', PARTS.input_hatch),
        Pat.part('output_hatch', PARTS.output_hatch)
      ),
      C: Pat.block(CASING),
      P: Pat.block(PIPE),
      B: Pat.block(BRICK),
      R: Pat.block(RADIATOR)
    }
  }

  // ---------------------------------------------------------------- night and sky (the cryogenic plant's rule)

  // the radiator cells relative to the controller: up, back (away from the front face), side (+ = towards the column index)
  function radiatorCells() {
    var ctrl = null
    var cells = []
    SPEC.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === 'S') ctrl = { si: si, ri: ri, ci: ci }
          if (ch === 'R') cells.push({ si: si, ri: ri, ci: ci })
        }
      })
    })
    return cells.map(function (c) { return { up: c.ri - ctrl.ri, back: ctrl.si - c.si, side: c.ci - ctrl.ci } })
  }
  const CELLS = radiatorCells()
  if (CELLS.length !== 12) throw new Error(LOG + 'tritium removal facility: expected 12 radiator cells, found ' + CELLS.length)

  // horizontal step of each facing (by name: no Direction method whose script name KubeJS may have changed)
  const STEPS = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }

  // world position of a cell: front (fx, fz) is the direction the controller faces; back = -front, +side = (fz, -fx) (the mapping of
  // ev/cryogenic_plant.js; the wings are symmetric, so its sign does not matter)
  function cellPos(pos, fx, fz, c) {
    return pos.offset(-fx * c.back + fz * c.side, c.up, -fz * c.back - fx * c.side)
  }

  // the sun is down from day time 12,786 to 23,214: the cryogenic plant's sunIsDown (integer bounds, because Math.PI is undefined in
  // this Rhino), or the same bounds here if that script did not publish it
  const SUNSET = 12786
  const SUNRISE = 23214
  function sunIsDown(dayTime) {
    var C = G.cryogenicPlant
    if (C && typeof C.sunIsDown === 'function') return C.sunIsDown(dayTime) === true
    var t = Number(dayTime) % 24000
    if (t < 0) t += 24000
    return t >= SUNSET && t <= SUNRISE
  }

  // how many radiators do not see the sky (-1 when the facing is unknown)
  function coveredRadiators(machine) {
    var level = machine.getLevel()
    var step = STEPS[String(machine.getFrontFacing()).toLowerCase()]
    if (level == null || !step) return -1
    var pos = machine.getPos()
    var covered = 0
    for (var i = 0; i < CELLS.length; i++) {
      if (!level.canSeeSky(cellPos(pos, step[0], step[1], CELLS[i]).above())) covered++
    }
    return covered
  }

  // 'night' (half price), 'day' (the sun is up) or 'covered' (night, but radiators that do not see the sky)
  function skyState(machine) {
    var level = machine.getLevel()
    if (level == null) return { key: 'day', covered: 0 }
    if (!sunIsDown(Number(level.getDayTime()))) return { key: 'day', covered: 0 }
    var covered = coveredRadiators(machine)
    if (covered !== 0) return { key: 'covered', covered: covered < 0 ? CELLS.length : covered }
    return { key: 'night', covered: 0 }
  }

  // 'gcyr:luna' for a level (KubeJS shows Level#dimension() as getDimension(), the location; iv/uranium_cycle.js)
  function dimensionOf(level) {
    if (level === null || level === undefined) return ''
    try {
      return String(level.getDimension())
    } catch (e) {
      return String(level.getDimensionKey().location())
    }
  }

  // ---------------------------------------------------------------- the carrier in the hatches

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return LC
  }

  // mB of deuterium in the input hatches (ME hatches report what they hold)
  function carrierIn(machine) {
    var c = lazy()
    var total = 0
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.FluidCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (stack === null || stack === undefined || typeof stack.isEmpty !== 'function' || stack.isEmpty()) continue
        if (String(c.Registries.FLUIDS.getKey(stack.getFluid())) === CARRIER.id) total += Number(stack.getAmount())
      }
    }
    return total
  }

  // ---------------------------------------------------------------- recipe modifier, start check and controller lines

  // tritium and the tritiated water are kept: only fluid voiding is refused (lib/no_voiding.js); the facility makes no items
  const KEEP = { which: 'fluids', reason: NO_VOIDING, name: 'tritium removal facility' }

  // after the voiding refusal: half the EU/t when the run starts in the lunar night with the wings open, then GTM's standard overclock
  function nightPricing() {
    var night = null
    var failed = false
    return function (machine, recipe) {
      try {
        var cheap = ModifierFunction.IDENTITY
        var scaled = recipe
        if (skyState(machine).key === 'night') {
          if (night === null) night = ModifierFunction.builder().eutMultiplier(NIGHT_FACTOR).build()
          cheap = night
          scaled = cheap.apply(recipe)
          if (scaled == null) return ModifierFunction.NULL
        }
        return cheap.andThen(GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, scaled))
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'tritium removal facility recipe modifier failed: ' + e)
        }
        return ModifierFunction.IDENTITY
      }
    }
  }

  var displayFailed = false

  // the controller lines: off the Moon, why nothing starts; on the Moon, what the sky gives the next run and the deuterium charge
  function display(controller, list) {
    try {
      if (!controller.isFormed()) return
      if (dimensionOf(controller.getLevel()) !== DIMENSION) {
        list.add(Text.translate(NOT_MOON))
        return
      }
      var state = skyState(controller)
      list.add(Text.translate(SKY_KEY + '.' + state.key, String(state.covered)))
      var held = carrierIn(controller)
      list.add(Text.translate(CARRIER_KEY + (held >= CARRIER.amount ? '.ok' : '.low'), String(held), String(CARRIER.amount)))
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error(LOG + 'tritium removal facility controller display failed: ' + e)
      }
    }
  }

  // One EMI line per recipe: the night price in words. Called on the client while EMI draws a recipe, with the recipe's data tag; an
  // empty string draws nothing.
  function nightInfo(data) {
    try {
      var eut = data.getInt(NIGHT_KEY)
      if (!(eut > 0)) return ''
      return String(Text.translate('gtceu.recipe.' + NIGHT_KEY, String(eut)).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- published for the recipe script, the lang file and the smoke test

  TRF.machine = MACHINE
  TRF.recipeType = 'gtceu:' + TYPE
  TRF.dimension = DIMENSION
  TRF.carrier = CARRIER
  TRF.nightFactor = NIGHT_FACTOR
  TRF.nightKey = NIGHT_KEY
  TRF.noVoiding = NO_VOIDING
  TRF.notMoon = NOT_MOON
  // fluids in: the tritiated heavy water and the deuterium charge; out: heavy water and tritium
  TRF.maxIO = { itemsIn: 0, itemsOut: 0, fluidsIn: 2, fluidsOut: 2 }
  TRF.parts = PARTS
  TRF.blocks = { casing: CASING, pipe: PIPE, brick: BRICK, radiator: RADIATOR }
  TRF.radiatorCells = CELLS
  TRF.night = { from: SUNSET, to: SUNRISE }
  TRF.sunIsDown = sunIsDown
  TRF.skyState = skyState
  TRF.carrierIn = carrierIn
  TRF.dimensionOf = dimensionOf
  TRF.display = display
  TRF.voids = function (machine) { return G.noVoiding.voids(machine, KEEP.which) }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(TRF.maxIO.itemsIn, TRF.maxIO.itemsOut, TRF.maxIO.fluidsIn, TRF.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.COOLING)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(nightInfo)

    Pat.register(MACHINE, SPEC)

    event.create('tritium_removal_facility', 'multiblock')
      .langValue('Tritium Removal Facility')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .recipeType(TYPE)
      .recipeModifier(G.noVoiding.modifier(KEEP, nightPricing()), true)
      .beforeWorking(G.noVoiding.beforeWorking(KEEP))
      // the night price is set when a run starts: refresh it when GTM would restart a cached run (lib/fresh_run.js, IV-B2's finding)
      .afterWorking(G.freshRun.afterWorking('tritium removal facility'))
      .appearanceBlock(GTBlocks.CASING_ALUMINIUM_FROSTPROOF)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .additionalDisplay(display)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.tritium_removal_facility.tooltip.0'),
        Text.translate('grindless.machine.tritium_removal_facility.tooltip.1'),
        Text.translate('grindless.machine.tritium_removal_facility.tooltip.2'),
        Text.translate('grindless.machine.tritium_removal_facility.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/tritium_removal_facility')
  })
})()
