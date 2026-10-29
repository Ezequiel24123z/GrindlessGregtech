// priority: -13124
// -----------------------------------------------------------------------------------------------
// Recipes of the EV Tripod Drill (gtceu:ev_vein_drill, startup_scripts/grindless/ev/tripod.js) and of its parts.
//
//   gtceu:vein_drilling, every one under vein_drilling/ev/ (the folder only the tripod runs; the LV, MV and HV drills skip it,
//   rules.isAboveTier in lv/multis.js). They are generated from every vein table in global.grindless.tables whose `dimension` is the
//   Moon or Mars: today veins_moon.json; a Mars table loaded the same way (veins_mars.json, as moon/items.js loads the Moon one)
//   joins with no change here. For each 'ore' vein:
//     <vein>_titanium        sample (never used up) + titanium drill bit (1 % wear)        -> stone + 3.75 raw ores per run
//     <vein>_titanium_cryo   bit (0.25 % wear) + sample + 50 mB of liquid nitrogen        -> stone + 5.625 raw ores per run
//   each with the table's dimension condition, at 8 EU/t and 200 ticks per run like every drilling recipe. The ores split like the
//   Earth tables (LV.veinTools.oresOf, the same maths for every table). The 'volatiles' veins (the regolith's helium-3) stay with the
//   Lunar Drill: the tripod has no fluid output, and in EV the regolith cell takes the regolith over.
//   Lookup note (GTM's RecipeDB cannot keep a recipe whose ingredient list is a prefix of another's): the dry recipes list the sample
//   first and the bit second, the cooled ones the bit first, then the sample, then the fluid, like the Earth drills; no other
//   vein_drilling recipe starts with a lunar or Martian sample or with the titanium bit.
//
//   grindless:lathe/titanium_drill_bit     EV lathe, 1 920 EU/t for 10 s: a long titanium rod -> a titanium drill bit. A machine
//       and not the crafting table: titanium is turned, not filed, and nothing in HV may make the bit (tools/analysis/tiers/hv.json,
//       rule broca-titanio-no-se-fabrica: HV has no EV lathe).
//   grindless:crafting/ev_vein_drill       the Lunar Drill + EV hull + 2 EV motors + EV pump + 2 EV circuits + 2 titanium plates
//   grindless:assembler/solar_wing_panel   titanium frame + 2 silicon wafers + tempered glass, HV assembler, 480 EU/t for 5 s
//
// Also: the titanium bit joins the item tag grindless:drill_bits (startup registered it as the old HV bit, without the tag).
// Published for the smoke test: global.grindless.ev.tripod.drilling = { veins, dry, cooled, count, skipped, problems }.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})
  const EV = G.ev || (G.ev = {})

  const DIMENSIONS = ['gcyr:luna', 'gcyr:mars']
  const LONG_ROD = 'gtceu:long_titanium_rod'
  const PARTS = ['gtceu:lunar_drill', 'gtceu:ev_machine_hull', 'gtceu:ev_electric_motor', 'gtceu:ev_electric_pump', 'gtceu:titanium_frame',
    'gtceu:silicon_wafer', 'gtceu:tempered_glass', LONG_ROD]

  // expected amount per run -> whole items + one chanced item for the fraction
  function addOre(recipe, item, expected) {
    var whole = Math.floor(expected + 1e-9)
    var chance = Math.round((expected - whole) * 10000)
    if (whole > 0) recipe.itemOutputs(whole + 'x ' + item)
    if (chance >= 1) recipe.chancedOutput('1x ' + item, Math.min(chance, 9999), 0)
  }

  // the 'ore' veins of every Moon or Mars table, normalized like the Earth ones; skipped = the other kinds (volatiles)
  function offworldVeins() {
    var tools = LV.veinTools
    var out = { veins: [], skipped: [], tables: [] }
    Object.keys(G.tables).sort().forEach(function (name) {
      var table = G.tables[name]
      if (!table || !table.veins || DIMENSIONS.indexOf(String(table.dimension)) < 0) return
      out.tables.push(name + '@' + table.dimension)
      table.veins.forEach(function (vein) {
        if (vein.kind !== undefined && vein.kind !== 'ore') {
          out.skipped.push(vein.id + ' (' + vein.kind + ')')
          return
        }
        out.veins.push({
          id: vein.id,
          table: name,
          dimension: String(table.dimension),
          sample: 'grindless:vein_sample_' + vein.id,
          stone: vein.stone,
          ores: tools.oresOf(vein)
        })
      })
    })
    return out
  }

  ServerEvents.tags('item', function (event) {
    var T = EV.tripod
    if (T && Item.exists(T.bit.item)) event.add('grindless:drill_bits', T.bit.item)
  })

  ServerEvents.recipes(function (event) {
    var T = EV.tripod
    var drilling = LV.drilling
    if (!T || !drilling || !LV.veinTools) {
      console.error('[grindless/ev] EV Tripod Drill recipes skipped: ' + (!T ? 'global.grindless.ev.tripod (startup) is missing' : 'lv/vein_drilling.js has not run'))
      return
    }
    var bit = T.bit
    var missing = PARTS.concat([bit.item, T.panel, T.machine]).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/ev] EV Tripod Drill recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }

    // ---- drilling
    var found = offworldVeins()
    var problems = []
    var dry = 0
    var cooled = 0
    found.veins.forEach(function (vein) {
      var bad = []
      if (!Item.exists(vein.sample)) bad.push('sample ' + vein.sample + ' is not registered')
      // the inert stone of the vein (gcyr:moon_cobblestone on the Moon); a table may leave it out, then the recipe gives none
      var stone = vein.stone ? String(vein.stone) : null
      if (stone !== null && !Item.exists(stone)) bad.push('stone ' + stone + ' does not exist')
      var total = vein.ores.reduce(function (s, o) { return s + o.share }, 0)
      if (Math.abs(total - 1) > 1e-9) bad.push('shares add up to ' + total)
      vein.ores.forEach(function (o) {
        if (!Item.exists(o.item)) bad.push('raw ore ' + o.item + ' does not exist')
      })
      if (bad.length > 0) {
        problems.push(vein.id + ': ' + bad.join(', '))
        return
      }

      var plain = event.recipes.gtceu.vein_drilling('grindless:ev/' + vein.id + '_titanium')
        .notConsumable(vein.sample)
        .chancedInput(bit.item, bit.baseWear, 0)
      if (stone !== null) plain.itemOutputs('1x ' + stone)
      vein.ores.forEach(function (o) { addOre(plain, o.item, o.share * bit.basePerRun) })
      plain.dimension(vein.dimension).EUt(drilling.eut).duration(drilling.duration)
      dry++

      var wet = event.recipes.gtceu.vein_drilling('grindless:ev/' + vein.id + '_titanium' + T.cooledSuffix)
        .chancedInput(bit.item, bit.wear, 0)
        .notConsumable(vein.sample)
        .inputFluids(Fluid.of(T.coolant, T.coolantPerRun))
      if (stone !== null) wet.itemOutputs('1x ' + stone)
      vein.ores.forEach(function (o) { addOre(wet, o.item, o.share * bit.perRun) })
      wet.dimension(vein.dimension).EUt(drilling.eut).duration(drilling.duration)
      cooled++
    })
    problems.forEach(function (p) { console.error('[grindless/ev] EV Tripod Drill vein skipped: ' + p) })

    // ---- the bit, the controller and the wing panel
    event.recipes.gtceu.lathe('grindless:titanium_drill_bit')
      .itemInputs(LONG_ROD)
      .itemOutputs(bit.item)
      .EUt(1920)
      .duration(200)

    event.recipes.gtceu.assembler('grindless:ev_vein_drill')
      .itemInputs('gtceu:lunar_drill', 'gtceu:ev_machine_hull', '2x gtceu:ev_electric_motor', 'gtceu:ev_electric_pump', '4x #gtceu:circuits/ev', '2x #forge:plates/titanium', '2x ' + bit.item)
      .inputFluids(Fluid.of('gtceu:lubricant', 1000))
      .itemOutputs(T.machine)
      .EUt(120).duration(400)

    event.recipes.gtceu.assembler('grindless:solar_wing_panel')
      .itemInputs('gtceu:titanium_frame', '2x gtceu:silicon_wafer', 'gtceu:tempered_glass')
      .itemOutputs(T.panel)
      .EUt(480)
      .duration(100)

    T.drilling = {
      veins: found.veins.map(function (v) { return v.id + '@' + v.dimension }),
      tables: found.tables,
      dry: dry,
      cooled: cooled,
      count: dry + cooled,
      skipped: found.skipped,
      problems: problems
    }
    console.info('[grindless/ev] EV Tripod Drill: ' + dry + ' dry and ' + cooled + ' cooled vein_drilling recipes from ' + found.tables.join(', ') +
      ' (veins ' + T.drilling.veins.join(', ') + '; not drilled: ' + (found.skipped.join(', ') || 'none') + '), the EV lathe bit, the controller and the wing panel')
  })
})()
