// priority: -10100
// -----------------------------------------------------------------------------------------------
// UV's materials (docs/eras/uv.md, machines 13, 14 and 15, lines 11, 14 and 15; package UV-A8): three machines, their recipe types, the
// items only they make and two GT dusts. The F1 ids they consume or make (hbn_dust, bnnt_yarn, ented_powder, <metal>_am_powder,
// fibre_laser_module, boron_10_trifluoride) are global.grindless.uvFoundation's.
//
//   gtceu:boron_nitride_reactor  hexagonal boron nitride and nanotube yarn (machine 13). 7 wide x 7 high x 9 deep on the UV casing:
//                                an induction plasma torch (naquadah coils round a PTFE gas column) and a spinning bench (tungsten steel
//                                gearboxes); parts on the back and front floor rows.
//   gtceu:boron_nitride          its recipe type (EU in); circuit 1 hBN, 2 nanotubes, 3 yarn, 4 hBN from boron-10 trifluoride.
//   gtceu:powder_in_tube_line    EnTED wire, GTM's UV superconductor, drawn from powder in a silver tube (machine 14). A 3 wide x 5 high x
//                                15 deep line on the UV casing: powder filler (steel pipe casing), swaging bench (tungsten steel
//                                gearboxes), drawing bench (assembly line units), heat-treat furnace (trinium coils); parts on the floor.
//   gtceu:powder_in_tube         its recipe type (EU in); circuit 1 powder, 2 billet, 3 draw and heat treat.
//   gtceu:powder_bed_printer     atomised powder, printed and pressed UV parts (machine 15). 7 x 7 x 7 on the UV casing: an EIGA tower
//                                (naquadah coils under a PTFE column), a print bed (assembly line grating) and a hot isostatic press
//                                (tungsten steel firebox casing under a tungsten steel frame).
//   gtceu:powder_bed_fusion      its recipe type (EU in); circuit 1 atomise, 2 GTM part, 3 press, 4-6 the parts GTM lacks
//                                (data/grindless/tables/am_powders.json).
//
// Items (grindless:, names in client_scripts/grindless/uv_materials_lang.js): bnnt_dust, silver_tube, pit_billet, the near-net parts and the
// printed parts with no GTM recipe (printed_thruster_chamber for machine 17, printed_array_mount for the launcher, printed_probe_frame for
// the probes). GT dusts: gtceu:boric_acid_dust, gtceu:boron_trioxide_dust (borax -> boric acid -> boron trioxide, c1's feed).
//
// Parts: 1-2 energy hatches and the buses and hatches each type needs (see .parts), at least 8 casings among the part cells. Textures: the
// methane pyrolyser's overlay (reactor), the coated conductor line's (line), the diamond lattice fab's (printer), all on the UV casing; item
// icons from tools/assets/Build-UVMaterialsTextures.ps1. Published: global.grindless.materials.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const M = G.materials || (G.materials = {})

  const REACTOR = 'gtceu:boron_nitride_reactor'
  const REACTOR_TYPE = 'boron_nitride'
  const LINE = 'gtceu:powder_in_tube_line'
  const LINE_TYPE = 'powder_in_tube'
  const PRINTER = 'gtceu:powder_bed_printer'
  const PRINTER_TYPE = 'powder_bed_fusion'

  const CASING = 'gtceu:uv_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const REACTOR_OVERLAY = 'grindless:block/multiblock/methane_pyrolyser'
  const LINE_OVERLAY = 'grindless:block/multiblock/coated_conductor_line'
  const PRINTER_OVERLAY = 'grindless:block/multiblock/diamond_lattice_fab'
  const TORCH_COIL = 'gtceu:naquadah_coil_block'
  const FURNACE_COIL = 'gtceu:trinium_coil_block'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const PTFE = 'gtceu:ptfe_pipe_casing'
  const FILLER = 'gtceu:steel_pipe_casing'
  const BENCH = 'gtceu:assembly_line_unit'
  const BED = 'gtceu:assembly_line_grating'
  const FIREBOX = 'gtceu:tungstensteel_firebox_casing'
  const PRESS = 'tungsten_steel'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    bnnt_dust: { stack: 64 },
    silver_tube: { stack: 64 },
    pit_billet: { stack: 16 },
    near_net_neutronium_gear: { stack: 16 },
    near_net_darmstadtium_rotor: { stack: 16 },
    near_net_tritanium_gear: { stack: 16 },
    near_net_thruster_chamber: { stack: 16 },
    near_net_array_mount: { stack: 16 },
    near_net_probe_frame: { stack: 16 },
    printed_thruster_chamber: { stack: 16 },
    printed_array_mount: { stack: 16 },
    printed_probe_frame: { stack: 16 }
  }

  // GT material name -> dust colours and formula (decomposition off: the borax route is the only one)
  const MATERIALS = {
    boric_acid: { colour: 0xF4F1E6, secondary: 0xC8C2AE, formula: 'H3BO3' },
    boron_trioxide: { colour: 0xE6E2D0, secondary: 0xA8A08A, formula: 'B2O3' }
  }

  M.reactor = REACTOR
  M.line = LINE
  M.printer = PRINTER
  M.reactorType = 'gtceu:' + REACTOR_TYPE
  M.lineType = 'gtceu:' + LINE_TYPE
  M.printerType = 'gtceu:' + PRINTER_TYPE
  M.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  M.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })
  M.table = 'kubejs/data/grindless/tables/am_powders.json'
  M.ids = {
    bnntDust: 'grindless:bnnt_dust',
    silverTube: 'grindless:silver_tube',
    pitBillet: 'grindless:pit_billet',
    printedThrusterChamber: 'grindless:printed_thruster_chamber',
    printedArrayMount: 'grindless:printed_array_mount',
    printedProbeFrame: 'grindless:printed_probe_frame',
    boricAcidDust: 'gtceu:boric_acid_dust',
    boronTrioxideDust: 'gtceu:boron_trioxide_dust'
  }
  // reactor: items in 3 (a dust and the circuit; UEV-A5's interphase: SiC fibre, B2O3 and the circuit), out 2 (product and hBN fines), fluids in 2 (ammonia and hydrogen or BF3), out 2;
  // line: items in 5 (four dusts and the circuit), out 2 (wire and the sheath's silver), no fluids;
  // printer: items in 3 (powder, laser module, circuit), out 3 (part, powder back, spent module), argon in and out
  M.reactorIO = { itemsIn: 3, itemsOut: 2, fluidsIn: 2, fluidsOut: 2 }
  M.lineIO = { itemsIn: 5, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 }
  M.printerIO = { itemsIn: 3, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 }
  M.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 3 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 },
    minCasings: 8
  }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells(fluids) {
    var options = [
      Pat.block(CASING, { min: M.parts.minCasings }),
      Pat.part('energy_input', M.parts.energy_input),
      Pat.part('input_bus', M.parts.input_bus),
      Pat.part('output_bus', M.parts.output_bus)
    ]
    if (fluids) {
      options.push(Pat.part('input_hatch', M.parts.input_hatch))
      options.push(Pat.part('output_hatch', M.parts.output_hatch))
    }
    return Pat.oneOf.apply(null, options)
  }

  // 7 x 7 shell: a wall slice with a floor row of parts, a ring slice with its five interior rows (bottom -> top), the front with S
  function wall7() { return ['XXXXXXX', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR'] }
  function ring7(interior) {
    var rows = ['RRRRRRR']
    interior.forEach(function (row) { rows.push('R' + row + 'R') })
    rows.push('RRRRRRR')
    return rows
  }
  function front7() { return ['XXXXXXX', 'RRRSRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR'] }
  const EMPTY5 = '#####'
  const HOLLOW = [EMPTY5, EMPTY5, EMPTY5, EMPTY5, EMPTY5]
  const TORCH = ['##K##', '##K##', '##K##', '##P##', '##P##']
  const BENCHES = ['GG#GG', EMPTY5, EMPTY5, EMPTY5, EMPTY5]

  // QR-S3: dress(slices, wall, rule) rewrites plain wall cells (char `wall`) through rule(x, y, z, W, H, D) -> char or null. Row 0 is never touched.
  function dress(slices, wall, rule) {
    var D = slices.length
    var H = slices[0].length
    var W = slices[0][0].length
    return slices.map(function (rows, z) {
      return rows.map(function (row, y) {
        if (y === 0) return row
        var out = ''
        for (var x = 0; x < W; x++) {
          var ch = row.charAt(x)
          var r = ch === wall ? rule(x, y, z, W, H, D) : null
          out += r || ch
        }
        return out
      })
    })
  }
  function isEdge(x, z, W, D) { return (x === 0 || x === W - 1) && (z === 0 || z === D - 1) }
  // reactor: frame posts, a naquadah induction coil band, glass sight windows, a ptfe/glass stripe over the roof
  function reactorRule(x, y, z, W, H, D) {
    var onX = x === 0 || x === W - 1
    var onZ = z === 0 || z === D - 1
    if (isEdge(x, z, W, D)) return 'Z'
    if (y === H - 1) {
      if (onX || onZ) return 'Z'
      if (x === 3) return 'P'
      return (x === 1 || x === 5) ? 'W' : null
    }
    var idx = onX ? z : x
    if (y === 3) return 'K'
    if (y === 2 || y === 5) return idx % 2 === 1 ? 'W' : null
    return null
  }
  // line: a long hall: frame rails along the roof edges, frame posts every fourth cell, glass windows, a pipe run on the roof
  function lineRule(x, y, z, W, H, D) {
    if (y === 4) {
      if (x !== 1) return 'Z'
      return z % 3 === 0 ? 'P' : null
    }
    if (y === 1) return null
    if (z % 4 === 0) return 'Z'
    if (y === 2) return 'W'
    return null
  }
  // printer: frame posts and roof edges, a heatproof band, glass print windows, a glass skylight
  function printerRule(x, y, z, W, H, D) {
    var onX = x === 0 || x === W - 1
    var onZ = z === 0 || z === D - 1
    if (isEdge(x, z, W, D)) return 'Z'
    if (y === H - 1) {
      if (onX || onZ) return 'Z'
      return (x >= 2 && x <= 4 && z >= 2 && z <= 4) ? 'W' : null
    }
    var idx = onX ? z : x
    if (y === 2) return 'H'
    if (y === 3) return 'K'
    if (y === 4) return idx % 2 === 1 ? 'W' : null
    return null
  }

  const REACTOR_SPEC = {
    slices: dress([wall7(), ring7(HOLLOW), ring7(TORCH), ring7(TORCH), ring7(HOLLOW), ring7(BENCHES), ring7(BENCHES), ring7(HOLLOW), front7()], 'R', reactorRule),
    symbols: {
      S: Pat.controller(),
      X: cells(true),
      R: Pat.block(CASING),
      Z: Pat.frame(['tungsten_steel']),
      W: Pat.block('gtceu:fusion_glass'),
      K: Pat.block(TORCH_COIL),
      P: Pat.block(PTFE),
      G: Pat.block(GEARBOX),
      '#': Pat.air()
    }
  }
  M.reactorSpec = REACTOR_SPEC

  // 3 x 5 line: floor parts at both ends and along the sides, one interior column three high (bottom -> top)
  function line(interior) { return ['XRX', 'R' + interior[0] + 'R', 'R' + interior[1] + 'R', 'R' + interior[2] + 'R', 'RRR'] }
  const LINE_SPEC = {
    slices: dress([
      ['XXX', 'RRR', 'RRR', 'RRR', 'RRR'],
      line(['F', 'F', '#']), line(['F', '#', '#']), line(['#', '#', '#']),
      line(['G', '#', '#']), line(['G', '#', '#']), line(['#', '#', '#']),
      line(['A', '#', '#']), line(['A', '#', '#']), line(['A', '#', '#']), line(['#', '#', '#']),
      line(['K', 'K', '#']), line(['K', 'K', '#']), line(['K', 'K', '#']),
      ['XXX', 'RSR', 'RRR', 'RRR', 'RRR']
    ], 'R', lineRule),
    symbols: {
      S: Pat.controller(),
      X: cells(false),
      R: Pat.block(CASING),
      Z: Pat.frame(['tungsten_steel']),
      W: Pat.block('gtceu:fusion_glass'),
      P: Pat.block('gtceu:tungstensteel_pipe_casing'),
      F: Pat.block(FILLER),
      G: Pat.block(GEARBOX),
      A: Pat.block(BENCH),
      K: Pat.block(FURNACE_COIL),
      '#': Pat.air()
    }
  }
  M.lineSpec = LINE_SPEC

  const PRINTER_SPEC = {
    slices: dress([
      wall7(),
      ring7(['K####', 'K####', 'K####', 'P####', 'P####']),
      ring7(['KBBB#', 'K####', 'K####', 'P####', 'P####']),
      ring7(['#BBBF', '####F', '####M', '####M', EMPTY5]),
      ring7(['#BBBF', '####F', '####M', '####M', EMPTY5]),
      ring7(['####F', '####F', EMPTY5, EMPTY5, EMPTY5]),
      front7()
    ], 'R', printerRule),
    symbols: {
      S: Pat.controller(),
      X: cells(true),
      R: Pat.block(CASING),
      Z: Pat.frame(['tungsten_steel']),
      W: Pat.block('gtceu:fusion_glass'),
      H: Pat.block('gtceu:heatproof_machine_casing'),
      K: Pat.block(TORCH_COIL),
      P: Pat.block(PTFE),
      B: Pat.block(BED),
      F: Pat.block(FIREBOX),
      M: Pat.frame([PRESS]),
      '#': Pat.air()
    }
  }
  M.printerSpec = PRINTER_SPEC

  // ---------------------------------------------------------------- recipe types

  function recipeType(event, name, io, sound) {
    event.create(name)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(sound)
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    recipeType(event, REACTOR_TYPE, M.reactorIO, GTSoundEntries.ARC)
    recipeType(event, LINE_TYPE, M.lineIO, GTSoundEntries.MOTOR)
    recipeType(event, PRINTER_TYPE, M.printerIO, GTSoundEntries.ARC)
  })

  // ---------------------------------------------------------------- machines

  function machine(event, name, lang, type, spec, overlay) {
    event.create(name, 'multiblock')
      .langValue(lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.' + name + '.tooltip.0'),
        Text.translate('grindless.machine.' + name + '.tooltip.1'),
        Text.translate('grindless.machine.' + name + '.tooltip.2'),
        Text.translate('grindless.machine.' + name + '.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, overlay)
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(REACTOR, REACTOR_SPEC)
    Pat.register(LINE, LINE_SPEC)
    Pat.register(PRINTER, PRINTER_SPEC)
    machine(event, 'boron_nitride_reactor', 'Boron Nitride Reactor', REACTOR_TYPE, REACTOR_SPEC, REACTOR_OVERLAY)
    machine(event, 'powder_in_tube_line', 'Powder-in-Tube Line', LINE_TYPE, LINE_SPEC, LINE_OVERLAY)
    machine(event, 'powder_bed_printer', 'Powder Bed Printer', PRINTER_TYPE, PRINTER_SPEC, PRINTER_OVERLAY)
  })

  // ---------------------------------------------------------------- items and dusts

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    var acid = MATERIALS.boric_acid
    event.create('boric_acid')
      .dust()
      .color(acid.colour).secondaryColor(acid.secondary)
      .iconSet(GTMaterialIconSet.FINE)
      .components('3x hydrogen', '1x boron', '3x oxygen')
      .formula(acid.formula)
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    var oxide = MATERIALS.boron_trioxide
    event.create('boron_trioxide')
      .dust()
      .color(oxide.colour).secondaryColor(oxide.secondary)
      .iconSet(GTMaterialIconSet.FINE)
      .components('2x boron', '3x oxygen')
      .formula(oxide.formula)
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })
})()
