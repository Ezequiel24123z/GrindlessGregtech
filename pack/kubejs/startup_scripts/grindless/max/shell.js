// -----------------------------------------------------------------------------------------------
// MAX's mirror shell (docs/eras/max.md, machine 8; package MAX-G1): the multiblock, its recipe type and the credits handler. No item of its
// own: the segment and the bundle block are F1's (max/foundation.js). The recipes are in server_scripts/grindless/max/shell.js.
//
//   gtceu:mirror_shell   33 x 33 x 33 hollow shell of mirror shell segments with stream bundle block rings, the controller at the equator
//                        of the front face, on two MAX 16 A input hatches and one or two dynamo hatches. Recipe type gtceu:black_hole_bomb:
//                        circuit 1 the vent (a generator: one seed wave packet, 2^30 EU/t out), circuit 2 the final spin map, circuit 3 the
//                        last recipe (consumes 2^35 EU/t, makes the universe seed).
//
// One controller carries both kinds of row. It is NOT configured as a generator (G.generators.configure would call .generator(true), and
// GTM then reads the output voltage of a machine that has input hatches: 0). Instead the recipe modifier hands generator rows to
// G.generators.modifier and returns IDENTITY for consumer rows (no overclock, no parallels; NULL would reject the recipe). Names: client_scripts/grindless/max_shell_lang.js.
// Textures: tools/assets/Build-MaxShellTextures.ps1. Published for the recipe script: global.grindless.maxShell.
//
// Credits: when a run of the last recipe ends, every player within 64 blocks of the controller gets the title and, once, the epilogue
// item; the first time also the vanilla WIN_GAME event with value 1 (the credits screen). ServerPlayer.wonGame is never set, so the
// server ignores the client's PERFORM_RESPAWN while the player is alive and nobody is moved or changes game mode.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MS = G.maxShell || (G.maxShell = {})
  const LOG = '[grindless/max] '

  const SEGMENT = 'grindless:mirror_shell_segment'
  const BUNDLE = 'grindless:stream_bundle_block'
  const SEGMENT_TEXTURE = 'grindless:block/max/mirror_shell_segment'
  const N = 33
  const MID = 16
  const NEAR = 64
  const ENDING = 'universe_seed'

  MS.machines = [
    {
      name: 'mirror_shell', machine: 'gtceu:mirror_shell', type: 'black_hole_bomb', dataKey: 'grindless_black_hole_bomb',
      lang: 'Mirror Shell', maxIO: { itemsIn: 6, itemsOut: 3, fluidsIn: 0, fluidsOut: 0 }, casing: SEGMENT, texture: SEGMENT_TEXTURE
    }
  ]

  // x left to right, y bottom to top, z back to front. Two stream bundle block rings run round the four side faces (y 8 and 24); every face
  // is otherwise tiled 8 x 8: a cleanroom glass window ringed by superconducting coil, segment between; the core is empty.
  // The hatch cells are on the front face, two rows of seven round the controller at the equator.
  function shellCell(x, y, z) {
    var edge = x === 0 || x === N - 1 || y === 0 || y === N - 1 || z === 0 || z === N - 1
    if (!edge) return '#'
    if (z === N - 1 && x >= 13 && x <= 19 && (y === 14 || y === 18)) return 'X'
    if ((y === 8 || y === 24) && y !== 0 && y !== N - 1) return 'A'
    var zFace = z === 0 || z === N - 1
    var xFace = x === 0 || x === N - 1
    var u = zFace ? x : xFace ? y : x
    var v = zFace ? y : z
    var a = u % 8
    var b = v % 8
    if (a >= 3 && a <= 5 && b >= 3 && b <= 5) return 'L'
    if (a >= 2 && a <= 6 && b >= 2 && b <= 6) return 'C'
    return 'F'
  }

  // slices back -> front, rows bottom -> top; the controller is the middle cell of the front slice
  function slices() {
    var out = []
    for (var z = 0; z < N; z++) {
      var rows = []
      for (var y = 0; y < N; y++) {
        var row = ''
        for (var x = 0; x < N; x++) {
          row += z === N - 1 && y === MID && x === MID ? 'S' : shellCell(x, y, z)
        }
        rows.push(row)
      }
      out.push(rows)
    }
    return out
  }

  function parts() {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('energy_input', { min: 2, max: 2 }),
      Pat.part('energy_output', { min: 1, max: 2 })
    ]
  }

  function spec(m) {
    var casing = Pat.block(m.casing)
    return {
      slices: slices(),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [casing].concat(parts())),
        F: casing,
        A: Pat.block(BUNDLE),
        L: Pat.block('gtceu:cleanroom_glass'),
        C: Pat.block('gtceu:superconducting_coil'),
        '#': Pat.air()
      }
    }
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

  // generator rows (EU out) go through the generator modifier, consumer rows run as written
  function shellModifier() {
    var gen = G.generators.modifier({ maxParallels: 1, name: 'mirror_shell' })
    return function (machine, recipe) {
      if (G.generators.recipeEUt(recipe) > 0) return gen(machine, recipe)
      return ModifierFunction.IDENTITY
    }
  }

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = { Packet: Java.loadClass('net.minecraft.network.protocol.game.ClientboundGameEventPacket') }
    }
    return LC
  }

  function theEnd(machine) {
    var last = machine.getRecipeLogic().getLastRecipe()
    if (last === null || last === undefined) return false
    return String(last.data.getString('grindless_black_hole_bomb')) === ENDING
  }

  var failed = false
  function credits(machine) {
    try {
      if (!theEnd(machine)) return
      var level = machine.getLevel()
      var pos = machine.getPos()
      var server = level.getServer()
      var near = level.players()
      for (var i = 0; i < near.size(); i++) {
        var p = near.get(i)
        if (p.distanceToSqr(pos.getX() + 0.5, pos.getY() + 0.5, pos.getZ() + 0.5) > NEAR * NEAR) continue
        var name = String(p.getGameProfile().getName())
        var saved = p.persistentData
        server.runCommandSilent('title ' + name + ' title {"translate":"grindless.max.ending.title"}')
        server.runCommandSilent('title ' + name + ' subtitle {"translate":"grindless.max.ending.subtitle"}')
        if (!saved.getBoolean('grindless_max_epilogue')) {
          saved.putBoolean('grindless_max_epilogue', true)
          p.give(Item.of('grindless:max_epilogue'))
        }
        if (!saved.getBoolean('grindless_max_credits')) {
          saved.putBoolean('grindless_max_credits', true)
          p.connection.send(new (lazy().Packet)(lazy().Packet.WIN_GAME, 1.0))
        }
      }
    } catch (e) {
      if (!failed) {
        failed = true
        console.error(LOG + 'mirror shell credits failed: ' + e)
      }
    }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    MS.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('both')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MS.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .regressWhenWaiting(false)
        .recipeModifier(shellModifier(), true)
        .additionalDisplay(G.generators.display({ maxParallels: 1, name: m.name }))
        .afterWorking(credits)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
