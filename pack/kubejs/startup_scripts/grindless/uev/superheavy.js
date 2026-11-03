// priority: -7646
// -----------------------------------------------------------------------------------------------
// UEV's superheavy element line (docs/eras/uev.md, machines 2-4, lines 3-6; package UEV-A2): the Superheavy Factory (the heavy ion cyclotron,
// which also runs the recoil separation) and the superheavy chemistry lab, their recipe types and the intermediate items and gases. The recipes come from
// data/grindless/tables/superheavy.json (server_scripts/grindless/uev/superheavy.js); the older rows are in tables/hot_cell.json
// (the activated target wheel, Cf-252 -> Cm-248, Bk-249 -> Cf-249, tritium -> helium-3) and ev/cryogenic_plant.js (xenon).
//
//   gtceu:heavy_ion_cyclotron      Dubna's U-400 in a shielded vault: a Ca-48 beam from the ECR source is accelerated by the SRF cavity
//                                  (not consumed) and hits the target, a helium chamber (not consumed) takes the recoil. Refuses to void.
//   gtceu:heavy_ion_irradiation    its recipe type (EU in). Circuit 1 flerovium, 2 livermorium, 3 tennessine (target wheel), 4 oganesson,
//                                  5 moscovium, 6 ion-tracked foil (xenon beam on polycarbonate).
//   gtceu:recoil_separation        the gas-filled separator's recipe type, run by the same Superheavy Factory (dipole magnets bend the recoils away; one etched membrane per run). Circuits 1-5 as the cyclotron's.
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
    cast_polycarbonate_film: { stack: 64 },
    lead_polymer_liner: { stack: 16 },
    ca48_plasma_bunch: { stack: 64 },
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
      // the Superheavy Factory: the cyclotron and the gas-filled separator on its beam line (Decision D4-4), two recipe types
      name: 'heavy_ion_cyclotron', type: 'heavy_ion_irradiation', types: ['heavy_ion_irradiation', 'recoil_separation'],
      lang: 'Superheavy Factory', shape: 'ring',
      maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 2 },
      width: 31, depth: 47, height: 11, energyMax: 4, tips: 3, sound: 'ARC'
    },
    {
      name: 'superheavy_chemistry_lab', type: 'superheavy_chemistry', lang: 'Superheavy Chemistry Lab', shape: 'bench',
      maxIO: { itemsIn: 6, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 9, depth: 11, height: 7, energyMax: 2, tips: 3, sound: 'ARC'
    }
  ]
  // the recoil separation type has no controller of its own: the Superheavy Factory runs it
  SH.typeOnly = [{ type: 'recoil_separation', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 } }]
  SH.machines.forEach(function (m) {
    m.machine = 'gtceu:' + m.name
    m.dataKey = 'grindless_' + m.type
    m.noVoiding = 'grindless.machine.' + m.name + '.no_voiding'
  })

  // The Superheavy Factory (31 x 11 x 47): the cyclotron is a SiC yoke disk with a superhydride return band, four spiral sector poles
  // round a hub and an ECR injector on its left; a beam tube runs back to the target-wheel vault (radiation-proof corners), the
  // gas-filled separator bends away from the beam there (superhydride dipoles at the corner and mid-way) and runs forward along the
  // right to its focal-plane detector hall. The lab is a bench hall under a gas-line ridge. Built in the registry callback.
  function ringShape() {
    var s = G.uevShapes.scene(31, 11, 47)
    var cx = 15, cz = 31, r = 11
    s.cyl('y', cx, cz, r, 0, 0, 'X')
    s.cyl('y', cx, cz, r, 1, 7, 'R', true)
    s.cyl('y', cx, cz, r, 3, 4, 'M', true)
    s.cyl('y', cx, cz, r, 6, 6, 'C', true)
    s.cyl('y', cx, cz, 2, 1, 7, 'A', true)
    s.cyl('y', cx, cz, 2, 8, 8, 'L')
    var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]]
    dirs.forEach(function (d) {
      for (var t = 3; t <= 9; t++) {
        var shift = Math.floor((t - 3) / 3)
        for (var w = -1; w <= 1; w++) {
          var px = cx + d[0] * t - d[1] * (w + shift)
          var pz = cz + d[1] * t + d[0] * (w + shift)
          for (var y = 3; y <= 5; y++) s.set(px, y, pz, y === 5 ? 'R' : 'M')
        }
      }
    })
    s.box(1, 1, cz - 2, 3, 3, cz + 2, 'M').box(1, 2, cz, 3, 2, cz, '#').box(4, 3, cz - 1, 4, 3, cz + 1, 'P')
    s.box(0, 1, cz - 1, 0, 3, cz + 1, 'B')
    s.cyl('z', cx, 3, 1, 5, cz - r, 'P', true)
    s.room(10, 0, 0, 20, 7, 8, 'R', 'f')
    s.box(10, 0, 0, 20, 0, 8, 'X')
    s.edges(10, 0, 0, 20, 7, 8, 'A')
    s.cyl('z', cx, 3, 3, 2, 3, 'A', true).cyl('z', cx, 3, 1, 2, 3, 'B')
    s.cyl('x', 3, 4, 1, 21, 28, 'P', true)
    s.room(26, 0, 1, 30, 6, 7, 'M', 'f')
    s.box(26, 0, 1, 30, 0, 7, 'X')
    s.cyl('z', 28, 3, 1, 8, 37, 'P', true)
    s.room(26, 1, 18, 30, 5, 24, 'M', 'f')
    s.room(25, 0, 37, 30, 6, 44, 'R', 'f')
    s.box(25, 0, 37, 30, 0, 44, 'X')
    s.box(26, 1, 38, 29, 1, 43, 'A').box(27, 3, 38, 28, 4, 43, 'L')
    s.box(26, 0, 8, 30, 0, 36, 'X')
    s.box(13, 0, cz + r, 17, 0, 46, 'X')
    return s.booth('R', 3).fn()
  }
  // The lab is a radiation-proof hall: SiC walls, a row of four HfTaCN hot cells with glass windows down the right, and a gas
  // thermochromatography column rack (pipe over a coil-banded gearbox) on the left, with a ridge skylight over the aisle.
  function benchShape() {
    var s = G.uevShapes.scene(15, 9, 17)
    s.room(0, 0, 0, 14, 4, 16, 'R', 't')
    s.box(0, 0, 0, 14, 0, 16, 'X')
    ;[0, 8, 16].forEach(function (z) { s.box(0, 5, z, 14, 5, z, 'O') })
    s.box(5, 6, 2, 9, 6, 14, 'H').box(6, 7, 3, 8, 7, 13, 'H')
    ;[2, 6, 10].forEach(function (z) {
      s.box(9, 1, z, 13, 3, z + 3, 'H').box(10, 2, z + 1, 12, 2, z + 2, '#')
      s.box(9, 2, z + 1, 9, 2, z + 2, 'L')
    })
    ;[3, 5, 7, 9, 11].forEach(function (z) {
      s.box(2, 1, z, 2, 1, z, 'B').box(2, 2, z, 2, 5, z, 'P')
    })
    ;[4, 8, 12].forEach(function (z) { s.set(2, 3, z, 'C').set(3, 3, z, 'C') })
    s.box(1, 1, 2, 3, 1, 14, 'H')
    return s.booth('R', 3).fn()
  }
  var SHAPES = {
    heavy_ion_cyclotron: { w: 31, h: 11, d: 47, fn: ringShape, casing: 'grindless:sic_composite_casing', texture: 'grindless:block/uev/sic_composite_casing', extra: { A: SHIELD, C: COIL } },
    superheavy_chemistry_lab: { w: 15, h: 9, d: 17, fn: benchShape, casing: 'grindless:sic_composite_casing', texture: 'grindless:block/uev/sic_composite_casing' }
  }
  SH.machines.forEach(function (m) {
    m.width = SHAPES[m.name].w
    m.height = SHAPES[m.name].h
    m.depth = SHAPES[m.name].d
  })

  function makeSpec(m) {
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, fn: SHAPES[m.name].fn(),
      parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 0, max: 2 }),
        Pat.part('output_hatch', { min: 0, max: 2 }),
        Pat.part('energy_input', { min: 1, max: m.energyMax })
      ],
      pal: G.uevShapes.palette(SHAPES[m.name].casing, SHAPES[m.name].extra)
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
    SH.machines.map(function (m) { return { type: m.type, maxIO: m.maxIO } }).concat(SH.typeOnly).forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_FUSION, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SH.typeOnly.forEach(function (t) {
      var type = GTRecipeTypes.get(t.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + t.type + ' is not registered')
      type.addDataInfo(infoOf('grindless_' + t.type))
    })
    SH.machines.forEach(function (m) {
      var types = m.types || [m.type]
      types.forEach(function (name) {
        if (GTRecipeTypes.get(name) == null) throw new Error(LOG + 'recipe type gtceu:' + name + ' is not registered')
      })
      GTRecipeTypes.get(m.type).addDataInfo(infoOf(m.dataKey))
      m.spec = makeSpec(m)
      Pat.register(m.machine, m.spec)

      var builder = event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
      builder = types.length > 1 ? builder.recipeTypes(types[0], types[1]) : builder.recipeType(m.type)
      var tips = [Text.translate('grindless.machine.' + m.name + '.tooltip.0')]
      tips.push(types.length > 1
        ? Text.translate('gtceu.machine.available_recipe_map_2.tooltip', Text.translate('gtceu.' + types[0]), Text.translate('gtceu.' + types[1]))
        : Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)))
      builder
        .recipeModifier(G.noVoiding.modifier({ which: 'both', reason: m.noVoiding, name: m.name }, G.parallelHatch.overclock), true)
        .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: m.noVoiding, name: m.name }))
        .appearanceBlock(function () { return Block.getBlock(SHAPES[m.name].casing || SHIELD) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"](tips)
        .workableCasingModel(SHAPES[m.name].texture || SHIELD_TEXTURE, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
