// priority: -11400
// -----------------------------------------------------------------------------------------------
// ZPM's naquadria multiblocks (docs/eras/zpm.md, "1. Naquadria refinery" and "2. Naquadah fuel works"; package ZPM-A2) and their
// recipe types. The recipes come from data/grindless/tables/naquadria.json (server_scripts/grindless/zpm/naquadria.js).
//
//   gtceu:naquadria_refinery    the stored impure naquadria solution (the plant's mode 2, since LuV) becomes naquadria: a centrifuge
//                               drum and a distillation stack in one tower, where GTM's chain takes several machines.
//   gtceu:naquadria_refining    its recipe type (EU in). Circuit 1: 1,000 mB impure naquadria solution + 2,000 mB hydrogen (+ a
//                               non-consumed 1,000 mB sulfuric acid charge) -> naquadria, gallium sulfide, enriched naquadah solution.
//                               Circuit 2: 2,000 mB stored naquadria waste -> the distillation's outputs.
//   gtceu:naquadah_fuel_works   the loop of GTM's naquadah-based liquid fuel: naquadria in, fuel out, and the depleted fuel back to
//                               naquadah, europium and xenon.
//   gtceu:naquadah_fuel         its recipe type. Circuit 1: 42 naquadria + a 5 % cerium and neodymium make-up -> 1,000 mB fuel.
//                               Circuit 2: 1,000 mB depleted fuel -> naquadah, europium (chance), xenon.
//   Byproduct destinations: enriched naquadah solution -> naquadah plant mode 3 (circuit 4); gallium sulfide -> the MV gallium line;
//   sulfuric acid -> the refinery's charge; naquadah -> plant mode 2; xenon -> GTM's xenon uses; europium -> the motor line.
//
// Both are GTM's plain electric multiblock with a parallel hatch's copies (lib/parallel_hatch.js), in naquadria containment casing
// (grindless:naquadria_containment_casing, registered by zpm/foundation.js). Geometry (lib/patterns.js: slices back -> front, rows
// bottom -> top): the refinery is 7 x 7 x 11 (a tower: row 0 takes the parts, a drum of tungstensteel gearboxes in rows 1-2, a
// tungstensteel pipe column up the distillation stack in rows 3-7, a casing lid); the works is 5 x 5 x 7 (a centrifuge column of
// gearboxes 3 high, a mixing vessel of laminated glass 2 high). The controller sits in the middle of the front wall, one row up.
// Textures: tools/assets/Build-ZPMNaquadriaTextures.ps1. Names: client_scripts/grindless/zpm_naquadria_lang.js.
// Published for the recipe script and the smoke test: global.grindless.naquadria.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const NQ = G.naquadria || (G.naquadria = {})
  const LOG = '[grindless/zpm] '

  const CASING = 'grindless:naquadria_containment_casing'
  const CASING_TEXTURE = 'grindless:block/zpm/naquadria_containment_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'
  const GLASS = 'gtceu:laminated_glass'

  NQ.table = 'kubejs/data/grindless/tables/naquadria.json'
  NQ.blocks = { casing: CASING, gearbox: GEARBOX, pipe: PIPE, glass: GLASS }

  // one definition per machine; the recipe script reads machine, type, dataKey and maxIO
  NQ.machines = {
    refinery: {
      name: 'naquadria_refinery',
      machine: 'gtceu:naquadria_refinery',
      type: 'naquadria_refining',
      dataKey: 'grindless_naquadria_refining',
      lang: 'Naquadria Refinery',
      // items in: the circuit; out: dusts; fluids in: solution, hydrogen, the charge; fluids out: sulfuric acid, solution
      maxIO: { itemsIn: 2, itemsOut: 3, fluidsIn: 3, fluidsOut: 2 },
      parts: {
        energy_input: { min: 1, max: 2 },
        input_bus: { min: 1, max: 2 },
        input_hatch: { min: 1, max: 4 },
        output_bus: { min: 1, max: 2 },
        output_hatch: { min: 1, max: 2 }
      },
      width: 7, depth: 7, height: 11
    },
    fuelWorks: {
      name: 'naquadah_fuel_works',
      machine: 'gtceu:naquadah_fuel_works',
      type: 'naquadah_fuel',
      dataKey: 'grindless_naquadah_fuel',
      lang: 'Naquadah Fuel Works',
      // items in: naquadria and two make-up dusts and the circuit; out: naquadah and europium; fluids: depleted fuel in, fuel and xenon out
      maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 },
      parts: {
        energy_input: { min: 1, max: 2 },
        input_bus: { min: 1, max: 2 },
        input_hatch: { min: 1, max: 2 },
        output_bus: { min: 1, max: 2 },
        output_hatch: { min: 1, max: 2 }
      },
      width: 5, depth: 5, height: 7
    }
  }

  // The tower: row 0 (X) takes the parts, S is the controller; `wall(row, back-front index, column, last)` gives the shell's walls and lid,
  // inner(row, back-front index, column) the interior (' ' is air through '#').
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
          else if (wall || r === m.height - 1) ch = m.wall(r, si, c, last)
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // QR-S2: frame posts at the corners, a tungstensteel pipe collar (the tray outlets) every third row, laminated glass sight windows
  // in the middle of each face between the collars, and the distillation pipe stack leaving through the lid.
  function refineryWall(r, si, c, last) {
    var corner = (si === 0 || si === last) && (c === 0 || c === 6)
    if (corner) return 'T'
    if (r === 10) return si === 3 && c === 3 ? 'P' : 'F'
    if (r % 3 === 0) return 'P'
    if (r >= 4) {
      var mid = (si === 0 || si === last) ? c >= 2 && c <= 4 : si >= 2 && si <= 4
      return mid ? 'L' : 'F'
    }
    return 'F'
  }

  function refineryInner(r, si, c) {
    var centre = si === 3 && c === 3
    // rows 1-2: the centrifuge drum, a 3 x 3 of gearboxes; rows 3-9: the distillation stack's pipe column
    if (r <= 2) return si >= 2 && si <= 4 && c >= 2 && c <= 4 ? 'G' : '#'
    return centre ? 'P' : '#'
  }

  // the works: frame posts, a glass gauge ribbon (rows 2-3) round the centrifuge and the mixing vessel, a pipe collar (row 4) and the
  // vent stack through the lid
  function worksWall(r, si, c, last) {
    var corner = (si === 0 || si === last) && (c === 0 || c === 4)
    if (corner) return 'T'
    if (r === 6) return si === 2 && c === 2 ? 'P' : 'F'
    if (r === 2 || r === 3) return 'L'
    if (r === 4) return 'P'
    return 'F'
  }

  function worksInner(r, si, c) {
    // the centrifuge column (gearboxes, 3 high) on the left, the mixing vessel (glass, 2 high) on the right
    if (si === 2 && c === 1 && r <= 3) return 'G'
    if (si === 2 && c === 3 && r <= 2) return 'L'
    return '#'
  }

  function specOf(m, inner) {
    var parts = [
      Pat.block(CASING),
      Pat.part('energy_input', m.parts.energy_input),
      Pat.part('input_bus', m.parts.input_bus),
      Pat.part('input_hatch', m.parts.input_hatch),
      Pat.part('output_bus', m.parts.output_bus),
      Pat.part('output_hatch', m.parts.output_hatch),
      G.parallelHatch.part()
    ]
    return {
      slices: shell(m, inner),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, parts),
        F: Pat.block(CASING),
        G: Pat.block(GEARBOX),
        P: Pat.block(PIPE),
        L: Pat.block(GLASS),
        T: Pat.frame(['tungsten_steel']),
        '#': Pat.air()
      }
    }
  }
  NQ.machines.refinery.wall = refineryWall
  NQ.machines.fuelWorks.wall = worksWall
  NQ.machines.refinery.spec = specOf(NQ.machines.refinery, refineryInner)
  NQ.machines.fuelWorks.spec = specOf(NQ.machines.fuelWorks, worksInner)

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
    Object.keys(NQ.machines).forEach(function (k) {
      var m = NQ.machines[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.CHEMICAL)
    })
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Object.keys(NQ.machines).forEach(function (k) {
      var m = NQ.machines[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(CASING) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.2'),
          Text.translate('grindless.machine.parallel_hatch.tooltip')
        ])
        .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + m.name)

      if (G.parallelHatch && G.parallelHatch.machines && G.parallelHatch.machines.indexOf(m.machine) < 0) G.parallelHatch.machines.push(m.machine)
    })
  })
})()
