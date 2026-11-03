// priority: -8700
// -----------------------------------------------------------------------------------------------
// UHV's Dyson swarm (docs/eras/uhv.md, machines 22, 23 and 24, lines 23 and 30; package UHV-B3): the swarm segment foundry, the swarm
// control station (a generator) and the solar probe bay, their recipe types and their two items. All three are station modules in
// Mercury's orbit (gcyr:mercury_orbit, UHV-B1's eighth station slot) on LuV's station truss casing; every recipe carries
// .dimension('gcyr:mercury_orbit') (server script).
//
//   gtceu:swarm_segment_foundry  15 x 8 x 23: a hangar, a truss floor with a jig rail (the parts sit in its rim), hangar casing walls,
//                                a frame roof with an assembly line grating bridge and the assembly head (assembly line unit)
//   gtceu:swarm_segment          its recipe type (EU in). Circuit 1 builds a segment, circuit 2 refurbishes a worn one.
//   gtceu:swarm_control_station  41 x 7 x 41: a hull hub with the formation computer (computer casing) under a sapphire receiver roof, a
//                                sunshade, four booms with laser-module heads and two propellant-depot rings. A GENERATOR through
//                                lib/generators.js, written at its final figure: one run at a time (maxParallels 1), no parallel hatch,
//                                not in power/generators.js's list, never doubled. Its dynamo hatches carry the EU out; the 4 A UHV
//                                dynamo (gtceu:uhv_energy_output_hatch_4a) holds c2's 8,388,608 EU/t on its own (dynamoCapacity).
//   gtceu:dyson_swarm            its recipe type (EU out). The segments are the catalyst: every run turns 1 (c1) or 4 (c2) of them into
//                                worn segments; the oganesson propellant pods (or krypton) are the fuel.
//   gtceu:solar_probe_bay        7 x 5 x 7: a truss deck, four frame posts and a launch rail (tungsten steel pipe casings) aimed at the Sun
//   gtceu:solar_probe            its recipe type (EU in). Circuit 2 assembles the probe, circuit 1 flies it into the corona.
//
// Items (grindless:, names in client_scripts/grindless/uhv_swarm_lang.js): sodium_potassium_heat_pipe (the segment's radiator loop),
// solar_probe. F1's ids (uhv/foundation.js: swarm_segment, worn_swarm_segment, coronal_field_map, aluminium_reflector_film,
// oganesson_propellant ...) are not registered again.
// Textures: tools/assets/Build-UHVSwarmTextures.ps1 (the two items and the overlay dirs grindless:block/multiblock/<machine>).
// Published: global.grindless.uhvSwarm.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const Gen = G.generators
  const SW = G.uhvSwarm || (G.uhvSwarm = {})
  const F1 = (G.uhvFoundation && G.uhvFoundation.ids) || {}

  const TRUSS = 'grindless:station_truss_casing'
  const TRUSS_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const GRATING = 'gtceu:assembly_line_grating'
  const HEAD = 'gtceu:assembly_line_unit'
  const COMPUTER = 'gtceu:computer_casing'
  const RECEIVER = 'gtceu:sapphire_block'
  const RAIL = 'gtceu:tungstensteel_pipe_casing'
  const FRAME = 'tungsten_steel'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    sodium_potassium_heat_pipe: { stack: 16 },
    solar_probe: { stack: 16 }
  }

  SW.site = 'gcyr:mercury_orbit'
  SW.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  SW.ids = {
    heatPipe: 'grindless:sodium_potassium_heat_pipe',
    probe: 'grindless:solar_probe',
    segment: F1.swarmSegment || 'grindless:swarm_segment',
    worn: F1.wornSwarmSegment || 'grindless:worn_swarm_segment',
    map: F1.coronalFieldMap || 'grindless:coronal_field_map',
    film: F1.aluminiumReflectorFilm || 'grindless:aluminium_reflector_film',
    propellant: F1.oganessonPropellant || 'gtceu:oganesson_propellant',
    pod: 'grindless:oganesson_propellant_pod',
    tank: 'grindless:propellant_tank'
  }
  SW.blocks = { truss: TRUSS, grating: GRATING, head: HEAD, computer: COMPUTER, receiver: RECEIVER, rail: RAIL }
  SW.dynamo = 'gtceu:uhv_energy_output_hatch_4a'

  SW.machines = {
    foundry: {
      name: 'swarm_segment_foundry',
      machine: 'gtceu:swarm_segment_foundry',
      type: 'swarm_segment',
      lang: 'Swarm Segment Foundry',
      overlay: 'grindless:block/multiblock/swarm_segment_foundry',
      generator: false,
      // items in: c1's seven parts and the circuit; out: the segment and the stripped film's aluminium (c2)
      maxIO: { itemsIn: 8, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 },
      parts: { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 4 }, output_bus: { min: 1, max: 2 } },
      width: 15, height: 8, depth: 23, minTruss: 40
    },
    station: {
      name: 'swarm_control_station',
      machine: 'gtceu:swarm_control_station',
      type: 'dyson_swarm',
      lang: 'Swarm Control Station',
      overlay: 'grindless:block/multiblock/swarm_control_station',
      generator: true,
      // items in: the kept segments, the worn-out ones, the propellant pods, the coronal field map and the circuit; out: the worn
      // segments and the empty propellant tanks; fluid in: krypton (the poorer fuel)
      maxIO: { itemsIn: 5, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 },
      parts: { energy_output: { min: 1, max: 4 }, input_bus: { min: 1, max: 4 }, input_hatch: { min: 1, max: 2 }, output_bus: { min: 1, max: 2 } },
      width: 41, height: 7, depth: 41, minTruss: 28
    },
    bay: {
      name: 'solar_probe_bay',
      machine: 'gtceu:solar_probe_bay',
      type: 'solar_probe',
      lang: 'Solar Probe Bay',
      overlay: 'grindless:block/multiblock/solar_probe_bay',
      generator: false,
      // items in: c2's six parts and the circuit; out: the probe or the coronal field map
      maxIO: { itemsIn: 7, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      parts: { energy_input: { min: 1, max: 2 }, input_bus: { min: 1, max: 2 }, output_bus: { min: 1, max: 1 } },
      width: 7, height: 5, depth: 7, minTruss: 14
    }
  }

  // ---------------------------------------------------------------- patterns (lib/patterns.js: slices back -> front, rows bottom -> top)

  function body(m) {
    var options = [Pat.block(TRUSS, { min: m.minTruss })]
    Object.keys(m.parts).forEach(function (ability) { options.push(Pat.part(ability, m.parts[ability])) })
    if (!m.generator) options.push(G.parallelHatch.part())
    return Pat.oneOf.apply(null, options)
  }

  // Every machine stands on a truss deck: row 0's rim (X) is truss or a part, its inside truss (T). cell(row, slice, column) fills the
  // rows above; the controller (S) is in the front slice, row 1, middle column.
  function deck(m, cell, floor) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var line = ''
        for (var c = 0; c < m.width; c++) {
          var rim = si === 0 || si === last || c === 0 || c === m.width - 1
          if (r === 0) line += rim ? 'X' : (floor ? floor(si, c) : 'T')
          else if (si === last && r === 1 && c === mid) line += 'S'
          else line += cell(r, si, c)
        }
        rows.push(line)
      }
      slices.push(rows)
    }
    return slices
  }

  function corner(m, si, c) { return (si === 0 || si === m.depth - 1) && (c === 0 || c === m.width - 1) }

  // A free-form layout: f(r, si, c) gives each cell's symbol; the controller (S) is forced to the front slice, row 1, middle column.
  function lay(m, f) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var line = ''
        for (var c = 0; c < m.width; c++) line += si === last && r === 1 && c === mid ? 'S' : f(r, si, c)
        rows.push(line)
      }
      slices.push(rows)
    }
    return slices
  }

  // The foundry, 15 wide x 8 high x 23 deep (D3-SIZE-UHV1): a hangar. A truss floor with a pipe jig rail down its middle (the rim holds the
  // parts), hangar-casing walls with laminated-glass windows, a ridge-and-rafter roof of tungsten steel frames carrying the gantry bridge
  // (assembly line grating) and the assembly head, and two film-roll stands at the back.
  //   H hangar casing   F frames (posts, rafters, ridge, stands)   G the gantry bridge   A the assembly head   P the jig rail   W windows
  var foundry = SW.machines.foundry
  var FD_BENTS = [2, 6, 10, 14, 18]
  foundry.spec = {
    slices: lay(foundry, function (r, si, c) {
      var last = foundry.depth - 1
      var mid = (foundry.width - 1) / 2
      var wallX = c === 0 || c === foundry.width - 1
      var wallZ = si === 0 || si === last
      var bent = FD_BENTS.indexOf(si) >= 0
      if (r === 0) return wallX || wallZ ? 'X' : (c === mid ? 'P' : 'T')
      if (r <= 3 && (wallX || wallZ)) {
        if (r === 2 && wallX && si % 2 === 1 && si >= 2 && si <= last - 2) return 'W'
        if (r === 2 && wallZ && c % 2 === 0 && c >= 2 && c <= foundry.width - 3) return 'W'
        return 'H'
      }
      if (r >= 4 && r <= 6 && wallX && bent) return 'F'
      if (r === 7 && bent) return 'F'
      if (r === 7 && (c === mid || c === 3 || c === foundry.width - 4) && si >= 1 && si <= last - 1) return 'F'
      if (r === 1 && c === mid && si >= 4 && si <= last - 3) return 'P'
      if (r === 6 && si === 12 && c >= 1 && c <= foundry.width - 2) return 'G'
      if (r === 5 && si === 12 && c === mid) return 'A'
      if (r >= 1 && r <= 3 && si >= 2 && si <= 3 && (c === 3 || c === foundry.width - 4)) return 'F'
      return ' '
    }),
    symbols: {
      S: Pat.controller(),
      X: body(foundry),
      T: Pat.block(TRUSS),
      H: Pat.block('grindless:hangar_casing'),
      F: Pat.frame([FRAME]),
      G: Pat.block(GRATING),
      A: Pat.block(HEAD),
      W: Pat.block('gtceu:laminated_glass'),
      P: Pat.block(RAIL)
    }
  }

  // The station, 41 wide x 7 high x 41 deep: a hub and four booms. The hub (11 x 11, a pressure-hull wall with windows) holds the formation
  // computer (C, the middle column) under a roof of sapphire receivers (R) in a truss grid, and wears a Hermean-brick sunshade on four posts.
  // Four booms 3 wide run out 15 cells on the axes (truss floor, a pipe run, frame rails, windows); each ends in a laser-module head, the
  // front one carrying the controller. Two propellant-depot rings (hull and pipes) circle the hub between the booms.
  //   H pressure hull   N Hermean brick sunshade   Q laser module   L windows   P pipes   D depot pipes   F frames   K receivers' coils
  var station = SW.machines.station
  station.spec = {
    slices: lay(station, function (r, si, c) {
      var mid = (station.width - 1) / 2
      var dx = c - mid
      var dz = si - mid
      var ax = Math.abs(dx)
      var az = Math.abs(dz)
      var dm = Math.max(ax, az)
      var armZ = ax <= 2 && az >= 6
      var armX = az <= 2 && ax >= 6
      if (dm <= 5) {
        if (r === 0) return dm === 5 ? 'X' : (ax === 0 || az === 0 ? 'P' : 'T')
        if (r <= 3) {
          if (dm === 5) return r === 2 && (ax + az) % 2 === 0 && ax > 1 && az > 1 ? 'L' : 'H'
          return dm === 0 ? 'C' : '#'
        }
        if (r === 4) return dm === 5 ? 'H' : ((ax + az) % 2 === 0 ? 'R' : 'T')
      }
      if (dm === 8 && ax === 8 && az === 8 && r >= 1 && r <= 5) return 'F'
      if (r === 6 && dm >= 6 && dm <= 8 && (dm === 8 || (ax + az) % 2 === 0)) return 'N'
      if (armZ || armX) {
        var along = Math.max(ax, az)
        var off = Math.min(ax, az)
        if (along >= 18) {
          if (r === 0) return off <= 1 ? 'X' : 'T'
          if (r === 4) return 'Q'
          if (r >= 1 && r <= 3) return along === 20 || off === 2 ? (r === 2 ? 'Q' : 'H') : '#'
          return ' '
        }
        if (r === 0) return 'T'
        if (r === 1) return off === 0 ? 'P' : (off === 1 ? 'T' : ' ')
        if (r === 2) return off === 1 ? (along % 3 === 0 ? 'L' : 'F') : ' '
        if (r === 3) return off === 1 && along % 2 === 0 ? 'F' : ' '
        return ' '
      }
      if ((dm === 10 || dm === 12) && ax > 2 && az > 2) {
        if (r === 0) return 'H'
        if (r === 1) return 'D'
        if (r === 2) return dm === 10 && (ax + az) % 4 === 0 ? 'D' : ' '
      }
      return ' '
    }),
    symbols: {
      S: Pat.controller(),
      X: body(station),
      T: Pat.block(TRUSS),
      F: Pat.frame([FRAME]),
      C: Pat.block(COMPUTER),
      R: Pat.block(RECEIVER),
      P: Pat.block(RAIL),
      D: Pat.block(RAIL),
      H: Pat.block('grindless:pressure_hull_casing'),
      N: Pat.block('grindless:hermean_heat_shield_brick'),
      Q: Pat.block('grindless:laser_module_block'),
      L: Pat.block('gtceu:laminated_glass'),
      '#': Pat.air()
    }
  }
  //   F posts (tungsten steel frames)   R the launch rail (tungsten steel pipe casings, row 1, ending behind the controller)
  //   T the top ring (truss)
  var bay = SW.machines.bay
  bay.spec = {
    slices: deck(bay, function (r, si, c) {
      var rim = si === 0 || si === bay.depth - 1 || c === 0 || c === bay.width - 1
      if (r === bay.height - 1) return rim ? (corner(bay, si, c) ? 'T' : 'K') : ' '
      if (corner(bay, si, c)) return 'F'
      if (r === 1 && c === (bay.width - 1) / 2) return 'R'
      if (r === 2 && rim) return 'W'
      return ' '
    }, function (si, c) {
      return si === (bay.depth - 1) / 2 || c === (bay.width - 1) / 2 ? 'P' : 'T'
    }),
    symbols: {
      S: Pat.controller(),
      X: body(bay),
      T: Pat.block(TRUSS),
      F: Pat.frame([FRAME]),
      R: Pat.block(RAIL),
      P: Pat.block(RAIL),
      K: Pat.block('gtceu:superconducting_coil'),
      W: Pat.block('gtceu:laminated_glass')
    }
  }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var fo = SW.machines.foundry
    event.create(fo.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(fo.maxIO.itemsIn, fo.maxIO.itemsOut, fo.maxIO.fluidsIn, fo.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ASSEMBLER)
    var st = SW.machines.station
    event.create(st.type)
      .category('generator')
      .setEUIO('out')
      .setMaxIOSize(st.maxIO.itemsIn, st.maxIO.itemsOut, st.maxIO.fluidsIn, st.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_FUSION, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ELECTROLYZER)
    var ba = SW.machines.bay
    event.create(ba.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(ba.maxIO.itemsIn, ba.maxIO.itemsOut, ba.maxIO.fluidsIn, ba.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ASSEMBLER)
  })

  // ---------------------------------------------------------------- machines

  function tooltips(m) {
    var lines = [
      Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
      Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
      Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
    ]
    if (!m.generator) lines.push(Text.translate('gtceu.multiblock.parallelizable.tooltip'))
    return lines
  }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Object.keys(SW.machines).forEach(function (key) {
      var m = SW.machines[key]
      Pat.register(m.machine, m.spec)
      var builder = event.create(m.name, 'multiblock')
      // the station: written at its final figure, one run at a time, through its dynamo hatches only (lib/generators.js)
      if (m.generator) builder = Gen.configure(builder, { maxParallels: 1, name: m.name })
      else builder = builder.recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      builder
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(TRUSS) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"](tooltips(m))
        .workableCasingModel(TRUSS_TEXTURE, m.overlay)
    })
  })

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })
})()
