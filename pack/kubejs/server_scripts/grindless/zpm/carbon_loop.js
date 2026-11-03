// priority: -13224
// -----------------------------------------------------------------------------------------------
// D2-MATTER (#363, docs/eras/lines-ev-zpm.md section 9, D2-6): the carbon loop closes. GTM's electrolyzer/diamond_electrolysis turns one
// diamond dust into 64 carbon, which fed the HV gasifier and the ash centrifuge (iron from gas). No real process electrolyses diamond and
// nothing in the pack uses it, so it is removed. Carbon is conserved by grindless:chemical_reactor/nanodiamond_cleaning
// (tables/megabar.json): 4 nanodiamond + 4 000 mB hydrogen -> 3 diamond dust + 1 000 mB methane.
(function () {
  const G = global.grindless || (global.grindless = {})
  const ZPM = G.zpm || (G.zpm = {})

  ZPM.carbonLoop = { removed: ['gtceu:electrolyzer/diamond_electrolysis'] }

  global.grindless.recipes('zpm/carbon_loop', function (event) {
    ZPM.carbonLoop.removed.forEach(function (id) { event.remove({ id: id }) })
  })
})()
