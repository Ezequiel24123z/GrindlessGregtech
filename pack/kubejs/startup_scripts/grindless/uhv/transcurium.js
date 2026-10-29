// priority: -8800
// -----------------------------------------------------------------------------------------------
// UHV's transcurium line (docs/eras/uhv.md, machines 1 and 2, lines 1-3 and 25; package UHV-A1): the high flux reactor and the
// transuranium facility, their recipe types, and the line-25 materials UHV-F1 did not register. The recipes come from
// data/grindless/tables/transcurium.json (server_scripts/grindless/uhv/transcurium.js); the older rows from transcurium_fabrication.json
// (IV's fuel fabrication plant, read by iv/uranium_cycle.js), transcurium_pyroprocessing.json (UV's pyroprocessing cell, read by
// uv/thorium.js) and one row of hot_cell.json (IV's hot cell, nickel-62).
//
//   gtceu:high_flux_reactor      ORNL's HFIR: a flux trap in a light-water pool, ringed by U-233 driver elements and a beryllium
//                                reflector. Electric multiblock in radiation-proof casing (IV's hot cell shell); it refuses to void
//                                (the spent drivers and the activated cladding are contained). Not a generator: its heat is rejected.
//   gtceu:high_flux_irradiation  its recipe type (EU in). Circuit 1: a transcurium target. 2: nickel-62 targets. 3: a californium-252
//                                charge sealed as a neutron source.
//   gtceu:transuranium_facility  ORNL's REDC: a shielded cave, a glovebox train and ion-exchange columns, with a decay store vault.
//   gtceu:transuranium_processing its recipe type (EU in). Circuit 1: dissolve. 2: HDEHP separation. 3: the decay store (thorium-229
//                                milked from aged uranium-233; its long time is the ingrowth, so it is never overclocked). 4: a new
//                                target. 5: the fission product liquor evaporated. 6: the spent solvent incinerated.
//
// New ids (the F1 ones are in uhv/foundation.js and are not registered again):
//   materials ethylhexenal, ethylhexanol, phosphoryl_chloride, hdehp_extractant (line 25, before F1's hdehp_solvent),
//             transcurium_liquor, fission_product_liquor, spent_hdehp_solvent
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): the reactor is 9 x 9 x 11 (a tungstensteel flux-trap column,
// a heatproof driver annulus and a beryllium reflector ring in an open pool), the facility 9 x 7 x 9 (four PTFE ion-exchange columns,
// a light-concrete decay store vault, a laminated-glass glovebox window in the front wall).
// Textures: tools/assets/Build-UHVTranscuriumTextures.ps1. Names: client_scripts/grindless/uhv_transcurium_lang.js.
// Published for the recipe script: global.grindless.transcurium.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const TC = G.transcurium || (G.transcurium = {})
  const LOG = '[grindless/uhv] '

  const SHIELD = 'gtnn:radiation_proof_machine_casing'
  const SHIELD_TEXTURE = 'gtnn:block/casings/solid/radiation_proof_machine_casing'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const TUNGSTEN_PIPE = 'gtceu:tungstensteel_pipe_casing'
  const HEAT = 'gtceu:heatproof_machine_casing'
  const GLASS = 'gtceu:laminated_glass'
  const CONCRETE = 'gtceu:light_concrete'
  // the pack has no beryllium reflector casing: GTM's beryllium block stands for it
  const BERYLLIUM = 'gtceu:beryllium_block'

  TC.table = 'kubejs/data/grindless/tables/transcurium.json'
  TC.reactorNoVoiding = 'grindless.machine.high_flux_reactor.no_voiding'
  TC.facilityNoVoiding = 'grindless.machine.transuranium_facility.no_voiding'
  // the decay store's recipe: never overclocked (its time is the ingrowth of thorium-229)
  TC.decayStore = 'decay_store'
  TC.materials = {
    ethylhexenal: { colour: 0xE8D890, formula: 'C8H14O' },
    ethylhexanol: { colour: 0xF0EAC8, formula: 'C8H18O' },
    phosphoryl_chloride: { colour: 0xD8E0C0, formula: 'POCl3' },
    hdehp_extractant: { colour: 0xE0C890, formula: 'C16H35O4P' },
    transcurium_liquor: { colour: 0x6FB08A, formula: '(CmBkCf)(NO3)3', acid: true, radioactive: true },
    fission_product_liquor: { colour: 0x8A7A3A, formula: '(FP)(NO3)', acid: true, radioactive: true },
    spent_hdehp_solvent: { colour: 0x9A8A60, formula: '(C16H35O4P)(C12H26)(spent)' }
  }

  TC.machines = {
    reactor: {
      name: 'high_flux_reactor',
      machine: 'gtceu:high_flux_reactor',
      type: 'high_flux_irradiation',
      dataKey: 'grindless_high_flux_irradiation',
      lang: 'High Flux Reactor',
      // items in: the target, the drivers and the circuit; out: the target, the spent drivers, the waste; fluid in: the pool charge
      maxIO: { itemsIn: 3, itemsOut: 3, fluidsIn: 1, fluidsOut: 0 },
      width: 9, depth: 9, height: 11,
      bands: [null, 'C', 'C', 'F', 'F', 'L', 'F', 'F', 'T', 'F', null]
    },
    facility: {
      name: 'transuranium_facility',
      machine: 'gtceu:transuranium_facility',
      type: 'transuranium_processing',
      dataKey: 'grindless_transuranium_processing',
      lang: 'Transuranium Facility',
      // items in: curium, americium, aluminium and the circuit; fluids out: the solvent, the spent solvent and the nitric acid back
      maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 3 },
      width: 9, depth: 9, height: 7,
      bands: [null, 'C', 'L', 'L', 'F', 'T', null]
    }
  }

  // The wall skin: frame posts (Q) on the corners and the roof edges, ribs of heatproof casing (H) across the roof, and the wall rows of
  // m.bands (bottom -> top): C concrete, F shield, T pipe, L glass between shield mullions.
  function skin(m, r, si, c) {
    var ex = c === 0 || c === m.width - 1
    var ez = si === 0 || si === m.depth - 1
    var top = r === m.height - 1
    if ((ex && ez) || (top && (ex || ez))) return 'Q'
    if (top) return si % 3 === 1 ? 'H' : 'F'
    var band = m.bands[r]
    if (band === 'L') return (ez ? c : si) % 3 === 0 ? 'F' : 'L'
    return band
  }

  // A shell: row 0 (X) takes the parts (frame feet on the corners), the walls are skinned, S is the controller (front wall, row 1, middle).
  function shell(m, inner) {
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
          if (r === 0) ch = (si === 0 || si === last) && (c === 0 || c === m.width - 1) ? 'Q' : 'X'
          else if (si === last && r === 1 && c === mid) ch = 'S'
          else if (r === m.height - 1 || isWall) ch = skin(m, r, si, c)
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // the flux trap (T) up the middle, the driver annulus (H) round it, the beryllium reflector (B) round that, a ring of pool-inlet
  // manifold (P) on the floor; the rest is the pool
  function reactorInner(r, si, c) {
    var ring = Math.max(Math.abs(c - 4), Math.abs(si - 4))
    if (ring === 0) return 'T'
    if (r >= 3 && r <= 7) {
      if (ring === 1) return 'H'
      if (ring === 2) return 'B'
    }
    if (r === 1 && ring === 3) return 'P'
    return '#'
  }

  // four ion-exchange columns (P), the decay store vault (C) on the floor
  function facilityInner(r, si, c) {
    var dx = Math.abs(c - 4)
    var dz = Math.abs(si - 4)
    if (dx === 2 && dz === 2) return 'P'
    if (r <= 2 && dx <= 1 && dz <= 1) return 'C'
    return '#'
  }

  function specOf(m, inner, parts) {
    return {
      slices: shell(m, inner),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(SHIELD)].concat(parts)),
        F: Pat.block(SHIELD),
        Q: Pat.frame(['tungsten_steel']),
        T: Pat.block(TUNGSTEN_PIPE),
        H: Pat.block(HEAT),
        B: Pat.block(BERYLLIUM),
        P: Pat.block(PIPE),
        C: Pat.block(CONCRETE),
        L: Pat.block(GLASS),
        '#': Pat.air()
      }
    }
  }
  TC.machines.reactor.spec = specOf(TC.machines.reactor, reactorInner, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 1 }),
    Pat.part('output_bus', { min: 1, max: 2 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])
  TC.machines.facility.spec = specOf(TC.machines.facility, facilityInner, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 2 }),
    Pat.part('output_bus', { min: 1, max: 2 }),
    Pat.part('output_hatch', { min: 1, max: 3 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])

  // ---------------------------------------------------------------- modifiers

  function reactorModifier() {
    return G.noVoiding.modifier({ which: 'both', reason: TC.reactorNoVoiding, name: 'high flux reactor' }, G.parallelHatch.overclock)
  }

  function facilityModifier() {
    var key = TC.machines.facility.dataKey
    var failed = false
    return G.noVoiding.modifier({ which: 'both', reason: TC.facilityNoVoiding, name: 'transuranium facility' }, function (machine, recipe) {
      try {
        if (String(recipe.data.getString(key)) === TC.decayStore) return ModifierFunction.IDENTITY
      } catch (e) {
        if (!failed) {
          failed = true
          console.error(LOG + 'transuranium facility decay store check failed: ' + e)
        }
      }
      return G.parallelHatch.overclock(machine, recipe)
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

  // ---------------------------------------------------------------- materials

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(TC.materials).forEach(function (name) {
      var spec = TC.materials[name]
      var material = event.create(name)
      if (spec.acid) material.liquid(new GTFluidBuilder().attribute(GTFluidAttributes.ACID))
      else material.liquid()
      material.color(spec.colour).formula(spec.formula)
      if (spec.radioactive) material.radioactiveHazard(1)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var reactor = TC.machines.reactor
    event.create(reactor.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(reactor.maxIO.itemsIn, reactor.maxIO.itemsOut, reactor.maxIO.fluidsIn, reactor.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_FUSION, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
    var facility = TC.machines.facility
    event.create(facility.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(facility.maxIO.itemsIn, facility.maxIO.itemsOut, facility.maxIO.fluidsIn, facility.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var reactor = TC.machines.reactor
    var facility = TC.machines.facility
    var reactorType = GTRecipeTypes.get(reactor.type)
    var facilityType = GTRecipeTypes.get(facility.type)
    if (reactorType == null) throw new Error(LOG + 'recipe type gtceu:' + reactor.type + ' is not registered')
    if (facilityType == null) throw new Error(LOG + 'recipe type gtceu:' + facility.type + ' is not registered')
    reactorType.addDataInfo(infoOf(reactor.dataKey))
    facilityType.addDataInfo(infoOf(facility.dataKey))
    Pat.register(reactor.machine, reactor.spec)
    Pat.register(facility.machine, facility.spec)

    event.create(reactor.name, 'multiblock')
      .langValue(reactor.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(reactor.type)
      .recipeModifier(reactorModifier(), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: TC.reactorNoVoiding, name: 'high flux reactor' }))
      .appearanceBlock(function () { return Block.getBlock(SHIELD) })
      .pattern(function (def) { return Pat.build(def, reactor.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.high_flux_reactor.tooltip.0'),
        Text.translate('grindless.machine.high_flux_reactor.tooltip.1'),
        Text.translate('grindless.machine.high_flux_reactor.tooltip.2')
      ])
      .workableCasingModel(SHIELD_TEXTURE, 'grindless:block/multiblock/high_flux_reactor')

    event.create(facility.name, 'multiblock')
      .langValue(facility.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(facility.type)
      .recipeModifier(facilityModifier(), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'both', reason: TC.facilityNoVoiding, name: 'transuranium facility' }))
      .appearanceBlock(function () { return Block.getBlock(SHIELD) })
      .pattern(function (def) { return Pat.build(def, facility.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.transuranium_facility.tooltip.0'),
        Text.translate('grindless.machine.transuranium_facility.tooltip.1'),
        Text.translate('grindless.machine.transuranium_facility.tooltip.2')
      ])
      .workableCasingModel(SHIELD_TEXTURE, 'grindless:block/multiblock/transuranium_facility')
  })
})()
