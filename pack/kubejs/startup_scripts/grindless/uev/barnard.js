// priority: -7462
// -----------------------------------------------------------------------------------------------
// UEV's Barnard b (docs/eras/uev.md, machines 21 and 22, lines 10 and 15; package UEV-B3): the Barnard core drill, the carbonyl refinery,
// the two recipe types and the package's own items. The recipes come from data/grindless/tables/barnard.json
// (server_scripts/grindless/uev/barnard.js).
//
//   gtceu:barnard_core_drill   the drill family's step 14, with its own type gtceu:barnard_core_drilling (like UHV's cold-trap drill, so the
//                              lower drills never run it): a deep core of the metal-rich crust, Barnard b only. The only source of grindless:barnard_core_rock.
//   gtceu:carbonyl_refinery    the Mond process: Barnard rock + CO -> Fe(CO)5, nickel, cobalt and a residue (Re, Os, Ir, Pt, W). The
//                              nickel and cobalt carbonyls are formed and cracked inside the vessel and never leave it. Barnard b only.
//                              Type gtceu:carbonyl_refining.
//
// New ids (the F1 ones, grindless:barnard_core_rock and gtceu:iron_pentacarbonyl, are in uev/foundation.js and
// grindless:nanotwinned_diamond_bit in uev/megabar.js; none is registered again): items barnard_residue, crude_ammonium_perrhenate,
// ammonium_perrhenate, rhenium_pellet.
// Textures: tools/assets/Build-UEVBarnardTextures.ps1. Names: client_scripts/grindless/uev_barnard_lang.js.
// Published for the recipe script: global.grindless.barnard (.machines, .items, .ids, .table, .order).
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const BA = G.barnard || (G.barnard = {})
  const LOG = '[grindless/uev] '

  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const TUNGSTEN_PIPE = 'gtceu:tungstensteel_pipe_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const PIPE = 'gtceu:ptfe_pipe_casing'

  BA.table = 'kubejs/data/grindless/tables/barnard.json'
  BA.items = {
    barnard_residue: { stack: 64 },
    crude_ammonium_perrhenate: { stack: 64 },
    ammonium_perrhenate: { stack: 64 },
    rhenium_pellet: { stack: 64 }
  }
  BA.ids = {
    residue: 'grindless:barnard_residue',
    crudePerrhenate: 'grindless:crude_ammonium_perrhenate',
    perrhenate: 'grindless:ammonium_perrhenate',
    pellet: 'grindless:rhenium_pellet',
    rock: 'grindless:barnard_core_rock',
    bit: 'grindless:nanotwinned_diamond_bit',
    survey: 'grindless:barnard_gravity_survey'
  }

  BA.machines = {
    drill: {
      name: 'barnard_core_drill',
      machine: 'gtceu:barnard_core_drill',
      type: 'barnard_core_drilling',
      ownType: true,
      dataKey: 'grindless_barnard_core_drilling',
      lang: 'Barnard Core Drill',
      casing: ROBUST,
      texture: ROBUST_TEXTURE,
      // the survey (or the circuit) and the bit in; the rock out
      maxIO: { itemsIn: 2, itemsOut: 8, fluidsIn: 0, fluidsOut: 0 },
      width: 5, depth: 5, height: 6
    },
    refinery: {
      name: 'carbonyl_refinery',
      machine: 'gtceu:carbonyl_refinery',
      type: 'carbonyl_refining',
      ownType: true,
      dataKey: 'grindless_carbonyl_refining',
      lang: 'Carbonyl Refinery',
      casing: INERT,
      texture: INERT_TEXTURE,
      // items in: the rock and the circuit; out: nickel, cobalt and the residue; fluid in: CO; out: Fe(CO)5
      maxIO: { itemsIn: 2, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 },
      width: 5, depth: 5, height: 5
    }
  }

  // The drill: row 0 is the pad (X: casing or a part; T: the drill string through it; S: the controller, front middle); rows 1-4 the four
  // frame legs (F) and the drill string (T); row 5 the frame crown round the gearbox top drive (D). ' ' is anything.
  function drillSlices(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var centre = si === mid && c === mid
          var edge = si === 0 || si === last || c === 0 || c === m.width - 1
          var corner = (si === 0 || si === last) && (c === 0 || c === m.width - 1)
          var ch
          if (r === 0) ch = centre ? 'T' : (si === last && c === mid ? 'S' : 'X')
          else if (r === m.height - 1) ch = centre ? 'D' : (edge ? 'F' : ' ')
          else ch = centre ? 'T' : (corner ? 'F' : ' ')
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  var M = BA.machines
  // The refinery: a Mond-process column. A lined base hall carries a banded shaft (PTFE pipe course, glass, tungstensteel pipe rack, gearbox
  // feed pumps in the base) under a coil-tipped vent mast. Built in the registry callback (shapes.js may load after this file).
  M.refinery.width = 7
  M.refinery.height = 12
  M.refinery.depth = 7
  M.refinery.makeSpec = function () {
    var m = M.refinery
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth,
      parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 })
      ],
      fn: G.uevShapes.tower({
        w: 7, d: 7, baseH: 3, th: 10, inset: 1, band: 3, bandChar: 'P',
        baseInner: function (x, y, z) { return (x === 2 || x === 4) && z === 3 && y === 1 ? 'B' : null },
        core: function (x, y, z) { return x === 3 && z === 3 ? 'C' : null },
        crown: G.uevShapes.mast(7, 7, 2)
      }),
      pal: { F: INERT, A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass', P: PIPE, C: TUNGSTEN_PIPE, B: GEARBOX, Q: 'tungsten_steel' }
    })
  }
  M.drill.spec = {
    slices: drillSlices(M.drill),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(Pat.block(ROBUST),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 })),
      F: Pat.frame(['tungsten_steel']),
      T: Pat.block(TUNGSTEN_PIPE),
      D: Pat.block(GEARBOX)
    }
  }
  BA.order = ['drill', 'refinery']

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
    Object.keys(BA.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(BA.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    BA.order.forEach(function (k) {
      var m = M[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
        .setSound(k === 'drill' ? GTSoundEntries.MINER : GTSoundEntries.CHEMICAL)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    BA.order.forEach(function (k) {
      var m = M[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      if (m.ownType) type.addDataInfo(infoOf(m.dataKey))
      if (m.makeSpec) m.spec = m.makeSpec()
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
