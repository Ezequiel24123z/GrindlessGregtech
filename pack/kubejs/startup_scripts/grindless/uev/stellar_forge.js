// priority: -7632
// -----------------------------------------------------------------------------------------------
// UEV Stellar Forge, gtceu:stellar_forge (package UEV-M2, docs/eras/uev.md #### M2.): the massive electric blast furnace. It runs GTM's
// gtceu:electric_blast_furnace recipes (no new recipe type) with a coil-heat parallel and an optional plasma boost. lib/mega.js and lib/coils.js
// are unchanged: this file reimplements the ~15 lines of `bound` with mega.formulas and mega.maxVoltage, because the ceiling depends on a
// recipe temperature and on the plasma, which the library's coilParallel does not know.
//
// - Veto: a recipe whose blast temperature is above the COIL temperature is refused, plasma or not (the bonus never unlocks a hotter recipe).
// - Plasma (optional per run): with >= PLASMA_MB of gtceu:uev_dhe3_plasma in the fluid inputs (and room for the ash) the run takes PLASMA_MB once
//   and returns PLASMA_MB of gtceu:helium_4_ash, and the heat is coil + PLASMA_BONUS_K for that run; otherwise heat = coil and nothing extra is
//   drained. The fluids are added by the LAST modifier, after scaling, so they are never multiplied by the parallel count.
// - Parallels: 2^floor(max(0, heat - recipe temperature) / 450) x the formed parallel hatch's parallel (x1 without), clamped to 2^31-1, then
//   floor(max voltage / recipe EU/t) and ParallelLogic (inputs, output room): every copy pays its full EU/t (family rule 1).
// - Then GTM's EBF energy discount (0.95 per coil step above 1800 K, floor 0.80), perfect overclock and batch mode (rules 2, 3, 4).
//
// Structure (15 wide x 23 high x 15 deep, uev/shapes.js): a hearth hall of SiC composite lined with HfTaCN bricks under a 9 x 9 HfTaCN shaft in
// glass bands with four rings of 16 heating coils (any coil, the lowest one sets the tier) round the central air column at heights 8, 11, 14
// and 17, capped by a deck and a chimney. The controller sits in the middle of the front wall, one row above the floor. Parts go in the floor
// and the front wall's first row: 1 maintenance, 1 or 2 energy hatches, 1 parallel hatch (optional), up to 2 input and 2 output buses, up to
// 4 fluid input and 4 fluid output hatches.
//
// Textures: overlay dir grindless:block/multiblock/stellar_forge (tools/assets/Build-UEVStellarForgeTextures.ps1). Names / tooltips:
// client_scripts/grindless/uev_stellar_forge_lang.js. Controller recipe: server_scripts/grindless/uev/stellar_forge.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Coils = G.coils
  const F = G.mega.formulas

  const ID = 'stellar_forge'
  const CASING = 'grindless:hftacn_lining_casing'
  const CASING_TEXTURE = 'grindless:block/uev/hftacn_lining_casing'
  const DISCOUNT = { rate: 0.95, floor: 0.80, baseK: 1800 }
  const HATCHES = { energy: [1, 2], inputBus: 2, outputBus: 2, inputHatch: 4, outputHatch: 4, parallelHatch: 1 }
  const PLASMA = 'gtceu:uev_dhe3_plasma'
  const ASH = 'gtceu:helium_4_ash'
  const PLASMA_MB = 250
  const PLASMA_BONUS_K = 900
  const STEP_K = 450
  const MAX_PARALLEL = 2147483647
  const W = 15
  const H = 23
  const D = 15
  const RING_HEIGHTS = [8, 11, 14, 17]
  // 1 maintenance + 2 energy + 2 + 2 buses + 4 + 4 fluid hatches + 1 parallel hatch
  const PART_CELLS = 16

  // ---------------------------------------------------------------- pure arithmetic (node-tested)
  // copies the heat allows: 2^floor(max(0, heat - recipe temperature) / 450) x hatch, never above 2^31-1
  function ceilingOf(heatK, recipeK, hatch) {
    var h = Number(heatK)
    var r = Number(recipeK)
    if (!(h > 0)) return 1
    if (!(r >= 0)) r = 0
    var steps = Math.floor(Math.max(0, h - r) / STEP_K)
    var hp = Number(hatch)
    if (!(hp >= 1)) hp = 1
    return Math.min(MAX_PARALLEL, Math.pow(2, Math.min(steps, 62)) * hp)
  }
  // the heat of one run: the coil, plus the plasma bonus when the run takes plasma
  function heatOf(coilK, plasma) {
    return Number(coilK) + (plasma ? PLASMA_BONUS_K : 0)
  }
  // a recipe hotter than the coil is refused, plasma or not
  function vetoed(coilK, recipeK) {
    return Number(recipeK) > Number(coilK)
  }
  // plasma and ash a run carries: once, whatever the number of copies
  function plasmaFor(plasma) {
    return plasma ? { in: PLASMA_MB, out: PLASMA_MB } : { in: 0, out: 0 }
  }

  // The forge (15 x 23 x 15): a stacked furnace tower girdled by four coil rings. A hearth hall of SiC composite lined with HfTaCN bricks
  // (floor and front wall take the parts, X) carries a 9 x 9 HfTaCN shaft in glass bands; four rings of 16 heating coils (K) hang round
  // the central air column; a deck and a pipe chimney cap it, and frame posts stand at the hearth corners. S is the controller.
  function build() {
    var s = G.uevShapes.scene(W, H, D)
    s.box(1, 0, 1, 13, 0, 13, 'X')
    s.room(0, 1, 0, 14, 5, 14, 'R', 'b', '#')
    s.room(1, 1, 1, 13, 4, 13, 'H', 'bt', '#')
    s.box(4, 1, 14, 10, 1, 14, 'X')
    s.edges(0, 0, 0, 14, 5, 14, 'Q')
    s.room(3, 6, 3, 11, 20, 11, 'H', 'bt', '#')
    ;[9, 13, 17].forEach(function (y) { s.room(3, y, 3, 11, y, 11, 'L', 'bt', '#') })
    RING_HEIGHTS.forEach(function (y) { s.room(5, y, 5, 9, y, 9, 'K', 'bt', '#') })
    s.box(3, 21, 3, 11, 21, 11, 'R')
    s.room(6, 22, 6, 8, 22, 8, 'R', 'b', '#').box(7, 22, 7, 7, 22, 7, 'P')
    var slices = G.uevShapes.slices(W, H, D, s.fn())
    var casingCells = 0
    var coilCells = 0
    slices.forEach(function (rows) {
      rows.forEach(function (row) {
        for (var i = 0; i < row.length; i++) {
          if (row.charAt(i) === 'X') casingCells++
          if (row.charAt(i) === 'K') coilCells++
        }
      })
    })
    return { slices: slices, casingCells: casingCells, coilCells: coilCells }
  }
  var BUILT = null
  // ---------------------------------------------------------------- GTM glue
  var LC = null
  function lc() {
    if (LC === null) {
      LC = {
        PL: Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic'),
        CM: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier'),
        RH: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        Content: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.Content'),
        FluidIngredient: Java.loadClass('com.gregtechceu.gtceu.api.recipe.ingredient.FluidIngredient'),
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        ArrayList: Java.loadClass('java.util.ArrayList'),
        Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        RL: Java.loadClass('net.minecraft.resources.ResourceLocation')
      }
    }
    return LC
  }

  function fluidOf(id) {
    var c = lc()
    return c.Forge.FLUIDS.getValue(new c.RL(id))
  }

  function recipeEut(recipe) {
    var RH = lc().RH
    try {
      return Number(RH.getRealEUt(recipe).getTotalEU())
    } catch (e) {
      return Number(RH.getInputEUt(recipe))
    }
  }

  function recipeTemp(recipe) {
    try {
      var d = recipe.data
      if (d !== null && d !== undefined && d.contains('ebf_temp')) return Number(d.getInt('ebf_temp'))
    } catch (e) { }
    return 0
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

  // GTRecipe#copy() copies the contents map but shares its lists: the fluid lists are replaced with fresh ones in the copy
  function addFluid(copy, inputSide, id, mb) {
    var c = lc()
    var map = inputSide ? copy.inputs : copy.outputs
    var fresh = new c.ArrayList()
    var old = map.get(c.FluidCap)
    if (old != null) fresh.addAll(old)
    fresh.add(new c.Content(c.FluidIngredient.of(fluidOf(id), mb), 10000, 10000, 0))
    map.put(c.FluidCap, fresh)
  }

  function withPlasma(recipe) {
    var copy = recipe.copy()
    addFluid(copy, true, PLASMA, PLASMA_MB)
    addFluid(copy, false, ASH, PLASMA_MB)
    return copy
  }

  // does this recipe, plus one plasma run, match the machine (plasma in a fluid input hatch, room for the ash)?
  function plasmaFits(machine, recipe) {
    return lc().RH.matchRecipe(machine, withPlasma(recipe)).isSuccess()
  }

  var failed = false
  function once(name, e) {
    if (!failed) {
      failed = true
      console.error('[grindless/uev] stellar forge ' + name + ' failed: ' + e)
    }
  }

  // the first modifier decides the run's plasma and the last one adds it: both run back to back in one search of one machine
  var plasmaRun = false

  // veto + heat parallel (bound, as lib/mega.js: ceiling, energy cap, ParallelLogic)
  function forge(machine, recipe) {
    try {
      plasmaRun = false
      var coil = G.coils.temperature(machine)
      var tr = recipeTemp(recipe)
      if (vetoed(coil, tr)) return ModifierFunction.NULL
      plasmaRun = plasmaFits(machine, recipe)
      var want = F.parallels(ceilingOf(heatOf(coil, plasmaRun), tr, hatchParallel(machine)), F.energyCap(G.mega.maxVoltage(machine), recipeEut(recipe)), null)
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

  // last: the run's plasma in and ash out, once
  function plasma(machine, recipe) {
    try {
      if (!plasmaRun) return ModifierFunction.IDENTITY
      plasmaRun = false
      // the scaled and discounted recipe must still take the plasma and hold the ash, or the run would carry copies the heat did not pay for
      if (!plasmaFits(machine, recipe)) return ModifierFunction.NULL
      return ModifierFunction.IDENTITY.andThen(function (r) { return withPlasma(r) })
    } catch (e) {
      once('plasma', e)
      return ModifierFunction.NULL
    }
  }

  var SPEC = null
  function makeSpec() {
    BUILT = build()
    SF.coilCells = BUILT.coilCells
    SF.casingCells = BUILT.casingCells
    var pal = G.uevShapes.palette(CASING)
    return {
      slices: BUILT.slices,
      symbols: {
        S: Pat.controller(),
        K: Coils.predicate(),
        X: Pat.oneOf(
          Pat.block(CASING, { min: BUILT.casingCells - PART_CELLS }),
          Pat.part('maintenance', { exact: 1 }),
          Pat.part('energy_input', { min: HATCHES.energy[0], max: HATCHES.energy[1] }),
          Pat.part('input_bus', { max: HATCHES.inputBus }),
          Pat.part('output_bus', { max: HATCHES.outputBus }),
          Pat.part('input_hatch', { max: HATCHES.inputHatch }),
          Pat.part('output_hatch', { max: HATCHES.outputHatch }),
          G.parallelHatch.part()
        ),
        '#': Pat.air(),
        F: Pat.block(CASING),
        R: Pat.block(pal.R),
        H: Pat.block(pal.H),
        L: Pat.block(pal.L),
        P: Pat.block(pal.P),
        Q: Pat.frame([pal.Q])
      }
    }
  }

  // published for the recipe script, the lang file, the node test and the bench test
  const SF = G.stellarForge || (G.stellarForge = {})
  SF.id = 'gtceu:' + ID
  SF.type = 'gtceu:electric_blast_furnace'
  SF.discount = DISCOUNT
  SF.casing = CASING
  SF.hatches = HATCHES
  SF.plasma = PLASMA
  SF.ash = ASH
  SF.plasmaMb = PLASMA_MB
  SF.plasmaBonusK = PLASMA_BONUS_K
  SF.stepK = STEP_K
  SF.maxParallel = MAX_PARALLEL
  SF.size = { width: W, height: H, depth: D }
  SF.formulas = { ceilingOf: ceilingOf, heatOf: heatOf, vetoed: vetoed, plasmaFor: plasmaFor }
  SF.modifiers = { forge: forge, plasma: plasma }

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    SPEC = makeSpec()
    Pat.register('gtceu:' + ID, SPEC)

    var tail = G.mega.chain({ parallel: 'none', discount: DISCOUNT, oc: 'perfect', batch: true })
    var list = [forge].concat(tail).concat([plasma])

    var b = event.create(ID, 'multiblock')
      .langValue('Stellar Forge')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return Coils.create(holder) })
      .recipeType('electric_blast_furnace')
    G.mega.install(b, list)
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.stellar_forge.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.electric_blast_furnace')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip'),
        Text.translate('gtceu.machine.perfect_oc')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/' + ID)
  })
})()
