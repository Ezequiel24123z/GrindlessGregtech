// TEST ONLY, UHV-A8. Command: kubejs custom_command gg_test_uhv_propulsion
// Band ONLY: X 28416-28479, Z 0-63, Overworld Y 60-120.
// Doubt: the ICAN rocket motor (createCustom GCYR RocketMotorBlock) is tier 6 in the real game, so with the BNNT tank (tier 11)
// a rocket is level floor((6 + 11) / 2) = 8 = Proxima b; and its real thruster works recipe consumes the GEO assembled stage.
//   static_*  every published A8 recipe loads under its GTM id; the sinterer machine and its crafting exist; no clashes
//   motor_*   the motor is a registered RocketMotorBlock of tier 6, places in the world, and the recipe takes the GEO stage
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUhvPropulsionRequest'
  var LOADED = Date.now()
  var X0 = 28416
  var X1 = 28479
  var Y0 = 60
  var Y1 = 120
  var NAME = 'uhv_propulsion'
  var MOTOR = 'grindless:ican_rocket_motor'
  var TANK = 'grindless:bnnt_fuel_tank'
  var STAGE = 'grindless:geo_assembled_stage'
  var MOTOR_RECIPE = 'grindless:thruster_assembly/ican_rocket_motor'
  var POD_RECIPE = 'grindless:thruster_assembly/oganesson_propellant_pod'

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Machines: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      PlanetData: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData'),
      MotorBlock: Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock'),
      TankBlock: Java.loadClass('argent_matter.gcyr.common.block.FuelTankBlock')
    }
    return C
  }
  function rl(id) { return new (classes().RL)(id) }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function clean(s) { return String(s).replace(/\|/g, '/').replace(/\s+/g, ' ') }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function machineDef(id) { return classes().Machines.MACHINES.get(rl(id)) }
  function forgeBlock(id) {
    var R = classes().Forge.BLOCKS
    return R.containsKey(rl(id)) ? R.getValue(rl(id)) : null
  }
  function inputIds(r) {
    return array(classes().Helper.getInputItems(r)).map(function (st) { return String(classes().Forge.ITEMS.getKey(st.getItem())) + 'x' + st.getCount() })
  }

  // ---------------------------------------------------------------- static
  function statics() {
    var P = global.grindless && global.grindless.uhvPropulsion
    if (!P || !P.recipes) { check('static_published', false, 'global.grindless.uhvPropulsion has no recipes'); return }
    var skipped = {}
    ;(P.skipped || []).forEach(function (s) { skipped[String(s.name || s)] = true })
    var missing = []
    var present = 0
    P.recipes.concat(P.side).forEach(function (r) {
      if (skipped[r.name]) return
      if (byId(r.recipeId) === null) missing.push(r.recipeId)
      else present++
    })
    ;[P.crafting.sinterer, MOTOR_RECIPE, POD_RECIPE].forEach(function (id) {
      if (byId(id) === null) missing.push(id)
      else present++
    })
    check('static_recipes', missing.length === 0 && Object.keys(skipped).length === 0, present + ' present; missing ' +
      (missing.join(' ') || 'none') + '; skipped ' + (JSON.stringify(P.skipped || []) || 'none'))
    check('static_clashes', (P.clashes || []).length === 0, JSON.stringify(P.clashes || []))
    check('static_machine', !!machineDef('gtceu:spark_plasma_sinterer'), 'gtceu:spark_plasma_sinterer')
    var zrb2 = byId('grindless:electric_blast_furnace/zirconium_diboride')
    if (zrb2 !== null) note('static_zrb2', 'EBF temp ' + zrb2.data.getInt('ebf_temp') + ', inputs ' + inputIds(zrb2).join(' '))
  }

  // ---------------------------------------------------------------- the motor
  function motor() {
    var L = classes()
    var b = forgeBlock(MOTOR)
    check('motor_registered', b !== null && Item.exists(MOTOR), 'block ' + (b !== null) + ', item ' + Item.exists(MOTOR) +
      ', startup motorTier ' + (global.grindless.uhvPropulsion && global.grindless.uhvPropulsion.motorTier))
    if (b === null) return
    var isMotor = b instanceof L.MotorBlock
    var tier = isMotor ? Number(b.getTier()) : -1
    check('motor_tier', isMotor && tier === 6, 'class ' + String(b.getClass().getName()) + ', tier ' + tier)
    var tank = forgeBlock(TANK)
    var tankTier = tank !== null && tank instanceof L.TankBlock ? Number(tank.getTier()) : -1
    var level = Math.floor((Math.floor(tier) + Math.floor(tankTier)) / 2)
    var prox = L.PlanetData.getPlanet(rl('gcyr:proxima_centauri_b'))
    var proxTier = prox === null || prox === undefined ? -1 : Number(prox.rocketTier())
    check('motor_rocket_level', tankTier === 11 && level === 8 && proxTier === 8,
      'motor ' + tier + ' + BNNT tank ' + tankTier + ' -> level ' + level + '; proxima_centauri_b needs ' + proxTier)
    var x = 28440
    var y = 80
    var z = 30
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    command('setblock ' + x + ' ' + y + ' ' + z + ' ' + MOTOR + ' replace')
    var placed = String(S.level.getBlockState(new L.Pos(x, y, z)).getBlock().getClass().getName())
    var placedId = String(L.Forge.BLOCKS.getKey(S.level.getBlockState(new L.Pos(x, y, z)).getBlock()))
    check('motor_places', placedId === MOTOR, 'placed ' + placedId + ' (' + placed + ')')
    command('setblock ' + x + ' ' + y + ' ' + z + ' minecraft:air replace')
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    var r = byId(MOTOR_RECIPE)
    var ins = r === null ? [] : inputIds(r)
    var outs = r === null ? [] : array(L.Helper.getOutputItems(r)).map(function (st) { return String(L.Forge.ITEMS.getKey(st.getItem())) })
    check('motor_recipe_stage', ins.indexOf(STAGE + 'x1') >= 0 && outs.indexOf(MOTOR) >= 0,
      'inputs ' + ins.join(' ') + '; outputs ' + outs.join(' ') + '; EU/t ' + (r === null ? '-' : Number(L.Helper.getRealEUt(r).getTotalEU())))
  }

  function run(server) {
    S = { server: server, failed: 0 }
    S.level = server.getLevel('minecraft:overworld')
    try { statics() } catch (e) { check('static_exception', false, String(e)) }
    try { motor() } catch (e) { check('motor_exception', false, String(e)) }
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  ServerEvents.customCommand('gg_test_uhv_propulsion', function () {
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    if (global[REQUEST] !== true || Date.now() - LOADED < 10000) return
    global[REQUEST] = false
    try { run(event.server) } catch (e) {
      if (S === null) S = { server: event.server, failed: 0 }
      check('exception', false, String(e))
      console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
