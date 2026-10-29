// priority: -7536
// -----------------------------------------------------------------------------------------------
// UEV's electron beam and superalloy (docs/eras/uev.md, machines 6 and 7, lines 11, 12, 13, 33 and 38; package UEV-A4): the electron
// beam furnace and the single-crystal foundry, their recipe types and the package's own items. The recipes come from
// data/grindless/tables/electron_beam.json (server_scripts/grindless/uev/electron_beam.js).
//
//   gtceu:electron_beam_furnace   a hearth under an electron gun in hard vacuum: it melts a metal drop by drop and leaves the volatile
//                                 impurities behind (6N purity). The only maker of 6N hafnium, tantalum, niobium and rhenium.
//   gtceu:electron_beam_refining  its recipe type (EU in). Circuit 1 rhenium, 2 hafnium, 3 tantalum, 4 niobium (RRR grade),
//                                 5 YSZ thermal barrier coating, 6 onion carbon. Every refining leaves an EB skull (iridium-clad hearth
//                                 liner scrap, back to EV's platinum plant).
//   gtceu:single_crystal_foundry  investment casting of single-crystal (SX) parts: a withdrawal furnace under argon. The only maker of
//                                 grindless:sx_blade, the SX pump impeller and the Brayton turbine wheel. The gate and the dross are
//                                 never lost (the gate is remelted, the dross goes to the platinum plant). Refuses to void.
//   gtceu:single_crystal_casting  its recipe type (EU in). Circuit 1 SX blade, 2 pump impeller, 3 Brayton turbine wheel.
//
// New ids (the F1 ones are in uev/foundation.js and are not registered again): the items below (the table's grindless: ids).
// Geometry (lib/patterns.js): the furnace is a 9 x 10 x 13 vacuum hall under a gun (clean casing), the foundry a 7 x 13 x 7 puller
// tower (heatproof casing). No vacuum hatch is verified in this pack: ordinary buses and hatches take the parts.
// Textures: tools/assets/Build-UEVElectronBeamTextures.ps1. Names: client_scripts/grindless/uev_electron_beam_lang.js.
// Published for the recipe script: global.grindless.electronBeam.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const EB = G.electronBeam || (G.electronBeam = {})
  const LOG = '[grindless/uev] '

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const HEAT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'

  EB.table = 'kubejs/data/grindless/tables/electron_beam.json'
  EB.foundryNoVoiding = 'grindless.machine.single_crystal_foundry.no_voiding'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  EB.items = {
    six_n_hafnium: { stack: 64 },
    six_n_tantalum: { stack: 64 },
    six_n_niobium: { stack: 64 },
    six_n_rhenium: { stack: 64 },
    eb_skull: { stack: 64 },
    onion_carbon: { stack: 64 },
    zr_hf_chloride_dust: { stack: 64 },
    zirconium_chloride_dust: { stack: 64 },
    hafnium_chloride_dust: { stack: 64 },
    hafnia_dust: { stack: 64 },
    hafnium_tetrachloride_dust: { stack: 64 },
    hafnium_sponge: { stack: 64 },
    tantalite_fluoride_cake: { stack: 64 },
    k2taf7_dust: { stack: 64 },
    niobium_oxyfluoride_dust: { stack: 64 },
    tantalum_powder: { stack: 64 },
    niobium_powder: { stack: 64 },
    alkali_fluoride_dust: { stack: 64 },
    alkali_sulfate_dust: { stack: 64 },
    yttrium_oxide_dust: { stack: 64 },
    terbium_oxide_dust: { stack: 64 },
    ysz_powder: { stack: 64 },
    ysz_ingot: { stack: 64 },
    sx_master_alloy_dust: { stack: 64 },
    ceramic_shell_mould: { stack: 16 },
    ceramic_slurry: { stack: 64 },
    green_ceramic_shell: { stack: 16 },
    fired_ceramic_shell: { stack: 16 },
    sx_gate: { stack: 64 },
    sx_dross: { stack: 64 },
    heat_treated_sx_blade: { stack: 64 },
    bond_coated_sx_blade: { stack: 64 },
    coated_sx_blade: { stack: 64 },
    sx_pump_impeller: { stack: 16 },
    brayton_turbine_wheel: { stack: 16 },
    nb3sn_srf_cavity: { stack: 16 }
  }

  EB.machines = {
    furnace: {
      name: 'electron_beam_furnace',
      machine: 'gtceu:electron_beam_furnace',
      type: 'electron_beam_refining',
      dataKey: 'grindless_electron_beam',
      lang: 'Electron Beam Furnace',
      // items in: the feed (and the blank for the coating) and the circuit; out: the metal, the skull; no fluids
      maxIO: { itemsIn: 3, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 },
      width: 5, height: 5, depth: 7
    },
    foundry: {
      name: 'single_crystal_foundry',
      machine: 'gtceu:single_crystal_foundry',
      type: 'single_crystal_casting',
      dataKey: 'grindless_single_crystal_casting',
      lang: 'Single-Crystal Foundry',
      // items in: the master alloy, the mould or blades and the circuit; out: the part and the gate; fluid in: the argon charge
      maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 },
      width: 5, height: 6, depth: 5
    }
  }

  // The furnace is a vacuum chamber under a gun: a long hall with a crucible row and a column of gun coils on the roof. The foundry is a
  // Czochralski puller: a banded tower with a pull rod down to a crucible. Built in the registry callback (shapes.js may load later).
  function gunCrown(w, d) {
    var ridge = G.uevShapes.ridge(w, d)
    var cx = (w - 1) / 2
    return function (x, k, z) {
      if (x === cx && z === 4 && k < 5) return k % 2 === 1 ? 'C' : 'P'
      if (z === 4 && k === 1 && (x === cx - 1 || x === cx + 1)) return 'A'
      return ridge(x, k, z)
    }
  }
  var SHAPES = {
    furnace: {
      w: 9, h: 10, d: 13,
      fn: function () {
        return G.uevShapes.hall({
          w: 9, d: 13, hh: 5, mull: 2, crown: gunCrown(9, 13),
          inner: function (x, y, z) {
            var ax = x < 4 ? 4 - x : x - 4
            if (z === 4 && ax <= 1 && y === 1) return 'B'
            if (z === 4 && ax === 0 && y <= 3) return 'P'
            if (ax === 3 && z % 3 === 0 && z >= 6 && y <= 2) return y === 1 ? 'B' : 'C'
            return null
          }
        })
      }
    },
    foundry: {
      w: 7, h: 13, d: 7,
      fn: function () {
        return G.uevShapes.tower({
          w: 7, d: 7, baseH: 3, th: 11, inset: 1, band: 3, bandChar: 'C',
          baseInner: function (x, y, z) { return x === 3 && z === 3 && y === 1 ? 'B' : null },
          core: function (x, y, z) { return x === 3 && z === 3 ? 'Q' : null },
          crown: G.uevShapes.mast(7, 7, 2)
        })
      }
    }
  }
  Object.keys(EB.machines).forEach(function (k) {
    var m = EB.machines[k]
    m.width = SHAPES[k].w
    m.height = SHAPES[k].h
    m.depth = SHAPES[k].d
  })

  function specOf(k, casing, parts) {
    var m = EB.machines[k]
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, fn: SHAPES[k].fn(), parts: parts,
      pal: {
        F: casing, A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass', P: 'gtceu:tungstensteel_pipe_casing',
        C: 'gtceu:trinium_coil_block', B: 'gtceu:tungstensteel_gearbox', Q: 'tungsten_steel'
      }
    })
  }
  function makeSpec(k) {
    if (k === 'furnace') {
      return specOf(k, CLEAN, [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 0, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 })
      ])
    }
    return specOf(k, HEAT, [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 1 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ])
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
    Object.keys(EB.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(EB.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe types

  // GTM registers rhenium as a bare element with no form, so a new material of that name is dropped (as UV's ytterbium,
  // uv/foundation.js): it gets its ingot here, which adds the dust; B3 adds its Barnard producer
  GTCEuStartupEvents.materialModification(function (event) {
    try {
      var re = GTMaterials.get('rhenium')
      if (re == null || re.isNull()) return
      re.getProperties().ensureSet(PropertyKey.INGOT, true)
    } catch (e) {
      console.error(LOG + 'rhenium: dust and ingot not added: ' + e)
    }
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var f = EB.machines.furnace
    event.create(f.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(f.maxIO.itemsIn, f.maxIO.itemsOut, f.maxIO.fluidsIn, f.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
    var d = EB.machines.foundry
    event.create(d.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(d.maxIO.itemsIn, d.maxIO.itemsOut, d.maxIO.fluidsIn, d.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var f = EB.machines.furnace
    var d = EB.machines.foundry
    var fType = GTRecipeTypes.get(f.type)
    var dType = GTRecipeTypes.get(d.type)
    if (fType == null) throw new Error(LOG + 'recipe type gtceu:' + f.type + ' is not registered')
    if (dType == null) throw new Error(LOG + 'recipe type gtceu:' + d.type + ' is not registered')
    fType.addDataInfo(infoOf(f.dataKey))
    dType.addDataInfo(infoOf(d.dataKey))
    f.spec = makeSpec('furnace')
    d.spec = makeSpec('foundry')
    Pat.register(f.machine, f.spec)
    Pat.register(d.machine, d.spec)

    event.create(f.name, 'multiblock')
      .langValue(f.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(f.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, f.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.electron_beam_furnace.tooltip.0'),
        Text.translate('grindless.machine.electron_beam_furnace.tooltip.1'),
        Text.translate('grindless.machine.electron_beam_furnace.tooltip.2')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/electron_beam_furnace')

    event.create(d.name, 'multiblock')
      .langValue(d.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(d.type)
      .recipeModifier(G.noVoiding.modifier({ which: 'items', reason: EB.foundryNoVoiding, name: 'single-crystal foundry' }, G.parallelHatch.overclock), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'items', reason: EB.foundryNoVoiding, name: 'single-crystal foundry' }))
      .appearanceBlock(function () { return Block.getBlock(HEAT) })
      .pattern(function (def) { return Pat.build(def, d.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.single_crystal_foundry.tooltip.0'),
        Text.translate('grindless.machine.single_crystal_foundry.tooltip.1'),
        Text.translate('grindless.machine.single_crystal_foundry.tooltip.2')
      ])
      .workableCasingModel(HEAT_TEXTURE, 'grindless:block/multiblock/single_crystal_foundry')
  })
})()
