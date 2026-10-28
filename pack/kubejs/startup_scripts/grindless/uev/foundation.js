// priority: -7550
// -----------------------------------------------------------------------------------------------
// UEV foundation (package UEV-F1, docs/eras/uev.md "Build order", F1): the shared registrations the UEV packages build on. No machines
// (the DFD motors are B1's, S0-2), no recipe types, no worldgen and no dimension. Every other UEV package uses exactly these ids; they
// are published in global.grindless.uevFoundation. GTM already registers gtceu:uev_machine_casing and the UEV wires of its own metals,
// and its calcium, potassium, lithium, hafnium, tantalum, rhenium, ruthenium, terbium, lanthanum, yttrium, curium, californium and
// tennessine, so none of those is re-registered (S0-1 dump; tennessine is in GTM's lang, contract F1 lists it by mistake). The hull and
// energy hatch builders also register the UIV ones (UIV-S0-1: a second create of the same id clashes), `.tiers(UEV, UIV)`.
//
//   Components (grindless:, Monifactory's Post_UV_Components.js pattern, LGPL, credited): uev_electric_motor (A5), uev_robot_arm (A8),
//     uev_field_generator (B4), uev_electric_pump, uev_conveyor_module, uev_electric_piston, uev_sensor, uev_emitter (A6).
//   Not here: grindless:srf_cavity (UV's cold foundation registers it; the UEV packages reuse it).
//   Items made by one package and used by another (ids not spelled in uev.md are chosen here and canonical, DECISIONS UHV-F1):
//     ca48_beam, target_wheel, tennessine_sample, superheavy_census      superheavy facility
//     degenerate_eos_model, barnard_gravity_survey, quantum_repeater_node  Earth-orbit products
//     pulsar_navigation_chart, mass_radius_chart                          charts
//     degenerate_matter, degenerate_pellet                                Sirius products
//     sx_blade, sic_sic_plate, wf_w_tile, snspd, qd_source, sdd, lobster_eye_mcp, aerogel_tile, hollow_core_fibre,
//     faraday_isolator, bonded_fe16n2_magnet                              parts
//     barnard_core_rock
//   Blocks (grindless:): uev_fusion_casing, degenerate_containment_casing (24, 25), photonic_casing (cleanroom grade 11-13),
//     hftacn_coil_block (a gtceu:coil, 12,600 K, S0-7).
//   Materials (GT materials, gtceu: ids as UHV's, DECISIONS UV-F1; uev.md writes the lay superhydride and the three fuels with grindless:).
//   The hull and the four hatches (2 A and 16 A, input and output) are gtceu:uev_* machines as S0-1 proved; their recipes are in
//   server_scripts/grindless/uev/foundation.js.
//
// Textures: tools/assets/Build-UEVFoundationTextures.ps1. Names: client_scripts/grindless/uev_foundation_lang.js.
(function () {
  const G = global.grindless
  const UEVF = G.uevFoundation || (G.uevFoundation = {})
  const UEV = 10

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    uev_electric_motor: { stack: 64 },
    uev_electric_pump: { stack: 64 },
    uev_conveyor_module: { stack: 64 },
    uev_electric_piston: { stack: 64 },
    uev_robot_arm: { stack: 64 },
    uev_sensor: { stack: 64 },
    uev_emitter: { stack: 64 },
    uev_field_generator: { stack: 64 },
    ca48_beam: { stack: 16 },
    target_wheel: { stack: 16 },
    tennessine_sample: { stack: 16 },
    superheavy_census: { stack: 16 },
    degenerate_eos_model: { stack: 16 },
    barnard_gravity_survey: { stack: 16 },
    quantum_repeater_node: { stack: 16 },
    pulsar_navigation_chart: { stack: 16 },
    mass_radius_chart: { stack: 16 },
    degenerate_matter: { stack: 16 },
    degenerate_pellet: { stack: 16 },
    sx_blade: { stack: 64 },
    sic_sic_plate: { stack: 64 },
    wf_w_tile: { stack: 64 },
    snspd: { stack: 64 },
    qd_source: { stack: 64 },
    sdd: { stack: 64 },
    lobster_eye_mcp: { stack: 16 },
    aerogel_tile: { stack: 64 },
    hollow_core_fibre: { stack: 64 },
    faraday_isolator: { stack: 64 },
    bonded_fe16n2_magnet: { stack: 64 },
    barnard_core_rock: { stack: 64 }
  }

  const BLOCKS = {
    uev_fusion_casing: { texture: 'grindless:block/uev/uev_fusion_casing' },
    degenerate_containment_casing: { texture: 'grindless:block/uev/degenerate_containment_casing' },
    photonic_casing: { texture: 'grindless:block/uev/photonic_casing' }
  }

  // The HfTaCN coil (12,600 K, level 10, S0-7): GTM's EBF and lib/coils.js read a gtceu:coil block. It borrows GTM's tritanium coil
  // texture, the one S0-7 proved (its bloom variant sits beside it).
  const COIL = { id: 'hftacn_coil_block', temperature: 12600, texture: 'gtceu:block/casings/coils/machine_coil_tritanium' }

  // GT material name -> form, colour and formula
  const MATERIALS = {
    calcium_48: { form: 'dust', colour: 0xE8E4D8, formula: '48Ca' },
    potassium_40: { form: 'dust', colour: 0xD8C8E0, formula: '40K' },
    lithium_6: { form: 'dust', colour: 0xC8C8D4, formula: '6Li' },
    plutonium_244: { form: 'dust', colour: 0xA02838, formula: '244Pu' },
    curium_248: { form: 'dust', colour: 0xC8A8D0, formula: '248Cm' },
    californium_249: { form: 'dust', colour: 0xC8D8A0, formula: '249Cf' },
    lay_superhydride: { form: 'ingot', colour: 0x9FE8FF, formula: '(La,Y)H10', cable: true },
    ammonia_borane: { form: 'dust', colour: 0xF0F0F4, formula: 'NH3BH3' },
    fe16n2: { form: 'dust', colour: 0x5A5E6A, formula: 'Fe16N2' },
    iron_pentacarbonyl: { form: 'liquid', colour: 0xE0C870, formula: 'Fe(CO)5' },
    hftacn: { form: 'ingot', colour: 0x7A6E88, formula: 'HfTaCN' },
    sic_sic: { form: 'dust', colour: 0x4A5650, formula: 'SiC/SiC' },
    tungsten_silicide: { form: 'dust', colour: 0x5A5A66, formula: 'WSi2' },
    tgg: { form: 'dust', colour: 0xC8E0C0, formula: 'Tb3Ga5O12' },
    ppktp: { form: 'dust', colour: 0xE0D08A, formula: 'KTiOPO4' },
    ffkm: { form: 'dust', colour: 0x2E2E34, formula: '(C3F6)(C2F4)n' },
    polycarbonate: { form: 'dust', colour: 0xD0E0E8, formula: '(C16H14O3)n' },
    ule_glass: { form: 'dust', colour: 0xC0D8E8, formula: 'SiO2TiO2' },
    interstellar_gas: { form: 'gas', colour: 0x6A5A9A, formula: 'H/He' },
    compressed_interstellar_gas: { form: 'gas', colour: 0x7A6AAA, formula: 'H/He' },
    hydrogen_deuterium_fraction: { form: 'gas', colour: 0xB8C8E8, formula: 'H2/HD' },
    helium_fraction: { form: 'gas', colour: 0xF0E0A0, formula: 'He' },
    dhe3_fuel_mix: { form: 'gas', colour: 0xE86AB8, formula: '(D)(3He)' },
    pb11_fuel: { form: 'gas', colour: 0x6AA8E8, formula: '(1H)(11B)' },
    polarised_dhe3_fuel: { form: 'gas', colour: 0xF08AD0, formula: '(D)(3He)' }
  }

  UEVF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  UEVF.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name }).concat(['grindless:' + COIL.id])
  UEVF.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  UEVF.machines = ['machine_hull', 'energy_input_hatch', 'energy_input_hatch_16a', 'energy_output_hatch', 'energy_output_hatch_16a']
    .map(function (name) { return 'gtceu:uev_' + name })
  UEVF.coilTemperature = COIL.temperature

  // every id by camelCase name, as the other UEV packages read them (ids.ca48Beam, ids.laySuperhydride...)
  UEVF.ids = {}
  Object.keys(ITEMS).concat(Object.keys(BLOCKS), [COIL.id], Object.keys(MATERIALS)).forEach(function (name) {
    var key = name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() })
    UEVF.ids[key] = (MATERIALS[name] ? 'gtceu:' : 'grindless:') + name
  })

  function tooltips(item, name) {
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
  }

  StartupEvents.registry('block', function (event) {
    Object.keys(BLOCKS).forEach(function (name) {
      event.create('grindless:' + name)
        .stoneSoundType()
        .hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll(BLOCKS[name].texture)
        .item(function (item) { tooltips(item, name) })
    })
    event.create('grindless:' + COIL.id, 'gtceu:coil')
      .temperature(COIL.temperature)
      .level(10)
      .energyDiscount(10)
      .tier(UEV)
      .texture(COIL.texture)
      .coilMaterial(function () { return GTMaterials.get('hftacn') })
  })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
      tooltips(item, name)
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (name) {
      var spec = MATERIALS[name]
      var material = event.create(name)
      if (spec.form === 'gas') material.gas()
      else if (spec.form === 'liquid') material.liquid()
      else if (spec.form === 'ingot') material.ingot().iconSet(GTMaterialIconSet.METALLIC)
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      // (La,Y)H10 is a 4 A wire at V[UEV] with no loss and no superconductor flag (S0-9)
      if (spec.cable) material.cableProperties(GTValues.V[UEV], 4, 0, false)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // S0-1: the hull and the four hatches register and form with highTierContent off. UIV-F1 (S0-1 fallback): the builder key is the base
  // id, so UIV's five gtceu:uiv_* come from these same builders (.tiers(UEV, UIV)); the labels are named by tier
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var HullMachine = Java.loadClass('com.gregtechceu.gtceu.common.machine.electric.HullMachine')
    var EHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')

    function hatch(id, label, io, amps, ability, model) {
      event.create(id, 'custom')
        .tiers(UEV, GTValues.UIV)
        .machine(function (holder, tier) { return new EHPM(holder, tier, io, amps) })
        .definition(function (tier, builder) {
          builder
            .langValue(GTValues.VN[tier] + ' ' + label)
            .rotationState(RotationState.ALL)
            .abilities(ability)
          builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
          builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('gtceu', model))
        })
    }

    event.create('machine_hull', 'custom')
      .tiers(UEV, GTValues.UIV)
      .machine(function (holder, tier) { return new HullMachine(holder, tier) })
      .definition(function (tier, builder) {
        builder
          .langValue(GTValues.VN[tier] + ' Machine Hull')
          .rotationState(RotationState.ALL)
          .abilities(PartAbility.PASSTHROUGH_HATCH)
        builder['overlayTieredHullModel(java.lang.String)']('hull')
      })
    hatch('energy_input_hatch', 'Energy Hatch', IO.IN, 2, PartAbility.INPUT_ENERGY, 'block/machines/energy_hatch.input')
    hatch('energy_output_hatch', 'Dynamo Hatch', IO.OUT, 2, PartAbility.OUTPUT_ENERGY, 'block/machines/energy_hatch.output')
    hatch('energy_input_hatch_16a', '16A Energy Hatch', IO.IN, 16, PartAbility.INPUT_ENERGY, 'block/machines/energy_hatch.input_16a')
    hatch('energy_output_hatch_16a', '16A Dynamo Hatch', IO.OUT, 16, PartAbility.OUTPUT_ENERGY, 'block/machines/energy_hatch.output_16a')
  })
})()
