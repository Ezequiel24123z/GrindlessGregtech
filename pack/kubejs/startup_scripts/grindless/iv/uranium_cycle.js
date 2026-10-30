// priority: -3400
// -----------------------------------------------------------------------------------------------
// IV's uranium cycle (docs/eras/iv.md, "Uranium in-situ leach field" and "Fuel fabrication plant"; package IV-A4): two of our
// multiblocks and their recipe types. Recipes, from data/grindless/tables/uranium_cycle.json: server_scripts/grindless/iv/
// uranium_cycle.js.
//
//   gtceu:isr_wellfield            the In-Situ Leach Field, the End's uranium source (iv.md, decision 2 of the raise): a 7x7 five-spot
//                                  of wells and a header house. Runs gtceu:in_situ_leaching.
//   gtceu:in_situ_leaching         one recipe per vein of veins_leach.json: the vein sample (never used up) + sulfuric acid + oxygen,
//                                  with the ion-exchange resin as a chanced input (its wear) -> uraninite dust, and the radium of the
//                                  eluate as GT--'s radioactive waste (a chanced output). Every recipe carries .dimension(the End).
//   gtceu:fuel_fabrication_plant   the Fuel Fabrication Plant (decision 7: fresh LEU leaves the hot cell): a 3x4x13 line. Runs
//                                  gtceu:fuel_fabrication.
//   gtceu:fuel_fabrication         three steps, the programmed circuit picks one: 1 UO2 pellets pressed and sintered in hydrogen (the
//                                  hydrogen is needed in a hatch and never used up), 2 Zircaloy cladding tubes on the pilger mill,
//                                  3 the LEU fuel assembly, backfilled with helium in the glovebox.
//
// What they gain (rule 4): the leach field is uranium with no drill bit and no crushing, a route nothing else has (the family veto
// keeps the Tungstensteel bit away from the home drills, and no drill takes the pitchblende vein); the plant does several steps in
// one and makes the reactor's LEU fuel, which nothing else makes. Energy: every recipe costs the sum of GTM's stages it stands for,
// spent at the IV voltage (the table says which stages).
//
// The leach field keeps its waste: the radioactive waste is contained, so it refuses to run while the controller voids items
// (grindless.machine.isr_wellfield.no_voiding), through lib/no_voiding.js: the mechanism of grindless.steam_outputs.no_voiding in its
// recipe modifier, then GTM's own overclock (the default of an electric multiblock); and the same refusal in beforeWorking, because
// GTM 7.5.3 restarts an idle machine's cached last recipe without its modifier. Outside the End it forms but its recipes do not
// start (GTM's dimension condition), and the controller says why (grindless.machine.isr_wellfield.not_end). The plant is a plain
// electric multiblock with GTM's overclock, after a parallel hatch's copies when one sits in its floor (IV-B6).
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right as seen from the front):
//   leach field, 7 wide x 8 high x 10 deep. Slices 0-6 are the five-spot: injection wells at the four corners (slices 0 and 6, columns
//     0 and 6) and the production well in the middle (slice 3, column 3). Each well is a column of tungstensteel pipe casing three
//     blocks into the ground (rows 0-2), a PTFE pipe casing wellhead on the ground (row 3) and a tungstensteel frame valve tree on it
//     (row 4); everything else in the field is free (the ground, end stone, anything). Slices 7-9 are the header house on the ground
//     (rows 3-6, columns 1-5) of chemically inert casing: floor and roof casing; the walls (rows 4-5, symbol X, 23 cells) take the
//     parts (1-2 input buses, 1-2 output buses, 1-3 fluid input hatches, 1-2 energy hatches), the rest casing; inside, two
//     ion-exchange columns of PTFE pipe casing stand up through the roof (rows 4-7) with air between them. The controller is in the
//     middle of the front wall, row 4.
//   fuel plant, 3 wide x 4 high x 13 deep, along the line from the back: the pellet press bay (slices 0-2, the press's tungstensteel
//     gearbox over the die), the sintering tunnel (slices 3-6: a bore two high, two rings of six coils, Kanthal or better, for the
//     2,000 K sinter), the pilger stand (slices 7-9: two tungstensteel gearboxes, the rolls, on a bed of tungsten steel frames) and the
//     rod-loading glovebox of laminated glass (slices 10-11) behind the front face (slice 12, controller in the middle of row 1). Clean
//     stainless steel casing; the floor of the press bay and of the glovebox (symbol X, 18 cells) takes the parts: 1-3 input buses,
//     1-2 output buses, 1-4 fluid input hatches, 1-2 energy hatches and at most one parallel hatch (IV-B6, lib/parallel_hatch.js: its
//     copies run before GTM's overclock). ME buses and hatches have the same abilities, so they fit.
//
// Textures: overlay dirs grindless:block/multiblock/isr_wellfield and .../fuel_fabrication_plant (tools/assets/
// Build-UraniumCycleTextures.ps1), on GTM's inert PTFE casing and clean stainless steel casing. Names / tooltips:
// client_scripts/grindless/iv_uranium_cycle_lang.js. Published for the recipe script and the smoke test: global.grindless.uraniumCycle.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const UC = G.uraniumCycle || (G.uraniumCycle = {})
  const LOG = '[grindless/iv] '

  const FIELD = 'gtceu:isr_wellfield'
  const FIELD_TYPE = 'in_situ_leaching'
  const PLANT = 'gtceu:fuel_fabrication_plant'
  const PLANT_TYPE = 'fuel_fabrication'
  const END = 'minecraft:the_end'

  const WELL = 'gtceu:tungstensteel_pipe_casing'
  const ACID_PIPE = 'gtceu:ptfe_pipe_casing'
  const TREE = 'tungsten_steel'
  const HOUSE = 'gtceu:inert_machine_casing'
  const HOUSE_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'

  const LINE = 'gtceu:clean_machine_casing'
  const LINE_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const BED = 'tungsten_steel'
  const GLASS = 'gtceu:laminated_glass'
  // the sinter runs at 2,000 K: Kanthal (2,700 K) and every hotter GTM coil; cupronickel (1,800 K) is too cold
  const COILS = [
    'gtceu:kanthal_coil_block',
    'gtceu:nichrome_coil_block',
    'gtceu:rtm_alloy_coil_block',
    'gtceu:hssg_coil_block',
    'gtceu:naquadah_coil_block',
    'gtceu:trinium_coil_block',
    'gtceu:tritanium_coil_block'
  ]

  const NO_VOIDING = 'grindless.machine.isr_wellfield.no_voiding'
  const NOT_END = 'grindless.machine.isr_wellfield.not_end'

  // ---------------------------------------------------------------- patterns

  const EMPTY = ['       ', '       ', '       ', '       ', '       ', '       ', '       ', '       ']
  // a slice of the field with injection wells at both edges (the corners of the five-spot)
  const EDGE_WELLS = ['P     P', 'P     P', 'P     P', 'Q     Q', 'F     F', '       ', '       ', '       ']

  const FIELD_PARTS = { input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 3 }, energy_input: { min: 1, max: 2 } }

  const FIELD_SPEC = {
    slices: [
      // the back injection wells
      EDGE_WELLS,
      EMPTY,
      EMPTY,
      // the production well in the middle of the five-spot
      ['   P   ', '   P   ', '   P   ', '   Q   ', '   F   ', '       ', '       ', '       '],
      EMPTY,
      EMPTY,
      // the front injection wells
      EDGE_WELLS,
      // the header house: its back wall, towards the field
      ['       ', '       ', '       ', ' CCCCC ', ' XXXXX ', ' XXXXX ', ' CCCCC ', '       '],
      // the two ion-exchange columns, up through the roof
      ['       ', '       ', '       ', ' CCCCC ', ' XQ#QX ', ' XQ#QX ', ' CQCQC ', '  Q Q  '],
      // the front wall, with the controller
      ['       ', '       ', '       ', ' CCCCC ', ' XXSXX ', ' XXXXX ', ' CCCCC ', '       ']
    ],
    symbols: {
      S: Pat.controller(),
      // 23 wall cells: 4 to 9 are parts, the rest inert casing
      X: Pat.oneOf(
        Pat.block(HOUSE, { min: 12 }),
        Pat.part('input_bus', FIELD_PARTS.input_bus),
        Pat.part('output_bus', FIELD_PARTS.output_bus),
        Pat.part('input_hatch', FIELD_PARTS.input_hatch),
        Pat.part('energy_input', FIELD_PARTS.energy_input)
      ),
      C: Pat.block(HOUSE),
      P: Pat.block(WELL),
      Q: Pat.block(ACID_PIPE),
      F: Pat.frame([TREE]),
      '#': Pat.air()
    }
  }

  const PLANT_PARTS = { input_bus: { min: 1, max: 3 }, output_bus: { min: 1, max: 2 }, input_hatch: { min: 1, max: 4 }, energy_input: { min: 1, max: 2 } }

  const PLANT_SPEC = {
    slices: [
      // the pellet press bay: its back wall
      ['XXX', 'CCC', 'CCC', 'FCF'],
      // the press: its gearbox drive over the die
      ['XXX', 'C#C', 'CGC', 'FCF'],
      ['XXX', 'C#C', 'C#C', 'FCF'],
      // the sintering tunnel: its mouth, two rings of coils around the bore, its exit
      ['CCC', 'C#C', 'C#C', 'CCC'],
      ['CKC', 'K#K', 'K#K', 'CKC'],
      ['CKC', 'K#K', 'K#K', 'CKC'],
      ['CCC', 'C#C', 'C#C', 'CCC'],
      // the pilger stand: the two roll gearboxes beside the tube's path, on a bed of tungsten steel frames
      ['FFF', 'C#C', 'CCC', 'CCC'],
      ['FFF', 'G#G', 'CCC', 'CCC'],
      ['FFF', 'C#C', 'CCC', 'CCC'],
      // the rod-loading glovebox of laminated glass
      ['XXX', 'L#L', 'L#L', 'LLL'],
      ['XXX', 'L#L', 'L#L', 'LLL'],
      // the front face
      ['XXX', 'CSC', 'CCC', 'CCC']
    ],
    symbols: {
      S: Pat.controller(),
      // 18 floor cells: 4 to 11 are parts, the rest clean stainless steel casing; one of them may be a parallel hatch (IV-B6)
      X: Pat.oneOf(
        Pat.block(LINE, { min: 6 }),
        Pat.part('input_bus', PLANT_PARTS.input_bus),
        Pat.part('output_bus', PLANT_PARTS.output_bus),
        Pat.part('input_hatch', PLANT_PARTS.input_hatch),
        Pat.part('energy_input', PLANT_PARTS.energy_input),
        G.parallelHatch.part()
      ),
      C: Pat.block(LINE),
      G: Pat.block(GEARBOX),
      K: Pat.block(COILS),
      F: Pat.frame([BED]),
      L: Pat.block(GLASS),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- helpers

  // the radioactive waste is an item: only item voiding is refused (lib/no_voiding.js)
  const KEEP = { which: 'items', reason: NO_VOIDING, name: 'leach field' }

  // true while the controller is set to void items (GTM's IVoidable): the radioactive waste would be thrown away
  function voidsItems(machine) {
    return G.noVoiding.voids(machine, KEEP.which)
  }

  // 'minecraft:the_end' for a level (KubeJS shows Level#dimension() as getDimension(), the location; ev/tripod.js)
  function dimensionOf(level) {
    if (level === null || level === undefined) return ''
    try {
      return String(level.getDimension())
    } catch (e) {
      return String(level.getDimensionKey().location())
    }
  }

  // ---------------------------------------------------------------- the leach field's modifier, start check and line

  // GTM's own overclock, after the voiding refusal of lib/no_voiding.js
  function overclock() {
    var failed = false
    return function (machine, recipe) {
      try {
        return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'leach field recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  var displayFailed = false

  // one controller line outside the End: why nothing starts (GTM's dimension condition says nothing by itself)
  function fieldDisplay(controller, list) {
    try {
      if (!controller.isFormed()) return
      if (dimensionOf(controller.getLevel()) !== END) list.add(Text.translate(NOT_END))
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error(LOG + 'leach field controller display failed: ' + e)
      }
    }
  }

  // ---------------------------------------------------------------- published for the recipe script, the lang file and the smoke test

  UC.table = 'kubejs/data/grindless/tables/uranium_cycle.json'
  UC.field = {
    machine: FIELD,
    recipeType: 'gtceu:' + FIELD_TYPE,
    dimension: END,
    maxIO: { itemsIn: 2, itemsOut: 2, fluidsIn: 2, fluidsOut: 0 },
    parts: FIELD_PARTS,
    noVoiding: NO_VOIDING,
    notEnd: NOT_END,
    voids: voidsItems,
    display: fieldDisplay,
    dimensionOf: dimensionOf
  }
  UC.plant = {
    machine: PLANT,
    recipeType: 'gtceu:' + PLANT_TYPE,
    // items in: up to two ingredients and the programmed circuit; fluids in: the oxygen and the hydrogen of the sinter
    maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 2, fluidsOut: 1 },
    parts: PLANT_PARTS,
    coils: COILS
  }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // items in: the vein sample and the resin; out: uraninite and the waste. Fluids in: the acid and the oxygen
    event.create(FIELD_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(UC.field.maxIO.itemsIn, UC.field.maxIO.itemsOut, UC.field.maxIO.fluidsIn, UC.field.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_BATH, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.BATH)

    event.create(PLANT_TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(UC.plant.maxIO.itemsIn, UC.plant.maxIO.itemsOut, UC.plant.maxIO.fluidsIn, UC.plant.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_COMPRESS, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ASSEMBLER)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(FIELD, FIELD_SPEC)
    Pat.register(PLANT, PLANT_SPEC)

    event.create('isr_wellfield', 'multiblock')
      .langValue('In-Situ Leach Field')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .recipeType(FIELD_TYPE)
      .recipeModifier(G.noVoiding.modifier(KEEP, overclock()), true)
      .beforeWorking(G.noVoiding.beforeWorking(KEEP))
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, FIELD_SPEC) })
      .additionalDisplay(fieldDisplay)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.isr_wellfield.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.in_situ_leaching'))
      ])
      .workableCasingModel(HOUSE_TEXTURE, 'grindless:block/multiblock/isr_wellfield')

    event.create('fuel_fabrication_plant', 'multiblock')
      .langValue('Fuel Fabrication Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .allowExtendedFacing(false)
      .recipeType(PLANT_TYPE)
      // a parallel hatch's copies, then GTM's default overclock (IV-B6; without a hatch, the overclock alone, as before)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(GTBlocks.CASING_STAINLESS_CLEAN)
      .pattern(function (def) { return Pat.build(def, PLANT_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.fuel_fabrication_plant.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.fuel_fabrication')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(LINE_TEXTURE, 'grindless:block/multiblock/fuel_fabrication_plant')
  })

  console.info(LOG + 'uranium cycle: ' + FIELD + ' (' + FIELD_TYPE + ', the End) and ' + PLANT + ' (' + PLANT_TYPE + ')')
})()
