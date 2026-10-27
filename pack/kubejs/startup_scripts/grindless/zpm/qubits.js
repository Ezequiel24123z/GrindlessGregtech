// -----------------------------------------------------------------------------------------------
// ZPM's solid-state qubit chain (docs/eras/zpm.md, "Machines 10-12"; package ZPM-A6): three multiblocks, their recipe types and the items
// between them. Recipes: server_scripts/grindless/zpm/qubits.js. Names / tooltips: client_scripts/grindless/zpm_qubits_lang.js.
//
//   gtceu:diamond_lattice_fab  type gtceu:diamond_cvd         5 x 5 x 5 of cleanroom-grade casing, a naquadah coil as the microwave cavity
//   gtceu:ion_implanter        type gtceu:ion_implantation    3 x 3 x 11 beam line of cleanroom-grade casing, coils as the analysing magnet
//   gtceu:qubit_fab            type gtceu:qubit_fabrication   5 x 5 x 9 of cryostat casing, a pipe column as the mixing chamber and still
//
// The controller sits in the middle of the front wall, one row up. Row 0 (the floor) takes the parts and at least `minCasings` casings.
// Items (grindless:, new here; foundation.js has cvd_diamond_plate, qubit_array and silicon_28_dust): nitrogen_doped_cvd_plate,
// nv_diamond_chip, silicon_28_boule, silicon_28_wafer, donor_qubit_wafer.
// Textures: grindless:block/multiblock/<machine> (tools/assets/Build-ZPMQubitsTextures.ps1). Published: global.grindless.qubits.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const Q = G.qubits || (G.qubits = {})

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const CRYO = 'grindless:cryostat_casing'
  const CRYO_TEXTURE = 'grindless:block/zpm/cryostat_casing'
  const COIL = 'gtceu:naquadah_coil_block'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'

  Q.items = {
    nitrogen_doped_cvd_plate: { stack: 64 },
    nv_diamond_chip: { stack: 64 },
    silicon_28_boule: { stack: 16 },
    silicon_28_wafer: { stack: 64 },
    donor_qubit_wafer: { stack: 64 }
  }

  const PARTS = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 3 },
    output_hatch: { min: 1, max: 2 }
  }

  Q.machines = {
    diamond: {
      name: 'diamond_lattice_fab', machine: 'gtceu:diamond_lattice_fab', type: 'diamond_cvd', lang: 'Diamond Lattice Fab',
      casing: CLEAN, texture: CLEAN_TEXTURE, appearance: true, minCasings: 12,
      width: 5, depth: 5, height: 5,
      // items in: the seed and the circuit (UHV-A3's diodes: plate, boron, phosphorus and the circuit); out: the plate;
      // fluids in: methane, hydrogen, nitrogen; out: hydrogen
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 3, fluidsOut: 1 }
    },
    implanter: {
      name: 'ion_implanter', machine: 'gtceu:ion_implanter', type: 'ion_implantation', lang: 'Ion Implanter',
      casing: CLEAN, texture: CLEAN_TEXTURE, appearance: true, minCasings: 15,
      width: 3, depth: 11, height: 3,
      // items in: plate or wafer, phosphorus, the circuit; out: chips or the wafer; fluids in: nitrogen ions
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 }
    },
    qubit: {
      name: 'qubit_fab', machine: 'gtceu:qubit_fab', type: 'qubit_fabrication', lang: 'Qubit Fab',
      casing: CRYO, texture: CRYO_TEXTURE, appearance: null, minCasings: 20,
      width: 5, depth: 9, height: 5,
      // items in: wafers or chips and the circuit; out: the array; fluids in: the helium charge and its make-up
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 2, fluidsOut: 0 }
    }
  }

  // A hollow box of casing: row 0 takes the parts, S is the controller (front slice, row 1, middle column), `inner` gives the interior.
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
          else if (wall) ch = 'F'
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  function diamondInner(r, si, c) {
    // the microwave cavity: one coil in the middle of the chamber
    return r === 2 && si === 2 && c === 2 ? 'C' : (r === 4 ? 'F' : '#')
  }

  function implanterInner(r, si, c) {
    // the analysing magnet: coils in the ceiling over slices 4-6; the beam runs below, in row 1
    if (r === 2) return si >= 4 && si <= 6 ? 'C' : 'F'
    return '#'
  }

  function qubitInner(r, si, c) {
    // the mixing chamber and the still: a pipe column up the middle of the cryostat, ceiling closed
    if (r === 4) return 'F'
    return si === 4 && c === 2 ? 'P' : '#'
  }

  function specOf(m, inner) {
    var oneOf = [Pat.block(m.casing, { min: m.minCasings })]
    Object.keys(PARTS).forEach(function (k) { oneOf.push(Pat.part(k, PARTS[k])) })
    return {
      slices: shell(m, inner),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, oneOf),
        F: Pat.block(m.casing),
        C: Pat.block(COIL),
        P: Pat.block(PIPE),
        '#': Pat.air()
      }
    }
  }
  Q.machines.diamond.spec = specOf(Q.machines.diamond, diamondInner)
  Q.machines.implanter.spec = specOf(Q.machines.implanter, implanterInner)
  Q.machines.qubit.spec = specOf(Q.machines.qubit, qubitInner)

  StartupEvents.registry('item', function (event) {
    Object.keys(Q.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(Q.items[name].stack)
      for (var i = 0; i < 2; i++) {
        var line = Text.translate('tooltip.grindless.' + name + '.' + i)
        item.tooltip(i === 0 ? Text.gray(line) : Text.darkGray(line))
      }
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    Object.keys(Q.machines).forEach(function (k) {
      var m = Q.machines[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Object.keys(Q.machines).forEach(function (k) {
      var m = Q.machines[k]
      Pat.register(m.machine, m.spec)
      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(m.appearance ? GTBlocks.CASING_STAINLESS_CLEAN : function () { return Block.getBlock(m.casing) })
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
