// priority: 10250
// D2-APT: names and tooltips of the tungsten line materials (startup_scripts/grindless/ev/tungsten_apt.js).
ClientEvents.lang('en_us', function (event) {
  event.add('grindless', 'material.gtceu.ammonium_tungstate', 'Ammonium Tungstate Solution')
  event.add('grindless', 'material.gtceu.ammonium_paratungstate', 'Ammonium Paratungstate')
  event.add('grindless', 'material.gtceu.tungsten_trioxide', 'Tungsten Trioxide')
  event.add('grindless', 'tooltip.grindless.ammonium_tungstate', 'Tungstic acid dissolved in ammonia. Molybdenum is precipitated as molybdenite, then the solution is crystallised into APT.')
  event.add('grindless', 'tooltip.grindless.ammonium_paratungstate', 'APT, the tungsten trade intermediate. Calcined in an electric blast furnace to tungsten trioxide.')
  event.add('grindless', 'tooltip.grindless.tungsten_trioxide', 'The yellow oxide. Reduced in hydrogen to tungsten metal.')
})

ItemEvents.tooltip(function (event) {
  event.add('gtceu:ammonium_tungstate_bucket', Text.translate('tooltip.grindless.ammonium_tungstate').gray())
  event.add('gtceu:ammonium_paratungstate_dust', Text.translate('tooltip.grindless.ammonium_paratungstate').gray())
  event.add('gtceu:tungsten_trioxide_dust', Text.translate('tooltip.grindless.tungsten_trioxide').gray())
})
