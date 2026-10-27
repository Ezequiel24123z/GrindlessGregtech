// priority: -11100
// -----------------------------------------------------------------------------------------------
// ZPM foundation (package ZPM-F1, docs/eras/zpm.md "Build order", F1): the shared registrations the ZPM packages build on. No machines,
// no recipe types, no recipes, no dimensions, no wireless tier and nothing that waits for spikes S0-1/S0-2 (rocket motors and tanks,
// planets, orbits, stations). Every other ZPM package uses exactly these ids; they are published in global.grindless.zpmFoundation.
//
//   Items (grindless:), names in client_scripts/grindless/zpm_foundation_lang.js; machine (zpm.md section) that makes each one:
//     radium_capsule, curium_oxide                      4 waste retrieval plant, 5 actinide partitioning plant
//     carbon_nanotube_yarn                              9 methane pyrolyser
//     cvd_diamond_plate                                 10 diamond lattice fab; read by 11, 12 and 17
//     qubit_array                                       12 qubit fab
//     archaeal_culture                                  13 vent bioreactor
//     silica_aerogel, silica_nanograins                 14 aerogel works
//     solar_core_survey, multimessenger_catalogue       15 neutrino observatory
//     neptune_probe_recording, triton_probe_recording   27 flyby probe bay
//     neptune_flyby_data, triton_flyby_data, pluto_kuiper_chart   16 deep space network
//     kuiper_target_list                                17 Kuiper survey telescope
//     scoop_head                                        the drill family's bit of the two siphons (18, 25)
//     ring_sail_net, ring_ice_sample                    20 ring harvester
//     titan_entry_probe, lake_sampler, tholin           21 entry probe bay
//     aerogel_cartridge                                 23 plume sampler
//     saturn_interior_model, uranus_transfer_chart      24 ring seismometer
//     ice_giant_atmosphere_sample                       25 ice-giant siphon
//     ice_giant_diamond_seed                            26 slurry separator
//     neptune_flyby_probe, neptune_sample               27 flyby probe bay
//     silicon_28_dust                                   the hot cell's Si-28 mode
//     pica_heat_shield                                  the composite autoclave's ablator mode
//   Fluids (GT materials, gtceu: ids as LuV's europan_brine; gas for the helium and hydrogen; zpm.md writes them with grindless:):
//     saturn_helium (18), uranus_hydrogen (25), enceladus_brine (23), actinide_raffinate (4), diamond_slurry (25), ring_ice (20)
//   Blocks (grindless:), the shared blocks of zpm.md "Our multiblocks":
//     naquadria_containment_casing, pressure_hull_casing, photomultiplier_casing, cryostat_casing, probe_bay_casing, synroc_block
//   LuV's station truss, frostproof and radiation vault casings are reused as they are.
//
//   Not here: zpm_smes_cell and the ZPM wireless covers (A5's wireless tier), rocket motors and tanks, planets, orbits, dimensions,
//   station items, and every other GT material (the package that needs an intermediate registers it).
//   Every id has no recipe until its package lands: tools/analysis/emi-coverage.mjs lists them as expected-unobtained.
//
// Textures: tools/assets/Build-ZPMFoundationTextures.ps1.
(function () {
  const G = global.grindless
  const ZPMF = G.zpmFoundation || (G.zpmFoundation = {})

  // item name -> stack size and optional item tag; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    radium_capsule: { stack: 16 },
    curium_oxide: { stack: 64 },
    carbon_nanotube_yarn: { stack: 64 },
    cvd_diamond_plate: { stack: 64 },
    qubit_array: { stack: 16 },
    archaeal_culture: { stack: 16 },
    silica_aerogel: { stack: 64 },
    solar_core_survey: { stack: 16 },
    multimessenger_catalogue: { stack: 16 },
    neptune_probe_recording: { stack: 16 },
    triton_probe_recording: { stack: 16 },
    neptune_flyby_data: { stack: 16 },
    triton_flyby_data: { stack: 16 },
    pluto_kuiper_chart: { stack: 16 },
    kuiper_target_list: { stack: 16 },
    scoop_head: { stack: 16, tag: 'grindless:drill_bits' },
    ring_sail_net: { stack: 16 },
    ring_ice_sample: { stack: 16 },
    titan_entry_probe: { stack: 16 },
    lake_sampler: { stack: 16 },
    aerogel_cartridge: { stack: 16 },
    silica_nanograins: { stack: 64 },
    saturn_interior_model: { stack: 16 },
    uranus_transfer_chart: { stack: 16 },
    ice_giant_atmosphere_sample: { stack: 16 },
    ice_giant_diamond_seed: { stack: 64 },
    neptune_flyby_probe: { stack: 16 },
    neptune_sample: { stack: 16 },
    tholin: { stack: 64 },
    silicon_28_dust: { stack: 64 },
    pica_heat_shield: { stack: 16 }
  }

  const BLOCKS = {
    naquadria_containment_casing: { glass: false },
    pressure_hull_casing: { glass: false },
    photomultiplier_casing: { glass: true },
    cryostat_casing: { glass: false },
    probe_bay_casing: { glass: false },
    synroc_block: { glass: false }
  }

  // GT material name -> colour, formula and whether it is a gas; GTM colours and buckets the fluid
  const FLUIDS = {
    saturn_helium: { colour: 0xE8D9A0, formula: 'He', gas: true },
    uranus_hydrogen: { colour: 0x9FDCE6, formula: 'H2(D2)', gas: true },
    enceladus_brine: { colour: 0xA9C4D6, formula: 'H2O(NaCl)(Na2CO3)', gas: false },
    actinide_raffinate: { colour: 0xB7C45A, formula: '(HNO3)(An)', gas: false },
    diamond_slurry: { colour: 0xC8E6F2, formula: 'C(H2O)', gas: false },
    ring_ice: { colour: 0xD7EEF7, formula: '(H2O)(SiO2)', gas: false }
  }

  ZPMF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  ZPMF.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name })
  ZPMF.fluids = Object.keys(FLUIDS).map(function (name) { return 'gtceu:' + name })

  // every id by camelCase name, as the other ZPM packages read them (ids.scoopHead, ids.saturnHelium...)
  ZPMF.ids = {}
  Object.keys(ITEMS).concat(Object.keys(BLOCKS), Object.keys(FLUIDS)).forEach(function (name) {
    var key = name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() })
    ZPMF.ids[key] = (FLUIDS[name] ? 'gtceu:' : 'grindless:') + name
  })

  StartupEvents.registry('block', function (event) {
    Object.keys(BLOCKS).forEach(function (name) {
      var block = event.create('grindless:' + name)
      if (BLOCKS[name].glass) block.glassSoundType()
      else block.stoneSoundType()
      block.hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll('grindless:block/zpm/' + name)
      block.item(function (item) {
        item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
      })
    })
  })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var spec = ITEMS[name]
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(spec.stack)
      for (var i = 0; i < 2; i++) {
        var line = Text.translate('tooltip.grindless.' + name + '.' + i)
        item.tooltip(i === 0 ? Text.gray(line) : Text.darkGray(line))
      }
      if (spec.tag) item.tag(spec.tag)
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(FLUIDS).forEach(function (name) {
      var spec = FLUIDS[name]
      var material = event.create(name)
      if (spec.gas) material.gas()
      else material.liquid()
      material.color(spec.colour)
        .formula(spec.formula)
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
