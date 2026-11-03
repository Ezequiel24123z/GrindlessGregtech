// priority: -5559
// -----------------------------------------------------------------------------------------------
// MAX+ machines 1 and 2 (docs/eras/maxplus.md "Machines" 1 and 2; package XP-A1): the multiblocks and their recipe types. Every item, fluid
// and casing they use is XP-F1's (maxplus/foundation.js). The recipes are in server_scripts/grindless/maxplus/condensate.js.
//
//   gtceu:condensate_refinery   23 x 15 x 23 (D5-SHAPE-MAXP-B1) of tensegrity truss, condensate vessel and vacuum membrane casing (MAX casings only: bootstrap, it makes the billet). Recipe type
//                               gtceu:condensate_refinery: c1 settles the shell's condensate, c2 to c5 bind it into the P2 to P5 forms.
//   gtceu:bound_matter_press    17 x 17 x 17 of bound lattice, bound press and Kerr coil casing round an anvil, a ram and its column. Recipe type gtceu:bound_matter_press:
//                               c1 presses bound neutronium, c2 the Kerr strange ingot.
//
// Both run only at Sgr A* (gcyr:black_hole_orbit, the recipes carry the dimension). Rows run as written: no overclock, no parallels (they sit
// at VA[MAX] up to V[MAX] x 16 A on 1,024 A or 64 A substation hatches), so the modifier returns IDENTITY like the mirror shell's.
// Names: client_scripts/grindless/maxplus_condensate_lang.js. Published for the recipe script: global.grindless.maxPlusCondensate.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MC = G.maxPlusCondensate || (G.maxPlusCondensate = {})
  const LOG = '[grindless/maxplus] '

  const VESSEL = 'grindless:condensate_vessel_casing'
  const PRESS = 'grindless:bound_press_casing'
  const LATTICE = 'grindless:bound_lattice_casing'
  const LATTICE_TEXTURE = 'grindless:block/maxplus/bound_lattice_casing'
  const KERR = 'grindless:kerr_coil_casing'
  const TRUSS = 'grindless:tensegrity_truss_casing'
  const MEMBRANE = 'grindless:membrane_vacuum_casing'

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }),
      Pat.part('output_hatch', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 1, max: 2 })
    ]
  }

  // The refinery is the bootstrap: the bound lattice's own billet is made in it, so it is built of MAX casings only (truss, membrane, vessel).
  // The press, further down the line, wears the horizon family.
  MC.machines = [
    {
      name: 'condensate_refinery', machine: 'gtceu:condensate_refinery', type: 'condensate_refinery', dataKey: 'grindless_condensate_refinery',
      lang: 'Condensate Refinery', maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 2 }, casing: TRUSS, texture: 'grindless:block/max/tensegrity_truss_casing',
      overlay: 'grindless:block/multiblock/condensate_refinery',
      width: 23, height: 15, depth: 23,
      pal: { F: TRUSS, V: VESSEL, M: MEMBRANE, L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil' },
      parts: parts
    },
    {
      name: 'bound_matter_press', machine: 'gtceu:bound_matter_press', type: 'bound_matter_press', dataKey: 'grindless_bound_matter_press',
      lang: 'Bound-Matter Press', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 0, fluidsOut: 1 }, casing: LATTICE, texture: LATTICE_TEXTURE,
      overlay: 'grindless:block/multiblock/bound_matter_press',
      width: 17, height: 17, depth: 17,
      pal: { F: LATTICE, P: PRESS, K: KERR, L: 'gtceu:cleanroom_glass' },
      parts: parts
    }
  ]

  function abs(n) { return n < 0 ? -n : n }

  // The refinery: a membrane dome (radius 10.5) over a truss floor, round a superfluid core column (vessel sleeve, three superconducting rings) with
  // four vessel tanks on the diagonals joined to it by truss gantries at y 9, and eight truss pylons holding the dome.
  function vesselCell(x, y, z) {
    var dx = x - 11
    var dz = z - 11
    var r = Math.sqrt(dx * dx + dz * dz)
    if (y <= 2) return r <= 10.8 ? 'F' : ' '
    var p = Math.sqrt(dx * dx + dz * dz + (y - 3) * (y - 3))
    if (r < 1.6) return y >= 1 && y <= 13 ? '#' : ' '
    if (r < 3.2 && y <= 13) return (y === 3 || y === 7 || y === 11) && r < 2.2 ? 'C' : 'V'
    if (r <= 4 && y === 14) return 'V'
    var ang = Math.atan2(dz, dx)
    var tq = Math.round(ang / 0.7853981633974483) * 0.7853981633974483
    var tx = 11 + 6.8 * Math.cos(tq)
    var tz = 11 + 6.8 * Math.sin(tq)
    var tr = Math.sqrt((x - tx) * (x - tx) + (z - tz) * (z - tz))
    if (y <= 9 && tr < 2.4) return tr >= 1.4 || y === 9 ? 'V' : '#'
    if (y >= 3 && y <= 8 && tr < 2.9 && r > 3.2) return 'M'
    if ((y === 9 || y === 5 || y === 7 || y === 11) && r >= 3.2 && r <= 8.4) return y === 7 ? 'M' : 'F'
    if (p >= 8.6 && p < 9.6 && y >= 2) return (y + Math.round(ang * 5)) % 3 === 0 ? 'V' : 'F'
    if (p >= 9.6 && p < 11.1) {
      if (y >= 5 && y <= 6 && p < 10.6 && Math.round(ang * 4) % 2 === 0) return 'L'
      var py = Math.round(ang / 0.7853981633974483) * 0.7853981633974483
      if (y <= 12 && Math.abs(ang - py) * r <= 1.1 && p >= 9.9 && p < 10.6) return 'F'
      return 'M'
    }
    return ' '
  }

  // The press: four vessel-grade pylons of bound press casing round an anvil plate, a Kerr ram column from a bound-press head to the crown, and
  // lattice tie beams at two heights.
  function pressCell(x, y, z) {
    var dx = x - 8
    var dz = z - 8
    var cheb = Math.max(abs(dx), abs(dz))
    if (y === 0) return 'F'
    var corner = abs(dx) >= 5 && abs(dz) >= 5 && !(abs(dx) === 5 && abs(dz) === 5)
    if (corner && y <= 15) return abs(dx) === 8 || abs(dz) === 8 || y % 3 === 1 ? 'P' : (abs(dx) === 5 || abs(dz) === 5 ? (y % 2 === 0 ? 'K' : 'F') : 'F')
    if (y === 16) return cheb <= 7 ? 'F' : ' '
    if (y === 15 && cheb <= 7) return cheb >= 3 && cheb <= 5 ? 'K' : 'F'
    if (y === 1) return cheb <= 5 ? 'P' : 'F'
    if (y === 2) return cheb <= 5 ? 'P' : ' '
    if (y === 3 && cheb <= 4) return 'K'
    if (y >= 4 && y <= 5 && cheb <= 3) return y === 5 ? 'P' : '#'
    if (cheb <= 1 && y >= 6 && y <= 14) return y % 2 === 0 ? 'K' : 'P'
    if (cheb === 2 && y >= 6 && y <= 14) return y % 4 === 2 ? 'L' : 'K'
    if ((y === 8 || y === 12) && (abs(dx) === 7 || abs(dz) === 7) && cheb <= 7) return y === 8 ? 'F' : 'L'
    if ((y === 8 || y === 12) && (abs(dx) === 0 || abs(dz) === 0) && cheb >= 3) return 'K'
    return '#'
  }

  var CELLS = { condensate_refinery: vesselCell, bound_matter_press: pressCell }

  function paint(w, h, d, cell) {
    var s = G.uevShapes.scene(w, h, d)
    for (var z = 0; z < d; z++) for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var ch = cell(x, y, z)
      if (ch !== ' ') s.set(x, y, z, ch)
    }
    s.booth('F', 3)
    return s.fn()
  }

  MC.shapes = function () {
    var o = {}
    MC.machines.forEach(function (m) { o[m.name] = { w: m.width, h: m.height, d: m.depth, pal: m.pal, fn: paint(m.width, m.height, m.depth, CELLS[m.name]) } })
    return o
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: paint(m.width, m.height, m.depth, CELLS[m.name]) })
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
    MC.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MC.machines.forEach(function (m) {
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
  })
})()
