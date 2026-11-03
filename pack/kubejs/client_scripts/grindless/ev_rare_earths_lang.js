// D2-REE: names and tooltips of the samaric branch fluids (startup_scripts/grindless/ev/rare_earths.js).
ClientEvents.lang('en_us', function (event) {
  event.add('grindless', 'material.gtceu.seg_chloride_solution', 'SEG Chloride Solution')
  event.add('grindless', 'material.gtceu.heavy_rare_earth_chloride_solution', 'Heavy Rare Earth Chloride Solution')
  event.add('grindless', 'tooltip.grindless.seg_chloride_solution', 'Samarium, europium and gadolinium chlorides with the heavies. Split in the extraction cascade (circuit 3).')
  event.add('grindless', 'tooltip.grindless.heavy_rare_earth_chloride_solution', 'What is left after europium is stripped. Fluoridated into fluorinated samaric concentrate.')
})

ItemEvents.tooltip(function (event) {
  event.add('gtceu:seg_chloride_solution_bucket', Text.translate('tooltip.grindless.seg_chloride_solution').gray())
  event.add('gtceu:heavy_rare_earth_chloride_solution_bucket', Text.translate('tooltip.grindless.heavy_rare_earth_chloride_solution').gray())
})
