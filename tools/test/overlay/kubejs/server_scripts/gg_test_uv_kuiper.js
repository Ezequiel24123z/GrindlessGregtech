// TEST ONLY, UV-B4 (the Kuiper interceptor bay, the amorphous ice annealer, the cryogenic plant's Kuiper row).
// Command: kubejs custom_command gg_test_uv_kuiper   Reserved band: X 27136-27199 (no block is placed: live recipe lookups only).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copy of pack> `
//     -Commands 'kubejs custom_command gg_test_uv_kuiper' -WaitForLog 'GGTEST\|uv_kuiper\|DONE'
//
// Open question it answers: the live rows keep their Pluto orbit condition, and the cryogenic row keeps its three outputs
// (argon, krypton, xenon) although the cryogenic type declares one fluid output; only the annealer makes the Kuiper noble gas.
// Markers: GGTEST|uv_kuiper|<check>|PASS|FAIL|NOTE|<detail>
(function () {
  var NAME = 'uv_kuiper'
  var REQUEST = 'ggTestUvKuiperRequest'
  var ORBIT = 'grindless:pluto_orbit'
  var NOBLE = 'gtceu:kuiper_noble_gas'
  var LOADED = Date.now()
  var DONE = false
  var failed = 0
  var C = null

  function classes() {
    if (C === null) {
      C = {
        RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
        ArrayList: Java.loadClass('java.util.ArrayList'),
        Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function check(name, ok, detail) {
    if (!ok) failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + detail) }
  function byId(server, id) {
    var found = server.getRecipeManager().byKey(new (classes().RL)(id))
    if (!found.isPresent()) {
      // the recipe builder prefixes the recipe type: grindless:<type>/<type>/<name>
      var m = /^grindless:([a-z_]+)\/(.+)$/.exec(id)
      if (m) found = server.getRecipeManager().byKey(new (classes().RL)('grindless:' + m[1] + '/' + m[1] + '/' + m[2]))
    }
    return found.isPresent() ? found.get() : null
  }
  function fluidIds(list) {
    return array(list).map(function (fs) { return String(classes().Registries.FLUIDS.getKey(fs.getFluid())) + ':' + Number(fs.getAmount()) })
  }
  function dimsOf(recipe) {
    return array(recipe.conditions)
      .filter(function (c) { return String(c.getClass().getSimpleName()) === 'DimensionCondition' })
      .map(function (c) { return String(c.getDimension().location()) })
  }
  function circuitsOf(recipe) {
    return array(classes().Helper.getInputItems(recipe))
      .filter(function (st) { return classes().Circuit.isIntegratedCircuit(st) })
      .map(function (st) { return Number(classes().Circuit.getCircuitConfiguration(st)) })
  }
  function euOf(recipe) { return Number(classes().Helper.getRealEUt(recipe).getTotalEU()) }

  function run(server) {
    var K = global.grindless && global.grindless.uvKuiper
    check('published', K !== undefined && K !== null, K ? 'yes' : 'no')
    if (!K) return
    check('skipped', (K.skipped || []).length === 0, JSON.stringify(K.skipped || []))
    check('clashes', (K.clashes || []).length === 0, JSON.stringify(K.clashes || []))
    ;['gtceu:kuiper_interceptor_bay', 'gtceu:amorphous_ice_annealer', 'grindless:kuiper_interceptor', 'grindless:sample_canister'].forEach(function (id) {
      check('registered', Item.exists(id), id)
    })

    ;(K.recipes || []).forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      if (live === null) { check('live_' + rec.name, false, rec.recipeId + ' is not loaded'); return }
      var dims = dimsOf(live)
      var circuits = circuitsOf(live)
      var eu = euOf(live)
      check('live_' + rec.name, JSON.stringify(dims) === JSON.stringify([ORBIT]) && JSON.stringify(circuits) === '[1]' && eu === rec.eut,
        rec.recipeId + '; dims=' + dims.join(',') + '; circuits=' + circuits.join(',') + '; EU/t=' + eu)
    })
    var anneal = byId(server, 'grindless:ice_annealing/planetesimal_annealing')
    if (anneal !== null) {
      var outs = fluidIds(classes().Helper.getOutputFluids(anneal))
      check('annealer_outputs', outs.length === 4 && outs.indexOf(NOBLE + ':250') >= 0, outs.join(', '))
    }
    ;(K.support || []).forEach(function (rec) { check('support_' + rec.name, byId(server, rec.recipeId) !== null, rec.recipeId) })
    Object.keys(K.crafting || {}).forEach(function (k) { check('crafting_' + k, byId(server, K.crafting[k]) !== null, K.crafting[k]) })

    var cryo = byId(server, 'grindless:cryogenic_processing/kuiper_noble_gas')
    if (cryo === null) check('cryo_row', false, 'grindless:cryogenic_processing/kuiper_noble_gas is not loaded')
    else {
      var cin = fluidIds(classes().Helper.getInputFluids(cryo))
      var cout = fluidIds(classes().Helper.getOutputFluids(cryo))
      var cdims = dimsOf(cryo)
      check('cryo_row', JSON.stringify(cin) === JSON.stringify([NOBLE + ':1000']) &&
        JSON.stringify(cout) === JSON.stringify(['gtceu:argon:400', 'gtceu:krypton:400', 'gtceu:xenon:200']) &&
        JSON.stringify(cdims) === JSON.stringify(['gcyr:luna']) && euOf(cryo) === 7680,
        'in=' + cin.join(',') + '; out=' + cout.join(',') + '; dims=' + cdims.join(',') + '; EU/t=' + euOf(cryo))
    }
    ;['liquid_oxygen', 'liquid_helium', 'liquid_nitrogen', 'triton_nitric_oxide'].forEach(function (n) {
      check('cryo_kept_' + n, byId(server, 'grindless:cryogenic_processing/' + n) !== null, n)
    })

    var hall = byId(server, 'grindless:thruster_assembly/hall_thruster')
    var hallIn = hall === null ? [] : fluidIds(classes().Helper.getInputFluids(hall))
    check('krypton_to_thrusters', hallIn.some(function (s) { return s.indexOf('gtceu:krypton:') === 0 }), 'hall inputs=' + hallIn.join(','))

    var makers = []
    var scanned = 0
    array(server.getRecipeManager().getRecipes()).forEach(function (r) {
      if (String(r.getClass().getSimpleName()) !== 'GTRecipe') return
      scanned++
      try {
        var outs = fluidIds(classes().Helper.getOutputFluids(r))
        if (outs.some(function (s) { return s.indexOf(NOBLE + ':') === 0 })) makers.push(String(r.getId()))
      } catch (e) { /* a recipe without fluid outputs */ }
    })
    check('noble_gas_only_annealer', makers.length === 1 && /planetesimal_annealing$/.test(makers[0]),
      scanned + ' GT recipes scanned; makers=' + makers.join(','))
    note('orbit_level', server.getLevel(ORBIT) === null ? 'missing' : 'present')
  }

  ServerEvents.customCommand('gg_test_uv_kuiper', function () {
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && !DONE && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        DONE = true
        run(event.server)
        console.info('GGTEST|' + NAME + '|DONE|' + (failed === 0 ? 'PASS' : 'FAIL') + '|' + failed + ' failed')
      }
    } catch (e) {
      check('exception', false, String(e))
      console.info('GGTEST|' + NAME + '|DONE|FAIL|' + failed + ' failed')
    }
  })
})()
