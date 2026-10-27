// priority: -6400
// -----------------------------------------------------------------------------------------------
// Items of the observatory family (docs/journey.md: "navigation data only comes from looking"). Each observatory is the only machine that
// makes its chart, and every chart is a data item that is made once: the next instrument takes it as an input that is never used up,
// and any chart can be copied by hand (original + blank -> 2), so a lost or second copy never means observing again.
//
//   grindless:lunar_chart_draft     Steam. The Clockwork Observatory's drawing of the Moon (gtceu:stargazing). Never used up by the
//                                   Optical Observatory. Copy: draft + paper + coal dust.
//   grindless:photographic_plate    LV. Glass plate + silver emulsion (LV assembler). Exposed by the Optical Observatory, and the blank
//                                   of a map copy (contact print).
//   grindless:lunar_map             LV. The photographic map of the Moon (gtceu:astrophotography). Never used up by the Radio
//                                   Telescope. Copy: map + photographic plate.
//   grindless:lunar_ephemeris       LV. Tables of the Moon's position, made in the same observation as the map. Never used up by the
//                                   Radio Telescope (it points the dishes at a Moon behind clouds). Copy: ephemeris + paper + coal dust.
//   grindless:lunar_landing_chart   MV. Radar echoes over the photographic map with the landing site of the first trip to the Moon
//                                   (gtceu:radio_astronomy). The last chart of this step of the family; the rocket side (GCYR, HV) is
//                                   wired by another script. Copy: chart + paper + coal dust.
// Every chart is in the item tag grindless:lunar_charts. The ids are published in global.grindless.observatory.items for the server
// scripts and the test.
// Names / tooltips: client_scripts/grindless/observatory_lang.js. Textures: item/<id> (tools/assets/Build-ObservatoryTextures.ps1).
(function () {
  const G = global.grindless || (global.grindless = {})
  const OBS = G.observatory || (G.observatory = {})

  OBS.items = {
    draft: 'grindless:lunar_chart_draft',
    plate: 'grindless:photographic_plate',
    map: 'grindless:lunar_map',
    ephemeris: 'grindless:lunar_ephemeris',
    landing: 'grindless:lunar_landing_chart'
  }

  // item name -> number of description lines (tooltip.grindless.<name>.<n>): the first says what the chart shows, the others how it
  // is made, used and copied
  const LINES = {
    lunar_chart_draft: 2,
    photographic_plate: 1,
    lunar_map: 2,
    lunar_ephemeris: 2,
    lunar_landing_chart: 2
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(LINES).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(16)
      for (var i = 0; i < LINES[name]; i++) {
        var line = Text.translate('tooltip.grindless.' + name + '.' + i)
        item.tooltip(i === 0 ? Text.gray(line) : Text.darkGray(line))
      }
      if (name !== 'photographic_plate') item.tag('grindless:lunar_charts')
    })
  })
})()
