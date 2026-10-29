// priority: -9246
// -----------------------------------------------------------------------------------------------
// UIV's ramp-compression pulser (docs/eras/uiv.md, machine 1, lines 1 to 4; package UIV-A2): the machine, its recipe type, the package's
// own items and the three hydrogen fluids. The recipes come from data/grindless/tables/metallic_hydrogen.json
// (server_scripts/grindless/uiv/metallic_hydrogen.js).
//
//   gtceu:ramp_compression_pulser   a 9 x 9 x 9 cylinder, UEV (7,864,320 EU/t). The only maker of metallic hydrogen, lonsdaleite and
//                                   cubic gauche nitrogen. Its pulsed-power ring is grindless:coilgun_coil_casing.
//   gtceu:ramp_compression          its recipe type (EU in). Circuit 1 metallic hydrogen (a solid para-H2 target), circuit 2 lonsdaleite
//                                   (pyrolytic graphite), circuit 3 cubic gauche nitrogen (a laser-heated N2 charge).
//
// Fiction, named as such in EMI and the quest: real metallic hydrogen and cg-N only exist above about 400 GPa (hydrogen) and 110 GPa
// (nitrogen) and revert on release; here the pulser "quenches" them, so the rod and the powder survive at one atmosphere.
//
// New ids: the items below (grindless:) and the fluids gtceu:protium, gtceu:para_hydrogen and gtceu:liquid_para_hydrogen (GTM registers a
// KubeJS material's items under gtceu:). The F1 ids (metallic hydrogen, lonsdaleite, cg-N, FFKM) are in uiv/foundation.js.
// Textures: tools/assets/Build-UIVMetallicHydrogenTextures.ps1. Names: client_scripts/grindless/uiv_metallic_hydrogen_lang.js.
// Published for the recipe script: global.grindless.metallicHydrogen.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MH = G.metallicHydrogen || (G.metallicHydrogen = {})
  const LOG = '[grindless/uiv] '

  const CASING = 'gtceu:uev_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uev/side'
  const COIL = 'grindless:coilgun_coil_casing'

  MH.table = 'kubejs/data/grindless/tables/metallic_hydrogen.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  MH.items = {
    solid_para_h2_target: { stack: 16 },
    pyrolytic_graphite: { stack: 64 },
    leached_lonsdaleite: { stack: 64 },
    lonsdaleite_race: { stack: 64 },
    lonsdaleite_bearing: { stack: 64 },
    dac_charge: { stack: 16 },
    laser_heated_n2_charge: { stack: 16 },
    quenched_cg_nitrogen: { stack: 64 }
  }

  // material key -> form, colour, formula (gtceu: items and fluids whatever the namespace)
  MH.fluids = {
    'gtceu:protium': { form: 'gas', colour: 0xF4F4FF, formula: '1H2' },
    'gtceu:para_hydrogen': { form: 'gas', colour: 0xE0E8FF, formula: 'p-H2' },
    'gtceu:liquid_para_hydrogen': { form: 'liquid', colour: 0xC8D8FF, formula: 'p-H2(l)' }
  }

  MH.machine = {
    name: 'ramp_compression_pulser',
    machine: 'gtceu:ramp_compression_pulser',
    type: 'ramp_compression',
    dataKey: 'grindless_ramp_compression',
    lang: 'Ramp-Compression Pulser',
    // items in: the target, the circuit and a spare; out: the product and a residue; fluids: the charge and the shards or the N2
    maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
    width: 9, height: 9, depth: 9
  }

  // A pressure vessel (uiv/shapes.js): a ribbed drum with pulsed-power coil rings, four rams ending in anvils, a stepped lid. Built in the
  // machine registry callback: shapes.js may load after this file. Row 0 (X) takes the parts.
  function spec(m) {
    return G.uivShapes.build(Pat, m.name, CASING, [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 0, max: 1 }),
      Pat.part('output_hatch', { min: 0, max: 1 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ])
  }

  // one EMI line per recipe, read from its data: what the circuit does (and the named fiction)
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

  StartupEvents.registry('item', function (event) {
    Object.keys(MH.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(MH.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MH.fluids).forEach(function (key) {
      var spec = MH.fluids[key]
      var material = event.create(key)
      if (spec.form === 'gas') material.gas()
      else material.liquid()
      material.color(spec.colour).formula(spec.formula).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var m = MH.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_COMPRESS, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MOTOR)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = MH.machine
    var type = GTRecipeTypes.get(m.type)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
    type.addDataInfo(infoOf(m.dataKey))
    m.spec = spec(m)
    Pat.register(m.machine, m.spec)

    event.create(m.name, 'multiblock')
      .langValue(m.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(m.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, m.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.ramp_compression_pulser.tooltip.0'),
        Text.translate('grindless.machine.ramp_compression_pulser.tooltip.1'),
        Text.translate('grindless.machine.ramp_compression_pulser.tooltip.2')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/ramp_compression_pulser')
  })
})()
