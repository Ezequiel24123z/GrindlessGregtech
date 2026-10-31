// priority: -6600
// -----------------------------------------------------------------------------------------------
// OpV's antimatter (docs/eras/opv.md, machines 3 and 5-8, lines 26-28 and 30-33; package OpV-B3): the antihydrogen foundry and the annihilation
// engine at home, the jet beam line, spallation target station and antiproton decelerator at Cygnus X-1 orbit, their recipe types and the items
// and fluids of the lines. The recipes come from data/grindless/tables/antimatter_opv.json (server_scripts/grindless/opv/antimatter.js). Every
// other id is F1's (opv/foundation.js).
//
//   gtceu:antihydrogen_foundry     9 x 9 x 13 Penning trap hall, home. Recipe type gtceu:antihydrogen_synthesis (c1 trap, c2 laser cool, c3 ice).
//   gtceu:annihilation_engine      11 x 11 x 11 reaction drum, home. Recipe type gtceu:annihilation_power, a GENERATOR written at its final
//                                  figure (2^29 EU/t on one 1 A OpV dynamo hatch, 2^30 EU/t on a 4 A one), one run at a time. It is not in
//                                  power/generators.js.
//   grindless:trapped_antihydrogen, cooled_antihydrogen, activated_absorber_tile, spent_acmf_hohlraum   items of the foundry and the engine.
//
// Geometry (lib/patterns.js: a slice has at most 16 rows): both are cylinders along the depth axis; the hatches sit on the back wall.
// Textures: tools/assets/Build-OpVAntimatterTextures.ps1. Names: client_scripts/grindless/opv_antimatter_lang.js.
// Published for the recipe script: global.grindless.opvAntimatter.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const AM = G.opvAntimatter || (G.opvAntimatter = {})
  const LOG = '[grindless/opv] '

  const SHIELD = 'grindless:annihilation_shield_casing'
  const SHIELD_TEXTURE = 'grindless:block/opv/annihilation_shield_casing'
  const NEG = 'grindless:neg_xhv_casing'
  const NEG_TEXTURE = 'grindless:block/opv/neg_xhv_casing'

  AM.table = 'kubejs/data/grindless/tables/antimatter_opv.json'
  AM.site = 'grindless:cygnus_x1_orbit'
  AM.items = {
    trapped_antihydrogen: { stack: 16 },
    cooled_antihydrogen: { stack: 16 },
    activated_absorber_tile: { stack: 64 },
    spent_acmf_hohlraum: { stack: 16 },
    // OpV-B3a (lines 26-28 and 31-33): the intermediates of the six lines (the cross-package ones are F1's)
    magnesium_fluoride_dust: { stack: 64 },
    ti_sapphire_boule: { stack: 16 },
    lbo_boule: { stack: 16 },
    kr_tripler_cell: { stack: 16 },
    octupole_tape: { stack: 64 },
    octupole_winding: { stack: 16 },
    potted_octupole_winding: { stack: 16 },
    cooled_octupole_winding: { stack: 16 },
    hopg_blank: { stack: 64 },
    hopg_plate: { stack: 64 },
    hopg_offcut: { stack: 64 },
    w_re_alloy_ingot: { stack: 64 },
    cm245_fraction: { stack: 16 },
    w_re_hohlraum: { stack: 16 },
    boron_10_dust: { stack: 64 },
    b4c_10_dust: { stack: 64 },
    w_b4c_powder: { stack: 64 },
    gasb_boule: { stack: 16 },
    gasb_wafer: { stack: 64 },
    gasb_kerf_dust: { stack: 64 },
    ingaassb_epi_wafer: { stack: 16 }
  }
  AM.fluids = { purified_krypton: 'Kr', dt_fill: 'DT', cold_dt_fill: 'DT(cold)' }

  // items in include the programmed circuit; tips: the tooltip lines after the first, as lang keys without the machine prefix
  AM.machines = [
    {
      name: 'antihydrogen_foundry', machine: 'gtceu:antihydrogen_foundry', type: 'antihydrogen_synthesis', dataKey: 'grindless_antihydrogen_synthesis',
      lang: 'Antihydrogen Foundry', maxIO: { itemsIn: 6, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }, casing: NEG, texture: NEG_TEXTURE,
      generator: false, site: false, width: 9, height: 9, depth: 13, tips: ['tooltip.1'],
      pal: { F: NEG, W: SHIELD, C: 'gtceu:superconducting_coil', L: 'gtceu:fusion_glass', P: 'gtceu:tungstensteel_pipe_casing' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 2 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    },
    {
      // One 1 A OpV dynamo holds c1; c2 requires a 4 A OpV dynamo.
      name: 'annihilation_engine', machine: 'gtceu:annihilation_engine', type: 'annihilation_power', dataKey: 'grindless_annihilation_power',
      lang: 'Annihilation Engine', maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 1, fluidsOut: 0 }, casing: SHIELD, texture: SHIELD_TEXTURE,
      generator: true, site: false, width: 11, height: 11, depth: 11, tips: ['tooltip.1', 'tooltip.2'],
      pal: { F: SHIELD, C: 'gtceu:fusion_coil', V: 'gtceu:heat_vent', P: 'gtceu:tungstensteel_pipe_casing' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('energy_output', { min: 1, max: 4 })
        ]
      }
    }
  ]

  function abs(n) { return n < 0 ? -n : n }

  // the engine runs at home only, and only through OpV (2^29 EU/t) dynamo hatches: a lower tier would be a loss of the cell
  var OPV_VOLTAGE = 536870912
  var HOME = 'minecraft:overworld'
  var CAPS = null
  var guardFailed = false
  var KEEP = { which: 'items', reason: 'grindless.machine.annihilation_engine.no_voiding', name: 'annihilation engine' }
  AM.engineAllowed = function (site, outputs, eut) {
    if (site !== HOME || outputs.length === 0) return false
    var capacity = 0
    var fourAmp = false
    for (var i = 0; i < outputs.length; i++) {
      if (outputs[i].voltage !== OPV_VOLTAGE || !(outputs[i].amps > 0)) return false
      capacity += outputs[i].voltage * outputs[i].amps
      if (outputs[i].amps >= 4) fourAmp = true
    }
    return eut > 0 && capacity >= eut && (eut < 1073741824 || fourAmp)
  }
  function engineVeto(machine, recipe) {
    try {
      if (CAPS === null) {
        CAPS = {
          IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
          EUCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP
        }
      }
      var handlers = machine.getCapabilitiesFlat(CAPS.IO.OUT, CAPS.EUCap)
      var outputs = []
      for (var i = 0; i < handlers.size(); i++) {
        var h = handlers.get(i)
        if (typeof h.getOutputVoltage !== 'function' || typeof h.getOutputAmperage !== 'function') {
          throw new Error('EU output handler has no dynamo voltage/amperage')
        }
        outputs.push({ voltage: Number(h.getOutputVoltage()), amps: Number(h.getOutputAmperage()) })
      }
      return !AM.engineAllowed(String(machine.getLevel().dimension().location()), outputs, G.generators.recipeEUt(recipe))
    } catch (e) {
      if (!guardFailed) {
        guardFailed = true
        console.error(LOG + 'annihilation engine guard failed: ' + e)
      }
      return true
    }
  }
  AM.engineVeto = engineVeto
  var keepBefore = G.noVoiding.beforeWorking(KEEP)
  AM.engineBeforeWorking = function (machine, recipe) {
    if (!keepBefore(machine, recipe)) return false
    if (!engineVeto(machine, recipe)) return true
    try {
      Java.loadClass('com.gregtechceu.gtceu.api.machine.trait.RecipeLogic')
        .putFailureReason(machine, recipe, Text.translate('grindless.machine.annihilation_engine.home_dynamo'))
      machine.getRecipeLogic().markLastRecipeDirty()
    } catch (e) {
      console.error(LOG + 'annihilation engine could not record its start refusal: ' + e)
    }
    return false
  }

  // x left to right, y bottom to top, z back (0) to front (12): a trap tube of five rings round an empty bore. The outer ring alternates the
  // appearance casing with bands of shield, the coil ring sits inside it (pipe spokes on every fourth layer), then glass. The back wall carries
  // the hatches.
  function foundryCell(x, y, z) {
    var dx = x - 4
    var dy = y - 4
    var r = Math.sqrt(dx * dx + dy * dy)
    if (r > 4.5) return ' '
    if (z === 0) return r >= 3.5 ? 'W' : (abs(dx) + abs(dy) <= 2 ? 'X' : 'F')
    if (z === 12) return r >= 3.5 ? 'W' : (r <= 1.5 ? 'L' : 'F')
    if (r > 3.5) return z % 3 === 0 ? 'W' : 'F'
    if (r > 2.5) {
      if (z % 4 === 2 && (dx === 0 || dy === 0)) return 'P'
      return z % 2 === 0 ? 'C' : 'F'
    }
    if (r > 1.5) return 'L'
    return '#'
  }

  // a drum on its axis: a casing skin, a ring of coils and vents (alternating by layer), a ring of pipe with axis spokes and the bore; the
  // ends are narrower. The dynamo hatches and the buses are on the back wall.
  function engineCell(x, y, z) {
    var dx = x - 5
    var dy = y - 5
    var r = Math.sqrt(dx * dx + dy * dy)
    var edge = z === 0 || z === 10
    var big = z === 1 || z === 9
    var rad = edge ? 4.5 : (big ? 5.2 : 5.5)
    if (r > rad) return ' '
    if (z === 0) return abs(dx) <= 1 && abs(dy) <= 1 ? 'X' : (r > 3.5 ? 'F' : 'P')
    if (z === 10) return r > 3.5 ? 'F' : 'P'
    if (r > rad - 1) return 'F'
    if (r > rad - 2) return z % 2 === 0 ? 'C' : 'V'
    if (r > 2.5) return dx === 0 || dy === 0 ? 'P' : 'F'
    return '#'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(),
      fn: m.name === 'antihydrogen_foundry' ? foundryCell : engineCell
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
    Object.keys(AM.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(AM.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(AM.fluids).forEach(function (name) {
      event.create('grindless:' + name).gas().color(0xB0C8E8).formula(AM.fluids[name])
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    AM.machines.forEach(function (m) {
      event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    AM.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var builder = event.create(m.name, 'multiblock')
      if (m.generator) {
        var opts = { maxParallels: 1, name: m.name, veto: engineVeto }
        builder = G.generators.configure(builder, opts)
          .recipeModifier(G.noVoiding.modifier(KEEP, G.generators.modifier(opts)), true)
          .beforeWorking(AM.engineBeforeWorking)
      } else builder = builder.recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      var tips = [
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
      ]
      m.tips.forEach(function (t) { tips.push(Text.translate('grindless.machine.' + m.name + '.' + t)) })
      if (m.site) tips.push(Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.cygnus_x1_orbit')))
      if (!m.generator) tips.push(Text.translate('gtceu.multiblock.parallelizable.tooltip'))
      builder
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"](tips)
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
