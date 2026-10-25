// -----------------------------------------------------------------------------------------------
// Recipes of IV on Mercury (machines and types: startup_scripts/grindless/iv/mercury.js; package IV-B2):
//
//   gtceu:vein_drilling (Mercury Vein Drill), under vein_drilling/iv/mercury_*: one dry and one cooled recipe per vein of
//     global.grindless.ivFoundation.mercuryVeins() (today the iridosmine vein), each with .dimension('gcyr:mercury'), 8 EU/t and 200 ticks
//     a run like every drilling recipe, the vein's stone and 5.625 raw ores a run, split like every vein table (LV.veinTools.oresOf):
//       <vein>_tungsten_steel        sample (never used up) + tungsten steel bit, 0.5 % wear: the night shift, dry
//       <vein>_tungsten_steel_cryo   bit, 0.25 % wear + sample + 10 mB liquid nitrogen: the day shift
//     The shift is the drill's run-start rule (startup), not a recipe condition; the recipe data key grindless_mercury_shift (night/day)
//     gives each recipe its EMI line. Lookup note (GTM's RecipeDB): the dry recipes list the sample first, the cooled ones the bit
//     first, like the tripod's; no other drilling recipe starts with a Mercury sample, and the cooled one differs from any other
//     tungsten-steel-bit recipe at its second ingredient.
//   gtceu:solar_processing (Mercury Solar Works), every recipe .dimension('gcyr:mercury'), each with its own first ingredient:
//     hermean_heat_shield_brick   16 Hermean regolith dust -> 4 heat-shield bricks, 7,680 EU/t for 25 ticks: the electric furnace's
//                                 48,000 EU a brick, as EV's sintered regolith
//     hermean_thin_film_panel     1 gallium arsenide dust + 1 silicon wafer + 1 tempered glass + 1 tungsten steel frame -> 1 panel,
//                                 7,680 EU/t for 200 ticks (vacuum evaporation in the bell)
//     iridosmine_fusion           10 iridosmine dust + 10 saltpeter dust + 1,000 mB salt water -> 6 rarest metal mixture + 700 mB
//                                 osmium tetroxide + 1,000 mB steam, 120 EU/t for 200 ticks (GT--'s rarest_metal_residue figures, 775 K;
//                                 the osmium tetroxide takes the sodium rutheniate's place). Through GT--'s own chain at home the 6
//                                 mixture give 3 iridium (rarest_metal_residue_ebf, iridium_metal_residue_process, iridium chloride) and
//                                 0.3 osmium (the acidic osmium solution's tetroxide), and the 700 mB 0.7 osmium: 3 Ir : 1 Os. The
//                                 platinum plant's mode 3 (IV-B3) composes from this live recipe; published as global.grindless.mercury.fusion.
//                                 The steam is inert; the works refuses fluid voiding, so the tetroxide is never thrown away.
//     Each carries the data key grindless_sun_eut: the EU/t a run pays with the sun on the receiver (the works' sun rule, a quarter).
//   gtceu:mercury_solar (Mercury Solar Field)  grindless:mercury_solar/mercury: the programmed circuit 1 (never used), gcyr:mercury, GTM's
//     day condition, 2,010 EU/t out a run (a panel), 20 ticks. Not in power/generators.js's list: no fuel to double, and its
//     conditions would make that script skip it anyway.
//   gtceu:interferometry (Interferometer), gcyr:mercury, at night, 7,680 EU/t for 600 ticks (30 s like every observation):
//     outer_system_chart          the Inner Planets Chart, NOT consumed (it calibrates the baseline) + 1 Lunar VLBI Recording -> 1 Outer
//                                 System Chart
//     sagittarius_a_star_signal   the Outer System Chart, NOT consumed + 1 Lunar VLBI Recording -> 1 Sagittarius A* Signal
//   gtceu:deep_space_tracking (the EV Deep Space Antenna, on the Moon) lunar_vlbi_recording: the Inner Planets Chart, NOT consumed +
//     1 data orb -> 1 Lunar VLBI Recording, gcyr:luna, at night, 1,920 EU/t for 600 ticks: the Moon's half of the baseline.
//   gtceu:lathe tungsten_steel_drill_bit: a long tungsten steel rod -> the IV bit, 7,680 EU/t for 10 s (the IV lathe).
//   crafting: the four controllers (GTM shaped) and the chart copy (chart + data orb -> 2 charts, the observatory family's rule).
// Published for the test: global.grindless.mercury.recipes, .drilling and .fusion.
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var M = G.mercury || (G.mercury = {})

  var MERCURY = 'gcyr:mercury'
  var LUNA = 'gcyr:luna'
  var BRICK = 'grindless:hermean_heat_shield_brick'
  var PANEL = 'grindless:hermean_thin_film_panel'
  var REGOLITH = 'gtceu:hermean_regolith_dust'
  var IRIDOSMINE = 'gtceu:iridosmine_dust'
  var MIXTURE = 'gtceu:rarest_metal_mixture_dust'
  var INNER_CHART = 'grindless:inner_planets_chart'
  var DATA_ORB = 'gtceu:data_orb'
  var TS_FRAME = 'gtceu:tungsten_steel_frame'

  var NEEDED = [BRICK, PANEL, REGOLITH, IRIDOSMINE, MIXTURE, INNER_CHART, DATA_ORB, TS_FRAME, 'gtceu:gallium_arsenide_dust',
    'gtceu:silicon_wafer', 'gtceu:tempered_glass', 'gtceu:saltpeter_dust', 'gtceu:ev_vein_drill', 'gtceu:heliostat_tower',
    'gtceu:lunar_solar_array', 'gtceu:deep_space_antenna', 'gtceu:iv_machine_hull', 'gtceu:iv_electric_motor', 'gtceu:iv_electric_pump',
    'gtceu:iv_electric_furnace', 'gtceu:iv_assembler', 'gtceu:iv_emitter', 'gtceu:iv_sensor', 'gtceu:platinum_single_cable',
    'gtceu:mercury_vein_drill', 'gtceu:mercury_solar_works', 'gtceu:mercury_solar_field', 'gtceu:interferometer']

  M.recipes = {
    drilling: [],
    bricks: 'grindless:solar_processing/hermean_heat_shield_brick',
    panels: 'grindless:solar_processing/hermean_thin_film_panel',
    fusion: 'grindless:solar_processing/iridosmine_fusion',
    field: 'grindless:mercury_solar/mercury',
    outerChart: 'grindless:interferometry/outer_system_chart',
    sgrSignal: 'grindless:interferometry/sagittarius_a_star_signal',
    recording: 'grindless:deep_space_tracking/lunar_vlbi_recording',
    bit: 'grindless:lathe/tungsten_steel_drill_bit',
    copy: 'grindless:crafting/outer_system_chart_copy',
    controllers: ['grindless:crafting/mercury_vein_drill', 'grindless:crafting/mercury_solar_works', 'grindless:crafting/mercury_solar_field',
      'grindless:crafting/interferometer']
  }

  // the input step of iridium and osmium (iv.md: platinum plant mode 3, moved to the site); B3 composes mode 3 from the live recipe
  M.fusion = {
    recipe: M.recipes.fusion,
    inputs: { items: [{ id: IRIDOSMINE, count: 10 }, { tag: 'forge:dusts/saltpeter', count: 10 }], fluids: [{ id: 'gtceu:salt_water', amount: 1000 }] },
    outputs: { items: [{ id: MIXTURE, count: 6 }], fluids: [{ id: 'gtceu:osmium_tetroxide', amount: 700 }, { id: 'gtceu:steam', amount: 1000 }] },
    eut: 120,
    duration: 200,
    // through GT--'s chain at home: what 10 iridosmine dust become
    yields: { iridium: 3, osmium: 1 }
  }

  // the works' run price with the sun on the receiver (a quarter of the EU/t)
  function sunEUt(eut) {
    var S = M.works
    return Math.max(1, Math.round(eut * (S ? S.sunFactor : 0.25)))
  }

  // expected amount per run -> whole items + one chanced item for the fraction (the family's maths)
  function addOre(recipe, item, expected) {
    var whole = Math.floor(expected + 1e-9)
    var chance = Math.round((expected - whole) * 10000)
    if (whole > 0) recipe.itemOutputs(whole + 'x ' + item)
    if (chance >= 1) recipe.chancedOutput('1x ' + item, Math.min(chance, 9999), 0)
  }

  ServerEvents.recipes(function (event) {
    var D = M.drill
    var BIT = G.ivDrillBit
    var IVF = G.ivFoundation
    if (!D || !M.works || !M.field || !M.interferometer || !BIT) {
      console.error(LOG + 'Mercury recipes skipped: global.grindless.mercury or global.grindless.ivDrillBit (startup) is missing')
      return
    }
    var missing = NEEDED.concat([BIT.item, BIT.rod, M.items.recording, M.items.outerChart, M.items.sgrSignal]).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'Mercury recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }

    // ---- drilling: the night (dry) and day (liquid nitrogen) recipes of every Mercury vein
    try {
      if (!IVF || typeof IVF.mercuryVeins !== 'function' || !G.lv || !G.lv.veinTools) throw new Error('ivFoundation.mercuryVeins() or lv/vein_drilling.js is missing')
      var problems = []
      D.drilling = { veins: [], dry: 0, cooled: 0, problems: problems }
      IVF.mercuryVeins().forEach(function (vein) {
        if (vein.kind !== undefined && vein.kind !== 'ore') return
        var bad = []
        if (!Item.exists(vein.sample)) bad.push('sample ' + vein.sample + ' is not registered')
        var stone = vein.stone ? String(vein.stone) : null
        if (stone !== null && !Item.exists(stone)) bad.push('stone ' + stone + ' does not exist')
        var total = vein.ores.reduce(function (s, o) { return s + o.share }, 0)
        if (Math.abs(total - 1) > 1e-9) bad.push('shares add up to ' + total)
        vein.ores.forEach(function (o) { if (!Item.exists(o.item)) bad.push('raw ore ' + o.item + ' does not exist') })
        if (String(vein.dimension) !== MERCURY) bad.push('dimension ' + vein.dimension)
        if (bad.length > 0) {
          problems.push(vein.id + ': ' + bad.join(', '))
          return
        }
        var name = 'grindless:iv/mercury_' + vein.id + '_tungsten_steel'

        var dry = event.recipes.gtceu.vein_drilling(name)
          .notConsumable(vein.sample)
          .chancedInput(BIT.item, D.bit.nightWear, 0)
        if (stone !== null) dry.itemOutputs('1x ' + stone)
        vein.ores.forEach(function (o) { addOre(dry, o.item, o.share * D.bit.perRun) })
        dry.addDataString(D.shiftKey, 'night').dimension(MERCURY).EUt(D.eut).duration(D.duration)
        D.drilling.dry++

        var wet = event.recipes.gtceu.vein_drilling(name + D.cooledSuffix)
          .chancedInput(BIT.item, D.bit.dayWear, 0)
          .notConsumable(vein.sample)
          .inputFluids(Fluid.of(D.coolant, D.coolantPerRun))
        if (stone !== null) wet.itemOutputs('1x ' + stone)
        vein.ores.forEach(function (o) { addOre(wet, o.item, o.share * D.bit.perRun) })
        wet.addDataString(D.shiftKey, 'day').dimension(MERCURY).EUt(D.eut).duration(D.duration)
        D.drilling.cooled++

        D.drilling.veins.push(vein.id)
        M.recipes.drilling.push('grindless:vein_drilling/iv/mercury_' + vein.id + '_tungsten_steel')
        M.recipes.drilling.push('grindless:vein_drilling/iv/mercury_' + vein.id + '_tungsten_steel' + D.cooledSuffix)
      })
      problems.forEach(function (p) { console.error(LOG + 'Mercury vein drill vein skipped: ' + p) })
    } catch (e) {
      console.error(LOG + 'Mercury drilling recipes failed: ' + e)
    }

    // ---- the solar works: sintering, thin-film panels, the iridosmine fusion
    try {
      var W = M.works
      event.recipes.gtceu.solar_processing('grindless:hermean_heat_shield_brick')
        .itemInputs('16x ' + REGOLITH)
        .itemOutputs('4x ' + BRICK)
        .addData(W.sunKey, sunEUt(7680))
        .dimension(MERCURY)
        .EUt(7680).duration(25)

      event.recipes.gtceu.solar_processing('grindless:hermean_thin_film_panel')
        .itemInputs('1x #forge:dusts/gallium_arsenide', '1x gtceu:silicon_wafer', '1x gtceu:tempered_glass', '1x ' + TS_FRAME)
        .itemOutputs('1x ' + PANEL)
        .addData(W.sunKey, sunEUt(7680))
        .dimension(MERCURY)
        .EUt(7680).duration(200)

      var F = M.fusion
      event.recipes.gtceu.solar_processing('grindless:iridosmine_fusion')
        .itemInputs(F.inputs.items[0].count + 'x ' + F.inputs.items[0].id, F.inputs.items[1].count + 'x #' + F.inputs.items[1].tag)
        .inputFluids(Fluid.of(F.inputs.fluids[0].id, F.inputs.fluids[0].amount))
        .itemOutputs(F.outputs.items[0].count + 'x ' + F.outputs.items[0].id)
        .outputFluids(Fluid.of(F.outputs.fluids[0].id, F.outputs.fluids[0].amount), Fluid.of(F.outputs.fluids[1].id, F.outputs.fluids[1].amount))
        .addData(W.sunKey, sunEUt(F.eut))
        .dimension(MERCURY)
        .EUt(F.eut).duration(F.duration)
    } catch (e) {
      console.error(LOG + 'Mercury solar works recipes failed: ' + e)
    }

    // ---- the solar field: one recipe, the circuit as the only (never used) input; EU out per lit panel, by day
    try {
      var A = M.field
      event.recipes.gtceu.mercury_solar('grindless:mercury')
        .circuit(A.circuit)
        .addDataString(A.skyKey, 'hermean_day')
        .addData(A.panelEuKey, A.euPerPanel)
        .dimension(MERCURY)
        .daytime(false)
        .EUt(-A.euPerPanel)
        .duration(A.duration)
    } catch (e) {
      console.error(LOG + 'Mercury solar field recipe failed: ' + e)
    }

    // ---- the interferometer (Mercury, at night) and the Moon's half of the baseline (the deep space antenna, at night)
    try {
      var I = M.interferometer
      event.recipes.gtceu.interferometry('grindless:outer_system_chart')
        .notConsumable(INNER_CHART)
        .itemInputs('1x ' + M.items.recording)
        .itemOutputs('1x ' + M.items.outerChart)
        .addDataString(I.skyKey, 'interferometer')
        .dimension(MERCURY)
        .daytime(true)
        .EUt(I.eut).duration(I.duration)

      event.recipes.gtceu.interferometry('grindless:sagittarius_a_star_signal')
        .notConsumable(M.items.outerChart)
        .itemInputs('1x ' + M.items.recording)
        .itemOutputs('1x ' + M.items.sgrSignal)
        .addDataString(I.skyKey, 'interferometer')
        .dimension(MERCURY)
        .daytime(true)
        .EUt(I.eut).duration(I.duration)

      event.recipes.gtceu.deep_space_tracking('grindless:lunar_vlbi_recording')
        .notConsumable(INNER_CHART)
        .itemInputs('1x ' + DATA_ORB)
        .itemOutputs('1x ' + M.items.recording)
        .addDataString(I.skyKey, 'vlbi_moon')
        .dimension(LUNA)
        .daytime(true)
        .EUt(1920).duration(600)

      event.shapeless('2x ' + M.items.outerChart, [M.items.outerChart, DATA_ORB]).id(M.recipes.copy)
    } catch (e) {
      console.error(LOG + 'interferometer recipes failed: ' + e)
    }

    // ---- the bit and the controllers (GTM shaped: lowercase letters are tool symbols, so the ingredient keys are uppercase)
    try {
      event.recipes.gtceu.lathe('grindless:tungsten_steel_drill_bit')
        .itemInputs(BIT.rod)
        .itemOutputs(BIT.item)
        .EUt(BIT.eut)
        .duration(BIT.duration)

      event.recipes.gtceu.shaped(D.machine, ['ALA', 'MHM', 'CPC'], {
        A: '#forge:plates/tungsten_steel',
        L: 'gtceu:ev_vein_drill',
        M: 'gtceu:iv_electric_motor',
        H: 'gtceu:iv_machine_hull',
        C: '#gtceu:circuits/iv',
        P: 'gtceu:iv_electric_pump'
      }).id(M.recipes.controllers[0])

      event.recipes.gtceu.shaped(M.works.machine, ['CTC', 'FHA', 'C C'], {
        C: '#gtceu:circuits/iv',
        T: 'gtceu:heliostat_tower',
        F: 'gtceu:iv_electric_furnace',
        H: 'gtceu:iv_machine_hull',
        A: 'gtceu:iv_assembler'
      }).id(M.recipes.controllers[1])

      event.recipes.gtceu.shaped(M.field.machine, ['PHP', 'CAC', 'FWF'], {
        P: PANEL,
        H: 'gtceu:iv_machine_hull',
        C: '#gtceu:circuits/iv',
        A: 'gtceu:lunar_solar_array',
        F: TS_FRAME,
        W: 'gtceu:platinum_single_cable'
      }).id(M.recipes.controllers[2])

      event.recipes.gtceu.shaped(M.interferometer.machine, ['FEF', 'SHS', 'CDC'], {
        F: TS_FRAME,
        E: 'gtceu:iv_emitter',
        S: 'gtceu:iv_sensor',
        H: 'gtceu:iv_machine_hull',
        C: '#gtceu:circuits/iv',
        D: 'gtceu:deep_space_antenna'
      }).id(M.recipes.controllers[3])
    } catch (e) {
      console.error(LOG + 'Mercury controller or bit recipes failed: ' + e)
    }

    console.info(LOG + 'Mercury: ' + (D.drilling ? D.drilling.dry + ' dry and ' + D.drilling.cooled + ' cooled drilling recipes (' + D.drilling.veins.join(', ') + ')' : 'no drilling recipes') +
      ', 3 solar works recipes, the solar field, 2 interferometer observations, the lunar VLBI recording, the chart copy, the IV lathe bit and 4 controllers')
  })
})()
