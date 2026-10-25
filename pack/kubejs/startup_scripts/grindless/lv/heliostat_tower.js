// -----------------------------------------------------------------------------------------------
// LV "more reinforced" (docs/journey.md, docs/eras/lv.md): the Heliostat Tower, the first solar plant of the pack and the first step
// of the power family (heliostat tower -> lunar solar field -> orbital solar station -> Dyson sphere).
//
//   gtceu:heliostat_tower       a steel lattice tower on a 3x3 pump house, with a steel firebox receiver at the top (GTM lights it
//                               while the machine works) and a field of 28 mirrors on the ground behind it. 7 wide, 11 high,
//                               7 deep; the controller is the door of the pump house.
//   gtceu:solar_steam           its recipe type (recipes: server_scripts/grindless/lv/heliostat_tower.js): water or distilled water
//                               -> steam, only by day (GTM's daytime condition, shown in the viewers)
//   grindless:heliostat_mirror  the mirror block of the field (assembler, LV: steel plate, silver foil, glass pane, small steel gear)
//
// The sun rule (it will govern the Moon and Mercury bases later): a run only starts when GTM's own solar-boiler test passes at the
// top of the tower (GTUtil.canSeeSunClearly: open sky above it, daytime, no rain or snow falling on it, not an End biome) and the
// four corner mirrors see the sky. The recipe modifier below does that check and cancels the run otherwise ("no sun on the
// receiver" in the controller); it runs again before every run (alwaysTryModifyRecipe). GTM's daytime condition also stops a run
// that is under way when the sun sets. Fixed-time dimensions (the Nether, the End) never count as day. No overclock and no
// parallels: the field, not the energy hatch, sets the output.
//
// Pattern (lib/patterns.js: slices back -> front, rows bottom -> top):
//   M heliostat mirror   X solid steel casing or a part (pump house)   S controller   P steel pipe casing (riser)
//   F steel frame (tower legs and the mast)   B steel firebox casing (the receiver)
//
// Textures: overlay dir grindless:block/multiblock/heliostat_tower, block/heliostat/* (mirror model
// assets/grindless/models/block/heliostat/mirror.json) - tools/assets/Build-LVRoasterHeliostatTextures.ps1.
// Names / tooltips: client_scripts/grindless/lv_content_lang.js.
(function () {
  const Pat = global.grindless.patterns

  const MACHINE = 'gtceu:heliostat_tower'
  const MIRROR = 'grindless:heliostat_mirror'
  const STEEL_CASING = 'gtceu:solid_machine_casing'
  const STEEL_CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const FIREBOX = 'gtceu:steel_firebox_casing'
  const PIPE = 'gtceu:steel_pipe_casing'

  const E = '       '
  const FIELD = ['MMMMMMM', E, E, E, E, E, E, E, E, E, E]
  const SPEC = {
    slices: [
      // back: four rows of seven mirrors
      FIELD, FIELD, FIELD, FIELD,
      // the tower's back legs over the pump house, the receiver
      ['  XXX  ', '  XXX  ', '  F F  ', '  F F  ', '  F F  ', '  F F  ', '  F F  ', '  F F  ', '  BBB  ', '  BBB  ', E],
      // the riser from the pump house to the receiver, and the mast on top
      ['  XXX  ', '  XPX  ', '   P   ', '   P   ', '   P   ', '   P   ', '   P   ', '   P   ', '  BBB  ', '  BBB  ', '   F   '],
      // front: the controller at the pump house door, the front legs, the receiver
      ['  XSX  ', '  XXX  ', '  F F  ', '  F F  ', '  F F  ', '  F F  ', '  F F  ', '  F F  ', '  BBB  ', '  BBB  ', E]
    ],
    symbols: {
      S: Pat.controller(),
      // 16 pump house cells: 3 to 6 are parts (energy for the mirror drives, the water hatch, the steam hatch), the rest casing
      X: Pat.oneOf(
        Pat.block(STEEL_CASING, { min: 10 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('output_hatch', { min: 1, max: 2 })
      ),
      M: Pat.block(MIRROR),
      B: Pat.block(FIREBOX),
      P: Pat.block(PIPE),
      F: Pat.frame(['steel'])
    }
  }

  // ---------------------------------------------------------------- the sun check

  // cells of the spec relative to the controller: up, back (away from the front face) and side (+ = towards the column index)
  function relativeCells(test) {
    var ctrl = null
    var cells = []
    SPEC.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === 'S') ctrl = { si: si, ri: ri, ci: ci }
          if (test(ch, si, ri, ci)) cells.push({ si: si, ri: ri, ci: ci })
        }
      })
    })
    return cells.map(function (c) { return { up: c.ri - ctrl.ri, back: ctrl.si - c.si, side: c.ci - ctrl.ci } })
  }

  // the top of the tower (the highest cell) and the four corner mirrors
  var topRow = SPEC.slices[0].length - 1
  while (topRow > 0 && SPEC.slices.every(function (rows) { return rows[topRow].trim() === '' })) topRow--
  var fieldSlices = []
  SPEC.slices.forEach(function (rows, si) { if (rows[0].indexOf('M') >= 0) fieldSlices.push(si) })
  var firstField = fieldSlices[0]
  var lastField = fieldSlices[fieldSlices.length - 1]
  var width = SPEC.slices[0][0].length
  const PROBES = {
    top: relativeCells(function (ch, si, ri) { return ri === topRow && ch !== ' ' })[0],
    field: relativeCells(function (ch, si, ri, ci) {
      return ch === 'M' && (si === firstField || si === lastField) && (ci === 0 || ci === width - 1)
    })
  }
  if (!PROBES.top || PROBES.field.length !== 4) throw new Error('[grindless/lv] heliostat tower: bad sun probes')

  var GTUtilClass = null
  var NO_SUN = null
  var failed = false

  // horizontal step of each facing (by name: no Direction method whose script name KubeJS may have changed)
  const STEPS = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }

  // world position of a probe: front (fx, fz) is the direction the controller faces; back = -front, +side = counter-clockwise of
  // front = (fz, -fx) (the same mapping the structure placement uses)
  function probePos(pos, fx, fz, p) {
    return pos.offset(-fx * p.back + fz * p.side, p.up, -fz * p.back - fx * p.side)
  }

  function noSun() {
    if (NO_SUN === null) NO_SUN = ModifierFunction.cancel(Text.translate('grindless.machine.heliostat_tower.no_sun'))
    return NO_SUN
  }

  function sunModifier(machine, recipe) {
    try {
      if (GTUtilClass === null) GTUtilClass = Java.loadClass('com.gregtechceu.gtceu.utils.GTUtil')
      var level = machine.getLevel()
      if (level == null) return ModifierFunction.NULL
      var pos = machine.getPos()
      var step = STEPS[String(machine.getFrontFacing()).toLowerCase()]
      if (!step) return ModifierFunction.NULL
      var fx = step[0]
      var fz = step[1]
      if (!GTUtilClass.canSeeSunClearly(level, probePos(pos, fx, fz, PROBES.top))) return noSun()
      for (var i = 0; i < PROBES.field.length; i++) {
        if (!level.canSeeSky(probePos(pos, fx, fz, PROBES.field[i]).above())) return noSun()
      }
      return ModifierFunction.IDENTITY
    } catch (e) {
      if (!failed) {
        failed = true
        console.error('[grindless/lv] heliostat tower sun check failed: ' + e)
      }
      return ModifierFunction.NULL
    }
  }

  // shared with the smoke test (it places blocks over these cells)
  var shared = global.grindless.lvContent || (global.grindless.lvContent = {})
  shared.heliostatProbes = PROBES

  // ---------------------------------------------------------------- the mirror block

  StartupEvents.registry('block', function (event) {
    event.create(MIRROR)
      .glassSoundType()
      .hardness(2)
      .resistance(3)
      .requiresTool(true)
      .tagBlock('minecraft:mineable/pickaxe')
      .box(0, 0, 0, 16, 7, 16, true)
      .notSolid()
      .textureAll('grindless:block/heliostat/mirror_top')
      .model('grindless:block/heliostat/mirror')
      .item(function (item) {
        item.tooltip(Text.gray(Text.translate('tooltip.grindless.heliostat_mirror')))
      })
  })

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('solar_steam')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(0, 0, 1, 1)
      .setProgressBar(GuiTextures.PROGRESS_BAR_BOILER_HEAT, FillDirection.DOWN_TO_UP)
      .setSound(GTSoundEntries.BOILER)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('heliostat_tower', 'multiblock')
      .langValue('Heliostat Tower')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('solar_steam')
      .recipeModifier(sunModifier, true)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .allowExtendedFacing(false)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.heliostat_tower.tooltip.0'),
        Text.translate('grindless.machine.heliostat_tower.tooltip.1'),
        Text.translate('grindless.machine.heliostat_tower.tooltip.2'),
        Text.translate('grindless.machine.heliostat_tower.tooltip.3')
      ])
      .workableCasingModel(STEEL_CASING_TEXTURE, 'grindless:block/multiblock/heliostat_tower')
  })
})()
