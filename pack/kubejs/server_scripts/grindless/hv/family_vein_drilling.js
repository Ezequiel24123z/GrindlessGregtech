// -----------------------------------------------------------------------------------------------
// gtceu:vein_drilling recipes of the HV Vein Drill (gtceu:hv_vein_drill), generated from the vein tables. Every recipe lives under
// grindless:vein_drilling/hv/...: the LV and MV drills skip those (startup_scripts/grindless/lv/multis.js), the HV drill and
// every better one runs them next to the steam, LV and MV recipes.
//
//   TITANIUM bit (grindless:titanium_drill_bit)   every Overworld and Nether vein, like the vanadium steel bit of MV one step on:
//       without fluid (Overworld veins): 3.75 raw ores per run, wear 0.5 % per run (vanadium steel: 1 %)
//       with drilling fluid (all veins):  5.625 ores per run (+50 %), wear 0.25 % per run (vanadium steel: 0.5 %), 50 mB per run
//       The Nether veins still need drilling fluid, as in every tier.
//   END veins (data/grindless/tables/veins_end.json, global.grindless.hv.endVeins()): the five non-radioactive ones, GTM 7.5.3's four
//       (bauxite_end, magnetite_end, scheelite, sheldonite) and GT Community Additions' zirconium, with the vanadium steel bit (until titanium flows) and the titanium
//       bit, ALWAYS with drilling fluid (same ores per run and wear as the line above, 5.625 ores and 0.5 % / 0.25 % wear). Inert
//       byproduct: end stone. Only a drill of this tier can run them: the steam drill has no fluid hatch, the LV and MV drills
//       skip every recipe under <type>/hv/ (startup_scripts/grindless/lv/multis.js).
//   200 ticks and 8 EU/t per run, like every drilling recipe; the HV drill runs up to 32 at once (one HV energy hatch).
//
// Lookup note (GTM's RecipeDB cannot keep a recipe whose ingredient list is a prefix of another's): the base recipes list the
// sample first and the bit second (like the steam and the MV ones), the fluid recipes the bit first, then the sample, then the
// fluid (like the LV and MV ones). The bits are different items, so no list is a prefix of another.
//
// Known soft spot: the steam drill has no veto hook (MachineModifiers.STEAM_PARALLEL_MULTIBLOCK), so it could run a NO-FLUID
// recipe of a better bit if someone fed it that bit (the MV vanadium and the HV titanium ones). Harmless: same ores per run as
// the steel bit, at the steam drill's speed. The Nether and End veins need fluid, so they stay out of it.
//
// Besides the recipes this file publishes global.grindless.hv.endVeins() (normalized like global.grindless.veinTable() and
// global.grindless.lv.netherVeins(): the sample pair is unique among ALL veins), allVeins() (Overworld + Nether + End),
// checkTables() and, for the smoke test, global.grindless.hv.drilling.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})
  const HV = G.hv || (G.hv = {})

  const END_STONE = 'minecraft:end_stone'

  // ---------------------------------------------------------------- End table (same maths as the Nether one)

  var end = null
  HV.endVeins = function () {
    if (end === null) {
      var tools = LV.veinTools
      var taken = {}
      LV.allVeins().forEach(function (v) { taken[tools.pairKey(v.samplePair[0], v.samplePair[1])] = v.id })
      end = G.tables.veins_end.veins.map(function (vein) {
        var ores = tools.oresOf(vein)
        var pair = tools.samplePairOf(ores, taken)
        taken[tools.pairKey(pair[0], pair[1])] = vein.id
        return {
          id: vein.id,
          gtm: vein.gtm,
          layer: vein.layer,
          minY: vein.minY,
          maxY: vein.maxY,
          spawnWeight: vein.spawnWeight,
          color: vein.color,
          nether: false,
          end: true,
          steelOnly: false,
          stone: END_STONE,
          sample: 'grindless:vein_sample_' + vein.id,
          ores: ores,
          samplePair: pair
        }
      })
    }
    return end
  }

  // every vein the HV drill knows: Overworld, Nether, then End
  HV.allVeins = function () {
    return LV.allVeins().concat(HV.endVeins())
  }

  // problems of the End table (empty list = fine); also used by the smoke test
  HV.checkTables = function () {
    var tools = LV.veinTools
    var problems = []
    var ids = {}
    var pairs = {}
    LV.allVeins().forEach(function (v) {
      ids[v.id] = true
      pairs[tools.pairKey(v.samplePair[0], v.samplePair[1])] = v.id
    })
    HV.endVeins().forEach(function (v) {
      if (ids[v.id]) problems.push('End vein id ' + v.id + ' is already an Overworld or Nether vein')
      ids[v.id] = true
      var total = v.ores.reduce(function (s, o) { return s + o.share }, 0)
      if (Math.abs(total - 1) > 1e-9) problems.push(v.id + ': shares add up to ' + total)
      var key = tools.pairKey(v.samplePair[0], v.samplePair[1])
      if (pairs[key]) problems.push('sample recipe of ' + v.id + ' is the same as the one of ' + pairs[key] + ' (' + key + ')')
      pairs[key] = v.id
      v.ores.forEach(function (o) {
        if (!Item.exists(o.item)) problems.push(v.id + ': raw ore item ' + o.item + ' does not exist')
      })
      if (!Item.exists(v.sample)) problems.push(v.id + ': sample item ' + v.sample + ' is not registered (startup table out of sync?)')
    })
    return problems
  }

  // ---------------------------------------------------------------- recipes

  // expected amount per run -> whole items + one chanced item for the fraction
  function addOre(recipe, item, expected) {
    var whole = Math.floor(expected + 1e-9)
    var chance = Math.round((expected - whole) * 10000)
    if (whole > 0) recipe.itemOutputs(whole + 'x ' + item)
    if (chance >= 1) recipe.chancedOutput('1x ' + item, Math.min(chance, 9999), 0)
  }

  ServerEvents.recipes(function (event) {
    HV.checkTables().forEach(function (problem) {
      console.error('[grindless/hv] End vein table: ' + problem)
    })

    var drilling = LV.drilling
    var bits = drilling && drilling.bits ? drilling.bits : null
    var titanium = bits ? bits.titanium : null
    var vanadium = bits ? bits.vanadium_steel : null
    if (!titanium || !vanadium) {
      console.error('[grindless/hv] vein_drilling: the titanium or vanadium steel bit is missing from the BITS table of lv/vein_drilling.js')
      return
    }
    var missingBits = [titanium.item, vanadium.item].filter(function (id) { return !Item.exists(id) })
    if (missingBits.length > 0) {
      console.error('[grindless/hv] vein_drilling recipes skipped, unknown item(s) ' + missingBits.join(', '))
      return
    }

    // without fluid: the bit's base wear and yield
    var plain = function (vein, bit, name) {
      var recipe = event.recipes.gtceu.vein_drilling('grindless:hv/' + vein.id + '_' + name)
        .notConsumable(vein.sample)
        .chancedInput(bit.item, bit.baseWear, 0)
        .itemOutputs('1x ' + vein.stone)
      vein.ores.forEach(function (ore) {
        if (Item.exists(ore.item)) addOre(recipe, ore.item, ore.share * bit.basePerRun)
      })
      recipe.EUt(drilling.eut).duration(drilling.duration)
    }

    // with drilling fluid: +50 % ore, half the wear
    var wet = function (vein, bit, name) {
      var recipe = event.recipes.gtceu.vein_drilling('grindless:hv/' + vein.id + '_' + name + '_fluid')
        .chancedInput(bit.item, bit.wear, 0)
        .notConsumable(vein.sample)
        .inputFluids(Fluid.of(drilling.fluid, drilling.fluidMb))
        .itemOutputs('1x ' + vein.stone)
      vein.ores.forEach(function (ore) {
        if (Item.exists(ore.item)) addOre(recipe, ore.item, ore.share * bit.perRun)
      })
      recipe.EUt(drilling.eut).duration(drilling.duration)
    }

    var base = 0
    var fluid = 0
    LV.allVeins().forEach(function (vein) {
      if (!vein.nether) {
        plain(vein, titanium, 'titanium')
        base++
      }
      wet(vein, titanium, 'titanium')
      fluid++
    })

    var endFluid = 0
    HV.endVeins().forEach(function (vein) {
      wet(vein, vanadium, 'vanadium_steel')
      wet(vein, titanium, 'titanium')
      endFluid += 2
    })

    // published for the smoke test
    HV.drilling = {
      bit: titanium.item,
      base: base,
      fluid: fluid,
      endFluid: endFluid,
      count: base + fluid + endFluid
    }
    console.info('[grindless/hv] vein_drilling recipes: titanium bit ' + base + ' without fluid, ' + fluid + ' with fluid; End veins ' +
      endFluid + ' (always with fluid)')
  })
})()
