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
  var SIC = 'grindless:sic_composite_casing'
  var SIC_TEXTURE = 'grindless:block/uev/sic_composite_casing'
  // the drill's derrick is a field rig: superhydride magnet body (the casing takes no Barnard product since batch 16)
  M.drill.casing = 'grindless:superhydride_magnet_casing'
  M.drill.texture = 'grindless:block/uev/superhydride_magnet_casing'
  M.refinery.casing = SIC
  M.refinery.texture = SIC_TEXTURE

  function bodyPal(primary) {
    var pal = G.uevShapes.palette(primary)
    pal.C = TUNGSTEN_PIPE
    pal.P = PIPE
    return pal
  }

  // The refinery: a Mond plant. A lined hall holds the carbonylation reactors (gearbox feed pumps), and two columns rise from it: the
  // banded decomposer tower with its pipe rack and a slim vent stack. Built in the registry callback (shapes.js may load after this file).
  M.refinery.width = 11
  M.refinery.height = 19
  M.refinery.depth = 13
  M.refinery.makeSpec = function () {
    var m = M.refinery
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth,
      parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        G.parallelHatch.part()
      ],
      fn: (function () {
        var s = G.uevShapes.scene(11, 19, 13)
        s.box(0, 0, 0, 10, 0, 12, 'X')
        s.room(0, 1, 0, 10, 4, 12, 'F', 't')
        s.room(0, 3, 0, 10, 4, 12, 'O', 't')
        s.cyl('y', 3, 4, 2, 5, 17, 'O', true, '#')
        ;[7, 11, 15].forEach(function (y) { s.cyl('y', 3, 4, 2, y, y, 'P', true, null) })
        s.box(3, 5, 4, 3, 17, 4, 'C')
        s.cyl('y', 8, 4, 1, 5, 18, 'F', true, '#')
        ;[9, 14].forEach(function (y) { s.cyl('y', 8, 4, 1, y, y, 'P', true, null) })
        s.box(8, 5, 4, 8, 18, 4, 'C')
        s.box(4, 6, 4, 7, 6, 4, 'C').box(4, 12, 4, 7, 12, 4, 'C')
        s.box(2, 1, 2, 3, 2, 3, 'B').box(7, 1, 2, 8, 2, 3, 'B').box(5, 1, 7, 5, 3, 7, 'C')
        ;[3, 7].forEach(function (x) { s.set(x, 3, 0, 'L').set(x, 3, 12, 'L') })
        return s.booth('F', 3).fn()
      })(),
      pal: bodyPal(SIC)
    })
  }
  // The drill: a derrick. Four lattice legs with ring braces carry a gearbox top drive over the drill string; a PTFE-free pipe rack of
  // tungstensteel pipe runs beside the pad and a pump room sits at the front.
  M.drill.width = 9
  M.drill.height = 15
  M.drill.depth = 9
  M.drill.makeSpec = function () {
    var m = M.drill
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth,
      parts: [
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        G.parallelHatch.part()
      ],
      fn: (function () {
        var s = G.uevShapes.scene(9, 15, 9)
        s.box(0, 0, 0, 8, 0, 8, 'X')
        ;[0, 8].forEach(function (x) { [0, 8].forEach(function (z) { s.box(x, 1, z, x, 12, z, 'Q') }) })
        ;[4, 8].forEach(function (y) { s.edges(0, y, 0, 8, y, 8, y === 4 ? 'M' : 'O') })
        s.box(4, 1, 4, 4, 13, 4, 'C')
        s.box(3, 13, 3, 5, 14, 5, 'B')
        s.box(6, 1, 1, 7, 6, 2, 'M').box(7, 3, 3, 7, 6, 3, 'C')
        s.box(1, 1, 1, 2, 2, 3, 'B')
        return s.booth('F', 3).fn()
      })(),
      pal: bodyPal(M.drill.casing)
    })
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
