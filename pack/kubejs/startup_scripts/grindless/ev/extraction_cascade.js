// -----------------------------------------------------------------------------------------------
// The Rare Earth Extraction Cascade, an EV multiblock of ours (docs/eras/ev.md, "Rare-earth extraction cascade"), the recipe type it runs
// and the GT materials of its line.
//
//   gtceu:extraction_cascade     3x3x7 line of mixer-settler stages (3 wide, 3 high, 7 deep) in inert PTFE casing with tempered glass
//                                sides, runs the new gtceu:solvent_extraction
//
// What it wins: A SEPARATION GTM DOES NOT DO. The rare earths of Mars sit in merrillite (A1's gtceu:merrillite, with no decomposition),
// and only this machine takes them out and splits them. Real separation plants work like this: an acid leach, then a long cascade of
// mixer-settlers where an organic solvent (an extractant in kerosene) pulls the heavier rare earths out of the chloride solution stage by
// stage, and an acid strip gives them back, one element after another. The programmed circuit picks the mode:
//   1  leach       4 merrillite dust + hydrochloric acid -> rare earth chloride solution + phosphoric acid + tricalcium phosphate
//   2  extraction  rare earth chloride solution + hydrochloric acid (the strip) + kerosene -> samarium chloride + neodymium chloride +
//                  mixed rare earth chloride, with 95 % of the kerosene back and the strip acid out as diluted hydrochloric acid
// GTM's electrolyzer then turns each chloride into its metal and chlorine (GTM's own decomposition recipes of the materials below).
// The figures, the balance and the destinations are in server_scripts/grindless/ev/extraction_cascade.js.
//
// GT materials registered here (gtceu: ids, like every GTM material):
//   rare_earth_chloride_solution   LIQUID with GTM's acid attribute (the leach liquor is acidic: acid-proof pipes and tanks). No
//                                  components and DISABLE_DECOMPOSITION: only the cascade splits it.
//   samarium_chloride              dust, SmCl3 (Sm 1, Cl 3). GTM gives it an electrolyzer decomposition: 4 dust -> 1 samarium + 3 000 mB
//                                  of chlorine. Samarium only comes from Mars (EV removes it from rare_earth_separation).
//   neodymium_chloride             dust, NdCl3 (Nd 1, Cl 3), the same way: 4 dust -> 1 neodymium + 3 000 mB of chlorine.
//   mixed_rare_earth_chloride      dust, the rest of the rare earths as chlorides (lanthanum, cerium, praseodymium, yttrium and the
//                                  heavies), components rare_earth 1, Cl 3: electrolysis gives GTM's own rare earth dust, which GTM's
//                                  centrifuge separates (rare_earth_separation). Formula shown as (La,Ce,Pr,Y)Cl3.
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's. One recipe type with
// two circuits, not two machine modes, so no recipe of an inactive mode can be cached (the trap A4 found does not apply).
//
// Geometry (slices back -> front, rows bottom -> top, columns left -> right as seen from the front; the controller is in the front slice,
// middle column, row 1):
//   row 0   floor: the 16 cells of its edge are `X` (inert casing or a part); under the stages the middle column is inert casing
//   row 1   the stage line: mixer (titanium gearbox, the agitator), settler (an empty tank), mixer, settler, mixer, between tempered
//           glass sides; inert casing at both ends, the controller in the middle of the front
//   row 2   inert casing roof with a PTFE pipe header along the stages
// The 16 `X` cells hold 1-2 EV energy hatches, 1 input bus (merrillite and the circuit), 1 output bus (the chloride and phosphate
// dusts), 1-3 input hatches and 1-4 output hatches (one per fluid: the line uses three fluids in and four out across its two modes, and a
// hatch holds one fluid; a quadruple hatch holds four). At least 5 cells are inert casing. ME buses and hatches have the same abilities
// as the plain ones and fit the same cells.
// docs/eras/ev.md lists no output bus; the chlorides and the tricalcium phosphate are dusts, so the cascade has one.
//
// Textures: overlay dir grindless:block/multiblock/extraction_cascade (tools/assets/Build-ExtractionCascadeTextures.ps1), base casing
// GTM's inert (PTFE) machine casing. The materials use GTM's icon sets. Names / tooltips: client_scripts/grindless/ev_extraction_cascade_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const EC = G.extractionCascade || (G.extractionCascade = {})

  const MACHINE = 'gtceu:extraction_cascade'
  const TYPE = 'gtceu:solvent_extraction'

  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const GLASS = 'gtceu:tempered_glass'
  const MIXER = 'gtceu:titanium_gearbox'
  const PIPE = 'gtceu:ptfe_pipe_casing'

  // published for the recipe script and the smoke test
  EC.machine = MACHINE
  EC.recipeType = TYPE
  EC.materials = {
    solution: 'rare_earth_chloride_solution',
    samarium: 'samarium_chloride',
    neodymium: 'neodymium_chloride',
    mixed: 'mixed_rare_earth_chloride'
  }
  EC.ids = {
    solution: 'gtceu:rare_earth_chloride_solution',
    samariumChloride: 'gtceu:samarium_chloride_dust',
    neodymiumChloride: 'gtceu:neodymium_chloride_dust',
    mixedChloride: 'gtceu:mixed_rare_earth_chloride_dust',
    merrillite: 'gtceu:merrillite_dust'
  }
  // items in: the merrillite and the programmed circuit; items out: the three chlorides (extraction) or the tricalcium phosphate
  // (leach); fluids in: the solution, the strip acid and the kerosene (extraction); fluids out: two in either mode
  EC.maxIO = { itemsIn: 2, itemsOut: 3, fluidsIn: 3, fluidsOut: 2 }
  EC.hatches = { energy: [1, 2], inputBus: 1, outputBus: 1, inputHatches: [1, 3], outputHatches: [1, 4], minCasings: 5 }

  // ---------------------------------------------------------------- pattern

  const BACK = ['XXX', 'III', 'III']
  const STAGE_MIXER = ['XIX', 'GMG', 'IPI']
  const STAGE_SETTLER = ['XIX', 'G#G', 'IPI']
  const FRONT = ['XXX', 'ISI', 'III']
  const SPEC = {
    slices: [BACK, STAGE_MIXER, STAGE_SETTLER, STAGE_MIXER, STAGE_SETTLER, STAGE_MIXER, FRONT],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(INERT, { min: EC.hatches.minCasings }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 }),
        Pat.part('input_hatch', { min: 1, max: 3 }),
        Pat.part('output_hatch', { min: 1, max: 4 })
      ),
      I: Pat.block(INERT),
      G: Pat.block(GLASS),
      M: Pat.block(MIXER),
      P: Pat.block(PIPE),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- GT materials

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(EC.materials.solution)
      .liquid(new GTFluidBuilder().attribute(GTFluidAttributes.ACID))
      .color(0xD9B8D2)
      .formula('(REE)Cl3(H2O)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(EC.materials.samarium)
      .dust()
      .color(0xE8E0A0).secondaryColor(0x9C9452)
      .iconSet(GTMaterialIconSet.FINE)
      .components('1x samarium', '3x chlorine')

    event.create(EC.materials.neodymium)
      .dust()
      .color(0xC6A2C8).secondaryColor(0x7A5079)
      .iconSet(GTMaterialIconSet.FINE)
      .components('1x neodymium', '3x chlorine')

    event.create(EC.materials.mixed)
      .dust()
      .color(0xEFE6DA).secondaryColor(0xB8A48C)
      .iconSet(GTMaterialIconSet.FINE)
      .components('1x rare_earth', '3x chlorine')
      .formula('(La,Ce,Pr,Y)Cl3')
  })

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('solvent_extraction')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(EC.maxIO.itemsIn, EC.maxIO.itemsOut, EC.maxIO.fluidsIn, EC.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_MIXER, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('extraction_cascade', 'multiblock')
      .langValue('Rare Earth Extraction Cascade')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('solvent_extraction')
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.extraction_cascade.tooltip.0'),
        Text.translate('grindless.machine.extraction_cascade.tooltip.1'),
        Text.translate('grindless.machine.extraction_cascade.tooltip.2'),
        Text.translate('grindless.machine.extraction_cascade.tooltip.3')
      ])
      .workableCasingModel(INERT_TEXTURE, 'grindless:block/multiblock/extraction_cascade')
  })
})()
