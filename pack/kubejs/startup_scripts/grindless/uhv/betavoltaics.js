// priority: -7700
// -----------------------------------------------------------------------------------------------
// UHV's water and betavoltaics (docs/eras/uhv.md, machines 9 and 10, lines 4, 11 and 22; package UHV-A3): the ultrapure water plant and
// the betavoltaic fab, their recipe types, the p-i-n diamond diode and the materials of lines 4 and 22. The recipes come from
// data/grindless/tables/betavoltaics.json (server_scripts/grindless/uhv/betavoltaics.js), which also holds the older rows of the
// package: the diamond lattice fab's circuits 5 and 6 (ZPM, type gtceu:diamond_cvd, whose item slots zpm/qubits.js widened for the
// dopants), the isotope column's circuit 3 (ZPM, Saturn orbit) and the methanation row (GTM chemical reactor).
//
//   gtceu:ultrapure_water_plant  SEMI F63 fab waterline: reverse osmosis, electrodeionisation, 185 nm UV and ozone, membrane
//                                degassing and ultrafiltration in one train. Voiding is allowed (the RO concentrate is salt water);
//                                it takes one parallel hatch, like IV's heavy water plant.
//   gtceu:ultrapure_water        its recipe type (EU in). Circuit 1: 8,000 mB water -> 6,000 mB ultrapure water; the ion-exchange
//                                resin is kept and regenerated with HCl and NaOH.
//   gtceu:betavoltaic_fab        Betavolt BV100 / City Labs: nickel-63 plated between diamond p-i-n diodes in a glovebox. It refuses to
//                                void (the plating liquor is radioactive and contained).
//   gtceu:betavoltaic            its recipe type (EU in). Circuit 1: nickel-63 targets to plating liquor. 2: the cells. 3: the depleted
//                                bath stripped (the nitric acid back to circuit 1, the nickel-62 leftover to IV's hot cell).
//
// New ids (the F1 ones are in uhv/foundation.js and are not registered again: betavoltaic_cell, c12_diamond_spreader,
// nickel_62_target, nickel_63_target, ultrapure_water):
//   item      grindless:diamond_diode
//   materials carbon_12_monoxide, carbon_12_methane (gases, line 22); nickel_63_plating_liquor, depleted_nickel_plating_liquor (line 4)
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): the plant is 7 wide, 5 high, 11 deep (clean stainless casing:
// GTM has no water treatment casing; PTFE membrane racks, a laminated-glass UV-ozone chamber, filter casings for the ultrafiltration);
// the fab 7 x 5 x 7 (inert PTFE casing, a PTFE plating bath on the floor, gearbox arms in the glovebox, laminated-glass windows all round).
// Textures: tools/assets/Build-UHVBetavoltaicsTextures.ps1. Names: client_scripts/grindless/uhv_betavoltaics_lang.js.
// Published for the recipe script: global.grindless.betavoltaics.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const BV = G.betavoltaics || (G.betavoltaics = {})
  const LOG = '[grindless/uhv] '

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const FILTER = 'gtceu:filter_casing'
  const GLASS = 'gtceu:laminated_glass'
  const GEARBOX = 'gtceu:stainless_steel_gearbox'

  BV.table = 'kubejs/data/grindless/tables/betavoltaics.json'
  BV.fabNoVoiding = 'grindless.machine.betavoltaic_fab.no_voiding'
  BV.items = { diamond_diode: { stack: 64 } }
  BV.materials = {
    carbon_12_monoxide: { colour: 0x8AA0B8, formula: '(12C)O', gas: true },
    carbon_12_methane: { colour: 0xA8B8D0, formula: '(12C)H4', gas: true },
    nickel_63_plating_liquor: { colour: 0x7FC8A0, formula: '(63Ni)(NO3)2', acid: true, radioactive: true },
    depleted_nickel_plating_liquor: { colour: 0x6A9A80, formula: '(62Ni)(NO3)2', acid: true, radioactive: true }
  }

  BV.machines = {
    water: {
      name: 'ultrapure_water_plant',
      machine: 'gtceu:ultrapure_water_plant',
      type: 'ultrapure_water',
      dataKey: 'grindless_ultrapure_water',
      lang: 'Ultrapure Water Plant',
      casing: CLEAN, texture: CLEAN_TEXTURE, accent: INERT, frame: 'stainless_steel',
      // items in: the NaOH, the kept resin and the circuit; fluids in: water and HCl; out: the ultrapure water and the RO concentrate
      maxIO: { itemsIn: 3, itemsOut: 0, fluidsIn: 2, fluidsOut: 2 },
      width: 7, depth: 11, height: 5
    },
    fab: {
      name: 'betavoltaic_fab',
      machine: 'gtceu:betavoltaic_fab',
      type: 'betavoltaic',
      dataKey: 'grindless_betavoltaic',
      lang: 'Betavoltaic Fab',
      casing: INERT, texture: INERT_TEXTURE, accent: CLEAN, frame: 'tungsten_steel',
      // items in: the targets or the diodes and the circuit; out: the cells or the nickel; fluids: one liquor or acid in, one out
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 },
      width: 7, depth: 7, height: 5
    }
  }

  // The wall skin: frame posts (Q) on the corners and the roof edges, an accent course (A) at the foot and ribs across the roof,
  // and glass (L) between casing mullions (F) in the rows above.
  function skin(m, r, si, c) {
    var ex = c === 0 || c === m.width - 1
    var ez = si === 0 || si === m.depth - 1
    var top = r === m.height - 1
    if ((ex && ez) || (top && (ex || ez))) return 'Q'
    if (top) return si % 3 === 1 ? 'A' : 'F'
    if (r === 1) return 'A'
    return (ez ? c : si) % 3 === 0 ? 'F' : 'L'
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

  // back to front, a centre aisle (c = 3) between the racks: reverse-osmosis and EDI membrane racks (P pipe, U filter between them) on
  // both sides, the UV-ozone chamber (L, glass) across slice 5, the ultrafiltration (U) behind it
  function waterInner(r, si, c) {
    if (c === 3) return '#'
    if (si <= 4) return r === 2 ? 'U' : 'P'
    if (si === 5) return 'L'
    return 'U'
  }

  // the plating bath (P) fills the floor; a gearbox arm (G) on each side of the glovebox, a PTFE pipe feed at the back; air above
  function fabInner(r, si, c) {
    if (r === 1) return 'P'
    if (r === 2 && (c === 1 || c === 5) && si >= 2 && si <= 4) return 'G'
    return '#'
  }

  function specOf(m, inner, parts) {
    return {
      slices: shell(m, inner),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(m.casing)].concat(parts)),
        F: Pat.block(m.casing),
        Q: Pat.frame([m.frame]),
        A: Pat.block(m.accent),
        P: Pat.block(PIPE),
        U: Pat.block(FILTER),
        L: Pat.block(GLASS),
        G: Pat.block(GEARBOX),
        '#': Pat.air()
      }
    }
  }
  BV.machines.water.spec = specOf(BV.machines.water, waterInner, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 2 }),
    Pat.part('output_hatch', { min: 1, max: 2 }),
    Pat.part('energy_input', { min: 1, max: 2 }),
    G.parallelHatch.part()
  ])
  BV.machines.fab.spec = specOf(BV.machines.fab, fabInner, [
    Pat.part('input_bus', { min: 1, max: 2 }),
    Pat.part('input_hatch', { min: 1, max: 1 }),
    Pat.part('output_bus', { min: 1, max: 1 }),
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

  // ---------------------------------------------------------------- item and materials

  StartupEvents.registry('item', function (event) {
    Object.keys(BV.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(BV.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(BV.materials).forEach(function (name) {
      var spec = BV.materials[name]
      var material = event.create(name)
      if (spec.gas) material.gas()
      else if (spec.acid) material.liquid(new GTFluidBuilder().attribute(GTFluidAttributes.ACID))
      else material.liquid()
      material.color(spec.colour).formula(spec.formula)
      if (spec.radioactive) material.radioactiveHazard(1)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var water = BV.machines.water
    event.create(water.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(water.maxIO.itemsIn, water.maxIO.itemsOut, water.maxIO.fluidsIn, water.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_BATH, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.BATH)
    var fab = BV.machines.fab
    event.create(fab.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(fab.maxIO.itemsIn, fab.maxIO.itemsOut, fab.maxIO.fluidsIn, fab.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var water = BV.machines.water
    var fab = BV.machines.fab
    var waterType = GTRecipeTypes.get(water.type)
    var fabType = GTRecipeTypes.get(fab.type)
    if (waterType == null) throw new Error(LOG + 'recipe type gtceu:' + water.type + ' is not registered')
    if (fabType == null) throw new Error(LOG + 'recipe type gtceu:' + fab.type + ' is not registered')
    waterType.addDataInfo(infoOf(water.dataKey))
    fabType.addDataInfo(infoOf(fab.dataKey))
    Pat.register(water.machine, water.spec)
    Pat.register(fab.machine, fab.spec)

    event.create(water.name, 'multiblock')
      .langValue(water.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(water.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock), true)
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, water.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.ultrapure_water_plant.tooltip.0'),
        Text.translate('grindless.machine.ultrapure_water_plant.tooltip.1'),
        Text.translate('grindless.machine.ultrapure_water_plant.tooltip.2')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/ultrapure_water_plant')

    var fabOpts = { which: 'both', reason: BV.fabNoVoiding, name: 'betavoltaic fab' }
    event.create(fab.name, 'multiblock')
      .langValue(fab.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(fab.type)
      .recipeModifier(G.noVoiding.modifier(fabOpts, G.parallelHatch.overclock), true)
      .beforeWorking(G.noVoiding.beforeWorking(fabOpts))
      .appearanceBlock(function () { return Block.getBlock(INERT) })
      .pattern(function (def) { return Pat.build(def, fab.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.betavoltaic_fab.tooltip.0'),
        Text.translate('grindless.machine.betavoltaic_fab.tooltip.1'),
        Text.translate('grindless.machine.betavoltaic_fab.tooltip.2')
      ])
      .workableCasingModel(INERT_TEXTURE, 'grindless:block/multiblock/betavoltaic_fab')
  })
})()
