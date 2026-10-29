// priority: -26424
// -----------------------------------------------------------------------------------------------
// ZPM-A7: the Mk2 audit, our D + He-3 recipe, and the recipes of machines 7 (plasma quench caster) and 8 (direct energy converter)
// (docs/eras/zpm.md, "Fusion, and what is not fusion", "Machines 7-8"; machines and types: startup_scripts/grindless/zpm/fusion.js).
//
//   audit      every gtceu:fusion_reactor recipe the Mk2 (gtceu:zpm_fusion_reactor) can run (EU/t at most ZPM, start at most 320 M) has
//              one row in data/grindless/tables/fusion_mk2.json. ZPM cuts nothing: the three LuV cuts must already be gone; a recipe
//              that the Mk2 could run and that is neither listed nor ours is logged as an error (it needs a fate).
//   ours       grindless:fusion_reactor/d_he3_to_helium_plasma: 125 mB deuterium + 125 mB helium-3 -> 125 mB helium plasma, 16,384 EU/t
//              x 16 t, 200 M start: above the Mk1's 160 M, so only the Mk2 runs it (S0-6).
//   caster     gtceu:plasma_quench, circuit 1 plate / circuit 2 foil: 144 mB of the Mk2's molten metal + the 1,000 mB argon shroud ->
//              the plate (4 foils) + 950 mB argon back (5 % make-up) + 2,000 mB steam (the heat of the run, never free energy).
//   converter  gtceu:direct_conversion, a generator type: 1 mB of helium plasma / tin plasma -> the cooled gas / molten tin + EU, at
//              1.25 x the plasma turbine's EU per mB AFTER its doubling (power/generators.js lists the plasma generator, not this type:
//              the figures here are final and never doubled twice).
//   crafting   the two controllers (zpm.md, "Controller").
//
// Published for the tests: global.grindless.zpmFusion = { table, audited, unaudited, missing, luvCutsLive, errors, ours, quench,
// converter, craftingRecipes }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/zpm/fusion] '
  var G = global.grindless || (global.grindless = {})
  var F = G.zpmFusion || (G.zpmFusion = {})
  var TABLE = 'kubejs/data/grindless/tables/fusion_mk2.json'
  var TYPE = 'gtceu:fusion_reactor'

  var table = G.readJsonTable(TABLE)
  F.table = table

  var CASTER = table.quench.machine
  var CONVERTER = table.converter.machine
  var HULL = 'gtceu:zpm_machine_hull'
  var PUMP = 'gtceu:zpm_electric_pump'
  var FIELD = 'gtceu:zpm_field_generator'
  F.craftingRecipes = { caster: 'grindless:assembly_line/plasma_quench_caster', converter: 'grindless:assembly_line/direct_energy_converter' }
  F.craftingDomain = {
    caster: ['grindless:hermean_heat_shield_brick', 'grindless:zircaloy_cladding_tube'],
    converter: ['grindless:hermean_thin_film_panel', 'grindless:solar_wing_panel']
  }
  F.craftingResearch = { caster: 'grindless:heliostat_mirror', converter: 'grindless:orbital_solar_panel' }

  function fluidOf(id, amount) {
    return Fluid.of(id, amount)
  }

  function missingFluids(ids) {
    return ids.filter(function (id) { return !Fluid.exists(id) })
  }

  function missingItems(ids) {
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  // ---------------------------------------------------------------- the audit and our recipe

  function audit(event) {
    var report = { audited: [], unaudited: [], missing: [], luvCutsLive: [], errors: [] }
    var listed = {}
    table.recipes.forEach(function (r) { listed[r.id] = r })
    var ours = {}
    table.ours.forEach(function (r) { ours[r.id] = r })
    var live = {}
    event.forEachRecipe({ type: TYPE }, function (r) {
      var id = String(r.getId())
      var json
      try { json = JSON.parse(String(r.json)) } catch (e) { report.errors.push(id + ' unreadable: ' + e); return }
      live[id] = true
      if (listed[id]) {
        report.audited.push(id)
        if (listed[id].fate === 'luv_cut') report.luvCutsLive.push(id)
        return
      }
      if (ours[id]) return
      var eut = json.tickInputs && json.tickInputs.eu ? Number(json.tickInputs.eu[0].content) : 0
      var start = json.data ? Number(json.data.eu_to_start) : 0
      if (eut <= table.mk2.maxEUt && start <= table.mk2.maxStart) report.unaudited.push(id + ' (' + eut + ' EU/t, ' + start + ' EU start)')
    })
    table.recipes.forEach(function (r) { if (r.fate === 'keep' && !live[r.id]) report.missing.push(r.id) })
    return report
  }

  function addDHe3(event) {
    var out = []
    table.ours.forEach(function (r) {
      var fluids = r.inputs.map(function (i) { return i.tag ? '#' + i.tag + ' ' + i.amount : i.fluid + ' ' + i.amount })
      var absent = missingFluids(r.inputs.filter(function (i) { return i.fluid }).map(function (i) { return i.fluid }).concat([r.output.id]))
      if (absent.length > 0) {
        console.error(LOG + r.id + ' skipped, unknown fluid(s): ' + absent.join(', '))
        return
      }
      var b = event.recipes.gtceu.fusion_reactor(r.builderId)
      fluids.forEach(function (f) { b.inputFluids(f) })
      b.outputFluids(fluidOf(r.output.id, r.output.amount)).EUt(r.eut).duration(r.duration).fusionStartEU(r.start)
      out.push(r.id)
    })
    return out
  }

  // ---------------------------------------------------------------- the caster

  function addCaster(event) {
    var q = table.quench
    var made = []
    var absent = missingFluids([q.argon.id, q.steam.id])
    if (absent.length > 0) {
      console.error(LOG + 'plasma quench caster recipes skipped, unknown fluid(s): ' + absent.join(', '))
      return made
    }
    q.metals.forEach(function (m) {
      var parts = [{ kind: 'plate', circuit: 1, item: m.plate, count: 1 }]
      if (m.foil) parts.push({ kind: 'foil', circuit: 2, item: m.foil, count: 4 })
      parts.forEach(function (p) {
        var name = m.name + '_' + p.kind
        var bad = missingFluids([m.fluid]).concat(missingItems([p.item]))
        if (bad.length > 0) {
          console.error(LOG + 'plasma_quench ' + name + ' skipped, unknown id(s): ' + bad.join(', '))
          return
        }
        event.recipes.gtceu.plasma_quench('grindless:' + name)
          .circuit(p.circuit)
          .inputFluids(fluidOf(m.fluid, 144), fluidOf(q.argon.id, q.argon.amount))
          .itemOutputs(p.count + 'x ' + p.item)
          .outputFluids(fluidOf(q.argon.id, q.argon.returned), fluidOf(q.steam.id, q.steam.amount))
          .EUt(q.eut)
          .duration(q.duration)
        made.push('grindless:plasma_quench/' + name)
      })
    })
    return made
  }

  // ---------------------------------------------------------------- the converter

  function addConverter(event) {
    var c = table.converter
    var made = []
    c.recipes.forEach(function (r) {
      var bad = missingFluids([r.input, r.output])
      if (bad.length > 0) {
        console.error(LOG + 'direct_conversion ' + r.name + ' skipped, unknown fluid(s): ' + bad.join(', '))
        return
      }
      event.recipes.gtceu.direct_conversion('grindless:' + r.name)
        .inputFluids(fluidOf(r.input, 1))
        .outputFluids(fluidOf(r.output, 1))
        .EUt(-c.eut)
        .duration(r.duration)
      made.push('grindless:direct_conversion/' + r.name)
    })
    return made
  }

  // ---------------------------------------------------------------- UEV-A7: the converter's Mk4 rows, written final
  // 128 parallels x the row's EU/t (data/grindless/tables/fusion_mk4.json): 16,777,216, 12,582,912 and 25,165,824 EU/t. Not in
  // power/generators.js's list (the plasma generator is), so never doubled.
  function addMk4Converter(event) {
    var mk4 = G.readJsonTable('kubejs/data/grindless/tables/fusion_mk4.json').converter
    var made = []
    mk4.recipes.forEach(function (r) {
      var bad = missingFluids([r.input, r.output])
      if (bad.length > 0) {
        console.error(LOG + 'direct_conversion ' + r.name + ' skipped, unknown fluid(s): ' + bad.join(', '))
        return
      }
      event.recipes.gtceu.direct_conversion('grindless:' + r.name)
        .inputFluids(fluidOf(r.input, 1))
        .outputFluids(fluidOf(r.output, 1))
        .EUt(-r.eut)
        .duration(r.duration)
      made.push('grindless:direct_conversion/' + r.name)
    })
    return made
  }

  // ---------------------------------------------------------------- UIV-A9: the Mk5 converter rows and the first-wall quench
  // Converter rows: data/grindless/tables/fusion_mk5.json, final like the Mk4's. Quench: the Wf/RHEA billet sprayed in argon into
  // the plasma-sprayed tile of line 7 (no circuit: the caster holds one item input).
  function addMk5Converter(event) {
    var mk5 = G.readJsonTable('kubejs/data/grindless/tables/fusion_mk5.json').converter
    var made = []
    mk5.recipes.forEach(function (r) {
      var bad = missingFluids([r.input, r.output])
      if (bad.length > 0) {
        console.error(LOG + 'direct_conversion ' + r.name + ' skipped, unknown fluid(s): ' + bad.join(', '))
        return
      }
      event.recipes.gtceu.direct_conversion('grindless:' + r.name)
        .inputFluids(fluidOf(r.input, 1))
        .outputFluids(fluidOf(r.output, 1))
        .EUt(-r.eut)
        .duration(r.duration)
      made.push('grindless:direct_conversion/' + r.name)
    })
    return made
  }

  function addMk5Quench(event) {
    var q = table.quench
    var bad = missingFluids([q.argon.id, q.steam.id]).concat(missingItems(['grindless:wf_rhea_billet', 'grindless:plasma_sprayed_tile']))
    if (bad.length > 0) {
      console.error(LOG + 'plasma_quench plasma_sprayed_tile skipped, unknown id(s): ' + bad.join(', '))
      return []
    }
    event.recipes.gtceu.plasma_quench('grindless:plasma_sprayed_tile')
      .itemInputs('1x grindless:wf_rhea_billet')
      .inputFluids(fluidOf(q.argon.id, q.argon.amount))
      .itemOutputs('1x grindless:plasma_sprayed_tile')
      .outputFluids(fluidOf(q.argon.id, q.argon.returned), fluidOf(q.steam.id, q.steam.amount))
      .EUt(q.eut)
      .duration(q.duration)
    return ['grindless:plasma_quench/plasma_sprayed_tile']
  }

  // ---------------------------------------------------------------- the controllers

  // ASSEMBLY LINE with scanner research. Caster: hull + 2 pumps + 4 circuits + a hermean heat-shield brick (the quench chamber's lining)
  // + zircaloy cladding tube (the plasma-facing sleeve); research: the IV heliostat mirror. Converter: hull + 2 field generators +
  // 4 circuits + a hermean thin-film panel (the collector) + a solar wing panel (the radiator); research: the LuV orbital solar panel.
  function addControllers(event) {
    var parts = [HULL, PUMP, FIELD, CASTER, CONVERTER].concat(F.craftingDomain.caster, F.craftingDomain.converter,
      [F.craftingResearch.caster, F.craftingResearch.converter])
    var missing = missingItems(parts)
    if (missing.length > 0) {
      console.error(LOG + 'controller recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    function line(id, output, part, domain, research) {
      var b = event.recipes.gtceu.assembly_line(id.replace('assembly_line/', ''))
      b.itemInputs(HULL, '2x ' + part, '4x #gtceu:circuits/zpm', '2x ' + domain[0], '2x ' + domain[1])
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000))
      b.itemOutputs(output)
      b.scannerResearch(Item.of(research))
      b.EUt(122880).duration(1200)
    }
    line(F.craftingRecipes.caster, CASTER, PUMP, F.craftingDomain.caster, F.craftingResearch.caster)
    line(F.craftingRecipes.converter, CONVERTER, FIELD, F.craftingDomain.converter, F.craftingResearch.converter)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var report = { audited: [], unaudited: [], missing: [], luvCutsLive: [], errors: [] }
    try {
      report = audit(event)
    } catch (e) {
      report.errors.push('audit failed: ' + e)
    }
    try { F.ours = addDHe3(event) } catch (e1) { F.ours = []; report.errors.push('D + He-3: ' + e1) }
    try { F.quench = addCaster(event) } catch (e2) { F.quench = []; report.errors.push('caster: ' + e2) }
    try { F.converter = addConverter(event) } catch (e3) { F.converter = []; report.errors.push('converter: ' + e3) }
    try { addControllers(event) } catch (e4) { report.errors.push('controllers: ' + e4) }
    try { F.mk4Converter = addMk4Converter(event) } catch (e5) { F.mk4Converter = []; report.errors.push('Mk4 converter: ' + e5) }
    try { F.mk5Converter = addMk5Converter(event) } catch (e6) { F.mk5Converter = []; report.errors.push('Mk5 converter: ' + e6) }
    try { F.mk5Quench = addMk5Quench(event) } catch (e7) { F.mk5Quench = []; report.errors.push('Mk5 quench: ' + e7) }
    F.audited = report.audited
    F.unaudited = report.unaudited
    F.missing = report.missing
    F.luvCutsLive = report.luvCutsLive
    F.errors = report.errors
    report.unaudited.forEach(function (s) { console.error(LOG + 'unaudited Mk2 recipe ' + s + ': give it a fate in ' + TABLE) })
    report.luvCutsLive.forEach(function (s) { console.error(LOG + s + ' was cut by LuV and is live again') })
    report.missing.forEach(function (s) { console.warn(LOG + s + ' is in the audit but not in the recipe manager') })
    report.errors.forEach(function (s) { console.error(LOG + s) })
    console.info(LOG + 'audited ' + report.audited.length + ', ours ' + F.ours.length + ', caster ' + F.quench.length + ', converter ' + F.converter.length)
  })
})()
