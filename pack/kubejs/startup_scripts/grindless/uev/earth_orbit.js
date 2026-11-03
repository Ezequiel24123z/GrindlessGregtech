// priority: -7524
// -----------------------------------------------------------------------------------------------
// UEV's Earth-orbit machines (docs/eras/uev.md, machines 16 and 17, lines 31, 32, 34, 36, 39 and 40; package UEV-A8): the quantum gas lab, the
// entanglement station, their recipe types and the package's own items. The recipes come from data/grindless/tables/earth_orbit.json
// (server_scripts/grindless/uev/earth_orbit.js); both types run in Earth orbit only (the recipes carry the dimension).
//
//   gtceu:quantum_gas_lab        type gtceu:quantum_degenerate_gas: circuit 1 the degenerate EOS model (Li-6 + K-40 Fermi mixture), 2 the Barnard
//                                gravity survey (atom interferometer on Barnard core rock), 3 calibrate the interferometer against the ULE cavity.
//   gtceu:entanglement_station   type gtceu:entanglement_distribution: circuit 1 the quantum repeater node.
//
// Voltage: UHV. New ids: the items below; the F1 ids (degenerate_eos_model, barnard_gravity_survey, quantum_repeater_node,
// lobster_eye_mcp, hollow_core_fibre, faraday_isolator) are not registered again.
// Geometry (lib/patterns.js): 5 wide x 5 high x 7 deep, hollow shells. Textures: tools/assets/Build-UEVEarthOrbitTextures.ps1.
// Names: client_scripts/grindless/uev_earth_orbit_lang.js. Published for the recipe script: global.grindless.uevEarthOrbit.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const EO = G.uevEarthOrbit || (G.uevEarthOrbit = {})
  const LOG = '[grindless/uev] '

  const PHOTONIC = 'grindless:photonic_casing'
  const PHOTONIC_TEXTURE = 'grindless:block/uev/photonic_casing'

  EO.table = 'kubejs/data/grindless/tables/earth_orbit.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  EO.items = {
    cnt_sock: { stack: 16 }, cnt_ribbon: { stack: 64 }, cnt_annealed_yarn: { stack: 64 }, cnt_sized_yarn: { stack: 64 }, cnt_densified_yarn: { stack: 64 }, cnt_twisted_yarn: { stack: 64 }, cnt_coiled_muscle: { stack: 64 },
    gallium_oxide_dust: { stack: 64 }, tgg_hydroxide_cake: { stack: 64 }, tgg_boule: { stack: 16 }, tgg_rod: { stack: 64 }, tgg_polished_rod: { stack: 64 },
    fused_silica_tube: { stack: 64 }, hollow_capillaries: { stack: 64 }, stacked_preform: { stack: 16 }, caned_preform: { stack: 16 }, drawn_hollow_fibre: { stack: 64 },
    mcp_lead_glass: { stack: 64 }, etchable_core_tube: { stack: 64 }, mcp_multifibre: { stack: 64 }, mcp_boule: { stack: 16 }, mcp_plate: { stack: 64 },
    mcp_etched_plate: { stack: 64 }, mcp_reduced_plate: { stack: 64 },
    kh2po4_dust: { stack: 64 }, ktp_flux: { stack: 64 }, ktp_boule: { stack: 16 }, ktp_wafer: { stack: 64 }, ktp_electroded_wafer: { stack: 64 }, spdc_source: { stack: 16 },
    ule_soot: { stack: 64 }, ule_boule: { stack: 16 }, ule_spacer: { stack: 64 }, ule_mirrored_spacer: { stack: 64 }, ule_cavity: { stack: 16 },
    li_cooling_laser: { stack: 16 }, k_cooling_laser: { stack: 16 }, atom_interferometer: { stack: 16 }, calibrated_gravimeter: { stack: 16 }
  }

  EO.machines = {
    gas_lab: {
      name: 'quantum_gas_lab',
      machine: 'gtceu:quantum_gas_lab',
      type: 'quantum_degenerate_gas',
      dataKey: 'grindless_quantum_degenerate_gas',
      lang: 'Quantum Gas Lab',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE,
      // items in: two isotopes or a sensor and rock, kept lasers or cavity, the circuit; out: the model, the survey or the gravimeter
      maxIO: { itemsIn: 6, itemsOut: 1, fluidsIn: 2, fluidsOut: 1 },
      width: 9, height: 9, depth: 9
    },
    station: {
      name: 'entanglement_station',
      machine: 'gtceu:entanglement_station',
      type: 'entanglement_distribution',
      dataKey: 'grindless_entanglement_distribution',
      lang: 'Entanglement Station',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE,
      // items in: source, memory, QD source, detectors, fibre and the circuit; out: the repeater node; fluids in: superfluid helium for the memory
      maxIO: { itemsIn: 7, itemsOut: 1, fluidsIn: 2, fluidsOut: 0 },
      width: 15, height: 10, depth: 7
    }
  }

  // The gas lab is a vacuum hall under a glass dome: a photonic vacuum chamber in three superhydride Feshbach coil rings, with laser
  // tables down both sides. The entanglement station is twin telescopes (SiC towers with photonic dishes) on a truss over a central
  // SPDC bench hall. Built in the registry callback (shapes.js may load after this file).
  function dish(s, cx, cz, y0) {
    ;[[3, 0], [4, 1], [5, 2]].forEach(function (p) { s.cyl('y', cx, cz, p[0], y0 + p[1], y0 + p[1], p[1] === 2 ? 'F' : 'R', true, '#') })
    s.set(cx, y0 + 1, cz, 'C')
  }
  var SHAPES = {
    gas_lab: {
      w: 15, h: 11, d: 15,
      fn: function () {
        var s = G.uevShapes.scene(15, 11, 15)
        s.room(0, 0, 0, 14, 4, 14, 'F', 't')
        s.box(0, 3, 0, 14, 4, 0, 'R').box(0, 3, 14, 14, 4, 14, 'R').box(0, 3, 1, 0, 4, 13, 'R').box(14, 3, 1, 14, 4, 13, 'R')
        s.box(0, 0, 0, 14, 0, 14, 'X')
        ;[0, 7, 14].forEach(function (z) { s.box(0, 5, z, 14, 5, z, 'R') })
        s.cone(7, 7, 5, 5, 9, 1, 'L', true)
        s.cyl('y', 7, 7, 2, 1, 6, 'O', true, '#')
        ;[2, 4, 6].forEach(function (y) { s.cyl('y', 7, 7, 3, y, y, 'M', true, null) })
        s.set(7, 1, 5, 'C').set(7, 1, 9, 'C').set(5, 1, 7, 'C').set(9, 1, 7, 'C')
        ;[1, 12].forEach(function (x) {
          s.box(x, 1, 3, x + 1, 1, 11, 'R').box(x, 2, 3, x, 2, 11, 'A')
          ;[4, 7, 10].forEach(function (z) { s.set(x, 3, z, 'L') })
        })
        s.box(5, 1, 1, 9, 1, 2, 'H')
        return s.booth('R', 3).fn()
      }
    },
    station: {
      w: 25, h: 13, d: 11,
      fn: function () {
        var s = G.uevShapes.scene(25, 13, 11)
        s.box(0, 0, 0, 24, 0, 10, 'X')
        s.room(7, 1, 0, 17, 3, 10, 'F')
        s.box(7, 3, 0, 17, 3, 10, 'R')
        s.box(9, 1, 3, 15, 1, 7, 'B').box(9, 2, 3, 15, 2, 3, 'L').box(9, 2, 7, 15, 2, 7, 'L')
        ;[3, 21].forEach(function (cx) {
          s.cyl('y', cx, 5, 2, 1, 7, 'R', true, '#')
          ;[3, 5].forEach(function (y) { s.cyl('y', cx, 5, 2, y, y, 'M', true, null) })
          s.cyl('y', cx, 5, 3, 1, 1, 'H', true, null)
          dish(s, cx, 5, 8)
          s.set(cx, 4, 3, 'L').set(cx, 6, 3, 'L')
        })
        ;[1, 9].forEach(function (z) { s.box(3, 11, z, 21, 11, z, 'Q') })
        s.box(12, 5, 5, 12, 11, 5, 'Q')
        return s.booth('R', 3).fn()
      }
    }
  }
  Object.keys(EO.machines).forEach(function (k) {
    var m = EO.machines[k]
    m.width = SHAPES[k].w
    m.height = SHAPES[k].h
    m.depth = SHAPES[k].d
  })

  function makeSpec(k) {
    var m = EO.machines[k]
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, fn: SHAPES[k].fn(),
      pal: G.uevShapes.palette(m.casing),
      parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 0, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        G.parallelHatch.part()
      ]
    })
  }

  // one EMI line per recipe, read from its data: what the circuit does
  function infoOf(dataKey) {
    return function (data) {
      try {
        var name = String(data.getString(dataKey))
        if (name === '') return ''
        return String(Text.translate('gtceu.recipe.' + dataKey + '.' + name).getString())
      } catch (e) {
        return ''
      }
    }
  }

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    Object.keys(EO.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(EO.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    Object.keys(EO.machines).forEach(function (k) {
      var m = EO.machines[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Object.keys(EO.machines).forEach(function (k) {
      var m = EO.machines[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = makeSpec(k)
      Pat.register(m.machine, m.spec)
      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
