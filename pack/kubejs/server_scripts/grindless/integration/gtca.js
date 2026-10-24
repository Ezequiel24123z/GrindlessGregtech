// -----------------------------------------------------------------------------------------------
// GT Community Additions (gtca): its Green House (gtca:green_house, recipe type gtceu:green_house) grows 64 logs, crops,
// berries or nether wart per run for 40-60 EU/t, a recipe it can run from LV. Plant, tree and rubber automation is
// the job of the Steam Greenhouse and the LV Greenhouse (recipe type gtceu:greenhouse, scripts steam/greenhouse.js and
// lv/greenhouse.js), so the addon's second greenhouse is removed: its recipes and the controller's crafting recipe.
// Everything else of GTCA (industrial coke oven, PCB factory, nano forge, space machines, purification units...) stays:
// those machines are tier-gated by their own recipes (HV and above) and add chains we do not have.
// Era: never for the Green House (revisit if a late-game bulk greenhouse is designed).
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    event.remove({ type: 'gtceu:green_house' })
    event.remove({ output: 'gtca:green_house' })
  })
})()
