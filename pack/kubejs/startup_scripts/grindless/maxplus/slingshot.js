// priority: -5629
// -----------------------------------------------------------------------------------------------
// MAX+ machine 3, the Hills slingshot (docs/eras/maxplus.md "Machines" 3; package XP-T1): the multiblock and its recipe type. The casing and every
// item it uses are XP-F1's (maxplus/foundation.js). The recipes, with lines P15 and P16's older-machine rows, are in
// server_scripts/grindless/maxplus/slingshot.js.
//
//   gtceu:hills_slingshot   37 x 11 x 37 (D5-SHAPE-MAXP-B1) of bound lattice, slingshot coil and Kerr coil casing: a long
//                           accelerator ring of superconducting coils with glass-banded flanks. Recipe type gtceu:hills_slingshot: c1 binds a relay probe to a canned counterweight, c2
//                           releases the pair as a launched probe (the counterweight falls into the hole).
//
// It runs only at Sgr A* (rows carry the site dimension) at V[MAX] x 16 (2^35 EU/t) on a 1,024 A MAX+ energy hatch (INPUT_ENERGY, like the other MAX+
// machines'). Rows run as written: no overclock, no parallels, so the modifier returns IDENTITY. Names: client_scripts/grindless/maxplus_slingshot_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MS = G.maxPlusSlingshot || (G.maxPlusSlingshot = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:slingshot_coil_casing'
  const LATTICE = 'grindless:bound_lattice_casing'
  const LATTICE_TEXTURE = 'grindless:block/maxplus/bound_lattice_casing'
  const KERR = 'grindless:kerr_coil_casing'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  MS.machine = {
    name: 'hills_slingshot', machine: 'gtceu:hills_slingshot', type: 'hills_slingshot', dataKey: 'grindless_hills_slingshot',
    lang: 'Hills Slingshot', maxIO: { itemsIn: 3, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, casing: LATTICE, texture: LATTICE_TEXTURE,
    overlay: 'grindless:block/multiblock/hills_slingshot',
    width: 37, height: 11, depth: 37,
    pal: { F: LATTICE, W: CASING, K: KERR, L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil' },
    parts: parts
  }

  // A capture ring (radius 14.5 about the hall axis): a duct of slingshot coil casing, lined with Kerr rails and ringed by 24 superconducting
  // accelerator coils, on a lattice plinth. A launch mast of lattice rises at the axis, tied to the ring by four lattice arms.
  function slingCell(x, y, z) {
    var dx = x - 18
    var dz = z - 18
    var r = Math.sqrt(dx * dx + dz * dz)
    var u = r - 14.5
    var ang = Math.atan2(dz, dx)
    if (y === 0) return (r <= 18.4 && (r >= 11.5 || r <= 3.5)) || (Math.abs(dx) <= 1 || Math.abs(dz) <= 1) && r <= 15 ? 'F' : ' '
    var dv = y - 4
    var s = Math.sqrt(u * u + dv * dv)
    if (s < 2.0) return '#'
    if (s < 2.7) {
      var seg = Math.round(ang / 0.5235987755982988) * 0.5235987755982988
      return Math.abs(ang - seg) * r <= 0.9 && Math.abs(dv) < 1.6 ? 'C' : 'K'
    }
    if (s < 3.3) return y % 3 === 0 || Math.abs(dv) > 2.2 ? 'W' : 'L'
    if (s < 3.8) return dv > 0 ? 'F' : 'W'
    if (r <= 2.8 && y <= 10) return y % 3 === 0 ? 'K' : 'F'
    if (r <= 4.2 && y <= 6 && y >= 1) return y % 2 === 0 ? 'K' : 'F'
    if ((Math.abs(dx) <= 0.8 || Math.abs(dz) <= 0.8) && r > 4.2 && r < 10.6 && y >= 3 && y <= 4) return 'F'
    return ' '
  }

  var TWO_PI = 6.283185307179586

  function paint(w, h, d, cell) {
    var s = G.uevShapes.scene(w, h, d)
    for (var z = 0; z < d; z++) for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var ch = cell(x, y, z)
      if (ch !== ' ') s.set(x, y, z, ch)
    }
    s.booth('F', 3)
    return s.fn()
  }

  MS.shapes = function () {
    var m = MS.machine
    var o = {}
    o[m.name] = { w: m.width, h: m.height, d: m.depth, pal: m.pal, fn: paint(m.width, m.height, m.depth, slingCell) }
    return o
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: paint(m.width, m.height, m.depth, slingCell) })
  }

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

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var m = MS.machine
    event.create(m.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = MS.machine
    var type = GTRecipeTypes.get(m.type)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
    type.addDataInfo(infoOf(m.dataKey))
    m.spec = spec(m)
    Pat.register(m.machine, m.spec)

    event.create(m.name, 'multiblock')
      .langValue(m.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(m.type)
      .recipeModifier(function (machine, recipe) { return ModifierFunction.IDENTITY }, true)
      .appearanceBlock(function () { return Block.getBlock(m.casing) })
      .pattern(function (def) { return Pat.build(def, m.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
      ])
      .workableCasingModel(m.texture, m.overlay)
  })
})()
