// -----------------------------------------------------------------------------------------------
// D1-HV-PROP: the HV propellants (docs/eras/lines-steam-hv.md, line H2). Fluid: startup_scripts/grindless/hv/propellant_items.js.
//
//   Hydrogen peroxide comes only from the anthraquinone cycle in GT--'s chemical plant (EAQ -> EAHQ -> H2O2, then hydrazine):
//   GTM's two direct reactors for it are removed. Unsymmetrical dimethylhydrazine (UDMH) comes only from dimethylamine +
//   monochloramine: the methanol route is removed. Rocket fuel is mixed only from Aerozine 50 and dinitrogen tetroxide.
//
//   removed (reactor and large reactor)   chemical_reactor/hydrogen_peroxide, chemical_reactor/dimethylhydrazine_from_methanol
//   removed (mixer)                       mixer/rocket_fuel_from_oxygen, mixer/rocket_fuel_from_dinitrogen_tetroxide
//   chemical_reactor/phthalic_anhydride   1 small V2O5 dust + 1,000 mB naphthalene + 1,000 mB air -> 15 phthalic anhydride dust, 800 t:
//   large_chemical_reactor/...            GTM's recipe moved from 1,920 to 480 EU/t so the plant's first reagent is an HV step
//   mixer/aerozine_50                     1,000 mB hydrazine + 1,000 mB UDMH -> 2,000 mB Aerozine 50, 30 EU/t x 60 t
//   mixer/rocket_fuel                     1,000 mB Aerozine 50 + 1,000 mB N2O4 -> 6,000 mB rocket fuel, 16 EU/t x 60 t (GTM's N2O4 mixer's
//                                         output and time, so the fuel's consumers and site_fuels.json keep their figures)
// Published for the tests: global.grindless.propellants.removed, .recipes.
(function () {
  var G = global.grindless
  var P = G.propellants || (G.propellants = {})
  P.removed = [
    'gtceu:chemical_reactor/hydrogen_peroxide', 'gtceu:large_chemical_reactor/hydrogen_peroxide',
    'gtceu:chemical_reactor/dimethylhydrazine_from_methanol', 'gtceu:large_chemical_reactor/dimethylhydrazine_from_methanol',
    'gtceu:mixer/rocket_fuel_from_oxygen', 'gtceu:mixer/rocket_fuel_from_dinitrogen_tetroxide',
    'gtceu:chemical_reactor/phthalic_anhydride', 'gtceu:large_chemical_reactor/phthalic_anhydride'
  ]
  P.recipes = [
    'grindless:chemical_reactor/phthalic_anhydride', 'grindless:large_chemical_reactor/phthalic_anhydride',
    'grindless:mixer/aerozine_50', 'grindless:mixer/rocket_fuel'
  ]

  global.grindless.recipes('hv/propellants', function (event) {
    P.removed.forEach(function (id) { event.remove({ id: id }) })

    ;['chemical_reactor', 'large_chemical_reactor'].forEach(function (type) {
      event.recipes.gtceu[type]('grindless:phthalic_anhydride')
        .itemInputs('gtceu:small_vanadium_pentoxide_dust')
        .inputFluids(Fluid.of('gtceu:naphthalene', 1000), Fluid.of('gtceu:air', 1000))
        .itemOutputs('15x gtceu:phthalic_anhydride_dust')
        .EUt(480).duration(800)
    })

    event.recipes.gtceu.mixer('grindless:aerozine_50')
      .inputFluids(Fluid.of('gtceu:hydrazine', 1000), Fluid.of('gtceu:dimethylhydrazine', 1000))
      .outputFluids(Fluid.of('gtceu:aerozine_50', 2000))
      .EUt(30).duration(60)
    event.recipes.gtceu.mixer('grindless:rocket_fuel')
      .inputFluids(Fluid.of('gtceu:aerozine_50', 1000), Fluid.of('gtceu:dinitrogen_tetroxide', 1000))
      .outputFluids(Fluid.of('gtceu:rocket_fuel', 6000))
      .EUt(16).duration(60)
  })
})()
