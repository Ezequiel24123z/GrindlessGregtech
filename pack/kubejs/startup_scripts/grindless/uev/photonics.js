// -----------------------------------------------------------------------------------------------
// UEV's photonics (docs/eras/uev.md, machines 11, 12 and 13, lines 18, 19, 20, 21, 22 and 27; package UEV-A6): the SNSPD foundry, the van der
// Waals stacker and the photonic integration hall, their recipe types and the package's own items. The recipes come from
// data/grindless/tables/photonics_uev.json (server_scripts/grindless/uev/photonics.js).
//
//   gtceu:snspd_foundry            a cryostat that patterns and packages superconducting nanowire single-photon detectors.
//                                  The only maker of grindless:snspd. Type gtceu:snspd_fabrication (EU in): circuit 1 WSi film, 2 nanowire
//                                  write, 3 waveguide mount, 4 cool and package.
//   gtceu:vdw_stacker              a clean stacker that lays 2D crystals on each other. Type gtceu:vdw_assembly: circuit 1 hBN emitter chip,
//                                  2 graphene modulator, 3 hBN-encapsulated graphene.
//   gtceu:photonic_integration_hall  type gtceu:photonic_integration: circuit 1 waveguide circuit, 2 quantum photonic chip, 3 the optical
//                                  computer (gtnn:optical_computer: the ONLY recipe that makes it).
//
// Voltage: UHV, the voltage of the era's first machines (the design's 7.86 M EU/t for the hall's circuit 3 is tuned down to UHV's 1.97 M EU/t
// and made longer). New ids: the items below (the table's grindless: ids); the F1 ids (snspd, qd_source, sdd, uev_*) are not registered again.
// Geometry (lib/patterns.js): 5 wide x 5 high x 7 deep (stacker 5 x 5 x 5), hollow shells.
// Textures: tools/assets/Build-UEVPhotonicsTextures.ps1. Names: client_scripts/grindless/uev_photonics_lang.js.
// Published for the recipe script: global.grindless.uevPhotonics.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const UP = G.uevPhotonics || (G.uevPhotonics = {})
  const LOG = '[grindless/uev] '

  const FROST = 'gtceu:frostproof_machine_casing'
  const FROST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'
  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const UV_CASING = 'gtceu:uv_machine_casing'
  const UV_TEXTURE = 'gtceu:block/casings/voltage/uv/side'

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
    hbn_emitter_chip: { stack: 64 },
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
      casing: FROST, texture: FROST_TEXTURE, sound: 'ARC',
      // items in: the wafer or die, one part, the circuit; out: the wafer or the detector; fluids in: argon, resist or superfluid helium
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 2, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    },
    stacker: {
      name: 'vdw_stacker',
      machine: 'gtceu:vdw_stacker',
      type: 'vdw_assembly',
      dataKey: 'grindless_vdw_assembly',
      lang: 'Van der Waals Stacker',
      casing: CLEAN, texture: CLEAN_TEXTURE, sound: 'ARC',
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
      casing: UV_CASING, texture: UV_TEXTURE, sound: 'ARC',
      // items in: the circuit 2 chip takes six parts and the circuit; out: the chip or the computer; no fluids
      maxIO: { itemsIn: 8, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    }
  }

  // A hollow shell: row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller (front wall, row 1, middle).
  function shell(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var ch
          var isWall = si === 0 || si === last || c === 0 || c === m.width - 1
          if (r === 0) ch = 'X'
          else if (r === m.height - 1) ch = 'F'
          else if (si === last && r === 1 && c === mid) ch = 'S'
          else if (isWall) ch = 'F'
          else ch = '#'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  Object.keys(UP.machines).forEach(function (k) {
    var m = UP.machines[k]
    m.spec = {
      slices: shell(m),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(m.casing)].concat([
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 0, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('energy_input', { min: 1, max: 2 })
        ])),
        F: Pat.block(m.casing),
        '#': Pat.air()
      }
    }
  })

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
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
