// priority: -7637
// -----------------------------------------------------------------------------------------------
// UEV's superheavy element line (docs/eras/uev.md, machines 2-4, lines 3-6; package UEV-A2): the heavy ion cyclotron, the recoil
// separator and the superheavy chemistry lab, their recipe types and the intermediate items and gases. The recipes come from
// data/grindless/tables/superheavy.json (server_scripts/grindless/uev/superheavy.js); the older rows are in tables/hot_cell.json
// (the activated target wheel, Cf-252 -> Cm-248, Bk-249 -> Cf-249, tritium -> helium-3) and ev/cryogenic_plant.js (xenon).
//
//   gtceu:heavy_ion_cyclotron      Dubna's U-400 in a shielded vault: a Ca-48 beam from the ECR source is accelerated by the SRF cavity
//                                  (not consumed) and hits the target, a helium chamber (not consumed) takes the recoil. Refuses to void.
//   gtceu:heavy_ion_irradiation    its recipe type (EU in). Circuit 1 flerovium, 2 livermorium, 3 tennessine (target wheel), 4 oganesson,
//                                  5 moscovium, 6 ion-tracked foil (xenon beam on polycarbonate).
//   gtceu:recoil_separator         the gas-filled separator: dipole magnets bend the recoils away from the beam; one etched membrane per run.
//   gtceu:recoil_separation        its recipe type. Circuits 1-5 as the cyclotron's.
//   gtceu:superheavy_chemistry_lab gas chromatography on gold and the capsule line: one atom pool per sample.
//   gtceu:superheavy_chemistry     its recipe type. 1 tennessine sample (stored, nothing consumes it), 2 the census.
//
// New ids: items target_wheel_blank, activated_target_wheel, sealed_capsule, flerovium_atoms, livermorium_atoms, tennessine_atoms,
// oganesson_atoms, moscovium_atoms, polycarbonate_foil, ion_tracked_foil, etched_membrane, berkelium_oxide_dust; materials (gases)
// flerovium/livermorium/tennessine/oganesson/moscovium _recoil_gas and phosgene.
// Textures: tools/assets/Build-UEVSuperheavyTextures.ps1. Names: client_scripts/grindless/uev_superheavy_lang.js.
// Published for the recipe script: global.grindless.superheavy.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SH = G.superheavy || (G.superheavy = {})
  const LOG = '[grindless/uev] '

  const SHIELD = 'gtnn:radiation_proof_machine_casing'
  const SHIELD_TEXTURE = 'gtnn:block/casings/solid/radiation_proof_machine_casing'
  const TANK = 'gtceu:stable_machine_casing'
  const COIL = 'gtceu:superconducting_coil'

  SH.table = 'kubejs/data/grindless/tables/superheavy.json'

  SH.items = {
    target_wheel_blank: { stack: 16 },
    activated_target_wheel: { stack: 1 },
    sealed_capsule: { stack: 16 },
    flerovium_atoms: { stack: 64 },
    livermorium_atoms: { stack: 64 },
    tennessine_atoms: { stack: 64 },
    oganesson_atoms: { stack: 64 },
    moscovium_atoms: { stack: 64 },
    polycarbonate_foil: { stack: 64 },
    ion_tracked_foil: { stack: 64 },
    etched_membrane: { stack: 64 },
    berkelium_oxide_dust: { stack: 64 }
  }

  SH.materials = {
    flerovium_recoil_gas: { colour: 0xB8C4D8, formula: 'Fl*' },
    livermorium_recoil_gas: { colour: 0xC8B0D0, formula: 'Lv*' },
    tennessine_recoil_gas: { colour: 0xD8C8A0, formula: 'Ts*' },
    oganesson_recoil_gas: { colour: 0xA8D8D0, formula: 'Og*' },
    moscovium_recoil_gas: { colour: 0xD0B8B8, formula: 'Mc*' },
    phosgene: { colour: 0xE8E8C0, formula: 'COCl2' }
  }

  SH.machines = [
    {
      name: 'heavy_ion_cyclotron', type: 'heavy_ion_irradiation', lang: 'Heavy Ion Cyclotron', shape: 'ring',
      maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 2 },
      width: 9, depth: 9, height: 5, energyMax: 4, tips: 3, sound: 'ARC'
    },
    {
      name: 'recoil_separator', type: 'recoil_separation', lang: 'Recoil Separator', shape: 'dipoles',
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 },
      width: 5, depth: 11, height: 5, energyMax: 2, tips: 3, sound: 'ARC'
    },
    {
      name: 'superheavy_chemistry_lab', type: 'superheavy_chemistry', lang: 'Superheavy Chemistry Lab', shape: 'bench',
      maxIO: { itemsIn: 6, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 7, depth: 7, height: 5, energyMax: 2, tips: 3, sound: 'ARC'
    }
  ]
  SH.machines.forEach(function (m) {
    m.machine = 'gtceu:' + m.name
    m.dataKey = 'grindless_' + m.type
    m.noVoiding = 'grindless.machine.' + m.name + '.no_voiding'
  })

  // A hollow shell: row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller (front wall, row 1, middle).
  // Inside: air (#) with the shape's coils (M) and stable casing (T).
  function inner(m, si, r, c) {
    var last = m.depth - 1
    if (m.shape === 'ring') {
      var onRing = si >= 2 && si <= last - 2 && c >= 2 && c <= m.width - 3 &&
        (si === 2 || si === last - 2 || c === 2 || c === m.width - 3)
      if (!onRing) return '#'
      return r === 2 ? 'M' : 'T'
    }
    if (m.shape === 'dipoles') {
      if (r === 2 && (c === 1 || c === m.width - 2) && si % 2 === 0 && si >= 2 && si <= last - 2) return 'M'
      return '#'
    }
    if (r === 1 && c >= 2 && c <= m.width - 3 && si >= 2 && si <= last - 2) return 'T'
    return '#'
  }

  function slicesOf(m) {
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
          else ch = inner(m, si, r, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  SH.machines.forEach(function (m) {
    m.spec = {
      slices: slicesOf(m),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf(
          Pat.block(SHIELD),
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 0, max: 2 }),
          Pat.part('output_hatch', { min: 0, max: 2 }),
          Pat.part('energy_input', { min: 1, max: m.energyMax })
        ),
        F: Pat.block(SHIELD),
        T: Pat.block(TANK),
        M: Pat.block(COIL),
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

  StartupEvents.registry('item', function (event) {
    Object.keys(SH.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(SH.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(SH.materials).forEach(function (name) {
      var spec = SH.materials[name]
      var material = event.create(name)
      material.gas().color(spec.colour).formula(spec.formula)
      if (name !== 'phosgene') material.radioactiveHazard(1)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    SH.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_FUSION, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SH.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.noVoiding.modifier({ which: 'both', reason: m.noVoiding, name: m.name }, G.parallelHatch.overclock), true)
        .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: m.noVoiding, name: m.name }))
        .appearanceBlock(function () { return Block.getBlock(SHIELD) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(SHIELD_TEXTURE, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
