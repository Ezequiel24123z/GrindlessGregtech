// priority: -25474
// -----------------------------------------------------------------------------------------------
// Recipes of the UV Mega Factory (startup_scripts/grindless/uv/mega_factory.js, docs/eras/mega.md 4.10, family rule 6): assembler
// recipes built from the machines they replace. Each module block: 8 UV machines of its own recipe types, 8 UV machine casings,
// 1 UV circuit, a silicon nitride film and a tritanium plate, with soldering alloy and lubricant. The controller is an assembly line
// (station research: the heat module): 64 UV machines (8 kinds x 8), 4 UV circuits and the five modules, with soldering alloy,
// lubricant and tritanium. The machine itself runs GTM's own recipes untouched.
(function () {
  const G = global.grindless
  const MF = G.megaFactory || (G.megaFactory = {})

  const CASING = 'gtceu:uv_machine_casing'
  const CIRCUIT = '#gtceu:circuits/uv'
  const FILM = 'grindless:silicon_nitride_film'
  const TRITANIUM = 'gtceu:tritanium_plate'
  const CONTROLLER_KINDS = ['centrifuge', 'electrolyzer', 'bender', 'wiremill', 'cutter', 'mixer', 'autoclave', 'arc_furnace']
  const MODULES = {
    separation_module: { centrifuge: 3, electrolyzer: 3, sifter: 2 },
    forming_module: { bender: 2, extruder: 2, forming_press: 2, wiremill: 2 },
    cutting_module: { cutter: 3, lathe: 3, laser_engraver: 2 },
    mixing_module: { mixer: 3, chemical_bath: 3, autoclave: 2 },
    heat_module: { arc_furnace: 4, alloy_smelter: 4 }
  }

  function inputsOf(counts) {
    return Object.keys(counts).map(function (t) { return counts[t] + 'x gtceu:uv_' + t })
  }

  // read by the bench test
  MF.crafting = 'gtceu:mega_factory'
  MF.craftingInputs = CONTROLLER_KINDS.map(function (t) { return '8x gtceu:uv_' + t }).concat(['4x ' + CIRCUIT])
  MF.craftingModules = Object.keys(MODULES).map(function (name) { return 'grindless:' + name })
  MF.craftingResearch = 'grindless:heat_module'
  MF.moduleRecipes = {}
  Object.keys(MODULES).forEach(function (name) {
    MF.moduleRecipes['grindless:' + name] = inputsOf(MODULES[name]).concat(['8x ' + CASING, '1x ' + CIRCUIT, FILM, TRITANIUM])
  })

  ServerEvents.recipes(function (event) {
    try {
      var ids = [CASING, 'grindless:separation_module', FILM, TRITANIUM].concat(CONTROLLER_KINDS.map(function (t) { return 'gtceu:uv_' + t }))
      Object.keys(MODULES).forEach(function (name) {
        Object.keys(MODULES[name]).forEach(function (t) { ids.push('gtceu:uv_' + t) })
      })
      var missing = ids.concat(['gtceu:mega_factory'], MF.craftingModules).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/uv] mega factory recipes skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      Object.keys(MODULES).forEach(function (name) {
        var ins = MF.moduleRecipes['grindless:' + name]
        var r = event.recipes.gtceu.assembler('grindless:' + name)
        ins.forEach(function (i) { r.itemInputs(i) })
        r.inputFluids(Fluid.of('gtceu:soldering_alloy', 576), Fluid.of('gtceu:lubricant', 200))
        r.itemOutputs('grindless:' + name).EUt(122880).duration(600)
      })
      // an assembly line with station research: the controller is built from the five modules it runs
      var c = event.recipes.gtceu.assembly_line(MF.crafting)
      MF.craftingInputs.forEach(function (i) { c.itemInputs(i) })
      MF.craftingModules.forEach(function (i) { c.itemInputs(i) })
      c.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000), Fluid.of('gtceu:tritanium', 576))
      c.itemOutputs('gtceu:mega_factory')
      c.stationResearch(function (res) { return res.researchStack(Item.of(MF.craftingResearch)).CWUt(64).EUt(491520) })
      c.EUt(491520).duration(1800)
      console.info('[grindless/uv] mega factory: controller and module recipes added')
    } catch (e) {
      console.error('[grindless/uv] mega factory recipes failed: ' + e)
    }
  })
})()
