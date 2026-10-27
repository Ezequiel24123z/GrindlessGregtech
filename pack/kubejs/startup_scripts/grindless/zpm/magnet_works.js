// -----------------------------------------------------------------------------------------------
// One of ZPM's multiblocks (docs/eras/zpm.md, "Machine 6"; package ZPM-A5): the naquadria magnet works and its recipe type.
//
//   gtceu:naquadria_magnet_works   the LuV magnet works' bigger sibling: powder-in-tube wire and the network's ZPM cells wound and
//                                  cold-tested in a mK shield (a cryostat of its own casing). 7 x 7 x 5 on grindless:cryostat_casing: a
//                                  3 x 3 x 3 test bore in the middle, ringed by a winding lathe (stainless steel gearboxes between
//                                  tungstensteel frame posts), the parts on the base's back and front rows.
//   gtceu:naquadria_magnets        its recipe type (EU in). The programmed circuit picks the product; the recipes come from
//                                  data/grindless/tables/magnet_works.json (server_scripts/grindless/zpm/magnet_works.js):
//                                    circuit 1  ZPM SMES cell  16 URhNq2 single wires + a naquadria block (the design's core) + a ZPM
//                                                              field generator + the charge -> 1 grindless:zpm_smes_cell
//                                    circuit 2  URhNq2 wire    uranium + rhodium + 2 naquadah dust + a silver foil -> 2 single wires,
//                                                              no 9,000 K blast, priced above GTM's route in EU
//                                    circuit 3  HTS insert     a LuV HTS coil + 4 URhNq2 single wires -> grindless:hts_insert
//                                    circuit 4  UV SMES cell   16 EnTED single wires + 8 darmstadtium plates + 16 advanced SMD
//                                                              capacitors + the charge -> 1 grindless:uv_smes_cell (UV-A9)
//                                Circuits 1 and 4 carry the cold-test charge: 1,000 mB of liquid helium as GTM's non-consumed fluid input
//                                (notConsumableFluid, chance 0): needed to start, never drained, taken once whatever the overclock.
//
// Byproducts: none (voidable). Machine class: GTM's plain electric multiblock with a parallel hatch's copies, then GTM's default
// overclock (lib/parallel_hatch.js). Also registers grindless:hts_insert (an item; no use is its own: A6 and the qubit fab consume it).
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front; 7 wide, 7 deep, 5 high):
// row 0 is the base (casing; the back and front rows take parts), rows 1-3 the shell, row 4 the lid. Slices 2-4 hold the bore (columns
// 2-4, rows 1-3: air); the ring around it: tungstensteel frame posts in the four corners, stainless steel gearboxes on the ring's edge at
// row 2 (the lathe), casing elsewhere. The controller is in the middle of the front row. Parts: 1-2 energy hatches, 1-3 input buses,
// 1-3 input hatches, 1-2 output buses and at most one parallel hatch.
//
// Textures: overlay dir grindless:block/multiblock/naquadria_magnet_works (tools/assets/Build-ZPMMagnetWorksTextures.ps1) on the cryostat
// casing's texture. Names / tooltips: client_scripts/grindless/zpm_magnet_works_lang.js. Published for the recipe script and the smoke
// test: global.grindless.magnetWorks.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MW = G.magnetWorks || (G.magnetWorks = {})
  const LOG = '[grindless/zpm] '

  const MACHINE = 'gtceu:naquadria_magnet_works'
  const TYPE = 'naquadria_magnets'
  const TABLE = 'kubejs/data/grindless/tables/magnet_works.json'

  const CASING = 'grindless:cryostat_casing'
  const CASING_TEXTURE = 'grindless:block/zpm/cryostat_casing'
  const GEARBOX = 'gtceu:stainless_steel_gearbox'
  const FRAME = 'tungsten_steel'
  const INSERT = 'grindless:hts_insert'

  const DATA_KEY = 'grindless_naquadria_magnets'
  const CHARGE_KEY = 'grindless.machine.naquadria_magnet_works.charge'

  function loadCharge() {
    try {
      var t = G.readJsonTable(TABLE)
      var c = t.charge || {}
      if (String(c.id || '').indexOf(':') < 0 || !(Number(c.amount) > 0)) throw new Error('charge ' + JSON.stringify(t.charge))
      return { id: String(c.id), amount: Number(c.amount) }
    } catch (e) {
      console.error(LOG + 'naquadria magnet works: ' + TABLE + ': ' + e)
      return { id: 'gtceu:liquid_helium', amount: 1000 }
    }
  }
  const CHARGE = loadCharge()

  MW.machine = MACHINE
  MW.recipeType = 'gtceu:' + TYPE
  MW.table = TABLE
  MW.charge = CHARGE
  MW.dataKey = DATA_KEY
  MW.insert = INSERT
  // items in: up to four kinds and the programmed circuit; out: one product; fluids in: the charge
  MW.maxIO = { itemsIn: 6, itemsOut: 1, fluidsIn: 2, fluidsOut: 0 }
  MW.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 3 },
    input_hatch: { min: 1, max: 3 },
    output_bus: { min: 1, max: 2 }
  }
  MW.blocks = { casing: CASING, gearbox: GEARBOX, frame: FRAME }

  // ---------------------------------------------------------------- pattern

  const WALL = 'FFFFFFF'
  const SPEC = {
    slices: [
      // back: the base's back row takes parts
      ['XXXXXXX', WALL, WALL, WALL, WALL],
      // the ring's back side: frame posts in the corners, the lathe's gearboxes at row 2
      ['FFFFFFF', 'FTFFFTF', 'FTGGGTF', 'FTFFFTF', WALL],
      // the bore's slices: the ring's sides and the 3 x 3 x 3 bore
      ['FFFFFFF', 'FF###FF', 'FG###GF', 'FF###FF', WALL],
      ['FFFFFFF', 'FF###FF', 'FG###GF', 'FF###FF', WALL],
      ['FFFFFFF', 'FF###FF', 'FG###GF', 'FF###FF', WALL],
      // the ring's front side
      ['FFFFFFF', 'FTFFFTF', 'FTGGGTF', 'FTFFFTF', WALL],
      // front: the base's front row, the controller in the middle
      ['XXXSXXX', WALL, WALL, WALL, WALL]
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

  // one controller line: the cold-test charge, and whether a cell can start
  function display(controller, list) {
    try {
      if (!controller.isFormed()) return
      var held = chargeIn(controller)
      var key = held >= CHARGE.amount ? CHARGE_KEY + '.ok' : CHARGE_KEY + '.low'
      list.add(Text.translate(key, String(held), String(CHARGE.amount)))
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error(LOG + 'naquadria magnet works controller display failed: ' + e)
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

  // ---------------------------------------------------------------- the hybrid insert

  StartupEvents.registry('item', function (event) {
    event.create(INSERT)
      .texture('grindless:item/hts_insert')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.hts_insert.0')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.hts_insert.1')))
  })

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

    event.create('naquadria_magnet_works', 'multiblock')
      .langValue('Naquadria Magnet Works')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      // a parallel hatch's copies, then GTM's default overclock (lib/parallel_hatch.js; the charge is needed once, never multiplied)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .additionalDisplay(display)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.naquadria_magnet_works.tooltip.0'),
        Text.translate('grindless.machine.naquadria_magnet_works.tooltip.1'),
        Text.translate('grindless.machine.naquadria_magnet_works.tooltip.2'),
        Text.translate('grindless.machine.parallel_hatch.tooltip')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/naquadria_magnet_works')
  })

  // the plants that take the parallel hatch (lib/parallel_hatch.js keeps the list for the smoke test and the dump)
  if (G.parallelHatch && G.parallelHatch.machines && G.parallelHatch.machines.indexOf(MACHINE) < 0) G.parallelHatch.machines.push(MACHINE)
})()
