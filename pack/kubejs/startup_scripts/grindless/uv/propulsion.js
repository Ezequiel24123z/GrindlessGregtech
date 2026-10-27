// priority: -10500
// -----------------------------------------------------------------------------------------------
// UV's propulsion (docs/eras/uv.md, machines 16 and 17; package UV-A11): two machines, their recipe types and the items only they or
// their side steps make. The tier 11 tank they wind (grindless:bnnt_fuel_tank, a gcyr:fuel_tank block) is F1's
// (global.grindless.uvFoundation); this file never registers it again.
//
//   gtceu:cryotank_winder   the BNNT fuel tank (machine 16): an hBN liner wound with BNNT and carbon nanotube yarn on the ZPM aerogel tank.
//                           7 wide x 7 high x 9 deep on the UV casing: a mandrel (tungsten steel frames along the axis), a winding head
//                           (assembly line units on the floor) and a curing oven (cupronickel coils round the mandrel).
//   gtceu:cryotank_winding  its recipe type (EU in); circuit 1 only. Tier 11 + the elite motor (tier 3) = floor(14 / 2) = level 7 (S0-1).
//   gtceu:thruster_works    electric thrusters and the pod the probes carry (machine 17). 7 x 7 x 9 on the UV casing: a vacuum test cell
//                           (laminated glass) at the back and an assembly bay (assembly line grating and units) at the front.
//   gtceu:thruster_assembly its recipe type (EU in); circuit 1 gridded ion (xenon), 2 Hall (krypton), 3 pod.
//
// Items (grindless:, names in client_scripts/grindless/uv_propulsion_lang.js): ion_thruster, hall_thruster, thruster_pod, and the parts
// made by GTM machines in server_scripts/grindless/uv/propulsion.js: molybdenum_grid, lanthanum_hexaboride_cathode, bn_discharge_channel,
// uv_electromagnet, propellant_tank.
//
// Parts: 1-2 energy hatches, the buses and hatches each type needs (see .winderParts / .worksParts), at least 8 casings among the part
// cells. Textures: the composite autoclave's overlay (winder) and the engine test stand's (works), on the UV casing; item icons from
// tools/assets/Build-UVPropulsionTextures.ps1. Published: global.grindless.propulsion.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const P = G.propulsion || (G.propulsion = {})
  const UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}

  const WINDER = 'gtceu:cryotank_winder'
  const WINDER_TYPE = 'cryotank_winding'
  const WORKS = 'gtceu:thruster_works'
  const WORKS_TYPE = 'thruster_assembly'

  const CASING = 'gtceu:uv_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/voltage/uv/side'
  const WINDER_OVERLAY = 'grindless:block/multiblock/composite_autoclave'
  const WORKS_OVERLAY = 'grindless:block/multiblock/engine_test_stand'
  const MANDREL = 'tungsten_steel'
  const HEAD = 'gtceu:assembly_line_unit'
  const OVEN = 'gtceu:cupronickel_coil_block'
  const BAY = 'gtceu:assembly_line_grating'
  const CELL = 'gtceu:laminated_glass'

  // item name -> stack size; two tooltip lines each (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    ion_thruster: { stack: 16 },
    hall_thruster: { stack: 16 },
    thruster_pod: { stack: 16 },
    molybdenum_grid: { stack: 64 },
    lanthanum_hexaboride_cathode: { stack: 64 },
    bn_discharge_channel: { stack: 64 },
    uv_electromagnet: { stack: 64 },
    propellant_tank: { stack: 16 }
  }

  P.winder = WINDER
  P.works = WORKS
  P.winderType = 'gtceu:' + WINDER_TYPE
  P.worksType = 'gtceu:' + WORKS_TYPE
  P.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  P.ids = {
    bnntFuelTank: UV.bnntFuelTank || 'grindless:bnnt_fuel_tank',
    ionThruster: 'grindless:ion_thruster',
    hallThruster: 'grindless:hall_thruster',
    thrusterPod: 'grindless:thruster_pod',
    molybdenumGrid: 'grindless:molybdenum_grid',
    lab6Cathode: 'grindless:lanthanum_hexaboride_cathode',
    bnDischargeChannel: 'grindless:bn_discharge_channel',
    uvElectromagnet: 'grindless:uv_electromagnet',
    propellantTank: 'grindless:propellant_tank'
  }
  // winder: items in 6 (aerogel tank, two yarns, hBN, the chart, the circuit), out 1, epoxy in;
  // works: items in 5 (the pod: two thrusters, the processing unit, the tank, the circuit), out 1, the firing gas in and back
  P.winderIO = { itemsIn: 6, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 }
  P.worksIO = { itemsIn: 5, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }
  P.winderParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 3 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    minCasings: 8
  }
  P.worksParts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 3 },
    input_hatch: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    output_hatch: { min: 1, max: 2 },
    minCasings: 8
  }

  // ---------------------------------------------------------------- patterns
  // slices back -> front, rows bottom -> top, columns left -> right seen from the front

  function cells(parts) {
    var options = [Pat.block(CASING, { min: parts.minCasings })]
    ;['energy_input', 'input_bus', 'input_hatch', 'output_bus', 'output_hatch'].forEach(function (ability) {
      if (parts[ability]) options.push(Pat.part(ability, parts[ability]))
    })
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

  // the mandrel runs front to back through the centre; the winding head rides the floor; the curing oven rings the mandrel
  const MANDREL_ONLY = [EMPTY5, EMPTY5, '##M##', EMPTY5, EMPTY5]
  const WINDING = ['#AAA#', EMPTY5, '##M##', EMPTY5, EMPTY5]
  const CURING = ['#KKK#', 'K###K', 'K#M#K', 'K###K', '#KKK#']
  const WINDER_SPEC = {
    slices: [wall7(), ring7(MANDREL_ONLY), ring7(CURING), ring7(CURING), ring7(MANDREL_ONLY), ring7(WINDING), ring7(WINDING),
      ring7(MANDREL_ONLY), front7()],
    symbols: {
      S: Pat.controller(),
      X: cells(P.winderParts),
      R: Pat.block(CASING),
      M: Pat.frame([MANDREL]),
      A: Pat.block(HEAD),
      K: Pat.block(OVEN),
      '#': Pat.air()
    }
  }
  P.winderSpec = WINDER_SPEC

  // the vacuum test cell: a laminated glass box at the back; the assembly bay: grating floor and robot units along the walls
  const TEST_CELL = ['LLLLL', 'L###L', 'L###L', 'L###L', 'LLLLL']
  const ASSEMBLY = ['BBBBB', 'A###A', 'A###A', EMPTY5, EMPTY5]
  const WORKS_SPEC = {
    slices: [wall7(), ring7(TEST_CELL), ring7(TEST_CELL), ring7(TEST_CELL), ring7(HOLLOW), ring7(ASSEMBLY), ring7(ASSEMBLY),
      ring7(ASSEMBLY), front7()],
    symbols: {
      S: Pat.controller(),
      X: cells(P.worksParts),
      R: Pat.block(CASING),
      L: Pat.block(CELL),
      B: Pat.block(BAY),
      A: Pat.block(HEAD),
      '#': Pat.air()
    }
  }
  P.worksSpec = WORKS_SPEC

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
    recipeType(event, WINDER_TYPE, P.winderIO, GTSoundEntries.MOTOR)
    recipeType(event, WORKS_TYPE, P.worksIO, GTSoundEntries.ASSEMBLER)
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
    Pat.register(WINDER, WINDER_SPEC)
    Pat.register(WORKS, WORKS_SPEC)
    machine(event, 'cryotank_winder', 'Cryotank Winder', WINDER_TYPE, WINDER_SPEC, WINDER_OVERLAY)
    machine(event, 'thruster_works', 'Thruster Works', WORKS_TYPE, WORKS_SPEC, WORKS_OVERLAY)
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
