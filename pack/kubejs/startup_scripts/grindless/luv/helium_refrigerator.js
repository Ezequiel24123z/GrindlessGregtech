// priority: -4100
// -----------------------------------------------------------------------------------------------
// One of LuV's multiblocks (docs/eras/luv.md, "1. Helium refrigerator"; package LuV-A3): the helium refrigerator and its recipe type.
//
//   gtceu:helium_refrigerator   a Claude-cycle helium refrigerator: a 5x5x9 cold box of frost-proof machine casing with two columns of
//                               titanium turbine casing inside (the turbo-expanders), a 3x5x4 compressor house of clean stainless steel
//                               casing beside it (titanium gearboxes inside: the compressors) and, on the house, a 3x3x3 helium gas
//                               holder of laminated glass. The parts go in the cold box's floor ring.
//   gtceu:closed_loop_cooling   its recipe type (EU in). The recipes are generated at every server load from the live vacuum freezer
//                               recipes that take liquid helium (server_scripts/grindless/luv/helium_refrigerator.js, with the figures of
//                               data/grindless/tables/helium_refrigerator.json): the hot ingot (or 144 mB of molten metal and the ingot
//                               mold, not consumed) + 25 mB of liquid helium (make-up) + 50 mB of liquid nitrogen (precooling) + a
//                               4,000 mB liquid helium charge that is never drained -> the ingot + 50 mB of nitrogen.
//
// What it gains (rules 2 and 4): GTM's freezer takes 500 mB of liquid helium for each of those ingots and gives back 250 mB of helium
// gas, so half is lost every time; at LuV about 60 recipes do that. The refrigerator keeps the helium in a closed loop: it re-liquefies
// what circulates (paid in EU at GTM's own liquefaction rate, halved by the nitrogen precooling) and loses only the make-up. A wall of
// raw quantity becomes energy.
//
// The charge: GTM's non-consumed fluid input (notConsumableFluid, chance 0) of the same fluid as the make-up. GTM merges both into one
// lookup key (FluidRecipeCapability#compressIngredients: FluidIngredient#equals ignores the amount), and a run starts only with the charge
// and the make-up together in the input hatches (4,025 mB; with a parallel hatch's N copies, 4,000 + 25 N: the charge is not
// multiplied). A run drains only the make-up. The controller shows the liquid helium the hatches hold.
//
// Byproducts: the nitrogen gas goes back to the EV cryogenic plant (which liquefies it again) or into the air: the refrigerator allows
// the controller's voiding (luv.md's policy: voidable). The helium never leaves. Machine class: GTM's plain electric multiblock
// (WorkableElectricMultiblockMachine) with GTM's default overclock (non-perfect), after a parallel hatch's copies (lib/parallel_hatch.js:
// the IV and LuV hatches fit the same cell).
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top, columns left -> right seen from the front; 8 wide, 9 high,
// 5 deep):
//   columns 0-4   the cold box: its floor (row 0) is a ring of casing or parts (X, 16 cells) round a 3x3 of casing; walls of casing
//                 (rows 1-7) round a hollow (air) with the two turbine columns (rows 1-7, middle slice, columns 1 and 3); a casing roof
//                 (row 8). The controller is in the front wall, row 1, middle column.
//   columns 5-7   the compressor house (rows 0-3, all five slices): clean stainless steel casing round a row of three titanium gearboxes
//                 (rows 1-2, middle column, the inner slices); on it (rows 4-6, the inner slices) the gas holder: laminated glass round
//                 one block of air.
// Parts (X): 1-2 energy hatches, 1-2 input buses (hot ingots, the mold), 1-2 output buses, 1-4 input hatches (molten metal, liquid
// helium, liquid nitrogen), 1-2 output hatches (nitrogen) and at most one parallel hatch. ME buses and hatches, and the quadruple and
// nonuple hatches, have the same abilities, so they fit.
//
// Textures: overlay dir grindless:block/multiblock/helium_refrigerator (tools/assets/Build-LuVCryogenicsTextures.ps1) on GTM's
// frost-proof casing. Names / tooltips: client_scripts/grindless/luv_cryogenics_lang.js. Published for the recipe script and the smoke
// test: global.grindless.heliumRefrigerator.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const HR = G.heliumRefrigerator || (G.heliumRefrigerator = {})
  const LOG = '[grindless/luv] '

  const MACHINE = 'gtceu:helium_refrigerator'
  const TYPE = 'closed_loop_cooling'
  const TABLE = 'kubejs/data/grindless/tables/helium_refrigerator.json'

  const CASING = 'gtceu:frostproof_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'
  const EXPANDER = 'gtceu:titanium_turbine_casing'
  const HOUSE = 'gtceu:clean_machine_casing'
  const COMPRESSOR = 'gtceu:titanium_gearbox'
  const HOLDER = 'gtceu:laminated_glass'

  // the recipe data key: the EMI line gtceu.recipe.grindless_closed_loop (the source recipe's id is its value)
  const DATA_KEY = 'grindless_closed_loop'
  const CHARGE_KEY = 'grindless.machine.helium_refrigerator.charge'

  // ---------------------------------------------------------------- the table (data/grindless/tables/helium_refrigerator.json)

  function fluidEntry(x, fallback) {
    if (!x || String(x.id || '').indexOf(':') < 0 || !(Number(x.amount) > 0)) return fallback
    return { id: String(x.id), amount: Number(x.amount) }
  }

  function loadTable() {
    var t = {}
    try {
      t = G.readJsonTable(TABLE)
    } catch (e) {
      console.error(LOG + 'helium refrigerator: ' + TABLE + ': ' + e)
    }
    var source = t.source || {}
    var precool = t.precool || {}
    var rel = t.reliquefaction || {}
    return {
      source: {
        type: String(source.type || 'gtceu:vacuum_freezer'),
        coolant: String(source.coolant || 'gtceu:liquid_helium'),
        returned: String(source.returned || 'gtceu:helium')
      },
      makeUp: fluidEntry(t.makeUp, { id: 'gtceu:liquid_helium', amount: 25 }),
      precoolIn: fluidEntry(precool['in'], { id: 'gtceu:liquid_nitrogen', amount: 50 }),
      precoolOut: fluidEntry(precool.out, { id: 'gtceu:nitrogen', amount: 50 }),
      charge: fluidEntry(t.charge, { id: 'gtceu:liquid_helium', amount: 4000 }),
      reliquefaction: {
        recipe: String(rel.recipe || 'gtceu:vacuum_freezer/liquid_helium'),
        fallbackEuPerMb: Number(rel.fallbackEuPerMb) > 0 ? Number(rel.fallbackEuPerMb) : 460.8,
        precoolFactor: Number(rel.precoolFactor) > 0 ? Number(rel.precoolFactor) : 0.5
      },
      minEUt: Number(t.minEUt) > 0 ? Number(t.minEUt) : 1920
    }
  }
  const CONFIG = loadTable()

  // ---------------------------------------------------------------- published for the recipe script and the smoke test

  HR.machine = MACHINE
  HR.recipeType = 'gtceu:' + TYPE
  HR.table = TABLE
  HR.config = CONFIG
  HR.charge = CONFIG.charge
  HR.dataKey = DATA_KEY
  // items in: the hot ingot or the mold; out: the ingot. Fluids in: molten metal, make-up, liquid nitrogen, the charge; out: nitrogen
  HR.maxIO = { itemsIn: 1, itemsOut: 1, fluidsIn: 4, fluidsOut: 1 }
  HR.parts = {
    energy_input: { min: 1, max: 2 },
    input_bus: { min: 1, max: 2 },
    output_bus: { min: 1, max: 2 },
    input_hatch: { min: 1, max: 4 },
    output_hatch: { min: 1, max: 2 }
  }
  HR.blocks = { casing: CASING, expander: EXPANDER, house: HOUSE, compressor: COMPRESSOR, holder: HOLDER }

  // ---------------------------------------------------------------- pattern

  // the house's three columns, rows 0-8: an end slice (back and front), an inner slice, the middle slice (air inside the gas holder)
  const HOUSE_END = ['HHH', 'HHH', 'HHH', 'HHH', '   ', '   ', '   ', '   ', '   ']
  const HOUSE_INNER = ['HHH', 'HGH', 'HGH', 'HHH', 'LLL', 'LLL', 'LLL', '   ', '   ']
  const HOUSE_MIDDLE = ['HHH', 'HGH', 'HGH', 'HHH', 'LLL', 'L#L', 'LLL', '   ', '   ']

  // rows bottom -> top of one slice: the cold box (5 columns: floor, walls rows 1-7, roof) and the house / gas holder (3 columns)
  function slice(floor, wall, roof, house) {
    var rows = []
    for (var r = 0; r <= 8; r++) {
      var box = r === 0 ? floor : (r === 8 ? roof : wall)
      rows.push(box + house[r])
    }
    return rows
  }

  function frontSlice() {
    var rows = slice('XXXXX', 'CCCCC', 'CCCCC', HOUSE_END)
    rows[1] = 'CCSCC' + HOUSE_END[1]
    return rows
  }

  const SPEC = {
    slices: [
      // back: the cold box's back wall over its floor ring
      slice('XXXXX', 'CCCCC', 'CCCCC', HOUSE_END),
      slice('XCCCX', 'C###C', 'CCCCC', HOUSE_INNER),
      // middle: the two turbo-expanders inside the cold box, and the air inside the gas holder
      slice('XCCCX', 'CT#TC', 'CCCCC', HOUSE_MIDDLE),
      slice('XCCCX', 'C###C', 'CCCCC', HOUSE_INNER),
      // front: the controller in the cold box's front wall, row 1
      frontSlice()
    ],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(CASING),
        Pat.part('energy_input', HR.parts.energy_input),
        Pat.part('input_bus', HR.parts.input_bus),
        Pat.part('output_bus', HR.parts.output_bus),
        Pat.part('input_hatch', HR.parts.input_hatch),
        Pat.part('output_hatch', HR.parts.output_hatch),
        G.parallelHatch.part()
      ),
      C: Pat.block(CASING),
      T: Pat.block(EXPANDER),
      H: Pat.block(HOUSE),
      G: Pat.block(COMPRESSOR),
      L: Pat.block(HOLDER),
      '#': Pat.air()
    }
  }
  HR.spec = SPEC

  // the plants that take a parallel hatch (lib/parallel_hatch.js keeps the list for the smoke test and the dump)
  if (G.parallelHatch && Array.isArray(G.parallelHatch.machines) && G.parallelHatch.machines.indexOf(MACHINE) < 0) {
    G.parallelHatch.machines.push(MACHINE)
  }

  // ---------------------------------------------------------------- the liquid helium in the hatches

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

  // mB of the charge fluid (liquid helium) in the input hatches (ME hatches report what they hold)
  function chargeIn(machine) {
    var c = lazy()
    var total = 0
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.FluidCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (stack === null || stack === undefined || typeof stack.isEmpty !== 'function' || stack.isEmpty()) continue
        if (String(c.Registries.FLUIDS.getKey(stack.getFluid())) === CONFIG.charge.id) total += Number(stack.getAmount())
      }
    }
    return total
  }
  HR.chargeIn = chargeIn

  var displayFailed = false

  // one controller line: the liquid helium held, and whether a run can start (the charge and one make-up)
  function display(controller, list) {
    try {
      if (!controller.isFormed()) return
      var held = chargeIn(controller)
      var needed = CONFIG.charge.amount + CONFIG.makeUp.amount
      var key = held >= needed ? CHARGE_KEY + '.ok' : CHARGE_KEY + '.low'
      list.add(Text.translate(key, String(held), String(CONFIG.charge.amount), String(CONFIG.makeUp.amount)))
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error(LOG + 'helium refrigerator controller display failed: ' + e)
      }
    }
  }
  HR.display = display

  // One EMI line per recipe: the loop's loss against the freezer's
  function loopInfo(data) {
    try {
      if (String(data.getString(DATA_KEY)) === '') return ''
      return String(Text.translate('gtceu.recipe.' + DATA_KEY, String(CONFIG.makeUp.amount), String(CONFIG.charge.amount)).getString())
    } catch (e) {
      return ''
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(HR.maxIO.itemsIn, HR.maxIO.itemsOut, HR.maxIO.fluidsIn, HR.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.COOLING)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(loopInfo)

    Pat.register(MACHINE, SPEC)

    event.create('helium_refrigerator', 'multiblock')
      .langValue('Helium Refrigerator')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      // a parallel hatch's copies, then GTM's default overclock (without a hatch, the overclock alone)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(GTBlocks.CASING_ALUMINIUM_FROSTPROOF)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .additionalDisplay(display)
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.helium_refrigerator.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.closed_loop_cooling')),
        Text.translate('gtceu.multiblock.parallelizable.tooltip')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/helium_refrigerator')
  })
})()
