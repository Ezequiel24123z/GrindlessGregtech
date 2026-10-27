// priority: -14124
// -----------------------------------------------------------------------------------------------
// Applied Flux (appflux): FE storage in the ME network (FE cells, flux accessor, induction card). It is an MV mod
// (docs/eras/mv.md, "Mods and integration"): MV circuits and aluminium, and EU -> FE comes from the GregTech converters
// (config/gtceu.yaml compat.energy.enableFEConverters = true), never from a generator.
// Three choke points cover the whole mod (every FE cell >= 4k, the portable cells and the accessor need them):
//   energy processor   ae2:inscriber (printed silicon + redstone + printed energy processor)  ->  GT assembler, 120 EU/t:
//                      printed energy processor + printed silicon + redstone + MV circuit + aluminium plate
//   1k core            logic processor  ->  MV circuit (the 4k..256k cores are built on the 1k core and the energy processor)
//   flux accessor      copper ingots  ->  aluminium plates (+ the energy processor)
// The rest (redstone crystal, charged redstone, presses, housing, resin) keeps the AE2 machines (inscriber, charger, transform).
// MEGA-cell recipes of the mod are conditional on MEGA Cells and are not loaded.
// Era: MV.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    var ids = ['appflux:energy_processor', 'appflux:printed_energy_processor', 'appflux:core_1k', 'appflux:flux_accessor', 'ae2:printed_silicon', 'ae2:energy_acceptor']
    var missing = ids.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/appflux] skipped, unknown items: ' + missing.join(', '))
      return
    }

    event.remove({ id: 'appflux:inscriber/energy' })
    event.recipes.gtceu.assembler('grindless:appflux/energy_processor')
      .itemInputs('appflux:printed_energy_processor', 'ae2:printed_silicon', 'minecraft:redstone', '#gtceu:circuits/mv', '#forge:plates/aluminium')
      .itemOutputs('appflux:energy_processor')
      .EUt(120)
      .duration(100)

    event.remove({ id: 'appflux:1k_core' })
    event.shaped('appflux:core_1k', ['DCD', 'CPC', 'DCD'], {
      D: '#forge:dusts/certus_quartz',
      C: 'appflux:redstone_crystal',
      P: '#gtceu:circuits/mv'
    }).id('appflux:1k_core')

    event.remove({ id: 'appflux:flux_accessor' })
    event.shaped('appflux:flux_accessor', ['DPD', 'AMA', 'DPD'], {
      D: '#forge:dusts/glowstone',
      P: 'appflux:energy_processor',
      A: '#forge:plates/aluminium',
      M: 'ae2:energy_acceptor'
    }).id('appflux:flux_accessor')
  })
})()
