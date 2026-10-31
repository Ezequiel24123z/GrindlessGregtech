// priority: -11600
// -----------------------------------------------------------------------------------------------
// ZPM's outer chemistry (docs/eras/zpm.md, "Machines 9, 13, 14"; package ZPM-A8): three multiblocks and their recipe types. The items they
// make (carbon_nanotube_yarn, archaeal_culture, silica_aerogel) are ZPM-F1's, in foundation.js. Recipes: server_scripts/grindless/zpm/
// outer_chemistry.js. Names / tooltips: client_scripts/grindless/zpm_outer_chemistry_lang.js.
//
//   gtceu:methane_pyrolyser   type gtceu:methane_pyrolysis    3 x 3 x 12 bubble column of heat-proof casing (the molten tin-nickel bath)
//   gtceu:vent_bioreactor     type gtceu:chemosynthesis       5 x 5 x 7 of plascrete (the sterile hall's wall), a pipe column as the gas-lift loop
//   gtceu:aerogel_works       type gtceu:supercritical_drying 5 x 5 x 5 of autoclave-grade casing, a pipe as the CO2 compressor
//
// The controller sits in the middle of the back wall, one row up. Row 0 (the floor) takes the parts and at least `minCasings` casings.
// Textures: grindless:block/multiblock/<machine> (tools/assets/Build-ZPMOuterChemistryTextures.ps1). Published: global.grindless.outerChemistry.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const OC = G.outerChemistry || (G.outerChemistry = {})

  const HEAT = 'gtceu:heatproof_machine_casing'
  const HEAT_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'
  const STERILE = 'gtceu:plascrete'
  const STERILE_TEXTURE = 'gtceu:block/casings/cleanroom/plascrete'
  const STABLE = 'gtceu:stable_machine_casing'
  const STABLE_TEXTURE = 'gtceu:block/casings/solid/machine_casing_stable_titanium'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'

  const PARTS = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 3 },
    output_hatch: { min: 1, max: 2 }
  }

  OC.machines = {
    pyrolyser: {
      name: 'methane_pyrolyser', machine: 'gtceu:methane_pyrolyser', type: 'methane_pyrolysis', lang: 'Methane Pyrolyser',
      casing: HEAT, texture: HEAT_TEXTURE, minCasings: 4,
      width: 3, depth: 3, height: 12,
      // items in: the circuit; out: graphene or yarn; fluids in: methane and the bath (tin, nickel); out: hydrogen
      maxIO: { itemsIn: 1, itemsOut: 1, fluidsIn: 3, fluidsOut: 1 }
    },
    bioreactor: {
      name: 'vent_bioreactor', machine: 'gtceu:vent_bioreactor', type: 'chemosynthesis', lang: 'Vent Bioreactor',
      casing: STERILE, texture: STERILE_TEXTURE, minCasings: 16,
      width: 5, depth: 5, height: 7,
      // items in: tholin, the culture and the circuit; out: the cultures; fluids in: bacteria, brine, hydrogen, CO2 or mutagen; out: methane or the broth and the spent brine
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 4, fluidsOut: 2 }
    },
    aerogel: {
      name: 'aerogel_works', machine: 'gtceu:aerogel_works', type: 'supercritical_drying', lang: 'Aerogel Works',
      casing: STABLE, texture: STABLE_TEXTURE, minCasings: 12,
      width: 5, depth: 5, height: 5,
      // items in: nanograins; out: aerogel; fluids in: ethanol and the CO2 charge; out: the ethanol
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 2, fluidsOut: 1 }
    }
  }

  // A hollow box of casing: row 0 takes the parts, S is the controller (back slice, row 1, middle column), `inner` gives the interior.
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
          var wall = si === 0 || si === last || c === 0 || c === m.width - 1
          if (r === 0) ch = 'X'
          else if (si === last && r === 1 && c === mid) ch = 'S'
          else if (wall || r === m.height - 1) ch = m.wallChar ? m.wallChar(r, si, c, last) : 'F'
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // the bubble column: an open 1 x 1 shaft up the middle
  // QR-B0 pilot: a reactor tower, not a plain column. Tungstensteel frame posts at the four corners, a coil band every four rows
  // (the heaters of the tin-nickel bath), glass sight windows between the bands, and a pipe riser inside (the bubble column).
  var PY_COIL = 'gtceu:nichrome_coil_block'
  var PY_GLASS = 'gtceu:fusion_glass'
  function pyrolyserWall(r, si, c, last) {
    var corner = (si === 0 || si === last) && (c === 0 || c === 2)
    if (r === 11) return corner ? 'R' : 'F'
    if (corner) return 'R'
    if (r % 4 === 0) return 'K'
    if (r % 4 === 2) return 'G'
    return 'F'
  }
  function pyrolyserInner(r, si, c) { return r % 2 === 1 ? 'P' : '#' }
  // QR-S2: the vent bioreactor is a sterile hall around a gas-lift loop: tungstensteel frame posts at the corners, a ribbon of
  // glass sight windows in rows 2 and 4 with plascrete bands between them, and the pipe column (inner) rising through the roof.
  function bioreactorWall(r, si, c, last) {
    var corner = (si === 0 || si === last) && (c === 0 || c === 4)
    if (corner) return 'R'
    if (r === 6) return si === 2 && c === 2 ? 'P' : 'F'
    if (r === 2 || r === 4) return 'G'
    return 'F'
  }
  // the gas-lift loop: a pipe column up the middle
  function bioreactorInner(r, si, c) { return si === 2 && c === 2 ? 'P' : '#' }
  // QR-S2: the aerogel works is an autoclave: frame posts, a nichrome heater band (row 2), glass gauge windows (row 3) and the CO2
  // compressor's pipe through the middle and out of the lid.
  function aerogelWall(r, si, c, last) {
    var corner = (si === 0 || si === last) && (c === 0 || c === 4)
    if (corner) return 'R'
    if (r === 4) return si === 2 && c === 2 ? 'P' : 'F'
    if (r === 2) return 'K'
    if (r === 3) return 'G'
    return 'F'
  }
  function aerogelInner(r, si, c) { return si === 2 && c === 2 && r <= 3 ? 'P' : '#' }

  function specOf(m, inner) {
    var oneOf = [Pat.block(m.casing, { min: m.minCasings })]
    Object.keys(PARTS).forEach(function (k) { oneOf.push(Pat.part(k, PARTS[k])) })
    return {
      slices: shell(m, inner),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, oneOf),
        F: Pat.block(m.casing),
        P: Pat.block(PIPE),
        '#': Pat.air(),
        R: Pat.frame(['tungsten_steel']),
        K: Pat.block(PY_COIL),
        G: Pat.block(PY_GLASS)
      }
    }
  }
  OC.machines.pyrolyser.wallChar = pyrolyserWall
  OC.machines.pyrolyser.spec = specOf(OC.machines.pyrolyser, pyrolyserInner)
  OC.machines.bioreactor.wallChar = bioreactorWall
  OC.machines.aerogel.wallChar = aerogelWall
  OC.machines.bioreactor.spec = specOf(OC.machines.bioreactor, bioreactorInner)
  OC.machines.aerogel.spec = specOf(OC.machines.aerogel, aerogelInner)

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    Object.keys(OC.machines).forEach(function (k) {
      var m = OC.machines[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Object.keys(OC.machines).forEach(function (k) {
      var m = OC.machines[k]
      Pat.register(m.machine, m.spec)
      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + String(m.type).replace('gtceu:', '')))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
