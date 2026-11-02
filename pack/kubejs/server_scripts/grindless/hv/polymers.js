// -----------------------------------------------------------------------------------------------
// Polymer chains made of real steps (docs/eras/lines-steam-hv.md M3, H3, H5; package D1-POLY). GTM 7.5.3 shortcuts the three of them;
// each shortcut goes and the real process goes in:
//
//   PVC (M3)     oxychlorination  ethylene + 2 HCl + O -> 1,2-dichloroethane + water  (GTM's vinyl_chloride_from_hydrochloric gave vinyl
//                                 chloride from half the HCl; rebuilt with the same id so it ends in EDC, as real oxychlorination does)
//                EDC cracking     1,2-dichloroethane -> vinyl chloride + HCl           NEW, MV 120 EU/t, 200 t; the HCl goes back to
//                                 the oxychlorination, which closes the chlorine loop
//                removed          vinyl_chloride_from_chlorine, vinyl_chloride_from_ethane (one step, not industrial)
//   PTFE (H5)    R22              chloroform + 2 HF -> chlorodifluoromethane + 2 HCl   NEW, HV 240 EU/t, 240 t
//                pyrolysis        2 R22 -> tetrafluoroethylene + 2 HCl                 NEW, HV 480 EU/t, 240 t (GTM copies it into the large chemical reactor; the UEV FFKM line takes its TFE from here)
//                removed          tetrafluoroethylene_from_chloroform (the same 2 chloroform + 4 HF in one go) and the large reactor's
//                                 tetrafluoroethylene_from_methane
//   Epoxy (H3)   removed          the large chemical reactor's phenol_acetone_shortcut, phenol_hcl_shortcut, phenol_salt_shortcut and
//                                 epoxy_shortcut. The chain stays: cumene_from_benzene -> phenol_from_cumene (Hock) -> bisphenol_a ->
//                                 epoxy_from_bisphenol_a
//
// Amounts are GTM's: 1 000 mB of a fluid is one mole of its formula, and its oxygen fluid is atoms (1 000 mB is half an O2). Every
// recipe balances. Chlorodifluoromethane is registered by startup_scripts/grindless/uev/composites.js. Byproduct destinations: HCl ->
// the oxychlorination, chloroform, bisphenol A and acid; water is inert.
(function () {
  const G = global.grindless || (global.grindless = {})
  const POLY = G.polymers || (G.polymers = {})

  POLY.removed = [
    'gtceu:chemical_reactor/vinyl_chloride_from_chlorine',
    'gtceu:chemical_reactor/vinyl_chloride_from_ethane',
    'gtceu:chemical_reactor/tetrafluoroethylene_from_chloroform',
    'gtceu:large_chemical_reactor/tetrafluoroethylene_from_methane',
    'gtceu:large_chemical_reactor/phenol_acetone_shortcut',
    'gtceu:large_chemical_reactor/phenol_hcl_shortcut',
    'gtceu:large_chemical_reactor/phenol_salt_shortcut',
    'gtceu:large_chemical_reactor/epoxy_shortcut'
  ]
  POLY.rebuilt = 'gtceu:chemical_reactor/vinyl_chloride_from_hydrochloric'

  global.grindless.recipes('hv/polymers', function (event) {
    POLY.removed.forEach(function (id) { event.remove({ id: id }) })
    event.remove({ id: POLY.rebuilt })

    event.recipes.gtceu.chemical_reactor('gtceu:vinyl_chloride_from_hydrochloric')
      .circuit(3)
      .inputFluids('gtceu:ethylene 1000', 'gtceu:hydrochloric_acid 2000', 'gtceu:oxygen 1000')
      .outputFluids('gtceu:dichloroethane 1000', 'minecraft:water 1000')
      .EUt(30)
      .duration(160)

    event.recipes.gtceu.chemical_reactor('grindless:edc_cracking')
      .circuit(1)
      .inputFluids('gtceu:dichloroethane 1000')
      .outputFluids('gtceu:vinyl_chloride 1000', 'gtceu:hydrochloric_acid 1000')
      .EUt(120)
      .duration(200)

    event.recipes.gtceu.chemical_reactor('grindless:r22_from_chloroform')
      .inputFluids('gtceu:chloroform 1000', 'gtceu:hydrofluoric_acid 2000')
      .outputFluids('gtceu:chlorodifluoromethane 1000', 'gtceu:hydrochloric_acid 2000')
      .EUt(240)
      .duration(240)

    event.recipes.gtceu.chemical_reactor('grindless:tetrafluoroethylene_from_r22_pyrolysis')
      .inputFluids('gtceu:chlorodifluoromethane 2000')
      .outputFluids('gtceu:tetrafluoroethylene 1000', 'gtceu:hydrochloric_acid 2000')
      .EUt(480)
      .duration(240)
  })
})()
