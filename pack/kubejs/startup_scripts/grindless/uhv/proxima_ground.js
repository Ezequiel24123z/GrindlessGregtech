// priority: -8500
// -----------------------------------------------------------------------------------------------
// UHV's Proxima ground (docs/eras/uhv.md, machines 29 and 31, lines 16, 17 and 18; package UHV-B5): the cold-trap drill and the
// biomining heap on Proxima b, their recipe types, items and blocks. The recipes come from data/grindless/tables/proxima_ground.json
// (server_scripts/grindless/uhv/proxima_ground.js), with the platinum plant's row (circuit 6) and the tholin reformer's (circuit 4)
// hosted in that table; the other older rows are in ev/extraction_cascade.js (circuit 7), ev/regolith_cell.js (circuit 2) and
// tables/heavy_water_plant.json (circuit 3).
//
//   gtceu:cold_trap_drill   the drill family's step 13: a tidally locked planet freezes its volatiles on the night side; a
//                           californium-252 source logs the ice by neutrons and the regolith survey tells where, then a coring head
//                           bites. Proxima b's night side only (biome gcyr:proxima_centauri_b_opp_side). Type gtceu:cold_trap_drilling.
//   gtceu:biomining_heap    a lined heap pad with drip irrigation: bacteria leach PGMs (Chromobacterium) and rare earths (Sphingomonas)
//                           from the cold-trap regolith, and cement regolith into stone (Sporosarcina, MICP). Proxima b only. Type
//                           gtceu:biomining.
//
// New ids (the F1 ones are in uhv/foundation.js and the B4 ones in uhv/proxima_life.js; none is registered again):
//   items   leached_tailings (heap c1/c2 -> GTM chemical reactor's calcium row, EV regolith cell c2), urea (GTM chemical reactor ->
//           heap c3/c4), cold_trap_coring_head (assembler -> the drill's worn head, 3.13 % a run)
//   blocks  biocemented_regolith (heap c3/c4 -> proxima_base_casing), proxima_base_casing (assembler: a flare shield panel, line 15's
//           end, + biocemented regolith on a naquadah alloy frame; the drill's pad)
// Bootstrap: the drill stands on Proxima base casing, which needs biocement, which needs the drill's regolith; so the heap is built
// from GTM's inert casing and also cements lunar regolith (c4, half c3's yield) for the first pad.
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): the drill is 5 x 6 x 5 (a base-casing pad with the parts,
// four naquadah alloy frame legs, a tungstensteel pipe drill string, a frame crown round a gearbox top drive); the heap 9 x 3 x 9
// (an inert-casing liner with the parts, a two-high berm, PTFE pipe drip lines across the top, air inside).
// Textures: tools/assets/Build-UHVProximaGroundTextures.ps1. Names: client_scripts/grindless/uhv_proxima_ground_lang.js.
// Published: global.grindless.proximaGround (.machines, .ids, .table, .order).
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const PG = G.proximaGround || (G.proximaGround = {})
  const LOG = '[grindless/uhv] '

  const BASE = 'grindless:proxima_base_casing'
  const BASE_TEXTURE = 'grindless:block/uhv/proxima_base_casing'
  const INERT = 'gtceu:inert_machine_casing'
  const INERT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const TUNGSTEN_PIPE = 'gtceu:tungstensteel_pipe_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const PIPE = 'gtceu:ptfe_pipe_casing'

  PG.table = 'kubejs/data/grindless/tables/proxima_ground.json'
  PG.items = {
    leached_tailings: { stack: 64 },
    urea: { stack: 64 },
    cold_trap_coring_head: { stack: 16 }
  }
  PG.blocks = {
    biocemented_regolith: { texture: 'grindless:block/uhv/biocemented_regolith' },
    proxima_base_casing: { texture: BASE_TEXTURE }
  }
  PG.ids = {
    tailings: 'grindless:leached_tailings',
    urea: 'grindless:urea',
    coringHead: 'grindless:cold_trap_coring_head',
    biocement: 'grindless:biocemented_regolith',
    baseCasing: BASE
  }
  PG.nightSide = 'gcyr:proxima_centauri_b_opp_side'

  PG.machines = {
    drill: {
      name: 'cold_trap_drill',
      machine: 'gtceu:cold_trap_drill',
      type: 'cold_trap_drilling',
      dataKey: 'grindless_cold_trap_drilling',
      lang: 'Cold-Trap Drill',
      casing: BASE,
      texture: BASE_TEXTURE,
      // items in: the coring head, the survey, the californium source and the circuit; out: the ice core and the regolith
      maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 },
      width: 5, depth: 5, height: 6
    },
    heap: {
      name: 'biomining_heap',
      machine: 'gtceu:biomining_heap',
      type: 'biomining',
      dataKey: 'grindless_biomining',
      lang: 'Biomining Heap',
      casing: INERT,
      texture: INERT_TEXTURE,
      // items in: the regolith, urea, calcium chloride, the culture and the circuit; out: the liquor or biocement and the tailings or
      // ammonium chloride; fluid in: water
      maxIO: { itemsIn: 5, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      width: 9, depth: 9, height: 3
    }
  }

  // The drill: row 0 is the pad (X: base casing or a part; T: the drill string through it; S: the controller, front middle); rows 1-4
  // the four frame legs (F) and the drill string (T); row 5 the frame crown round the gearbox top drive (D). ' ' is anything.
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

  // The heap: row 0 is the liner (X: inert casing or a part); rows 1-2 the berm (B), S the controller (front berm, row 1, middle);
  // the drip lines (P) cross the top on slices 2, 4 and 6; the heap itself is air (#).
  function heapSlices(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var edge = si === 0 || si === last || c === 0 || c === m.width - 1
          var ch
          if (r === 0) ch = 'X'
          else if (si === last && r === 1 && c === mid) ch = 'S'
          else if (edge) ch = 'B'
          else if (r === 2 && (si === 2 || si === 4 || si === 6)) ch = 'P'
          else ch = '#'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  var M = PG.machines
  M.drill.spec = {
    slices: drillSlices(M.drill),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(Pat.block(BASE),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 })),
      F: Pat.frame(['naquadah_alloy']),
      T: Pat.block(TUNGSTEN_PIPE),
      D: Pat.block(GEARBOX)
    }
  }
  M.heap.spec = {
    slices: heapSlices(M.heap),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(Pat.block(INERT),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 })),
      B: Pat.block(INERT),
      P: Pat.block(PIPE),
      '#': Pat.air()
    }
  }
  PG.order = ['drill', 'heap']

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

  function tooltips(item, name) {
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
  }

  // ---------------------------------------------------------------- blocks and items

  StartupEvents.registry('block', function (event) {
    Object.keys(PG.blocks).forEach(function (name) {
      event.create('grindless:' + name)
        .stoneSoundType()
        .hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll(PG.blocks[name].texture)
        .item(function (item) { tooltips(item, name) })
    })
  })

  StartupEvents.registry('item', function (event) {
    Object.keys(PG.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(PG.items[name].stack)
      tooltips(item, name)
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    PG.order.forEach(function (k) {
      var m = PG.machines[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
        .setSound(k === 'drill' ? GTSoundEntries.MINER : GTSoundEntries.CHEMICAL)
    })
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    PG.order.forEach(function (k) {
      var m = PG.machines[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
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
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
