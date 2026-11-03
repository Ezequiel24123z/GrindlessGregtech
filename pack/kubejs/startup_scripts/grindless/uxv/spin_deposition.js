// priority: -10899
// -----------------------------------------------------------------------------------------------
// UXV's deposition machine (docs/eras/uxv.md, machines 1 and 2, line 41; package UXV-A4): the Spintronic Cluster Tool, the PLD recipe type, and the
// package's own items (line 41's KrF excimer laser parts, the bonded CoFe target and the BFO film
// wafer). The recipes come from data/grindless/tables/spin_deposition.json (server_scripts/grindless/uxv/spin_deposition.js).
//
//   gtceu:mtj_sputter_cluster   31 x 11 x 31 cluster tool, UXV gum and mu metal (two UIV energy hatches), D4-SHAPE-UXV-B. Recipe types gtceu:mtj_sputtering
//                               (circuit 1 MTJ stack, 2 MRAM stack, 3 SAF track, 4 STNO stack), gtceu:pulsed_laser_deposition (circuit 1 SrRuO3
//                               electrode, 2 BiFeO3 film, 3 magnetoelectric switch; the KrF laser is not consumed; the former oxide PLD chamber)
//                               and gtceu:racetrack_patterning (spin_logic.js; the former racetrack fab).
//
// F1 ids (mtj_stack_wafer ... krf_excimer_laser, he_6n) are registered in uxv/foundation.js; only the ids below are new.
// Textures: tools/assets/Build-UXVSpinDepositionTextures.ps1. Names: client_scripts/grindless/uxv_spin_deposition_lang.js.
// Published for the recipe script: global.grindless.spinDeposition.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SD = G.spinDeposition || (G.spinDeposition = {})
  const LOG = '[grindless/uxv] '

  const GUM = 'grindless:gum_metal_casing'
  const GUM_TEXTURE = 'grindless:block/uxv/gum_metal_casing'
  const MU = 'grindless:mu_metal_shield_casing'

  SD.table = 'kubejs/data/grindless/tables/spin_deposition.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  SD.items = {
    cofe_target: { stack: 32 },
    bfo_film_wafer: { stack: 16 },
    krf_discharge_tube_blank: { stack: 16 },
    krf_discharge_tube: { stack: 16 },
    pulsed_power_head: { stack: 16 }
  }

  // items in include the programmed circuit; the PLD type also holds the laser (not consumed). The cluster tool also runs the PLD type and
  // spin_logic.js's racetrack patterning (types); a typeOnly entry registers its recipe type and no controller.
  SD.machines = [
    {
      name: 'mtj_sputter_cluster', machine: 'gtceu:mtj_sputter_cluster', type: 'mtj_sputtering', dataKey: 'grindless_mtj_sputtering',
      types: ['mtj_sputtering', 'pulsed_laser_deposition', 'racetrack_patterning'],
      lang: 'Spintronic Cluster Tool', maxIO: { itemsIn: 6, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      width: 31, height: 11, depth: 31,
      pal: { F: GUM, U: MU, L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil', P: 'gtceu:tungstensteel_pipe_casing', Q: 'stainless_steel' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 0, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    },
    {
      name: 'oxide_pld_chamber', type: 'pulsed_laser_deposition', dataKey: 'grindless_pulsed_laser_deposition', typeOnly: true,
      maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }
    }
  ]

  // The Spintronic Cluster Tool (31 x 11 x 31), D4-SHAPE-UXV-B: a central vacuum wafer handler (a mu-metal drum with a pipe spindle and a ring of
  // field coils on its roof) with eight radial chambers round it: four on the axes (sputter, pulsed laser deposition with the KrF beam line, ion-beam
  // etch, anneal) and four on the diagonals (notch etch, racetrack patterning and the load locks). A gum-metal floor disc carries everything.
  function clusterTool() {
    var s = G.uevShapes.scene(31, 11, 31)
    s.cyl('y', 15, 15, 15, 0, 0, 'F')
    s.cyl('y', 15, 15, 5, 1, 9, 'U', true)
    s.cyl('y', 15, 15, 5, 10, 10, 'U')
    s.cyl('y', 15, 15, 3, 10, 10, 'C', true, 'U')
    for (var y = 1; y <= 9; y++) s.set(15, y, 15, 'P')
    s.cyl('y', 15, 15, 3, 1, 8, 'U', true, '#')
    s.cyl('y', 15, 15, 13, 1, 2, 'U', true, null)
    s.replace('U', 'L', function (x, y, z) { return y >= 4 && y <= 6 && (x + z) % 4 === 0 && (x - 15) * (x - 15) + (z - 15) * (z - 15) > 16 })
    ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
      var near = 5
      var far = 14
      var x0 = d[0] !== 0 ? Math.min(15 + d[0] * near, 15 + d[0] * far) : 13
      var x1 = d[0] !== 0 ? Math.max(15 + d[0] * near, 15 + d[0] * far) : 17
      var z0 = d[1] !== 0 ? Math.min(15 + d[1] * near, 15 + d[1] * far) : 13
      var z1 = d[1] !== 0 ? Math.max(15 + d[1] * near, 15 + d[1] * far) : 17
      s.room(x0, 1, z0, x1, 6, z1, 'F', 'b')
      s.edges(x0, 1, z0, x1, 6, z1, 'U')
      for (var k = -1; k <= 1; k++) for (var yy = 1; yy <= 3; yy++) {
        s.set(15 + d[0] * 5 + (d[0] === 0 ? k : 0), yy, 15 + d[1] * 5 + (d[1] === 0 ? k : 0), '#')
        s.set(15 + d[0] * 14 + (d[0] === 0 ? k : 0), yy + 1, 15 + d[1] * 14 + (d[1] === 0 ? k : 0), 'L')
      }
      s.set(15 + d[0] * 10, 3, 15 + d[1] * 10, 'P')
    })
    ;[[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (d) {
      var cx = 15 + d[0] * 9
      var cz = 15 + d[1] * 9
      s.room(cx - 2, 0, cz - 2, cx + 2, 6, cz + 2, 'F')
      s.edges(cx - 2, 0, cz - 2, cx + 2, 6, cz + 2, 'U')
      s.set(cx, 1, cz, 'P').set(cx, 2, cz, 'P').set(cx, 3, cz, 'P')
      s.set(cx, 4, cz, 'L')
      for (var k = 1; k <= 3; k++) s.set(15 + d[0] * (5 + k), 1, 15 + d[1] * (5 + k), 'P')
    })
    return s.booth('F', 3).fn()
  }

  // built in the machine registry callback: uev/shapes.js may load after this file
  function spec(m) {
    return G.uevShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: clusterTool() })
  }

  // one EMI line per recipe, read from its data
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
    Object.keys(SD.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(SD.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    SD.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SD.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      if (m.typeOnly) return
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var b = event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
      m.types.forEach(function (t) { b = b.recipeType(t) })
      b.recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(GUM) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_3.tooltip', Text.translate('gtceu.' + m.types[0]), Text.translate('gtceu.' + m.types[1]), Text.translate('gtceu.' + m.types[2])),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(GUM_TEXTURE, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
