// priority: -8200
// -----------------------------------------------------------------------------------------------
// UHV's photonics (docs/eras/uhv.md, machines 5 and 6, lines 5, 6, 7 and 9; package UHV-A4): the MBE reactor and the photonic foundry,
// their recipe types, and the package's own items. The recipes come from data/grindless/tables/photonics.json
// (server_scripts/grindless/uhv/photonics.js), which also holds the older machines' rows of the package: the ZPM ion implanter's
// circuits 3-4 (helium smart-cut, SiC aluminium implant), the GST target in GTM's electric blast furnace and the tellurium it needs.
//
//   gtceu:mbe_reactor            Faist et al. (Bell Labs, 1994): a quantum cascade laser is hundreds of InGaAs/AlInAs layers a few atoms
//                                thick on InP, grown by molecular beam epitaxy in ultra-high vacuum. UV's machine casing round a beam
//                                path, effusion cells (tungstensteel pipe) at the back and a liquid-nitrogen cryoshroud (frostproof
//                                casing) on both sides. It refuses to void (the arsenic scraped off the cryoshroud is contained).
//   gtceu:molecular_beam_epitaxy its recipe type (EU in). Circuit 1: the superlattice wafer. 2: eight quantum cascade lasers.
//   gtceu:photonic_foundry       thin-film lithium niobate on insulator (HyperLight/Harvard), phase-change GST weights (IBM) and Eu:YSO
//                                memory (ANU, 2015) in a clean room: a wafer bonder (gearboxes), a sputter chamber (tungstensteel pipe)
//                                and filter casings under the ceiling. The only maker of GT--'s optical processor and optical assembly.
//   gtceu:photonic_foundry       its recipe type (EU in). Circuit 1: LNOI (smart-cut). 2: PCM dies (GST sputtered on LNOI). 3: quantum
//                                memory chips. 4: optical processor. 5: optical assembly. 6: thin-film modulators. Every recipe rinses
//                                with 1,000 mB ultrapure water (A3's plant), which comes back as water.
//
// New ids (the F1 ones are in uhv/foundation.js and are not registered again: quantum_cascade_laser, thin_film_ln_modulator,
// lithium_niobate_wafer, eu_yso_boule, inp_wafer):
//   items qcl_superlattice_wafer (MBE c1), implanted_ln_wafer (ion implanter c3), lnoi_wafer (foundry c1), gst_target and
//         spent_gst_target (blast furnace, foundry c2), pcm_photonic_die (foundry c2), quantum_memory_chip (foundry c3),
//         sic_epi_wafer (A5's SiC device fab c2 makes it) and implanted_sic_wafer (ion implanter c4, read by A5's c3)
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): the reactor is 5 wide x 5 high x 7 deep, the foundry
// 9 wide x 5 high x 9 deep (clean casing, a laminated-glass window in the front wall).
// Textures: tools/assets/Build-UHVPhotonicsTextures.ps1. Names: client_scripts/grindless/uhv_photonics_lang.js.
// Published for the recipe script: global.grindless.uhvPhotonics (global.grindless.photonics is UV's fibre tower and MOCVD).
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const PH = G.uhvPhotonics || (G.uhvPhotonics = {})
  const LOG = '[grindless/uhv] '

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const UV_CASING = 'gtceu:uv_machine_casing'
  const UV_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const TUNGSTEN_PIPE = 'gtceu:tungstensteel_pipe_casing'
  const FROST = 'gtceu:frostproof_machine_casing'
  const BONDER = 'gtceu:stainless_steel_gearbox'
  const FILTER = 'gtceu:filter_casing'
  const GLASS = 'gtceu:laminated_glass'

  PH.table = 'kubejs/data/grindless/tables/photonics.json'
  PH.reactorNoVoiding = 'grindless.machine.mbe_reactor.no_voiding'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  PH.items = {
    qcl_superlattice_wafer: { stack: 64 },
    implanted_ln_wafer: { stack: 64 },
    lnoi_wafer: { stack: 64 },
    gst_target: { stack: 16 },
    spent_gst_target: { stack: 16 },
    pcm_photonic_die: { stack: 64 },
    quantum_memory_chip: { stack: 64 },
    sic_epi_wafer: { stack: 64 },
    implanted_sic_wafer: { stack: 64 }
  }
  PH.ids = {
    qclSuperlatticeWafer: 'grindless:qcl_superlattice_wafer',
    implantedLnWafer: 'grindless:implanted_ln_wafer',
    lnoiWafer: 'grindless:lnoi_wafer',
    gstTarget: 'grindless:gst_target',
    spentGstTarget: 'grindless:spent_gst_target',
    pcmPhotonicDie: 'grindless:pcm_photonic_die',
    quantumMemoryChip: 'grindless:quantum_memory_chip',
    sicEpiWafer: 'grindless:sic_epi_wafer',
    implantedSicWafer: 'grindless:implanted_sic_wafer',
    opticalProcessor: 'gtnn:optical_processor',
    opticalAssembly: 'gtnn:optical_assembly'
  }

  PH.machines = {
    reactor: {
      name: 'mbe_reactor',
      machine: 'gtceu:mbe_reactor',
      type: 'molecular_beam_epitaxy',
      dataKey: 'grindless_molecular_beam_epitaxy',
      lang: 'MBE Reactor',
      // items in: the InP wafer, four effusion-cell charges and the circuit; out: the wafer and the scraped arsenic;
      // fluid in: the cryoshroud's liquid nitrogen; out: the boiled-off nitrogen
      maxIO: { itemsIn: 6, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      width: 5, height: 5, depth: 7
    },
    foundry: {
      name: 'photonic_foundry',
      machine: 'gtceu:photonic_foundry',
      type: 'photonic_foundry',
      dataKey: 'grindless_photonic_foundry',
      lang: 'Photonic Foundry',
      // items in: up to four parts, a neutraliser and the circuit (the optical processor takes four kinds and the circuit);
      // out: the product, the reused donor wafer and the fluorite; fluids in: ultrapure water, oxygen, HF (or the argon charge);
      // out: the rinse water
      maxIO: { itemsIn: 6, itemsOut: 3, fluidsIn: 3, fluidsOut: 1 },
      width: 9, height: 5, depth: 9
    }
  }

  // A hollow shell: row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller (front wall, row 1, middle).
  function shell(m, inner, wall) {
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
          else if (isWall) ch = (wall && wall(r, si, c)) || 'F'
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // effusion cells (T) across the back; the cryoshroud (K) on both sides of the beam path (column 2), which is vacuum
  function reactorInner(r, si, c) {
    if (si === 1) return 'T'
    if (c === 1 || c === 3) return 'K'
    return '#'
  }

  // a 3 x 2 window above the controller
  function foundryWall(r, si, c) {
    return si === 8 && (r === 2 || r === 3) && c >= 3 && c <= 5 ? 'L' : null
  }

  // filter casings under the ceiling; the wafer bonder (B) on the left, the sputter chamber (T) on the right, both at the back
  function foundryInner(r, si, c) {
    if (r === 3) return 'P'
    if (si >= 2 && si <= 4 && c >= 1 && c <= 3 && r === 1) return 'B'
    if (si >= 2 && si <= 4 && c >= 5 && c <= 7) return 'T'
    return '#'
  }

  function specOf(m, casing, inner, wall, parts) {
    return {
      slices: shell(m, inner, wall),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(casing)].concat(parts)),
        F: Pat.block(casing),
        T: Pat.block(TUNGSTEN_PIPE),
        K: Pat.block(FROST),
        B: Pat.block(BONDER),
        P: Pat.block(FILTER),
        L: Pat.block(GLASS),
        '#': Pat.air()
      }
    }
  }
  PH.machines.reactor.spec = specOf(PH.machines.reactor, UV_CASING, reactorInner, null, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 1 }),
    Pat.part('output_bus', { min: 1, max: 1 }),
    Pat.part('output_hatch', { min: 1, max: 1 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])
  PH.machines.foundry.spec = specOf(PH.machines.foundry, CLEAN, foundryInner, foundryWall, [
    Pat.part('input_bus', { min: 1, max: 3 }),
    Pat.part('input_hatch', { min: 1, max: 3 }),
    Pat.part('output_bus', { min: 1, max: 2 }),
    Pat.part('output_hatch', { min: 1, max: 1 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])

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
    Object.keys(PH.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(PH.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var reactor = PH.machines.reactor
    event.create(reactor.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(reactor.maxIO.itemsIn, reactor.maxIO.itemsOut, reactor.maxIO.fluidsIn, reactor.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
    var foundry = PH.machines.foundry
    event.create(foundry.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(foundry.maxIO.itemsIn, foundry.maxIO.itemsOut, foundry.maxIO.fluidsIn, foundry.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ASSEMBLER)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var reactor = PH.machines.reactor
    var foundry = PH.machines.foundry
    var reactorType = GTRecipeTypes.get(reactor.type)
    var foundryType = GTRecipeTypes.get(foundry.type)
    if (reactorType == null) throw new Error(LOG + 'recipe type gtceu:' + reactor.type + ' is not registered')
    if (foundryType == null) throw new Error(LOG + 'recipe type gtceu:' + foundry.type + ' is not registered')
    reactorType.addDataInfo(infoOf(reactor.dataKey))
    foundryType.addDataInfo(infoOf(foundry.dataKey))
    Pat.register(reactor.machine, reactor.spec)
    Pat.register(foundry.machine, foundry.spec)

    event.create(reactor.name, 'multiblock')
      .langValue(reactor.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(reactor.type)
      .recipeModifier(G.noVoiding.modifier({ which: 'items', reason: PH.reactorNoVoiding, name: 'MBE reactor' }, G.parallelHatch.overclock), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'items', reason: PH.reactorNoVoiding, name: 'MBE reactor' }))
      .appearanceBlock(function () { return Block.getBlock(UV_CASING) })
      .pattern(function (def) { return Pat.build(def, reactor.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mbe_reactor.tooltip.0'),
        Text.translate('grindless.machine.mbe_reactor.tooltip.1'),
        Text.translate('grindless.machine.mbe_reactor.tooltip.2')
      ])
      .workableCasingModel(UV_TEXTURE, 'grindless:block/multiblock/mbe_reactor')

    event.create(foundry.name, 'multiblock')
      .langValue(foundry.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(foundry.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, foundry.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.photonic_foundry.tooltip.0'),
        Text.translate('grindless.machine.photonic_foundry.tooltip.1'),
        Text.translate('grindless.machine.photonic_foundry.tooltip.2')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/photonic_foundry')
  })
})()
