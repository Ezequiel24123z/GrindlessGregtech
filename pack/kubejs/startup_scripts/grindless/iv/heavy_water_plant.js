// priority: -2700
// -----------------------------------------------------------------------------------------------
// One of IV's multiblocks (docs/eras/iv.md, "Heavy-water plant"; package IV-A5): the heavy-water plant and its recipe type.
//
//   gtceu:heavy_water_plant   a Girdler sulfide plant: a cold tower (3x3x10) and a hot tower (3x3x14) of chemically inert PTFE machine
//                             casing, two blocks apart, joined at mid-height by a bridge of titanium pipe casings (the heat exchanger
//                             the hydrogen sulfide circulates through), and a 1x1x8 vacuum column of tungstensteel pipe casing standing
//                             against the hot tower. The parts go in the towers' feet.
//   gtceu:isotope_exchange    its recipe type (EU in). The programmed circuit picks the mode; the recipes come from
//                             data/grindless/tables/heavy_water_plant.json (server_scripts/grindless/iv/heavy_water_plant.js):
//                               circuit 1  exchange    16 Martian deuterium-rich ice dust (melted inside) + 25 600 mB steam, with a 1 000 mB
//                                                      hydrogen sulfide charge in a hatch that is never drained -> 3 200 mB heavy-water
//                                                      concentrate (about 20 % D2O) + 12 800 mB depleted water (plain water) + 160 mB
//                                                      distilled water (the condensed steam)
//                               circuit 2  finishing   1 000 mB concentrate -> 200 mB heavy water + 800 mB distilled water (the vacuum
//                                                      column)
//
// What it gains (rule 4): a separation GTM does not have (deuterium enrichment by dual-temperature exchange), several steps in one (the
// ice is melted, exchanged and finished in one plant) and the pack's only deuterium source since EV removed hydrogen_separation: heavy
// water is the fission reactor's moderator (IV-A2), and its electrolysis (IV-A1) gives deuterium for LuV's fusion.
//
// The H2S charge: GTM's non-consumed fluid input (notConsumableFluid, chance 0). An exchange run only starts with the whole charge in an
// input hatch, takes it once whatever the overclock (and a parallel hatch's copies), and never drains it: it is the GS process's
// circulating gas. The controller shows how much of it the hatches hold. Steam comes from the EV plants that refuse to void theirs (the
// combined-cycle plant and the hot strip mill) and the H2S from HV's refinery or GTM's desulfurization.
//
// Byproducts: the depleted water is inert (to the network, or voided: the plant allows the controller's voiding); the distilled water
// goes to the network; the concentrate goes back in (circuit 2) or to a second plant. Machine class: GTM's plain electric multiblock
// (WorkableElectricMultiblockMachine) with GTM's default recipe modifier (non-perfect overclock), after a parallel hatch's copies.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front; 9 wide, 14 high,
// 3 deep): columns 0-2 the cold tower (rows 0-9), 3-4 the gap, 5-7 the hot tower (rows 0-13), 8 the vacuum column (middle slice, rows
// 0-7). Each tower is hollow (air inside) above its foot and closed by a cap; its foot (row 0) is a 3x3 whose middle is casing (the sump).
// QR-S1: each tower is a framed column: titanium frame posts on its four corners and a glass sight strip down its front and back.
// The bridge (P) is two titanium pipe casings high (rows 5-6) and two long, in the middle slice. The controller is in the middle of the
// hot tower's foot, in the front face. The 14 X cells of the feet (the cold tower's 8, the hot tower's 6 that a pipe can reach) take
// 1-2 energy hatches, 1-2 input buses, 1-4 input hatches, 1-4 output hatches and at most one parallel hatch (IV-B6, lib/parallel_hatch.js:
// its copies run before GTM's overclock, and the H2S charge is needed once, never multiplied); the rest stay casing. ME buses and hatches,
// and the quadruple and nonuple hatches, have the same abilities, so they fit.
//
// Textures: overlay dir grindless:block/multiblock/heavy_water_plant (tools/assets/Build-HeavyWaterPlantTextures.ps1) on GTM's inert
// PTFE casing. Names / tooltips: client_scripts/grindless/iv_heavy_water_plant_lang.js. Published for the recipe script and the smoke
// test: global.grindless.heavyWaterPlant.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const HW = G.heavyWaterPlant || (G.heavyWaterPlant = {})
  const LOG = '[grindless/iv] '

  const MACHINE = 'gtceu:heavy_water_plant'
  const TYPE = 'isotope_exchange'
  const TABLE = 'kubejs/data/grindless/tables/heavy_water_plant.json'

  const CASING = 'gtceu:inert_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_inert_ptfe'
  const BRIDGE = 'gtceu:titanium_pipe_casing'
  const COLUMN = 'gtceu:tungstensteel_pipe_casing'

  // the recipe data key: the EMI line gtceu.recipe.grindless_isotope_exchange.<recipe name>
  const DATA_KEY = 'grindless_isotope_exchange'
  const CHARGE_KEY = 'grindless.machine.heavy_water_plant.charge'

  // ---------------------------------------------------------------- the charge (data/grindless/tables/heavy_water_plant.json)

  function loadCharge() {
    try {
      var t = G.readJsonTable(TABLE)
      var c = t.charge || {}
      if (String(c.id || '').indexOf(':') < 0 || !(Number(c.amount) > 0)) throw new Error('charge ' + JSON.stringify(t.charge))
      return { id: String(c.id), amount: Number(c.amount) }
    } catch (e) {
      console.error(LOG + 'heavy-water plant: ' + TABLE + ': ' + e)
      return { id: 'gtceu:hydrogen_sulfide', amount: 1000 }
    }
  }
  const CHARGE = loadCharge()

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  HW.machine = MACHINE
  HW.recipeType = 'gtceu:' + TYPE
  HW.table = TABLE
  HW.charge = CHARGE
  HW.dataKey = DATA_KEY
  HW.modes = { 1: 'exchange', 2: 'finishing' }
  // items in: the ice and the programmed circuit; fluids in: the steam and the charge; out: concentrate, depleted and distilled water
  HW.maxIO = { itemsIn: 2, itemsOut: 0, fluidsIn: 2, fluidsOut: 3 }
  HW.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 4 },
    output_hatch: { min: 1, max: 4 }
  }
  HW.blocks = { casing: CASING, bridge: BRIDGE, column: COLUMN }

  // ---------------------------------------------------------------- pattern

  // rows bottom -> top: the foot, eight (cold) or twelve (hot) hollow rings, the cap
  function slice(foot, middle, bridgeRow, topCold, topHot, coldCap, hotCap) {
    var rows = [foot]
    for (var r = 1; r <= 13; r++) {
      if (r === 9) rows.push(coldCap)
      else if (r === 13) rows.push(hotCap)
      else if (r > 9) rows.push(topHot)
      else if (r === 5 || r === 6) rows.push(bridgeRow)
      else rows.push(r <= 7 ? middle : topCold)
    }
    return rows
  }

  const SPEC = {
    slices: [
      // back: the towers' back walls; their feet take parts
      slice('XXX  XXX ', 'FGF  FGF ', 'FGF  FGF ', 'FGF  FGF ', '     FGF ', 'CCC  CCC ', '     CCC '),
      // middle: the sumps, the hollow towers, the bridge at mid-height and the vacuum column against the hot tower (rows 0-7)
      slice('XCX  XCCV', 'C#C  C#CV', 'C#CPPC#CV', 'C#C  C#C ', '     C#C ', 'CCC  C#C ', '     CCC '),
      // front: the controller in the middle of the hot tower's foot
      slice('XXX  XSX ', 'FGF  FGF ', 'FGF  FGF ', 'FGF  FGF ', '     FGF ', 'CCC  CCC ', '     CCC ')
    ],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(CASING),
        Pat.part('energy_input', HW.parts.energy_input),
        Pat.part('input_bus', HW.parts.input_bus),
        Pat.part('input_hatch', HW.parts.input_hatch),
        Pat.part('output_hatch', HW.parts.output_hatch),
        G.parallelHatch.part()
      ),
      C: Pat.block(CASING),
      F: Pat.frame(['titanium']),
      G: Pat.block('minecraft:glass'),
      P: Pat.block(BRIDGE),
      V: Pat.block(COLUMN),
      '#': Pat.air()
    }
  }
  HW.spec = SPEC

  // ---------------------------------------------------------------- the charge in the hatches

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return LC
  }

  // mB of the charge fluid in the input hatches (ME hatches report what they hold)
  function chargeIn(machine) {
    var c = lazy()
    var total = 0
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.FluidCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (stack === null || stack === undefined || typeof stack.isEmpty !== 'function' || stack.isEmpty()) continue
        if (String(c.Registries.FLUIDS.getKey(stack.getFluid())) === CHARGE.id) total += Number(stack.getAmount())
      }
    }
    return total
  }
  HW.chargeIn = chargeIn

  var displayFailed = false

  // one controller line: the H2S charge, and whether the exchange can start
  function display(controller, list) {
    try {
      if (!controller.isFormed()) return
      var held = chargeIn(controller)
      var key = held >= CHARGE.amount ? CHARGE_KEY + '.ok' : CHARGE_KEY + '.low'
      list.add(Text.translate(key, String(held), String(CHARGE.amount)))
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error(LOG + 'heavy-water plant controller display failed: ' + e)
      }
    }
  }
  HW.display = display

  // One EMI line per recipe, read from its data: what the mode does
  function modeInfo(data) {
    try {
      var name = String(data.getString(DATA_KEY))
      if (name === '') return ''
      return String(Text.translate('gtceu.recipe.' + DATA_KEY + '.' + name).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(HW.maxIO.itemsIn, HW.maxIO.itemsOut, HW.maxIO.fluidsIn, HW.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(modeInfo)

    Pat.register(MACHINE, SPEC)

    event.create('heavy_water_plant', 'multiblock')
      .langValue('Heavy-Water Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      // a parallel hatch's copies, then GTM's default overclock (IV-B6; without a hatch, the overclock alone, as before)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(GTBlocks.CASING_PTFE_INERT)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .additionalDisplay(display)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.heavy_water_plant.tooltip.0'),
        Text.translate('grindless.machine.heavy_water_plant.tooltip.1'),
        Text.translate('grindless.machine.heavy_water_plant.tooltip.2'),
        Text.translate('grindless.machine.heavy_water_plant.tooltip.3'),
        Text.translate('grindless.machine.parallel_hatch.tooltip')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/heavy_water_plant')
  })
})()
