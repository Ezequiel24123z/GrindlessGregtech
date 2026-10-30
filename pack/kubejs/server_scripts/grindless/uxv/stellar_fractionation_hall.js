// priority: -26260
// UXV-M2: the controller of gtceu:stellar_fractionation_hall (startup_scripts/grindless/uxv/stellar_fractionation_hall.js). The hall has no recipe of its own: it runs
// GTM's distillation_tower and distillery recipes, so this is its one recipe, an assembly line researched with the condensation tower.
// UXV hull + UXV parts (the conveyor module and the robot arm of A8, the electric pump) + the domain inputs of the hall (the lasagna plate of the
// Vela pasta line, the platinum sheet) + four UXV circuits, soldered and lubricated, with the helium cut that the tower fractionates.
// The UXV circuit is the tag #gtceu:circuits/uxv (gtnn:spintronic_mainframe among others), reachable once A5 makes the mainframe.
(function () {
  const LOG = '[stellar_fractionation_hall] '
  const SH = global.grindless.stellarFractionationHall || (global.grindless.stellarFractionationHall = {})
  const ID = 'stellar_fractionation_hall'
  const ITEMS = [
    'gtceu:uxv_machine_hull',
    '2x grindless:uxv_conveyor_module',
    '2x grindless:uxv_robot_arm',
    '2x grindless:uxv_electric_pump',
    'grindless:lasagna_plate',
    'grindless:pt_sheet',
    '4x #gtceu:circuits/uxv'
  ]
  const FLUIDS = [['gtceu:stellar_helium_cut', 1000], ['gtceu:soldering_alloy', 2304], ['gtceu:lubricant', 2000]]
  const RESEARCH = 'gtceu:stellar_condensation_tower'
  const EUT = 7864320
  const DURATION = 1500

  SH.recipeId = 'grindless:assembly_line/' + ID
  SH.done = false
  SH.missing = []

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      var strip = function (s) { return s.replace(/^\d+x /, '') }
      var plain = ITEMS.map(strip).filter(function (s) { return s.charAt(0) !== '#' })
      var missing = plain.concat([RESEARCH, 'gtceu:' + ID]).filter(function (id) { return !Item.exists(id) })
      FLUIDS.forEach(function (f) { if (!Fluid.exists(f[0])) missing.push(f[0]) })
      SH.missing = missing
      if (missing.length > 0) {
        console.error(LOG + 'controller recipe skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + ID)
      ITEMS.forEach(function (s) { b.itemInputs(s) })
      FLUIDS.forEach(function (f) { b.inputFluids(Fluid.of(f[0], f[1])) })
      b.itemOutputs('gtceu:' + ID)
      b.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(EUT) })
      b.EUt(EUT).duration(DURATION)
    } catch (e) {
      console.error(LOG + 'controller recipe failed: ' + e)
    } finally {
      SH.done = true
    }
  })
})()
