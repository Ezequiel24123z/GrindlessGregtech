// -----------------------------------------------------------------------------------------------
// One of LuV's multiblocks (docs/eras/luv.md, "3. HTS magnet works"; package LuV-A4): the HTS magnet works and its recipe type.
//
//   gtceu:hts_magnet_works   magnets as their own trade: high-temperature-superconductor tape is wound on a turning mandrel,
//                            vacuum-impregnated with epoxy and cold-tested in a liquid-helium cryostat before it leaves (the CFS and MIT
//                            SPARC magnet factory; SMES coils). About 11 x 5 x 5 on a frostproof base: a 3x3x4 test cryostat of
//                            frostproof machine casing (left), a 3x3x3 impregnation tank of PTFE pipe casing and laminated glass
//                            (middle), and a 3x3x5 winding mandrel (right): a stainless steel gearbox spindle in a tungstensteel frame
//                            cage, on a turntable of stainless gearboxes.
//   gtceu:magnet_winding     its recipe type (EU in). The programmed circuit picks the product; the recipes come from
//                            data/grindless/tables/hts_magnet_works.json (server_scripts/grindless/luv/hts_magnet_works.js):
//                              circuit 1  HTS coil          16 ITBTC coated conductor + 16 NbTi foils + 144 mB trinium + 144 mB epoxy
//                                                           -> 1 gtceu:superconducting_coil (GTM's block; GTM's own LuV recipe takes
//                                                           3,456 mB of trinium: decision 13)
//                              circuit 2  SMES cell         32 coated conductor + 8 NbTi foils + 4 frostproof casings + a LuV hull +
//                                                           144 mB epoxy -> 1 grindless:luv_smes_cell (the wireless network's LuV cell,
//                                                           its LuV row in tables/wireless_energy.json; registered by lv/wireless_energy.js)
//                              circuit 3  coilgun coil      16 Hg-1223 single wires + an HSS-S frame + 72 mB epoxy -> 2 coilgun coil casings
//                              circuit 4  magnetic bearing  4 tetrataenite rods + an HSS-S ring + 2 titanium plates -> 1 magnetic bearing
//                            Every recipe carries the cold-test charge: 1,000 mB of liquid helium as GTM's non-consumed fluid input
//                            (notConsumableFluid, chance 0): needed to start, never drained, taken once whatever the overclock or the
//                            parallel hatch's copies.
//
// What it gains (rules 4 and 7): a coil with a twenty-fourth of GTM's trinium (the Mk1's trinium wall), the network's LuV cells, wound
// Hg-1223 coilgun coils and tetrataenite bearings. Byproducts: none (voidable). Machine class: GTM's plain electric multiblock
// (WorkableElectricMultiblockMachine) with a parallel hatch's copies, then GTM's default overclock (lib/parallel_hatch.js).
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front; 11 wide, 5 deep, 5
// high): row 0 is the base, frostproof casing, with the turntable (stainless gearboxes) under the mandrel; the back and front rows of
// the base (X) take the parts, and so do two cells of the cryostat's front wall (the helium hatch's place). The controller is in the
// middle of the front row. Columns 0-2 the cryostat (rows 1-4, hollow inside rows 1-3), 3 free, 4-6 the tank (rows 1-3: PTFE floor,
// a glass ring around the bath, PTFE lid), 7 free, 8-10 the mandrel (rows 1-4). Parts: 1-2 energy hatches (two of a tier lift the
// voltage one tier, GTM's rule; wireless energy hatches are GTM's own energy hatches and count), 1-3 input buses, 1-3 input hatches,
// 1-2 output buses and at most one parallel hatch; ME buses and hatches have the same abilities, so they fit.
//
// Textures: overlay dir grindless:block/multiblock/hts_magnet_works (tools/assets/Build-HTSMagnetWorksTextures.ps1) on GTM's frostproof
// casing. Names / tooltips: client_scripts/grindless/luv_hts_magnet_works_lang.js. Published for the recipe script and the smoke test:
// global.grindless.htsMagnetWorks.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MW = G.htsMagnetWorks || (G.htsMagnetWorks = {})
  const LOG = '[grindless/luv] '

  const MACHINE = 'gtceu:hts_magnet_works'
  const TYPE = 'magnet_winding'
  const TABLE = 'kubejs/data/grindless/tables/hts_magnet_works.json'

  const CASING = 'gtceu:frostproof_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'
  const GEARBOX = 'gtceu:stainless_steel_gearbox'
  const PIPE = 'gtceu:ptfe_pipe_casing'
  const GLASS = 'gtceu:laminated_glass'
  const FRAME = 'tungsten_steel'

  // the recipe data key: the EMI line gtceu.recipe.grindless_magnet_winding.<recipe name>
  const DATA_KEY = 'grindless_magnet_winding'
  const CHARGE_KEY = 'grindless.machine.hts_magnet_works.charge'

  // ---------------------------------------------------------------- the charge (data/grindless/tables/hts_magnet_works.json)

  function loadCharge() {
    try {
      var t = G.readJsonTable(TABLE)
      var c = t.charge || {}
      if (String(c.id || '').indexOf(':') < 0 || !(Number(c.amount) > 0)) throw new Error('charge ' + JSON.stringify(t.charge))
      return { id: String(c.id), amount: Number(c.amount) }
    } catch (e) {
      console.error(LOG + 'HTS magnet works: ' + TABLE + ': ' + e)
      return { id: 'gtceu:liquid_helium', amount: 1000 }
    }
  }
  const CHARGE = loadCharge()

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  MW.machine = MACHINE
  MW.recipeType = 'gtceu:' + TYPE
  MW.table = TABLE
  MW.charge = CHARGE
  MW.dataKey = DATA_KEY
  // items in: up to four kinds and the programmed circuit; out: one product; fluids in: trinium, epoxy and the charge
  MW.maxIO = { itemsIn: 6, itemsOut: 1, fluidsIn: 3, fluidsOut: 0 }
  MW.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 3 },
    input_hatch: { min: 1, max: 3 },
    output_bus: { min: 1, max: 2 }
  }
  MW.blocks = { casing: CASING, gearbox: GEARBOX, pipe: PIPE, glass: GLASS, frame: FRAME }

  // ---------------------------------------------------------------- pattern

  const SPEC = {
    slices: [
      // back: the base's back row takes parts
      ['XXXXXXXXXXX', '           ', '           ', '           ', '           '],
      // the modules' back walls: cryostat, tank (PTFE floor, glass, PTFE lid), mandrel cage; the turntable under the mandrel
      ['FFFFFFFFGGG', 'FFF PPP TTT', 'FFF LLL TTT', 'FFF PPP TTT', 'FFF     TTT'],
      // the middle: the cryostat's hollow, the bath, the spindle
      ['FFFFFFFFGGG', 'F#F PPP TGT', 'F#F L#L TGT', 'F#F PPP TGT', 'FFF     TGT'],
      // the modules' front walls: two cells of the cryostat's take parts (the helium hatch)
      ['FFFFFFFFGGG', 'FXF PPP TTT', 'FXF LLL TTT', 'FFF PPP TTT', 'FFF     TTT'],
      // front: the base's front row, the controller in the middle
      ['XXXXXSXXXXX', '           ', '           ', '           ', '           ']
    ],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(CASING),
        Pat.part('energy_input', MW.parts.energy_input),
        Pat.part('input_bus', MW.parts.input_bus),
        Pat.part('input_hatch', MW.parts.input_hatch),
        Pat.part('output_bus', MW.parts.output_bus),
        G.parallelHatch.part()
      ),
      F: Pat.block(CASING),
      G: Pat.block(GEARBOX),
      P: Pat.block(PIPE),
      L: Pat.block(GLASS),
      T: Pat.frame([FRAME]),
      '#': Pat.air()
    }
  }
  MW.spec = SPEC

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
  MW.chargeIn = chargeIn

  var displayFailed = false

  // one controller line: the cold-test charge, and whether a winding can start
  function display(controller, list) {
    try {
      if (!controller.isFormed()) return
      var held = chargeIn(controller)
      var key = held >= CHARGE.amount ? CHARGE_KEY + '.ok' : CHARGE_KEY + '.low'
      list.add(Text.translate(key, String(held), String(CHARGE.amount)))
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error(LOG + 'HTS magnet works controller display failed: ' + e)
      }
    }
  }
  MW.display = display

  // one EMI line per recipe, read from its data: what the circuit makes
  function productInfo(data) {
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
      .setMaxIOSize(MW.maxIO.itemsIn, MW.maxIO.itemsOut, MW.maxIO.fluidsIn, MW.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MOTOR)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(productInfo)

    Pat.register(MACHINE, SPEC)

    event.create('hts_magnet_works', 'multiblock')
      .langValue('HTS Magnet Works')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      // a parallel hatch's copies, then GTM's default overclock (lib/parallel_hatch.js; the charge is needed once, never multiplied)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(GTBlocks.CASING_ALUMINIUM_FROSTPROOF)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .additionalDisplay(display)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.hts_magnet_works.tooltip.0'),
        Text.translate('grindless.machine.hts_magnet_works.tooltip.1'),
        Text.translate('grindless.machine.hts_magnet_works.tooltip.2'),
        Text.translate('grindless.machine.hts_magnet_works.tooltip.3'),
        Text.translate('grindless.machine.parallel_hatch.tooltip')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/hts_magnet_works')
  })

  // the plants that take the parallel hatch (lib/parallel_hatch.js keeps the list for the smoke test and the dump)
  if (G.parallelHatch && G.parallelHatch.machines && G.parallelHatch.machines.indexOf(MACHINE) < 0) G.parallelHatch.machines.push(MACHINE)
})()
