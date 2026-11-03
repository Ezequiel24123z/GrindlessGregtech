// priority: -10925
// -----------------------------------------------------------------------------------------------
// UXV's logic machine (docs/eras/uxv.md, machines 3, 4 and 5, lines 8, 12, 15 and 42; package UXV-A5): the YIG LPE furnace, the recipe types of the
// vdW stacking cell and the racetrack fab (both machines absorbed in D4-SHAPE-UXV-B: vdw_stacking runs in the UEV vdW stacker, racetrack_patterning in
// the Spintronic Cluster Tool) and the package's own items. The recipes come from
// data/grindless/tables/spin_logic.json (server_scripts/grindless/uxv/spin_logic.js).
//
//   gtceu:yig_lpe_furnace     13 x 21 x 13 vertical dipping furnace with three heater zones and a Pt crucible, UXV. Recipe type gtceu:liquid_phase_epitaxy
//                             (circuit 1 lead-borate flux, 2 YIG film wafer with the platinum crucible kept, 3 flux skim).
//
// F1 ids (sot_heterostack, racetrack_chip, magnonic_bus, pt_lpe_crucible, lpe_dross, lpe_flux ...) are registered in uxv/foundation.js;
// only the ids below are new. Textures: tools/assets/Build-UXVSpinLogicTextures.ps1. Names: client_scripts/grindless/uxv_spin_logic_lang.js.
// Published for the recipe script: global.grindless.spinLogic.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const SL = G.spinLogic || (G.spinLogic = {})
  const LOG = '[grindless/uxv] '

  const LPE_BODY = 'grindless:sic_composite_casing'
  const LPE_TEXTURE = 'grindless:block/uev/sic_composite_casing'

  SL.table = 'kubejs/data/grindless/tables/spin_logic.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  SL.items = {
    wte2_flake: { stack: 16 },
    fgt_flake: { stack: 16 },
    hbn_flake: { stack: 16 },
    patterned_track_wafer: { stack: 16 },
    pt_crucible_shell: { stack: 16 }
  }

  function basicParts(buses, hatches) {
    return function () {
      return [
        Pat.part('input_bus', { min: 1, max: buses }),
        Pat.part('output_bus', { min: 1, max: buses }),
        Pat.part('input_hatch', { min: 1, max: hatches }),
        Pat.part('output_hatch', { min: 0, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        G.parallelHatch.part()
      ]
    }
  }

  // items in include the programmed circuit and the kept crucible. A typeOnly entry registers its recipe type and no controller: vdw_stacking runs in
  // the UEV vdW stacker (uev/photonics.js) and racetrack_patterning in the Spintronic Cluster Tool (spin_deposition.js), D4-SHAPE-UXV-B.
  SL.machines = [
    {
      name: 'vdw_stacking_cell', type: 'vdw_stacking', dataKey: 'grindless_vdw_stacking', typeOnly: true,
      maxIO: { itemsIn: 4, itemsOut: 3, fluidsIn: 1, fluidsOut: 0 }
    },
    {
      name: 'racetrack_fab', type: 'racetrack_patterning', dataKey: 'grindless_racetrack_patterning', typeOnly: true,
      maxIO: { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }
    },
    {
      name: 'yig_lpe_furnace', machine: 'gtceu:yig_lpe_furnace', type: 'liquid_phase_epitaxy', dataKey: 'grindless_liquid_phase_epitaxy',
      lang: 'YIG LPE Furnace', maxIO: { itemsIn: 5, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 },
      // BOOTSTRAP MACHINE (D4-SHAPE-UXV-A): its YIG film wafers feed the mu-metal foil chain, so it wears the UEV family (SiC composite body,
      // HfTaCN hot-zone lining), never the UXV gum-metal or mu-metal casings whose recipes need its products.
      width: 13, height: 21, depth: 13, casing: LPE_BODY, texture: LPE_TEXTURE,
      pal: { F: LPE_BODY, H: 'grindless:hftacn_lining_casing', A: 'gtceu:stable_machine_casing', L: 'gtceu:laminated_glass',
        C: 'gtceu:tritanium_coil_block', G: 'gtceu:tungstensteel_gearbox', P: 'gtceu:titanium_pipe_casing', Q: 'tungsten_steel' },
      parts: basicParts(2, 2)
    }
  ]

  function abs(n) { return n < 0 ? -n : n }

  // A vertical dipping furnace (13 x 21 x 13): a plinth hall with the controller booth, a round shaft over it with three heater zones
  // (HfTaCN lining, four 3-wide coil patches each), a Pt crucible at the foot of the shaft and the dip rod hung from a gearbox head on the
  // cap, all inside a four-post cage with two service decks and a laminated-glass sight window on every face of the plinth.
  function lpeFurnace() {
    var s = G.uevShapes.scene(13, 21, 13)
    s.box(0, 0, 0, 12, 0, 12, 'F')
    s.room(0, 1, 0, 12, 3, 12, 'F', 'bt')
    s.room(1, 1, 1, 11, 3, 11, 'H', 'bt')
    s.room(0, 4, 0, 12, 4, 12, 'A', 'bt')
    ;[2, 10].forEach(function (p) {
      s.box(p, 2, 0, p + 2, 2, 0, 'L').box(p, 2, 12, p + 2, 2, 12, 'L')
      s.box(0, 2, p, 0, 2, p + 2, 'L').box(12, 2, p, 12, 2, p + 2, 'L')
    })
    s.cyl('y', 6, 6, 4, 4, 4, 'F')
    s.cyl('y', 6, 6, 4, 5, 17, 'F', true)
    ;[6, 10, 14].forEach(function (yz) {
      s.replace('F', 'H', function (x, y) { return y === yz || y === yz + 1 })
      ;[-1, 0, 1].forEach(function (k) {
        s.set(2, yz, 6 + k, 'C').set(10, yz, 6 + k, 'C').set(6 + k, yz, 2, 'C').set(6 + k, yz, 10, 'C')
      })
    })
    s.cyl('y', 6, 6, 2, 5, 8, 'A', true)
    s.cyl('y', 6, 6, 4, 18, 18, 'F')
    s.cyl('y', 6, 6, 2, 19, 20, 'H', true)
    s.box(6, 9, 6, 6, 18, 6, 'P').box(5, 19, 5, 7, 20, 7, 'G')
    ;[[0, 0], [12, 0], [0, 12], [12, 12]].forEach(function (p) { s.box(p[0], 4, p[1], p[0], 17, p[1], 'Q') })
    s.room(0, 17, 0, 12, 17, 12, 'Q', 'bt')
    ;[8, 12].forEach(function (y) {
      s.room(0, y, 0, 12, y, 12, 'A', 'bt')
      s.box(10, y, 6, 12, y, 6, 'Q').box(0, y, 6, 2, y, 6, 'Q').box(6, y, 10, 6, y, 12, 'Q').box(6, y, 0, 6, y, 2, 'Q')
    })
    return s.booth('F', 3).fn()
  }

  // built in the machine registry callback: uev/shapes.js may load after this file
  function spec(m) {
    return G.uevShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: lpeFurnace() })
  }

  // one EMI line per recipe, read from its data
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

  StartupEvents.registry('item', function (event) {
    Object.keys(SL.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(SL.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    SL.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SL.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      if (m.typeOnly) return
      m.spec = spec(m)
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
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
