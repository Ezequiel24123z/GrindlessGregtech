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

  const SIC = 'grindless:sic_composite_casing'
  const SIC_TEXTURE = 'grindless:block/uev/sic_composite_casing'

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

  // The furnace is a vacuum hall with e-gun towers on its roof, cold hearths down its length, a withdrawal shaft at the back and a
  // power annex on each side. The foundry is a Bridgman tower: a mould chamber in coil bands over a withdrawal shaft with a baffle
  // ring between them. Bodies are the UEV casing families (SiC R, HfTaCN H, superhydride M). Built in the registry callback (shapes.js
  // may load later).
  var SHAPES = {
    furnace: {
      w: 13, h: 13, d: 19,
      fn: function () {
        var s = G.uevShapes.scene(13, 13, 19)
        s.room(2, 0, 0, 10, 6, 15, 'R')
        s.box(2, 0, 0, 10, 0, 15, 'X')
        ;[3, 5, 7, 9, 11, 13].forEach(function (z) { s.box(2, 2, z, 2, 3, z, 'L').box(10, 2, z, 10, 3, z, 'L') })
        s.box(4, 1, 4, 4, 1, 13, 'H').box(8, 1, 4, 8, 1, 13, 'H')
        ;[6, 12].forEach(function (z) {
          ;[4, 8].forEach(function (x) {
            s.cyl('y', x, z, 1, 7, 11, 'R', true, null).set(x, 12, z, 'C').set(x, 9, z, 'M')
            s.box(x, 5, z, x, 6, z, 'P')
          })
        })
        s.cyl('y', 6, 3, 2, 7, 12, 'H', true)
        s.cyl('y', 6, 3, 2, 10, 10, 'M', true, null)
        s.room(0, 0, 4, 1, 4, 14, 'H').box(1, 1, 6, 1, 2, 12, 'B')
        s.room(11, 0, 4, 12, 4, 14, 'H').box(11, 1, 6, 11, 2, 12, 'M')
        s.box(2, 6, 0, 10, 6, 15, 'H')
        s.box(6, 1, 1, 6, 6, 1, 'P')
        return s.booth('R', 3).fn()
      }
    },
    foundry: {
      w: 11, h: 21, d: 11,
      fn: function () {
        var s = G.uevShapes.scene(11, 21, 11)
        s.box(0, 0, 0, 10, 0, 10, 'X')
        s.room(1, 1, 1, 9, 8, 9, 'H').box(1, 8, 1, 9, 8, 9, 'R').box(3, 1, 3, 3, 2, 3, 'B').box(7, 1, 3, 7, 2, 3, 'B')
        s.cyl('y', 5, 5, 3, 9, 9, 'H').set(5, 9, 5, '#')
        s.cyl('y', 5, 5, 4, 10, 16, 'O', true)
        ;[12, 14].forEach(function (y) { s.cyl('y', 5, 5, 4, y, y, 'C', true, null) })
        s.cyl('y', 5, 5, 4, 10, 10, 'M', true, null)
        s.cyl('y', 5, 5, 4, 14, 14, 'M', true, null)
        s.cone(5, 5, 3, 17, 20, 1, 'R', true)
        s.cyl('y', 5, 5, 0, 20, 20, 'P')
        ;[[0, 0], [10, 0], [0, 10], [10, 10]].forEach(function (p) { s.box(p[0], 1, p[1], p[0], 8, p[1], 'Q') })
        ;[3, 6].forEach(function (y) { s.set(5, y, 8, 'L') })
        s.set(5, 12, 9, 'L').set(5, 14, 9, 'L')
        return s.booth('R', 3).fn()
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
      pal: G.uevShapes.palette(casing)
    })
  }
  function makeSpec(k) {
    if (k === 'furnace') {
      return specOf(k, SIC, [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 0, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 0, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        G.parallelHatch.part()
      ])
    }
    return specOf(k, SIC, [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 1 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 }),
      G.parallelHatch.part()
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
      .appearanceBlock(function () { return Block.getBlock(SIC) })
      .pattern(function (def) { return Pat.build(def, f.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.electron_beam_furnace.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.electron_beam_refining')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(SIC_TEXTURE, 'grindless:block/multiblock/electron_beam_furnace')

    event.create(d.name, 'multiblock')
      .langValue(d.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(d.type)
      .recipeModifier(G.noVoiding.modifier({ which: 'items', reason: EB.foundryNoVoiding, name: 'single-crystal foundry' }, G.parallelHatch.modifier(G.parallelHatch.overclock)), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'items', reason: EB.foundryNoVoiding, name: 'single-crystal foundry' }))
      .appearanceBlock(function () { return Block.getBlock(SIC) })
      .pattern(function (def) { return Pat.build(def, d.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.single_crystal_foundry.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.single_crystal_casting')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(SIC_TEXTURE, 'grindless:block/multiblock/single_crystal_foundry')
  })
})()
