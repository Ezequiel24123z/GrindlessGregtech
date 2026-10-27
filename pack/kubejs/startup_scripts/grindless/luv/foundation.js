// priority: -4000
// -----------------------------------------------------------------------------------------------
// LuV foundation (package LuV-A1, docs/eras/luv.md "Build order"): the shared registrations that the LuV packages build on. No
// machines, no recipe types, no recipes, no dimensions and no wireless tier here: each later package registers its own machine and
// writes the recipes of what it makes. Every other LuV package uses exactly these ids; they are published in
// global.grindless.luvFoundation.
//
//   GT materials (their items and fluids are gtceu:, like every GTM material):
//     meteoric_iron    Fe-Ni-Co (kamacite), the belt's M-type ore: dust and ore forms. Ore byproducts iron, nickel and cobalt only, so
//                      the asteroid PGM concentrate stays the asteroid processor's alone (its Mond process). Formula only and
//                      DISABLE_DECOMPOSITION: GTM makes no electrolysis or mixing for it.
//     tetrataenite     L1_0-ordered FeNi, the meteorite-only permanent magnet: ingot, rod (the magnet works' bearings), dust and ore
//                      forms. Ore byproducts nickel, iron and cobalt; NO_ORE_SMELTING (a furnace's melt loses the order: the asteroid
//                      processor splits it by magnet) and DISABLE_DECOMPOSITION.
//     zblan            the fluoride glass ZrF4-BaF2-LaF3-AlF3-NaF (53:20:4:3:20 mol %): dust only, a glass. The mixer recipe that makes
//                      it and the microgravity smelter's fibre belong to package B3.
//     europan_brine    Europa's ocean: water with magnesium sulfate and sodium chloride. A liquid; DISABLE_DECOMPOSITION, so its
//                      electrolyzer and centrifuge recipes are written by package B8 (the cryobot's).
//   The four are hidden from EMI until their package gives them a route (data/grindless/tables/hidden_until.json, until "luv").
//   Two forms of existing GT materials are added (materialModification), with GTM's own routes: gtceu:germanium_plate (GENERATE_PLATE;
//   the triple-junction wafer, B3) and gtceu:dense_titanium_plate (GENERATE_DENSE; the radiation vault casing). Neither is hidden.
//
//   Items (grindless:), names in client_scripts/grindless/luv_foundation_lang.js. The package that writes each one's recipes:
//     nickel_tungsten_tape, itbtc_coated_conductor                                  A3 coated conductor line
//     engineered_barley_seed, engineered_tobacco_seed                                A5 biofoundry
//     asteroid_quantum_seed, ionian_quantum_seed, europan_quantum_seed,
//       ganymedean_quantum_seed                                                      B1 travel (bridges and first landings)
//     triple_junction_wafer, triple_junction_cell                                    B3 wake shield facility (and GTM's cutter)
//     neurotrophic_factor, neural_organoid                                           B4 rotating hydroponic ring, organoid lab
//     hss_s_drill_bit, anchor_harpoon, asteroid_pgm_concentrate, capture_bag,
//       chondritic_extract                                                           B5 the belt (harpoon drill, asteroid processor,
//                                                                                    optical miner); the concentrate's use is A2's
//                                                                                    platinum plant mode 4
//     ionian_sublimate, heat_exchanger_bundle                                        B6 Io's surface
//     tether_spool                                                                   B7 Io orbit (the flux-tube tether)
//     cryobot_probe, melt_head, europan_ocean_sample                                 B8 Europa (cryobot, algae bioreactor)
//     jupiter_entry_probe, saturn_flyby_probe, jovian_atmosphere_survey,
//       saturn_transfer_chart, gravitational_wave_catalogue                          B9 Ganymede (GW detector, coilgun launcher)
//   Blocks (grindless:), the shared blocks of docs/eras/luv.md "Our multiblocks"; the first package that needs one writes its recipe:
//     station_truss_casing      the station modules' casing (titanium frame + 4 aluminium plates -> 2, 1,920 EU/t x 100 t (tune))
//     radiation_vault_casing    graded-Z vault (2 dense titanium + 2 tantalum plates + an HSS-S frame -> 2, 7,680 EU/t x 100 t (tune));
//                               every pattern on Io, Europa and in Io orbit carries it
//     whipple_shield_casing     the microgravity smelter's foam bumper (B3)
//     asteroid_regolith_casing  sintered belt rubble, made only on the belt (B5)
//     sulfur_concrete_casing    the fumarole condenser's concrete, made only on Io (B6)
//     orbital_solar_panel       the orbital solar station's panel (B2): a thin slab like the Mercury thin-film panel
//     magnetic_bearing          tetrataenite magnet bearing from the HTS magnet works (A4); the ring's hub (B4)
//     coilgun_coil_casing       Hg-1223 coil from the HTS magnet works (A4); the coilgun's barrel (B9)
//     sapphire_test_mass        the zero-g crystal grower's sapphire (B4); the GW detector's mirrors (B9)
//   Every item and block above is hidden from EMI (hidden_until.json, until "luv") until its package gives it a route: that package
//   deletes its lines from hidden_until.json and its rule from tools/analysis/tiers/obtain.json.
//
//   Not here: the machines and their types (each package), grindless:luv_smes_cell and the LuV wireless hatches and covers (A4),
//   grindless:cryogenic_fuel_tank (B1, after spike S0-2), the planets and dimensions (after spike S0-1) and veins_belt.json (B5).
//
//   The sunlight table, data/grindless/tables/sunlight.json (docs/eras/luv.md "Sunlight: one authoritative table", decision 9), is
//   loaded here into global.grindless.tables.sunlight and read through G.sunlight.factor(dimension).
//
// Textures: tools/assets/Build-LuVFoundationTextures.ps1.
(function () {
  const G = global.grindless
  const LUVF = G.luvFoundation || (G.luvFoundation = {})
  const LOG = '[grindless/luv] '

  // ---------------------------------------------------------------- the sunlight table

  G.tables.sunlight = G.readJsonTable('kubejs/data/grindless/tables/sunlight.json')
  if (!G.tables.sunlight || !G.tables.sunlight.dimensions || Object.keys(G.tables.sunlight.dimensions).length === 0) {
    throw new Error(LOG + 'sunlight.json has no dimensions')
  }
  G.sunlight = {
    table: G.tables.sunlight,
    // the factor of a dimension (Earth's surface by day = 1.0), or null where no solar machine works or the dimension isn't listed
    factor: function (dimension) {
      var row = G.tables.sunlight.dimensions[String(dimension)]
      return row && typeof row.factor === 'number' ? row.factor : null
    }
  }
  console.info(LOG + 'loaded ' + Object.keys(G.tables.sunlight.dimensions).length + ' sunlight rows')

  // ---------------------------------------------------------------- ids

  LUVF.materials = {
    meteoricIron: 'meteoric_iron',
    tetrataenite: 'tetrataenite',
    zblan: 'zblan',
    europanBrine: 'europan_brine'
  }

  // item name -> tooltip lines (tooltip.grindless.<name>.<n>), stack size and the package that writes its recipes
  const ITEMS = {
    nickel_tungsten_tape: { lines: 2, stack: 64, pkg: 'A3' },
    itbtc_coated_conductor: { lines: 2, stack: 64, pkg: 'A3' },
    engineered_barley_seed: { lines: 2, stack: 64, pkg: 'A5' },
    engineered_tobacco_seed: { lines: 2, stack: 64, pkg: 'A5' },
    asteroid_quantum_seed: { lines: 2, stack: 16, pkg: 'B1' },
    ionian_quantum_seed: { lines: 2, stack: 16, pkg: 'B1' },
    europan_quantum_seed: { lines: 2, stack: 16, pkg: 'B1' },
    ganymedean_quantum_seed: { lines: 2, stack: 16, pkg: 'B1' },
    triple_junction_wafer: { lines: 2, stack: 64, pkg: 'B3' },
    triple_junction_cell: { lines: 2, stack: 64, pkg: 'B3' },
    neurotrophic_factor: { lines: 2, stack: 64, pkg: 'B4' },
    neural_organoid: { lines: 2, stack: 64, pkg: 'B4' },
    hss_s_drill_bit: { lines: 2, stack: 16, pkg: 'B5', tag: 'grindless:drill_bits' },
    anchor_harpoon: { lines: 2, stack: 16, pkg: 'B5' },
    asteroid_pgm_concentrate: { lines: 2, stack: 64, pkg: 'B5' },
    capture_bag: { lines: 2, stack: 16, pkg: 'B5' },
    chondritic_extract: { lines: 2, stack: 64, pkg: 'B5' },
    ionian_sublimate: { lines: 2, stack: 64, pkg: 'B6' },
    heat_exchanger_bundle: { lines: 2, stack: 16, pkg: 'B6' },
    tether_spool: { lines: 2, stack: 16, pkg: 'B7' },
    cryobot_probe: { lines: 2, stack: 16, pkg: 'B8' },
    melt_head: { lines: 2, stack: 16, pkg: 'B8' },
    europan_ocean_sample: { lines: 2, stack: 16, pkg: 'B8' },
    jupiter_entry_probe: { lines: 2, stack: 16, pkg: 'B9' },
    saturn_flyby_probe: { lines: 2, stack: 16, pkg: 'B9' },
    jovian_atmosphere_survey: { lines: 2, stack: 16, pkg: 'B9' },
    saturn_transfer_chart: { lines: 2, stack: 16, pkg: 'B9' },
    gravitational_wave_catalogue: { lines: 2, stack: 16, pkg: 'B9' }
  }

  // block name -> sound, the package that writes its recipe (the first one that needs it), and the panel's own model
  const BLOCKS = {
    station_truss_casing: { sound: 'stone', pkg: 'B1' },
    radiation_vault_casing: { sound: 'stone', pkg: 'B6' },
    whipple_shield_casing: { sound: 'stone', pkg: 'B3' },
    asteroid_regolith_casing: { sound: 'stone', pkg: 'B5' },
    sulfur_concrete_casing: { sound: 'stone', pkg: 'B6' },
    orbital_solar_panel: { sound: 'glass', pkg: 'B2', panel: true },
    magnetic_bearing: { sound: 'stone', pkg: 'A4' },
    coilgun_coil_casing: { sound: 'stone', pkg: 'A4' },
    sapphire_test_mass: { sound: 'glass', pkg: 'B4' }
  }

  LUVF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  LUVF.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name })
  LUVF.packages = {}
  Object.keys(ITEMS).forEach(function (name) { LUVF.packages['grindless:' + name] = ITEMS[name].pkg })
  Object.keys(BLOCKS).forEach(function (name) { LUVF.packages['grindless:' + name] = BLOCKS[name].pkg })

  LUVF.ids = {
    meteoricIronDust: 'gtceu:meteoric_iron_dust',
    meteoricIronRaw: 'gtceu:raw_meteoric_iron',
    meteoricIronCrushed: 'gtceu:crushed_meteoric_iron_ore',
    tetrataeniteDust: 'gtceu:tetrataenite_dust',
    tetrataeniteIngot: 'gtceu:tetrataenite_ingot',
    tetrataeniteRod: 'gtceu:tetrataenite_rod',
    tetrataeniteRaw: 'gtceu:raw_tetrataenite',
    tetrataeniteCrushed: 'gtceu:crushed_tetrataenite_ore',
    zblanDust: 'gtceu:zblan_dust',
    europanBrine: 'gtceu:europan_brine'
  }
  Object.keys(ITEMS).concat(Object.keys(BLOCKS)).forEach(function (name) {
    var key = name.replace(/_([a-z])/g, function (m, c) { return c.toUpperCase() })
    LUVF.ids[key] = 'grindless:' + name
  })

  LUVF.textures = {
    panelCells: 'grindless:block/luv/orbital_solar_cells',
    panelFrame: 'grindless:block/luv/orbital_solar_frame',
    panelModel: 'grindless:block/luv/orbital_solar_panel'
  }

  // ---------------------------------------------------------------- GT materials

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(LUVF.materials.meteoricIron)
      .dust()
      .ore()
      .addOreByproducts(GTMaterials.Iron, GTMaterials.Nickel, GTMaterials.Cobalt)
      .color(0x8C8E8A).secondaryColor(0x4A3C33)
      .iconSet(GTMaterialIconSet.METALLIC)
      .formula('(Fe,Ni,Co)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(LUVF.materials.tetrataenite)
      .ingot()
      .ore()
      .addOreByproducts(GTMaterials.Nickel, GTMaterials.Iron, GTMaterials.Cobalt)
      .color(0xB3AE8E).secondaryColor(0x3F4A44)
      .iconSet(GTMaterialIconSet.METALLIC)
      .formula('FeNi')
      .flags(GTMaterialFlags.GENERATE_ROD, GTMaterialFlags.DISABLE_DECOMPOSITION, GTMaterialFlags.NO_ORE_SMELTING)

    event.create(LUVF.materials.zblan)
      .dust()
      .color(0xD9ECEF).secondaryColor(0x7FA9B8)
      .iconSet(GTMaterialIconSet.GLASS)
      .formula('(ZrF4)53(BaF2)20(LaF3)4(AlF3)3(NaF)20')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(LUVF.materials.europanBrine)
      .liquid()
      .color(0x2F6E8E)
      .formula('H2O(MgSO4)(NaCl)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })

  // ---------------------------------------------------------------- forms LuV needs of existing GT materials

  // GTM 7.5.3 (and the addons that give germanium its ingot) generate neither form; the LuV design asks for both. materialModification
  // runs before GTM generates the items and the recipes, so each form comes with GTM's own routes (bender, forge hammer, extruder,
  // compressor and cutter for the plate; the bender from 9 plates for the dense plate) and its recycling.
  //   germanium   GENERATE_PLATE   the wake shield facility's triple-junction wafer (B3) takes a germanium plate
  //   titanium    GENERATE_DENSE   the radiation vault casing (2 dense titanium + 2 tantalum plates + an HSS-S frame)
  LUVF.addedFlags = { germanium: ['GENERATE_PLATE'], titanium: ['GENERATE_DENSE'] }
  LUVF.ids.germaniumPlate = 'gtceu:germanium_plate'
  LUVF.ids.denseTitaniumPlate = 'gtceu:dense_titanium_plate'

  GTCEuStartupEvents.materialModification(function (event) {
    var flagsOf = { germanium: [GTMaterialFlags.GENERATE_PLATE], titanium: [GTMaterialFlags.GENERATE_DENSE] }
    Object.keys(flagsOf).forEach(function (name) {
      try {
        var material = GTMaterials.get(name)
        if (material == null || material.isNull()) {
          console.error(LOG + 'GT material ' + name + ' not found: ' + LUVF.addedFlags[name].join(', ') + ' not added')
          return
        }
        flagsOf[name].forEach(function (flag) {
          if (!material.hasFlag(flag)) material.addFlags(flag)
        })
        console.info(LOG + name + ': ' + LUVF.addedFlags[name].join(', '))
      } catch (e) {
        console.error(LOG + name + ': flags not added: ' + e)
      }
    })
  })

  // ---------------------------------------------------------------- blocks

  StartupEvents.registry('block', function (event) {
    Object.keys(BLOCKS).forEach(function (name) {
      var spec = BLOCKS[name]
      var block = event.create('grindless:' + name)
      if (spec.sound === 'glass') block.glassSoundType()
      else block.stoneSoundType()
      block.hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
      if (spec.panel) {
        // a thin slab on its frame, like the IV Mercury thin-film panel (models/block/luv/orbital_solar_panel.json)
        block.box(0, 6, 0, 16, 9, 16, true)
          .notSolid()
          .textureAll(LUVF.textures.panelCells)
          .model(LUVF.textures.panelModel)
      } else {
        block.textureAll('grindless:block/luv/' + name)
      }
      block.item(function (item) {
        item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
      })
    })
  })

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var spec = ITEMS[name]
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(spec.stack)
      for (var i = 0; i < spec.lines; i++) {
        var line = Text.translate('tooltip.grindless.' + name + '.' + i)
        item.tooltip(i === 0 ? Text.gray(line) : Text.darkGray(line))
      }
      if (spec.tag) item.tag(spec.tag)
    })
  })
})()
