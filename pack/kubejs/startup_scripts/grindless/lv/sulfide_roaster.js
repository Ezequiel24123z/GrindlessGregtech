// priority: -5200
// -----------------------------------------------------------------------------------------------
// LV "more reinforced" (docs/journey.md, docs/eras/lv.md): the Sulfide Roaster with its contact acid plant.
//
//   gtceu:sulfide_roaster       a heat-proof roaster on steel legs (a glowing steel firebox grate under a fluidised bed) with a
//                               steel contact tower on its roof. 5 wide, 7 high, 3 deep; controller on the front face.
//   gtceu:sulfide_roasting      its recipe type (recipes: server_scripts/grindless/lv/sulfide_roaster.js)
//   grindless:contact_catalyst  the vanadium contact catalyst of the converter: in the input bus, worn by chance like the drill bits
//
// What it wins over GTM 7.5.3: GTM roasts sphalerite, pyrite, galena, stibnite and tetrahedrite in the electric blast furnace
// (120 EU/t, 1 200 K, 3 000 mB of separated oxygen per dust) and turns the sulfur dioxide into sulfuric acid in two more chemical
// reactor steps (SO2 + O2 -> SO3, SO3 + water -> acid). Here the same roast runs on AIR (no air separation in centrifuges), the
// SO2 never leaves the machine (it is converted on the catalyst and absorbed in water), and the waste-heat boiler hands steam back
// to the turbines. Same energy and same solid outputs as the EBF roast; fewer steps, no oxygen, heat back, silver at LV.
//
// Energy: exactly 2 energy hatches. Two LV hatches make the multiblock count as one tier up (GTM's getMaxVoltage), and the roasts
// are written as 4 A of LV (30 V x 4 A = 120 EU/t, GTM's own 120 EU/t), so the viewers show an LV recipe. GTM's default overclock
// applies (more voltage = faster, as in any GT machine).
//
// Pattern (lib/patterns.js: slices back -> front, rows bottom -> top):
//   F steel frame (legs)   B steel firebox casing (the grate: GTM lights it while the machine works)   X heat-proof casing or a part
//   # air (the bed, and the converter chamber)   P steel pipe casing (offtake and riser)   T solid steel casing (contact tower)
//
// Textures: overlay dir grindless:block/multiblock/sulfide_roaster and item/contact_catalyst (tools/assets/Build-LVRoasterHeliostatTextures.ps1).
// Names / tooltips: client_scripts/grindless/lv_content_lang.js.
(function () {
  const Pat = global.grindless.patterns

  const MACHINE = 'gtceu:sulfide_roaster'
  const HEAT_CASING = 'gtceu:heatproof_machine_casing'
  const HEAT_CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'
  const STEEL_CASING = 'gtceu:solid_machine_casing'
  const FIREBOX = 'gtceu:steel_firebox_casing'
  const PIPE = 'gtceu:steel_pipe_casing'

  const SPEC = {
    slices: [
      // back: two legs, the grate, the roaster's back wall and the contact tower
      ['F   F', 'XBBBX', 'XXXXX', 'XXXXX', ' TTT ', ' TTT ', ' TTT '],
      // middle: the fluidised bed (air) over the grate, the gas offtake in the roof, the riser and the converter chamber
      ['     ', 'XBBBX', 'X###X', 'XXPXX', ' TPT ', ' T#T ', ' TTT '],
      // front: two legs, the grate, the controller and the tower
      ['F   F', 'XBBBX', 'XXSXX', 'XXXXX', ' TTT ', ' TTT ', ' TTT ']
    ],
    symbols: {
      S: Pat.controller(),
      // 31 shell cells: 8 to 11 are parts (2 energy, the input bus for the dust and the catalyst, 2-3 input hatches for air and
      // water (3 for the HV hydrogen sulfide burner), 1-2 output buses, 2-3 output hatches for the acid and the steam (3 for the
      // hydrogen of that burner)), the rest heat-proof casing
      X: Pat.oneOf(
        Pat.block(HEAT_CASING, { min: 18 }),
        Pat.part('energy_input', { exact: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('input_hatch', { min: 2, max: 3 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 2, max: 3 })
      ),
      B: Pat.block(FIREBOX),
      T: Pat.block(STEEL_CASING),
      P: Pat.block(PIPE),
      F: Pat.frame(['steel']),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- catalyst

  StartupEvents.registry('item', function (event) {
    event.create('grindless:contact_catalyst')
      .texture('grindless:item/contact_catalyst')
      .maxStackSize(64)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.contact_catalyst')))
  })

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // items in: the dust and the catalyst; items out: the oxide and its by-product (silver, ash...);
    // fluids in: air and water (and the hydrogen sulfide of the HV burner: 3); fluids out: sulfuric acid and steam (and the
    // hydrogen of the HV burner: 3)
    event.create('sulfide_roasting')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 2, 3, 3)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('sulfide_roaster', 'multiblock')
      .langValue('Sulfide Roaster')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('sulfide_roasting')
      .appearanceBlock(GTBlocks.CASING_INVAR_HEATPROOF)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .allowExtendedFacing(false)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.sulfide_roaster.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.sulfide_roasting')),
        Text.translate('grindless.machine.sulfide_roaster.tooltip.1')
      ])
      .workableCasingModel(HEAT_CASING_TEXTURE, 'grindless:block/multiblock/sulfide_roaster')
  })
})()
