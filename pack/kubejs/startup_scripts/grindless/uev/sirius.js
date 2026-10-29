// priority: -7626
// -----------------------------------------------------------------------------------------------
// UEV's Sirius B machines (docs/eras/uev.md, machines 23-25 and line 28; package UEV-B4): the white dwarf spectrograph, the degenerate harvester,
// the containment works and their recipe types. The recipes come from data/grindless/tables/sirius.json (server_scripts/grindless/uev/sirius.js);
// all three types run in Sirius B orbit only (grindless:sirius_b_orbit, B1's dimension; the recipes carry it).
//
//   gtceu:white_dwarf_spectrograph   type gtceu:gravitational_redshift: ULE cavity + SNSPDs (nuclear clock kept) -> the mass-radius chart.
//   gtceu:degenerate_harvester       type gtceu:degenerate_harvesting: the EOS model (consumed), the chart (kept), liquid helium (kept) -> degenerate matter.
//   gtceu:containment_works          type gtceu:degenerate_containment: degenerate matter + the Casimir array's exotic matter cell (the stasis field)
//                                    -> the sealed degenerate pellet. Nothing is voided.
//
// Voltage: UEV. No item is registered here: degenerate_matter, degenerate_pellet, mass_radius_chart, degenerate_eos_model, sx_pump_impeller,
// uev_field_generator and the degenerate containment casing are F1's / A8's / A4's (global.grindless.uevFoundation.ids).
// Geometry (lib/patterns.js): 5 wide x 5 high x 7 deep, hollow shells. Textures: tools/assets/Build-UEVSiriusTextures.ps1.
// Names: client_scripts/grindless/uev_sirius_lang.js. Published for the recipe script: global.grindless.uevSirius.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SI = G.uevSirius || (G.uevSirius = {})
  const LOG = '[grindless/uev] '

  const PHOTONIC = 'grindless:photonic_casing'
  const PHOTONIC_TEXTURE = 'grindless:block/uev/photonic_casing'
  const CONTAIN = 'grindless:degenerate_containment_casing'
  const CONTAIN_TEXTURE = 'grindless:block/uev/degenerate_containment_casing'

  SI.table = 'kubejs/data/grindless/tables/sirius.json'
  SI.orbit = 'grindless:sirius_b_orbit'

  SI.machines = {
    spectrograph: {
      name: 'white_dwarf_spectrograph',
      machine: 'gtceu:white_dwarf_spectrograph',
      type: 'gravitational_redshift',
      dataKey: 'grindless_gravitational_redshift',
      lang: 'White Dwarf Spectrograph',
      casing: PHOTONIC, texture: PHOTONIC_TEXTURE,
      // items in: ULE cavity, SNSPDs, the kept nuclear clock, the circuit; out: the chart
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    },
    harvester: {
      name: 'degenerate_harvester',
      machine: 'gtceu:degenerate_harvester',
      type: 'degenerate_harvesting',
      dataKey: 'grindless_degenerate_harvesting',
      lang: 'Degenerate Harvester',
      casing: CONTAIN, texture: CONTAIN_TEXTURE,
      // items in: the EOS model, the kept chart, the circuit; fluids in: the kept liquid helium; out: degenerate matter
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    },
    works: {
      name: 'containment_works',
      machine: 'gtceu:containment_works',
      type: 'degenerate_containment',
      dataKey: 'grindless_degenerate_containment',
      lang: 'Containment Works',
      casing: CONTAIN, texture: CONTAIN_TEXTURE,
      // items in: degenerate matter, the stasis field cell, the circuit; out: the sealed pellet
      maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 5, height: 5, depth: 7
    }
  }
  SI.order = ['spectrograph', 'harvester', 'works']

  // The spectrograph is a telescope: a glass hall under a dish on a mast. The harvester is a magnetic scoop: a funnel of rings narrowing from
  // the mouth to a tank. The works is a vault: a heavy hall with a row of stasis cells (B/L/C) down each side and a pipe ridge.
  function funnelCell(w, d) {
    var cx = (w - 1) / 2
    return function (x, y, z) {
      var dx = x - cx
      var ax = dx < 0 ? -dx : dx
      var m = G.uevShapes.cheb(dx, y - 4)
      if (y === 0) return ax <= 2 ? 'X' : ' '
      if (z >= 5) {
        var r = 1 + Math.floor((z - 5) / 3)
        if (z === d - 1) r = 3
        if (m < r) return '#'
        if (m > r) return ' '
        if (z === d - 1) return 'C'
        if (z === d - 2) return 'A'
        return z % 3 === 1 && (ax === r || y === 4 + r) ? 'L' : 'F'
      }
      if (z === 4) return m <= 1 ? '#' : (m <= 3 ? 'A' : ' ')
      if (m === 3) return (z === 0 || ((ax === 3) && (y === 1 || y === 7))) ? (ax === 3 && (y === 1 || y === 7) ? 'Q' : 'F') : (z % 2 === 1 ? 'L' : 'F')
      if (z === 0 && m < 3) return 'F'
      if (m === 0 && z > 0) return 'P'
      return m < 3 ? '#' : ' '
    }
  }

  function vaultCell(w, d) {
    var cx = (w - 1) / 2
    return G.uevShapes.hall({
      w: w, d: d, hh: 6, mull: 2,
      crown: G.uevShapes.ridge(w, d),
      inner: function (x, y, z) {
        var dx = x - cx
        var ax = dx < 0 ? -dx : dx
        if (ax === 2 && z % 2 === 1 && z > 1 && z < d - 3) return y === 1 ? 'B' : (y === 2 ? 'L' : (y === 3 ? 'C' : null))
        return null
      }
    })
  }

  var SHAPES = {
    spectrograph: { w: 9, h: 11, d: 9, fn: function () { return G.uevShapes.hall({ w: 9, d: 9, hh: 5, crown: G.uevShapes.dish(9, 9, 3) }) } },
    harvester: { w: 9, h: 8, d: 13, fn: function () { return funnelCell(9, 13) } },
    works: { w: 9, h: 7, d: 11, fn: function () { return vaultCell(9, 11) } }
  }
  SI.order.forEach(function (k) {
    var m = SI.machines[k]
    m.width = SHAPES[k].w
    m.height = SHAPES[k].h
    m.depth = SHAPES[k].d
  })

  function makeSpec(k) {
    var m = SI.machines[k]
    var parts = [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
    if (m.maxIO.fluidsIn > 0) parts.push(Pat.part('input_hatch', { min: 0, max: 1 }))
    return G.uevShapes.spec(Pat, {
      w: m.width, h: m.height, d: m.depth, fn: SHAPES[k].fn(), parts: parts,
      pal: {
        F: m.casing, A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass', P: 'gtceu:tungstensteel_pipe_casing',
        C: 'gtceu:trinium_coil_block', B: 'gtceu:tungstensteel_gearbox', Q: 'tungsten_steel'
      }
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

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    SI.order.forEach(function (k) {
      var m = SI.machines[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SI.order.forEach(function (k) {
      var m = SI.machines[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = makeSpec(k)
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
