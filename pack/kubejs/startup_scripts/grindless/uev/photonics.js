// priority: -7592
// -----------------------------------------------------------------------------------------------
// UEV's photonics (docs/eras/uev.md, machines 11, 12 and 13, lines 18, 19, 20, 21, 22 and 27; package UEV-A6): the SNSPD foundry, the van der
// Waals stacker and the photonic integration hall, their recipe types and the package's own items. The recipes come from
// data/grindless/tables/photonics_uev.json (server_scripts/grindless/uev/photonics.js).
//
//   gtceu:snspd_foundry            a cryostat that patterns and packages superconducting nanowire single-photon detectors.
//                                  The only maker of grindless:snspd. Type gtceu:snspd_fabrication (EU in): circuit 1 WSi film, 2 nanowire
//                                  write, 3 waveguide mount, 4 cool and package.
//   gtceu:vdw_stacker              a clean stacker that lays 2D crystals on each other. Type gtceu:vdw_assembly: circuit 2 graphene modulator,
//                                  3 hBN-encapsulated graphene (4, 5 and 6: graphene rings, hBN encapsulation and printed dots on the photonic
//                                  wafer, startup_scripts/grindless/uev/photonic_wafer.js).
//   gtceu:photonic_integration_hall  type gtceu:photonic_integration: circuit 1 waveguide circuit, 2 quantum photonic chip (cryopackaged pigtailed die), 3 the optical
//                                  computer (gtnn:optical_computer: the ONLY recipe that makes it), 11 the fibre pigtail.
//
// Voltage: UHV, the voltage of the era's first machines (the design's 7.86 M EU/t for the hall's circuit 3 is tuned down to UHV's 1.97 M EU/t
// and made longer). New ids: the items below (the table's grindless: ids); the F1 ids (snspd, qd_source, sdd, uev_*) are not registered again.
// Geometry (lib/patterns.js): a cryostat hall, a banded tower and a cleanroom integration hall (shapes in uev/shapes.js).
// Textures: tools/assets/Build-UEVPhotonicsTextures.ps1. Names: client_scripts/grindless/uev_photonics_lang.js.
// Published for the recipe script: global.grindless.uevPhotonics.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const UP = G.uevPhotonics || (G.uevPhotonics = {})
  const LOG = '[grindless/uev] '

  const PHOTONIC = 'grindless:photonic_casing'
  const PHOTONIC_TEXTURE = 'grindless:block/uev/photonic_casing'

  UP.table = 'kubejs/data/grindless/tables/photonics_uev.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  UP.items = {
    fz_silicon_boule: { stack: 16 },
    fz_silicon_wafer: { stack: 64 },
    oxidised_wafer: { stack: 64 },
    sdd_implanted_wafer: { stack: 64 },
    sdd_annealed_wafer: { stack: 64 },
    sin_coated_wafer: { stack: 64 },
    sin_lithographed_wafer: { stack: 64 },
    sin_etched_wafer: { stack: 64 },
    annealed_sin_chip: { stack: 64 },
    wsi_wafer: { stack: 64 },
    wsi_nanowire_wafer: { stack: 64 },
    snspd_die: { stack: 64 },
    borazine_ampoule: { stack: 16 },
    hbn_copper_foil: { stack: 64 },
    hbn_film: { stack: 64 },
    annealed_hbn_film: { stack: 64 },
    electropolished_copper_foil: { stack: 64 },
    graphene_copper_foil: { stack: 64 },
    pmma_graphene_foil: { stack: 64 },
    pmma_graphene_film: { stack: 64 },
    graphene_film: { stack: 64 },
    encapsulated_graphene: { stack: 64 },
    graphene_modulator: { stack: 64 },
    seven_n_indium: { stack: 64 },
    inas_qd_wafer: { stack: 64 },
    micropillar_wafer: { stack: 64 },
    waveguide_circuit: { stack: 64 },
    quantum_photonic_chip: { stack: 64 }
  }

  UP.machines = {
    snspd: {
      name: 'snspd_foundry',
      machine: 'gtceu:snspd_foundry',
      type: 'snspd_fabrication',
      dataKey: 'grindless_snspd_fabrication',
      lang: 'SNSPD Foundry',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE, sound: 'ARC',
      // items in: the wafer or die, one part, the circuit; out: the wafer or the detector; fluids in: argon, resist or superfluid helium
      maxIO: { itemsIn: 5, itemsOut: 1, fluidsIn: 2, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    },
    stacker: {
      name: 'vdw_stacker',
      machine: 'gtceu:vdw_stacker',
      type: 'vdw_assembly',
      // D4-SHAPE-UXV-B: the UXV vdW stacking cell's recipe type runs here too
      extraTypes: ['vdw_stacking'],
      dataKey: 'grindless_vdw_assembly',
      lang: 'Van der Waals Stacker',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE, sound: 'ARC',
      // items in: up to three films or chips and the circuit; out: the stack; no fluids
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 },
      width: 5, height: 5, depth: 5
    },
    hall: {
      name: 'photonic_integration_hall',
      machine: 'gtceu:photonic_integration_hall',
      type: 'photonic_integration',
      dataKey: 'grindless_photonic_integration',
      lang: 'Photonic Integration Hall',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE, sound: 'ARC',
      // items in: the circuit 2 chip takes six parts and the circuit; out: the chip or the computer; no fluids
      maxIO: { itemsIn: 8, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    }
  }

  // The foundry is a long photonic-casing cleanroom bay with a row of four process stations down its aisle (sputter chamber, e-beam
  // writer, etcher, cryoprober) under SiC rafters and a ridge. The stacker is a glovebox train with transfer stages and microscope
  // turrets. Built in the registry callback (shapes.js may load after this file).
  var SHAPES = {
    snspd: {
      w: 11, h: 9, d: 23,
      fn: function () {
        var s = G.uevShapes.scene(11, 9, 23)
        s.room(0, 0, 0, 10, 5, 22, 'F', 't')
        s.box(0, 4, 0, 10, 5, 0, 'R').box(0, 4, 22, 10, 5, 22, 'R').box(0, 4, 1, 0, 5, 21, 'R').box(10, 4, 1, 10, 5, 21, 'R')
        s.box(0, 0, 0, 10, 0, 22, 'X')
        ;[0, 8, 16, 20].forEach(function (z) { s.box(0, 6, z, 10, 6, z, 'R') })
        s.box(4, 7, 1, 6, 7, 21, 'R').box(5, 8, 3, 5, 8, 19, 'R')
        ;[2, 7, 12, 17].forEach(function (z) {
          s.box(2, 1, z, 4, 1, z + 2, 'R')
          s.box(6, 1, z, 8, 3, z + 2, 'R').box(7, 2, z + 1, 7, 2, z + 1, '#')
        })
        s.cyl('y', 3, 3, 1, 2, 4, 'R', true, null)
        s.box(2, 2, 7, 4, 4, 9, 'B').set(3, 3, 8, 'P')
        s.box(2, 2, 12, 4, 3, 14, 'A').box(2, 3, 12, 2, 3, 14, 'L')
        s.box(2, 2, 17, 4, 4, 19, 'B').set(3, 5, 18, 'C').set(3, 4, 18, 'C').set(3, 3, 18, 'C')
        ;[2, 7, 12, 17].forEach(function (z) { s.set(1, 3, z + 1, 'L').set(9, 3, z + 1, 'L') })
        return s.booth('F', 3).fn()
      }
    },
    stacker: {
      w: 15, h: 11, d: 19,
      fn: function () {
        var s = G.uevShapes.scene(15, 11, 19)
        s.box(0, 0, 0, 14, 0, 18, 'X')
        s.room(1, 1, 2, 13, 4, 16, 'F')
        s.box(1, 4, 2, 13, 4, 16, 'R')
        ;[3, 7, 11].forEach(function (x) { s.box(x, 5, 3, x + 1, 5, 15, 'R') })
        ;[3, 7, 11].forEach(function (x) {
          s.cyl('y', x, 5, 1, 5, 9, 'R', true, null)
          s.cyl('y', x, 5, 1, 7, 7, 'C', true, null)
          s.set(x, 10, 5, 'L')
        })
        ;[4, 8, 12].forEach(function (z) {
          s.box(2, 5, z, 12, 6, z, 'A').box(3, 7, z, 11, 7, z, 'L')
        })
        s.box(1, 1, 8, 13, 1, 10, 'B')
        return s.booth('F', 3).fn()
      }
    },
    // the integration hall (23 x 11 x 23): a cleanroom hall of photonic casing round a central gallery under a clerestory of glass. Four
    // flip-chip bonder cells down the left (SiC, a gearbox stage and a pump), four fibre-attach cells down the right, SiC roof ribs.
    hall: {
      w: 23, h: 11, d: 23,
      fn: function () {
        var s = G.uevShapes.scene(23, 11, 23)
        s.box(7, 0, 0, 15, 0, 22, 'X')
        s.room(0, 1, 0, 22, 4, 22, 'O', 'bt', '#')
        ;[4, 9, 14, 19].forEach(function (z) {
          s.box(0, 3, z, 0, 4, z + 1, 'L').box(22, 3, z, 22, 4, z + 1, 'L')
          s.room(2, 1, z - 1, 6, 4, z + 2, 'R', '', '#')
          s.set(4, 2, z, 'B').set(4, 3, z, 'C')
          s.room(16, 1, z - 1, 20, 4, z + 2, 'R', '', '#')
          s.set(18, 2, z, 'B').set(18, 3, z, 'P')
        })
        s.room(6, 5, 1, 16, 9, 21, 'O', 'bt', '#')
        s.box(8, 10, 1, 14, 10, 21, 'L')
        s.box(7, 8, 1, 15, 8, 1, 'L').box(7, 8, 21, 15, 8, 21, 'L')
        s.box(10, 10, 6, 12, 10, 16, 'R')
        return s.booth('R', 3).fn()
      }
    }
  }

  Object.keys(UP.machines).forEach(function (k) {
    var m = UP.machines[k]
    m.width = SHAPES[k].w
    m.height = SHAPES[k].h
    m.depth = SHAPES[k].d
  })

  function makeSpec(k) {
    var m = UP.machines[k]
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
    Object.keys(UP.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(UP.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    Object.keys(UP.machines).forEach(function (k) {
      var m = UP.machines[k]
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
    Object.keys(UP.machines).forEach(function (k) {
      var m = UP.machines[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = makeSpec(k)
      Pat.register(m.machine, m.spec)
      var types = [m.type].concat(m.extraTypes || [])
      var b = event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
      types.forEach(function (t) { b = b.recipeType(t) })
      b.recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          types.length === 2
            ? Text.translate('gtceu.machine.available_recipe_map_2.tooltip', Text.translate('gtceu.' + types[0]), Text.translate('gtceu.' + types[1]))
            : Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
