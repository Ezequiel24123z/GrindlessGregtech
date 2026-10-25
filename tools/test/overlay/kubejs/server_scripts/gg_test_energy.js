// Gregtech Grindless - test overlay (not shipped with the pack)
//
// Usage: powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//   -Commands 'kubejs custom_command gg_test_energy' -WaitForLog 'GGTEST\|energy\|DONE'
//
// Verifies the power pass (DECISIONS.md, "GTL-like boost" + fuel pass):
//   boiler_config           every machines.smallBoilers / machines.largeBoilers key pack/config/gtceu.yaml sets, read
//                           back from GTM's own com.gregtechceu.gtceu.config.ConfigHolder (a wrong YAML key is silently
//                           ignored by GTM, so this is the only way to know the value actually reached the game)
//   steam_per_water_default the one largeBoilers key the pack leaves out on purpose still reads GTM's default (160)
//   generator_duration      a sample of generator recipes (steam turbine steam, combustion diesel, gas turbine
//                           methane) has exactly double GTM's vanilla duration, with the same fuel amount and EU/t
//                           (server_scripts/grindless/power/generators.js)
//   creosote_boiler_only    the creosote boiler fuel (steam_boiler) keeps its vanilla duration: creosote is a Large/
//                           Steam Boiler fuel in GTM 7.5.3, not a generator, so the duration pass never touches it
//                           (its own boost is the config multiplier above)
//   wireless_connector_lv   expatternprovider:wireless_connector now asks for an LV circuit, not an HV one
//
// Uses `var` + plain `function` everywhere (Rhino throws "redeclaration of var" otherwise).
ServerEvents.customCommand('gg_test_energy', function (event) { runEnergyTest(event) })

function geCheck(name, ok, detail) {
  console.log('GGTEST|energy|' + name + '|' + (ok ? 'PASS' : 'FAIL') + (detail ? ' (' + detail + ')' : ''))
}

function geSafely(name, fn) {
  try {
    fn()
  } catch (e) {
    geCheck(name, false, 'exception: ' + e)
  }
}

// GTM default -> pack/config/gtceu.yaml value (DECISIONS.md: smallBoilers x8, largeBoilers max temperature x8 except
// steel at 12800 like GTL, heat speed bronze 1 / steel 2 / titanium 4 / tungstensteel 8)
var SMALL_BOILERS = [
  ['solidBoilerBaseOutput', 120, 960], ['hpSolidBoilerBaseOutput', 300, 2400], ['liquidBoilerBaseOutput', 240, 1920],
  ['hpLiquidBoilerBaseOutput', 600, 4800], ['solarBoilerBaseOutput', 120, 960], ['hpSolarBoilerBaseOutput', 360, 2880]
]
var LARGE_BOILERS = [
  ['bronzeBoilerMaxTemperature', 800, 6400], ['bronzeBoilerHeatSpeed', 1, 1],
  ['steelBoilerMaxTemperature', 1800, 12800], ['steelBoilerHeatSpeed', 1, 2],
  ['titaniumBoilerMaxTemperature', 3200, 25600], ['titaniumBoilerHeatSpeed', 1, 4],
  ['tungstensteelBoilerMaxTemperature', 6400, 51200], ['tungstensteelBoilerHeatSpeed', 2, 8]
]

// recipe id -> [vanilla duration, EU/t, fluid tag, fluid amount]; the duration pass must double only the first number
var GENERATOR_SAMPLES = {
  'gtceu:steam_turbine/steam': [10, 32, 'forge:steam', 640],
  'gtceu:combustion_generator/diesel': [15, 32, 'forge:diesel', 1],
  'gtceu:gas_turbine/methane': [7, 32, 'forge:methane', 2]
}

var classes = null
function lazy() {
  if (classes === null) {
    classes = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
      Fluids: Java.loadClass('net.minecraftforge.registries.ForgeRegistries').FLUIDS,
      ConfigHolder: Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder')
    }
  }
  return classes
}

function rl(id) {
  return new (lazy().RL)(id)
}

function asArray(coll) {
  var list = new (lazy().ArrayList)(coll)
  var out = []
  for (var i = 0; i < list.size(); i++) out.push(list.get(i))
  return out
}

function tagItems(tag) {
  var set = {}
  asArray(Ingredient.of('#' + tag).getItemIds()).forEach(function (id) { set[String(id)] = true })
  return set
}

// this KubeJS hides Ingredient#getItems(), its own getItemIds() works on every ingredient (vanilla or GT SizedIngredient)
function ingredientIds(ing) {
  if (ing === null || ing === undefined) return []
  return asArray(ing.getItemIds()).map(function (id) { return String(id) }).filter(function (id) { return id !== 'minecraft:air' })
}

function isGt(r) {
  return r instanceof lazy().GTRecipe
}

function recipeById(rm, id) {
  var opt = rm.byKey(rl(id))
  return opt.isPresent() ? opt.get() : null
}

