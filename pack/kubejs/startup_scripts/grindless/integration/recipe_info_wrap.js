// Gregtech Grindless - EMI-1: recipe info text wrapped inside the EMI box, and the "needs air" line
//
// GTM 7.5.3 (GTRecipeWidget) draws every GTRecipeType#getDataInfos() function as one unwrapped label, so a long line runs past the recipe
// box. After every type is registered (the 'gtceu:dimension_marker' event is posted by GTDimensionMarkers#init, after the machines), each
// type's info functions are replaced by MAX_LINES functions per original: function i returns line i of the original's text wrapped to the box
// width (client font, GTRecipeTypeUI#getJEISize), or '' (draws nothing). GTRecipeTypeUI#getPropertyHeightShift counts one text line per info
// function, so the page grows with MAX_LINES per original; what does not fit in MAX_LINES lines ends with "...".
// The pack's lint (tools/analysis/recipe-info-length.test.mjs) keeps our en_us texts under that cap.
var GG_INFO_MAX_LINES = 8
var GG_INFO_FALLBACK_CHARS = 26
var GG_INFO_AIR_KEY = 'grindless_air'
var GG_INFO_AIR_TYPES = [
  'gtceu:combustion_generator', 'gtceu:gas_turbine', 'gtceu:semi_fluid_generator', 'gtceu:rocket_engine',
  'gtceu:steam_boiler', 'gtceu:large_boiler', 'gtceu:combined_cycle'
]

function ggInfoMeasure(text) {
  try {
    var Minecraft = Java.loadClass('net.minecraft.client.Minecraft')
    return Minecraft.getInstance().font.width(text)
  } catch (e) {
    return text.length * 6
  }
}

// words of text packed into lines no wider than maxPx; a word wider than the line is cut
function ggInfoWrap(text, maxPx) {
  var words = String(text).split(/\s+/)
  var lines = []
  var cur = ''
  words.forEach(function (w) {
    if (w.length === 0) return
    var next = cur.length === 0 ? w : cur + ' ' + w
    if (ggInfoMeasure(next) <= maxPx) {
      cur = next
      return
    }
    if (cur.length > 0) lines.push(cur)
    cur = w
    while (cur.length > 1 && ggInfoMeasure(cur) > maxPx) {
      var cut = cur.length - 1
      while (cut > 1 && ggInfoMeasure(cur.substring(0, cut)) > maxPx) cut--
      lines.push(cur.substring(0, cut))
      cur = cur.substring(cut)
    }
  })
  if (cur.length > 0) lines.push(cur)
  return lines
}

function ggInfoLine(type, original, index, cap) {
  return function (data) {
    var text = ''
    try { text = String(original.apply(data)) } catch (e) { return '' }
    if (text.length === 0 || text === 'null') return ''
    var maxPx = 150 - 8
    try { maxPx = type.getRecipeUI().getJEISize().width - 8 } catch (e2) { maxPx = 150 - 8 }
    var lines = ggInfoWrap(text, maxPx)
    if (lines.length > cap) {
      var last = lines[cap - 1]
      while (last.length > 0 && ggInfoMeasure(last + '...') > maxPx) last = last.substring(0, last.length - 1)
      lines = lines.slice(0, cap - 1)
      lines.push(last + '...')
    }
    return index < lines.length ? lines[index] : ''
  }
}

var ggAirInfoFunction = { apply: function (data) { return ggAirInfo(data) } }

function ggAirInfo(data) {
  try {
    if (!(data.getInt(GG_INFO_AIR_KEY) > 0)) return ''
    return String(Text.translate('gtceu.recipe.grindless_needs_air').getString())
  } catch (e) {
    return ''
  }
}

GTCEuStartupEvents.registry('gtceu:dimension_marker', function (event) {
  var Registries = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
  var ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
  var wrapped = 0
  var types = Registries.RECIPE_TYPES.values().toArray()
  for (var i = 0; i < types.length; i++) {
    var type = types[i]
    var originals = type.getDataInfos().toArray()
    if (originals.length === 0) continue
    type.getDataInfos().clear()
    for (var j = 0; j < originals.length; j++) {
      for (var k = 0; k < GG_INFO_MAX_LINES; k++) type.addDataInfo(ggInfoLine(type, originals[j], k, GG_INFO_MAX_LINES))
    }
    wrapped++
  }
  GG_INFO_AIR_TYPES.forEach(function (id) {
    var t = Registries.RECIPE_TYPES.get(new ResourceLocation(id))
    if (t == null) return
    for (var a = 0; a < 3; a++) t.addDataInfo(ggInfoLine(t, ggAirInfoFunction, a, 3))
  })
  console.info('[grindless/integration] recipe info wrapped for ' + wrapped + ' recipe types')
})
