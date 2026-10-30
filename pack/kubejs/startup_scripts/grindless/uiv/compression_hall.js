// priority: -9124
// -----------------------------------------------------------------------------------------------
// UIV Neutronium Compression Hall, gtceu:neutronium_compression_hall (package UIV-M2, docs/eras/uiv.md #### M2.): the press of the mega family. One machine
// runs GTM's gtceu:compressor and gtceu:implosion_compressor recipes (no new recipe type). lib/mega.js and lib/parallel_hatch.js are unchanged: as
// uev/stellar_forge.js this file reimplements the ~15 lines of `bound` with mega.formulas and mega.maxVoltage, because the ceiling counts pellets.
//
// - Pellets: grindless:neutronium_pellet (made by the neutronium cage) sitting in an INPUT BUS are the press's tooling, never a recipe input of
//   GTM's recipes. k = min(4, pellets in the input buses) and the ceiling is 4^k: 4 pellets give 256 copies, 1 pellet 4, never more.
//   0 pellets: the hall REFUSES (no copy runs). The pellet is the hall's tool; without one it is only an empty frame.
// - Parallel hatch: the formed parallel hatch (gtceu:uiv_parallel_hatch, x16,384) MULTIPLIES the ceiling, as the Stellar Forge's does; no hatch is x1.
// - Then the energy bound floor(max voltage / recipe EU/t) and ParallelLogic: every copy pays its full EU/t. Then GTM's perfect overclock and batch.
// - Implosion keeps its explosive: GTM matches a recipe's ORIGINAL inputs before any modifier runs (RecipeLogic.searchRecipe), so a modifier cannot
//   drop an input the lookup requires. The pellets only give the parallels; every copy still burns its explosive. Compressor recipes are unchanged.
// - No wear: the pellets are durable tooling and are never consumed. A chanced pellet input (1 run in 64) was tried and made GTM drop the run (bench
//   20261029-144925-server: wear step, "default_fail"), so it was cut; the pellet is only ever read from the bus.
//
// Structure (13 wide x 10 high x 11 deep, G.uivShapes hall silhouette): a framed press hall with a plinth, window courses, four pillar frames, an
// anvil bed with a coil-wrapped compression cell, a ram on pipe rods under a pipe lantern. Parts go in the floor: 1 maintenance, 1 or 2 energy hatches,
// 1 or 2 input and 2 output buses, 1 parallel hatch (optional). Textures: tools/assets/Build-UIVCompressionHallTextures.ps1. Names / tooltips:
// client_scripts/grindless/uiv_compression_hall_lang.js. Controller recipe: server_scripts/grindless/uiv/compression_hall.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const F = G.mega.formulas

  const ID = 'neutronium_compression_hall'
  const CASING = 'grindless:neutron_star_site_casing'
  const CASING_TEXTURE = 'grindless:block/uiv/neutron_star_site_casing'
  const PELLET = 'grindless:neutronium_pellet'
  const TYPES = ['compressor', 'implosion_compressor']
  const MAX_PELLETS = 4
  const BASE = 4
  const MAX_PARALLEL = 2147483647
  const W = 13
  const H = 10
  const D = 11
  const CX = 6
  const CZ = 5
  const HH = 8

  // ---------------------------------------------------------------- pure arithmetic (node-tested)
  // pellets that count: 0..4
  function pelletsOf(count) {
    var n = Math.floor(Number(count))
    if (!(n > 0)) return 0
    return Math.min(MAX_PELLETS, n)
  }
  // copies the pellets allow: 4^k x the hatch, never above 2^31-1; 0 pellets: 0 (refused)
  function ceilingOf(count, hatch) {
    var k = pelletsOf(count)
    if (k < 1) return 0
    var hp = Number(hatch)
    if (!(hp >= 1)) hp = 1
    return Math.min(MAX_PARALLEL, Math.pow(BASE, k) * hp)
  }

  // ---------------------------------------------------------------- the silhouette
  // inner cells of the hall: pillar frames, an anvil bed under a coil cell, a ram on rods
  function inner(x, y, z) {
    var dx = Math.abs(x - CX)
    var dz = Math.abs(z - CZ)
    if (dx === 4 && dz === 3) return 'Q'
    if (y === 1 && dx <= 2 && dz <= 1) return 'B'
    if (y === 2 && dx <= 1 && dz === 0) return 'C'
    if (y === HH - 2 && dx <= 2 && dz <= 1) return 'B'
    if (y === HH - 3 && dx === 0 && dz === 0) return 'P'
    return null
  }
  // two courses of pipe lantern over the roof
  function crown(x, k, z) {
    var dx = Math.abs(x - CX)
    var dz = Math.abs(z - CZ)
    if (k === 0) return dx <= 2 && dz <= 1 ? (dx === 0 && dz === 0 ? 'P' : 'A') : ' '
    if (k === 1) return dx === 0 && dz === 0 ? 'P' : ' '
    return ' '
  }

  var HALL_FN = null
  function cellOf(x, y, z) {
    if (HALL_FN === null) HALL_FN = G.uivShapes.hall({ w: W, d: D, hh: HH, mull: 4, crown: crown, inner: inner })
    return HALL_FN(x, y, z)
  }

  var SPEC = null
  function makeSpec() {
    return G.uivShapes.spec(Pat, {
      w: W, h: H, d: D, fn: cellOf,
      pal: {
        F: CASING,
        Q: 'tungsten_steel',
        A: 'gtceu:stable_machine_casing',
        L: 'gtceu:laminated_glass',
        P: 'gtceu:tungstensteel_pipe_casing',
        C: 'grindless:metallic_hydrogen_coil_block',
        B: 'gtceu:tungstensteel_gearbox'
      },
      parts: [
        Pat.part('maintenance', { exact: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        G.parallelHatch.part()
      ]
    })
  }

  // ---------------------------------------------------------------- GTM glue
  var LC = null
  function lc() {
    if (LC === null) {
      LC = {
        PL: Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic'),
        CM: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier'),
        RH: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
        ArrayList: Java.loadClass('java.util.ArrayList'),
        Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return LC
  }

  function recipeEut(recipe) {
    var RH = lc().RH
    try {
      return Number(RH.getRealEUt(recipe).getTotalEU())
    } catch (e) {
      return Number(RH.getInputEUt(recipe))
    }
  }

  function hatchParallel(machine) {
    try {
      var o = machine.getParallelHatch()
      if (o !== null && o !== undefined && o.isPresent()) return Number(o.get().getCurrentParallel())
    } catch (e) { }
    return 1
  }

  function scaling(n) {
    return ModifierFunction.builder().modifyAllContents(lc().CM.multiplier(n)).eutMultiplier(n).parallels(n).build()
  }

  // pellets in the input buses (the pattern of iv/fission_reactor.js: the bus handlers' contents)
  function pelletCount(machine) {
    var c = lc()
    var n = 0
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.ItemCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (stack === null || stack === undefined || typeof stack.isEmpty !== 'function' || stack.isEmpty()) continue
        if (String(c.Forge.ITEMS.getKey(stack.getItem())) === PELLET) n += Number(stack.getCount())
      }
    }
    return n
  }

  var failed = false
  function once(name, e) {
    if (!failed) {
      failed = true
      console.error('[grindless/uiv] compression hall ' + name + ' failed: ' + e)
    }
  }

  // parallel (bound, as lib/mega.js: ceiling, energy cap, ParallelLogic)
  function hall(machine, recipe) {
    try {
      var ceiling = ceilingOf(pelletCount(machine), hatchParallel(machine))
      if (ceiling < 1) return ModifierFunction.NULL
      var want = F.parallels(ceiling, F.energyCap(G.mega.maxVoltage(machine), recipeEut(recipe)), null)
      if (want < 1) return ModifierFunction.NULL
      var n = lc().PL.getParallelAmount(machine, recipe, want)
      if (n < 1) return ModifierFunction.NULL
      if (n === 1) return ModifierFunction.IDENTITY
      return scaling(n)
    } catch (e) {
      once('parallel', e)
      return ModifierFunction.NULL
    }
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const CH = G.compressionHall || (G.compressionHall = {})
  CH.id = 'gtceu:' + ID
  CH.types = TYPES
  CH.pellet = PELLET
  CH.casing = CASING
  CH.maxPellets = MAX_PELLETS
  CH.maxParallel = MAX_PARALLEL
  CH.size = { width: W, height: H, depth: D }
  CH.formulas = { pelletsOf: pelletsOf, ceilingOf: ceilingOf }
  CH.modifiers = { hall: hall }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SPEC = makeSpec()
    Pat.register('gtceu:' + ID, SPEC)

    var types = TYPES.map(function (t) {
      var type = GTRecipeTypes.get(t)
      if (type == null) throw new Error('[grindless/uiv] recipe type gtceu:' + t + ' is not registered')
      return type
    })
    var tail = G.mega.chain({ parallel: 'none', discount: null, oc: 'perfect', batch: true })
    var list = [hall].concat(tail)

    var b = event.create(ID, 'multiblock')
      .langValue('Neutronium Compression Hall')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeTypes(types[0], types[1])
    G.mega.install(b, list)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.' + ID + '.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_2.tooltip', Text.translate('gtceu.compressor'), Text.translate('gtceu.implosion_compressor')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip'),
        Text.translate('grindless.machine.' + ID + '.tooltip.1')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
