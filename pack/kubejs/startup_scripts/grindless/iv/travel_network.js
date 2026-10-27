// priority: -3100
// -----------------------------------------------------------------------------------------------
// IV travel and network (docs/eras/iv.md, "Route" steps 5-7, "Venus and Mercury", "On-site power" and "AE2 between planets: the IV
// step"; package IV-B5). Registrations only; the recipes are in server_scripts/grindless/iv/travel_network.js.
//
//   gtceu:ev_rtg                  RTG Cell, a single-block generator (GTM 7.5.3's KubeJS 'generator' machine type, the way GTM registers its
//                                 combustion and gas generators: SimpleGeneratorMachine, its editable generator UI and its tooltips). A
//                                 plutonium oxide pellet (grindless:rtg_pellet, the hot cell's mode 2) heats a chromel-constantan thermopile:
//                                 2,048 EU/t, constant, day and night, on any world (it burns nothing). The pellet is a chanced input, so
//                                 it is used up at random, about one per hour of running.
//                                 Its id is gtceu:ev_rtg, not iv.md's gtceu:rtg: GTM's KubeJS builders name every single-block machine
//                                 <tier>_<name> (KJSTieredMachineBuilder#register), and MachineBuilder#register is @HideFromJS, so no script
//                                 can register a single block without the prefix (the pack's creature simulator is gtceu:<tier>_creature_
//                                 simulator for the same reason). EV because 2,048 EU/t is exactly one EV amp: the cell sends EV packets,
//                                 safe on EV cables and accepted by any IV hatch or machine.
//   gtceu:radioisotope_decay      its recipe type (EU out; 1 item in). One recipe. It is NOT in power/generators.js's list of doubled
//                                 generator types (the figures here are final), and that script only rebuilds datapack recipes anyway.
//   grindless:venusian_quantum_seed  the Venusian half of an Earth-Venus quantum pair, made only on Venus from Venusian regolith (IV-B1's
//                                 site casing, the planet's own ground) + ender pearl + helium-3, like the Martian seed from merrillite.
//   grindless:hermean_quantum_seed   the Hermean half of an Earth-Mercury pair, made only on Mercury from Hermean regolith dust (IV-A1's
//                                 Mercury-only material) + ender pearl + helium-3.
//
// Published as global.grindless.travelNetwork for the recipe script and the smoke test (ids, the seeds of each planet, the RTG figures).
// Names: client_scripts/grindless/iv_travel_network_lang.js. Textures: tools/assets/Build-TravelNetworkTextures.ps1 (the seeds and the
// RTG's overlays under grindless:block/machines/rtg).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  const G = global.grindless || (global.grindless = {})
  const TN = G.travelNetwork || (G.travelNetwork = {})

  const RTG_TYPE = 'radioisotope_decay'
  const RTG_DATA_KEY = 'grindless_rtg_hours'

  TN.ids = {
    venusSeed: 'grindless:venusian_quantum_seed',
    mercurySeed: 'grindless:hermean_quantum_seed',
    rtg: 'gtceu:ev_rtg',
    rtgPellet: 'grindless:rtg_pellet',
    chart: 'grindless:inner_planets_chart',
    marsChart: 'grindless:mars_chart',
    dataStick: 'gtceu:data_stick',
    eliteTank: 'gcyr:elite_fuel_tank',
    eliteMotor: 'gcyr:elite_rocket_motor',
    template: 'gcyr:space_suit_thermal_upgrade_smithing_template',
    spreader: 'gcyr:iv_oxygen_spreader',
    singularity: 'ae2:singularity',
    entangled: 'ae2:quantum_entangled_singularity',
    helium3: 'gtceu:helium_3'
  }

  // the far halves of the IV pairs: the planet's own material first (GTM's lookup sorts by how rare an ingredient is, and the planet's
  // material is in no other chemical reactor recipe, so the lunar seed's ender pearl + helium-3 never becomes a prefix of these)
  TN.seeds = [
    { planet: 'venus', seed: TN.ids.venusSeed, local: 'gcyr:venusian_regolith', builderId: 'grindless:venusian_quantum_seed',
      recipe: 'grindless:chemical_reactor/venusian_quantum_seed', pair: 'grindless:transform/venusian_entangled_singularity' },
    { planet: 'mercury', seed: TN.ids.mercurySeed, local: 'gtceu:hermean_regolith_dust', builderId: 'grindless:hermean_quantum_seed',
      recipe: 'grindless:chemical_reactor/hermean_quantum_seed', pair: 'grindless:transform/hermean_entangled_singularity' }
  ]
  TN.seedEut = 480
  TN.seedDuration = 200
  TN.seedHelium3 = 250

  // the RTG: 2,048 EU/t for 720-tick runs; the pellet goes at 100 of 10,000 per run (GTM's chance), so one pellet per 100 runs:
  // 72,000 ticks, one hour of running, 147,456,000 EU per pellet
  TN.rtg = {
    machine: 'gtceu:ev_rtg',
    name: 'rtg',
    tier: 4,
    type: 'gtceu:' + RTG_TYPE,
    recipe: 'grindless:radioisotope_decay/rtg_pellet',
    builderId: 'grindless:rtg_pellet',
    pellet: TN.ids.rtgPellet,
    eut: 2048,
    duration: 720,
    chance: 100,
    maxChance: 10000,
    pelletTicks: 72000,
    euPerPellet: 2048 * 72000,
    dataKey: RTG_DATA_KEY,
    crafting: 'grindless:assembler/ev_rtg',
    craftingBuilderId: 'grindless:ev_rtg',
    overlay: 'grindless:block/machines/rtg'
  }

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    ;[['venusian_quantum_seed', TN.ids.venusSeed], ['hermean_quantum_seed', TN.ids.mercurySeed]].forEach(function (s) {
      event.create(s[1])
        .texture('grindless:item/' + s[0])
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + s[0] + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + s[0] + '.1')))
    })
  })

  // ---------------------------------------------------------------- the RTG's recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // a generator type: the pellet in, EU out
    event.create(RTG_TYPE)
      .category('generator')
      .setEUIO('out')
      .setMaxIOSize(1, 0, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
  })

  // the EMI line under the recipe: how long a pellet lasts and what it gives (read from the recipe's data). Called on the client while
  // EMI draws a recipe; an empty string draws nothing.
  function rtgInfo(data) {
    try {
      var hours = data.getInt(RTG_DATA_KEY)
      if (!(hours > 0)) return ''
      return String(Text.translate('gtceu.recipe.' + RTG_DATA_KEY, String(hours), String(TN.rtg.euPerPellet)).getString())
    } catch (e) {
      return ''
    }
  }

  // GTM's own single-block generator modifier (what GTMachineUtils.registerSimpleGenerator gives its generators): parallel runs up to the
  // machine's voltage. At EV, 2,048 / 2,048 = 1, so the cell runs one pellet at a time.
  var SGM = null
  function generatorModifier(machine, recipe) {
    if (SGM === null) SGM = Java.loadClass('com.gregtechceu.gtceu.api.machine.SimpleGeneratorMachine')
    return SGM.recipeModifier(machine, recipe)
  }

  // ---------------------------------------------------------------- the machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(RTG_TYPE)
    if (type == null) throw new Error('[grindless/iv] recipe type gtceu:' + RTG_TYPE + ' is not registered')
    type.addDataInfo(rtgInfo)

    event.create(TN.rtg.name, 'generator')
      .tiers(GTValues.EV)
      .addDefaultModel(false)
      .definition(function (tier, builder) {
        builder
          .langValue('RTG Cell')
          .recipeType(RTG_TYPE)
          .rotationState(RotationState.ALL)
          .recipeModifier(generatorModifier, true)
          .regressWhenWaiting(false)
          .simpleGeneratorModel(TN.rtg.overlay)
        builder["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.ev_rtg.tooltip.0'),
          Text.translate('grindless.machine.ev_rtg.tooltip.1'),
          Text.translate('grindless.machine.ev_rtg.tooltip.2')
        ])
      })
  })
})()
