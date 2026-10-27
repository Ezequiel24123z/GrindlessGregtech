// priority: -8300
// -----------------------------------------------------------------------------------------------
// UHV's power devices and photovoltaics (docs/eras/uhv.md, machines 7 and 8, lines 10 and 21; package UHV-A5): the SiC device fab and
// the solar array fab, their recipe types, and the package's own items. The recipes come from data/grindless/tables/power_devices.json
// (server_scripts/grindless/uhv/power_devices.js), which also holds two GTM side rows (the SiC boule cut into wafers, the cerium
// coverglass). The MOCVD reactor's two UHV rows (IMM epi wafer, NbN-coated SiC plate) are in server_scripts/grindless/uv/photonics.js.
//
//   gtceu:sic_device_fab         silicon carbide switches kilovolts at 200 °C (Cree/Wolfspeed): a boule grown by physical vapour
//                                transport at 2,500 °C, an epitaxial drift layer, ZPM's ion implanter's aluminium and a 1,700 °C
//                                anneal, then sintered power modules. Heatproof casing round an epi chamber (tungstensteel pipe).
//   gtceu:silicon_carbide        its recipe type (EU in). Circuit 1: boule. 2: epi wafer. 3: anneal. 4: four power modules.
//                                5: a reaction-bonded mirror blank (Herschel's SiC mirror). The only maker of the SiC power module and
//                                the SiC mirror blank.
//   gtceu:solar_array_fab        inverted metamorphic multijunction cells (NREL; GaInP/GaAs/InGaAs, 33 % at AM0) lifted off their
//                                GaAs substrate and laminated under cerium-doped coverglass (Rocket Lab/SolAero): a clean room with a
//                                lamination press (gearboxes) under filter casings.
//   gtceu:space_photovoltaics    its recipe type (EU in). Circuit 1: lift-off of eight IMM wafers (seven substrates back, the worn one as
//                                gallium arsenide dust). 2: the IMM array. 3: the red-tuned array (an InGaAs-rich junction added).
//
// New ids (the F1 ones are in uhv/foundation.js and are not registered again: sic_power_module, sic_mirror_blank,
// nbn_coated_sic_plate, imm_solar_array, red_tuned_solar_array; A4 registered sic_epi_wafer and implanted_sic_wafer):
//   items sic_boule (fab c1), sic_wafer (GTM cutter), sic_device_wafer (fab c3), imm_epi_wafer (MOCVD c7), imm_film (array fab c1),
//         cerium_coverglass (GTM alloy smelter)
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top): both machines are 7 wide x 5 high x 7 deep.
// Textures: tools/assets/Build-UHVPowerDevicesTextures.ps1. Names: client_scripts/grindless/uhv_power_devices_lang.js.
// Published for the recipe script: global.grindless.uhvPowerDevices.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const PD = G.uhvPowerDevices || (G.uhvPowerDevices = {})
  const LOG = '[grindless/uhv] '

  const HEATPROOF = 'gtceu:heatproof_machine_casing'
  const HEATPROOF_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'
  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const TUNGSTEN_PIPE = 'gtceu:tungstensteel_pipe_casing'
  const PRESS = 'gtceu:stainless_steel_gearbox'
  const FILTER = 'gtceu:filter_casing'

  PD.table = 'kubejs/data/grindless/tables/power_devices.json'
  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  PD.items = {
    sic_boule: { stack: 16 },
    sic_wafer: { stack: 64 },
    sic_device_wafer: { stack: 64 },
    imm_epi_wafer: { stack: 64 },
    imm_film: { stack: 64 },
    cerium_coverglass: { stack: 64 }
  }
  PD.ids = {
    sicBoule: 'grindless:sic_boule',
    sicWafer: 'grindless:sic_wafer',
    sicDeviceWafer: 'grindless:sic_device_wafer',
    immEpiWafer: 'grindless:imm_epi_wafer',
    immFilm: 'grindless:imm_film',
    ceriumCoverglass: 'grindless:cerium_coverglass'
  }

  PD.machines = {
    fab: {
      name: 'sic_device_fab',
      machine: 'gtceu:sic_device_fab',
      type: 'silicon_carbide',
      dataKey: 'grindless_silicon_carbide',
      lang: 'SiC Device Fab',
      // items in: up to three (the module: device wafer, copper foil, silver) and the circuit; out: the product;
      // fluids in: silane, propane and hydrogen (the epi), or the argon charge; out: the hydrogen
      maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 3, fluidsOut: 1 },
      width: 7, height: 5, depth: 7
    },
    arrays: {
      name: 'solar_array_fab',
      machine: 'gtceu:solar_array_fab',
      type: 'space_photovoltaics',
      dataKey: 'grindless_space_photovoltaics',
      lang: 'Solar Array Fab',
      // items in: films, coverglass, module, the red junction and the circuit; out: film, substrates and the worn substrate's dust;
      // fluid in: hydrofluoric acid or the silicone adhesive; out: the arsine off the release layer
      maxIO: { itemsIn: 5, itemsOut: 3, fluidsIn: 1, fluidsOut: 1 },
      width: 7, height: 5, depth: 7
    }
  }

  // A hollow shell: row 0 (X) takes the parts, the top row and the walls are casing (F), S is the controller (front wall, row 1, middle).
  function shell(m, inner) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var ch
          var isWall = si === 0 || si === last || c === 0 || c === m.width - 1
          if (r === 0) ch = 'X'
          else if (r === m.height - 1) ch = 'F'
          else if (si === last && r === 1 && c === mid) ch = 'S'
          else if (isWall) ch = 'F'
          else ch = inner(r, si, c)
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // the epi chamber (T): a 3 x 3 x 2 block of tungstensteel pipe at the back; the PVT furnace space in front of it
  function fabInner(r, si, c) {
    if (si >= 1 && si <= 2 && c >= 2 && c <= 4) return 'T'
    return '#'
  }

  // filter casings under the ceiling; the lamination press (B) on the floor in the middle
  function arraysInner(r, si, c) {
    if (r === 3) return 'P'
    if (r === 1 && si >= 2 && si <= 4 && c >= 2 && c <= 4) return 'B'
    return '#'
  }

  function specOf(m, casing, inner, parts) {
    return {
      slices: shell(m, inner),
      symbols: {
        S: Pat.controller(),
        X: Pat.oneOf.apply(null, [Pat.block(casing)].concat(parts)),
        F: Pat.block(casing),
        T: Pat.block(TUNGSTEN_PIPE),
        B: Pat.block(PRESS),
        P: Pat.block(FILTER),
        '#': Pat.air()
      }
    }
  }
  PD.machines.fab.spec = specOf(PD.machines.fab, HEATPROOF, fabInner, [
    Pat.part('input_bus', { min: 1, max: 3 }),
    Pat.part('input_hatch', { min: 1, max: 3 }),
    Pat.part('output_bus', { min: 1, max: 1 }),
    Pat.part('output_hatch', { min: 1, max: 1 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])
  PD.machines.arrays.spec = specOf(PD.machines.arrays, CLEAN, arraysInner, [
    Pat.part('input_bus', { min: 1, max: 3 }),
    Pat.part('input_hatch', { min: 1, max: 1 }),
    Pat.part('output_bus', { min: 1, max: 3 }),
    Pat.part('output_hatch', { min: 1, max: 1 }),
    Pat.part('energy_input', { min: 1, max: 2 })
  ])

  // one EMI line per recipe, read from its data: what the circuit does
  function infoOf(dataKey) {
    return function (data) {
      try {
        var name = String(data.getString(dataKey))
        if (name === '') return ''
        return String(Text.translate('gtceu.recipe.' + dataKey + '.' + name).getString())
      } catch (e) {
        return ''
      }
    }
  }

  // ---------------------------------------------------------------- items

  StartupEvents.registry('item', function (event) {
    Object.keys(PD.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(PD.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var fab = PD.machines.fab
    event.create(fab.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(fab.maxIO.itemsIn, fab.maxIO.itemsOut, fab.maxIO.fluidsIn, fab.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
    var arrays = PD.machines.arrays
    event.create(arrays.type)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(arrays.maxIO.itemsIn, arrays.maxIO.itemsOut, arrays.maxIO.fluidsIn, arrays.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ASSEMBLER)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var fab = PD.machines.fab
    var arrays = PD.machines.arrays
    var fabType = GTRecipeTypes.get(fab.type)
    var arraysType = GTRecipeTypes.get(arrays.type)
    if (fabType == null) throw new Error(LOG + 'recipe type gtceu:' + fab.type + ' is not registered')
    if (arraysType == null) throw new Error(LOG + 'recipe type gtceu:' + arrays.type + ' is not registered')
    fabType.addDataInfo(infoOf(fab.dataKey))
    arraysType.addDataInfo(infoOf(arrays.dataKey))
    Pat.register(fab.machine, fab.spec)
    Pat.register(arrays.machine, arrays.spec)

    event.create(fab.name, 'multiblock')
      .langValue(fab.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(fab.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(HEATPROOF) })
      .pattern(function (def) { return Pat.build(def, fab.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.sic_device_fab.tooltip.0'),
        Text.translate('grindless.machine.sic_device_fab.tooltip.1'),
        Text.translate('grindless.machine.sic_device_fab.tooltip.2')
      ])
      .workableCasingModel(HEATPROOF_TEXTURE, 'grindless:block/multiblock/sic_device_fab')

    event.create(arrays.name, 'multiblock')
      .langValue(arrays.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(arrays.type)
      .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      .appearanceBlock(function () { return Block.getBlock(CLEAN) })
      .pattern(function (def) { return Pat.build(def, arrays.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.solar_array_fab.tooltip.0'),
        Text.translate('grindless.machine.solar_array_fab.tooltip.1'),
        Text.translate('grindless.machine.solar_array_fab.tooltip.2')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/solar_array_fab')
  })
})()
