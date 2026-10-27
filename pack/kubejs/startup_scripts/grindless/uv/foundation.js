// priority: -9600
// -----------------------------------------------------------------------------------------------
// UV foundation (package UV-F1, docs/eras/uv.md "Build order", F1): the shared registrations the UV packages build on. No machines,
// no recipe types, no recipes, no planets, orbits, dimensions or station items (B1 owns them), no wireless hatches, covers or cell (the
// UV cell, grindless:uv_smes_cell, is a block of the wireless table: lv/wireless_energy.js registers it, UV-A9). Every other
// UV package uses exactly these ids; they are published in global.grindless.uvFoundation.
//
//   Items (grindless:), names in client_scripts/grindless/uv_foundation_lang.js; machine (uv.md section) that makes each one:
//     thorium_oxide_fuel_assembly, thorium_nitride_fuel_assembly      IV's fuel fabrication plant; burnt by 2
//     spent_thorium_oxide_fuel, spent_thorium_nitride_fuel            2; reprocessed by 1
//     curium_244_pellet, gphs_module                                  3 heat source works (read by 26, 28, 30)
//     carbon_carbon_aeroshell                                         HV composite autoclave, UV mode
//     pb11_capsule, d_he3_capsule                                     ZPM diamond lattice fab, UV mode; burnt by 4
//     srf_cryomodule                                                  6 SRF cavity works (read by 7 and 8)
//     antiproton_cartridge                                            7 synchrotron; emptied by 22
//     fibre_laser_module, ytterbium_fibre                             9 fibre draw tower (read by 4, 15, 23)
//     ingaas_pump_module                                              10 MOCVD reactor (read by 9)
//     hpge_crystal                                                    11 zone refining tower
//     snspd_array                                                     ZPM qubit fab, UV mode (read by 12)
//     hbn_dust, bnnt_yarn                                             13 boron nitride reactor (read by 16, 17, 21)
//     ented_powder                                                    14 powder-in-tube line
//     <metal>_am_powder (neutronium, darmstadtium, tritanium)         15 powder bed printer (tables/am_powders.json)
//     light_sail, starchip, sailcraft, starshot_probe                 21, 18, 18, 23
//     triton_ice_core, sputnik_ice_core, charon_core                  25, 26
//     planetesimal_sample, heliopause_data                            28, 30
//     proxima_approach_data, sgr_a_star_image                         12, 31
//   Fluids and materials (GT materials, gtceu: ids as ZPM's saturn_helium; uv.md writes them with grindless:):
//     ytterbium, uranium_233, arsine                                  absent from GTM (docs/research/uv-s0.md, S0-8)
//     thorium_nitride, nitrogen_15, nitrogen_15_oxide, boron_11_trifluoride, boron_10_trifluoride, decaborane
//     neptune_helium, neptune_hydrogen, triton_nitrogen, kuiper_noble_gas, superfluid_helium, helium_3_concentrate
//     liquid_deuterium_tritium                                        the muon fusion cell's liquid D-T
//   Blocks (grindless:): laser_module_block (4 and 23), srf_cryomodule_block (made by 6, a structure block of 7 and 8),
//     bnnt_fuel_tank (gcyr:fuel_tank, tier 11: S0-1 showed the registry takes tiers above 10; made by 16)
//
//   GTM already has neutronium, the gravi and quantum stars, americium, plutonium-241, oganesson, UHPIC, the EnTED wire, the wetware
//   mainframe, indium, niobium, thorium-232 and the UV casing and hull: none of them is registered here.
//   Every id has no recipe until its package lands: tools/analysis/emi-coverage.mjs lists them as expected-unobtained.
//
// Textures: tools/assets/Build-UVFoundationTextures.ps1.
(function () {
  const G = global.grindless
  const UVF = G.uvFoundation || (G.uvFoundation = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    thorium_oxide_fuel_assembly: { stack: 16 },
    thorium_nitride_fuel_assembly: { stack: 16 },
    spent_thorium_oxide_fuel: { stack: 16 },
    spent_thorium_nitride_fuel: { stack: 16 },
    curium_244_pellet: { stack: 16 },
    gphs_module: { stack: 16 },
    carbon_carbon_aeroshell: { stack: 16 },
    pb11_capsule: { stack: 64 },
    d_he3_capsule: { stack: 64 },
    srf_cryomodule: { stack: 4 },
    antiproton_cartridge: { stack: 16 },
    fibre_laser_module: { stack: 16 },
    ytterbium_fibre: { stack: 64 },
    ingaas_pump_module: { stack: 16 },
    hpge_crystal: { stack: 16 },
    snspd_array: { stack: 16 },
    hbn_dust: { stack: 64 },
    bnnt_yarn: { stack: 64 },
    ented_powder: { stack: 64 },
    neutronium_am_powder: { stack: 64 },
    darmstadtium_am_powder: { stack: 64 },
    tritanium_am_powder: { stack: 64 },
    light_sail: { stack: 16 },
    starchip: { stack: 16 },
    sailcraft: { stack: 16 },
    starshot_probe: { stack: 1 },
    triton_ice_core: { stack: 16 },
    sputnik_ice_core: { stack: 16 },
    charon_core: { stack: 16 },
    planetesimal_sample: { stack: 16 },
    heliopause_data: { stack: 16 },
    proxima_approach_data: { stack: 16 },
    sgr_a_star_image: { stack: 16 }
  }

  const BLOCKS = {
    laser_module_block: { texture: 'grindless:block/uv/laser_module_block' },
    srf_cryomodule_block: { texture: 'grindless:block/uv/srf_cryomodule_block' }
  }

  // the tier 11 tank of line 11 (level 7 rockets with elite motors); the id and tier follow S0-1
  const TANK = {
    id: 'grindless:bnnt_fuel_tank',
    typeId: 'grindless_bnnt',
    tier: 11,
    fuel: 1024000,
    texture: 'grindless:block/uv/bnnt_fuel_tank_side'
  }

  // GT material name -> form (gas, liquid, dust, ingot), colour and formula; GTM colours and buckets the fluids
  const MATERIALS = {
    ytterbium: { form: 'ingot', colour: 0xB9C2A4, formula: 'Yb' },
    uranium_233: { form: 'ingot', colour: 0x6FA05A, formula: 'U-233', radioactive: true },
    arsine: { form: 'gas', colour: 0xC9D8A8, formula: 'AsH3' },
    thorium_nitride: { form: 'dust', colour: 0x6A7078, formula: 'ThN' },
    nitrogen_15: { form: 'gas', colour: 0x7FA6D8, formula: '15N2' },
    nitrogen_15_oxide: { form: 'gas', colour: 0x9C7FD8, formula: '15NO' },
    boron_11_trifluoride: { form: 'gas', colour: 0xD8C48A, formula: '11BF3' },
    boron_10_trifluoride: { form: 'gas', colour: 0xC8A878, formula: '10BF3' },
    decaborane: { form: 'liquid', colour: 0xE6D69A, formula: 'B10H14' },
    neptune_helium: { form: 'gas', colour: 0x7FA2E8, formula: 'He' },
    neptune_hydrogen: { form: 'gas', colour: 0x5F8CD8, formula: 'H2(HD)' },
    triton_nitrogen: { form: 'gas', colour: 0xE8B8D0, formula: '15N2' },
    kuiper_noble_gas: { form: 'gas', colour: 0xB8A8E0, formula: 'Ar(Kr)(Xe)' },
    superfluid_helium: { form: 'liquid', colour: 0xF0F4FF, formula: 'He' },
    helium_3_concentrate: { form: 'gas', colour: 0xF4E0B0, formula: '(3He)(He)' },
    liquid_deuterium_tritium: { form: 'liquid', colour: 0xA8E0D0, formula: 'DT' }
  }

  UVF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  UVF.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name }).concat([TANK.id])
  UVF.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  UVF.tank = TANK

  // every id by camelCase name, as the other UV packages read them (ids.hpgeCrystal, ids.neptuneHelium...)
  UVF.ids = {}
  Object.keys(ITEMS).concat(Object.keys(BLOCKS), ['bnnt_fuel_tank'], Object.keys(MATERIALS)).forEach(function (name) {
    var key = name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() })
    UVF.ids[key] = (MATERIALS[name] ? 'gtceu:' : 'grindless:') + name
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

    event.create(TANK.id, 'gcyr:fuel_tank')
      .typeId(TANK.typeId)
      .tier(TANK.tier)
      .fuelStorage(TANK.fuel)
      .textureAll(TANK.texture)
      .hardness(5)
      .resistance(6)
      .requiresTool(true)
      .tagBlock('minecraft:mineable/pickaxe')
      .item(function (item) { tooltips(item, 'bnnt_fuel_tank') })
  })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
      tooltips(item, name)
    })
  })

  // GTM registers ytterbium as a bare element with no form, so a new material of that name is dropped: it gets its ingot here (verified, which adds the dust and the smelting targets)
  // (materialModification runs before the items are generated, as ZPM's radium in zpm/actinides.js)
  GTCEuStartupEvents.materialModification(function (event) {
    try {
      var yb = GTMaterials.get('ytterbium')
      if (yb == null || yb.isNull()) return
      yb.getProperties().ensureSet(PropertyKey.INGOT, true)
    } catch (e) {
      console.error('[grindless/uv] ytterbium: dust and ingot not added: ' + e)
    }
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (name) {
      var spec = MATERIALS[name]
      if (name === 'ytterbium') return
      var material = event.create(name)
      if (spec.form === 'gas') material.gas()
      else if (spec.form === 'liquid') material.liquid()
      else if (spec.form === 'ingot') material.ingot().iconSet(GTMaterialIconSet.METALLIC)
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      if (spec.radioactive) material.radioactiveHazard(1)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
