// priority: -11000
// -----------------------------------------------------------------------------------------------
// ZPM's europium reductor (docs/eras/zpm.md, "Machine 3"; package ZPM-A3): the multiblock, its recipe type and the GT materials of its line.
//
//   gtceu:europium_reductor   europium is the rare earth that goes divalent: the Eu3+ of the cascade's liquor is reduced to Eu2+ over
//                             zinc under a mercury (amalgam) bath in a Jones column, the sulfate is precipitated and fired, and the oxide
//                             is reduced to the metal by lanthanum in a vacuum furnace. 9 x 3 x 7 on an inert casing: the Jones column
//                             (9 x 3 x 3 of inert casing, hollow) at the back, then a precipitation tank of PTFE pipe casing and
//                             laminated glass (left) and a vacuum furnace of naquadah coil blocks (right), 3 free columns between.
//   gtceu:valence_reduction   its recipe type (EU in). The programmed circuit picks the step (server_scripts/grindless/zpm/europium.js):
//                               circuit 1  reduction      europium chloride solution + zinc + sulfuric acid (+ the mercury bath, never used up)
//                                                         -> europium sulfate + zinc sulfate + hydrochloric acid + depleted liquor
//                               circuit 2  roasting       europium sulfate + oxygen -> europium oxide + sulfur trioxide
//                               circuit 3  metallothermic europium oxide + lanthanum -> europium + lanthanum oxide
//
// GT materials registered here (gtceu: ids): europium_chloride_solution (liquid, acid), europium_sulfate and europium_oxide (dusts, no
// decomposition: GTM must not electrolyze them into europium, only the reductor makes europium), zinc_sulfate and lanthanum_oxide (dusts,
// GTM's electrolyzer splits them).
//
// Parts: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-3 input hatches, 1-3 output hatches (ME parts fit); at least 5 inert
// casings among the part cells. Textures: grindless:block/multiblock/europium_reductor (tools/assets/Build-ZPMEuropiumTextures.ps1).
// Names / tooltips: client_scripts/grindless/zpm_europium_lang.js. Published: global.grindless.europiumReductor.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const ER = G.europiumReductor || (G.europiumReductor = {})
  const LOG = '[grindless/zpm] '

  const MACHINE = 'gtceu:europium_reductor'
  const TYPE = 'valence_reduction'

  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const GLASS = 'gtceu:laminated_glass'
  const COIL = 'gtceu:naquadah_coil_block'

  ER.machine = MACHINE
  ER.recipeType = 'gtceu:' + TYPE
  ER.materials = {
    liquor: 'europium_chloride_solution',
    sulfate: 'europium_sulfate',
    oxide: 'europium_oxide',
    zincSulfate: 'zinc_sulfate',
    lanthanumOxide: 'lanthanum_oxide'
  }
  ER.ids = {
    liquor: 'gtceu:europium_chloride_solution',
    sulfate: 'gtceu:europium_sulfate_dust',
    oxide: 'gtceu:europium_oxide_dust',
    zincSulfate: 'gtceu:zinc_sulfate_dust',
    lanthanumOxide: 'gtceu:lanthanum_oxide_dust'
  }
  // items in: up to two kinds and the programmed circuit; out: two; fluids in: liquor, acid and the mercury bath; out: two
  ER.maxIO = { itemsIn: 3, itemsOut: 2, fluidsIn: 3, fluidsOut: 2 }
  ER.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 3 },
    output_hatch: { min: 1, max: 3 },
    minCasings: 5
  }

  // ---------------------------------------------------------------- pattern
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front
  const COLUMN_BACK = ['XXXXXXXXX', 'IIIIIIIII', 'IIIIIIIII']
  const COLUMN_MID = ['IIIIIIIII', 'I#######I', 'IIIIIIIII']
  const MODULE_WALL = ['PPP   CCC', 'LLL   CCC', 'PPP   CCC']
  const MODULE_MID = ['PPP   CCC', 'L#L   C#C', 'PPP   CCC']
  const FRONT = ['XXXXSXXXX', '         ', '         ']
  const SPEC = {
    slices: [COLUMN_BACK, COLUMN_MID, COLUMN_BACK, MODULE_WALL, MODULE_MID, MODULE_WALL, FRONT],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(INERT, { min: ER.parts.minCasings }),
        Pat.part('energy_input', ER.parts.energy_input),
        Pat.part('input_bus', ER.parts.input_bus),
        Pat.part('output_bus', ER.parts.output_bus),
        Pat.part('input_hatch', ER.parts.input_hatch),
        Pat.part('output_hatch', ER.parts.output_hatch)
      ),
      I: Pat.block(INERT),
      P: Pat.block(PIPE),
      L: Pat.block(GLASS),
      C: Pat.block(COIL),
      '#': Pat.air()
    }
  }
  ER.spec = SPEC

  // ---------------------------------------------------------------- GT materials

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(ER.materials.liquor)
      .liquid(new GTFluidBuilder().attribute(GTFluidAttributes.ACID))
      .color(0xC9A0D8)
      .formula('EuCl3(H2O)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(ER.materials.sulfate)
      .dust()
      .color(0xF0E6F6).secondaryColor(0xB79BC6)
      .iconSet(GTMaterialIconSet.FINE)
      .formula('EuSO4')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(ER.materials.oxide)
      .dust()
      .color(0xF2D9E6).secondaryColor(0xBF8FA8)
      .iconSet(GTMaterialIconSet.FINE)
      .formula('Eu2O3')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(ER.materials.zincSulfate)
      .dust()
      .color(0xEDEDF2).secondaryColor(0xA8A8B4)
      .iconSet(GTMaterialIconSet.FINE)
      .components('1x zinc', '1x sulfur', '4x oxygen')

    event.create(ER.materials.lanthanumOxide)
      .dust()
      .color(0xE6E2D6).secondaryColor(0xA39E8C)
      .iconSet(GTMaterialIconSet.FINE)
      .components('2x lanthanum', '3x oxygen')
  })

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(ER.maxIO.itemsIn, ER.maxIO.itemsOut, ER.maxIO.fluidsIn, ER.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_MIXER, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('europium_reductor', 'multiblock')
      .langValue('Europium Reductor')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.europium_reductor.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.valence_reduction'))
      ])
      .workableCasingModel(INERT_TEXTURE, 'grindless:block/multiblock/europium_reductor')
  })
})()
