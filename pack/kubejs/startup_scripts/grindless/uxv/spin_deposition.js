// priority: -10916
// -----------------------------------------------------------------------------------------------
// UXV's deposition machines (docs/eras/uxv.md, machines 1 and 2, line 41; package UXV-A4): the MTJ sputter cluster and the oxide PLD
// chamber, their recipe types, and the package's own items (line 41's KrF excimer laser parts, the bonded CoFe target and the BFO film
// wafer). The recipes come from data/grindless/tables/spin_deposition.json (server_scripts/grindless/uxv/spin_deposition.js).
//
//   gtceu:mtj_sputter_cluster   11 x 7 x 11 octagonal cluster tool, UXV (two UIV energy hatches). Recipe type gtceu:mtj_sputtering
//                               (circuit 1 MTJ stack, 2 MRAM stack, 3 SAF track, 4 STNO stack).
//   gtceu:oxide_pld_chamber     9 x 7 x 13 octagonal chamber with a beamline arm, UXV. Recipe type gtceu:pulsed_laser_deposition
//                               (circuit 1 SrRuO3 electrode, 2 BiFeO3 film, 3 magnetoelectric switch); the KrF laser is not consumed.
//
// F1 ids (mtj_stack_wafer ... krf_excimer_laser, he_6n) are registered in uxv/foundation.js; only the ids below are new.
// Textures: tools/assets/Build-UXVSpinDepositionTextures.ps1. Names: client_scripts/grindless/uxv_spin_deposition_lang.js.
// Published for the recipe script: global.grindless.spinDeposition.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SD = G.spinDeposition || (G.spinDeposition = {})
  const LOG = '[grindless/uxv] '

  const PLASCRETE = 'gtceu:plascrete'
  const PLASCRETE_TEXTURE = 'gtceu:block/casings/cleanroom/plascrete'

  SD.table = 'kubejs/data/grindless/tables/spin_deposition.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  SD.items = {
    cofe_target: { stack: 32 },
    bfo_film_wafer: { stack: 16 },
    krf_discharge_tube_blank: { stack: 16 },
    krf_discharge_tube: { stack: 16 },
    pulsed_power_head: { stack: 16 }
  }

  // items in include the programmed circuit; the PLD type also holds the laser (not consumed)
  SD.machines = [
    {
      name: 'mtj_sputter_cluster', machine: 'gtceu:mtj_sputter_cluster', type: 'mtj_sputtering', dataKey: 'grindless_mtj_sputtering',
      lang: 'MTJ Sputter Cluster', maxIO: { itemsIn: 6, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      width: 11, height: 7, depth: 11,
      pal: { F: PLASCRETE, L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil', P: 'gtceu:tungstensteel_pipe_casing', Q: 'stainless_steel' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_hatch', { min: 0, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 })
        ]
      }
    },
    {
      name: 'oxide_pld_chamber', machine: 'gtceu:oxide_pld_chamber', type: 'pulsed_laser_deposition', dataKey: 'grindless_pulsed_laser_deposition',
      lang: 'Oxide PLD Chamber', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 },
      width: 9, height: 7, depth: 13,
      pal: { F: PLASCRETE, L: 'gtceu:laminated_glass', C: 'gtceu:tritanium_coil_block', R: 'gtceu:computer_casing', Q: 'tungsten_steel' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 2 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 })
        ]
      }
    }
  ]

  function abs(n) { return n < 0 ? -n : n }
  // an octagon: inside the square of half-width r and the diamond of radius s
  function oct(dx, dz, r, s) { return abs(dx) <= r && abs(dz) <= r && abs(dx) + abs(dz) <= s }

  // x left to right, y bottom to top, z back to front. Hub of five guns' worth of space: four gun bays on the diagonals, the load lock at the front.
  function sputterCell(x, y, z) {
    var dx = x - 5
    var dz = z - 5
    if (!oct(dx, dz, 5, 7)) return ' '
    var ax = abs(dx)
    var az = abs(dz)
    var wall = !oct(dx, dz, 4, 6)
    if (y === 0) {
      if (!wall) return oct(dx, dz, 1, 2) ? 'P' : 'F'
      return z === 0 || z === 10 ? 'X' : 'F'
    }
    if (y === 5) {
      if (wall) return 'F'
      return oct(dx, dz, 3, 5) ? 'L' : 'F'
    }
    if (y === 6) {
      if (!oct(dx, dz, 1, 2)) return ' '
      return dx === 0 && dz === 0 ? 'C' : 'F'
    }
    if (!wall) return '#'
    if ((ax === 5 && az === 2) || (az === 5 && ax === 2)) return 'Q'
    if (ax >= 3 && az >= 3) return y === 2 || y === 3 ? 'C' : 'P'
    return y === 2 || y === 3 ? 'L' : 'F'
  }

  // an octagonal chamber (z 0-8) and a three-wide beamline arm to the laser bay (z 9-12) with the controller on its front face
  function pldCell(x, y, z) {
    var dx = x - 4
    if (z >= 9) {
      if (x < 3 || x > 5 || y > 4) return ' '
      if (x === 4 && (y === 2 || y === 3) && z <= 11) return '#'
      if (y === 0) return 'X'
      if (y === 4) return 'F'
      if (x === 4) return y === 1 ? 'R' : 'L'
      if (y === 1) return 'F'
      return z === 9 || z === 12 ? 'Q' : 'L'
    }
    var dz = z - 4
    if (!oct(dx, dz, 4, 6)) return ' '
    var ax = abs(dx)
    var az = abs(dz)
    var wall = !oct(dx, dz, 3, 5)
    if (y === 0) {
      if (!wall) return oct(dx, dz, 1, 2) ? 'C' : 'F'
      return z <= 1 ? 'X' : 'F'
    }
    if (y === 5) {
      if (wall) return 'F'
      return oct(dx, dz, 2, 3) ? 'L' : 'F'
    }
    if (y === 6) {
      if (!oct(dx, dz, 1, 2)) return ' '
      return dx === 0 && dz === 0 ? 'Q' : 'F'
    }
    if (!wall) return '#'
    if (z === 8 && x === 4 && (y === 2 || y === 3)) return '#'
    if ((ax === 4 && az === 2) || (az === 4 && ax === 2)) return 'Q'
    if (z === 0 && ax <= 1 && (y === 2 || y === 3)) return 'R'
    if (ax === 4 && az <= 1) return y === 2 ? (az === 0 ? 'R' : 'L') : y === 3 ? 'L' : y === 4 ? 'R' : 'F'
    return y === 4 ? 'R' : 'F'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(),
      fn: m.name === 'mtj_sputter_cluster' ? sputterCell : pldCell
    })
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
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(PLASCRETE) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(PLASCRETE_TEXTURE, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
