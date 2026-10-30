// priority: -23088
// -----------------------------------------------------------------------------------------------
// Recipes of UEV's fusion (docs/eras/uev.md, machines 14-15, lines 23, 24, 25; package UEV-A7). Machines and ids: startup_scripts/grindless/
// uev/fusion.js. The rows are in data/grindless/tables/fusion_mk4.json, read at every server load; one recipe per row, id grindless:<name>.
//
//   gtceu:fusion_reactor        the Mk4 ring (tier 10): c1 D-He-3, c2 p-11B, c3 polarised D-He-3, each from one premixed fuel fluid.
//   gtceu:spin_polarisation     the helium-3 polariser: circuit 1 polarise 6N helium-3 (the depolarised part comes back), 2 polarised fuel.
//   gtceu:mixer                 circuit 24 D-He-3 mix, 25 p-11B fuel (the fuels are mixed upstream of the ring).
//   gtceu:chemical_reactor      circuits 24-27: borax -> boric acid -> boron trioxide -> boron trifluoride; boron-11 trifluoride -> boron-11.
//   gtceu:assembler             grindless:uev_fusion_casing (table 'casing').
//   crafting                    the two controllers.
// The other rows of the lines are in the older files the package may extend: zpm/fusion.js (the converter's Mk4 rows), zpm/saturn_siphon.js
// (boron-11 trifluoride), ev/cryogenic_plant.js (6N helium-3, helium-4 ash), uv/photonics.js (the 1,083 nm laser).
// Published: global.grindless.uevFusion.recipes [{ name, type, recipeId, circuit, eut, duration, ... }], .skipped, .controllerRecipes,
// .casingRecipe.
// Rhino: var + function inside every callback that runs more than once.
// -----------------------------------------------------------------------------------------------
(function () {
  var LOG = '[grindless/uev/fusion] '
  var G = global.grindless || (global.grindless = {})
  var UF = G.uevFusion || (G.uevFusion = {})
  var TABLE = 'kubejs/data/grindless/tables/fusion_mk4.json'

  var table = G.readJsonTable(TABLE)
  UF.mk4 = table
  UF.recipes = []
  UF.skipped = []
  UF.controllerRecipes = []

  Object.keys(table.types).forEach(function (type) {
    table.types[type].recipes.forEach(function (r) {
      UF.recipes.push({
        name: r.name, type: type, recipeId: 'grindless:' + type + '/' + r.name, circuit: r.circuit, eut: r.eut, duration: r.duration,
        start: r.start || null, itemsIn: r.itemsIn, notConsumed: r.notConsumed, fluidsIn: r.fluidsIn, fluidsOut: r.fluidsOut, itemsOut: r.itemsOut
      })
    })
  })

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.concat(r.itemsOut)
    items.forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.notConsumed.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRows(event) {
    UF.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        UF.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + r.type + ' ' + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
      r.itemsIn.forEach(function (x) { b.itemInputs(x.count + 'x ' + x.id) })
      r.notConsumed.forEach(function (id) { b.notConsumable(id) })
      if (r.circuit !== null) b.circuit(r.circuit)
      r.fluidsIn.forEach(function (x) { b.inputFluids(Fluid.of(x.id, x.amount)) })
      r.itemsOut.forEach(function (x) { b.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (x) { b.outputFluids(Fluid.of(x.id, x.amount)) })
      b.EUt(r.eut).duration(r.duration)
      if (r.start !== null) b.fusionStartEU(r.start)
    })
    console.info(LOG + 'fusion recipes added: ' + (UF.recipes.length - UF.skipped.length))
  }

  // docs/eras/uev.md "Voltages and controllers": the polariser (14) is an early machine (UHV hull, two UV parts, two UHV circuits);
  // the ring (15) comes after the UEV hull (UEV hull, two UEV parts of UEV-A6, two optical computers from the photonic hall)
  function addControllers(event) {
    // QR-R6: both are assembly lines with station research, an era fluid and domain inputs of the Wf/W and SiC/SiC first-wall line
    var C = '4x #gtceu:circuits/uhv'
    var defs = [
      { machine: table.polariser.machine, name: 'helium3_polariser', research: 'grindless:laser_1083nm', era: 'gtceu:neutronium',
        ins: ['gtceu:uhv_machine_hull', '2x gtceu:uv_emitter', C, 'grindless:laser_1083nm', '2x grindless:wf_w_tile', 'grindless:sic_sic_plate'] },
      { machine: table.ring.machine, name: 'uev_fusion_reactor', research: table.polariser.machine, era: 'gtceu:tritanium',
        ins: ['gtceu:uev_machine_hull', 'gtceu:uev_emitter', 'gtceu:uev_sensor', '2x gtnn:optical_computer', C, 'grindless:uev_fusion_casing', 'grindless:hftacn_coil_block', 'grindless:wf_w_tile'] }
    ]
    defs.forEach(function (d) {
      var ids = d.ins.map(function (s) { return s.replace(/^[0-9]+x /, '') }).filter(function (id) { return id.charAt(0) !== '#' }).concat([d.machine, d.research])
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(d.ins)
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 1000), Fluid.of(d.era, 576))
      b.itemOutputs(d.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(491520) })
      b.EUt(491520).duration(2400)
      UF.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // the Mk4 casing: GTM's Mk3 casing faced with the Wf/W divertor tile and a SiC/SiC blanket plate (UEV-A5's CVI furnace)
  function addCasing(event) {
    var c = table.casing
    var missing = c.itemsIn.map(function (x) { return x.id }).concat([c.output]).filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'casing recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.assembler('grindless:' + c.name)
    c.itemsIn.forEach(function (x) { b.itemInputs(x.count + 'x ' + x.id) })
    b.inputFluids(Fluid.of('gtceu:tritanium', 144))
    b.itemOutputs(c.count + 'x ' + c.output).EUt(c.eut).duration(c.duration)
    UF.casingRecipe = 'grindless:assembler/' + c.name
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try { addRows(event) } catch (e) { console.error(LOG + 'fusion recipes failed: ' + e) }
    try { addCasing(event) } catch (e3) { console.error(LOG + 'casing recipe failed: ' + e3) }
    try { addControllers(event) } catch (e2) { console.error(LOG + 'controller recipes failed: ' + e2) }
  })
})()