// GT recipe only: the fluid inputs as { id, amount }. The ingredient's own JSON is read first, so a tag input reports the
// tag itself (forge:steam), which is what "unchanged" has to compare; resolving it to its member fluids is the fallback.
function fluidInputs(r) {
  var L = lazy()
  var out = []
  asArray(r.getInputContents(L.FluidCap)).forEach(function (c) {
    var j = null
    try { j = JSON.parse(String(c.content.toJson())) } catch (e) { j = null }
    if (j && j.value && j.value.length > 0) {
      var v = j.value[0]
      out.push({ id: String(v.tag ? v.tag : v.fluid), amount: Number(j.amount) })
      return
    }
    var stacks = L.FluidCap.of(c.content).getStacks()
    for (var k = 0; k < stacks.length; k++) {
      out.push({ id: String(L.Fluids.getKey(stacks[k].getFluid())), amount: Number(stacks[k].getAmount()) })
    }
  })
  return out
}

function outputEut(r) {
  return Number(r.getOutputEUt().getTotalEU())
}

function runEnergyTest(event) {
  var server = event.getLevel().getServer()

  geSafely('boiler_config', function () {
    var $ConfigHolder = lazy().ConfigHolder
    $ConfigHolder.init()
    var small = $ConfigHolder.INSTANCE.machines.smallBoilers
    var large = $ConfigHolder.INSTANCE.machines.largeBoilers
    var bad = []
    var total = SMALL_BOILERS.length + LARGE_BOILERS.length
    SMALL_BOILERS.forEach(function (e) {
      var got = small[e[0]]
      if (got !== e[2]) bad.push('smallBoilers.' + e[0] + '=' + got + ' (want ' + e[2] + ')')
    })
    LARGE_BOILERS.forEach(function (e) {
      var got = large[e[0]]
      if (got !== e[2]) bad.push('largeBoilers.' + e[0] + '=' + got + ' (want ' + e[2] + ')')
    })
    geCheck('boiler_config', bad.length === 0, (total - bad.length) + '/' + total + ' keys match the x8 boost' +
      (bad.length > 0 ? ' | ' + bad.join(', ') : ''))
  })

  geSafely('steam_per_water_default', function () {
    var $ConfigHolder = lazy().ConfigHolder
    $ConfigHolder.init()
    var value = $ConfigHolder.INSTANCE.machines.largeBoilers.steamPerWater
    geCheck('steam_per_water_default', value === 160, 'steamPerWater=' + value + ' (left out of gtceu.yaml on purpose, GTM default 160)')
  })

  geSafely('generator_duration', function () {
    var rm = server.getRecipeManager()
    var ids = Object.keys(GENERATOR_SAMPLES)
    var bad = []
    var seen = 0
    ids.forEach(function (id) {
      var sample = GENERATOR_SAMPLES[id]
      var vanillaDuration = sample[0], wantEut = sample[1], wantFluid = sample[2], wantAmount = sample[3]
      var recipe = recipeById(rm, id)
      if (recipe === null) { bad.push(id + ': missing'); return }
      if (!isGt(recipe)) { bad.push(id + ': not a GT recipe'); return }
      seen++
      var wantDuration = vanillaDuration * 2
      if (recipe.duration !== wantDuration) bad.push(id + ': duration=' + recipe.duration + ' (want ' + wantDuration + ', vanilla x2)')
      var eut = outputEut(recipe)
      if (eut !== wantEut) bad.push(id + ': EU/t=' + eut + ' (want ' + wantEut + ', unchanged)')
      var fluids = fluidInputs(recipe)
      var fluid = fluids.length > 0 ? fluids[0] : null
      if (!fluid || fluid.id !== wantFluid || fluid.amount !== wantAmount) {
        bad.push(id + ': fluid input=' + (fluid ? fluid.amount + 'x ' + fluid.id : '(none)') + ' (want ' + wantAmount + 'x ' + wantFluid + ', unchanged)')
      }
    })
    geCheck('generator_duration', bad.length === 0 && seen === ids.length,
      seen + '/' + ids.length + ' recipes checked, duration doubled with the same fuel and EU/t' +
      (bad.length > 0 ? ' | ' + bad.join(' ; ') : ''))
  })

  geSafely('creosote_boiler_only', function () {
    var rm = server.getRecipeManager()
    var recipe = recipeById(rm, 'gtceu:steam_boiler/gtceu_creosote')
    if (recipe === null) throw 'gtceu:steam_boiler/gtceu_creosote missing'
    geCheck('creosote_boiler_only', recipe.duration === 350,
      'steam_boiler/gtceu_creosote duration=' + recipe.duration +
      ' (want 350, vanilla, untouched: a boiler fuel in GTM 7.5.3, not a generator recipe)')
  })

  geSafely('wireless_connector_lv', function () {
    var rm = server.getRecipeManager()
    var recipe = recipeById(rm, 'expatternprovider:wireless_connector')
    if (recipe === null) throw 'expatternprovider:wireless_connector missing'
    if (isGt(recipe)) throw 'not a crafting_shaped recipe any more'
    var lv = tagItems('gtceu:circuits/lv')
    var hv = tagItems('gtceu:circuits/hv')
    var slots = asArray(recipe.getIngredients()).map(function (ing) { return ingredientIds(ing) })
    var hasLv = slots.some(function (ids) { return ids.length > 0 && ids.every(function (id) { return lv[id] }) })
    var hasHv = slots.some(function (ids) { return ids.length > 0 && ids.every(function (id) { return hv[id] }) })
    geCheck('wireless_connector_lv', hasLv && !hasHv, 'lv circuit slot=' + hasLv + ', hv circuit slot=' + hasHv)
  })

  console.log('GGTEST|energy|DONE')
}
