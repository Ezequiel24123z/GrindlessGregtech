// priority: -10980
// -----------------------------------------------------------------------------------------------
// ZPM's stored-waste machines (docs/eras/zpm.md, "Machines 4-5"; package ZPM-A4): the waste retrieval plant, the actinide partitioning
// plant, their two recipe types and the two GT materials of the partitioning line.
//
//   gtceu:waste_retrieval_plant        IV's stored waste (gtnn:radioactive_waste: the hot cell's PUREX glass and the leach field's radium)
//                                      re-dissolved as Hanford's and Sellafield's waste retrieval does. 7 x 5 x 7 on GT--'s
//                                      radiation-proof machine casing: a dissolver wall of PTFE pipe casing (left, back), a hollow 3 x 3 x 3
//                                      cold trap of frostproof casing (right, back) and a hot isostatic press (a tungstensteel frame
//                                      tower) in front, parts on the back and the front floor rows.
//   gtceu:waste_retrieval              its recipe type (EU in). The programmed circuit picks the step (server_scripts/grindless/zpm/actinides.js):
//                                        circuit 1  retrieve   waste + nitric acid -> radium + actinide raffinate + synroc + NO2
//                                        circuit 2  emanate    radium capsule (worn 1 %) + helium (looped) -> radon (+ lead from a worn capsule)
//                                        circuit 3  capsule    radium + platinum foil -> radium capsule
//   gtceu:actinide_partitioning_plant  TRUEX and SANEX: americium and curium out of the raffinate, away from the lanthanides. 7 x 5 x 7
//                                      on the same casing: two mixer-settler banks of PTFE pipe casing and a laminated glass window.
//   gtceu:actinide_partitioning        its recipe type (EU in): circuit 1 strip (raffinate + solvent charge -> minor-actinide strip +
//                                      lanthanide nitrate), circuit 2 split (strip -> americium + curium oxide + synroc).
//
// GT materials registered here (gtceu: ids): minor_actinide_strip and lanthanide_nitrate (liquids with GTM's acid attribute, no
// decomposition: GTM must not electrolyze them).
//
// Containment: both plants refuse to run while their controller voids items or fluids (lib/no_voiding.js, proven on the IV hot cell).
// Parts: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-3 input hatches, 1-3 output hatches (ME parts fit); at least 4 casings
// among the part cells. Textures: the hot cell's overlay dir (grindless:block/multiblock/hot_cell) on GT--'s radiation-proof casing.
// Names / tooltips: client_scripts/grindless/zpm_actinides_lang.js. Published: global.grindless.actinides.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const AC = G.actinides || (G.actinides = {})

  const RETRIEVAL = 'waste_retrieval'
  const PARTITION = 'actinide_partitioning'
  const RETRIEVAL_MACHINE = 'gtceu:waste_retrieval_plant'
  const PARTITION_MACHINE = 'gtceu:actinide_partitioning_plant'

  const SHIELD = 'gtnn:radiation_proof_machine_casing'
  const SHIELD_TEXTURE = 'gtnn:block/casings/solid/radiation_proof_machine_casing'
  const OVERLAY = 'grindless:block/multiblock/hot_cell'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const FROST = 'gtceu:frostproof_machine_casing'
  const GLASS = 'gtceu:laminated_glass'
  const PRESS = 'tungsten_steel'

  const NO_VOIDING_RETRIEVAL = 'grindless.machine.waste_retrieval_plant.no_voiding'
  const NO_VOIDING_PARTITION = 'grindless.machine.actinide_partitioning_plant.no_voiding'

  AC.machines = { retrieval: RETRIEVAL_MACHINE, partition: PARTITION_MACHINE }
  AC.recipeTypes = { retrieval: 'gtceu:' + RETRIEVAL, partition: 'gtceu:' + PARTITION }
  AC.materials = { strip: 'minor_actinide_strip', lanthanides: 'lanthanide_nitrate' }
  AC.ids = { strip: 'gtceu:minor_actinide_strip', lanthanides: 'gtceu:lanthanide_nitrate' }
  // retrieval: items in 3 (waste / capsule / radium + foil, with the circuit), out 2; fluids in 2 (acid, helium), out 2
  // partition: items in 1 (the circuit), out 3; fluids in 2 (raffinate and solvent), out 2
  AC.maxIO = {
    retrieval: { itemsIn: 3, itemsOut: 2, fluidsIn: 2, fluidsOut: 2 },
    partition: { itemsIn: 1, itemsOut: 3, fluidsIn: 2, fluidsOut: 2 }
  }
  AC.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 3 },
    output_hatch: { min: 1, max: 3 },
    minCasings: 4
  }
  AC.noVoiding = { retrieval: NO_VOIDING_RETRIEVAL, partition: NO_VOIDING_PARTITION }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells() {
    return Pat.oneOf(
      Pat.block(SHIELD, { min: AC.parts.minCasings }),
      Pat.part('energy_input', AC.parts.energy_input),
      Pat.part('input_bus', AC.parts.input_bus),
      Pat.part('output_bus', AC.parts.output_bus),
      Pat.part('input_hatch', AC.parts.input_hatch),
      Pat.part('output_hatch', AC.parts.output_hatch)
    )
  }

  // QR-S2: both plants are built cell by cell (x left -> right 0..6, y bottom -> top 0..4, z back -> front 0..6). Row 0 and the front/back
  // floor stay the parts' casing (X); frame posts (M) stand at the corners, laminated glass (L) in the walls and the roof.
  function grid(fn) {
    var slices = []
    for (var z = 0; z < 7; z++) {
      var rows = []
      for (var y = 0; y < 5; y++) {
        var row = ''
        for (var x = 0; x < 7; x++) row += (z === 6 && y === 1 && x === 3) ? 'S' : fn(x, y, z)
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // the hot cell hall: corner posts and a roof gantry of tungstensteel frame, glass slits, the dissolver wall of PTFE pipe and the
  // cold trap of frostproof casing on the back wall, the press (frame tower) and the cold trap's hollow cube inside
  function retrievalCell(x, y, z) {
    var edge = x === 0 || x === 6 || z === 0 || z === 6
    var corner = (x === 0 || x === 6) && (z === 0 || z === 6)
    if (y === 0) return 'X'
    if (y === 4) {
      if (corner || x === 3) return 'M'
      if ((x === 2 || x === 4) && z >= 2 && z <= 4) return 'L'
      return 'R'
    }
    if (edge) {
      if (corner) return 'M'
      if (z === 0) return x <= 2 ? 'P' : (x >= 4 ? 'F' : 'R')
      if (z === 6) return y === 3 ? 'L' : 'R'
      return y >= 2 && z >= 2 && z <= 4 ? 'L' : 'R'
    }
    // interior (x, z 1..5; y 1..3)
    if (z <= 3 && x === 1) return 'P'
    if (z <= 3 && x >= 3 && !(z === 2 && y === 2 && x === 4)) return 'F'
    if (z === 4 && x <= 2 && y <= 2) return 'M'
    return '#'
  }

  // the mixer-settler hall: frame trusses over every second slice, glass skylights between them, posts and glass bays in the side walls
  function partitionCell(x, y, z) {
    var edge = x === 0 || x === 6 || z === 0 || z === 6
    var corner = (x === 0 || x === 6) && (z === 0 || z === 6)
    if (y === 0) return 'X'
    if (y === 4) {
      if (z % 2 === 0) return 'M'
      return x === 0 || x === 6 ? 'R' : 'L'
    }
    if (edge) {
      if (corner) return 'M'
      if (x === 0 || x === 6) return z % 2 === 0 ? 'M' : (y >= 2 ? 'L' : 'R')
      if (z === 0) return y === 2 ? 'G' : 'R'
      return y === 2 ? 'L' : 'R'
    }
    // the two banks of mixer-settlers (PTFE pipe casing), a walkway between them
    if (z >= 1 && z <= 4 && y <= 2 && x !== 3) return 'P'
    return '#'
  }

  const RETRIEVAL_SPEC = {
    slices: grid(retrievalCell),
    symbols: {
      S: Pat.controller(),
      X: cells(),
      R: Pat.block(SHIELD),
      P: Pat.block(PIPE),
      F: Pat.block(FROST),
      L: Pat.block(GLASS),
      M: Pat.frame([PRESS]),
      '#': Pat.air()
    }
  }

  const PARTITION_SPEC = {
    slices: grid(partitionCell),
    symbols: {
      S: Pat.controller(),
      X: cells(),
      R: Pat.block(SHIELD),
      P: Pat.block(PIPE),
      L: Pat.block(GLASS),
      M: Pat.frame([PRESS]),
      G: Pat.block(FROST),
      '#': Pat.air()
    }
  }
  AC.specs = { retrieval: RETRIEVAL_SPEC, partition: PARTITION_SPEC }

  // ---------------------------------------------------------------- GT materials

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(AC.materials.strip)
      .liquid(new GTFluidBuilder().attribute(GTFluidAttributes.ACID))
      .color(0xD7B45C)
      .formula('Am(NO3)3(Cm(NO3)3)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(AC.materials.lanthanides)
      .liquid(new GTFluidBuilder().attribute(GTFluidAttributes.ACID))
      .color(0xB9C98A)
      .formula('Ln(NO3)3')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })

  // GTM registers radium with no form at all: it gets a dust (materialModification runs before the items are generated)
  GTCEuStartupEvents.materialModification(function (event) {
    try {
      GTMaterials.Radium.getProperties().ensureSet(PropertyKey.DUST)
    } catch (e) {
      console.error('[grindless/zpm] radium: dust not added: ' + e)
    }
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var r = AC.maxIO.retrieval
    event.create(RETRIEVAL)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(r.itemsIn, r.itemsOut, r.fluidsIn, r.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
    var p = AC.maxIO.partition
    event.create(PARTITION)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(p.itemsIn, p.itemsOut, p.fluidsIn, p.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_MIXER, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machines

  function modifier(opts) {
    return G.noVoiding.modifier(opts, G.parallelHatch.modifier(G.parallelHatch.overclock))
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var keepRetrieval = { which: 'both', reason: NO_VOIDING_RETRIEVAL, name: 'waste retrieval plant' }
    var keepPartition = { which: 'both', reason: NO_VOIDING_PARTITION, name: 'actinide partitioning plant' }

    Pat.register(RETRIEVAL_MACHINE, RETRIEVAL_SPEC)
    Pat.register(PARTITION_MACHINE, PARTITION_SPEC)

    event.create('waste_retrieval_plant', 'multiblock')
      .langValue('Waste Retrieval Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(RETRIEVAL)
      .recipeModifier(modifier(keepRetrieval), true)
      .beforeWorking(G.noVoiding.beforeWorking(keepRetrieval))
      .appearanceBlock(function () { return Block.getBlock(SHIELD) })
      .pattern(function (def) { return Pat.build(def, RETRIEVAL_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.waste_retrieval_plant.tooltip.0'),
        Text.translate('grindless.machine.waste_retrieval_plant.tooltip.1'),
        Text.translate('grindless.machine.waste_retrieval_plant.tooltip.2'),
        Text.translate('grindless.machine.waste_retrieval_plant.tooltip.3')
      ])
      .workableCasingModel(SHIELD_TEXTURE, OVERLAY)

    event.create('actinide_partitioning_plant', 'multiblock')
      .langValue('Actinide Partitioning Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(PARTITION)
      .recipeModifier(modifier(keepPartition), true)
      .beforeWorking(G.noVoiding.beforeWorking(keepPartition))
      .appearanceBlock(function () { return Block.getBlock(SHIELD) })
      .pattern(function (def) { return Pat.build(def, PARTITION_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.actinide_partitioning_plant.tooltip.0'),
        Text.translate('grindless.machine.actinide_partitioning_plant.tooltip.1'),
        Text.translate('grindless.machine.actinide_partitioning_plant.tooltip.2'),
        Text.translate('grindless.machine.actinide_partitioning_plant.tooltip.3')
      ])
      .workableCasingModel(SHIELD_TEXTURE, OVERLAY)
  })
})()
