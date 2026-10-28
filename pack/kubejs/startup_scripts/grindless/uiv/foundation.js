// priority: -7000
// -----------------------------------------------------------------------------------------------
// UIV foundation (package UIV-F1, docs/eras/uiv.md "Build order", F1): the shared registrations the UIV packages build on. No machine of
// our own, no recipe type, no worldgen and no dimension. Every other UIV package uses exactly these ids; they are published in
// global.grindless.uivFoundation. The band is provisional: the integrator stamps it in tools/analysis/script_order.json (uiv.md, File order).
//
//   The UIV hull and the four hatches (2 A and 16 A, input and output) are the gtceu:uiv_* ids of S0-1. They are NOT created here: a second
//   machine_hull or energy hatch builder crashes the boot (builder key = base id), so uev/foundation.js registers them with
//   .tiers(UEV, UIV) (S0-1 fallback). Their recipes are in server_scripts/grindless/uiv/foundation.js. gtceu:uiv_machine_casing is GTM's;
//   its recipe is UEV's gate (server_scripts/grindless/uev/gate.js).
//
//   Components (grindless:, Monifactory's Post_UV_Components.js pattern, LGPL, credited): uiv_electric_piston (A2), uiv_conveyor_module (A3),
//     uiv_sensor (A7), uiv_electric_motor, uiv_electric_pump, uiv_robot_arm (A8), uiv_field_generator (B2), uiv_emitter (B3).
//   Items made by one package and used by another (ids not spelled in uiv.md are chosen here and canonical, DECISIONS UHV-F1):
//     ti50_oven_charge, element_119_recoil, element_120_recoil, superheavy_census_ii, u238_flash_target   superheavy
//     mh_winding, h_si28_wafer, p_si_die, eo_microcomb, telecom_memory, mk_cryostat_module, data_crystal_5d,
//     wf_rhea_billet, ps_cooling_laser, cage_part, sled_charge                                                parts
//     neutronium_pellet, j0437_pulse_raw, xray_pulse_timed, pulsar_navigation_solution, kerr_probe_data,
//     correlated_kerr_data, recovered_half_sled                                                              far products
//     ns_eos_chart, kerr_chart, pulsar_timed_repeater                                                        charts and links
//   Blocks (grindless:): uiv_fusion_casing (S0-6), neutron_star_site_casing (line 43), metallic_hydrogen_coil_block (a gtceu:coil, 14,400 K,
//     S0-11).
//   Materials: the ones uiv.md spells with grindless: (metallic hydrogen, the three Mk5 fuels, plasmas and ash gases) keep that namespace, as
//     S0-7 proved for metallic hydrogen; every other one is a gtceu: GT material (S0-1, DECISIONS UV-F1). Forms added to GTM's own
//     materials (materialModification, as luv/foundation.js and zpm/actinides.js): dust for erbium, einsteinium and fermium.
//   Not here: relay_seed, launched_relay_seed, ergosphere_probe (B1), uiv_smes_cell (W), the optical mainframe (A7).
//
// Textures: tools/assets/Build-UIVFoundationTextures.ps1. Names: client_scripts/grindless/uiv_foundation_lang.js.
(function () {
  const G = global.grindless
  const UIVF = G.uivFoundation || (G.uivFoundation = {})
  const UIV = 11
  const LOG = '[grindless/uiv] '

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    uiv_electric_motor: { stack: 64 },
    uiv_electric_pump: { stack: 64 },
    uiv_conveyor_module: { stack: 64 },
    uiv_electric_piston: { stack: 64 },
    uiv_robot_arm: { stack: 64 },
    uiv_sensor: { stack: 64 },
    uiv_emitter: { stack: 64 },
    uiv_field_generator: { stack: 64 },
    ti50_oven_charge: { stack: 16 },
    element_119_recoil: { stack: 16 },
    element_120_recoil: { stack: 16 },
    superheavy_census_ii: { stack: 16 },
    u238_flash_target: { stack: 16 },
    mh_winding: { stack: 64 },
    h_si28_wafer: { stack: 64 },
    p_si_die: { stack: 64 },
    eo_microcomb: { stack: 64 },
    telecom_memory: { stack: 64 },
    mk_cryostat_module: { stack: 16 },
    data_crystal_5d: { stack: 16 },
    wf_rhea_billet: { stack: 64 },
    ps_cooling_laser: { stack: 16 },
    cage_part: { stack: 64 },
    sled_charge: { stack: 16 },
    neutronium_pellet: { stack: 16 },
    j0437_pulse_raw: { stack: 16 },
    xray_pulse_timed: { stack: 16 },
    pulsar_navigation_solution: { stack: 16 },
    kerr_probe_data: { stack: 16 },
    correlated_kerr_data: { stack: 16 },
    recovered_half_sled: { stack: 16 },
    ns_eos_chart: { stack: 16 },
    kerr_chart: { stack: 16 },
    pulsar_timed_repeater: { stack: 16 }
  }

  const BLOCKS = {
    uiv_fusion_casing: { texture: 'grindless:block/uiv/uiv_fusion_casing' },
    neutron_star_site_casing: { texture: 'grindless:block/uiv/neutron_star_site_casing' }
  }

  // The metallic hydrogen coil (14,400 K, level 11, S0-11): GTM's EBF and lib/coils.js read a gtceu:coil block. It borrows GTM's tritanium
  // coil texture, the one S0-7 and S0-11 proved.
  const COIL = { id: 'metallic_hydrogen_coil_block', temperature: 14400, texture: 'gtceu:block/casings/coils/machine_coil_tritanium' }

  // material key (with its namespace) -> form, colour and formula. 'plate' adds GTM's plate generation (the hull's RHEA plate).
  const MATERIALS = {
    'grindless:metallic_hydrogen': { form: 'ingot', colour: 0xD8F0FF, formula: 'H(met)', cable: true },
    'gtceu:rhea': { form: 'ingot', colour: 0x8A8E9C, formula: 'WMoNbTaHf', plate: true },
    'gtceu:wf_rhea': { form: 'ingot', colour: 0x7C8090, formula: 'W(f)/WMoNbTaHf' },
    'gtceu:zrticunibe_glass': { form: 'dust', colour: 0xB8C4CC, formula: 'ZrTiCuNiBe' },
    'gtceu:prni5': { form: 'dust', colour: 0xA8B8A0, formula: 'PrNi5' },
    'gtceu:lonsdaleite': { form: 'dust', colour: 0xE8F4F8, formula: 'C(hex)' },
    'gtceu:cubic_gauche_nitrogen': { form: 'dust', colour: 0xB8D0F0, formula: 'N(cg)' },
    'gtceu:gd_123': { form: 'dust', colour: 0x3A3A48, formula: 'GdBa2Cu3O7' },
    'gtceu:li_sn': { form: 'liquid', colour: 0xC0C8D8, formula: 'LiSn' },
    'gtceu:ingaasb': { form: 'dust', colour: 0x6A5A7A, formula: 'InGaAsSb' },
    'gtceu:titanium_50': { form: 'dust', colour: 0xB8BCC8, formula: '50Ti' },
    'gtceu:europium_151': { form: 'dust', colour: 0xE8E0B0, formula: '151Eu' },
    'gtceu:nickel_58': { form: 'dust', colour: 0xB8C8B8, formula: '58Ni' },
    'gtceu:carbon_12': { form: 'dust', colour: 0x2A2A30, formula: '12C' },
    'gtceu:niobium_pentoxide': { form: 'dust', colour: 0xE8E8EC, formula: 'Nb2O5' },
    'gtceu:erbium_oxide': { form: 'dust', colour: 0xF0B8C8, formula: 'Er2O3' },
    'gtceu:praseodymium_oxide': { form: 'dust', colour: 0x9AB840, formula: 'Pr6O11' },
    'gtceu:gadolinium_oxide': { form: 'dust', colour: 0xF4F4F0, formula: 'Gd2O3' },
    'grindless:he3he3_fuel': { form: 'gas', colour: 0xF8E090, formula: '(3He)(3He)' },
    'grindless:pli6_fuel': { form: 'gas', colour: 0xC8A0E8, formula: '(1H)(6Li)' },
    'grindless:pn15_fuel': { form: 'gas', colour: 0x88C8E8, formula: '(1H)(15N)' },
    'grindless:he3he3_plasma': { form: 'gas', colour: 0xFFA848, formula: '4He(+)' },
    'grindless:pli6_plasma': { form: 'gas', colour: 0xE070F0, formula: '3He(+)4He(+)' },
    'grindless:pn15_plasma': { form: 'gas', colour: 0x58A0FF, formula: '12C(+)4He(+)' },
    'grindless:he3he3_ash': { form: 'gas', colour: 0xE8D8A0, formula: '4He/H2' },
    'grindless:pli6_ash': { form: 'gas', colour: 0xE0C8B0, formula: '3He/4He' },
    'grindless:pn15_ash': { form: 'gas', colour: 0x8890A0, formula: '4He/12C' }
  }

  // forms added to GT materials that exist without one (S0-1 dump): erbium (the Er2O3 reductor chain), einsteinium and fermium (the neutron
  // flash debris and the element 119 target)
  const ADDED_DUSTS = ['erbium', 'einsteinium', 'fermium']

  UIVF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  UIVF.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name }).concat(['grindless:' + COIL.id])
  UIVF.materials = Object.keys(MATERIALS)
  UIVF.addedDusts = ADDED_DUSTS.map(function (name) { return 'gtceu:' + name })
  // the hull and hatches are uev/foundation.js's builders at the second tier (S0-1)
  UIVF.machines = ['machine_hull', 'energy_input_hatch', 'energy_input_hatch_16a', 'energy_output_hatch', 'energy_output_hatch_16a']
    .map(function (name) { return 'gtceu:uiv_' + name })
  UIVF.coilTemperature = COIL.temperature

  // every id by camelCase name, as the other UIV packages read them (ids.uivRobotArm, ids.metallicHydrogen...)
  UIVF.ids = {}
  function camel(name) { return name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() }) }
  Object.keys(ITEMS).concat(Object.keys(BLOCKS), [COIL.id]).forEach(function (name) { UIVF.ids[camel(name)] = 'grindless:' + name })
  Object.keys(MATERIALS).forEach(function (key) { UIVF.ids[camel(key.slice(key.indexOf(':') + 1))] = key })

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
      .level(11)
      .energyDiscount(11)
      .tier(UIV)
      .texture(COIL.texture)
      .coilMaterial(function () {
        var mat = GTMaterials.get('grindless:metallic_hydrogen')
        return mat == null || mat.isNull() ? GTMaterials.get('tritanium') : mat
      })
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
    Object.keys(MATERIALS).forEach(function (key) {
      var spec = MATERIALS[key]
      var material = event.create(key)
      if (spec.form === 'gas') material.gas()
      else if (spec.form === 'liquid') material.liquid()
      else if (spec.form === 'ingot') material.ingot().iconSet(GTMaterialIconSet.METALLIC)
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      // metallic hydrogen is a 4 A wire at V[UIV] with no loss and no superconductor flag (S0-7)
      if (spec.cable) material.cableProperties(GTValues.V[UIV], 4, 0, false)
      if (spec.plate) material.flags(GTMaterialFlags.GENERATE_PLATE, GTMaterialFlags.DISABLE_DECOMPOSITION)
      else material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // materialModification runs after every material is registered and before GTM generates the items
  GTCEuStartupEvents.materialModification(function (event) {
    ADDED_DUSTS.forEach(function (name) {
      try {
        var material = GTMaterials.get(name)
        if (material == null || material.isNull()) {
          console.error(LOG + 'GT material ' + name + ' not found: dust not added')
          return
        }
        material.getProperties().ensureSet(PropertyKey.DUST)
      } catch (e) {
        console.error(LOG + name + ': dust not added: ' + e)
      }
    })
  })
})()
